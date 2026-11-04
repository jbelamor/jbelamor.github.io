const MIN_CARD_WIDTH = 300;

async function initHome() {
  const grid = document.getElementById('grid');

  let projects;
  try {
    projects = await loadAllProjects();
  } catch (err) {
    grid.innerHTML = `<p class="load-error">No se pudieron cargar los proyectos: ${err.message}</p>`;
    return;
  }

  grid.innerHTML = projects.map((p) => `
    <a class="project-card" data-category="${p.categories.join(' ')}" href="project.html?slug=${encodeURIComponent(p.slug)}">
      <div class="polaroid">
        <div class="polaroid-photo">
          <img src="${p.cover}" alt="${p.title}">
        </div>
        <div class="project-meta">
          <span class="project-name">${p.title}</span>
          <span class="project-year">${p.year}</span>
        </div>
      </div>
    </a>
  `).join('');

  setupColumns(grid, projects.length);
  setupFilter();
}

function setupColumns(grid, totalItems) {
  function update() {
    const width = grid.clientWidth || window.innerWidth;
    const maxFit = Math.max(1, Math.floor(width / MIN_CARD_WIDTH));
    const cols = Math.max(1, Math.min(totalItems, maxFit));
    grid.style.setProperty('--cols', cols);
  }

  update();
  window.addEventListener('resize', update);
}

function setupFilter() {
  const categoryButtons = document.querySelectorAll('.category');
  const clearBtn = document.getElementById('clearFilter');
  const cards = document.querySelectorAll('.project-card');
  let activeCategory = null;

  function applyFilter(category) {
    cards.forEach((card) => {
      const cats = card.dataset.category.split(' ');
      const matches = !category || cats.includes(category);
      card.classList.toggle('is-hidden', !matches);
    });

    categoryButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    clearBtn.hidden = !category;
  }

  const validCategories = Array.from(categoryButtons, (btn) => btn.dataset.category);

  function categoryFromHash() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    return validCategories.includes(hash) ? hash : null;
  }

  function setCategory(category) {
    activeCategory = category;
    applyFilter(category);

    // Refleja la categoría en la URL (#hacker, #visual-artist...) sin añadir entradas al historial
    const url = window.location.pathname + window.location.search + (category ? `#${category}` : '');
    history.replaceState(null, '', url);
  }

  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      setCategory(activeCategory === category ? null : category);
    });
  });

  clearBtn.addEventListener('click', () => setCategory(null));

  // Si alguien cambia el hash a mano o pega otro enlace en la misma pestaña
  window.addEventListener('hashchange', () => {
    activeCategory = categoryFromHash();
    applyFilter(activeCategory);
  });

  // Filtro inicial a partir del enlace compartido
  activeCategory = categoryFromHash();
  applyFilter(activeCategory);
}

initHome();
