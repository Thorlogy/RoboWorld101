/* Raum: Recyclinghof (Ebene 1, Lieferweg)
   Hauptfigur: Sortierroboter mit Saugnapf · Gag: findet die Socke aus der Kantine (40-s-Takt) · Querverweis: Lieferroboter bringt Verpackung */
const RCX = rx(roomOf('recycling').c), RCY = ry(roomOf('recycling').r);
const ITEM_TYPES = ['flasche', 'dose', 'karton', 'flasche', 'dose', 'karton', 'flasche', 'socke'];
const beltPos = (k, g) => 20 + 56 * k + 56 * ((g % 480) / 60);
function item(x, y, t) {
  if (t === 'flasche') { box(x - 5, y - 22, 10, 22, 'rgba(127,211,255,0.8)', 3, 1.2); box(x - 3, y - 26, 6, 5, '#3e6f9e', 1, 1); }
  else if (t === 'dose') box(x - 6, y - 14, 12, 14, '#b0b4b8', 2, 1.2);
  else if (t === 'karton') box(x - 10, y - 12, 20, 12, '#c9a46a', 1, 1.2);
  else { ctx.beginPath(); ctx.moveTo(x - 10, y - 4); ctx.lineTo(x + 2, y - 4); ctx.lineTo(x + 2, y - 14); ctx.lineTo(x + 8, y - 14); ctx.lineTo(x + 8, y); ctx.lineTo(x - 10, y); ctx.closePath(); paint('#c94040', INK, 1.2); }
}

function drawRecycling(f) {
  const g = state.g;
  ctx.fillStyle = '#d3d6cf'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('RECYCLING', 380, 70, 36, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#8f8b84'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  box(0, 236, 480, 12, '#3b3d40'); for (const x of [40, 240, 440]) box(x - 4, 248, 8, 112, '#5d6064');
  const bins = [[60, 'DOSEN', '#b0b4b8'], [210, 'FLASCHEN', '#7fd3ff'], [330, 'STÖRSTOFF', '#c94040'], [480, 'KARTON', '#c9a46a']];
  for (const [x, l, c] of bins) { box(x, 300, 90, 58, c, 2); text(l, x + 45, 334, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' }); }
  // Bandinhalt
  let pickT = null, magT = null;
  for (let k = -9; k < 9; k++) {
    const x = beltPos(k, g), t = ITEM_TYPES[((k % 8) + 8) % 8];
    if (x < -20 || x > 500) continue;
    if (t === 'dose' && x > 100) { if (x < 130) magT = { x, y: lerp(236, 136, seg(x, 100, 130)) }; continue; }
    if ((t === 'flasche' || t === 'socke') && x > 250) { if (x < 290) pickT = { x, t, s: seg(x, 250, 290) }; continue; }
    if (x > 470) { const d = Math.min(1, (x - 470) / 30); item(x, 236 + 60 * d, t); continue; }
    item(x, 236, t);
  }
  // Magnetabscheider
  withAlpha('magnet', () => {
    box(90, 110, 60, 22, '#3b3d40', 3); line(120, 8, 120, 110, '#5d6064', 3);
    if (magT) item(magT.x, magT.y + 14, 'dose');
  });
  // Sortierroboter mit Saugnapf
  withAlpha('sortierer', () => {
    line(240, 8, 240, 70, '#5d6064', 4); box(220, 70, 40, 20, '#3b3d40', 3);
    let tip = { x: 260, y: 150 };
    if (pickT) { const target = pickT.t === 'socke' ? { x: 375, y: 270 } : { x: 255, y: 270 }; tip = pickT.s < 0.3 ? mix({ x: 260, y: 150 }, { x: pickT.x, y: 220 }, pickT.s / 0.3) : mix({ x: pickT.x, y: 220 }, target, (pickT.s - 0.3) / 0.7); }
    const S = { x: 240, y: 90 }, E = ik2(S, tip, 80, 90);
    limb(S.x, S.y, E.x, E.y, 8, '#f0b429'); limb(E.x, E.y, tip.x, tip.y, 6, '#f0b429');
    circle(E.x, E.y, 4, '#3b3d40'); box(tip.x - 6, tip.y, 12, 6, '#2a2723', 3, 1);
    if (pickT) item(tip.x, tip.y + 28, pickT.t);
    if (pickT && pickT.t === 'socke') text('?', tip.x + 14, tip.y, 16, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#d9542b' });
    box(268, 72, 22, 14, '#2a2723', 2, 1); circle(279, 79, 3, '#7fd3ff', null);
  });
  withAlpha('sortiererin', () => person({ x: 610, face: -1, shirt: '#e0662b', pants: '#3b3d40', hat: '#f3f1ea', hand: { x: 588, y: 300 } }));
}

registerRoom({
  key: 'recycling', name: 'Recyclinghof', level: 'Ebene 1',
  hitOrder: ['sortiererin', 'magnet', 'sortierer'],
  robots: [
    { id: 'sortierer', name: 'Sortierroboter', bereich: 'Umwelt', aera: 'seit den 2010ern', typ: 'Roboterarm mit Kamera und Saugnapf',
      fakt: 'In Sortieranlagen erkennt eine Kamera mit künstlicher Intelligenz Flaschen, Kartons und andere Verpackungen auf dem Band. Ein Arm mit Saugnapf greift sie heraus und wirft sie in die richtige Sammelstelle, nach Herstellerangaben bis zu rund 80 Mal pro Minute.',
      echt: 'Realistisch, auch die Socke: Falsch eingeworfene Dinge landen als Störstoff in einem eigenen Behälter.',
      note: 'Findet in jeder großen Runde eine rote Socke. Die kennt man aus der Kantine.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/Materials_recovery_facility',
      box: () => [RCX + 200, RCY + 60, 120, 210] },
    { id: 'magnet', quelle: 'https://en.wikipedia.org/wiki/Magnetic_separation', name: 'Magnetabscheider', bereich: 'Umwelt', aera: 'seit Jahrzehnten', typ: 'Elektromagnet über dem Band',
      fakt: 'Ein starker Magnet über dem Förderband zieht Dosen aus Stahlblech nach oben aus dem Abfallstrom. Das ist kein Roboter, aber ein wichtiger Helfer in jeder Sortieranlage.',
      echt: 'Realistisch. Aluminiumdosen sind nicht magnetisch und werden anders aussortiert.',
      note: 'Holt die Dosen. Ganz ohne Kamera.', color: '#3b3d40',
      box: () => [RCX + 88, RCY + 100, 64, 60] },
    { id: 'sortiererin', name: 'Sortiererin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Helm',
      fakt: 'Überwacht die Anlage und holt heraus, was der Roboter nicht greifen kann.', note: 'Hat die Socke schon dreimal gesehen.', color: '#e0662b',
      box: () => [RCX + 586, RCY + 236, 50, 124] },
  ],
  draw: drawRecycling,
});
