/* Räume: Tunnelbau unter der Schule (UG 2): Nachläufer (links) und Bohrkopf (rechts)
   Eine Tunnelbohrmaschine gräbt die U-Bahn weiter nach rechts. Globale Uhr state.g:
   0–20 Zylinder ziehen sich zurück, 20–380 der Erektor setzt drei Tübbinge zu einem Ring, 400–480 die Maschine schiebt sich einen Ring weiter.
   Weil die Kamera mit der Maschine mitfährt, wandern Tunnelringe und Erde dabei nach links. Gag: Auf dem Förderband liegt ein Ammonit. */
const NLX = rx(roomOf('nachlauf').c), NLY = ry(roomOf('nachlauf').r);
const BKX = rx(roomOf('bohrkopf').c), BKY = ry(roomOf('bohrkopf').r);
const TB_P = 94, TB_TOP = 22, TB_BOT = 378, TB_SLOT = 300, TB_SHIELD = TB_SLOT + TB_P;
const tbShift = g => TB_P * ease(seg(g % 480, 400, 479));
// Tunnelringe und Erde, im Weltmaß fortlaufend über beide Felder
function tbLining(room) {
  const g = state.g, off = rx(roomOf(room).c) - NLX, sh = tbShift(g), x1 = room === 'bohrkopf' ? TB_SLOT : RW;
  ctx.fillStyle = '#6b5644'; ctx.fillRect(0, 0, RW, RH);
  for (let i = 0; i < 40; i++) { const x = ((i * 53 - off - sh) % RW + RW) % RW, y = i % 2 ? 6 + (i * 7) % 12 : 384 + (i * 5) % 12; circle(x, y, 2 + i % 3, 'rgba(0,0,0,0.18)', null); }
  ctx.fillStyle = '#8d8a83'; ctx.fillRect(0, TB_TOP - 8, x1, TB_BOT - TB_TOP + 16);
  ctx.fillStyle = '#5a5955'; ctx.fillRect(0, TB_TOP, x1, TB_BOT - TB_TOP);
  const start = -((off + sh) % TB_P);
  for (let x = start; x < x1; x += TB_P) { line(x, TB_TOP - 8, x, TB_TOP, INK, 1.5); line(x, TB_BOT, x, TB_BOT + 8, INK, 1.5); line(x, TB_TOP, x, TB_BOT, 'rgba(0,0,0,0.22)', 1.2); }
  line(0, TB_TOP - 8, x1, TB_TOP - 8, INK, 2); line(0, TB_BOT + 8, x1, TB_BOT + 8, INK, 2);
  // Gleis für den Nachläufer und den Versorgungszug
  line(0, 366, x1, 366, '#8a8f94', 3);
}
// Förderband oben: Aushub wandert nach links zum Schacht
function tbBelt(x0, x1, room) {
  const off = rx(roomOf(room).c) - NLX, g = state.g;
  box(x0, 84, x1 - x0, 8, '#3b3d40', 2, 1.2);
  for (let i = -2; i < (x1 - x0) / 26 + 2; i++) {
    const wx = i * 26 - ((g * 3 + off) % 26);
    const x = x0 + wx; if (x < x0 || x > x1) continue;
    circle(x, 80, 4 + (i % 3), '#7a6450', INK, 0.8);
  }
}
// Ammonit auf dem Band: kommt bei 150 rechts im Nachläufer an, die Geologin nimmt ihn bei 297
const tbAmmo = g => { g %= 480; if (g < 150) return null; if (g < 297) return { x: lerp(640, 200, seg(g, 150, 297)), y: 78, held: false }; if (g < 460) return { x: 214, y: 210, held: true }; return { x: lerp(214, 252, seg(g, 460, 474)), y: lerp(210, 300, seg(g, 460, 474)), held: true, fade: 1 - seg(g, 470, 479) }; };
function ammonit(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(0, 0, 8, '#c9b48f', INK, 1.2); ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU * 0.85); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(0.5, 0, 2.5, 0, TAU * 0.85); ctx.stroke();
  ctx.restore();
}
// Versorgungszug bringt Tübbinge
function tbTrain(g) {
  g %= 480;
  if (g < 60) return { x: -320, load: 3 };
  if (g < 180) return { x: lerp(-320, 360, ease(seg(g, 60, 180))), load: 3 };
  if (g < 260) return { x: 360, load: 3 - Math.floor(seg(g, 180, 258) * 3) };
  if (g < 380) return { x: lerp(360, -320, ease(seg(g, 260, 380))), load: 0 };
  return { x: -320, load: 0 };
}
function tuebbing(x, y, w, h, c = '#a9a59c') { box(x, y, w, h, c, 2, 1.5); line(x + 4, y + h / 2, x + w - 4, y + h / 2, 'rgba(0,0,0,0.2)', 1); }

function drawNachlauf(f) {
  const g = state.g;
  tbLining('nachlauf');
  text('TUNNELBAU', 40, 230, 32, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(240,236,226,0.12)' });
  // Nachläufer-Gerüst
  for (const x of [30, 250, 470, 630]) { line(x, 96, x, 362, '#d9a326', 5); line(x, 96, x, 362, INK, 1); circle(x, 364, 6, '#2d2f33', INK, 1); }
  box(0, 92, RW, 8, '#f0b429', 0, 1.5); box(0, 290, RW, 8, '#f0b429', 0, 1.5);
  tbBelt(0, RW, 'nachlauf');
  // Steuerstand mit Maschinenfahrerin
  box(420, 150, 150, 120, '#e8e6e0', 4, 2); ctx.fillStyle = '#9fc4d6'; ctx.fillRect(430, 160, 130, 60);
  for (let i = 0; i < 3; i++) box(436 + i * 42, 226, 36, 24, '#23384d', 2, 1);
  text('12 m', 454, 243, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
  withAlpha('fahrerin', () => person({ x: 520, foot: 290, s: 0.8, face: 1, shirt: '#f0b429', pants: '#3b3d40', hair: '#3a2c22', hand: { x: 540, y: 236 } }));
  circle(520, 196, 10, '#f3f1ea', INK, 1.2);
  // Geologin mit Helm auf dem Gerüst
  withAlpha('geologin', () => {
    const a = tbAmmo(g), reach = a && !a.held && a.x < 260;
    person({ x: 200, foot: 290, face: 1, shirt: '#d9542b', pants: '#3d5a80', hair: '#7a4a2a', hand: reach ? { x: a.x, y: 82 } : a && a.held ? { x: 214, y: 214 } : { x: 210, y: 236 } });
    ctx.beginPath(); ctx.arc(200, 172, 12, Math.PI, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
    box(240, 272, 30, 18, '#a8763f', 2, 1.2); text('FUNDE', 255, 285, 7, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  });
  withAlpha('ammonit', () => { const a = tbAmmo(g); if (!a) return; ctx.save(); ctx.globalAlpha *= a.fade == null ? 1 : a.fade; ammonit(a.x, a.y, a.held ? 1.1 : 1); ctx.restore(); });
  // Versorgungszug
  withAlpha('versorgung', () => {
    const t = tbTrain(g), x = t.x;
    box(x, 318, 120, 40, '#3e6f9e', 4, 1.8); box(x + 88, 300, 30, 26, '#9fc4d6', 3, 1.2);
    box(x - 150, 336, 140, 22, '#5d6064', 2, 1.5);
    for (let i = 0; i < t.load; i++) tuebbing(x - 146 + i * 46, 318, 42, 18);
    for (const wx of [x + 20, x + 100, x - 130, x - 30]) circle(wx, 362, 6, '#2d2f33', INK, 1);
    if (g % 480 >= 60 && g % 480 < 380) circle(x + 116, 312, 3, f % 6 < 3 ? '#ffb347' : '#8a4a1c', null);
  });
}

// Erektor: setzt unten (20–120), Mitte (120–240), oben (240–360) je einen Tübbing in den freien Ring
const TB_SEGS = [{ y: 260, h: 118 }, { y: 141, h: 119 }, { y: 22, h: 119 }];
function tbErector(g) {
  g %= 480;
  const feeder = { x: TB_SLOT + 120, y: 330 };
  for (let i = 0; i < 3; i++) {
    const a = 20 + i * 120, b = a + 100;
    if (g >= a && g < b) {
      const s = TB_SEGS[i], target = { x: TB_SLOT + 4, y: s.y + s.h / 2 }, k = seg(g, a, b);
      const p = k < 0.3 ? feeder : mix(feeder, target, ease(seg(k, 0.3, 0.85)));
      return { p, seg: i, placed: i, carrying: k < 0.9 };
    }
  }
  return { p: { x: TB_SLOT + 60, y: 200 }, seg: -1, placed: g < 20 ? 0 : g < 360 ? Math.floor((g - 20) / 120) + 1 : 3, carrying: false };
}
function tbPlaced(g) { g %= 480; if (g < 20) return 0; if (g >= 360) return 3; const i = Math.floor((g - 20) / 120); return seg(g, 20 + i * 120, 120 + i * 120) >= 0.9 ? i + 1 : i; }
function drawBohrkopf(f) {
  const g = state.g, gg = g % 480, sh = tbShift(g);
  tbLining('bohrkopf');
  // Schildschwanz: hier entsteht der neue Ring
  ctx.fillStyle = '#4f5257'; ctx.fillRect(TB_SLOT, TB_TOP, TB_P, TB_BOT - TB_TOP);
  box(TB_SLOT, 8, TB_P + 4, 14, '#6f7378', 0, 1.5); box(TB_SLOT, TB_BOT, TB_P + 4, 14, '#6f7378', 0, 1.5);
  // neuer Ring im Bau (wandert beim Vorschub mit nach links)
  const n = tbPlaced(g);
  for (let i = 0; i < n; i++) tuebbing(TB_SLOT - sh, TB_SEGS[i].y, TB_P, TB_SEGS[i].h, '#b4b0a6');
  withAlpha('tbm', () => {
  // Schild
  ctx.fillStyle = '#6f7378'; ctx.fillRect(TB_SHIELD, 8, 600 - TB_SHIELD, 384); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(TB_SHIELD, 8, 600 - TB_SHIELD, 384);
  ctx.fillStyle = '#4f5257'; ctx.fillRect(TB_SHIELD + 6, TB_TOP, 600 - TB_SHIELD - 12, TB_BOT - TB_TOP);
  // Vortriebszylinder zwischen Schild und letztem Ring
  const reach = gg < 20 ? TB_P * (1 - seg(gg, 0, 20)) : gg >= 400 ? sh : 0;
  for (const y of [60, 200, 340]) { box(TB_SHIELD - 4 - reach, y - 6, 18 + reach, 12, '#c9ccd0', 2, 1.2); }
  text('IDA', 520, 70, 26, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#f0b429' });
  // Schnecke vom Bohrkopf hoch zum Band
  ctx.save(); ctx.translate(590, 350); ctx.rotate(-2.12); box(0, -9, 300, 18, '#8a8f94', 4, 1.5);
  for (let i = 0; i < 12; i++) line(i * 25 + (gg * 2) % 25, -8, i * 25 + (gg * 2) % 25 + 8, 8, INK, 1); ctx.restore();
  tbBelt(0, 446, 'bohrkopf');
  // Bohrkopf mit Rollenmeißeln, dreht sich
  box(600, 4, 24, 392, '#d9542b', 4, 2);
  for (let i = 0; i < 9; i++) { const y = ((i * 46 + gg * 4) % 414) - 7; if (y > 8 && y < 390) circle(624, y, 6, '#3b3d40', INK, 1); }
  ctx.fillStyle = '#4d3e31'; ctx.fillRect(630, 0, 10, RH);
  for (let i = 0; i < 6; i++) circle(612, 360 + ((gg * 3 + i * 9) % 30), 2.5, '#7a6450', null);
  });
  // Erektor mit Tübbing
  withAlpha('erektor', () => {
    const e = tbErector(g), c = { x: TB_SHIELD + 50, y: 200 };
    circle(c.x, c.y, 22, '#3b3d40', INK, 1.5);
    limb(c.x, c.y, e.p.x + 30, e.p.y, 10, '#f0b429');
    box(e.p.x + 18, e.p.y - 14, 24, 28, '#5d6064', 3, 1.2);
    if (e.carrying) tuebbing(e.p.x - 4, e.p.y - TB_SEGS[e.seg].h / 2, TB_P - 10, TB_SEGS[e.seg].h, '#b4b0a6');
    // Stapel am Zubringer
    for (let i = 0; i < 3 - Math.max(n, e.carrying ? e.seg + 1 : n); i++) tuebbing(TB_SLOT + 100, 360 - i * 10, 70, 9);
  });
  withAlpha('mineur', () => {
    person({ x: 470, foot: TB_BOT, s: 0.85, face: -1, shirt: '#f0b429', pants: '#3b3d40', hair: '#2a1f18', hand: { x: 452, y: TB_BOT - 66 } });
    box(444, TB_BOT - 74, 10, 14, '#2a2723', 2, 1); circle(449, TB_BOT - 70, 1.6, '#7fe08a', null);
    ctx.beginPath(); ctx.arc(470, TB_BOT - 106, 11, Math.PI, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  });
}

registerRoom({
  key: 'nachlauf', name: 'Tunnelbau: Nachläufer', level: 'UG 2',
  hitOrder: ['ammonit', 'geologin', 'fahrerin', 'versorgung'],
  draw: drawNachlauf,
  robots: [
    { id: 'versorgung', name: 'Versorgungszug', bereich: 'Bau', aera: 'Technik', typ: 'Schienenfahrzeug im Tunnel',
      fakt: 'Ein kleiner Zug bringt die Betonteile für die Tunnelringe von hinten zur Bohrmaschine. Der Aushub fährt auf dem Förderband in die andere Richtung zum Schacht und wird dort nach oben gehoben.',
      echt: 'Echt. Gefahren wird er meist von einem Menschen, einige Baustellen erproben automatische Züge.',
      note: 'Bringt drei Tübbinge, lädt ab und fährt leer zurück.', color: '#3e6f9e',
      quelle: 'https://de.wikipedia.org/wiki/Tunnelvortriebsmaschine',
      box: () => { const t = tbTrain(state.g); return [NLX + t.x - 150, NLY + 296, 272, 70]; } },
    { id: 'fahrerin', name: 'Maschinenfahrerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch im Steuerstand',
      fakt: 'Sie steuert die Tunnelbohrmaschine vom Steuerstand aus. Auf den Bildschirmen sieht sie Druck, Richtung und wie weit die Maschine heute gekommen ist.',
      note: 'Heute: 12 Meter.', color: '#f0b429', box: () => [NLX + 500, NLY + 186, 50, 104] },
    { id: 'geologin', name: 'Geologin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Helm',
      fakt: 'Sie prüft, welchen Boden die Maschine gerade durchbohrt, und nimmt Proben vom Förderband.',
      note: 'Hat etwas auf dem Band entdeckt und legt es in die Kiste „Funde“.', color: '#d9542b', box: () => [NLX + 180, NLY + 160, 50, 130] },
    { id: 'ammonit', name: 'Ammonit', bereich: 'Geschichte', aera: 'Millionen Jahre alt', typ: 'Versteinerung',
      fakt: 'Ammoniten sind versteinerte Meerestiere mit einer schneckenförmigen Schale. Sie lebten vor vielen Millionen Jahren, als Teile Deutschlands unter Wasser lagen.',
      echt: 'Echt. Beim Tunnelbau tauchen immer wieder Fossilien auf, dann werden Fachleute gerufen.',
      note: 'Fährt auf dem Förderband mit, bis die Geologin ihn herausfischt.', color: '#c9b48f',
      quelle: 'https://de.wikipedia.org/wiki/Ammoniten',
      box: () => { const a = tbAmmo(state.g); return a ? [NLX + a.x - 12, NLY + a.y - 12, 24, 24] : [-99999, -99999, 1, 1]; } },
  ],
});
registerRoom({
  key: 'bohrkopf', name: 'Tunnelbau: Bohrkopf', level: 'UG 2',
  hitOrder: ['mineur', 'erektor', 'tbm'],
  draw: drawBohrkopf,
  robots: [
    { id: 'tbm', name: 'Tunnelbohrmaschine', bereich: 'Bau', aera: 'seit den 1950ern', typ: 'Schildmaschine mit Schneidrad',
      fakt: 'Vorn dreht sich das Schneidrad und löst mit Rollenmeißeln den Boden. Dahinter schützt ein Stahlschild die Arbeit. Die Maschine für die neue U-Bahn in Wien heißt Debohra, hat ein Schneidrad von knapp sieben Metern und schafft bis zu zehn Meter am Tag.',
      echt: 'Echt, nur viel kürzer gezeichnet: Mit allem, was hinten dranhängt, ist so eine Maschine über 100 Meter lang. Jede Tunnelbohrmaschine bekommt einen Namen, oft einen Frauennamen.',
      note: 'Heißt Ida und gräbt nach rechts. Auf keinem Plan steht, was dort hinter der Erde liegt.', color: '#d9542b',
      quelle: 'https://www.wienerlinien.at/u2xu5/so-bauen-wir',
      box: () => [BKX + 394, BKY + 4, 246, 392] },
    { id: 'erektor', name: 'Tübbing-Erektor', bereich: 'Bau', aera: 'Technik', typ: 'Greifarm, der Tunnelringe setzt',
      fakt: 'Der Tunnel bekommt seine Wand aus Betonteilen, den Tübbingen. Ein Greifarm hinter dem Schneidrad hebt sie an die richtige Stelle und setzt sie zu einem Ring zusammen. In Wien bilden sechs Tübbinge einen Ring. Danach schieben Zylinder die Maschine am fertigen Ring nach vorn.',
      echt: 'Echt. Meist steuert ein Mensch den Arm mit einer Fernbedienung, manche Maschinen setzen die Tübbinge schon selbst. Von der Seite sieht man hier nur drei der sechs Teile.',
      note: 'Setzt unten, in der Mitte und oben je einen Tübbing. Dann schiebt sich die Maschine einen Ring weiter.', color: '#f0b429',
      quelle: 'https://www.wienerlinien.at/u2xu5/so-bauen-wir',
      box: () => { const e = tbErector(state.g); return [BKX + TB_SHIELD + 20, BKY + Math.min(e.p.y - 60, 170), Math.max(60, e.p.x - TB_SHIELD + 30), 120]; } },
    { id: 'mineur', name: 'Mineur', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Fernbedienung',
      fakt: 'Mineure sind die Fachleute im Tunnelbau. Er steuert den Erektor mit einer Fernbedienung.',
      note: 'Steht sicher hinter dem Arm.', color: '#f0b429', box: () => [BKX + 450, BKY + 260, 44, 118] },
  ],
});
