// Release files of FrogeeSoft programs, taken from their GitHub releases.
window.FROGEE_DOWNLOADS = (() => {
  const t = (text, values) => window.FROGEE_I18N?.t(text, values) || text;
  const gh = (repo, tag, file) => `https://github.com/ArduRadioKot/${repo}/releases/download/${tag}/${file}`;

  const programs = {
    fgsnotes: {
      name: 'FgSNotes',
      version: '2.6.2',
      releases: 'https://github.com/ArduRadioKot/FgSNotes/releases/latest',
      files: [
        { os: 'mac-arm', label: 'macOS, Apple Silicon', file: 'FgSNotes-2.6.2-arm64.dmg', mb: 95.9, url: gh('FgSNotes', 'v2.6.2', 'FgSNotes-2.6.2-arm64.dmg') },
        { os: 'mac-intel', label: 'macOS, Intel', file: 'FgSNotes-2.6.2-x64.dmg', mb: 103.1, url: gh('FgSNotes', 'v2.6.2', 'FgSNotes-2.6.2-x64.dmg') },
        { os: 'windows', label: 'Windows, установщик', file: 'FgSNotes-Setup-2.6.2.exe', mb: 144.6, url: gh('FgSNotes', 'v2.6.2', 'FgSNotes-Setup-2.6.2.exe') },
        { os: 'windows-portable', label: 'Windows, portable', file: 'FgSNotes-Portable-2.6.2.exe', mb: 144.5, url: gh('FgSNotes', 'v2.6.2', 'FgSNotes-Portable-2.6.2.exe') },
        { os: 'linux', label: 'Linux, AppImage', file: 'FgSNotes-2.6.2.AppImage', mb: 106.1, url: gh('FgSNotes', 'v2.6.2', 'FgSNotes-2.6.2.AppImage') },
        { os: 'linux-tar', label: 'Linux, архив', file: 'fgsnotes-2.6.2.tar.gz', mb: 100.3, url: gh('FgSNotes', 'v2.6.2', 'fgsnotes-2.6.2.tar.gz') },
      ],
    },
    renvert: {
      name: 'Renvert',
      releases: 'https://github.com/ArduRadioKot/RenVert/releases/latest',
      files: [
        { os: 'mac', label: 'macOS 14+, Apple Silicon и Intel', file: 'Renvert-1.0.0.dmg', mb: 18.7, url: gh('RenVert', 'v1.0', 'Renvert-1.0.0.dmg') },
      ],
    },
    frogeecode: {
      name: 'FrogeeCodeIDE',
      releases: 'https://github.com/ArduRadioKot/ForgeeCodeIDE',
      files: [
        { os: 'source', label: 'Исходный код, zip', file: 'ForgeeCodeIDE-main.zip', mb: null, url: 'https://github.com/ArduRadioKot/ForgeeCodeIDE/archive/refs/heads/main.zip' },
      ],
    },
    logic: {
      name: 'Logic Circuit Simulator',
      releases: 'https://github.com/ArduRadioKot/LogicCircuitSimulator/releases/latest',
      files: [
        { os: 'mac', label: 'macOS, приложение в zip', file: 'macos-build.zip', mb: 22.0, url: gh('LogicCircuitSimulator', 'stable', 'macos-build.zip') },
      ],
    },
  };

  function detectOS() {
    const ua = navigator.userAgent || '';
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    if (/iPhone|iPad|Android/i.test(ua)) return 'mobile';
    if (/Win/i.test(platform) || /Windows/i.test(ua)) return 'windows';
    if (/Mac/i.test(platform) || /Mac OS X/i.test(ua)) {
      // Safari and Chrome both report "Intel" on Apple Silicon, so default to arm64 on modern Macs.
      try {
        const gl = document.createElement('canvas').getContext('webgl');
        const info = gl && gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '';
        if (/Intel/i.test(renderer)) return 'mac-intel';
      } catch (e) {}
      return 'mac-arm';
    }
    if (/Linux|X11/i.test(platform + ua)) return 'linux';
    return 'unknown';
  }

  const osNames = { 'mac-arm': 'macOS', 'mac-intel': 'macOS', windows: 'Windows', linux: 'Linux' };

  // The best file for this visitor, or null when the program has no build for their system.
  function pick(id, os = detectOS()) {
    const p = programs[id];
    if (!p) return null;
    const exact = p.files.find((f) => f.os === os);
    if (exact) return exact;
    if (os.startsWith('mac')) return p.files.find((f) => f.os.startsWith('mac')) || p.files.find((f) => f.os === 'source') || null;
    if (os === 'linux') return p.files.find((f) => f.os.startsWith('linux')) || p.files.find((f) => f.os === 'source') || null;
    return p.files.find((f) => f.os === 'source') || null;
  }

  const size = (mb) => (mb ? `${mb.toLocaleString(window.FROGEE_I18N?.locale || 'ru-RU', { maximumFractionDigits: 1 })} ${t('МБ')}` : '');
  const label = (file) => t(file.label);

  // Fills a container with one link per release file; the visitor's own file is marked.
  function renderList(id, container) {
    const p = programs[id];
    const mine = pick(id);
    container.textContent = '';
    p.files.forEach((f) => {
      const a = document.createElement('a');
      a.className = 'dl' + (mine === f ? ' is-yours' : '');
      a.href = f.url;
      [['dl-label', label(f)], ['dl-file', f.file], ['dl-size', size(f.mb)]].forEach(([cls, text]) => {
        const span = document.createElement('span');
        span.className = cls;
        span.textContent = text;
        a.append(span);
      });
      container.append(a);
    });
  }

  // Points a button at the visitor's file and returns that file (or null).
  function wireButton(id, btn, { prefix = 'Скачать' } = {}) {
    const f = pick(id);
    if (f) {
      btn.href = f.url;
      btn.textContent = f.os === 'source' ? t('Скачать исходники') : prefix === 'Скачать' ? t('Скачать для {system}', { system: osNames[detectOS()] || label(f) }) : `${t(prefix)} ${osNames[detectOS()] || label(f)}`;
    } else {
      btn.href = programs[id].releases;
      btn.textContent = t('Все версии на GitHub');
    }
    return f;
  }

  function updateVersionLabels() {
    document.querySelectorAll('[data-release-version="fgsnotes"]').forEach((label) => {
      label.textContent = programs.fgsnotes.version;
    });
  }

  function parseNotesRelease(release) {
    if (!release || release.draft || release.prerelease || !/^v?\d+\.\d+\.\d+$/.test(release.tag_name) || !Array.isArray(release.assets)) return null;
    const prefix = 'https://github.com/ArduRadioKot/FgSNotes/releases/download/';
    const matchers = [
      ['mac-arm', 'macOS, Apple Silicon', /-arm64\.dmg$/i],
      ['mac-intel', 'macOS, Intel', /-(?:x64|x86_64)\.dmg$/i],
      ['windows', 'Windows, установщик', /setup.*\.exe$/i],
      ['windows-portable', 'Windows, portable', /portable.*\.exe$/i],
      ['linux', 'Linux, AppImage', /\.AppImage$/i],
      ['linux-tar', 'Linux, архив', /\.tar\.gz$/i],
    ];
    const files = matchers.flatMap(([os, label, pattern]) => {
      const asset = release.assets.find((a) => a && typeof a.name === 'string' && pattern.test(a.name) && typeof a.browser_download_url === 'string' && a.browser_download_url.startsWith(prefix) && Number.isFinite(a.size) && a.size > 0);
      return asset ? [{ os, label, file: asset.name, mb: asset.size / 1000000, url: asset.browser_download_url }] : [];
    });
    return files.length ? { version: release.tag_name.replace(/^v/, ''), files } : null;
  }

  function isCurrentOrNewer(release) {
    if (!release) return false;
    const current = programs.fgsnotes.version.split('.').map(Number);
    const parts = release.version.split('.').map(Number);
    const difference = parts.map((part, index) => part - current[index]).find((part) => part !== 0) || 0;
    return difference >= 0;
  }

  async function refreshNotesRelease() {
    const cacheKey = 'frogeesoft-fgsnotes-release-v1';
    let cached;
    try {
      cached = JSON.parse(localStorage.getItem(cacheKey));
      const parsed = parseNotesRelease(cached?.release);
      if (isCurrentOrNewer(parsed)) Object.assign(programs.fgsnotes, parsed);
      else cached = null;
    } catch { cached = null; }
    updateVersionLabels();
    const age = Date.now() - cached?.checkedAt;
    if (cached && age >= 0 && age < 60 * 60 * 1000) return programs.fgsnotes;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('https://api.github.com/repos/ArduRadioKot/FgSNotes/releases/latest', {
        headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal,
      });
      if (!response.ok) throw new Error('GitHub Releases unavailable');
      const release = await response.json();
      const parsed = parseNotesRelease(release);
      if (!isCurrentOrNewer(parsed)) throw new Error('No newer supported release');
      Object.assign(programs.fgsnotes, parsed);
      updateVersionLabels();
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ checkedAt: Date.now(), release: {
          tag_name: release.tag_name, assets: release.assets.map(({ name, size, browser_download_url }) => ({ name, size, browser_download_url })),
        } }));
      } catch { /* Downloads also work when storage is unavailable. */ }
    } catch { /* Keep the cached or checked-in release when GitHub cannot be reached. */ }
    finally { clearTimeout(timeout); }
    return programs.fgsnotes;
  }

  const ready = refreshNotesRelease();
  return { programs, detectOS, pick, size, label, osNames, renderList, wireButton, ready };
})();
