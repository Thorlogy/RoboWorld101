/* Datennetz: Knopf „Datennetz“ legt eine Röntgenansicht über die Welt.
   Orange: Glasfaser im Boden und Leitungen in den Häusern. Blau: Funk vom Mast. Weiß: Verbindung zum Satelliten.
   Alle Pakete laufen mit state.g und kommen nach 480 Takten genau wieder am Start an. */
const NZ_ORANGE = '#ffb347', NZ_BLUE = '#7fd3ff', NZ_WHITE = '#f3f1ea';
function nzLinks() {
  const T = GROUND - 3, WX = SHAFT_X + SHAFT / 2, SX = rx(5) - WALL / 2, HX = rx(6.5) + RW / 2, ZX = rx(9) - WALL / 2;
  const L = [];
  L.push({ pts: [{ x: rx(-5) + 120, y: T }, { x: H4.x + H4.w - 60, y: T }], col: NZ_ORANGE, n: 14, both: true, speed: 2 });
  L.push({ pts: [{ x: WX, y: ry(8) + 24 }, { x: WX, y: ry(0) + 24 }], col: NZ_ORANGE, n: 6, both: true, speed: 2 });
  for (let r = 0; r < ROWS; r++) L.push({ pts: [{ x: WX, y: ry(r) + 24 }, { x: 24, y: ry(r) + 24 }], col: NZ_ORANGE, n: 2, both: true, speed: 1 });
  L.push({ pts: [{ x: SX, y: T }, { x: SX, y: ry(5) + 24 }], col: NZ_ORANGE, n: 3, both: true, speed: 2 });
  for (const r of [5, 6]) L.push({ pts: [{ x: rx(4) + 24, y: ry(r) + 24 }, { x: rx(5) + RW - 24, y: ry(r) + 24 }], col: NZ_ORANGE, n: 3, both: true, speed: 1 });
  L.push({ pts: [{ x: HX, y: T }, { x: HX, y: ry(6) + 24 }, { x: rx(6.5) + 30, y: ry(6) + 24 }], col: NZ_ORANGE, n: 2, both: true, speed: 1 });
  L.push({ pts: [{ x: ZX, y: T }, { x: ZX, y: H4.y - 10 }], col: NZ_ORANGE, n: 3, both: true, speed: 3 });
  L.push({ pts: [{ x: rx(8) + 24, y: ry(6) + 24 }, { x: rx(9) + RW - 24, y: ry(6) + 24 }], col: NZ_ORANGE, n: 4, both: true, speed: 2 });
  L.push({ pts: [{ x: RZ_MAST.x, y: T }, { x: RZ_MAST.x, y: RZ_MAST.top + 10 }], col: NZ_ORANGE, n: 2, both: true, speed: 2 });
  L.push({ pts: [{ x: RZ_DISH.x, y: RZ_DISH.y }, { x: RZ_DISH.x + 700, y: TOP - 860 }], col: NZ_WHITE, n: 3, both: true, speed: 1, dash: true });
  return L;
}
function nzLen(pts) { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return s; }
function nzAt(pts, t) {
  let d = t * nzLen(pts);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= l) return { x: lerp(a.x, b.x, d / l), y: lerp(a.y, b.y, d / l) };
    d -= l;
  }
  return pts[pts.length - 1];
}
function nzTag(t, x, y, k, col) {
  const size = 12 * k;
  ctx.font = `500 ${size}px "IBM Plex Mono", monospace`;
  const w = ctx.measureText(t).width + 14 * k;
  ctx.fillStyle = 'rgba(12,18,40,0.92)'; ctx.fillRect(x - w / 2, y - size - 6 * k, w, size + 12 * k);
  ctx.strokeStyle = col; ctx.lineWidth = 1.5 * k; ctx.strokeRect(x - w / 2, y - size - 6 * k, w, size + 12 * k);
  text(t, x, y, size, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: col });
}
function drawNetz(vx0, vy0, vx1, vy1) {
  const g = state.g, k = clamp(1 / state.z, 1, 7);
  ctx.fillStyle = 'rgba(8,12,28,0.6)'; ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
  // Funkwellen vom Mast
  for (let i = 0; i < 4; i++) {
    const r = (g * 4 + i * 120) % 480;
    ctx.save(); ctx.globalAlpha = 0.8 * (1 - r / 480);
    ctx.beginPath(); ctx.arc(RZ_MAST.x, RZ_MAST.top + 10, 20 + r * 2.2, Math.PI * 1.05, Math.PI * 1.95);
    ctx.strokeStyle = NZ_BLUE; ctx.lineWidth = 3 * k; ctx.stroke(); ctx.restore();
  }
  for (const L of nzLinks()) {
    ctx.save(); if (L.dash) ctx.setLineDash([14 * k, 10 * k]);
    ctx.beginPath(); ctx.moveTo(L.pts[0].x, L.pts[0].y); for (const p of L.pts.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = L.col; ctx.globalAlpha = 0.55; ctx.lineWidth = 3 * k; ctx.stroke(); ctx.restore();
    for (let i = 0; i < L.n; i++) {
      let t = (g * L.speed / 480 + i / L.n) % 1;
      if (L.both && i % 2) t = 1 - t;
      const p = nzAt(L.pts, t), s = 4 * k;
      glow(p.x, p.y, 10 * k, L.col === NZ_WHITE ? 'rgba(243,241,234,0.8)' : 'rgba(255,179,71,0.8)');
      ctx.fillStyle = L.col; ctx.fillRect(p.x - s, p.y - s, 2 * s, 2 * s);
    }
  }
  nzTag('Glasfaser im Boden', (BW + rx(4)) / 2, GROUND - 40 * k, k, NZ_ORANGE);
  nzTag('Leitungen im Haus', SHAFT_X + SHAFT / 2, ry(0) - 10, k, NZ_ORANGE);
  nzTag('Funk (5G)', RZ_MAST.x, RZ_MAST.top - 30 * k, k, NZ_BLUE);
  nzTag('Satellit', RZ_DISH.x + 560, TOP - 720, k, NZ_WHITE);
  nzTag('Rechenzentrum: hier rechnen die KI-Agenten', H4.x + H4.w / 2, H4.y - 90 - 20 * k, k, NZ_ORANGE);
  nzTag('Messdaten aus dem Energiepark', rx(-4) + RW / 2, GROUND - 40 * k, k, NZ_ORANGE);
}
(() => {
  const b = document.getElementById('netz');
  if (!b) return;
  b.addEventListener('click', () => {
    state.netz = !state.netz; state.dirty = true; b.setAttribute('aria-pressed', String(state.netz));
    const t = document.querySelector('.toast');
    if (t && state.netz) { t.textContent = 'Orange: Glasfaser und Kabel. Blau: Funk. Weiß: Satellit.'; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 3200); }
  });
})();
