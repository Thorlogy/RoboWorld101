/* Läufer zwischen den Häusern: Förderbrücke von Halle 103 (Montage) zum Rechenzentrum, Schneeräumroboter im Park (nur bei Schnee) */

/* ---------- Förderbrücke: überdacht, über dem Funkmast, Rechenmodule rutschen ins Rechenzentrum ---------- */
const FB_A = { x: rx(6.5) + RW + WALL, y: ry(5) + 250 }, FB_B = { x: rx(8) - WALL + 12, y: ry(6) - 62 };
function fbPunkt(t) { return { x: lerp(FB_A.x, FB_B.x, t), y: lerp(FB_A.y, FB_B.y, t) }; }
registerRunner({
  room: 'montage',
  draw(g) {
    withAlpha('foerderbruecke', () => {
      const a = FB_A, b = FB_B, ab = istDunkel();
      // Öffnung in der Halle, Aufbau auf dem Dach des Rechenzentrums
      box(a.x - 6, a.y - 52, 12, 60, '#2a2723', 0, 1.5);
      box(b.x - 4, b.y - 44, 48, 62, '#8a8f94', 2, 2); box(b.x, b.y - 36, 16, 40, '#2a2723', 0, 1);
      // Stütze bis zum Boden neben dem Mast
      const m = fbPunkt(0.28); ctx.fillStyle = '#5d6064'; ctx.fillRect(m.x - 5, m.y + 8, 10, GROUND - m.y - 8); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(m.x - 5, m.y + 8, 10, GROUND - m.y - 8);
      // Brücke: Boden, Fachwerk, Dach
      const dx = b.x - a.x, dy = b.y - a.y, ang = Math.atan2(dy, dx), len = Math.hypot(dx, dy);
      ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(ang);
      ctx.fillStyle = ab ? 'rgba(255,231,163,0.25)' : 'rgba(210,225,230,0.55)'; ctx.fillRect(0, -46, len, 46);
      box(0, 0, len, 8, '#5d6064', 0, 1.5);
      for (let x = 0; x < len; x += 34) { line(x, 0, x + 17, -46, '#8a8f94', 2); line(x + 17, -46, x + 34, 0, '#8a8f94', 2); }
      ctx.beginPath(); ctx.moveTo(-6, -46); ctx.lineTo(len + 6, -46); ctx.lineTo(len, -58); ctx.lineTo(0, -58); ctx.closePath(); paint('#3e6f9e', INK, 1.5);
      // Kisten mit Rechenmodulen, rutschen alle 160 Bilder hinunter
      for (let i = 0; i < 3; i++) { const t = ((g + i * 160) % 480) / 480; box(t * len - 10, -16, 20, 16, '#c9a46a', 1, 1); line(t * len - 6, -8, t * len + 6, -8, '#23384d', 2); }
      ctx.restore();
    });
  },
  glow() { const m = fbPunkt(0.5); glow(m.x, m.y - 24, 60, 'rgba(255,231,163,0.35)'); },
  robot: { id: 'foerderbruecke', name: 'Förderbrücke', bereich: 'Logistik', aera: 'heute', typ: 'Überdachtes Förderband zwischen Hallen', color: '#3e6f9e',
    fakt: 'Überdachte Förderbrücken verbinden in vielen Fabriken zwei Gebäude. So kommen Teile wettergeschützt von einer Halle in die nächste, ohne dass ein Lkw fahren muss.',
    echt: 'Echt als Bauform. Ausgedacht: Hier bringt sie fertige Rechenmodule aus der Montage direkt ins Rechenzentrum.',
    note: 'Läuft schräg über den Funkmast; darunter fährt nachts der Sicherheitsroboter Streife.',
    box: () => [FB_A.x, FB_A.y - 60, FB_B.x - FB_A.x + 50, FB_B.y - FB_A.y + 70] },
});

/* ---------- Schneeräumroboter im Park ---------- */
const SR_PARK = roomOf('park'), SR_FUSS = ry(6) + 384;
const srX = g => rx(SR_PARK.c) + lerp(120, 520, 0.5 - 0.5 * Math.cos(TAU * g / 480));
registerRunner({
  room: 'park',
  draw(g) {
    if (state.wetter !== 'schnee') return;
    withAlpha('schneeraeumer', () => {
      const x = srX(g), dir = Math.sin(TAU * g / 480) >= 0 ? 1 : -1, y = SR_FUSS;
      // geräumte Spur hinter ihm
      ctx.fillStyle = '#a9aca8'; ctx.fillRect(rx(SR_PARK.c) + 120, y - 4, x - rx(SR_PARK.c) - 120, 6);
      box(x - 34, y - 14, 68, 14, '#2a2723', 7, 2);
      for (let i = 0; i < 4; i++) circle(x - 24 + i * 16, y - 7, 4, '#3b3d40', INK, 1);
      box(x - 30, y - 40, 60, 26, '#3b3d40', 6, 2); box(x - 22, y - 46, 44, 8, '#e6e3da', 3, 1.5);
      box(x + dir * 34 - 10, y - 30, 20, 28, '#d9542b', 3, 1.5);
      ctx.save(); ctx.translate(x + dir * 30, y - 34); ctx.rotate(-0.6 * dir); box(-4, -26, 8, 26, '#d9542b', 2, 1.2); ctx.restore();
      for (let i = 0; i < 8; i++) { const t = ((g * 4 + i * 9) % 40) / 40; circle(x + dir * (30 + 10 * t) - dir * 70 * t, y - 60 - 30 * Math.sin(Math.PI * t) + 40 * t, 3, '#f8fafa', null); }
    });
  },
  robot: { id: 'schneeraeumer', name: 'Schneeräumroboter', bereich: 'Umwelt', aera: 'seit den 2020ern', typ: 'Hofroboter mit Schneefräse', color: '#3b3d40',
    fakt: 'Vorbild ist der Hofroboter Yarbo mit Schneefräsen-Aufsatz: Er räumt Wege auf etwa 60 Zentimeter Breite, fährt bis zu 90 Minuten mit einer Akkuladung und findet seinen Weg per GPS, Hindernisse erkennt er mit Sensoren.',
    echt: 'Echt. Er fährt nur, wenn oben „Wetter: Schnee“ eingestellt ist.', note: 'Hinter ihm wird der Weg grau, vor ihm fliegt der Schnee.',
    quelle: 'https://www.mybotshop.de/Yarbo-S1-snow-blower-module_1',
    box: () => state.wetter === 'schnee' ? [srX(state.g) - 40, SR_FUSS - 70, 80, 70] : [-99999, -99999, 1, 1] },
});
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  foerderbruecke: 'Über diese Brücke rollen Kisten von einem Haus ins andere, ohne nass zu werden.',
  schneeraeumer: 'Dieser kleine Roboter räumt den Schnee vom Weg und pustet ihn zur Seite.',
}));
