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
