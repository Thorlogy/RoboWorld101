/* Geheimer Raum 2: Denkspiele (UG 2, rechts neben der Spielhalle), erscheint zusammen mit der Spielhalle.
   Nerd-Ecke mit echten Meilensteinen der KI in Spielen: ELIZA (1966) zum Selberchatten, Deep Blue (1997), AlphaGo mit Zug 37 (2016),
   und ein Programm, das Breakout aus den Bildschirmpixeln gelernt hat (2015).
   Gag: Weder Deep Blue noch AlphaGo konnten Figuren oder Steine bewegen, das machte jeweils ein Mensch aus dem Team. */
const DSX = rx(roomOf('denkspiele').c), DSY = ry(roomOf('denkspiele').r);
const dsMono = (size, color) => ({ family: '"IBM Plex Mono", monospace', weight: 500, color, size });
// Deep Blue: der Helfer zieht den Springer (Bild 18–30)
const dsKnight = f => (f < 18 ? { x: 262, y: 290, lift: 0 } : f < 30 ? { x: lerp(262, 286, ease(seg(f, 18, 30))), y: 290, lift: Math.sin(Math.PI * seg(f, 18, 30)) * 14 } : { x: 286, y: 290, lift: 0 });
// AlphaGo: der schwarze Stein für Zug 37 wird bei Bild 34 gesetzt
const dsGoPlaced = f => f >= 34;
// Breakout: der Ball gräbt einen Tunnel am linken Rand und springt dann hinter den Steinen hin und her
function dsBall(f) {
  if (f < 24) return { x: 520 + 4, y: lerp(272, 214, (f % 12) / 12), tunnel: true };
  const t = f - 24; return { x: 522 + 56 * (0.5 - 0.5 * Math.cos(TAU * t / 18)), y: 206 + 6 * Math.abs(Math.sin(TAU * t / 9)), tunnel: false };
}
function drawDenkspiele(f) {
  ctx.fillStyle = '#232634'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#6b4f3a'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);
  text('DENKSPIELE', 24, 62, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(240,236,226,0.18)' });
  text('Mensch gegen Maschine', 400, 40, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: f % 20 < 18 ? '#7fd3ff' : '#3a5a70' });
  // ELIZA-Terminal
  withAlpha('eliza', () => {
    box(18, 300, 136, 8, '#a8763f', 1, 1.5); line(26, 308, 26, 360, INK, 2); line(146, 308, 146, 360, INK, 2);
    box(30, 184, 112, 98, '#d8d2bc', 6, 2); box(40, 194, 92, 66, '#0f2a1a', 4, 1.5);
    box(60, 282, 52, 14, '#c9c2aa', 1, 1.2); box(30, 290, 112, 10, '#d8d2bc', 2, 1.2);
    ['> HALLO', 'ICH BIN ELIZA.', 'WIE GEHT ES', 'DIR?'].forEach((t, i) => text(t, 46, 208 + i * 12, 8, { family: '"IBM Plex Mono", monospace', weight: 500, color: '#6eff82' }));
    if (f % 12 < 6) { ctx.fillStyle = '#6eff82'; ctx.fillRect(46, 250, 6, 2); }
    text('Klick mich!', 86, 176, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: f % 24 < 16 ? '#f0b429' : '#7a6420' });
  });
  // Deep Blue: zwei Rechnerschränke, Brett, Helfer zieht, Spieler grübelt
  withAlpha('deepblue', () => {
    for (const x of [168, 204]) { box(x, 150, 32, 210, '#1d1f24', 3, 2); for (let i = 0; i < 9; i++) circle(x + 8 + (i % 3) * 8, 170 + Math.floor(i / 3) * 14, 2, (f + i * 7) % 11 < 6 ? '#ff6b4a' : '#4a2a20', null); text('DB', x + 16, 345, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7aa7d9' }); }
    box(240, 300, 96, 8, '#8e6233', 1, 1.5); line(246, 308, 246, 360, INK, 2); line(330, 308, 330, 360, INK, 2);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#3b3d40' : '#e8e2c8'; ctx.beginPath(); ctx.moveTo(250 + i * 10, 300); ctx.lineTo(260 + i * 10, 300); ctx.lineTo(258 + i * 10, 294); ctx.lineTo(248 + i * 10, 294); ctx.closePath(); ctx.fill(); }
    for (const [x, c] of [[252, '#f3f1ea'], [276, '#2a2723'], [300, '#2a2723'], [312, '#f3f1ea']]) { box(x - 3, 280, 6, 14, c, 2, 1); circle(x, 278, 3, c, INK, 1); }
    const k = dsKnight(f); box(k.x - 4, k.y - 16 - k.lift, 8, 14, '#f3f1ea', 2, 1); circle(k.x + 1, k.y - 18 - k.lift, 4, '#f3f1ea', INK, 1);
    box(244, 262, 26, 18, '#23384d', 2, 1); text('Sf3', 257, 275, 7, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' });
  });
  withAlpha('helfer', () => person({ x: 232, s: 0.85, face: 1, shirt: '#3e6f9e', pants: '#3b3d40', hair: '#2a1f18', hand: f >= 16 && f < 32 ? { x: dsKnight(f).x - 2, y: 268 - dsKnight(f).lift } : { x: 248, y: 300 } }));
  withAlpha('denker', () => { person({ x: 350, sit: true, foot: 360, s: 0.85, face: -1, shirt: '#7b4b8e', pants: '#2a2723', hair: '#3a2c22', hand: { x: 342, y: 256 } }); box(338, 318, 26, 5, '#5d6064', 1, 1); });
  // AlphaGo: Go-Brett, Zug 37 auf der fünften Linie
  withAlpha('alphago', () => {
    box(386, 312, 96, 10, '#d8a95c', 2, 1.5); box(392, 322, 10, 38, '#8e6233', 1, 1); box(466, 322, 10, 38, '#8e6233', 1, 1);
    ctx.fillStyle = '#e2b871'; ctx.beginPath(); ctx.moveTo(392, 312); ctx.lineTo(476, 312); ctx.lineTo(470, 296); ctx.lineTo(398, 296); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.strokeStyle = 'rgba(42,39,35,0.5)'; ctx.lineWidth = 0.8; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(398 + i * 12, 297); ctx.lineTo(392 + i * 14, 311); ctx.stroke(); }
    for (const [x, y, c] of [[410, 303, '#2a2723'], [426, 306, '#f3f1ea'], [440, 301, '#f3f1ea'], [452, 308, '#2a2723'], [418, 309, '#2a2723'], [462, 302, '#f3f1ea']]) { ctx.beginPath(); ctx.ellipse(x, y, 4, 2.2, 0, 0, TAU); paint(c, INK, 0.8); }
    if (dsGoPlaced(f)) { ctx.beginPath(); ctx.ellipse(444, 307, 4, 2.2, 0, 0, TAU); paint('#2a2723', '#f0b429', 1.5); }
    box(398, 236, 76, 40, '#18263a', 3, 1.5);
    text('Zug 37', 436, 252, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#9fc4d6' });
    text(dsGoPlaced(f) ? '1 : 10 000' : '…', 436, 268, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#ffb347' });
    // Helferin setzt den Stein für das Programm
    person({ x: 378, s: 0.8, face: 1, shirt: '#2a2723', pants: '#3b3d40', hair: '#2a1f18', hand: f >= 28 && f < 38 ? { x: 440, y: 300 } : { x: 390, y: 300 } });
  });
  withAlpha('gegner', () => {
    person({ x: 494, sit: true, foot: 360, s: 0.82, face: -1, shirt: '#d6d2c8', pants: '#2a2723', hair: '#2a1f18', hand: { x: 482, y: dsGoPlaced(f) && f < 52 ? 262 : 300 } });
    if (dsGoPlaced(f) && f < 52) text('?!', 498, 238, 16, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#f0b429' });
  });
  // Spielautomat: Programm lernt Breakout und gräbt einen Tunnel
  withAlpha('breakout', () => {
    box(508, 160, 108, 200, '#3b3d40', 6, 2); box(514, 176, 96, 102, '#0b0c12', 3, 1.5);
    const broken = f < 24 ? 0 : Math.floor((f - 24) / 4);
    const colors = ['#d94a4a', '#e07a3a', '#f0b429', '#5f9a4a'];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
      if (c === 0 && r >= 0 && f >= 6) continue; // Tunnel links
      if (r === 0 && c - 1 < broken && c > 0) continue;
      ctx.fillStyle = colors[r]; ctx.fillRect(518 + c * 11, 214 + r * 7, 10, 5);
    }
    const b = dsBall(f); circle(b.x, b.y, 2.4, '#ffffff', null);
    const px = b.tunnel ? 524 : clamp(b.x, 524, 600); box(px - 9, 270, 18, 3, '#7fd3ff', 0, 0);
    text('KI · Runde 600', 562, 192, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#6eff82' });
    box(524, 292, 76, 16, '#5d6064', 2, 1); circle(542, 300, 4, '#d94a4a', INK, 1); circle(582, 300, 4, '#f0b429', INK, 1);
  });
}

registerRoom({
  key: 'denkspiele', name: 'Geheime Denkspiele', level: 'UG 2 · geheim',
  hitOrder: ['eliza', 'helfer', 'denker', 'gegner', 'deepblue', 'alphago', 'breakout'],
  draw: drawDenkspiele,
  glow(f) {},
  robots: [
    { id: 'eliza', name: 'ELIZA', bereich: 'Geschichte', aera: '1966', typ: 'Eines der ersten Chatprogramme',
      fakt: 'Joseph Weizenbaum schrieb ELIZA 1966 am MIT. Das Programm sucht in jedem Satz nach Schlüsselwörtern und baut daraus eine Gegenfrage. Viele Menschen glaubten trotzdem, es würde sie verstehen. Weizenbaum, in Berlin geboren, warnte später davor, Computern zu viel zuzutrauen.',
      echt: 'Echt. Hier kannst du selbst mit einer nachgebauten ELIZA chatten. Sie versteht nichts, sie tut nur so. Damals lief sie auf einem Großrechner mit Fernschreiber, nicht auf so einem Bildschirm.',
      note: 'Klick auf das Terminal, dann öffnet sich das Chatfenster.', color: '#6eff82',
      quelle: 'https://de.wikipedia.org/wiki/ELIZA',
      onSelect: () => window.openEliza && window.openEliza(),
      box: () => [DSX + 26, DSY + 166, 124, 140] },
    { id: 'deepblue', name: 'Schachcomputer Deep Blue', bereich: 'Geschichte', aera: '1997', typ: 'Großrechner mit Spezialchips für Schach',
      fakt: '1997 besiegte der Schachcomputer Deep Blue von IBM den Weltmeister Garri Kasparow in New York mit 3,5 zu 2,5. Er bewertete rund 200 Millionen Stellungen pro Sekunde. Er stand in zwei großen Rechnerschränken.',
      echt: 'Echt. Deep Blue hatte keinen Arm: Ein Mitglied des Teams las den Zug am Bildschirm ab und zog die Figur von Hand.',
      note: 'Auf dem Bildschirm steht „Sf3“, der Helfer zieht den Springer. Der Mensch gegenüber grübelt.', color: '#1d1f24',
      quelle: 'https://en.wikipedia.org/wiki/Deep_Blue_versus_Garry_Kasparov',
      box: () => [DSX + 166, DSY + 148, 172, 214] },
    { id: 'alphago', name: 'AlphaGo', bereich: 'Forschung', aera: '2016', typ: 'Programm, das Go spielt',
      fakt: 'Go gilt als viel schwerer als Schach, weil es unvorstellbar viele mögliche Stellungen gibt. 2016 gewann das Programm AlphaGo von DeepMind in Seoul 4 zu 1 gegen den Spitzenspieler Lee Sedol. Sein Zug 37 in der zweiten Partie sah zuerst wie ein Fehler aus. Das Programm schätzte, dass nur einer von 10 000 Menschen so ziehen würde. Später galt der Zug als genial.',
      echt: 'Echt. Auch hier setzte ein Mensch aus dem Team die Steine für das Programm aufs Brett.',
      note: 'Der goldumrandete Stein ist Zug 37. Gegenüber: „?!“', color: '#e2b871',
      quelle: 'https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol',
      box: () => [DSX + 360, DSY + 232, 124, 130] },
    { id: 'breakout', name: 'KI lernt Breakout', bereich: 'Forschung', aera: '2015', typ: 'Programm, das aus Bildschirmpixeln lernt',
      fakt: '2015 stellte DeepMind ein Programm vor, das 49 alte Videospiele nur aus den Bildschirmpixeln und dem Punktestand gelernt hat. Niemand hat ihm die Regeln erklärt. In Breakout fand es nach vielen Runden einen Trick: Es schlägt am Rand einen Tunnel, damit der Ball hinter die Mauer kommt und dort von allein viele Steine abräumt.',
      echt: 'Echt, der Tunneltrick ist berühmt. Gezeichnet ist ein eigener Spielautomat, kein Original.',
      note: 'Erst gräbt der Ball den Tunnel links, dann räumt er oben ab. Das Programm muss nur zusehen.', color: '#3b3d40',
      quelle: 'https://en.wikipedia.org/wiki/Deep_reinforcement_learning',
      box: () => [DSX + 506, DSY + 158, 112, 204] },
    { id: 'helfer', name: 'Helfer aus dem Team', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch', fakt: 'Zieht die Figuren für den Schachcomputer.', note: 'Liest den Zug vom Bildschirm ab.', color: '#3e6f9e', box: () => [DSX + 214, DSY + 250, 44, 112] },
    { id: 'denker', name: 'Schachspieler', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch', fakt: 'Spielt gegen den Schachcomputer.', note: 'Denkt nach. Der Computer ist längst fertig.', color: '#7b4b8e', box: () => [DSX + 330, DSY + 250, 40, 112] },
    { id: 'gegner', name: 'Go-Spieler', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch', fakt: 'Spielt gegen AlphaGo.', note: 'Hat mit Zug 37 nicht gerechnet.', color: '#d6d2c8', box: () => [DSX + 476, DSY + 250, 40, 112] },
  ],
});

/* ---------- ELIZA zum Selberchatten: einfache Regeln wie 1966, auf Deutsch und kindgerecht ---------- */
(() => {
  const css = document.createElement('style');
  css.textContent = `.eliza{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(460px,calc(100% - 24px));background:#d8d2bc;border:3px solid #2a2723;box-shadow:8px 8px 0 #2a2723;padding:14px 14px 18px;z-index:30;font:500 14px "IBM Plex Mono",monospace}
.eliza[hidden]{display:none}.eliza header{display:flex;justify-content:space-between;align-items:center;margin:0 0 10px;color:#2a2723}
.eliza header b{font:700 18px "Saira Condensed",sans-serif;letter-spacing:.06em}.eliza header small{font-size:11px;opacity:.7;margin-left:8px}
.eliza header button{font:inherit;background:#f3efe4;border:2px solid #2a2723;cursor:pointer;padding:2px 10px}
.eliza .crt{background:#08130c;border:10px solid #3b3d40;border-radius:14px;box-shadow:inset 0 0 28px rgba(110,255,130,.18)}
.eliza .log{height:min(260px,40vh);overflow-y:auto;padding:12px;white-space:pre-wrap;color:#6eff82;text-shadow:0 0 4px rgba(110,255,130,.55)}
.eliza .log .du{color:#d4ffd9}.eliza .log .cur::after{content:"█";animation:elz 1s steps(1) infinite}@keyframes elz{50%{opacity:0}}
.eliza form{display:flex;gap:8px;margin-top:10px}.eliza input{flex:1;min-width:0;background:#f3efe4;color:#2a2723;border:2px solid #2a2723;padding:10px;font:inherit}
.eliza form button{background:#2a2723;color:#f3efe4;border:0;padding:0 14px;font:inherit;cursor:pointer}.eliza p{margin:8px 0 0;font-size:11px;color:#5d5a55}`;
  document.head.appendChild(css);
  const box = document.createElement('section'); box.className = 'eliza'; box.hidden = true; box.setAttribute('aria-label', 'Chat mit ELIZA');
  box.innerHTML = '<header><span><b>ELIZA</b><small>Joseph Weizenbaum, MIT, 1966</small></span><button type="button" aria-label="Chat schließen">Ende</button></header><div class="crt"><div class="log" aria-live="polite"></div></div><form><input type="text" maxlength="160" placeholder="Schreib hier und drück Enter" aria-label="Nachricht an ELIZA" autocomplete="off"><button type="submit">Senden</button></form><p>ELIZA versteht nichts. Sie sucht Wörter in deinem Satz und dreht sie zu einer Frage um.</p>';
  document.body.appendChild(box);
  const log = box.querySelector('.log'), input = box.querySelector('input');
  let typing = null;
  const say = (who, t) => {
    const p = document.createElement('div'); if (who === 'du') p.className = 'du'; log.appendChild(p);
    if (who === 'du') { p.textContent = '> ' + t; log.scrollTop = log.scrollHeight; return; }
    // ELIZA tippt Buchstabe für Buchstabe wie auf einem Fernschreiber
    if (typing) { clearInterval(typing.id); typing.p.textContent = typing.t; }
    log.querySelectorAll('.cur').forEach(c => c.classList.remove('cur')); p.className = 'cur'; let i = 0;
    typing = { p, t, id: setInterval(() => { p.textContent = t.slice(0, ++i); log.scrollTop = log.scrollHeight; if (i >= t.length) { clearInterval(typing.id); typing = null; } }, 28) };
  };
  const swap = t => t.replace(/\b(ich|mich|mir|mein|meine|meinen|meinem|bin|du|dich|dir|dein|deine)\b/gi, w => ({ ich: 'du', mich: 'dich', mir: 'dir', mein: 'dein', meine: 'deine', meinen: 'deinen', meinem: 'deinem', bin: 'bist', du: 'ich', dich: 'mich', dir: 'mir', dein: 'mein', deine: 'meine' })[w.toLowerCase()]);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const RULES = [
    [/\b(traurig|angst|allein|einsam|weh|schlimm)\b/i, () => 'Wenn dich etwas wirklich bedrückt, sprich mit einem Menschen, dem du vertraust. Ich bin nur ein altes Programm.'],
    [/\b(verstehst du|bist du (echt|klug|intelligent|lebendig)|denkst du)\b/i, () => 'Ich verstehe gar nichts. Ich suche nur nach Wörtern in deinem Satz und baue daraus eine Frage. Trotzdem klingt es oft so, als würde ich zuhören.'],
    [/^\s*(hallo|hi|hey|moin|guten (tag|morgen|abend)|servus)\b/i, () => 'Hallo! Ich bin ELIZA. Worüber möchtest du sprechen?'],
    [/\b(tschüss|tschuess|bye|ciao|auf wiedersehen)\b/i, () => 'Auf Wiedersehen! Das war ELIZA, geschrieben 1966.'],
    [/\bich bin (.+)/i, m => pick([`Seit wann bist du ${swap(m[1])}?`, `Warum glaubst du, dass du ${swap(m[1])} bist?`])],
    [/\bich mag (.+)/i, m => `Was gefällt dir an ${swap(m[1])}?`],
    [/\bich (will|möchte|moechte) (.+)/i, m => `Was wäre, wenn du ${swap(m[2])} könntest?`],
    [/\bdu bist (.+)/i, m => `Wie kommst du darauf, dass ich ${swap(m[1])} bin?`],
    [/\b(roboter|computer|ki|programm)\b/i, () => 'Interessierst du dich für Computer? In diesem Haus gibt es viele davon.'],
    [/\b(mama|papa|mutter|vater|schwester|bruder|oma|opa|familie)\b/i, () => 'Erzähl mir mehr über deine Familie.'],
    [/\b(schule|lehrer|lehrerin|hausaufgaben)\b/i, () => 'Was machst du in der Schule am liebsten?'],
    [/^\s*(gut|super|toll|prima)\b/i, () => 'Schön. Was hat dich heute gefreut?'],
    [/^\s*(schlecht|nicht so gut|geht so)\b/i, () => 'Was ist denn los?'],
    [/^\s*warum\b/i, () => 'Was glaubst du denn?'],
    [/\bweil\b/i, () => 'Ist das der wirkliche Grund?'],
    [/^\s*ja\b/i, () => 'Du klingst sehr sicher.'],
    [/^\s*nein\b/i, () => 'Warum nicht?'],
    [/\?\s*$/, () => 'Was meinst du selbst dazu?'],
  ];
  const DEFAULT = ['Erzähl mir mehr.', 'Wie meinst du das?', 'Und was denkst du darüber?', 'Das ist interessant. Warum sagst du das?'];
  function answer(t) { for (const [re, fn] of RULES) { const m = t.match(re); if (m) return fn(m); } return pick(DEFAULT); }
  box.querySelector('form').addEventListener('submit', e => {
    e.preventDefault(); const t = input.value.trim(); if (!t) return; input.value = '';
    say('du', t); setTimeout(() => say('eliza', answer(t)), 350);
  });
  const close = () => { box.hidden = true; if (state.sel === 'eliza') select(null, false); };
  box.querySelector('header button').addEventListener('click', close);
  // Tasten im Chat nicht an die Welt weitergeben (Leertaste würde sonst die Animation anhalten)
  box.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') close(); });
  window.openEliza = () => { if (box.hidden) { box.hidden = false; if (!log.children.length) say('eliza', 'Hallo, ich bin ELIZA. Ich bin ein Programm von 1966. Wie geht es dir?'); } input.focus(); };
})();
