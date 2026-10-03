# AMO-Eintrag: Redesign für TraiNex

Texte zum Kopieren in den Developer Hub (addons.mozilla.org). Nicht Teil des Extension-Pakets.

## Name
Redesign für TraiNex

## Zusammenfassung (max. 250 Zeichen)
Modernes, aufgeräumtes Design für TraiNex der BA Rhein-Main: klare Navigation, Startseite als Karten-Layout, einheitliche Tabellen, Formulare und Buttons. Inoffiziell, nicht von Trainings-Online.

## Beschreibung
Redesign für TraiNex gibt dem Studierenden-Portal TraiNex der BA Rhein-Main ein modernes, ruhiges Design. Alle Funktionen bleiben unverändert, es ändert sich nur die Darstellung.

Was sich ändert:
• Navigation: flache Leiste mit Icons, aktive Bereiche deutlich markiert
• Startseite: Neuigkeiten, Termine und Infos als übersichtliche Karten
• Alle Unterseiten: einheitliche Schrift, ruhigere Tabellen, größere Eingabefelder und klare Buttons
• Laufwerk: Dateilisten mit bündigen Spalten
• Animierte Grafiken durch statische ersetzt

Funktioniert nur auf www.trainex36.de/ba-rm-trainex/. Andere TraiNex-Instanzen werden nicht verändert.

Datenschutz: Die Erweiterung sammelt und überträgt keine Daten. Sie ändert ausschließlich die Darstellung der Seiten im Browser.

Hinweis: Dies ist ein inoffizielles Projekt von Studierenden und steht in keiner Verbindung zu Trainings-Online oder der BA Rhein-Main. TraiNex ist ein Produkt der Trainings-Online GmbH.

## Kategorie
Darstellung (Appearance)

## Lizenz
Nach Wahl, z. B. MIT

## Datenschutzerklärung
Nicht nötig, solange keine Daten gesammelt werden. Im Manifest steht `data_collection_permissions: none`.

## Hinweise für die Prüfung (Notes to Reviewer)
Content scripts only, no background script, no remote code, no network requests. The extension restyles one site (www.trainex36.de/ba-rm-trainex/*) via CSS and reorganises the start page DOM (moves existing nodes into a card layout, no innerHTML, no external resources). Source is not minified or bundled; the uploaded package is the source.

## Screenshots
Selbst aufnehmen und vorher prüfen: keine Namen, Fotos, Noten oder Adressen von dir oder anderen Personen. Gut geeignet sind die Navigation und leere Seiten (z. B. Mailausgang, Notizen, Passwort ändern) oder Bereiche mit verpixelten Namen.
