# Pim Pam 0.50 · Petites pel·lícules

Base: 0.49 (`v0_49_viatges_en_video`, commit 6a00e67). Demanat per en Marc el 7 de novembre de 2026: dues activitats noves a una carpeta «Petites pel·lícules», posada després d’«Històries pas a pas», fetes amb els vídeos del projecte «Edició de vídeo»: «Un mos a Barcelona» (10 seqüències) i «Comunicar a tot arreu» (11). Sense el logo de la UTAC sobreimprès ni al final. En acabar cada seqüència cal prémer el commutador. A la seqüència 8 de «Comunicar a tot arreu» cal retallar la distorsió de l’inici i del final.

L’app té ara **44 activitats** (33 de causa-efecte i 11 d’encercament).

## La carpeta i les dues activitats

- **On és.** La carpeta «Petites pel·lícules» és just després d’«Històries pas a pas» a la pàgina inicial. Les activitats tenen els codis PL01 i PL02.
- **Com es juga.** Abans de començar es veu el primer fotograma, enfosquit. Cada pulsació reprodueix una seqüència sencera amb el seu so. En acabar, la imatge queda aturada a l’últim fotograma i s’enfosqueix fins a la pulsació següent. Una pulsació mentre una seqüència es reprodueix no fa res. Després de l’última seqüència, la pulsació següent torna a començar la pel·lícula.
- **Mecànica.** És la de «Vídeo a poc a poc» de les activitats personalitzades (0.46), amb una sola parada al final de cada fitxer. Per això fa servir el mateix enfosquiment («mitjà»), la mateixa pausa i el mateix volum.
- **Càrrega.** Només es carreguen la seqüència actual i la següent. La següent ja és a punt quan acaba l’actual. Si encara no ho és, la pulsació espera i l’estat diu «Carregant la seqüència següent…».
- **Logo.** Els vídeos no porten cap logo, i l’app no n’hi sobreposa cap.
- **Sense connexió.** Els vídeos no van dins del fitxer únic. Si l’app s’obre des d’aquest fitxer, cal tenir la carpeta `videos/` al costat (`videos/mos/`, `videos/comunicar/`). Si no hi és, l’estat ho indica i la pulsació no fa res. Des d’un fitxer local, el so del vídeo surt directament de l’element de vídeo amb el volum del perfil, perquè el navegador no deixa passar-lo pel mesclador de l’app.

## Els vídeos

- **Origen.** 21 clips de Seedance 2.5 pujats per en Marc al fil: 1280×720 a 24 fps, H.264 + AAC. Els d’«Un mos a Barcelona» duren 4,04 s; els de «Comunicar a tot arreu», 5,04 s.
- **Retall de la seqüència 8 de «Comunicar a tot arreu».** La diferència entre fotogrames consecutius (YDIF de `signalstats`) té pics als fotogrames 1–2 (8,4 i 4,8) i 117–119 (8,1, 5,6 i 3,5), mentre que la resta del clip queda entre 0,3 i 4. S’han tret els fotogrames 0–2 i 117–120: en queden 114, 4,75 s (de 0,125 s a 4,875 s). L’àudio s’ha retallat igual, amb fosos de 40 ms i 50 ms. Cap altre clip té aquests pics a l’inici o al final.
- **Codificació.** H.264 High, CRF 19, preset slow, GOP de 2 s, `faststart`. Àudio AAC 160 kbit/s a 48 kHz, normalitzat en dues passades amb `loudnorm` a −20,8 LUFS integrats (true peak −1,5 dBTP). És el mateix nivell que els vídeos de les immersions, i passa per la mateixa atenuació (0,647). Els originals anaven de −22 a −44 LUFS. Els resultats mesurats (EBU R 128) queden entre −20,0 i −21,7 LUFS.
- **Mida.** 21 MB cada pel·lícula, 42 MB en total. El lloc publicat passa d’uns 540 MB a uns 582 MB, per sota del límit d’1 GB de GitHub Pages.
- **Targetes.** Un fotograma de cada pel·lícula en JPEG de 640×360 (`dist/pellicules-cartes.js`, generat per `production/pellicules/fer_cartes.py`).

## Codi

- `dist/pellicules.js` (nou): la llista de pel·lícules, l’activitat en el format de les personalitzades i la URL de cada seqüència.
- `dist/persona.js`: `psAct` també troba les pel·lícules; les seqüències es carreguen des de `./videos/`, només l’actual i la següent (`psFilmKeep`); textos d’estat, d’ajuda i de progrés propis (un punt per seqüència).
- `dist/app.js`: les pel·lícules s’afegeixen al catàleg, la carpeta a `HOME_GROUPS`, les targetes a les previsualitzacions i la versió a «Sobre aquesta versió». `dist/art.js` les dibuixa amb `psRender`.
- `build_standalone.py`: mòduls nous; sortida `Pim_Pam_44_activitats_v0_50.html`.

## Comprovacions

- `node --test tests/*.test.mjs`: 394 superades i 3 fallades. Les 3 són les mateixes de la 0.49: proves de mida en bytes de les gravacions de la masia, dels instruments i de Detectius de sons, que fallen per les metadades que la carpeta compartida afegeix als fitxers. Proves noves: `tests/pellicules.test.mjs`.
- `tools/pellicules-app.mjs` (nou) serveix `dist/` amb peticions Range, com GitHub Pages, i comprova amb Chromium tots dos ordres de la carpeta, totes 21 seqüències, que una pulsació a mitja seqüència no fa res i que després de l’última es torna a començar. Resultat: sense errors, a devicePixelRatio 1 i 2.
- L’auditoria de flaixos no s’ha executat (la fa en Marc).
- No s’ha provat en Safari, iPad ni Firefox.
- El so dels clips no s’ha escoltat, només s’ha mesurat. Els més fluixos s’han apujat fins a 23 dB i el soroll de fons es pot haver fet més audible.

---

# Pim Pam 0.49 · Viatges i immersions en vídeo

Base: 0.48 (`v0_48_detectius_de_sons`). Demanat per en Marc el 7 de novembre de 2026: «En comptes de "Un petit gest. Un món per descobrir." posa-hi "Un petit gest. Un gran efecte.". Passa els vídeos de viatges i immersions a les activitats. En aquestes activitats no hi haurà l'opció de fer fons atenuat o eliminar fons, elimina-ho de les finestres d'opcions d'aquestes activitats.»

L’app continua tenint **42 activitats** (31 de causa-efecte i 11 d’encercament).

## Viatges i immersions en vídeo

- **Quines activitats.** «Fons marí de vidre», «Selva de llum», «Sabana de paper», «El pou del temps» i «Gegants del blau».
- **Com funciona.** Cada pulsació reprodueix el vídeo de l’escena següent: 1920×1080, H.264 de 8 bits a 60 fps, amb la seva música (AAC). Són 100 vídeos en total, amb una mida de 488,7 MB. Cada vídeo comença on acaba l’anterior. En acabar, l’escena queda aturada i enfosquida fins a la pulsació següent, com abans. Abans de la primera pulsació es veu el primer fotograma del viatge.
- **Fitxers.** `dist/videos/<fons|selva|sabana|pou|gegants>/<nom>_escena_NN.mp4`. Mentre una escena es reprodueix, la següent ja es carrega. La pantalla de càrrega espera fins que el primer vídeo es pot reproduir.
- **So.** El so dels vídeos passa pel volum general de l’app, i el botó de silenci també l’afecta. Els vídeos estan mesclats a uns −20,8 LUFS (mesurat amb EBU R 128 a 10 escenes, dues per activitat). Una atenuació fixa els deixa al mateix nivell que la música en directe d’abans, uns −33,7 LUFS amb el volum al 100 %.
- **Tauletes.** A la portada ja no es preparen els programes gràfics de les immersions en segon pla, i dins de l’activitat ja no es dibuixen en directe.
- **Sense connexió.** Si l’app s’obre des del fitxer únic, o si un vídeo no es pot carregar, l’activitat es continua dibuixant en directe amb WebGL i la seva música, com a la 0.48.
- **Moviment reduït.** Cada escena es mostra quieta (el fotograma dels 8 s) mentre sona la música.
- **Pantalles d’una altra forma.** El vídeo omple la pantalla i se’n retalla com a màxim un 15 % aproximadament. Si cal retallar més, apareixen franges negres. En un mòbil en vertical, el vídeo queda en una franja al mig.
- **Ordre de les escenes.** L’ordre és sempre de l’1 al 20 i torna a començar. Si «Espera que acabi cada efecte» està desactivat, una pulsació a mitja escena passa directament al vídeo següent.

## Opcions d’aquestes cinc activitats

- No hi ha «Decorat atenuat», «Sense decorat», «Visibilitat del decorat» ni «Color de base». Es veuen sempre amb el decorat complet, també sense connexió.
- «Aquesta activitat» explica que les escenes són en vídeo i que «Durada dels efectes» no s’hi aplica (cada vídeo té la seva durada).
- «Moviment de càmera a Gegants del blau» només surt quan l’activitat es dibuixa en directe.

## Altres canvis

- **Lema de la portada:** «Un petit gest. Un gran efecte.» (també a la descripció de la pàgina).
- **Sabana de paper, escena 20:** a l’oricteròpode ja no se li tallen les orelles quan s’alça (`production/sabana/scene_19.glsl`; límit del dibuix f.y > 1,5 i x ±1,1). Els vídeos ja es van fer amb aquesta correcció.

## Comprovacions

- **Proves automàtiques:** 392 de 395 superades. Les tres que fallen comproven la mida total en bytes de gravacions que no s’han tocat (masia, instruments enregistrats, Detectius de sons). Fallen perquè la carpeta compartida afegeix metadades als fitxers.
- **Navegador (Chromium):** s’han obert les cinc activitats servides per HTTP.
  - Les cinc reprodueixen els vídeos sense errors: l’escena 1, l’espera enfosquida i l’escena 2.
  - A les opcions no hi surt cap opció de decorat.
  - El fitxer únic obert des del disc dibuixa en directe i no demana cap vídeo.
