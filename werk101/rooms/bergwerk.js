/* Raum: Bergwerk und Rohre (UG 1) */
const BX = rx(roomOf('bergwerk').c), BY = ry(roomOf('bergwerk').r);

const hammerX = f => (f < 30 ? lerp(132, 84, ease(seg(f, 0, 30))) : f < 44 ? lerp(84, 132, ease(seg(f, 30, 44))) : 132);
const crawlerX = f => lerp(-50, 690, f / 60);
const snakeOut = f => (f < 8 ? 0 : f < 18 ? ease(seg(f, 8, 18)) : f < 40 ? 1 : f < 50 ? 1 - ease(seg(f, 40, 50)) : 0);
const camBotX = f => 350 + 70 * (0.5 - 0.5 * Math.cos(TAU * f / 60));

function drawBergwerk(f) {
  ctx.fillStyle = '#5e4f41'; ctx.fillRect(0, 0, RW, RH);
  for (let i = 0; i < 70; i++) {
    const x = rnd(i) * RW, y = rnd(i + 99) * 340, r = 6 + rnd(i + 7) * 18;
    ctx.fillStyle = i % 3 ? '#6b5a4a' : '#544638'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.7, rnd(i + 3), 0, TAU); ctx.fill();
  }
  text('UNTER TAGE', 340, 120, 46, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(243,241,234,0.12)' });
  // Stützbalken
  for (const x of [128, 300]) { box(x, 40, 14, 320, '#8e6233', 0, 2); }
  box(110, 30, 210, 14, '#8e6233', 0, 2);
  // Boden mit Gleis und Kanal
  ctx.fillStyle = '#4a3e33'; ctx.fillRect(0, 360, RW, 40);
  for (let x = 6; x < 320; x += 24) box(x, 362, 12, 5, '#8e6233', 0, 1);
  line(0, 362, 320, 362, '#8a8f94', 3);
  box(330, 368, 200, 32, '#2f4448', 0, 2);
  ctx.strokeStyle = '#5c8a8f'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 334; x < 528; x += 3) { const y = 378 + Math.sin(x / 9 + TAU * f / 20) * 2; x === 334 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke();
  line(0, 360, RW, 360, INK, 2);

  // Felswand links mit Bohrwagen
  ctx.fillStyle = '#4a3e33'; ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(40, 170); ctx.lineTo(30, 260); ctx.lineTo(44, 360); ctx.lineTo(0, 360); ctx.closePath(); paint('#4a3e33');
  withAlpha('bohr', () => {
    const hx = hammerX(f), drilling = f >= 4 && f < 30;
    // Fahrgestell mit Knicklenkung
    box(156, 312, 64, 30, '#f0b429', 4); box(222, 304, 74, 38, '#f0b429', 4);
    line(220, 320, 224, 320, INK, 4);
    circle(182, 344, 15, '#2d2f33'); circle(266, 344, 15, '#2d2f33');
    circle(182, 344, 5, '#8a8f94', null); circle(266, 344, 5, '#8a8f94', null);
    // Kabine mit Schutzdach
    for (const x of [234, 288]) box(x - 3, 238, 6, 66, '#3b3d40', 0, 1.5);
    box(226, 230, 70, 10, '#3b3d40', 2);
    person({ x: 262, foot: 304, sit: true, face: -1, s: 0.8, shirt: '#e0662b', pants: '#3b3d40', hat: '#f3f1ea', hand: { x: 248, y: 276 } });
    box(240, 276, 10, 6, '#3b3d40', 1, 1);
    // Ausleger und Lafette
    limb(168, 314, 128, 270, 11, '#f0b429'); circle(168, 314, 6, '#3b3d40'); circle(128, 270, 6, '#3b3d40');
    limb(178, 318, 140, 278, 5, '#8a8f94');
    box(44, 256, 116, 10, '#8a8f94', 1, 1.5);
    for (let x = 52; x < 158; x += 12) line(x, 258, x, 264, '#5d6064', 1);
    // Bohrhammer und Bohrstange
    box(hx, 246, 34, 18, '#d9542b', 3);
    ctx.fillStyle = '#3b3d40'; ctx.fillRect(hx + 26, 249, 6, 12);
    line(hx, 255, hx - 48, 255, '#5d6064', 3);
    const tip = hx - 48;
    if (tip < 44) { ctx.fillStyle = '#2a221b'; ctx.fillRect(tip, 252, 44 - tip, 6); }
    if (drilling) {
      ctx.fillStyle = '#5aa9d6';
      for (let i = 0; i < 7; i++) { const t = rnd(f * 7 + i); ctx.beginPath(); ctx.arc(46 + t * 10, 256 + (rnd(f + i * 5) - 0.2) * 40 * t, 1.8, 0, TAU); ctx.fill(); }
      ctx.fillStyle = 'rgba(120,100,80,0.6)'; ctx.beginPath(); ctx.ellipse(52, 356, 12 + (f % 4), 3, 0, 0, TAU); ctx.fill();
    }
    // Bohrlöcher, die schon fertig sind
    for (const [x, y] of [[30, 214], [24, 240], [34, 290]]) circle(x, y, 3, '#2a221b', null);
  });

  // Kanarienvogel im Käfig, in Rente
  line(214, 44, 214, 72, INK, 1.5);
  withAlpha('kanarie', () => {
    ctx.beginPath(); ctx.moveTo(194, 120); ctx.lineTo(194, 88); ctx.quadraticCurveTo(214, 64, 234, 88); ctx.lineTo(234, 120); ctx.closePath(); paint('rgba(0,0,0,0)', '#c9a46a', 2);
    for (let x = 200; x < 234; x += 6) line(x, 84, x, 120, '#c9a46a', 1.2);
    line(196, 108, 232, 108, '#8e6233', 2);
    const hop = f % 20 < 3 ? -3 : 0;
    ctx.beginPath(); ctx.ellipse(214, 101 + hop, 8, 6, 0, 0, TAU); paint('#ffd23f');
    circle(220, 95 + hop, 4.5, '#ffd23f'); circle(222, 94 + hop, 1, INK, null);
    ctx.beginPath(); ctx.moveTo(224, 95 + hop); ctx.lineTo(229, 96 + hop); ctx.lineTo(224, 97 + hop); ctx.closePath(); paint('#e0662b', INK, 1);
    box(196, 122, 36, 12, '#f3f1ea', 1, 1.2);
    text('RENTE', 214, 131, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
    if (f % 30 < 12) text('♪', 236 + (f % 30) * 0.8, 86 - (f % 30), 14, { color: '#ffd23f' });
  });

  // Rohr mit Rohrkrabbler, quer durch den Raum
  box(-10, 158, RW + 20, 30, 'rgba(230,236,238,0.35)', 0, 2);
  line(0, 162, RW, 162, 'rgba(255,255,255,0.35)', 2);
  for (const x of [160, 330, 500]) box(x - 6, 154, 12, 38, '#8a8f94', 1, 1.5);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(408, 186); ctx.lineTo(412, 180); ctx.lineTo(408, 176); ctx.lineTo(413, 170); ctx.stroke();
  withAlpha('krabbler', () => {
    const cx = crawlerX(f);
    box(cx - 18, 168, 36, 14, '#d9542b', 4);
    for (const dx of [-12, 0, 12]) { circle(cx + dx, 184, 3.5, '#2d2f33'); circle(cx + dx, 166, 3.5, '#2d2f33'); }
    circle(cx + 20, 175, 4, '#ffd23f', INK, 1);
    ctx.fillStyle = 'rgba(255,240,170,0.35)'; ctx.beginPath(); ctx.moveTo(cx + 22, 175); ctx.lineTo(cx + 70, 162); ctx.lineTo(cx + 70, 188); ctx.closePath(); ctx.fill();
    if (Math.abs(cx - 410) < 24) { ctx.fillStyle = '#e0a526'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(410 + (rnd(f + i) - 0.5) * 10, 172 + rnd(f * 3 + i) * 14, 3, 0, TAU); ctx.fill(); } }
  });

  // Schlangenroboter schaut aus dem Rohrende
  box(546, 188, 30, 120, 'rgba(230,236,238,0.35)', 0, 2);
  box(540, 300, 100, 30, 'rgba(230,236,238,0.35)', 0, 2);
  withAlpha('schlange', () => {
    const out = snakeOut(f), look = Math.sin(TAU * f / 15) * 0.4 * out;
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const s = i * 14 - out * 56;
      let x, y;
      if (s < 0) { x = 561 + Math.sin(look + s / 40) * -s * 0.25; y = 188 + s; }
      else if (s < 112) { x = 561 + Math.sin(s / 12 + f / 3) * 4; y = 188 + s; }
      else { x = 561 + (s - 112) + 8; y = 315; }
      pts.push({ x, y });
    }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i], q = pts[Math.max(0, i - 1)], a = Math.atan2(q.y - p.y, q.x - p.x); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(a); box(-7, -6, 14, 12, i % 2 ? '#b9bec4' : '#8a8f94', 3, 1.5); ctx.fillStyle = '#3b3d40'; ctx.fillRect(-1.5, -6, 3, 12); ctx.restore(); }
    const h = pts[0];
    if (out > 0.3) { circle(h.x, h.y - 3, 3, '#23384d', INK, 1); circle(h.x, h.y - 3, 1.2, '#7fd3ff', null); ctx.fillStyle = 'rgba(255,240,170,0.3)'; ctx.beginPath(); ctx.moveTo(h.x, h.y - 6); ctx.lineTo(h.x - 14, h.y - 40); ctx.lineTo(h.x + 14, h.y - 40); ctx.closePath(); ctx.fill(); }
  });

  // Kanalroboter filmt die Ratte – im aufgeschnittenen Rohr
  ctx.fillStyle = 'rgba(200,210,214,0.25)'; ctx.fillRect(330, 316, 210, 44); box(330, 316, 210, 44, null, 22, 2.5);
  ctx.fillStyle = '#3d5a5e'; ctx.fillRect(334, 352, 202, 6);
  withAlpha('kanal', () => {
    const x = camBotX(f);
    box(x - 22, 344, 44, 14, '#5d6064', 4);
    for (const dx of [-15, 0, 15]) circle(x + dx, 359, 4, '#2d2f33');
    line(x + 8, 344, x + 14, 330, INK, 3);
    box(x + 8, 322, 18, 12, '#3b3d40', 3, 1.5);
    circle(x + 26, 328, 3, '#7fd3ff', INK, 1);
    circle(x + 12, 326, 1.8, f % 6 < 3 ? '#ff3b30' : '#7a2a14', null);
    line(x - 22, 350, x - 60, 354, '#ffd23f', 1.5);
  });
  withAlpha('ratte', () => {
    const pose = camBotX(f) > 400;
    ctx.beginPath(); ctx.ellipse(560, 352, 14, 7, 0, 0, TAU); paint('#8a8580');
    circle(548, 347, 6, '#8a8580'); circle(546, 341, 3, '#c9a0a0', INK, 1);
    circle(545, 347, 1.2, INK, null);
    ctx.beginPath(); ctx.moveTo(574, 354); ctx.quadraticCurveTo(596, 360, 600, 346); ctx.strokeStyle = '#c9a0a0'; ctx.lineWidth = 2; ctx.stroke();
    if (pose) { line(552, 344, 556, 330 - (f % 4 < 2 ? 3 : 0), '#c9a0a0', 2.5); text('✌', 558, 326, 12, { color: INK }); }
  });
}

registerRoom({
  key: 'bergwerk', name: 'Bergwerk und Rohre', level: 'UG 1',
  hitOrder: ['ratte', 'kanarie', 'kanal', 'krabbler', 'schlange', 'bohr'],
  robots: [
    { id: 'bohr', quelle: 'https://en.wikipedia.org/wiki/Drilling_jumbo', echt: 'Realistisch. Beim Bohren wird meist Wasser durch den Bohrer gespült, damit weniger Staub entsteht.', name: 'Bohrroboter', bereich: 'Rohstoffe', aera: 'seit den 1980ern', typ: 'Bohrwagen mit Bohrarm',
      fakt: 'Im Tunnel- und Bergbau bohren Bohrwagen mit mehreren Armen die Löcher für Sprengladungen. Moderne Geräte arbeiten einen digitalen Bohrplan Loch für Loch selbst ab.',
      note: 'Bohrt eine halbe Runde lang. Der Fahrer schaut nur zu, den Bohrplan arbeitet die Maschine selbst ab.', color: '#f0b429',
      box: () => [BX + 44, BY + 228, 254, 132] },
    { id: 'kanarie', echt: 'Stimmt: Die Vögel warnten früher vor Gas. Heute messen Sensoren, die Bergleute am Körper tragen.', name: 'Kanarienvogel', bereich: 'Tier', aera: 'in Rente', typ: 'Früherer Gaswarner',
      fakt: 'Britische Bergwerke hielten bis 1986 Kanarienvögel, weil sie giftiges Kohlenmonoxid früher spürten als Menschen. Heute übernehmen elektronische Gassensoren diese Aufgabe.',
      note: 'Hat seinen Job an einen Sensor verloren. Singt trotzdem jeden Tag zur Schicht.', color: '#ffd23f',
      quelle: 'https://en.wikipedia.org/wiki/Sentinel_species',
      box: () => [BX + 190, BY + 64, 48, 72] },
    { id: 'krabbler', echt: 'Realistisch. Abgedichtet wird oft mit einem Schlauch, der innen an die Rohrwand gedrückt wird und dort aushärtet.', name: 'Rohrkrabbler', bereich: 'Inspektion', aera: 'seit den 1990ern', typ: 'Inspektionsroboter für Rohre',
      fakt: 'Rohrroboter fahren durch Gas-, Wasser- und Abwasserleitungen und filmen sie von innen. Viele Schäden lassen sich so finden und sogar abdichten, ohne die Straße aufzureißen.',
      note: 'Dichtet bei jeder Durchfahrt denselben Riss ab.', color: '#d9542b',
      quelle: 'https://en.wikipedia.org/wiki/Cured-in-place_pipe',
      box: f => [BX + crawlerX(f) - 22, BY + 158, 46, 32] },
    { id: 'schlange', echt: 'Schlangenroboter sind vor allem Forschungsgeräte. Statt Augen haben sie vorn eine Kamera mit Licht.', name: 'Schlangenroboter', bereich: 'Inspektion', aera: 'seit den 1970ern', typ: 'Vielgliedriger Roboter',
      fakt: 'Schlangenroboter bestehen aus vielen gleichen Gliedern mit eigenem Antrieb. Sie kriechen durch Rohre und Trümmer, wo Räder und Beine nicht weiterkommen; erste Modelle entstanden in den 1970ern in Japan.',
      note: 'Schaut einmal pro Runde nach, ob draußen etwas los ist.', color: '#3e6f9e',
      quelle: 'https://en.wikipedia.org/wiki/Snakebot',
      box: f => [BX + 540, BY + 130 + 56 * (1 - snakeOut(f)), 40, 70] },
    { id: 'kanal', echt: 'Echte Kanalroboter fahren im Rohr und ziehen ein Kabel hinter sich her. Die Ratte ist echt möglich.', name: 'Kanalroboter', bereich: 'Inspektion', aera: 'seit den 1960ern', typ: 'Kamerawagen',
      fakt: 'Kamerawagen fahren durch Abwasserkanäle, die für Menschen zu eng sind, und filmen Risse, Wurzeln und Ablagerungen. Ein Kabel liefert Strom und Bild nach oben.',
      note: 'Dreht seit Wochen einen Dokumentarfilm. Die Hauptrolle hat die Ratte.', color: '#5d6064',
      quelle: 'https://en.wikipedia.org/wiki/Pipeline_video_inspection',
      box: f => [BX + camBotX(f) - 26, BY + 318, 56, 44] },
    { id: 'ratte', name: 'Ratte', bereich: 'Tier', aera: 'kein Roboter', typ: 'Hauptdarstellerin',
      fakt: 'Ratten leben gern in Kanalnetzen, weil es dort warm ist und Futter gibt.',
      note: 'Posiert jedes Mal, wenn die Kamera vorbeikommt.', color: '#8a8580',
      box: () => [BX + 534, BY + 320, 70, 42] },
  ],
  draw: drawBergwerk,
});
