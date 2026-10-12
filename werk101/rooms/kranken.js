/* Raum: Krankenstation (Ebene 5) */
const MX = rx(roomOf('kranken').c), MY = ry(roomOf('kranken').r);

const needleY = f => 258 - 22 * (0.5 - 0.5 * Math.cos(TAU * f / 15));
const squat = f => 0.5 - 0.5 * Math.cos(TAU * f / 20);
const tugX = f => (f < 20 ? 640 + 60 : f < 34 ? lerp(700, 530, ease(seg(f, 20, 34))) : f < 46 ? 530 : lerp(530, 700, ease(seg(f, 46, 60))));
const uvX = f => (f >= 30 && f < 58 ? lerp(-70, 710, seg(f, 30, 58)) : -300);

function drawKranken(f) {
  ctx.fillStyle = '#e6ebee'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#c9d6dc'; ctx.fillRect(0, 210, RW, 150);
  line(0, 210, RW, 210, INK, 2);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('STATION 5', 440, 196, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  box(420, 30, 36, 36, '#3e6f9e', 3);
  ctx.fillStyle = '#f3f1ea'; ctx.fillRect(434, 36, 8, 24); ctx.fillRect(426, 44, 24, 8);
  ctx.fillStyle = '#b7c3c8'; ctx.fillRect(0, 360, RW, 40);
  ctx.strokeStyle = '#a3b0b6'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 0; x < RW; x += 40) { ctx.moveTo(x, 360); ctx.lineTo(x, 400); }
  ctx.stroke();
  line(0, 360, RW, 360, INK, 2);

  // Herzmonitor: 60 Schläge pro Minute = 5 pro Runde
  box(292, 40, 92, 62, '#23384d', 4);
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const ph = ((i * 0.75 + f) % 12), y = ph > 5 && ph < 6 ? -18 : ph > 6 && ph < 7 ? 10 : 0;
    const x = 298 + i; i ? ctx.lineTo(x, 80 + y) : ctx.moveTo(x, 80 + y);
  }
  ctx.strokeStyle = '#7fe08a'; ctx.lineWidth = 1.6; ctx.stroke();
  text(f % 12 < 3 ? '♥ 60' : '  60', 378, 56, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'right', color: '#7fe08a' });
  line(338, 102, 338, 128, '#8a8f94', 3);

  // OP-Leuchte
  line(150, 8, 150, 92, '#8a8f94', 4);
  ctx.fillStyle = 'rgba(255,248,214,0.35)';
  ctx.beginPath(); ctx.moveTo(122, 104); ctx.lineTo(178, 104); ctx.lineTo(230, 290); ctx.lineTo(70, 290); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(150, 100, 36, 9, 0, 0, TAU); paint('#e6e3da');

  // OP-Tisch mit Teddy
  box(140, 304, 20, 48, '#8a8f94'); box(116, 350, 68, 10, '#5d6064', 2);
  box(48, 296, 204, 8, '#d6d9dc', 2);
  withAlpha('teddy', () => {
    const br = Math.sin(TAU * f / 30) * 1.2;
    ctx.beginPath(); ctx.ellipse(158, 283, 46, 13 + br, 0, 0, TAU); paint('#a8743f');
    circle(210, 290, 7, '#a8743f'); circle(206, 278, 7, '#a8743f');
    circle(98, 280, 15, '#a8743f');
    circle(90, 266, 6, '#a8743f'); circle(108, 266, 6, '#a8743f');
    circle(88, 286, 6, '#d8b58a', INK, 1.5);
    line(94, 276, 99, 276, INK, 1.5); line(104, 276, 109, 276, INK, 1.5);
    ctx.fillStyle = '#d8b58a'; ctx.beginPath(); ctx.ellipse(162, 276, 14, 5, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 4; i++) line(152 + i * 6, 273, 154 + i * 6, 279, INK, 1.4);
  });

  // OP-Roboter: Säule, Ausleger, vier Arme
  withAlpha('op', () => {
    box(246, 330, 52, 24, '#e6e3da', 4);
    circle(256, 356, 4, '#2d2f33'); circle(288, 356, 4, '#2d2f33');
    box(262, 128, 18, 204, '#e6e3da', 3);
    box(100, 128, 180, 14, '#e6e3da', 4);
    const ny = needleY(f);
    const tips = [
      { x: 132, y: 270 + Math.sin(TAU * f / 30) * 2 },
      { x: 160, y: ny },
      { x: 176 + Math.sin(TAU * f / 60) * 4, y: 262 },
      { x: 192, y: 272 + Math.sin(TAU * f / 20) * 2 },
    ];
    [118, 146, 174, 202].forEach((ax, i) => {
      const t = tips[i], el = { x: ax + 12, y: 194 };
      limb(ax, 142, el.x, el.y, 8, '#e6e3da');
      circle(ax, 142, 4.5, '#3b3d40'); circle(el.x, el.y, 4, '#3b3d40');
      line(el.x, el.y, t.x, t.y, '#5d6064', 3);
      line(t.x, t.y, t.x - 3, t.y + 5, INK, 1.5); line(t.x, t.y, t.x + 3, t.y + 5, INK, 1.5);
    });
    circle(tips[2].x, tips[2].y + 5, 2.2, '#7fd3ff', null);
    ctx.beginPath(); ctx.moveTo(160, ny + 4); ctx.quadraticCurveTo(168, ny + 18, 170, 276);
    ctx.strokeStyle = '#3e6f9e'; ctx.lineWidth = 1.2; ctx.stroke();
  });

  // Chirurgin an der Konsole
  box(296, 252, 60, 108, '#e6e3da', 4);
  box(300, 238, 52, 22, '#3b3d40', 4);
  withAlpha('chirurg', () => {
    box(374, 324, 30, 6, '#5d6064'); line(389, 330, 389, 358, '#5d6064', 3);
    limb(388, 320, 362, 322, 8, '#3d7f8f'); limb(362, 322, 362, 356, 7, '#3d7f8f');
    box(352, 352, 16, 6, INK, 2);
    limb(390, 320, 372, 272, 17, '#3d7f8f');
    circle(360, 258, 11, '#c99a74');
    ctx.beginPath(); ctx.arc(362, 254, 11, Math.PI * 1.05, Math.PI * 2.1); paint('#3d7f8f');
    const hy = 296 + (needleY(f) - 247) * 0.25;
    limb(370, 276, 362, 296, 6, '#3d7f8f'); limb(362, 296, 348, hy, 5, '#c99a74');
    box(338, hy - 3, 12, 6, '#5d6064', 1, 1.5);
  });

  // Laufband mit Exoskelett
  box(400, 340, 96, 20, '#3b3d40', 3);
  const off = (f * 2) % 12;
  ctx.strokeStyle = '#8a8f94'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 404 + 12 - off; x < 494; x += 12) { ctx.moveTo(x, 341); ctx.lineTo(x, 345); }
  ctx.stroke();
  line(404, 340, 404, 282, '#5d6064', 4); line(404, 284, 432, 284, '#5d6064', 4);
  withAlpha('exo', () => {
    const ph = TAU * f / 30, hip = { x: 454, y: 296 };
    for (const s of [1, -1]) {
      const a = 0.38 * Math.sin(ph) * s, knee = { x: hip.x + 22 * Math.sin(a), y: hip.y + 22 * Math.cos(a) };
      const b = a - Math.max(0, 0.6 * Math.sin(ph + (s > 0 ? 1.4 : 1.4 + Math.PI))), foot = { x: knee.x + 22 * Math.sin(b), y: knee.y + 22 * Math.cos(b) };
      limb(hip.x, hip.y, knee.x, knee.y, 7, s > 0 ? '#3d5a80' : '#2f4866'); limb(knee.x, knee.y, foot.x, foot.y, 6, s > 0 ? '#3d5a80' : '#2f4866');
      line(hip.x + 3, hip.y, knee.x + 3, knee.y, '#3b3d40', 3); line(knee.x + 3, knee.y, foot.x + 3, foot.y, '#3b3d40', 3);
      circle(knee.x + 3, knee.y, 3.5, '#e0662b', INK, 1.5);
      box(foot.x - 4, foot.y - 2, 14, 5, INK, 2);
    }
    circle(hip.x + 3, hip.y, 4, '#e0662b', INK, 1.5);
    limb(hip.x, hip.y, 452, 262, 17, '#d9a43a');
    box(458, 262, 12, 34, '#3b3d40', 3, 1.5);
    circle(450, 248, 11, '#e2b48f');
    ctx.beginPath(); ctx.arc(452, 245, 11, Math.PI * 1.05, Math.PI * 2.1); paint('#6b4a2b');
    circle(444, 248, 1.6, INK, null);
    limb(448, 266, 438, 284, 5, '#d9a43a'); limb(438, 284, 430, 284, 4, '#e2b48f');
  });

  // Medikamentenschrank und Transportroboter
  box(506, 236, 64, 124, '#d6d9dc', 3); for (let y = 248; y < 352; y += 22) { box(512, y, 52, 18, '#eef1f2', 2, 1.2); line(532, y + 9, 544, y + 9, INK, 2); }
  withAlpha('pflege', () => {
    const x = tugX(f);
    if (x > 690) return;
    box(x - 30, 270, 60, 82, '#f3f1ea', 6);
    for (let y = 280; y < 340; y += 18) { box(x - 24, y, 48, 14, '#e6e3da', 2, 1.2); line(x - 6, y + 7, x + 6, y + 7, INK, 1.5); }
    box(x - 20, 258, 40, 12, '#3e6f9e', 3, 1.2);
    circle(x - 18, 356, 4, '#2d2f33'); circle(x + 18, 356, 4, '#2d2f33');
    circle(x + 24, 262, 3, f % 6 < 3 ? '#7fe08a' : '#2d5b33', INK, 1);
    if (f >= 34 && f < 46) { const o = seg(f, 34, 38) - seg(f, 42, 46); box(x - 24, 280, 48 + 10 * o, 14, '#e6e3da', 2, 1.2); }
  });

  // Laufroboter nach der Reparatur: Selbsttest mit neuem Bein
  withAlpha('hund', () => {
    const s2 = squat(f), by = 312 + 14 * s2;
    ctx.translate(-14, 0);
    for (const [hx, fx, neu] of [[592, 588, true], [624, 628, false]]) {
      const kx = hx + (neu ? -10 : 8) + (neu ? -4 : 4) * s2, ky = (by + 358) / 2 - 2, col = neu ? '#3e6f9e' : '#4a4d52';
      limb(hx, by + 6, kx, ky, 5, col); limb(kx, ky, fx, 356, 4, col);
      circle(kx, ky, 3, '#e0662b', INK, 1.2);
    }
    box(580, by - 8, 52, 16, '#4a4d52', 5);
    ctx.fillStyle = '#e0662b'; ctx.fillRect(586, by - 4, 40, 3);
    box(626, by - 12, 12, 12, '#3b3d40', 3, 1.5);
    circle(634, by - 6, 2, '#7fd3ff', null);
  });

  // UV-Roboter wartet an der Ladestation, er arbeitet nur in leeren Räumen
  withAlpha('uv', () => {
    const x = 26;
    box(4, 320, 14, 40, '#3b3d40', 2, 1.2); circle(11, 330, 2.5, f % 20 < 10 ? '#7fe08a' : '#2d5b33', null);
    box(x - 4, 330, 52, 24, '#3b3d40', 6);
    circle(x + 6, 356, 4, '#2d2f33'); circle(x + 38, 356, 4, '#2d2f33');
    box(x + 18, 210, 8, 122, '#8a8f94');
    for (const dx of [4, 14, 30, 40]) box(x + dx - 3, 226, 6, 96, '#e6e3da', 3, 1.5);
    box(x, 206, 44, 10, '#3b3d40', 4, 1.5);
  });
}

registerRoom({
  key: 'kranken', name: 'Krankenstation', level: 'Ebene 5',
  hitOrder: ['hund', 'teddy', 'chirurg', 'pflege', 'exo', 'uv', 'op'],
  robots: [
    { id: 'op', echt: 'Echte OP-Roboter arbeiten durch kleine Schnitte im Körper. Und an Teddys wird nur geübt.', name: 'OP-Roboter', bereich: 'Medizin', aera: 'seit 2000', typ: 'Telemanipulator mit vier Armen',
      fakt: 'Das da-Vinci-System wurde im Jahr 2000 in den USA für Operationen zugelassen. Der Roboter operiert nicht selbst: Eine Chirurgin steuert die Arme von einer Konsole aus, ihre Handbewegungen werden verkleinert und Zittern wird herausgefiltert.',
      note: 'Näht hochkonzentriert. Der Patient ist ein Teddy.', color: '#e6e3da',
      quelle: 'https://en.wikipedia.org/wiki/Da_Vinci_Surgical_System',
      box: () => [MX + 96, MY + 124, 206, 236] },
    { id: 'chirurg', name: 'Chirurgin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch an der Steuerkonsole',
      fakt: 'Sie schaut durch ein 3D-Sichtgerät und bewegt zwei Steuergriffe. Die Arme am Tisch folgen ihren Händen.',
      note: 'Ihre Hand geht genau im Takt des Nadelarms auf und ab.', color: '#3d7f8f',
      box: () => [MX + 334, MY + 240, 74, 120] },
    { id: 'teddy', echt: 'Teddys werden in Kinderkliniken tatsächlich manchmal verarztet, damit Kinder die Angst vor der Behandlung verlieren.', name: 'Teddy', bereich: 'Spielzeug', aera: 'kein Roboter', typ: 'Patient',
      fakt: 'Kein Roboter, nur Füllwatte. Bekommt eine neue Naht am Bauch.',
      note: 'Atmet ruhig. Puls 60, also genau fünf Schläge pro Runde.', color: '#a8743f',
      box: () => [MX + 80, MY + 258, 140, 40] },
    { id: 'exo', echt: 'Realistisch. Bei der Therapie trägt oft zusätzlich ein Gurtsystem einen Teil des Körpergewichts, und Fachleute betreuen das Training.', name: 'Reha-Exoskelett', bereich: 'Medizin', aera: 'seit ca. 2000', typ: 'Motorisierte Beinschienen',
      fakt: 'Gehroboter und Exoskelette helfen Menschen nach einem Schlaganfall oder einer Rückenmarksverletzung beim Gehtraining. Motoren an Hüfte und Knie führen die Beine durch den Schritt, so wird die Übung genau wiederholbar.',
      note: 'Zwei Schritte pro Runde, gleichmäßig wie ein Uhrwerk.', color: '#e0662b',
      quelle: 'https://en.wikipedia.org/wiki/Exoskeleton_(human)',
      box: () => [MX + 424, MY + 234, 60, 126] },
    { id: 'pflege', quelle: 'https://www.pharmacytimes.com/view/robot-delivers-hospital-pharmacys-drugs-to-nurses', echt: 'Realistisch. Solche Roboter fahren langsam, weichen Menschen aus und melden sich mit einem Ton an.', name: 'Transportroboter', bereich: 'Medizin', aera: 'seit den 2000ern', typ: 'Fahrender Schrank mit Schubladen',
      fakt: 'In vielen Krankenhäusern fahren Transportroboter Medikamente, Laborproben und Wäsche über die Flure und nehmen sogar den Aufzug. Die Schubladen öffnen sich erst, wenn sich eine Pflegekraft mit Passwort und Fingerabdruck anmeldet.',
      note: 'Bringt einmal pro Runde Nachschub für den Medikamentenschrank.', color: '#f3f1ea',
      box: f => [MX + tugX(f) - 32, MY + 254, 64, 106] },
    { id: 'hund', echt: 'Realistisch: Ein kaputtes Bein wird ausgetauscht, nicht verbunden. Danach folgt ein Selbsttest mit Hinsetzen und Aufstehen.', name: 'Laufroboter', bereich: 'Forschung', aera: 'seit den 2010ern', typ: 'Vierbeiniger Laufroboter',
      fakt: 'Vierbeinige Laufroboter halten das Gleichgewicht, indem sie ihre Beinkräfte hunderte Male pro Sekunde nachregeln. Nach einer Reparatur prüft ein Selbsttest, ob alle Gelenke richtig arbeiten.',
      note: 'Hat sich in der Sporthalle das Bein verbogen und ein neues, blaues bekommen. Jetzt läuft der Selbsttest.', color: '#4a4d52',
      quelle: 'https://en.wikipedia.org/wiki/Legged_robot',
      box: () => [MX + 576, MY + 292, 64, 68] },
    { id: 'uv', echt: 'Genau so: UV-Roboter fahren nur, wenn niemand im Raum ist, meist nachts. Tagsüber warten sie an der Ladestation.', name: 'UV-Desinfektionsroboter', bereich: 'Medizin', aera: 'seit den 2010ern', typ: 'Fahrender UV-C-Strahler',
      fakt: 'UV-C-Licht zerstört das Erbgut von Bakterien und Viren. Desinfektionsroboter fahren deshalb durch leere Zimmer, denn für Haut und Augen ist das Licht schädlich.',
      note: 'Wartet geduldig, bis alle gegangen sind.', color: '#d9c2ff',
      quelle: 'https://en.wikipedia.org/wiki/Ultraviolet_germicidal_irradiation',
      box: () => [MX + 4, MY + 200, 70, 160] },
  ],
  draw: drawKranken,
});
