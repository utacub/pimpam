# Pim Pam 0.77 · Auditoria completa abans de la presentació

Base: 0.76.1 (a6e5480). Respon a en Marc (11 de novembre de 2026, 23:32 i 23:34): auditoria completa de tota l’aplicació, amb les proves de flaixos, i comprovació en totes les plataformes.

## Què canvia

- **Tauletes (651–1240 px d’amplada).** Els botons de la capçalera mostraven el nom i sortien per la dreta («Configuració» i «Instal·la» no es podien prémer sense desplaçar la pàgina). Ara, en aquesta amplada, mostren només la icona, com als mòbils; el nom es manté a `aria-label`. Comprovat sense desplaçament horitzontal de 360 a 1920 px.
- **Accessibilitat (axe-core).** El número de versió tenia un contrast de 4,05:1 (ara #5d6f87, 4,94:1). Les il·lustracions de la portada tenen `role="img"` per a la seva etiqueta.
- **Instal·lació (PWA).** Un text visible deia «Deixeu aquesta pw_finestra oberta»; ara diu «finestra».
- **Idiomes.** La frase de crèdits «La llista completa, so per so…» i dues frases noves de la Informació (codi de l’aplicació, logotips) no tenien traducció: ara són als cinc idiomes.
- **Proves.** Tres límits de mida desfasats (masia 1,8 MB, natura 4,6 MB, detectius 7 MB) s’ajusten a les mides reals.
- **Eines noves.** `tools/flash-audit-app.mjs`, `tools/flash-analyze.py`, `tools/flash-audit-videos.sh` (auditoria de flaixos WCAG 2.3.1 de totes les activitats i de tots els vídeos) i `tools/i18n-crawl.mjs` (textos que queden en català en un altre idioma). Resultats a `AUDITORIA_FLAIXOS.md`.

## Proves

- Suite completa: 476 de 476.
- Flaixos: 46 de 46 pantalles en directe superen el criteri (El vestidor fantàstic, al límit); vídeos, 120 de 121 (no supera `sabana_escena_20.mp4`; `pou_escena_20.mp4` al límit).
- WebKitGTK (motor de la família de Safari): les 45 activitats s’obren sense errors de JavaScript. Mòbils i tauletes emulats (iPhone 13, Pixel 7, iPad Mini, iPad Pro 11, Galaxy Tab S4). PWA: instal·lació completa i funcionament sense connexió.

## No verificat

- Firefox (no es pot descarregar en aquest entorn), Safari real a iOS i macOS, i targetes gràfiques reals. Sense WebGL2, Pluja de colors, Laboratori de matèria i Fractals a la natura queden en negre sense cap avís (decisió de disseny pendent).

# Pim Pam 0.76.1 · Informació: «Un petit «pim» genera un gran «pam».» com a frase pròpia

Base: 0.76 (8a7cddf). Respon a en Marc (11 de novembre de 2026, 23:30). Al primer paràgraf d’«Informació», la frase va després d’un punt: «…cada pulsació té una resposta clara, visual i sonora. Un petit «pim» genera un gran «pam».» Canviat als sis idiomes.

# Pim Pam 0.76 · Instal·lar Pim Pam com una aplicació (PWA)

Base: 0.75.3 (ecc6aa3). Respon a en Marc (11 de novembre de 2026, 23:05): «vull que Pim Pam tingui instal·lació PWA, i que hi hagi un botó a dalt a la dreta a la pàgina principal per iniciar-la, i que quan es premi aquest botó adverteixi de l’espai total que ocupa instal·lada», amb les icones del kit de marca complet que va enviar a les 23:24, i el canvi de text de «Informació» (23:23).

## Què canvia

- **Botó «Instal·la»**, l’últim de la capçalera de la pàgina principal (a dalt a la dreta). No forma part de l’encercament amb commutador. S’amaga quan el navegador no pot instal·lar (el fitxer únic, file://) i dins de l’aplicació instal·lada quan ja ho té tot.
- **Avís d’espai abans d’instal·lar.** La finestra diu l’espai total que ocuparà Pim Pam instal·lat (ara 496 MB: vídeos 433, sons i música 32, imatges 17, programa i textos 14) i l’espai que el navegador pot fer servir en aquell dispositiu; si no n’hi ha prou, ho diu. La xifra és la suma real dels 1.527 fitxers que es descarreguen (MB com els compta Windows, 1.048.576 bytes). Comprovat a Chromium: després d’instal·lar, l’ús d’emmagatzematge del lloc és de 520.439.176 bytes, és a dir, 496 MB.
- **Instal·lació.** En prémer «Instal·la (496 MB)», Chrome i Edge mostren el seu quadre d’instal·lació; si s’accepta, es descarreguen tots els fitxers amb una barra de progrés i es pot aturar i continuar més tard sense tornar a baixar el que ja hi és. Als navegadors sense quadre (Safari, Firefox) es descarrega igualment i s’explica com afegir-lo a la pantalla d’inici. Quan està instal·lat, la finestra ho diu i permet esborrar les activitats del dispositiu.
- **Sense connexió.** `dist/sw.js` (service worker) serveix els fitxers descarregats, també els vídeos amb peticions parcials (206). Qui només visita el web no descarrega res de més: el service worker no intervé fins que s’ha instal·lat.
- **Actualitzacions.** `tools/pwa-build.mjs` escriu `dist/pwa-fitxers.json` (camí, mida i hash de cada fitxer); el flux de GitHub Pages l’executa abans de publicar, de manera que la llista sempre coincideix amb el que es publica. L’aplicació instal·lada, en obrir-se amb connexió, baixa només els fitxers que han canviat i esborra els vells.
- **Icones** del kit de marca complet (04_Icones_PWA): app_clara 192 i 512, maskable 512, apple-touch-icon, favicon.ico i SVG. Manifest `dist/manifest.webmanifest` (fons de la pantalla d’inici: blanc càlid del kit).
- **Informació.** Primer paràgraf: «Pim Pam és un recull d’activitats per jugar amb un o dos commutadors. Està pensat per aprendre a fer servir commutadors: cada pulsació té una resposta clara, visual i sonora, un petit «pim» genera un gran «pam».» El paràgraf del navegador explica que es pot instal·lar.
- **Textos** nous i canviats als sis idiomes (i18n/ui-*.tsv, pat-*.tsv).

## Proves

- `tests/pwa.test.mjs` (3): mides, llista de fitxers (mides reals, tots els mòduls d’app.js hi són), manifest, icones, service worker i flux de Pages. Suite completa: 476 + 3; fallen les 3 proves de mides d’enregistraments de sempre (masia, instruments, detectius).
- Chromium (Playwright): Chrome declara l’aplicació instal·lable sense errors (`Page.getInstallabilityErrors` buit); descàrrega completa; sense connexió s’obre la portada, sonen els sons i els vídeos es reprodueixen (1920 px, peticions 206); una versió nova amb un fitxer canviat només baixa aquell fitxer.

## No verificat

- El quadre d’instal·lació real de Chrome a Windows (Playwright no el pot mostrar): l’ha de provar en Marc. Traduccions dels textos nous sense revisió de parlants nadius.

# Pim Pam 0.75.3 · Fractals a la natura: el riu baixa de les fonts al mar

Base: 0.75.2 (81d77a9; la 0.75.2 és el barret de cuiner de la Pipa d’«El vestidor fantàstic», més avall). Respon al comentari d’en Marc de l’11 de novembre de 2026 (22:45): «la única cosa que canviaria és la del rius, que per lògica hauria de començar en els afluent i acabar en el riu principal, ara ho fa al revés, és com si l'aigua pugés del riu cap als afluents».

## Què canvia

- **«Riu i afluents» creix com corre l’aigua.** Primer apareixen alhora els rierols més fins, que baixen fins on s’ajunten; després cada ordre d’afluents més grans, i al final el riu principal, que arriba a la desembocadura (a baix). La xarxa és la mateixa d’abans i continua creixent ordre a ordre (ara del més petit al més gran); el que canvia és el sentit: cada línia creix des de la seva punta de dalt cap avall, i les línies que abans naixien les últimes ara neixen les primeres. Les ones de llum també baixen, de les fonts a la desembocadura, i el punt blanc del front de l’aigua va riu avall.
- **La marxa enrere del riu no puja.** Fer-la al revés del creixement nou tornaria a fer pujar l’aigua, i per això el riu, en lloc de desfer-se al revés, es buida en el sentit de l’aigua: les línies s’esborren des de dalt cap avall, primer els rierols i al final el riu principal, fins a la desembocadura. Dura el mateix que la marxa enrere de les altres formes. Les altres 19 formes no canvien.
- **Textos.** La descripció del creixement («baixen els rierols, s’ajunten en afluents i acaben en el riu principal») i la de la marxa enrere del riu («l’aigua baixa fins al mar i la xarxa s’apaga»), als sis idiomes. Les notes dels esdeveniments segueixen el mateix ordre (primer les fulles, al final el tronc).

## Proves

- `tests/fractals.test.mjs` (12): una de nova per al riu (el riu principal creix cap avall i la desembocadura és l’última que s’assoleix, els rierols comencen abans que el riu, l’ordre dels esdeveniments, la marxa enrere que es buida i el text del lector de pantalla; les altres 19 formes continuen desfent-se al revés).
- Imatges fixes del creixement i de la marxa enrere del riu.

## No verificat

- No s’ha vist en una targeta gràfica real (només amb SwiftShader); l’auditoria de flaixos la fa en Marc.

# Pim Pam 0.75.2 · El vestidor: el barret de cuiner de la Pipa, ple

Base: 0.75.1 (181dc7d). Respon al comentari d’en Marc de l’11 de novembre de 2026 («El barret de cuiner del gos t’ha quedat transparent per dins»).

- El barret de cuiner de la Pipa ja no és transparent per dins. El blanc del barret és gairebé igual que el fons blanc del dibuix original de la Pipa, i en separar el barret com a capa, l’interior es perdia. Ara els forats tancats per la línia del barret prenen els colors del dibuix de ChatGPT (`fill_inside` a `tools/vestidor-assets.py`).
- He revisat totes les altres capes del vestidor que tenen forats tancats dins del contorn: són els cascos de vidre, la bobina de la tuba i l’ansa de la regadora (volguts), i uns forats petits que queden tapats pel cos de l’artista. No n’hi ha cap altre que es vegi.

# Pim Pam 0.75.1 · El vestidor: les cartes amb la peça sola i sencera

Base: 0.75 (ca0d7c0). Respon al comentari d’en Marc de l’11 de novembre de 2026 («quan es trien les peces de roba es vegin malament… potser necessites imatges dels objectes sols per posar-les a l’encercament, i després un cop es tria, canviar a la imatge que encaixa bé»).

- **Les cartes de l’encercament** mostren cada barret, roba i calçat sol i sencer, sense cos a dins ni parts tallades: 18 dibuixos nous fets amb ChatGPT (lot 9, l’11 de novembre), els mateixos per als quatre artistes. Els objectes màgics ja eren sols i no canvien.
- **Quan es tria**, la peça surt de la carta amb el dibuix sencer i, just abans d’arribar, es fon amb la que encaixa a l’artista (els darrers 0,3 s del vol).
- Les 18 imatges pesen 0,76 MB i es carreguen amb les comunes de l’activitat.
- Proves: una de nova a `tests/vestidor.test.mjs` (cada peça té la seva imatge de carta, al disc i a la llista comuna; els objectes conserven la seva). Comprovat amb imatges fixes del tauler (cap, cos, peus, amb 3 i 4 cartes, dos artistes) i del vol.

# Pim Pam 0.75 · Portada amb il·lustracions de les activitats

Base: 0.74.2 (65b62d0). Respon als missatges d’en Marc de l’11 de novembre de 2026: «La imatge inicial de la pàgina principal hauria de ser un Gif que mostrés 15 imatges espectaculars de les activitats… que semblin il·lustracions d’un conte, i van transicionant d’una a una altra» i «En comptes de la imatge estàtica de flors que hi ha ara, que pot ser la primera».

## Què canvia

- **La imatge de la portada és ara una seqüència de 15 il·lustracions** que es fonen l’una en l’altra (fos de 2,5 s, 6 s cadascuna, i un desplaçament lent que no salta mai). La primera és el prat de flors de paper de sempre; les altres 14 són fotogrames reals de les activitats: Viatge a la selva (guacamais, nenúfar de nit, granota), El pou del temps (mamut, triceratops, pterosaure a la posta), Fons marí (bosc de llum), Sabana (girafes, lleons), les dues pel·lícules (Park Güell i Barcelona a la posta; l’escola), Fractals a la natura (falgueres i flocs) i Fem castells.
- **Per què no un GIF:** un GIF només té 256 colors per fotograma i, en un fos encadenat d’imatges pintades, fa bandes i soroll; a més, 15 imatges en GIF pesarien desenes de MB. Les il·lustracions són WebP de 1440 × 878 (1,2 MB en total) i el fos el fa el navegador, amb els colors sencers.
- **Càrrega:** només es baixa la imatge següent; la seqüència s’espera si la pestanya és amagada, si hi ha un diàleg obert o si la imatge encara no ha arribat. En tornar a la portada (per exemple, en sortir d’una carpeta) continua per on anava.
- **Moviment reduït:** amb «reduir el moviment» del sistema, les imatges no es desplacen; només es fonen.
- **Text alternatiu** de la imatge actualitzat als sis idiomes.

## Proves

- Comprovat a Chromium: la seqüència avança, carrega les imatges una a una, es manté en tornar a la portada i no hi ha errors. Suite 466/469 (els 3 errors coneguts dels arxius de so que no són al repositori). L’auditoria de flaixos no s’ha passat (la passa en Marc); el canvi és un fos lent, sense flaixos.

