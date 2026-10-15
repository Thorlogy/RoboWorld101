/* Stausee ganz links (c −12 bis −9) im Maßstab 1 : 8 (1 m ≈ 8,6 Einheiten), alles als Läufer ohne Zuschnitt.
   Links Berge und See mit versunkenem Wald: ein ferngesteuertes Unterwasser-Fahrzeug sägt Bäume ab, Luftsäcke heben sie hoch.
   Mitte Staumauer mit Einlauf, Rechenreiniger, Tauchroboter und Drohne; rechts Krafthaus, Fischtreppe mit Fischzähler, Fluss.
   Darunter (UG 1, c −9) das Wasserwerk im normalen Maßstab, eigenes Feld. */
const SEEX0 = rx(roomOf('stausee1').c), ST_GW = GROUND;
const ST_XL = SEEX0 + 40;                                  // linkes Ufer
const ST_XD = rx(roomOf('staumauer').c) + 180;           // Wasserseite der Mauer
const ST_WS = ST_GW - 240;                               // Seespiegel
const ST_BETT = [[ST_XL, ST_WS], [SEEX0 + 200, ST_GW + 200], [SEEX0 + 400, ST_GW + 280], [ST_XD, ST_GW + 330]];
function stBettY(x) {
  for (let i = 1; i < ST_BETT.length; i++) { const [x0, y0] = ST_BETT[i - 1], [x1, y1] = ST_BETT[i]; if (x <= x1) return lerp(y0, y1, clamp((x - x0) / (x1 - x0), 0, 1)); }
  return ST_BETT[ST_BETT.length - 1][1];
}
const ST_BAUM = [0, 1, 2, 3, 4, 5].map(i => SEEX0 + 330 + i * 150);
const stRunde = () => (typeof langeUhr === 'function' ? Math.floor(langeUhr(6) / 480) : 0);

/* ---------- Unterwasser-Holzernte ---------- */
function stBarge(k, g) { const von = k === 0 ? ST_XL + 140 : ST_BAUM[k - 1], nach = ST_BAUM[k]; return g < 80 ? lerp(von, nach, ease(seg(g, 0, 80))) : nach; }
function stRov(k, g) {
  const x = ST_BAUM[k], basis = stBettY(x), b = stBarge(k, g);
  if (g < 80) return { x: lerp(b, x - 34, seg(g, 0, 80)), y: lerp(ST_WS + 30, basis - 120, ease(seg(g, 0, 80))) };
  if (g < 140) return { x: x - 34, y: basis - 120 };
  if (g < 180) return { x: x - 34, y: lerp(basis - 120, basis - 24, ease(seg(g, 140, 150))), saegt: g >= 150 };
  if (g < 420) return { x: x - 34, y: basis - 30 };
  return { x: lerp(x - 34, b, seg(g, 420, 480)), y: lerp(basis - 30, ST_WS + 30, ease(seg(g, 420, 480))) };
}
function stBaum(x, basis, hoehe, rot = 0, ox = 0, oy = 0) {
  ctx.save(); ctx.translate(x + ox, basis + oy); ctx.rotate(rot);
  line(0, 0, 0, -hoehe, '#5b4a3a', 9); line(0, 0, 0, -hoehe, '#7a6650', 5);
  for (let i = 1; i < 5; i++) { const y = -hoehe * i / 5, s = i % 2 ? 1 : -1; line(0, y, s * (26 - i * 3), y - 18, '#5b4a3a', 4); }
  ctx.restore();
}
function stHolzernte(g) {
  const k = stRunde(), r = stRov(k, g), b = stBarge(k, g);
  // Bäume: abgesägte Stümpfe, der Baum dieser Runde, stehende Bäume
  ST_BAUM.forEach((x, i) => {
    const basis = stBettY(x);
    if (i < k) { line(x, basis, x, basis - 18, '#5b4a3a', 9); return; }
    if (i > k || g < 180) { stBaum(x, basis, 224); return; }
    line(x, basis, x, basis - 18, '#5b4a3a', 9);
    // abgesägter Stamm mit Luftsack steigt auf, legt sich an der Oberfläche hin und treibt zum Floß
    const auf = ease(seg(g, 180, 300)), weg = ease(seg(g, 300, 420));
    if (g >= 420) return;
    const hoch = (basis - 18) - (ST_WS + 6), rot = -Math.PI / 2 * ease(seg(g, 260, 300));
    stBaum(x, basis - 18, 206, rot, lerp(0, ST_XL + 120 - x, weg), -hoch * auf);
    const ax = x + lerp(0, ST_XL + 120 - x, weg) + (rot ? -Math.sin(-rot) * 110 : 0), ay = basis - 18 - hoch * auf - 110 * Math.cos(rot);
    circle(ax, ay, 14 * Math.min(1, seg(g, 90, 130) * 1.5 + (g > 130 ? 1 : 0)), '#f0b429', INK, 1.5);
  });
  // Luftsack am Baum dieser Runde, solange er steht
  if (g >= 90 && g < 180) { const x = ST_BAUM[k], y = stBettY(x) - 130; circle(x + 16, y, 14 * seg(g, 90, 130), '#f0b429', INK, 1.5); }
  // Floß mit den geborgenen Stämmen
  const n = k + (g >= 420 ? 1 : 0);
  for (let i = 0; i < n; i++) { ctx.save(); ctx.translate(ST_XL + 120, ST_WS + 2 - i * 8); line(-100, 0, 100, 0, '#5b4a3a', 9); line(-100, 0, 100, 0, '#7a6650', 5); ctx.restore(); }
  // Arbeitsschiff an der Oberfläche mit Steuerstand, Kabel zum Tauchfahrzeug
  box(b - 80, ST_WS - 24, 160, 26, '#3e6f9e', 4, 2); box(b - 50, ST_WS - 50, 60, 26, '#e6e3da', 2, 1.5); box(b - 44, ST_WS - 44, 48, 10, istDunkel() ? '#ffe7a3' : '#23384d', 1, 1);
  ctx.save(); ctx.translate(b + 30, ST_WS - 24); ctx.scale(0.14, 0.14); person({ x: 0.001, foot: 0.001, face: -1, shirt: '#f08a24' }); ctx.restore();
  ctx.strokeStyle = '#f0b429'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b, ST_WS); ctx.quadraticCurveTo((b + r.x) / 2 + 30, (ST_WS + r.y) / 2, r.x + 25, r.y); ctx.stroke();
  // Tauchfahrzeug mit Greifer und Säge
  withAlpha('sawfish', () => {
    box(r.x, r.y - 16, 50, 30, '#f0b429', 5, 2); box(r.x + 6, r.y - 10, 14, 10, '#23384d', 2, 1);
    for (const dy of [-12, 10]) line(r.x - 4, r.y + dy, r.x + 4, r.y + dy, '#3b3d40', 4);
    limb(r.x + 50, r.y, r.x + 66, r.y + 6, 3, '#8a8f94');
    if (r.saegt) { line(r.x + 50, r.y + 10, r.x + 72, r.y + 10, '#c9ccc8', 4); for (let i = 0; i < 3; i++) circle(r.x + 70 + rnd(i + g) * 14, r.y + 4 - rnd(i * 5 + g) * 16, 2, '#c9a46a', null); }
    glow(r.x + 50, r.y - 6, 26, 'rgba(255,240,200,0.5)');
  });
}

/* ---------- Staumauer, Rechenreiniger, Tauchroboter, Drohne ---------- */
const stRechen = g => g < 100 ? seg(g, 0, 100) : g < 140 ? 1 : g < 260 ? 1 - seg(g, 140, 260) : 0;
const stDamRov = g => ({ x: ST_XD - 60, y: lerp(ST_WS + 50, ST_GW + 250, 0.5 - 0.5 * Math.cos(TAU * g / 480)) });
const stDrohne = g => { const t = 0.5 - 0.5 * Math.cos(TAU * g / 240); return { x: ST_XD + lerp(110, 330, t), y: lerp(ST_WS - 40, ST_GW - 70, t) }; };
function stMauer(g) {
  const ab = istDunkel(), top = ST_WS - 30;
  ctx.beginPath(); ctx.moveTo(ST_XD, ST_GW + 340); ctx.lineTo(ST_XD, top); ctx.lineTo(ST_XD + 50, top); ctx.lineTo(ST_XD + 300, ST_GW); ctx.lineTo(ST_XD + 300, ST_GW + 340); ctx.closePath();
  paint(ab ? '#8f8b82' : '#bdb8ab', INK, 2.5);
  for (let y = top + 40; y < ST_GW + 300; y += 50) line(ST_XD + 4, y, ST_XD + 46 + (y - top) * 0.9, y, 'rgba(42,39,35,0.12)', 1.5);
  // Krone mit Geländer
  line(ST_XD - 4, top - 14, ST_XD + 54, top - 14, INK, 2); for (let x = ST_XD; x <= ST_XD + 50; x += 12) line(x, top, x, top - 14, INK, 1.5);
  // Einlauf mit Rechen unten an der Wasserseite, Druckleitung schräg durch die Mauer zum Krafthaus
  box(ST_XD - 8, ST_GW + 160, 12, 70, '#3b3d40', 0, 1.5);
  for (let y = ST_GW + 166; y < ST_GW + 226; y += 10) line(ST_XD - 8, y, ST_XD + 4, y, '#8a8f94', 2);
  ctx.strokeStyle = '#3b3d40'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(ST_XD + 4, ST_GW + 195); ctx.lineTo(ST_XD + 290, ST_GW - 30); ctx.lineTo(ST_XD + 420, ST_GW - 60); ctx.stroke();
  ctx.strokeStyle = '#5d6064'; ctx.lineWidth = 10; ctx.stroke();
  text('STAUMAUER', ST_XD + 80, ST_GW + 60, 22, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.25)' });
  // Rechenreiniger: Schiene an der Wasserseite, Harke fährt hinunter und holt Äste und Laub
  withAlpha('rechenreiniger', () => {
    line(ST_XD - 14, top - 10, ST_XD - 14, ST_GW + 230, '#5d6064', 3);
    box(ST_XD + 6, top - 40, 40, 26, '#5f9a4a', 2, 1.5);
    const t = stRechen(g), y = lerp(top - 6, ST_GW + 196, t);
    line(ST_XD + 10, top - 14, ST_XD - 14, y, '#c9ccc8', 1.5);
    box(ST_XD - 30, y - 8, 22, 16, '#e0a526', 2, 1.5);
    for (let i = 0; i < 4; i++) line(ST_XD - 30, y + 8, ST_XD - 36 + i * 4, y + 18, INK, 2);
    const voll = g >= 140 && g < 280;
    if (voll) for (let i = 0; i < 3; i++) line(ST_XD - 34, y + 4 + i * 4, ST_XD - 18, y - 4 + i * 6, '#7a6650', 3);
    if (g < 120 || g > 360) for (let i = 0; i < 4; i++) line(ST_XD - 26, ST_GW + 170 + i * 14, ST_XD - 8, ST_GW + 162 + i * 14, '#7a6650', 3);
    if (g >= 260 && g < 300) for (let i = 0; i < 3; i++) line(ST_XD + 12 + i * 8, top - 30, ST_XD + 20 + i * 8, top - 22, '#7a6650', 3);
  });
}
function stKrafthaus(g) {
  const ab = istDunkel(), x0 = ST_XD + 360, x1 = ST_XD + 640, y0 = ST_GW - 180, y1 = ST_GW - 14;
  // Fluss vom Krafthaus nach rechts
  ctx.fillStyle = ab ? '#1e3550' : '#4f7f9c'; ctx.fillRect(ST_XD + 290, ST_GW - 14, rx(roomOf('kraftwerk').c) + RW - ST_XD - 290, 40);
  ctx.strokeStyle = 'rgba(230,245,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = ST_XD + 300; x < rx(roomOf('kraftwerk').c) + RW - 20; x += 40) { const o = (g * 3) % 40; ctx.moveTo(x + o, ST_GW - 6); ctx.lineTo(x + o + 16, ST_GW - 6); }
  ctx.stroke();
  circle(rx(roomOf('kraftwerk').c) + RW - 10, ST_GW + 6, 18, '#2a2723', INK, 2);
  // Krafthaus im Schnitt: Turbine und Generator
  box(x0, y0, x1 - x0, y1 - y0, ab ? '#9a968c' : '#d6d2c8', 0, 2.5);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(x0 - 8, y0 - 8, x1 - x0 + 16, 10);
  text('KRAFTHAUS', x0 + 140, y0 + 30, 16, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: 'rgba(42,39,35,0.4)' });
  box(x0 + 40, y0 + 50, 60, 40, '#3e6f9e', 4, 1.5);
  circle(x0 + 70, y0 + 120, 26, '#5d6064', INK, 2);
  ctx.save(); ctx.translate(x0 + 70, y0 + 120); ctx.rotate(g * 0.5); for (let i = 0; i < 5; i++) { ctx.rotate(TAU / 5); line(0, 0, 22, 0, '#c9ccc8', 3); } ctx.restore();
  line(x0 + 70, y0 + 90, x0 + 70, y0 + 94, INK, 4);
  // Leitwarte mit Anzeige
  box(x0 + 150, y0 + 60, 110, 60, '#23384d', 2, 1.5);
  text('LEISTUNG', x0 + 205, y0 + 82, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' });
  text((42 + Math.round(3 * Math.sin(g / 40))) + ' MW', x0 + 205, y0 + 104, 14, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
  // Kabel zum Strommast Richtung Stadt
  line(x1, y0 + 20, x1 + 60, y0 - 60, INK, 1.5);
}
// Fischtreppe auf der Luftseite der Mauer, Fischzähler unten am Einstieg
const stTreppe = i => ({ x: ST_XD + 280 - i * 34, y: ST_GW - 6 - i * 30 });
function stFischtreppe(g) {
  for (let i = 0; i < 8; i++) { const p = stTreppe(i); box(p.x - 30, p.y - 14, 34, 14, '#9a968c', 0, 1.5); ctx.fillStyle = istDunkel() ? '#1e3550' : '#4f7f9c'; ctx.fillRect(p.x - 27, p.y - 11, 28, 9); }
  // ein Fisch springt Stufe für Stufe hinauf
  const s = Math.floor(g / 60), t = (g % 60) / 60, a = stTreppe(s), b = stTreppe(s + 1);
  if (s < 7) { const x = lerp(a.x - 12, b.x - 12, t), y = lerp(a.y - 6, b.y - 6, t) - Math.sin(Math.PI * t) * 24;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.7); ctx.beginPath(); ctx.ellipse(0, 0, 8, 3.5, 0, 0, TAU); paint('#9fc4d6', INK, 1); ctx.restore(); }
  withAlpha('fischzaehler', () => {
    const p = stTreppe(0); box(p.x - 4, p.y - 40, 24, 36, '#3b3d40', 2, 1.5); circle(p.x + 8, p.y - 28, 4, '#7fd3ff', INK, 1);
    box(p.x + 30, p.y - 70, 92, 24, '#23384d', 1, 1.2);
    text('FISCHE HEUTE: ' + (118 + stRunde() * 8 + Math.floor(g / 60)), p.x + 76, p.y - 54, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
  });
}
function stBild(g) {
  const ab = istDunkel();
  // Berge im Hintergrund, Hang bis zum Ufer
  ctx.fillStyle = ab ? '#2c3458' : '#9aa7a2';
  ctx.beginPath(); ctx.moveTo(SEEX0 - 1600, ST_GW); ctx.lineTo(SEEX0 - 1300, ST_GW - 900); ctx.lineTo(SEEX0 - 900, ST_GW - 640); ctx.lineTo(SEEX0 - 500, ST_GW - 1050); ctx.lineTo(SEEX0, ST_GW - 620); ctx.lineTo(SEEX0 + 400, ST_GW - 820); ctx.lineTo(SEEX0 + 900, ST_GW - 420); ctx.lineTo(ST_XD, ST_GW - 300); ctx.lineTo(ST_XD, ST_GW); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f3f1ea'; for (const [x, y] of [[SEEX0 - 1300, ST_GW - 900], [SEEX0 - 500, ST_GW - 1050], [SEEX0 + 400, ST_GW - 820]]) { ctx.beginPath(); ctx.moveTo(x - 60, y + 80); ctx.lineTo(x, y); ctx.lineTo(x + 60, y + 80); ctx.closePath(); ctx.fill(); }
  // Erdreich um den See (Hang links), dann das Wasser
  ctx.fillStyle = '#6b5a48';
  ctx.beginPath(); ctx.moveTo(SEEX0 - 1600, ST_GW + 700); ctx.lineTo(SEEX0 - 1600, ST_GW - 300); ctx.lineTo(SEEX0 - 200, ST_WS - 60); ctx.lineTo(ST_XL, ST_WS);
  for (let i = 1; i < ST_BETT.length; i++) ctx.lineTo(ST_BETT[i][0], ST_BETT[i][1]);
  ctx.lineTo(ST_XD, ST_GW + 700); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6f8f5a'; ctx.beginPath(); ctx.moveTo(SEEX0 - 1600, ST_GW - 300); ctx.lineTo(SEEX0 - 200, ST_WS - 60); ctx.lineTo(ST_XL, ST_WS); ctx.lineTo(ST_XL, ST_WS + 10); ctx.lineTo(SEEX0 - 200, ST_WS - 50); ctx.lineTo(SEEX0 - 1600, ST_GW - 290); ctx.closePath(); ctx.fill();
  ctx.fillStyle = ab ? '#1e3550' : '#4f7f9c';
  ctx.beginPath(); ctx.moveTo(ST_XL, ST_WS); ctx.lineTo(ST_XD, ST_WS); for (let i = ST_BETT.length - 1; i >= 0; i--) ctx.lineTo(ST_BETT[i][0], ST_BETT[i][1]); ctx.closePath(); ctx.fill();
  text('STAUSEE', SEEX0 + 420, ST_WS + 70, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(230,245,255,0.3)' });
  stHolzernte(g);
  // Tauchroboter an der Mauer (Sonar-Fächer)
  withAlpha('mauerrov', () => {
    const p = stDamRov(g);
    ctx.fillStyle = 'rgba(127,255,170,0.22)'; ctx.beginPath(); ctx.moveTo(p.x + 30, p.y); ctx.lineTo(ST_XD, p.y - 50); ctx.lineTo(ST_XD, p.y + 50); ctx.closePath(); ctx.fill();
    box(p.x - 12, p.y - 10, 40, 20, '#e6e3da', 4, 1.5); box(p.x - 16, p.y - 6, 6, 12, '#3b3d40', 1, 1); circle(p.x + 26, p.y, 4, '#23384d', INK, 1);
    line(p.x, p.y - 10, p.x - 30, ST_WS, '#f0b429', 1.5);
  });
  stMauer(g);
  stFischtreppe(g);
  stKrafthaus(g);
  // Drohne an der Luftseite
  withAlpha('mauerdrohne', () => {
    const d = stDrohne(g);
    ctx.fillStyle = 'rgba(127,211,255,0.2)'; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 70, d.y - 30); ctx.lineTo(d.x - 50, d.y + 40); ctx.closePath(); ctx.fill();
    box(d.x - 12, d.y - 4, 24, 8, '#3b3d40', 3, 1.2); for (const dx of [-16, 16]) line(d.x + dx - 8, d.y - 7, d.x + dx + 8, d.y - 7, '#c9ccc8', 2.5);
    circle(d.x - 10, d.y + 6, 3, '#23384d', null);
  });
}
registerRunner({ room: 'stausee1', draw() {}, robot: { id: 'sawfish', name: 'Unterwasser-Holzernter', bereich: 'Unterwasser', aera: 'seit 2002', typ: 'Ferngesteuertes Tauchfahrzeug mit Säge', color: '#f0b429',
  fakt: 'Vorbild ist der Sawfish von Triton Logging aus Kanada. Als Stauseen gebaut wurden, blieben ganze Wälder unter Wasser stehen. Das Tauchfahrzeug, etwa so groß wie ein Kleinbus, greift einen Stamm, hängt einen Luftsack daran und sägt ihn unten ab. Dann steigt der Baum nach oben. Gesteuert wird es von einem Schiff aus mit Joystick und Kameras; der erste Testschnitt war 2002 im Ootsa Lake.',
  echt: 'Echt. Unter Wasser bleibt das Holz lange erhalten. Gezeichnet im Maßstab 1 : 8.',
  note: 'Jede Runde ist ein anderer Baum dran. Die Stämme sammeln sich links am Floß.',
  quelle: 'https://www.michaelbehar.com/articles/wired-reservoir-logs',
  box: () => { const r = stRov(stRunde(), state.g); return [r.x - 6, r.y - 20, 80, 40]; } } });
registerRunner({ room: 'staumauer', draw() {}, robot: { id: 'rechenreiniger', name: 'Rechenreiniger', bereich: 'Umwelt', aera: 'seit Jahrzehnten', typ: 'Harke auf einer Schiene', color: '#e0a526',
  fakt: 'Vor jedem Wassereinlauf hängt ein Gitter, der Rechen. Daran bleiben Äste und Laub hängen. Eine Rechenreinigungsmaschine fährt regelmäßig hinunter, harkt alles ab und kippt es in einen Container.',
  echt: 'Echt. Sie fährt meist ganz von selbst, wenn das Gitter zu voll wird.', note: 'Harkt Äste vom Gitter und kippt sie oben in den grünen Container.',
  box: () => { const y = lerp(ST_WS - 36, ST_GW + 196, stRechen(state.g)); return [ST_XD - 40, y - 12, 40, 34]; } } });
registerRunner({ room: 'staumauer', draw() {}, robot: { id: 'mauerrov', name: 'Tauchroboter an der Mauer', bereich: 'Inspektion', aera: 'heute', typ: 'Unterwasser-Fahrzeug mit Sonar', color: '#e6e3da',
  fakt: 'Kleine ferngesteuerte Tauchroboter prüfen die Wasserseite von Staumauern und die Einläufe. Mit Kamera und Sonar sehen sie Risse und Ablagerungen, auch in großer Tiefe und trübem Wasser. So müssen weniger Taucher hinunter.',
  echt: 'Echt. Das gelbe Kabel führt zum Steuerpult an Land.', note: 'Fährt an der Mauer auf und ab.',
  box: () => { const p = stDamRov(state.g); return [p.x - 18, p.y - 12, 50, 24]; } } });
registerRunner({ room: 'staumauer', draw() {}, robot: { id: 'mauerdrohne', name: 'Inspektionsdrohne', bereich: 'Inspektion', aera: 'heute', typ: 'Drohne mit Kamera', color: '#3b3d40',
  fakt: 'Drohnen fliegen die Luftseite von Staumauern ab und machen viele Fotos. Ein Programm setzt daraus ein genaues Modell zusammen, auf dem man auch kleine Risse findet.',
  echt: 'Echt. Früher hingen dafür Menschen an Seilen an der Mauer.', note: 'Fliegt die schräge Mauer hinauf und hinunter.',
  box: () => { const d = stDrohne(state.g); return [d.x - 20, d.y - 12, 40, 24]; } } });
registerRunner({ room: 'kraftwerk', draw() {}, robot: { id: 'fischzaehler', name: 'Fischzähler', bereich: 'Umwelt', aera: 'heute', typ: 'Infrarot-Scanner mit Kamera', color: '#3b3d40',
  fakt: 'Vorbild ist der Riverwatcher aus Island. Schwimmt ein Fisch durch, tastet ihn ein Infrarot-Scanner ab, eine Kamera fotografiert ihn. Das Gerät zählt die Fische und erkennt, welche Art es ist.',
  echt: 'Echt. Die Fischtreppe hilft Fischen, an der Mauer vorbei flussaufwärts zu wandern.', note: 'Zählt den Fisch, der die Treppe hinaufspringt.',
  quelle: 'https://fishbio.com/projects/vaki-riverwatcher/',
  box: () => { const p = stTreppe(0); return [p.x - 6, p.y - 72, 130, 70]; } } });
registerRunner({
  room: 'stausee2', draw(g) { stBild(g); },
  glow(g) { const k = stRunde(), b = stBarge(k, g); glow(b - 20, ST_WS - 40, 30, 'rgba(255,231,163,0.6)'); glow(ST_XD + 500, ST_GW - 100, 80, 'rgba(255,231,163,0.35)'); },
  robot: { id: 'stausee', name: 'Stausee mit Wasserkraftwerk', bereich: 'Energie', aera: 'heute', typ: 'Staumauer, See und Krafthaus', color: '#4f7f9c',
    fakt: 'Die Staumauer hält einen Fluss auf, dahinter entsteht ein See. Das Wasser fließt durch eine Druckleitung hinunter zur Turbine und treibt den Generator an. So entsteht Strom ohne Abgase.',
    echt: 'Echt, aber im Maßstab 1 : 8 und stark verkleinert. Echte Staumauern sind oft über 100 Meter hoch.',
    note: 'Die Leistungsanzeige im Krafthaus schwankt ein wenig, wie in echt.',
    box: () => [ST_XD + 360, ST_GW - 180, 280, 166] },
});
for (const [key, name] of [['stausee1', 'Stausee: Holzernte'], ['stausee2', 'Stausee'], ['staumauer', 'Staumauer'], ['kraftwerk', 'Wasserkraftwerk']])
  registerRoom({ key, name, level: 'Außengelände', hitOrder: [], robots: [], draw() {} });

/* ---------- Wasserwerk unter dem Kraftwerk (normaler Maßstab) ---------- */
const WWX = rx(roomOf('wasserwerk').c), WWY = ry(roomOf('wasserwerk').r);
const wwRobo = g => 430 + 170 * (0.5 - 0.5 * Math.cos(TAU * g / 480));
function drawWasserwerk(f) {
  const g = state.g;
  ctx.fillStyle = '#d9d6cf'; ctx.fillRect(0, 0, RW, RH); ctx.fillStyle = '#b9b4a8'; ctx.fillRect(0, 360, RW, 48); line(0, 360, RW, 360, INK, 2);
  text('WASSERWERK', 330, 50, 30, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Rohwasser vom Fluss, Sandfilter
  line(80, 0, 80, 120, '#3e6f9e', 14); text('VOM FLUSS', 130, 30, 10, { family: '"IBM Plex Mono", monospace', weight: 500 });
  withAlpha('sandfilter', () => {
    box(30, 120, 260, 230, '#e6e3da', 0, 2);
    ctx.fillStyle = '#7fb3cf'; ctx.fillRect(34, 130, 252, 70);
    ctx.fillStyle = '#d8c48f'; ctx.fillRect(34, 200, 252, 80);
    ctx.fillStyle = '#8a8f94'; ctx.fillRect(34, 280, 252, 66);
    for (let i = 0; i < 12; i++) circle(50 + (i * 23) % 230, 140 + ((g * 2 + i * 13) % 180), 2.5, 'rgba(230,245,255,0.8)', null);
    text('SAND', 160, 244, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
    text('KIES', 160, 318, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  });
  // Pumpe und Messstelle
  box(310, 290, 80, 60, '#3e6f9e', 6, 2); ctx.save(); ctx.translate(350, 320); ctx.rotate(g * 0.6); for (let i = 0; i < 4; i++) { ctx.rotate(TAU / 4); line(0, 0, 18, 0, '#e6e3da', 3); } ctx.restore();
  box(310, 200, 80, 44, '#23384d', 2, 1.5); text('MESSUNG', 350, 218, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' }); text('SAUBER', 350, 236, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
  // Hauptleitung im Schnitt mit Rohrroboter
  box(390, 236, 260, 92, '#8a8f94', 0, 2); ctx.fillStyle = '#bfe0f0'; ctx.fillRect(390, 248, 260, 68);
  text('TRINKWASSER ZUR STADT →', 520, 230, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  withAlpha('rohrroboter', () => {
    const x = wwRobo(g), y = 290;
    box(x - 24, y - 12, 48, 24, '#e9e9e6', 8, 1.5); box(x + 18, y - 8, 8, 16, '#23384d', 2, 1);
    glow(x + 34, y, 30, 'rgba(255,250,210,0.8)');
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(42,39,35,${0.4 - i * 0.12})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 30 + i * 8 + (g % 12), -0.5, 0.5); ctx.stroke(); }
  });
}
registerRoom({
  key: 'wasserwerk', name: 'Wasserwerk', level: 'UG 1',
  hitOrder: ['rohrroboter', 'sandfilter'],
  draw: drawWasserwerk,
  robots: [
    { id: 'rohrroboter', name: 'Rohrroboter', bereich: 'Inspektion', aera: 'seit 2024', typ: 'Roboter, der in Wasserleitungen schwimmt', color: '#e9e9e6',
      fakt: 'Vorbild ist der Roboter von Acwa Robotics aus Frankreich. Er fährt in gefüllten Trinkwasserleitungen kilometerweit mit, ohne dass das Wasser abgestellt wird. Kamera und LEDs schauen nach vorn, Ultraschall misst, wie dick die Rohrwand noch ist, ein Mikrofon hört Lecks. Wasserversorger in Marseille, Lyon und Lille setzen ihn ein.',
      echt: 'Echt. Er ist etwa 70 Zentimeter lang. Die Bögen hier zeigen den Ultraschall, man sieht ihn in echt nicht.',
      note: 'Fährt in der Hauptleitung hin und her und misst die Rohrwand.',
      quelle: 'https://cordis.europa.eu/article/id/466191-autonomous-robots-deliver-water-network-efficiencies/de',
      box: () => { const x = wwRobo(state.g); return [WWX + x - 26, WWY + 276, 52, 28]; } },
    { id: 'sandfilter', name: 'Sandfilter', bereich: 'Umwelt', aera: 'seit über 100 Jahren', typ: 'Filterbecken', color: '#d8c48f',
      fakt: 'Das Wasser sickert durch Sand und Kies. Dabei bleiben Schwebstoffe und viele Keime hängen. Danach wird es gemessen und in die Leitungen gepumpt.',
      echt: 'Echt. Kein Roboter, aber ohne Filter kein Trinkwasser.', note: 'Die Bläschen zeigen, wie das Wasser nach unten sickert.',
      box: () => [WWX + 30, WWY + 120, 260, 230] },
  ],
});
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  sawfish: 'Unter dem Stausee stehen noch alte Bäume. Dieses Tauchfahrzeug sägt sie ab, und ein gelber Luftsack zieht sie nach oben.',
  rechenreiniger: 'Diese Harke holt Äste und Blätter vom Gitter, damit das Wasser gut in das Kraftwerk fließen kann.',
  mauerrov: 'Dieser kleine Tauchroboter schaut sich die Mauer unter Wasser an und sucht Risse.',
  mauerdrohne: 'Die Drohne fotografiert die Staumauer von außen.',
  fischzaehler: 'Dieses Gerät zählt die Fische, die die Treppe hinaufspringen, und erkennt, welche Fischart es ist.',
  stausee: 'Das Wasser aus dem See fließt durch ein dickes Rohr nach unten und dreht eine Turbine. So entsteht Strom.',
  rohrroboter: 'Dieser Roboter schwimmt in der Wasserleitung mit und prüft, ob das Rohr noch gut ist.',
  sandfilter: 'Durch Sand und Kies wird das Wasser sauber, bevor es aus deinem Wasserhahn kommt.',
}));
