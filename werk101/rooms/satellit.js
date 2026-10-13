/* Raum: Satelliten-Werkstatt (Dach) – Reinraum
   Hauptfigur: Andock-Simulator mit zwei Industrierobotern · Gag: der Zielsatellit taumelt, der Wartungssatellit dreht sich mit, bis er ihn fängt · Querverweis: Kran auf dem Dach */
const AX = rx(roomOf('satellit').c), AY = ry(roomOf('satellit').r);

const panelT = f => (f < 16 ? 0 : f < 32 ? ease(seg(f, 16, 32)) : f < 48 ? 1 : f < 58 ? 1 - ease(seg(f, 48, 58)) : 0);
// Andock-Simulator: Annähern (0–25), Drehung angleichen (25–40), fangen (40–52), loslassen und zurück (52–60)
const dockAng = f => 0.35 * Math.sin(TAU * f / 60);
const dockMatch = f => (f < 25 ? 0 : f < 35 ? ease(seg(f, 25, 35)) : f < 52 ? 1 : 1 - ease(seg(f, 52, 58)));
const dockB = f => ({ x: f < 25 ? lerp(540, 492, ease(seg(f, 0, 25))) : f < 52 ? 492 : lerp(492, 540, ease(seg(f, 52, 60))), y: 230 });
const dockMsg = f => (f < 25 ? 'Annähern' : f < 40 ? 'Drehung angleichen' : f < 52 ? 'Gefangen!' : 'Zurück');

function wheel(x, y, r) { circle(x, y, r, '#8a8f94'); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; line(x, y, x + Math.cos(a) * (r - 2), y + Math.sin(a) * (r - 2), '#5d6064', 1); } circle(x, y, 2.5, '#3b3d40', null); }

function drawSatellit(f) {
  ctx.fillStyle = '#eef1f2'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  // Deckenfilter des Reinraums
  for (let x = 20; x < RW; x += 80) { box(x, 8, 60, 10, '#d6dadc', 0, 1.2); for (let i = 4; i < 60; i += 6) line(x + i, 10, x + i, 16, '#b8bec2', 1); }
  text('REINRAUM', 24, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#c9cfd2'; ctx.fillRect(0, 360, RW, 40);
  for (let x = 0; x < RW; x += 32) line(x, 360, x, 400, '#b5bcc0', 1);
  line(0, 360, RW, 360, INK, 2);

  // Satellit auf dem Prüfstand, Solarflügel hängen zum Ausfalttest an Seilen
  withAlpha('satellit', () => {
    box(110, 300, 60, 60, '#5d6064', 2);
    box(124, 286, 32, 14, '#8a8f94', 2, 1.5);
    box(112, 196, 56, 90, '#d6a521', 4);
    ctx.strokeStyle = 'rgba(42,39,35,0.25)'; ctx.lineWidth = 1; for (let y = 204; y < 284; y += 10) { ctx.beginPath(); ctx.moveTo(114, y); ctx.lineTo(166, y + 4); ctx.stroke(); }
    box(128, 172, 24, 24, '#e6e3da', 2, 1.5);
    ctx.beginPath(); ctx.ellipse(140, 168, 18, 6, 0, 0, TAU); paint('#f3f1ea');
    const t = panelT(f);
    for (const s of [-1, 1]) {
      const n = 3, w = 34, base = s < 0 ? 112 : 168;
      for (let i = 0; i < n; i++) {
        const x0 = s < 0 ? base - (i + 1) * w * t - 6 * (1 - t) : base + i * w * t + 6 * (1 - t);
        const wPanel = Math.max(5, w * t);
        box(x0, 212, wPanel, 54, '#23384d', 1, 1.5);
        if (t > 0.4) { ctx.strokeStyle = '#3e6f9e'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 4; k++) { ctx.moveTo(x0, 212 + k * 13.5); ctx.lineTo(x0 + wPanel, 212 + k * 13.5); } ctx.stroke(); }
        line(x0 + wPanel / 2, 18, x0 + wPanel / 2, 212, '#8a8f94', 1);
      }
    }
  });

  // Andock-Simulator: zwei Industrieroboter spielen nach, wie ein Wartungssatellit einen taumelnden Satelliten fängt
  box(470, 36, 150, 50, '#18263a', 3, 1.5);
  text('ANDOCK-SIMULATOR', 545, 54, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#9fc4d6' });
  text(dockMsg(f), 545, 74, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: f >= 40 && f < 52 ? '#7fe08a' : '#ffb347' });
  withAlpha('andock', () => {
    const tA = { x: 440, y: 230 }, tB = dockB(f), ang = dockAng(f), m = dockMatch(f);
    // Roboter A hält den taumelnden Zielsatelliten
    let E = ik2({ x: 360, y: 300 }, { x: tA.x - 30, y: tA.y + 10 }, 70, 66);
    box(340, 300, 40, 60, '#f0b429', 3, 2); limb(360, 300, E.x, E.y, 16, '#f0b429'); limb(E.x, E.y, tA.x - 30, tA.y + 10, 12, '#f0b429'); circle(E.x, E.y, 8, '#3b3d40');
    ctx.save(); ctx.translate(tA.x, tA.y); ctx.rotate(ang);
    box(-24, -20, 48, 40, '#d6a521', 4, 1.8); box(24, -10, 30, 20, '#23384d', 1, 1.2); line(-24, 0, -34, 0, INK, 3); circle(-36, 0, 4, '#8a8f94', INK, 1);
    ctx.restore();
    // Roboter B mit Wartungssatellit und kleinem Greifarm
    E = ik2({ x: 600, y: 300 }, { x: tB.x + 34, y: tB.y + 10 }, 70, 66);
    box(580, 300, 40, 60, '#f0b429', 3, 2); limb(600, 300, E.x, E.y, 16, '#f0b429'); limb(E.x, E.y, tB.x + 34, tB.y + 10, 12, '#f0b429'); circle(E.x, E.y, 8, '#3b3d40');
    ctx.save(); ctx.translate(tB.x, tB.y); ctx.rotate(ang * m);
    box(-10, -18, 44, 36, '#f3f1ea', 4, 1.8); circle(4, -6, 4, '#23384d', null);
    const g = f >= 40 && f < 54 ? 4 : 10;
    line(-10, 0, -26, 0, '#8a8f94', 4); line(-26, 0, -34, -g, INK, 2.5); line(-26, 0, -34, g, INK, 2.5);
    ctx.restore();
  });
  // Technikerin im Reinraumanzug
  // Granittisch: der Würfelroboter der Raumstation gleitet auf einem Luftkissen fast reibungsfrei
  box(226, 296, 104, 18, '#5d5a55', 2); for (let i = 0; i < 12; i++) circle(232 + rnd(i) * 92, 300 + rnd(i + 3) * 10, 1.1, '#8a8780', null);
  box(236, 314, 10, 46, '#3b3d40'); box(310, 314, 10, 46, '#3b3d40');
  withAlpha('astrobee', () => {
    const x = 270 + 26 * Math.sin(TAU * f / 60);
    box(x - 14, 290, 28, 6, '#8a8f94', 2, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 12 + i * 10, 296, 4, 1.5);
    box(x - 14, 266, 28, 24, '#f3f1ea', 3, 1.5);
    box(x - 12, 270, 5, 16, '#d9542b', 1, 1); box(x + 7, 270, 5, 16, '#d9542b', 1, 1);
    circle(x, 278, 3, '#23384d', INK, 1); circle(x + 9, 268, 1.5, f % 6 < 3 ? '#7fe08a' : '#2d5b33', null);
  });
  withAlpha('technik', () => {
    const p = person({ x: 196, face: 1, shirt: '#f3f1ea', pants: '#f3f1ea', hat: '#f3f1ea', skin: '#e2b48f', hand: { x: 214, y: 290 } });
    box(p.head.x + 2, p.head.y + 1, 9, 6, '#7fd3ff', 2, 1);
    box(210, 284, 22, 14, '#3b3d40', 2, 1.2);
    ctx.fillStyle = '#7fe08a'; ctx.fillRect(213, 287, 16, 7);
  });
}

registerRoom({
  key: 'satellit', name: 'Satelliten-Werkstatt', level: 'Dach',
  hitOrder: ['astrobee', 'technik', 'andock', 'satellit'],
  robots: [
    { id: 'andock', name: 'Andock-Simulator', bereich: 'Raumfahrt', aera: 'seit 2013', typ: 'Zwei Industrieroboter spielen Weltraum',
      fakt: 'Beim DLR in Oberpfaffenhofen halten zwei große Industrieroboter je ein Satellitenmodell und bewegen sie so, als schwebten sie im All. So wird geübt, wie ein Wartungssatellit mit einem Greifarm einen taumelnden, kaputten Satelliten fängt, um ihn zu reparieren oder aus der Umlaufbahn zu holen.',
      echt: 'Echt. In der echten Anlage sitzt am Wartungssatelliten noch ein eigener Leichtbauarm, der zugreift.',
      note: 'Der goldene Satellit taumelt. Der weiße dreht sich mit und greift zu, sobald beide gleich schnell sind.', color: '#f0b429',
      quelle: 'https://www.dlr.de/en/rm/research/robotic-systems/multi-arm/oos-sim',
      box: () => [AX + 330, AY + 180, 300, 180] },
    { id: 'satellit', name: 'Satellit', bereich: 'Raumfahrt', aera: 'seit 1957', typ: 'Satellit mit ausklappbaren Solarflügeln',
      fakt: 'Solarflügel werden vor dem Start auf der Erde viele Male aus- und eingeklappt. Weil sie für die Schwerelosigkeit gebaut sind, hängen sie dabei an Seilen, die ihr Gewicht abfangen.',
      echt: 'Realistisch, auch die goldene Folie: Sie schützt den Satelliten vor Hitze und Kälte im All.',
      note: 'Klappt seine Flügel aus und wieder ein. Prüfen heißt hier: oft wiederholen.', color: '#d6a521',
      quelle: 'https://en.wikipedia.org/wiki/Solar_panels_on_spacecraft',
      box: () => [AX + 6, AY + 160, 270, 200] },
    { id: 'astrobee', name: 'Würfelroboter der Raumstation', bereich: 'Raumfahrt', aera: 'seit 2019', typ: 'Fliegender Helfer, 32 cm groß',
      fakt: 'Auf der Internationalen Raumstation fliegen würfelförmige Roboter. Sie saugen Luft an und blasen sie gezielt wieder aus, so bewegen sie sich in der Schwerelosigkeit. Sie filmen, machen Inventur und helfen bei Versuchen.',
      echt: 'Echt. Auf der Erde können sie nicht fliegen. Deshalb gleiten sie zum Testen auf einem Luftkissen über einen glatten Granittisch, fast ohne Reibung.',
      note: 'Gleitet hin und her, ohne den Tisch zu berühren.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Astrobee',
      box: () => [AX + 226, AY + 260, 104, 54] },
    { id: 'technik', name: 'Technikerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch im Reinraumanzug',
      fakt: 'Im Reinraum tragen alle Overall, Haube und Mundschutz, damit kein Staub und kein Haar auf die empfindliche Technik fällt.',
      note: 'Überwacht den Test auf dem Tablet.', color: '#f3f1ea',
      box: () => [AX + 176, AY + 232, 60, 128] },
  ],
  draw: drawSatellit,
});
