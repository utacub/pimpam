// Fractals a la natura (CE46, 0.73) · stimuli 11–15: nervis d'una fulla, gel a la finestra, nautilus, micel·li, fang esquerdat. As in
// fractals-formes1.js: each one follows its concept picture (ChatGPT, 2026-11-11), in its units (1672 × 941), and grows order by order.
import {frPath,frPathT,frLoop,frEvent,frCurve,frGrow,frAt,frSpline,frOut,frLine,frTurn,frRoom,frTree,frInPoly,frVoronoi,FR_TAU} from './fractals-formes.js';
import {frRandom,frNoise,frIso,frChains} from './fractals-motor.js';

// ── 11 · Nervis d'una fulla ───────────────────────────────────────────────────────────────────────────────────────────────
// The veins of a leaf are a hierarchy: the midrib, the secondary veins that leave it and loop along the margin, the tertiary veins
// between them, and the fine net that closes the smallest fields (areoles), with veinlets ending free inside them. Each order splits
// the fields of the order above into smaller fields of the same kind, so the network looks alike at every magnification. The veins
// are laid down where the growing leaf makes the hormone auxin, which drains towards the veins already there: a rule that alone grows
// such networks (Runions et al., 2005; Sachs, 1981). Growth: the stalk, the midrib and the outline; the secondary veins; the tertiary
// veins; then the fine net, all over the leaf at once. Concept 11: a great leaf across the screen and two small ones in the corners,
// green at the stalk, yellow in the middle, orange at the tips.
// A leaf: its midrib and its two margins (control points), the places along the midrib of its secondary veins, its scale
const FR_LEAVES=[
 {mid:[20,930,62,876,120,808,200,735,330,642,480,560,640,490,800,422,960,364,1120,300,1280,232,1420,152,1540,82,1650,20],blade:.075,
  up:[150,752,160,640,205,520,280,410,400,290,560,180,750,100,950,58,1150,48,1350,54,1490,52,1580,38,1650,20],
  lo:[150,752,215,800,320,845,470,876,660,890,860,868,1050,800,1200,700,1330,560,1440,382,1530,200,1600,88,1650,20],n:11,w:1},
 {mid:[10,320,38,292,88,244,150,202,250,150,350,100,432,60,490,34],blade:.13,
  up:[70,250,76,180,120,105,210,52,320,32,420,32,490,34],lo:[70,250,130,276,230,284,330,248,410,170,460,90,490,34],n:7,w:.45},
 {mid:[1130,925,1162,903,1212,860,1300,790,1400,730,1500,680,1580,640,1655,600],blade:.13,
  up:[1205,860,1228,760,1300,682,1400,630,1500,610,1600,604,1655,600],lo:[1205,860,1300,886,1420,880,1520,820,1600,720,1640,650,1655,600],n:7,w:.45}];
export const FR_FULLA={id:'fulla',name:'Nervis d’una fulla',what:'els nervis de la fulla, dels grans als més fins',
 pal:['#18ff30','#8cff10','#ffe010','#ff9000','#ff5000'],pal2:['#10ff90','#60ff30','#ffcc10','#ff7a10','#ff3a40'],
 look:{bloom:.2,glow:2,halo:.08,core:.08,spread:.45,minW:.85},wind:.003,
 acts:[(S,t0)=>{const k=S.k,R=S.rnd,G=frRoom(8);
  FR_LEAVES.forEach((L,li)=>{const mid=frSpline(L.mid,6),up=frSpline(L.up,6),lo=frSpline(L.lo,6),W=L.w,b0x=L.mid[0],b0y=L.mid[1],tx=L.mid[L.mid.length-2],ty=L.mid[L.mid.length-1];
   const ax=tx-b0x,ay=ty-b0y,aa=ax*ax+ay*ay,U=(x,y)=>Math.max(0,Math.min(1,((x-b0x)*ax+(y-b0y)*ay)/aa));// the place along the leaf, base 0 → tip 1
   const poly=up.pts.concat(lo.pts.slice().reverse().flatMap((v,i,a)=>i%2?[]:[a[i+1],v]).slice(0)),inside=(x,y)=>frInPoly(poly,x,y);
   const T=t0+li*.12*k,cu=(o,x,y)=>Math.min(1,.04+.86*U(x,y)+o);
   // the stalk and the midrib, the outline of the blade
   frPathT(S,mid.pts,mid.pts.flatMap((v,i)=>i%2?[]:[T+.85*k*i/(mid.pts.length-2)]),{wf:i=>Math.max(2.4,(19-13*i/(mid.pts.length/2))*W+2),cf:i=>cu(0,mid.pts[i*2],mid.pts[i*2+1]),lum:1,hot:.9,sway:.2});
   G.mark(mid.pts,10*W+4,1000+li);
   for(const m of [up,lo])frPathT(S,m.pts,m.pts.flatMap((v,i)=>i%2?[]:[T+(.25+.75*i/(m.pts.length-2))*k]),{wf:()=>Math.max(1.6,3.2*W),cf:i=>cu(.06,m.pts[i*2],m.pts[i*2+1]),lum:.95,hot:.6,sway:.2});
   const outside=(x,y)=>!inside(x,y);
   // the secondary veins: from the midrib out towards the margin, bending towards the tip, and along the margin to the next one
   const sec=[],n=L.n;
   for(const [side,m] of [[1,up],[-1,lo]])for(let i=0;i<n;i++){const u=L.blade+(i+.5+(R()-.5)*.3)/n*(.95-L.blade);const q=frAt(mid,u);
    // where it meets the margin: further on towards the tip
    const e=frAt(m,Math.min(.97,u+.11+.07*(1-u))),a0=q.a-side*(.8-.25*u),L0=Math.hypot(e.x-q.x,e.y-q.y);
    const P=[],c1x=q.x+Math.cos(a0)*L0*.45,c1y=q.y+Math.sin(a0)*L0*.45,ex=q.x+(e.x-q.x)*.93,ey=q.y+(e.y-q.y)*.93,c2x=ex-Math.cos(e.a)*L0*.25,c2y=ey-Math.sin(e.a)*L0*.25;
    for(let j=0;j<=20;j++){const t=j/20,s=1-t;P.push(s*s*s*q.x+3*s*s*t*c1x+3*s*t*t*c2x+t*t*t*ex,s*s*s*q.y+3*s*s*t*c1y+3*s*t*t*c2y+t*t*t*ey);}
    // the loop along the margin, inwards, towards the tip
    const u2=Math.min(.985,u+.11+.07*(1-u)+1/n*.95);for(let j=1;j<=6;j++){const r=frAt(m,Math.min(.985,u+.11+.07*(1-u)+(u2-u-.11-.07*(1-u))*j/6)),f=.93+.02*j/6;
     const qm=frAt(mid,Math.min(1,(u2-.06)*1)),cx=qm.x,cy=qm.y;P.push(r.x+(cx-r.x)*(1-f)*.6,r.y+(cy-r.y)*(1-f)*.6);}
    const c=frSpline(P,5),Ts=T+(.55+.35*u)*k;
    frPathT(S,c.pts,c.pts.flatMap((v,j)=>j%2?[]:[Ts+.6*k*j/(c.pts.length-2)]),{wf:j=>Math.max(1.7,(8-4.6*j/(c.pts.length/2))*Math.sqrt(W)),cf:j=>cu(.06,c.pts[j*2],c.pts[j*2+1]),lum:1.1,hot:.8,sway:.25,d0:q.s});
    G.mark(c.pts,4*W+4,2000+li*100+sec.length);sec.push({c,Ts,id:2000+li*100+sec.length,d:q.s});}
   // the tertiary veins: small trees from the secondary veins into the fields between them, each finding its room
   const seeds=[];for(const v of sec){let s=14+R()*20,sd=R()<.5?-1:1;while(s<v.c.len-14){const q=frAt(v.c,s/v.c.len);sd=-sd;
     seeds.push({x:q.x,y:q.y,a:q.a+sd*(1.1+.5*R()),len:(26+22*R())*Math.sqrt(W),w:1.9*Math.sqrt(W),d:v.d+s,t:v.Ts+.6*k*q.u+.05,s0:6,par:v.id});s+=(26+18*R())*Math.sqrt(W);}}
   frTree(S,G,seeds,{mono:{rm:.8,am:.25,wm:.85,rs:.6,as:1.1,ws:.75},ratio:.7,wr:.8,minLen:5,depth:3,up:0,lyre:0,bend:.9,inside,tries:[0,.3,-.3,.6,-.6],
    pad:lv=>3,Cxy:(x,y)=>Math.min(1,.08+.88*U(x,y)),t0:T,T:lv=>1.25+lv*.35,dur:()=>.42,hot:.5,sway:.3,lum:()=>.72});
   // the fine net: the walls of small fields all over the blade, each wall slightly wavy, and a few veinlets ending free inside
   const box=[Math.min(...poly.filter((v,i)=>i%2===0))-10,Math.min(...poly.filter((v,i)=>i%2))-10,Math.max(...poly.filter((v,i)=>i%2===0))+10,Math.max(...poly.filter((v,i)=>i%2))+10];
   const V=frVoronoi(R,box,27*Math.sqrt(W)+3,inside);
   for(const w of V.walls){const mx=(w[0]+w[2])/2,my=(w[1]+w[3])/2;if(!inside(w[0],w[1])||!inside(w[2],w[3])||G.who(mx,my)>=1000)continue;const l=Math.hypot(w[2]-w[0],w[3]-w[1]);if(l<2)continue;
    const nx=-(w[3]-w[1])/l,ny=(w[2]-w[0])/l,bend=(R()-.5)*l*.25,p=[w[0],w[1],mx+nx*bend,my+ny*bend,w[2],w[3]];
    const u=U(mx,my),tw=T+(2.1+.5*u+.3*R())*k;frPathT(S,p,[tw,tw+.12*k,tw+.25*k],{w0:.95,cf:()=>Math.min(1,.12+.88*u),lum:.34,hot:0,sway:.3});}
   for(let i=0;i<V.pts.length;i+=2)if(R()<.35){const x=V.pts[i],y=V.pts[i+1];if(G.who(x,y)>=1000)continue;const a=R()*FR_TAU,l=(5+6*R())*Math.sqrt(W),u=U(x,y),tw=T+(2.5+.5*u)*k;
    frLine(S,x+Math.cos(a)*l,y+Math.sin(a)*l,x,y,tw,.2*k,{w0:.95,c0:Math.min(1,.12+.88*u),lum:.3,hot:0},40);}
   frEvent(S,'tronc',b0x/941,T);frEvent(S,'branca',(b0x+tx)/2/941,T+.6*k);frEvent(S,'fulla',tx/941,T+1.3*k);frEvent(S,'fulla',(b0x+tx)/2/941,T+2.2*k);});}]};

// ── 12 · Gel a la finestra ────────────────────────────────────────────────────────────────────────────────────────────────
// Frost on a window grows from the cold edges of the glass: water vapour freezes onto the tips of the ice needles, which stick out
// furthest into the moist air, so the tips grow fastest and keep splitting (a diffusion-limited growth, as Witten & Sander, 1981,
// described it). The ice lattice is hexagonal, so the side branches leave at about 60°, and every side branch grows its own side
// branches at 60°, and so on: a feather of feathers. Growth: the great needles from the four corners; their side branches; the side
// branches of those; and the finest barbs, all at once. Concept 12: frost ferns from the four corners towards the middle of the
// glass, white needles in an ice-blue glow, the middle left clear.
const FR_FROST=[[-10,-6,27,980,10],[-6,12,64,560,7],[30,-8,4,560,6],[1682,-6,153,820,10],[1690,30,116,420,6.5],[1300,-8,176,380,5.5],
 [-10,951,-32,840,10],[-8,880,-64,470,7],[1682,951,-148,880,10],[1680,925,-111,640,8],[640,951,-150,260,5]];
function frIce(S,G,x,y,a,len,w,lv,T,d,R,id,curl=0){const k=S.k,D=Math.PI/180,step=[9,6,4,3][lv],n=Math.max(2,Math.round(len/step)),pts=[x,y];let dir=a;
 // the needle: nearly straight, its direction wandering a little about a (and turning slowly by curl over its length)
 for(let i=1;i<=n;i++){const ai=a+curl*i/n;dir=ai+(dir-ai)*.8+(R()-.5)*[.09,.1,.12,.14][lv];pts.push(pts[i*2-2]+Math.cos(dir)*len/n,pts[i*2-1]+Math.sin(dir)*len/n);}
 // a needle of the first orders stops where another needle already is
 let m=n;if(lv<=1){for(let i=3;i<=n;i++){const o=G.who(pts[i*2],pts[i*2+1],60);if(o===-2||(o>=0&&o!==id&&o!==(id>>2))){m=i-1;break;}}if(m<2)return;}
 const P=pts.slice(0,m*2+2),L=len*m/n,dur=[.95,.55,.38,.24][lv]*k*Math.min(1,.4+L/len*.6);
 const ts=P.flatMap((v,i)=>i%2?[]:[T+dur*i/2/m]);
 // the needles of the first orders: a white core in a blue glow (a wide dim blue line under a thin bright one); the fine ones white
 if(lv<=1)for(const [f,l] of [[2.2,.38],[1,.9]])frPathT(S,P,ts,{wf:i=>([12,6][lv]*w/10+[3,2.4][lv])*f*(1-.6*i/m),cf:()=>.14,lum:[1.1,.85][lv]*l,d0:d,hot:0,sway:0});
 frPathT(S,P,ts,{wf:i=>{const u=i/m;return [6,2.8,1,.8][lv]*w/10*(1-.55*u)+[1.6,1.2,.95,.85][lv];},cf:i=>[.96,.92,.7,.76][lv],lum:[1.3,1.1,.95,.78][lv],d0:d,hot:lv<2?.9:.3,sway:0});
 if(lv<=1)G.mark(P,[10,5][lv],id);
 if(lv>=3)return;
 // the side branches: at about 60°, on alternate sides (and now and then on both), longest near the base, shorter towards the tip
 const sp=[46,19,8.5][lv],start=[60,8,4][lv];let s=start+R()*sp*.5,side=R()<.5?-1:1;const ratio=[.34,.27,.3][lv];
 while(s<L-sp*.5){const i=Math.min(m-1,Math.round(s/L*m)),px=P[i*2],py=P[i*2+1],pa=Math.atan2(P[i*2+3]-P[i*2+1],P[i*2+2]-P[i*2]),u=s/L,env=Math.pow(1-u,[.8,.55,.5][lv])*(lv?Math.min(1,.5+u*3):Math.min(1,.55+u*2));
  side=-side;for(const sd of (R()<[.35,.5,.5][lv]?[-1,1]:[side])){const l=len*ratio*env*(lv?.7+.6*R():(R()<.18?1.5:.55+.8*R()));if(l<[0,20,4,2.5][lv+1])continue;
   frIce(S,G,px,py,pa+sd*([50,42,42][lv]+(R()-.5)*[26,18,12][lv])*D,l,w*[.6,.65,.7][lv],lv+1,Math.max(T+dur*u+.04*k,T+[.7,.5,.36][lv]*k),d+s,R,id*4+(sd>0?1:2),-sd*[.3,.18,.05][lv]*(R()*1.6-.3));}
  s+=sp*(.75+.5*R());}}
export const FR_GEL={id:'gel',name:'Gel a la finestra',what:'les agulles de gel, de les grans a les més fines',
 pal:['#0a62d0','#1a94ee','#78d0ff','#d6f2ff','#ffffff'],pal2:['#2a4ad8','#3a84f0','#8ac0ff','#e2e8ff','#ffffff'],
 look:{bloom:.22,glow:2,halo:.1,core:.5,spread:.5,minW:.8},wind:0,
 acts:[(S,t0)=>{const k=S.k,R=S.rnd,G=frRoom(8),D=Math.PI/180;
  FR_FROST.forEach(([x,y,a,len,w],i)=>{const T=t0+(i%3)*.12*k;frIce(S,G,x,y,a*D,len*(.94+.1*R()),w,0,T,0,R,10+i*2);frEvent(S,'tronc',Math.max(0,Math.min(1672,x))/941,T);});
  frEvent(S,'branca',.4,t0+.9*k);frEvent(S,'branca',1.4,t0+1.1*k);frEvent(S,'fulla',.8,t0+1.6*k);frEvent(S,'fulla',1.2,t0+2.1*k);}]};

// ── 13 · Nautilus ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// The nautilus grows by adding to the mouth of its shell and closing behind itself a new wall (a septum), each chamber a copy of the
// one before, larger by the same factor: the shell is a logarithmic spiral, r = a·e^(bθ), the one curve that keeps its shape when it
// grows, so that any piece of it, enlarged, is the same as a bigger piece (Thompson, 1917, «On growth and form»; the nautilus grows
// about three times wider at each turn). Self-similar, not branching: the same spiral at every scale. Growth: the wall of the shell,
// turn by turn from the centre outwards, closing a wall behind each chamber as it passes; three shells, a big one and two smaller
// copies. Concept 13: three nautilus shells cut in half, the spirals and the curved walls of the chambers, cream at the centre,
// gold, amber and copper at the mouth.
// [centre x, y, radius at the mouth, the screen angle of the mouth (degrees), time lag]
const FR_SHELLS=[[745,510,720,144,0],[1466,676,405,144,.3],[1528,186,208,142,.55]];
function frShell(S,cx,cy,Rm,ang,T,R){const k=S.k,b=.2,a=1.6,th1=Math.log(Rm/a)/b,th0=Math.log(2.5/a)/b,rot=ang*Math.PI/180+th1,D=1.7*k*Math.pow(Rm/720,.25);
 const P=th=>{const r=a*Math.exp(b*th),f=rot-th;return [cx+Math.cos(f)*r,cy+Math.sin(f)*r,r];},tAt=th=>T+D*Math.pow((th-th0)/(th1-th0),1.35);
 // the wall: one spiral from the centre to the mouth, thicker and redder as it widens
 const pts=[],ts=[],rs=[];for(let th=th0;th<=th1+1e-6;th+=Math.min(.12,4/Math.max(1,a*Math.exp(b*th)))){const q=P(th);pts.push(q[0],q[1]);ts.push(tAt(th));rs.push(q[2]);}
 const sc=Math.pow(720/Rm,.35);frPathT(S,pts,ts,{wf:i=>1.5+rs[i]*.0135*sc,cf:i=>.92*Math.pow(rs[i]/Rm,.6),lum:1,hot:.8,d0:0});
 // the walls of the chambers: from the turn before to this one, curved back like a cup (its hollow towards the mouth)
 const per=13,dth=FR_TAU/per;for(let th=th0+FR_TAU+dth*.5;th<th1-dth*.35;th+=dth*(.92+.16*R())){
  const A=P(th-FR_TAU),B=P(th),L=Math.hypot(B[0]-A[0],B[1]-A[1]),f=rot-th,tx=Math.sin(f),ty=-Math.cos(f);// tx, ty: towards the older chambers
  const c1=[A[0]+(B[0]-A[0])*.25+tx*L*.55,A[1]+(B[1]-A[1])*.25+ty*L*.55],c2=[A[0]+(B[0]-A[0])*.8+tx*L*.42,A[1]+(B[1]-A[1])*.8+ty*L*.42],sp=[];
  for(let j=0;j<=18;j++){const t=j/18,s=1-t;sp.push(s*s*s*B[0]+3*s*s*t*c2[0]+3*s*t*t*c1[0]+t*t*t*A[0],s*s*s*B[1]+3*s*s*t*c2[1]+3*s*t*t*c1[1]+t*t*t*A[1]);}
  const t0=tAt(th)+.04*k,r=B[2];frGrow(S,sp,t0,(.22+.25*Math.min(1,r/400))*k,{w0:1.3+r*.0105*sc,w1:1.3+A[2]*.012*sc,c0:Math.pow(r/Rm,.6)*.82,c1:Math.pow(A[2]/Rm,.6)*.82,lum:.95,hot:.6,d0:r});}}
export const FR_NAUTILUS={id:'nautilus',name:'Nautilus',what:'la closca en espiral, cambra a cambra',
 pal:['#fff6dc','#ffe08a','#ffb030','#ff8c1a','#ff701a'],pal2:['#fff0e8','#ffd0a0','#ffa060','#ff7848','#ff5a3a'],
 look:{bloom:.3,glow:2.2,halo:.16,core:.18,spread:.42,gsat:1.8,sat:1.25},wind:0,
 acts:[(S,t0)=>{const k=S.k,R=S.rnd;
  for(const [x,y,Rm,ang,lag] of FR_SHELLS){frShell(S,x,y,Rm,ang,t0+lag*k,R);frEvent(S,'tronc',x/941,t0+lag*k);}
  frEvent(S,'branca',.8,t0+.9*k);frEvent(S,'fulla',.6,t0+1.5*k);frEvent(S,'fulla',1.1,t0+2*k);}]};
