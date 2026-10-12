/* Raum: Feld (Außengelände, links vom Park)
   Hauptfigur: solarbetriebener Säh- und Jäteroboter · Gag: eine Krähe fährt auf dem Solardach mit und flattert kurz auf (globale Uhr 200–230)
   Läuft auf der globalen Uhr state.g (0–479 = 40 s), weil der Roboter so langsam fährt wie in echt. Querverweis: Erdbeer-Ernteroboter im Gewächshaus */
const FDX = rx(roomOf('feld').c), FDY = ry(roomOf('feld').r);
const FD_ROW = 364;
const RUN_P_FELD = 480;
const fdBotX = g => lerp(-150, 790, (g % RUN_P_FELD) / RUN_P_FELD);
const FD_WEEDS = [38, 96, 151, 214, 262, 318, 377, 433, 489, 541, 598];
const FD_BEETS = [20, 64, 122, 180, 240, 290, 348, 404, 462, 516, 570, 624];
function fdWeed(x, g) {
  const hoe = fdBotX(g) + 30;
  if (g >= 455) return ease(seg(g, 455, 479));
  return x > hoe ? 1 : 0;
}
function fdCrow(g) {
  const hop = g >= 200 && g < 230 ? Math.sin(Math.PI * seg(g, 200, 230)) : 0;
  return { dx: -40 + 30 * seg(g, 200, 230), lift: hop * 22, flap: hop > 0.05 };
}
function drawFeld(f) {
  const g = state.g;
  // ferne Hügel, an beiden Rändern flach auslaufend
  ctx.beginPath(); ctx.moveTo(0, 322);
  for (let x = 0; x <= RW; x += 20) ctx.lineTo(x, 322 - Math.sin(Math.PI * x / RW) * (36 + 14 * Math.sin(x / 70)));
  ctx.lineTo(RW, 322); ctx.closePath(); ctx.fillStyle = '#a9c48a'; ctx.fill();
  // Acker mit Reihen
  ctx.fillStyle = '#8a6a4c'; ctx.fillRect(0, 322, RW, 78); line(0, 322, RW, 322, INK, 1.5);
  ctx.strokeStyle = 'rgba(42,39,35,0.18)'; ctx.lineWidth = 2;
  for (const y of [334, 346, 380, 392]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(RW, y); ctx.stroke(); }
  // Blühstreifen am Feldrand
  for (let i = 0; i < 26; i++) { const x = 8 + i * 25 + rnd(i) * 10, y = 326 + rnd(i + 9) * 4; line(x, y, x, y - 10, '#5f9a4a', 1.5); circle(x, y - 12, 3, ['#f0b429', '#d98fb8', '#f3f1ea', '#7aa7d9'][i % 4], INK, 1); }
  text('FELD', 470, 270, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Rübenpflänzchen (bleiben stehen) und Unkraut (wird gehackt)
  for (const x of FD_BEETS) { ctx.beginPath(); ctx.ellipse(x - 4, FD_ROW - 6, 5, 3, -0.6, 0, TAU); paint('#3f7d3a', INK, 1); ctx.beginPath(); ctx.ellipse(x + 4, FD_ROW - 6, 5, 3, 0.6, 0, TAU); paint('#3f7d3a', INK, 1); line(x, FD_ROW, x, FD_ROW - 4, '#3f7d3a', 1.5); }
  for (const x of FD_WEEDS) {
    const s = fdWeed(x, g);
    if (s <= 0.02) { if (x < fdBotX(g) + 30 && x > fdBotX(g) - 30) for (let i = 0; i < 3; i++) circle(x - 6 + i * 6, FD_ROW - 2, 1.5, '#9bb04a', null); continue; }
    for (const a of [-0.7, -0.25, 0.2, 0.6]) line(x, FD_ROW, x + Math.sin(a) * 9 * s, FD_ROW - Math.cos(a) * 11 * s, '#9bb04a', 2);
  }
  // Landwirtin mit Handy am Feldrand
  withAlpha('landwirtin', () => person({ x: 46, foot: 388, face: 1, shirt: '#5f7d3a', pants: '#3b3d40', hair: '#7a4a2a', hand: { x: 62, y: 318 } }));
  box(58, 310, 9, 14, '#2a2723', 2, 1);
  // Säh- und Jäteroboter mit Solardach
  withAlpha('jaeter', () => {
    const x = fdBotX(g);
    for (const dx of [-74, 74]) { box(x + dx - 4, 300, 8, 74, '#d6d9dc', 1, 1.5); }
    box(x - 78, 330, 156, 8, '#d6d9dc', 1, 1.5);
    ctx.save(); ctx.translate(x, 296); ctx.rotate(-0.06);
    box(-96, -10, 192, 12, '#23384d', 1, 2);
    ctx.strokeStyle = 'rgba(127,211,255,0.55)'; ctx.lineWidth = 1; for (let i = -72; i < 96; i += 24) { ctx.beginPath(); ctx.moveTo(i, -9); ctx.lineTo(i, 1); ctx.stroke(); }
    ctx.restore();
    line(x + 58, 290, x + 58, 268, INK, 2); ctx.beginPath(); ctx.ellipse(x + 58, 266, 8, 4, 0, 0, TAU); paint('#f3f1ea', INK, 1.5);
    box(x - 20, 304, 34, 22, '#f3f1ea', 3, 1.5); circle(x + 8, 312, 2, g % 8 < 4 ? '#7fe08a' : '#2d5b33', null);
    // Sähschar und Hacke unter dem Rahmen
    box(x - 44, 338, 14, 20, '#8a8f94', 1, 1.2); line(x - 37, 358, x - 37, 366, INK, 2);
    const wob = Math.sin(TAU * g / 6) * 4;
    for (const dx of [22, 34]) line(x + dx, 338, x + dx + wob, 366, '#3b3d40', 2.5);
    for (const dx of [-74, 74]) { circle(x + dx, 378, 13, '#2d2f33'); circle(x + dx, 378, 4, '#8a8f94', null); }
  });
  withAlpha('kraehe', () => {
    const x = fdBotX(g), c = fdCrow(g), cx = x + c.dx, cy = 282 - c.lift;
    ctx.beginPath(); ctx.ellipse(cx, cy, 11, 6, -0.2, 0, TAU); paint('#2a2723', INK, 1);
    circle(cx + 10, cy - 5, 5, '#2a2723', INK, 1);
    ctx.beginPath(); ctx.moveTo(cx + 14, cy - 6); ctx.lineTo(cx + 21, cy - 4); ctx.lineTo(cx + 14, cy - 2); ctx.closePath(); paint('#4a4742', INK, 1);
    line(cx - 10, cy, cx - 18, cy + 3, '#2a2723', 3);
    if (c.flap) { const w = g % 4 < 2 ? -12 : 4; line(cx - 2, cy - 2, cx - 16, cy + w, '#2a2723', 3); line(cx + 2, cy - 2, cx + 12, cy + w, '#2a2723', 3); }
    else { line(cx - 2, cy + 5, cx - 2, cy + 10, INK, 1.2); line(cx + 3, cy + 5, cx + 3, cy + 10, INK, 1.2); }
  });
}

registerRoom({
  key: 'feld', name: 'Feld', level: 'Außengelände',
  hitOrder: ['kraehe', 'landwirtin', 'jaeter'],
  robots: [
    { id: 'jaeter', name: 'Säh- und Jäteroboter', bereich: 'Landwirtschaft', aera: 'seit 2019', typ: 'Feldroboter mit Solardach',
      fakt: 'Der dänische Feldroboter FarmDroid FD20 sät zum Beispiel Zuckerrüben und hackt danach das Unkraut weg, ganz ohne Gift. Beim Säen speichert er per Satellitenortung die genaue Position jedes Samenkorns, deshalb weiß er später, was Rübe ist und was weg darf. Strom liefern Solarmodule auf dem Dach und ein Akku.',
      echt: 'Realistisch, auch das Tempo: Er fährt langsamer als ein Mensch geht und schafft trotzdem einige Hektar am Tag, weil er Tag und Nacht arbeiten kann.',
      note: 'Hackt das Unkraut zwischen den Rüben und lässt die Rüben stehen. Eine Runde über das Feld dauert 40 Sekunden.', color: '#23384d',
      quelle: 'https://agritechobservatory.review.fao.org/en/farmdroid-fd20',
      box: () => { const x = fdBotX(state.g); return [FDX + x - 98, FDY + 262, 196, 130]; } },
    { id: 'kraehe', name: 'Krähe', bereich: 'Tier', aera: 'kein Roboter', typ: 'Mitfahrerin',
      fakt: 'Krähen folgen gern Maschinen auf dem Acker, weil dabei Würmer und Käfer ans Licht kommen. Ein langsamer Roboter mit flachem Dach ist für sie ein Aussichtsplatz.',
      echt: 'Dass Vögel auf Feldrobotern sitzen, kommt tatsächlich vor. Der Roboter stört sich nicht daran.',
      note: 'Fährt mit und flattert kurz auf, wenn die Hacke zu laut wird.', color: '#2a2723',
      box: () => { const x = fdBotX(state.g), c = fdCrow(state.g); return [FDX + x + c.dx - 20, FDY + 262 - c.lift, 44, 30]; } },
    { id: 'landwirtin', name: 'Landwirtin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch',
      fakt: 'Plant die Aussaat am Handy und schaut, wo der Roboter gerade fährt.', note: 'Den Rest der Arbeit macht der Roboter allein.', color: '#5f7d3a',
      box: () => [FDX + 24, FDY + 264, 50, 124] },
  ],
  draw: drawFeld,
  glow(f) { const x = fdBotX(state.g); glow(x + 8, 312, 10, 'rgba(127,224,138,0.9)'); glow(x + 92, 340, 22, 'rgba(255,243,196,0.7)'); },
});
