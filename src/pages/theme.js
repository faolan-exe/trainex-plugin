// Globales Theme für alle Unterseiten. Nur CSS, das Markup bleibt unverändert.
// Die äußere Seite hat mit shell.css ein eigenes Design.
TXR.register({
  name: 'theme',
  match: () => !document.getElementById('top-nav-container'),
  run() {
    document.documentElement.classList.add('txr-theme');
    document.documentElement.dataset.txrPage = TXR.pageId();
  },
});
