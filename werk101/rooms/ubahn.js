/* Raum: U-Bahnhof (UG 1, rechts neben dem Haus, unter der Erde)
   Hauptfigur: fahrerlose U-Bahn · Gag: Weil vorn kein Fahrerstand ist, drückt sich ein Kind an der Frontscheibe die Nase platt
   Läuft auf der globalen Uhr state.g: Zug fährt ein (0–40), hält (40–200), fährt weiter (200–260). Querverweis: Schulklasse steigt aus und geht die Treppe hoch zum Schulweg */
const UBX = rx(roomOf('ubahn').c), UBY = ry(roomOf('ubahn').r);
const UB_PLAT = 330, UB_STOP = 300;
function ubTrainX(g) {
  g %= 480;
  if (g < 40) return lerp(720, UB_STOP, 1 - (1 - seg(g, 0, 40)) ** 2);
  if (g < 200) return UB_STOP;
  if (g < 260) return lerp(UB_STOP, -600, seg(g, 200, 260) ** 2);
  return -600;
}
const ubDoor = g => { g %= 480; return g < 50 || g >= 170 ? 0 : g < 58 ? seg(g, 50, 58) : g < 162 ? 1 : 1 - seg(g, 162, 170); };
function ubCar(x, front, open) {
  ctx.beginPath();
  if (front) { ctx.moveTo(x + 230, 236); ctx.lineTo(x + 26, 236); ctx.quadraticCurveTo(x, 240, x, 270); ctx.lineTo(x, 338); ctx.lineTo(x + 230, 338); }
  else { ctx.moveTo(x, 236); ctx.lineTo(x + 230, 236); ctx.lineTo(x + 230, 338); ctx.lineTo(x, 338); }
  ctx.closePath(); paint('#f3f1ea', INK, 2);
  ctx.fillStyle = '#d9542b'; ctx.fillRect(x + (front ? 4 : 0), 318, front ? 226 : 230, 6);
  for (const wx of [40, 150]) box(x + wx, 252, 44, 38, '#9fc4d6', 3, 1.2);
  const d = x + 115, w = 18 * (1 - open);
  box(d - 18 - (18 - w) * 0, 248, w, 90, '#e6e3da', 1, 1.2); box(d + 18 - w, 248, w, 90, '#e6e3da', 1, 1.2);
  if (open > 0.05) { ctx.fillStyle = '#cfd6d9'; ctx.fillRect(d - 18 + w, 248, 36 - 2 * w, 90); }
  for (const wx of [30, 200]) { circle(x + wx, 346, 8, '#2d2f33'); circle(x + wx, 346, 3, '#8a8f94', null); }
  if (front) {
    ctx.beginPath(); ctx.moveTo(x + 30, 244); ctx.quadraticCurveTo(x + 8, 248, x + 8, 272); ctx.lineTo(x + 8, 296); ctx.lineTo(x + 34, 296); ctx.lineTo(x + 34, 244); ctx.closePath(); paint('#9fc4d6', INK, 1.5);
    box(x + 4, 302, 10, 6, '#fff3c4', 1, 1);
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
    const x = ubTrainX(g), open = ubDoor(g);
    if (x < RW + 10) {
      ubCar(x, true, open); ubCar(x + 240, false, open);
      ctx.fillStyle = '#3b3d40'; ctx.fillRect(x + 230, 280, 10, 40);
      // Kind an der Frontscheibe, weil vorn kein Fahrer sitzt
      circle(x + 22, 280, 8, '#e2b48f', INK, 1.2); ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.arc(x + 22, 277, 8, Math.PI, TAU); ctx.fill();
      for (const dy of [-6, 6]) circle(x + 11, 280 + dy, 3, '#e2b48f', INK, 1);
      circle(x + 15, 282, 2, '#d98f8f', null);
      [62, 172, 280, 390].forEach((wx, i) => circle(x + wx, 270, 7, ['#3a2c22', '#d6d2c8', '#8a5a2b', '#2a1f18'][i], INK, 1));
    }
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
      box: () => { const x = ubTrainX(state.g); return [UBX + Math.max(0, x), UBY + 232, Math.max(0, Math.min(RW, x + 470) - Math.max(0, x)), 120]; } },
    { id: 'fahrgast2', name: 'Fahrgast', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Wartet auf den Zug und steigt ein, sobald die Schulklasse draußen ist.', note: 'Erst aussteigen lassen, dann einsteigen. Klappt.', color: '#5f7d3a',
      box: () => (state.g % 480 < 158 ? [UBX + 478, UBY + 206, 44, 124] : [-9999, 0, 0, 0]) },
  ],
  draw: drawUbahn,
});
