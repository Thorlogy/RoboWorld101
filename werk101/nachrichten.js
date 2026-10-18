/* Robo-Nachrichten für das Studio im Sendeturm (rooms/sendeturm.js).
   Neue Meldung = neuer Eintrag OBEN in der Liste. Das Studio zeigt die neueste Meldung, deren Datum nicht in der Zukunft liegt.
   Regeln: nur Robotik, kindgerecht, mindestens zwei Quellen von verschiedenen Seiten, davon mindestens eine von der
   Liste erlaubter Quellen in tools/news_check.js; Forschung/Test/Produkt klar angeben. Ablauf: NACHRICHTEN-AUFGABE.md.
   Vor jedem Vorschlag: node werk101/tools/news_check.js --diff (muss „In Ordnung“ melden).
   Nicht aufnehmen: Militär und Waffen, Unfälle mit Verletzten, Panikthemen (Jobverlust, „Roboter übernehmen“), Sexualität, sonst heikle Themen.
   Felder:
     datum      'JJJJ-MM-TT' (Sendetag)
     titel      kurze Überschrift (Laufband)
     text       2–3 kurze Sätze in Kindersprache
     stand      'Forschung' | 'Test' | 'Produkt'
     quellen    mindestens zwei Links
     figur      humanoid | drohne | huepfer | vierbeiner | arm | rover | tauchroboter
     hintergrund labor | meer | fabrik | feld | stadt | weltraum | eis
     bewegung   laufen | fliegen | huepfen | greifen | schwimmen | stehen
     werk       (optional) ID einer Figur in RoboWorld, die dazu passt */
const NACHRICHTEN = [
  {
    datum: '2026-10-18',
    titel: 'Roboter fällt wie ein Ahornsamen und segelt los',
    text: 'In Singapur haben Forschende einen Roboter gebaut, der aus einem Flugzeug ins Wasser fallen darf. Beim Fallen dreht er sich wie ein Ahornsamen und landet darum sanft. Dann richtet er sich auf, und seine Flügel werden zu Segeln, mit denen der Wind ihn übers Wasser schiebt.',
    stand: 'Forschung',
    quellen: ['https://newatlas.com/robotics/albatross-robot-sail-seed-boat', 'https://www.eurekalert.org/news-releases/1146168'],
    figur: 'drohne', hintergrund: 'meer', bewegung: 'fliegen',
  },
  {
    datum: '2026-10-17',
    titel: 'Mars-Rover Perseverance fährt Rekord',
    text: 'Der Roboter-Rover Perseverance ist jetzt mehr als 45 Kilometer über den Mars gefahren. So weit ist noch nie ein Fahrzeug auf einem anderen Himmelskörper gekommen. Den alten Rekord hielt sein Vorgänger Opportunity, der dafür viel länger gebraucht hat.',
    stand: 'Forschung',
    quellen: ['https://science.nasa.gov/blogs/perseverance-mars-rover/2026/10/12/nasas-perseverance-sets-off-world-record-for-total-distance-driven/', 'https://www.space.com/space-exploration/mars-rovers/nasas-perseverance-mars-rover-breaks-interplanetary-driving-record-and-its-far-from-done'],
    figur: 'rover', hintergrund: 'weltraum', bewegung: 'fahren', werk: 'marsrover',
  },
  {
    datum: '2026-10-16',
    titel: 'Zum ersten Mal gezählt: rund 7.000 Humanoide verkauft',
    text: 'Fachleute zählen jedes Jahr, wie viele Roboter weltweit verkauft werden. Jetzt haben sie zum ersten Mal auch menschenähnliche Roboter mitgezählt: rund 7.000 Stück im letzten Jahr. Die meisten arbeiten noch im Probebetrieb, oft mit einem Menschen daneben.',
    stand: 'Produkt',
    quellen: ['https://www.ipa.fraunhofer.de/de/presse/presseinformationen/world-robotics-service-robots-2026-neue-roboter-fuer-arbeitswelt-und-baustelle.html', 'https://www.malaymail.com/news/money/mediaoutreach/2026/09/30/global-sales-of-professional-service-robots-surge-24/491164'],
    figur: 'humanoid', hintergrund: 'fabrik', bewegung: 'laufen', werk: 'humanoidfabrik',
  },
  {
    datum: '2026-10-14',
    titel: 'Hüpfroboter wiegt nur ein Gramm',
    text: 'An einer Universität in den USA hüpft ein Roboter, der so leicht ist wie eine Büroklammer. Er kann genau einstellen, wie hoch er springt, und schafft eine ganze Treppenstufe. Fällt er um, rollt er sich wie eine Schildkröte wieder auf die Füße.',
    stand: 'Forschung',
    quellen: ['https://www.washington.edu/news/2026/09/23/directhop-hopping-robot/', 'https://newatlas.com/robotics/flea-inspired-directhop-hopping-robot/'],
    figur: 'huepfer', hintergrund: 'labor', bewegung: 'huepfen',
  },
];
