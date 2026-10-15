# Entwicklungsstand

Stand: 15. Oktober 2026. Entwicklungsfassung 0.3: dreisprachiger Prolog, Flussübergang und Quellgarten.

## Entwicklungsablage und Veröffentlichung

Privates GitHub-Repository: TimonNetzel/tamatem-dina, Hauptzweig main. Die bisherige Sites-Veröffentlichung enthält Prolog 0.1. Abgeschlossene Arbeitspakete werden nach main gepusht; den aktuellen bestätigten Commit anhand von Git-Historie und Remote prüfen. Die spielbare Site wurde hier nicht aktualisiert. Identität und früherer Veröffentlichungsstand: DEPLOYMENT.md.

## Implementiert

- Vorhandener Prolog: Dinas Quellenrecherche, Krankheitsszene, Wechsel zu Tamatem, beide frühen Entscheidungen, Karte übernehmen, vier Gegenstände packen und Oris begegnen.
- Vollständiger Flussübergang: Stamm untersuchen, Oris zur Gegenseite schicken, Stoffschlinge an Halteschlaufe und Öse befestigen, zwei fortsetzbare Überquerungspanels. Der Flussabschluss führt jetzt in den Quellgarten.
- Quellgarten: Gespräch mit dem Hüter, Untersuchung der Wasseranlage wahlweise mit Lupe, nachvollziehbares Ziel und Rätsel mit sechs drehbaren Kanalplatten in zwei Reihen.
- Berechneter Wasserlauf vom linken Einlass der ersten Platte über alle sechs Platten zum Becken unter Platte vier. Fehlversuche zeigen erreichte Platten, erste Unterbrechung als Kreuz und passende Textmeldung. Keine verbrauchbaren Ressourcen oder Zeitbegrenzung. Rotation per Klick, Tippen oder Tastatur; Animationen sind reduzierbar.
- Drei Hilfestufen mit freiwilliger getrennter Lösungsvorschau. Erst ausdrückliche Übernahme ändert die Platten; die Wasserprüfung bleibt eine eigene Handlung.
- Zwei konsistente neue Gartenillustrationen: vertrocknet/geschlossen und bewässert/geöffnet. Nach Erfolg Pflanzen wiederbelebt, Hüter öffnet die Kammer, Rätsel gesperrt. garden-complete ist der Anschluss für die Blütenkammer, noch kein Ende von Level 1.
- Alle Inhalte auf Deutsch, Englisch und natürlichem ägyptischem Arabisch in arabischer Schrift, einschließlich Quellen, Notizbuch, Hilfen, Menüs und zugänglicher Beschriftungen. RTL-Oberfläche mit unveränderter physischer Rätselgeometrie. Sprachpräferenz bleibt vom Spielstand getrennt.
- Spielstandformat 3; Altversionen 1 und 2 werden ohne Neustart fortgesetzt. Früheres Prologende wird zum Flussanschluss; der alte Flussabschluss behält seinen Abschnitt und bietet den Weg zum Garten. Entscheidungen, Inventar und Flusszustand bleiben erhalten. Speicherschlüssel und Exportkennung bleiben unverändert.
- Web-App-Offline-Cache und eigenständige HTML enthalten das Kanalmodul, sieben Bilder und alle drei Sprachen.

## Tatsächlich geprüft

- `npm test`: 27 Prüfungen bestanden, keine fehlgeschlagen oder übersprungen. Alle 4.096 Rotationskombinationen geprüft: Genau acht geometrisch gleichwertige vollständige Wege lösen das Kanalrätsel. Der tatsächliche Weg, falsche Anschlüsse, Vorschau/Übernahme, Sperre nach Erfolg und ungültige Zustände werden geprüft.
- Alle vier frühen Entscheidungskombinationen erreichen garden-complete. Auch manuelle Lösung ohne Hilfen, jeder Garten-Zwischenstand und Vorschau überstehen Speichern/Laden. Version-1- und Version-2-Migration getestet.
- `python tests/browser-smoke.py`: vollständige Chromium-Durchläufe von Prolog über Fluss bis zum bewässerten Quellgarten in allen drei Sprachen. Deutsche und arabische Fassung manuell gelöst; englische Fassung über ausdrücklich gewählte Vorschau und Übernahme. Keine JavaScript-Laufzeitfehler.
- Tatsächliches Service-Worker-Offline-Neuladen und Weiterspielen bei abgeschaltetem Netzwerk in allen drei Durchläufen, einschließlich Gartenbildern, Teilweg, vollständiger Lösung, Neuladen zwischen Drehungen sowie nach Erfolg, Export und bestätigtem Import alter Spielstände.
- Mobile Ansichten bei 320 und 390 CSS-Pixeln ohne horizontalen Überlauf; Kanalplatten mindestens 44 Pixel breit. Identische physische Anordnung in RTL/LTR. Deutscher Desktop bei 1440 Pixeln. Trockene und bewässerte Desktop- sowie arabische mobile Ansichten visuell anhand aktueller Screenshots geprüft.
- Sprachwechsel mitten im Rätsel erhält den vollständigen Spielzustand. Reduzierte Bewegung deaktiviert die Wasseranimation. Tastatureinstieg, Escape bei Dialogen und spielbare Sitzung trotz blockiertem lokalem Speicher geprüft.
- Offline-Einzeldatei: sieben eingebettete Bilder, keine externen Skript-/Stylesheet-Abhängigkeiten, gültige Skriptsyntax und Ausführung der eingebetteten Module gegen ein minimales Dokument in allen drei Sprachen. Dies ist kein visueller Dateiaufruf im Browser.

## Offene Prüfungen und Grenzen

- Kein Test auf einem echten iPhone. Safari-Installation, tatsächliches Offline-Neuladen und Touchbedienung bleiben gesondert zu prüfen.
- Muttersprachliche Qualitätsprüfung der ägyptisch-arabischen Texte steht aus.
- Direkter file://-Aufruf der HTML-Einzeldatei wird hier mit ERR_BLOCKED_BY_ADMINISTRATOR abgelehnt. Die Richtlinie wurde nicht umgangen. Direkten Browserbetrieb am Laptop separat prüfen.
- Keine unabhängige Spieldauermessung. Ziel für das vollständige Level bleibt 15–30 Minuten.
- Spielstände bleiben gerätelokal, ohne automatische Synchronisierung. Ton und Musik fehlen weiterhin.
- Die Übergabe-Hashliste bleibt die unveränderte Momentaufnahme von Prolog 0.1; Abweichungen durch die Weiterentwicklung sind erwartbar.

## Nächste Aufgabe / Chatübergabe

Jetzt den vereinbarten neuen Chat für Blütenkammer, Rückweg und gemeinsames Finale von Level 1 beginnen. Kopierfertiger Auftrag: ../CODEX_STARTPROMPT.md. Ausgangspunkt ist garden-complete mit bewässertem Garten und geöffneter Kammer. Relevante Planung: Episodendokument, Stationen 9–12 und Aufgaben D/E. Früh erkannte richtige Laternenlösung akzeptieren; Dina bleibt notwendig spielbar beteiligt. Altspielstände und alle drei Sprachen erhalten. Level 2–7 bleiben Konzeptentwürfe.

Der Assistent übernimmt Dokumentation, Commit und Push sowie die Übergabe nach WORKFLOW.md. Vor Level 2 wieder einen eigenen Chat vorbereiten.
