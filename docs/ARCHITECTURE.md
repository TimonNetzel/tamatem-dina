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
| dist/case-state.js | Level-2-Zustand, Fortschrittsbedingungen und Validierung |
| dist/case-copy.js | Level-2-Texte als vollständige de/en/ar-EG-Tripel |
| dist/case-ui.js | Level-2-Szenen, Dokumente, Notizbuch und Hilfen |
| dist/eco-state.js | Level-3-Zustand, Eingriffsvoraussetzungen und Validierung |
| dist/eco-copy.js | Level-3-Katalog mit vollständigen de/en/ar-EG-Tripeln |
| dist/eco-ui.js | Level-3-Szenen, Quellen, Notizen und Hilfen |
| dist/morning-state.js | Level-4-Zustand, Quellen-, Zeit- und Publikationsprüfung |
| dist/morning-copy.js | Vollständiger Level-4-Katalog de/en/ar-EG |
| dist/morning-ui.js | Zwölf Level-4-Ansichten, Belege, Ergebnisnotizen und Hilfen |
| dist/app.js | Darstellung, Klickaktionen, Dialoge, Speichern, Import/Export |
| dist/sw.js | Offline-Cache, Navigation ohne Netz, Vollständigkeitsmeldung |
| dist/manifest.webmanifest | Installierbare Web-App |
| dist/assets | Tatsächlich verwendete Illustrationen und Symbol |
| server.mjs | Lokale Vorschau, nur auf 127.0.0.1:4173 |
| make-offline.mjs | Verbindet Bilder, Stil und Spielcode zu einer HTML-Datei |

Die Offline-Datei wird aus dem Quellstand neu erzeugt. Änderungen an ihrer Kopie werden nicht zurück in das Projekt übernommen.

## Spielzustände

Aktuelle Abschnitte: intro → research → illness → resolve → pack → threshold → river → river-crossing → river-complete → garden → garden-complete → chamber → return → apparatus → dina/finale → healing → level-complete. Dina und Tamatem wechseln während der letzten Prüfung die Perspektive; level-complete ist der Abschluss von Level 1 und bietet den optionalen Einstieg in Level 2. Danach: case-opening → case-records → case-interviews → case-timeline → case-response → case-editor → case-print → case-complete.

state.js definiert VERSION=7. Der lokale Speicherschlüssel bleibt tamatem-dina-prolog-v1; die Dateisicherung behält die Kennung tamatem-dina-prolog. validateState akzeptiert Versionen 1–7. Das Version-1-Ende complete wird zu river migriert. Version-2-Spielstände bleiben an ihrem bisherigen Abschnitt; für Versionen 1/2 wird ein frischer Gartenzustand ergänzt. Version 3 behält auch den Garten vollständig. Für Versionen 1–3 werden Blüten-, Rückweg- und Finalzustände ergänzt. Versionen 1–4 erhalten zusätzlich einen leeren Fallzustand case. Version 4 darf nur die ursprünglichen 18 Level-1-Abschnitte enthalten; ein alter level-complete bleibt dort und bietet direkt den Einstieg in Level 2. Frühere Abschnitte, Inventar und Entscheidungen bleiben erhalten. Unbekannte Versionen und unmögliche Fortschritte werden abgelehnt. Ein altes garden-complete bietet die Handlung zum Betreten der Kammer.

river speichert Untersuchung, Prüfung der Gegenseite, Auswahl der Stoffschlinge, Verbindung zur Halteschlaufe, Sicherung an der Öse und das aktuelle Überquerungspanel. Die Schlinge bleibt als mitgenommener Gegenstand dokumentiert, ist nach Sicherung jedoch am Stamm gebunden und nicht nochmals verwendbar.

## Sprache

Die Auswahl de, en oder ar-EG liegt separat unter tamatem-dina-language. Ein Sprachwechsel verändert den Spielstand nicht und benötigt kein Netz. Deutsche Quelltexte stehen in data.js und als t-Aufrufe in app.js; beide Übersetzungen in messages.js. Neue sichtbare Texte, Alternativtexte und Fehlermeldungen ergänzen. Stabile Kennungen und Figurenidentitäten nicht übersetzen; Anzeige von Namen separat lokalisieren.

html.lang und html.dir sowie die Oberfläche werden beim Wechsel aktualisiert. Bilder, Bildobjektkoordinaten und Rätselgeometrie werden nicht gespiegelt. Die Anwendung verwendet lokale Systemschriften, keine extern geladenen Schriften.

## Bilder

characters.png: Figurenblatt als Porträtreferenz; workroom.png: Arbeitstisch; illness.png: Dinas Zimmer; threshold.png: Waldrand mit Oris; river.png: Fluss, Stamm, Schlaufe, Öse und Oris; garden-dry.png und garden-wet.png: derselbe Garten vor/nach der Bewässerung; chamber.png: lebende Blüte und erloschenes Blatt; morning.png: gemeinsame Erholung am Morgen; case-library.png: Recherche des achtjährigen Tamatem mit Dina und Eva; case-courtyard.png: Dinas Gespräch mit Nora. Neue Bilder werden im verfügbaren Bildwerkzeug anhand des Figurenblatts erstellt. Hinweise und Dialoge bleiben skalierbarer Text; notwendiger Inhalt wird nicht nur in eine Illustration eingebrannt.

## Offline und Veröffentlichungen

Alle benötigten Dateien stehen in der CORE-Liste von sw.js. Bei neuen Szenen die Liste ergänzen und bei geänderten Cache-Inhalten die Cache-Version aktualisieren. „Offline bereit“ darf erst nach vollständiger Prüfung aller Dateien erscheinen.

Die Browser-Anwendung lädt keine externen Schriftdateien. Bei künftigen Medien auch notwendige Töne lokal beilegen. npm test prüft Spielregeln, Migration, Übersetzungsvollständigkeit, simuliertes Cache-Verhalten und den Offline-Export. python tests/browser-smoke.py führt mit installiertem Python-Playwright und Chromium gegen den laufenden lokalen Server zusätzliche Browserdurchläufe aus. Es ist ein optionales Entwicklungswerkzeug, keine Laufzeitabhängigkeit des Spiels.

make-offline.mjs bettet 14 Bilder und alle Sprachmodule ein. Die Module erhalten getrennte Bereiche, damit Import-Aliase und gleichnamige Variablen korrekt funktionieren. Die Web-App legt Bilder und beide Sprachmodule im Service-Worker-Cache ab. Bei geänderten Dateien die Cache-Version erhöhen.

## Quellgarten und Kanäle

garden speichert metGuardian, inspected, sechs rotations (Ganzzahlen 0–3), tested, solutionPreview und watered. Erst Gespräch und Untersuchung schalten die Drehung/Wasserprüfung frei. Drehen verwirft die vorherige Wasserprüfung. Ein Fehlschlag verbraucht nichts; der neue Teilweg wird aus den Stellungen berechnet. Erfolg setzt garden-complete und sperrt weitere Drehungen.

channels.js verwendet eine physisch unveränderte Matrix mit drei Spalten und zwei Reihen. Richtungen 0–3 sind oben, rechts, unten, links. Kanaltypen und Startstellungen entsprechen dem Episodenplan. traceChannels verfolgt den Weg vom linken Einlass der ersten Platte bis zum unteren Auslass der vierten. Nur ein durchgängiger Weg über alle sechs Platten gilt als gelöst. Gerade Platten haben zwei geometrisch gleiche Rotationsstellungen; diese werden beide akzeptiert. Die Quelle/Wurzelbecken-Markierungen, Fließrichtung und Unterbrechung sind auch in RTL dieselben.

Nach der dritten Hilfe kann der Nutzer eine getrennte Lösungsvorschau öffnen. Sie verändert die eigenen Stellungen nicht. Erst „Vorschau übernehmen“ setzt die Platten; danach muss das Wasser weiterhin ausdrücklich geprüft werden. Der Zustand und die Vorschau überstehen Speichern/Laden. Animationen haben keine spielmechanische Zeitbedingung und werden bei prefers-reduced-motion abgeschaltet.

## Blüte, Rückweg und Finale

bloom speichert identified, collected und das optionale guardianTalked. Sammeln setzt die Laterne an; Pflücken ist keine schädigende Zustandsaktion. journey.protected dokumentiert die richtige Sturmhandlung. Erst danach ist die Rückkehr zur Apparatur möglich.

finale speichert inserted, collected, bound, lanternOn, attempted, stable, dinaObservation (none/flicker/steady), dinaReported und dinaConfirmed. Vor bound bleibt die Laterne an. APP_CALM bei brennender Laterne führt zu Dinas Flackerbeobachtung; APP_CALM bei ausgeschalteter Laterne stabilisiert sofort. Anschließend bleibt in beiden Wegen eine eigene Prüfung des ruhigen Spiegelbilds nötig. Eine frühere flicker-Beobachtung reicht für die Bestätigung von steady nicht aus. HEAL setzt stable und dinaConfirmed voraus. MORNING führt zum gespeicherten Levelabschluss.

Die aktive Figur wird aus dem Abschnitt bestimmt: Dina im Prolog und im Abschnitt dina; Tamatem in den übrigen Spielszenen. Notizbuch, Hinweise und Darstellung verwenden diese gespeicherten Zustände. Die dritte Apparaturhilfe benennt den nächsten gültigen Schritt; bereits abgeschlossene Kammer-/Sturmaufgaben verweisen zum Übergang. Laternen-, Faden- und Spiegelanzeigen verwenden lokale HTML/SVG-Symbole und Text. Animationen sind rein visuell.

Die Zustandsraumprüfung in tests/finale.test.mjs prüft jeden erreichbaren Zustand ab dem Gartenabschluss für alle vier Kombinationen der frühen Entscheidungen: Speicherung/Validierung, Erhalt der Vergangenheit und Erreichbarkeit des Endes. Die Browserdurchläufe spielen alle vier Level offline weiter und prüfen Neuladen/Sprachwechsel. browser-legacy.py importiert historische Feldsätze der Versionen 1–6. Der Exporttest verwendet asynchronen Prozessaufruf und vm.Script für die Syntax des eingebetteten Skripts; damit ist kein synchroner Kindprozess für die Syntaxprüfung erforderlich.

## Level 2 · realistischer Fall

case-state.js verwaltet ausgewählte/gelesene Adresskarten, Adressprüfung, Noras Nennungsfreigabe (name/anonymous), Interview, Emils Widerruf und Dinas Reaktion (omit/document), drei explizit nummerierte Zeitachsenpositionen, beide Stellungnahmen, drei redaktionelle Einstufungen, ausdrückliche Überschriftenkorrektur und Veröffentlichung. Kein Level-1-Feld wird beim Einstieg gelöscht oder neu gesetzt. case-complete ist der gespeicherte Level-2-Abschluss.

Dina spielt Eröffnung, Interviews, Stellungnahmen, Redaktion und Druck; Tamatem spielt Adressvergleich, gemeinsame Zeitachse und Rückkehr. Die Fallnotizen ergänzen das bestehende Notizbuch. Ein Treffen am Lesetisch teilt die getrennten Funde, bevor die gemeinsame Zeitachse verfügbar wird. Die ursprüngliche Vermutung bleibt als solche bezeichnet; Bestätigung und Korrektur sind getrennte Einträge.

case-copy.js nutzt stabile Textkennungen mit je drei vollständigen Fassungen. case-ui.js wählt über dieselbe getrennt gespeicherte Sprachpräferenz wie i18n.js; Sprachwechsel verändert keinen Fallzustand. Die Fehlermeldung der Validierung steht im bisherigen messages.js-Katalog. Tests prüfen alle Tripel, Platzhalter, dynamischen Ansichten und Hilfen. Für neue Texte dieses Moduls immer alle drei Einträge pflegen.

case-state.js kennt keine Magie und keine verbrauchten Ressourcen. Falsche Prüfungen ändern keine Bestätigungen. Vor Weitergabe änderbare Auswahlen, danach feste Interviewentscheidungen; beide Widerrufswege erhalten den öffentlichen Registerbeleg. Veröffentlichte Zitate schließen Emils zurückgezogene Aussage aus. Die anonyme Ausgabe enthält auch in der Korrektur keinen Namen der Mieterin. Ein Artikel endet mit belegtem Widerspruch und offenen Motiven, nicht mit einer automatischen Lösung der Wohnungsfrage.

Seit Level 4 enthält die Offline-CORE-Liste 34 Einträge. Der Einzeldatei-Export bettet auch die drei Fallmodule ein und löst lokale Modulnamen mit Bindestrichen auf. tests/case.test.mjs prüft alle 16 Kombinationen alter/neuer Entscheidungen, jeden Schritt eines vollständigen Level-1-Durchlaufs als Version-4-Migration, 16 Adressauswahlen, 34 partielle Zeitachsen und 64 Einstufungen samt Fortsetzbarkeit. Der Browser-Smoke-Test spielt beide Level bei abgeschaltetem Netz; tests/browser-standalone.py prüft die erzeugte Einzeldatei direkt, sofern die Browserrichtlinie file:// erlaubt. Ergebnisse und Grenzen stehen in STATUS.md.

## Level 3 · Umweltrecherche und fantastische Quelle (0.6)

Nach case-complete bieten UI und Reducer ECO_START an. Neue Abschnitte: eco-opening → eco-spark → eco-keeper → eco-samples → eco-interviews → eco-model → eco-correction → eco-response → eco-stop → eco-source → eco-verify → eco-complete. Zwölf Phasen, ein eigener eco-Zustand, keine Mutation der Vergangenheit. Dina spielt 1, 5, 8, 9 und 11. Vollständige Rätselspezifikation: episodes/03-kranker-fluss.md.

eco-state.js exportiert initialEco, reduceEco, validateEco und gemeinsame Konstanten. eco enthält Briefing, Einzelprobe/Beschuldigung, Reflexion, gelesene Proben und Quellen, veränderbare Auswahlfelder, bestätigten Vergleich und Ursachenmodell, öffentliche Richtigstellung und Entschuldigung, beide Stellungnahmen, Dinas Vorgehensentscheidung, Eingriffsreihenfolge, Quellgitter/Zulauf, beide Nachkontrollen und Veröffentlichung. Abschnittsvoraussetzungen und frühester Zeitpunkt jedes Feldes werden getrennt geprüft. Probenindex und Silberatem sind fiktiv.

Für Level 3 wurde Format 6 eingeführt (aktuell 7). Für Versionen 1–5 wird initialEco ergänzt, vorhandene Migrationen bleiben unverändert. Version 5 darf nur die bisherigen 26 Abschnitte enthalten. Nach Eintritt in ein ECO_STAGE validiert validateCase die Vergangenheit ausdrücklich als case-complete; dadurch kann Level 3 keinen unfertigen Fall überschreiben oder umgehen. Alle früheren Felder und Speicherschlüssel bleiben gleich. Alte Notizbücher bleiben auch außerhalb der Fallabschnitte vollständig abrufbar.

Physische Karte A→B→C steht in einem eigenen LTR-Grid; sprachabhängige Beschriftungen sind mit bdi isoliert. Alle Aktionen über Buttons, Radio-Labels oder nummerierte Selects. Keine notwendige Animation, Ziehbewegung oder Reflexanforderung. Drei Hilfestufen in allen zwölf Phasen; kein automatisches Übernehmen einer Lösung. Übersetzungen in eco-copy.js werden nach derselben getrennten Sprachpräferenz ausgewählt; Fehler im bisherigen messages.js-Katalog mitgeführt.

Der damalige Service-Worker-Cache v6 enthielt 30 Einträge (aktuell v7 mit 34) einschließlich der drei eco-Module und zwei neuer Bilder. Exportreihenfolge: eco-state vor state, eco-copy und eco-ui nach i18n, vor case-ui/app. Die bestehende case-complete-Ansicht nutzt ecoText für den Einstieg. CSS-Bildreferenzen werden für alle eingebetteten Assets ersetzt, einschließlich des gealterten Tamatem-Porträts. Exakte Bilder und Modulreihenfolge werden im Exporttest geprüft.

tests/eco.test.mjs prüft echte Version-5-Formate an jedem alten Schritt, 64 Kombinationen der sechs Entscheidungen, alle 384 Proben-Lesemengen/Auswahlen, 24 Interviewkombinationen, 64 partielle Modelle, 34 partielle Reihenfolgen sowie notwendige Korrektur, beide Eingriffe und Nachkontrollen. Frühere Tests bleiben enthalten. tests/browser-eco.py prüft Level 3 im echten Chromium mit v5-Dateiimport, Speichern/Laden, Touch, schmalen Ansichten und tatsächlichem Service-Worker-Offline-Spiel; TD_STANDALONE=1 versucht die erzeugte Datei direkt ohne Richtlinienumgehung. Ausgeführte Ergebnisse und Grenzen stehen ausschließlich in STATUS.md.

## Level 4 · realistischer Recherchethriller (0.7)

Nach eco-complete bieten UI und Reducer MORNING_START an. Zwölf Abschnitte: morning-opening → morning-pressure → morning-method → morning-sources → morning-preserve → morning-clock → morning-timeline → morning-model → morning-responses → morning-privacy → morning-publish → morning-complete. Dina spielt 1, 3, 5, 9, 10 und 11; Tamatem die anderen. Vollständiger Rätselvertrag: episodes/04-gestohlenes-morgen.md.

morning-state.js hält ausschließlich neuen Zustand: gelesene Quellen, Clique-Reaktion plus tatsächlich ausgesprochenen Widerspruch, Methode, Quellenklassifikation, Sicherungsfolge, Uhrzeit/Gültigkeitsbereich, vier Ereignispositionen, Belegmatrix, fünf Publikationsentscheidungen, Nennungsfreigabe und drei Veröffentlichungsschritte. Die Bestätigungen brauchen jeweils richtige Zuordnung und die zugehörigen gelesenen Dokumente. Unbestätigte Reihenfolgen werden ohne Duplikate umgestellt. Keine Ressourcen oder Countdown. Daten und Logik haben keinerlei magische Beweisfunktion.

Format 7 ergänzt initialMorning für Versionen 1–6. Version 6 darf keine neuen Abschnitte vortäuschen. In morning-Abschnitten wird case als case-complete und eco als eco-complete validiert; dadurch kann die neue Episode alte Vorarbeiten nicht umgehen. validateMorning prüft Feldtypen, zulässige Werte, früheste Phasen und alle bisherigen Abschlussbedingungen. Der lokale Speicherschlüssel und die Exportkennung bleiben unverändert.

morning-copy.js enthält vollständige Sprachtripel einschließlich verfasster Hilfen und Ergebnisnotizen. morning-ui.js liefert Quellenansichten, Figurenwechsel, Hinweisstufen, gespeichertes Vorgehen und namentlichen/anonymen Artikel. Frühe Notizbücher bleiben über published auch in neuen Episoden abrufbar. Die anonyme Ausgabe darf keinen Namen der Beschuldigten enthalten. Nachrichten sind lokale fiktionale Aktionen ohne API-Versand.

Cache v7 umfasst 34 Einträge: drei morning-Module und ein neues Bild zusätzlich zum vorherigen Paket. Export: morning-state vor state; morning-copy/morning-ui nach i18n und vor eco-ui, weil dessen Abschluss den neuen Einstieg anbietet. CSS-Bildreferenzen inklusive Porträt werden eingebettet. 14 PNG-Bilder plus SVG-Symbol; alle Sprachfassungen in derselben Datei.

Neue Nachweise: tests/morning.test.mjs (Migration, 256 Entscheidungskombinationen, partielle Rätselmengen, Datenminimierung und Freigabereihenfolge); tests/browser-morning.py (echter Chromium, offline vor Einstieg, Reloads/Touch/Sprachwechsel/Export); tests/browser-legacy.py (alte Feldsätze 1–6 durch echten Importdialog). Der Exporttest führt neue Phasen gegen ein minimales VM-Dokument aus. Keine dieser Prüfungen ersetzt ein echtes iPhone oder einen erlaubten direkten file://-Aufruf. Tatsächlich ausgeführte Ergebnisse und Grenzen ausschließlich in STATUS.md.
