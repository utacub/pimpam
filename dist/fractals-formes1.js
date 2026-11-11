// Fractals a la natura (CE46, 0.73) · stimuli 1–5: falgueres, flocs de neu, gira-sol, llamps, arbre. Each one follows the composition,
// the colours and the look of its concept picture (ChatGPT, 2026-11-11: Marc, «esforça't en obtenir un resultat idèntic al del concept
// art»), in the units of that picture (1672 × 941). And each one grows level by level, the whole form first as a trunk, then every
// branch of the first order at once, then every one of the second…, so that the same rule is seen working at each scale («que el
// procés d'aparició de l'estímul en faci evident la seva naturalesa fractal»).
import {frPath,frPathT,frClipOut,frLoop,frEvent,frCurve,frGrow,frAt,frSpline,frJoin,frOutline,frOut,frLine,FR_TAU} from './fractals-formes.js';
import {frRandom} from './fractals-motor.js';

// ── 1 · Falgueres ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// A frond is pinnate three times over (Barnsley, 1988, gave the self-affine picture of it): the rachis carries pinnae, each pinna is
// a small frond carrying pinnules, and each pinnule is a lobed leaflet, its lobes small pinnules again. The young frond is still
// rolled up (the crozier, circinate vernation): a logarithmic spiral. Growth: the rachis; then all the pinnae at once; then all the
// pinnules; then the lobes. Concept 01: five fronds crossing the screen, one ending in a crozier, cyan rachises, green pinnae with
// lime and golden tips.
const FR_FERNS=[
 {P:[-40,980,40,820,130,720,330,520,520,330,730,195,860,130,960,112],coil:{r:80,turns:2.3},L0:330,L1:220,n:10},
 {P:[360,990,470,880,653,784,849,731,1045,728,1241,775,1384,845,1430,875],L0:270,L1:160,n:10},
 {P:[1720,10,1632,91,1437,261,1250,390,1100,450,993,472,880,462,790,432],L0:290,L1:160,n:10},
 {P:[-30,190,60,120,170,60,280,30,350,35],L0:190,L1:110,n:6},
 {P:[1530,990,1580,900,1640,800,1720,680],L0:290,L1:250,n:6},
 {P:[1600,70,1650,190,1690,320,1720,420],L0:150,L1:110,n:5}];
function frPinnule(S,x,y,a,len,side,t0,dur,c,o){if(frOut(x,y,len))return;
 // a pinnule: a small pinna again, its margin cut into alternate lobes (the third scale)
 const ax=frCurve(x,y,a,len,8,()=>side*-.18/len),nl=Math.max(2,Math.min(6,Math.round(len/12)));
 const W=u=>len*.12*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.03)),.8),lob=ph=>u=>W(u)*(.45+.55*Math.pow(Math.abs(Math.sin((u*nl+ph)*Math.PI)),.55));
 if(len<9){frGrow(S,ax.pts,t0,dur,{w0:1.1,w1:.7,c0:c,c1:c+.15,lum:.9,d0:o.d,hot:.5,sway:o.sway,seed:o.seed});return;}
 frGrow(S,len>14?frOutline(ax,lob(0),nl*8,lob(.5)):frOutline(ax,W,6),t0,dur,{w0:1.1,c0:c,c1:c+.15,lum:.95,d0:o.d,hot:.5,sway:o.sway,seed:o.seed});
 frGrow(S,ax.pts,t0,dur*.55,{w0:1,w1:.6,c0:c-.15,lum:.6,d0:o.d,hot:0,sway:o.sway,seed:o.seed});}
function frPinna(S,x,y,a,len,side,tP,tQ,cBase,d0,o){
 // a pinna: falcate, curving towards the tip of its frond
 const p=frCurve(x,y,a,len,16,u=>side*(.25+1.6*u*u)*1.35/len);
 if(!frOut(x,y,len))frGrow(S,p.pts,tP,.75*S.k,{w0:3,w1:1.2,c0:cBase+.05,c1:cBase+.3,lum:1,d0,sway:o.sway,seed:o.seed});
 const m=Math.max(4,Math.round(len/21));
 for(let j=0;j<m;j++)for(const sd of [-1,1]){const v=(j+(sd>0?.5:0)+.6)/(m+.6);if(v>.97)continue;
  const q=frAt(p,v),env=Math.pow(1-v,.75)*(.6+.4*Math.min(1,v*6)),ls=len*.28*env+2;
  frPinnule(S,q.x,q.y,q.a+sd*(1.2-.3*v),ls,sd,tQ+v*.35*S.k,.5*S.k,cBase+.22+.5*v,{d:d0+q.s,sway:o.sway,seed:o.seed});}}
export const FR_FALGUERES={id:'falgueres',name:'Falgueres',what:'les frondes de falguera, pínnula a pínnula',
 pal:['#1ff2e2','#16c87a','#25b81e','#8fd81a','#ffcc14'],pal2:['#1fd4f2','#18c49a','#36c41e','#b4d81a','#ffb814'],
 look:{bloom:.28,glow:1.8,halo:.07,core:.8,spread:.5},wind:.006,
 acts:[(S,t0)=>{const k=S.k;
  FR_FERNS.forEach((f,fi)=>{let c=frSpline(f.P,5),uc=1,R=0,rEnd=0;
   if(f.coil){const e=c.nodes[c.nodes.length-1];R=f.coil.r;rEnd=R*.06;const tw=f.coil.turns*FR_TAU,cx=e.x+Math.cos(e.a+Math.PI/2)*R,cy=e.y+Math.sin(e.a+Math.PI/2)*R,b=Math.log(.06)/tw,pts=[];
    for(let i=0;i<=90;i++){const th=i/90*tw,r=R*Math.exp(b*th),an=e.a-Math.PI/2+th;pts.push(cx+Math.cos(an)*r,cy+Math.sin(an)*r);}
    const sp=frSpline(pts,3);c=frJoin(c,sp);uc=1-sp.len/c.len;}
   const sway={sway:.5,seed:fi*1.7},T0=t0+fi*.08*k,dur=1.25*k,side0=f.side||1,tA=T0+dur*.7+.35*k,tB=T0+dur*.7+1.15*k;
   if(f.coil){const m=Math.round(uc*(c.pts.length/2-1)),a1=c.pts.slice(0,m*2+2),a2=c.pts.slice(m*2),t1=T0+dur*uc;
    frGrow(S,a1,T0,dur*uc,{w0:16,w1:6,c0:0,c1:.85,lum:1,hot:1,...sway});frGrow(S,a2,t1,dur*(1-uc),{w0:6,w1:1.5,c0:.95,c1:.5,lum:1,hot:1,d0:c.len*uc,...sway});}
   else frGrow(S,c.pts,T0,dur,{w0:16,w1:4,c0:0,c1:.6,lum:1,hot:1,...sway});
   frEvent(S,'tronc',(c.nodes[0].x+c.nodes[c.nodes.length-1].x)/2/941,T0);
   // the pinnae along the straight part, shorter towards the tip (and towards the crozier, where the frond is still rolled up)
   const n=f.n;
   for(let i=0;i<n;i++)for(const sd of [-1,1]){const u=(.04+(i+(sd>0?.5:0))/n*.96)*uc;const q=frAt(c,u);
    const env=f.coil?1-.62*Math.pow(Math.max(0,(u-uc+.32)/.32),1.4):(1-.5*Math.pow(u,3)),len=(f.L1+(f.L0-f.L1)*Math.max(0,1-u/uc))*env*(.93+.14*Math.sin(i*2.1+fi));
    frPinna(S,q.x,q.y,q.a+sd*side0*1.25,len,-sd*side0,tA+u*.3*k,tB+u*.3*k,.08+.45*u,q.s,sway);}
   // the crozier: the pinnae still rolled in, as long as the coil is wide there, on both sides of the spiral
   if(f.coil){const Lc=c.len*(1-uc);for(let sc=6;sc<Lc-4;){const u=uc+sc/c.len,r=R-(R-rEnd)*sc/Lc,q=frAt(c,u),j=Math.round(sc);
     const cc=.95-.45*Math.pow(sc/Lc,1.5);
     frPinna(S,q.x,q.y,q.a-2.2,r*.5+4,1,tA+u*.3*k,tB+u*.3*k,cc-.25,q.s,sway);
     if(r>12)frPinna(S,q.x,q.y,q.a+2.3,r*.3+3,-1,tA+u*.3*k,tB+u*.3*k,cc-.25,q.s,sway);
     sc+=Math.max(4,r*.17);}}
   frEvent(S,'branca',(c.nodes[0].x)/941,tA);frEvent(S,'fulla',c.nodes[0].x/941+.3,tB);});}]};

// ── 2 · Flocs de neu ──────────────────────────────────────────────────────────────────────────────────────────────────────
// A snow crystal starts as a small hexagonal plate; when the air is supersaturated its six corners outgrow the faces and become arms,
// the arms sprout side branches at 60°, and these sprout their own (Nakaya, 1954; Libbrecht, 2005). The rings of the plate stay
// inside as growth rings. Every arm is a copy of the others (six-fold symmetry) and every branch repeats the arm at a smaller scale.
// Growth: the plate and its rings; the six arms; all the side branches at once; their branches; the last twigs. Concept 02: a large
// stellar dendrite in the middle, five small ones around and a sectored plate up on the right; white-blue cores, violet tips.
const FR_SNOW=[{x:836,y:470,R:465,lv:3,rings:[44,74,112,150,188]},{x:195,y:185,R:170,lv:2,rings:[22,34,52,68]},{x:300,y:452,R:90,lv:2,rings:[14,24,36]},
 {x:200,y:725,R:168,lv:2,rings:[22,34,52,68]},{x:1475,y:540,R:170,lv:2,rings:[22,34,52,68]},{x:1340,y:812,R:98,lv:2,rings:[14,24,36]}];
const FR_SNOW_POS=[[.28,.25],[.43,.28],[.58,.24],[.71,.18],[.83,.12],[.93,.06]],FR_SNOW_SUB=[[.25,.3],[.45,.26],[.62,.2],[.78,.14],[.91,.08]],FR_SNOW_TWIG=[[.4,.32],[.68,.22]];
function frSnowBranch(S,x,y,a,len,lv,maxLv,t0,d0,o){const k=S.k,W=o.W,ends=[x+Math.cos(a)*len,y+Math.sin(a)*len],R=o.R;
 const dur=[.95,.7,.55,.45][lv]*k,w0=[W,W*.45,W*.24,W*.13][lv],col=d=>Math.min(1,.14+.42*Math.pow(d/R,1.5)+lv*.07+(lv===maxLv?.22:0));
 frLine(S,x,y,ends[0],ends[1],t0,dur,{w0:Math.max(1,w0),w1:Math.max(.9,w0*(lv?.55:.4)),c0:col(d0),c1:col(d0+len),lum:1-lv*.06,d0,hot:lv<2?1:.6});
 if(lv>=maxLv)return;const pos=(lv===0&&R<200?FR_SNOW_POS.filter((_,i)=>i%3!==2):[FR_SNOW_POS,FR_SNOW_SUB,FR_SNOW_TWIG][lv]),nxt=t0+dur*.92+[.05,.08,.06][lv]*k;
 for(const [u,l] of pos)for(const sd of [-1,1])frSnowBranch(S,x+Math.cos(a)*len*u,y+Math.sin(a)*len*u,a+sd*Math.PI/3,len*l,lv+1,maxLv,nxt+u*.15*k,d0+len*u,o);}
function frHexPts(x,y,r,rot=-Math.PI/2){const p=[];for(let i=0;i<=6;i++){const a=rot+i*Math.PI/3;p.push(x+Math.cos(a)*r,y+Math.sin(a)*r);}return p;}
export const FR_FLOCS={id:'flocs',name:'Flocs de neu',what:'els flocs de neu, braç a braç',
 pal:['#e6f7ff','#5cc4ff','#2a8cff','#4a58ff','#a84cff'],pal2:['#e6fffb','#86f0ff','#37c0ff','#4a7cff','#c84cff'],
 look:{bloom:.5,glow:2.4,halo:.2,core:.9,spread:.6},wind:0,
 acts:[(S,t0)=>{const k=S.k;
  FR_SNOW.forEach((f,fi)=>{const T=t0+fi*.07*k,W=f.R/465*9+2.6;
   // the plate and its growth rings, from the inside out
   f.rings.forEach((r,i)=>{const tr=T+i*.12*k,big=i<3,o={w0:big?W*.45:W*.18+.5,c0:big?.08:.35,c1:big?.08:.35,lum:big?1:.75,d0:r*.2,hot:.4};
    // each side of the hexagon grows from its two corners towards its middle, all six at once
    for(let j=0;j<6;j++){const a0=-Math.PI/2+j*Math.PI/3,a1=a0+Math.PI/3,x0=f.x+Math.cos(a0)*r,y0=f.y+Math.sin(a0)*r,x1=f.x+Math.cos(a1)*r,y1=f.y+Math.sin(a1)*r,mx=(x0+x1)/2,my=(y0+y1)/2;
     frLine(S,x0,y0,mx,my,tr,.4*k,o,30);frLine(S,x1,y1,mx,my,tr,.4*k,o,30);}});
   const tA=T+.35*k;for(let i=0;i<6;i++)frSnowBranch(S,f.x,f.y,-Math.PI/2+i*Math.PI/3,f.R,0,f.lv,tA,0,{W,R:f.R});
   frEvent(S,'tronc',f.x/941,tA);});
  // the sectored plate: six broad sectors grown out of the hexagon, each with ridges parallel to its edge
  const P={x:1450,y:172,R:150},T=t0+.2*k;frPath(S,frHexPts(P.x,P.y,28),T,28*6/(.4*k),{w0:3.2,c0:.1,lum:1,hot:.5});
  for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3;frPath(S,[P.x+Math.cos(a)*28,P.y+Math.sin(a)*28,P.x+Math.cos(a)*P.R*.45,P.y+Math.sin(a)*P.R*.45],T+.35*k,P.R*.45/(.5*k),{w0:3.4,w1:2.2,c0:.05,c1:.2,lum:1,d0:28});
   const b=a+Math.PI/6,h=Math.PI/6*.7;
   for(let j=0;j<6;j++){const f=(j+1)/6,r1=36+(P.R-36)*f,sp=.5+.5*f,isOut=j===5,pts=[];
    // a sector: its two sides and its outer edge (the outermost), or a ridge parallel to that edge (inside)
    const c0=Math.cos(b-h*sp),s0=Math.sin(b-h*sp),c1=Math.cos(b+h*sp),s1=Math.sin(b+h*sp),rr=r1/Math.cos(h*sp)*.98;
    if(isOut)pts.push(P.x+Math.cos(b-h*.42)*36,P.y+Math.sin(b-h*.42)*36);
    pts.push(P.x+c0*rr,P.y+s0*rr,P.x+Math.cos(b)*r1*1.04,P.y+Math.sin(b)*r1*1.04,P.x+c1*rr,P.y+s1*rr);
    if(isOut)pts.push(P.x+Math.cos(b+h*.42)*36,P.y+Math.sin(b+h*.42)*36);
    frPath(S,pts,T+.9*k+f*.9*k,rr*2.4/(.5*k),{w0:isOut?3.6:1.4,c0:isOut?1:.55,c1:isOut?1:.55,lum:isOut?1:.8,d0:r1,hot:.5});}}
  frEvent(S,'branca',P.x/941,T+.9*k);}]};

// ── 3 · Gira-sol ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// The florets of a sunflower head are laid one after the other at the golden angle, 137.5°, the n-th at a distance √n from the
// middle (Vogel, 1979): the eye then sees spirals of consecutive Fibonacci numbers, here 34 one way and 55 the other, and the same
// pattern at every size, so a small head is a copy of the large one (Douady & Couder, 1992). Growth: the two families of spirals
// whirl out from the middle together, as the florets are made; then the petals open all round; then the small heads, each the same
// rule again. Concept 03: one great head filling the middle, its petals reaching out of the screen, and two small heads at the
// corners; white and gold in the middle, orange, then crimson and magenta at the rim and the tips of the petals.
function frHead(S,cx,cy,R,N,fams,t0,dur,o){const rot=o.rot||0,r0=R*.012,ts=r=>t0+dur*Math.pow(r/R,.85);
 // the two visible families of parastichies of the head (Vogel's florets lie on their crossings): m arms each, turning `turn` radians
 // from the middle to the rim along logarithmic spirals
 fams.forEach(([m,turn,wk],fi)=>{for(let j=0;j<m;j++){const th0=j/m*FR_TAU+rot,pts=[],tt=[],cc=[],ll=[];
   for(let i=0;i<=64;i++){const r=r0+(R-r0)*Math.pow(i/64,1.15),a=th0+turn*Math.pow(r/R,fi?1:.5);pts.push(cx+Math.cos(a)*r,cy+Math.sin(a)*r);tt.push(ts(r));cc.push(Math.min(.84,.06+.72*Math.pow(r/R,1.8)+(fi?.04:0)));}
   frPathT(S,pts,tt,{cf:i=>cc[i],wf:i=>o.w*wk*(.35+.65*Math.min(1,i/26)),lum:fi?.8:1,hot:.3,sway:0});}});
 // the rim of the head
 frLoop(S,cx,cy,R*1.01,R*1.01,0,t0+dur*.92,.5*S.k,{w0:o.w*2.2,c0:.8,c1:.8,lum:1,d0:R,hot:.6},96);}
function frPetals(S,cx,cy,R,n,len,t0,o){for(const back of [1,0])for(let i=0;i<n;i++){const a=(i+(back?.5:0))/n*FR_TAU+(o.rot||0),L=len*(back?.92:1)*(.92+.16*Math.sin(i*2.7+cx)),bw=R*FR_TAU/n*(back?.6:1);
  if(frOut(cx+Math.cos(a)*(R+L*.4),cy+Math.sin(a)*(R+L*.4),L))continue;
  // a petal starts under the head (its hidden part is not drawn), widest where it comes out, pointed and a little bent at the tip
  const ax=frCurve(cx+Math.cos(a)*R*.8,cy+Math.sin(a)*R*.8,a,L+R*.2,18,u=>.7*u*u/L);
  const shape=u=>bw*.44*Math.pow(Math.sin(Math.PI*Math.min(1,u)),.75)*(1-.25*u);
  const tp=t0+(back?.15:0)*S.k+i/n*.12*S.k,dp=.8*S.k,lum=back?.82:1;
  for(const p of frClipOut(frOutline(ax,shape,22),cx,cy,R*1.012))frGrow(S,p,tp,dp*.5,{w0:o.w*1.5,c0:.3,c1:.95,lum,d0:R,hot:.5});
  for(const p of frClipOut(frOutline(ax,u=>shape(u)*.6,18),cx,cy,R*1.03))frGrow(S,p,tp+.2*S.k,dp*.4,{w0:o.w*.85,c0:.2,c1:.5,lum:lum*.85,d0:R,hot:0});}}
export const FR_GOLD_A=Math.PI*(3-Math.sqrt(5));
export const FR_GIRASOL={id:'girasol',name:'Gira-sol',what:'les espirals del gira-sol i els seus pètals',
 pal:['#fff4c4','#ffcc1a','#ff8c1a','#ff2f62','#e43ce8'],pal2:['#fff4c4','#ffd84a','#ffa21a','#ff4f7a','#c84cff'],
 look:{bloom:.3,glow:2.1,halo:.12,core:.6,spread:.55,exp:.85},wind:.002,
 acts:[(S,t0)=>{const k=S.k;
  frHead(S,822,455,428,0,[[24,3.5,1.25],[55,-1.25,.8]],t0,1.5*k,{w:2.2});frLoop(S,822,455,5,5,0,t0,.3*k,{w0:3,c0:0,lum:1.2},12);frEvent(S,'tronc',822/941,t0);
  frPetals(S,822,455,428,20,330,t0+1.35*k,{w:2.2});frEvent(S,'branca',822/941,t0+1.35*k);
  for(const [x,y,R,i] of [[130,150,104,0],[1535,772,114,1]]){const T=t0+2.1*k+i*.15*k;
   frHead(S,x,y,R,0,[[16,3.4,1.2],[34,-1.2,.8]],T,.9*k,{w:1.3,rot:i*2});frPetals(S,x,y,R,17,R*1.0,T+.75*k,{w:1.3,rot:.1});frEvent(S,'fulla',x/941,T);}}]};

// ── 4 · Llamps ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A lightning channel is a stepped leader: it goes down in short straight steps that change direction at random, and it branches
// where the field is strongest, each branch branching again in the same way (the dielectric breakdown model of Niemeyer, Pietronero
// & Wiesmann, 1984, whose patterns have a fractal dimension near 1.7). Growth: the main channel; its great branches; their branches;
// the last fine twigs, cyan. No flash: the lines glow but the sky stays black (photosensitivity). Concept 04: one great bolt coming
// down the middle and spreading over the whole screen, and two smaller ones at the top corners.
const FR_BOLTS=[
 {P:[780,-15,875,75,800,185,760,250,735,315,782,368,880,412,928,532,840,595,800,700,772,768,805,850,830,955],w:17,lv:0,kids:[
  {P:[748,252,640,278,570,330,522,388,378,455,372,540,300,578,240,612,205,700,130,795,55,890],kids:[{P:[522,388,430,396,330,398,245,448,150,482]},{P:[372,540,300,520,210,560,100,600,30,640]},{P:[240,612,300,660,350,700,330,780,300,860]}]},
  {P:[868,112,905,160,975,185,1000,262,1060,292,1150,300,1162,380,1240,420,1320,452,1405,462],kids:[{P:[1060,292,1130,268,1280,300]},{P:[1162,380,1140,440,1180,500]}]},
  {P:[928,532,1000,512,1062,560,1100,600,1200,592,1272,622,1300,722,1400,752,1450,800,1530,862,1650,905],kids:[{P:[1200,592,1310,562,1425,578]},{P:[1100,600,1112,690,1060,740]},{P:[1300,722,1250,790,1240,860]}]},
  {P:[782,370,770,420,720,470,640,520,560,585,500,650,440,700]},
  {P:[800,700,700,760,640,805,560,850,500,900]},{P:[840,595,900,640,960,700,1000,780,1030,850]}]},
 {P:[140,-15,192,45,176,90,255,150,262,212,232,268,188,302,176,332,120,372,72,410,30,440],w:7,lv:0,kids:[{P:[255,150,300,188,330,215]},{P:[232,268,300,262,350,300]},{P:[188,302,220,350,226,380]}]},
 {P:[1545,-15,1490,50,1450,90,1450,142,1500,175,1510,240,1470,300,1490,350,1550,400,1590,470,1640,500],w:7,lv:0,kids:[{P:[1450,142,1400,175,1340,230]},{P:[1510,240,1560,260,1630,275]},{P:[1470,300,1420,340,1390,380]},{P:[1550,400,1500,440,1480,490]}]}];
// a zigzag channel of a given order from (x, y) going at angle a: its steps change direction at random about a
function frZig(R,x,y,a,len,step){const p=[x,y];let s=0,dir=a;while(s<len){const l=step*(.6+.8*R());dir=a+(R()-.5)*1.3;x+=Math.cos(dir)*l;y+=Math.sin(dir)*l;p.push(x,y);s+=l;}return p;}
const FR_BOLT_W=[15,6,3,1.4],FR_BOLT_C=[[0,.4],[.44,.54],[.52,.8],[.82,1]];
function frBoltPath(S,pts,lv,sc,t0,d0){const k=S.k,dur=[.8,.75,.6,.45][lv]*k,col=sc<1&&lv===0?[0,.7]:FR_BOLT_C[lv],w=FR_BOLT_W[lv]*sc;
 frGrow(S,pts,t0,dur,{w0:w,w1:w*(lv?.6:.55),c0:col[0],c1:col[1],lum:1,d0,hot:lv<2?1:.6});
 // the branches of the next order, procedural, on alternate sides, going down and away (orders 2 and 3), and the forked ends
 const R=S.rnd,n=pts.length/2;
 if(lv>=1&&lv<3){let acc=0,side=R()<.5?-1:1;const every=(lv===1?48:24)*Math.sqrt(sc);
  for(let i=1;i<n;i++){const x0=pts[i*2-2],y0=pts[i*2-1],x1=pts[i*2],y1=pts[i*2+1],l=Math.hypot(x1-x0,y1-y0),a=Math.atan2(y1-y0,x1-x0);acc+=l;
   if(acc>every){acc=0;side=-side;const ba=a+side*(.5+.4*R()),bl=(lv===1?125:36)*sc*(.6+.8*R()),down=ba*.65+Math.PI/2*.35;
    frBoltPath(S,frZig(R,x1,y1,down,bl,(lv===1?18:9)*sc),lv+1,sc,t0+dur*.9+.08*k+i/n*.2*k,d0+i*12);}}}
 if(lv>=2){const x=pts[n*2-2],y=pts[n*2-1],a=Math.atan2(y-pts[n*2-3],x-pts[n*2-4]);
  for(const sd of [-1,1]){const l=(lv===2?14:8)*sc*(.7+.6*R()),b=a+sd*(.35+.3*R());frLine(S,x,y,x+Math.cos(b)*l,y+Math.sin(b)*l,t0+dur,.2*k,{w0:FR_BOLT_W[3]*sc*.9,c0:1,lum:.95,d0:d0+400,hot:.3},40);}}}
function frBolt(S,b,lv,t0,d0,sc){frBoltPath(S,b.P,lv,sc,t0,d0);(b.kids||[]).forEach((c,i)=>frBolt(S,c,lv+1,t0+[.75,.7,.6][lv]*S.k+i*.05*S.k,d0+40,sc));}
export const FR_LLAMPS={id:'llamps',name:'Llamps',what:'els llamps, branca a branca',
 pal:['#ffffff','#e2c4ff','#b05cff','#6a62ff','#3ee8ff'],pal2:['#ffffff','#c8d8ff','#7a7cff','#8a5cff','#5af0ff'],
 look:{bloom:.45,glow:2.4,halo:.2,core:.55,spread:.6},wind:0,pulseV:.8,
 acts:[(S,t0)=>{FR_BOLTS.forEach((b,i)=>{const T=t0+(i?.25:0)*S.k;frBolt(S,b,0,T,0,i?.5:1);frEvent(S,'tronc',b.P[0]/941,T);});
  frEvent(S,'branca',.8,t0+.8*S.k);frEvent(S,'fulla',1.2,t0+1.6*S.k);}]};

// ── 5 · Arbre ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A tree is a branch that ends in branches: every branch forks like the trunk, with daughters shorter by a constant ratio and spread
// by a constant angle (Honda, 1971; Prusinkiewicz & Lindenmayer, 1990), and the thickness follows Leonardo's rule, the sections of
// the daughters adding up to the section of the mother. Growth: the trunk; the three great boughs; then each order of branches, all
// at once; then the blossoms at the tips. Concept 05: a broad, symmetrical tree, an amber trunk of three strands spreading at the foot,
// green boughs curling up into a crown, and pink five-petalled flowers at the tips.
function frFlower(S,x,y,R,t0,o){const pts=[];for(let i=0;i<=60;i++){const th=i/60*FR_TAU+(o.rot||0),r=R*(.42+.58*Math.pow(Math.abs(Math.cos(2.5*th)),.75));pts.push(x+Math.cos(th)*r,y+Math.sin(th)*r);}
 frGrow(S,pts,t0,.45*S.k,{w0:o.w,c0:1,lum:1,d0:o.d,hot:.3,sway:o.sway,seed:o.seed});if(R>7)frLoop(S,x,y,R*.16,R*.16,0,t0+.2*S.k,.25*S.k,{w0:o.w*.8,c0:.95,lum:.8,d0:o.d,hot:0},10);}
const FR_TREE_T=[0,.75,1.4,1.95,2.45,2.85,3.2,3.5];
// a branch: it leaves its mother at an angle and bends back towards the direction of its mother (the arms of a lyre); at its end it
// forks in two, the daughters shorter by the same ratio and spread by the same angle
function frTwig(S,x,y,a,len,lv,t0,d0,turn,R){const k=S.k,c=frCurve(x,y,a,len,14,u=>turn*(1.4-u*.8)/len);
 const w=Math.max(1.3,24*Math.pow(.6,lv-1)),T=t0+FR_TREE_T[lv]*k,dur=.55*k;
 frGrow(S,c.pts,T,dur,{w0:w,w1:w*.72,c0:Math.min(.75,.32+.09*lv),c1:Math.min(.75,.38+.09*lv),lum:1,d0,hot:.8,sway:.4,seed:x*.01});
 const e=c.nodes[c.nodes.length-1],tf=t0+FR_TREE_T[7]*k+R()*.25*k;
 if(lv>=6||len<18){frFlower(S,e.x,e.y,5.5+3.5*R(),tf,{w:1.25,d:d0+len,sway:.4,seed:x*.01,rot:R()*6});return;}
 if(lv===4&&R()<.22){frFlower(S,e.x,e.y,22+10*R(),tf,{w:2.2,d:d0+len,sway:.4,seed:x*.01,rot:R()*6});return;}
 const sp=.5;for(const sd of [-1,1])frTwig(S,e.x,e.y,e.a+sd*sp*(.9+.2*R()),len*(.68+.06*R()),lv+1,t0,d0+len,sd*.45,R);}
export const FR_ARBRE={id:'arbre',name:'Arbre',what:'l’arbre, branca a branca, i les flors',
 pal:['#ffa214','#ffd21a','#c4f01e','#3fe02a','#ffa8e0'],pal2:['#ff8a14','#ffc81a','#a8f01e','#2fd86a','#ffb8c8'],
 look:{bloom:.4,glow:2.3,halo:.16,core:.45,spread:.6,exp:.8},wind:.01,
 acts:[(S,t0)=>{const k=S.k,R0=S.rnd;
  for(const m of [1,-1]){const X=x=>836+(x-836)*m,R=frRandom((S.seed||7)+(m>0?0:0));// the same randomness on both sides: a symmetrical tree
   // the trunk: three strands that spread into roots at the foot and run on into the boughs
   const edge=frSpline([590,945,690,885,772,780,795,680,770,600,690,560,590,548,480,568,380,610,260,660,150,700].map((v,i)=>i%2?v:X(v)),5);
   frGrow(S,edge.pts,t0,1.5*k,{w0:30,w1:12,c0:0,c1:.5,lum:.8,hot:1,sway:.15});
   // the twigs of the great bough
   for(const [u,an,len,tn] of [[.58,-80,165,-.7],[.73,-115,140,-.5],[.87,-145,125,.3],[1,-185,120,.5]]){const q=frAt(edge,u),A=an*Math.PI/180;frTwig(S,q.x,q.y,m>0?A:Math.PI-A,len,2,t0,q.s,m>0?tn:-tn,R);}
   // the inner strands of the trunk, between the edges
   for(const f of [.32,.66]){const P=[];for(let i=0;i<5;i++){const y=945-i*80,xe=[590,690,772,795,780][i];P.push(X(xe+(836-xe)*f),y);}frGrow(S,frSpline(P,5).pts,t0+.05*k,.8*k,{w0:20,w1:16,c0:.02,c1:.15,lum:.7,hot:.6});}
   frEvent(S,'tronc',X(500)/941,t0);}
  // the central stem and the heart at the top of it
  const cs=frSpline([836,945,836,800,832,640,830,520,832,430],5);frGrow(S,cs.pts,t0+.2*k,1*k,{w0:22,w1:14,c0:0,c1:.35,lum:.8,hot:1});
  for(const m of [1,-1]){const R=frRandom((S.seed||7)+11),a=m>0?-48:-132;frTwig(S,832,430,a*Math.PI/180,215,2,t0-.5*k,500,m>0?.25:-.25,R);}
  frEvent(S,'branca',836/941,t0+1.45*k);frEvent(S,'fulla',836/941+.4,t0+3.3*k);}]};
