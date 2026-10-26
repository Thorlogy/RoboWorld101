/* Geheime Mondfelder (hoch über der Welt, nur nach dem Hebel in der Satelliten-Werkstatt sichtbar)
   Mond: Südpol-Basis · Hauptfigur: Rover VIPER · Gag: leuchtet mit eigenen Scheinwerfern in den ewig dunklen Krater und bohrt (Bild 18–40)
   Mond: Raumstation Gateway · Hauptfigur: Roboterarm · Gag: fängt den Frachter, obwohl niemand an Bord ist (Bild 20–48)
   Querverweis: Hebel in der Satelliten-Werkstatt (Dach) und Rückflug-Hebel am Lander */
const MBX = rx(roomOf('mond1').c), MBY = ry(roomOf('mond1').r);
const MGX = rx(roomOf('mond2').c), MGY = ry(roomOf('mond2').r);
// Mondoberfläche reicht links und rechts weit über das Feld hinaus (MOND_SEITE), unten endet sie als runder Brocken
const MOND_SEITE = 1100, MOND_HY = MBY + 296, MOND_TIEFE = 560;
const MOND_L = MBX - MOND_SEITE, MOND_R = MBX + RW + MOND_SEITE;
const MOND_RECT = { x: MOND_L - 120, y: MGY - 260, w: MOND_R - MOND_L + 240, h: MOND_HY + MOND_TIEFE - MGY + 380 };
// Bergrücken am Horizont: feste Punkte, an den Feldrändern passend zur Zeichnung im Feld
const MOND_RUECKEN = (() => {
  const pts = [];
  for (let x = MOND_L; x < MBX; x += 90) pts.push([x, MBY + 262 + rnd(x * 0.013) * 30]);
  for (const [x, y] of [[0, 290], [70, 262], [150, 280], [260, 250], [360, 276], [470, 258], [640, 286]]) pts.push([MBX + x, MBY + y]);
  for (let x = MBX + RW + 90; x <= MOND_R; x += 90) pts.push([x, MBY + 258 + rnd(x * 0.017) * 34]);
  return pts;
})();
// Große Berge an den Enden (am echten Südpol gibt es hohe Kraterränder und Bergmassive)
const MOND_BERGE = [[MOND_L + 120, 520, 170], [MOND_L + 560, 300, 70], [MOND_R - 700, 360, 90], [MOND_R - 220, 560, 190]];
const MOND_KRATER = [
  [MBX - 260, 40, 120, 22, true], [MBX - 720, 60, 64, 12, false], [MBX - 980, 26, 40, 8, false], [MBX - 470, 86, 30, 6, false],
  [MBX + RW + 860, 40, 120, 22, true], [MBX + RW + 1040, 84, 44, 9, false],
];

function mondBerg(x, w, h) {
  ctx.beginPath(); ctx.moveTo(x - w / 2, MOND_HY); ctx.lineTo(x - w * 0.18, MOND_HY - h); ctx.lineTo(x + w * 0.05, MOND_HY - h * 0.86); ctx.lineTo(x + w * 0.22, MOND_HY - h * 0.95); ctx.lineTo(x + w / 2, MOND_HY); ctx.closePath();
  paint('#625f5a', INK, 1.5);
  ctx.beginPath(); ctx.moveTo(x - w * 0.18, MOND_HY - h); ctx.lineTo(x - w * 0.04, MOND_HY - h * 0.55); ctx.lineTo(x - w / 2 + 10, MOND_HY); ctx.lineTo(x - w / 2, MOND_HY); ctx.closePath();
  ctx.fillStyle = 'rgba(232,230,223,0.18)'; ctx.fill();
}
// Mondauto in Weltkoordinaten, eine Fahrt pro 40 Sekunden (state.g), von Berg zu Berg
const ltvWX = g => lerp(MOND_R - 220, MOND_L + 120, g / 480);

/* ---------- Kulisse: schwarzer Weltraum und breite Mondoberfläche hinter beiden Feldern ---------- */
function mondKulisse() {
  const R = MOND_RECT, F = 240, K = '7,8,13';
  // Weltraum mit weichen Rändern, damit er im Erdhimmel nicht als Kasten erscheint
  const x0 = R.x + F, y0 = R.y + F, x1 = R.x + R.w - F, y1 = R.y + R.h - F;
  // viele ineinanderliegende abgerundete Flächen mit wenig Deckkraft: weicher Rand ohne Nähte
  ctx.fillStyle = `rgba(${K},0.08)`;
  for (let i = 0; i < 40; i++) { const d = i * F / 40; rrect(R.x + d, R.y + d, R.w - 2 * d, R.h - 2 * d, F - d); ctx.fill(); }
  ctx.fillStyle = `rgb(${K})`; rrect(x0, y0, x1 - x0, y1 - y0, 0.01); ctx.fill();
  ctx.fillStyle = '#e8e6df';
  for (let i = 0; i < 260; i++) {
    const s = 1 + (i % 3 === 0), x = x0 - 80 + rnd(i * 3) * (x1 - x0 + 160), y = y0 - 80 + rnd(i * 3 + 1) * (y1 - y0 + 80);
    if (y < MOND_HY - 60 || x < MOND_L - 40 || x > MOND_R + 40) ctx.fillRect(x, y, s, s);
  }
  // Berge an den Enden
  for (const b of MOND_BERGE) mondBerg(...b);
  // Erde tief am Horizont, halb beleuchtet (hinter dem Bergrücken)
  withAlpha('erde', () => {
    const ex = MBX + 560, ey = MBY + 268;
    circle(ex, ey, 24, '#3e6f9e', null);
    ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, 24, 0, TAU); ctx.clip();
    ctx.fillStyle = '#7fae6a'; ctx.beginPath(); ctx.ellipse(ex - 8, ey - 6, 9, 6, 0.4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f3f1ea'; ctx.beginPath(); ctx.ellipse(ex + 6, ey - 16, 10, 3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(7,8,13,0.7)'; ctx.fillRect(ex, ey - 28, 30, 60);
    ctx.restore();
  });
  // Bergrücken
  ctx.beginPath(); ctx.moveTo(MOND_L, MOND_HY + 4); for (const [x, y] of MOND_RUECKEN) ctx.lineTo(x, y); ctx.lineTo(MOND_R, MOND_HY + 4); ctx.closePath();
  paint('#6b6964', null);
  // Mondauto fährt über die ganze Breite und verschwindet an beiden Enden hinter den großen Bergen (FEHLER.md F04)
  withAlpha('ltv', () => { ctx.save(); ctx.translate(0, MBY); drawLtv(ltvWX(state.g)); ctx.restore(); });
  mondBerg(...MOND_BERGE[0]); mondBerg(...MOND_BERGE[3]);
  // Mondbrocken: oben flacher Boden, unten rund
  ctx.beginPath(); ctx.moveTo(MOND_L, MOND_HY);
  ctx.lineTo(MOND_R, MOND_HY);
  ctx.ellipse((MOND_L + MOND_R) / 2, MOND_HY, (MOND_R - MOND_L) / 2, MOND_TIEFE, 0, 0, Math.PI);
  ctx.closePath();
  const gr = ctx.createLinearGradient(0, MOND_HY, 0, MOND_HY + MOND_TIEFE);
  gr.addColorStop(0, '#9a968f'); gr.addColorStop(104 / MOND_TIEFE, '#7b7872'); gr.addColorStop(1, '#55534f');
  ctx.fillStyle = gr; ctx.fill();
  ctx.save(); ctx.clip();
  // Krater auf der Oberfläche, zwei davon ewig im Schatten
  for (const [x, dy, rx_, ry_, dunkel] of MOND_KRATER) {
    const y = MOND_HY + dy;
    ctx.beginPath(); ctx.ellipse(x, y, rx_, ry_, 0, 0, TAU); paint(dunkel ? '#16171c' : '#86837c', INK, dunkel ? 2 : 1.2);
    ctx.beginPath(); ctx.ellipse(x, y - ry_ * 0.35, rx_, ry_ * 0.65, 0, Math.PI, TAU); ctx.strokeStyle = '#b5b1a9'; ctx.lineWidth = dunkel ? 2 : 1.2; ctx.stroke();
  }
  // kleine Krater und Steine
  for (let i = 0; i < 90; i++) {
    const x = MOND_L + rnd(i + 300) * (MOND_R - MOND_L), y = MOND_HY + 12 + rnd(i + 400) * 96;
    if (x > MBX - 10 && x < MBX + RW + 10) continue;
    if (x > MAX + 20 && x < MAX + 300 && y < MOND_HY + 40) continue;   // nicht unter dem Wohnmodul
    if (i % 3) { ctx.beginPath(); ctx.ellipse(x, y, 3 + rnd(i) * 9, 1.5 + rnd(i) * 3, 0, 0, TAU); ctx.strokeStyle = 'rgba(42,39,35,0.25)'; ctx.lineWidth = 1; ctx.stroke(); }
    else { ctx.beginPath(); ctx.ellipse(x, y, 4 + rnd(i + 7) * 5, 3 + rnd(i + 8) * 3, 0, Math.PI, TAU); paint('#8d8a84', INK, 1); }
  }
  // Krater im Inneren des Brockens (nur Andeutung)
  for (let i = 0; i < 40; i++) {
    const x = MOND_L + 80 + rnd(i + 600) * (MOND_R - MOND_L - 160), y = MOND_HY + 150 + rnd(i + 700) * (MOND_TIEFE - 160);
    ctx.beginPath(); ctx.ellipse(x, y, 10 + rnd(i) * 40, 4 + rnd(i) * 12, 0, 0, TAU); ctx.fillStyle = 'rgba(42,39,35,0.12)'; ctx.fill();
  }
  ctx.restore();
  ctx.beginPath(); ctx.ellipse((MOND_L + MOND_R) / 2, MOND_HY, (MOND_R - MOND_L) / 2, MOND_TIEFE, 0, 0, Math.PI); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  line(MOND_L, MOND_HY, MOND_R, MOND_HY, INK, 1.5);
}
function sterne(seed, n, yMax) {
  ctx.fillStyle = '#e8e6df';
  for (let i = 0; i < n; i++) { const s = 1 + (i % 4 === 0); ctx.fillRect(rnd(seed + i * 2) * RW, rnd(seed + i * 2 + 1) * yMax, s, s); }
}

/* ---------- Mond: Südpol-Basis ---------- */
// VIPER: von der Rampe zum Kraterrand (0–18), Licht und Bohrer (18–40), zurück (40–60)
const viperX = f => (f < 18 ? lerp(250, 400, ease(seg(f, 0, 18))) : f < 40 ? 400 : lerp(400, 250, ease(seg(f, 40, 60))));
const viperBohr = f => (f < 22 ? 0 : f < 28 ? ease(seg(f, 22, 28)) : f < 34 ? 1 : f < 40 ? 1 - ease(seg(f, 34, 40)) : 0);
const viperLicht = f => (f < 14 ? 0 : f < 18 ? seg(f, 14, 18) : f < 42 ? 1 : f < 46 ? 1 - seg(f, 42, 46) : 0);
// Mondauto weit hinten: fährt einmal pro Schleife quer durchs Bild

function drawViper(x, f) {
  const y = 352, l = viperLicht(f);
  // Lichtkegel in den Krater
  if (l > 0) {
    ctx.save(); ctx.globalAlpha *= 0.32 * l; ctx.fillStyle = '#fff6c8';
    ctx.beginPath(); ctx.moveTo(x + 52, y - 92); ctx.lineTo(x + 52, y - 84); ctx.lineTo(x + 230, y + 20); ctx.lineTo(x + 230, y - 30); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // Räder (vier, einzeln gelenkt)
  for (const dx of [-38, 38]) { circle(x + dx, y - 10, 11, '#3b3d40'); circle(x + dx, y - 10, 4, '#8a8f94', INK, 1); }
  // Fahrgestell und Körper mit Solarzellen an den Seiten
  box(x - 50, y - 34, 100, 14, '#d6d9dc', 2, 1.8);
  box(x - 46, y - 74, 92, 40, '#23384d', 2, 1.8);
  ctx.strokeStyle = '#3e6f9e'; ctx.lineWidth = 1; ctx.beginPath();
  for (let k = 1; k < 4; k++) { ctx.moveTo(x - 46 + k * 23, y - 74); ctx.lineTo(x - 46 + k * 23, y - 34); }
  ctx.moveTo(x - 46, y - 54); ctx.lineTo(x + 46, y - 54); ctx.stroke();
  box(x - 40, y - 82, 80, 8, '#d6d9dc', 2, 1.5);
  // Mast mit Kameras und Scheinwerfern
  line(x + 30, y - 82, x + 30, y - 132, INK, 4); line(x + 30, y - 82, x + 30, y - 132, '#d6d9dc', 2);
  box(x + 18, y - 146, 30, 14, '#d6d9dc', 2, 1.5); circle(x + 26, y - 139, 3, '#23384d', INK, 1); circle(x + 38, y - 139, 3, '#23384d', INK, 1);
  box(x + 44, y - 96, 10, 12, '#f3f1ea', 2, 1.2); circle(x + 52, y - 90, 3, l > 0.5 ? '#fff6c8' : '#8a8f94', null);
  // Bohrer TRIDENT vorne
  const b = viperBohr(f);
  box(x - 60, y - 70, 10, 34, '#8a8f94', 1, 1.5);
  if (b > 0) { line(x - 55, y - 36, x - 55, y - 36 + 40 * b, INK, 4); line(x - 55, y - 36, x - 55, y - 36 + 40 * b, '#b9bec2', 2); }
  circle(x + 40, y - 78, 2, f % 6 < 3 ? '#7fe08a' : '#2d5b33', null);
}

function drawLander(f) {
  // Unterer Teil eines großen Frachtlanders; der Rest ragt aus dem Bild
  for (const [a, b] of [[20, 0], [150, 170]]) { line(a + 18, 240, b, 352, INK, 6); line(a + 18, 240, b, 352, '#b9bec2', 3); box(b - 12, 350, 24, 6, '#8a8f94', 2, 1.2); }
  box(30, 0, 120, 250, '#e6e3da', 4, 2);
  ctx.fillStyle = '#d6a521'; ctx.fillRect(32, 196, 116, 40); line(30, 196, 150, 196, INK, 1.5); line(30, 236, 150, 236, INK, 1.5);
  ctx.beginPath(); ctx.moveTo(66, 250); ctx.lineTo(114, 250); ctx.lineTo(124, 282); ctx.lineTo(56, 282); ctx.closePath(); paint('#5d6064');
  // Rampe zum Boden
  ctx.beginPath(); ctx.moveTo(150, 218); ctx.lineTo(244, 348); ctx.lineTo(244, 354); ctx.lineTo(150, 226); ctx.closePath(); paint('#8a8f94', INK, 1.5);
  box(40, 30, 100, 150, null, 3, 1.2);
  text('FRACHT', 90, 112, 14, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: 'rgba(42,39,35,0.45)' });
}

function drawLtv(x) {
  // Mondauto ohne Dach, weit hinten und darum klein
  const y = 296;
  for (const dx of [-18, 18]) circle(x + dx, y - 5, 5.5, '#3b3d40', INK, 1.2);
  box(x - 26, y - 14, 52, 7, '#d6d9dc', 1, 1.2);
  box(x - 12, y - 24, 6, 10, '#3b3d40', 1, 1); box(x - 2, y - 24, 6, 10, '#3b3d40', 1, 1);
  line(x + 18, y - 14, x + 18, y - 32, INK, 1.5); box(x + 12, y - 36, 12, 5, '#23384d', 1, 1);
  box(x - 24, y - 30, 14, 4, '#23384d', 1, 1);
}

function drawMondBasis(f) {
  // Himmel, Sterne, Erde, Bergrücken, Mondauto und Boden kommen aus mondKulisse(), damit alles über die Feldgrenzen weiterläuft
  text('SÜDPOL', 250, 64, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(232,230,223,0.13)' });
  for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.ellipse(rnd(i + 40) * RW, 312 + rnd(i + 70) * 84, 3 + rnd(i) * 8, 1.5 + rnd(i) * 2.5, 0, 0, TAU); ctx.strokeStyle = 'rgba(42,39,35,0.25)'; ctx.lineWidth = 1; ctx.stroke(); }
  // Krater, in den nie die Sonne scheint
  ctx.beginPath(); ctx.ellipse(546, 372, 90, 22, 0, 0, TAU); paint('#16171c', INK, 2);
  ctx.beginPath(); ctx.ellipse(546, 366, 90, 14, 0, Math.PI, TAU); ctx.strokeStyle = '#b5b1a9'; ctx.lineWidth = 2; ctx.stroke();
  // Eis glitzert im Licht
  const l = viperLicht(f) * viperBohr(f);
  if (l > 0.3) for (let i = 0; i < 4; i++) { const sx = 530 + i * 18, sy = 372 + (i % 2) * 6; ctx.save(); ctx.globalAlpha = l * (0.5 + 0.5 * Math.sin(f + i)); line(sx - 3, sy, sx + 3, sy, '#bfe8ff', 1.5); line(sx, sy - 3, sx, sy + 3, '#bfe8ff', 1.5); ctx.restore(); }
  withAlpha('mondlander', () => drawLander(f));
  // Rückflug-Hebel am Fuß des Landers
  withAlpha('mondzurueck', () => {
    box(176, 316, 22, 36, '#5d6064', 2, 1.5); box(172, 350, 30, 6, '#3b3d40', 1, 1);
    line(187, 322, 197, 306, INK, 3); circle(197, 306, 4, '#d9542b', INK, 1.2);
    circle(187, 340, 3, f % 12 < 6 ? '#7fd3ff' : '#2d4b5b', null);
  });
  withAlpha('viper', () => drawViper(viperX(f), f));
  ctx.fillStyle = 'rgba(7,8,13,0.25)'; ctx.beginPath(); ctx.ellipse(viperX(f) + 40, 356, 70, 4, 0, 0, TAU); ctx.fill();
}

/* ---------- Mond: Raumstation Gateway ---------- */
// Frachter: nähert sich (0–20), wird gefangen (20–28), angesetzt (28–42), bleibt (42–48), wird losgelassen und treibt zurück (48–60)
const FR_START = { x: 580, y: 132 }, FR_FANG = { x: 520, y: 150 }, FR_DOCK = { x: 480, y: 204 };
const frachter = f => (f < 20 ? mix(FR_START, FR_FANG, ease(seg(f, 0, 20))) : f < 28 ? FR_FANG : f < 42 ? mix(FR_FANG, FR_DOCK, ease(seg(f, 28, 42))) : f < 48 ? FR_DOCK : mix(FR_DOCK, FR_START, ease(seg(f, 48, 60))));
const armZiel = f => { const p = frachter(f); if (f >= 20 && f < 52) return { x: p.x - 30, y: p.y - 18 }; const ruhe = { x: 400, y: 118 }; return f < 20 ? mix(ruhe, { x: FR_FANG.x - 30, y: FR_FANG.y - 18 }, ease(seg(f, 10, 20))) : mix({ x: FR_START.x - 30, y: FR_START.y - 18 }, ruhe, ease(seg(f, 52, 60))); };

function drawGateway(f) {
  ctx.fillStyle = '#07080d'; ctx.fillRect(0, 0, RW, RH);
  sterne(53, 90, 330);
  text('MONDUMLAUFBAHN', 24, 54, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(232,230,223,0.13)' });
  // Mondrand unten
  ctx.save(); ctx.beginPath(); ctx.arc(320, 1330, 1000, 0, TAU); ctx.clip();
  ctx.fillStyle = '#9a968f'; ctx.fillRect(0, 300, RW, 100);
  for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse(rnd(i + 5) * RW, 344 + rnd(i + 9) * 50, 6 + rnd(i) * 18, 2 + rnd(i) * 4, 0, 0, TAU); ctx.fillStyle = 'rgba(42,39,35,0.18)'; ctx.fill(); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(320, 1330, 1000, Math.PI * 1.3, Math.PI * 1.7); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  withAlpha('gateway', () => {
    // Antriebsmodul mit großen Solarflügeln
    box(120, 182, 60, 44, '#d6a521', 3, 2);
    for (const s of [-1, 1]) {
      const y0 = s < 0 ? 70 : 234;
      box(132, y0, 36, 104, '#23384d', 1, 1.5);
      ctx.strokeStyle = '#3e6f9e'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 5; k++) { ctx.moveTo(132, y0 + k * 21); ctx.lineTo(168, y0 + k * 21); } ctx.stroke();
      line(150, s < 0 ? 174 : 234, 150, s < 0 ? 182 : 226, INK, 3);
    }
    box(96, 192, 24, 24, '#8a8f94', 2, 1.5); box(84, 196, 12, 16, '#5d6064', 1, 1.2);
    // Wohnmodule
    box(180, 186, 110, 36, '#eef0f0', 14, 2); for (const x of [204, 232, 260]) box(x, 196, 12, 10, '#23384d', 2, 1);
    box(290, 184, 96, 40, '#f3f1ea', 14, 2); for (const x of [312, 344]) box(x, 196, 12, 10, '#23384d', 2, 1);
    box(386, 190, 36, 28, '#d6d9dc', 6, 1.8);
    box(422, 194, 22, 20, '#8a8f94', 3, 1.5);
    text('OHNE BESATZUNG', 238, 246, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#9fc4d6' });
  });
  // Frachter ohne Besatzung
  withAlpha('frachter', () => {
    const p = frachter(f);
    box(p.x - 30, p.y - 14, 60, 28, '#e6e3da', 6, 1.8);
    box(p.x + 30, p.y - 10, 16, 20, '#8a8f94', 2, 1.5);
    box(p.x - 22, p.y - 32, 44, 16, '#23384d', 1, 1.2); box(p.x - 22, p.y + 16, 44, 16, '#23384d', 1, 1.2);
    line(p.x - 34, p.y, p.x - 30, p.y, INK, 3);
    circle(p.x - 26, p.y - 18, 3, '#8a8f94', INK, 1);
    circle(p.x + 22, p.y - 6, 2, f % 8 < 4 ? '#ff5a50' : '#5a1c1c', null);
  });
  // Roboterarm auf dem Wohnmodul
  withAlpha('canadarm', () => {
    const S = { x: 300, y: 184 }, T = armZiel(f);
    const E = ik2(S, T, 120, 120);
    box(290, 172, 20, 12, '#8a8f94', 2, 1.5);
    limb(S.x, S.y, E.x, E.y, 8, '#f3f1ea'); limb(E.x, E.y, T.x, T.y, 8, '#f3f1ea');
    circle(S.x, S.y, 6, '#5d6064'); circle(E.x, E.y, 6, '#5d6064'); circle(T.x, T.y, 5, '#5d6064');
    const zu = f >= 20 && f < 50;
    line(T.x, T.y, T.x + 6, T.y + (zu ? 4 : 8), INK, 2.5); line(T.x, T.y, T.x + 8, T.y + (zu ? -1 : -4), INK, 2.5);
  });
}

registerRoom({
  key: 'mond1', name: 'Mond: Südpol-Basis', level: 'Mond',
  hitOrder: ['mondzurueck', 'viper', 'ltv', 'mondlander', 'erde'],
  draw: drawMondBasis,
  robots: [
    { id: 'viper', name: 'Mond-Rover VIPER', bereich: 'Raumfahrt', aera: 'Start 2027', typ: 'Rover, so groß wie ein Golfwagen',
      fakt: 'Der Rover VIPER der NASA soll 2027 am Südpol des Mondes landen und dort mehr als 30 Kilometer weit fahren. In Kratern, in die nie die Sonne scheint, sucht er nach gefrorenem Wasser. Dafür hat er eigene Scheinwerfer und einen Bohrer, der einen Meter tief in den Boden reicht.',
      echt: 'Den Rover gibt es, er wird gerade getestet. Ob er im Krater wirklich Eis findet, weiß noch niemand.',
      note: 'Fährt an den dunklen Krater, schaltet die Scheinwerfer an und bohrt nach Eis.', color: '#23384d',
      quelle: 'https://www.nasa.gov/missions/moon-base/nasa-provides-progress-update-on-moon-base-rovers/',
      box: f => [MBX + viperX(f) - 64, MBY + 204, 124, 152] },
    { id: 'ltv', name: 'Mondauto', bereich: 'Raumfahrt', aera: 'ab 2028', typ: 'Offenes Mondfahrzeug, ferngesteuert',
      fakt: 'Für die Mondbasis lässt die NASA offene Mondautos bauen, unter anderem von den Firmen Astrolab und Lunar Outpost. Sie sollen bis 2028 am Südpol ankommen. Wenn keine Astronauten da sind, steuert man sie von der Erde aus, und sie erkunden bis zu 6 Kilometer am Tag.',
      echt: 'Noch in Entwicklung. Es fährt hier weit hinten und ist darum so klein. Ein Funkbefehl von der Erde braucht gut eine Sekunde, bis er am Mond ankommt.',
      note: 'Fährt ohne Fahrer am Horizont entlang, gesteuert von der Erde.', color: '#d6d9dc',
      quelle: 'https://www.nasa.gov/missions/moon-base/nasa-provides-progress-update-on-moon-base-rovers/',
      rand: 'fährt über die ganze Mondoberfläche und verschwindet hinter den Bergen',
      box: () => { const x = ltvWX(state.g); return [x - 30, MBY + 258, 60, 42]; } },
    { id: 'mondlander', name: 'Frachtlander', bereich: 'Raumfahrt', aera: 'ab 2027', typ: 'Landefähre ohne Besatzung',
      fakt: 'VIPER fliegt mit dem Mondlander Blue Moon Mark 1 der Firma Blue Origin zum Mond. Solche Lander landen ganz ohne Menschen an Bord und bringen Fracht und Rover zur Mondoberfläche.',
      echt: 'Der Lander ist viel höher als das Bild, darum sieht man nur seinen unteren Teil. Wie der Rover genau herunterfährt, ist hier vereinfacht.',
      note: 'Hat den Rover gebracht. Über die Rampe ist er hinuntergefahren.', color: '#e6e3da',
      quelle: 'https://www.nasa.gov/missions/moon-base/nasa-provides-progress-update-on-moon-base-rovers/',
      box: () => [MBX + 10, MBY, 240, 356] },
    { id: 'erde', name: 'Erde am Horizont', bereich: 'Raumfahrt', aera: 'immer', typ: 'Unser Planet, 384.000 km entfernt',
      fakt: 'Vom Südpol des Mondes aus steht die Erde immer tief am Horizont und taucht manchmal dahinter ab. Auch die Sonne kommt dort nie mehr als anderthalb Grad über den Horizont. Deshalb liegen manche Kraterböden immer im Schatten.',
      echt: 'Stimmt. Die Erde ist hier größer gezeichnet, als man sie vom Mond aus sehen würde.',
      note: 'Von hier aus ist sie nur ein kleiner Ball über den Bergen.', color: '#3e6f9e',
      quelle: 'https://svs.gsfc.nasa.gov/4944',
      box: () => [MBX + 532, MBY + 240, 56, 56] },   // Erde wird in mondKulisse() gezeichnet
    { id: 'mondzurueck', name: 'Hebel für den Rückflug', bereich: 'Raumfahrt', aera: 'geheim', typ: 'Hebel am Lander',
      fakt: 'Von der Erde bis zum Mond sind es im Mittel rund 384.000 Kilometer. Die Astronauten von Apollo 11 brauchten 1969 etwa drei Tage für den Weg.',
      echt: 'Erfunden. Teleportieren kann man Menschen und Roboter nicht. Wer den Hebel umlegt, ist aber trotzdem sofort wieder in der Satelliten-Werkstatt.',
      note: 'Umlegen: zurück zur Erde.', color: '#d9542b',
      onSelect: () => window.mondReise && window.mondReise('satellit'),
      box: () => [MBX + 168, MBY + 300, 38, 58] },
  ],
});

registerRoom({
  key: 'mond2', name: 'Mond: Raumstation Gateway', level: 'Mondumlaufbahn',
  hitOrder: ['canadarm', 'frachter', 'gateway'],
  draw: drawGateway,
  robots: [
    { id: 'canadarm', name: 'Roboterarm Canadarm3', bereich: 'Raumfahrt', aera: 'geplant', typ: 'Roboterarm für die Mondstation',
      fakt: 'Kanada hat für Gateway den Roboterarm Canadarm3 geplant: einen großen Arm und einen kleineren, geschickten Arm. Er sollte die Station warten, Teile anbauen und ankommende Raumschiffe fangen, auch ganz allein, wenn niemand an Bord ist.',
      echt: 'So war es geplant. Seit Gateway 2026 angehalten wurde, wird überlegt, wie der Arm stattdessen auf dem Mondboden helfen kann. Seine Vorgänger fangen schon heute Frachter an der Internationalen Raumstation.',
      note: 'Fängt den Frachter und setzt ihn an. Niemand muss dafür an Bord sein.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Canadarm3',
      box: f => { const T = armZiel(f), E = ik2({ x: 300, y: 184 }, T, 120, 120); const xs = [300, E.x, T.x], ys = [184, E.y, T.y]; const x0 = Math.min(...xs) - 12, y0 = Math.min(...ys) - 12; return [MGX + x0, MGY + y0, Math.max(...xs) - x0 + 12, Math.max(...ys) - y0 + 12]; } },
    { id: 'frachter', name: 'Frachter', bereich: 'Raumfahrt', aera: 'Versorgung', typ: 'Raumschiff ohne Besatzung',
      fakt: 'Frachtschiffe ohne Besatzung bringen Wasser, Essen, Kleidung und Ersatzteile zu Raumstationen. An der Internationalen Raumstation fängt ein Roboterarm viele von ihnen ein und setzt sie an einer Luke an.',
      echt: 'Für Gateway war ein solcher Frachter geplant. Hier wird er immer wieder losgelassen, damit die Szene von vorn beginnt.',
      note: 'Kommt angeflogen, lässt sich fangen und treibt am Ende wieder weg.', color: '#e6e3da',
      quelle: 'https://en.wikipedia.org/wiki/Canadarm2',
      box: f => { const p = frachter(f); return [MGX + p.x - 36, MGY + p.y - 34, 84, 68]; } },
    { id: 'gateway', name: 'Raumstation Gateway', bereich: 'Raumfahrt', aera: 'pausiert seit 2026', typ: 'Geplante Station in der Mondumlaufbahn',
      fakt: 'Gateway sollte eine kleine Raumstation werden, die um den Mond kreist. Die USA, Europa, Japan, Kanada und die Vereinigten Arabischen Emirate bauten Teile dafür. Im März 2026 hat die NASA die Arbeit an Gateway angehalten und plant zuerst eine Basis auf dem Mondboden.',
      echt: 'Gezeichnet ist, wie Gateway geplant war. Gebaut ist die Station noch nicht, und ob sie kommt, ist offen. Teile davon sollen für andere Aufgaben genutzt werden.',
      note: 'Die meiste Zeit wäre niemand an Bord gewesen. Die Station sollte sich selbst überwachen.', color: '#d6a521',
      quelle: 'https://en.wikipedia.org/wiki/Lunar_Gateway',
      box: () => [MGX + 80, MGY + 66, 370, 276] },
  ],
});

/* ---------- Mond: Basis-Ausbau (rechts neben der Südpol-Basis) ----------
   Hauptfigur: Roboterarm auf dem Boden · Gag: hebt Kiste für Kiste vom Lander ins leere Wohnmodul, die Tür schluckt sie (Bild 8–54)
   Das Feld malt keinen eigenen Himmel und Boden: Berge, Rücken und Boden kommen aus mondKulisse(), damit alles nahtlos weiterläuft. */
const MAX = rx(roomOf('mond3').c), MAY = ry(roomOf('mond3').r);
const MA_S = { x: 340, y: 250 }, MA_RUHE = { x: 420, y: 170 }, MA_PICK = { x: 540, y: 198 }, MA_HOCH = { x: 430, y: 130 }, MA_AB = { x: 306, y: 258 };
const maZiel = f => (f < 8 ? mix(MA_RUHE, MA_PICK, ease(seg(f, 0, 8))) : f < 12 ? MA_PICK : f < 21 ? mix(MA_PICK, MA_HOCH, ease(seg(f, 12, 21))) : f < 30 ? mix(MA_HOCH, MA_AB, ease(seg(f, 21, 30))) : f < 34 ? MA_AB : f < 50 ? mix(MA_AB, MA_RUHE, ease(seg(f, 34, 50))) : MA_RUHE);
// Kiste: auf dem Lander (vor Bild 12), am Arm (12–30), vor der Tür (30–38), rutscht hinein (38–48)
// Ellbogen immer oben (ik2 knickt bei Zielen links vom Schultergelenk nach unten)
function maEllbogen(S, W) {
  const L = 130, dx = W.x - S.x, dy = W.y - S.y, d = clamp(Math.hypot(dx, dy), 10, 2 * L - 0.5);
  const a = Math.atan2(dy, dx), b = Math.acos(clamp(d / (2 * L), -1, 1));
  const e1 = { x: S.x + L * Math.cos(a - b), y: S.y + L * Math.sin(a - b) }, e2 = { x: S.x + L * Math.cos(a + b), y: S.y + L * Math.sin(a + b) };
  return e1.y < e2.y ? e1 : e2;
}
const maKiste = f => (f < 12 ? null : f < 30 ? { x: maZiel(f).x, y: maZiel(f).y + 16 } : f < 38 ? { x: MA_AB.x, y: MA_AB.y + 16 } : f < 48 ? { x: lerp(MA_AB.x, 236, ease(seg(f, 38, 48))), y: MA_AB.y + 16 } : null);
const maTuer = f => (f < 32 ? 0 : f < 38 ? ease(seg(f, 32, 38)) : f < 48 ? 1 : f < 54 ? 1 - ease(seg(f, 48, 54)) : 0);
const maNachschub = f => (f < 44 ? 0 : f < 58 ? ease(seg(f, 44, 58)) : 1);

function maKisteMalen(x, y) {
  box(x - 18, y - 13, 36, 26, '#e6e3da', 2, 1.6);
  ctx.fillStyle = '#d6a521'; ctx.fillRect(x - 17, y - 3, 34, 6); line(x - 18, y - 3, x + 18, y - 3, INK, 1); line(x - 18, y + 3, x + 18, y + 3, INK, 1);
}
function drawMondAusbau(f) {
  text('BASIS', 40, 64, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(232,230,223,0.13)' });
  // Solartürme in der Ferne, Kabel zum Wohnmodul
  withAlpha('solarturm', () => {
    for (const [x, top] of [[400, 96], [572, 120]]) {
      line(x, 274, x, top, INK, 4); line(x, 274, x, top, '#b9bec2', 2);
      box(x - 13, top - 4, 26, 112, '#23384d', 1, 1.5);
      ctx.strokeStyle = '#3e6f9e'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 7; k++) { ctx.moveTo(x - 13, top - 4 + k * 16); ctx.lineTo(x + 13, top - 4 + k * 16); } ctx.stroke();
      box(x - 8, 270, 16, 6, '#8a8f94', 1, 1.2);
      circle(x, top - 10, 2, f % 12 < 6 ? '#ff5a50' : '#5a1c1c', null);
    }
    ctx.strokeStyle = 'rgba(42,39,35,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(400, 276); ctx.quadraticCurveTo(320, 304, 250, 300); ctx.moveTo(572, 278); ctx.quadraticCurveTo(450, 312, 250, 302); ctx.stroke();
  });
  // Wohnmodul: liegender Zylinder auf Beinen, Luftschleuse rechts
  withAlpha('wohnmodul', () => {
    for (const x of [56, 120, 184, 236]) { line(x, 280, x - 6, 306, INK, 5); line(x, 280, x - 6, 306, '#b9bec2', 2.5); box(x - 14, 304, 16, 5, '#8a8f94', 1, 1); }
    box(24, 196, 236, 88, '#eef0f0', 40, 2.2);
    for (const x of [70, 120, 170]) { box(x - 12, 222, 24, 16, '#23384d', 4, 1.2); }
    ctx.fillStyle = f % 30 < 24 ? 'rgba(255,230,150,0.9)' : 'rgba(255,230,150,0.5)'; ctx.fillRect(160, 225, 20, 10);   // nur ein Licht an: alles wird vorbereitet
    line(40, 258, 244, 258, '#d6a521', 3);
    text('WOHNMODUL', 120, 274, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#5d5a55' });
    // Schleuse mit Tür, die nach oben gleitet
    box(232, 214, 52, 76, '#d6d9dc', 6, 2);
    ctx.fillStyle = '#16171c'; ctx.fillRect(244, 238, 30, 48);
    const t = maTuer(f);
    box(244, 238 - 44 * t, 30, 48, '#8a8f94', 2, 1.5);
    line(259, 244 - 44 * t, 259, 280 - 44 * t, '#5d6064', 1.5);
    box(250, 290, 26, 10, '#8a8f94', 1, 1.2);
  });
  // Kleiner Frachtlander mit Luke, aus der die nächste Kiste hochfährt
  box(476, 224, 128, 14, '#d6d9dc', 2, 1.8);
  for (const [a, b] of [[486, 470], [594, 612]]) { line(a, 236, b, 298, INK, 5); line(a, 236, b, 298, '#b9bec2', 2.5); box(b - 10, 296, 20, 5, '#8a8f94', 1, 1); }
  box(500, 238, 80, 34, '#e6e3da', 3, 1.8); ctx.beginPath(); ctx.moveTo(522, 272); ctx.lineTo(558, 272); ctx.lineTo(564, 288); ctx.lineTo(516, 288); ctx.closePath(); paint('#5d6064');
  ctx.save(); ctx.beginPath(); ctx.rect(470, 0, 160, 224); ctx.clip();
  if (f < 12) maKisteMalen(MA_PICK.x, MA_PICK.y + 13);
  else maKisteMalen(MA_PICK.x, MA_PICK.y + 13 + 26 * (1 - maNachschub(f)));
  ctx.restore();
  // Kiste unterwegs (am Ende in der Tür verschwunden)
  const k = maKiste(f);
  if (k) { ctx.save(); ctx.beginPath(); ctx.rect(244, 0, RW, RH); ctx.clip(); maKisteMalen(k.x, k.y); ctx.restore(); }
  // Roboterarm auf einem Sockel
  withAlpha('mondarm', () => {
    box(318, 262, 44, 38, '#8a8f94', 3, 2); box(310, 296, 60, 8, '#5d6064', 2, 1.5);
    const T = maZiel(f), E = maEllbogen(MA_S, T);
    limb(MA_S.x, MA_S.y, E.x, E.y, 9, '#f3f1ea'); limb(E.x, E.y, T.x, T.y, 8, '#f3f1ea');
    circle(MA_S.x, MA_S.y, 7, '#5d6064'); circle(E.x, E.y, 6, '#5d6064'); circle(T.x, T.y, 5, '#5d6064');
    const zu = f >= 8 && f < 32;
    line(T.x - 4, T.y, T.x - (zu ? 6 : 10), T.y + 10, INK, 2.5); line(T.x + 4, T.y, T.x + (zu ? 6 : 10), T.y + 10, INK, 2.5);
    circle(352, 272, 2.5, f % 6 < 3 ? '#7fe08a' : '#2d5b33', null);
  });
}

registerRoom({
  key: 'mond3', name: 'Mond: Basis-Ausbau', level: 'Mond',
  hitOrder: ['mondarm', 'wohnmodul', 'solarturm'],
  draw: drawMondAusbau,
  robots: [
    { id: 'mondarm', name: 'Roboterarm auf dem Mondboden', bereich: 'Raumfahrt', aera: 'geplant', typ: 'Canadarm3 für die Mondbasis',
      fakt: 'Der Roboterarm Canadarm3 aus Kanada war für die Station Gateway gebaut worden. Seit die NASA Gateway 2026 angehalten hat, wird er für den Mondboden umgeplant: Er soll Module von Landern abladen und die Basis warten.',
      echt: 'So ist es geplant, aber noch nicht genau festgelegt. Wie der Arm auf dem Mond steht, ist hier ausgedacht: Er sitzt auf einem einfachen Sockel.',
      note: 'Hebt Kiste für Kiste vom Lander und stellt sie vor die Tür des Wohnmoduls.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Canadarm3',
      box: f => { const T = maZiel(f), E = maEllbogen(MA_S, T); const xs = [MA_S.x, E.x, T.x, 310, 370], ys = [MA_S.y, E.y, T.y, 304]; const x0 = Math.min(...xs) - 10, y0 = Math.min(...ys) - 10; return [MAX + x0, MAY + y0, Math.max(...xs) - x0 + 10, Math.max(...ys) - y0 + 10]; } },
    { id: 'wohnmodul', name: 'Wohnmodul', bereich: 'Raumfahrt', aera: 'vor 2030', typ: 'Erstes Haus auf dem Mond',
      fakt: 'Die NASA will vor 2030 ein erstes Wohnmodul auf den Mond bringen. Ab 2027 sollen dafür fast jeden Monat Lander Ausrüstung liefern. Roboter und ferngesteuerte Fahrzeuge bereiten alles vor, bevor Menschen kommen.',
      echt: 'Wie das Wohnmodul aussehen wird, steht noch nicht fest. Hier ist es ein liegender Zylinder mit Schleuse, wie viele Entwürfe.',
      note: 'Noch wohnt niemand hier. Nur ein Licht brennt, und die Tür öffnet sich für jede Kiste.', color: '#eef0f0',
      quelle: 'https://starlust.org/nasa-pauses-gateway-lunar-space-station-for-artemis-shifts-focus-to-20-billion-moon-base/',
      box: () => [MAX + 20, MAY + 192, 268, 116] },
    { id: 'solarturm', name: 'Solartürme', bereich: 'Energie', aera: 'Ende der 2020er', typ: 'Senkrechte Solarzellen auf hohen Masten',
      fakt: 'Am Südpol des Mondes steht die Sonne immer ganz flach. Liegende Solarzellen bekämen kaum Licht, und Berge werfen lange Schatten. Darum lässt die NASA Solartürme entwickeln: Die Zellen hängen senkrecht an einem Mast, der bis zu etwa 10 Meter hoch ausfährt.',
      echt: 'Die Türme stehen hier weit hinten auf dem Bergrücken und sehen darum klein aus. Drei Firmen bauen Entwürfe; einer soll gegen Ende des Jahrzehnts am Südpol stehen.',
      note: 'Fangen das flache Sonnenlicht ein und schicken den Strom per Kabel zum Wohnmodul.', color: '#23384d',
      quelle: 'https://www.nasa.gov/news-release/three-companies-to-help-nasa-advance-solar-array-technology-for-moon',
      box: () => [MAX + 380, MAY + 80, 210, 200] },
  ],
});

/* ---------- Reise: Hebel in der Satelliten-Werkstatt bringt zum Mond, Hebel am Lander zurück ---------- */
try { state.mond = localStorage.getItem('werk101-mond') === '1'; } catch (e) { state.mond = false; }
window.mondBlitzStart = 0;
function mondBlitz() {
  const t = (performance.now() - window.mondBlitzStart) / 900;
  if (!window.mondBlitzStart || t >= 1) return;
  const a = t < 0.4 ? t / 0.4 : 1 - (t - 0.4) / 0.6;
  const dpr = window.devicePixelRatio || 1, w = canvas.width / dpr, h = canvas.height / dpr;
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
  g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, `rgba(127,211,255,${a * 0.85})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
window.mondReise = function (ziel) {
  const zumMond = ziel !== 'satellit';
  const key = zumMond ? 'mond1' : 'satellit';
  if (zumMond && !state.mond) {
    state.mond = true;
    try { localStorage.setItem('werk101-mond', '1'); } catch (e) {}
    ROOMS.filter(o => o.mond).forEach(o => { const b = document.querySelector(`#rooms button[data-key="${o.built}"]`); if (b) b.hidden = false; });
    if (typeof raumListeFiltern === 'function') raumListeFiltern();
  }
  const springen = () => { state.room = key; state.sel = null; if (typeof renderPanel === 'function') renderPanel(); fitRoom(key, false); state.dirty = true; };
  const t = document.querySelector('.toast');
  if (t) { t.textContent = zumMond ? 'Teleport zum Mond!' : 'Zurück auf der Erde.'; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2600); }
  if (reduce) { setTimeout(springen, 0); return; }
  window.mondBlitzStart = performance.now();
  setTimeout(springen, 360);
  const lauf = () => { state.dirty = true; if (performance.now() - window.mondBlitzStart < 950) requestAnimationFrame(lauf); };
  requestAnimationFrame(lauf);
};
