/* Raum: Apotheke (Ebene 5)
   Hauptfigur: Kommissionierautomat · Gag: Packung rutscht in Sekunden zur Theke (Bild 0–20) · Querverweis: Rohrpost zur Krankenstation */
const APX = rx(roomOf('apotheke').c), APY = ry(roomOf('apotheke').r);
function gripper(f) {
  const home = { x: 250, y: 92 }, pick = { x: 120, y: 160 }, drop = { x: 296, y: 254 };
  if (f < 3) return { p: mix(home, pick, ease(seg(f, 0, 3))) };
  if (f < 6) return { p: pick, carry: f >= 5 };
  if (f < 12) return { p: mix(pick, drop, ease(seg(f, 6, 12))), carry: true };
  if (f < 30) return { p: mix(drop, home, ease(seg(f, 12, 30))) };
  return { p: home };
}
function packBox(f) {
  if (f >= 12 && f < 18) return { x: lerp(300, 360, seg(f, 12, 18)), y: lerp(262, 292, seg(f, 12, 18)) };
  if (f >= 18 && f < 24) return { x: 360, y: 292 };
  if (f >= 24 && f < 32) return { x: lerp(360, 520, seg(f, 24, 32)), y: lerp(292, 280, seg(f, 24, 32)) };
  if (f >= 32 && f < 36) return { x: 540, y: lerp(280, 300, seg(f, 32, 36)) };
  return null;
}

function drawApotheke(f) {
  ctx.fillStyle = '#eef1ef'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('APOTHEKE', 360, 92, 36, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#c4cbc8'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  withAlpha('automat', () => {
    box(20, 40, 316, 260, '#d6d9dc', 3);
    ctx.fillStyle = 'rgba(190,220,235,0.3)'; ctx.fillRect(24, 44, 308, 252);
    const cols = ['#f3f1ea', '#e0662b', '#3e6f9e', '#5f9a4a', '#ffd23f'];
    for (let r = 0; r < 6; r++) for (let i = 0; i < 9; i++) {
      if (r === 3 && i === 3 && f >= 5 && f < 59) continue;
      box(34 + i * 30, 60 + r * 34, 22, 18, cols[(r * 3 + i * 7) % 5], 1, 1);
    }
    const g = gripper(f);
    line(28, 50, 328, 50, '#5d6064', 4);
    box(g.p.x - 4, 50, 8, 236, '#5d6064', 0, 1);
    box(g.p.x - 14, g.p.y - 8, 28, 14, '#3b3d40', 2, 1.2);
    if (g.carry) box(g.p.x - 11, g.p.y + 6, 22, 16, '#e0662b', 1, 1);
    ctx.beginPath(); ctx.moveTo(296, 270); ctx.lineTo(360, 296); ctx.lineTo(360, 302); ctx.lineTo(296, 278); ctx.closePath(); paint('#b0b4b8', INK, 1.5);
  });
  box(340, 300, 200, 60, '#8e6233', 2); box(334, 294, 212, 8, '#d6d9dc', 1, 1.5);
  withAlpha('apothekerin', () => {
    const p = packBox(f), reach = f >= 22 && f < 32;
    person({ x: 400, face: 1, shirt: '#f3f1ea', pants: '#f3f1ea', hair: '#5a3a26', foot: 358, hand: reach ? { x: p ? p.x - 6 : 420, y: 286 } : { x: 420, y: 296 } });
  });
  box(334, 294, 212, 8, '#d6d9dc', 1, 1.5);
  const b = packBox(f);
  if (b) box(b.x - 11, b.y - 16, 22, 16, '#e0662b', 1, 1.2);
  withAlpha('kundin', () => {
    person({ x: 584, face: -1, shirt: '#5f9a4a', pants: '#3b3d40', hair: '#d6d2c8', hand: { x: 552, y: 300 } });
    box(530, 298, 26, 30, '#f3f1ea', 2, 1.5);
  });
  // Rohrpost-Station
  box(596, 20, 36, 30, '#8a8f94', 3); circle(614, 35, 6, '#d9542b', INK, 1);
  if (f % 60 < 6) text('♪', 360, 280, 14, { color: '#3e6f9e' });
}

registerRoom({
  key: 'apotheke', name: 'Apotheke', level: 'Ebene 5',
  hitOrder: ['kundin', 'apothekerin', 'automat'],
  robots: [
    { id: 'automat', name: 'Kommissionierautomat', bereich: 'Medizin', aera: 'seit den 1990ern', typ: 'Lagerroboter für Medikamente',
      fakt: 'In vielen Apotheken steht hinter der Theke ein Automat, der Tausende Medikamentenpackungen dicht an dicht lagert. Ein Greifer holt die gewünschte Packung in wenigen Sekunden und schickt sie über eine Rutsche nach vorn.',
      echt: 'Realistisch. Die Beratung macht weiter ein Mensch, der Automat holt nur die Packung.',
      note: 'Holt eine Packung, bevor die Kundin fertig gefragt hat.', color: '#d6d9dc',
      box: () => [APX + 20, APY + 40, 316, 262] },
    { id: 'apothekerin', name: 'Apothekerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Berät, prüft das Rezept und gibt das Medikament aus. Medikamente für die Krankenstation schickt sie per Rohrpost.',
      note: 'Fängt die Packung an der Rutsche auf.', color: '#f3f1ea', box: () => [APX + 380, APY + 236, 44, 124] },
    { id: 'kundin', name: 'Kundin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Tasche',
      fakt: 'Holt ihr Medikament ab.', note: 'Staunt jede Runde, wie schnell das ging.', color: '#5f9a4a', box: () => [APX + 528, APY + 236, 70, 124] },
  ],
  draw: drawApotheke,
});
