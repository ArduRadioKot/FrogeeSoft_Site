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
  let menuTimer;
  const setMenu = (open, restoreFocus = false) => {
    if (!toggle || !menu) return;
    clearTimeout(menuTimer);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('menu-open', open);
    document.querySelectorAll('main, body > footer').forEach((element) => { element.inert = open; });
    menu.inert = !open;
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => {
        if (toggle.getAttribute('aria-expanded') === 'true') menu.classList.add('is-open');
      });
    } else {
      menu.classList.remove('is-open');
      menuTimer = setTimeout(() => {
        if (toggle.getAttribute('aria-expanded') !== 'true') menu.hidden = true;
      }, reduced ? 0 : 350);
      if (restoreFocus) toggle.focus();
    }
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (toggle?.getAttribute('aria-expanded') !== 'true') return;
    if (e.key === 'Escape') { setMenu(false, true); return; }
    if (e.key !== 'Tab') return;
    const controls = [...document.querySelectorAll('.site-header button, .site-header a[href], #mobile-menu a[href], #mobile-menu summary')].filter((element) => element.getClientRects().length && !element.closest('[inert]'));
    const first = controls[0], last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  });
  window.matchMedia('(min-width: 981px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });

  // Product dropdown supports keyboard, click and pointer interaction.
  const dropdown = document.querySelector('.nav-dropdown');
  if (dropdown) {
    const trigger = dropdown.querySelector('.nav-dropdown-toggle');
    const panel = dropdown.querySelector('.nav-dropdown-panel');
    const setDropdown = (open) => {
      trigger.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
      panel.inert = !open;
    };
    const close = () => setDropdown(false);
    trigger.addEventListener('click', () => {
      setDropdown(trigger.getAttribute('aria-expanded') !== 'true');
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setDropdown(true); panel.querySelector('a')?.focus(); }
    });
    dropdown.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setDropdown(true); });
    dropdown.addEventListener('pointerleave', () => { if (!dropdown.contains(document.activeElement)) close(); });
    dropdown.addEventListener('focusout', (e) => { if (!dropdown.contains(e.relatedTarget)) close(); });
    document.addEventListener('click', (e) => { if (!dropdown.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') { close(); trigger.focus(); }
    });
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
  function wireDownloads() {
    if (!dl) return;
    const os = dl.detectOS();
    document.querySelectorAll('[data-program]').forEach((card) => {
      const btn = card.querySelector('[data-download]');
      if (!btn) return;
      const id = card.dataset.program;
      if (!dl.programs[id]) return;
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
  wireDownloads();
  dl?.ready.then(wireDownloads);

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
