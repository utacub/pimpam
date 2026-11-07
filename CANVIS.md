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
