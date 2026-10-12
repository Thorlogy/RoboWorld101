# Werk 101

Ein animierter Querschnitt durch ein Haus voller echter Roboter – nach dem Vorbild von floor796. 29 Räume, über 100 Figuren, jede mit einer Karte: Was der Roboter wirklich kann, was nur ein Spaß ist, und eine Quelle.

## Ansehen
`index.html` im Browser öffnen oder den Ordner auf einen Webserver legen (z. B. GitHub Pages: Settings → Pages → Branch `main`, Ordner `/`).

## Aufbau
- `kit.js` – Welt, Zeichenhilfen, Figuren-Baukasten
- `rooms/*.js` – ein Raum pro Datei
- `runners.js` – Figuren, die über Räume und Stockwerke unterwegs sind
- `engine.js` – Ansicht, Bedienung, Panel
- `game.js` – Suchspiel
