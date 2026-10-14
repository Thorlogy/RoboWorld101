/* Außenfelder rechts vom Science-Fiction-Deck: Ladepark (c 13), Fusionsforschung (c 14), Feuerwache (c 15)
   Alle laufen auf der globalen Uhr state.g (0–479) und schließen nahtlos. */
const LPX = rx(roomOf('ladepark').c), LPY = ry(roomOf('ladepark').r);
const FUX = rx(roomOf('fusion').c), FUY = ry(roomOf('fusion').r);
const FWX = rx(roomOf('feuerwache').c), FWY = ry(roomOf('feuerwache').r);
function hofBoden(farbe = '#a9aca8') { ctx.fillStyle = farbe; ctx.fillRect(0, 384, RW, 24); line(0, 384, RW, 384, INK, 2); }
function standArm(S, hand, farbe, l1 = 60, l2 = 56) {
  const E = ik2(S, hand, l1, l2);
  limb(S.x, S.y, E.x, E.y, 11, farbe); limb(E.x, E.y, hand.x, hand.y, 9, farbe);
  circle(S.x, S.y, 6, '#3b3d40'); circle(E.x, E.y, 5, '#3b3d40');
  return E;
}

/* ---------- Ladepark ---------- */
// Laderoboter (Vorbild Hyundai ACR): steckt den Stecker selbst ein und wieder aus
function lpStecker(g) { return seg(g, 50, 110) - seg(g, 400, 450); }
function drawLadepark(f) {
  const g = state.g, s = lpStecker(g);
  hofBoden();
  ctx.fillStyle = '#f3f1ea'; for (const x of [120, 470]) ctx.fillRect(x, 386, 4, 20);
  text('LADEPARK', 230, 70, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Dach mit Solarmodulen über dem Stellplatz
  ctx.fillStyle = '#5d6064'; ctx.fillRect(40, 150, 8, 234); ctx.fillRect(430, 150, 8, 234);
  for (let i = 0; i < 7; i++) { ctx.beginPath(); const x = 30 + i * 60; ctx.moveTo(x, 150); ctx.lineTo(x + 54, 150); ctx.lineTo(x + 48, 132); ctx.lineTo(x + 4, 132); ctx.closePath(); paint('#23384d', INK, 1.5); }
  // Auto (Front rechts, Ladeklappe hinten links)
  car(290, 384, '#3e6f9e');
  const port = { x: 290 - 140, y: 384 - 62 };
  box(port.x - 6, port.y - 6, 12, 12, s > 0.9 ? '#3b3d40' : '#3e6f9e', 1, 1.2);
  // Ladesäule mit Roboterarm
  withAlpha('laderoboter', () => {
    box(60, 220, 30, 164, '#e6e3da', 3, 2);
    box(64, 232, 22, 18, '#23384d', 1, 1.2);
    const pct = g < 110 ? 20 : g < 400 ? Math.round(20 + 60 * seg(g, 110, 400)) : 80;
    text(pct + '%', 75, 245, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
    const ruhe = { x: 112, y: 300 }, hand = s > 0 ? mix(ruhe, { x: port.x - 10, y: port.y }, ease(s)) : ruhe;
    standArm({ x: 90, y: 270 }, hand, '#d6d9dc', 44, 42);
    box(hand.x - 4, hand.y - 6, 14, 12, '#2a2723', 2, 1.2);
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(75, 300); ctx.quadraticCurveTo(80, 360, hand.x, hand.y + 4); ctx.stroke();
    // Sicherheitsstab mit Laser
    line(30, 384, 30, 300, '#f0b429', 4); circle(30, 298, 3, g % 12 < 6 ? '#d9342b' : '#5d1f1b', null);
  });
  // Batteriespeicher: lädt tagsüber, gibt nachts ab
  withAlpha('speicher2', () => {
    box(480, 270, 140, 114, '#e6e3da', 2, 2);
    for (let i = 0; i < 4; i++) line(500 + i * 30, 280, 500 + i * 30, 374, '#cfc9ba', 3);
    const voll = istDunkel() ? 0.85 - 0.6 * seg(g, 0, 480) : 0.25 + 0.6 * seg(g, 0, 480);
    box(492, 252, 116, 12, '#2a2723', 0, 1.5); ctx.fillStyle = istDunkel() ? '#f0b429' : '#7fe08a'; ctx.fillRect(494, 254, 112 * voll, 8);
    text('SPEICHER', 550, 330, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  });
}

/* ---------- Fusionsforschung ---------- */
// Ablauf: 0–180 Plasma brennt · 180–220 aus · 220–440 Greifarm fährt hinein und tauscht eine Kachel · 440–480 zurück
function fuArm(g) { return seg(g, 220, 290) - seg(g, 420, 470); }
function drawFusion(f) {
  const g = state.g, cx = 300, cy = 236, arm = fuArm(g), plasma = g < 180 ? 1 : g < 220 ? 1 - seg(g, 180, 220) : 0;
  hofBoden('#b7b2a6');
  // Halle
  ctx.fillStyle = '#cdd0cc'; ctx.fillRect(10, 70, 620, 314); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.strokeRect(10, 70, 620, 314);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 60, 640, 12);
  text('FUSIONSFORSCHUNG', 30, 110, 32, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  withAlpha('fusionsanlage', () => {
    // Magnetspulen um das Gefäß, Gefäß im Schnitt (D-Form links und rechts)
    for (let i = -3; i <= 3; i++) box(cx + i * 34 - 10, cy - 128, 20, 256, '#b87333', 4, 1.5);
    ctx.beginPath(); ctx.ellipse(cx, cy, 150, 112, 0, 0, TAU); paint('#8a8f94', INK, 2.5);
    ctx.beginPath(); ctx.ellipse(cx, cy, 128, 92, 0, 0, TAU); paint('#3b3d40', INK, 2);
    ctx.beginPath(); ctx.ellipse(cx, cy, 44, 60, 0, 0, TAU); paint('#8a8f94', INK, 2);
    // Wandkacheln
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, x = cx + Math.cos(a) * 120, y = cy + Math.sin(a) * 85; box(x - 6, y - 6, 12, 12, i === 3 && g > 330 && g < 420 ? '#d6d9dc' : '#6d6a64', 1, 1); }
    if (plasma > 0) {
      ctx.save(); ctx.globalAlpha *= plasma;
      for (const [rx_, ry_, c] of [[100, 72, 'rgba(255,120,200,0.35)'], [90, 64, 'rgba(255,170,220,0.55)'], [84, 58, 'rgba(255,230,245,0.6)']]) {
        ctx.beginPath(); ctx.ellipse(cx, cy, rx_, ry_, 0, 0, TAU); ctx.ellipse(cx, cy, 50, 66, 0, 0, TAU); ctx.fillStyle = c; ctx.fill('evenodd');
      }
      ctx.restore();
    }
    // Öffnung rechts
    box(cx + 140, cy - 24, 40, 48, '#5d6064', 2, 2);
  });
  // Greifarm auf langem Ausleger, fährt durch die Öffnung
  withAlpha('fusionsarm', () => {
    const tipX = lerp(cx + 260, cx + 112, arm), tipY = cy - 50 * arm;
    box(cx + 250, cy + 40, 90, 108, '#f0b429', 2, 2);
    ctx.lineCap = 'round';
    line(cx + 270, cy + 40, cx + 200 + 40 * (1 - arm), cy, INK, 16); line(cx + 270, cy + 40, cx + 200 + 40 * (1 - arm), cy, '#e0a526', 12);
    line(cx + 200 + 40 * (1 - arm), cy, tipX + 20, tipY, INK, 12); line(cx + 200 + 40 * (1 - arm), cy, tipX + 20, tipY, '#e0a526', 8);
    // Kopf mit zwei kleinen Armen
    box(tipX + 6, tipY - 10, 24, 20, '#d6d9dc', 3, 1.5);
    const greif = arm >= 1 ? Math.sin(g * 0.3) * 3 : 0;
    line(tipX + 6, tipY - 6, tipX - 8 + greif, tipY - 12, INK, 3); line(tipX + 6, tipY + 6, tipX - 8 - greif, tipY + 10, INK, 3);
    if (arm >= 1 && g > 300 && g < 330) box(tipX - 18, tipY - 6, 12, 12, '#6d6a64', 1, 1);
  });
  // Leitstand: Bediener mit Steuerarmen und Bildschirm
  withAlpha('bediener', () => {
    box(20, 250, 124, 18, '#5d6064', 0, 1.5); box(34, 190, 84, 56, '#23384d', 2, 2);
    if (arm > 0) { box(40, 196, 72, 44, '#2f3a44', 1, 1); line(54, 230, 94, 206, '#7fd3ff', 2); }
    else text(plasma > 0 ? 'PLASMA AN' : 'AUS', 76, 222, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: plasma > 0 ? '#ff9fd8' : '#7fe08a' });
    person({ x: 70, foot: 384, face: 1, shirt: '#f3f1ea', pants: '#3d5a80', sit: true });
    line(100, 300, 106, 270, '#8a8f94', 4); line(120, 300, 128, 270, '#8a8f94', 4);
  });
}

/* ---------- Feuerwache ---------- */
// Übungsfeuer im Container (Gas): Löschroboter spritzt, Feuer geht aus, wird neu gezündet
function fwFlamme(f) { return f < 14 ? 1 : f < 40 ? 1 - seg(f, 14, 40) : f < 48 ? 0 : seg(f, 48, 60); }
function drawFeuerwache(f) {
  const g = state.g, fl = fwFlamme(f), spritz = f >= 10 && f < 44;
  hofBoden('#b0aca4');
  text('FEUERWACHE', 330, 70, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Wache mit offenem Tor und Löschfahrzeug
  box(10, 130, 270, 254, '#c6c1b6', 0, 2.5); ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 120, 290, 12);
  box(30, 190, 230, 194, '#3b3d40', 0, 2);
  ctx.beginPath(); ctx.moveTo(40, 384); ctx.lineTo(40, 240); ctx.lineTo(180, 240); ctx.lineTo(230, 290); ctx.lineTo(252, 300); ctx.lineTo(252, 384); ctx.closePath(); paint('#c8302b');
  box(186, 252, 40, 34, '#9fc4d6', 2, 1.5); ctx.fillStyle = '#f3f1ea'; ctx.fillRect(40, 330, 212, 8);
  for (const x of [80, 210]) { circle(x, 376, 18, '#2a2723', INK, 2); circle(x, 376, 7, '#8a8f94', INK, 1.5); }
  circle(150, 236, 6, istDunkel() || g % 24 < 12 ? '#5aa8ff' : '#2b4f7a', INK, 1.5);
  // Übungscontainer mit Gasfeuer
  withAlpha('uebungsfeuer', () => {
    box(500, 250, 130, 134, '#8a5a3c', 0, 2); box(510, 290, 54, 70, '#2a2723', 0, 1.5);
    if (fl > 0) for (let i = 0; i < 5; i++) {
      const h = (30 + 26 * rnd(i + f)) * fl, x = 518 + i * 10;
      ctx.beginPath(); ctx.moveTo(x - 7, 360); ctx.quadraticCurveTo(x - 6, 360 - h * 0.6, x, 360 - h); ctx.quadraticCurveTo(x + 6, 360 - h * 0.6, x + 7, 360); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#f08a24' : '#f0b429'; ctx.fill();
    }
    if (fl < 1) for (let i = 0; i < 4; i++) circle(530 + i * 9, 280 - ((f * 3 + i * 17) % 60), 8 + i * 2, 'rgba(200,200,200,0.45)', null);
  });
  // Löschroboter auf Ketten mit Wasserwerfer, ferngesteuert
  withAlpha('loeschroboter', () => {
    const x = 380, y = 384;
    box(x - 56, y - 26, 112, 26, '#2a2723', 12, 2);
    for (let i = 0; i < 6; i++) circle(x - 44 + i * 17.6, y - 13, 6, '#3b3d40', INK, 1);
    box(x - 44, y - 50, 88, 26, '#c8302b', 4, 2);
    box(x - 10, y - 70, 20, 20, '#5d6064', 2, 1.5);
    ctx.save(); ctx.translate(x, y - 62); ctx.rotate(-0.18); box(0, -6, 52, 12, '#8a8f94', 3, 1.5); ctx.restore();
    box(x - 34, y - 64, 16, 12, '#23384d', 2, 1.2);
    if (spritz) {
      ctx.strokeStyle = 'rgba(159,210,255,0.85)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 50, y - 72); ctx.quadraticCurveTo(x + 110, y - 110, 530, 330); ctx.stroke();
      for (let i = 0; i < 6; i++) circle(522 + rnd(i + f) * 30, 326 + rnd(i * 3 + f) * 30, 2.5, '#cfe8ff', null);
    }
  });
  withAlpha('feuerwehrfrau', () => {
    person({ x: 300, foot: 384, face: 1, shirt: '#2b3b4f', pants: '#2b3b4f', hat: true });
    box(306, 300, 18, 12, '#3b3d40', 2, 1.2);
  });
}

registerRoom({
  key: 'ladepark', name: 'Ladepark', level: 'Außengelände', hitOrder: ['laderoboter', 'speicher2'], draw: drawLadepark,
  robots: [
    { id: 'laderoboter', name: 'Laderoboter', bereich: 'Energie', aera: 'seit 2023', typ: 'Roboterarm an der Ladesäule', color: '#d6d9dc',
      fakt: 'Vorbild ist der Laderoboter von Hyundai, vorgestellt im März 2023. Eine 3D-Kamera und eine KI finden die Ladeklappe, der Arm steckt den Stecker ein und nach dem Laden wieder aus. Ein Stab mit Laser passt auf, dass niemand im Weg steht.',
      echt: 'Echt als Prototyp. An den meisten Ladesäulen steckt man den Stecker heute noch selbst ein.', note: 'Die Anzeige zählt mit, wie voll der Akku ist.',
      quelle: 'https://www.hyundai.news/eu/articles/press-releases/newly-developed-automatic-charging-robot-for-electric-vehicles.html',
      box: () => [LPX + 20, LPY + 220, 140, 164] },
    { id: 'speicher2', name: 'Batteriespeicher', bereich: 'Energie', aera: 'heute', typ: 'Akku im Container', color: '#e6e3da',
      fakt: 'Große Akkus in Containern speichern tagsüber Strom vom Solardach und geben ihn abends und nachts wieder ab, wenn die Sonne nicht scheint.',
      echt: 'Echt. Tagsüber füllt sich die Anzeige grün, abends und nachts leert sie sich gelb.', note: 'Kein Roboter, aber ohne ihn würde nachts niemand laden.',
      box: () => [LPX + 480, LPY + 250, 140, 134] },
  ],
});
registerRoom({
  key: 'fusion', name: 'Fusionsforschung', level: 'Außengelände', hitOrder: ['bediener', 'fusionsarm', 'fusionsanlage'], draw: drawFusion,
  robots: [
    { id: 'fusionsanlage', name: 'Fusionsanlage', bereich: 'Energie', aera: 'Forschung', typ: 'Ring aus Magneten (Tokamak)', color: '#b87333',
      fakt: 'In solchen Anlagen wird Gas so heiß, dass Atomkerne miteinander verschmelzen, ähnlich wie in der Sonne. Starke Magnete halten das über hundert Millionen Grad heiße Plasma in einem Ring, ohne dass es die Wand berührt. Strom fürs Netz liefert noch keine Anlage, es wird geforscht.',
      echt: 'Echt als Forschung. Der Wechsel zwischen Plasma und Wartung dauert in echt Wochen, nicht Sekunden.', note: 'Erst leuchtet das Plasma, dann wird abgeschaltet und gewartet.',
      quelle: 'https://world-nuclear-news.org/articles/remote-handling-upgrades-to-aid-decommissioning-of',
      box: () => [FUX + 140, FUY + 108, 330, 260] },
    { id: 'fusionsarm', name: 'Fernhantierungs-Arm', bereich: 'Energie', aera: 'an JET bis 2023', typ: 'Ferngesteuerter Greifarm auf Ausleger', color: '#e0a526',
      fakt: 'Vorbild ist MASCOT an der Fusionsanlage JET in Culham bei Oxford. Ein Mensch steuert ihn von außen und spürt dabei über Force-Feedback, was der Arm im Inneren fühlt. Er versetzt Bauteile und zieht Schrauben fest. JET hat Ende 2023 aufgehört; jetzt bauen die Arme mehr als 4000 Kacheln aus.',
      echt: 'Echt. Hinein darf kein Mensch, deshalb arbeitet dort nur der Arm.', note: 'Fährt erst hinein, wenn das Plasma aus ist, und tauscht eine Kachel.',
      quelle: 'https://world-nuclear-news.org/articles/remote-handling-upgrades-to-aid-decommissioning-of',
      box: () => { const a = fuArm(state.g); return [FUX + lerp(560, 400, a) - 20, FUY + 180, lerp(90, 250, a), 130]; } },
    { id: 'bediener', name: 'Bediener am Leitstand', bereich: 'Mensch', aera: 'Maßstab', typ: 'steuert den Arm von außen', color: '#f3f1ea',
      fakt: 'Die Bedienerinnen und Bediener bewegen einen zweiten Arm vor sich. Der Arm im Inneren macht jede Bewegung nach.', echt: 'Echt, so funktioniert Fernhantierung.', note: 'Sieht auf dem Bildschirm, was die Kamera am Arm sieht.',
      box: () => [FUX + 20, FUY + 190, 124, 194] },
  ],
});
registerRoom({
  key: 'feuerwache', name: 'Feuerwache', level: 'Außengelände', hitOrder: ['feuerwehrfrau', 'loeschroboter', 'uebungsfeuer'], draw: drawFeuerwache,
  robots: [
    { id: 'loeschroboter', name: 'Löschroboter', bereich: 'Rettung', aera: 'seit etwa 2017', typ: 'Kettenfahrzeug mit Wasserwerfer', color: '#c8302b',
      fakt: 'Vorbild ist Colossus von Shark Robotics aus Frankreich: 1,6 Meter lang, 485 Kilogramm schwer, mit Ketten und Wasserwerfer. In der Nacht des 15. April 2019 half er der Pariser Feuerwehr beim Brand von Notre-Dame.',
      echt: 'Echt. Er fährt nicht allein, eine Feuerwehrfrau steuert ihn per Fernbedienung, damit kein Mensch zu nah ans Feuer muss.', note: 'Übt am Container: Feuer aus, neu angezündet, wieder aus.',
      quelle: 'https://robotsguide.com/robots/colossus',
      box: () => [FWX + 320, FWY + 310, 130, 74] },
    { id: 'uebungsfeuer', name: 'Übungscontainer', bereich: 'Rettung', aera: 'heute', typ: 'Gasfeuer zum Üben', color: '#8a5a3c',
      fakt: 'Feuerwehren üben an Containern, in denen ein Gasfeuer brennt. Es lässt sich jederzeit abschalten und wieder anzünden.', echt: 'Echt.', note: 'Brennt, geht aus, brennt wieder.',
      box: () => [FWX + 500, FWY + 250, 130, 134] },
    { id: 'feuerwehrfrau', name: 'Feuerwehrfrau', bereich: 'Mensch', aera: 'Maßstab', typ: 'steuert den Löschroboter', color: '#2b3b4f',
      fakt: 'Sie hält die Fernbedienung und sieht über die Kameras des Roboters, wohin er fährt.', note: 'Bleibt in sicherem Abstand.',
      box: () => [FWX + 275, FWY + 262, 55, 122] },
  ],
});
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  laderoboter: 'Dieser Roboterarm steckt das Ladekabel selbst ins Elektroauto. Eine Kamera zeigt ihm, wo die Klappe ist.',
  speicher2: 'Das ist ein riesiger Akku. Tagsüber wird er mit Sonnenstrom voll, nachts gibt er den Strom wieder ab.',
  fusionsanlage: 'Hier versuchen Forscher, Energie zu machen wie die Sonne. Dafür wird Gas ganz, ganz heiß.',
  fusionsarm: 'Dieser lange Arm fährt in die Anlage, weil dort kein Mensch hinein darf. Ein Mensch steuert ihn von außen.',
  bediener: 'Er bewegt einen Arm vor sich, und der Roboterarm drinnen macht alles genauso nach.',
  loeschroboter: 'Dieser Roboter fährt auf Ketten nah ans Feuer und löscht mit Wasser. Eine Feuerwehrfrau steuert ihn aus sicherer Entfernung.',
  uebungsfeuer: 'Hier üben Feuerwehrleute. Das Feuer kann man an- und ausmachen.',
  feuerwehrfrau: 'Sie steuert den Löschroboter mit einer Fernbedienung.',
}));
