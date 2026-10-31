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

  // Content is visible by default. Motion enhances it only when supported.
  if (!('IntersectionObserver' in window) || !Element.prototype.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.hero-copy, .hero-image, .hero-meta, .section-intro > *, .source-choices, .rename-area, .steps li, .gallery-layout, .format-list li, .grammar, .faq-stack, .download-link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      entry.target.animate([
        { opacity: 0, transform: 'translateY(22px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 650, delay: Number(entry.target.dataset.motionDelay || 0), easing: 'cubic-bezier(.2,.7,.2,1)' });
    });
  }, { threshold: .12 });
  targets.forEach((element, index) => {
    element.dataset.motionDelay = String((index % 3) * 70);
    observer.observe(element);
  });
})();
