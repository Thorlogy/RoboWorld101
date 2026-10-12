/* Außengelände links neben dem Haus (Erdgeschosshöhe): Straße und Park.
   Kein eigener Himmel: die Umgebung des Hauses scheint durch. */
const STX = rx(roomOf('strasse').c), STY = ry(roomOf('strasse').r);
const PKX = rx(roomOf('park').c), PKY = ry(roomOf('park').r);

/* ---------- Straße: Robotaxi wartet am Zebrastreifen (Bild 20–40), Lieferroboter kommt aus dem Haus ---------- */
const taxiX = f => (f < 20 ? lerp(-160, 220, ease(seg(f, 0, 20))) : f < 40 ? 220 : lerp(220, 800, ease(seg(f, 40, 60))));
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
    ctx.save(); ctx.translate(taxiX(f), 336); ctx.scale(0.86, 0.86); car(0, 0, '#f3f1ea', { sensors: true }); ctx.fillStyle = '#ffd23f'; ctx.fillRect(-66, -16, 132, 4); ctx.restore();
    if (f >= 22 && f < 38) { box(taxiX(f) - 34, 236, 68, 16, '#2a2723', 3, 1); text('WARTE', taxiX(f), 248, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' }); }
  });
  withAlpha('passant', () => {
    const w = walker(f), st = Math.sin(TAU * f / 8) * 4;
    person({ x: w.x, foot: w.foot, s: w.s, face: w.x < 340 || f < 22 ? 1 : 1, shirt: '#3d7f8f', pants: '#3b3d40', hair: '#2a1f18', hand: { x: w.x + 8 + st, y: w.foot - 60 } });
  });
  withAlpha('gehweg', () => {
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
  if (f < 12) return lerp(-140, 300, ease(seg(f, 0, 12)));
  if (f < 52) return 300;
  return lerp(300, 820, ease(seg(f, 52, 60)));
}
const doorOpen = f => Math.max(f >= 14 && f < 34 ? Math.min(1, seg(f, 14, 18)) - seg(f, 30, 34) : 0, f >= 40 && f < 52 ? Math.min(1, seg(f, 40, 43)) - seg(f, 48, 52) : 0);
function guest1(f) { if (f < 14) return { x: lerp(-30, 190, seg(f, 0, 14)), v: true }; if (f < 20) return { x: 190, v: true }; if (f < 28) return { x: lerp(190, 312, seg(f, 20, 28)), v: true, alpha: 1 - seg(f, 25, 28) }; return { v: false }; }
function guest2(f) { if (f < 30) return { v: false }; if (f < 44) return { x: lerp(-30, 280, seg(f, 30, 44)), v: true, run: true }; if (f < 48) return { x: lerp(280, 312, seg(f, 44, 48)), v: true, alpha: 1 - seg(f, 45, 48) }; return { v: false }; }
const sweeperX = f => 120 + 360 * (0.5 - 0.5 * Math.cos(TAU * f / 60));

function drawPark(f) {
  ctx.fillStyle = '#7fae64'; ctx.fillRect(0, 330, RW, 70);
  ctx.fillStyle = '#c9b48f'; ctx.fillRect(0, 346, RW, 22);
  line(0, 330, RW, 330, INK, 1.5);
  for (const [x, h] of [[60, 120], [180, 150], [520, 130], [610, 100]]) { box(x - 5, 330 - h * 0.45, 10, h * 0.45, '#8e6233', 0, 1.2); circle(x, 330 - h * 0.55, h * 0.3, '#5f9a4a'); }
  box(420, 318, 60, 6, '#a8763f', 1, 1.2); line(426, 324, 426, 336, INK, 2); line(474, 324, 474, 336, INK, 2);
  // Haltestelle
  box(214, 250, 4, 110, '#3b3d40'); circle(216, 244, 10, '#f0b429', INK, 1.5); text('H', 216, 249, 12, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center' });
  text('PARK', 480, 270, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });

  withAlpha('kehr', () => {
    const x = sweeperX(f);
    box(x - 22, 330, 44, 18, '#e6e3da', 5);
    circle(x - 14, 350, 4, '#2d2f33'); circle(x + 14, 350, 4, '#2d2f33');
    for (const s of [-1, 1]) { ctx.save(); ctx.translate(x + s * 24, 348); ctx.rotate(TAU * f / 6 * s); for (let i = 0; i < 6; i++) line(0, 0, Math.cos(i) * 6, Math.sin(i) * 3, '#d9542b', 1.2); ctx.restore(); }
    box(x - 6, 320, 12, 10, '#3b3d40', 2, 1); circle(x, 318, 2, f % 6 < 3 ? '#ff8a24' : '#8a4a1c', null);
  });
  withAlpha('shuttle', () => {
    const x = shuttleX(f), d = doorOpen(f);
    box(x - 80, 270, 160, 92, '#3e6f9e', 14);
    ctx.fillStyle = '#9fc4d6'; for (const wx of [-66, -28, 34]) ctx.fillRect(x + wx, 284, 30, 36);
    box(x - 4, 284, 32 * (1 - d) + 2, 72, '#2f5880', 2, 1.2);
    for (const dx of [-50, 50]) { circle(x + dx, 364, 12, '#2d2f33'); circle(x + dx, 364, 4, '#8a8f94', null); }
    box(x - 14, 260, 28, 10, '#2a2723', 3, 1.2);
    box(x + 62, 300, 14, 10, '#ffd23f', 2, 1);
    if (f >= 38 && f < 44) text('Sensor: Person', x, 252, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#3e6f9e' });
  });
  withAlpha('fahrgast', () => {
    const a = guest1(f), b = guest2(f);
    if (a.v) { ctx.save(); ctx.globalAlpha *= a.alpha == null ? 1 : a.alpha; person({ x: a.x, foot: 384, face: 1, shirt: '#7b4b8e', pants: '#3b3d40', hair: '#d6d2c8' }); ctx.restore(); }
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
      box: f => [STX + taxiX(f) - 64, STY + 250, 128, 90] },
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
});
registerRoom({
  key: 'park', name: 'Park', level: 'Außengelände',
  hitOrder: ['fahrgast', 'kehr', 'shuttle'],
  robots: [
    { id: 'shuttle', name: 'Autonomer Shuttlebus', bereich: 'Mobilität', aera: 'seit 2017', typ: 'Kleinbus ohne Fahrer',
      fakt: 'Im bayerischen Kurort Bad Birnbach fährt seit Oktober 2017 die erste autonome Buslinie Deutschlands auf öffentlichen Straßen. Der Bus hat weder Lenkrad noch Gaspedal und erkennt Hindernisse mit Laserscannern.',
      echt: 'Realistisch, auch das Wiederöffnen der Tür. An Bord fährt eine Begleitperson mit, die im Notfall eingreifen kann.',
      note: 'Sieht den Nachzügler kommen und öffnet die Tür noch einmal.', color: '#3e6f9e',
      quelle: 'https://www.deutschebahn.com/de/Digitalisierung/Smart-Mobility/Erstes-autonomes-Fahrzeug-auf-oeffentlichen-Strassen-3244104',
      box: f => [PKX + shuttleX(f) - 82, PKY + 258, 164, 112] },
    { id: 'kehr', name: 'Autonome Kehrmaschine', bereich: 'Umwelt', aera: 'Erprobung', typ: 'Kleine Kehrmaschine ohne Fahrer',
      fakt: 'Kleine autonome Kehrmaschinen werden in mehreren Städten erprobt. Sie fahren früh am Morgen über Wege und Plätze und kehren mit rotierenden Bürsten Laub und Müll zusammen.',
      echt: 'Bisher meist Pilotprojekte. Große Straßen kehren weiterhin Menschen mit Kehrfahrzeugen.',
      note: 'Fährt den Parkweg auf und ab.', color: '#e6e3da',
      box: f => [PKX + sweeperX(f) - 30, PKY + 312, 60, 44] },
    { id: 'fahrgast', name: 'Fahrgäste', bereich: 'Mensch', aera: 'Maßstab', typ: 'Zwei Menschen',
      fakt: 'Eine Dame steigt pünktlich ein, ein junger Mann rennt hinterher.', note: 'Er schafft es. Jedes Mal.', color: '#d9542b',
      box: f => { const a = guest1(f).v ? guest1(f) : guest2(f); return a.v ? [PKX + a.x - 22, PKY + 260, 44, 124] : [-9999, 0, 0, 0]; } },
  ],
  draw: drawPark,
});
