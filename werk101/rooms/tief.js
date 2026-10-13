/* Unter der Erde rechts: Teilchenbeschleuniger-Tunnel (r 7, c 6) und Heiße Zelle für den Rückbau (r 7, c 7)
   CERN: Ein Messroboter fährt an einer Schiene unter der Decke durch den Tunnel und misst Strahlung, Sauerstoff und Temperatur.
   Heiße Zelle: Hinter dickem Bleiglas zerlegt ein Greifarm ein Teil aus einem alten Kernkraftwerk, gesteuert von einem Menschen draußen. */
const CNX = rx(roomOf('cern').c), CNY = ry(roomOf('cern').r);
const HZX = rx(roomOf('heisszelle').c), HZY = ry(roomOf('heisszelle').r);
const T_MONO = { family: '"IBM Plex Mono", monospace', weight: 500 };

/* ---------- Beschleunigertunnel ---------- */
const timX = f => lerp(-120, RW + 120, f / 60);
function drawCern(f) {
  ctx.fillStyle = '#d9d6cc'; ctx.fillRect(0, 0, RW, RH);
  ctx.beginPath(); ctx.moveTo(0, 30); ctx.quadraticCurveTo(RW / 2, -20, RW, 30); ctx.lineTo(RW, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = '#8f8b82'; ctx.fill();
  ctx.fillStyle = '#9a958c'; ctx.fillRect(0, 342, RW, 58); line(0, 342, RW, 342, INK, 2);
  text('TEILCHENBESCHLEUNIGER', 24, 206, 30, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // blaue Magnetröhre auf Stützen, 27 km lang im Kreis
  for (const x of [80, 300, 520]) box(x - 14, 300, 28, 42, '#8a8f94', 1, 1.5);
  box(-10, 232, RW + 20, 68, '#2f6fb3', 30, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, 240, RW, 10);
  for (let x = 90; x < RW; x += 160) { line(x, 232, x, 300, '#245a92', 3); box(x - 30, 252, 60, 20, '#f3f1ea', 2, 1); text('MAGNET', x, 266, 7, Object.assign({ align: 'center' }, T_MONO)); }
  // Kabeltrasse und Schiene unter der Decke
  box(0, 60, RW, 6, '#f0b429', 0, 1);
  line(0, 100, RW, 100, '#5d6064', 5);
  for (let x = 20; x < RW; x += 80) line(x, 66, x, 98, '#5d6064', 2);
  // Hinweisschild
  box(500, 130, 120, 40, '#f0b429', 2, 1.5); text('STRAHLUNG', 560, 147, 10, Object.assign({ align: 'center' }, T_MONO)); text('nur Roboter', 560, 162, 9, Object.assign({ align: 'center' }, T_MONO));
  withAlpha('tim', () => {
    const x = timX(f);
    for (let k = 0; k < 3; k++) {
      const wx = x - k * 46;
      box(wx - 20, 104, 40, 30, k === 1 ? '#e6e3da' : '#f3f1ea', 4, 1.5); circle(wx - 12, 101, 3, '#3b3d40', INK, 1); circle(wx + 12, 101, 3, '#3b3d40', INK, 1);
    }
    box(x - 64, 134, 14, 16, '#3b3d40', 2, 1.2); circle(x - 57, 150, 4, '#23384d', INK, 1);
    box(x + 18, 112, 8, 12, '#2a2723', 1, 1); glow(x + 26, 118, 10, 'rgba(255,240,180,0.9)');
    // ausfahrender Messarm misst die Strahlung an der Röhre
    const arm = f >= 22 && f < 38 ? Math.sin(Math.PI * seg(f, 22, 38)) : 0;
    line(x - 46, 134, x - 46, 134 + 90 * arm, '#8a8f94', 3);
    if (arm > 0.5) { box(x - 52, 220, 12, 10, '#d9542b', 2, 1); text('0,3 µSv/h', x - 46, 214, 8, Object.assign({ align: 'center' }, T_MONO)); }
  });
}

/* ---------- Heiße Zelle: Fernhantierung durch Bleiglas ---------- */
function hzTip(f) {
  const a = { x: 150, y: 270 }, b = { x: 270, y: 236 };
  if (f < 20) return mix(a, b, ease(seg(f, 0, 20)));
  if (f < 40) return { x: 270 + 6 * Math.sin(f * 1.4), y: 236 };
  return mix(b, a, ease(seg(f, 40, 60)));
}
function drawHeisseZelle(f) {
  ctx.fillStyle = '#cfcac0'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#9a958c'; ctx.fillRect(0, 342, RW, 58); line(0, 342, RW, 342, INK, 2);
  text('RÜCKBAU', 400, 74, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Zelle mit Wasserbecken links, dicke Betonwand mit Bleiglasfenster rechts davon
  box(10, 110, 340, 232, '#b8b3a8', 0, 2);
  ctx.fillStyle = 'rgba(80,150,200,0.55)'; ctx.fillRect(30, 250, 300, 92); line(30, 250, 330, 250, '#2f6fb3', 2);
  box(352, 90, 70, 252, '#8f8b82', 0, 2);
  ctx.fillStyle = 'rgba(255,214,120,0.55)'; ctx.fillRect(356, 150, 62, 90); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(356, 150, 62, 90);
  text('BLEIGLAS 1 m', 387, 260, 8, Object.assign({ align: 'center' }, T_MONO));
  // Bauteil unter Wasser, wird Stück für Stück zerschnitten
  const cuts = Math.floor(f / 20);
  box(240, 286, 70, 40, '#8a8f94', 2, 1.5);
  for (let i = 0; i <= cuts; i++) line(252 + i * 16, 286, 252 + i * 16, 326, INK, 1);
  for (let i = 0; i < 3; i++) { const t = ((f * 2 + i * 20) % 60) / 60; circle(270 + i * 6, 296 - t * 46, 2, 'rgba(255,255,255,0.8)', null); }
  // Greifarm von der Decke
  withAlpha('telemanipulator', () => {
    const t = hzTip(f);
    line(80, 112, 300, 112, '#5d6064', 5);
    const S = { x: 120 + 0.4 * (t.x - 150), y: 116 }, E = elbowOf(S, t, 80, 80, 1);
    box(S.x - 12, 112, 24, 12, '#3b3d40', 2, 1.2);
    limb(S.x, S.y, E.x, E.y, 10, '#f0b429'); limb(E.x, E.y, t.x, t.y, 8, '#f0b429'); circle(E.x, E.y, 5, '#3b3d40', INK, 1);
    box(t.x - 6, t.y, 12, 16, '#3b3d40', 2, 1);
    if (f >= 20 && f < 40) for (let i = 0; i < 4; i++) circle(t.x + (rnd(f + i) - 0.5) * 10, t.y + 18 + rnd(f * 3 + i) * 8, 1.5, '#7fd3ff', null);
  });
  // Bedienerin draußen steuert mit zwei Handgriffen und schaut durchs Fenster
  withAlpha('fernbediener', () => {
    const t = hzTip(f), w = (t.x - 150) / 120;
    box(428, 262, 44, 80, '#5d6064', 2, 1.5);
    line(446, 262, 440 - 10 * w, 244, INK, 3); line(458, 262, 462 - 6 * w, 246, INK, 3);
    circle(440 - 10 * w, 244, 3, '#d9542b', INK, 1); circle(462 - 6 * w, 246, 3, '#d9542b', INK, 1);
    person({ x: 494, face: -1, shirt: '#2f5880', pants: '#3b3d40', hair: '#a8763f', hat: '#f0b429', hand: { x: 462 - 6 * w, y: 250 } });
  });
  // Dosimeter-Anzeige außen
  box(530, 140, 92, 40, '#1a1d22', 2, 1.5); text('drinnen: hoch', 576, 156, 8, Object.assign({ align: 'center', color: '#ff8a7a' }, T_MONO)); text('draußen: normal', 576, 170, 8, Object.assign({ align: 'center', color: '#7fe08a' }, T_MONO));
}

registerRoom({
  key: 'cern', name: 'Teilchenbeschleuniger', level: 'UG 1',
  hitOrder: ['tim'],
  draw: drawCern,
  robots: [
    { id: 'tim', name: 'Messroboter im Beschleuniger', bereich: 'Inspektion', aera: 'seit 2017', typ: 'Kleiner Zug an einer Deckenschiene',
      fakt: 'Am Forschungszentrum CERN bei Genf liegt 100 Meter unter der Erde ein Tunnel von 27 Kilometern im Kreis. Darin fährt ein Roboter an einer Schiene unter der Decke, misst Strahlung, Sauerstoff und Temperatur und macht Bilder. So müssen Menschen seltener hinein.',
      echt: 'Echt, er heißt TIM. Der Tunnel ist hier viel kürzer gezeichnet; in echt fährt TIM stundenlang, bis er einmal herum ist.',
      note: 'Fährt durch, hält kurz an und hält seinen Messarm an die blaue Röhre.', color: '#f3f1ea',
      quelle: 'https://home.cern/about/updates/2016/11/meet-tim-lhc-tunnels-robot',
      box: f => [CNX + timX(f) - 120, CNY + 96, 150, 60] },
  ],
});
registerRoom({
  key: 'heisszelle', name: 'Rückbau: Heiße Zelle', level: 'UG 1',
  hitOrder: ['fernbediener', 'telemanipulator'],
  draw: drawHeisseZelle,
  robots: [
    { id: 'telemanipulator', name: 'Fernbedienter Greifarm', bereich: 'Rettung', aera: 'seit den 1950ern', typ: 'Arm hinter einer Schutzwand',
      fakt: 'Wenn ein Kernkraftwerk abgebaut wird, sind manche Teile so stark strahlend, dass kein Mensch nah herangehen darf. Ein Greifarm zerschneidet sie unter Wasser, das Wasser hält die Strahlung zurück. Ein Mensch steuert ihn von draußen und schaut durch ein dickes Fenster aus Bleiglas.',
      echt: 'Echt. In Deutschland werden gerade viele Kernkraftwerke so zerlegt. Nach dem Unfall in Fukushima schickte man außerdem kleine Roboter in die Reaktoren, um nachzusehen, wo die Schäden sind.',
      note: 'Folgt jeder Bewegung der Handgriffe draußen und schneidet das Teil Stück für Stück.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/Remote_manipulator',
      box: () => [HZX + 60, HZY + 106, 270, 230] },
    { id: 'fernbediener', name: 'Bedienerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch am Steuerpult',
      fakt: 'Bewegt draußen zwei Handgriffe, drinnen macht der Arm genau dasselbe.', note: 'Trägt ein Messgerät, das zählt, wie viel Strahlung sie abbekommt. Hier draußen: fast nichts.', color: '#2f5880',
      box: () => [HZX + 426, HZY + 210, 90, 150] },
  ],
});
