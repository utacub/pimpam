# Pim Pam · UTAC

Jocs de causa-efecte i d’encercament per jugar amb commutadors, en català.

**Juga-hi en línia:** https://utacub.github.io/pimpam/

Versió actual: **0.49** (42 activitats: 31 de causa-efecte i 11 d’encercament). Els cinc viatges i immersions es reprodueixen en vídeo. Els canvis d’aquesta versió són a [CANVIS.md](CANVIS.md).

## Com està organitzat el repositori

| Carpeta o fitxer | Què hi ha |
|---|---|
| `dist/` | L’app tal com es publica: `index.html`, els mòduls JavaScript, l’estil i `assets/` (sons enregistrats i imatges). És l’única carpeta que es publica a GitHub Pages. |
| `dist/videos/` | Els vídeos 1080p H.264 dels cinc viatges i immersions, un per escena (`fons`, `selva`, `sabana`, `pou`, `gegants`), en total uns 490 MB. Els reprodueix `dist/video-dives.js`. |
| `tests/` | Proves automàtiques (`npm test`, amb Node.js). |
| `tools/` | Eines de revisió, d’àudio i de captura. |
| `production/` | Fonts de producció (shaders GLSL, notes i proves d’estil). |
| `build_standalone.py` | Genera el fitxer HTML únic, sense connexió, a `dist/` (uns 60 MB). |
| `DOCUMENTACIO_TECNICA.md`, `ACTIVITATS.md`, `PATRONS.md`, `PALETA.md`, `AUDITORIA_FLAIXOS.md` | Documentació tècnica i de disseny. |

## Publicació

Cada `push` a `main` executa `.github/workflows/pages.yml`, que publica `dist/` a GitHub Pages.

## Provar-ho en local

```sh
cd dist
python3 -m http.server 8000
# obre http://localhost:8000/
```

Cal un servidor perquè l’app fa servir mòduls JavaScript. Per jugar sense servidor ni connexió (per exemple, des d’un llapis USB), genera el fitxer únic amb `python3 build_standalone.py`. Sense servidor, les immersions es dibuixen en directe en lloc de reproduir els vídeos.

## Crèdits

Els crèdits i les llicències dels sons enregistrats són a [`dist/assets/samples/CREDITS.md`](dist/assets/samples/CREDITS.md).
