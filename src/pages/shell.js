// Äußere TraiNex-Seite (Top-Navigation, linke Navigation, Content-iFrame).
// Das CSS ist komplett unter html.txr-shell gescoped und greift sonst nicht.
TXR.register({
  name: 'shell',
  match: () =>
    window.top === window.self &&
    !!document.getElementById('top-nav-container') &&
    !!document.getElementById('content-iframe'),
  run() {
    document.documentElement.classList.add('txr-shell');

    // Unterpunkte laden nur den iFrame neu, .active bliebe sonst am alten Eintrag.
    const leftNav = document.getElementById('left-nav-container');
    leftNav?.addEventListener('click', (event) => {
      const item = event.target.closest('a.item');
      if (!item) return;
      leftNav.querySelectorAll('a.item.active').forEach((el) => el.classList.remove('active'));
      item.classList.add('active');
    });
  },
});
