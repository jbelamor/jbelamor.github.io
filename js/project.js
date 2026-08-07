function getSlugFromQuery() {
  return new URLSearchParams(window.location.search).get('slug');
}

async function initProjectPage() {
  const root = document.getElementById('projectDetail');
  const slug = getSlugFromQuery();

  if (!slug) {
    root.innerHTML = '<p class="load-error">Proyecto no especificado.</p>';
    return;
  }

  let project;
  try {
    project = await loadProject(slug);
  } catch (err) {
    root.innerHTML = `<p class="load-error">No se pudo cargar el proyecto: ${err.message}</p>`;
    return;
  }

  document.title = `${project.title} — jbelamor`;

  const descriptionHtml = renderParagraphs(project.description);
  const featuresHtml = renderList(project.features);
  const timelineHtml = renderList(project.timeline);
  const specsHtml = renderSpecs(project.specs);
  const acknowledgementsHtml = renderList(project.acknowledgements);
  const galleryHtml = renderGallery(project.gallery, project.baseDir);

  root.innerHTML = `
    <div class="detail-cover">
      <img src="${project.cover}" alt="${project.title}">
    </div>
    <div class="detail-body">
      <div class="detail-heading">
        <h1>${project.title}</h1>
        <span class="detail-year">${project.year}</span>
      </div>
      ${descriptionHtml ? `<section class="detail-section"><h2>Descripción</h2><div class="prose">${descriptionHtml}</div></section>` : ''}
      ${featuresHtml ? `<section class="detail-section"><h2>Características técnicas</h2>${featuresHtml}</section>` : ''}
      ${timelineHtml ? `<section class="detail-section"><h2>Timeline</h2>${timelineHtml}</section>` : ''}
      ${specsHtml ? `<section class="detail-section"><h2>Ficha técnica</h2>${specsHtml}</section>` : ''}
      ${acknowledgementsHtml ? `<section class="detail-section"><h2>Agradecimientos</h2>${acknowledgementsHtml}</section>` : ''}
      ${galleryHtml ? '<h2 class="detail-gallery-heading">Galería</h2>' : ''}
    </div>
    ${galleryHtml ? `<div class="gallery-grid">${galleryHtml}</div>` : ''}
  `;

  setupLightbox(root);
}

function setupLightbox(root) {
  const galleryItems = root.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  const items = Array.from(galleryItems).map((el) => {
    const media = el.querySelector('img, video');
    const isVideo = media.tagName.toLowerCase() === 'video';
    return {
      isVideo,
      src: media.getAttribute('src'),
      alt: media.getAttribute('alt') || '',
    };
  });

  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightboxContent');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function render() {
    const item = items[currentIndex];
    content.innerHTML = item.isVideo
      ? `<video src="${item.src}" controls autoplay playsinline></video>`
      : `<img src="${item.src}" alt="${item.alt}">`;
    const hasMultiple = items.length > 1;
    prevBtn.hidden = !hasMultiple;
    nextBtn.hidden = !hasMultiple;
  }

  function open(index) {
    currentIndex = index;
    render();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    content.innerHTML = '';
  }

  function step(delta) {
    currentIndex = (currentIndex + delta + items.length) % items.length;
    render();
  }

  galleryItems.forEach((el, index) => {
    el.addEventListener('click', () => open(index));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

initProjectPage();
