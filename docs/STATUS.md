# Entwicklungsstand

Stand: 15. Oktober 2026. Entwicklungsfassung 0.4: Level 1 „Die Lumenblüte“ vollständig spielbar, auf Deutsch, Englisch und ägyptischem Arabisch.

## Entwicklungsablage und Veröffentlichung

Privates GitHub-Repository: TimonNetzel/tamatem-dina, Hauptzweig main. Abgeschlossene Arbeitspakete werden ohne Force nach main gepusht; den bestätigten Commit anhand von Git-Historie und Remote prüfen. Die bestehende Sites-Veröffentlichung enthält weiterhin Prolog 0.1. Dieses Arbeitspaket aktualisiert die Site nicht. Identität und veröffentlichter Stand: DEPLOYMENT.md.

## Implementiert

- Vorhandene Recherche, Krankheitsszene, beide frühen Entscheidungen, Ausrüstung, Oris, Flussübergang und vollständiger Quellgarten bleiben erhalten. Das Sechs-Platten-Kanalrätsel einschließlich freiwilliger Lösungsvorschau ist unverändert.
- Anschluss an garden-complete: Kammer betreten, Blüte mit Dinas Recherchekarte identifizieren, Lichtglas verwenden und Lichtstaub sammeln. Pflückversuch wird vor Schaden unterbrochen. Blüte und Wurzeln bleiben erhalten; optionaler Austausch mit dem Hüter. Die Regel des Laternenlichts wird beim Sammeln eingeführt und im Notizbuch festgehalten.
- Interaktives Sturm-Panel auf dem höheren Rückweg: Glas neben der brennenden Laterne schützen, dann ins Dorf zurückkehren. Falsche Wahl verliert nichts; kein Countdown, kein Reflexzwang und keine zweite Überquerung des überfluteten Flusses.
- Fiktive Lichtapparatur mit lesbarer Archivskizze und gespeicherten Schritten: einsetzen, sammeln, binden, beruhigen. Ausschalten vor dem Binden wird erklärt und verhindert. Nach dem Binden ist eine früh erkannte Laternenlösung sofort gültig.
- Notwendige spielbare Dina: Spiegelbild untersuchen und Beobachtung weitergeben. Beim regulären Weg erkennt sie das Störlicht; Tamatem schaltet die Laterne aus und beruhigt den Faden. Dina prüft abschließend dessen Stabilität. Bei früher Lösung erfolgt direkt diese Prüfung. Erst nach Dinas ausdrücklicher Bestätigung kann Tamatem die Ärztin rufen.
- Nacht-/Morgenabschluss mit sichtbarer Besserung und weiterem Ruhebedarf. Das letzte Gespräch greift die Angst-/Rechercheentscheidung auf; Oris erinnert an die gewählte Form der Begleitung. Brief als Ausblick auf Level 2, ausdrücklich noch nicht spielbar.
- Neue referenzgestützte Kammer- und Morgenillustration. Laterne, Glaszustände und Spiegel als beschriftetes HTML/SVG; reduzierte Bewegung möglich. Texte, Hilfen, Notizbuch, Alternativtexte und Fehlermeldungen in allen drei Sprachen. Sprachwahl und physische Rätselgeometrie bleiben unabhängig vom Spielstand.
- Spielstandformat 4, Migration aus Versionen 1–3 ohne Neustart. Version-3-Gartenabschluss behält seinen Abschnitt, seine Kanalstellungen, Entscheidungen und Ausrüstung. Neue Zustände werden ergänzt. Speicherschlüssel und Exportkennung bleiben erhalten.
- Service-Worker-Cache aktualisiert: 20 Einträge einschließlich neun Bildern. Eigenständige HTML enthält alle neun Bilder, Sprachkataloge und Spielmodule.

## Tatsächlich geprüft

- `npm test`: alle sechs Testdateien bestanden. Zusätzlich `node --test --test-reporter=spec --test-isolation=none tests/*.test.mjs`: 32 einzelne Prüfungen bestanden, keine fehlgeschlagen oder übersprungen. Darunter weiterhin alle 4.096 Kanalstellungen und Migrationen der alten Spielstände.
- Neue Zustandsraumprüfung: alle erreichbaren Zustände ab garden-complete für jede der vier frühen Entscheidungskombinationen durchlaufen. Jeder Zustand übersteht den Speicher-Rundlauf, erhält Entscheidungen/Ausrüstung/Garten und besitzt einen Weg zum Abschluss. Beide Laternenwege verlangen Dinas eigene Beobachtung und Bestätigung. Ungültige Reihenfolgen und manipulierte Spielstände werden geprüft.
- `python tests/browser-smoke.py`: vollständige Chromium-Durchläufe von Prolog bis level-complete auf Deutsch, Englisch und Arabisch ohne JavaScript-Laufzeitfehler. Deutscher und arabischer Durchlauf mit regulärer Dina-Beobachtung; englischer Durchlauf mit früher Laternenlösung. Garten manuell sowie mit freiwilliger Vorschau gelöst.
- Tatsächlicher Service-Worker-Betrieb: Netzwerk bereits am Fluss abgeschaltet, danach bis zum Morgenbild offline weitergespielt. Neuladen in allen neuen Szenen einschließlich beider Dina-Beobachtungen, Sprachwechsel ohne Zustandsverlust, Export und bestätigter Import von Versionen 1, 2, 3 und 4 geprüft. Alle angezeigten Bilder geladen.
- Neue Szenen bei 320 und 390 CSS-Pixeln ohne horizontalen Überlauf; deutscher Desktop bei 1440 Pixeln. Desktop-Apparatur, arabische Dina-Ansicht und englischer mobiler Abschluss anhand tatsächlicher Screenshots visuell geprüft. Tastatureinstieg, Escape, reduzierte Bewegung und spielbare Sitzung bei blockiertem lokalem Speicher geprüft. Dies ist keine Prüfung auf einem echten iPhone.
- Offline-Einzeldatei erzeugt und auf neun eingebettete Bilder, fehlende externe Skript-/Stylesheet-Abhängigkeiten und gültiges zusammengeführtes Skript geprüft. Eingebettete Module gegen minimales Dokument in allen drei Sprachen ausgeführt. Dies ist kein direkter file://-Browsernachweis.
- Syntaxprüfung und `git diff --check` ausgeführt. Bestehende Sites-Identität unverändert.

## Offene Prüfungen und Grenzen

- Kein echtes iPhone: Safari-Installation, Offline-Neuladen und Touchbedienung bleiben separat zu prüfen.
- Muttersprachliche Qualitätsprüfung der ägyptisch-arabischen Texte steht aus.
- Direkter file://-Aufruf der HTML-Einzeldatei wurde früher mit ERR_BLOCKED_BY_ADMINISTRATOR abgelehnt; die Richtlinie wurde nicht umgangen. Direkten Laptop-Dateibetrieb separat prüfen.
- Keine unabhängige Spieldauermessung. Ziel für das vollständige Level bleibt 15–30 Minuten.
- Spielstände sind gerätelokal, ohne automatische Synchronisierung. Ton und Musik fehlen weiterhin. Level 2–7 sind Konzeptentwürfe.
- Die Übergabe-Hashliste bleibt die Momentaufnahme von Prolog 0.1; absichtliche Abweichungen sind erwartbar.

## Nächste Aufgabe / Chatübergabe

Vor Level 2 einen neuen Chat öffnen. Kopierfertiger Auftrag: ../CODEX_STARTPROMPT.md. Zuerst dort die Episode „Die verschwundenen Stimmen“ gezielt planen und umsetzen; bestehendes Level 1 und Spielstände der Versionen 1–4 erhalten. Alter für Level 2: acht Jahre, realistischer journalistischer Fall ohne magische Auflösung. Vor größerer Erweiterung die offenen Geräte-, Sprach- und Spieldauerprüfungen bei Verfügbarkeit ergänzen. Sites-Veröffentlichung bleibt ein gesonderter Auftrag.
