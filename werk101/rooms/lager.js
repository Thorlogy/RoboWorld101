/* Raum: Lager (Ebene 1) */
const LX = rx(roomOf('lager').c), LY = ry(roomOf('lager').r);

function podAX(f) {
  if (f < 8) return 130;
  if (f < 24) return lerp(130, 300, ease(seg(f, 8, 24)));
  if (f < 36) return 300;
  if (f < 52) return lerp(300, 130, ease(seg(f, 36, 52)));
  return 130;
}
function podBX(f) {
  if (f < 8) return 320;
  if (f < 24) return lerp(320, 140, ease(seg(f, 8, 24)));
  if (f < 36) return 140;
  if (f < 52) return lerp(140, 320, ease(seg(f, 36, 52)));
  return 320;
}
function agvX(f) {
  if (f < 6) return 596;
  if (f < 20) return lerp(596, 548, ease(seg(f, 6, 20)));
  if (f < 28) return 548;
  if (f < 44) return lerp(548, 596, ease(seg(f, 28, 44)));
  return 596;
}
function pickerHand(f) {
  const rest = { x: 64, y: 300 }, pod = { x: 100, y: 292 };
  if (f < 6) return mix(pod, rest, ease(seg(f, 0, 6)));
  if (f < 54) return rest;
  return mix(rest, pod, ease(seg(f, 54, 60)));
}
const BIN_COLORS = ['#d9542b', '#f0b429', '#e6e3da', '#7b4b8e', '#3d5a80', '#c9a46a'];

function drawPod(x, floorY, s, seed, f) {
  ctx.save(); ctx.translate(x, floorY); ctx.scale(s, s);
  box(-36, -136, 72, 120, '#4f7aa8', 3);
  for (let row = 0; row < 4; row++) {
    const y = -132 + row * 29;
    for (let col = 0; col < 3; col++) box(-32 + col * 22, y + 6, 20, 20, BIN_COLORS[(seed + row * 3 + col) % 6], 2, 1.5);
    line(-36, y + 27, 36, y + 27, INK, 2);
  }
  box(-30, -16, 60, 14, '#f0b429', 3);
  circle(-20, -2, 3.5, '#2d2f33'); circle(20, -2, 3.5, '#2d2f33');
  circle(0, -9, 2.4, (f + seed) % 8 < 4 ? '#7fe08a' : '#2d5b33', null);
  ctx.restore();
}
function parcel(x, y, rot, k) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  box(-15, -22, 30, 22, '#c9a46a', 2);
  ctx.fillStyle = '#e8d6a8'; ctx.fillRect(-3, -21, 6, 20);
  box(4, -16, 8, 6, k % 2 ? '#f3f1ea' : '#e6e3da', 0, 1);
  ctx.restore();
}

function drawLager(f) {
  // Halle mit Hochregal im Hintergrund
  ctx.fillStyle = '#d6d1c6'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  for (const x of [360, 500, 632]) box(x - 5, 30, 10, 314, '#3e6f9e');
  for (const y of [110, 200, 290]) { box(355, y, 282, 8, '#e0662b'); }
  for (const [x, y, w, h] of [[372, 70, 50, 40], [430, 84, 56, 26], [520, 60, 70, 50], [372, 164, 60, 36], [520, 170, 46, 30], [574, 150, 52, 50], [380, 250, 40, 40], [520, 244, 90, 46]]) {
    box(x, y, w, h, '#c9a46a', 2, 1.5);
  }
  text('LAGER', 26, 92, 46, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  // Boden mit Rastercodes für die Regalroboter
  ctx.fillStyle = '#9a948a'; ctx.fillRect(0, 344, RW, 56);
  line(0, 344, RW, 344, '#f0b429', 3);
  ctx.fillStyle = '#2a2723';
  for (let x = 16; x < 420; x += 40) { ctx.fillRect(x, 366, 6, 4); ctx.fillRect(x + 20, 388, 6, 4); }
  line(0, 360, RW, 360, 'rgba(42,39,35,0.35)', 1.5);

  // Sortieranlage oben
  withAlpha('sortier', () => {
    for (const x of [40, 180, 310]) line(x, 8, x, 150, '#5d6064', 3);
    box(0, 150, 334, 12, '#3b3d40');
    const off = (f / 60 * 80) % 16;
    ctx.strokeStyle = '#8a8f94'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = off; x < 334; x += 16) { ctx.moveTo(x, 151); ctx.lineTo(x, 155); }
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(334, 156); ctx.lineTo(486, 290); ctx.lineTo(486, 298); ctx.lineTo(334, 164); ctx.closePath(); paint('#b0b4b8');
    // Scannerbogen
    box(214, 112, 6, 40, '#5d6064'); box(240, 112, 6, 40, '#5d6064'); box(210, 106, 40, 8, '#3b3d40', 2);
    let scanning = false;
    for (let k = -4; k <= 0; k++) {
      const x = 330 + 80 * (f - 30) / 60 + 80 * k;
      if (x <= 330 && x > -20) { parcel(x, 150, 0, k); if (Math.abs(x - 230) < 16) scanning = true; }
    }
    if (scanning) { line(230, 114, 230, 150, '#ff3b30', 2); circle(230, 114, 3, '#ff3b30', null); }
    if (f >= 30 && f < 46) {
      const t = seg(f, 30, 46);
      parcel(lerp(340, 470, t), lerp(158, 284, t), 0.72, 0);
    }
  });
  // Rollwagen am Rutschenende (hinten)
  box(456, 270, 80, 70, 'rgba(255,255,255,0)', 2);
  for (let x = 466; x < 536; x += 12) line(x, 270, x, 340, '#5d6064', 1.5);
  box(462, 300, 34, 26, '#c9a46a', 2, 1.5); box(496, 308, 30, 18, '#b48d56', 2, 1.5);
  box(452, 340, 88, 6, '#5d6064'); circle(462, 349, 4, '#2d2f33'); circle(530, 349, 4, '#2d2f33');

  // Regalroboter: B hinten (kleiner), A vorn
  withAlpha('regal', () => {
    drawPod(podBX(f), 344, 0.84, 2, f);
    drawPod(podAX(f), 360, 1, 0, f);
  });

  // Kommissioniererin mit Bildschirm und Kiste
  withAlpha('picker', () => {
    line(14, 240, 14, 358, '#5d6064', 3);
    box(2, 226, 30, 22, '#23384d', 2);
    text('3', 17, 242, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' });
    box(22, 322, 34, 36, '#3d5a80', 2);
    limb(50, 302, 46, 356, 7, '#3b3d40'); limb(54, 302, 58, 356, 7, '#3b3d40');
    box(38, 352, 14, 6, INK, 2); box(52, 352, 14, 6, INK, 2);
    limb(52, 302, 52, 266, 18, '#7b4b8e');
    ctx.fillStyle = '#e0662b'; ctx.fillRect(44, 268, 16, 26);
    ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(44, 284); ctx.lineTo(60, 284); ctx.stroke();
    circle(53, 250, 11, '#e2b48f');
    ctx.beginPath(); ctx.arc(52, 247, 11, Math.PI * 0.95, Math.PI * 2.05); paint('#2a1f18');
    circle(60, 251, 1.6, INK, null);
    const h = pickerHand(f);
    const el = { x: (54 + h.x) / 2 - 2, y: Math.max(276, h.y) + 10 };
    limb(54, 270, el.x, el.y, 6, '#7b4b8e'); limb(el.x, el.y, h.x, h.y, 5, '#e2b48f');
    if (f < 6 || f >= 58) box(h.x - 6, h.y - 10, 12, 10, '#f0b429', 1, 1.5);
  });

  // Katze im Gang
  withAlpha('katze', () => {
    const awake = f >= 20 && f < 32;
    ctx.beginPath(); ctx.ellipse(460, 351, 19, 9, 0, 0, TAU); paint('#d08a3a');
    ctx.strokeStyle = '#a5651f'; ctx.lineWidth = 2;
    for (const x of [452, 460, 468]) { ctx.beginPath(); ctx.moveTo(x, 343); ctx.lineTo(x - 2, 350); ctx.stroke(); }
    const tw = Math.sin(TAU * f / 20) * 0.5;
    ctx.beginPath(); ctx.moveTo(478, 354); ctx.quadraticCurveTo(492, 352 - 8 * tw, 488, 340 - 6 * tw);
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#d08a3a'; ctx.lineWidth = 4; ctx.stroke();
    const hy = awake ? 340 : 347;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(444 + s * 5, hy - 5); ctx.lineTo(444 + s * 7, hy - 13 - (awake && s > 0 ? 2 : 0)); ctx.lineTo(444 + s * 1, hy - 7); ctx.closePath(); paint('#d08a3a', INK, 1.5); }
    circle(444, hy, 8, '#d08a3a');
    if (awake) { circle(448, hy - 1, 1.8, INK, null); }
    else { line(445, hy - 1, 450, hy - 1, INK, 1.5); }
    if (!awake) {
      const z = ((f + 28) % 60) / 60;
      ctx.save(); ctx.globalAlpha *= 1 - z;
      text('z', 438 - z * 8, 332 - z * 30, 11 + z * 6, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#565c63' });
      ctx.restore();
    }
  });

  // Fahrerloser Stapler
  withAlpha('stapler', () => {
    const gx = agvX(f), alarm = f >= 20 && f < 30;
    ctx.fillStyle = alarm ? 'rgba(255,59,48,0.22)' : 'rgba(127,224,138,0.18)';
    ctx.beginPath(); ctx.moveTo(gx - 62, 358); ctx.lineTo(gx - 112, 358); ctx.lineTo(gx - 98, 346); ctx.lineTo(gx - 62, 346); ctx.closePath(); ctx.fill();
    box(gx - 62, 348, 42, 4, '#5d6064', 0, 1.5);
    box(gx - 60, 340, 36, 8, '#a8763f', 0, 1.5);
    box(gx - 58, 310, 32, 30, '#c9a46a', 2, 1.5);
    box(gx - 26, 286, 6, 72, '#3b3d40', 0, 1.5);
    box(gx - 20, 318, 60, 36, '#e6e3da', 4);
    ctx.fillStyle = '#e0662b'; ctx.fillRect(gx - 18, 334, 56, 5);
    box(gx + 4, 308, 16, 10, '#3b3d40', 3, 1.5);
    circle(gx + 30, 312, 4, alarm || (f >= 30 && f < 44 && f % 4 < 2) ? '#ff8a24' : '#8a4a1c', INK, 1.5);
    circle(gx - 8, 356, 5, '#2d2f33'); circle(gx + 28, 356, 5, '#2d2f33');
    if (f >= 30 && f < 44 && f % 4 < 3) text('PIEP', gx + 10, 296, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#d9542b' });
    if (alarm) text('!', gx - 70, 334, 20, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#d9542b' });
  });
}

registerRoom({
  key: 'lager', offset: 35, name: 'Lager', level: 'Ebene 1',
  hitOrder: ['katze', 'picker', 'regal', 'stapler', 'sortier'],
  robots: [
    { id: 'regal', echt: 'So arbeiten große Versandlager wirklich. Menschen haben in den Fahrbereichen der Roboter meist keinen Zutritt.', name: 'Regalroboter', bereich: 'Logistik', aera: 'seit den 2000ern', typ: 'Fahrerloser Roboter unter einem Regal',
      fakt: 'Nicht die Menschen laufen zur Ware, sondern das Regal kommt zu ihnen. Die Roboter finden ihren Weg über Codes, die in festem Raster auf den Hallenboden geklebt sind.',
      note: 'Zwei tanzen hier aneinander vorbei, ohne sich zu berühren.', color: '#4f7aa8',
      quelle: 'https://en.wikipedia.org/wiki/Amazon_Robotics',
      box: f => [LX + podAX(f) - 38, LY + 222, 76, 140] },
    { id: 'stapler', echt: 'Genau so: Liegt etwas im Schutzfeld, bremst das Fahrzeug. Katzen haben in echten Lagern allerdings nichts verloren.', name: 'Fahrerloser Stapler', bereich: 'Logistik', aera: 'seit den 1950ern', typ: 'Fahrerloses Transportfahrzeug',
      fakt: 'Das erste fahrerlose Transportfahrzeug baute die Firma Barrett Electronics aus Illinois in den 1950ern: einen Schlepper, der einem Draht im Boden folgte. Heute überwacht ein Laserscanner ein Schutzfeld vor dem Fahrzeug und bremst, sobald etwas darin liegt.',
      note: 'Hält vor der Katze, piept und fährt rückwärts. Jedes Mal.', color: '#e6e3da',
      quelle: 'https://en.wikipedia.org/wiki/Automated_guided_vehicle',
      box: f => [LX + agvX(f) - 64, LY + 284, 108, 76] },
    { id: 'sortier', quelle: 'https://en.wikipedia.org/wiki/Sorter_(logistics)', echt: 'Echte Anlagen schieben Pakete meist seitlich auf eine von vielen Rutschen. Der Scanner liest dabei den Code.', name: 'Sortieranlage', bereich: 'Logistik', aera: 'Fördertechnik', typ: 'Förderband mit Scanner und Rutsche',
      fakt: 'In großen Paketzentren laufen Zehntausende Sendungen pro Stunde über die Bänder. Ein Scanner liest den Code auf dem Paket, dann wird es auf die passende Rutsche geleitet.',
      note: 'Jede Runde rutscht ein Paket in den Rollwagen. Der Lieferroboter holt es ab.', color: '#3b3d40',
      box: () => [LX, LY + 106, 340, 60] },
    { id: 'picker', name: 'Kommissioniererin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch an der Packstation',
      fakt: 'Sie nimmt die Ware aus dem Fach, das der Bildschirm anzeigt. Weil die Regale zu ihr kommen, spart sie sich die Wege durch die Halle.',
      note: 'Fach 3. Immer Fach 3.', color: '#7b4b8e',
      box: () => [LX + 28, LY + 236, 46, 124] },
    { id: 'katze', echt: 'Echte Lager halten Tiere aus Hygiene- und Sicherheitsgründen fern.', name: 'Lagerkatze', bereich: 'Tier', aera: 'kein Roboter', typ: 'Katze',
      fakt: 'Liegt im Schutzfeld des Staplers. Weiß das auch.',
      note: 'Hebt einmal pro Runde den Kopf und schläft weiter.', color: '#d08a3a',
      box: () => [LX + 430, LY + 330, 66, 30] },
  ],
  draw: drawLager,
});
