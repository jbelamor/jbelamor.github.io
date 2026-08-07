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

  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      activeCategory = activeCategory === category ? null : category;
      applyFilter(activeCategory);
    });
  });

  clearBtn.addEventListener('click', () => {
    activeCategory = null;
    applyFilter(null);
  });
}

initHome();
