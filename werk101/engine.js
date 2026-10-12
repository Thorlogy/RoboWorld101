/* Werk 101 – Gerüst: Umgebung, Baustellen, Aufzug, Ansicht, Eingabe, Panel. Wird nach den Räumen geladen. */
'use strict';
const byId = Object.fromEntries(ROBOTS.map(r => [r.id, r]));
// Schutzfeld: Klickflächen folgen der angehaltenen Uhr des Roboters (Feldroboter rechnet selbst mit heldG)
for (const id of Object.keys(SAFETY)) if (id !== 'jaeter' && byId[id]) { const b = byId[id].box; byId[id].box = f => b(heldF(id, f)); }
function updateHolds() {
  const p = state.ptr;
  for (const id of Object.keys(SAFETY)) {
    if (!byId[id]) continue;
    const h = HOLD[id] || (HOLD[id] = { off: 0, held: false }), m = SAFETY[id];
    const [x, y, w, hh] = byId[id].box(state.f);
    const near = !!p && p.x > x - m && p.x < x + w + m && p.y > y - m && p.y < y + hh + m;
    if (near !== h.held) { h.held = near; state.dirty = true; }
  }
}
function advanceHolds(d) { for (const id in HOLD) if (HOLD[id].held) HOLD[id].off += d; }
function drawHolds() {
  for (const id in HOLD) {
    if (!HOLD[id].held || !byId[id]) continue;
    const [x, y, w, h] = byId[id].box(state.f), m = SAFETY[id] * 0.6;
    ctx.save(); ctx.fillStyle = 'rgba(240,180,41,0.16)'; ctx.strokeStyle = '#f0b429'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
    rrect(x - m, y - m, w + 2 * m, h + 2 * m, 10); ctx.fill(); ctx.stroke(); ctx.restore();
    const cx = x + w / 2, ty = y - m - 30;
    box(cx - 62, ty, 124, 22, '#f0b429', 4, 1.5);
    text('STOPP · SCHUTZFELD', cx, ty + 15, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  }
}

/* ---------- Häuser ---------- */
// Haus 1: Werk 101. Haus 2: Schule 102 rechts neben dem Schulweg (Spalten 4 und 5, Reihen 4 bis 6)
const H2 = { x: rx(4) - WALL, y: ry(4) - WALL, w: 2 * (RW + WALL) + WALL, h: 3 * (RH + WALL) + WALL };
// Haus 3: Halle 103, eine fensterlose Fabrikhalle mit einem Raum
const H3 = { x: rx(6.5) - WALL, y: ry(6) - WALL, w: RW + 2 * WALL, h: RH + 2 * WALL };
const HOUSES = [{ x: 0, y: TOP - 140, w: BW, h: GROUND - TOP + 140 }, { x: H2.x, y: H2.y - 120, w: H2.w, h: GROUND - H2.y + 120 }, { x: H3.x - 12, y: H3.y - 60, w: H3.w + 24, h: GROUND - H3.y + 60 }];
function drawHalle() {
  ctx.fillStyle = '#7f8a8f'; ctx.fillRect(H3.x, H3.y, H3.w, H3.h);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(H3.x, H3.y, H3.w, H3.h);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(H3.x - 12, H3.y - 10, H3.w + 24, 14);
  for (let i = 0; i < 3; i++) box(H3.x + 60 + i * 120, H3.y - 26, 80, 16, '#8a8f94', 2, 1.5);
  box(H3.x + H3.w - 230, H3.y - 58, 200, 40, '#2a2723');
  text('HALLE 103', H3.x + H3.w - 130, H3.y - 28, 30, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#f3efe4' });
}
function drawSchool(f) {
  ctx.fillStyle = '#9a6a52'; ctx.fillRect(H2.x, H2.y, H2.w, H2.h);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(H2.x, H2.y, H2.w, H2.h);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(H2.x - 12, H2.y - 10, H2.w + 24, 14);
  // Dach: Solarmodule, Wetterstation und Schild
  for (let i = 0; i < 6; i++) { ctx.beginPath(); const x = H2.x + 520 + i * 70; ctx.moveTo(x, H2.y - 10); ctx.lineTo(x + 56, H2.y - 10); ctx.lineTo(x + 46, H2.y - 40); ctx.lineTo(x - 4, H2.y - 40); ctx.closePath(); paint('#23384d', INK, 1.5); }
  line(H2.x + H2.w - 80, H2.y - 10, H2.x + H2.w - 80, H2.y - 110, INK, 3);
  const spin = TAU * state.g / 40; for (let i = 0; i < 3; i++) { const a = spin + i * TAU / 3; line(H2.x + H2.w - 80, H2.y - 110, H2.x + H2.w - 80 + Math.cos(a) * 16, H2.y - 110 + Math.sin(a) * 5, INK, 2); circle(H2.x + H2.w - 80 + Math.cos(a) * 16, H2.y - 110 + Math.sin(a) * 5, 4, '#f3f1ea', INK, 1); }
  for (const x of [H2.x + 60, H2.x + 330]) line(x, H2.y - 10, x, H2.y - 70, INK, 4);
  box(H2.x + 30, H2.y - 128, 340, 66, '#2a2723');
  text('SCHULE 102', H2.x + 200, H2.y - 78, 52, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#f3efe4' });
  ctx.fillStyle = '#3e6f9e'; ctx.fillRect(H2.x + 30, H2.y - 128, 14, 66);
}

/* ---------- Wetter und Tageszeit ---------- */
const SKY = { sonne: ['#8fb1bd', '#bfd2d4', '#e3dccb'], regen: ['#6f7f86', '#8f9ca0', '#b3b1a8'], abend: ['#131b36', '#3a3d63', '#b8705a'] };
const WETTER = ['sonne', 'regen', 'abend'], WETTER_NAME = { sonne: 'Sonne', regen: 'Regen', abend: 'Abend' };
// Regen: schräge Striche überall draußen oberhalb des Bodens; Dichte folgt dem Bildschirm, nicht der Welt
function drawRain(x0, y0, x1, y1) {
  const step = 46 / Math.min(1, state.z), len = 18, t = state.g * 9;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); for (const h of HOUSES) ctx.rect(h.x, h.y, h.w, h.h); ctx.clip('evenodd');
  ctx.strokeStyle = 'rgba(220,232,240,0.55)'; ctx.lineWidth = 1.4 / Math.min(1, state.z); ctx.beginPath();
  const ya = Math.max(y0, -4000), yb = Math.min(y1, GROUND);
  for (let x = Math.floor(x0 / step) * step; x < x1; x += step) for (let y = Math.floor(ya / step) * step; y < yb; y += step) {
    const k = (x * 7 + y * 13) % 97, yy = y + ((t + k * 5) % step);
    if (yy > yb) continue;
    ctx.moveTo(x + k % 20, yy); ctx.lineTo(x + k % 20 - 5, yy + len);
  }
  ctx.stroke(); ctx.restore();
}
// Abend und Regen: draußen abdunkeln, das Haus und alles unter der Erde bleibt hell
function shadeOutside(x0, y0, x1, y1, color) {
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, Math.max(0, GROUND - y0)); for (const h of HOUSES) ctx.rect(h.x, h.y, h.w, h.h);
  ctx.fillStyle = color; ctx.fill('evenodd'); ctx.restore();
}
function glow(x, y, r, color) {
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(255,220,140,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

/* ---------- Zeichnen: Umgebung ---------- */
function drawSurroundings(f) {
  const g = ctx.createLinearGradient(0, TOP - 700, 0, GROUND), sky = SKY[state.wetter] || SKY.sonne;
  g.addColorStop(0, sky[0]); g.addColorStop(0.55, sky[1]); g.addColorStop(1, sky[2]);
  ctx.fillStyle = g; ctx.fillRect(-9000, -6000, BW + 18000, GROUND + 6000);
  if (state.wetter === 'abend') { ctx.fillStyle = '#f3efe4'; for (let i = 0; i < 160; i++) { const x = ((i * 733) % 9000) - 3200, y = TOP - 680 + ((i * 397) % 1500); ctx.fillRect(x, y, 3, 3); } }
  // Hintergrund-Silhouetten
  ctx.fillStyle = state.wetter === 'abend' ? '#3b4566' : state.wetter === 'regen' ? '#8b989c' : '#9eb6bb';
  [[-900, 600], [-620, 380], [-420, 860], [BW + 120, 700], [BW + 420, 420], [BW + 700, 980]].forEach(([x, h]) => ctx.fillRect(x, GROUND - h, 240, h));
  ctx.fillStyle = '#b4c7c9';
  [[-1300, 420], [BW + 1000, 520]].forEach(([x, h]) => ctx.fillRect(x, GROUND - h, 300, h));
  // Erde
  const e = ctx.createLinearGradient(0, GROUND, 0, BOTTOM + 400);
  e.addColorStop(0, '#7a6450'); e.addColorStop(1, '#4d3e31');
  ctx.fillStyle = e; ctx.fillRect(-9000, GROUND, BW + 18000, 6000);
  ctx.fillStyle = '#6f8f5a'; ctx.fillRect(-9000, GROUND - 6, BW + 18000, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let i = 0; i < 90; i++) { const x = ((i * 377) % (BW + 2400)) - 1200, y = GROUND + 40 + ((i * 211) % 1400); ctx.beginPath(); ctx.arc(x, y, 3 + (i % 4), 0, TAU); ctx.fill(); }
  // Ebenen-Beschriftung links
  for (let r = 0; r < ROWS; r++) {
    if (ROOMS.some(o => o.r === r && o.c < 0)) continue;
    text(LEVELS[r].toUpperCase(), -24, ry(r) + RH / 2 + 8, 26, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'right', color: r >= 7 ? '#e8dfd0' : '#2a2723' });
  }
}
function drawBuilding() {
  ctx.fillStyle = '#7d7972'; ctx.fillRect(0, TOP, BW, BOTTOM - TOP);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(0, TOP, BW, BOTTOM - TOP);
  // Dachkante und Schriftzug
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(-12, TOP - 10, BW + 24, 14);
  for (const x of [60, 330]) line(x, TOP - 10, x, TOP - 70, INK, 4);
  box(30, TOP - 128, 340, 66, '#2a2723');
  text('WERK 101', 200, TOP - 78, 52, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#f3efe4' });
  ctx.fillStyle = '#d9542b'; ctx.fillRect(30, TOP - 128, 14, 66);
}
function drawCrane(f) {
  const cx = 1180, base = TOP - 10, topY = base - 300;
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.fillStyle = '#e0a526'; ctx.fillRect(cx - 14, topY, 28, base - topY); ctx.strokeRect(cx - 14, topY, 28, base - topY);
  ctx.beginPath(); for (let y = topY; y < base; y += 28) { ctx.moveTo(cx - 14, y); ctx.lineTo(cx + 14, y + 28); ctx.moveTo(cx + 14, y); ctx.lineTo(cx - 14, y + 28); } ctx.stroke();
  // Ausleger
  box(cx - 140, topY - 18, 520, 18, '#e0a526');
  box(cx - 150, topY - 4, 60, 38, '#8a8f94');
  line(cx, topY - 70, cx - 140, topY - 18); line(cx, topY - 70, cx + 380, topY - 18);
  line(cx, topY - 70, cx, topY - 18, INK, 3);
  // Laufkatze und Last
  const t = 0.5 - 0.5 * Math.cos(TAU * f / 60);
  const kx = cx + 60 + 260 * t, ropeEnd = topY + 120 + 6 * Math.sin(TAU * f / 30);
  box(kx - 14, topY, 28, 12, '#5f5b55');
  line(kx, topY + 12, kx, ropeEnd, INK, 1.5);
  box(kx - 46, ropeEnd, 92, 54, '#c9a46a');
  line(kx - 46, ropeEnd, kx, ropeEnd - 14, INK, 1.5); line(kx + 46, ropeEnd, kx, ropeEnd - 14, INK, 1.5);
  text('EBENE 5', kx, ropeEnd + 24, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
  text('OP-ROBOTER', kx, ropeEnd + 42, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
}

/* ---------- Zeichnen: Baustelle ---------- */
function drawSite(room, f) {
  const under = room.r >= 7;
  ctx.fillStyle = under ? '#bdb5a5' : '#d8d2c4'; ctx.fillRect(0, 0, RW, RH);
  ctx.strokeStyle = under ? '#aea594' : '#cac3b2'; ctx.lineWidth = 2;
  ctx.beginPath(); for (let i = -RH; i < RW; i += 30) { ctx.moveTo(i, RH); ctx.lineTo(i + RH, 0); } ctx.stroke();
  ctx.fillStyle = '#9b8f7a'; ctx.fillRect(0, 360, RW, 40);
  // Gerüst
  for (const x of [470, 560]) { ctx.fillStyle = '#b8bcc0'; ctx.fillRect(x - 4, 120, 8, 240); ctx.strokeStyle = INK; ctx.strokeRect(x - 4, 120, 8, 240); }
  for (const y of [180, 270]) box(456, y, 118, 10, '#a8763f');
  line(470, 180, 560, 270, '#8a8f94', 3); line(560, 180, 470, 270, '#8a8f94', 3);
  // Pylon
  ctx.beginPath(); ctx.moveTo(600, 360); ctx.lineTo(612, 322); ctx.lineTo(624, 360); ctx.closePath(); paint('#e0662b');
  ctx.fillStyle = '#fff'; ctx.fillRect(605, 340, 14, 5);
  text(LEVELS[room.r].toUpperCase(), 28, 46, 15, { family: '"IBM Plex Mono", monospace', weight: 500, color: '#5d564b' });
  text(room.name.toUpperCase(), 28, 92, 40, { family: '"Saira Condensed", sans-serif', weight: 700 });
  box(28, 108, 128, 26, '#2a2723');
  text('IN PLANUNG', 92, 126, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  wrap(room.plan, 28, 168, 400, 22, 16, { color: '#3b3731' });
}
function drawEmpty(r) {
  ctx.fillStyle = r >= 7 ? '#a99f8d' : '#c7c0b0'; ctx.fillRect(0, 0, RW, RH);
  ctx.strokeStyle = 'rgba(42,39,35,0.12)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); for (let i = -RH; i < RW; i += 14) { ctx.moveTo(i, RH); ctx.lineTo(i + RH, 0); } ctx.stroke();
  text('FREIE FLÄCHE', RW / 2, RH / 2 + 8, 26, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: 'rgba(42,39,35,0.45)' });
}


/* ---------- Aufzug ---------- */
function drawShaft(f) {
  const x0 = SHAFT_X, y0 = ry(1), y1 = ry(8) + RH;
  ctx.fillStyle = '#5c5953'; ctx.fillRect(x0, y0, SHAFT, y1 - y0);
  ctx.fillStyle = '#4a4742'; ctx.fillRect(x0, ry(0), SHAFT, RH);
  for (const x of [x0 + 10, x0 + SHAFT - 10]) line(x, y0, x, y1, '#8a8f94', 3);
  for (let r = 1; r < ROWS; r++) { ctx.fillStyle = '#6d6a64'; ctx.fillRect(x0, ry(r) + RH, SHAFT, WALL); }
  text('AUFZUG', x0 + SHAFT / 2, ry(0) + 60, 22, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#e8e4da' });
  box(x0 + 40, ry(0) + 300, 80, 60, '#3b3d40', 3);
  const turn = TAU * f / 20;
  circle(x0 + 80, ry(0) + 330, 18, '#8a8f94'); line(x0 + 80, ry(0) + 330, x0 + 80 + 15 * Math.cos(turn), ry(0) + 330 + 15 * Math.sin(turn), INK, 2.5);
  const cy = cabinY(state.g);
  line(x0 + 80, ry(0) + 348, x0 + 80, cy, INK, 2);
  box(x0 + 16, cy, 128, 112, '#cfcac0', 3);
  ctx.fillStyle = '#e8e4da'; ctx.fillRect(x0 + 24, cy + 8, 112, 96);
  line(x0 + 24, cy + 104, x0 + 136, cy + 104, INK, 2);
}

/* ---------- Gesamtbild ---------- */
function draw() {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr * state.z, 0, 0, dpr * state.z, dpr * state.ox, dpr * state.oy);
  ctx.lineJoin = 'round';
  const f = state.f;
  const vx0 = -state.ox / state.z, vy0 = -state.oy / state.z;
  const vx1 = vx0 + canvas.clientWidth / state.z, vy1 = vy0 + canvas.clientHeight / state.z;
  const visible = (x, y, w, h) => x < vx1 && x + w > vx0 && y < vy1 && y + h > vy0;

  drawSurroundings(f);
  drawBuilding();
  drawCrane(f);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < 3; c++) {
    const x = rx(c), y = ry(r);
    if (!visible(x, y, RW, RH)) continue;
    const room = ROOMS.find(o => o.r === r && o.c === c);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, RW, RH); ctx.clip(); ctx.translate(x, y);
    if (!room) drawEmpty(r);
    else if (BUILT.find(d => d.key === room.built)) BUILT.find(d => d.key === room.built).draw(f);
    else drawSite(room, f);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x, y, RW, RH);
  }
  // Außengelände: Räume links neben dem Haus, ohne Wände und Decke
  for (const room of ROOMS) {
    if (!room.outdoor || !isOpen(room)) continue;
    const x = rx(room.c), y = ry(room.r), def = BUILT.find(d => d.key === room.built);
    if (!def || !visible(x, y, RW, RH)) continue;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, RW, RH + 8); ctx.clip(); ctx.translate(x, y); def.draw(f); ctx.restore();
  }
  // Haus 2: Schule
  if (visible(H2.x, H2.y - 140, H2.w, H2.h + 140)) {
    drawSchool(f);
    for (const room of ROOMS) {
      if (room.haus !== 2) continue;
      const x = rx(room.c), y = ry(room.r), def = BUILT.find(d => d.key === room.built);
      if (!def || !visible(x, y, RW, RH)) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, RW, RH); ctx.clip(); ctx.translate(x, y); def.draw(f); ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x, y, RW, RH);
    }
  }
  // Haus 3: Halle 103
  if (visible(H3.x, H3.y - 60, H3.w, H3.h + 60)) {
    drawHalle();
    for (const room of ROOMS) {
      if (room.haus !== 3) continue;
      const x = rx(room.c), y = ry(room.r), def = BUILT.find(d => d.key === room.built);
      if (!def) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, RW, RH); ctx.clip(); ctx.translate(x, y); def.draw(f); ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x, y, RW, RH);
    }
  }
  if (visible(SHAFT_X, ry(0), SHAFT, BOTTOM)) drawShaft(f);
  RUNNERS.forEach(r => r.draw(state.g));
  drawHolds();
  if (state.wetter === 'regen') { drawRain(vx0, vy0, vx1, vy1); shadeOutside(vx0, vy0, vx1, vy1, 'rgba(40,52,62,0.16)'); }
  if (state.wetter === 'abend') {
    shadeOutside(vx0, vy0, vx1, vy1, 'rgba(12,18,48,0.45)');
    // Lichter der Außenfelder nach dem Abdunkeln, damit sie leuchten
    for (const room of ROOMS) {
      const def = room.outdoor && isOpen(room) && BUILT.find(d => d.key === room.built);
      if (!def || !def.glow || !visible(rx(room.c), ry(room.r), RW, RH)) continue;
      ctx.save(); ctx.translate(rx(room.c), ry(room.r)); def.glow(f); ctx.restore();
    }
    RUNNERS.forEach(r => r.glow && r.glow(state.g));
  }

  const sel = state.sel && byId[state.sel];
  if (sel) {
    const [x, y, w, h] = sel.box(f);
    ctx.setLineDash([8, 6]); ctx.strokeStyle = '#d9542b'; ctx.lineWidth = 3 / Math.min(state.z, 1.5) ; ctx.strokeRect(x - 6, y - 6, w + 12, h + 12); ctx.setLineDash([]);
  }
}

/* ---------- Ansicht ---------- */
function panelWidth() { return window.innerWidth > 760 ? document.getElementById('panel').offsetWidth + 32 : 0; }
function panelBottom() { return window.innerWidth > 760 ? 0 : document.getElementById('panel').offsetHeight + 32; }
function fit(x, y, w, h, animate = true) {
  const aw = canvas.clientWidth - panelWidth(), topPad = window.innerWidth > 760 ? 150 : 120;
  const ah = canvas.clientHeight - topPad - panelBottom() - 16;
  const z = clamp(Math.min((aw - 32) / w, ah / h), 0.06, 4);
  const target = { z, ox: (aw - w * z) / 2 - x * z, oy: topPad + (ah - h * z) / 2 - y * z };
  if (!animate || reduce) { Object.assign(state, target); state.dirty = true; return; }
  const from = { z: state.z, ox: state.ox, oy: state.oy }, t0 = performance.now(), dur = 520;
  const step = now => {
    const t = ease(clamp((now - t0) / dur, 0, 1));
    state.z = lerp(from.z, target.z, t); state.ox = lerp(from.ox, target.ox, t); state.oy = lerp(from.oy, target.oy, t);
    state.dirty = true; if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const fitRoom = (key, a) => { const o = roomOf(key); fit(rx(o.c) - 30, ry(o.r) - 40, RW + 60, RH + 80, a); };
const fitAll = a => { const c0 = Math.min(...ROOMS.map(o => o.c)), c1 = Math.max(...ROOMS.map(o => o.c)), xr = c1 >= 3 ? rx(c1) + RW + 40 : BW + 60; fit(rx(c0) - 40, TOP - 560, xr - rx(c0) + 40, BOTTOM - TOP + 580, a); };
function zoomAt(factor, sx, sy) {
  const nz = clamp(state.z * factor, 0.06, 5);
  const wx = (sx - state.ox) / state.z, wy = (sy - state.oy) / state.z;
  state.z = nz; state.ox = sx - wx * nz; state.oy = sy - wy * nz; state.dirty = true;
}
function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(canvas.clientWidth * dpr); canvas.height = Math.round(canvas.clientHeight * dpr);
  state.dirty = true;
}

/* ---------- Treffer ---------- */
function hitAt(sx, sy) {
  const wx = (sx - state.ox) / state.z, wy = (sy - state.oy) / state.z;
  const order = BUILT.filter(d => isOpen(roomOf(d.key))).flatMap(d => d.hitOrder).concat(RUNNERS.map(r => r.robot.id));
  for (const id of order) {
    const [x, y, w, h] = byId[id].box(state.f);
    if (wx >= x - 4 && wx <= x + w + 4 && wy >= y - 4 && wy <= y + h + 4) return id;
  }
  return null;
}

/* ---------- Eingabe ---------- */
const pointers = new Map();
let drag = null, pinch = null;
canvas.addEventListener('pointerdown', e => {
  setFollow(false);
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 1) drag = { x: e.clientX, y: e.clientY, ox: state.ox, oy: state.oy, moved: 0 };
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: state.z }; drag = null;
  }
});
canvas.addEventListener('pointermove', e => {
  if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    zoomAt((pinch.z * d / pinch.d) / state.z, (a.x + b.x) / 2, (a.y + b.y) / 2);
    return;
  }
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
    if (drag.moved > 4) { canvas.classList.add('dragging'); state.ox = drag.ox + dx; state.oy = drag.oy + dy; state.dirty = true; }
    return;
  }
  const h = hitAt(e.clientX, e.clientY);
  canvas.classList.toggle('over', !!h);
});
function endPointer(e) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (drag && pointers.size === 0) {
    if (drag.moved <= 4) { const id = hitAt(e.clientX, e.clientY); if (id === 'lichtschalter') state.licht = !state.licht; if (id === 'notausgang') knock(); select(id, false); }
    drag = null; canvas.classList.remove('dragging');
  }
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('pointermove', e => { state.ptr = { x: (e.clientX - state.ox) / state.z, y: (e.clientY - state.oy) / state.z }; updateHolds(); });
canvas.addEventListener('pointerleave', () => { state.ptr = null; updateHolds(); });
canvas.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') { state.ptr = null; updateHolds(); } });
canvas.addEventListener('pointerdown', e => { state.ptr = { x: (e.clientX - state.ox) / state.z, y: (e.clientY - state.oy) / state.z }; updateHolds(); });
canvas.addEventListener('wheel', e => { e.preventDefault(); zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY); }, { passive: false });
window.addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
  const cx = (canvas.clientWidth - panelWidth()) / 2, cy = canvas.clientHeight / 2;
  if (e.key === '+' || e.key === '=') zoomAt(1.25, cx, cy);
  else if (e.key === '-') zoomAt(0.8, cx, cy);
  else if (e.key === 'ArrowLeft') { state.ox += 60; state.dirty = true; }
  else if (e.key === 'ArrowRight') { state.ox -= 60; state.dirty = true; }
  else if (e.key === 'ArrowUp') { state.oy += 60; state.dirty = true; }
  else if (e.key === 'ArrowDown') { state.oy -= 60; state.dirty = true; }
  else if (e.key === ' ') { e.preventDefault(); setPlaying(!state.playing); }
  else if (e.key === 'Escape') select(null, false);
  else return;
});

/* ---------- Panel ---------- */
const chipsEl = document.getElementById('chips'), listEl = document.getElementById('list');
const FILTERS = ['Alle', 'Industrie', 'Service', 'Haushalt', 'Logistik', 'Medizin', 'Forschung', 'Inspektion', 'Geschichte', 'Raumfahrt', 'Mobilität', 'Landwirtschaft', 'Rettung', 'Unterwasser', 'Bildung', 'Medien', 'Umwelt', 'Energie', 'Bau'];
const roomsEl = document.getElementById('rooms');
BUILT.forEach(o => {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = o.name; b.dataset.key = o.key;
  if (!isOpen(roomOf(o.key))) b.hidden = true;
  b.addEventListener('click', () => { state.room = o.key; state.sel = null; renderPanel(); state.dirty = true; fitRoom(o.key, true); });
  roomsEl.appendChild(b);
});
const OPEN_ROOMS = ROOMS.filter(o => !o.secret), OPEN_BUILT = BUILT.filter(d => !roomOf(d.key) || !roomOf(d.key).secret);
document.querySelector('.bar i').style.width = (OPEN_BUILT.length / OPEN_ROOMS.length * 100).toFixed(1) + '%';
document.getElementById('progressText').textContent = OPEN_BUILT.length === OPEN_ROOMS.length ? `Alle ${OPEN_ROOMS.length} Räume gebaut. Unterwegs sind außerdem Lieferroboter, Fassadendrohne, Rohrpost und ein Paket vom Hafen bis in den Wohnbereich. Draußen: Straße, Park, Feld, Energiepark, Solarpark, Schulweg, U-Bahn mit Tunnel und eine Tunnelbaustelle. Rechts stehen die Schule 102 und die Halle 103, eine Fabrik, in der das Licht aus ist. Am Himmel fliegen Flugtaxis und Lieferdrohnen.` : `${OPEN_BUILT.length} von ${OPEN_ROOMS.length} Räumen gebaut. Der Rest ist Baustelle.`;
FILTERS.forEach(name => {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = name;
  b.setAttribute('aria-pressed', String(name === 'Alle'));
  b.addEventListener('click', () => { state.filter = name; renderPanel(); state.dirty = true; });
  chipsEl.appendChild(b);
});
ROBOTS.forEach(r => {
  const li = document.createElement('li'); li.dataset.id = r.id;
  const b = document.createElement('button'); b.type = 'button';
  b.innerHTML = `<span class="dot"></span><span></span><span class="tag"></span>`;
  b.children[0].style.background = r.color; b.children[1].textContent = r.name; b.children[2].textContent = r.bereich;
  b.addEventListener('click', () => select(state.sel === r.id ? null : r.id, true));
  li.appendChild(b); listEl.appendChild(li);
});
function renderPanel() {
  [...chipsEl.children].forEach(b => b.setAttribute('aria-pressed', String(b.textContent === state.filter)));
  [...roomsEl.children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.key === state.room)));
  const cur = BUILT.find(o => o.key === state.room);
  document.getElementById('roomLevel').textContent = `${cur.level} · fertig`;
  document.getElementById('roomName').textContent = cur.name;
  [...listEl.children].forEach(li => {
    const r = byId[li.dataset.id];
    li.hidden = r.room !== state.room;
    li.classList.toggle('dim', state.filter !== 'Alle' && r.bereich !== state.filter);
    li.firstChild.setAttribute('aria-current', String(state.sel === r.id));
  });
  const card = document.getElementById('card');
  const r = state.sel && byId[state.sel];
  card.hidden = !r;
  if (r) {
    document.getElementById('cardName').textContent = r.name;
    const meta = document.getElementById('cardMeta'); meta.innerHTML = '';
    [r.bereich, r.typ, r.aera].forEach(t => { const s = document.createElement('span'); s.textContent = t; meta.appendChild(s); });
    const kid = simpleMode && typeof KINDER !== 'undefined' && KINDER[r.id];
    document.getElementById('cardFact').textContent = kid || r.fakt;
    document.getElementById('cardNote').textContent = r.note + (SAFETY[r.id] ? ' Probier es aus: Geh mit der Maus oder dem Finger nah heran, dann hält er an.' : '');
    const src = document.getElementById('cardSrc'); src.hidden = !r.quelle; src.textContent = '';
    if (r.quelle) { const a = document.createElement('a'); a.href = r.quelle; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Quelle: ' + new URL(r.quelle).hostname.replace(/^www\./, ''); src.append(a); }
    const real = document.getElementById('cardReal'); real.hidden = !r.echt; real.innerHTML = r.echt ? '<b>In echt:</b> ' : ''; if (r.echt) real.append(r.echt);
  }
}
// Schalter „Einfach erklärt“: Kinderfassung der Karten (Text in kinder.js), Wahl bleibt im Browser
let simpleMode = false;
try { simpleMode = localStorage.getItem('werk101-einfach') === '1'; } catch (e) {}
const simpleBtn = document.getElementById('simple');
if (simpleBtn) {
  simpleBtn.setAttribute('aria-pressed', String(simpleMode));
  simpleBtn.addEventListener('click', () => {
    simpleMode = !simpleMode; simpleBtn.setAttribute('aria-pressed', String(simpleMode));
    try { localStorage.setItem('werk101-einfach', simpleMode ? '1' : '0'); } catch (e) {}
    renderPanel();
  });
}
function select(id, fly) {
  state.sel = id;
  if (id) state.room = byId[id].room;
  renderPanel(); state.dirty = true;
  const panel = document.getElementById('panel');
  if (id && panel.classList.contains('collapsed')) toggleCollapse(false);
  if (id && fly) {
    const [x, y, w, h] = byId[id].box(state.f);
    const pad = Math.max(w, h) * 1.6;
    fit(x + w / 2 - pad, y + h / 2 - pad, pad * 2, pad * 2);
  }
}
function toggleCollapse(force) {
  const panel = document.getElementById('panel'), btn = document.getElementById('panelToggle');
  const collapsed = typeof force === 'boolean' ? force : !panel.classList.contains('collapsed');
  panel.classList.toggle('collapsed', collapsed);
  btn.textContent = collapsed ? 'Roboter zeigen' : 'Einklappen';
  btn.setAttribute('aria-expanded', String(!collapsed));
}
document.getElementById('panelToggle').addEventListener('click', () => toggleCollapse());

/* ---------- Steuerung ---------- */
const playBtn = document.getElementById('play'), frameEl = document.getElementById('frame');
function setPlaying(p) {
  state.playing = p;
  playBtn.textContent = p ? 'Pause' : 'Abspielen';
  playBtn.setAttribute('aria-pressed', String(!p));
}
playBtn.addEventListener('click', () => setPlaying(!state.playing));
document.getElementById('step').addEventListener('click', () => { setPlaying(false); advanceHolds(1); state.g = (state.g + 1) % 480; state.f = state.g % 60; acc = state.g / 12; state.dirty = true; });
document.getElementById('zoomIn').addEventListener('click', () => zoomAt(1.3, (canvas.clientWidth - panelWidth()) / 2, canvas.clientHeight / 2));
document.getElementById('zoomOut').addEventListener('click', () => zoomAt(1 / 1.3, (canvas.clientWidth - panelWidth()) / 2, canvas.clientHeight / 2));
document.getElementById('goRoom').addEventListener('click', () => { setFollow(false); fitRoom(state.room, true); });
document.getElementById('goAll').addEventListener('click', () => { setFollow(false); fitAll(true); });
// Paket verfolgen: Ansicht fährt der Paketreise hinterher (weich, damit Sprünge zwischen Hafen und Wohnbereich gleiten)
const followBtn = document.getElementById('follow');
function setFollow(on) {
  if (!followBtn || state.follow === on) return;
  state.follow = on;
  followBtn.textContent = on ? 'Verfolgen beenden' : 'Paket verfolgen';
  followBtn.setAttribute('aria-pressed', String(on));
  if (on) { const aw = canvas.clientWidth - panelWidth(), ah = canvas.clientHeight - panelBottom() - 140; state.z = clamp(Math.min((aw - 32) / 760, ah / 520), 0.3, 2.5); followView(1); }
}
function followView(k) {
  const p = paketFokus(state.g), aw = canvas.clientWidth - panelWidth();
  const cy = (window.innerWidth > 760 ? 150 : 120) + (canvas.clientHeight - (window.innerWidth > 760 ? 150 : 120) - panelBottom()) / 2;
  state.ox += (aw / 2 - p.x * state.z - state.ox) * k; state.oy += (cy - p.y * state.z - state.oy) * k; state.dirty = true;
}
if (followBtn) followBtn.addEventListener('click', () => setFollow(!state.follow));
const wetterBtn = document.getElementById('wetter');
if (wetterBtn) wetterBtn.addEventListener('click', () => {
  state.wetter = WETTER[(WETTER.indexOf(state.wetter) + 1) % WETTER.length];
  wetterBtn.textContent = 'Wetter: ' + WETTER_NAME[state.wetter]; state.dirty = true;
});
if (reduce) document.getElementById('hint').textContent = 'Die Bewegung ist angehalten, weil dein System reduzierte Bewegung wünscht. Mit „Abspielen“ läuft sie trotzdem.';

let acc = 0, last = null, shownF = -1;
function tick(ts) {
  if (last == null) last = ts;
  const dt = Math.min(0.25, (ts - last) / 1000); last = ts;
  if (state.playing) {
    acc = (acc + dt) % 40;
    const ng = Math.floor(acc * 12) % 480;
    if (ng !== state.g) { advanceHolds((ng - state.g + 480) % 480); state.g = ng; state.f = ng % 60; state.dirty = true; updateHolds(); }
  }
  if (state.f !== shownF) { frameEl.textContent = `Bild ${String(state.f + 1).padStart(2, '0')} / 60`; shownF = state.f; }
  if (state.follow) followView(reduce ? 1 : 0.12);
  if (state.dirty) { state.dirty = false; draw(); }
  requestAnimationFrame(tick);
}

window.addEventListener('resize', () => { resize(); });
resize();
setPlaying(state.playing);
renderPanel();
if (window.innerWidth <= 760) toggleCollapse(true);
if (location.hash === '#fertigung') state.room = 'fertigung';
renderPanel();
fitRoom(state.room, false);
if (location.hash === '#haus') fitAll(false);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { state.dirty = true; });
requestAnimationFrame(tick);

/* ---------- Geheimer Raum: dreimal am Notausgang im Tunnel anklopfen ---------- */
window.secretKnocks = 0;
try { state.secret = localStorage.getItem('werk101-geheim') === '1'; } catch (e) {}
function unlockSecret() {
  state.secret = true; state.dirty = true;
  try { localStorage.setItem('werk101-geheim', '1'); } catch (e) {}
  const key = (ROOMS.find(o => o.secret) || {}).built;
  const b = key && document.querySelector(`#rooms button[data-key="${key}"]`); if (b) b.hidden = false;
  const t = document.querySelector('.toast');
  if (t) { t.textContent = 'Geheimer Raum entdeckt!'; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2600); }
  if (key) setTimeout(() => { state.room = key; state.sel = null; renderPanel(); fitRoom(key, true); }, 700);
}
function knock() {
  if (state.secret) return;
  window.secretKnocks = (window.secretKnocks || 0) + 1; state.dirty = true;
  if (window.secretKnocks >= 3) unlockSecret();
}
if (state.secret) document.querySelectorAll('#rooms button').forEach(b => { b.hidden = false; });
