#!/usr/bin/env node
/* Prüft nachrichten.js, bevor eine neue Robo-Nachricht vorgeschlagen wird.
   Aufruf (aus dem Repo-Ordner):  node werk101/tools/news_check.js            nur Inhalt prüfen
                                  node werk101/tools/news_check.js --diff     zusätzlich: gegenüber origin/main darf sich
                                                                              nur nachrichten.js (und deren Zeile in index.html) ändern
   Exit-Code 0 = alles in Ordnung, 1 = Fehler (dann NICHTS vorschlagen). */
const fs = require('fs'), path = require('path'), vm = require('vm'), { execSync } = require('child_process');
const W = path.join(__dirname, '..');
const fehler = [];
const F = m => fehler.push(m);

// Erlaubte Quellen: mindestens EINE Quelle jeder Meldung muss von hier stammen (Domain oder Unterdomain).
const ERLAUBT = [
  // Forschung und Raumfahrt
  'fraunhofer.de', 'dlr.de', 'mpg.de', 'helmholtz.de', 'kit.edu', 'tum.de', 'ethz.ch', 'epfl.ch', 'nasa.gov', 'esa.int', 'jaxa.jp', 'cern.ch', 'ifr.org',
  'mit.edu', 'stanford.edu', 'cmu.edu', 'berkeley.edu', 'harvard.edu', 'washington.edu', 'ox.ac.uk', 'cam.ac.uk', 'nature.com', 'science.org',
  // Fachmedien
  'spectrum.ieee.org', 'ieee.org', 'therobotreport.com', 'heise.de', 'golem.de', 't3n.de', 'newatlas.com', 'newscientist.com', 'techcrunch.com',
  'theverge.com', 'arstechnica.com', 'wired.com', 'spektrum.de',
  // Nachrichten
  'tagesschau.de', 'zdf.de', 'br.de', 'wdr.de', 'ndr.de', 'swr.de', 'deutschlandfunk.de', 'dw.com', 'spiegel.de', 'zeit.de', 'faz.net', 'sueddeutsche.de',
  'reuters.com', 'apnews.com', 'bbc.co.uk', 'bbc.com', 'theguardian.com',
];
// Universitäten allgemein
const ERLAUBT_MUSTER = [/\.edu$/, /\.ac\.uk$/, /(^|\.)uni-[a-z-]+\.de$/, /(^|\.)tu-[a-z-]+\.de$/, /(^|\.)rwth-aachen\.de$/];
const erlaubt = host => ERLAUBT.some(d => host === d || host.endsWith('.' + d)) || ERLAUBT_MUSTER.some(r => r.test(host));

const FIGUREN = ['humanoid', 'drohne', 'huepfer', 'vierbeiner', 'arm', 'rover', 'tauchroboter'];
const HINTERGRUENDE = ['labor', 'meer', 'fabrik', 'feld', 'stadt', 'weltraum', 'eis'];
const BEWEGUNGEN = ['laufen', 'fahren', 'fliegen', 'huepfen', 'greifen', 'schwimmen', 'stehen'];
const STAND = ['Forschung', 'Test', 'Produkt'];
const FELDER = ['datum', 'titel', 'text', 'stand', 'quellen', 'figur', 'hintergrund', 'bewegung', 'werk'];

// nachrichten.js in einer leeren Umgebung auswerten (ohne Zugriff auf irgendetwas)
let N;
try {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(W, 'nachrichten.js'), 'utf8') + '\n;this.__N = NACHRICHTEN;', ctx, { timeout: 1000 });
  N = ctx.__N;
} catch (e) { F('nachrichten.js lässt sich nicht laden: ' + e.message); }

if (N) {
  if (!Array.isArray(N) || !N.length) F('NACHRICHTEN ist keine Liste oder leer');
  const ids = new Set();
  for (const f of fs.readdirSync(path.join(W, 'rooms'))) for (const m of fs.readFileSync(path.join(W, 'rooms', f), 'utf8').matchAll(/id: '([a-z0-9]+)'/g)) ids.add(m[1]);
  for (const f of ['runners.js', 'himmel.js', 'welt.js', 'kreislauf.js']) if (fs.existsSync(path.join(W, f))) for (const m of fs.readFileSync(path.join(W, f), 'utf8').matchAll(/id: '([a-z0-9]+)'/g)) ids.add(m[1]);
  const morgen = new Date(Date.now() + 36 * 3600e3).toISOString().slice(0, 10);
  const titel = new Set();
  N.forEach((n, i) => {
    const wo = `Eintrag ${i + 1} (${n && n.datum})`;
    if (!n || typeof n !== 'object') return F(`${wo}: kein Objekt`);
    for (const k of Object.keys(n)) if (!FELDER.includes(k)) F(`${wo}: unbekanntes Feld „${k}“`);
    for (const k of ['datum', 'titel', 'text', 'stand', 'figur', 'hintergrund', 'bewegung']) if (typeof n[k] !== 'string') F(`${wo}: Feld „${k}“ fehlt oder ist kein Text`);
    if (typeof n.datum === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(n.datum) || isNaN(Date.parse(n.datum))) F(`${wo}: Datum nicht im Format JJJJ-MM-TT`);
      if (n.datum > morgen) F(`${wo}: Datum liegt in der Zukunft`);
      if (i > 0 && N[i - 1].datum < n.datum) F(`${wo}: Reihenfolge – neueste Meldung muss oben stehen`);
    }
    for (const k of ['titel', 'text']) if (typeof n[k] === 'string' && /[<>`]|\$\{|javascript:/i.test(n[k])) F(`${wo}: „${k}“ enthält verbotene Zeichen (< > \` \${ javascript:)`);
    if (typeof n.titel === 'string' && (n.titel.length < 10 || n.titel.length > 90)) F(`${wo}: Titel muss 10–90 Zeichen lang sein (ist ${n.titel.length})`);
    if (typeof n.text === 'string' && (n.text.length < 40 || n.text.length > 420)) F(`${wo}: Text muss 40–420 Zeichen lang sein (ist ${n.text.length})`);
    if (typeof n.titel === 'string') { if (titel.has(n.titel)) F(`${wo}: Titel doppelt`); titel.add(n.titel); }
    if (!STAND.includes(n.stand)) F(`${wo}: stand muss ${STAND.join('/')} sein`);
    if (!FIGUREN.includes(n.figur)) F(`${wo}: unbekannte Figur „${n.figur}“`);
    if (!HINTERGRUENDE.includes(n.hintergrund)) F(`${wo}: unbekannter Hintergrund „${n.hintergrund}“`);
    if (!BEWEGUNGEN.includes(n.bewegung)) F(`${wo}: unbekannte Bewegung „${n.bewegung}“`);
    if (n.werk !== undefined && !ids.has(n.werk)) F(`${wo}: werk „${n.werk}“ ist keine Figur in RoboWorld`);
    if (!Array.isArray(n.quellen) || n.quellen.length < 2) F(`${wo}: mindestens zwei Quellen nötig`);
    else {
      const hosts = [];
      for (const q of n.quellen) {
        let u; try { u = new URL(q); } catch (e) { F(`${wo}: Quelle ist keine gültige Adresse: ${q}`); continue; }
        if (u.protocol !== 'https:' || /[\s"'<>]/.test(q)) F(`${wo}: Quelle muss mit https:// beginnen und darf keine Leer- oder Sonderzeichen enthalten: ${q}`);
        hosts.push(u.hostname.replace(/^www\./, ''));
      }
      if (new Set(hosts).size < 2) F(`${wo}: die zwei Quellen müssen von verschiedenen Seiten kommen`);
      if (!hosts.some(erlaubt)) F(`${wo}: keine Quelle von der Liste erlaubter Quellen (${hosts.join(', ')})`);
    }
  });
}

if (process.argv.includes('--diff')) {
  try {
    const repo = path.join(W, '..');
    const dateien = execSync('git diff --name-only origin/main', { cwd: repo, encoding: 'utf8' }).split('\n').filter(Boolean)
      .concat(execSync('git ls-files --others --exclude-standard', { cwd: repo, encoding: 'utf8' }).split('\n').filter(Boolean));
    for (const d of dateien) if (d !== 'werk101/nachrichten.js' && d !== 'werk101/index.html') F(`Geänderte Datei nicht erlaubt: ${d}`);
    if (dateien.includes('werk101/index.html')) {
      const diff = execSync('git diff -U0 origin/main -- werk101/index.html', { cwd: repo, encoding: 'utf8' }).split('\n')
        .filter(l => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l));
      for (const l of diff) if (!/^[+-]<script src="nachrichten\.js\?v=n\d{8}"><\/script>$/.test(l)) F(`index.html: nur die Zeile von nachrichten.js darf sich ändern, gefunden: ${l}`);
    }
  } catch (e) { F('git-Vergleich mit origin/main fehlgeschlagen: ' + e.message); }
}

if (fehler.length) { console.log('NICHT IN ORDNUNG:\n- ' + fehler.join('\n- ')); process.exit(1); }
console.log(`In Ordnung: ${N.length} Meldungen geprüft.`);
