// El taller de vehicles (EN07, 0.53): the model of the toy workshop in three dimensions, the first activity of Pim Pam made with three.js.
// A corner of a house at a time, four lights each: the room (0.53) and, since 0.55, the living room with its emergency vehicles; the yard,
// the corridor and the bathroom come next. The corners take turns every VH_ROUNDS vehicles, starting with «Primer racó».
// A round builds one toy vehicle on the grey chassis of the bench (0.54: six bodies, six wheel sets, six accessories and six colours in the
// room, four pieces in the tray by default): the pupil scans the pieces of the tray and chooses the body, the wheels,
// the accessory and, with four picks, the colour; each piece flies from the tray and clicks on. The finished vehicle waits for a press (or
// starts alone after VH_WAIT seconds), rolls down the ramp, goes round the room and parks on the garage shelf; the wheels change how it
// rolls and the accessory brings its gag. Nothing here draws or sounds: vehicles-3d.js builds and renders, vehicles-art.js paints the
// board, vehicles-so.js plays.
export const VH_CORNERS=Object.freeze(['habitacio','sala']);
export const VH_LIGHTS=Object.freeze({habitacio:['mati','tarda','capvespre','nit'],sala:['mati','tarda','capvespre','nit']});
export const VH_BODIES=Object.freeze({habitacio:['familiar','autobus','furgoneta','curses','camioneta','escarabat'],sala:['bombers','ambulancia','plataforma','totterreny','policia','furgo']});
export const VH_WHEELS=Object.freeze({habitacio:['tacs','primes','fusta','amples','radis','tapacubs'],sala:['bessones','erugues','balons','ferro','tacs','tapacubs']});
export const VH_TOPS=Object.freeze({habitacio:['baca','remolc','bandera','sirena','escala','globus'],sala:['brac','cano','campana','manega','escala','sirena']});
export const VH_COLORS=Object.freeze(['blau','corall','groc','verd','lila','taronja']);
export const VH_STAGES=Object.freeze(['body','wheels','top','color']);
export const VH_CORNER_NAME=Object.freeze({habitacio:'L’habitació',sala:'La sala'});
// The title of a light of a corner in the «Informació» panel («L’habitació, matí»).
export const vhLightTitle=(corner,light)=>`${VH_CORNER_NAME[corner]}, ${VH_LIGHT_NAME[light].toLowerCase()}`;
export const VH_LIGHT_NAME=Object.freeze({mati:'Matí',tarda:'Tarda',capvespre:'Capvespre',nit:'Nit'});
// The word of each piece (the accessible name of its button; nothing is ever written on the screen).
export const VH_WORD=Object.freeze({familiar:'Cotxe',autobus:'Autobús',furgoneta:'Furgoneta',curses:'Bòlid',tacs:'Tacs',primes:'Primes',fusta:'Fusta',baca:'Maleta',remolc:'Remolc',bandera:'Bandera',camioneta:'Camioneta',escarabat:'Escarabat',amples:'Amples',radis:'Radis',tapacubs:'Tapacubs',sirena:'Sirena',escala:'Escala',globus:'Globus',bombers:'Bombers',ambulancia:'Ambulància',plataforma:'Plataforma',totterreny:'Jeep',policia:'Policia',furgo:'Furgó',bessones:'Bessones',erugues:'Erugues',balons:'Balons',ferro:'Ferro',brac:'Grua',cano:'Canó',campana:'Campana',manega:'Mànega',blau:'Blau',corall:'Corall',groc:'Groc',verd:'Verd',lila:'Lila',taronja:'Taronja'});
// The long name of each piece, for the «Informació» panel and the tests.
export const VH_NAME=Object.freeze({familiar:'Cotxe familiar',autobus:'Autobús',furgoneta:'Furgoneta de repartiment',curses:'Cotxe de curses',tacs:'Rodes de tacs',primes:'Rodes primes de curses',fusta:'Rodes de fusta',baca:'Baca amb maleta',remolc:'Remolc de blocs',bandera:'Bandereta',camioneta:'Camioneta de caixa oberta',escarabat:'Cotxe escarabat',amples:'Rodes amples de goma',radis:'Rodes de radis',tapacubs:'Rodes amb tapacubs',sirena:'Llum giratori',escala:'Escala de bombers',globus:'Globus lligat',bombers:'Camió de bombers',ambulancia:'Ambulància',plataforma:'Camió plataforma',totterreny:'Tot terreny de rescat',policia:'Cotxe de policia',furgo:'Furgó de rescat',bessones:'Rodes bessones de camió',erugues:'Erugues',balons:'Rodes de globus',ferro:'Rodes de ferro',brac:'Braç de grua',cano:'Canó d’aigua',campana:'Campana',manega:'Mànega enrotllada',blau:'Blau',corall:'Corall',groc:'Groc',verd:'Verd',lila:'Lila',taronja:'Taronja'});
// The palette of the soft vinyl toys (Marc's concept art of 8 November 2026), as hex numbers for three.js and strings for the canvas.
export const VH_PALETTE=Object.freeze({blau:0x2a5be0,corall:0xf06a43,groc:0xffc81e,verd:0x2aa497,marina:0x1c2a55,crema:0xf7ead8,gris:0xb8bcc9,paret:0xa7b2f3,menta:0x93dfc6,prestatge:0xf2775c,fusta:0xd9a76a,lila:0x7d5fd8,taronja:0xff8c3a});
export const vhHex=n=>'#'+(n>>>0).toString(16).padStart(6,'0');
// The colour each body comes in when there is no colour pick.
export const VH_BODY_COLOR=Object.freeze({familiar:'blau',autobus:'groc',furgoneta:'corall',curses:'verd',camioneta:'taronja',escarabat:'lila',bombers:'corall',ambulancia:'groc',plataforma:'taronja',totterreny:'verd',policia:'blau',furgo:'lila'});
// The times (seconds): a piece flies from the tray and clicks on (a step); the finished vehicle waits for the press; with «Engegar:
// automàtic» it waits only VH_AUTO; from the press to the first turn of the wheels; the ride (the ramp, the room and the arrival) by
// «Durada del recorregut»; the garage (the vehicle parks on the shelf and the bench comes back), or the plain return without it.
export const VH_SNAP=2.4,VH_WAIT=8,VH_AUTO=.8,VH_GO=.5,VH_GARAGE=2.8,VH_OUT=1.2;
export const VH_RIDE=Object.freeze({curt:8,mitja:14,llarg:20});
export const VH_ROUNDS=4;
export const vhClamp=(x,a=0,b=1)=>x<a?a:x>b?b:x;
export const vhEase=u=>{u=vhClamp(u);return u*u*(3-2*u);};
export const vhOut=u=>{u=vhClamp(u);return 1-(1-u)*(1-u);};
export const vhIn=u=>{u=vhClamp(u);return u*u;};
export const vhPh=(t,a,b)=>vhEase((t-a)/(b-a));
// A vinyl bounce: an overshoot that settles (a piece that clicks on, a vehicle that stops).
export function vhSettle(u,k=2.2){u=vhClamp(u);return 1-Math.exp(-u*5.5)*Math.cos(u*Math.PI*k)*(1-u);}
const vhHash=(a,b,c=0)=>{let h=(Math.imul(a+1,73856093)^Math.imul(b+7,19349663)^Math.imul(c+13,83492791))>>>0;h=Math.imul(h^h>>>13,1274126177)>>>0;return((h^h>>>16)>>>0)/4294967296;};
export const vhRand=vhHash;
// «Primer racó» (0.55): the corner of the first rounds; the others follow in the order of VH_CORNERS.
export const vhFirstCorner=s=>VH_CORNERS.includes(s?.vhCorner)?s.vhCorner:VH_CORNERS[0];
// The round: its corner and light (four rounds per corner, one per light, the corners in turn from the first one), and the visit (how many
// times round all the corners).
export function vhRoundOf(round,s=null){const r=Math.max(0,round|0),n=VH_CORNERS.length,first=VH_CORNERS.indexOf(vhFirstCorner(s)),ci=(first+Math.floor(r/VH_ROUNDS))%n,corner=VH_CORNERS[ci],li=r%VH_ROUNDS;return {round:r,corner,ci,light:VH_LIGHTS[corner][li],li,visit:Math.floor(r/(VH_ROUNDS*n))};}
// «Tries per vehicle»: 2 (body and wheels), 3 (and the accessory) or 4 (and the colour).
export const vhSteps=s=>{const n=+(s?.vhSteps||3);return n===2||n===4?n:3;};
export const vhStageKinds=s=>VH_STAGES.slice(0,vhSteps(s));
export const vhStageKind=(state,s)=>vhStageKinds(s)[Math.min(state?.stage|0,vhSteps(s)-1)];
const vhShuffle=(list,a,b)=>{const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(vhHash(a,b,i)*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
// The pieces of the family of a stage in a corner.
export function vhFamily(kind,corner='habitacio'){return kind==='body'?VH_BODIES[corner]:kind==='wheels'?VH_WHEELS[corner]:kind==='top'?VH_TOPS[corner]:VH_COLORS;}
// «Peces a la safata» (0.54, Marc: four by default; this activity does not follow the general «Opcions de contingut»).
export const vhCells=s=>{const n=+(s?.vhCells||4);return n===2||n===3?n:4;};
// The pieces of the tray: as many as «Peces a la safata» (2 to 4), never more than the family has. The families turn with the round and
// the stage, so every piece comes round (with four cells, each of the six pieces is offered in four rounds of six); the order changes with
// the round and the stage, and stays while the stage lasts.
export function vhOptions(state,s){const n=vhCells(s),R=vhRoundOf(state?.round,s),kind=vhStageKind(state,s),fam=vhFamily(kind,R.corner),k=Math.min(n,fam.length),start=(R.round+(state?.stage|0))%fam.length;
 const list=[];for(let i=0;i<k;i++)list.push(fam[(start+i)%fam.length]);return vhShuffle(list,R.round*7+(state?.stage|0),R.visit);}
// What has been chosen so far: the body, the wheels, the accessory and the colour, by the stage of each pick (a missing one is null).
export function vhPicks(state,s,pendingValue=null){const kinds=vhStageKinds(s),vals=(state?.picks||[]).map(p=>p?.value??p?.id??p);if(pendingValue!==null)vals.push(pendingValue);
 const out={body:null,wheels:null,top:null,color:null};kinds.forEach((k,i)=>{if(i<vals.length)out[k]=vals[i];});return out;}
// The colour of the vehicle: the colour pick, or the colour its body comes in.
export const vhColorOf=P=>P.color||VH_BODY_COLOR[P.body]||'blau';
export const vhRide=s=>VH_RIDE[s?.vhRide]??VH_RIDE.mitja;
export const vhWaitTime=s=>s?.vhGo==='auto'?VH_AUTO:VH_WAIT;
export const vhPark=s=>s?.vhGarage===false?VH_OUT:VH_GARAGE;
// The durations of a pick: a step (the piece clicks on) and the final one (the piece, the wait, the ride and the garage).
export function vhTimes(s){const wait=vhWaitTime(s),ride=vhRide(s),park=vhPark(s);return {wrong:1,step:VH_SNAP,final:VH_SNAP+wait+ride+park,wait,ride,park};}
// The timeline of the final effect: when the ride starts (alone after the wait, or VH_GO after the press at time go), when it ends and
// when the effect ends.
export function vhTimeline(s,go=null){const T=vhTimes(s),start=go===null?VH_SNAP+T.wait:Math.max(VH_SNAP,go)+VH_GO;return {snap:VH_SNAP,start,ride:T.ride,rideEnd:start+T.ride,end:start+T.ride+T.park,park:T.park,pressed:go!==null};}
// The phase of the final effect at time t and the progress within it (0..1).
export function vhPhase(TL,t){if(t<TL.snap)return {phase:'snap',u:vhClamp(t/TL.snap)};if(t<TL.start)return {phase:'wait',u:vhClamp((t-TL.snap)/Math.max(.001,TL.start-TL.snap))};if(t<TL.rideEnd)return {phase:'ride',u:vhClamp((t-TL.start)/TL.ride)};return {phase:'park',u:vhClamp((t-TL.rideEnd)/Math.max(.001,TL.end-TL.rideEnd))};}
// Whether a press now starts the engine: the final effect is on, the vehicle is finished and waits (the press is asked for, or allowed early).
export function vhCanStart(state,s,time,go=null){if(!state?.pending?.final||time===null||time===undefined)return false;if(go!==null)return false;const TL=vhTimeline(s,null);return time>=VH_SNAP*.75&&time<TL.start-.05;}
// «Qui tria»: in mode sorpresa every press picks a piece of the tray at random (for whom scanning is not yet possible).
export const vhSurprise=s=>s?.vhWho==='sorpresa';
// How the wheels roll (the character of the ride): the knobbly wheels bounce, the thin racing wheels are fast and lean in the curves, the
// wooden ones roll steadily and clack. Speed is a factor of the pace along the circuit (the ride always lasts the same).
export const VH_ROLL=Object.freeze({tacs:{bounce:1,lean:.3,clack:0,wobble:.6},primes:{bounce:.1,lean:1,clack:0,wobble:0},fusta:{bounce:.25,lean:.2,clack:1,wobble:.25},amples:{bounce:.7,lean:.15,clack:0,wobble:.9},radis:{bounce:.15,lean:.5,clack:.6,wobble:.1},tapacubs:{bounce:.05,lean:.35,clack:0,wobble:0},bessones:{bounce:.2,lean:.15,clack:.4,wobble:.2},erugues:{bounce:.1,lean:0,clack:.8,wobble:.3},balons:{bounce:1,lean:.2,clack:0,wobble:1},ferro:{bounce:.3,lean:.1,clack:1,wobble:.15}});
// The gag of each accessory: the roof box opens half way round and three balls bounce out; the trailer's blocks hop off at the garage and
// stack into a tower; the finish banner drops at the end and the flag waves.
// 0.54: the beacon turns all the way and lights up past the middle; the fire ladder rises and extends at the garage; the balloon floats away
// at the garage.
export const VH_GAG=Object.freeze({baca:{at:.5,kind:'pilotes'},remolc:{at:1,kind:'torre'},bandera:{at:.9,kind:'meta'},sirena:{at:.55,kind:'llum'},escala:{at:1,kind:'escala'},globus:{at:1,kind:'globus'},brac:{at:1,kind:'grua'},cano:{at:.44,kind:'aigua'},campana:{at:.3,kind:'campana'},manega:{at:1,kind:'manega'}});
// 0.55, the living room: the crane arm lowers its hook at the garage and lifts a block; the water cannon sprays the plant pot by the circuit
// and its flower opens; the bell swings and rings on the floor; the hose unrolls out of the reel at the garage.
// The circuit of the room, in the world units of the scene (centimetres of a toy world: the bench is 200 high, the chassis 30 long):
// from the chassis on the bench, over the edge, down the ramp, a lap round the rug, between the blocks and up to the garage shelf.
export const VH_PATH=Object.freeze({habitacio:Object.freeze([[0,0,0],[130,0,30],[250,0,80],[310,-30,110],[400,-120,230],[470,-200,330],[450,-200,470],[330,-200,590],[120,-200,660],[-130,-200,650],[-330,-200,560],[-400,-200,400],[-310,-200,260],[-120,-200,200],[80,-200,240],[200,-200,360],[160,-200,520],[-20,-200,600],[-250,-200,540],[-470,-200,470],[-610,-192,420]])});
// The living room (0.55): the same bench, ramp and garage; over the stack of books (a small climb), under the low table, round the rug,
// past the plant pot and up to the garage.
// Both circuits end 8 units up, on the plate of the garage shelf (0.56), so the wheels and the gags at the garage sit on it.
const VH_PATH_SALA=Object.freeze([[0,0,0],[130,0,30],[250,0,80],[310,-30,110],[400,-120,230],[470,-200,330],[430,-200,430],[330,-172,480],[250,-172,500],[150,-200,540],[-40,-200,575],[-220,-200,560],[-330,-200,470],[-300,-200,330],[-160,-200,250],[20,-200,260],[130,-200,340],[170,-200,460],[80,-200,650],[-100,-200,700],[-300,-200,680],[-470,-200,560],[-610,-192,420]]);
export const vhPathOf=corner=>corner==='sala'?VH_PATH_SALA:VH_PATH[corner]||VH_PATH.habitacio;
