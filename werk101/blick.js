/* Roboterblick: Knopf „Roboterblick“ schaltet um zwischen  aus → Kamera mit Objekterkennung → Wärmebild → aus.
   Wird in engine.js nach dem Datennetz über die Welt gelegt (drawBlick). Nutzt nur die Klickflächen der Karten (box),
   ändert also keinen Raum. Botschaft: Ein Roboter sieht keine Bilder wie wir, sondern Kästchen, Zahlen und Temperaturen. */
const BLICK = { modi: ['aus', 'kamera', 'waerme'], namen: { aus: 'Roboterblick', kamera: 'Roboterblick: Kamera', waerme: 'Roboterblick: Wärme' } };
state.blick = 'aus';

function blickKlasse(r) {
  if (r.bereich === 'Mensch') return 'Mensch';
  if (r.bereich === 'Tier') return 'Tier';
  if (['Wissen', 'Daten', 'KI', 'Sensoren', 'Lernen'].includes(r.bereich)) return null;
  return 'Roboter';
}
// feste „Sicherheit“ je Figur (immer gleich, damit nichts flackert)
function blickProzent(id) { let h = 7; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973; return 71 + (h % 28); }
const BLICK_FARBE = { Mensch: '#f0b429', Tier: '#7fe08a', Roboter: '#7fd3ff' };

function blickZiele(vx0, vy0, vx1, vy1) {
  const out = [];
  for (const r of ROBOTS) {
    const room = ROOMS.find(o => o.built === r.room);
    if (room && !isOpen(room)) continue;
    const k = blickKlasse(r); if (!k || !r.box) continue;
    let b; try { b = r.box(state.f); } catch (e) { continue; }
    if (!b) continue;
    const [x, y, w, h] = b;
    if (w > 900 || h > 700 || w < 4 || h < 4) continue;
    if (x > vx1 || x + w < vx0 || y > vy1 || y + h < vy0) continue;
    out.push({ r, k, x, y, w, h });
  }
  return out;
}

function drawBlick(vx0, vy0, vx1, vy1) {
  if (state.blick === 'aus') return;
  const W = vx1 - vx0, H = vy1 - vy0, px = 1 / state.z;
  const ziele = blickZiele(vx0, vy0, vx1, vy1);
  ctx.save();
  // Farbe raus: das Bild wird grau
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(vx0, vy0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  if (state.blick === 'kamera') {
    ctx.fillStyle = 'rgba(6,22,30,0.45)'; ctx.fillRect(vx0, vy0, W, H);
    // Bildzeilen wie bei einer einfachen Kamera
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = Math.floor(vy0 / (4 * px)) * 4 * px; y < vy1; y += 4 * px) ctx.fillRect(vx0, y, W, px);
    const fs = 11 * px;
    for (const z of ziele) {
      const c = BLICK_FARBE[z.k], e = Math.min(14 * px, z.w / 3, z.h / 3);
      ctx.strokeStyle = c; ctx.lineWidth = 2 * px;
      ctx.strokeRect(z.x, z.y, z.w, z.h);
      ctx.lineWidth = 4 * px; ctx.beginPath();
      for (const [ax, ay, dx, dy] of [[z.x, z.y, 1, 1], [z.x + z.w, z.y, -1, 1], [z.x, z.y + z.h, 1, -1], [z.x + z.w, z.y + z.h, -1, -1]]) { ctx.moveTo(ax + dx * e, ay); ctx.lineTo(ax, ay); ctx.lineTo(ax, ay + dy * e); }
      ctx.stroke();
      const t = `${z.k} ${blickProzent(z.r.id)} %`;
      ctx.font = `500 ${fs}px "IBM Plex Mono", monospace`;
      const tw = ctx.measureText(t).width + 8 * px;
      ctx.fillStyle = c; ctx.fillRect(z.x, z.y - fs - 6 * px, tw, fs + 6 * px);
      ctx.fillStyle = '#10161c'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, z.x + 4 * px, z.y - 4 * px);
    }
  } else {
    // Wärmebild: alles Kalte dunkelblau, Warmes leuchtet
    ctx.fillStyle = 'rgba(12,16,70,0.78)'; ctx.fillRect(vx0, vy0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const z of ziele) {
      const lebend = z.k !== 'Roboter';
      const cx = z.x + z.w / 2, cy = z.y + z.h * (lebend ? 0.35 : 0.55), r = Math.max(z.w, z.h) * (lebend ? 0.55 : 0.28);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      if (lebend) { g.addColorStop(0, 'rgba(255,255,220,0.95)'); g.addColorStop(0.35, 'rgba(255,190,40,0.8)'); g.addColorStop(0.7, 'rgba(220,40,60,0.45)'); g.addColorStop(1, 'rgba(120,0,90,0)'); }
      else { g.addColorStop(0, 'rgba(255,150,40,0.55)'); g.addColorStop(0.6, 'rgba(180,30,90,0.25)'); g.addColorStop(1, 'rgba(80,0,90,0)'); }
      ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  // Erklärung unten links, fest auf dem Bildschirm
  const dpr = window.devicePixelRatio || 1;
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const zeilen = state.blick === 'kamera'
    ? ['ROBOTERBLICK: KAMERA MIT ERKENNUNG', 'Der Roboter sieht Kästchen und Prozentzahlen.', 'Er rechnet aus, wie ähnlich etwas den Beispielen ist,', 'mit denen er geübt hat. Sicher ist er nie ganz.']
    : ['ROBOTERBLICK: WÄRMEBILD', 'Warmes leuchtet hell: Menschen und Tiere am stärksten,', 'Motoren und Akkus etwas. Farben und Formen', 'sieht diese Kamera nicht. Im Dunkeln geht es trotzdem.'];
  const x = 16, h = 18 * zeilen.length + 16, y = canvas.clientHeight - h - 70;
  ctx.fillStyle = 'rgba(16,22,28,0.88)'; ctx.fillRect(x, y, 380, h); ctx.strokeStyle = state.blick === 'kamera' ? '#7fd3ff' : '#f0b429'; ctx.lineWidth = 2; ctx.strokeRect(x, y, 380, h);
  zeilen.forEach((t, i) => { ctx.font = i ? '400 13px "IBM Plex Sans", sans-serif' : '500 12px "IBM Plex Mono", monospace'; ctx.fillStyle = i ? '#e6e3da' : (state.blick === 'kamera' ? '#7fd3ff' : '#f0b429'); ctx.textAlign = 'left'; ctx.fillText(t, x + 12, y + 22 + i * 18); });
  ctx.restore();
}

(() => {
  const b = document.getElementById('blick');
  if (!b) return;
  b.addEventListener('click', () => {
    state.blick = BLICK.modi[(BLICK.modi.indexOf(state.blick) + 1) % BLICK.modi.length];
    b.textContent = BLICK.namen[state.blick]; b.setAttribute('aria-pressed', String(state.blick !== 'aus'));
    state.dirty = true;
  });
})();
