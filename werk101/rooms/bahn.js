/* Außenfelder links vom Flughafen: Bahnhof (c −7) mit Halt der Magnetschwebebahn darüber, Zugwerk (c −8)
   Bahnhof: Schnellzug in echter Größe (3,8 m hoch) fährt aus der Halle ein, hält, fährt weiter. Läuft auf state.g.
   Zugwerk: Vorbild E-Check der Bahn in Köln-Nippes: Kameratore, Cobots mit zwei Armen, Unterflur-Prüfgerät. */
const BHX = rx(roomOf('bahnhof').c), BHY = ry(roomOf('bahnhof').r);
const ZWX = rx(roomOf('zugwerk').c), ZWY = ry(roomOf('zugwerk').r);
const ZUG_OBEN = 384 - 262, ZUG_UNTEN = 372;   // Wagenkasten 3,8 m hoch

// Wagenkasten mit Fensterband, Türen und rotem Streifen; nase = x der Zugspitze (oder null)
function zugKasten(x0, x1, nase, offen, muster = 0) {
  ctx.beginPath();
  if (nase != null) {
    ctx.moveTo(x0, ZUG_OBEN + 10); ctx.lineTo(nase - 240, ZUG_OBEN + 10);
    ctx.quadraticCurveTo(nase - 70, ZUG_OBEN + 30, nase, ZUG_UNTEN - 36);
    ctx.quadraticCurveTo(nase + 6, ZUG_UNTEN - 6, nase - 30, ZUG_UNTEN); ctx.lineTo(x0, ZUG_UNTEN);
  } else ctx.rect(x0, ZUG_OBEN + 10, x1 - x0, ZUG_UNTEN - ZUG_OBEN - 10);
  ctx.closePath(); paint('#f3f3f0', INK, 2.5);
  const ende = nase != null ? nase - 250 : x1;
  ctx.fillStyle = '#2f3a44'; ctx.fillRect(x0, ZUG_OBEN + 70, ende - x0, 50);
  if (nase != null) { ctx.beginPath(); ctx.moveTo(nase - 230, ZUG_OBEN + 66); ctx.quadraticCurveTo(nase - 120, ZUG_OBEN + 72, nase - 70, ZUG_OBEN + 120); ctx.lineTo(nase - 200, ZUG_OBEN + 120); ctx.closePath(); paint('#2f3a44', INK, 1.5); }
  ctx.fillStyle = '#d9342b'; ctx.fillRect(x0, ZUG_UNTEN - 52, (nase != null ? nase - 40 : x1) - x0, 10);
  // Fensterstege und Türen alle 300 Einheiten
  for (let x = x0 - ((x0 - muster) % 300 + 300) % 300; x < ende; x += 300) {
    for (const d of [60, 120, 180]) if (x + d > x0 && x + d < ende) line(x + d, ZUG_OBEN + 70, x + d, ZUG_OBEN + 120, '#f3f3f0', 4);
    const tx = x + 230; if (tx > x0 && tx + 46 < ende) { box(tx, ZUG_OBEN + 60, 46, ZUG_UNTEN - ZUG_OBEN - 66, offen ? '#3b3d40' : '#e8e8e4', 2, 1.5); }
  }
  ctx.fillStyle = '#3b3d40'; ctx.fillRect(x0, ZUG_UNTEN, (nase != null ? nase - 60 : x1) - x0, 8);
}

/* ---------- Bahnhof ---------- */
function bhNase(g) {
  if (g < 60) return null;
  if (g < 150) return lerp(-260, 600, 1 - Math.pow(1 - seg(g, 60, 150), 3));
  if (g < 330) return 600;
  if (g < 430) return lerp(600, 1500, Math.pow(seg(g, 330, 430), 2));
  return null;
}
function drawBahnhof(f) {
  const g = state.g, nase = bhNase(g), offen = g >= 170 && g < 310;
  // Gleis, Bahnsteigkante vorn
  ctx.fillStyle = '#6d6a64'; ctx.fillRect(0, 372, RW, 12);
  for (let x = 6; x < RW; x += 24) ctx.fillRect(x, 380, 12, 4);
  if (nase != null) zugKasten(-20, RW + 20, nase, offen);
  // Halle: Dach, Stützen, Stirnwand links mit Einfahrt
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 84, RW, 14); line(0, 98, RW, 98, INK, 2);
  for (const x of [200, 420]) { ctx.fillStyle = '#8a8f94'; ctx.fillRect(x - 5, 98, 10, 286); }
  box(-10, 84, 40, 300, '#7d7972', 0, 2);
  // Bahnsteig
  ctx.fillStyle = '#c9c4b8'; ctx.fillRect(0, 384, RW, 24); line(0, 384, RW, 384, INK, 2);
  ctx.fillStyle = '#f0b429'; ctx.fillRect(0, 386, RW, 3);
  text('BAHNHOF', 250, 70, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Anzeige
  line(310, 98, 310, 112, INK, 2);
  box(232, 112, 156, 34, '#23384d', 2, 2);
  const txt = nase == null || g < 150 ? 'SCHNELLZUG · GLEICH' : g < 330 ? 'SCHNELLZUG · HÄLT' : 'SCHNELLZUG · ABFAHRT';
  text(txt, 310, 134, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f0b429' });
  // Reisende: zwei warten, steigen ein; einer steigt aus
  const ein = seg(g, 200, 260);
  withAlpha('reisende', () => {
    if (g < 200 || g >= 440) { person({ x: 480, foot: 396, face: -1, shirt: '#5f9a4a', pants: '#3b3d40' }); person({ x: 520, foot: 396, face: -1, shirt: '#d9542b', s: 0.8 }); }
    else if (g < 260) { ctx.save(); ctx.globalAlpha *= 1 - ein; person({ x: lerp(480, 470, ein), foot: 396, face: -1, shirt: '#5f9a4a', pants: '#3b3d40' }); person({ x: lerp(520, 480, ein), foot: 396, face: -1, shirt: '#d9542b', s: 0.8 }); ctx.restore(); }
    if (g >= 190 && g < 330) person({ x: lerp(250, 130, seg(g, 190, 330)), foot: 396, face: -1, shirt: '#3e6f9e', hat: true });
  });
}

/* ---------- Zugwerk ---------- */
function zwVersatz(g) { return g < 200 ? 300 * ease(seg(g, 0, 200)) : 300; }
function drawZugwerk(f) {
  const g = state.g, v = zwVersatz(g);
  // Halle mit Dachbindern
  ctx.fillStyle = '#d9d6cf'; ctx.fillRect(0, 60, RW, 324);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 50, RW, 14);
  for (let x = 40; x < RW; x += 160) { line(x, 64, x + 80, 96, '#8a8f94', 3); line(x + 160, 64, x + 80, 96, '#8a8f94', 3); }
  text('ZUGWERK', 40, 96, 34, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.15)' });
  // Grube unter dem Gleis
  ctx.fillStyle = '#3b3d40'; ctx.fillRect(0, 380, RW, 28);
  // Zug fährt langsam durch das Kameratore, dann steht er
  zugKasten(-20, RW + 20, null, false, v);
  ctx.fillStyle = '#6d6a64'; ctx.fillRect(0, 372, RW, 8);
  // Kameratore: Rahmen mit vielen Kameras rundum
  withAlpha('kamerator', () => {
    const tx = 120, an = g < 200;
    ctx.fillStyle = '#5d6064'; ctx.fillRect(tx - 14, 90, 14, 294); ctx.fillRect(tx + 70, 90, 14, 294); ctx.fillRect(tx - 14, 90, 98, 14);
    for (let i = 0; i < 8; i++) { circle(tx - 7, 120 + i * 32, 3, an && (g + i * 3) % 12 < 6 ? '#7fd3ff' : '#23384d', null); circle(tx + 77, 120 + i * 32, 3, an && (g + i * 5) % 12 < 6 ? '#7fd3ff' : '#23384d', null); }
    for (let i = 0; i < 3; i++) circle(tx + 16 + i * 20, 97, 3, an ? '#7fd3ff' : '#23384d', null);
    if (an) { ctx.fillStyle = 'rgba(127,211,255,0.12)'; ctx.fillRect(tx, 104, 70, 268); }
  });
  // Unterflur-Prüfgerät in der Grube
  withAlpha('mufig', () => {
    const mx = g < 220 ? 560 : lerp(560, 80, 0.5 - 0.5 * Math.cos(TAU * seg(g, 220, 480)));
    box(mx - 26, 386, 52, 16, '#f0b429', 3, 1.5); circle(mx - 16, 402, 4, '#2a2723', null); circle(mx + 16, 402, 4, '#2a2723', null);
    line(mx, 386, mx, 378, INK, 3); box(mx - 6, 372, 12, 8, '#23384d', 1, 1.2);
    if (g >= 220) { ctx.fillStyle = 'rgba(127,211,255,0.35)'; ctx.beginPath(); ctx.moveTo(mx, 372); ctx.lineTo(mx - 24, 364); ctx.lineTo(mx + 24, 364); ctx.closePath(); ctx.fill(); }
  });
  // Cobot auf fahrbarer Plattform mit zwei Armen: füllt Frischwasser
  withAlpha('echeck', () => {
    const bx = 420, by = 384, an = seg(g, 230, 260) - seg(g, 430, 460);
    box(bx - 40, by - 26, 80, 22, '#e6e3da', 4, 2); circle(bx - 26, by - 4, 5, '#2a2723', null); circle(bx + 26, by - 4, 5, '#2a2723', null);
    box(bx - 8, by - 96, 16, 70, '#b9d0dc', 0, 2);
    const S = { x: bx - 4, y: by - 92 }, H = { x: bx - 4 - lerp(10, 40, an), y: lerp(by - 70, by - 150, an) };
    const E = { x: (S.x + H.x) / 2 - 18, y: (S.y + H.y) / 2 + 6 };
    limb(S.x, S.y, E.x, E.y, 6, '#b9d0dc'); limb(E.x, E.y, H.x, H.y, 5, '#b9d0dc');
    const S2 = { x: bx + 4, y: by - 92 }, H2 = { x: bx + 30, y: by - 120 };
    limb(S2.x, S2.y, bx + 26, by - 96, 6, '#b9d0dc'); limb(bx + 26, by - 96, H2.x, H2.y, 5, '#b9d0dc'); box(H2.x - 5, H2.y - 8, 10, 8, '#23384d', 1, 1.2);
    // Schlauch zum Wasseranschluss
    ctx.strokeStyle = '#3e6f9e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx - 30, by - 26); ctx.quadraticCurveTo(bx - 60, by - 60, H.x, H.y); ctx.stroke();
    box(H.x - 6, H.y - 6, 12, 10, '#3e6f9e', 2, 1.2);
    if (an >= 1) for (let i = 0; i < 3; i++) circle(H.x - 4, H.y - 14 - ((g * 2 + i * 7) % 20), 2, '#7fd3ff', null);
  });
  withAlpha('technikerin', () => person({ x: 560, foot: 384, face: -1, shirt: '#f08a24', pants: '#3d5a80', hat: true }));
}

const ZW_QUELLE = 'https://www.baslerweb.com/de-de/use-cases/e-check-deutsche-bahn/';
registerRoom({
  key: 'bahnhof', name: 'Bahnhof', level: 'Außengelände',
  hitOrder: ['reisende', 'schnellzug'],
  draw: drawBahnhof,
  robots: [
    { id: 'schnellzug', name: 'Schnellzug', bereich: 'Mobilität', aera: 'seit 1991', typ: 'Hochgeschwindigkeitszug', color: '#f3f3f0',
      fakt: 'Vorbild ist der ICE der Deutschen Bahn. Er ist knapp 4 Meter hoch, ein langer Zug misst über 200 Meter. Anders als die U-Bahn fährt er noch mit Lokführerin oder Lokführer; fahrerlos fahren bisher vor allem U-Bahnen, in Nürnberg seit 2008.',
      echt: 'Echt in Größe und Form, der Name steht nur auf der Karte. Oben über dem Bahnsteig hält die Magnetschwebebahn zum Umsteigen, das ist ausgedacht.',
      note: 'Rollt aus der Halle ein, hält, die Türen gehen auf, zwei Reisende steigen ein.',
      box: () => { const n = bhNase(state.g); return n == null ? [-99999, -99999, 1, 1] : [BHX + Math.max(0, n - 700), BHY + ZUG_OBEN + 10, Math.min(RW, n) - Math.max(0, n - 700), ZUG_UNTEN - ZUG_OBEN]; } },
    { id: 'reisende', name: 'Reisende', bereich: 'Mensch', aera: 'Maßstab', typ: 'Menschen am Bahnsteig', color: '#5f9a4a',
      fakt: 'Ein Mensch ist hier etwa 1,70 Meter groß. So sieht man, wie hoch ein Schnellzug wirklich ist.', note: 'Steigen ein, wenn die Türen offen sind.',
      box: () => [BHX + 450, BHY + 270, 100, 126] },
  ],
});
registerRoom({
  key: 'zugwerk', name: 'Zugwerk', level: 'Außengelände',
  hitOrder: ['mufig', 'echeck', 'technikerin', 'kamerator'],
  draw: drawZugwerk,
  robots: [
    { id: 'kamerator', name: 'Kameratore', bereich: 'Inspektion', aera: 'seit 2023', typ: 'Tor mit 32 Kameras', color: '#5d6064',
      fakt: 'Im ICE-Werk Köln-Nippes rollt der Zug langsam durch ein Tor mit 32 Kameras. Eine KI sucht auf den Bildern nach losen oder fehlenden Schrauben, Abnutzung und Steinschlag. Weitere Werke sollen folgen.',
      echt: 'Echt. Hier leuchten die Kameras, solange der Zug durchrollt.', note: 'Schaut sich jeden Wagen rundum an.', quelle: ZW_QUELLE,
      box: () => [ZWX + 106, ZWY + 90, 98, 294] },
    { id: 'echeck', name: 'Cobot mit zwei Armen', bereich: 'Industrie', aera: 'seit 2023', typ: 'Fahrbarer Roboter mit zwei Armen', color: '#b9d0dc',
      fakt: 'Beim E-Check der Bahn füllen fahrbare Cobots mit zwei Armen Frischwasser in den Zug und pumpen das Abwasser ab. An einem Arm trägt jeder eine Kamera für Stellen, die das Kameratore nicht sieht.',
      echt: 'Echt. Er fährt erst los, wenn der Zug steht.', note: 'Ein Arm hält den Wasserschlauch, der andere die Kamera.', quelle: ZW_QUELLE,
      box: () => [ZWX + 370, ZWY + 230, 100, 154] },
    { id: 'mufig', name: 'Unterflur-Prüfgerät', bereich: 'Inspektion', aera: 'seit 2023', typ: 'Fahrbares Prüfgerät in der Grube', color: '#f0b429',
      fakt: 'Unter dem stehenden Zug fährt ein mobiles Prüfgerät durch die Grube und fotografiert den Unterboden mit einer Kamera. So muss niemand mehr mit der Lampe unter jeden Wagen kriechen.',
      echt: 'Echt, die Bahn nennt es MUFIG.', note: 'Fährt hin und her, sobald der Zug steht.', quelle: ZW_QUELLE,
      box: () => { const mx = state.g < 220 ? 560 : lerp(560, 80, 0.5 - 0.5 * Math.cos(TAU * seg(state.g, 220, 480))); return [ZWX + mx - 28, ZWY + 366, 56, 42]; } },
    { id: 'technikerin', name: 'Technikerin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Fachkraft im Werk', color: '#f08a24',
      fakt: 'Die Roboter melden, was ihnen auffällt. Reparieren und entscheiden tun weiterhin Menschen.', note: 'Prüft, was die Kameras melden.',
      box: () => [ZWX + 535, ZWY + 262, 50, 122] },
  ],
});

/* ---------- Halt der Magnetschwebebahn über dem Bahnhof (himmel.js ruft mgStation) ---------- */
const MG_HALT = BHX + RW / 2;
function mgStation(ab) {
  const y = GROUND - 330, x0 = MG_HALT - 900, x1 = MG_HALT + 900;
  // Bahnsteig vor dem Fahrweg, Dach, Treppe nach unten
  ctx.fillStyle = ab ? '#5a6280' : '#c9c4b8'; ctx.fillRect(x0, y + 8, x1 - x0, 22); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x0, y + 8, x1 - x0, 22);
  ctx.fillStyle = '#f0b429'; ctx.fillRect(x0, y + 8, x1 - x0, 3);
  ctx.fillStyle = ab ? '#3b4566' : '#5f5b55'; ctx.fillRect(x0 - 20, y - 150, x1 - x0 + 40, 14);
  for (let x = x0; x <= x1; x += 300) { ctx.fillStyle = ab ? '#424b66' : '#8a8f94'; ctx.fillRect(x - 4, y - 136, 8, 144); }
  ctx.strokeStyle = ab ? '#424b66' : '#8a8f94'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x1, y + 30); ctx.lineTo(x1 + 220, GROUND); ctx.stroke();
  box(MG_HALT - 110, y - 132, 220, 30, '#2a2723', 0, 2);
  text('UMSTEIGEN · SCHNELLZUG', MG_HALT, y - 112, 13, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  // Wartende, solange die Bahn nicht da ist
  const g = state.g % RUN_P;
  if (g < 130 || g > 250) for (const [dx, sh] of [[-300, '#7b4b8e'], [-240, '#3e6f9e'], [260, '#5f9a4a']]) person({ x: MG_HALT + dx, foot: y + 8, face: 1, shirt: sh });
}
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  schnellzug: 'Ein Schnellzug ist so hoch wie zwei Erwachsene übereinander. Vorne sitzt noch ein Mensch und fährt ihn.',
  reisende: 'Diese Menschen warten auf den Zug und steigen ein.',
  kamerator: 'Durch dieses Tor fährt der Zug ganz langsam. 32 Kameras machen Fotos, und ein Computer sucht nach losen Schrauben.',
  echeck: 'Dieser Roboter füllt frisches Wasser in den Zug, damit man sich dort die Hände waschen kann.',
  mufig: 'Dieser kleine Wagen fährt unter dem Zug durch die Grube und fotografiert ihn von unten.',
  technikerin: 'Die Technikerin schaut sich an, was die Roboter gefunden haben, und repariert es.',
}));
