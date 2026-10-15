/* Meldungen im Ticker unten links: lenken den Blick auf Ereignisse in der Welt. Ein Klick fährt die Kamera hin.
   Jede Meldung feuert, wenn state.g den Wert g überschreitet und wenn (WELT.runde % 6) === runde; über die Runden
   verteilt, damit höchstens etwa alle 20 Sekunden eine kommt. wenn() kann zusätzlich prüfen (Tageszeit, Wetter).
   Die Sprengung im Gebirge meldet kreislauf.js (Runden 0 und 3), die Störung stoerung.js. */
const MELDUNGEN = [
  { runde: 1, g: 262, text: 'Wüste: Stanley ist im Ziel! 2005 gewinnt zum ersten Mal ein Auto ohne Fahrer die Grand Challenge.', ort: () => [WU_ZIEL, GROUND - 120] },
  { runde: 2, g: 270, text: 'Wüste: Sandstorm sitzt an der Felskehre auf einem Felsen fest. 2004 kommt kein Fahrzeug ins Ziel.', ort: () => [WU_FELS, GROUND - 120] },
  { runde: 4, g: 130, text: 'Marianengraben: Der Lander ist in 8.000 m Tiefe gelandet. Gleich kommen Schneckenfische an den Köder.', ort: () => [GR_LX + 100, grTiefe(8000) - 60] },
  { runde: 5, g: 35, text: 'Arktis: Der Startautomat lässt einen Wetterballon steigen. Er fliegt bis etwa 30 Kilometer hoch.', ort: () => [AK_BALLON, GROUND - 200] },
  { runde: 1, g: 60, text: 'Raketenstart! Achte darauf, wo die erste Stufe nachher wieder landet.', ort: () => [RK_PAD.x, GROUND - 400] },
  { runde: 2, g: 150, text: 'Marianengraben: Nereus greift mit dem Arm in den Schlamm, fast 11.000 Meter tief.', ort: () => [GR_NX, GR_BOT - 80] },
  { runde: 4, g: 330, wenn: () => istNacht(), text: 'Über der Arktis leuchtet Polarlicht.', ort: () => [rx(31), GROUND - 700] },
  { runde: 5, g: 125, wenn: () => istDunkel(), text: 'Die Raumstation zieht über den Abendhimmel. Zoom ganz nah heran!', ort: () => { const p = issPos(150); return p ? [p.x, p.y] : [0, 0]; } },
];
let mlLetztesG = -1;
function mlTick() {
  const g = state.g;
  if (g !== mlLetztesG) {
    for (const m of MELDUNGEN) {
      if (WELT.runde % 6 !== m.runde || !(mlLetztesG < m.g && g >= m.g && g < m.g + 20)) continue;
      if (m.wenn && !m.wenn()) continue;
      const [x, y] = m.ort(); ticker(m.text, x, y);
    }
    mlLetztesG = g;
  }
  requestAnimationFrame(mlTick);
}
requestAnimationFrame(mlTick);
