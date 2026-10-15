/* Farm 106: vertikale Farm zwischen Haus 104 und Ladepark (c 12), zwei Stockwerke ohne Fenster.
   Oben (r 5) Anbau: Regale mit acht Etagen unter lila LED-Licht, Regalroboter, Kamera auf Schiene.
   Unten (r 6) Ernte: Schacht von oben, Förderband, Schneidstation, Roboterarm packt, Säroboter, Nährstofftank.
   Die Hülle (Wände, Decke, Dach, Schild) zeichnet ein Läufer nur in den Fugen zwischen den Feldern. */
const FARMX = rx(roomOf('farm1').c), FARMY1 = ry(roomOf('farm1').r), FARMY2 = ry(roomOf('farm2').r);
const FM_SCHACHT = 590;                        // Schacht zwischen den Stockwerken (Raumkoordinaten x)
const FM_ETAGEN = 8, FM_EH = 40;               // acht Etagen, je 40 hoch
const fmEtageY = e => 350 - (e + 1) * FM_EH;   // Oberkante der Etage e (0 = unten)

/* ---------- Abläufe (globale Uhr) ---------- */
// Regalroboter: holt eine reife Schale aus Etage 5 bei x 200 und bringt sie zum Schacht
function fmRegal(g) {
  const ziel = { x: 200, y: fmEtageY(5) + FM_EH - 6 }, schacht = { x: FM_SCHACHT - 40, y: 344 };
  if (g < 80) return { x: lerp(schacht.x, ziel.x, ease(seg(g, 0, 80))), y: lerp(schacht.y, ziel.y, ease(seg(g, 0, 80))), schale: false };
  if (g < 120) return { x: ziel.x, y: ziel.y, schale: g > 100, zieh: seg(g, 80, 110) };
  if (g < 220) return { x: lerp(ziel.x, schacht.x, ease(seg(g, 120, 220))), y: lerp(ziel.y, schacht.y, ease(seg(g, 120, 220))), schale: true };
  if (g < 260) return { x: schacht.x, y: schacht.y, schale: g < 245, schieb: seg(g, 220, 245) };
  return { x: schacht.x, y: schacht.y, schale: false };
}
// Schale unten: fällt durch den Schacht (260–320), fährt aufs Band bis zur Schneidstation (320–380), wird geschnitten und gepackt
function fmSchaleUnten(g) {
  if (g < 260) return null;
  if (g < 320) return { x: FM_SCHACHT, y: lerp(-10, 300, ease(seg(g, 260, 320))), reif: true };
  if (g < 380) return { x: lerp(FM_SCHACHT, 390, ease(seg(g, 320, 380))), y: 300, reif: true };
  if (g < 470) return { x: 390, y: 300, reif: g < 400 };
  return null;
}
const fmKamera = g => 40 + 500 * (0.5 - 0.5 * Math.cos(TAU * g / 240));

/* ---------- Zeichnen ---------- */
function fmPflanze(x, y, groesse, farbe = '#5f9a4a') {
  if (groesse < 0.2) { line(x, y, x, y - 4, '#7fe08a', 2); return; }
  const r = 4 + 9 * groesse;
  ctx.beginPath(); ctx.ellipse(x, y - r * 0.7, r, r * 0.7, 0, 0, TAU); paint(farbe, INK, 1);
  line(x, y - r * 1.2, x, y - r * 0.2, 'rgba(255,255,255,0.35)', 1.5);
}
function fmSchale(x, y, reif) {
  box(x - 26, y - 6, 52, 8, '#e6e3da', 1, 1.2);
  if (reif != null) for (let i = 0; i < 4; i++) fmPflanze(x - 18 + i * 12, y - 6, reif ? 1 : 0.1, i % 2 ? '#5f9a4a' : '#7a9a3a');
}
function drawFarmOben(f) {
  const g = state.g, r = fmRegal(g);
  ctx.fillStyle = '#2b2533'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#4a4553'; ctx.fillRect(0, 350, RW, 50); line(0, 350, RW, 350, INK, 2);
  text('ANBAU', 300, 40, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(255,255,255,0.13)' });
  // Regal: acht Etagen, links Setzlinge, nach rechts immer größer; Wasserrohr an jeder Etage
  withAlpha('farmled', () => {
    for (let e = 0; e < FM_ETAGEN; e++) {
      const y = fmEtageY(e);
      const an = !(e === 7 && (g % 240) < 80);            // eine Etage hat gerade ihre Dunkelphase
      if (an) { ctx.fillStyle = 'rgba(214,120,255,0.20)'; ctx.fillRect(20, y + 4, 500, FM_EH - 6); }
      box(20, y, 500, 4, an ? '#e7a6ff' : '#5d6064', 0, 1);       // LED-Leiste unter dem Boden der Etage darüber
      box(20, y + FM_EH - 4, 500, 4, '#8a8f94', 0, 1);
      for (let s = 0; s < 8; s++) {
        const x = 50 + s * 60, wuchs = s / 7;
        if (e === 5 && s === 2 && (g >= 100 || g < 0)) continue;   // die geholte Schale fehlt
        fmSchale(x, y + FM_EH - 4, null);
        for (let i = 0; i < 3; i++) fmPflanze(x - 14 + i * 14, y + FM_EH - 10, wuchs, (s + i) % 2 ? '#5f9a4a' : '#7a9a3a');
      }
    }
    for (const x of [20, 520]) box(x - 4, 30, 8, 320, '#5d6064', 0, 1.5);
    // Nährlösung: Rohr läuft an der Seite hoch
    line(530, 340, 530, 40, '#3e6f9e', 5); for (let e = 0; e < FM_ETAGEN; e++) line(520, fmEtageY(e) + FM_EH - 10, 530, fmEtageY(e) + FM_EH - 10, '#3e6f9e', 3);
  });
  // Kamera auf Schiene unter der Decke
  withAlpha('pflanzenkamera', () => {
    line(20, 22, 520, 22, '#8a8f94', 4);
    const x = fmKamera(g);
    box(x - 14, 20, 28, 16, '#3b3d40', 3, 1.5); circle(x, 38, 5, '#23384d', INK, 1.5);
    ctx.fillStyle = 'rgba(127,211,255,0.18)'; ctx.beginPath(); ctx.moveTo(x - 4, 40); ctx.lineTo(x + 4, 40); ctx.lineTo(x + 40, 350); ctx.lineTo(x - 40, 350); ctx.closePath(); ctx.fill();
  });
  // Regalroboter: Fahrschiene am Boden, Mast mit Hubwagen und Teleskopgabel
  withAlpha('regalroboter', () => {
    line(20, 346, FM_SCHACHT, 346, '#8a8f94', 4);
    box(r.x - 20, 330, 40, 16, '#f0b429', 3, 1.5);
    box(r.x - 5, 26, 10, 306, '#e0a526', 0, 1.5);
    box(r.x - 22, r.y - 10, 44, 14, '#3b3d40', 2, 1.5);
    const gabel = (r.zieh || 0) * 20 - (r.schieb || 0) * 0;
    line(r.x - 22, r.y - 4, r.x - 22 - gabel, r.y - 4, '#8a8f94', 3);
    if (r.schale) fmSchale(r.x, r.y - 10, true);
    circle(r.x, 34, 4, g % 12 < 6 ? '#7fe08a' : '#2d5b33', null);
  });
  // Schacht nach unten
  box(FM_SCHACHT - 20, 300, 60, 50, '#3b3d40', 0, 2); ctx.fillStyle = '#1e1a24'; ctx.fillRect(FM_SCHACHT - 14, 340, 48, 10);
  text('ZUR ERNTE', FM_SCHACHT + 10, 292, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#e7a6ff' });
}
function drawFarmUnten(f) {
  const g = state.g, s = fmSchaleUnten(g);
  ctx.fillStyle = '#e6e3da'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#c9c4b8'; ctx.fillRect(0, 384, RW, 24); line(0, 384, RW, 384, INK, 2);
  text('ERNTE', 220, 40, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  // Schacht von oben, Förderband
  box(FM_SCHACHT - 20, 0, 60, 120, '#3b3d40', 0, 2); ctx.fillStyle = '#1e1a24'; ctx.fillRect(FM_SCHACHT - 14, 0, 48, 116);
  box(300, 300, 340, 14, '#5d6064', 0, 1.5);
  for (let x = 306; x < 636; x += 22) circle(x, 307, 4, '#8a8f94', INK, 0.8);
  for (const x of [320, 600]) line(x, 314, x, 384, '#5d6064', 5);
  if (s) fmSchale(s.x, s.y, s.reif);
  // Schneidstation: Messer fährt herunter, Pflanzen sind danach ab
  withAlpha('erntestation', () => {
    box(350, 200, 80, 30, '#8a8f94', 2, 2);
    const unten = g >= 380 && g < 400 ? Math.sin(Math.PI * seg(g, 380, 400)) : 0;
    line(390, 230, 390, 240 + 50 * unten, INK, 3); box(368, 240 + 50 * unten, 44, 6, '#c9ccc8', 0, 1.5);
    // Roboterarm packt in Schalen
    const S = { x: 270, y: 300 }, nimm = { x: 390, y: 286 }, leg = { x: 210, y: 330 };
    const t = g >= 400 && g < 470 ? seg(g, 400, 470) : 0, hand = t < 0.5 ? mix(leg, nimm, ease(t * 2)) : mix(nimm, leg, ease((t - 0.5) * 2));
    box(250, 300, 40, 84, '#d9542b', 2, 2);
    const E = ik2(S, hand, 70, 66);
    limb(S.x, S.y, E.x, E.y, 11, '#d9542b'); limb(E.x, E.y, hand.x, hand.y, 9, '#d9542b');
    circle(S.x, S.y, 6, '#3b3d40'); circle(E.x, E.y, 5, '#3b3d40');
    if (t > 0.5) fmPflanze(hand.x, hand.y + 16, 1);
    // Kisten mit Salat und Kräutern
    for (let i = 0; i < 3; i++) { box(150 + i * 0, 384 - (i + 1) * 26, 90, 26, '#a8763f', 1, 1.5); for (let k = 0; k < 4; k++) fmPflanze(165 + k * 20, 384 - i * 26 - 22, 0.8); }
    text('FÜR DIE KANTINE', 195, 290, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  });
  // Säroboter: setzt Samen in leere Schalen
  withAlpha('saeroboter', () => {
    box(20, 300, 110, 12, '#5d6064', 0, 1.5);
    const x = 40 + 70 * (f / 60);
    line(30, 160, 120, 160, '#8a8f94', 4);
    box(x - 10, 160, 20, 28, '#b9d0dc', 3, 1.5); line(x, 188, x, 200 + 60 * Math.max(0, Math.sin(TAU * f / 15)), INK, 2);
    fmSchale(70, 300, false);
    if (Math.sin(TAU * f / 15) > 0.9) circle(x, 268, 2, '#a8763f', null);
    // Nährstofftank
    box(20, 320, 70, 64, '#3e6f9e', 6, 2); text('WASSER', 55, 356, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  });
}
// Hülle: Wände links/rechts, Decke zwischen den Stockwerken, Dach mit Schild
registerRunner({
  room: 'farm2', draw() {
    const x0 = FARMX - WALL, x1 = FARMX + RW, top = FARMY1 - WALL;
    ctx.fillStyle = '#6f7a5c';
    ctx.fillRect(x0, top, WALL, GROUND - top); ctx.fillRect(x1, top, WALL, GROUND - top);
    ctx.fillRect(x0, top, RW + 2 * WALL, WALL); ctx.fillRect(x0, FARMY2 - WALL, RW + 2 * WALL, WALL);
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.strokeRect(x0, top, RW + 2 * WALL, GROUND - top);
    ctx.fillStyle = '#5f5b55'; ctx.fillRect(x0 - 12, top - 10, RW + 2 * WALL + 24, 12);
    box(FARMX + 60, top - 56, 200, 40, '#2a2723');
    text('FARM 106', FARMX + 160, top - 26, 30, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#f3efe4' });
    ctx.fillStyle = '#7a9a3a'; ctx.fillRect(FARMX + 60, top - 56, 14, 40);
    // Stromkabel vom Ladepark-Speicher (Querverweis)
    line(x1 + WALL, GROUND - 60, x1 + WALL + 40, GROUND - 60, '#2a2723', 3);
  },
  robot: { id: 'farm106', name: 'Farm 106', bereich: 'Landwirtschaft', aera: 'heute', typ: 'Vertikale Farm ohne Fenster', color: '#7a9a3a',
    fakt: 'In einer vertikalen Farm wachsen Salat und Kräuter in Regalen übereinander, ohne Erde und ohne Sonne. Die Wurzeln hängen in Wasser mit Nährstoffen, das im Kreis läuft. In der Farm der Jones Food Company in Scunthorpe (England) stehen die Schalen 17 Etagen hoch.',
    echt: 'Echt. Solche Farmen brauchen viel Strom fürs Licht. Mehrere große Firmen in den USA, darunter Plenty und Bowery, mussten 2024 aufgeben, auch wegen der Stromkosten.',
    note: 'Oben wächst es, unten wird geerntet. Die Kisten gehen an die Kantine.',
    quelle: 'https://www.ucl.ac.uk/news/2025/jan/analysis-five-reasons-why-vertical-farming-still-future-despite-recent-business-failures',
    box: () => [FARMX + 60, FARMY1 - WALL - 56, 200, 40] },
});
registerRoom({
  key: 'farm1', name: 'Farm 106: Anbau', level: 'Farm 106, oben',
  hitOrder: ['pflanzenkamera', 'regalroboter', 'farmled'],
  draw: drawFarmOben,
  robots: [
    { id: 'regalroboter', name: 'Regalroboter', bereich: 'Landwirtschaft', aera: 'heute', typ: 'Fahrender Mast mit Hubwagen', color: '#e0a526',
      fakt: 'Weil die Regale so hoch sind, sollen Roboter die Pflanzschalen holen und bringen, ähnlich wie in einem Hochregallager. In Scunthorpe übernimmt das bisher noch ein Gabelstapler; ein Roboter mit dem Namen Frank soll es ablösen und die Farm überwachen.',
      echt: 'Echt als Technik aus Hochregallagern. Wie weit Farmen schon so arbeiten, ist von Farm zu Farm verschieden.',
      note: 'Holt eine reife Schale aus der sechsten Etage und schiebt sie in den Schacht zur Ernte.',
      quelle: 'https://www.grimsbytelegraph.co.uk/in-your-area/vertical-farm-scunthorpe-robot-frank-2249118',
      box: () => { const r = fmRegal(state.g); return [FARMX + r.x - 24, FARMY1 + 26, 48, 320]; } },
    { id: 'pflanzenkamera', name: 'Pflanzenkamera', bereich: 'Landwirtschaft', aera: 'heute', typ: 'Kamera auf einer Schiene', color: '#3b3d40',
      fakt: 'Kameras fahren über die Regale und fotografieren jede Pflanze. Ein Programm erkennt, ob eine Pflanze zu langsam wächst, gelbe Blätter hat oder reif ist.',
      echt: 'Echt. So etwas gibt es in vielen Gewächshäusern und Farmen.', note: 'Fährt unter der Decke hin und her.',
      box: () => { const x = fmKamera(state.g); return [FARMX + x - 16, FARMY1 + 18, 32, 24]; } },
    { id: 'farmled', name: 'Lila LED-Licht', bereich: 'Energie', aera: 'heute', typ: 'Pflanzenlicht', color: '#e7a6ff',
      fakt: 'Pflanzen brauchen zum Wachsen vor allem rotes und blaues Licht. LEDs mit nur diesen beiden Farben sind am günstigsten. Zusammen sehen sie lila aus, darum wirkt alles darin violett.',
      echt: 'Echt. Auch Pflanzen brauchen Dunkelphasen; hier ist die oberste Etage ab und zu dunkel.', note: 'Links stehen Setzlinge, rechts ist der Salat erntereif.',
      quelle: 'https://www.hortidaily.com/article/6034543/why-are-leds-always-purple-or-pink/',
      box: () => [FARMX + 20, FARMY1 + 40, 500, 300] },
  ],
});
registerRoom({
  key: 'farm2', name: 'Farm 106: Ernte', level: 'Farm 106, unten',
  hitOrder: ['saeroboter', 'erntestation'],
  draw: drawFarmUnten,
  robots: [
    { id: 'erntestation', name: 'Ernte- und Packroboter', bereich: 'Landwirtschaft', aera: 'heute', typ: 'Schneidstation mit Roboterarm', color: '#d9542b',
      fakt: 'Am Ende des Bandes schneidet eine Maschine den Salat oder die Kräuter ab, ein Roboterarm legt sie in Kisten. Die leere Schale wird gewaschen und neu besät.',
      echt: 'Echt, aber vereinfacht gezeichnet. In vielen Farmen ernten auch noch Menschen von Hand.', note: 'Das Messer fährt herunter, dann packt der Arm.',
      box: () => [FARMX + 150, FARMY2 + 200, 290, 184] },
    { id: 'saeroboter', name: 'Säroboter', bereich: 'Landwirtschaft', aera: 'heute', typ: 'Sämaschine auf Schiene', color: '#b9d0dc',
      fakt: 'Eine kleine Sämaschine setzt in jedes Loch der Schale ein paar Samen. Danach kommt die Schale ins Regal und wächst nach oben.',
      echt: 'Echt. Säen ist der Teil, der in Farmen schon am häufigsten von Maschinen gemacht wird.', note: 'Tippt alle paar Sekunden einen Samen in die Schale.',
      box: () => [FARMX + 20, FARMY2 + 160, 120, 224] },
  ],
});
document.addEventListener('DOMContentLoaded', () => {
  if (typeof HOUSES !== 'undefined') HOUSES.push({ x: FARMX - WALL - 12, y: FARMY1 - WALL - 60, w: RW + 2 * WALL + 24, h: GROUND - FARMY1 + WALL + 60 });
  if (typeof KINDER !== 'undefined') Object.assign(KINDER, {
    farm106: 'In diesem Haus wächst Salat in Regalen übereinander, ganz ohne Erde und ohne Sonne.',
    regalroboter: 'Dieser Roboter fährt am Regal hoch und holt den fertigen Salat herunter.',
    pflanzenkamera: 'Die Kamera fotografiert jede Pflanze und merkt, wenn eine krank ist.',
    farmled: 'Pflanzen brauchen rotes und blaues Licht. Zusammen sieht das lila aus.',
    erntestation: 'Hier wird der Salat abgeschnitten, und ein Roboterarm legt ihn in Kisten für die Kantine.',
    saeroboter: 'Dieser kleine Roboter steckt Samen in die Schalen.',
  });
});
