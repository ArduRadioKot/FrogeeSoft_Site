// Shared light/dark theme for every FrogeeSoft page. Dark by default, the choice is remembered.
(() => {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('fs-theme'); } catch (e) {}
  root.dataset.theme = saved === 'light' ? 'light' : 'dark';

  const label = () => (root.dataset.theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему');
  document.addEventListener('DOMContentLoaded', () => {
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
