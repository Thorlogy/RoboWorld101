/* Raum: Museum der Robotik (Ebene 3) */
const UX = rx(roomOf('museum').c), UY = ry(roomOf('museum').r);

const beamX = f => 520 + 46 * Math.sin(TAU * f / 60);
const turtleX = f => 520 + 46 * Math.sin(TAU * (f - 6) / 60);
const kempelenDoor = f => (f < 18 ? 0 : f < 24 ? ease(seg(f, 18, 24)) : f < 40 ? 1 : f < 46 ? 1 - ease(seg(f, 40, 46)) : 0);

function plinth(x, w, label, y = 300) {
  box(x, y, w, 360 - y, '#f3f1ea', 0, 2);
  box(x + 6, 336, w - 12, 14, '#2a2723', 1, 1.2);
  text(label, x + w / 2, 346, 9.5, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3f1ea' });
}

function drawMuseum(f) {
  ctx.fillStyle = '#e4ddd0'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('MUSEUM', 380, 70, 46, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#7d6a58'; ctx.fillRect(0, 360, RW, 40);
  ctx.strokeStyle = '#6c5a49'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 0; x < RW; x += 20) { ctx.moveTo(x, 360); ctx.lineTo(x + 20, 400); }
  ctx.stroke();
  line(0, 360, RW, 360, INK, 2);
  // Tafel zum Wort Roboter
  box(236, 28, 132, 70, '#2f3b36', 2);
  const chalk = { family: '"Saira Condensed", sans-serif', weight: 600, color: '#e8eee9', align: 'center' };
  text('1920', 302, 50, 14, chalk);
  text('Čapek, „R.U.R.“', 302, 68, 12, chalk);
  text('robota = Fronarbeit', 302, 86, 11, chalk);
  // Spots
  for (const x of [80, 200, 320, 420]) { line(x, 8, x, 22, INK, 2); ctx.fillStyle = 'rgba(255,244,200,0.28)'; ctx.beginPath(); ctx.moveTo(x - 6, 24); ctx.lineTo(x + 6, 24); ctx.lineTo(x + 40, 300); ctx.lineTo(x - 40, 300); ctx.closePath(); ctx.fill(); circle(x, 22, 5, '#3b3d40'); }

  // Schachautomat von 1770: Kasten mit drei Türen und Schublade, Figur mit Pfeife
  withAlpha('schach', () => {
    plinth(16, 128, '1770 SCHACH', 318);
    // Figur hinter dem Kasten
    limb(116, 252, 114, 214, 20, '#4b5d3a');
    line(106, 222, 122, 222, '#d8cbb0', 3);
    circle(114, 200, 10, '#e2c9a6');
    ctx.beginPath(); ctx.ellipse(114, 190, 13, 8, 0, 0, TAU); paint('#efe8da');
    line(103, 189, 125, 191, '#c9a46a', 1.5);
    line(108, 206, 120, 206, '#5d4632', 2);
    circle(108, 199, 1.3, INK, null);
    line(122, 232, 142, 232, '#4b5d3a', 6); line(140, 230, 156, 216, '#5d4632', 2.5);
    const reach = Math.sin(TAU * f / 30) * 5;
    limb(106, 226, 88 + reach, 244, 5, '#4b5d3a');
    // Kasten
    box(24, 250, 112, 68, '#8e6233', 2);
    box(52, 244, 56, 6, '#f3f1ea', 0, 1.5);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#2a2723' : '#f3f1ea'; ctx.fillRect(52 + i * 7, 244, 7, 3); }
    box(28, 302, 104, 12, '#7a5229', 1, 1.5);
    const d = kempelenDoor(f);
    box(28, 256, 32, 44, '#3a2c22', 1, 1.5);
    if (d > 0.2) {
      for (const [gx, gy, r] of [[38, 270, 8], [50, 286, 6]]) {
        const k = TAU * f / 20;
        circle(gx, gy, r, '#c9a46a', INK, 1.2);
        line(gx - Math.cos(k) * r, gy - Math.sin(k) * r, gx + Math.cos(k) * r, gy + Math.sin(k) * r, INK, 1.2);
      }
      if (f >= 28 && f < 36) line(56, 296, 58, 284 - (f % 4 < 2 ? 3 : 0), '#e2b48f', 3);
    }
    box(28 - 26 * d, 256, Math.max(5, 32 * (1 - d) + 5), 44, '#a8763f', 1, 1.5);
    box(64, 256, 32, 44, '#a8763f', 1, 1.5); box(100, 256, 32, 44, '#a8763f', 1, 1.5);
    for (const x of [92, 104]) circle(x, 278, 1.8, '#c9a46a', null);
  });

  // Shakey: Fahrsockel mit Tastfühlern, Elektronikturm, Kamera und Entfernungsmesser
  withAlpha('shakey', () => {
    plinth(156, 88, '1966 SRI');
    const w = Math.sin(TAU * f / 6) * 1.5;
    ctx.save(); ctx.translate(200, 300); ctx.rotate(w * 0.02);
    box(-28, -22, 56, 18, '#3b3d40', 2);
    circle(-16, -3, 5, '#2d2f33'); circle(16, -3, 5, '#2d2f33');
    for (const s2 of [-1, 1]) { line(s2 * 28, -12, s2 * 40, -4, INK, 1.5); line(s2 * 28, -18, s2 * 38, -26, INK, 1.5); }
    box(-20, -84, 40, 62, '#5d6064', 2);
    for (let y = -78; y < -28; y += 10) line(-15, y, 15, y, '#8a8f94', 1.2);
    box(-3, -110, 6, 26, '#8a8f94', 0, 1.5);
    box(-16, -128, 20, 18, '#2a2723', 2, 1.5); circle(-16, -119, 4, '#7fd3ff', INK, 1);
    box(4, -124, 16, 12, '#8a8f94', 1, 1.5); circle(20, -118, 2.5, '#2a2723', null);
    line(10, -84, 10, -150, INK, 1.5); circle(10, -152, 2.5, '#d9542b', INK, 1);
    ctx.restore();
    box(166, 120, 68, 24, '#f3f1ea', 2, 1.2);
    text('BITTE NICHT', 200, 131, 8.5, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
    text('SCHÜTTELN', 200, 141, 8.5, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  });

  // Unimate: Steuerschrank, Schwenkkopf, Teleskoparm mit Greifer
  withAlpha('unimate', () => {
    plinth(260, 114, '1961 UNIMATE', 296);
    box(270, 236, 62, 60, '#2f4866', 3);
    for (const y of [248, 262]) line(276, y, 326, y, '#5f7fa3', 1.5);
    circle(318, 284, 3, '#d9542b', INK, 1);
    box(278, 216, 30, 22, '#5d6064', 6);
    const t = 0.5 - 0.5 * Math.cos(TAU * f / 30), ang = -0.08 + 0.18 * t;
    ctx.save(); ctx.translate(293, 222); ctx.rotate(ang);
    box(0, -7, 54, 14, '#8a8f94', 2, 1.5);
    box(52, -5, 16 + 16 * t, 10, '#b0b4b8', 1, 1.5);
    const ex = 68 + 16 * t;
    line(ex, -4, ex + 8, -8, INK, 2.5); line(ex, 4, ex + 8, 8, INK, 2.5);
    box(ex + 2, -4, 12, 8, '#c9a46a', 1, 1.2);
    ctx.restore();
  });

  // Blechroboter zum Aufziehen
  withAlpha('blech', () => {
    plinth(388, 60, '1950er', 318);
    const step = Math.sin(TAU * f / 12), x = 418 + 10 * Math.sin(TAU * f / 60);
    box(x - 11, 276, 22, 28, '#c94040', 2, 1.5);
    box(x - 6, 282, 12, 10, '#23384d', 1, 1); circle(x - 2, 287, 2, '#c9a46a', null); circle(x + 3, 287, 2, '#c9a46a', null);
    box(x - 8, 258, 16, 18, '#b0b4b8', 2, 1.5);
    circle(x - 3, 266, 2.4, '#ffd23f', INK, 1); circle(x + 3, 266, 2.4, '#ffd23f', INK, 1);
    line(x, 258, x, 250, INK, 1.5); circle(x, 249, 2, '#d9542b', null);
    line(x - 4, 304, x - 4 + step * 3, 316, INK, 3); line(x + 4, 304, x + 4 - step * 3, 316, INK, 3);
    line(x - 11, 282, x - 17, 292 + step * 3, INK, 2.5); line(x + 11, 282, x + 17, 292 - step * 3, INK, 2.5);
    const k = TAU * f / 10;
    line(x + 11, 290, x + 18, 290, INK, 2); line(x + 18 + Math.cos(k) * 4, 290 + Math.sin(k) * 4, x + 18 - Math.cos(k) * 4, 290 - Math.sin(k) * 4, INK, 2.5);
  });

  // Leerer Sockel der Schildkröte, Kind mit Taschenlampe
  plinth(478, 76, '1949 BRISTOL', 316);
  box(486, 304, 60, 12, '#f3f1ea', 1, 1.2);
  text('UNTERWEGS', 516, 313, 8.5, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#d9542b' });
  withAlpha('kind', () => {
    const bx = beamX(f);
    ctx.fillStyle = 'rgba(255,240,170,0.45)'; ctx.beginPath(); ctx.moveTo(598, 320); ctx.lineTo(bx - 18, 372); ctx.lineTo(bx + 18, 372); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bx, 372, 22, 5, 0, 0, TAU); ctx.fill();
    person({ x: 612, face: -1, s: 0.66, shirt: '#ffd23f', pants: '#3e6f9e', hair: '#8a5a2b', hand: { x: 598, y: 320 } });
    box(592, 316, 10, 6, '#3b3d40', 1, 1);
  });
  withAlpha('schildkroete', () => {
    const tx = turtleX(f), dir = Math.cos(TAU * (f - 6) / 60) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(tx, 380); ctx.scale(dir, 1);
    box(-16, -14, 32, 8, '#5d6064', 2, 1.5);
    circle(-12, -3, 4, '#2d2f33'); circle(12, -3, 4, '#2d2f33'); circle(16, -2, 3, '#2d2f33');
    ctx.beginPath(); ctx.arc(0, -10, 19, Math.PI, TAU); ctx.closePath(); paint('rgba(205,225,235,0.55)', INK, 2);
    box(-6, -22, 12, 8, '#8e6233', 1, 1.2);
    box(-3, -38, 6, 16, '#8a8f94', 1, 1.2);
    const sc = Math.sin(TAU * f / 8) * 2.5;
    box(-5, -44, 10, 7, '#3b3d40', 1, 1.2); circle(sc, -40.5, 1.6, f % 4 < 2 ? '#ffd23f' : '#8a6a20', null);
    ctx.restore();
  });
}

registerRoom({
  key: 'museum', offset: 28, name: 'Museum der Robotik', level: 'Ebene 3',
  hitOrder: ['schildkroete', 'kind', 'blech', 'schach', 'shakey', 'unimate'],
  robots: [
    { id: 'schach', echt: 'In echt öffnete der Vorführer die Türen, um Zahnräder zu zeigen. Der versteckte Spieler rutschte dabei unbemerkt zur Seite.', name: 'Schachautomat', bereich: 'Geschichte', aera: '1770', typ: 'Scheinbarer Automat',
      fakt: 'Wolfgang von Kempelen stellte 1770 in Wien einen Schachautomaten vor, der jahrzehntelang durch Europa tourte und viele Partien gewann. Im Kasten saß ein versteckter Schachspieler, ein Roboter war es nie.',
      note: 'Die Tür geht jede Runde auf. Der Mensch drinnen winkt.', color: '#8e6233',
      quelle: 'https://en.wikipedia.org/wiki/Mechanical_Turk',
      box: () => [UX + 18, UY + 178, 140, 182] },
    { id: 'shakey', echt: 'Shakey wackelte wirklich, daher der Name. Fahren durfte er nur in eigens eingerichteten Räumen.', name: 'Shakey', bereich: 'Geschichte', aera: '1966–1972', typ: 'Erster planender Mobilroboter',
      fakt: 'Shakey entstand ab 1966 am Stanford Research Institute. Er war der erste mobile Roboter, der seine Umgebung mit einer Kamera erfasste und seine Schritte selbst plante. Seinen Namen bekam er, weil er beim Fahren wackelte.',
      note: 'Wackelt immer noch. Trotz Schild.', color: '#8a8f94',
      quelle: 'https://en.wikipedia.org/wiki/Shakey_the_robot',
      box: () => [UX + 160, UY + 120, 80, 240] },
    { id: 'unimate', echt: 'Ein Roboter im Museum arbeitet natürlich nicht mehr. Das ist der Witz.', name: 'Unimate', bereich: 'Geschichte', aera: '1961', typ: 'Erster Industrieroboter',
      fakt: 'Unimate war der erste Industrieroboter. Ein Prototyp arbeitete ab 1959 in einem Druckgusswerk von General Motors in New Jersey und nahm heiße Gussteile aus der Maschine. Entwickelt hatten ihn George Devol und Joseph Engelberger.',
      note: 'Im Ruhestand. Legt aus Gewohnheit trotzdem jedes Teil zweimal pro Runde ab.', color: '#5d6b3a',
      quelle: 'https://en.wikipedia.org/wiki/Unimate',
      box: () => [UX + 264, UY + 230, 106, 130] },
    { id: 'blech', echt: 'Echte Aufziehroboter laufen nur ein paar Sekunden, dann muss man sie neu aufziehen.', name: 'Blechroboter', bereich: 'Spielzeug', aera: '1950er', typ: 'Aufziehspielzeug',
      fakt: 'Nach dem Zweiten Weltkrieg wurden in Japan Millionen Spielzeugroboter aus Blech gefertigt, oft aus wiederverwertetem Metall. Heute sind gut erhaltene Stücke begehrte Sammlerobjekte.',
      note: 'Läuft, solange der Schlüssel sich dreht. Der Schlüssel dreht sich immer.', color: '#c94040',
      quelle: 'https://en.wikipedia.org/wiki/Tin_toy',
      box: () => [UX + 390, UY + 256, 58, 104] },
    { id: 'schildkroete', echt: 'Stimmt: Die Schildkröten fuhren auf Licht zu. Eine Taschenlampe hätte sie wirklich weggelockt.', name: 'Robotische Schildkröte', bereich: 'Geschichte', aera: '1949', typ: 'Lichtsuchender Kleinroboter',
      fakt: 'Der Neurophysiologe William Grey Walter baute 1948 und 1949 in Bristol die Roboterschildkröten Elmer und Elsie. Mit zwei Röhren und einer Fotozelle fuhren sie selbstständig auf Licht zu.',
      note: 'Ist von ihrem Sockel abgehauen und folgt der Taschenlampe.', color: '#8e6233',
      quelle: 'https://en.wikipedia.org/wiki/William_Grey_Walter',
      box: f => [UX + turtleX(f) - 24, UY + 334, 48, 48] },
    { id: 'kind', name: 'Kind mit Taschenlampe', bereich: 'Mensch', aera: 'Maßstab', typ: 'Museumsbesuch',
      fakt: 'Hat herausgefunden, dass die Schildkröte dem Licht folgt.',
      note: 'Die Aufsicht hat es noch nicht bemerkt.', color: '#ffd23f',
      box: () => [UX + 590, UY + 270, 40, 90] },
  ],
  draw: drawMuseum,
});
