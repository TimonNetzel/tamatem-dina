# Gestaltung – Tamatem & Dina

Erste visuelle Entwicklungsfassung · 15. Oktober 2026

Diese Gestaltungsfassung ergänzt das Spielkonzept und den Ablauf von Level 1. Sie dient als Referenz für die erste spielbare Version. Die Bilder sind Konzeptkunst; daraus entstehen später getrennte Hintergründe, Figuren, Gegenstände und Bedienflächen.

## Erstellte Konzeptbilder

- [Figurenblatt: Tamatem und Dina](../art/references/character-sheet-v1.png), 1536 × 1024 Pixel.
- [Eröffnungsszene: Der gemeinsame Arbeitstisch](../dist/assets/workroom.png), 1672 × 941 Pixel.
- [Vollständige Bildprompts](../art/prompts/01-model-sheet-and-workroom.md).

Beide Bilder wurden visuell auf die festgelegten Haar-, Augen-, Augenbrauen- und Hautmerkmale geprüft. Die Szene übernimmt die Figuren des Modellblatts. Die Darstellung des Arbeitstischs dient zunächst als gemeinsame Bildreferenz; die einzelnen Quellen erhalten im Prototyp separate, lesbare Detailansichten.

Die getrennten Spalten des Figurenblatts stellen keine gemeinsame Größenskala dar. Tamatem bleibt als Sechsjähriger im gemeinsamen Szenenbild deutlich kleiner als Dina.

## Verbindliche Figurenmerkmale

| Merkmal | Tamatem, Level 1 | Dina, alle Level |
|---|---|---|
| Alter | 6 Jahre, später in Zweierschritten bis 18 | Ungefähr 30 Jahre |
| Haare | Sehr blond, weicher seitlicher Pony | Dunkel, deutlich lockig |
| Augenbrauen | Braun, ausdrücklich dunkler als das Haar | Dunkel |
| Augen | Braun | Dunkel |
| Haut | Hell | Warmes Beige |
| Ausdruck | Aufmerksam, ernsthaft, gelegentlich trocken amüsiert | Zugewandt, selbstständig, erfahren und eigenwillig |

Kleidung für den ersten Entwurf: Tamatem trägt ein elfenbeinfarbenes Hemd, einen petrolfarbenen Pullunder, eine zurückhaltend rostfarbene Krawatte und eine helle praktische Jacke. Dina trägt eine petrolfarbene Bluse, eine gedeckt terrakottafarbene Strickjacke und eine dunkle Hose. Diese Kleidung ist ein Gestaltungsvorschlag, keine zusätzliche Vorgabe des Nutzers.

Die Grundansichten verwenden keine Brille. Eine Brille kann später situationsabhängig hinzukommen, wie im journalistischen Storyboard. Dinas dunkle Augen und Tamatems braune Augen sollen in den Referenzansichten deutlich erkennbar bleiben.

## Zeichenstil

Farbige Tuschezeichnung mit klarer Silhouette, feinen Schraffuren und zurückhaltenden Farbflächen. Die Figuren greifen die ausdrucksstarken Augen und die Abenteuercomic-Sprache der Storyboards auf. Anatomie und Proportionen bleiben nachvollziehbar. Die erwachsene Zielgruppe zeigt sich in Mimik, Atmosphäre und Handlung; Tamatem darf weiterhin sichtbar ein Kind sein.

Konturen haben ein dunkles Blau-Schwarz. Hintergrunddetails werden ruhiger als die interaktiven Gegenstände behandelt. Kleine Lichtakzente dürfen magische Momente hervorheben. Eine flächige Neonbeleuchtung oder fotorealistische Materialdarstellung gehört nicht zur visuellen Grundrichtung.

## Erste Szene: Der gemeinsame Arbeitstisch

Zeitpunkt: Beginn des spielbaren Prologs, vor Dinas schwerem Fieberschub.

Dina und Tamatem vergleichen botanische Unterlagen an einem gemeinsamen Tisch. Fensterlicht, Papier und Bücher vermitteln Vertrautheit. Petrolfarbene Schatten und eine Blüte mit grauer Verfärbung kündigen die spätere Gefahr leise an. Dina arbeitet aktiv an der Recherche; Tamatem untersucht ein Detail mit der Lupe.

Für die spätere Interaktion relevante Bildbereiche sind Quellenmappe, Reiseaufzeichnung, Pflanzenzeichnung, Werbeprospekt und Notizbuch. Im fertigen Spiel werden diese Gegenstände als eigene Ebenen beziehungsweise klar definierte Interaktionsbereiche aufgebaut. Dekorative Schrift in einer Illustration ersetzt keine lesbaren Quellenkarten.

## Neue Szene: Flussübergang

`dist/assets/river.png` ergänzt den vorhandenen Stil. Öse, Halteschlaufe, Stamm und Oris sind getrennt anwählbar. Eine SVG-Ebene zeigt die Befestigung; Text und Rätselzustand sind nicht in das Bild eingebrannt. Referenzen und vollständiger Prompt: `art/prompts/03-river-crossing.md`.

## Neue Szene: Quellgarten

`dist/assets/garden-dry.png` und `garden-wet.png` zeigen denselben Schauplatz vor/nach der Bewässerung. Figuren, Architektur und Perspektive bleiben erhalten; Pflanzen, Wasser und geöffnete Tür zeigen den Erfolg. Das exakte Sechs-Platten-Rätsel bleibt getrenntes HTML/SVG mit übersetzbaren Texten. Prompt und Referenzen: `art/prompts/04-spring-garden.md`.

## Übertragung in die Spieloberfläche

- Dialoge werden als echter, skalierbarer Text über oder neben den Bildern angezeigt.
- Die Szenenillustration enthält keine eingebrannten Dialogkästen oder notwendigen Bedienbeschriftungen.
- Die aktive Figur wird durch Name und Porträt kenntlich gemacht.
- Ein Tippen auf ein Objekt öffnet Untersuchung oder Aktion. Keine wesentliche Handlung benötigt einen Mauszeiger oder einen Hover-Effekt.
- Inventargegenstände lassen sich auswählen und anschließend auf ein Ziel anwenden. Ziehen ist optional.
- Auf dem Laptop darf die Szene breit stehen. Auf dem iPhone müssen Figuren und alle notwendigen Gegenstände über angepasste Ausschnitte oder gesonderte Detailansichten erreichbar bleiben.
- Die Bilder allein belegen noch keine Lesbarkeit oder Bedienbarkeit auf einem echten iPhone. Diese Prüfung erfolgt am Prototyp.

## Produktionsreihenfolge nach der Gestaltung

Der erste spielbare Prolog ist inzwischen umgesetzt. Spieladresse, Offline-Datei, Projektpaket und Prüfgrenzen sind in „STATUS.md“ dokumentiert. Zwei zusätzliche Szenen zeigen Dinas Zimmer und die Begegnung mit Oris am Waldrand.

1. Die Figurenansichten als gemeinsame Referenz verwenden.
2. Arbeitszimmer und Quellenkarten für den Prolog in getrennten Ebenen vorbereiten.
3. Die Oberfläche mit echten Texten auf Deutsch, Englisch und ägyptischem Arabisch aufbauen.
4. Dinas Quellenrätsel, Perspektivwechsel zu Tamatem, Krankheitsszene und Packen des Rucksacks umsetzen.
5. Touchbedienung, Fortsetzen und Offline-Laden am tatsächlich ausführbaren Prototyp prüfen.

## Erzeugung und Nachvollziehbarkeit

Die Konzeptbilder wurden mit der integrierten Bildgenerierung erstellt. Die vollständigen verwendeten Bildprompts sind als separate Textdatei neben den Bildern gespeichert. Für den Szenenentwurf diente das Figurenblatt als Identitätsreferenz. Die Storyboards geben die Stilrichtung vor; die festgelegten Haar-, Augen- und Hautmerkmale haben bei Abweichungen Vorrang.
