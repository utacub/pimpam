// Fractals a la natura (CE46, 0.73) · stimuli 6–10: riu i afluents, corall, romanesco, neurones, illa i costa. As in fractals-formes1.js:
// each one follows its concept picture (ChatGPT, 2026-11-11), in its units (1672 × 941), and grows order by order.
import {frPath,frPathT,frLoop,frEvent,frCurve,frGrow,frAt,frSpline,frOutline,frOut,frLine,frDendrite,frTurn,frColonize,frScatter,frDrawNet,FR_TAU} from './fractals-formes.js';
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
// branching of Acropora and of gorgonians is self-similar over three or four orders). Growth: the thick stems from the reef floor;
// the great branches; then each order of smaller branches and the fine tips, all at once. Concept 07: thick magenta stems rising from
// the bottom, opening into orange branches that fill the screen, with the finest twigs in cream.
export const FR_CORALL={id:'corall',name:'Corall',what:'les branques del corall, de les més gruixudes a les puntes',
 pal:['#ff2a9a','#ff4a6a','#ff8a3a','#ffb860','#ffe8c0'],pal2:['#e83aff','#ff4a8a','#ff7a4a','#ffc070','#fff0d0'],
 look:{bloom:.42,glow:2.3,halo:.16,core:.15,spread:.6},wind:.004,
 acts:[(S,t0)=>{const k=S.k,R=S.rnd;
  // the reef floor: three stems; the water all round (points of attraction), thinner near the floor so that the stems stand clear
  const pts=frScatter(R,5200,[-20,-10,1700,930],(x,y)=>y<760?1:Math.max(0,(930-y)/170)*.6);
  const net=frColonize([{x:420,y:965,a:-1.5},{x:660,y:965,a:-1.7},{x:990,y:965,a:-1.3}],pts,{D:8,di:95,dk:15,inertia:.5});
  const top=frDrawNet(S,net,t0,{W:34,wMin:1.1,wExp:.8,C:(l,u)=>Math.min(1,.04+.9*l+.06*u),lum:l=>.72+.28*l,step:.55,dur:.75,sway:.3,hot:.6});
  for(let i=0;i<4;i++)frEvent(S,i?'fulla':'tronc',.4+i*.3,t0+i*.6*k);}]};
