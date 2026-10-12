/* Räume: U-Bahnsteig Ost und U-Bahn-Tunnel (UG 1, unter der Schule 102)
   Der Zug hat vier Wagen und kommt von rechts durch den Tunnel (globale Uhr 400–480), hält im Bahnhof (0–200) und fährt nach links weiter.
   Bahnsteig Ost: Auskunftsroboter, zwei Fahrgäste nehmen den Aufzug zur Schule.
   Tunnel: Inspektionsroboter an einer Schiene unter der Decke, Signal, Notausgang (dreimal anklopfen öffnet den geheimen Raum). */
const UBSX = rx(roomOf('bahnsteig').c), UBSY = ry(roomOf('bahnsteig').r);
const TUX = rx(roomOf('tunnel').c), TUY = ry(roomOf('tunnel').r);
const ubLocal = room => ubTrainX(state.g) - (rx(roomOf(room).c) - UBX);
function ubTrack() {
  ctx.fillStyle = '#5c5953'; ctx.fillRect(0, 342, RW, 58);
  for (let x = 6; x < RW; x += 26) box(x, 382, 16, 6, '#7a6450', 0, 1);
  line(0, 378, RW, 378, '#8a8f94', 4);
}
// Fahrgäste aus Wagen 3 gehen zum Aufzug, der Aufzug fährt hoch zur Schule
function bsWalker(g, i) {
  g %= 480;
  const door = ubDoorX(2, 1) - (UBSX - UBX), wait = 548 + i * 22;
  if (g < 70 + i * 10 || g >= 168) return null;
  if (g < 120) return { x: lerp(door + i * 8, wait, seg(g, 70 + i * 10, 120)), walk: true };
  if (g < 150) return { x: wait, walk: false };
  return { x: wait, walk: false, inLift: true };
}
const bsLiftY = g => { g %= 480; return g < 150 ? 0 : g < 180 ? -260 * ease(seg(g, 150, 180)) : g < 330 ? -260 : g < 360 ? -260 * (1 - ease(seg(g, 330, 360))) : 0; };
const bsScreen = g => (g % 480 < 200 ? 'Schule 102: Aufzug →' : `Nächster Zug ${Math.ceil((480 - g % 480) / 12)} s`);
function drawBahnsteig(f) {
  const g = state.g;
  ctx.fillStyle = '#e6e1d6'; ctx.fillRect(0, 0, RW, RH);
  ctx.strokeStyle = 'rgba(42,39,35,0.08)'; ctx.lineWidth = 1;
  for (let y = 60; y < UB_PLAT; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(RW, y); ctx.stroke(); }
  ctx.fillStyle = '#9a958c'; ctx.fillRect(0, 0, RW, 40); line(0, 40, RW, 40, INK, 2);
  for (const x of [120, 360]) box(x - 26, 40, 52, 6, '#f3efe4', 1, 1);
  ubTrack();
  box(60, 74, 170, 34, '#f3f1ea', 3, 1.5); box(66, 79, 24, 24, '#3e6f9e', 3, 1); text('U', 78, 98, 20, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#fff' });
  text('Werk 101 Ost', 100, 99, 20, { family: '"Saira Condensed", sans-serif', weight: 700 });
  text('BAHNSTEIG', 360, 150, 30, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  // Aufzug zur Schule: Glasschacht bis zur Decke, Kabine fährt hoch
  const ly = bsLiftY(g);
  ctx.fillStyle = 'rgba(159,196,214,0.35)'; ctx.fillRect(536, 0, 76, UB_PLAT); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(536, 0, 76, UB_PLAT);
  box(540, UB_PLAT - 120 + ly, 68, 120, '#d6d9dc', 2, 1.5); ctx.fillStyle = 'rgba(159,196,214,0.7)'; ctx.fillRect(546, UB_PLAT - 110 + ly, 56, 70);
  text('Schule 102 ↑', 574, 60, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  // Zug
  withAlpha('ubahn', () => { const x = ubLocal('bahnsteig'); if (x < RW + 10 && x + UB_LEN > -10) ubTrain(x, g); });
  // Bahnsteig vorn
  ctx.fillStyle = '#bdb6a8'; ctx.fillRect(0, UB_PLAT, RW, 12); line(0, UB_PLAT, RW, UB_PLAT, INK, 2);
  ctx.fillStyle = '#f0b429'; ctx.fillRect(0, UB_PLAT + 1, RW, 3);
  // Auskunftsroboter hinter der gelben Linie
  withAlpha('auskunft', () => {
    const x = 380, bob = 0;
    box(x - 18, UB_PLAT - 18, 36, 14, '#3b3d40', 6, 1.5);
    box(x - 14, UB_PLAT - 96 + bob, 28, 80, '#f3f1ea', 10, 1.8);
    box(x - 32, UB_PLAT - 132 + bob, 64, 40, '#23384d', 4, 1.8);
    const msg = bsScreen(g); text(msg.length > 14 ? msg.slice(0, 11) : msg, x, UB_PLAT - 116 + bob, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' });
    text(msg.length > 14 ? msg.slice(11) : '', x, UB_PLAT - 104 + bob, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' });
    circle(x, UB_PLAT - 60 + bob, 3, '#3e6f9e', null);
  });
  // Fahrgäste zum Aufzug
  withAlpha('fahrgast3', () => {
    [['#d9542b', '#3a2c22'], ['#3e6f9e', '#c9a46a']].forEach(([shirt, hair], i) => {
      const p = bsWalker(g, i); if (!p) return;
      const yOff = p.inLift ? ly : 0;
      ctx.save(); ctx.translate(0, yOff);
      person({ x: p.x, foot: UB_PLAT, face: 1, shirt, pants: '#3b3d40', hair, hand: p.walk ? undefined : { x: p.x + 8, y: UB_PLAT - 60 } });
      ctx.restore();
    });
  });
}

// Tunnel
const tuBot = g => { g %= 480; return 60 + 520 * (0.5 - 0.5 * Math.cos(TAU * g / 480)); };
const TU_DOOR = { x: 120, y: 232 };
function drawTunnel(f) {
  const g = state.g, gg = g % 480;
  ctx.fillStyle = '#4b4a47'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5a5955'; ctx.fillRect(0, 20, RW, 322);
  for (let x = 0; x < RW; x += 94) line(x, 20, x, 342, 'rgba(0,0,0,0.25)', 1.5);
  line(0, 20, RW, 20, INK, 2);
  // Kabelpritschen und Lampen
  for (const y of [120, 132, 144]) line(0, y, RW, y, '#2a2723', 2);
  for (const x of [80, 320, 560]) { box(x - 10, 24, 20, 6, '#fff3c4', 1, 1); }
  // Fluchtweg und Notausgang
  ctx.fillStyle = '#6e6c66'; ctx.fillRect(0, 330, RW, 12); line(0, 330, RW, 330, INK, 1.5);
  withAlpha('notausgang', () => {
    box(TU_DOOR.x - 30, TU_DOOR.y, 60, 98, '#5f7d3a', 2, 2); circle(TU_DOOR.x + 20, TU_DOOR.y + 52, 3, '#d6d9dc', INK, 1);
    box(TU_DOOR.x - 34, TU_DOOR.y - 30, 68, 22, '#2f8f4e', 2, 1.5);
    text('NOTAUSGANG', TU_DOOR.x, TU_DOOR.y - 15, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#ffffff' });
    const k = window.secretKnocks || 0;
    for (let i = 0; i < k && !state.secret; i++) circle(TU_DOOR.x - 12 + i * 12, TU_DOOR.y + 20, 3, '#f0b429', null);
  });
  // Signal: grün, solange der Zug durchfährt
  const go = gg >= 396 || gg < 20;
  line(600, 342, 600, 250, INK, 3); box(590, 214, 20, 40, '#2a2723', 3, 1.5);
  circle(600, 224, 5, go ? '#3a1c1c' : '#ff5a50', null); circle(600, 244, 5, go ? '#6eff82' : '#1c3a22', null);
  text('TUNNEL', 360, 220, 30, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(240,236,226,0.13)' });
  ubTrack();
  // Inspektionsroboter an der Deckenschiene
  line(0, 52, RW, 52, '#8a8f94', 4);
  withAlpha('tunnelbot', () => {
    const x = tuBot(g);
    box(x - 18, 46, 36, 12, '#3b3d40', 3, 1.2); line(x, 58, x, 72, INK, 3);
    box(x - 22, 72, 44, 26, '#f0b429', 4, 1.8); box(x - 6, 98, 12, 10, '#2a2723', 2, 1.2);
    ctx.fillStyle = 'rgba(255,80,60,0.25)'; ctx.beginPath(); ctx.moveTo(x - 2, 106); ctx.lineTo(x + 2, 106); ctx.lineTo(x + 40, 330); ctx.lineTo(x - 40, 330); ctx.closePath(); ctx.fill();
    circle(x + 14, 80, 2, gg % 8 < 4 ? '#7fe08a' : '#2d5b33', null);
  });
  // Zug
  withAlpha('ubahn', () => { const x = ubLocal('tunnel'); if (x < RW + 10 && x + UB_LEN > -10) ubTrain(x, g); });
  // Blitz: der Roboter fotografiert die Nase an der Frontscheibe
  const tx = ubLocal('tunnel');
  if (Math.abs(tx + 20 - tuBot(g)) < 30 && f % 4 < 1) { ctx.save(); ctx.globalAlpha = 0.8; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(tuBot(g), 106, 22, 0, TAU); ctx.fill(); ctx.restore(); }
}

registerRoom({
  key: 'bahnsteig', name: 'U-Bahnsteig Ost', level: 'UG 1',
  hitOrder: ['fahrgast3', 'auskunft'],
  draw: drawBahnsteig,
  robots: [
    { id: 'auskunft', name: 'Auskunftsroboter', bereich: 'Service', aera: 'seit den 2010ern', typ: 'Fahrender Roboter mit Bildschirm',
      fakt: 'In Bahnhöfen und Flughäfen zeigen Auskunftsroboter auf einem Bildschirm den Weg, die nächste Abfahrt oder den Aufzug. Am Flughafen Incheon in Südkorea fahren solche Roboter seit 2018 durch die Hallen und sprechen mehrere Sprachen.',
      echt: 'Echt, in Deutschland aber bisher nur bei Tests. Er bleibt hier hinter der gelben Linie, wie alle anderen auch.',
      note: 'Zeigt den Weg zum Aufzug, solange der Zug steht, danach die Zeit bis zum nächsten Zug.', color: '#f3f1ea',
      quelle: 'https://en.wikipedia.org/wiki/Incheon_International_Airport',
      box: () => [UBSX + 346, UBSY + UB_PLAT - 134, 68, 134] },
    { id: 'fahrgast3', name: 'Fahrgäste', bereich: 'Mensch', aera: 'Maßstab', typ: 'Zwei Menschen',
      fakt: 'Steigen aus dem dritten Wagen und fahren mit dem Aufzug hoch zur Schule.', note: 'Nehmen den Aufzug, weil die Treppe am anderen Ende ist.', color: '#d9542b',
      box: () => { const p = bsWalker(state.g, 0); return p ? [UBSX + p.x - 16, UBSY + UB_PLAT - 128 + (p.inLift ? bsLiftY(state.g) : 0), 70, 130] : [-99999, -99999, 1, 1]; } },
  ],
});
registerRoom({
  key: 'tunnel', name: 'U-Bahn-Tunnel', level: 'UG 1',
  hitOrder: ['notausgang', 'tunnelbot'],
  draw: drawTunnel,
  glow(f) {},
  robots: [
    { id: 'tunnelbot', name: 'Inspektionsroboter im Tunnel', bereich: 'Inspektion', aera: 'seit den 2010ern', typ: 'Roboter an einer Deckenschiene',
      fakt: 'In langen Kabel- und Versorgungstunneln fahren Roboter an einer Schiene unter der Decke entlang. Kamera, Wärmebild und Laser suchen nach Rissen, Wasser und heißen Kabeln, rund um die Uhr.',
      echt: 'Solche Schienenroboter gibt es vor allem in Kabeltunneln. U-Bahn-Tunnel werden meist nachts geprüft, wenn keine Züge fahren. Der Blitz für das Kind an der Scheibe ist ein Spaß.',
      note: 'Fährt langsam den Tunnel ab. Wenn der Zug vorbeikommt, fotografiert er aus Versehen die Nase an der Frontscheibe.', color: '#f0b429',
      quelle: 'https://en.wikipedia.org/wiki/Utility_tunnel',
      box: () => { const x = tuBot(state.g); return [TUX + x - 24, TUY + 44, 48, 66]; } },
    { id: 'notausgang', name: 'Notausgang', bereich: 'Rettung', aera: 'Tür', typ: 'Fluchttür im Tunnel',
      fakt: 'In U-Bahn-Tunneln gibt es in regelmäßigen Abständen Notausgänge und einen Fluchtweg neben dem Gleis.',
      echt: 'Echt. Dass hinter dieser Tür etwas Geheimes liegt, ist erfunden. Wer dreimal anklopft, findet es.',
      note: 'Dreimal anklopfen.', color: '#2f8f4e',
      box: () => [TUX + TU_DOOR.x - 36, TUY + TU_DOOR.y - 32, 72, 130] },
  ],
});
