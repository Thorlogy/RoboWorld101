# Werk 101

Ein animierter Querschnitt durch eine kleine Welt voller echter Roboter, nach dem Vorbild von floor796. 48 Felder in fünf Gebäuden, im Außengelände und unter der Erde, dazu zwei geheime Räume, 227 Figuren. Jede Figur hat eine Karte: was der Roboter wirklich kann, was nur ein Spaß ist, und eine Quelle.

Live: https://thorlogy.github.io/RoboWorld101/

## Ansehen
Im Repo-Ordner `python3 -m http.server` starten und `http://localhost:8000/werk101/` öffnen. `index.html` direkt per Doppelklick geht meist auch.

## Aufbau
- `kit.js` – Welt, Koordinaten, Zeichenhilfen, Liste aller Felder (`ROOMS`), Zustand (`state`), Schutzfeld
- `rooms/*.js` – ein Feld pro Datei (`campus.js` enthält alle Räume der Schule 102)
- `runners.js` – Figuren, die durch mehrere Räume unterwegs sind (Lieferroboter, Paketreise, Rohrpost …)
- `himmel.js` – Flugtaxis, Lieferdrohnen, Satellitenkette, Raumstation und Raketenstart
- `netz.js` – Knopf „Datennetz“: Glasfaser, Funk und Satellit als Röntgenansicht
- `engine.js` – Zeichnen, Häuser, Wetter, Ansicht, Bedienung, Panel
- `kinder.js` – Kartentexte für „Einfach erklärt“
- `game.js` – Suchspiel, `tour.js` – geführte Tour
- `STIL.md` – Stilregeln und Änderungsprotokoll, `IDEEN.md` – Steckbrief für neue Ideen
- `tools/check.py` – automatischer Prüflauf

Hinweise für KI-Assistenten stehen in `AGENTS.md` im Hauptordner des Repos.
