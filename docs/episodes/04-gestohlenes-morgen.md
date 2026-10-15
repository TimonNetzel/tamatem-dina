# Level 4 · Das gestohlene Morgen

Tamatem zwölf; Dina ungefähr dreißig. Vollständig realistischer Recherchethriller. Direkter Einstieg ab eco-complete, kein Neustart. Äußere Aufgabe: eine öffentlich erhobene Beschuldigung gegen Mara überprüfen. Entwicklung: Tamatem widerspricht seiner neuen Clique, obwohl er dazugehören möchte. Keine Magie, kein Lügendetektor, keine Metadaten als alleiniger Wahrheitsbeweis.

## Zwölf konkrete Stationen

| Nr. / Heldenreise | Spielbare Figur / Ort | Handlung, Beleg und Konsequenz |
|---|---|---|
| 1 Gewohnte Welt | Dina / Jugendhaus „Morgen“ | Vor dem Benefizabend fehlt der Spendenumschlag S7. Ein beschnittener Flurclip zeigt Mara mit einer Requisitenkiste. Dina liest die Beschuldigung und bemerkt: zu sehen ist keine Geldentnahme. |
| 2 Ruf und Weigerung | Tamatem / Vorplatz | Die Clique verlangt, den Clip als „Beweis“ weiterzugeben. Er entscheidet zwischen öffentlichem Widerspruch und direktem Gespräch mit dem Gruppenadministrator. Beide Wege setzen eine ausdrückliche Bitte um Stopp um; beides kostet die Einladung zum nächsten Treffen. |
| 3 Mentorin | Dina / Lesetisch | Frühere Gerichtsreporterin Ruth erklärt Quellenabhängigkeit, Herkunft und Grenzen. Dina muss Original plus Gegenbeleg wählen; bloße Wiederholungen reichen nicht. |
| 4 Schwelle | Tamatem / Quellenwand | Vier Quellen öffnen und als eigenständig oder abgeleitet ordnen: Originalaufnahme, unabhängig geführte Inventarliste und Empfangsbuch; die Collage der Clique stammt vom selben Clip. Quellenunabhängigkeit beweist noch nicht inhaltliche Richtigkeit. |
| 5 Prüfungen | Dina / Technikraum mit Betreiberin | Rekorder überschreibt regulär; kein Countdown. Mit Einwilligung Vollintervall exportieren, mit Original abgleichen, Übergabe protokollieren. Original bleibt bei Betreiberin, Redaktion erhält begrenzte Arbeitskopie, keine heimliche Wegnahme. |
| 6 Annäherung | Tamatem / öffentlicher Zeitvergleich | Dieselbe Aufnahme zeigt zwei protokollierte Saalglocken: Kamera 17:10/17:40, Saaluhr 18:00/18:30. Innerhalb dieses Intervalls läuft Kamera 50 Minuten nach. Clip 17:20 entspricht 18:10. Keine Aussage über andere Tage. |
| 7 Zentrale Prüfung | Tamatem / gemeinsamer Lesetisch | Treffen teilt Dinas Vollaufnahme mit seinen Dokumenten. Vier nummerierte Felder: Mara/Kiste 18:10; S7 versiegelt im Schrank, unabhängig doppelt kontrolliert 18:14; Leitungs-Transport 18:18; Safe-Empfang 18:24. Zeiten explizit in Dokumenten. Reihenfolge allein beweist noch keinen Inhalt. |
| 8 Belohnung / Rekonstruktion | Tamatem / Belegmatrix | Drei Grenzen zuordnen: Clip zeigt nur Kiste; Inventar widerspricht der behaupteten Entnahme um 18:10; Empfang und aktuelle gemeinsame Kontrolle belegen S7 unverändert im Safe. Falsche Beschuldigung ist widerlegt, absichtliche Intrige nicht bewiesen. |
| 9 Rückweg | Dina / Stellungnahmen | Leitung räumt Verlagerung und fehlende Rückmeldung ein; Redakteur hatte vor dem Sponsorengespräch schnelle Klärung versprochen. Mara schildert Ausschluss. Alle drei Antworten lesen. Zeitdruck/Interesse erklären eine mögliche Dynamik, beweisen keine absichtliche Fälschung. |
| 10 Letzte Prüfung | Dina / Redaktion | Begrenzte Veröffentlichung: Zeitvergleich und S7-Belegauszug veröffentlichen; Nachbarwohnungen im Vollvideo unkenntlich, Maras private Nachricht mit Familien-/Klinikbezug weglassen, Anschrift weglassen. Mara erlaubt auf Nachfrage Namen oder Anonymität für die Korrektur, nicht ihre Nachricht. Beide Nennungsformen spielbar. |
| 11 Rückkehr mit dem Elixier | Dina / Redaktion und Gruppe | Belegten Entwurf freigeben, Korrektur tatsächlich an dieselbe Gruppe senden, Ausgabe veröffentlichen. Reihenfolge zwingend; Empfängerkreis im Spiel fiktiv/lokal, keine echten Netzwerknachrichten. Frühere Behauptung wird sichtbar ersetzt, keine bloße neue Nachricht daneben. |
| 12 Veränderte Welt | Tamatem / Jugendhaus | Berichtigung liegt aus, Mara bekommt Zugang zurück. Geldverlust widerlegt, Rufschaden bleibt. Clique lädt ihn nicht sofort wieder ein. Abschluss und alle Notizen speichern; vor Level 5 neuer Chat. |

## Rätselvertrag und Speicherung

`morning-state.js` verwaltet zwölf Abschnitte, gelesene Belege, Clique-Reaktion, Methodenwahl, Quellenklassifikation, dreiteilige Sicherungsreihenfolge, Uhrvergleich mit Gültigkeitsbereich, vierteilige Ereignisfolge, dreiteilige Belegmatrix, Stellungnahmen, fünfteilige Veröffentlichungsprüfung, Nennungsfreigabe und drei getrennte Veröffentlichungsschritte.

- Ausgangszustand: jede Auswahl leer; Bestätigungen falsch. Lesen öffnet den vollständigen skalierbaren Text und speichert die gelesene Quelle.
- Gültige Handlungen: Antippen, Radiofelder, nummerierte Selects, ausdrückliche Prüfung/Weitergabe. Kein Ziehen, Hover, Ressourcenschwund, Kampf oder Zeitlimit.
- Lösung: oben explizite Quellen-/Zeit-/Publikationszuordnung. Keine allein farbigen Hinweise. Positionsnummern bleiben in RTL gleich.
- Fehlversuche: verständliche dreisprachige Rückmeldung, keine Sperre und keine Nachteile; alle unbestätigten Auswahlen bleiben änderbar. Doppelte Reihenfolgeeinträge werden beim Umsetzen freigeräumt.
- Hilfen: drei freiwillige Stufen in jedem Abschnitt, letzte nennt konkrete Lösung/Nächste-Schritte. Nach Bestätigung weist die Ansicht ausdrücklich auf Weitergehen.
- Zustand: jede Teilhandlung speicherbar; frühere Level werden weder geändert noch gelöscht. Format 7 migriert 1–6; alte eco-complete-Spielstände bieten Level 4 direkt. Fortschritt ohne notwendige Vorarbeiten wird abgewiesen.

Alle Spieltexte, Dokumente, Rückmeldungen, Artikel, Notizen und Hilfen de/en/ar-EG. Keine private Anschrift oder tatsächliche Familien-/Klinikdetails werden dem Spieler ausformuliert. Der Prüfgegenstand wird genannt, die Daten selbst werden schon bei der Einsicht minimiert. Illustrationen atmosphärisch; exakte Beweise immer HTML.

Ziel 15–30 Minuten, noch keine unabhängige Zeitmessung. Dramaturgische, muttersprachliche und echte Geräteprüfung bleiben eigene Nachweise.
