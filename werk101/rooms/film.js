/* Raum: Filmstudio (Ebene 2)
   Hauptfigur: Kameraroboter für Zeitlupe · Gag: Take 47 – Erdbeere fällt in die Milch, alles von vorn (Bild 15–30) · Dazu: Kostüm, Motion-Capture, Puppenspiel, Requisiten im Stil dreier Epochen */
const FMX = rx(roomOf('film').c), FMY = ry(roomOf('film').r);
const camArm = f => { const t = f < 14 ? ease(seg(f, 0, 14)) : f < 26 ? 1 : f < 40 ? 1 - ease(seg(f, 26, 40)) : 0; return { x: lerp(150, 292, t), y: lerp(200, 270, t), t }; };
const berryY = f => (f < 15 ? 200 : f < 20 ? lerp(200, 290, seg(f, 15, 20) ** 2) : null);
const spiderX = f => 200 + 280 * (0.5 - 0.5 * Math.cos(TAU * f / 60));
const jaw = f => 0.25 + 0.25 * Math.sin(TAU * f / 20);

function drawFilm(f) {
  ctx.fillStyle = '#2f2d2a'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#3fa34d'; ctx.fillRect(240, 30, 260, 330);
  text('STUDIO 2', 24, 70, 36, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(243,241,234,0.15)' });
  ctx.fillStyle = '#4e4840'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  // Seilkamera
  withAlpha('seilkamera', () => {
    const x = spiderX(f), y = 80;
    for (const [ax, ay] of [[0, 8], [RW, 8]]) line(ax, ay, x, y, '#8a8f94', 1.2);
    line(x, y, 240, 8, '#8a8f94', 1); line(x, y, 500, 8, '#8a8f94', 1);
    box(x - 10, y - 6, 20, 14, '#2a2723', 3, 1.2); circle(x, y + 10, 4, '#3b3d40', INK, 1);
  });
  // Tisch mit Milchglas
  box(270, 300, 70, 8, '#f3f1ea', 1, 1.5); line(280, 308, 280, 358, '#8a8f94', 3); line(330, 308, 330, 358, '#8a8f94', 3);
  box(296, 266, 18, 34, 'rgba(255,255,255,0.7)', 2, 1.5); ctx.fillStyle = '#fbfaf6'; ctx.fillRect(298, 276, 14, 22);
  const by = berryY(f);
  if (by != null) { ctx.beginPath(); ctx.ellipse(305, by, 6, 8, 0, 0, TAU); paint('#d9342b', INK, 1.2); }
  if (f >= 20 && f < 30) { const t = seg(f, 20, 30); ctx.fillStyle = '#fbfaf6'; for (let i = 0; i < 8; i++) { const a = -Math.PI * (0.15 + i / 9); ctx.beginPath(); ctx.arc(305 + Math.cos(a) * 30 * t, 268 + Math.sin(a) * 34 * t + 30 * t * t, 3, 0, TAU); ctx.fill(); } }
  // Erdbeere hängt an der Halterung, bis sie fällt
  line(305, 120, 305, 192, '#8a8f94', 1.5); box(298, 186, 14, 6, '#3b3d40', 1, 1);
  if (f >= 40 && f < 60) { ctx.beginPath(); ctx.ellipse(305, 200, 6, 8, 0, 0, TAU); paint('#d9342b', INK, 1.2); }
  // Kameraroboter auf Schiene
  box(20, 344, 220, 10, '#5d6064', 1, 1.5);
  withAlpha('kamera', () => {
    const c = camArm(f), bx = 60 + 50 * c.t;
    box(bx - 28, 316, 56, 30, '#e6e3da', 4); circle(bx - 18, 350, 5, '#2d2f33'); circle(bx + 18, 350, 5, '#2d2f33');
    box(bx - 12, 296, 24, 22, '#d9542b', 3);
    const S = { x: bx, y: 298 }, E = ik2(S, c, 70, 70);
    limb(S.x, S.y, E.x, E.y, 11, '#d9542b'); limb(E.x, E.y, c.x, c.y, 9, '#d9542b');
    circle(S.x, S.y, 6, '#3b3d40'); circle(E.x, E.y, 5, '#3b3d40');
    box(c.x - 4, c.y - 10, 26, 18, '#2a2723', 3, 1.5); circle(c.x + 24, c.y - 1, 6, '#5d6064', INK, 1.5);
    if (f >= 14 && f < 30) circle(c.x - 2, c.y - 14, 3, '#ff3b30', null);
  });
  // Klappe
  box(344, 336, 46, 22, '#2a2723', 2); text('TAKE 47', 367, 352, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3f1ea' });
  // Motion-Capture-Darsteller vor dem Greenscreen, Monitor zeigt die Roboterfigur
  const pose = Math.sin(TAU * f / 30);
  withAlpha('mocap', () => {
    const p = person({ x: 430, face: -1, shirt: '#2a2723', pants: '#2a2723', hat: '#2a2723', skin: '#c99a74', hand: { x: 408 - 6 * pose, y: 236 - 20 * pose } });
    ctx.fillStyle = '#e8ff7a';
    for (const [x, y] of [[p.head.x, p.head.y - 12], [p.sh.x, p.sh.y + 2], [p.hand.x, p.hand.y], [p.hip.x, p.hip.y], [426, 356], [436, 356], [p.sh.x, p.sh.y + 24]]) { ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill(); }
  });
  withAlpha('mocap', () => {
    box(372, 40, 96, 64, '#2a2723', 3); ctx.fillStyle = '#10243a'; ctx.fillRect(376, 44, 88, 56);
    humanoid(420, 98, { s: 0.42, armL: -1.2 - 0.6 * pose, armR: 0.2, color: '#7fd3ff' });
  });
  // Requisitenregal mit eigenen Entwürfen im Stil dreier Film-Epochen
  withAlpha('requisite', () => {
    box(14, 196, 216, 8, '#8e6233', 0, 1.5); box(14, 120, 216, 6, '#8e6233', 0, 1.2);
    // 1920er: schlanker, stromlinienförmiger Roboter auf Sockel
    box(30, 186, 40, 10, '#5d6064', 1, 1.2);
    ctx.beginPath(); ctx.moveTo(40, 186); ctx.lineTo(44, 150); ctx.quadraticCurveTo(50, 136, 56, 150); ctx.lineTo(60, 186); ctx.closePath(); paint('#9fb3c8');
    ctx.beginPath(); ctx.moveTo(50, 132); ctx.lineTo(50, 124); ctx.lineTo(58, 134); ctx.closePath(); paint('#9fb3c8', INK, 1.2);
    for (let y = 158; y < 184; y += 6) line(44, y, 56, y, '#6f8399', 1);
    circle(50, 146, 2, '#ffd23f', null);
    // 1950er: kastiger Blechroboter mit Bullaugen
    box(98, 156, 36, 30, '#a0a4a8', 2); box(104, 132, 24, 22, '#a0a4a8', 2);
    circle(111, 142, 4, '#ffd23f', INK, 1); circle(121, 142, 4, '#ffd23f', INK, 1);
    line(116, 132, 116, 124, INK, 1.5); box(113, 120, 6, 4, '#d9542b', 1, 1);
    line(98, 164, 90, 180, INK, 3); line(134, 164, 142, 180, INK, 3);
    box(102, 186, 10, 10, '#5d6064', 1, 1); box(120, 186, 10, 10, '#5d6064', 1, 1);
    for (let k = 0; k < 3; k++) circle(108 + k * 8, 172, 2, f % 9 === k * 3 ? '#ff6b6b' : '#7a2a14', null);
    // 1980er: gedrungener Heimroboter mit Tablett
    box(164, 164, 40, 30, '#e6e3da', 8); box(160, 156, 48, 6, '#3b3d40', 1, 1);
    box(170, 140, 28, 16, '#23384d', 4, 1.2); line(176, 148, 180, 148, '#7fe08a', 2); line(188, 148, 192, 148, '#7fe08a', 2);
    circle(170, 196, 4, '#2d2f33'); circle(198, 196, 4, '#2d2f33');
    text('REQUISITE', 122, 116, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#e8e4da' });
  });
  // Schauspielerin im Roboterkostüm nimmt zwischen den Takes den Helm ab
  withAlpha('kostuem', () => {
    const off = f >= 30 && f < 50, lift = off ? Math.min(1, seg(f, 30, 34)) - seg(f, 46, 50) : 0;
    const x = 530;
    box(x - 10, 304, 9, 52, '#8a8f94', 2, 1.2); box(x + 1, 304, 9, 52, '#8a8f94', 2, 1.2);
    box(x - 13, 352, 12, 6, '#3b3d40', 1, 1); box(x + 1, 352, 12, 6, '#3b3d40', 1, 1);
    box(x - 16, 256, 32, 50, '#b0b4b8', 6); for (let y = 266; y < 300; y += 8) line(x - 12, y, x + 12, y, '#8a8f94', 1.2);
    circle(x, 240, 11, '#e2b48f'); ctx.beginPath(); ctx.arc(x, 236, 11, Math.PI * 1.05, Math.PI * 2.05); paint('#5a3a26');
    circle(x - 5, 240, 1.5, INK, null);
    const hx = x + 22 * lift, hy = 228 - 16 * lift;
    limb(x + 14, 262, hx + 8, hy + 18, 6, '#b0b4b8'); limb(x - 14, 262, x - 18, 300, 6, '#b0b4b8');
    box(hx - 15, hy - 8, 30, 28, '#b0b4b8', 8); box(hx - 11, hy + 2, 22, 8, '#23384d', 3, 1.2);
    if (off && f >= 36 && f < 44) { ctx.fillStyle = '#7fd3ff'; ctx.beginPath(); ctx.arc(x - 9, 236 + (f - 36) * 1.5, 2, 0, TAU); ctx.fill(); }
  });
  // Puppenspieler steuert einen Requisiten-Roboter fern
  const propX = 486 + 12 * Math.sin(TAU * f / 60);
  withAlpha('puppe', () => {
    box(propX - 14, 330, 28, 22, '#e6e3da', 6); circle(propX - 8, 355, 4, '#2d2f33'); circle(propX + 8, 355, 4, '#2d2f33');
    const turn = Math.sin(TAU * f / 20) * 4;
    box(propX - 10 + turn, 314, 20, 14, '#23384d', 4, 1.2); circle(propX - 4 + turn, 321, 2, '#7fe08a', null); circle(propX + 4 + turn, 321, 2, '#7fe08a', null);
    person({ x: 610, face: -1, shirt: '#3b3d40', pants: '#2a2723', hair: '#8a5a2b', hand: { x: 590, y: 290 } });
    box(578, 284, 18, 12, '#5d6064', 2, 1.2); line(582, 284, 576, 266, INK, 1.5);
  });
}

registerRoom({
  key: 'film', name: 'Filmstudio', level: 'Ebene 2',
  hitOrder: ['puppe', 'kostuem', 'mocap', 'requisite', 'seilkamera', 'kamera'],
  robots: [
    { id: 'kamera', name: 'Kameraroboter', bereich: 'Medien', aera: 'seit den 2000ern', typ: 'Schneller Industriearm mit Kamera',
      fakt: 'Für Zeitlupenaufnahmen in der Werbung schwenken schnelle Roboterarme die Kamera mit mehreren Metern pro Sekunde. Weil sie jede Bewegung millimetergenau wiederholen, lässt sich eine Aufnahme beliebig oft gleich drehen.',
      echt: 'Realistisch. Am Set müssen alle Abstand halten, denn der Arm ist schneller als jeder Mensch.',
      note: 'Fährt auf die fallende Erdbeere zu. Take 47.', color: '#d9542b',
      quelle: 'https://en.wikipedia.org/wiki/Motion_control_photography',
      box: f => { const c = camArm(f); return [FMX + Math.min(c.x, 40) - 10, FMY + c.y - 20, Math.max(c.x, 110) - Math.min(c.x, 40) + 40, 360 - c.y + 20]; } },
    { id: 'seilkamera', name: 'Seilkamera', bereich: 'Medien', aera: 'seit den 2000ern', typ: 'Kamera an vier Seilen',
      fakt: 'Seilkameras hängen an Seilen, die zu Motoren in den Ecken führen. Werden die Seile gleichzeitig länger oder kürzer, fliegt die Kamera über Bühnen und Fußballfelder.',
      echt: 'Realistisch. Im Studio hängt sie an vier Seilen, hier sieht man von der Seite nur zwei Paare.',
      note: 'Fährt einmal quer übers Set und wieder zurück.', color: '#2a2723',
      quelle: 'https://en.wikipedia.org/wiki/Skycam',
      box: f => [FMX + spiderX(f) - 14, FMY + 70, 28, 30] },
    { id: 'kostuem', quelle: 'https://en.wikipedia.org/wiki/C-3PO', name: 'Schauspielerin im Roboterkostüm', bereich: 'Medien', aera: 'seit den 1920ern', typ: 'Mensch in einem Kostüm',
      fakt: 'In vielen berühmten Filmrobotern steckte ein Mensch. In C-3PO aus „Star Wars“ (1977) spielte der Schauspieler Anthony Daniels, in R2-D2 saß in manchen Szenen Kenny Baker. Die Kostüme waren schwer und heiß.',
      echt: 'Genau so: Zwischen den Aufnahmen kommt der Helm ab, damit die Person darunter Luft bekommt.',
      note: 'Nimmt zwischen den Takes den Helm ab und wischt sich den Schweiß weg.', color: '#b0b4b8',
      box: () => [FMX + 504, FMY + 206, 60, 154] },
    { id: 'mocap', name: 'Motion-Capture-Darsteller', bereich: 'Medien', aera: 'seit den 1990ern', typ: 'Mensch im Anzug mit Markierungspunkten',
      fakt: 'Viele Filmroboter von heute entstehen am Computer. Ein Mensch spielt die Szene in einem Anzug mit Leuchtpunkten, Kameras messen jede Bewegung, und eine Software überträgt sie auf die Roboterfigur.',
      echt: 'Realistisch. Der Monitor zeigt live eine einfache Vorschau, die fertige Figur wird später aufwendig berechnet.',
      note: 'Hebt den Arm. Auf dem Monitor hebt der Roboter den Arm.', color: '#2a2723',
      quelle: 'https://en.wikipedia.org/wiki/Motion_capture',
      box: () => [FMX + 372, FMY + 40, 96, 320] },
    { id: 'puppe', name: 'Ferngesteuerte Filmfigur', bereich: 'Medien', aera: 'seit den 1980ern', typ: 'Requisiten-Roboter mit Fernsteuerung',
      fakt: 'Viele Filmroboter werden von Puppenspielern bewegt. Johnny 5 aus „Nummer 5 lebt!“ (1986) steuerte ein Puppenspieler mit einem Anzug voller Sensoren am Oberkörper: Hob er den Arm, hob auch die Figur den Arm.',
      echt: 'Realistisch. Die Puppenspieler stehen außerhalb des Bildes oder werden später herausgerechnet.',
      note: 'Fährt ein Stück vor und zurück und schaut sich um. Gesteuert vom Puppenspieler am Rand.', color: '#e6e3da',
      quelle: 'https://en.wikipedia.org/wiki/Short_Circuit_(1986_film)',
      box: f => [FMX + Math.min(486 + 12 * Math.sin(TAU * f / 60) - 18, 470), FMY + 230, 160, 130] },
    { id: 'requisite', quelle: 'https://en.wikipedia.org/wiki/R.U.R.', name: 'Requisitenregal', bereich: 'Medien', aera: '1920er bis 1980er', typ: 'Eigene Entwürfe im Stil dreier Epochen',
      fakt: 'Filmroboter zeigen, wie sich Menschen ihrer Zeit die Zukunft vorstellten: in den 1920ern glänzend und elegant, in den 1950ern kastig aus Blech, in den 1980ern als freundlicher Haushaltshelfer. Das Wort Roboter stammt aus Karel Čapeks Theaterstück „R.U.R.“ von 1920.',
      echt: 'Die drei Figuren sind eigene Entwürfe im Stil der Epochen, keine Nachbildungen bestimmter Filmroboter.',
      note: 'Warten auf ihren nächsten Einsatz. Der aus den 50ern blinkt ungeduldig.', color: '#9fb3c8',
      box: () => [FMX + 14, FMY + 110, 216, 96] },
  ],
  draw: drawFilm,
});
