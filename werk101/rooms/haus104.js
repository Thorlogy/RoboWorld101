/* Haus 104 (ganz rechts, zwei Stockwerke): unten Imbiss, oben Pflege
   Imbiss: Pizzastraße (Teig, Soße im Kreis, Käse, Ofen), weicher Greifer packt Erdbeeren, ohne sie zu zerdrücken.
   Pflege: Hebe-Roboter setzt eine Bewohnerin vom Bett in den Rollstuhl und zurück, Pflegerin mit Exoskelett hebt einen Wäschekorb,
   ein Mann stapelt Becher mit seiner Handprothese. */
const PFX = rx(roomOf('pflege').c), PFY = ry(roomOf('pflege').r);
const IMX = rx(roomOf('imbiss').c), IMY = ry(roomOf('imbiss').r);
const H104_MONO = { family: '"IBM Plex Mono", monospace', weight: 500 };

/* ---------- Imbiss: Pizzastraße, je 20 Bilder ein Platz weiter ---------- */
function pizzaAt(k, f) { return 30 + ((f / 20 + k) % 3) * 80; }
function drawPizzaLine(f) {
  box(14, 300, 300, 10, '#3b3d40', 2, 1.5);
  for (let x = 20; x < 310; x += 20) circle(x + ((f * 2) % 20) * 0, 305, 2, '#8a8f94', null);
  line(24, 310, 24, 360, INK, 3); line(304, 310, 304, 360, INK, 3);
  // Stationen über dem Band: Soße, Käse, dann der Ofen
  box(98, 214, 24, 40, '#e6e3da', 3, 1.5); line(110, 254, 110, 270, '#8a8f94', 3);
  box(176, 210, 36, 34, '#e6e3da', 3, 1.5); box(184, 244, 20, 10, '#c9ccc8', 1, 1);
  box(244, 236, 74, 64, '#5d6064', 4, 1.5); ctx.fillStyle = '#2a2723'; ctx.fillRect(252, 256, 58, 30);
  glow(281, 272, 20, 'rgba(255,140,60,0.7)');
  text('SOSSE', 110, 208, 7, Object.assign({ align: 'center' }, H104_MONO)); text('KÄSE', 194, 204, 7, Object.assign({ align: 'center' }, H104_MONO));
  for (let k = 0; k < 3; k++) {
    const x = pizzaAt(k, f), stage = x < 90 ? 0 : x < 170 ? 1 : x < 240 ? 2 : 3;
    if (x > 250) continue;
    ctx.beginPath(); ctx.ellipse(x, 296, 30, 5, 0, 0, TAU); paint('#e9c98b', INK, 1.5);
    if (stage >= 1) { ctx.beginPath(); ctx.ellipse(x, 295, 25, 3.5, 0, 0, TAU); ctx.fillStyle = '#c8452b'; ctx.fill(); }
    if (stage >= 2) for (let i = 0; i < 9; i++) { ctx.fillStyle = '#f6e6a8'; ctx.fillRect(x - 22 + rnd(i * 3 + k) * 42, 292 + rnd(i + k) * 3, 3, 2); }
  }
  // Soße läuft im Kreis aus der Düse, wenn eine Pizza darunter steht
  const under = [0, 1, 2].some(k => Math.abs(pizzaAt(k, f) - 110) < 14);
  if (under) { line(110, 270, 110, 292, '#c8452b', 2); ctx.beginPath(); ctx.ellipse(110 + Math.cos(f) * 10, 294, 4, 1.5, 0, 0, TAU); ctx.fillStyle = '#c8452b'; ctx.fill(); }
  const cheese = [0, 1, 2].some(k => Math.abs(pizzaAt(k, f) - 194) < 16);
  if (cheese) for (let i = 0; i < 5; i++) { ctx.fillStyle = '#f6e6a8'; ctx.fillRect(186 + i * 4, 256 + ((f * 5 + i * 7) % 34), 2, 3); }
  text('300 Pizzen pro Stunde', 160, 336, 8, Object.assign({ align: 'center', color: '#5d5a55' }, H104_MONO));
}
/* ---------- weicher Greifer: Erdbeere aus der Schale in die Box ---------- */
function softTip(f) {
  const p = f % 30, a = { x: 372, y: 282 }, up = { x: 404, y: 230 }, b = { x: 438, y: 282 };
  if (p < 6) return { pt: mix(up, a, ease(seg(p, 0, 6))), grip: seg(p, 4, 6) };
  if (p < 15) return { pt: p < 9 ? a : mix(a, up, ease(seg(p, 9, 15))), grip: 1 };
  if (p < 22) return { pt: mix(up, b, ease(seg(p, 15, 22))), grip: 1 - seg(p, 20, 22) };
  return { pt: mix(b, up, ease(seg(p, 22, 30))), grip: 0 };
}
function drawSoftGripper(f) {
  box(344, 290, 120, 70, '#c9ccc8', 2, 1.5);
  box(354, 280, 40, 10, '#3e6f9e', 1, 1); box(418, 276, 40, 14, '#f3f1ea', 1, 1.2);
  const placed = Math.floor(f / 30) + (f % 30 >= 21 ? 1 : 0);
  for (let i = 0; i < 3; i++) circle(362 + i * 11, 279, 4, '#d9342b', INK, 1);
  for (let i = 0; i < placed; i++) circle(428 + i * 10, 274, 4, '#d9342b', INK, 1);
  line(344, 200, 464, 200, '#8a8f94', 4);
  const t = softTip(f);
  line(t.pt.x, 200, t.pt.x, t.pt.y - 16, '#5d6064', 3); box(t.pt.x - 8, t.pt.y - 20, 16, 6, '#3b3d40', 1, 1);
  // drei Finger aus Gummi, krümmen sich mit Luftdruck
  const g = t.grip;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(t.pt.x + s * 6, t.pt.y - 14);
    ctx.quadraticCurveTo(t.pt.x + s * (12 - 6 * g), t.pt.y - 4, t.pt.x + s * (8 - 5 * g), t.pt.y + 4);
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = '#5fbf9a'; ctx.lineWidth = 4; ctx.stroke();
  }
  if (g > 0.5 && (f % 30) >= 6 && (f % 30) < 21) circle(t.pt.x, t.pt.y, 4, '#d9342b', INK, 1);
  text('SANFT GREIFEN', 404, 336, 8, Object.assign({ align: 'center', color: '#5d5a55' }, H104_MONO));
}
function drawImbiss(f) {
  ctx.fillStyle = '#f2eadb'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  for (let x = 0; x < RW; x += 32) for (let y = 160; y < 300; y += 32) { ctx.strokeStyle = 'rgba(42,39,35,0.06)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, 32, 32); }
  ctx.fillStyle = '#b98a5a'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  text('IMBISS', 28, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  box(440, 40, 180, 74, '#2f3b36', 2);
  const chalk = { family: '"Saira Condensed", sans-serif', weight: 600, color: '#e8eee9' };
  text('Pizza Margherita  7,50', 452, 66, 13, chalk); text('Erdbeerbecher  3,20', 452, 86, 13, chalk); text('Wasser  1,50', 452, 106, 13, chalk);
  withAlpha('pizza', () => drawPizzaLine(f));
  withAlpha('softgreifer', () => drawSoftGripper(f));
  withAlpha('imbissgast', () => person({ x: 560, face: -1, shirt: '#3e6f9e', pants: '#3b3d40', hair: '#2a1f18', hand: { x: 540, y: 300 - (f % 30 < 15 ? 0 : 2) } }));
  box(520, 296, 40, 64, '#a8763f', 1, 1.5);
}

/* ---------- Pflege: Hebe-Roboter ---------- */
// Der Roboter schaut nach links und hält die Bewohnerin vor der Brust. Bild 0–8 anheben, 8–24 rückwärts zum Rollstuhl fahren,
// 24–30 absetzen, 30–36 Pause, 36–42 anheben, 42–54 zurück zum Bett, 54–60 ablegen.
const PF_BEDX = 84, PF_CHAIRX = 276, PF_REACH = 76;
function liftPos(f) {
  let x, y, carried;
  if (f < 8) { x = PF_BEDX; y = lerp(300, 282, ease(seg(f, 0, 8))); carried = f > 1; }
  else if (f < 24) { x = lerp(PF_BEDX, PF_CHAIRX, ease(seg(f, 8, 24))); y = 282; carried = true; }
  else if (f < 30) { x = PF_CHAIRX; y = lerp(282, 290, ease(seg(f, 24, 30))); carried = f < 28; }
  else if (f < 36) { x = PF_CHAIRX; y = 290; carried = false; }
  else if (f < 42) { x = PF_CHAIRX; y = lerp(290, 282, ease(seg(f, 36, 42))); carried = f > 38; }
  else if (f < 54) { x = lerp(PF_CHAIRX, PF_BEDX, ease(seg(f, 42, 54))); y = 282; carried = true; }
  else { x = PF_BEDX; y = lerp(282, 300, ease(seg(f, 54, 60))); carried = f < 58; }
  return { p: { x, y }, robot: x + PF_REACH, carried };
}
const inChair = f => f >= 28 && f < 38;
function drawLifter(f) {
  // Bett und Rollstuhl
  box(14, 304, 150, 16, '#e6e3da', 3, 1.5); box(14, 286, 12, 34, '#8a8f94', 1, 1.2); line(24, 320, 24, 358, INK, 3); line(154, 320, 154, 358, INK, 3);
  box(30, 296, 28, 10, '#f3f1ea', 3, 1);
  circle(288, 340, 18, '#3b3d40', INK, 1.5); circle(288, 340, 6, '#8a8f94', null); circle(252, 352, 6, '#3b3d40', INK, 1);
  box(256, 312, 48, 8, '#3e6f9e', 1, 1.2); line(302, 320, 308, 268, INK, 3); line(256, 320, 252, 352, INK, 2);
  const L = liftPos(f);
  withAlpha('bewohnerin', () => {
    if (inChair(f)) person({ x: 282, foot: 352, sit: true, face: -1, shirt: '#b07a9a', pants: '#5d5a55', hair: '#d6d2c8', hand: { x: 268, y: 312 } });
    else { ctx.save(); ctx.translate(L.p.x, L.p.y); ctx.rotate(-Math.PI / 2 + (L.carried ? 0.12 : 0)); ctx.translate(-L.p.x, -L.p.y); person({ x: L.p.x, foot: L.p.y + 50, face: 1, shirt: '#b07a9a', pants: '#5d5a55', hair: '#d6d2c8', hand: { x: L.p.x + 6, y: L.p.y + 6 } }); ctx.restore(); }
  });
  // Roboter: Rollsockel, Körper, Kopf mit runden Ohren, zwei gepolsterte Arme vor der Brust
  withAlpha('umlager', () => {
    const bx = L.robot;
    box(bx - 28, 340, 56, 16, '#e6e3da', 4, 1.5); circle(bx - 18, 358, 4, '#2d2f33'); circle(bx + 18, 358, 4, '#2d2f33');
    box(bx - 18, 250, 36, 92, '#f3f1ea', 10, 1.5);
    circle(bx - 4, 232, 18, '#f3f1ea', INK, 1.5); circle(bx - 16, 218, 6, '#f3f1ea', INK, 1.2); circle(bx + 10, 217, 6, '#f3f1ea', INK, 1.2);
    circle(bx - 14, 230, 2, INK, null); ctx.beginPath(); ctx.ellipse(bx - 20, 238, 4, 3, 0, 0, TAU); ctx.fillStyle = '#d6d2c8'; ctx.fill();
    // Arme waagerecht nach vorn unter Rücken und Knie; ohne Last eingezogen
    const free = inChair(f) || f >= 30 && f < 36;
    for (const [dy, dx] of [[0, -34], [12, 26]]) {
      const S = { x: bx - 12, y: 266 + dy }, T = free ? { x: bx - 40, y: 290 + dy * 0.5 } : { x: L.p.x + dx, y: L.p.y + 12 };
      const E = { x: (S.x + T.x) / 2 + 6, y: Math.max(S.y, T.y) + 8 };
      limb(S.x, S.y, E.x, E.y, 10, '#f3f1ea'); limb(E.x, E.y, T.x, T.y, 10, '#f3f1ea');
    }
  });
}
/* ---------- Pflegerin mit Exoskelett: Korb vom Boden ins Regal ---------- */
function exoBend(f) { const p = f % 30; return p < 8 ? ease(seg(p, 0, 8)) : p < 12 ? 1 : p < 22 ? 1 - ease(seg(p, 12, 22)) : 0; }
function drawExoWorker(f) {
  box(452, 200, 64, 8, '#a8763f', 1, 1.2); box(452, 250, 64, 8, '#a8763f', 1, 1.2);
  line(456, 200, 456, 360, INK, 2); line(512, 200, 512, 360, INK, 2);
  for (let i = 0; i < 3; i++) box(460 + i * 18, 236, 14, 14, ['#f3f1ea', '#9fc4d6', '#e8b4b4'][i], 1, 1);
  const b = exoBend(f), x = 430, handY = lerp(296, 344, b), lean = 16 * b;
  const P = person({ x, face: 1, shirt: '#5f9a4a', pants: '#2f4866', hair: '#3a2c22', lean, hand: { x: x + 18 + lean, y: handY } });
  // Exoskelett: Rückenplatte, Hüftmotor, Oberschenkelbügel
  line(P.hip.x - 6, P.hip.y, P.sh.x - 6, P.sh.y + 4, '#3b3d40', 4);
  circle(P.hip.x - 4, P.hip.y, 5, '#d9542b', INK, 1.2);
  line(P.hip.x - 4, P.hip.y, P.hip.x - 6, P.hip.y + 26, '#3b3d40', 3);
  box(x + 8 + lean, handY, 26, 16, '#c9a46a', 2, 1.2);
}
/* ---------- Handprothese: Becher von links nach rechts stapeln ---------- */
function drawProsthesis(f) {
  box(540, 300, 92, 8, '#a8763f', 1, 1.5); line(548, 308, 548, 358, INK, 3); line(624, 308, 624, 358, INK, 3);
  const p = f % 20, k = Math.floor(f / 20);
  const from = { x: 556, y: 292 }, to = { x: 606, y: 292 - 10 * (k % 3) };
  const tip = p < 6 ? mix({ x: 580, y: 270 }, from, ease(seg(p, 0, 6))) : p < 14 ? mix(from, to, ease(seg(p, 6, 14))) : mix(to, { x: 580, y: 270 }, ease(seg(p, 14, 20)));
  for (let i = 0; i < 2 - (k % 3 > 1 ? 1 : 0); i++) box(550, 286 - i * 10, 12, 10, '#f0b429', 1, 1);
  for (let i = 0; i < k % 3; i++) box(600, 286 - i * 10, 12, 10, '#f0b429', 1, 1);
  person({ x: 612, foot: 358, sit: true, face: -1, shirt: '#7b4b8e', pants: '#3b3d40', hair: '#2a1f18', hand: { x: tip.x + 6, y: tip.y } });
  // Prothesenhand: grau, Finger öffnen und schließen
  const closed = p >= 6 && p < 14;
  box(tip.x - 2, tip.y - 4, 10, 8, '#8a8f94', 2, 1);
  line(tip.x - 2, tip.y - 3, tip.x - (closed ? 5 : 9), tip.y - (closed ? 6 : 9), '#5d6064', 2);
  line(tip.x - 2, tip.y + 3, tip.x - (closed ? 5 : 9), tip.y + (closed ? 6 : 9), '#5d6064', 2);
  if (p >= 6 && p < 14) box(tip.x - 12, tip.y - 5, 12, 10, '#f0b429', 1, 1);
}
function drawPflege(f) {
  ctx.fillStyle = '#eef0ea'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  ctx.fillStyle = '#c9b89a'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  text('PFLEGE', 28, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  box(250, 40, 120, 100, '#cfe0e6', 2, 2); line(310, 40, 310, 140, INK, 2); line(250, 90, 370, 90, INK, 1.5);
  ctx.fillStyle = '#9fc4a0'; ctx.fillRect(254, 110, 52, 28);
  drawLifter(f);
  withAlpha('exoarbeit', () => drawExoWorker(f));
  withAlpha('prothese', () => drawProsthesis(f));
}

registerRoom({
  key: 'imbiss', name: 'Haus 104: Imbiss', level: 'Haus 104',
  hitOrder: ['imbissgast', 'softgreifer', 'pizza'],
  draw: drawImbiss,
  robots: [
    { id: 'pizza', name: 'Pizzastraße', bereich: 'Service', aera: 'seit 2019', typ: 'Roboter belegt Pizzen am Band',
      fakt: 'Der Teig fährt auf einem Band unter Düsen durch. Eine verteilt die Soße im Kreis, eine streut den Käse, Kameras prüfen, ob alles gleichmäßig liegt. Eine Firma aus Seattle schafft damit bis zu 300 Pizzen in der Stunde.',
      echt: 'Echt, wird in Kantinen, Stadien und Lieferküchen eingesetzt. Den Teig ausrollen und in den Ofen schieben machen oft noch Menschen.',
      note: 'Soße, Käse, Ofen. Immer gleich viel, immer gleich rund.', color: '#c8452b',
      quelle: 'https://www.geekwire.com/2019/secretive-seattle-startup-picnic-unveils-pizza-making-robot-heres-delivers-300-pies-hour/',
      box: () => [IMX + 14, IMY + 200, 306, 160] },
    { id: 'softgreifer', name: 'Weicher Greifer', bereich: 'Industrie', aera: 'seit den 2010ern', typ: 'Finger aus Gummi, mit Luft bewegt',
      fakt: 'Die Finger sind innen hohl. Wird Luft hineingepumpt, krümmen sie sich und legen sich weich um das Ding, das gegriffen wird. So packen Roboter Erdbeeren, Eier oder Gebäck, ohne sie zu zerdrücken.',
      echt: 'Echt. Weiche Greifer arbeiten in Lebensmittelfabriken und Versandlagern. Die Forschung dazu heißt Soft Robotics, „weiche Robotik“.',
      note: 'Packt eine Erdbeere nach der anderen. Keine wird zu Marmelade.', color: '#5fbf9a',
      quelle: 'https://en.wikipedia.org/wiki/Soft_robotics',
      box: () => [IMX + 344, IMY + 196, 120, 164] },
    { id: 'imbissgast', name: 'Gast', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch', fakt: 'Wartet auf seine Pizza.', note: 'Hat zwei Erdbeerbecher bestellt.', color: '#3e6f9e',
      box: () => [IMX + 520, IMY + 236, 60, 124] },
  ],
});
registerRoom({
  key: 'pflege', name: 'Haus 104: Pflege', level: 'Haus 104',
  hitOrder: ['prothese', 'exoarbeit', 'bewohnerin', 'umlager'],
  draw: drawPflege,
  robots: [
    { id: 'umlager', name: 'Hebe-Roboter', bereich: 'Medizin', aera: 'Forschung seit 2015', typ: 'Roboter, der Menschen hebt',
      fakt: 'Ein Forschungsinstitut in Japan hat einen Roboter gebaut, der Menschen aus dem Bett in den Rollstuhl hebt und zurück. Seine Arme sind gepolstert, Sensoren messen, wie fest er drückt. Das schont den Rücken der Pflegekräfte.',
      echt: 'Forschung. Der Roboter sieht absichtlich freundlich aus, wie ein Bär. Im Alltag heben Pflegekräfte meist mit einfacheren Hebegeräten.',
      note: 'Hebt sanft, trägt, setzt ab und bringt die Bewohnerin wieder zurück ins Bett.', color: '#f3f1ea',
      quelle: 'https://www.riken.jp/en/news_pubs/research_news/pr/2015/20150223_2/index.html',
      box: f => [PFX + liftPos(f).robot - 40, PFY + 210, 76, 150] },
    { id: 'exoarbeit', name: 'Exoskelett für die Arbeit', bereich: 'Medizin', aera: 'seit den 2010ern', typ: 'Stütze für den Rücken',
      fakt: 'Ein Exoskelett wird wie ein Rucksack getragen. Ein Motor an der Hüfte hilft beim Aufrichten, wenn man sich bückt und etwas Schweres hebt. Das entlastet den Rücken.',
      echt: 'Echt. Solche Rückenstützen tragen Menschen in Lagern, auf Flughäfen und in der Pflege. Sie machen nicht stärker, aber weniger müde.',
      note: 'Bückt sich, hebt den Korb und richtet sich mit Rückenwind wieder auf.', color: '#5f9a4a',
      quelle: 'https://en.wikipedia.org/wiki/Powered_exoskeleton',
      box: () => [PFX + 400, PFY + 236, 64, 124] },
    { id: 'prothese', name: 'Handprothese', bereich: 'Medizin', aera: 'seit den 1960ern', typ: 'Künstliche Hand mit Motoren',
      fakt: 'Sensoren auf der Haut messen, wenn die Muskeln im Unterarm sich anspannen. Ein kleiner Rechner macht daraus den Befehl „Hand auf“ oder „Hand zu“, Motoren bewegen die Finger.',
      echt: 'Echt. Moderne Prothesen können verschiedene Griffe, etwa zum Halten eines Bechers oder einer Karte. Das Üben dauert Wochen.',
      note: 'Stapelt Becher, einen nach dem anderen.', color: '#8a8f94',
      quelle: 'https://en.wikipedia.org/wiki/Prosthesis',
      box: () => [PFX + 540, PFY + 236, 96, 124] },
    { id: 'bewohnerin', name: 'Bewohnerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch', fakt: 'Möchte in den Rollstuhl, später wieder ins Bett.', note: 'Hält sich gut fest.', color: '#b07a9a',
      box: f => { const L = liftPos(f); return inChair(f) ? [PFX + 256, PFY + 240, 50, 112] : [PFX + L.p.x - 60, PFY + L.p.y - 20, 120, 40]; } },
  ],
});
