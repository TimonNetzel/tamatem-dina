# Startprompt für den ersten Codex-Projektchat

Den folgenden Text in einem neuen Chat verwenden, der diesen Ordner als primären lokalen Projektordner nutzt.

---

Übernimm die Weiterentwicklung des vorhandenen Spiels „Tamatem & Dina – Zwischen den Zeilen“. Dies ist die Übergabe eines bereits spielbaren dreisprachigen Prologs mit Flussübergang, kein Auftrag für einen Neubau.

Lies AGENTS.md, docs/START_HERE.md, docs/STATUS.md und docs/WORKFLOW.md. Lies anschließend nur die weiteren Dateien, die für die konkrete Aufgabe nötig sind. Verwende den lokalen Projektskill unter .agents/skills/tamatem-dina-entwicklung/SKILL.md, wenn er verfügbar ist. Verbindliche Figuren- und Weltvorgaben stehen in docs/CANON.md.

Das private GitHub-Repository https://github.com/TimonNetzel/tamatem-dina ist eingerichtet; verwende den vorhandenen Projektordner oder einen Klon davon. Prüfe den Git-Status und origin. Ausgangspunkt ist der aktuelle gesicherte Stand auf main; bestehende lokale Nutzeränderungen erhalten. Führe die 20 automatischen Prüfungen mit npm test aus und prüfe die lokale Startfähigkeit. Die Übergabe-Momentaufnahme lässt sich vor Änderungen zusätzlich mit node scripts/verify-handoff.mjs prüfen; nach absichtlicher Weiterentwicklung können die dokumentierten Hashes abweichen. Der richtige Arbeitsordner ist die Wurzel dieses Spielrepositories.

Erhalte die bestätigten Figuren, Bilder, Texte auf Deutsch, Englisch und ägyptischem Arabisch sowie vorhandenen Spielstände. Die bestehende private Sites-ID in .openai/hosting.json bleibt erhalten; Details stehen in docs/DEPLOYMENT.md. Falls benötigte Werkzeuge fehlen, benenne die konkrete Grenze und arbeite an den unabhängigen Teilen weiter.

Prüfe vor Änderungen den aktuellen Stand mit npm test und lies die tatsächlich offenen Prüfungen in docs/STATUS.md. Der nächste inhaltliche Schritt ist der Quellgarten mit Hüter und sechs Kanalplatten nach docs/episodes/01-lumenbluete.md, Stationen 7–8 und Rätsel C. Schließe an das vorhandene Flussende an und erhalte Version-1- und Version-2-Spielstände. Neue Inhalte in allen drei Sprachen ergänzen. Setze den konkreten Nutzerauftrag um und aktualisiere docs/STATUS.md mit den tatsächlich ausgeführten Prüfungen. Sichere das abgeschlossene Paket mit Commit und Push. Nach dem Quellgarten empfehle einen neuen Chat für Blütenkammer, Rückweg und Finale; aktualisiere dafür diese Promptdatei und gib den neuen Prompt im Abschluss direkt aus.

---

Die Übernahme verändert noch keine Inhalte der veröffentlichten Spielversion und erfordert keinen Zugriff auf den alten Chat. Modellvorschlag des bisherigen Nutzers: GPT-6.1 Sol, Denkintensität Hoch.
