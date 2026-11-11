// El vestidor fantàstic (EN06, rebuilt in 0.73): the model of the variety show. Each round is a «funció»: an artist comes into the dressing
// room in striped underwear and the pupil chooses, one at a time, what goes on the head, on the body and on the feet, and (with four
// pieces, the default) the magic object; every pick is put on at once with its own little gag, Pipa the dog copies it in small and the
// mirror plays a trick that the artist does not see. With the last pick the dressing-room wall rises like a curtain and the artist does a
// number on the stage in which the three pieces act together: the feet say how the artist walks, the body how it moves, the head what
// happens above, and the magic object brings the climax; then the bow, the curtain, and the next artist. Every fourth show ends with the
// four artists bowing together in the clothes they wore. Nothing here draws or sounds: vestidor-art.js paints, vestidor-so.js plays.
// The drawings are ChatGPT's (Marc's commission, November 2026), moved whole; the clothes are layers lifted from edits of the same drawing.
export const VS_ARTISTS=Object.freeze(['rita','hug','quim','ona']);
export const VS_COSTUMES=Object.freeze(['pirata','ballarina','bus','astronauta','pastisser','reialesa']);
export const VS_OBJECTS=Object.freeze(['paraigua','tuba','globus','regadora','ventall','cinta']);
export const VS_SLOTS=Object.freeze(['cap','cos','peus','objecte']);
export const VS_LIGHTS=Object.freeze(['tarda','vespre','nit']);
// The word of each piece: the accessible name of its zone, one word (nothing is ever written on the screen), and its long name for the
// tests and the notes.
export const VS_WORD=Object.freeze({
 cap:Object.freeze({pirata:'Barret',ballarina:'Diadema',bus:'Ulleres',astronauta:'Casc',pastisser:'Gorro',reialesa:'Corona'}),
 cos:Object.freeze({pirata:'Jupa',ballarina:'Tutú',bus:'Neoprè',astronauta:'Astronauta',pastisser:'Davantal',reialesa:'Capa'}),
 peus:Object.freeze({pirata:'Botes',ballarina:'Sabatilles',bus:'Aletes',astronauta:'Botes-lunars',pastisser:'Sabates',reialesa:'Babutxes'}),
 objecte:Object.freeze({paraigua:'Paraigua',tuba:'Tuba',globus:'Globus',regadora:'Regadora',ventall:'Ventall',cinta:'Cinta'})});
export const VS_NAME=Object.freeze({
 cap:Object.freeze({pirata:'Barret de pirata',ballarina:'Diadema de flors',bus:'Ulleres i tub de bus',astronauta:'Casc d’astronauta',pastisser:'Gorro de pastisser',reialesa:'Corona'}),
 cos:Object.freeze({pirata:'Jupa de pirata',ballarina:'Tutú',bus:'Vestit de neoprè',astronauta:'Vestit d’astronauta',pastisser:'Davantal de pastisser',reialesa:'Capa reial'}),
 peus:Object.freeze({pirata:'Botes de pirata',ballarina:'Sabatilles de ballet',bus:'Aletes',astronauta:'Botes lunars',pastisser:'Sabates de mantega',reialesa:'Babutxes de punta enroscada'}),
 objecte:Object.freeze({paraigua:'Paraigua',tuba:'Tuba',globus:'Globus',regadora:'Regadora',ventall:'Ventall',cinta:'Cinta de gimnàstica'})});
export const VS_ARTIST_NAME=Object.freeze({rita:'Rita',hug:'Hug',quim:'Avi Quim',ona:'Ona'});
export const vsWord=(slot,id)=>VS_WORD[slot]?.[id]||id;
// The code of a layer of the drawings: 11..63 (costume and slot: 1 head, 2 body, 3 feet), B12..B62 (the body in the ta-da pose),
// 62c / 62k (the royal cape behind and its collar), 62r (rolled in the cape), E1..E8 (faces), O1..O6 (the object held up).
export const vsCode=(slot,id)=>slot==='objecte'?'O'+(VS_OBJECTS.indexOf(id)+1):`${VS_COSTUMES.indexOf(id)+1}${VS_SLOTS.indexOf(slot)+1}`;
// The faces of the drawings: 0 is the master's smile.
export const VS_FACE=Object.freeze({riu:1,llengua:2,sorpresa:3,parpelleig:4,ups:5,dreta:6,esquerra:7,esforc:8});
// The times (seconds). A pick: the piece flies from its card (VS_FLY) and lands, its gag, Pipa's copy and the look at the mirror; a slip
// of the piece to the wrong place («despistes») adds VS_SLIP. The last pick: the piece (VS_LAST), the dressing-room wall rises (VS_UP), the
// number (VS_NUMBER, «Durada del número»), the bow (VS_BOW), every fourth show the four artists together (VS_GROUP), the curtain (VS_CLOSE)
// and the dressing room coming down again with the next artist (VS_BACK).
export const VS_FLY=.8,VS_STEP=5,VS_SLIP=1.6,VS_LAST=4,VS_UP=1.6,VS_BOW=3,VS_GROUP=5.2,VS_CLOSE=1.9,VS_BACK=1.1,VS_GROUP_EVERY=4;
export const VS_NUMBER=Object.freeze({curt:9,normal:13,llarg:17});
export const vsClamp=(x,a=0,b=1)=>x<a?a:x>b?b:x;
export const vsEase=u=>{u=vsClamp(u);return u*u*(3-2*u);};
export const vsOut=u=>{u=vsClamp(u);return 1-(1-u)*(1-u);};
export const vsIn=u=>{u=vsClamp(u);return u*u;};
export const vsPh=(t,a,b)=>vsClamp((t-a)/Math.max(1e-6,b-a));
// A paper bounce: overshoots and settles (a piece that lands, a figure that stops).
export function vsSettle(u,k=2.2){u=vsClamp(u);return 1-Math.exp(-u*5.5)*Math.cos(u*Math.PI*k)*(1-u);}
export function vsHash(a,b=0,c=0){let h=(Math.imul((a|0)+1,73856093)^Math.imul((b|0)+7,19349663)^Math.imul((c|0)+13,83492791))>>>0;h=Math.imul(h^h>>>13,1274126177)>>>0;return((h^h>>>16)>>>0)/4294967296;}
// «Peces per funció»: 3 (head, body, feet) or 4 (and the magic object, the default).
export const vsSteps=s=>String(s?.vsSteps??'4')==='3'?3:4;
export const vsSlots=s=>VS_SLOTS.slice(0,vsSteps(s));
export const vsSlotOf=(state,s)=>vsSlots(s)[Math.min(state?.stage|0,vsSteps(s)-1)];
// «Primer artista» and the round: who performs, under which light (afternoon, evening, opening night), and how many shows before.
export const vsFirst=s=>VS_ARTISTS.includes(s?.vsFirst)?s.vsFirst:VS_ARTISTS[0];
export function vsRoundOf(round,s=null){const r=Math.max(0,round|0),a=(VS_ARTISTS.indexOf(vsFirst(s))+r)%VS_ARTISTS.length;return {round:r,artist:VS_ARTISTS[a],light:VS_LIGHTS[r%VS_LIGHTS.length],group:(r+1)%VS_GROUP_EVERY===0};}
// How many pieces are offered at a time: the general «Opcions de contingut», between 2 and 4 (the pieces are big).
export const vsCells=s=>{const n=+(s?.scanOptions||3);return n<=2?2:n>=4?4:3;};
const vsShuffle=(list,a,b)=>{const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(vsHash(a,b,i)*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
export const vsFamily=slot=>slot==='objecte'?VS_OBJECTS:VS_COSTUMES;
// The pieces of a round: as many as vsCells, turning with the round and the slot so that every piece comes round; the order changes
// from round to round and stays while the round lasts.
export function vsOptions(state,s){const slot=vsSlotOf(state,s),fam=vsFamily(slot),n=Math.min(vsCells(s),fam.length),r=Math.max(0,state?.round|0),k=VS_SLOTS.indexOf(slot),start=(r*n+Math.floor(r*n/fam.length)+k*5)%fam.length;
 const list=[];for(let i=0;i<n;i++)list.push(fam[(start+i)%fam.length]);return vsShuffle(list,r*7+k,r>>2);}
// What the artist wears so far: {cap, cos, peus, objecte} by the slot of each pick (null if not yet chosen).
export function vsPicks(state,s,pendingValue=null){const slots=vsSlots(s),vals=(state?.picks||[]).map(p=>p?.value??p?.id??p);if(pendingValue!==null&&pendingValue!==undefined)vals.push(pendingValue);
 const out={cap:null,cos:null,peus:null,objecte:null};slots.forEach((k,i)=>{if(i<vals.length)out[k]=vals[i];});return out;}
// «Despistes» (on by default): one pick in three first lands in the wrong place (the hat on the feet, the shoes on the head) before the
// artist, surprised, laughs and puts it right; never the magic object, and never twice in a row.
export function vsSlip(round,stage,s){if(s?.vsDespistes===false)return null;const k=stage|0,slot=vsSlots(s)[k];if(!slot||slot==='objecte')return null;
 const hit=i=>vsHash(round|0,i,31)<1/3;if(!hit(k)||k>0&&hit(k-1))return null;return slot==='cap'?'peus':'cap';}
// The trick of the mirror after a pick: the reflection wears another piece, or pulls a face, until the artist turns to look.
export function vsMirror(round,stage,s,value){const slot=vsSlots(s)[stage|0],fam=vsFamily(slot),k=vsHash(round|0,stage|0,41);
 if(k<.55){const others=fam.filter(x=>x!==value);return {kind:'peca',slot,id:others[Math.floor(vsHash(round|0,stage|0,43)*others.length)]};}return {kind:'ganyota'};}
export const vsNumberTime=s=>VS_NUMBER[s?.vsNumber]??VS_NUMBER.normal;
// The durations of a pick: a step (the piece and its gag) and the last one (the piece, the stage, the number, the bow and the way back).
export function vsTimes(s,state){const stage=state?.stage|0,round=state?.round|0,slip=vsSlip(round,stage,s)?VS_SLIP:0,fin=vsTimeline(s,round,slip);return {wrong:1,step:VS_STEP+slip,final:fin.end,slip};}
// The timeline of the last pick, in seconds from the press: the piece (put), the wall going up (up), the number (from num to numEnd), the
// bow, the four artists together every fourth show, the curtain and the way back to the dressing room.
export function vsTimeline(s,round=0,slip=0){const N=vsNumberTime(s),R=vsRoundOf(round,s),put=VS_LAST+slip,up=put+VS_UP,numEnd=up+N,bow=numEnd+VS_BOW,group=R.group?VS_GROUP:0,close=bow+group+VS_CLOSE,end=close+VS_BACK;
 return {put,up,num:up,numEnd,N,bow,group:R.group,groupStart:bow,groupEnd:bow+group,close,end,slip};}
// The parts of the number (fractions of it): the artist comes in with the gait of the feet, then the body's way of moving in the middle,
// then the magic object (or, with three pieces, the body again, bigger). What happens above (the head) goes on from beginning to end.
export const VS_ACTS=Object.freeze({walk:[0,.3],move:[.3,.62],magic:[.62,1]});
// The number made of the pieces: the costume of each layer, the object, a pair of pieces with its own surprise and the whole costume.
export function vsNumber(P){const full=P.cap&&P.cap===P.cos&&P.cos===P.peus?P.cap:null;return {head:P.cap,body:P.cos,feet:P.peus,object:P.objecte,pair:vsPair(P),full};}
// The pairs with their own surprise in the number (12): the umbrella and the flippers (it glides down waddling), the balloon and the
// space suit (it floats right up to the top), the watering can and the flower crown (the flowers bloom), the fan and the chef's hat (the
// hat blows away and comes back), the tuba and the pirate hat (the parrot is blown off and flies back), the ribbon and the tutu (a double
// pirouette inside the ribbon), the umbrella and the cape (the cape billows like a sail), the watering can and the wetsuit (it swims in the
// shower), the balloon and the moon boots (the jump that never comes down), the fan and the apron (a storm of flour), the tuba and the
// helmet (the helmet fills with bubbles... of sound: notes come out of it), the ribbon and the crown (the crown spins on the ribbon).
export const VS_PAIRS=Object.freeze([['objecte','paraigua','peus','bus','planeja'],['objecte','globus','cos','astronauta','espai'],['objecte','regadora','cap','ballarina','flors'],['objecte','ventall','cap','pastisser','gorro'],['objecte','tuba','cap','pirata','lloro'],['objecte','cinta','cos','ballarina','doble'],['objecte','paraigua','cos','reialesa','vela'],['objecte','regadora','cos','bus','dutxa'],['objecte','globus','peus','astronauta','flota'],['objecte','ventall','cos','pastisser','farina'],['objecte','tuba','cap','astronauta','notes'],['objecte','cinta','cap','reialesa','corona']]);
export function vsPair(P){for(const [a,x,b,y,k] of VS_PAIRS)if(P[a]===x&&P[b]===y)return k;return null;}
// The backdrop of the stage: the world of the costume of the body (the sea, the garden, the deep, space, the bakery, the castle).
export const vsBackdrop=P=>Math.max(0,VS_COSTUMES.indexOf(P.cos||P.cap||P.peus||'pirata'));
