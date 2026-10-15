# Gesamtabnahme 0.10 · 15. Oktober 2026

Ausgangspunkt: bestätigter GitHub-main **d8a80320a8f484db4aa8bd6df7e7131d1617b4a9**. Der bereitgestellte Checkout d9a7f72 war sauber und wurde vor der Prüfung auf diesen Stand gebracht. Keine Nutzeränderungen überschrieben. Gegenstand sind alle sieben Level und Speicherformate 1–10. Die private Site bleibt separat auf 0.8; keine Veröffentlichung, keine Änderung der Hosting-Identität.

## Ergebnis und Korrektur

**Technische Gesamtkampagne bestanden**, einschließlich der hier beschriebenen Korrektur. **Keine vollständige externe Abnahme**: echte Geräte-, Muttersprach-, Fach- und menschliche Zeitnachweise fehlen weiterhin.

Der neue durchgängige Browserlauf fand einen tatsächlichen Fehler am ersten Recherchetisch: Das Quellenraster erzwang bei 320 CSS-Pixeln eine Dokumentbreite von etwa 368 Pixeln. Dadurch lagen Teile der Szene und Recherchekarte außerhalb des Bildschirms. Korrigiert sind die Mindestbreite der mobilen Spielspalte und der beiden Quellenspalten sowie umbrechbare Quellenbeschriftungen. Anschließend gemessen: Dokumentbreite 320 bei Viewport 320; Vorher-/Nachher-Screenshots tatsächlich visuell geöffnet. Kein Abschneiden durch verborgenes horizontales Scrollen. Offline-Cachekennung erhöht, Speicherformat unverändert 10.

## Kampagnen- und Inhaltsprüfung

CANON und relevante Abschnitte aller sieben Episodendokumente gegen Ablauf, Reducer und sichtbare Texte gelesen. Die unabhängige dramaturgische und fachliche Beurteilung bleibt offen.

| Level / Alter | Geprüfter Kern und Grenzen |
|---|---|
| 1 / 6 | Dina recherchiert selbst; Tamatem untersucht und sichert Übergang, löst den geometrischen Quellgarten, erhält die verwurzelte Blüte, schützt den Lichtstaub und benötigt Dinas eigene Spiegelprüfung. Beide Laternenwege, zwei frühe Entscheidungen, Notizbuch und Hilfen. Fantastische Heilung bleibt innerhalb dieser Episode. |
| 2 / 8 | Dina entscheidet Interview-/Widerrufsweg, korrigiert ihre Überschrift und veröffentlicht; Tamatem vergleicht Anschriften und ordnet Belege. Anonyme/namentliche Fassung, Widerruf respektiert, keine automatische Rückkehr in Wohnungen. |
| 3 / 10 | Vergleich nach Ort und Zeit, keine Schuld aus blauer Farbe. Eigener verbreiteter Fehler, ausdrückliche Entschuldigung, Dinas Betriebsermittlung, zwei getrennte Eingriffe und Nachkontrollen. Fantastische Quelle ersetzt keine Messung. |
| 4 / 12 | Eigenständige Quellen, erlaubte Sicherung, begrenzter Uhrvergleich, dokumentierte Rekonstruktion, Clique-Reaktion und Korrektur an dieselbe Gruppe. Private Nachricht, Nachbarwohnungen und Anschrift minimiert. |
| 5 / 14 | Feste Ausschnitt-/Perspektiv-/Beschriftungsregeln, Quellen und Verbreitungskette. Eigene Berichtigung samt Zustellung; Dina korrigiert ihr eigenes Alleinretterinnen-Porträt. Namens-/Rollenfassung und Publikumsgrenze bleiben erhalten. |
| 6 / 16 | 10 Prozentpunkte statt Heilungsbehauptung; Erwachsenenstudie über zwölf Wochen mit Risiken und Unsicherheit. B41: 40 bestellbar, Quarantäne bleibt. 200 kurzfristig je Packung, 3200 Finanzierungslücke, Sicherheit kein Gewinnbeweis. Eigenes Schutzgespräch, gemeinsame Befunde, Tamatems eigene Korrektur, Dinas getrennte Freigabe/Publikation und tatsächliche Lieferquittung. |
| 7 / 18 | Drei Kontaktwege folgen den getrennten Geschichten aus L2, L5 und L6; neue Freigaben ausdrücklich begrenzt. L4 bestimmt öffentlichen Prüfweg oder schriftliche Übergabe. Dina und Tamatem wählen und unterschreiben ihre Zukunft jeweils selbst; Zusammenarbeit bleibt frei. Eigener Gesamtvorwurf sichtbar zurückgenommen. R7/N4, 1500 offen, Frist 30., zweckgebundener Zuschuss, 2000 Druckkosten ohne Reserve, Quittung über 800 Exemplare und tatsächlicher Raumverlust bleiben getrennt. |

Dina bleibt ungefähr dreißig, Freundin/Mentorin/Mutterfigur mit eigenen Aufgaben; kein romantischer oder magischer Altersbogen. Keine beleglose Gesamtverschwörung und keine magische Fallauflösung in den realistischen Episoden gefunden. Frühere Einwilligungen werden im Finale nicht automatisch erweitert. Neue Spieltexte oder Illustrationen waren für die Layoutkorrektur nicht nötig.

## Technische Nachweise

Prüfumgebung: Linux, Chromium **154.0.8037.57**, Node **24.19.0**, Python **3.12.14**, Playwright **1.62.0**. Die Browser wurden tatsächlich ausgeführt; Touch ist emuliert. Die vorhandenen Testskripte behalten ihre Grenzen: Historische Dateifälle sind aus den damaligen Feldsätzen rekonstruierte JSON-Dateien, keine bereitgestellten persönlichen Nutzersicherungen. Logiktests sind keine Browserläufe; Browserläufe sind automatisiert und keine menschlichen Spielzeitmessungen.

- `npm test`: vor und nach der Korrektur **zwölf Testdateien bestanden**, keine Fehler oder übersprungenen Dateien. Enthalten sind unter anderem 4096 Level-7-Läufe aus acht historischen und vier neuen Entscheidungsachsen, JSON-Rundläufen, unveränderter Vergangenheit, falschen Kontakt-/Prüfwegen und getrennten Pflichtaktionen. Dies ist keine vollständige Erschöpfung aller Kampagnenzustände.
- `python tests/browser-smoke.py`: vollständige Level 1/2 in de/en/ar-EG bestanden; regulärer/früher Laternenweg, Interview-/Widerrufsvarianten, historische Importe, Offline-Neuladen und blockierter lokaler Speicher.
- `python tests/browser-legacy.py`: Formate 1–9 als Dateien über Bestätigungsdialog in allen drei Sprachen bestanden; alte Felder, richtiger Abschnitt, Neuladen und direkte Anschlüsse erhalten.
- `python tests/browser-edition.py`: Level 7 in allen drei Sprachen bestanden; v9-Dateiimport, tatsächlicher Offline-Betrieb vor Einstieg bis Ende, alternative Historien, Fehlversuche, Teilstände, vier historienabhängige Prüfbedingungen, getrennte Unterschriften, Berichtigung, Freigabe/Druck, v10-Export/Reimport, 1440/320/390 CSS-Pixel, Touch und RTL. Keine JavaScript-Laufzeitfehler.
- `python tests/browser-eco.py`, `python tests/browser-morning.py`, `python tests/browser-mask.py`, `python tests/browser-healing.py`: Level 3–6 jeweils vollständig in **allen drei Sprachen bestanden**, historischer Dateiimport (v5/v6/v7/v8), Netz vor dem jeweiligen Einstieg aus, Teilstandsreloads, Fehlversuche, notwendige Dina-Handlungen/Korrekturen, Erhalt der Vergangenheit und v10-Dateiexport/-reimport. Touch 320/390 und RTL; keine JavaScript-Laufzeitfehler.
- `python tests/browser-campaign.py`: **drei neue Partien durch alle sieben Level auf Deutsch, Englisch und Arabisch bestanden; je 87 erreichte Abschnitte**, von neuer Partie bis edition-complete. Keine Initialisierung mit Testfortschritt und keine direkten Reducer-Aufrufe im Browser. Netz vor START aus, mit Service-Worker-Neuladen. Nach jedem Level echte v10-Sicherungsdatei exportiert und über Bestätigungsdialog wieder importiert. In jedem neu erreichten Abschnitt Reload, Sprachwechsel ohne Zustandsänderung, Altersangabe, Notizbuch, verfügbare Hilfe und 320/390-Layout geprüft; je Level beide Figuren tatsächlich gespielt. Frühere Zustandsfelder nach jedem abgeschlossenen Level gegen spätere Aktionen verglichen.
- Syntaxprüfung des Service Workers und neuen Python-Skripts sowie `git diff --check` bestanden. Frühen deutschen Recherchetisch vor/nach Korrektur und englischen und arabischen mobilen Finale-Schluss mit Berichtigung, Plänen und historischen Folgen anhand tatsächlicher Screenshots geöffnet.

- `node make-offline.mjs /tmp/tamatem-dina-offline.html`: erzeugt. Direkter Versuch mit `TD_STANDALONE=1 python tests/browser-edition.py`: **ERR_BLOCKED_BY_ADMINISTRATOR**. Keine Umgehung; direkter Dateibetrieb weiterhin nicht bestanden. Dieses Skript meldet eine Richtlinienblockade mit Exitcode 0; maßgeblich ist die Ausgabe **BLOCKED**, nicht allein der Exitcode.

Die drei durchgängigen Profile kreuzen alte Entscheidungen; weitere Varianten und unzulässige Teilstände decken die Episoden- und Logiktests ab:

| Sprache | L2 / L5 / L6 → drei Kontaktwege | L4 → Prüfweg | Dinas Zukunft / Tamatems Zukunft / Arbeitsform |
|---|---|---|---|
| de | Name / Rolle / schriftlich → Einführung / Archivtheke / schriftlicher Auszug | direkt → schriftliche Übergabe | eigenes Archiv / Lokalredaktion / getrennte Redaktionen |
| en | anonym / Name / begleitet → Vermittlung / Sprechstunde / Registertermin | offen → öffentliches Gegenlesen | Kollektiv / mobile Recherche / feste Prüftermine |
| ar-EG | Name / Rolle / begleitet → Einführung / Archivtheke / Registertermin | offen → öffentliches Gegenlesen | eigenes Archiv / mobile Recherche / getrennte Redaktionen |


## Echte externe Abnahmen: weiterhin offen

In dieser Umgebung standen kein echtes iPhone, keine muttersprachliche ägyptisch-arabische Prüfperson, keine unabhängigen Fachprüfenden und keine unvorbereiteten menschlichen Spielenden zur Verfügung. Dafür wird kein Ersatznachweis erfunden. Der direkte Dateiaufruf bleibt wegen der tatsächlich beobachteten Browserrichtlinie offen.

| Offener Nachweis | Nächster konkreter Test |
|---|---|
| iPhone / Safari | Commit, Modell, iOS/Safari-Version erfassen; vollständiger Erstdownload, Home-Bildschirm-Installation, Flugmodus, schließen/neu öffnen, alle sieben Level, Export und Import. Kontakte, lange Notizen und Finale bei 320/390-ähnlicher Hochformatbreite prüfen. |
| Ägyptisches Arabisch | Muttersprachliche Person spielt alle sieben Level einschließlich Dokumente, Hilfen, Fehler und dynamische Schlüsse. Besonders natürliche Dialoge, Namensschreibung, medizinische und rechtliche Aussagen sowie RTL getrennt rückmelden. |
| Direkte Einzeldatei | Erzeugte HTML auf einem Browser öffnen, dessen geltende Richtlinie den Dateiaufruf erlaubt. Netz abschalten; neue Kampagne und v9→v10-Finale, Sicherung/Import/Neuladen in drei Sprachen prüfen. Kein lokaler HTTP-Aufruf als Ersatz. |
| Unabhängige Fachprüfung | Ökologie L3; Medizin/Wirtschaft L6; Quellen-, Einwilligungs-, Vertrags-/Frist-/Korrekturregeln besonders L7; Dramaturgie/Psychologie und Betroffenenperspektive übergreifend. Konkrete Stellen und zulässige Qualifikationsangaben erfassen. |
| Menschliche Zeitprüfung | Unvorbereitete erwachsene Spielende, ohne Lösungswissen, jedes Level separat messen: Start/Ende, Pausen, Netto-/Bruttozeit, Sprache, Hilfen und Hänger. **15–30 Minuten je Level weiterhin ungemessen.** Vorlage: acceptance-timing.csv. |

Rückmeldungen gemäß ACCEPTANCE.md mit Commit, Sprache, Gerät/Browser, Ausgangsspielstand, Handlung, Erwartung und Beobachtung dokumentieren. Namen nur soweit erlaubt, keine Zugangsdaten oder privaten Nutzerdaten. Externe Personen wurden nicht kontaktiert.
