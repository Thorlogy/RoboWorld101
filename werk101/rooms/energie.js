/* Raum: Energiepark (Außengelände, ganz links)
   Hauptfiguren: Putzroboter auf der Solarreihe, Wartungsroboter am Rotorblatt · Gag: Kaum ist die Reihe sauber, weht die nächste Staubwolke drüber (globale Uhr 220–260 und 440–480)
   Läuft auf der globalen Uhr state.g. Querverweis: Schaf im Schatten der Module (Agri-PV), Feld nebenan */
const ENX = rx(roomOf('energie').c), ENY = ry(roomOf('energie').r);
const EN_TL = { x: 262, y: 250 }, EN_TR = { x: 626, y: 250 }, EN_BL = { x: 240, y: 314 }, EN_BR = { x: 604, y: 314 };
const EN_COLS = 9;
function putzU(g) {
  g %= 480;
  if (g < 180) return g / 180;
  if (g < 260) return 1;
  if (g < 440) return 1 - (g - 260) / 180;
  return 0;
}
function gustFront(g) {
  g %= 480;
  if (g >= 220 && g < 260) return lerp(-0.2, 1.2, seg(g, 220, 260));
  if (g >= 440) return lerp(-0.2, 1.2, seg(g, 440, 480));
  return null;
}
function enDust(u, g) {
  g %= 480; const p = putzU(g), gf = gustFront(g);
  if (g < 180) return u > p ? 1 : 0;
  if (g < 220) return 0;
  if (g < 260) return clamp((gf - u) * 6, 0, 1);
  if (g < 440) return u < p ? 1 : 0;
  return clamp((gf - u) * 6, 0, 1);
}
const enLerp = (A, B, t) => ({ x: lerp(A.x, B.x, t), y: lerp(A.y, B.y, t) });
// Wartungsroboter am stehenden Rotorblatt: fährt am Blatt auf und ab
const EN_HUB = { x: 112, y: 84 };
const bladeBotY = g => 150 + 60 * (0.5 - 0.5 * Math.cos(TAU * (g % 480) / 480));
function enTurbine(x, base, top, len, ang, w) {
  ctx.beginPath(); ctx.moveTo(x - w, base); ctx.lineTo(x - w * 0.55, top); ctx.lineTo(x + w * 0.55, top); ctx.lineTo(x + w, base); ctx.closePath(); paint('#eef0f0', INK, 1.5);
  box(x - w * 0.6, top - 7, w * 2.6, 12, '#e6e8e8', 3, 1.2);
  for (let i = 0; i < 3; i++) {
    const a = ang + i * TAU / 3;
    ctx.save(); ctx.translate(x, top); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(-w * 0.45, 0); ctx.lineTo(-1.5, len); ctx.lineTo(1.5, len); ctx.lineTo(w * 0.45, 0); ctx.closePath(); paint('#f7f7f5', INK, 1.2);
    ctx.restore();
  }
  circle(x, top, w * 0.5, '#d6d9dc', INK, 1.2);
}
function drawEnergie(f) {
  const g = state.g;
  ctx.fillStyle = '#8fbf6c'; ctx.fillRect(0, 330, RW, 70); line(0, 330, RW, 330, INK, 1.5);
  ctx.fillStyle = '#7aae5a'; for (let i = 0; i < 40; i++) { const x = rnd(i) * RW, y = 340 + rnd(i + 5) * 55; ctx.fillRect(x, y, 2, 5); }
  text('ENERGIE', 290, 70, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Windräder im Hintergrund drehen sich
  enTurbine(470, 330, 150, 64, TAU * g / 480 * 5, 7);
  enTurbine(580, 330, 170, 56, TAU * g / 480 * 5 + 1.1, 6);
  // Stehendes Windrad mit Wartungsroboter
  withAlpha('blatt', () => {
    ctx.beginPath(); ctx.moveTo(EN_HUB.x - 12, 330); ctx.lineTo(EN_HUB.x - 6, EN_HUB.y); ctx.lineTo(EN_HUB.x + 6, EN_HUB.y); ctx.lineTo(EN_HUB.x + 12, 330); ctx.closePath(); paint('#cdd2d5', INK, 1.5);
    box(EN_HUB.x - 8, EN_HUB.y - 12, 44, 18, '#e6e8e8', 4, 1.5);
    for (const a of [0, TAU / 3, -TAU / 3]) {
      ctx.save(); ctx.translate(EN_HUB.x - 10, EN_HUB.y - 3); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-2, 150); ctx.lineTo(2, 150); ctx.lineTo(7, 0); ctx.closePath(); paint('#f7f7f5', INK, 1.5);
      ctx.restore();
    }
    circle(EN_HUB.x - 10, EN_HUB.y - 3, 7, '#d6d9dc', INK, 1.5);
    const by = bladeBotY(g), bx = EN_HUB.x - 10;
    line(EN_HUB.x + 4, EN_HUB.y + 6, bx - 9, by - 8, INK, 1); line(EN_HUB.x + 20, EN_HUB.y + 6, bx + 9, by - 8, INK, 1);
    box(bx - 14, by - 8, 28, 16, '#f0b429', 3, 1.5);
    limb(bx - 14, by, bx - 6, by + 10, 2.5, '#3b3d40'); limb(bx + 14, by, bx + 6, by + 10, 2.5, '#3b3d40');
    circle(bx + 9, by - 3, 1.8, g % 8 < 4 ? '#7fe08a' : '#2d5b33', null);
    if (g % 12 < 6) for (let i = 0; i < 4; i++) circle(bx - 6 + rnd(g + i) * 12, by + 12 + rnd(g + i + 3) * 8, 1, '#c9c2b0', null);
  });
  // Servicewagen und Technikerin, weit weg und daher klein
  box(150, 316, 40, 14, '#f3f1ea', 3, 1.2); box(176, 308, 14, 10, '#9fc4d6', 2, 1); circle(158, 331, 3.5, '#2d2f33'); circle(182, 331, 3.5, '#2d2f33');
  withAlpha('technikerin', () => person({ x: 210, foot: 334, s: 0.42, face: -1, shirt: '#d9542b', pants: '#3b3d40', hair: '#3a2c22', hand: { x: 204, y: 300 } }));
  // Schaf im Schatten der Module
  withAlpha('schaf', () => {
    const graze = (f % 30) < 18, hx = graze ? 0 : 3, hy = graze ? 10 : 0;
    for (const dx of [-14, -6, 8, 15]) line(430 + dx, 372, 430 + dx, 388, INK, 2.5);
    ctx.beginPath(); ctx.ellipse(430, 362, 26, 15, 0, 0, TAU); paint('#f3efe4', INK, 1.5);
    for (let i = 0; i < 7; i++) circle(412 + i * 6, 350 + (i % 2) * 3, 4, '#f3efe4', null);
    ctx.beginPath(); ctx.ellipse(458 + hx, 356 + hy, 8, 6, 0.4, 0, TAU); paint('#3b3d40', INK, 1.2);
    if (graze) for (let i = 0; i < 3; i++) line(460 + i * 3, 368, 461 + i * 3, 362, '#5f9a4a', 1.5);
  });
  // Solarreihe mit Pfosten
  for (const x of [262, 430, 590]) box(x - 3, 314, 6, 72, '#8a8f94', 0, 1.2);
  for (let c = 0; c < EN_COLS; c++) {
    const u0 = c / EN_COLS, u1 = (c + 1) / EN_COLS, um = (u0 + u1) / 2;
    const a = enLerp(EN_TL, EN_TR, u0), b = enLerp(EN_TL, EN_TR, u1), d = enLerp(EN_BL, EN_BR, u1), e = enLerp(EN_BL, EN_BR, u0);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(d.x, d.y); ctx.lineTo(e.x, e.y); ctx.closePath(); paint('#23384d', INK, 1.2);
    ctx.strokeStyle = 'rgba(127,211,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo((a.x + e.x) / 2, (a.y + e.y) / 2); ctx.lineTo((b.x + d.x) / 2, (b.y + d.y) / 2); ctx.stroke();
    const dust = enDust(um, g);
    if (dust > 0) { ctx.save(); ctx.globalAlpha *= 0.55 * dust; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(d.x, d.y); ctx.lineTo(e.x, e.y); ctx.closePath(); ctx.fillStyle = '#c9b48f'; ctx.fill(); ctx.restore(); }
    else { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a.x + 8, a.y + 8); ctx.lineTo(a.x + 2, a.y + 22); ctx.stroke(); }
  }
  line(EN_TL.x, EN_TL.y, EN_TR.x, EN_TR.y, INK, 2); line(EN_BL.x, EN_BL.y, EN_BR.x, EN_BR.y, INK, 2);
  // Ladestationen an beiden Enden
  box(EN_BL.x - 26, 252, 16, 64, '#8a8f94', 2, 1.2); box(EN_BR.x + 26, 252, 16, 64, '#8a8f94', 2, 1.2);
  // Staubwolke
  const gf = gustFront(g);
  if (gf != null) for (let i = 0; i < 26; i++) {
    const u = gf - rnd(i) * 0.25, p = enLerp(EN_TL, EN_TR, u);
    circle(p.x + rnd(i + 7) * 20, 200 + rnd(i + 3) * 120, 2 + rnd(i + 1) * 4, 'rgba(201,180,143,0.6)', null);
  }
  // Putzroboter
  withAlpha('putz', () => {
    const u = putzU(g), t = enLerp(EN_TL, EN_TR, u), b = enLerp(EN_BL, EN_BR, u);
    const dx = u <= 0 ? -8 : u >= 1 ? 8 : 0, moving = (g % 480 < 180) || (g % 480 >= 260 && g % 480 < 440);
    ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(t.x + dx, t.y - 2); ctx.lineTo(b.x + dx, b.y + 2); ctx.stroke();
    ctx.strokeStyle = '#e6e3da'; ctx.lineWidth = 10; ctx.stroke();
    for (let i = 0; i < 6; i++) { const k = ((i + (moving ? g / 2 : 0)) % 6) / 6, p = enLerp(t, b, k); line(p.x + dx - 4, p.y, p.x + dx + 4, p.y + 2, '#7aa7d9', 2); }
    box(t.x + dx - 9, t.y - 16, 18, 12, '#3b3d40', 2, 1.2); circle(t.x + dx + 4, t.y - 10, 1.8, moving ? '#7fe08a' : '#ffb347', null);
  });
}

registerRoom({
  key: 'energie', name: 'Energiepark', level: 'Außengelände',
  hitOrder: ['technikerin', 'blatt', 'putz', 'schaf'],
  robots: [
    { id: 'putz', name: 'Putzroboter für Solarmodule', bereich: 'Energie', aera: 'seit den 2010ern', typ: 'Roboter, der an der Modulreihe entlangfährt',
      fakt: 'Staub kann die Leistung von Solarmodulen in Wüstengegenden um bis zu 40 Prozent senken. In einem Solarpark in der Arava-Wüste in Israel fahren deshalb Roboter jede Nacht an den Modulreihen entlang. Sie putzen ohne Wasser, mit Mikrofaser und einem Luftstrom.',
      echt: 'Realistisch, nur dass echte Putzroboter nachts arbeiten, wenn die Module keinen Strom liefern. Hier läuft es im Zeitraffer am Tag.',
      note: 'Putzt die Reihe blitzblank. Kaum ist sie fertig, weht die nächste Staubwolke drüber, und es geht von vorn los.', color: '#e6e3da',
      quelle: 'https://www.timesofisrael.com/israeli-robot-cleaning-system-promises-brighter-future-for-solar-power/',
      box: () => { const u = putzU(state.g), t = enLerp(EN_TL, EN_TR, u); return [ENX + t.x - 24, ENY + t.y - 18, 40, 86]; } },
    { id: 'blatt', name: 'Wartungsroboter am Rotorblatt', bereich: 'Energie', aera: 'seit den 2020ern', typ: 'Roboter an Seilwinden',
      fakt: 'Regen, Hagel und Staub schleifen mit der Zeit die Vorderkante von Rotorblättern ab. Statt Menschen am Seil fährt heute manchmal ein Roboter an Seilwinden zum Blatt. Er schleift, spachtelt und lackiert die Kante. Bei einem Test in Frankreich reparierte er ein 10 bis 15 Meter langes Stück in gut 30 Stunden.',
      echt: 'Realistisch. Das Windrad steht während der Reparatur still, ein Blatt zeigt dafür senkrecht nach unten. Die echten Windräder sind viel größer, als sie hier aussehen.',
      note: 'Fährt am Blatt auf und ab und schleift die Kante glatt. Die Nachbarn drehen sich weiter.', color: '#f0b429',
      quelle: 'https://innovation.engie.com/en/news/interview/research-and-innovation/innovation-in-wind-power-robots-used-to-repair-wind-turbine-blade-erosion/30481',
      box: () => [ENX + EN_HUB.x - 40, ENY + bladeBotY(state.g) - 30, 60, 56] },
    { id: 'schaf', name: 'Schaf', bereich: 'Tier', aera: 'kein Roboter', typ: 'Rasenmäher mit Wolle',
      fakt: 'In vielen Solarparks weiden Schafe unter den Modulen. Sie halten das Gras kurz, damit es die Module nicht verschattet, und finden dort Schatten.',
      echt: 'Stimmt so. Schafe passen gut, weil sie nicht an Kabeln knabbern und nicht auf die Module springen wie Ziegen.',
      note: 'Grast unter der Reihe und lässt sich vom Putzroboter nicht stören.', color: '#f3efe4',
      box: () => [ENX + 402, ENY + 340, 68, 50] },
    { id: 'technikerin', name: 'Technikerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch, weit weg',
      fakt: 'Steuert den Wartungsroboter vom Boden aus und schaut sich die Bilder seiner Kamera an.', note: 'Klein, weil sie weit hinten steht. Das Windrad ist in echt riesig.', color: '#d9542b',
      box: () => [ENX + 196, ENY + 276, 30, 60] },
  ],
  draw: drawEnergie,
  glow(f) {
    // Nachtkennzeichnung: rote Blinklichter auf den Gondeln, wie bei echten Windrädern
    if (state.g % 24 < 12) for (const [x, y] of [[EN_HUB.x + 14, EN_HUB.y - 12], [470 + 7, 143], [580 + 6, 164]]) glow(x, y, 14, 'rgba(255,60,50,0.95)');
    const u = putzU(state.g), t = enLerp(EN_TL, EN_TR, u); glow(t.x + 4, t.y - 10, 10, 'rgba(127,224,138,0.9)');
  },
});
