import fs from 'node:fs';
import path from 'node:path';

// Absolute Pfade: Ohne Schrägstrich hält web-ext den Wert für einen Profil-Namen.
const profile = (name) => path.join(import.meta.dirname, name);

// profileCreateIfMissing gilt nur für Firefox, chrome-launcher braucht ein existierendes Verzeichnis.
fs.mkdirSync(profile('.chrome-profile'), { recursive: true });

export default {
  // Ordner immer mit /**: Ein nackter Ordnername ignoriert nur den Ordner selbst, nicht seinen Inhalt.
  // Sonst lädt web-ext run die Extension bei jedem Snapshot und jedem Profil-Schreibzugriff neu,
  // und Firefox entfernt dabei kurz das CSS aus allen Tabs (sichtbares Blitzen).
  ignoreFiles: [
    'snapshots',
    'snapshots/**',
    'dev',
    'dev/**',
    '.preview',
    'dist',
    'dist/**',
    '.preview/**',
    '.firefox-profile/**',
    '.chrome-profile/**',
    'README.md',
    'package.json',
    'package-lock.json',
    'web-ext-config.mjs',
  ],  run: {
    startUrl: ['https://www.trainex36.de/ba-rm-trainex/'],
    // Eigenes Profil im Projekt, damit der Login zwischen Starts erhalten bleibt.
    firefoxProfile: profile('.firefox-profile'),
    chromiumProfile: profile('.chrome-profile'),
    profileCreateIfMissing: true,
    keepProfileChanges: true,
  },
};
