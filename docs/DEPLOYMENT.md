# GitHub, Sites und Herkunft

## Aktueller Veröffentlichungsstand 0.10 · öffentlich

Am 15. Oktober 2026 ausdrücklich beauftragt: Spiel aktualisieren und GitHub-Repository öffentlich schalten. Die bestehende Spielseite wurde auf 0.10 aktualisiert und öffentlich freigegeben. Die Änderung der GitHub-Repository-Sichtbarkeit wurde dagegen vom verfügbaren Verwaltungszugang mit **Forbidden** abgewiesen; anschließender GitHub-API-Abruf bestätigt weiterhin `private: true`, `visibility: private`. GitHub und Spielseitenzugriff sind getrennte Einstellungen. Für das Repository bleibt ein Eigentümerschritt in GitHub Settings → General → Danger Zone → Change repository visibility → Public offen.

- Spielversion: **0.10, alle sieben Level**, einschließlich der geprüften 320-Pixel-Korrektur.
- Öffentliche Spieladresse: https://tamatem-dina-zwischen-den-zeilen.timonnetzel.chatgpt.site
- Bestehende Site-ID unverändert: **appgprj_6ad06b66e5dc8191b14285faeba4d396**.
- Geprüfter GitHub-Quellstand: **c18e48e9691b0750f2afdbcb3eeb9c4c48037917**. Remote vor Veröffentlichung unverändert, Arbeitsbaum sauber.
- Gepushter Sites-Quellcommit: **44f96dda88be3507857e821e811afc33f05fdb05**. Vollständiger Quellbaum identisch mit GitHub c18e48e: **9dd89d40f1f1bbbee46abd63780abbcccb469258**.
- Beide Git-Historien erhalten, kein Force-Push. Alle **47 Archivdateien** aus `.openai/hosting.json` und `dist` bytegenau gegen den gepushten Sites-Commit geprüft. Spielcode unverändert gegenüber den zwölf bestandenen Testdateien und den drei vollständigen Offline-Kampagnen aus ACCEPTANCE_REPORT.md; keine unnötige Wiederholung unveränderter Prüfungen.
- Gespeicherte Sites-Version: **4**, **appgprj_6ad06b66e5dc8191b14285faeba4d396~appgver_364243aadee08191a31e0fee67b56791**.
- Bereitstellung: **appgdep_6ad1231f587c8191945edb9ca21ab008**, native Antwort **succeeded** mit obiger URL am **15. Oktober 2026, 21:02 Uhr Europe/Berlin**.
- Erst Aktualisierung auf der bestätigten Eigentümer-Site, anschließend Zugriff auf **public** umgestellt. Erneutes `get_site` bestätigt `access_mode: public`, Revision **2**, Version **4** und dieselbe Live-URL. Keine externen Einzelpersonen eingeladen, keine weiteren Editoren hinzugefügt.
- Sites-Plugin-Skripte waren in dieser Umgebung nicht installiert/lesbar; Quellabgleich, Commit/Push und Archivierung deshalb mit vorhandenem Git und kurzlebiger Sites-Schreibberechtigung über verdecktes stdin durchgeführt. Token nur im Sitzungsspeicher, nicht in Dateien, Argumenten oder Git. Ein vorübergehender HTTP-500-Fehler beim ersten Quellenabruf war beim erneuten Abruf behoben.
- Öffentliche Adresse zum Öffnen im Codex-Browser übergeben (Rückgabe: queued); dies ist keine bestätigte Browseransicht, keine zusätzliche Browserabnahme und kein echtes iPhone. Offene muttersprachliche, Geräte-, Fach-, direkte Einzeldatei- und menschliche Zeitprüfungen bleiben unverändert offen.
- Nachfolgende Dokumentationspflege auf GitHub ändert den veröffentlichten Laufzeitcode nicht. Künftige GitHub-Pushes veröffentlichen die Site weiterhin nicht automatisch.

## Frühere Veröffentlichung 0.8 · damals privat

- Spielversion: **0.8, Level 1–5 vollständig dreisprachig**.
- Private Spieladresse: https://tamatem-dina-zwischen-den-zeilen.timonnetzel.chatgpt.site
- Bestehende Site-ID appgprj_6ad06b66e5dc8191b14285faeba4d396 und Zugriff nur für das Eigentümerkonto vorab über get_site bestätigt; unverändert beibehalten.
- Geprüfter GitHub-Quellstand: **d9a7f72539138235e5fc701889770ca53207018b**.
- Gepushter Sites-Quellcommit: **1cb01fb00d6139b43ba6a723d78d4d6c087d770a**. Vollständiger Quellbaum identisch mit GitHub d9a7f72: **d81ab1fa57632ad86546875fe55e4f1c44e62cd9**.
- Beide Git-Historien erhalten: neuer Sites-Commit folgt auf 96659c6, ohne Force-Push. GitHub-origin unverändert.
- Archiv enthält ausschließlich `.openai/hosting.json` und `dist`; alle **39 Dateien** bytegenau gegen den gepushten Sites-Commit geprüft. Keine Codeänderung gegenüber den bestandenen 62 Logik-/Exportprüfungen und dreisprachigen Browser-/Offline-Durchläufen aus STATUS.md.
- Gespeicherte Sites-Version: **3**, **appgprj_6ad06b66e5dc8191b14285faeba4d396~appgver_ae9f3616ca30819181f328b78691cc38**; Provenienz durch get_site_version bestätigt.
- Bereitstellung: **appgdep_6ad10cda4d308191a0adc8363d910480**. Native Antwort **succeeded** mit obiger URL, bestätigt am **15. Oktober 2026 um 19:27 Uhr Europe/Berlin**.
- Keine zusätzliche Browserabnahme der authentifizierten Live-Seite und kein echter Handytest. Dokumentationspflege nach der Veröffentlichung verändert den Spielcode nicht.

## Frühere Veröffentlichung 0.5

- Spielversion: 0.5, Level 1 und 2 vollständig dreisprachig.
- Private Spieladresse: https://tamatem-dina-zwischen-den-zeilen.timonnetzel.chatgpt.site
- Bestehende Site und Zugriff nur für das Eigentümerkonto beibehalten.
- Geprüfter GitHub-Quellstand: c178cc479a2696ba1c9983f130ec6b4cdf48a28c.
- Gepushter Sites-Quellcommit: 96659c69cad8668dbf7248b49fe444ddbcfbd27f. Dessen vollständiger Quellbaum ist identisch mit dem GitHub-Quellstand (Git-Tree ee5bfaea72b4adcf1155d8a634783983ad256efb). Getrennte Git-Historien wurden erhalten, kein Force-Push.
- Gespeicherte Sites-Version: 2, appgprj_6ad06b66e5dc8191b14285faeba4d396~appgver_fbce93539cf081918226678991965899.
- Erfolgreiche Bereitstellung: appgdep_6ad0e1a3b7c081919f538f774114f3b7, bestätigt am 15. Oktober 2026 um 16:22 Uhr Europe/Berlin.
- Native Sites-Antwort: succeeded mit obiger URL; keine zusätzliche Browserabnahme der authentifizierten Live-Seite. Die vorhandenen lokalen Browser-/Offline-Prüfungen stehen in STATUS.md.
- Das Archiv wurde aus dem gepushten Sites-Commit erzeugt; alle 26 Dateien gegen diesen Commit geprüft. Es enthält ausschließlich .openai/hosting.json und dist.
- Anschließende Dokumentationspflege auf GitHub ändert den veröffentlichten Laufzeitcode nicht. Ein weiterer GitHub-Push veröffentlicht die Site weiterhin nicht automatisch.

## Ursprüngliche Prolog-Veröffentlichung

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

Bei künftigen Änderungen die bestätigte Öffentlichkeit der Spielseite erhalten, sofern der Nutzer keine andere Freigabe wünscht. Erfolg erst nach einem bestätigten Abschluss mit URL melden. Offene visuelle oder echte Geräteprüfungen getrennt ausweisen.

## Entwicklungsfassung 0.6

Level 3 wurde auf Basis von GitHub-main 77176b6 entwickelt. GitHub-Sicherung des abgeschlossenen Pakets und Sites-Veröffentlichung bleiben getrennt. In diesem Level-3-Paket wurde keine neue Sites-Version gespeichert oder veröffentlicht. Damals blieb die private 0.5-Veröffentlichung mit Level 1 und 2 maßgeblich; .openai/hosting.json wurde nicht geändert.
