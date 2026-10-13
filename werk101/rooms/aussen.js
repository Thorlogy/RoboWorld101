/* Außengelände links neben dem Haus (Erdgeschosshöhe): Straße und Park.
   Kein eigener Himmel: die Umgebung des Hauses scheint durch. */
// Regenschirm für Menschen draußen (nur bei Regen gezeichnet)
function schirm(x, top, color) {
  line(x, top, x, top + 34, INK, 2);
  ctx.beginPath(); ctx.moveTo(x - 26, top + 6); ctx.quadraticCurveTo(x, top - 22, x + 26, top + 6); ctx.closePath(); paint(color, INK, 1.5);
}
const STX = rx(roomOf('strasse').c), STY = ry(roomOf('strasse').r);
const PKX = rx(roomOf('park').c), PKY = ry(roomOf('park').r);

/* ---------- Straße: Robotaxi wartet am Zebrastreifen (Bild 20–40), Lieferroboter kommt aus dem Haus ---------- */
const taxiX = f => (f < 20 ? lerp(-200, 170, ease(seg(f, 0, 20))) : f < 40 ? 170 : lerp(170, 900, ease(seg(f, 40, 60))));
function walker(f) {
  if (f < 22) return { x: lerp(-30, 340, seg(f, 0, 22)), foot: 384, s: 1, walk: true };
  if (f < 38) return { x: 340, foot: lerp(384, 338, seg(f, 22, 38)), s: lerp(1, 0.86, seg(f, 22, 38)), walk: true };
  return { x: lerp(340, 700, seg(f, 38, 60)), foot: 338, s: 0.86, walk: true };
}
const walkBotX = f => lerp(680, -80, f / 60);

function drawStrasse(f) {
  // Gehweg vorn, Straße dahinter
  ctx.fillStyle = '#6d6a64'; ctx.fillRect(0, 300, RW, 46);
  ctx.fillStyle = '#bdb6a8'; ctx.fillRect(0, 346, RW, 54);
  line(0, 346, RW, 346, INK, 2); line(0, 300, RW, 300, INK, 1.5);
  for (let x = 20; x < RW; x += 70) { ctx.fillStyle = '#f3f1ea'; ctx.fillRect(x, 321, 34, 3); }
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#f3f1ea'; ctx.fillRect(312 + i * 10, 302, 6, 42); }
  // Ampel und Laterne
  const green = f >= 20 && f < 40;
  box(392, 230, 6, 116, '#3b3d40'); box(384, 220, 22, 34, '#2a2723', 3, 1.2);
  circle(395, 230, 4, green ? '#4a1a1a' : '#ff3b30', null); circle(395, 244, 4, green ? '#7fe08a' : '#1f3a24', null);
  box(40, 160, 5, 186, '#3b3d40'); line(42, 162, 70, 152, '#3b3d40', 4); box(62, 148, 22, 8, '#fff3c4', 2, 1.2);
  text('STRASSE', 470, 270, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });

  withAlpha('taxi2', () => {
    ctx.save(); ctx.translate(taxiX(f), 336); ctx.scale(0.86, 0.86); car(0, 0, '#f3f1ea', { sensors: true, stripe: '#ffd23f' }); ctx.restore();
    if (f >= 22 && f < 38) { box(taxiX(f) - 34, 194, 68, 16, '#2a2723', 3, 1); text('WARTE', taxiX(f), 206, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' }); }
  });
  withAlpha('passant', () => {
    const w = walker(f), st = Math.sin(TAU * f / 8) * 4;
    person({ x: w.x, foot: w.foot, s: w.s, face: w.x < 340 || f < 22 ? 1 : 1, shirt: '#3d7f8f', pants: '#3b3d40', hair: '#2a1f18', hand: { x: w.x + 8 + st, y: w.foot - 60 } });
    if (state.wetter === 'regen') schirm(w.x + 4, w.foot - 150 * w.s, '#d9542b');
  });
  heldDraw('gehweg', f, f => {
    const x = walkBotX(f);
    for (let i = 0; i < 3; i++) circle(x - 18 + i * 18, 383, 5, '#2d2f33');
    box(x - 28, 354, 56, 26, '#f2f0ea', 6);
    ctx.fillStyle = '#23384d'; ctx.fillRect(x - 22, 359, 44, 6);
    line(x - 20, 354, x - 20, 322, INK, 1.5);
    ctx.beginPath(); ctx.moveTo(x - 20, 322); ctx.lineTo(x - 34, 327); ctx.lineTo(x - 20, 332); ctx.closePath(); paint('#d9542b', INK, 1.5);
  });
}

/* ---------- Park: autonomer Shuttlebus öffnet die Tür noch einmal (Bild 34–48), Kehrmaschine auf dem Weg ---------- */
function shuttleX(f) {
  if (f < 12) return lerp(-180, 300, ease(seg(f, 0, 12)));
  if (f < 52) return 300;
  return lerp(300, 840, ease(seg(f, 52, 60)));
}
const doorOpen = f => Math.max(f >= 14 && f < 34 ? Math.min(1, seg(f, 14, 18)) - seg(f, 30, 34) : 0, f >= 40 && f < 52 ? Math.min(1, seg(f, 40, 43)) - seg(f, 48, 52) : 0);
function guest1(f) { if (f < 14) return { x: lerp(-30, 190, seg(f, 0, 14)), v: true }; if (f < 20) return { x: 190, v: true }; if (f < 28) return { x: lerp(190, 340, seg(f, 20, 28)), v: true, alpha: 1 - seg(f, 25, 28) }; return { v: false }; }
function guest2(f) { if (f < 30) return { v: false }; if (f < 44) return { x: lerp(-30, 280, seg(f, 30, 44)), v: true, run: true }; if (f < 48) return { x: lerp(280, 340, seg(f, 44, 48)), v: true, alpha: 1 - seg(f, 45, 48) }; return { v: false }; }
const sweeperX = f => 120 + 360 * (0.5 - 0.5 * Math.cos(TAU * f / 60));

// Gartenroboter am Hochbeet: fährt von Pflanze zu Pflanze, gießt, und drückt am Ende ein Unkraut in die Erde
const PK_PLANTS = [[490, 0], [522, 1], [556, 2], [590, 0], [616, 1]];
function gardenX(f) {
  const stops = [490, 556, 616];
  if (f < 12) return stops[0];
  if (f < 18) return lerp(stops[0], stops[1], ease(seg(f, 12, 18)));
  if (f < 30) return stops[1];
  if (f < 36) return lerp(stops[1], stops[2], ease(seg(f, 30, 36)));
  if (f < 50) return stops[2];
  return lerp(stops[2], stops[0], ease(seg(f, 50, 60)));
}
const gardenZ = f => (f < 12 ? 6 * Math.sin(Math.PI * seg(f, 2, 10)) : f < 30 ? 6 * Math.sin(Math.PI * seg(f, 20, 28)) : f < 50 ? (f >= 40 && f < 48 ? 18 * Math.sin(Math.PI * seg(f, 40, 48)) : 6 * Math.sin(Math.PI * seg(f, 38, 40))) : 0);
const gardenWater = f => (f >= 3 && f < 10) || (f >= 21 && f < 28);
function drawPark(f) {
  ctx.fillStyle = '#7fae64'; ctx.fillRect(0, 330, RW, 70);
  ctx.fillStyle = '#c9b48f'; ctx.fillRect(0, 346, RW, 22);
  line(0, 330, RW, 330, INK, 1.5);
  for (const [x, h] of [[46, 130], [118, 100], [430, 150]]) { box(x - 5, 330 - h * 0.45, 10, h * 0.45, '#8e6233', 0, 1.2); circle(x, 330 - h * 0.55, h * 0.3, '#5f9a4a'); }
  box(70, 318, 60, 6, '#a8763f', 1, 1.2); line(76, 324, 76, 336, INK, 2); line(124, 324, 124, 336, INK, 2);
  // Haltestelle unter einem begrünten Solardach
  box(214, 250, 4, 110, '#3b3d40'); circle(216, 244, 10, '#f0b429', INK, 1.5); text('H', 216, 249, 12, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center' });
  for (const x of [150, 380]) box(x - 3, 228, 6, 102, '#8a8f94', 0, 1.2);
  ctx.beginPath(); ctx.moveTo(132, 230); ctx.lineTo(398, 218); ctx.lineTo(398, 226); ctx.lineTo(132, 238); ctx.closePath(); paint('#23384d', INK, 1.5);
  ctx.strokeStyle = 'rgba(127,211,255,0.5)'; ctx.lineWidth = 1; for (let x = 160; x < 398; x += 30) { ctx.beginPath(); ctx.moveTo(x, 230 - (x - 132) * 0.045); ctx.lineTo(x, 237 - (x - 132) * 0.045); ctx.stroke(); }
  for (let i = 0; i < 12; i++) { const x = 140 + i * 22, y = 230 - (x - 132) * 0.045; circle(x, y - 4, 6 + (i % 3) * 2, i % 2 ? '#5f9a4a' : '#7aae5a', INK, 1); }
  for (const x of [140, 392]) { line(x, 236, x - 2, 262, '#4e8a3c', 2); line(x + 4, 236, x + 6, 254, '#4e8a3c', 2); }
  // Gemeinschaftsgarten: Hochbeet mit Gartenroboter
  box(470, 300, 160, 40, '#a8763f', 2, 1.5); ctx.fillStyle = '#6b4a2a'; ctx.fillRect(472, 300, 156, 8);
  for (const [x, k] of PK_PLANTS) { if (k === 0) { circle(x, 292, 9, '#7aae5a', INK, 1); circle(x - 5, 290, 5, '#9bc47a', null); } else if (k === 1) { for (const d of [-4, 0, 4]) line(x, 300, x + d, 280, '#5f9a4a', 2); circle(x, 302, 3, '#e07a3a', null); } else { circle(x, 292, 7, '#4e8a3c', INK, 1); circle(x + 3, 288, 3, '#d94a4a', null); } }
  text('PARK', 260, 300, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  withAlpha('gartenbot', () => {
    const x = gardenX(f), z = gardenZ(f);
    box(468, 296, 164, 4, '#8a8f94', 1, 1);
    box(x - 4, 236, 8, 64, '#d6d9dc', 1, 1.5); box(x - 16, 232, 32, 8, '#d6d9dc', 1, 1.5);
    box(x - 3, 240 + z, 6, 30, '#8a8f94', 1, 1.2); box(x - 6, 268 + z, 12, 8, '#3b3d40', 2, 1);
    circle(x + 10, 236, 2, f % 6 < 3 ? '#7fe08a' : '#2d5b33', null);
    if (gardenWater(f)) for (let i = 0; i < 6; i++) { const yy = 278 + z + ((f * 3 + i * 5) % 14); circle(x - 4 + (i % 3) * 4, yy, 1.6, '#7fd3ff', null); }
  });

  heldDraw('kehr', f, f => {
    const x = sweeperX(f);
    ctx.save(); ctx.translate(x, 354); ctx.scale(1.9, 1.9); ctx.translate(-x, -354);
    box(x - 22, 330, 44, 18, '#e6e3da', 5);
    circle(x - 14, 350, 4, '#2d2f33'); circle(x + 14, 350, 4, '#2d2f33');
    for (const s of [-1, 1]) { ctx.save(); ctx.translate(x + s * 24, 348); ctx.rotate(TAU * f / 6 * s); for (let i = 0; i < 6; i++) line(0, 0, Math.cos(i) * 6, Math.sin(i) * 3, '#d9542b', 1.2); ctx.restore(); }
    box(x - 6, 320, 12, 10, '#3b3d40', 2, 1); circle(x, 318, 2, f % 6 < 3 ? '#ff8a24' : '#8a4a1c', null);
    ctx.restore();
  });
  withAlpha('shuttle', () => {
    // autonomer Kleinbus in echter Größe: 4 m lang, 2,75 m hoch, Platz für etwa 12 Fahrgäste
    const x = shuttleX(f), d = doorOpen(f);
    box(x - 138, 184, 276, 178, '#3e6f9e', 24);
    ctx.fillStyle = '#9fc4d6'; for (const [wx, ww] of [[-124, 64], [-54, 60]]) ctx.fillRect(x + wx, 204, ww, 92);
    ctx.fillRect(x + 92, 204, 34, 92);
    ctx.fillStyle = '#20384f'; ctx.fillRect(x + 14, 206, 72, 150);
    box(x + 14 - 34 * d, 206, 36, 150, '#2f5880', 2, 1.2); box(x + 50 + 34 * d, 206, 36, 150, '#2f5880', 2, 1.2);
    for (const dx of [-90, 90]) { circle(x + dx, 364, 20, '#2d2f33'); circle(x + dx, 364, 7, '#8a8f94', null); }
    box(x - 18, 170, 36, 14, '#2a2723', 3, 1.2);
    box(x + 124, 318, 14, 12, '#ffd23f', 2, 1); box(x - 138, 318, 8, 12, '#d9342b', 1, 1);
    if (f >= 38 && f < 44) text('Sensor: Person', x, 160, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#3e6f9e' });
  });
  withAlpha('fahrgast', () => {
    const a = guest1(f), b = guest2(f);
    if (a.v) { ctx.save(); ctx.globalAlpha *= a.alpha == null ? 1 : a.alpha; person({ x: a.x, foot: 384, face: 1, shirt: '#7b4b8e', pants: '#3b3d40', hair: '#d6d2c8' }); if (state.wetter === 'regen') schirm(a.x + 6, 234, '#3e6f9e'); ctx.restore(); }
    if (b.v) { ctx.save(); ctx.globalAlpha *= b.alpha == null ? 1 : b.alpha; const st = Math.sin(TAU * f / 4) * 8; person({ x: b.x, foot: 384, face: 1, lean: 6, shirt: '#d9542b', pants: '#2f4866', hair: '#3a2c22', hand: { x: b.x + 14 + st, y: 320 } }); ctx.restore(); }
  });
}

registerRoom({
  key: 'strasse', name: 'Straße', level: 'Außengelände',
  hitOrder: ['passant', 'gehweg', 'taxi2'],
  robots: [
    { id: 'taxi2', name: 'Robotaxi im Verkehr', bereich: 'Mobilität', aera: 'seit den 2010ern', typ: 'Fahrerloses Auto',
      fakt: 'Robotaxis erkennen Fußgänger mit Kameras, Radar und Laserscannern auch im Dunkeln. Nähert sich jemand dem Zebrastreifen, bremst das Auto und wartet, bis die Person die Fahrbahn verlassen hat.',
      echt: 'Realistisch. In Deutschland fahren Robotaxis bisher nur in Tests, meist mit einer Sicherheitsperson an Bord.',
      note: 'Wartet am Zebrastreifen geduldig, bis der Fußgänger drüben ist.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Robotaxi',
      box: f => [STX + taxiX(f) - 138, STY + 222, 276, 118] },
    { id: 'gehweg', name: 'Lieferroboter auf dem Gehweg', bereich: 'Logistik', aera: 'seit den 2010ern', typ: 'Sechsrädriger Lieferroboter',
      fakt: 'Kleine Lieferroboter fahren im Schritttempo über Gehwege und bringen Pakete oder Essen. Der Paketdienst Hermes hat solche Roboter auch in Hamburg getestet.',
      echt: 'Realistisch. Ampeln und Bordsteine sind für sie die schwierigsten Stellen.',
      note: 'Kommt aus der Eingangshalle und fährt die Straße entlang.', color: '#f2f0ea',
      quelle: 'https://en.wikipedia.org/wiki/Starship_Technologies',
      box: f => [STX + walkBotX(f) - 30, STY + 320, 60, 70] },
    { id: 'passant', name: 'Fußgänger', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Geht bei Grün über den Zebrastreifen.', note: 'Schaut trotzdem nach links und rechts. Richtig so.', color: '#3d7f8f',
      box: f => { const w = walker(f); return [STX + w.x - 22, STY + w.foot - 124 * w.s, 44, 124 * w.s]; } },
  ],
  draw: drawStrasse,
  glow(f) {
    glow(73, 156, 70, 'rgba(255,224,150,0.75)'); glow(395, f >= 20 && f < 40 ? 244 : 230, 18, f >= 20 && f < 40 ? 'rgba(127,224,138,0.9)' : 'rgba(255,80,60,0.9)');
    const x = taxiX(f); ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.moveTo(x + 134, 298); ctx.lineTo(x + 280, 284); ctx.lineTo(x + 280, 330); ctx.closePath(); ctx.fill(); ctx.restore();
    glow(x + 134, 300, 14, 'rgba(255,243,196,0.95)');
  },
});
registerRoom({
  key: 'park', name: 'Park', level: 'Außengelände',
  hitOrder: ['fahrgast', 'gartenbot', 'kehr', 'shuttle'],
  robots: [
    { id: 'shuttle', name: 'Autonomer Shuttlebus', bereich: 'Mobilität', aera: 'seit 2017', typ: 'Kleinbus ohne Fahrer',
      fakt: 'Im bayerischen Kurort Bad Birnbach fährt seit Oktober 2017 die erste autonome Buslinie Deutschlands auf öffentlichen Straßen. Der Bus hat weder Lenkrad noch Gaspedal und erkennt Hindernisse mit Laserscannern.',
      echt: 'Realistisch, auch das Wiederöffnen der Tür. An Bord fährt eine Begleitperson mit, die im Notfall eingreifen kann.',
      note: 'Sieht den Nachzügler kommen und öffnet die Tür noch einmal.', color: '#3e6f9e',
      quelle: 'https://www.deutschebahn.com/de/Digitalisierung/Smart-Mobility/Erstes-autonomes-Fahrzeug-auf-oeffentlichen-Strassen-3244104',
      box: f => [PKX + shuttleX(f) - 140, PKY + 168, 280, 216] },
    { id: 'kehr', quelle: 'https://en.wikipedia.org/wiki/Street_sweeper', name: 'Autonome Kehrmaschine', bereich: 'Umwelt', aera: 'Erprobung', typ: 'Kleine Kehrmaschine ohne Fahrer',
      fakt: 'Kleine autonome Kehrmaschinen werden in mehreren Städten erprobt. Sie fahren früh am Morgen über Wege und Plätze und kehren mit rotierenden Bürsten Laub und Müll zusammen.',
      echt: 'Bisher meist Pilotprojekte. Große Straßen kehren weiterhin Menschen mit Kehrfahrzeugen.',
      note: 'Fährt den Parkweg auf und ab.', color: '#e6e3da',
      box: f => [PKX + sweeperX(f) - 58, PKY + 270, 116, 90] },
    { id: 'gartenbot', name: 'Gartenroboter', bereich: 'Landwirtschaft', aera: 'seit 2016', typ: 'Portalroboter über dem Hochbeet',
      quelle: 'https://agritechobservatory.review.fao.org/en/farmbot',
      fakt: 'FarmBot aus den USA ist ein Gartenroboter, dessen Baupläne und Software frei im Internet stehen. Ein Portal fährt auf Schienen über das Hochbeet, der Kopf darunter sät, gießt jede Pflanze einzeln und drückt Unkraut in die Erde. Es gibt ihn seit 2016, viele Schulen und Gemeinschaftsgärten bauen ihn selbst nach.',
      echt: 'Realistisch. Er ist langsam und für kleine Beete gedacht, nicht für Felder.',
      note: 'Gießt drei Pflanzen und drückt zum Schluss ein Unkraut in die Erde.', color: '#d6d9dc',
      box: f => [PKX + gardenX(f) - 20, PKY + 228, 40, 80] },
    { id: 'fahrgast', name: 'Fahrgäste', bereich: 'Mensch', aera: 'Maßstab', typ: 'Zwei Menschen',
      fakt: 'Eine Dame steigt pünktlich ein, ein junger Mann rennt hinterher.', note: 'Er schafft es. Jedes Mal.', color: '#d9542b',
      box: f => { const a = guest1(f).v ? guest1(f) : guest2(f); return a.v ? [PKX + a.x - 22, PKY + 260, 44, 124] : [-9999, 0, 0, 0]; } },
  ],
  draw: drawPark,
  glow(f) {
    for (const x of [190, 265, 340]) glow(x, 240, 40, 'rgba(255,224,150,0.6)');
    const x = shuttleX(f); glow(x + 132, 324, 18, 'rgba(255,243,196,0.95)'); glow(x - 134, 324, 12, 'rgba(255,80,60,0.8)');
    glow(gardenX(f) + 10, 236, 8, 'rgba(127,224,138,0.9)');
  },
});
