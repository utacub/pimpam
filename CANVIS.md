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

