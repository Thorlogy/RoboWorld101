# Hinweise für KI-Assistenten (RoboWorld 101)

Dieses Repo enthält RoboWorld 101: eine animierte Welt voller echter Roboter, gezeichnet mit Canvas in reinem JavaScript, ohne Build-Schritt und ohne Abhängigkeiten. Live über GitHub Pages: https://thorlogy.github.io/RoboWorld101/ (leitet auf `/werk101/` weiter). Zielgruppe sind auch Kinder.

Lies vor jeder Änderung `werk101/STIL.md`. Dort stehen die Stilregeln und am Ende ein Protokoll aller Ausbaustufen.

## Inhaltliche Regeln
- Nur echte Roboter und Technik. Jede Figur bekommt eine Karte mit `fakt`, `echt` (was stimmt, was ist Spaß), `quelle` (Link) und einen Kindertext in `kinder.js`. Fakten vorher recherchieren, Unsicheres vorsichtig formulieren.
- Keine Firmenlogos und Markennamen im Bild. Film-, Serien- und Spielfiguren nur in Worten auf der Karte erwähnen, nie zeichnen.
- Keine Gefühlsszenen zwischen Mensch und Roboter. Humor kommt aus der echten Aufgabe des Roboters (Socke im Saugroboter, Taube als heißer Fleck im Wärmebild).
- Roboter, die laufen oder fahren können, bewegen sich auch.
- Texte auf Deutsch, kurz und sachlich, ohne Werbe- und KI-Floskeln.
- Die Grafik bleibt im vorhandenen Stil (flache Farben, dunkle Kontur `INK`, Hilfen aus `kit.js`) und soll nicht nach generischer KI-Grafik aussehen.

## Technik in Kürze
- Welt: `WALL=16, RW=640, RH=400, SHAFT=160, TOP=360, ROWS=9`. `rx(c)` und `ry(r)` geben die linke obere Ecke eines Feldes. Spalten ab 3 liegen rechts vom Aufzugsschacht, negative Spalten links im Außengelände. `GROUND` ist die Erdoberfläche.
- Zwei Uhren: `f` (0–59, 12 Bilder pro Sekunde, Raumschleife von 5 s) und `state.g` (0–479, 40 s) für langsame Abläufe und Läufer. Jede Animation muss nahtlos schleifen.
- Neues Feld: Eintrag in `ROOMS` (`kit.js`) mit `built: '<key>'`, optional `outdoor: true` oder `haus: 2/3`; Datei `rooms/<key>.js` mit `registerRoom({ key, name, level, hitOrder, robots, draw, glow? })`; `<script>` in `index.html` vor `kinder.js` einfügen. `draw(f)` zeichnet in lokalen Koordinaten (0..640 × 0..400), `box` der Figuren in Weltkoordinaten.
- Figuren über mehrere Räume: `registerRunner({ room, draw(g), glow?(g), robot })` in `runners.js` oder `himmel.js`.
- Maßstab: Mensch 118 hoch, 1 m ≈ 69. Autos (`car()` in garage.js) sind 4,6 m lang. Neue Fahrzeuge und Geräte bitte in echter Größe zeichnen.
- Gebäude: Werk 101, Schule 102 (`H2`), Halle 103 (`H3`), Rechenzentrum (`H4`, Räume `rz1`/`rz2`). Die Datennetz-Ansicht steckt in `netz.js` und liest diese Konstanten.
- Jede Figur zeichnen mit `withAlpha('<id>', () => …)`, damit Filter und Prüflauf funktionieren. Schutzfeld (Maus hält Roboter an): ID in `SAFETY` eintragen und `heldDraw`/`heldG` verwenden.
- Wetter `state.wetter` ('sonne', 'regen'); Tageszeit aus `welt.js`: `WELT.phase`, `istDunkel()`, `istNacht()` (Test: `?phase=nacht`). Licht der Dunklen Fabrik `state.licht`.
- Auskunft im Steuerfeld (`auskunft.js`) antwortet nur aus den Karten. Gute Karten mit klaren Sätzen machen also auch die Auskunft besser.
- Eigene Figur R-101 in `avatar.js` (Botengänge in `AUFTRAEGE`, Knöpfe in `KNOEPFE`). Ereignisse zwischen Räumen über `WELT.emit/on`.
- Geheime Felder: `secret: true` in `ROOMS`; sie sind erst nach `unlockSecret()` (dreimal am Notausgang im U-Bahn-Tunnel klopfen) sichtbar; noch einmal dreimal klopfen versteckt sie wieder (`lockSecret()`). Nicht in Tour oder Raumliste verraten.
- Geheimer Mond: Hebel in der Satelliten-Werkstatt (`mondhebel`) teleportiert zu den Feldern `mond1`/`mond2` (`mond: true` in `ROOMS`, eigener Schalter `state.mond`, Code in `rooms/mond.js`); der Hebel am Lander bringt zurück.
- Karten können `onSelect()` haben (z. B. ELIZA öffnet ein Chatfenster). Der ELIZA-Chat ist regelbasiert wie 1966 und muss kindgerecht bleiben.
- Nach jeder Änderung die Version `?v=YYYYMMDDx` an allen Skripten in `index.html` hochzählen (Cache).

## Prüfen
`python3 werk101/tools/check.py [raum …]` (Python mit Playwright und Pillow). Meldet JavaScript-Fehler, Sprünge an der Schleifennaht, Text über dem Rand, leere Klickflächen und Karten ohne `echt`. Die Meldung zu „energie“ an der Naht ist bekannt und harmlos. Geheime Räume prüft das Skript nur nach `state.secret = true`.

## Veröffentlichen
Push auf `main`. GitHub Pages baut die Seite in ein bis zwei Minuten neu.

## Offene Ideen
Kapselkamera in der Krankenstation, Roboter-Bienenstock am Feld, Wetterlage „Schnee“ mit Schneeräumroboter, Poolroboter, Messroboter im Teilchenbeschleuniger, Eis- oder Burgerroboter am Park.
