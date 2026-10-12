/* Raum: Garage (Ebene 1)
   Hauptfigur: Robotaxi in der Waschanlage · Gag: Schaum auf dem Laserscanner, Düse reinigt (Bild 40–55) · Querverweis: neben dem Lager auf Ebene 1 */
const GX = rx(roomOf('garage').c), GY = ry(roomOf('garage').r);

const brushX = f => 60 + 160 * (0.5 - 0.5 * Math.cos(TAU * f / 60));
function parkCar(f) {
  if (f < 18) return { x: lerp(370, 520, ease(seg(f, 0, 18))), lift: 1 };
  if (f < 22) return { x: 520, lift: 1 - seg(f, 18, 22) };
  if (f < 42) return { x: 520, lift: 0 };
  if (f < 44) return { x: 520, lift: seg(f, 42, 44) };
  return { x: lerp(520, 370, ease(seg(f, 44, 60))), lift: 1 };
}
const plugged = f => f >= 26 && f < 40;
const chargerX = f => (f < 22 ? 610 : f < 26 ? lerp(610, 588, seg(f, 22, 26)) : f < 40 ? 588 : f < 44 ? lerp(588, 610, seg(f, 40, 44)) : 610);

function car(x, y, col, opts = {}) {
  ctx.beginPath(); ctx.moveTo(x - 70, y - 10); ctx.lineTo(x - 66, y - 30); ctx.lineTo(x - 36, y - 34); ctx.lineTo(x - 20, y - 54); ctx.lineTo(x + 30, y - 54); ctx.lineTo(x + 50, y - 34); ctx.lineTo(x + 68, y - 30); ctx.lineTo(x + 70, y - 10); ctx.closePath(); paint(col);
  ctx.fillStyle = '#9fc4d6'; ctx.beginPath(); ctx.moveTo(x - 30, y - 34); ctx.lineTo(x - 17, y - 50); ctx.lineTo(x + 4, y - 50); ctx.lineTo(x + 4, y - 34); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 8, y - 34); ctx.lineTo(x + 8, y - 50); ctx.lineTo(x + 27, y - 50); ctx.lineTo(x + 42, y - 34); ctx.closePath(); ctx.fill();
  circle(x - 42, y - 8, 12, '#2d2f33'); circle(x + 42, y - 8, 12, '#2d2f33');
  circle(x - 42, y - 8, 5, '#8a8f94', null); circle(x + 42, y - 8, 5, '#8a8f94', null);
  if (opts.sensors) {
    box(x - 24, y - 62, 48, 8, '#3b3d40', 2, 1.5);
    box(x - 9, y - 76, 18, 14, '#2a2723', 3, 1.5);
    for (const dx of [-20, 18]) box(x + dx, y - 68, 6, 6, '#3b3d40', 1, 1);
  }
}

function drawGarage(f) {
  ctx.fillStyle = '#cfcfca'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('GARAGE', 300, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#7d7972'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  for (const x of [330, 470]) { ctx.fillStyle = '#f3f1ea'; ctx.fillRect(x, 362, 60, 4); }

  // Waschanlage mit Robotaxi
  box(14, 110, 8, 250, '#3e6f9e'); box(258, 110, 8, 250, '#3e6f9e'); box(14, 104, 252, 12, '#3e6f9e');
  withAlpha('robotaxi', () => {
    car(140, 356, '#f3f1ea', { sensors: true });
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(74, 344, 132, 4);
    const foam = f >= 40 && f < 50, clean = f >= 48 && f < 55;
    if (foam) { ctx.fillStyle = 'rgba(255,255,255,0.95)'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(126 + i * 5, 286 - (i % 3) * 3, 7, 0, TAU); ctx.fill(); } }
    if (clean) { ctx.fillStyle = '#7fd3ff'; for (let i = 0; i < 8; i++) { const t = rnd(f * 9 + i); ctx.beginPath(); ctx.arc(152 + t * 10, 280 + (rnd(f + i) - 0.5) * 16, 1.8, 0, TAU); ctx.fill(); } }
    if (f >= 41 && f < 55) {
      box(162, 236, 96, 22, '#2a2723', 3, 1.2);
      text(clean ? 'REINIGE…' : 'SENSOR VERDECKT', 210, 251, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: clean ? '#7fd3ff' : '#ffd23f' });
    }
  });
  const bx = brushX(f);
  box(bx - 18, 118, 36, 8, '#5d6064', 1, 1.5);
  ctx.save(); ctx.beginPath(); ctx.rect(bx - 16, 126, 32, 226); ctx.clip();
  ctx.fillStyle = 'rgba(62,111,158,0.55)'; ctx.fillRect(bx - 16, 126, 32, 226);
  ctx.strokeStyle = 'rgba(243,241,234,0.7)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let y = 120 + (f % 3) * 4; y < 352; y += 12) { ctx.moveTo(bx - 16, y); ctx.lineTo(bx + 16, y + 6); }
  ctx.stroke(); ctx.restore();

  // Parkroboter trägt E-Auto, Laderoboter steckt an
  withAlpha('park', () => {
    const p = parkCar(f), ly = 6 * p.lift;
    car(p.x, 352 - ly, '#3e6f9e');
    box(p.x - 76, 348, 152, 10, '#f0b429', 3, 1.5);
    circle(p.x - 60, 359, 3, '#2d2f33'); circle(p.x + 60, 359, 3, '#2d2f33');
    circle(p.x, 352, 2.5, f % 6 < 3 ? '#ff8a24' : '#8a4a1c', INK, 1);
    if (plugged(f)) {
      const lvl = seg(f, 28, 38);
      box(p.x - 22, 270, 44, 20, '#2a2723', 2, 1.2);
      box(p.x - 18, 274, 34, 12, null, 1, 1.2);
      ctx.fillStyle = '#7fe08a'; ctx.fillRect(p.x - 17, 275, 32 * (0.3 + 0.7 * lvl), 10);
    }
  });
  withAlpha('lader', () => {
    const cx = chargerX(f);
    box(cx - 14, 300, 28, 50, '#e6e3da', 4);
    circle(cx - 8, 354, 4, '#2d2f33'); circle(cx + 8, 354, 4, '#2d2f33');
    box(cx - 9, 308, 18, 10, '#23384d', 2, 1);
    ctx.fillStyle = '#7fe08a'; ctx.font = '700 9px "IBM Plex Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('⚡', cx, 316);
    const plugX = plugged(f) ? 586 : cx - 14;
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
      box: () => [GX + 66, GY + 280, 150, 82] },
    { id: 'park', name: 'Parkroboter', bereich: 'Mobilität', aera: 'seit 2019', typ: 'Flacher Roboter, der Autos anhebt',
      fakt: 'Am Flughafen Lyon parken seit 2019 flache Roboter die Autos von Reisenden. Sie fahren unter den Wagen, heben ihn an den Rädern an und stellen ihn dicht an dicht ab.',
      echt: 'Realistisch. Solche Roboter fahren nur in abgesperrten Parkbereichen ohne Fußgänger.',
      note: 'Bringt das Auto zum Laden und holt es wieder ab. Den ganzen Tag.', color: '#f0b429',
      quelle: 'https://en.newsroom.vinci-concessions.com/news/world-first-lyon-saint-exupery-airport-and-valet-parking-robot-stan-reinvent-car-parks-9f96-55ff8.html',
      box: f => [GX + parkCar(f).x - 76, GY + 296, 152, 64] },
    { id: 'lader', name: 'Laderoboter', bereich: 'Mobilität', aera: 'Erprobung', typ: 'Fahrbarer Akku mit Ladekabel',
      fakt: 'Mobile Laderoboter sind fahrbare Akkus, die zu parkenden Elektroautos kommen und sie aufladen. Mehrere Autohersteller haben solche Prototypen gezeigt.',
      echt: 'Bisher meist Prototypen. In echt dauert das Laden deutlich länger als hier.', note: 'Lädt das Auto im Zeitraffer voll.', color: '#e6e3da',
      box: f => [GX + chargerX(f) - 16, GY + 296, 32, 64] },
  ],
  draw: drawGarage,
});
