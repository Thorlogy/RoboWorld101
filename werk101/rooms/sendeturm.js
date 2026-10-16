/* Haus 107: Sendeturm mit Nachrichtenstudio (EG, rechts neben der Chipfabrik)
   Moderatorin am Tisch, Kamera-Roboter auf einer Bodenschiene, großer Bildschirm mit der Meldung des Tages.
   Die Meldungen stehen in nachrichten.js; der Bildschirm setzt sie aus Baukasten-Teilen zusammen (Hintergrund, Figur, Bewegung).
   Gag: Die Kamera fährt so lange hin und her, bis sie die Moderatorin genau in der Mitte hat – und fängt dann wieder von vorn an. */
const NWX = rx(roomOf('news').c), NWY = ry(roomOf('news').r);
const NW_MONO = { family: '"IBM Plex Mono", monospace', weight: 500 };
const NW_SCR = { x: 250, y: 58, w: 372, h: 236 };
const nwHeute = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const nwListe = () => NACHRICHTEN.slice().sort((a, b) => (a.datum < b.datum ? 1 : -1));
const nwAktuell = () => { const h = nwHeute(), l = nwListe(); return l.find(n => n.datum <= h) || l[l.length - 1]; };
// Nur echte https-Links zulassen (kein javascript: oder data:)
const nwLinks = n => (n.quellen || []).filter(q => typeof q === 'string' && /^https:\/\/[^\s"'<>]+$/.test(q));
const nwDatum = d => { const [j, m, t] = d.split('-'); return `${+t}.${+m}.${j}`; };

/* ---------- Baukasten: Hintergründe (Bildschirm-Szene 0..372 × 0..176, Boden bei 150) ---------- */
const NW_HG = {
  labor(f) {
    ctx.fillStyle = '#e8ece8'; ctx.fillRect(0, 0, 372, 176);
    for (let x = 0; x < 372; x += 30) line(x, 0, x, 120, 'rgba(42,39,35,0.06)', 1);
    ctx.fillStyle = '#c9ccc8'; ctx.fillRect(0, 150, 372, 26); line(0, 150, 372, 150, INK, 1.5);
    for (let x = 20; x < 372; x += 24) line(x, 152, x, 174, 'rgba(42,39,35,0.15)', 1);
    box(300, 70, 40, 54, '#f3f1ea', 2, 1.2); for (let k = 0; k < 4; k++) line(304, 80 + k * 10, 336, 80 + k * 10, 'rgba(42,39,35,0.3)', 1);
    text('maßstab vergrößert', 186, 168, 8, Object.assign({ align: 'center', color: '#5d6064' }, NW_MONO));
  },
  meer(f) {
    ctx.fillStyle = '#bfd8e2'; ctx.fillRect(0, 0, 372, 176);
    ctx.fillStyle = '#3e6f9e'; ctx.fillRect(0, 120, 372, 56);
    for (let x = -20; x < 392; x += 40) { const y = 130 + ((x / 40) % 2) * 14; line(x + ((f * 2) % 40), y, x + 14 + ((f * 2) % 40), y, 'rgba(255,255,255,0.45)', 2); }
    for (const [x, s] of [[270, 1], [90, 0.55]]) {
      line(x, 124, x, 124 - 96 * s, '#f3f1ea', 4 * s + 1); box(x - 6 * s, 120 - 100 * s, 14 * s, 8 * s, '#f3f1ea', 1, 1);
      ctx.save(); ctx.translate(x, 124 - 96 * s); ctx.rotate(f * TAU / 60);
      for (let b = 0; b < 3; b++) { ctx.rotate(TAU / 3); line(0, 0, 0, -48 * s, '#f3f1ea', 3 * s + 1); }
      ctx.restore(); circle(x, 124 - 96 * s, 3 * s + 1, '#d6d9d6', INK, 1);
      box(x - 10 * s, 120, 20 * s, 6, '#f0b429', 1, 1);
    }
  },
  fabrik(f) {
    ctx.fillStyle = '#b9bdbb'; ctx.fillRect(0, 0, 372, 176);
    for (let x = 30; x < 372; x += 90) box(x, 20, 50, 30, '#cfe3ea', 1, 1.2);
    ctx.fillStyle = '#7d7972'; ctx.fillRect(0, 150, 372, 26); line(0, 150, 372, 150, INK, 1.5);
    box(0, 118, 372, 10, '#3b3d40', 0, 1.2);
    for (let k = 0; k < 6; k++) { const x = ((k * 70 + f * 70 / 60 * 2) % 420) - 40; box(x, 100, 26, 18, '#c9a36b', 1, 1.2); }
    for (let x = 30; x < 372; x += 60) line(x, 128, x, 150, '#5d6064', 3);
  },
  feld(f) {
    ctx.fillStyle = '#cfe0e6'; ctx.fillRect(0, 0, 372, 176);
    ctx.fillStyle = '#8fb36a'; ctx.fillRect(0, 120, 372, 56);
    for (let x = 0; x < 372; x += 18) line(x, 150, x + 6, 132, '#5f8a42', 2);
  },
  stadt(f) {
    ctx.fillStyle = '#cfdde3'; ctx.fillRect(0, 0, 372, 176);
    for (const [x, w, h] of [[10, 50, 80], [70, 40, 110], [120, 60, 70], [200, 44, 120], [260, 70, 90], [330, 40, 60]]) box(x, 150 - h, w, h, '#a3a8a6', 1, 1.2);
    ctx.fillStyle = '#7d7972'; ctx.fillRect(0, 150, 372, 26); line(0, 150, 372, 150, INK, 1.5);
  },
  weltraum(f) {
    ctx.fillStyle = '#12182a'; ctx.fillRect(0, 0, 372, 176);
    for (let k = 0; k < 40; k++) circle((k * 97) % 372, (k * 53) % 140, 1, '#e6e3da', null);
    ctx.fillStyle = '#b8705a'; ctx.fillRect(0, 150, 372, 26); line(0, 150, 372, 150, INK, 1.5);
  },
  eis(f) {
    ctx.fillStyle = '#d6e6ee'; ctx.fillRect(0, 0, 372, 176);
    ctx.fillStyle = '#f4f6f6'; ctx.fillRect(0, 150, 372, 26); line(0, 150, 372, 150, '#9fb3c4', 1.5);
  },
};

/* ---------- Baukasten: Figuren (Fuß bei y) ---------- */
const NW_FIG = {
  humanoid(x, y, f) { const a = Math.sin(f * TAU / 15) * 0.4; humanoid(x, y, { s: 1, legL: a, legR: -a, armL: -a * 0.6, armR: a * 0.6 }); },
  drohne(x, y, f) { quad(x, y, f, { w: 60, color: '#f3f1ea' }); line(x, y + 3, x, y + 36, INK, 1.5); box(x - 14, y + 36, 28, 20, '#d9542b', 2, 1.2); },
  huepfer(x, y, f) {
    for (const dx of [-14, 0, 14]) line(x, y - 22, x + dx, y, '#3b3d40', 2.5);
    box(x - 12, y - 34, 24, 14, '#f0b429', 3, 1.5); line(x, y - 34, x, y - 44, INK, 1.5); circle(x, y - 46, 3, '#d9542b', INK, 1);
    ctx.beginPath(); ctx.arc(x, y - 22, 22, Math.PI * 1.05, Math.PI * 1.95); ctx.strokeStyle = '#3b3d40'; ctx.lineWidth = 2; ctx.stroke();
    line(x - 10, y - 30, x - 30, y - 60, 'rgba(42,39,35,0.5)', 1); line(x + 10, y - 30, x + 30, y - 60, 'rgba(42,39,35,0.5)', 1);
  },
  vierbeiner(x, y, f) {
    const a = Math.sin(f * TAU / 15) * 6;
    for (const [dx, s] of [[-24, 1], [24, -1]]) { line(x + dx, y - 34, x + dx + a * s, y - 16, INK, 6); line(x + dx + a * s, y - 16, x + dx, y, INK, 5); }
    box(x - 34, y - 46, 68, 18, '#f0b429', 4, 1.5); box(x + 30, y - 44, 12, 12, '#3b3d40', 2, 1.2);
  },
  arm(x, y, f) {
    const w = Math.sin(f * TAU / 60);
    box(x - 20, y - 14, 40, 14, '#3b3d40', 2, 1.2);
    const S = { x, y: y - 14 }, E = { x: x + 30 + 10 * w, y: y - 70 }, H = { x: x + 70 + 20 * w, y: y - 40 - 20 * w };
    limb(S.x, S.y, E.x, E.y, 10, '#d9542b'); limb(E.x, E.y, H.x, H.y, 8, '#d9542b'); circle(E.x, E.y, 5, '#3b3d40', INK, 1);
    line(H.x, H.y, H.x - 6, H.y + 10, INK, 3); line(H.x, H.y, H.x + 6, H.y + 10, INK, 3);
  },
  rover(x, y, f) {
    box(x - 34, y - 34, 68, 18, '#e6e3da', 2, 1.5); line(x + 22, y - 34, x + 22, y - 58, INK, 2); box(x + 14, y - 66, 18, 10, '#3b3d40', 2, 1);
    for (const dx of [-26, 0, 26]) circle(x + dx, y - 8, 8, '#3b3d40', INK, 1.5);
  },
  tauchroboter(x, y, f) {
    box(x - 36, y - 40, 72, 30, '#f0b429', 4, 1.5); circle(x + 34, y - 26, 6, '#7fd3ff', INK, 1.2);
    for (const dx of [-30, 26]) box(x + dx, y - 12, 8, 8, '#3b3d40', 1, 1);
  },
};
function nwFigurPos(n, f) {
  const b = n.bewegung;
  if (b === 'laufen' || b === 'fahren') return { x: lerp(-60, 432, f / 60), y: 150 };
  if (b === 'fliegen') return { x: lerp(-60, 432, f / 60), y: 70 + 6 * Math.sin(f * TAU / 30) };
  if (b === 'schwimmen') return { x: lerp(-60, 432, f / 60), y: 120 + 4 * Math.sin(f * TAU / 20) };
  if (b === 'huepfen') return { x: 186, y: 150 - 80 * Math.abs(Math.sin(f * TAU / 60)) };
  return { x: 186, y: 150 + (b === 'greifen' ? 0 : -2 * Math.abs(Math.sin(f * TAU / 30))) };
}
function nwSzene(n, f) {
  (NW_HG[n.hintergrund] || NW_HG.labor)(f);
  const p = nwFigurPos(n, f);
  (NW_FIG[n.figur] || NW_FIG.humanoid)(p.x, p.y, f);
}

/* ---------- Studio ---------- */
// Kamera-Roboter: fährt auf der Schiene, die Neigung folgt
const nwKamX = f => 214 + 22 * Math.sin(f * TAU / 60);
function drawNews(f) {
  const n = nwAktuell();
  ctx.fillStyle = '#26303d'; ctx.fillRect(0, 0, RW, RH);
  text('STUDIO', 34, 200, 40, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(243,239,228,0.13)' });
  // Lichttraverse mit Scheinwerfern
  line(0, 20, RW, 20, '#5d6064', 5);
  for (const x of [60, 150, 420, 540]) { line(x, 20, x, 32, '#5d6064', 2); box(x - 9, 30, 18, 14, '#3b3d40', 2, 1.2); ctx.fillStyle = 'rgba(255,240,200,0.06)'; ctx.beginPath(); ctx.moveTo(x - 8, 44); ctx.lineTo(x + 8, 44); ctx.lineTo(x + 60, 360); ctx.lineTo(x - 60, 360); ctx.closePath(); ctx.fill(); }
  // Rotes Licht „Auf Sendung“
  box(40, 74, 110, 22, '#3a1a18', 3, 1.5); text('AUF SENDUNG', 95, 89, 11, Object.assign({ align: 'center', color: f % 20 < 14 ? '#ff6a5a' : '#8a3a32' }, NW_MONO));
  // Boden
  ctx.fillStyle = '#3b3d40'; ctx.fillRect(0, 360, RW, 40); line(0, 360, RW, 360, INK, 2);

  // Großer Bildschirm
  withAlpha('tagesmeldung', () => {
    const S = NW_SCR;
    box(S.x - 8, S.y - 8, S.w + 16, S.h + 16, '#1a1d22', 3, 2);
    ctx.save(); ctx.beginPath(); ctx.rect(S.x, S.y, S.w, S.h); ctx.clip();
    ctx.fillStyle = '#23384d'; ctx.fillRect(S.x, S.y, S.w, 26);
    text('ROBO-NACHRICHTEN', S.x + 10, S.y + 18, 14, { family: '"Saira Condensed", sans-serif', weight: 700, color: '#f3efe4' });
    text(nwDatum(n.datum), S.x + S.w - 10, S.y + 18, 11, Object.assign({ align: 'right', color: '#7fd3ff' }, NW_MONO));
    ctx.save(); ctx.translate(S.x, S.y + 26); ctx.beginPath(); ctx.rect(0, 0, S.w, 176); ctx.clip(); nwSzene(n, f); ctx.restore();
    // Etikett: Forschung, Test oder Produkt
    const farbe = { Forschung: '#7b4b8e', Test: '#d9542b', Produkt: '#2e7d32' }[n.stand] || '#5d6064';
    box(S.x + 8, S.y + 34, 82, 18, farbe, 2, 1.2); text(n.stand.toUpperCase(), S.x + 49, S.y + 47, 9, Object.assign({ align: 'center', color: '#f3efe4' }, NW_MONO));
    // Laufband
    ctx.fillStyle = '#f0b429'; ctx.fillRect(S.x, S.y + 202, S.w, 34); line(S.x, S.y + 202, S.x + S.w, S.y + 202, INK, 1.5);
    ctx.font = '700 17px "Saira Condensed", sans-serif';
    const t = n.titel + '   +++   ', w = Math.max(80, ctx.measureText(t).width), off = (f / 60) * w;
    for (let k = -1; k < Math.ceil(S.w / w) + 1; k++) text(t, S.x + k * w - off, S.y + 225, 17, { family: '"Saira Condensed", sans-serif', weight: 700 });
    ctx.restore();
  });

  // Moderatorin hinter dem Tisch
  withAlpha('moderatorin', () => {
    person({ x: 110, face: 1, shirt: '#2f5880', pants: '#3b3d40', hair: '#7a4a2a', hand: { x: 130 + 3 * Math.sin(f * TAU / 20), y: 288 } });
  });
  box(30, 284, 170, 76, '#c9ccc8', 2, 2); box(30, 284, 170, 10, '#f0b429', 0, 1.5);
  text('NACHRICHTEN', 115, 330, 15, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center' });
  box(70, 276, 40, 8, '#f3f1ea', 1, 1);

  // Kamera-Roboter auf der Bodenschiene
  box(170, 352, 120, 6, '#8a8f94', 1, 1.2);
  withAlpha('kamerarobo', () => {
    const x = nwKamX(f), tilt = 0.08 * Math.sin(f * TAU / 60);
    box(x - 20, 330, 40, 22, '#3b3d40', 3, 1.5); circle(x - 12, 352, 4, '#5d6064', INK, 1); circle(x + 12, 352, 4, '#5d6064', INK, 1);
    line(x, 330, x, 262, '#8a8f94', 7); line(x, 330, x, 262, INK, 1);
    ctx.save(); ctx.translate(x, 256); ctx.rotate(tilt);
    box(-28, -14, 46, 26, '#1f2124', 3, 1.5); box(-40, -10, 14, 18, '#3b3d40', 2, 1.2); circle(-40, -1, 6, '#7fd3ff', INK, 1);
    box(10, -24, 18, 12, '#23384d', 1, 1); circle(14, -4, 2.4, f % 20 < 14 ? '#ff6a5a' : '#8a3a32', null);
    ctx.restore();
  });
}

registerRoom({
  key: 'news', name: 'Sendeturm: Nachrichtenstudio', level: 'Sendeturm',
  hitOrder: ['kamerarobo', 'moderatorin', 'tagesmeldung'],
  draw: drawNews,
  robots: [
    Object.assign({ id: 'tagesmeldung', name: 'Robo-Nachricht des Tages', bereich: 'Medien', typ: 'Meldung auf dem großen Bildschirm', color: '#f0b429',
      note: 'Klick auf die Karte öffnet das Archiv mit allen Meldungen.',
      onSelect: () => window.openNachrichten && window.openNachrichten(),
      box: () => [NWX + NW_SCR.x - 8, NWY + NW_SCR.y - 8, NW_SCR.w + 16, NW_SCR.h + 16] }, (() => {
      const n = nwAktuell();
      return { aera: nwDatum(n.datum), fakt: n.titel + '. ' + n.text,
        echt: `Echte Meldung (${n.stand}). Geprüft mit ${nwLinks(n).length} Quellen. Die Szene auf dem Bildschirm ist aus Bausteinen zusammengesetzt und zeigt nicht den echten Roboter.`,
        quelle: nwLinks(n)[0] };
    })()),
    { id: 'kamerarobo', name: 'Kamera-Roboter', bereich: 'Medien', aera: 'seit den 1990ern', typ: 'Fernsehkamera auf einer Schiene',
      fakt: 'In vielen Nachrichtenstudios steht hinter der Kamera kein Mensch mehr. Die Kamera fährt auf einer Schiene oder einem Rollfuß und schwenkt nach einem Plan, den ein Mensch im Regieraum vorher festgelegt hat. Ein Mensch kann so mehrere Kameras auf einmal steuern.',
      echt: 'Echt. Solche Kamerasysteme gibt es in vielen Fernsehstudios.',
      note: 'Fährt hin und her, bis die Moderatorin genau in der Mitte ist – und dann noch einmal.', color: '#3b3d40',
      quelle: 'https://www.newscaststudio.com/2024/09/06/shotoku-broadcast-systems-announces-launch-of-softrail-at-ibc/',
      box: f => [NWX + nwKamX(f) - 44, NWY + 230, 76, 128] },
    { id: 'moderatorin', name: 'Moderatorin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch am Nachrichtentisch',
      fakt: 'Sie liest die Meldung vor. Die Texte für die Robo-Nachrichten werden jeden Tag geprüft: nur echte Roboter, mindestens zwei Quellen.',
      echt: 'Die Moderatorin ist ausgedacht, die Meldungen sind echt.',
      note: 'Hat das Blatt vor sich, schaut aber in die Kamera.', color: '#2f5880',
      box: () => [NWX + 84, NWY + 220, 60, 70] },
  ],
});

/* ---------- Archiv-Fenster ---------- */
(function () {
  const css = document.createElement('style');
  css.textContent = `.nachrichten{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,calc(100% - 24px));max-height:calc(100% - 40px);display:flex;flex-direction:column;background:#f3efe4;border:3px solid #2a2723;box-shadow:8px 8px 0 #2a2723;padding:14px;z-index:30;font:400 14px "IBM Plex Sans",sans-serif;color:#2a2723}
.nachrichten[hidden]{display:none}.nachrichten header{display:flex;justify-content:space-between;align-items:center;margin:0 0 10px}
.nachrichten header b{font:700 20px "Saira Condensed",sans-serif;letter-spacing:.04em}.nachrichten header button,.nachrichten .zum{font:500 12px "IBM Plex Mono",monospace;background:#f3efe4;border:2px solid #2a2723;cursor:pointer;padding:3px 10px}
.nachrichten ol{list-style:none;margin:0;padding:0;overflow-y:auto}.nachrichten li{border-top:2px solid #2a2723;padding:10px 0}
.nachrichten .kopf{display:flex;gap:8px;align-items:baseline;font:500 12px "IBM Plex Mono",monospace}.nachrichten .st{color:#f3efe4;padding:1px 6px}
.nachrichten h3{font:700 17px "Saira Condensed",sans-serif;margin:4px 0}.nachrichten p{margin:0 0 6px;line-height:1.4}.nachrichten a{color:#2f5880;font:500 11px "IBM Plex Mono",monospace;margin-right:10px}`;
  document.head.appendChild(css);
  const box = document.createElement('section'); box.className = 'nachrichten'; box.hidden = true; box.setAttribute('aria-label', 'Archiv der Robo-Nachrichten');
  box.innerHTML = '<header><b>ROBO-NACHRICHTEN · ARCHIV</b><button type="button">Schließen</button></header><ol></ol>';
  document.body.appendChild(box);
  const ol = box.querySelector('ol');
  const farbe = { Forschung: '#7b4b8e', Test: '#d9542b', Produkt: '#2e7d32' };
  const h = nwHeute();
  for (const n of nwListe().filter(n => n.datum <= h)) {
    const li = document.createElement('li');
    const kopf = document.createElement('div'); kopf.className = 'kopf';
    const d = document.createElement('span'); d.textContent = nwDatum(n.datum);
    const s = document.createElement('span'); s.className = 'st'; s.style.background = farbe[n.stand] || '#5d6064'; s.textContent = n.stand;
    kopf.append(d, s);
    const t = document.createElement('h3'); t.textContent = n.titel;
    const p = document.createElement('p'); p.textContent = n.text;
    li.append(kopf, t, p);
    nwLinks(n).forEach((q, i) => { const a = document.createElement('a'); a.href = q; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Quelle ' + (i + 1); li.appendChild(a); });
    if (n.werk) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'zum'; b.textContent = 'Gibt es auch bei uns im Werk →';
      b.addEventListener('click', () => { if (typeof byId === 'undefined' || !byId[n.werk]) return; box.hidden = true; select(n.werk, true); });
      li.appendChild(b);
    }
    ol.appendChild(li);
  }
  const close = () => { box.hidden = true; };
  box.querySelector('header button').addEventListener('click', close);
  box.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') close(); });
  window.openNachrichten = () => { box.hidden = false; };
})();
