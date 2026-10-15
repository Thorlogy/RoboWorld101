/* Marianengraben rechts neben dem Ozean (c 26–28). Oben das Meer bis etwa 6.000 m (Reihe 7), darunter der Graben
   in Reihe 8 und 9 bis zum Challenger-Tief (fast 11.000 m). Die Tiefe ist stark verkürzt (grTiefe), Tiere und Fahrzeuge
   sind vergrößert. Ablauf pro Runde (state.g): Lander sinkt 0–80 herab, liegt 80–400 am Grund (Schneckenfische kommen 120–380),
   steigt 400–479 wieder auf. Nereus nimmt 140–260 mit dem Arm eine Probe. Präfix gr/GR_. */
const GR_X0 = rx(26), GR_X1 = rx(28) + RW, GR_M = rx(27) + RW / 2, GR_BOT = ry(9) + RH - 24;
const GR_T = [[0, SH_WY], [1000, SH_WY + 110], [6000, SH_BOT], [8000, ry(8) + 330], [11000, GR_BOT]];
function grTiefe(d) {
  for (let i = 1; i < GR_T.length; i++) if (d <= GR_T[i][0]) return lerp(GR_T[i - 1][1], GR_T[i][1], (d - GR_T[i - 1][0]) / (GR_T[i][0] - GR_T[i - 1][0]));
  return GR_BOT;
}
// Grabenwände: oben breit (Tiefseeboden bei etwa 6.000 m), unten schmal
const GR_WAND = [[0, SH_BOT - 20], [0.12, SH_BOT - 20], [0.3, ry(8) + 170], [0.4, ry(9) + 150], [0.45, GR_BOT]];
const grWandX = (s, t) => lerp(GR_X0, GR_X1, s < 0 ? t : 1 - t);
function grFarbe(d, ab) {
  const k = clamp(d / 6000, 0, 1);
  return ab ? `rgb(${Math.round(22 - 16 * k)},${Math.round(48 - 38 * k)},${Math.round(74 - 56 * k)})` : `rgb(${Math.round(63 - 55 * k)},${Math.round(111 - 95 * k)},${Math.round(142 - 112 * k)})`;
}

/* ---------- Fahrzeuge ---------- */
const grLanderY = g => g < 80 ? lerp(ry(8) - 60, grTiefe(8000) - 10, ease(g / 80)) : g < 400 ? grTiefe(8000) - 10 : lerp(grTiefe(8000) - 10, ry(8) - 60, ease((g - 400) / 79));
function grWandBei(y) {   // linke Grabenwand: x auf Höhe y
  for (let i = 1; i < GR_WAND.length; i++) if (y <= GR_WAND[i][1]) return grWandX(-1, lerp(GR_WAND[i - 1][0], GR_WAND[i][0], (y - GR_WAND[i - 1][1]) / (GR_WAND[i][1] - GR_WAND[i - 1][1])));
  return grWandX(-1, GR_WAND[GR_WAND.length - 1][0]);
}
const GR_LX = grWandBei(grTiefe(8000)) + 70;
function grLander(g) {
  const y = grLanderY(g), x = GR_LX;
  // Auftriebskörper oben, Rahmen, Kamera mit Licht, Köder unten; Ballastgewichte bleiben beim Aufstieg liegen
  for (const dx of [-26, 0, 26]) circle(x + dx, y - 92, 13, '#f0b429', INK, 1.5);
  line(x - 30, y - 80, x - 38, y, INK, 3); line(x + 30, y - 80, x + 38, y, INK, 3); line(x - 34, y - 40, x + 34, y - 40, INK, 2.5);
  box(x - 14, y - 72, 28, 22, '#3b3d40', 3, 1.5); circle(x + 10, y - 61, 4, '#7fd3ff', null);
  box(x + 20, y - 58, 10, 8, '#e8e4da', 1, 1);
  box(x - 6, y - 14, 12, 12, '#8a6a3a', 2, 1);
  const unten = g >= 80 && g < 400;
  if (unten || g < 80) for (const dx of [-38, 38]) box(x + dx - 7, y - 2, 14, 8, '#5d6064', 1, 1);
  else for (const dx of [-38, 38]) box(x + dx - 7, grTiefe(8000) - 12, 14, 8, '#5d6064', 1, 1);
  if (unten) { ctx.fillStyle = 'rgba(255,250,220,0.12)'; ctx.beginPath(); ctx.moveTo(x + 30, y - 56); ctx.lineTo(x + 230, y - 10); ctx.lineTo(x + 230, y + 30); ctx.lineTo(x + 30, y - 50); ctx.closePath(); ctx.fill(); }
}
function grSchneckenfisch(x, y, s, dir, g) {
  // durchsichtig rosa, großer Kopf, schmaler Schwanz, keine Schuppen
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  const w = Math.sin(g / 3) * 3;
  ctx.beginPath(); ctx.moveTo(14, 0); ctx.quadraticCurveTo(12, -11, -2, -10); ctx.quadraticCurveTo(-26, -6, -46, w); ctx.quadraticCurveTo(-26, 7, -2, 9); ctx.quadraticCurveTo(12, 9, 14, 0); ctx.closePath();
  ctx.fillStyle = 'rgba(244,196,206,0.85)'; ctx.fill(); ctx.strokeStyle = 'rgba(120,70,80,0.7)'; ctx.lineWidth = 1.2; ctx.stroke();
  circle(6, -3, 2, '#2a2723', null); ctx.restore();
}
const GR_NX = GR_M + 60;
function grNereus(g) {
  const y = GR_BOT - 70 + Math.sin(g / 20) * 3, x = GR_NX;
  // Glasfaser, dünn wie ein Haar, geht bis zum Schiff hinauf
  line(x + 10, y - 40, x + 10, ry(9) - 20, 'rgba(240,240,220,0.35)', 1);
  // zwei Rümpfe übereinander (Tandemrumpf), gelb
  box(x - 60, y - 40, 120, 26, '#f0b429', 10, 2); box(x - 60, y - 10, 120, 26, '#f0b429', 10, 2);
  box(x - 40, y - 16, 80, 8, '#3b3d40', 1, 1);
  for (const dx of [-50, 50]) box(x + dx - 6, y - 50, 12, 10, '#5d6064', 1, 1);   // Strahlruder
  circle(x - 56, y - 2, 5, '#fff8d8', INK, 1);
  ctx.fillStyle = 'rgba(255,250,220,0.14)'; ctx.beginPath(); ctx.moveTo(x - 56, y - 2); ctx.lineTo(x - 260, GR_BOT); ctx.lineTo(x - 60, GR_BOT); ctx.closePath(); ctx.fill();
  // Greifarm: holt eine Bodenprobe
  const a = g >= 140 && g < 260 ? Math.sin(Math.PI * (g - 140) / 120) : 0;
  const hx = x - 70 - 20 * a, hy = y + 20 + 40 * a;
  limb(x - 40, y + 14, x - 66, y + 24, 4, '#8a8f94'); limb(x - 66, y + 24, hx, hy, 4, '#8a8f94');
  line(hx - 4, hy, hx - 8, hy + 7, INK, 2); line(hx + 4, hy, hx + 8, hy + 7, INK, 2);
}
function grD2(g) {
  // Deep Discoverer: weißer Kastenrahmen mit Auftriebsblock, viele Lampen vorn, Kabel zum Schiff
  const y = grTiefe(3700) - 10 + Math.sin(g / 24) * 4, x = GR_X0 + 260;
  line(x, y - 30, GR_X0 + 430, SH_WY, 'rgba(240,200,80,0.6)', 1.5);
  box(x - 40, y - 34, 80, 22, '#ecebe6', 2, 1.5);
  box(x - 40, y - 12, 80, 30, '#3b3d40', 1, 1.5);
  for (const dy of [-6, 4]) circle(x + 42, y + dy, 3.5, '#fff8d8', INK, 0.8);
  circle(x + 30, y + 10, 4, '#23384d', null);
  ctx.fillStyle = 'rgba(255,250,220,0.16)'; ctx.beginPath(); ctx.moveTo(x + 42, y); ctx.lineTo(x + 230, y - 60); ctx.lineTo(x + 230, y + 60); ctx.closePath(); ctx.fill();
}
function grQualle(g) {
  // Crossota (vermutlich): roter Schirm, gelbe Flecken im Inneren, kurze und lange Tentakel
  const x = GR_X0 + 420, y = grTiefe(3700) - 6 + Math.sin(g / 30) * 8, p = Math.sin(g / 8) * 0.12;
  ctx.strokeStyle = 'rgba(230,120,110,0.75)'; ctx.lineWidth = 1;
  for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(x + i * 3, y + 2); ctx.quadraticCurveTo(x + i * 6, y + 20, x + i * 9 + Math.sin(g / 6 + i) * 3, y + 34); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(x, y, 22 * (1 + p), 12 * (1 - p), 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = 'rgba(214,72,60,0.85)'; ctx.fill(); ctx.strokeStyle = 'rgba(120,30,25,0.8)'; ctx.stroke();
  for (const dx of [-10, 0, 10]) circle(x + dx, y - 5, 2.6, '#f2d04a', null);
}
function grDumbo(g) {
  // Dumbo-Krake: Flossen wie Ohren, schwebt langsam
  const x = GR_X1 - 300 + Math.sin(g / 60) * 30, y = grTiefe(4500) + Math.sin(g / 18) * 6, o = Math.sin(g / 5) * 0.4;
  ctx.fillStyle = '#e8a08a';
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(x + s * 12, y - 14); ctx.rotate(s * (0.4 + o)); ctx.beginPath(); ctx.ellipse(s * 8, 0, 10, 5, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.beginPath(); ctx.ellipse(x, y - 10, 14, 16, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.quadraticCurveTo(x, y + 22, x + 16, y); ctx.closePath(); ctx.fill();
  circle(x - 5, y - 10, 2, '#2a2723', null); circle(x + 5, y - 10, 2, '#2a2723', null);
}

/* ---------- Bild ---------- */
function grBild(g) {
  const ab = istDunkel();
  ctx.fillStyle = himmelFarben()[2]; ctx.fillRect(GR_X0, GROUND - 8, GR_X1 - GR_X0, SH_WY - GROUND + 9);
  // Wasser oben, nach unten dunkler
  for (let d = 0; d < 6000; d += 500) { ctx.fillStyle = grFarbe(d, ab); ctx.fillRect(GR_X0, grTiefe(d), GR_X1 - GR_X0, grTiefe(d + 500) - grTiefe(d) + 1); }
  // Gestein um den Graben, dann das Wasser im Graben
  // weiche Übergänge zum Ozean links und zur Arktis rechts
  for (const [x0, x1, farbe] of [[GR_X0, GR_X0 + 320, ab ? '21,47,72' : '65,114,145'], [GR_X1, GR_X1 - 320, ab ? '16,34,54' : '47,86,112']]) {
    const gr = ctx.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, `rgba(${farbe},1)`); gr.addColorStop(1, `rgba(${farbe},0)`);
    ctx.fillStyle = gr; ctx.fillRect(Math.min(x0, x1), SH_WY, 320, SH_BOT - SH_WY);
  }
  // Meeresboden als Band wie beim Ozean; um den Graben liegt das normale Erdreich
  ctx.fillStyle = '#5b4f45'; ctx.fillRect(GR_X0 - WALL, SH_BOT - 20, GR_X1 - GR_X0 + 2 * WALL, 20);
  ctx.beginPath(); GR_WAND.forEach(([t, y], i) => (i ? ctx.lineTo(grWandX(-1, t), y) : ctx.moveTo(grWandX(-1, t), y)));
  for (let i = GR_WAND.length - 1; i >= 0; i--) ctx.lineTo(grWandX(1, GR_WAND[i][0]), GR_WAND[i][1]);
  ctx.closePath(); ctx.fillStyle = ab ? '#040810' : '#081018'; ctx.fill();
  ctx.strokeStyle = '#5b4f45'; ctx.lineWidth = 6; ctx.stroke();
  // Tiefenleiste
  for (const [d, t] of [[200, '200 m · ab hier kaum noch Licht'], [1000, '1.000 m · stockdunkel'], [3700, '3.700 m'], [6000, '6.000 m · Tiefseeboden'], [8000, '8.000 m'], [10935, 'fast 11.000 m · Challenger-Tief']]) {
    const dy = d > 10000 ? -40 : d === 8000 ? 60 : 0, y = grTiefe(d) + dy, x = d > 6000 ? grWandBei(y) + 8 : GR_X0 + 12;
    line(x, y, x + 18, y, 'rgba(230,245,255,0.6)', 1.5);
    text(t, x + 24, y + 4, 12, { family: '"IBM Plex Mono", monospace', weight: 500, color: 'rgba(230,245,255,0.7)' });
  }
  withAlpha('marianengraben', () => text('MARIANENGRABEN', GR_M - 250, ry(8) + 60, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(230,245,255,0.18)' }));
  text('Tiefe stark verkürzt · Tiere und Fahrzeuge vergrößert', GR_M - 250, ry(8) + 84, 12, { family: '"IBM Plex Mono", monospace', color: 'rgba(230,245,255,0.45)' });
  // Forschungsschiff an der Oberfläche (Maßstab des Ozeans, 1 : 12)
  withAlpha('okeanos', () => {
    const x = GR_X0 + 330, y = SH_WY + Math.sin(g / 30) * 2;
    ctx.beginPath(); ctx.moveTo(x, y - 40); ctx.lineTo(x + 390, y - 40); ctx.lineTo(x + 370, y + 30); ctx.lineTo(x + 30, y + 30); ctx.closePath(); paint('#ecebe6', INK, 2);
    ctx.save(); ctx.clip(); ctx.fillStyle = '#3b3d40'; ctx.fillRect(x - 5, y + 6, 400, 30); ctx.restore();
    box(x + 220, y - 96, 120, 56, '#ecebe6', 2, 2); for (let i = 0; i < 4; i++) box(x + 230 + i * 28, y - 86, 18, 10, istDunkel() ? '#ffe7a3' : '#23384d', 1, 1);
    line(x + 270, y - 96, x + 270, y - 150, INK, 3); circle(x + 270, y - 156, 9, '#ecebe6', INK, 1.5);
    line(x + 40, y - 40, x + 80, y - 110, INK, 4); line(x + 120, y - 40, x + 80, y - 110, INK, 4);   // A-Rahmen am Heck
    line(x + 80, y - 110, x + 100, SH_WY, 'rgba(240,200,80,0.8)', 1.5);
  });
  mrWellen(GR_X0, GR_X1, SH_WY, g, 'rgba(230,245,255,0.7)');
  withAlpha('d2', () => grD2(g));
  withAlpha('crossota', () => grQualle(g));
  withAlpha('dumbo', () => grDumbo(g));
  // Plastiktüte ganz unten (echter Fund)
  withAlpha('tuete', () => {
    const x = GR_M + 230, y = GR_BOT - 6;
    ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.quadraticCurveTo(x - 22, y - 22, x - 8, y - 26); ctx.lineTo(x - 4, y - 34); ctx.lineTo(x + 2, y - 26); ctx.quadraticCurveTo(x + 20, y - 20, x + 16, y); ctx.closePath();
    ctx.fillStyle = 'rgba(235,238,240,0.55)'; ctx.fill(); ctx.strokeStyle = 'rgba(200,210,215,0.8)'; ctx.lineWidth = 1; ctx.stroke();
  });
  // Xenophyophoren (riesige Einzeller) und Flohkrebse am Grund
  withAlpha('xeno', () => { for (const dx of [-170, -120, 150, 190, 300]) { ctx.fillStyle = '#cfc6b2'; ctx.beginPath(); ctx.ellipse(GR_M + dx, GR_BOT - 6, 9, 7, 0, 0, TAU); ctx.fill(); } });
  withAlpha('flohkrebse', () => {
    ctx.fillStyle = 'rgba(240,226,200,0.9)';
    for (let i = 0; i < 14; i++) { const x = GR_LX - 60 + ((i * 37 + g * (1 + i % 3)) % 130), y = grTiefe(8000) - 14 - ((i * 23 + g * 2) % 40); ctx.beginPath(); ctx.ellipse(x, y, 4, 2, 0.3, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 10; i++) { const x = GR_NX - 30 + ((i * 29 + g * 2) % 90), y = GR_BOT - 10 - ((i * 17 + g) % 26); ctx.beginPath(); ctx.ellipse(x, y, 4, 2, -0.3, 0, TAU); ctx.fill(); }
  });
  // Felsabsatz an der Wand, auf dem der Lander landet
  { const y = grTiefe(8000) - 4, xw = grWandBei(y) - 20; ctx.beginPath(); ctx.moveTo(xw, y - 30); ctx.lineTo(GR_LX + 70, y); ctx.lineTo(GR_LX + 50, y + 26); ctx.lineTo(xw, y + 40); ctx.closePath(); paint('#3d3630', '#5b4f45', 3); }
  withAlpha('tiefseelander', () => grLander(g));
  withAlpha('schneckenfisch', () => {
    if (g < 120 || g >= 390) return;
    for (let i = 0; i < 4; i++) {
      const t = seg(g, 120 + i * 30, 200 + i * 30), r = 1 - seg(g, 320 + i * 15, 380 + i * 4);
      const x = lerp(GR_LX + 260, GR_LX + 70 + i * 26, ease(t)), y = grTiefe(8000) - 18 - i * 14 + Math.sin(g / 7 + i) * 3;
      ctx.save(); ctx.globalAlpha = Math.min(t * 3, r); grSchneckenfisch(x, y, 0.9 + (i % 2) * 0.2, -1, g + i * 5); ctx.restore();
    }
  });
  withAlpha('nereus', () => grNereus(g));
}
registerRunner({
  room: 'graben2', draw(g) { grBild(g); },
  glow(g) { glow(GR_X0 + 600, SH_WY - 80, 60, 'rgba(255,231,163,0.35)'); },
  robot: { id: 'marianengraben', name: 'Marianengraben', bereich: 'Unterwasser', aera: 'heute', typ: 'Tiefste Stelle der Meere', color: '#081018',
    fakt: 'Der Marianengraben liegt im Pazifik östlich der Philippinen. Seine tiefste Stelle, das Challenger-Tief, liegt fast 11.000 Meter unter der Oberfläche. Dort ist es stockdunkel, nur wenige Grad über 0 °C kalt, und das Wasser drückt über tausendmal so stark wie die Luft an Land.',
    echt: 'Echt. Die Tiefe ist hier stark verkürzt, sonst passte der Graben nicht ins Bild. Tiere und Fahrzeuge sind vergrößert.',
    note: 'Unten am Grund leben keine Fische mehr, nur Flohkrebse und Riesen-Einzeller.',
    quelle: 'https://en.wikipedia.org/wiki/Mariana_Trench',
    box: () => [GR_M - 250, ry(8) + 30, 500, 60] },
});
const grReg = (room, robot) => registerRunner({ room, draw() {}, robot });
grReg('graben1', { id: 'okeanos', name: 'Forschungsschiff mit Tauchroboter', bereich: 'Forschung', aera: 'seit 2008', typ: 'Schiff der US-Meeresbehörde NOAA', color: '#ecebe6',
  fakt: 'Vorbild ist die Okeanos Explorer der US-Meeresbehörde NOAA. Über einen A-Rahmen am Heck lässt sie den Tauchroboter Deep Discoverer an einem Kabel hinab. Die Bilder aus der Tiefe werden live ins Internet übertragen, Forscher an Land schauen zu und helfen beim Bestimmen der Tiere.',
  echt: 'Echt. Das Schiff ist im Maßstab des Ozeans gezeichnet (1 : 12).', note: 'Das gelbe Kabel führt zum Tauchroboter.',
  quelle: 'https://oceanexplorer.noaa.gov/okeanos/welcome.html',
  box: () => [GR_X0 + 330, SH_WY - 160, 400, 190] });
grReg('graben2', { id: 'd2', name: 'Deep Discoverer', bereich: 'Unterwasser', aera: 'seit 2013', typ: 'Ferngesteuerter Tauchroboter', color: '#ecebe6',
  fakt: 'Deep Discoverer taucht bis 6.000 Meter tief. Er hängt an einem Kabel, über das Strom, Befehle und Videos laufen. Mit starken Lampen und Kameras filmt er Tiere, die noch kein Mensch gesehen hat. Im April 2016 fand er in etwa 3.700 Metern Tiefe nahe dem Marianengraben eine rot-gelbe Qualle.',
  echt: 'Echt. Er wird vom Schiff aus gesteuert, an Bord sitzt niemand.', note: 'Leuchtet die Qualle an.',
  quelle: 'https://www.smithsonianmag.com/smart-news/deep-sea-researchers-spot-mysterious-jellyfish-near-mariana-trench-180958961/',
  box: () => { const y = grTiefe(3700); return [GR_X0 + 216, y - 50, 90, 80]; } });
grReg('graben2', { id: 'crossota', name: 'Tiefsee-Qualle', bereich: 'Tier', aera: 'entdeckt 2016', typ: 'Qualle, vermutlich Gattung Crossota', color: '#d6483c',
  fakt: 'Diese Qualle hat Deep Discoverer 2016 gefilmt. Sie ist rot mit gelben Flecken im Inneren und hat zwei Kränze aus Fangarmen: kurze und lange. Die langen hält sie wie ein Netz ausgebreitet und wartet, dass Beute hineinschwimmt.',
  echt: 'Echt. Forscher vermuten, dass sie zur Gattung Crossota gehört; einen Artnamen hatte sie damals noch nicht.', note: 'Pulsiert langsam im Licht des Tauchroboters.',
  quelle: 'https://www.smithsonianmag.com/smart-news/deep-sea-researchers-spot-mysterious-jellyfish-near-mariana-trench-180958961/',
  box: () => { const y = grTiefe(3700); return [GR_X0 + 390, y - 20, 60, 56]; } });
grReg('graben3', { id: 'dumbo', name: 'Dumbo-Krake', bereich: 'Tier', aera: 'Tiefsee', typ: 'Tiefsee-Krake mit Flossen', color: '#e8a08a',
  fakt: 'Dumbo-Kraken heißen so, weil ihre zwei Flossen am Kopf wie die Ohren des Zeichentrick-Elefanten aussehen. Mit diesen Flossen rudern sie langsam durchs Wasser. Sie leben tiefer als alle anderen Kraken, manche in mehreren tausend Metern Tiefe.',
  echt: 'Echt. Hier vergrößert gezeichnet; die meisten sind etwa so groß wie eine Hand bis ein Unterarm.', note: 'Rudert mit den Ohren-Flossen.',
  quelle: 'https://en.wikipedia.org/wiki/Grimpoteuthis',
  box: () => [GR_X1 - 350, grTiefe(4500) - 40, 100, 70] });
grReg('graben4', { id: 'tiefseelander', name: 'Freifall-Lander mit Kamera', bereich: 'Forschung', aera: 'heute', typ: 'Kameragestell, das allein zum Grund sinkt', color: '#f0b429',
  fakt: 'Ein Lander hat keinen Antrieb und kein Kabel. Man wirft ihn vom Schiff, Gewichte ziehen ihn hinab. Unten filmt eine Kamera einen Köder. Nach Stunden wirft er auf ein Schallsignal die Gewichte ab, und die gelben Auftriebskörper bringen ihn wieder nach oben. So wurden die tiefsten Fische gefilmt.',
  echt: 'Echt. Die Gewichte bleiben am Grund liegen. Hier geht es viel schneller als in echt.', note: 'Sinkt herab, filmt die Schneckenfische und steigt wieder auf.',
  quelle: 'https://www.npr.org/2023/04/04/1168051498/deepest-fish-japan-photograph',
  box: () => { const y = grLanderY(state.g); return [GR_LX - 45, y - 110, 90, 116]; } });
grReg('graben4', { id: 'schneckenfisch', name: 'Marianen-Scheibenbauch', bereich: 'Tier', aera: 'beschrieben 2017', typ: 'Schneckenfisch aus der Tiefsee', color: '#f4c4ce',
  fakt: 'Dieser Fisch ist rosa und fast durchsichtig, hat keine Schuppen und weiche Knochen. 2017 wurde ein Marianen-Scheibenbauch in rund 8.180 Metern Tiefe gefilmt. 2022 filmte ein Lander einen jungen Schneckenfisch in einem anderen Graben vor Japan sogar in 8.336 Metern, so tief wie noch nie einen Fisch.',
  echt: 'Echt. Viel tiefer können Fische nach heutigem Wissen wohl nicht leben, darum gibt es am Grund des Grabens keine mehr.', note: 'Kommt zum Köder des Landers.',
  quelle: 'https://www.npr.org/2023/04/04/1168051498/deepest-fish-japan-photograph',
  box: () => (state.g >= 120 && state.g < 390 ? [GR_LX + 40, grTiefe(8000) - 70, 240, 60] : HIDE) });
grReg('graben4', { id: 'flohkrebse', name: 'Flohkrebse', bereich: 'Tier', aera: 'Tiefsee', typ: 'Kleine Krebse am Grund', color: '#f0e2c8',
  fakt: 'In den tiefsten Gräben wimmelt es von Flohkrebsen. Sie riechen Futter von weit her und sind schnell zur Stelle, wenn ein Köder oder ein toter Fisch herabsinkt. Manche Arten werden deutlich größer als ihre Verwandten im flachen Wasser.',
  echt: 'Echt. Sie leben auch ganz unten im Challenger-Tief.', note: 'Wimmeln um den Köder und um Nereus.',
  quelle: 'https://en.wikipedia.org/wiki/Hirondellea_gigas',
  box: () => [GR_LX - 70, grTiefe(8000) - 60, 150, 54] });
grReg('graben5', { id: 'nereus', name: 'Nereus', bereich: 'Unterwasser', aera: '2009 bis 2014', typ: 'Tauchroboter, frei oder am Glasfaserkabel', color: '#f0b429',
  fakt: 'Nereus vom Meeresforschungsinstitut in Woods Hole (USA) erreichte am 31. Mai 2009 das Challenger-Tief in 10.902 Metern Tiefe. Er konnte frei herumfahren oder an einem Glasfaserkabel hängen, dünn wie ein Haar und rund 40 Kilometer lang. Mit seinem Greifarm holte er Gestein und Schlamm vom Grund.',
  echt: 'Echt. 2014 ging Nereus in einem anderen Graben in fast 10.000 Metern Tiefe verloren, vermutlich ist ein Teil unter dem Druck zerbrochen.', note: 'Holt mit dem Greifarm eine Bodenprobe.',
  quelle: 'https://www.whoi.edu/press-room/news-release/hybrid-remotely-operated-vehicle-nereus-reaches-deepest-part-of-the-ocean',
  box: () => [GR_NX - 80, GR_BOT - 120, 160, 100] });
grReg('graben5', { id: 'xeno', name: 'Riesen-Einzeller', bereich: 'Tier', aera: 'Tiefsee', typ: 'Xenophyophore', color: '#cfc6b2',
  fakt: 'Diese Knollen am Boden sind jeweils ein einziges Lebewesen aus nur einer Zelle, oft größer als eine Murmel, manche so groß wie eine Faust. Sie kleben sich aus Schlamm und Sandkörnern ein Gehäuse. Man hat sie auch im Marianengraben in über 10.000 Metern Tiefe gefunden.',
  echt: 'Echt. Sie sehen aus wie Steine, sind aber lebendig.', note: 'Liegen am Grund und bewegen sich nicht.',
  quelle: 'https://en.wikipedia.org/wiki/Xenophyophorea',
  box: () => [GR_M - 180, GR_BOT - 18, 120, 18] });
grReg('graben5', { id: 'tuete', name: 'Plastiktüte', bereich: 'Umwelt', aera: 'gefunden', typ: 'Müll in fast 11.000 m Tiefe', color: '#ebeef0',
  fakt: 'Selbst ganz unten im Marianengraben lag eine Plastiktüte. Sie steht in einer Datenbank der japanischen Meeresforschung, in der Forscher Müll aus tausenden Tauchfahrten sammeln. Plastik sinkt mit der Zeit bis in die tiefsten Stellen der Meere.',
  echt: 'Echt. Die genaue Tiefe wird je nach Quelle etwas unterschiedlich angegeben, es sind fast 11.000 Meter.', note: 'Liegt neben den Riesen-Einzellern.',
  quelle: 'https://education.nationalgeographic.org/resource/plastic-bag-found-bottom-worlds-deepest-ocean-trench/',
  box: () => [GR_M + 205, GR_BOT - 40, 50, 40] });
for (const [key, name] of [['graben1', 'Marianengraben: Forschungsschiff'], ['graben2', 'Marianengraben: Tauchroboter'], ['graben3', 'Marianengraben: Ostflanke'], ['graben4', 'Marianengraben: 8.000 m'], ['graben5', 'Marianengraben: Challenger-Tief']])
  registerRoom({ key, name, level: 'Außengelände', hitOrder: [], robots: [], draw() {} });
