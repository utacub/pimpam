// Fractals a la natura (CE46, 0.73) · the common tools of the stimuli: a stimulus is a list of acts (each press runs one or more of
// them all, one after the other, see frGrowForm in fractals.js), and an act lays down segments that grow from a moment on. Live models (the snow crystals) also
// step on each frame and lay down their lines as they grow.
import {frSeg} from './fractals-motor.js';
export const FR_TAU=Math.PI*2,FR_GOLD=Math.PI*(3-Math.sqrt(5));
// A polyline that grows from its first point at `speed` (scene units per second) from the moment t0. pts: [x, y, x, y, …].
// o: w0 w1 (width at the start and at the end), c0 c1 (place in the palette), lum, d0 (distance of the first point from the root)
// and the options of frSeg. Returns {t, d}: the moment it has finished growing and the distance from the root at its end.
export function frPath(S,pts,t0,speed,o={}){const n=pts.length/2;let L=0;for(let i=1;i<n;i++)L+=Math.hypot(pts[i*2]-pts[i*2-2],pts[i*2+1]-pts[i*2-1]);
 let acc=0,d=o.d0||0;const w0=o.w0??.002,w1=o.w1??w0,c0=o.c0??.5,c1=o.c1??c0,lum=o.lum??1,sp=Math.max(1e-4,speed);
 for(let i=1;i<n;i++){const x0=pts[i*2-2],y0=pts[i*2-1],x1=pts[i*2],y1=pts[i*2+1],l=Math.hypot(x1-x0,y1-y0);if(l<1e-7)continue;
  const u0=L?acc/L:0,u1=L?(acc+l)/L:1;frSeg(S.st,x0,y0,x1,y1,t0+acc/sp,l/sp,w0+(w1-w0)*u0,w0+(w1-w0)*u1,c0+(c1-c0)*u0,lum,d,d+l,o);acc+=l;d+=l;}
 return {t:t0+L/sp,d};}
// a closed loop (a floret, a petal, a bud) drawn from its start round to its start again
export function frLoop(S,cx,cy,rx,ry,rot,t0,dur,o={},n=10,start=0){const pts=[];for(let i=0;i<=n;i++){const a=start+i/n*FR_TAU,x=Math.cos(a)*rx,y=Math.sin(a)*ry;pts.push(cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot));}
 let L=0;for(let i=1;i<=n;i++)L+=Math.hypot(pts[i*2]-pts[i*2-2],pts[i*2+1]-pts[i*2-1]);return frPath(S,pts,t0,L/Math.max(.05,dur),o);}
// an event for the music (a note of the chord at that moment): type, place across the screen (0–1), the moment
export function frEvent(S,type,x,at){S.evq.push({type,x:Math.max(0,Math.min(1,x/(S.AR||1.78))),at});}
// the turtle of an L-system-like branch: from (x, y) at angle a (0 = right, −π/2 = up)
export const frDir=(a,l)=>[Math.cos(a)*l,Math.sin(a)*l];

// ── 1 · Falgueres ────────────────────────────────────────────────────────────────────────────────────────────────────────
// A fern frond is self-similar: the rachis carries pinnae, each pinna is a small frond with pinnules, and each pinnule has its own
// lobes (three levels, after Prusinkiewicz & Lindenmayer, 1990). The frond grows from its base: each pinna begins when the rachis
// reaches its node, and the young tip is still curled, as in the circinate vernation of real ferns.
function frFrond(S,x,y,a,len,lv,t0,d0,side,c0,o){const N=[13,9,5][lv],dur=[3,1.3,.6][lv],sp=len/dur,pts=[x,y],nodes=[];let ang=a,px=x,py=y,acc=0;
 const curl=[.06,.1,.14][lv]*side;
 for(let i=0;i<N;i++){const u=i/N,st=len/N*(1.25-.5*u);ang+=curl*(.1+3.2*u**3.5);px+=Math.cos(ang)*st;py+=Math.sin(ang)*st;acc+=st;pts.push(px,py);nodes.push([px,py,ang,acc,u]);}
 const w=[.0036,.0015,.0008][lv];
 frPath(S,pts,t0,sp,{...o,w0:w,w1:w*.35,c0,c1:c0+.12,lum:[1,.95,.85][lv],d0,sway:1,hot:[1,.35,0][lv]});
 if(lv>=2)return;
 // the pinnae: longest a third of the way up, short at the base, tapering to the tip (a lanceolate frond)
 for(let i=lv?0:1;i<N-1;i++){const [nx,ny,na,nd,u]=nodes[i],tn=t0+nd/sp,shape=Math.pow(Math.sin(Math.PI*Math.min(1,(u+.18)/1.12)),1.1)*(1-.6*u);
  const pl=len*[.2,.27][lv]*shape;if(pl<.005)continue;
  for(const s of [-1,1]){const pa=na+s*(1.42-.55*u)+(S.rnd()-.5)*.06,cc=c0+.1+.25*u+.08*lv;
   if(lv===0||pl>.016)frFrond(S,nx,ny,pa,pl,lv+1,tn+.08*(s>0?1:0),d0+nd,-s,cc,o);
   else frPath(S,[nx,ny,nx+Math.cos(pa)*pl,ny+Math.sin(pa)*pl],tn,pl/.35,{...o,w0:.0008,w1:.0003,c0:cc+.1,lum:.85,d0:d0+nd,sway:1,hot:0});}}}
const FR_FERN_SPOTS=[[.5,1.04,-1.62,.86,1],[.12,1.04,-1.25,.82,-1],[.88,1.04,-1.9,.82,1],[-.02,.62,-.42,.62,1],[1.02,.6,-2.72,.62,-1],[-.02,-.02,.75,.56,-1],[1.02,-.02,2.4,.56,1],
 [.3,1.04,-1.45,.6,-1],[.7,1.04,-1.72,.6,1],[.02,.28,.15,.5,-1],[.98,.3,-3.0,.5,1]];
export const FR_FALGUERES={id:'falgueres',name:'Falgueres',what:'frondes de falguera que es despleguen',
 pal:['#0a7a6a','#1fcf6a','#8ff03a','#f2e64a','#ffb86b'],pal2:['#1a4fbf','#18b8c9','#4be0a0','#d6ff7a','#fff3b0'],look:{bloom:.6,glow:3},wind:.012,
 acts:FR_FERN_SPOTS.map(([fx,fy,a,l,side],j)=>(S,t0)=>{const x=fx*S.AR,y=fy;frFrond(S,x,y,a+(S.rnd()-.5)*.12,l*(.95+S.rnd()*.12),0,t0,0,side,[.0,.22,.1,.3,.05,.18][j%6],{pal:S.lap%2});frEvent(S,'neix',x,t0);})};

// ── 2 · Gira-sol ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Vogel's model (1979): floret n sits at angle n·137.5° and radius c·√n. Nobody draws the spirals: they are the lines that join each
// floret to its neighbours, which are always Fibonacci numbers apart (21, 34, 55, 89).
function frHead(S,cx,cy,R,N){return {cx,cy,R,N,c:R/Math.sqrt(N),pos:i=>{const r=R/Math.sqrt(N)*Math.sqrt(i+.5),a=i*FR_GOLD+S.rot;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r,r];}};}
function frFlorets(S,H,t0,dur){const sz=H.c*.22;for(let i=0;i<H.N;i+=2){const [x,y,r]=H.pos(i);frLoop(S,x,y,sz,sz,i,t0+dur*Math.sqrt(i/H.N),.3,{w0:.0009,c0:.15+.3*r/H.R,lum:.5,d0:r,hot:0,pal:S.lap%2},5);}}
function frSpirals(S,H,t0,dur,step,c,lum=.85){for(let i=0;i+step<H.N;i++){const [x0,y0,r0]=H.pos(i),[x1,y1,r1]=H.pos(i+step),k=r0/H.R;frSeg(S.st,x0,y0,x1,y1,t0+dur*Math.sqrt(i/H.N),.28,.0008+.0016*k,.0008+.0016*r1/H.R,c+.12*k,lum*(.45+.55*k),r0,r1,{pal:S.lap%2,hot:.5});}}
function frPetals(S,H,t0,n,len,c,off=0){for(let i=0;i<n;i++){const a=(i+off)/n*FR_TAU+S.rot+(S.rnd()-.5)*.06,l=H.R*len*(.85+S.rnd()*.3),m=H.R*1.02+l*.5;
  frLoop(S,H.cx+Math.cos(a)*m,H.cy+Math.sin(a)*m,l*.5,l*.13,a,t0+i/n*.9,1.1,{w0:.0021,c0:c+.08*S.rnd(),lum:1,d0:H.R,pal:S.lap%2,sway:.3},18,Math.PI);}}
export const FR_GIRASOL={id:'girasol',name:'Gira-sol',what:'les espirals d’un gira-sol',
 pal:['#3b1fa8','#c2185b','#ff6a1a','#ffc21a','#fff0a0'],pal2:['#0b3d91','#1e88e5','#00bfa5','#ffca28','#fff3c4'],look:{bloom:.5,glow:2.8,halo:.16},wind:0,
 init:S=>{S.rot=S.rnd()*FR_TAU;S.heads=[frHead(S,S.AR*.5,.5,.27,700),frHead(S,S.AR*.06,.08,.22,500),frHead(S,S.AR*.95,.92,.24,560),frHead(S,S.AR*.95,.06,.15,300),frHead(S,S.AR*.04,.95,.16,320)];},
 acts:[(S,t)=>{frFlorets(S,S.heads[0],t,2.4);frEvent(S,'neix',S.AR*.5,t);},
  (S,t)=>{frSpirals(S,S.heads[0],t,2.6,34,.3);frEvent(S,'espiral',S.AR*.4,t);},
  (S,t)=>{frSpirals(S,S.heads[0],t,2.6,55,.5);frEvent(S,'espiral',S.AR*.6,t);},
  (S,t)=>{frPetals(S,S.heads[0],t,34,.7,.62);frEvent(S,'neix',S.AR*.5,t);},
  (S,t)=>{const H=S.heads[1];frFlorets(S,H,t,1.8);frSpirals(S,H,t+.6,2,34,.3);frPetals(S,H,t+1,21,.65,.62);frEvent(S,'neix',H.cx,t);},
  (S,t)=>{const H=S.heads[2];frFlorets(S,H,t,1.8);frSpirals(S,H,t+.6,2,21,.5);frPetals(S,H,t+1,21,.65,.7);frEvent(S,'neix',H.cx,t);},
  (S,t)=>{frSpirals(S,S.heads[0],t,2.4,21,.7,.7);frEvent(S,'espiral',S.AR*.5,t);},
  (S,t)=>{frPetals(S,S.heads[0],t,21,.95,.78,.5);frEvent(S,'neix',S.AR*.5,t);},
  (S,t)=>{const H=S.heads[3];frFlorets(S,H,t,1.5);frSpirals(S,H,t+.5,1.6,34,.35);frPetals(S,H,t+.9,21,.65,.62);frEvent(S,'neix',H.cx,t);},
  (S,t)=>{const H=S.heads[4];frFlorets(S,H,t,1.5);frSpirals(S,H,t+.5,1.6,21,.45);frPetals(S,H,t+.9,21,.65,.7);frEvent(S,'neix',H.cx,t);},
  (S,t)=>{for(const H of S.heads.slice(1))frSpirals(S,H,t,2,55,.1,.55);frSpirals(S,S.heads[0],t,2.6,89,.15,.45);frEvent(S,'espiral',S.AR*.5,t);}]};

// ── 3 · Flocs de neu ─────────────────────────────────────────────────────────────────────────────────────────────────────
// Reiter's local model of snow crystal growth (2005), run live on a hexagonal grid: water vapour diffuses towards the crystal and
// freezes where a cell gathers enough. β is the humidity, γ the vapour added at the surface: their values give plates, stars or
// fern-like dendrites (as in the Nakaya diagram; Libbrecht, 2005). The lines are the outline of the crystal, drawn again each time it
// has grown a little: the rings of growth that one sees inside a real crystal.
const FR_SNOW_KIND=[[.4,.0001],[.65,.0005],[.35,.001],[.8,.002],[.45,.0002],[.55,.003],[.3,.0003],[.5,.0001],[.4,.002],[.6,.0001]];
export class FrFlake{
 constructor(S,cx,cy,R,kind,c0,N=40){this.S=S;this.cx=cx;this.cy=cy;this.R=R;this.N=N;const W=this.W=2*N+1;this.sp=R/N;[this.be,this.ga]=kind;this.c0=c0;
  const n=W*W;this.s=new Float32Array(n).fill(this.be);this.u=new Float32Array(n);this.v=new Float32Array(n);this.fr=new Uint8Array(n);this.edge=new Uint8Array(n);this.act=[];
  for(let r=-N;r<=N;r++)for(let q=-N;q<=N;q++)if(Math.abs(q)<=N&&Math.abs(q+r)<=N){const i=(r+N)*W+q+N;this.act.push(i);if(Math.abs(q)===N||Math.abs(r)===N||Math.abs(q+r)===N)this.edge[i]=1;}
  this.act=Int32Array.from(this.act);const c=N*W+N;this.s[c]=1;this.fr[c]=1;this.D=[1,-1,W,-W,1-W,W-1];this.maxR=0;this.lastR=-1;this.it=0;this.done=false;this.rings=0;this.t0=S.t;}
 step(k){const {s,u,v,fr,edge,act,D,be,ga,W,N}=this;
  for(let j=0;j<k&&!this.done;j++){this.it++;
   for(let a=0;a<act.length;a++){const i=act[a];let rc=fr[i];if(!rc)for(let d=0;d<6;d++)if(fr[i+D[d]]){rc=1;break;}if(rc){u[i]=0;v[i]=s[i]+ga;}else{u[i]=s[i];v[i]=0;}}
   for(let a=0;a<act.length;a++){const i=act[a];if(edge[i]){s[i]=be;continue;}const m=(u[i+1]+u[i-1]+u[i+W]+u[i-W]+u[i+1-W]+u[i-1+W])/6;s[i]=u[i]+.5*(m-u[i])+v[i];
    if(!fr[i]&&s[i]>=1){fr[i]=1;const q=i%W-N,r=Math.floor(i/W)-N,R=(Math.abs(q)+Math.abs(r)+Math.abs(q+r))/2;if(R>this.maxR)this.maxR=R;}}
   if(this.maxR>=N-3||this.it>2600)this.done=true;}}
 // the outline at this moment: marching triangles on the grid of cells, at the level where a cell freezes
 outline(t,last){const {s,fr,W,N,sp,cx,cy}=this,S=this.S,X=(q,r)=>cx+(q+r/2)*sp,Y=(q,r)=>cy+r*sp*.8660254,val=i=>fr[i]?Math.max(1,s[i]):Math.min(s[i],.999);
  const ring=this.rings++,c=this.c0+Math.min(.55,ring*.035),lum=last?1.15:.55+.25*Math.min(1,ring/10),w=last?.0016:.0009;
  const tri=(a,b,c2)=>{const fa=fr[a[2]],fb=fr[b[2]],fc=fr[c2[2]];if(fa===fb&&fb===fc)return;const p=[];
   for(const [P,Q] of [[a,b],[b,c2],[c2,a]]){const vp=val(P[2]),vq=val(Q[2]);if((vp>=1)!==(vq>=1)){const f=(1-vp)/((vq-vp)||1e-6);p.push(P[0]+(Q[0]-P[0])*f,P[1]+(Q[1]-P[1])*f);}}
   if(p.length===4){const d0=Math.hypot(p[0]-cx,p[1]-cy),d1=Math.hypot(p[2]-cx,p[3]-cy);frSeg(S.st,p[0],p[1],p[2],p[3],t+d0*1.2,.3,w,w,c,lum,d0,d1,{pal:S.lap%2,hot:last?.5:0,tm:this.t0+.01,vy:.0035});}};
  for(let r=-N;r<N;r++)for(let q=-N;q<N;q++){const i=(r+N)*W+q+N;if(Math.abs(q)>N-1||Math.abs(q+r)>N-1||Math.abs(r)>N-1)continue;
   const A=[X(q,r),Y(q,r),i],B=[X(q+1,r),Y(q+1,r),i+1],C=[X(q,r+1),Y(q,r+1),i+W],D=[X(q+1,r+1),Y(q+1,r+1),i+W+1];tri(A,B,C);tri(B,D,C);}}
 // a few steps of the model each frame; a new ring each time the crystal has grown two cells further
 live(dt){if(this.done)return true;this.step(Math.max(1,Math.round(dt*this.rate)));if(this.maxR>=this.lastR+2||this.done){this.lastR=this.maxR;this.outline(this.S.t,this.done);if(!this.done)frEvent(this.S,'gel',this.cx,this.S.t);}return this.done;}}
const FR_FLAKE_SPOTS=[[.5,.48,.36],[.17,.3,.2],[.83,.68,.22],[.2,.78,.17],[.82,.22,.17],[.36,.14,.12],[.64,.86,.13],[.05,.55,.12],[.95,.45,.13],[.38,.82,.1],[.62,.15,.1]];
export const FR_FLOCS={id:'flocs',name:'Flocs de neu',what:'cristalls de neu que creixen',
 pal:['#3a2a8c','#3f6fe0','#62c8ff','#c8f0ff','#ffffff'],pal2:['#5b1e7a','#9b5de5','#8fd3ff','#e0fbff','#ffffff'],look:{bloom:.7,glow:3.4,minW:.8},wind:0,
 acts:FR_FLAKE_SPOTS.map(([fx,fy,R],j)=>(S,t0)=>{const kind=FR_SNOW_KIND[(j*3+S.lap*5+Math.floor(S.rnd()*2))%FR_SNOW_KIND.length],f=new FrFlake(S,fx*S.AR,fy,R,kind,.05+.1*(j%3),R>.25?44:R>.15?36:28);
  f.rate=f.N*20;S.wake.push({at:t0,go:()=>S.live.push(f)});frEvent(S,'neix',fx*S.AR,t0);})};

// ── 4 · Arbre ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Honda's model of tree form (1971): each branch gives a continuing branch, shorter by r1 and turned by a1, and a side branch, shorter by
// r2 and turned by a2, on alternate sides. Each press adds generations; at the end the tips blossom.
function frBranch(S,b,t0,dur){const [dx,dy]=frDir(b.a,b.l),pts=[b.x,b.y],n=3;let x=b.x,y=b.y;for(let i=1;i<=n;i++){const j=(S.rnd()-.5)*b.l*.08;x=b.x+dx*i/n-dy/b.l*j;y=b.y+dy*i/n+dx/b.l*j;pts.push(x,y);}
 pts[pts.length-2]=b.x+dx;pts[pts.length-1]=b.y+dy;frPath(S,pts,t0,b.l/dur,{w0:b.w,w1:b.w*.78,c0:b.c,c1:b.c+.05,lum:1,d0:b.d,sway:1,pal:S.lap%2,hot:.8});return {x:b.x+dx,y:b.y+dy};}
function frGeneration(S,t0){const out=[],dur=1.5;for(const b of S.tips){const e=frBranch(S,b,t0+S.rnd()*.35,dur);if(b.g>=S.G)continue;
  const s=b.s,up=-Math.PI/2,bend=(a,k)=>a+(up-a)*k*(b.g<2?1:-.6);
  out.push({x:e.x,y:e.y,a:bend(b.a+s*S.a1,.1),l:b.l*S.r1,w:b.w*.74,d:b.d+b.l,c:b.c+.075,g:b.g+1,s:-s});
  out.push({x:e.x,y:e.y,a:bend(b.a-s*S.a2,.04),l:b.l*S.r2,w:b.w*.62,d:b.d+b.l,c:b.c+.09,g:b.g+1,s});}
 S.tips=out;}
function frBlossom(S,t0,c,big){for(const b of S.ends){const n=5,r=(big?.0085:.006)*(.8+S.rnd()*.4),ro=S.rnd()*FR_TAU;for(let i=0;i<n;i++){const a=ro+i/n*FR_TAU;
  frLoop(S,b.x+Math.cos(a)*r*.9,b.y+Math.sin(a)*r*.9,r,r*.5,a,t0+S.rnd()*1.2,.5,{w0:.001,c0:c,lum:1.1,d0:b.d,sway:1,pal:S.lap%2,hot:.3},8);}}}
export const FR_ARBRE={id:'arbre',name:'Arbre',what:'les branques d’un arbre',
 pal:['#6b3a1e','#b5651d','#5fbf3f','#ff7eb6','#ffe3f0'],pal2:['#3b2a6b','#7b4fbf','#3fbfa8','#ffd166','#fff6d6'],look:{bloom:.55,glow:2.8},wind:.01,
 init:S=>{const R=S.rnd;S.r1=.82+R()*.05;S.r2=.74+R()*.05;S.a1=.24+R()*.12;S.a2=.7+R()*.16;S.G=9;S.tips=[{x:S.AR*(.48+R()*.04),y:1.03,a:-Math.PI/2+(R()-.5)*.08,l:.25,w:.02,d:0,c:.02,g:0,s:R()<.5?1:-1}];S.ends=[];},
 acts:[...Array(9)].map((_,g)=>(S,t)=>{if(g===8)S.ends=S.tips.map(b=>({x:b.x+Math.cos(b.a)*b.l,y:b.y+Math.sin(b.a)*b.l,d:b.d+b.l}));frGeneration(S,t);frEvent(S,'neix',S.AR*(.3+.4*S.rnd()),t);})
  .concat([(S,t)=>{frBlossom(S,t,.75,false);frEvent(S,'flor',S.AR*.5,t);},(S,t)=>{frBlossom(S,t,.92,true);frEvent(S,'flor',S.AR*.5,t);}])};
