"""Prüflauf für Werk 101.
Aufruf: python3 tools/check.py [raum ...]   (ohne Angabe: alle fertigen Räume)
- meldet JavaScript-Fehler
- Kontaktblatt pro Raum mit Bild 1, 15, 30, 45, 60 (check_<raum>.png)
- Schleifennaht: Sprung 60 -> 1 darf nicht deutlich größer sein als die übrigen Bildwechsel
- Schrift: Text, der im Raum beginnt und über den Rand hinausragt (Testschrift ist breiter als die echte, also Hinweis)
- Klickflächen: Bereiche, in denen beim Ausblenden des Roboters nichts verschwindet
- Karten: Roboter ohne Zeile „In echt“ (echt) – Menschen und Tiere ausgenommen
"""
import asyncio, os, sys, io, statistics
from playwright.async_api import async_playwright
from PIL import Image, ImageChops, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('CHECK_OUT', ROOT)
TEXT_HOOK = '''() => { window.__texts = []; const P = CanvasRenderingContext2D.prototype, of = P.fillText;
  P.fillText = function (t, x, y) { const m = this.measureText(t), tr = this.getTransform();
    const x0 = x - (this.textAlign === 'center' ? m.width / 2 : this.textAlign === 'right' ? m.width : 0);
    const a = [x0, y - m.actualBoundingBoxAscent], b = [x0 + m.width, y + m.actualBoundingBoxDescent];
    const px = p => [tr.a * p[0] + tr.c * p[1] + tr.e, tr.b * p[0] + tr.d * p[1] + tr.f];
    const A = px(a), B = px(b); window.__texts.push({ t, x0: Math.min(A[0], B[0]), y0: Math.min(A[1], B[1]), x1: Math.max(A[0], B[0]), y1: Math.max(A[1], B[1]) });
    return of.call(this, t, x, y); };
  window.__orig = withAlpha;
  window.withAlpha = (id, fn) => { if (id === window.__hide) return; window.__orig(id, fn); }; }'''

def diff(a, b):
    return ImageStat.Stat(ImageChops.difference(a.convert('L'), b.convert('L'))).mean[0]

async def main(rooms):
    async with async_playwright() as p:
        br = await p.chromium.launch()
        pg = await br.new_page(viewport={'width': 1400, 'height': 860})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + os.path.join(ROOT, 'index.html') + '?phase=mittag&stunde=10')
        await pg.wait_for_timeout(600)
        await pg.evaluate(TEXT_HOOK)
        keys = rooms or await pg.evaluate('BUILT.map(d => d.key)')
        ok = True
        for key in keys:
            rect = await pg.evaluate('''k => { state.playing = false; fitRoom(k, false); state.sel = null; state.filter = 'Alle';
                const o = roomOf(k); return { x: rx(o.c) * state.z + state.ox, y: ry(o.r) * state.z + state.oy, w: RW * state.z, h: RH * state.z }; }''', key)
            clip = {'x': round(rect['x']), 'y': round(rect['y']), 'width': round(rect['w']), 'height': round(rect['h'])}
            frames, texts = {}, {}
            for f in range(60):
                await pg.evaluate('f => { window.__hide = null; window.__texts = []; state.f = f; draw(); }', f)
                frames[f] = Image.open(io.BytesIO(await pg.screenshot(clip=clip)))
                for t in await pg.evaluate('window.__texts'):
                    inside = rect['x'] <= t['x0'] <= rect['x'] + rect['w'] and rect['y'] <= t['y0'] <= rect['y'] + rect['h']
                    if inside and (t['x1'] > rect['x'] + rect['w'] + 2 or t['y1'] > rect['y'] + rect['h'] + 2):
                        texts[t['t']] = f
            steps = [diff(frames[f], frames[f + 1]) for f in range(59)]
            seam, med = diff(frames[59], frames[0]), statistics.median(steps)
            flag = seam > max(2.5 * med, max(steps))
            ok &= not flag
            print(f'{key}: Naht 60->1 = {seam:.2f} (Median {med:.2f}, Max {max(steps):.2f}) ' + ('AUFFÄLLIG' if flag else 'ok'))
            for t, f in texts.items():
                print(f'  Hinweis Schrift ragt über den Rand: "{t}" (Bild {f + 1})')
            # Klickflächen und Karten
            robots = await pg.evaluate('k => ROBOTS.filter(r => r.room === k).map(r => ({ id: r.id, echt: !!r.echt, b: r.bereich }))', key)
            for r in robots:
                if not r['echt'] and r['b'] not in ('Mensch', 'Tier'):
                    print(f'  Karte ohne „In echt“: {r["id"]}')
                worst = None
                for f in (5, 25, 45):
                    bx = await pg.evaluate('''([id, f]) => { const [x, y, w, h] = byId[id].box(f);
                        return { x: x * state.z + state.ox, y: y * state.z + state.oy, w: w * state.z, h: h * state.z }; }''', [r['id'], f])
                    if bx['w'] < 2 or bx['x'] < rect['x'] - 50 or bx['x'] > rect['x'] + rect['w']:
                        continue
                    x0, y0 = max(0, round(bx['x'])), max(0, round(bx['y']))
                    x1, y1 = min(1400, round(bx['x'] + bx['w'])), min(860, round(bx['y'] + bx['h']))
                    if x1 - x0 < 2 or y1 - y0 < 2:
                        continue
                    c = {'x': x0, 'y': y0, 'width': x1 - x0, 'height': y1 - y0}
                    await pg.evaluate('f => { window.__hide = null; state.f = f; draw(); }', f)
                    a = Image.open(io.BytesIO(await pg.screenshot(clip=c)))
                    await pg.evaluate('([id, f]) => { window.__hide = id; state.f = f; draw(); }', [r['id'], f])
                    b = Image.open(io.BytesIO(await pg.screenshot(clip=c)))
                    d = diff(a, b)
                    worst = d if worst is None else max(worst, d)
                if worst is not None and worst < 1.0:
                    print(f'  Klickfläche fast leer: {r["id"]} (Abweichung {worst:.2f})')
            await pg.evaluate('() => { window.__hide = null; }')
            pick = [0, 14, 29, 44, 59]
            w, h = frames[0].size
            sheet = Image.new('RGB', (w, h * len(pick)), 'white')
            for i, f in enumerate(pick):
                sheet.paste(frames[f], (0, i * h))
            sheet.resize((w // 2, h * len(pick) // 2)).save(os.path.join(OUT, f'check_{key}.png'))
        print('JS-Fehler:', errs or 'keine')
        await br.close()
        return ok and not errs

if __name__ == '__main__':
    sys.exit(0 if asyncio.run(main(sys.argv[1:])) else 1)
