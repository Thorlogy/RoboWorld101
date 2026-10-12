/* Raum: Katastrophenschutz (UG 1) – Übungsgelände
   Hauptfigur: Entschärferroboter · Gag: verdächtiges Paket ist das, was die Möwe vom Dach geklaut hat (Bild 15–30) · Querverweis: Drohnen-Landeplatz */
const KTX = rx(roomOf('kat').c), KTY = ry(roomOf('kat').r);

const eodArm = f => (f < 6 ? 0 : f < 15 ? ease(seg(f, 6, 15)) : f < 34 ? 1 : f < 44 ? 1 - ease(seg(f, 34, 44)) : 0);
const lidOpen = f => (f < 16 ? 0 : f < 20 ? seg(f, 16, 20) : f < 30 ? 1 : f < 34 ? 1 - seg(f, 30, 34) : 0);
const searchX = f => 90 + 60 * (0.5 - 0.5 * Math.cos(TAU * f / 60));
const flame = f => 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(TAU * (f - 40) / 60));

function tracks(x0, x1, y) {
  box(x0, y - 14, x1 - x0, 14, '#2d2f33', 7);
  for (let x = x0 + 8; x < x1 - 4; x += 12) circle(x, y - 7, 3.5, '#5d6064', INK, 1);
}

function drawKat(f) {
  ctx.fillStyle = '#6a6359'; ctx.fillRect(0, 0, RW, RH);
  for (let i = 0; i < 40; i++) { ctx.fillStyle = i % 2 ? '#625b52' : '#736c62'; ctx.fillRect(rnd(i) * RW, rnd(i + 50) * 330, 40, 20); }
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('ÜBUNG', 280, 70, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(243,241,234,0.14)' });
  ctx.fillStyle = '#4e4840'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  // Trümmerhaufen mit Übungspuppe
  ctx.beginPath(); ctx.moveTo(0, 360); ctx.lineTo(20, 300); ctx.lineTo(60, 280); ctx.lineTo(120, 296); ctx.lineTo(180, 290); ctx.lineTo(220, 360); ctx.closePath(); paint('#8a8178');
  for (const [x, y, w, h, r] of [[30, 300, 40, 14, 0.3], [90, 292, 50, 12, -0.2], [150, 300, 36, 16, 0.4]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); box(0, 0, w, h, '#a39a8f', 1, 1.5); ctx.restore(); }
  box(56, 316, 36, 12, '#d9542b', 4, 1.5); circle(52, 320, 7, '#e2b48f');

  // Suchroboter mit Wärmebildkamera auf dem Schutt
  withAlpha('such', () => {
    const x = searchX(f), y = 300 - 6 * Math.sin(TAU * f / 30);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08);
    tracks(-26, 26, 6);
    box(-22, -14, 44, 12, '#5f6b3a', 3);
    line(0, -14, -12, -34, INK, 3); box(-24, -42, 16, 10, '#2a2723', 2, 1.2); circle(-24, -37, 2.5, '#ff6b6b', INK, 1);
    ctx.restore();
    box(150, 150, 70, 52, '#2a2723', 3); const hot = Math.abs(x - 60) < 50;
    ctx.fillStyle = '#2a1a4a'; ctx.fillRect(154, 154, 62, 44);
    if (hot) { const g = ctx.createRadialGradient(176, 176, 2, 176, 176, 16); g.addColorStop(0, '#ffe08a'); g.addColorStop(0.5, '#ff6b3b'); g.addColorStop(1, 'rgba(42,26,74,0)'); ctx.fillStyle = g; ctx.fillRect(154, 154, 62, 44); }
    text('WÄRMEBILD', 185, 214, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3f1ea' });
  });

  // Entschärferroboter mit verdächtigem Paket
  box(330, 336, 30, 22, '#c9a46a', 2, 1.5);
  const lid = lidOpen(f);
  ctx.save(); ctx.translate(330, 336); ctx.rotate(-1.2 * lid); box(0, -3, 30, 4, '#b48d56', 1, 1.2); ctx.restore();
  if (lid > 0.6) { text('WERK 101', 345, 330, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3f1ea' }); }
  withAlpha('eod', () => {
    tracks(220, 300, 360);
    box(224, 312, 72, 34, '#5f6b3a', 4);
    box(232, 296, 22, 16, '#2a2723', 2, 1.2); circle(246, 304, 3, '#7fd3ff', INK, 1);
    const m = eodArm(f), S = { x: 284, y: 312 }, tip = mix({ x: 300, y: 270 }, { x: 340, y: 326 }, m);
    const el = { x: lerp(300, 318, m), y: lerp(250, 270, m) };
    limb(S.x, S.y, el.x, el.y, 8, '#5f6b3a'); limb(el.x, el.y, tip.x, tip.y, 6, '#5f6b3a');
    circle(el.x, el.y, 4, '#3b3d40'); circle(S.x, S.y, 5, '#3b3d40');
    box(el.x - 4, el.y - 12, 12, 8, '#2a2723', 2, 1); circle(el.x + 6, el.y - 8, 2, '#7fd3ff', null);
    line(tip.x, tip.y, tip.x + 8, tip.y - 4, INK, 2.5); line(tip.x, tip.y, tip.x + 8, tip.y + 4, INK, 2.5);
    if (f >= 24 && f < 32) text('?!', 300, 236, 16, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#ffd23f' });
  });

  // Einsatzleiterin mit Steuerkoffer
  withAlpha('einsatz', () => {
    person({ x: 420, face: -1, shirt: '#2f4866', pants: '#2f4866', hat: '#d9542b', hand: { x: 402, y: 300 } });
    box(380, 296, 30, 18, '#3b3d40', 2, 1.2); ctx.fillStyle = '#7fd3ff'; ctx.fillRect(384, 299, 22, 9);
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(412, 262, 16, 3);
  });

  // Löschroboter mit Gebläse und Wassernebel gegen Übungsfeuer
  const fl = flame(f);
  box(600, 340, 34, 20, '#5d6064', 2);
  for (let i = 0; i < 5; i++) { const h = (30 + 20 * rnd(Math.floor(f / 2) + i)) * fl; ctx.beginPath(); ctx.moveTo(604 + i * 6, 340); ctx.lineTo(607 + i * 6, 340 - h); ctx.lineTo(610 + i * 6, 340); ctx.closePath(); ctx.fillStyle = i % 2 ? '#ff8a24' : '#ffd23f'; ctx.fill(); }
  withAlpha('loeschrob', () => {
    tracks(470, 548, 360);
    box(474, 316, 70, 30, '#d9342b', 4);
    ctx.save(); ctx.translate(532, 300); ctx.rotate(-0.15);
    circle(0, 0, 26, '#3b3d40'); circle(0, 0, 20, '#5d6064');
    for (let i = 0; i < 6; i++) { const a = TAU * f / 4 + i * TAU / 6; line(0, 0, Math.cos(a) * 18, Math.sin(a) * 18, '#b0b4b8', 3); }
    ctx.restore();
    ctx.fillStyle = 'rgba(220,235,245,0.55)';
    for (let i = 0; i < 14; i++) { const t = (rnd(i) + f / 12) % 1; ctx.beginPath(); ctx.arc(558 + t * 60, 296 + (rnd(i + 3) - 0.5) * 40 * t + t * 20, 3 + t * 5, 0, TAU); ctx.fill(); }
  });
}

registerRoom({
  key: 'kat', name: 'Katastrophenschutz', level: 'UG 1',
  hitOrder: ['such', 'einsatz', 'eod', 'loeschrob'],
  robots: [
    { id: 'eod', name: 'Entschärferroboter', bereich: 'Rettung', aera: 'seit den 1970ern', typ: 'Kettenfahrzeug mit Greifarm',
      fakt: 'Entschärferroboter fahren auf Ketten zu verdächtigen Gegenständen, damit kein Mensch in Gefahr gerät. Gesteuert werden sie aus sicherer Entfernung per Kabel oder Funk, Kameras am Arm zeigen jedes Detail.',
      echt: 'Realistisch, bis auf den Inhalt: Dass das Paket von der Möwe stammt, ist natürlich ein Spaß.',
      note: 'Öffnet das verdächtige Paket ganz vorsichtig. Es ist das Paket vom Dach.', color: '#5f6b3a',
      quelle: 'https://en.wikipedia.org/wiki/Bomb_disposal',
      box: () => [KTX + 218, KTY + 230, 150, 130] },
    { id: 'such', name: 'Suchroboter', bereich: 'Rettung', aera: 'seit 2001', typ: 'Kleines Kettenfahrzeug mit Wärmebildkamera',
      fakt: 'Nach dem Einsturz des World Trade Centers 2001 durchsuchten erstmals kleine Roboter die Trümmer. Heute tragen sie Wärmebildkameras, die einen Menschen auch im Staub erkennen.',
      echt: 'Realistisch. In der Übung liegt eine Puppe im Schutt, damit niemand in Gefahr ist.',
      note: 'Findet die Übungspuppe jede Runde. Der Monitor wird dann warm.', color: '#5f6b3a',
      quelle: 'https://en.wikipedia.org/wiki/Rescue_robot',
      box: f => [KTX + searchX(f) - 30, KTY + 254, 60, 56] },
    { id: 'loeschrob', name: 'Löschroboter', bereich: 'Rettung', aera: 'seit den 2000ern', typ: 'Kettenfahrzeug mit Großgebläse',
      fakt: 'Löschroboter mit großem Gebläse sprühen feinen Wassernebel weit in brennende Hallen oder Tunnel, in die Einsatzkräfte nicht hineinkönnen. Gesteuert werden sie per Funk aus sicherer Entfernung.',
      echt: 'Realistisch. Das Übungsfeuer wird mit Gas betrieben und lässt sich jederzeit abstellen.',
      note: 'Bläst das Feuer klein. Die Übungsleitung dreht es wieder auf.', color: '#d9342b',
      box: () => [KTX + 466, KTY + 270, 100, 90] },
    { id: 'einsatz', name: 'Einsatzleiterin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch mit Steuerkoffer',
      fakt: 'Steuert den Entschärferroboter aus sicherer Entfernung und schaut dabei nur auf den Bildschirm.',
      note: 'Hat den Absender auf dem Paket gelesen. Ruft gleich auf dem Dach an.', color: '#2f4866',
      box: () => [KTX + 378, KTY + 236, 56, 124] },
  ],
  draw: drawKat,
});
