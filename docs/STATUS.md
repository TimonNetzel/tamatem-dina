# Entwicklungsstand

Übergabestand: 15. Oktober 2026. Ausgangsversion: Prolog 0.1.

## Entwicklungsablage

Privates GitHub-Repository: https://github.com/TimonNetzel/tamatem-dina, Hauptzweig main. Der Nutzer hat Einrichtung und Upload ausdrücklich erlaubt. Der Projektordner ist als eigenes Git-Repository eingerichtet und mit origin verbunden. Die bestehende Sites-Veröffentlichung wird durch die Repository-Einrichtung nicht neu bereitgestellt.

## Implementiert

- Einstieg mit fertiger Arbeitstischillustration.
- Spielbare Dina; vier Quellen lesen und drei Belegfelder zuordnen.
- Bestätigung der korrekten Recherche, hilfreiche Rückmeldungen bei Fehlern.
- Krankheitsszene; Wechsel zu Tamatem; Gespräche mit Dina und der Ärztin.
- Entscheidung: Angst benennen oder sich auf den Bericht konzentrieren.
- Recherchekarte ins Notizbuch übernehmen, vier Gegenstände einpacken.
- Aufbruch erst bei vollständiger Ausrüstung und übernommener Karte.
- Begegnung mit Oris, zwei Antwortmöglichkeiten und klar markiertes Prologende.
- Notizbuch, drei Hinweisstufen, Fundstückmarkierungen, lokale Speicherung, Spielstandexport und -import mit Bestätigung.
- Service Worker und Bereitschaftsanzeige für vollständig vorhandene Offline-Dateien.
- Erzeugung einer vollständig eingebetteten HTML-Datei für den Laptop.

## Noch nicht implementiert

Flussübergang, Quellgarten mit Kanalrätsel, Blütenkammer, Rückweg und gemeinsames Heilungsfinale. Level 2–7 sind Konzeptentwürfe. Auch Ton und Musik sind derzeit nicht implementiert.

## Tatsächlich geprüft

- Zwölf automatische Prüfungen für Spielzustände und simuliertes Offline-Cache-Verhalten bestanden.
- Alle vier Kombinationen der beiden Entscheidungen erreichen das Prologende und überstehen den Speicher-Rundlauf.
- JavaScript-Syntax geprüft; keine externen Laufzeitpakete erforderlich.
- Offline-Einzeldatei auf eingebettete Bilder, fehlende externe Skript-/Stylesheet-Abhängigkeiten und syntaktisch gültiges zusammengeführtes Skript geprüft.
- Private Veröffentlichung durch Sites als erfolgreich bestätigt. Identität und Ausgangscommit: DEPLOYMENT.md.
- Nutzer hat die sichtbare Gestaltung positiv beurteilt.
- Die zwölf Tests wurden im neuen Übergabeordner erneut ausgeführt und bestanden. Die 17 übernommenen Anwendungs-, Bild- und Testdateien stimmen bytegenau mit dem ursprünglichen Quellstand überein.

## Offene Prüfungen und bekannte Grenzen

- Keine abgeschlossene visuelle Browserprüfung durch das Browserwerkzeug. Die lokale Vorschau scheiterte zunächst an der Netzwerksandbox; ein späterer Versuch, die Fehlerseite zu beobachten, wurde durch die Browser-URL-Richtlinie abgelehnt. Diesen Richtlinienblock nicht umgehen.
- Kein Test auf einem echten iPhone. Safari-Installation, Offline-Neuladen, Speicherung und Touchbedienung sind offen.
- Die geplanten etwa fünf Minuten sind noch nicht durch einen unvorbereiteten Spieldurchlauf gemessen.
- Spielstände werden nicht automatisch zwischen Geräten synchronisiert.
- Die Cache-Tests sind Simulationen und ersetzen keine reale Offline-Browserprüfung.

## Nächste sinnvolle Schritte

1. Beim Öffnen auf einem neuen Rechner das vorhandene Repository klonen und die zwölf Tests ausführen. Für die Weiterentwicklung dieses Repository verwenden.
2. Den vorhandenen Prolog mit zulässigem Browserzugriff visuell und funktional prüfen. Echte Geräteprüfung bei Verfügbarkeit ergänzen.
3. Flussrätsel nach dem vorhandenen Episodenplan umsetzen, einschließlich nötiger Illustration, Zustände und Spielstandfortsetzung.
4. Anschließend Quellgarten, Blütenkammer, Rückweg und Finale ergänzen.

Bei Abschluss einer Aufgabe diese Datei knapp aktualisieren: Umsetzung, tatsächlich ausgeführte Prüfungen, offene Punkte, nächste konkrete Aufgabe. Die Übergabe-Hashliste ist nur eine Momentaufnahme vor weiteren Änderungen.
