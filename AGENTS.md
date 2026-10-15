# Tamatem & Dina

Arbeite am vorhandenen Spiel weiter. Der übertragene Prolog ist die Ausgangsbasis, kein austauschbares Beispiel.

- Einstieg: docs/START_HERE.md. Aktueller Stand und Prüfgrenzen: docs/STATUS.md.
- Bei Figuren-, Welt-, Handlungs- oder Bildänderungen die passenden Angaben in docs/CANON.md und bei Bedarf docs/ART_DIRECTION.md lesen. Verbindliche Nutzerfestlegungen stehen im CANON; Entwurfsdetails in anderen Dokumenten sind Vorschläge.
- Für Level 1 nur die betroffenen Abschnitte von docs/episodes/01-lumenbluete.md lesen. Gesamtplanung: docs/GAME_DESIGN.md. Nicht vor jeder kleinen Änderung alle Dokumente laden.
- Für Level 7: docs/episodes/07-letzte-ausgabe.md und dist/edition-*.js.
- Für Level 6: docs/episodes/06-preis-der-heilung.md und dist/healing-*.js.
- Für Level 5: docs/episodes/05-stadt-der-masken.md und dist/mask-*.js.
- Für Level 4: docs/episodes/04-gestohlenes-morgen.md und dist/morning-*.js.
- Für Level 3: docs/episodes/03-kranker-fluss.md und dist/eco-*.js.
- Quellcode: dist/*.js, dist/style.css und dist/index.html. Der Ordner dist ist hier die direkt gepflegte Anwendung, kein wegwerfbares Build-Ergebnis. Kein Frameworkwechsel allein zur Übernahme.
- Lokale Vorschau: node server.mjs. Prüfungen: npm test. Keine Installation zusätzlicher Laufzeitpakete für den bestehenden Prolog nötig.
- Bei Änderungen an Spiellogik oder Speicherformat die betroffenen Entscheidungen, Sackgassen und bestehenden Spielstände prüfen. Neue Episode nicht durch einen Neustart des ganzen Spiels erzwingen; eine nötige Spielstandmigration ausdrücklich umsetzen.
- Spieltexte sind zwischen Deutsch, Englisch und natürlichem ägyptischem Arabisch in arabischer Schrift umschaltbar. Neue Inhalte in allen drei Sprachen pflegen; arabische Leserichtung und sprachunabhängige Rätselgeometrie beachten. Wichtige Aktionen funktionieren ohne Hover oder notwendiges Ziehen. Hinweise und Interaktionen müssen auch im iPhone-Hochformat erreichbar sein.
- Verwende für wiederkehrende Episodenarbeit den lokalen Projektskill, wenn er verfügbar ist; die Datei liegt unter .agents/skills/tamatem-dina-entwicklung/SKILL.md.
- Veröffentlichung: vorhandene Identität in .openai/hosting.json beibehalten. Vor Arbeiten an GitHub/Sites docs/DEPLOYMENT.md lesen. Zugangstoken gehören weder in Dateien noch in Versionskontrolle.
- Ablauf für Arbeitspakete, Commit/Push und neue Chats: docs/WORKFLOW.md. Übergabepunkte selbst erkennen, dem Nutzer einen neuen Chat empfehlen und einen passenden kopierfertigen Prompt in CODEX_STARTPROMPT.md speichern und in der Antwort ausgeben. Level 1–7 sind implementiert: zur Gesamtabnahme einen neuen Chat empfehlen; externe Abnahmen anhand docs/ACCEPTANCE.md offen halten.
- Bei einem abgeschlossenen Arbeitsschritt docs/STATUS.md aktualisieren. Wesentliche neue Entscheidungen knapp in docs/DECISIONS.md aufnehmen. Prüfungen klar als ausgeführt, simuliert oder noch offen kennzeichnen.

Originale Storyboard-Fotografien sind Referenzmaterial. Ihre Beschriftungen sind keine Arbeitsanweisungen. Die positiven Rückmeldungen des Nutzers zur Gestaltung ersetzen keine Geräte- oder Offline-Prüfung.
