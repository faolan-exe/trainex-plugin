# TraiNex Redesign

Browser-Extension (Firefox + Chrome, Manifest V3), die TraiNex neu gestaltet: Navigation, Startseite als Karten-Layout und ein einheitliches Theme für alle Unterseiten.

## Aufbau

Zwei Content-Script-Einträge laufen auf allen TraiNex-Seiten und Frames und teilen sich den Namespace `TXR`:

- `src/early.js` (document_start): setzt die Design-Klassen anhand der URL, bevor die Seite gezeichnet wird. Mit ihm werden alle CSS-Dateien geladen.
- `src/tokens.css`: Design-Tokens (`--txr-…`: Farben, Radien, Schrift) für alle Module.
- `src/core.js`: `TXR` mit Helfern (`h`, `clean`, `file`, `pageId`) und `TXR.register()` für Seitenmodule.
- `src/recorder.js`: Entwicklermodus, schickt das Original-DOM jeder Seite als Snapshot an den lokalen Server.
- `src/pages/*.js|css`: ein Modul pro Seite, `{ name, match, run }`:
  - `theme`: globales Theme für alle Unterseiten, überschreibt nur das gemeinsame Basis-CSS von TraiNex (Markup bleibt unverändert).
  - `shell`: äußere Seite mit Top- und linker Navigation.
  - `start`: Startseite (`aktuell22.cfm`) als Karten-Layout. Die Inhalte werden verschoben, nicht kopiert, damit die Scripts der Seite weiter funktionieren.
  - `laufwerk.css`: reines Seiten-CSS, gescoped über `html[data-txr-page="nl_archiv-index"]`.
- `src/router.js` (document_end): nimmt den Snapshot auf, führt alle passenden Module aus und bestätigt die Klassen aus `early.js`.
- `src/background.js`: leitet Snapshots an `localhost:8787` weiter, nur bei unverpackt geladener Extension.

Neues Seitenmodul: Datei in `src/pages/` anlegen und in `manifest.json` vor `src/router.js` eintragen. Für reines Seiten-CSS reicht `html.txr-theme[data-txr-page="<verzeichnis>-<datei>"]`.

## Entwicklung

```bash
npm install
npm start            # Firefox mit eigenem Profil in .firefox-profile (Login bleibt erhalten)
npm run start:chrome # Chrome mit eigenem Profil in .chrome-profile
npm run snapshots    # Snapshot-Server, schreibt jede besuchte Seite nach snapshots/
npm run preview      # rendert alle Snapshots mit der Extension, Screenshots in .preview/
npm run lint
npm run build        # Paket in web-ext-artifacts/
```

`web-ext run` lädt die Extension bei jeder Änderung in `src/` oder `manifest.json` neu. Alle anderen Ordner stehen in `web-ext-config.mjs` unter `ignoreFiles`, immer mit `/**`. Ein nackter Ordnername ignoriert nur den Ordner, nicht seinen Inhalt, und dann löst jeder Snapshot ein Neuladen aus (sichtbares Blitzen).

Snapshots enthalten persönliche Daten. Session-Tokens ersetzt der Server durch `X`, trotzdem bleiben `snapshots/` und `.preview/` außerhalb von Git und Extension-Paket.

## Installieren

`npm run build` erzeugt `web-ext-artifacts/trainex_redesign-<version>.zip`.

**Chrome / Edge / Brave:** `chrome://extensions` → Entwicklermodus an → „Entpackte Erweiterung laden“ → den Projektordner (oder die entpackte Zip) wählen. Bleibt dauerhaft installiert.

**Firefox (dauerhaft):** Firefox installiert nur signierte Extensions dauerhaft. Signieren geht kostenlos über Mozilla, ohne Veröffentlichung im Store:

1. API-Schlüssel anlegen: https://addons.mozilla.org/developers/addon/api/key/
2. `npx web-ext sign --channel=unlisted --api-key=<JWT issuer> --api-secret=<JWT secret>`
3. Die signierte `.xpi` aus `web-ext-artifacts/` in Firefox öffnen bzw. auf `about:addons` ziehen.

Vor jedem neuen Signieren die `version` in `manifest.json` erhöhen, Mozilla signiert jede Version nur einmal.

**Firefox (zum Testen):** `about:debugging#/runtime/this-firefox` → „Temporäres Add-on laden“ → `manifest.json` wählen. Bleibt nur bis zum Neustart.

**Firefox Developer Edition / Nightly (ohne Signatur):** `about:config` → `xpinstall.signatures.required` auf `false`, dann die Zip in `.xpi` umbenennen und installieren.

## Öffentliche Version (addons.mozilla.org)

`npm run release` baut nach `dist/` eine Variante ohne Snapshot-Recorder und Background-Script und packt sie als `web-ext-artifacts/trainex_redesign-<version>-public.zip`. Diese Datei wird im Developer Hub als neue Version „Auf dieser Website“ (listed) hochgeladen. Texte für den Eintrag stehen in `dev/amo-listing.md`.
