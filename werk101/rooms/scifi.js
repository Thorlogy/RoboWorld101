/* Außenfeld rechts von Haus 104: Science-Fiction-Deck („Film gegen Echt“)
   Jede zweite Runde (80 s) schwebt ein ausgedachtes Raumschiff heran, beamt einen Film-Androiden auf den Teleporter,
   der geht zum echten Humanoiden Ameca, schaut ihn sich an und wird wieder hochgebeamt. Alles Ausgedachte ist beschriftet.
   Läuft auf der globalen Uhr state.g; die Runde zählt SF.runde (wird beim Überlauf von g erhöht). */
const SFX = rx(roomOf('scifi').c), SFY = ry(roomOf('scifi').r);
const SF = { runde: 0, lastG: 0 };
const SF_PAD = 110, SF_AMECA = 530, SF_TREFF = 430, SF_BODEN = 384;
const sfBesuch = () => SF.runde % 2 === 0;
// Ablauf eines Besuchs (g): 0–120 anfliegen · 120–200 Strahl, Ankunft · 200–250 hingehen · 250–300 anschauen · 300–340 zurück · 340–390 Abreise · 400–480 wegfliegen
function sfAndroid(g) {
  if (!sfBesuch() || g < 140 || g >= 390) return null;
  const m = g < 180 ? seg(g, 140, 180) : g >= 350 ? 1 - seg(g, 350, 390) : 1;
  let x = SF_PAD, dir = 1, geht = false;
  if (g >= 200 && g < 250) { x = lerp(SF_PAD, SF_TREFF, ease(seg(g, 200, 250))); geht = true; }
  else if (g >= 250 && g < 300) x = SF_TREFF;
  else if (g >= 300 && g < 340) { x = lerp(SF_TREFF, SF_PAD, ease(seg(g, 300, 340))); dir = -1; geht = true; }
  return { x, dir, geht, m, scan: g >= 255 && g < 295 };
}
const sfStrahl = g => sfBesuch() && ((g >= 120 && g < 200) || (g >= 340 && g < 400));
function sfSchiff(g) {
  if (!sfBesuch()) return null;
  const hx = SFX + SF_PAD - 10, hy = SFY - 60;
  if (g < 120) { const t = ease(seg(g, 0, 120)); return { x: lerp(hx + 2600, hx, t), y: lerp(hy - 700, hy, t) }; }
  if (g < 400) return { x: hx, y: hy + Math.sin(g / 12) * 4 };
  const t = ease(seg(g, 400, 480)); return { x: lerp(hx, hx - 3200, t), y: lerp(hy, hy - 900, t) };
}

/* ---------- Zeichnen: Deck ---------- */
function sfAmeca(x, foot, staunt) {
  // Sockel (Ameca steht fest, laufen kann er nicht)
  box(x - 34, foot - 40, 68, 40, '#5d6064', 0, 2);
  text('ECHT', x, foot - 15, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
  const b = foot - 40;
  // Beine und Hüfte, grau mit sichtbaren Gelenken
  limb(x - 8, b - 46, x - 9, b, 8, '#9aa0a6'); limb(x + 8, b - 46, x + 9, b, 8, '#9aa0a6');
  box(x - 16, b - 98, 32, 54, '#9aa0a6', 8, 2);
  ctx.fillStyle = '#3b3d40'; ctx.fillRect(x - 16, b - 66, 32, 4);
  limb(x - 18, b - 92, x - 24, b - 52, 6, '#9aa0a6'); limb(x + 18, b - 92, x + (staunt ? 30 : 24), b - (staunt ? 70 : 52), 6, '#9aa0a6');
  // Kopf mit Gesicht: Augen, Brauen, Mund – Mimik ist das, was Ameca kann
  line(x, b - 98, x, b - 106, '#3b3d40', 5);
  ctx.beginPath(); ctx.ellipse(x, b - 122, 13, 17, 0, 0, TAU); paint('#b7bcc1');
  for (const dx of [-5, 5]) { circle(x + dx, b - 126, staunt ? 3.6 : 3, '#f3f1ea', INK, 1); circle(x + dx, b - 126, 1.4, '#23384d', null); line(x + dx - 3, b - (staunt ? 134 : 131), x + dx + 3, b - (staunt ? 134 : 131), INK, 1.5); }
  if (staunt) circle(x, b - 113, 3, '#3b3d40', INK, 1); else line(x - 4, b - 113, x + 4, b - 113, INK, 1.5);
}
function sfTeleporter(g, aktiv) {
  // Plattform mit Leuchtring und Pult
  ctx.beginPath(); ctx.ellipse(SF_PAD, SF_BODEN - 4, 48, 10, 0, 0, TAU); paint('#5d6064');
  ctx.beginPath(); ctx.ellipse(SF_PAD, SF_BODEN - 8, 38, 7, 0, 0, TAU); paint(aktiv ? '#9fe3ff' : (g % 24 < 12 ? '#4a7f99' : '#3b5f73'), INK, 1.5);
  box(SF_PAD + 66, SF_BODEN - 62, 34, 58, '#3b3d40', 2, 2);
  box(SF_PAD + 70, SF_BODEN - 58, 26, 18, aktiv ? '#9fe3ff' : '#23384d', 1, 1.2);
  box(SF_PAD + 35, SF_BODEN - 86, 96, 20, '#f0b429', 0, 1.5);
  text('AUSGEDACHT', SF_PAD + 83, SF_BODEN - 71, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center' });
}
function drawScifi(f) {
  const g = state.g;
  // Deck: Plattform mit Fugen
  ctx.fillStyle = '#b8bec4'; ctx.fillRect(0, SF_BODEN, RW, RH + 8 - SF_BODEN); line(0, SF_BODEN, RW, SF_BODEN, INK, 2);
  for (let x = 20; x < RW; x += 80) line(x, SF_BODEN + 2, x, RH + 8, 'rgba(42,39,35,0.25)', 1.5);
  text('SCIENCE-FICTION', 40, 70, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Tafel „Film gegen Echt“
  line(300, SF_BODEN, 300, 190, '#5d6064', 4);
  box(236, 150, 128, 44, '#2a2723', 0, 2);
  text('FILM GEGEN ECHT', 300, 168, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  text(sfBesuch() ? 'BESUCH LÄUFT' : 'NÄCHSTER BESUCH', 300, 186, 11, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f0b429' });
  withAlpha('teleporter', () => sfTeleporter(g, sfStrahl(g)));
  const a = sfAndroid(g);
  withAlpha('ameca', () => sfAmeca(SF_AMECA, SF_BODEN, !!(a && a.scan && g >= 262)));
  if (a) withAlpha('filmandroid', () => {
    ctx.save();
    ctx.beginPath(); ctx.rect(-50, SF_BODEN - 140 * a.m, RW + 100, 160); ctx.clip();
    ctx.globalAlpha *= 0.25 + 0.75 * a.m;
    const p = a.geht ? Math.sin(g * 0.9) * 0.45 : 0;
    const arm = a.scan ? -2.2 : -p;
    humanoid(a.x, SF_BODEN, { color: '#d7dbe0', legL: p, legR: -p, kneeL: Math.max(0, p) * 0.6, kneeR: Math.max(0, -p) * 0.6, armL: p, armR: a.dir > 0 ? arm : p });
    line(a.x - 6, SF_BODEN - 102, a.x + 8, SF_BODEN - 102, '#7fd3ff', 2.5);
    if (a.scan) { box(a.x + 14, SF_BODEN - 106, 12, 8, '#3b3d40', 1, 1.2); ctx.fillStyle = 'rgba(127,211,255,0.3)'; ctx.beginPath(); ctx.moveTo(a.x + 26, SF_BODEN - 102); ctx.lineTo(SF_AMECA - 20, SF_BODEN - 190); ctx.lineTo(SF_AMECA - 20, SF_BODEN - 120); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    if (a.m < 1) for (let i = 0; i < 14; i++) { const r = rnd(i * 7 + Math.floor(g / 2)); circle(a.x - 22 + r * 44, SF_BODEN - 10 - rnd(i * 13 + g) * 120, 1.8, '#9fe3ff', null); }
  });
}

/* ---------- Läufer: Raumschiff und Strahl ---------- */
function sfShip(x, y) {
  // eigenes, erfundenes Raumschiff: Rumpf als Kapsel, Ring in der Mitte, Cockpit links, Antrieb rechts
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.ellipse(10, 0, 40, 44, 0, 0, TAU); ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.stroke(); ctx.strokeStyle = '#8a8f94'; ctx.lineWidth = 6; ctx.stroke();
  box(-170, -26, 340, 52, '#d8dde0', 26, 2.5);
  ctx.fillStyle = '#d9542b'; ctx.fillRect(-120, 6, 250, 6);
  ctx.beginPath(); ctx.moveTo(-168, -2); ctx.quadraticCurveTo(-160, -22, -128, -22); ctx.lineTo(-118, -2); ctx.closePath(); paint('#23384d', INK, 1.5);
  for (let i = 0; i < 7; i++) circle(-90 + i * 26, -8, 4, '#9fe3ff', INK, 1);
  box(166, -18, 18, 36, '#5d6064', 3, 2);
  glow(194, 0, 30, 'rgba(127,211,255,0.85)');
  ctx.beginPath(); ctx.ellipse(10, 26, 18, 7, 0, 0, Math.PI); paint('#5d6064', INK, 1.5);
  text('RW-101', -40, 22, 11, { family: '"IBM Plex Mono", monospace', weight: 500, color: '#3b3d40' });
  ctx.restore();
}
registerRunner({
  room: 'scifi',
  draw(g) {
    const s = sfSchiff(g); if (!s) return;
    withAlpha('raumschiff', () => {
      if (sfStrahl(g)) {
        const top = s.y + 32, bot = SFY + SF_BODEN - 6, x0 = s.x + 10, x1 = SFX + SF_PAD;
        const gr = ctx.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, 'rgba(159,227,255,0.55)'); gr.addColorStop(1, 'rgba(159,227,255,0.25)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x0 - 14, top); ctx.lineTo(x0 + 14, top); ctx.lineTo(x1 + 44, bot); ctx.lineTo(x1 - 44, bot); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) { const t = ((g * 0.04 + i / 6) % 1), y = lerp(top, bot, t), w = lerp(14, 44, t), cx = lerp(x0, x1, t); ctx.beginPath(); ctx.moveTo(cx - w, y); ctx.lineTo(cx + w, y); ctx.stroke(); }
      }
      sfShip(s.x, s.y);
    });
  },
  glow(g) { const s = sfSchiff(g); if (s) { glow(s.x + 194, s.y, 50, 'rgba(127,211,255,0.7)'); for (let i = 0; i < 7; i++) glow(s.x - 90 + i * 26, s.y - 8, 10, 'rgba(159,227,255,0.6)'); } },
  robot: {
    id: 'raumschiff', name: 'Raumschiff RW-101', bereich: 'Science-Fiction', aera: 'ausgedacht', typ: 'Erfundenes Raumschiff', color: '#d8dde0',
    fakt: 'Raumschiffe, die lautlos über einer Stadt schweben, gibt es nur in Filmen. Echte Raumfahrzeuge kommen nur mit Raketen ins All und landen mit Fallschirmen oder mit Triebwerken auf Beinen.',
    echt: 'Ausgedacht. Echt ist die Rakete, die zwischen Schule 102 und Halle 103 startet; ihre erste Stufe landet wieder.',
    note: 'Kommt jede zweite Runde vorbei und beamt einen Film-Androiden auf das Deck.',
    box: () => { const s = sfSchiff(state.g); return s ? [s.x - 175, s.y - 48, 360, 96] : [-99999, -99999, 1, 1]; },
  },
});

registerRoom({
  key: 'scifi', name: 'Science-Fiction-Deck', level: 'Außengelände',
  hitOrder: ['filmandroid', 'ameca', 'teleporter'],
  draw: drawScifi,
  robots: [
    { id: 'filmandroid', name: 'Film-Android', bereich: 'Science-Fiction', aera: 'ausgedacht', typ: 'Android wie aus dem Kino', color: '#d7dbe0',
      fakt: 'Androiden, die aussehen und sich bewegen wie Menschen, kommen aus Büchern und Filmen. Echte Humanoide laufen noch vorsichtig, brauchen viel Strom und arbeiten meist als Prototypen in Laboren und Fabriken.',
      echt: 'Ausgedacht: Er wird gebeamt und läuft so geschmeidig wie ein Mensch. Echt ist nur, dass Forscher solche Roboter bauen wollen.',
      note: 'Wird hergebeamt, scannt den echten Humanoiden und verschwindet wieder.',
      box: () => { const a = sfAndroid(state.g); return a ? [SFX + a.x - 22, SFY + SF_BODEN - 118, 44, 118] : [-99999, -99999, 1, 1]; } },
    { id: 'ameca', name: 'Ameca', bereich: 'Science-Fiction', aera: 'seit 2021', typ: 'Humanoider Roboter mit Gesicht', color: '#9aa0a6',
      fakt: 'Ameca stammt von Engineered Arts aus Großbritannien und wurde Ende 2021 vorgestellt. Viele kleine Motoren bewegen das Gesicht, so kann Ameca staunen, lächeln oder die Stirn runzeln. Forscher nutzen ihn, um zu untersuchen, wie Menschen mit Robotern umgehen.',
      echt: 'Echt. Laufen kann Ameca nicht, er steht fest auf seinem Sockel. Das Staunen ist eingebaute Mimik, kein Gefühl.',
      note: 'Der Einzige auf dem Deck, den es wirklich gibt. Staunt, wenn der Film-Android ihn scannt.',
      quelle: 'https://ispr.info/2021/12/03/engineered-arts-videos-reveal-new-robot-amecas-terrifyingly-realistic-facial-expressions/',
      box: () => [SFX + SF_AMECA - 34, SFY + SF_BODEN - 182, 68, 182] },
    { id: 'teleporter', name: 'Teleporter', bereich: 'Science-Fiction', aera: 'ausgedacht', typ: 'Beam-Plattform', color: '#9fe3ff',
      fakt: 'Menschen oder Dinge zu beamen ist unmöglich. Was es gibt, ist Quantenteleportation: Dabei wird nur der Zustand eines winzigen Lichtteilchens auf ein anderes übertragen, also Information und kein Material. Anton Zeilinger zeigte das 1997 in Innsbruck und bekam 2022 mit zwei Kollegen den Physik-Nobelpreis.',
      echt: 'Ausgedacht. Echt ist nur die Quantenteleportation von Lichtteilchen im Labor.',
      note: 'Der Ring blinkt, auch wenn gerade niemand kommt.',
      quelle: 'https://de.wikipedia.org/wiki/Quantenteleportation',
      box: () => [SFX + SF_PAD - 50, SFY + SF_BODEN - 88, 182, 88] },
  ],
});
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  raumschiff: 'Dieses Raumschiff ist ausgedacht. Echte Raumschiffe brauchen Raketen und können nicht einfach über der Stadt schweben.',
  filmandroid: 'Diesen Roboter gibt es nur im Film. Echte Roboter, die wie Menschen aussehen, laufen noch ganz vorsichtig.',
  ameca: 'Ameca gibt es wirklich. Er kann mit seinem Gesicht staunen oder lächeln, aber laufen kann er nicht.',
  teleporter: 'Beamen gibt es nicht. Forscher können nur winzige Lichtteilchen „beamen“, und auch das nur als Information.',
}));
// Runden zählen: jedes Mal, wenn die globale Uhr von 479 auf 0 springt
(function sfZaehl() { if (state.g < SF.lastG - 200) SF.runde++; SF.lastG = state.g; requestAnimationFrame(sfZaehl); })();
