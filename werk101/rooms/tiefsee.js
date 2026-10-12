/* Raum: Tiefsee-Tank (UG 2) – Versuchsbecken
   Hauptfigur: Tauchroboter am Kabel · Gag: echter Fisch folgt dem Roboterfisch (Bild 25–40) · Querverweis: Schlangenroboter aus dem Bergwerk, hier als Unterwasser-Variante */
const TX = rx(roomOf('tiefsee').c), TY = ry(roomOf('tiefsee').r);

const rovPos = f => ({ x: 250 + 40 * Math.sin(TAU * f / 60), y: 210 + 8 * Math.sin(TAU * f / 20) });
const robofish = f => ({ x: 360 + 120 * Math.cos(TAU * f / 60), y: 140 + 16 * Math.sin(TAU * f / 30), dir: Math.sin(TAU * f / 60) > 0 ? -1 : 1 });
function realFish(f) {
  const k = f < 34 ? ease(seg(f, 22, 28)) : 1 - ease(seg(f, 38, 46)), lag = 22 - 17 * k;
  const p = robofish(f - lag);
  return { x: p.x, y: p.y + 18, dir: p.dir };
}
const cleanerX = f => 420 + 160 * (0.5 - 0.5 * Math.cos(TAU * f / 60));

function fishShape(x, y, dir, col, mech) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 7, 0, 0, TAU); paint(col, INK, 1.5);
  ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(24, -7); ctx.lineTo(24, 7); ctx.closePath(); paint(col, INK, 1.5);
  if (mech) { line(-2, -6, -2, 6, INK, 1.2); line(6, -6, 6, 6, INK, 1.2); box(-14, -3, 6, 6, '#23384d', 1, 1); }
  else circle(-9, -2, 1.6, INK, null);
  ctx.restore();
}

function drawTiefsee(f) {
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, RH);
  const w = ctx.createLinearGradient(0, 40, 0, 360);
  w.addColorStop(0, '#5aa0bf'); w.addColorStop(1, '#1f4c66');
  ctx.fillStyle = w; ctx.fillRect(0, 40, RW, 320);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x <= RW; x += 4) { const y = 40 + Math.sin(x / 20 + TAU * f / 30) * 2; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  // Laufsteg mit Bedienerin
  box(0, 30, 200, 8, '#8a8f94', 0, 1.5);
  box(90, 12, 34, 20, '#3b3d40', 3); circle(107, 22, 7, '#f0b429', INK, 1.5);
  text('TANK', 470, 250, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(243,241,234,0.14)' });
  // Sandboden und Testleitung
  ctx.fillStyle = '#b89c6a'; ctx.fillRect(0, 344, RW, 56);
  box(0, 326, 440, 18, '#5d6064', 0, 1.5);
  for (const x of [110, 260, 410]) box(x - 4, 324, 8, 22, '#3b3d40', 0, 1);
  line(0, 344, RW, 344, INK, 2);
  // Rumpfmodell mit Rumpfreiniger
  ctx.beginPath(); ctx.moveTo(380, 40); ctx.lineTo(640, 40); ctx.lineTo(640, 92); ctx.quadraticCurveTo(520, 104, 400, 82); ctx.closePath(); paint('#7a2a14');
  ctx.save(); ctx.beginPath(); ctx.moveTo(380, 40); ctx.lineTo(640, 40); ctx.lineTo(640, 92); ctx.quadraticCurveTo(520, 104, 400, 82); ctx.closePath(); ctx.clip();
  ctx.fillStyle = 'rgba(95,154,74,0.55)'; for (let i = 0; i < 30; i++) ctx.fillRect(390 + rnd(i) * 250, 76 + rnd(i + 30) * 22, 8, 4);
  ctx.restore();
  withAlpha('rumpf', () => {
    const x = cleanerX(f), y = 88 + (x - 420) * 0.04;
    box(x - 20, y, 40, 14, '#f0b429', 4);
    for (const dx of [-12, 12]) circle(x + dx, y + 2, 4, '#2d2f33');
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 4; i++) { const t = (f / 10 + i / 4) % 1; ctx.beginPath(); ctx.arc(x + (rnd(i) - 0.5) * 30, y + 18 + t * 30, 2, 0, TAU); ctx.fill(); }
  });

  // Tauchroboter mit Kabel, Scheinwerfern und Greifer
  withAlpha('rov', () => {
    const r = rovPos(f);
    ctx.beginPath(); ctx.moveTo(108, 30); ctx.bezierCurveTo(140, 120, r.x - 80, r.y - 80, r.x - 10, r.y - 28);
    ctx.strokeStyle = '#f0b429'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,248,200,0.18)'; ctx.beginPath(); ctx.moveTo(r.x + 30, r.y - 4); ctx.lineTo(r.x + 160, r.y + 70); ctx.lineTo(r.x + 80, r.y + 110); ctx.closePath(); ctx.fill();
    box(r.x - 34, r.y - 30, 68, 18, '#f0b429', 4);
    box(r.x - 34, r.y - 12, 68, 30, null, 2, 2);
    ctx.fillStyle = 'rgba(59,61,64,0.6)'; ctx.fillRect(r.x - 32, r.y - 10, 64, 26);
    for (const dx of [-30, 26]) box(r.x + dx, r.y - 2, 8, 12, '#2a2723', 2, 1.2);
    box(r.x - 6, r.y - 6, 16, 12, '#2a2723', 3, 1); circle(r.x + 6, r.y, 3.5, '#7fd3ff', INK, 1);
    for (const dy of [-8, 8]) circle(r.x + 32, r.y + dy, 3, '#fff3c4', INK, 1);
    limb(r.x + 20, r.y + 16, r.x + 38, r.y + 30, 3, '#b0b4b8');
    line(r.x + 38, r.y + 30, r.x + 44, r.y + 26, INK, 2); line(r.x + 38, r.y + 30, r.x + 44, r.y + 34, INK, 2);
  });

  // Unterwasser-Schlangenroboter an der Leitung
  withAlpha('aal', () => {
    for (let i = 0; i < 9; i++) {
      const x = 60 + i * 15 + 20 * Math.sin(TAU * f / 60), y = 300 + 6 * Math.sin(TAU * f / 15 - i * 0.7);
      box(x - 8, y - 6, 16, 12, i === 8 ? '#f0b429' : i % 3 === 1 ? '#3b3d40' : '#e6e3da', 4, 1.5);
      if (i % 3 === 1) { line(x, y - 6, x, y - 12, INK, 1.5); line(x - 4, y - 12, x + 4, y - 12, INK, 2); }
    }
    const hx = 60 + 8 * 15 + 20 * Math.sin(TAU * f / 60), hy = 300 + 6 * Math.sin(TAU * f / 15 - 5.6);
    circle(hx + 6, hy, 2.5, '#7fd3ff', INK, 1);
  });

  // Roboterfisch und echter Fisch
  withAlpha('robofisch', () => { const p = robofish(f); fishShape(p.x, p.y, p.dir, '#f0b429', true); });
  withAlpha('fisch', () => { const p = realFish(f); fishShape(p.x, p.y, p.dir, '#b0b4b8', false); if (f >= 26 && f < 40 && f % 6 < 4) text('?', p.x, p.y - 12, 12, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#f3f1ea' }); });
  // Blasen
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  for (let i = 0; i < 10; i++) { const t = (rnd(i) + f / 60) % 1; ctx.beginPath(); ctx.arc(rnd(i + 20) * RW, 340 - t * 290, 2 + rnd(i + 7) * 2, 0, TAU); ctx.fill(); }
}

registerRoom({
  key: 'tiefsee', name: 'Tiefsee-Tank', level: 'UG 2',
  hitOrder: ['fisch', 'robofisch', 'rumpf', 'aal', 'rov'],
  robots: [
    { id: 'rov', name: 'Tauchroboter', bereich: 'Unterwasser', aera: 'seit den 1960ern', typ: 'Ferngesteuertes Unterwasserfahrzeug am Kabel',
      fakt: 'Tauchroboter hängen an einem Kabel, über das sie Strom bekommen und Bilder nach oben schicken. Sie prüfen Pipelines, Windpark-Fundamente und Schiffswracks; das Wrack der Titanic wurde 1986 mit einem kleinen Tauchroboter erkundet.',
      echt: 'Realistisch: gelber Auftriebskörper oben, Rahmen, Propeller, Scheinwerfer, Kamera und Greifer.',
      note: 'Schwebt am Kabel durchs Becken und leuchtet alles aus.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/Remotely_operated_underwater_vehicle',
      box: f => { const r = rovPos(f); return [TX + r.x - 36, TY + r.y - 32, 84, 66]; } },
    { id: 'aal', name: 'Unterwasser-Schlangenroboter', bereich: 'Unterwasser', aera: 'seit den 2010ern', typ: 'Schlange aus Modulen mit Propellern',
      fakt: 'In Norwegen wurde ein Unterwasser-Schlangenroboter entwickelt, der dauerhaft am Meeresboden bleiben und Anlagen prüfen kann. Er schlängelt sich durch enge Stellen und hat Propeller in einigen Gliedern.',
      echt: 'Realistisch. Der Verwandte aus dem Bergwerk kriecht durch Rohre, dieser schwimmt.',
      note: 'Kontrolliert die Leitung. Langsam und gründlich.', color: '#e6e3da',
      box: f => [TX + 50 + 20 * Math.sin(TAU * f / 60), TY + 286, 140, 30] },
    { id: 'robofisch', name: 'Roboterfisch', bereich: 'Unterwasser', aera: 'seit den 1990ern', typ: 'Fischförmiger Roboter',
      fakt: 'Am MIT wurde 1994 einer der ersten Roboterfische gebaut. 2018 schwamm dort der weiche Roboterfisch SoFi in einem Korallenriff mit, ohne die echten Fische zu verscheuchen.',
      echt: 'Realistisch: Roboterfische bewegen ihre Schwanzflosse mit einem Motor oder mit Wasserdruck.',
      note: 'Wird jede Runde von einem echten Fisch verfolgt.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/RoboTuna',
      box: f => { const p = robofish(f); return [TX + p.x - 26, TY + p.y - 12, 52, 24]; } },
    { id: 'rumpf', name: 'Rumpfreiniger', bereich: 'Unterwasser', aera: 'seit den 2010ern', typ: 'Roboter, der am Schiffsrumpf klebt',
      fakt: 'Rumpfreiniger halten sich unter Wasser am Schiffsrumpf fest und bürsten Algen und Muscheln ab. Ein sauberer Rumpf spart Treibstoff.',
      echt: 'Realistisch. Hier reinigt er ein Rumpfmodell, das ins Becken ragt.', note: 'Bürstet sanft hin und her.', color: '#f0b429',
      box: f => [TX + cleanerX(f) - 22, TY + 84, 44, 22] },
    { id: 'fisch', name: 'Fisch', bereich: 'Tier', aera: 'kein Roboter', typ: 'Neugieriger Fisch',
      fakt: 'Echte Fische lassen sich von Roboterfischen oft nicht stören. Manche schwimmen sogar neugierig hinterher.',
      note: 'Folgt dem Roboterfisch. Wird kurz misstrauisch.', color: '#b0b4b8',
      box: f => { const p = realFish(f); return [TX + p.x - 22, TY + p.y - 12, 48, 24]; } },
  ],
  draw: drawTiefsee,
});
