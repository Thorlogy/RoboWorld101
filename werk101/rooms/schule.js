/* Raum: Schule und Werkstatt (Ebene 3)
   Hauptfigur: Lernroboter als Linienfolger · Gag: hält das schwarze Mäppchen für seine Linie (Bild 20–38) · Querverweis: druckt Räder für Roboter */
const SCX = rx(roomOf('schule').c), SCY = ry(roomOf('schule').r);

function learnBot(f) {
  if (f < 20) return { x: lerp(60, 214, ease(seg(f, 0, 20))), rot: 0 };
  if (f < 26) return { x: 214 + 6 * seg(f, 20, 26), rot: -0.35 * seg(f, 20, 26) };
  if (f < 38) return { x: 220, rot: -0.35 + (f >= 34 ? 0.35 * seg(f, 34, 38) : 0) };
  return { x: lerp(220, 60, ease(seg(f, 38, 60))), rot: 0 };
}
function caseState(f) {
  if (f < 30) return { x: 238, y: 284, held: false };
  if (f < 34) return { x: lerp(238, 270, seg(f, 30, 34)), y: lerp(284, 250, seg(f, 30, 34)), held: true };
  if (f < 50) return { x: 270, y: 250, held: true };
  if (f < 56) return { x: lerp(270, 238, seg(f, 50, 56)), y: lerp(250, 284, seg(f, 50, 56)), held: true };
  return { x: 238, y: 284, held: false };
}

function drawSchule(f) {
  ctx.fillStyle = '#e8e6dc'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('SCHULE', 470, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#b9a58a'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  // Whiteboard mit Programm
  box(40, 60, 200, 110, '#fbfbf8', 2);
  const mono = { family: '"IBM Plex Mono", monospace', weight: 500 };
  box(54, 76, 120, 18, '#f0b429', 3, 1.2); text('wiederhole immer:', 60, 89, 10, mono);
  box(68, 98, 140, 18, '#3e6f9e', 3, 1.2); text('Linie dunkel?', 74, 111, 10, Object.assign({ color: '#f3f1ea' }, mono));
  box(82, 120, 120, 18, '#5f9a4a', 3, 1.2); text('→ nach links', 88, 133, 10, Object.assign({ color: '#f3f1ea' }, mono));
  box(82, 142, 120, 18, '#5f9a4a', 3, 1.2); text('sonst: rechts', 88, 155, 10, Object.assign({ color: '#f3f1ea' }, mono));

  // Tisch mit Fahrbahn
  box(30, 290, 270, 10, '#a8763f'); line(44, 300, 44, 358, INK, 3); line(286, 300, 286, 358, INK, 3);
  box(40, 286, 250, 4, '#f3f1ea', 0, 1); ctx.fillStyle = '#2a2723'; ctx.fillRect(40, 287, 250, 2);
  // Lernroboter
  withAlpha('lernbot', () => {
    const b = learnBot(f);
    ctx.save(); ctx.translate(b.x, 284); ctx.rotate(b.rot);
    box(-16, -16, 32, 14, '#f3f1ea', 4);
    box(-12, -24, 24, 9, '#2f6db3', 2, 1.2);
    for (let i = 0; i < 4; i++) circle(-8 + i * 5.3, -19.5, 1.4, f % 8 < 4 && i % 2 ? '#ffd23f' : '#7fd3ff', null);
    circle(-10, -2, 5, '#2d2f33'); circle(10, -2, 5, '#2d2f33');
    circle(14, -4, 2, '#d9542b', INK, 1);
    ctx.restore();
  });
  const cs = caseState(f);
  box(cs.x - 14, cs.y - 6, 28, 8, '#2a2723', 3, 1.5);

  // Kinder am Tisch
  withAlpha('kinder', () => {
    const lift = f >= 30 && f < 56;
    person({ x: 300, face: -1, s: 0.72, shirt: '#d9542b', pants: '#3e6f9e', hair: '#8a5a2b', hand: lift ? { x: cs.x + 8, y: cs.y } : { x: 270, y: 300 } });
    person({ x: 22, face: 1, s: 0.7, shirt: '#5f9a4a', pants: '#3b3d40', hair: '#2a1f18', hand: { x: 46, y: 300 } });
    if (f >= 24 && f < 32) text('?', 270, 224, 16, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#d9542b' });
  });

  // Lehrerin zeigt aufs Programm
  withAlpha('lehrerin', () => {
    const point = f >= 26 && f < 40;
    person({ x: 380, face: -1, shirt: '#7b4b8e', pants: '#3b3d40', hair: '#5a3a26', foot: 358, hand: point ? { x: 360, y: 232 } : { x: 368, y: 292 } });
    if (point) line(360, 232, 236, 112, '#8e6233', 2.5);
  });

  // 3D-Drucker auf dem Schrank
  box(430, 300, 160, 60, '#a8763f', 2);
  withAlpha('drucker', () => {
    box(450, 196, 120, 104, 'rgba(255,255,255,0)', 3, 2);
    box(450, 196, 120, 10, '#3b3d40', 2); box(450, 290, 120, 10, '#3b3d40', 2);
    for (const x of [454, 562]) box(x, 196, 4, 104, '#3b3d40', 0, 1);
    box(470, 270, 80, 6, '#8a8f94', 0, 1.2);
    // Werkstück: ein Rad, Schicht für Schicht
    ctx.beginPath(); ctx.ellipse(510, 270, 22, 4, 0, Math.PI, TAU); ctx.fillStyle = '#d9542b'; ctx.fill();
    box(488, 254, 44, 16, '#d9542b', 2, 1.5);
    for (let y = 256; y < 270; y += 3) line(490, y, 530, y, 'rgba(42,39,35,0.25)', 0.8);
    const nx = 488 + 44 * (0.5 - 0.5 * Math.cos(TAU * f / 6));
    line(458, 236, 562, 236, '#5d6064', 3);
    box(nx - 8, 228, 16, 16, '#3b3d40', 2, 1.2);
    ctx.beginPath(); ctx.moveTo(nx - 3, 244); ctx.lineTo(nx + 3, 244); ctx.lineTo(nx, 252); ctx.closePath(); paint('#c9a46a', INK, 1);
    line(nx, 228, 540, 206, '#d9542b', 1.2);
  });
}

registerRoom({
  key: 'schule', name: 'Schule und Werkstatt', level: 'Ebene 3',
  hitOrder: ['lernbot', 'kinder', 'lehrerin', 'drucker'],
  robots: [
    { id: 'lernbot', quelle: 'https://en.wikipedia.org/wiki/Educational_robotics', name: 'Lernroboter', bereich: 'Bildung', aera: 'seit den 1980ern', typ: 'Kleiner Fahrroboter mit Lichtsensoren',
      fakt: 'Ein Linienfolger hat unten Lichtsensoren, die hell und dunkel unterscheiden. Ein kurzes Programm sagt ihm, wann er nach links oder rechts lenken soll. Mit solchen Robotern lernen Kinder Programmieren in vielen Schulen.',
      echt: 'Genau so: Schwarze Gegenstände auf dem Tisch hält ein Linienfolger für seine Linie. Deshalb räumt man vor dem Test die Fahrbahn frei.',
      note: 'Folgt brav der Linie, bis das schwarze Mäppchen kommt.', color: '#2f6db3',
      box: f => [SCX + learnBot(f).x - 20, SCY + 256, 40, 34] },
    { id: 'drucker', name: '3D-Drucker', bereich: 'Bildung', aera: 'seit den 1980ern', typ: 'Drucker für Kunststoffteile',
      fakt: 'Ein 3D-Drucker baut Teile aus geschmolzenem Kunststoff auf, eine dünne Schicht über der anderen, meist zwischen 0,1 und 0,3 Millimeter dick. Schulen drucken damit Ersatzteile und eigene Roboterbauteile.',
      echt: 'Realistisch. Ein Rad wie dieses braucht im echten Drucker eher eine Stunde als fünf Sekunden.',
      note: 'Druckt ein Rad. Für welchen Roboter, verrät er nicht.', color: '#d9542b',
      quelle: 'https://en.wikipedia.org/wiki/Fused_filament_fabrication',
      box: () => [SCX + 448, SCY + 194, 124, 108] },
    { id: 'kinder', name: 'Kinder', bereich: 'Mensch', aera: 'Maßstab', typ: 'Zwei Kinder beim Programmieren',
      fakt: 'Testen ihr Programm. Eins der Kinder legt das Mäppchen jede Runde wieder zurück, um zu sehen, ob der Roboter es inzwischen kann.',
      note: 'Er kann es nicht. Dafür muss erst das Programm besser werden.', color: '#d9542b',
      box: () => [SCX + 6, SCY + 270, 312, 90] },
    { id: 'lehrerin', name: 'Lehrerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Zeigt auf die Zeile im Programm, an der es hakt.',
      note: 'Hat den Fehler sofort gesehen. Sagt ihn aber nicht.', color: '#7b4b8e',
      box: () => [SCX + 356, SCY + 236, 48, 124] },
  ],
  draw: drawSchule,
});
