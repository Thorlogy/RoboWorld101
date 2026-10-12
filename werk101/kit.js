/* Werk 101 – Baukasten: Welt, Zeichenhilfen, Roboterteile, Raum-Registrierung.
   Wird vor den Räumen geladen. Alles hier ist global und von jedem Raum nutzbar. */
'use strict';
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

/* ---------- Welt ---------- */
const WALL = 16, RW = 640, RH = 400, SHAFT = 160, TOP = 360, ROWS = 9;
const BW = WALL + 3 * (RW + WALL) + SHAFT + WALL;
const rx = c => (c >= 3 ? BW + WALL + (c - 3) * (RW + WALL) : WALL + c * (RW + WALL)); // c >= 3: Außengelände rechts neben dem Haus
const ry = r => TOP + WALL + r * (RH + WALL);
const SHAFT_X = WALL + 3 * (RW + WALL);
const GROUND = ry(6) + RH + WALL / 2;
const BOTTOM = TOP + WALL + ROWS * (RH + WALL);
const LEVELS = ['Dach', 'Ebene 5', 'Ebene 4', 'Ebene 3', 'Ebene 2', 'Ebene 1', 'EG', 'UG 1', 'UG 2'];

const ROOMS = [
  { r: 0, c: 0, name: 'Drohnen-Landeplatz', built: 'drohnen' },
  { r: 0, c: 1, name: 'Satelliten-Werkstatt', built: 'satellit' },
  { r: 1, c: 0, name: 'Krankenstation', built: 'kranken' },
  { r: 1, c: 1, name: 'Labor', built: 'labor' },
  { r: 2, c: 0, name: 'Kantine', built: 'kantine' },
  { r: 2, c: 1, name: 'Wohnbereich', built: 'wohnen' },
  { r: 3, c: 0, name: 'Schule und Werkstatt', built: 'schule' },
  { r: 3, c: 1, name: 'Museum der Robotik', built: 'museum' },
  { r: 3, c: 2, name: 'Sporthalle', built: 'sport' },
  { r: 4, c: 0, name: 'Fertigungshalle', built: 'fertigung' },
  { r: 4, c: 1, name: 'Prüfstand', built: 'pruef' },
  { r: 5, c: 0, name: 'Lager', built: 'lager' },
  { r: 5, c: 1, name: 'Garage', built: 'garage' },
  { r: 6, c: 0, name: 'Eingangshalle', built: 'eingang' },
  { r: 6, c: 1, name: 'Gewächshaus und Stall', built: 'stall' },
  { r: 7, c: 0, name: 'Bergwerk und Rohre', built: 'bergwerk' },
  { r: 7, c: 1, name: 'Katastrophenschutz', built: 'kat' },
  { r: 8, c: 0, name: 'Tiefsee-Tank', built: 'tiefsee' },
  { r: 0, c: 2, name: 'Mars-Testgelände', built: 'mars' },
  { r: 1, c: 2, name: 'Apotheke', built: 'apotheke' },
  { r: 2, c: 2, name: 'Supermarkt', built: 'supermarkt' },
  { r: 4, c: 2, name: 'Filmstudio', built: 'film' },
  { r: 5, c: 2, name: 'Recyclinghof', built: 'recycling' },
  { r: 6, c: 2, name: 'Containerhafen', built: 'hafen' },
  { r: 7, c: 2, name: 'Raumstation-Training', built: 'iss' },
  { r: 8, c: 1, name: 'Bücherspeicher', built: 'buecher' },
  { r: 8, c: 2, name: 'Kellerbaustelle', built: 'baustelle' },
  { r: 6, c: -1, name: 'Straße', built: 'strasse', outdoor: true },
  { r: 6, c: -2, name: 'Park', built: 'park', outdoor: true },
  { r: 6, c: -3, name: 'Feld', built: 'feld', outdoor: true },
  { r: 6, c: -4, name: 'Energiepark', built: 'energie', outdoor: true },
  { r: 6, c: 3, name: 'Schulweg', built: 'schulweg', outdoor: true },
  { r: 7, c: 3, name: 'U-Bahnhof', built: 'ubahn', outdoor: true },
  { r: 6, c: 4, name: 'Schule: Eingangshalle', built: 'halle2', haus: 2 },
  { r: 6, c: 5, name: 'Schule: Robotik-AG', built: 'robotik', haus: 2 },
  { r: 5, c: 4, name: 'Schule: Klassenzimmer', built: 'klasse2', haus: 2 },
  { r: 5, c: 5, name: 'Schule: Informatikraum', built: 'info', haus: 2 },
  { r: 4, c: 4, name: 'Schule: Bewegungsraum', built: 'bewegung', haus: 2 },
  { r: 4, c: 5, name: 'Schule: Lehrerzimmer', built: 'lehrer', haus: 2 },
  { r: 6, c: 6.5, name: 'Dunkle Fabrik', built: 'dunkel', haus: 3 },
];
const roomOf = key => ROOMS.find(x => x.built === key);

/* ---------- Registrierung ----------
   registerRoom({ key, name, level, robots: [...], hitOrder: [ids, kleine zuerst], draw(f) })
   key muss zu einem Eintrag in ROOMS mit built: key passen. */
const BUILT = [], ROBOTS = [], RUNNERS = [];
// Läufer: { room, draw(g), robot } – g ist die globale Uhr 0–479
function registerRunner(r) { RUNNERS.push(r); ROBOTS.push(Object.assign(r.robot, { room: r.room })); }
function registerRoom(def) {
  const off = def.offset || 0;
  if (off) {
    const d = def.draw; def.draw = f => d((f + off) % 60);
    def.robots.forEach(r => { const b = r.box; r.box = f => b((f + off) % 60); });
  }
  BUILT.push(def);
  def.robots.forEach(r => ROBOTS.push(Object.assign(r, { room: def.key })));
}

/* ---------- Hilfen ---------- */
const INK = '#2a2723';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (f, a, b) => clamp((f - a) / (b - a), 0, 1);
const ease = t => t * t * (3 - 2 * t);
const TAU = Math.PI * 2;

function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function paint(fill, stroke = INK, lw = 2) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function box(x, y, w, h, fill, r = 0, lw = 2) { r ? rrect(x, y, w, h, r) : (ctx.beginPath(), ctx.rect(x, y, w, h)); paint(fill, INK, lw); }
function circle(x, y, r, fill, stroke = INK, lw = 2) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); paint(fill, stroke, lw); }
function line(x1, y1, x2, y2, color = INK, lw = 2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); }
function limb(x1, y1, x2, y2, w, fill) { line(x1, y1, x2, y2, INK, w + 4); line(x1, y1, x2, y2, fill, w); }
function text(t, x, y, size, opts = {}) {
  ctx.font = `${opts.weight || 400} ${size}px ${opts.family || '"IBM Plex Sans", sans-serif'}`;
  ctx.fillStyle = opts.color || INK; ctx.textAlign = opts.align || 'left'; ctx.textBaseline = opts.base || 'alphabetic';
  ctx.fillText(t, x, y);
}
function wrap(t, x, y, maxW, lh, size, opts) {
  ctx.font = `${(opts && opts.weight) || 400} ${size}px "IBM Plex Sans", sans-serif`;
  let lineTxt = '';
  for (const w of t.split(' ')) {
    const test = lineTxt ? lineTxt + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && lineTxt) { text(lineTxt, x, y, size, opts); y += lh; lineTxt = w; } else lineTxt = test;
  }
  if (lineTxt) text(lineTxt, x, y, size, opts);
}
function noodles(x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const oy = -6 + i * 3;
    ctx.moveTo(-12, oy);
    ctx.bezierCurveTo(-6, oy - 5, -2, oy + 5, 3, oy - 1);
    ctx.bezierCurveTo(7, oy - 5, 9, oy + 3, 12, oy);
    ctx.strokeStyle = '#7a5a12'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2.2; ctx.stroke();
  }
  ctx.restore();
}


/* ---------- Roboterteile (wiederverwendbar) ---------- */
const rnd = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
function elbowOf(P, Q, r1, r2, side) {
  const dx = Q.x - P.x, dy = Q.y - P.y, d = Math.max(1, Math.hypot(dx, dy));
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const mx = P.x + a * dx / d, my = P.y + a * dy / d;
  const c1 = { x: mx + h * dy / d, y: my - h * dx / d }, c2 = { x: mx - h * dy / d, y: my + h * dx / d };
  return side < 0 ? (c1.x < c2.x ? c1 : c2) : (c1.x > c2.x ? c1 : c2);
}
function ik2(S, W, L1, L2) {
  const dx = W.x - S.x, dy = W.y - S.y, d = clamp(Math.hypot(dx, dy), 10, L1 + L2 - 0.5);
  const a = Math.atan2(dy, dx), b = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return { x: S.x + L1 * Math.cos(a - b), y: S.y + L1 * Math.sin(a - b) };
}
function hangingArm(px, tip, color, tool) {
  box(px - 18, 108, 36, 14, '#3b3d40', 2);
  const S = { x: px, y: 128 }, W = { x: tip.x, y: tip.y - 22 };
  const E = ik2(S, W, 68, 66);
  box(px - 12, 120, 24, 14, color, 3);
  limb(S.x, S.y, E.x, E.y, 15, color);
  limb(E.x, E.y, W.x, W.y, 11, color);
  circle(S.x, S.y, 8, '#3b3d40'); circle(E.x, E.y, 7, '#3b3d40'); circle(W.x, W.y, 5, '#3b3d40');
  if (tool === 'weld') {
    limb(W.x, W.y, tip.x, tip.y - 4, 4, '#5d6064');
    box(tip.x - 3, tip.y - 6, 6, 6, '#c58f12', 1, 1.5);
  } else {
    box(W.x - 9, W.y + 2, 18, 12, '#d6d9dc', 2);
    limb(W.x, W.y + 14, tip.x, tip.y - 2, 4, '#8a8f94');
  }
}
function sparks(x, y, f) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, 28);
  g.addColorStop(0, 'rgba(255,250,220,0.95)'); g.addColorStop(1, 'rgba(255,190,80,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 28, 0, TAU); ctx.fill();
  for (let i = 0; i < 12; i++) {
    const r1 = rnd(f * 31 + i), r2 = rnd(f * 17 + i * 5), ang = -Math.PI / 2 + (r1 - 0.5) * 3.4, len = 10 + r2 * 28;
    line(x + Math.cos(ang) * len * 0.35, y + Math.sin(ang) * len * 0.35, x + Math.cos(ang) * len, y + Math.sin(ang) * len + r2 * 12, r2 > 0.5 ? '#ffd23f' : '#ff8a24', 1.6);
  }
}
function spray(x, y, f) {
  ctx.fillStyle = 'rgba(250,249,244,0.85)';
  for (let i = 0; i < 16; i++) {
    const t = rnd(f * 13 + i), s = rnd(f * 7 + i * 3);
    ctx.beginPath(); ctx.arc(x + (s - 0.5) * (6 + t * 30), y + 2 + t * 20, 1.4 + t * 2.6, 0, TAU); ctx.fill();
  }
}
function gear(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? 6 : 8.5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); paint('#c9a46a', INK, 1.5);
  circle(0, 0, 2.2, '#5d5a55', null);
  ctx.restore();
}

/* ---------- Zustand ---------- */
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = { f: 0, g: 0, room: 'kantine', playing: !reduce, filter: 'Alle', sel: null, hover: null, wetter: 'sonne', licht: false, z: 1, ox: 0, oy: 0, dirty: true };
// Schutzfeld: Roboter mit Sicherheitssensoren halten an, wenn der Mauszeiger (oder Finger) zu nah kommt.
// Jeder hält seine eigene Uhr an; danach läuft er von dort weiter.
const SAFETY = { stapler: 60, kellner: 50, gehweg: 50, kehr: 50, jaeter: 70, cobot: 40, schrubber: 50 };
const HOLD = {};
const heldF = (id, f) => { const o = HOLD[id] ? HOLD[id].off : 0; return (((f - o) % 60) + 60) % 60; };
const heldG = (id, g) => { const o = HOLD[id] ? HOLD[id].off : 0; return (((g - o) % 480) + 480) % 480; };
const heldDraw = (id, f, fn) => withAlpha(id, () => fn(heldF(id, f)));
const alphaOf = id => {
  const r = byId[id];
  return state.filter === 'Alle' || (r && r.bereich === state.filter) ? 1 : 0.2;
};
function withAlpha(id, fn) { ctx.save(); ctx.globalAlpha = alphaOf(id); fn(); ctx.restore(); }


/* ---------- Figuren (wiederverwendbar) ---------- */
// Mensch: o = { x, foot=358, face=-1 (links) | 1, sit, shirt, pants, skin, hair, hat, hand:{x,y}, lean, eyesClosed, s }
function person(o) {
  const f = o.face || -1, foot = o.foot || 358, x = o.x, s = o.s || 1;
  const pants = o.pants || '#3d5a80', shirt = o.shirt || '#7b4b8e', skin = o.skin || '#e2b48f';
  ctx.save(); ctx.translate(x, foot); ctx.scale(s, s); ctx.translate(-x, -foot);
  let hip;
  if (o.sit) {
    hip = { x, y: foot - 40 };
    const knee = { x: x + f * 24, y: foot - 40 };
    limb(hip.x, hip.y, knee.x, knee.y, 8, pants); limb(knee.x, knee.y, knee.x, foot - 2, 7, pants);
    box(knee.x - 7 + f * 3, foot - 6, 14, 6, INK, 2);
  } else {
    hip = { x, y: foot - 56 };
    limb(x - 2, hip.y, x - 5, foot - 2, 7, pants); limb(x + 2, hip.y, x + 5, foot - 2, 7, pants);
    box(x - 13, foot - 6, 12, 6, INK, 2); box(x + 1, foot - 6, 12, 6, INK, 2);
  }
  const sh = { x: x + (o.lean || 0), y: hip.y - 36 };
  limb(hip.x, hip.y, sh.x, sh.y, 17, shirt);
  const head = { x: sh.x + f, y: sh.y - 15 };
  circle(head.x, head.y, 11, skin);
  if (o.hat) { ctx.beginPath(); ctx.arc(head.x, head.y - 2, 12, Math.PI, TAU); ctx.closePath(); paint(o.hat); box(head.x - 14, head.y - 4, 28, 4, o.hat, 1, 1.5); }
  else { ctx.beginPath(); ctx.arc(head.x - f, head.y - 3, 11, Math.PI * 1.05, Math.PI * 2.05); paint(o.hair || '#3a2c22'); }
  if (o.eyesClosed) line(head.x + f * 7 - 2, head.y, head.x + f * 7 + 2, head.y, INK, 1.4);
  else circle(head.x + f * 7, head.y, 1.6, INK, null);
  const hand = o.hand || { x: sh.x + f * 6, y: sh.y + 32 };
  const el = { x: (sh.x + hand.x) / 2 - f * 3, y: Math.max(sh.y + 10, (sh.y + hand.y) / 2 + 8) };
  limb(sh.x, sh.y + 4, el.x, el.y, 6, shirt); limb(el.x, el.y, hand.x, hand.y, 5, skin);
  ctx.restore();
  return { hip, sh, head, hand };
}
// Humanoider Roboter, 108 hoch bei s = 1. Winkel im Bogenmaß, 0 = senkrecht nach unten, positiv = nach rechts vorn.
function humanoid(x, foot, o = {}) {
  const s = o.s || 1, c = o.color || '#e6e3da';
  ctx.save(); ctx.translate(x, foot); ctx.scale(s, s);
  if (o.rot) { ctx.translate(0, -60); ctx.rotate(o.rot); ctx.translate(0, 60); }
  const leg = (a, k, dx) => {
    const kn = { x: dx + Math.sin(a) * 24, y: -50 + Math.cos(a) * 24 }, ft = { x: kn.x + Math.sin(a - k) * 24, y: kn.y + Math.cos(a - k) * 24 };
    limb(dx, -50, kn.x, kn.y, 7, c); limb(kn.x, kn.y, ft.x, ft.y, 6, c);
    circle(kn.x, kn.y, 3, '#3b3d40', INK, 1); box(ft.x - 5, ft.y - 3, 12, 5, '#3b3d40', 2, 1.2);
  };
  const arm = (a, dx) => {
    const el = { x: dx + Math.sin(a) * 18, y: -84 + Math.cos(a) * 18 }, h = { x: el.x + Math.sin(a + 0.3) * 18, y: el.y + Math.cos(a + 0.3) * 18 };
    limb(dx, -84, el.x, el.y, 6, c); limb(el.x, el.y, h.x, h.y, 5, c);
  };
  arm(o.armL || 0, -4); leg(o.legL || 0, o.kneeL || 0, -3);
  box(-12, -90, 24, 42, c, 6);
  ctx.fillStyle = '#3b3d40'; ctx.fillRect(-12, -66, 24, 4);
  box(-10, -110, 20, 18, c, 5); box(-7, -105, 15, 6, '#23384d', 2, 1.2);
  leg(o.legR || 0, o.kneeR || 0, 3); arm(o.armR || 0, 4);
  ctx.restore();
}
// Quadrocopter von der Seite
function quad(x, y, f, o = {}) {
  const c = o.color || '#3b3d40', w = o.w || 44;
  line(x - w / 2, y - 4, x + w / 2, y - 4, INK, 3);
  for (const s of [-1, 1]) {
    line(x + s * w / 2, y - 4, x + s * w / 2, y - 9, INK, 2);
    ctx.beginPath(); ctx.ellipse(x + s * w / 2, y - 10, f % 2 ? 14 : 9, 2, 0, 0, TAU); ctx.fillStyle = 'rgba(42,39,35,0.4)'; ctx.fill();
  }
  box(x - 12, y - 9, 24, 12, c, 4);
  circle(x + 6, y - 3, 2, f % 6 < 3 ? '#7fe08a' : '#2d5b33', null);
}
