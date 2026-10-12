/* Raum: Bücherspeicher (UG 2)
   Hauptfigur: Regalbediengerät · Gag: holt ein Buch für die Schule auf Ebene 3 (Bild 50–5) · Querverweis: Schule */
const BUX = rx(roomOf('buecher').c), BUY = ry(roomOf('buecher').r);
function stacker(f) {
  const home = { x: 560, y: 300 }, bin = { x: 210, y: 150 };
  const g = (f + 10) % 60;
  if (g < 18) return { p: mix(home, bin, ease(seg(g, 0, 18))), carry: false };
  if (g < 24) return { p: bin, carry: g >= 21 };
  if (g < 42) return { p: mix(bin, home, ease(seg(g, 24, 42))), carry: true };
  if (g < 48) return { p: home, carry: g < 45 };
  return { p: home, carry: false };
}
const liftY = f => { const g = (f + 10) % 60; return g < 45 ? 300 : g < 52 ? lerp(300, -20, seg(g, 45, 52)) : g < 59 ? lerp(-20, 300, seg(g, 52, 59)) : 300; };

function drawBuecher(f) {
  ctx.fillStyle = '#c9c2b4'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('BÜCHER', 24, 380, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  ctx.fillStyle = '#8f8b84'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  // Hochregal mit Behältern
  for (let r = 0; r < 7; r++) for (let i = 0; i < 9; i++) {
    const x = 30 + i * 50, y = 30 + r * 46;
    if (i === 3 && r === 2) { const s = stacker(f); if (s.carry || (f + 10) % 60 >= 21) { box(x, y, 42, 36, null, 1, 1); continue; } }
    box(x, y, 42, 36, '#8e6233', 1, 1.2);
    for (let b = 0; b < 4; b++) box(x + 4 + b * 9, y + 6, 7, 26, ['#d9542b', '#3e6f9e', '#f0b429', '#5f9a4a'][(i + r + b) % 4], 0, 0.8);
  }
  // Regalbediengerät
  withAlpha('regalgeraet', () => {
    const s = stacker(f);
    line(0, 356, 600, 356, '#5d6064', 3); line(0, 22, 600, 22, '#5d6064', 3);
    box(s.p.x - 8, 22, 16, 334, '#f0b429', 0, 1.5);
    box(s.p.x - 26, s.p.y - 4, 52, 10, '#3b3d40', 2, 1.2);
    if (s.carry) { box(s.p.x - 21, s.p.y - 40, 42, 36, '#8e6233', 1, 1.2); text('SCHULE', s.p.x, s.p.y - 18, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3f1ea' }); }
  });
  // Bücherlift nach oben
  box(590, 0, 46, 360, '#4a4742', 0, 1.5);
  withAlpha('lift', () => {
    const y = liftY(f), g = (f + 10) % 60;
    box(592, y, 42, 8, '#8a8f94', 1, 1.2);
    if (g >= 45 && g < 52) { box(592, y - 36, 42, 36, '#8e6233', 1, 1.2); text('SCHULE', 613, y - 14, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3f1ea' }); }
    text('↑ EBENE 3', 613, 380, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#3b3d40' });
  });
}

registerRoom({
  key: 'buecher', name: 'Bücherspeicher', level: 'UG 2',
  hitOrder: ['lift', 'regalgeraet'],
  robots: [
    { id: 'regalgeraet', name: 'Regalbediengerät', bereich: 'Logistik', aera: 'seit den 1970ern', typ: 'Kran zwischen hohen Regalen',
      fakt: 'Die Mansueto-Bibliothek der Universität Chicago lagert seit 2011 Bücher in einem Hochregal unter der Erde, mit Platz für 3,5 Millionen Bände. Roboterkräne holen ein bestelltes Buch in wenigen Minuten nach oben.',
      echt: 'Realistisch. In solchen Speichern stehen die Bücher nach Größe sortiert, nicht nach Thema, damit mehr hineinpassen.',
      note: 'Holt einen Behälter mit einem Buch, das eine Klasse in der Schule bestellt hat.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/Joe_and_Rika_Mansueto_Library',
      box: f => [BUX + stacker(f).p.x - 26, BUY + 20, 52, 340] },
    { id: 'lift', name: 'Bücherlift', bereich: 'Logistik', aera: 'seit Jahrzehnten', typ: 'Senkrechter Förderer',
      fakt: 'Ein kleiner Lift bringt den Behälter vom Speicher nach oben. Ist das Buch gelesen, fährt es denselben Weg zurück.',
      echt: 'Realistisch. Zeichnerisch ist der Lift hier nur angedeutet, in echt führt er durch alle Stockwerke.',
      note: 'Schickt das Buch hinauf zur Schule auf Ebene 3.', color: '#8a8f94',
      box: () => [BUX + 588, BUY, 50, 360] },
  ],
  draw: drawBuecher,
});
