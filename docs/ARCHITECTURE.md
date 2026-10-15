# Technischer Einstieg

## Anwendung

Die Dateien in dist sind direkt gepflegter Quellcode und zugleich die veröffentlichbare statische Anwendung. Es gibt derzeit keinen Bundler, kein Framework und keine npm-Laufzeitabhängigkeiten.

| Datei | Aufgabe |
|---|---|
| dist/index.html | Grundgerüst, Header, Dialogcontainer und Einstieg |
| dist/style.css | Farbige Comic-Oberfläche und responsive Ansichten |
| dist/data.js | Deutsche Ausgangstexte für Quellen, Dialoge, Gegenstände und Hinweise |
| dist/messages.js | Vollständiger englischer und ägyptisch-arabischer Textkatalog; deutsche Ausgangstexte als Schlüssel |
| dist/i18n.js | Sprachwahl, Textübersetzung und Lokalisierung der Spieldaten |
| dist/state.js | Zustandsübergänge, Fortschrittsbedingungen, Spielstandvalidierung |
| dist/app.js | Darstellung, Klickaktionen, Dialoge, Speichern, Import/Export |
| dist/sw.js | Offline-Cache, Navigation ohne Netz, Vollständigkeitsmeldung |
| dist/manifest.webmanifest | Installierbare Web-App |
| dist/assets | Tatsächlich verwendete Illustrationen und Symbol |
| server.mjs | Lokale Vorschau, nur auf 127.0.0.1:4173 |
| make-offline.mjs | Verbindet Bilder, Stil und Spielcode zu einer HTML-Datei |

Die Offline-Datei wird aus dem Quellstand neu erzeugt. Änderungen an ihrer Kopie werden nicht zurück in das Projekt übernommen.

## Spielzustände

Aktuelle Abschnitte: intro → research → illness → resolve → pack → threshold → river → river-crossing → river-complete. Der letzte Abschnitt ist der aktuelle Entwicklungsabschluss nach dem Fluss, nicht das Ende von Level 1.

state.js definiert VERSION=2. Der lokale Speicherschlüssel bleibt tamatem-dina-prolog-v1; die Dateisicherung behält die Kennung tamatem-dina-prolog. validateState akzeptiert Version 1 und migriert deren complete-Abschnitt zu river. Frühere Abschnitte, Inventar und Entscheidungen bleiben erhalten. Unbekannte Versionen und unmögliche Flusszustände werden abgelehnt.

river speichert Untersuchung, Prüfung der Gegenseite, Auswahl der Stoffschlinge, Verbindung zur Halteschlaufe, Sicherung an der Öse und das aktuelle Überquerungspanel. Die Schlinge bleibt als mitgenommener Gegenstand dokumentiert, ist nach Sicherung jedoch am Stamm gebunden und nicht nochmals verwendbar.

## Sprache

Die Auswahl de, en oder ar-EG liegt separat unter tamatem-dina-language. Ein Sprachwechsel verändert den Spielstand nicht und benötigt kein Netz. Deutsche Quelltexte stehen in data.js und als t-Aufrufe in app.js; beide Übersetzungen in messages.js. Neue sichtbare Texte, Alternativtexte und Fehlermeldungen ergänzen. Stabile Kennungen und Figurenidentitäten nicht übersetzen; Anzeige von Namen separat lokalisieren.

html.lang und html.dir sowie die Oberfläche werden beim Wechsel aktualisiert. Bilder, Bildobjektkoordinaten und Rätselgeometrie werden nicht gespiegelt. Die Anwendung verwendet lokale Systemschriften, keine extern geladenen Schriften.

## Bilder

characters.png: Figurenblatt als Porträtreferenz; workroom.png: Arbeitstisch; illness.png: Dinas Zimmer; threshold.png: Waldrand mit Oris; river.png: Fluss, Stamm, Schlaufe, Öse und Oris. Neue Bilder werden im verfügbaren Bildwerkzeug anhand des Figurenblatts erstellt. Hinweise und Dialoge bleiben skalierbarer Text; notwendiger Inhalt wird nicht nur in eine Illustration eingebrannt.

## Offline und Veröffentlichungen

Alle benötigten Dateien stehen in der CORE-Liste von sw.js. Bei neuen Szenen die Liste ergänzen und bei geänderten Cache-Inhalten die Cache-Version aktualisieren. „Offline bereit“ darf erst nach vollständiger Prüfung aller Dateien erscheinen.

Die Browser-Anwendung lädt keine externen Schriftdateien. Bei künftigen Medien auch notwendige Töne lokal beilegen. npm test prüft Spielregeln, Migration, Übersetzungsvollständigkeit, simuliertes Cache-Verhalten und den Offline-Export. python tests/browser-smoke.py führt mit installiertem Python-Playwright und Chromium gegen den laufenden lokalen Server zusätzliche Browserdurchläufe aus. Es ist ein optionales Entwicklungswerkzeug, keine Laufzeitabhängigkeit des Spiels.

make-offline.mjs bettet fünf Bilder und alle Sprachmodule ein. Die Module erhalten getrennte Bereiche, damit Import-Aliase und gleichnamige Variablen korrekt funktionieren. Die Web-App legt Bilder und beide Sprachmodule im Service-Worker-Cache ab. Bei geänderten Dateien die Cache-Version erhöhen.
