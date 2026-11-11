"""El vestidor fantàstic (EN06, 0.73): the pictures of the activity, from the ChatGPT drawings and the layers lifted from them
(propostes/vestidor_chatgpt, eines/v2: capes*.py, completa.py, coll.py, braq.py, to_pell.py) to dist/assets/vestidor/*.webp and the
table of boxes dist/vestidor-dades.js. Every layer is cropped to what it draws and keeps its place in its source picture (the boxes).
Usage: python3 -I tools/vestidor-assets.py SRC   (SRC = the folder that holds pilot/, lot2r/ ... lot8/, as in the art thread)."""
import sys, os, json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
SRC = Path(sys.argv[1]); ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'dist' / 'assets' / 'vestidor'; OUT.mkdir(parents=True, exist_ok=True)
CAPES = SRC / 'lot2r' / 'capes'
def figure_alpha(rgb):
    """Figure on white: everything not connected to the border through near-white (the same rule as the layers were lifted with)."""
    r, g, b = [rgb[..., i].astype(int) for i in range(3)]
    light = (r > 238) & (g > 238) & (b > 238)
    lab, _ = ndimage.label(light)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    L = rgb.astype(float).mean(-1)
    ring = ndimage.binary_dilation(bg, iterations=2) & ~bg
    a = np.where(bg, 0.0, 1.0); a[ring] = np.clip((250 - L[ring]) / 120.0, 0, 1)
    return a
BOX = {}
K = 0.75
def save(name, im, q=88, lossless=False, pad=2, k=1.0):
    """Crop to the drawn part (alpha > 0) with a margin, scale it by k (the figures travel at 3/4 of the drawing: decoded, all of them
    take some 100 MB instead of 180), save as WebP and note the box in the source picture (the box stays in source pixels)."""
    im = im.convert('RGBA'); W, H = im.size
    bb = im.getchannel('A').point(lambda v: 255 if v > 2 else 0).getbbox()
    if not bb: return False
    x0, y0, x1, y1 = max(0, bb[0] - pad), max(0, bb[1] - pad), min(W, bb[2] + pad), min(H, bb[3] + pad)
    c = im.crop((x0, y0, x1, y1))
    if k != 1.0: c = c.convert('RGBa').resize((max(1, round(c.width * k)), max(1, round(c.height * k))), Image.LANCZOS).convert('RGBA')
    c.save(OUT / (name + '.webp'), 'WEBP', quality=q, method=6, lossless=lossless, exact=False)
    BOX[name] = [x0, y0, x1 - x0, y1 - y0, W, H]
    return True
def mask_img(path):
    m = np.asarray(Image.open(path).convert('L'))
    if m.max() == 0: return None
    z = np.zeros(m.shape + (4,), np.uint8); z[..., 3] = m
    return Image.fromarray(z, 'RGBA')
def base(path):
    rgb = np.asarray(Image.open(path).convert('RGB')); a = figure_alpha(rgb)
    return Image.fromarray(np.dstack([rgb, (a * 255).astype(np.uint8)]), 'RGBA')
MASTERS = {'rita': ('v2/RITA_MASTER.png', 'lot2r/zip/4_posa/RITA-B0_bracos_amunt.png'),
           'hug': ('lot3/HUG_MASTER.png', 'lot3r/zip/3_hug_posa/HUG-B0_bracos_amunt.png'),
           'quim': ('lot4/QUIM_MASTER.png', 'lot4r/zip/2_quim_posa/QUIM-B0_bracos_amunt.png'),
           'ona': ('lot5/ONA_MASTER.png', 'lot5r/zip/2_ona_posa/ONA-B0_bracos_amunt.png')}
def layers(prefix):
    out = {}
    for n in sorted(os.listdir(CAPES)):
        if not n.startswith(prefix + '-') or 'esborra' in n: continue
        code = n[:-4].split('_')[0].split('-', 1)[1]
        out[code] = n[:-4]
    return out
def glass_white(im):
    """The pale-blue highlight strokes of the helmet bubble become white (combina3.glass_white)."""
    a = np.asarray(im).astype(float)
    m = (np.abs(a[..., 0] - 191) < 30) & (np.abs(a[..., 1] - 227) < 22) & (np.abs(a[..., 2] - 242) < 16) & (a[..., 3] > 0)
    a[m, :3] = 255; a[m, 3] *= 0.9
    return Image.fromarray(a.astype(np.uint8))
def artists():
    for who, (rest, tada) in MASTERS.items():
        save(f'{who}-r', base(SRC / rest), k=K); save(f'{who}-t', base(SRC / tada), k=K)
        for code, n in layers(who.upper()).items():
            if code in ('62b', '62p'): continue
            im = Image.open(CAPES / (n + '.png'))
            if code == '41': im = glass_white(im)
            save(f'{who}-{code}', im, k=K)
            e = CAPES / (n + '_esborra.png')
            if code != '62c' and e.exists():
                m = mask_img(e)
                if m is not None: save(f'{who}-{code}-e', m, lossless=True, pad=0, k=K)
def pipa():
    save('pipa-r', base(SRC / 'lot8/PIPA_MASTER.png'), k=K)
    for code, n in layers('PIPA').items():
        save(f'pipa-{code}', Image.open(CAPES / (n + '.png')), k=K)
        e = CAPES / (n + '_esborra.png')
        if e.exists():
            m = mask_img(e)
            if m is not None: save(f'pipa-{code}-e', m, lossless=True, pad=0, k=K)
def props():
    for code, n in layers('LLORO').items(): save(f'lloro-{code}', Image.open(CAPES / (n + '.png')), k=K)
    for code, n in layers('OBJ').items(): save(f'obj-{code}', Image.open(CAPES / (n + '.png')), k=1.0 if code == '7' else K)
def L(p): return np.asarray(Image.open(SRC / p).convert('RGB'))
def audience(a, b, y0=760, keep_x=None):
    """What picture b adds to picture a below y0 (the people seen from behind), as an RGBA layer (escenari.audience)."""
    A, B = L(a).astype(float), L(b).astype(float)
    d = np.abs(ndimage.gaussian_filter(B, (1, 1, 0)) - ndimage.gaussian_filter(A, (1, 1, 0))).max(-1) > 30
    d[:y0 - 120] = False
    core = ndimage.binary_opening(d, structure=np.ones((7, 7)))
    m = ndimage.binary_dilation(core, iterations=5) & ndimage.binary_closing(d, iterations=2)
    lab, n = ndimage.label(m)
    keep = [i + 1 for i in range(n) if (lab == i + 1)[y0:].any() and (lab == i + 1).sum() > 400]
    if keep_x:
        cx = ndimage.center_of_mass(m, lab, keep); keep = [k for k, c in zip(keep, cx) if keep_x(c[1])]
    m = np.isin(lab, keep); m = ndimage.binary_fill_holes(m)
    a = ndimage.gaussian_filter(m.astype(float), .7)
    return Image.fromarray(np.dstack([B.astype(np.uint8), (a * 255).astype(np.uint8)]), 'RGBA')
def scenes():
    for name, p in [('cam-1', 'pilot/zip/2_camerino/CAM-1_camerino.png'), ('cam-2', 'pilot/zip/2_camerino/CAM-2_armari_obert.png'),
                    ('esc-1', 'lot2r/zip/3_escenari/ESC-1_obert.png'), ('esc-2', 'lot2r/zip/3_escenari/ESC-2_tancat.png')]:
        save(name, Image.open(SRC / p).convert('RGBA'), q=86, pad=0)
    save('public', audience('lot2r/zip/3_escenari/ESC-1_obert.png', 'lot2r/zip/3_escenari/ESC-3_public.png'))
    save('mans', audience('lot2r/zip/3_escenari/ESC-3_public.png', 'lot2r/zip/3_escenari/ESC-4_aplaudiments.png', y0=820, keep_x=lambda x: x < 470 or x > 1180))
    for k, n in enumerate(['pirata', 'ballarina', 'bus', 'astronauta', 'pastisser', 'reialesa'], 1):
        save(f'fons-{k}', Image.open(SRC / f'lot6r/FONS-{k}_{n}_capa.png'), q=86)
    # the glass of the mirror (flat pale blue inside the bulbs' frame), for the reflection
    a = L('pilot/zip/2_camerino/CAM-1_camerino.png').astype(int)
    g = (np.abs(a[..., 0] - 193) < 26) & (np.abs(a[..., 1] - 233) < 20) & (np.abs(a[..., 2] - 245) < 16)
    g[:, :1150] = False; g[700:] = False
    lab, n = ndimage.label(g); big = 1 + int(np.argmax(ndimage.sum(g, lab, range(1, n + 1)))); g = ndimage.binary_fill_holes(lab == big)
    z = np.zeros(g.shape + (4,), np.uint8); z[..., :3] = 255; z[..., 3] = (ndimage.gaussian_filter(g.astype(float), .8) * 255).astype(np.uint8)
    save('vidre', Image.fromarray(z, 'RGBA'), lossless=True, pad=0)
CHIN = {'rita': 640, 'hug': 480, 'quim': 595, 'ona': 150}
def helmets():
    """The astronaut helmet for the ta-da pose (code 41t): with the arms raised, the thin glass outline passes behind the arms, so its dark
    ring pixels over the figure below the chin are dropped (combina3.ring_behind_arms; Ona's big bubble holds her ponytail, CHIN 150)."""
    for who, (rest, tada) in MASTERS.items():
        L = glass_white(Image.open(CAPES / (layers(who.upper())['41'] + '.png')))
        a = np.asarray(L).astype(float); b = np.asarray(base(SRC / tada))[..., 3] > 128
        op = a[..., 3] > 128; dark = op & (a[..., :3].mean(-1) < 110); fill = op & ~dark
        lab, n = ndimage.label(fill)
        if n: fill = np.isin(lab, 1 + np.where(ndimage.sum(fill, lab, range(1, n + 1)) >= 100)[0])
        ring = dark & ~ndimage.binary_dilation(fill, iterations=12)
        ring = ndimage.binary_dilation(ring, iterations=2) & op
        ys = np.arange(a.shape[0])[:, None]
        a[ring & b & (ys > CHIN[who]), 3] = 0
        save(f'{who}-41t', Image.fromarray(a.astype(np.uint8)), k=K)
def anchors():
    """Where the parrot perches on each artist's pirate hat: the left tip of the hat and its width against Rita's (escenari5.parrot_on)."""
    out = {}
    for who in MASTERS:
        hat = np.asarray(Image.open(CAPES / (layers(who.upper())['11'] + '.png')))[..., 3] > 128
        ys, xs = np.where(hat); x0 = int(xs.min()); y_tip = float(ys[xs <= x0 + 6].mean()); w = int(xs.max() - xs.min())
        out[who] = [x0, round(y_tip, 1), round(w / (757 - 245), 4)]
    return out
if __name__ == '__main__':
    if '--anchors' in sys.argv or '--helmets' in sys.argv:   # a part only: the other boxes are read back from the table
        old = (ROOT / 'dist' / 'vestidor-dades.js').read_text(); BOX.update(json.loads(old.split('VS_BOX=Object.freeze(', 1)[1].split(');', 1)[0]))
        if '--helmets' in sys.argv: helmets()
    else: artists(); helmets(); pipa(); props(); scenes()
    total = sum(p.stat().st_size for p in OUT.glob('*.webp'))
    js = ('// El vestidor fantàstic (EN06): where each picture of dist/assets/vestidor sits in its source drawing, [x, y, w, h, W, H]\n'
          '// (made by tools/vestidor-assets.py; do not edit by hand).\n'
          'export const VS_BOX=Object.freeze(' + json.dumps(BOX, separators=(',', ':')) + ');\n'
          '// The left tip of each artist\'s pirate hat and its width against Rita\'s: where the parrot perches [x, y, scale].\n'
          'export const VS_PARROT=Object.freeze(' + json.dumps(anchors(), separators=(',', ':')) + ');\n')
    (ROOT / 'dist' / 'vestidor-dades.js').write_text(js)
    print(len(BOX), 'pictures,', round(total / 1e6, 2), 'MB')
