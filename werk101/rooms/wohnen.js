/* Raum: Wohnbereich (Ebene 4) */
const WX = rx(roomOf('wohnen').c), WY = ry(roomOf('wohnen').r);

// Bei Regen und abends bleibt der Mähroboter in seiner Station (abends wegen der Igel)
const mowerParked = () => (state.wetter === 'regen' || istDunkel());
function mowerX(f) {
  if (mowerParked()) return 40;
  if (f < 22) return lerp(50, 176, ease(seg(f, 0, 22)));
  if (f < 30) return 176 - 3 * Math.sin(Math.PI * seg(f, 22, 30));
  if (f < 54) return lerp(176, 50, ease(seg(f, 30, 54)));
  return 50;
}
const winBot = f => ({ x: 336 + 46 * (0.5 - 0.5 * Math.cos(TAU * 3 * f / 60)), y: 96 + 80 * (0.5 - 0.5 * Math.cos(TAU * f / 60)) });
// Paket für den Bewohner (globale Uhr state.g, Ankunft mit dem Hauslieferroboter ab Bild 240 der 40-s-Runde)
function opaPaket(G, peek) {
  const normal = peek ? { x: 490, y: 300 } : { x: 492, y: 288 }, lap = { x: 500, y: 320 }, hold = { x: 492, y: 306 }, up = { x: 482, y: 258 + Math.sin(G / 4) * 2 };
  const mixP = (A, B, t) => ({ x: lerp(A.x, B.x, t), y: lerp(A.y, B.y, t) });
  if (G < 240 || G >= 476) return { hand: normal, paper: true };
  if (G < 250) return { hand: mixP(normal, { x: 586, y: 318 }, ease(seg(G, 240, 250))) };
  if (G < 262) { const c = mixP({ x: 596, y: 334 }, lap, ease(seg(G, 250, 262))); return { hand: { x: c.x - 10, y: c.y - 16 }, parcel: { ...c, open: 0, s: 1, a: 1 } }; }
  const open = G < 300 ? 0 : G < 312 ? seg(G, 300, 312) : G < 452 ? 1 : 1 - seg(G, 452, 462);
  if (G < 312) return { hand: hold, parcel: { ...lap, open, s: 1, a: 1 } };
  if (G < 452) {
    const t = G < 326 ? ease(seg(G, 312, 326)) : G < 440 ? 1 : 1 - ease(seg(G, 440, 452));
    const k = mixP({ x: 500, y: 300 }, up, t);
    return { hand: k, parcel: { ...lap, open, s: 1, a: 1 }, sock: k };
  }
  if (G < 462) return { hand: hold, parcel: { ...lap, open, s: 1, a: 1 } };
  const t = ease(seg(G, 462, 474));
  return { hand: mixP(hold, normal, ease(seg(G, 462, 476))), parcel: G < 474 ? { ...mixP(lap, { x: 624, y: 356 }, t), open: 0, s: 1 - 0.4 * t, a: 1 - 0.6 * t } : null };
}
function dogPose(f) {
  if (f < 10) return { x: 360, walk: false };
  if (f < 28) return { x: lerp(360, 440, ease(seg(f, 10, 28))), walk: true };
  if (f < 46) return { x: 440, peek: f >= 30 };
  return { x: lerp(440, 360, ease(seg(f, 46, 60))), walk: true };
}
function ballPos(f) {
  if (f < 4) return { x: 386, v: true };
  if (f < 18) return { x: lerp(386, 512, seg(f, 4, 18)), v: true };
  if (f < 44) return { x: 512, v: false };
  if (f < 50) return { x: lerp(500, 470, seg(f, 44, 50)), v: true };
  return { x: lerp(470, 386, ease(seg(f, 50, 60))), v: true };
}
const foldT = f => (f < 40 ? ease(seg(f, 0, 40)) : f < 46 ? 1 : f < 50 ? 1 - ease(seg(f, 46, 50)) : 0);

function drawWohnen(f) {
  ctx.fillStyle = '#e5ddd2'; ctx.fillRect(0, 0, RW, RH);
  ctx.strokeStyle = 'rgba(168,118,63,0.12)'; ctx.lineWidth = 6;
  ctx.beginPath(); for (let x = 290; x < RW; x += 26) { ctx.moveTo(x, 8); ctx.lineTo(x, 360); } ctx.stroke();
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('WOHNEN', 440, 120, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#a07a58'; ctx.fillRect(280, 360, 360, 40);
  // Terrasse mit Rasen hinter Glastür
  ctx.fillStyle = istDunkel() ? '#2c3458' : state.wetter === 'regen' ? '#9aa8ad' : '#c8dde3'; ctx.fillRect(0, 8, 280, 352);
  ctx.fillStyle = istDunkel() ? '#3b4566' : '#b8cfd6'; for (const [x, h] of [[10, 120], [80, 180], [170, 90]]) ctx.fillRect(x, 300 - h, 60, h);
  ctx.fillStyle = '#5f9a4a'; ctx.fillRect(0, 344, 280, 56);
  ctx.strokeStyle = '#4e8a3c'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 2; x < 280; x += 5) { ctx.moveTo(x, 346); ctx.lineTo(x + 2, 340); }
  ctx.stroke();
  // Ladestation des Mähroboters
  box(4, 318, 18, 28, '#3b3d40', 2, 1.2); ctx.beginPath(); ctx.moveTo(2, 320); ctx.lineTo(70, 312); ctx.lineTo(70, 318); ctx.lineTo(2, 326); ctx.closePath(); paint('#8a8f94', INK, 1.2);
  if (state.wetter === 'regen') { ctx.strokeStyle = 'rgba(230,240,245,0.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let i = 0; i < 40; i++) { const x = (i * 53) % 280, y = 10 + ((i * 89 + state.g * 9) % 330); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 14); } ctx.stroke(); }
  if (istDunkel()) withAlpha('igel', () => {
    const x = 90 + 120 * (0.5 - 0.5 * Math.cos(TAU * f / 60)), dir = Math.sin(TAU * f / 60) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(x, 346); ctx.scale(dir, 1);
    ctx.beginPath(); ctx.ellipse(0, -8, 16, 9, 0, Math.PI, 0); paint('#6b4a2a', INK, 1.2);
    for (let i = -12; i <= 12; i += 4) line(i, -12, i - 3, -18, '#4a3420', 2);
    ctx.beginPath(); ctx.moveTo(14, -8); ctx.lineTo(24, -4); ctx.lineTo(14, -1); ctx.closePath(); paint('#a07a58', INK, 1); circle(23, -4, 1.4, INK, null);
    ctx.restore();
  });
  box(278, 8, 10, 352, '#8e6233', 0, 2);
  line(0, 360, RW, 360, INK, 2);

  // Gartenzwerg und Mähroboter
  withAlpha('zwerg', () => {
    const hit = !mowerParked() && f >= 22 && f < 32, w = hit ? Math.sin(TAU * (f - 22) / 5) * 0.12 : 0;
    ctx.save(); ctx.translate(232, 346); ctx.rotate(w);
    box(-10, -28, 20, 28, '#3e6f9e', 4); circle(0, -34, 8, '#e2b48f');
    ctx.beginPath(); ctx.moveTo(-9, -38); ctx.lineTo(0, -62); ctx.lineTo(9, -38); ctx.closePath(); paint('#d9542b');
    ctx.beginPath(); ctx.moveTo(-7, -32); ctx.quadraticCurveTo(0, -14, 7, -32); paint('#f3f1ea', INK, 1.5);
    ctx.restore();
    if (hit) text('?!', 252, 290, 16, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#d9542b' });
  });
  withAlpha('maeher', () => {
    const x = mowerX(f), back = f >= 30 && f < 54;
    ctx.beginPath(); ctx.moveTo(x - 32, 344); ctx.bezierCurveTo(x - 32, 318, x + 30, 316, x + 32, 344); ctx.closePath(); paint('#e6e3da');
    ctx.beginPath(); ctx.moveTo(x - 30, 340); ctx.lineTo(x + 30, 340); ctx.strokeStyle = '#3b3d40'; ctx.lineWidth = 4; ctx.stroke();
    circle(x - 16, 344, 9, '#2d2f33'); circle(x - 16, 344, 3, '#8a8f94', null);
    circle(x + 20, 349, 4, '#2d2f33');
    ctx.beginPath(); ctx.ellipse(x, 322, 7, 3, 0, 0, TAU); paint('#d9542b', INK, 1.5);
    circle(x + 14, 327, 2.2, back ? '#ff8a24' : '#7fe08a', INK, 1);
    if (!back) { ctx.fillStyle = '#7fbf5f'; for (let i = 0; i < 4; i++) { const r = rnd(f * 3 + i); ctx.fillRect(x - 36 - r * 12, 338 - r * 10, 3, 3); } }
  });

  // Fenster mit Fensterputzroboter
  box(310, 60, 120, 150, '#cfe0e6', 0, 3);
  ctx.fillStyle = 'rgba(140,120,90,0.25)';
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(320 + rnd(i + 40) * 100, 70 + rnd(i + 70) * 130, 4 + rnd(i) * 5, 0, TAU); ctx.fill(); }
  withAlpha('fenster', () => {
    const w = winBot(f);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(w.x - 26, w.y - 14, 52, 28);
    line(370, 56, w.x, w.y - 12, '#d9542b', 1.5);
    box(w.x - 16, w.y - 12, 32, 24, '#3b3d40', 6);
    circle(w.x, w.y, 6, '#5d6064', INK, 1.5);
    circle(w.x + 9, w.y - 6, 1.8, f % 6 < 3 ? '#7fe08a' : '#2d5b33', null);
  });
  box(304, 206, 132, 8, '#8e6233', 0, 2);

  // Sessel, Teppich, Roboterhund und sein Ball
  ctx.beginPath(); ctx.ellipse(420, 362, 90, 6, 0, 0, TAU); ctx.fillStyle = '#b5523b'; ctx.fill();
  box(468, 280, 80, 46, '#3e6f9e', 8);
  box(468, 232, 20, 96, '#335d86', 6); box(468, 318, 80, 14, '#335d86', 4);
  line(478, 332, 476, 358, INK, 3); line(540, 332, 542, 358, INK, 3);
  // Kartonstapel neben dem Sessel (hier landen die leeren Paketkartons)
  for (let i = 0; i < 3; i++) box(612 + (i % 2) * 3, 354 - i * 4, 24, 4, '#c9a46a', 0, 1.2);
  withAlpha('opa', () => {
    const peek = dogPose(f).peek, P = opaPaket(state.g, peek);
    person({ x: 516, face: -1, sit: true, foot: 360, shirt: '#8a5a3c', pants: '#5d5a55', hair: '#d6d2c8', skin: '#e4bf9c', hand: P.hand });
    circle(507, 271, 3.2, null, INK, 1.2); circle(500, 271, 3.2, null, INK, 1.2);
    if (P.paper) {
      ctx.save(); ctx.translate(peek ? 486 : 488, peek ? 296 : 284); ctx.rotate(peek ? 0.5 : -0.15);
      box(-14, -16, 18, 22, '#f3f1ea', 0, 1.2);
      for (let y = -12; y < 4; y += 4) line(-11, y, 1, y, '#8a8f94', 1);
      ctx.restore();
    } else box(470, 274, 16, 6, '#f3f1ea', 0, 1.2);
    if (P.parcel) { ctx.save(); ctx.globalAlpha *= P.parcel.a; drawParcel(P.parcel.x, P.parcel.y, P.parcel.open, P.parcel.s); ctx.restore(); }
    if (P.sock) { const k = P.sock; limb(k.x, k.y, k.x, k.y + 14, 5, '#c94040'); limb(k.x, k.y + 14, k.x - 7, k.y + 17, 5, '#c94040'); line(k.x - 2, k.y + 4, k.x + 2, k.y + 4, '#f3efe4', 2); }
  });
  withAlpha('hund2', () => {
    const p = dogPose(f), bl = ballPos(f);
    if (bl.v) circle(bl.x, 352, 6, '#f2a2c0', INK, 1.5);
    ctx.save(); ctx.translate(p.x, 0);
    const step = p.walk ? Math.sin(TAU * f / 6) * 3 : 0;
    for (const [lx, d] of [[-14, 1], [14, -1]]) { limb(lx, 334, lx + step * d, 356, 5, '#d6d9dc'); box(lx - 4 + step * d, 352, 9, 5, '#8a8f94', 2, 1.2); }
    ctx.beginPath(); ctx.ellipse(0, 330, 22, 10, 0, 0, TAU); paint('#eeeeea');
    ctx.beginPath(); ctx.moveTo(-20, 326); ctx.quadraticCurveTo(-30, 318 + Math.sin(TAU * f / 10) * 3, -28, 312); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = '#eeeeea'; ctx.lineWidth = 2; ctx.stroke();
    const hy = p.peek ? 340 : 314;
    box(14, hy - 10, 22, 20, '#eeeeea', 7);
    ctx.beginPath(); ctx.moveTo(16, hy - 8); ctx.lineTo(10, hy + 4); ctx.lineTo(18, hy + 2); ctx.closePath(); paint('#8a6a52', INK, 1.5);
    box(22, hy - 5, 12, 7, '#23384d', 2, 1);
    circle(25, hy - 1.5, 1.6, '#7fd3ff', null); circle(31, hy - 1.5, 1.6, '#7fd3ff', null);
    ctx.restore();
    if (p.peek && f % 8 < 6) text('?', p.x + 30, 316, 16, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#3e6f9e' });
  });

  // Wäscheroboter faltet ein Handtuch, sehr langsam
  box(560, 300, 76, 8, '#a8763f', 0, 2); line(568, 308, 568, 358, INK, 3); line(628, 308, 628, 358, INK, 3);
  withAlpha('waesche', () => {
    box(574, 224, 50, 40, '#e6e3da', 8);
    box(580, 232, 38, 22, '#23384d', 3, 1.5);
    text('19:59', 599, 247, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' });
    const t = foldT(f), shrug = f >= 46 && f < 56;
    const lh = { x: lerp(572, 596, t), y: lerp(296, 292 - 18 * Math.sin(Math.PI * t), t) };
    box(lerp(566, 596, t), 294, lerp(64, 34, t), 6, '#7fd3ff', 1, 1.5);
    if (t > 0.05 && t < 0.98) box(lh.x - 2, lh.y - 4, 26 * (1 - t) + 4, 6, '#a9dcf5', 1, 1.2);
    limb(580, 258, shrug ? 568 : lh.x, shrug ? 236 : lh.y, 5, '#e6e3da');
    limb(618, 258, shrug ? 632 : 626, shrug ? 236 : 292, 5, '#e6e3da');
    if (shrug) text('¯\\_(ツ)_/¯', 600, 214, 11, { align: 'center', color: '#3e6f9e' });
  });
}

registerRoom({
  key: 'wohnen', offset: 22, name: 'Wohnbereich', level: 'Ebene 4',
  hitOrder: ['igel', 'zwerg', 'hund2', 'opa', 'maeher', 'fenster', 'waesche'],
  robots: [
    { id: 'maeher', echt: 'Viele Mähroboter stoßen Hindernisse tatsächlich erst an und drehen dann um. Neuere erkennen sie vorher mit einer Kamera.', name: 'Mähroboter', bereich: 'Haushalt', aera: 'seit 1995', typ: 'Rasenmäher-Roboter',
      fakt: 'Husqvarna brachte 1995 einen solarbetriebenen Mähroboter auf den Markt. Heute halten die meisten Geräte über einen Begrenzungsdraht oder per Satellitenortung ihre Fläche ein. Viele haben einen Regensensor und fahren bei Regen zurück in die Station.',
      note: 'Stößt jede Runde mit dem Gartenzwerg zusammen. Bei Regen und abends bleibt er in der Station (oben „Wetter“ umschalten).', color: '#e6e3da',
      quelle: 'https://en.wikipedia.org/wiki/Robotic_lawn_mower',
      box: f => [WX + mowerX(f) - 32, WY + 318, 64, 36] },
    { id: 'igel', name: 'Igel', bereich: 'Tier', aera: 'kein Roboter', typ: 'Nachtaktiver Gartenbesucher',
      fakt: 'Igel sind nachts unterwegs und rollen sich bei Gefahr zusammen, statt wegzulaufen. Naturschützer raten deshalb, Mähroboter nachts nicht fahren zu lassen.',
      echt: 'Stimmt so. Erscheint nur, wenn oben „Wetter: Abend“ eingestellt ist.',
      note: 'Spaziert über den Rasen, solange der Mähroboter in seiner Station steht.', color: '#6b4a2a',
      box: f => istDunkel() ? [WX + 90 + 120 * (0.5 - 0.5 * Math.cos(TAU * f / 60)) - 26, WY + 326, 52, 24] : [-9999, 0, 0, 0] },
    { id: 'zwerg', echt: 'Gartenzwerge sind tatsächlich ein bekanntes Hindernis für Mähroboter. Wackeln tun sie meist nicht, sie fallen um.', name: 'Gartenzwerg', bereich: 'Spielzeug', aera: 'kein Roboter', typ: 'Hindernis',
      fakt: 'Ein klassisches Hindernis für Mähroboter. Viele Geräte erkennen es per Stoßsensor, also erst nach dem Zusammenstoß.',
      note: 'Wackelt. Hält aber durch.', color: '#d9542b',
      box: () => [WX + 218, WY + 282, 30, 66] },
    { id: 'fenster', quelle: 'https://de.wikipedia.org/wiki/Fensterputzroboter', echt: 'Realistisch, inklusive Sicherungsleine.', name: 'Fensterputzroboter', bereich: 'Haushalt', aera: 'seit den 2010ern', typ: 'Saugt sich an der Scheibe fest',
      fakt: 'Fensterputzroboter halten sich mit Unterdruck an der Scheibe fest und fahren sie in Bahnen ab. Eine Sicherungsleine fängt sie auf, falls der Strom ausfällt.',
      note: 'Putzt jede Runde dasselbe Fenster. Die Flecken bleiben trotzdem.', color: '#3b3d40',
      box: f => { const w = winBot(f); return [WX + w.x - 20, WY + w.y - 16, 40, 32]; } },
    { id: 'hund2', echt: 'Realistisch: Solche Roboterhunde erkennen ihren Ball und schieben ihn mit der Schnauze. Unter Möbel kommen sie tatsächlich schlecht.', name: 'Roboterhund', bereich: 'Haushalt', aera: 'seit 1999', typ: 'Spielgefährte auf vier Beinen',
      fakt: 'Sony brachte den Roboterhund AIBO 1999 auf den Markt, 2018 folgte eine neue Version. Er erkennt seinen rosa Ball und seinen Spielknochen und lernt mit der Zeit Gesichter seiner Familie.',
      note: 'Schubst den Ball unter den Sessel und schaut dann lange nach.', color: '#eeeeea',
      quelle: 'https://en.wikipedia.org/wiki/AIBO',
      box: f => [WX + dogPose(f).x - 32, WY + 300, 72, 60] },
    { id: 'opa', name: 'Bewohner', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch im Sessel',
      fakt: 'Liest Zeitung und schaut dem Roboterhund zu. Wenn der Ball unter dem Sessel liegt, lässt er die Zeitung sinken. Einmal pro Runde bringt ihm der Hauslieferroboter ein Paket aus dem Hafen.',
      echt: 'Riesiger Karton für ein winziges Teil: Das passiert beim Versand wirklich ständig.',
      note: 'Im Paket ist eine einzelne rote Socke. Der Saugroboter in der Kantine frisst ja ständig welche.', color: '#8a5a3c',
      box: () => [WX + 474, WY + 238, 60, 122] },
    { id: 'waesche', echt: 'Wäschefalten ist für Roboter bis heute schwer, für Fabriken gibt es aber Faltmaschinen. Mit den Schultern zucken können Roboter nicht.', name: 'Wäscheroboter', bereich: 'Haushalt', aera: 'Forschung', typ: 'Zweiarmiger Haushaltsroboter',
      fakt: 'Weiche Stoffe sind für Roboter besonders schwer zu greifen. 2010 faltete ein Forschungsroboter an der University of California in Berkeley Handtücher zuverlässig, brauchte dafür aber rund 20 Minuten pro Stück.',
      note: 'Faltet das Handtuch fast fertig. Dann geht es wieder auf. Restzeit: 19:59.', color: '#e6e3da',
      quelle: 'https://spectrum.ieee.org/pr2-close-to-completing-laundry-cycle',
      box: () => [WX + 560, WY + 210, 78, 98] },
  ],
  draw: drawWohnen,
});
