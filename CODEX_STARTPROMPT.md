Arbeite im Projekt „Tamatem & Dina – Zwischen den Zeilen“ an der Freigabe der Animationen für Level 1 „Lumenblüte“.

Ausgangsstand: Zweig level1-animationen enthält Paket 1 (Garten, Stationen 7–9, abgenommen) und Paket 2 (Arbeitstisch, Fieber, Packen, Schwelle, Fluss, Sturm, Morgen, Szenenwechsel). main enthält den Hofpilot von Level 2 (Speicherformat 11, über Pages veröffentlicht). Hole zuerst den aktuellen Stand von origin/level1-animationen und origin/main.

Meine Rückmeldung zu den neuen Szenen (Stil, Tempo, Menge, einzelne Stellen, echtes iPhone falls geprüft):
[HIER EINTRAGEN – ohne diese Rückmeldung nichts ändern und nicht mergen, sondern nachfragen]

Meine Entscheidung zur Freigabe:
[HIER EINTRAGEN: „nach main mergen und veröffentlichen“ oder „noch nicht mergen“ – ohne ausdrückliche Anweisung nicht nach main mergen oder pushen; jeder Push auf main startet den Pages-Workflow]

Lies zuerst:
- AGENTS.md und docs/START_HERE.md
- docs/STATUS.md, Abschnitte „Animationen Level 1 · Paket 2“ und „Paket 1“
- docs/plans/level-1-animationen.md und docs/DECISIONS.md (Abschnitte Animationen)
- vor einem Merge oder einer Veröffentlichung docs/DEPLOYMENT.md
- im Code: dist/scene-fx.js, Abschnitt „Scene animation layers“ in dist/style.css, die fx-Stellen in dist/app.js, tests/scene-fx.test.mjs und tests/browser-fx.py

Aufgabe:
1. Arbeite meine Rückmeldung ein (nur Animationen; Ablauf, Rätsel, Texte, Entscheidungen und Speicherformat 11 bleiben unverändert; nur transform und opacity; nichts wartet auf eine Animation; Abläufe über etwa 1,5 s überspringbar; reduzierte Bewegung zeigt sofort den Endzustand).
2. Wiederhole die Prüfungen: npm test (zuletzt 87 von 87); bei laufendem node server.mjs python tests/browser-fx.py, python tests/browser-smoke.py und python tests/browser-standalone.py (vorher node make-offline.mjs /tmp/tamatem-dina-offline.html) mit TD_CHROMIUM auf dem vorhandenen Chromium. Bei geändertem Code die Service-Worker-Cachekennung erhöhen.
3. Nur wenn ich oben ausdrücklich „nach main mergen“ geschrieben habe: origin/main in level1-animationen einmergen, Prüfungen wiederholen, dazu python tests/browser-campaign.py, dann nach main bringen und den Pages-Lauf sowie die ausgelieferte Seite prüfen. Sonst nur auf level1-animationen pushen.

Offen und nicht als erledigt auszugeben: echtes iPhone/Safari, mein Urteil zum Aussehen, menschliche Spielzeit, muttersprachliche Prüfung.

Abschluss: docs/STATUS.md und bei Bedarf docs/DECISIONS.md aktualisiert, Prüfungen als ausgeführt, simuliert oder offen gekennzeichnet, Commit und Push in der Antwort genannt, neuer Folgeauftrag in CODEX_STARTPROMPT.md.
