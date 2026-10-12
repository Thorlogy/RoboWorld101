/* Raum: Kellerbaustelle (UG 2) – das Haus wird nach unten erweitert
   Hauptfigur: Mauerroboter · Gag: Laufroboter misst nach und findet 2 cm Abweichung (Bild 40–55) · Querverweis: Baukran auf dem Dach */
const BSX = rx(roomOf('baustelle').c), BSY = ry(roomOf('baustelle').r);
function brickArm(f) {
  const pick = { x: 60, y: 250 }, place = { x: 176, y: 214 };
  if (f < 10) return { p: mix(pick, place, ease(seg(f, 0, 10))), carry: true };
  if (f < 16) return { p: place, carry: f < 13 };
  if (f < 30) return { p: mix(place, pick, ease(seg(f, 16, 30))), carry: false };
  return { p: pick, carry: f >= 56 };
}
const nozzleX = f => 330 + 120 * (0.5 - 0.5 * Math.cos(TAU * f / 30));

function drawBaustelle(f) {
  ctx.fillStyle = '#7a6450'; ctx.fillRect(0, 0, RW, RH);
  for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.arc(rnd(i) * RW, rnd(i + 9) * 340, 4 + rnd(i + 2) * 8, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('BAUSTELLE', 24, 60, 36, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(243,241,234,0.15)' });
  ctx.fillStyle = '#a39a8f'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  // Ziegelmauer
  for (let r = 0; r < 7; r++) for (let i = 0; i < 6; i++) {
    const last = r === 3 && i === 5;
    if (last && f < 13) continue;
    box(100 + i * 20 + (r % 2) * 10, 340 - r * 18, 20, 18, '#b5523b', 0, 1);
  }
  // Mauerroboter auf Raupen mit Mörtelauftrag
  withAlpha('maurer', () => {
    box(20, 330, 70, 20, '#2d2f33', 8); for (let x = 30; x < 86; x += 12) circle(x, 340, 4, '#5d6064', INK, 1);
    box(26, 290, 58, 40, '#f0b429', 4);
    for (let i = 0; i < 3; i++) box(32 + i * 16, 268, 14, 12, '#b5523b', 0, 1);
    const a = brickArm(f), S = { x: 70, y: 290 }, E = ik2(S, a.p, 60, 60);
    limb(S.x, S.y, E.x, E.y, 8, '#f0b429'); limb(E.x, E.y, a.p.x, a.p.y, 7, '#f0b429');
    circle(E.x, E.y, 4, '#3b3d40');
    if (a.carry) box(a.p.x - 10, a.p.y, 20, 12, '#b5523b', 0, 1);
  });
  withAlpha('maurerin', () => person({ x: 250, face: -1, shirt: '#e0662b', pants: '#3b3d40', hat: '#f3f1ea', hand: { x: 224, y: f >= 13 && f < 24 ? 212 : 290 } }));
  // Betondrucker mit Portal
  withAlpha('drucker2', () => {
    for (const x of [306, 474]) box(x - 4, 140, 8, 220, '#8a8f94', 0, 1.2);
    box(302, 136, 176, 10, '#5d6064', 1, 1.2);
    for (let y = 352; y > 262; y -= 10) box(330, y - 10, 120, 10, '#b9b5ad', 3, 1);
    const nx = nozzleX(f);
    box(nx - 10, 146, 20, 12, '#3b3d40', 1, 1);
    line(nx, 158, nx, 252, '#3b3d40', 3);
    ctx.beginPath(); ctx.moveTo(nx - 6, 252); ctx.lineTo(nx + 6, 252); ctx.lineTo(nx, 260); ctx.closePath(); paint('#3b3d40', INK, 1);
    ctx.fillStyle = '#9d9890'; ctx.fillRect(330, 254, nx - 330, 8);
  });
  // Laufroboter mit Laserscanner
  withAlpha('vermesser', () => {
    const x = 560, scan = f >= 40 && f < 55;
    for (const [hx, d] of [[544, -1], [576, 1]]) { limb(hx, 318, hx + d * 6, 338, 5, '#f0b429'); limb(hx + d * 6, 338, hx, 356, 4, '#f0b429'); }
    box(532, 300, 56, 18, '#f0b429', 5);
    box(552, 286, 16, 14, '#3b3d40', 3, 1.2);
    if (scan) {
      const a = TAU * f / 6;
      ctx.strokeStyle = 'rgba(255,59,48,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, 292); ctx.lineTo(x - 140 + Math.cos(a) * 20, 220 + Math.sin(a) * 30); ctx.stroke();
      box(500, 230, 84, 22, '#2a2723', 3, 1); text('2 cm schief', 542, 245, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#ffd23f' });
    }
  });
}

registerRoom({
  key: 'baustelle', name: 'Kellerbaustelle', level: 'UG 2',
  hitOrder: ['maurerin', 'vermesser', 'maurer', 'drucker2'],
  robots: [
    { id: 'maurer', name: 'Mauerroboter', bereich: 'Bau', aera: 'seit den 2010ern', typ: 'Roboterarm auf Raupenfahrwerk',
      fakt: 'Mauerroboter setzen Ziegel mit Mörtel nach Plan, Stein für Stein. Ein Mensch arbeitet daneben, verfugt und kümmert sich um Ecken und Fenster, die der Roboter nicht kann.',
      echt: 'Realistisch. Auf Baustellen arbeiten solche Roboter fast immer mit Menschen zusammen, nicht allein.',
      note: 'Setzt jede Runde einen Ziegel. Die Maurerin zieht die Fuge glatt.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/Construction_robotics',
      box: () => [BSX + 18, BSY + 200, 180, 152] },
    { id: 'drucker2', name: 'Betondrucker', bereich: 'Bau', aera: 'seit den 2010ern', typ: 'Portal mit Betondüse',
      fakt: 'Ein Betondrucker legt Wände Schicht für Schicht aus besonders zähem Beton. In Beckum wurde 2021 das erste Wohnhaus Deutschlands aus dem 3D-Drucker fertig.',
      echt: 'Realistisch. Fenster, Dach und Leitungen bauen weiter Menschen ein.',
      note: 'Druckt eine Schicht pro halbe Runde.', color: '#8a8f94',
      quelle: 'https://en.wikipedia.org/wiki/Construction_3D_printing',
      box: () => [BSX + 300, BSY + 134, 180, 226] },
    { id: 'vermesser', name: 'Laufroboter mit Scanner', bereich: 'Bau', aera: 'seit den 2010ern', typ: 'Vierbeiner mit Laserscanner',
      fakt: 'Laufroboter gehen über Baustellen und scannen den Bau mit einem Laser. Der Computer vergleicht das Ergebnis mit dem Bauplan und meldet Abweichungen.',
      echt: 'Realistisch. Zwei Zentimeter Abweichung würde so ein Scan tatsächlich finden.',
      note: 'Misst die Wand nach. Zwei Zentimeter schief. Die Maurerin schaut weg.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/Spot_(robot)',
      box: () => [BSX + 526, BSY + 280, 70, 80] },
    { id: 'maurerin', name: 'Maurerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Kelle',
      fakt: 'Arbeitet mit dem Roboter zusammen und verfugt die Steine.', note: 'Oben auf dem Dach dreht der Kran.', color: '#e0662b',
      box: () => [BSX + 226, BSY + 236, 50, 124] },
  ],
  draw: drawBaustelle,
});
