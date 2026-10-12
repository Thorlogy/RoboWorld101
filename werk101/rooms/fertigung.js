/* Raum: Fertigungshalle (Ebene 2) */
const FX = rx(roomOf('fertigung').c), FY = ry(roomOf('fertigung').r);
const beltM = f => ease(seg(f, 0, 18));
function sweepTip(f, rest, from, to, h) {
  if (f < 20 || f >= 46) return rest;
  if (f < 24) return mix(rest, { x: from, y: h }, ease(seg(f, 20, 24)));
  if (f < 42) return { x: lerp(from, to, seg(f, 24, 42)), y: h };
  return mix({ x: to, y: h }, rest, ease(seg(f, 42, 46)));
}
const weldTip = f => sweepTip(f, { x: 128, y: 196 }, 82, 118, 254);
const paintTip = f => sweepTip(f, { x: 290, y: 194 }, 236, 284, 234);
function cobotTip(f) {
  let t = 0;
  if (f >= 4 && f < 18) t = 0.85 * ease(seg(f, 4, 18));
  else if (f >= 18 && f < 22) t = 0.85;
  else if (f >= 22 && f < 30) t = 0.85 * (1 - ease(seg(f, 22, 30)));
  return { x: lerp(522, 566, t), y: lerp(246, 286, t) };
}
function workerHand(f) {
  const rest = { x: 606, y: 294 }, part = { x: 580, y: 292 }, hold = { x: 598, y: 268 };
  if (f < 20) return rest;
  if (f < 28) return mix(rest, part, ease(seg(f, 20, 28)));
  if (f < 34) return mix(part, hold, ease(seg(f, 28, 34)));
  if (f < 46) return hold;
  if (f < 54) return mix(hold, part, ease(seg(f, 46, 54)));
  return mix(part, rest, ease(seg(f, 54, 60)));
}
const DELTA_BINS = { A: { x: 490, y: 166 }, S: { x: 548, y: 166 }, G: { x: 600, y: 166 } };
const DELTA_PLAN = [['s', 'S'], ['g', 'G'], ['s', 'S'], ['g', 'G'], ['g', 'S'], ['s', 'S']];
function deltaState(f) {
  const [kind, to] = DELTA_PLAN[Math.floor(f / 10)], t = (f % 10) / 10;
  const u = t < 0.5 ? t * 2 : (1 - t) * 2, A = DELTA_BINS.A, D = DELTA_BINS[to];
  return { x: lerp(A.x, D.x, ease(u)), y: A.y - 42 * Math.sin(Math.PI * u), carry: t < 0.5 ? kind : null };
}
function headPart(x, bottom, stage, frac = 0) {
  const x0 = x - 30, y0 = bottom - 42;
  if (stage === 'raw') {
    box(x0, y0 + 20, 60, 22, '#9da2a7', 3);
    box(x0 + 4, y0 - 2, 56, 22, '#b0b4b8', 3);
    box(x0 + 13, y0 + 3, 30, 12, '#3b3d40', 2, 1.5);
    circle(x0 + 7, y0 + 31, 2, INK, null); circle(x0 + 53, y0 + 31, 2, INK, null);
    return;
  }
  const welded = () => {
    box(x0, y0, 60, 42, '#a9adb1', 6);
    box(x0 + 8, y0 + 6, 44, 30, '#3b3d40', 4, 1.5);
    ctx.fillStyle = '#7a4a22';
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(x0 + 4 + i * 8.6, y0 + 39, 1.8, 0, TAU); ctx.fill(); }
  };
  const painted = () => {
    box(x0, y0, 60, 42, '#f1efe9', 8);
    box(x0 + 8, y0 + 6, 44, 30, '#23384d', 4);
    ctx.fillStyle = '#7fd3ff';
    for (const ex of [x - 8, x + 8]) { ctx.beginPath(); ctx.arc(ex, y0 + 21, 2.8, 0, TAU); ctx.fill(); }
  };
  if (stage === 'welded') {
    welded();
    if (frac > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x0 - 3, y0 - 3, 66 * frac, 50); ctx.clip(); painted(); ctx.restore(); }
  } else painted();
}
function screw(x, y, kind) {
  box(x - 2, y, 4, 9, kind === 'g' ? '#d6a521' : '#c3c7cb', 0, 1);
  box(x - 4, y - 3, 8, 3, kind === 'g' ? '#d6a521' : '#c3c7cb', 0, 1);
}

function drawFertigung(f) {
  // Halle
  ctx.fillStyle = '#cdd3d5'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#9fb0b7'; ctx.fillRect(0, 200, RW, 160);
  line(0, 200, RW, 200, INK, 2);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('FERTIGUNG', 140, 192, 46, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  for (let i = 0; i < 4; i++) {
    const x = 22 + i * 100;
    box(x, 18, 88, 60, '#cfe0e6');
    line(x + 44, 18, x + 44, 78, INK, 1.5); line(x, 48, x + 88, 48, INK, 1.5);
  }
  // Schild
  box(452, 14, 176, 34, '#f3f1ea');
  text('TAGE OHNE UNFALL', 462, 36, 11, { family: '"IBM Plex Mono", monospace', weight: 500 });
  text('1312', 620, 37, 16, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'right', color: '#d9542b' });
  // Boden
  ctx.fillStyle = '#8f8b84'; ctx.fillRect(0, 360, RW, 40);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 360, RW, 9); ctx.clip();
  ctx.fillStyle = '#f0b429'; ctx.fillRect(0, 360, RW, 9);
  ctx.fillStyle = '#2a2723'; for (let x = -20; x < RW; x += 22) { ctx.beginPath(); ctx.moveTo(x, 369); ctx.lineTo(x + 9, 360); ctx.lineTo(x + 18, 360); ctx.lineTo(x + 9, 369); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  line(0, 360, RW, 360, INK, 2);
  // Schiene unter der Decke
  box(10, 96, 400, 12, '#5d6064');
  const moving = f < 18;
  circle(400, 90, 6, moving && f % 4 < 2 ? '#ff8a24' : '#8a4a1c');

  // Delta-Roboter
  withAlpha('delta', () => {
    box(452, 62, 8, 124, '#8a8f94'); box(624, 62, 8, 124, '#8a8f94');
    box(452, 58, 180, 10, '#5d6064');
    box(450, 178, 184, 8, '#a8763f');
    box(508, 68, 64, 10, '#3b3d40', 2);
    box(474, 160, 32, 18, '#8a8f94', 2); box(532, 160, 32, 18, '#8a8f94', 2); box(586, 160, 28, 18, '#8a8f94', 2);
    for (let i = 0; i < 5; i++) { circle(480 + i * 5, 158, 2.4, i % 2 ? '#d6a521' : '#c3c7cb', INK, 1); }
    for (let i = 0; i < 5; i++) circle(538 + i * 5, 158, 2.4, i === 3 ? '#d6a521' : '#c3c7cb', INK, 1);
    for (let i = 0; i < 4; i++) circle(591 + i * 5, 158, 2.4, '#d6a521', INK, 1);
    const d = deltaState(f), P1 = { x: 516, y: 76 }, P2 = { x: 564, y: 76 };
    const Q1 = { x: d.x - 8, y: d.y - 6 }, Q2 = { x: d.x + 8, y: d.y - 6 };
    const E1 = elbowOf(P1, Q1, 40, 84, -1), E2 = elbowOf(P2, Q2, 40, 84, 1);
    limb(P1.x, P1.y, E1.x, E1.y, 6, '#d9542b'); limb(P2.x, P2.y, E2.x, E2.y, 6, '#d9542b');
    for (const o of [-2.5, 2.5]) { line(E1.x + o, E1.y, Q1.x + o, Q1.y, INK, 1.8); line(E2.x + o, E2.y, Q2.x + o, Q2.y, INK, 1.8); }
    circle(E1.x, E1.y, 3.5, '#3b3d40'); circle(E2.x, E2.y, 3.5, '#3b3d40');
    box(d.x - 11, d.y - 8, 22, 6, '#3b3d40', 2, 1.5);
    if (d.carry) screw(d.x, d.y - 1, d.carry);
    if (f >= 46 && f % 4 < 3) text('?', 548, 150, 18, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#d9542b' });
  });

  // Förderband
  box(10, 300, 390, 14, '#3b3d40');
  ctx.fillStyle = '#5d6064'; ctx.fillRect(12, 301, 386, 4);
  const off = (beltM(f) * 160) % 20;
  ctx.strokeStyle = '#8a8f94'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 12 + off; x < 398; x += 20) { ctx.moveTo(x, 301); ctx.lineTo(x, 305); }
  ctx.stroke();
  for (let x = 24; x < 400; x += 40) circle(x, 309, 3, '#8a8f94', INK, 1);
  for (const x of [30, 200, 370]) box(x - 4, 314, 8, 46, '#5d6064');
  // Kiste für fertige Köpfe (hinten)
  box(400, 312, 72, 48, '#6d6a64');
  // Werkstücke
  const m = beltM(f);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 472, RH); ctx.clip();
  const pA = lerp(-60, 100, m), pB = lerp(100, 260, m), pC = lerp(260, 420, m);
  headPart(pA, 300, f >= 42 && m >= 1 ? 'welded' : 'raw');
  const paintFrac = m >= 1 ? clamp((paintTip(f).x - 230) / 60, 0, 1) * (f >= 24 && f < 46 ? 1 : 0) : 0;
  headPart(pB, 300, m >= 1 && f >= 42 ? 'painted' : 'welded', f >= 42 ? 1 : paintFrac);
  if (m < 1) {
    const drop = Math.max(0, pC - 392);
    ctx.save(); ctx.translate(pC, 300 + Math.min(44, drop * 1.4)); ctx.rotate(Math.min(0.35, drop * 0.01));
    headPart(0, 0, 'painted'); ctx.restore();
  }
  ctx.restore();
  box(400, 330, 72, 30, '#7d7972');
  text('FERTIG', 436, 350, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3f1ea' });

  // Schweiß- und Lackierroboter
  withAlpha('schweiss', () => {
    const t = weldTip(f);
    hangingArm(100, t, '#d9542b', 'weld');
    if (f >= 24 && f < 42 && m >= 1) sparks(t.x, t.y, f);
  });
  withAlpha('lack', () => {
    const t = paintTip(f);
    hangingArm(260, t, '#e6e3da', 'paint');
    if (f >= 24 && f < 42 && m >= 1) spray(t.x, t.y, f);
  });

  // Werkerin (Körper)
  withAlpha('werkerin', () => {
    limb(616, 302, 610, 356, 7, '#3d5a80'); limb(620, 302, 624, 356, 7, '#3d5a80');
    box(602, 352, 14, 6, INK, 2); box(618, 352, 14, 6, INK, 2);
    limb(618, 302, 618, 266, 18, '#3d5a80');
    ctx.fillStyle = '#f0b429'; ctx.fillRect(612, 280, 12, 3);
    const look = f >= 34 && f < 46 ? 2 : 0;
    circle(617, 250 + look, 11, '#c99a74');
    circle(610, 250 + look, 1.6, INK, null);
    ctx.beginPath(); ctx.arc(618, 248 + look, 12, Math.PI, TAU); ctx.closePath(); paint('#f0b429');
    box(603, 246 + look, 28, 4, '#f0b429', 1, 1.5);
  });
  // Werkbank
  box(480, 300, 152, 8, '#a8763f');
  box(488, 308, 6, 52, '#8e6233'); box(618, 308, 6, 52, '#8e6233');

  // Cobot
  heldDraw('cobot', f, f => {
    box(490, 284, 24, 16, '#b9d0dc', 3);
    const warn = f >= 19 && f < 34;
    circle(502, 292, 3, warn ? '#f0b429' : '#7fe08a', INK, 1);
    const S = { x: 502, y: 276 }, W = cobotTip(f), E = ik2(S, W, 40, 40);
    limb(S.x, S.y, E.x, E.y, 10, '#b9d0dc'); limb(E.x, E.y, W.x, W.y, 8, '#b9d0dc');
    circle(S.x, S.y, 6, '#3b3d40'); circle(E.x, E.y, 5, '#3b3d40'); circle(W.x, W.y, 4, '#3b3d40');
    const a = Math.atan2(W.y - E.y, W.x - E.x);
    for (const s of [-1, 1]) line(W.x + Math.cos(a + s * 0.5) * 4, W.y + Math.sin(a + s * 0.5) * 4, W.x + Math.cos(a + s * 0.3) * 10, W.y + Math.sin(a + s * 0.3) * 10, INK, 2);
    if (f >= 19 && f < 27) text('!', W.x + 4, W.y - 12, 20, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#d9542b' });
  });

  // Zahnrad und Arm der Werkerin
  const hand = workerHand(f), held = f >= 28 && f < 54;
  ctx.save(); ctx.globalAlpha = alphaOf('werkerin');
  gear(held ? hand.x - 4 : 580, held ? hand.y - 2 : 292);
  const el = { x: (614 + hand.x) / 2 + 4, y: Math.max(272, hand.y) + 10 };
  limb(614, 270, el.x, el.y, 6, '#3d5a80'); limb(el.x, el.y, hand.x, hand.y, 5, '#c99a74');
  ctx.restore();
}

registerRoom({
  key: 'fertigung', name: 'Fertigungshalle', level: 'Ebene 2',
  hitOrder: ['cobot', 'werkerin', 'schweiss', 'lack', 'delta'],
  robots: [
  { id: 'schweiss', echt: 'Im Autobau schweißen Roboter vor allem Karosseriebleche zusammen. Funken und Ablauf im Bild sind realistisch.', name: 'Schweißroboter', bereich: 'Industrie', aera: 'seit den 1960ern', typ: 'Knickarm, an der Decke hängend',
    fakt: '1969 baute General Motors sein Werk in Lordstown (Ohio) mit Unimate-Robotern zum Punktschweißen um und fertigte dort mehr Autos pro Stunde als jedes andere Werk. Schweißen gehört bis heute zu den häufigsten Aufgaben von Industrierobotern.',
    note: 'Schweißt hier die Köpfe für die Kellnerroboter aus der Kantine zusammen.', color: '#d9542b',
    quelle: 'https://www.automate.org/robotics/engelberger/joseph-engelberger-unimate',
      box: () => [FX + 56, FY + 100, 100, 160] },
  { id: 'lack', echt: 'Echte Lackierroboter arbeiten in geschlossenen Kabinen mit Absaugung, damit kein Lacknebel in die Halle gelangt.', name: 'Lackierroboter', bereich: 'Industrie', aera: 'seit den 1960ern', typ: 'Knickarm mit Sprühpistole',
    fakt: 'Lackieren war eine der ersten Arbeiten, die Roboter übernahmen, weil Lacknebel ungesund ist. Der norwegische Schubkarrenhersteller Trallfa entwickelte ab 1964 einen der ersten Lackierroboter, zuerst für die eigenen Schubkarren.',
    note: 'Malt immer von links nach rechts. Hat noch nie über den Rand gemalt.', color: '#e6e3da',
    quelle: 'https://en.wikipedia.org/wiki/Paint_robot',
      box: () => [FX + 218, FY + 100, 100, 150] },
  { id: 'cobot', echt: 'Echte Cobots werden langsamer oder halten an, wenn ein Mensch zu nah kommt oder sie berührt. Erschrecken können sie nicht.', name: 'Cobot', bereich: 'Industrie', aera: 'seit 2008', typ: 'Kollaborativer Leichtbauarm',
    fakt: 'Cobots arbeiten ohne Schutzzaun direkt neben Menschen. Sie begrenzen Kraft und Tempo und halten an, sobald sie etwas berühren. Der dänische Hersteller Universal Robots verkaufte 2008 einen der ersten Cobots.',
    note: 'Will helfen. Zieht die Hand zurück, sobald die Werkerin hingreift.', color: '#b9d0dc',
    quelle: 'https://en.wikipedia.org/wiki/Cobot',
      box: () => [FX + 484, FY + 234, 92, 68] },
  { id: 'delta', echt: 'Echte Delta-Roboter sind noch viel schneller als hier. Falsch einsortiert wird selten, weil eine Kamera jedes Teil vorher prüft.', name: 'Delta-Roboter', bereich: 'Industrie', aera: 'seit den 1980ern', typ: 'Parallelroboter für Pick-and-Place',
    fakt: 'Die Bauform erfand Reymond Clavel Anfang der 1980er an der EPFL in Lausanne. Weil die Motoren oben sitzen und die Arme leicht sind, greifen Delta-Roboter mehrere Teile pro Sekunde, etwa beim Verpacken von Pralinen.',
    note: 'Sortiert silberne und goldene Schrauben. Eine landet in jeder Runde in der falschen Kiste.', color: '#8a8f94',
    quelle: 'https://en.wikipedia.org/wiki/Delta_robot',
      box: () => [FX + 452, FY + 56, 180, 132] },
  { id: 'werkerin', name: 'Werkerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Helm',
    fakt: 'Prüft das Zahnrad, das der Cobot ihr reichen wollte. Zwischen ihr und dem Cobot steht kein Zaun, das ist der Sinn der Sache.',
    note: 'Hat Vorrang. Immer.', color: '#3d5a80',
    box: () => [FX + 594, FY + 232, 40, 128] },
  ],
  draw: drawFertigung,
});
