// Encaixos de fusta (EN12, 0.45): the model of the painted wooden peg puzzle. Twenty boards in five worlds (the port, the circus, the
// city, the forest and space), four lights each, five figures per world: on each board four of them have a hole and the fifth is the guest
// piece that fits nowhere. A round is one hole: the pupil scans the pieces of the tray and the right one flies to its hole and comes
// alive; the fourth one brings the party of the board and the next board slides in. The boards alternate between worlds, so two boards
// in a row never look alike, and when the twenty come back round the guest, the order of the holes and the gags of the figures change.
// Nothing here draws or sounds: encaix-art.js paints, encaix-so.js plays.
export const EX_WORLDS=Object.freeze(['port','circ','ciutat','bosc','espai']);
export const EX_FIGS=Object.freeze({port:['barca','gavina','pescadora','pop','cranc'],circ:['monocicle','malabarista','pallassa','trapezi','gos'],ciutat:['tramvia','bombera','forner','gat','paraigua'],bosc:['esquirol','mussol','cervol','erico','guineu'],espai:['coet','astronauta','planeta','alien','cometa']});
export const EX_LIGHTS=Object.freeze({port:['mati','migdia','capvespre','nit'],circ:['entrada','llums','confeti','final'],ciutat:['mercat','pluja','festa','nit'],bosc:['primavera','estiu','tardor','hivern'],espai:['lluna','planetes','estels','terra']});
export const EX_WORLD_NAME=Object.freeze({port:'El port',circ:'El circ',ciutat:'La ciutat',bosc:'El bosc',espai:'L’espai'});
export const EX_LIGHT_NAME=Object.freeze({mati:'Matí',migdia:'Migdia',capvespre:'Capvespre',nit:'Nit',entrada:'L’entrada',llums:'El número dels llums',confeti:'Pluja de confeti',final:'Gran final',mercat:'Mercat del matí',pluja:'Pluja',festa:'Festa major',primavera:'Primavera',estiu:'Estiu',tardor:'Tardor',hivern:'Hivern',lluna:'La Lluna',planetes:'Els planetes',estels:'Pluja d’estels',terra:'Sortida de la Terra'});
// The word of each piece (the accessible name of its button; nothing is ever written on the screen).
export const EX_WORD=Object.freeze({barca:'Barca',gavina:'Gavina',pescadora:'Pescadora',pop:'Pop',cranc:'Cranc',monocicle:'Equilibrista',malabarista:'Malabarista',pallassa:'Pallassa',trapezi:'Acròbata',gos:'Gos',tramvia:'Tramvia',bombera:'Bombera',forner:'Forner',gat:'Gat',paraigua:'Nena',esquirol:'Esquirol',mussol:'Mussol',cervol:'Cérvol',erico:'Eriçó',guineu:'Guineu',coet:'Coet',astronauta:'Astronauta',planeta:'Planeta',alien:'Extraterrestre',cometa:'Cometa'});
// The silhouette of each piece, for «Semblança de les peces»: upright, wide or round.
export const EX_SHAPE=Object.freeze({barca:'ample',gavina:'ample',pescadora:'dret',pop:'rodo',cranc:'ample',monocicle:'dret',malabarista:'dret',pallassa:'ample',trapezi:'dret',gos:'ample',tramvia:'ample',bombera:'dret',forner:'dret',gat:'ample',paraigua:'dret',esquirol:'dret',mussol:'rodo',cervol:'dret',erico:'rodo',guineu:'ample',coet:'dret',astronauta:'dret',planeta:'rodo',alien:'dret',cometa:'ample'});
export const EX_BOARDS=20;
// The times (seconds): the flight of the piece from the tray to its hole, its life, a step; the party of the board after the fourth
// piece and the change of board; a piece that does not fit (it tries the hole and hops back).
export const EX_FLY=.9,EX_LIFE=4.6,EX_STEP=6,EX_PARTY=12,EX_OUT=1.6,EX_FINAL=EX_FLY+EX_PARTY+EX_OUT,EX_WRONG=1.6;
// «Ritme calmat» (exPace .72) slows everything of a result alike: the flight, the life, the party, the music and the sounds.
export const exTimes=s=>{const p=exPace(s);return {wrong:EX_WRONG/p,final:EX_FINAL/p,step:EX_STEP/p};};
export const exWorldOf=id=>EX_WORLDS.find(w=>EX_FIGS[w].includes(id))||'port';
export const exClamp=(x,a=0,b=1)=>x<a?a:x>b?b:x;
export const exEase=u=>{u=exClamp(u);return u*u*(3-2*u);};
export const exOut=u=>{u=exClamp(u);return 1-(1-u)*(1-u);};
export const exIn=u=>{u=exClamp(u);return u*u;};
// 0..1 between a and b of t, eased
export const exPh=(t,a,b)=>exEase((t-a)/(b-a));
// A wooden bounce: an overshoot that settles (for a piece that lands, a part that stops).
export function exSettle(u,k=2.2){u=exClamp(u);return 1-Math.exp(-u*5.5)*Math.cos(u*Math.PI*k)*(1-u);}
const exHash=(a,b,c=0)=>{let h=(Math.imul(a+1,73856093)^Math.imul(b+7,19349663)^Math.imul(c+13,83492791))>>>0;h=Math.imul(h^h>>>13,1274126177)>>>0;return((h^h>>>16)>>>0)/4294967296;};
export const exRand=exHash;
// The board of a round: the world and its light, the four figures with a hole and the order in which the holes come up, the guest piece,
// and the gag of this visit (0 or 1). Board b of the twenty is world b % 5 with light b / 5, so the worlds alternate.
export function exBoardOf(round){const r=Math.max(0,round|0),b=r%EX_BOARDS,visit=Math.floor(r/EX_BOARDS),wi=b%5,li=Math.floor(b/5),world=EX_WORLDS[wi],figs=EX_FIGS[world];
 const gi=(li+visit)%5,guest=figs[gi],holes=figs.filter((_,i)=>i!==gi),rot=(li*2+visit*3)%4;let order=holes.map((_,i)=>holes[(i+rot)%4]);if(visit%2)order=order.reverse();
 return {b,round:r,world,wi,light:EX_LIGHTS[world][li],li,visit,holes,guest,order,variant:visit%2};}
export const exVariant=(round,stage)=>(Math.floor(Math.max(0,round|0)/EX_BOARDS)+(stage|0))%2;
export const exPlaced=state=>(state?.picks||[]).map(p=>p?.value??p?.id??p);
// The target of the round (mode Encaixa): the hole that comes up at this stage. In mode Lliure there is none: every piece goes to its own hole.
export function exTarget(state,s){if(s?.exMode==='lliure')return null;const B=exBoardOf(state.round);return B.order[Math.min(3,state.stage|0)]||null;}
const exShuffle=(list,a,b)=>{const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(exHash(a,b,i)*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
// The pieces of another world, when the tray asks for more pieces than the board has left: they are seen to be strangers.
function exForeign(B){const w=EX_WORLDS[(B.wi+1+B.li)%5];const f=EX_FIGS[w];return f.map((_,i)=>f[(i+B.visit)%5]);}
// The pieces of the tray: as many as «Opcions de contingut» (2 to 4). Encaixa: the right one and the others, chosen among the figures of the
// board that are still out, then the guest, then strangers; «Semblança» prefers pieces of the same silhouette (Semblants) or of another one
// (Diferents). Lliure: the figures of the board still out, up to that many. The order changes with the round and the stage, and stays the
// same while the same hole is being tried.
export function exOptions(state,s){const n=Math.max(2,Math.min(4,s?.scanOptions||3)),B=exBoardOf(state.round),placed=exPlaced(state),stage=state.stage|0,left=B.order.filter(id=>!placed.includes(id));
 if(s?.exMode==='lliure'){if(!left.length)return [];const k=(stage+B.round)%left.length;const list=left.slice(k).concat(left.slice(0,k)).slice(0,n);return exShuffle(list,B.round,stage);}
 const target=B.order[Math.min(3,stage)];if(!target)return [];const like=s?.exLike==='semblants';
 const score=id=>((EX_SHAPE[id]===EX_SHAPE[target])===like?0:1);
 const pool=[...left.filter(id=>id!==target).map(id=>({id,p:0})),{id:B.guest,p:1},...exForeign(B).map(id=>({id,p:2}))];
 pool.sort((a,b)=>((a.p>1)-(b.p>1))||(score(a.id)-score(b.id))||(a.p-b.p));
 return exShuffle([target,...pool.slice(0,n-1).map(x=>x.id)],B.round,stage);}
// «Ajuda després de»: after that many pieces that did not fit in the same round, the right piece sways softly in the tray.
export function exHelp(state,s){const n=s?.exHelp==='2'?2:s?.exHelp==='3'?3:0;return !!n&&s?.exMode!=='lliure'&&(state?.errors|0)>=n;}
export const exPace=s=>s?.exPace==='calmat'?.72:1;
// The hole a piece goes to on its board (its index among the four), or -1 for the guest and the strangers.
export const exHoleOf=(B,id)=>B.holes.indexOf(id);
