# Tamatem & Dina – Zwischen den Zeilen

Entwicklungsfassung 0.9 · 15. Oktober 2026 · Level 1–6 vollständig spielbar

Ein Comic- und Point-and-Click-Abenteuer für Erwachsene, wahlweise auf Deutsch, Englisch und ägyptischem Arabisch. Geplant sind sieben Episoden von Tamatems sechstem bis achtzehntem Lebensjahr. Level 1 ist vom gemeinsamen Arbeitstisch bis zum Heilungsfinale vollständig spielbar. Level 2 schließt ohne Neustart an: ein realistischer journalistischer Kleinstadtfall mit dem achtjährigen Tamatem und spielbarer Dina. Level 3 ergänzt Umweltrecherche mit dem zehnjährigen Tamatem, fantastischer Quelle und spielbarer Korrektur seiner öffentlichen Beschuldigung. Level 4 führt als realistischer Recherchethriller mit zwölfjährigem Tamatem und eigenständiger Dina-Recherche über falsche Beschuldigung, Uhrvergleich, Gruppendruck und begrenzte Veröffentlichung weiter. Level 5 führt durch eine surreale Papierstadt mit vierzehnjährigem Tamatem, eigenständiger Dina-Recherche und spielbaren Bildregeln bis zur sichtbaren Korrektur des eigenen Beitrags. Level 6 verbindet mit sechzehnjährigem Tamatem medizinische Studiengrenzen und nachvollziehbare Liefer-/Vertragsbelege; Dina schützt eigenständig eine Quelle und verantwortet die begrenzte Ausgabe.

Private Entwicklungsablage: [TimonNetzel/tamatem-dina](https://github.com/TimonNetzel/tamatem-dina). Hauptzweig: main. Die bestehende Sites-Adresse bleibt der Veröffentlichungsweg.

## In Codex übernehmen

1. Diesen Ordner an einem dauerhaften Ort aufbewahren. Der richtige Projektordner enthält diese README, AGENTS.md, dist, docs und tests.
2. In Codex ein lokales Projekt mit diesem Ordner anlegen beziehungsweise den Ordner einem Projekt hinzufügen und zum primären Ordner machen. Die genaue Bezeichnung kann je nach App-Version variieren.
3. Einen neuen Chat in diesem Projekt öffnen und den Inhalt von CODEX_STARTPROMPT.md verwenden. Der alte Chat wird dafür nicht benötigt.

Das Projekt ist lokal bereits vollständig vorhanden und hat ein eigenes Git-Repository mit GitHub als origin. Auf einem anderen Rechner das private Repository klonen und den geklonten Ordner in Codex öffnen. Die frühere ZIP-Datei ist die Übergabesicherung vor der GitHub-Einrichtung; aktuelle Projektdateien kommen aus GitHub.

## Wo beginnen?

- [Kurzer Einstieg](docs/START_HERE.md)
- [Aktueller Entwicklungsstand](docs/STATUS.md)
- [Verbindliche Figuren- und Weltregeln](docs/CANON.md)
- [Startprompt](CODEX_STARTPROMPT.md)
- [GitHub- und Sites-Übergang](docs/DEPLOYMENT.md)

## Vorhandene Spielversion

[Private Spieladresse](https://tamatem-dina-zwischen-den-zeilen.timonnetzel.chatgpt.site)

Die private Adresse enthält seit 15. Oktober 2026 Version 0.8 mit allen fünf vollständigen dreisprachigen Leveln. Der veröffentlichte Spielcode entspricht dem geprüften GitHub-Stand d9a7f72. Alle bisherigen Inhalte und Spielstände bleiben erhalten. GitHub und Sites bleiben getrennte Schritte. Die Entwicklung enthält zusätzlich Level 6 (0.9), noch nicht bei Sites veröffentlicht. Level 7 ist Konzeptentwurf. Eine unabhängige Zeitmessung liegt nicht vor.

## Lokal ausführen

Benötigt wird eine aktuelle Node.js-Laufzeit. Der bestehende Code benötigt keine zusätzlichen Bibliotheken und keinen Build-Schritt.

    node server.mjs

Danach ist die Vorschau unter http://127.0.0.1:4173 erreichbar. Der Server bindet an den eigenen Rechner; diese Adresse ist auf dem iPhone kein Link zum Laptop.

    npm test

Die 62 automatischen Einzelprüfungen (zehn Testdateien) decken Spielregeln, alte Spielstände, Übersetzungen, Offline-Cache und HTML-Export ab. Zusätzliche Browserprüfung mit installiertem Python-Playwright und Chromium gegen den laufenden Server: `python tests/browser-smoke.py` für die bisherigen Level und `python tests/browser-eco.py` für Level 3, `python tests/browser-morning.py` für Level 4 und `python tests/browser-legacy.py` für historische Feldsätze 1–7; `python tests/browser-mask.py` prüft Level 5 mit tatsächlichem Offline-Spiel.

Die ursprüngliche Übergabe-Momentaufnahme prüft:

    node scripts/verify-handoff.mjs

Die Hashliste ist eine Momentaufnahme der Übergabe. Nach absichtlichen Änderungen muss sie nicht als dauerhafte Testanforderung weitergeführt werden.

## Offline-Fassung erzeugen

    node make-offline.mjs ABSOLUTER_AUSGABEPFAD

Der Zielname sollte auf .html enden. Die erzeugte Einzeldatei enthält alle 16 Bilder und alle drei Sprachen und die Spiellogik und ist für das direkte Öffnen am Laptop gedacht. Große erzeugte Einzeldateien und ZIP-Dateien gehören in Veröffentlichungen oder einen Ausgabeordner, nicht bei jeder Änderung erneut in Git.

Auf dem iPhone ist die Web-App über Safari und den Home-Bildschirm vorgesehen. Vor dem Offline-Spielen vollständig laden und auf „Offline bereit“ warten. Chromium-Durchläufe mit tatsächlichem Offline-Neuladen wurden bestanden. Eine echte iPhone-Prüfung steht aus. Der direkte Dateiaufruf der HTML wurde hier durch eine Browserrichtlinie blockiert; technische Exportprüfung und echter Service-Worker-Offline-Betrieb sind davon getrennte Nachweise.

## Was das Paket enthält

Ausführbarer Code, Tests, Bilddateien, Original-Storyboards, Figurenreferenz, vollständige Bildprompts, Spiel- und Episodenkonzept, Projektgedächtnis, Arbeitsregeln und einen projektspezifischen Skill. Die Sites-ID ist zur Fortführung enthalten; kurzlebige Zugangstoken und ursprüngliche .git-Konfiguration werden nicht übertragen.

Das private GitHub-Repository wurde mit ausdrücklicher Erlaubnis des Nutzers eingerichtet. Ein Codex-Projekt muss weiterhin mit dem lokalen Ordner beziehungsweise dem Klon verbunden werden. Der ursprüngliche Sites-Arbeitsordner mit seiner Git-Historie bleibt erhalten. Dessen letzter veröffentlichter Commit ist in docs/DEPLOYMENT.md dokumentiert.

## Dokumentation der verwendeten Codex-Funktionen

- [Lokale Projekte](https://learn.chatgpt.com/docs/projects?surface=app)
- [Projektskills und ihre Erkennung](https://learn.chatgpt.com/docs/build-skills)

Die Projektanweisungen gelten direkt über AGENTS.md. Falls der Skill nach dem Öffnen nicht erscheint, Codex neu laden beziehungsweise den Skill im neuen Projektchat ausdrücklich über seinen Dateipfad lesen lassen.
