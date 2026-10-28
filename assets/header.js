// Match the compact-on-scroll header on the resume site.
(() => {
  const header = document.querySelector('.resume-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  update();
  window.addEventListener('scroll', update, { passive: true });
})();
