/* Raum: Kantine (Ebene 4) */
const KX = rx(roomOf('kantine').c), KY = ry(roomOf('kantine').r);

/* ---------- Animation: Zustände pro Bild (0–59) ---------- */
function waiterX(f) {
  if (f < 24) return 270;
  if (f < 38) return lerp(270, 370, ease(seg(f, 24, 38)));
  if (f < 52) return 370;
  return lerp(370, 270, ease(seg(f, 52, 60)));
}
function armTip(f) {
  const rest = { x: 206, y: 222 }, tray = { x: waiterX(f) - 14, y: 284 }, pour = { x: 138, y: 248 }, rack = { x: 226, y: 244 }, stack = { x: 172, y: 246 };
  if (f < 2) return { p: mix(pour, rest, ease(seg(f, 0, 2))) };
  if (f < 5) return { p: mix(rest, tray, ease(seg(f, 2, 5))) };
  if (f < 8) return { p: mix(tray, rack, ease(seg(f, 5, 8))), carry: 'leer' };
  if (f < 14) return { p: mix(rack, rest, ease(seg(f, 8, 14))) };
  if (f < 17) return { p: mix(rest, pour, ease(seg(f, 14, 17))) };
  if (f < 22) return { p: mix(pour, tray, ease(seg(f, 17, 22))), carry: 'voll' };
  if (f < 26) return { p: mix(tray, rest, ease(seg(f, 22, 26))) };
  if (f < 54) return { p: rest };
  if (f < 57) return { p: mix(rest, stack, ease(seg(f, 54, 57))) };
  return { p: mix(stack, pour, ease(seg(f, 57, 59))), carry: f < 59 ? 'sauber' : null };
}
function bowlState(f) {
  const wx = waiterX(f), tray = { x: wx - 14, y: 290 };
  if (f < 3) return { p: tray, full: false };
  if (f < 22) return null;
  if (f < 40) return { p: tray, full: true };
  if (f < 44) return { p: mix({ x: 356, y: 290 }, { x: 470, y: 292 }, ease(seg(f, 40, 44))), full: true };
  if (f < 48) return { p: { x: 470, y: 292 }, full: true, eat: 1 - seg(f, 44, 48) };
  if (f < 52) return { p: mix({ x: 470, y: 292 }, { x: 356, y: 290 }, ease(seg(f, 48, 52))), full: false };
  return { p: tray, full: false };
}
const drumTilt = f => (f >= 8 && f < 16 ? Math.sin(Math.PI * seg(f, 8, 16)) * 0.9 : 0);
function bowl(x, y, full, s = 1) {
  ctx.beginPath(); ctx.moveTo(x - 12, y - 8); ctx.quadraticCurveTo(x, y + 6, x + 12, y - 8); ctx.closePath(); paint('#fbfaf6', INK, 1.5);
  if (full) noodles(x, y - 9, 0.55 * s);
}
function vacX(f) { return 452 + 20 * Math.sin(TAU * f / 60); }
// Der Kellner hat ein Schutzfeld (eigene Uhr). Küche, Schale und Gast laufen mit seiner Uhr, damit nichts ohne ihn weiterfliegt.
function drawKantine(f0) {
  const f = heldF('kellner', f0);
  // Wand
  ctx.fillStyle = '#ebe5d6'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#d6dfe2'; ctx.fillRect(0, 170, RW, 190);
  ctx.strokeStyle = '#bfcace'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 0; x <= RW; x += 20) { ctx.moveTo(x, 170); ctx.lineTo(x, 360); }
  for (let y = 170; y <= 360; y += 20) { ctx.moveTo(0, y); ctx.lineTo(RW, y); }
  ctx.stroke();
  line(0, 170, RW, 170, INK, 2);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('KANTINE', 248, 158, 46, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  // Boden
  ctx.fillStyle = '#8c7b68'; ctx.fillRect(0, 360, RW, 40);
  ctx.strokeStyle = '#75665557'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x < RW; x += 64) { ctx.moveTo(x + (x / 64 % 2) * 30, 360); ctx.lineTo(x + (x / 64 % 2) * 30, 400); }
  ctx.moveTo(0, 380); ctx.lineTo(RW, 380); ctx.stroke();
  line(0, 360, RW, 360, INK, 2);

  // Speisetafel
  box(226, 34, 160, 86, '#2f3b36', 3);
  ctx.strokeStyle = '#a8763f'; ctx.lineWidth = 4; ctx.strokeRect(228, 36, 156, 82);
  const chalk = { family: '"Saira Condensed", sans-serif', weight: 600, color: '#e8eee9' };
  text('HEUTE', 306, 56, 14, Object.assign({ align: 'center' }, chalk));
  text('Schraubennudeln', 238, 76, 12, chalk); text('3,50', 374, 76, 12, Object.assign({ align: 'right' }, chalk));
  text('Öl-Spezial', 238, 92, 12, chalk); text('1,20', 374, 92, 12, Object.assign({ align: 'right' }, chalk));
  text('Strom satt', 238, 108, 12, chalk); text('frei', 374, 108, 12, Object.assign({ align: 'right' }, chalk));
  // Uhr: Zeiger macht eine Runde pro Durchlauf
  circle(430, 76, 22, '#f7f5ef');
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(430 + 17 * Math.cos(a), 76 + 17 * Math.sin(a), 430 + 20 * Math.cos(a), 76 + 20 * Math.sin(a), INK, 1.5); }
  const ha = TAU * f0 / 60 - Math.PI / 2;
  line(430, 76, 430 + 16 * Math.cos(ha), 76 + 16 * Math.sin(ha), '#d9542b', 2);
  line(430, 76, 430, 64, INK, 2.5); circle(430, 76, 2.5, INK, null);
  // Lampe
  line(480, 8, 480, 52, INK, 1.5);
  ctx.beginPath(); ctx.moveTo(466, 52); ctx.lineTo(494, 52); ctx.lineTo(504, 70); ctx.lineTo(456, 70); ctx.closePath(); paint('#2f3b36');
  ctx.fillStyle = 'rgba(255,236,170,0.18)'; ctx.beginPath(); ctx.moveTo(456, 70); ctx.lineTo(504, 70); ctx.lineTo(560, 300); ctx.lineTo(400, 300); ctx.closePath(); ctx.fill();

  // Regal mit Töpfen
  box(16, 134, 100, 8, '#a8763f');
  box(26, 112, 28, 22, '#8a8f94', 2); box(62, 118, 22, 16, '#b0b4b8', 2); box(90, 110, 18, 24, '#d9542b', 2);

  // Theke
  box(16, 262, 216, 98, '#b7bcc0');
  box(12, 258, 224, 12, '#d6d9dc');
  box(26, 286, 90, 64, '#a9aeb3'); box(124, 286, 98, 64, '#a9aeb3');
  line(108, 310, 108, 326, INK, 3); line(132, 310, 132, 326, INK, 3);
  box(214, 244, 24, 14, null, 2, 1.5); for (let x = 218; x < 238; x += 5) line(x, 244, x, 258, '#8a8f94', 1);
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(172, 256 - i * 4, 11, 3, 0, 0, TAU); paint('#fbfaf6', INK, 1.2); }

  withAlpha('rohr', () => {
    box(96, 0, 16, 150, '#8a8f94');
    ctx.beginPath(); ctx.moveTo(86, 150); ctx.lineTo(122, 150); ctx.lineTo(114, 166); ctx.lineTo(94, 166); ctx.closePath(); paint('#9da2a7');
    for (const [y, c] of [[30, '#5f9a4a'], [70, '#d9542b'], [110, '#f2c94c']]) box(80, y, 48, 26, c, 3, 1.5);
    if (f >= 46 && f < 54) { const t = seg(f, 46, 54); ctx.fillStyle = '#5f9a4a'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(100 + i * 2, lerp(168, 214, t) + i * 3, 2.5, 0, TAU); ctx.fill(); } }
  });
  withAlpha('koch', () => {
    box(84, 236, 40, 24, '#3b3d40', 3);
    ctx.save(); ctx.translate(104, 218); ctx.rotate(-0.35 + drumTilt(f));
    ctx.beginPath(); ctx.arc(0, 0, 24, -0.3, Math.PI + 0.3); ctx.closePath(); paint('#5d6064');
    for (let i = 0; i < 4; i++) { const a = TAU * f / 12 + i * 0.8; line(Math.cos(a) * 20, 4 + Math.abs(Math.sin(a)) * 14, Math.cos(a) * 12, 2 + Math.abs(Math.sin(a)) * 10, '#8a8f94', 2); }
    if (f < 12 || f >= 50) noodles(0, 6, 0.6);
    ctx.restore();
    ctx.fillStyle = f % 2 ? '#f08a24' : '#f4b33c'; for (const dx of [-8, 0, 8]) { ctx.beginPath(); ctx.moveTo(104 + dx - 4, 260); ctx.lineTo(104 + dx, 252); ctx.lineTo(104 + dx + 4, 260); ctx.closePath(); ctx.fill(); }
    circle(116, 248, 2.5, f % 12 < 6 ? '#7fe08a' : '#2d5b33', null);
    if (f >= 10 && f < 15) { ctx.fillStyle = '#f2c94c'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(128 + i * 2, 230 + (f - 10) * 4 + i * 3, 2.2, 0, TAU); ctx.fill(); } }
    if (f < 4 || f > 18) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (let k = 0; k < 3; k++) { const st = (f * 2 + k * 20) % 60; ctx.beginPath(); ctx.arc(96 + k * 9 + Math.sin(st / 8) * 4, 194 - st, 5 + st / 10, 0, TAU); ctx.fill(); } }
  });
  if (f < 17) bowl(138, 258, f >= 13);
  withAlpha('arm', () => {
    const a = armTip(f), S = { x: 196, y: 238 }, E = ik2(S, a.p, 48, 48);
    box(186, 246, 20, 14, '#3b3d40', 2); box(190, 234, 12, 12, '#d9542b', 2, 1.5);
    limb(S.x, S.y, E.x, E.y, 8, '#d9542b'); limb(E.x, E.y, a.p.x, a.p.y, 7, '#d9542b');
    circle(S.x, S.y, 5, '#3b3d40'); circle(E.x, E.y, 4.5, '#3b3d40');
    line(a.p.x - 5, a.p.y, a.p.x - 5, a.p.y + 8, INK, 2); line(a.p.x + 5, a.p.y, a.p.x + 5, a.p.y + 8, INK, 2);
    if (a.carry) bowl(a.p.x, a.p.y + 16, a.carry === 'voll');
  });

  // Tisch
  box(398, 300, 104, 8, '#a8763f');
  box(406, 308, 6, 52, '#8e6233'); box(488, 308, 6, 52, '#8e6233');

  // Saugroboter mit Socke
  withAlpha('saug', () => {
    const sx = vacX(f0), pull = sx - 17 - 414;
    const sag = Math.max(0, 40 - pull) * 0.35;
    ctx.beginPath(); ctx.moveTo(412, 357); ctx.quadraticCurveTo((412 + sx - 17) / 2, 357 + sag, sx - 17, 355);
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(3, 10 - pull * 0.09); ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#c94040'; ctx.lineWidth = Math.max(1.5, 7 - pull * 0.09); ctx.stroke();
    ctx.setLineDash([3, 4]); ctx.strokeStyle = '#f3efe4'; ctx.lineWidth = Math.max(1, 5 - pull * 0.08); ctx.stroke(); ctx.setLineDash([]);
    box(sx - 17, 347, 34, 12, '#2e3033', 5);
    box(sx - 9, 344, 18, 5, '#4a4d52', 2);
    circle(sx + 9, 353, 2, f0 % 10 < 5 ? '#7fe08a' : '#2d5b33', null);
    if (f0 > 11 && f0 < 20) { line(sx + 22, 344, sx + 28, 340, INK, 1.5); line(sx + 23, 351, sx + 30, 351, INK, 1.5); }
  });

  // Gast
  withAlpha('gast', () => {
    box(512, 318, 34, 6, '#a8763f'); box(540, 276, 6, 48, '#a8763f');
    line(516, 324, 516, 360, INK, 3); line(542, 324, 542, 360, INK, 3);
    const b = bowlState(f);
    let hand = { x: 506, y: 298 };
    if (f >= 38 && f < 40) hand = mix({ x: 506, y: 298 }, { x: 362, y: 286 }, seg(f, 38, 40));
    else if (f >= 40 && f < 44) hand = { x: b.p.x + 8, y: b.p.y - 4 };
    else if (f >= 44 && f < 48) hand = f % 2 ? { x: 512, y: 266 } : { x: 476, y: 288 };
    else if (f >= 48 && f < 52) hand = { x: b.p.x + 8, y: b.p.y - 4 };
    else if (f >= 52 && f < 56) hand = mix({ x: 362, y: 286 }, { x: 506, y: 298 }, seg(f, 52, 56));
    person({ x: 526, face: -1, sit: true, foot: 360, shirt: '#7b4b8e', pants: '#3d5a80', hair: '#3a2c22', hand });
  });

  // Schale beim Gast oder auf dem Tablett
  const bs = bowlState(f);
  if (bs) { ctx.save(); ctx.globalAlpha = alphaOf('kellner'); bowl(bs.p.x, bs.p.y, bs.full, bs.eat == null ? 1 : Math.max(0.2, bs.eat)); ctx.restore(); }

  // Kellnerroboter
  withAlpha('kellner', () => {
    const wx = waiterX(f);
    circle(wx - 14, 356, 4, '#2d2f33'); circle(wx + 14, 356, 4, '#2d2f33');
    box(wx - 24, 328, 48, 26, '#f1efe9', 8);
    ctx.fillStyle = f % 6 < 3 ? '#6ec3f2' : '#3e8fc4'; ctx.fillRect(wx - 18, 340, 36, 3);
    box(wx - 16, 302, 32, 26, '#e2e0d9');
    box(wx - 28, 298, 56, 5, '#c8c5bd', 2);
    box(wx - 3, 280, 6, 18, '#c8c5bd', 0, 1.5);
    box(wx - 21, 246, 42, 34, '#f1efe9', 8);
    box(wx - 16, 251, 32, 24, '#23384d', 4);
    ctx.strokeStyle = '#7fd3ff'; ctx.fillStyle = '#7fd3ff'; ctx.lineWidth = 2.2;
    const happy = f >= 22 && f < 40, blink = f === 5 || f === 6;
    for (const ex of [wx - 7, wx + 7]) {
      ctx.beginPath();
      if (blink) { ctx.moveTo(ex - 3, 263); ctx.lineTo(ex + 3, 263); ctx.stroke(); }
      else if (happy) { ctx.moveTo(ex - 4, 265); ctx.lineTo(ex, 260); ctx.lineTo(ex + 4, 265); ctx.stroke(); }
      else { ctx.arc(ex, 263, 2.6, 0, TAU); ctx.fill(); }
    }
  });

  withAlpha('kuehl', () => {
    box(574, 242, 52, 118, '#e9edef', 6);
    line(574, 278, 626, 278); line(581, 254, 581, 270, INK, 3); line(581, 288, 581, 318, INK, 3);
    ctx.fillStyle = '#d9542b'; ctx.fillRect(604, 292, 8, 8); ctx.fillStyle = '#3e6f9e'; ctx.fillRect(596, 308, 10, 6);
    box(594, 254, 22, 14, '#23384d', 2, 1.5);
    text('4°', 605, 265, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' });
  });
}


registerRoom({
  key: 'kantine', name: 'Kantine', level: 'Ebene 4',
  hitOrder: ['saug', 'arm', 'kellner', 'gast', 'kuehl', 'koch', 'rohr'],
  robots: [
    { id: 'koch', quelle: 'https://wgbh.org/lifestyle/2018-05-03/at-this-new-boston-restaurant-the-meals-are-prepared-by-robots', name: 'Wok-Roboter', bereich: 'Service', aera: 'seit den 2010ern', typ: 'Beheizte, drehende Kochtrommel',
      fakt: 'Automatische Wok-Maschinen rühren das Essen in einer beheizten Trommel, die sich ständig dreht. Zutaten kommen abgemessen aus Spendern darüber. In Boston eröffnete 2018 das Restaurant Spyce, in dem solche Trommeln kochten.',
      echt: 'Realistisch: Die Trommel kippt und schüttet das Essen in eine Schale. Werfen kann sie nicht.',
      note: 'Rührt und schüttet. Eine Schale pro Runde.', color: '#5d6064',
      box: () => [KX + 76, KY + 190, 60, 72] },
    { id: 'arm', quelle: 'https://en.wikipedia.org/wiki/Automated_restaurant', name: 'Ausgabe-Arm', bereich: 'Service', aera: 'seit den 2010ern', typ: 'Kleiner Roboterarm an der Theke',
      fakt: 'In automatisierten Küchen stellen kleine Roboterarme fertige Schalen bereit und räumen leeres Geschirr ab. Sie arbeiten hinter der Theke, getrennt von den Gästen.',
      echt: 'Realistisch. Solche Arme sind langsamer als hier gezeigt und arbeiten oft hinter einer Abdeckung.',
      note: 'Räumt die leere Schale ab, stellt die volle aufs Tablett und holt eine saubere vom Stapel.', color: '#d9542b',
      box: () => [KX + 180, KY + 210, 60, 52] },
    { id: 'kellner', name: 'Kellnerroboter', bereich: 'Service', aera: 'seit ca. 2018', typ: 'Servierroboter mit Tablett und Display-Gesicht',
      fakt: 'Servierroboter finden ihren Weg mit Laserscannern, Kameras oder Markierungen an der Decke. Viele Restaurants setzten sie ab 2020 ein, auch um in der Pandemie Kontakte zu verringern.',
      echt: 'Genau so: Der Gast nimmt sein Essen selbst vom Tablett und stellt das leere Geschirr wieder darauf.',
      note: 'Fährt zum Tisch, wartet, bis der Gast fertig ist, und bringt die leere Schale zurück.', color: '#23384d', quelle: 'https://en.wikipedia.org/wiki/Service_robot',
      box: f => [KX + waiterX(heldF('kellner', f)) - 30, KY + 244, 60, 116] },
    { id: 'saug', name: 'Saugroboter', bereich: 'Haushalt', aera: 'seit 2001', typ: 'Bodenroboter mit Bürste',
      fakt: 'Der Electrolux Trilobite kam 2001 als einer der ersten Saugroboter in den Handel, ein Jahr später folgte der Roomba von iRobot. Socken und Kabel sind bis heute ihre häufigsten Gegner.',
      echt: 'Stimmt so: Socken und Kabel bringen Saugroboter oft zum Stehen. Neuere Geräte erkennen sie per Kamera und fahren drumherum.',
      note: 'Kämpft seit 5 Sekunden mit derselben Socke.', color: '#2e3033', quelle: 'https://en.wikipedia.org/wiki/Robotic_vacuum_cleaner',
      box: f => [KX + vacX(f) - 24, KY + 340, 48, 22] },
    { id: 'rohr', quelle: 'https://en.wikipedia.org/wiki/Automated_restaurant', name: 'Zutatenspender', bereich: 'Service', aera: 'seit den 2010ern', typ: 'Vorratsbehälter mit Dosierklappe',
      fakt: 'Automatische Küchen lagern Zutaten in Behältern über dem Kochgerät. Eine Klappe oder Förderschnecke gibt genau abgemessene Portionen ab.',
      echt: 'Realistisch. Das Gemüse schneiden vorher Menschen und füllen es ein.',
      note: 'Gibt jede Runde frisches Gemüse in die Trommel.', color: '#8a8f94',
      box: () => [KX + 80, KY, 50, 168] },
    { id: 'kuehl', quelle: 'https://en.wikipedia.org/wiki/Smart_refrigerator', name: 'Kühlschrank', bereich: 'Haushalt', aera: 'kein Roboter', typ: 'Haushaltsgerät',
      fakt: 'Vernetzte Kühlschränke melden die Temperatur und manchmal auch, was fehlt. Nachschub bringt hier der Lieferroboter aus dem Lager.',
      echt: 'Vernetzte Kühlschränke gibt es. Selbst einräumen können sie nicht.',
      note: 'Bekommt regelmäßig Besuch vom Lieferroboter.', color: '#e9edef',
      box: () => [KX + 572, KY + 240, 56, 120] },
    { id: 'gast', name: 'Gast', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch, etwa 1,75 m',
      fakt: 'Alle Roboter sind im Größenverhältnis zu ihm gezeichnet. Der Kellnerroboter reicht ihm im Stehen etwa bis zur Brust.',
      note: 'Nimmt die Schale selbst vom Tablett und stellt sie brav zurück.', color: '#7b4b8e',
      box: () => [KX + 494, KY + 244, 54, 116] },
  ],
  draw: drawKantine,
});
