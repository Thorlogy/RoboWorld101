/* Zweites Gebäude: Schule 102 (rechts neben dem Schulweg). Vier Räume in einer Datei, Hilfsnamen mit Präfix c2.
   Die Schulklasse vom Schulweg geht in die Eingangshalle. */
const c2X = key => rx(roomOf(key).c), c2Y = key => ry(roomOf(key).r);
function c2Desk(x, w) { box(x, 300, w, 8, '#a8763f', 1, 1.5); line(x + 6, 308, x + 6, 360, INK, 2); line(x + w - 6, 308, x + w - 6, 360, INK, 2); }
function c2Chair(x) { box(x - 12, 318, 24, 5, '#3e6f9e', 1, 1.2); line(x - 10, 323, x - 10, 360, INK, 2); line(x + 10, 323, x + 10, 360, INK, 2); box(x - 14 + 0, 280, 5, 40, '#3e6f9e', 1, 1.2); }
function c2Wall(color) { ctx.fillStyle = color; ctx.fillRect(0, 0, RW, RH); ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8); ctx.fillStyle = '#b9a58a'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2); }
function c2Title(t, x = 440) { text(t, x, 70, 36, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' }); }
// Ausstattung, damit die Räume nach Schule aussehen
function c2Window(x, y, w, h) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#bcd6e2'); sky.addColorStop(1, '#e4eee6');
  ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#7fae64'; ctx.fillRect(x, y + h * 0.72, w, h * 0.28);
  circle(x + w * 0.7, y + h * 0.62, h * 0.18, '#5f9a4a', null);
  ctx.strokeStyle = '#f3f1ea'; ctx.lineWidth = 6; ctx.strokeRect(x, y, w, h); line(x + w / 2, y, x + w / 2, y + h, '#f3f1ea', 4);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
  box(x - 8, y + h + 2, w + 16, 6, '#d6d2c8', 1, 1.2);
}
function c2Art(x, y, kind, c) {
  ctx.save(); ctx.translate(x, y); ctx.rotate((kind % 3 - 1) * 0.05);
  box(-18, -14, 36, 28, '#fbfaf6', 1, 1); box(-4, -17, 8, 5, 'rgba(240,180,41,0.7)', 0, 0);
  if (kind === 0) { circle(-6, -2, 6, c, null); for (let i = 0; i < 6; i++) { const a = i * 1.05; line(-6 + Math.cos(a) * 8, -2 + Math.sin(a) * 8, -6 + Math.cos(a) * 11, -2 + Math.sin(a) * 11, c, 1.2); } line(-16, 10, 16, 10, '#5f9a4a', 2); }
  else if (kind === 1) { box(-8, -6, 16, 14, c, 2, 1); box(-5, -12, 10, 6, c, 2, 1); circle(-2, -9, 1.2, INK, null); circle(2, -9, 1.2, INK, null); line(-8, 0, -13, 6, INK, 1.2); line(8, 0, 13, 6, INK, 1.2); }
  else { ctx.beginPath(); ctx.moveTo(-12, 10); ctx.lineTo(-12, -2); ctx.lineTo(0, -10); ctx.lineTo(12, -2); ctx.lineTo(12, 10); ctx.closePath(); paint(c, INK, 1); box(-3, 2, 6, 8, '#a8763f', 0, 0.8); }
  ctx.restore();
}
function c2Plant(x, y) { box(x - 10, y - 18, 20, 18, '#c96f4a', 2, 1.2); for (const [dx, h] of [[-8, 22], [0, 30], [8, 20], [-3, 26], [5, 24]]) { ctx.beginPath(); ctx.ellipse(x + dx, y - 18 - h / 2, 4, h / 2, dx * 0.04, 0, TAU); paint('#5f9a4a', INK, 1); } }
function c2Clock(x, y) { circle(x, y, 14, '#fbfaf6', INK, 1.5); const m = (state.g % 480) / 480; line(x, y, x + Math.sin(m * TAU) * 10, y - Math.cos(m * TAU) * 10, INK, 1.5); line(x, y, x + 5, y + 3, INK, 2); }


/* ---------- Eingangshalle: Reinigungsroboter wischt die Spur der Klasse weg (globale Uhr, Schutzfeld) ---------- */
const C2_STEPS = Array.from({ length: 12 }, (_, i) => ({ x: 40 + i * 34, y: 368 + (i % 2) * 8, lay: 400 + i * 3 }));
const c2ScrubX = hg => (hg < 40 ? 70 : hg < 220 ? lerp(70, 520, seg(hg, 40, 220)) : hg < 320 ? lerp(520, 70, ease(seg(hg, 220, 320))) : 70);
function c2StepVisible(s, hg) {
  const clean = 40 + 180 * clamp((s.x - 70 + 20) / 450, 0, 1);
  return hg >= s.lay || hg < clean;
}
/* ---------- Roboter-Regal in der 4b und Pepper in der Halle ---------- */
function c2Nao(x, foot, f) {
  // NAO, 58 cm: weiß-grau, runder Kopf mit Augenring; winkt in Bild 10–26
  const wave = f >= 10 && f < 26 ? Math.sin((f - 10) * 1.2) * 0.4 : 0;
  humanoid(x, foot, { s: 0.36, color: '#f3f1ea', armR: f >= 10 && f < 26 ? 2.7 + wave : 0.1, armL: -0.1 });
  circle(x, foot - 36, 7, '#f3f1ea', INK, 1.2);
  circle(x - 2.5, foot - 37, 1.6, '#3e9fd6', null); circle(x + 2.5, foot - 37, 1.6, '#3e9fd6', null);
  circle(x, foot - 26, 1.4, '#3e9fd6', null);
}
function c2Brick(x, y, f) {
  // Baustein-Roboter: Rechenstein mit 5x5-Lichtfeld, zwei Räder, Balken
  const dx = Math.sin(TAU * f / 60) * 3;
  ctx.save(); ctx.translate(dx, 0);
  line(x - 13, y - 6, x + 13, y - 6, '#8a8f94', 3);
  box(x - 9, y - 22, 18, 14, '#f3e3a0', 2, 1.2);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { ctx.fillStyle = (i + j + Math.floor(f / 10)) % 3 ? '#fbfaf6' : '#f0b429'; ctx.fillRect(x - 5 + i * 3.5, y - 19 + j * 3.5, 2.5, 2.5); }
  circle(x - 9, y - 4, 4.5, '#2d2f33', INK, 1); circle(x + 9, y - 4, 4.5, '#2d2f33', INK, 1);
  circle(x - 9, y - 4, 1.5, '#e6e3da', null); circle(x + 9, y - 4, 1.5, '#e6e3da', null);
  ctx.restore();
}
function c2Fischer(x, y, f) {
  // Baukasten-Greifarm: graue Grundplatte, rote Bausteine, schwenkt langsam
  box(x - 13, y - 5, 26, 5, '#8a8f94', 1, 1);
  box(x - 4, y - 18, 8, 13, '#d9342b', 1, 1);
  const a = -0.9 + 0.5 * Math.sin(TAU * f / 60);
  const e = { x: x + Math.cos(a) * 14, y: y - 18 + Math.sin(a) * 14 };
  line(x, y - 18, e.x, e.y, '#5d6064', 3); line(e.x, e.y, e.x + 4, e.y + 6, '#d9342b', 2.5); line(e.x, e.y, e.x - 2, e.y + 7, '#d9342b', 2.5);
  circle(x, y - 18, 2, '#3e6f9e', null);
}
function c2Shelf(f) {
  box(582, 172, 54, 188, '#c79a63', 1, 1.5);
  for (const y of [232, 292]) box(582, y, 54, 5, '#a8763f', 0, 1.2);
  withAlpha('nao', () => c2Nao(609, 232, f));
  withAlpha('bausteinbot', () => c2Brick(609, 292, f));
  withAlpha('fischertechnik', () => c2Fischer(609, 358, f));
}
function c2Pepper(x, f) {
  // Pepper, 1,20 m: Rollsockel statt Beine, Tablet auf der Brust; begrüßt und winkt
  const head = Math.sin(TAU * f / 60) * 2;
  ctx.beginPath(); ctx.moveTo(x - 20, 360); ctx.lineTo(x - 12, 320); ctx.lineTo(x + 12, 320); ctx.lineTo(x + 20, 360); ctx.closePath(); paint('#f3f1ea', INK, 1.5);
  box(x - 16, 280, 32, 42, '#f3f1ea', 8, 1.5);
  box(x - 10, 290, 20, 15, '#23384d', 2, 1.2);
  text(f < 30 ? 'Hallo!' : 'Hilfe?', x, 300, 6, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' });
  limb(x - 16, 286, x - 22, 318, 5, '#f3f1ea');
  const u = seg(f, 0, 4) - seg(f, 14, 18), w = Math.sin(f * 1.3) * 5 * u;
  const el = mix({ x: x + 20, y: 302 }, { x: x + 26, y: 266 }, u), hd = mix({ x: x + 22, y: 318 }, { x: x + 30 + w, y: 250 }, u);
  limb(x + 16, 286, el.x, el.y, 5, '#f3f1ea'); limb(el.x, el.y, hd.x, hd.y, 4, '#f3f1ea');
  circle(x + head, 266, 13, '#f3f1ea', INK, 1.5);
  circle(x - 5 + head, 265, 3.4, '#2a2723', null); circle(x + 5 + head, 265, 3.4, '#2a2723', null);
  circle(x - 5 + head, 265, 1.4, '#7fd3ff', null); circle(x + 5 + head, 265, 1.4, '#7fd3ff', null);
}
function drawHalle2(f) {
  const hg = heldG('schrubber', state.g);
  c2Wall('#ece4d6');
  // Eingangstür links, Garderobe, Schild
  ctx.fillStyle = '#3b3d40'; ctx.fillRect(0, 250, 22, 110);
  for (let i = 0; i < 7; i++) { const x = 120 + i * 40; line(x, 200, x, 214, INK, 2); circle(x, 216, 3, '#8a8f94', INK, 1); }
  [[160, '#d9542b'], [240, '#3e6f9e'], [320, '#f0b429']].forEach(([x, c]) => { ctx.beginPath(); ctx.moveTo(x - 10, 218); ctx.lineTo(x + 10, 218); ctx.lineTo(x + 14, 262); ctx.lineTo(x - 14, 262); ctx.closePath(); paint(c, INK, 1.2); });
  box(380, 110, 200, 54, '#f3f1ea', 3, 1.5); text('Willkommen', 480, 136, 20, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center' }); text('Schule 102', 480, 156, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#5d5a55' });
  c2Title('HALLE', 470);
  // Plakat: Fühlen – Denken – Handeln
  withAlpha('grundidee', () => {
    const M = { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' }, S = { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center' };
    box(108, 84, 256, 108, '#fbfaf6', 2, 1.5);
    for (const [x, y] of [[112, 84], [356, 84]]) { ctx.fillStyle = 'rgba(240,180,41,0.6)'; ctx.fillRect(x - 6, y - 5, 14, 9); }
    text('So arbeitet jeder Roboter', 236, 100, 11, M);
    const lit = Math.floor(f / 20);
    [['FÜHLEN', '#3e6f9e', 'Sensoren'], ['DENKEN', '#f0b429', 'Rechner'], ['HANDELN', '#5f9a4a', 'Motoren']].forEach(([t, c], i) => {
      const x = 152 + i * 84;
      box(x - 34, 108, 68, 66, i === lit ? c : '#ece4d6', 3, 1.2);
      if (i === 0) { ctx.beginPath(); ctx.ellipse(x, 132, 16, 9, 0, 0, TAU); paint('#f3f1ea', INK, 1.2); circle(x, 132, 5, '#23384d', null); }
      if (i === 1) { box(x - 12, 120, 24, 24, '#3b3d40', 2, 1); for (let k = 0; k < 3; k++) { line(x - 8 + k * 8, 116, x - 8 + k * 8, 120, INK, 1.5); line(x - 8 + k * 8, 144, x - 8 + k * 8, 148, INK, 1.5); } }
      if (i === 2) { circle(x - 6, 140, 8, '#3b3d40', INK, 1); line(x - 6, 140, x + 6 + 4 * Math.sin(f * TAU / 20), 122, INK, 3); circle(x + 6 + 4 * Math.sin(f * TAU / 20), 122, 3, '#d9542b', INK, 1); }
      text(t, x, 162, 12, S);
      if (i < 2) { line(x + 36, 141, x + 48, 141, INK, 2); ctx.beginPath(); ctx.moveTo(x + 50, 141); ctx.lineTo(x + 44, 137); ctx.lineTo(x + 44, 145); ctx.closePath(); paint(INK, null); }
    });
    text('Sensoren  ·  Rechner  ·  Motoren', 236, 186, 9, M);
  });
  // Uhr, Bilderwand „Unsere Roboter“, Pflanze, Schließfächer
  c2Clock(60, 150);
  text('Unsere Roboter', 470, 196, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  [[400, 1, '#d9542b'], [446, 1, '#3e6f9e'], [492, 1, '#5f9a4a'], [538, 1, '#f0b429']].forEach(([x, k, c], i) => c2Art(x, 226 + (i % 2) * 6, k, c));
  box(574, 208, 62, 150, '#7aa7d9', 2, 1.5); line(605, 208, 605, 358, INK, 1.5);
  for (const x of [586, 617]) { line(x, 222, x + 10, 222, INK, 1); line(x, 228, x + 10, 228, INK, 1); circle(x + 18, 290, 2, '#3b3d40', null); }
  box(326, 300, 52, 6, '#a8763f', 1, 1.2); c2Plant(352, 300);
  // Schlammspuren der Klasse
  for (const s of C2_STEPS) if (c2StepVisible(s, hg)) { ctx.beginPath(); ctx.ellipse(s.x, s.y, 7, 3, 0, 0, TAU); ctx.fillStyle = 'rgba(110,82,52,0.55)'; ctx.fill(); }
  // Ladestation
  box(30, 330, 20, 30, '#3b3d40', 2, 1.2);
  withAlpha('pepper', () => c2Pepper(470, f));
  withAlpha('schrubber', () => {
    const x = c2ScrubX(hg), work = hg >= 40 && hg < 220;
    if (work) { ctx.fillStyle = 'rgba(127,211,255,0.25)'; ctx.fillRect(70, 362, x - 70, 14); }
    box(x - 34, 316, 68, 40, '#e6e3da', 8);
    box(x - 30, 326, 26, 12, '#23384d', 2, 1); circle(x + 20, 326, 3, work ? '#7fe08a' : '#ffb347', null);
    box(x - 4, 304, 10, 12, '#3b3d40', 2, 1); circle(x + 1, 302, 4, '#3b3d40', INK, 1);
    for (const dx of [-22, 22]) circle(x + dx, 358, 6, '#2d2f33');
    box(x + 30, 352, 10, 8, '#7aa7d9', 2, 1);
    if (work) for (let i = 0; i < 4; i++) circle(x + 38 + rnd(hg + i) * 6, 360 + rnd(hg + i + 2) * 6, 1.5, '#7fd3ff', null);
  });
}

/* ---------- Robotik-AG: Linienfolger auf dem Wettbewerbsfeld, sucht an der Lücke (Bild 24–36) ---------- */
const C2_F = { tl: { x: 130, y: 240 }, tr: { x: 520, y: 240 }, br: { x: 590, y: 336 }, bl: { x: 60, y: 336 } };
const c2Map = (u, v) => { const a = { x: lerp(C2_F.tl.x, C2_F.tr.x, u), y: lerp(C2_F.tl.y, C2_F.tr.y, u) }, b = { x: lerp(C2_F.bl.x, C2_F.br.x, u), y: lerp(C2_F.bl.y, C2_F.br.y, u) }; return { x: lerp(a.x, b.x, v), y: lerp(a.y, b.y, v) }; };
const C2_PATH = [[0.08, 0.8], [0.3, 0.8], [0.42, 0.3], [0.55, 0.3], [0.68, 0.7], [0.9, 0.7], [0.92, 0.25]];
function c2PathPt(t) {
  const n = C2_PATH.length - 1, k = clamp(t, 0, 1) * n, i = Math.min(n - 1, Math.floor(k)), r = k - i;
  return [lerp(C2_PATH[i][0], C2_PATH[i + 1][0], r), lerp(C2_PATH[i][1], C2_PATH[i + 1][1], r)];
}
function c2Bot(f) {
  if (f < 24) return { t: lerp(0, 0.5, seg(f, 0, 24)), search: 0 };
  if (f < 36) return { t: 0.5, search: Math.sin(TAU * seg(f, 24, 36) * 1.5) };
  if (f < 54) return { t: lerp(0.5, 1, seg(f, 36, 54)), search: 0 };
  return { t: lerp(1, 0, ease(seg(f, 54, 60))), search: 0, carry: true };
}
function drawRobotik(f) {
  c2Wall('#e3e8ea');
  c2Title('ROBOTIK-AG', 380);
  box(40, 90, 150, 90, '#f3f1ea', 2, 1.5); text('RoboCup Junior', 115, 118, 16, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center' }); text('Training', 115, 140, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#5d5a55' });
  // Regal mit Bauteilen, Pokal, Kiste mit den Ersatzrädern von der Paketdrohne, 3D-Drucker
  box(420, 96, 200, 6, '#8e6233', 0, 1.2); box(420, 160, 200, 6, '#8e6233', 0, 1.2);
  [['Räder', '#d9542b'], ['Sensoren', '#3e6f9e'], ['Motoren', '#5f9a4a']].forEach(([t, c], i) => { box(426 + i * 66, 128, 58, 32, c, 2, 1.2); box(432 + i * 66, 136, 46, 12, '#fbfaf6', 1, 0.8); text(t, 455 + i * 66, 146, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' }); });
  ctx.beginPath(); ctx.moveTo(440, 96); ctx.lineTo(446, 74); ctx.lineTo(462, 74); ctx.lineTo(468, 96); ctx.closePath(); paint('#f0b429', INK, 1.2); circle(454, 70, 9, '#f0b429', INK, 1.2); text('2.', 454, 90, 9, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center' });
  box(520, 72, 60, 24, '#c9a46a', 1, 1.2); text('Ersatzräder', 550, 88, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  withAlpha('schuldrucker', () => {
    box(230, 100, 110, 110, '#3b3d40', 4, 1.8); ctx.fillStyle = 'rgba(159,196,214,0.5)'; ctx.fillRect(238, 110, 94, 84);
    line(240, 128, 330, 128, '#8a8f94', 3);
    const nx = 260 + 50 * (0.5 - 0.5 * Math.cos(TAU * f / 20));
    box(nx - 8, 128, 16, 14, '#d9542b', 2, 1); line(nx, 142, nx, 150, INK, 2);
    box(270, 184, 50, 8, '#8a8f94', 0, 1); ctx.beginPath(); ctx.ellipse(295, 178, 18, 6, 0, 0, TAU); paint('#f0b429', INK, 1); box(277, 172, 36, 6, '#f0b429', 0, 1);
    box(244, 196, 24, 8, '#23384d', 1, 1); text('42%', 256, 203, 6, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
  });
  // Wettbewerbsfeld schräg von oben
  ctx.beginPath(); ctx.moveTo(C2_F.tl.x, C2_F.tl.y); ctx.lineTo(C2_F.tr.x, C2_F.tr.y); ctx.lineTo(C2_F.br.x, C2_F.br.y); ctx.lineTo(C2_F.bl.x, C2_F.bl.y); ctx.closePath(); paint('#fbfbf8', INK, 2);
  box(56, 336, 538, 10, '#a8763f', 1, 1.5); for (const x of [70, 580]) line(x, 346, x, 360, INK, 3);
  ctx.strokeStyle = '#2a2723'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 60; i++) { const t0 = i / 60, t1 = (i + 1) / 60; if (t0 >= 0.47 && t0 < 0.53) continue; const a = c2Map(...c2PathPt(t0)), b = c2Map(...c2PathPt(t1)); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  // Rettungszone mit Kugeln
  const z = c2Map(0.9, 0.25); ctx.fillStyle = 'rgba(42,39,35,0.12)'; ctx.fillRect(z.x - 30, z.y - 12, 60, 24);
  circle(z.x - 14, z.y, 4, '#c9cdd1', INK, 1); circle(z.x + 6, z.y + 4, 4, '#2a2723', INK, 1);
  withAlpha('robocup', () => {
    const b = c2Bot(f), [u, v] = c2PathPt(b.t), p = c2Map(u, v);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(b.search * 0.5);
    box(-12, -10, 24, 16, '#3e6f9e', 3, 1.5); box(-8, -16, 16, 6, '#f0b429', 1, 1); circle(-10, 6, 3, '#2d2f33'); circle(10, 6, 3, '#2d2f33');
    ctx.restore();
    if (b.search) text('Linie?', p.x, p.y - 26, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#d9542b' });
  });
  withAlpha('ag', () => {
    person({ x: 600, s: 0.72, face: -1, shirt: '#5f9a4a', pants: '#2f4866', hair: '#3a2c22', hand: { x: 580, y: f >= 24 && f < 36 ? 290 : 310 } });
    person({ x: 24, s: 0.7, face: 1, shirt: '#d9542b', pants: '#3b3d40', hair: '#e0b860', hand: { x: 44, y: 306 } });
    box(30, 292, 26, 16, '#3b3d40', 2, 1); box(32, 294, 22, 12, '#7fd3ff', 1, 1);
  });
}

/* ---------- Klassenzimmer: Avatar-Roboter für ein krankes Kind meldet sich (Bild 18–34), Lehrerin nimmt es dran (34–52) ---------- */
// Bodenroboter in Bienenform fährt auf der Matte drei Felder vor, dreht und kommt zurück
const c2Bee = f => { const t = f % 60; if (t < 30) return { x: 392 + 32 * Math.min(3, Math.floor(t / 8) + seg(t % 8, 0, 6)), turn: 0 }; if (t < 36) return { x: 488, turn: seg(t, 30, 36) }; return { x: 488 - 32 * Math.min(3, Math.floor((t - 36) / 7) + seg((t - 36) % 7, 0, 5)), turn: 1 }; };
function drawKlasse2(f) {
  c2Wall('#eef0e6');
  c2Title('KLASSE 4B', 40);
  c2Window(40, 100, 120, 110);
  c2Clock(200, 40);
  // Whiteboard mit Stiftablage, die Lehrerin schreibt mit blauem Stift
  box(226, 56, 300, 150, '#fbfbf8', 3, 2); ctx.strokeStyle = '#b9bcc0'; ctx.lineWidth = 4; ctx.strokeRect(228, 58, 296, 146);
  box(250, 206, 250, 6, '#b9bcc0', 1, 1.2); for (const [x, c] of [[280, '#3e6f9e'], [300, '#d94a4a'], [320, '#5f9a4a']]) box(x, 202, 14, 5, c, 2, 0.8);
  text('Einmaleins', 250, 84, 14, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#d94a4a' });
  text('3 · 7 = ?', 376, 150, 38, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#2f5a9e' });
  const call = f >= 34 && f < 52, flash = f >= 18 && f < 34 && f % 4 < 2;
  if (f >= 44 && f < 52) text('21', 470, 150, 30, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#5f9a4a' });
  // Kinderbilder an der Wand
  [[574, 80, 0, '#f0b429'], [612, 86, 2, '#d9542b'], [592, 122, 1, '#3e6f9e']].forEach(([x, y, k, c]) => c2Art(x, y, k, c));
  c2Shelf(f);
  withAlpha('lehrerin2', () => person({ x: 552, face: -1, shirt: '#7b4b8e', pants: '#3b3d40', hair: '#8a5a2b', hand: call ? { x: 528, y: 262 } : { x: 528 + (f % 8 < 4 ? 0 : 3), y: 196 } }));
  // Tischreihe
  c2Desk(40, 140); c2Desk(220, 140);
  c2Chair(70); c2Chair(150); c2Chair(250);
  box(110, 330, 22, 26, '#d9542b', 5, 1.2); box(270, 330, 22, 26, '#3e6f9e', 5, 1.2);
  withAlpha('kinder2', () => {
    person({ x: 70, sit: true, foot: 360, s: 0.74, face: 1, shirt: '#3d7f8f', pants: '#2f4866', hair: '#2a1f18', hand: { x: 96, y: 300 } });
    person({ x: 250, sit: true, foot: 360, s: 0.72, face: 1, shirt: '#f0b429', pants: '#5d5a55', hair: '#7a4a2a', hand: call ? { x: 226, y: 290 } : { x: 276, y: 298 } });
  });
  withAlpha('av1', () => {
    const x = 160;
    ctx.beginPath(); ctx.moveTo(x - 12, 300); ctx.lineTo(x - 8, 270); ctx.lineTo(x + 8, 270); ctx.lineTo(x + 12, 300); ctx.closePath(); paint('#f3f1ea', INK, 1.5);
    const turn = call ? 1 : 0;
    ctx.beginPath(); ctx.ellipse(x, 258, 15, 13, 0, 0, TAU); paint(flash ? '#7fe08a' : '#f3f1ea', INK, 1.5);
    box(x - 10 + turn * 3, 252, 20, 10, '#23384d', 4, 1); circle(x - 4 + turn * 3, 257, 1.8, '#7fd3ff', null); circle(x + 4 + turn * 3, 257, 1.8, '#7fd3ff', null);
    if (call) text('21!', x, 236, 14, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#3e6f9e' });
  });
  // Matte mit Bodenroboter vorne im Raum
  ctx.fillStyle = '#e8e2c8'; ctx.fillRect(376, 362, 140, 14); for (let i = 0; i <= 4; i++) line(380 + i * 32, 362, 380 + i * 32, 376, 'rgba(42,39,35,0.3)', 1);
  withAlpha('beebot', () => {
    const b = c2Bee(f), dir = b.turn < 0.5 ? 1 : -1;
    ctx.save(); ctx.translate(b.x, 364); ctx.scale(dir, 1);
    ctx.beginPath(); ctx.ellipse(0, -6, 14, 9, 0, 0, TAU); paint('#f0b429', INK, 1.5);
    for (const dx of [-5, 3]) { ctx.fillStyle = INK; ctx.fillRect(dx, -14, 3, 16); }
    circle(10, -10, 4, '#fbfaf6', INK, 1); circle(11, -10, 1.5, INK, null);
    ctx.restore();
  });
}

/* ---------- Informatikraum: Würfel-Programm auf dem Calliope mini, Schütteln ergibt jedes Mal eine 6 (Bild 30–50) ---------- */
const C2_DICE = [[1, 0, 0, 0, 0, 0], [0, 1, 0, 0, 1, 0], [1, 1, 1, 1, 1, 1]];
function c2Star(x, y, n, ledOn) {
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 9 : 20; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); paint('#d9542b', INK, 1.2);
  const dots = { 1: [[2, 2]], 2: [[0, 0], [4, 4]], 3: [[0, 0], [2, 2], [4, 4]], 4: [[0, 0], [0, 4], [4, 0], [4, 4]], 5: [[0, 0], [0, 4], [4, 0], [4, 4], [2, 2]], 6: [[0, 0], [0, 2], [0, 4], [4, 0], [4, 2], [4, 4]] }[n] || [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { const on = ledOn && dots.some(([a, b]) => a === r && b === c); ctx.fillStyle = on ? '#ffe9a8' : '#7a2a14'; ctx.fillRect(x - 6 + c * 2.6, y - 6 + r * 2.6, 1.8, 1.8); }
}
// CodeON auf der Leinwand: Blöcke für den Würfel, mit Fehler „von 6 bis 6“
function c2Block(x, y, w, c, t, bug) {
  box(x, y, w, 22, c, 4, 1.2); box(x + 10, y + 20, 14, 5, c, 1, 0);
  text(t, x + 8, y + 15, 11, { family: '"IBM Plex Mono", monospace', weight: 500, color: '#ffffff' });
  if (bug) { box(x + w - 46, y + 3, 18, 16, '#fbfaf6', 3, 1); text('6', x + w - 37, y + 15, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#d94a4a' }); box(x + w - 24, y + 3, 18, 16, '#fbfaf6', 3, 1); text('6', x + w - 15, y + 15, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#2a2723' }); }
}
function drawInfo(f) {
  c2Wall('#e6eaf0');
  c2Title('INFORMATIK', 40);
  c2Clock(110, 116);
  c2Window(46, 150, 130, 100);
  ctx.save(); ctx.translate(50, 0);
  // Beamer an der Decke und Leinwand mit CodeON
  box(360, 8, 50, 16, '#d6d9dc', 3, 1.2); ctx.fillStyle = 'rgba(255,250,220,0.10)'; ctx.beginPath(); ctx.moveTo(380, 24); ctx.lineTo(390, 24); ctx.lineTo(560, 52); ctx.lineTo(190, 52); ctx.closePath(); ctx.fill();
  line(180, 46, 570, 46, INK, 3);
  withAlpha('codeon', () => {
    box(186, 52, 380, 168, '#fbfbf8', 2, 1.5);
    box(186, 52, 380, 22, '#23384d', 2, 1.2);
    text('CodeON', 200, 68, 14, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#ffffff' });
    text('Calliope mini', 548, 68, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'right', color: '#9fc4d6' });
    // Palette links
    ctx.fillStyle = '#eef1f2'; ctx.fillRect(188, 74, 70, 144);
    ['#f0b429', '#3e6f9e', '#5f9a4a', '#7b4b8e', '#d9542b'].forEach((c, i) => { box(194, 82 + i * 26, 58, 18, c, 3, 1); });
    // Programm
    c2Block(276, 88, 160, '#e09a2a', 'wenn geschüttelt');
    c2Block(290, 118, 150, '#3e6f9e', 'zeige Zahl');
    c2Block(304, 148, 240, '#5f9a4a', 'zufällig von    bis', true);
    if (f >= 44 && f < 60) { ctx.strokeStyle = '#d94a4a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(495, 159, 16, 14, 0, 0, TAU); ctx.stroke(); }
    box(500, 190, 56, 20, '#5f9a4a', 3, 1); text('▶ Laden', 528, 204, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#ffffff' });
  });
  ctx.restore();
  c2Plant(40, 300); box(20, 300, 60, 8, '#a8763f', 1, 1.2);
  c2Desk(80, 200); c2Desk(370, 220);
  // Laptops mit kleinen Blöcken
  for (const x of [130, 220, 410, 500]) { box(x - 18, 270, 36, 26, '#3b3d40', 2, 1.2); ctx.fillStyle = '#fbfbf8'; ctx.fillRect(x - 15, 273, 30, 20); for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#e09a2a', '#3e6f9e', '#5f9a4a'][i]; ctx.fillRect(x - 12 + i * 2, 276 + i * 6, 16, 4); } box(x - 22, 296, 44, 4, '#5d6064', 1, 1); }
  c2Chair(160); c2Chair(470);
  const shake = f >= 30 && f < 50, dx = shake ? Math.sin(TAU * f / 3) * 6 : 0;
  withAlpha('informatik', () => {
    person({ x: 160, sit: true, foot: 360, s: 0.73, face: 1, shirt: '#5f9a4a', pants: '#2f4866', hair: '#3a2c22', hand: { x: 196 + dx, y: shake ? 252 : 292 } });
    person({ x: 470, sit: true, foot: 360, s: 0.71, face: -1, shirt: '#3e6f9e', pants: '#3b3d40', hair: '#d6d2c8', hand: f >= 44 ? { x: 452, y: 250 } : { x: 446, y: 292 } });
  });
  withAlpha('calliope', () => {
    const n = shake ? 6 : f < 30 ? 1 + (Math.floor(f / 6) % 5) : 6;
    c2Star(204 + dx, shake ? 246 : 280, n, true);
    c2Star(440, 286, 3, true);
    if (f >= 44 && f < 58) text('Schon wieder 6?', 230, 238, 13, { family: '"IBM Plex Mono", monospace', weight: 500, color: '#d94a4a' });
  });
}

const C2Q = 'https://en.wikipedia.org/wiki/';
registerRoom({
  key: 'halle2', name: 'Schule: Eingangshalle', level: 'Schule EG',
  hitOrder: ['schrubber', 'pepper', 'grundidee'],
  robots: [
    { id: 'grundidee', name: 'Plakat: Fühlen, Denken, Handeln', bereich: 'Wissen', aera: 'Grundidee', typ: 'Wie ein Roboter funktioniert',
      fakt: 'Jeder Roboter in dieser Welt macht dieselben drei Dinge immer wieder. Fühlen: Sensoren wie Kameras, Lidar oder Tastschalter messen, was um ihn herum los ist. Denken: Ein Rechner entscheidet, was als Nächstes passieren soll. Handeln: Motoren drehen Räder, bewegen Arme oder Greifer. Dann beginnt alles von vorn, oft viele Male pro Sekunde.',
      echt: 'So erklären es auch Lehrbücher. Ein Toaster misst und schaltet zwar auch, aber erst wenn ein Gerät sich selbst in der Welt bewegt oder etwas greift, nennt man es meist Roboter. Probier es aus: Bei jedem Roboter hier kannst du suchen, wo seine Sensoren sitzen.',
      note: 'Das farbige Feld wandert: erst fühlen, dann denken, dann handeln.', color: '#3e6f9e',
      quelle: 'https://en.wikipedia.org/wiki/Robotic_paradigm',
      box: () => [c2X('halle2') + 104, c2Y('halle2') + 78, 264, 116] },
    { id: 'pepper', name: 'Pepper', bereich: 'Bildung', aera: '2014 bis 2021 gebaut', typ: 'Empfangsroboter mit Tablet',
      fakt: 'Derselbe Robotertyp wie am Empfang im Erdgeschoss, hier aber im Unterricht: Schülerinnen und Schüler programmieren ihm am Laptop Begrüßungen, Gesten und kleine Quizfragen. So sieht man sofort, ob das eigene Programm funktioniert.',
      echt: 'Echt, aber Gespräche versteht Pepper nur in einfachen Bahnen. Gebaut wird er seit 2021 nicht mehr, viele sind aber noch im Einsatz.',
      note: 'Begrüßt jeden in der Halle und winkt. Danach fragt er, ob jemand Hilfe braucht.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Pepper_(robot)',
      box: () => [c2X('halle2') + 446, c2Y('halle2') + 250, 50, 112] },
    { id: 'schrubber', name: 'Reinigungsroboter', bereich: 'Service', aera: 'seit den 2010ern', typ: 'Fahrender Bodenreiniger',
      fakt: 'Große Reinigungsroboter wischen Flure in Flughäfen, Supermärkten und Schulen. Sie lernen den Grundriss einmal kennen, fahren ihn dann selbst ab und weichen Menschen mit Laserscannern und Kameras aus.',
      echt: 'Realistisch. Meist putzen sie nach Schulschluss, wenn die Flure leer sind; hier wischen sie gleich die Spur der Klasse weg.',
      note: 'Wischt die Schlammspur weg, die die Klasse vom Schulweg mitgebracht hat. Morgen ist sie wieder da.', color: '#e6e3da',
      quelle: C2Q + 'Floor_scrubber',
      box: () => { const x = c2ScrubX(heldG('schrubber', state.g)); return [c2X('halle2') + x - 36, c2Y('halle2') + 298, 76, 64]; } },
  ],
  draw: drawHalle2,
});
registerRoom({
  key: 'robotik', name: 'Schule: Robotik-AG', level: 'Schule EG',
  hitOrder: ['robocup', 'ag', 'schuldrucker'],
  robots: [
    { id: 'robocup', name: 'Linienfolger der Robotik-AG', bereich: 'Bildung', aera: 'seit 1998', typ: 'Selbst gebauter Wettbewerbsroboter',
      fakt: 'Beim RoboCup Junior treten Schülerinnen und Schüler bis 19 Jahre mit selbst gebauten Robotern an. In der Disziplin „Rescue“ folgt der Roboter einer schwarzen Linie, kommt über Lücken hinweg und sucht in einer Rettungszone Kugeln, die Verletzte darstellen.',
      echt: 'Genau so: Lücken in der Linie sind absichtlich eingebaut. Der Roboter muss sie ohne Hilfe überbrücken.',
      note: 'Verliert an der Lücke kurz die Linie, sucht und findet sie wieder.', color: '#3e6f9e',
      quelle: C2Q + 'RoboCup_Junior',
      box: f => { const b = c2Bot(f), [u, v] = c2PathPt(b.t), p = c2Map(u, v); return [c2X('robotik') + p.x - 18, c2Y('robotik') + p.y - 24, 36, 34]; } },
    { id: 'schuldrucker', name: '3D-Drucker', bereich: 'Bildung', aera: 'seit den 2010ern in Schulen', typ: 'Drucker für Kunststoffteile',
      fakt: 'Ein 3D-Drucker schmilzt Kunststoff und legt ihn Schicht für Schicht übereinander, bis ein Teil fertig ist. In Schulen druckt er Halterungen, Gehäuse und Räder für selbst gebaute Roboter.',
      echt: 'Echt, nur langsam: Ein Rad wie dieses braucht eine knappe Stunde. Bis dahin helfen die Ersatzräder aus der Kiste, die die Paketdrohne aufs Dach gebracht hat.',
      note: 'Druckt ein gelbes Rad. Erst 42 Prozent.', color: '#3b3d40',
      quelle: 'https://en.wikipedia.org/wiki/3D_printing',
      box: () => [c2X('robotik') + 228, c2Y('robotik') + 98, 114, 114] },
    { id: 'ag', name: 'Robotik-AG', bereich: 'Mensch', aera: 'Maßstab', typ: 'Zwei Kinder',
      fakt: 'Haben den Roboter selbst gebaut und programmiert.', note: 'Halten die Luft an, wenn er die Linie verliert.', color: '#5f9a4a',
      box: () => [c2X('robotik') + 4, c2Y('robotik') + 270, 50, 90] },
  ],
  draw: drawRobotik,
});
registerRoom({
  key: 'klasse2', name: 'Schule: Klassenzimmer', level: 'Schule 1. OG',
  hitOrder: ['beebot', 'bausteinbot', 'fischertechnik', 'nao', 'av1', 'kinder2', 'lehrerin2'],
  robots: [
    { id: 'nao', name: 'NAO', bereich: 'Bildung', aera: 'seit 2008', typ: 'Kleiner Humanoide, 58 cm',
      fakt: 'NAO kann laufen, sprechen, Gesichter erkennen und nach einem Sturz selbst wieder aufstehen. Viele Unis und Schulen programmieren ihn. Beim RoboCup spielen ganze Mannschaften aus NAOs Fußball.',
      echt: 'Echt. Ein NAO kostet so viel wie ein kleines Auto, deshalb steht er meist gut geschützt im Regal.',
      note: 'Winkt der Klasse zwischendurch zu.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Nao_(robot)',
      box: () => [c2X('klasse2') + 592, c2Y('klasse2') + 188, 34, 44] },
    { id: 'bausteinbot', name: 'Baustein-Roboter', bereich: 'Bildung', aera: 'seit 1998', typ: 'Roboter aus Bausteinen mit Rechenstein',
      fakt: 'Aus Bausteinen, Motoren, Sensoren und einem Rechenstein bauen Kinder eigene Roboter und programmieren sie mit Blöcken oder Python. Bekannt sind die Sets von LEGO Education, früher „Mindstorms“, heute „SPIKE“.',
      echt: 'Echt. Viele Schulen und die First Lego League arbeiten damit. Das Lichtfeld vorn zeigt kleine Bilder oder Zahlen.',
      note: 'Rollt ein Stück vor und zurück, ganz vorsichtig, damit er nicht vom Regal fällt.', color: '#f3e3a0',
      quelle: 'https://en.wikipedia.org/wiki/Lego_Mindstorms',
      box: () => [c2X('klasse2') + 588, c2Y('klasse2') + 262, 42, 32] },
    { id: 'fischertechnik', name: 'Baukasten-Greifarm', bereich: 'Bildung', aera: 'seit 1965', typ: 'Roboter aus einem Konstruktionsbaukasten',
      fakt: 'Mit fischertechnik, einem Baukasten aus dem Schwarzwald, bauen Schulen und Hochschulen kleine Industrieroboter: Greifarme, Förderbänder, ganze Fabriken. Ein Steuerrechner bewegt die Motoren.',
      echt: 'Echt. Auch Ingenieure bauen damit Modelle, um eine Fabrik zu planen, bevor sie die echte bauen.',
      note: 'Schwenkt seinen Greifer langsam hin und her.', color: '#d9342b',
      quelle: 'https://en.wikipedia.org/wiki/Fischertechnik',
      box: () => [c2X('klasse2') + 590, c2Y('klasse2') + 322, 40, 40] },
    { id: 'av1', name: 'Avatar-Roboter', bereich: 'Bildung', aera: 'seit den 2010ern', typ: 'Kleiner Telepräsenzroboter auf dem Tisch',
      fakt: 'Der Avatar-Roboter AV1 der norwegischen Firma No Isolation sitzt für ein Kind im Klassenzimmer, das lange krank ist. Das Kind sieht und hört über Kamera und Mikrofon mit, dreht den Kopf des Roboters und meldet sich, indem sein Kopf grün blinkt. Er wird in vielen europäischen Ländern eingesetzt.',
      echt: 'Realistisch. Gesteuert wird er zu Hause mit einer App auf dem Tablet oder Handy.',
      note: 'Blinkt grün, weil das Kind zu Hause die Antwort weiß, und wird drangenommen.', color: '#f3f1ea',
      quelle: 'https://www.akkodis.com/blog/articles/av1-classroom-robot-no-isolation',
      box: () => [c2X('klasse2') + 140, c2Y('klasse2') + 240, 40, 62] },
    { id: 'beebot', name: 'Bodenroboter Biene', bereich: 'Bildung', aera: 'seit den 2000ern', typ: 'Kleiner Fahrroboter mit Pfeiltasten',
      fakt: 'In vielen Grundschulen fährt ein Bodenroboter in Bienenform. Auf seinem Rücken sind Pfeiltasten: Die Kinder tippen eine Folge von Schritten ein, drücken auf Los, und der Roboter fährt sie nacheinander ab, jeweils 15 Zentimeter pro Schritt.',
      echt: 'Echt. So lernen schon Erstklässler, was ein Programm ist: eine Reihe von Befehlen in der richtigen Reihenfolge.',
      note: 'Fährt drei Felder vor, dreht um und kommt zurück.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/Bee-Bot',
      box: f => { const b = c2Bee(f); return [c2X('klasse2') + b.x - 18, c2Y('klasse2') + 346, 36, 24]; } },
    { id: 'kinder2', name: 'Kinder der 4b', bereich: 'Mensch', aera: 'Maßstab', typ: 'Zwei Kinder', fakt: 'Rechnen gerade das Einmaleins.', note: 'Die Nachbarin dreht sich zum Roboter, als er drankommt.', color: '#f0b429', box: () => [c2X('klasse2') + 46, c2Y('klasse2') + 260, 230, 100] },
    { id: 'lehrerin2', name: 'Lehrerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch', fakt: 'Nimmt alle dran, auch den Roboter.', note: 'Für sie ist er einfach ein Schüler mehr.', color: '#7b4b8e', box: () => [c2X('klasse2') + 538, c2Y('klasse2') + 236, 46, 124] },
  ],
  draw: drawKlasse2,
});
registerRoom({
  key: 'info', name: 'Schule: Informatikraum', level: 'Schule 1. OG',
  hitOrder: ['calliope', 'informatik', 'codeon'],
  robots: [
    { id: 'calliope', name: 'Calliope mini', bereich: 'Bildung', aera: 'seit 2016', typ: 'Kleiner Computer zum Programmierenlernen',
      fakt: 'Der Calliope mini wurde 2016 in Deutschland vorgestellt, damit Kinder ab der dritten Klasse programmieren lernen. Die sternförmige Platine hat 25 Lämpchen, Knöpfe, Bewegungs-, Temperatur- und Lichtsensoren und einen Anschluss für zwei Motoren. Ein Würfel, der beim Schütteln eine Zahl zeigt, ist ein typisches erstes Projekt.',
      echt: 'Kein Roboter, aber oft sein Gehirn: Mit Motoren wird daraus ein kleiner Fahrroboter.',
      note: 'Der Würfel zeigt jedes Mal eine 6. Irgendwo im Programm steckt ein Fehler.', color: '#d9542b',
      quelle: 'https://www.bpb.de/lernen/digitale-bildung/werkstatt/248122/calliope-mini-mikrocontroller-fuer-den-schulunterricht/',
      box: () => [c2X('info') + 160, c2Y('info') + 222, 50, 84] },
    { id: 'codeon', name: 'CodeON', bereich: 'Bildung', aera: 'Programm', typ: 'Programmieren mit Blöcken',
      fakt: 'CodeON ist eine Programmierumgebung mit bunten Blöcken. Sie baut auf dem Open Roberta Lab auf, das das Fraunhofer IAIS kostenlos im Browser anbietet. Die Kinder stecken Blöcke wie Puzzleteile zusammen und laden das Programm auf den Calliope mini.',
      echt: 'Echt: Mit dem Open Roberta Lab programmieren viele Schulen den Calliope mini. Der Fehler ist hier Absicht: „zufällig von 6 bis 6“ ergibt immer eine 6.',
      note: 'An der Leinwand sieht man, warum der Würfel immer 6 zeigt. Das Kind rechts hat es gerade entdeckt.', color: '#23384d',
      quelle: 'https://github.com/Thorlogy/CodeON',
      box: () => [c2X('info') + 236, c2Y('info') + 52, 380, 168] },
    { id: 'informatik', name: 'Informatik-Gruppe', bereich: 'Mensch', aera: 'Maßstab', typ: 'Zwei Kinder', fakt: 'Programmieren einen Würfel.', note: 'Einer schüttelt, die andere sucht schon den Fehler.', color: '#5f9a4a', box: () => [c2X('info') + 110, c2Y('info') + 260, 400, 100] },
  ],
  draw: drawInfo,
});
