(() => {
  const gallery = document.querySelector('.gallery-layout');
  if (gallery) {
    const tablist = gallery.querySelector('[role="tablist"]');
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
    function select(index, focus = false) {
      tabs.forEach((tab, current) => {
        const active = current === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[current].hidden = !active;
      });
      if (focus) tabs[index].focus();
    }
    tablist.hidden = false;
    gallery.classList.add('screens-enhanced');
    select(0);
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', (event) => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(next, true);
      });
    });
  }

  // Hero loop: the rename the page is about, one pair at a time.
  const flow = document.querySelector('.hero-flow');
  if (flow && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const pairs = [['heic', 'jpg'], ['docx', 'pdf'], ['wav', 'mp3'], ['mov', 'mp4'], ['xlsx', 'csv']];
    const fromExt = flow.querySelector('[data-flow-from-ext]');
    const toExt = flow.querySelector('[data-flow-to-ext]');
    let index = 0, landTimer;
    const showFrom = () => { fromExt.textContent = pairs[index][0]; };
    const showTo = () => { toExt.textContent = pairs[index][1]; };
    showFrom(); showTo();
    const sheet = flow.querySelector('.doc--to .doc-sheet');
    sheet.addEventListener('animationiteration', () => {
      index = (index + 1) % pairs.length;
      showFrom();
      clearTimeout(landTimer);
      landTimer = setTimeout(showTo, 3600 * 0.45);
    });
    setTimeout(() => flow.classList.add('is-looping'), 900);
  }

  // Blocks already on screen stay put. Blocks below the fold are hidden up
  // front and rise in once as they enter, part by part, so nothing flashes
  // from visible to transparent mid-scroll.
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.section-head > *, .mac-window, .tile, .table-card, .workflow-lead > *, .steps li, .gallery-layout, .faq-lead > *, .faq-stack details, .download-card');
  const release = (element) => {
    element.classList.remove('reveal-in');
    element.style.removeProperty('--reveal-delay');
  };
  const reveal = (element, order) => {
    element.style.setProperty('--reveal-delay', `${Math.min(order, 6) * 70}ms`);
    element.classList.add('reveal-in');
    element.classList.remove('reveal-wait');
    element.addEventListener('transitionend', (event) => { if (event.target === element) release(element); });
    setTimeout(() => release(element), 1400 + Math.min(order, 6) * 70);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .forEach((element, order) => { observer.unobserve(element); reveal(element, order); });
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  const viewBottom = window.innerHeight;
  targets.forEach((element) => {
    if (element.getBoundingClientRect().top < viewBottom) return;
    element.classList.add('reveal-wait');
    observer.observe(element);
  });
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.reveal-wait').forEach((element) => element.classList.remove('reveal-wait'));
  });
})();
