#!/usr/bin/env python3
"""0.78: the card pictures of the six Mira i Juga 2 activities: dist/mj2/cartes/<id>.png (tools/mj2-app.mjs cartes) -> WebP 960 px."""
import glob, os
from PIL import Image
for p in sorted(glob.glob('dist/mj2/cartes/*.png')):
    im = Image.open(p).convert('RGB')
    im = im.resize((960, round(960 * im.height / im.width)), Image.LANCZOS)
    im.save(p[:-4] + '.webp', 'WEBP', quality=82, method=6)
    os.remove(p)
    print(p[:-4] + '.webp', os.path.getsize(p[:-4] + '.webp') // 1024, 'KB')
