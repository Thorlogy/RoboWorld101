/* Raum: Sporthalle (Ebene 3) */
const SX = rx(roomOf('sport').c), SY = ry(roomOf('sport').r);

function soccerBall(f) {
  if (f < 10) return { x: 214, y: 352 };
  if (f < 24) { const t = seg(f, 10, 24); return { x: lerp(214, 40, t), y: 352 - 40 * Math.sin(Math.PI * t) }; }
  if (f < 46) return { x: 40, y: 352 };
  if (f < 50) return { x: lerp(40, 80, seg(f, 46, 50)), y: lerp(352, 300, seg(f, 46, 50)) };
  const t = seg(f, 50, 60); return { x: lerp(80, 214, t), y: lerp(300, 352, t) - 50 * Math.sin(Math.PI * t) };
}
function keeperPose(f) {
  if (f < 16) return { x: 78, rot: 0 };
  if (f < 26) return { x: lerp(78, 70, seg(f, 16, 26)), rot: -1.45 * ease(seg(f, 16, 26)) };
  if (f < 36) return { x: 70, rot: -1.45 };
  if (f < 46) return { x: lerp(70, 78, seg(f, 36, 46)), rot: -1.45 * (1 - ease(seg(f, 36, 46))) };
  return { x: 78, rot: 0 };
}
function pingBall(f) {
  const t = (f % 20) / 20, toHuman = t < 0.5, u = toHuman ? t * 2 : (t - 0.5) * 2;
  const x = toHuman ? lerp(326, 452, u) : lerp(452, 326, u);
  const bx = toHuman ? 0.62 : 0.62;
  const y = u < bx ? lerp(270, 292, u / bx) - 10 * Math.sin(Math.PI * u / bx) : 292 - 30 * Math.sin(Math.PI * (u - bx) / (1 - bx)) * (1 - (u - bx) / (1 - bx) * 0.3);
  return { x, y };
}
function parkour(f) {
  if (f < 6) return { x: 486, y: 0, rot: 0, run: true };
  if (f < 22) { const t = seg(f, 6, 22); return { x: lerp(486, 610, t), y: -70 * Math.sin(Math.PI * t), rot: 0.3 * Math.sin(Math.PI * t), run: false }; }
  if (f < 36) return { x: 610, y: 0, rot: 0, pose: true };
  if (f < 56) { const t = ease(seg(f, 36, 56)); return { x: lerp(610, 486, t), y: -86 * Math.sin(Math.PI * t), rot: -TAU * t, run: false }; }
  return { x: 486, y: 0, rot: 0, run: true };
}

function drawSport(f) {
  ctx.fillStyle = '#d9dcd2'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#b7c3a9'; ctx.fillRect(0, 200, RW, 160);
  line(0, 200, RW, 200, INK, 2);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('SPORT', 20, 190, 46, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  // Anzeigetafel
  box(230, 30, 180, 56, '#2a2723', 4);
  text('ROBOTER', 250, 52, 12, { family: '"IBM Plex Mono", monospace', weight: 500, color: '#f3f1ea' });
  text('MENSCHEN', 390, 52, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'right', color: '#f3f1ea' });
  text('0 : 0', 320, 78, 22, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#ffd23f' });
  // Hallenboden
  ctx.fillStyle = '#c9965c'; ctx.fillRect(0, 360, RW, 40);
  ctx.strokeStyle = '#b07f48'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 0; x < RW; x += 32) { ctx.moveTo(x, 360); ctx.lineTo(x, 400); }
  ctx.stroke();
  line(0, 382, 300, 382, '#f3f1ea', 2);
  line(0, 360, RW, 360, INK, 2);

  // Kreideumriss: hier verletzte sich der Laufroboter
  withAlpha('umriss', () => {
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#f3f1ea'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.rect(548, 378, 44, 10);
    for (const [a, b] of [[552, 370], [586, 372], [560, 396], [590, 395]]) { ctx.moveTo(a, 384); ctx.lineTo(b, b > 390 ? 396 : 384); }
    ctx.moveTo(592, 382); ctx.lineTo(604, 380); ctx.stroke(); ctx.restore();
    box(604, 372, 30, 22, '#f3f1ea', 1, 1.2);
    text('→ 5', 619, 387, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#d9542b' });
  });

  // Fußball: Tor, Torwart, Stürmer
  box(10, 300, 44, 60, 'rgba(255,255,255,0.25)', 0, 2);
  ctx.strokeStyle = 'rgba(42,39,35,0.35)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 16; x < 54; x += 8) { ctx.moveTo(x, 300); ctx.lineTo(x, 360); }
  for (let y = 308; y < 360; y += 8) { ctx.moveTo(10, y); ctx.lineTo(54, y); }
  ctx.stroke();
  withAlpha('fussball', () => {
    const k = keeperPose(f);
    humanoid(k.x, 358, { s: 0.5, rot: k.rot, armL: k.rot ? -2.6 : 0.3, armR: k.rot ? -2.4 : -0.3, color: '#7fd3ff' });
    const kick = f >= 6 && f < 12 ? Math.sin(Math.PI * seg(f, 6, 12)) : 0;
    humanoid(236, 358, { s: 0.5, legL: -0.2 - 1.1 * kick, kneeL: 0.2, armR: 0.6 * kick, armL: -0.4 * kick, color: '#f0b429' });
    const b = soccerBall(f);
    circle(b.x, b.y, 7, '#f3f1ea'); circle(b.x, b.y, 2.5, INK, null);
    if (f >= 24 && f < 40) text('TOR!', 120, 250, 22, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#d9542b' });
  });

  // Tischtennis: Roboterarm gegen Mensch
  box(316, 292, 148, 8, '#3e6f9e', 2);
  line(390, 280, 390, 292, INK, 2); line(330, 300, 330, 358, '#5d6064', 3); line(450, 300, 450, 358, '#5d6064', 3);
  withAlpha('pingpong', () => {
    box(286, 300, 22, 58, '#5d6064', 3);
    const pb = pingBall(f), hit = (f % 20) < 3 || (f % 20) > 17;
    const tip = { x: 316, y: hit ? 272 : 280 };
    const el = ik2({ x: 297, y: 300 }, tip, 22, 22);
    limb(297, 300, el.x, el.y, 7, '#e6e3da'); limb(el.x, el.y, tip.x, tip.y, 6, '#e6e3da');
    circle(297, 300, 4, '#3b3d40'); circle(el.x, el.y, 3.5, '#3b3d40');
    ctx.beginPath(); ctx.ellipse(tip.x + 6, tip.y - 4, 5, 9, 0.3, 0, TAU); paint('#d9542b', INK, 1.5);
    circle(pb.x, pb.y, 3.5, '#f3f1ea', INK, 1.2);
  });
  withAlpha('spieler', () => {
    const t = f % 20, swing = t >= 8 && t < 12;
    const p = person({ x: 480, face: -1, shirt: '#d9542b', pants: '#2f4866', hand: swing ? { x: 458, y: 270 } : { x: 466, y: 288 } });
    ctx.beginPath(); ctx.ellipse(p.hand.x - 6, p.hand.y - 4, 5, 9, -0.3, 0, TAU); paint('#3b3d40', INK, 1.5);
    ctx.fillStyle = '#7fd3ff'; const d = (f % 30) / 30; ctx.beginPath(); ctx.arc(p.head.x + 10, p.head.y + d * 30, 2.5, 0, TAU); ctx.fill();
  });

  // Parkour: Humanoider springt über die Kiste und macht den Rückwärtssalto
  box(536, 310, 52, 50, '#a8763f', 2);
  line(536, 335, 588, 335, '#8e6233', 2);
  withAlpha('parkour', () => {
    const p = parkour(f), run = p.run ? Math.sin(TAU * f / 6) * 0.5 : 0;
    humanoid(p.x, 358 + p.y, { rot: p.rot, legL: run - (p.y ? 0.6 : 0), kneeL: p.y ? 1.2 : 0.2, legR: -run + (p.y ? 0.3 : 0), kneeR: p.y ? 1.0 : 0.2,
      armL: p.pose ? -2.8 : -run, armR: p.pose ? 2.8 : run, s: 0.92, color: '#b9bec4' });
    if (p.pose) text('TA-DA', p.x, 236, 13, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#3e6f9e' });
  });
}

registerRoom({
  key: 'sport', name: 'Sporthalle', level: 'Ebene 3',
  hitOrder: ['umriss', 'fussball', 'pingpong', 'spieler', 'parkour'],
  robots: [
    { id: 'fussball', echt: 'Echt: Beim RoboCup fallen Roboter oft um und stehen von selbst wieder auf. Tore schießen sie trotzdem.', name: 'Fußballroboter', bereich: 'Forschung', aera: 'seit 1997', typ: 'Kleine Humanoide',
      fakt: 'Der RoboCup wird seit 1997 ausgetragen. Das erklärte Ziel: Bis 2050 soll eine Robotermannschaft den amtierenden menschlichen Fußball-Weltmeister schlagen.',
      note: 'Der Torwart wirft sich jedes Mal. Jedes Mal zu spät.', color: '#7fd3ff',
      quelle: 'https://en.wikipedia.org/wiki/RoboCup',
      box: () => [SX + 10, SY + 290, 250, 70] },
    { id: 'pingpong', quelle: 'https://www.guinnessworldrecords.com/world-records/411700-first-robot-table-tennis-tutor', echt: 'Tischtennis-Roboter spielen inzwischen gegen Hobbyspieler und gewinnen manche Partie. Gegen Profis verlieren sie noch.', name: 'Tischtennis-Roboter', bereich: 'Forschung', aera: 'seit den 2010ern', typ: 'Roboterarm mit Kamera',
      fakt: 'Der Tischtennis-Roboter Forpheus des japanischen Herstellers Omron steht seit 2015 als erster Roboter-Tischtennistrainer im Guinness-Buch. Kameras verfolgen den Ball, der Arm stellt den Schläger in Millisekunden ein.',
      note: 'Verliert keinen Ballwechsel. Gewinnt aber auch keinen.', color: '#e6e3da',
      box: () => [SX + 284, SY + 260, 50, 100] },
    { id: 'spieler', name: 'Tischtennisspieler', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Spielt seit dem Frühstück gegen den Roboter. Der Spielstand auf der Tafel hat sich seitdem nicht bewegt.',
      note: 'Schwitzt.', color: '#d9542b',
      box: () => [SX + 456, SY + 236, 46, 124] },
    { id: 'parkour', echt: 'Echt: Humanoide Roboter haben Saltos und Parkour vorgeführt. Dahinter stecken viele Probeläufe und Stürze.', name: 'Parkour-Humanoider', bereich: 'Forschung', aera: 'seit den 2010ern', typ: 'Zweibeiniger Laufroboter',
      fakt: 'Boston Dynamics zeigte 2021 zwei humanoide Atlas-Roboter bei einem Parkour-Lauf mit Sprüngen und Saltos. Für jeden Sprung plant der Roboter Kräfte und Landung vorab.',
      note: 'Springt über die Kiste, macht einen Salto rückwärts und erwartet Applaus.', color: '#b9bec4',
      quelle: 'https://en.wikipedia.org/wiki/Atlas_(robot)',
      box: f => { const p = parkour(f); return [SX + p.x - 30, SY + 236 + p.y, 60, 124]; } },
    { id: 'umriss', echt: 'Ein Spaß. Für kaputte Roboter gibt es keine Kreideumrisse, sondern Fehlerprotokolle.', name: 'Kreideumriss', bereich: 'Spielzeug', aera: 'Tatort', typ: 'Unfallstelle',
      fakt: 'Hier hat sich der Laufroboter beim Parkour das Bein verbogen. Der Pfeil zeigt zur Krankenstation auf Ebene 5.',
      note: 'Bitte nicht wegwischen.', color: '#f3f1ea',
      box: () => [SX + 540, SY + 362, 98, 36] },
  ],
  draw: drawSport,
});
