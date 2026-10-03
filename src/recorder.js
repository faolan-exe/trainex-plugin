// Entwicklermodus: speichert das DOM jeder besuchten Seite, bevor ein Seitenmodul es verändert.
// Der Background prüft, ob die Extension unverpackt geladen ist, und reicht den Snapshot an
// den lokalen Server (npm run snapshots) weiter. In einer installierten Version passiert nichts.
// Klassen und data-Attribute der Extension (early.js) nur aus dem verschickten HTML entfernen.
// Am DOM bleiben sie, ein Entfernen und Neusetzen würde das Layout kurz springen lassen.
function stripOwnMarkup(html) {
  return html.replace(/^<html\b[^>]*>/i, (tag) =>
    tag
      .replace(/\s+data-txr[\w-]*="[^"]*"/g, '')
      .replace(/\s+class="([^"]*)"/, (m, cls) => {
        const rest = cls.split(/\s+/).filter((c) => c && !c.startsWith('txr-'));
        return rest.length ? ` class="${rest.join(' ')}"` : '';
      }),
  );
}

TXR.record = function () {
  const params = TXR.location.searchParams;
  // Verzeichnis + Datei, damit z. B. nl_archiv/index.cfm nicht mit anderen index.cfm kollidiert.
  const parts = [TXR.pageId(), params.get('area'), params.get('subarea')];
  const name = parts.filter(Boolean).join('__').toLowerCase().replace(/[^a-z0-9_-]+/g, '-');

  const doctype = document.doctype ? '<!DOCTYPE html>\n' : '';
  TXR.api.runtime
    .sendMessage({
      type: 'snapshot',
      name,
      url: location.href,
      frame: window.top !== window.self,
      title: document.title,
      html: doctype + stripOwnMarkup(document.documentElement.outerHTML),
    })
    .catch(() => {});
};
