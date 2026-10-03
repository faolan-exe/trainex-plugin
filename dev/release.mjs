// Baut die öffentliche Version nach dist/ und packt sie: ohne Snapshot-Recorder und Background-Script.
// Aufruf: npm run release   Ergebnis: web-ext-artifacts/trainex_redesign-<version>-public.zip
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DEV_ONLY = ['src/recorder.js', 'src/background.js'];

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
delete manifest.background;
for (const cs of manifest.content_scripts) cs.js = cs.js?.filter((f) => !DEV_ONLY.includes(f));

fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'src'), path.join(DIST, 'src'), { recursive: true });
fs.cpSync(path.join(ROOT, 'icons'), path.join(DIST, 'icons'), { recursive: true });
for (const f of DEV_ONLY) fs.rmSync(path.join(DIST, f));
fs.writeFileSync(path.join(DIST, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const webExt = path.join(ROOT, 'node_modules', '.bin', 'web-ext');
execFileSync(webExt, ['lint', '--source-dir', DIST], { stdio: 'inherit' });
const name = `trainex_redesign-${manifest.version}-public.zip`;
execFileSync(webExt, ['build', '--source-dir', DIST, '--overwrite-dest', '--filename', name], { stdio: 'inherit' });
