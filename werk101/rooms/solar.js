/* Raum: Solarpark (Außengelände, links vom Energiepark)
   Hauptfiguren: Installationsroboter setzt Modul für Modul auf ein neues Gestell, Drohne mit Wärmebildkamera prüft die fertige Reihe.
   Gag: Die Wärmebildkamera zeigt einen heißen Fleck. Schuld ist die Taube, die auf dem Modul sitzt.
   Läuft auf der globalen Uhr state.g. Querverweis: senkrechte Module mit Feldstreifen (Agri-PV) zum Feld hin, Speicher für den Strom. */
const SPX = rx(roomOf('solar').c), SPY = ry(roomOf('solar').r);
const SP_SLOTS = 8, SP_X0 = 266, SP_W = 45, SP_STEP = 55, SP_START = 12;
const spSlotX = i => SP_X0 + i * SP_W + SP_W / 2;
// Reihenfolge: von rechts nach links, Slot 7 zuerst
const spOrder = j => SP_SLOTS - 1 - j;
const spPlaced = (j, g) => g >= SP_START + j * SP_STEP + 40;
function spBot(g) {
  g %= 480;
  if (g < SP_START) return { x: 700, phase: 'fahrt', j: -1 };
  const j = Math.min(SP_SLOTS - 1, Math.floor((g - SP_START) / SP_STEP)), t = g - SP_START - j * SP_STEP;
  if (g >= SP_START + SP_SLOTS * SP_STEP) return { x: lerp(spSlotX(0), -90, ease(seg(g, SP_START + SP_SLOTS * SP_STEP, 476))), phase: 'fahrt', j: SP_SLOTS };
  const prev = j === 0 ? 700 : spSlotX(spOrder(j - 1)), here = spSlotX(spOrder(j));
  if (t < 15) return { x: lerp(prev, here, ease(seg(t, 0, 15))), phase: 'fahrt', j };
  if (t < 25) return { x: here, phase: 'greifen', j, k: seg(t, 15, 25) };
  if (t < 40) return { x: here, phase: 'heben', j, k: seg(t, 25, 40) };
  return { x: here, phase: 'zurueck', j, k: seg(t, 40, 55) };
}
function spArmTip(b) {
  const stack = { x: b.x - 26, y: 300 }, slot = { x: b.x, y: 274 };
  if (b.phase === 'greifen') return mix(slot, stack, ease(b.k));
  if (b.phase === 'heben') return mix(stack, slot, ease(b.k));
  return slot;
}
const spDrone = g => ({ x: 300 + 290 * (0.5 - 0.5 * Math.cos(TAU * (g % 480) / 480)), y: 150 + 6 * Math.sin(TAU * g / 60) });
const SP_TAUBE = 478;
const spInsetX = d => (d.x > 450 ? d.x - 94 : d.x + 30);
function spModule(x, y, w) {
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 6, y + 12); ctx.lineTo(x - 6, y + 12); ctx.closePath(); paint('#23384d', INK, 1.2);
  line(x + w / 2, y, x + w / 2 - 3, y + 12, 'rgba(127,211,255,0.45)', 1);
}
function drawSolar(f) {
  const g = state.g, gg = g % 480;
  ctx.fillStyle = '#8fbf6c'; ctx.fillRect(0, 330, RW, 70); line(0, 330, RW, 330, INK, 1.5);
  ctx.fillStyle = '#7aae5a'; for (let i = 0; i < 40; i++) { const x = rnd(i + 50) * RW, y = 340 + rnd(i + 55) * 55; ctx.fillRect(x, y, 2, 5); }
  text('SOLARPARK', 300, 70, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Senkrechte Module mit Feldstreifen dazwischen (Agri-PV)
  withAlpha('agripv', () => {
    for (let i = 0; i < 4; i++) { const x = 18 + i * 34; box(x, 246, 30, 62, '#2a3f55', 1, 1.5); line(x + 15, 246, x + 15, 308, 'rgba(127,211,255,0.4)', 1); }
    for (const x of [16, 84, 152]) box(x - 2, 240, 4, 90, '#8a8f94', 0, 1.2);
    for (let i = 0; i < 18; i++) { const x = 14 + i * 8; line(x, 330, x + 1, 312, '#c9a640', 1.5); circle(x + 1, 311, 2, '#e0c060', null); }
  });
  // Batteriespeicher
  withAlpha('speicher', () => {
    box(176, 280, 74, 50, '#e8e6e0', 2, 1.8); for (let i = 0; i < 3; i++) line(190 + i * 22, 284, 190 + i * 22, 326, 'rgba(42,39,35,0.3)', 1);
    const lvl = 0.25 + 0.7 * (state.wetter === 'abend' ? 1 - seg(gg, 0, 480) * 0.5 : seg(gg, 0, 480));
    box(234, 288, 10, 30, '#2a2723', 1, 1); ctx.fillStyle = '#7fe08a'; ctx.fillRect(236, 316 - 26 * lvl, 6, 26 * lvl);
    text('SPEICHER', 205, 300, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  });
  // fertige Reihe weiter hinten, mit Taube
  for (const x of [276, 446, 616]) box(x - 2, 236, 4, 94, '#9aa0a5', 0, 1);
  for (let i = 0; i < 8; i++) spModule(270 + i * 44, 222, 40);
  withAlpha('taube', () => {
    const bob = gg % 24 < 12 ? 0 : 2, flat = Math.abs(spDrone(g).x - SP_TAUBE) < 30;
    ctx.beginPath(); ctx.ellipse(SP_TAUBE, 214, 9, 6, 0, 0, TAU); paint('#9aa3ad', INK, 1.2);
    circle(SP_TAUBE + 8, 208 + bob, 4, '#9aa3ad', INK, 1); circle(SP_TAUBE + 9, 207 + bob, 1, INK, null);
    line(SP_TAUBE + 12, 208 + bob, SP_TAUBE + 15, 209 + bob, '#d98f3a', 1.5); line(SP_TAUBE - 9, 213, SP_TAUBE - 15, 211, INK, 2);
    if (flat) { circle(SP_TAUBE + 2, 202, 2, '#ffffff', null); }
  });
  // neues Gestell im Vordergrund
  for (const x of [270, 400, 530, 620]) box(x - 3, 296, 6, 34, '#8a8f94', 0, 1.2);
  line(262, 296, 632, 296, INK, 4); line(262, 296, 632, 296, '#b9bcc0', 2);
  const gb = heldG('maximo', g) % 480, fade = 1 - seg(gb, 462, 479);
  for (let j = 0; j < SP_SLOTS; j++) if (spPlaced(j, gb)) { ctx.save(); ctx.globalAlpha *= fade; spModule(SP_X0 + spOrder(j) * SP_W + 4, 284, SP_W - 4); ctx.restore(); }
  // Installationsroboter
  withAlpha('maximo', () => {
    const b = spBot(gb), x = b.x, tip = spArmTip(b);
    const left = b.j < 0 ? SP_SLOTS : SP_SLOTS - b.j - (b.phase === 'heben' || b.phase === 'zurueck' ? 1 : 0);
    box(x - 40, 340, 80, 16, '#3b3d40', 8, 1.5); for (let i = 0; i < 5; i++) circle(x - 32 + i * 16, 348, 4, '#5d6064', INK, 1);
    box(x - 36, 318, 72, 22, '#f0b429', 3, 1.8);
    for (let i = 0; i < Math.max(0, left); i++) box(x - 34, 314 - i * 3, 22, 3, '#2a3f55', 0, 0.8);
    box(x + 6, 300, 12, 18, '#3b3d40', 2, 1.2);
    const S = { x: x + 12, y: 300 }, W = { x: tip.x, y: tip.y - 10 }, E = ik2(S, W, 30, 30);
    limb(S.x, S.y, E.x, E.y, 7, '#f3f1ea'); limb(E.x, E.y, W.x, W.y, 6, '#f3f1ea'); circle(E.x, E.y, 4, '#3b3d40');
    box(tip.x - 16, tip.y - 10, 32, 5, '#5d6064', 1, 1);
    if (b.phase === 'heben') spModule(tip.x - 20, tip.y - 6, 40);
    circle(x + 30, 324, 2, gb % 8 < 4 ? '#7fe08a' : '#2d5b33', null);
  });
  // Drohne mit Wärmebildkamera
  if (state.wetter !== 'regen') withAlpha('thermo', () => {
    const d = spDrone(g);
    ctx.fillStyle = 'rgba(255,140,60,0.08)'; ctx.beginPath(); ctx.moveTo(d.x - 4, d.y + 6); ctx.lineTo(d.x + 4, d.y + 6); ctx.lineTo(d.x + 30, 222); ctx.lineTo(d.x - 30, 222); ctx.closePath(); ctx.fill();
    quad(d.x, d.y, g, { color: '#3b3d40', w: 48 }); box(d.x - 4, d.y + 3, 8, 6, '#2a2723', 2, 1);
    // kleines Wärmebild neben der Drohne
    const ix = spInsetX(d), iy = d.y - 58;
    box(ix, iy, 64, 38, '#2a2723', 3, 1.5);
    for (let i = 0; i < 6; i++) for (let k = 0; k < 2; k++) { ctx.fillStyle = '#2f4fa8'; ctx.fillRect(ix + 4 + i * 10, iy + 4 + k * 14, 9, 12); }
    if (Math.abs(d.x - SP_TAUBE) < 70) { circle(ix + 4 + 3 * 10 + 4.5, iy + 10, 6, '#ff8a24', null); circle(ix + 4 + 3 * 10 + 4.5, iy + 10, 3, '#ffe066', null); }
    text('WÄRMEBILD', ix + 32, iy + 36, 7, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  });
}

registerRoom({
  key: 'solar', name: 'Solarpark', level: 'Außengelände',
  hitOrder: ['taube', 'thermo', 'maximo', 'speicher', 'agripv'],
  draw: drawSolar,
  glow(f) {
    glow(240, 300, 18, 'rgba(110,255,130,0.7)');
    const b = spBot(heldG('maximo', state.g) % 480); glow(b.x + 30, 324, 14, 'rgba(110,255,130,0.8)');
    if (state.wetter !== 'regen') { const d = spDrone(state.g); glow(d.x + 6, d.y - 3, 14, 'rgba(110,255,130,0.8)'); glow(spInsetX(d) + 32, d.y - 39, 34, 'rgba(120,150,255,0.5)'); }
  },
  robots: [
    { id: 'maximo', name: 'Installationsroboter für Solarmodule', bereich: 'Energie', aera: 'seit 2024', typ: 'Kettenfahrzeug mit Roboterarm',
      fakt: 'Solarmodule für große Parks wiegen über 30 Kilo, und ein Park braucht Hunderttausende davon. Seit 2024 hebt ein Roboter auf Ketten sie vom Stapel auf seinem Rücken und setzt sie auf das Gestell. Eine Kamera mit KI findet die genaue Stelle. Menschen schrauben die Module danach fest.',
      echt: 'Realistisch, der Roboter wird in den USA eingesetzt. Hier ist er kleiner gezeichnet als in echt.',
      note: 'Fährt das neue Gestell von rechts nach links ab und setzt acht Module. Dann holt er Nachschub, und die Reihe beginnt von vorn.', color: '#f0b429',
      quelle: 'https://www.aes.com/newsroom/aes-launches-first-ai-enabled-solar-installation-robot',
      box: () => { const b = spBot(heldG('maximo', state.g) % 480); return [SPX + b.x - 42, SPY + 262, 84, 96]; } },
    { id: 'thermo', name: 'Drohne mit Wärmebildkamera', bereich: 'Inspektion', aera: 'seit den 2010ern', typ: 'Quadrocopter mit Wärmebildkamera',
      fakt: 'Defekte Solarmodule werden heiß. Eine Wärmebildkamera sieht das von oben sofort: Kaputte Stellen leuchten orange, gesunde Module bleiben blau. So prüft eine Drohne Tausende Module in einer Stunde.',
      echt: 'Echt. Auch Laub und Vogeldreck auf dem Glas erzeugen solche heißen Flecken. Bei Regen fliegt sie hier nicht.',
      note: 'Fliegt über der hinteren Reihe hin und her. Über der Taube zeigt das Wärmebild einen heißen Fleck.', color: '#3b3d40',
      quelle: 'https://en.wikipedia.org/wiki/Thermography',
      box: () => { const d = spDrone(state.g); return state.wetter === 'regen' ? [-99999, -99999, 1, 1] : [SPX + Math.min(d.x - 28, spInsetX(d)), SPY + d.y - 62, 128, 74]; } },
    { id: 'taube', name: 'Taube', bereich: 'Tier', aera: 'Gast', typ: 'Stadttaube',
      fakt: 'Tauben sitzen gern auf Solarmodulen, weil die Platten warm sind und man von oben gut sieht.',
      echt: 'Echt. Wo ein Vogel sitzt oder etwas fallen lässt, kommt weniger Licht an. Die Stelle wird wärmer, das zeigt die Drohne.',
      note: 'Sitzt seelenruhig auf der hinteren Reihe.', color: '#9aa3ad',
      box: () => [SPX + SP_TAUBE - 12, SPY + 200, 30, 22] },
    { id: 'speicher', name: 'Batteriespeicher', bereich: 'Energie', aera: 'Technik', typ: 'Container voller Akkus',
      fakt: 'Mittags liefert ein Solarpark oft mehr Strom, als gerade gebraucht wird. Der Speicher nimmt ihn auf und gibt ihn abends wieder ab.',
      echt: 'Echt. Die Anzeige füllt sich tagsüber und leert sich abends.',
      note: 'Kein Roboter, aber ohne ihn gäbe es abends keinen Solarstrom.', color: '#e8e6e0',
      box: () => [SPX + 174, SPY + 278, 78, 54] },
    { id: 'agripv', name: 'Senkrechte Solarmodule', bereich: 'Landwirtschaft', aera: 'Technik', typ: 'Agri-PV: Strom und Acker auf einer Fläche',
      fakt: 'Diese Module stehen senkrecht wie ein Zaun und fangen auf beiden Seiten Licht ein. Zwischen den Reihen wächst weiter Getreide, und die Landmaschinen passen hindurch.',
      echt: 'Echt. In Deutschland gibt es solche Anlagen auf Äckern und Weiden.',
      note: 'Steht am Rand zum Feld hin. Daneben wächst das Getreide.', color: '#2a3f55',
      box: () => [SPX + 12, SPY + 238, 150, 94] },
  ],
});
