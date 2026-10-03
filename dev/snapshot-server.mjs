// Nimmt Snapshots vom Recorder der Extension entgegen und schreibt sie nach snapshots/.
// Start: npm run snapshots
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const PORT = 8787;
const DIR = path.join(import.meta.dirname, '..', 'snapshots');

// Session-Tokens aus URLs und Links entfernen, damit Snapshots keinen gültigen Login enthalten.
const TOKEN_RE = /\b(TokCF19|IDphp17|sec18m|CFID|CFTOKEN|jsessionid)=[^&"'\s#<>]*/gi;
const scrub = (s) => s.replace(TOKEN_RE, '$1=X');

fs.mkdirSync(DIR, { recursive: true });

http
  .createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    if (req.method !== 'POST' || req.url !== '/snapshot') {
      res.writeHead(req.method === 'OPTIONS' ? 204 : 404).end();
      return;
    }

    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { name, url, title, frame, html } = JSON.parse(body);
        if (/\btxr-(shell|start|hidden|theme)\b/.test(html)) {
          console.warn(`abgelehnt (schon umgebaut): ${name}`);
          res.writeHead(409).end();
          return;
        }
        const file = `${String(name).replace(/[^a-z0-9_-]/gi, '-') || 'unbenannt'}.html`;
        const meta = `<!-- txr-snapshot ${JSON.stringify({ url: scrub(url), title, frame, saved: new Date().toISOString() })} -->\n`;
        fs.writeFileSync(path.join(DIR, file), meta + scrub(html));
        console.log(`${frame ? 'frame' : 'top  '}  ${file}`);
        res.writeHead(204).end();
      } catch (err) {
        console.error(err);
        res.writeHead(400).end();
      }
    });
  })
  .listen(PORT, '127.0.0.1', () => console.log(`Snapshot-Server: http://localhost:${PORT} → ${DIR}`));
