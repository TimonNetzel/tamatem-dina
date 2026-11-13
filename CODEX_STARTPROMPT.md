Arbeite im Projekt „Tamatem & Dina – Zwischen den Zeilen“ an hübschen Animationen für Level 1 „Lumenblüte“.

Ausgangsstand: main enthält den Hofpilot von Level 2 (Speicherformat 11, Mergecommit ab8a8cd, über Pages veröffentlicht) und bleibt so. Lege den Arbeitszweig level1-animationen ab origin/main an und merge origin/claude/serene-allen-2fw6gh hinein (Stand be10d84 oder neuer; enthält den reparierten Einzeldatei-Test und den Plan). Arbeite nur auf diesem Zweig.

Lies zuerst:
- AGENTS.md und docs/START_HERE.md
- docs/plans/level-1-animationen.md (verbindlicher Plan mit meinen Festlegungen)
- docs/episodes/01-lumenbluete.md, nur Stationen 7–9 und Rätsel C
- bei Bildfragen docs/CANON.md und docs/ART_DIRECTION.md
- im Code: die Gartenszene und das Kanalrätsel in dist/app.js, dist/style.css, dist/sw.js, tests/garden.test.mjs

Aufgabe (nur Paket 1 des Plans):
1. Baue die gemeinsame Animationsgrundlage (CSS/SVG-Ebenen über den vorhandenen Bildern).
2. Animiere die Pilotszene Garten: Garten ohne Wasser, Kanalrätsel, Bewässerung mit Wechsel von trocken zu nass, Blütenkammer.
3. Zeig mir das Ergebnis mit Screenshots (Laptop und 390 px Hochformat) und sag mir, wie ich es lokal ansehen kann. Danach wartest du auf meine Rückmeldung zu Stil, Tempo und Menge, bevor du weitere Szenen animierst.

Einschränkungen:
- Nur Animationen: Ablauf, Rätsel, Texte, Entscheidungen und Speicherformat 11 bleiben unverändert. Level 1–7 und Spielstände 1–11 erhalten.
- Keine neuen PNG-Bilder, keine neuen Laufzeitpakete, kein Frameworkwechsel.
- Keine Aktion darf auf eine Animation warten müssen; längere Abläufe überspringbar; bei reduzierter Bewegung sofort der Endzustand; jede Information zusätzlich im Text.
- Deutsch, Englisch, ägyptisches Arabisch; RTL und iPhone-Hochformat (320/390 px) ohne horizontales Auslaufen.
- Nicht nach main mergen oder pushen, keinen Pages-Workflow starten, nichts veröffentlichen, solange ich das nicht ausdrücklich sage. Auf level1-animationen darfst du pushen.

Prüfungen:
- npm test (zuletzt 82 von 82)
- Browserlauf für Level 1 bei laufendem node server.mjs: drei Sprachen, 1440/390/320, mit und ohne reduzierte Bewegung, Neuladen mitten in einer Animation, offline
- python tests/browser-smoke.py und python tests/browser-standalone.py mit TD_CHROMIUM auf dem vorhandenen Chromium

Offen und nicht als erledigt auszugeben: echtes iPhone/Safari, mein Urteil zum Aussehen, menschliche Spielzeit.

Abschluss: docs/STATUS.md und bei Bedarf docs/DECISIONS.md aktualisiert, Prüfungen als ausgeführt, simuliert oder offen gekennzeichnet, Commit auf level1-animationen gepusht und in der Antwort genannt, neuer Folgeauftrag für Paket 2 in CODEX_STARTPROMPT.md.
