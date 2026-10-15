/* RoboWorld 101 – Deine Figur: R-101, ein mobiler Greifroboter, den man selbst steuert.
   Steuerung: Pfeiltasten/WASD, Klick ins Bild, oder Befehle („gehe zum Lager, greife, gehe zur Garage, lege ab“).
   Lädt nach welt.js und vor engine.js. Zeichnet sich über avDraw() (von engine.js aufgerufen). */
'use strict';
const AV = {
  an: false, x: rx(0) + 320, y: ry(6) + 360, row: 6, dir: 1, rad: 0, arm: 0, plan: [], lift: null, blend: null,
  traegt: null, folgen: true, blase: null, befehle: [], bi: -1, tasten: new Set(), status: '',
};
const AV_DOOR = SHAFT_X - 44;            // Platz vor dem Aufzug (rechter Rand der Räume in Spalte 2)
const AV_V = 360;                        // Fahrtempo in Einheiten pro Sekunde (in echt wären es etwa 70)

/* ---------- Wege ---------- */
function avSegs(r) {
  if (r === 6) { const xs = ROOMS.filter(o => o.r === 6 && !o.wasser && !o.berg); return [[Math.min(...xs.map(o => rx(o.c))) + 20, Math.max(...xs.map(o => rx(o.c) + RW)) - 20]]; }
  const iv = ROOMS.filter(o => o.r === r && isOpen(o)).map(o => [rx(o.c) + 20, rx(o.c) + RW - 20]);
  if (r === 7) iv.push([SHAFT_X, SHAFT_X + SHAFT]);
  iv.sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const s of iv) { const l = out[out.length - 1]; if (l && s[0] - l[1] <= 80) l[1] = Math.max(l[1], s[1]); else out.push(s.slice()); }
  return out;
}
const avSegOf = (r, x) => avSegs(r).find(s => x >= s[0] - 1 && x <= s[1] + 1);
const avHatAufzug = r => r >= 1 && r <= 8 && !!avSegOf(r, AV_DOOR);
function avRoomAt(r, x) { return ROOMS.find(o => o.r === r && isOpen(o) && x >= rx(o.c) && x <= rx(o.c) + RW); }
function avFloor(r, x) {
  if (r !== 6) return ry(r) + 360;
  const o = avRoomAt(6, x);
  if (!o) return x > 0 && x < BW ? ry(6) + 360 : GROUND - 4;
  return o.outdoor ? ry(6) + 384 : ry(6) + 360;
}
function avRowAt(wy) { for (let r = 0; r < ROWS; r++) if (wy >= ry(r) - WALL && wy < ry(r) + RH + WALL) return r; return wy > ry(6) && wy < GROUND + 60 ? 6 : null; }
// Weg planen: in derselben Etage fahren, sonst über den Aufzug
function avWeg(r, x) {
  const ziel = avSegOf(r, x) || (r === 6 ? avSegs(6)[0] : null);
  if (!ziel) return null;
  x = clamp(x, ziel[0], ziel[1]);
  const hier = avSegOf(AV.row, AV.x);
  if (r === AV.row && hier && x >= hier[0] && x <= hier[1]) return [{ t: 'gehe', x }];
  if (avHatAufzug(AV.row) && avHatAufzug(r) && ziel[0] <= AV_DOOR && ziel[1] >= AV_DOOR) return [{ t: 'gehe', x: AV_DOOR }, { t: 'lift', r }, { t: 'gehe', x }];
  return null;
}
function avHin(r, x, danach = []) {
  const w = avWeg(r, x);
  if (!w) { avSag('Da komme ich nicht hin.'); return false; }
  AV.plan = w.concat(danach); AV.folgen = true; return true;
}

/* ---------- Aufzug: R-101 ruft die Kabine und fährt allein ---------- */
const _cabinY = cabinY;
cabinY = g => {
  if (AV.lift) return AV.lift.y;
  if (AV.blend) return lerp(AV.blend.y, _cabinY(g), ease(clamp(AV.blend.t, 0, 1)));
  return _cabinY(g);
};
const avKabine = r => ry(r) + 360 - (CAB_H - 8);
function avLift(s, dt) {
  if (!AV.lift && typeof WD !== 'undefined' && (WD.lift || WD.blend)) { if (!AV.wartet) { AV.wartet = 1; avSag('Aufzug besetzt, ich warte kurz.'); } return; }
  AV.wartet = 0;
  const L = AV.lift || (AV.lift = { ph: 'ruf', y: _cabinY(state.g) });
  const zu = (y, v) => { const d = y - L.y; if (Math.abs(d) <= v * dt) { L.y = y; return true; } L.y += Math.sign(d) * v * dt; return false; };
  if (L.ph === 'ruf') { if (zu(avKabine(AV.row), 900)) L.ph = 'rein'; }
  else if (L.ph === 'rein') { if (avFahr(SHAFT_X + SHAFT / 2, dt, 160)) L.ph = 'fahrt'; }
  else if (L.ph === 'fahrt') { if (zu(avKabine(s.r), 520)) { AV.row = s.r; L.ph = 'raus'; } }
  else if (L.ph === 'raus') { if (avFahr(AV_DOOR, dt, 160)) { AV.blend = { y: L.y, t: 0 }; AV.lift = null; AV.plan.shift(); } }
  if (AV.lift && L.ph !== 'ruf') AV.y = L.y + CAB_H - 8;
}

/* ---------- Bewegen ---------- */
function avFahr(x, dt, v) {
  const d = x - AV.x, sp = v || (Math.abs(d) > 900 ? AV_V * 2.6 : AV_V);
  if (Math.abs(d) <= sp * dt) { AV.rad += d; AV.x = x; return true; }
  AV.dir = Math.sign(d); AV.x += AV.dir * sp * dt; AV.rad += AV.dir * sp * dt; return false;
}
function avSchritt(dt) {
  const s = AV.plan[0];
  if (!s) { avNaechsterBefehl(); return; }
  if (s.t === 'gehe') { if (avFahr(s.x, dt)) AV.plan.shift(); }
  else if (s.t === 'lift') avLift(s, dt);
  else if (s.t === 'arm') { const d = s.z - AV.arm; if (Math.abs(d) < dt * 3) { AV.arm = s.z; AV.plan.shift(); } else AV.arm += Math.sign(d) * dt * 3; }
  else if (s.t === 'warte') { s.s -= dt; if (s.s <= 0) AV.plan.shift(); }
  else if (s.t === 'tu') { AV.plan.shift(); s.fn(); }
}
function avTasten(dt) {
  const k = AV.tasten;
  const l = k.has('ArrowLeft') || k.has('a'), r = k.has('ArrowRight') || k.has('d');
  if (!(l ^ r) || AV.lift) return false;
  AV.plan = []; AV.befehle = []; AV.folgen = true;
  const seg = avSegOf(AV.row, AV.x); if (!seg) return true;
  avFahr(clamp(AV.x + (r ? 1 : -1) * 2000, seg[0], seg[1]), dt);
  return true;
}

/* ---------- Dinge, Botengänge, Knöpfe ---------- */
const AUFTRAEGE = [
  { id: 'teil', ding: 'Bauteil', von: 'fertigung', nach: 'pruef', text: 'Bring das Bauteil aus der Fertigungshalle zum Prüfstand.',
    fertig: 'Geliefert! Neue Teile kommen immer erst auf den Prüfstand, bevor sie eingebaut werden.' },
  { id: 'rad', ding: 'Ersatzrad', von: 'lager', nach: 'garage', text: 'Bring das Ersatzrad vom Lager in die Garage.',
    fertig: 'Geliefert! Im Lager holen in echt oft fahrerlose Transportsysteme die Teile.' },
  { id: 'medi', ding: 'Medikamentenkiste', von: 'apotheke', nach: 'kranken', text: 'Bring die Medikamentenkiste von der Apotheke in die Krankenstation.',
    fertig: 'Geliefert! In echten Krankenhäusern fahren dafür Transportroboter durch die Flure, die Kiste öffnet nur das Personal.' },
  { id: 'paket', ding: 'Paket', von: 'hafen', nach: 'supermarkt', text: 'Bring das Paket vom Containerhafen in den Supermarkt.',
    fertig: 'Geliefert! Der Scanner-Roboter im Supermarkt zählt es jetzt mit.' },
  { id: 'buch', ding: 'Buch', von: 'buecher', nach: 'schule', text: 'Bring das Buch aus dem Bücherspeicher hinauf in die Schule.',
    fertig: 'Geliefert! Im Bücherspeicher holen Roboterkräne die Bücher aus hohen Regalen.' },
  { id: 'socke', ding: 'rote Socke', von: 'recycling', nach: 'wohnen', text: 'Die rote Socke ist im Recyclinghof gelandet. Bring sie zurück in den Wohnbereich.',
    fertig: 'Geliefert! Socken gehören nicht in den Saugroboter und nicht in den Recyclinghof.' },
];
const AV_SPOT = 540; // Abstand vom linken Raumrand für Abholen und Abgeben
let avDinge = {};
function avDingeStart() {
  let fertig = [];
  try { fertig = JSON.parse(localStorage.getItem('rw101-botengaenge') || '[]'); } catch (e) {}
  avDinge = {};
  for (const a of AUFTRAEGE) {
    const o = roomOf(fertig.includes(a.id) ? a.nach : a.von);
    avDinge[a.id] = { r: o.r, x: rx(o.c) + AV_SPOT + (fertig.includes(a.id) ? -30 : 0), ok: fertig.includes(a.id) };
  }
}
function avSpeichern() { try { localStorage.setItem('rw101-botengaenge', JSON.stringify(AUFTRAEGE.filter(a => avDinge[a.id].ok).map(a => a.id))); } catch (e) {} }
const KNOEPFE = [
  { id: 'nothalt', room: 'fertigung', x: 34, name: 'Not-Halt', tu() {
      WELT.emit('nothalt', 'fertigung');
      avToast('Not-Halt! Alle Roboter in der Halle bleiben sofort stehen, und das Lager darunter wartet auf Teile. Solche roten Knöpfe hat in echt jede Industrieanlage.'); } },
  { id: 'glocke', room: 'eingang', x: 600, name: 'Schichtglocke', tu() {
      WELT.emit('schichtwechsel'); avToast('Schichtwechsel! In allen Hallen gehen die Rundumleuchten an.'); } },
  { id: 'lichtschalter', name: 'Lichtschalter', tu() { state.licht = !state.licht; WELT.emit('licht', state.licht); } },
  { id: 'notausgang', name: 'Notausgang', tu() { knock(); avSag('Klopf!'); } },
];
function knopfPos(k) {
  if (k.room) { const o = roomOf(k.room); return { r: o.r, x: rx(o.c) + k.x }; }
  const b = byId[k.id] && byId[k.id].box(state.f); if (!b || b[0] < -9000) return null;
  return { r: avRowAt(b[1] + b[3]), x: b[0] + b[2] / 2 };
}
function avNah(maxd) {
  let best = null;
  const pruefe = (art, obj, p) => { if (!p || p.r !== AV.row) return; const d = Math.abs(p.x - AV.x); if (d < maxd && (!best || d < best.d)) best = { art, obj, d, x: p.x }; };
  KNOEPFE.forEach(k => pruefe('knopf', k, knopfPos(k)));
  if (!AV.traegt) AUFTRAEGE.forEach(a => { const d = avDinge[a.id]; if (d && !d.traeger) pruefe('ding', a, d); });
  return best;
}
function avGreifen() {
  if (AV.traegt) { avAblegen(); return; }
  const n = avNah(80);
  if (!n || n.art !== 'ding') {
    const w = avNah(700);
    if (w && w.art === 'ding') { AV.plan.unshift({ t: 'gehe', x: w.x - Math.sign(w.x - AV.x) * 30 }, { t: 'tu', fn: avGreifen }); return; }
    avSag('Hier liegt nichts zum Greifen.'); return;
  }
  const a = n.obj;
  AV.plan.unshift({ t: 'arm', z: 1 }, { t: 'tu', fn: () => { AV.traegt = a.id; avDinge[a.id].traeger = true; avDinge[a.id].ok = false; avSpeichern(); avPanel(); } }, { t: 'arm', z: 0 });
}
function avAblegen() {
  if (!AV.traegt) { avSag('Ich trage gerade nichts.'); return; }
  const a = AUFTRAEGE.find(o => o.id === AV.traegt), ziel = roomOf(a.nach), here = avRoomAt(AV.row, AV.x);
  AV.plan.unshift({ t: 'arm', z: 1 }, { t: 'tu', fn: () => {
    const d = avDinge[a.id]; d.traeger = false; d.r = AV.row; d.x = AV.x + AV.dir * 34; AV.traegt = null;
    if (here && here.built === ziel.built) { d.ok = true; WELT.emit('geliefert', a.id); avToast(a.fertig); }
    avSpeichern(); avPanel();
  } }, { t: 'arm', z: 0 });
}
function avFrage(id) {
  let best = null;
  if (!id) ROBOTS.forEach(r => {
    if (r.id === 'avatar' || WELT.versteckt(r.id)) return;
    const b = r.box(state.f); if (b[0] < -9000 || avRowAt(b[1] + b[3] - 4) !== AV.row) return;
    const d = Math.abs(b[0] + b[2] / 2 - AV.x); if (d < 300 && (!best || d < best.d)) best = { d, r };
  });
  const r = id ? byId[id] : best && best.r;
  if (!r) { avSag('Hier ist niemand zum Fragen.'); return; }
  avSag(r.bereich === 'Mensch' ? 'Hallo! Was machst du hier?' : 'Hallo! Was ist deine Aufgabe?');
  select(r.id, false);
}
function avDruecke() {
  const n = avNah(90);
  if (n && n.art === 'knopf') { AV.plan.unshift({ t: 'arm', z: 0.6 }, { t: 'tu', fn: () => n.obj.tu() }, { t: 'arm', z: 0 }); return true; }
  let w = null; KNOEPFE.forEach(k => { const p = knopfPos(k); if (p && p.r === AV.row && Math.abs(p.x - AV.x) < 700 && (!w || Math.abs(p.x - AV.x) < Math.abs(w.x - AV.x))) w = p; });
  if (w) { AV.plan.unshift({ t: 'gehe', x: w.x - Math.sign(w.x - AV.x) * 40 }, { t: 'tu', fn: avDruecke }); return true; }
  avSag('Hier ist kein Knopf.'); return false;
}
function avTuWas() {
  const n = avNah(300);
  if (n && n.art === 'knopf') avDruecke();
  else if (AV.traegt || (n && n.art === 'ding')) avGreifen();
  else avFrage();
}

/* ---------- Befehle ---------- */
const avNorm = t => t.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const AV_FUELL = /^(zu|zum|zur|in|ins|in den|in die|in das|nach|an den|an die|an das|den|die|das|dem|der|bis zum|bis zur) /;
function avZiel(wort) {
  let w = avNorm(wort); for (let i = 0; i < 3; i++) w = w.replace(AV_FUELL, '');
  if (!w) return null;
  if (/aufzug|fahrstuhl/.test(w)) return { r: AV.row, x: AV_DOOR };
  for (const a of AUFTRAEGE) if (avNorm(a.ding) === w || w.split(' ').includes(avNorm(a.ding).split(' ').pop())) { const d = avDinge[a.id]; if (!d.traeger) return { r: d.r, x: d.x }; }
  const o = ROOMS.find(o => isOpen(o) && (avNorm(o.name).split(' ').some(t => t.length > 3 && (t.startsWith(w) || w.startsWith(t))) || avNorm(o.name) === w || o.built === w));
  if (o) return { r: o.r, x: rx(o.c) + RW / 2 };
  const rob = ROBOTS.find(r => r.id !== 'avatar' && avNorm(r.name).includes(w));
  if (rob) { const b = rob.box(state.f); if (b[0] > -9000) return { r: avRowAt(b[1] + b[3] - 4), x: b[0] + b[2] / 2, id: rob.id }; }
  return null;
}
function avBefehl(t) {
  const w = avNorm(t);
  let m;
  if (!w) return [];
  if ((m = w.match(/^(geh|gehe|fahr|fahre|lauf|laufe|komm)( zu| zum| zur| in| ins| nach)? (.+)$/)) && !/^(hoch|runter|nach oben|nach unten|links|rechts)/.test(m[3])) {
    const z = avZiel(m[3]); if (!z || z.r == null) throw new Error('Diesen Ort kenne ich nicht: „' + m[3] + '“');
    const w2 = avWeg(z.r, z.x); if (!w2) throw new Error('Dorthin finde ich keinen Weg: „' + m[3] + '“');
    return w2;
  }
  if ((m = w.match(/(links|rechts)( (\d+))?/)) && /^(geh|gehe|fahr|fahre|links|rechts)/.test(w)) {
    const n = m[3] ? +m[3] : 2, seg = avSegOf(AV.row, AV.x) || [AV.x, AV.x];
    return [{ t: 'gehe', x: clamp(AV.x + (m[1] === 'rechts' ? 1 : -1) * n * 69, seg[0], seg[1]) }];
  }
  if (/(hoch|oben|runter|unten)/.test(w) && /(fahr|fahre|aufzug|hoch|runter)/.test(w)) {
    const n = +(w.match(/\d+/) || [1])[0], r = clamp(AV.row + (/(hoch|oben)/.test(w) ? -n : n), 1, 8);
    const w2 = avWeg(r, AV_DOOR); if (!w2) throw new Error('Von hier fährt kein Aufzug.'); return w2;
  }
  if (/^(greif|greife|nimm|heb|hebe|pack|packe|hol|hole)/.test(w)) return [{ t: 'tu', fn: () => { if (AV.traegt) avSag('Ich habe schon etwas in der Hand.'); else avGreifen(); } }];
  if (/(leg|lege|gib|ablegen|abgeben|lass|stell|stelle)/.test(w)) return [{ t: 'tu', fn: avAblegen }];
  if ((m = w.match(/^(frag|frage)( (.+))?$/))) {
    if (!m[3]) return [{ t: 'tu', fn: () => avFrage() }];
    const z = avZiel(m[3]); if (!z || !z.id) throw new Error('Wen soll ich fragen? „' + m[3] + '“ finde ich nicht.');
    const w2 = avWeg(z.r, z.x - AV.dir * 60) || avWeg(z.r, z.x); if (!w2) throw new Error('Zu „' + m[3] + '“ finde ich keinen Weg.');
    return w2.concat([{ t: 'tu', fn: () => avFrage(z.id) }]);
  }
  if (/^(drueck|druecke|schalt|schalte|klopf|klopfe|klingel|klingle|klingele)/.test(w)) return [{ t: 'tu', fn: avDruecke }];
  if ((m = w.match(/^(warte|wart|pause)( (\d+))?/))) return [{ t: 'warte', s: m[3] ? +m[3] : 1 }];
  throw new Error('Das verstehe ich nicht: „' + t.trim() + '“');
}
function avStarteBefehle(text) {
  AV.befehle = text.split(/\n|,|;|\bdann\b|\bund dann\b/i).map(s => s.trim()).filter(Boolean);
  AV.bi = -1; AV.plan = []; AV.folgen = true;
  if (!AV.befehle.length) return;
  avNaechsterBefehl();
}
function avNaechsterBefehl() {
  if (!AV.befehle.length || AV.bi >= AV.befehle.length - 1) { if (AV.befehle.length) { AV.befehle = []; avPanel(); } return; }
  AV.bi++;
  try { AV.plan = avBefehl(AV.befehle[AV.bi]); }
  catch (e) { avSag(e.message); AV.befehle = []; AV.plan = []; }
  avPanel();
}

/* ---------- Zeichnen ---------- */
function avDing(id, x, y) {
  // y ist die Unterkante des Dings
  if (id === 'rad') { circle(x, y - 15, 15, '#2a2723', INK, 2); circle(x, y - 15, 7, '#8a8f94', INK, 1.5); }
  else if (id === 'medi') { box(x - 15, y - 20, 30, 20, '#e8e6e0', 0, 2); box(x - 3, y - 17, 6, 14, '#2e9a5a', 0, 0.01); box(x - 7, y - 13, 14, 6, '#2e9a5a', 0, 0.01); }
  else if (id === 'paket') { box(x - 16, y - 22, 32, 22, '#c9a46a', 0, 2); line(x, y - 22, x, y, '#a8763f', 3); }
  else if (id === 'buch') { box(x - 11, y - 26, 22, 26, '#3e6f9e', 0, 2); line(x + 7, y - 24, x + 7, y - 2, '#e8e4da', 2); }
  else if (id === 'teil') { box(x - 14, y - 16, 28, 16, '#8a8f94', 2, 2); circle(x - 6, y - 8, 3, '#3b3d40', null); circle(x + 6, y - 8, 3, '#3b3d40', null); }
  else if (id === 'socke') {
    ctx.beginPath(); ctx.moveTo(x - 4, y - 24); ctx.lineTo(x + 4, y - 24); ctx.lineTo(x + 4, y - 8); ctx.lineTo(x + 12, y - 6); ctx.lineTo(x + 12, y); ctx.lineTo(x - 4, y); ctx.closePath(); paint('#d9342b');
  }
}
function avFigur(x, foot, dir, arm) {
  const d = dir;
  // Türöffnung in Wänden, die R-101 gerade durchfährt
  for (const o of ROOMS) if (o.r === AV.row && isOpen(o)) for (const wx of [rx(o.c) - WALL, rx(o.c) + RW]) if (Math.abs(wx + WALL / 2 - x) < 60) { ctx.fillStyle = '#3b3d40'; ctx.fillRect(wx, ry(AV.row) + 360 - 104, WALL, 104); }
  // Unterbau mit Laserscanner und zwei Antriebsrädern
  box(x - 27, foot - 26, 54, 18, '#3b3d40', 6, 2);
  box(x + d * 14 - 8, foot - 22, 16, 6, '#23384d', 0, 1.2);
  circle(x + d * 18, foot - 19, 1.8, state.g % 12 < 6 ? '#7fe08a' : '#2d5b33', null);
  for (const dx of [-15, 15]) {
    circle(x + dx, foot - 8, 8, '#2a2723', INK, 1.5);
    const a = AV.rad / 8; line(x + dx, foot - 8, x + dx + Math.cos(a) * 6, foot - 8 + Math.sin(a) * 6, '#8a8f94', 1.5);
  }
  line(x - 22, foot - 23, x + 22, foot - 23, '#d9542b', 3);
  // Rumpf (Säule) und Schulter
  box(x - 8, foot - 62, 16, 38, '#b9d0dc', 0, 2);
  box(x - 15, foot - 70, 30, 12, '#b9d0dc', 3, 2);
  // Kopf mit Kamera
  box(x - 3, foot - 76, 6, 6, '#8a8f94', 0, 1.5);
  box(x - 13, foot - 90, 26, 16, '#e6e3da', 3, 2);
  box(x + d * 3 - 8, foot - 86, 16, 7, '#23384d', 2, 1.2);
  circle(x + d * 3 - 3, foot - 82.5, 1.8, '#7fd3ff', null); circle(x + d * 3 + 3, foot - 82.5, 1.8, '#7fd3ff', null);
  // Arm: Schulter → Ellbogen → Greifer
  const S = { x: x + d * 12, y: foot - 64 };
  const H = { x: x + d * lerp(26, 38, arm), y: lerp(foot - 46, foot - 10, arm) };
  const E = { x: lerp(S.x + d * 4, (S.x + H.x) / 2 + d * 10, arm), y: lerp(foot - 40, (S.y + H.y) / 2 - 6, arm) };
  limb(S.x, S.y, E.x, E.y, 6, '#b9d0dc'); limb(E.x, E.y, H.x, H.y, 5, '#b9d0dc');
  circle(E.x, E.y, 3.5, '#8a8f94', INK, 1.5);
  const auf = AV.traegt ? 7 : 10;
  line(H.x, H.y, H.x + d * 4, H.y + auf, INK, 3); line(H.x, H.y, H.x + d * 8, H.y + auf - 8, INK, 3);
  if (AV.traegt) avDing(AV.traegt, H.x + d * 8, H.y + 24);
}
function avBlase(x, y, t) {
  ctx.font = '500 13px "IBM Plex Sans", sans-serif';
  const w = Math.min(260, ctx.measureText(t).width + 20), lines = [];
  let cur = '';
  for (const word of t.split(' ')) { const test = cur ? cur + ' ' + word : word; if (ctx.measureText(test).width > 240 && cur) { lines.push(cur); cur = word; } else cur = test; }
  lines.push(cur);
  const h = 10 + lines.length * 17;
  box(x - w / 2, y - h - 10, w, h, '#fbfbf8', 0, 2);
  ctx.beginPath(); ctx.moveTo(x - 6, y - 11); ctx.lineTo(x, y - 2); ctx.lineTo(x + 6, y - 11); paint('#fbfbf8');
  lines.forEach((l, i) => text(l, x, y - h + 6 + i * 17, 13, { align: 'center', weight: 500 }));
}
function avTaste(x, y, t) { box(x - 9, y - 18, 18, 18, '#2a2723', 0, 1.5); text(t, x, y - 4, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' }); }
function avDraw() {
  if (!AV.an) return;
  // Dinge der Botengänge
  for (const a of AUFTRAEGE) { const d = avDinge[a.id]; if (d && !d.traeger) { withAlpha('avatar', () => avDing(a.id, d.x, avFloor(d.r, d.x))); if (d.ok) text('✓', d.x + 20, avFloor(d.r, d.x) - 20, 18, { color: '#2e7d32', weight: 600 }); } }
  // eigene Knöpfe: Not-Halt in der Fertigung, Schichtglocke in der Eingangshalle
  for (const k of KNOEPFE) {
    if (!k.room) continue; const p = knopfPos(k), fl = ry(p.r) + 360;
    box(p.x - 3, fl - 56, 6, 56, '#5d6064', 0, 1.5);
    if (k.id === 'nothalt') { box(p.x - 12, fl - 76, 24, 20, '#f0b429', 0, 2); circle(p.x, fl - 70, 8, '#d9342b', INK, 2); }
    else { box(p.x - 10, fl - 72, 20, 16, '#3b3d40', 0, 2); circle(p.x, fl - 80, 9, '#d9a43a', INK, 2); }
  }
  // Tastenhinweis am nächsten Ziel
  const n = !AV.lift && avNah(90);
  if (n) avTaste(n.x, (n.art === 'ding' ? avFloor(AV.row, n.x) - 36 : ry(AV.row) + 360 - 96), n.art === 'ding' ? 'G' : 'E');
  else if (!AV.lift && avHatAufzug(AV.row) && Math.abs(AV.x - AV_DOOR) < 60) avTaste(AV_DOOR, ry(AV.row) + 360 - 110, '▲▼');
  withAlpha('avatar', () => avFigur(AV.x, AV.y, AV.dir, AV.arm));
  if (AV.blase && performance.now() < AV.blase.bis) avBlase(AV.x, AV.y - 98, AV.blase.t);
}
function avSag(t) { AV.blase = { t, bis: performance.now() + 2600 }; state.dirty = true; }
function avToast(t) {
  const el = document.querySelector('.toast'); if (!el) return;
  el.textContent = t; el.classList.add('on'); clearTimeout(avToast.t); avToast.t = setTimeout(() => el.classList.remove('on'), 4200);
}

/* ---------- Karte ---------- */
registerRunner({
  room: 'eingang', draw() {},
  robot: {
    id: 'avatar', name: 'R-101 (du)', bereich: 'Service', aera: 'seit 2015', typ: 'Mobiler Greifroboter', color: '#b9d0dc',
    fakt: 'Gebaut nach dem Vorbild mobiler Greifroboter wie TIAGo von PAL Robotics (seit 2015): fahrbarer Unterbau mit Laserscanner, ein Rumpf, ein Arm mit Greifer und eine Kamera im Kopf. Forschungsgruppen üben mit solchen Robotern Greifen und Navigieren.',
    echt: 'Echt ist der Aufbau. Ausgedacht ist, dass er so schnell fährt und den Aufzug ganz für sich allein bekommt.',
    note: 'Das bist du. Steuern mit Pfeiltasten, Klicks ins Bild oder Befehlen wie „gehe zum Lager, greife“.',
    quelle: 'https://www.eenewseurope.com/en/new-robot-mobile-manipulator-from-pal-robotics/',
    box: () => (AV.an ? [AV.x - 30, AV.y - 92, 60, 92] : [-99999, -99999, 1, 1]),
  },
});
if (typeof KINDER !== 'undefined') KINDER.avatar = 'Das bist du! R-101 fährt auf Rädern, schaut mit einer Kamera und kann mit seinem Greifarm Dinge tragen. Solche Roboter gibt es wirklich.';

/* ---------- Bedienfeld ---------- */
const avCss = document.createElement('style');
avCss.textContent = `
.avbox { position: fixed; left: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); width: min(400px, calc(100% - 32px)); max-height: calc(100vh - 200px); overflow-y: auto; background: var(--panel); border: 2px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); padding: 10px 14px 12px; z-index: 6; font-size: 13px; }
.avbox[hidden] { display: none !important; }
.avbox h2 { margin: 2px 0 4px; font-family: var(--font-display); font-size: 24px; line-height: 1; text-transform: uppercase; }
.avbox .av-st { margin: 0 0 8px; color: var(--ink-soft); line-height: 1.4; }
.avbox button, .avbox select { font: 500 13px var(--font-body); color: var(--ink); background: var(--chip); border: 2px solid var(--ink); padding: 5px 9px; cursor: pointer; min-height: 32px; }
.avbox button:focus-visible, .avbox textarea:focus-visible, .avbox select:focus-visible, .avbox summary:focus-visible { outline: 3px solid var(--signal); outline-offset: 2px; }
.av-pad { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
.av-pad .sq { width: 34px; padding: 0; }
.avbox details { border-top: 1px solid var(--line); padding-top: 6px; margin-top: 6px; }
.avbox summary { cursor: pointer; font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
.av-auf { margin: 6px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; line-height: 1.35; }
.av-auf li.ok { color: var(--ink-soft); text-decoration: line-through; }
.av-auf li.jetzt { font-weight: 600; }
.avbox textarea { width: 100%; box-sizing: border-box; font: 13px var(--font-mono); border: 2px solid var(--ink); padding: 6px; margin: 6px 0; resize: vertical; }
.av-kacheln { display: flex; flex-wrap: wrap; gap: 5px; }
.av-kacheln button { background: #fff; }
.av-run { background: var(--ink) !important; color: var(--panel) !important; }
.av-err { color: var(--signal); }
.av-an .toast { left: calc(50% + 200px); }
@media (max-width: 760px) { .av-an .toast { left: 50%; }
  .avbox { top: 120px; bottom: auto; max-height: 40vh; } }`;
document.head.appendChild(avCss);
const avBox = document.createElement('div');
avBox.className = 'avbox'; avBox.hidden = true; avBox.setAttribute('role', 'region'); avBox.setAttribute('aria-label', 'Roboter steuern');
avBox.innerHTML = `
  <div class="eyebrow">Du steuerst</div><h2>R-101</h2>
  <p class="av-st" aria-live="polite"></p>
  <div class="av-pad">
    <button class="sq" data-k="links" aria-label="Nach links">◀</button><button class="sq" data-k="rechts" aria-label="Nach rechts">▶</button>
    <button class="sq" data-k="hoch" aria-label="Aufzug hoch">▲</button><button class="sq" data-k="runter" aria-label="Aufzug runter">▼</button>
    <button data-k="greife">Greifen (G)</button><button data-k="druecke">Drücken (E)</button><button data-k="frage">Fragen (F)</button>
  </div>
  <details open class="av-d1"><summary>Botengänge</summary><ol class="av-auf"></ol></details>
  <details class="av-d2"><summary>Befehle</summary>
    <textarea rows="3" spellcheck="false" aria-label="Befehle, einer pro Zeile oder mit Komma getrennt" placeholder="gehe zum Lager, greife, gehe zur Garage, lege ab"></textarea>
    <div class="av-kacheln">
      <select aria-label="Ziel für gehe zu"></select><button data-t="gehe zu">+ gehe zu</button>
      <button data-t="greife">+ greife</button><button data-t="lege ab">+ lege ab</button><button data-t="frage">+ frage</button>
      <button data-t="drücke">+ drücke</button><button data-t="warte 2">+ warte</button>
      <button class="av-run">Los</button><button class="av-clear">Leeren</button>
    </div>
    <p class="hint" style="margin-top:6px">Erst planen, dann „Los“: R-101 arbeitet die Befehle der Reihe nach ab. Wie beim Programmieren mit Blöcken.</p>
  </details>
  <p class="hint" style="margin-top:8px">Pfeiltasten oder A/D fahren, ▲▼ am Aufzug, E drücken, G greifen und ablegen, F fragen. Klick ins Bild: R-101 fährt hin.</p>`;
document.body.appendChild(avBox);
const avSt = avBox.querySelector('.av-st'), avAuf = avBox.querySelector('.av-auf'), avTa = avBox.querySelector('textarea'), avSel = avBox.querySelector('select');
ROOMS.filter(o => !o.secret && avWeg(o.r, rx(o.c) + RW / 2) !== null)
  .sort((a, b) => a.name.localeCompare(b.name, 'de')).forEach(o => { const op = document.createElement('option'); op.value = o.name; op.textContent = o.name; avSel.appendChild(op); });
function avPanel() {
  const o = avRoomAt(AV.row, AV.x);
  byId.avatar.room = o ? o.built : 'eingang';
  const a = AV.traegt && AUFTRAEGE.find(x => x.id === AV.traegt);
  let t = (o ? o.name : LEVELS[AV.row]) + (a ? ' · trägt: ' + a.ding : '');
  if (AV.befehle.length) t += ` · Befehl ${AV.bi + 1} von ${AV.befehle.length}: ${AV.befehle[AV.bi]}`;
  avSt.textContent = t;
  avAuf.innerHTML = '';
  let n = 0;
  AUFTRAEGE.forEach(x => { const li = document.createElement('li'); li.textContent = x.text; if (avDinge[x.id].ok) { li.className = 'ok'; n++; } if (AV.traegt === x.id) li.className = 'jetzt'; avAuf.appendChild(li); });
  avBox.querySelector('.av-d1 summary').textContent = `Botengänge ${n} von ${AUFTRAEGE.length}`;
}
avBox.querySelector('.av-pad').addEventListener('click', e => {
  const k = e.target.closest('button'); if (!k) return;
  const seg = avSegOf(AV.row, AV.x) || [AV.x, AV.x];
  AV.befehle = []; AV.folgen = true;
  if (k.dataset.k === 'links' || k.dataset.k === 'rechts') AV.plan = [{ t: 'gehe', x: clamp(AV.x + (k.dataset.k === 'rechts' ? 200 : -200), seg[0], seg[1]) }];
  else if (k.dataset.k === 'hoch' || k.dataset.k === 'runter') avAufzug(k.dataset.k === 'hoch' ? -1 : 1);
  else if (k.dataset.k === 'greife') avGreifen();
  else if (k.dataset.k === 'druecke') avDruecke();
  else if (k.dataset.k === 'frage') avFrage();
});
avBox.querySelector('.av-kacheln').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.classList.contains('av-run')) { avStarteBefehle(avTa.value); return; }
  if (b.classList.contains('av-clear')) { avTa.value = ''; return; }
  const t = b.dataset.t === 'gehe zu' ? 'gehe zu ' + avSel.value : b.dataset.t;
  avTa.value = (avTa.value.trim() ? avTa.value.trim() + '\n' : '') + t;
});
function avAufzug(delta) {
  const r = clamp(AV.row + delta, 1, 8);
  if (!avHatAufzug(AV.row) || r === AV.row) { avSag(avHatAufzug(AV.row) ? 'Weiter geht der Aufzug nicht.' : 'Hier gibt es keinen Aufzug.'); return; }
  const w = avWeg(r, AV_DOOR); if (w) { AV.plan = w; AV.befehle = []; AV.folgen = true; }
}

/* ---------- Ein- und Ausschalten ---------- */
const avBtn = document.getElementById('avatarBtn');
function avSetAn(an) {
  AV.an = an; avBox.hidden = !an; document.body.classList.toggle('av-an', an); if (avBtn) { avBtn.setAttribute('aria-pressed', String(an)); avBtn.textContent = an ? 'Steuern beenden' : 'Selbst steuern'; }
  if (an) {
    if (!Object.keys(avDinge).length) avDingeStart();
    if (typeof setFollow === 'function') setFollow(false);
    const aw = canvas.clientWidth - panelWidth();
    state.z = clamp(Math.min((aw - 32) / 1100, (canvas.clientHeight - 200) / 640), 0.35, 2); AV.folgen = true;
    avPanel(); avSag('Hallo! Ich bin R-101. Wohin soll ich fahren?');
  } else { AV.plan = []; AV.befehle = []; if (AV.lift) { AV.blend = { y: AV.lift.y, t: 0 }; AV.lift = null; } }
  state.dirty = true;
}
if (avBtn) avBtn.addEventListener('click', () => avSetAn(!AV.an));

/* ---------- Eingabe ---------- */
window.addEventListener('keydown', e => {
  if (!AV.an || (e.target.closest && e.target.closest('input, textarea, select'))) return;
  if (e.target.closest && e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(k)) { AV.tasten.add(k); }
  else if (k === 'ArrowUp' || k === 'w') avAufzug(-1);
  else if (k === 'ArrowDown' || k === 's') avAufzug(1);
  else if (k === 'e' || k === 'Enter') avTuWas();
  else if (k === 'g') avGreifen();
  else if (k === 'f' || k === 'q') avFrage();
  else return;
  e.preventDefault(); e.stopImmediatePropagation();
}, true);
window.addEventListener('keyup', e => { AV.tasten.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key); });
window.addEventListener('blur', () => AV.tasten.clear());
// Klick im Bild (von engine.js weitergereicht): true heißt, die Figur übernimmt
function avClick(sx, sy, id) {
  if (!AV.an) return false;
  const wx = (sx - state.ox) / state.z, wy = (sy - state.oy) / state.z;
  AV.befehle = [];
  if (id === 'avatar') { select('avatar', false); return true; }
  if (id) {
    const b = byId[id].box(state.f), r = avRowAt(b[1] + b[3] - 4), x = b[0] + b[2] / 2;
    const knopf = KNOEPFE.find(k => k.id === id);
    if (r == null) return false;
    if (!avHin(r, x - (x > AV.x ? 50 : -50), [{ t: 'tu', fn: () => (knopf ? avDruecke() : avFrage(id)) }])) select(id, false);
    return true;
  }
  const r = avRowAt(wy);
  if (r == null) return false;
  avHin(r, wx);
  return true;
}
canvas.addEventListener('pointerdown', () => { if (AV.an) AV.folgen = false; });

/* ---------- Takt ---------- */
let avLast = null, avPanelT = 0;
function avTick(ts) {
  const dt = avLast == null ? 0 : Math.min(0.05, (ts - avLast) / 1000); avLast = ts;
  if (AV.blend) { AV.blend.t += dt / 1.2; if (AV.blend.t >= 1) AV.blend = null; state.dirty = true; }
  if (AV.an) {
    const vorher = AV.x + ',' + AV.y + ',' + AV.arm;
    if (!avTasten(dt)) avSchritt(dt);
    if (!AV.lift || AV.lift.ph === 'ruf') { const fy = avFloor(AV.row, AV.x); AV.y += (fy - AV.y) * Math.min(1, dt * 14); }
    if (vorher !== AV.x + ',' + AV.y + ',' + AV.arm || AV.plan.length) state.dirty = true;
    if (AV.folgen && typeof panelWidth === 'function') {
      const aw = canvas.clientWidth - panelWidth(), ch = canvas.clientHeight;
      const tx = aw / 2 - AV.x * state.z, ty = ch * 0.56 - (AV.y - 60) * state.z, k = reduce ? 1 : 0.12;
      if (Math.abs(tx - state.ox) + Math.abs(ty - state.oy) > 0.5) { state.ox += (tx - state.ox) * k; state.oy += (ty - state.oy) * k; state.dirty = true; }
    }
    if ((avPanelT += dt) > 0.3) { avPanelT = 0; avPanel(); }
  }
  requestAnimationFrame(avTick);
}
requestAnimationFrame(avTick);
