/* Raum: Containerhafen (EG)
   Hauptfigur: Containerbrücke mit fahrerlosem Transporter · Gag: Möwe auf dem Ausleger flieht vor der Laufkatze (Bild 20–35) · Querverweis: Möwe vom Dach */
const HFX = rx(roomOf('hafen').c), HFY = ry(roomOf('hafen').r);
function trolley(f) {
  if (f < 10) return { x: 560, y: lerp(140, 250, ease(seg(f, 0, 10))), load: false };
  if (f < 18) return { x: 560, y: lerp(250, 140, ease(seg(f, 10, 18))), load: true };
  if (f < 30) return { x: lerp(560, 300, ease(seg(f, 18, 30))), y: 140, load: true };
  if (f < 38) return { x: 300, y: lerp(140, 290, ease(seg(f, 30, 38))), load: true };
  if (f < 44) return { x: 300, y: lerp(290, 140, ease(seg(f, 38, 44))), load: false };
  return { x: lerp(300, 560, ease(seg(f, 44, 60))), y: 140, load: false };
}
const portAgvX = f => (f < 22 ? lerp(-90, 300, ease(seg(f, 0, 22))) : f < 42 ? 300 : lerp(300, -100, ease(seg(f, 42, 60))));
function hafenGull(f) {
  if (f < 20 || f >= 50) return { x: 360, y: 60, sit: true };
  if (f < 35) return { x: lerp(360, 120, seg(f, 20, 35)), y: 40 - 20 * Math.sin(Math.PI * seg(f, 20, 35)), sit: false };
  return { x: lerp(120, 360, seg(f, 35, 50)), y: 40 - 10 * Math.sin(Math.PI * seg(f, 35, 50)), sit: false };
}
function container(x, y, c) { box(x - 40, y, 80, 34, c, 1, 1.5); for (let i = -30; i < 40; i += 10) line(x + i, y + 4, x + i, y + 30, 'rgba(42,39,35,0.3)', 1); }

function drawHafen(f) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300); sky.addColorStop(0, '#9fbfca'); sky.addColorStop(1, '#dfe6e1');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, RW, RH);
  text('HAFEN', 24, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  // Kai und Wasser
  ctx.fillStyle = '#8f8b84'; ctx.fillRect(0, 330, 470, 70); line(0, 330, 470, 330, INK, 2);
  ctx.fillStyle = '#3e6f9e'; ctx.fillRect(470, 300, 170, 100);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 470; x < RW; x += 4) { const y = 304 + Math.sin(x / 12 + TAU * f / 30) * 2; x === 470 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
  // Schiff mit Containern
  ctx.beginPath(); ctx.moveTo(480, 290); ctx.lineTo(640, 290); ctx.lineTo(640, 330); ctx.lineTo(500, 330); ctx.closePath(); paint('#7a2a14');
  container(560, 222, '#3e6f9e'); container(560, 256, '#d9542b');
  if (f >= 60 || f < 10 || f >= 58) container(560, 188, '#f0b429');
  // Containerbrücke
  withAlpha('bruecke', () => {
    for (const x of [380, 460]) box(x - 6, 30, 12, 300, '#d9542b', 0, 1.5);
    box(180, 22, 460, 14, '#d9542b', 0, 1.5);
    line(380, 30, 460, 120, '#a8401f', 3); line(460, 30, 380, 120, '#a8401f', 3);
    const t = trolley(f);
    box(t.x - 16, 36, 32, 12, '#3b3d40', 2, 1.2);
    line(t.x - 10, 48, t.x - 30, t.y, INK, 1.2); line(t.x + 10, 48, t.x + 30, t.y, INK, 1.2);
    box(t.x - 40, t.y - 6, 80, 6, '#5d6064', 1, 1.2);
    if (t.load) container(t.x, t.y, '#f0b429');
  });
  // Fahrerloser Containertransporter
  withAlpha('transporter', () => {
    const x = portAgvX(f);
    box(x - 50, 304, 100, 22, '#e6e3da', 3);
    for (const dx of [-36, -12, 12, 36]) circle(x + dx, 328, 6, '#2d2f33');
    circle(x + 44, 312, 3, f % 6 < 3 ? '#ff8a24' : '#8a4a1c', INK, 1);
    if (f >= 38 && f < 60) container(x, 270, '#f0b429');
  });
  // Möwe auf dem Ausleger
  withAlpha('hafenmoewe', () => {
    const m = hafenGull(f);
    if (m.sit) { ctx.beginPath(); ctx.ellipse(m.x, m.y - 26, 10, 6, 0, 0, TAU); paint('#f3f1ea'); circle(m.x + 8, m.y - 32, 4, '#f3f1ea'); line(m.x + 11, m.y - 32, m.x + 16, m.y - 31, '#f0b429', 2); line(m.x - 2, m.y - 20, m.x - 2, m.y - 14, '#f0b429', 1.5); }
    else bird(m.x, m.y, false, m.x < 240 ? -1 : 1, f);
  });
}

registerRoom({
  key: 'hafen', name: 'Containerhafen', level: 'EG',
  hitOrder: ['hafenmoewe', 'transporter', 'bruecke'],
  robots: [
    { id: 'transporter', name: 'Fahrerloser Containertransporter', bereich: 'Logistik', aera: 'seit 2002', typ: 'Schwerlastfahrzeug ohne Fahrer',
      fakt: 'Am Container Terminal Altenwerder in Hamburg, eröffnet 2002, fahren rund 80 fahrerlose Fahrzeuge die Container zwischen Kai und Lager hin und her. Mehr als 17.000 Transponder im Boden zeigen jedem Fahrzeug seine genaue Position.',
      echt: 'Realistisch. Auf diesen Flächen arbeiten keine Menschen zu Fuß, damit es keine Unfälle gibt.',
      note: 'Holt einen Container ab und fährt los, ohne zu hupen.', color: '#e6e3da',
      quelle: 'https://hhla.de/en/magazine/thats-how-the-cta-works',
      box: f => [HFX + portAgvX(f) - 52, HFY + 270, 104, 64] },
    { id: 'bruecke', name: 'Containerbrücke', bereich: 'Logistik', aera: 'seit den 1950ern', typ: 'Kran mit Laufkatze',
      fakt: 'Containerbrücken heben die Stahlboxen vom Schiff an Land. In modernen Häfen fährt die Laufkatze teilweise automatisch; den genauen Griff am Schiff überwacht oft ein Mensch aus der Ferne.',
      echt: 'Realistisch, nur viel kleiner: Echte Containerbrücken sind höher als ein Haus mit 20 Stockwerken.',
      note: 'Hebt jede Runde einen gelben Container vom Schiff.', color: '#d9542b',
      quelle: 'https://en.wikipedia.org/wiki/Container_crane',
      box: () => [HFX + 180, HFY + 20, 460, 120] },
    { id: 'hafenmoewe', name: 'Möwe', bereich: 'Tier', aera: 'kein Roboter', typ: 'Hafenbewohnerin',
      fakt: 'Sitzt gern auf Kränen, weil man von dort alles sieht. Die Kollegin vom Dach klaut Pakete, diese hier ist ehrlich.',
      note: 'Fliegt weg, sobald die Laufkatze kommt, und landet danach wieder auf demselben Platz.', color: '#f3f1ea',
      box: f => { const m = hafenGull(f); return [HFX + m.x - 22, HFY + m.y - 40, 44, 34]; } },
  ],
  draw: drawHafen,
});
