# Startprompt für den ersten Codex-Projektchat

Den folgenden Text in einem neuen Chat verwenden, der diesen Ordner als primären lokalen Projektordner nutzt.

---

Übernimm die Weiterentwicklung des vorhandenen Spiels „Tamatem & Dina – Zwischen den Zeilen“. Dies ist die Übergabe eines bereits spielbaren Prologs, kein Auftrag für einen Neubau.

Lies AGENTS.md, docs/START_HERE.md und docs/STATUS.md. Lies anschließend nur die weiteren Dateien, die für die konkrete Aufgabe nötig sind. Verwende den lokalen Projektskill unter .agents/skills/tamatem-dina-entwicklung/SKILL.md, wenn er verfügbar ist. Verbindliche Figuren- und Weltvorgaben stehen in docs/CANON.md.

Das private GitHub-Repository https://github.com/TimonNetzel/tamatem-dina ist eingerichtet; verwende den vorhandenen Projektordner oder einen Klon davon. Prüfe den Git-Status und origin. Führe die zwölf Tests mit node --test tests/story.test.mjs tests/offline.test.mjs aus und prüfe die lokale Startfähigkeit. Die Übergabe-Momentaufnahme lässt sich vor Änderungen zusätzlich mit node scripts/verify-handoff.mjs prüfen; nach absichtlicher Weiterentwicklung können die dokumentierten Hashes abweichen. Der richtige Arbeitsordner ist die Wurzel dieses Spielrepositories.

Erhalte die bestätigten Figuren, Bilder, deutschen Texte und vorhandenen Spielstände. Die bestehende private Sites-ID in .openai/hosting.json bleibt erhalten; Details stehen in docs/DEPLOYMENT.md. Falls benötigte Werkzeuge fehlen, benenne die konkrete Grenze und arbeite an den unabhängigen Teilen weiter.

Schließe zunächst die Übernahmeprüfung ab. Aktualisiere docs/STATUS.md mit den tatsächlich ausgeführten Prüfungen und berichte knapp, ob das Projekt vollständig übernommen wurde. Der nächste inhaltliche Schritt ist eine zulässige visuelle Prüfung des vorhandenen Prologs und anschließend die Fortsetzung am Fluss nach docs/episodes/01-lumenbluete.md. Neue Inhalte erst im nächsten Arbeitsschritt entwickeln.

---

Die Übernahme verändert noch keine Inhalte der veröffentlichten Spielversion und erfordert keinen Zugriff auf den alten Chat. Modellvorschlag des bisherigen Nutzers: GPT-6.1 Sol, Denkintensität Hoch.
