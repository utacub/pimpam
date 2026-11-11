// Fractals a la natura (CE46, 0.73) · stimuli 6–10: riu i afluents, corall, romanesco, neurones, illa i costa. As in fractals-formes1.js:
// each one follows its concept picture (ChatGPT, 2026-11-11), in its units (1672 × 941), and grows order by order.
import {frPath,frPathT,frLoop,frEvent,frCurve,frGrow,frAt,frSpline,frOutline,frOut,frLine,frDendrite,frTurn,frColonize,frScatter,frDrawNet,frRoom,frTree,FR_TAU} from './fractals-formes.js';
import {frRandom,frNoise,frIso,frChains} from './fractals-motor.js';

// ── 6 · Riu i afluents ────────────────────────────────────────────────────────────────────────────────────────────────────
// A river basin seen from the air is a tree that fills the land: every tributary has its own tributaries, and the numbers and lengths
// of the streams of each order keep the same ratios from one order to the next (Horton, 1945; Strahler, 1957), which makes the network
// self-similar, a fractal (Rodríguez-Iturbe & Rinaldo, 1997). The network grows upstream from the mouth, by headward erosion. Growth:
// the main river from the sea; its great tributaries; then each order of smaller streams, all at once. Concept 06: a wide blue river
// coming in at the bottom and opening into tributaries that cover the whole screen, cyan, then green, the finest yellow-green.
const FR_RIVER={P:[640,975,690,885,830,805,880,722,840,662,700,602,652,540,700,480,772,430,792,385],kids:[
 [650,540,520,515,400,512,300,555,210,595,110,612,20,600],[792,385,700,342,600,322,530,252,490,172,420,92,380,10],[792,385,832,300,852,222,812,150,790,60,800,-10],
 [775,430,900,382,1050,322,1200,302,1300,252,1380,172,1430,90],[872,712,960,672,1050,632,1160,602,1270,622,1380,582,1480,522,1560,452,1640,400],[835,792,720,742,600,762,480,782,380,830,300,900],
 [1200,302,1300,330,1420,360,1540,330,1650,300],[1160,602,1180,700,1250,780,1300,880],[905,700,960,620,1010,550,1080,490,1120,410]]};
export const FR_RIU={id:'riu',name:'Riu i afluents',what:'el riu i els seus afluents, de l’un a l’altre',
 pal:['#2a5cff','#1aa8ff','#1ae6e6','#2ee88a','#9cf03a'],pal2:['#3a4cff','#1a8cff','#1ad0f0','#2ee8b0','#c8f03a'],
 look:{bloom:.42,glow:2.3,halo:.16,core:.15,spread:.6},wind:0,
 acts:[(S,t0)=>{const k=S.k,O={W:[40,19,10,4.6,2.2,1.2],C:[[0,.1],[.32,.44],[.44,.54],[.56,.7],[.72,.86],[.88,1]],every:[0,85,40,19,10],len:[0,0,230,105,48,21],spread:.75,meander:1.4,
   bias:(x,y)=>Math.atan2(y-990,x-760),biasK:.3,T:[0,.8,1.45,2.05,2.6,3.05],dur:[1,.8,.65,.55,.45,.35],fork:2,maxLv:5,hot:.7,lum:[.62,.85,.95,1,1,1]};
  const m=frSpline(FR_RIVER.P,6);frDendrite(S,m.pts,0,{...O,maxLv:0},t0);
  for(const P of FR_RIVER.kids){const c=frSpline(P,6);frDendrite(S,c.pts,1,O,t0,300);}
  frEvent(S,'tronc',.8,t0);frEvent(S,'branca',.9,t0+.85*k);frEvent(S,'fulla',1.1,t0+1.6*k);frEvent(S,'fulla',.6,t0+2.3*k);}]};

// ── 7 · Corall ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A branching coral grows at its tips, where the water brings food and light, and each tip splits when it widens: the colony repeats
// the same fork at every size, so that a branch looks like the whole coral (Kaandorp, 1994, modelled it as accretive growth; the
// branching of Acropora and of gorgonians is self-similar over three or four orders). And a branch grows where there is water left:
// it turns aside from its neighbours, so the colony fills the space without crossing itself. Growth: the stems from the reef floor and
// their great limbs (traced from the concept); then the side branches, each one a small coral that forks order by order, all of the
// same order at once, down to the finest twigs. Concept 07: thick magenta stems like glass tubes rising from the bottom in S curves,
// pink limbs, orange branches, and cream twigs ending in small forks, filling the screen.
// The limbs: P (control points), w [width at the start, at the end], kids (limbs that leave it, from their first point)
const FR_CORAL_LIMBS=[
 {P:[440,975,446,905,420,862,380,832,330,814,270,806,210,800,160,786,112,768],w:[44,10],kids:[
   {P:[352,820,333,772,304,712,280,684,240,664,160,656],w:[17,8],kids:[{P:[296,700,272,650,252,608,246,565],w:[10,6]}]},
   {P:[420,866,425,822,428,792],w:[12,7]},{P:[448,906,462,884,478,876],w:[10,6]}]},
 {P:[650,975,646,885,622,795,574,708,512,652,462,602,432,548,406,502,362,472,312,446,262,414,200,410,150,410],w:[46,12],kids:[
   {P:[600,742,581,672,579,612,596,562,642,515,702,472,762,432,812,396,872,366,942,336,1002,310,1042,280,1072,235,1112,180,1156,134],w:[38,11],kids:[
     {P:[812,396,802,332,796,282,782,232,762,192,722,160,690,132],w:[17,8]},{P:[1044,280,1056,232,1060,196,1046,150],w:[11,7]},
     {P:[1050,282,1100,286,1152,286],w:[10,6]},{P:[642,515,641,470,636,425],w:[11,6]},{P:[932,342,941,310,936,290],w:[9,6]}]},
   {P:[406,502,426,452,450,410,465,362,456,322,436,300,431,268],w:[17,8]},
   {P:[262,414,226,372,202,322,192,272,202,226],w:[14,7]},{P:[438,566,462,520,472,486],w:[9,6]}]},
 {P:[722,975,716,882,760,812,830,762,876,716,922,660,962,610,1012,576,1082,556,1162,536,1242,511,1332,491,1410,481,1462,491,1512,505],w:[42,11],kids:[
   {P:[876,716,862,656,850,616,815,604,775,600],w:[15,7],kids:[{P:[855,630,853,577],w:[9,6]}]},
   {P:[992,590,991,540,986,482],w:[12,7]},{P:[1102,550,1126,520,1136,480,1130,422],w:[12,7]},
   {P:[1242,511,1266,456,1290,396,1340,350,1400,296,1450,242,1490,202,1515,166],w:[19,8],kids:[{P:[1400,296,1450,266,1510,252],w:[10,6]},{P:[1288,402,1282,342],w:[9,6]}]},
   {P:[1412,481,1450,442,1482,410],w:[10,6]},{P:[762,808,766,770,766,745],w:[10,6]}]},
 {P:[948,975,961,920,991,890,1041,865,1121,845,1201,835,1281,825,1351,800,1421,776,1501,751,1561,745],w:[40,10],kids:[
   {P:[1121,845,1146,790,1161,740,1166,685],w:[15,7],kids:[{P:[1152,762,1202,742,1262,727],w:[9,6]}]},
   {P:[1361,796,1386,746,1400,700,1394,640],w:[14,7],kids:[{P:[1398,690,1420,622],w:[8,6]}]},
   {P:[1272,832,1332,864,1422,880],w:[11,6]},{P:[956,928,966,862,976,826,1000,800],w:[12,7]}]}];
// the side branches of a limb: on alternate sides every so often, leaning out and up, each one the root of a small coral
function frCoralSeeds(c,w0,w1,T,dur,R,out,d0,id){let s=30+R()*40,side=R()<.5?-1:1;
 while(s<c.len-20){const q=frAt(c,s/c.len),w=w0+(w1-w0)*q.u;side=-side;let a=q.a+side*(.6+.3*R());if(Math.sin(a)>.2)a=frTurn(a,-Math.PI/2,.45);
  const e=w*.42,n=q.a+side*Math.PI/2;
  out.push({x:q.x+Math.cos(n)*e,y:q.y+Math.sin(n)*e,a,len:(50+26*R())*(.85+.3*Math.min(1,w/24)),w:Math.max(4.5,Math.min(13,w*.52)),d:d0+s+e,t:T+q.u*dur+.05,s0:w*.1+15});
  s+=82+w*2+R()*60;}
 const e=c.nodes[c.nodes.length-1];out.push({x:e.x,y:e.y,a:e.a,len:58+22*R(),w:Math.max(4.4,w1*.92),d:d0+c.len,t:T+dur,s0:4,par:id});}
let FR_CORAL_ID=0;
function frCoralLimb(S,G,L0,T,d0,seeds,lv,inset=0){const k=S.k,id=10+FR_CORAL_ID++,L={...L0,w:[L0.w[0]*1.22,L0.w[1]*1.3]};
 // a limb that leaves another one starts at the edge of its mother, not at her middle (its first point moved along its way)
 let P=L.P;if(inset>0){const dx=P[2]-P[0],dy=P[3]-P[1],l=Math.hypot(dx,dy)||1,m=Math.min(inset,l*.6);P=[P[0]+dx/l*m,P[1]+dy/l*m,...P.slice(2)];}
 const c=frSpline(P,6),dur=[.85,.5,.35][lv]*k;
 frGrow(S,c.pts,T,dur,{w0:L.w[0],w1:L.w[1],c0:[.04,.2,.32][lv],c1:[.42,.52,.56][lv],lum:.85,d0,hot:.8,sway:.12,seed:L.P[0]*.01});
 G.mark(c.pts,u=>(L.w[0]+(L.w[1]-L.w[0])*u)*.5+12,id);frCoralSeeds(c,L.w[0],L.w[1],T,dur,S.rnd,seeds,d0,id);
 for(const K of L.kids||[]){let b=0,bd=1e9;for(const q of c.nodes){const d=Math.hypot(q.x-K.P[0],q.y-K.P[1]);if(d<bd){bd=d;b=q;}}
  frCoralLimb(S,G,K,T+b.u*dur,d0+b.s,seeds,Math.min(2,lv+1),(L.w[0]+(L.w[1]-L.w[0])*b.u)*.5-K.w[0]*.5);}}
export const FR_CORALL={id:'corall',name:'Corall',what:'les branques del corall, de les més gruixudes a les puntes',
 pal:['#ff2a9a','#ff4058','#ff8a3a','#ffb860','#ffe8c0'],pal2:['#e83aff','#ff4a8a','#ff7a4a','#ffc070','#fff0d0'],
 look:{bloom:.16,glow:1.6,halo:.06,core:0,rim:.8,spread:.32,minW:1.45},wind:.004,
 acts:[(S,t0)=>{const k=S.k,G=frRoom(9),seeds=[];
  FR_CORAL_LIMBS.forEach((L,i)=>frCoralLimb(S,G,L,t0+i*.06*k,0,seeds,0));
  const C=[[.44,.56],[.56,.68],[.68,.8],[.8,.92],[.92,1],[1,1],[1,1]];
  frTree(S,G,seeds,{ratio:.75,sp:.52,wr:.7,minLen:9,depth:6,up:lv=>[.7,.3,.15,.08,0,0,0][lv],lyre:.7,bend:.3,tipFork:.55,tries:[0,.14,-.14,.28,-.28],pad:lv=>[16,11,7,5,4,3.5,3][lv],C:lv=>C[lv],t0,T:lv=>1.1+lv*.3,dur:lv=>.38,hot:.6,sway:.35,lum:lv=>1.1+lv*.05});
  frEvent(S,'tronc',.4,t0);frEvent(S,'tronc',.7,t0+.1*k);frEvent(S,'branca',.9,t0+.6*k);
  for(let i=0;i<5;i++)frEvent(S,'fulla',.3+i*.3,t0+(1.2+i*.5)*k);}]};
