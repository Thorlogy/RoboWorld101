/* Raum: Garage (Ebene 1)
   Hauptfigur: Robotaxi in der Waschanlage · Gag: Schaum auf dem Laserscanner, Düse reinigt (Bild 40–55) · Querverweis: neben dem Lager auf Ebene 1 */
const GX = rx(roomOf('garage').c), GY = ry(roomOf('garage').r);

const brushX = f => 44 + 276 * (0.5 - 0.5 * Math.cos(TAU * f / 60));
// Parkroboter bringt das E-Auto von rechts herein, stellt es zum Laden ab und fährt es wieder hinaus
const PK_X = 486, PK_S = 0.8;
function parkCar(f) {
  if (f < 18) return { x: lerp(820, PK_X, ease(seg(f, 0, 18))), lift: 1 };
  if (f < 22) return { x: PK_X, lift: 1 - seg(f, 18, 22) };
  if (f < 42) return { x: PK_X, lift: 0 };
  if (f < 44) return { x: PK_X, lift: seg(f, 42, 44) };
  return { x: lerp(PK_X, 820, ease(seg(f, 44, 60))), lift: 1 };
}
const plugged = f => f >= 26 && f < 40;
const chargerX = f => (f < 22 ? 628 : f < 26 ? lerp(628, 620, seg(f, 22, 26)) : f < 40 ? 620 : f < 44 ? lerp(620, 628, seg(f, 40, 44)) : 628);

// Auto in echter Größe (Maßstab der Menschen: 1 m ≈ 69): 4,6 m lang, 1,5 m hoch, Räder 68 cm.
// x = Mitte, y = 4 über der Straße (Radunterkante bei y + 4). opts: sensors (Robotaxi-Aufbau), stripe (Farbe des Streifens)
function car(x, y, col, opts = {}) {
  const P = [[-158, -8], [-156, -48], [-118, -56], [-80, -100], [42, -100], [90, -58], [150, -50], [158, -26], [156, -8]];
  ctx.beginPath(); P.forEach(([dx, dy], i) => (i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy))); ctx.closePath(); paint(col);
  ctx.fillStyle = '#9fc4d6';
  ctx.beginPath(); ctx.moveTo(x - 110, y - 58); ctx.lineTo(x - 74, y - 93); ctx.lineTo(x - 22, y - 93); ctx.lineTo(x - 22, y - 58); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 14, y - 58); ctx.lineTo(x - 14, y - 93); ctx.lineTo(x + 38, y - 93); ctx.lineTo(x + 76, y - 58); ctx.closePath(); ctx.fill();
  line(x - 18, y - 56, x - 18, y - 14, 'rgba(42,39,35,0.35)', 1.5);
  if (opts.stripe) { ctx.fillStyle = opts.stripe; ctx.fillRect(x - 150, y - 38, 300, 5); }
  box(x + 146, y - 46, 10, 7, '#fff3c4', 2, 1); box(x - 157, y - 44, 6, 8, '#d9342b', 1, 1);
  for (const dx of [-97, 97]) { circle(x + dx, y - 19, 23, '#2d2f33'); circle(x + dx, y - 19, 9, '#8a8f94', null); }
  if (opts.sensors) {
    box(x - 50, y - 108, 100, 8, '#3b3d40', 2, 1.5);
    box(x - 14, y - 128, 28, 20, '#2a2723', 4, 1.5);
    for (const dx of [-44, 38]) box(x + dx, y - 116, 8, 8, '#3b3d40', 1, 1);
    box(x + 150, y - 34, 8, 8, '#3b3d40', 1, 1);
  }
}

function drawGarage(f) {
  ctx.fillStyle = '#cfcfca'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('GARAGE', 300, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#7d7972'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  for (const x of [330, 470]) { ctx.fillStyle = '#f3f1ea'; ctx.fillRect(x, 362, 60, 4); }

  // Waschanlage mit Robotaxi
  box(8, 150, 10, 210, '#3e6f9e'); box(352, 150, 10, 210, '#3e6f9e'); box(8, 142, 354, 12, '#3e6f9e');
  withAlpha('robotaxi', () => {
    car(184, 356, '#f3f1ea', { sensors: true, stripe: '#ffd23f' });
    const foam = f >= 40 && f < 50, clean = f >= 48 && f < 55;
    if (foam) { ctx.fillStyle = 'rgba(255,255,255,0.95)'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(162 + i * 6, 230 - (i % 3) * 4, 9, 0, TAU); ctx.fill(); } }
    if (clean) { ctx.fillStyle = '#7fd3ff'; for (let i = 0; i < 8; i++) { const t = rnd(f * 9 + i); ctx.beginPath(); ctx.arc(196 + t * 14, 222 + (rnd(f + i) - 0.5) * 18, 2, 0, TAU); ctx.fill(); } }
    if (f >= 41 && f < 55) {
      box(214, 166, 120, 24, '#2a2723', 3, 1.2);
      text(clean ? 'REINIGE…' : 'SENSOR VERDECKT', 274, 182, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: clean ? '#7fd3ff' : '#ffd23f' });
    }
  });
  const bx = brushX(f);
  box(bx - 18, 156, 36, 8, '#5d6064', 1, 1.5);
  ctx.save(); ctx.beginPath(); ctx.rect(bx - 16, 164, 32, 190); ctx.clip();
  ctx.fillStyle = 'rgba(62,111,158,0.55)'; ctx.fillRect(bx - 16, 164, 32, 190);
  ctx.strokeStyle = 'rgba(243,241,234,0.7)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let y = 158 + (f % 3) * 4; y < 354; y += 12) { ctx.moveTo(bx - 16, y); ctx.lineTo(bx + 16, y + 6); }
  ctx.stroke(); ctx.restore();

  // Parkroboter trägt E-Auto, Laderoboter steckt an
  withAlpha('park', () => {
    const p = parkCar(f), ly = 6 * p.lift;
    ctx.save(); ctx.translate(p.x, 356); ctx.scale(PK_S, PK_S); ctx.translate(-p.x, -356);
    car(p.x, 352 - ly, '#3e6f9e');
    box(p.x - 140, 350, 280, 10, '#f0b429', 3, 1.5);
    for (const dx of [-120, -40, 40, 120]) circle(p.x + dx, 361, 4, '#2d2f33');
    circle(p.x, 354, 3, f % 6 < 3 ? '#ff8a24' : '#8a4a1c', INK, 1);
    ctx.restore();
    if (plugged(f)) {
      const lvl = seg(f, 28, 38);
      box(p.x - 22, 238, 44, 20, '#2a2723', 2, 1.2);
      box(p.x - 18, 242, 34, 12, null, 1, 1.2);
      ctx.fillStyle = '#7fe08a'; ctx.fillRect(p.x - 17, 243, 32 * (0.3 + 0.7 * lvl), 10);
    }
  });
  withAlpha('lader', () => {
    const cx = chargerX(f);
    box(cx - 14, 300, 28, 50, '#e6e3da', 4);
    circle(cx - 8, 354, 4, '#2d2f33'); circle(cx + 8, 354, 4, '#2d2f33');
    box(cx - 9, 308, 18, 10, '#23384d', 2, 1);
    ctx.fillStyle = '#7fe08a'; ctx.font = '700 9px "IBM Plex Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('⚡', cx, 316);
    const plugX = plugged(f) ? 612 : cx - 14;
    ctx.beginPath(); ctx.moveTo(cx - 10, 330); ctx.quadraticCurveTo((cx + plugX) / 2 - 6, 344, plugX, 326); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    box(plugX - 4, 322, 8, 8, '#3b3d40', 1, 1);
  });
}

registerRoom({
  key: 'garage', name: 'Garage', level: 'Ebene 1',
  hitOrder: ['lader', 'park', 'robotaxi'],
  robots: [
    { id: 'robotaxi', name: 'Robotaxi', bereich: 'Mobilität', aera: 'seit den 2010ern', typ: 'Fahrerloses Auto mit Sensoraufbau',
      fakt: 'Robotaxis fahren in einigen Städten der USA und Chinas schon ohne Person am Steuer. Auf dem Dach und an den Ecken sitzen Laserscanner, Kameras und Radar, die die Umgebung rundum erfassen.',
      echt: 'Genau so: Verdeckte Sensoren sind ein echtes Problem. Robotaxis haben deshalb eigene Düsen, die Kameras und Scanner frei spülen.',
      note: 'Bleibt in der Waschanlage geduldig stehen, bis der Scanner wieder frei ist.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Robotaxi',
      box: () => [GX + 24, GY + 226, 320, 136] },
    { id: 'park', name: 'Parkroboter', bereich: 'Mobilität', aera: 'seit 2019', typ: 'Flacher Roboter, der Autos anhebt',
      fakt: 'Am Flughafen Lyon parken seit 2019 flache Roboter die Autos von Reisenden. Sie fahren unter den Wagen, heben ihn an den Rädern an und stellen ihn dicht an dicht ab.',
      echt: 'Realistisch. Solche Roboter fahren nur in abgesperrten Parkbereichen ohne Fußgänger.',
      note: 'Bringt das Auto zum Laden und holt es wieder ab. Den ganzen Tag.', color: '#f0b429',
      quelle: 'https://en.newsroom.vinci-concessions.com/news/world-first-lyon-saint-exupery-airport-and-valet-parking-robot-stan-reinvent-car-parks-9f96-55ff8.html',
      box: f => [GX + parkCar(f).x - 128, GY + 270, 256, 92] },
    { id: 'lader', quelle: 'https://en.wikipedia.org/wiki/Electric_vehicle_charging_infrastructure', name: 'Laderoboter', bereich: 'Mobilität', aera: 'Erprobung', typ: 'Fahrbarer Akku mit Ladekabel',
      fakt: 'Mobile Laderoboter sind fahrbare Akkus, die zu parkenden Elektroautos kommen und sie aufladen. Mehrere Autohersteller haben solche Prototypen gezeigt.',
      echt: 'Bisher meist Prototypen. In echt dauert das Laden deutlich länger als hier.', note: 'Lädt das Auto im Zeitraffer voll.', color: '#e6e3da',
      box: f => [GX + chargerX(f) - 16, GY + 296, 32, 64] },
  ],
  draw: drawGarage,
});
