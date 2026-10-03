// Gemeinsamer Namespace. Alle Content-Scripts aus manifest.json laufen in derselben
// isolierten Welt und teilen sich globalThis, daher reicht ein globales Objekt.
globalThis.TXR = {
  api: globalThis.browser ?? globalThis.chrome,
  pages: [],
  // Die Vorschau (dev/preview.mjs) setzt TXR_PREVIEW_URL, weil Snapshots als file:// laufen.
  location: new URL(globalThis.TXR_PREVIEW_URL || location.href),

  // Seitenmodul anmelden: { name, match: () => boolean, run: () => void }
  register(page) {
    this.pages.push(page);
  },

  clean(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  },

  h(tag, props = {}, children = []) {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
  },

  // Seiten-ID aus Verzeichnis + Datei, z. B. "nl_archiv-index". Für Snapshot-Namen und
  // seitenspezifisches CSS (html[data-txr-page="…"]). Gleiche Logik in early.js.
  pageId() {
    return this.location.pathname.split('/').slice(-2).join('-').replace(/\.cfm$/i, '').toLowerCase();
  },

  // Dateiname der aktuellen Seite, z. B. "aktuell22.cfm".
  file() {
    return this.location.pathname.split('/').pop();
  },
};
