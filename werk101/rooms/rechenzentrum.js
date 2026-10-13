/* Haus 4: Rechenzentrum (zwei Räume, Erdgeschoss rechts neben Halle 103)
   Serverhalle: Bandroboter holt ein Magnetband, Technikerin tauscht eine Festplatte, KI-Schrank mit Wasserkühlung.
   Leitwarte: Bildschirm mit Agenten-Schwarm (Chef-Agent verteilt acht Teilaufgaben), Tauchkühlung mit Siedeblasen.
   Gag: Kaum hat die Technikerin die Platte getauscht, leuchtet woanders wieder eine orange Lampe. */
const RZX = rx(roomOf('rz1').c), RZY = ry(roomOf('rz1').r);
const RZ2X = rx(roomOf('rz2').c), RZ2Y = ry(roomOf('rz2').r);
const RZ_DECK = 336;

function rzFloor(f, perf) {
  ctx.fillStyle = '#4a4d52'; ctx.fillRect(0, RZ_DECK, RW, 24);
  ctx.fillStyle = '#7d7972'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  for (let x = 0; x < RW; x += 40) line(x, RZ_DECK, x, 360, 'rgba(0,0,0,0.25)', 1);
  // kalte Luft strömt unter dem Doppelboden
  for (let i = 0; i < 17; i++) {
    const x = ((i * 40 + f * 4) % 680) - 20;
    ctx.beginPath(); ctx.moveTo(x, 343); ctx.lineTo(x + 8, 348); ctx.lineTo(x, 353); ctx.strokeStyle = 'rgba(127,211,255,0.8)'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.fillStyle = '#c9ccc8'; ctx.fillRect(0, RZ_DECK - 4, RW, 4); line(0, RZ_DECK - 4, RW, RZ_DECK - 4, INK, 1.5);
  if (perf) for (const [a, b] of perf) for (let x = a; x < b; x += 6) circle(x + 3, RZ_DECK - 2, 0.9, '#5d6064', null);
}
function rzArrowUp(x, y, col) { line(x, y, x, y - 12, col, 2); line(x - 4, y - 8, x, y - 12, col, 2); line(x + 4, y - 8, x, y - 12, col, 2); }

/* ---------- Bandroboter: Kassette aus Fach (1, 2) ins Laufwerk und zurück ---------- */
const BR_SLOT = { x: 63, y: 172 }, BR_DRIVE = { x: 120, y: 294 };
function brPos(f) {
  if (f < 4) return BR_SLOT;
  if (f < 14) return mix(BR_SLOT, BR_DRIVE, ease(seg(f, 4, 14)));
  if (f < 44) return BR_DRIVE;
  if (f < 54) return mix(BR_DRIVE, BR_SLOT, ease(seg(f, 44, 54)));
  return BR_SLOT;
}
const brCarry = f => (f >= 2 && f < 16) || (f >= 42 && f < 56);
function drawTapeLibrary(f) {
  box(18, 112, 152, 224, '#3b3d40', 2);
  box(26, 124, 136, 186, '#1d2024', 1, 1.5);
  const cols = ['#f0b429', '#7fd3ff', '#e2e0d8', '#d9542b', '#7fe08a'];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) {
    if (c === 1 && r === 2 && (brCarry(f) || (f >= 14 && f < 44))) continue;
    const x = 32 + c * 21, y = 130 + r * 18;
    ctx.fillStyle = '#2d2f33'; ctx.fillRect(x, y, 17, 13);
    ctx.fillStyle = cols[(r * 3 + c * 2) % 5]; ctx.fillRect(x + 2, y + 2, 13, 4);
  }
  // zwei Laufwerke unten
  for (const dx of [40, 100]) {
    box(dx, 288, 40, 16, '#5d6064', 1, 1.2);
    const on = dx === 100 && f >= 18 && f < 42;
    circle(dx + 34, 296, 2.4, on ? (f % 4 < 2 ? '#7fe08a' : '#2f6a3a') : '#2f6a3a', null);
    ctx.fillStyle = '#111'; ctx.fillRect(dx + 6, 294, 20, 3);
  }
  // Greifer: senkrechte Schiene fährt waagerecht, Schlitten fährt hoch und runter
  const p = brPos(f);
  line(p.x, 126, p.x, 306, '#8a8f94', 3);
  box(p.x - 12, p.y - 9, 24, 18, '#f0b429', 2, 1.5);
  if (brCarry(f)) { ctx.fillStyle = '#2d2f33'; ctx.fillRect(p.x - 8, p.y - 6, 16, 12); ctx.fillStyle = '#7fd3ff'; ctx.fillRect(p.x - 6, p.y - 4, 12, 3); }
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(26, 124, 50, 186);
  text('BANDARCHIV', 94, 326, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#d6d9dc' });
}

/* ---------- Server, KI-Schrank, Technikerin ---------- */
const RZ_RACKS = [190, 256, 322, 388];
const rzWarn = f => f >= 52 || f < 24;
function techX(f) {
  if (f < 14) return lerp(596, 362, ease(seg(f, 0, 14)));
  if (f < 34) return 362;
  if (f < 50) return lerp(362, 596, ease(seg(f, 34, 50)));
  return 596;
}
function drawRacks(f) {
  // Kabelpritsche unter der Decke, Glasfasern zu jedem Schrank
  box(150, 28, 480, 8, '#f0b429', 1, 1.2);
  for (const x of [...RZ_RACKS, 454]) line(x + 30, 36, x + 30, 196, 'rgba(240,180,41,0.8)', 2);
  RZ_RACKS.forEach((x, k) => {
    box(x, 196, 60, 140, '#2f3236', 1);
    for (let u = 0; u < 10; u++) {
      const y = 204 + u * 12.6;
      ctx.fillStyle = '#3b3d40'; ctx.fillRect(x + 5, y, 50, 10);
      for (let l = 0; l < 3; l++) {
        const warn = k === 2 && u === 4 && l === 0 && rzWarn(f);
        const on = rnd(k * 31 + u * 7 + l * 3 + Math.floor(f / 2)) > 0.45;
        circle(x + 10 + l * 6, y + 5, 1.8, warn ? '#ff9f1c' : on ? '#7fe08a' : '#2f6a3a', null);
      }
      ctx.fillStyle = '#1d2024'; ctx.fillRect(x + 32, y + 3, 20, 4);
    }
    // warme Luft steigt hinten auf
    const t = ((f + k * 15) % 30) / 30;
    ctx.save(); ctx.globalAlpha = 1 - t; line(x + 14, 190 - t * 50, x + 14, 180 - t * 50, '#ff9f1c', 2); line(x + 44, 186 - t * 50, x + 44, 176 - t * 50, '#ff9f1c', 2); ctx.restore();
  });
  // kalte Luft kommt aus den Lochplatten
  for (let i = 0; i < 6; i++) { const t = ((f * 2 + i * 10) % 60) / 60; ctx.save(); ctx.globalAlpha = 1 - t; rzArrowUp(206 + i * 50, 330 - t * 40, '#3e9fd6'); ctx.restore(); }
}
function drawGpuRack(f) {
  box(454, 196, 66, 140, '#1f2124', 1);
  box(460, 200, 54, 14, '#2a2723', 1, 1); text('KI', 487, 211, 11, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#7fe08a' });
  for (let u = 0; u < 5; u++) {
    const y = 220 + u * 22;
    box(460, y, 54, 18, '#2f3236', 1, 1);
    for (const fx of [472, 500]) {
      circle(fx, y + 9, 7, '#1d2024', INK, 1);
      ctx.save(); ctx.translate(fx, y + 9); ctx.rotate(f * 1.7 + u); for (let b = 0; b < 3; b++) { ctx.rotate(TAU / 3); line(0, 0, 6, 0, '#8a8f94', 1.6); } ctx.restore();
    }
    ctx.fillStyle = '#7fe08a'; ctx.fillRect(482, y + 4, 8, 10 * (0.6 + 0.4 * rnd(u * 13 + f)));
  }
  // Wasserleitungen in den Doppelboden: blau hin, rot zurück
  line(466, 330, 466, 352, '#3e9fd6', 4); line(508, 330, 508, 352, '#d9542b', 4);
}

function drawRz1(f) {
  ctx.fillStyle = '#d6d8d4'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('SERVERHALLE', 250, 82, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  rzFloor(f, [[190, 520]]);
  withAlpha('bandroboter', () => drawTapeLibrary(f));
  withAlpha('serverschrank', () => drawRacks(f));
  withAlpha('gpurack', () => drawGpuRack(f));
  // Servicewagen mit Laptop und Ersatzplatten
  box(570, 290, 56, 8, '#8a8f94', 1, 1.2); line(574, 298, 574, 328, INK, 2); line(622, 298, 622, 328, INK, 2); box(570, 316, 56, 6, '#8a8f94', 1, 1.2);
  circle(576, 331, 4, '#2d2f33'); circle(620, 331, 4, '#2d2f33');
  box(584, 276, 30, 14, '#3b3d40', 1, 1.2); ctx.fillStyle = '#7fd3ff'; ctx.fillRect(587, 278, 24, 9);
  for (let i = 0; i < 3; i++) box(578 + i * 14, 306, 10, 10, '#5d6064', 1, 1);
  withAlpha('rztechnikerin', () => {
    const x = techX(f), atRack = f >= 14 && f < 34, carry = f < 26;
    const hand = atRack ? { x: 352, y: 256 + (f < 24 ? 0 : 0) } : { x: x - 14, y: 286 };
    person({ x, foot: RZ_DECK - 4, face: -1, shirt: '#2f5880', pants: '#3b3d40', hair: '#1f1a17', hand, s: 1 });
    if (carry) box(hand.x - 8, hand.y - 6, 12, 9, '#8a8f94', 1, 1);
    if (f >= 24 && f < 34) text('✓', 352, 238, 14, { weight: 700, align: 'center', color: '#2f8f4e' });
  });
}

/* ---------- Leitwarte: Agenten-Schwarm und Tauchkühlung ---------- */
const AS_C = { x: 214, y: 168 };
const AS_JOBS = ['Suchen', 'Lesen', 'Videos', 'Messwerte', 'Übersetzen', 'Prüfen', 'Quellen', 'Bilder'];
const asAgent = k => ({ x: AS_C.x + 150 * Math.cos(k * TAU / 8 - Math.PI / 2), y: AS_C.y + 50 * Math.sin(k * TAU / 8 - Math.PI / 2) });
const asStart = k => k * 3;
function drawSwarm(f) {
  box(24, 60, 380, 194, '#1a1d22', 2, 2);
  ctx.fillStyle = '#0b1220'; ctx.fillRect(32, 68, 364, 178);
  text('AGENTEN-SCHWARM', 40, 86, 11, { family: '"IBM Plex Mono", monospace', weight: 500, color: '#7fd3ff' });
  text('Aufgabe: Wie lernen Roboter laufen?', 40, 100, 9, { family: '"IBM Plex Mono", monospace', color: '#c9d6e2' });
  let done = 0;
  for (let k = 0; k < 8; k++) {
    const a = asAgent(k), s = asStart(k);
    line(AS_C.x, AS_C.y, a.x, a.y, 'rgba(127,211,255,0.18)', 1);
    const fin = f >= s + 28 && f < 52, work = f >= s + 8 && f < s + 20;
    if (fin) done++;
    if (f >= s && f < s + 8) { const p = mix(AS_C, a, seg(f, s, s + 8)); box(p.x - 3, p.y - 3, 6, 6, '#f0b429', 1, 0); }
    if (f >= s + 20 && f < s + 28) { const p = mix(a, AS_C, seg(f, s + 20, s + 28)); box(p.x - 3, p.y - 3, 6, 6, '#7fe08a', 1, 0); }
    if (work) { ctx.beginPath(); ctx.arc(a.x, a.y, 13, f * 0.9, f * 0.9 + 4); ctx.strokeStyle = '#7fd3ff'; ctx.lineWidth = 2; ctx.stroke(); }
    circle(a.x, a.y, 8, fin ? '#7fe08a' : work ? '#7fd3ff' : '#2f4866', null);
    const side = k === 0 || k === 4, below = a.y > AS_C.y + 5;
    if (side) text(AS_JOBS[k], a.x + 16, a.y + 3, 8, { family: '"IBM Plex Mono", monospace', color: '#c9d6e2' });
    else text(AS_JOBS[k], a.x, below ? a.y + 21 : a.y - 13, 8, { family: '"IBM Plex Mono", monospace', align: 'center', color: '#c9d6e2' });
  }
  circle(AS_C.x, AS_C.y, 15, '#f0b429', null);
  text('Chef', AS_C.x, AS_C.y + 3, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#1a1d22' });
  if (f >= 52) text('Bericht fertig', AS_C.x, AS_C.y + 30, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
  const n = f >= 52 ? 8 : done;
  ctx.fillStyle = '#2f4866'; ctx.fillRect(40, 234, 120, 6); ctx.fillStyle = '#7fe08a'; ctx.fillRect(40, 234, 15 * n, 6);
  text(`${n}/8 fertig`, 168, 240, 9, { family: '"IBM Plex Mono", monospace', color: '#c9d6e2' });
}
function drawImmersion(f) {
  text('Tauchkühlung · siedet bei 50 °C', 525, 206, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  box(430, 214, 190, 122, '#8a8f94', 2);
  ctx.fillStyle = 'rgba(191,230,238,0.9)'; ctx.fillRect(438, 236, 174, 96);
  // Kondensator oben: Dampf wird wieder flüssig
  for (let i = 0; i < 5; i++) line(440 + i * 36, 224, 466 + i * 36, 224, '#b8733a', 3);
  for (let i = 0; i < 5; i++) {
    const x = 450 + i * 34;
    box(x, 252, 18, 80, '#3b3d40', 1, 1.2);
    circle(x + 9, 258, 2, '#7fe08a', null);
    for (let j = 0; j < 4; j++) {
      const y = 330 - ((f * 3 + j * 22 + i * 9) % 90);
      if (y < 240) continue;
      circle(x + 4 + (j % 2) * 10, y, 2.2, 'rgba(255,255,255,0.9)', '#5d9fb0', 1);
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(438, 236, 30, 96);
  // Abwärme geht nach draußen
  line(612, 222, 612, 8, '#d9542b', 5);
  box(498, 120, 104, 34, '#f3f1ea', 1, 1.2);
  text('Abwärme heizt', 550, 134, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  text('Nachbarhäuser', 550, 147, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
}
/* ---------- Kilobots: echter Roboterschwarm auf dem Tisch, von oben gefilmt; bildet den Buchstaben K ---------- */
const KB_N = 48;
const kbTarget = i => {
  // Punkte auf dem K: Stamm (16), oberer Arm (16), unterer Arm (16)
  const t = (i % 16) / 15;
  if (i < 16) return { x: 0, y: t };
  if (i < 32) return { x: t * 0.7, y: 0.5 - t * 0.5 };
  return { x: t * 0.7, y: 0.5 + t * 0.5 };
};
function drawKilobots(f) {
  box(306, 304, 120, 8, '#e6e3da', 1, 1.5); line(314, 312, 314, 332, INK, 3); line(418, 312, 418, 332, INK, 3);
  for (let i = 0; i < 14; i++) { const x = 312 + i * 8 + Math.sin(TAU * f / 20 + i) * 1.5; box(x, 299, 5, 5, '#3b3d40', 2, 0.6); }
  // Bild der Deckenkamera
  box(310, 258, 112, 40, '#0b1220', 2, 1.2);
  const k = ease(seg(f, 0, 30)) - ease(seg(f, 45, 60));
  for (let i = 0; i < KB_N; i++) {
    const a = { x: 316 + rnd(i * 3.1) * 100, y: 264 + rnd(i * 7.7) * 28 }, tg = kbTarget(i);
    const b = { x: 352 + tg.x * 30, y: 263 + tg.y * 30 };
    circle(lerp(a.x, b.x, k), lerp(a.y, b.y, k), 1.4, '#ffb347', null);
  }
  text('von oben', 418, 294, 7, { family: '"IBM Plex Mono", monospace', align: 'right', color: '#c9d6e2' });
}
function drawRz2(f) {
  ctx.fillStyle = '#d0d3d5'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('LEITWARTE', 430, 82, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  rzFloor(f, null);
  withAlpha('agentenschwarm', () => drawSwarm(f));
  withAlpha('tauchkuehlung', () => drawImmersion(f));
  withAlpha('kilobots', () => drawKilobots(f));
  // Pult mit zwei Bildschirmen
  box(60, 284, 240, 10, '#8a6a4a', 1, 1.5); line(70, 294, 70, 332, INK, 3); line(290, 294, 290, 332, INK, 3);
  box(92, 246, 64, 38, '#1a1d22', 2, 1.5); box(166, 246, 64, 38, '#1a1d22', 2, 1.5);
  ctx.fillStyle = '#7fe08a'; for (let i = 0; i < 6; i++) ctx.fillRect(98 + i * 9, 278 - 20 * rnd(i + Math.floor(f / 3)), 6, 20 * rnd(i + Math.floor(f / 3)));
  ctx.fillStyle = '#7fd3ff'; for (let i = 0; i < 4; i++) ctx.fillRect(172, 254 + i * 7, 30 + 20 * rnd(i * 5 + Math.floor(f / 6)), 3);
  box(208, 290, 36, 4, '#3b3d40', 1, 1);
  withAlpha('operator', () => {
    box(262, 300, 30, 6, '#3b3d40', 2, 1.2); line(277, 306, 277, 330, INK, 3);
    const tip = f % 6 < 3 ? 0 : 2;
    person({ x: 272, foot: RZ_DECK - 4, sit: true, face: -1, shirt: '#7b4b8e', pants: '#2f4866', hair: '#b07a3a', hand: { x: 232, y: 288 - tip } });
  });
}

registerRoom({
  key: 'rz1', name: 'Rechenzentrum: Serverhalle', level: 'Rechenzentrum',
  hitOrder: ['rztechnikerin', 'bandroboter', 'gpurack', 'serverschrank'],
  draw: drawRz1,
  robots: [
    { id: 'bandroboter', name: 'Bandroboter', bereich: 'Daten', aera: 'seit den 1980ern', typ: 'Greifer in einem Bandarchiv',
      fakt: 'Ein Greifer fährt an Tausenden Magnetbändern vorbei, zieht das gesuchte Band heraus und steckt es ins Laufwerk. Auf ein Band passen viele Terabyte. Im Regal braucht es keinen Strom und hält Jahrzehnte.',
      echt: 'Realistisch. Große Firmen und Forschungszentren lagern Sicherungskopien genau so. Ein echtes Archiv hat oft Zehntausende Fächer statt 48.',
      note: 'Holt das Band, lässt es lesen und stellt es ordentlich zurück.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/Tape_library',
      box: () => [RZX + 18, RZY + 112, 152, 224] },
    { id: 'serverschrank', name: 'Serverschränke', bereich: 'Daten', aera: 'heute', typ: 'Computer im Regal, gestapelt',
      fakt: 'In jedem Schrank stecken flache Computer übereinander. Kalte Luft kommt durch Löcher im Boden nach oben, vorne hinein und hinten warm wieder heraus. Die Lämpchen zeigen, welcher Rechner gerade arbeitet.',
      echt: 'Realistisch. Fällt eine Festplatte aus, leuchtet ihr Lämpchen orange und ein Mensch tauscht sie im laufenden Betrieb.',
      note: 'Kaum ist eine Platte getauscht, meldet sich die nächste.', color: '#3b3d40',
      quelle: 'https://en.wikipedia.org/wiki/Data_center',
      box: () => [RZX + 190, RZY + 196, 258, 140] },
    { id: 'gpurack', name: 'KI-Rechner', bereich: 'Daten', aera: 'seit den 2010ern', typ: 'Schrank voller Grafikchips',
      fakt: 'Auf diesen Chips werden KI-Modelle trainiert und befragt, auch die Agenten in der Leitwarte nebenan. Ein voller Schrank braucht so viel Strom wie Hunderte Haushalte und wird deshalb mit Wasser gekühlt.',
      echt: 'Realistisch. Die neuesten KI-Schränke sind so heiß, dass Luft allein sie nicht mehr kühlen kann.',
      note: 'Die Lüfter drehen ständig. Leise ist es hier nie.', color: '#1f2124',
      quelle: 'https://en.wikipedia.org/wiki/AI_accelerator',
      box: () => [RZX + 454, RZY + 196, 66, 156] },
    { id: 'rztechnikerin', name: 'Technikerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Ersatzfestplatte',
      fakt: 'Tauscht kaputte Festplatten, ohne dass ein Rechner ausgeschaltet werden muss.', note: 'Läuft am Tag viele Kilometer durch die Gänge.', color: '#2f5880',
      box: f => [RZX + techX(f) - 22, RZY + RZ_DECK - 124, 44, 120] },
  ],
});
registerRoom({
  key: 'rz2', name: 'Rechenzentrum: Leitwarte', level: 'Rechenzentrum',
  hitOrder: ['operator', 'kilobots', 'tauchkuehlung', 'agentenschwarm'],
  draw: drawRz2,
  robots: [
    { id: 'agentenschwarm', name: 'Agenten-Schwarm', bereich: 'KI', aera: 'seit 2023', typ: 'Viele KI-Agenten mit einem Chef-Agenten',
      fakt: 'Ein Chef-Agent zerlegt eine große Frage in Teilaufgaben und schickt sie an mehrere Helfer-Agenten. Die suchen und prüfen gleichzeitig und schicken ihre Ergebnisse zurück. Der Chef setzt daraus einen Bericht zusammen.',
      echt: 'Realistisch. Solche Programme gibt es wirklich, zum Beispiel für Recherchen. Ein Schwarm hat aber keinen eigenen Willen: Jeder Agent ist ein Programmlauf auf den Chips nebenan und kostet Strom.',
      note: 'Gelb geht raus, grün kommt zurück. Bei 8 von 8 ist der Bericht fertig.', color: '#f0b429',
      quelle: 'https://www.anthropic.com/engineering/multi-agent-research-system',
      box: () => [RZ2X + 24, RZ2Y + 60, 380, 194] },
    { id: 'kilobots', name: 'Kilobots', bereich: 'Forschung', aera: '2014', typ: 'Schwarm aus über tausend Mini-Robotern',
      fakt: 'An der Universität Harvard haben 1024 Roboter, jeder nur 3 Zentimeter groß, ganz ohne Chef eine Form gebildet, zum Beispiel den Buchstaben K. Jeder Roboter redet nur mit seinen Nachbarn und folgt ein paar einfachen Regeln.',
      echt: 'Echt. Die Kilobots zittern sich auf drei dünnen Beinen vorwärts, das dauert: Für eine Form brauchten sie viele Stunden. Hier steht der Tisch als Vergleich zum Agenten-Schwarm auf dem Bildschirm, der nur aus Software besteht.',
      note: 'Von oben gefilmt finden die Punkte zum K und laufen wieder auseinander.', color: '#ffb347',
      quelle: 'https://en.wikipedia.org/wiki/Kilobot',
      box: () => [RZ2X + 306, RZ2Y + 256, 120, 76] },
    { id: 'tauchkuehlung', name: 'Tauchkühlung', bereich: 'Daten', aera: 'seit den 2010ern', typ: 'Computer in einer Flüssigkeit',
      fakt: 'Die Rechner liegen in einer Flüssigkeit, die keinen Strom leitet. Sie siedet schon bei etwa 50 Grad. Die Blasen tragen die Wärme nach oben, an den Kupferrohren wird der Dampf wieder flüssig.',
      echt: 'Realistisch, wird in einigen Rechenzentren genutzt. Die Abwärme heizt anderswo tatsächlich Wohnungen oder Schwimmbäder.',
      note: 'Sieht aus wie ein Aquarium, nur ohne Fische.', color: '#bfe6ee',
      quelle: 'https://en.wikipedia.org/wiki/Immersion_cooling',
      box: () => [RZ2X + 430, RZ2Y + 200, 190, 136] },
    { id: 'operator', name: 'Leitwarte', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch am Pult',
      fakt: 'Beobachtet Temperatur, Strom und Datenverkehr. Rund um die Uhr sitzt hier jemand.', note: 'Trinkt viel Tee.', color: '#7b4b8e',
      box: () => [RZ2X + 236, RZ2Y + 222, 60, 112] },
  ],
});
