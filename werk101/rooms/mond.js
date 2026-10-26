/* Geheime Mondfelder (hoch über der Welt, nur nach dem Hebel in der Satelliten-Werkstatt sichtbar)
   Mond: Südpol-Basis · Hauptfigur: Rover VIPER · Gag: leuchtet mit eigenen Scheinwerfern in den ewig dunklen Krater und bohrt (Bild 18–40)
   Mond: Raumstation Gateway · Hauptfigur: Roboterarm · Gag: fängt den Frachter, obwohl niemand an Bord ist (Bild 20–48)
   Querverweis: Hebel in der Satelliten-Werkstatt (Dach) und Rückflug-Hebel am Lander */
const MBX = rx(roomOf('mond1').c), MBY = ry(roomOf('mond1').r);
const MGX = rx(roomOf('mond2').c), MGY = ry(roomOf('mond2').r);
const MOND_RECT = { x: MBX - 260, y: MGY - 260, w: RW + 520, h: MBY + RH - MGY + 420 };

/* ---------- Kulisse: schwarzer Weltraum hinter beiden Feldern ---------- */
function mondKulisse() {
  const R = MOND_RECT;
  const g = ctx.createLinearGradient(0, R.y + R.h - 160, 0, R.y + R.h);
  ctx.fillStyle = '#07080d'; ctx.fillRect(R.x, R.y, R.w, R.h - 160);
  g.addColorStop(0, '#07080d'); g.addColorStop(1, 'rgba(7,8,13,0)');
  ctx.fillStyle = g; ctx.fillRect(R.x, R.y + R.h - 160, R.w, 160);
  ctx.fillStyle = '#e8e6df';
  for (let i = 0; i < 160; i++) { const s = 1 + (i % 3 === 0); ctx.fillRect(R.x + rnd(i * 3) * R.w, R.y + rnd(i * 3 + 1) * (R.h - 180), s, s); }
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
const ltvX = f => lerp(700, -120, f / 60);

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
  ctx.fillStyle = '#07080d'; ctx.fillRect(0, 0, RW, RH);
  sterne(11, 70, 260);
  // Erde tief am Horizont, halb beleuchtet
  withAlpha('erde', () => {
    circle(560, 268, 24, '#3e6f9e', null);
    ctx.save(); ctx.beginPath(); ctx.arc(560, 268, 24, 0, TAU); ctx.clip();
    ctx.fillStyle = '#7fae6a'; ctx.beginPath(); ctx.ellipse(552, 262, 9, 6, 0.4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f3f1ea'; ctx.beginPath(); ctx.ellipse(566, 252, 10, 3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(7,8,13,0.7)'; ctx.fillRect(560, 240, 30, 60);
    ctx.restore();
  });
  text('SÜDPOL', 250, 64, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(232,230,223,0.13)' });
  // Bergrücken in der Ferne, dann der Boden
  ctx.beginPath(); ctx.moveTo(0, 290); ctx.lineTo(70, 262); ctx.lineTo(150, 280); ctx.lineTo(260, 250); ctx.lineTo(360, 276); ctx.lineTo(470, 258); ctx.lineTo(640, 286); ctx.lineTo(640, 300); ctx.lineTo(0, 300); ctx.closePath();
  paint('#6b6964', null);
  withAlpha('ltv', () => drawLtv(ltvX(f)));
  const gr = ctx.createLinearGradient(0, 296, 0, 400); gr.addColorStop(0, '#9a968f'); gr.addColorStop(1, '#7b7872');
  ctx.fillStyle = gr; ctx.fillRect(0, 296, RW, 104); line(0, 296, RW, 296, INK, 1.5);
  for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.ellipse(rnd(i + 40) * RW, 312 + rnd(i + 70) * 84, 3 + rnd(i) * 8, 1.5 + rnd(i) * 2.5, 0, 0, TAU); ctx.strokeStyle = 'rgba(42,39,35,0.25)'; ctx.lineWidth = 1; ctx.stroke(); }
  // Krater, in den nie die Sonne scheint
  ctx.beginPath(); ctx.ellipse(560, 372, 104, 22, 0, 0, TAU); paint('#16171c', INK, 2);
  ctx.beginPath(); ctx.ellipse(560, 366, 104, 14, 0, Math.PI, TAU); ctx.strokeStyle = '#b5b1a9'; ctx.lineWidth = 2; ctx.stroke();
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
const FR_START = { x: 620, y: 132 }, FR_FANG = { x: 520, y: 150 }, FR_DOCK = { x: 480, y: 204 };
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
      box: f => [MBX + ltvX(f) - 30, MBY + 258, 60, 42] },
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
      box: () => [MBX + 532, MBY + 240, 56, 56] },
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
