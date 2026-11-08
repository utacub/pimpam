import {TM_INSTRUMENTS,tmStage,tmTarget,TM_PIECE,TM_WRONG} from './templet.js';
import {ET_TRIP} from './estacio.js';
import {OG_PLACES,OG_RESULT,OG_WRONG,ogRound,ogTarget} from './origen.js';
import {GX_STAGES,GX_SHOW,GX_STEP} from './guix.js';
import {GP_SHOW,GP_STEP,gpOptions,gpItem,gpStageCount} from './cassola.js';
import {CINC_FACTORY_FINAL,CINC_FACTORY_STEP,cincFactoryOptions} from './cinc.js';
import {PT_ZONES,PT_FINAL,PT_STEP,ptOptions,ptWord,ptPage} from './pinta.js';
import {MS_STEP,MS_FINAL,msOptions,msWord} from './masia.js';
import {EX_WORD,exOptions,exTarget,exTimes} from './encaix.js';
import {VH_WORD,vhOptions,vhTimes,vhSteps} from './vehicles.js';
export const SCAN_ACTIVITIES=Object.freeze([
 ['destinations','EN04','On anem?','Tria una porta de l’estació: el mar, el bosc, la neu o l’espai. El tren hi viatja fins a una descoberta.','destinations','free'],
 ['dress','EN06','El vestidor fantàstic','Combina barret, roba i accessori sobre el mateix personatge.','dress','creative'],
 ['vehicles','EN07','El taller de vehicles','Munta un vehicle de joguina en tres dimensions: carrosseria, rodes i accessori. Quan està llest, baixa la rampa i fa una volta per l’habitació.','vehicles','creative'],
 ['sounds','EN11','Detectius de sons','Escolta la pista i troba quin instrument del templet l’ha tocada. Fins a vint instruments reals enregistrats.','sounds','guided'],
 ['encaix','EN12','Encaixos de fusta','Un trencaclosques de fusta pintada que omple tota la pantalla: cinc mons (el port, el circ, la ciutat, el bosc i l’espai), cadascun amb quatre llums, vint taulers. Un forat s’il·lumina i a la safata hi ha les peces: la que hi va hi entra volant amb un «clac» i cobra vida com una joguina articulada; la que no hi va ho prova, pica a la vora i torna a la safata. Amb les quatre figures posades, la festa del tauler, i el següent entra lliscant. Cada peça posada afegeix una veu a la música del món.','encaix','guided'],
 ['sources','EN21','D’on ve aquest so?','Escolta un so de la natura i troba el paisatge d’on ve.','sources','guided'],
 ['lights','EN22','El meu espectacle de llum','Tria el color, la forma i la música dels focs i mira l’espectacle dibuixat amb guix.','lights','creative'],
 ['pot','EN23','La cassola de Glupòcrates','Tria un ingredient màgic i una galeta d’animal per a la sopa de Glupòcrates, i mira en quina criatura de la mitologia grega es converteix quan la tasta. La mateixa recepta dona sempre la mateixa criatura.','pot','creative'],
 ['inventions','EN24','La fàbrica dels disbarats','Una fàbrica de joguines amb una màquina i un robot ajudant. Tria una cosa (una tetera, un rellotge o una torradora) i després què li afegim (una molla, uns patins o un paraigua): la màquina s’ho empassa, tremola i en surt un invent impossible que fa la seva gràcia. Nou invents diferents.','inventions','creative'],
 ['pinta','EN25','Pinta el món','Un paisatge dibuixat a tinta omple tota la pantalla: el cel, les muntanyes, el riu, el bosc, el poble, els camps. Cada zona que esculls s’omple d’aquarel·la i pren vida amb el seu instrument i el seu so; quan la pàgina és plena, la festa de l’estació i es gira el full. Cinc paisatges i quatre estacions: vint pàgines.','pinta','creative'],
 ['masia','EN26','Estiu a la masia','Una masia de pedra a l’estiu, pintada com en una pel·lícula d’animació: l’àvia Pepa a la finestra de la cuina, l’avi Tomàs adormit pescant a la bassa, la Nina a l’hort, en Pol a l’estenedor i la cabra Nata sota la figuera. Cada personatge que esculls viu la seva petita història divertida (una truita que s’enganxa al sostre, una carpa al barret, una pastanaga gegant, un llençol que vola, una pluja de figues) i el dia avança del matí al capvespre; amb els cinc, el sopar a la fresca.','masia','creative'],
].map(([id,code,name,desc,scene,task])=>Object.freeze({id,code,name,desc,scene,task,type:'scan',recorded:['destinations','sounds','sources','lights','pot','inventions','pinta','masia','encaix','vehicles'].includes(id),level:task==='guided'?'05 · Relacionar':task==='groups'?'06 · Grups':'04 · Triar',tag:task==='guided'?'Model i selecció':task==='groups'?'Explorar grups':'Totes les tries són bones',time:'1 o 2 commutadors'})));
const SCAN_MAP=new Map(SCAN_ACTIVITIES.map(x=>[x.id,x]));
// The scanning activities made on the device (0.44, persona.js) come in through SCAN_EXT: their options, their clue and their times.
let SCAN_EXT=null;
export function scanExtend(x){SCAN_EXT=x;}
const scanExt=id=>!!SCAN_EXT&&SCAN_EXT.match(id);
// the activities with a clue to listen to first (Detectius de sons, D'on ve aquest so?, Escolta i troba)
export const scanCued=id=>['sounds','sources'].includes(id)||scanExt(id)&&!!SCAN_EXT.guided(id);
export const scanDefinition=id=>SCAN_MAP.get(id)||(scanExt(id)?SCAN_EXT.definition(id):undefined);
const choice=(id,label,kind=id,value=id,color=null)=>({id,label,kind,value,color});
const command=(action,label)=>({id:'cmd:'+action,label,action,kind:'command',value:action});
// Every option is a picture with one word (0.17): no articles and no sentences.
const WORLDS=[choice('sea','Mar','sea'),choice('forest','Bosc','forest'),choice('snow','Neu','snow'),choice('space','Espai','space')];
// Detectius de sons (0.16; 0.48): the twenty recorded instruments of the bandstand (templet.js); the pool is the setting dsPool.
const SOUNDS=TM_INSTRUMENTS.map(x=>choice(x.id,x.word,'band',x.id));
// D'on ve aquest so? (0.18): the nine landscapes (origen.js). El meu espectacle de llum: the colours, the shapes and the music (guix.js).
const SOURCES=OG_PLACES.map(x=>choice(x.id,x.word,'place',x.id));
const LIGHTS=GX_STAGES.map((list,k)=>list.map(x=>choice(x.id,x.word,'light-'+k,x.id)));
function limited(list,s){return list.slice(0,Math.min(list.length,s.scanOptions||3));}
function numbered(prefix,labels,kind=prefix){return labels.map((label,i)=>choice(prefix+'-'+i,label,kind,i));}
// On anem? (0.16): with two or three doors, which places open changes from round to round; they keep their order in the hall.
function stationDoors(state,s){const n=Math.min(4,s.scanOptions||3),r=Math.max(0,state?.round|0),keep=new Set(Array.from({length:n},(_,i)=>(r+i)%4));return WORLDS.filter((_,i)=>keep.has(i));}
// El meu espectacle de llum: with two or three options, which ones change from round to round (and from choice to choice); they keep
// their order.
function lightOptions(state,s){const n=Math.min(4,s.scanOptions||3),k=Math.min(2,state?.stage|0),r=Math.max(0,state?.round|0)+k,keep=new Set(Array.from({length:n},(_,i)=>(r+i)%4));return LIGHTS[k].filter((_,i)=>keep.has(i));}
// La cassola d’en Glups (0.24; 0.27): the options of the turn (cassola.js): the magic ingredients, then the biscuits that go with the
// one chosen; with «Un ingredient sorpresa», one per turn and then the ladle.
function potOptions(state,s){return gpOptions(state?.stage|0,s.scanOptions||3,state?.round|0,s.potPick,state?.picks||[]).map(id=>choice(id,gpItem(id).word,'pot',id));}
function stagePlan(id,s,state=null){const stages={pinta:PT_ZONES.map(()=>[]),masia:[[],[],[],[],[]],encaix:[[],[],[],[]],inventions:[0,1].map(k=>cincFactoryOptions(k,state?.round|0,s.scanOptions)),destinations:[stationDoors(state,s)],dress:[numbered('hat',['Barret','Gorra','Corona'],'hat-choice'),numbered('clothes',['Capa','Armilla','Mocador'],'clothes'),numbered('accessory',['Ulleres','Llaç','Motxilla'],'accessory')],vehicles:Array.from({length:vhSteps(s)},()=>[]),lights:LIGHTS,pot:Array.from({length:gpStageCount(s.potPick)},(_,k)=>potOptions({stage:k,round:state?.round|0,picks:state?.picks||[]},s))};return stages[id]||[];}
export function createScanState(id,s){return {id,stage:0,picks:[],round:0,status:'choose',pending:null,lastChoice:null,lastIndex:0,outcome:null,hint:!!s.visualHint,armed:s.scanStart!=='manual',cueNeeded:scanCued(id),errors:0};}
export function scanTarget(state,s){if(scanExt(state.id))return SCAN_EXT.target(state,s);if(state.id==='sounds')return SOUNDS.find(x=>x.id===tmTarget(state.round,s).id);if(state.id==='sources')return SOURCES.find(x=>x.id===ogTarget(state.round).id);if(state.id==='encaix'){const t=exTarget(state,s);return t?choice(t,EX_WORD[t],'encaix',t):null;}return null;}
function guidedOptions(state,s){if(state.id==='sounds')return tmStage(state.round,Math.min(s.scanOptions||3,4),s).map(x=>SOUNDS.find(y=>y.id===x.id));if(state.id==='sources')return ogRound(state.round,Math.min(s.scanOptions||3,4)).options.map(id=>SOURCES.find(y=>y.id===id));return [];}
export function scanContent(state,s){if(state.status==='done')return [];if(scanExt(state.id))return SCAN_EXT.content(state,s);if(state.id==='inventions')return cincFactoryOptions(state.stage|0,state.round|0,s.scanOptions);if(state.id==='lights')return lightOptions(state,s);if(state.id==='pot')return potOptions(state,s);if(state.id==='pinta'){const page=ptPage(state.round);return ptOptions(state,s.scanOptions).map(z=>choice(z,ptWord(page.land,z),'pinta',z));}if(state.id==='masia')return msOptions(state,s.scanOptions).map(z=>choice(z,msWord(z),'masia',z));if(state.id==='encaix')return exOptions(state,s).map(id=>choice(id,EX_WORD[id],'encaix',id));if(state.id==='vehicles')return vhOptions(state,s).map(id=>choice(id,VH_WORD[id],'vehicles',id));if(['sounds','sources'].includes(state.id))return guidedOptions(state,s);const stages=stagePlan(state.id,s,state);return limited(stages[state.stage]||stages[0]||[],s);}
// What the pupil scans (0.17): only the options of the moment, and in Detectius de sons the clue to listen to again. Nothing is asked
// after a choice (no repeat, back or home: the adult leaves with the buttons at the top); a round that ends goes on to the next one.
export function scanChoices(state,s){if(!state.armed)return [command('start','Comença')];
 const options=scanContent(state.status==='done'?{...state,status:'choose'}:state,s);return scanCued(state.id)?[...options,command('cue','Escolta')]:options;}
export function scanPrompt(state,s){if(!state.armed)return 'Prem per començar l’encercament.';if(state.status==='done')return 'Ho pots repetir, canviar o començar una altra ronda.';const p={pinta:'Què pintem?',masia:'Qui ens farà riure?',destinations:'On anem?',dress:['Quin barret vols?','Com el vestim?','Quin accessori hi posem?'][state.stage],vehicles:['Quina carrosseria hi posem?','Quines rodes hi posem?','Quin accessori hi posem?','De quin color el pintem?'][state.stage]||'Què hi posem?',sounds:'Escolta la pista i troba l’instrument.',encaix:s.exMode==='lliure'?'Quina peça poses?':'Quina peça hi va?',sources:'D’on ve aquest so?',lights:['Quin color tindran els focs?','Quina forma tindran?','Quina música hi posem?'][state.stage],inventions:['Què posem a la màquina?','I ara, què li afegim?'][state.stage],pot:['Quina màgia hi posem?','Quin animal hi posem?','Que Glupòcrates tasti la sopa!'][state.stage]};return p[state.id]||'Tria al teu ritme.';}
// The scanning boards of 0.16 last longer: the trip of On anem? and the piece of Detectius de sons (or the taste of another instrument).
const BOARD_TIMES={destinations:{wrong:1.15,final:ET_TRIP,step:1.65},sounds:{wrong:TM_WRONG,final:TM_PIECE,step:1.65},sources:{wrong:OG_WRONG,final:OG_RESULT,step:1.65},lights:{wrong:1.15,final:GX_SHOW,step:GX_STEP},pot:{wrong:1.15,final:GP_SHOW,step:GP_STEP},inventions:{wrong:1.15,final:CINC_FACTORY_FINAL,step:CINC_FACTORY_STEP},pinta:{wrong:1.15,final:PT_FINAL,step:PT_STEP},masia:{wrong:1.15,final:MS_FINAL,step:MS_STEP}};
export function chooseScan(state,s,index){const options=scanChoices(state,s),option=options[index];if(!option||state.status==='effect')return {accepted:false};state.lastIndex=index;
 if(option.action){const action=option.action;if(action==='home')return {accepted:true,action};if(action==='start'){state.armed=true;return {accepted:true,action:'refresh'};}if(action==='hint'){state.hint=true;return {accepted:true,action:'refresh'};}if(action==='cue')return {accepted:true,action:'cue'};
  if(action==='new'){const next=createScanState(state.id,s);next.round=state.round+1;next.armed=true;Object.assign(state,next);return {accepted:true,action:scanCued(state.id)?'cue':'refresh'};}
  if(action==='back'){if(state.picks.length)state.picks.pop();state.stage=Math.max(0,state.picks.length);state.status='choose';state.pending=null;return {accepted:true,action:'refresh'};}
  if(action==='repeat'){state.pending={repeat:true,final:true,option:state.lastChoice,correct:true};state.status='effect';return {accepted:true,action:'effect',duration:BOARD_TIMES[state.id]?.final||5.5};}
 }
 state.lastChoice=option;state.outcome=null;
 const ext=scanExt(state.id),guided=['sounds','sources'].includes(state.id)||state.id==='encaix'&&s.exMode!=='lliure'||ext&&!!SCAN_EXT.guided(state.id),correct=!guided||option.id===scanTarget(state,s).id;
 const stages=ext?[[]]:stagePlan(state.id,s),length=stages.length||1;
 const final=correct&&(state.stage>=length-1||guided&&state.id!=='encaix');state.pending={option,correct,final};state.status='effect';if(ext){const d=SCAN_EXT.times(state,option,final,correct);return {accepted:true,action:'effect',duration:d};}const times=state.id==='encaix'?exTimes(s):state.id==='vehicles'?vhTimes(s,state.round):BOARD_TIMES[state.id]||{wrong:1.15,final:5.5,step:1.65};return {accepted:true,action:'effect',duration:!correct?times.wrong:final?times.final:times.step};
}
export function finishScan(state,s){const pending=state.pending;if(!pending)return {sameChoices:true};state.pending=null;
 if(pending.repeat){state.status='done';return {sameChoices:false};}
 if(!pending.correct){state.status='choose';state.outcome='retry';state.errors=(state.errors|0)+1;return {sameChoices:true};}
 state.picks.push(pending.option);state.stage=state.picks.length;state.outcome='accepted';state.errors=0;if(pending.final)return nextScanRound(state,s);state.status='choose';return {sameChoices:false};
}
// The end of a round: straight on to the next one, with nothing to answer. The rounds change and come back round in turn.
function nextScanRound(state,s){const round=state.round+1;Object.assign(state,createScanState(state.id,s),{round,armed:true,outcome:'round'});return {sameChoices:false,round:true};}
export function scanDisplayPicks(state){return state.pending?.correct&&!state.pending.repeat?[...state.picks,state.pending.option]:state.picks;}
