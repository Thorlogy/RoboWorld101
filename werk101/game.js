/* Werk 101 – Suchspiel. Nur Klicks im Bild zählen, nicht in der Liste. Fortschritt bleibt im Browser. */
(() => {
  const TASKS = [
    { text: 'Finde drei Roboter, die fliegen', ids: ['paket', 'scout', 'schwarm', 'loesch', 'fassade', 'heli', 'wing', 'stationsdrohne', 'flugtaxi', 'flugtaxi2', 'thermo', 'rakete'], need: 3 },
    { text: 'Finde zwei Roboter, die unter Wasser arbeiten', ids: ['rov', 'aal', 'robofisch', 'rumpf'], need: 2 },
    { text: 'Finde drei Roboter, die älter als 50 Jahre sind', ids: ['schach', 'unimate', 'shakey', 'schildkroete', 'blech'], need: 3 },
    { text: 'Finde vier Tiere', ids: ['katze', 'moewe', 'hafenmoewe', 'kanarie', 'ratte', 'hummel', 'kuh', 'fisch', 'kraehe', 'schaf', 'igel', 'motte', 'taube', 'ammonit'], need: 4 },
    { text: 'Finde zwei Fahrzeuge, die Menschen ohne Fahrer befördern', ids: ['shuttle', 'robotaxi', 'taxi2', 'ubahn', 'flugtaxi', 'flugtaxi2'], need: 2 },
    { text: 'Finde die Schulklasse', ids: ['klasse'], need: 1 },
    { text: 'Finde drei Roboter in der Schule 102', ids: ['schrubber', 'robocup', 'av1', 'calliope', 'beebot', 'schuldrucker', 'codeon', 'nao', 'bausteinbot', 'fischertechnik', 'pepper'], need: 3 },
    { text: 'Finde drei Roboter, die draußen für Essen oder Strom arbeiten', ids: ['jaeter', 'putz', 'blatt', 'ernte', 'schieber', 'gartenbot', 'maximo'], need: 3 },
    { text: 'Mach in der dunklen Fabrik das Licht an', ids: ['lichtschalter'], need: 1 },
    { text: 'Stell den Abend ein und finde die Raumstation und die Satellitenkette', ids: ['issflug', 'satkette'], need: 2 },
    { text: 'Finde die riesige Tunnelbohrmaschine und den Ammoniten', ids: ['tbm', 'ammonit'], need: 2 },
    { text: 'Geheim: Finde zwei Roboter, die Spiele spielen', ids: ['zauberwuerfel', 'jenga', 'curly'], need: 2 },
    { text: 'Geheim: Finde drei Programme, die gegen Menschen spielen oder mit ihnen reden', ids: ['eliza', 'deepblue', 'alphago', 'breakout'], need: 3 },
    { text: 'Finde den Roboter, der ein Selfie macht', ids: ['marsrover'], need: 1 },
    { text: 'Finde beide Stellen mit der roten Socke', ids: ['saug', 'sortierer'], need: 2 },
    { text: 'Finde drei Roboter, die Pakete oder Waren bringen', ids: ['liefer', 'gehweg', 'paket', 'regal', 'sortier', 'transporter', 'automat', 'pflege', 'paketbote', 'entlader'], need: 3 },
    { text: 'Folge dem Paket: Finde den Roboter, der es vom Stapel hebt, den, der es bringt, und wer es bekommt', ids: ['entlader', 'paketbote', 'opa'], need: 3 },
    { text: 'Finde drei Sensoren, mit denen Roboter ihre Umgebung messen', ids: ['lidar', 'ultraschall', 'sensorkamera', 'infrarot', 'radar'], need: 3 },
    { text: 'Finde drei Arten, wie Roboter lernen', ids: ['greiffarm', 'laufsim', 'vierbeiner', 'aloha'], need: 3 },
    { text: 'Finde im Rechenzentrum den Agenten-Schwarm und den Bandroboter', ids: ['agentenschwarm', 'bandroboter'], need: 2 },
    { text: 'Finde die drei Robotergesetze, die sich ein Schriftsteller ausgedacht hat', ids: ['asimov'], need: 1 },
    { text: 'Finde in der Montage den SCARA, den Humanoiden und den Hexapod', ids: ['scara', 'humanoidfabrik', 'hexapod'], need: 3 },
    { text: 'Finde zwei Schwärme: einen aus Software und einen aus echten Robotern', ids: ['agentenschwarm', 'kilobots'], need: 2 },
    { text: 'Finde zwei Roboter auf dem Bauernhof, die ohne Mensch arbeiten', ids: ['melk', 'traktor', 'jaeter', 'schieber'], need: 2 },
    { text: 'Finde in Haus 104 drei Helfer für Menschen', ids: ['umlager', 'exoarbeit', 'prothese', 'pizza', 'softgreifer'], need: 3 },
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

  // Aufgaben zu geheimen Räumen erst zeigen, wenn die Räume freigeschaltet sind
  const shown = () => TASKS.filter(t => !t.text.startsWith('Geheim') || state.secret);
  function render() {
    list.innerHTML = '';
    let done = 0;
    shown().forEach(t => {
      const n = Math.min(t.need, t.ids.filter(id => found.has(id)).length), ok = n >= t.need;
      if (ok) done++;
      const li = document.createElement('li'); li.className = ok ? 'ok' : '';
      li.innerHTML = `<span></span><b>${n}/${t.need}</b>`; li.firstChild.textContent = t.text;
      list.appendChild(li);
    });
    score.textContent = `${done} von ${shown().length}`;
    return done;
  }
  function flash(msg) { toast.textContent = msg; toast.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('on'), 2200); }

  const original = window.select;
  window.select = function (id, fly) {
    original(id, fly);
    if (!id || fly) return;
    const before = render();
    const relevant = shown().filter(t => t.ids.includes(id));
    if (!relevant.length || found.has(id)) return;
    found.add(id); save();
    const after = render();
    const name = (byId[id] && byId[id].name) || id;
    if (after === shown().length) flash('Alle Aufgaben geschafft! Du kennst das Haus jetzt besser als der Hausmeister.');
    else if (after > before) flash(`Aufgabe geschafft: ${name} gefunden.`);
    else flash(`Gefunden: ${name}`);
  };
  box.querySelector('.reset').addEventListener('click', () => { found = new Set(); save(); render(); });
  render();
  for (const fn of ['unlockSecret', 'lockSecret']) { const orig = window[fn]; if (orig) window[fn] = (...a) => { orig(...a); render(); }; }
})();
