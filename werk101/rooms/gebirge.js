/* Gebirge ganz links (c −21 bis −13): aufgeschnittener Berg mit Tunnelbaustelle, Maßstab etwa 1 : 5 (1 m ≈ 13,7 Einheiten).
   Oben der Haupttunnel im Sprengvortrieb, ein Zyklus pro Minute (state.g):
   0–20 Bohrwagen fährt vor, 20–110 bohrt, 110–130 zurück; 130–150 Ladewagen vor, 150–200 lädt, 200–220 zurück;
   215–235 Warnung, 235 Sprengung, Staub bis 330; 250–290 Lader und Dumper kommen, 290–380 Schuttern, 380–440 Dumper fährt zur Halde;
   380–400 Spritzbetonroboter vor, 400–465 sprüht, 465–480 zurück.
   Darunter der Erkundungsstollen mit Tunnelbohrmaschine, Förderband über den Schacht auf die Halde.
   Die Baustelle wird in Koordinaten „Portal rechts, Ortsbrust links“ gezeichnet und dann gespiegelt und um BG_DY nach unten
   geschoben (bgSpiegel): Sie liegt so als zweite Röhre auf Bodenhöhe mit Portal West (BG_XL) und Baustelle links davon.
   Oben läuft die fertige Röhre der Magnetbahn auf Höhe des Fahrwegs (MG_Y) von BG_MLP bis zum Portal Ost (BG_P),
   dann über das Plateau und auf Stelzen über den Stausee. */
const BG_P = SEEX0 - 1600, BG_TY = GROUND - 300, BG_TC = BG_TY - 135;   // Portal, Sohle, Firste
const BG_F = SEEX0 - 3000, BG_S = BG_P - 260;                           // Ortsbrust, Schalwagen (180 lang)
const BG_XL = SEEX0 - 4240, BG_MLP = SEEX0 - 3900, BG_MX = (BG_XL + BG_P) / 2, BG_DY = 300;   // Portal West, Magnetbahn-Portal West, Spiegelachse
const BG_GY = GROUND - 110, BG_GT = BG_GY - 80, BG_F2 = SEEX0 - 3260, BG_GS = BG_P + 90;   // Erkundungsstollen, Schacht
const BG_BERG = [[BG_P, BG_TY - 180], [BG_P - 70, BG_TY - 240], [BG_P - 200, GROUND - 650], [SEEX0 - 2000, GROUND - 900], [SEEX0 - 2350, GROUND - 1350],
  [SEEX0 - 2600, GROUND - 1150], [SEEX0 - 2750, GROUND - 1220], [SEEX0 - 3000, GROUND - 1420], [SEEX0 - 3350, GROUND - 1000], [SEEX0 - 3700, GROUND - 700],
  [SEEX0 - 3840, GROUND - 560], [BG_MLP, GROUND - 480], [BG_MLP, GROUND - 300], [SEEX0 - 4000, GROUND - 280], [SEEX0 - 4170, GROUND - 240], [BG_XL, GROUND - 180], [BG_XL, GROUND + 8]];
function bgOberY(x) {
  for (let i = 1; i < BG_BERG.length; i++) { const [x0, y0] = BG_BERG[i - 1], [x1, y1] = BG_BERG[i]; if (x >= x1 && x0 !== x1) return lerp(y0, y1, (x0 - x) / (x0 - x1)); }
  return GROUND;
}
function bgPfad(g, pts) {
  if (g <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (g <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], ease(seg(g, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
}
const BG_PJ = BG_F + 400, BG_WJ = BG_F + 62, BG_PC = BG_F + 640, BG_WC = BG_F + 60, BG_PS = BG_F + 870, BG_WS = BG_F + 130;
const BG_OL = BG_P + 200, BG_OD = BG_P + 620, BG_WD = BG_F + 230;
const bgJumbo = g => bgPfad(g, [[0, BG_PJ], [20, BG_WJ], [110, BG_WJ], [130, BG_PJ]]);
const bgLade = g => bgPfad(g, [[130, BG_PC], [150, BG_WC], [200, BG_WC], [220, BG_PC]]);
const bgSpritz = g => bgPfad(g, [[380, BG_PS], [400, BG_WS], [465, BG_WS], [480, BG_PS]]);
const bgDumper = g => bgPfad(g, [[250, BG_OD], [290, BG_WD], [380, BG_WD], [430, BG_OD]]);
function bgLader(g) {
  if (g < 290) return { x: bgPfad(g, [[255, BG_OL], [290, BG_F + 40]]), dir: -1, hoch: 0, voll: false };
  if (g >= 380) return { x: bgPfad(g, [[380, BG_F + 40], [420, BG_OL]]), dir: 1, hoch: 0, voll: false };
  const u = ((g - 290) / 22.5) % 1, hin = u < 0.5, v = ease(hin ? u * 2 : 2 - u * 2);
  return { x: lerp(BG_F + 40, BG_F + 140, v), dir: hin ? 1 : -1, hoch: hin ? v : 0, voll: hin && u < 0.45 };
}
// 6 Bohrlöcher: Arm 0 oben, Arm 1 unten, je drei nacheinander
const BG_LOCH = [BG_TY - 122, BG_TY - 102, BG_TY - 82, BG_TY - 55, BG_TY - 35, BG_TY - 15];
const bgLochTiefe = (i, g) => g >= 235 ? 0 : 55 * seg(g, 20 + (i % 3) * 30, 46 + (i % 3) * 30);
const bgGeladen = (i, g) => g >= 235 ? 0 : seg(g, 150 + i * 8, 158 + i * 8);
const MONO = '"IBM Plex Mono", monospace';
// Spiegeln: Weltkoordinate x der Baustelle → 2·BG_MX − x, y → y + BG_DY
const bgM = b => [2 * BG_MX - b[0] - b[2], b[1] + BG_DY, b[2], b[3]];
function bgText(t, x, y, size, o) { ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); text(t, 0, 0, size, o); ctx.restore(); }

function bgBerg() {
  const ab = istDunkel();
  ctx.save(); ctx.beginPath(); ctx.moveTo(BG_P, GROUND + 8); for (const [x, y] of BG_BERG) ctx.lineTo(x, y); ctx.closePath();
  ctx.fillStyle = ab ? '#3d3b45' : '#8c8172'; ctx.fill(); ctx.clip();
  // gefaltete Gesteinsschichten
  for (let k = 0; k < 9; k++) {
    ctx.strokeStyle = k % 2 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)'; ctx.lineWidth = 26; ctx.beginPath();
    for (let x = SEEX0 - 4600; x <= BG_P + 20; x += 40) { const y = GROUND - 80 - k * 150 + 70 * Math.sin((x - SEEX0) / 420 + k * 0.6); x === SEEX0 - 4600 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
  // Oberfläche: unten Wiese, oben Fels
  ctx.lineWidth = 8; ctx.lineJoin = 'round';
  for (let i = 1; i < BG_BERG.length; i++) {
    const [x0, y0] = BG_BERG[i - 1], [x1, y1] = BG_BERG[i], y = Math.min(y0, y1);
    ctx.strokeStyle = y > GROUND - 760 ? (ab ? '#2f4a33' : '#6f8f5a') : (ab ? '#3a3a40' : '#7d756a');
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  // Tannen am Hang
  for (const x of [BG_P - 260, BG_P - 330, SEEX0 - 3760, SEEX0 - 3810, SEEX0 - 3950, SEEX0 - 4080, SEEX0 - 4200]) {
    const y = bgOberY(x); ctx.fillStyle = ab ? '#203826' : '#3f6b45';
    ctx.beginPath(); ctx.moveTo(x - 14, y + 2); ctx.lineTo(x, y - 46); ctx.lineTo(x + 14, y + 2); ctx.closePath(); ctx.fill(); line(x, y + 4, x, y - 4, '#5b4a3a', 3);
  }
  bgSchnee(ab);
}

// Schnee als Decke auf der Oberfläche (im Schnitt nur eine dünne Schicht), unten in Rinnen ausgefranst
const bgSchneeGrenze = x => GROUND - 1060 + 110 * Math.sin((x - SEEX0) / 170) + 50 * Math.sin((x - SEEX0) / 53);
function bgSchnee(ab) {
  const lauf = [];
  for (let x = BG_P - 80; x >= SEEX0 - 3820; x -= 8) { const y = bgOberY(x), t = clamp((bgSchneeGrenze(x) - y) / 6, 0, 34); lauf.push([x, y, t]); }
  const unten = (x, y, t) => y + t * (0.7 + 0.3 * Math.sin(x * 0.11));
  let stueck = [];
  const zeichne = () => {
    if (stueck.length > 2) {
      ctx.beginPath(); stueck.forEach(([x, y], i) => i ? ctx.lineTo(x, y - 3) : ctx.moveTo(x, y - 3));
      for (let i = stueck.length - 1; i >= 0; i--) { const [x, y, t] = stueck[i]; ctx.lineTo(x, unten(x, y, t)); }
      ctx.closePath(); ctx.fillStyle = ab ? '#c3c8d8' : '#f7f8f5'; ctx.fill();
      ctx.strokeStyle = ab ? 'rgba(70,80,120,0.7)' : 'rgba(140,165,200,0.8)'; ctx.lineWidth = 2.5; ctx.beginPath();
      stueck.forEach(([x, y, t], i) => i ? ctx.lineTo(x, unten(x, y, t)) : ctx.moveTo(x, unten(x, y, t))); ctx.stroke();
      // Felsköpfe schauen heraus
      ctx.fillStyle = ab ? '#3a3a40' : '#6f665b';
      stueck.forEach(([x, y, t], i) => { if (i % 9 === 4 && t > 10) { ctx.beginPath(); ctx.moveTo(x - 6, y + 4); ctx.lineTo(x, y - 4); ctx.lineTo(x + 7, y + 5); ctx.closePath(); ctx.fill(); } });
    }
    stueck = [];
  };
  for (const p of lauf) { if (p[2] > 0.8) stueck.push(p); else zeichne(); } zeichne();
  // Schneefahne am Gipfel: der Wind bläst Schnee vom Grat
  const g = state.g;
  for (const [x, y] of [[SEEX0 - 3000, GROUND - 1420], [SEEX0 - 2350, GROUND - 1350]]) {
    for (let k = 0; k < 5; k++) { const u = ((g / 480) * 3 + k / 5) % 1; ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - u)})`; ctx.beginPath(); ctx.ellipse(x + 30 + u * 220, y + 6 - u * 30 + 6 * Math.sin(g * 0.1 + k), 20 + u * 50, 6 + u * 10, -0.1, 0, TAU); ctx.fill(); }
  }
}

// Fertige Röhre der Magnetbahn auf Höhe des Fahrwegs, Fahrweg weiter über Plateau und Stausee
function bgMagnet(g) {
  const ab = istDunkel(), y0 = BG_TC, y1 = BG_TY;
  ctx.fillStyle = ab ? '#5c5a56' : '#bdb8ad'; ctx.fillRect(BG_MLP, y0, BG_P - BG_MLP, y1 - y0);
  ctx.fillStyle = ab ? '#6e6b66' : '#d6d1c4'; ctx.fillRect(BG_MLP, y0, BG_P - BG_MLP, 14);
  for (let x = BG_MLP + 150; x < BG_P; x += 150) line(x, y0, x, y0 + 14, 'rgba(0,0,0,0.25)', 1.2);
  for (let x = BG_MLP + 60; x < BG_P; x += 120) { const r = ctx.createRadialGradient(x, y0 + 24, 2, x, y0 + 24, 70); r.addColorStop(0, 'rgba(255,240,190,0.35)'); r.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = r; ctx.fillRect(x - 70, y0, 140, y1 - y0); circle(x, y0 + 24, 3, '#fff3c4', INK, 0.8); }
  // Fluchttüren zu Querschlägen mit grünem Schild
  for (let x = BG_MLP + 330; x < BG_P - 100; x += 500) { box(x, y1 - 58, 24, 34, '#8a8f94', 1, 1.2); box(x - 4, y1 - 74, 32, 10, '#3f9a5a', 1, 1); }
  line(BG_MLP, y0, BG_P, y0, INK, 2); line(BG_MLP, y1, BG_P, y1, INK, 2);
  // Portale
  for (const x of [BG_MLP, BG_P]) box(x - 14, y0 - 40, 28, 40, '#c9c4b8', 0, 1.5);
  // Stelzen links (Hang) und über dem See
  const st = (x, unten) => { ctx.fillStyle = ab ? '#424b66' : '#aab5b6'; ctx.fillRect(x, MG_Y + 32, 22, unten - MG_Y - 32); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(x, MG_Y + 32, 22, unten - MG_Y - 32); };
  for (let x = BG_MLP - 160; x > BG_XL; x -= 120) st(x, bgOberY(x) + 4);
  if (typeof stBettY === 'function') for (let x = ST_XL + 60; x < ST_XD - 40; x += 210) {
    st(x, stBettY(x)); ctx.fillStyle = ab ? 'rgba(30,53,80,0.55)' : 'rgba(79,127,156,0.55)'; ctx.fillRect(x, ST_WS, 22, stBettY(x) - ST_WS);
  }
  // Fahrweg und Zug nur in den Bereichen zeichnen, die Berg und See sonst verdecken
  ctx.save(); ctx.beginPath();
  ctx.rect(BG_XL - 20, MG_Y - 80, BG_MLP - BG_XL + 20, 120); ctx.rect(BG_MLP, y0, BG_P - BG_MLP, y1 - y0); ctx.rect(BG_P, MG_Y - 80, ST_XD - BG_P, 112);
  ctx.clip(); if (typeof drawMaglevBack === 'function') drawMaglevBack(g); ctx.restore();
  withAlpha('bgmagtunnel', () => { box(BG_MLP + 600, y1 - 30, 70, 18, '#23384d', 1, 1); text('400 km/h', BG_MLP + 635, y1 - 17, 9, { family: MONO, weight: 500, align: 'center', color: '#7fe08a' }); });
}

function bgRoehre(g) {
  // Haupttunnel: Hohlraum, Spritzbeton, Abdichtung, Innenschale
  ctx.fillStyle = '#4a4640'; ctx.fillRect(BG_F, BG_TC, BG_P - BG_F, BG_TY - BG_TC);
  ctx.fillStyle = '#9b958a'; ctx.fillRect(BG_F, BG_TC, BG_S - BG_F, 8); ctx.fillRect(BG_F, BG_TY - 4, BG_P - BG_F, 4);
  ctx.fillStyle = '#e0b43a'; ctx.fillRect(BG_S - 200, BG_TC + 8, 200, 4);                       // Abdichtungsfolie
  ctx.fillStyle = '#d6d1c4'; ctx.fillRect(BG_S, BG_TC, BG_P - BG_S, 14);                         // Innenschale
  for (let x = BG_S + 150; x < BG_P; x += 150) line(x, BG_TC, x, BG_TC + 14, 'rgba(0,0,0,0.3)', 1.2);
  line(BG_F, BG_TC, BG_P, BG_TC, INK, 2); line(BG_F, BG_TY, BG_P + 2, BG_TY, INK, 2);
  // frischer Spritzbeton an der Ortsbrust
  const nass = g >= 400 ? seg(g, 400, 465) : 1 - seg(g, 0, 90);
  if (nass > 0) { ctx.fillStyle = `rgba(70,68,64,${0.55 * nass})`; ctx.fillRect(BG_F, BG_TC, 260, 10); }
  // Lampen an der Firste
  for (let x = BG_F + 60; x < BG_P; x += 120) {
    const r = ctx.createRadialGradient(x, BG_TC + 30, 2, x, BG_TC + 30, 70); r.addColorStop(0, 'rgba(255,240,190,0.28)'); r.addColorStop(1, 'rgba(255,240,190,0)');
    ctx.fillStyle = r; ctx.fillRect(x - 70, BG_TC, 140, BG_TY - BG_TC); circle(x, BG_TC + 30, 3, '#fff3c4', INK, 0.8);
  }
  // Ortsbrust mit Bohrlöchern
  line(BG_F, BG_TC, BG_F, BG_TY, INK, 2);
  BG_LOCH.forEach((y, i) => {
    const d = bgLochTiefe(i, g); if (d <= 0) return;
    ctx.fillStyle = '#26231f'; ctx.fillRect(BG_F - d, y - 2, d, 4);
    const l = bgGeladen(i, g); if (l > 0) { ctx.fillStyle = '#e0662b'; ctx.fillRect(BG_F - d, y - 2, d * l, 4); }
  });
}

function bgSchalwagen() {
  withAlpha('bgschal', () => {
    const x = BG_S, c = '#3e6f9e';
    box(x - 4, BG_TC + 14, 188, 12, '#5d6064', 0, 1.5);
    for (const dx of [0, 170]) box(x + dx, BG_TC + 26, 10, BG_TY - BG_TC - 26, c, 0, 1.2);
    ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 10, BG_TC + 70); ctx.lineTo(x + 60, BG_TC + 26); ctx.moveTo(x + 170, BG_TC + 70); ctx.lineTo(x + 120, BG_TC + 26); ctx.stroke();
    person({ x: x + 90, foot: BG_TC + 14.001, face: 1, shirt: '#f08a24', hat: '#f3f1ea', s: 0.2 });
  });
}

function bgLutte(g) {
  // Lüfter auf dem Plateau, Luttenrohr bis kurz vor die Ortsbrust
  const x = BG_P + 24, y = BG_TC + 12;
  ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x + 32, BG_TY - 56); ctx.lineTo(x + 32, y); ctx.lineTo(BG_F + 250, y); ctx.stroke();
  ctx.strokeStyle = '#f0b429'; ctx.lineWidth = 9; ctx.stroke();
  for (let i = 0; i < 40; i++) { const sx = BG_F + 280 + i * 60; if (sx < BG_P) line(sx, y - 4, sx, y + 4, '#c48a12', 1.5); }
  withAlpha('bglutte', () => {
    box(x, BG_TY - 60, 64, 60, '#3e6f9e', 4, 1.5);
    circle(x + 32, BG_TY - 30, 22, '#23384d', INK, 1.2);
    ctx.save(); ctx.translate(x + 32, BG_TY - 30); ctx.rotate(g * 0.5); for (let i = 0; i < 4; i++) { ctx.rotate(TAU / 4); line(0, 0, 18, 0, '#c9ccc8', 3); } ctx.restore();
  });
  // Warnleuchte vor der Sprengung
  if (g >= 215 && g < 236) {
    const an = Math.floor(g / 3) % 2;
    circle(BG_F + 420, y + 24, 6, an ? '#ff8a1f' : '#7a3a10', INK, 1);
    box(BG_F + 440, y + 18, 140, 22, '#e0662b', 1, 1.2); bgText('ACHTUNG SPRENGUNG', BG_F + 510, y + 33, 9, { family: MONO, weight: 500, align: 'center', color: '#fff' });
  }
}

function bgJumboZeichnen(x, g) {
  const arbeit = Math.abs(x - BG_WJ) < 1 && g >= 20 && g < 110;
  for (const wx of [x + 90, x + 185]) circle(wx, BG_TY - 14, 14, '#2b2b2b', INK, 1.5);
  box(x + 64, BG_TY - 54, 146, 32, '#f0b429', 4, 1.5);
  box(x + 160, BG_TY - 104, 46, 50, '#f0b429', 4, 1.5); box(x + 168, BG_TY - 98, 30, 22, '#23384d', 2, 1);
  box(x + 174, BG_TY - 112, 18, 8, '#3b3d40', 2, 1);                                           // Laserscanner
  if (g >= 4 && g < 20) { ctx.fillStyle = 'rgba(255,60,60,0.18)'; ctx.beginPath(); ctx.moveTo(x + 183, BG_TY - 108); ctx.lineTo(BG_F, BG_TC); ctx.lineTo(BG_F, BG_TY); ctx.closePath(); ctx.fill(); }
  [0, 1].forEach(k => {
    const akt = arbeit ? Math.min(2, Math.floor((g - 20) / 30)) : 1, y = BG_LOCH[k * 3 + akt];
    const tip = x - 60, bx = x + 80, by = BG_TY - 62 + k * 12;
    limb(bx, by, tip + 58, y, 6, '#e0a020');
    box(tip, y - 4, 60, 8, '#3b3d40', 1, 1);
    if (arbeit && (g - 20) % 30 < 26) for (let j = 0; j < 3; j++) circle(tip - 4 + Math.sin(g + j * 2) * 3, y - 6 + j * 5, 2 + (g + j) % 3, 'rgba(210,205,195,0.7)', null);
  });
}
function bgLadeZeichnen(x, g) {
  const arbeit = Math.abs(x - BG_WC) < 1 && g >= 150 && g < 200;
  for (const wx of [x + 70, x + 165]) circle(wx, BG_TY - 14, 14, '#2b2b2b', INK, 1.5);
  box(x + 44, BG_TY - 50, 150, 28, '#3e6f9e', 4, 1.5);
  box(x + 80, BG_TY - 92, 64, 42, '#e6e3da', 6, 1.5); bgText('EMULSION', x + 112, BG_TY - 68, 7, { family: MONO, weight: 500, align: 'center' });
  box(x + 150, BG_TY - 100, 42, 50, '#3e6f9e', 4, 1.5); box(x + 157, BG_TY - 94, 28, 22, '#23384d', 2, 1);
  [0, 1].forEach(k => {
    const i = arbeit ? Math.min(5, Math.floor((g - 150) / 8)) : 0, y = k === 0 ? BG_LOCH[Math.min(2, i)] : BG_LOCH[3 + Math.max(0, Math.min(2, i - 3))];
    const tip = x - 58, bx = x + 60, by = BG_TY - 58 + k * 12;
    limb(bx, by, tip + 40, y, 5, '#9fb6c9'); box(tip, y - 4, 42, 8, '#3b3d40', 1, 1);
    if (arbeit) line(tip, y, BG_F - 10, y, '#e0662b', 2);
  });
}
function bgLaderZeichnen(p) {
  ctx.save(); if (p.dir > 0) { ctx.translate(2 * p.x + 130, 0); ctx.scale(-1, 1); }
  const x = p.x, by = BG_TY - 30 - p.hoch * 46;
  for (const wx of [x + 50, x + 112]) circle(wx, BG_TY - 14, 14, '#2b2b2b', INK, 1.5);
  box(x + 34, BG_TY - 48, 96, 28, '#f0b429', 4, 1.5); box(x + 84, BG_TY - 82, 30, 34, '#f0b429', 4, 1.5); box(x + 90, BG_TY - 76, 18, 16, '#23384d', 2, 1);
  limb(x + 46, BG_TY - 40, x + 22, by, 6, '#e0a020');
  if (p.voll) { ctx.fillStyle = '#6d655b'; ctx.beginPath(); ctx.ellipse(x + 14, by - 10, 16, 8, 0, Math.PI, TAU); ctx.fill(); }
  box(x, by - 10, 30, 22, '#3b3d40', 3, 1.2);
  ctx.restore();
}
function bgDumperZeichnen(x, g) {
  const ladung = g < 290 ? 0 : g < 380 ? Math.floor((g - 290) / 22.5 + 0.5) / 4 : g < 445 ? 1 : 0;
  const kipp = g >= 430 && g < 470 ? Math.sin(Math.PI * seg(g, 430, 470)) : 0;
  for (const wx of [x + 34, x + 124]) circle(wx, BG_TY - 14, 14, '#2b2b2b', INK, 1.5);
  box(x, BG_TY - 36, 156, 16, '#3b3d40', 2, 1.2);
  box(x + 104, BG_TY - 84, 46, 48, '#e0662b', 4, 1.5); box(x + 112, BG_TY - 78, 30, 20, '#23384d', 2, 1);
  ctx.save(); ctx.translate(x, BG_TY - 36); ctx.rotate(-kipp * 0.5);
  if (ladung > 0) { ctx.fillStyle = '#6d655b'; ctx.beginPath(); ctx.ellipse(48, -38, 44, 10 + 12 * ladung, 0, Math.PI, TAU); ctx.fill(); }
  box(0, -38, 96, 38, '#e0662b', 3, 1.5);
  ctx.restore();
  if (kipp > 0.2) for (let j = 0; j < 5; j++) circle(x - 6 - j * 4, BG_TY - 40 + ((g * 3 + j * 9) % 30), 3, '#6d655b', null);
}
function bgSpritzZeichnen(x, g) {
  const arbeit = Math.abs(x - BG_WS) < 1 && g >= 400 && g < 465;
  for (const wx of [x + 70, x + 170]) circle(wx, BG_TY - 14, 14, '#2b2b2b', INK, 1.5);
  box(x + 50, BG_TY - 50, 150, 28, '#d9d4c7', 4, 1.5); ctx.fillStyle = '#e0662b'; ctx.fillRect(x + 52, BG_TY - 34, 146, 4);
  box(x + 90, BG_TY - 84, 44, 34, '#9b958a', 4, 1.2);                                         // Betonpumpe
  box(x + 156, BG_TY - 98, 40, 48, '#d9d4c7', 4, 1.5); box(x + 162, BG_TY - 92, 28, 22, '#23384d', 2, 1);
  const u = arbeit ? 0.5 - 0.5 * Math.cos(TAU * (g - 400) / 32) : 0;
  const nx = arbeit ? BG_F + 20 + 150 * u : x + 10, ny = arbeit ? BG_TC + 34 : BG_TY - 70;
  limb(x + 80, BG_TY - 58, (x + 80 + nx) / 2, ny - 16, 6, '#c9ccc8'); limb((x + 80 + nx) / 2, ny - 16, nx, ny, 5, '#c9ccc8');
  circle(nx, ny, 4, '#3b3d40', INK, 1);
  if (arbeit) for (let j = 0; j < 7; j++) { const t = ((g * 0.37 + j / 7) % 1); circle(nx + Math.sin(j * 3) * 6 * t, ny - t * 22, 2, 'rgba(190,185,175,0.9)', null); }
}
function bgSprengung(g) {
  if (g < 235 || g > 330) return;
  ctx.save(); ctx.beginPath(); ctx.rect(BG_F, BG_TC, BG_P - BG_F, BG_TY - BG_TC); ctx.clip();
  if (g < 242) { const r = ctx.createRadialGradient(BG_F, BG_TY - 70, 4, BG_F, BG_TY - 70, 260); r.addColorStop(0, 'rgba(255,240,200,0.95)'); r.addColorStop(0.4, 'rgba(255,150,60,0.6)'); r.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = r; ctx.fillRect(BG_F, BG_TC, 300, 140); }
  const t = seg(g, 235, 330);
  for (let j = 0; j < 6; j++) { ctx.fillStyle = `rgba(180,172,160,${0.6 * (1 - t)})`; ctx.beginPath(); ctx.ellipse(BG_F + 40 + t * 520 + j * 50, BG_TY - 60 - (j % 3) * 22, 60 + t * 80, 40, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function bgHaufwerk(g) {
  if (g < 236 || g >= 380) return;
  const s = 1 - seg(g, 290, 380);
  ctx.fillStyle = '#6d655b'; ctx.beginPath(); ctx.moveTo(BG_F, BG_TY); ctx.lineTo(BG_F, BG_TY - 70 * s); ctx.quadraticCurveTo(BG_F + 50, BG_TY - 64 * s, BG_F + 30 + 130 * s, BG_TY); ctx.closePath(); paint('#6d655b', INK, 1.2);
  for (let j = 0; j < 8; j++) circle(BG_F + 10 + j * 14 * s, BG_TY - 8 - (j % 3) * 14 * s, 4, '#857b6f', INK, 0.8);
}

function bgStollen(g) {
  // Erkundungsstollen 12 m unter dem Haupttunnel (hier enger gezeichnet) mit Tunnelbohrmaschine
  ctx.fillStyle = '#4a4640'; ctx.fillRect(BG_F2, BG_GT, BG_GS + 50 - BG_F2, BG_GY - BG_GT);
  for (let x = BG_F2 + 560; x < BG_GS; x += 40) line(x, BG_GT, x, BG_GY, 'rgba(0,0,0,0.25)', 1);
  line(BG_F2, BG_GT, BG_GS, BG_GT, INK, 2); line(BG_F2, BG_GY, BG_GS + 50, BG_GY, INK, 2); line(BG_F2, BG_GT, BG_F2, BG_GY, INK, 2);
  // Bergwasser fließt in der Rinne zum Ausgang
  ctx.fillStyle = '#4f7f9c'; ctx.fillRect(BG_F2 + 120, BG_GY - 5, BG_GS + 50 - BG_F2 - 120, 5);
  for (let x = BG_F2 + 120 + (g * 2) % 40; x < BG_GS + 40; x += 40) line(x, BG_GY - 3, x + 12, BG_GY - 3, '#bfe3f5', 1.5);
  // Schacht hoch aufs Plateau mit Becherwerk
  ctx.fillStyle = '#2a2723'; ctx.fillRect(BG_GS, BG_TY, 50, BG_GT - BG_TY); line(BG_GS, BG_TY, BG_GS, BG_GT, INK, 2); line(BG_GS + 50, BG_TY, BG_GS + 50, BG_GY, INK, 2);
  for (let y = BG_GY - 20 - (g * 2) % 30; y > BG_TY; y -= 30) circle(BG_GS + 25, y, 5, '#7a6450', INK, 0.8);
  // Förderband im Stollen
  line(BG_F2 + 30, BG_GT + 22, BG_GS + 25, BG_GT + 22, '#3b3d40', 4);
  for (let x = BG_F2 + 40 + (g * 2) % 30; x < BG_GS + 20; x += 30) circle(x, BG_GT + 16, 4, '#7a6450', INK, 0.8);
  withAlpha('bgtbm', () => {
    const x = BG_F2;
    box(x, BG_GT + 2, 14, 76, '#3b3d40', 2, 1.5);
    for (let j = 0; j < 4; j++) { const y = BG_GT + 6 + ((g * 2 + j * 18) % 70); circle(x + 3, y, 3, '#c9ccc8', INK, 0.8); }
    box(x + 14, BG_GT + 6, 130, 68, '#4f7f9c', 4, 1.5);
    const dr = 3 * Math.sin(TAU * g / 60); box(x + 150, BG_GT + 2 - dr, 40, 10, '#3b3d40', 2, 1); box(x + 150, BG_GY - 12 + dr, 40, 10, '#3b3d40', 2, 1);   // Gripper
    for (let k = 0; k < 4; k++) box(x + 200 + k * 92, BG_GT + 28, 86, 42, k === 1 ? '#e6e3da' : '#5d6064', 3, 1.2);
    box(x + 300, BG_GT + 34, 34, 18, '#23384d', 2, 1);
    person({ x: x + 330, foot: BG_GY - 10.001, face: -1, shirt: '#f08a24', hat: '#f3f1ea', s: 0.2, sit: true });
  });
}

function bgPlateau(g) {
  const ab = istDunkel();
  // Portalkragen mit Nische für die heilige Barbara
  box(BG_P - 22, BG_TC - 46, 40, 46, '#c9c4b8', 0, 1.5);
  withAlpha('bgbarbara', () => {
    box(BG_P - 16, BG_TC - 42, 28, 38, '#9b958a', 6, 1);
    person({ x: BG_P - 2, foot: BG_TC - 6.001, face: 1, shirt: '#e8e2d2', pants: '#e8e2d2', skin: '#e8e2d2', hair: '#e8e2d2', s: 0.2 });
    ctx.fillStyle = '#e0b43a'; ctx.fillRect(BG_P - 6, BG_TC - 36, 8, 3);
  });
  // Halde mit Band vom Schacht
  ctx.beginPath(); ctx.moveTo(BG_P + 420, BG_TY); ctx.lineTo(BG_P + 500, BG_TY - 64); ctx.lineTo(BG_P + 540, BG_TY - 68); ctx.lineTo(BG_P + 615, BG_TY); ctx.closePath(); paint('#7a6e60', INK, 1.5);
  box(BG_GS - 8, BG_TY - 50, 66, 50, '#9a968c', 2, 1.5);
  line(BG_GS + 50, BG_TY - 44, BG_P + 515, BG_TY - 74, '#3b3d40', 4);
  for (let t = (g * 0.01) % 0.2; t < 1; t += 0.2) circle(lerp(BG_GS + 50, BG_P + 515, t), lerp(BG_TY - 50, BG_TY - 80, t), 4, '#7a6450', INK, 0.8);
  // Container, Silo, Leute
  for (const [dx, dy] of [[820, 0], [912, 0], [866, -42]]) { box(BG_P + dx, BG_TY - 42 + dy, 88, 42, '#e6e3da', 1, 1.5); box(BG_P + dx + 10, BG_TY - 32 + dy, 22, 14, ab ? '#ffd27a' : '#23384d', 1, 1); }
  bgText('BAULEITUNG', BG_P + 910, BG_TY - 92, 8, { family: MONO, weight: 500, align: 'center' });
  box(BG_P + 1050, BG_TY - 160, 44, 110, '#c9ccc8', 18, 1.5); for (const dx of [4, 36]) line(BG_P + 1050 + dx, BG_TY - 50, BG_P + 1050 + dx, BG_TY, INK, 2);
  bgText('SPRITZBETON', BG_P + 1072, BG_TY - 172, 7, { family: MONO, weight: 500, align: 'center' });
  person({ x: BG_P + 790, foot: BG_TY - 0.001, face: -1, shirt: '#f08a24', hat: '#f3f1ea', s: 0.2 });
  person({ x: BG_P + 1020, foot: BG_TY - 0.001, face: 1, shirt: '#3d5a80', hat: '#f3f1ea', s: 0.2 });
  if (ab) for (const x of [BG_P + 380, BG_P + 1150]) { line(x, BG_TY, x, BG_TY - 120, '#5d6064', 3); const r = ctx.createRadialGradient(x, BG_TY - 120, 2, x, BG_TY - 60, 140); r.addColorStop(0, 'rgba(255,240,190,0.35)'); r.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = r; ctx.fillRect(x - 140, BG_TY - 200, 280, 200); }
}
function bgDrohne(g) { const t = g / 480, x = lerp(BG_P - 220, SEEX0 - 2300, 0.5 - 0.5 * Math.cos(TAU * t)); return { x, y: bgOberY(x) - 90 }; }

registerRunner({
  room: 'berg3',
  draw(g) {
    bgBerg(); bgMagnet(g);
    ctx.save(); ctx.translate(2 * BG_MX, BG_DY); ctx.scale(-1, 1);
    bgStollen(g); bgRoehre(g); bgSchalwagen(); bgHaufwerk(g); bgLutte(g); bgPlateau(g);
    withAlpha('bgspritz', () => bgSpritzZeichnen(bgSpritz(g), g));
    withAlpha('bglade', () => bgLadeZeichnen(bgLade(g), g));
    withAlpha('bgjumbo', () => bgJumboZeichnen(bgJumbo(g), g));
    withAlpha('bgdumper', () => bgDumperZeichnen(bgDumper(g), g));
    withAlpha('bglader', () => bgLaderZeichnen(bgLader(g)));
    bgSprengung(g);
    ctx.restore();
    withAlpha('bgdrohne', () => {
      const d = bgDrohne(g);
      box(d.x - 12, d.y - 4, 24, 8, '#3b3d40', 3, 1.2); for (const dx of [-16, 16]) line(d.x + dx - 8, d.y - 7, d.x + dx + 8, d.y - 7, '#c9ccc8', 2.5);
      if (g % 40 < 4) circle(d.x, d.y + 8, 5, 'rgba(255,255,255,0.9)', null);
    });
    text('ZWEITE RÖHRE IM BAU', BG_XL + 500, GROUND - 160, 30, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(255,255,255,0.28)' });
  },
  robot: { id: 'bgjumbo', name: 'Bohrwagen', bereich: 'Bau', aera: 'seit 2015', typ: 'Bohrwagen mit zwei Bohrarmen', color: '#f0b429',
    fakt: 'Im harten Fels wird der Tunnel gesprengt. Zuerst bohrt der Bohrwagen viele Löcher in die Wand vorne, die Ortsbrust. Bei modernen Wagen wie dem Sandvik DT922i wird am Computer geplant, wo die Löcher hin sollen, und die zwei Bohrarme fahren die Stellen automatisch an. Vorher misst ein Laser die Wand.',
    echt: 'Echt. Ein Mensch sitzt in der Kabine und passt auf. Hier dauert ein ganzer Abschlag eine Minute, in echt viele Stunden.',
    note: 'Bohrt sechs Löcher und fährt dann zurück, damit der Ladewagen Platz hat.',
    quelle: 'https://tunnelingonline.com/sandvik-introduces-new-tunneling-jumbo/',
    box: () => { const x = bgJumbo(state.g); return bgM([x - 62, BG_TY - 125, 275, 125]); } },
});
registerRunner({ room: 'berg3', draw() {}, robot: { id: 'bglade', name: 'Ladewagen für Sprengstoff', bereich: 'Bau', aera: 'seit 2020 (Prototyp)', typ: 'Halbautomatischer Ladewagen', color: '#3e6f9e',
  fakt: 'Nach dem Bohren müssen die Löcher mit Sprengstoff gefüllt werden. Meist steht dafür ein Mensch im Korb direkt an der Wand. Orica und Epiroc haben 2020 den Prototyp Avatel gezeigt: Ein Fahrer sitzt in einer geschlossenen Kabine, und zwei Arme bringen den Sprengstoff in die richtigen Löcher.',
  echt: 'Echt, aber noch neu. Auf den meisten Baustellen wird noch von Hand geladen.',
  note: 'Füllt die sechs Löcher, dann fahren alle weg und es wird gesprengt.',
  quelle: 'https://www.amsj.com.au/orica-and-epiroc-announce-world-first-semi-automated-explosives-delivery-system/',
  box: () => { const x = bgLade(state.g); return bgM([x - 60, BG_TY - 125, 255, 125]); } } });
registerRunner({ room: 'berg3', draw() {}, robot: { id: 'bglader', name: 'Lader', bereich: 'Bau', aera: 'heute', typ: 'Fahrlader für Tunnel und Bergwerk', color: '#f0b429',
  fakt: 'Nach der Sprengung liegt vorne ein Haufen Steine, das Haufwerk. Der flache Lader schaufelt es in den Dumper. Das nennt man Schuttern.',
  echt: 'Echt. Hier fährt ein Mensch. In Bergwerken fahren solche Lader schon ferngesteuert oder selbstständig.',
  note: 'Viermal hin und her, dann ist der Dumper voll.',
  quelle: 'https://www.tirol.gv.at/presse/meldungen/meldung/historischer-durchschlag-im-brenner-basistunnel/',
  box: () => { const p = bgLader(state.g); return bgM([p.x - 4, BG_TY - 100, 140, 100]); } } });
registerRunner({ room: 'berg3', draw() {}, robot: { id: 'bgdumper', name: 'Dumper', bereich: 'Bau', aera: 'heute', typ: 'Muldenkipper', color: '#e0662b',
  fakt: 'Der Dumper bringt den Ausbruch aus dem Tunnel auf die Halde. Bei langen Tunneln wie dem Brenner Basistunnel läuft viel davon auch über lange Förderbänder.',
  echt: 'Echt. Hier fährt ein Mensch.',
  note: 'Kippt die Steine draußen auf die Halde.',
  quelle: 'https://www.tirol.gv.at/presse/meldungen/meldung/historischer-durchschlag-im-brenner-basistunnel/',
  box: () => { const x = bgDumper(state.g); return bgM([x - 4, BG_TY - 90, 164, 90]); } } });
registerRunner({ room: 'berg3', draw() {}, robot: { id: 'bgspritz', name: 'Spritzbetonroboter', bereich: 'Bau', aera: 'seit 2019', typ: 'Spritzmaschine mit Düsenarm', color: '#d9d4c7',
  fakt: 'Gleich nach dem Schuttern wird der frische Fels mit Spritzbeton gesichert, damit nichts herunterfällt. Der lange Arm sprüht den Beton an Wand und Decke. Bei Maschinen wie der Normet Spraymec lenkt der Fahrer nur die Düse, der Arm bewegt sich von selbst mit.',
  echt: 'Teils echt. Hier sprüht der Roboter allein. In echt hilft die Technik dem Fahrer; ganz selbstständig mit Laser-Messung der Schichtdicke ist noch in Arbeit.',
  note: 'Sprüht die Decke direkt hinter der Ortsbrust.',
  quelle: 'https://tunnelingonline.com/towards-automated-concrete-spraying/',
  box: () => { const x = bgSpritz(state.g); return bgM([x - 10, BG_TY - 110, 220, 110]); } } });
registerRunner({ room: 'berg2', draw() {}, robot: { id: 'bgschal', name: 'Schalwagen', bereich: 'Bau', aera: 'heute', typ: 'Fahrbare Schalung für die Innenschale', color: '#3e6f9e',
  fakt: 'Weiter hinten bekommt der Tunnel seine endgültige Wand, die Innenschale. Vorher wird eine Folie gegen Wasser eingebaut (gelb). Der Schalwagen ist eine riesige Form aus Stahl: Beton wird dahinter gepumpt, nach dem Aushärten fährt er ein Stück weiter. Die Fahrzeuge fahren unten durch.',
  echt: 'Echt.', note: 'Rechts davon ist die Wand schon fertig.',
  quelle: 'https://de.wikipedia.org/wiki/Neue_%C3%96sterreichische_Tunnelbaumethode',
  box: () => bgM([BG_S - 6, BG_TC + 10, 194, BG_TY - BG_TC - 10]) } });
registerRunner({ room: 'berg2', draw() {}, robot: { id: 'bglutte', name: 'Lüfter mit Lutte', bereich: 'Bau', aera: 'heute', typ: 'Bewetterung', color: '#f0b429',
  fakt: 'Im Tunnel braucht man frische Luft, vor allem nach dem Sprengen. Ein großer Lüfter am Portal bläst Luft durch ein gelbes Rohr, die Lutte, bis nach vorne an die Ortsbrust.',
  echt: 'Echt. Die gelben Luttenrohre sieht man in fast jedem Tunnel im Bau.', note: 'Nach der Sprengung bläst er den Staub hinaus.',
  quelle: 'https://de.wikipedia.org/wiki/Bewetterung',
  box: () => bgM([BG_P + 20, BG_TY - 64, 72, 64]) } });
registerRunner({ room: 'berg5', draw() {}, robot: { id: 'bgtbm', name: 'Tunnelbohrmaschine im Erkundungsstollen', bereich: 'Bau', aera: 'seit 2007', typ: 'Tunnelbohrmaschine für Fels', color: '#4f7f9c',
  fakt: 'Beim Brenner Basistunnel liegt etwa 12 Meter unter den beiden Haupttunneln ein Erkundungsstollen. Er wird vorab gebaut, damit man weiß, welches Gestein kommt. Später fließt durch ihn das Bergwasser ab. Ein großer Teil wurde mit Tunnelbohrmaschinen gebohrt. Die Maschine stemmt sich mit Pratzen (Grippern) gegen den Fels und dreht den Bohrkopf.',
  echt: 'Echt. Der Abstand ist hier kürzer gezeichnet. Im September 2025 war der Erkundungsstollen durch.',
  note: 'Das Gestein läuft über das Band und den Schacht hinaus auf die Halde.',
  quelle: 'https://www.tirol.gv.at/presse/meldungen/meldung/historischer-durchschlag-im-brenner-basistunnel/',
  box: () => bgM([BG_F2 - 4, BG_GT, 560, BG_GY - BG_GT]) } });
registerRunner({ room: 'berg2', draw() {}, robot: { id: 'bgbarbara', name: 'Heilige Barbara', bereich: 'Geschichte', aera: 'Brauch', typ: 'Statue am Tunneleingang', color: '#e8e2d2',
  fakt: 'Die heilige Barbara gilt als Schutzpatronin der Bergleute und Tunnelbauer. Vor der ersten Sprengung wird ihre Statue in eine Nische am Tunneleingang gestellt. Am 4. Dezember, dem Barbaratag, ruhen auf vielen Baustellen die Maschinen. Beim Gotthard-Basistunnel ging die Statue 2010 als Erste durch den Durchstich.',
  echt: 'Echt, ein Brauch. Kein Roboter.', note: 'Steht in der Nische über dem Portal.',
  quelle: 'https://www.srf.ch/news/schweiz/gotthard-wer-ist-die-wichtigste-frau-im-gotthardtunnel',
  box: () => bgM([BG_P - 22, BG_TC - 48, 40, 48]) } });
registerRunner({ room: 'berg8', draw() {}, robot: { id: 'bgdrohne', name: 'Vermessungsdrohne', bereich: 'Inspektion', aera: 'heute', typ: 'Drohne mit Kamera', color: '#3b3d40',
  fakt: 'Über dem Tunnel fliegt eine Drohne den Hang ab und macht viele Fotos. Daraus entsteht ein 3D-Modell. So sieht man, ob sich der Hang bewegt oder Steine locker sind.',
  echt: 'Echt. Drohnen werden so für Vermessung und Hangüberwachung eingesetzt.', note: 'Der Blitz ist ein Foto.',
  quelle: 'https://de.wikipedia.org/wiki/Photogrammetrie',
  box: () => { const d = bgDrohne(state.g); return [d.x - 26, d.y - 16, 52, 30]; } } });

registerRunner({ room: 'berg6', draw() {}, robot: { id: 'bgmagtunnel', name: 'Tunnel mit zwei Röhren', bereich: 'Mobilität', aera: 'heute', typ: 'Eisenbahntunnel', color: '#bdb8ad',
  fakt: 'Lange Tunnel bekommen oft zwei Röhren. Das ist sicherer, und eine Röhre kann gebaut oder repariert werden, während die andere fährt. Querschläge mit Fluchttüren verbinden die Röhren. Am Gotthard wird seit 2021 eine zweite Röhre für den Straßentunnel gebaut, damit man die erste danach sanieren kann.',
  echt: 'Die Idee ist echt. Hier fährt oben schon die Magnetbahn durch die fertige Röhre, unten wird die zweite gebaut. In echt liegen die Röhren nebeneinander, nicht übereinander.',
  note: 'Die grünen Schilder zeigen die Fluchttüren.',
  quelle: 'https://www.astra.admin.ch/de/zweite-roehre-gotthard',
  box: () => [BG_MLP, BG_TC, BG_P - BG_MLP, BG_TY - BG_TC] } });
for (let i = 1; i <= 9; i++) for (const key of ['berg' + i]) registerRoom({ key, name: roomOf(key).name, level: 'Außengelände', hitOrder: [], robots: [], draw() {} });
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  bgjumbo: 'Der Bohrwagen bohrt Löcher in den Berg. Wo die Löcher hinkommen, hat vorher ein Computer ausgerechnet.',
  bglade: 'Dieser Wagen füllt die Löcher mit Sprengstoff. Der Fahrer sitzt dabei sicher in seiner Kabine.',
  bglader: 'Nach dem Knall schaufelt der Lader die Steine weg.',
  bgdumper: 'Der Dumper fährt die Steine aus dem Tunnel und kippt sie auf einen Berg aus Schutt.',
  bgspritz: 'Dieser Roboterarm spritzt Beton an die Decke, damit keine Steine herunterfallen.',
  bgschal: 'Das ist eine riesige Form. Darin wird die glatte Tunnelwand gegossen.',
  bglutte: 'Durch das gelbe Rohr kommt frische Luft in den Tunnel.',
  bgtbm: 'Unten bohrt eine Maschine einen kleinen Tunnel voraus. So weiß man, welche Steine im Berg sind.',
  bgbarbara: 'Die Tunnelbauer stellen eine Figur der heiligen Barbara auf. Sie soll auf alle aufpassen.',
  bgmagtunnel: 'Oben fährt die Magnetbahn schon durch den Berg. Darunter bauen sie gerade einen zweiten Tunnel.',
  bgdrohne: 'Die Drohne macht Fotos vom Berg. So merkt man, wenn sich etwas bewegt.',
}));
