/* Hohe See rechts hinter der Hafeneinfahrt (c 20–23, Wasserfelder) und Müllsammel-Roboter im Hafenbecken.
   Draußen auf See ist alles weit weg: Maßstab 1 : 12 (1 m ≈ 5,75 Einheiten). Der Hafen davor ist 1 : 4.
   Gezeichnet in Läufern ohne Zuschnitt; die Felder bleiben leer. Die Schiffe stehen im Bild, die Wellen ziehen vorbei. */
const MR_X0 = rx(roomOf('see1').c) + 140, MR_X1 = rx(roomOf('see4').c) + RW + 900;
const MR_M = 69 / 12;
const MR_FR = rx(roomOf('see1').c) + 300;          // Bug des Frachters (fährt nach links)
const MR_FL = 229 * MR_M;                           // 229 m lang
const MR_ZA = rx(roomOf('see1').c) + 1680, MR_ZB = rx(roomOf('see1').c) + 2420;   // Schlepper der Barriere
const MR_SACK = (MR_ZA + 240 + MR_ZB - 40) / 2;

function mrWellen(x0, x1, y, g, farbe) {
  ctx.strokeStyle = farbe; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = x0; x < x1; x += 56) { const o = (g * 4) % 56; ctx.moveTo(x + o, y + 3); ctx.quadraticCurveTo(x + o + 14, y - 4, x + o + 28, y + 3); }
  ctx.stroke();
}
// Frachter mit zwei starren Flügelsegeln; die Segel drehen sich mit dem Wind (von der Seite wird ihre Breite schmaler)
function mrFrachter(g) {
  const y = SH_WY + Math.sin(g / 30) * 2, x0 = MR_FR, x1 = MR_FR + MR_FL;
  ctx.beginPath(); ctx.moveTo(x0 + 30, y - 60); ctx.lineTo(x1, y - 60); ctx.lineTo(x1 - 10, y + 50); ctx.lineTo(x0 + 60, y + 50); ctx.quadraticCurveTo(x0, y + 30, x0 + 30, y - 60); ctx.closePath();
  paint('#3b3d40', INK, 2);
  ctx.save(); ctx.clip(); ctx.fillStyle = '#9c3a2a'; ctx.fillRect(x0 - 10, y + 6, MR_FL + 20, 60); ctx.restore();
  for (let i = 0; i < 7; i++) box(x0 + 120 + i * 120, y - 72, 100, 12, '#5f9a4a', 1, 1.2);
  box(x1 - 120, y - 150, 90, 90, '#e9e9e6', 2, 2);
  for (let i = 0; i < 3; i++) box(x1 - 110 + i * 26, y - 140, 18, 10, istDunkel() ? '#ffe7a3' : '#23384d', 1, 1);
  box(x1 - 80, y - 190, 14, 40, '#3b3d40', 1, 1.5);
  const winkel = 0.5 + 0.35 * Math.sin(g / 480 * TAU);
  for (const fx of [0.3, 0.55]) {
    const cx = x0 + MR_FL * fx, h = 37 * MR_M, w = Math.max(18, 110 * Math.abs(Math.cos(winkel)));
    box(cx - w / 2, y - 72 - h, w, h, '#7d93a3', 4, 3);
    for (let k = 1; k < 4; k++) line(cx - w / 2 + 3, y - 72 - h * k / 4, cx + w / 2 - 3, y - 72 - h * k / 4, '#f3f1ea', 3);
    ctx.fillStyle = '#d9542b'; ctx.fillRect(cx - w / 2 + 2, y - 72 - h + 8, w - 4, 8);
    line(cx, y - 72, cx, y - 60, INK, 4);
  }
}
// The-Ocean-Cleanup-Barriere: zwei Schiffe ziehen sie, in der Mitte der Sammelsack
const mrFuell = g => g < 380 ? seg(g, 0, 380) : g < 450 ? 1 : 0;
function mrSchlepper(x, dir) {
  const y = SH_WY;
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(220, -24); ctx.lineTo(210, 22); ctx.lineTo(30, 22); ctx.quadraticCurveTo(0, 10, 0, -24); ctx.closePath(); paint('#2f6f9e', INK, 2);
  box(20, -70, 80, 46, '#e9e9e6', 2, 2); box(28, -62, 64, 12, istDunkel() ? '#ffe7a3' : '#23384d', 1, 1);
  line(150, -24, 150, -90, INK, 3); line(150, -90, 200, -40, INK, 2);
  ctx.restore();
}
function mrCleanup(g) {
  const y = SH_WY, f = mrFuell(g);
  mrSchlepper(MR_ZA, 1); mrSchlepper(MR_ZB, 1);
  const a = MR_ZA + 240, b = MR_ZB - 40;
  line(MR_ZA + 220, y - 10, a, y, INK, 1.5); line(MR_ZB, y - 10, b, y, INK, 1.5);
  // Schwimmer und Schirm darunter (4 m tief)
  ctx.fillStyle = 'rgba(240,180,41,0.9)'; ctx.fillRect(a, y - 4, b - a, 8);
  ctx.fillStyle = 'rgba(42,39,35,0.35)'; ctx.fillRect(a, y + 4, b - a, 23);
  // Sammelsack: hängt im Wasser, wird zum Leeren an Bord gehoben
  const hoch = g >= 380 && g < 450 ? ease(seg(g, 380, 410)) - ease(seg(g, 430, 450)) : 0;
  const sx = lerp(MR_SACK, MR_ZB + 150, hoch), sy = lerp(y + 6, y - 110, hoch);
  if (hoch > 0) line(MR_ZB + 150, y - 90, sx, sy - 10, INK, 1.5);
  box(sx - 40, sy, 80, 46, 'rgba(240,180,41,0.85)', 6, 1.5);
  for (let i = 0; i < Math.round(f * 8); i++) box(sx - 32 + (i % 4) * 16, sy + 30 - Math.floor(i / 4) * 14, 10, 8, SH_FARBEN[i % SH_FARBEN.length], 1, 0.8);
  if (g >= 420) for (let i = 0; i < 6; i++) box(MR_ZB + 60 + i * 12, y - 30 - (i % 2) * 6, 10, 6, SH_FARBEN[(i + 2) % SH_FARBEN.length], 1, 0.8);
  // Plastik treibt auf die Barriere zu und verschwindet im Sack
  if (g < 380) for (let i = 0; i < 6; i++) {
    const t = ((g / 380) + i / 6) % 1, px = lerp(a - 500, MR_SACK, t), py = y - 2 + Math.sin(i + g / 20) * 2;
    if (px > a - 20 && px < MR_SACK - 20) continue;
    mrPlastik(px, py, i);
  }
  // Tierschutz-Klappe: Kamera erkennt einen Fisch im Sack, die Klappe öffnet sich, der Fisch schwimmt hinaus
  const fx = g < 200 ? lerp(MR_SACK - 300, MR_SACK - 10, seg(g, 120, 200)) : g < 230 ? MR_SACK - 10 : lerp(MR_SACK - 10, MR_SACK + 260, seg(g, 230, 300));
  if (g > 120 && g < 300) { ctx.beginPath(); ctx.ellipse(fx, y + 34, 10, 5, 0, 0, TAU); paint('#e0a526', INK, 1); ctx.beginPath(); ctx.moveTo(fx - 10, y + 34); ctx.lineTo(fx - 16, y + 29); ctx.lineTo(fx - 16, y + 39); ctx.closePath(); paint('#e0a526', INK, 1); }
  if (g >= 215 && g < 280 && hoch === 0) { box(sx + 40, sy + 8, 6, 30, '#2a2723', 1, 1); circle(sx + 30, sy + 8, 3, g % 8 < 4 ? '#d9342b' : '#5d1f1b', null); }
}
// Plastikmüll: Flasche, Tüte, Becher, Netzrest – groß genug, um ihn zu erkennen
function mrPlastik(x, y, i, unter) {
  const art = i % 4;
  if (art === 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(unter ? 0.6 : 0.15); box(-14, -6, 26, 12, '#9fd0e8', 4, 1.5); box(12, -3, 6, 6, '#3e6f9e', 1, 1); ctx.restore(); }
  else if (art === 1) { ctx.beginPath(); ctx.moveTo(x - 12, y - 8); ctx.quadraticCurveTo(x, y - 18, x + 12, y - 8); ctx.lineTo(x + 9, y + 10); ctx.quadraticCurveTo(x, y + 14, x - 9, y + 10); ctx.closePath(); paint('rgba(250,250,250,0.85)', INK, 1.2); }
  else if (art === 2) { ctx.beginPath(); ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y - 9); ctx.lineTo(x + 6, y + 9); ctx.lineTo(x - 6, y + 9); ctx.closePath(); paint('#d9542b', INK, 1.2); }
  else { ctx.strokeStyle = '#5f9a4a'; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.moveTo(x - 14 + k * 8, y - 8); ctx.lineTo(x - 6 + k * 8, y + 8); ctx.moveTo(x - 6 + k * 8, y - 8); ctx.lineTo(x - 14 + k * 8, y + 8); } ctx.stroke(); }
}
function mrFisch(x, y, s, farbe, dir) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 18, 8, 0, 0, TAU); paint(farbe, INK, 1.2);
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-28, -8); ctx.lineTo(-28, 8); ctx.closePath(); paint(farbe, INK, 1.2);
  circle(10, -2, 2, '#2a2723', null);
  ctx.restore();
}
const mrTurtleX = g => MR_X0 + 200 + 1700 * (0.5 - 0.5 * Math.cos(TAU * g / 480));
function mrUnterwasser(g) {
  const W = MR_X1 - MR_X0, tief = SH_BOT - SH_WY;
  // Fischschwärme (schwimmen nach links), einzelne große Fische nach rechts
  for (let s = 0; s < 3; s++) {
    const bx = MR_X0 + ((s * 900 - g * (3 + s)) % W + W) % W, by = SH_WY + 70 + s * 70;
    for (let k = 0; k < 7; k++) mrFisch(bx + (k % 4) * 34 + (k > 3 ? 17 : 0), by + (k > 3 ? 18 : 0) + Math.sin(g / 10 + k) * 3, 0.7, ['#e0a526', '#9fc4d6', '#d9542b'][s], -1);
  }
  for (let i = 0; i < 4; i++) mrFisch(MR_X0 + ((i * 640 + g * 4) % W), SH_WY + 110 + (i * 47) % (tief - 160), 1.2, i % 2 ? '#7d93a3' : '#5f9a4a', 1);
  // Plastik unter Wasser: Tüten und Flaschen schweben langsam
  for (let i = 0; i < 10; i++) mrPlastik(MR_X0 + 80 + ((i * 263 + g) % (W - 160)), SH_WY + 40 + (i * 61) % (tief - 90) + Math.sin(g / 25 + i) * 6, i, true);
  // Meeresschildkröte
  withAlpha('schildkroete', () => {
    const x = mrTurtleX(g), y = SH_WY + 140, dir = Math.sin(TAU * g / 480) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    for (const [fx, fy] of [[14, 12], [-14, 12], [14, -12], [-14, -12]]) { ctx.beginPath(); ctx.ellipse(fx, fy, 10, 4, fx * fy > 0 ? 0.5 : -0.5, 0, TAU); paint('#7a9a5a', INK, 1.2); }
    ctx.beginPath(); ctx.ellipse(0, 0, 26, 14, 0, 0, TAU); paint('#5f7a3a', INK, 1.5);
    circle(30, -2, 8, '#7a9a5a', INK, 1.2); circle(33, -4, 1.6, '#2a2723', null);
    ctx.restore();
  });
}
function mrMeer(g) {
  const ab = istDunkel();
  ctx.fillStyle = ab ? '#16304a' : '#3f6f8e'; ctx.fillRect(MR_X0, SH_WY, MR_X1 - MR_X0, SH_BOT - SH_WY);
  ctx.fillStyle = '#5b4f45'; ctx.fillRect(MR_X0, SH_BOT - 20, MR_X1 - MR_X0, 20);
  withAlpha('fluegelfrachter', () => mrFrachter(g));
  withAlpha('oceancleanup', () => mrCleanup(g));
  ctx.fillStyle = ab ? 'rgba(20,45,70,0.4)' : 'rgba(70,120,150,0.35)'; ctx.fillRect(MR_X0, SH_WY + 8, MR_X1 - MR_X0, SH_BOT - SH_WY - 28);
  mrUnterwasser(g);
  mrWellen(MR_X0, MR_X1, SH_WY, g, 'rgba(230,245,255,0.7)');
  text('HOHE SEE', MR_X0 + 1600, SH_WY + 150, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(230,245,255,0.25)' });
}
registerRunner({
  room: 'see2', draw(g) { mrMeer(g); },
  glow(g) { glow(MR_FR + MR_FL - 75, SH_WY - 120, 60, 'rgba(255,231,163,0.4)'); glow(MR_ZA + 60, SH_WY - 50, 40, 'rgba(255,231,163,0.5)'); glow(MR_ZB + 60, SH_WY - 50, 40, 'rgba(255,231,163,0.5)'); },
  robot: { id: 'fluegelfrachter', name: 'Frachter mit Flügelsegeln', bereich: 'Mobilität', aera: 'seit 2023', typ: 'Frachtschiff mit starren Segeln', color: '#e6e3da',
    fakt: 'Vorbild ist die Pyxis Ocean, die im August 2023 mit zwei starren Flügelsegeln (WindWings, etwa 37 Meter groß) zu ihrer ersten Reise aufbrach. Ein Computer stellt die Segel passend zum Wind ein. Auf langen Strecken soll das Schiff so etwa drei Tonnen Treibstoff am Tag sparen.',
    echt: 'Echt. Gezeichnet im Maßstab 1 : 12, weil das Schiff 229 Meter lang ist. Die Segel drehen sich hier langsam mit dem Wind.',
    note: 'Fährt auf hoher See, die Wellen ziehen vorbei. Von der Seite sieht man, wie sich die Segel drehen.',
    quelle: 'https://weforum.org/agenda/2023/08/windwings-technology-reduce-cargo-ship-emissions',
    box: () => [MR_FR, SH_WY - 300, MR_FL, 360] },
});
registerRunner({ room: 'see3', draw() {}, robot: { id: 'oceancleanup', name: 'Plastik-Sammelbarriere', bereich: 'Umwelt', aera: 'seit 2023', typ: 'Barriere, von zwei Schiffen gezogen', color: '#f0b429',
  fakt: 'Vorbild ist System 03 von The Ocean Cleanup im Pazifik: Zwei Schiffe ziehen eine etwa 2,2 Kilometer lange Barriere im Schritttempo. Ein Schirm reicht 4 Meter tief. Das Plastik sammelt sich in einem Sack in der Mitte, der an Bord geleert wird. Kameras und KI zeigen, wo das meiste Plastik treibt.',
  echt: 'Echt. Die Barriere ist hier stark verkürzt gezeichnet. Wenn eine Unterwasserkamera ein Tier im Sack sieht, öffnet sich eine Klappe, damit es hinausschwimmen kann – das ist auch echt.',
  note: 'Der Sack füllt sich, wird an Bord gehoben und geleert. Ein Fisch darf durch die Klappe wieder hinaus.',
  quelle: 'https://theoceancleanup.com/updates/system-03-a-beginners-guide/',
  box: () => [MR_ZA, SH_WY - 120, MR_ZB + 230 - MR_ZA, 200] } });

/* ---------- Müllsammel-Roboter im Hafenbecken (Hafenmaßstab 1 : 4) ---------- */
const mrHaiX = g => SH_SX + 30 + 260 * seg(g, 0, 480);   // bleibt links vom Binnenschiff
registerRunner({
  room: 'shliege',
  draw(g) {
    const x = mrHaiX(g), y = SH_WY;
    // Flaschen, die der Roboter einsammelt
    for (let i = 0; i < 3; i++) { const bx = SH_SX + 90 + i * 80; if (bx > x - 10) { box(bx - 4, y - 8, 8, 12, '#9fc4d6', 2, 1); box(bx - 2, y - 11, 4, 3, '#3e6f9e', 0, 0.8); } }
    withAlpha('wasteshark', () => {
      box(x - 16, y - 6, 32, 12, '#e9e9e6', 4, 1.5);
      ctx.fillStyle = '#2a2723'; ctx.fillRect(x + 10, y - 4, 6, 8);
      box(x - 8, y - 14, 14, 8, '#23384d', 2, 1.2);
      circle(x - 1, y - 18, 2, g % 12 < 6 ? '#7fe08a' : '#2d5b33', null);
    });
  },
  robot: { id: 'wasteshark', name: 'Müllsammel-Roboter', bereich: 'Umwelt', aera: 'seit 2022', typ: 'Schwimmender Roboter mit offenem Maul', color: '#e9e9e6',
    fakt: 'Vorbild ist WasteShark von RanMarine. Er schwimmt wie ein kleiner Katamaran durch Häfen und Kanäle und sammelt treibenden Müll in einem Korb mit 180 Litern, bis zu 500 Kilogramm am Tag. Er fährt etwa acht Stunden mit einer Akkuladung, ferngesteuert oder auf einer vorher festgelegten Route.',
    echt: 'Echt. Er fährt zum Beispiel im Hafen von Toronto und in Kanälen in London.',
    note: 'Schwimmt vorn am Schiff entlang und schluckt die Flaschen.',
    quelle: 'https://www.ranmarine.io/news/the-plastic-gobbling-water-robot/',
    box: () => { const x = mrHaiX(state.g); return [x - 20, SH_WY - 22, 40, 30]; } },
});
for (const [key, name] of [['see1', 'Hohe See'], ['see2', 'Hohe See: Frachter'], ['see3', 'Hohe See: Plastik sammeln'], ['see4', 'Hohe See: Barriere']])
  registerRoom({ key, name, level: 'Außengelände', hitOrder: [], robots: [], draw() {} });
registerRunner({ room: 'see1', draw() {}, robot: { id: 'schildkroete', name: 'Meeresschildkröte', bereich: 'Tier', aera: 'Maßstab', typ: 'Tier im Meer', color: '#5f7a3a',
  fakt: 'Meeresschildkröten fressen gern Quallen. Eine treibende Plastiktüte sieht unter Wasser ähnlich aus, darum verschlucken Schildkröten manchmal Plastik. Auch deshalb wird Plastik aus dem Meer gefischt.',
  echt: 'Echt. Hier ist sie größer gezeichnet als im Maßstab der See, damit man sie sieht.', note: 'Schwimmt zwischen den Fischen und den Tüten hin und her.',
  box: () => [mrTurtleX(state.g) - 40, SH_WY + 120, 90, 40] } });
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  schildkroete: 'Schildkröten fressen Quallen. Eine Plastiktüte im Wasser sieht aus wie eine Qualle, darum ist Plastik im Meer gefährlich für sie.',
  fluegelfrachter: 'Dieses riesige Schiff hat Segel aus festem Material. Ein Computer dreht sie in den Wind, so braucht das Schiff weniger Treibstoff.',
  oceancleanup: 'Zwei Schiffe ziehen eine lange Barriere durchs Meer. Das Plastik sammelt sich in einem Sack. Fische dürfen durch eine Klappe wieder hinaus.',
  wasteshark: 'Dieser kleine Roboter schwimmt durch den Hafen und schluckt Flaschen und anderen Müll.',
}));
