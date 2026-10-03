// Rendert alle Snapshots mit den Content-Scripts der Extension und macht Screenshots (headless Chrome).
// Aufruf: npm run preview [-- name-filter ...]
// Ergebnis: .preview/<snapshot>-<breite>.png und Übersichtsbögen .preview/_sheet<n>.png (je 9 Seiten)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.join(import.meta.dirname, '..');
const SNAPSHOTS = path.join(ROOT, 'snapshots');
const OUT = path.join(ROOT, '.preview');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SIZES = [
  [1280, 1600],
  [500, 1100], // schmalste Breite, die headless Chrome zulässt
];

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
const css = manifest.content_scripts.flatMap((c) => c.css ?? []);
const js = manifest.content_scripts.flatMap((c) => c.js ?? []);
const fileUrl = (p) => pathToFileURL(path.join(ROOT, p)).href;

const filters = process.argv.slice(2);
const chrome = (args) => execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', ...args], { stdio: 'ignore' });
const rendered = [];
const snapshots = fs
  .readdirSync(SNAPSHOTS)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !filters.length || filters.some((x) => f.includes(x)));

fs.mkdirSync(OUT, { recursive: true });

for (const file of snapshots) {
  let html = fs.readFileSync(path.join(SNAPSHOTS, file), 'utf8');
  const meta = JSON.parse(html.match(/<!-- txr-snapshot (.*?) -->/)?.[1] || '{}');
  if (!meta.url) {
    console.warn(`übersprungen (keine URL im Snapshot): ${file}`);
    continue;
  }

  html = html.replace(/(<html\b[^>]*?)\s+data-txr=""/i, '$1'); // ältere Snapshots enthalten den Router-Marker
  // Bilder und CSS der Seite live laden. iFrames leeren, die würden ohne Login auf der Anmeldeseite landen.
  html = html.replace(/(<iframe\b[^>]*?\ssrc=)("[^"]*"|'[^']*')/gi, '$1"about:blank"');
  const base = `<base href="${meta.url}">`;
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + base) : base + html;

  const inject = [
    `<script>window.TXR_PREVIEW_URL = ${JSON.stringify(meta.url)};`,
    `window.browser = { runtime: { sendMessage: () => Promise.resolve() } };</script>`,
    ...css.map((c) => `<link rel="stylesheet" href="${fileUrl(c)}">`),
    // Klassen kommen hier erst am Ende (statt via early.js): Transitions blieben im Screenshot sonst halb stehen.
    '<style>*, *::before, *::after { transition: none !important; }</style>',
    ...js.filter((s) => !s.endsWith('early.js')).map((s) => `<script src="${fileUrl(s)}"></script>`),
  ].join('\n');
  html += '\n' + inject;

  const name = file.replace(/\.html$/, '');
  const target = path.join(OUT, `${name}.html`);
  fs.writeFileSync(target, html);

  for (const [w, h] of SIZES) {
    const png = path.join(OUT, `${name}-${w}.png`);
    chrome(['--virtual-time-budget=4000', `--window-size=${w},${h}`, `--screenshot=${png}`, pathToFileURL(target).href]);
  }
  rendered.push(name);
  console.log(`${name}`);
}

for (const old of fs.readdirSync(OUT).filter((f) => f.startsWith('_sheet'))) fs.rmSync(path.join(OUT, old));
for (let i = 0; i * 9 < rendered.length; i++) {
  const cells = rendered
    .slice(i * 9, i * 9 + 9)
    .map((n) => `<figure><img src="${n}-${SIZES[0][0]}.png"><figcaption>${n}</figcaption></figure>`)
    .join('');
  const sheet = path.join(OUT, `_sheet${i}.html`);
  fs.writeFileSync(
    sheet,
    `<style>body{margin:0;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#333;font:14px sans-serif}
figure{margin:0;background:#fff}img{width:100%;height:560px;object-fit:cover;object-position:top;display:block}
figcaption{padding:3px;background:#000;color:#ff0}</style>${cells}`,
  );
  chrome(['--allow-file-access-from-files', '--window-size=1800,1800', `--screenshot=${sheet.replace(/html$/, 'png')}`, pathToFileURL(sheet).href]);
}
console.log(`→ ${OUT}`);
