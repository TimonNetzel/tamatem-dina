Arbeite im Projekt „Tamatem & Dina – Zwischen den Zeilen“ an den Animationen für Level 1 „Lumenblüte“ weiter (Paket 2 des Plans).

Ausgangsstand: Zweig level1-animationen enthält Paket 1 (Animationsgrundlage dist/scene-fx.js, Pilotszene Garten mit Stationen 7–9). main enthält den Hofpilot von Level 2 (Speicherformat 11, über Pages veröffentlicht) und bleibt so. Arbeite nur auf level1-animationen; hole zuerst den aktuellen Stand von origin/level1-animationen.

Meine Rückmeldung zur Pilotszene (Stil, Tempo, Menge):
[HIER EINTRAGEN – ohne diese Rückmeldung nicht mit weiteren Szenen beginnen, sondern nachfragen]

Lies zuerst:
- AGENTS.md und docs/START_HERE.md
- docs/STATUS.md, Abschnitt „Animationen Level 1 · Paket 1“
- docs/plans/level-1-animationen.md (verbindlicher Plan, Tabelle Paket 2)
- docs/episodes/01-lumenbluete.md, nur die jeweils betroffenen Stationen
- bei Bildfragen docs/CANON.md und docs/ART_DIRECTION.md
- im Code: dist/scene-fx.js, der Abschnitt „Scene animation layers“ in dist/style.css, die fx-Stellen in dist/app.js, tests/scene-fx.test.mjs und tests/browser-fx.py

Aufgabe:
1. Arbeite zuerst meine Rückmeldung in die Pilotszene ein (Garten, Kanalrätsel, Bewässerung, Blütenkammer).
2. Animiere dann die übrigen Szenen von Level 1 im abgenommenen Stil mit den vorhandenen Bausteinen: Arbeitstisch, Fieber/Rucksack/Dinas Vorbereitung, Schwelle, Fluss, Sturm und kippendes Licht, Morgen, dazu kurze Überblendungen beim Szenenwechsel.
3. Zeig mir das Ergebnis mit Screenshots (Laptop und 390 px Hochformat) und kurzen Bewegungsmitschnitten.

Einschränkungen:
- Nur Animationen: Ablauf, Rätsel, Texte, Entscheidungen und Speicherformat 11 bleiben unverändert. Level 1–7 und Spielstände 1–11 erhalten.
- Keine neuen PNG-Bilder, keine neuen Laufzeitpakete, kein Frameworkwechsel.
- Nur transform und opacity; keine Aktion wartet auf eine Animation; Abläufe über etwa 1,5 s überspringbar; bei reduzierter Bewegung sofort der Endzustand; jede Information zusätzlich im Text.
- Deutsch, Englisch, ägyptisches Arabisch; RTL und iPhone-Hochformat (320/390 px) ohne horizontales Auslaufen.
- Nicht nach main mergen oder pushen, keinen Pages-Workflow starten, nichts veröffentlichen, solange ich das nicht ausdrücklich sage. Auf level1-animationen darfst du pushen.

Prüfungen:
- npm test (zuletzt 85 von 85); tests/scene-fx.test.mjs um die neuen Szenen ergänzen
- bei laufendem node server.mjs: python tests/browser-fx.py auf die neuen Szenen erweitern (drei Sprachen, 1440/390/320, mit und ohne reduzierte Bewegung, Neuladen mitten in einer Animation, offline)
- python tests/browser-smoke.py und python tests/browser-standalone.py (vorher node make-offline.mjs /tmp/tamatem-dina-offline.html) mit TD_CHROMIUM auf dem vorhandenen Chromium
- Service-Worker-Cachekennung erhöhen

Offen und nicht als erledigt auszugeben: echtes iPhone/Safari, mein Urteil zum Aussehen, menschliche Spielzeit, muttersprachliche Prüfung.

Abschluss: docs/STATUS.md und bei Bedarf docs/DECISIONS.md aktualisiert, Prüfungen als ausgeführt, simuliert oder offen gekennzeichnet, Commit auf level1-animationen gepusht und in der Antwort genannt, Folgeauftrag (Freigabe und Merge nach main nur auf meine ausdrückliche Anweisung) in CODEX_STARTPROMPT.md.
