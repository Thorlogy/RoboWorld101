/* Raum: Prüfstand (Ebene 2)
   Hauptfigur: Humanoider am Sicherungsseil · Gag: Schubs mit dem Stock, Roboter fängt sich (Bild 30–46) · Querverweis: Laufroboter wie in der Krankenstation, hier mit Greifarm */
const PX = rx(roomOf('pruef').c), PY = ry(roomOf('pruef').r);

function humanPush(f) {
  if (f < 30 || f >= 48) return { x: 150, rot: 0, step: 0 };
  if (f < 34) return { x: lerp(150, 140, seg(f, 30, 34)), rot: -0.22 * seg(f, 30, 34), step: 0.4 * seg(f, 30, 34) };
  if (f < 40) return { x: lerp(140, 132, seg(f, 34, 40)), rot: -0.22 + 0.16 * seg(f, 34, 40), step: 0.4 };
  return { x: lerp(132, 150, ease(seg(f, 40, 48))), rot: -0.06 * (1 - seg(f, 40, 48)), step: 0.4 * (1 - seg(f, 40, 48)) };
}
const stickX = f => (f < 24 ? 236 : f < 31 ? lerp(236, 172, ease(seg(f, 24, 31))) : f < 40 ? 172 : f < 50 ? lerp(172, 236, seg(f, 40, 50)) : 236);
const doorA = f => (f < 6 ? 0 : f < 22 ? ease(seg(f, 6, 22)) : f < 48 ? 1 : f < 58 ? 1 - ease(seg(f, 48, 58)) : 0);

function drawPruef(f) {
  ctx.fillStyle = '#d7dadb'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('PRÜFSTAND', 300, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#8f8b84'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  // Fallmatte und Portal mit Sicherungsseil
  box(80, 340, 150, 20, '#3b3d40', 4);
  ctx.strokeStyle = '#8a8f94'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 84 + (f * 3) % 12; x < 226; x += 12) { ctx.moveTo(x, 341); ctx.lineTo(x - 3, 345); }
  ctx.stroke();
  box(60, 40, 10, 312, '#f0b429'); box(240, 40, 10, 312, '#f0b429'); box(60, 34, 190, 12, '#f0b429');
  const h = humanPush(f);
  line(h.x, 46, h.x + Math.sin(h.rot) * 112, 240, '#3b3d40', 1.5);
  withAlpha('humanoid2', () => {
    const ph = TAU * f / 20, sw = Math.sin(ph);
    humanoid(h.x, 342, { rot: h.rot, legL: 0.35 * sw - h.step, legR: -0.35 * sw + h.step * 0.5, kneeL: 0.15 + Math.max(0, 0.7 * Math.sin(ph + 1.6)), kneeR: 0.15 + Math.max(0, -0.7 * Math.sin(ph + 1.6)),
      armL: -0.3 * sw - h.step * 2, armR: 0.3 * sw + h.step * 2, color: '#b9bec4' });
    box(h.x - 6 + Math.sin(h.rot) * 112, 236, 12, 6, '#3b3d40', 1, 1);
  });
  // Ingenieur mit Stock
  withAlpha('ingenieur', () => {
    const sx = stickX(f);
    person({ x: 300, face: -1, shirt: '#3d7f8f', pants: '#3b3d40', hat: '#f3f1ea', hand: { x: 270, y: 280 } });
    line(270, 280, sx, 270, '#8e6233', 4);
    box(sx - 6, 264, 10, 12, '#3b3d40', 2, 1);
    box(316, 300, 30, 20, '#3b3d40', 2, 1.2);
    if (f >= 31 && f < 36) text('Schubs!', 196, 236, 12, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#d9542b' });
  });

  // Tür mit Laufroboter und Greifarm
  box(480, 150, 12, 210, '#5d6064'); box(480, 142, 140, 12, '#5d6064');
  ctx.fillStyle = '#b8c4c9'; ctx.fillRect(492, 154, 120, 206);
  const a = doorA(f), dw = 110 * Math.cos(a * 1.25);
  box(492, 156, Math.max(6, dw), 204, '#a8763f', 1, 2);
  if (dw > 20) { line(492 + dw - 14, 262, 492 + dw - 4, 262, INK, 3); }
  withAlpha('hundarm', () => {
    const x = 430, by = 304;
    for (const [hx, d] of [[414, -1], [446, 1]]) { limb(hx, by + 6, hx + d * 6, 332, 5, '#4a4d52'); limb(hx + d * 6, 332, hx, 356, 4, '#4a4d52'); circle(hx + d * 6, 332, 3, '#e0662b', INK, 1.2); }
    box(402, by - 8, 56, 16, '#4a4d52', 5);
    ctx.fillStyle = '#e0662b'; ctx.fillRect(408, by - 4, 44, 3);
    box(452, by - 10, 12, 12, '#3b3d40', 3, 1.5); circle(460, by - 4, 2, '#7fd3ff', null);
    const tip = a > 0.05 ? { x: 492 + Math.max(6, dw) - 10, y: 262 } : { x: 470, y: 268 };
    const sh = { x: 432, y: by - 8 }, el = ik2(sh, tip, 30, 36);
    box(426, by - 14, 14, 8, '#3b3d40', 2, 1);
    limb(sh.x, sh.y, el.x, el.y, 6, '#4a4d52'); limb(el.x, el.y, tip.x, tip.y, 5, '#4a4d52');
    circle(el.x, el.y, 3, '#e0662b', INK, 1);
    line(tip.x, tip.y, tip.x + 6, tip.y - 4, INK, 2); line(tip.x, tip.y, tip.x + 6, tip.y + 4, INK, 2);
  });
}

registerRoom({
  key: 'pruef', name: 'Prüfstand', level: 'Ebene 2',
  hitOrder: ['ingenieur', 'hundarm', 'humanoid2'],
  robots: [
    { id: 'humanoid2', name: 'Humanoider im Test', bereich: 'Forschung', aera: 'seit den 2000ern', typ: 'Zweibeiniger Roboter am Sicherungsseil',
      fakt: 'Laufroboter werden absichtlich geschubst, um zu prüfen, ob sie das Gleichgewicht halten. Sensoren melden die Neigung, und der Roboter setzt in Sekundenbruchteilen einen Ausfallschritt. In Testvideos benutzen Ingenieure dafür oft einen Hockeyschläger.',
      echt: 'Genau so wird getestet, auch mit Seil und Matte für den Fall, dass der Roboter doch stürzt.',
      note: 'Läuft auf dem Laufband, wird mitten im Schritt geschubst und fängt sich, ohne stehen zu bleiben.', color: '#b9bec4',
      quelle: 'https://en.wikipedia.org/wiki/Atlas_(robot)',
      box: f => [PX + humanPush(f).x - 34, PY + 236, 68, 120] },
    { id: 'hundarm', name: 'Laufroboter mit Greifarm', bereich: 'Inspektion', aera: 'seit 2018', typ: 'Vierbeiner mit Arm auf dem Rücken',
      fakt: 'Boston Dynamics zeigte 2018 einen vierbeinigen Laufroboter, der mit einem Greifarm auf dem Rücken eine Tür öffnet und hindurchgeht. Solche Roboter machen heute Kontrollgänge in Industrieanlagen.',
      echt: 'Realistisch. Türklinken sind für Roboter trotzdem schwierig, weil jede Tür etwas anders aufgeht.',
      note: 'Öffnet die Tür und hält sie auf. Geht aber nie hindurch.', color: '#4a4d52',
      quelle: 'https://en.wikipedia.org/wiki/Spot_(robot)',
      box: () => [PX + 396, PY + 250, 110, 110] },
    { id: 'ingenieur', name: 'Testingenieur', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Prüfstock',
      fakt: 'Prüft, wie der Roboter auf Stöße reagiert, und notiert die Messwerte auf dem Tablet.',
      note: 'Schubst nur zu Testzwecken. Sagt er.', color: '#3d7f8f',
      box: () => [PX + 276, PY + 236, 74, 124] },
  ],
  draw: drawPruef,
});
