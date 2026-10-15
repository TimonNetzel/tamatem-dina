# Arbeitspakete, Git-Sicherung und Chatübergaben

Vom Nutzer am 15. Oktober 2026 gewünschter Ablauf. Der Assistent übernimmt die Dateipflege sowie Commit und Push abgeschlossener Arbeitspakete. Ein Push veröffentlicht die spielbare Site nicht.

## Während eines Arbeitspakets

- Vorhandenen Checkout nutzen, Git-Status prüfen und bestehende Nutzeränderungen erhalten. Nur die für die konkrete Aufgabe nötigen Projektdateien lesen.
- Ein klar begrenztes spielbares Ergebnis umsetzen, einschließlich der drei Sprachen, bestehender Spielstände und Offline-Unterstützung. Relevante Prüfungen ausführen; simulierte, reale und offene Prüfungen unterscheiden.
- Nach Abschluss STATUS.md aktualisieren; wesentliche neue Entscheidungen in DECISIONS.md festhalten. Keine Gesprächsprotokolle anhäufen.
- Die zum Paket gehörenden Änderungen mit einer verständlichen Commitnachricht sichern und zu origin pushen. Beim vereinbarten Hauptzweig main vorab den Remote-Stand prüfen und ausschließlich ohne Force-Push arbeiten. Bei parallelen Änderungen zuerst sauber integrieren; keine Nutzerarbeit überschreiben. Einen fehlgeschlagenen Push als offen melden, nicht als GitHub-Sicherung ausgeben.
- Im Abschluss nennen: Ergebnis, Prüfung, Commit, Zielzweig, bestätigter Push oder konkreter Blocker, nächste Aufgabe. GitHub-Sicherung und Sites-Veröffentlichung getrennt ausweisen.

## Wann einen neuen Chat vorschlagen?

Der Assistent beurteilt dies nach jedem abgeschlossenen Arbeitspaket und sagt dem Nutzer ausdrücklich Bescheid. Nicht darauf warten, dass der Nutzer das Kontextfenster überwacht; seine exakte verbleibende Größe muss dafür nicht bekannt sein.

- Vor dem Beginn eines neuen Levels einen neuen Chat empfehlen.
- Innerhalb eines größeren Levels an einer abgeschlossenen Szene oder Rätselkette wechseln, wenn bereits umfangreiche Implementierung, Fehlersuche und mehrere Themen im Chat liegen.
- Beim Übergang von Umsetzung zu einer größeren Gesamtabnahme kann ein eigener Chat sinnvoll sein.
- Zuerst den laufenden Schritt stabil abschließen und die Übergabe sichern. Bei einem externen Blocker stattdessen den genauen Zwischenstand und den Blocker festhalten.

Aktueller Übergabepunkt: Level 1–5 sind in Entwicklungsfassung 0.8 vollständig spielbar. Prüfgrenzen stehen in STATUS.md. Vor Level 6 einen neuen Chat beginnen; der passende Prompt steht in CODEX_STARTPROMPT.md. Die bestehende private Site zeigt weiterhin 0.5 mit zwei Leveln. GitHub-Push und eine spätere Sites-Veröffentlichung bleiben getrennte Schritte.

## Übergabe vorbereiten

1. STATUS.md enthält tatsächlich umgesetzten Stand, Prüfungen, Grenzen und den nächsten konkreten Schritt. Architektur- und Episodendokumente bei relevanten Änderungen aktualisieren.
2. CODEX_STARTPROMPT.md auf die nächste Aufgabe zuschneiden. Den nötigen Zweig oder Commit nennen; keine vergänglichen Sitzungskennungen, Zugangsdaten oder Abhängigkeit vom alten Chat aufnehmen.
3. Umsetzung und Übergabedokumente committen und pushen; den erfolgreichen Remote-Stand prüfen. Den bestätigten Commit in der Chatantwort nennen, damit kein zusätzlicher Dokumentationscommit für die eigene Commit-ID nötig wird.
4. Im Abschluss ausdrücklich einen neuen Chat empfehlen und den kopierfertigen Prompt direkt ausgeben. Zusätzlich auf die gespeicherte Promptdatei verweisen.
5. Der Nutzer öffnet den neuen Chat und wählt das Repository mit dem gesicherten Stand. Der Assistent behauptet nicht, selbstständig ein neues Chatfenster erstellt zu haben.

Ein Übergabeprompt nennt das konkrete Ziel, die zuerst zu lesenden Dateien, wichtige Einschränkungen, passende Prüfungen und ein klares Abschlusskriterium. Er verweist für Details auf das Repository, statt den gesamten Verlauf zu kopieren.
