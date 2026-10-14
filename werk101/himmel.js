/* RoboWorld 101 – Himmel: Flugtaxis und Lieferdrohnen. Läuft auf der globalen Uhr state.g (0–479 = 40 s).
   Lieferdrohne mit Seilwinde: startet vom Dach von Werk 101 und lässt ein Paket zur Landwirtin am Feld hinab.
   Paketdrohne: kommt von rechts und setzt Ersatzteile in die Paketstation auf dem Dach der Schule 102.
   Bei Regen bleiben alle Fluggeräte am Boden. Wird nach runners.js geladen. */
const HIDE = [-99999, -99999, 1, 1];
const regen = () => state.wetter === 'regen';

/* ---------- Flugtaxis ---------- */
const TX_L = -4300, TX_R = 5600, TX_A = -115, TX_B = -175;
const taxiA = g => ({ x: lerp(TX_L, TX_R, (g % RUN_P) / RUN_P), y: TX_A + 6 * Math.sin(TAU * g / 120), s: 1, dir: 1 });
const taxiB = g => ({ x: lerp(TX_R, TX_L, ((g + 200) % RUN_P) / RUN_P), y: TX_B + 4 * Math.sin(TAU * g / 90), s: 0.32, dir: -1 });
// Ein Fahrgast fotografiert Werk 101, wenn das Taxi drüberfliegt
const taxiFoto = p => p.x > 700 && p.x < 1500 && Math.floor(p.x / 120) % 3 === 0;
function drawTaxi(p, g, foto) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.s * p.dir, p.s);
  // Ausleger mit je zwei Rotoren übereinander
  for (const s of [-1, 1]) { line(s * 30, -26, s * 104, -50, INK, 5); line(s * 30, -26, s * 104, -50, '#e8e6e0', 2.5); }
  box(-140, -54, 280, 8, '#e8e6e0', 4, 2);
  for (const xr of [-128, -88, 88, 128]) {
    line(xr, -54, xr, -66, INK, 3); line(xr, -46, xr, -36, INK, 3);
    for (const yr of [-68, -34]) { ctx.beginPath(); ctx.ellipse(xr, yr, g % 2 ? 26 : 19, 3, 0, 0, TAU); ctx.fillStyle = 'rgba(42,39,35,0.35)'; ctx.fill(); }
  }
  // Kabine mit großem Fenster nach vorn
  ctx.beginPath(); ctx.ellipse(0, 0, 64, 46, 0, 0, TAU); paint('#f3f1ea', INK, 2.5);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 64, 46, 0, 0, TAU); ctx.clip();
  ctx.beginPath(); ctx.ellipse(34, -10, 42, 30, 0.2, 0, TAU); ctx.fillStyle = '#9fc4d6'; ctx.fill();
  // zwei Fahrgäste
  for (const [hx, c] of [[8, '#3a2c22'], [36, '#c9a46a']]) { box(hx - 9, 4, 18, 22, hx > 20 ? '#3e6f9e' : '#d9542b', 5, 1.2); circle(hx, -8, 9, '#e2b48f', INK, 1.2); ctx.beginPath(); ctx.arc(hx, -10, 9, Math.PI, 0); ctx.fillStyle = c; ctx.fill(); }
  box(44, -4, 7, 11, '#2a2723', 1, 1);
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(34, -10, 42, 30, 0.2, 0, TAU); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#3e6f9e'; ctx.fillRect(-62, 14, 60, 6);
  // Kufen
  line(-24, 42, -34, 62, INK, 3); line(24, 42, 34, 62, INK, 3); line(-58, 62, 58, 62, INK, 3);
  // Positionslichter
  circle(-140, -50, 4, '#d94a4a', null); circle(140, -50, 4, '#5fbf6a', null);
  if (g % 10 < 1) circle(0, 48, 5, '#ffffff', INK, 1);
  ctx.restore();
  if (foto) { ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(p.x + 52 * p.s * p.dir, p.y - 2 * p.s, 26 * p.s, 0, TAU); ctx.fill(); ctx.restore(); }
}
function taxiGlow(p) {
  glow(p.x - 140 * p.s * p.dir, p.y - 50 * p.s, 40 * p.s, 'rgba(255,90,80,0.9)');
  glow(p.x + 140 * p.s * p.dir, p.y - 50 * p.s, 40 * p.s, 'rgba(110,255,130,0.9)');
  glow(p.x + 34 * p.s * p.dir, p.y - 10 * p.s, 70 * p.s, 'rgba(255,236,190,0.7)');
}
const taxiBox = p => [p.x - 145 * p.s, p.y - 75 * p.s, 290 * p.s, 140 * p.s];

// Flugtaxi mit Pilot und vier Fahrgästen: Flügel, Leitwerk und sechs schwenkbare Propeller (im Reiseflug nach vorn gekippt)
function drawTilt(p, g, foto) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.s * p.dir, p.s);
  // hinterer Flügel/Leitwerk in V-Form
  ctx.beginPath(); ctx.moveTo(-118, -14); ctx.lineTo(-150, -50); ctx.lineTo(-136, -50); ctx.lineTo(-96, -14); ctx.closePath(); paint('#e8e6e0', INK, 2);
  // Rumpf
  ctx.beginPath(); ctx.moveTo(-140, -10); ctx.quadraticCurveTo(-60, -40, 60, -34); ctx.quadraticCurveTo(140, -30, 150, 2); ctx.quadraticCurveTo(140, 28, 60, 30); ctx.lineTo(-90, 18); ctx.quadraticCurveTo(-140, 8, -140, -10); ctx.closePath(); paint('#f3f1ea', INK, 2.5);
  // Fensterband mit Pilot vorn und vier Fahrgästen
  ctx.save(); ctx.beginPath(); ctx.moveTo(-50, -24); ctx.lineTo(110, -24); ctx.quadraticCurveTo(136, -20, 140, -4); ctx.lineTo(-50, -4); ctx.closePath(); ctx.fillStyle = '#9fc4d6'; ctx.fill(); ctx.clip();
  [[-34, '#3a2c22', '#3e6f9e'], [-8, '#c9a46a', '#d9542b'], [18, '#7a4a2a', '#5f9a4a'], [44, '#2a2723', '#f0b429'], [104, '#3b3d40', '#23384d']].forEach(([hx, hair, shirt]) => {
    box(hx - 8, -6, 16, 14, shirt, 4, 1); circle(hx, -14, 7, '#e2b48f', INK, 1); ctx.beginPath(); ctx.arc(hx, -16, 7, Math.PI, 0); ctx.fillStyle = hair; ctx.fill();
  });
  box(52, -16, 6, 9, '#2a2723', 1, 1);
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-50, -24); ctx.lineTo(110, -24); ctx.quadraticCurveTo(136, -20, 140, -4); ctx.lineTo(-50, -4); ctx.closePath(); ctx.stroke();
  line(80, -24, 80, -4, INK, 1.5); line(96, -26, 96, 26, 'rgba(42,39,35,0.4)', 1);
  ctx.fillStyle = '#3e6f9e'; ctx.fillRect(-120, 6, 200, 5);
  // Flügel oben, von der Seite fast nur als Kante zu sehen
  box(-30, -48, 90, 9, '#e8e6e0', 4, 2); line(0, -40, 0, -34, INK, 3); line(40, -40, 40, -34, INK, 3);
  // Gondeln mit Propellern: vorn am Flügel, hinten am Leitwerk
  for (const [nx, ny] of [[64, -44], [-150, -50]]) {
    box(nx - 22, ny - 6, 26, 12, '#d6d9dc', 5, 1.5);
    ctx.beginPath(); ctx.ellipse(nx + 6, ny, 3, g % 2 ? 34 : 26, 0, 0, TAU); ctx.fillStyle = 'rgba(42,39,35,0.35)'; ctx.fill();
  }
  // Fahrwerk
  for (const wx of [-60, 100]) { line(wx, 22, wx, 40, INK, 3); circle(wx, 42, 6, '#2d2f33', INK, 1.5); }
  // Positionslichter
  circle(-10, -48, 4, '#d94a4a', null); circle(60, -48, 4, '#5fbf6a', null);
  if (g % 10 < 1) circle(0, 30, 5, '#ffffff', INK, 1);
  ctx.restore();
  if (foto) { ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(p.x + 52 * p.s * p.dir, p.y - 12 * p.s, 20 * p.s, 0, TAU); ctx.fill(); ctx.restore(); }
}
function tiltGlow(p) {
  glow(p.x - 10 * p.s, p.y - 48 * p.s, 30 * p.s, 'rgba(255,90,80,0.9)');
  glow(p.x + 60 * p.s, p.y - 48 * p.s, 30 * p.s, 'rgba(110,255,130,0.9)');
  glow(p.x + 40 * p.s, p.y - 14 * p.s, 120 * p.s, 'rgba(255,236,190,0.55)');
}
const tiltBox = p => [p.x - 155 * p.s, p.y - 60 * p.s, 310 * p.s, 110 * p.s];

registerRunner({
  room: 'strasse',
  draw(g) {
    if (regen()) return;
    withAlpha('flugtaxi2', () => drawTaxi(taxiB(g), g, false));
  },
  glow(g) { if (!regen()) taxiGlow(taxiB(g)); },
  robot: { id: 'flugtaxi2', name: 'Flugtaxi ohne Pilot', bereich: 'Mobilität', aera: 'seit 2023 zugelassen', typ: 'Elektrischer Multikopter für zwei Fahrgäste',
    fakt: 'In China erhielt im Oktober 2023 zum ersten Mal ein Flugtaxi ohne Pilot eine Musterzulassung. Es hat 16 Rotoren an acht Armen, fliegt elektrisch und bringt zwei Fahrgäste auf festgelegten Strecken ans Ziel. Eine Leitstelle am Boden überwacht jeden Flug.',
    echt: 'Die Bauform ist echt. Es fliegt weit hinten und wirkt deshalb klein. In Deutschland gibt es bisher keinen regulären Flugtaxi-Betrieb mit Fahrgästen. Bei Regen bleibt es hier am Boden.',
    note: 'Fliegt weit hinten in die andere Richtung.', color: '#e8e6e0',
    quelle: 'https://en.wikipedia.org/wiki/EHang_216',
    box: () => (regen() ? HIDE : taxiBox(taxiB(state.g))) },
});
registerRunner({
  room: 'strasse',
  draw(g) {
    if (regen()) return;
    withAlpha('flugtaxi', () => { const p = taxiA(g); drawTilt(p, g, taxiFoto(p) && g % 6 < 1); });
  },
  glow(g) { if (!regen()) tiltGlow(taxiA(g)); },
  robot: { id: 'flugtaxi', name: 'Flugtaxi für vier Fahrgäste', bereich: 'Mobilität', aera: 'in Erprobung', typ: 'Elektrisches Senkrechtstarter-Flugzeug mit sechs Propellern',
    fakt: 'Dieses Flugtaxi startet senkrecht wie ein Hubschrauber. In der Luft kippt es seine sechs Propeller nach vorn und fliegt mit Flügeln weiter wie ein Flugzeug. Vorn sitzt ein Pilot, dahinter haben vier Fahrgäste Platz. In Dubai fanden 2025 Testflüge mit Pilot statt, dort soll einer der ersten Linienbetriebe beginnen.',
    echt: 'Bauform und Größe passen ungefähr: Der Rumpf ist etwa so lang wie ein Kleinbus. Über einer Stadt in Deutschland fliegt so etwas bisher nicht. Bei Regen bleibt es hier am Boden.',
    note: 'Fliegt hoch über alle Gebäude. Über Werk 101 fotografiert ein Fahrgast das Dach.', color: '#f3f1ea',
    quelle: 'https://en.wikipedia.org/wiki/Joby_Aviation',
    box: () => (regen() ? HIDE : tiltBox(taxiA(state.g))) },
});

/* ---------- Lieferdrohne mit Seilwinde: Werk 101 → Feld ---------- */
const NEST = { x: 520, y: TOP - 10 }, NEST_Y = NEST.y - 30, CRUISE = 190;
const FELD_X = rx(roomOf('feld').c) + 92, FELD_FOOT = ry(roomOf('feld').r) + 388, HOVER = FELD_FOOT - 280;
function wingPos(g) {
  g %= RUN_P;
  const at = (x, y, fly, tether = 0, load = true) => ({ x, y, fly, tether, load });
  if (regen()) return at(NEST.x, NEST_Y, false);
  if (g < 30) return at(NEST.x, NEST_Y, false, 0, g >= 20);
  if (g < 55) return at(NEST.x, lerp(NEST_Y, CRUISE, ease(seg(g, 30, 55))), false);
  if (g < 175) return at(lerp(NEST.x, FELD_X, ease(seg(g, 55, 175))), CRUISE, true);
  if (g < 215) return at(FELD_X, lerp(CRUISE, HOVER, ease(seg(g, 175, 215))), false);
  const drop = FELD_FOOT - HOVER - 32;
  if (g < 250) return at(FELD_X, HOVER, false, drop * seg(g, 215, 250));
  if (g < 262) return at(FELD_X, HOVER, false, drop, false);
  if (g < 290) return at(FELD_X, HOVER, false, drop * (1 - seg(g, 262, 290)), false);
  if (g < 330) return at(FELD_X, lerp(HOVER, CRUISE, ease(seg(g, 290, 330))), false, 0, false);
  if (g < 440) return at(lerp(FELD_X, NEST.x, ease(seg(g, 330, 440))), CRUISE, true, 0, false);
  if (g < 470) return at(NEST.x, lerp(CRUISE, NEST_Y, ease(seg(g, 440, 470))), false, 0, false);
  return at(NEST.x, NEST_Y, false, 0, false);
}
function drawWing(p, g) {
  const t = g % RUN_P, dir = !regen() && t >= 290 && t < 470 ? 1 : -1;
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(dir, 1);
  line(-30, 12, -30, 26, INK, 2); line(30, 12, 30, 26, INK, 2);
  line(-50, 12, 50, 12, INK, 3);
  for (const xr of [-46, -24, 24, 46]) {
    line(xr, 12, xr, 6, INK, 2);
    ctx.beginPath(); ctx.ellipse(xr, 5, p.fly ? 7 : (g % 2 ? 11 : 7), p.fly ? 1 : 2, 0, 0, TAU); ctx.fillStyle = 'rgba(42,39,35,0.45)'; ctx.fill();
  }
  ctx.beginPath(); ctx.moveTo(-44, -2); ctx.lineTo(-52, -18); ctx.lineTo(-42, -18); ctx.lineTo(-34, -2); ctx.closePath(); paint('#f3f1ea', INK, 1.5);
  box(-40, -6, 82, 14, '#f3f1ea', 7, 1.8);
  box(-14, -9, 34, 4, '#d6d9dc', 2, 1.2);
  ctx.fillStyle = '#2f8f83'; ctx.fillRect(-30, 2, 50, 3);
  ctx.beginPath(); ctx.ellipse(45, 1, p.fly ? 2 : 1.5, p.fly ? (g % 2 ? 11 : 7) : 9, 0, 0, TAU); ctx.fillStyle = p.fly ? 'rgba(42,39,35,0.4)' : INK; ctx.fill();
  circle(-38, -2, 2.5, '#d94a4a', null); if (g % 8 < 1) circle(0, 9, 3, '#ffffff', INK, 1);
  ctx.restore();
  if (p.tether > 0) line(p.x, p.y + 9, p.x, p.y + 9 + p.tether, INK, 1);
  if (p.load) { box(p.x - 3, p.y + 7 + p.tether, 6, 4, '#3b3d40', 1, 1); drawParcel(p.x, p.y + 25 + p.tether, 0, 0.8); }
  else if (p.tether > 0) box(p.x - 3, p.y + 7 + p.tether, 6, 4, '#3b3d40', 1, 1);
}
function drawNest(g) {
  box(NEST.x - 50, NEST.y - 6, 100, 6, '#3b3d40', 1, 1.5);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = '#f0b429'; ctx.fillRect(NEST.x - 46 + i * 26, NEST.y - 5, 12, 3); }
  // Paketschalter neben dem Nest: schiebt das nächste Paket unter die Drohne
  box(NEST.x + 62, NEST.y - 40, 46, 40, '#8a8f94', 2, 1.5); box(NEST.x + 62, NEST.y - 14, 8, 10, '#2a2723', 1, 1);
  const t = g % RUN_P;
  if (t < 22 && !regen()) drawParcel(lerp(NEST.x + 84, NEST.x, ease(seg(t, 4, 20))), NEST.y - 5, 0, 0.8);
}
// Paket bleibt bei der Landwirtin liegen, bis die nächste Runde beginnt
function feldPaket(g) {
  g %= RUN_P;
  if (regen() || g < 250 || g >= 478) return 0;
  return 1 - seg(g, 455, 476);
}
registerRunner({
  room: 'drohnen',
  draw(g) {
    drawNest(g);
    withAlpha('wing', () => {
      const a = feldPaket(g);
      if (a > 0) { ctx.save(); ctx.globalAlpha *= a; drawParcel(FELD_X, FELD_FOOT, 0, 0.8); ctx.restore(); }
      drawWing(wingPos(g), g);
    });
  },
  glow(g) { const p = wingPos(g); if (p.y < NEST_Y - 4) { glow(p.x, p.y - 2, 22, 'rgba(255,90,80,0.9)'); glow(p.x, p.y + 9, 18, 'rgba(255,255,255,0.6)'); } },
  robot: { id: 'wing', name: 'Lieferdrohne mit Seilwinde', bereich: 'Logistik', aera: 'seit 2019', typ: 'Drohne mit Flügeln und zwölf Hubrotoren',
    fakt: 'Diese Art Lieferdrohne startet senkrecht, fliegt dann mit Flügeln wie ein kleines Flugzeug und schaltet die Hubrotoren ab. Am Ziel bleibt sie in der Luft stehen und lässt das Paket an einer Leine hinab. Sie landet beim Kunden also nie. In Australien und den USA wird so seit 2019 ausgeliefert.',
    echt: 'Realistisch, auch die Leine. Bei starkem Regen und Wind bleiben solche Drohnen am Boden, darum wartet sie hier bei Regen im Nest auf dem Dach.',
    note: 'Startet vom Nest auf dem Dach, fliegt zum Feld und lässt der Landwirtin ein Paket hinab. Sie hatte es per Handy bestellt.', color: '#f3f1ea',
    quelle: 'https://en.wikipedia.org/wiki/Wing_(company)',
    box: () => { const p = wingPos(state.g); return [p.x - 54, p.y - 20, 108, 48 + p.tether + (p.load ? 20 : 0)]; } },
});

/* ---------- Paketdrohne zur Paketstation auf dem Dach der Schule 102 ---------- */
// Schule 102 wie H2 in engine.js (die wird erst später geladen)
const S2X = rx(4) - WALL, S2Y = ry(5) - WALL, S2W = 2 * (RW + WALL) + WALL;
const ST_X = S2X + 436, ST_TOP = S2Y - 80, ST_FLOOR = S2Y - 14, ALT2 = S2Y - 420, IN_X = S2X + S2W + 1100;
function stationDrone(g) {
  g %= RUN_P;
  const hov = ST_TOP - 86, low = ST_TOP - 4;
  if (regen() || g < 100 || g >= 420) return null;
  if (g < 200) return { x: lerp(IN_X, ST_X, ease(seg(g, 100, 200))), y: ALT2, load: true };
  if (g < 240) return { x: ST_X, y: lerp(ALT2, hov, ease(seg(g, 200, 240))), load: true };
  if (g < 250) return { x: ST_X, y: hov, load: true };
  if (g < 265) return { x: ST_X, y: lerp(hov, low, ease(seg(g, 250, 265))), load: true };
  if (g < 272) return { x: ST_X, y: low, load: false };
  if (g < 290) return { x: ST_X, y: lerp(low, hov, ease(seg(g, 272, 290))), load: false };
  if (g < 320) return { x: ST_X, y: lerp(hov, ALT2, ease(seg(g, 290, 320))), load: false };
  return { x: lerp(ST_X, IN_X, ease(seg(g, 320, 420))), y: ALT2, load: false };
}
const stLid = g => { g %= RUN_P; return regen() ? 0 : g < 240 ? 0 : g < 250 ? seg(g, 240, 250) : g < 285 ? 1 : 1 - seg(g, 285, 295); };
function drawStation(g) {
  const t = g % RUN_P;
  // Paket im Inneren: fällt beim Loslassen auf den Boden der Station
  if (!regen() && t >= 265 && t < 300) drawParcel(ST_X, lerp(ST_TOP + 26, ST_FLOOR, ease(seg(t, 265, 272))), 0, 1);
  box(ST_X - 38, ST_TOP, 76, ST_FLOOR - ST_TOP + 4, '#e8e4da', 3, 2);
  ctx.fillStyle = '#3e6f9e'; ctx.fillRect(ST_X - 38, ST_TOP + 30, 76, 6);
  text('PAKET', ST_X, ST_TOP + 54, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  const o = stLid(g);
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(ST_X + s * 38, ST_TOP); ctx.rotate(s * 1.9 * o); box(s > 0 ? -38 : 0, -4, 38, 5, '#3b3d40', 1, 1.2); ctx.restore(); }
}
registerRunner({
  room: 'robotik',
  draw(g) {
    drawStation(g);
    const p = stationDrone(g);
    if (!p) return;
    withAlpha('stationsdrohne', () => {
      if (p.load) { line(p.x, p.y + 3, p.x, p.y + 8, INK, 2); drawParcel(p.x, p.y + 26, 0, 1); }
      quad(p.x, p.y, g, { color: '#f0b429', w: 74 });
    });
  },
  glow(g) { const p = stationDrone(g); if (p) glow(p.x, p.y - 4, 22, 'rgba(255,200,90,0.9)'); },
  robot: { id: 'stationsdrohne', name: 'Paketdrohne mit Dachstation', bereich: 'Logistik', aera: 'Tests seit 2016', typ: 'Multikopter und Paketstation',
    fakt: 'Paketdrohnen können ihre Ladung in eine Station abgeben, die das Paket automatisch annimmt. 2016 flog eine Paketdrohne in den bayerischen Alpen zu so einer Station, wo Leute ihre Pakete wie an einer Packstation abholen konnten.',
    echt: 'Stationen wie diese gibt es bisher nur bei Tests. Bei Regen fliegt die Drohne hier nicht.',
    note: 'Bringt Ersatzräder für die Robotik-AG. Die Klappe der Station öffnet sich nur, solange die Drohne darüber steht.', color: '#f0b429',
    quelle: 'https://ciltuk.org.uk/News/Latest-News/ArtMID/6887/ArticleID/8884/Successful-Trial-Integration-of-DHL-Parcelcopter-into-Logistics-Chain',
    box: () => { const p = stationDrone(state.g); return p ? [p.x - 40, p.y - 16, 80, p.load ? 44 : 22] : HIDE; } },
});

/* ---------- Abendhimmel: Satellitenkette und Raumstation, nur bei „Abend“ zu sehen ---------- */
const abend = () => istDunkel();
const SL_N = 22;
const slPos = (g, i) => { const t = ((g % RUN_P) / RUN_P) - i * 0.006; return { x: lerp(-4600, 6600, t), y: lerp(-470, -420, t) }; };
registerRunner({
  room: 'strasse',
  draw() {},
  glow(g) {
    for (let i = 0; i < SL_N; i++) { const p = slPos(g, i); glow(p.x, p.y, 10, 'rgba(255,255,240,0.9)'); circle(p.x, p.y, 2.2, '#fffbe8', null); }
  },
  robot: { id: 'satkette', name: 'Satellitenkette', bereich: 'Raumfahrt', aera: 'seit 2019', typ: 'Neu gestartete Internet-Satelliten',
    fakt: 'Kurz nach dem Start fliegen neue Starlink-Satelliten von SpaceX hintereinander wie eine Perlenkette über den Himmel. In der Dämmerung, wenn die Sonne sie noch anstrahlt, sieht man sie als Lichterkette. Nach einigen Tagen steigen sie höher und verteilen sich.',
    echt: 'Echt, aber nur kurz nach einem Start und nur in der Dämmerung. Darum erscheint sie hier nur, wenn oben „Wetter: Abend“ eingestellt ist.',
    note: 'Zieht als Lichterkette schräg über den Abendhimmel.', color: '#fffbe8',
    quelle: 'https://en.wikipedia.org/wiki/Starlink',
    box: () => { if (!abend()) return HIDE; const a = slPos(state.g, 0), b = slPos(state.g, SL_N - 1); return [Math.min(a.x, b.x) - 10, Math.min(a.y, b.y) - 10, Math.abs(a.x - b.x) + 20, Math.abs(a.y - b.y) + 20]; } },
});
const issPos = g => { g %= RUN_P; if (g < 120 || g >= 260) return null; const t = seg(g, 120, 260); return { x: lerp(6200, -4200, t), y: -520 - 20 * Math.sin(Math.PI * t) }; };
registerRunner({
  room: 'satellit',
  draw() {},
  glow(g) { const p = issPos(g); if (p) { glow(p.x, p.y, 40, 'rgba(255,255,255,0.95)'); circle(p.x, p.y, 6, '#ffffff', null); } },
  robot: { id: 'issflug', name: 'Raumstation am Abendhimmel', bereich: 'Raumfahrt', aera: 'seit 1998', typ: 'Internationale Raumstation ISS',
    fakt: 'Die Internationale Raumstation umrundet die Erde in etwa 90 Minuten. Abends sieht man sie als hellen Punkt, der nicht blinkt und gleichmäßig über den Himmel zieht. An Bord arbeiten ein großer Roboterarm und kleine fliegende Würfelroboter.',
    echt: 'Echt, nur viel langsamer: In echt dauert ein Überflug einige Minuten. Flugzeuge blinken, die Raumstation nicht.',
    note: 'Zieht ab und zu als heller Punkt vorbei, nur bei „Abend“.', color: '#ffffff',
    quelle: 'https://en.wikipedia.org/wiki/International_Space_Station',
    box: () => { const p = abend() && issPos(state.g); return p ? [p.x - 30, p.y - 30, 60, 60] : HIDE; } },
});

/* ---------- Raketenstart mit Landung der ersten Stufe (weit hinten zwischen Schule 102 und Halle 103) ---------- */
const RK_PAD = { x: rx(6) + 90, y: GROUND - 6 }, RK_LZ = { x: rx(6) + 230, y: GROUND - 6 }, RK_K = 2.4, RK_H = 118 * RK_K;
// Start 60–175 (steigt bis hoch in den Himmel), 175 Stufentrennung, 185–240 Oberstufe steigt weiter, 205 Spitze öffnet,
// 215–300 Satellit treibt davon und klappt die Solarflügel aus. Erste Stufe kommt 300–400 zurück und landet, 440–479 neue Rakete.
const RK_SEP = 3000;
function rkState(g) {
  g %= RUN_P;
  const up = g < 60 ? 0 : g < 175 ? RK_SEP * seg(g, 60, 175) ** 2 : RK_SEP;
  const up2 = g < 175 ? up : RK_SEP + 30 + 170 * ease(seg(g, 178, 250));
  const back = g < 300 ? null : g < 400 ? RK_LZ.y - 4000 * (1 - ease(seg(g, 300, 400))) : RK_LZ.y;
  return { up, up2, back, sep: g >= 175, fall: g >= 175 && g < 200 ? seg(g, 175, 200) : g >= 200 ? 1 : 0,
    fire: g >= 50 && g < 175, fire2: g >= 182 && g < 238, open: seg(g, 204, 214), sat: g >= 212 && g < 330 ? seg(g, 212, 300) : 0,
    upperA: g < 175 ? 0 : 1 - seg(g, 250, 270), satA: g < 212 ? 0 : 1 - seg(g, 310, 330),
    burn: g >= 350 && g < 400, legs: g >= 370 ? seg(g, 370, 385) : 0,
    smoke: g >= 44 && g < 140 ? seg(g, 44, 70) * (1 - seg(g, 110, 140)) : 0, newA: seg(g, 440, 476), oldA: g >= 400 ? 1 - seg(g, 440, 476) : 1 };
}
// Oberstufe mit Nutzlastverkleidung; open 0–1 klappt die zwei Hälften auf
function rkUpper(x, base, open) {
  ctx.save(); ctx.translate(x, base); ctx.scale(RK_K, RK_K);
  box(-6, -18, 12, 18, '#f3f1ea', 1, 1.5); line(-3, 0, -5, 6, INK, 1.5); line(3, 0, 5, 6, INK, 1.5);
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(s * 7 + s * 26 * open, -18 + 10 * open); ctx.rotate(s * 0.9 * open);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -16); ctx.quadraticCurveTo(-s * 2, -30, -s * 7, -32); ctx.lineTo(-s * 7, 0); ctx.closePath(); paint('#f3f1ea', INK, 1.3);
    ctx.restore();
  }
  ctx.restore();
}
// Satellit: Kasten mit zwei Solarflügeln, die sich auffalten
function rkSat(x, y, unfold) {
  ctx.save(); ctx.translate(x, y); ctx.scale(RK_K, RK_K);
  box(-7, -7, 14, 14, '#d6a521', 1, 1.2);
  const w = 4 + 26 * unfold;
  for (const s of [-1, 1]) { line(s * 7, 0, s * 10, 0, INK, 1.2); box(s > 0 ? 10 : -10 - w, -5, w, 10, '#23384d', 0, 1); }
  circle(0, -9, 2.5, '#e6e3da', INK, 1);
  ctx.restore();
}
// gezeichnet im kleinen Maß (Höhe 118) und mit RK_K vergrößert
function rkBody(x, base, h, stage) {
  ctx.save(); ctx.translate(x, base); ctx.scale(RK_K, RK_K); ctx.translate(-x, -base); h /= RK_K;
  box(x - 6, base - h, 12, h, '#f3f1ea', 2, 1.5);
  ctx.fillStyle = '#2a2723'; ctx.fillRect(x - 6, base - h * 0.62, 12, 6);
  if (!stage) { ctx.beginPath(); ctx.moveTo(x - 7, base - h * 0.62); ctx.lineTo(x - 7, base - h - 6); ctx.quadraticCurveTo(x, base - h - 20, x + 7, base - h - 6); ctx.lineTo(x + 7, base - h * 0.62); ctx.closePath(); paint('#f3f1ea', INK, 1.5); }
  for (const s of [-1, 1]) line(x + s * 6, base - (stage ? h - 4 : h * 0.66), x + s * 11, base - (stage ? h - 8 : h * 0.66 - 4), INK, 2);
  ctx.restore();
}
function rkFlame(x, base, len, g) { ctx.save(); ctx.translate(x, base); ctx.scale(RK_K, RK_K); ctx.translate(-x, -base); ctx.beginPath(); ctx.moveTo(x - 5, base); ctx.lineTo(x + 5, base); ctx.lineTo(x, base + len + (g % 2) * 6); ctx.closePath(); ctx.fillStyle = '#ffb347'; ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 2, base); ctx.lineTo(x + 2, base); ctx.lineTo(x, base + len * 0.6); ctx.closePath(); ctx.fillStyle = '#fff3c4'; ctx.fill(); ctx.restore(); }
registerRunner({
  room: 'dunkel',
  draw(g) {
    if (regen()) return;
    withAlpha('rakete', () => {
      const r = rkState(g);
      // Startturm und Landeplatz
      for (const dx of [-44, -30]) line(RK_PAD.x + dx, RK_PAD.y, RK_PAD.x + dx, RK_PAD.y - RK_H - 20, '#8a8f94', 3);
      for (let y = RK_PAD.y - 20; y > RK_PAD.y - RK_H; y -= 22) { line(RK_PAD.x - 44, y, RK_PAD.x - 30, y - 22, '#8a8f94', 1.5); line(RK_PAD.x - 30, y, RK_PAD.x - 16, y, '#8a8f94', 2); }
      box(RK_PAD.x - 50, RK_PAD.y, 100, 8, '#5d6064', 1, 1.2);
      ctx.beginPath(); ctx.ellipse(RK_LZ.x, RK_LZ.y + 3, 54, 7, 0, 0, TAU); paint('#5d6064', INK, 1); text('X', RK_LZ.x, RK_LZ.y + 8, 14, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f0b429' });
      // Rakete startet
      const gg = g % RUN_P;
      if (!r.sep && gg >= 40 && gg < 440 || gg < 40) { const base = RK_PAD.y - r.up; rkBody(RK_PAD.x, base, RK_H, false); if (r.fire) rkFlame(RK_PAD.x, base, 26 + Math.min(r.up, 2000) * 0.02, g); }
      if (r.sep && gg < 300) {
        const top = RK_PAD.y - RK_SEP;
        // erste Stufe fällt nach der Trennung zurück und verschwindet (sie landet später auf dem X)
        if (r.fall < 1) { ctx.save(); ctx.globalAlpha *= 1 - r.fall; rkBody(RK_PAD.x, top + 140 * r.fall, RK_H * 0.66, true); ctx.restore(); }
        const ub = RK_PAD.y - r.up2 - RK_H * 0.66;
        if (r.upperA > 0) { ctx.save(); ctx.globalAlpha *= r.upperA; rkUpper(RK_PAD.x + 20 * r.sat, ub, r.open); if (r.fire2) rkFlame(RK_PAD.x, ub, 10, g); ctx.restore(); }
        if (r.satA > 0) { ctx.save(); ctx.globalAlpha *= r.satA; rkSat(RK_PAD.x - 10 - 260 * r.sat, ub - 60 - 70 * r.sat, seg(gg, 225, 260)); ctx.restore(); }
        if (gg >= 176 && gg < 186) glow(RK_PAD.x, top - RK_H * 0.66, 60, 'rgba(255,220,160,0.8)');
      }
      if (r.smoke > 0) for (let i = 0; i < 9; i++) circle(RK_PAD.x - 80 + i * 20, RK_PAD.y - 10 - (i % 3) * 14, 26 * r.smoke + (i % 2) * 6, 'rgba(240,238,232,0.85)', null);
      // neue Rakete erscheint nach der Landung
      if (r.newA > 0) { ctx.save(); ctx.globalAlpha *= r.newA; rkBody(RK_PAD.x, RK_PAD.y, RK_H, false); ctx.restore(); }
      // erste Stufe kommt zurück und landet aufrecht
      if (r.back != null && r.oldA > 0) {
        ctx.save(); ctx.globalAlpha *= r.oldA;
        const sh = RK_H * 0.66; rkBody(RK_LZ.x, r.back, sh, true);
        if (r.burn) rkFlame(RK_LZ.x, r.back, 22, g);
        for (const s of [-1, 1]) line(RK_LZ.x + s * 14, r.back - 34, RK_LZ.x + s * (14 + 28 * r.legs), r.back + 4 * r.legs, INK, 3);
        ctx.restore();
      }
    });
  },
  glow(g) {
    if (regen()) return; const r = rkState(g);
    if (r.fire) glow(RK_PAD.x, RK_PAD.y - r.up + 50, 140, 'rgba(255,190,90,0.9)');
    if (r.fire2) glow(RK_PAD.x, RK_PAD.y - r.up2 - RK_H * 0.66 + 30, 60, 'rgba(255,190,90,0.9)');
    if (r.burn) glow(RK_LZ.x, r.back + 40, 110, 'rgba(255,190,90,0.9)');
  },
  robot: { id: 'rakete', name: 'Rakete mit Landestufe', bereich: 'Raumfahrt', aera: 'seit 2015', typ: 'Wiederverwendbare Rakete',
    fakt: 'Die erste Stufe einer Falcon-9-Rakete fliegt nach dem Start zurück und landet aufrecht auf ihren Beinen. Gesteuert wird das vom Bordcomputer, kein Mensch lenkt mit. Das gelang zum ersten Mal im Dezember 2015. Manche Stufen sind inzwischen mehr als 20 Mal geflogen.',
    echt: 'Die Landung ist echt. Ein Startplatz mitten in der Stadt ist ein Spaß: Raketen starten weit weg von Häusern, oft am Meer. Bei Regen startet hier nichts.',
    note: 'Steigt hoch in den Himmel, wirft die erste Stufe ab, öffnet die Spitze und setzt einen Satelliten aus, der seine Solarflügel ausklappt. Die erste Stufe kommt zurück und landet auf dem X.', color: '#f3f1ea',
    quelle: 'https://en.wikipedia.org/wiki/Falcon_9',
    box: () => { if (regen()) return HIDE; const r = rkState(state.g), g = state.g % RUN_P;
      if (r.back != null && g < 440) return [RK_LZ.x - 40, r.back - RK_H * 0.66 - 8, 80, RK_H * 0.66 + 14];
      if (g >= 175 && g < 330) { const ub = RK_PAD.y - r.up2 - RK_H * 0.66; return [RK_PAD.x - 300 - 260 * r.sat + 200, ub - 240, 420, 260]; }
      if (g >= 40 && g < 175) return [RK_PAD.x - 40, RK_PAD.y - r.up - RK_H - 50, 80, RK_H + 60];
      return [RK_PAD.x - 50, RK_PAD.y - RK_H - 40, 100, RK_H + 46]; } },
});

/* ---------- Magnetschwebebahn hinter den Häusern: fährt auf einer Stelzenstrecke einmal pro langer Runde von links nach rechts ---------- */
const MG_Y = GROUND - 330, MG_CAR = 560, MG_N = 3;
const mgX = g => lerp(-6200, 10400, (g % RUN_P) / RUN_P);
function drawMaglevBack(g) {
  const ab = istDunkel();
  // Fahrweg: Betonträger auf Stelzen
  ctx.fillStyle = ab ? '#4a5470' : '#b9c3c4'; ctx.fillRect(-7000, MG_Y + 6, 18000, 26);
  ctx.strokeStyle = ab ? '#2f3650' : '#8f9a9c'; ctx.lineWidth = 2; ctx.strokeRect(-7000, MG_Y + 6, 18000, 26);
  for (let x = -6900; x < 11000; x += 420) { ctx.fillStyle = ab ? '#424b66' : '#aab5b6'; ctx.fillRect(x, MG_Y + 32, 22, GROUND - MG_Y - 32); }
  if (regen() && false) return;
  const head = mgX(g);
  for (let k = 0; k < MG_N; k++) {
    const x1 = head - k * (MG_CAR + 10), x0 = x1 - MG_CAR;
    ctx.beginPath();
    if (k === 0) { ctx.moveTo(x0, MG_Y + 6); ctx.lineTo(x1 - 120, MG_Y + 6); ctx.quadraticCurveTo(x1 + 10, MG_Y + 4, x1 - 30, MG_Y - 50); ctx.quadraticCurveTo(x1 - 90, MG_Y - 66, x1 - 160, MG_Y - 66); ctx.lineTo(x0, MG_Y - 66); }
    else if (k === MG_N - 1) { ctx.moveTo(x1, MG_Y + 6); ctx.lineTo(x0 + 120, MG_Y + 6); ctx.quadraticCurveTo(x0 - 10, MG_Y + 4, x0 + 30, MG_Y - 50); ctx.quadraticCurveTo(x0 + 90, MG_Y - 66, x0 + 160, MG_Y - 66); ctx.lineTo(x1, MG_Y - 66); }
    else { ctx.rect(x0, MG_Y - 66, MG_CAR, 72); }
    ctx.closePath(); paint(ab ? '#c9cfd6' : '#eef1ef', ab ? '#2f3650' : '#6f7a7c', 2);
    // Fensterband und Streifen
    const wx0 = k === MG_N - 1 ? x0 + 150 : x0 + 20, wx1 = k === 0 ? x1 - 150 : x1 - 20;
    ctx.fillStyle = ab ? '#ffe7a3' : '#55687a'; ctx.fillRect(wx0, MG_Y - 50, wx1 - wx0, 18);
    ctx.fillStyle = 'rgba(217,84,43,0.8)'; ctx.fillRect(Math.max(x0, wx0 - 10), MG_Y - 22, Math.min(x1, wx1 + 10) - Math.max(x0, wx0 - 10), 6);
    // Schürze umgreift den Fahrweg
    ctx.fillStyle = ab ? '#9aa3ad' : '#c6ccce'; ctx.fillRect(x0 + 10, MG_Y + 6, MG_CAR - 20, 16);
  }
}
registerRunner({
  room: 'schulweg',
  draw() {},
  robot: { id: 'magnetbahn', name: 'Magnetschwebebahn', bereich: 'Mobilität', aera: 'seit 2004 im Linienbetrieb', typ: 'Zug, der über der Schiene schwebt',
    fakt: 'Die Bahn hat keine Räder. Magnete heben sie einen Zentimeter über den Fahrweg und ziehen sie vorwärts. Ohne Reibung schafft sie über 400 Kilometer pro Stunde. Gesteuert wird sie aus einer Leitzentrale, im Zug sitzt kein Fahrer.',
    echt: 'Echt. Die deutsche Magnetbahn Transrapid wurde im Emsland getestet und fährt seit 2004 in Shanghai zum Flughafen. In Japan entsteht eine Strecke für über 500 Kilometer pro Stunde. Hinter unseren Häusern fährt sie nur zum Spaß.',
    note: 'Saust auf ihrer Stelzenstrecke hinter den Häusern vorbei. Am besten sieht man sie zwischen den Gebäuden.', color: '#eef1ef',
    quelle: 'https://en.wikipedia.org/wiki/Transrapid',
    box: () => { const h = mgX(state.g); return [h - MG_N * (MG_CAR + 10), MG_Y - 70, MG_N * (MG_CAR + 10), 96]; } },
});
