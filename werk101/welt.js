/* RoboWorld 101 – Welt: Tageszeit, Nachtbetrieb, Signale über alle Räume, Ereignisse.
   Lädt nach himmel.js und vor engine.js. Die Räume selbst bleiben unverändert: welt.js legt sich um ihre draw-Funktionen.
   Testen ohne Warten: ?phase=nacht (morgen, mittag, abend, nacht), ?stunde=12, ?tag=fr */
'use strict';
const PHASEN = ['morgen', 'mittag', 'abend', 'nacht'];
const PHASE_NAME = { auto: 'Auto', morgen: 'Morgen', mittag: 'Mittag', abend: 'Abend', nacht: 'Nacht' };
const phaseVon = h => (h >= 6 && h < 11 ? 'morgen' : h >= 11 && h < 17 ? 'mittag' : h >= 17 && h < 22 ? 'abend' : 'nacht');
const W_AUS = [-99999, -99999, 1, 1];

const WELT = {
  modus: 'auto', phase: 'mittag', stunde: 12, minute: 30, wtag: 3,
  test: {}, hoerer: {}, zuletzt: {}, halt: {}, runde: 0,
  /* Ereignisbus: Räume und Figur melden etwas, andere reagieren darauf */
  on(ev, fn) { (this.hoerer[ev] = this.hoerer[ev] || []).push(fn); },
  emit(ev, daten) { this.zuletzt[ev] = performance.now(); (this.hoerer[ev] || []).forEach(fn => fn(daten)); state.dirty = true; },
  seit(ev) { return this.zuletzt[ev] == null ? Infinity : (performance.now() - this.zuletzt[ev]) / 1000; },
};
(() => {
  const q = new URLSearchParams(location.search);
  if (PHASEN.includes(q.get('phase'))) WELT.modus = q.get('phase');
  if (q.has('stunde')) WELT.test.stunde = clamp(parseInt(q.get('stunde'), 10) || 0, 0, 23);
  const tage = { so: 0, mo: 1, di: 2, mi: 3, do: 4, fr: 5, sa: 6 };
  if (q.get('tag') in tage) WELT.test.wtag = tage[q.get('tag')];
})();
function weltUhr() {
  const d = new Date(), t = WELT.test;
  WELT.stunde = t.stunde != null ? t.stunde : d.getHours();
  WELT.minute = t.stunde != null ? 30 : d.getMinutes();
  WELT.wtag = t.wtag != null ? t.wtag : d.getDay();
  const p = WELT.modus === 'auto' ? phaseVon(WELT.stunde) : WELT.modus;
  if (p !== WELT.phase) { WELT.phase = p; state.phase = p; WELT.emit('phase', p); }
  state.dirty = true;
}
const istDunkel = () => WELT.phase === 'abend' || WELT.phase === 'nacht';
const istNacht = () => WELT.phase === 'nacht';
function setTageszeit(m) {
  WELT.modus = m; weltUhr();
  const b = document.getElementById('tageszeit');
  if (b) b.textContent = 'Zeit: ' + (m === 'auto' ? 'Uhr · ' + PHASE_NAME[WELT.phase] : PHASE_NAME[m]);
}
// alte Fassung kannte „Abend“ als Wetter; die Tour ruft das noch so auf
function setWetter(w) {
  WELT.gewitter = w === 'gewitter';
  if (w === 'abend') { state.wetter = 'sonne'; setTageszeit('abend'); }
  else state.wetter = w === 'gewitter' ? 'regen' : w;
  if (WELT.gewitter) WELT.emit('ticker', 'Gewitter! Drohnen bleiben am Boden, die Windräder halten an, und im Gebirge wird die Sprengung verschoben.');
  const b = document.getElementById('wetter'); if (b) b.textContent = 'Wetter: ' + (WETTER_NAMEN[WELT.gewitter ? 'gewitter' : state.wetter] || 'Sonne');
  state.dirty = true;
}

/* ---------- Himmel je Tageszeit (engine.js fragt hier nach) ---------- */
function himmelFarben() {
  const w = state.wetter;
  if (w !== 'sonne' && istDunkel()) return istNacht() ? ['#141a26', '#232c38', '#3c4146'] : ['#2a3248', '#4a4f66', '#7c6f6a'];
  if (w === 'regen' && WELT.gewitter) return ['#4b5660', '#69757c', '#8f918c'];
  if (w === 'regen') return ['#6f7f86', '#8f9ca0', '#b3b1a8'];
  if (w === 'wolken') return ['#93a6af', '#bcc8cb', '#ddd9cf'];
  if (w === 'nebel') return ['#b4babb', '#c9cdcc', '#d8d7d1'];
  if (w === 'schnee') return ['#a6b1b8', '#c9d1d4', '#e6e8e5'];
  return { morgen: ['#7d8db4', '#e3a98c', '#f2d4a8'], mittag: ['#8fb1bd', '#bfd2d4', '#e3dccb'], abend: ['#131b36', '#3a3d63', '#b8705a'], nacht: ['#060a1a', '#11173a', '#262a4e'] }[WELT.phase];
}
function silhouetteFarbe() { return istNacht() ? '#1d2440' : WELT.phase === 'abend' ? '#3b4566' : state.wetter === 'nebel' ? '#c3c8c7' : state.wetter !== 'sonne' ? '#8b989c' : WELT.phase === 'morgen' ? '#a7a5b8' : '#9eb6bb'; }
function aussenSchatten() { return { morgen: 'rgba(255,150,80,0.08)', mittag: null, abend: 'rgba(12,18,48,0.45)', nacht: 'rgba(4,8,26,0.62)' }[WELT.phase]; }
function himmelExtras() {
  if (typeof fernsicht === 'function') fernsicht();
  wolken();
  if (istDunkel()) {
    ctx.fillStyle = '#f3efe4';
    const n = istNacht() ? 260 : 160;
    for (let i = 0; i < n; i++) { const x = ((i * 733) % 30000) - 10000, y = TOP - 680 + ((i * 397) % 1500); ctx.fillRect(x, y, 3, 3); }
  }
  if (istNacht() && state.wetter !== 'regen') {
    // Mond: Sichel als Kreis mit verschobenem Himmelskreis darüber
    const mx = BW + 300, my = TOP - 640;
    circle(mx, my, 46, '#efe9d6', null);
    circle(mx + 20, my - 10, 42, '#0b1029', null);
  }
  if (WELT.phase === 'morgen' && state.wetter !== 'regen') { glow(-700, GROUND - 260, 260, 'rgba(255,214,150,0.75)'); circle(-700, GROUND - 260, 40, '#ffd79a', null); }
}

/* ---------- Wetter: Wolken, Nebel, Schnee (engine.js ruft wetterEffekte nach dem Zeichnen) ---------- */
const WETTER_NAMEN = { sonne: 'Sonne', wolken: 'Wolken', regen: 'Regen', gewitter: 'Gewitter', nebel: 'Nebel', schnee: 'Schnee' };
const schlechtesWetter = () => ['regen', 'schnee', 'nebel'].includes(state.wetter);
function wolke(x, y, s, farbe) {
  ctx.fillStyle = farbe; ctx.beginPath();
  for (const [dx, dy, r] of [[0, 0, 60], [70, -24, 70], [150, -6, 58], [210, 12, 44], [-60, 14, 42], [90, 20, 56]]) { ctx.moveTo(x + (dx + r) * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU); }
  ctx.fill();
}
function wolken() {
  const w = state.wetter, n = { sonne: 11, wolken: 46, regen: 52, schnee: 50, nebel: 20 }[w] || 11;
  const farbe = istNacht() ? 'rgba(60,66,86,0.75)' : istDunkel() ? 'rgba(120,110,130,0.7)' : w === 'regen' ? 'rgba(130,140,146,0.9)' : w === 'schnee' ? 'rgba(220,226,230,0.9)' : 'rgba(246,246,242,0.85)';
  for (let i = 0; i < n; i++) {
    const breite = 32000, x = ((i * 2311 + state.g * (1.2 + (i % 3) * 0.4) + WELT.runde * 480 * (1.2 + (i % 3) * 0.4)) % breite) - 10000;
    wolke(x, TOP - 760 + ((i * 397) % 900), 0.9 + (i % 4) * 0.35, farbe);
  }
}
function draussenClip(x0, y0, x1, y1, bisY) {
  ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, Math.max(0, bisY - y0));
  for (const h of HOUSES) ctx.rect(h.x, h.y, h.w, h.h);
  ctx.clip('evenodd');
}
function wetterEffekte(x0, y0, x1, y1) {
  const w = state.wetter;
  if (w === 'schnee') {
    // Flocken in drei Tiefen: hinten klein und langsam, vorn groß, manche als Kristall; leichter Wind von links
    ctx.save(); draussenClip(x0, y0, x1, y1, GROUND + 4);
    const zf = Math.min(1, state.z), t = state.g;
    for (const [st, r, v, a, wind] of [[64, 1.4, 0.8, 0.5, 0.15], [50, 2.4, 1.5, 0.8, 0.25], [96, 3.8, 2.6, 0.95, 0.4]]) {
      const step = st / zf; ctx.fillStyle = `rgba(250,251,253,${a})`; ctx.strokeStyle = `rgba(250,251,253,${a})`; ctx.lineWidth = 1.2 / zf;
      for (let x = Math.floor(x0 / step) * step - step; x < x1; x += step) for (let y = Math.floor(Math.max(y0, -4000) / step) * step; y < Math.min(y1, GROUND); y += step) {
        const k = Math.abs(x * 7 + y * 13 + st) % 97, yy = y + ((t * v + k * 5) % step), xx = x + (k % 30) + Math.sin((yy + k * 3) / 40) * 9 + (yy - y) * wind;
        const rr = r * (0.7 + (k % 5) / 8) / zf;
        if (r > 3 && k % 3 === 0) { ctx.beginPath(); for (let j = 0; j < 3; j++) { const an = j * Math.PI / 3 + k; ctx.moveTo(xx - rr * 1.6 * Math.cos(an), yy - rr * 1.6 * Math.sin(an)); ctx.lineTo(xx + rr * 1.6 * Math.cos(an), yy + rr * 1.6 * Math.sin(an)); } ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(xx, yy, rr, 0, TAU); ctx.fill(); }
      }
    }
    ctx.restore();
    // Schneedecke mit welliger Oberkante und bläulichem Schatten, Verwehungen an den Hauswänden
    ctx.save(); draussenClip(x0, y0, x1, y1, GROUND);
    const kante = x => GROUND - 9 - 3 * Math.sin(x / 97) - 2 * Math.sin(x / 31);
    ctx.beginPath(); ctx.moveTo(x0, GROUND); for (let x = Math.floor(x0 / 40) * 40; x <= x1 + 40; x += 40) ctx.lineTo(x, kante(x)); ctx.lineTo(x1 + 40, GROUND); ctx.closePath();
    ctx.fillStyle = '#f4f6f6'; ctx.fill();
    ctx.strokeStyle = 'rgba(160,180,205,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = Math.floor(x0 / 40) * 40; x <= x1 + 40; x += 40) ctx.lineTo(x, kante(x) + 5); ctx.stroke();
    ctx.fillStyle = '#f4f6f6';
    for (const h of HOUSES) for (const [xa, xb] of [[h.x - 46, h.x], [h.x + h.w + 46, h.x + h.w]]) { ctx.beginPath(); ctx.moveTo(xa, GROUND - 6); ctx.quadraticCurveTo(xb, GROUND - 8, xb, GROUND - 30); ctx.lineTo(xb, GROUND); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = '#f4f6f6';
    for (const o of ROOMS) if (o.outdoor && o.r === 6 && isOpen(o) && !o.berg && !o.wasser) ctx.fillRect(rx(o.c), ry(6) + 380, RW, 6);
    // Dächer: Schneekappe mit Überhang und Eiszapfen
    HOUSES.forEach((h, i) => {
      const y = h.y + ([126, 106, 46, 56, 46][i] ?? 46);
      ctx.beginPath(); ctx.moveTo(h.x - 2, y + 8); ctx.quadraticCurveTo(h.x - 6, y - 4, h.x + 14, y - 6); ctx.lineTo(h.x + h.w - 14, y - 6); ctx.quadraticCurveTo(h.x + h.w + 6, y - 4, h.x + h.w + 2, y + 8); ctx.closePath();
      ctx.fillStyle = '#f4f6f6'; ctx.fill(); ctx.strokeStyle = 'rgba(160,180,205,0.7)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = 'rgba(214,234,246,0.95)';
      for (let x = h.x + 10; x < h.x + h.w - 10; x += 34) { const l = 8 + ((x * 13) % 11); ctx.beginPath(); ctx.moveTo(x - 3, y + 6); ctx.lineTo(x, y + 6 + l); ctx.lineTo(x + 3, y + 6); ctx.closePath(); ctx.fill(); }
    });
    // Schneemann in der ersten breiten Lücke (Gag)
    const lu = typeof UG_LUECKEN !== 'undefined' && UG_LUECKEN && UG_LUECKEN.find(([a, b]) => b - a > 160);
    if (lu) {
      const x = lu[0] + 70;
      circle(x, GROUND - 28, 26, '#f7f8f8', INK, 1.5); circle(x, GROUND - 70, 19, '#f7f8f8', INK, 1.5); circle(x, GROUND - 102, 14, '#f7f8f8', INK, 1.5);
      ctx.beginPath(); ctx.moveTo(x + 4, GROUND - 102); ctx.lineTo(x + 20, GROUND - 99); ctx.lineTo(x + 4, GROUND - 98); ctx.closePath(); ctx.fillStyle = '#e0662b'; ctx.fill();
      circle(x - 4, GROUND - 106, 2, INK, null); circle(x + 5, GROUND - 107, 2, INK, null); for (const yy of [-78, -66, -54]) circle(x, GROUND + yy, 2, INK, null);
      box(x - 11, GROUND - 126, 22, 12, '#3b3d40', 1, 1.2); box(x - 15, GROUND - 116, 30, 4, '#3b3d40', 1, 1);
      line(x - 18, GROUND - 74, x - 40, GROUND - 92, '#6b5a48', 3); line(x + 18, GROUND - 74, x + 38, GROUND - 90, '#6b5a48', 3);
    }
    shadeOutside(x0, y0, x1, y1, 'rgba(230,236,240,0.12)');
  }
  if (WELT.gewitter && state.wetter === 'regen') {
    // Blitz: kurz hell, Zickzack vom Himmel; zweimal pro Minute an anderer Stelle
    const t = state.g % 240, ein = t < 5 || (t > 9 && t < 12);
    if (ein) {
      shadeOutside(x0, y0, x1, y1, 'rgba(255,255,240,0.28)');
      const bx = x0 + (x1 - x0) * (0.25 + 0.5 * ((Math.floor(state.g / 240) * 0.37 + WELT.runde * 0.21) % 1));
      ctx.strokeStyle = 'rgba(255,252,220,0.95)'; ctx.lineWidth = 4 / Math.min(1, state.z); ctx.beginPath(); ctx.moveTo(bx, Math.max(y0, -2000));
      let x = bx; for (let y = Math.max(y0, -2000); y < GROUND - 200; y += 120) { x += ((y * 7) % 90) - 45; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }
  if (w === 'nebel') {
    shadeOutside(x0, y0, x1, y1, istDunkel() ? 'rgba(90,96,110,0.4)' : 'rgba(226,229,227,0.5)');
    ctx.save(); draussenClip(x0, y0, x1, y1, GROUND);
    const gr = ctx.createLinearGradient(0, GROUND - 420, 0, GROUND); gr.addColorStop(0, 'rgba(235,237,235,0)'); gr.addColorStop(1, istDunkel() ? 'rgba(110,116,128,0.5)' : 'rgba(235,237,235,0.6)');
    ctx.fillStyle = gr; ctx.fillRect(x0, GROUND - 420, x1 - x0, 420); ctx.restore();
  }
  if (w === 'wolken') shadeOutside(x0, y0, x1, y1, 'rgba(60,70,80,0.06)');
}

/* ---------- Räume je Tageszeit ---------- */
// Räume, die zu bestimmten Zeiten geschlossen sind: Menschen gehen heim, Roboter laden
const ZU = {
  kantine: ['nacht'], supermarkt: ['nacht'], museum: ['abend', 'nacht'], sport: ['nacht'], film: ['nacht'],
  schule: ['nacht'], klasse2: ['abend', 'nacht'], info: ['abend', 'nacht'], robotik: ['nacht'], imbiss: ['nacht'],
};
// Figuren, die nur zu bestimmten Zeiten unterwegs sind
const NUR = { klasse: ['morgen', 'mittag'] };
// Räume mit Rundumleuchte für den Schichtwechsel
const SIGNAL = new Set(['fertigung', 'lager', 'pruef', 'garage', 'recycling', 'hafen', 'montage', 'dunkel']);
const istZu = key => !!(ZU[key] && ZU[key].includes(WELT.phase));
WELT.versteckt = id => {
  const r = typeof byId !== 'undefined' ? byId[id] : ROBOTS.find(o => o.id === id);
  if (!r) return false;
  if (NUR[id] && !NUR[id].includes(WELT.phase)) return true;
  return istZu(r.room) && (r.bereich === 'Mensch' || r.bereich === 'Tier');
};
const schichtwechsel = () => (WELT.modus === 'auto' && WELT.test.stunde == null && WELT.minute < 1) || WELT.seit('schichtwechsel') < 5;
const mittagspause = () => WELT.stunde === 12 && (WELT.modus === 'auto' || WELT.modus === 'mittag');
function raumBild(key, f) {
  const h = WELT.halt[key];
  if (h && performance.now() < h.bis) return h.f;
  return istZu(key) ? 0 : f;
}
function schild(t, x, y, farbe = '#2a2723', schrift = '#f3efe4') {
  ctx.font = '500 12px "IBM Plex Mono", monospace';
  const w = ctx.measureText(t).width + 18;
  box(x - w / 2, y, w, 22, farbe, 0, 1.5);
  text(t, x, y + 15, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: schrift });
}
function ladeZeichen(x, y) {
  const an = state.g % 24 < 14;
  box(x - 9, y - 9, 18, 18, '#23384d', 0, 1.5);
  ctx.beginPath(); ctx.moveTo(x + 2, y - 7); ctx.lineTo(x - 4, y + 1); ctx.lineTo(x, y + 1); ctx.lineTo(x - 2, y + 7); ctx.lineTo(x + 4, y - 1); ctx.lineTo(x, y - 1); ctx.closePath();
  ctx.fillStyle = an ? '#7fe08a' : '#2d5b33'; ctx.fill();
}
function rundumleuchte(x, y) {
  const a = TAU * state.g / 10;
  ctx.save(); ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 90, a - 0.25, a + 0.25); ctx.closePath(); ctx.fill();
  ctx.restore();
  box(x - 10, y + 6, 20, 6, '#3b3d40', 0, 1.5);
  ctx.beginPath(); ctx.arc(x, y + 6, 10, Math.PI, 0); paint('#f08a24', INK, 1.5);
}
function raumOverlay(def, room) {
  const key = def.key, aussen = room.outdoor;
  if (!aussen) {
    if (istNacht()) { ctx.fillStyle = istZu(key) ? 'rgba(12,18,44,0.5)' : 'rgba(12,18,44,0.16)'; ctx.fillRect(0, 0, RW, RH); }
    else if (WELT.phase === 'abend' && istZu(key)) { ctx.fillStyle = 'rgba(12,18,44,0.32)'; ctx.fillRect(0, 0, RW, RH); }
    else if (WELT.phase === 'morgen') { ctx.fillStyle = 'rgba(255,190,120,0.06)'; ctx.fillRect(0, 0, RW, RH); }
  }
  if (istZu(key)) {
    const ox = rx(room.c), oy = ry(room.r);
    def.robots.forEach(r => {
      if (r.bereich === 'Mensch' || r.bereich === 'Tier' || r.bereich === 'Geschichte') return;
      const [x, y, w] = r.box(0); if (x < -9000) return;
      ladeZeichen(x - ox + w - 4, y - oy - 4);
    });
    schild('GESCHLOSSEN · ROBOTER LADEN', RW / 2, 10);
  }
  if (key === 'apotheke' && istNacht()) schild('NOTDIENST', RW / 2, 10, '#d9342b');
  if (key === 'kranken' && istNacht()) schild('NACHTSCHICHT', RW / 2, 10, '#23384d');
  if (key === 'fertigung' && mittagspause()) schild('MITTAGSPAUSE · DIE ROBOTER ARBEITEN DURCH', RW / 2, 10, '#f0b429', INK);
  if (key === 'eingang' && WELT.wtag === 5 && WELT.stunde >= 15 && WELT.stunde < 22) schild('SCHÖNES WOCHENENDE! (DIE ROBOTER BLEIBEN DA)', RW / 2, 10, '#f0b429', INK);
  if (SIGNAL.has(key) && schichtwechsel()) { rundumleuchte(RW - 40, 14); if (key === 'fertigung') schild('SCHICHTWECHSEL', RW / 2, 40, '#f08a24', INK); }
  const h = WELT.halt[key];
  if (h && performance.now() < h.bis) { ctx.fillStyle = 'rgba(240,180,41,0.12)'; ctx.fillRect(0, 0, RW, RH); schild(h.grund || 'NOT-HALT · ALLE ROBOTER STEHEN', RW / 2, 64, '#f0b429', INK); }
  reaktionen(key);
}
// draw und Klickflächen aller Räume einhüllen
for (const def of BUILT) {
  const room = roomOf(def.key); if (!room) continue;
  const d = def.draw;
  def.draw = f => { d(raumBild(def.key, f)); raumOverlay(def, room); };
  def.robots.forEach(r => { const b = r.box; r.box = f => (WELT.versteckt(r.id) ? W_AUS : b(raumBild(def.key, f))); });
}
RUNNERS.forEach(r => { const b = r.robot.box; r.robot.box = (...a) => (WELT.versteckt(r.robot.id) ? W_AUS : b(...a)); });
// versteckte Figuren werden nicht gezeichnet
const _withAlpha = withAlpha;
withAlpha = (id, fn) => { if (WELT.versteckt(id)) return; _withAlpha(id, fn); };

/* ---------- Reaktionen zwischen Räumen (über den Ereignisbus) ---------- */
WELT.on('geliefert', id => { WELT.zuletzt['geliefert:' + id] = performance.now(); });
// Not-Halt in der Fertigung: das Lager darunter bekommt keine Teile mehr und hält kurz danach ebenfalls an
WELT.on('nothalt', key => {
  const jetzt = performance.now();
  WELT.halt[key] = { bis: jetzt + 4000, f: state.f };
  if (key === 'fertigung') setTimeout(() => { WELT.halt.lager = { bis: performance.now() + 3500, f: state.f, grund: 'FERTIGUNG STEHT · LAGER WARTET AUF TEILE' }; state.dirty = true; }, 700);
});
function reaktionen(key) {
  if (typeof stoerungZeigen === 'function') stoerungZeigen(key);
  // Prüfstand testet das gelieferte Bauteil
  const s = WELT.seit('geliefert:teil');
  if (key === 'pruef' && s < 10) schild(s < 5 ? 'NEUES BAUTEIL · PRÜFUNG LÄUFT ' + '▮'.repeat(1 + Math.floor(s * 2) % 6) : 'BAUTEIL GEPRÜFT · IN ORDNUNG ✓', RW / 2, 40, s < 5 ? '#23384d' : '#2e7d32');
  // Lichtschalter in der Dunklen Fabrik: die Leitwarte sieht den Stromverbrauch
  const l = WELT.seit('licht');
  if (key === 'rz2' && l < 8) schild(state.licht ? 'HALLE 103: LICHT AN · ETWA +40 KW' : 'HALLE 103: LICHT AUS · STROM GESPART', RW / 2, 40, state.licht ? '#f0b429' : '#2e7d32', state.licht ? INK : '#f3efe4');
  // Notdienst: nachts fordert die Krankenstation ein Medikament an, die Apotheke schickt es per Rohrpost
  if (istNacht()) {
    const g = state.g;
    if (key === 'kranken' && g >= 150 && g < 250) schild('ANFORDERUNG AN DIE APOTHEKE', 518, 66, '#d9342b');
    if (key === 'apotheke' && g >= 190 && g < 260) schild('NOTFALL-SENDUNG PER ROHRPOST', RW / 2, 62, '#2a2723');
  }
}

/* ---------- Nachtstreife: Sicherheitsroboter zwischen Halle 103 und Rechenzentrum ---------- */
const K5_A = rx(6.5) + RW + WALL + 56, K5_B = rx(8) - WALL - 50, K5_FOOT = GROUND - 2;
function k5Pos(g) {
  if (!istNacht()) return { x: K5_B, dir: -1, dock: true };
  const t = (g % 480) / 480, s = 0.5 - 0.5 * Math.cos(TAU * t);
  return { x: lerp(K5_B, K5_A, s), dir: t < 0.5 ? -1 : 1 };
}
function drawK5(x, foot, dir, g) {
  // Ladeplatte
  box(K5_B - 40, foot - 4, 80, 6, '#5d6064', 0, 1.5);
  const H = 110;
  // Rumpf: unten breit, oben schmal (Ei-Form), weiß
  ctx.beginPath();
  ctx.moveTo(x - 30, foot - 10);
  ctx.quadraticCurveTo(x - 32, foot - 70, x - 18, foot - H + 8);
  ctx.quadraticCurveTo(x, foot - H - 4, x + 18, foot - H + 8);
  ctx.quadraticCurveTo(x + 32, foot - 70, x + 30, foot - 10);
  ctx.closePath(); paint('#e9e7e1');
  // dunkles Band mit Kameras (rundum)
  box(x - 22, foot - 88, 44, 16, '#2a2f38', 0, 1.5);
  for (const dx of [-14, -4, 6, 16]) circle(x + dx * dir - (dir < 0 ? 2 : 0), foot - 80, 3, '#7fd3ff', null);
  // Lichtring oben
  const an = g % 12 < 6;
  box(x - 12, foot - H + 2, 24, 6, an ? '#5aa8ff' : '#23384d', 0, 1.2);
  // Schürze und Räder
  box(x - 31, foot - 18, 62, 12, '#3b3d40', 0, 1.5);
  for (const dx of [-20, 20]) circle(x + dx, foot - 6, 7, '#2a2723', INK, 1.5);
  // Lidar-Schlitz
  line(x - 18, foot - 30, x + 18, foot - 30, '#23384d', 3);
}
registerRunner({
  room: 'rz1',
  draw(g) { withAlpha('k5', () => { const p = k5Pos(g); drawK5(p.x, K5_FOOT, p.dir, g); if (p.dock) { const an = g % 30 < 18; circle(K5_B + 34, K5_FOOT - 12, 4, an ? '#7fe08a' : '#2d5b33', INK, 1); } }); },
  glow(g) { if (!istNacht()) return; const p = k5Pos(g); glow(p.x, K5_FOOT - 105, 40, 'rgba(90,168,255,0.55)'); glow(p.x + 60 * p.dir, K5_FOOT - 40, 60, 'rgba(255,240,200,0.25)'); },
  robot: {
    id: 'k5', name: 'Sicherheitsroboter', bereich: 'Inspektion', aera: 'seit 2013', typ: 'Streifenroboter auf vier Rädern', color: '#e9e7e1',
    fakt: 'Vorbild ist der K5 von Knightscope aus Kalifornien (seit 2013): etwa 1,6 m hoch, rund 180 kg schwer, höchstens knapp 5 km/h schnell. Er filmt rundum, tastet die Umgebung mit Lidar ab und meldet Auffälliges an Menschen in einer Leitstelle.',
    echt: 'Echt: Solche Roboter fahren nachts Streife auf Parkplätzen und Firmengeländen. Festhalten oder eingreifen können sie nicht, sie beobachten nur und melden.',
    note: 'Tagsüber steht er an seiner Ladeplatte. Nachts fährt er am Funkmast hin und her, und der Mast läuft nie weg.',
    quelle: 'https://robotsguide.com/robots/k5',
    box: g => { const p = k5Pos(state.g); return [p.x - 32, K5_FOOT - 112, 64, 112]; },
  },
});
if (typeof KINDER !== 'undefined') KINDER.k5 = 'Dieser Roboter passt nachts auf das Rechenzentrum auf. Er hat ringsum Kameras und sagt Menschen Bescheid, wenn ihm etwas komisch vorkommt.';

/* ---------- Start und Uhr ---------- */
weltUhr(); state.phase = WELT.phase;
// lange Uhr: zählt, wie oft state.g von 479 auf 0 gesprungen ist (für Abläufe über mehrere Runden)
(function weltRunde(last) { if (state.g < last - 200) WELT.runde++; requestAnimationFrame(() => weltRunde(state.g)); })(0);
const langeUhr = n => (WELT.runde % n) * 480 + state.g;
setInterval(() => { weltUhr(); if (WELT.modus === 'auto') setTageszeit('auto'); }, 30000);
const tageszeitBtn = document.getElementById('tageszeit');
if (tageszeitBtn) tageszeitBtn.addEventListener('click', () => {
  const folge = ['auto', ...PHASEN];
  setTageszeit(folge[(folge.indexOf(WELT.modus) + 1) % folge.length]);
});
setTageszeit(WELT.modus);
