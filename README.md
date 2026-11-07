# Pim Pam · UTAC

Jocs de causa-efecte i d’encercament per jugar amb commutadors, en català.

**Juga-hi en línia:** https://utacub.github.io/pimpam/

Versió actual: **0.48** (42 activitats: 31 de causa-efecte i 11 d’encercament). Els canvis d’aquesta versió són a [CANVIS.md](CANVIS.md).

## Com està organitzat el repositori

| Carpeta o fitxer | Què hi ha |
|---|---|
| `dist/` | L’app tal com es publica: `index.html`, els mòduls JavaScript, l’estil i `assets/` (sons enregistrats i imatges). És l’única carpeta que es publica a GitHub Pages. |
| `dist/videos/` | (Encara no existeix.) Aquí aniran els vídeos 1080p H.264 de les activitats amb més requisits gràfics, un subdirectori per activitat. |
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

Cal un servidor perquè l’app fa servir mòduls JavaScript. Per jugar sense servidor ni connexió (per exemple, des d’un llapis USB), genera el fitxer únic amb `python3 build_standalone.py`.

## Crèdits

Els crèdits i les llicències dels sons enregistrats són a [`dist/assets/samples/CREDITS.md`](dist/assets/samples/CREDITS.md).
