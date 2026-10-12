/* Geheimer Raum: Spielhalle der Roboter (UG 2, rechts hinter dem Bohrkopf)
   Erscheint erst, wenn man im U-Bahn-Tunnel dreimal am Notausgang anklopft (state.secret, im Browser gespeichert).
   Echte Roboter, die Spiele spielen: Würfel-Roboter (Rekord 0,305 s), Curling-Roboter, Jenga-Roboter.
   Gag: Der Zeitnehmer hat noch nicht einmal auf Start gedrückt, da ist der Würfel schon fertig.
   Figuren aus Videospielen werden nicht gezeichnet, sie gehören den Spielefirmen. */
const SHX = rx(roomOf('spielhalle').c), SHY = ry(roomOf('spielhalle').r);
const SH_COLS = ['#d94a4a', '#f0b429', '#3e6f9e', '#5f9a4a', '#f3f1ea', '#e07a3a'];
// Würfel: 0–24 gemischt, 24–28 dreht sich blitzschnell, danach gelöst
const shSolved = f => f >= 28;
function shCube(x, y, f) {
  const s = 12;
  for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) {
    let c;
    if (shSolved(f)) c = SH_COLS[1];
    else if (f >= 24) c = SH_COLS[(i + k + f) % 6];
    else c = SH_COLS[Math.floor(rnd(i * 3 + k + 7) * 6)];
    box(x + i * s, y + k * s, s, s, c, 1, 1);
  }
}
// Curling: der Wurfroboter schiebt den Stein, er gleitet bis ins Haus
const shStone = f => (f < 10 ? 318 : f < 50 ? lerp(318, 566, 1 - (1 - seg(f, 10, 50)) ** 2) : 566);
function curlStone(x, y, c) {
  ctx.beginPath(); ctx.ellipse(x, y, 13, 6, 0, 0, TAU); paint('#8a8f94', INK, 1.5);
  box(x - 9, y - 9, 18, 5, c, 2, 1); line(x, y - 9, x + 6, y - 14, INK, 2);
}
// Jenga auf der globalen Uhr: Klotz A klemmt (Kraft rot), Klotz B lässt sich schieben (Kraft grün)
function shJenga(g) {
  g %= 480;
  const back = 1 - seg(g, 440, 479);
  const a = g < 60 ? 0 : g < 120 ? 6 * seg(g, 60, 120) : 6 * back;
  const b = g < 200 ? 0 : g < 300 ? 40 * seg(g, 200, 300) : 40 * back;
  const force = g >= 80 && g < 125 ? 'rot' : g >= 200 && g < 300 ? 'gruen' : null;
  const A = { x: 324, y: 236 }, B = { x: 324, y: 212 }, rest = { x: 360, y: 190 };
  let tip;
  if (g < 60) tip = mix(rest, A, ease(seg(g, 0, 60)));
  else if (g < 120) tip = { x: A.x - a, y: A.y };
  else if (g < 150) tip = mix({ x: A.x - 6, y: A.y }, rest, ease(seg(g, 120, 150)));
  else if (g < 200) tip = mix(rest, B, ease(seg(g, 150, 200)));
  else if (g < 300) tip = { x: B.x - b, y: B.y };
  else if (g < 360) tip = mix({ x: B.x - 40, y: B.y }, rest, ease(seg(g, 300, 360)));
  else tip = rest;
  const wob = g >= 100 && g < 125 ? 0.012 * Math.sin(g * 1.3) : 0;
  return { a, b, force, tip, wob };
}
function drawSpielhalle(f) {
  const g = state.g;
  ctx.fillStyle = '#2b2f4a'; ctx.fillRect(0, 0, RW, RH);
  for (let x = 0; x < RW; x += 40) for (let y = 360; y < RH; y += 20) { ctx.fillStyle = (x / 40 + y / 20) % 2 ? '#3b3d40' : '#55585c'; ctx.fillRect(x, y, 40, 20); }
  line(0, 360, RW, 360, INK, 2);
  text('SPIELHALLE', 320, 64, 40, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: f % 20 < 18 ? '#ff6fb1' : '#7a3a5a' });
  text('Hier spielen echte Roboter.', 320, 86, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#c9c7e8' });
  text('Roboter aus Videospielen? Die gehören den Spielefirmen.', 320, 104, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#8a88b0' });
  // Würfel-Roboter mit Zeitnehmer
  withAlpha('zauberwuerfel', () => {
    box(30, 290, 120, 70, '#3b3d40', 3, 2); box(42, 196, 96, 94, '#d6d9dc', 4, 2);
    for (const [x, y, w, h] of [[84, 200, 12, 18], [84, 268, 12, 18], [46, 237, 18, 12], [116, 237, 18, 12]]) box(x, y, w, h, '#5d6064', 2, 1);
    shCube(72, 225, f);
    box(50, 150, 80, 32, '#18263a', 3, 1.5);
    text(shSolved(f) ? '0,305 s' : 'bereit', 90, 172, 14, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: shSolved(f) ? '#7fe08a' : '#9fc4d6' });
  });
  withAlpha('zeitnehmer', () => {
    person({ x: 190, foot: 360, face: -1, shirt: '#5f9a4a', pants: '#3b3d40', hair: '#3a2c22', hand: { x: 170, y: 280 } });
    box(160, 270, 16, 18, '#2a2723', 3, 1); text('0,00', 168, 283, 6, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#ffb347' });
  });
  // Jenga-Roboter auf dem Tisch
  box(236, 270, 150, 8, '#a8763f', 1, 1.5); line(244, 278, 244, 344, INK, 3); line(378, 278, 378, 344, INK, 3);
  withAlpha('jenga', () => {
    const j = shJenga(g);
    ctx.save(); ctx.translate(290, 270); ctx.rotate(j.wob); ctx.translate(-290, -270);
    for (let l = 0; l < 12; l++) {
      const y = 262 - l * 8;
      if (l % 2 === 0) { const dx = l === 4 ? j.a : l === 7 ? j.b : 0; box(256 - dx, y, 68, 8, '#e0c48a', 1, 1); }
      else for (let i = 0; i < 3; i++) box(256 + i * 23, y, 22, 8, '#d8b77f', 1, 1);
    }
    ctx.restore();
    const S = { x: 362, y: 236 }, W = { x: j.tip.x + 12, y: j.tip.y }, E = ik2(S, W, 34, 30);
    box(350, 248, 24, 22, '#f3f1ea', 3, 1.5);
    limb(S.x, S.y, E.x, E.y, 7, '#f3f1ea'); limb(E.x, E.y, W.x, W.y, 6, '#f3f1ea');
    box(W.x - 4, W.y - 6, 8, 12, '#3b3d40', 2, 1); line(W.x - 4, W.y, j.tip.x, j.tip.y, INK, 2);
    box(392, 196, 18, 50, '#18263a', 2, 1.2);
    if (j.force) { const red = j.force === 'rot'; ctx.fillStyle = red ? '#ff5a50' : '#6eff82'; ctx.fillRect(396, red ? 202 : 226, 10, red ? 40 : 16); }
  });
  // Curling-Bahn mit Haus
  ctx.fillStyle = '#e8f2f5'; ctx.fillRect(220, 344, 420, 16); line(220, 344, 640, 344, INK, 1.2);
  for (const [r, c] of [[40, '#3e6f9e'], [27, '#f3f1ea'], [14, '#d94a4a']]) { ctx.beginPath(); ctx.ellipse(570, 352, r, 6, 0, 0, TAU); ctx.fillStyle = c; ctx.fill(); }
  withAlpha('curly', () => {
    curlStone(546, 346, '#f0b429');
    const sx = shStone(f); curlStone(sx, 346, '#d94a4a');
    // Wurfroboter auf Rädern
    const tx = f < 12 ? 268 + 8 * seg(f, 4, 12) : 276;
    box(tx - 30, 318, 50, 22, '#f3f1ea', 4, 1.8); circle(tx - 20, 342, 5, '#2d2f33'); circle(tx + 10, 342, 5, '#2d2f33');
    line(tx - 6, 318, tx - 6, 290, INK, 3); box(tx - 14, 278, 16, 12, '#23384d', 2, 1); circle(tx - 6, 284, 3, '#7fd3ff', null);
    if (f < 12) line(tx + 20, 330, sx - 10, 340, '#8a8f94', 3);
    // Skip-Roboter am Haus zielt mit der Kamera
    box(600, 318, 32, 24, '#f3f1ea', 4, 1.8); circle(606, 344, 5, '#2d2f33'); circle(626, 344, 5, '#2d2f33');
    line(616, 318, 616, 248, INK, 3); box(606, 236, 20, 14, '#23384d', 2, 1); circle(611, 243, 3, '#7fd3ff', null);
    if (f >= 50) text('✓', 640 - 22, 230, 16, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#6eff82' });
  });
}

registerRoom({
  key: 'spielhalle', name: 'Geheime Spielhalle', level: 'UG 2 · geheim',
  hitOrder: ['zeitnehmer', 'zauberwuerfel', 'jenga', 'curly'],
  draw: drawSpielhalle,
  glow(f) {},
  robots: [
    { id: 'zauberwuerfel', name: 'Würfel-Roboter', bereich: 'Forschung', aera: 'Rekord 2024', typ: 'Maschine mit sechs Motoren und Kameras',
      fakt: 'Im Mai 2024 löste ein Roboter von Mitsubishi Electric einen Zauberwürfel in 0,305 Sekunden. Das ist ein Guinness-Weltrekord. Kameras erkennen die Farben, ein Programm berechnet die Züge, sechs Motoren drehen alle Seiten.',
      echt: 'Echt. Der schnellste Mensch braucht gut drei Sekunden. Hier dauert das Lösen vier Bilder, also etwa so lang wie in echt.',
      note: 'Fertig, bevor der Zeitnehmer auf Start drücken kann.', color: '#f0b429',
      quelle: 'https://www.guinnessworldrecords.com/news/2024/5/japanese-companys-robot-solves-a-puzzle-cube-in-0-305-seconds-to-break-record',
      box: () => [SHX + 28, SHY + 148, 126, 214] },
    { id: 'zeitnehmer', name: 'Zeitnehmer', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Stoppuhr',
      fakt: 'Will die Zeit des Würfel-Roboters stoppen.', note: 'Seine Uhr zeigt noch 0,00. Er hat nicht einmal auf Start gedrückt.', color: '#5f9a4a',
      box: () => [SHX + 156, SHY + 236, 54, 126] },
    { id: 'jenga', name: 'Jenga-Roboter', bereich: 'Forschung', aera: 'seit 2019', typ: 'Kleiner Industriearm mit Kraftsensor',
      fakt: 'Forscher am MIT brachten 2019 einem Roboterarm Jenga bei. Ein Kraftsensor im Handgelenk spürt, ob ein Klotz klemmt, eine Kamera sieht, wie er sich bewegt. Nach nur etwa 300 Versuchen wusste der Roboter, wann er lieber einen anderen Klotz nimmt.',
      echt: 'Echt. Am Ende der Runde wird der Turm hier wieder zusammengeschoben, das ist ein Trick, damit die Szene neu beginnen kann.',
      note: 'Der erste Klotz klemmt, der Kraftbalken wird rot. Also nimmt er einen anderen.', color: '#f3f1ea',
      quelle: 'https://news.mit.edu/2019/robot-jenga-0130',
      box: () => [SHX + 248, SHY + 160, 166, 112] },
    { id: 'curly', name: 'Curling-Roboter', bereich: 'Forschung', aera: 'seit 2018', typ: 'Zwei Roboter auf Rädern',
      fakt: 'Ein Team der Korea University baute zwei Curling-Roboter: Einer steht am Ziel und sucht mit der Kamera die beste Stelle aus, der andere schiebt den Stein los. 2018 gewannen sie drei von vier Spielen gegen Profi-Teams aus Südkorea.',
      echt: 'Echt. Wischen können die Roboter nicht, deshalb haben die Menschen bei diesen Spielen auch nicht gewischt.',
      note: 'Der rote Stein landet genau in der Mitte.', color: '#d94a4a',
      quelle: 'https://www.smithsonianmag.com/smart-news/curly-curling-robot-can-beat-pros-their-own-game-180975951/',
      box: () => [SHX + 236, SHY + 230, 404, 130] },
  ],
});
