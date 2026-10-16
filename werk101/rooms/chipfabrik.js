/* Haus 105: Chipfabrik (zwei Räume im Erdgeschoss rechts neben Haus 104)
   Reinraum: Luftdusche, Deckenwagen holen und bringen Wafer-Behälter, Cluster-Anlage mit Vakuum-Roboterarm und Plasma, Steckbrief „Staubkorn“.
   Belichtung: gelbes Licht, Belichtungsmaschine mit aufklappbarem, vereinfachtem Schnitt (Laser, Zinntröpfchen, Spiegel, Maske, Wafer), Operatorin.
   Gag: Im Reinraum ist der Mensch die größte Staubquelle – die Luftdusche bläst ihn erst einmal ab. Gesucht wird das Staubkorn. */
const CF1X = rx(roomOf('chip1').c), CF1Y = ry(roomOf('chip1').r);
const CF2X = rx(roomOf('chip2').c), CF2Y = ry(roomOf('chip2').r);
const CF_MONO = { family: '"IBM Plex Mono", monospace', weight: 500 };
const CF_RAIL = 56, CF_PORT = 200, CF_PORTY = 272;

/* ---------- gemeinsame Teile ---------- */
function cfDecke(gelb) {
  ctx.fillStyle = '#d6d9d6'; ctx.fillRect(0, 0, RW, 40); line(0, 40, RW, 40, INK, 2);
  for (let x = 10; x < RW; x += 80) { box(x, 8, 64, 26, '#eceeec', 1, 1.2); for (let k = 1; k < 6; k++) line(x + k * 11, 12, x + k * 11, 30, 'rgba(42,39,35,0.25)', 1); }
  for (let x = 46; x < RW; x += 160) box(x, 40, 70, 6, gelb ? '#f6d35a' : '#f3f1ea', 1, 1);
  // Schiene der Deckenwagen
  for (let x = 30; x < RW; x += 120) line(x, 40, x, CF_RAIL, '#5d6064', 2);
  box(-4, CF_RAIL, RW + 8, 5, '#3b3d40', 0, 1);
}
function cfBoden() {
  ctx.fillStyle = '#c9ccc8'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  for (let x = 10; x < RW; x += 16) for (const y of [368, 378, 388]) circle(x, y, 1.6, '#8a8f94', null);
  for (let x = 0; x < RW; x += 80) line(x, 360, x, 400, 'rgba(42,39,35,0.2)', 1);
}
// Luft strömt von den Filtern in der Decke nach unten und durch die Löcher im Boden ab
function cfLuft(f, xs) {
  for (const x of xs) for (let k = 0; k < 4; k++) {
    const y = 60 + ((f * 5 + k * 75) % 300);
    line(x, y, x, y + 14, 'rgba(127,190,230,0.55)', 2); line(x - 4, y + 9, x, y + 14, 'rgba(127,190,230,0.55)', 2); line(x + 4, y + 9, x, y + 14, 'rgba(127,190,230,0.55)', 2);
  }
}
function cfFoup(x, top) {
  box(x - 15, top, 30, 26, '#a9c1d3', 3, 1.5); box(x - 11, top + 6, 22, 15, '#8aa7bc', 2, 1);
  line(x - 15, top + 3, x + 15, top + 3, INK, 1);
}
// Deckenwagen: x = Mitte, hoist = Unterkante des Greifers (92 = eingefahren)
function cfWagen(x, hoist, foup) {
  box(x - 22, CF_RAIL + 2, 44, 7, '#5d6064', 1, 1.2); circle(x - 14, CF_RAIL + 2, 3, '#3b3d40', INK, 1); circle(x + 14, CF_RAIL + 2, 3, '#3b3d40', INK, 1);
  box(x - 28, 64, 56, 28, '#e6e3da', 3, 1.5);
  ctx.fillStyle = '#f0b429'; ctx.fillRect(x - 27, 80, 54, 4);
  circle(x + 20, 72, 2.2, '#7fe08a', null);
  if (hoist > 96) for (const dx of [-12, 12]) line(x + dx, 90, x + dx, hoist - 6, '#3b3d40', 1.5);
  box(x - 18, hoist - 6, 36, 6, '#8a8f94', 1, 1.2);
  if (foup) cfFoup(x, hoist);
}
// Mensch im Reinraumanzug: Overall, Haube, Schutzbrille und Mundschutz
function cfAnzug(x, face, hand) {
  const p = person({ x, face, shirt: '#eef0f2', pants: '#eef0f2', hair: '#eef0f2', hand });
  box(x - 13, 352, 12, 6, '#eef0f2', 2, 1.5); box(x + 1, 352, 12, 6, '#eef0f2', 2, 1.5);
  ctx.beginPath(); ctx.arc(p.head.x, p.head.y, 13.5, 0, TAU); paint('#eef0f2', INK, 1.5);
  box(p.head.x + face * 3 - 6, p.head.y - 5, 12, 10, '#e2b48f', 2, 1);
  box(p.head.x + face * 3 - 6, p.head.y - 5, 12, 4, '#9fc3d6', 1, 1);
  box(p.head.x + face * 3 - 6, p.head.y + 1, 12, 5, '#d6e6ee', 1, 1);
  return p;
}
const cfWafer = (x, y, w = 22) => { ctx.beginPath(); ctx.ellipse(x, y, w / 2, 3, 0, 0, TAU); paint('#b8c4cf', INK, 1); line(x - w / 4, y - 1, x + w / 4, y - 1, 'rgba(176,124,255,0.7)', 1); };

/* ---------- Raum 1: Reinraum ---------- */
// Wagen 1 holt den vollen Behälter ab, Wagen 2 bringt einen neuen
function cfW1(f) {
  const x = f < 8 ? lerp(-40, CF_PORT, ease(seg(f, 0, 8))) : f < 24 ? CF_PORT : lerp(CF_PORT, 700, ease(seg(f, 24, 34)));
  const h = 92 + (CF_PORTY - 92) * (seg(f, 8, 14) - seg(f, 16, 22));
  return { x, h, foup: f >= 15 };
}
function cfW2(f) {
  const x = f < 36 ? lerp(-40, CF_PORT, ease(seg(f, 26, 36))) : f < 49 ? CF_PORT : lerp(CF_PORT, 700, ease(seg(f, 49, 59)));
  const h = 92 + (CF_PORTY - 92) * (seg(f, 37, 42) - seg(f, 43, 48));
  return { x, h, foup: f < 43 };
}
const cfPortVoll = f => f < 15 || f >= 43;
// Vakuumarm: Schleuse → Kammer → Schleuse
const CF_S = { x: 350, y: 292 }, CF_L = { x: 276, y: 262 }, CF_P = { x: 424, y: 262 }, CF_R = { x: 350, y: 252 };
function cfArmTip(f) {
  if (f < 4) return CF_L;
  if (f < 12) return mix(CF_L, CF_R, ease(seg(f, 4, 12)));
  if (f < 20) return mix(CF_R, CF_P, ease(seg(f, 12, 20)));
  if (f < 24) return mix(CF_P, CF_R, ease(seg(f, 20, 24)));
  if (f < 40) return CF_R;
  if (f < 44) return mix(CF_R, CF_P, ease(seg(f, 40, 44)));
  if (f < 50) return mix(CF_P, CF_R, ease(seg(f, 44, 50)));
  if (f < 58) return mix(CF_R, CF_L, ease(seg(f, 50, 58)));
  return CF_L;
}
const cfTraegt = f => (f >= 4 && f < 20) || (f >= 44 && f < 58);
const cfPlasma = f => f >= 24 && f < 40;

function drawChip1(f) {
  ctx.fillStyle = '#eef0ee'; ctx.fillRect(0, 0, RW, RH);
  text('REINRAUM', 300, 150, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  cfDecke(false); cfBoden();
  cfLuft(f, [150, 500, 610]);

  // Luftdusche links
  box(10, 150, 116, 210, '#dfe3e6', 2, 2);
  ctx.fillStyle = 'rgba(190,220,235,0.35)'; ctx.fillRect(14, 156, 108, 200);
  for (let y = 176; y < 340; y += 26) { circle(22, y, 3, '#8a8f94', INK, 1); circle(114, y, 3, '#8a8f94', INK, 1); }
  text('LUFTDUSCHE', 68, 168, 9, Object.assign({ align: 'center' }, CF_MONO));
  for (let y = 182; y < 340; y += 26) for (const s of [-1, 1]) {
    const d = (f * 4 + y) % 24;
    line(68 - s * (44 - d), y, 68 - s * (34 - d), y + 2, 'rgba(127,190,230,0.8)', 2);
  }
  withAlpha('reinraumtech', () => {
    const face = Math.floor((f + 7) / 15) % 2 ? 1 : -1;
    cfAnzug(68, face, { x: 68 + face * 18, y: 256 });
    // Hautschüppchen und Fussel fliegen vom Anzug und verschwinden im Bodengitter
    for (let k = 0; k < 6; k++) {
      const p = ((f * 2 + k * 10) % 60) / 60;
      circle(52 + k * 6 + Math.sin(p * 9 + k) * 4, 236 + p * 120, 1.6, `rgba(120,110,100,${0.9 - p * 0.7})`, null);
    }
  });

  // Ladestation (Load Port) und Cluster-Anlage
  box(CF_PORT - 26, 298, 52, 62, '#d6d9d6', 2, 1.5); box(CF_PORT - 22, 294, 44, 6, '#8a8f94', 1, 1.2);
  if (cfPortVoll(f)) cfFoup(CF_PORT, CF_PORTY);
  box(232, 170, 236, 190, '#e6e3da', 3, 2);
  text('ÄTZEN', 350, 186, 10, Object.assign({ align: 'center' }, CF_MONO));
  for (const x of [240, 452]) for (let y = 300; y < 352; y += 8) line(x, y, x + 10, y, 'rgba(42,39,35,0.3)', 1);
  withAlpha('vakuumarm', () => {
    box(244, 200, 212, 130, '#2f3238', 4, 2);
    // Schleuse links, Prozesskammer rechts
    box(250, 238, 52, 44, '#4a4d52', 2, 1.5); text('SCHLEUSE', 276, 296, 7, Object.assign({ align: 'center', color: '#c9ccc8' }, CF_MONO));
    box(398, 238, 52, 44, '#4a4d52', 2, 1.5); text('KAMMER', 424, 296, 7, Object.assign({ align: 'center', color: '#c9ccc8' }, CF_MONO));
    if (cfPlasma(f)) { const a = 0.55 + 0.25 * Math.sin(f * 1.3); glow(424, 258, 30, `rgba(176,124,255,${a})`); ctx.fillStyle = `rgba(190,150,255,${a * 0.6})`; ctx.fillRect(402, 242, 44, 26); }
    if (f < 4 || f >= 58) cfWafer(CF_L.x, CF_L.y + 6);
    if (f >= 20 && f < 44) cfWafer(CF_P.x, CF_P.y + 6);
    // Arm mit zwei Gliedern auf einem drehbaren Fuß
    const tip = cfArmTip(f), E = ik2(CF_S, tip, 46, 46);
    box(CF_S.x - 16, CF_S.y, 32, 26, '#5d6064', 2, 1.5);
    limb(CF_S.x, CF_S.y, E.x, E.y, 8, '#b9c0c6'); limb(E.x, E.y, tip.x, tip.y, 6, '#b9c0c6');
    circle(CF_S.x, CF_S.y, 6, '#3b3d40', INK, 1.5); circle(E.x, E.y, 4.5, '#3b3d40', INK, 1.2);
    line(tip.x - 12, tip.y + 2, tip.x + 12, tip.y + 2, '#d6d9d6', 3);
    if (cfTraegt(f)) cfWafer(tip.x, tip.y - 1);
    text('VAKUUM', 350, 216, 8, Object.assign({ align: 'center', color: '#7fd3ff' }, CF_MONO));
  });

  // Steckbrief an der Wand und Teilchenzähler
  withAlpha('staubkorn', () => {
    box(500, 112, 100, 116, '#f3e7c8', 2, 1.5);
    text('GESUCHT', 550, 132, 15, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center' });
    for (let k = 0; k < 9; k++) { const a = k * 0.7, r = 10 + (k % 3) * 3; circle(550 + Math.cos(a) * r * 0.6, 170 + Math.sin(a) * r * 0.5, 7 - (k % 3), '#9b9184', INK, 1); }
    circle(546, 168, 2, INK, null); circle(556, 168, 2, INK, null);
    text('STAUBKORN', 550, 206, 9, Object.assign({ align: 'center' }, CF_MONO));
    text('Staatsfeind Nr. 1', 550, 220, 8, Object.assign({ align: 'center' }, CF_MONO));
    line(590, 250, 590, 358, '#5d6064', 3); box(568, 246, 44, 30, '#1a1d22', 3, 1.5);
    text('TEILCHEN', 590, 258, 6, Object.assign({ align: 'center', color: '#7fe08a' }, CF_MONO));
    text('0', 590, 272, 11, Object.assign({ align: 'center', color: '#7fe08a' }, CF_MONO));
  });

  // Deckenwagen
  withAlpha('ohtwagen', () => {
    const a = cfW1(f); if (f < 34) cfWagen(a.x, a.h, a.foup);
    if (f >= 26) { const b = cfW2(f); cfWagen(b.x, b.h, b.foup); }
  });
}

/* ---------- Raum 2: Belichtung ---------- */
const cfKlappe = f => ease(seg(f, 8, 16)) - ease(seg(f, 48, 56));
const cfTisch = f => 575 + 18 * Math.sin(f * TAU / 60);
function drawChip2(f) {
  ctx.fillStyle = '#efecdc'; ctx.fillRect(0, 0, RW, RH);
  text('BELICHTUNG', 300, 140, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  withAlpha('gelblicht', () => cfDecke(true));
  cfBoden();
  cfLuft(f, [40, 130]);

  // Operatorin am Pult
  withAlpha('scannerbed', () => {
    box(96, 270, 40, 90, '#d6d9d6', 2, 1.5); box(92, 232, 50, 36, '#23384d', 2, 1.5);
    const n = Math.floor(f / 5);
    for (let i = 0; i < 12; i++) box(100 + (i % 4) * 9, 238 + Math.floor(i / 4) * 9, 7, 7, i <= n ? '#7fd3ff' : '#2d4a63', 0, 0);
    cfAnzug(70, 1, { x: 96, y: 284 });
  });

  // Belichtungsmaschine mit Klappe
  withAlpha('euvscanner', () => {
    box(150, 150, 484, 210, '#e6e3da', 4, 2);
    ctx.fillStyle = '#cfd2cc'; ctx.fillRect(152, 152, 116, 206); line(268, 150, 268, 360, INK, 1.5);
    for (let x = 300; x < 630; x += 80) line(x, 150, x, 172, 'rgba(42,39,35,0.25)', 1);
    for (const x of [200, 330, 460, 590]) line(x, 46, x, 150, '#5d6064', 3);
    const o = cfKlappe(f);
    if (o > 0.02) {
      ctx.save(); ctx.beginPath(); ctx.rect(170, 175, 440, 160); ctx.clip();
      ctx.fillStyle = '#23262c'; ctx.fillRect(170, 175, 440, 160);
      // Laser trifft Zinntröpfchen, die Kollektor-Spiegelschale sammelt das Licht
      box(176, 254, 26, 16, '#8a5a3a', 2, 1.2);
      const puls = f % 3 === 0;
      if (puls) line(202, 262, 228, 262, '#ff5a4a', 3);
      for (let k = 0; k < 6; k++) circle(232, 185 + ((f * 12 + k * 24) % 144), 2.2, '#c9ccc8', null);
      ctx.beginPath(); ctx.arc(232, 262, 28, Math.PI * 0.55, Math.PI * 1.45); ctx.strokeStyle = '#d6d9e6'; ctx.lineWidth = 5; ctx.stroke();
      if (puls) glow(232, 262, 22, 'rgba(200,150,255,0.9)');
      // Lichtweg über Spiegel und Maske auf den Wafer (in echt unsichtbar)
      const P = [[232, 262], [320, 200], [390, 300], [452, 194], [515, 300], [575, 318]];
      ctx.setLineDash([8, 7]); ctx.lineDashOffset = -f * 2;
      ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const [x, y] of P.slice(1)) ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(197,140,255,0.95)'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
      for (const [x, y, w] of [[320, 194, 34], [390, 306, 34], [515, 306, 34]]) box(x - w / 2, y - 3, w, 6, '#e8e8f0', 2, 1);
      box(426, 184, 52, 6, '#9fb3c4', 1, 1); for (let k = 0; k < 6; k++) ctx.fillRect(430 + k * 8, 185, 4, 4);
      // Wafertisch fährt unter dem Licht hin und her
      const tx = cfTisch(f); box(tx - 34, 322, 68, 10, '#5d6064', 2, 1.2); cfWafer(tx, 320, 26);
      const L = Object.assign({ color: '#c9ccc8' }, CF_MONO);
      text('Laser', 178, 248, 8, L); text('Zinn', 240, 192, 8, L); text('Spiegel', 300, 188, 8, L);
      text('Maske', 432, 205, 8, L); text('Wafer', 604, 330, 8, Object.assign({ align: 'right' }, L));
      text('SCHNITT VEREINFACHT', 390, 330, 8, Object.assign({ align: 'center', color: '#f0b429' }, CF_MONO));
      ctx.restore();
    }
    // Klappe gleitet nach oben
    const h = 160 * (1 - o);
    if (h > 1) { box(170, 175, 440, h, '#dcdad0', 2, 1.5); if (h > 30) { text('BELICHTUNG · NICHT ÖFFNEN', 390, 175 + h / 2 + 4, 11, Object.assign({ align: 'center' }, CF_MONO)); } }
    else line(170, 175, 610, 175, INK, 1.5);
    box(176, 340, 60, 14, '#23384d', 2, 1); circle(186, 347, 3, '#7fe08a', null);
  });

  // Deckenwagen fahren durch
  withAlpha('ohtwagen2', () => {
    cfWagen(lerp(-40, 700, f / 60), 92 + 26, true);
    cfWagen(lerp(-40, 700, ((f + 30) % 60) / 60), 92, false);
  });
  // Gelbes Licht über allem
  ctx.fillStyle = 'rgba(255,205,60,0.10)'; ctx.fillRect(0, 0, RW, RH);
}

registerRoom({
  key: 'chip1', name: 'Chipfabrik: Reinraum', level: 'Chipfabrik',
  hitOrder: ['ohtwagen', 'reinraumtech', 'staubkorn', 'vakuumarm'],
  draw: drawChip1,
  robots: [
    { id: 'ohtwagen', name: 'Deckenwagen', bereich: 'Logistik', aera: 'seit den 2000ern', typ: 'Fahrzeug an einer Schiene unter der Decke',
      fakt: 'In einer Chipfabrik trägt kaum ein Mensch Wafer herum. Kleine Wagen fahren an Schienen unter der Decke, auf geraden Stücken bis zu 5 Meter pro Sekunde schnell. Sie bringen geschlossene Behälter mit bis zu 25 Wafern von Anlage zu Anlage und lassen sie an Bändern herunter.',
      echt: 'Echt. Allein Samsung setzt in seinen Fabriken mehr als 8.000 solcher Wagen ein. Ein Rechner verteilt die Fahrten, damit sich die Wagen nicht in die Quere kommen.',
      note: 'Einer holt den vollen Behälter ab, der nächste bringt schon den neuen.', color: '#e6e3da',
      quelle: 'https://www.mdpi.com/2075-1702/11/2/125',
      box: f => { const a = f < 34 ? cfW1(f) : cfW2(f); return [CF1X + a.x - 30, CF1Y + CF_RAIL, 60, a.h - CF_RAIL + (a.foup ? 28 : 4)]; } },
    { id: 'vakuumarm', name: 'Wafer-Roboterarm', bereich: 'Industrie', aera: 'seit den 1980ern', typ: 'Arm in einer Vakuumkammer',
      fakt: 'In dieser Anlage gibt es fast keine Luft, sie steht unter Vakuum. Ein Roboterarm in der Mitte nimmt den Wafer aus der Schleuse und legt ihn in eine Kammer. Dort ätzt ein leuchtendes Gas, ein Plasma, feine Muster in die Oberfläche.',
      echt: 'Echt. Anlagen mit mehreren Kammern rund um einen Arm heißen Cluster-Anlagen. Hier sieht man durch ein Fenster hinein, in echt sind die Kammern geschlossen.',
      note: 'Rein, leuchten, raus. Den ganzen Tag.', color: '#b9c0c6',
      quelle: 'https://en.wikipedia.org/wiki/Plasma_etching',
      box: () => [CF1X + 232, CF1Y + 170, 236, 190] },
    { id: 'reinraumtech', name: 'Technikerin in der Luftdusche', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch im Reinraumanzug',
      fakt: 'Bevor sie in den Reinraum darf, bläst eine Luftdusche ihr den Staub vom Anzug. Dabei dreht sie sich um sich selbst. Der Anzug schützt nicht sie vor den Chips, sondern die Chips vor ihr: Menschen verlieren ständig Hautschüppchen und Haare.',
      echt: 'Echt. Im Reinraum ist der Mensch die größte Staubquelle.',
      note: 'Dreht sich in der Luftdusche wie ein Auto in der Waschanlage.', color: '#eef0f2',
      quelle: 'https://en.wikipedia.org/wiki/Cleanroom_suit',
      box: () => [CF1X + 14, CF1Y + 190, 108, 170] },
    { id: 'staubkorn', name: 'Steckbrief: Staubkorn', bereich: 'Industrie', aera: 'heute', typ: 'Gesucht: Staatsfeind Nr. 1',
      fakt: 'Die Leiterbahnen auf einem Chip sind viel dünner als ein Staubkorn. Ein einziges Körnchen kann einen Chip unbrauchbar machen. Deshalb blasen Filter in der Decke ständig saubere Luft nach unten, und durch die Löcher im Boden strömt sie wieder ab. Ein Messgerät zählt die Teilchen in der Luft.',
      echt: 'Echt. In normaler Luft schweben in einem Kubikmeter Millionen winziger Teilchen, in einem Reinraum für Chips nur einige tausend oder noch weniger.',
      note: 'Der Zähler zeigt null. Darauf ist hier jeder stolz.', color: '#9b9184',
      quelle: 'https://en.wikipedia.org/wiki/Cleanroom',
      box: () => [CF1X + 500, CF1Y + 112, 112, 246] },
  ],
});
registerRoom({
  key: 'chip2', name: 'Chipfabrik: Belichtung', level: 'Chipfabrik',
  hitOrder: ['ohtwagen2', 'scannerbed', 'gelblicht', 'euvscanner'],
  draw: drawChip2,
  robots: [
    { id: 'euvscanner', name: 'Belichtungsmaschine', bereich: 'Industrie', aera: 'seit 2019 in Fabriken', typ: 'Maschine, so groß wie ein Bus',
      fakt: 'Sie zeichnet die Baupläne der Chips mit Licht auf den Wafer. Dafür trifft ein Laser rund 50.000 Mal pro Sekunde winzige Zinntröpfchen. Die glühen auf und geben ein besonderes Licht ab, das Spiegel im Vakuum über eine Maske auf den Wafer lenken.',
      echt: 'Echt. Nur die Firma ASML aus den Niederlanden baut diese Maschinen. Eine wiegt etwa 150 Tonnen und reist in rund 40 Containern mit Frachtflugzeugen zur Fabrik. Das Licht ist unsichtbar, hier ist es violett gezeichnet. Die Maschine ist kürzer gezeichnet, der Schnitt stark vereinfacht.',
      note: 'Die Klappe geht nur für uns auf. In echt bleibt die Maschine zu.', color: '#e6e3da',
      quelle: 'https://en.wikipedia.org/wiki/Extreme_ultraviolet_lithography',
      box: () => [CF2X + 150, CF2Y + 150, 484, 210] },
    { id: 'gelblicht', name: 'Gelbes Licht', bereich: 'Industrie', aera: 'heute', typ: 'Lampen ohne blaues Licht',
      fakt: 'Auf dem Wafer liegt ein Lack, der auf blaues und ultraviolettes Licht reagiert, ähnlich wie früher ein Fotofilm. Damit die Raumbeleuchtung ihn nicht verdirbt, ist das Licht in diesem Bereich gelb.',
      echt: 'Echt. Deshalb sehen Fotos aus Chipfabriken oft gelb aus.',
      note: 'Hier sieht alles ein bisschen nach Sonnenuntergang aus.', color: '#f6d35a',
      quelle: 'https://cleanroomtechnology.com/why-yellow-tinted-glass-walls-are-necessary-in',
      box: () => [CF2X + 40, CF2Y + 34, 100, 16] },
    { id: 'scannerbed', name: 'Operatorin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch am Steuerpult',
      fakt: 'Sie startet Aufträge und behält die Messwerte im Blick. In die Maschine hineinfassen muss sie nie.',
      echt: 'Echt. Die meiste Arbeit machen Maschinen, Menschen überwachen und warten sie.',
      note: 'Auf ihrem Bildschirm füllt sich der Wafer Feld für Feld.', color: '#eef0f2',
      box: () => [CF2X + 50, CF2Y + 226, 96, 134] },
    { id: 'ohtwagen2', name: 'Deckenwagen auf Durchfahrt', bereich: 'Logistik', aera: 'seit den 2000ern', typ: 'Fahrzeug an einer Schiene unter der Decke',
      fakt: 'Die Wagen fahren kreuz und quer durch die ganze Fabrik. Ein Wafer kommt auf seinem Weg zum fertigen Chip viele Male an der Belichtung vorbei, denn ein Chip besteht aus vielen Schichten übereinander.',
      echt: 'Echt. Bis ein Wafer fertig ist, vergehen Wochen bis Monate und Hunderte Arbeitsschritte.',
      note: 'Einer voll, einer leer. Leerfahrten gibt es auch hier.', color: '#e6e3da',
      quelle: 'https://en.wikipedia.org/wiki/Semiconductor_device_fabrication',
      box: f => [CF2X + lerp(-40, 700, f / 60) - 30, CF2Y + CF_RAIL, 60, 92] },
  ],
});
