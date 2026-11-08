// El taller de vehicles (EN07, 0.53): the model of the toy workshop in three dimensions, the first activity of Pim Pam made with three.js.
// A corner of a house at a time (the room first; the living room, the yard, the corridor and the bathroom come later), four lights each.
// A round builds one toy vehicle on the grey chassis of the bench: the pupil scans the pieces of the tray and chooses the body, the wheels,
// the accessory and, with four picks, the colour; each piece flies from the tray and clicks on. The finished vehicle waits for a press (or
// starts alone after VH_WAIT seconds), rolls down the ramp, goes round the room and parks on the garage shelf; the wheels change how it
// rolls and the accessory brings its gag. Nothing here draws or sounds: vehicles-3d.js builds and renders, vehicles-art.js paints the
// board, vehicles-so.js plays.
export const VH_CORNERS=Object.freeze(['habitacio']);
export const VH_LIGHTS=Object.freeze({habitacio:['mati','tarda','capvespre','nit']});
export const VH_BODIES=Object.freeze({habitacio:['familiar','autobus','furgoneta','curses']});
export const VH_WHEELS=Object.freeze({habitacio:['tacs','primes','fusta']});
export const VH_TOPS=Object.freeze({habitacio:['baca','remolc','bandera']});
export const VH_COLORS=Object.freeze(['blau','corall','groc','verd']);
export const VH_STAGES=Object.freeze(['body','wheels','top','color']);
export const VH_CORNER_NAME=Object.freeze({habitacio:'L’habitació'});
export const VH_LIGHT_NAME=Object.freeze({mati:'Matí',tarda:'Tarda',capvespre:'Capvespre',nit:'Nit'});
// The word of each piece (the accessible name of its button; nothing is ever written on the screen).
export const VH_WORD=Object.freeze({familiar:'Cotxe',autobus:'Autobús',furgoneta:'Furgoneta',curses:'Bòlid',tacs:'Tacs',primes:'Primes',fusta:'Fusta',baca:'Maleta',remolc:'Remolc',bandera:'Bandera',blau:'Blau',corall:'Corall',groc:'Groc',verd:'Verd'});
// The long name of each piece, for the «Informació» panel and the tests.
export const VH_NAME=Object.freeze({familiar:'Cotxe familiar',autobus:'Autobús',furgoneta:'Furgoneta de repartiment',curses:'Cotxe de curses',tacs:'Rodes de tacs',primes:'Rodes primes de curses',fusta:'Rodes de fusta',baca:'Baca amb maleta',remolc:'Remolc de blocs',bandera:'Bandereta',blau:'Blau',corall:'Corall',groc:'Groc',verd:'Verd'});
// The palette of the soft vinyl toys (Marc's concept art of 8 November 2026), as hex numbers for three.js and strings for the canvas.
export const VH_PALETTE=Object.freeze({blau:0x2a5be0,corall:0xf06a43,groc:0xffc81e,verd:0x2aa497,marina:0x1c2a55,crema:0xf7ead8,gris:0xb8bcc9,paret:0xa7b2f3,menta:0x93dfc6,prestatge:0xf2775c,fusta:0xd9a76a});
export const vhHex=n=>'#'+(n>>>0).toString(16).padStart(6,'0');
// The colour each body comes in when there is no colour pick.
export const VH_BODY_COLOR=Object.freeze({familiar:'blau',autobus:'groc',furgoneta:'corall',curses:'verd'});
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
// The round: its corner and light (four rounds per corner, one per light, the corners in turn), and the visit (how many times round).
export function vhRoundOf(round){const r=Math.max(0,round|0),n=VH_CORNERS.length,ci=Math.floor(r/VH_ROUNDS)%n,corner=VH_CORNERS[ci],li=r%VH_ROUNDS;return {round:r,corner,ci,light:VH_LIGHTS[corner][li],li,visit:Math.floor(r/(VH_ROUNDS*n))};}
// «Tries per vehicle»: 2 (body and wheels), 3 (and the accessory) or 4 (and the colour).
export const vhSteps=s=>{const n=+(s?.vhSteps||3);return n===2||n===4?n:3;};
export const vhStageKinds=s=>VH_STAGES.slice(0,vhSteps(s));
export const vhStageKind=(state,s)=>vhStageKinds(s)[Math.min(state?.stage|0,vhSteps(s)-1)];
const vhShuffle=(list,a,b)=>{const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(vhHash(a,b,i)*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
// The pieces of the family of a stage in a corner.
export function vhFamily(kind,corner='habitacio'){return kind==='body'?VH_BODIES[corner]:kind==='wheels'?VH_WHEELS[corner]:kind==='top'?VH_TOPS[corner]:VH_COLORS;}
// The pieces of the tray: as many as «Opcions de contingut» (2 to 4), never more than the family has. The bodies rotate with the round, so
// with three options each round leaves out another body; the order changes with the round and the stage, and stays while the stage lasts.
export function vhOptions(state,s){const n=Math.max(2,Math.min(4,s?.scanOptions||3)),R=vhRoundOf(state?.round),kind=vhStageKind(state,s),fam=vhFamily(kind,R.corner),k=Math.min(n,fam.length),start=(R.round+(state?.stage|0))%fam.length;
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
export const VH_ROLL=Object.freeze({tacs:{bounce:1,lean:.3,clack:0,wobble:.6},primes:{bounce:.1,lean:1,clack:0,wobble:0},fusta:{bounce:.25,lean:.2,clack:1,wobble:.25}});
// The gag of each accessory: the roof box opens half way round and three balls bounce out; the trailer's blocks hop off at the garage and
// stack into a tower; the finish banner drops at the end and the flag waves.
export const VH_GAG=Object.freeze({baca:{at:.5,kind:'pilotes'},remolc:{at:1,kind:'torre'},bandera:{at:.9,kind:'meta'}});
// The circuit of the room, in the world units of the scene (centimetres of a toy world: the bench is 200 high, the chassis 30 long):
// from the chassis on the bench, over the edge, down the ramp, a lap round the rug, between the blocks and up to the garage shelf.
export const VH_PATH=Object.freeze({habitacio:Object.freeze([[0,0,0],[130,0,30],[250,0,80],[310,-30,110],[400,-120,230],[470,-200,330],[450,-200,470],[330,-200,590],[120,-200,660],[-130,-200,650],[-330,-200,560],[-400,-200,400],[-310,-200,260],[-120,-200,200],[80,-200,240],[200,-200,360],[160,-200,520],[-20,-200,600],[-250,-200,540],[-470,-200,470],[-610,-200,420]])});
export const vhPathOf=corner=>VH_PATH[corner]||VH_PATH.habitacio;
