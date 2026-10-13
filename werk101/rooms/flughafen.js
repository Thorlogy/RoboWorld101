/* Außengelände ganz links: Flughafen-Vorfeld mit Zubringerstraße
   Hauptfigur: fahrerloser Gepäckschlepper fährt Koffer vom Terminal zum Flugzeug · Roboterarm lädt Koffer im Terminal
   Unten auf der Straße zieht einmal pro langer Runde ein fahrerloser Lkw vorbei (state.g). */
const FHX = rx(roomOf('flughafen').c), FHY = ry(roomOf('flughafen').r);
// Schlepper: Terminal (110) → Flugzeug (430) → zurück
function fhTugX(f) {
  if (f < 10) return 110;
  if (f < 26) return lerp(110, 400, ease(seg(f, 10, 26)));
  if (f < 40) return 400;
  if (f < 56) return lerp(400, 110, ease(seg(f, 40, 56)));
  return 110;
}
const fhBags = f => (f < 30 ? Math.min(3, 1 + Math.floor(f / 4)) : f < 40 ? Math.max(0, 3 - Math.floor((f - 30) / 3)) : 0) + (f >= 56 ? 1 : 0);
const fhTruckX = g => lerp(-1100, 760, (g % 480) / 480);
function fhCase(x, y, c) { box(x - 7, y - 12, 14, 12, c, 2, 1.2); line(x - 3, y - 12, x - 3, y - 15, INK, 1.2); line(x + 3, y - 12, x + 3, y - 15, INK, 1.2); line(x - 3, y - 15, x + 3, y - 15, INK, 1.2); }
const FH_BAGS = ['#d9542b', '#3e6f9e', '#f0b429', '#5f9a4a'];
function drawFlughafen(f) {
  // Vorfeld, Grünstreifen, Straße vorn
  ctx.fillStyle = '#a9aca8'; ctx.fillRect(0, 262, RW, 72); line(0, 262, RW, 262, INK, 1.5);
  for (let x = 0; x < RW; x += 60) { ctx.fillStyle = '#f0b429'; ctx.fillRect(x, 300, 30, 3); }
  ctx.fillStyle = '#8fbf6c'; ctx.fillRect(0, 334, RW, 8);
  ctx.fillStyle = '#6d6a64'; ctx.fillRect(0, 342, RW, 58); line(0, 342, RW, 342, INK, 1.5);
  for (let x = 10; x < RW; x += 70) { ctx.fillStyle = '#f3f1ea'; ctx.fillRect(x, 370, 34, 3); }
  text('FLUGHAFEN', 230, 70, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Terminal mit Gepäckausgang
  box(0, 120, 120, 142, '#d6d9dc', 0, 2);
  for (let i = 0; i < 3; i++) box(8 + i * 36, 132, 30, 50, '#9fc4d6', 1, 1.2);
  box(0, 206, 104, 56, '#3b3d40', 0, 1.5);
  ctx.fillStyle = '#2d2f33'; ctx.fillRect(0, 238, 104, 8);
  for (let i = 0; i < 3; i++) { const x = ((f * 3 + i * 34) % 100); fhCase(x, 238, FH_BAGS[i]); }
  // Flugzeugrumpf mit Frachtluke und Förderband
  ctx.beginPath(); ctx.moveTo(390, 250); ctx.lineTo(640, 250); ctx.lineTo(640, 150); ctx.lineTo(470, 150); ctx.quadraticCurveTo(400, 152, 380, 200); ctx.quadraticCurveTo(372, 236, 390, 250); ctx.closePath(); paint('#f3f1ea', INK, 2);
  ctx.fillStyle = '#23384d'; ctx.beginPath(); ctx.moveTo(392, 186); ctx.lineTo(420, 172); ctx.lineTo(424, 186); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 6; i++) circle(470 + i * 26, 182, 5, '#9fc4d6', INK, 1);
  box(520, 214, 40, 34, '#5d6064', 2, 1.5);
  circle(470, 258, 9, '#2d2f33'); line(470, 250, 470, 248, INK, 3);
  line(476, 254, 524, 222, '#3b3d40', 6); line(476, 254, 524, 222, '#8a8f94', 3);
  if (f >= 26 && f < 40) { const u = seg(f, 26, 40) * 3 % 1; fhCase(lerp(480, 520, u), lerp(254, 224, u), FH_BAGS[Math.floor(seg(f, 26, 40) * 3) % 4]); }
  // Roboterarm lädt Koffer auf den Wagen, solange der Schlepper am Terminal steht
  withAlpha('gepaeckarm', () => {
    const at = fhTugX(f) <= 112, p = (f % 8) / 8;
    const tip = at ? { x: lerp(60, 120, ease(p)), y: 236 - 28 * Math.sin(Math.PI * p) } : { x: 70, y: 220 };
    box(46, 246, 20, 16, '#f0b429', 2, 1.2);
    const E = elbowOf({ x: 56, y: 246 }, tip, 34, 34, 1);
    limb(56, 246, E.x, E.y, 7, '#f0b429'); limb(E.x, E.y, tip.x, tip.y, 6, '#f0b429'); circle(E.x, E.y, 3.5, '#3b3d40', INK, 1);
    if (at && p < 0.85) fhCase(tip.x, tip.y + 12, FH_BAGS[Math.floor(f / 8) % 4]);
  });
  // fahrerloser Gepäckschlepper mit zwei Wagen
  withAlpha('gepaeckschlepper', () => {
    const x = fhTugX(f), dir = f >= 40 && f < 56 ? -1 : 1, n = fhBags(f);
    for (let k = 0; k < 2; k++) {
      const dx = x - dir * (48 + k * 56);
      box(dx - 24, 278, 48, 8, '#5d6064', 1, 1.2); circle(dx - 16, 290, 5, '#2d2f33'); circle(dx + 16, 290, 5, '#2d2f33');
      for (let i = 0; i < Math.min(3, Math.max(0, n - k * 3 + (k ? 0 : 0))) && k === 0; i++) fhCase(dx - 14 + i * 14, 278, FH_BAGS[i]);
      line(dx + dir * 24, 282, dx + dir * 32, 282, INK, 2);
    }
    box(x - 22, 262, 44, 24, '#f3f1ea', 4, 1.5); box(x - 6, 252, 14, 10, '#2a2723', 2, 1.2);
    circle(x - 12, 290, 6, '#2d2f33'); circle(x + 12, 290, 6, '#2d2f33');
    circle(x + dir * 18, 272, 2.5, f % 6 < 3 ? '#ff8a24' : '#8a4a1c', INK, 0.8);
  });
  // fahrerloser Lkw auf der Zubringerstraße (16 m Sattelzug, etwas kleiner, weil er weiter weg fährt)
  withAlpha('lkw', () => {
    const x = fhTruckX(state.g), k = 0.86;
    if (x < -980 || x > RW + 40) return;
    ctx.save(); ctx.translate(x, 384); ctx.scale(k, k);
    box(-840, -200, 690, 170, '#e6e3da', 3, 2);
    line(-830, -40, -160, -40, '#8a8f94', 2);
    for (const wx of [-780, -730, -260, -210]) { circle(wx, -18, 22, '#2d2f33', INK, 2); circle(wx, -18, 8, '#8a8f94', null); }
    box(-150, -60, 60, 24, '#3b3d40', 1, 1.5);
    box(-120, -186, 150, 156, '#3e6f9e', 10, 2);
    box(-40, -170, 60, 60, '#9fc4d6', 6, 1.5);
    for (const wx of [-90, 0]) { circle(wx, -18, 22, '#2d2f33', INK, 2); circle(wx, -18, 8, '#8a8f94', null); }
    box(-70, -204, 70, 18, '#2a2723', 4, 1.5);
    for (const sx of [24, 26]) box(sx, -120 + (sx - 24) * 30, 10, 12, '#2a2723', 2, 1);
    ctx.restore();
  });
}

registerRoom({
  key: 'flughafen', name: 'Flughafen', level: 'Außengelände',
  hitOrder: ['gepaeckarm', 'gepaeckschlepper', 'lkw'],
  draw: drawFlughafen,
  robots: [
    { id: 'gepaeckschlepper', name: 'Fahrerloser Gepäckschlepper', bereich: 'Logistik', aera: 'Erprobung seit 2019', typ: 'Elektrischer Schlepper ohne Fahrer',
      fakt: 'Der Schlepper zieht die Gepäckwagen allein vom Terminal zum Flugzeug. Laserscanner und Kameras sehen Menschen und andere Fahrzeuge auf dem Vorfeld, eine Karte des Flughafens kennt er auswendig.',
      echt: 'Echt, aber noch in Erprobung, zum Beispiel an Flughäfen in Singapur und Stuttgart. Auf dem Vorfeld wird es eng, deshalb fahren die Schlepper langsam und halten sofort an.',
      note: 'Holt die Koffer am Terminal ab, wartet am Flugzeug, bis alles auf dem Band ist, und fährt zurück.', color: '#f3f1ea',
      quelle: 'https://theengineer.co.uk/articles/changi-airport-group-trials-aurrigo-s-new-autonomous-baggage-handling-vehicle',
      box: f => [FHX + fhTugX(f) - 140, FHY + 248, 170, 50] },
    { id: 'gepaeckarm', name: 'Gepäckroboter', bereich: 'Logistik', aera: 'seit den 2010ern', typ: 'Roboterarm, der Koffer hebt',
      fakt: 'Im Keller des Flughafens heben Roboterarme Koffer vom Band auf die Gepäckwagen. Eine Kamera erkennt, wie der Koffer liegt, ein Sauggreifer oder eine Gabel packt ihn.',
      echt: 'Echt. Das Heben schwerer Koffer ist für Menschen anstrengend, deshalb arbeiten zum Beispiel am Flughafen Amsterdam solche Roboter. Sehr weiche Taschen und Kinderwagen schafft er aber nicht.',
      note: 'Legt einen Koffer nach dem anderen auf den Wagen, solange der Schlepper wartet.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/Baggage_handling_system',
      box: () => [FHX + 30, FHY + 196, 100, 66] },
    { id: 'lkw', name: 'Fahrerloser Lkw', bereich: 'Mobilität', aera: 'seit 2025 im Einsatz', typ: 'Sattelzug ohne Fahrer',
      fakt: 'Lidar, Radar und Kameras schauen mehrere hundert Meter weit nach vorn, ein Rechner im Führerhaus lenkt, bremst und gibt Gas. In Texas fahren seit 2025 Lkw ohne Menschen an Bord Waren zwischen zwei Städten hin und her.',
      echt: 'Echt, aber nur auf ausgewählten Autobahnstrecken und bei gutem Wetter. In Deutschland wird auf Autobahnen getestet, immer noch mit einer Person an Bord.',
      note: 'Fährt einmal pro langer Runde unten vorbei. Im Führerhaus sitzt niemand.', color: '#3e6f9e',
      quelle: 'https://www.businesswire.com/news/home/20250501031863/en/Aurora-Begins-Commercial-Driverless-Trucking-in-Texas-Ushering-in-a-New-Era-of-Freight',
      box: () => { const x = fhTruckX(state.g); return x < -980 || x > RW + 40 ? [-9999, 0, 0, 0] : [FHX + x - 730, FHY + 208, 760, 176]; } },
  ],
});
