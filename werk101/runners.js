/* Werk 101 – Läufer: Figuren, die über Räume und Stockwerke hinweg unterwegs sind.
   Sie laufen auf der globalen Uhr state.g (0–479, 12 Bilder pro Sekunde, also 40 Sekunden). */
const RUN_P = 480;
const FLOOR1 = ry(5) + 360, FLOOR4 = ry(2) + 360;
const SHAFT_C = SHAFT_X + SHAFT / 2;
const XL = rx(0) + 500, XK = rx(0) + 520;
const CAB_H = 112;

// Aufzugskabine (wird im Gerüst gezeichnet): Ebene 1 → Ebene 4 → Ebene 1
function cabinY(g) {
  g %= RUN_P;
  const a = FLOOR1 - CAB_H, b = FLOOR4 - CAB_H;
  if (g < 120) return a;
  if (g < 150) return lerp(a, b, ease(seg(g, 120, 150)));
  if (g < 360) return b;
  if (g < 390) return lerp(b, a, ease(seg(g, 360, 390)));
  return a;
}
const XS = rx(2) + 330, XR = rx(2) + 300;
function lieferPos(g) {
  g %= RUN_P;
  const cab = cabinY(g) + CAB_H - 8;
  if (g < 30) return { x: XL, y: FLOOR1, dir: 1, lid: seg(g, 5, 10) - seg(g, 20, 25) };
  if (g < 110) return { x: lerp(XL, SHAFT_C, ease(seg(g, 30, 110))), y: FLOOR1, dir: 1 };
  if (g < 160) return { x: SHAFT_C, y: cab, dir: -1 };
  if (g < 176) return { x: lerp(SHAFT_C, XS, ease(seg(g, 160, 176))), y: FLOOR4, dir: -1 };
  if (g < 194) return { x: XS, y: FLOOR4, dir: -1, lid: seg(g, 178, 182) - seg(g, 188, 192), shop: true };
  if (g < 240) return { x: lerp(XS, XK, ease(seg(g, 194, 240))), y: FLOOR4, dir: -1 };
  if (g < 270) return { x: XK, y: FLOOR4, dir: -1, lid: seg(g, 245, 250) - seg(g, 260, 265) };
  if (g < 350) return { x: lerp(XK, SHAFT_C, ease(seg(g, 270, 350))), y: FLOOR4, dir: 1 };
  if (g < 400) return { x: SHAFT_C, y: cab, dir: -1 };
  if (g < 416) return { x: lerp(SHAFT_C, XR, ease(seg(g, 400, 416))), y: FLOOR1, dir: -1 };
  if (g < 434) return { x: XR, y: FLOOR1, dir: -1, lid: seg(g, 418, 422) - seg(g, 428, 432), drop: true };
  return { x: lerp(XR, XL, ease(seg(g, 434, 480))), y: FLOOR1, dir: -1 };
}
function doorways(floor) {
  for (const x of [rx(1) - WALL, rx(2) - WALL, SHAFT_X - WALL]) { ctx.fillStyle = '#3b3d40'; ctx.fillRect(x, floor - 58, WALL, 58); }
}

registerRunner({
  room: 'lager',
  draw(g) {
    doorways(FLOOR1); doorways(FLOOR4);
    withAlpha('liefer', () => {
      const p = lieferPos(g), lid = Math.max(0, p.lid || 0);
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.dir, 1);
      for (let i = 0; i < 3; i++) circle(-18 + i * 18, -5, 5, '#2d2f33');
      box(-28, -34, 56, 26, '#f2f0ea', 6);
      ctx.fillStyle = '#23384d'; ctx.fillRect(-22, -29, 44, 6);
      ctx.save(); ctx.translate(-26, -34); ctx.rotate(-1.1 * lid); box(0, -4, 52, 5, '#e6e3da', 2, 1.2); ctx.restore();
      if (lid > 0.3) box(-12, -46, 22, 14, '#c9a46a', 2, 1.2);
      line(20, -34, 20, -68, INK, 1.5);
      ctx.beginPath(); ctx.moveTo(20, -68); ctx.lineTo(34, -63); ctx.lineTo(20, -58); ctx.closePath(); paint('#d9542b', INK, 1.5);
      circle(-20, -16, 2, g % 6 < 3 ? '#7fe08a' : '#2d5b33', null);
      ctx.restore();
    });
  },
  robot: { id: 'liefer', name: 'Lieferroboter', bereich: 'Logistik', aera: 'seit 2018', typ: 'Sechsrädriger Lieferroboter',
    fakt: 'Kleine sechsrädrige Lieferroboter bringen seit 2018 Einkäufe und Essen über Gehwege und Uni-Gelände. In Hotels, Kliniken und Bürohäusern rufen ähnliche Roboter per Funk den Aufzug und fahren selbstständig in andere Stockwerke.',
    echt: 'Realistisch, auch die Fahrt mit dem Aufzug. Den Deckel öffnet in echt meist die Person, die das Paket abholt.',
    note: 'Holt im Lager ein Paket, fährt mit dem Aufzug auf Ebene 4, kauft im Supermarkt ein, liefert an den Kühlschrank der Kantine und bringt auf dem Rückweg Verpackung zum Recyclinghof. Eine Runde dauert 40 Sekunden.',
    color: '#f2f0ea', quelle: 'https://en.wikipedia.org/wiki/Starship_Technologies',
    box: () => { const p = lieferPos(state.g); return [p.x - 30, p.y - 70, 60, 70]; } },
});

// Fassaden-Inspektionsdrohne außen am Gebäude
function facadePos(g) {
  g %= RUN_P;
  const x = BW + 80, top = TOP - 60, bottom = GROUND - 70;
  if (g < 200) return { x, y: lerp(top, bottom, seg(g, 0, 200)) };
  if (g < 240) return { x, y: bottom };
  if (g < 440) return { x, y: lerp(bottom, top, seg(g, 240, 440)) };
  return { x, y: top };
}
registerRunner({
  room: 'drohnen',
  draw(g) {
    withAlpha('fassade', () => {
      const p = facadePos(g);
      quad(p.x, p.y, g, { color: '#3e6f9e', w: 50 });
      box(p.x - 7, p.y + 3, 14, 10, '#2a2723', 2, 1.2); circle(p.x - 3, p.y + 8, 2.5, '#7fd3ff', null);
      if (g % 40 < 2) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(p.x - 12, p.y + 8, 18, 0, TAU); ctx.fill(); }
    });
  },
  robot: { id: 'fassade', name: 'Fassaden-Inspektionsdrohne', bereich: 'Inspektion', aera: 'seit den 2010ern', typ: 'Drohne mit Kamera',
    fakt: 'Drohnen fotografieren Fassaden, Dächer und Brücken Stück für Stück. Aus Tausenden Einzelbildern entsteht am Computer ein genaues 3D-Modell, auf dem Risse und lose Teile sichtbar werden.',
    echt: 'Realistisch. Über bewohnten Gebieten braucht so ein Flug in Deutschland meist eine Genehmigung.',
    note: 'Fliegt außen am Haus entlang und fotografiert jedes Stockwerk.', color: '#3e6f9e',
    quelle: 'https://en.wikipedia.org/wiki/Unmanned_aerial_vehicle',
    box: () => { const p = facadePos(state.g); return [p.x - 30, p.y - 16, 60, 32]; } },
});

// Rohrpost zwischen Krankenstation und Labor
const TUBE_Y = ry(1) + 26, TUBE_A = rx(0) + 400, TUBE_B = rx(1) + 290;
const capsuleX = g => { const t = g % 60; return t < 8 ? TUBE_A : t < 26 ? lerp(TUBE_A, TUBE_B, ease(seg(t, 8, 26))) : TUBE_B; };
registerRunner({
  room: 'kranken',
  draw(g) {
    withAlpha('rohrpost', () => {
      ctx.fillStyle = 'rgba(220,230,234,0.55)'; ctx.fillRect(TUBE_A - 16, TUBE_Y - 8, TUBE_B - TUBE_A + 32, 16);
      line(TUBE_A - 16, TUBE_Y - 8, TUBE_B + 16, TUBE_Y - 8, INK, 1.5); line(TUBE_A - 16, TUBE_Y + 8, TUBE_B + 16, TUBE_Y + 8, INK, 1.5);
      for (const x of [TUBE_A - 18, TUBE_B + 2]) box(x, TUBE_Y - 12, 16, 24, '#8a8f94', 2, 1.5);
      const t = g % 60;
      if (t < 34) box(capsuleX(g) - 10, TUBE_Y - 5, 20, 10, '#d9542b', 5, 1.2);
    });
  },
  robot: { id: 'rohrpost', name: 'Rohrpost', bereich: 'Medizin', aera: 'seit dem 19. Jh.', typ: 'Druckluftrohr mit Kapsel',
    fakt: 'In vielen Krankenhäusern schicken Rohrpostanlagen Blutproben in Kapseln mit Druckluft direkt ins Labor, oft über mehrere Stockwerke. So kommen Proben in Sekunden an, statt dass jemand sie tragen muss.',
    echt: 'Genau so. Die Kapseln sind gepolstert, damit die Röhrchen nicht zerbrechen.',
    note: 'Schickt jede Runde eine Probe von der Krankenstation ins Labor nebenan.', color: '#d9542b',
    quelle: 'https://de.wikipedia.org/wiki/Rohrpost',
    box: g => [capsuleX(state.g) - 14, TUBE_Y - 10, 28, 20] },
});

// Zweite Rohrpost: Medikamente von der Apotheke zur Krankenstation
const TUBE2_Y = ry(1) + 50, TUBE2_A = rx(2) + 596, TUBE2_B = rx(0) + 420;
const capsule2X = g => { const t = (g + 30) % 60; return t < 8 ? TUBE2_A : t < 30 ? lerp(TUBE2_A, TUBE2_B, ease(seg(t, 8, 30))) : TUBE2_B; };
registerRunner({
  room: 'apotheke',
  draw(g) {
    withAlpha('rohrpost2', () => {
      ctx.fillStyle = 'rgba(220,230,234,0.55)'; ctx.fillRect(TUBE2_B - 16, TUBE2_Y - 8, TUBE2_A - TUBE2_B + 32, 16);
      line(TUBE2_B - 16, TUBE2_Y - 8, TUBE2_A + 16, TUBE2_Y - 8, INK, 1.5); line(TUBE2_B - 16, TUBE2_Y + 8, TUBE2_A + 16, TUBE2_Y + 8, INK, 1.5);
      line(TUBE2_A + 16, TUBE2_Y, TUBE2_A + 16, ry(1) + 36, INK, 1.5);
      box(TUBE2_B - 18, TUBE2_Y - 12, 16, 24, '#8a8f94', 2, 1.5);
      const t = (g + 30) % 60;
      if (t < 34) box(capsule2X(g) - 10, TUBE2_Y - 5, 20, 10, '#5f9a4a', 5, 1.2);
    });
  },
  robot: { id: 'rohrpost2', name: 'Rohrpost für Medikamente', bereich: 'Medizin', aera: 'seit dem 19. Jh.', typ: 'Druckluftrohr mit Kapsel',
    fakt: 'Krankenhausapotheken schicken eilige Medikamente per Rohrpost auf die Stationen. Die Leitungen führen durch Wände und Decken quer durch das Gebäude.',
    echt: 'Realistisch. Hier führt das Rohr von der Apotheke durchs Labor zur Krankenstation.',
    note: 'Schickt jede Runde ein Medikament zur Krankenstation, versetzt zur Laborprobe in der anderen Richtung.', color: '#5f9a4a',
    quelle: 'https://de.wikipedia.org/wiki/Rohrpost',
    box: () => [capsule2X(state.g) - 14, TUBE2_Y - 10, 28, 20] },
});
