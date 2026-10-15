/* Kreisläufe: Dinge wandern sichtbar durch die ganze Welt (Routen), ein Ticker meldet, was passiert,
   und „Verfolgen“ fährt mit der Kamera hinterher. Lädt nach allen Räumen (braucht roomOf, Konstanten der Räume).
   Eine Route ist eine Punktliste [x, y, {t, info, w}]: t = Art (wasser, schnee, dampf, erz …), info = Tickertext beim Erreichen,
   w = Verweilen (zählt als zusätzliche Strecke). Position über langeUhr(n): eine Runde dauert n Minuten. */
const ROUTEN = {};
function route(name, n, pts, sichtbar, art) {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + ((pts[i][2] || {}).neu ? 0 : Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])) + ((pts[i - 1][2] || {}).w || 0));
  ROUTEN[name] = { n, pts, L, sichtbar, art, gesamt: L[L.length - 1] };
}
function routePos(r, u) {
  const d = ((u % 1) + 1) % 1 * r.gesamt;
  for (let i = 1; i < r.pts.length; i++) if (d <= r.L[i]) {
    const a = r.pts[i - 1], b = r.pts[i], w = (a[2] || {}).w || 0, s = r.L[i] - r.L[i - 1] - w, t = clamp((d - r.L[i - 1] - w) / Math.max(1, s), 0, 1);
    let k = i - 1; while (k > 0 && !(r.pts[k][2] || {}).t) k--;
    return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), i: i - 1, t: (r.pts[k][2] || {}).t || 'wasser' };
  }
  return { x: r.pts[0][0], y: r.pts[0][1], i: 0, t: 'wasser' };
}
const routeU = (r, k = 0, anzahl = 1) => (langeUhr(r.n) / (r.n * 480) + k / anzahl) % 1;
// Unter der Erde und in Häusern: nur in den Räumen der Route sichtbar
function verdeckt(r, x, y) {
  for (const o of ROOMS) {
    if (!o.built || r.sichtbar.includes(o.built)) continue;
    if (o.r < 7 && o.outdoor) continue;
    const x0 = rx(o.c), y0 = ry(o.r); if (x > x0 && x < x0 + RW && y > y0 && y < y0 + RH) return true;
  }
  return false;
}

/* ---------- Wasserkreislauf: Schnee am Gipfel → Stausee → Turbine → Wasserwerk → Imbiss → Kanal → Kläranlage → Fluss → Wolke ---------- */
const KL_IMX = rx(roomOf('imbiss').c), KL_IMY = ry(roomOf('imbiss').r), KL_HAHN = KL_IMX + 612;
const KL_FLUSS = rx(roomOf('kraftwerk').c) + RW + WALL / 2;
(function () {
  const pts = [[SEEX0 - 2350, GROUND - 1720, { t: 'schnee', info: 'Schnee fällt auf den Gipfel.' }], [SEEX0 - 2350, GROUND - 1346, { t: 'schnee', w: 260 }]];
  pts.push([SEEX0 - 2300, bgOberY(SEEX0 - 2300) - 3, { t: 'wasser', info: 'Die Sonne taut den Schnee. Das Wasser rinnt den Hang hinunter.' }]);
  for (let x = SEEX0 - 2150; x < BG_P - 80; x += 150) pts.push([x, bgOberY(x) - 3]);
  pts.push([BG_P + 10, BG_TY - 186], [BG_P + 10, BG_TY - 3], [SEEX0 - 200, ST_WS - 63], [ST_XL, ST_WS - 3]);
  pts.push([ST_XL + 220, ST_WS + 60, { info: 'Der Tropfen ist im Stausee.' }], [ST_XD - 60, ST_GW + 150], [ST_XD - 4, ST_GW + 195, { w: 40 }]);
  pts.push([ST_XD + 290, ST_GW - 30, { info: 'Durch die Druckleitung saust er zur Turbine. Die macht Strom.' }], [ST_XD + 420, ST_GW - 60, { w: 80 }]);
  pts.push([ST_XD + 450, ST_GW + 4, { info: 'Hinter der Turbine fließt er im Fluss weiter.' }], [WWX + 80, ST_GW + 4]);
  pts.push([WWX + 80, WWY + 120, { info: 'Ein Teil des Flusswassers geht ins Wasserwerk.' }], [WWX + 140, WWY + 150, { info: 'Sand und Kies halten den Schmutz zurück.' }], [WWX + 170, WWY + 335, { w: 60 }], [WWX + 300, WWY + 335]);
  pts.push([WWX + 350, WWY + 320, { info: 'Die Messung sagt: sauber. Die Pumpe drückt das Trinkwasser in die Stadt.', w: 50 }], [WWX + 400, WWY + 282]);
  pts.push([WWX + RW, WWY + 282, { info: 'Unter der Straße fließt es durch die Leitung.' }], [KL_HAHN, WWY + 282], [KL_HAHN, KL_IMY + 400]);
  pts.push([KL_HAHN, KL_IMY + 208, { info: 'Im Imbiss kommt es aus dem Hahn. Ein Glas Wasser: 1,50.', w: 150 }], [KL_HAHN, KL_IMY + 250], [KL_HAHN + 14, KL_IMY + 264]);
  pts.push([KL_HAHN + 14, KL_IMY + 400, { info: 'Ab in den Abfluss und in den Kanal.' }], [KL_HAHN + 14, KNY + 345], [KNX1 + RW, KNY + 345], [KNX2, KNY + 345, { info: 'Im Kanal geht es zur Kläranlage.' }]);
  pts.push([KLX + RW, KNY + 345], [KLX + 330, KNY + 372], [KLX + 175, KNY + 300, { info: 'Kläranlage: Bakterien fressen den Schmutz, Luft hilft ihnen.', w: 120 }]);
  pts.push([KLX + 330, KNY + 238], [KLX + 470, KNY + 300, { info: 'Im Nachklärbecken sinkt der Rest zu Boden.', w: 100 }], [KLX + 600, KNY + 388]);
  pts.push([KLX, KNY + 388, { info: 'Sauberes Wasser fließt zurück zum Fluss.' }], [KL_FLUSS, KNY + 388], [KL_FLUSS, GROUND + 6], [KL_FLUSS - 40, ST_GW + 4]);
  pts.push([KL_FLUSS - 200, ST_GW - 10, { t: 'dampf', info: 'Die Sonne wärmt den Fluss. Das Wasser verdunstet.' }], [KL_FLUSS - 700, GROUND - 1000]);
  pts.push([SEEX0 - 1200, GROUND - 1680, { info: 'Als Wolke zieht es zum Berg.' }], [SEEX0 - 2350, GROUND - 1720]);
  route('wasser', 4, pts, ['wasserwerk', 'kanal1', 'kanal2', 'klaer', 'imbiss'], 'Wassertropfen');
})();
/* ---------- Strom: Krafthaus → Kabel unter der Straße → Rechenzentrum → Ladepark ---------- */
(function () {
  const kx = ST_XD + 520, rz = rx(roomOf('rz1').c), lp = rx(roomOf('ladepark').c), y = GROUND + 34;
  route('strom', 2, [
    [kx, ST_GW - 100, { t: 'strom', info: 'Im Krafthaus dreht das Wasser die Turbine, der Generator macht Strom. (Die gelben Punkte sind nur zum Sehen. Strom fließt nicht in Kugeln.)', w: 60 }],
    [kx + 140, ST_GW - 30], [kx + 140, y], [rx(roomOf('energie').c) + 300, y, { info: 'Das Kabel unter der Straße bringt den Strom in die Stadt. Windräder und Solarfeld speisen auch ein.' }],
    [rz + 60, y], [rz + 60, ry(6) + 330], [rz + 260, ry(6) + 250, { info: 'Im Rechenzentrum rechnen die Server. Ihre Abwärme heizt die Nachbarhäuser.', w: 100 }], [rz + 60, ry(6) + 330], [rz + 60, y],
    [lp + 150, y], [lp + 150, ry(6) + 330, { info: 'Am Ladepark lädt ein E-Auto.', w: 120 }], [kx, ST_GW - 100, { neu: true }]], ['rz1', 'ladepark'], 'Strom');
})();
/* ---------- Vom Erz zum Paket: Bergwerk → Schacht → Lkw → Fertigung → Lager → Paketzentrum ---------- */
(function () {
  const sx = MNX + MN_SCH + 45, st = GROUND - 12, h = rx(0), pk = rx(roomOf('paket').c);
  route('erz', 4, [
    [MNX + 500, ry(9) + 292, { t: 'erz', info: 'Tief im Bergwerk bricht der Brecher das Erz klein.', w: 60 }], [sx, ry(9) + 292],
    [sx, GROUND - 160, { info: 'Das Fördergefäß zieht das Erz im Schacht nach oben.' }], [sx + 40, st, { t: 'lkw', info: 'Ein Lkw bringt das Erz zur Fabrik.' }],
    [h + 30, st], [h + 40, ry(4) + 340], [h + 300, ry(4) + 330, { t: 'teil', info: 'In der Fertigungshalle wird aus dem Metall ein Zahnrad für einen Roboter.', w: 100 }],
    [h + 600, ry(4) + 340], [h + 600, ry(5) + 340], [h + 320, ry(5) + 330, { info: 'Im Lager wartet das Zahnrad auf eine Bestellung.', w: 80 }], [h + 30, ry(5) + 340], [h + 20, st],
    [h - 10, st, { t: 'lkw', info: 'Bestellt! Ein Lkw fährt es zum Paketzentrum.' }], [pk + 300, st], [pk + 380, ry(6) + 300, { t: 'paket', info: 'Im Paketzentrum packt ein Roboterarm es in einen Karton. Gleich holt es der Lieferwagen ab.', w: 140 }],
    [MNX + 500, ry(9) + 292, { neu: true }]], ['mine1', 'mine2', 'mine3', 'mine4', 'mine5', 'mine6', 'fertigung', 'lager', 'paket'], 'Erz zum Paket');
})();
function klTropfen(x, y, art, gross) {
  const s = gross ? 1.6 : 1;
  if (art === 'schnee') { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2 * s; ctx.beginPath(); for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; ctx.moveTo(x - 6 * s * Math.cos(a), y - 6 * s * Math.sin(a)); ctx.lineTo(x + 6 * s * Math.cos(a), y + 6 * s * Math.sin(a)); } ctx.stroke(); return; }
  if (art === 'strom') { glow(x, y, 16 * s, 'rgba(255,220,90,0.8)'); circle(x, y, 5 * s, '#ffd23f', INK, 1); ctx.beginPath(); ctx.moveTo(x + 1 * s, y - 4 * s); ctx.lineTo(x - 2 * s, y + 1 * s); ctx.lineTo(x + 1 * s, y + 1 * s); ctx.lineTo(x - 1 * s, y + 4 * s); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke(); return; }
  if (art === 'erz') { ctx.beginPath(); ctx.moveTo(x - 7 * s, y + 3 * s); ctx.lineTo(x - 4 * s, y - 5 * s); ctx.lineTo(x + 3 * s, y - 6 * s); ctx.lineTo(x + 7 * s, y + 1 * s); ctx.lineTo(x + 2 * s, y + 6 * s); ctx.closePath(); paint('#8a5a3a', INK, 1.2); circle(x + 1 * s, y - 1 * s, 1.6 * s, '#d9a441', null); return; }
  if (art === 'teil') { circle(x, y, 7 * s, '#b9c0c6', INK, 1.2); circle(x, y, 2.5 * s, '#5d6064', null); for (let j = 0; j < 6; j++) { const a = j * TAU / 6; box(x + Math.cos(a) * 8 * s - 2 * s, y + Math.sin(a) * 8 * s - 2 * s, 4 * s, 4 * s, '#b9c0c6', 0, 0.8); } return; }
  if (art === 'paket') { box(x - 8 * s, y - 7 * s, 16 * s, 13 * s, '#c9a36b', 1, 1.2); line(x - 8 * s, y - 2 * s, x + 8 * s, y - 2 * s, '#8a6a3a', 2 * s); return; }
  if (art === 'lkw') { box(x - 26, y - 22, 34, 18, '#e0662b', 2, 1.2); box(x + 8, y - 20, 16, 16, '#3e6f9e', 2, 1.2); box(x + 12, y - 17, 9, 7, '#bfe0f0', 1, 0.8); for (const dx of [-18, 0, 16]) circle(x + dx, y - 3, 5, '#2b2b2b', INK, 1); if (gross) circle(x - 8, y - 30, 6, '#ffd23f', INK, 1); return; }
  if (art === 'dampf') { ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (const [dx, dy, r] of [[0, 0, 9], [8, -4, 7], [-8, -2, 6]]) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU); ctx.fill(); } return; }
  ctx.beginPath(); ctx.moveTo(x, y - 9 * s); ctx.quadraticCurveTo(x + 6 * s, y - 1 * s, x, y + 5 * s); ctx.quadraticCurveTo(x - 6 * s, y - 1 * s, x, y - 9 * s);
  paint('#4aa3df', INK, 1.2); circle(x - 1.5 * s, y - 1 * s, 1.5 * s, 'rgba(255,255,255,0.9)', null);
}
// Rohre in der Erde ergänzen (Steigleitung zum Imbiss, Abwasser zum Kanal)
if (typeof erdreich === 'function') {
  const alt = erdreich;
  erdreich = function () {
    alt();
    line(BW, ER_WASSER, KL_HAHN, ER_WASSER, '#2a2723', 12); line(BW - 4, ER_WASSER, KL_HAHN, ER_WASSER, '#3e6f9e', 8);
    line(KL_HAHN, ER_WASSER, KL_HAHN, GROUND, '#2a2723', 12); line(KL_HAHN, ER_WASSER, KL_HAHN, GROUND, '#3e6f9e', 8);
    ctx.strokeStyle = '#2a2723'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(KL_HAHN + 14, GROUND); ctx.lineTo(KL_HAHN + 14, KNY + 345); ctx.lineTo(KNX1 + RW, KNY + 345); ctx.stroke();
    ctx.strokeStyle = '#8a7a5e'; ctx.lineWidth = 10; ctx.stroke();
  };
}
registerRunner({
  room: 'imbiss',
  draw(g) {
    // Wasserhahn mit kleinem Becken an der Wand, Leitungen bis zum Boden
    klTropfenAlle();
    const x = KL_HAHN, y = KL_IMY;
    line(x, y + 400, x, y + 200, '#3e6f9e', 5); line(x + 14, y + 400, x + 14, y + 262, '#8a7a5e', 6);
    withAlpha('wasserhahn', () => {
      box(x - 4, y + 194, 18, 10, '#c9ccc8', 3, 1.2); line(x, y + 204, x, y + 212, '#c9ccc8', 3);
      box(x - 22, y + 250, 48, 14, '#e6e3da', 4, 1.5);
      const p = routePos(ROUTEN.wasser, routeU(ROUTEN.wasser));
      if (Math.abs(p.x - KL_HAHN) < 2 && p.y > y + 205 && p.y < y + 250) line(x, y + 212, x, y + 250, 'rgba(74,163,223,0.8)', 3);
    });
  },
  robot: { id: 'wasserhahn', name: 'Wasserhahn im Imbiss', bereich: 'Service', aera: 'heute', typ: 'Trinkwasser aus der Leitung', color: '#4aa3df',
    fakt: 'Das Wasser aus dem Hahn hat einen langen Weg hinter sich: vom Schnee am Berg in den Stausee, durch die Turbine, durch Sand und Kies im Wasserwerk und durch die Leitung bis hierher. Danach geht es durch den Kanal zur Kläranlage und zurück in den Fluss.',
    echt: 'Echt, so läuft der Wasserkreislauf. In echt dauert die Reise Tage bis Jahre, hier vier Minuten.',
    note: 'Klick auf „Verfolgen“ und wähle den Wassertropfen.',
    quelle: 'https://de.wikipedia.org/wiki/Wasserkreislauf',
    box: () => [KL_HAHN - 34, KL_IMY + 192, 62, 74] },
});
const KL_ANZAHL = { wasser: 9, strom: 6, erz: 3 };
function klTropfenAlle() {
  for (const [name, r] of Object.entries(ROUTEN)) {
    const N = KL_ANZAHL[name] || 3, mein = state.follow && FOLGE.ziel === name;
    for (let k = N - 1; k >= 0; k--) {
      const p = routePos(r, routeU(r, k, N));
      if (verdeckt(r, p.x, p.y)) {
        // verfolgtes Teil hinter Wänden: als Umriss zeigen
        if (k === 0 && mein) { ctx.save(); ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); circle(p.x, p.y, 18, null, '#2a2723', 2); ctx.setLineDash([]); klTropfen(p.x, p.y, p.t, true); ctx.restore(); }
        continue;
      }
      klTropfen(p.x, p.y, p.t, k === 0 && mein);
    }
  }
}

/* ---------- Ticker: kurze Meldungen, ein Klick fährt hin ---------- */
const TICKER = [];
function ticker(textMeldung, x, y) {
  const el = document.getElementById('ticker'); if (!el) return;
  const d = new Date(), zeit = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  const b = document.createElement('button'); b.type = 'button'; b.textContent = zeit + '  ' + textMeldung;
  if (x != null) b.addEventListener('click', () => { setFollow(false); fit(x - 380, y - 260, 760, 520, true); });
  el.prepend(b); TICKER.push(b);
  while (el.children.length > 3) el.lastChild.remove();
  setTimeout(() => { b.classList.add('alt'); }, 20000);
  setTimeout(() => b.remove(), 32000);
  el.style.bottom = (panelBottom() + 16) + 'px';
}
if (typeof WELT !== 'undefined') WELT.on('ticker', (t, x, y) => ticker(t, x, y));

/* ---------- Verfolgen: Paket oder ein Teil eines Kreislaufs ---------- */
const FOLGE = { ziel: 'paket', zuletzt: -1 };
function folgeFokus(g) {
  if (FOLGE.ziel === 'paket' || !ROUTEN[FOLGE.ziel]) return null;
  const p = routePos(ROUTEN[FOLGE.ziel], routeU(ROUTEN[FOLGE.ziel])); return { x: p.x, y: p.y };
}
function folgeMenue() {
  let m = document.getElementById('folgeMenue');
  if (m) { m.remove(); return; }
  m = document.createElement('div'); m.id = 'folgeMenue'; m.className = 'folge-menue';
  const wahl = [['paket', 'Paket']].concat(Object.keys(ROUTEN).map(k => [k, ROUTEN[k].art]));
  for (const [k, name] of wahl) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = name;
    b.addEventListener('click', () => { FOLGE.ziel = k; FOLGE.zuletzt = -1; m.remove(); setFollow(true); });
    m.appendChild(b);
  }
  document.getElementById('follow').after(m);
}
/* ---------- Ursache und Wirkung: Sprengung im Gebirge → Erschütterung im Leitstand des Bergwerks ---------- */
const klBeben = g => (typeof bgSperre === 'function' && bgSperre()) || g < 235 || g > 330 ? 0 : Math.exp(-(g - 235) / 25);
registerRunner({
  room: 'mine2',
  draw(g) {
    const x = MNX + 1010, y = MNY + 44, a = klBeben(g);
    if (a <= 0) return;
    box(x, y, 120, 70, '#23384d', 2, 1.5);
    ctx.strokeStyle = '#ff6b5a'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= 110; i += 2) { const gg = g - (110 - i) * 0.6, aa = klBeben(gg); ctx.lineTo(x + 5 + i, y + 40 + Math.sin(i * 1.7 + g) * 24 * aa); }
    ctx.stroke();
    text('ERSCHÜTTERUNG', x + 60, y + 14, 8, { family: MONO, weight: 500, align: 'center', color: '#ff6b5a' });
  },
  robot: { id: 'seismograf', name: 'Erschütterungsmesser', bereich: 'Inspektion', aera: 'heute', typ: 'Messgerät im Leitstand', color: '#ff6b5a',
    fakt: 'Bei jeder Sprengung bebt der Boden ein wenig. Messgeräte zeichnen das auf. So prüft man, dass Häuser und Leitungen in der Nähe nicht zu stark wackeln.',
    echt: 'Echt. Bei Sprengungen wird die Erschütterung gemessen und mit Grenzwerten verglichen. Hier zeigt der Leitstand des Bergwerks die Sprengung im Gebirge.',
    note: 'Schlägt aus, wenn im Gebirge gesprengt wird. Bei Gewitter bleibt er ruhig, weil dann nicht gesprengt wird.',
    quelle: 'https://de.wikipedia.org/wiki/Ersch%C3%BCtterungsmessung',
    box: () => klBeben(state.g) > 0 ? [MNX + 1010, MNY + 44, 120, 70] : [-99999, -99999, 1, 1] },
});

// Meldungen der verfolgten Route, Ereignisse der Welt prüfen
let klLetztesG = -1;
function klTick() {
  if (state.g !== klLetztesG) {
    if (klLetztesG < 235 && state.g >= 235 && state.g < 260 && !(typeof bgSperre === 'function' && bgSperre()) && WELT.runde % 3 === 0)
      ticker('Sprengung im Gebirge! Im Leitstand des Bergwerks schlägt der Erschütterungsmesser aus.', 2 * BG_MX - BG_F, GROUND - 200);
    klLetztesG = state.g;
    if (state.follow && ROUTEN[FOLGE.ziel]) {
      const r = ROUTEN[FOLGE.ziel], p = routePos(r, routeU(r));
      if (p.i !== FOLGE.zuletzt) {
        for (let i = FOLGE.zuletzt + 1; FOLGE.zuletzt >= 0 && i <= p.i; i++) { const info = (r.pts[i][2] || {}).info; if (info) ticker(info, r.pts[i][0], r.pts[i][1]); }
        if (FOLGE.zuletzt > p.i) { const info = (r.pts[0][2] || {}).info; if (info) ticker(info, r.pts[0][0], r.pts[0][1]); }
        FOLGE.zuletzt = p.i;
      }
    }
  }
  requestAnimationFrame(klTick);
}
requestAnimationFrame(klTick);
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  seismograf: 'Wenn im Berg gesprengt wird, wackelt der Boden ein bisschen. Dieses Gerät misst das.',
  wasserhahn: 'Das Wasser aus dem Hahn war mal Schnee auf dem Berg. Verfolge einen Tropfen auf seiner Reise!',
}));
