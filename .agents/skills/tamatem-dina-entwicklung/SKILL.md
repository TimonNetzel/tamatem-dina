---
name: tamatem-dina-entwicklung
description: Entwickle Episoden, Dialoge, Rätsel oder Bildbriefings im vorhandenen Projekt Tamatem und Dina weiter und halte den Entwicklungsstand nachvollziehbar. Für wiederkehrende Spielentwicklung in diesem Repository, nicht für allgemeine Unterrichts- oder Dokumentaufgaben.
---

# Tamatem & Dina weiterentwickeln

Den vorhandenen Spielstand fortführen. Als Projektwurzel gilt der Ordner mit AGENTS.md, docs und dist; nicht von der persönlichen Verzeichnisstruktur des ursprünglichen Rechners ausgehen.

## Gezielt nachlesen

- Einstieg und Übergabe: docs/START_HERE.md und docs/STATUS.md.
- Figuren, Geschichten und Bilder: die passenden Abschnitte von docs/CANON.md; Bildreferenz art/references/character-sheet-v1.png. Für neue Kunst die Referenz ansehen und den verfügbaren Bildgenerierungsworkflow verwenden.
- Level 1: nur die betroffenen Stationen und Rätsel in docs/episodes/01-lumenbluete.md. Spätere Episoden zunächst im GAME_DESIGN suchen.
- Spiellogik, Speicherung und Offline: docs/ARCHITECTURE.md und betroffene Dateien in dist sowie tests.
- GitHub und Veröffentlichung: docs/DEPLOYMENT.md. Verfügbarkeit und aktuelle Anleitung des jeweiligen Werkzeugs prüfen.

## Episodenarbeit

Eine äußere Aufgabe und einen konkreten Schritt in Tamatems Entwicklung verbinden. Bei vollständigen Episoden alle zwölf Stationen der Heldenreise planen; für einen kleinen Anschluss nur die betroffenen Stationen ausarbeiten. Dina braucht eigene Handlungsmöglichkeiten. Zwischen Fantastik und Realismus den gewählten Episodenrahmen einhalten.

Bei Rätseln Ausgangszustand, sichtbare Hinweise, gültige Handlungen, Lösung, Fehlversuche, Hilfen und gespeicherte Zustände festlegen. Bestehende Entscheidungen und Gegenstände weiterführen. Vorhandene Spielstände bei neuen Abschnitten berücksichtigen.

Bei Bildern die bestätigten Figurenmerkmale und Referenzbilder verwenden. Dialoge und notwendige Bedienbeschriftungen als echten Text in der Anwendung halten. Bilder und verwendete Prompts im Projekt speichern; keine generierten Assets nur in einem persönlichen Zwischenspeicher belassen.

## Abschluss

Betroffene Funktionen sinnvoll prüfen. Bei Zustands- oder Offline-Änderungen die vorhandenen Tests verwenden und bei neuen relevanten Fehlerfällen ergänzen. Eine Simulation, eine tatsächliche Browserprüfung und ein Test auf einem echten iPhone sind unterschiedliche Nachweise.

docs/STATUS.md um Ergebnis, tatsächlich ausgeführte Prüfungen, offene Punkte und nächste Aufgabe aktualisieren. Neue wesentliche Entscheidungen knapp in DECISIONS.md festhalten. Keine Kopie des gesamten Chatverlaufs oder des gesamten Figurenkanons im Skill anlegen.
