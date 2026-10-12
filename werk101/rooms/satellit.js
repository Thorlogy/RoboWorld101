/* Raum: Satelliten-Werkstatt (Dach) – Reinraum
   Hauptfigur: Marsrover in der Testgrube · Gag: Selfie mit dem Kameraarm (Bild 0–15) · Querverweis: Kran auf dem Dach */
const AX = rx(roomOf('satellit').c), AY = ry(roomOf('satellit').r);

const panelT = f => (f < 16 ? 0 : f < 32 ? ease(seg(f, 16, 32)) : f < 48 ? 1 : f < 58 ? 1 - ease(seg(f, 48, 58)) : 0);
const selfieT = f => (f < 2 ? 0 : f < 8 ? ease(seg(f, 2, 8)) : f < 14 ? 1 : f < 20 ? 1 - ease(seg(f, 14, 20)) : 0);

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

  // Testgrube mit Sand und Steinen, Marsrover macht ein Selfie
  ctx.fillStyle = '#c98b5a'; ctx.fillRect(300, 332, 330, 28);
  box(296, 326, 338, 8, '#8a8f94', 0, 1.5);
  for (const [x, r] of [[350, 7], [420, 9], [590, 6]]) { ctx.beginPath(); ctx.ellipse(x, 334, r + 4, r, 0, Math.PI, TAU); paint('#7a4f33', INK, 1.5); }
  withAlpha('rover', () => {
    const x = 470, y0 = 304, s = selfieT(f);
    // Rocker-Bogie-Fahrwerk mit sechs Rädern
    line(x - 46, 336, x - 4, 316, INK, 3); line(x - 4, 316, x + 20, 336, INK, 3); line(x + 20, 336, x + 48, 336, INK, 3);
    line(x - 4, 316, x + 34, 324, INK, 3);
    wheel(x - 46, 342, 10); wheel(x, 342, 10); wheel(x + 46, 342, 10);
    box(x - 40, y0 - 2, 84, 18, '#e6e3da', 3);
    box(x + 26, y0 - 16, 18, 14, '#8a8f94', 2, 1.5);
    // Mast mit Kamerakopf
    line(x - 26, y0 - 2, x - 26, y0 - 64, '#5d6064', 4);
    box(x - 40, y0 - 78, 30, 14, '#e6e3da', 3); circle(x - 34, y0 - 71, 3, '#23384d', null); circle(x - 22, y0 - 71, 3, '#23384d', null);
    // Roboterarm mit Kamera
    const sh = { x: x + 40, y: y0 + 6 };
    const tip = mix({ x: x + 62, y: y0 + 24 }, { x: x + 110, y: y0 - 60 }, s);
    const el = ik2(sh, tip, 46, 46);
    limb(sh.x, sh.y, el.x, el.y, 5, '#b0b4b8'); limb(el.x, el.y, tip.x, tip.y, 4, '#b0b4b8');
    circle(el.x, el.y, 3, '#3b3d40'); box(tip.x - 6, tip.y - 6, 12, 12, '#3b3d40', 2, 1.2);
    if (f >= 8 && f < 10) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(tip.x, tip.y, 40, 0, TAU); ctx.fill(); }
  });

  // Technikerin im Reinraumanzug
  withAlpha('technik', () => {
    const p = person({ x: 250, face: 1, shirt: '#f3f1ea', pants: '#f3f1ea', hat: '#f3f1ea', skin: '#e2b48f', hand: { x: 268, y: 290 } });
    box(p.head.x + 2, p.head.y + 1, 9, 6, '#7fd3ff', 2, 1);
    box(264, 284, 22, 14, '#3b3d40', 2, 1.2);
    ctx.fillStyle = '#7fe08a'; ctx.fillRect(267, 287, 16, 7);
  });
}

registerRoom({
  key: 'satellit', name: 'Satelliten-Werkstatt', level: 'Dach',
  hitOrder: ['technik', 'rover', 'satellit'],
  robots: [
    { id: 'rover', name: 'Marsrover', bereich: 'Raumfahrt', aera: 'seit 1997', typ: 'Sechsrädriges Erkundungsfahrzeug',
      fakt: 'Der Rover Curiosity landete 2012 auf dem Mars, Perseverance 2021. Beide fotografieren sich regelmäßig selbst: Die Kamera am Roboterarm nimmt viele Einzelbilder auf, die zu einem Selfie zusammengesetzt werden. Der Arm ist dabei herausgerechnet.',
      echt: 'Echt, bis auf den Blitz. Auf dem Mars fahren die Rover sehr langsam, meist nur wenige Zentimeter pro Sekunde, damit sie nirgends hängen bleiben.',
      note: 'Macht jede Runde ein Selfie. Zur Sicherheit.', color: '#e6e3da',
      quelle: 'https://en.wikipedia.org/wiki/Curiosity_(rover)',
      box: () => [AX + 420, AY + 220, 150, 136] },
    { id: 'satellit', name: 'Satellit', bereich: 'Raumfahrt', aera: 'seit 1957', typ: 'Satellit mit ausklappbaren Solarflügeln',
      fakt: 'Solarflügel werden vor dem Start auf der Erde viele Male aus- und eingeklappt. Weil sie für die Schwerelosigkeit gebaut sind, hängen sie dabei an Seilen, die ihr Gewicht abfangen.',
      echt: 'Realistisch, auch die goldene Folie: Sie schützt den Satelliten vor Hitze und Kälte im All.',
      note: 'Klappt seine Flügel aus und wieder ein. Prüfen heißt hier: oft wiederholen.', color: '#d6a521',
      quelle: 'https://en.wikipedia.org/wiki/Solar_panels_on_spacecraft',
      box: () => [AX + 6, AY + 160, 270, 200] },
    { id: 'technik', name: 'Technikerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch im Reinraumanzug',
      fakt: 'Im Reinraum tragen alle Overall, Haube und Mundschutz, damit kein Staub und kein Haar auf die empfindliche Technik fällt.',
      note: 'Überwacht den Test auf dem Tablet.', color: '#f3f1ea',
      box: () => [AX + 230, AY + 232, 60, 128] },
  ],
  draw: drawSatellit,
});
