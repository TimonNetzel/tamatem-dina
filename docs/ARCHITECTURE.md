# Technischer Einstieg

## Anwendung

Die Dateien in dist sind direkt gepflegter Quellcode und zugleich die veröffentlichbare statische Anwendung. Es gibt derzeit keinen Bundler, kein Framework und keine npm-Laufzeitabhängigkeiten.

| Datei | Aufgabe |
|---|---|
| dist/index.html | Grundgerüst, Header, Dialogcontainer und Einstieg |
| dist/style.css | Farbige Comic-Oberfläche und responsive Ansichten |
| dist/data.js | Deutsche Quellen, Dialoge, Gegenstände und Hinweise |
| dist/state.js | Zustandsübergänge, Fortschrittsbedingungen, Spielstandvalidierung |
| dist/app.js | Darstellung, Klickaktionen, Dialoge, Speichern, Import/Export |
| dist/sw.js | Offline-Cache, Navigation ohne Netz, Vollständigkeitsmeldung |
| dist/manifest.webmanifest | Installierbare Web-App |
| dist/assets | Tatsächlich verwendete Illustrationen und Symbol |
| server.mjs | Lokale Vorschau, nur auf 127.0.0.1:4173 |
| make-offline.mjs | Verbindet Bilder, Stil und Spielcode zu einer HTML-Datei |

Die Offline-Datei wird aus dem Quellstand neu erzeugt. Änderungen an ihrer Kopie werden nicht zurück in das Projekt übernommen.

## Spielzustände

Aktuelle Abschnitte: intro → research → illness → resolve → pack → threshold → complete. „complete“ bedeutet bisher Ende des Prologs, nicht Ende von Level 1. Für die Fortsetzung muss dieser Abschluss in einen Anschluss an den Fluss überführt werden.

state.js definiert VERSION=1, initialState, reduce und validateState. Der lokale Speicherschlüssel lautet tamatem-dina-prolog-v1. Ein Übergabeschritt darf diesen Schlüssel nicht ändern.

Bei neuen Zuständen müssen validateState und die Import-/Fortsetzungslogik mitwachsen. Alte Prolog-Spielstände mit dem Abschnitt complete sollen nach Möglichkeit sinnvoll in die Fortsetzung übergehen.

## Bilder

characters.png: Figurenblatt als Porträtreferenz; workroom.png: Arbeitstisch; illness.png: Dinas Zimmer; threshold.png: Waldrand mit Oris. Neue Bilder werden im verfügbaren Bildwerkzeug anhand des Figurenblatts erstellt. Hinweise und Dialoge bleiben skalierbarer Text; notwendiger Inhalt wird nicht nur in eine Illustration eingebrannt.

## Offline und Veröffentlichungen

Alle benötigten Dateien stehen in der CORE-Liste von sw.js. Bei neuen Szenen die Liste ergänzen und bei geänderten Cache-Inhalten die Cache-Version aktualisieren. „Offline bereit“ darf erst nach vollständiger Prüfung aller Dateien erscheinen.

Die Browser-Anwendung lädt keine externen Schriftdateien. Bei künftigen Medien auch notwendige Töne lokal beilegen. Die zwölf Tests decken Spielregeln und simuliertes Cache-Verhalten ab, keine Bilddarstellung oder echte Safari-Installation.
