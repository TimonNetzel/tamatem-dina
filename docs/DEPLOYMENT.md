# GitHub, Sites und Herkunft

## Veröffentlichter Ausgangsstand

- Private Spieladresse: https://tamatem-dina-zwischen-den-zeilen.timonnetzel.chatgpt.site
- Sites-Projekt-ID: appgprj_6ad06b66e5dc8191b14285faeba4d396
- Veröffentlichter Quellcommit: 8753dcebaefc00fd7f80b95c14b3d9e2452d2ac5
- Gespeicherte Version: appgprj_6ad06b66e5dc8191b14285faeba4d396~appgver_6240190e148481919b7c25cbd57a0387
- Erfolgreiche Bereitstellung: appgdep_6ad0706d1f008191aef88420918cf4a8
- Zeitpunkt der Erfolgsbestätigung: 15. Oktober 2026, 08:19 Uhr Europe/Berlin.

Das Manifest .openai/hosting.json enthält die beizubehaltende Projekt-ID und static.directory=dist. Die IDs sind Verweise auf die bestehende Site, keine Zugangstoken. Sie nicht erfinden oder für ein neues Projekt wiederverwenden.

## Was übertragen wurde

Code, Tests, Bilder und Konfiguration wurden aus dem veröffentlichten lokalen Quellstand kopiert. Zusätzliche Dokumentation, Projektskill und Kontextdateien wurden für diese Übergabe ergänzt. Die originale Git-Historie verbleibt im ursprünglichen Arbeitsordner und in der Sites-Quellablage. Im Paket liegt keine .git-Konfiguration und kein gespeichertes Zugangstoken.

Der alte lokale Arbeitsordner ist eine Herkunftsangabe, keine Abhängigkeit des neuen Projekts:

    C:/Users/tnetz/Documents/Codex/2026-10-15/ana/work/tamatem-dina

Mit scripts/verify-handoff.mjs lässt sich prüfen, dass die Übergabedateien vor weiteren Änderungen unverändert vorliegen. docs/HANDOFF_BASELINE.json enthält zusätzlich die aus dem ursprünglichen Spielcode berechneten Ausgangshashes.

## GitHub als Entwicklungsablage

Privates Repository: https://github.com/TimonNetzel/tamatem-dina. Eigentümer: TimonNetzel. Hauptzweig: main. Die Einrichtung und Übertragung wurden vom Nutzer am 15. Oktober 2026 ausdrücklich autorisiert. Die Privatheit wurde über GitHub geprüft.

Der Projektordner besitzt ein eigenes lokales Git-Repository; origin verweist auf https://github.com/TimonNetzel/tamatem-dina.git. .gitignore enthält Ausnahmen für Tokens, Laufzeitdateien und große erzeugte Veröffentlichungsdateien. Die Commitidentität verwendet die GitHub-noreply-Adresse des bestätigten Kontos. Zugangstoken werden nicht im Repository gespeichert.

Auf weiteren Rechnern dieses Repository klonen und den Klon als primären Codex-Projektordner verwenden. Kein zweites Repository oder eine zweite Site zur bloßen Übernahme anlegen. Die ursprüngliche ZIP-Übergabe bleibt eine Sicherung des Stands vor GitHub.

## Bestehende Site fortführen

Wenn Sites verfügbar ist, den installierten Sites-Skill lesen und seine aktuelle Quell- und Veröffentlichungslogik verwenden. Die bestehende Projekt-ID wiederverwenden; keine zweite Site anlegen. Neue kurzlebige Zugangsdaten nur über die vorgesehenen Tools beziehen und im Arbeitsspeicher beziehungsweise über stdin weitergeben.

GitHub und die interne Sites-Quellablage sind nicht automatisch derselbe Git-Remote. Die GitHub-Anbindung soll nicht durch Überschreiben vorhandener Remotes oder Übernehmen einer alten .git-Konfiguration hergestellt werden. Falls getrennte Checkouts erforderlich sind, einen ignorierten Veröffentlichungsordner verwenden und den freigegebenen Quellstand nachvollziehbar übertragen. Der an Sites gemeldete Commit muss in dessen Quellablage tatsächlich gepusht sein und zum Archiv passen.

Falls Sites im Zielprojekt nicht verfügbar ist, lokal weiterarbeiten und die Einzeldatei erzeugen. Die vorhandene private Spieladresse darf deshalb nicht als aktualisiert gemeldet werden.

## Bekannte Windows-Einstellung

Beim letzten Lauf benötigte der offizielle Sites-Workflow die vorhandene Git-Bash-Laufzeit im PATH. Für das von ihm verwendete GNU tar war TAR_OPTIONS=--force-local erforderlich; der absolute Archivpfad wurde mit Vorwärtsschrägstrichen übergeben. Andernfalls interpretierte tar den Laufwerksbuchstaben als entfernten Host.

Dies ist ein dokumentierter Workaround für die damalige Umgebung, keine allgemeine Vorgabe für andere Rechner. Die erforderlichen Werkzeuge und das aktuelle Fehlerbild zuerst prüfen. Keine Zugangsdaten in Shell-Argumente schreiben.

## Veröffentlichung prüfen

Nach einer echten Änderung an der Site den Zugriff privat belassen, sofern der Nutzer keine andere Freigabe wünscht. Erfolg erst nach einem bestätigten Abschluss mit URL melden. Offene visuelle oder echte Geräteprüfungen getrennt ausweisen.
