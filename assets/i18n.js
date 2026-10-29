(() => {
  const root = document.documentElement;
  const dictionary = window.FROGEE_TRANSLATIONS || {};
  const supported = new Set(['ru', 'en']);
  const normalize = (value) => String(value).replace(/\s+/g, ' ').trim();
  let saved;
  try { saved = localStorage.getItem('frogeesoft-language'); } catch {}
  const requested = new URL(location.href).searchParams.get('lang');
  let language = supported.has(requested) ? requested : supported.has(saved) ? saved : 'ru';
  const textState = new WeakMap();
  const attributeState = new WeakMap();
  const linkState = new WeakMap();
  const attributes = ['alt', 'title', 'aria-label', 'placeholder', 'content'];
  const ignored = 'script, style, noscript, textarea, [contenteditable], [data-i18n-ignore]';

  function t(source, values = {}) {
    const key = normalize(source);
    const entry = dictionary[key];
    let result = entry ? entry[language] : String(source);
    if (entry) result = (String(source).match(/^\s*/)?.[0] || '') + result + (String(source).match(/\s*$/)?.[0] || '');
    return result.replace(/\{(\w+)\}/g, (match, name) => Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match);
  }

  function translateText(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest(ignored)) return;
    const state = textState.get(node);
    const original = state && node.nodeValue === state.rendered ? state.original : node.nodeValue;
    const key = parent.getAttribute('data-i18n-key') || normalize(original);
    if (!dictionary[key]) return;
    const translated = parent.hasAttribute('data-i18n-key') ? t(key) : t(original);
    textState.set(node, { original, rendered: translated });
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  function translateAttributes(element) {
    if (element.closest(ignored)) return;
    const state = attributeState.get(element) || {};
    for (const name of attributes) {
      if (!element.hasAttribute(name)) continue;
      const current = element.getAttribute(name);
      const record = state[name];
      const original = record && current === record.rendered ? record.original : current;
      if (!dictionary[normalize(original)]) continue;
      const translated = t(original);
      state[name] = { original, rendered: translated };
      if (current !== translated) element.setAttribute(name, translated);
    }
    attributeState.set(element, state);
  }

  function translateLink(anchor) {
    const current = anchor.getAttribute('href');
    if (!current || current.startsWith('#') || anchor.hasAttribute('download')) return;
    const state = linkState.get(anchor);
    const original = state && current === state.rendered ? state.original : current;
    let url;
    try { url = new URL(original, document.baseURI); } catch { return; }
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
    url.searchParams.set('lang', language);
    const rendered = url.href;
    linkState.set(anchor, { original, rendered });
    if (current !== rendered) anchor.setAttribute('href', rendered);
  }

  function translateTree(scope) {
    if (scope.nodeType === Node.TEXT_NODE) { translateText(scope); return; }
    if (scope.nodeType !== Node.ELEMENT_NODE && scope.nodeType !== Node.DOCUMENT_NODE) return;
    const elements = scope.nodeType === Node.ELEMENT_NODE ? [scope, ...scope.querySelectorAll('*')] : [...scope.querySelectorAll('*')];
    for (const element of elements) {
      translateAttributes(element);
      if (element.matches('a[href]')) translateLink(element);
    }
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) translateText(walker.currentNode);
  }

  function updateControls() {
    document.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
  }

  function rememberLanguage() {
    root.lang = language;
    try { localStorage.setItem('frogeesoft-language', language); } catch {}
    try {
      const url = new URL(location.href);
      url.searchParams.set('lang', language);
      history.replaceState(history.state, '', url);
    } catch {}
  }

  function setLanguage(next) {
    if (!supported.has(next)) return;
    language = next;
    rememberLanguage();
    translateTree(document);
    updateControls();
    window.dispatchEvent(new CustomEvent('frogee:languagechange', { detail: { language } }));
  }

  window.FROGEE_I18N = {
    get language() { return language; },
    get locale() { return language === 'en' ? 'en-US' : 'ru-RU'; },
    t, setLanguage,
  };
  rememberLanguage();
  if (language === 'en') {
    root.classList.add('i18n-pending');
    setTimeout(() => root.classList.remove('i18n-pending'), 1500);
  }

  document.addEventListener('DOMContentLoaded', () => {
    translateTree(document);
    updateControls();
    root.classList.remove('i18n-pending');
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData') translateText(record.target);
        else if (record.type === 'attributes') translateAttributes(record.target);
        else for (const node of record.addedNodes) translateTree(node);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: attributes });
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-language]');
      if (button) setLanguage(button.dataset.language);
    });
    window.addEventListener('storage', (event) => {
      if (event.key === 'frogeesoft-language' && supported.has(event.newValue) && event.newValue !== language) setLanguage(event.newValue);
    });
    window.addEventListener('popstate', () => {
      const next = new URL(location.href).searchParams.get('lang');
      if (supported.has(next)) setLanguage(next);
    });
  });
})();
