/* Bergwerk unter Tage (UG 1, c −5 und −4, unter Solar- und Energiepark), Doppelfeld wie der Tiefbahnhof.
   Maßstab 1 : 2 (1 m ≈ 34,5 Einheiten), weil ein Fahrlader 12 Meter lang ist.
   Fahrlader (Vorbild Sandvik mit AutoMine in Kiruna) holt Erz und kippt es in die Erzrolle; eine Kartierungsdrohne (Vorbild Hovermap) fliegt im Abbauraum. */
const MNX = rx(roomOf('mine1').c), MNY = ry(roomOf('mine1').r), MN_W = 2 * RW + WALL, MN_OFF = RW + WALL;
const MN_PILE = 250, MN_LOCH = 1040;   // rechts davon (x > 1190) liegt der Schacht, den ein Läufer zeichnet
function mnLader(g) {
  // Mitte des Laders; dir −1 = Schaufel links, +1 = Schaufel rechts
  const amHaufen = MN_PILE + 207, amLoch = MN_LOCH - 207;
  if (g < 70) return { x: amHaufen, dir: -1, voll: g > 40, schaufel: Math.sin(Math.PI * seg(g, 10, 50)) };
  if (g < 80) return { x: amHaufen, dir: 1, voll: true, schaufel: 0 };
  if (g < 200) return { x: lerp(amHaufen, amLoch, ease(seg(g, 80, 200))), dir: 1, voll: true, schaufel: 0 };
  if (g < 240) return { x: amLoch, dir: 1, voll: g < 225, schaufel: Math.sin(Math.PI * seg(g, 200, 240)), kippt: true };
  if (g < 260) return { x: amLoch, dir: -1, voll: false, schaufel: 0 };
  if (g < 400) return { x: lerp(amLoch, amHaufen, ease(seg(g, 260, 400))), dir: -1, voll: false, schaufel: 0 };
  return { x: amHaufen, dir: -1, voll: false, schaufel: 0 };
}
function mnDrohne(g) { const t = g / 480 * TAU; return { x: 200 + 120 * Math.sin(t), y: 80 + 30 * Math.sin(2 * t) }; }
function drawLader(p) {
  const fl = 340;
  ctx.save(); ctx.translate(p.x, 0); ctx.scale(p.dir, 1);
  // Hinterwagen mit Kabeltrommel, Vorderwagen mit Schaufel (knickgelenkt)
  box(-207, fl - 90, 190, 70, '#e0a526', 6, 2);
  circle(-150, fl - 104, 22, '#3b3d40', INK, 2); circle(-150, fl - 104, 8, '#8a8f94', INK, 1);
  box(-14, fl - 70, 150, 50, '#e0a526', 4, 2);
  box(-60, fl - 112, 54, 28, '#3b3d40', 2, 1.5);                  // Kamera- und Sensorkopf statt Fahrerkabine im Automatikbetrieb
  box(-50, fl - 106, 34, 12, '#23384d', 1, 1); circle(-14, fl - 98, 3, '#7fd3ff', null);
  for (const dx of [-150, -60, 60, 120]) { circle(dx, fl - 16, 22, '#2a2723', INK, 2); circle(dx, fl - 16, 8, '#5d6064', INK, 1); }
  // Schaufel vorn (hebt sich beim Laden und Kippen)
  ctx.save(); ctx.translate(140, fl - 46); ctx.rotate(-0.5 * p.schaufel);
  line(0, 0, 50, 10, INK, 8); box(40, -6, 70, 44, '#5d6064', 4, 2);
  if (p.voll) { ctx.beginPath(); ctx.moveTo(44, -6); ctx.quadraticCurveTo(76, -30, 108, -6); ctx.closePath(); paint('#8a5a3c', INK, 1.5); }
  ctx.restore();
  ctx.restore();
}
function drawMinePaar(f, off) {
  const g = state.g, L = mnLader(g), d = mnDrohne(g);
  ctx.save(); ctx.translate(-off, 0);
  // Gestein, Strecke (Stollen) und hoher Abbauraum links
  ctx.fillStyle = '#5b4f45'; ctx.fillRect(-20, 0, MN_W + 40, 408);
  ctx.fillStyle = '#7a6b5d'; ctx.beginPath(); ctx.moveTo(-20, 340); ctx.lineTo(-20, 20); ctx.quadraticCurveTo(200, -10, 420, 40); ctx.lineTo(440, 170); ctx.quadraticCurveTo(800, 150, MN_W + 20, 170); ctx.lineTo(MN_W + 20, 340); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 30; i++) { const x = (i * 211) % MN_W, y = 30 + (i * 97) % 300; circle(x, y, 2 + i % 3, 'rgba(0,0,0,0.12)', null); }
  // Gebirgsanker im Dach
  for (let x = 480; x < MN_W; x += 90) { line(x, 170, x, 190, '#8a8f94', 3); box(x - 6, 168, 12, 4, '#8a8f94', 0, 1); }
  // Lutte (Belüftungsrohr) unter der Firste
  box(440, 182, MN_W - 440, 22, '#f0b429', 10, 1.5);
  text('UNTER TAGE', 460, 300, 30, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(255,255,255,0.13)' });
  // Sohle, Erzhaufen, Erzrolle
  ctx.fillStyle = '#4a3f36'; ctx.fillRect(-20, 340, MN_W + 40, 68);
  ctx.beginPath(); ctx.moveTo(40, 340); ctx.quadraticCurveTo(140, 250, 260, 340); ctx.closePath(); paint('#8a5a3c', INK, 1.5);
  ctx.fillStyle = '#2a2723'; ctx.fillRect(MN_LOCH - 50, 340, 100, 68);
  for (let x = MN_LOCH - 46; x < MN_LOCH + 50; x += 16) line(x, 340, x, 350, '#8a8f94', 3);
  text('ERZROLLE', MN_LOCH, 330, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  if (L.kippt && g > 210 && g < 235) for (let i = 0; i < 6; i++) circle(MN_LOCH - 20 + (i * 7) % 30, 330 + ((g * 6 + i * 11) % 60), 5, '#8a5a3c', null);
  // Schild am Eingang des Automatikbereichs
  box(MN_W - 470, 220, 170, 44, '#f0b429', 0, 2);
  text('AUTOMATIKBEREICH', MN_W - 385, 238, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  text('KEIN ZUTRITT', MN_W - 385, 255, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  // Stromkabel des Laders bis zur Steckdose rechts
  box(1160, 230, 20, 30, '#3b3d40', 2, 1.5);
  ctx.strokeStyle = '#2a2723'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1170, 260); ctx.quadraticCurveTo((1170 + L.x - 150 * L.dir) / 2, 344, L.x - 150 * L.dir, 236); ctx.stroke();
  withAlpha('fahrlader', () => drawLader(L));
  // Drohne mit Lidar im Abbauraum
  withAlpha('minendrohne', () => {
    ctx.strokeStyle = 'rgba(127,255,170,0.35)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { const a = g * 0.25 + i * TAU / 6; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + Math.cos(a) * 160, d.y + Math.sin(a) * 120); ctx.stroke(); }
    box(d.x - 22, d.y - 6, 44, 12, '#3b3d40', 4, 1.5);
    for (const dx of [-26, 26]) { line(d.x + dx - 12, d.y - 10, d.x + dx + 12, d.y - 10, '#c9ccc8', 3); line(d.x + dx, d.y - 6, d.x + dx, d.y - 10, INK, 2); }
    circle(d.x, d.y + 10, 6, '#23384d', INK, 1.5);
  });
  // Leitstand über Tage (Bild im Bild)
  withAlpha('minenleitstand', () => {
    box(860, 16, 330, 120, '#e6e3da', 2, 2);
    text('LEITSTAND ÜBER TAGE', 1025, 34, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
    box(880, 44, 120, 70, '#23384d', 2, 1.5); box(1010, 44, 120, 70, '#23384d', 2, 1.5);
    ctx.fillStyle = '#e0a526'; ctx.fillRect(900 + 60 * seg(g, 80, 200) - 60 * seg(g, 260, 400), 86, 30, 14);
    for (let i = 0; i < 5; i++) line(1020, 58 + i * 10, 1020 + 20 + (i * 17 + g) % 80, 58 + i * 10, '#7fe08a', 2);
    ctx.save(); ctx.translate(1160, 132); ctx.scale(0.5, 0.5); person({ x: 0.001, foot: 0.001, face: -1, shirt: '#f08a24', sit: true }); ctx.restore();
  });
  ctx.restore();
}
registerRoom({ key: 'mine2', name: 'Bergwerk: Erzrolle', level: 'UG 1', hitOrder: [], robots: [], draw: f => drawMinePaar(f, MN_OFF) });
registerRoom({
  key: 'mine1', name: 'Bergwerk unter Tage', level: 'UG 1',
  hitOrder: ['minendrohne', 'fahrlader', 'minenleitstand'],
  draw: f => drawMinePaar(f, 0),
  robots: [
    { id: 'fahrlader', name: 'Automatischer Fahrlader', bereich: 'Rohstoffe', aera: 'seit den 2000ern', typ: 'Knickgelenkter Lader mit Kabel', color: '#e0a526',
      fakt: 'Vorbild sind die Lader von Sandvik mit dem System AutoMine. In der Eisenerzgrube Kiruna in Schweden fahren 20 solche Lader automatisch: Sie holen das gesprengte Erz und kippen es in einen Schacht, die Erzrolle. Ihr Strom kommt über ein langes Kabel, das eine Trommel am Heck auf- und abwickelt.',
      echt: 'Echt. Menschen dürfen den Automatikbereich nicht betreten, solange die Lader fahren. Gezeichnet im Maßstab 1 : 2.',
      note: 'Schaufelt Erz, fährt zur Erzrolle, kippt und kommt zurück. Das Kabel zieht er hinter sich her.',
      quelle: 'https://www.globalminingreview.com/mining/11122023/sandvik-wins-major-order-from-lkab-for-automated-loaders',
      box: () => { const p = mnLader(state.g); return [MNX + p.x - 207 - 10, MNY + 220, 434, 120]; } },
    { id: 'minendrohne', name: 'Kartierungsdrohne', bereich: 'Rohstoffe', aera: 'seit 2020', typ: 'Drohne mit Lidar', color: '#3b3d40',
      fakt: 'Vorbild ist Hovermap von Emesent aus Australien, entstanden bei der Forschungsorganisation CSIRO. Unter Tage gibt es kein GPS; die Drohne findet sich mit einem Laserscanner selbst zurecht. Sie fliegt in Abbauräume, die für Menschen zu gefährlich sind, und erstellt eine 3D-Karte.',
      echt: 'Echt. Die grünen Strahlen stehen für den Laserscanner, in echt sieht man ihn nicht.',
      note: 'Kreist im hohen Abbauraum und vermisst die Wände.',
      quelle: 'https://miningdigital.com/technology/emesent-commercializes-first-underground-drone-technology-mine-mapping',
      box: () => { const d = mnDrohne(state.g); return [MNX + d.x - 40, MNY + d.y - 20, 80, 40]; } },
    { id: 'minenleitstand', name: 'Leitstand über Tage', bereich: 'Mensch', aera: 'Maßstab', typ: 'Bergleute am Bildschirm', color: '#f08a24',
      fakt: 'Die Lader werden von einem Leitstand an der Oberfläche überwacht. Bergleute sehen die Kamerabilder und übernehmen per Fernsteuerung, wenn ein Lader nicht weiterkommt.',
      echt: 'Echt. Das Fenster ist ein Blick in den Leitstand, der in Wirklichkeit oben über der Grube liegt.',
      note: 'Auf dem linken Bildschirm fährt der Lader mit.',
      box: () => [MNX + 860, MNY + 16, 330, 120] },
  ],
});
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  fahrlader: 'Dieser große Lader fährt ganz allein durch das Bergwerk. Er holt Steine mit Eisen darin und kippt sie in ein tiefes Loch.',
  minendrohne: 'Diese Drohne fliegt dorthin, wo es für Menschen zu gefährlich ist, und macht eine Karte vom Bergwerk.',
  minenleitstand: 'Oben über der Erde schauen Menschen auf Bildschirme und passen auf die Roboter unten auf.',
}));

/* ---------- Tiefer: UG 2 Vortrieb (r 8), UG 3 Brecher und Band (r 9), Schacht rechts durch alle Sohlen ---------- */
const MN_SCH = 1200;                                    // Schacht in Paar-Koordinaten (x 1200 … 1290)
function mnFels(off) {
  ctx.fillStyle = '#4f443b'; ctx.fillRect(-20, 0, MN_W + 40, 408);
  ctx.fillStyle = '#6e6257'; ctx.fillRect(-20, 150, MN_W + 40, 190);
  for (let i = 0; i < 26; i++) { const x = (i * 263) % MN_W, y = 20 + (i * 113) % 360; circle(x, y, 2 + i % 3, 'rgba(0,0,0,0.13)', null); }
  ctx.fillStyle = '#3f362f'; ctx.fillRect(-20, 340, MN_W + 40, 68);
  for (let x = 140; x < MN_W - 120; x += 90) { line(x, 150, x, 168, '#8a8f94', 3); box(x - 6, 148, 12, 4, '#8a8f94', 0, 1); }
}
function mnRutsche(x) { box(x - 26, 0, 52, 150, '#3b3d40', 0, 2); ctx.fillStyle = '#2a2723'; ctx.fillRect(x - 18, 0, 36, 150); }
// UG 2: Bohrwagen bohrt acht Löcher in die Ortsbrust, Ladewagen füllt sie, dann wird gesprengt
const MN_ORT = 110, MN_LOECHER = [176, 204, 232, 260, 288, 316, 190, 300];
function mnBohrwagen(g) { return g < 40 ? lerp(1500, 420, ease(seg(g, 0, 40))) : g < 260 ? 420 : g < 300 ? lerp(420, 1500, ease(seg(g, 260, 300))) : 1500; }
function mnLadewagen(g) { return g < 300 ? 1500 : g < 340 ? lerp(1500, 330, ease(seg(g, 300, 340))) : g < 420 ? 330 : g < 450 ? lerp(330, 1500, ease(seg(g, 420, 450))) : 1500; }
const mnLochTiefe = (i, g) => g < 40 ? 0 : 90 * clamp((g - 40 - i * 27) / 27, 0, 1);
function drawVortriebPaar(f, off) {
  const g = state.g, rx0 = mnBohrwagen(g), lx = mnLadewagen(g);
  ctx.save(); ctx.translate(-off, 0);
  mnFels(off);
  // Ortsbrust links: dahinter fester Fels
  ctx.fillStyle = '#4f443b'; ctx.fillRect(-20, 150, MN_ORT + 20, 190); line(MN_ORT, 150, MN_ORT, 340, INK, 2);
  text('VORTRIEB', 300, 120, 30, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(255,255,255,0.13)' });
  mnRutsche(MN_LOCH); text('ERZROLLE', MN_LOCH, 140, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  // Bohrlöcher (geladen = rot)
  const geladen = g >= 340 && g < 470 ? Math.floor(seg(g, 340, 420) * 8) : 0;
  if (g < 465) MN_LOECHER.forEach((y, i) => { const t = mnLochTiefe(i, g); if (t > 0) { line(MN_ORT, y, MN_ORT - t, y, '#2a2723', 4); if (i < geladen) line(MN_ORT - 6, y, MN_ORT - t, y, '#d9342b', 3); } });
  // Rettungskammer
  withAlpha('rettungskammer', () => {
    box(760, 236, 220, 104, '#f08a24', 2, 2); box(780, 256, 60, 70, '#3b3d40', 2, 1.5);
    text('RETTUNGSKAMMER', 900, 272, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
    text('LUFT · WASSER · TELEFON', 900, 290, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
    circle(960, 248, 5, g % 24 < 12 ? '#7fe08a' : '#2d5b33', INK, 1);
  });
  // Bohrwagen mit zwei Lafetten
  withAlpha('bohrwagen', () => {
    const x = rx0, fl = 340;
    box(x, fl - 100, 360, 70, '#e0a526', 6, 2); box(x + 250, fl - 150, 90, 50, '#e6e3da', 3, 2); box(x + 262, fl - 140, 66, 22, '#23384d', 2, 1.2);
    for (const dx of [60, 290]) { circle(x + dx, fl - 22, 24, '#2a2723', INK, 2); circle(x + dx, fl - 22, 9, '#5d6064', INK, 1); }
    const aktiv = g >= 40 && g < 260 ? Math.floor((g - 40) / 27) : -1;
    for (const b of [0, 1]) {
      const i = aktiv >= 0 ? clamp(aktiv - (aktiv % 2) + b, 0, 7) : (b ? 5 : 2), y = MN_LOECHER[i];
      const spitze = aktiv >= 0 ? MN_ORT - mnLochTiefe(i, g) : x - 40;
      limb(x + 10, fl - 80 + b * 20, x - 60, y, 9, '#e0a526');
      box(Math.min(spitze, x - 60) , y - 5, Math.abs(x - 60 - spitze) + 10, 10, '#5d6064', 2, 1.2);
      line(spitze, y, spitze - 6, y, '#c9ccc8', 4);
    }
    if (g >= 40 && g < 260) for (let i = 0; i < 4; i++) circle(MN_ORT + 6 + rnd(i + g) * 10, 160 + rnd(i * 3 + g) * 170, 3, 'rgba(220,210,190,0.7)', null);
  });
  // Ladewagen mit Korb und Schlauch
  withAlpha('ladewagen', () => {
    const x = lx, fl = 340;
    box(x, fl - 90, 280, 64, '#3e6f9e', 6, 2); box(x + 200, fl - 140, 70, 50, '#e6e3da', 3, 2);
    for (const dx of [50, 230]) { circle(x + dx, fl - 22, 22, '#2a2723', INK, 2); circle(x + dx, fl - 22, 8, '#5d6064', INK, 1); }
    if (g >= 340 && g < 420) { const y = MN_LOECHER[Math.min(7, geladen)]; ctx.strokeStyle = '#f08a24'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 20, fl - 70); ctx.quadraticCurveTo((x + MN_ORT) / 2, fl - 10, MN_ORT - 10, y); ctx.stroke(); }
  });
  // Sprengung: niemand mehr unten, Schild blinkt, Staub
  if (g >= 450 && g < 470) { box(300, 190, 330, 40, '#d9342b', 0, 2); text('SPRENGUNG · ALLE IM SCHUTZ', 465, 216, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' }); }
  if (g >= 465 || g < 40) { const t = g >= 465 ? seg(g, 465, 480) : 1 - seg(g, 0, 40) * 0.9; for (let i = 0; i < 9; i++) circle(MN_ORT + 30 + i * 40 * t, 200 + (i % 3) * 50, 30 + 20 * t, `rgba(200,190,170,${0.55 * (g >= 465 ? 1 : 1 - seg(g, 0, 40))})`, null); }
  ctx.restore();
}
// UG 3: Band von links zum Brecher unter der Erzrolle, Laufroboter prüft die Rollen
const mnBandRobo = g => 260 + 560 * (0.5 - 0.5 * Math.cos(TAU * g / 480));
function drawBrecherPaar(f, off) {
  const g = state.g, rob = mnBandRobo(g), heiss = Math.abs(rob - 620) < 70;
  ctx.save(); ctx.translate(-off, 0);
  mnFels(off);
  text('BRECHER UND BAND', 300, 120, 30, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(255,255,255,0.13)' });
  mnRutsche(80); mnRutsche(MN_LOCH);
  // Förderband
  box(60, 290, MN_SCH - 70, 10, '#2a2723', 4, 1.5);
  for (let x = 90; x < MN_SCH - 20; x += 70) { circle(x, 306, 7, x === 650 ? (heiss || g % 48 < 24 ? '#d9342b' : '#8a8f94') : '#8a8f94', INK, 1.2); line(x, 313, x, 340, '#5d6064', 3); }
  for (let i = 0; i < 18; i++) { const x = 90 + ((i * 63 + g * 3) % (MN_LOCH - 130)); circle(x, 284, 5 + i % 3, '#8a5a3c', INK, 0.8); }
  // Brecher unter der Erzrolle, gebrochenes Erz läuft weiter zum Schacht
  box(MN_LOCH - 80, 150, 160, 130, '#5d6064', 4, 2);
  ctx.save(); ctx.translate(MN_LOCH, 215); ctx.rotate(Math.sin(g * 0.8) * 0.06); box(-40, -50, 30, 100, '#8a8f94', 2, 1.5); ctx.restore();
  text('BRECHER', MN_LOCH + 20, 270, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  for (let i = 0; i < 4; i++) circle(MN_LOCH + 90 + ((g * 3 + i * 25) % 90), 284, 4, '#8a5a3c', INK, 0.8);
  // Wasserhaltung: Pumpe holt Grubenwasser heraus
  box(140, 352, 60, 40, '#3e6f9e', 4, 1.5); line(170, 352, 170, 150, '#3e6f9e', 4); text('PUMPE', 170, 376, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  // Laufroboter am Band (Maßstab 1 : 2, etwa 1 m lang)
  withAlpha('bandinspektor', () => {
    const fl = 340, d = Math.sin(TAU * g / 480) >= 0 ? 1 : -1, p = g * 0.6;
    for (const [hx, ph] of [[-22, 0], [22, Math.PI]]) for (const s of [0, Math.PI]) { const sw = Math.sin(p + ph + s) * 9; limb(rob + hx * d, fl - 38, rob + hx * d + sw, fl, 4, s ? '#2a2723' : '#4a4d52'); }
    box(rob - 34, fl - 54, 68, 20, '#d9342b', 5, 2); box(rob - 22, fl - 48, 44, 8, '#3b3d40', 1, 1);
    box(rob + 30 * d - 7, fl - 66, 14, 14, '#3b3d40', 2, 1.5); circle(rob + 34 * d, fl - 59, 3, '#ff8a5c', null);
    if (heiss) { ctx.fillStyle = 'rgba(255,120,80,0.25)'; ctx.beginPath(); ctx.moveTo(rob + 36 * d, fl - 59); ctx.lineTo(645, 300); ctx.lineTo(655, 312); ctx.closePath(); ctx.fill();
      box(560, 170, 200, 40, '#f0b429', 0, 1.5); text('ROLLE 23: 78 °C', 660, 186, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' }); text('MELDUNG AN LEITSTAND', 660, 202, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' }); }
  });
  ctx.restore();
}
// Schacht mit Fördergefäß: wird unten am Band befüllt und fährt nach über Tage
const MN_SKIP_U = ry(9) + 210, MN_SKIP_O = ry(7) - 120;
const mnSkipY = g => g < 120 ? MN_SKIP_U : g < 260 ? lerp(MN_SKIP_U, MN_SKIP_O, ease(seg(g, 120, 260))) : g < 320 ? MN_SKIP_O : g < 460 ? lerp(MN_SKIP_O, MN_SKIP_U, ease(seg(g, 320, 460))) : MN_SKIP_U;
registerRunner({
  room: 'mine5',
  draw(g) {
    const x = MNX + MN_SCH, top = ry(7) + 4, bot = ry(9) + RH;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 4, top, 98, bot - top); ctx.clip();
    ctx.fillStyle = '#2a2723'; ctx.fillRect(x, top, 90, bot - top);
    for (const dx of [8, 82]) line(x + dx, top, x + dx, bot, '#8a8f94', 3);
    const y = mnSkipY(g);
    line(x + 45, top, x + 45, y, '#c9ccc8', 1.5);
    withAlpha('skip', () => { box(x + 14, y, 62, 84, '#8a8f94', 3, 2); if (g < 300) { ctx.fillStyle = '#8a5a3c'; ctx.fillRect(x + 18, y + 10 + 50 * (1 - seg(g, 0, 120)), 54, 60 * seg(g, 0, 120)); } });
    ctx.restore();
    text('SCHACHT', x + 45, top + 20, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
    text('↑ NACH ÜBER TAGE', x + 45, top + 36, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f0b429' });
  },
  robot: { id: 'skip', name: 'Schachtförderung', bereich: 'Rohstoffe', aera: 'seit über 100 Jahren', typ: 'Fördergefäß am Seil', color: '#8a8f94',
    fakt: 'Im Schacht fährt ein großes Gefäß an einem Stahlseil auf und ab. Unten wird es mit gebrochenem Erz gefüllt, oben wird es ausgekippt. Heute steuert eine Maschine das ganz allein.',
    echt: 'Echt. Ein Bergwerk hat oft mehrere Schächte, für Erz, für Menschen und für frische Luft.', note: 'Unten am Band füllt es sich und fährt dann nach oben.',
    box: () => [MNX + MN_SCH + 14, mnSkipY(state.g), 62, 84] },
});
registerRoom({ key: 'mine4', name: 'Bergwerk: Rettungskammer', level: 'UG 2', hitOrder: [], robots: [], draw: f => drawVortriebPaar(f, MN_OFF) });
registerRoom({
  key: 'mine3', name: 'Bergwerk: Vortrieb', level: 'UG 2',
  hitOrder: ['bohrwagen', 'ladewagen', 'rettungskammer'],
  draw: f => drawVortriebPaar(f, 0),
  robots: [
    { id: 'bohrwagen', name: 'Bohrwagen', bereich: 'Rohstoffe', aera: 'seit den 2010ern', typ: 'Bohrgerät mit zwei Lafetten', color: '#e0a526',
      fakt: 'Vorbild sind die Bohrwagen der Boomer-Reihe von Epiroc aus Schweden. Sie erstellen ihren Bohrplan an der Ortsbrust selbst, bohren die Löcher und wechseln manche Bohrstangen automatisch. Bedient werden können sie auch aus einem Leitstand, weit weg von der gefährlichen Stelle.',
      echt: 'Echt. Gezeichnet im Maßstab 1 : 2; in echt bohrt er viel mehr als acht Löcher.', note: 'Bohrt acht Löcher in die Ortsbrust und fährt wieder weg.',
      quelle: 'https://www.epiroc.com/en/products/drill-rigs/face-drill-rigs',
      box: () => { const x = mnBohrwagen(state.g); return [MNX + x - 60, ry(8) + 190, 420, 150]; } },
    { id: 'ladewagen', name: 'Ladewagen für Sprengstoff', bereich: 'Rohstoffe', aera: 'heute', typ: 'Fahrzeug mit Ladeschlauch', color: '#3e6f9e',
      fakt: 'Nach dem Bohren werden die Löcher mit Sprengstoff gefüllt, heute meist mit einem Fahrzeug, das ihn durch einen Schlauch hineinpumpt. Gesprengt wird erst, wenn alle Menschen in sicherer Entfernung sind.',
      echt: 'Echt als Fahrzeugart. Wie viel davon schon automatisch läuft, ist von Bergwerk zu Bergwerk verschieden.', note: 'Füllt Loch für Loch, die Löcher werden rot.',
      box: () => { const x = mnLadewagen(state.g); return [MNX + x, ry(8) + 200, 280, 140]; } },
    { id: 'rettungskammer', name: 'Rettungskammer', bereich: 'Rettung', aera: 'heute', typ: 'Schutzraum unter Tage', color: '#f08a24',
      fakt: 'In Bergwerken gibt es Schutzräume mit Atemluft, Trinkwasser und Telefon. Bei Feuer oder Gas gehen die Bergleute dort hinein und warten, bis Hilfe kommt.',
      echt: 'Echt.', note: 'Die grüne Lampe zeigt: Luft und Strom sind in Ordnung.',
      box: () => [MNX + 760, ry(8) + 236, 220, 104] },
  ],
});
registerRoom({ key: 'mine6', name: 'Bergwerk: Brecher', level: 'UG 3', hitOrder: [], robots: [], draw: f => drawBrecherPaar(f, MN_OFF) });
registerRoom({
  key: 'mine5', name: 'Bergwerk: Förderband', level: 'UG 3',
  hitOrder: ['bandinspektor'],
  draw: f => drawBrecherPaar(f, 0),
  robots: [
    { id: 'bandinspektor', name: 'Laufroboter am Förderband', bereich: 'Inspektion', aera: 'seit 2021', typ: 'Vierbeiner mit Wärmebildkamera', color: '#d9342b',
      fakt: 'Vorbild ist ANYmal von ANYbotics aus Zürich, den die Bergbaufirma Vale in Brasilien einsetzt. Mit Wärmebildkamera, Mikrofon und Zoomkamera prüft er Förderbänder, Anzeigen, Pumpen und Schaltschränke auf festen Rundgängen.',
      echt: 'Echt. Eine heiß laufende Rolle kann ein Band in Brand setzen, darum ist diese Prüfung wichtig.', note: 'Findet eine heiße Rolle und meldet sie dem Leitstand.',
      quelle: 'https://www.globalminingreview.com/technology-digitalisation/19082021/anybotics-implements-robots-at-vales-cau-mine/',
      box: () => { const x = mnBandRobo(state.g); return [MNX + x - 36, ry(9) + 270, 72, 70]; } },
  ],
});
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  bohrwagen: 'Dieser Bohrwagen bohrt Löcher in den Fels. Er weiß selbst, wo die Löcher hin müssen.',
  ladewagen: 'Dieser Wagen füllt die Löcher mit Sprengstoff. Gesprengt wird erst, wenn alle Menschen weit weg sind.',
  rettungskammer: 'In diesem Raum gibt es Luft und Wasser. Wenn es brennt, können sich die Bergleute hier in Sicherheit bringen.',
  bandinspektor: 'Dieser Laufroboter geht am Förderband entlang und merkt mit einer Wärmekamera, wenn eine Rolle zu heiß wird.',
  skip: 'In diesem Kasten fahren die Steine nach oben, wie in einem Aufzug.',
}));
