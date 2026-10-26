// Category filter for the shop grid.
(() => {
  const buttons = document.querySelectorAll('.shop-filter button');
  const items = document.querySelectorAll('.shop-grid .item');
  const empty = document.querySelector('.shop-empty');
  buttons.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    let shown = 0;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    items.forEach((item) => {
      const on = f === 'all' || item.dataset.kind.split(' ').includes(f);
      item.hidden = !on;
      if (on) shown += 1;
    });
    empty.hidden = shown > 0;
  }));
})();
