/* Raum: Raumstation-Training (UG 1)
   Hauptfigur: Würfelroboter auf dem Granittisch · Gag: gleitet fast reibungsfrei und stößt sanft an (Bild 5–20) · Querverweis: Mars und Satellit auf dem Dach */
const ISX = rx(roomOf('iss').c), ISY = ry(roomOf('iss').r);
function cubeX(f) {
  if (f < 5) return 420;
  if (f < 20) return lerp(420, 568, ease(seg(f, 5, 20)));
  if (f < 24) return 568 - 6 * Math.sin(Math.PI * seg(f, 20, 24));
  if (f < 50) return lerp(568, 420, ease(seg(f, 24, 50)));
  return 420;
}

function drawIss(f) {
  ctx.fillStyle = '#d7dbdd'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('TRAINING', 400, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#a3a8ab'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  // Modulnachbau, aufgeschnitten
  withAlpha('modul', () => {
    box(20, 90, 320, 230, '#eef0f0', 40, 2.5);
    box(30, 104, 300, 200, null, 30, 1.2);
    for (const x of [70, 150, 230, 300]) { box(x - 26, 120, 52, 70, '#f3f1ea', 3, 1.2); box(x - 18, 130, 36, 22, '#23384d', 2, 1); ctx.fillStyle = '#7fd3ff'; ctx.fillRect(x - 14, 136, 20 + (x % 7), 3); }
    for (const x of [60, 120, 180, 240, 300]) line(x, 206, x, 216, '#f0b429', 3);
    line(40, 211, 320, 211, '#f0b429', 2);
    box(330, 170, 14, 60, '#8a8f94', 2, 1.5);
  });
  withAlpha('astronautin', () => {
    person({ x: 170, foot: 312, face: 1, shirt: '#3e6f9e', pants: '#3e6f9e', hair: '#3a2c22', hand: { x: 196, y: f % 30 < 15 ? 212 : 218 } });
    box(160, 228, 20, 10, '#d9542b', 1, 1);
  });
  // Granittisch mit Würfelroboter auf Luftkissen
  box(380, 300, 230, 22, '#5d5a55', 2); for (let i = 0; i < 20; i++) circle(390 + rnd(i) * 210, 306 + rnd(i + 3) * 12, 1.2, '#8a8780', null);
  box(392, 322, 14, 38, '#3b3d40'); box(584, 322, 14, 38, '#3b3d40');
  box(376, 286, 6, 14, '#d9542b', 0, 1); box(608, 286, 6, 14, '#d9542b', 0, 1);
  withAlpha('wuerfel', () => {
    const x = cubeX(f);
    box(x - 18, 290, 36, 8, '#8a8f94', 2, 1.2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 16 + i * 14, 298, 4, 2);
    box(x - 20, 252, 40, 38, '#f3f1ea', 4);
    for (const dx of [-14, 8]) box(x + dx, 258, 6, 26, '#3b3d40', 1, 1);
    circle(x, 271, 4, '#23384d', INK, 1); circle(x + 14, 256, 2, f % 6 < 3 ? '#7fe08a' : '#2d5b33', null);
  });
  withAlpha('trainer', () => person({ x: 624, face: -1, shirt: '#f3f1ea', pants: '#3b3d40', hair: '#8a5a2b', hand: { x: 604, y: 296 } }));
}

registerRoom({
  key: 'iss', name: 'Raumstation-Training', level: 'UG 1',
  hitOrder: ['wuerfel', 'trainer', 'astronautin', 'modul'],
  robots: [
    { id: 'wuerfel', name: 'Würfelroboter', bereich: 'Raumfahrt', aera: 'seit 2019', typ: 'Frei fliegender Helfer für die Raumstation',
      fakt: 'Seit 2019 arbeiten drei würfelförmige NASA-Roboter namens Astrobee auf der Internationalen Raumstation. Zwei Lüfter pumpen Luft in den Würfel, die durch zwölf kleine Düsen wieder austritt und ihn so bewegt. Auf der Erde gleitet ein Zwilling auf einem Luftkissen über eine polierte Granitplatte.',
      echt: 'Genau so: Das Luftkissen ahmt die Schwerelosigkeit auf der Tischfläche nach.',
      note: 'Gleitet über den Tisch, stößt sanft an und schwebt zurück.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Astrobee',
      box: f => [ISX + cubeX(f) - 22, ISY + 248, 44, 52] },
    { id: 'modul', name: 'Modulnachbau', bereich: 'Raumfahrt', aera: 'Training', typ: 'Nachbau eines Raumstationsmoduls',
      fakt: 'Astronautinnen und Astronauten üben in genauen Nachbauten der Raumstationsmodule, bevor sie ins All fliegen. Das Europäische Astronautenzentrum dafür steht in Köln.',
      echt: 'Realistisch. Im Nachbau gibt es Schwerkraft, die Abläufe sind aber dieselben wie oben.',
      note: 'Sieht aus wie im All, nur mit Boden.', color: '#eef0f0',
      quelle: 'https://en.wikipedia.org/wiki/European_Astronaut_Centre',
      box: () => [ISX + 20, ISY + 90, 320, 230] },
    { id: 'astronautin', name: 'Astronautin im Training', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Übt Handgriffe am Experimentierschrank.', note: 'Oben auf dem Dach testet die Kollegin den Mars-Hubschrauber.', color: '#3e6f9e',
      box: () => [ISX + 150, ISY + 190, 50, 124] },
    { id: 'trainer', name: 'Trainer', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Startet den Würfelroboter für den nächsten Test.', note: 'Fängt ihn nie auf. Muss er auch nicht.', color: '#f3f1ea',
      box: () => [ISX + 600, ISY + 236, 44, 124] },
  ],
  draw: drawIss,
});
