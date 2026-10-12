/* Zweites Gebäude: Schule 102 (rechts neben dem Schulweg). Sechs Räume in einer Datei, Hilfsnamen mit Präfix c2.
   Die Schulklasse vom Schulweg geht in die Eingangshalle. */
const c2X = key => rx(roomOf(key).c), c2Y = key => ry(roomOf(key).r);
function c2Desk(x, w) { box(x, 300, w, 8, '#a8763f', 1, 1.5); line(x + 6, 308, x + 6, 360, INK, 2); line(x + w - 6, 308, x + w - 6, 360, INK, 2); }
function c2Chair(x) { box(x - 12, 318, 24, 5, '#3e6f9e', 1, 1.2); line(x - 10, 323, x - 10, 360, INK, 2); line(x + 10, 323, x + 10, 360, INK, 2); box(x - 14 + 0, 280, 5, 40, '#3e6f9e', 1, 1.2); }
function c2Wall(color) { ctx.fillStyle = color; ctx.fillRect(0, 0, RW, RH); ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8); ctx.fillStyle = '#b9a58a'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2); }
function c2Title(t, x = 440) { text(t, x, 70, 36, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' }); }

/* ---------- Eingangshalle: Reinigungsroboter wischt die Spur der Klasse weg (globale Uhr, Schutzfeld) ---------- */
const C2_STEPS = Array.from({ length: 12 }, (_, i) => ({ x: 40 + i * 34, y: 368 + (i % 2) * 8, lay: 400 + i * 3 }));
const c2ScrubX = hg => (hg < 40 ? 70 : hg < 220 ? lerp(70, 520, seg(hg, 40, 220)) : hg < 320 ? lerp(520, 70, ease(seg(hg, 220, 320))) : 70);
function c2StepVisible(s, hg) {
  const clean = 40 + 180 * clamp((s.x - 70 + 20) / 450, 0, 1);
  return hg >= s.lay || hg < clean;
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
  // Schlammspuren der Klasse
  for (const s of C2_STEPS) if (c2StepVisible(s, hg)) { ctx.beginPath(); ctx.ellipse(s.x, s.y, 7, 3, 0, 0, TAU); ctx.fillStyle = 'rgba(110,82,52,0.55)'; ctx.fill(); }
  // Ladestation
  box(30, 330, 20, 30, '#3b3d40', 2, 1.2);
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
function drawKlasse2(f) {
  c2Wall('#eef0e6');
  box(240, 60, 300, 150, '#2f4a3a', 3, 2); text('3 × 7 = ?', 390, 140, 34, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#f3f1ea' });
  c2Title('KLASSE 4B', 40);
  const call = f >= 34 && f < 52, flash = f >= 18 && f < 34 && f % 4 < 2;
  withAlpha('lehrerin2', () => person({ x: 570, face: -1, shirt: '#7b4b8e', pants: '#3b3d40', hair: '#8a5a2b', hand: call ? { x: 528, y: 262 } : { x: 540 + (f % 8 < 4 ? 0 : 3), y: 204 } }));
  // Tischreihe
  c2Desk(40, 140); c2Desk(220, 140);
  c2Chair(70); c2Chair(150); c2Chair(250);
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
}

/* ---------- Informatikraum: Würfel-Programm auf dem Calliope mini, Schütteln ergibt jedes Mal eine 6 (Bild 30–50) ---------- */
const C2_DICE = [[1, 0, 0, 0, 0, 0], [0, 1, 0, 0, 1, 0], [1, 1, 1, 1, 1, 1]];
function c2Star(x, y, n, ledOn) {
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 9 : 20; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); paint('#d9542b', INK, 1.2);
  const dots = { 1: [[2, 2]], 2: [[0, 0], [4, 4]], 3: [[0, 0], [2, 2], [4, 4]], 4: [[0, 0], [0, 4], [4, 0], [4, 4]], 5: [[0, 0], [0, 4], [4, 0], [4, 4], [2, 2]], 6: [[0, 0], [0, 2], [0, 4], [4, 0], [4, 2], [4, 4]] }[n] || [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { const on = ledOn && dots.some(([a, b]) => a === r && b === c); ctx.fillStyle = on ? '#ffe9a8' : '#7a2a14'; ctx.fillRect(x - 6 + c * 2.6, y - 6 + r * 2.6, 1.8, 1.8); }
}
function drawInfo(f) {
  c2Wall('#e6eaf0');
  c2Title('INFORMATIK', 360);
  box(40, 80, 220, 120, '#f3f1ea', 3, 1.5);
  ['wenn geschüttelt:', '  zeige Zahl', '  zufällig 1 bis 6'].forEach((t, i) => text(t, 52, 108 + i * 22, 13, { family: '"IBM Plex Mono", monospace', weight: 500, color: i ? '#3e6f9e' : '#2a2723' }));
  c2Desk(60, 220); c2Desk(360, 220);
  for (const x of [110, 200, 410, 500]) box(x - 16, 286, 32, 14, '#3b3d40', 2, 1);
  c2Chair(140); c2Chair(470);
  const shake = f >= 30 && f < 50, dx = shake ? Math.sin(TAU * f / 3) * 6 : 0;
  withAlpha('informatik', () => {
    person({ x: 140, sit: true, foot: 360, s: 0.73, face: 1, shirt: '#5f9a4a', pants: '#2f4866', hair: '#3a2c22', hand: { x: 176 + dx, y: shake ? 252 : 292 } });
    person({ x: 470, sit: true, foot: 360, s: 0.71, face: -1, shirt: '#3e6f9e', pants: '#3b3d40', hair: '#d6d2c8', hand: { x: 446, y: 292 } });
  });
  withAlpha('calliope', () => {
    const n = shake ? (f % 6 < 3 ? 6 : 6) : f < 30 ? 1 + (Math.floor(f / 6) % 5) : 6;
    c2Star(184 + dx, shake ? 246 : 280, n, true);
    c2Star(430, 286, 3, true);
    if (f >= 44 && f < 58) text('Schon wieder 6?', 220, 220, 13, { family: '"IBM Plex Mono", monospace', weight: 500, color: '#d9542b' });
  });
}

/* ---------- Bewegungsraum: kleiner Humanoider macht Übungen vor, ein Kind nimmt den anderen Arm ---------- */
function drawBewegung(f) {
  c2Wall('#f0e6d6');
  c2Title('BEWEGUNG', 400);
  for (let i = 0; i < 4; i++) box(60 + i * 140, 352, 110, 8, ['#3e6f9e', '#d9542b', '#5f9a4a', '#f0b429'][i], 2, 1);
  box(270, 300, 100, 60, '#a8763f', 2, 1.5);
  const up = 0.5 - 0.5 * Math.cos(TAU * f / 30);
  withAlpha('nao', () => {
    const x = 320, foot = 300, s = 0.38;
    humanoid(x, foot, { s, color: '#f3f1ea', armL: -1.2 - 1.6 * up, armR: 1.2 + 1.6 * up });
  });
  withAlpha('bewegungskinder', () => {
    const arm = (x, mirror) => ({ x: x + (mirror ? -1 : 1) * (18 - 10 * up), y: 300 - 60 * up });
    [[120, false, '#d9542b'], [500, false, '#3d7f8f'], [580, true, '#f0b429']].forEach(([x, wrong, c]) => {
      person({ x, s: 0.72, face: x < 320 ? 1 : -1, shirt: c, pants: '#2f4866', hair: '#3a2c22', hand: wrong ? { x: x + 14, y: 330 - 4 * up } : arm(x, x > 320) });
    });
    if (up > 0.7) text('?', 596, 240, 18, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#d9542b' });
  });
}

/* ---------- Lehrerzimmer: Kaffee-Roboterarm, Schlange vor der Ausgabe, die Pause ist gleich vorbei ---------- */
const c2Cup = f => (f < 20 ? { x: lerp(120, 260, ease(seg(f, 4, 20))), y: 250, on: true } : f < 30 ? { x: 260, y: 250, on: true } : f < 42 ? { x: lerp(260, 380, ease(seg(f, 30, 42))), y: lerp(250, 286, ease(seg(f, 30, 42))), on: true } : { x: 380, y: 286, on: f < 52 });
function drawLehrer(f) {
  c2Wall('#ede7df');
  c2Title('LEHRERZIMMER', 330);
  box(60, 270, 360, 90, '#8e6233', 2, 1.5); box(60, 262, 360, 10, '#a8763f', 1, 1.5);
  box(250, 214, 46, 48, '#3b3d40', 3, 1.5); box(258, 222, 30, 14, '#23384d', 2, 1);
  box(370, 276, 50, 14, '#f3f1ea', 2, 1.2); text('ABHOLUNG', 395, 287, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  box(440, 90, 150, 46, '#23384d', 3, 1.5); text('Pause endet in', 515, 108, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' });
  text(`0:${String(Math.max(0, 59 - f)).padStart(2, '0')}`, 515, 128, 16, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#ffb347' });
  withAlpha('barista', () => {
    const c = c2Cup(f), S = { x: 160, y: 250 }, W = { x: c.x, y: c.y - 16 };
    box(140, 250, 40, 14, '#8a8f94', 2, 1.2);
    const E = ik2(S, W, 70, 70);
    limb(S.x, S.y, E.x, E.y, 9, '#f3f1ea'); limb(E.x, E.y, W.x, W.y, 8, '#f3f1ea'); circle(E.x, E.y, 6, '#d6d9dc', INK, 1.2);
    box(W.x - 8, W.y - 4, 16, 8, '#3b3d40', 2, 1);
    if (c.on) { box(c.x - 7, c.y - 12, 14, 14, '#f3f1ea', 2, 1.2); if (f >= 20 && f < 30) for (let i = 0; i < 3; i++) line(c.x - 3 + i * 3, 240 - ((f * 2 + i * 4) % 10), c.x - 3 + i * 3, 236 - ((f * 2 + i * 4) % 10), 'rgba(160,160,160,0.6)', 1.5); }
  });
  withAlpha('kollegium', () => {
    const take = f >= 44 && f < 52;
    person({ x: 470, face: -1, shirt: '#3e6f9e', pants: '#3b3d40', hair: '#2a1f18', hand: take ? { x: 392, y: 278 } : { x: 446, y: 290 } });
    person({ x: 540, face: -1, shirt: '#d9542b', pants: '#5d5a55', hair: '#d6d2c8', hand: { x: 530, y: 250 + (f % 20 < 10 ? 0 : 4) } });
    person({ x: 610, face: -1, shirt: '#5f9a4a', pants: '#3b3d40', hair: '#8a5a2b' });
    if (take) box(380, 270, 14, 14, '#f3f1ea', 2, 1.2);
  });
}

const C2Q = 'https://en.wikipedia.org/wiki/';
registerRoom({
  key: 'halle2', name: 'Schule: Eingangshalle', level: 'Schule EG',
  hitOrder: ['schrubber'],
  robots: [
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
  hitOrder: ['robocup', 'ag'],
  robots: [
    { id: 'robocup', name: 'Linienfolger der Robotik-AG', bereich: 'Bildung', aera: 'seit 1998', typ: 'Selbst gebauter Wettbewerbsroboter',
      fakt: 'Beim RoboCup Junior treten Schülerinnen und Schüler bis 19 Jahre mit selbst gebauten Robotern an. In der Disziplin „Rescue“ folgt der Roboter einer schwarzen Linie, kommt über Lücken hinweg und sucht in einer Rettungszone Kugeln, die Verletzte darstellen.',
      echt: 'Genau so: Lücken in der Linie sind absichtlich eingebaut. Der Roboter muss sie ohne Hilfe überbrücken.',
      note: 'Verliert an der Lücke kurz die Linie, sucht und findet sie wieder.', color: '#3e6f9e',
      quelle: C2Q + 'RoboCup_Junior',
      box: f => { const b = c2Bot(f), [u, v] = c2PathPt(b.t), p = c2Map(u, v); return [c2X('robotik') + p.x - 18, c2Y('robotik') + p.y - 24, 36, 34]; } },
    { id: 'ag', name: 'Robotik-AG', bereich: 'Mensch', aera: 'Maßstab', typ: 'Zwei Kinder',
      fakt: 'Haben den Roboter selbst gebaut und programmiert.', note: 'Halten die Luft an, wenn er die Linie verliert.', color: '#5f9a4a',
      box: () => [c2X('robotik') + 4, c2Y('robotik') + 270, 50, 90] },
  ],
  draw: drawRobotik,
});
registerRoom({
  key: 'klasse2', name: 'Schule: Klassenzimmer', level: 'Schule 1. OG',
  hitOrder: ['av1', 'kinder2', 'lehrerin2'],
  robots: [
    { id: 'av1', name: 'Avatar-Roboter', bereich: 'Bildung', aera: 'seit den 2010ern', typ: 'Kleiner Telepräsenzroboter auf dem Tisch',
      fakt: 'Der Avatar-Roboter AV1 der norwegischen Firma No Isolation sitzt für ein Kind im Klassenzimmer, das lange krank ist. Das Kind sieht und hört über Kamera und Mikrofon mit, dreht den Kopf des Roboters und meldet sich, indem sein Kopf grün blinkt. Er wird in vielen europäischen Ländern eingesetzt.',
      echt: 'Realistisch. Gesteuert wird er zu Hause mit einer App auf dem Tablet oder Handy.',
      note: 'Blinkt grün, weil das Kind zu Hause die Antwort weiß, und wird drangenommen.', color: '#f3f1ea',
      quelle: 'https://www.akkodis.com/blog/articles/av1-classroom-robot-no-isolation',
      box: () => [c2X('klasse2') + 140, c2Y('klasse2') + 240, 40, 62] },
    { id: 'kinder2', name: 'Kinder der 4b', bereich: 'Mensch', aera: 'Maßstab', typ: 'Zwei Kinder', fakt: 'Rechnen gerade das Einmaleins.', note: 'Die Nachbarin dreht sich zum Roboter, als er drankommt.', color: '#f0b429', box: () => [c2X('klasse2') + 46, c2Y('klasse2') + 260, 230, 100] },
    { id: 'lehrerin2', name: 'Lehrerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch', fakt: 'Nimmt alle dran, auch den Roboter.', note: 'Für sie ist er einfach ein Schüler mehr.', color: '#7b4b8e', box: () => [c2X('klasse2') + 538, c2Y('klasse2') + 236, 46, 124] },
  ],
  draw: drawKlasse2,
});
registerRoom({
  key: 'info', name: 'Schule: Informatikraum', level: 'Schule 1. OG',
  hitOrder: ['calliope', 'informatik'],
  robots: [
    { id: 'calliope', name: 'Calliope mini', bereich: 'Bildung', aera: 'seit 2016', typ: 'Kleiner Computer zum Programmierenlernen',
      fakt: 'Der Calliope mini wurde 2016 in Deutschland vorgestellt, damit Kinder ab der dritten Klasse programmieren lernen. Die sternförmige Platine hat 25 Lämpchen, Knöpfe, Bewegungs-, Temperatur- und Lichtsensoren und einen Anschluss für zwei Motoren. Ein Würfel, der beim Schütteln eine Zahl zeigt, ist ein typisches erstes Projekt.',
      echt: 'Kein Roboter, aber oft sein Gehirn: Mit Motoren wird daraus ein kleiner Fahrroboter.',
      note: 'Der Würfel zeigt jedes Mal eine 6. Irgendwo im Programm steckt ein Fehler.', color: '#d9542b',
      quelle: 'https://www.bpb.de/lernen/digitale-bildung/werkstatt/248122/calliope-mini-mikrocontroller-fuer-den-schulunterricht/',
      box: () => [c2X('info') + 160, c2Y('info') + 222, 50, 84] },
    { id: 'informatik', name: 'Informatik-Gruppe', bereich: 'Mensch', aera: 'Maßstab', typ: 'Zwei Kinder', fakt: 'Programmieren einen Würfel.', note: 'Einer schüttelt, die andere sucht schon den Fehler.', color: '#5f9a4a', box: () => [c2X('info') + 110, c2Y('info') + 260, 400, 100] },
  ],
  draw: drawInfo,
});
registerRoom({
  key: 'bewegung', name: 'Schule: Bewegungsraum', level: 'Schule 2. OG',
  hitOrder: ['nao', 'bewegungskinder'],
  robots: [
    { id: 'nao', name: 'Kleiner Humanoider', bereich: 'Bildung', aera: 'seit 2008', typ: 'Humanoider Roboter, 58 cm groß',
      fakt: 'Der Humanoide NAO ist rund 58 Zentimeter groß und einer der meistverkauften Humanoiden der Welt. Schulen und Hochschulen nutzen ihn zum Programmierenlernen und als Vorturner: Er erklärt Übungen und achtet auf die Zeit.',
      echt: 'Realistisch. Er steht auf einem Tisch, damit ihn alle sehen; vom Boden aus wäre er kaum größer als ein Kleinkind.',
      note: 'Macht Armkreisen vor. Ein Kind nimmt den falschen Arm.', color: '#f3f1ea',
      quelle: 'https://labor.bht-berlin.de/en/kom/hrob/lab-robots/nao',
      box: () => [c2X('bewegung') + 296, c2Y('bewegung') + 250, 48, 52] },
    { id: 'bewegungskinder', name: 'Kinder in der Bewegungspause', bereich: 'Mensch', aera: 'Maßstab', typ: 'Drei Kinder', fakt: 'Machen die Übungen nach.', note: 'Hauptsache bewegt.', color: '#d9542b', box: () => [c2X('bewegung') + 96, c2Y('bewegung') + 270, 510, 90] },
  ],
  draw: drawBewegung,
});
registerRoom({
  key: 'lehrer', name: 'Schule: Lehrerzimmer', level: 'Schule 2. OG',
  hitOrder: ['barista', 'kollegium'],
  robots: [
    { id: 'barista', name: 'Kaffee-Roboter', bereich: 'Service', aera: 'seit 2017', typ: 'Roboterarm hinter der Theke',
      fakt: '2017 eröffnete in San Francisco ein Café, in dem ein Roboterarm den Kaffee zubereitet. Bestellt wird per App oder am Bildschirm, danach holt man den Becher mit einem Code ab. Je nach Getränk schafft der Arm ein bis vier Becher pro Minute.',
      echt: 'In Lehrerzimmern steht so etwas bisher kaum, eher in Bahnhöfen und Einkaufszentren.',
      note: 'Arbeitet ohne Pause, während die Lehrkräfte nur noch eine Minute haben.', color: '#f3f1ea',
      quelle: 'https://www.pcworld.com/article/411933/this-robotic-barista-never-needs-a-coffee-break.html',
      box: () => [c2X('lehrer') + 130, c2Y('lehrer') + 180, 280, 100] },
    { id: 'kollegium', name: 'Lehrkräfte', bereich: 'Mensch', aera: 'Maßstab', typ: 'Drei Menschen', fakt: 'Stehen für Kaffee an.', note: 'Der Gong ist gnadenlos.', color: '#3e6f9e', box: () => [c2X('lehrer') + 446, c2Y('lehrer') + 236, 190, 124] },
  ],
  draw: drawLehrer,
});
