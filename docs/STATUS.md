# Entwicklungsstand

Stand: 15. Oktober 2026. Entwicklungsfassung 0.2: dreisprachiger Prolog und Flussübergang.

## Entwicklungsablage und Veröffentlichung

Privates GitHub-Repository: TimonNetzel/tamatem-dina, Hauptzweig main. Die bisherige Sites-Veröffentlichung enthält Prolog 0.1. Die neue Fassung wird als abgeschlossenes Arbeitspaket auf main gesichert; den bestätigten GitHub-Stand anhand von Git-Historie und Remote prüfen. Die spielbare Site wurde hier nicht aktualisiert. Identität und vorheriger Veröffentlichungsstand: DEPLOYMENT.md.

## Implementiert

- Vorhandener Prolog: Dinas Quellenrecherche, Krankheitsszene, Wechsel zu Tamatem, beide frühen Entscheidungen, Karte übernehmen, vier Gegenstände packen und Oris begegnen.
- Sprachwahl vor Spielbeginn und im Menü: Deutsch, Englisch, natürliches ägyptisches Arabisch in arabischer Schrift. Dialoge, Quellen, Notizbuch, Hilfen, Menüs, Rückmeldungen und zugängliche Beschriftungen werden übersetzt. Die arabische Oberfläche liest von rechts nach links; Bildkoordinaten bleiben erhalten.
- Sprachpräferenz getrennt vom Spielfortschritt gespeichert. Bei nicht verfügbarer Speicherung bleiben Sprachwahl und Spielen während der Sitzung möglich.
- Neue Flussillustration anhand der vorhandenen Figuren- und Stilreferenzen. Stamm untersuchen, Oris die Gegenseite prüfen lassen, Stoffschlinge auswählen, Halteschlaufe und Öse verbinden. Sichtbare Sicherung mit reduzierbarer Animation, dreistufige Hilfe, Fehlversuche ohne Gegenstandsverlust.
- Gesicherte Überquerung als zwei fortsetzbare Comic-Panels; Entwicklungsabschluss am anderen Ufer mit Ausblick auf den Quellgarten.
- Spielstandformat 2. Alte Prolog-Spielstände setzen ohne Neustart fort; das frühere Ende wird zum Flussanschluss. Inventar und Entscheidungen bleiben erhalten. Lokaler Speicherschlüssel und Exportkennung bleiben unverändert.
- Web-App-Offline-Cache und eigenständige Laptop-HTML enthalten neue Illustration und alle drei Sprachen.

## Tatsächlich geprüft

- `npm test`: 20 Prüfungen bestanden, keine fehlgeschlagen oder übersprungen. Darunter alle vier Entscheidungskombinationen bis nach der Überquerung, Spielstandmigration, Rundlauf jedes Flussschritts, ungültige Fortschritte, Übersetzungsvollständigkeit, simuliertes Cache-Verhalten und HTML-Export einschließlich eingebetteter Bilder, Skriptsyntax und Ausführung der eingebetteten Module gegen ein minimales Dokument in allen drei Sprachen. Diese Modulausführung ist kein visueller Dateiaufruf im Browser.
- `python tests/browser-smoke.py`: vollständiger Durchlauf von Prolog und Fluss in Chromium auf Deutsch, Englisch und ägyptischem Arabisch. Fehlversuche, Hilfen, Dialoge, Notizbuch, Export, bestätigter Import alter Spielstände und Fortsetzung nach Neuladen geprüft. Sprachwechsel lässt den Spielfortschritt unverändert.
- Echtes Offline-Neuladen über den Service Worker in allen drei Browserdurchläufen; das Flussrätsel einschließlich zwischengespeicherter Befestigung und Überquerung wurde bei abgeschaltetem Netzwerk abgeschlossen.
- Ansichten bei 320 und 390 CSS-Pixel Breite ohne horizontalen Überlauf; deutscher Desktopdurchlauf bei 1440 Pixeln. Arabische Leserichtung, sichtbare Texte und zugängliche Beschriftungen geprüft; Screenshots der Desktop- und mobilen Flussansicht visuell kontrolliert.
- Tastatureinstieg und Dialogschließen mit Escape geprüft. Fokus bleibt bei wiederholten Aktionen im Fluss erhalten. Sitzung mit blockierter lokaler Speicherung bleibt spielbar und umschaltbar.

## Offene Prüfungen und bekannte Grenzen

- Kein Test auf einem echten iPhone. Safari-Installation, Offline-Neuladen und tatsächliche Touchbedienung bleiben offen. Chromium mit schmalem Fenster ersetzt diese Geräteprüfung nicht.
- Die ägyptisch-arabischen Texte benötigen noch eine muttersprachliche Qualitätsprüfung; der Nutzer hat natürlichen ägyptischen Dialekt für Dialoge und Erzähltexte festgelegt.
- Direkter Browseraufruf der exportierten HTML-Datei per file:// wird in dieser Umgebung mit ERR_BLOCKED_BY_ADMINISTRATOR abgelehnt. Die Richtlinie wurde nicht umgangen. Erzeugung, Einbettung und Skriptsyntax der Einzeldatei wurden geprüft; ihr direkter Browserbetrieb am Laptop bleibt separat zu prüfen.
- Keine unabhängige Messung der tatsächlichen Spieldauer. Ziel für das vollständige Level: 15–30 Minuten.
- Spielstände bleiben gerätelokal; keine automatische Synchronisierung.
- Die Übergabe-Hashliste bleibt eine unveränderte Momentaufnahme von Prolog 0.1. Abweichungen durch diese absichtliche Weiterentwicklung sind erwartbar.

## Noch nicht implementiert / nächster Schritt

Als Nächstes: Quellgarten mit Hüter, sechs drehbaren Kanalplatten und sichtbarer Wiederbewässerung. Den aktuellen Flussabschluss anschließen und neue Texte unmittelbar in allen drei Sprachen pflegen. Danach Blütenkammer, Rückweg und gemeinsames Heilungsfinale. Level 2–7 bleiben Konzeptentwürfe; Ton und Musik sind nicht implementiert.

## Arbeitsablauf und Chatübergabe

Der Assistent übernimmt künftig Commit und Push abgeschlossener Arbeitspakete sowie die Pflege der Übergabe. Verbindlicher Ablauf: WORKFLOW.md, Einstieg über AGENTS.md. Den nächsten Chatwechsel nach dem Quellgarten selbst ankündigen und den passenden Prompt in CODEX_STARTPROMPT.md speichern und direkt ausgeben.
