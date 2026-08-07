const PROJECTS_BASE = 'projects/';

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar ${url} (${res.status})`);
  return res.text();
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const [, fm, body] = match;
  const data = {};
  fm.split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    data[key] = line.slice(idx + 1).trim();
  });
  return { data, body };
}

function splitSections(body) {
  const sections = {};
  body.split(/\n(?=##\s)/).forEach((part) => {
    const m = part.match(/^##\s+(.+)\n?/);
    if (!m) return;
    sections[m[1].trim().toLowerCase()] = part.slice(m[0].length).trim();
  });
  return sections;
}

function section(sections, ...names) {
  for (const name of names) {
    if (sections[name] !== undefined) return sections[name];
  }
  return '';
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInline(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g, (match, linkText, linkUrl, bareUrl) => {
      if (bareUrl) return `<a href="${bareUrl}" target="_blank" rel="noopener">${bareUrl}</a>`;
      return `<a href="${linkUrl}" target="_blank" rel="noopener">${linkText}</a>`;
    });
}

function renderParagraphs(text) {
  return (text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${renderInline(p)}</p>`)
    .join('\n');
}

function listItems(text) {
  return (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2).trim());
}

function renderList(text) {
  const items = listItems(text);
  if (!items.length) return '';
  return `<ul class="feature-list">${items.map((i) => `<li>${renderInline(i)}</li>`).join('')}</ul>`;
}

function renderSpecs(text) {
  const items = listItems(text);
  if (!items.length) return '';
  const rows = items.map((item) => {
    const idx = item.indexOf(':');
    const key = idx === -1 ? item : item.slice(0, idx).trim();
    const value = idx === -1 ? '' : item.slice(idx + 1).trim();
    return `<div class="spec-row"><dt>${renderInline(key)}</dt><dd>${renderInline(value)}</dd></div>`;
  });
  return `<dl class="specs">${rows.join('')}</dl>`;
}

function renderGallery(text, baseDir) {
  const items = [...(text || '').matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  if (!items.length) return '';
  return items.map(([, alt, src]) => {
    const url = baseDir + src;
    if (/\.(mp4|webm|mov)$/i.test(src)) {
      return `<div class="gallery-item gallery-item--video"><video src="${url}" muted playsinline preload="metadata"></video><span class="video-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></div>`;
    }
    return `<div class="gallery-item"><img src="${url}" alt="${escapeHtml(alt)}" loading="lazy"></div>`;
  }).join('\n');
}

async function loadManifest() {
  const raw = await fetchText(`${PROJECTS_BASE}manifest.json`);
  return JSON.parse(raw);
}

async function loadProject(slug) {
  const baseDir = `${PROJECTS_BASE}${slug}/`;
  const raw = await fetchText(`${baseDir}project.md`);
  const { data, body } = parseFrontmatter(raw);
  const sections = splitSections(body);

  return {
    slug,
    baseDir,
    title: data.title || slug,
    year: data.year || '',
    categories: (data.categories || '').split(',').map((c) => c.trim()).filter(Boolean),
    cover: data.cover ? baseDir + data.cover : '',
    description: section(sections, 'descripción', 'descripcion'),
    features: section(sections, 'características técnicas', 'caracteristicas tecnicas'),
    timeline: section(sections, 'timeline'),
    specs: section(sections, 'ficha técnica', 'ficha tecnica'),
    acknowledgements: section(sections, 'agradecimientos'),
    gallery: section(sections, 'galería', 'galeria'),
  };
}

async function loadAllProjects() {
  const slugs = await loadManifest();
  return Promise.all(slugs.map(loadProject));
}
