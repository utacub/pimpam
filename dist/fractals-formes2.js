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

// ── 8 · Romanesco ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// The romanesco is a head of flower buds that never opened: every bud became a cone made of smaller cones, set on spirals, and so on
// for four or five orders (Kieffer, Fraser & Gaucher, 1998, on the cauliflower; Azpeitia et al., 2021, found how a meristem that keeps
// failing to flower makes it). The cones of each order stand on spirals at the golden angle, as the florets of a sunflower, but each
// one is as big as its distance from the centre: so the head looks the same at every size (a logarithmic, self-similar packing).
// Growth: the great cones from the centre outwards, the outline and its rings; then the cones on the cones; then the cones on those.
// Concept 08: seen from above, a spiral of pointed cones in lime and chartreuse light, each one drawn as an outline with rings that
// close in towards its point (a cone seen in perspective), and smaller cones of the same kind round the edges of each.
// a cone: the circle of its base (cx, cy, r), its axis a (towards its point), its half angle al
function frConeOf(cx,cy,r,a,al){const sa=Math.sin(al),d0=r/sa,ux=Math.cos(a),uy=Math.sin(a);return {cx,cy,r,a,al,d0,ux,uy,tx:cx+ux*d0,ty:cy+uy*d0,ta:Math.tan(al)};}
// is (x, y) inside the cone (with a margin m)?
function frConeIn(c,x,y,m=0){const dx=x-c.cx,dy=y-c.cy;if(dx*dx+dy*dy<(c.r-m)*(c.r-m))return true;
 const vx=x-c.tx,vy=y-c.ty,al=-(vx*c.ux+vy*c.uy);if(al<=0||al>c.d0)return false;return Math.abs(vx*c.uy-vy*c.ux)<al*c.ta-m;}
// a polyline drawn where nothing in front of it hides it: its points keep the moments of the whole line, so it grows as one
function frDrawSeen(S,pts,t0,dur,o,hid){const n=pts.length/2,L=[0];for(let i=1;i<n;i++)L.push(L[i-1]+Math.hypot(pts[i*2]-pts[i*2-2],pts[i*2+1]-pts[i*2-1]));const tot=L[n-1]||1;
 let run=[],ts=[],ds=0;const flush=()=>{if(run.length>=4)frPathT(S,run,ts,{...o,d0:(o.d0||0)+ds});run=[];ts=[];};
 for(let i=0;i<n;i++){const x=pts[i*2],y=pts[i*2+1];if(hid(x,y)||frOut(x,y,0)){flush();continue;}if(!run.length)ds=L[i];run.push(x,y);ts.push(t0+dur*L[i]/tot);}flush();}
// the points of an arc of the circle (cx, cy, r) from the angle a0 to a1
const frArc=(cx,cy,r,a0,a1)=>{const n=Math.max(3,Math.ceil(Math.abs(a1-a0)*r/5)),p=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;p.push(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}return p;};
// one cone drawn: the two halves of its outline from its point round to the far side of its base, then its rings from the base in
function frConeDraw(S,c,T,dur,o,hid){const k=S.k,ph=Math.PI/2-c.al,half=Math.PI/2+c.al;
 for(const sd of [1,-1]){const p=[c.tx,c.ty];const g=c.a+sd*ph,q=frArc(c.cx,c.cy,c.r,g,g+sd*half);p.push(...q);
  frDrawSeen(S,p,T,dur,{w0:o.w*.8,w1:o.w,c0:o.c,c1:o.c-.06,lum:o.lum,d0:o.d,hot:o.hot,sway:0},hid);}
 const q=o.q||.74;let i=1;for(let d=c.d0*q;;d*=q,i++){const r=d*Math.sin(c.al);if(r<o.rMin)break;const cx=c.tx-c.ux*d,cy=c.ty-c.uy*d,T2=T+dur*.35+i*.07*k;
  for(const sd of [1,-1]){const g=c.a+Math.PI,p=frArc(cx,cy,r,g,g-sd*half);frDrawSeen(S,p,T2,dur*.55,{w0:o.w*.85,w1:o.w*.6,c0:o.c+.06,c1:o.c,lum:o.lum*.95,d0:o.d+c.d0-d,hot:0,sway:0},hid);}}}
export const FR_ROMANESCO={id:'romanesco',name:'Romanesco',what:'els cons en espiral, i els cons dels cons',
 pal:['#1a5a00','#3cb80a','#7ed40e','#c8f51e','#f0ff78'],pal2:['#0a5a30','#22b85a','#5ed43a','#b0f540','#e8ffa0'],
 look:{bloom:.24,glow:2,halo:.14,core:.22,spread:.5},wind:0,
 acts:[(S,t0)=>{const k=S.k,R=S.rnd,CX=822,CY=432,AL=.56,B=.05,G=Math.PI*(3-Math.sqrt(5));
  // the great cones: on a spiral at the golden angle, each as big as its distance from the centre; those nearer the centre are on top
  const big=[];for(let n=0;n<200;n++){const r=26*Math.exp(B*n),th=n*G,x=CX+Math.cos(th)*r,y=CY+Math.sin(th)*r,L=.66*r+6;
   if(x<-L*1.2||x>1672+L*1.2||y<-L*1.2||y>941+L*1.2){if(r>1300)break;continue;}
   const a=th+.5,rb=L/(1/Math.sin(AL)+1);big.push({n,c:frConeOf(x-Math.cos(a)*L*.15,y-Math.sin(a)*L*.15,rb,a,AL),r,L});}
  // the centre: the youngest buds, too small to tell apart, a whirl of spiral lines
  for(let j=0;j<8;j++){const p=[];for(let i=0;i<=40;i++){const u=i/40,r=3+u*44,th=j*Math.PI/4+Math.log(r/3)*1.6;p.push(CX+Math.cos(th)*r,CY+Math.sin(th)*r);}
   frGrow(S,p,t0,.45*k,{w0:1.2,w1:2.6,c0:.95,c1:.8,lum:.8,d0:0,hot:.4});}
  // all the cones first (each with its place in depth: the nearer the centre, the nearer the eye; a cone on a cone is in front of
  // its mother), then each one drawn where none in front of it hides it
  const all=[],NB=big.length?big[big.length-1].n:1,T1=n=>t0+(.05+1.1*n/NB)*k;
  for(const b of big){const w=Math.max(1.8,Math.min(6.5,b.L*.03));all.push({c:b.c,key:b.n,T:T1(b.n),dur:.5*k,o:{w,c:.74,lum:.82,d:b.r*.3,hot:.5,rMin:Math.max(1.8,b.L*.035),q:.68}});
   if(b.L<50)continue;const c=b.c,m=Math.max(2,Math.min(4,Math.round(b.L/70)));
   // the cones on this cone: round the far side of its base and up its flanks, leaning the way the spiral turns
   for(let j=0;j<m;j++){const f=(j+.5+(R()-.5)*.4)/m,g=c.a+Math.PI/2-c.al+f*(Math.PI+2*c.al)*.96,px=c.cx+Math.cos(g)*c.r*.86,py=c.cy+Math.sin(g)*c.r*.86,L2=b.L*(.3+.08*Math.sin(f*Math.PI))*(.9+.2*R());
    const rb=L2/(1/Math.sin(AL)+1),c2=frConeOf(px,py,rb,g+.85,AL),T2=t0+(1.35+.25*f+.25*b.n/NB)*k;
    all.push({c:c2,key:b.n-.5+j*.01,T:T2,dur:.4*k,o:{w:Math.max(1.3,w*.6),c:.54,lum:.8,d:b.r*.3+b.L,hot:.4,rMin:1.8,q:.66}});
    // and the cones on those
    if(L2<48)continue;const m3=Math.max(2,Math.min(3,Math.round(L2/24)));
    for(let h=0;h<m3;h++){const f3=(h+.5)/m3,g3=c2.a+Math.PI/2-c2.al+f3*(Math.PI+2*c2.al)*.9,L3=L2*.26*(.9+.2*R()),rb3=L3/(1/Math.sin(AL)+1);
     all.push({c:frConeOf(c2.cx+Math.cos(g3)*c2.r*.9,c2.cy+Math.sin(g3)*c2.r*.9,rb3,g3+.95,AL),key:b.n-.75+j*.01+h*.001,T:T2+(.75+.2*f3)*k,dur:.32*k,o:{w:1.1,c:.42,lum:.85,d:b.r*.3+b.L+L2,hot:.3,rMin:1.6,q:.64}});}}}
  const CS=60,grid=new Map(),key=(i,j)=>i*1000+j;
  for(const e of all){const c=e.c,x=c.r+c.d0;for(let i=Math.floor((c.cx-x)/CS);i<=Math.floor((c.cx+x)/CS);i++)for(let j=Math.floor((c.cy-x)/CS);j<=Math.floor((c.cy+x)/CS);j++){const kk=key(i,j);let l=grid.get(kk);if(!l)grid.set(kk,l=[]);l.push(e);}}
  for(const e of all){const K=e.key,hid=(x,y)=>{const l=grid.get(key(Math.floor(x/CS),Math.floor(y/CS)));if(!l)return false;for(const f of l)if(f.key<K&&frConeIn(f.c,x,y,1.5))return true;return false;};
   frConeDraw(S,e.c,e.T,e.dur,e.o,hid);}
  frEvent(S,'tronc',CX/941,t0);frEvent(S,'branca',.6,t0+.6*k);frEvent(S,'branca',1.2,t0+1.1*k);frEvent(S,'fulla',.5,t0+1.5*k);frEvent(S,'fulla',1.4,t0+2.2*k);frEvent(S,'fulla',.9,t0+2.8*k);}]};

// ── 9 · Neurones ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// A neuron gathers its signals with a tree of dendrites: each one forks again and again, thinner at every fork, until the whole tree
// fills the space round the cell. Its branches keep away from each other (self-avoidance) and keep their wiring short, and those two
// rules alone grow dendrites that cannot be told from real ones (Cuntz, Forstner, Borst & Häusser, 2010); their fractal dimension is
// between 1.3 and 1.7 (Caserta et al., 1995). Growth: the cell bodies; the thick first dendrites; then each order of forks, all the
// neurons at once, down to the finest tips. Concept 09: a pyramidal neuron at the bottom with its long apical dendrite rising to a
// crown of branches, three star-shaped neurons round it; magenta at the cell, violet, blue, cyan at the tips.
const FR_NEURONS=[
 // x, y, radius of the body, first dendrites [angle°, length, width]
 {x:806,y:795,r:22,den:[[178,190,9],[3,190,9],[150,110,7],[30,110,7],[118,80,6],[62,80,6],[-150,90,6],[-32,90,6]],apical:true},
 {x:268,y:553,r:20,den:[[-100,120,8],[-55,120,7],[-148,115,7],[-10,130,8],[35,110,7],[85,120,7],[130,115,7],[178,110,7]]},
 {x:1345,y:417,r:20,den:[[-75,130,8],[-125,120,7],[-170,120,7],[-20,120,7],[20,120,7],[65,120,7],[115,115,7],[160,110,7]]},
 {x:205,y:153,r:14,den:[[-90,75,5],[-30,80,5],[30,75,5],[90,70,5],[150,75,5],[-150,75,5]]}];
const FR_APICAL=[806,773,812,700,808,620,813,540,808,460,812,380,816,300];
export const FR_NEURONES={id:'neurones',name:'Neurones',what:'les dendrites de les neurones, de la cèl·lula a les puntes',
 pal:['#ff2ad6','#c03cff','#7a5cff','#3a86ff','#38dcff'],pal2:['#ff3a9a','#e040ff','#9a5cff','#4a6aff','#58b4ff'],
 look:{bloom:.26,glow:2.1,halo:.14,core:.3,spread:.5,minW:1.1},wind:0,
 acts:[(S,t0)=>{const k=S.k,R=S.rnd,G=frRoom(9),seeds=[],D=Math.PI/180;
  FR_NEURONS.forEach((N,i)=>{
   // the cell body: a ring of light
   frLoop(S,N.x,N.y,N.r,N.r,0,t0,.35*k,{w0:5,c0:0,lum:1,d0:0,hot:.4},28,-Math.PI/2);G.mark(frArc(N.x,N.y,N.r,0,FR_TAU),12,20+i);
   for(const [a,l,w] of N.den){const A=a*D;seeds.push({x:N.x+Math.cos(A)*N.r,y:N.y+Math.sin(A)*N.r,a:A,len:l*.8*(.92+.16*R()),w:w*.95,d:N.r,t:t0+.3*k,s0:16,par:20+i});}});
  // the apical dendrite of the pyramidal neuron: a long shaft straight up, with oblique branches, ending in a crown
  const ap=frSpline(FR_APICAL,6);frGrow(S,ap.pts,t0+.3*k,.75*k,{w0:8,w1:5.5,c0:.04,c1:.16,lum:1,d0:22,hot:.8});G.mark(ap.pts,14,30);
  for(const [u,a,l] of [[.12,-150,95],[.15,-28,95],[.33,-35,80],[.52,-148,85],[.55,-32,80],[.74,-145,80],[.8,-38,75]]){const q=frAt(ap,u);
   seeds.push({x:q.x,y:q.y,a:a*D,len:l*.85,w:4.2,d:22+q.s,t:t0+(.35+.6*u)*k,s0:8,par:30,pri:1});}
  for(const a of [-150,-118,-90,-62,-30])seeds.push({x:816,y:300,a:a*D,len:a===-90?150:160,w:6,d:22+ap.len,t:t0+1.05*k,s0:30,par:30,pri:2});
  // the colour by the thickness: magenta in the thick stems near the cell, violet, blue, cyan in the finest tips
  frTree(S,G,seeds,{mono:{rm:.72,am:.3,wm:.8,rs:.58,as:.62,ws:.64},ratio:.7,wr:.72,minLen:5.5,depth:8,up:0,lyre:0,bend:.5,tipFork:.6,
   tries:[0,.18,-.18,.36,-.36,.55,-.55],pad:lv=>Math.max(2.5,10-lv*1.2),Cw:w=>Math.min(.86,Math.max(.02,.02+.9*Math.pow(1-Math.min(1,w/8.5),1.5))),
   t0,T:lv=>.35+lv*.34,dur:lv=>.4,hot:.6,sway:0,lum:lv=>1+lv*.02});
  frEvent(S,'tronc',806/941,t0);frEvent(S,'tronc',268/941,t0+.05*k);frEvent(S,'tronc',1345/941,t0+.1*k);frEvent(S,'tronc',205/941,t0+.15*k);
  for(let i=0;i<6;i++)frEvent(S,i<2?'branca':'fulla',.2+((i*.37)%1)*1.4,t0+(.8+i*.45)*k);}]};

// ── 10 · Illa i costa ─────────────────────────────────────────────────────────────────────────────────────────────────────
// A coastline has no true length: measured with a shorter ruler, it is longer, because every bay has smaller bays and every cape smaller
// capes, down to the rocks (Richardson, 1961; Mandelbrot, 1967: the west coast of Britain has a fractal dimension of about 1.25). A
// relief made of the same roughness at every scale (fractional Brownian surfaces: Mandelbrot, 1982; Voss, 1985) gives coasts and
// contour lines of that kind. Here: mountains (smooth hills), roughened by the noise of several octaves, and twisted by eddies of three
// sizes (the waves and currents that carve the hooked capes), more and finer the nearer the sea. Growth: the contour lines from the
// summits down: each one lower, each one with a finer scale of detail, until the coast, with its bays within bays and its islets.
// Concept 10: a big island seen as a topographic map, contour lines in light: a thick blue coast with curling capes, cyan, green,
// yellow inland and pink at the summits; small islands in the corners.
// The island of the concept: its coasts (closed polygons, traced from the picture: for each, the number of points, then x, y in half
// units, Int16, base64), and its summits [x, y, height, spread]. The relief rises from the coast with the distance inland (as land
// does, more or less), saturating, and the summits stand on it.
const FR_ISLE_POLY='UwOoBBAA0AQOAOwEGgAcBR8AMAUrAD0FPABCBVQAOgVoACwFdQAYBXYADAVaAOgEWgDUBHEAvAR5ALIEiAC0BJgAxASkANAEowDkBJIA9ASUAAAFnQAKBbwABAXYAAwF5wAUBewALAXwAEQF6QBSBdgAUAXEAFYFtABwBZwAjAWTAKgFoAC/BYwAxAWCANgFdwDwBXAAAAZwABgGegAkBoYAKQaUACoGoAAjBqwAGAayAAQGtAAABrwAAAbEAAQGyAAcBsQARAbIAFwG1wBlBuQAaQYAAVwGGwFIBh4BPAYHATgGAwEsBgIBFAYWAQAGGwH0BSUB6AUqAdAFLAHABSQBsAUnAYwFTQF7BVgBcgVsAXIFgAF4BYwBgAWWAagFpQHABaYBzAWiAewFhwH0BYQBCAaDARgGhwEsBpIBRAaSAWAGhQF8BnABjQZUAZIGPAGkBiUBwAYZAeQG/wDwBvoAAAf4ABgHAgEwBwIBSAf1AFQH6ABwB9kAfwfMAIAHwAB4B7QAdgekAHsHlACMB30ArAdoAOQHWgAMCC8ALAgcAFgIFgB4CB4AmAgeALQIFADUCBIA5AgWAAAJJwAJCTwAFAlEACQJQgA8CSsAWAkiAHAJJACUCTMAsQlMALwJaADNCXwAAAqRACAKuwBACssAUQrgAFYK9ABRCggBSAoWATgKHgEsChoBJwoUASIK/AAECvAA+AnzAOgJBQHYCQoBzAkJAbgJ9QCwCfAAqAnwAIcJFAF0CRwBZAkYAVAJ+AA8Cf4AMgkMAS4JNAE3CUgBQQlUAVgJWwFpCWwBbAmEAWMJmAFiCagBcAm+AYwJxgGcCcEBogmgAa0JlAHACY0B1Ql4AegJbgEECmoBKAp3ATgKiAE8CpgBOgqkATQKrAEsCrABFAqxAQ8KvAEMCtQBEwrgASAK6gFMCuIBXArkAWwK7AF8CuwBjArlAawKwAGrCrQBnAqpAZYKoAGaCowBsAp5AcwKcgHwCngBHAuaAUQLmgFUC6QBbAu+AYQLyAGSC9gBmgvoAaILEAKdCzQClAtHAoQLVAJ0C1gCZAtMAmQLNAJcCyoCVAsrAkgLNQI8CzoCMAs6AiQLMwIYCyACBAscAv8KIALzCjwC6ApFAtwKSgK8CkYCsApMApUKYAKDCnQCgAqQAoQKpAJ+CrQCcArEAnIK4AJ7CuwClAr+AqwKAwPACg8DzAolA+wKOgMQCzwDMAsrA0ALJgNUCygDbAsyA4ALMAOlCxQDrAsEA6wL8AKMC9YChAvLAmwLywJcC90CTAveAj4LzAI+C7wCRAusAlwLlwJ8C4oCpAuOArQLlgLEC5UC2AuLAvgLiwIEDI8CFAycAiQMsQIsDLICSAyoAmQMrAKADMcCrAzUAs0M7ALlDBQD6QwsA+QMVAPoDGQD/gyMAwANoAP5DMAD5QzwA8gMGASsDCoEnAwuBJAMLASADCMEegwYBH0MCAScDPQDngzcA5cMzAOMDMQDhAzEA3QMzgNgDNIDUAzIA0QMrAM0DKYDGAyqA/gLwAPyC8wD8gvgA+0L8APkC/sD2AsBBMgLAgS4C/cDsAv2A6MLAASXCxAEkgskBJMLOASbC0gEqAtSBLQLWATEC1cE0ws8BNwLOATwCzoE/QtEBAkMWAQODGgEDQyABP4LqAT/C7AEJQzQBCwM7AQlDAQFFwwcBRAMQAUIDE8F+AteBdQLawXHC3gFswuoBWQL4AVAC+wFKAvsBRQL5gUAC+gF8wr0BewKCAbkCg8G3AoQBs0KCAbECvgFxAroBcgK2AXVCsQFFAugBSQLoAU0C7AFRAuvBVULoAVdC5AFXguABVgLeAVEC3AFPwtoBTwLWAVGCzgFNAskBSgLIwUUCzYFCAs8BegKNgXfCjwF2QpIBdAKUAW4ClEFqwpIBaQKOAWnChAFlAoEBXAKBAVMChgFRgogBUQKMAU1CkgFEwpcBQoKaAULCnQFHQqEBSQKlAUgCqQFDAq7BfAJxgXYCcgFtAm7BZAJtQV4CaQFYQl4BVAJaQUsCVwFDAlcBfAITwXoCEQF4ggwBeMIJAXwCBAF7ggABcAI9ASyCOgErgjcBK8I0AS4CMIE0AjABNkIuATgCKwE3QigBNAIlgScCJYEiAilBHYIrARmCMQEZwjcBHYI6AR8CPwEdggIBWgIFQVYCBwFNAgaBSgIDgUgCPwEFAj4BAgIAAX4BxwF+wc4BQkIUAUwCF4FOQhoBUkIjAVUCJcFgAimBZUIuAWmCOAFpQj0BZgIGAaICCkGcAguBmYIKAZfCBAGWAgKBlAIDAZUCDAGSghMBkYIaAY7CHwGLAiKBhgIlAb8B5sG5wesBtsHwAbYB+QGwwcAB6wHDgeEBxkHbAcrB2AHOQdEB0UHKAdIB/QGOAfQBjwHvAY6B6AGLAeTBhwHkAYQB5AGBAeVBvgGrgboBrAG0Aa4BrwGzAarBuAGqAbsBq8G8Aa4BvAGyAb8BtYGEAfWBi0HwAYwB7QGKgekBioHjAYzB3wGQAd2Bk0HaAZUB1QGUgdABkgHJAY0BwsGAAf4BeAG+wXABhAGtQYsBqQGPQaMBkYGgAZTBnAGWgZYBlcGTwZQBkQGOQY4BjgGIwZIBiAGVAYmBmQGIwZ4BgwGiAbsBYoG2AWEBr8FcAa2BWQGrAVABp4FLAaYBRwGmwUIBqIF+AW/BeQFvQXIBawFvAWcBboFkAWzBYQFswV4BbwFcwXQBWQF3AVcBdwFRAXSBTIFwAUsBbAFKgWUBTcFdAVMBWAFWAVbBYAFWQWkBT4FuAUkBb4FCAW+BfQEtQXcBKwF0ASMBbgEWAW3BDAFzgQbBewEEQUYBQgFJwXwBDoF5AQ+BdAEPgW8BDgFrAQ6BZQEVQV4BGgFYARhBVUERAVIBDoFOAQ7BSAEQwUHBFQF9gNwBfcDgAX9A5AFFASXBRoEnAUiBKwFIgS4BR0ExAUUBM0F+APTBeMD5AXeA/QF3gMMBuMDIAbwAywGBAQwBhgEPgYoBEAGOAQzBkAEIQZQBBoGWAQcBmoEKAZ0BEAGiARLBpQEXAaSBHAGgASJBmQElQY4BJsGCAS8BtQDyAacA7wGkAO1BmwDjwY4A3kGCwNIBuwCOwbMAjoGuAI+BpACVAZ0AloGRAJYBiQCTgYIAkwG6AFQBtABXQasAWgGjAFqBnQBZgZgAV4GUwFUBkQBQQYoATAGGAEcBhABCAYQAfAFGAHQBSgBuwU4AbgFTAG+BVgBrAVYAaAFUgGMBUABcAUwAW4FIAF1BRQBdgULAXAFBgFkBQsBTAUTAUAFJAEyBTQBLgVcATAFdAEmBYABJgWYATQFoAFIBaABWAWkAWEFsAFqBcgBaQXXAWAF3gFUBdgBLAXfARwF7AERBQACDAUGAgQFCAL0BAAC3AT4AdEE4AHEBMgBwgS4AcoEtgHUBKcB6AScAe0EkAHuBHsB4AR0AdEEaAHQBFgB1gREAdEEPgHIBDoBrAQ0AaQEJAGeBAwBowT0ALkE0AC/BMgAxASyANwErQAABaAACAWUAAgFfgD8BHIA5ARwANAEdgC8BHAAqARyAIwEgABxBKAAXwStAFAEsAA0BKwAKASsABQErwAMBMYA6APXALwD6ACqAxABoAMoAYsDQAGAA1wBgANsAYcDfAGUA34BsANeAcQDXAHYA2gB6QOIAe4DkAHqA5QB4AOXAcADpAGzA7QBqgPAAaoD1AG7A+ABwAP8AbwDDQKwAx4CkAMdAnwDCgJsAwYCYAMIAlADFgI8AxUCNAMEAh0D8AEUA+gBFAPQASUDvAEmA6ABDgOUAQ4DhAEHA3wB/AJ6AegChQHMAoYBwAKAAbUCeAGwAlgBqAJAAaoCKAHLAgwB0AL4AMYC8QCsAugAowLQAKACwQCoArAAvAKQAMYCgADOAncA2AJqAPACdAAMA3QAIANtADADXAA8A0AAQAMiADADEgAUAxAA/AIWANgCDwDAAhcAmAIoAIYCPQB8Ak0AZAJUAEwCagAwAnwACAKMAPcBtADgAdgA2gH0ANwBEAHUASABywEuAbwBPgGYAUwBhQFsAXMBkAFxAcQBRAH0ATMBEAI2ASQCQgE8AkcBVQJYAWACcAFgAnwBWgKMAUgCmQE8ApYBNQKEATACgAH8AYsB9AGYAe4BsAHcAcgB3gHUAewB5QH8AeYBGALSASwC1wEwAtwBOALwATgCAAI0AhQCJgIsAiYCOAI0AkwCRAJVAlACVQJgAkMCaAI+AnQCPgKGAkgCkAJkApgCawKgAm4CvAJuAtECZALWAlgC1gJIAuQCMgLwAi4CCAMuAiADOgIsAzoCOAM0AkwDIwJYAxACVwMEAksD+AFDA+gBRAPEAT4DuAEgA6oBCAOsAQMDsAH3AswB6ALUAdwC1AHFAswBswK4AacCoAGmAngBvAJMAbwCQAGyAiQBtgIQAcIC+ADfAuAABAOrABQDnwBEA4cAXAOEAHwDlACEA5QAnAOJAMEDZADUA1cA7ANKABQEPQAkBC8AQAQfAFgEGACEBBoAqAQQACQAjAwUAKgMFwC/DCAAzQwwANwMVADrDGQA8Ax0AO4MkADjDKQA1wywAKkMyACDDAABWAwVATwMGgEoDBgBGAwSAfgLFAHgCx4BygswAbwLNgGsCzoBkAs6AXQLLQFjCxwBWwsMAVgL7ABhC9QAcAvDAKQLswC5C6AAxwtkAN0LRAAIDC4AUAwuAGwMHgCMDBQAJADsADwABAE8ABwBRAAyAVgAQQF8AGABhAB8AZkAmQGoAKABwACeAdAAlQHgAIwB6AB4AfEAaAH0AFQB8ABAAfMAFAEZAeAAJwHMADYBtABRAZwAXQF8AF0BRABCATwAOwEvACgBKwAcASoABAEwAPQASgDQAE4ArABbAJAAcAB8AKgAagDMAEsA4AA/AOwAPAAOALQBPACcAUMAhAFQAH4BWAB4AWwAewF0AIgBgAC0AYYAyAGBANYBeADgAWAA3gFQANABQQC0ATwADADwAYgA/AGIAAgCjQAQApgAEAKkAAgCsgDgAbwA1AG3AM8BsADQAaAA2AGUAPABiAAPALQMBAHMDAcB3QwYAd4MLAHVDDwBxAxJAbAMSgGUDFIBgAxNAXsMSAF3DDgBgAwlAZQMGwGoDAgBtAwEAQoATAxQAWAMUAFuDFgBbgxwAWQMfAE0DIABKgx4ASgMcAEsDGUBTAxQATwAfAzkBZQM6AXEDAUGzQwQBtEMHAbPDDQGvAxJBqwMTgacDE4GlAxKBngMMgZkDDMGXAw4BmAMQAZoDEMGewxUBoAMYAaCDIQGigycBoUMuAZ4DM4GaAzdBjgM8gYnDAQHHQwUB/wLMAfgCzoHzAs8B6wLOQecCzQHfwsgB24LBAdkC/sGPAvxBhwL2AYMC9gG+ArtBuQK7QbWCtgG1grABtsKtAboCqQGAAuSBhQLjwZIC5QGcAt+BoQLfwakC4oGtAt8BsQLVQbYC0cG8AtABhAMSgYgDEoGUAw7BlQMNAZCDBgGRgwIBlgM9gV8DOQFEABUACQGaAAiBnAAJQZ7ADAGfgA8BnQATgZoAFUGUABcBjwAbAYsAGwGIABnBhoAVAYgAEgGPAA1BkAALwZUACQGHwCUAGAGsABeBsgAZwbZAHgG4wCYBvQAqQYEAbIGIAGyBjABtgY8AbwGSwHMBlEB4AZNAfQGQQEIBygBHQcIASoH7AAqB9QAJQfAABsHpAASB3AAFQdUAAkHRwD8Bj4A6AY+AMgGOAC0Bj8AkAZQAH8GYAB3BnAAdAaUAGAGDwCoCuQGxArnBs0K9AbOCggHvAocB7QKIAeYCiAHiAokB3gKIQdwChgHcAoMB3UKAAeICvgGmArqBqgK5AYMAIwB8AacAfMGrgEIB6kBHAecASsHjAExB3gBNAdoASwHYAEgB2MBDAdvAfwGjAHwBg==';
const FR_ISLE_PEAKS=[[975,330,.37,110],[500,172,.24,45],[430,580,.3,70],[1340,540,.25,50],[862,650,.18,40],[90,100,.2,24],[1570,78,.2,26],[80,870,.18,20],[1530,852,.18,24]];
let FR_ISLE=null;
function frIsleBuild(){const t=atob(FR_ISLE_POLY),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);const a=new Int16Array(u.buffer),polys=[];
 for(let i=0;i<a.length;){const n=a[i++],p=new Float32Array(n*2);for(let j=0;j<n*2;j++)p[j]=a[i++]/2;polys.push(p);}
 // the land, filled on a grid (even–odd, row by row), then the distance of every cell to the coast, inside and out (chamfer 3–4)
 const g=4,ox=-24,oy=-24,nx=Math.ceil(1720/g)+1,ny=Math.ceil(990/g)+1,land=new Uint8Array(nx*ny);
 for(let j=0;j<ny;j++){const y=oy+j*g,xs=[];for(const p of polys){const n=p.length/2;for(let i=0,k=n-1;i<n;k=i++){const y0=p[k*2+1],y1=p[i*2+1];if((y0>y)!==(y1>y))xs.push(p[k*2]+(y-y0)/(y1-y0)*(p[i*2]-p[k*2]));}}
  xs.sort((a,b)=>a-b);for(let q=0;q+1<xs.length;q+=2){const i0=Math.max(0,Math.ceil((xs[q]-ox)/g)),i1=Math.min(nx-1,Math.floor((xs[q+1]-ox)/g));for(let i=i0;i<=i1;i++)land[j*nx+i]=1;}}
 const dist=inside=>{const d=new Float32Array(nx*ny);for(let i=0;i<nx*ny;i++)d[i]=(land[i]===1)===inside?1e9:0;
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const c=j*nx+i;let v=d[c];if(!v)continue;if(i)v=Math.min(v,d[c-1]+3);if(j){v=Math.min(v,d[c-nx]+3);if(i)v=Math.min(v,d[c-nx-1]+4);if(i<nx-1)v=Math.min(v,d[c-nx+1]+4);}d[c]=v;}
  for(let j=ny-1;j>=0;j--)for(let i=nx-1;i>=0;i--){const c=j*nx+i;let v=d[c];if(!v)continue;if(i<nx-1)v=Math.min(v,d[c+1]+3);if(j<ny-1){v=Math.min(v,d[c+nx]+3);if(i<nx-1)v=Math.min(v,d[c+nx+1]+4);if(i)v=Math.min(v,d[c+nx-1]+4);}d[c]=v;}
  for(let i=0;i<nx*ny;i++)d[i]*=g/3;return d;};
 const din=dist(true),dout=dist(false);let T=new Float32Array(nx*ny);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const c=j*nx+i,sd=(land[c]?din[c]:-dout[c])-9,x=ox+i*g,y=oy+j*g;let h=.15+.0029*(sd>0?170*(1-Math.exp(-sd/170)):sd*1.3);
  if(sd>0)for(const [cx,cy,A,sg] of FR_ISLE_PEAKS){const d2=(x-cx)**2+(y-cy)**2;if(d2<12*sg*sg)h+=A*Math.exp(-d2/(2*sg*sg))*Math.min(1,sd/30);}T[c]=h;}
 // softened a little (two passes of a 3 × 3 mean)
 for(let it=0;it<2;it++){const U=new Float32Array(nx*ny);for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){let s=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)s+=T[Math.min(ny-1,Math.max(0,j+b))*nx+Math.min(nx-1,Math.max(0,i+a))];U[j*nx+i]=s/9;}T=U;}
 return {T,nx,ny,g,ox,oy};}
function frIsle(x,y){const I=FR_ISLE||(FR_ISLE=frIsleBuild()),fx=Math.min(I.nx-1.001,Math.max(0,(x-I.ox)/I.g)),fy=Math.min(I.ny-1.001,Math.max(0,(y-I.oy)/I.g)),i=Math.floor(fx),j=Math.floor(fy),u=fx-i,v=fy-j,T=I.T,c=j*I.nx+i;
 return (T[c]*(1-u)+T[c+1]*u)*(1-v)+(T[c+I.nx]*(1-u)+T[c+I.nx+1]*u)*v;}
export const FR_COSTA={id:'costa',name:'Illa i costa',what:'les corbes de nivell de l’illa, del cim a la costa',
 pal:['#1450ff','#14c4ff','#22e05a','#ffe02a','#ffa8d8'],pal2:['#2a3aff','#14a0ff','#2ee0a0','#fff04a','#ffb890'],
 look:{bloom:.3,glow:2.2,halo:.14,core:.15,spread:.5},wind:0,
 acts:[(S,t0)=>{const k=S.k,N=frNoise((S.seed||7)*13+5),C0=.15;
  const base=frIsle;
  const H=4,nx=Math.ceil(1712/H)+1,ny=Math.ceil(981/H)+1,f=new Float32Array(nx*ny);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=-20+i*H,y=-20+j*H;f[j*nx+i]=base(x,y)+.006*N(x/120,y/120,3);}
  // the contour lines: the coast (and a second line just inside it), then every step up to the summits
  const LV=[C0,C0+.03];for(let v=C0+.07;v<.9;v+=.07)LV.push(v);const top=LV.length-1;
  const thin=p=>{const q=[p[0],p[1]];for(let i=2;i<p.length-2;i+=2)if(Math.hypot(p[i]-q[q.length-2],p[i+1]-q[q.length-1])>=5)q.push(p[i],p[i+1]);q.push(p[p.length-2],p[p.length-1]);return q;};
  const sm=p=>{if(p.length<8)return p;const closed=Math.hypot(p[0]-p[p.length-2],p[1]-p[p.length-1])<.5,q=closed?[]:[p[0],p[1]];
   for(let i=0;i<p.length-2;i+=2){const ax=p[i],ay=p[i+1],bx=p[i+2],by=p[i+3];q.push(ax*.75+bx*.25,ay*.75+by*.25,ax*.25+bx*.75,ay*.25+by*.75);}if(closed)q.push(q[0],q[1]);else q.push(p[p.length-2],p[p.length-1]);return q;};
  const HT=.86;LV.forEach((lv,li)=>{const u=Math.min(1,(lv-C0)/(HT-C0)),coast=li===0,T=t0+(.1+(top-li)*.27)*k;
   const col=coast?.1:li===1?.26:.3+.7*Math.pow(u,1.05),w=coast?5.5:li===1?2:2.6+1.2*u;
   for(let ch of frChains(frIso(f,nx,ny,lv,H,-20,-20),1e-3)){ch=thin(sm(ch));const n=ch.length/2;let L=0;for(let i=1;i<n;i++)L+=Math.hypot(ch[i*2]-ch[i*2-2],ch[i*2+1]-ch[i*2-1]);if(L<14)continue;
    // a line grows both ways from its point nearest the top of the screen, and closes on the far side
    let s0=0;for(let i=1;i<n;i++)if(ch[i*2+1]<ch[s0*2+1])s0=i;const dur=Math.min(.75,.3+L/2600)*k,cum=[0];for(let i=1;i<n;i++)cum.push(cum[i-1]+Math.hypot(ch[i*2]-ch[i*2-2],ch[i*2+1]-ch[i*2-1]));
    const closed=Math.hypot(ch[0]-ch[n*2-2],ch[1]-ch[n*2-1])<1;
    const run=(idx)=>{const p=[],ts=[];let acc=0;for(let j=0;j<idx.length;j++){const i=idx[j];if(j)acc+=Math.hypot(ch[i*2]-ch[idx[j-1]*2],ch[i*2+1]-ch[idx[j-1]*2+1]);p.push(ch[i*2],ch[i*2+1]);ts.push(acc);}
     const half=closed?L/2:Math.max(acc,1),tt=ts.map(a=>T+dur*a/half);if(p.length<4)return;
     if(coast){frPathT(S,p,tt,{w0:11,c0:0,lum:.95,d0:(top-li)*40,hot:.7});frPathT(S,p,tt,{w0:3.4,c0:.2,lum:1.1,d0:(top-li)*40,hot:0});}
     else frPathT(S,p,tt,{w0:w,c0:col,lum:1,d0:(top-li)*40,hot:.5});};
    if(closed){const m=Math.floor((n-1)/2),A=[],B=[];for(let j=0;j<=m;j++)A.push((s0+j)%(n-1));for(let j=0;j<=n-1-m;j++)B.push((s0-j+(n-1)*2)%(n-1));run(A);run(B);}
    else{const A=[],B=[];for(let i=s0;i<n;i++)A.push(i);for(let i=s0;i>=0;i--)B.push(i);run(A);run(B);}}
   frEvent(S,coast?'tronc':li>top-3?'fulla':'branca',.3+u*1.2,T);});}]};
