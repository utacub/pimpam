# Pim Pam 0.50.6 · Logos centrats

Base: 0.50.5. Demanat per en Marc el 7 de novembre de 2026: «El logo d'UTAC i el de Pim Pam, mantenint les mides actuals, han de quedar centrats verticalment un respecte a l'altre, ara el de la UTAC està més amunt que el de Pim Pam».

- **Per què es veia desplaçat:** els dos logos ja estaven centrats per les seves caixes. Però al de Pim Pam, la part de dalt l'ocupen la corba i el botó, i les lletres queden més avall.
- **Correcció:** el logo de la UTAC baixa un 21 % de la seva alçada (12 px a la mida normal). Ara el centre de massa de la tinta dels dos logos queda a la mateixa alçada: 50,6 px per a la UTAC i 51,1 px per a Pim Pam, mesurat en una captura de la capçalera.
- **Mides:** les dels dos logos no canvien. El canvi val també per a la capçalera de dins de les activitats i per a les pantalles estretes.

---

# Pim Pam 0.50.5 · Versió a la portada, logo més gran, «Tria una activitat»

Base: 0.50.4. Demanat per en Marc el 7 de novembre de 2026: «En algun lloc de la pàgina principal hi hauria de sortir la versió, potser al costat del logo de Pim Pam, en petit. El logo de Pim Pam potser podria estar un pèl més gran (no el de la UTAC). En comptes de "Què et ve de gust descobrir?" posa-hi "Tria una activitat".»

- **Versió a la portada:** a la capçalera de la pàgina principal, al costat del logo de Pim Pam, hi diu «v0.50.5», en petit i en gris. Dins de les activitats no surt. El número és a `APP_VERSION`, a `dist/app.js`.
- **Logo de Pim Pam més gran:** passa de 134×69 px a 160×82 px (+19 %). En pantalles estretes passa de 107×54 px a 126×64 px. El logo de la UTAC i els logos de dins de les activitats no canvien.
- **Títol de la llista d’activitats:** «Tria una activitat» en lloc de «Què et ve de gust descobrir?».

---

# Pim Pam 0.50.4 · Sense el rètol de la portada

Base: 0.50.3. Demanat per en Marc el 7 de novembre de 2026: «I elimina aquest rètol de la pàgina principal» (amb una captura del rètol «✧ La màgia comença amb tu.»). S’ha tret el rètol de sobre la imatge de la flor de la pàgina principal. Res més no canvia.

---

# Pim Pam 0.50.3 · Botó «Versió WebGL 2»

Base: 0.50.2. Demanat per en Marc el 7 de novembre de 2026: «El botó de "Alta qualitat" hauria d'estar a la part inferior de la fitxa, no a dalt de tot, i penso que millor posar "Versió WebGL 2"».

- **Nom:** el botó de les cinc fitxes de les immersions es diu ara «Versió WebGL 2». WebGL 2 és el motor gràfic que dibuixa aquestes activitats en directe.
- **Lloc:** és a la part de baix de la fitxa, sota el text, a l’esquerra. La fitxa s’allarga una mica per fer-li lloc.
- **Avís:** en passar-hi el cursor per sobre, surt «Més requisits de maquinari» a sobre del botó.
- **Què fa:** el mateix que a la 0.50.2. Obre l’activitat amb el motor original en lloc dels vídeos.

---

# Pim Pam 0.50.2 · Vídeos a 30 fps i botó «Alta qualitat»

Base: 0.50.1 (commit 15d9b65). Demanat per en Marc el 7 de novembre de 2026: «potser amb 30fps n'hi haurà més que suficient i no ocuparien tant, a 60fps hi haurà dispositius que els costarà de reproduir» i «afegir a cada fitxa un botó que posi "Alta qualitat" i que quan passis el cursor per sobre posi "més requisits de maquinari", que siguin les activitats amb el motor original en comptes del vídeo».

## Vídeos dels viatges i immersions a 30 fps

- **Com s'han fet.** Els 100 vídeos s'han passat de 60 a 30 fps a partir dels de la 0.49, que eren de 60 fps. S'ha conservat un fotograma de cada dos. La codificació és la mateixa d'abans: x264 veryslow, tune animation, CRF 21, H.264 High de 8 bits, BT.709, faststart. El nivell ara és el 4.0 (abans 4.2) i hi ha un fotograma clau cada 2 s. El so és el mateix d'abans, copiat sense tornar-lo a codificar.
- **Mida.** De 468 MB a 393 MB (−16 %). Per activitat:

  | Activitat | Abans | Ara |
  |---|---|---|
  | Fons marí de vidre | 59 MB | 53 MB |
  | Selva de llum | 65 MB | 57 MB |
  | Sabana de paper | 72 MB | 63 MB |
  | El pou del temps | 147 MB | 118 MB |
  | Gegants del blau | 125 MB | 104 MB |

  La mida baixa poc perquè els fotogrames que es treuen s'assemblen molt als que queden. El que sí que es redueix a la meitat és la feina de descodificar.
- **Qualitat.** S'ha comparat cada vídeo nou amb els fotogrames corresponents del de 60 fps.
  - En cinc escenes de mostra, la PSNR-Y mitjana està entre 48,5 i 55,1 dB, i la del pitjor fotograma entre 45,9 i 52,3 dB.
  - A l'escena 1 del Pou, l'SSIM-Y és de 0,9955.
  - S'han comprovat els 100 vídeos: tots són de 30 fps i tenen la mateixa durada i el mateix so que abans.

## Botó «Alta qualitat»

- **On és.** Quan l'app s'obre per web, les fitxes de «Fons marí de vidre», «Selva de llum», «Sabana de paper», «El pou del temps» i «Gegants del blau» tenen el botó «Alta qualitat» a dalt a l'esquerra.
- **Avís.** En passar-hi el cursor per sobre, o en arribar-hi amb el teclat, surt «Més requisits de maquinari».
- **Què fa.** Obre l'activitat amb el motor original (WebGL i música en directe), en lloc dels vídeos.
- **Opcions.** Es veu igualment sempre amb el decorat complet. En aquest mode torna a sortir «Moviment de càmera a Gegants del blau».
- **Sense connexió.** El fitxer únic no mostra el botó, perquè ja dibuixa sempre en directe.

---

