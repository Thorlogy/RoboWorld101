/* Bergwerk unter Tage (UG 1, c −5 und −4, unter Solar- und Energiepark), Doppelfeld wie der Tiefbahnhof.
   Maßstab 1 : 2 (1 m ≈ 34,5 Einheiten), weil ein Fahrlader 12 Meter lang ist.
   Fahrlader (Vorbild Sandvik mit AutoMine in Kiruna) holt Erz und kippt es in die Erzrolle; eine Kartierungsdrohne (Vorbild Hovermap) fliegt im Abbauraum. */
const MNX = rx(roomOf('mine1').c), MNY = ry(roomOf('mine1').r), MN_W = 2 * RW + WALL, MN_OFF = RW + WALL;
const MN_PILE = 250, MN_LOCH = 1160;
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
  box(MN_W - 230, 220, 170, 44, '#f0b429', 0, 2);
  text('AUTOMATIKBEREICH', MN_W - 145, 238, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  text('KEIN ZUTRITT', MN_W - 145, 255, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  // Stromkabel des Laders bis zur Steckdose rechts
  box(MN_W - 40, 290, 20, 30, '#3b3d40', 2, 1.5);
  ctx.strokeStyle = '#2a2723'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(MN_W - 30, 320); ctx.quadraticCurveTo((MN_W - 30 + L.x - 150 * L.dir) / 2, 344, L.x - 150 * L.dir, 236); ctx.stroke();
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
