/* Meldungen im Ticker unten links: lenken den Blick auf Ereignisse in der Welt. Ein Klick fährt die Kamera hin.
   Jede Meldung feuert, wenn state.g den Wert g überschreitet und wenn (WELT.runde % (alle || 6)) === runde; über die Runden
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
  // weitere Ereignisse auf der langen Uhr
  { runde: 1, g: 380, text: 'Die erste Stufe der Rakete kommt zurück und landet aufrecht auf dem X. So kann sie wieder fliegen.', ort: () => [RK_LZ.x, RK_LZ.y - 200] },
  { runde: 0, g: 150, text: 'Die Magnetbahn hält am Bahnhof. Sie schwebt ohne Räder über dem Fahrweg.', ort: () => mlRaum('bahnhof') },
  { alle: 4, runde: 0, g: 300, text: 'Paketzentrum: Das Lieferauto ist beladen und fährt los. Schau, wohin es die Pakete bringt.', ort: () => mlRaum('paket') },
  { runde: 3, g: 440, text: 'Energiepark: Kaum ist die Solarreihe sauber, weht schon die nächste Staubwolke drüber.', ort: () => mlRaum('energie') },
  { runde: 5, g: 200, text: 'Feld: Eine Krähe fährt auf dem Dach des Jäteroboters mit. Er ist so langsam, dass das geht.', ort: () => mlRaum('feld') },
  // kurze Gags in den Räumen: wiederholen sich alle 5 Sekunden, man sieht sie also gleich nach dem Hinfahren
  { runde: 0, g: 420, text: 'Filmstudio: Take 47! Die Erdbeere fällt in die Milch, und alles geht von vorn los.', ort: () => mlRaum('film') },
  { runde: 2, g: 420, text: 'Eingangshalle: Der Sicherheitsroboter bremst gerade noch an der Brunnenkante.', ort: () => mlRaum('eingang') },
  { runde: 3, g: 100, text: 'Schule: Der Lernroboter hält das schwarze Mäppchen für seine Linie.', ort: () => mlRaum('schule') },
  { runde: 4, g: 20, text: 'Mars-Testgelände: Der Rover macht ein Selfie mit seinem Kameraarm.', ort: () => mlRaum('mars') },
  { runde: 5, g: 380, text: 'Katastrophenschutz: Das verdächtige Paket ist nur das, was die Möwe vom Dach geklaut hat.', ort: () => mlRaum('kat') },
];
function mlRaum(key) { const o = roomOf(key); return [rx(o.c) + RW / 2, ry(o.r) + RH / 2]; }
let mlLetztesG = -1;
function mlTick() {
  const g = state.g;
  if (g !== mlLetztesG) {
    for (const m of MELDUNGEN) {
      if (WELT.runde % (m.alle || 6) !== m.runde || !(mlLetztesG < m.g && g >= m.g && g < m.g + 20)) continue;
      if (m.wenn && !m.wenn()) continue;
      const [x, y] = m.ort(); ticker(m.text, x, y);
    }
    mlLetztesG = g;
  }
  requestAnimationFrame(mlTick);
}
requestAnimationFrame(mlTick);
