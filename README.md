# Tamatem & Dina – Zwischen den Zeilen

Entwicklungsfassung 0.5 · 15. Oktober 2026 · Level 1 und 2 vollständig spielbar

Ein Comic- und Point-and-Click-Abenteuer für Erwachsene, wahlweise auf Deutsch, Englisch und ägyptischem Arabisch. Geplant sind sieben Episoden von Tamatems sechstem bis achtzehntem Lebensjahr. Level 1 ist vom gemeinsamen Arbeitstisch bis zum Heilungsfinale vollständig spielbar. Level 2 schließt ohne Neustart an: ein realistischer journalistischer Kleinstadtfall mit dem achtjährigen Tamatem und spielbarer Dina.

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

Die private Adresse zeigt seit 15. Oktober 2026 Version 0.5 mit beiden Leveln. Entwicklungsfassung 0.5 enthält das vollständige dreisprachige Level 1: Prolog, Fluss, Quellgarten, Blütenkammer, Rückweg und gemeinsames Finale mit notwendigem spielbarem Beitrag von Dina. Level 2 ergänzt Adressvergleich, Interviews, Zeitachse und redaktionelle Korrektur. Die private Veröffentlichung wurde erfolgreich bestätigt. Level 3–7 sind Konzeptentwürfe. Eine unabhängige Zeitmessung liegt nicht vor.

## Lokal ausführen

Benötigt wird eine aktuelle Node.js-Laufzeit. Der bestehende Code benötigt keine zusätzlichen Bibliotheken und keinen Build-Schritt.

    node server.mjs

Danach ist die Vorschau unter http://127.0.0.1:4173 erreichbar. Der Server bindet an den eigenen Rechner; diese Adresse ist auf dem iPhone kein Link zum Laptop.

    npm test

Die 39 automatischen Prüfungen decken Spielregeln, alte Spielstände, Übersetzungen, Offline-Cache und HTML-Export ab. Zusätzliche Browserprüfung mit installiertem Python-Playwright und Chromium gegen den laufenden Server: `python tests/browser-smoke.py`.

Die ursprüngliche Übergabe-Momentaufnahme prüft:

    node scripts/verify-handoff.mjs

Die Hashliste ist eine Momentaufnahme der Übergabe. Nach absichtlichen Änderungen muss sie nicht als dauerhafte Testanforderung weitergeführt werden.

## Offline-Fassung erzeugen

    node make-offline.mjs ABSOLUTER_AUSGABEPFAD

Der Zielname sollte auf .html enden. Die erzeugte Einzeldatei enthält alle elf Bilder und alle drei Sprachen und die Spiellogik und ist für das direkte Öffnen am Laptop gedacht. Große erzeugte Einzeldateien und ZIP-Dateien gehören in Veröffentlichungen oder einen Ausgabeordner, nicht bei jeder Änderung erneut in Git.

Auf dem iPhone ist die Web-App über Safari und den Home-Bildschirm vorgesehen. Vor dem Offline-Spielen vollständig laden und auf „Offline bereit“ warten. Chromium-Durchläufe mit tatsächlichem Offline-Neuladen wurden bestanden. Eine echte iPhone-Prüfung steht aus. Der direkte Dateiaufruf der HTML wurde hier durch eine Browserrichtlinie blockiert; technische Exportprüfung und echter Service-Worker-Offline-Betrieb sind davon getrennte Nachweise.

## Was das Paket enthält

Ausführbarer Code, Tests, Bilddateien, Original-Storyboards, Figurenreferenz, vollständige Bildprompts, Spiel- und Episodenkonzept, Projektgedächtnis, Arbeitsregeln und einen projektspezifischen Skill. Die Sites-ID ist zur Fortführung enthalten; kurzlebige Zugangstoken und ursprüngliche .git-Konfiguration werden nicht übertragen.

Das private GitHub-Repository wurde mit ausdrücklicher Erlaubnis des Nutzers eingerichtet. Ein Codex-Projekt muss weiterhin mit dem lokalen Ordner beziehungsweise dem Klon verbunden werden. Der ursprüngliche Sites-Arbeitsordner mit seiner Git-Historie bleibt erhalten. Dessen letzter veröffentlichter Commit ist in docs/DEPLOYMENT.md dokumentiert.

## Dokumentation der verwendeten Codex-Funktionen

- [Lokale Projekte](https://learn.chatgpt.com/docs/projects?surface=app)
- [Projektskills und ihre Erkennung](https://learn.chatgpt.com/docs/build-skills)

Die Projektanweisungen gelten direkt über AGENTS.md. Falls der Skill nach dem Öffnen nicht erscheint, Codex neu laden beziehungsweise den Skill im neuen Projektchat ausdrücklich über seinen Dateipfad lesen lassen.
