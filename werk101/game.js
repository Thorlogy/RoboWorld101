/* Werk 101 – Suchspiel. Nur Klicks im Bild zählen, nicht in der Liste. Fortschritt bleibt im Browser. */
(() => {
  const TASKS = [
    { text: 'Finde drei Roboter, die fliegen', ids: ['paket', 'scout', 'schwarm', 'loesch', 'fassade', 'heli'], need: 3 },
    { text: 'Finde zwei Roboter, die unter Wasser arbeiten', ids: ['rov', 'aal', 'robofisch', 'rumpf'], need: 2 },
    { text: 'Finde drei Roboter, die älter als 50 Jahre sind', ids: ['schach', 'unimate', 'shakey', 'schildkroete', 'blech'], need: 3 },
    { text: 'Finde vier Tiere im Haus', ids: ['katze', 'moewe', 'hafenmoewe', 'kanarie', 'ratte', 'hummel', 'kuh', 'fisch'], need: 4 },
    { text: 'Finde den Roboter, der ein Selfie macht', ids: ['rover'], need: 1 },
    { text: 'Finde beide Stellen mit der roten Socke', ids: ['saug', 'sortierer'], need: 2 },
    { text: 'Finde drei Roboter, die Pakete oder Waren bringen', ids: ['liefer', 'gehweg', 'paket', 'regal', 'sortier', 'transporter', 'automat', 'pflege', 'paketbote', 'entlader'], need: 3 },
    { text: 'Folge dem Paket: Finde den Roboter, der es vom Stapel hebt, den, der es bringt, und wer es bekommt', ids: ['entlader', 'paketbote', 'opa'], need: 3 },
    { text: 'Finde den Menschen im Roboterkostüm', ids: ['kostuem'], need: 1 },
  ];
  let found = new Set();
  try { found = new Set(JSON.parse(localStorage.getItem('werk101-found') || '[]')); } catch (e) {}
  const save = () => { try { localStorage.setItem('werk101-found', JSON.stringify([...found])); } catch (e) {} };

  const host = document.querySelector('.panel-body');
  const box = document.createElement('details');
  box.className = 'game';
  box.innerHTML = '<summary>Suchspiel <span class="score"></span></summary><ol class="tasks"></ol><p class="hint">Klicke im Bild auf die Figuren. Ein Klick in der Liste unten zählt nicht.</p><button type="button" class="reset">Neu anfangen</button>';
  host.insertBefore(box, host.children[1]);
  const list = box.querySelector('.tasks'), score = box.querySelector('.score');
  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
  let toastTimer = null;

  function render() {
    list.innerHTML = '';
    let done = 0;
    TASKS.forEach(t => {
      const n = Math.min(t.need, t.ids.filter(id => found.has(id)).length), ok = n >= t.need;
      if (ok) done++;
      const li = document.createElement('li'); li.className = ok ? 'ok' : '';
      li.innerHTML = `<span></span><b>${n}/${t.need}</b>`; li.firstChild.textContent = t.text;
      list.appendChild(li);
    });
    score.textContent = `${done} von ${TASKS.length}`;
    return done;
  }
  function flash(msg) { toast.textContent = msg; toast.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('on'), 2200); }

  const original = window.select;
  window.select = function (id, fly) {
    original(id, fly);
    if (!id || fly) return;
    const before = render();
    const relevant = TASKS.filter(t => t.ids.includes(id));
    if (!relevant.length || found.has(id)) return;
    found.add(id); save();
    const after = render();
    const name = (byId[id] && byId[id].name) || id;
    if (after === TASKS.length) flash('Alle Aufgaben geschafft! Du kennst das Haus jetzt besser als der Hausmeister.');
    else if (after > before) flash(`Aufgabe geschafft: ${name} gefunden.`);
    else flash(`Gefunden: ${name}`);
  };
  box.querySelector('.reset').addEventListener('click', () => { found = new Set(); save(); render(); });
  render();
})();
