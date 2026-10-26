/* RoboWorld 101 – Rundgang-Vierbeiner: läuft auf eigene Faust durch die ganze Welt.
   Sucht sich Ziele selbst aus, inspiziert, sitzt mal, lädt an seiner Station, grüßt R-101.
   Nutzt die Wege aus avatar.js (avSegOf, avHatAufzug, AV_DOOR, avFloor). Lädt nach avatar.js, vor engine.js.
   Bewusst nicht als Schleife: er hat ein Eigenleben (Zufall), sein Weg ist bei jedem Besuch anders. */
'use strict';
const WD_DOCK = { r: 6, x: rx(0) + 150 };
const WD = { row: 6, x: WD_DOCK.x, y: ry(6) + 360, dir: 1, plan: [], lift: null, blend: null, akku: 0.9, sitz: 1, schritt: 0, kopf: 0, blase: null, gruss: -1e9 };
const WD_SAG = ['Wärmebild: alles normal.', 'Lese das Manometer: 2,4 bar.', 'Horche auf Lecks … nichts.', 'Kartiere den Raum.', 'Foto für die Leitwarte.', 'Gasmessung: in Ordnung.', 'Ventil steht auf AUF.', 'Temperatur: 21 °C.'];
const WD_RAUM = {
  museum: 'Ins Museum will ich noch nicht.', kantine: 'Ich esse nichts. Ich lade.', sport: 'Treppen sind mein Sport.',
  tiefsee: 'Wasser? Lieber nicht.', lernen: 'Der auf dem Laufband übt noch.', bergwerk: 'Unter Tage bin ich oft im Einsatz.',
  garage: 'Vier Beine, keine Räder.', rz1: 'Server warm, aber in Ordnung.', dunkel: 'Ohne Licht sehen meine Kameras wenig.',
  feld: 'Matsch an den Füßen. Gut, dass ich wasserdicht bin.', hafen: 'Ich laufe nicht über die Kante.',
};
const wdZufall = a => a[Math.floor(Math.random() * a.length)];

/* ---------- Wege ---------- */
function wdWeg(r, x) {
  const ziel = avSegOf(r, x); if (!ziel) return null;
  x = clamp(x, ziel[0], ziel[1]);
  const hier = avSegOf(WD.row, WD.x);
  if (r === WD.row && hier && x >= hier[0] && x <= hier[1]) return [{ t: 'gehe', x }];
  const tuer = s => s && s[0] <= AV_DOOR && s[1] >= AV_DOOR;
  if (avHatAufzug(WD.row) && avHatAufzug(r) && tuer(hier) && tuer(ziel)) return [{ t: 'gehe', x: AV_DOOR - 30 }, { t: 'lift', r }, { t: 'gehe', x }];
  return null;
}
const WD_ZIELE = () => ROOMS.filter(o => isOpen(o) && !o.secret && !o.mond && avSegOf(o.r, rx(o.c) + RW / 2));

/* ---------- Aufzug (wartet, wenn R-101 ihn gerade braucht) ---------- */
const _cabinY2 = cabinY;
cabinY = g => {
  if (WD.lift) return WD.lift.y;
  if (WD.blend) return lerp(WD.blend.y, _cabinY2(g), ease(clamp(WD.blend.t, 0, 1)));
  return _cabinY2(g);
};
function wdLift(s, dt) {
  if (!WD.lift && (AV.lift || AV.blend)) return;                  // R-101 fährt gerade
  const L = WD.lift || (WD.lift = { ph: 'ruf', y: _cabinY2(state.g) });
  const zu = (y, v) => { const d = y - L.y; if (Math.abs(d) <= v * dt) { L.y = y; return true; } L.y += Math.sign(d) * v * dt; return false; };
  if (L.ph === 'ruf') { if (zu(avKabine(WD.row), 900)) L.ph = 'rein'; }
  else if (L.ph === 'rein') { if (wdFahr(SHAFT_X + SHAFT / 2, dt, 110)) L.ph = 'fahrt'; }
  else if (L.ph === 'fahrt') { if (zu(avKabine(s.r), 500)) { WD.row = s.r; L.ph = 'raus'; } }
  else if (L.ph === 'raus') { if (wdFahr(AV_DOOR - 30, dt, 110)) { WD.blend = { y: L.y, t: 0 }; WD.lift = null; WD.plan.shift(); } }
  if (WD.lift && L.ph !== 'ruf') WD.y = L.y + CAB_H - 8;
}

/* ---------- Eigenleben ---------- */
function wdFahr(x, dt, v) {
  const d = x - WD.x, sp = v || (Math.abs(d) > 1200 ? 300 : 120);   // in echt bis 1,6 m/s, also etwa 110
  if (Math.abs(d) <= sp * dt) { WD.schritt += Math.abs(d); WD.x = x; return true; }
  WD.dir = Math.sign(d); WD.x += WD.dir * sp * dt; WD.schritt += sp * dt; return false;
}
function wdSag(t, s = 3) { WD.blase = { t, bis: performance.now() + s * 1000 }; state.dirty = true; }
function wdNeueAufgabe() {
  // Akku leer: zur Ladestation, hinsetzen, laden
  if (WD.akku < 0.25) {
    const w = wdWeg(WD_DOCK.r, WD_DOCK.x);
    if (w) { WD.plan = w.concat([{ t: 'tu', fn: () => wdSag('Akku schwach. Ich lade kurz.') }, { t: 'sitz', z: 1 }, { t: 'laden' }, { t: 'sitz', z: 0 }]); return; }
  }
  // R-101 begrüßen, wenn er in der Nähe ist
  if (AV.an && performance.now() - WD.gruss > 60000 && Math.random() < 0.35) {
    const w = wdWeg(AV.row, AV.x - 80 * AV.dir);
    if (w && Math.abs(AV.x - WD.x) < 3000) { WD.gruss = performance.now(); WD.plan = w.concat([{ t: 'tu', fn: () => wdSag('Hallo R-101! Alles in Ordnung bei dir?') }, { t: 'warte', s: 3 }]); return; }
  }
  // sonst: einen Raum aussuchen und dort etwas inspizieren
  const o = wdZufall(WD_ZIELE());
  const w = o && wdWeg(o.r, rx(o.c) + 110 + Math.random() * 420);
  if (!w) { WD.plan = [{ t: 'warte', s: 1 }]; return; }
  const text = WD_RAUM[o.built] && Math.random() < 0.6 ? WD_RAUM[o.built] : wdZufall(WD_SAG);
  WD.plan = w.concat([{ t: 'schau', s: 2.5 + Math.random() * 3 }, { t: 'tu', fn: () => wdSag(text) }, { t: 'warte', s: 2 }]);
  if (Math.random() < 0.2) WD.plan.push({ t: 'sitz', z: 1 }, { t: 'warte', s: 3 }, { t: 'sitz', z: 0 });
}
function wdSchritt(dt) {
  const s = WD.plan[0];
  if (!s) { wdNeueAufgabe(); return; }
  if (s.t === 'gehe') { if (WD.sitz > 0) WD.sitz = Math.max(0, WD.sitz - dt * 2); else if (wdFahr(s.x, dt)) WD.plan.shift(); }
  else if (s.t === 'lift') wdLift(s, dt);
  else if (s.t === 'schau') { WD.kopf = Math.sin(performance.now() / 400) * 0.6; s.s -= dt; if (s.s <= 0) { WD.kopf = 0; WD.plan.shift(); } }
  else if (s.t === 'warte') { s.s -= dt; if (s.s <= 0) WD.plan.shift(); }
  else if (s.t === 'sitz') { const d = s.z - WD.sitz; if (Math.abs(d) < dt * 2) { WD.sitz = s.z; WD.plan.shift(); } else WD.sitz += Math.sign(d) * dt * 2; }
  else if (s.t === 'laden') { WD.akku = Math.min(1, WD.akku + dt / 10); if (WD.akku >= 1) WD.plan.shift(); }
  else if (s.t === 'tu') { WD.plan.shift(); s.fn(); }
}

/* ---------- Zeichnen ---------- */
function wdBein(hx, hy, fx, fy, d, farbe) {
  // Kniegelenk zeigt nach hinten (wie beim Vorbild)
  const kx = (hx + fx) / 2 - d * 9, ky = (hy + fy) / 2 - 2;
  limb(hx, hy, kx, ky, 5, farbe); limb(kx, ky, fx, fy, 4, farbe);
  circle(fx, fy - 1, 2.5, '#2a2723', null);
}
function wdFigur(x, foot, d) {
  const s = WD.sitz, geht = WD.plan[0] && WD.plan[0].t === 'gehe' && s === 0;
  const hh = lerp(38, 14, s);                          // Hüfthöhe: stehend etwa 0,55 m
  const p = WD.schritt / 9;
  // Ladestation
  box(WD_DOCK.x - 40, ry(6) + 354, 80, 6, '#5d6064', 0, 1.5);
  circle(WD_DOCK.x + 34, ry(6) + 348, 3.5, WD.plan[0] && WD.plan[0].t === 'laden' && state.g % 12 < 6 ? '#7fe08a' : '#2d5b33', INK, 1);
  // Türöffnungen, durch die er gerade läuft
  for (const o of ROOMS) if (o.r === WD.row && isOpen(o)) for (const wx of [rx(o.c) - WALL, rx(o.c) + RW]) if (Math.abs(wx + WALL / 2 - x) < 50) { ctx.fillStyle = '#3b3d40'; ctx.fillRect(wx, ry(WD.row) + 360 - 70, WALL, 70); }
  const hinten = x - d * 26, vorn = x + d * 26, hy = foot - hh;
  // ferne Beine (dunkler), dann nahe Beine
  for (const [hx, off, farbe] of [[hinten, 0, '#2a2723'], [vorn, Math.PI, '#2a2723'], [hinten, Math.PI, '#4a4d52'], [vorn, 0, '#4a4d52']]) {
    const sw = geht ? Math.sin(p + off) * 10 : 0, lift = geht ? Math.max(0, Math.cos(p + off)) * 6 : 0;
    const fx = s > 0.5 ? hx - d * lerp(0, 14, s) : hx + d * sw;
    wdBein(hx, hy, fx, foot - lift, d, farbe);
  }
  // Rumpf: gelb mit dunklen Seitenteilen, vorne Sensorkopf mit Kameras
  ctx.save(); ctx.translate(x, hy - 8); ctx.rotate(lerp(0, -0.12 * d, s));
  box(-38, -10, 76, 18, '#f0b429', 6, 2);
  box(-26, -6, 52, 10, '#3b3d40', 2, 1.2);
  box(d > 0 ? 30 : -42, -8, 12, 14, '#2a2723', 3, 1.5);
  const k = WD.kopf;
  circle(d * (36 + k * 2), -2, 2, '#7fd3ff', null); circle(d * (36 + k * 2), 3, 2, '#7fd3ff', null);
  ctx.restore();
}
function wdDraw() {
  withAlpha('rundgang', () => wdFigur(WD.x, WD.y, WD.dir));
  if (WD.blase && performance.now() < WD.blase.bis) avBlase(WD.x, WD.y - 70, WD.blase.t);
}

/* ---------- Karte ---------- */
registerRunner({
  room: 'eingang', draw() { wdDraw(); },
  robot: {
    id: 'rundgang', name: 'Rundgang-Vierbeiner', bereich: 'Inspektion', aera: 'seit 2020', typ: 'Laufroboter mit eigenem Kopf', color: '#f0b429',
    fakt: 'Vorbild ist Spot von Boston Dynamics (zu kaufen seit 2020): 1,1 m lang, 32,5 kg schwer, bis 1,6 m/s schnell, steigt Treppen. Fünf Stereo-Kamerapaare sehen rundum. Firmen schicken ihn auf Rundgänge, um Anzeigen abzulesen und Wärmebilder zu machen.',
    echt: 'Echt: Solche Rundgänge laufen ohne Fernsteuerung, und zum Laden legt er sich selbst auf seine Station. Ausgedacht: Er sucht sich die Ziele selbst aus und plaudert; in echt legt ein Mensch die Route fest.',
    note: 'Läuft auf eigene Faust durch die ganze Welt. Wer ihn in der Liste anklickt, dem folgt die Ansicht.',
    quelle: 'https://dev.bostondynamics.com/docs/concepts/about_spot',
    box: () => [WD.x - 40, WD.y - 60, 80, 60],
    onSelect() { WD.folgen = !AV.an; },
  },
});
if (typeof KINDER !== 'undefined') KINDER.rundgang = 'Dieser Laufroboter geht ganz allein durch die Häuser und schaut nach, ob alles in Ordnung ist. Wenn sein Akku leer wird, geht er zu seiner Ladestation.';

/* ---------- Takt ---------- */
let wdLast = null;
function wdTick(ts) {
  const dt = wdLast == null ? 0 : Math.min(0.05, (ts - wdLast) / 1000); wdLast = ts;
  if (state.playing) {
    if (WD.blend) { WD.blend.t += dt / 1.2; if (WD.blend.t >= 1) WD.blend = null; }
    const geht = WD.plan[0] && (WD.plan[0].t === 'gehe' || WD.plan[0].t === 'lift');
    WD.akku = Math.max(0, WD.akku - dt / (geht ? 300 : 800));
    wdSchritt(dt);
    if (!WD.lift || WD.lift.ph === 'ruf') { const fy = avFloor(WD.row, WD.x); WD.y += (fy - WD.y) * Math.min(1, dt * 14); }
    if (typeof byId !== 'undefined' && byId.rundgang) { const o = avRoomAt(WD.row, WD.x); byId.rundgang.room = o ? o.built : 'eingang'; }
    // nur neu zeichnen, wenn er im Bild ist und sich etwas tut
    const sx = WD.x * state.z + state.ox, sy = WD.y * state.z + state.oy;
    const sichtbar = sx > -200 && sx < canvas.clientWidth + 200 && sy > -200 && sy < canvas.clientHeight + 300;
    if (sichtbar && (WD.plan.length || WD.blase)) state.dirty = true;
    // nach dem Anklicken folgt die Ansicht ihm, bis man selbst schiebt oder etwas anderes wählt
    if (WD.folgen && state.sel === 'rundgang' && typeof panelWidth === 'function') {
      const tx = (canvas.clientWidth - panelWidth()) / 2 - WD.x * state.z, ty = canvas.clientHeight * 0.58 - (WD.y - 40) * state.z;
      state.ox += (tx - state.ox) * 0.1; state.oy += (ty - state.oy) * 0.1; state.dirty = true;
    } else WD.folgen = false;
  }
  requestAnimationFrame(wdTick);
}
requestAnimationFrame(wdTick);
canvas.addEventListener('pointerdown', () => { WD.folgen = false; });
