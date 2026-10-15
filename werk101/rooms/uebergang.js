/* Übergänge: was zwischen Räumen und Gebäuden liegt.
   Fernsicht (Hügel am Horizont), Erdreich mit Schichten und Leitungen, Stadtmöbel in Lücken,
   Zugang zum Tiefbahnhof, Förderturm über dem Schacht, Kanaldeckel auf der Straße. */

/* ---------- Fernsicht: flache Hügel weit hinten über die ganze Breite ---------- */
function fernsicht() {
  const nacht = istNacht(), abend = WELT.phase === 'abend';
  ctx.fillStyle = nacht ? '#1a2140' : abend ? '#4a4a6a' : state.wetter === 'nebel' ? '#cfd3d1' : '#b9c6c2';
  ctx.beginPath(); ctx.moveTo(-14000, GROUND);
  for (let x = -14000; x <= 26000; x += 400) ctx.lineTo(x, GROUND - 150 - 90 * Math.sin(x / 1700) - 50 * Math.sin(x / 530 + 1));
  ctx.lineTo(26000, GROUND); ctx.closePath(); ctx.fill();
}

/* ---------- Erdreich: Schichten, Steine, Leitungen zwischen den unterirdischen Räumen ---------- */
const ER_WASSER = ry(7) + 282, ER_ABWASSER = ry(7) + 388;
function erdreich() {
  const x0 = -14000, x1 = 26000;
  for (const [y, a] of [[ry(7) + 120, 0.06], [ry(8) + 60, 0.08], [ry(8) + 330, 0.07], [ry(9) + 220, 0.09]]) {
    ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.moveTo(x0, y);
    for (let x = x0; x <= x1; x += 300) ctx.lineTo(x, y + 14 * Math.sin(x / 900));
    ctx.lineTo(x1, y + 60); ctx.lineTo(x0, y + 60); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  for (let i = 0; i < 260; i++) { const x = ((i * 977) % 40000) - 14000, y = ry(7) + 20 + ((i * 433) % 1300); ctx.beginPath(); ctx.ellipse(x, y, 5 + (i % 5) * 2, 3 + (i % 3), 0, 0, TAU); ctx.fill(); }
  // Trinkwasser vom Wasserwerk nach rechts in die Stadt
  const ww = rx(roomOf('wasserwerk').c) + RW;
  line(ww, ER_WASSER, BW, ER_WASSER, '#2a2723', 12); line(ww, ER_WASSER, BW, ER_WASSER, '#3e6f9e', 8);
  // gereinigtes Wasser von der Kläranlage zurück zum Fluss
  const kl = rx(roomOf('klaer').c), fluss = rx(roomOf('kraftwerk').c) + RW + WALL / 2;
  ctx.strokeStyle = '#2a2723'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(kl, ER_ABWASSER); ctx.lineTo(fluss, ER_ABWASSER); ctx.lineTo(fluss, GROUND + 6); ctx.stroke();
  ctx.strokeStyle = '#6f8fa0'; ctx.lineWidth = 8; ctx.stroke();
  // Glasfaser und Strom knapp unter der Oberfläche
  line(-14000, GROUND + 26, 26000, GROUND + 26, 'rgba(240,180,41,0.55)', 3);
  line(-14000, GROUND + 34, 26000, GROUND + 34, 'rgba(42,39,35,0.45)', 4);
}

/* ---------- Stadtmöbel in Lücken zwischen Feldern und Häusern (EG) ---------- */
let UG_LUECKEN = null;
function ugLuecken() {
  const iv = ROOMS.filter(o => o.r === 6 && isOpen(o)).map(o => [rx(o.c) - WALL, rx(o.c) + RW + WALL]).concat(HOUSES.map(h => [h.x, h.x + h.w]));
  iv.sort((a, b) => a[0] - b[0]);
  const out = []; let end = iv[0][1];
  for (const [a, b] of iv.slice(1)) { if (a - end > 70) out.push([end, a]); end = Math.max(end, b); }
  return out;
}
function laterne(x, an) {
  line(x, GROUND - 2, x, GROUND - 150, '#3b3d40', 4); line(x, GROUND - 150, x + 22, GROUND - 150, '#3b3d40', 4);
  box(x + 14, GROUND - 152, 18, 8, an ? '#ffe7a3' : '#8a8f94', 2, 1.2);
}
function baum(x, s = 1) { line(x, GROUND - 2, x, GROUND - 70 * s, '#6b5a48', 6); circle(x, GROUND - 90 * s, 30 * s, '#5f9a4a', INK, 1.5); circle(x - 18 * s, GROUND - 76 * s, 20 * s, '#6fa85a', INK, 1.2); }
registerRunner({
  room: 'strasse',
  draw(g) {
    if (!UG_LUECKEN) UG_LUECKEN = ugLuecken();
    for (const [a, b] of UG_LUECKEN) {
      const w = b - a;
      ctx.fillStyle = '#b9b4a8'; ctx.fillRect(a, GROUND - 6, w, 8);
      if (w > 260) { baum(a + w * 0.25, 0.9); laterne(a + w * 0.6, istDunkel()); }
      else if (w > 120) laterne(a + w / 2, istDunkel());
    }
  },
  glow() { if (!UG_LUECKEN) return; for (const [a, b] of UG_LUECKEN) { const x = b - a > 260 ? a + (b - a) * 0.6 : a + (b - a) / 2; if (b - a > 120) glow(x + 23, GROUND - 146, 70, 'rgba(255,231,163,0.5)'); } },
  robot: { id: 'gehweg2', name: 'Gehweg mit Laternen', bereich: 'Mobilität', aera: 'heute', typ: 'Weg zwischen den Häusern', color: '#b9b4a8',
    fakt: 'Zwischen den Häusern verbinden Gehwege die Welt. Viele Straßenlaternen schalten sich heute mit einem Lichtsensor selbst ein, wenn es dunkel wird.',
    echt: 'Echt.', note: 'Abends gehen die Laternen an.', box: () => [-99999, -99999, 1, 1] },
});

/* ---------- Zugang zum Tiefbahnhof zwischen Rechenzentrum und Haus 104 ---------- */
registerRunner({
  room: 'tbf2',
  draw(g) {
    const a = H4.x + H4.w + 12, b = H5.x - 12, xg = (a + b) / 2, unten = ry(7) + 372, links = rx(roomOf('tbf2').c) + RW;
    // Röhre mit Rolltreppe von der Oberfläche schräg hinunter zum Bahnsteig
    ctx.fillStyle = '#d9d5cb'; ctx.beginPath(); ctx.moveTo(links, unten - 110); ctx.lineTo(links, unten + 6); ctx.lineTo(xg + 70, GROUND + 6); ctx.lineTo(xg + 70, GROUND - 4); ctx.lineTo(xg - 30, GROUND - 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 0; i < 14; i++) { const t = ((i / 14) + g / 480 * 4) % 1, x = lerp(xg + 40, links + 20, t), y = lerp(GROUND, unten, t); line(x - 10, y, x + 14, y, '#8a8f94', 2); }
    line(xg + 50, GROUND - 40, links + 30, unten - 40, INK, 2);
    for (const d of [0, 0.5]) { const t = ((g / 480) * 2 + d) % 1; person({ x: lerp(xg + 40, links + 40, t), foot: lerp(GROUND, unten, t), face: -1, shirt: d ? '#3e6f9e' : '#d9542b', s: 0.85 }); }
    // Eingang an der Oberfläche: Glashaus und Lichtauge wie in Stuttgart
    box(xg - 70, GROUND - 90, 150, 86, 'rgba(159,196,214,0.55)', 4, 2);
    ctx.beginPath(); ctx.ellipse(xg + 130, GROUND - 4, 46, 26, 0, Math.PI, 0); paint('#e6e3da', INK, 2);
    ctx.beginPath(); ctx.ellipse(xg + 130, GROUND - 22, 22, 6, 0, 0, TAU); paint(istDunkel() ? '#f6e3a6' : '#dff1ff', INK, 1.2);
    box(xg - 70, GROUND - 120, 150, 26, '#2a2723', 0, 2);
    text('TIEFBAHNHOF ↓', xg + 5, GROUND - 102, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  },
  robot: { id: 'tbzugang', name: 'Zugang zum Tiefbahnhof', bereich: 'Mobilität', aera: 'heute', typ: 'Rolltreppe und Lichtauge', color: '#e6e3da',
    fakt: 'In Stuttgart ragen die Lichtaugen des Tiefbahnhofs als flache Kuppeln aus dem Boden. Durch sie fällt Tageslicht bis hinunter auf die Bahnsteige.',
    echt: 'Echt als Vorbild. Hier führt die Rolltreppe aus der Röhre direkt zum Bahnsteig.', note: 'Reisende fahren hinunter zum Schnellzug.',
    box: () => { const a = H4.x + H4.w + 12, b = H5.x - 12, xg = (a + b) / 2; return [xg - 70, GROUND - 120, 250, 116]; } },
});

/* ---------- Förderturm über dem Schacht des Bergwerks ---------- */
registerRunner({
  room: 'mine1',
  draw(g) {
    const x = MNX + MN_SCH + 45, top = GROUND - 190;
    ctx.fillStyle = '#2a2723'; ctx.fillRect(x - 30, GROUND - 4, 60, ry(7) + 6 - GROUND);
    ctx.strokeStyle = '#5d6064'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x - 24, GROUND); ctx.lineTo(x - 14, top); ctx.moveTo(x + 24, GROUND); ctx.lineTo(x + 14, top); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); for (let y = GROUND; y > top + 10; y -= 36) { const w = 14 + 10 * (y - top) / (GROUND - top), w2 = 14 + 10 * (y - 36 - top) / (GROUND - top); ctx.moveTo(x - w, y); ctx.lineTo(x + w2, y - 36); ctx.moveTo(x + w, y); ctx.lineTo(x - w2, y - 36); } ctx.stroke();
    box(x - 26, top - 30, 52, 30, '#9a968c', 2, 1.5);   // Fördermaschine oben im Turm
    const v = mnSkipY((g + 1) % 480) - mnSkipY(g), dreh = g * Math.sign(v) * 0.4;
    for (const dx of [-12, 12]) { circle(x + dx, top - 4, 9, '#cfcac0', INK, 2); ctx.save(); ctx.translate(x + dx, top - 4); ctx.rotate(dreh); for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 3); line(0, 0, 8, 0, INK, 1.5); } ctx.restore(); }
    line(x, top + 4, x, GROUND + 20, '#c9ccc8', 1.5);
  },
  robot: { id: 'foerderturm', name: 'Förderturm', bereich: 'Rohstoffe', aera: 'seit dem 19. Jh.', typ: 'Gerüst mit Seilscheiben über dem Schacht', color: '#5d6064',
    fakt: 'Über einem Schacht steht der Förderturm. Oben im Turm sitzt die Fördermaschine. Ihre Treibscheiben bewegen das Seil und ziehen das Gefäß mit dem Erz nach oben. Solche Turmförderanlagen gibt es zum Beispiel am Schacht Konrad in Salzgitter.',
    echt: 'Echt. Die Räder drehen sich hier, solange das Gefäß im Schacht fährt.', note: 'Steht über dem Schacht, darunter liegen drei Sohlen.',
    box: () => { const x = MNX + MN_SCH + 45; return [x - 30, GROUND - 225, 60, 225]; } },
});

/* ---------- Kanaldeckel auf der Straße über dem Einstieg ---------- */
registerRunner({
  room: 'kanal1',
  draw() {
    const x = rx(roomOf('kanal1').c) + 590, y = ry(6) + 386;
    withAlpha('kanaldeckel', () => {
    ctx.beginPath(); ctx.ellipse(x, y, 26, 5, 0, 0, TAU); paint('#3b3d40', INK, 1.5);
    ctx.beginPath(); ctx.moveTo(x + 40, y); ctx.lineTo(x + 50, y - 28); ctx.lineTo(x + 60, y); ctx.closePath(); paint('#e0662b');
    ctx.fillStyle = '#fff'; ctx.fillRect(x + 45, y - 14, 10, 4);
    });
  },
  robot: { id: 'kanaldeckel', name: 'Kanaldeckel', bereich: 'Bau', aera: 'heute', typ: 'Einstieg in den Kanal', color: '#3b3d40',
    fakt: 'Unter fast jeder Straße liegt ein Kanal. Durch den Deckel kommt man in den Schacht; dort wird auch das Kabel für den Kamerawagen hinuntergelassen.',
    echt: 'Echt.', note: 'Darunter fährt gerade der Kamerawagen.', box: () => [rx(roomOf('kanal1').c) + 560, ry(6) + 356, 110, 34] },
});
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  tbzugang: 'Hier geht es mit der Rolltreppe hinunter zum Bahnhof unter der Erde.',
  foerderturm: 'Über dem Schacht steht ein hoher Turm mit Rädern. Darüber läuft das Seil, an dem die Steine nach oben gezogen werden.',
  kanaldeckel: 'Unter diesem Deckel geht es hinunter in den Kanal.',
  gehweg2: 'Zwischen den Häusern stehen Bäume und Laternen.',
}));
