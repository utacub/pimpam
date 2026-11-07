import {INK_PATTERNS,patternScore} from './patterns.js';
import {KALEIDO_MIN_DURATION} from './kaleido-base.js';
import {KALEIDO_PATTERNS,kaleidoScore} from './kaleido.js';
import {VITRALL_MIN_DURATION,VITRALL_PATTERNS,vitrallScore} from './vitrall.js';
import {NATURA_MIN_DURATION,NATURA_PATTERNS,naturaScore} from './natura.js';
import {PIRO_MIN_DURATION,PIRO_PATTERNS,piroScore} from './piro.js';
import {DB_MIN_DURATION,DB_SET,dbScore} from './dibuixos.js';
import {JG_SET} from './joguines.js';
import {CN_SET} from './cuina.js';
import {DW_ART} from './dibuixos-art.js';
import {PC_CAUSE,PC_MIN,pcScore} from './color-rain.js';
import {FONS_N,FONS_STIM,FONS_SURF,fonsCamera,fonsDuration,fonsRest,fonsScore} from './fons.js';
import {SELVA_N,SELVA_START,SELVA_STIM,selvaCamera,selvaDuration,selvaRest,selvaScore} from './selva.js';
import {SABANA_N,SABANA_START,SABANA_STIM,sabanaCamera,sabanaDuration,sabanaRest,sabanaScore} from './sabana.js';
import {POU_N,POU_START,POU_STIM,pouCamera,pouDuration,pouRest,pouScore} from './pou.js';
import {GG_N,GG_START,GG_STIM,ggCamera,ggDuration,ggRest,ggScore} from './gegants.js';
import {MR_CAUSE,MR_MIN,mrScore} from './musical-rain.js';
import {DIA_MIN_DURATION,DIA_STOPS,diaNext,diaPhase,diaScore,diaStart} from './dia.js';
import {OQ_STEP_MIN,OQ_FINAL_MIN,oqScore} from './orquestra.js';
import {SK_STEP_MIN,SK_FINAL_MIN,skScore} from './constel.js';
import {FEM_STEP_MIN,FEM_FINAL_MIN,FEM_PRESSES,femScore} from './castells.js';
// Fem castells goes one press for each part of the castell (8), whatever the setting says (0.45.8).
const ceSteps=(item,s)=>item?.id==='castells'?{...s,steps:FEM_PRESSES}:s;
import {GB_STEP_MIN,GB_FINAL_MIN,gbScore} from './globus.js';
import {MG_STEP_MIN,MG_FINAL_MIN,mgScore} from './mag.js';
import {CB_STEP_MIN,CB_FINAL_MIN,cbScore} from './cambrer.js';
import {TC_FINAL,TC_KNOCK_EVERY,TC_VISIT,tcDone,tcKnockScore,tcPress,tcScore,tcTick} from './toc.js';
import {FI_SHOT,FI_TICK,fiCountScore,fiDone,fiPress,fiScore,fiSpan,fiTick,fiTickScore} from './fira.js';
import {FAR_FINAL,FAR_MISS,FAR_STEP,farDock,farPress,farScore,farTick} from './far.js';
import {VENT_CHANGE,VENT_GUSTS,VENT_SPAN,VENT_VARIANTS,ventEnd,ventOffset,ventRelease,ventScore,ventWind} from './vent.js';
import {ESC_WAIT_START,escWaitClock,escWaitTurn} from './escenari.js';

// The seed of each activity (its palette and where its pieces start) is its old place in the list, kept as it was before the activities
// made with ChatGPT were taken out (0.26.1), so that nothing changes in the ones that stay.
const CE_SEEDS=Object.freeze({jungle:24,savanna:25,well:26,giants:27,bubbles:2,jelly:3,daynight:6,constellations:7,orchestra:9,castells:17,balloons:18,lighthouse:19,wind:20,magician:21,door:22,waiter:23,fira:28});
const EXTRA_CAUSES=Object.freeze([
 ['bubbles','CE05','Bombolles de sabó','Bombolles iridescents que creixen, s’agrupen, suren i es transformen en gotes.','burst',true],
 ['jelly','CE06','Fons marí de vidre','Un descens pel mar, de la superfície fins al fons de l’abisme, entre criatures de vidre, seda i llum. A cada pulsació la càmera viatja fins a les criatures següents: una flota de veles blaves, meduses de lluna, un banc de plata, cinturons de Venus, salpes, àngels de mar, un sifonòfor, el calamar vampir, pirosomes, esponges de vidre, pops dumbo… Cada escena té el seu moviment, els seus colors i la seva música d’instruments acústics reals. Quan s’acaba, l’escena s’atura i s’enfosqueix fins a la pulsació següent. Després de la vintena escena, la càmera torna a pujar fins a la superfície.','burst',false],
 ['jungle','CE35','Selva de llum','Un descens per la selva tropical americana, del cel de l’alba al llit del riu de nit. A cada pulsació la càmera viatja fins als animals següents: guacamais, tucans, colibrís, un peresós, papallones morfo, tamarins, la granota d’ulls vermells, granotes punta de fletxa, formigues talladores, bolets que brillen, cuques de llum, capibares, la victòria amazònica, el dofí rosat, rajades i l’arapaima. Cada escena té el seu moviment, la seva llum i la seva música d’instruments acústics reals amb sons de la selva. Quan s’acaba, l’escena s’atura i s’enfosqueix fins a la pulsació següent. Després de la vintena escena, la càmera torna a pujar fins al cel.','burst',false],
 ['savanna','CE36','Sabana de paper','Un dia a la sabana de l’Àfrica oriental, fet de paper retallat com un diorama: de l’alba al Kilimanjaro fins a la nit estrellada. A cada pulsació la càmera viatja fins als animals següents: flamencs, grues coronades, girafes, elefants, zebres, impales, facoquers, nyus que travessen el riu, hipopòtams, blauets, rinoceronts, un termiter per dins, mangostes, teixidors, guepards, lleons a la posta, el baobab amb ratpenats, l’escarabat piloter i l’oricteròp. Cada escena té el seu moviment, la seva hora del dia i la seva música pròpia de kalimba, tambor de mà i sonall, amb els sons de la sabana. Quan s’acaba, l’escena s’atura i s’enfosqueix fins a la pulsació següent. Després de la vintena escena, la càmera torna a pujar fins al cel estrellat, a punt d’una altra alba.','burst',false],
 ['giants','CE38','Gegants del blau','Una travessia pels oceans del món, de l’Àrtic a l’oceà Austral. A cada pulsació la càmera viatja per l’aigua fins a un gran animal marí que hi entra nedant, fa el seu gest més espectacular i se’n va: els narvals al gel, les belugues, la balena de Groenlàndia que trenca el gel, el tauró pelegrí, les iubartes i la seva xarxa de bombolles, un banc de tonyines, els catxalots que dormen drets, el rorqual comú, el peix lluna, els dofins a la proa d’un veler, el salt de la iubarta, els taurons martell, el peix rem, els dofins rotadors, el tauró balena, les mantes, el dugong, la balena franca amb la seva cria, les orques i la balena blava. Cada escena té la seva llum, els seus sons i la seva música d’instruments acústics. Quan s’acaba, l’escena s’atura i s’enfosqueix fins a la pulsació següent. Després de la vintena escena, la càmera puja amb la balena blava fins a la superfície, a la posta de sol.','burst',false], ['well','CE37','El pou del temps','Un viatge pel temps a través de les capes de roca: de l’Edat del Gel fins als primers dinosaures. A cada pulsació la càmera baixa per la roca fins a un fòssil que es desperta i es vesteix de vida: mamuts, esmilòdons, el rinoceront llanut i el cérvol gegant, el megateri, tiranosaures, triceratops, l’anquilosaure, l’abditosaure del Pirineu, el velociraptor, el citipati al niu, parasaurolophus, el pteranodon i el plesiosaure, l’espinosaure, el yutyrannus, iguanodons, l’arqueòpterix, l’estegosaure, el braquiosaure i el diplodoc, els ictiosaures i l’eoraptor. Cada escena és una petita història amb la seva llum, els seus sons i la seva música d’instruments acústics. Quan s’acaba, l’escena s’atura i s’enfosqueix fins a la pulsació següent. Després de la vintena escena, la càmera torna a pujar fins al jardí d’avui, on canta un pit-roig.','burst',false], ['daynight','CE09','Dia rere dia','Cada pulsació fa avançar el dia en un poble de paper: albada, matí, migdia, tarda, posta, vespre, nit i matinada. A cada moment passa una cosa diferent, i cada dia és diferent de l’anterior.','cycle',false],
 ['constellations','CE10','El cel de les constel·lacions','Un cel de nit sobre un paisatge. Cada pulsació encén una estrella gran, la uneix amb un fil de llum a l’anterior i fa passar alguna cosa al paisatge. A la darrera, les estrelles dibuixen una figura que s’omple de color, travessa el cel i es desfà en estels.','sequence',false],
 ['orchestra','CE12','L’orquestra que es desperta','Un escenari de festa a les fosques, amb cadires buides. Cada pulsació desperta una secció de l’orquestra, que s’afegeix a la mateixa peça amb instruments enregistrats; a la darrera, toquen tots junts. Cada ronda canvia la peça, el lloc i l’ordre.','sequence',false],
 ['castells','CE25','Fem castells','Una plaça de trencadís en dia de festa major. La primera pulsació forma la pinya amb els baixos i cadascuna de les següents fa pujar un pis: els segons, els terços, els quarts, els dosos, l’aixecador i l’enxaneta (set pulsacions); a la plaça passa alguna cosa diferent a cada pis. A la darrera, l’enxaneta fa l’aleta, la plaça ho celebra i el castell es desmunta a poc a poc. Hi sona un toc de castells de veritat, de gralles i timbal, gravat en una diada: cada pulsació en fa sonar el tros següent, i l’aleta arriba amb el final de les gralles i els aplaudiments. Cada ronda canvia el castell, la plaça, l’hora i el color de la colla (o la colla porta sempre el color de camisa triat a la configuració).','sequence',false],
 ['balloons','CE27','Festa de globus','Una plaça de festa major cosida amb feltre. Cada pulsació fa pujar un globus fins al cel, i cada globus canta una nota de la cançó de la ronda. A la darrera, quan el cel és ple, tots els globus s’enlairen junts mentre sona la cançó sencera. Els globus no esclaten mai. Cada ronda canvia la plaça, l’hora, els colors i la forma dels globus i la cançó.','sequence',false],
 ['lighthouse','CE28','El far','Un mar de nit gravat en fusta. La llum del far escombra l’aigua a poc a poc. Si es prem quan la llum toca una barca, la barca encén els fanals i el far la guia fins al port, on la rep una petita banda. Si es prem en un altre moment, l’aigua brilla i la llum continua. Cada tres barques canvia la nit. Als ajustos es tria la velocitat de la llum, quanta estona es pot encertar i quantes barques hi ha.','beam',false],
 ['wind','CE26','El vent del bosc','Un paisatge pintat a pinzellades. Mentre mantens premut el commutador hi bufa el vent, i com més estona, més fort: els arbres es vinclen, l’herba fa onades i volen pètals, fulles o roba estesa. En deixar-lo anar, el vent es calma. Hi ha vuit llocs al llarg de l’any; després d’una bona estona de vent, el paisatge canvia.','hold',false],
 ['magician','CE29','El mag desastrós','Un teatret pintat i un mag de dibuixos animats. Cada pulsació és un truc que surt malament d’una manera diferent: el mocador que no s’acaba mai, la flor que esquitxa, la vareta que es nua, el barret de plomes, la baralla que salta i les estovalles. El que cau es queda a l’escenari. A la darrera, el mag entra a l’armari màgic, en surt d’un barret gegant, tot el desordre desapareix i fa una reverència. Cada ronda canvia l’ordre dels trucs i els colors del teatre.','sequence',false],
 ['door','CE30','Toc, toc! Qui hi ha?','Una casa en un carrer de còmic. Al cap d’una estona algú truca a la porta: la porta tremola i es veu llum per sota. Quan prems, la porta s’obre i surt un visitant que fa alguna cosa divertida: el gegant que gairebé no hi cap, el capgròs encallat, la banda que no s’acaba mai, el ninot de neu, l’astronauta, el cuiner i la ballarina. Si prems abans que truquin, no passa res. A l’última visita, tots ballen al carrer. Als ajustos es tria quanta estona s’espera abans que truquin i si el visitant se’n va quan ningú no obre.','knock',false],
 ['fira','CE44','La fira de llauna','Una fira de joguines de llauna estampada. A dalt de la parada hi ha tres bombetes grosses que s’encenen d’una en una amb tres notes que pugen: quan s’encén la tercera, és el moment de prémer. Llavors surt el llançament: la jugadora de bitlles catalanes, l’home bala del canó, el coet de corda, el forçut que fa sonar la campana o la cursa de cavallets, i cada llançament acaba amb una sorpresa diferent i una medalla penjada a la parada. Si es prem abans d’hora no passa res. Després de 3, 5 o 7 llançaments arriba el final de l’atracció i la parada gira cap a la següent. Cinc atraccions amb quatre llums del dia: vint rondes.','ready',false],
 ['waiter','CE31','El cambrer equilibrista','Un llibre il·lustrat dels anys seixanta pintat amb guaix. Un cambrer aguanta una safata amb una sola mà. A cada pulsació s’obre la porta de la cuina i en surt volant alguna cosa que cau damunt la pila: plats, una tassa, un pastís, una tetera, una síndria o una plata de fruita. La pila es gronxa cada vegada més i el cambrer fa equilibris cada vegada més grossos. A la darrera arriba una gelatina, el cambrer n’està molt orgullós i un petit contratemps (un esternut, una pell de plàtan o el singlot) ho fa caure tot a càmera lenta: no es trenca res, cada cosa cau en un lloc segur i la gelatina li queda al cap. Cada ronda canvia l’ordre, el personatge, el lloc i el contratemps.','sequence',false]
].map(([id,code,name,desc,kind,continuous])=>Object.freeze({id,code,name,desc,kind,continuous,type:'ce',level:kind==='sequence'||kind==='cycle'?'03 · Pas a pas':kind==='toggle'?'02 · Transformar':kind==='beam'||kind==='knock'||kind==='ready'?'04 · Al moment':'01 · Descobrir',tag:kind==='cycle'?'2, 4 o 8 moments · cada dia diferent':kind==='sequence'?'3, 5 o 7 passos':kind==='toggle'?'Una pulsació, un canvi':'20 composicions · en seqüència',time:'Al teu ritme',seed:CE_SEEDS[id],...(id==='castells'?{tag:'7 pulsacions · un pis cada vegada'}:{}),...(id==='jelly'?{variants:FONS_N,dive:true,minDuration:FONS_STIM,ownPhases:true,recorded:true,tag:'20 escenes · de la superfície a l’abisme',preview:{time:8,duration:16}}:id==='jungle'?{variants:SELVA_N,dive:true,minDuration:SELVA_STIM,ownPhases:true,recorded:true,tag:'20 escenes · de les capçades al llit del riu',preview:{time:8,duration:16}}:id==='savanna'?{variants:SABANA_N,dive:true,minDuration:SABANA_STIM,ownPhases:true,recorded:true,tag:'20 escenes · de l’alba a la nit',preview:{time:8,duration:16}}:id==='giants'?{variants:GG_N,dive:true,minDuration:GG_STIM,ownPhases:true,recorded:true,tag:'20 escenes · de l’Àrtic a l’oceà Austral',preview:{time:8,duration:16}}:id==='well'?{variants:POU_N,dive:true,minDuration:POU_STIM,ownPhases:true,recorded:true,tag:'20 escenes · de l’Edat del Gel als primers dinosaures',preview:{time:8,duration:16}}:id==='orchestra'?{variants:20,stage:true,recorded:true,stepMin:OQ_STEP_MIN,finalMin:OQ_FINAL_MIN,tag:'3, 5 o 7 passos · 20 rondes diferents',preview:{time:4.2,duration:OQ_STEP_MIN}}:id==='constellations'?{variants:20,stage:true,recorded:true,stepMin:SK_STEP_MIN,finalMin:SK_FINAL_MIN,tag:'3, 5 o 7 passos · 20 rondes diferents',preview:{time:4.2,duration:SK_STEP_MIN}}:id==='castells'?{variants:20,stage:true,recorded:true,stepMin:FEM_STEP_MIN,finalMin:FEM_FINAL_MIN,tag:'3, 5 o 7 passos · 20 rondes diferents',preview:{time:4.6,duration:FEM_FINAL_MIN}}:id==='lighthouse'?{variants:20,beam:true,recorded:true,tag:'Prem quan la llum toca la barca · 20 nits',preview:{time:1,duration:FAR_STEP}}:id==='balloons'?{variants:20,stage:true,recorded:true,stepMin:GB_STEP_MIN,finalMin:GB_FINAL_MIN,tag:'3, 5 o 7 passos · 20 rondes diferents',preview:{time:2.9,duration:GB_FINAL_MIN}}:id==='door'?{variants:20,knock:true,recorded:true,tag:'Espera que truquin i prem · 7 visitants',preview:{time:3.4,duration:TC_VISIT}}:id==='fira'?{variants:20,ready:true,recorded:true,tag:'Espera la tercera bombeta i prem · 5 atraccions',preview:{time:2,duration:FI_SHOT}}:id==='magician'?{variants:20,stage:true,recorded:true,stepMin:MG_STEP_MIN,finalMin:MG_FINAL_MIN,tag:'3, 5 o 7 passos · 20 funcions diferents',preview:{time:7.8,duration:MG_FINAL_MIN}}:id==='waiter'?{variants:20,stage:true,recorded:true,stepMin:CB_STEP_MIN,finalMin:CB_FINAL_MIN,tag:'3, 5 o 7 passos · 20 rondes diferents',preview:{time:2.3,duration:CB_STEP_MIN}}:id==='wind'?{variants:VENT_VARIANTS,wind:true,ownPhases:true,recorded:true,tag:'Mantén premut · 8 llocs al llarg de l’any',preview:{time:8.6,duration:VENT_SPAN}}:id==='daynight'?{variants:1,minDuration:DIA_MIN_DURATION,ownPhases:true,recorded:true,preview:{time:5,duration:10}}:{})})));
// Added after 0.6: collections that manage their own phases and compose their own music; variants sets the length of the cycle.
// recorded: their music is played by recorded instruments, so opening one starts decoding the recordings.
const NEW_CAUSES=Object.freeze([Object.freeze({id:'kaleido',code:'CE21',name:'Caleidoscopi',desc:'Patrons de llum i color sobre negre que neixen del centre, es transformen i s’esvaeixen.',kind:'burst',continuous:false,type:'ce',level:'01 · Descobrir',tag:`${KALEIDO_PATTERNS.length} patrons`,time:'Al teu ritme',seed:17,variants:KALEIDO_PATTERNS.length,minDuration:KALEIDO_MIN_DURATION,ownPhases:true,recorded:true}),
 Object.freeze({id:'vitrall',code:'CE22',name:'Vitralls',desc:'Vitralls de colors que s’encenen peça a peça amb la llum que travessa el vidre, i música de dansa antiga.',kind:'burst',continuous:false,type:'ce',level:'01 · Descobrir',tag:`${VITRALL_PATTERNS.length} vitralls`,time:'Al teu ritme',seed:19,variants:VITRALL_PATTERNS.length,minDuration:VITRALL_MIN_DURATION,ownPhases:true,recorded:true,preview:{time:7,duration:10}}),
 Object.freeze({id:'natura',code:'CE23',name:'Natura',desc:'Formes de la natura fetes de paper retallat que es posen peça a peça, amb música d’instruments acústics reals i sons de natura.',kind:'burst',continuous:false,type:'ce',level:'01 · Descobrir',tag:`${NATURA_PATTERNS.length} formes`,time:'Al teu ritme',seed:23,variants:NATURA_PATTERNS.length,minDuration:NATURA_MIN_DURATION,ownPhases:true,recorded:true,preview:{time:9,duration:12}}),
 Object.freeze({id:'piro',code:'CE24',name:'Piromusical',desc:'Castells de focs de colors que s’obren al ritme d’una banda de música de festa, amb esclats suaus.',kind:'burst',continuous:false,type:'ce',level:'01 · Descobrir',tag:`${PIRO_PATTERNS.length} espectacles`,time:'Al teu ritme',seed:29,variants:PIRO_PATTERNS.length,minDuration:PIRO_MIN_DURATION,ownPhases:true,recorded:true,preview:{time:4.3,duration:10}}),
 // Dibuixos que ballen (0.25): one big drawing of a thick line on black at each press, which dances to its own music and stops.
 Object.freeze({id:'drawings',code:'CE32',name:'Dibuixos que ballen',desc:'A cada pulsació apareix un dibuix gros d’una sola línia gruixuda sobre negre: un tramvia, un timbal, una ballarina, un tren, una tuba… Es dibuixa sol, balla sobre si mateix amb la seva música d’instruments acústics reals i s’atura. Els ajustos permeten triar el color de la línia, una velocitat lenta i que el dibuix no es desplaci.',kind:'burst',continuous:false,type:'ce',level:'01 · Descobrir',tag:`${DW_ART.length} dibuixos`,time:'Al teu ritme',seed:31,variants:DW_ART.length,minDuration:DB_MIN_DURATION,ownPhases:true,recorded:true,preview:{time:3.2,duration:10}}),
 // Joguines que ballen and La cuina que balla (0.26): the same, with twenty toys and twenty things of the kitchen.
 Object.freeze({id:'toys',code:'CE33',name:'Joguines que ballen',desc:'A cada pulsació apareix una joguina grossa d’una sola línia gruixuda sobre negre: una caixa sorpresa, una pilota, un cavallet, un robot, una baldufa, un titella, un io-io… Es dibuixa sola, balla sobre si mateixa amb la seva música d’instruments acústics reals i s’atura. Té els mateixos ajustos que Dibuixos que ballen: el color de la línia, una velocitat lenta i que la joguina no es desplaci.',kind:'burst',continuous:false,type:'ce',level:'01 · Descobrir',tag:`${JG_SET.art.length} joguines`,time:'Al teu ritme',seed:37,variants:JG_SET.art.length,minDuration:DB_MIN_DURATION,ownPhases:true,recorded:true,preview:{time:3.2,duration:10}}),
 Object.freeze({id:'kitchen',code:'CE34',name:'La cuina que balla',desc:'A cada pulsació apareix una cosa de la cuina grossa d’una sola línia gruixuda sobre negre: una tetera, una torradora, un flam, unes crispetes, una hamburguesa, un pizzer, una castanyera… Es dibuixa sola, balla sobre si mateixa amb la seva música d’instruments acústics reals i s’atura. Té els mateixos ajustos que Dibuixos que ballen: el color de la línia, una velocitat lenta i que el dibuix no es desplaci.',kind:'burst',continuous:false,type:'ce',level:'01 · Descobrir',tag:`${CN_SET.art.length} coses de cuina`,time:'Al teu ritme',seed:41,variants:CN_SET.art.length,minDuration:DB_MIN_DURATION,ownPhases:true,recorded:true,preview:{time:3.2,duration:10}})]);
// The three collections drawn and danced by Dibuixos que ballen (dibuixos.js), by activity.
const DB_SETS=Object.freeze({drawings:DB_SET,toys:JG_SET,kitchen:CN_SET});
// The music of these collections is composed on the step grid of each duration.
const OWN_SCORES=Object.freeze({kaleido:kaleidoScore,vitrall:vitrallScore,natura:naturaScore,piro:piroScore,drawings:dbScore,toys:dbScore,kitchen:dbScore});
// The stage stories of phase 1 (0.14) compose the music of each press: who is awake, who comes in now, and the final (escenari.js).
const STAGE_SCORES=Object.freeze({orchestra:oqScore,constellations:skScore,castells:femScore,balloons:gbScore,magician:mgScore,waiter:cbScore});
// A step of a stage story lasts at least its own minimum; the final lasts longer, so that it can end slowly.
const stageSpan=(item,game,s,duration)=>game.count>=ceSteps(item,s).steps?Math.max(item.finalMin,duration+6):Math.max(item.stepMin,duration);
// Dia rere dia composes the piece of the moment reached (game.diaTarget: 8 × day + moment).
// Dibuixos que ballen (and its two sister collections) keeps the speed chosen when the drawing began (game.dbSpeed), so that the music
// and the dance stay together.
const ownScore=(item,game,span)=>item.kind==='cycle'?diaScore(game.diaTarget,span):DB_SETS[item.id]?dbScore(game.variant,span,game.completed,game.dbSpeed,DB_SETS[item.id]):OWN_SCORES[item.id](game.variant,span,game.completed);
const CAUSE_MAP=new Map([...EXTRA_CAUSES,...NEW_CAUSES,PC_CAUSE,MR_CAUSE].map(x=>[x.id,x]));
const causeDefinition=id=>CAUSE_MAP.get(id);
function causePalette(id,variant=0){const item=causeDefinition(id),n=((variant+(item?.seed||0)*3)%20+20)%20;return INK_PATTERNS[n].palette;}
function causeBusy(game,s){if(game.time===null)return false;const item=causeDefinition(game.item.id);
 // El far: only while the light guides a boat home (a press during the shimmer is a new try).
 if(item?.beam)return !!game.farRet;
 // Toc, toc: while the door is open (a press while somebody knocks opens it; before the knock, nothing happens: beginKnock).
 if(item?.knock)return game.tcPhase==='visit';
 // La fira de llauna: while a launch and its gag go on (a press before the third bulb: beginFira).
 if(item?.ready)return game.fiPhase==='launch';
 // El vent del bosc: busy while the switch is held; while the wind calms, only if the effects must end first.
 if(item?.wind)return game.releaseTime===null?game.control!=='toggle':!!s.lock;
 if(item?.continuous&&game.control==='toggle'&&game.releaseTime===null)return false;return game.item.type==='scan'||s.lock||game.control==='hold'||game.releaseTime!==null&&game.releaseTime!==undefined;}
function releaseCause(game){if(!game||game.time===null||!['hold','toggle'].includes(game.control)||game.releaseTime!==null)return false;
 // El vent del bosc: a press shorter than VENT_MIN still blows to VENT_MIN (the release can be ahead); the seconds of wind add up
 // towards the change of place.
 if(causeDefinition(game.item.id)?.wind){game.releaseTime=ventRelease(game.time);game.duration=ventEnd(game.releaseTime);game.holdActive=false;game.ventTotal=(game.ventTotal||0)+game.releaseTime;return true;}
 game.releaseTime=game.time;game.duration=game.time+.85;game.holdActive=false;return true;}
// Dia rere dia and the stage stories wait for the next press with the scene still and dark (escWaitClock, 0.14.1): a press wakes
// the scene, the end of a step (or a reset of the steps) lets it slow down and darken. The clock is real time in seconds.
const causeNow=()=>typeof performance!=='undefined'?performance.now()/1000:0;
const causeWaits=item=>!!item&&(item.stage||item.kind==='cycle'||item.wind||item.dive);
function restCause(game,now=causeNow()){const item=causeDefinition(game?.item?.id);if(!causeWaits(item)||game.wait?.mode==='wait')return false;game.wait=escWaitTurn(game.wait??ESC_WAIT_START,'wait',now);return true;}
// Fons marí de vidre (CE06, 0.28). The clock of a scene: the waiting clock of the stories (it slows to a stop and wakes again), or real
// time with «Avís d'espera» off; fonsIdle0 / fonsNow0: its reading at the press of the scene.
function fonsTau(game,s,now=causeNow()){if(game.fonsIdle0===undefined)return 0;return s.waitCue===false?now-game.fonsNow0:escWaitClock(game.wait||ESC_WAIT_START,now).idle-game.fonsIdle0;}
// At a press: where the camera is (fonsFrom: on its way, resting after a stimulus, or at the surface before the first press and after
// the climb that follows the twentieth), the clock of the scene left behind (fonsPrevTau) and the clocks of the new one.
// The dives (Fons marí de vidre, Selva de llum 0.29, Sabana de paper 0.30, El pou del temps 0.31, Gegants del blau 0.36) share the same clocks and the same way of travelling; each has
// its own poses, camera, music and starting place (the surface of the sea, the sky over the jungle, the sky over Kilimanjaro at the end
// of the night).
const DIVES=Object.freeze({jelly:Object.freeze({N:FONS_N,STIM:FONS_STIM,START:FONS_SURF,camera:fonsCamera,duration:fonsDuration,rest:fonsRest,score:fonsScore}),
 jungle:Object.freeze({N:SELVA_N,STIM:SELVA_STIM,START:SELVA_START,camera:selvaCamera,duration:selvaDuration,rest:selvaRest,score:selvaScore}),
 savanna:Object.freeze({N:SABANA_N,STIM:SABANA_STIM,START:SABANA_START,camera:sabanaCamera,duration:sabanaDuration,rest:sabanaRest,score:sabanaScore}),
 well:Object.freeze({N:POU_N,STIM:POU_STIM,START:POU_START,camera:pouCamera,duration:pouDuration,rest:pouRest,score:pouScore}),
 giants:Object.freeze({N:GG_N,STIM:GG_STIM,START:GG_START,camera:ggCamera,duration:ggDuration,rest:ggRest,score:ggScore})});
function fonsPress(game,s,now,D=DIVES.jelly){const v=game.variant,running=game.time!==null&&v!==undefined;
 game.fonsFrom=running?D.camera(v,game.time,game.fonsStim||D.STIM,game.fonsFrom):v===undefined||v===D.N-1?[...D.START]:D.rest(v);
 game.fonsPrevTau=v===undefined?null:fonsTau(game,s,now);
 game.fonsIdle0=escWaitClock(game.wait||ESC_WAIT_START,now).idle;game.fonsNow0=now;game.fonsStim=Math.max(D.STIM,s.duration);}
function beginCause(game,s,now=causeNow()){
 const item=causeDefinition(game.item.id);if(!item)return false;s=ceSteps(item,s);
 if(item.continuous&&game.control==='toggle'&&game.time!==null&&game.releaseTime===null){releaseCause(game);return true;}
 if(item.wind&&game.control==='toggle'&&game.time!==null&&game.releaseTime===null){releaseCause(game);return true;}
 if(causeBusy(game,s))return false;
 if(causeWaits(item))game.wait=escWaitTurn(game.wait??ESC_WAIT_START,'run',now);
 if(item.wind){beginWind(game,s);return true;}
 if(item.beam){beginBeam(game,s);return true;}
 if(item.knock)return beginKnock(game,s);
 if(item.ready)return beginFira(game,s);
 // Dia rere dia: the day moves on from where it is shown now to the next moment of the chosen set (2, 4 or 8 a day).
 if(item.kind==='cycle'){const moments=s.dayMoments||8;if(game.diaTarget===undefined)game.diaTarget=diaStart(moments);game.diaFrom=game.time!==null&&game.diaFrom!==undefined?diaPhase(game.diaFrom,game.diaTarget,game.time):game.diaTarget;game.diaPrev=game.diaTarget;game.diaHeld=game.time??1e3;game.diaTarget=diaNext(game.diaTarget,moments);}
 // The dives (Fons marí de vidre, Selva de llum): the camera travels from where it is now (the scene running, or where it rests) to the next creatures, and the
 // scene left behind goes on moving while it fades (its clock: fonsPrevTau and on).
 if(item.dive)fonsPress(game,s,now,DIVES[item.id]);
 const sequence=item.kind==='sequence',continuing=sequence&&game.count>0&&game.count<s.steps;
 // A stage story keeps how long the step being cut short had run (its entry finishes instead of jumping), and the round it leaves (the place changes at the first press).
 if(item.stage){game.stageHeld=game.time??1e3;if(!continuing)game.stageFrom=game.variant;}
 const variants=item.variants||20;if(!continuing&&(item.kind!=='toggle'||game.variant===undefined)){game.variant=(game.nextVariant||0)%variants;game.nextVariant=(game.variant+1)%variants;}
 if(sequence)game.count=continuing?game.count+1:1;else game.count=1;
 game.time=0;game.releaseTime=null;game.control=item.continuous?s.interaction:'effect';game.holdActive=game.control==='hold';game.audioCycle=0;game.soundEvent=0;
 if(DB_SETS[item.id])game.dbSpeed=s.dbSpeed==='slow'?'slow':'normal';
 game.duration=item.dive?DIVES[item.id].duration(game.variant,s.duration):item.stage?stageSpan(item,game,s,s.duration):sequence?(game.count>=s.steps?Math.max(4.5,s.duration):Math.max(2.5,s.duration*.55)):item.kind==='toggle'?Math.min(s.duration,3.5):Math.max(item.minDuration||0,s.duration);
 game.audioDuration=game.duration;
 if(item.continuous&&['hold','toggle'].includes(game.control)){game.audioDuration=Math.max(item.minDuration||0,s.duration);game.duration=Infinity;}
 if(item.kind==='toggle'){game.previousDay=!!game.day;game.day=!game.previousDay;}
 const scoreIndex=(game.variant+item.seed*3)%20;
 game.score=item.id==='rain'?mrScore(game.variant,game.audioDuration,game.completed):item.dive?DIVES[item.id].score(game.variant,s.duration):item.id==='color-rain'?pcScore(game.variant,game.audioDuration,game.completed):item.stage?STAGE_SCORES[item.id](game.variant,game.count,s.steps,game.duration):item.kind==='cycle'||OWN_SCORES[item.id]?ownScore(item,game,game.duration):patternScore('tinta',scoreIndex).map(e=>({...e,midi:[...e.midi]}));
 const addNoise=(at,length,level,noise)=>game.score.push({at,length,level,noise,midi:[],voice:'velvet'});
 game.score.sort((a,b)=>a.at-b.at);
 return true;
}
// El vent del bosc (CE26): every press blows with its own character (VENT_GUSTS, in turn). A press while the wind is still calming
// goes on from the strength it has (offset: seconds of wind that give it). The place stays until it has had VENT_CHANGE seconds of
// wind; then the next press paints the next one over it (ventFrom: the place it leaves).
function beginWind(game,s){const blowing=game.time!==null,press=game.ventPress??-1,level=blowing?Math.min(1,ventWind(game.time,game.releaseTime,game.ventOffset||0,VENT_GUSTS[((press%4)+4)%4]).level):0;
 game.ventChange=false;
 if(game.variant===undefined){game.variant=(game.nextVariant||0)%VENT_VARIANTS;game.nextVariant=(game.variant+1)%VENT_VARIANTS;game.ventTotal=0;}
 else if((game.ventTotal||0)>=VENT_CHANGE){game.ventFrom=game.variant;game.variant=(game.nextVariant||0)%VENT_VARIANTS;game.nextVariant=(game.variant+1)%VENT_VARIANTS;game.ventTotal=0;game.ventChange=true;}
 game.ventPress=press+1;game.ventOffset=game.ventChange||!(level>0)?0:ventOffset(level);game.ventCoda=false;game.count=1;
 game.time=0;game.releaseTime=null;game.control=s.interaction==='toggle'?'toggle':'hold';game.holdActive=game.control==='hold';game.audioCycle=0;game.soundEvent=0;
 game.duration=Infinity;game.audioDuration=VENT_SPAN;game.score=ventScore(game.variant,game.ventPress,0,game.ventOffset);}
// El far (CE28): the press reaches a boat if the light is on it (far.js), and the boat goes home with its music; otherwise the water
// shimmers for a moment. The light keeps its own clock (beamTick, every frame), also between presses.
function beginBeam(game,s){const kind=farPress(game,s);game.count=1;game.time=0;game.releaseTime=null;game.control='effect';game.holdActive=false;game.audioCycle=0;game.soundEvent=0;
 game.duration=kind==='miss'?FAR_MISS:kind==='final'?FAR_FINAL:FAR_STEP;game.audioDuration=game.duration;game.score=farScore(kind,game.farRet?.tune,game.farMiss?.p,game.duration);}
// Toc, toc! Qui hi ha? (CE30): the street keeps its own clock (toc.js). When somebody knocks, the knocking plays as an effect of its
// own that never ends (it comes back every TC_KNOCK_EVERY seconds) until a press opens the door or the visitor goes away (tcLeave).
// A press while nobody knocks returns false: no sound and no change at all.
function beginKnock(game,s){const v=tcPress(game,s);if(!v)return false;game.count=v.slot+1;game.time=0;game.releaseTime=null;game.control='effect';game.holdActive=false;game.audioCycle=0;game.soundEvent=0;
 game.duration=v.final?TC_FINAL:TC_VISIT;game.audioDuration=game.duration;game.score=tcScore(game.variant,v.who,v.final,game.duration);return true;}
function knockTick(game,s,dt){const ev=tcTick(game,s,dt);
 if(ev==='knock'){game.time=0;game.duration=Infinity;game.audioDuration=TC_KNOCK_EVERY;game.audioCycle=0;game.soundEvent=0;game.releaseTime=null;game.control='effect';game.holdActive=false;game.score=tcKnockScore(game.variant);}
 else if(ev==='leave'){game.time=null;game.score=null;}}
// La fira de llauna (CE44): the fair keeps its own clock (fira.js). When the bulbs start, the count (three rising notes) plays as an
// effect that never ends; after the third bulb the soft ticking of the clockwork takes over until the press, or until the bulbs go
// out (fiPress). A press before the third bulb returns false (nothing happens), or restarts the count, or launches slowly (fiEarly).
function beginFira(game,s){const v=fiPress(game,s);if(v==='restart'){game.time=null;game.score=null;return false;}if(!v)return false;game.count=v.slot+1;game.time=0;game.releaseTime=null;game.control='effect';game.holdActive=false;game.audioCycle=0;game.soundEvent=0;
 game.duration=fiSpan(v);game.audioDuration=game.duration;game.score=fiScore(game.variant,v.gag,v.speed);return true;}
function firaTick(game,s,dt){const ev=fiTick(game,s,dt),loop=(D,score)=>{game.time=0;game.duration=Infinity;game.audioDuration=D;game.audioCycle=0;game.soundEvent=0;game.releaseTime=null;game.control='effect';game.holdActive=false;game.score=score;};
 if(ev==='count'){const c=fiCountScore(game.variant,s);loop(c.D,c.score);}else if(ev==='loop')loop(FI_TICK,fiTickScore());else if(ev==='rest'){game.time=null;game.score=null;}}
function beamTick(game,s,dt){const item=causeDefinition(game?.item?.id);if(item?.beam)farTick(game,s,dt);else if(item?.knock)knockTick(game,s,dt);else if(item?.ready)firaTick(game,s,dt);}
function finishCause(game,s,now=causeNow()){const item=causeDefinition(game.item.id);if(!item)return false;s=ceSteps(item,s);game.time=null;game.holdActive=false;game.releaseTime=null;restCause(game,now);
 if(item.beam){farDock(game,s);game.farMiss=null;return true;}
 if(item.knock){tcDone(game,s);game.count=game.tcOut.length;return true;}
 if(item.ready){fiDone(game,s);game.count=game.fiOut.length;return true;}
 // Dia rere dia stays where the day has arrived; a full day counts as completed.
 if(item.kind==='cycle'){game.diaFrom=game.diaTarget;const stops=DIA_STOPS[s.dayMoments]||DIA_STOPS[8];if((((game.diaTarget%8)+8)%8)===stops[stops.length-1])game.completed=(game.completed||0)+1;return true;}
if(item.kind!=='toggle'&&(item.kind!=='sequence'||game.count>=s.steps)){game.count=0;game.completed=(game.completed||0)+1;}return true;}
function retimeCause(game,s,duration){const item=causeDefinition(game?.item.id);if(!item||game.time===null||item.wind||item.beam||item.knock||item.ready)return false;s=ceSteps(item,s);
 if(item.id==='rain'){
  const old=game.audioDuration||game.duration,span=Math.max(MR_MIN,duration),cycling=['hold','toggle'].includes(game.control),released=game.releaseTime!==null&&game.releaseTime!==undefined,tail=released?game.time-game.releaseTime:0;
  if(released){game.releaseTime*=span/old;game.time=game.releaseTime+tail;game.duration=game.releaseTime+.85;}else{game.time*=span/old;if(!cycling)game.duration=span;}
  game.audioDuration=span;game.audioCycle=cycling?Math.floor(game.time/span):0;game.score=mrScore(game.variant,span,game.completed);
  const pos=cycling?(game.time%span)/span:game.time/span,i=game.score.findIndex(e=>e.at>pos+1e-6);game.soundEvent=i<0?game.score.length:i;return true;
 }
 // The dives: the travelling keeps its two seconds; a new «Durada» lengthens or shortens the stimulus from where it is.
 if(item.dive){
  const D=DIVES[item.id],span=D.duration(game.variant,duration),old=game.audioDuration||game.duration;game.time=game.time/old*span;game.duration=span;game.audioDuration=span;game.fonsStim=Math.max(D.STIM,duration);game.score=D.score(game.variant,duration);
  const i=game.score.findIndex(e=>e.at>game.time/span+1e-6);game.soundEvent=i<0?game.score.length:i;return true;
 }
 if(item.id==='color-rain'){
  const old=game.audioDuration||game.duration,span=Math.max(PC_MIN,duration),cycling=['hold','toggle'].includes(game.control),released=game.releaseTime!==null&&game.releaseTime!==undefined,tail=released?game.time-game.releaseTime:0;
  if(released){game.releaseTime*=span/old;game.time=game.releaseTime+tail;game.duration=game.releaseTime+.85;}else{game.time*=span/old;if(!cycling)game.duration=span;}
  game.audioDuration=span;game.audioCycle=cycling?Math.floor(game.time/span):0;game.score=pcScore(game.variant,span,game.completed);
  const pos=cycling?(game.time%span)/span:game.time/span,i=game.score.findIndex(e=>e.at>pos+1e-6);game.soundEvent=i<0?game.score.length:i;return true;
 }
 const old=game.audioDuration||game.duration,span=item.stage?stageSpan(item,game,s,duration):item.kind==='sequence'?(game.count>=s.steps?Math.max(4.5,duration):Math.max(2.5,duration*.55)):item.kind==='toggle'?Math.min(duration,3.5):Math.max(item.minDuration||0,duration),ratio=span/old;
 const releaseProgress=game.releaseTime!==null?(game.time-game.releaseTime)/.85:null;game.time*=ratio;game.audioDuration=span;
 // Caleidoscopi, Vitralls, Natura, Piromusical and Dia rere dia compose their music on the step grid of each duration: recompose it and continue from the current position.
 if(item.stage||item.kind==='cycle'||OWN_SCORES[item.id]){game.score=item.stage?STAGE_SCORES[item.id](game.variant,game.count,s.steps,span):ownScore(item,game,span);const i=game.score.findIndex(e=>e.at>game.time/span+1e-6);game.soundEvent=i<0?game.score.length:i;}if(releaseProgress!==null){game.releaseTime=game.time-releaseProgress*.85;game.duration=game.releaseTime+.85;}else if(Number.isFinite(game.duration))game.duration=span;return true;
}
function causeClock(game,s){
 const running=game.time!==null,t=game.time??0,continuous=running&&!Number.isFinite(game.duration),released=game.releaseTime!==null&&game.releaseTime!==undefined;
 const displayTime=released?game.releaseTime:t,duration=game.audioDuration||s.duration,cycling=running&&['hold','toggle'].includes(game.control),u=running?(cycling?(displayTime%duration)/duration:Math.min(1,t/Math.max(.1,duration))):1;
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
 const envelope=!running?1:continuous?(.15+.85*smooth(t/.55)):released?(1-smooth((t-game.releaseTime)/.85)):(.12+.88*smooth(u/.12))*(1-smooth((u-.82)/.18));
 return {running,t,displayTime,u,continuous,cycling,released,envelope,motion:s.reduced?0:displayTime};
}

export {EXTRA_CAUSES,NEW_CAUSES,beamTick,beginCause,causeBusy,causeClock,causeDefinition,causePalette,finishCause,fonsTau,releaseCause,restCause,retimeCause};
