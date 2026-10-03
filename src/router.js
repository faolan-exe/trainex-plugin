// Wird als letztes Content-Script geladen: erst Snapshot, dann passende Seitenmodule ausführen.
(() => {
  'use strict';
  // Firefox injiziert beim Neuladen der Extension erneut in offene Tabs: nur einmal pro Dokument laufen,
  // sonst würde der Snapshot das schon umgebaute DOM aufnehmen.
  const root = document.documentElement;
  if ('txr' in root.dataset) return;

  TXR.record?.(); // vor dem Marker, damit er nicht im Snapshot landet. Fehlt im Release-Build.
  root.dataset.txr = '';

  const matched = new Set();
  for (const page of TXR.pages) {
    if (!page.match()) continue;
    matched.add(page.name);
    try {
      page.run();
    } catch (err) {
      console.error(`[TraiNex Redesign] Modul "${page.name}" fehlgeschlagen`, err);
    }
  }

  // early.js setzt Klassen vorab nach URL. Was das DOM nicht bestätigt, wieder entfernen.
  // Nie entfernen und neu setzen: Jeder Zwischenzustand kann gerendert werden und springt sichtbar.
  if (!matched.has('shell')) root.classList.remove('txr-shell');
  if (!matched.has('theme')) {
    root.classList.remove('txr-theme');
    delete root.dataset.txrPage;
  }
  root.classList.remove('txr-pending');
})();
