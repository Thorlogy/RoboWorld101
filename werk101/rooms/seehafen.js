/* Seehafen ganz rechts (c 15–19): Containerlager, Kai mit Containerbrücke, Liegeplatz mit Containerschiff, Becken, Hubbrücke.
   Hafengeräte sind riesig, darum ist der ganze Hafen im Maßstab 1 : 4 gezeichnet (1 m ≈ 17 Einheiten, Mensch ≈ 29 hoch).
   Alles zeichnet ein Läufer ohne Zuschnitt, weil Kran und Brücke hoch über die Felder ragen. Die Felder selbst bleiben leer.
   Container: langeUhr(2) – eine Runde entladen (Schiff → Lager), die nächste beladen (dieselben Wege rückwärts), daher nahtlos. */
const SHHX = rx(roomOf('shterminal').c), SH_QY = ry(6) + 384, SH_WY = SH_QY + 52, SH_BOT = ry(7) + RH;
const SH_M = 69 / 4;                              // 1 Meter im Hafenmaßstab
const SH_XQ = rx(roomOf('shkai').c) + 622;        // Kaikante
const SH_CW = 210, SH_CH = 45;                    // 40-Fuß-Container: 12,2 m × 2,6 m
const SH_SX = SH_XQ + 40, SH_SL = 80 * SH_M, SH_DECK = SH_WY - 98, SH_KIEL = SH_WY + 109;   // Schiff 80 m, Tiefgang 6,3 m
const SH_BAY = b => SH_SX + 40 + b * 215;
const SH_XS = SH_BAY(1) + SH_CW / 2;              // Stellplatz des bewegten Containers an Bord
const SH_A = SH_XQ - 170, SH_B = SHHX + 380, SH_STK = SHHX + 190;   // AGV am Kran, AGV am Lagerkran, Stapel
const SH_BR = rx(roomOf('shbruecke').c) + 320;
const SH_FEUER = SH_BR + 420;
const shUhr = () => (typeof langeUhr === 'function' ? langeUhr(2) : state.g);
const shTau = () => { const t = shUhr(); return t < 480 ? t : 959 - t; };
const shEntladen = () => shUhr() < 480;

/* ---------- Bewegungen ---------- */
function shU(τ) {
  const up = SH_QY - 520, topS = SH_DECK - 4 * SH_CH, topA = SH_QY - 24 - SH_CH;
  const up2 = SH_QY - 260, topT = SH_QY - 3 * SH_CH;
  const sx = τ < 40 ? lerp(SH_A, SH_XS, ease(seg(τ, 0, 40))) : τ < 120 ? SH_XS : τ < 200 ? lerp(SH_XS, SH_A, ease(seg(τ, 120, 200))) : SH_A;
  const sy = τ < 40 ? up : τ < 80 ? lerp(up, topS, ease(seg(τ, 40, 80))) : τ < 120 ? lerp(topS, up, ease(seg(τ, 80, 120))) : τ < 200 ? up : τ < 240 ? lerp(up, topA, ease(seg(τ, 200, 240))) : τ < 260 ? lerp(topA, up, seg(τ, 240, 260)) : up;
  const agv = τ < 260 ? SH_A : τ < 360 ? lerp(SH_A, SH_B, ease(seg(τ, 260, 360))) : SH_B;
  const ax = τ < 400 ? SH_B : τ < 440 ? lerp(SH_B, SH_STK, ease(seg(τ, 400, 440))) : SH_STK;
  const ay = τ < 360 ? up2 : τ < 380 ? lerp(up2, topA, ease(seg(τ, 360, 380))) : τ < 400 ? lerp(topA, up2, ease(seg(τ, 380, 400))) : τ < 440 ? up2 : τ < 470 ? lerp(up2, topT, ease(seg(τ, 440, 470))) : lerp(topT, up2, seg(τ, 470, 480));
  let c;
  if (τ < 80) c = { x: SH_XS, top: topS };
  else if (τ < 240) c = { x: sx, top: sy };
  else if (τ < 380) c = { x: agv, top: topA };
  else if (τ < 470) c = { x: ax, top: ay };
  else c = { x: SH_STK, top: topT };
  return { sx, sy, agv, ax, ay, c };
}
const shLift = g => g < 30 ? 0 : g < 60 ? 300 * ease(seg(g, 30, 60)) : g < 150 ? 300 : g < 180 ? 300 * (1 - ease(seg(g, 150, 180))) : g < 290 ? 0 : g < 320 ? 300 * ease(seg(g, 290, 320)) : g < 420 ? 300 : g < 450 ? 300 * (1 - ease(seg(g, 420, 450))) : 0;
const SH_BIN_AUS = SHHX + 3500, SH_BIN_IN = SHHX + 2050;
const shBinX = g => g < 30 ? SH_BIN_AUS : g < 180 ? lerp(SH_BIN_AUS, SH_BIN_IN, ease(seg(g, 30, 180))) : g < 280 ? SH_BIN_IN : g < 430 ? lerp(SH_BIN_IN, SH_BIN_AUS, ease(seg(g, 280, 430))) : SH_BIN_AUS;
const shSkater = g => SH_SX + 220 + 900 * (0.5 - 0.5 * Math.cos(TAU * g / 480));

/* ---------- Zeichnen ---------- */
function shContainer(x, top, farbe) {
  box(x - SH_CW / 2, top, SH_CW, SH_CH, farbe, 0, 1.5);
  for (let i = 1; i < 10; i++) line(x - SH_CW / 2 + i * 21, top + 4, x - SH_CW / 2 + i * 21, top + SH_CH - 4, 'rgba(42,39,35,0.25)', 1);
}
const SH_FARBEN = ['#d9542b', '#3e6f9e', '#5f9a4a', '#8a8f94', '#f0b429', '#7b4b8e', '#a8763f'];
function shSchiff() {
  const x0 = SH_SX, x1 = SH_SX + SH_SL;
  // Rumpf: unten rot (Unterwasseranstrich), oben dunkelblau
  ctx.beginPath(); ctx.moveTo(x0, SH_DECK); ctx.lineTo(x1 - 60, SH_DECK); ctx.quadraticCurveTo(x1 + 10, SH_DECK + 10, x1 - 20, SH_KIEL - 40); ctx.quadraticCurveTo(x1 - 60, SH_KIEL, x1 - 140, SH_KIEL); ctx.lineTo(x0 + 30, SH_KIEL); ctx.quadraticCurveTo(x0, SH_KIEL - 10, x0, SH_KIEL - 50); ctx.closePath();
  paint('#2f4f6f', INK, 2.5);
  ctx.save(); ctx.clip(); ctx.fillStyle = '#9c3a2a'; ctx.fillRect(x0 - 10, SH_WY + 4, SH_SL + 20, 200); ctx.restore();
  line(x0, SH_WY + 4, x1, SH_WY + 4, INK, 1.5);
  ctx.fillStyle = '#e9e9e6'; ctx.fillRect(x0 + 10, SH_DECK + 10, SH_SL - 90, 6);
  // Ladung: fünf Reihen, drei Lagen
  for (let b = 0; b < 5; b++) for (let l = 0; l < 3; l++) shContainer(SH_BAY(b) + SH_CW / 2, SH_DECK - (l + 1) * SH_CH, SH_FARBEN[(b * 3 + l) % SH_FARBEN.length]);
  // Deckshaus vorn mit Brücke, Mast und Sensoren
  box(x1 - 210, SH_DECK - 120, 110, 120, '#e9e9e6', 2, 2);
  for (let i = 0; i < 3; i++) box(x1 - 200 + i * 34, SH_DECK - 110, 26, 16, istDunkel() ? '#ffe7a3' : '#23384d', 1, 1);
  line(x1 - 155, SH_DECK - 120, x1 - 155, SH_DECK - 190, INK, 3);
  box(x1 - 170, SH_DECK - 190, 30, 8, '#8a8f94', 1, 1.2); circle(x1 - 155, SH_DECK - 196, 4, '#d9342b', INK, 1);
  text('RW 105', x0 + 80, SH_DECK + 50, 16, { family: '"IBM Plex Mono", monospace', weight: 500, color: '#e9e9e6' });
}
function shBinnenschiff(x, dir) {
  ctx.save(); ctx.translate(x, SH_WY + 6); ctx.scale(dir, 1);
  const L = 860;
  ctx.beginPath(); ctx.moveTo(-L / 2 + 20, -40); ctx.lineTo(L / 2, -40); ctx.lineTo(L / 2 - 20, 34); ctx.lineTo(-L / 2 + 40, 34); ctx.quadraticCurveTo(-L / 2, 20, -L / 2 + 20, -40); ctx.closePath();
  paint('#3b3d40', INK, 2);
  ctx.fillStyle = '#d9542b'; ctx.fillRect(-L / 2 + 30, -34, L - 50, 6);
  for (let i = 0; i < 3; i++) for (let l = 0; l < 2; l++) shContainer(-L / 2 + 150 + i * 215, -40 - (l + 1) * SH_CH, SH_FARBEN[(i + l * 2 + 3) % SH_FARBEN.length]);
  // Steuerhaus hinten (Fernsteuerung von Land; Kameras und Antenne obendrauf)
  box(L / 2 - 120, -110, 80, 70, '#e9e9e6', 2, 2); box(L / 2 - 110, -98, 60, 18, istDunkel() ? '#ffe7a3' : '#23384d', 1, 1);
  line(L / 2 - 80, -110, L / 2 - 80, -150, INK, 2); circle(L / 2 - 80, -152, 3, '#7fe08a', null);
  ctx.restore();
}
function shHafenbild(g) {
  const ab = istDunkel(), τ = shTau(), u = shU(τ), lift = shLift(g);
  // Wasser hinter allem (vom Kai bis weit nach rechts), Kai als Betonblock
  ctx.fillStyle = ab ? '#1e3550' : '#4f7f9c'; ctx.fillRect(SH_XQ, SH_WY, 4400, SH_BOT - SH_WY);
  ctx.fillStyle = '#6b5a48'; ctx.fillRect(SH_XQ, SH_BOT - 30, 4400, 30);
  ctx.fillStyle = '#9a968c'; ctx.fillRect(SHHX - 20, SH_QY, SH_XQ - SHHX + 20, SH_BOT - SH_QY); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(SHHX - 20, SH_QY, SH_XQ - SHHX + 20, SH_BOT - SH_QY);
  ctx.fillStyle = '#6d6a64'; ctx.fillRect(SHHX - 20, SH_QY, SH_XQ - SHHX + 20, 10);
  for (let x = SHHX; x < SH_XQ; x += 90) { ctx.fillStyle = '#f0b429'; ctx.fillRect(x, SH_QY + 2, 40, 3); }
  // Fender an der Kaikante
  for (const y of [SH_WY - 30, SH_WY + 10]) box(SH_XQ - 4, y, 12, 24, '#2a2723', 3, 1.5);
  // Molenfeuer rechts außen
  withAlpha('molenfeuer', () => {
    const x = SH_FEUER;
    ctx.fillStyle = '#9a968c'; ctx.fillRect(x - 50, SH_WY - 20, 100, SH_BOT - SH_WY + 20);
    for (let i = 0; i < 4; i++) box(x - 14, SH_WY - 20 - (i + 1) * 60, 28, 60, i % 2 ? '#e9e9e6' : '#d9342b', 0, 2);
    box(x - 18, SH_WY - 290, 36, 30, '#23384d', 2, 2); circle(x, SH_WY - 275, 8, ab || g % 40 < 20 ? '#ffe7a3' : '#8a8f94', INK, 1.5);
  });
  // Containerschiff am Liegeplatz
  withAlpha('containerschiff', () => shSchiff());
  // Lager: Stapel und Lagerkran
  withAlpha('lagerkran', () => {
    for (let l = 0; l < 2; l++) shContainer(SH_STK, SH_QY - (l + 1) * SH_CH, SH_FARBEN[(l + 4) % SH_FARBEN.length]);
    const L1 = SHHX + 40, L2 = SHHX + 500, top = SH_QY - 380;
    for (const x of [L1, L2]) { ctx.fillStyle = '#e0a526'; ctx.fillRect(x - 8, top, 16, SH_QY - top); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(x - 8, top, 16, SH_QY - top); box(x - 18, SH_QY - 12, 36, 12, '#3b3d40', 2, 1.2); }
    box(L1 - 20, top - 24, L2 - L1 + 40, 24, '#e0a526', 0, 2);
    box(u.ax - 26, top, 52, 18, '#5d6064', 2, 1.5);
    line(u.ax - 14, top + 18, u.ax - 14, u.ay, INK, 1.5); line(u.ax + 14, top + 18, u.ax + 14, u.ay, INK, 1.5);
    box(u.ax - SH_CW / 2 - 4, u.ay - 8, SH_CW + 8, 8, '#3b3d40', 1, 1.2);
  });
  // Leitstand mit Fernbediener
  withAlpha('fernbediener', () => {
    const x = rx(roomOf('shkai').c) + 40;
    box(x, SH_QY - 120, 130, 120, '#e6e3da', 2, 2); box(x + 10, SH_QY - 106, 110, 40, ab ? '#ffe7a3' : '#9fc4d6', 1, 1.2);
    text('LEITSTAND', x + 65, SH_QY - 50, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
    ctx.save(); ctx.translate(x + 60, SH_QY - 66); ctx.scale(0.25, 0.25); person({ x: 0.001, foot: 0.001, face: 1, shirt: '#3d5a80', sit: true }); ctx.restore();
  });
  // AGV mit oder ohne Container
  withAlpha('shagv', () => {
    const x = u.agv;
    box(x - 130, SH_QY - 24, 260, 18, '#f0b429', 3, 2);
    for (const dx of [-100, -40, 40, 100]) circle(x + dx, SH_QY - 6, 6, '#2a2723', null);
    box(x - 130, SH_QY - 20, 16, 10, '#23384d', 1, 1); box(x + 114, SH_QY - 20, 16, 10, '#23384d', 1, 1);
  });
  // der bewegte Container
  shContainer(u.c.x, u.c.top, '#d9542b');
  // Containerbrücke
  withAlpha('containerbruecke', () => {
    const L1 = SH_XQ - 280, L2 = SH_XQ - 60, beam = SH_QY - 420, boom = SH_QY - 560;
    for (const x of [L1, L2]) { ctx.fillStyle = '#3e6f9e'; ctx.fillRect(x - 10, beam, 20, SH_QY - beam); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(x - 10, beam, 20, SH_QY - beam); box(x - 22, SH_QY - 14, 44, 14, '#3b3d40', 2, 1.2); }
    box(L1 - 12, beam - 20, L2 - L1 + 24, 20, '#3e6f9e', 0, 2);
    line(L1, beam, L1, boom, '#3e6f9e', 10); line(L2, beam, L2, boom, '#3e6f9e', 10);
    line(L1, boom - 140, SH_XQ - 480, boom, INK, 2); line(L2, boom - 140, SH_XQ + 880, boom, INK, 2); line(L1, boom - 140, SH_XQ + 600, boom, INK, 1.5);
    line(L1, boom, L1, boom - 140, '#3e6f9e', 8); line(L2, boom, L2, boom - 140, '#3e6f9e', 8);
    box(SH_XQ - 480, boom, 1360, 22, '#3e6f9e', 0, 2);
    box(SH_XQ - 470, boom - 46, 120, 46, '#e6e3da', 2, 2);
    // Laufkatze, Seile, Spreader
    box(u.sx - 30, boom + 22, 60, 18, '#5d6064', 2, 1.5);
    line(u.sx - 18, boom + 40, u.sx - 18, u.sy, INK, 1.5); line(u.sx + 18, boom + 40, u.sx + 18, u.sy, INK, 1.5);
    box(u.sx - SH_CW / 2 - 4, u.sy - 8, SH_CW + 8, 8, '#3b3d40', 1, 1.2);
    // Möwe auf der Auslegerspitze: fliegt auf, wenn die Katze hinausfährt
    const weg = u.sx > SH_XQ + 200;
    if (!weg) { ctx.beginPath(); ctx.ellipse(SH_XQ + 850, boom - 6, 8, 5, 0, 0, TAU); paint('#f3f1ea', INK, 1); circle(SH_XQ + 857, boom - 10, 3, '#f3f1ea', INK, 1); }
    else { const t = g / 30, mx = SH_XQ + 700 + Math.cos(t) * 120, my = boom - 120 + Math.sin(t) * 30; line(mx - 10, my - 5, mx, my, INK, 2); line(mx, my, mx + 10, my - 5, INK, 2); }
  });
  // Festmacher-Roboter: Saugnapf hält das Heck
  withAlpha('festmacher', () => {
    box(SH_XQ - 60, SH_QY - 30, 50, 30, '#5d6064', 3, 2);
    limb(SH_XQ - 20, SH_QY - 16, SH_SX - 14, SH_QY + 4, 7, '#f0b429');
    box(SH_SX - 16, SH_QY - 14, 14, 40, '#2a2723', 3, 1.5);
  });
  // Unterwasser-Reiniger am Rumpf (vor dem Wasserschleier gezeichnet, damit man ihn erkennt)
  ctx.fillStyle = ab ? 'rgba(20,45,70,0.55)' : 'rgba(70,120,150,0.45)'; ctx.fillRect(SH_XQ, SH_WY, 4400, SH_BOT - SH_WY - 30);
  withAlpha('hullskater', () => {
    const x = shSkater(g), y = SH_WY + 60;
    box(x - 16, y - 8, 32, 16, '#f0b429', 4, 1.5); circle(x - 10, y + 8, 3, '#2a2723', null); circle(x + 10, y + 8, 3, '#2a2723', null);
    glow(x + 18, y, 18, 'rgba(255,240,200,0.6)');
    for (let i = 0; i < 3; i++) circle(x - 24 - i * 8, y - 14 - ((g + i * 7) % 20), 2, 'rgba(230,245,255,0.7)', null);
  });
  // Binnenschiff (fährt vor dem großen Schiff durch das Becken und unter der Hubbrücke durch)
  const bx = shBinX(g), dir = g < 230 ? -1 : 1;
  withAlpha('binnenschiff', () => shBinnenschiff(bx, dir));
  // Wellenlinie
  ctx.strokeStyle = 'rgba(230,245,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = SH_XQ; x < SH_XQ + 4400; x += 40) { ctx.moveTo(x, SH_WY + Math.sin((x + g * 6) / 40) * 2); ctx.lineTo(x + 20, SH_WY + Math.sin((x + 20 + g * 6) / 40) * 2); }
  ctx.stroke();
  // Hubbrücke (von der Seite der Fahrrinne aus gesehen: Straße führt in die Tiefe, die Fahrbahn hebt sich zwischen den Türmen)
  withAlpha('hubbruecke', () => {
    const x = SH_BR, top = SH_QY - 720;
    for (const dx of [-120, 120]) { ctx.fillStyle = '#5d6064'; ctx.fillRect(x + dx - 14, top, 28, SH_BOT - top); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x + dx - 14, top, 28, SH_BOT - top); }
    box(x - 140, top - 30, 280, 30, '#5d6064', 0, 2);
    line(x - 60, top, x - 60, SH_QY - lift - 4, INK, 1.5); line(x + 60, top, x + 60, SH_QY - lift - 4, INK, 1.5);
    box(x - 106, SH_QY - lift - 6, 212, 34, '#8a8f94', 0, 2);
    ctx.fillStyle = '#3b3d40'; ctx.fillRect(x - 100, SH_QY - lift - 6, 200, 8);
    const rot = lift > 0;
    for (const dx of [-120, 120]) circle(x + dx, SH_QY - 40, 6, rot && g % 12 < 6 ? '#d9342b' : '#5d1f1b', INK, 1);
  });
}
registerRunner({ room: 'shliege', draw() {}, robot: { id: 'hullskater', name: 'Rumpfreiniger', bereich: 'Unterwasser', aera: 'seit 2018', typ: 'Roboter, der auf dem Schiffsrumpf fährt', color: '#f0b429',
  fakt: 'Vorbild ist der HullSkater von Jotun und Kongsberg. Er fährt unter Wasser über den Schiffsrumpf und putzt Algen und Muscheln weg, bevor sie festwachsen. Ein sauberer Rumpf braucht weniger Treibstoff. Ein Schiff der Reederei Wallenius Wilhelmsen hat ihn seit 2018 an Bord.',
  echt: 'Echt. Gesteuert wird er von geschulten Fachleuten aus der Ferne, Sensoren und maschinelles Lernen helfen beim Weg über den großen Rumpf.',
  note: 'Fährt am Rumpf unter der Wasserlinie hin und her.', quelle: 'https://marineindustrynews.co.uk/robotic-hull-cleaning-system-could-significantly-reduce-industry-co2/',
  box: () => { const x = shSkater(state.g); return [x - 20, SH_WY + 48, 40, 26]; } } });
registerRunner({ room: 'shkai', draw() {}, robot: { id: 'festmacher', name: 'Festmacher-Roboter', bereich: 'Logistik', aera: 'seit den 2000ern', typ: 'Arm mit Saugnapf', color: '#f0b429',
  fakt: 'Vorbild ist MoorMaster von Cavotec. Statt dicker Taue halten Saugnäpfe das Schiff an der Kaimauer fest. Festmachen und Loslassen dauert nur Sekunden, und niemand muss mehr mit schweren Leinen hantieren.',
  echt: 'Echt. Solche Anlagen gibt es an Container-, Fähr- und Schleusenkais in vielen Ländern.', note: 'Hält das Heck des Schiffs mit einem Saugnapf.',
  quelle: 'https://www.mynewsdesk.com/cavotec/pressreleases/cavotec-secures-order-with-port-of-stockholm-for-first-automated-mooring-system-in-sweden-reducing-co2-emissions-by-up-to-5000-tonnes-per-year-3115511',
  box: () => [SH_XQ - 62, SH_QY - 32, SH_SX - SH_XQ + 50, 60] } });
registerRunner({ room: 'shterminal', draw() {}, robot: { id: 'shagv', name: 'Fahrerloser Containertransporter', bereich: 'Logistik', aera: 'seit 2002', typ: 'AGV mit Akku', color: '#f0b429',
  fakt: 'Im Containerterminal Altenwerder in Hamburg fahren seit 2002 Transporter ohne Fahrer zwischen Containerbrücken und Lager. Sie fahren mit Akku und laden selbst an Ladestationen.',
  echt: 'Echt. In Altenwerder findet jeder seinen Weg allein, gesteuert von einem Leitsystem.', note: 'Bringt den Container vom Kran zum Lagerkran – und in der nächsten Runde zurück.',
  quelle: 'https://hhla.de/en/the-power-of-networks/automation',
  box: () => { const x = shU(shTau()).agv; return [x - 132, SH_QY - 30, 264, 30]; } } });
registerRunner({ room: 'shkai', draw() {}, robot: { id: 'fernbediener', name: 'Leitstand', bereich: 'Mensch', aera: 'Maßstab', typ: 'Fernbedienerin am Bildschirm', color: '#3d5a80',
  fakt: 'Auch im vollautomatischen Terminal arbeiten Menschen: Im Leitstand übernehmen sie, wenn die Technik nicht weiterweiß, zum Beispiel bei der Übergabe an Lkw und Bahn.',
  echt: 'Echt, so ist es auch in Altenwerder.', note: 'Klein gezeichnet, weil der ganze Hafen im Maßstab 1 : 4 ist.',
  box: () => { const x = rx(roomOf('shkai').c) + 40; return [x, SH_QY - 120, 130, 120]; } } });
registerRunner({ room: 'shterminal', draw() {}, robot: { id: 'lagerkran', name: 'Lagerkran', bereich: 'Logistik', aera: 'seit 2002', typ: 'Portalkran auf Schienen', color: '#e0a526',
  fakt: 'In Altenwerder gibt es 26 Lagerblöcke. Über jedem fahren zwei automatische Portalkräne verschiedener Höhe; der kleinere passt unter dem größeren hindurch, so können beide gleichzeitig arbeiten.',
  echt: 'Echt. Hier ist nur einer gezeichnet.', note: 'Stapelt den Container beim Entladen ins Lager und holt ihn beim Beladen wieder heraus.',
  quelle: 'https://hhla.de/en/the-power-of-networks/automation',
  box: () => [SHHX + 30, SH_QY - 404, 480, 404] } });
registerRunner({
  room: 'shkai',
  draw(g) { shHafenbild(g); },
  glow(g) {
    glow(SH_XQ - 170, SH_QY - 580, 50, 'rgba(255,231,163,0.6)'); glow(SH_XQ + 860, SH_QY - 556, 30, 'rgba(255,90,90,0.6)');
    glow(SH_SX + SH_SL - 155, SH_DECK - 196, 26, 'rgba(255,90,90,0.6)'); glow(SH_SX + SH_SL - 155, SH_DECK - 100, 70, 'rgba(255,231,163,0.35)');
    glow(SH_FEUER, SH_WY - 275, 70, 'rgba(255,231,163,0.75)');
    const a = (g % 80) / 80 * TAU; ctx.fillStyle = 'rgba(255,240,190,0.18)'; ctx.beginPath(); ctx.moveTo(SH_FEUER, SH_WY - 275); ctx.arc(SH_FEUER, SH_WY - 275, 520, a - 0.12, a + 0.12); ctx.closePath(); ctx.fill();
  },
  robot: { id: 'containerbruecke', name: 'Containerbrücke', bereich: 'Logistik', aera: 'heute', typ: 'Kran am Kai', color: '#3e6f9e',
    fakt: 'Containerbrücken heben die Container vom Schiff an Land und zurück. Die Laufkatze fährt auf dem langen Ausleger bis über das Schiff. Echte Brücken sind oft über 50 Meter hoch.',
    echt: 'Echt. Eine Runde wird entladen, die nächste beladen. Das Schild am Kai zeigt, was gerade passiert. Die Möwe ist Spaß.',
    note: 'Wenn die Katze hinausfährt, fliegt die Möwe auf der Spitze kurz weg.',
    box: () => [SH_XQ - 480, SH_QY - 600, 1360, 600] },
});
registerRunner({ room: 'shliege', draw() {}, robot: { id: 'containerschiff', name: 'Elektrisches Containerschiff', bereich: 'Mobilität', aera: 'seit 2022', typ: 'Containerschiff mit Akku', color: '#2f4f6f',
  fakt: 'Vorbild ist die Yara Birkeland aus Norwegen: 80 Meter lang, Platz für 120 Standardcontainer, angetrieben von einem 7-Megawattstunden-Akku statt Diesel. Sie soll Schritt für Schritt ohne Besatzung fahren; An- und Ablegen läuft automatisch.',
  echt: 'Echt als Vorbild. Große Containerschiffe sind bis zu 400 Meter lang und passen in keine Welt.', note: 'Liegt am Kai, die Containerbrücke arbeitet an Reihe 2.',
  quelle: 'https://electrek.co/2021/06/08/meet-the-worlds-first-electric-autonomous-container-ship/',
  box: () => [SH_SX, SH_DECK - 200, SH_SL, SH_KIEL - SH_DECK + 200] } });
registerRunner({ room: 'shbecken', draw() {}, robot: { id: 'binnenschiff', name: 'Ferngesteuertes Binnenschiff', bereich: 'Mobilität', aera: 'seit 2022', typ: 'Frachtschiff mit Kapitän an Land', color: '#3b3d40',
  fakt: 'Die Firma Seafar steuert Binnenschiffe aus einem Kontrollzentrum in Antwerpen, das Anfang 2022 eröffnet hat. Eine Kapitänin an Land kann mehrere Schiffe gleichzeitig beobachten und übernimmt selbst, etwa an Schleusen.',
  echt: 'Echt. An Bord ist trotzdem noch eine kleinere Besatzung.', note: 'Ist mit Containern zu hoch für die Brücke – darum hebt sie sich.',
  quelle: 'https://www.businessinantwerp.eu/en/stories/seafar-semi-autonomous-inland-shipping',
  box: () => { const x = shBinX(state.g); return [x - 430, SH_WY - 160, 860, 200]; } } });
registerRunner({ room: 'shbruecke', draw() {}, robot: { id: 'hubbruecke', name: 'Hubbrücke', bereich: 'Mobilität', aera: 'heute', typ: 'Brücke, deren Fahrbahn hochfährt', color: '#8a8f94',
  fakt: 'Bei einer Hubbrücke fährt das ganze Mittelstück zwischen zwei Türmen nach oben, damit hohe Schiffe durchpassen. In Hamburg gibt es mehrere davon, zum Beispiel die Kattwykbrücke.',
  echt: 'Echt als Bauform. Man sieht sie hier von der Seite der Fahrrinne: Die Straße führt in die Tiefe, nur ihr Querschnitt ist zu sehen.', note: 'Rote Ampeln blinken, solange die Fahrbahn oben ist.',
  box: () => [SH_BR - 140, SH_QY - 750, 280, 790] } });
registerRunner({ room: 'shbruecke', draw() {}, robot: { id: 'molenfeuer', name: 'Molenfeuer', bereich: 'Mobilität', aera: 'heute', typ: 'Kleiner Leuchtturm', color: '#d9342b',
  fakt: 'Molenfeuer stehen an der Hafeneinfahrt und zeigen Schiffen nachts den Weg. Heute schalten sie sich automatisch ein, wenn es dunkel wird.',
  echt: 'Echt. Abends dreht sich hier der Lichtstrahl.', note: 'Kein Roboter, aber schon lange automatisch.',
  box: () => [SH_FEUER - 50, SH_WY - 300, 100, 300] } });

// Felder: leer (der Läufer zeichnet alles), Schild am Kai mit Entladen/Beladen
for (const [key, name] of [['shterminal', 'Seehafen: Containerlager'], ['shliege', 'Seehafen: Liegeplatz'], ['shbecken', 'Seehafen: Becken'], ['shbruecke', 'Seehafen: Hubbrücke']])
  registerRoom({ key, name, level: 'Außengelände', hitOrder: [], robots: [], draw() {} });
registerRoom({ key: 'shkai', name: 'Seehafen: Kai', level: 'Außengelände', hitOrder: [], robots: [], draw() {
  box(20, 200, 170, 34, '#23384d', 2, 2);
  text(shEntladen() ? 'SCHIFF WIRD ENTLADEN' : 'SCHIFF WIRD BELADEN', 105, 222, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f0b429' });
  line(105, 234, 105, 264, '#5d6064', 3);
} });
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  hullskater: 'Dieser kleine Roboter fährt unter Wasser über den Schiffsbauch und putzt Algen weg.',
  festmacher: 'Statt mit dicken Seilen hält dieser Roboter das Schiff mit einem riesigen Saugnapf fest.',
  shagv: 'Dieser Transporter fährt ohne Fahrer und bringt Container vom Kran ins Lager.',
  fernbediener: 'Im Leitstand passen Menschen auf, dass alles klappt, und helfen, wenn ein Roboter nicht weiterweiß.',
  lagerkran: 'Dieser Kran stapelt die Container im Lager übereinander, ganz ohne Kranführer in der Kabine.',
  containerbruecke: 'Mit diesem riesigen Kran werden Container vom Schiff an Land gehoben.',
  containerschiff: 'Dieses Schiff fährt mit einem riesigen Akku, so wie ein Elektroauto.',
  binnenschiff: 'Dieses Schiff wird von einer Kapitänin an Land gesteuert, die auf Bildschirme schaut.',
  hubbruecke: 'Bei dieser Brücke fährt die Straße wie ein Fahrstuhl nach oben, damit das Schiff durchpasst.',
  molenfeuer: 'Der kleine Leuchtturm zeigt den Schiffen nachts, wo die Hafeneinfahrt ist.',
}));
