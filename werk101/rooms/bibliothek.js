/* Raum: Stadtbibliothek (Haus 108, EG)
   Hauptfiguren: Rückgabe-Sortieranlage, Inventur-Roboter, Selbstverbucher, Roboter-Ecke (R-101 leiht hier Buch und Film aus)
   Gag: Inventur-Roboter und Verbucher grüßen sich in Nullen und Einsen („Hi“), die Bibliothekarin sagt „Psst!“ (Bild 4–38)
   Präfix bb/BB_. */
const BBX = rx(roomOf('bibliothek').c), BBY = ry(roomOf('bibliothek').r);
const BB_MONO = { family: '"IBM Plex Mono", monospace', weight: 500 };

// Buch in der Rückgabe: kommt durch den Schlitz, fährt unter dem Funkchip-Leser durch und fällt in die dritte Kiste
function bbBuch(f) {
  if (f < 8) return { x: lerp(14, 44, seg(f, 0, 8)), y: 290, rot: 0, an: true };
  if (f < 30) return { x: lerp(44, 158, seg(f, 8, 30)), y: 290, rot: 0, an: true };
  if (f < 38) { const t = seg(f, 30, 38); return { x: lerp(158, 168, t), y: lerp(290, 334, t * t), rot: 1.2 * t, an: true }; }
  return { x: 168, y: 334, rot: 1.2, an: false };
}
// Inventur-Roboter: steht beim Verbucher, fährt dann an den Regalen entlang und zurück
function bbInv(f) {
  if (f < 36) return 262;
  if (f < 48) return lerp(262, 372, ease(seg(f, 36, 48)));
  return lerp(372, 262, ease(seg(f, 48, 60)));
}
function bbBlase(x, y, w, t, unter, dir) {
  const h = unter ? 40 : 26;
  box(x, y, w, h, '#fbf8f1', 6, 1.5);
  ctx.beginPath(); ctx.moveTo(x + w / 2 - 6, y + h); ctx.lineTo(x + w / 2 + dir * 10, y + h + 12); ctx.lineTo(x + w / 2 + 6, y + h); ctx.closePath(); paint('#fbf8f1', INK, 1.5);
  ctx.fillStyle = '#fbf8f1'; ctx.fillRect(x + w / 2 - 5, y + h - 3, 10, 4);
  text(t, x + w / 2, y + 17, 11, Object.assign({ align: 'center', color: INK }, BB_MONO));
  if (unter) text(unter, x + w / 2, y + 32, 10, Object.assign({ align: 'center', color: '#5d6064' }, BB_MONO));
}

function drawBibliothek(f) {
  ctx.fillStyle = '#ece4d2'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#5f5b55'; ctx.fillRect(0, 0, RW, 8);
  text('BIBLIOTHEK', 22, 58, 36, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(42,39,35,0.13)' });
  // Boden aus Holz
  ctx.fillStyle = '#b98a57'; ctx.fillRect(0, 360, RW, 40);
  ctx.strokeStyle = '#a3774a'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 20; x < RW; x += 44) { ctx.moveTo(x, 360); ctx.lineTo(x, 400); }
  ctx.stroke();
  line(0, 360, RW, 360, INK, 2);
  // Schild „Bitte leise“
  box(470, 30, 110, 30, '#2a2723', 3);
  text('BITTE LEISE', 525, 50, 12, Object.assign({ align: 'center', color: '#f3f1ea' }, BB_MONO));

  // Hohe Regale an der Rückwand
  for (let s = 0; s < 3; s++) {
    const x0 = 240 + s * 72;
    box(x0, 110, 66, 250, '#8e6233', 1, 1.5);
    for (let r = 0; r < 5; r++) {
      const y = 116 + r * 48;
      box(x0 + 4, y, 58, 42, '#6e4a26', 0, 1);
      for (let b = 0; b < 7; b++) {
        const h = 30 + (rnd(s * 50 + r * 7 + b) * 10 | 0);
        box(x0 + 6 + b * 8, y + 42 - h, 7, h, ['#d9542b', '#3e6f9e', '#f0b429', '#5f9a4a', '#7b4b8e', '#e6e3da'][(s + r * 3 + b) % 6], 0, 0.8);
      }
    }
  }

  // Rückgabe mit Förderband, Funkchip-Leser und drei Kisten
  withAlpha('rueckgabe', () => {
    box(4, 262, 30, 50, '#5d6064', 2, 1.5);
    box(8, 280, 22, 6, '#2a2723', 0, 1);
    text('RÜCKGABE', 4, 252, 9, Object.assign({ align: 'left', color: '#3b3d40' }, BB_MONO));
    text('24 h', 19, 304, 9, Object.assign({ align: 'center', color: '#f3f1ea' }, BB_MONO));
    box(34, 298, 140, 10, '#3b3d40', 4, 1.5);
    for (let x = 42; x < 172; x += 14) circle(x + (f % 4) * 3.5 - 7, 303, 2, '#8a8f94', null);
    // Leser als Bogen über dem Band
    box(74, 262, 6, 36, '#8a8f94', 1, 1.2); box(110, 262, 6, 36, '#8a8f94', 1, 1.2); box(74, 256, 42, 8, '#8a8f94', 2, 1.2);
    const liest = f >= 12 && f < 18;
    circle(95, 260, 2.6, liest ? '#7fe08a' : '#2d5b33', null);
    // Kisten
    for (let i = 0; i < 3; i++) {
      const x = 52 + i * 44;
      box(x, 322, 38, 36, '#3e6f9e', 2, 1.5);
      for (let b = 0; b < 3; b++) box(x + 5 + b * 10, 318 - (b % 2) * 3, 8, 12, ['#f0b429', '#e6e3da', '#5f9a4a'][(i + b) % 3], 0, 0.8);
    }
    line(42, 310, 42, 358, '#5d6064', 3); line(166, 310, 166, 358, '#5d6064', 3);
    const b = bbBuch(f);
    if (b.an) {
      ctx.save(); ctx.beginPath(); ctx.rect(30, 0, RW, RH); ctx.clip();
      ctx.translate(b.x, b.y); ctx.rotate(b.rot); box(-11, -8, 22, 8, '#d9542b', 0, 1.5); line(-9, -4, 9, -4, '#f3d2bf', 1); ctx.restore();
    }
  });

  // Selbstverbucher: Ausleihe mit Ausweis und Funkchip
  withAlpha('verbucher', () => {
    box(196, 270, 30, 90, '#8a8f94', 3, 1.5);
    box(188, 236, 46, 36, '#3b3d40', 4, 1.5);
    box(193, 241, 36, 24, '#23384d', 2, 1);
    const antwort = f >= 14 && f < 26;
    text(antwort ? '0101' : 'LEIHEN', 211, 257, 8, Object.assign({ align: 'center', color: antwort ? '#7fe08a' : '#7fd3ff' }, BB_MONO));
    box(192, 274, 38, 6, '#5d6064', 1, 1);
  });

  // Inventur-Roboter mit Funkantennen
  withAlpha('inventur', () => {
    const x = bbInv(f), fahrt = f >= 36;
    box(x - 24, 330, 48, 24, '#3b3d40', 6, 1.5);
    circle(x - 14, 356, 5, '#2a2723'); circle(x + 14, 356, 5, '#2a2723');
    box(x - 16, 340, 10, 5, '#23384d', 0, 1);
    box(x - 11, 196, 22, 136, '#e6e3da', 8, 1.5);
    for (let y = 214; y < 320; y += 26) box(x - 7, y, 14, 18, '#b9bec4', 2, 1);
    box(x - 13, 182, 26, 18, '#23384d', 5, 1.5);
    circle(x, 191, 3, state.g % 12 < 6 ? '#7fe08a' : '#2d5b33', null);
    if (fahrt) {
      ctx.strokeStyle = 'rgba(62,111,158,0.7)'; ctx.lineWidth = 2;
      for (let k = 1; k <= 2; k++) { ctx.beginPath(); ctx.arc(x, 260, 14 + k * 8 + (f % 4) * 2, -0.5 - Math.PI / 2, 0.5 - Math.PI / 2); ctx.stroke(); }
    }
  });

  // Roboter-Ecke: Bücher und Filme über Roboter, schlichte Hüllen ohne Figuren
  withAlpha('roboregal', () => {
    box(446, 246, 90, 114, '#a8763f', 1, 1.5);
    line(446, 300, 536, 300, INK, 2);
    text('ROBOTER', 491, 240, 11, Object.assign({ align: 'center', color: '#3b3d40' }, BB_MONO));
    box(454, 262, 22, 34, '#3e6f9e', 1, 1.2); circle(465, 276, 5, '#f0b429', null); line(458, 290, 472, 290, '#f3f1ea', 1.5);
    box(482, 260, 22, 36, '#5f9a4a', 1, 1.2); line(486, 270, 500, 270, '#f3f1ea', 1.5); line(486, 290, 500, 290, '#f3f1ea', 1.5);
    box(510, 264, 20, 32, '#d9542b', 1, 1.2); line(514, 290, 526, 290, '#f3f1ea', 1.5);
    for (let i = 0; i < 3; i++) {
      const x = 454 + i * 26;
      box(x, 312, 22, 32, '#23384d', 2, 1.2); circle(x + 11, 326, 7, '#c3c7cb', INK, 1); circle(x + 11, 326, 2, '#23384d', null);
    }
  });

  // Theke mit Bibliothekarin
  withAlpha('bibliothekarin', () => {
    const psst = f >= 24 && f < 40;
    const p = person({ x: 596, face: -1, shirt: '#5f9a4a', pants: '#2f4866', hair: '#8a5a2b', hand: psst ? { x: 586, y: 256 } : { x: 576, y: 296 } });
    if (psst) line(p.hand.x - 1, p.hand.y - 8, p.hand.x - 1, p.hand.y + 2, '#e2b48f', 3);
  });
  box(548, 296, 92, 64, '#7a5634', 2, 1.5);
  line(548, 304, 640, 304, '#5a3c22', 2);
  box(560, 280, 34, 16, '#3b3d40', 2, 1.2);

  // Gespräch in Nullen und Einsen
  if (f >= 4 && f < 16) bbBlase(bbInv(f) - 4, 120, 128, '01001000 01101001', '(= Hi)', -1);
  if (f >= 14 && f < 26) bbBlase(120, 172, 128, '01001000 01101001', '(= Hi)', 1);
  if (f >= 26 && f < 38) bbBlase(548, 196, 64, 'Psst!', '', 1);
}

registerRoom({
  key: 'bibliothek', name: 'Stadtbibliothek', level: 'Haus 108',
  hitOrder: ['verbucher', 'bibliothekarin', 'roboregal', 'inventur', 'rueckgabe'],
  draw: drawBibliothek,
  robots: [
    { id: 'rueckgabe', name: 'Rückgabe-Sortieranlage', bereich: 'Logistik', aera: 'heute in vielen Bibliotheken', typ: 'Förderband mit Funkchip-Leser',
      fakt: 'In der Zentralbibliothek der Universität Würzburg nimmt seit April 2022 eine Anlage rund um die Uhr Bücher zurück. Jedes Buch trägt einen kleinen Funkchip (RFID). Die Anlage liest ihn, bucht das Buch sofort zurück und sortiert es über ein Förderband in Kisten.',
      echt: 'Realistisch. Gezeichnet ist eine kleine Anlage mit drei Kisten, große Anlagen haben mehr.',
      note: 'Ein Buch kommt durch den Schlitz, fährt unter dem Leser durch, das Licht wird grün, und es fällt in die richtige Kiste.', color: '#3e6f9e',
      quelle: 'https://www.bibliothek.uni-wuerzburg.de/fileadmin/ub/pdf-Dateien/Pressemitteilungen/20220408_Start-Rueckgabe-und-Sortieranlage-ZB-final.pdf',
      box: () => [BBX + 2, BBY + 246, 176, 114] },
    { id: 'inventur', name: 'Inventur-Roboter', bereich: 'Logistik', aera: 'seit den 2010ern', typ: 'Fahrender Roboter mit Funkantennen',
      fakt: 'Inventur-Roboter fahren an den Regalen entlang und lesen mit Antennen die Funkchips in den Büchern. So finden sie auch Bücher, die am falschen Platz stehen. Bei einem Test 2016 in Luxemburg erfasste der Roboter TORY der deutschen Firma MetraLabs laut Hersteller rund 35.000 Bücher in einer Stunde.',
      echt: 'Realistisch. Ausgedacht ist das Gespräch: Roboter tauschen Daten per Funk aus, ohne Sprechblasen. Die Nullen und Einsen bedeuten aber wirklich „Hi“. So speichert ein Computer Buchstaben (ASCII-Code).',
      note: 'Grüßt den Verbucher in Nullen und Einsen und bekommt dafür von der Bibliothekarin ein „Psst!“.', color: '#e6e3da',
      quelle: 'https://www.metralabs.com/en/libraries/',
      box: f => [BBX + bbInv(f) - 26, BBY + 180, 52, 180] },
    { id: 'verbucher', name: 'Selbstverbucher', bereich: 'Service', aera: 'heute in vielen Bibliotheken', typ: 'Ausleih-Automat',
      fakt: 'Am Selbstverbucher leiht man ohne Hilfe aus: Ausweis auflegen, Buch auflegen, fertig. Der Automat liest den Funkchip im Buch und bucht es auf den Ausweis. Die Universitätsbibliothek Würzburg verleiht so seit Juli 2021.',
      echt: 'Realistisch. Dass der Automat auf seinem Bildschirm in Nullen und Einsen antwortet, ist ein Witz.',
      note: 'Antwortet dem Inventur-Roboter mit „Hi“, natürlich in Nullen und Einsen.', color: '#8a8f94',
      quelle: 'https://www.bibliothek.uni-wuerzburg.de/fileadmin/ub/pdf-Dateien/Pressemitteilungen/20220408_Start-Rueckgabe-und-Sortieranlage-ZB-final.pdf',
      box: () => [BBX + 186, BBY + 232, 50, 128] },
    { id: 'roboregal', name: 'Roboter-Ecke', bereich: 'Medien', aera: '1967 bis heute', typ: 'Regal mit Büchern und Filmen',
      fakt: 'Hier stehen Bücher und Filme über Roboter: „Robbi, Tobbi und das Fliewatüüt“ von Boy Lornsen (Buch 1967, Fernsehserie 1972), „Der wilde Roboter“ von Peter Brown (Buch 2016, Film 2024) und der Film „WALL·E“ (2008) über einen Roboter, der Müll aufräumt.',
      echt: 'Die Titel gibt es wirklich. Die Hüllen sind schlicht gezeichnet, Figuren aus Büchern und Filmen zeigen wir nicht.',
      note: 'Hier leiht sich R-101 ein Buch und einen Film für seine Botengänge aus.', color: '#a8763f',
      quelle: 'https://en.wikipedia.org/wiki/Robbi,_Tobbi_und_das_Fliewat%C3%BC%C3%BCt',
      box: () => [BBX + 444, BBY + 230, 94, 130] },
    { id: 'bibliothekarin', name: 'Bibliothekarin', bereich: 'Mensch', aera: 'Maßstab', typ: 'Mensch an der Theke',
      fakt: 'Sie berät beim Suchen, bestellt neue Bücher und sorgt für Ruhe im Lesesaal. Den Robotern hat sie gerade „Psst!“ gesagt, obwohl die gar keinen Ton von sich geben.',
      note: 'Legt den Finger an den Mund.', color: '#5f9a4a',
      box: () => [BBX + 572, BBY + 236, 50, 124] },
  ],
});
