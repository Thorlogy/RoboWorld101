/* Raum: Dunkle Fabrik (Halle 103, rechts neben der Schule)
   Roboter arbeiten im Dunkeln, Licht brauchen nur Menschen. Ein Klick auf den Lichtschalter neben der Tür schaltet das Licht an (state.licht).
   Gags: Die Anzeige „Tage im Dunkeln“ springt auf 0, sobald jemand Licht macht. Eine Motte fliegt immer zur hellsten Stelle. */
const DKX = rx(roomOf('dunkel').c), DKY = ry(roomOf('dunkel').r);
const DK_SW = { x: 104, y: 232 };
// Roboterarm auf Sockel: Schulter S, Greifer zeigt nach unten
function floorArm(S, tip, color) {
  const W = { x: tip.x, y: tip.y - 18 }, E = ik2(S, W, 70, 66);
  box(S.x - 16, S.y + 6, 32, 360 - S.y - 6, '#3b3d40', 2);
  limb(S.x, S.y, E.x, E.y, 15, color); limb(E.x, E.y, W.x, W.y, 11, color);
  circle(S.x, S.y, 9, '#3b3d40'); circle(E.x, E.y, 7, '#3b3d40'); circle(W.x, W.y, 5, '#3b3d40');
  box(W.x - 8, W.y + 4, 16, 8, '#8a8f94', 1, 1.2); line(W.x - 6, W.y + 12, W.x - 6, tip.y, INK, 2.5); line(W.x + 6, W.y + 12, W.x + 6, tip.y, INK, 2.5);
  return W;
}
const DK_REST = { x: 300, y: 252 }, DK_PICK = { x: 228, y: 296 }, DK_LOAD = { x: 392, y: 300 };
function dkTip(f) {
  if (f < 10) return mix(DK_REST, DK_PICK, ease(seg(f, 0, 10)));
  if (f < 14) return DK_PICK;
  if (f < 20) return mix(DK_PICK, { x: 330, y: 244 }, ease(seg(f, 14, 20)));
  if (f < 26) return mix({ x: 330, y: 244 }, DK_LOAD, ease(seg(f, 20, 26)));
  if (f < 30) return DK_LOAD;
  return mix(DK_LOAD, DK_REST, ease(seg(f, 30, 38)));
}
const dkCarry = f => f >= 12 && f < 28;
const dkDoor = f => (f < 18 ? 0 : f < 22 ? seg(f, 18, 22) : f < 32 ? 1 : 1 - seg(f, 32, 36));
const dkCut = f => f >= 38 && f < 58;
// zweiter Arm schraubt an einem halb fertigen Roboterarm
function dk2Tip(f) {
  const tray = { x: 528, y: 290 }, work = { x: 594, y: 262 }, t = f % 30;
  if (t < 8) return mix(work, tray, ease(seg(t, 0, 8)));
  if (t < 12) return tray;
  if (t < 20) return mix(tray, work, ease(seg(t, 12, 20)));
  return { x: work.x, y: work.y + (t % 4 < 2 ? 0 : 2) };
}
const dkAmrX = f => 150 + 330 * (0.5 - 0.5 * Math.cos(TAU * f / 60));
function dkMoth(f) {
  if (state.licht) return { x: 420 + 22 * Math.cos(f * 0.7), y: 40 + 10 * Math.sin(f * 1.3) };
  return { x: DK_SW.x + 4 + 14 * Math.cos(f * 0.8), y: DK_SW.y - 14 + 9 * Math.sin(f * 1.4) };
}
function drawDunkel(f) {
  const on = state.licht;
  ctx.fillStyle = '#6a6e72'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5c5f63'; for (let x = 0; x < RW; x += 80) ctx.fillRect(x, 0, 3, 360);
  ctx.fillStyle = '#7d7972'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 1.5);
  ctx.fillStyle = 'rgba(240,180,41,0.8)'; ctx.fillRect(190, 372, 320, 4);
  // Deckenlampen
  for (const x of [100, 260, 420, 580]) { line(x, 0, x, 12, INK, 1.5); box(x - 34, 12, 68, 8, on ? '#fff6d8' : '#4a4d50', 2, 1.5); }
  if (on) for (const x of [100, 260, 420, 580]) { ctx.fillStyle = 'rgba(255,246,200,0.12)'; ctx.beginPath(); ctx.moveTo(x - 34, 20); ctx.lineTo(x + 34, 20); ctx.lineTo(x + 80, 360); ctx.lineTo(x - 80, 360); ctx.closePath(); ctx.fill(); }
  text('HALLE 103', 600, 60, 34, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'right', color: 'rgba(42,39,35,0.18)' });
  // Tür und Lichtschalter
  box(22, 240, 58, 120, '#4f6b84', 2, 2); circle(70, 302, 3, '#d6d9dc', INK, 1);
  withAlpha('lichtschalter', () => {
    box(DK_SW.x - 8, DK_SW.y - 12, 16, 24, '#f3f1ea', 2, 1.5); box(DK_SW.x - 4, DK_SW.y - (on ? 8 : 0), 8, 8, '#d6d9dc', 1, 1);
    circle(DK_SW.x, DK_SW.y + 8, 1.6, '#5fbf6a', null);
  });
  // Anzeige
  box(150, 62, 150, 58, '#23384d', 3, 2);
  // Regal mit Rohteilen, Förderband zum Arm
  box(118, 230, 64, 6, '#8a8f94', 0, 1.2); box(118, 280, 64, 6, '#8a8f94', 0, 1.2); line(122, 210, 122, 360, INK, 3); line(178, 210, 178, 360, INK, 3);
  for (let i = 0; i < 3; i++) { box(126 + i * 18, 216, 14, 14, '#b9bcc0', 1, 1); box(126 + i * 18, 266, 14, 14, '#b9bcc0', 1, 1); }
  box(190, 300, 60, 10, '#3b3d40', 2, 1.5); line(196, 310, 196, 360, INK, 2); line(244, 310, 244, 360, INK, 2);
  if (!dkCarry(f) && !(f >= 10 && f < 12)) box(DK_PICK.x - 7, 288, 14, 12, '#b9bcc0', 1, 1);
  // Fräsmaschine mit Schiebetür und Signalsäule
  box(340, 214, 140, 146, '#d6d9dc', 4, 2);
  box(350, 228, 84, 96, '#3b3d40', 2, 1.5);
  if (dkCut(f)) { box(DK_LOAD.x - 7, 296, 14, 12, '#b9bcc0', 1, 1); line(392, 236, 392, 290 + (f % 4), '#8a8f94', 4); }
  const d = dkDoor(f);
  ctx.fillStyle = 'rgba(159,196,214,0.55)'; ctx.fillRect(352, 230 - d * 88, 80, 92); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(352, 230 - d * 88, 80, 92);
  box(444, 236, 26, 40, '#23384d', 2, 1.2);
  line(470, 214, 470, 196, INK, 2); box(464, 166, 12, 30, '#8a8f94', 2, 1.2);
  circle(470, 172, 4, '#7fe08a', null); circle(470, 182, 4, '#6b5a1c', null); circle(470, 192, 4, '#5a2020', null);
  // Arm 1 lädt die Maschine
  withAlpha('zelle', () => {
    const tip = dkTip(f); floorArm({ x: 300, y: 326 }, tip, '#8fa3b5');
    if (dkCarry(f)) box(tip.x - 7, tip.y - 6, 14, 12, '#b9bcc0', 1, 1);
  });
  // Schutzzaun vor der Zelle
  ctx.strokeStyle = 'rgba(240,180,41,0.9)'; ctx.lineWidth = 3; ctx.strokeRect(190, 318, 290, 42);
  ctx.strokeStyle = 'rgba(42,39,35,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 196; x < 480; x += 10) { ctx.moveTo(x, 320); ctx.lineTo(x, 358); } ctx.stroke();
  // Arm 2 baut einen Roboterarm zusammen
  box(500, 300, 132, 10, '#3b3d40', 2, 1.5); line(508, 310, 508, 360, INK, 2); line(624, 310, 624, 360, INK, 2);
  box(516, 292, 26, 8, '#8a8f94', 1, 1); for (let i = 0; i < 3; i++) circle(522 + i * 7, 290, 2, '#d6d9dc', INK, 0.8);
  box(582, 284, 26, 16, '#3b3d40', 3, 1.2); limb(595, 284, 604, 252, 9, '#8fa3b5'); circle(595, 284, 4, '#3b3d40');
  withAlpha('baut', () => floorArm({ x: 560, y: 220 }, dk2Tip(f), '#8fa3b5'));
  // Transportroboter mit Laserscanner
  withAlpha('dunkelamr', () => {
    const x = dkAmrX(f);
    box(x - 32, 342, 64, 16, '#3b3d40', 4, 1.5); box(x - 24, 326, 48, 16, '#c9a46a', 1, 1.2);
    box(x + 26, 344, 8, 6, '#2a2723', 1, 1); circle(x - 20, 359, 3, '#2d2f33', null); circle(x + 20, 359, 3, '#2d2f33', null);
  });
  // Dunkelheit: nur Anzeigen und Kontrolllampen leuchten
  if (!on) {
    ctx.fillStyle = 'rgba(4,6,12,0.9)'; ctx.fillRect(0, 0, RW, RH);
    glow(DK_SW.x, DK_SW.y + 8, 12, 'rgba(110,255,130,0.9)');
    glow(470, 172, 18, 'rgba(110,255,130,0.9)');
    glow(457, 256, 20, 'rgba(120,180,255,0.5)');
    if (dkCut(f)) glow(392, 292, 30 + (f % 3) * 6, 'rgba(170,220,255,0.8)');
    const t1 = dkTip(f), t2 = dk2Tip(f), x = dkAmrX(f);
    glow(t1.x, t1.y - 18, 10, 'rgba(255,170,60,0.9)'); glow(t2.x, t2.y - 18, 10, 'rgba(255,170,60,0.9)');
    glow(x + 30, 347, 14, 'rgba(255,80,60,0.8)'); glow(x - 26, 348, 10, 'rgba(90,170,255,0.9)');
    text('Licht ist aus. Der Schalter ist neben der Tür.', 320, 150, 15, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: 'rgba(240,236,226,0.45)' });
  }
  // Die Anzeige leuchtet selbst
  box(150, 62, 150, 58, '#18263a', 3, 2);
  text('TAGE IM DUNKELN', 225, 80, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#9fc4d6' });
  text(on ? '0' : '27', 225, 112, 28, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: on ? '#ff8a6a' : '#7fe08a' });
  // Motte
  withAlpha('motte', () => {
    const m = dkMoth(f), w = f % 2 ? 5 : 2;
    ctx.fillStyle = '#b8ab94'; ctx.beginPath(); ctx.ellipse(m.x - 3, m.y - w / 2, 4, w, -0.4, 0, TAU); ctx.ellipse(m.x + 3, m.y - w / 2, 4, w, 0.4, 0, TAU); ctx.fill();
    line(m.x, m.y - 2, m.x, m.y + 4, INK, 1.5);
  });
}

registerRoom({
  key: 'dunkel', name: 'Dunkle Fabrik', level: 'Halle 103',
  hitOrder: ['lichtschalter', 'motte', 'dunkelamr', 'zelle', 'baut'],
  draw: drawDunkel,
  robots: [
    { id: 'lichtschalter', name: 'Lichtschalter', bereich: 'Industrie', aera: 'Klick mich', typ: 'Schalter neben der Tür',
      fakt: 'In einer dunklen Fabrik ist Licht nur für Menschen da. Die Roboter finden ihren Weg mit Laserscannern und Sensoren und brauchen keine Lampen. Das spart Strom.',
      echt: 'Den Begriff gibt es wirklich: Auf Englisch heißt so eine Fabrik „lights-out factory“.',
      note: 'Ein Klick auf den Schalter macht das Licht an oder aus. Die Roboter arbeiten in beiden Fällen gleich weiter.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Lights_out_(manufacturing)',
      box: () => [DKX + DK_SW.x - 12, DKY + DK_SW.y - 16, 24, 32] },
    { id: 'zelle', name: 'Roboter an der Fräsmaschine', bereich: 'Industrie', aera: 'seit den 2000ern', typ: 'Knickarm, der eine Maschine belädt',
      fakt: 'Ein Roboterarm legt Rohteile in die Fräsmaschine und nimmt sie fertig wieder heraus. Ein japanischer Roboterhersteller lässt so Teile für neue Roboter fertigen, bis zu 30 Tage am Stück ohne Menschen in der Halle.',
      echt: 'Realistisch, auch der Zaun. Ganz ohne Menschen läuft trotzdem keine Fabrik: Wartung, Störungen und neue Aufträge brauchen Fachleute.',
      note: 'Holt ein Rohteil vom Band, legt es in die Maschine und wartet, bis sie fertig gefräst hat.', color: '#8fa3b5',
      quelle: 'https://en.wikipedia.org/wiki/Lights_out_(manufacturing)',
      box: f => { const t = dkTip(f); return [DKX + Math.min(t.x, 300) - 20, DKY + Math.min(t.y - 30, 250), Math.abs(t.x - 300) + 40, 360 - Math.min(t.y - 30, 250)]; } },
    { id: 'baut', name: 'Roboter baut Roboter', bereich: 'Industrie', aera: 'seit den 2000ern', typ: 'Knickarm mit Schrauber',
      fakt: 'In manchen Werken setzen Roboter Teile für neue Roboter zusammen, zum Beispiel Motoren und Gelenke.',
      echt: 'Teilweise echt. Die Endmontage und die Prüfung der fertigen Roboter machen meist noch Menschen.',
      note: 'Holt Schrauben aus der Schale und schraubt sie in das Gelenk eines neuen Arms.', color: '#8fa3b5',
      quelle: 'https://en.wikipedia.org/wiki/Lights_out_(manufacturing)',
      box: () => [DKX + 510, DKY + 200, 110, 160] },
    { id: 'dunkelamr', name: 'Transportroboter', bereich: 'Logistik', aera: 'seit den 2010ern', typ: 'Autonomer mobiler Roboter',
      fakt: 'Der Transportroboter fährt fertige Teile ins Regal. Sein Laserscanner tastet die Umgebung mit unsichtbarem Licht ab, deshalb findet er sich auch im Stockdunkeln zurecht.',
      echt: 'Realistisch. Laserscanner funktionieren ohne Licht, Kameras dagegen nur mit eigener Beleuchtung.',
      note: 'Pendelt vor der Roboterzelle hin und her.', color: '#3b3d40',
      quelle: 'https://en.wikipedia.org/wiki/Lidar',
      box: f => [DKX + dkAmrX(f) - 34, DKY + 324, 68, 36] },
    { id: 'motte', name: 'Motte', bereich: 'Tier', aera: 'Gast', typ: 'Nachtfalter',
      fakt: 'Nachtfalter fliegen zu Lampen und anderen hellen Lichtern. Warum genau, erforschen Fachleute bis heute.',
      echt: 'Echt. Hier fliegt sie im Dunkeln zur kleinen Lampe im Schalter und bei Licht zur Deckenlampe.',
      note: 'Fliegt immer zur hellsten Stelle in der Halle.', color: '#b8ab94',
      box: f => { const m = dkMoth(f); return [DKX + m.x - 10, DKY + m.y - 10, 20, 20]; } },
  ],
});
