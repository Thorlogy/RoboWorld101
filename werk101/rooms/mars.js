/* Raum: Mars-Testgelände (Dach)
   Hauptfigur: Erdzwilling eines Marsrovers · Gag: Hubschrauber-Hüpfer in der Unterdruckkammer (Bild 35–50) · Querverweis: Rover-Selfie in der Satelliten-Werkstatt nebenan */
const MSX = rx(roomOf('mars').c), MSY = ry(roomOf('mars').r);
const marsRoverX = f => 70 + 90 * (0.5 - 0.5 * Math.cos(TAU * f / 60));
const rockBump = x => Math.max(0, 9 - Math.abs(x - 150) * 0.6);
const heliHop = f => (f >= 35 && f < 50 ? Math.sin(Math.PI * seg(f, 35, 50)) * 22 : 0);
const landerArm = f => 0.5 - 0.5 * Math.cos(TAU * f / 60);

function drawMars(f) {
  const sky = ctx.createLinearGradient(0, 0, 0, 330); sky.addColorStop(0, '#9fbfca'); sky.addColorStop(1, '#dfe6e1');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, RW, RH);
  text('MARS-TESTGELÄNDE', 24, 64, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  box(0, 200, 460, 140, '#c47a4e', 0, 2);
  ctx.fillStyle = '#b06a40'; for (const [x, h] of [[0, 40], [80, 70], [210, 30], [330, 60]]) { ctx.beginPath(); ctx.moveTo(x, 260); ctx.lineTo(x + 70, 260 - h); ctx.lineTo(x + 140, 260); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#c98b5a'; ctx.fillRect(0, 330, RW, 70);
  for (const [x, r] of [[150, 9], [40, 6], [430, 8], [250, 5]]) { ctx.beginPath(); ctx.ellipse(x, 340, r + 5, r, 0, Math.PI, TAU); paint('#7a4f33', INK, 1.5); }
  line(0, 340, RW, 340, INK, 2);

  withAlpha('marsrover', () => {
    const x = marsRoverX(f), wy = dx => 340 - 10 - rockBump(x + dx);
    line(x - 44, wy(-44), x - 4, 316, INK, 3); line(x - 4, 316, x + 18, wy(0), INK, 3); line(x + 18, wy(0), x + 44, wy(44), INK, 3);
    for (const dx of [-44, 0, 44]) wheel(x + dx, wy(dx), 10);
    box(x - 38, 290, 80, 18, '#e6e3da', 3);
    line(x - 24, 290, x - 24, 236, '#5d6064', 4);
    box(x - 38, 222, 30, 14, '#e6e3da', 3); circle(x - 32, 229, 3, '#23384d', null); circle(x - 20, 229, 3, '#23384d', null);
    box(x + 24, 280, 18, 10, '#8a8f94', 2, 1.2);
  });

  withAlpha('lander', () => {
    const t = landerArm(f);
    for (const [a, b] of [[262, 290], [300, 340], [338, 290]]) line(a, 300, b === 340 ? 300 : b, 338, '#5d6064', 3);
    box(256, 286, 88, 16, '#d6a521', 3);
    for (const cx of [228, 372]) { ctx.beginPath(); ctx.ellipse(cx, 286, 30, 8, 0, 0, TAU); paint('#23384d', INK, 1.5); }
    const tip = { x: 390, y: lerp(276, 316, t) }, el = ik2({ x: 330, y: 288 }, tip, 34, 34);
    limb(330, 288, el.x, el.y, 4, '#e6e3da'); limb(el.x, el.y, tip.x, tip.y, 4, '#e6e3da');
    circle(el.x, el.y, 3, '#3b3d40');
    ctx.beginPath(); ctx.arc(tip.x, tip.y + 12, 13, Math.PI, TAU); ctx.closePath(); paint('#e6e3da', INK, 1.5);
  });

  // Unterdruckkammer mit Mars-Hubschrauber
  withAlpha('heli', () => {
    ctx.fillStyle = 'rgba(200,225,235,0.45)'; ctx.fillRect(470, 150, 130, 190);
    box(470, 150, 130, 190, null, 10, 2.5); box(462, 140, 146, 14, '#5d6064', 3);
    const y = 330 - heliHop(f), spin = heliHop(f) > 0 || f % 30 < 10;
    for (const s of [-1, 1]) line(535 + s * 10, y - 4, 535 + s * 22, y + 8, INK, 2);
    box(522, y - 22, 26, 18, '#8a8f94', 3);
    line(535, y - 22, 535, y - 48, INK, 2);
    for (const dy of [-34, -44]) { ctx.beginPath(); ctx.ellipse(535, y + dy, spin ? (f % 2 ? 46 : 40) : 46, 2.5, 0, 0, TAU); ctx.fillStyle = spin ? 'rgba(42,39,35,0.35)' : '#3b3d40'; ctx.fill(); }
    box(522, y - 56, 26, 8, '#23384d', 1, 1.2);
  });
  withAlpha('ingenieurin', () => person({ x: 622, face: -1, shirt: '#f3f1ea', pants: '#3d5a80', hair: '#3a2c22', foot: 358, hand: { x: 604, y: 300 } }));
}

registerRoom({
  key: 'mars', name: 'Mars-Testgelände', level: 'Dach',
  hitOrder: ['ingenieurin', 'heli', 'lander', 'marsrover'],
  robots: [
    { id: 'marsrover', name: 'Rover-Zwilling', bereich: 'Raumfahrt', aera: 'seit 1997', typ: 'Testfahrzeug auf der Erde',
      fakt: 'Von jedem Marsrover baut die NASA einen Zwilling, der auf der Erde bleibt. Auf einem roten Testgelände mit Felsen probieren die Ingenieure Fahrmanöver aus, bevor sie die Befehle zum Mars schicken.',
      echt: 'Realistisch. Das Testgelände des Jet Propulsion Laboratory in Kalifornien heißt Mars Yard.',
      note: 'Fährt immer wieder über denselben Felsen. Das Fahrwerk kippt dabei mit, wie beim echten Rover.', color: '#e6e3da',
      quelle: 'https://en.wikipedia.org/wiki/Perseverance_(rover)',
      box: f => [MSX + marsRoverX(f) - 50, MSY + 216, 104, 134] },
    { id: 'heli', name: 'Mars-Hubschrauber', bereich: 'Raumfahrt', aera: 'seit 2021', typ: 'Kleiner Hubschrauber mit zwei Rotoren',
      fakt: 'Der Hubschrauber Ingenuity flog am 19. April 2021 als erstes Fluggerät auf einem anderen Planeten. Weil die Marsluft sehr dünn ist, wurde er auf der Erde in einer Kammer getestet, in der die Luft so dünn ist wie auf dem Mars.',
      echt: 'Realistisch: Draußen auf der Erde wäre die Luft für diesen Hubschrauber zu dicht, deshalb hüpft er in der Kammer.',
      note: 'Macht einen kleinen Hüpfer. Mehr braucht der Test nicht.', color: '#8a8f94',
      quelle: 'https://en.wikipedia.org/wiki/Ingenuity_(helicopter)',
      box: () => [MSX + 470, MSY + 150, 130, 190] },
    { id: 'lander', name: 'Landegerät mit Greifarm', bereich: 'Raumfahrt', aera: 'seit 2018', typ: 'Stationäres Landegerät',
      fakt: 'Das Landegerät InSight landete 2018 auf dem Mars und setzte mit seinem Roboterarm ein Seismometer auf den Boden, um Marsbeben zu messen. Den Ablauf übten die Ingenieure vorher auf der Erde mit einem Nachbau.',
      echt: 'Realistisch. Der Arm arbeitet sehr langsam, damit nichts verrutscht.',
      note: 'Setzt die Messkuppel ab und hebt sie wieder an. Üben, üben, üben.', color: '#d6a521',
      quelle: 'https://en.wikipedia.org/wiki/InSight',
      box: () => [MSX + 196, MSY + 262, 220, 82] },
    { id: 'ingenieurin', name: 'Ingenieurin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Prüft die Messwerte aus der Kammer.', note: 'Nebenan macht der Rover gerade ein Selfie.', color: '#f3f1ea',
      box: () => [MSX + 600, MSY + 236, 40, 124] },
  ],
  draw: drawMars,
});
