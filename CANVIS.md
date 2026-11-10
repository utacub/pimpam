# Pim Pam 0.67 · Bombolles sense pes: el «Ferrofluid» simulat de debò

Base: 0.66 (commit a0b37ca, publicada). Continua la petició d’en Marc del 10 de novembre de 2026 a les 8:26 (hora de Catalunya): les matèries s’han de comportar «com a fluids d’acord amb les lleis de la física».

## Què canvia

- **«Ferrofluid», refet com a simulació.** Un líquid ple d’imants minúsculs, més dens que l’aire i amb tensió superficial, reposa en una safata just sota la pantalla, dins d’una bobina. Cada pulsació hi fa passar més corrent, i el camp travessa el líquid cap amunt. El líquid s’imanta (μ = 1 + χ) i alhora canvia el camp: on la superfície fa un bony, el camp s’hi concentra i l’estira més. Per sobre d’un camp crític la superfície plana deixa de ser estable i s’aixeca en una filera de punxes, tan separades com diuen les equacions (la inestabilitat de camp normal de Cowley i Rosensweig, 1967); com més camp, més altes i més esmolades. No es dibuixa res: és el simulador de líquids amb la gravetat i la força magnètica −½ H² ∇μ a la superfície (la força de Korteweg–Helmholtz per a un fluid que s’imanta en proporció al camp; Rosensweig, 1985), i el camp es calcula a cada pas a partir de ∇·(μ∇ψ) = 0 per al líquid tal com és en aquell moment. On surten les primeres punxes ho decideixen uns bonys d’una cel·la a la superfície quan s’aboca el líquid. A la sortida s’apaga la bobina i les punxes tornen a caure a la safata, sota la pantalla.
- **Les fases:** la primera pulsació posa el camp a 1,3 vegades el crític (surten punxes baixes en un parell de segons), cada pulsació següent el puja, i al moment ple arriba a 1,85 vegades: les punxes arriben gairebé a dalt de la pantalla i de la punta se’n poden desprendre gotes.
- **El simulador** guanya el camp magnètic d’un líquid imantable (resolt amb sobrerelaxació vermell-negre a cada pas, partint del pas anterior) i la gravetat sense camp de temperatura. La força magnètica només actua a la superfície: dins el líquid, a prop d’un imant fort, les petites ondulacions de la xarxa feien créixer una inestabilitat numèrica.
- **Validat** (`tools/bombolles-lbm-proves.mjs`): un cilindre de líquid en un camp uniforme té a dins el camp exacte 2H0/(1 + μ) amb un error del 0,3 % (χ = 1) i de l’1,3 % (χ = 2), i fora, sobre l’eix, el camp exacte amb un error de menys del 0,3 %. Una capa plana amb una ondulació de la longitud d’ona crítica es manté estable a 0,8 i 0,9 vegades el camp crític de Cowley i Rosensweig, creix poc a 1,0 i creix clarament a 1,1 i 1,25: el llindar de la simulació cau entre 0,9 i 1,0 vegades el teòric.
- **Escales triades** (criteri, declarat al codi): el líquid és 10 vegades més dens que l’aire (un de real, unes 1000), χ = 2 (un ferrofluid fort) i les punxes queden a unes 45 cel·les l’una de l’altra (quatre o cinc a l’amplada de la pantalla).
- **So:** la música es manté; una gota que es desprèn d’una punta fa una nota de glockenspiel i, quan torna a caure, un degoteig suau enregistrat. El text d’estat ara diu «punxes d’un líquid magnètic».
- **Comprovat** amb el processador (Chromium amb SwiftShader), fotograma a fotograma a temps real: punxes visibles uns 2 segons després de la primera pulsació, punxes que arriben gairebé a dalt al moment ple, i la sortida, que deixa la pantalla negra. Dins l’app: la llista d’ajustos, els textos d’estat i 92 notes, sense errors. Amb el processador la simulació va més lenta que el temps real; per això ara el corrent de la bobina segueix el temps de la simulació i no el del rellotge, perquè una targeta lenta vegi el mateix que una de ràpida (comprovat després d’aquest canvi només amb la simulació, no dins l’app).
- **No comprovat:** l’aspecte i la fluïdesa amb una targeta gràfica real, i l’auditoria de flaixos.

## Referències

Cowley, M. D., & Rosensweig, R. E. (1967). The interfacial stability of a ferromagnetic fluid. *Journal of Fluid Mechanics, 30*(4), 671–688. https://doi.org/10.1017/S0022112067001697

Rosensweig, R. E. (1985). *Ferrohydrodynamics*. Cambridge University Press.

# Pim Pam 0.66 · Bombolles sense pes: «Anells de fum» simulats de debò

Base: 0.65 (commit d547bb3, publicada). Continua la petició d’en Marc del 10 de novembre de 2026 a les 8:26 (hora de Catalunya): les matèries s’han de comportar «com a fluids d’acord amb les lleis de la física».

## Què canvia

- **«Anells de fum», refets com a simulació.** Cada pulsació és una bufada: un pistó empeny l’aire per una escletxa de fora de la pantalla durant mig segon, amb fum de color. Els cantons de l’escletxa deixen anar vorticitat, que s’enrotlla en dos remolins que giren al revés l’un de l’altre (el tall d’un anell de fum pel mig). Aquest parell s’emporta el fum i avança tot sol, i es va alentint a mesura que la viscositat l’eixampla (Saffman, 1992; Gharib, Rambod i Shariff, 1998). No es dibuixa ni es guia res: l’aire és el simulador de fluids (aquí un sol fluid, amb les equacions de Navier–Stokes incompressibles) i el fum és un tint que l’aire transporta. Dos anells que es troben de cara intercanvien les parelles i surten cap als costats, i un anell que n’atrapa un altre hi passa per dins. Tot això es veu en les espirals del fum.
- **Les fases:** primer, un anell i després un altre des de l’altre costat; mentre creix, dos anells seguits per la mateixa escletxa, un des de dalt o des de baix, o dos de cara; al moment ple, anells des dels quatre costats i un parell que els segueix. A la sortida s’obre una finestra en un costat i el corrent d’aire s’ho emporta tot.
- **El simulador:** el tint que entra des de fora de la caixa ara és net. Abans, la lectura a la vora repetia el tint del límit i deixava una cua sense fi allà on entrava un corrent.
- **Escales triades** (criteri, declarat al codi): la pantalla fa un metre d’alt, un anell avança uns 15 cm per segon i travessa la pantalla en uns deu segons, i l’aire és unes 30 vegades més viscós que el real, perquè la xarxa no pot baixar gaire més i ser estable.
- **So:** es manté com era (una nota d’arpa a cada anell i un buf suau enregistrat).
- **Comprovat** amb el processador (Chromium amb SwiftShader), fotograma a fotograma: els anells es formen com a parells de remolins amb espirals, dos anells de cara intercanvien les parelles, la simulació és estable amb la bufada més forta, al moment ple el fum omple tota la pantalla, i a la sortida la pantalla queda negra uns 6 segons després de l’última pulsació. Dins l’app: la llista d’ajustos, els textos d’estat i 65 notes, sense errors. Proves de codi: 440 de 443 (les tres que fallen ja fallaven abans: mides dels sons enregistrats).
- **No comprovat:** l’aspecte i la fluïdesa amb una targeta gràfica real, i l’auditoria de flaixos.

## Referències

Gharib, M., Rambod, E., & Shariff, K. (1998). A universal time scale for vortex ring formation. *Journal of Fluid Mechanics, 360*, 121–140. https://doi.org/10.1017/S0022112097008410

Saffman, P. G. (1992). *Vortex dynamics*. Cambridge University Press. https://doi.org/10.1017/CBO9780511624063

# Pim Pam 0.65 · Bombolles sense pes: «Oli i aigua» simulada de debò

Base: 0.64 (commit 4552ccb, publicada). Continua la petició d’en Marc del 10 de novembre de 2026 a les 8:26 (hora de Catalunya): les matèries s’han de comportar «com a fluids d’acord amb les lleis de la física».

## Què canvia

- **«Oli i aigua», refeta com a simulació.** Ara és una cel·la de Hele-Shaw: dos vidres molt junts, plens d’oli i il·luminats per darrere. Cada pulsació obre un forat al vidre i hi empeny aigua amb una tinta fluorescent. Entre dos vidres, cada líquid es mou com diu la llei de Darcy (la velocitat és l’empenta de la pressió dividida pel fregament amb el vidre, que creix amb la viscositat), i entre els dos líquids hi ha tensió superficial. Quan l’aigua, que és poc viscosa, empeny l’oli, que ho és molt, el front és inestable: qualsevol bony avança més de pressa que els veïns i es fa un dit, i els dits es parteixen per la punta i es ramifiquen (Saffman i Taylor, 1958; Paterson, 1981). No es dibuixa res: és el mateix simulador de líquids amb el fregament dels vidres, i un gruix entre vidres que no és ben igual a tot arreu (el vidre mai no és pla del tot), que decideix on comencen els primers dits. La penúltima pulsació obre tres forats alhora amb les tres tintes. A la sortida, el vidre de dalt s’aixeca una mica (el fregament baixa) i un corrent d’oli s’emporta l’aigua per un costat.
- **El simulador** guanya el fregament de dues plaques (llei de Darcy, −ρ α u amb α = 12ν/b² per a cada líquid), forats que empenyen líquid a una pressió donada, i dues correccions: la fase ja no es dilueix quan el fluid de la xarxa, que és lleugerament compressible, s’expandeix (els líquids són incompressibles), i dins d’un líquid una ondulació minúscula de la fase ja no es converteix en una taqueta falsa. Tornat a validar: la tensió superficial que surt de la llei de Laplace és 0,0105 per a 0,0100 imposada (un 5 %); la quantitat de cada líquid es manté, amb un canvi únic d’un 0,1–0,3 % quan la pressió de dins d’una gota s’assenta (abans, 4·10⁻⁵), i dues gotes que es toquen en fan una de rodona amb l’àrea de les dues (un 0,1 % menys).
- **So:** una aigua que entra entre dos vidres no fa soroll, per això l’oli ja no té sons enregistrats (abans tenia esquitxos). Les notes de la música i dues notes suaus (quan s’obre un forat i quan dues taques d’aigua es toquen) es mantenen.
- **Comprovat** amb el processador (Chromium amb SwiftShader), fotograma a fotograma, a la mida real: els dits, la pantalla plena a un 73 % a la penúltima pulsació, i la sortida, que deixa la pantalla negra en uns 6 segons.
- **No comprovat:** l’aspecte i la fluïdesa amb una targeta gràfica real, i l’auditoria de flaixos.

## Referències

Paterson, L. (1981). Radial fingering in a Hele Shaw cell. *Journal of Fluid Mechanics, 113*, 513–529. https://doi.org/10.1017/S0022112081003595

Saffman, P. G., & Taylor, G. I. (1958). The penetration of a fluid into a porous medium or Hele-Shaw cell containing a more viscous liquid. *Proceedings of the Royal Society of London. Series A, 245*(1242), 312–329. https://doi.org/10.1098/rspa.1958.0085

# Pim Pam 0.64 · Bombolles sense pes: l’aigua, simulada de debò, i una làmpada de lava

Base: 0.63.2 (commit aaf632e, publicada). Peticions d’en Marc el 10 de novembre de 2026 (hora de Catalunya): a les 8:26, «la resta són males animacions, no simulacions de fluids… s’han de comportar com a fluids d’acord amb les lleis de la física»; a les 9:48, «Afegeix un estímul que sigui de lava de colors (de l’estil de les làmpades de lava)».

## Què canvia

- **Un simulador de líquids** (`dist/bombolles-lbm.js`), a la targeta gràfica: les equacions de Navier–Stokes incompressibles amb tensió superficial, per a dos líquids que no es barregen, resoltes amb el mètode de Boltzmann en xarxa (D2Q9) en la forma de camp de fase conservatiu de Fakhari, Mitchell, Leonardi i Bolster (2017). La forma, la velocitat i el moviment de la matèria no es dibuixen: surten de les equacions. Les pulsacions només afegeixen o treuen matèria, moviment o calor (un broc, una xeringa, una bombeta). També té parets sòlides, gravetat i un camp de temperatura transportat pel líquid (aproximació de Boussinesq) per a la lava.
- **Validat contra la física coneguda** (`tools/bombolles-lbm-proves.mjs`): la llei de Laplace (la tensió superficial que surt de les pressions és 0,0096 per a 0,0100 imposada, un 4 % menys), la massa de cada líquid es conserva (deriva de l’ordre de 4·10⁻⁵), una gota el·líptica oscil·la un 8–11 % més lenta que la teoria de Rayleigh sense viscositat en dues dimensions (esperable amb viscositat i una interfície de gruix finit), i dues gotes que es toquen en fan una de rodona amb l’àrea de les dues.
- **«Esferes d’aigua», refeta com a simulació.** Aigua sense pes en una cabina: cada pulsació obre brocs fora de la pantalla que hi llancen aigua uns segons (dos raigs que es troben de cara i s’aturen), o empeny una mica de tinta fluorescent dins una gota amb una xeringa. La tensió superficial fa boles, les boles que es toquen es fusionen i oscil·len, els raigs ràpids es trenquen en gotetes i la tinta fa bolets dins la gota. A la sortida, la cabina accelera i tota l’aigua cau cap a un costat. La quantitat de moviment que es dona a l’aigua es manté a prop de zero, i per això no surt de la pantalla sense cap molla invisible.
- **«Làmpada de lava», matèria nova** (la cinquena, entre el fum i el ferrofluid), l’única amb pes. Cera de quatre colors en una làmpada tancada. Freda, és un 4 % més densa que el líquid i reposa al fons, sota la pantalla. Cada pulsació encén una bombeta sota la cera: la llum surt de seguida, la calor escalfa la cera de sobre, que es dilata, pesa menys que el líquid i puja en un plomall que s’estrangula i fa una bombolla. Dalt es refreda, torna a pesar més i baixa. Les cinc bombetes s’encenen d’una en una; la penúltima pulsació les fa brillar totes alhora, i l’última apaga la làmpada: la cera es refreda i torna al fons fins al negre. Els colors són tints dins la cera, transportats pel líquid: dues bombolles de colors diferents que es fusionen barregen el color a poc a poc.
- **La música de la lava** (criteri de disseny): si bemoll dòric, 4/4, lenta, un clarinet sobre un vibràfon, violoncels en pizzicato i kalimba. Una bombolla que es desprèn o dues que es fusionen fan una nota suau de l’acord. Una làmpada de lava no fa cap so, per això no té sons enregistrats. A l’aigua, les gotetes que es desprenen també fan una nota.
- **Escales triades** (criteri, declarat al codi): la pantalla de l’aigua fa uns 40 cm d’alt, l’aigua és unes 25 vegades més viscosa que la real i 10 vegades més densa que l’aire (en lloc de 830 vegades), perquè la xarxa no pot baixar més i ser estable. La lava es mou unes quantes vegades més de pressa que en una làmpada real, i s’escalfa i es refreda en segons, no en una hora.
- L’ajuda de l’activitat ja no esmenta la mel: la llista de matèries surt ara de la llista real.
- **Comprovat** amb el processador (Chromium amb SwiftShader), fotograma a fotograma i amb fotos fixes: l’aigua en una caixa més petita (gotes que es formen i es fusionen, tinta, gotetes, sortida) i la lava a la mida real (plomalls, bombolles que es desprenen, la sortida). Proves: `tests/bombolles.test.mjs` amb vuit matèries.
- **No comprovat:** l’aspecte i la fluïdesa a pantalla completa amb una targeta gràfica real, el so, i l’auditoria de flaixos.

## Referències

Fakhari, A., Mitchell, T., Leonardi, C., & Bolster, D. (2017). Improved locality of the phase-field lattice-Boltzmann model for immiscible fluids at high density ratios. *Physical Review E, 96*(5), 053301. https://doi.org/10.1103/PhysRevE.96.053301

# Pim Pam 0.63.2 · Bombolles sense pes, sense Mel i caramel

Petició d’en Marc el 10 de novembre de 2026 a les 8:26 (hora de Catalunya), després de provar la 0.63: «El de la mel i el caramel ja el pot eliminar, crec que és irrecuperable». També diu que, fora de les bombolles de sabó, les altres matèries són «males animacions, no simulacions de fluids». Aquesta versió només treu la mel; les altres sis es refaran com a simulacions físiques en versions següents.

- «Bombolles sense pes» passa de vuit a set matèries: bombolles de sabó, plasma, esferes d’aigua, anells de fum, ferrofluid, oli i aigua, i nebulosa. Després de la setena torna la primera amb la segona paleta.
- Fora el mòdul `dist/bombolles-mel.js` i la seva música.
- Un perfil desat amb «Mel i caramel» com a primera matèria comença ara per les bombolles de sabó (no es perd la resta del perfil).
- Proves: `tests/bombolles.test.mjs` amb set matèries i la prova del perfil antic. Comprovat a Chromium: la llista de primera matèria, l’arc de les bombolles amb 4 pulsacions i el pas al plasma, sense errors.
# Pim Pam 0.63.1 · Text de la finestra «Informació»

Base: 0.63 (commit 2dd7533, publicada). Petició d’en Marc el 10 de novembre de 2026 a les 8:10 (hora de Catalunya).

## Què canvia

- «Està pensat per a infants i joves amb discapacitat que aprenen a fer servir un commutador» ara diu «Està pensat per aprendre a fer servir commutadors».
- El paràgraf dels tipus d’activitat ja no diu quantes n’hi ha de causa-efecte i d’encercament («Hi ha activitats de causa-efecte…; activitats d’encercament…; i 2 petites pel·lícules…»).

# Pim Pam 0.63 · Bombolles sense pes, en lloc de Bombolles de sabó

Base: 0.62 (commit a467e2e) amb la pàgina de prova de les vuit matèries (commit 4050cfc), publicades. Petició d’en Marc el 10 de novembre de 2026 a les 7:30 (hora de Catalunya): «No entenc per què no ho has publicat tot directament a Pim Pam, substituint l’activitat Bombolles de sabó». L’estil de les vuit matèries es va aprovar el 9 de novembre (les bombolles, «la mel hauria de ser més translúcida», «Dacord, segueix amb els altres»).

## Què canvia

- **«Bombolles de sabó» (CE05, `bubbles`) passa a ser «Bombolles sense pes»**, amb el mateix codi i el mateix identificador, ara a la carpeta «Formes, llum i música», just després de la Pluja de colors. La carpeta «Per revisar» es queda amb «El vestidor fantàstic».
- **Vuit matèries sense pes, una rere l’altra:** bombolles de sabó, mel i caramel, plasma, esferes d’aigua, anells de fum, ferrofluid, oli i aigua, i una nebulosa. Les primeres pulsacions fan entrar la matèria per una vora sobre negre, les del mig la fan créixer, la penúltima omple la pantalla i l’última la fa sortir per les vores fins al negre. Mentre surt, les pulsacions no fan res. Després de la vuitena matèria torna la primera amb la segona paleta.
- **La música de cada matèria** (criteri de disseny, no evidència): cada una té la seva tonalitat, el seu mode, el seu compàs i els seus instruments, tots enregistrats i pinçats o percudits (arpa, glockenspiel, vibràfon, marimba, kalimba, udu, guitarra, piano, flauta, clarinet, fagot, violoncels en pizzicato, triangle i gong). Cada pulsació toca una frase: poques notes quan la matèria entra, la melodia amb els acords mentre creix, tres compassos amb totes les veus al moment ple (dos a la mel i al fum, que són lents) i una línia que baixa fins a la tònica quan se’n va. Els fets de la matèria (una bombolla que esclata, dues gotes que es fonen, un anell de fum que entra, una gota que es desprèn…) hi afegeixen una nota suau de l’acord i, en alguns, un so enregistrat de la mateixa matèria (el pop d’una bombolla, gotes, un raig de bombolles, un xiuxiueig d’aire), sempre espaiats. No hi ha cap nota sostinguda: totes s’apaguen soles. Tots els sons ja eren a l’app; no se n’ha generat cap de nou.
- **Senyal de torn:** quan acaba cada pas, la matèria s’alenteix fins a un 15 % (no s’atura del tot, perquè sura) i la pantalla s’enfosqueix una mica. Mentre la matèria surt, va sempre a tota velocitat.
- **Ajustos a «Aquesta activitat»:** pulsacions de cada matèria (4, 8 o 12; 8 per defecte) i primera matèria. Com la Pluja de colors, es veu sempre sobre negre: no té decorat atenuat ni sense decorat, ni color de base. Sense WebGL 2 la pantalla queda negra, l’ajuda ho explica i la música sona igualment.
- **La fitxa de la portada** mostra un fotograma real del motor (les bombolles al moment ple).
- **Codi:** `dist/bombolles.js` (el model, la música i els sons), `dist/bombolles-escena.js` (el dibuix dins de l’app), i el motor i les vuit matèries de la prova d’estil (`dist/bombolles-motor.js`, `-shaders.js`, `-sabo.js`, `-mel.js`, `-plasma.js`, `-aigua.js`, `-fum.js`, `-ferro.js`, `-oli.js`, `-nebulosa.js`), dins del fitxer únic. L’antiga activitat i el seu dibuix (`Cbubbles`, `Cbubble`) desapareixen.

## Proves

- `tests/bombolles.test.mjs` (10 proves): el codi i el lloc al catàleg, els ajustos, l’arc de cada matèria amb 4, 8 i 12 pulsacions (bloqueig durant la frase i durant la sortida, el negre, la matèria següent), la volta sencera de les vuit matèries a dos ritmes de pulsació, el desbloqueig, totes les notes dins del registre dels enregistraments i sense notes sostingudes, l’espaiat dels sons de la matèria, el senyal de torn, els textos per al lector de pantalla i la connexió amb l’app i el fitxer únic.
- Canvien proves que feien servir l’antiga activitat: a `tests/causes.test.mjs` en surten cinc que provaven el mode «mantenir» i «commutar» d’una activitat clàssica, perquè l’antiga «Bombolles de sabó» era l’única que en tenia i cap altra no les pot exercitar (una prova nova comprova que ja no en queda cap); `tests/wait.test.mjs`, `tests/activities.test.mjs`, `tests/carrega.test.mjs` i `tests/pluja.test.mjs` s’actualitzen amb la nova activitat.
- Suite: 443 proves, 440 passen; fallen les 3 de sempre (mides de fitxers de so de la masia, dels instruments i dels Detectius), que ja fallaven a la 0.62.
- Chromium (dibuix per programari), servidor http i fitxer únic: la carpeta i la fitxa, la pestanya d’ajustos, l’arc sencer de les bombolles amb 4 pulsacions fins al negre, la mel a continuació, 80 notes d’instruments i els sons enregistrats en marxa, cap error a la consola; cada una de les altres sis matèries comença i es dibuixa dins de l’app.
- **No comprovat:** el rendiment en una targeta gràfica real, el moviment a velocitat real, com sona la música (només s’ha comprovat quines notes i quins sons es disparen, no s’ha escoltat) i l’auditoria de flaixos (no s’ha passat).

# Pim Pam 0.62 · Botó «Informació» a la portada

Base: 0.61.1 (commit 2fa5a2e, publicada). Petició d’en Marc el 9 de novembre de 2026 a les 20:29 (hora de Catalunya): afegir a la pàgina principal un botó d’informació que expliqui breument l’aplicació i tots els crèdits, inspirat en la informació de LECAA Docs, amb una part «Origen i institucions» amb tots els logotips.

## Què canvia

- **Botó «Informació»** a la capçalera de la portada, entre l’usuari i «Configuració» (al mòbil, només la icona ⓘ). Obre una finestra amb quatre apartats:
  - **Què és Pim Pam:** per a qui és, els tres tipus d’activitat (amb el nombre de cada tipus, calculat del catàleg), les carpetes i les activitats personalitzades, com arriben els commutadors i què es pot ajustar, i que funciona al navegador sense demanar dades personals.
  - **Origen i institucions:** el mateix text i els mateixos cinc logotips que LECAA Docs (UTAC, Universitat de Barcelona, Fundació Bosch i Gimpera, Departament d’Educació i Formació Professional, Departament de Drets Socials i Inclusió), amb l’enllaç al web de cada institució. Els logotips són els fitxers WebP del repositori utacub/lecaa_docs, sense canvis.
  - **Eines i recursos:** Claude, ChatGPT, ElevenLabs, VSCO-2 CE (CC0), «Brook sound» de TwoWings (CC BY 3.0), el toc de castells dels Marrecs de Salt de JordiGran (CC BY-SA 4.0) i three.js (MIT), cadascun amb l’autor, la llicència i l’enllaç.
  - **Crèdits i llicències:** què és generat i què és enregistrat, l’enllaç a `dist/assets/samples/CREDITS.md` (la llista so per so) i al codi, la versió i un enllaç a «Novetats d’aquesta versió».
- **Encercament:** el botó no entra a la volta de l’encercament del menú, que continua sent les targetes i «Configuració», sense paraules. Mentre la finestra és oberta l’encercament s’atura, com amb qualsevol altra finestra. Es tanca amb la creu, amb Esc o tocant fora.
- El fitxer únic porta els logotips a dins, i funciona sense connexió (els enllaços externs necessiten connexió).

## Proves

- tests/sobre.test.mjs (2 proves): els logotips hi són, el text porta l’origen, les institucions i els crèdits, el botó no té `data-settings` (no entra a l’encercament) i el build incrusta els logotips.
- Suite: 437 proves, 434 passen; fallen les 3 de sempre (mides de fitxers de so de la masia, dels instruments i dels Detectius), que ja fallaven a la 0.61.1.
- Chromium, servidor http i fitxer únic, 1440×900 i 390×844: la finestra s’obre, els 7 logotips carreguen, Esc i el fons la tanquen, «Novetats» obre la configuració amb la 0.62, cap error a la consola.
- No s’ha passat l’auditoria de flaixos (no canvia cap activitat).

# Pim Pam 0.61.1 · El taller de vehicles: accessoris redibuixats i ben assentats

Base: 0.61 (commit 0be7169, publicada). Petició d’en Marc el 8 de novembre de 2026 a les 22:40 (hora de Catalunya): «Revisa com estan dibuixats els complements, n’hi ha diversos, com la campana, que no es veuen bé. Revisa també com s’acoplen als vehicles. Sovint queden massa ensorrats per dins del vehicle».

## Què canvia

- **Assentats damunt del sostre.** Cada accessori es col·locava a l’alçada del contorn de la carrosseria, però la vora arrodonida fa el sostre real 2,2 unitats més alt: tots quedaven enfonsats. Ara es mesura el sostre real de cada carrosseria (un mapa d’alçades vist des de dalt) i l’accessori hi baixa fins que la primera de les seves peces el toca. Així l’escala de la camioneta descansa sobre la cabina i el seu peu sobre la caixa, i cap peça no entra dins del vehicle.
- **Tres parelles canvien de lloc al llarg del vehicle:** el braç excavador a la caixa del camió volquet (abans ficava la cullera dins la cabina), la caixa basculant al davant de l’excavadora (abans s’enfonsava a la cabina) i l’hèlix a la cua de l’helicòpter, lluny de la cabina i del rotor.
- **Redibuixats:**
  - **Campana:** molt més gran, daurada, amb vora crema i batall fosc, penjada d’un pòrtic amb els pals davant i darrere (cap pal tapa la campana des del banc); es gronxa cap a l’habitació.
  - **Escala:** més gruixuda i aixecada sobre una plataforma giratòria i un suport davanter, com la dels bombers; es veuen els esglaons.
  - **Llum giratòria (sirena):** més alta, amb la cúpula coral translúcida i el reflector groc a dins.
  - **Mànega:** un debanador amb rodes de radis obertes; es veuen les voltes de la mànega coral i el gir quan es desenrotlla.
  - **Formigonera:** ara estirada i inclinada com la d’un camió formigonera de veritat, amb franges en espiral coral i crema que fan veure el gir, la boca i el canal a darrere. Al garatge el bombo gira al revés i la massa grisa surt per la boca, baixa pel canal i cau a la placa (abans era un ou dret que s’inclinava).
  - **Xiulet:** un xiulet de vapor de llautó amb boca fosca, tapa i palanca; el doll de vapor surt de dalt.
  - **Fanal:** més gran, amb vidre, marc fosc, teulada de punta i nansa.
  - **Hèlix:** tres pales amples i inclinades amb puntes coral sobre un pal més gruixut.
  - **Periscopi:** més gruixut i amb el cap sempre a la vista (abans, en repòs, només en sortia una capseta); a mig recorregut puja més i gira.
  - **Àncora:** més gruixuda, amb cep, braços i puntes; en repòs penja al costat de l’habitació, de cara al banc, i al garatge el pescant gira cap a l’altre costat, s’allarga i la baixa fins a la placa.
  - **Bombolles:** una màquina més gran amb reixeta, maneta i un cèrcol gran amb pel·lícula de sabó, de cara al banc.
- **La safata** torna a equilibrar les mides de les peces redibuixades.
- **Càmera del banc** una mica més enrere (el vehicle es veu un 11 % més petit) perquè els accessoris alts damunt dels vehicles alts (la bandera a l’autobús, el braç al tractor) no quedin tallats per dalt.
- **Garatge més alt.** El rètol coral del garatge tapava la part de dalt del vehicle aparcat, just on hi ha l’accessori i on passen moltes de les seves gràcies, i l’escala en pujar travessava el sostre. El garatge és ara un terç més alt i l’escala puja fins on cap sota el sostre.

## Proves

- Una prova nova comprova, per a cada accessori i cada carrosseria del seu racó, que cap peça no queda més enfonsada que el mig punt d’assentament i que sempre n’hi ha una que toca el vehicle; i que els accessoris redibuixats tenen una alçada mínima.
- tools/vehicles-sweep.mjs: cap contacte amb els objectes de cap habitació, tampoc amb els accessoris nous.
# Pim Pam 0.61 · Fora la Pluja musical

Base: 0.60.3 (commit 3616cdf, publicada). Petició d’en Marc el 8 de novembre de 2026 a les 23:09 (hora de Catalunya): «pots eliminar Pluja musical de la carpeta Per revisar».

## Què canvia

- **Fora «Pluja musical» (CE07).** Era una de les activitats fetes amb ChatGPT al començament que es guardaven a «Per revisar». La carpeta queda amb «La granota bombollaire» i «El vestidor fantàstic». El codi CE07 queda lliure i no es reaprofita, com els de les activitats tretes abans.
- **Fora el seu codi.** Se suprimeix el mòdul dist/musical-rain.js (dibuix, vint composicions i els seus vuit instruments sintetitzats `rain-…`). L’app arrencava el so a través d’aquest mòdul; ara ho fa directament amb el sintetitzador del Fons marí (ocean.js), que ja era el que hi havia a sota, de manera que la resta d’activitats sonen igual.
- **Portada:** 44 activitats (33 de causa-efecte i 11 d’encercament). Fitxer autònom: dist/Pim_Pam_44_activitats_v0_61.html.

## Proves

- Les proves del catàleg comproven que «Pluja musical» ja no hi és (31 activitats de causa-efecte més les dues pel·lícules, 11 d’encercament) i que els codis de la resta no canvien. Resultat: 431 correctes i 3 errors, els mateixos tres que ja fallaven a la 0.60.3 (fitxers de so de la masia, instruments enregistrats i Detectius de sons, que no són al repositori).
- Fitxer autònom obert a Chromium: 44 fitxes, cap error; La granota bombollaire, El vestidor fantàstic, el Fons marí, el Caleidoscopi i les Gotes de pintura s’obren i responen al commutador.

# Pim Pam 0.60.3 · El taller de vehicles sense panell d’informació

Base: 0.60.2 (commit ee5cbed, publicada). Petició d’en Marc el 8 de novembre de 2026 a les 22:30 (hora de Catalunya): «Pots eliminar la Info dins d’aquesta activitat, és completament irrellevant».

## Què canvia

- **Sense ⓘ.** «El taller de vehicles» ja no té el botó d’informació: ni a la barra de dalt de l’activitat, ni a les eines de la pantalla, ni a la seva fitxa de la portada. Com la Pluja de colors, la fitxa conserva la seva imatge.
- **Fora els continguts del panell.** Les 110 entrades (les divuit peces i les quatre llums de cada racó, amb la seva imatge i tres línies) i la capçalera del panell. El mòdul d’informació passa de 6,9 MB a 4,9 MB, i el fitxer autònom s’aprima en la mateixa mesura.
- **La resta d’activitats** conserven el seu panell tal com era (comprovat entrada per entrada).

## Proves

- La prova del panell del taller passa a comprovar que no n’hi ha cap: ni entrades, ni capçalera, ni imatges a production/info/img, i que els tres botons ⓘ de l’app depenen de tenir panell. La prova general del panell ja no compta el taller.
- tools/vehicles-info.mjs només pinta la imatge de la fitxa de la portada (les imatges del panell, només amb PANEL=1 i mai a production/info).

# Pim Pam 0.60.2 · El taller de vehicles: el recorregut ja no travessa la planta

Base: 0.60.1 (commit a809d62, publicada). Correcció que en Marc va trobar a la versió publicada el 8 de novembre de 2026 a les 22:08 (hora de Catalunya): «Al segon escenari tots els vehicles passen a través de la planta a la segona volta».

## Què canvia

- **La segona volta de la sala.** El recorregut de la sala fa dues voltes; a la segona, de tornada cap al garatge, passava per dins del test de la planta (la flor sortia pel sostre del vehicle), fregava una pota de la tauleta i el cantó dels llibres. Ara la segona volta baixa entre la tauleta i els llibres, passa per davant de la tauleta i fa el revolt més obert, per davant de la planta, abans d’entrar al garatge. La primera volta (la pujada als llibres, el pas per sota de la tauleta i el raig del canó d’aigua cap a la planta) no canvia.
- **El pati.** El pneumàtic recolzat a la pila tocava la cantonada del vehicle en baixar de la rampa: la pila es mou una mica a la dreta i enrere.
- **El bany.** Amb l’hidroavió (les ales) i els flotadors, el vehicle fregava una pota del tovalloler després de la rampa: el tovalloler s’aparta una mica cap a la paret.
- **Sense canvis** a la resta de racons ni a la desfilada, que ja passaven nets.
- Les imatges del panell ⓘ no s’han tornat a pintar: el pneumàtic del pati i el tovalloler del bany s’hi veuen una mica més a prop del camí que ara.

## Proves

- Una eina nova, tools/vehicles-sweep.mjs, passa la silueta del vehicle més ample possible de cada racó (cada carrosseria amb totes les rodes i tots els accessoris del racó) per tot el recorregut de cada racó i per la ruta de la desfilada, i llista qualsevol objecte de l’habitació que toqui. Els objectes per on el camí ha de passar (llibres, sorral, tub, pont, via, tarima) estan marcats i no compten. Abans: 4 contactes (planta i tauleta de la sala, pneumàtics del pati, tovalloler del bany). Ara: cap.
- Una prova nova a tests/vehicles.test.mjs comprova les distàncies del camí a la planta, a les potes de la tauleta, als pneumàtics i al tovalloler, i que aquests objectes són on l’eina els va comprovar.
- Imatges de la segona volta de la sala (càmera dinàmica i tranquil·la) i del raig del canó d’aigua, que encara arriba a la planta.

# Pim Pam 0.60.1 · El taller de vehicles: el vehicle torna a veure’s després de la desfilada

Base: 0.60 (commit 7e0d539, publicada). Correcció que en Marc va trobar a la versió publicada el 8 de novembre de 2026 a les 21:03 (hora de Catalunya): «Al 2on escenari els vehicles i totes les peces són invisibles».

## Què canvia

- **El vehicle del banc es torna a veure al racó següent.** Després de la desfilada de final de racó (rondes 4, 8, 12…), en tornar al banc el xassís no hi era i les peces que s’hi posaven (carrosseria, rodes, accessori) no es veien, ni al banc ni al passeig. La safata sí que es veia. Ara el vehicle hi és des de la primera ronda del racó nou, i també després de la segona desfilada (de la sala al pati).
- **Per què passava.** En acabar la desfilada s’amaguen els vehicles del comboi, i el primer del comboi és el mateix vehicle del banc: quedava amagat per sempre. Ara s’amaguen tots menys aquest.

## Proves

- Una comprovació nova a tests/vehicles.test.mjs vigila que en desar el comboi mai no s’amagui el vehicle del banc.
- Imatges en una sola pàgina, amb el mateix estat 3D: desfilada de l’habitació → banc de la sala (xassís) → carrosseria que s’hi posa → passeig de la sala → desfilada de la sala → banc del pati. Abans de la correcció, el banc de la sala sortia buit.

# Pim Pam 0.60 · El taller de vehicles: la desfilada de final de racó

Base: 0.59 (commit c533919). **Publicada** el 8 de novembre de 2026 a les 20:11 (hora de Catalunya) a https://utacub.github.io/pimpam/ , fusionada amb la 0.55 (Pluja de colors nova) en el commit 16a6b3d; el fitxer autònom passa a dir-se Pim_Pam_45_activitats_v0_60.html. Tanca el pla aprovat per en Marc el 8 de novembre de 2026 («Quan tinguis tot això ja pots fer les fases 1 a 4»): després de les quatre fases (els racons), el final de racó. El número 0.55 el fa servir la nova Pluja de colors, que es publica des d’un altre fil.

## Què canvia

- **La desfilada.** Quan el quart vehicle d’un racó arriba al garatge (rondes 4, 8, 12…, sempre la de nit), la càmera no torna al banc: es queda al garatge i tot seguit s’allunya a una vista sencera de l’habitació, des de més lluny que el passeig tranquil. Els vehicles que s’han fet al racó surten del garatge un darrere l’altre —el que s’acaba de fer al davant, i darrere els de les tres rondes anteriors, del més nou al més vell—, fan un revolt cap endavant i travessen tot el davant de l’habitació, per davant dels mobles i del circuit, fins a sortir per la dreta. Després el taller passa al racó següent, com fins ara. Si alguna ronda del racó s’ha saltat o no s’ha acabat, hi desfilen els vehicles que hi ha (encara que només sigui un).
- **Durada.** La desfilada dura 9, 12 o 15 segons segons la «Durada del passeig» (curt, mitjà, llarg), després del garatge; la resta de rondes no canvia gens. Una pulsació abans d’hora escurça l’espera, no la desfilada.
- **El garatge.** Ara és obert pels dos caps (dos pals aguanten el sostre pel costat esquerre): el vehicle aparcat s’hi veu igual, i els altres vehicles de la desfilada hi entren per darrere i en surten per la porta.
- **Com es mouen.** Cada vehicle va amb les seves rodes (rebot i balanceig segons la mena de roda; les rodes, les bieles, les erugues i els rotors giren amb el camí fet), a 150 unitats del següent, a la velocitat del passeig. Els accessoris van en repòs (cap gag durant la desfilada). Amb «menys moviment» la càmera és fixa i no hi ha rebots; si no, la vista deriva molt a poc a poc seguint el comboi.
- **La música.** Després de la cadència del garatge, dues claus marquen «un, dos» i la banda del racó torna a tocar sencera (com una banda de carrer que passa), amb el so de les rodes del vehicle del davant a sota, i la cadència del racó tanca quan l’últim vehicle se’n va. Cap so nou: tot dels bancs de la suite.
- **Dibuix pla (sense WebGL).** El comboi travessa el panell d’esquerra a dreta amb els dibuixos plans de cada vehicle.
- **Panell ⓘ.** El text de capçalera del taller esmenta la desfilada; les 110 entrades es mantenen. `ACTIVITATS.md` i `DOCUMENTACIO_TECNICA.md` actualitzats.

## Regles que es mantenen

- Cap paraula escrita durant l’encercament; la desfilada és només la part final de l’efecte de l’última tria, i no demana cap pulsació. Criteris de disseny propis, no evidència.
- Fotosensibilitat: cap parpelleig; només hi ha moviment continu de vehicles petits vistos de lluny i una deriva lenta de càmera, per sota dels tres canvis per segon del criteri 2.3.1 (W3C, 2023), amb base clínica a Harding i Jeavons (1994).
- Música i sons només dels bancs de la suite (cap enregistrament nou).
- Cap cara a les joguines; els vehicles de la desfilada són els mateixos models de cada racó.

## Proves

- `node --test tests/*.test.mjs`: 423 de 426 verdes (les 3 vermelles són les de sempre: enregistraments de la masia, dels instruments i dels detectius que no són al disc); `tests/vehicles.test.mjs` passa d’10 a 11 proves (la ronda final: temps, fases, ruta, llista de vehicles, música i dibuix pla).
- Fotogrames amb three.js (SwiftShader, 1280×720 i 2560×1440): el quart vehicle al garatge obert, la sortida del garatge (el primer vehicle surt mentre el segon travessa el garatge), el revolt cap endavant, el comboi pel davant de l’habitació (nit), l’últim vehicle sortint per la dreta, i la desfilada a la sala (esquivant el test), al pati, al passadís i al bany; el dibuix pla del comboi.
- Fitxer construït (`Pim_Pam_44_activitats_v0_60.html`, 65.586.968 bytes) obert a Chromium sense errors de consola: portada, carpeta, fitxa, panell ⓘ, càrrega, pestanya «Aquesta activitat», pausa i safata del taller.

## Per revisar (en Marc)

1. La durada de la desfilada (9/12/15 s) i la distància de la càmera: si convé veure els vehicles més grossos (càmera més a prop) o més habitació.
2. L’ordre del comboi (el més nou al davant) i la sortida per la dreta: també podrien fer el circuit sencer, però és més llarg.
3. El garatge obert pels dos caps.
4. ~~Publicar a GitHub Pages~~ Fet el 8 de novembre a les 20:11 (hora de Catalunya), dins la fusió 16a6b3d amb la 0.55.

## Referències

Harding, G. F. A., i Jeavons, P. M. (1994). *Photosensitive epilepsy* (2a ed.). Mac Keith Press.

W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. World Wide Web Consortium. https://www.w3.org/TR/WCAG22/

# Pim Pam 0.59 · El taller de vehicles: el bany, aigua i aire (fase 4)

Base: 0.58 (commit c66d692). Quarta i última de les fases del pla aprovat per en Marc el 8 de novembre de 2026 («Quan tinguis tot això ja pots fer les fases 1 a 4»). El número 0.55 el fa servir la nova Pluja de colors, que es publica des d’un altre fil.

## Què canvia

- **El bany, cinquè racó de la casa.** El cicle és ara habitació → sala → pati → passadís → bany → habitació… L’ajust «Primer racó» (pestanya «Aquesta activitat») admet el bany. El bany té una paret blavosa amb una franja de rajoles blanques amb juntes grises i una tira menta al damunt, el terra d’escaquer de rajoles blanques i blau clar, una finestra a la dreta, una banyera blanca amb l’aixeta, l’aigua, l’escuma i un ànec de goma groc (sense ulls, com totes les joguines del taller), una pica de peu amb el sabó i el got dels raspalls, un prestatge amb flascons de colors, un tamboret menta, un tovalloler de fusta amb una tovallola corall i una menta, un cistell de la roba, una estora blava i una tarima de fusta de llistons.
- **El circuit del bany.** Baixa la rampa, passa per davant del tovalloler, travessa l’estora blava, puja la tarima de fusta (una mica amunt, com el pont del passadís però baix) i arriba al garatge.
- **Sis vehicles de l’aigua i de l’aire.** Hidroavió (groc, amb l’ala alta i prima al damunt, dos flotadors petits a les puntes de l’ala, la cua amb el timó i la punta d’hèlix al nas), barca de pesca (blava, amb la proa alçada, una franja crema, la caseta del timó al darrere i un salvavides corall a cada costat), submarí (lila, arrodonit pels dos caps, amb la torreta, una franja crema, les aletes de popa i l’hèlix al darrere), helicòpter (corall, amb la cabina rodona, la cua llarga amb l’aleta i el rotor petit, i el rotor gran que gira a poc a poc quan avança; els accessoris s’hi enganxen a la cua), avioneta (verda, amb l’ala baixa, la cua i l’hèlix de dues pales al nas, que gira a poc a poc quan avança) i vaixell de rodes (taronja, amb dues cobertes, la xemeneia amb la cinta crema i les caixes de les rodes de pales). Tots amb una sola franja de vidre fosc i una sola barra groga de para-xocs: cap cara.
- **Sis rodes.** Noves: flotadors (dues càpsules crema amb una ratlla blava, una a cada costat; no giren, i el vehicle llisca i es gronxa una mica), rodes de pales (corall amb el cub crema i vuit pales al voltant; esquitxen), salvavides (anelles crema amb quatre franges corall; boten força) i boies (boles taronja amb una cinta crema; boten i es gronxen). Compartides: les amples de goma de l’habitació i les de globus de la sala.
- **Sis accessoris.** Nous: l’hèlix (tres pales crema sobre un pal, que giren a poc a poc tot el camí —mitja volta per segon— amb un disc clar; quietes si es demana menys moviment i al garatge), el periscopi (a la meitat del camí el tub puja, fa una volta sencera i torna a baixar; a la safata es mostra pujat perquè es reconegui), l’àncora (al garatge el petit braç gira cap a la càmera, s’allarga i l’àncora marina baixa amb la cadena fins a la placa) i la màquina de bombolles (tot el camí, i també al garatge, en surten bombolles de sabó translúcides que pugen, es gronxen i peten). Compartits: la bandereta i el globus (al bany, la cançoneta del globus la fa l’arpa i no el piano).
- **La barcarola del bany.** Música pròpia en Mi bemoll major, en sis per vuit (la negra amb punt a 84): el sonall marca l’u i el quatre i la vora del tambor el tres i el sis quan la banda és sencera, la marimba fa el baix a l’u i al quatre, l’arpa arpegia totes les corxeres, el glockenspiel porta la tonada i la flauta canta una nota llarga a la quinta cada dos compassos; la cadència del garatge resol al quatre amb un acord d’arpa i de glockenspiel i la flauta. Els tastos de les peces: les carrosseries amb l’arpa, els flotadors amb un xiuxiueig, les pales amb esquitxos, els salvavides amb boings, les boies amb plofs, l’hèlix amb una ràfega, el periscopi lliscant, l’àncora amb l’estrebada i el xoc, les bombolles amb blubs. L’aire del bany: gotes al matí, bombolles a la tarda, gotes grosses al capvespre i la nit.
- **Panell ⓘ i catàleg.** 110 entrades: les divuit peces i les quatre hores de cada racó, amb una imatge cadascuna (22 de noves). `ACTIVITATS.md` actualitzat.

## Regles que es mantenen

- Cap paraula escrita durant l’encercament, ordre d’esquerra a dreta, ressaltat clar de la suite, pista del commutador després d’una volta en blanc, senyal d’espera; cap cara a les joguines ni a l’ànec (una sola franja de vidre, una sola barra groga de para-xocs). Criteris de disseny propis, no evidència.
- Fotosensibilitat: cap gag nou fa parpellejar res. Els rotors i l’hèlix giren a menys d’una volta per segon (l’hèlix de tres pales a mitja volta per segon, el rotor de l’helicòpter a un terç, l’hèlix de l’avioneta a tres quarts) i les bombolles, el periscopi i l’àncora són moviments lents; tot per sota dels tres canvis per segon del criteri 2.3.1 (W3C, 2023), que és el llindar de referència per a la fotosensibilitat en contingut web (Harding i Jeavons, 1994, per a la base clínica del llindar). Amb «menys moviment» els rotors i l’hèlix queden quiets i les bombolles, repartides i quietes.
- Música i sons només dels bancs de la suite (cap enregistrament nou): marimba, arpa, glockenspiel i flauta dels instruments ja mostrejats; sonall, vora de tambor, xiuxiueigs, esquitxos, boings, plofs, lliscades, estrebades i xocs dels bancs de foley existents; gotes, bombolles i nit dels paisatges sonors existents.
- El vehicle es veu sempre: el tovalloler és al costat del circuit, no al damunt, i al bany no hi ha cap tub ni túnel.

## Proves

- `node --test tests/*.test.mjs`: 422 de 425 verdes (les 3 vermelles són les de sempre: enregistraments de la masia, dels instruments i dels detectius que no són al disc); `tests/vehicles.test.mjs` (10) i `tests/info.test.mjs` actualitzades i verdes.
- Fotogrames del bany amb three.js (SwiftShader, 1280×720 i 2560×1440): el banc amb les quatre safates (carrosseries, flotadors i rodes, accessoris amb el periscopi pujat), l’hidroavió aterrant, les bombolles sobre l’estora, l’avioneta amb l’hèlix a la rampa, el submarí amb el periscopi pujat a la tarima, la barca amb les pales i l’àncora, l’àncora baixant al garatge (nit), les bombolles al garatge (nit), la vista tranquil·la del bany sencer, l’helicòpter amb el globus, el capvespre amb decoració atenuada, sense decoració, i el dibuix pla (safata i passeig).
- Fitxer construït (`Pim_Pam_44_activitats_v0_59.html`, 65.579.130 bytes) obert a Chromium sense errors de consola: portada, carpeta, fitxa, panell ⓘ (110 entrades), càrrega, pestanya «Aquesta activitat» amb «Primer racó», pausa i safata del taller.
- Les 110 imatges del panell ⓘ renderitzades de nou (`tools/vehicles-info.mjs`) i `production/info/make_info.py` executat.

## Per revisar (en Marc)

1. El bany: els colors (paret blavosa, rajoles blanques i blaves, estora blava), la banyera amb l’ànec, la pica, el tovalloler, la tarima i el cistell; qualsevol moble es pot canviar.
2. Els sis vehicles nous i els quatre accessoris nous, sobretot l’hèlix (si convé més o menys velocitat), el periscopi i l’àncora al garatge.
3. Les rodes que no són rodes (flotadors, salvavides i boies): si es prefereix que els flotadors també tinguin rodetes petites a sota.
4. La barcarola: si convé més o menys volum de l’arpa o de la flauta.
5. Tot seguit ve la 0.60: el final de racó (cada quatre vehicles, els quatre vehicles fets desfilen junts) i el polit de rendiment.
6. ~~Publicar a GitHub Pages~~ Fet el 8 de novembre a les 20:11 (hora de Catalunya), dins la fusió 16a6b3d amb la 0.55.

## Referències

Harding, G. F. A., i Jeavons, P. M. (1994). *Photosensitive epilepsy* (2a ed.). Mac Keith Press.

W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. World Wide Web Consortium. https://www.w3.org/TR/WCAG22/

---

# Pim Pam 0.58 · El taller de vehicles: el passadís del tren (fase 3)

Base: 0.57 (commit 20b5fa4). Tercera de les quatre fases del pla aprovat per en Marc el 8 de novembre de 2026 («Quan tinguis tot això ja pots fer les fases 1 a 4»). El número 0.55 el fa servir la nova Pluja de colors, que es publica des d’un altre fil.

## Què canvia

- **El passadís, quart racó de la casa.** El cicle és ara habitació → sala → pati → passadís → habitació… L’ajust «Primer racó» (pestanya «Aquesta activitat») admet el passadís. El passadís té una paret blavosa amb un arrambador de fusta pintada de crema (amb ranures i un llistó de fusta al damunt), parquet d’espiga en tres tons de mel, una finestra a l’esquerra (amb la lluna de nit), una porta blanca amb plafons i pom marina, un penjador amb un abric marina, una bufanda groga, una gorra corall i una bossa verda, dos quadres petits (un sol i una vela), un banc de fusta amb quatre sabates, un paraigüer gris amb dos paraigües i una estora corall amb dues ratlles crema que recorre tot el passadís.
- **La via de fusta i el pont.** Sobre l’estora hi ha una via de joguina de fusta (dos rails i travesses) que segueix tot el circuit des del peu de la rampa fins a tocar del garatge; a mig camí la via puja un pont de fusta amb dues rampes i baranes crema i torna a baixar. Les travesses i els rails queden sempre plans sobre la via, també als pendents.
- **Sis vehicles de tren.** Locomotora de vapor (verda, amb la cabina al darrere, la caldera rodona amb dues cintes i la porta del fumeral al davant), vagó de passatgers (corall, llarg, amb muntants a les finestres i llanterna al sostre), tramvia (groc, amb els extrems arrodonits, una franja crema i la perxa del tròlei), vagó de mercaderies (blau, amb la cabina al darrere i una caixa oberta amb costelles), màquina de maniobres (taronja, amb el capó llarg, el tub d’escapament i la reixa) i furgó de cua (lila, amb plataformes amb baranes als extrems i una cúpula de guaita). Com sempre: una sola franja de vidre, una sola barra groga de para-xocs, cap cara.
- **Sis rodes.** Noves: de tren amb pestanya (grises amb el cub marina i una pestanya interior; clac-clac regular de claus per parelles, sense bots), amb bieles (corall amb el cub crema, unides per una biela a cada costat que puja i baixa amb la volta; retruny ràpid), de vagoneta (petites, marina, rasquen el terra i fan tentinejar el vehicle) i amb faldons de tramvia (amagades darrere uns faldons marina; viatge llis amb un sonall suau); compartides: de fusta i de radis.
- **Sis accessoris.** Nous: la xemeneia de vapor (treu bafarades blanques tot el camí, quietes si es demana menys moviment, cap al garatge), el xiulet (a la meitat del camí bufa dues vegades amb un raig de vapor i dues notes de flauta alhora), el fanal de tren (s’encén a poc a poc cap al final del camí i queda encès al garatge; mai parpelleja) i la càrrega de troncs (al garatge, tres troncs roden un rere l’altre cap al darrere i cauen a la placa); compartits: campana i bandereta.
- **La cançó de tren del passadís.** Música pròpia en Sol major a 126 pulsacions per minut, sense swing: la vora del tambor marca les corxeres com els rails, el contrabaix camina a negres, el violí pinçat respon als contratemps, l’arpa porta la tonada i el triangle petit repica al tres dels compassos complets; la cadència del garatge acaba amb el triangle gran. Els tastos de les peces del passadís van amb l’arpa, les claus, els tambors i el buf. Aire del passadís: alba al matí, vent a la tarda, granotes al capvespre i la nit.
- **Parets més amples.** La paret, el sòcol i el terra de tots els racons fan ara 4400 unitats d’ample, desplaçats cap al costat del garatge (abans 2400): des de la càmera del garatge es veia el final de la paret.
- **Panell ⓘ i catàleg.** 88 entrades: les divuit peces i les quatre hores de cada racó, amb una imatge cadascuna. `ACTIVITATS.md` actualitzat.

## Regles que es mantenen

- Cap paraula escrita durant l’encercament, ordre d’esquerra a dreta, ressaltat clar de la suite, pista del commutador després d’una volta en blanc, senyal d’espera; cap cara a les joguines (una sola franja de vidre, una sola barra groga de para-xocs; el fanal és un sol llum, no dos fars). Criteris de disseny propis, no evidència.
- Fotosensibilitat: cap gag nou fa parpellejar res (el fum, el xiulet i els troncs són moviments lents; el fanal s’encén una sola vegada i es queda encès); tot per sota dels tres canvis per segon del criteri 2.3.1 (W3C, 2023), que és el llindar de referència per a la fotosensibilitat en contingut web (Harding i Jeavons, 1994, per a la base clínica del llindar).
- Música i sons només dels bancs de la suite (cap enregistrament nou): contrabaix, violí, arpa, flauta i triangle dels instruments ja mostrejats; claus, tambors, rascar, sonall, bufs, cops de fusta i xocs dels bancs de foley existents; alba, vent, granotes i nit dels paisatges sonors existents.
- El vehicle es veu sempre: al passadís no hi ha cap tub ni túnel.

## Proves

- `node --test tests/*.test.mjs`: 422 de 425 verdes (les 3 vermelles són les de sempre: enregistraments de la masia, dels instruments i dels detectius que no són al disc); `tests/vehicles.test.mjs` (10) i `tests/info.test.mjs` actualitzades i verdes.
- Fotogrames del passadís amb three.js (SwiftShader, 1280×720 i 2560×1440): el banc amb les quatre safates (carrosseries, rodes amb les bieles, accessoris), la locomotora amb les bieles, el tren amb la xemeneia fumejant sobre la via, el tramvia creuant el pont, el vagó amb el fanal, els troncs al garatge (nit), la vista tranquil·la del passadís sencer, el capvespre amb decoració atenuada i sense decoració, i el dibuix pla sense WebGL.
- Fitxer construït (`Pim_Pam_44_activitats_v0_58.html`, 65.139.629 bytes) obert a Chromium sense errors de consola: portada, carpeta, fitxa, panell ⓘ (88 entrades), càrrega, pestanya «Aquesta activitat» amb «Primer racó», pausa i safata del taller.
- Les 88 imatges del panell ⓘ renderitzades de nou (`tools/vehicles-info.mjs`) i `production/info/make_info.py` executat.

## Per revisar (en Marc)

1. El passadís: els colors (paret blavosa, arrambador crema, parquet), la porta, el penjador, el banc de les sabates, l’estora i el pont; qualsevol moble es pot canviar.
2. Els sis vehicles de tren i els quatre accessoris nous, sobretot el fum de la xemeneia i els troncs que roden al garatge.
3. La via de fusta: si es prefereix una via més discreta (només travesses) o més marcada, és un canvi petit.
4. La cançó de tren: si convé més o menys volum de la vora del tambor.
5. La fase 4 (el bany, amb els vehicles d’aigua i aire) segueix tot seguit com a 0.59.
6. ~~Publicar a GitHub Pages~~ Fet el 8 de novembre a les 20:11 (hora de Catalunya), dins la fusió 16a6b3d amb la 0.55.

## Referències

- Harding, G. F. A., i Jeavons, P. M. (1994). *Photosensitive epilepsy* (2a ed.). Mac Keith Press.
- three.js authors. (2026). *three.js* (versió r187) [Programari]. https://threejs.org
- W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2* (W3C Recommendation, 5 d’octubre de 2023). https://www.w3.org/TR/WCAG22/

# Pim Pam 0.57 · El taller de vehicles: el pati dels vehicles d’obres (fase 2)

Base: 0.56 (commit 67e1006). Segona de les quatre fases del pla aprovat per en Marc el 8 de novembre de 2026 («Quan tinguis tot això ja pots fer les fases 1 a 4»). El número 0.55 el fa servir la nova Pluja de colors, que es publica des d’un altre fil.

## Què canvia

- **El pati, tercer racó de la casa.** Cada quatre vehicles el taller passa al racó següent: habitació → sala → pati → habitació… L’ajust «Primer racó» (pestanya «Aquesta activitat») admet ara el pati. El pati té una paret ocre amb un sòcol de maons, rajoles de terrissa, una finestra a l’esquerra (amb la lluna de nit), una porta de fusta crema amb el marc corall i una enfiladissa verda al damunt, un estenedor amb tres peces de roba (crema, menta i groga), un sorral de fusta ple de sorra que el circuit creua, un tub de formigó que el vehicle travessa per dins just després de la rampa, una pila de pneumàtics (un de recolzat), un test amb planta, una galleda corall amb sorra i una pala blava.
- **Sis vehicles d’obres.** Camió bolquet (taronja, cabina alta i caixa baixa amb baranes), excavadora (groga, cabina alta al darrere i motor llarg al davant), buldòzer amb pala frontal (corall, amb la pala grisa inclinada i dos braços), piconadora (verda, amb sostre crema sobre la cabina), carretó elevador (blau, curt, amb màstil i dues forquilles arran de terra: la barra groga queda darrere les forquilles) i tractor (lila, amb tub d’escapament). Com sempre: una sola franja de vidre, una sola barra groga de para-xocs, cap cara.
- **Sis rodes.** Noves: corrons de piconadora (dos cilindres grisos amples com el vehicle, retruny greu i regular, ni bots ni inclinació), rodes grans del darrere (dues grans marina amb tacs al darrere i dues de petites al davant, com un tractor; també a la safata), massisses (petites i gruixudes, tic-tic ràpid de claus) i gegants de tacs (grises, el vehicle va alt i bota amb un so de molla); compartides amb els altres racons: tacs i erugues.
- **Sis accessoris.** Nous: el braç amb pala (torreta, braç, segon braç i pala; quan el vehicle creua el sorral, el braç baixa, la pala rasca la sorra, aixeca un grapat i el torna a deixar), la caixa basculant (al garatge s’aixeca pel davant i tres grapats de sorra roden cap enrere fins a la placa), el tambor de formigonera (gira tota l’estona pel camí, tret de la vista tranquil·la; al garatge s’inclina i deixa anar una bola grisa) i els cons de senyalització (tres cons apilats que cauen un a un a un terç, a la meitat i a dos terços del camí i es queden a terra vora el circuit fins que comença la ronda següent); compartits: remolc i llum giratori.
- **La cançó de feina del pati.** Música pròpia en Re dòric a 100 pulsacions per minut, sense swing: les claus marquen els cops de martell (a l’u, al dos i mig i al tres), el tambor al dos i al quatre, el violoncel pinçat a l’u, al tres i al final del compàs, el fagot respon als contratemps i la marimba porta la tonada; la cadència del garatge acaba amb les claus. Els tastos de les peces del pati van amb la marimba, els tambors, les claus i la molla. Aire del pati: merla al matí, cigales a la tarda, grills al capvespre i la nit.
- **Panell ⓘ i catàleg.** 66 entrades: les divuit peces i les quatre hores de cada racó, amb una imatge cadascuna. `ACTIVITATS.md` actualitzat.

## Regles que es mantenen

- Cap paraula escrita durant l’encercament, ordre d’esquerra a dreta, ressaltat clar de la suite, pista del commutador després d’una volta en blanc, senyal d’espera; cap cara a les joguines (una sola franja de vidre, una sola barra groga de para-xocs; el llum giratori és una sola cúpula, no dos fars). Criteris de disseny propis, no evidència.
- Fotosensibilitat: cap gag nou fa parpellejar res (la pala, la caixa, el tambor i els cons són moviments lents); el llum giratori continua respirant a 1 Hz com a màxim; tot per sota dels tres canvis per segon del criteri 2.3.1 (W3C, 2023), que és el llindar de referència per a la fotosensibilitat en contingut web (Harding i Jeavons, 1994, per a la base clínica del llindar).
- Música i sons només dels bancs de la suite (cap enregistrament nou): violoncel, fagot i marimba dels instruments ja mostrejats; claus, tambors, cruixits de terra, rascar, sacsejada, molla, cops secs i «plop» dels bancs de foley existents; merla, cigales, grills i nit dels paisatges sonors existents.
- El tub de formigó amaga el vehicle durant menys d’un segon de cada volta; és l’únic moment en què no es veu.

## Proves

- `node --test tests/*.test.mjs`: 422 proves passen i 3 fallen, les mateixes tres de sempre (enregistraments de la masia, dels instruments i dels Detectius de sons que no són al disc d’aquest entorn); `tests/vehicles.test.mjs` (10) i `tests/info.test.mjs` actualitzades i verdes.
- Fotogrames del pati amb three.js (SwiftShader, 1280×720 i 2560×1440): el banc amb les quatre safates (carrosseries, rodes amb les grans del darrere, accessoris), el bolquet amb els corrons, la baixada de la rampa cap al tub, l’excavadora excavant al sorral, el tractor deixant caure els cons, la piconadora amb el tambor, el carretó sortint del tub, la caixa bolcant la sorra al garatge (nit), el tambor al garatge, la vista tranquil·la, el capvespre amb decoració atenuada i sense decoració, i el dibuix pla sense WebGL.
- Fitxer construït (`Pim_Pam_44_activitats_v0_57.html`, 64,7 MB) obert a Chromium sense errors de consola: portada, carpeta, fitxa, panell ⓘ (66 entrades), càrrega, pestanya «Aquesta activitat» amb «Primer racó», pausa i safata del taller.
- Les 66 imatges del panell ⓘ renderitzades de nou (`tools/vehicles-info.mjs`) i `production/info/make_info.py` executat.

## Per revisar (en Marc)

1. El pati: els colors (paret ocre i terrissa), la porta, l’estenedor, el sorral, el tub i els pneumàtics; qualsevol moble es pot canviar.
2. Els sis vehicles d’obres i els quatre accessoris nous, sobretot la pala al sorral i els cons que es queden a terra.
3. El tub de formigó: el vehicle hi desapareix menys d’un segon; si es prefereix veure’l sempre, es pot fer el tub més curt o obert per dalt.
4. La cançó de feina: si convé més o menys volum de les claus.
5. La fase 3 (el passadís, amb el tren) segueix tot seguit com a 0.58.
6. ~~Publicar a GitHub Pages~~ Fet el 8 de novembre a les 20:11 (hora de Catalunya), dins la fusió 16a6b3d amb la 0.55.

## Referències

- Harding, G. F. A., i Jeavons, P. M. (1994). *Photosensitive epilepsy* (2a ed.). Mac Keith Press.
- three.js authors. (2026). *three.js* (versió r187) [Programari]. https://threejs.org
- W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2* (W3C Recommendation, 5 d’octubre de 2023). https://www.w3.org/TR/WCAG22/

---

# Pim Pam 0.56 · El taller de vehicles: els racons de la casa i la sala dels vehicles d’emergències (fase 1)

Base: 0.54 (commit 406dea7). Primera de les quatre fases del pla aprovat per en Marc el 8 de novembre de 2026 («Quan tinguis tot això ja pots fer les fases 1 a 4»). El número 0.55 el fa servir la nova Pluja de colors, que es publica des d’un altre fil; per això aquesta versió és la 0.56.

## Què canvia

- **Els racons de la casa.** El taller ja no és només l’habitació: cada quatre vehicles (una volta sencera de matí, tarda, capvespre i nit) el banc, el tauler d’eines, el prestatge, el llum, la rampa i el garatge passen al racó següent de la casa, que té la seva pròpia paret, terra, mobles, circuit, música i aire. Ajust nou «Primer racó» a la pestanya «Aquesta activitat» (l’habitació per defecte; o la sala), que tria per on comença; la resta de racons arriben per torn. Les peces d’un racó es construeixen la primera vegada que hi arribem (sense cortina ni aturada perceptible: entre un vehicle i el següent), i les de l’habitació es conserven.
- **La sala.** Paret color préssec amb cercles suaus, un rellotge i un quadre amb turons, finestra a la dreta (amb la lluna de nit), rajoles hidràuliques crema amb quarts de cercle menta i un rombe corall, un sofà gran corall pàl·lid amb coixins crema i un coixí groc, una tauleta baixa de fusta sobre una catifa lila pàl·lida, una pila de dos llibres (marina i corall, amb les pàgines i el llom) i un test corall amb una poncella groga. El circuit baixa la rampa, voreja el sofà, puja la pila de llibres (l’única pujada de tota la casa), passa per sota la tauleta, s’acosta al test i arriba al garatge, sempre vist des de fora i de lluny; les càmeres de la volta i de la vista tranquil·la són més enrere que a l’habitació perquè el circuit s’acosta més al davant de la sala.
- **Sis vehicles d’emergències.** Camió de bombers (corall, cabina alta i caixa llarga amb franja crema), ambulància (groga, caixa alta amb franja i creus corall), camió plataforma (taronja, plataforma baixa amb capçal i baranes: els accessoris hi van a la plataforma), tot terreny de rescat (verd, quadrat, amb roda de recanvi i barra al sostre), cotxe de policia (blau, baix, franja crema) i furgó de rescat (lila, alt, amb finestra del darrere). Cada un té el seu color, com a l’habitació. Cap cara: una sola franja de vidre i una sola barra groga de para-xocs.
- **Sis rodes.** Noves: bessones de camió (dues rodes primes juntes, tam-tam lleuger), erugues (dues cintes amb dents crema sobre tres corrons corall; les dents van passant mentre el vehicle avança i fan cruixir el terra), de globus (liles, grosses i toves, boten i fan un so de gelatina) i de ferro (grises amb quatre forats i cub corall, dringuen a les rajoles); i, compartides amb l’habitació, les de tacs i les de tapacubs.
- **Sis accessoris.** Nous: el braç de grua (mira cap enrere; al garatge puja, baixa el cable fins a terra, agafa un bloc lila i l’aixeca a poc a poc), el canó d’aigua (a mig camí engega catorze gotes blaves en arc cap al test, i la flor del test s’obre), la campana (es gronxa i repica quatre vegades quan el vehicle puja els llibres) i la mànega enrotllada (al garatge el rodet gira i la mànega es desenrotlla pel terra fins al broc groc); i, compartits, l’escala i el llum giratori (a la sala sona amb la trompeta).
- **La marxa de la sala.** Música pròpia: una marxa de metalls en Si♭ major a 116 pulsacions per minut, sense swing: la tuba a l’u i al tres, la trompa al dos i al quatre (i, amb la banda plena, un contratemps suau), la caixa i el tambor, la trompeta amb la tonada i una campaneta (glockenspiel) que dobla la primera nota de cada compàs; la cadència del garatge acaba amb la campaneta. Els tasts de les carrosseries de la sala els fa la trompa. L’aire de la sala dona al carrer: una merla llunyana al matí, coloms a la tarda, grills al capvespre i la nit.
- **El garatge.** Els dos circuits acaben ara sobre la placa del garatge (abans el vehicle quedava vuit unitats enfonsat dins la placa): les rodes, la torre de blocs, la grua i la mànega hi seuen bé.
- **Panell ⓘ i catàleg.** 44 entrades: les divuit peces i les quatre hores de cada racó («L’habitació, matí», «La sala, nit»…), amb una imatge cadascuna. `ACTIVITATS.md` actualitzat.

## Regles que es mantenen

- Cap paraula escrita durant l’encercament, ordre d’esquerra a dreta, ressaltat clar de la suite, pista del commutador després d’una volta en blanc, senyal d’espera; cap cara a les joguines (una sola franja de vidre, una sola barra groga de para-xocs; el llum giratori és una sola cúpula, no dos fars). Criteris de disseny propis, no evidència.
- Fotosensibilitat: el llum giratori respira a 1 Hz com a màxim; el gag de l’aigua i el de la campana no fan parpellejar res; tot per sota dels tres canvis per segon del criteri 2.3.1 (W3C, 2023), que és el llindar de referència per a la fotosensibilitat en contingut web (Harding i Jeavons, 1994, per a la base clínica del llindar).
- Música i sons només dels bancs de la suite (cap enregistrament nou): tuba, trompa, trompeta i glockenspiel dels instruments ja mostrejats; cruixits, gelatina, plats, xiulets d’aigua i campana dels bancs de foley existents.

## Proves

- `node --test tests/*.test.mjs`: 422 proves passen i 3 fallen, les mateixes tres de sempre (enregistraments de la masia, dels instruments i dels Detectius de sons que no són al disc d’aquest entorn); `tests/vehicles.test.mjs` (10) i `tests/info.test.mjs` actualitzades i verdes.
- Fotogrames de la sala amb three.js (SwiftShader, 1280×720 i 2560×1440): el banc amb les quatre safates, la carrosseria que aterra, la rampa, la pujada dels llibres amb la campana, el canó regant el test, el pas per sota la tauleta, la vista tranquil·la, la grua i la mànega al garatge (capvespre i nit), l’arribada del cotxe de policia, el banc de nit i la sala com a primer racó (construcció de les peces en calent). Dibuix pla sense WebGL comprovat per a totes les peces noves. Presentació del decorat «sense» i «atenuat» comprovades.
- Fitxer construït (`Pim_Pam_44_activitats_v0_56.html`, 64,3 MB) obert a Chromium sense errors de consola: portada, carpeta, fitxa, panell ⓘ (44 entrades), càrrega, pestanya «Aquesta activitat» amb «Primer racó», pausa i safata del taller.
- Les 44 imatges del panell ⓘ renderitzades de nou (`tools/vehicles-info.mjs`) i `production/info/make_info.py` executat.

## Referències

- Harding, G. F. A., i Jeavons, P. M. (1994). *Photosensitive epilepsy* (2a ed.). Mac Keith Press.
- three.js authors. (2026). *three.js* (versió r187) [Programari]. https://threejs.org
- W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2* (W3C Recommendation, 5 d’octubre de 2023). https://www.w3.org/TR/WCAG22/

---

# Pim Pam 0.55 · La nova Pluja de colors

Base: 0.52.4 (commit e705207), l’última versió publicada. La 0.53 i la 0.54 són el Taller de vehicles en 3D, que encara no s’ha publicat i es farà sobre aquesta. Demanat per en Marc el 8 de novembre de 2026, a partir del seu concept art: una pantalla negra on cauen gotes de colors, primer al centre, i el color s’escampa i es barreja fins que omple la pantalla; «cada gota és una nota i cap nota no sona sense gota»; «la nota ha de sonar quan cada gota toca el terra»; al final el color es dilueix fins al negre i comença una melodia nova, amb uns altres colors i un altre ritme de gotes. Prova d’estil aprovada («Publica-ho», 13:13). «De moment no busquis alternatives a WebGL» (13:16). «Aquesta activitat no ha de tenir l’opció d’eliminar o atenuar fons, sempre serà igual» (13:23).

- **Activitat nova: Pluja de colors (CE45)**, a «Formes, llum i música», després de Flor de paper. Gotes de pintura (CE03) continua sent l’última de la carpeta i no canvia.
- **Cada pulsació, una frase de gotes.** Primer cau la nota greu de l’acord, com una gota gran, i després la melodia, com a gotes més petites (una nota aguda fa una gota petita). Cada gota sona en el moment exacte en què toca el terra, i no sona cap nota sense la seva gota. La primera frase de cada escena cau al centre; les altres, on la pintura toca el negre, i al final dins dels forats negres que queden. Després de l’última pulsació, el color acaba d’omplir la pantalla, es dilueix fins al negre i comença l’escena següent.
- **Deu escenes**, cadascuna amb els seus colors (set tintes, una per a cada nota de l’escala, i una tinta pàl·lida per a les cèl·lules), la seva melodia original, el seu instrument real puntejat o percudit i el seu ritme de gotes: Primera llum (els colors del concept art, arpa), Mar endins (marimba), Jardí de nit (kalimba), Foc lent (guitarra), Pluja d’estiu (glockenspiel), Aurora (piano), Caramel (marimba), Tempesta suau (violins en pizzicato), Fruites (arpa) i Pols d’estrelles (glockenspiel). Les notes greus són de violoncel en pizzicato, arpa, marimba o piano.
- **El terra** és un líquid espès simulat en temps real a la targeta gràfica (WebGL 2), el mateix motor de la prova d’estil: anells, franges, cèl·lules, relleu, ones i la corona de cada esquitx.
- **Ajustos** (pestanya «Aquesta activitat»): gotes de cada pulsació (una, una frase curta o una frase llarga amb el seu eco), pulsacions per omplir la pantalla (6, 10 o 16), vista (en perspectiva o des de dalt), moviment del líquid (quiet, lent o viu) i primera escena. **Sense opcions de fons:** es veu sempre igual, amb el terra negre.
- **Moviment reduït:** les gotes no cauen per l’aire (apareixen on toquen el terra), sense esquitxos ni corrent.
- **Cap escena comença igual.** Cada escena, i cada vegada que s’entra a l’activitat, té el seu propi gir per triar on cauen les gotes i el seu propi punt de partida del corrent lent, de manera que els remolins i les formes no es repeteixen d’una escena a l’altra.
- **Sense panell ⓘ.** D’una escena a l’altra només canvien els colors, l’instrument i el ritme, i en Marc va veure que no calien fitxes per a cada una (14:54). La fitxa de la portada té la seva imatge, i el nom de cada escena surt a l’ajust «Primera escena».
- **Sense WebGL 2** la pantalla queda negra i l’ajuda ho explica (les notes sí que sonen).
- **Correcció del motor:** l’anivellament que tanca les escletxes negres feia fronts rectes; ara les tanca seguint la seva forma.
- **Proves.** 419 de 422 superades; les 3 que fallen ja fallaven a la 0.52.4 (mida dels fitxers de so de la masia, dels instruments gravats i de Detectius de sons). Comprovat en un navegador sense targeta gràfica (Chromium amb SwiftShader): l’escena plena, la dilució fins al negre i l’escena següent amb els seus colors. Aquest navegador és massa lent per jugar-hi en temps real, i per això cal provar-la en un ordinador amb targeta gràfica.
- **Publicació.** Publicada a GitHub Pages el 8 de novembre de 2026 a les 15:18 (commit 499e447).

---

# Pim Pam 0.54 · El taller de vehicles: xassís amagat, passeig vist des de fora, sis peces de cada família i safata de quatre

Base: 0.53 (commit 18c1b01). Demanat per en Marc el 8 de novembre de 2026: «Està bé, però els xassís haurien de quedar més ben encaixats als vestits, que no es vegi tant l’estructura de sota, i quan fa el passeig millor que no sigui una perspectiva POV, millor des de l’exterior i a més distància, perquè es vegi l’habitació. També hi hauria d’haver més diversitat de carrosseries, rodes i accessoris, 6 de cada. I que l’encercament es faci entre quatre elements, en comptes de tres. Quan tinguis tot això ja pots fer les fases 1 a 4.»

## Què canvia

- **El xassís, amagat sota la carrosseria.** La carrosseria seu més avall sobre el banc i és més ampla (17 unitats en lloc de 14), de manera que tapa la placa grisa del xassís pels dos costats i pel davant i el darrere; els pius de la placa s’amaguen quan hi ha carrosseria (i ja mentre aterra). Només queden a la vista els dos eixos on van les rodes, fins que les rodes hi són.
- **El passeig, vist des de fora i de lluny.** Les tres càmeres del recorregut són exteriors i allunyades: la baixada de la rampa es veu des de la dreta de l’habitació, la volta des del davant (la càmera llisca una mica seguint el vehicle i mira entre el vehicle i el centre de l’habitació) i l’arribada des de l’esquerra, cap al garatge. En cap moment la càmera va dins del vehicle ni enganxada darrere seu, i l’habitació sencera (llit, catifa amb els blocs, banc amb la rampa, garatge) es veu tota l’estona. La càmera del banc també s’ha allunyat una mica, perquè hi càpiguen els accessoris alts.
- **Sis carrosseries, sis jocs de rodes, sis accessoris.** Noves carrosseries: la camioneta de caixa oberta (taronja, amb baranes i porta del darrere) i el cotxe escarabat (lila, tot rodó). Rodes noves: amples de goma (grises, el vehicle flota i fa un so tou de goma), de radis (sis radis, tic-tic ràpid amb les claves) i amb tapacubs (gris lluent amb botó groc, silencioses, només un buf en arrencar). Accessoris nous, cadascun amb el seu gag i el seu so: el llum giratori (gira tot el recorregut i a partir de la meitat s’encén i respira a 1 Hz, amb un ni-no suau de clarinet), l’escala de bombers (al garatge s’aixeca i el segon tram s’allarga: tres clics de fusta i un estirament) i el globus lligat (lligat al darrere del vehicle amb un fil que s’inclina cap enrere, es gronxa durant la volta i al garatge el fil es deixa anar i el globus puja fins a perdre’s de vista, amb la tela que s’infla, tres notes de piano i una campaneta). Els sis colors de pintura (quan hi ha quatre passos) afegeixen lila i taronja. Dos tints nous a la paleta tancada del concepte (lila 7D5FD8, taronja FF8C3A): per revisar.
- **La safata, de quatre peces.** Ajust nou «Peces a la safata» (dues, tres o quatre; quatre per defecte) a la pestanya «Aquesta activitat». Aquesta activitat ja no segueix «Opcions de contingut» de la configuració general (abans en prenia les tres peces). Cada ronda ofereix quatre de les sis peces de cada família, i les peces van rodant de ronda en ronda: en sis rondes cada peça s’ha ofert exactament quatre vegades, de manera que totes passen.
- **Panell ⓘ i catàleg.** Vint-i-dues entrades (les divuit peces, amb el que fa cadascuna, i les quatre hores del dia), amb la imatge de cada peça posada al xassís. La imatge de la fitxa de portada s’ha tornat a fer (el cotxe familiar amb la baca al banc). `ACTIVITATS.md` actualitzat.

## Regles que es mantenen

- Cap paraula escrita durant l’encercament, ordre d’esquerra a dreta, ressaltat clar de la suite, pista del commutador després d’una volta en blanc, senyal d’espera; cap cara a les joguines (una sola franja de vidre, una sola barra groga de para-xocs; el llum giratori és una sola cúpula, no dos fars).
- Fotosensibilitat: el llum giratori respira a 1 Hz com a màxim (una pujada i una baixada d’intensitat per segon), per sota dels tres canvis per segon del criteri 2.3.1 (W3C, 2023); cap altre element parpelleja.
- Música i sons només dels bancs de la suite (cap enregistrament nou).

## Proves

- **Automàtiques.** `node --test tests/*.test.mjs`: 425 proves, 422 passen; les 3 que fallen són les d’abans (enregistraments de la masia, dels instruments i de Detectius de sons que no són al disc d’aquest entorn), sense relació amb aquesta versió. `tests/vehicles.test.mjs` (10 proves, actualitzades): sis peces de cada família amb identificadors únics i noms llargs, rotació de l’oferta (amb quatre caselles, cada peça i cada color surten exactament quatre vegades en sis rondes), `vhCells` i la seva validació, flux dins el motor d’encercament amb quatre opcions, sons dins l’efecte de cada peça nova, panell ⓘ de 22 entrades, catàleg.
- **Al navegador (Chromium sense GPU, SwiftShader), des del fitxer construït.** Portada, carpeta «Encercament: triar i crear» amb la fitxa nova, panell ⓘ (22 entrades), cortina de càrrega, el taller amb la safata de quatre caselles, la pestanya «Aquesta activitat» amb l’ajust «Peces a la safata», la pausa. Cap error de pàgina. Els moments de dins de l’activitat (`imatges/09` a `25`) són fotogrames deterministes de `tools/vehicles-frames.mjs` a DPR 2: xassís sol i amb carrosseria, les peces noves, els tres plans exteriors del passeig, el llum encès en arribar, l’escala aixecada al garatge, la safata de nit i la safata de tres (ajust).
- **No provat:** tauletes i ordinadors reals (rendiment amb sis peces més per família, tacte), Safari i Firefox.

## Per revisar (en Marc)

1. Els dos tints nous (lila i taronja) i les sis peces noves, especialment el globus lligat al darrere (a l’habitació no hi cabia a sobre del sostre de l’autobús).
2. La distància de les tres càmeres del passeig: es poden allunyar o acostar més.
3. Les fases 1 a 4 del pla segueixen tot seguit, cadascuna com una versió nova per revisar.
4. ~~Publicar a GitHub Pages~~ Fet el 8 de novembre a les 20:11 (hora de Catalunya), dins la fusió 16a6b3d amb la 0.55.

## Referències

- three.js authors. (2026). *three.js* (versió r187) [Programari]. https://threejs.org
- W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2* (W3C Recommendation, 5 d’octubre de 2023). https://www.w3.org/TR/WCAG22/

---

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
4. ~~Publicar a GitHub Pages~~ Fet el 8 de novembre a les 20:11 (hora de Catalunya), dins la fusió 16a6b3d amb la 0.55.

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

