/* Auskunft im Steuerfeld von R-101: beantwortet Fragen nur aus den Karten der Welt (Name, Typ, Fakt, Echt, Hinweis).
   Keine KI, kein Server: Wörter der Frage werden in allen Karten gesucht, die beste Karte gewinnt, daraus der passendste Satz.
   Passt keine Karte gut genug, sagt die Auskunft ehrlich, dass sie es nicht weiß. Geheime Räume bleiben geheim. */
const AX_STOPP = new Set(('wer was wo wie warum wieso weshalb wann welche welcher welches welchen ist sind war waren gibt es '
  + 'der die das den dem des ein eine einen einer eines einem und oder aber ich du er sie wir ihr man kann koennen kannst konnte '
  + 'macht machen tut tun hier da dort im in am an auf aus zu zum zur von vom mit fuer bei nach viel viele sehr nicht kein keine '
  + 'noch auch so mal denn eigentlich hat haben hatte wird werden wurde sein seine ihre mir mich dir dich uns sich wohl gerne bitte '
  + 'roboter dieser diese dieses jetzt immer etwas alles weisst sag sage erzaehl erklaer').split(' '));
const axStamm = w => (w.length > 5 ? w.replace(/(en|er|es|e|n|s)$/, '') : w);
// wenige Wortformen, die das einfache Kürzen nicht zusammenbringt
const AX_GLEICH = { gewonnen: 'gewinn', gewann: 'gewinn', gewinnt: 'gewinn', gewinner: 'gewinn', sieger: 'gewinn', siegt: 'gewinn',
  frisst: 'fress', fressen: 'fress', frass: 'fress', isst: 'fress', essen: 'fress', tief: 'tief', tiefe: 'tief', tiefste: 'tief', hoch: 'hoch', hoehe: 'hoch' };
const axWoerter = t => avNorm(t).split(' ').filter(w => w && !AX_STOPP.has(w)).map(w => AX_GLEICH[w] || axStamm(w));
const axTrifft = (frage, wort) => frage === wort || (frage.length >= 4 && wort.length >= 4 && (wort.startsWith(frage) || frage.startsWith(wort)));
function axSaetze(t) { return (t || '').split(/(?<=[.!?])\s+/).filter(Boolean); }
function axGeheim(r) { const o = ROOMS.find(x => x.built === r.room); return o && ((o.secret && !state.secret) || (o.mond && !state.mond)); }

function axSuche(frage) {
  const terme = [...new Set(axWoerter(frage))];
  if (!terme.length) return null;
  let best = null;
  for (const r of ROBOTS) {
    if (r.id === 'avatar' || axGeheim(r)) continue;
    const raum = ROOMS.find(o => o.built === r.room);
    const felder = [[r.name, 6], [r.typ, 3], [r.bereich, 2], [raum && raum.name, 2], [[r.fakt, r.echt, r.note].join(' '), 1]];
    let score = 0;
    for (const t of terme) {
      let w = 0;
      for (const [text, gew] of felder) if (text && axWoerter(text).some(x => axTrifft(t, x))) w = Math.max(w, gew);
      score += w * (/^\d+$/.test(t) ? 2 : 1);
    }
    if (!best || score > best.score) best = { r, score, terme };
  }
  return best && best.score >= 3 ? best : null;
}
function axAntwort(treffer) {
  const { r } = treffer; let { terme } = treffer;
  if (simpleMode && typeof KINDER !== 'undefined' && KINDER[r.id]) return KINDER[r.id];
  const saetze = [...axSaetze(r.fakt), ...axSaetze(r.echt)];
  // Wörter, die schon die Karte bestimmt haben (Name, Typ, Raum), sagen wenig über den passenden Satz
  const raum = ROOMS.find(o => o.built === r.room), kopf = axWoerter([r.name, r.typ, raum && raum.name].join(' '));
  const rest = terme.filter(t => !kopf.some(x => axTrifft(t, x)));
  if (rest.length) terme = rest;
  let best = saetze[0] || r.typ, bs = -1;
  saetze.forEach((s, i) => {
    const w = axWoerter(s), n = terme.filter(t => w.some(x => axTrifft(t, x))).length - i * 0.01;
    if (n > bs) { bs = n; best = s + (s.length < 70 && saetze[i + 1] ? ' ' + saetze[i + 1] : ''); }
  });
  return best;
}

/* ---------- Oberfläche im Steuerfeld ---------- */
const axBox = document.createElement('details');
axBox.className = 'av-d3'; axBox.open = true;
axBox.innerHTML = `<summary>Auskunft</summary>
  <form class="ax-form"><input type="text" maxlength="120" placeholder="Frag etwas über die Roboter hier" aria-label="Frage an die Auskunft"><button type="submit">Fragen</button></form>
  <div class="ax-antwort" aria-live="polite"></div>`;
const axD1 = avBox.querySelector('.av-d1'); axD1.after(axBox);
const axIn = axBox.querySelector('input'), axOut = axBox.querySelector('.ax-antwort');
const AX_BEISPIELE = ['Wie tief ist der Marianengraben?', 'Wer hat das Rennen in der Wüste gewonnen?', 'Was frisst ein Eisbär?'];
function axBeispiele() {
  axOut.innerHTML = '<p class="hint">Ich kenne alles, was auf den Karten steht. Zum Beispiel:</p>';
  for (const b of AX_BEISPIELE) { const k = document.createElement('button'); k.type = 'button'; k.className = 'ax-bsp'; k.textContent = b; k.addEventListener('click', () => { axIn.value = b; axFrage(b); }); axOut.appendChild(k); }
}
function axFrage(frage) {
  const t = axSuche(frage);
  axOut.innerHTML = '';
  if (!t) {
    const p = document.createElement('p'); p.textContent = 'Das weiß ich leider nicht. Ich kenne nur die Roboter, Tiere und Orte hier in der Welt und was auf ihren Karten steht.';
    axOut.appendChild(p); avSag('Das weiß ich nicht.'); return;
  }
  const { r } = t, raum = ROOMS.find(o => o.built === r.room);
  const p = document.createElement('p'), b = document.createElement('strong');
  b.textContent = r.name + ': '; p.append(b, axAntwort(t));
  if (/^\s*wo\b/i.test(frage) && raum) p.append(' Zu finden: ' + raum.name + '.');
  const k1 = document.createElement('button'); k1.type = 'button'; k1.textContent = 'Karte zeigen'; k1.addEventListener('click', () => select(r.id, true));
  const k2 = document.createElement('button'); k2.type = 'button'; k2.textContent = 'Hinfahren';
  k2.addEventListener('click', () => {
    try { AV.befehle = []; AV.plan = avBefehl('gehe zu ' + r.name); AV.folgen = true; avSag('Ich fahre zu ' + r.name + '.'); }
    catch (e) { avSag('Dorthin komme ich nicht. Ich zeige es dir.'); select(r.id, true); }
  });
  const reihe = document.createElement('div'); reihe.className = 'ax-knoepfe'; reihe.append(k1, k2);
  axOut.append(p, reihe);
}
axBox.querySelector('form').addEventListener('submit', e => { e.preventDefault(); const f = axIn.value.trim(); if (f) axFrage(f); });
axBeispiele();
