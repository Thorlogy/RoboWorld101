/* ---------- Störung am Förderband: freiwillige Aufgabe für R-101 ----------
   Nur solange jemand R-101 steuert (oder mit ?stoerung zum Testen): Eine Tragrolle
   am Band in der Fertigungshalle klemmt, die Linie steht. R-101 kann die Ersatzrolle
   aus dem Lager bringen. Tut niemand etwas, tauscht die Instandhaltung sie nach
   ST_DAUER Sekunden selbst. Wer nur zuschaut, sieht nie eine stehende Halle. */
const ST_PAUSE = 150, ST_DAUER = 120, ST_ERSTE = 45; // Sekunden
const ST_TEST = /[?&]stoerung/.test(location.search);
WELT.stoerung = null; WELT.stoerungFix = null;
let stNaechste = null;

function stStart() {
  const jetzt = performance.now();
  WELT.stoerung = { bis: jetzt + ST_DAUER * 1000 };
  WELT.halt.fertigung = { bis: WELT.stoerung.bis, f: state.f, grund: 'STÖRUNG · TRAGROLLE KLEMMT · BAND STEHT' };
  const a = AUFTRAEGE.find(x => x.id === 'rolle'), o = roomOf(a.von);
  if (AV.traegt !== 'rolle') avDinge.rolle = { r: o.r, x: rx(o.c) + a.spot, ok: false };
  const f = roomOf('fertigung');
  ticker('Störung in der Fertigungshalle: Eine Tragrolle am Förderband klemmt. R-101 kann die Ersatzrolle aus dem Lager holen.', rx(f.c) + RW / 2, ry(f.r) + RH / 2);
  avPanel();
}
function stEnde(durchR101) {
  WELT.stoerung = null; WELT.stoerungFix = durchR101 ? 'r101' : 'team';
  if (WELT.halt.fertigung) WELT.halt.fertigung.bis = 0;
  WELT.zuletzt['stoerung:ende'] = performance.now();
  if (!durchR101 && AV.traegt === 'rolle') { AV.traegt = null; if (AV.an) avSag('Schon repariert. Die Rolle kommt zurück ins Lager.'); }
  stNaechste = performance.now() + ST_PAUSE * 1000;
  avPanel(); state.dirty = true;
}
WELT.on('geliefert', id => { if (id === 'rolle' && WELT.stoerung) stEnde(true); });
setInterval(() => {
  const jetzt = performance.now();
  if (!AV.an && !ST_TEST) { if (WELT.stoerung) stEnde(false); stNaechste = null; return; }
  if (WELT.stoerung) { if (jetzt > WELT.stoerung.bis) stEnde(false); return; }
  if (stNaechste == null) stNaechste = jetzt + (ST_TEST ? 1 : ST_ERSTE) * 1000;
  if (jetzt > stNaechste) stStart();
}, 500);

// Anzeigen in Fertigungshalle und Lager (lokale Raumkoordinaten), aufgerufen aus reaktionen()
function stoerungZeigen(key) {
  if (key === 'fertigung') {
    if (WELT.stoerung) {
      // klemmende Rolle blinkt rot, Warnleuchte am Bandende
      const an = state.g % 10 < 5;
      ctx.save(); ctx.lineWidth = 3; ctx.strokeStyle = an ? '#d9342b' : 'rgba(217,52,43,0.35)';
      ctx.beginPath(); ctx.arc(184, 309, 11, 0, TAU); ctx.stroke(); ctx.restore();
      text('!', 184, 290, 18, { family: '"Saira Condensed", sans-serif', weight: 700, align: 'center', color: '#d9342b' });
      box(4, 262, 12, 8, '#3b3d40', 0, 1.2); circle(10, 256, 6, an ? '#f0b429' : '#7a5a14', INK, 1.5); line(10, 270, 10, 300, INK, 2);
      schild('ERSATZROLLE LIEGT IM LAGER', RW / 2, 92, '#23384d');
    } else if (WELT.seit('stoerung:ende') < 7) {
      schild(WELT.stoerungFix === 'r101' ? 'R-101 HAT DIE ROLLE GEBRACHT · BAND LÄUFT ✓' : 'INSTANDHALTUNG HAT DIE ROLLE GETAUSCHT · BAND LÄUFT', RW / 2, 64, '#2e7d32');
    }
  }
  if (key === 'lager' && WELT.stoerung && AV.traegt !== 'rolle') schild('ERSATZROLLE FÜR DIE FERTIGUNG', RW / 2, 64, '#23384d');
}
