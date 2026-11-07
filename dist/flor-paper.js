// La nova Flor de paper (CE02), 0.51 · paper and petals.
// A petal is a curved sheet in 3D (flor-especies.js says how): its spine leaves the axis of the flower at the angle phi and bends by
// curl, its two edges cup by cup and wave by rf. It is projected (orthographic, the viewer on +z) and painted as paper: a fill that
// follows the light (the flower glows from inside, and a soft key light comes from the upper left), the paper of its technique laid
// over it (crêpe striations along the petal, tissue fibres, folded card, watercolour), its marks, and a dark contour so that it always
// stands out (Marc's rule for figures). Everything is drawn from code: no image files.
import {K_TAU,Kclamp,Ksmooth,Krand,Kmix,Krgb,Krgba} from './kaleido-base.js';
import {escCanvas} from './escenari.js';

// ── Small 3D vectors ─────────────────────────────────────────────────────────────────────────────────────────────────────────
export const fpAdd=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const fpSc=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
export const fpDot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const fpCross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const fpNorm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
// The frame of a flower whose axis is A: e1 and e2 span the plane of the open flower (e1 towards the screen's right when it can).
export function fpBasis(A){A=fpNorm(A);const ref=Math.abs(A[0])<.8?[1,0,0]:[0,-1,0],e1=fpNorm(fpAdd(ref,fpSc(A,-fpDot(ref,A)))),e2=fpCross(A,e1);return {A,e1,e2};}
// The axis of a flower: tilt from the upright stem towards the viewer (0 = up, π/2 = facing the viewer), yaw to the side.
export function fpAxis(tilt,yaw=0){const s=Math.sin(tilt),c=Math.cos(tilt);return fpNorm([Math.sin(yaw)*s,-c,Math.cos(yaw)*s]);}
// The key light (upper left, in front).
export const FP_KEY=fpNorm([-.38,-.58,.72]);

// ── Colour ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// k < 1 darkens towards black, k > 1 lightens towards white.
export const fpShade=(hex,k)=>k<1?Kmix(hex,'#000000',Kclamp(1-k)):Kmix(hex,'#ffffff',Kclamp(k-1));
// The colour of a surface lit by the light colour lc (multiply, channel by channel), with amount a of that light.
export function fpLit(hex,lc,a){const x=Krgb(hex),y=Krgb(lc);return '#'+x.map((v,i)=>Math.round(Kclamp(v*(y[i]/255)*a,0,255)).toString(16).padStart(2,'0')).join('');}

// A path for the shapes: Path2D in the browser; outside it (the tests, an old browser) a path that records nothing, so the drawing
// still runs and every coordinate can be checked.
class FpNoPath{moveTo(){}lineTo(){}quadraticCurveTo(){}bezierCurveTo(){}closePath(){}arc(){}ellipse(){}rect(){}}
export const fpPath2D=()=>typeof Path2D!=='undefined'?new Path2D():new FpNoPath();
// ── Paper textures (made once, tileable, 256 px) ────────────────────────────────────────────────────────────────────────────
const FP_TEX=new Map();
// Tileable value noise: a lattice of g cells over the tile, smooth interpolation, wrapped at the edges.
function fpNoise(g,seed){const v=new Float32Array(g*g);for(let i=0;i<g*g;i++)v[i]=Krand(i,seed);
 return (x,y)=>{const X=x*g,Y=y*g,i=Math.floor(X),j=Math.floor(Y),fx=X-i,fy=Y-j,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),a=v[((j%g+g)%g)*g+((i%g+g)%g)],b=v[((j%g+g)%g)*g+(((i+1)%g+g)%g)],
  c=v[(((j+1)%g+g)%g)*g+((i%g+g)%g)],e=v[(((j+1)%g+g)%g)*g+(((i+1)%g+g)%g)];return a+(b-a)*sx+(c-a)*sy+(a-b-c+e)*sx*sy;};}
const FP_TEX_MAKE={
 // crêpe: fine vertical striations of uneven width, with soft horizontal crinkles
 crepe(n){const cols=new Float32Array(n);let x=0,k=0;while(x<n){const w=2+Math.floor(Krand(k,3)*4),v=.5+(Krand(k,5)-.5)*.55;for(let i=0;i<w&&x<n;i++,x++)cols[x]=v*(1-.35*Math.sin(i/w*Math.PI));k++;}
  const nz=fpNoise(8,11),cr=fpNoise(4,12);return i=>{const px=i%n,py=Math.floor(i/n),y=py/n,xx=px/n,band=Math.sin((y+cr(xx,y)*.08)*K_TAU*6);return cols[px]*.8+nz(xx,y)*.2+.03*band;};},
 // tissue: soft clouds of fibre, a little lighter here and there
 tissue(n){const a=fpNoise(4,21),b=fpNoise(16,22),c=fpNoise(64,23);return i=>{const x=(i%n)/n,y=Math.floor(i/n)/n;return .5+.3*(a(x,y)-.5)+.25*(b(x,y)-.5)+.18*(c(x,y)-.5);};},
 // card: a fine even grain with specks
 card(n){const b=fpNoise(32,31),c=fpNoise(128,32);return i=>{const x=(i%n)/n,y=Math.floor(i/n)/n,sp=Krand(i,33)>.996?-.25:0;return .55+.18*(b(x,y)-.5)+.3*(c(x,y)-.5)+sp;};},
 // watercolour: pigment pools with darker rims and granulation
 water(n){const a=fpNoise(4,41),b=fpNoise(12,42),c=fpNoise(96,43);return i=>{const x=(i%n)/n,y=Math.floor(i/n)/n,p=a(x,y)*.65+b(x,y)*.35,rim=Math.exp(-Math.pow((p-.52)/.035,2));return .62+.25*(p-.5)-.22*rim+.22*(c(x,y)-.5);};},
 // the paper of the walls and the ground: a coarse sheet
 wall(n){const a=fpNoise(8,51),b=fpNoise(32,52),c=fpNoise(128,53),f=fpNoise(256,54);return i=>{const x=(i%n)/n,y=Math.floor(i/n)/n,fib=Krand(i,55)>.992?(Krand(i,56)-.5)*.5:0;return .55+.1*(a(x,y)-.5)+.12*(b(x,y)-.5)+.2*(c(x,y)-.5)+.12*(f(x,y)-.5)+fib;};}
};
export function fpTexture(kind){if(FP_TEX.has(kind))return FP_TEX.get(kind);let cv=null;const make=FP_TEX_MAKE[kind],n=256;
 if(make){cv=escCanvas(n,n);const c=cv?.getContext?.('2d');if(c&&c.createImageData){const img=c.createImageData(n,n),dd=img.data,val=make(n);for(let i=0;i<n*n;i++){const v=Math.round(Kclamp(val(i))*255);dd[i*4]=dd[i*4+1]=dd[i*4+2]=v;dd[i*4+3]=255;}c.putImageData(img,0,0);}else cv=null;}
 FP_TEX.set(kind,cv);return cv;}
const FP_PAT=new WeakMap();
// A pattern of the texture for this context, turned along the angle a and scaled by k (screen pixels per texture pixel).
export function fpPattern(c,kind,a=0,k=1,x=0,y=0){const tex=fpTexture(kind);if(!tex||!c.createPattern)return null;let m=FP_PAT.get(c);if(!m){m=new Map();FP_PAT.set(c,m);}
 let p=m.get(kind);if(!p){p=c.createPattern(tex,'repeat');m.set(kind,p);}if(!p)return null;
 if(p.setTransform&&typeof DOMMatrix!=='undefined'){const co=Math.cos(a)*k,si=Math.sin(a)*k;p.setTransform(new DOMMatrix([co,si,-si,co,x,y]));}return p;}
// How each technique lies over the colour: blend mode and strength.
export const FP_TECH=Object.freeze({crepe:{op:'overlay',a:.55,k:1.3},tissue:{op:'soft-light',a:.55,k:.9},card:{op:'overlay',a:.4,k:.6},water:{op:'multiply',a:.32,k:.7}});

// ── The width profile of a petal ────────────────────────────────────────────────────────────────────────────────────────────
// u from the base (0) to the tip (1): the half width as a fraction of the widest part.
export function fpProfile(pr,u){const w0=pr.w0??.3,um=pr.um??.55;if(u<=um){const x=u/um;return w0+(1-w0)*Math.sin(x*Math.PI/2);}
 const x=Kclamp((u-um)/(1-um));switch(pr.tip){case 'point':return Math.pow(1-x,1.15)*(1+.25*x*(1-x));case 'blunt':case 'teeth':return Math.sqrt(Math.max(0,1-Math.pow(x,4)))*(1-.35*x);default:return Math.sqrt(Math.max(0,1-x*x));}}

// ── The geometry of one petal ───────────────────────────────────────────────────────────────────────────────────────────────
// B: the frame of the flower; q: the petal now ({th, phi, curl, cup, twist, len, wid, prof, r0, lift, rf, seed, crumple}).
// Returns the points along the spine and the two edges (flower units, 3D), the normals, and the tip.
export const FP_N=16;
export function fpPetal(B,q){const {A,e1,e2}=B,ct=Math.cos(q.th),st=Math.sin(q.th),r=fpAdd(fpSc(e1,ct),fpSc(e2,st)),s0=fpAdd(fpSc(e1,-st),fpSc(e2,ct));
 const N=FP_N,len=q.len,hwMax=q.wid*len,sp=[],L=[],R=[],nn=[],dd=[],hw=[],pr=q.prof||{},rf=q.rf||{},cr=(q.crumple||0);
 let P=fpAdd(fpSc(A,q.lift||0),fpSc(r,q.r0||0));
 for(let k=0;k<=N;k++){const u=k/N,al=q.phi+q.curl*Math.pow(u,1.4)+(cr?cr*.06*Math.sin(u*11+q.seed)*u:0),dv=fpAdd(fpSc(A,Math.cos(al)),fpSc(r,Math.sin(al)));
  if(k>0){const um=(k-.5)/N,am=q.phi+q.curl*Math.pow(um,1.4)+(cr?cr*.06*Math.sin(um*11+q.seed)*um:0);P=fpAdd(P,fpSc(fpAdd(fpSc(A,Math.cos(am)),fpSc(r,Math.sin(am))),len/N));}
  const tw=(q.twist||0)*u,n0=fpNorm(fpCross(dv,s0)),s=fpAdd(fpSc(s0,Math.cos(tw)),fpSc(n0,Math.sin(tw))),n=fpAdd(fpSc(n0,Math.cos(tw)),fpSc(s0,-Math.sin(tw)));
  const h=hwMax*fpProfile(pr,u),cup=(q.cup||0)*h*(1-.25*u);
  const wave=(side)=>{const a=(rf.a||0)+cr*(rf.crumple||0);if(!a)return 0;return a*h*(Math.sin(u*(rf.f||4)*Math.PI+q.seed*(side>0?1.3:2.1)+side)+cr*.5*Math.sin(u*((rf.f||4)+3)*Math.PI+q.seed+side*2))*Math.min(1,u*3);};
  sp.push(P);dd.push(dv);nn.push(n);hw.push(h);
  L.push(fpAdd(fpAdd(P,fpSc(s,h)),fpSc(n,cup+wave(1))));R.push(fpAdd(fpAdd(P,fpSc(s,-h)),fpSc(n,cup+wave(-1))));}
 // teeth across a blunt tip (the florets of the cornflower, the ligules of the daisy, the lip of the orchid)
 const tip=[];if(pr.tip==='teeth'){const k=pr.teeth||3,a=L[N],b=R[N],ext=fpSc(dd[N],hwMax*(pr.ext??.22));for(let i=1;i<2*k;i++){const f=i/(2*k),m=fpAdd(fpSc(a,1-f),fpSc(b,f));tip.push(i%2?fpAdd(m,ext):m);}}
 return {sp,L,R,nn,dd,hw,tip,s:s0,r};}

// ── Painting a petal ────────────────────────────────────────────────────────────────────────────────────────────────────────
// o: {x, y, R (pixels), col, back, tech, glow (0..1, the light from inside), dim (0..1 dark bud), rim (thin light contour colour or
// null), marks, white (base), line (contour strength)}. g: the geometry. Returns nothing.
const fpPX=(o,p)=>o.x+o.R*p[0],fpPY=(o,p)=>o.y+o.R*p[1];
export function fpOutline(o,g){const N=FP_N,pts=[[fpPX(o,g.sp[0]),fpPY(o,g.sp[0])]];for(let k=0;k<=N;k++)pts.push([fpPX(o,g.L[k]),fpPY(o,g.L[k])]);for(const t of g.tip)pts.push([fpPX(o,t),fpPY(o,t)]);
 for(let k=N;k>=0;k--)pts.push([fpPX(o,g.R[k]),fpPY(o,g.R[k])]);return pts;}
// The outline as a smooth closed curve (quadratic curves through the midpoints), shifted by (dx, dy).
export function fpPetalPath(o,g,dx=0,dy=0){const P=fpPath2D();const pts=fpOutline(o,g),n=pts.length;
 const m=i=>{const a=pts[i%n],b=pts[(i+1)%n];return [(a[0]+b[0])/2+dx,(a[1]+b[1])/2+dy];};let q=m(0);P.moveTo(q[0],q[1]);
 for(let i=1;i<=n;i++){const a=pts[i%n],e=m(i);P.quadraticCurveTo(a[0]+dx,a[1]+dy,e[0],e[1]);}P.closePath();return P;}
// A point inside the petal: u along it, v across (-1 right edge … 1 left edge).
export function fpAt(o,g,u,v){const N=FP_N,x=Kclamp(u)*N,k=Math.min(N-1,Math.floor(x)),f=x-k,lerp=(a,b)=>a+(b-a)*f;
 const sx=lerp(fpPX(o,g.sp[k]),fpPX(o,g.sp[k+1])),sy=lerp(fpPY(o,g.sp[k]),fpPY(o,g.sp[k+1])),ex=v>=0?lerp(fpPX(o,g.L[k]),fpPX(o,g.L[k+1])):lerp(fpPX(o,g.R[k]),fpPX(o,g.R[k+1])),ey=v>=0?lerp(fpPY(o,g.L[k]),fpPY(o,g.L[k+1])):lerp(fpPY(o,g.R[k]),fpPY(o,g.R[k+1]));
 const a=Math.abs(v);return [sx+(ex-sx)*a,sy+(ey-sy)*a];}
function fpFacing(n){return n[2];}
// How lit a surface is: the key light on the face we see, never quite black.
function fpLight(n){const f=n[2]>=0?n:fpSc(n,-1);return .42+.58*Math.max(0,fpDot(f,FP_KEY));}
export function fpPaintPetal(c,o,g){const P=fpPetalPath(o,g);if(!P)return;const N=FP_N,front=fpFacing(g.nn[Math.round(N*.55)])>=-.05,cols=front?o.col:(o.back||o.col.map(x=>fpShade(x,1.12)));
 const dim=o.dim||0,glow=o.glow||0;
 // a soft shadow of the petal on what lies behind it (paper has thickness and stands off the layer below)
 if(o.shadow!==0&&dim<.9){const k=o.R*.022*(o.shadow??1);c.fillStyle=`rgba(6,2,8,${(.2*(1-dim)).toFixed(3)})`;c.fill(fpPetalPath(o,g,k*.6,k));c.fillStyle=`rgba(6,2,8,${(.12*(1-dim)).toFixed(3)})`;c.fill(fpPetalPath(o,g,k*1.3,k*2));}
 // the colour at the base, the middle and the tip, each lit by its own normal and by the glow from inside (strongest at the base)
 const stop=(u,col)=>{const n=g.nn[Math.round(u*N)],k=fpLight(n)*(1+glow*.4*(1-u))*(1-dim*.82);return fpShade(col,Math.min(1.3,k));};
 const b=[fpPX(o,g.sp[0]),fpPY(o,g.sp[0])],t=[fpPX(o,g.sp[N]),fpPY(o,g.sp[N])];
 let fill=cols[1];if(c.createLinearGradient&&Math.hypot(t[0]-b[0],t[1]-b[1])>.5){const gr=c.createLinearGradient(b[0],b[1],t[0],t[1]);gr.addColorStop(0,stop(.06,cols[0]));gr.addColorStop(.45,stop(.45,cols[1]));gr.addColorStop(1,stop(.95,cols[2]));fill=gr;}
 c.fillStyle=fill;c.fill(P);
 // across the petal: the cupped edges turn towards or away from the key light
 const mi=Math.round(N*.55),Lm=[fpPX(o,g.L[mi]),fpPY(o,g.L[mi])],Rm=[fpPX(o,g.R[mi]),fpPY(o,g.R[mi])];
 if(c.createLinearGradient&&Math.hypot(Lm[0]-Rm[0],Lm[1]-Rm[1])>1.5){const n=g.nn[mi],cu=Math.min(1.2,Math.abs(o.cup??.5)+.15),nl=fpNorm(fpAdd(n,fpSc(g.s,-cu))),nr=fpNorm(fpAdd(n,fpSc(g.s,cu)));
  const el=fpLight(nl)-fpLight(n),er=fpLight(nr)-fpLight(n),gx=c.createLinearGradient(Lm[0],Lm[1],Rm[0],Rm[1]),tone=x=>x>0?`rgba(255,250,240,${Math.min(.4,x*.9*(1-dim)).toFixed(3)})`:`rgba(12,4,16,${Math.min(.28,-x*.9*(1-dim*.5)).toFixed(3)})`;
  gx.addColorStop(0,tone(el));gx.addColorStop(.5,'rgba(0,0,0,0)');gx.addColorStop(1,tone(er));c.fillStyle=gx;c.fill(P);}
 // folded card: the half on the far side of the midrib is in shade
 if(o.tech==='card'){const H=fpPath2D();H.moveTo(b[0],b[1]);for(let k=0;k<=N;k++)H.lineTo(fpPX(o,g.L[k]),fpPY(o,g.L[k]));for(let k=N;k>=0;k--)H.lineTo(fpPX(o,g.sp[k]),fpPY(o,g.sp[k]));H.closePath();
  const sl=fpDot(g.s,FP_KEY);c.fillStyle=sl>0?'rgba(255,248,236,.16)':'rgba(10,4,12,.2)';c.fill(H);}
 // the paper
 const T=FP_TECH[o.tech];if(T&&!o.plain){const ang=Math.atan2(t[1]-b[1],t[0]-b[0])+Math.PI/2,pat=fpPattern(c,o.tech,ang,T.k*Math.max(.5,o.R/220),b[0],b[1]);if(pat){c.save();c.globalCompositeOperation=T.op;c.globalAlpha=T.a*(1-dim*.6);c.fillStyle=pat;c.fill(P);c.restore();}}
 // the marks (blotch, veins, spots, the callus of the orchid, a coloured tip)
 if((o.marks&&o.marks.length||o.crumple>.02)&&dim<.95){c.save();c.clip(P);if(o.marks)for(const m of o.marks)if(front||m.k==='veins')fpMark(c,o,g,m,dim);if(o.crumple>.02)fpCreases(c,o,g,o.crumple);c.restore();}
 // the backlight through tissue paper: a light rim inside the edge
 if(o.tech==='tissue'&&glow>.05){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.22*glow;c.strokeStyle=cols[2];c.lineWidth=Math.max(1,o.R*.012);c.stroke(P);c.restore();}
 // the contour: dark (it separates the petals and keeps the flower visible on any background), or a thin light line on a dark bud
 c.lineJoin='round';c.strokeStyle=Krgba(fpShade(cols[0],.38),.75*(o.line??1));c.lineWidth=Math.max(.7,o.R*(o.white?.011:.0065));c.stroke(P);
 if(o.rim&&dim>.05){c.strokeStyle=Krgba(o.rim,.55*dim);c.lineWidth=Math.max(.8,o.R*.006);c.stroke(P);}}
// Creases of crumpled paper (the poppy in the bud): short light and dark folds across the petal, fading as it smooths out.
function fpCreases(c,o,g,k){c.lineWidth=Math.max(.8,o.R*.006);for(let i=0;i<9;i++){const u=.15+.8*Krand(i,61),v0=(Krand(i,62)-.5)*1.6,v1=v0+(Krand(i,63)-.5)*.9,a=fpAt(o,g,u,v0),b=fpAt(o,g,u+(Krand(i,64)-.5)*.2,v1);
 c.strokeStyle=`rgba(255,240,230,${(.3*k).toFixed(3)})`;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.strokeStyle=`rgba(20,0,6,${(.35*k).toFixed(3)})`;c.beginPath();c.moveTo(a[0]+1.2,a[1]+1.2);c.lineTo(b[0]+1.2,b[1]+1.2);c.stroke();}}
function fpMark(c,o,g,m,dim){const a=1-dim*.9;switch(m.k){
 case 'blotch':{const u=m.u||.25;c.beginPath();const pts=[];for(let i=0;i<=16;i++){const v=-.9+1.8*i/16;pts.push(fpAt(o,g,u*(1-.55*v*v)*(1+.08*Math.sin(i*1.7)),v));}c.moveTo(...fpAt(o,g,0,0));for(const p of pts)c.lineTo(p[0],p[1]);c.closePath();
  if(m.edge){c.strokeStyle=Krgba(m.edge,.45*a);c.lineWidth=Math.max(1,o.R*.012);c.stroke();}c.fillStyle=Krgba(m.col,.92*a);c.fill();break;}
 case 'veins':{c.strokeStyle=Krgba(m.col,(m.a??.2)*a);c.lineWidth=Math.max(.6,o.R*.004);const n=m.n||5;for(let i=0;i<n;i++){const v=-.8+1.6*(i+.5)/n;c.beginPath();for(let j=0;j<=10;j++){const u=.04+.86*j/10,p=fpAt(o,g,u,v*(.3+.7*Math.sin(Math.min(1,u*1.6)*Math.PI/2)));j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);}c.stroke();}break;}
 case 'spots':{const n=m.n||8;for(let i=0;i<n;i++){const u=.25+.5*Krand(i,7),v=(Krand(i,9)-.5)*1.1,p=fpAt(o,g,u,v),r=Math.max(.8,o.R*(.012+.01*Krand(i,13)));
  if(m.ring){c.fillStyle=Krgba(m.ring,.85*a);c.beginPath();c.arc(p[0],p[1],r*1.7,0,K_TAU);c.fill();}c.fillStyle=Krgba(m.col,.9*a);c.beginPath();c.arc(p[0],p[1],r,0,K_TAU);c.fill();}break;}
 case 'callus':{c.fillStyle=Krgba(m.col,.95*a);c.beginPath();const p0=fpAt(o,g,.05,0);c.moveTo(p0[0],p0[1]);for(let i=0;i<=8;i++){const v=-.4+.8*i/8,p=fpAt(o,g,.32*(1-.6*v*v),v);c.lineTo(p[0],p[1]);}c.closePath();c.fill();break;}
 case 'tip':{c.fillStyle=Krgba(m.col,.85*a);c.beginPath();const p0=fpAt(o,g,m.u||.7,-1);c.moveTo(p0[0],p0[1]);for(let i=0;i<=10;i++){const v=-1+2*i/10;const p=fpAt(o,g,(m.u||.7)+.04*Math.sin(i),v);c.lineTo(p[0],p[1]);}const t=fpAt(o,g,1,0);c.lineTo(t[0],t[1]);c.closePath();c.fill();break;}
 case 'throat':{const p0=fpAt(o,g,0,0),p1=fpAt(o,g,m.u||.35,0),gr=c.createLinearGradient(p0[0],p0[1],p1[0],p1[1]);gr.addColorStop(0,Krgba(m.col,.95*a));gr.addColorStop(1,Krgba(m.col,0));c.fillStyle=gr;c.fillRect(-1e5,-1e5,2e5,2e5);break;}
 }}
