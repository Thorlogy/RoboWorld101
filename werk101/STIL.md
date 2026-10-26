# Werk 101 – Stilregeln und Ablauf

Animierter Querschnitt durch ein Roboterhaus nach dem Vorbild von floor796. Jeder Roboter ist per Code (Canvas) gezeichnet. Planungsdokument mit Raumplan und Szenenideen: „Floor796 mit Robotern – Analyse und Plan“ (Claude Docs).

## Dateien
| Datei | Inhalt |
| --- | --- |
| `index.html` | Seite, CSS, Panel; lädt die Skripte in dieser Reihenfolge |
| `kit.js` | Welt (Maße, `ROOMS`), Zeichenhilfen, wiederverwendbare Roboterteile, `registerRoom`, Zustand |
| `rooms/<key>.js` | ein Raum: Zustandsfunktionen, `draw<Name>(f)`, Roboterkarten, `registerRoom(...)` |
| `runners.js` | Läufer über Räume und Stockwerke (Lieferroboter mit Aufzug, Fassadendrohne, Rohrpost) auf der globalen Uhr `state.g` (0–479 = 40 s) |
| `engine.js` | Umgebung, Baustellen, Aufzug, Kran, Ansicht, Eingabe, Panel |
| `game.js` | Suchspiel: Aufgaben mit Roboter-IDs, nur Klicks im Bild zählen, Fortschritt im Browser |
| `rooms/aussen.js` | Außengelände (Straße, Park) links neben dem Haus, Felder mit `c < 0`, ohne Wände |
| `dist/` | eigenständige Fassung für GitHub Pages oder jeden Webserver (mit vollständigem HTML-Gerüst) |
| `tools/check.py` | Prüflauf: JS-Fehler, Kontaktblatt, Schleifennaht |

## Neuer Raum in 6 Schritten
1. In `kit.js` beim Eintrag in `ROOMS` `plan: ...` durch `built: '<key>'` ersetzen.
2. `rooms/<key>.js` nach Vorlage unten anlegen.
3. In `index.html` `<script src="rooms/<key>.js">` vor `engine.js` eintragen.
4. Neuen Bereich (falls nötig) in `FILTERS` in `engine.js` ergänzen.
5. `python3 tools/check.py <key>` – Naht „ok“, keine JS-Fehler, Kontaktblatt ansehen.
6. Veröffentlichen mit `files` (alle JS-Dateien) und Stand im Projekt sichern.

```js
/* Raum: <Name> (<Ebene>) */
const XX = rx(roomOf('<key>').c), XY = ry(roomOf('<key>').r);
function fooPos(f) { /* f = 0..59, muss bei 59 -> 0 nahtlos sein */ }
function draw<Name>(f) { /* Raumkoordinaten 0..640 x 0..400, Boden bei y = 360 */ }
registerRoom({
  key: '<key>', name: '<Name>', level: '<Ebene>',
  hitOrder: ['klein', 'gross'],            // Klickreihenfolge: kleine Figuren zuerst
  robots: [{ id, name, bereich, aera, typ, fakt, note, color, box: f => [XX + x, XY + y, w, h] }],
  draw: draw<Name>,
});
```

## Zeichenregeln
- Raum 640 × 400, Boden-Oberkante y = 360, Bodenstreifen 360–400. Hintergrund-Schriftzug des Raums groß und blass (Alpha 0,13).
- Kontur `INK` (#2a2723), Linienstärke 2; Gliedmaßen über `limb()` (Kontur + Füllung).
- Mensch ≈ 120 Einheiten hoch (Kopf r = 11). Roboter im echten Größenverhältnis dazu.
- Farben: Industrie-Orange #d9542b, Logistik-Gelb #f0b429, Display #23384d mit Augen #7fd3ff, Cobot-Blaugrau #b9d0dc, Stahl #8a8f94 / #3b3d40, Holz #a8763f, Arbeitskleidung #3d5a80, Haut #e2b48f / #c99a74. LEDs: grün #7fe08a, aus #2d5b33.
- Schrift im Bild: Saira Condensed 700 für Schilder, IBM Plex Mono für Etiketten.
- Jeder Roboter wird in `withAlpha('<id>', () => ...)` gezeichnet, damit der Bereichsfilter greift.
- Zufall nur über `rnd(n)` mit Bildnummer als Saat – gleiches Bild sieht immer gleich aus.

## Animationsregeln
- 60 Bilder, 12 fps, 5 s. Jede Bewegung endet bei Bild 59 so, dass Bild 0 nahtlos folgt.
- Zeitfenster mit `seg(f, a, b)` und `ease()`; Bewegungen über `mix()` zwischen festen Posen.
- Jede Szene hat einen kleinen Witz: Ein Roboter tut, wofür er gebaut ist, und dabei geht etwas leicht schief oder trifft einen Roboter aus einem anderen Bereich.
- Querverweise zwischen Räumen sind erwünscht (Beispiel: die Fertigungshalle baut die Köpfe der Kellnerroboter).

## Roboterkarten
- `fakt`: zwei bis drei Sätze, nur geprüfte Tatsachen mit Jahr oder Ort; im Zweifel weglassen.
- `note`: ein Satz zum Witz der Szene.
- `echt`: was davon stimmt und was nicht (Anzeige „In echt:“ auf der Karte).
- `quelle`: Link zu einer Seite, die den Fakt belegt (meist Wikipedia; Seiten, die geöffnet und geprüft wurden: automate.org/Unimate, Wikipedia Paint robot und AGV, IEEE Spectrum PR2, VINCI Lyon).
- `offset` am Raum verschiebt seine Schleife, damit Gags im Haus zeitlich verteilt sind (gesetzt: Lager 35, Wohnen 22, Museum 28).
- Keine Markennamen im Bild; reale Firmen nur im Fakt.
- Bereiche bisher: Service, Haushalt, Logistik, Industrie, Mensch.

## Realismus (Kinder schauen zu)
- Jede Roboterkarte hat ein Feld `echt`: ein bis zwei Sätze, was an der Szene stimmt und was ein Witz ist. Menschen und Tiere brauchen es nur, wenn die Szene etwas Falsches nahelegt.
- Die Zeichnung zeigt den echten Aufbau: Antrieb (Räder, Ketten, Beine), Sensoren (Kamera, Laserscanner) und Bauform wie beim echten Gerät. Der Witz entsteht durch die Situation, nicht durch erfundene Technik.
- Keine Augen an Robotern, die keine haben; Kamera oder Sensor zeichnen. Display-Gesichter nur, wo echte Geräte sie haben (Servierroboter, Pflegeroboter).
- Keine Gefühlsszenen zwischen Menschen und Robotern (Herzchen, Roboter auf dem Schoß). Roboter zeigen, was sie tun, nicht was sie fühlen.
- Bauform nach echtem Vorbild prüfen, bevor gezeichnet wird (Beispiele: Mähroboter flach und rund mit großen Hinterrädern; Bohrwagen mit Kabine, Ausleger, Lafette und Bohrhammer; Museumsstücke nach Fotos der Originale).
- Roboter nicht direkt am Körper von Tieren oder Menschen arbeiten lassen (kein Melken, keine Pflege am Körper). Tiere und Menschen dürfen neben Robotern stehen und sie nutzen.
- Roboter, die laufen können, sollen sich auch bewegen; Stillstand nur, wenn das echte Gerät steht.
- Erfundenes muss erkennbar Spaß sein (Möwe, Kreideumriss, Achselzucken) und auf der Karte als solcher benannt werden.

## Gelernt aus den ersten 9 Räumen
- Szene vorher in drei Zeilen skizzieren: Hauptfigur, Gag, Querverweis.
- Feste Posen + Zeitfenster (`seg`, `ease`, `mix`) – dann schließt die Schleife zuverlässig.
- Der beste Witz kommt aus dem echten Zweck des Roboters (Cobot zuckt zurück, Handtuchfalten dauert ewig).
- Haupt-Gags über das Haus zeitlich verteilen; nicht alle zwischen Bild 20 und 40.
- Hintergrund-Schriftzug höchstens 40 px und nicht rechts außen; Szenen nicht nach rechts hin überfüllen.
- Figuren in der Gesamtansicht müssen lesbar bleiben: nichts unter ca. 50 Einheiten Höhe als Hauptfigur.
- Beim Verschieben einer Zeichnung die Klickfläche (`box`) mitziehen.
- Faktenzeilen einzeln prüfen (Fehler bisher: Schachautomat 1770, nicht 1769).
- Prüflauf meldet jetzt auch: überstehende Schrift (Hinweis, Testschrift ist breiter), leere Klickflächen, Karten ohne `echt`.

## Läufer
- `registerRunner({ room, draw(g), robot })`; `g` läuft 0–479. Läufer dürfen Wände nur an gezeichneten Durchgängen queren und nutzen den Aufzug (Kabine folgt `cabinY(g)` in runners.js).
- Neue Läufer müssen ihre Wege so legen, dass sie bei g = 479 → 0 nahtlos weiterlaufen.

## Suchspiel
- Neue Aufgaben in `game.js` als `{ text, ids, need }` eintragen. Nur IDs verwenden, die es gibt; neue Räume können eigene Aufgaben bekommen.

## Stand
- Alle 27 Felder gebaut (12. Oktober 2026). Neu dazugekommen: Mars-Testgelände (Dach), Apotheke (Ebene 5), Supermarkt (Ebene 4), Filmstudio (Ebene 2), Recyclinghof (Ebene 1), Containerhafen (EG), Raumstation-Training (UG 1), Bücherspeicher und Kellerbaustelle (UG 2).
- Gag-Zeitfenster der neuen Räume (Bild): Mars 35–50 · Apotheke 0–20 · Supermarkt 45–60 · Film 15–30 · Recycling im 40-s-Takt · Hafen 20–35 · Training 5–20 · Bücher 50–5 · Baustelle 40–55.
- Läufer: Lieferroboter (Lager → Aufzug → Supermarkt → Kantine → Aufzug → Recyclinghof → Lager), Fassadendrohne, Rohrpost Krankenstation → Labor, Rohrpost Apotheke → Krankenstation.
- Paketreise (12. Oktober 2026): Paketentlader auf dem Steg im Hafen (EG) → Hauslieferroboter → Aufzug (fährt jetzt auch ins EG, Bild 416–100) → Ebene 4 → Bewohner im Wohnbereich (Bild 240–476: Karton, darin eine rote Socke) → leerer Karton auf den Stapel. Knopf „Paket verfolgen“ führt die Ansicht mit (`paketFokus(g)` in runners.js, `setFollow` in engine.js). Wohnbereich liest dafür `state.g` (Funktion `opaPaket`).
- Querverweise: Möwe auf dem Dach und am Hafen; Socke aus der Kantine landet im Recyclinghof als Störstoff; Supermarkt-Scanner meldet die Lücke des Lieferroboters; Bücherspeicher schickt ein Buch zur Schule; Rover-Zwilling auf dem Mars-Gelände neben der Satelliten-Werkstatt; Baukran auf dem Dach und Kellerbaustelle.
- Namen von Hilfsfunktionen müssen hausweit eindeutig sein (Fehler gehabt: `agvX` doppelt) – bei neuen Räumen Präfix verwenden.
- Filter: zusätzlich Medien, Umwelt, Bau.
- Außengelände: Straße (Robotaxi am Zebrastreifen, Gehweg-Lieferroboter) und Park (autonomer Shuttlebus, Kehrmaschine). Insgesamt 29 Felder, 129 Figuren.
- Faktencheck Runde 2 erledigt: Johnny-5-Steuerung, Astrobee-Antrieb, Mansueto-Kapazität, Altenwerder-Transponder, Bad Birnbach, Spyce bestätigt oder korrigiert.

## Pflege (Stand 12. Oktober 2026)
- Schriften liegen lokal in `fonts/` (woff2 aus Fontsource, Lizenz `fonts/OFL.txt`). Keine Verbindung zu Google.
- Versionsnummer: Alle Skripte und `fonts.css` werden mit `?v=<Datum><Buchstabe>` geladen. Bei jeder Veröffentlichung die Nummer in `index.html` hochzählen, damit Browser keine alten und neuen Dateien mischen.
- Kinderfassung: `kinder.js` (Objekt `KINDER`, zwei kurze Sätze je Roboter-ID). Schalter „Einfach erklärt“ im Panel, Wahl im Browser gespeichert. Neue Roboter bekommen hier einen Eintrag.
- Hinweis „Über diese Seite“ steht unten im Panel (index.html).
- Faktencheck Runde 3: Tischtennis-Rekord 2015 (nicht 2016), Krankenhaus-Transportroboter mit Passwort und Fingerabdruck, 21 Quellen ergänzt, 7 umgeleitete Wikipedia-Links aktualisiert. Ohne Quelle bleiben: fenster, buerste, loeschrob, scanner (kein passender Artikel).
- Veröffentlichen ohne Git-Zugang: im GitHub-Upload-Dialog mehrere Dateien auf einmal hochladen (ein Commit pro Ordner).
- Außengelände erweitert (12. Oktober 2026): Feld (c −3, Säh- und Jäteroboter mit Krähe, Landwirtin) und Energiepark (c −4, Putzroboter auf Solarreihe mit Staubwolke, Wartungsroboter am Rotorblatt, Schaf unter den Modulen). Beide laufen auf der globalen Uhr `state.g`, weil die Roboter langsam sind. Neuer Filter „Energie“. `fitAll` nimmt jetzt das am weitesten links liegende Feld. Insgesamt 31 Felder, 138 Figuren. Version 20261012c.
- Nächster Schritt geplant: Park im Stil von Solarpunk umgestalten.
- Ausbau 12. Oktober 2026, Version 20261012d:
  - Felder rechts neben dem Haus: `rx(c)` für c ≥ 3 liegt rechts vom Aufzugsschacht. Schulweg (r 6, c 3) und U-Bahnhof (r 7, c 3, unter der Erde). Außenfelder werden über `outdoor: true` erkannt, nicht mehr über c < 0.
  - Park im Solarpunk-Stil: begrüntes Solardach über der Haltestelle, Hochbeet mit Gartenroboter (FarmBot).
  - U-Bahnhof: fahrerlose U-Bahn (Nürnberg 2008), Kind an der Frontscheibe, Anzeige zählt bis zum nächsten Zug.
  - Schulklasse (Läufer in rooms/schulweg.js): steigt aus der U-Bahn, Treppe hoch, winkt der Fassadendrohne, geht nach rechts weiter.
  - Wetter und Tageszeit: Knopf „Wetter“ (Sonne, Regen, Abend) in `state.wetter`. Regen und Abdunkeln nur außerhalb des Hauses und über der Erde. Außenfelder können `glow(f)` für Lichter am Abend mitgeben. Mähroboter bleibt bei Regen und abends in der Station, abends läuft ein Igel über den Rasen. Menschen draußen bekommen bei Regen Schirme (`schirm()` in aussen.js).
  - Insgesamt 33 Felder, 143 Figuren.
- Tour, Schutzfeld und Schule 102 (12. Oktober 2026, Version 20261012f):
  - `tour.js`: Knopf „Tour starten“, 13 Stationen, Texte normal und „Einfach erklärt“, Pfeiltasten, Link `#tour`. Neue Station = Eintrag in `STEPS` (id, optional g und wetter).
  - Schutzfeld: `SAFETY` in kit.js (Roboter-ID → Rand in Einheiten). Zeichnen mit `heldDraw(id, f, f => …)` bzw. `heldG(id, state.g)`, die Engine hält die Uhr des Roboters an, solange Maus oder Finger im Feld sind, und zeigt „Stopp · Schutzfeld“.
  - Zweites Gebäude: Räume mit `haus: 2` in ROOMS (Spalten 4–5, Reihen 4–6), Hülle in `drawSchool()` (engine.js), Räume in `rooms/campus.js` (Präfix c2). `HOUSES` schließt beide Häuser von Regen und Abenddunkel aus.
  - Schule 102: Eingangshalle (Reinigungsroboter wischt die Spur der Klasse weg, Schutzfeld), Robotik-AG (RoboCup Junior Linienfolger), Klassenzimmer (Avatar-Roboter AV1), Informatikraum (Calliope mini), Bewegungsraum (NAO), Lehrerzimmer (Kaffee-Roboterarm).
  - Insgesamt 39 Felder, 155 Figuren.
- Himmel und Halle 103 (12. Oktober 2026, Version 20261012g):
  - `himmel.js` (nach runners.js geladen): zwei Flugtaxis ohne Pilot hoch über allen Häusern (EH216-Bauform, eins nah, eins fern), Lieferdrohne mit Seilwinde (Nest auf dem Dach von Werk 101, lässt der Landwirtin am Feld ein Paket hinab) und Paketdrohne zur Paketstation auf dem Dach der Schule 102. Bei Regen fliegt nichts. Läufer können `glow(g)` für Lichter am Abend mitgeben.
  - Halle 103 (`haus: 3`, r 6, c 6.5, Hülle `drawHalle()` in engine.js, Raum `rooms/dunkel.js`): dunkle Fabrik. `state.licht` ist anfangs aus; ein Klick auf den Lichtschalter (ID `lichtschalter`) schaltet um. Im Dunkeln leuchten nur Kontrolllampen. Gags: Anzeige „Tage im Dunkeln“ springt auf 0, Motte fliegt zur hellsten Stelle.
  - Ansicht „Ganzes Haus“ zeigt mehr Himmel (TOP − 560). Insgesamt 40 Felder, 164 Figuren.
- Solarpark und größeres Flugtaxi (12. Oktober 2026, Version 20261012h):
  - Neues Außenfeld Solarpark (r 6, c −5, `rooms/solar.js`, globale Uhr): Installationsroboter auf Ketten (Vorbild AES Maximo, Schutzfeld) setzt acht Module von rechts nach links, Drohne mit Wärmebildkamera über der hinteren Reihe, Taube als heißer Fleck im Wärmebild, Batteriespeicher (Anzeige füllt sich tagsüber), senkrechte Agri-PV-Module mit Getreide.
  - Das nahe Flugtaxi ist jetzt ein Senkrechtstarter mit Flügeln, sechs Schwenkpropellern, Pilot und vier Fahrgästen (Vorbild Joby S4), Maßstab 1. Das ferne bleibt der zweisitzige Multikopter ohne Pilot.
  - Insgesamt 41 Felder, 169 Figuren.
- U-Bahn, Tunnelbau, geheimer Raum, Himmel bei Nacht (12. Oktober 2026, Version 20261012i):
  - U-Bahn mit vier Wagen; der Zug kommt von rechts durch den Tunnel (globale Uhr 400–480), hält 0–200 und fährt nach links weiter. `ubTrain(x, g)` in ubahn.js zeichnet ihn, `ubLocal(room)` in ubahn2.js rechnet die Position in andere Felder um.
  - Neue Felder unter der Schule 102: U-Bahnsteig Ost (r 7, c 4, Auskunftsroboter, Aufzug zur Schule), U-Bahn-Tunnel (r 7, c 5, Inspektionsroboter an der Deckenschiene, Signal, Notausgang), Tunnelbau Nachläufer und Bohrkopf (r 8, c 4–5, `rooms/vortrieb.js`: Tunnelbohrmaschine „Ida“, Tübbing-Erektor, Versorgungszug, Geologin fischt einen Ammoniten vom Förderband). Beim Vorschub (400–480) wandern Ringe und Erde um eine Ringbreite nach links, so schließt die Schleife.
  - Geheimer Raum: ROOMS-Eintrag mit `secret: true` (Geheime Spielhalle, r 8, c 6, `rooms/spielhalle.js`). Unsichtbar und nicht anklickbar, bis man im Tunnel dreimal auf den Notausgang klickt (`knock()` und `unlockSecret()` in engine.js, gespeichert unter `werk101-geheim`). Inhalt: Würfel-Roboter (0,305 s), Jenga-Roboter (MIT), Curling-Roboter (Korea University). Figuren aus Videospielen werden nicht gezeichnet.
  - Filmstudio: Lichttraverse mit zwei Scheinwerfern und einem beweglichen Scheinwerfer (folgt dem Kameraarm), Lampe „Aufnahme“, Tonangel, Filmklappe.
  - Reinraum: statt des zweiten Marsrovers ein Andock-Simulator mit zwei Industrierobotern (DLR OOS-SIM). Das Selfie macht jetzt der Rover-Zwilling auf dem Mars-Testgelände.
  - Himmel (`himmel.js`): bei „Abend“ eine Satellitenkette und ab und zu die Raumstation als heller Punkt; Raketenstart zwischen Schule 102 und Halle 103, die erste Stufe landet wieder auf dem X (bei Regen kein Start).
  - Insgesamt 45 Felder plus ein geheimes, 188 Figuren.
- Überarbeitung (12. Oktober 2026, Version 20261012j):
  - Schule 102 hat nur noch zwei Stockwerke (Reihen 5 und 6); Bewegungsraum und Lehrerzimmer sind entfernt. Klasse 4b mit Whiteboard, Fenster, Kinderbildern und Bodenroboter Biene (Bee-Bot). Informatik mit Beamer und CodeON (Blockprogrammierung auf Basis des Open Roberta Lab); der Würfel-Fehler steht im Block „zufällig von 6 bis 6“. Halle mit Bilderwand, Schließfächern, Uhr; Robotik-AG mit 3D-Drucker, Bauteilregal, Pokal und der Kiste Ersatzräder von der Paketdrohne. Helfer in campus.js: `c2Window`, `c2Art`, `c2Plant`, `c2Clock`.
  - U-Bahn in echter Größe: Wagen 320 lang, Dach bei y 150, zwei Doppeltüren je Wagen (`ubDoorX(wagen, tür)`), Halt bei x 10.
  - Rakete 2,4-mal größer (`RK_K`), Satellitenkette (y −470 bis −420) und Raumstation (y um −520) liegen jetzt deutlich über den Flugtaxis; „Ganzes Haus“ zeigt dafür mehr Himmel (TOP − 920).
  - Zweiter geheimer Raum „Denkspiele“ (r 8, c 7, `rooms/denkspiele.js`), wird zusammen mit der Spielhalle freigeschaltet: ELIZA (1966) zum Selberchatten im Fenster unten links, Deep Blue (1997) mit Helfer, der die Figuren zieht, AlphaGo mit Zug 37 (2016), ein Programm, das Breakout lernt und den Tunneltrick findet (2015). Karten können `onSelect` mitgeben; engine.js ruft es beim Auswählen auf.
  - Insgesamt 43 Felder plus zwei geheime, 194 Figuren.
- Überarbeitung (12. Oktober 2026, Version 20261012k):
  - Haus 4 „Rechenzentrum“ (r 6, c 8 und 9, `rooms/rechenzentrum.js`, Gebäude `H4`/`drawRZ` in engine.js): Serverhalle mit Bandroboter, Serverschränken, KI-Schrank und Technikerin; Leitwarte mit Agenten-Schwarm (Chef-Agent und acht Helfer, Bild 0–52), Tauchkühlung und Abwärme. Zwischen Halle 103 und Rechenzentrum steht ein Funkmast (`RZ_MAST`), auf dem Dach eine Satellitenschüssel (`RZ_DISH`).
  - Knopf „Datennetz“ (`netz.js`, `state.netz`): dunkelt die Welt ab und zeigt Glasfaser im Boden, Leitungen in den Häusern, Funkwellen vom Mast und die Verbindung zum Satelliten. Pakete laufen mit `state.g` und sind nach 480 Takten wieder am Start; Strichstärken und Schilder wachsen beim Herauszoomen mit (`k = 1 / state.z`).
  - „Raumstation-Training“ ersetzt durch das Lernlabor (`rooms/lernen.js`, Motto „So lernen Roboter“): Greifarm-Farm, Lauf-Simulation mit Vierbeiner auf dem Laufband, Lernen durch Vormachen (Führungsarm). Die Raumstation am Himmel gehört jetzt zum Raum `satellit`.
  - Labor: Sensorwand mit Lidar, Ultraschall, Kamera, Wärmebild und Radar, alle schauen auf denselben rollenden Ball. Museum: Laufschrift „Ruhmeshalle“ und Plakat mit Asimovs drei Robotergesetzen (in eigenen Worten, als erfunden gekennzeichnet). Klasse 4b: Regal mit NAO, Baustein-Roboter und Baukasten-Greifarm; Pepper begrüßt in der Schulhalle.
  - Fahrzeuge in echter Größe: `car()` ist 4,6 m lang (316), Räder 68 cm; der Shuttlebus 4 m × 2,75 m; die Kehrmaschine 1,9-mal größer. Maßstab: 1 m ≈ 69 (Mensch 118 hoch).
  - ELIZA-Chat mittig über allem, tippt Buchstabe für Buchstabe; Tasten im Eingabefeld gehen nicht mehr an die Welt (vorher hielt die Leertaste die Animation an). Dreimal Klopfen am Notausgang versteckt die geheimen Räume wieder (`lockSecret`).
  - Insgesamt 45 Felder plus zwei geheime, 213 Figuren.
- Ergänzung (13. Oktober 2026, Version 20261013a):
  - Halle 103 hat ein Obergeschoss „Montage“ (r 5, c 6.5, `rooms/montage.js`, `H3` jetzt zweistöckig): SCARA setzt Chips im 20er-Takt, Humanoider holt Blechteile aus dem Regal, Hexapod rüttelt ein Bauteil.
  - Stall: Melkroboter mit Laser und Bechern (`drawMelk` in stall.js). Satelliten-Werkstatt: Würfelroboter der Raumstation auf dem Granittisch (Luftkissen), Technikerin steht jetzt bei x 196.
  - Leitwarte: Kilobots-Tisch mit Deckenkamera, der Schwarm bildet ein K (Vergleich zum Agenten-Schwarm).
  - Suchspiel: Aufgaben, die mit „Geheim“ beginnen, erscheinen erst nach dem Freischalten; Zähler zählt nur sichtbare Aufgaben.
  - Insgesamt 46 Felder plus zwei geheime, 219 Figuren.
- Ergänzung (13. Oktober 2026, Version 20261013b):
  - Haus 104 ganz rechts (c 10.5, `H5`/`drawH5` in engine.js, `rooms/haus104.js`): unten Imbiss mit Pizzastraße und weichem Greifer, oben Pflege mit Hebe-Roboter (fährt rückwärts vom Bett zum Rollstuhl und zurück, `liftPos`), Pflegerin mit Rücken-Exoskelett und Mann mit Handprothese.
  - Feld: fahrerloser Traktor zieht in der Ferne über die Hügel (`drawTractor`, Maßstab 0,2, läuft mit `state.g`).
  - Insgesamt 48 Felder plus zwei geheime, 227 Figuren.
- Ergänzung (13. Oktober 2026, Version 20261013c):
  - Magnetschwebebahn hinter allen Häusern (`drawMaglevBack` in himmel.js, aufgerufen in `drawSurroundings`): Stelzenstrecke bei `GROUND - 330`, drei Wagen, fährt einmal pro `RUN_P` von links nach rechts; am besten zwischen den Gebäuden und rechts von Haus 104 zu sehen.
  - Rakete steigt jetzt bis über die Dächer (Stufentrennung bei `RK_SEP = 3000`), Oberstufe öffnet die Spitze (Bild 204–214), Satellit treibt davon und klappt die Solarflügel aus (`rkUpper`, `rkSat`).
  - Insgesamt 48 Felder plus zwei geheime, 228 Figuren.
- Ergänzung (13. Oktober 2026, Version 20261013d):
  - Neue Außenfläche ganz links `flughafen` (`rooms/flughafen.js`): fahrerloser Gepäckschlepper, Roboterarm für Koffer, fahrerloser Lkw (zieht einmal pro `RUN_P` über die Zubringerstraße).
  - Unter der Erde rechts (`rooms/tief.js`): Beschleunigertunnel mit Messroboter an der Deckenschiene (`cern`) und Heiße Zelle für den Kernkraftwerk-Rückbau mit fernbedientem Greifarm hinter Bleiglas (`heisszelle`).
  - Solarpark: Freileitung mit zwei Masten und Leitungsroboter, der auf dem Seil entlangfährt.
  - Didaktik: Plakat „Fühlen – Denken – Handeln“ in der Schulhalle (eigene Karte `grundidee`), Tour-Start erklärt dasselbe. Kindertexte jetzt auch für alle Tiere und Spielzeuge. Fehlende Quellen nachgetragen, Pepper-Karte in der Schule auf den Unterricht ausgerichtet (Empfangs-Pepper steht im Eingang), Forpheus-Rekord auf 2016 korrigiert.
  - Insgesamt 51 Felder plus zwei geheime, 236 Figuren.
- Tageszeit, Raum-Zusammenspiel und eigene Figur (14. Oktober 2026, Version 20261014a):
  - `welt.js` (nach himmel.js, vor engine.js): Uhr mit Phasen morgen 6–11, mittag 11–17, abend 17–22, nacht 22–6 (`WELT.phase`, `istDunkel()`, `istNacht()`). Knopf „Zeit“ wechselt Uhr → Morgen → Mittag → Abend → Nacht. Testen mit `?phase=nacht`, `?stunde=12`, `?tag=fr`. Das Wetter kennt nur noch Sonne und Regen; „Abend“ ist jetzt eine Tageszeit (`setWetter('abend')` stellt sie für die Tour um). In Räumen statt `state.wetter === 'abend'` immer `istDunkel()` verwenden.
  - welt.js legt sich um alle `draw`- und `box`-Funktionen: geschlossene Räume (`ZU`, z. B. Kantine nachts) frieren auf Bild 0 ein, Menschen und Tiere verschwinden, Roboter zeigen ein Ladezeichen, Schild „Geschlossen · Roboter laden“. `NUR` blendet Figuren zeitweise aus (Schulklasse nur morgens und mittags). Weitere Schilder: Apotheke Notdienst, Krankenstation Nachtschicht, Fertigung Mittagspause (12 Uhr), Eingang Freitag ab 15 Uhr.
  - Ereignisbus `WELT.on/emit/seit`. Hausweit: Schichtwechsel zur vollen Stunde (oder Schichtglocke) schaltet Rundumleuchten in allen Hallen aus `SIGNAL`. Not-Halt: `WELT.halt[raum] = { bis, f }` friert einen Raum ein.
  - Nachtstreife: Sicherheitsroboter (Vorbild Knightscope K5) zwischen Halle 103 und Rechenzentrum, tagsüber an der Ladeplatte.
  - `avatar.js`: R-101 (Vorbild TIAGo), Knopf „Selbst steuern“. Pfeiltasten/AD fahren, ▲▼ Aufzug, E drücken, G greifen, F fragen; Klick ins Bild fährt hin (engine.js reicht Klicks über `avClick` weiter). Befehle als Text oder Kacheln („gehe zum Lager, greife, gehe zur Garage, lege ab“). Wege: jede Etage von Werk 101 über den Aufzug, EG und UG 1 durchgehend; obere Stockwerke der anderen Häuser haben noch keinen Zugang. Der Aufzug wird für R-101 gerufen (`cabinY` ist umhüllt), danach gleitet die Kabine zurück in ihren Fahrplan.
  - Sechs Botengänge (`AUFTRAEGE`) verbinden Räume (Fertigung → Prüfstand, Lager → Garage, Apotheke → Krankenstation, Hafen → Supermarkt, Bücherspeicher → Schule, Recyclinghof → Wohnbereich); Fortschritt in `rw101-botengaenge`. Knöpfe: Not-Halt (Fertigung), Schichtglocke (Eingang), Lichtschalter (Dunkle Fabrik), Notausgang (Tunnel).
  - `tools/check.py` lädt jetzt mit `?phase=mittag&stunde=10`, damit das Ergebnis nicht von der Uhrzeit abhängt.
- Reaktionen zwischen Räumen (14. Oktober 2026, Version 20261014b), alles in `reaktionen(key)` in welt.js:
  - Bauteil auf den Prüfstand geliefert → Schild „Prüfung läuft“, dann „In Ordnung ✓“ (10 s, Ereignis `geliefert:teil`).
  - Lichtschalter in der Dunklen Fabrik (Klick oder R-101) → Leitwarte im Rechenzentrum meldet „Licht an · etwa +40 kW“ bzw. „Strom gespart“ (Ereignis `licht`).
  - Not-Halt in der Fertigung → kurz danach steht auch das Lager („wartet auf Teile“), `WELT.halt[raum].grund` für eigenen Text.
  - Nachts: Krankenstation fordert ein Medikament an (Bild 150–250), die Apotheke schickt genau eine Rohrpost-Kapsel (Bild 210–270, runners.js); tagsüber fährt die Rohrpost wie bisher alle 5 s.
- Rundgang-Vierbeiner (14. Oktober 2026, Version 20261014c): `wander.js` (nach avatar.js). Laufroboter nach dem Vorbild Spot mit Eigenleben: sucht sich zufällig einen erreichbaren Raum, schaut sich um, sagt einen Satz (allgemein `WD_SAG`, je Raum `WD_RAUM`), setzt sich manchmal, geht bei Akku unter 25 % zur Ladestation in der Eingangshalle und grüßt R-101. Nutzt die Wege und den Aufzug aus avatar.js; wer den Aufzug zuerst hat, fährt, der andere wartet. Bewusst keine Schleife – ausgenommen von der Regel „nahtlos bei Bild 59“. Nach Anklicken folgt ihm die Ansicht (`onSelect`).
- Science-Fiction-Deck (14. Oktober 2026, Version 20261014d): Außenfeld r 6, c 12 rechts von Haus 104 (`rooms/scifi.js`, Präfix `sf`), neuer Filter „Science-Fiction“. Thema „Film gegen Echt“: Teleporter (ausgedacht, Karte erklärt Quantenteleportation, Zeilinger 1997/Nobelpreis 2022), Film-Android (ausgedacht) und Ameca (echt, Engineered Arts 2021, kann nicht laufen). Jede zweite Runde (`SF.runde`, zählt Überläufe von `state.g`) schwebt das erfundene Raumschiff RW-101 heran, beamt den Film-Androiden herunter, der scannt Ameca (Ameca staunt per Mimik) und wird wieder hochgebeamt. Alles Ausgedachte trägt ein gelbes Schild „Ausgedacht“, Ameca ein grünes „Echt“. Keine Figuren aus Filmen gezeichnet.
- Welt-Ausbau (15. Oktober 2026, Version 20261015a):
  - Wetter jetzt Sonne, Wolken, Regen, Nebel, Schnee (`wetterEffekte` und `wolken()` in welt.js). Bei Regen, Schnee und Nebel fliegt nichts (`regen()` in himmel.js = `schlechtesWetter()`); Mähroboter fährt nur bei Sonne und Wolken. Schnee: Flocken, Schneedecke auf Boden, Außenfeldern und Dächern; Schneeräumroboter im Park (Vorbild Yarbo, `rooms/extras.js`).
  - Lange Uhr: `WELT.runde` zählt Überläufe von `state.g`, `langeUhr(n)` gibt 0 … n·480−1.
  - Neue Außenfelder links: Magnetbahn-Bahnhof (c −7, ab Version 20261015b: Halle unten mit Reinigungsroboter nach Avidbots Neo, Rolltreppe hinauf zum Bahnsteig am Fahrweg, `mgStation` in rooms/bahn.js; der Schnellzug fährt dort nicht mehr), Zugwerk (c −8, E-Check Köln-Nippes: Kameratore, Cobot mit zwei Armen, Unterflur-Prüfgerät MUFIG), Paketzentrum (c −9, Paketterminal nach Cleveron, Roboterarm, fahrerloses Lieferauto nach Nuro R2 über `langeUhr(4)` bis vor Werk 101 und zurück, Wirtschaftsweg unten über die linken Felder).
  - Magnetschwebebahn hält jetzt 80 Bilder am Bahnhof (`mgX` in himmel.js), Fahrweg verlängert.
  - Neue Außenfelder rechts (`rooms/rechts.js`): Ladepark (c 13, Laderoboter nach Hyundai ACR, Solardach, Batteriespeicher lädt tags und leert sich abends), Fusionsforschung (c 14, Plasma 0–180, danach fährt der Fernhantierungs-Arm nach Vorbild MASCOT/JET hinein und tauscht eine Kachel; Leitstand links), Feuerwache (c 15, Löschroboter nach Colossus übt am Gas-Übungscontainer, Feuerwehrfrau mit Fernbedienung).
  - Förderbrücke (`rooms/extras.js`) von der Montage in Halle 103 schräg über den Funkmast aufs Dach des Rechenzentrums.
- Umbau (15. Oktober 2026, Version 20261015c):
  - Science-Fiction-Deck wieder entfernt (rooms/scifi.js gelöscht, Filter „Science-Fiction“ weg).
  - Schnellzug aus dem Magnetbahn-Bahnhof heraus: Tiefbahnhof (UG 1, c 8–9, `tbf1`/`tbf2`, Vorbild Stuttgart 21 mit Kelchstützen und Lichtaugen) unter dem Rechenzentrum, Zugwerk (UG 2, c 8–9, `zugwerk`/`zugwerk2`) darunter. Beide sind Doppelfelder: `drawTiefPaar(f, off)` / `drawZugwerkPaar(f, off)` zeichnen in Paar-Koordinaten (PAAR = RW + WALL), Karten hängen am linken Feld.
  - Paketzentrum jetzt c −8. Rechts verschoben: Ladepark c 12, Fusion c 13, Feuerwache c 14.
  - Seehafen c 15–19 (`rooms/seehafen.js`, Präfix `sh`/`SH_`, Konstante `SHHX`): Maßstab 1 : 4 (1 m ≈ 17 Einheiten), alles in einem Läufer ohne Zuschnitt, Felder leer. Containerbrücke, AGV und Lagerkran nach CTA Altenwerder; Containerschiff nach Yara Birkeland; Festmacher-Roboter nach MoorMaster; Rumpfreiniger nach HullSkater; ferngesteuertes Binnenschiff nach Seafar fährt unter der Hubbrücke durch (Fahrbahn hebt sich, `shLift`); Molenfeuer mit Lichtstrahl am Abend; Möwe auf dem Ausleger. Container-Ablauf über `langeUhr(2)`: Runde 1 entladen, Runde 2 dieselben Wege rückwärts (beladen). Wasserfelder haben `wasser: true` – R-101 und der Vierbeiner gehen dort nicht hin (avatar.js `avSegs`).
  - Hintergrund, Erde, Wolken und Sterne reichen jetzt bis weit nach rechts (engine.js, welt.js).
- Hohe See und Bergwerk (15. Oktober 2026, Version 20261015e):
  - Hohe See c 20–23 (`rooms/meer.js`, Präfix `mr`/`MR_`, Wasserfelder), Maßstab 1 : 12: Frachter mit zwei Flügelsegeln nach Pyxis Ocean/WindWings (Segel drehen sich mit dem Wind), Plastik-Sammelbarriere nach The Ocean Cleanup System 03 (zwei Schlepper, Sack füllt sich Bild 0–380, wird 380–450 an Bord geleert, Fisch schwimmt durch die Tierschutz-Klappe). Im Hafenbecken (1 : 4) sammelt ein WasteShark Flaschen.
  - Bergwerk unter Tage UG 1 c −5/−4 (`rooms/mine.js`, Doppelfeld, Maßstab 1 : 2): automatischer Fahrlader nach Sandvik AutoMine in Kiruna mit Kabeltrommel, Erzrolle, Kartierungsdrohne nach Hovermap, Leitstand über Tage als Bild im Bild, Schild „Automatikbereich – kein Zutritt“. Neuer Filter „Rohstoffe“.
  - Binnenschiff wartet jetzt näher an der Hubbrücke (`SH_BIN_AUS`), Brücke senkt sich erst ab Bild 420.
  - Stolperfalle: `person({ foot: 0 })` nimmt 358, weil 0 als „nicht gesetzt“ gilt – bei skalierten Figuren `foot: 0.001` verwenden.
- See sichtbarer (15. Oktober 2026, Version 20261015g): Flügelsegel grau-blau mit weißen Feldern und rotem Streifen; Plastik als erkennbare Flaschen, Tüten, Becher, Netzreste (`mrPlastik`); Fischschwärme und große Fische (`mrFisch`) nach dem Wasserschleier gezeichnet; Meeresschildkröte mit Karte (Tüte sieht aus wie Qualle). „Zum Raum“ zeigt bei Hafen- und Seefeldern auch Unterwasser und Kräne (`fitRoom` in engine.js).
- Farm 106 (15. Oktober 2026, Version 20261015h): vertikale Farm in c 12 (r 5 Anbau, r 6 Ernte, `rooms/farm.js`, Präfix `fm`/`FARM`), alle Felder rechts davon um eine Spalte verschoben (Ladepark c 13 … Hohe See c 21–24). Hülle zeichnet ein Läufer nur in den Fugen; das Haus wird per `HOUSES.push` bei DOMContentLoaded vor Regen und Nachtschatten geschützt. Ablauf (state.g): Regalroboter holt Schale aus Etage 6 (0–260) → Schacht → Band → Schneidstation (380–400) → Packarm (400–470) → Kisten „Für die Kantine“. Kamera auf Schiene, Säroboter, Nährstofftank, lila LED-Licht mit Dunkelphase der obersten Etage. Karten: Jones Food Company (17 Etagen, Roboter Frank), Pleiten 2024 (Plenty, Bowery) wegen Stromkosten.
- Kreisläufe und Verbindungen (15. Oktober 2026, Version 20261015r):
  - Gebirge umgebaut: Felder jetzt c −21 bis −13 (`berg1`…`berg9`). Oben fährt die Magnetbahn durch die fertige Röhre (Höhe MG_Y passt genau zur Plateauhöhe GROUND − 300), weiter über das Plateau und auf Stelzen über den Stausee. Der Zug wird dort per Clip mit `drawMaglevBack` neu gezeichnet. Die Baustelle ist die zweite Röhre auf Bodenhöhe mit Portal West: Sie wird in den alten Koordinaten gezeichnet und mit `bgSpiegel` (translate 2·BG_MX, BG_DY = 300, scale −1) gespiegelt; Schrift über `bgText`, Klickflächen über `bgM`. Fahrweg und Zugstart in himmel.js reichen jetzt bis −17500/−15000.
  - Schnee: am Berg als dünne Decke auf der Oberfläche (`bgSchnee`, ausgefranst, Felsköpfe, Schneefahne), Hintergrundgipfel mit `schneeKappe`. Wetter Schnee: Flocken in drei Tiefen mit Kristallen und Wind, wellige Schneedecke, Verwehungen an Hauswänden, Dächer mit Überhang und Eiszapfen, Schneemann in der ersten breiten Lücke.
  - Neues Wetter Gewitter (`WELT.gewitter`, intern `state.wetter = 'regen'`): dunkler Himmel, Blitze, Windräder im Energiepark stehen, Drohnen bleiben am Boden (über `regen()`), im Gebirge wird nicht geladen und nicht gesprengt (`bgSperre`).
  - Neue Datei `kreislauf.js` (lädt nach wander.js): Routen (`route(name, minuten, punkte, sichtbareRäume, name)`, Punkte mit `{t, info, w, neu}`), unter der Erde und in Häusern nur in den Räumen der Route sichtbar (`verdeckt`), verfolgtes Teil hinter Wänden als Umriss. Routen: Wasser (Schnee am Gipfel bis Wolke, 4 Minuten), Strom (Krafthaus → Kabel → Rechenzentrum → Ladepark), Erz zum Paket (Bergwerk → Schacht → Lkw → Fertigung → Lager → Paketzentrum). Wasserhahn im Imbiss, Steigleitung und Abwasserrohr in `erdreich` ergänzt.
  - Ticker unten links (`ticker(text, x, y)` oder `WELT.emit('ticker', …)`), Klick fährt hin. Meldungen der verfolgten Route, Sprengung (jede dritte Runde), Gewitter. Erschütterungsmesser im Leitstand des Bergwerks schlägt bei der Sprengung aus.
  - „Verfolgen …“ öffnet eine Auswahl (Paket, Wassertropfen, Strom, Erz zum Paket); engine.js fragt `folgeFokus` vor `paketFokus`.
  - Lehren: Neue Skripte, die `langeUhr` oder WELT brauchen, müssen nach welt.js laden. Runner ohne `robot` lösen Fehler aus; Zeichnen an einen Runner mit Karte hängen. In Playwright-Tests `setPlaying(false)`, sonst überschreibt die Wiedergabe `state.g`.
- Gebirge mit Tunnelbau (15. Oktober 2026, Version 20261015n):
  - Neue Felder c −17 bis −13 (`berg1`…`berg5`, Flag `berg: true`: R-101 und der Wanderroboter meiden sie, `fitRoom` zeigt den Berg von GROUND − 760). Datei `rooms/gebirge.js` (Präfix `bg`/`BG_`, lädt nach stausee.js, braucht `SEEX0`). Maßstab etwa 1 : 5.
  - Aufgeschnittener Berg mit Schichten, gewellter Schneegrenze, Tannen. Haupttunnel auf Plateauhöhe GROUND − 300 (wie der Stausee-Hang), Portal bei SEEX0 − 1600, Ortsbrust SEEX0 − 3000. Sprengzyklus über `state.g`: Bohrwagen, Ladewagen (Avatel, Prototyp), Sprengung mit Staub, Lader und Dumper (kippt auf die Halde), Spritzbetonroboter. Dazu Schalwagen mit Innenschale und Abdichtung, Lutte mit Lüfter, heilige Barbara in der Portalnische, Vermessungsdrohne.
  - Erkundungsstollen darunter mit Tunnelbohrmaschine, Bergwasser in der Rinne, Band über einen Schacht auf die Halde (Brenner Basistunnel).
  - Hintergrund in engine.js reicht jetzt von −20000.
- Übergänge und Rumpfprüfung (15. Oktober 2026, Version 20261015m):
  - Neue Datei `rooms/uebergang.js` (lädt nach wasser.js): `fernsicht()` Hügel am Horizont (Haken in `himmelExtras`), `erdreich()` Erdschichten, Trinkwasserleitung vom Wasserwerk nach rechts, Klarwasserleitung von der Kläranlage zum Fluss, Glasfaser und Strom unter der Straße (Haken in engine.js nach den Steinen). Gehweg, Bäume, Laternen in allen Lücken über `ugLuecken()`. Zugang Tiefbahnhof (Glaspavillon, Lichtauge, Rolltreppe), Förderturm mit Fördermaschine oben (schlank, weil er im Energiefeld steht), Kanaldeckel mit Hütchen.
  - Rumpfprüfung im Hafen: Tauchroboter `rumpfrov` fährt Bahnen am Heck (x SH_SX+40 bis +190, vor dem HullSkater), Kabel zum Pult auf der Kaikante. Vorbild Bureau Veritas mit MaDfly, Fähre Bretagne 2021.
  - Lehre: Läufer ohne `withAlpha` meldet check.py als „Klickfläche fast leer“.
- Tiefer, Wasser, Algen (15. Oktober 2026, Version 20261015j):
  - Bergwerk tiefer: UG 2 (r 8, `mine3`/`mine4`) Vortrieb mit Bohrwagen nach Epiroc Boomer (acht Löcher), Ladewagen für Sprengstoff, Sprengung Bild 450–480 mit Schild, Rettungskammer; UG 3 (r 9, `mine5`/`mine6`) Förderband, Brecher unter der Erzrolle, Pumpe, Laufroboter nach ANYmal bei Vale findet eine heiße Rolle; Schacht mit Fördergefäß als Läufer durch alle drei Sohlen (x 1200–1290 im Paar frei halten). „Ganzes Haus“ zeigt jetzt bis zur tiefsten Reihe (`fitAll`).
  - Stausee c −12 bis −9 (`rooms/stausee.js`, Präfix `st`/`ST_`, Konstante `SEEX0`), Maßstab 1 : 8: Berge, See mit versunkenem Wald, Unterwasser-Holzernter nach Triton Sawfish (Luftsack, Säge; ein Baum pro Runde über `langeUhr(6)`, Stämme sammeln sich am Floß), Staumauer mit Rechenreiniger, Tauchroboter mit Sonar, Inspektionsdrohne, Fischtreppe mit Fischzähler nach Riverwatcher, Krafthaus mit Turbine, Fluss. Wasserwerk UG 1 c −9 (Sandfilter, Pumpe, Messung, Rohrroboter nach Acwa Robotics).
  - Kanal und Kläranlage UG 1 (`rooms/wasser.js`): c −1 Kanal mit Kamerawagen (IBAK), c −2 Fräsroboter gegen Wurzeln, c −3 Kläranlage im Fels nach Henriksdal mit Räumer und Probennehmer. R-101 kann von Werk 101 UG 1 durch Kanal und Kläranlage bis ins Bergwerk laufen.
  - Algenfarm c 25 (in meer.js): Zuckertang an Leinen, Ernteroboter (SINTEF-Prototyp, als Forschung gekennzeichnet), Vermessungs-Tauchroboter (REMUS, WHOI). Erdstreifen über Hafen- und Seewasser wird mit Himmelsfarbe überdeckt.
- Erste freiwillige Aufgabe (15. Oktober 2026, Version 20261015s):
  - `stoerung.js`: Nur solange R-101 gesteuert wird (Test: `?stoerung`), klemmt nach 45 s und danach alle 150 s eine Tragrolle am Förderband der Fertigung. Die Halle steht (`WELT.halt.fertigung`), Rolle blinkt rot, Ticker meldet es. Botengang `rolle` (`nurStoerung: true`, `spot: 240` im Lager) erscheint nur während der Störung, zählt nicht zu den gespeicherten Botengängen. Bringt R-101 die Rolle, läuft das Band sofort wieder; sonst tauscht die Instandhaltung sie nach 120 s. Zuschauer ohne Steuerung sehen nie eine stehende Halle.
  - Muster für weitere Aufgaben: Zustand in `WELT`, Anzeige über `reaktionen(key)`, Botengang mit `avAktiv`.
- Nahansicht am Himmel (15. Oktober 2026, Version 20261015t): Satellitenkette und Raumstation werden ab Zoom 2,2 (voll ab 3,8) von Lichtpunkt zu echter Form (`nahDetail()` in himmel.js): Starlink-Satellit mit einem langen Solarflügel, ISS von unten mit Gitterstruktur, acht goldbraunen Flügeln, Kühlern und Modulen.
- Wüste mit DARPA Grand Challenge (15. Oktober 2026, Version 20261015u):
  - `rooms/wueste.js`, c −25 bis −22 (`wueste1`–`wueste4`, `berg: true, wueste: true`, damit R-101 nicht durchs Gebirge fährt und der Ausschnitt hoch ist). Präfix `wu`/`WU_`. Mojave-Landschaft mit Tafelbergen, Josua-Palmlilien, Steppenläufer als Gag, Felskehre mit Schild „KM 11,9“, Startbogen (Jahreszahl wechselt) und Zielflagge.
  - Zwei Runden im Wechsel über `WELT.runde % 2`: 2004 kippt Ghostrider am Start um (flach gestaucht), Sandstorm sitzt an der Felskehre auf, Qualm von den Reifen, Schild „kein Fahrzeug im Ziel“. 2005 gewinnt Stanley (Laserfächer), Sandstorm und H1ghlander folgen.
  - Fahrzeuge in echter Größe, nach rechts gezeichnet und mit `wuZeichne` gespiegelt (fahren nach links). Kindertexte am Ende von kinder.js.
- Marianengraben, „Hohe See“ heißt jetzt „Ozean“ (15. Oktober 2026, Version 20261015v):
  - `rooms/graben.js`, Präfix `gr`/`GR_`: Felder `graben1`–`graben3` (r 6, c 26–28, `wasser`), `graben4` (r 8, c 27, 8.000 m) und `graben5` (r 9, c 27, Challenger-Tief). Tiefe stark verkürzt über `grTiefe(m)` (0, 1.000, 6.000, 8.000, 11.000 m), Tiere und Fahrzeuge vergrößert, Hinweis steht im Bild.
  - Oben Forschungsschiff (Vorbild Okeanos Explorer, 1 : 12) mit Deep Discoverer am Kabel, der die Qualle von 2016 (vermutlich Crossota, 3.700 m) anleuchtet; Dumbo-Krake. In 8.000 m Freifall-Lander auf einem Felsabsatz (sinkt 0–80, steigt 400–479, Gewichte bleiben liegen), Schneckenfische kommen 120–380, Flohkrebse. Unten Nereus (2009, 10.902 m) mit Greifarm und haardünner Glasfaser, Riesen-Einzeller, Plastiktüte. Am Grund keine Fische (Grenze etwa 8.300 m).
  - Alle Fakten gegen Quellen geprüft; unsichere Angaben (Tiefe der Tüte, Gattung der Qualle) vorsichtig formuliert.
- Arktis mit Forschungsstation (15. Oktober 2026, Version 20261015w):
  - `rooms/arktis.js`, c 29–32 (`arktis1`–`arktis4`, alle `wasser`), Präfix `ak`/`AK_`, Maßstab 1 : 2. Vorbilder MOSAiC-Eiscamp und Ny-Ålesund. Eisrand mit Ringelrobbe und Polarstern weit hinten; Eiscamp mit beheiztem Zelt über dem Eisloch, Steuerhütte und Tauchroboter (BEAST) unter der Scholle, der die Eisalgen anleuchtet; Ice-Tethered Profiler (Boje, Draht, Messkörper fährt auf und ab); Eisbär auf der Scholle; Küste mit Holzhäusern auf Stelzen, automatischer Wetterstation, Startautomat für Wetterballons (Dach 0–30 auf, Ballon steigt 30–220), Schild „Funkstille“, Polarfuchs. Nachts Polarlicht.
  - engine.js: Himmel, Erde und Grasstreifen reichen jetzt über alle Felder (`WX0`/`WX1` aus `ROOMS`), welt.js: Sterne und Wolken über die ganze Breite.
- Eisberg und Meldungen (15. Oktober 2026, Version 20261015x):
  - Arktis: die kleine Scholle ist jetzt ein Eisberg (Karte `eisberg`), unter Wasser spitz zulaufend und etwa neunmal so groß wie der sichtbare Teil; Robbe liegt auf dem Meereis. Lücke zwischen Graben und Arktis mit Wasser gefüllt.
  - `meldungen.js`: zentrale Liste `MELDUNGEN` für den Ticker (Runde `WELT.runde % 6`, Zeitpunkt `g`, optional `wenn()`, Ort zum Hinfahren). Acht Meldungen: DARPA 2004/2005, Raketenstart, Lander, Nereus, Ballonstart, Polarlicht (nachts), Raumstation (abends). Neue Meldung = eine Zeile in der Liste.
  - stoerung.js ruft `ticker()` direkt auf; `WELT.emit('ticker', …)` reicht nur ein Argument weiter, dann fehlt der Ort zum Hinfahren.
- Weichere Übergänge (15. Oktober 2026, Version 20261015y):
  - Marianengraben: kein Felsblock mehr um den Graben, dort zeigt sich das normale Erdreich mit Schichten; Wasser geht links und rechts über 320 Einheiten in die Farbe von Ozean und Arktis über; Meeresboden-Band durchgehend.
  - Arktis: Wasser endet am Ufer, darunter normales Erdreich; Schnee läuft am rechten Rand aus. Polarstern steht jetzt sichtbar hinter der Camp-Scholle (rechts vom Eiscamp).
  - Wüste: Tafelberge und Dünen laufen an beiden Rändern flach aus, Sandboden blendet über 360 Einheiten ins Nachbarfeld.
  - Muster für Übergänge: Rand-Gradient in der Farbe des Nachbarn statt harter Kante; eigene Erdflächen vermeiden, wo engine.js schon Erde zeichnet.
- Mehr Meldungen (15. Oktober 2026, Version 20261015z): zehn weitere Einträge in `MELDUNGEN` – Landung der ersten Raketenstufe, Magnetbahn hält, Lieferauto fährt los (`alle: 4`, passend zu `langeUhr(4)`), Staubwolke im Energiepark, Krähe auf dem Jäteroboter, dazu die kurzen Raum-Gags (Filmstudio, Eingangshalle, Schule, Mars-Testgelände, Katastrophenschutz). Neues Feld `alle` (Rundenzyklus, Standard 6), Hilfsfunktion `mlRaum(key)` für die Raummitte.
- Ruhigerer Ticker (16. Oktober 2026, Version 20261016a): immer nur eine Meldung sichtbar (die neue löst die alte ab), Anzeige 24 s. `meldung()` in meldungen.js bremst: dieselbe Meldung frühestens nach 15 Minuten wieder, zwischen zwei Meldungen mindestens 25 s; was in die Pause fällt, kommt in einer späteren Runde. Gilt für die Liste und die Sprengung; Störung und „Verfolgen“-Infos rufen `ticker()` direkt und werden nicht gebremst.
- Meldung schließen (16. Oktober 2026, Version 20261016b): Ticker-Eintrag ist jetzt ein `div.meldung` mit Textknopf (Klick fährt hin) und Knopf „×“ (`.zu`, schließt nur die Meldung). Ausblenden über `.meldung.alt`.
- Auskunft für R-101 (16. Oktober 2026, Version 20261016c): `auskunft.js` hängt unter „Botengänge“ ein Feld „Auskunft“ ins Steuerfeld. Antworten kommen nur aus den Karten: Wörter der Frage (ohne Füllwörter, grob gekürzt, wenige Wortformen in `AX_GLEICH`) werden gewichtet gesucht (Name ×6, Typ ×3, Bereich/Raum ×2, Fakt/Echt/Hinweis ×1, Zahlen doppelt), ab Punktzahl 3 gilt eine Karte als Treffer. Antwort ist der Satz aus Fakt/Echt, der die übrigen Fragewörter am besten trifft; im Modus „Einfach erklärt“ der Kindertext. Knöpfe „Karte zeigen“ und „Hinfahren“ (sonst zeigt die Kamera hin). Kein Treffer: ehrliches „weiß ich nicht“. Karten aus geheimen Räumen bleiben verborgen. Präfix `ax`/`AX_`.
- Seitenleiste aufgeräumt (16. Oktober 2026, Version 20261016d): oben „Einfach erklärt“, Figurenliste des Raums und Karte; darunter Suchspiel, dann eingeklappt „Alle Räume“ (Zahl, Suchfeld, Gruppen Werk 101 / Weitere Häuser / Draußen links / Draußen rechts / Unter der Erde, `raumGruppe()` in engine.js) und „Bereich hervorheben“ (zeigt den aktiven Bereich). Aufklappzustand merkt sich der Browser. Fortschrittstext und Balken stehen jetzt in „Über diese Seite“. Geheime Räume: `raumListeFiltern()` nach Freischalten/Verstecken aufrufen.
- Chipfabrik (16. Oktober 2026, Version 20261016e):
  - Haus 105 (`H6`, `drawH6` in engine.js) bei c 12–13 mit Räumen `chip1` (Reinraum) und `chip2` (Belichtung) in `rooms/chipfabrik.js`; alles ab Farm 106 um 2,5 Spalten nach rechts verschoben.
  - Reinraum: Luftdusche mit sich drehender Technikerin, zwei Deckenwagen am Load Port (`cfW1`/`cfW2`), Cluster-Anlage mit Vakuumarm (`cfArmTip`) und Plasma, Steckbrief „Staubkorn“ mit Teilchenzähler. Belichtung: gelbes Licht, Maschine mit Klappe (`cfKlappe`), Laser, Zinntröpfchen, Spiegel, Maske, Wafertisch; Hinweis „Schnitt vereinfacht“.
  - Kreislauf `chip` (Wafer → Belichtung → Lkw → KI-Schrank), Suchspiel-Aufgabe, Ticker-Meldung (Runde 3), Kindertexte.
- Sendeturm (16. Oktober 2026, Version 20261016f):
  - Haus 107 (`H7`, `drawH7`, Gittermast `TURM` mit Flugwarnlicht) bei c 14.5, Raum `news` in `rooms/sendeturm.js`; alles ab Farm um weitere 1,5 Spalten nach rechts.
  - Meldungen in `nachrichten.js`; Bildschirm-Baukasten `NW_HG` (Hintergründe) und `NW_FIG` (Figuren), Bewegung über `nwFigurPos`. Archiv-Fenster `openNachrichten()` (Stil wie ELIZA-Fenster).
- Roboterblick (16. Oktober 2026, Version 20261016h): `blick.js`, Zustand `state.blick` ('aus' | 'kamera' | 'waerme'), gezeichnet in engine.js nach dem Datennetz (`drawBlick`). Farben der Kästchen: Mensch #f0b429, Tier #7fe08a, Roboter #7fd3ff.
- Basketball und Bibliothek (18. Oktober 2026, Version 20261018a):
  - Sporthalle: Basketball-Roboter `korbwurf` (Vorbild Toyota CUE) mit Korb links an der Wand (Ring 3,05 m). Rechts wechseln sich Parkour und Basketball pro 5-s-Runde ab (`spKorb()` aus `state.g`); Gag: einbeiniger Sprungwurf nach hinten (Nowitzki, nur in Worten auf der Karte). Parkour-Kiste und Landung 20–30 nach links gerückt.
  - Haus 108 Stadtbibliothek (`H8`, `drawH8`, `haus: 8`) bei c 16, Raum `bibliothek` (Präfix bb/BB_): Rückgabe-Sortieranlage, Inventur-Roboter, Selbstverbucher, Roboter-Ecke, Bibliothekarin; Gag: Gespräch in Nullen und Einsen („Hi“ in ASCII), Bibliothekarin sagt „Psst!“. Alles ab Farm um 1,5 Spalten nach rechts.
  - Botengänge `leihbuch` (Bibliothek → Wohnbereich) und `leihfilm` (Bibliothek → Filmstudio).
  - Fehler behoben: graben.js, arktis.js und meldungen.js nutzten feste Spalten (rx(26) …) und waren seit den Verschiebungen 4 Spalten zu weit links gezeichnet; jetzt über `roomOf(...)`.
- Geheimer Mond (26. Oktober 2026, Version 20261026a):
  - Hebel `mondhebel` unten links in der Satelliten-Werkstatt (Dach) teleportiert mit weißem Blitz (`mondBlitz`, abgeschaltet bei reduzierter Bewegung) zur Südpol-Basis; Hebel `mondzurueck` am Lander bringt zurück. Eigener Schalter `state.mond` (localStorage `werk101-mond`), unabhängig vom Klopf-Geheimnis; Räume mit `mond: true` zählen nicht zum Fortschritt und erscheinen in der Raumliste unter „Weltraum“.
  - `rooms/mond.js`: `mond1` Mond: Südpol-Basis (r −14, c 1) mit Rover VIPER (Scheinwerfer und Bohrer am ewig dunklen Krater), Mondauto weit hinten, Frachtlander, Erde tief am Horizont; `mond2` Mond: Raumstation Gateway (r −15) mit Canadarm3, der einen Frachter ohne Besatzung fängt. Karten sagen ehrlich: Gateway ist seit März 2026 pausiert. Schwarzer Weltraum dahinter über `mondKulisse()`; `shadeOutside` spart den Mond aus.
  - `tools/check.py` setzt `state.mond = true`, wenn ein Mondraum geprüft wird.
  - Version 20261026b: Mondoberfläche reicht in `mondKulisse()` je 1.100 Einheiten links und rechts über das Feld hinaus (Bergmassive an den Enden, zwei weitere Schattenkrater), unten endet sie als runder Mondbrocken; Weltraum mit weichem Rand statt Kasten. Ansicht der Mondfelder etwas breiter.
  - Version 20261026c: drittes Mondfeld `mond3` Mond: Basis-Ausbau (r −14, c 2) ohne eigenen Himmel und Boden (kommt aus `mondKulisse()`): Canadarm3 auf dem Mondboden hebt Kisten vom Lander ins leere Wohnmodul, Solartürme (NASA VSAT) auf dem Bergrücken. Im Museum der Robotik steht Lunochod 1 (1970) auf einem Wandregal und klappt seinen Deckel auf; Laufschrift ergänzt.
- Fehlerbericht 1 (26. Oktober 2026, Version 20261026d): sieben gemeldete Fehler behoben und in `FEHLER.md` mit Regeln festgehalten (Laufband-Knie, Schutzfeld-Uhr in der Kantine und Aufholen nach dem Loslassen, offenes Dach am Drohnen-Landeplatz mit echtem Himmel, Tunnel an der Straße und stehender Bus im Park, Fischzähler-Anzeige, Stelzen im Stausee hinter dem Holzernter, Startbox in der Wüste). Mondauto fährt jetzt in `mondKulisse()` über die ganze Mondoberfläche. `check.py` meldet neu „Hinweis Feldrand“.
