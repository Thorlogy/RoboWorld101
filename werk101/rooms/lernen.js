/* Raum: Lernlabor (UG 1) – Motto „So lernen Roboter“
   Links: drei Greifarme üben Greifen, einer verliert jede Runde sein Teil (Bild 30–40).
   Mitte: Simulation mit zwölf Vierbeinern, Runde für Runde fallen weniger um; darunter läuft der echte auf dem Laufband.
   Rechts: Ein Mensch macht mit zwei Führungsarmen vor, der Roboter daneben macht es genau nach und lernt aus der Aufnahme. */
const LNX = rx(roomOf('lernen').c), LNY = ry(roomOf('lernen').r);
const LN_MONO = { family: '"IBM Plex Mono", monospace', weight: 500 };

// kleiner Arm: Schulter S, Spitze tip, zwei Glieder; Greifer offen oder zu
function lnArm(S, tip, color, closed) {
  const E = ik2(S, tip, 34, 32);
  limb(S.x, S.y, E.x, E.y, 7, color); limb(E.x, E.y, tip.x, tip.y - 6, 6, color);
  circle(S.x, S.y, 4.5, '#3b3d40', INK, 1.2); circle(E.x, E.y, 3.5, '#3b3d40', INK, 1);
  const o = closed ? 3 : 7;
  line(tip.x - o, tip.y - 6, tip.x - o, tip.y + 4, INK, 2); line(tip.x + o, tip.y - 6, tip.x + o, tip.y + 4, INK, 2);
}

/* ---------- Greifarm-Farm ---------- */
const LN_FARM = [30, 100, 170];
function farmTip(k, f) {
  const p = (f + k * 7) % 20, bx = LN_FARM[k] + 40;
  const rest = { x: bx - 8, y: 248 }, pick = { x: bx, y: 288 };
  if (p < 6) return { pt: mix(rest, pick, ease(seg(p, 0, 6))), closed: false, hold: false };
  if (p < 8) return { pt: pick, closed: p >= 7, hold: p >= 7 };
  if (p < 16) return { pt: mix(pick, rest, ease(seg(p, 8, 16))), closed: true, hold: true };
  return { pt: rest, closed: false, hold: false };
}
const farmFail = (k, f) => k === 1 && f >= 27 && f < 47;
function drawFarm(f) {
  box(14, 296, 220, 8, '#5d6064', 1, 1.5); line(24, 304, 24, 360, INK, 3); line(224, 304, 224, 360, INK, 3);
  text('GREIFEN ÜBEN', 20, 140, 9, LN_MONO);
  box(20, 148, 202, 34, '#1a1d22', 2, 1.5);
  text('Versuche: 800 000', 28, 162, 8, Object.assign({ color: '#ffb347' }, LN_MONO));
  const ok = 61 + Math.round(20 * seg(f, 0, 59));
  text(`Treffer: ${ok} %`, 28, 175, 8, Object.assign({ color: '#7fe08a' }, LN_MONO));
  LN_FARM.forEach((x, k) => {
    // Kiste mit bunten Teilen
    box(x + 18, 284, 44, 12, '#c79a63', 1, 1.2);
    const cols = ['#d9542b', '#3e6f9e', '#f0b429', '#5f9a4a'];
    for (let i = 0; i < 4; i++) { if (i === 1) continue; box(x + 21 + i * 10, 279, 7, 7, cols[(i + k) % 4], 1, 1); }
    box(x - 2, 250, 16, 46, '#8a8f94', 1, 1.2);
    const t = farmTip(k, f), S = { x: x + 6, y: 250 };
    lnArm(S, t.pt, k === 1 ? '#3e6f9e' : '#f0b429', t.closed);
    const p = (f + k * 7) % 20;
    if (t.hold) {
      if (farmFail(k, f) && p >= 10) {
        const d = seg(p, 10, 14), yy = lerp(t.pt.y + 4, 284, d);
        box(x + 36, yy - 4, 8, 8, cols[(1 + k) % 4], 1, 1);
        if (p >= 12) text('✗', x + 40, 238, 12, { weight: 700, align: 'center', color: '#d9342b' });
      } else box(t.pt.x - 4, t.pt.y - 2, 8, 8, cols[(1 + k) % 4], 1, 1);
    } else box(x + 36, 279, 7, 7, cols[(1 + k) % 4], 1, 1);
    if (t.hold && !farmFail(k, f) && p >= 14) text('✓', x + 40, 238, 12, { weight: 700, align: 'center', color: '#2f8f4e' });
  });
}

/* ---------- Lauf-Simulation und echter Vierbeiner ---------- */
function miniDog(x, y, s, ok, f, i) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (!ok) { ctx.translate(0, 2); ctx.rotate(Math.PI); }
  box(-10, -10, 20, 6, ok ? '#7fe08a' : '#ff8a7a', 1, 0.6);
  for (let l = 0; l < 4; l++) { const ph = TAU * f / 10 + (l % 2 ? Math.PI : 0) + i, dx = l < 2 ? -7 : 7; line(dx, -4, dx + (ok ? Math.sin(ph) * 3 : 4), 5, ok ? '#7fe08a' : '#ff8a7a', 1.2); }
  ctx.restore();
}
function drawSim(f) {
  const round = 1 + Math.floor(f / 15);
  box(246, 60, 180, 128, '#1a1d22', 2, 2);
  ctx.fillStyle = '#0b1220'; ctx.fillRect(252, 66, 168, 116);
  text('SIMULATION', 258, 80, 8, Object.assign({ color: '#7fd3ff' }, LN_MONO));
  text(`Runde ${round}`, 414, 80, 8, Object.assign({ color: '#c9d6e2', align: 'right' }, LN_MONO));
  for (let i = 0; i < 12; i++) {
    const c = i % 4, r = Math.floor(i / 4), ok = ((i * 5) % 12) < round * 3 - 1;
    line(262 + c * 40, 108 + r * 26, 292 + c * 40, 108 + r * 26, '#2f4866', 1);
    miniDog(277 + c * 40, 106 + r * 26, 1, ok, f, i);
  }
  text('lernt aus jedem Sturz', 336, 176, 7.5, Object.assign({ color: '#c9d6e2', align: 'center' }, LN_MONO));
}
function realDog(x, foot, f) {
  // Vierbeiner im echten Maßstab (ca. 90 cm lang): Rumpf, Kopf mit Sensoren, Trab
  const bob = Math.abs(Math.sin(TAU * f / 10)) * 2;
  const hips = [x - 26, x - 18, x + 18, x + 26];
  for (let l = 0; l < 4; l++) {
    const ph = TAU * f / 10 + ((l === 0 || l === 3) ? 0 : Math.PI);
    const hip = { x: hips[l], y: foot - 40 - bob }, ft = { x: hips[l] + Math.sin(ph) * 9, y: foot - Math.max(0, Math.cos(ph)) * 5 };
    const kn = { x: (hip.x + ft.x) / 2 + (l < 2 ? -6 : 6), y: (hip.y + ft.y) / 2 };
    const c = l === 1 || l === 2 ? '#a9adb0' : '#5d6064';
    limb(hip.x, hip.y, kn.x, kn.y, 5, c); limb(kn.x, kn.y, ft.x, ft.y, 4, c); circle(ft.x, ft.y, 2.5, INK, null);
  }
  box(x - 34, foot - 54 - bob, 68, 18, '#d9542b', 5, 1.5);
  box(x + 28, foot - 56 - bob, 14, 12, '#3b3d40', 3, 1.2); circle(x + 38, foot - 50 - bob, 2, '#7fd3ff', null);
  box(x - 8, foot - 62 - bob, 16, 8, '#3b3d40', 2, 1.2);
}
function drawTreadmill(f) {
  box(256, 340, 164, 14, '#3b3d40', 6, 1.5);
  for (let i = 0; i < 9; i++) { const x = 262 + ((i * 20 - f * 4) % 180 + 180) % 180; if (x < 412) line(x, 342, x, 352, '#5d6064', 2); }
  circle(264, 347, 6, '#8a8f94', INK, 1.2); circle(412, 347, 6, '#8a8f94', INK, 1.2);
  line(270, 354, 270, 360, INK, 3); line(406, 354, 406, 360, INK, 3);
  line(256, 260, 256, 340, '#8a8f94', 3); line(256, 260, 300, 260, '#8a8f94', 3); line(300, 260, 330, 286, '#5d6064', 1.5);
}

/* ---------- Vormachen und Nachmachen ---------- */
// Becher vom linken Platz auf den Teller rechts und zurück
function alohaTip(f) {
  const a = { x: 474, y: 286 }, up = { x: 492, y: 252 }, b = { x: 512, y: 286 };
  if (f < 10) return { pt: a, closed: f >= 6 };
  if (f < 18) return { pt: mix(a, up, ease(seg(f, 10, 18))), closed: true };
  if (f < 26) return { pt: mix(up, b, ease(seg(f, 18, 26))), closed: true };
  if (f < 34) return { pt: b, closed: f < 30 };
  if (f < 40) return { pt: b, closed: f >= 36 };
  if (f < 48) return { pt: mix(b, up, ease(seg(f, 40, 48))), closed: true };
  if (f < 56) return { pt: mix(up, a, ease(seg(f, 48, 56))), closed: true };
  return { pt: a, closed: false };
}
const cupAt = f => (f >= 6 && f < 30) || (f >= 36 && f < 58);
function drawAloha(f) {
  box(434, 296, 196, 8, '#a8763f', 1, 1.5); line(444, 304, 444, 360, INK, 3); line(620, 304, 620, 360, INK, 3);
  text('VORMACHEN', 440, 140, 9, LN_MONO);
  const rec = f % 10 < 6;
  circle(522, 136, 4, rec ? '#d9342b' : '#5d1f1f', null); text('Aufnahme', 530, 140, 8, LN_MONO);
  box(494, 290, 30, 5, '#e6e3da', 2, 1);
  const t = alohaTip(f);
  // Roboter macht nach (vorne am Tisch)
  withAlpha('aloha', () => {
    box(448, 252, 14, 44, '#3b3d40', 1, 1.2);
    lnArm({ x: 455, y: 252 }, t.pt, '#e6e3da', t.closed);
    const cup = cupAt(f) ? { x: t.pt.x, y: t.pt.y + 2 } : (f < 6 || f >= 58 ? { x: 474, y: 288 } : { x: 512, y: 288 });
    box(cup.x - 6, cup.y - 12, 12, 14, '#3e6f9e', 2, 1.2);
  });
  // Führungsarm, den der Mensch bewegt (gleiche Gelenke, 80 weiter rechts)
  withAlpha('vormacherin', () => {
    const lt = { x: t.pt.x + 82, y: t.pt.y };
    box(530, 252, 14, 44, '#8a8f94', 1, 1.2);
    lnArm({ x: 537, y: 252 }, lt, '#f0b429', t.closed);
    person({ x: 612, face: -1, shirt: '#5f9a4a', pants: '#3b3d40', hair: '#3a2c22', hand: { x: lt.x + 4, y: lt.y - 4 } });
  });
}

function drawLernen(f) {
  ctx.fillStyle = '#dfe2df'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  ctx.fillStyle = '#a3a8ab'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  text('SO LERNEN ROBOTER', 20, 64, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.16)' });
  box(452, 52, 176, 70, '#f3f1ea', 2, 1.5);
  [['1', 'Üben, üben, üben'], ['2', 'Im Computer ausprobieren'], ['3', 'Einem Menschen nachmachen']].forEach(([n, t], i) => {
    text(n, 464, 74 + i * 19, 13, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#d9542b' });
    text(t, 478, 73 + i * 19, 10, { family: '"IBM Plex Sans", sans-serif', weight: 500 });
  });
  withAlpha('greiffarm', () => drawFarm(f));
  withAlpha('laufsim', () => drawSim(f));
  withAlpha('vierbeiner', () => { drawTreadmill(f); realDog(338, 340, f); });
  drawAloha(f);
}

registerRoom({
  key: 'lernen', name: 'Lernlabor', level: 'UG 1',
  hitOrder: ['vormacherin', 'aloha', 'vierbeiner', 'laufsim', 'greiffarm'],
  draw: drawLernen,
  robots: [
    { id: 'greiffarm', name: 'Greifarm-Farm', bereich: 'Lernen', aera: '2016', typ: 'Viele Arme, die Greifen üben',
      fakt: 'Ein Forschungsteam ließ bis zu 14 Roboterarme zwei Monate lang greifen üben, insgesamt über 800 000 Versuche. Aus jedem Erfolg und jedem Fehlgriff lernte ein Programm, wie man Dinge anfasst, die es vorher nie gesehen hat.',
      echt: 'Echt. Am Anfang greifen solche Arme oft daneben. Die Trefferquote steigt mit der Zahl der Versuche, so wie hier auf der Anzeige.',
      note: 'Der blaue Arm lässt sein Teil fallen. Auch das ist ein Versuch, aus dem er lernt.', color: '#f0b429',
      quelle: 'https://arxiv.org/abs/1603.02199',
      box: () => [LNX + 14, LNY + 136, 222, 170] },
    { id: 'laufsim', name: 'Lauf-Simulation', bereich: 'Lernen', aera: 'seit 2019', typ: 'Tausende Roboter im Computer',
      fakt: 'Bevor ein Vierbeiner draußen läuft, üben Tausende Kopien von ihm gleichzeitig im Computer. Wer umfällt, bekommt Minuspunkte, wer gut vorankommt, Pluspunkte. Nach wenigen Minuten Rechenzeit können die meisten laufen.',
      echt: 'Echt. Das Gelernte wird danach auf den echten Roboter übertragen. Die Rechenarbeit passiert in Rechenzentren wie dem neben Halle 103.',
      note: 'Rot liegt, grün läuft. Mit jeder Runde wird es grüner.', color: '#7fe08a',
      quelle: 'https://arxiv.org/abs/2109.11978',
      box: () => [LNX + 246, LNY + 60, 180, 128] },
    { id: 'vierbeiner', name: 'Vierbeiner auf dem Laufband', bereich: 'Lernen', aera: 'seit 2019', typ: 'Laufroboter, in der Simulation trainiert',
      fakt: 'Ein Forschungsteam aus Zürich hat seinem Vierbeiner das Laufen und Wiederaufstehen in der Simulation beigebracht und das Gelernte dann auf den echten Roboter gespielt. Er lief damit schneller als mit von Hand geschriebenen Programmen.',
      echt: 'Realistisch. Auf dem Laufband wird getestet, ob das Gelernte auch in echt klappt; das Seil hält ihn, falls nicht.',
      note: 'Trabt, ohne vom Fleck zu kommen.', color: '#d9542b',
      quelle: 'https://arxiv.org/abs/1901.08652',
      box: () => [LNX + 256, LNY + 260, 164, 100] },
    { id: 'aloha', name: 'Lernen durch Vormachen', bereich: 'Lernen', aera: 'seit 2023', typ: 'Roboterarm, der Bewegungen nachmacht',
      fakt: 'Ein Mensch bewegt einen Führungsarm, der Roboterarm macht jede Bewegung sofort nach. Dabei wird alles aufgezeichnet. Nach etwa 50 Vorführungen kann der Roboter die Aufgabe allein.',
      echt: 'Echt. Die Forschungsgruppe aus Stanford nutzte zwei Armpaare und ließ den Roboter so Akkus einsetzen oder Schuhe binden lernen. Hier ist es einfacher: ein Becher auf einen Teller.',
      note: 'Macht alles nach, auch das kurze Zögern.', color: '#e6e3da',
      quelle: 'https://arxiv.org/abs/2304.13705',
      box: () => [LNX + 440, LNY + 236, 90, 64] },
    { id: 'vormacherin', name: 'Vormacherin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch am Führungsarm',
      fakt: 'Zeigt dem Roboter, wie es geht.', note: 'Muss jede Bewegung oft wiederholen. Ganz schön langweilig.', color: '#5f9a4a',
      box: () => [LNX + 528, LNY + 236, 108, 124] },
  ],
});
