// Shared light/dark theme for every FrogeeSoft page. Dark by default, the choice is remembered.
(() => {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('fs-theme'); } catch (e) {}
  root.dataset.theme = saved === 'light' ? 'light' : 'dark';

  const label = () => {
    const text = root.dataset.theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему';
    return window.FROGEE_I18N?.t(text) || text;
  };
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('frogee:languagechange', () => {
      document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.setAttribute('aria-label', label()));
    });
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-label', label());
      btn.addEventListener('click', () => {
        root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
        try { localStorage.setItem('fs-theme', root.dataset.theme); } catch (e) {}
        document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-label', label()));
      });
    });
  });
})();
