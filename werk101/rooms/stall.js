/* Raum: Gewächshaus und Stall (EG)
   Hauptfigur: Futterschieber und Erntearm · Gag: Kuh genießt die Bürste (Bild 5–20) · Querverweis: Hummeln statt Bestäuberdrohne */
const HX = rx(roomOf('stall').c), HY = ry(roomOf('stall').r);

function pickArm(f) {
  const t = f % 30;
  if (t < 10) return mix({ x: 150, y: 250 }, { x: 196, y: 212 }, ease(seg(t, 0, 10)));
  if (t < 14) return { x: 196, y: 212 };
  if (t < 24) return mix({ x: 196, y: 212 }, { x: 150, y: 250 }, ease(seg(t, 14, 24)));
  return { x: 150, y: 250 };
}
const pusherX = f => lerp(-60, 700, f / 60);

/* ---------- Melkroboter: Laser sucht die Zitzen (4–10), Becher dran (10–14), melken (14–44), ab und zurück (44–56) ---------- */
const MK_HOME = { x: 380, y: 318 }, MK_UDDER = { x: 446, y: 342 };
function melkTip(f) {
  if (f < 10) return mix(MK_HOME, MK_UDDER, ease(seg(f, 0, 10)));
  if (f < 46) return MK_UDDER;
  return mix(MK_UDDER, MK_HOME, ease(seg(f, 46, 58)));
}
function drawMelk(f) {
  // Melkbox mit Milchtank und Anzeige
  box(312, 236, 56, 122, '#e6e3da', 4, 1.8);
  box(318, 246, 44, 26, '#23384d', 2, 1.2);
  const liter = 8.4 * seg(f, 14, 44);
  text(`${liter.toFixed(1).replace('.', ',')} l`, 340, 264, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
  box(320, 286, 40, 52, '#c9ccc8', 6, 1.2);
  ctx.fillStyle = '#fbfaf6'; const h = 46 * (0.25 + 0.6 * seg(f, 14, 44)); ctx.fillRect(323, 335 - h, 34, h);
  const t = melkTip(f), on = f >= 12 && f < 46;
  // Arm unter dem Bauch der Kuh
  const S = { x: 368, y: 318 }, E = { x: (S.x + t.x) / 2, y: Math.max(S.y, t.y) + 6 };
  limb(S.x, S.y, E.x, E.y, 8, '#8a8f94'); limb(E.x, E.y, t.x, t.y, 7, '#8a8f94'); circle(E.x, E.y, 4, '#3b3d40', INK, 1);
  for (let i = 0; i < 4; i++) {
    const cx = t.x - 9 + i * 6, cy = on ? MK_UDDER.y + 2 : t.y + 4;
    box(cx - 2, cy - 2, 5, 9, '#5d6064', 1, 0.8);
    if (on) { ctx.save(); ctx.globalAlpha = 0.9; line(cx, cy + 7, 360, 300, 'rgba(240,240,240,0.9)', 1.2); ctx.restore(); }
  }
  if (on) for (let i = 0; i < 4; i++) { const u = ((f * 2 + i * 8) % 30) / 30; circle(lerp(t.x, 362, u), lerp(t.y + 10, 300, u), 1.6, '#ffffff', null); }
  if (f >= 4 && f < 11) { ctx.save(); ctx.globalAlpha = 0.8; line(t.x + 4, t.y, t.x + 26, MK_UDDER.y - 6, '#ff3b30', 1.2); ctx.restore(); }
}
function cow(x, y, f) {
  ctx.save(); ctx.translate(x, y);
  const sw = Math.sin(TAU * f / 20) * 0.12;
  ctx.save(); ctx.translate(-56, -58); ctx.rotate(sw);
  line(0, 0, -8, 46, INK, 4); line(0, 0, -8, 46, '#2a2723', 2);
  ctx.fillStyle = '#2a2723'; ctx.beginPath(); ctx.ellipse(-8, 50, 4, 7, 0, 0, TAU); ctx.fill();
  ctx.restore();
  for (const lx of [-46, -32, 30, 44]) { limb(lx, -30, lx, -4, 8, '#f3f1ea'); box(lx - 5, -6, 10, 6, '#2a2723', 1, 1); }
  ctx.beginPath(); ctx.ellipse(0, -48, 58, 26, 0, 0, TAU); paint('#f3f1ea');
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -48, 57, 25, 0, 0, TAU); ctx.clip();
  ctx.fillStyle = '#2a2723';
  for (const [px, py, r] of [[-30, -60, 16], [6, -40, 14], [30, -64, 12], [-8, -70, 9]]) { ctx.beginPath(); ctx.ellipse(px, py, r, r * 0.7, 0.4, 0, TAU); ctx.fill(); }
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(-24, -24, 12, 7, 0, 0, TAU); paint('#e8b4b4', INK, 1.5);
  const eat = Math.sin(TAU * f / 15) * 2;
  ctx.save(); ctx.translate(62, -50 + eat);
  ctx.beginPath(); ctx.ellipse(8, 8, 13, 17, -0.5, 0, TAU); paint('#f3f1ea');
  ctx.fillStyle = '#2a2723'; ctx.beginPath(); ctx.ellipse(4, 0, 9, 8, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16, 20, 8, 6, -0.5, 0, TAU); paint('#e8b4b4', INK, 1.5);
  if (f >= 5 && f < 20) line(6, 4, 12, 3, '#f3f1ea', 1.5); else circle(9, 4, 1.8, '#f3f1ea', null);
  ctx.beginPath(); ctx.ellipse(-8, -6, 7, 3, -0.6, 0, TAU); paint('#2a2723');
  box(-14, -18, 10, 4, '#d6a521', 1, 1);
  ctx.restore();
  ctx.restore();
}

function drawStall(f) {
  // Gewächshaus links
  ctx.fillStyle = '#dbe7e2'; ctx.fillRect(0, 0, 300, RH);
  ctx.strokeStyle = '#8a8f94'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x <= 300; x += 50) { ctx.moveTo(x, 8); ctx.lineTo(x, 360); }
  ctx.moveTo(0, 60); ctx.lineTo(300, 60); ctx.stroke();
  // Stall rechts
  ctx.fillStyle = '#c9b48f'; ctx.fillRect(300, 0, 340, RH);
  for (let x = 300; x < RW; x += 20) line(x, 8, x, 360, 'rgba(142,98,51,0.25)', 2);
  box(296, 8, 8, 352, '#8e6233', 0, 2);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('STALL', 320, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#7d6a58'; ctx.fillRect(0, 360, 300, 40);
  ctx.fillStyle = '#d8c27a'; ctx.fillRect(300, 360, 340, 40);
  for (let i = 0; i < 40; i++) line(300 + rnd(i) * 340, 362 + rnd(i + 9) * 30, 306 + rnd(i) * 340, 360 + rnd(i + 5) * 34, '#b89c50', 1.2);
  line(0, 360, RW, 360, INK, 2);

  // Erdbeeren in Hängerinnen, Erntearm auf Schienen
  for (const y of [204, 284]) {
    box(20, y, 260, 12, '#f3f1ea', 2, 1.5);
    for (let x = 30; x < 280; x += 22) {
      ctx.fillStyle = '#5f9a4a'; ctx.beginPath(); ctx.ellipse(x, y - 6, 10, 6, 0, 0, TAU); ctx.fill();
      if ((x / 22) % 2 < 1) { ctx.beginPath(); ctx.moveTo(x - 4, y + 12); ctx.lineTo(x + 4, y + 12); ctx.lineTo(x, y + 22); ctx.closePath(); paint('#d9342b', INK, 1); }
    }
  }
  box(20, 344, 260, 6, '#8a8f94', 0, 1.2);
  withAlpha('ernte', () => {
    box(100, 300, 80, 44, '#e6e3da', 4);
    circle(116, 348, 6, '#2d2f33'); circle(164, 348, 6, '#2d2f33');
    box(110, 284, 40, 16, '#3e6f9e', 2, 1.2);
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(116 + i * 10, 288); ctx.lineTo(124 + i * 10, 288); ctx.lineTo(120 + i * 10, 296); ctx.closePath(); paint('#d9342b', INK, 1); }
    const tip = pickArm(f), S = { x: 160, y: 300 }, el = ik2(S, tip, 40, 40);
    limb(S.x, S.y, el.x, el.y, 6, '#e6e3da'); limb(el.x, el.y, tip.x, tip.y, 5, '#e6e3da');
    circle(el.x, el.y, 3, '#3b3d40');
    box(tip.x - 6, tip.y - 8, 12, 8, '#3b3d40', 2, 1); circle(tip.x + 4, tip.y - 4, 1.8, '#7fd3ff', null);
    const t = f % 30;
    if (t >= 12 && t < 24) { ctx.beginPath(); ctx.moveTo(tip.x - 4, tip.y + 2); ctx.lineTo(tip.x + 4, tip.y + 2); ctx.lineTo(tip.x, tip.y + 12); ctx.closePath(); paint('#d9342b', INK, 1); }
  });
  // Hummelkasten und Hummeln
  withAlpha('hummel', () => {
    box(232, 314, 40, 28, '#a8763f', 2, 1.5); circle(244, 328, 3, '#2a2723', null);
    for (let i = 0; i < 3; i++) {
      const a = TAU * (f / 60 + i / 3), x = 210 + 46 * Math.cos(a) + 10 * Math.sin(3 * a), y = 250 + 38 * Math.sin(a);
      ctx.beginPath(); ctx.ellipse(x, y, 4.5, 3.2, 0, 0, TAU); paint('#f0b429', INK, 1);
      line(x - 1, y - 3, x + 1, y + 3, INK, 1.2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(x, y - 4, 3, 1.6, 0, 0, TAU); ctx.fill();
    }
  });

  // Futtertisch und automatische Kuhbürste
  box(548, 300, 60, 30, '#5d6064', 3);
  ctx.beginPath(); ctx.ellipse(578, 298, 24, 6, 0, 0, TAU); paint('#c9a46a', INK, 1.5);
  line(430, 8, 430, 240, '#8a8f94', 3);
  withAlpha('kuh', () => cow(470, 356, f));
  withAlpha('melk', () => drawMelk(f));
  withAlpha('buerste', () => {
    const on = f >= 5 && f < 20;
    ctx.save(); ctx.translate(430, 262); ctx.rotate(on ? 0.15 : 0);
    box(-6, -26, 12, 8, '#3b3d40', 2, 1.2);
    box(-22, -18, 44, 36, '#d9542b', 10, 1.5);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const y = -16 + ((i * 6 + (on ? f * 3 : 0)) % 32); ctx.moveTo(-20, y); ctx.lineTo(20, y); }
    ctx.stroke(); ctx.restore();
  });
  // Futterschieber im Futtergang
  withAlpha('schieber', () => {
    const x = pusherX(f);
    if (x < 320) return;
    ctx.beginPath(); ctx.ellipse(x, 380, 30, 14, 0, 0, TAU); paint('#e6e3da');
    box(x - 30, 372, 60, 10, '#d9542b', 3, 1.2);
    circle(x + 18, 372, 2.5, f % 6 < 3 ? '#7fe08a' : '#2d5b33', null);
    ctx.fillStyle = '#9c8a3c'; for (let i = 0; i < 6; i++) ctx.fillRect(x + 30 + i * 3, 386 - (i % 2) * 3, 4, 4);
  });
}

registerRoom({
  key: 'stall', name: 'Gewächshaus und Stall', level: 'EG',
  hitOrder: ['hummel', 'schieber', 'ernte', 'buerste', 'melk', 'kuh'],
  robots: [
    { id: 'buerste', name: 'Kuhbürste', bereich: 'Landwirtschaft', aera: 'seit den 2000ern', typ: 'Automatische Drehbürste',
      fakt: 'Automatische Kuhbürsten beginnen sich zu drehen, sobald eine Kuh sie berührt, und hören von selbst wieder auf. Die Kühe schrubben sich damit Rücken, Hals und Kopf.',
      echt: 'Realistisch. Studien zeigen, dass Kühe die Bürste oft und gern benutzen, ähnlich wie Weidetiere sich an Bäumen reiben.',
      note: 'Dreht sich, sobald die Kuh sich dagegen lehnt. Die Kuh schließt dabei die Augen.', color: '#d9542b',
      box: () => [HX + 404, HY + 230, 54, 56] },
    { id: 'schieber', quelle: 'https://en.wikipedia.org/wiki/Lely_Juno_family', name: 'Futterschieber', bereich: 'Landwirtschaft', aera: 'seit 2008', typ: 'Runder Roboter im Futtergang',
      fakt: 'Futterschieber fahren mehrmals am Tag den Futtergang ab und schieben das Futter zurück an das Gitter, damit die Kühe es erreichen.',
      echt: 'Realistisch. Hier fährt er nur einmal pro Runde vorbei; in echt kommt er alle paar Stunden.',
      note: 'Fährt quer durchs Bild und nimmt keine Rücksicht auf Strohhalme.', color: '#e6e3da',
      box: f => [HX + pusherX(f) - 32, HY + 362, 64, 34] },
    { id: 'ernte', quelle: 'https://en.wikipedia.org/wiki/Agricultural_robot', name: 'Erdbeer-Ernteroboter', bereich: 'Landwirtschaft', aera: 'Erprobung', typ: 'Greifarm mit Kamera auf Schienen',
      fakt: 'Ernteroboter fahren auf Schienen zwischen den Pflanzenreihen. Eine Kamera erkennt, welche Erdbeeren reif sind, und der Arm knipst sie am Stiel ab, ohne die Frucht zu drücken.',
      echt: 'Solche Roboter gibt es, sie sind aber langsamer als geübte Erntehelfer. Hier pflückt er zwei Erdbeeren pro Runde.',
      note: 'Nimmt nur die roten. Grüne lässt er hängen.', color: '#e6e3da',
      box: () => [HX + 96, HY + 196, 120, 156] },
    { id: 'hummel', name: 'Hummeln', bereich: 'Tier', aera: 'kein Roboter', typ: 'Bestäuberinnen',
      fakt: 'In Gewächshäusern bestäuben gekaufte Hummelvölker die Blüten. Forscher haben auch winzige Bestäuberdrohnen gebaut, doch Hummeln sind bisher deutlich besser darin.',
      echt: 'Echt: Hummelkästen stehen in vielen Gewächshäusern.', note: 'Drei Runden um die Pflanzen, dann wieder von vorn.', color: '#f0b429',
      box: () => [HX + 160, HY + 206, 116, 140] },
    { id: 'melk', name: 'Melkroboter', bereich: 'Landwirtschaft', aera: 'seit 1992', typ: 'Melkbox mit Greifarm und Laser',
      fakt: 'Die Kuh geht von selbst zum Melken, wann sie will, meist zwei- bis dreimal am Tag. Ein Laser oder eine 3D-Kamera findet die Zitzen, der Arm setzt die Melkbecher an. Der Roboter misst dabei Menge und Qualität der Milch.',
      echt: 'Echt und weit verbreitet. Weltweit melken Zehntausende solcher Roboter, die ersten kamen 1992 in den Niederlanden in den Stall.',
      note: 'Setzt die Becher an, während die Kuh weiterfrisst. Sie merkt es kaum.', color: '#e6e3da',
      quelle: 'https://en.wikipedia.org/wiki/Automatic_milking',
      box: () => [HX + 312, HY + 236, 140, 122] },
    { id: 'kuh', name: 'Kuh', bereich: 'Tier', aera: 'kein Roboter', typ: 'Milchkuh',
      fakt: 'Frisst am Futtertisch und lässt sich dabei von der Bürste den Rücken schrubben.',
      note: 'Kommt jede Runde zur Bürste. Mehr Wellness gibt es im ganzen Haus nicht.', color: '#2a2723',
      box: () => [HX + 410, HY + 270, 150, 90] },
  ],
  draw: drawStall,
});
