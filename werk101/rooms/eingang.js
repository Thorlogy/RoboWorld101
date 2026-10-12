/* Raum: Eingangshalle (EG)
   Hauptfigur: Sicherheitsroboter · Gag: bremst an der Brunnenkante (Bild 50–6, Anspielung auf 2017) · Querverweis: Empfangsroboter schickt Besuch zum Aufzug */
const EX = rx(roomOf('eingang').c), EY = ry(roomOf('eingang').r);

function guardX(f) {
  const g = (f + 10) % 60;
  if (g < 30) return lerp(590, 486, ease(seg(g, 0, 30)));
  if (g < 40) return 486;
  return lerp(486, 590, ease(seg(g, 40, 60)));
}
const guardAlarm = f => { const g = (f + 10) % 60; return g >= 28 && g < 40; };
function visitor(f) {
  if (f < 24) return { x: lerp(40, 236, seg(f, 0, 24)), walk: true };
  if (f < 44) return { x: 236, walk: false };
  return { x: lerp(236, 700, seg(f, 44, 60)), walk: true };
}

function drawEingang(f) {
  ctx.fillStyle = '#e3e0d8'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('EMPFANG', 300, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#b5ada0'; ctx.fillRect(0, 360, RW, 40);
  for (let x = 0; x < RW; x += 40) box(x, 360, 40, 40, null, 0, 0.8);
  line(0, 360, RW, 360, INK, 2);
  // Drehtür
  box(10, 150, 110, 12, '#5d6064'); ctx.fillStyle = 'rgba(159,196,214,0.35)'; ctx.fillRect(10, 162, 110, 198);
  for (let i = 0; i < 4; i++) { const a = TAU * f / 60 / 4 * 4 + i * Math.PI / 2; line(65 + 50 * Math.cos(a), 166, 65 + 50 * Math.cos(a), 356, '#8a8f94', 3); }
  line(65, 162, 65, 360, INK, 2);
  // Empfangstresen
  box(150, 292, 130, 68, '#8e6233', 3); box(144, 286, 142, 8, '#3b3d40', 2);

  // Besucher (hinter der Drehtür-Glasfläche beginnt er)
  withAlpha('besuch', () => {
    const v = visitor(f), st = v.walk ? Math.sin(TAU * f / 8) * 4 : 0;
    ctx.globalAlpha *= Math.min(1, f / 4 + 0.15);
    person({ x: v.x + 30, face: 1, shirt: '#3d5a80', pants: '#3b3d40', hair: '#3a2c22', hand: { x: v.x + 38 + st, y: 296 } });
    box(v.x + 36 + st, 296, 14, 18, '#5d4632', 2, 1.2);
  });

  // Empfangsroboter: weißer Humanoider auf Rollen mit Tablet auf der Brust
  withAlpha('empfang', () => {
    const wave = f >= 24 && f < 40 ? Math.sin(TAU * f / 6) * 0.4 : 0;
    const x = 304;
    ctx.beginPath(); ctx.moveTo(x - 22, 356); ctx.lineTo(x - 12, 300); ctx.lineTo(x + 12, 300); ctx.lineTo(x + 22, 356); ctx.closePath(); paint('#f3f1ea');
    box(x - 16, 252, 32, 50, '#f3f1ea', 10);
    box(x - 11, 264, 22, 16, '#23384d', 2, 1.2);
    ctx.fillStyle = '#7fd3ff'; ctx.fillRect(x - 8, 268, 16, 2); ctx.fillRect(x - 8, 273, 10, 2);
    circle(x, 234, 17, '#f3f1ea');
    for (const dx of [-6, 6]) { circle(x + dx, 232, 4.5, '#2a2723', INK, 1); circle(x + dx, 232, 2.5, '#5aa9d6', null); }
    limb(x - 15, 262, x - 22, 296, 5, '#f3f1ea');
    const ha = -2.2 + wave;
    limb(x + 15, 262, x + 15 + Math.sin(ha + Math.PI) * -20, 262 + Math.cos(ha + Math.PI) * -20, 5, '#f3f1ea');
  });

  // Telepräsenzroboter mit Gesicht auf dem Bildschirm
  withAlpha('tele', () => {
    const x = 380;
    box(x - 18, 344, 36, 12, '#3b3d40', 4); circle(x - 10, 357, 3, '#2d2f33'); circle(x + 10, 357, 3, '#2d2f33');
    line(x, 344, x, 268, '#8a8f94', 4);
    box(x - 20, 238, 40, 30, '#2a2723', 3, 1.5);
    box(x - 17, 241, 34, 24, '#9fc4d6', 1, 1);
    circle(x, 250, 5, '#e2b48f', null); ctx.fillStyle = '#d9542b'; ctx.fillRect(x - 7, 256, 14, 9);
    circle(x, 236, 2, '#3b3d40', null);
  });

  // Brunnen und Sicherheitsroboter
  box(410, 330, 64, 30, '#8a8f94', 3); ctx.fillStyle = '#5aa9d6'; ctx.fillRect(414, 334, 56, 10);
  ctx.fillStyle = 'rgba(90,169,214,0.7)';
  for (let i = 0; i < 5; i++) { const t = ((f / 12 + i / 5) % 1); ctx.beginPath(); ctx.arc(442 + (i - 2) * 6 * t, 334 - 50 * Math.sin(Math.PI * t), 2.5, 0, TAU); ctx.fill(); }
  withAlpha('wache', () => {
    const x = guardX(f), alarm = guardAlarm(f);
    ctx.beginPath(); ctx.moveTo(x - 22, 352); ctx.quadraticCurveTo(x - 20, 260, x, 250); ctx.quadraticCurveTo(x + 20, 260, x + 22, 352); ctx.closePath(); paint('#f3f1ea');
    box(x - 24, 340, 48, 14, '#3b3d40', 4);
    circle(x - 14, 356, 4, '#2d2f33'); circle(x + 14, 356, 4, '#2d2f33');
    box(x - 14, 276, 28, 10, '#2a2723', 3, 1.2);
    for (let i = 0; i < 4; i++) circle(x - 9 + i * 6, 281, 1.4, '#7fd3ff', null);
    box(x - 17, 300, 34, 5, alarm && f % 4 < 2 ? '#f0b429' : '#3e6f9e', 2, 1);
    if (alarm) text('STOPP: WASSER', x - 4, 236, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#d9542b' });
  });
}

registerRoom({
  key: 'eingang', name: 'Eingangshalle', level: 'EG',
  hitOrder: ['besuch', 'tele', 'empfang', 'wache'],
  robots: [
    { id: 'wache', name: 'Sicherheitsroboter', bereich: 'Service', aera: 'seit den 2010ern', typ: 'Patrouillenroboter mit Kameras',
      fakt: 'Sicherheitsroboter fahren in Einkaufszentren, Parkhäusern und Büros Streife und melden Auffälliges an eine Leitstelle. 2017 fuhr in Washington einer dieser Roboter in einen Zierbrunnen, das Foto ging um die Welt.',
      echt: 'Der Brunnen-Unfall von 2017 ist echt. Heute erkennen solche Roboter Treppen und Wasserkanten meist rechtzeitig.',
      note: 'Hat aus dem Fehler seines Kollegen gelernt. Bremst an der Kante.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Knightscope',
      box: f => [EX + guardX(f) - 26, EY + 246, 52, 114] },
    { id: 'empfang', name: 'Empfangsroboter', bereich: 'Service', aera: 'seit 2014', typ: 'Humanoider auf Rollen mit Tablet',
      fakt: 'Der rund 1,20 Meter große Roboter Pepper wurde 2014 in Japan vorgestellt und begrüßte Gäste in Banken, Geschäften und Hotels. Er fährt auf Rollen und zeigt Informationen auf dem Tablet an seiner Brust.',
      echt: 'Realistisch. Solche Roboter beantworten einfache Fragen; schwierige Anliegen übernimmt das Personal.',
      note: 'Winkt jedem Gast. Auch zweimal demselben.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Pepper_(robot)',
      box: () => [EX + 276, EY + 212, 58, 148] },
    { id: 'tele', name: 'Telepräsenzroboter', bereich: 'Service', aera: 'seit den 2000ern', typ: 'Bildschirm auf Rollen',
      fakt: 'Mit einem Telepräsenzroboter kann jemand aus der Ferne durch ein Gebäude fahren und mit Menschen sprechen. Bild und Ton kommen per Internet, gesteuert wird am eigenen Computer.',
      echt: 'Realistisch. Das Gesicht auf dem Bildschirm gehört einem echten Menschen, der woanders sitzt.',
      note: 'Die Kollegin ist heute im Homeoffice. Und trotzdem am Empfang.', color: '#2a2723',
      quelle: 'https://en.wikipedia.org/wiki/Telepresence_robot',
      box: () => [EX + 358, EY + 234, 44, 126] },
    { id: 'besuch', name: 'Besucher', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Tasche',
      fakt: 'Kommt durch die Drehtür, meldet sich am Empfang an und geht weiter zu den Aufzügen.',
      note: 'Winkt höflich zurück.', color: '#3d5a80',
      box: f => [EX + visitor(f).x + 10, EY + 236, 44, 124] },
  ],
  draw: drawEingang,
});
