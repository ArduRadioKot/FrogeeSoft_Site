// Release files of FrogeeSoft programs, taken from their GitHub releases.
window.FROGEE_DOWNLOADS = (() => {
  const gh = (repo, tag, file) => `https://github.com/ArduRadioKot/${repo}/releases/download/${tag}/${file}`;

  const programs = {
    fgsnotes: {
      name: 'FgSNotes',
      releases: 'https://github.com/ArduRadioKot/FgSNotes/releases/latest',
      files: [
        { os: 'mac-arm', label: 'macOS, Apple Silicon', file: 'FgSNotes-2.5.5-arm64.dmg', mb: 95.8, url: gh('FgSNotes', 'v2.5.5', 'FgSNotes-2.5.5-arm64.dmg') },
        { os: 'mac-intel', label: 'macOS, Intel', file: 'FgSNotes-2.5.5-x64.dmg', mb: 103.1, url: gh('FgSNotes', 'v2.5.5', 'FgSNotes-2.5.5-x64.dmg') },
        { os: 'windows', label: 'Windows', file: 'FgSNotes-Setup-2.5.5.exe', mb: 144.6, url: gh('FgSNotes', 'v2.5.5', 'FgSNotes-Setup-2.5.5.exe') },
        { os: 'linux', label: 'Linux, AppImage', file: 'FgSNotes-2.5.5.AppImage', mb: 106.1, url: gh('FgSNotes', 'v2.5.5', 'FgSNotes-2.5.5.AppImage') },
        { os: 'linux-tar', label: 'Linux, архив', file: 'fgsnotes-2.5.5.tar.gz', mb: 100.3, url: gh('FgSNotes', 'v2.5.5', 'fgsnotes-2.5.5.tar.gz') },
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
    fllama: {
      name: 'Fllama',
      releases: 'https://github.com/ArduRadioKot/Fllama/releases/latest',
      files: [
        { os: 'mac-arm', label: 'macOS, Apple Silicon', file: 'Fllama-1.0.0-arm64.dmg', mb: 111.3, url: gh('Fllama', 'v1.0.0', 'Fllama-1.0.0-arm64.dmg') },
        { os: 'mac-intel', label: 'macOS, Intel', file: 'Fllama-1.0.0.dmg', mb: 115.1, url: gh('Fllama', 'v1.0.0', 'Fllama-1.0.0.dmg') },
        { os: 'windows', label: 'Windows', file: 'Fllama.Setup.1.0.0.exe', mb: 94.0, url: gh('Fllama', 'v1.0.0', 'Fllama.Setup.1.0.0.exe') },
        { os: 'linux', label: 'Linux, AppImage', file: 'Fllama-1.0.0.AppImage', mb: 117.3, url: gh('Fllama', 'v1.0.0', 'Fllama-1.0.0.AppImage') },
        { os: 'linux-deb', label: 'Linux, deb', file: 'Fllama_1.0.0_amd64.deb', mb: 80.9, url: gh('Fllama', 'v1.0.0', 'Fllama_1.0.0_amd64.deb') },
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

  const size = (mb) => (mb ? `${mb.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} МБ` : '');

  // Fills a container with one link per release file; the visitor's own file is marked.
  function renderList(id, container) {
    const p = programs[id];
    const mine = pick(id);
    container.textContent = '';
    p.files.forEach((f) => {
      const a = document.createElement('a');
      a.className = 'dl' + (mine === f ? ' is-yours' : '');
      a.href = f.url;
      [['dl-label', f.label], ['dl-file', f.file], ['dl-size', size(f.mb)]].forEach(([cls, text]) => {
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
      btn.textContent = f.os === 'source' ? 'Скачать исходники' : `${prefix} для ${osNames[detectOS()] || f.label}`;
    } else {
      btn.href = programs[id].releases;
      btn.textContent = 'Все версии на GitHub';
    }
    return f;
  }

  return { programs, detectOS, pick, size, osNames, renderList, wireButton };
})();
