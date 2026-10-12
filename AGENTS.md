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
- Jede Figur zeichnen mit `withAlpha('<id>', () => …)`, damit Filter und Prüflauf funktionieren. Schutzfeld (Maus hält Roboter an): ID in `SAFETY` eintragen und `heldDraw`/`heldG` verwenden.
- Wetter `state.wetter` ('sonne', 'regen', 'abend'); Licht der Dunklen Fabrik `state.licht`.
- Nach jeder Änderung die Version `?v=YYYYMMDDx` an allen Skripten in `index.html` hochzählen (Cache).

## Prüfen
`python3 werk101/tools/check.py [raum …]` (Python mit Playwright und Pillow). Meldet JavaScript-Fehler, Sprünge an der Schleifennaht, Text über dem Rand, leere Klickflächen und Karten ohne `echt`. Die Meldungen zu „energie“ und „lehrer“ an der Naht sind bekannt und harmlos.

## Veröffentlichen
Push auf `main`. GitHub Pages baut die Seite in ein bis zwei Minuten neu.

## Offene Ideen
Tunnelbohrmaschine unter dem U-Bahnhof, Kapselkamera in der Krankenstation, Roboter-Bienenstock am Feld, Wetterlage „Schnee“ mit Schneeräumroboter, Poolroboter, Messroboter im Teilchenbeschleuniger, Eis- oder Burgerroboter am Park.
