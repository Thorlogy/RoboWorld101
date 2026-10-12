/* RoboWorld 101 – Himmel: Flugtaxis und Lieferdrohnen. Läuft auf der globalen Uhr state.g (0–479 = 40 s).
   Lieferdrohne mit Seilwinde: startet vom Dach von Werk 101 und lässt ein Paket zur Landwirtin am Feld hinab.
   Paketdrohne: kommt von rechts und setzt Ersatzteile in die Paketstation auf dem Dach der Schule 102.
   Bei Regen bleiben alle Fluggeräte am Boden. Wird nach runners.js geladen. */
const HIDE = [-99999, -99999, 1, 1];
const regen = () => state.wetter === 'regen';

/* ---------- Flugtaxis ---------- */
const TX_L = -3300, TX_R = 5600, TX_A = -70, TX_B = -160;
const taxiA = g => ({ x: lerp(TX_L, TX_R, (g % RUN_P) / RUN_P), y: TX_A + 6 * Math.sin(TAU * g / 120), s: 0.55, dir: 1 });
const taxiB = g => ({ x: lerp(TX_R, TX_L, ((g + 200) % RUN_P) / RUN_P), y: TX_B + 4 * Math.sin(TAU * g / 90), s: 0.3, dir: -1 });
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

registerRunner({
  room: 'strasse',
  draw(g) {
    if (regen()) return;
    withAlpha('flugtaxi', () => { const p = taxiA(g); drawTaxi(p, g, taxiFoto(p) && g % 6 < 1); });
  },
  glow(g) { if (!regen()) taxiGlow(taxiA(g)); },
  robot: { id: 'flugtaxi', name: 'Flugtaxi ohne Pilot', bereich: 'Mobilität', aera: 'seit 2023 zugelassen', typ: 'Elektrischer Multikopter für zwei Fahrgäste',
    fakt: 'In China erhielt im Oktober 2023 zum ersten Mal ein Flugtaxi ohne Pilot eine Musterzulassung. Es hat 16 Rotoren an acht Armen, fliegt elektrisch und bringt zwei Fahrgäste auf festgelegten Strecken ans Ziel. Eine Leitstelle am Boden überwacht jeden Flug.',
    echt: 'Die Bauform ist echt. Gezeichnet ist es kleiner, weil es weit weg fliegt. In Deutschland gibt es bisher keinen regulären Flugtaxi-Betrieb mit Fahrgästen. Bei Regen bleibt es hier am Boden.',
    note: 'Fliegt hoch über alle Gebäude. Über Werk 101 fotografiert ein Fahrgast das Dach.', color: '#e8e6e0',
    quelle: 'https://en.wikipedia.org/wiki/EHang_216',
    box: () => (regen() ? HIDE : taxiBox(taxiA(state.g))) },
});
registerRunner({
  room: 'strasse',
  draw(g) {
    if (regen()) return;
    withAlpha('flugtaxi2', () => drawTaxi(taxiB(g), g, false));
  },
  glow(g) { if (!regen()) taxiGlow(taxiB(g)); },
  robot: { id: 'flugtaxi2', name: 'Flugtaxi in der Ferne', bereich: 'Mobilität', aera: 'in Erprobung', typ: 'Elektrischer Multikopter',
    fakt: 'Flugtaxis sollen auf festen Strecken zwischen Landeplätzen pendeln, ähnlich wie eine Buslinie in der Luft. Weil sie elektrisch fliegen, reicht eine Akkuladung nur für kurze Strecken.',
    echt: 'So viel Verkehr am Himmel ist noch Zukunft. Bisher fliegen Flugtaxis vor allem bei Tests und Vorführungen.',
    note: 'Fliegt weiter hinten in die andere Richtung und wirkt deshalb kleiner.', color: '#e8e6e0',
    quelle: 'https://en.wikipedia.org/wiki/EHang_216',
    box: () => (regen() ? HIDE : taxiBox(taxiB(state.g))) },
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
const S2X = rx(4) - WALL, S2Y = ry(4) - WALL, S2W = 2 * (RW + WALL) + WALL;
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
