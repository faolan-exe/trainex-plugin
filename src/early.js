// Läuft bei document_start, bevor die Seite gezeichnet wird. Setzt die Theme-Klassen anhand der URL
// sofort, damit das Original-Design nicht kurz aufblitzt. Der Router bestätigt sie später am DOM.
(() => {
  'use strict';
  const root = document.documentElement;
  if ('txr' in root.dataset) return; // Neuinjektion in einen schon bearbeiteten Tab

  root.dataset.txrPage = location.pathname.split('/').slice(-2).join('-').replace(/\.cfm$/i, '').toLowerCase();
  if (window.top !== window.self) root.classList.add('txr-theme');
  else if (location.pathname.includes('/navigation/')) root.classList.add('txr-shell');

  // Startseite bis zum Umbau ausblenden. Fallback, falls start.js nicht durchläuft.
  if (location.pathname.endsWith('/aktuell22.cfm')) {
    root.classList.add('txr-pending');
    setTimeout(() => root.classList.remove('txr-pending'), 3000);
  }
})();
