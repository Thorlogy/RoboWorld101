/* Raum: Supermarkt (Ebene 4, Lieferweg)
   Hauptfigur: Regal-Scanroboter · Gag: meldet die Lücke, die der Lieferroboter hinterlassen hat (Bild 45–60) · Querverweis: Lieferroboter holt hier den Einkauf ab */
const SMX = rx(roomOf('supermarkt').c), SMY = ry(roomOf('supermarkt').r);
const scanX = f => 70 + 300 * (0.5 - 0.5 * Math.cos(TAU * f / 60));

function drawSupermarkt(f) {
  ctx.fillStyle = '#f0ede6'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('MARKT', 470, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#c9c3b6'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  // Regale
  const cols = ['#d9542b', '#3e6f9e', '#f0b429', '#5f9a4a', '#f3f1ea', '#7b4b8e'];
  box(20, 130, 440, 222, '#8a8f94', 2, 2);
  for (let r = 0; r < 5; r++) {
    const y = 140 + r * 42;
    line(22, y + 38, 458, y + 38, INK, 2);
    for (let i = 0; i < 14; i++) {
      if (r === 2 && i === 8) continue;
      const h = 18 + ((i * 7 + r * 3) % 4) * 4;
      box(28 + i * 31, y + 38 - h, 24, h, cols[(i + r * 2) % 6], 2, 1);
    }
  }
  // Abholstelle für Lieferroboter
  box(300, 40, 90, 28, '#23384d', 3); text('ABHOLUNG', 345, 59, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3f1ea' });
  // Regal-Scanroboter
  withAlpha('scanner', () => {
    const x = scanX(f);
    box(x - 18, 336, 36, 18, '#3b3d40', 6); circle(x - 10, 356, 4, '#2d2f33'); circle(x + 10, 356, 4, '#2d2f33');
    box(x - 7, 150, 14, 188, '#f3f1ea', 4);
    for (const y of [166, 210, 252, 294]) { box(x - 9, y, 18, 10, '#2a2723', 2, 1); circle(x - 3, y + 5, 2.2, '#7fd3ff', null); }
    ctx.fillStyle = 'rgba(127,211,255,0.18)'; ctx.beginPath(); ctx.moveTo(x - 6, 170); ctx.lineTo(x - 50, 150); ctx.lineTo(x - 50, 330); ctx.lineTo(x - 6, 300); ctx.closePath(); ctx.fill();
    if (f >= 45 && f < 58 && Math.abs(x - 300) < 60) { box(270, 220, 40, 30, null, 2, 2.5); ctx.strokeStyle = '#d9342b'; ctx.lineWidth = 2.5; ctx.strokeRect(272, 222, 36, 26); text('LÜCKE', 290, 214, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#d9342b' }); }
  });
  // Selbstbedienungskasse
  box(500, 270, 70, 90, '#d6d9dc', 4); box(506, 240, 30, 30, '#23384d', 3, 1.5);
  ctx.fillStyle = '#7fe08a'; ctx.fillRect(510, 246, 22, 4);
  withAlpha('kunde', () => {
    const scan = f % 20 < 10;
    person({ x: 600, face: -1, shirt: '#3e6f9e', pants: '#3b3d40', hair: '#3a2c22', hand: scan ? { x: 548, y: 270 } : { x: 566, y: 290 } });
    box((scan ? 548 : 566) - 8, (scan ? 262 : 282), 14, 10, '#f0b429', 1, 1.2);
    if (scan && f % 20 === 2) text('PIEP', 520, 232, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#3e6f9e' });
  });
}

registerRoom({
  key: 'supermarkt', name: 'Supermarkt', level: 'Ebene 4',
  hitOrder: ['kunde', 'scanner'],
  robots: [
    { id: 'scanner', name: 'Regal-Scanroboter', bereich: 'Service', aera: 'seit den 2010ern', typ: 'Schmaler Roboter mit vielen Kameras',
      fakt: 'Regal-Scanroboter fahren durch die Gänge und fotografieren die Regale von oben bis unten. Eine Software findet leere Fächer, falsch einsortierte Ware und falsche Preisschilder und schickt eine Liste an das Personal.',
      echt: 'Realistisch. Auffüllen muss weiterhin ein Mensch, der Roboter meldet nur.',
      note: 'Findet die Lücke, die der Lieferroboter beim Einkaufen gerissen hat.', color: '#f3f1ea',
      box: f => [SMX + scanX(f) - 20, SMY + 146, 40, 214] },
    { id: 'kunde', name: 'Kunde an der Kasse', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Scannt seinen Einkauf an der Selbstbedienungskasse selbst. Die Kasse ist kein Roboter, aber ein Automat.',
      note: 'Piep. Piep. Piep.', color: '#3e6f9e', box: () => [SMX + 560, SMY + 236, 60, 124] },
  ],
  draw: drawSupermarkt,
});
