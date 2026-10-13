/* Halle 103, Obergeschoss: Montage (über der dunklen Fabrik)
   Links: SCARA-Roboter setzt in schnellem Takt Chips auf Platinen. Mitte: Humanoider holt Blechteile aus dem Regal und legt sie in eine Vorrichtung.
   Rechts: Hexapod (Plattform auf sechs Beinen) rüttelt ein Bauteil im Dauertest. */
const MOX = rx(roomOf('montage').c), MOY = ry(roomOf('montage').r);
const MO_MONO = { family: '"IBM Plex Mono", monospace', weight: 500 };

/* ---------- SCARA: Takt 20 Bilder, Chip aus der Schale (60) auf die Platine (196) ---------- */
function scaraTip(f) {
  const p = f % 20;
  const x = p < 8 ? lerp(60, 196, ease(seg(p, 0, 8))) : p < 10 ? 196 : p < 18 ? lerp(196, 60, ease(seg(p, 10, 18))) : 60;
  const z = (p >= 8 && p < 10) || p >= 18 ? 276 : 246;
  return { x, z, carry: p < 9 || p >= 19 };
}
const boardX = f => lerp(170, 230, (f % 20) / 20);
function drawScara(f) {
  box(20, 288, 220, 10, '#5d6064', 1, 1.5); line(30, 298, 30, 360, INK, 3); line(230, 298, 230, 360, INK, 3);
  // Förderband mit Platinen, die nach jedem Takt ein Stück weiterrücken
  box(140, 280, 100, 8, '#3b3d40', 1, 1);
  for (let k = -1; k < 2; k++) {
    const bx = boardX(f) + k * 60;
    if (bx < 140 || bx > 236) continue;
    box(bx - 22, 272, 44, 8, '#2f8f4e', 1, 1);
    const chips = k === 0 ? (f % 20 >= 9 ? 1 : 0) : k > 0 ? 0 : 1;
    for (let c = 0; c < chips + 1; c++) box(bx - 14 + c * 14, 268, 8, 4, '#1d2024', 0, 0.8);
  }
  // Chipschale
  box(40, 278, 40, 10, '#c9ccc8', 1, 1); for (let i = 0; i < 4; i++) box(44 + i * 9, 274, 6, 4, '#1d2024', 0, 0.8);
  // Säule, zwei waagerechte Glieder, senkrechte Spindel
  const t = scaraTip(f), base = { x: 120, y: 206 };
  box(104, 206, 32, 82, '#e6e3da', 3, 1.5);
  const el = { x: (base.x + t.x) / 2 + 10 * Math.sin(TAU * f / 20), y: 206 };
  limb(base.x, 200, el.x, 200, 12, '#f0b429'); limb(el.x, 192, t.x, 192, 10, '#f0b429');
  circle(base.x, 200, 7, '#3b3d40', INK, 1.2); circle(el.x, 196, 6, '#3b3d40', INK, 1.2);
  line(t.x, 186, t.x, t.z, '#8a8f94', 4);
  box(t.x - 4, t.z, 8, 6, '#3b3d40', 1, 1);
  if (t.carry) box(t.x - 4, t.z + 6, 8, 4, '#1d2024', 0, 0.8);
  text('SCARA', 120, 240, 9, Object.assign({ align: 'center' }, MO_MONO));
}

/* ---------- Humanoider: Regal (300) → Vorrichtung (438) → zurück ---------- */
function humX(f) {
  if (f < 12) return 300;
  if (f < 28) return lerp(300, 420, ease(seg(f, 12, 28)));
  if (f < 40) return 420;
  if (f < 56) return lerp(420, 300, ease(seg(f, 40, 56)));
  return 300;
}
const humWalk = f => (f >= 12 && f < 28) || (f >= 40 && f < 56);
const humCarry = f => f >= 8 && f < 36;
function drawHumanoidWork(f) {
  // Regal mit Blechteilen und Vorrichtung
  box(254, 200, 30, 160, '#8a8f94', 1, 1.5);
  for (const y of [230, 280, 330]) { box(254, y, 30, 4, '#5d6064', 0, 1); for (let i = 0; i < 3; i++) box(258 + i * 8, y - 14, 4, 14, '#c9ccc8', 0, 0.8); }
  box(436, 296, 54, 64, '#5d6064', 2, 1.5); box(440, 286, 46, 10, '#3e6f9e', 1, 1.2);
  if (f >= 36 || f < 4) box(456, 270, 8, 16, '#c9ccc8', 0, 1);
  const x = humX(f), w = humWalk(f) ? Math.sin(TAU * f / 8) * 0.45 : 0;
  const reach = (f >= 6 && f < 10) || (f >= 30 && f < 36);
  humanoid(x, 358, { s: 1.07, color: '#d6d9dc', legL: w, legR: -w, kneeL: Math.abs(w) * 0.6, kneeR: Math.abs(w) * 0.6, armL: reach ? 1.4 : 0.9, armR: reach ? 1.5 : 0.95 });
  const dir = f >= 40 && f < 56 ? -1 : 1;
  if (humCarry(f)) box(x + dir * 22 - 4, 288, 8, 18, '#c9ccc8', 0, 1);
}

/* ---------- Hexapod: Plattform auf sechs Beinen rüttelt ein Bauteil ---------- */
function drawHexapod(f) {
  const cx = 566, by = 352, tilt = 0.08 * Math.sin(TAU * f / 10), dy = 6 * Math.sin(TAU * f / 6), dx = 5 * Math.sin(TAU * f / 15);
  const top = { x: cx + dx, y: 296 + dy };
  box(cx - 56, by, 112, 8, '#5d6064', 1, 1.5);
  const bases = [-48, -40, -8, 8, 40, 48], tops = [-34, -20, -14, 14, 20, 34];
  for (let i = 0; i < 6; i++) {
    const tx = top.x + Math.cos(tilt) * tops[(i + 1) % 6], ty = top.y + 8 + Math.sin(tilt) * tops[(i + 1) % 6];
    limb(cx + bases[i], by, tx, ty, 5, i % 2 ? '#8a8f94' : '#c9ccc8');
    circle(cx + bases[i], by, 3, '#3b3d40', INK, 1);
  }
  ctx.save(); ctx.translate(top.x, top.y); ctx.rotate(tilt);
  box(-44, 0, 88, 8, '#3b3d40', 1, 1.5);
  box(-24, -34, 48, 34, '#d9542b', 4, 1.5); box(-14, -26, 28, 8, '#f3f1ea', 1, 1);
  ctx.restore();
  text('RÜTTELTEST', cx, 230, 9, Object.assign({ align: 'center' }, MO_MONO));
  text(`${(2.4 + 0.6 * Math.sin(TAU * f / 6)).toFixed(1).replace('.', ',')} g`, cx, 244, 9, Object.assign({ align: 'center', color: '#d9542b' }, MO_MONO));
}

function drawMontage(f) {
  ctx.fillStyle = '#e1e3e0'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  for (let x = 40; x < RW; x += 120) { box(x, 8, 60, 8, '#f3f1ea', 0, 1); }
  ctx.fillStyle = '#9a9d9a'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  ctx.fillStyle = '#f0b429'; for (let x = 0; x < RW; x += 24) ctx.fillRect(x, 360, 12, 4);
  text('MONTAGE', 240, 82, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  withAlpha('scara', () => drawScara(f));
  withAlpha('humanoidfabrik', () => drawHumanoidWork(f));
  withAlpha('hexapod', () => drawHexapod(f));
}

registerRoom({
  key: 'montage', name: 'Halle 103: Montage', level: 'Halle 103',
  hitOrder: ['scara', 'hexapod', 'humanoidfabrik'],
  draw: drawMontage,
  robots: [
    { id: 'scara', name: 'SCARA-Roboter', bereich: 'Industrie', aera: 'seit 1981', typ: 'Schwenkarm, der nur waagerecht dreht',
      fakt: 'Ein SCARA hat zwei Glieder, die sich nur waagerecht drehen, und eine Spindel, die hoch und runter fährt. Dadurch ist er sehr schnell und genau. Er setzt Bauteile auf Platinen, schraubt und sortiert, mehrmals pro Sekunde.',
      echt: 'Echt. Erfunden 1978 in Japan, steckt er heute in fast jeder Elektronikfabrik. In echt ist er noch viel schneller als hier.',
      note: 'Holt einen Chip, setzt ihn ab, das Band rückt weiter. Immer im gleichen Takt.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/SCARA',
      box: () => [MOX + 20, MOY + 180, 220, 120] },
    { id: 'humanoidfabrik', name: 'Humanoider in der Fabrik', bereich: 'Industrie', aera: 'Erprobung seit 2024', typ: 'Menschenähnlicher Roboter am Band',
      fakt: 'Mehrere Firmen testen Humanoide in Autofabriken. Sie sollen dort arbeiten, wo alles für Menschen gebaut ist: Teile aus Regalen holen, in Vorrichtungen legen, Kisten tragen.',
      echt: 'Erprobung. 2024 legte ein Humanoider in einem Autowerk in den USA wochenlang Blechteile ein. Im Alltag sind Humanoide in Fabriken aber noch selten, Räder und Arme sind meist billiger und schneller.',
      note: 'Holt ein Blechteil aus dem Regal und legt es in die blaue Vorrichtung.', color: '#d6d9dc',
      quelle: 'https://en.wikipedia.org/wiki/Humanoid_robot',
      box: f => [MOX + humX(f) - 24, MOY + 238, 48, 122] },
    { id: 'hexapod', name: 'Hexapod', bereich: 'Industrie', aera: 'seit den 1960ern', typ: 'Plattform auf sechs Beinen',
      fakt: 'Sechs Beine, die länger und kürzer werden, bewegen eine Platte in alle Richtungen: hoch, runter, seitlich, kippen. Hier rüttelt sie ein Bauteil, um zu prüfen, ob es eine lange Autofahrt aushält.',
      echt: 'Echt. Die gleiche Bauart steckt unter Flugsimulatoren, in denen Piloten üben, und in Teleskopen, die ihren Spiegel genau ausrichten.',
      note: 'Rüttelt und kippt. Das rote Teil muss es aushalten.', color: '#d9542b',
      quelle: 'https://en.wikipedia.org/wiki/Stewart_platform',
      box: () => [MOX + 506, MOY + 222, 120, 138] },
  ],
});
