// Startseite (aktuell22.cfm, läuft im content-iframe).
// 1. Kacheln (.box) auslesen und als Objekte loggen.
// 2. Eigenes Layout rendern. Die Inhalte der Kacheln werden verschoben, nicht kopiert,
//    damit Event-Handler der Seite (Video, Popups, Formulare) weiter funktionieren.
(() => {
  'use strict';

  const ROOT_ID = 'txr-root';
  const { clean, h } = TXR;

  // Die Seite füllt #start_sr nur manchmal (z. B. "Guten Tag, Herr Auer."), sonst nach Tageszeit.
  function parseGreeting(doc) {
    const text = clean(doc.getElementById('start_sr')?.textContent);
    if (text) return text;
    const hour = new Date().getHours();
    return hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
  }

  function parseTiles(doc) {
    // Nur äußerste Kacheln, verschachtelte .box gehören zum Inhalt ihrer Eltern-Kachel.
    // Leere .box-Elemente (Platzhalter der Seite) fallen weg.
    const boxes = [...doc.querySelectorAll('.box')].filter(
      (el) => !el.parentElement.closest('.box') && (clean(el.textContent) || el.querySelector('img, video, iframe')),
    );
    return boxes.map((el, index) => {
      const heading = el.querySelector(':scope > h3, :scope > h4');
      return {
        index,
        kind: [...el.classList].find((c) => c !== 'box') || 'box',
        title: clean(heading?.textContent),
        column: el.closest('.col2') ? 'side' : 'main',
        important: !!el.querySelector('img[src*="wichtig"]'),
        links: [...el.querySelectorAll('a[href]')].map((a) => ({ text: clean(a.textContent), href: a.href })),
        preview: clean(el.textContent).slice(0, 160),
        el,
        heading,
        body: el.querySelector(':scope > .inner'),
      };
    });
  }

  function renderCard(tile) {
    const head = h('header', { className: 'txr-card-head' }, [h('h2', { textContent: tile.title || tile.kind })]);
    if (tile.important) head.append(h('span', { className: 'txr-badge', textContent: 'Wichtig' }));

    const body = h('div', { className: 'txr-card-body' });
    const source = tile.body || tile.el;
    for (const child of [...source.childNodes]) {
      if (child !== tile.heading) body.append(child);
    }

    const card = h('article', { className: 'txr-card' }, [head, body]);
    card.dataset.kind = tile.kind;
    if (tile.important) card.dataset.important = '';
    return card;
  }

  function render(greeting, tiles) {
    const date = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const hero = h('header', { className: 'txr-hero' }, [
      h('h1', { textContent: greeting }),
      h('p', { textContent: date }),
    ]);

    const main = h('div', { className: 'txr-col txr-col-main' });
    const side = h('div', { className: 'txr-col txr-col-side' });
    for (const tile of tiles) (tile.column === 'side' ? side : main).append(renderCard(tile));

    const layout = h('div', { className: 'txr-layout' }, [main]);
    if (side.childElementCount) layout.append(side);
    else layout.classList.add('txr-layout-single');

    return h('div', { id: ROOT_ID }, [hero, layout]);
  }

  TXR.register({
    name: 'start',
    match: () => TXR.file() === 'aktuell22.cfm' && !document.getElementById(ROOT_ID),
    run() {
      const greeting = parseGreeting(document);
      const tiles = parseTiles(document);

      console.groupCollapsed(`[TraiNex Redesign] ${tiles.length} Kacheln`);
      console.table(tiles.map(({ index, kind, title, column, important, preview }) => ({ index, kind, title, column, important, preview })));
      console.log({ greeting, tiles });
      console.groupEnd();

      if (!tiles.length) return;

      // Alles, was jetzt im body steht, ausblenden. Später von der Seite angehängte
      // Elemente (Dialoge, Overlays) bleiben dadurch sichtbar.
      const root = render(greeting, tiles);
      for (const child of document.body.children) {
        if (!['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName)) child.classList.add('txr-hidden');
      }
      document.body.prepend(root);
      document.documentElement.classList.add('txr-start');
    },
  });
})();
