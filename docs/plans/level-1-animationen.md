# Plan · Animationen für Level 1 „Lumenblüte“

Stand: 13. November 2026. Paket 1 ist auf `level1-animationen` umgesetzt und wartet auf die Nutzerabnahme (Stand und Prüfgrenzen: ../STATUS.md); Paket 2 ist nicht begonnen. Festlegungen des Nutzers vom selben Tag:

- **Umfang:** nur Animationen. Ablauf, Rätsel, Texte, Entscheidungen und Speicherformat 11 von Level 1 bleiben unverändert; keine Migration nötig.
- **Bildmaterial:** CSS/SVG-Ebenen über den neun vorhandenen Gesamtbildern. Keine neuen PNG-Bilder, keine neuen Laufzeitpakete.
- **Vorgehen:** zuerst eine Pilotszene, Nutzerabnahme, dann die übrigen Szenen im selben Stil.
- **Zweig:** Hofpilot bleibt auf main. Arbeit auf eigenem Zweig `level1-animationen` ab main, dazu `claude/serene-allen-2fw6gh` einmergen (enthält den reparierten Einzeldatei-Test, auf main noch nicht vorhanden). Kein Merge und kein Push nach main ohne ausdrückliche Freigabe; jeder Push auf main veröffentlicht über Pages.

## Ausgangslage

Level 1 hat zwölf Stationen auf neun flachen Bildern (workroom, illness, threshold, river, garden-dry, garden-wet, chamber, morning, characters). Vorhanden sind bisher nur drei Level-1-Animationen (channel-flow, light-pulse, secure-sling). dist/style.css schaltet bei „reduzierte Bewegung“ bereits global alle Animationen und Übergänge ab; das bleibt die Grundregel.

## Paket 1 · Pilotszene Garten (Stationen 7–9)

Gewählt, weil der Wechsel von garden-dry zu garden-wet am meisten hergibt.

1. Gemeinsame Grundlage: eine Ebenenstruktur `.scene-fx` (SVG/HTML, `aria-hidden`, `pointer-events:none`) über dem Szenenbild in Bildprozenten bei festem Seitenverhältnis, `direction:ltr` wie die bestehende Rätselgeometrie. Wenige wiederverwendbare Bausteine: Überblendung, Lichtstaub, Wasserlauf, Schimmer, sanfte Kamerafahrt.
2. Garten ohne Wasser: flirrende trockene Luft, einzelne fallende Blätter, feuchter Schimmer an der stillgelegten Anlage nach dem Untersuchen mit der Lupe.
3. Kanalrätsel: Kachel dreht sichtbar statt zu springen; Testwasser läuft Stück für Stück bis zur ersten Lücke; an der Lücke kleiner Spritzer statt Fehlerton.
4. Lösung: Wasser läuft bis ins Wurzelbecken, dann Überblendung dry → wet mit wärmer werdendem Licht und aufsteigendem Lichtstaub; Kammer öffnet sich.
5. Blütenkammer: Blüte pulsiert langsam, Lichtstaub wandert beim Einsatz des Lichtglases ins Glas.

Regeln für alle Animationen:
- Nur `transform` und `opacity`, keine Layoutänderung; kein horizontales Auslaufen bei 320 px.
- Keine Aktion wartet zwingend auf eine Animation: Knöpfe bleiben bedienbar, längere Abläufe (über etwa 1,5 s) sind per Tippen überspringbar, kein Countdown.
- Bei reduzierter Bewegung erscheint sofort der Endzustand; jede Information einer Animation steht zusätzlich im Text.
- Kein Blinken über drei Mal pro Sekunde; Dauerschleifen ruhig und dezent.
- RTL: Animationsrichtung folgt dem Bild, nicht der Schreibrichtung.
- Service-Worker-Cachekennung erhöhen; Einzeldatei mit make-offline.mjs neu erzeugen.

Abnahme Paket 1: Nutzer sieht die Pilotszene an (Laptop und Handy-Hochformat) und gibt Stil, Tempo und Menge frei oder korrigiert.

## Paket 2 · Übrige Szenen im abgenommenen Stil

| Station | Bild | Vorschlag |
|---|---|---|
| 1 Arbeitstisch | workroom | Lampenlicht, Staub im Lichtkegel, Papier raschelt beim Auswählen |
| 2–4 Fieber, Rucksack, Dinas Vorbereitung | illness | ruhiges Atmen der Decke, flackernde Kerze, Gegenstände gleiten in den Rucksack |
| 5 Schwelle | threshold | Laterne schwingt, Nebel zieht, langsame Kamerafahrt in den Wald |
| 6 Fluss | river | fließendes Wasser, Stamm bewegt sich beim Rätsel, Schlinge strafft sich |
| 10–11 Sturm, Licht kippt | river/threshold | Regen, Windböen, Lichtgefäß flackert passend zum Rätselstand |
| 12 Morgen | morning | Sonnenaufgang als Lichtverlauf, Fieberfarbe weicht |
| Szenenwechsel | alle | kurze Überblendung statt hartem Schnitt |

Die Vorschläge sind Entwürfe; verbindlich sind CANON.md und die Nutzerabnahme von Paket 1.

## Prüfungen je Paket

- `npm test` (zuletzt 82 von 82); Tests ergänzen, die prüfen, dass Spielzustand und Speicherformat durch die Animationen unverändert bleiben.
- Browserlauf für Level 1 mit `node server.mjs`: Deutsch/Englisch/Arabisch, 1440 Maus/Tastatur, 390 und 320 Touch, einmal mit und einmal ohne reduzierte Bewegung, Neuladen mitten in einer Animation, offline über den Service Worker. Screenshots vor/nach visuell prüfen.
- `python tests/browser-smoke.py` (Level 1+2) und `python tests/browser-standalone.py` mit TD_CHROMIUM.
- Offen und nicht als erledigt auszugeben: echtes iPhone/Safari (Flüssigkeit, Akku, Wärme), menschliches Urteil „hübsch“, menschliche Spielzeit.

## Risiken

- Flache Bilder: Figuren können sich nicht getrennt vom Hintergrund bewegen. Reicht das Ergebnis nicht, wären freigestellte Ebenenbilder ein eigener späterer Auftrag.
- Leistung auf älteren iPhones bei vielen gleichzeitigen Partikeln: Anzahl begrenzen, auf echtem Gerät prüfen.
- Bestehende Browsertests klicken sofort weiter; Animationen dürfen Klickziele nie verdecken oder verzögern.
