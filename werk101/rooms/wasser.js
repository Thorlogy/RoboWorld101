/* Wasser unter der Stadt (UG 1): Kanal unter der Straße (c −1), Kanalsanierung unter dem Park (c −2), Kläranlage im Fels (c −3).
   Normaler Maßstab; der Boden ist bei y = 360, damit R-101 auf dem Bankett laufen kann. */
const KNX1 = rx(roomOf('kanal1').c), KNX2 = rx(roomOf('kanal2').c), KLX = rx(roomOf('klaer').c), KNY = ry(roomOf('kanal1').r);
function knTunnel(titel) {
  ctx.fillStyle = '#6b5a48'; ctx.fillRect(0, 0, RW, RH);
  // gemauerter Kanal mit Gewölbe, Abwasser in der Rinne, Bankett vorn
  ctx.fillStyle = '#9a7a5e'; ctx.beginPath(); ctx.moveTo(0, 360); ctx.lineTo(0, 190); ctx.quadraticCurveTo(RW / 2, 110, RW, 190); ctx.lineTo(RW, 360); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(42,39,35,0.25)'; ctx.lineWidth = 1;
  for (let y = 200; y < 360; y += 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(RW, y); ctx.stroke(); }
  ctx.fillStyle = '#6e6a48'; ctx.fillRect(0, 330, RW, 30);
  ctx.strokeStyle = 'rgba(230,230,200,0.5)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x < RW; x += 40) { const o = (state.g * 2) % 40; ctx.moveTo(x + o, 340); ctx.lineTo(x + o + 16, 340); } ctx.stroke();
  ctx.fillStyle = '#8a8580'; ctx.fillRect(0, 360, RW, 48); line(0, 360, RW, 360, INK, 2);
  text(titel, 30, 250, 28, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(255,255,255,0.15)' });
}
// Kanal 1: Kamerafahrwagen in einem kleinen Anschlussrohr, Kabel durch den Schacht nach oben zum Wagen auf der Straße
const knKamera = g => 120 + 420 * (0.5 - 0.5 * Math.cos(TAU * g / 480));
function drawKanal1(f) {
  const g = state.g;
  knTunnel('KANAL');
  // Einstiegsschacht mit Leiter von der Straße
  box(560, 0, 60, 150, '#5b4a3a', 0, 2); for (let y = 10; y < 150; y += 16) line(570, y, 610, y, '#8a8f94', 2);
  // Anschlussrohr im Schnitt
  box(40, 60, 520, 56, '#8a8f94', 0, 2); ctx.fillStyle = '#3b3d40'; ctx.fillRect(40, 68, 520, 40);
  withAlpha('kanalkamera', () => {
    const x = knKamera(g), y = 100;
    box(x - 26, y - 22, 52, 18, '#f0b429', 4, 1.5); circle(x - 14, y - 2, 5, '#2a2723', null); circle(x + 14, y - 2, 5, '#2a2723', null);
    box(x + 22, y - 26, 14, 14, '#23384d', 3, 1.2); glow(x + 40, y - 18, 34, 'rgba(255,250,210,0.75)');
    ctx.strokeStyle = '#2a2723'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 26, y - 14); ctx.lineTo(560, y - 14); ctx.lineTo(590, 0); ctx.stroke();
    if (x > 300 && x < 360) { box(240, 130, 210, 36, '#23384d', 1, 1.2); text('RISS BEI 12,4 M', 345, 153, 12, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f0b429' }); }
  });
  line(330, 70, 342, 106, '#d9342b', 2);
}
// Kanal 2: Fräsroboter schneidet eingewachsene Wurzeln aus dem Rohr
const knFraese = g => g < 200 ? lerp(60, 330, ease(seg(g, 0, 200))) : g < 360 ? 330 : lerp(330, 60, ease(seg(g, 360, 480)));
const knWurzel = g => g < 200 ? 1 : g < 360 ? 1 - seg(g, 200, 360) : 0.15 * seg(g, 360, 480);
function drawKanal2(f) {
  const g = state.g;
  knTunnel('KANAL');
  box(0, 60, RW, 56, '#8a8f94', 0, 2); ctx.fillStyle = '#3b3d40'; ctx.fillRect(0, 68, RW, 40);
  // Baumwurzeln wachsen durch eine Muffe ins Rohr
  line(400, 0, 400, 60, '#7a6650', 6); line(420, 20, 405, 60, '#7a6650', 4);
  const w = knWurzel(g);
  if (w > 0.02) for (let i = 0; i < 6; i++) line(400 + (i - 3) * 6, 68, 400 + (i - 3) * 14 * w, 68 + 36 * w, '#a8763f', 3);
  withAlpha('fraesroboter', () => {
    const x = knFraese(g), y = 100;
    box(x - 30, y - 20, 60, 18, '#3e6f9e', 4, 1.5); circle(x - 18, y - 2, 5, '#2a2723', null); circle(x + 18, y - 2, 5, '#2a2723', null);
    limb(x + 20, y - 16, x + 46, y - 22, 4, '#8a8f94');
    ctx.save(); ctx.translate(x + 52, y - 22); ctx.rotate(g * (g >= 200 && g < 360 ? 1.2 : 0)); for (let i = 0; i < 4; i++) { ctx.rotate(TAU / 4); line(0, 0, 9, 0, '#c9ccc8', 3); } ctx.restore();
    if (g >= 200 && g < 360) for (let i = 0; i < 3; i++) circle(x + 60 + rnd(i + g) * 14, y - 30 + rnd(i * 7 + g) * 20, 2, '#a8763f', null);
    ctx.strokeStyle = '#2a2723'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 30, y - 12); ctx.lineTo(-20, y - 12); ctx.stroke();
  });
}
// Kläranlage im Fels: Belebungsbecken mit Luftblasen, Nachklärbecken mit Räumer, automatischer Probennehmer
const klRaeumer = g => 360 + 230 * (0.5 - 0.5 * Math.cos(TAU * g / 480));
function drawKlaer(f) {
  const g = state.g;
  ctx.fillStyle = '#5b4f45'; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = '#7a6b5d'; ctx.beginPath(); ctx.moveTo(0, 360); ctx.lineTo(0, 110); ctx.quadraticCurveTo(RW / 2, 20, RW, 110); ctx.lineTo(RW, 360); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a8580'; ctx.fillRect(0, 360, RW, 48); line(0, 360, RW, 360, INK, 2);
  text('KLÄRANLAGE IM FELS', 140, 120, 26, { family: '"Saira Condensed", sans-serif', weight: 700, color: 'rgba(255,255,255,0.15)' });
  // Belebungsbecken: Bakterien fressen den Schmutz, Luft wird von unten eingeblasen
  box(30, 230, 290, 130, '#8a8580', 0, 2); ctx.fillStyle = '#7e8a5a'; ctx.fillRect(34, 244, 282, 112);
  for (let i = 0; i < 16; i++) circle(50 + (i * 37) % 260, 350 - ((g * 2 + i * 23) % 100), 3, 'rgba(230,240,220,0.8)', null);
  text('LUFT UND BAKTERIEN', 175, 222, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#f3efe4' });
  // Nachklärbecken mit Räumerbrücke
  box(340, 230, 270, 130, '#8a8580', 0, 2); ctx.fillStyle = '#6f8fa0'; ctx.fillRect(344, 244, 262, 112);
  ctx.fillStyle = '#4a4036'; ctx.fillRect(344, 340, 262, 16);
  withAlpha('raeumer', () => {
    const x = klRaeumer(g);
    box(340, 222, 270, 8, '#5d6064', 0, 1.5);
    box(x - 20, 206, 40, 18, '#f0b429', 2, 1.5); line(x, 224, x, 340, INK, 3); line(x - 16, 342, x + 16, 342, INK, 4);
  });
  withAlpha('probennehmer', () => {
    box(560, 150, 60, 60, '#e6e3da', 3, 2); box(568, 160, 44, 16, '#23384d', 1, 1);
    text(g % 120 < 60 ? 'PROBE 14' : 'KÜHLT', 590, 172, 8, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#7fe08a' });
    line(580, 210, 580, 260, '#3e6f9e', 3);
    if (g % 120 < 20) circle(580, 262 + (g % 20), 3, '#6f8fa0', null);
  });
  text('SAUBERES WASSER → FLUSS', 475, 386, 10, { family: '"IBM Plex Mono", monospace', weight: 500, align: 'center', color: '#2a2723' });
}
registerRoom({ key: 'kanal1', name: 'Kanal: Inspektion', level: 'UG 1', hitOrder: ['kanalkamera'], draw: drawKanal1, robots: [
  { id: 'kanalkamera', name: 'Kanal-Kamerawagen', bereich: 'Inspektion', aera: 'seit den 1980ern', typ: 'Fahrwagen mit Kamera und Licht', color: '#f0b429',
    fakt: 'Abwasserrohre sind oft zu eng für Menschen. Darum fährt ein kleiner Wagen mit Kamera und Lampe hinein, an einem langen Kabel. Oben im Fahrzeug schaut jemand auf den Bildschirm und notiert jeden Riss mit Meterangabe. Solche Wagen baut zum Beispiel die Firma IBAK aus Kiel.',
    echt: 'Echt. Stadtwerke prüfen so regelmäßig ihre Kanäle.', note: 'Findet bei 12,4 Metern einen Riss.',
    box: () => { const x = knKamera(state.g); return [KNX1 + x - 28, KNY + 70, 70, 34]; } } ] });
registerRoom({ key: 'kanal2', name: 'Kanal: Sanierung', level: 'UG 1', hitOrder: ['fraesroboter'], draw: drawKanal2, robots: [
  { id: 'fraesroboter', name: 'Fräsroboter', bereich: 'Bau', aera: 'heute', typ: 'Roboter mit Fräskopf im Rohr', color: '#3e6f9e',
    fakt: 'Baumwurzeln wachsen gern durch undichte Stellen in Abwasserrohre. Ein Fräsroboter fährt hinein und schneidet sie ab, ohne dass die Straße aufgegraben werden muss. Danach wird das Rohr oft von innen mit einem neuen Schlauch ausgekleidet.',
    echt: 'Echt. Dass die Wurzeln hier gleich wieder wachsen, ist Spaß – in echt dauert das Jahre.', note: 'Fräst die Wurzeln weg.',
    box: () => { const x = knFraese(state.g); return [KNX2 + x - 32, KNY + 74, 100, 30]; } } ] });
registerRoom({ key: 'klaer', name: 'Kläranlage', level: 'UG 1', hitOrder: ['probennehmer', 'raeumer'], draw: drawKlaer, robots: [
  { id: 'raeumer', name: 'Räumerbrücke', bereich: 'Umwelt', aera: 'seit Jahrzehnten', typ: 'Fahrende Brücke über dem Becken', color: '#f0b429',
    fakt: 'Vorbild ist die Kläranlage Henriksdal in Stockholm, die größte unterirdische Kläranlage der Welt: Fast alles liegt dort in Höhlen im Fels. In den Becken fressen Bakterien den Schmutz, im Nachklärbecken sinkt der Schlamm zu Boden, und ein Räumer schiebt ihn langsam zusammen.',
    echt: 'Echt. Der Räumer fährt von selbst, ist aber eher eine Maschine als ein Roboter.', note: 'Schiebt den Schlamm am Boden zusammen.',
    quelle: 'https://www.swecogroup.com/corporate-news/sweco-to-plan-expansion-of-the-worlds-largest-underground-wastewater-treatment-plant/',
    box: () => { const x = klRaeumer(state.g); return [KLX + x - 22, KNY + 204, 44, 140]; } },
  { id: 'probennehmer', name: 'Probennehmer', bereich: 'Umwelt', aera: 'heute', typ: 'Automat mit Kühlschrank', color: '#e6e3da',
    fakt: 'Ein Automat zieht regelmäßig kleine Wasserproben und kühlt sie. Im Labor wird dann geprüft, ob das gereinigte Wasser sauber genug für den Fluss ist.',
    echt: 'Echt.', note: 'Nimmt alle paar Sekunden eine Probe.',
    box: () => [KLX + 560, KNY + 150, 60, 60] } ] });
document.addEventListener('DOMContentLoaded', () => typeof KINDER !== 'undefined' && Object.assign(KINDER, {
  kanalkamera: 'Dieser kleine Wagen fährt mit einer Kamera durch enge Abwasserrohre und sucht Risse.',
  fraesroboter: 'Dieser Roboter schneidet Baumwurzeln ab, die in das Rohr gewachsen sind.',
  raeumer: 'Der Räumer schiebt den Schlamm am Boden des Beckens zusammen.',
  probennehmer: 'Dieser Automat nimmt Wasserproben, damit im Labor geprüft werden kann, ob das Wasser sauber ist.',
}));
