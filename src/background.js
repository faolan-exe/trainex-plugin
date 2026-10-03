// Leitet Snapshots an den lokalen Dev-Server weiter, aber nur bei unverpackt geladener
// Extension (web-ext run, about:debugging, chrome://extensions "Entpackt laden").
const api = globalThis.browser ?? globalThis.chrome;
const SNAPSHOT_SERVER = 'http://localhost:8787/snapshot';

api.runtime.onMessage.addListener((msg) => {
  if (msg?.type !== 'snapshot') return;
  api.management.getSelf().then((self) => {
    if (self.installType !== 'development') return;
    // text/plain vermeidet einen CORS-Preflight.
    fetch(SNAPSHOT_SERVER, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(msg) })
      .catch(() => {}); // Server läuft nicht: einfach nichts speichern.
  });
});
