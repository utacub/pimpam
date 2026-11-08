# Pim Pam 0.53 · El taller de vehicles en tres dimensions (fase 0)

Base: 0.52.4 (commit e705207). Demanat per en Marc el 8 de novembre de 2026: «M'agradaria que fos una activitat elaborada amb three.js, la primera activitat de Pim Pam en 3D. Que es construeixin vehicles joguina, que en acabar circulen una mica per un circuit […] una mica com si es construïssin joguines de vehicles de Toy Story i després les veiem circular per la casa (sense que les joguines tinguin ulls ni res semblant)». Pla aprovat a les 10:18 («D'acord, ja pots començar a construir l'activitat»): https://claude.ai/artifact/Vp8456GkEm26qbjLEgGKXh. Estil: les quatre imatges de concepte d’en Marc del mateix dia («Joguina de vinil tou»).

Aquesta versió és la **fase 0** del pla: el motor en tres dimensions dins del fitxer únic, el taller i l’habitació, i el primer racó complet. S’atura aquí perquè en Marc revisi l’art abans de les fases 1 a 4 (els altres quatre racons de la casa, més peces, el final de racó i el poliment).

## Què fa l’activitat

- **El taller.** Un banc de fusta clara amb la vora verda, un tauler d’eines (la clau anglesa es gronxa al ganxo), un prestatge amb capses, un llum de taula i, al fons, la paret amb la finestra i el fris de turons. A sota, la safata: una barra verda amb dues, tres o quatre caselles de color crema («Opcions de contingut»).
- **Les peces (racó de l’habitació).** Quatre carrosseries (cotxe familiar blau, autobús groc, furgoneta de repartiment corall, cotxe de curses verd), tres jocs de rodes (de tacs, primes de curses, de fusta) i tres accessoris (baca amb maleta, remolc de blocs, bandereta). Amb quatre passos, el quart és el color (blau, corall, groc, verd: un pot de pintura que pinta la carrosseria).
- **Muntar.** A cada pas la safata mostra les peces d’una família; la triada vola de la casella al xassís gris i fa «clac» (fusta: claves i vora de tambor). Cada ronda ofereix tres de les quatre carrosseries, i l’ordre canvia amb la ronda; cada carrosseria surt en tres rondes de cada quatre.
- **Esperar i arrencar.** Amb l’última peça, el vehicle queda complet i espera que es premi el commutador: un anell gruixut (el de l’encercament, sencer) respira al voltant del vehicle, un piano fa un acompanyament suau i, si ningú no prem, arrenca sol al cap de vuit segons. Amb «Engegar: sol», arrenca de seguida i no hi ha anell.
- **La volta.** Dues claves engeguen el motor; el vehicle baixa la rampa del banc al terra i fa una volta per l’habitació (catifa, llit, pilota, blocs) fins al garatge, que és un prestatge-caixa a terra. La càmera «Dinàmica» fa tres plans (la rampa, el seguiment arran de terra, l’arribada); la «Tranquil·la» ho mira tot des de l’habitació. Durada: 8, 14 o 20 segons.
- **Cada peça es nota.** Les rodes de tacs fan botar el vehicle i piquen un tambor greu; les primes l’inclinen a les corbes i xiulen en baixar la rampa; les de fusta fan toc-toc amb les claves i es belluguen. La maleta s’obre a mig camí i en salten tres pilotes que es queden a terra; els blocs del remolc salten i fan una torre al garatge; amb la bandereta, el garatge té una pancarta d’arribada i sona una campana.
- **Les llums.** L’habitació es veu de matí, tarda, capvespre i nit, una per ronda; de nit s’encén el llum de taula i la lluna surt a la finestra. A fora se senten merles al matí, el prat a la tarda i grills al vespre i a la nit (bucles de natura de la suite).
- **Panell ⓘ.** Catorze entrades: les deu peces, amb el que fa cadascuna, i les quatre hores del dia. La fitxa de la portada és una imatge (el cotxe familiar acabat al banc), com la dels viatges: three.js no pot construir l’escena mentre s’obre el menú.

## Direcció artística

- **Vinil tou.** Formes grans i arrodonides, materials mats amb una lleugera brillantor de vernís, ombres suaus i llum d’estudi. Paleta tancada de les imatges de concepte: blau 2A5BE0, corall F06A43, groc FFC81E, verd 2AA497, marina 1C2A55, crema F7EAD8, gris del xassís B8BCC9, paret A7B2F3, menta 93DFC6.
- **Cap cara.** El vidre és una sola franja fosca contínua (al cotxe fa tota la volta; a la furgoneta és un parabrisa ample; a l’autobús, una tira de finestres; al bòlid, una visera baixa) i al davant només hi ha una barra groga de para-xocs: mai dos fars rodons ni dues finestres que es llegeixin com uns ulls. Tot és geometria generada al moment: cap model ni textura externs.

## Encercament i ajustos

- Les regles de sempre: cap paraula escrita durant l’encercament (els noms de les peces són només per al lector de pantalla), ordre d’esquerra a dreta, el ressaltat clar de la suite, pista de commutador després d’una volta sense prémer, indicador d’espera.
- Ajustos nous, a la pestanya «Aquesta activitat»: tries per vehicle (2, 3 o 4), qui tria (l’alumne o «sorpresa»: l’activitat tria una peça a l’atzar), com arrenca (amb una pulsació, o sol), durada del recorregut (curt, mitjà, llarg), càmera (dinàmica o tranquil·la), qualitat del dibuix (automàtica, alta, mitjana, baixa) i garatge (sense garatge, el vehicle surt de la imatge i torna al taller de seguida).
- «Presentació del decorat»: amb el decorat atenuat, l’habitació i el taller es fonen cap al color de fons; sense decorat, desapareixen i queden el banc, la rampa, el garatge i el vehicle sobre el fons negre o blanc, amb l’ombra. Amb «Menys moviment», la clau no es gronxa, el vehicle no bota, la bandera no oneja i les peces de la safata no pugen i baixen.
- Fotosensibilitat: cap element parpelleja; l’únic ritme visual és la respiració de l’anell de l’espera (0,7 Hz), molt per sota del límit de tres canvis per segon (W3C, 2023, criteri 2.3.1).

## Música i sons (cap enregistrament nou)

- Una peça en fa major a 112 pulsacions per minut, tocada pels instruments reals de Detectius de sons (contrabaix pizzicato, piano i clarinet, de la col·lecció VSCO-2 CE). Cada peça posada afegeix un compàs amb una veu més; la volta sencera porta tota la banda; l’arribada al garatge té la seva cadència, el «clac» i la campana.
- Sons de fusta i de joguina dels bancs que ja hi havia: claves i vora de tambor, tambor greu, caixa, la tapa que s’obre i els «boings» de les pilotes, els cops dels blocs, la tela que s’infla de la bandera i la campana.

## Tècnica

- **three.js dins del fitxer únic.** La part de three.js (versió 0.187.0) que fa servir l’activitat va empaquetada amb esbuild (0.25.10) com un sol script que defineix `PP3`, en un `<script>` a part abans del mòdul de l’app, perquè three.js no es pot concatenar amb la resta (el constructor del fitxer únic treu els `import` i `export`). El fitxer construït fa 63,6 MB (0,9 MB més que la 0.52.4: three.js i les imatges del panell).
- **Dibuix.** L’escena es dibuixa amb WebGL en un canvas fora de pantalla i es copia al canvas de l’app, sota el ressaltat de l’encercament. La safata és una escena pròpia amb càmera ortogràfica en píxels, de manera que les peces queden exactament sota les zones de l’encercament. La construcció es fa en vuit passos sota la cortina de càrrega, i els shaders es compilen abans que es vegi res.
- **Qualitat.** Tres nivells (alta, mitjana, baixa: mida del dibuix 1, 0,75 i 0,55; ombres 2048, 1024 i cap). «Automàtica» comença alta i baixa si els fotogrames van lents. Sense WebGL es dibuixa una versió plana del banc i de les peces.
- Mòduls nous: `vehicles.js` (model), `vehicles-so.js` (so), `vehicles-3d.js` (escena three.js), `vehicles-art.js` (zones, còpia al canvas, versió plana); `vendor/three-taller.js` i `tools/vendor-three.mjs` (per regenerar-lo). Eines: `tools/vehicles-frames.mjs` (fotogrames), `tools/vehicles-info.mjs` (imatges del panell), `tools/vehicles-app.mjs` (el fitxer construït a Chromium). El dibuix antic d’EN07 (el cotxe pla de la primera versió) s’ha tret del codi.

## Proves

- **Automàtiques.** 10 proves noves (`tests/vehicles.test.mjs`): catàleg i carpeta, model i rondes, opcions de la safata, flux dins el motor d’encercament, temps i cronologia, sons dins l’efecte i als bancs, geometria, dibuix pla amb i sense decorat, ajustos, panell ⓘ. Suite sencera: 422 de 425 superades; les 3 que fallen ja fallaven a la 0.52.4 (fitxers de so de la masia, dels instruments gravats i de Detectius de sons a disc) i no tenen relació amb aquest canvi.
- **Al navegador (Chromium sense GPU, SwiftShader).** Des del fitxer construït: la portada, la carpeta «Encercament: triar i crear» amb la fitxa nova, el panell ⓘ, la cortina de càrrega i l’activitat sencera amb el commutador (tecla Espai): tres peces triades, l’espera amb l’anell, la pulsació que arrenca el vehicle, la rampa, la volta, el garatge i la ronda següent (tarda). Cap error de pàgina. Sense GPU, SwiftShader dibuixa un fotograma cada 0,75 s de mitjana (1280 × 720, qualitat alta), i l’app avança el rellotge com a molt 100 ms per fotograma: allà l’activitat va a una desena part de la velocitat real; amb GPU no passa.
- **No provat:** tauletes i ordinadors reals (rendiment dels tres nivells de qualitat, tacte), Safari i Firefox. Les captures de `imatges/` són a DPR 2 (interfície des del fitxer construït; moments de l’activitat des de l’eina de fotogrames, perquè SwiftShader dibuixa cada fotograma en segons).

## Per revisar (en Marc)

1. L’art de la fase 0: les peces, el taller, l’habitació, les quatre llums i les càmeres. Qualsevol canvi d’estil és millor ara, abans dels quatre racons següents.
2. Si la base agrada, les fases 1 a 4 del pla (sala, pati, passadís i bany; més rodes i accessoris; final de racó cada quatre vehicles; poliment i rendiment).
3. Quines tauletes fa servir l’escola, per ajustar els nivells de qualitat.
4. Publicar a GitHub Pages: aquesta versió només està confirmada en local, pendent de la seva paraula.

## Referències

- Cannella, H. I., O’Reilly, M. F., & Lancioni, G. E. (2005). Choice and preference assessment research with people with severe to profound developmental disabilities: A review of the literature. *Research in Developmental Disabilities, 26*(1), 1–15. https://doi.org/10.1016/j.ridd.2004.01.006 (DOI no verificat des d’aquest entorn.)
- three.js authors. (2026). *three.js* (versió r187) [Programari]. https://threejs.org
- Wallace, E. (2025). *esbuild* (versió 0.25.10) [Programari]. https://esbuild.github.io
- W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2* (W3C Recommendation, 5 d’octubre de 2023). https://www.w3.org/TR/WCAG22/

---

# Pim Pam 0.52.4 · Sense marc blau als botons tocats

Base: 0.52.3 (Gotes de pintura), que alhora parteix de la 0.52.2 (commit 1ebe3ec). Inclou la 0.52.3. Demanat per en Marc el 8 de novembre de 2026: «A les activitats que tenen un punt d'informació, si el toques durant l'activitat, tendeix a quedar marcat amb un marc blau, que no marxa fins que fas clic en un altre botó».

- **Causa (verificada al navegador).** En tancar la finestra ⓘ, el focus tornava al botó ⓘ. Quan després es premia el commutador (una tecla), Chrome passava a mostrar el focus de teclat (`:focus-visible`) i dibuixava el marc blau al voltant del botó. Reproduït amb Chromium: abans, després de tocar ⓘ, tancar i prémer Espai, el botó quedava amb `:focus-visible`; ara no.
- **Correcció.** Un botó tocat amb el dit o el ratolí deixa anar el focus després del clic (també la pausa, el so i els altres botons de l'activitat i de la portada). En tancar les finestres d'informació, d'ajustos i d'usuaris, el focus només torna al botó d'origen si s'està navegant amb el teclat (Tab). Si una tecla del commutador es prem mentre un botó té el focus sense navegació de teclat, el botó el deixa anar.
- **Accessibilitat de teclat.** Qui navega amb Tab continua veient el marc blau i, en tancar una finestra, el focus torna al botó que l'havia obert (comprovat).
- **Proves.** 412 de 415 superades; les 3 que fallen ja fallaven a la 0.52.2 (mida dels fitxers de so de la masia, dels instruments gravats i de Detectius de sons) i no tenen relació amb aquest canvi.
- **Publicació.** Es publica a GitHub Pages juntament amb la 0.52.3, que encara no s'havia publicat (Marc: «Podem publicar-ho tot junt»).


---

# Pim Pam 0.52.3 · Gotes de pintura

Base: 0.52.2. Demanat per en Marc el 8 de novembre de 2026: «M'agradaria que la activitat que has creat li canviis el nom i li posis Gotes de Pintura, i que generis un pla per aconseguir una cosa més semblant al concept art que t'he passat, que es digui Pluja de colors.»

- **Nom nou.** L’activitat del paper marbrejat es diu ara **Gotes de pintura**. Ho diu la fitxa, el panell ⓘ i la capçalera de l’activitat.
- **La resta no canvia.** El codi (CE03), l’identificador intern, els ajustos, els registres, la música i la posició (l’última de «Formes, llum i música») són els mateixos.
- **Pluja de colors.** El nom queda reservat per a l’activitat nova del concept art, que de moment és un pla: https://claude.ai/artifact/9MKi78VMWcXAXeREWt66LM

---

# Pim Pam 0.52.2 · Pluja de colors al final de la carpeta

Base: 0.52.1. Demanat per en Marc el 8 de novembre de 2026: «PUblica-ho, i posa aquesta activitat al final de la carpeta».

- **Ordre.** Pluja de colors passa a ser l’última fitxa de «Formes, llum i música», després de La cuina que balla. L’ordre queda així: Flor de paper, Caleidoscopi, Vitralls, Natura, Piromusical, Dibuixos que ballen, Joguines que ballen, La cuina que balla i Pluja de colors.
- **Text de la carpeta.** L’enumeració segueix el nou ordre: «flors de paper, patrons, vitralls, focs, dibuixos que ballen i paper marbrejat».
- **La resta no canvia.** L’activitat, els seus ajustos i el seu registre són els de la 0.52.1.
- **Publicació.** Aquesta versió es publica a GitHub Pages, juntament amb la 0.52.1, que encara no s’havia publicat.

---

# Pim Pam 0.52.1 · Pluja de colors: cada full amb els seus colors i el seu motiu

Base: 0.52 (commit aeac22e). Demanat per en Marc el 7 de novembre de 2026: «Està bé, però a pluja de colors hi hauria d'haver molta més diversitat de colors i de motius, que no hi hagi quatre dibuixos seguits amb els mateixos colors, cada dibuix ha de tenir colors diferents, no es poden repetir en cap cas. Sigues més creatiu en els colors, l'estructura per crear la pintura, i la diversitat de resultats.»

## Colors

- **Cada full té els seus colors.** A la 0.52, els quatre fulls d’un taller compartien paleta. Ara cada un dels vint fulls té dues paletes pròpies, una per a la primera volta i una altra per a la segona: 40 paletes de 3 a 5 tintes, amb la seva aigua fosca i la seva aigua clara.
- **Cap tinta es repeteix.** Les 155 tintes de les 40 paletes són totes diferents.
- **Com es mesura «diferent».** La distància entre dues paletes és la mitjana, en totes dues direccions, de la diferència de color ΔE00 de cada tinta amb la tinta més semblant de l’altra paleta (CIEDE2000; Sharma et al., 2005). Una prova automàtica comprova:
  - dos fulls seguits, també en canviar de taller i de volta: almenys 18 (el mínim real és 18,9);
  - el primer color, el que cobreix més aigua, de dos fulls seguits: almenys 25 (mínim real 27,0);
  - dues paletes qualssevol de les 40: almenys 9 (mínim real 9,5);
  - les tintes d’un mateix full entre elles: almenys 15 amb fons fosc, 12 amb fons blanc i 19 amb alt contrast.

  Els llindars són decisions de disseny, no valors de la bibliografia. Com a referència, la mateixa fórmula dona 2,04 per al primer parell de proves de Sharma et al. (2005), dos colors que gairebé no es distingeixen, i 27,1 per al parell 17.
- **Tercera volta i següents.** Per no tornar mai a la mateixa paleta, a partir de la tercera volta els colors giren el to en l’espai OKLCH (Ottosson, 2020): 60° per cada dues voltes, més 17° cada sis, amb el croma retallat perquè cap color no surti de la pantalla. Amb fulls seguits es manté una distància d’almenys 15 (mínim real 16,4), i el mateix full en dues voltes diferents es diferencia almenys 10 (mínim real 11,0).
- **Fons blanc.** Les tintes es continuen enfosquint fins a un contrast mínim de 3:1 amb l’aigua (com a la 0.52), i ara, si dues tintes queden massa semblants, una canvia de lluminositat fins que es distingeixen.
- **Alt contrast.** Hi ha 8 colors per a cada fons, i cada full en fa servir 4. El full següent en comparteix 1 com a màxim sempre que es pot, i 2 com a molt; el primer color no és mai un dels del full anterior. Tots tenen un contrast d’almenys 4,5:1 amb l’aigua (W3C, 2023).

## Motius: com es posa la tinta i com es pentina

Cada full té ara la seva manera de posar la tinta i el seu gest. No hi ha dues receptes iguals.

| Taller | Full | Com cau la tinta | Gest |
|---|---|---|---|
| Barcelona | Turc | pedres grans i moltes de petites; el segon color fa vetes entre les pedres | punxó en diagonal |
| | Espanyol | pedres de dos colors | un buf que fa ones fines en diagonal |
| | Pentinat | franges verticals (línies de tinta que s’eixamplen) | punxó amunt i avall i pinta fina |
| | Cua de paó | escaquer de dos colors | punxó, pinta fina i pinta d’ones |
| Istanbul | Pedres amb vora | pedres de tres colors amb vora fosca | un traç lliure en essa |
| | Anada i tornada | files de gotes en diagonal | punxó amunt i avall |
| | **Cadena de cors** (nou) | quatre dianes en filera | un sol traç pel mig: cada diana es torna un cor |
| | Tulipa | un marc de pedres i gotes grans al mig | tulipa feta amb el punxó |
| Kyoto | Anells | pocs centres d’anells | ventall |
| | Ventall | tres centres de dos colors | dos bufs |
| | Ondulació | centres en diagonal | una ona lenta |
| | **Roda** (abans «Ombra doble») | un sol centre gran de tres colors | voltes del punxó, cada vegada en sentit contrari |
| París | Rodet francès | files encavalcades de tres colors | pinta fina i caragols |
| | Ram | files ondulades | punxó, pinta fina i pinta d’ones |
| | **Estel** (abans «Plomes») | una diana enorme | dotze raigs del centre enfora i després endins |
| | Rosa | una corona de gotes al voltant del centre | rosa feta amb el punxó |
| Nuremberg | Holandès antic | files de colors alterns | punxó, pinta i una altra pinta de través |
| | Ziga-zaga | franges de quatre colors | ziga-zaga de punta a punta |
| | Espiral | gotes en espiral | voltes del punxó |
| | Remolí | dues dianes | tres remolins |

- **Noms nous.** «Cadena de cors», «Roda» i «Estel» són descripcions, no noms tradicionals. «Onades» (Istanbul) deixa lloc a la Cadena de cors.
- **Eines noves del marbrejat:**
  - **Franja.** Una línia de tinta que s’eixampla i aparta l’aigua cap als dos costats. Segueix el mateix principi que la gota de Lu et al. (2012): la tinta només es desplaça, i l’àrea es conserva. És una extensió nostra, no una fórmula de l’article. Les franges fan els fulls Pentinat i Ziga-zaga.
  - **Ones inclinades i ziga-zaga.** El ventall pot bufar en qualsevol direcció, i l’ona pot ser arrodonida o en ziga-zaga.
  - **Pinta en qualsevol direcció** i **traç lliure** del punxó (l’essa de Pedres amb vora i el traç de la Cadena de cors).
- **El segon color** pot caure dins de les primeres gotes (anells), sobre els mateixos centres (dianes) o entre les pedres (vetes).

## Les gotes i les notes

- La sincronia de la 0.52 es manté: la primera gota de cada nota cau exactament sobre la nota, i les altres la segueixen en 45 ms o menys (ITU-R, 1998). Les franges també cauen sobre la seva nota.
- La prova automàtica ara repassa els vint fulls amb pintes i amb flors, i també amb gotes mitjanes i petites.

## A l’aplicació

- **Fitxa.** La imatge de la fitxa és ara la Cadena de cors, que es reconeix millor en petit.
- **Informació (ⓘ).** Els vint textos i les vint imatges són nous: què es veu, com es fa i, quan hi és, el taller i la música.
- **Música.** No canvia: cada taller conserva la seva tonalitat, el seu compàs i els seus instruments. No s’ha afegit cap so.
- **Fluïdesa.** Mesurat dins l’HTML, sense targeta gràfica, a 1280×720 i DPR 2: gest 31,5 ms de mitjana, espera 16,4 ms, estampa 35,1 ms; semblant a la 0.52.
- **Fotosensibilitat.** No hi ha cap flaix nou; els canvis continuen sent lents. L’auditoria de flaixos la fas tu.

## Proves

- `tests/marbre.test.mjs` (8 proves): s’hi afegeix la prova de les paletes (cap tinta repetida, les distàncies, les voltes girades i els conjunts d’alt contrast). Les altres comproven ara també que cada full té disposició, colors i paletes propis, que hi ha vint receptes diferents, almenys deu disposicions i dotze gestos, i que la franja i l’ona inclinada conserven l’àrea.
- **Resultat:** 412 de 415 proves superades. Les 3 que fallen són les mateixes de la 0.52: «masia», «instruments enregistrats» i «Detectius de sons».
- **Prova al navegador** (1280×720, DPR 2, sense errors a la consola): la portada, la carpeta, la fitxa, el panell ⓘ, un full sencer amb l’estampa i l’estenedor, i el full següent.
- **Revisades amb fulls de contacte** (els vint fulls): primera, segona i tercera volta, fons blanc, alt contrast, gotes petites i mitjanes, i 7 passos amb flors.

## Referències

International Telecommunication Union, Radiocommunication Sector. (1998). *Relative timing of sound and vision for broadcasting* (Recommendation ITU-R BT.1359-1). https://www.itu.int/rec/R-REC-BT.1359

Lu, S., Jaffer, A., Jin, X., Zhao, H., & Mao, X. (2012). Mathematical marbling. *IEEE Computer Graphics and Applications, 32*(6), 26–35. https://doi.org/10.1109/MCG.2011.51

Ottosson, B. (2020, 23 de desembre). *A perceptual color space for image processing* [Entrada de blog]. https://bottosson.github.io/posts/oklab/

Sharma, G., Wu, W., & Dalal, E. N. (2005). The CIEDE2000 color-difference formula: Implementation notes, supplementary test data, and mathematical observations. *Color Research & Application, 30*(1), 21–30. https://doi.org/10.1002/col.20070

W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2* (Recomanació del W3C, 5 d’octubre de 2023). https://www.w3.org/TR/WCAG22/

OKLCH no és un estàndard revisat per experts: és una font tècnica, i aquí només serveix per girar els tons. La comprovació de les diferències es fa amb CIEDE2000. Els colors, els motius i els llindars són decisions de disseny.

---

# Pim Pam 0.52 · La nova Pluja de colors

Base: 0.51 (commit 546e7ac). Demanat per en Marc el 7 de novembre de 2026. A les 21:33 va demanar el pla de la següent activitat de «Per revisar»: «Analitza-la i proposa com la refaries, partint del mateix concepte». A les 21:58 el va aprovar: «D'acord, ja pots començar a programar la pluja de colors, una part molt bonica de l'activitat original era la sincronia entre les gotes i les notes, mira de mantenir-ho». Pla: «Pla: la nova Pluja de colors» (https://claude.ai/artifact/DtFkbsTE4gUZ2P1DCAcsMo), amb les cinc recomanacions acceptades.

Pluja de colors (CE03, id `color-rain`) es refà de cap a peus com un **taller de paper marbrejat**. La pantalla sencera és una cubeta d’aigua vista des de dalt. Cada pulsació hi fa ploure color, el color s’eixampla i es pentina, i a l’últim pas un full de paper s’emporta l’estampa i es penja a l’estenedor. Conserva el nom, el codi i l’identificador, de manera que els registres dels usuaris continuen servint.

## Com es juga

- **Cada pulsació és un pas del full.** Per defecte, un full té cinc passos:
  1. **La primera pluja.** Del pinzell cauen gotes del primer color, que s’obren i s’ajunten en pedres de color.
  2. **El segon color.** Les gotes cauen dins de les primeres i fan anells.
  3. **La pluja fina.** El pinzell es pica contra una vareta i esquitxa tot el bany d’un tercer color.
  4. **El gest.** El punxó, la pinta o el ventall travessen el bany i fan el patró propi d’aquell full.
  5. **L’estampa.** Un full de paper baixa, es mulla, s’aixeca i ensenya l’estampa. Després es penja a l’estenedor de dalt, i una tira de paper neteja el bany per al full següent.
- **Tallers.** Cada quatre fulls canvia el taller: el decorat, els colors, les eines i la música. Després dels vint fulls torna el primer taller, amb la segona paleta de cada taller i els gestos en mirall.
- **Espera.** Amb «Espera que acabi cada efecte» (com a la resta de la col·lecció), les pulsacions mentre un pas es mou no fan res. Sense aquest ajust, una pulsació acaba el pas de cop i comença el següent. L’estampa sempre s’acaba sencera. Quan el bany espera, l’escena s’atura i s’enfosqueix.
- **Ajustos de l’activitat** (pestanya «Aquesta activitat»):
  - «Passos de cada full» (3, 5 o 7). L’últim pas sempre és l’estampa. Amb 7 passos hi ha un segon gest i una flor feta amb el punxó.
  - «Gestos»: només gotes (anells i pluges, sense pintes), gotes i pintes (per defecte) o complet, amb flors.
  - «Mida de les gotes» (grans, mitjanes o petites).
  - «Colors»: els de cada taller o alt contrast.
  - «Primer taller». Si es canvia amb l’activitat oberta, comença de nou.
  - «Estenedor». Si es desactiva, els fulls acabats no es pengen.
- **Moviment reduït.** Amb l’ajust general de moviment reduït, les gotes no cauen per l’aire: cadascuna creix al punt on toca l’aigua, sobre la seva nota. La brillantor de l’aigua queda quieta.

## Les gotes i les notes

En Marc va demanar de mantenir la sincronia entre les gotes i les notes de l’activitat original.

- **Cada gota toca l’aigua exactament sobre una nota de la música.** La música de cada pas s’escriu primer: un arpegi, el baix i, en alguns passos, la melodia. Cada gota es programa a l’instant d’una nota de l’arpegi.
- **La caiguda.** Es veu la gota caure del pinzell durant 0,32 s, i toca l’aigua just en el moment de la nota.
- **Grups de gotes.** Quan cauen diverses gotes alhora, la primera cau sobre la nota i les altres la segueixen en 45 ms o menys. Per sota d’aquest marge, un so que arriba abans de la seva imatge encara no es nota (ITU-R, 1998). La pluja fina segueix les notes ràpides del glockenspiel o de la marimba.
- **Com es programa el so.** Les notes es donen a l’àudio fins a mig segon abans, amb el retard exacte. Es descompta el retard de sortida de l’altaveu de l’aparell (sovint de 10 a 40 ms), perquè la nota se senti en el moment en què la gota toca l’aigua.
- **Gestos.** Quan passa el punxó o la pinta, sona una escala que segueix la velocitat de l’eina.
- **Prova automàtica.** Comprova a tots els tallers, a tots els passos i amb tots els gestos que cada gota cau sobre la seva nota.

## Els vint fulls

| Taller | Decorat | Fulls |
|---|---|---|
| Barcelona | taller d’enquadernació: prestatges de llibres | Turc, Espanyol, Pentinat, Cua de paó |
| Istanbul | taller d’ebru: paret de rajoles | Pedres amb vora, Anada i tornada, Onades, Tulipa |
| Kyoto | taller de suminagashi: mampara de paper amb muntants de fusta | Anells, Ventall, Ondulació, Ombra doble |
| París | taller de la claraboia: la llum de dalt i els tinters | Rodet francès, Ram, Plomes, Rosa |
| Nuremberg | taller de l’impressor: taulons de fusta i pintes penjades | Holandès antic, Ziga-zaga, Espiral, Remolí |

- **Patrons europeus.** Turc, Espanyol, Pentinat, Rodet francès, Cua de paó, Ram i Holandès antic són patrons europeus classificats a la bibliografia. El Turc n’és el més antic (University of Washington Libraries, s. d.-b).
- **Kyoto.** Els anells del suminagashi es fan alternant tinta i aigua, i es deformen bufant o ventant (Carey, 2014). Per això a Kyoto no hi ha pinta.
- **Noms descriptius.** Pedres amb vora, Onades, Ziga-zaga, Remolí i les flors són descripcions, no noms tradicionals.
- **Flors.** Cada taller té la seva flor feta amb el punxó (cor, tulipa, crisantem, rosa i estrella), que surt amb 7 passos o amb «Complet, amb flors».

## Tècnica, material i aspecte

- **Marbrejat matemàtic.** La tècnica és nova a la col·lecció. Cada gota i cada traç és una funció exacta que mou tots els punts de la tinta (Lu et al., 2012; Jaffer, 2010, 2017). La tinta no es crea ni es perd: només es desplaça. Per això té l’aspecte del marbrejat de veritat.
  - **Gota** de radi r al punt C: P′ = C + (P − C)·√(1 + r²/|P − C|²).
  - **Punxó o pua d’una pinta**: P′ = P + z·u^d·M.
  - **Traç circular**: gira cada punt un angle z·u^d/|P − C|. Amb radi zero és un remolí. Si l’angle només depèn de la distància al centre, l’àrea també es conserva, i així surten l’espiral i els remolins.
  - **Ventall**: una ona que fa lliscar les files o les columnes de tinta.
- **Polígons.** La tinta és una llista de polígons, un per gota. Abans de cada traç es tallen en dos les vores que el traç estiraria massa, de manera que les corbes es mantenen suaus. La tinta té com a màxim 90.000 vèrtexs, i la que surt del bany es descarta.
- **Àrea.** Les proves comproven que una gota, un punxó i un remolí conserven l’àrea de la tinta del voltant (amb un marge de l’1 al 2 %).
- **Materials:**
  - La tinta té una vora més fosca, que fa de contorn fosc de cada color.
  - L’aigua és llisa i té una brillantor humida que es desplaça molt a poc a poc.
  - L’estampa és mat, en paper amb fibra i vora irregular, i es penja amb pinces de fusta.
- **Eines.** El pinzell, la vareta, el punxó, la pinta i el ventall tenen contorn fosc.
- **Decorat.** Cada taller té la seva paret i la cubeta de fusta. Amb decorat complet es veu el taller als marges; amb decorat atenuat, queda sota el vel; sense decorat, només hi ha la tinta sobre el fons negre o blanc.
- **Contrast.** Amb fons blanc, les tintes clares passen a ser gairebé negres i les altres s’enfosqueixen fins a tenir un contrast d’almenys 3:1 amb l’aigua. L’alt contrast és d’almenys 4,5:1 (W3C, 2023). Ho comprova una prova automàtica.
- **Fotosensibilitat.** No hi ha cap flaix. Tots els canvis són lents: una gota s’obre en 0,9 s, i el canvi de taller és un fos d’1,8 s. L’auditoria de flaixos la fas tu.

## Música i sons

| Taller | Tonalitat i compàs | Instruments (arpegi · baix · melodia · pluja fina · gest · cadència · percussió) |
|---|---|---|
| Barcelona | la major, 3/4 | guitarra · contrabaix · clarinet · violins pizzicato · arpa · arpa · pandereta |
| Istanbul | re *hijaz*, 9/8 | arpa · udu · oboè · arpa · arpa · arpa · tambor |
| Kyoto | mi, escala *in*, 4/4 | arpa · arpa · marimba · marimba · arpa · arpa · claves |
| París | fa major, 3/4 | piano · violoncels pizzicato · violins pizzicato · glockenspiel · piano · arpa · triangle |
| Nuremberg | sol major, 2/4 | marimba · fagot · flauta · glockenspiel · marimba · marimba · claves |

- **La peça creix amb el full.**
  - La primera pluja porta l’arpegi i el baix.
  - El segon color hi afegeix la melodia.
  - La pluja fina és una escala ràpida que cau amb les gotes.
  - El gest és una escala que segueix l’eina, amb la percussió.
  - L’estampa fa sonar la melodia sencera i acaba en una cadència d’arpa, pinçada o percudida, que s’apaga sola.
- **Sense notes aguantades.** No hi ha cap orgue, coixí ni cor, i totes les notes s’acaben.
- **Sons:**
  - la gota que cau a l’aigua i el pinzell contra la vareta (`pintaRec`);
  - el punxó i la pinta a l’aigua (`pouRec`) i el ventall (`sabanaRec`);
  - el paper que llisca i el full que es mulla (`sabanaRec`, `pintaRec`);
  - el paper que es desenganxa i les pinces (`masiaRec`);
  - l’aigua que es mou quan s’aixeca el paper (`pouRec`).
- **L’aire de cada taller** sona fluix i baixa quan el bany espera: cigales a Barcelona, un rierol a Istanbul, vent a Kyoto, coloms a París i un molí a Nuremberg.
- **Origen dels sons.** Tot són sons que la suite ja tenia (`CREDITS.md`). **No s’ha afegit cap so nou.** El pla en preveia tres (pinzell, pinta i paper mullat); es fan amb els bancs que ja hi havia.

## A l’aplicació

- **Carpeta.** Passa de «Per revisar» a «Formes, llum i música», com a segona fitxa, després de la Flor de paper. «Per revisar» queda amb Bombolles, Pluja musical, Vestidor i Vehicles.
- **Fitxa.** Té un text nou i una imatge nova (la Cua de paó de Barcelona).
- **Informació (ⓘ).** Panell nou amb els vint fulls: una imatge de cadascun i fins a tres línies sobre com es fa el patró, el taller i la música.
- **Codi retirat.** S’han retirat el codi antic de les vint composicions (`PC_PATTERNS`, els dibuixos i la música amb coixins).
- **Fluïdesa.** Mesurat dins l’HTML en aquesta màquina, que no té targeta gràfica, a 1280×720 i DPR 2. Mitjana de fotograma:
  - pluja: 27–29 ms;
  - anells: 23–28 ms;
  - pluja fina: 32–43 ms;
  - gest: 41–43 ms;
  - espera: 21 ms;
  - estampa: 26–36 ms.

  Quan res no es mou, el bany és una làmina desada. Amb targeta gràfica hauria d’anar més de pressa, però no s’ha pogut mesurar aquí.

## Proves

- `tests/marbre.test.mjs` (7 proves noves):
  - la tinta conserva l’àrea;
  - cinc tallers i vint fulls, amb instruments reals;
  - cada gota cau sobre la seva nota a tots els tallers i passos;
  - els plans de 3, 5 i 7 passos, i l’espera;
  - l’estampa i l’estenedor;
  - la volta pels vint fulls i la segona paleta;
  - el contrast dels colors amb tots dos fons;
  - tots els sons existeixen als bancs.
- `tests/activities.test.mjs`, `tests/integration.test.mjs` i `tests/info.test.mjs`, actualitzades.
- **Resultat:** 411 de 414 proves superades. Les 3 que fallen són límits de mida antics, que ja fallaven a la 0.51: «masia», «instruments enregistrats» i «Detectius de sons».
- **Prova al navegador** (1280×720, DPR 2, sense errors a la consola): la portada, la carpeta, la fitxa, el panell ⓘ, un full sencer de cinc passos amb l’estampa i l’estenedor, el full següent i els ajustos.
- **Revisades amb fotogrames:**
  - els vint fulls;
  - Kyoto;
  - fons blanc i negre;
  - decorat complet, atenuat i sense decorat;
  - colors d’alt contrast;
  - els gestos amb flors.
- **Eines:**
  - `tools/marbre-frames.mjs` (fotogrames i temps de dibuix);
  - `tools/marbre-info.mjs` (imatges del panell ⓘ i de la fitxa);
  - `tools/marbre-app.mjs` (prova dins l’HTML, amb temps de fotograma).

## Referències

Carey, J. (2014, 27 d’agost). *Playing with paper: Suminagashi and orizome*. The Metropolitan Museum of Art. https://www.metmuseum.org/en/perspectives/playing-with-paper

International Telecommunication Union, Radiocommunication Sector. (1998). *Relative timing of sound and vision for broadcasting* (Recommendation ITU-R BT.1359-1). https://www.itu.int/rec/R-REC-BT.1359

Jaffer, A. (2010). *Dropping paint*. Mathematical Marbling. https://people.csail.mit.edu/jaffer/Marbling/Dropping-Paint

Jaffer, A. (2017). *The mathematics of marbling*. Mathematical Marbling. https://people.csail.mit.edu/jaffer/Marbling/Mathematics

Lu, S., Jaffer, A., Jin, X., Zhao, H., & Mao, X. (2012). Mathematical marbling. *IEEE Computer Graphics and Applications, 32*(6), 26–35. https://doi.org/10.1109/MCG.2011.51

UNESCO. (2014). *Ebru, Turkish art of marbling* (Llista representativa del patrimoni cultural immaterial, decisió 9.COM 10.44). https://ich.unesco.org/en/RL/ebru-turkish-art-of-marbling-00644

University of Washington Libraries. (s. d.-b). *Paper patterns*. Decorated and Decorative Paper Collection. https://content.lib.washington.edu/dpweb/patterns.html

W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2* (Recomanació del W3C, 5 d’octubre de 2023). https://www.w3.org/TR/WCAG22/

**Al panell ⓘ:**
- l’ebru és patrimoni cultural immaterial de la UNESCO des del 2014 (UNESCO, 2014);
- al Japó es conserven papers de suminagashi del segle XII (Carey, 2014);
- el Turc és el patró europeu més antic (University of Washington Libraries, s. d.-b);

Les altres línies del panell descriuen el que es veu. La música, els colors i les eines són decisions de disseny, no reconstruccions històriques.

---

# Pim Pam 0.51 · La nova Flor de paper

Base: 0.50.6 (commit f75740e). Demanat per en Marc el 7 de novembre de 2026: «Elabora un pla per refer Flor de paper, amb el mateix concepte, però molt més elaborat i bonic, generant flors de paper que s'obren sobre un fons negre, i que quan estan obertes tenyeixen el seu entorn dels seus colors, fes flors de diferents tipus que es basin en flors reals. Elabora també un univers musical per aquestes flors. Potser hi pots afegir sons de natura al voltant de les flors.» Pla aprovat el mateix dia: «D'acord, ja el pots tirar endavant, amb totes les teves recomanacions. Recorda que ha de quedar preciós.» El pla és a https://claude.ai/artifact/KQ4sNMgoqt42oHWqkQxuYt.

Flor de paper (CE02, id `flower`) es refà de cap a peus. Conserva el codi i el concepte: cada pulsació obre una flor de paper sobre el negre.

## Com es juga

- **Jardí que creix** (per defecte). Cada jardí té quatre flors. Cada pulsació n’obre una, i la flor es queda oberta.
  - Una flor tarda 9 s a obrir-se: la poncella es desperta, els pètals s’obren com s’obre aquella flor de debò, la seva llum s’escampa pel jardí i arriba un petit visitant.
  - La cinquena pulsació encén el jardí sencer amb la seva música (12 s, acaba amb un acord pinçat que s’apaga). Després el jardí es plega i arriba el següent.
  - Després del cinquè jardí torna el primer, a l’inrevés i amb els colors d’una varietat real de cada flor.
- **Una flor cada vegada** (ajust). Una flor gran a cada pulsació, a prop del centre; l’anterior es plega. Passa per les vint flors en ordre.
- **Ajustos de l’activitat** (pestanya «Aquesta activitat»):
  - «Com s’obren les flors»;
  - «Flors de cada jardí» (4, 3 o 2);
  - «Durada de l’obertura» (6, 9 o 13 s);
  - «Primer jardí»;
  - «Color a l’entorn» (suau, mitjà o intens);
  - «Petits visitants» i «Sons de natura».
  - Si es canvia el mode o el primer jardí amb l’activitat oberta, comença de nou.
- **Espera.** Amb «Espera que acabi cada efecte», les pulsacions mentre una flor s’obre no fan res. Sense, una pulsació acaba la flor de cop i obre la següent. Quan el jardí espera, l’escena s’atura i s’enfosqueix, com a la resta de la col·lecció.

## Les vint flors

Totes són flors reals, fetes de paper. Cada jardí té una tècnica de paper pròpia: paper crespó, paper de seda, cartolina plegada o paper d’aquarel·la.

| Jardí | Llum i paper | Flors (i el seu visitant) |
|---|---|---|
| El prat | matí d’estiu · crespó | rosella (abella), margarida (papallona blanca), gira-sol (borinot), blauet (marieta) |
| L’estany | alba · seda | nenúfar blanc (libèl·lula), lotus (granota), lliri groc (cavall de serp), cala (gotes) |
| El bosc | tarda · cartolina | didalera (borinot), ciclamen (cargol), violeta (papallona bruna), peònia (merla) |
| El jardí de nit | lluna · seda | flor de lluna (arna), lliri blanc (cuques de llum), camèlia (cuques de llum), gessamí (cuques de llum) |
| L’hivernacle | pluja càlida · aquarel·la | orquídia (papallona blava), hibisc (colibrí), passiflora (abella fustera), ocell del paradís (gotes) |

- **Com s’obren.** Cada flor s’obre segons la seva forma real:
  - la rosella s’adreça i deixa caure els sèpals;
  - la margarida i el gira-sol obren les lígules en espiral;
  - la didalera obre les campanes de baix a dalt;
  - la flor de lluna es desplega girant com un paraigua;
  - les vores dels tèpals del lliri creixen més que el mig, i per això s’onegen i es giren enrere (Liang i Mahadevan, 2011);
  - el gessamí obre les estrelles una darrere l’altra;
  - l’ocell del paradís treu els sèpals del bec.

  Les obertures segueixen el que se sap del creixement dels pètals (van Doorn i van Meeteren, 2003; van Doorn i Kamdee, 2014).
- **Detalls reals:**
  - el cap del gira-sol té 300 floretes en espirals de Fibonacci (Swinton et al., 2016);
  - el lotus té el receptacle amb forats;
  - la passiflora té la corona de filaments i les cinc anteres;
  - el ciclamen té les fulles en cor amb taques platejades.
- **Visitants.** Són petits, lluny i sense cara. Arriben quan la flor ja és oberta i es posen al costat de la flor, no a sobre.

## La llum que tenyeix l’entorn

- **El fons.** Darrere les flors hi ha una paret de paper pròpia de cada jardí: l’herba i les flors petites del prat, l’aigua de l’estany, els troncs del bosc, la lluna del jardí de nit, els vidres i els testos de l’hivernacle.
- **Com s’encén.** La paret és fosca fins que s’obre una flor. La llum de la flor s’escampa a poc a poc (uns 6 s amb l’obertura mitjana) i tenyeix la paret dels colors de la flor: una llum principal i dues o tres taques dels seus colors al voltant.
- **El final.** Llums de colors recorren tot el jardí.
- **Sense decorat.** La llum només envolta la flor.

## Música i sons

- **Una peça per jardí.** Cada jardí té la seva peça, amb una tonalitat, un mode, un tempo i un compàs propis:
  - el prat: re major, 6/8;
  - l’estany: fa lidi, 3/4;
  - el bosc: la dòric, 4/4;
  - el jardí de nit: mi pentatònic;
  - l’hivernacle: sol mixolidi.
- **La peça creix flor a flor.** Cada flor hi afegeix una veu quan la seva llum comença a escampar-se.
  - Prat: guitarra, flauta, violins en pizzicato, glockenspiel.
  - Estany: arpa, vibràfon, clarinet, violoncels en pizzicato.
  - Bosc: marimba, oboè, violoncels en pizzicato, fagot.
  - Nit: piano, kalimba, glockenspiel, arpa.
  - Hivernacle: marimba, udu, kalimba, flauta.
- **Altres moments musicals:**
  - Cada obertura té un motiu que puja amb els pètals.
  - Quan la llum s’escampa, sona una escala ràpida d’arpa.
  - Un jardí nou arriba amb una salutació de kalimba.
  - Quan el jardí espera, la música s’aprima i s’atura.
- **Sense notes aguantades.** No hi ha cap orgue ni cap pad, i totes les notes s’acaben.
- **Sons de natura i de paper.**
  - Cada jardí té els seus sons de natura (prat i cigales, llacuna i rierol, bosc i vent, nit i grills, pluja i gotes). Pugen a mesura que s’obren flors i baixen quan el jardí espera.
  - El paper sona quan es desplega.
  - Els visitants tenen veu: les abelles, la granota, el colibrí, les gotes i el cant de la merla.
- **Origen dels sons.** Tot són sons que la suite ja tenia (`CREDITS.md`). **No s’ha afegit cap so nou.** El pla en preveia tres (borinot, paper crespó i paper de seda). En lloc d’això:
  - el borinot i l’abella fustera són l’enregistrament de les abelles, més lent i més greu;
  - el paper és el de Sabana de paper.

## A l’aplicació

- **Carpeta.** Passa de «Per revisar» a «Formes, llum i música», com a primera fitxa. La fitxa té un text nou i més curt, i una imatge nova del prat amb tres flors obertes.
- **Informació (ⓘ).** Panell nou amb les vint flors: una imatge i fins a tres línies sobre com és cada flor, com s’obre i qui la visita.
- **Pàgina principal.** La imatge de la portada és ara el prat nou, amb la rosella, la margarida i el gira-sol oberts. Abans es redibuixava cada dos fotogrames; ara es dibuixa una sola vegada per a cada mida de la finestra.
- **Fluïdesa.** Mesurat en aquesta màquina, que no té targeta gràfica, a 1280×720 i DPR 2. Una flor quieta (poncella o oberta del tot) es dibuixa una sola vegada en una làmina, que es copia a cada fotograma; només es dibuixa pètal a pètal la flor que s’obre. El decorat il·luminat també és una làmina, que només es torna a dibuixar quan la llum canvia (com a màxim 30 vegades per segon, 15 al final del jardí). A l’app, el temps mitjà per fotograma d’un jardí sencer baixa de 112 ms a 27 ms. Amb una targeta gràfica hauria de ser molt menys.
- **Llum quieta.** Per poder fer servir la làmina del decorat, les taques de llum ja no giren lentament: quan el jardí espera, la llum és quieta.

## Proves

- `tests/flor.test.mjs` (12 proves noves):
  - vint espècies, quatre per jardí;
  - les pulsacions, el final i el canvi de jardí;
  - les pulsacions sense espera;
  - dues o tres flors per jardí;
  - la llum, que s’escampa a poc a poc;
  - les vint flors en ordre en el mode «Una flor cada vegada»;
  - cap valor que no sigui un número a cap jardí ni a cap mida;
  - les notes dins del registre de cada instrument;
  - els motius que pugen;
  - un final pinçat;
  - tots els sons a la col·lecció.
- `tests/activities.test.mjs` i `tests/info.test.mjs`, actualitzades.
- **Resultat:** 404 de 407 proves superades. Les 3 que fallen són límits de mida antics, que ja fallaven a la 0.50.6: «masia», «instruments enregistrats» i «Detectius de sons».
- **Prova al navegador** (1280×720, DPR 2, sense errors a la consola):
  - la portada;
  - la carpeta;
  - un jardí sencer;
  - el panell ⓘ;
  - el mode «Una flor cada vegada»;
  - els cinc jardins, amb decorat complet, atenuat i sense decorat, i amb base blanca i negra.
- **Eines:** `tools/flor-frames.mjs` (fotogrames i temps de dibuix) i `tools/flor-info.mjs` (imatges del panell ⓘ i de la fitxa).

## Referències

Atamian, H. S., Creux, N. M., Brown, E. A., Garner, A. G., Blackman, B. K., & Harmer, S. L. (2016). Circadian regulation of sunflower heliotropism, floral orientation, and pollinator visits. *Science, 353*(6299), 587–590. https://doi.org/10.1126/science.aaf9793

Barthlott, W., & Neinhuis, C. (1997). Purity of the sacred lotus, or escape from contamination in biological surfaces. *Planta, 202*(1), 1–8. https://doi.org/10.1007/s004250050096

Liang, H., & Mahadevan, L. (2011). Growth, geometry, and mechanics of a blooming lily. *Proceedings of the National Academy of Sciences, 108*(14), 5516–5521. https://doi.org/10.1073/pnas.1007808108

Swinton, J., Ochu, E., & The MSI Turing’s Sunflower Consortium. (2016). Novel Fibonacci and non-Fibonacci structure in the sunflower: Results of a citizen science experiment. *Royal Society Open Science, 3*(5), 160091. https://doi.org/10.1098/rsos.160091

van Doorn, W. G., & Kamdee, C. (2014). Flower opening and closure: An update. *Journal of Experimental Botany, 65*(20), 5749–5757. https://doi.org/10.1093/jxb/eru327

van Doorn, W. G., & van Meeteren, U. (2003). Flower opening and closure: A review. *Journal of Experimental Botany, 54*(389), 1801–1812. https://doi.org/10.1093/jxb/erg213

Al panell ⓘ: el gira-sol jove segueix el sol i, de gran, queda mirant a l’est (Atamian et al., 2016); l’aigua rellisca per les fulles del lotus i les deixa netes (Barthlott i Neinhuis, 1997). La resta de línies del panell són descripcions de la forma de cada flor. La música, els colors de la llum i els visitants són criteris de disseny, no afirmacions científiques.

---

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

