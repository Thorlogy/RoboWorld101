/* Wüste ganz links (c −25 bis −22), hinter dem Gebirge im Regenschatten. Vorbild: Mojave-Wüste, DARPA Grand Challenge.
   Zwei Runden im Wechsel (WELT.runde gerade/ungerade):
   2004: 30–60 Ghostrider fällt am Start um; 60–260 Sandstorm fährt bis zur Felskehre, sitzt auf einem Felsen auf, Räder drehen durch, Qualm.
   2005: 20–260 Stanley fährt ins Ziel (Flagge 250–310); Sandstorm 60–390 und H1ghlander 110–479 folgen.
   Strecke von rechts (Start) nach links (Ziel). Fahrzeuge in echter Größe (1 m ≈ 69), Präfix wu/WU_. */
const WU_X0 = rx(-25), WU_X1 = rx(-22) + RW, WU_G = GROUND;
const WU_START = WU_X1 - 330, WU_ZIEL = WU_X0 + 420, WU_FELS = WU_X0 + 1180;
const wuJahr = () => (WELT.runde % 2 ? 2005 : 2004);

function wuPfad(g, pts) {
  if (g <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (g <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], ease(seg(g, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
}
// Positionen: x ist die Fahrzeugmitte, die Fahrzeuge fahren nach links
function wuSandstorm(g) {
  if (wuJahr() === 2004) return { x: wuPfad(g, [[60, WU_X1 + 220], [260, WU_FELS + 120]]), fest: g >= 260 };
  return { x: wuPfad(g, [[60, WU_X1 + 220], [390, WU_ZIEL + 150]]), fest: false };
}
const wuStanley = g => ({ x: wuPfad(g, [[20, WU_START], [260, WU_X0 + 230]]) });
const wuHighlander = g => ({ x: wuPfad(g, [[110, WU_X1 + 220], [479, WU_ZIEL + 480]]) });
const wuGhost = g => ({ x: wuPfad(g, [[30, WU_START + 60], [55, WU_START - 20]]), kipp: seg(g, 42, 60) });
const wuFaehrt = (a, b) => Math.abs(a - b) > 0.5;

/* ---------- Fahrzeuge (nach rechts gezeichnet, Mitte 0, Boden 0) ---------- */
function wuRad(x, y, r, g, dreht) {
  circle(x, y, r, '#2d2f33'); circle(x, y, r * 0.42, '#8a8f94', null);
  const a = dreht ? g * 1.3 : 0; line(x, y, x + Math.cos(a) * r * 0.36, y + Math.sin(a) * r * 0.36, '#3b3d40', 2);
}
function wuStanleyBild(g, dreht) {
  // VW Touareg, blau, Dachträger mit fünf Laserscannern vorn, Kamera, GPS-Antennen, Radar in der Stoßstange
  const P = [[-165, -14], [-163, -62], [-128, -72], [-92, -118], [64, -120], [118, -76], [160, -64], [167, -34], [165, -14]];
  ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); paint('#3e6fb0');
  ctx.fillStyle = '#9fc4d6';
  ctx.beginPath(); ctx.moveTo(-118, -74); ctx.lineTo(-86, -110); ctx.lineTo(-24, -110); ctx.lineTo(-24, -74); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-16, -74); ctx.lineTo(-16, -110); ctx.lineTo(58, -110); ctx.lineTo(100, -74); ctx.closePath(); ctx.fill();
  box(-160, -40, 320, 6, '#e8e4da', 0, 0.01);                       // Streifen
  box(-120, -126, 210, 7, '#3b3d40', 1, 1.5);                       // Dachträger
  for (let i = 0; i < 5; i++) box(66 + (i % 2) * 10, -150 + i * 5 - (i % 2) * 6, 16, 12, '#d6a521', 1, 1.2);   // Laserscanner vorn auf dem Träger
  box(40, -142, 18, 14, '#2a2723', 2, 1.2); circle(52, -135, 3, '#7fd3ff', null);   // Kamera
  for (const x of [-100, -60]) { line(x, -126, x, -146, INK, 2); circle(x, -149, 6, '#e8e4da', INK, 1.2); }   // GPS
  box(156, -50, 10, 12, '#3b3d40', 1, 1);                           // Radar
  box(150, -60, 12, 8, '#fff3c4', 2, 1);
  for (const x of [-104, 104]) wuRad(x, -26, 27, g, dreht);
}
function wuHummerBild(g, dreht, kuppelHoch) {
  // Hummer H1 / Humvee, rot, große weiße Sensorkuppel vorn auf dem Dach, Laserscanner am Rammschutz
  box(-162, -82, 324, 50, '#c4362b', 2, 2);
  ctx.beginPath(); ctx.moveTo(-120, -82); ctx.lineTo(-108, -130); ctx.lineTo(70, -130); ctx.lineTo(96, -82); ctx.closePath(); paint('#c4362b');
  ctx.fillStyle = '#9fc4d6'; ctx.fillRect(-100, -124, 74, 36); ctx.fillRect(-18, -124, 74, 36);
  box(-170, -66, 12, 30, '#3b3d40', 1, 1.5); box(158, -70, 16, 36, '#3b3d40', 1, 1.5);   // Stoßstangen
  box(166, -58, 14, 10, '#d6a521', 1, 1);                            // Laserscanner vorn
  line(40, -130, 40, -150 - kuppelHoch, INK, 3);
  circle(40, -170 - kuppelHoch, 26, '#ecebe6', INK, 2); line(20, -170 - kuppelHoch, 60, -170 - kuppelHoch, '#c9ccc8', 2);
  box(-150, -142, 90, 10, '#3b3d40', 1, 1.5);                        // Elektronik-Kasten
  for (const x of [-108, 110]) wuRad(x, -30, 31, g, dreht);
}
function wuGhostBild() {
  // Geländemotorrad ohne Fahrer, Elektronik-Kasten auf der Sitzbank, Antenne
  for (const x of [-56, 56]) { circle(x, -22, 22, '#2d2f33'); circle(x, -22, 8, '#8a8f94', null); }
  ctx.beginPath(); ctx.moveTo(-56, -22); ctx.lineTo(-20, -58); ctx.lineTo(30, -58); ctx.lineTo(56, -22); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  box(-30, -78, 56, 22, '#2f5d9e', 3, 1.5); box(-24, -96, 40, 18, '#3b3d40', 2, 1.2);
  line(40, -60, 52, -86, INK, 3); line(44, -88, 60, -84, INK, 3);
  line(-20, -96, -24, -128, INK, 1.5); circle(-24, -130, 3, '#d9342b', null);
}
function wuZeichne(fn, x, kipp = 0, drehpunkt = 0) {
  ctx.save(); ctx.translate(x, WU_G); ctx.scale(-1, 1);
  if (kipp) { ctx.translate(drehpunkt, 0); ctx.rotate(kipp); ctx.translate(-drehpunkt, 0); }
  fn(); ctx.restore();
}
function wuStaub(x, g, n = 4, farbe = 'rgba(214,190,140,0.55)') {
  ctx.fillStyle = farbe;
  for (let i = 0; i < n; i++) { const k = (g * 3 + i * 17) % 40; ctx.beginPath(); ctx.arc(x + k * 2.2, WU_G - 16 - k * 0.8, 10 + k * 0.6, 0, TAU); ctx.fill(); }
}

/* ---------- Landschaft ---------- */
function wuJoshua(x, s) {
  // Josua-Palmlilie der Mojave-Wüste
  limb(x, WU_G, x, WU_G - 120 * s, 10 * s, '#7a6650');
  for (const [dx, dy] of [[-40, -60], [36, -48], [-20, -86]]) limb(x, WU_G - 92 * s, x + dx * s, WU_G - 92 * s + dy * s, 7 * s, '#7a6650');
  for (const [dx, dy] of [[0, -120], [-40, -152], [36, -140], [-20, -178]]) { ctx.fillStyle = '#6f8a52'; ctx.beginPath(); ctx.arc(x + dx * s, WU_G - 92 * s + (dy + 92) * s, 14 * s, 0, TAU); ctx.fill(); }
}
function wuBild(g) {
  const ab = istDunkel(), nacht = istNacht();
  const sand = nacht ? '#4e4a5e' : ab ? '#9a7462' : '#dcbf86', fern = nacht ? '#2e3150' : ab ? '#6e5468' : '#c99a6a';
  ctx.save(); ctx.beginPath(); ctx.rect(WU_X0, WU_G - 1400, WU_X1 - WU_X0, 1440); ctx.clip();
  // Tafelberge in der Ferne
  ctx.fillStyle = fern; ctx.beginPath(); ctx.moveTo(WU_X0, WU_G - 10);
  for (const [dx, dy] of [[300, -140], [380, -330], [760, -330], [830, -170], [1300, -150], [1360, -260], [1600, -260], [1660, -150], [2100, -180], [2200, -380], [2420, -330], [2624, -40]]) ctx.lineTo(WU_X0 + dx, WU_G + dy);
  ctx.lineTo(WU_X1, WU_G); ctx.lineTo(WU_X0, WU_G); ctx.closePath(); ctx.fill();
  // Dünen und Boden
  ctx.fillStyle = sand; ctx.beginPath(); ctx.moveTo(WU_X0, WU_G);
  for (let x = 0; x <= 2624; x += 40) { const r = Math.min(1, x / 300, (2624 - x) / 300); ctx.lineTo(WU_X0 + x, WU_G - r * (40 + 26 * Math.sin(x / 210) + 12 * Math.sin(x / 67))); }
  ctx.lineTo(WU_X1, WU_G); ctx.closePath(); ctx.fill();
  ctx.fillStyle = nacht ? '#5a566c' : ab ? '#a8806a' : '#e6cc98'; ctx.fillRect(WU_X0, WU_G - 18, WU_X1 - WU_X0, 18);
  // Fahrspur
  ctx.strokeStyle = 'rgba(120,90,60,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([22, 14]);
  ctx.beginPath(); ctx.moveTo(WU_X0, WU_G - 6); ctx.lineTo(WU_X1, WU_G - 6); ctx.stroke(); ctx.setLineDash([]);
  // Pflanzen, Felsen
  for (const [dx, s] of [[180, 1], [640, 0.8], [1520, 1.1], [1980, 0.85], [2440, 0.9]]) wuJoshua(WU_X0 + dx, s);
  for (const dx of [520, 940, 1700, 2250]) { ctx.fillStyle = '#7b8a55'; ctx.beginPath(); ctx.ellipse(WU_X0 + dx, WU_G - 10, 24, 14, 0, 0, TAU); ctx.fill(); }
  // Felskehre (hier blieb Sandstorm 2004 hängen)
  ctx.beginPath(); ctx.moveTo(WU_FELS - 70, WU_G); ctx.lineTo(WU_FELS - 46, WU_G - 40); ctx.lineTo(WU_FELS + 10, WU_G - 52); ctx.lineTo(WU_FELS + 60, WU_G - 30); ctx.lineTo(WU_FELS + 80, WU_G); ctx.closePath(); paint(nacht ? '#4a4040' : '#8a6f5a', INK, 2);
  box(WU_FELS - 20, WU_G - 150, 6, 96, '#f3efe4', 0, 1.2);
  box(WU_FELS - 60, WU_G - 176, 86, 28, '#2a2723', 0, 1.5);
  text('KM 11,9', WU_FELS - 17, WU_G - 156, 16, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  // Streckenmarken
  for (let x = WU_X0 + 300; x < WU_X1 - 200; x += 260) { line(x, WU_G - 2, x, WU_G - 34, '#f3efe4', 2); box(x, WU_G - 36, 14, 9, '#d9342b', 0, 0.8); }
  // Steppenläufer rollt quer durch (Gag)
  const tx = WU_X1 - ((g * 6) % (WU_X1 - WU_X0)), ty = WU_G - 22 - Math.abs(Math.sin(g / 4)) * 26;
  ctx.save(); ctx.translate(tx, ty); ctx.rotate(-g / 5); ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i < 9; i++) { const a = i * 0.7; ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); ctx.lineTo(-Math.cos(a * 1.7) * 18, -Math.sin(a * 1.7) * 18); } ctx.stroke(); ctx.restore();
  // Startbogen und Ziel
  const jahr = wuJahr();
  for (const x of [WU_START - 220, WU_START + 220]) box(x - 6, WU_G - 230, 12, 230, '#5d6064', 0, 1.5);
  box(WU_START - 240, WU_G - 262, 480, 36, '#23384d', 0, 2);
  text(`DARPA GRAND CHALLENGE ${jahr} · START`, WU_START, WU_G - 238, 18, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  box(WU_ZIEL - 4, WU_G - 220, 8, 220, '#5d6064', 0, 1.5);
  const weht = jahr === 2005 && g >= 250 && g < 310 ? Math.sin(g * 1.4) * 10 : 0;
  ctx.save(); ctx.beginPath(); ctx.moveTo(WU_ZIEL + 4, WU_G - 220); ctx.lineTo(WU_ZIEL + 84, WU_G - 214 + weht); ctx.lineTo(WU_ZIEL + 84, WU_G - 164 + weht); ctx.lineTo(WU_ZIEL + 4, WU_G - 170); ctx.closePath(); paint('#f3efe4', INK, 1.5); ctx.clip();
  ctx.fillStyle = INK; for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) if ((i + j) % 2) ctx.fillRect(WU_ZIEL + 4 + i * 10, WU_G - 222 + j * 12 + weht * i / 8, 10, 12); ctx.restore();
  text('ZIEL', WU_ZIEL, WU_G - 232, 22, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: nacht ? '#c9ccc8' : '#2a2723' });
  text('WÜSTE', WU_X0 + 1900, WU_G - 360, 60, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(255,255,255,0.22)' });

  // Fahrzeuge: kommen aus der Startbox rechts (FEHLER.md, F07) und blenden am Rundenende weich aus
  ctx.save(); ctx.globalAlpha *= Math.min(seg(g, 0, 8), 1 - seg(g, 464, 479));
  if (jahr === 2004) {
    withAlpha('ghostrider', () => { const p = wuGhost(g); ctx.save(); ctx.translate(0, WU_G); ctx.scale(1, 1 - 0.62 * p.kipp); ctx.translate(0, -WU_G); wuZeichne(() => wuGhostBild(), p.x); ctx.restore(); });
    withAlpha('sandstorm', () => {
      const p = wuSandstorm(g), faehrt = !p.fest && g >= 60;
      wuZeichne(() => wuHummerBild(g, faehrt || p.fest, 0), p.x, p.fest ? -0.07 : 0, 160);
      if (faehrt) wuStaub(p.x + 150, g);
      if (p.fest) { wuStaub(p.x - 110, g, 5, 'rgba(110,104,100,0.6)'); }
    });
    if (g >= 280) schild('2004: KEIN FAHRZEUG IM ZIEL · DIE MILLION DOLLAR BLEIBT LIEGEN', (WU_X0 + WU_X1) / 2, WU_G - 520, '#d9342b');
  } else {
    withAlpha('highlander', () => { const p = wuHighlander(g), q = wuHighlander(g - 1); wuZeichne(() => wuHummerBild(g, wuFaehrt(p.x, q.x), -20), p.x); if (wuFaehrt(p.x, q.x)) wuStaub(p.x + 150, g); });
    withAlpha('sandstorm', () => { const p = wuSandstorm(g), q = wuSandstorm(g - 1); wuZeichne(() => wuHummerBild(g, wuFaehrt(p.x, q.x), 0), p.x); if (wuFaehrt(p.x, q.x)) wuStaub(p.x + 150, g); });
    withAlpha('stanley', () => {
      const p = wuStanley(g), q = wuStanley(g - 1), f = wuFaehrt(p.x, q.x);
      wuZeichne(() => wuStanleyBild(g, f), p.x);
      if (f) {
        wuStaub(p.x + 150, g);
        ctx.fillStyle = 'rgba(214,165,33,0.18)'; ctx.beginPath(); ctx.moveTo(p.x - 70, WU_G - 140); ctx.lineTo(p.x - 420, WU_G - 4); ctx.lineTo(p.x - 260, WU_G - 4); ctx.closePath(); ctx.fill();
      }
    });
    if (g >= 270) {
      schild('2005: STANLEY GEWINNT · 212 KM IN 6 STUNDEN 54 MINUTEN', (WU_X0 + WU_X1) / 2, WU_G - 520, '#2e7d32');
      schild('FÜNF FAHRZEUGE KOMMEN INS ZIEL', (WU_X0 + WU_X1) / 2, WU_G - 492, '#23384d');
    }
  }
  ctx.restore();
  // Startbox: Zelt am rechten Rand, aus dem die Fahrzeuge nacheinander herausfahren
  const bx0 = WU_X1 - 96;
  ctx.fillStyle = nacht ? '#3a3a4a' : '#e9e4d6'; ctx.fillRect(bx0, WU_G - 250, WU_X1 - bx0 + 40, 250);
  ctx.strokeStyle = nacht ? '#22222e' : '#c9c1aa'; ctx.lineWidth = 2; ctx.beginPath();
  for (let y = WU_G - 220; y < WU_G; y += 30) { ctx.moveTo(bx0, y); ctx.lineTo(WU_X1 + 40, y); } ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx0 - 12, WU_G - 250); ctx.lineTo(WU_X1 + 40, WU_G - 250); ctx.lineTo(WU_X1 + 40, WU_G - 280); ctx.lineTo(bx0 + 30, WU_G - 280); ctx.closePath(); paint('#d9342b', INK, 2);
  line(bx0, WU_G - 250, bx0, WU_G, INK, 2.5);
  ctx.fillStyle = 'rgba(22,23,28,0.55)'; ctx.fillRect(bx0, WU_G - 250, 10, 250);
  text('STARTBOX', bx0 + 50, WU_G - 120, 16, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: nacht ? '#c9ccc8' : '#5d5a55' });
  ctx.restore();   // Ende des Wüsten-Ausschnitts
  // weicher Übergang: Sandboden läuft links ins Gras und rechts ins Gebirge aus
  const bodenFarbe = nacht ? '90,86,108' : ab ? '168,128,106' : '230,204,152';
  for (const [x0, x1] of [[WU_X0, WU_X0 - 360], [WU_X1, WU_X1 + 360]]) {
    const gr = ctx.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, `rgba(${bodenFarbe},1)`); gr.addColorStop(1, `rgba(${bodenFarbe},0)`);
    ctx.fillStyle = gr; ctx.fillRect(Math.min(x0, x1), WU_G - 18, 360, 24);
  }
}

registerRunner({
  room: 'wueste2', draw(g) { wuBild(g); },
  robot: { id: 'darpa', name: 'DARPA Grand Challenge', bereich: 'Geschichte', aera: '2004 und 2005', typ: 'Rennen für Autos ohne Fahrer', color: '#dcbf86',
    fakt: 'Die Forschungsbehörde DARPA des US-Verteidigungsministeriums lud 2004 zu einem Rennen quer durch die Mojave-Wüste ein: Fahrzeuge ohne Fahrer, ohne Fernsteuerung, über 200 Kilometer Piste. Im März 2004 kam keines ins Ziel, das beste schaffte knapp 12 Kilometer. Im Oktober 2005 kamen fünf durch, gewonnen hat Stanley von der Universität Stanford. Viele Leute aus diesen Teams bauten später selbstfahrende Autos.',
    echt: 'Echt. Hier laufen beide Rennen im Wechsel und stark verkürzt: eine Runde 2004, eine Runde 2005. Die Wüste liegt hinter dem Gebirge, weil die Berge den Regen abhalten.',
    note: 'Achte auf das Schild an der Felskehre: KM 11,9.',
    quelle: 'https://en.wikipedia.org/wiki/DARPA_Grand_Challenge',
    box: () => [WU_START - 240, WU_G - 262, 480, 40] },
});
registerRunner({ room: 'wueste1', draw() {}, robot: { id: 'stanley', name: 'Stanley', bereich: 'Fahrzeuge', aera: '2005', typ: 'Selbstfahrendes Auto (VW Touareg)', color: '#3e6fb0',
  fakt: 'Stanley ist ein umgebauter VW Touareg der Universität Stanford, das Team leitete Sebastian Thrun. Auf dem Dach sitzen fünf Laserscanner, dazu eine Kamera, GPS und Radar. Stanley hat aus Testfahrten gelernt, welcher Boden befahrbar ist. Er gewann 2005 nach 212 Kilometern in 6 Stunden 54 Minuten und zwei Millionen Dollar.',
  echt: 'Echt. Stanley steht heute im Smithsonian-Museum in Washington. Der gelbe Fächer zeigt, wohin die Laserscanner schauen.',
  note: 'Fährt nur in der Runde 2005.', quelle: 'https://en.wikipedia.org/wiki/Stanley_(vehicle)',
  box: () => { if (wuJahr() !== 2005) return HIDE; const p = wuStanley(state.g); return [p.x - 170, WU_G - 155, 340, 155]; } } });
registerRunner({ room: 'wueste3', draw() {}, robot: { id: 'sandstorm', name: 'Sandstorm', bereich: 'Fahrzeuge', aera: '2004 und 2005', typ: 'Selbstfahrender Humvee', color: '#c4362b',
  fakt: 'Sandstorm ist ein umgebauter Humvee der Carnegie Mellon University in Pittsburgh. Die weiße Kuppel auf dem Dach enthält einen Laserscanner, der sich drehen und neigen lässt. 2004 kam Sandstorm am weitesten, knapp 12 Kilometer. In einer Kehre setzte er auf einem Felsen auf, die Vorderräder drehten durch, bis der Gummi verbrannt war. 2005 wurde er Zweiter, sein Bruder H1ghlander Dritter.',
  echt: 'Echt. Der Rauch in der Runde 2004 kommt von den durchdrehenden Reifen.',
  note: 'Bleibt 2004 an der Felskehre hängen, kommt 2005 ins Ziel.', quelle: 'https://spectrum.ieee.org/first-darpa-grand-challenge',
  box: () => { const p = wuSandstorm(state.g); return [p.x - 175, WU_G - 200, 350, 200]; } } });
registerRunner({ room: 'wueste4', draw() {}, robot: { id: 'highlander', name: 'H1ghlander', bereich: 'Fahrzeuge', aera: '2005', typ: 'Selbstfahrender Hummer H1', color: '#c4362b',
  fakt: 'H1ghlander ist ein umgebauter Hummer H1, ebenfalls von der Carnegie Mellon University. Er war 2005 lange vorn, dann ließ sein Motor nach, und er wurde Dritter hinter Stanley und Sandstorm.',
  echt: 'Echt. Hier kommt er als Letzter ins Bild und ist am Ende noch unterwegs.',
  note: 'Fährt nur in der Runde 2005.', quelle: 'https://en.wikipedia.org/wiki/DARPA_Grand_Challenge_(2005)',
  box: () => { if (wuJahr() !== 2005) return HIDE; const p = wuHighlander(state.g); return [p.x - 175, WU_G - 220, 350, 220]; } } });
registerRunner({ room: 'wueste4', draw() {}, robot: { id: 'ghostrider', name: 'Ghostrider', bereich: 'Fahrzeuge', aera: '2004', typ: 'Selbstfahrendes Motorrad', color: '#2f5d9e',
  fakt: 'Ghostrider war das einzige Motorrad im Rennen 2004, gebaut von Studenten aus Berkeley um Anthony Levandowski. Es hielt sich selbst im Gleichgewicht. Am Start fiel es sofort um: Das Team hatte die Balance-Steuerung zum Schieben an die Startlinie ausgeschaltet und vergessen, sie wieder einzuschalten.',
  echt: 'Echt. Ghostrider steht heute im Smithsonian-Museum in Washington.',
  note: 'Kippt in der Runde 2004 direkt nach dem Start um.', quelle: 'https://spectrum.ieee.org/ghostrider-the-self-driving-motorbike-that-launched-anthony-levandowski',
  box: () => { if (wuJahr() !== 2004) return HIDE; const p = wuGhost(state.g); return [p.x - 90, WU_G - 130, 180, 130]; } } });
for (const [key, name] of [['wueste1', 'Wüste: Ziel'], ['wueste2', 'Wüste: Felskehre'], ['wueste3', 'Wüste: Strecke'], ['wueste4', 'Wüste: Start']])
  registerRoom({ key, name, level: 'Außengelände', hitOrder: [], robots: [], draw() {} });
