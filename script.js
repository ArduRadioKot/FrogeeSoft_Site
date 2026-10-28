(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Current section highlighted in the menu
  const navLinks = [...document.querySelectorAll('.header-pill a[href^="#"]')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${e.target.id}`)));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('menu-open', open);
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); }
    else { menu.classList.remove('is-open'); setTimeout(() => { menu.hidden = true; }, 350); }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false); });

  // Product dropdown supports keyboard, click and pointer interaction.
  const dropdown = document.querySelector('.nav-dropdown');
  if (dropdown) {
    const trigger = dropdown.querySelector('.nav-dropdown-toggle');
    const panel = dropdown.querySelector('.nav-dropdown-panel');
    const close = () => { trigger.setAttribute('aria-expanded', 'false'); panel.classList.remove('is-open'); };
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
    });
    dropdown.addEventListener('mouseleave', close);
    document.addEventListener('click', (e) => { if (!dropdown.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Download buttons pick the file for this visitor's system
  const dl = window.FROGEE_DOWNLOADS;
  if (dl) {
    const os = dl.detectOS();
    document.querySelectorAll('[data-program]').forEach((card) => {
      const btn = card.querySelector('[data-download]');
      if (!btn) return;
      const id = card.dataset.program;
      const file = dl.pick(id, os);
      if (file) {
        btn.href = file.url;
        if (file.os === 'source') btn.textContent = 'Скачать исходники';
        else {
          btn.textContent = 'Скачать ';
          const note = document.createElement('small');
          note.textContent = dl.size(file.mb);
          btn.append(note);
          btn.title = `${file.file} - ${file.label}`;
        }
      } else {
        const sys = dl.osNames[os];
        btn.href = dl.programs[id].releases;
        btn.textContent = sys ? `Нет сборки для ${sys}` : 'Все версии ↗';
        btn.classList.replace('button-primary', 'button-secondary');
      }
    });
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
