/* Werk 101 – Läufer: Figuren, die über Räume und Stockwerke hinweg unterwegs sind.
   Sie laufen auf der globalen Uhr state.g (0–479, 12 Bilder pro Sekunde, also 40 Sekunden). */
const RUN_P = 480;
const FLOOR1 = ry(5) + 360, FLOOR4 = ry(2) + 360;
const SHAFT_C = SHAFT_X + SHAFT / 2;
const XL = rx(0) + 500, XK = rx(0) + 520;
const CAB_H = 112;

// Aufzugskabine (wird im Gerüst gezeichnet): EG (Steg im Hafen) → Ebene 1 → Ebene 4 → Ebene 1 → EG
const PIER = ry(6) + 330;
function cabinY(g) {
  g %= RUN_P;
  const e = PIER - CAB_H, a = FLOOR1 - CAB_H, b = FLOOR4 - CAB_H;
  if (g < 80) return e;
  if (g < 100) return lerp(e, a, ease(seg(g, 80, 100)));
  if (g < 120) return a;
  if (g < 150) return lerp(a, b, ease(seg(g, 120, 150)));
  if (g < 360) return b;
  if (g < 390) return lerp(b, a, ease(seg(g, 360, 390)));
  if (g < 416) return a;
  if (g < 440) return lerp(a, e, ease(seg(g, 416, 440)));
  return e;
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
      // nachts nur eine Notfall-Sendung pro Runde (welt.js zeigt dazu die Anforderung)
      if (t < 34 && (typeof istNacht !== 'function' || !istNacht() || (g >= 210 && g < 270))) box(capsule2X(g) - 10, TUBE2_Y - 5, 20, 10, '#5f9a4a', 5, 1.2);
    });
  },
  robot: { id: 'rohrpost2', name: 'Rohrpost für Medikamente', bereich: 'Medizin', aera: 'seit dem 19. Jh.', typ: 'Druckluftrohr mit Kapsel',
    fakt: 'Krankenhausapotheken schicken eilige Medikamente per Rohrpost auf die Stationen. Die Leitungen führen durch Wände und Decken quer durch das Gebäude.',
    echt: 'Realistisch. Hier führt das Rohr von der Apotheke durchs Labor zur Krankenstation.',
    note: 'Schickt jede Runde ein Medikament zur Krankenstation, versetzt zur Laborprobe in der anderen Richtung.', color: '#5f9a4a',
    quelle: 'https://de.wikipedia.org/wiki/Rohrpost',
    box: () => [capsule2X(state.g) - 14, TUBE2_Y - 10, 28, 20] },
});

// Paketreise: Hafen (EG) → Aufzug → Ebene 4 → Wohnbereich. Entlader auf dem Steg, Hausroboter fährt mit.
const PR_HX = rx(2), PR_P = rx(2) + 600, PR_C = SHAFT_X + 122, PR_W = rx(1) + 596;
const PR_PAL = { x: rx(2) + 508, y: PIER - 46 };
function drawParcel(x, bottom, open = 0, s = 1) {
  ctx.save(); ctx.translate(x, bottom); ctx.scale(s, s);
  box(-12, -18, 24, 18, '#c9a46a', 1, 1.5);
  line(-12, -10, 12, -10, '#a8763f', 2);
  box(2, -8, 8, 5, '#d9542b', 0, 1);
  if (open > 0) for (const d of [-1, 1]) { ctx.save(); ctx.translate(12 * d, -18); ctx.rotate(-d * 2.2 * open); box(d > 0 ? -12 : 0, -2, 12, 3, '#d8b77f', 0, 1.2); ctx.restore(); }
  ctx.restore();
}
function boteY(x, floor, g) { return x > SHAFT_X ? cabinY(g) + CAB_H - 8 : floor; }
function botePos(g) {
  g %= RUN_P;
  if (g < 30) return { x: PR_P, y: PIER, dir: -1 };
  if (g < 72) { const x = lerp(PR_P, PR_C, ease(seg(g, 30, 72))); return { x, y: boteY(x, PIER, g), dir: 1 }; }
  if (g < 165) return { x: PR_C, y: cabinY(g) + CAB_H - 8, dir: -1 };
  if (g < 235) { const x = lerp(PR_C, PR_W, ease(seg(g, 165, 235))); return { x, y: boteY(x, FLOOR4, g), dir: -1 }; }
  if (g < 282) return { x: PR_W, y: FLOOR4, dir: -1 };
  if (g < 352) { const x = lerp(PR_W, PR_C, ease(seg(g, 282, 352))); return { x, y: boteY(x, FLOOR4, g), dir: 1 }; }
  if (g < 440) return { x: PR_C, y: cabinY(g) + CAB_H - 8, dir: 1 };
  if (g < 460) { const x = lerp(PR_C, PR_P, ease(seg(g, 440, 460))); return { x, y: boteY(x, PIER, g), dir: -1 }; }
  return { x: PR_P, y: PIER, dir: -1 };
}
// Greifer des Entladers (u = Zeit ab Bild 460 der Runde)
function greifer(g) {
  const u = (g % RUN_P + 20) % RUN_P;
  const palUp = { x: PR_PAL.x, y: PIER - 62 }, pal = PR_PAL, amrUp = { x: PR_P, y: PIER - 66 }, amr = { x: PR_P, y: PIER - 44 },
    idle = { x: PR_HX + 556, y: PIER - 74 }, ship = { x: PR_HX + 528, y: PIER - 66 };
  const keys = [[0, palUp], [6, pal], [10, pal], [16, palUp], [28, amrUp], [36, amr], [40, amr], [50, amrUp], [60, idle], [110, idle],
    [120, ship], [135, palUp], [145, pal], [150, pal], [165, idle], [460, idle], [480, palUp]];
  for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) {
    const [a, A] = keys[i - 1], [b, B] = keys[i], t = ease(seg(u, a, b));
    return { x: lerp(A.x, B.x, t), y: lerp(A.y, B.y, t) };
  }
  return palUp;
}
// Wo das nächste bzw. reisende Paket gerade ist (ohne den Teil beim Bewohner)
function paketOrte(g) {
  g %= RUN_P; const out = [], T = greifer(g);
  if (g >= 125 && g < 466) out.push({ x: PR_PAL.x, y: PIER - 28 });
  if ((g >= 100 && g < 125) || g >= 466 || g < 20) out.push({ x: T.x, y: T.y + 18 });
  if (g >= 20 && g < 250) { const b = botePos(g); out.push({ x: b.x, y: b.y - 26, follow: true }); }
  return out;
}
// Für „Paket verfolgen“: Mittelpunkt der Reise zu jedem Zeitpunkt
function paketFokus(g) {
  g %= RUN_P;
  if (g >= 250 && g < 476) return { x: rx(1) + 500, y: FLOOR4 - 60 };
  if (g >= 476 || g < 20) { const T = greifer(g); return { x: T.x, y: T.y + 10 }; }
  const b = botePos(g); return { x: b.x, y: b.y - 40 };
}
registerRunner({
  room: 'hafen',
  draw(g) {
    const X = PR_HX;
    ctx.fillStyle = '#3b3d40'; ctx.fillRect(SHAFT_X - WALL, PIER - 58, WALL, 58);
    // Steg vor dem Schiff
    for (const x of [500, 560, 620]) box(X + x - 3, PIER, 6, 70, '#6b4a2a', 0, 1.2);
    box(X + 470, PIER - 4, 170, 8, '#a8763f', 0, 1.5);
    box(PR_PAL.x - 17, PIER - 9, 34, 5, '#a8763f', 0, 1.2);
    drawParcel(PR_PAL.x, PIER - 9 + 0, 0, 1.08);
    withAlpha('entlader', () => {
      const T = greifer(g), S = { x: X + 548, y: PIER - 36 }, W = { x: T.x, y: T.y - 12 };
      for (const x of [532, 564]) circle(X + x, PIER - 6, 5, '#2d2f33');
      box(X + 522, PIER - 26, 52, 18, '#3e6f9e', 3);
      line(X + 568, PIER - 26, X + 568, PIER - 104, INK, 4); line(X + 568, PIER - 26, X + 568, PIER - 104, '#8a8f94', 2);
      box(X + 560, PIER - 116, 16, 12, '#2a2723', 2, 1.2); circle(X + 568, PIER - 110, 3, g % 12 < 6 ? '#7fd3ff' : '#3f7895', null);
      box(X + 538, PIER - 34, 20, 8, '#8a8f94', 2, 1.2);
      const E = ik2(S, W, 40, 40);
      limb(S.x, S.y, E.x, E.y, 7, '#f0b429'); limb(E.x, E.y, W.x, W.y, 6, '#f0b429');
      circle(E.x, E.y, 4, '#3b3d40', INK, 1.2);
      line(W.x, W.y, T.x, T.y - 5, INK, 3);
      box(T.x - 13, T.y - 6, 26, 6, '#3b3d40', 1, 1.2);
    });
    paketOrte(g).filter(o => !o.follow).forEach(o => drawParcel(o.x, o.y));
  },
  robot: { id: 'entlader', name: 'Paketentlader', bereich: 'Logistik', aera: 'seit 2022', typ: 'Fahrbarer Roboterarm mit Sauggreifer',
    fakt: 'Der Roboter Stretch von Boston Dynamics ist seit 2022 zu kaufen und räumt Kartons aus Lkw und Containern. Ein Sauggreifer hebt Kartons bis etwa 23 Kilogramm. Seit 2023 entlädt er zum Beispiel Container in einem Logistikzentrum am Hafen von Los Angeles.',
    echt: 'Realistisch bis auf den Ort: In echt arbeitet er in Hallen am Container oder Lkw, nicht auf einem Steg am Schiff.',
    note: 'Holt ein Paket vom Stapel und setzt es genau in den Hausroboter. Danach wartet er auf die nächste Runde.', color: '#3e6f9e',
    quelle: 'https://robotics247.com/article/boston_dynamics_stretch_now_available_for_commercial_purchase',
    box: () => [PR_HX + 516, PIER - 118, 66, 118] },
});
registerRunner({
  room: 'hafen',
  draw(g) {
    withAlpha('paketbote', () => {
      const p = botePos(g);
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.dir, 1);
      for (const x of [-11, 11]) circle(x, -5, 4.5, '#2d2f33');
      box(-17, -26, 34, 20, '#e6e3da', 4);
      box(-17, -26, 34, 4, '#3e6f9e', 1, 1.2);
      box(-12, -18, 12, 6, '#23384d', 1, 1); circle(10, -14, 2, g % 8 < 4 ? '#7fe08a' : '#2d5b33', null);
      line(-14, -26, -14, -46, INK, 1.5); circle(-14, -47, 2.5, '#d9542b', INK, 1);
      ctx.restore();
    });
    paketOrte(g).filter(o => o.follow).forEach(o => drawParcel(o.x, o.y));
  },
  robot: { id: 'paketbote', name: 'Hauslieferroboter', bereich: 'Logistik', aera: 'seit 2014', typ: 'Kleiner Lieferroboter für Gebäude',
    fakt: 'Seit 2014 bringen kleine Roboter in Hotels Handtücher und Bestellungen bis vor die Zimmertür. Heute fahren solche Geräte auch in Kliniken, Bürohäusern und Wohnanlagen, rufen den Aufzug per Funk und finden allein ins richtige Stockwerk.',
    echt: 'Realistisch. Echte Geräte haben meist ein verschließbares Fach; hier ist es offen, damit man das Paket verfolgen kann.',
    note: 'Bringt jede Runde ein Paket vom Hafen bis in den Wohnbereich und fährt mit dem Lieferroboter Aufzug. Mit „Paket verfolgen“ fährt die Ansicht mit.', color: '#e6e3da',
    quelle: 'https://en.wikipedia.org/wiki/Delivery_robot',
    box: () => { const p = botePos(state.g); return [p.x - 20, p.y - 50, 40, 50]; } },
});
