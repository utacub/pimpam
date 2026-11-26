# Pim Pam · UTAC

Jocs de causa-efecte i d’encercament per jugar amb commutadors, en català.

**Juga-hi en línia:** https://utacub.github.io/pimpam/

Versió actual: **0.49** (42 activitats: 31 de causa-efecte i 11 d’encercament). Els cinc viatges i immersions es reprodueixen en vídeo. Els canvis d’aquesta versió són a [CANVIS.md](CANVIS.md).

## Com està organitzat el repositori

| Carpeta o fitxer | Què hi ha |
|---|---|
| `dist/` | L’app tal com es publica: `index.html`, els mòduls JavaScript, l’estil i `assets/` (sons enregistrats i imatges). És l’única carpeta que es publica a GitHub Pages. |
| `dist/videos/` | Els vídeos 1080p H.264 a 30 fps dels cinc viatges i immersions, un per escena (`fons`, `selva`, `sabana`, `pou`, `gegants`), en total uns 393 MB, i els de les «Petites pel·lícules». Els vídeos de les immersions els reprodueix `dist/video-dives.js`; el botó «Alta qualitat» de cada fitxa les obre amb el motor original. |
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

## Llicència

Copyright © UTAC (Unitat de Tècniques Augmentatives de Comunicació).

El codi de Pim Pam és programari lliure: es distribueix amb la llicència **GNU General Public License 3.0 o posterior** (GPL-3.0-or-later), que és al fitxer [`LICENSE`](LICENSE). Es pot fer servir, estudiar, modificar i redistribuir; les versions modificades que es distribueixin s'han de publicar amb la mateixa llicència i amb el codi font, i s'han de conservar els avisos d'autoria.

Els continguts propis (il·lustracions, animacions, música, sons generats amb ElevenLabs i textos de les activitats) tenen la llicència **Creative Commons Reconeixement-NoComercial-CompartirIgual 4.0** (CC BY-NC-SA 4.0), que és al fitxer [`LICENSE-CONTINGUTS.md`](LICENSE-CONTINGUTS.md). Cal citar «Pim Pam, UTAC (Unitat de Tècniques Augmentatives de Comunicació)», no se'n permet l'ús comercial i les adaptacions s'han de compartir amb la mateixa llicència. Els logotips i els recursos de tercers en queden fora, com s'explica en aquell fitxer. Els sons de castells (`castells/toc1-7.mp3`) mantenen la llicència CC BY-SA 4.0 del seu enregistrament original.

## Crèdits

Els crèdits, l’origen i les institucions també es poden veure a l’app, amb el botó «Informació» de la portada. Els crèdits i les llicències dels sons enregistrats són a [`dist/assets/samples/CREDITS.md`](dist/assets/samples/CREDITS.md).
