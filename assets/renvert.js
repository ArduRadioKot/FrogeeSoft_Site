(() => {
  document.querySelectorAll('.hero-line').forEach((line) => {
    const settle = () => line.classList.add('is-settled');
    const span = line.firstElementChild;
    if (!span) return;
    span.addEventListener('animationend', settle);
    span.addEventListener('animationcancel', settle);
    if (getComputedStyle(span).animationName === 'none') settle();
  });

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

  // Already-visible blocks stay put. Entering blocks fade in, then release
  // the animation so hover transforms and list markers are not stuck.
  if (!('IntersectionObserver' in window) || !Element.prototype.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.hero-copy, .hero-image, .hero-meta, .section-intro > *, .source-choices, .rename-area, .steps li, .gallery-layout, .format-list li, .grammar, .faq-stack, .download-link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const opacityOnly = entry.target.matches('.steps li, .download-link');
      const animation = entry.target.animate(opacityOnly
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
      const release = () => animation.cancel();
      animation.onfinish = release;
      animation.oncancel = release;
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  const viewBottom = window.innerHeight * 0.92;
  targets.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < viewBottom && rect.bottom > 0) return;
    observer.observe(element);
  });
})();
