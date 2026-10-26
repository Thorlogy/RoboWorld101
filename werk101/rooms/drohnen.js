/* Raum: Drohnen-Landeplatz (Dach) */
const DX = rx(roomOf('drohnen').c), DY = ry(roomOf('drohnen').r);

function deliveryDrone(f) {
  if (f < 14) return { x: 200, y: lerp(-40, 240, ease(seg(f, 0, 12))) };
  if (f < 20) return { x: 200, y: 240 };
  return { x: lerp(200, 260, seg(f, 20, 36)), y: lerp(240, -60, ease(seg(f, 20, 36))) };
}
// Möwe und Verfolger kommen und gehen durch das offene Dach (nicht durch die Wände, FEHLER.md F03)
function gull(f) {
  if (f < 16) return null;
  if (f < 22) return { x: lerp(40, 200, seg(f, 16, 22)), y: lerp(-440, 340, ease(seg(f, 16, 22))), carry: false, dir: 1 };
  if (f < 36) return { x: lerp(200, 560, seg(f, 22, 36)), y: lerp(340, -460, ease(seg(f, 22, 36))), carry: true, dir: 1 };
  return null;
}
function scout(f) {
  if (f < 24) return { x: 80, y: 352 };
  if (f < 40) return { x: lerp(80, 580, ease(seg(f, 24, 40))), y: lerp(352, -460, ease(seg(f, 24, 38))) };
  if (f < 44) return { x: 580, y: -460 };
  if (f < 56) return { x: lerp(580, 80, ease(seg(f, 44, 56))), y: lerp(-460, 352, ease(seg(f, 44, 56))) };
  return { x: 80, y: 352 };
}
function fireDrone(f) {
  if (f < 30 || f >= 58) return null;
  if (f < 36) return { x: 500, y: lerp(-40, 250, ease(seg(f, 30, 36))) };
  if (f < 46) return { x: 500, y: 250 };
  return { x: lerp(500, 560, seg(f, 46, 58)), y: lerp(250, -60, ease(seg(f, 46, 58))) };
}
function swarmT(f, lag = 0) {
  const g = f - lag;
  if (g < 18) return 0;
  if (g < 28) return ease(seg(g, 18, 28));
  if (g < 42) return 1;
  if (g < 52) return 1 - ease(seg(g, 42, 52));
  return 0;
}
function bird(x, y, carry, dir, f) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  const flap = f % 4 < 2 ? -10 : 6;
  ctx.beginPath(); ctx.moveTo(-6, -2); ctx.quadraticCurveTo(-16, flap - 6, -28, flap); ctx.moveTo(4, -2); ctx.quadraticCurveTo(12, flap - 6, 22, flap);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 6, 0, 0, TAU); paint('#f3f1ea');
  circle(12, -4, 5, '#f3f1ea'); circle(14, -5, 1.2, INK, null);
  ctx.beginPath(); ctx.moveTo(16, -3); ctx.lineTo(23, -2); ctx.lineTo(16, 0); ctx.closePath(); paint('#f0b429', INK, 1);
  ctx.restore();
  if (carry) { line(x, y + 4, x, y + 12, INK, 1.5); box(x - 9, y + 12, 18, 14, '#c9a46a', 2, 1.5); }
}

function drawDrohnen(f) {
  // Offenes Dach: kein eigener Himmel, das Haus spart diesen Raum aus (drawBuilding), der echte Himmel scheint durch
  ctx.fillStyle = silhouetteFarbe();
  for (const [x, h] of [[0, 90], [60, 140], [150, 70], [320, 120], [390, 80], [600, 110]]) ctx.fillRect(x, 330 - h, 56, h);
  text('DACH', 24, 70, 46, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  // Dachfläche, Brüstung, Landefeld
  ctx.fillStyle = '#8a8680'; ctx.fillRect(0, 344, RW, 56);
  box(0, 330, RW, 14, '#9d9891');
  ctx.beginPath(); ctx.ellipse(200, 352, 58, 7, 0, 0, TAU); paint('#f0b429', INK, 2);
  text('H', 200, 357, 14, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center' });
  box(56, 346, 50, 10, '#5d6064', 2, 1.5);
  // Antennenmast
  line(286, 330, 286, 170, '#5d6064', 4);
  circle(286, 166, 4, f % 10 < 5 ? '#ff3b30' : '#7a2a14', INK, 1);

  // Lichtshow-Schwarm übt ein Herz; einer hängt immer hinterher
  withAlpha('schwarm', () => {
    for (let i = 0; i < 9; i++) {
      const gx = 470 + (i % 3) * 34, gy = 70 + Math.floor(i / 3) * 30;
      const th = i / 9 * TAU, hx = 500 + 3.4 * 16 * Math.pow(Math.sin(th), 3), hy = 100 - 3.4 * (13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th));
      const t = swarmT(f, i === 6 ? 7 : 0);
      const x = lerp(gx, hx + (i === 6 ? 26 : 0), t), y = lerp(gy, hy + (i === 6 ? 18 : 0), t);
      const col = ['#ff6b6b', '#ffd23f', '#7fd3ff'][(i + Math.floor(f / 10)) % 3];
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
      circle(x, y, 3.2, t > 0.5 ? '#ff6b6b' : col, INK, 1);
    }
  });

  // Grill mit Hausmeister, Löschdrohne
  const fd = fireDrone(f), doused = false;
  box(470, 312, 64, 18, '#3b3d40', 3);
  line(478, 330, 474, 344, INK, 3); line(526, 330, 530, 344, INK, 3);
  for (let i = 0; i < 4; i++) box(478 + i * 14, 306, 10, 6, doused ? '#8a6a52' : '#b8582e', 3, 1.2);
  ctx.fillStyle = doused ? 'rgba(255,255,255,0.75)' : 'rgba(120,120,120,0.35)';
  for (let k = 0; k < 3; k++) { const s = (f * 2 + k * 20) % 60; ctx.beginPath(); ctx.arc(494 + k * 10 + Math.sin(s / 7) * 5, 300 - s * (doused ? 1.6 : 1), (doused ? 9 : 5) + s / 8, 0, TAU); ctx.fill(); }
  withAlpha('hausmeister', () => {
    const angry = f >= 38 && f < 46;
    person({ x: 572, face: -1, shirt: '#5d6b3a', pants: '#3b3d40', hat: '#d9542b', hand: angry ? { x: 566, y: 238 } : { x: 548, y: 300 } });
    if (!angry) line(548, 300, 528, 306, '#8a8f94', 3);
    if (angry) text('Nur Grill!', 548, 222, 12, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#d9542b' });
  });
  withAlpha('loesch', () => {
    if (!fd) return;
    quad(fd.x, fd.y, f, { color: '#d9542b', w: 54 });
    box(fd.x - 8, fd.y + 3, 16, 10, '#2a2723', 2, 1.2); circle(fd.x, fd.y + 8, 2.5, '#ff6b6b', null);
    if (f >= 36 && f < 46) {
      box(fd.x + 30, fd.y - 30, 70, 36, '#2a2723', 3, 1.2);
      const g = ctx.createRadialGradient(fd.x + 52, fd.y - 12, 2, fd.x + 52, fd.y - 12, 16); g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#2a1a4a');
      ctx.fillStyle = g; ctx.fillRect(fd.x + 34, fd.y - 26, 40, 28);
      text('GRILL', fd.x + 88, fd.y - 9, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
    }
  });

  // Paketdrohne, Paket, Möwe, Inspektionsdrohne
  withAlpha('paket', () => {
    const d = deliveryDrone(f);
    const py = f < 6 ? d.y + 10 : lerp(d.y + 10, 334, ease(seg(f, 6, 16)));
    if (f < 16) { line(d.x, d.y + 3, d.x, py, INK, 1.5); box(d.x - 11, py, 22, 16, '#c9a46a', 2, 1.5); }
    else if (f < 20) line(d.x, d.y + 3, d.x, lerp(334, d.y + 10, seg(f, 16, 20)), INK, 1.5);
    if (f >= 16 && f < 22) box(189, 334, 22, 16, '#c9a46a', 2, 1.5);
    quad(d.x, d.y, f, { color: '#f3f1ea', w: 60 });
  });
  withAlpha('moewe', () => { const g = gull(f); if (g) bird(g.x, g.y, g.carry, g.dir, f); });
  withAlpha('scout', () => {
    const s = scout(f);
    quad(s.x, s.y - 4, f < 24 || f >= 56 ? 0 : f, { color: '#3e6f9e', w: 34 });
    circle(s.x, s.y - 1, 3, '#23384d', INK, 1);
    if (f >= 30 && f < 40) text('!', s.x - 4, s.y - 22, 18, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#d9542b' });
  });
}

registerRoom({
  key: 'drohnen', name: 'Drohnen-Landeplatz', level: 'Dach',
  hitOrder: ['moewe', 'scout', 'paket', 'loesch', 'hausmeister', 'schwarm'],
  robots: [
    { id: 'paket', echt: 'So wie hier: Viele Lieferdrohnen landen gar nicht, sondern lassen das Paket an einem Seil herab. Die Möwe ist erfunden.', name: 'Paketdrohne', bereich: 'Logistik', aera: 'seit den 2010ern', typ: 'Lieferdrohne',
      fakt: 'In Ruanda bringt die Firma Zipline seit 2016 Blutkonserven per Drohne zu Krankenhäusern auf dem Land. Das Paket fällt dort an einem kleinen Fallschirm zu Boden, die Drohne landet gar nicht erst.',
      note: 'Liefert pünktlich. Was danach mit dem Paket passiert, ist nicht ihr Problem.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Zipline_(drone_delivery_company)',
      box: f => { const d = deliveryDrone(f); return [DX + d.x - 34, DY + d.y - 16, 68, 44]; } },
    { id: 'moewe', echt: 'Möwen stehlen tatsächlich gern Essen. Pakete sind ihnen meist zu schwer.', name: 'Möwe', bereich: 'Tier', aera: 'kein Roboter', typ: 'Paketdiebin',
      fakt: 'Möwen merken sich Orte, an denen es etwas zu holen gibt. Ein Landeplatz mit Paketen gehört eindeutig dazu.',
      note: 'Gewinnt jede Runde.', color: '#f3f1ea',
      box: f => { const g = gull(f); return g ? [DX + g.x - 30, DY + g.y - 16, 60, 44] : [-9999, 0, 0, 0]; } },
    { id: 'scout', quelle: 'https://en.wikipedia.org/wiki/Unmanned_aerial_vehicle', echt: 'Inspektionsdrohnen verfolgen keine Vögel. Sie fliegen festgelegte Strecken ab und machen Fotos.', name: 'Inspektionsdrohne', bereich: 'Logistik', aera: 'seit den 2010ern', typ: 'Kleine Drohne mit Kamera',
      fakt: 'Inspektionsdrohnen prüfen Windräder, Brücken und Stromleitungen aus der Nähe. Dafür muss niemand mehr klettern oder ein Gerüst aufbauen.',
      note: 'Startet sofort die Verfolgung. Kommt jedes Mal mit leeren Händen zurück.', color: '#3e6f9e',
      box: f => { const s = scout(f); return [DX + s.x - 22, DY + s.y - 20, 44, 28]; } },
    { id: 'schwarm', echt: 'Echte Lichtshows nutzen Hunderte bis Tausende Drohnen und finden nachts statt, damit man die Lichter gut sieht.', name: 'Lichtshow-Schwarm', bereich: 'Service', aera: 'seit den 2010ern', typ: 'Neun Leuchtdrohnen',
      fakt: 'Zur Eröffnung der Olympischen Winterspiele 2018 in Pyeongchang flogen 1.218 Drohnen gemeinsam eine Lichtshow, damals ein Weltrekord. Jede Drohne fliegt dabei eine vorab berechnete Bahn.',
      note: 'Übt ein Herz. Nummer sieben ist immer zu spät und landet daneben.', color: '#ff6b6b',
      quelle: 'https://en.wikipedia.org/wiki/Drone_art',
      box: () => [DX + 430, DY + 30, 170, 150] },
    { id: 'loesch', quelle: 'https://en.wikipedia.org/wiki/Unmanned_aerial_vehicle', echt: 'Realistisch. Ein Grill sieht auf dem Wärmebild tatsächlich aus wie ein kleiner Brandherd, deshalb schauen Menschen noch einmal genau hin.', name: 'Feuerwehr-Erkundungsdrohne', bereich: 'Service', aera: 'seit den 2010ern', typ: 'Drohne mit Wärmebildkamera',
      fakt: 'Feuerwehren setzen Drohnen mit Wärmebildkameras ein, um Brandherde, Glutnester und vermisste Personen von oben zu finden. Die Bilder gehen direkt an die Einsatzleitung.',
      note: 'Entdeckt jede Runde den Grill. Der Hausmeister winkt ab.', color: '#d9542b',
      box: f => { const d = fireDrone(f); return d ? [DX + d.x - 34, DY + d.y - 16, 68, 40] : [-9999, 0, 0, 0]; } },
    { id: 'hausmeister', name: 'Hausmeister', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch am Grill',
      fakt: 'Grillt in seiner Pause auf dem Dach. Die Wärmebilddrohne kennt ihn inzwischen.',
      note: 'Die Würstchen werden nie fertig.', color: '#5d6b3a',
      box: () => [DX + 548, DY + 230, 50, 130] },
  ],
  draw: drawDrohnen,
});
