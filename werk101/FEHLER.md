# Fehlerbuch RoboWorld 101

Hier steht jeder gemeldete Fehler mit Ursache, Behebung und der **Regel**, die ihn in Zukunft verhindert.
Vor jeder neuen Szene die Regeln unten lesen. Neue Fehler unten anhängen (nächste Nummer, Datum, Melder).

## Regeln (Kurzfassung)

1. **Gelenke in Blickrichtung.** Knie knicken nach vorn, der Fuß bleibt hinter oder unter dem Knie, die Fußspitze zeigt in Blickrichtung. Kopf, Arme und Beine schauen in dieselbe Richtung. Laufbänder bewegen sich unter den Füßen *entgegen* der Blickrichtung. (F01)
2. **Ein Schutzfeld hält alles an, was dazugehört.** Hat ein Roboter ein Schutzfeld (`SAFETY`), läuft er mit eigener Uhr (`heldF`). Alles, was er trägt, übergibt oder womit er zusammenarbeitet, nutzt *dieselbe* Uhr, auch seine Klickfläche (`box`). Nach dem Loslassen holt der Roboter mit doppeltem Tempo auf (`advanceHolds`). (F02)
3. **Was man sieht, muss möglich sein.** Ein Raum mit Decke zeigt keinen offenen Himmel, und Flieger kommen nicht durch Wände. Gibt es Himmel, dann ist das Dach offen (`offenesDach` in `ROOMS`). Der Himmel ist dann der echte Himmel mit Tageszeit, Wetter und Wolken, kein eigener Verlauf. (F03)
4. **Nichts wird an einer Feldgrenze halbiert.** Jedes Feld schneidet an seinem Rand ab. Was über den Rand fährt, fliegt oder läuft, braucht dort etwas, hinter dem es verschwinden kann: Tunnel, Haus, Tor, Startbox, Berg. Sonst bleibt es im Feld. Gilt auch für das Auftauchen am Anfang der Schleife. `tools/check.py` meldet solche Stellen als „Hinweis Feldrand“. Ist der Rand verdeckt, die Karte mit `rand: '<Grund>'` markieren. (F04, F07)
5. **Schilder und Anzeigen nicht verdecken.** Nach dem Zeichnen prüfen, ob etwas, das später gezeichnet wird (Haus, Fahrzeug, Mast), über einem Text liegt. Texte vollständig im Bild und frei lesbar platzieren. (F05)
6. **Zeichenreihenfolge = Tiefe.** Was im Bild hinten steht (Stelzen, Masten, Berge), wird *vor* den Robotern gezeichnet, auch wenn es aus einer anderen Datei kommt. Läufer (`registerRunner`) zeichnen in Ladereihenfolge der Skripte. Hintergrund nie in einer später geladenen Datei über fremde Szenen malen. (F06)
7. **Am Schleifenende nichts aus dem Nichts.** Fahrzeuge, die eine Runde lang unterwegs sind, beginnen und enden verdeckt (Startbox, Tunnel) oder blenden weich ein und aus. (F07)

## Prüfen vor dem Vorschlag
- `python3 tools/check.py <räume>`: keine JS-Fehler, Naht ok, **keine neuen Hinweise „Feldrand“**.
- Bilder des Kontaktblatts ansehen: Gelenke, Blickrichtung, verdeckte Schilder.
- Bei Schutzfeld-Robotern: einmal antippen, loslassen, prüfen, ob alles im Takt bleibt.
- Auch auf dem Handy denken: Antippen löst das Schutzfeld aus.

---

## F01 · Krankenstation: Knie auf der Rückseite (26.10.2026, Nutzer)
- **Gesehen:** Die Person im Exoskelett auf dem Laufband hat die Knie auf der Körperrückseite, der Kopf wirkt verdreht.
- **Ursache:** Die Person schaut nach links. Der Unterschenkel war aber nach vorn abgewinkelt (`b = a - …`), die Schuhe zeigten nach rechts, und das Laufband lief in die falsche Richtung.
- **Behoben:** Unterschenkel knickt nach hinten (`b = a + …`), Schuhe zeigen nach links, Laufband läuft nach rechts unter den Füßen weg (`rooms/kranken.js`).
- **Regel:** 1.

## F02 · Kantine: Schale fliegt ohne Roboter weiter (26.10.2026, Nutzer)
- **Gesehen:** Nach dem Antippen des Kellnerroboters schweben Teile (die Schale) unabhängig vom Roboter durch die Luft.
- **Ursache:** Antippen löst das Schutzfeld aus, der Kellner bleibt stehen (eigene Uhr). Schale, Küchenarm und Gast liefen mit der Hausuhr weiter. Nach dem Loslassen blieb der Kellner für immer versetzt, und die Klickfläche nutzte die falsche Uhr.
- **Behoben:** Die ganze Küchenszene läuft mit der Uhr des Kellners (`drawKantine`), die Klickfläche ebenso. Allgemein holen gehaltene Roboter nach dem Loslassen mit doppeltem Tempo auf, bis sie wieder im Takt sind (`advanceHolds` in `engine.js`).
- **Regel:** 2.

## F03 · Drohnen-Landeplatz: Decke, aber offener Himmel (26.10.2026, Nutzer)
- **Gesehen:** Über dem Drohnen-Landeplatz liegt die Dachplatte, trotzdem sieht man Himmel und Stadt, und Drohnen fliegen durch die Decke.
- **Behoben:** Der Raum hat jetzt ein offenes Dach (`offenesDach: true` in `kit.js`). Das Haus spart ihn aus (`drawBuilding`), der echte Himmel mit Wolken, Sternen, Regen und Schnee scheint durch. Drohnen und Möwe kommen und gehen nach oben statt durch die Wände. Der Schriftzug WERK 101 steht jetzt über der Satelliten-Werkstatt, das Drohnennest über dem Mars-Testgelände.
- **Regel:** 3.

## F04 · Park und Straße: Fahrzeuge halbiert (26.10.2026, Nutzer)
- **Gesehen:** Bus und Robotaxi werden an der Grenze zwischen Park und Straße senkrecht abgeschnitten.
- **Ursache:** Jedes Außenfeld schneidet an seinem Rand ab. Der Bus fuhr von links in den Park und rechts hinaus, das Taxi kam von links in die Straße.
- **Behoben:** Der Bus steht die ganze Runde an der Haltestelle, nur die Türen bewegen sich. Die Straße hat links einen Tunnel: Taxi, Fußgänger und Lieferroboter tauchen daraus auf oder fahren hinein, rechts verschwinden sie hinter dem Haus. Auf dem Mond (am selben Tag gefunden) fährt das Mondauto jetzt über die ganze Oberfläche und verschwindet hinter den Bergen, der Frachter an der Gateway startet ganz im Bild.
- **Regel:** 4. Neu: Hinweis „Feldrand“ in `tools/check.py`.

## F05 · Wasserkraftwerk: „FISCHE HE…“ (26.10.2026, Nutzer)
- **Gesehen:** Die Anzeige des Fischzählers ist halb verdeckt („Fische Heute“).
- **Ursache:** Die Anzeige stand rechts vom Zähler, das Krafthaus wird danach gezeichnet und lag darüber.
- **Behoben:** Die Anzeige steht jetzt über dem Zähler, links vom Krafthaus (`rooms/stausee.js`), die Klickfläche ist angepasst.
- **Regel:** 5.

## F06 · Stausee: Holzernter vom Pfeiler verdeckt (26.10.2026, Nutzer)
- **Gesehen:** Das Tauchfahrzeug beim Baumfällen verschwindet hinter einem Pfeiler der Magnetbahn.
- **Ursache:** Die Stelzen im See wurden in `gebirge.js` gezeichnet. Das lädt nach `stausee.js`, also lagen die Stelzen vor allem im See.
- **Behoben:** `stausee.js` zeichnet die Stelzen selbst, nach dem Wasser und vor Bäumen und Tauchfahrzeug.
- **Regel:** 6.

## F07 · Wüste: Fahrzeug erscheint aus dem Nichts (26.10.2026, Nutzer)
- **Gesehen:** Ein Rennwagen taucht an einer senkrechten Kante mitten im Bild auf.
- **Ursache:** Die Fahrzeuge warteten rechts außerhalb der Wüste und fuhren über die Schnittkante ins Bild.
- **Behoben:** Rechts steht jetzt eine Startbox (Zelt), aus der die Fahrzeuge nacheinander herausfahren. Am Ende jeder Runde blenden alle Fahrzeuge weich aus und am Anfang weich ein (`rooms/wueste.js`).
- **Regel:** 4 und 7.

---

## Offen: Hinweise „Feldrand“ an älteren Szenen (Stand 26.10.2026)
Der neue Hinweis in `check.py` findet noch diese Stellen. Viele davon sind vermutlich gewollt, etwa Schiffe, die über mehrere Meeresfelder reichen, oder Roboter, die durch eine Tür in den Nachbarraum fahren. Jede einzeln ansehen und dann beheben oder mit `rand: '<Grund>'` markieren:
kranken:pflege · bergwerk:krabbler · garage:park · eingang:besuch · stall:schieber · hafen:transporter · flughafen:gepaeckschlepper · cern:tim · chip1:ohtwagen · chip2:ohtwagen2 · shliege:containerschiff · shkai:festmacher · shkai:containerbruecke · see2:fluegelfrachter · see3:oceancleanup · see5:algenauv · graben1:okeanos · mine1:fahrlader · kanal1:kanaldeckel

Bekannt und harmlos: Über dem ganzen Haus liegt abends und nachts zwischen Dachkante und 140 Einheiten darüber ein etwas anderer Himmelston (Bereich `HOUSES` in `engine.js` ist vom Abenddunkel ausgenommen).
