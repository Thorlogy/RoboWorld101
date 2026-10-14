/* RoboWorld 101 – Geführte Tour: fliegt nacheinander zu den Höhepunkten. Texte in normal und „Einfach erklärt“ (folgt dem Schalter im Panel). */
(() => {
  const STEPS = [
    { all: true, title: 'Willkommen',
      text: 'RoboWorld 101 zeigt echte Roboter in gezeichneten Szenen. Alles bewegt sich, und jede Figur lässt sich anklicken. Jeder Roboter macht dabei dasselbe: Er fühlt mit Sensoren, denkt mit einem Rechner und handelt mit Motoren. Achte bei jeder Station darauf, wo diese drei Teile sitzen. Die Tour zeigt fünfzehn Stellen, an denen besonders viel passiert.',
      kid: 'Hier wohnen ganz viele Roboter, und alle gibt es wirklich. Jeder Roboter fühlt, denkt und handelt. Komm mit, ich zeige dir die besten Stellen!' },
    { id: 'saug', title: 'Kantine',
      text: 'Ein Wok-Roboter kocht, ein Kellnerroboter bringt das Essen. Der Saugroboter kämpft mit einer Socke: Socken und Kabel sind für echte Saugroboter bis heute ein Problem.',
      kid: 'Der Saugroboter hat eine Socke erwischt. Das passiert echten Saugrobotern ständig!' },
    { id: 'liefer', g: 96, title: 'Lager und Aufzug',
      text: 'Der Lieferroboter holt im Lager Waren und fährt allein mit dem Aufzug nach oben. Solche Roboter rufen den Aufzug per Funk, in Hotels und Kliniken gibt es das schon.',
      kid: 'Dieser Roboter fährt ganz allein mit dem Aufzug. Er drückt keinen Knopf, er sagt dem Aufzug per Funk Bescheid.' },
    { id: 'stapler', title: 'Schutzfeld',
      text: 'Der fahrerlose Stapler hat einen Laserscanner und hält an, sobald etwas in sein Schutzfeld kommt. Probier es aus: Geh mit der Maus nah heran. Das klappt auch beim Cobot, beim Kellnerroboter und bei einigen Robotern draußen.',
      kid: 'Halt deine Maus vor den Stapler. Er bleibt stehen, damit er niemanden anfährt!' },
    { id: 'entlader', g: 455, title: 'Paketreise',
      text: 'Am Hafen hebt ein Roboter mit Sauggreifer ein Paket vom Stapel und setzt es in einen kleinen Hausroboter. Der bringt es durchs ganze Haus. Mit „Paket verfolgen“ kann man mitfahren.',
      kid: 'Hier beginnt die Reise eines Pakets. Klick oben auf „Paket verfolgen“, dann fährst du mit!' },
    { id: 'opa', g: 330, title: 'Das Paket kommt an',
      text: 'Im Wohnbereich packt der Bewohner das Paket aus: ein riesiger Karton, darin eine einzelne rote Socke. Zu große Kartons sind beim Versand wirklich ein Dauerthema.',
      kid: 'So ein großer Karton, und drin ist nur eine Socke!' },
    { id: 'schach', title: 'Museum',
      text: 'Der Schachautomat von 1770 sah aus wie ein Roboter. In Wahrheit saß ein Mensch im Kasten und spielte. Daneben stehen echte Meilensteine wie Shakey und Unimate.',
      kid: 'Dieser Schachspieler war gar kein Roboter. Im Kasten hat sich ein Mensch versteckt!' },
    { id: 'marsrover', title: 'Mars-Testgelände',
      text: 'Der Rover macht ein Selfie, so wie Curiosity und Perseverance auf dem Mars. Die Kamera am Arm nimmt viele Bilder auf, die zusammengesetzt werden.',
      kid: 'Auch Roboter machen Selfies. Auf dem Mars machen sie das wirklich!' },
    { id: 'ubahn', g: 70, title: 'U-Bahn ohne Fahrer',
      text: 'Unter der Erde hält eine U-Bahn ohne Fahrer, wie in Nürnberg seit 2008. Vorn drückt sich ein Kind die Nase an der Scheibe platt, und die Schulklasse steigt aus.',
      kid: 'In dieser U-Bahn fährt niemand. Deshalb kann man ganz vorn aus dem Fenster schauen!' },
    { id: 'jaeter', g: 120, title: 'Feld',
      text: 'Ein Feldroboter mit Solardach hackt Unkraut weg, ganz ohne Gift. Er weiß von der Aussaat, wo jede Rübe steht. Eine Krähe fährt mit.',
      kid: 'Dieser Roboter zupft Unkraut, und eine Krähe fährt auf seinem Dach mit.' },
    { id: 'putz', g: 222, title: 'Energiepark',
      text: 'Ein Roboter putzt die Solarmodule ohne Wasser. Kaum ist er fertig, weht die nächste Staubwolke drüber. Unter den Modulen grast ein Schaf.',
      kid: 'Der Roboter putzt und putzt, und dann kommt schon wieder Staub!' },
    { id: 'igel', wetter: 'abend', title: 'Abends im Garten',
      text: 'Abends bleibt der Mähroboter in seiner Station, denn nachts sind Igel unterwegs. Oben bei „Wetter“ lassen sich Sonne, Regen und Abend selbst umschalten.',
      kid: 'Nachts schläft der Mähroboter, damit dem Igel nichts passiert.' },
    { id: 'av1', title: 'Schule 102',
      text: 'Im zweiten Gebäude kommt die Schulklasse an. Im Klassenzimmer sitzt ein kleiner Avatar-Roboter für ein Kind, das lange krank ist. Wenn das Kind die Antwort weiß, blinkt sein Kopf grün.',
      kid: 'Dieser kleine Roboter geht für ein krankes Kind zur Schule. Das Kind sieht und hört von zu Hause aus alles mit.' },
    { id: 'wing', g: 240, title: 'Lieferdrohne',
      text: 'Vom Dach von Werk 101 startet eine Lieferdrohne. Am Feld bleibt sie in der Luft stehen und lässt der Landwirtin ein Paket an einer Leine hinab. Hoch darüber fliegen Flugtaxis ohne Pilot.',
      kid: 'Die Drohne landet nicht, sie lässt das Paket an einer Leine herunter.' },
    { id: 'tbm', g: 200, title: 'Tunnelbau',
      text: 'Unter der Schule bohrt eine Tunnelbohrmaschine die U-Bahn weiter. Ein Greifarm setzt Betonteile zu Ringen zusammen, auf dem Förderband fährt der Aushub zurück. Die Geologin hat gerade etwas gefunden.',
      kid: 'Diese Riesenmaschine bohrt einen Tunnel. Schau mal, was auf dem Förderband liegt!' },
    { id: 'lichtschalter', title: 'Dunkle Fabrik',
      text: 'In der Halle 103 arbeiten die Roboter im Dunkeln, denn Licht brauchen nur Menschen. Ein Klick auf den Schalter neben der Tür macht das Licht an. Achte auf die Anzeige an der Wand.',
      kid: 'Hier ist es dunkel, und die Roboter arbeiten trotzdem. Klick auf den Schalter neben der Tür!' },
    { id: 'aloha', title: 'Lernlabor',
      text: 'Im Keller lernen Roboter: Greifarme üben tausendfach, Vierbeiner trainieren erst im Computer und dann auf dem Laufband, und ein Arm macht nach, was ein Mensch ihm vormacht.',
      kid: 'Roboter müssen üben, genau wie du. Dieser Arm macht nach, was die Frau ihm zeigt.' },
    { id: 'agentenschwarm', title: 'Rechenzentrum',
      text: 'Ganz rechts steht das Rechenzentrum. Auf dem großen Bildschirm verteilt ein Chef-Agent eine Frage an acht Helfer. Mit dem Knopf „Datennetz“ siehst du, wie Daten durch Kabel, Funk und zum Satelliten fließen.',
      kid: 'Hier rechnen ganz viele Computer. Drück oben auf „Datennetz“, dann siehst du die Daten wandern!' },
    { id: 'umlager', title: 'Haus 104',
      text: 'Ganz rechts steht Haus 104. Unten belegt eine Pizzastraße Teig für Teig, ein weicher Greifer packt Erdbeeren. Oben in der Pflege hebt ein Roboter eine Bewohnerin vom Bett in den Rollstuhl.',
      kid: 'Dieser Roboter sieht aus wie ein Bär und hebt Menschen ganz vorsichtig hoch.' },
    { all: true, wetter: 'sonne', title: 'Jetzt du',
      text: 'Das war die Tour. Rechts im Suchspiel warten Aufgaben, und „Einfach erklärt“ macht alle Karten kindgerecht. Viel Spaß beim Entdecken!',
      kid: 'Jetzt bist du dran! Rechts im Suchspiel stehen Aufgaben für dich.' },
  ];
  const tools = document.querySelector('.tools');
  const btn = document.createElement('button'); btn.id = 'tour'; btn.type = 'button'; btn.textContent = 'Tour starten';
  tools.insertBefore(btn, tools.querySelector('#play'));
  const boxEl = document.createElement('section'); boxEl.className = 'tourbox'; boxEl.hidden = true; boxEl.setAttribute('aria-live', 'polite'); boxEl.setAttribute('aria-label', 'Tour');
  boxEl.innerHTML = '<div class="tour-step"></div><h2></h2><p></p><div class="tour-nav"><button type="button" class="tb-prev">Zurück</button><button type="button" class="tb-next">Weiter</button><button type="button" class="tb-end">Beenden</button></div>';
  document.body.appendChild(boxEl);
  const stepEl = boxEl.querySelector('.tour-step'), titleEl = boxEl.querySelector('h2'), textEl = boxEl.querySelector('p');
  const prevB = boxEl.querySelector('.tb-prev'), nextB = boxEl.querySelector('.tb-next');
  let i = -1, wetterVorher = null, zeitVorher = null;

  function show(n) {
    i = Math.max(0, Math.min(STEPS.length - 1, n));
    const s = STEPS[i];
    if (typeof setFollow === 'function') setFollow(false);
    if (s.wetter) { setWetter(s.wetter); if (s.wetter !== 'abend' && WELT.modus !== zeitVorher) setTageszeit(zeitVorher); }
    if (s.g != null) { state.g = s.g; state.f = s.g % 60; acc = s.g / 12; }
    if (s.all) { window.select(null, true); fitAll(true); }
    else {
      window.select(s.id, true);
      const [x, y, w, h] = byId[s.id].box(state.f), S = Math.max(w * 2.2, 620);
      fit(x + w / 2 - S / 2, y + h / 2 - S * 0.46, S, S * 0.72);
    }
    stepEl.textContent = `Station ${i + 1} von ${STEPS.length}`;
    titleEl.textContent = s.title;
    textEl.textContent = (typeof simpleMode !== 'undefined' && simpleMode && s.kid) ? s.kid : s.text;
    prevB.disabled = i === 0;
    nextB.textContent = i === STEPS.length - 1 ? 'Fertig' : 'Weiter';
    state.dirty = true;
  }
  function start() {
    wetterVorher = state.wetter; zeitVorher = WELT.modus; boxEl.hidden = false; btn.setAttribute('aria-pressed', 'true');
    if (window.innerWidth <= 760 && typeof toggleCollapse === 'function') toggleCollapse(true);
    if (!state.playing && typeof setPlaying === 'function') setPlaying(true);
    show(0); nextB.focus();
  }
  function end() {
    boxEl.hidden = true; btn.setAttribute('aria-pressed', 'false'); i = -1;
    if (wetterVorher) setWetter(wetterVorher); if (zeitVorher && WELT.modus !== zeitVorher) setTageszeit(zeitVorher);
    state.dirty = true; btn.focus();
  }
  btn.addEventListener('click', () => (boxEl.hidden ? start() : end()));
  prevB.addEventListener('click', () => show(i - 1));
  nextB.addEventListener('click', () => (i === STEPS.length - 1 ? end() : show(i + 1)));
  boxEl.querySelector('.tb-end').addEventListener('click', end);
  window.addEventListener('keydown', e => {
    if (boxEl.hidden) return;
    if (e.key === 'ArrowRight') show(i + 1); else if (e.key === 'ArrowLeft') show(i - 1); else if (e.key === 'Escape') end();
  });
  // Text neu setzen, wenn „Einfach erklärt“ umgeschaltet wird
  const simple = document.getElementById('simple');
  if (simple) simple.addEventListener('click', () => { if (i >= 0) show(i); });
  if (location.hash === '#tour') setTimeout(start, 400);
})();
