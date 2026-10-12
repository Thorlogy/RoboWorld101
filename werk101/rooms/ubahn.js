/* Raum: U-Bahnhof (UG 1, rechts neben dem Haus, unter der Erde)
   Hauptfigur: fahrerlose U-Bahn · Gag: Weil vorn kein Fahrerstand ist, drückt sich ein Kind an der Frontscheibe die Nase platt
   Läuft auf der globalen Uhr state.g: Zug fährt ein (0–40), hält (40–200), fährt weiter (200–260). Querverweis: Schulklasse steigt aus und geht die Treppe hoch zum Schulweg */
const UBX = rx(roomOf('ubahn').c), UBY = ry(roomOf('ubahn').r);
const UB_PLAT = 330, UB_STOP = 10;
// Wagen in echter Größe zu den Menschen: 320 lang, Dach bei y 150 (gut doppelt so hoch wie ein Mensch)
const UB_L = 320, UB_TOP = 150, UB_DOORS = [0.27, 0.73];
function ubTrainX(g) {
  g %= 480;
  if (g < 40) return lerp(720, UB_STOP, 1 - (1 - seg(g, 0, 40)) ** 2);
  if (g < 200) return UB_STOP;
  if (g < 260) return lerp(UB_STOP, -1500, seg(g, 200, 260) ** 2);
  // kommt von rechts durch den Tunnel unter der Schule (gleiche Geschwindigkeit wie beim Einfahren)
  if (g >= 400) return lerp(720 + 35.5 * 80, 720, seg(g, 400, 480));
  return -1500;
}
const UB_CARS = 4, UB_LEN = UB_CARS * UB_L - 10;
const ubDoorX = (car, k) => UB_STOP + car * UB_L + UB_DOORS[k] * (UB_L - 10);
// ganzer Zug, x in Raumkoordinaten des Feldes, in dem gezeichnet wird
function ubTrain(x, g) {
  const open = ubDoor(g);
  for (let i = 0; i < UB_CARS; i++) {
    ubCar(x + i * UB_L, i === 0, open, i);
    if (i > 0) { ctx.fillStyle = '#3b3d40'; ctx.fillRect(x + i * UB_L - 10, 230, 10, 80); }
  }
  // Kind an der Frontscheibe, weil vorn kein Fahrer sitzt
  const kx = x + 30, ky = 248;
  circle(kx, ky, 11, '#e2b48f', INK, 1.2); ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.arc(kx, ky - 3, 11, Math.PI, TAU); ctx.fill();
  for (const dy of [-8, 8]) circle(kx - 14, ky + 10 + dy, 4, '#e2b48f', INK, 1);
  circle(kx - 9, ky + 2, 2.5, '#d98f8f', null);
}
const ubDoor = g => { g %= 480; return g < 50 || g >= 170 ? 0 : g < 58 ? seg(g, 50, 58) : g < 162 ? 1 : 1 - seg(g, 162, 170); };
function ubCar(x, front, open, idx) {
  const L = UB_L - 10, T = UB_TOP, B = 338;
  ctx.beginPath();
  if (front) { ctx.moveTo(x + L, T); ctx.lineTo(x + 40, T); ctx.quadraticCurveTo(x, T + 8, x, T + 60); ctx.lineTo(x, B); ctx.lineTo(x + L, B); }
  else { ctx.moveTo(x, T); ctx.lineTo(x + L, T); ctx.lineTo(x + L, B); ctx.lineTo(x, B); }
  ctx.closePath(); paint('#f3f1ea', INK, 2);
  ctx.fillStyle = '#d9542b'; ctx.fillRect(x + (front ? 4 : 0), 304, front ? L - 4 : L, 8);
  box(x + 20, T - 8, L - 40, 8, '#c9ccd0', 2, 1.2);
  // Fenster zwischen den Türen, darin Fahrgäste
  const hair = ['#3a2c22', '#d6d2c8', '#8a5a2b', '#2a1f18', '#c9a46a', '#7a4a2a'];
  const wins = [[front ? 60 : 14, 0.27 * L - 40], [0.27 * L + 36, 0.73 * L - 36], [0.73 * L + 40, L - 14]];
  wins.forEach(([a, b], k) => { if (b - a < 20) return; box(x + a, 180, b - a, 70, '#9fc4d6', 4, 1.2);
    if (k === 1) for (let j = 0; j < 2; j++) { const hx = x + a + 24 + j * 46; circle(hx, 226, 10, '#e2b48f', INK, 1); ctx.beginPath(); ctx.arc(hx, 223, 10, Math.PI, TAU); ctx.fillStyle = hair[(idx * 2 + j) % hair.length]; ctx.fill(); box(hx - 12, 236, 24, 14, ['#3e6f9e', '#d9542b', '#5f9a4a', '#f0b429'][(idx + j) % 4], 3, 1); } });
  // zwei Doppeltüren
  for (const k of UB_DOORS) {
    const d = x + k * L, w = 26 * (1 - open);
    if (open > 0.05) { ctx.fillStyle = '#cfd6d9'; ctx.fillRect(d - 26 + w, 172, 52 - 2 * w, B - 172); }
    box(d - 26, 172, w, B - 172, '#e6e3da', 1, 1.2); box(d + 26 - w, 172, w, B - 172, '#e6e3da', 1, 1.2);
    if (w > 6) { ctx.fillStyle = 'rgba(159,196,214,0.8)'; ctx.fillRect(d - 22, 184, w - 6, 60); ctx.fillRect(d + 30 - w, 184, w - 6, 60); }
  }
  for (const wx of [40, L - 40]) { circle(x + wx, 346, 10, '#2d2f33'); circle(x + wx, 346, 4, '#8a8f94', null); }
  if (front) {
    ctx.beginPath(); ctx.moveTo(x + 44, T + 10); ctx.quadraticCurveTo(x + 10, T + 16, x + 10, T + 62); ctx.lineTo(x + 10, 280); ctx.lineTo(x + 52, 280); ctx.lineTo(x + 52, T + 10); ctx.closePath(); paint('#9fc4d6', INK, 1.5);
    box(x + 4, 290, 12, 8, '#fff3c4', 1, 1);
  }
}
function drawUbahn(f) {
  const g = state.g;
  ctx.fillStyle = '#e6e1d6'; ctx.fillRect(0, 0, RW, RH);
  ctx.strokeStyle = 'rgba(42,39,35,0.08)'; ctx.lineWidth = 1;
  for (let y = 60; y < UB_PLAT; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(RW, y); ctx.stroke(); }
  ctx.fillStyle = '#9a958c'; ctx.fillRect(0, 0, RW, 40); line(0, 40, RW, 40, INK, 2);
  for (const x of [120, 360, 600]) { box(x - 26, 40, 52, 6, '#f3efe4', 1, 1); }
  // Gleisbett und Bahnsteig
  ctx.fillStyle = '#5c5953'; ctx.fillRect(0, 342, RW, 58);
  for (let x = 6; x < RW; x += 26) box(x, 382, 16, 6, '#7a6450', 0, 1);
  line(0, 378, RW, 378, '#8a8f94', 4);
  // Schild und Anzeige
  box(140, 74, 150, 34, '#f3f1ea', 3, 1.5); box(146, 79, 24, 24, '#3e6f9e', 3, 1); text('U', 158, 98, 20, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#fff' });
  text('Werk 101', 180, 99, 20, { family: '"Saira Condensed", sans-serif', weight: 700 });
  const gg = g % 480, msg = gg < 40 ? 'Zug fährt ein' : gg < 162 ? 'Bitte einsteigen' : gg < 200 ? 'Türen schließen' : gg < 260 ? 'Zug fährt ab' : `Nächster Zug ${Math.ceil((480 - gg) / 12)} s`;
  box(400, 70, 190, 36, '#23384d', 3, 1.5); text(msg, 495, 94, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#ffb347' });
  line(440, 40, 440, 70, INK, 1.5); line(550, 40, 550, 70, INK, 1.5);
  text('U-BAHN', 600, 150, 30, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'right', color: 'rgba(42,39,35,0.13)' });
  // Zug
  withAlpha('ubahn', () => {
    const x = ubTrainX(g);
    if (x < RW + 10 && x + UB_LEN > -10) ubTrain(x, g);
  });
  // Bahnsteig vorn
  ctx.fillStyle = '#bdb6a8'; ctx.fillRect(0, UB_PLAT, RW, 12); line(0, UB_PLAT, RW, UB_PLAT, INK, 2);
  ctx.fillStyle = '#f0b429'; ctx.fillRect(0, UB_PLAT + 1, RW, 3);
  // Wartende Frau steigt ein
  withAlpha('fahrgast2', () => {
    const t = g % 480; if (t >= 160) return;
    const x = t < 140 ? 500 : lerp(500, 420, seg(t, 140, 156)), a = t < 150 ? 1 : 1 - seg(t, 150, 158);
    ctx.save(); ctx.globalAlpha *= a; person({ x, foot: UB_PLAT, face: -1, shirt: '#5f7d3a', pants: '#3b3d40', hair: '#3a2c22', hand: { x: x - 10, y: UB_PLAT - 56 } }); box(x - 20, UB_PLAT - 50, 10, 16, '#8e6233', 2, 1); ctx.restore();
  });
  // Treppe nach oben zum Schulweg
  const B = { x: 280, y: UB_PLAT }, T = { x: 24, y: -16 };
  ctx.beginPath(); ctx.moveTo(B.x, B.y); ctx.lineTo(T.x, T.y); ctx.lineTo(T.x - 30, T.y); ctx.lineTo(B.x - 30, B.y + 12); ctx.lineTo(B.x + 20, B.y + 12); ctx.closePath(); paint('#a39d93', INK, 1.5);
  for (let i = 1; i < 22; i++) { const k = i / 22, p = { x: lerp(B.x, T.x, k), y: lerp(B.y, T.y, k) }; line(p.x - 26, p.y, p.x + 2, p.y, 'rgba(42,39,35,0.35)', 1.2); }
  line(B.x + 6, B.y - 40, T.x + 6, T.y - 40, '#8a8f94', 3);
}

registerRoom({
  key: 'ubahn', name: 'U-Bahnhof', level: 'UG 1',
  hitOrder: ['fahrgast2', 'ubahn'],
  robots: [
    { id: 'ubahn', name: 'Fahrerlose U-Bahn', bereich: 'Mobilität', aera: 'seit 2008', typ: 'Zug ohne Fahrerin oder Fahrer',
      fakt: 'In Nürnberg fährt die U-Bahn-Linie U3 seit Juni 2008 vollautomatisch, die U2 wurde bis 2010 umgestellt. Dazwischen fuhren auf einem gemeinsamen Abschnitt fahrerlose und normale Züge abwechselnd, das gab es vorher nirgends auf der Welt. Kameras und Sensoren überwachen den Bahnsteig.',
      echt: 'Realistisch. Weil vorn kein Fahrerstand ist, kann man ganz vorn aus dem Fenster in den Tunnel schauen, ein beliebter Platz bei Kindern.',
      note: 'Fährt pünktlich ein, lässt die Schulklasse aussteigen und fährt weiter. Vorn drückt sich ein Kind die Nase an der Scheibe platt.', color: '#f3f1ea',
      quelle: 'https://www.koinno.de/fileadmin/user_upload/praxisbeispiele/KOINNO-Praxisbeispiele_66_Pruefung_und_Beschaffung_einer_vollautomatischen_U-Bahn.pdf',
      box: () => { const x = ubTrainX(state.g), a = Math.max(0, x), b = Math.min(RW, x + UB_LEN); return b > a ? [UBX + a, UBY + 232, b - a, 120] : [-99999, -99999, 1, 1]; } },
    { id: 'fahrgast2', name: 'Fahrgast', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Wartet auf den Zug und steigt ein, sobald die Schulklasse draußen ist.', note: 'Erst aussteigen lassen, dann einsteigen. Klappt.', color: '#5f7d3a',
      box: () => (state.g % 480 < 158 ? [UBX + 478, UBY + 206, 44, 124] : [-9999, 0, 0, 0]) },
  ],
  draw: drawUbahn,
});
