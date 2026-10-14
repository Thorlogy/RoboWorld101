/* Außenfeld ganz links: Paketzentrum (c −9)
   Paketterminal mit Roboter im Inneren (Vorbild Cleveron), Roboterarm belädt das fahrerlose Lieferauto (Vorbild Nuro R2).
   Das Lieferauto fährt über einen Wirtschaftsweg bis zur Straße vor Werk 101 und zurück.
   Ablauf über vier Runden (langeUhr(4), 0–1919): 0–300 beladen · 300–900 hinfahren · 900–1080 ausliefern · 1080–1680 zurück · 1680–1920 laden */
const PZX = rx(roomOf('paket').c), PZY = ry(roomOf('paket').r);
const PZ_DOCK = PZX + 470, PZ_ZIEL = rx(roomOf('strasse').c) + 210, PZ_FUSS = ry(6) + 396;
const pzUhr = () => (typeof langeUhr === 'function' ? langeUhr(4) : state.g);
function pzAuto(t) {
  if (t < 300) return { x: PZ_DOCK, phase: 'laden' };
  if (t < 900) return { x: lerp(PZ_DOCK, PZ_ZIEL, ease(seg(t, 300, 900))), phase: 'fahrt' };
  if (t < 1080) return { x: PZ_ZIEL, phase: 'abgabe', klappe: seg(t, 910, 940) - seg(t, 1040, 1070) };
  if (t < 1680) return { x: lerp(PZ_ZIEL, PZ_DOCK, ease(seg(t, 1080, 1680))), phase: 'fahrt' };
  return { x: PZ_DOCK, phase: 'strom' };
}
// Lieferauto ohne Fahrer: kein Lenkrad, keine Fenster, zwei Fächer, Sensorkuppel auf dem Dach
function lieferauto(x, foot, klappe, laden) {
  const L = 190, H = 128, x0 = x - L / 2;
  box(x0, foot - H, L, H - 16, '#e9e9e6', 18, 2.5);
  box(x0 + 4, foot - 40, L - 8, 18, '#3b3d40', 6, 2);
  for (const dx of [36, L - 36]) { circle(x0 + dx, foot - 18, 18, '#2a2723', INK, 2); circle(x0 + dx, foot - 18, 7, '#8a8f94', INK, 1.5); }
  // Fächer mit Klappen nach oben
  for (const [fx, fw] of [[x0 + 18, 70], [x0 + 102, 70]]) {
    if (klappe > 0) { box(fx, foot - 112, fw, 64, '#3b3d40', 4, 1.5); box(fx + 14, foot - 76, 40, 28, '#c9a46a', 1, 1.5); }
    ctx.save(); ctx.translate(fx, foot - 112); ctx.scale(1, 1 - 0.85 * klappe); box(0, 0, fw, 64, '#d6d9dc', 4, 1.5); ctx.restore();
  }
  // Sensorkuppel und Kameras
  box(x - 14, foot - H - 18, 28, 18, '#3b3d40', 6, 1.5); circle(x, foot - H - 9, 5, '#23384d', null);
  for (const dx of [6, L - 6]) circle(x0 + dx, foot - H + 20, 3.5, '#23384d', INK, 1);
  ctx.fillStyle = '#d9542b'; ctx.fillRect(x0 + 10, foot - 46, L - 20, 4);
  if (laden) { line(x0 - 30, foot - 70, x0, foot - 70, INK, 3); circle(x0 - 2, foot - 70, 4, state.g % 20 < 10 ? '#7fe08a' : '#2d5b33', INK, 1); }
}
function drawPaket(f) {
  const t = pzUhr(), a = pzAuto(t);
  // Hof und Halle
  ctx.fillStyle = '#d6d2c8'; ctx.fillRect(0, 110, 300, 274); line(0, 110, 300, 110, INK, 2); line(300, 110, 300, 384, INK, 2);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(-10, 100, 320, 12);
  ctx.fillStyle = '#a9aca8'; ctx.fillRect(0, 384, RW, 24); line(0, 384, RW, 384, INK, 2);
  text('PAKETZENTRUM', 330, 70, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Paketterminal im Schnitt: Fächer, Hubwagen innen, Ausgabe vorn
  withAlpha('paketterminal', () => {
    box(30, 140, 150, 244, '#e9e6dd', 0, 2);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) { box(42 + c * 74, 152 + r * 34, 56, 26, '#cfc9ba', 0, 1); if ((r * 3 + c) % 4) box(48 + c * 74, 160 + r * 34, 30 + ((r + c) % 3) * 6, 16, '#c9a46a', 1, 1); }
    const k = f < 20 ? lerp(330, 186, ease(seg(f, 0, 20))) : f < 30 ? 186 : f < 50 ? lerp(186, 330, ease(seg(f, 30, 50))) : 330;
    line(105, 146, 105, 376, '#5d6064', 2);
    box(84, k, 42, 10, '#f0b429', 1, 1.5); if (f >= 25 && f < 58) box(92, k - 14, 26, 14, '#c9a46a', 1, 1);
    box(130, 300, 46, 40, '#23384d', 2, 1.5); text('ABHOLEN', 153, 326, 9, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fd3ff' });
  });
  withAlpha('kundin', () => { person({ x: 220, foot: 384, face: -1, shirt: '#7b4b8e', hand: f >= 50 }); if (f >= 50) box(190, 300, 24, 16, '#c9a46a', 1, 1.5); });
  // Förderband aus der Halle und Roboterarm am Ladeplatz
  box(300, 300, 120, 12, '#5d6064', 0, 1.5);
  for (let i = 0; i < 3; i++) { const bx = 300 + ((f * 2 + i * 40) % 110); box(bx, 284, 22, 16, '#c9a46a', 1, 1); }
  withAlpha('paketarm', () => {
    const lade = a.phase === 'laden' && t > 40 && t < 280, s = lade ? (f % 30) / 30 : 0;
    const base = { x: 400, y: 384 }; box(base.x - 22, 360, 44, 24, '#d9542b', 2, 2);
    const S = { x: base.x, y: 352 };
    const von = { x: 410, y: 284 }, nach = { x: PZ_DOCK - PZX - 40, y: 300 };
    const hand = lade ? (s < 0.5 ? mix(von, nach, ease(s * 2)) : mix(nach, von, ease((s - 0.5) * 2))) : { x: 430, y: 270 };
    const E = ik2(S, hand, 70, 66);
    limb(S.x, S.y, E.x, E.y, 13, '#d9542b'); limb(E.x, E.y, hand.x, hand.y, 10, '#d9542b');
    circle(S.x, S.y, 7, '#3b3d40'); circle(E.x, E.y, 6, '#3b3d40');
    box(hand.x - 12, hand.y - 4, 24, 8, '#3b3d40', 2, 1.2);
    if (lade && s < 0.5) box(hand.x - 11, hand.y + 4, 22, 16, '#c9a46a', 1, 1);
  });
}
registerRoom({
  key: 'paket', name: 'Paketzentrum', level: 'Außengelände',
  hitOrder: ['kundin', 'paketarm', 'paketterminal'],
  draw: drawPaket,
  robots: [
    { id: 'paketterminal', name: 'Paketterminal', bereich: 'Logistik', aera: 'seit den 2010ern', typ: 'Paketstation mit Roboter innen', color: '#e9e6dd',
      fakt: 'Vorbild sind die Paketterminals von Cleveron aus Estland. Das Terminal misst jedes Paket, legt es auf ein passendes Fach im Inneren und bringt es in weniger als zehn Sekunden nach vorn, wenn jemand seinen Code scannt.',
      echt: 'Echt. Die Technik im Inneren ist hier vereinfacht gezeichnet.', note: 'Der gelbe Hubwagen holt das Paket aus dem oberen Fach.',
      quelle: 'https://cep-research.com/news/cleveron-launches-small-parcel-terminal-for-pudos-and-stores',
      box: () => [PZX + 30, PZY + 140, 150, 244] },
    { id: 'paketarm', name: 'Roboterarm am Ladeplatz', bereich: 'Logistik', aera: 'seit den 2000ern', typ: 'Industrieroboter mit Greifer', color: '#d9542b',
      fakt: 'In Paketzentren greifen Roboterarme Pakete vom Band und stapeln sie in Wagen oder Regale. Kameras erkennen dabei Größe und Lage jedes Pakets.',
      echt: 'Echt. Dass er direkt ein fahrerloses Lieferauto belädt, ist eine Vorschau auf die Zukunft.', note: 'Arbeitet nur, wenn das Lieferauto da ist.',
      box: () => [PZX + 370, PZY + 260, 120, 124] },
    { id: 'kundin', name: 'Kundin', bereich: 'Mensch', aera: 'Maßstab', typ: 'holt ein Paket ab', color: '#7b4b8e',
      fakt: 'Zum Abholen reicht ein Code auf dem Handy.', note: 'Wartet kurz, dann hat sie ihr Paket.', box: () => [PZX + 195, PZY + 262, 50, 122] },
  ],
});
// Lieferauto als Läufer: fährt über die Außenfelder bis zur Straße vor Werk 101
registerRunner({
  room: 'paket',
  draw(g) {
    // Wirtschaftsweg unten über die Außenfelder
    ctx.fillStyle = '#8f8c86'; ctx.fillRect(PZX, PZ_FUSS - 6, PZ_ZIEL + 160 - PZX, 18);
    ctx.fillStyle = '#d6d2c8'; for (let x = PZX + 20; x < PZ_ZIEL + 140; x += 90) ctx.fillRect(x, PZ_FUSS + 2, 40, 2);
    const t = pzUhr(), a = pzAuto(t);
    withAlpha('lieferauto', () => {
      lieferauto(a.x, PZ_FUSS, a.klappe || 0, a.phase === 'strom');
      if (a.phase === 'abgabe' && t > 950 && t < 1050) { const u = seg(t, 950, 1000); box(lerp(a.x - 60, a.x - 150, u), PZ_FUSS - lerp(70, 22, u), 30, 22, '#c9a46a', 1, 1.5); }
    });
  },
  glow() { const a = pzAuto(pzUhr()); glow(a.x - 95, PZ_FUSS - 60, 30, 'rgba(255,240,200,0.6)'); glow(a.x + 95, PZ_FUSS - 60, 30, 'rgba(255,240,200,0.6)'); },
  robot: { id: 'lieferauto', name: 'Fahrerloses Lieferauto', bereich: 'Logistik', aera: 'seit 2020', typ: 'Lieferfahrzeug ohne Fahrer', color: '#e9e9e6',
    fakt: 'Vorbild ist der R2 von Nuro aus Kalifornien. Er hat kein Lenkrad und keine Pedale und keinen Platz für Menschen, nur Fächer für Einkäufe, die warm oder kühl bleiben. Im Februar 2020 erlaubte die US-Verkehrsbehörde NHTSA solche Fahrzeuge auf öffentlichen Straßen.',
    echt: 'Echt als Bauform. Ausgedacht ist der eigene Weg quer über Flughafen und Felder; in echt fährt er auf normalen Straßen.',
    note: 'Wird im Paketzentrum beladen, fährt bis vor Werk 101, öffnet ein Fach und kommt zum Laden zurück.',
    quelle: 'https://wjla.com/news/nation-world/us-agency-approves-vehicle-designed-not-to-have-human-driver',
    box: () => { const a = pzAuto(pzUhr()); return [a.x - 98, PZ_FUSS - 150, 196, 150]; } },
});
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  paketterminal: 'In diesem Schrank wohnen Pakete. Ein kleiner Roboter innen holt dein Paket, wenn du deinen Code zeigst.',
  paketarm: 'Der Roboterarm packt Pakete vom Band in das Lieferauto.',
  kundin: 'Sie holt ihr Paket ab.',
  lieferauto: 'In diesem Auto sitzt niemand. Es fährt allein und bringt Pakete. Man öffnet sein Fach mit einem Code.',
}));
