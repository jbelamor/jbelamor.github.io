// Modo día/noche. Se carga en el <head> para aplicar el tema antes de pintar la página.
(function () {
  const STORAGE_KEY = 'theme';
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  // Iconos en SVG (los caracteres ☀/☾ se pintan distinto, o como emoji, según el sistema)
  const ICONS = {
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>',
  };

  function storedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function currentTheme() {
    return storedTheme() || (systemDark.matches ? 'dark' : 'light');
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const btn = document.getElementById('themeToggle');
    if (btn) {
      const next = theme === 'dark' ? 'día' : 'noche';
      btn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
      btn.setAttribute('aria-label', `Cambiar a modo ${next}`);
      btn.title = `Modo ${next}`;
    }
  }

  applyTheme(currentTheme());

  // Si el visitante no ha elegido, seguir los cambios del sistema
  systemDark.addEventListener('change', () => {
    if (!storedTheme()) applyTheme(currentTheme());
  });

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.id = 'themeToggle';
    btn.type = 'button';
    document.body.appendChild(btn);
    applyTheme(root.dataset.theme);

    btn.addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        // Sin localStorage (modo privado estricto): cambia solo para esta visita
      }
      applyTheme(theme);
    });
  });
})();
