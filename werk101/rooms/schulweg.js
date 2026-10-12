/* Raum: Schulweg mit Spielplatz (EG, rechts neben dem Haus) und die Schulklasse als Läufer
   Die Klasse kommt jede Runde mit der U-Bahn, steigt die Treppe hoch, winkt der Fassadendrohne (die ist dann gerade unten) und geht weiter zur Schule. */
const SWX = rx(roomOf('schulweg').c), SWY = ry(roomOf('schulweg').r);
const swSwing = f => Math.sin(TAU * f / 30) * 0.45;
function drawSchulweg(f) {
  // Bäume und Wiese
  for (const [x, h] of [[230, 150], [610, 120]]) { box(x - 6, 400 - h * 0.6, 12, h * 0.6, '#8e6233', 0, 1.2); circle(x, 400 - h * 0.7, h * 0.32, '#5f9a4a'); circle(x + h * 0.15, 400 - h * 0.62, h * 0.2, '#7aae5a', null); }
  ctx.fillStyle = '#8fbf6c'; ctx.fillRect(0, 352, RW, 56); line(0, 352, RW, 352, INK, 1.5);
  ctx.fillStyle = '#d8ccb0'; ctx.fillRect(0, 380, RW, 18);
  text('SCHULWEG', 300, 200, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // U-Bahn-Eingang
  ctx.fillStyle = '#3b3d40'; ctx.fillRect(-6, 378, 70, 30);
  for (const x of [0, 62]) line(x, 378, x, 350, '#8a8f94', 3); line(0, 352, 62, 352, '#8a8f94', 3);
  line(100, 400, 100, 290, '#3b3d40', 4); box(86, 262, 28, 28, '#3e6f9e', 3, 1.5); text('U', 100, 284, 22, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#fff' });
  // Laterne
  box(160, 250, 5, 140, '#3b3d40'); line(162, 252, 186, 244, '#3b3d40', 4); box(178, 240, 20, 8, '#fff3c4', 2, 1.2);
  // Schaukel und Rutsche
  line(330, 392, 360, 300, '#a8763f', 4); line(420, 392, 390, 300, '#a8763f', 4); line(356, 300, 394, 300, '#a8763f', 5);
  ctx.save(); ctx.translate(375, 302); ctx.rotate(swSwing(f)); line(-6, 0, -6, 56, INK, 1.5); line(6, 0, 6, 56, INK, 1.5); box(-12, 56, 24, 5, '#d9542b', 1, 1.2); ctx.restore();
  ctx.beginPath(); ctx.moveTo(470, 392); ctx.lineTo(470, 320); ctx.lineTo(486, 320); ctx.lineTo(560, 388); ctx.lineTo(552, 392); ctx.lineTo(482, 330); ctx.lineTo(482, 392); ctx.closePath(); paint('#f0b429', INK, 1.5);
  for (let y = 332; y < 392; y += 12) line(470, y, 482, y, INK, 1.5);
}
// Schulklasse: Lehrerin und vier Kinder, je 10 Bilder versetzt
const KL_DOOR = { x: UBX + 415, y: UBY + 330 }, KL_SB = { x: UBX + 280, y: UBY + 330 }, KL_ST = { x: SWX + 24, y: SWY + 392 }, KL_END = SWX + 700;
const KL = [
  { s: 1, shirt: '#7b4b8e', pants: '#3b3d40', hair: '#3a2c22', kid: false },
  { s: 0.72, shirt: '#d9542b', pants: '#2f4866', hair: '#e0b860', kid: true, bag: '#3e6f9e' },
  { s: 0.7, shirt: '#3d7f8f', pants: '#3b3d40', hair: '#2a1f18', kid: true, bag: '#f0b429' },
  { s: 0.74, shirt: '#f0b429', pants: '#5d5a55', hair: '#7a4a2a', kid: true, bag: '#d9542b' },
  { s: 0.7, shirt: '#5f9a4a', pants: '#2f4866', hair: '#3a2c22', kid: true, bag: '#7b4b8e' },
];
function klassePos(g, i) {
  const t = (g % 480) - i * 10;
  if (t < 62 || t >= 420) return null;
  if (t < 72) return { x: KL_DOOR.x, y: KL_DOOR.y, face: -1, a: seg(t, 62, 70) };
  if (t < 110) return { x: lerp(KL_DOOR.x, KL_SB.x, seg(t, 72, 110)), y: KL_DOOR.y, face: -1, walk: true };
  if (t < 190) { const k = seg(t, 110, 190); return { x: lerp(KL_SB.x, KL_ST.x, k), y: lerp(KL_SB.y, KL_ST.y, k), face: -1, walk: true }; }
  if (t < 230) return { x: lerp(KL_ST.x, KL_ST.x + 180 + i * 28, ease(seg(t, 190, 208))), y: KL_ST.y, face: t < 208 ? 1 : -1, wave: t >= 208, walk: t < 208 };
  const k = seg(t, 230, 420);
  return { x: lerp(KL_ST.x + 180 + i * 28, KL_END, k), y: KL_ST.y, face: 1, walk: true, a: 1 - seg(t, 395, 420) };
}
registerRunner({
  room: 'schulweg',
  draw(g) {
    withAlpha('klasse', () => {
      for (let i = KL.length - 1; i >= 0; i--) {
        const p = klassePos(g, i); if (!p) continue;
        const m = KL[i], h = 120 * m.s, st = p.walk ? Math.sin(TAU * g / 6 + i) * 4 : 0;
        const hand = p.wave ? { x: p.x - 10 * m.s, y: p.y - h - 10 + Math.sin(TAU * g / 4) * 6 } : { x: p.x + p.face * 8 + st, y: p.y - h * 0.5 };
        ctx.save(); ctx.globalAlpha *= p.a == null ? 1 : p.a;
        person({ x: p.x, foot: p.y, s: m.s, face: p.face, shirt: m.shirt, pants: m.pants, hair: m.hair, hand });
        if (m.bag) box(p.x - p.face * 12 * m.s - 6, p.y - h * 0.62, 12, 16 * m.s + 4, m.bag, 2, 1);
        if (state.wetter === 'regen' && p.y < UBY) schirm(p.x + 4, p.y - h - 30 * m.s, m.bag || '#3e6f9e');
        ctx.restore();
      }
    });
  },
  robot: { id: 'klasse', name: 'Schulklasse', bereich: 'Mensch', aera: 'Maßstab', typ: 'Lehrerin und vier Kinder',
    fakt: 'Kommt mit der U-Bahn, geht die Treppe hoch und weiter zur Schule. Oben winken alle der Fassadendrohne, die gerade unten am Haus vorbeifliegt.',
    echt: 'Die Drohne winkt nicht zurück. Sie fotografiert die Hauswand und hält Abstand zu Menschen.',
    note: 'Jede Runde kommt eine neue Klasse an.', color: '#7b4b8e',
    box: () => {
      const ps = KL.map((_, i) => klassePos(state.g, i)).filter(Boolean);
      if (!ps.length) return [-9999, 0, 0, 0];
      const x0 = Math.min(...ps.map(p => p.x)) - 20, x1 = Math.max(...ps.map(p => p.x)) + 20, y1 = Math.max(...ps.map(p => p.y)), y0 = Math.min(...ps.map(p => p.y)) - 124;
      return [x0, y0, x1 - x0, y1 - y0];
    } },
});
registerRoom({
  key: 'schulweg', name: 'Schulweg', level: 'Außengelände',
  hitOrder: [],
  robots: [],
  draw: drawSchulweg,
  glow(f) { glow(188, 248, 70, 'rgba(255,224,150,0.75)'); glow(100, 276, 26, 'rgba(120,170,255,0.6)'); },
});
