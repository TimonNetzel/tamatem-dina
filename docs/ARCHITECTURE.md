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
| dist/channels.js | Physisches Kanalmodell, Vierteldrehungen und berechneter Wasserlauf |
| dist/state.js | Zustandsübergänge, Fortschrittsbedingungen, Spielstandvalidierung |
| dist/app.js | Darstellung, Klickaktionen, Dialoge, Speichern, Import/Export |
| dist/sw.js | Offline-Cache, Navigation ohne Netz, Vollständigkeitsmeldung |
| dist/manifest.webmanifest | Installierbare Web-App |
| dist/assets | Tatsächlich verwendete Illustrationen und Symbol |
| server.mjs | Lokale Vorschau, nur auf 127.0.0.1:4173 |
| make-offline.mjs | Verbindet Bilder, Stil und Spielcode zu einer HTML-Datei |

Die Offline-Datei wird aus dem Quellstand neu erzeugt. Änderungen an ihrer Kopie werden nicht zurück in das Projekt übernommen.

## Spielzustände

Aktuelle Abschnitte: intro → research → illness → resolve → pack → threshold → river → river-crossing → river-complete → garden → garden-complete → chamber → return → apparatus → dina/finale → healing → level-complete. Dina und Tamatem wechseln während der letzten Prüfung die Perspektive; level-complete ist der Abschluss von Level 1.

state.js definiert VERSION=4. Der lokale Speicherschlüssel bleibt tamatem-dina-prolog-v1; die Dateisicherung behält die Kennung tamatem-dina-prolog. validateState akzeptiert Versionen 1–4. Das Version-1-Ende complete wird zu river migriert. Version-2-Spielstände bleiben an ihrem bisherigen Abschnitt; für Versionen 1/2 wird ein frischer Gartenzustand ergänzt. Version 3 behält auch den Garten vollständig. Für alle Altversionen werden ausschließlich die neuen Blüten-, Rückweg- und Finalzustände ergänzt. Frühere Abschnitte, Inventar und Entscheidungen bleiben erhalten. Unbekannte Versionen und unmögliche Fortschritte werden abgelehnt. Ein altes garden-complete bietet die Handlung zum Betreten der Kammer.

river speichert Untersuchung, Prüfung der Gegenseite, Auswahl der Stoffschlinge, Verbindung zur Halteschlaufe, Sicherung an der Öse und das aktuelle Überquerungspanel. Die Schlinge bleibt als mitgenommener Gegenstand dokumentiert, ist nach Sicherung jedoch am Stamm gebunden und nicht nochmals verwendbar.

## Sprache

Die Auswahl de, en oder ar-EG liegt separat unter tamatem-dina-language. Ein Sprachwechsel verändert den Spielstand nicht und benötigt kein Netz. Deutsche Quelltexte stehen in data.js und als t-Aufrufe in app.js; beide Übersetzungen in messages.js. Neue sichtbare Texte, Alternativtexte und Fehlermeldungen ergänzen. Stabile Kennungen und Figurenidentitäten nicht übersetzen; Anzeige von Namen separat lokalisieren.

html.lang und html.dir sowie die Oberfläche werden beim Wechsel aktualisiert. Bilder, Bildobjektkoordinaten und Rätselgeometrie werden nicht gespiegelt. Die Anwendung verwendet lokale Systemschriften, keine extern geladenen Schriften.

## Bilder

characters.png: Figurenblatt als Porträtreferenz; workroom.png: Arbeitstisch; illness.png: Dinas Zimmer; threshold.png: Waldrand mit Oris; river.png: Fluss, Stamm, Schlaufe, Öse und Oris; garden-dry.png und garden-wet.png: derselbe Garten vor/nach der Bewässerung; chamber.png: lebende Blüte und erloschenes Blatt; morning.png: gemeinsame Erholung am Morgen. Neue Bilder werden im verfügbaren Bildwerkzeug anhand des Figurenblatts erstellt. Hinweise und Dialoge bleiben skalierbarer Text; notwendiger Inhalt wird nicht nur in eine Illustration eingebrannt.

## Offline und Veröffentlichungen

Alle benötigten Dateien stehen in der CORE-Liste von sw.js. Bei neuen Szenen die Liste ergänzen und bei geänderten Cache-Inhalten die Cache-Version aktualisieren. „Offline bereit“ darf erst nach vollständiger Prüfung aller Dateien erscheinen.

Die Browser-Anwendung lädt keine externen Schriftdateien. Bei künftigen Medien auch notwendige Töne lokal beilegen. npm test prüft Spielregeln, Migration, Übersetzungsvollständigkeit, simuliertes Cache-Verhalten und den Offline-Export. python tests/browser-smoke.py führt mit installiertem Python-Playwright und Chromium gegen den laufenden lokalen Server zusätzliche Browserdurchläufe aus. Es ist ein optionales Entwicklungswerkzeug, keine Laufzeitabhängigkeit des Spiels.

make-offline.mjs bettet neun Bilder und alle Sprachmodule ein. Die Module erhalten getrennte Bereiche, damit Import-Aliase und gleichnamige Variablen korrekt funktionieren. Die Web-App legt Bilder und beide Sprachmodule im Service-Worker-Cache ab. Bei geänderten Dateien die Cache-Version erhöhen.

## Quellgarten und Kanäle

garden speichert metGuardian, inspected, sechs rotations (Ganzzahlen 0–3), tested, solutionPreview und watered. Erst Gespräch und Untersuchung schalten die Drehung/Wasserprüfung frei. Drehen verwirft die vorherige Wasserprüfung. Ein Fehlschlag verbraucht nichts; der neue Teilweg wird aus den Stellungen berechnet. Erfolg setzt garden-complete und sperrt weitere Drehungen.

channels.js verwendet eine physisch unveränderte Matrix mit drei Spalten und zwei Reihen. Richtungen 0–3 sind oben, rechts, unten, links. Kanaltypen und Startstellungen entsprechen dem Episodenplan. traceChannels verfolgt den Weg vom linken Einlass der ersten Platte bis zum unteren Auslass der vierten. Nur ein durchgängiger Weg über alle sechs Platten gilt als gelöst. Gerade Platten haben zwei geometrisch gleiche Rotationsstellungen; diese werden beide akzeptiert. Die Quelle/Wurzelbecken-Markierungen, Fließrichtung und Unterbrechung sind auch in RTL dieselben.

Nach der dritten Hilfe kann der Nutzer eine getrennte Lösungsvorschau öffnen. Sie verändert die eigenen Stellungen nicht. Erst „Vorschau übernehmen“ setzt die Platten; danach muss das Wasser weiterhin ausdrücklich geprüft werden. Der Zustand und die Vorschau überstehen Speichern/Laden. Animationen haben keine spielmechanische Zeitbedingung und werden bei prefers-reduced-motion abgeschaltet.

## Blüte, Rückweg und Finale

bloom speichert identified, collected und das optionale guardianTalked. Sammeln setzt die Laterne an; Pflücken ist keine schädigende Zustandsaktion. journey.protected dokumentiert die richtige Sturmhandlung. Erst danach ist die Rückkehr zur Apparatur möglich.

finale speichert inserted, collected, bound, lanternOn, attempted, stable, dinaObservation (none/flicker/steady), dinaReported und dinaConfirmed. Vor bound bleibt die Laterne an. APP_CALM bei brennender Laterne führt zu Dinas Flackerbeobachtung; APP_CALM bei ausgeschalteter Laterne stabilisiert sofort. Anschließend bleibt in beiden Wegen eine eigene Prüfung des ruhigen Spiegelbilds nötig. Eine frühere flicker-Beobachtung reicht für die Bestätigung von steady nicht aus. HEAL setzt stable und dinaConfirmed voraus. MORNING führt zum gespeicherten Levelabschluss.

Die aktive Figur wird aus dem Abschnitt bestimmt: Dina im Prolog und im Abschnitt dina; Tamatem in den übrigen Spielszenen. Notizbuch, Hinweise und Darstellung verwenden diese gespeicherten Zustände. Die dritte Apparaturhilfe benennt den nächsten gültigen Schritt; bereits abgeschlossene Kammer-/Sturmaufgaben verweisen zum Übergang. Laternen-, Faden- und Spiegelanzeigen verwenden lokale HTML/SVG-Symbole und Text. Animationen sind rein visuell.

Die Zustandsraumprüfung in tests/finale.test.mjs prüft jeden erreichbaren Zustand ab dem Gartenabschluss für alle vier Kombinationen der frühen Entscheidungen: Speicherung/Validierung, Erhalt der Vergangenheit und Erreichbarkeit des Endes. Der Browser-Smoke-Test spielt das gesamte Level offline weiter, prüft Neuladen/Sprachwechsel in den neuen Szenen und importiert Spielstände der Versionen 1–4. Der Exporttest verwendet asynchronen Prozessaufruf und vm.Script für die Syntax des eingebetteten Skripts; damit ist kein synchroner Kindprozess für die Syntaxprüfung erforderlich.
