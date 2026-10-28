const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const themeButtons = document.querySelectorAll('.theme-toggle');
const themeMedia = matchMedia('(prefers-color-scheme: dark)');
const themeKey = 'processing-studio-theme';

function setTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#101719' : '#f2f3ef');
  themeButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    button.querySelector('.theme-toggle-label').textContent = dark ? 'Светлая тема' : 'Тёмная тема';
  });
}

setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
themeButtons.forEach(button => button.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  try { localStorage.setItem(themeKey, next); } catch {}
}));
themeMedia.addEventListener?.('change', event => {
  try { if (localStorage.getItem(themeKey)) return; } catch { return; }
  setTheme(event.matches ? 'dark' : 'light');
});

function closeMenu() {
  if (!menuButton || !mobileNav) return;
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
}

menuButton?.addEventListener('click', () => {
  const open = mobileNav.hidden;
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
mobileNav?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
window.addEventListener('resize', () => {
  if (innerWidth > 1100) closeMenu();
});
if (document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: .06 });
  document.querySelectorAll('.idea-main,.workflow,.device-copy,.device-screen,.android-heading,.android-screen,.android-output,.editor-head,.editor-index,.origin-body,.examples-copy,.examples-screen,.faq-section h2,.faq-list,.download-section').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}
