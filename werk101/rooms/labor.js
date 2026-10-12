/* Raum: Labor (Ebene 5)
   Hauptfigur: Pipettierroboter · Gag: Haube auf, Roboter stoppt sofort (Bild 10–25) · Querverweis: Mobiler Laborroboter wie in Liverpool */
const LBX = rx(roomOf('labor').c), LBY = ry(roomOf('labor').r);

const win = (f, a, b) => (f < a || f >= b ? 0 : f < a + 3 ? ease(seg(f, a, a + 3)) : f < b - 3 ? 1 : 1 - ease(seg(f, b - 3, b)));
const hoodOpen = f => Math.max(win(f, 10, 25), win(f, 47, 58));
const paused = f => (f >= 10 && f < 25) || (f >= 47 && f < 58);
function pipetteX(f) {
  const t = f < 10 ? f : f < 25 ? 10 : f < 47 ? f - 15 : f < 58 ? 32 : f - 26;
  return 92 + 120 * (0.5 - 0.5 * Math.cos(TAU * t / 34));
}
const pipetteY = f => (paused(f) ? 0 : (f % 5 < 2 ? 12 : 0));
const mobileX = f => 420 + 120 * (0.5 - 0.5 * Math.cos(TAU * (f - 20) / 60));

function drawLabor(f) {
  ctx.fillStyle = '#eaeef0'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#d3dde2'; ctx.fillRect(0, 200, RW, 160);
  line(0, 200, RW, 200, INK, 2);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('LABOR', 300, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  ctx.fillStyle = '#b9c2c6'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  // Labortische
  box(20, 300, 270, 10, '#5d6064'); box(30, 310, 250, 50, '#d6d9dc', 0, 1.5);
  box(440, 214, 186, 10, '#5d6064'); box(452, 224, 6, 136, '#8a8f94', 0, 1.2); box(608, 224, 6, 136, '#8a8f94', 0, 1.2);

  // Pipettierroboter in Glashaube
  withAlpha('pipette', () => {
    const h = hoodOpen(f);
    box(40, 170, 230, 130, 'rgba(255,255,255,0)', 4, 2);
    box(40, 170, 230, 14, '#5d6064', 2);
    // Arbeitsfläche mit Mikrotiterplatten
    for (let i = 0; i < 4; i++) { box(56 + i * 52, 278, 44, 12, '#f3f1ea', 1, 1.2); for (let k = 0; k < 6; k++) circle(61 + i * 52 + k * 7, 284, 1.8, i === 1 ? '#d9542b' : '#7fd3ff', null); }
    // Portal und Pipettierkopf
    box(46, 190, 218, 8, '#8a8f94', 0, 1.5);
    const px = pipetteX(f), py = pipetteY(f);
    box(px - 12, 194, 24, 30 + py, '#3b3d40', 3, 1.5);
    for (const dx of [-6, 0, 6]) line(px + dx, 224 + py, px + dx, 244 + py, '#e6e3da', 2.5);
    // Glasfront klappt nach oben
    ctx.fillStyle = 'rgba(190,220,235,0.35)'; ctx.fillRect(42, 184 - 90 * h, 226, 114);
    line(42, 298 - 90 * h, 268, 298 - 90 * h, INK, 2);
    const stop = paused(f);
    circle(254, 177, 4, stop ? (f % 4 < 2 ? '#f0b429' : '#8a6a20') : '#7fe08a', INK, 1);
    if (stop) text('PAUSE', 214, 180, 9, { family: '"IBM Plex Mono", monospace', weight: 500, color: '#f3f1ea' });
  });
  // Kaffeebecher im Arbeitsbereich
  const cupIn = f < 16 || f >= 53;
  if (cupIn) box(238 - 7, 266, 14, 20, '#f3f1ea', 2, 1.5); if (cupIn) line(245, 272, 249, 278, INK, 1.5);

  // Forscherin
  withAlpha('forscher', () => {
    const reach = f >= 12 && f < 18;
    const hand = reach || (f >= 48 && f < 54) ? { x: 244, y: 272 } : f >= 18 && f < 48 ? { x: 304, y: f % 20 < 8 ? 222 : 264 } : { x: 300, y: 300 };
    person({ x: 318, face: -1, shirt: '#f3f1ea', pants: '#3d5a80', hair: '#3a2c22', hand });
    if (f >= 16 && f < 53) { const hy = f >= 18 && f < 48 ? (f % 20 < 8 ? 214 : 256) : 264; box(296, hy, 14, 18, '#f3f1ea', 2, 1.5); }
  });

  // Mikroroboter auf dem Monitor
  withAlpha('mikro', () => {
    box(470, 140, 120, 74, '#2a2723', 3);
    box(476, 146, 108, 60, '#10243a', 1, 1);
    ctx.strokeStyle = 'rgba(127,211,255,0.4)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(480, 186); ctx.bezierCurveTo(510, 150, 540, 200, 580, 160); ctx.stroke();
    const t = f / 60, mx = 480 + 100 * t, my = 186 + (Math.sin(t * 6) * -12);
    ctx.save(); ctx.translate(mx, my); ctx.rotate(TAU * f / 6);
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i * 0.9; ctx.lineTo(Math.cos(a) * (2 + i * 0.4), Math.sin(a) * (2 + i * 0.4)); } ctx.stroke();
    ctx.restore();
    text('×200', 580, 202, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'right', color: '#7fd3ff' });
    box(504, 214, 52, 6, '#3b3d40', 0, 1.2);
  });

  // Mobiler Laborroboter: Arm auf fahrbarer Plattform bringt Probenständer
  withAlpha('mobil', () => {
    const x = mobileX(f);
    box(x - 28, 322, 56, 30, '#e6e3da', 4);
    circle(x - 18, 354, 5, '#2d2f33'); circle(x + 18, 354, 5, '#2d2f33');
    box(x - 26, 314, 14, 8, '#3b3d40', 2, 1);
    const S = { x: x + 8, y: 316 }, tip = { x: x + 34, y: 284 + 6 * Math.sin(TAU * f / 20) };
    const el = ik2(S, tip, 28, 28);
    box(x + 2, 308, 12, 10, '#d9542b', 2, 1.2);
    limb(S.x, S.y, el.x, el.y, 6, '#e6e3da'); limb(el.x, el.y, tip.x, tip.y, 5, '#e6e3da');
    circle(el.x, el.y, 3, '#3b3d40');
    box(tip.x - 8, tip.y, 16, 10, '#3e6f9e', 1, 1.2);
    for (let i = 0; i < 3; i++) box(tip.x - 6 + i * 5, tip.y - 8, 3, 9, '#7fd3ff', 0, 1);
  });
}

registerRoom({
  key: 'labor', name: 'Labor', level: 'Ebene 5',
  hitOrder: ['forscher', 'mikro', 'mobil', 'pipette'],
  robots: [
    { id: 'pipette', name: 'Pipettierroboter', bereich: 'Forschung', aera: 'seit den 1980ern', typ: 'Flüssigkeitsroboter mit Portal',
      fakt: 'Pipettierroboter verteilen winzige Flüssigkeitsmengen auf Platten mit 96 oder mehr Vertiefungen. In einem Labor ersetzen sie Tausende Handgriffe am Tag und arbeiten dabei genauer als jede Hand.',
      echt: 'Genau so: Wird die Haube geöffnet, hält das Gerät sofort an. Kaffee hat im Arbeitsbereich trotzdem nichts zu suchen.',
      note: 'Bleibt stehen, sobald jemand die Haube öffnet. Wartet geduldig, bis der Kaffee gerettet ist.', color: '#3b3d40',
      quelle: 'https://en.wikipedia.org/wiki/Liquid_handling_robot',
      box: () => [LBX + 40, LBY + 168, 232, 132] },
    { id: 'mobil', name: 'Mobiler Laborroboter', bereich: 'Forschung', aera: 'seit 2020', typ: 'Roboterarm auf fahrbarer Plattform',
      fakt: 'An der Universität Liverpool fuhr 2020 ein mobiler Roboter acht Tage lang selbstständig durchs Labor und führte dabei 688 Experimente aus. Er brachte Proben von Gerät zu Gerät wie ein Mensch.',
      echt: 'Realistisch. Solche Roboter orientieren sich mit Laserscannern und bewegen sich langsam, wenn Menschen in der Nähe sind.',
      note: 'Trägt Proben von Tisch zu Tisch. Den ganzen Tag, ohne Pause.', color: '#e6e3da',
      quelle: 'https://www.nature.com/articles/s41586-020-2442-2',
      box: f => [LBX + mobileX(f) - 30, LBY + 270, 72, 90] },
    { id: 'mikro', name: 'Mikroroboter', bereich: 'Forschung', aera: 'Forschung', typ: 'Winzige Spirale, magnetisch gesteuert',
      fakt: 'Mikroroboter sind oft kleiner als ein Millimeter. Viele bestehen aus einer winzigen Metallspirale und werden von außen mit Magnetfeldern gedreht und gelenkt, ohne eigenen Motor.',
      echt: 'Mikroroboter sind noch Forschung. Man sieht sie nur unter dem Mikroskop, deshalb hier auf dem Monitor.',
      note: 'Schraubt sich einmal pro Runde durch den Kanal.', color: '#ffd23f',
      quelle: 'https://en.wikipedia.org/wiki/Microbotics',
      box: () => [LBX + 468, LBY + 138, 124, 80] },
    { id: 'forscher', name: 'Forscherin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch im Laborkittel',
      fakt: 'Holt ihren Kaffee aus dem Arbeitsbereich, trinkt einen Schluck und stellt ihn wieder hinein.',
      note: 'Jede Runde. Sie lernt es nicht.', color: '#f3f1ea',
      box: () => [LBX + 290, LBY + 236, 50, 124] },
  ],
  draw: drawLabor,
});
