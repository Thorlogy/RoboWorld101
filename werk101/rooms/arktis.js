/* Arktis rechts neben dem Marianengraben (c 29–32). Vorbild: Eiscamp der MOSAiC-Expedition und die Forschungssiedlung
   Ny-Ålesund auf Spitzbergen. Maßstab 1 : 2 (1 m ≈ 34,5), die Polarstern steht weit hinten und wirkt darum klein.
   Ablauf pro Runde (state.g): Wetterballon 0–30 Dach auf, 30–220 steigt; Tauchroboter unter dem Eis 40–440 hin und zurück;
   Profiler am Draht ganz hinab und wieder hinauf; Eisbär läuft über die Scholle. Nachts Polarlicht. Präfix ak/AK_. */
const AK_X0 = rx(29), AK_X1 = rx(32) + RW, AK_M = 34.5;
const AK_LAND = rx(31) + 260;                         // hier beginnt das Land
const AK_EIS_O = SH_WY - 12, AK_EIS_U = SH_WY + 58;   // Scholle: knapp 2 m dick, ein Stück ragt heraus
const AK_ZELT = rx(30) + 120, AK_ITP = rx(30) + 520, AK_BALLON = rx(32) + 300;

const akRov = g => { const t = seg(g, 40, 440); return { x: AK_ZELT + 50 + 380 * Math.sin(Math.PI * t), y: AK_EIS_U + 70 + 30 * Math.sin(TAU * t) }; };
const akProfiler = g => { const t = (g % 480) / 480; return AK_EIS_U + 30 + (SH_BOT - AK_EIS_U - 90) * (0.5 - 0.5 * Math.cos(TAU * t)); };
const akBaer = g => ({ x: lerp(rx(31) + 180, rx(30) + 380, 0.5 - 0.5 * Math.cos(TAU * g / 480)), dir: Math.sin(TAU * g / 480) >= 0 ? -1 : 1 });
const akFuchs = g => ({ x: lerp(rx(32) + 400, rx(32) + 600, 0.5 - 0.5 * Math.cos(TAU * g / 240)), dir: Math.sin(TAU * g / 240) >= 0 ? 1 : -1 });

function akEisbaer(x, y, dir, g) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  const s = Math.sin(g / 3) * 4;
  ctx.fillStyle = '#f1ede0'; ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
  for (const [lx, o] of [[-26, s], [-14, -s], [18, -s], [30, s]]) { ctx.beginPath(); ctx.roundRect(lx - 6 + o * 0.3, -20, 12, 20, 3); ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -30, 40, 18, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(46, -32, 14, 10, -0.2, 0, TAU); ctx.fill(); ctx.stroke();
  circle(42, -41, 3.5, '#f1ede0', INK, 1.2); circle(58, -30, 2.5, '#2a2723', null); circle(50, -35, 1.5, '#2a2723', null);
  ctx.restore();
}
function akRobbe(x, y) {
  ctx.beginPath(); ctx.ellipse(x, y - 12, 34, 12, 0, 0, TAU); paint('#7d7a72', INK, 1.5);
  circle(x + 32, y - 18, 9, '#7d7a72', INK, 1.5); circle(x + 36, y - 20, 1.6, '#2a2723', null);
  ctx.beginPath(); ctx.moveTo(x - 34, y - 12); ctx.lineTo(x - 48, y - 20); ctx.lineTo(x - 46, y - 4); ctx.closePath(); paint('#6a675f', INK, 1.2);
}
function akPolarlicht(g) {
  if (!istNacht()) return;
  for (let k = 0; k < 3; k++) {
    const gr = ctx.createLinearGradient(0, GROUND - 1100, 0, GROUND - 500);
    gr.addColorStop(0, 'rgba(120,255,170,0)'); gr.addColorStop(0.6, `rgba(120,255,170,${0.18 - k * 0.04})`); gr.addColorStop(1, 'rgba(120,255,170,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(AK_X0, GROUND - 500);
    for (let x = 0; x <= AK_X1 - AK_X0; x += 80) ctx.lineTo(AK_X0 + x, GROUND - 1000 - 60 * Math.sin(x / 300 + g / 40 + k * 2) - k * 60);
    for (let x = AK_X1 - AK_X0; x >= 0; x -= 80) ctx.lineTo(AK_X0 + x, GROUND - 600 - 40 * Math.sin(x / 260 + g / 50 + k) - k * 40);
    ctx.closePath(); ctx.fill();
  }
}
function akHaus(x, w, h, farbe) {
  // Holzhaus auf Stelzen über dem Dauerfrostboden
  for (let i = 0; i <= 3; i++) box(x + 10 + i * (w - 26) / 3, GROUND - 20, 6, 20, '#5d6064', 0, 1);
  box(x, GROUND - 20 - h, w, h, farbe, 0, 2);
  ctx.beginPath(); ctx.moveTo(x - 10, GROUND - 20 - h); ctx.lineTo(x + w / 2, GROUND - 20 - h - 50); ctx.lineTo(x + w + 10, GROUND - 20 - h); ctx.closePath(); paint('#3b3d40', INK, 2);
  for (let i = 0; i < Math.floor(w / 70); i++) box(x + 24 + i * 70, GROUND - 20 - h + 30, 34, 34, istDunkel() ? '#ffe7a3' : '#cfe3ec', 0, 1.5);
}

function akBild(g) {
  const ab = istDunkel(), nacht = istNacht();
  akPolarlicht(g);
  ctx.fillStyle = himmelFarben()[2]; ctx.fillRect(AK_X0 - WALL, GROUND - 8, AK_LAND - AK_X0 + WALL, SH_WY - GROUND + 9);
  // Polarstern weit hinten im Eis (klein, weil weit weg)
  withAlpha('polarstern', () => {
    const x = AK_X0 + 200, y = SH_WY - 14;
    ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x + 230, y - 26); ctx.lineTo(x + 220, y); ctx.lineTo(x + 12, y); ctx.closePath(); paint('#b4322a', INK, 1.5);
    box(x + 30, y - 58, 70, 32, '#ecebe6', 0, 1.2); box(x + 46, y - 74, 34, 16, '#ecebe6', 0, 1.2); line(x + 63, y - 74, x + 63, y - 96, INK, 2);
    box(x + 150, y - 44, 10, 18, '#3b3d40', 0, 1); line(x + 120, y - 26, x + 140, y - 60, INK, 2);
  });
  // Wasser unter dem Eis
  ctx.fillStyle = ab ? '#102236' : '#2f5670'; ctx.fillRect(AK_X0 - WALL, SH_WY, AK_X1 - AK_X0 + WALL, SH_BOT - SH_WY);
  ctx.fillStyle = '#5b4f45'; ctx.fillRect(AK_X0 - WALL, SH_BOT - 20, AK_X1 - AK_X0 + WALL, 20);
  // Land: Fels mit Dauerfrost, Schnee obenauf
  ctx.beginPath(); ctx.moveTo(AK_LAND - 120, SH_BOT); ctx.lineTo(AK_LAND - 40, SH_WY + 20); ctx.lineTo(AK_LAND, GROUND); ctx.lineTo(AK_X1, GROUND); ctx.lineTo(AK_X1, SH_BOT); ctx.closePath(); paint('#4a4642', INK, 2);
  ctx.fillStyle = '#f4f6f6'; ctx.fillRect(AK_LAND, GROUND - 8, AK_X1 - AK_LAND, 10);
  // Eisschollen: offene Rinne links, große Scholle mit Camp
  const eis = ab ? '#c9d4e2' : '#eef4f8', eisU = ab ? '#8fa6bf' : '#b9d0de';
  // Eisberg: vom Gletscher abgebrochen, etwa neun Zehntel liegen unter Wasser und laufen nach unten spitz zu
  withAlpha('eisberg', () => {
    const x = AK_X0 + 220, w = 1 + Math.sin(g / 40) * 0.004;
    ctx.save(); ctx.translate(x, SH_WY); ctx.scale(1, w);
    ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(-170, 60); ctx.lineTo(-120, 150); ctx.lineTo(-60, 250); ctx.lineTo(10, SH_BOT - SH_WY - 50); ctx.lineTo(60, 220); ctx.lineTo(140, 120); ctx.lineTo(175, 40); ctx.lineTo(150, 0); ctx.closePath();
    ctx.fillStyle = ab ? 'rgba(150,180,205,0.75)' : 'rgba(190,220,236,0.8)'; ctx.fill(); ctx.strokeStyle = '#7f97ad'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(-120, -50); ctx.lineTo(-70, -60); ctx.lineTo(-40, -130); ctx.lineTo(0, -150); ctx.lineTo(30, -100); ctx.lineTo(80, -90); ctx.lineTo(120, -40); ctx.lineTo(150, 0); ctx.closePath(); paint(eis, '#7f97ad', 2);
    line(-40, -128, -10, -40, 'rgba(127,151,173,0.5)', 2); line(30, -98, 60, -30, 'rgba(127,151,173,0.5)', 2);
    ctx.restore();
  });
  for (const [a, b] of [[AK_X0 + 470, AK_LAND - 60]]) {
    ctx.beginPath(); ctx.moveTo(a, AK_EIS_O); ctx.lineTo(b, AK_EIS_O); ctx.lineTo(b - 14, AK_EIS_U); ctx.lineTo(a + 14, AK_EIS_U); ctx.closePath(); paint(eis, '#7f97ad', 2);
    ctx.fillStyle = eisU; ctx.fillRect(a + 14, AK_EIS_U - 14, b - a - 28, 14);
  }
  // Eisalgen an der Unterseite (braun), die der Tauchroboter filmt
  ctx.fillStyle = 'rgba(140,100,50,0.55)'; for (let x = AK_X0 + 500; x < AK_LAND - 80; x += 22) ctx.fillRect(x, AK_EIS_U - 2, 12, 4 + (x % 5));
  mrWellen(AK_X0, AK_X0 + 470, SH_WY, g, 'rgba(230,245,255,0.6)');
  text('ARKTIS', rx(31) + 60, SH_WY + 200, 44, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(230,245,255,0.22)' });

  withAlpha('robbe', () => akRobbe(AK_X0 + 560, AK_EIS_O));
  // Zelt über dem Eisloch und Steuerhütte
  withAlpha('beast', () => {
    box(AK_ZELT - 70, AK_EIS_O - 90, 110, 30, '#ecebe6', 0, 1.5); box(AK_ZELT - 70, AK_EIS_O - 60, 110, 60, '#3b3d40', 0, 1.5);
    box(AK_ZELT - 60, AK_EIS_O - 52, 24, 16, istDunkel() ? '#ffe7a3' : '#cfe3ec', 0, 1);
    ctx.beginPath(); ctx.moveTo(AK_ZELT, AK_EIS_O); ctx.lineTo(AK_ZELT + 50, AK_EIS_O - 96); ctx.lineTo(AK_ZELT + 100, AK_EIS_O); ctx.closePath(); paint('#d9632b', INK, 2);
    ctx.fillStyle = ab ? '#102236' : '#2f5670'; ctx.fillRect(AK_ZELT + 26, AK_EIS_O, 50, AK_EIS_U - AK_EIS_O);
    const r = akRov(g);
    ctx.strokeStyle = '#f0b429'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(AK_ZELT + 50, AK_EIS_O - 40); ctx.quadraticCurveTo(AK_ZELT + 50, AK_EIS_U + 40, r.x, r.y - 10); ctx.stroke();
    ctx.fillStyle = 'rgba(255,250,220,0.18)'; ctx.beginPath(); ctx.moveTo(r.x, r.y - 12); ctx.lineTo(r.x - 70, AK_EIS_U); ctx.lineTo(r.x + 70, AK_EIS_U); ctx.closePath(); ctx.fill();
    box(r.x - 18, r.y - 12, 36, 16, '#f0b429', 3, 1.5); box(r.x - 18, r.y + 4, 36, 8, '#3b3d40', 1, 1); circle(r.x, r.y - 13, 3, '#fff8d8', INK, 0.8);
  });
  // Ice-Tethered Profiler: Boje auf dem Eis, Draht nach unten, Messkörper fährt auf und ab
  withAlpha('itp', () => {
    line(AK_ITP, AK_EIS_O - 20, AK_ITP, SH_BOT - 40, '#c9ccc8', 1.5);
    box(AK_ITP - 6, SH_BOT - 44, 12, 10, '#5d6064', 1, 1);
    ctx.beginPath(); ctx.arc(AK_ITP, AK_EIS_O - 2, 22, Math.PI, 0); ctx.closePath(); paint('#f0b429', INK, 1.5);
    line(AK_ITP, AK_EIS_O - 24, AK_ITP, AK_EIS_O - 50, INK, 2);
    const py = akProfiler(g); box(AK_ITP - 5, py - 22, 10, 44, '#ecebe6', 4, 1.2); box(AK_ITP - 5, py + 14, 10, 6, '#d9342b', 1, 0.8);
  });
  withAlpha('eisbaer', () => { const b = akBaer(g); akEisbaer(b.x, AK_EIS_O, b.dir, g); });
  // Forschungssiedlung
  akHaus(AK_LAND + 40, 230, 120, '#b4322a');
  akHaus(rx(31) + 560, 200, 100, '#e0b23a');
  line(rx(32) + 450, GROUND, rx(32) + 450, GROUND - 60, INK, 3); line(rx(32) + 590, GROUND, rx(32) + 590, GROUND - 60, INK, 3);
  box(rx(32) + 420, GROUND - 92, 200, 34, '#2a2723', 0, 1.5);
  text('FUNKSTILLE · KEIN WLAN', rx(32) + 520, GROUND - 70, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  // automatische Wetterstation: Mast mit Windmesser
  withAlpha('wettermast', () => {
    const x = rx(31) + 470;
    line(x, GROUND, x, GROUND - 330, '#8a8f94', 4); line(x - 20, GROUND, x, GROUND - 120, '#8a8f94', 2); line(x + 20, GROUND, x, GROUND - 120, '#8a8f94', 2);
    box(x - 16, GROUND - 160, 32, 30, '#ecebe6', 1, 1.2); for (let i = 0; i < 3; i++) line(x - 14, GROUND - 154 + i * 8, x + 14, GROUND - 154 + i * 8, '#c9ccc8', 1.5);
    const a = g * 0.9; line(x, GROUND - 330, x, GROUND - 344, INK, 2);
    for (let k = 0; k < 3; k++) { const ax = x + Math.cos(a + k * TAU / 3) * 16; line(x, GROUND - 344, ax, GROUND - 344, INK, 1.5); circle(ax, GROUND - 344, 4, '#ecebe6', INK, 1); }
    box(x + 6, GROUND - 260, 26, 34, '#3b5f8a', 0, 1.2);   // Solarmodul
  });
  // Wetterballon-Startautomat: Dach öffnet sich, Ballon steigt
  withAlpha('autosonde', () => {
    const x = AK_BALLON, auf = g < 30 ? g / 30 : g < 220 ? 1 : g < 250 ? 1 - (g - 220) / 30 : 0;
    box(x - 70, GROUND - 100, 140, 100, '#ecebe6', 0, 2);
    box(x - 62, GROUND - 88, 30, 18, '#3b3d40', 0, 1);
    box(x - 70 - 60 * auf, GROUND - 110, 70, 10, '#8a8f94', 0, 1.5); box(x + 60 * auf, GROUND - 110, 70, 10, '#8a8f94', 0, 1.5);
    if (g >= 10 && g < 230) {
      const h = g < 30 ? 0 : (g - 30) * 7, by = GROUND - 140 - h, r = 34 + h / 60;
      line(x, by + r, x, by + r + 70, INK, 1); box(x - 6, by + r + 70, 12, 14, '#ecebe6', 1, 1);
      circle(x, by, r, 'rgba(250,250,245,0.92)', '#9aa0a6', 1.5);
    }
  });
  withAlpha('polarfuchs', () => {
    const f = akFuchs(g); ctx.save(); ctx.translate(f.x, GROUND - 6); ctx.scale(f.dir, 1);
    const c = nacht ? '#dfe3e6' : '#f6f6f2';
    ctx.beginPath(); ctx.ellipse(0, -14, 20, 9, 0, 0, TAU); paint(c, INK, 1.2);
    ctx.beginPath(); ctx.ellipse(-26, -16, 14, 6, -0.4, 0, TAU); paint(c, INK, 1.2);
    circle(20, -20, 7, c, INK, 1.2); ctx.beginPath(); ctx.moveTo(18, -26); ctx.lineTo(20, -34); ctx.lineTo(24, -26); ctx.closePath(); paint(c, INK, 1);
    for (const lx of [-12, 12]) line(lx, -8, lx + Math.sin(g / 2) * 3, 0, INK, 2);
    ctx.restore();
  });
}

registerRunner({
  room: 'arktis2', draw(g) { akBild(g); },
  glow(g) { glow(AK_ZELT - 48, AK_EIS_O - 44, 30, 'rgba(255,231,163,0.5)'); glow(AK_LAND + 150, GROUND - 90, 80, 'rgba(255,231,163,0.35)'); },
  robot: { id: 'arktis', name: 'Arktis mit Forschungsstation', bereich: 'Forschung', aera: 'heute', typ: 'Eiscamp und Forschungssiedlung', color: '#eef4f8',
    fakt: 'Vorbilder sind das Eiscamp der MOSAiC-Expedition (2019/2020) und Ny-Ålesund auf Spitzbergen, einer der nördlichsten Orte der Welt mit Forschern aus vielen Ländern. Vieles misst dort schon allein: Wetterstationen, Bojen im Eis, Startautomaten für Wetterballons. Menschen braucht es noch zum Steuern der Tauchroboter, zum Bohren von Eiskernen und als Wache gegen Eisbären.',
    echt: 'Echt. Gezeichnet im Maßstab 1 : 2, das Schiff steht weit hinten. In Ny-Ålesund gilt wegen der Radioteleskope wirklich Funkstille: WLAN und Bluetooth sind dort weitgehend verboten.',
    note: 'Nachts leuchtet Polarlicht über dem Eis.',
    quelle: 'https://mosaic-expedition.org/',
    box: () => [rx(31) + 50, SH_WY + 160, 220, 50] },
});
const akReg = (room, robot) => registerRunner({ room, draw() {}, robot });
akReg('arktis1', { id: 'polarstern', name: 'Polarstern', bereich: 'Forschung', aera: 'seit 1982', typ: 'Forschungs-Eisbrecher', color: '#b4322a',
  fakt: 'Die Polarstern ist der Forschungs-Eisbrecher des Alfred-Wegener-Instituts aus Bremerhaven, 118 Meter lang. Für die MOSAiC-Expedition ließ sie sich im Herbst 2019 in einer Eisscholle einfrieren und driftete fast ein Jahr mit dem Eis durch das Nordpolarmeer. Um das Schiff herum entstand ein Eiscamp mit Messstationen.',
  echt: 'Echt. Hier klein, weil sie weit hinten im Eis liegt.', note: 'Liegt weit draußen eingefroren im Eis.',
  quelle: 'https://en.wikipedia.org/wiki/RV_Polarstern',
  box: () => [AK_X0 + 200, SH_WY - 110, 240, 100] });
akReg('arktis1', { id: 'robbe', name: 'Ringelrobbe', bereich: 'Tier', aera: 'Arktis', typ: 'Robbe auf dem Eis', color: '#7d7a72',
  fakt: 'Ringelrobben leben im arktischen Meereis. Sie halten sich mit ihren Krallen Atemlöcher im Eis offen und ruhen auf den Schollen. Sie sind die wichtigste Beute der Eisbären.',
  echt: 'Echt.', note: 'Ruht auf der kleinen Scholle.',
  quelle: 'https://en.wikipedia.org/wiki/Ringed_seal',
  box: () => [AK_X0 + 510, AK_EIS_O - 30, 100, 30] });
akReg('arktis1', { id: 'eisberg', name: 'Eisberg', bereich: 'Umwelt', aera: 'Arktis', typ: 'Abgebrochenes Gletschereis', color: '#eef4f8',
  fakt: 'Ein Eisberg ist ein Stück Gletscher, das ins Meer abgebrochen ist. Er besteht aus Süßwasser-Eis und ist etwas leichter als Meerwasser. Darum schaut nur etwa ein Zehntel heraus, der Rest liegt unter Wasser. Das flache Meereis daneben ist dagegen gefrorenes Meerwasser und meist nur ein bis zwei Meter dick.',
  echt: 'Echt. Auf Spitzbergen brechen Gletscher direkt in die Fjorde ab. Dieser hier ist ein kleiner; große Eisberge sind viel höher als Häuser.', note: 'Schaukelt ganz leicht.',
  quelle: 'https://de.wikipedia.org/wiki/Eisberg',
  box: () => [AK_X0 + 70, SH_WY - 150, 300, 150] });
akReg('arktis2', { id: 'beast', name: 'Tauchroboter unter dem Eis', bereich: 'Unterwasser', aera: '2019/2020', typ: 'Ferngesteuerter Tauchroboter (MOSAiC)', color: '#f0b429',
  fakt: 'Bei MOSAiC tauchte ein kleiner Roboter mit dem Spitznamen BEAST durch ein Loch im Eis, etwa 1,5 mal 1,5 Meter groß. Über dem Loch steht ein beheiztes Zelt, damit es nicht zufriert. Aus einer warmen Hütte daneben steuern Menschen den Roboter. Er filmt die Unterseite des Eises, misst Licht und Algen und sammelt mit Netzen Plankton.',
  echt: 'Echt. Am Nordpol zeigt ein Kompass kaum noch die Richtung an, darum ist geradeaus fahren unter dem Eis schwierig.', note: 'Fährt unter der Scholle hin und her und leuchtet die braunen Eisalgen an.',
  quelle: 'https://blogs.helmholtz.de/polarstern/en/2020/02/a-successful-rov-day/',
  box: () => { const r = akRov(state.g); return [r.x - 24, r.y - 20, 48, 36]; } });
akReg('arktis2', { id: 'itp', name: 'Ice-Tethered Profiler', bereich: 'Forschung', aera: 'seit 2004', typ: 'Messboje mit Kletterkörper am Draht', color: '#f0b429',
  fakt: 'Eine Boje sitzt auf dem Eis, von ihr hängt ein Draht mit einem Gewicht ins Meer. Ein schlanker Messkörper fährt ganz allein am Draht hinab und wieder hinauf und misst Temperatur und Salzgehalt, bis 800 Meter tief. Die Boje schickt die Daten über Satellit an Land. Sie treibt mit dem Eis und arbeitet so jahrelang ohne Menschen.',
  echt: 'Echt, entwickelt in Woods Hole (USA). Hier ist der Draht stark verkürzt.', note: 'Der weiße Messkörper fährt am Draht auf und ab.',
  quelle: 'https://www.whoi.edu/oceanrobots/robots/itp-phone.html',
  box: () => [AK_ITP - 26, AK_EIS_O - 52, 52, 52] });
akReg('arktis3', { id: 'eisbaer', name: 'Eisbär', bereich: 'Tier', aera: 'Arktis', typ: 'Größtes Landraubtier', color: '#f1ede0',
  fakt: 'Eisbären jagen auf dem Meereis Robben. Für Forscher sind sie gefährlich, darum hält im Eiscamp immer jemand Wache, und auf Spitzbergen tragen Menschen außerhalb der Orte eine Waffe zum Schutz. Kameras mit Wärmebild können helfen, Bären früh zu sehen.',
  echt: 'Echt. Er läuft hier nur über die Scholle und interessiert sich nicht für das Camp.', note: 'Läuft über das Eis hin und her.',
  quelle: 'https://en.wikipedia.org/wiki/Polar_bear',
  box: () => { const b = akBaer(state.g); return [b.x - 60, AK_EIS_O - 52, 120, 52]; } });
akReg('arktis3', { id: 'wettermast', name: 'Automatische Wetterstation', bereich: 'Forschung', aera: 'heute', typ: 'Messmast mit Solarstrom', color: '#8a8f94',
  fakt: 'Der Mast misst Wind, Temperatur, Luftfeuchte und Luftdruck ganz von selbst, Tag und Nacht. Der Strom kommt aus Solarmodul und Akku, die Daten gehen per Funk oder Satellit weiter. Im langen Polarwinter ohne Sonne müssen die Akkus besonders gut sein.',
  echt: 'Echt. Solche Stationen stehen überall in der Arktis, viele weit weg von jedem Haus.', note: 'Der Windmesser oben dreht sich.',
  quelle: 'https://en.wikipedia.org/wiki/Automatic_weather_station',
  box: () => [rx(31) + 440, GROUND - 350, 70, 350] });
akReg('arktis4', { id: 'autosonde', name: 'Startautomat für Wetterballons', bereich: 'Forschung', aera: 'seit 1994', typ: 'Wetterballon-Roboter', color: '#ecebe6',
  fakt: 'Ein Wetterballon trägt eine kleine Messsonde bis etwa 30 Kilometer hoch, dann platzt er. Ein Startautomat erledigt alles allein: Er lagert die Sonden, füllt den Ballon mit Gas, öffnet das Dach und lässt ihn steigen. Das neueste Modell schafft mit einer Füllung etwa einen Monat lang zwei Starts am Tag.',
  echt: 'Echt. Solche Automaten gibt es seit 1994, auch in der Antarktis. An vielen Polarstationen lassen aber noch Menschen die Ballons von Hand steigen.', note: 'Das Dach geht auf, der Ballon steigt.',
  quelle: 'https://www.vaisala.com/blog/2022-01/vaisala-leading-way-sounding-automation',
  box: () => [AK_BALLON - 70, GROUND - 110, 140, 110] });
akReg('arktis4', { id: 'polarfuchs', name: 'Polarfuchs', bereich: 'Tier', aera: 'Arktis', typ: 'Fuchs mit Winterfell', color: '#f6f6f2',
  fakt: 'Im Winter ist der Polarfuchs fast ganz weiß, im Sommer graubraun. Sein dichtes Fell hält ihn auch bei sehr großer Kälte warm. In Ny-Ålesund laufen Polarfüchse manchmal mitten durch den Ort.',
  echt: 'Echt.', note: 'Trabt durch die Siedlung.',
  quelle: 'https://en.wikipedia.org/wiki/Arctic_fox',
  box: () => { const f = akFuchs(state.g); return [f.x - 44, GROUND - 40, 88, 40]; } });
for (const [key, name] of [['arktis1', 'Arktis: Eisrand'], ['arktis2', 'Arktis: Eiscamp'], ['arktis3', 'Arktis: Küste'], ['arktis4', 'Arktis: Forschungsstation']])
  registerRoom({ key, name, level: 'Außengelände', hitOrder: [], robots: [], draw() {} });
