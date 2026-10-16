# RoboWorld101 – Stand & Arbeitsnotizen

**Zuerst lesen, vor jeder Änderung:** diese Datei + STIL.md (Ende: Protokoll aller Versionen). Erst dann gezielt nur die betroffenen Dateien öffnen.

## Arbeitsregeln
- Sparsam mit Tokens: pro Sitzung ein klarer Schritt, nur nötige Dateien lesen.
- Kinder schauen zu: Roboter realitätsnah, kein falscher Eindruck. Stil/Design bleibt. Ausgedachtes und Forschung klar kennzeichnen.
- Gags und Querverweise auf bekannte Roboter gern. Marken nur auf der Karte, nicht im Bild.
- Science-Fiction (Raumschiff, Beamen) vorerst nicht – wurde auf Wunsch wieder entfernt.
- Fakten vor dem Einbauen mit Quellen prüfen; Unsicheres vorsichtig formulieren.
- Übergänge zwischen Bereichen weich halten (siehe Erkenntnisse), keine harten Kanten.
- Nach jeder Sitzung: „Erkenntnisse“ und „Nächster Schritt“ hier aktualisieren (kurz halten!).

## Quelle der Wahrheit und Veröffentlichen
- Das GitHub-Repo Thorlogy/RoboWorld101 ist maßgeblich. Zu Beginn: `add_repo` mit access "push", dann `git clone --depth 1 https://github.com/Thorlogy/roboworld101`. AGENTS.md im Repo lesen.
- Push auf `main` geht (Claude-GitHub-App für RoboWorld101 freigegeben). Bei 403: Freigabe unter github.com/apps/claude/installations/select_target prüfen.
- Danach geänderte Dateien auch hier ins Projekt schreiben.
- STAND.md liegt seit 20261016e auch im Repo (werk101/STAND.md).

## Aufbau (Kern)
index.html, kit.js, rooms/*.js, kinder.js, runners.js, himmel.js, welt.js, avatar.js, wander.js, kreislauf.js, stoerung.js, meldungen.js, engine.js, netz.js, game.js, tour.js, tools/check.py

## Weltkarte (Reihe 6 = EG, 7–9 = UG 1–3)
- Links (EG): Wüste c −25 bis −22, Gebirge c −21 bis −13, Stausee c −12 bis −10, Wasserkraftwerk c −9, Paketzentrum c −8, Magnetbahn-Bahnhof c −7, Flughafen c −6 … Straße c −1.
- Rechts (EG): Häuser bis Haus 104 (c 10.5), Haus 105 Chipfabrik c 12–13 (`haus: 6`, `H6`), Haus 107 Sendeturm c 14.5 (`haus: 7`, `H7`, Mast `TURM`), Farm 106 c 16 (r 5–6), Ladepark c 17, Fusion c 18, Feuerwache c 19, Seehafen c 20–24, Ozean c 25–29 (Algenfarm c 29), Marianengraben c 30–32 (r 6) mit Graben in r 8/9 bei c 31, Arktis c 33–36. (20261016e/f: alles ab Farm um insgesamt 4 Spalten nach rechts verschoben.)
- Unter der Erde: Wasserwerk UG 1 c −9; Bergwerk UG 1–3 c −5/−4 mit Schacht; Kläranlage UG 1 c −3; Kanal UG 1 c −2/−1; Tiefbahnhof UG 1 und Zugwerk UG 2 c 8–9.
- Maßstäbe: normal 1 m ≈ 69; Bergwerk 1 : 2; Arktis 1 : 2; Hafen 1 : 4; Stausee 1 : 8; Ozean 1 : 12; Marianengraben: Tiefe stark verkürzt (`grTiefe`), Tiere vergrößert (jeweils auf den Karten genannt).
- Alle Positionen über `roomOf(...)`: zum Verschieben reicht die Spalte in kit.js.

## Erledigt 14./15.10.2026 (bis Version 20261015y)
- Tageszeit, Nachtbetrieb, K5 · R-101 · Reaktionen · Vierbeiner · Wetter.
- Verkehr: Magnetbahn-Bahnhof, Tiefbahnhof, Zugwerk, Paketzentrum mit Lieferauto.
- Energie: Ladepark, Fusion, Stausee mit Wasserkraftwerk.
- Wasser: Wasserwerk, Kanal, Kläranlage, Seehafen, Ozean mit Plastik-Sammelbarriere und Algenfarm.
- Rohstoffe: Bergwerk mit drei Sohlen und Schacht. Landwirtschaft: Farm 106.
- Erste freiwillige Aufgabe (20261015s): Störung am Förderband der Fertigung, R-101 bringt Ersatzrolle aus dem Lager (stoerung.js).
- Satelliten und ISS mit Nahansicht beim Heranzoomen (20261015t).
- Wüste c −25 bis −22 mit DARPA Grand Challenge 2004/2005 im Wechsel (rooms/wueste.js, 20261015u).
- Marianengraben mit Deep Discoverer, Qualle, Dumbo-Krake, Lander mit Schneckenfischen, Nereus, Riesen-Einzellern, Plastiktüte; „Hohe See“ heißt jetzt „Ozean“ (rooms/graben.js, 20261015v).
- Arktis mit Eisberg, Eiscamp (Tauchroboter unter dem Eis, Ice-Tethered Profiler), Eisbär, Robbe, Polarstern, Forschungssiedlung mit Wetterstation, Ballon-Startautomat, Polarfuchs, Polarlicht (rooms/arktis.js, 20261015w/x).
- Meldungsliste für den Ticker (meldungen.js, 20261015x); weichere Übergänge Wüste/Ozean/Graben/Arktis (20261015y).

## Erledigt 16.10.2026 (Version 20261016e)
- Haus 105 Chipfabrik (rooms/chipfabrik.js): Reinraum mit Luftdusche, Deckenwagen (holen/bringen Behälter am Load Port), Cluster-Anlage mit Vakuumarm und Plasma, Steckbrief „Staubkorn“ mit Teilchenzähler; Belichtung mit gelbem Licht, Belichtungsmaschine mit aufklappbarem vereinfachtem Schnitt, Operatorin, Durchfahrt der Deckenwagen.
- Kreislauf „Wafer zum KI-Chip“ (kreislauf.js): Reinraum → Deckenwagen → Belichtung → Lkw → KI-Schrank im Rechenzentrum; Quarz-Hinweis (nicht Wüstensand).
- Suchspiel-Aufgabe, Ticker-Meldung, Kindertexte.

## Erledigt 16.10.2026 (Version 20261016f)
- Sendeturm Haus 107 mit Nachrichtenstudio (rooms/sendeturm.js): Moderatorin, Kamera-Roboter auf Bodenschiene, Bildschirm mit Meldung des Tages aus Baukasten (Hintergrund/Figur/Bewegung), Laufband, Etikett Forschung/Test/Produkt. Karte „Robo-Nachricht des Tages“ öffnet das Archiv (mit Quellen-Links und „Gibt es auch bei uns im Werk“).
- Meldungen stehen in nachrichten.js (`NACHRICHTEN`, neuester Eintrag oben; Felder und Regeln im Dateikopf). Statt news.json, weil fetch bei file:// und im Prüflauf nicht geht. Drei echte Beispielmeldungen (14.–16.10.2026).

## Erledigt 16.10.2026 (Version 20261016g)
- Robo-Nachrichten abgesichert: Links nur https (`nwLinks`), Prüfskript `tools/news_check.js` (Felder, Längen, verbotene Zeichen, zwei Quellen von verschiedenen Seiten, eine davon aus `ERLAUBT`; mit `--diff` nur nachrichten.js und deren index.html-Zeile geändert). Ablauf für den täglichen Lauf in `NACHRICHTEN-AUFGABE.md`: Vorschlag als Pull Request auf Zweig `robo-nachrichten`, Nutzer führt zusammen.
- nachrichten.js hat einen eigenen Cache-Zähler `?v=nJJJJMMTT` (wird bei Versions-Erhöhungen nicht mit ersetzt).
- Drohnen-Beispiel (15.10.) entfernt: keine Quelle von der Liste erlaubter Quellen.

## Erkenntnisse
- Spalten rechts verschieben: nur kit.js (alle Positionen über `roomOf`). Zwischen zwei Häusern mindestens 0,5 Spalten Abstand lassen, sonst überlappen die Wände (Haus 105 endet genau bei rx(14)).
- Neues Haus: Konstante + `HOUSES.push` + Zeichenblock in engine.js (wie Haus 104), Räume mit `haus: n`; die Lücken bekommen Gehweg und Laternen automatisch (uebergang.js).
- welt.js hüllt `draw`, `box` und `withAlpha` aller Räume ein; Tageszeit-Effekte gehen ohne Eingriff in die Raumdateien.
- Große Landschaften (Hafen, See, Stausee) als Läufer zeichnen, Felder leer lassen. Läufer zeichnen in Registrierungsreihenfolge.
- Doppelfelder: in Paar-Koordinaten zeichnen, rechtes Feld um RW + WALL verschieben.
- Abläufe über mehrere Runden: `langeUhr(n)`; Zustände, die sich ansammeln (Stämme am Floß), alle n Runden zurücksetzen.
- Globale Namen und Figuren-IDs hausweit eindeutig halten (Fehler gehabt: `SHX`, `FMX`, `STX`; `lander` gab es schon). Nach jeder neuen Datei prüfen.
- `person({ foot: 0 })` wird zu 358 – bei skalierten Figuren `foot: 0.001`.
- Wasserspiegel unter GROUND: Erdstreifen darüber mit `himmelFarben()[2]` überdecken. Zwischen zwei Landschaften liegt eine Wandlücke (WALL): Wasser/Himmel um WALL überlappen lassen.
- Übergänge: Rand-Gradient in der Farbe des Nachbarbereichs statt harter Kante; keine eigenen Erdflächen zeichnen, wo engine.js schon Erde mit Schichten zeichnet; Hintergrund-Silhouetten an den Rändern flach auslaufen lassen.
- Himmel und Erde (engine.js) reichen automatisch über alle Felder in `ROOMS`; Sterne und Wolken in welt.js decken etwa −18000 bis +26000 ab – bei noch breiterer Welt dort erweitern.
- Ticker: `ticker(text, x, y)` direkt aufrufen (Klick fährt hin). `WELT.emit('ticker', …)` reicht nur ein Argument weiter. Neue Meldungen als Zeile in `MELDUNGEN` (meldungen.js), verteilt über `WELT.runde % 6`.
- Prüflauf: feste Tageszeit; nur echte Raumschlüssel übergeben. Bekannte Meldungen: energie, halle2, Museums-Laufschrift. „Klickfläche fast leer“ heißt: das Gezeichnete steckt nicht in `withAlpha('<id>')`.
- KINDER entsteht in kinder.js, das nach den Räumen lädt: neue Kindertexte unten in kinder.js mit `Object.assign(KINDER, {...})`.
- Aufgaben-System gab es schon: Botengänge (`AUFTRAEGE`) und Knöpfe (`KNOEPFE`) in avatar.js. Neue Aufgaben = Botengang mit `nurStoerung` + Zustand in `WELT` + Anzeige in `reaktionen(key)` (welt.js ruft `stoerungZeigen`). `WELT.halt[key]` friert einen Raum ein.
- Aufgaben nur aktiv, solange R-101 gesteuert wird – sonst sieht der Zuschauer nie eine stehende Halle.
- Fahrzeuge am Rand eines Landschaftsbereichs per Clip aus dem Bild fahren lassen (H1ghlander, Sandstorm kommen von rechts herein).
- Sehr große Tiefen/Höhen: nichtlineare Skala über Stützpunkte und Hinweis „stark verkürzt“ im Bild; Tiefenleiste an der Wand entlang.
- Screenshot-Test mit Steuerung: Kamera folgt R-101; vor `fitRoom` `avSetAn(false)` (mit `?stoerung` läuft die Störung weiter).

## Vereinbart 15.10.2026 (Plan)
**A. Aufgaben für den steuerbaren Roboter (freiwillig)**
- Alles läuft auch ohne Mitspielen. Hinfahren löst etwas aus, das sonst nicht passiert. Kein Game-over, nur dezente Hinweise.
- Belohnung klein: Stempel im „Werkausweis“ oder Sonder-Animation (noch offen).
- Erledigt: **Förderband klemmt**. Als Nächstes: **Startflagge DARPA**. Später: Solarpark entsanden → Licht im Werk, Roboter mit leerem Akku zur Ladestation schieben, Bodenprobe vom Rover ins Labor.

**B. Wandernde Objekte zwischen Räumen**
- Gemeinsame Zeitleiste + eigene Ebene über den Räumen (Objekt gehört keinem Raum). Mit Tageszeit verzahnen; wander.js prüfen.
- Ideen: Lieferroboter mit Paket, verirrter Saugroboter, Ersatzteil-Staffel (Arm → Band → Laufroboter), Laufroboter nimmt Treppe / Radroboter wartet auf Aufzug.

**C. Wüste** (steht, c −25 bis −22; noch offen: Solarpark mit Reinigungsrobotern, Kamelrennen, Rover-Testgelände, Sandfisch, ALMA-Transporter, Saatgut-Drohnen)
- Kern: **DARPA Grand Challenge** in zwei Durchläufen – 2004 kommt keiner ins Ziel (bestes Fahrzeug knapp 12 km), 2005 schaffen es fünf, Stanley (Stanford) gewinnt. Botschaft: Scheitern gehört zum Entwickeln.
- Gags dezent: kleiner rostiger Müllsammler stapelt Würfel; Sandkriecher-Schatten am Horizont (Figuren nicht zeigen).

**D. Arktis** (steht; mögliche Ergänzungen: Unter-Eis-Gleiter/Argo-Float, Drohne vermisst Eisschollen, Eiskernbohrung von Hand, Wärmebild-Bärenwache, Radioteleskop von Ny-Ålesund)

**E. Übergänge** (Ozean/Graben/Arktis/Wüste erledigt; übrige Bereichsgrenzen bei Gelegenheit genauso angleichen, z. B. Gebirge/Stausee, Seehafen/Ozean, Feuerwache/Seehafen)

## Vereinbart 16.10.2026 (Plan, vom Nutzer bestätigt)
**F. Chipfabrik** (steht seit 20261016e; offen: UG mit Reinstwasser und Abluft, Anschluss ans Wasserwerk, Tour-Station)
- Eigenes Haus neben dem Rechenzentrum: Reinraum oben, Versorgung (Reinstwasser, Abluft) im UG, Anschluss ans Wasserwerk.
- Inhalt: Deckenschienen-Wagen (Overhead Hoist Transport) mit Wafer-Behältern, die sie an Seilen absenken; Vakuum-Roboterarme reichen Wafer weiter; Menschen in weißen Reinraumanzügen; Luftdusche am Eingang; gelbes Licht im Lithografie-Bereich; Belichtungsmaschine als geschlossener Kasten mit aufklappbarer, als vereinfacht markierter Schnittansicht.
- Roter Faden für Kinder: Sand (Wüste) → Silizium → Chip → KI-Schrank im Rechenzentrum. In kreislauf.js verknüpfen.
- Gag-Ideen: Staubkorn als „Staatsfeind Nr. 1“; Menschen wirken neben den Robotern wie die Fremdkörper.
- Zahlen (Anzahl Deckenwagen, Wafer pro Behälter, Reinraumklasse) vor dem Einbauen mit Quellen prüfen.

**G. News-Raum** (Studio steht seit 20261016f im Sendeturm; tägliche Aufgabe als Pull-Request-Vorschlag seit 20261016g)
- Täglich eine Robotik-Meldung, visualisiert. Seite liest `nachrichten.js` im Repo (Datum, Überschrift, 2–3 Sätze Kindersprache, Quelle, Kategorie, Figur, Hintergrund, Bewegung). Archiv zum Zurückblättern.
- Studio fest gezeichnet (Moderationstisch, großer Bildschirm, Kamera auf Schienen als Roboter). Bildschirm setzt die Meldung aus vorhandenen Baukasten-Teilen zusammen – keine täglich neu generierte Zeichnung. Laufband unten; Verweis „gibt's auch bei uns im Werk“ mit Klick zur Figur.
- Erst Raum mit 3–4 handgeschriebenen Beispielmeldungen bauen; tägliche geplante Aufgabe erst einrichten, wenn das Studio gefällt.
- **Themenfilter (fest):** keine Militär-/Waffenroboter, keine Unfälle mit Verletzten, keine Panikthemen (Jobverlust, „Roboter übernehmen“), nichts mit Sexualität oder sonst kritischen Robotik-Themen. Forschung/Prototyp/Produkt klar unterscheiden. Mindestens zwei Quellen. Nichts Geeignetes gefunden → Meldung vom Vortag bleibt stehen.

## Vereinbart 16.10.2026 (Plan, vom Nutzer bestätigt)
**H. Ideen hinter den Robotern sichtbar machen** (alle fünf aufnehmen; Reihenfolge-Vorschlag wie unten)
1. **Roboterblick:** Knopf schaltet einen Raum auf Sensor-Sicht: Lidar-Punktwolke, Erkennungs-Kästchen mit Prozent („Mensch 92 %“), Wärmebild. Botschaft: Roboter sehen Punkte und Wahrscheinlichkeiten, keine Bilder. Raum für Raum ausbauen.
2. **Roboter irren sich:** Szene mit Fehl-Erkennung (z. B. Muffin als Hund, Schild mit Aufkleber falsch gelesen) und Mensch, der nachprüft.
3. **Wer entscheidet?** Einheitliches Zeichen auf jeder Karte (Mensch steuert / Mensch passt auf / Roboter allein) plus Filter „ganz allein“.
4. **Selbst programmieren:** Blockfeld für R-101 („fahre 3 Felder“, „wiederhole“, „wenn Hindernis, dann warte“); R-101 führt wörtlich aus, auch Fehler.
5. **Was ein Roboter über uns speichert:** welche Daten (Grundriss beim Saugroboter, Straße bei der Klingelkamera) und wo man es abschaltet. Kindgerecht, ohne Angstmache.

## Nächster Schritt (Ideen)
1. Tägliche geplante Aufgabe „Robo-Nachrichten“ läuft (Pull Request statt Push). Bei Bedarf Quellenliste in tools/news_check.js erweitern.
2. Teil H, beginnend mit dem Roboterblick.
3. Chipfabrik-UG (Reinstwasser) und Tour-Station.
3. Startflagge DARPA als zweite Aufgabe (R-101 kommt nicht hin: Wüste ist als `berg` markiert, Weg dorthin klären). Danach weitere Wüsten-Motive.
4. Lieferroboter bringt Salatkisten von Farm 106 zur Kantine (passt zu Teil B); Trinkwasserleitung sichtbar bis zu den Häusern.
5. Tour-Stationen und Suchspiel-Aufgaben für die neuen Bereiche (Stausee, Bergwerk, Hafen, Ozean, Wüste, Marianengraben, Arktis).
6. Weitere Übergänge glätten (Teil E); Nachtvarianten einzelner Räume; Zugang zu oberen Stockwerken der anderen Häuser.
