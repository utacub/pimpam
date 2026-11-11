// Fractals a la natura (CE46, 0.74) · the common tools of the stimuli: a stimulus is a list of acts (each press runs one or more of
// them all, one after the other, see frGrowForm in fractals.js), and an act lays down segments that grow from a moment on. Live models (the snow crystals) also
// step on each frame and lay down their lines as they grow.
import {frSeg} from './fractals-motor.js';
export const FRF_TAU=Math.PI*2,FR_GOLD=Math.PI*(3-Math.sqrt(5));
// A polyline that grows from its first point at `speed` (scene units per second) from the moment t0. pts: [x, y, x, y, …].
// o: w0 w1 (width at the start and at the end), c0 c1 (place in the palette), lum, d0 (distance of the first point from the root)
// and the options of frSeg. Returns {t, d}: the moment it has finished growing and the distance from the root at its end.
export function frPath(S,pts,t0,speed,o={}){const n=pts.length/2;let L=0;for(let i=1;i<n;i++)L+=Math.hypot(pts[i*2]-pts[i*2-2],pts[i*2+1]-pts[i*2-1]);
 let acc=0,d=o.d0||0;const w0=o.w0??.002,w1=o.w1??w0,c0=o.c0??.5,c1=o.c1??c0,lum=o.lum??1,sp=Math.max(1e-4,speed);
 for(let i=1;i<n;i++){const x0=pts[i*2-2],y0=pts[i*2-1],x1=pts[i*2],y1=pts[i*2+1],l=Math.hypot(x1-x0,y1-y0);if(l<1e-7)continue;
  const u0=L?acc/L:0,u1=L?(acc+l)/L:1;frSeg(S.st,x0,y0,x1,y1,t0+acc/sp,l/sp,w0+(w1-w0)*u0,w0+(w1-w0)*u1,c0+(c1-c0)*u0,lum,d,d+l,o);acc+=l;d+=l;}
 return {t:t0+L/sp,d};}
// a closed loop (a floret, a petal, a bud) drawn from its start round to its start again
export function frLoop(S,cx,cy,rx,ry,rot,t0,dur,o={},n=10,start=0){const pts=[];for(let i=0;i<=n;i++){const a=start+i/n*FRF_TAU,x=Math.cos(a)*rx,y=Math.sin(a)*ry;pts.push(cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot));}
 let L=0;for(let i=1;i<=n;i++)L+=Math.hypot(pts[i*2]-pts[i*2-2],pts[i*2+1]-pts[i*2-1]);return frPath(S,pts,t0,L/Math.max(.05,dur),o);}
// an event for the music (a note of the chord at that moment): type, place across the screen (0–1), the moment
export function frEvent(S,type,x,at){S.evq.push({type,x:Math.max(0,Math.min(1,x/(S.AR||1.78))),at});}
// the turtle of an L-system-like branch: from (x, y) at angle a (0 = right, −π/2 = up)
export const frDir=(a,l)=>[Math.cos(a)*l,Math.sin(a)*l];

// A smooth curve grown by a turtle: from (x, y) at angle a (0 = right, π/2 = down: y grows downwards), length len in n steps, turning
// k(u) radians per unit of length at the fraction u of its length (k > 0 turns clockwise on the screen). Returns the points and, for
// each step, {x, y, a, s (length so far), u}.
export function frCurve(x,y,a,len,n,k){const pts=[x,y],nodes=[{x,y,a,s:0,u:0}],ds=len/n;let s=0;
 for(let i=1;i<=n;i++){const u=(i-.5)/n;a+=k(u)*ds*.5;x+=Math.cos(a)*ds;y+=Math.sin(a)*ds;a+=k(u)*ds*.5;s+=ds;pts.push(x,y);nodes.push({x,y,a,s,u:i/n});}
 return {pts,nodes,len};}
// a polyline grown in dur seconds (frPath grows it at a speed)
export function frGrow(S,pts,t0,dur,o={}){let L=0;for(let i=2;i<pts.length;i+=2)L+=Math.hypot(pts[i]-pts[i-2],pts[i+1]-pts[i-1]);return frPath(S,pts,t0,L/Math.max(.02,dur),o);}
// the point of a curve at the fraction u of its length (by arc length; the nodes need not be evenly spaced)
export function frAt(c,u){const n=c.nodes,s=Math.max(0,Math.min(1,u))*c.len;let lo=0,hi=n.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(n[m].s<=s)lo=m;else hi=m;}
 const A=n[lo],B=n[hi],t=B.s>A.s?(s-A.s)/(B.s-A.s):0;let da=B.a-A.a;if(da>Math.PI)da-=FRF_TAU;if(da<-Math.PI)da+=FRF_TAU;return {x:A.x+(B.x-A.x)*t,y:A.y+(B.y-A.y)*t,a:A.a+da*t,s,u};}
// A smooth curve through control points (Catmull–Rom), resampled every `step` units: {pts, nodes, len} as frCurve gives
export function frSpline(P,step=4){const raw=[];const n=P.length/2;
 for(let i=0;i<n-1;i++){const i0=Math.max(0,i-1),i2=i+1,i3=Math.min(n-1,i+2),seg=Math.max(4,Math.ceil(Math.hypot(P[i2*2]-P[i*2],P[i2*2+1]-P[i*2+1])/step*2));
  for(let k=0;k<seg;k++){const t=k/seg,t2=t*t,t3=t2*t,c=(a,b,cc,d)=>.5*(2*b+(-a+cc)*t+(2*a-5*b+4*cc-d)*t2+(-a+3*b-3*cc+d)*t3);
   raw.push(c(P[i0*2],P[i*2],P[i2*2],P[i3*2]),c(P[i0*2+1],P[i*2+1],P[i2*2+1],P[i3*2+1]));}}
 raw.push(P[n*2-2],P[n*2-1]);
 const pts=[raw[0],raw[1]];let s=0,acc=0;const nodes=[];
 for(let i=2;i<raw.length;i+=2){const l=Math.hypot(raw[i]-raw[i-2],raw[i+1]-raw[i-1]);acc+=l;if(acc>=step||i===raw.length-2){pts.push(raw[i],raw[i+1]);s+=acc;acc=0;}}
 for(let i=0,m=pts.length/2;i<m;i++){const j=Math.min(m-1,i+1),h=Math.max(0,i-1);nodes.push({x:pts[i*2],y:pts[i*2+1],a:Math.atan2(pts[j*2+1]-pts[h*2+1],pts[j*2]-pts[h*2]),s:0,u:0});}
 for(let i=1;i<nodes.length;i++)nodes[i].s=nodes[i-1].s+Math.hypot(nodes[i].x-nodes[i-1].x,nodes[i].y-nodes[i-1].y);
 const len=nodes[nodes.length-1].s;for(const q of nodes)q.u=len?q.s/len:0;return {pts,nodes,len};}
// a curve joined to another one (the points of b after those of a, its lengths going on)
export function frJoin(a,b){const nodes=a.nodes.concat(b.nodes.slice(1).map(q=>({...q,s:q.s+a.len})));const len=a.len+b.len;for(const q of nodes)q.u=q.s/len;return {pts:a.pts.concat(b.pts.slice(2)),nodes,len};}
// the time a curve grown at `speed` from t0 reaches its fraction u
export const frWhen=(c,u,t0,dur)=>t0+Math.max(0,Math.min(1,u))*dur;
// a closed outline around an axis curve c: half-width hw(u) on one side (hw2 on the other), from the base up one side and back down the other
export function frOutline(c,hw,n=12,hw2=hw){const L=[],R=[];for(let i=0;i<=n;i++){const q=frAt(c,i/n),w=hw(i/n),w2=hw2(i/n),nx=-Math.sin(q.a),ny=Math.cos(q.a);L.push(q.x+nx*w,q.y+ny*w);R.push(q.x-nx*w2,q.y-ny*w2);}
 const pts=[];for(let i=0;i<=n;i++)pts.push(L[i*2],L[i*2+1]);for(let i=n-1;i>=0;i--)pts.push(R[i*2],R[i*2+1]);return pts;}
// is a box of the frame (1672 × 941) out of sight (with a margin)?
export const frOut=(x,y,r=0)=>x<-r-40||x>1712+r||y<-r-40||y>981+r;
// a straight line cut into pieces about `step` long, so that its width can taper along it (each piece of the engine has one width)
export function frLine(S,x0,y0,x1,y1,t0,dur,o={},step=24){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.round(L/step)),p=[];for(let i=0;i<=n;i++)p.push(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n);return frPath(S,p,t0,L/Math.max(.02,dur),o);}
// a polyline whose every point has its own moment: point i is reached at ts[i]. o: as frPath, and cf(i) / wf(i), the colour and the
// width at point i (else c0 → c1 and w0 → w1 along it)
export function frPathT(S,pts,ts,o={}){const n=pts.length/2;let d=o.d0||0;const cf=o.cf||(i=>(o.c0??.5)+((o.c1??o.c0??.5)-(o.c0??.5))*i/Math.max(1,n-1)),wf=o.wf||(i=>(o.w0??1)+((o.w1??o.w0??1)-(o.w0??1))*i/Math.max(1,n-1));
 for(let i=1;i<n;i++){const x0=pts[i*2-2],y0=pts[i*2-1],x1=pts[i*2],y1=pts[i*2+1],l=Math.hypot(x1-x0,y1-y0);if(l<1e-6)continue;
  frSeg(S.st,x0,y0,x1,y1,ts[i-1],Math.max(.01,ts[i]-ts[i-1]),wf(i-1),wf(i),cf(i-1),o.lum??1,d,d+l,o);d+=l;}
 return d;}
// the pieces of a polyline that lie outside the circle (cx, cy, r): what is in front of a disc hides what is behind it
export function frClipOut(pts,cx,cy,r){const out=[];let cur=null;for(let i=0;i<pts.length;i+=2){const ok=Math.hypot(pts[i]-cx,pts[i+1]-cy)>=r;if(ok){if(!cur){cur=[];out.push(cur);}cur.push(pts[i],pts[i+1]);}else cur=null;}return out.filter(p=>p.length>=4);}
// The angle a turned towards the angle b by the fraction f (the short way round)
export const frTurn=(a,b,f)=>{let d=((b-a)%FRF_TAU+3*Math.PI)%FRF_TAU-Math.PI;return a+d*f;};
// A dendritic network grown order by order: a channel (pts) of order lv sprouts, on alternate sides, channels of the next order, and
// so on down to maxLv; all the channels of one order start together (o.T[lv] after t0), so the same branching is seen happening at
// every scale. o: W [width at the root of each order], C [[c0, c1] of each order], every [spacing of the daughters along a channel of
// each order], len [length of the channels of each order], spread (angle of the daughters), bias (x, y) → angle the daughters lean
// to, biasK, meander (bends per channel), T, dur, fork (the tips of the last orders fork in two), hot, sway, lum.
export function frDendrite(S,pts,lv,o,t0,d0=0){const k=S.k,R=S.rnd,n=pts.length/2,W=o.W[lv],C=o.C[lv],T=t0+o.T[lv]*k;
 let L=0;for(let i=1;i<n;i++)L+=Math.hypot(pts[i*2]-pts[i*2-2],pts[i*2+1]-pts[i*2-1]);
 const vis=pts.some((v,i)=>i%2===0&&!frOut(v,pts[i+1],0));
 if(vis)frPath(S,pts,T+(o.lag?.(pts[0],pts[1])||0)*k,L/Math.max(.05,o.dur[lv]*k),{w0:W,w1:Math.max(o.W[o.W.length-1],W*.62),c0:C[0],c1:C[1],lum:o.lum?.[lv]??1,d0,hot:o.hot??.8,sway:o.sway||0,seed:pts[0]*.01});
 if(lv>=o.maxLv)return;
 const ev=o.every[lv],m=o.meander??1.2;let acc=-ev*(.3+.5*R()),side=R()<.5?-1:1,s=0;
 const kid=(x,y,a,len)=>{const ph=R()*FRF_TAU,A=m*(.6+.8*R()),c=frCurve(x,y,a,len,Math.max(4,Math.round(len/7)),u=>A*Math.sin(u*FRF_TAU*.9+ph)/len);frDendrite(S,c.pts,lv+1,o,t0,d0+s);};
 for(let i=1;i<n;i++){const x0=pts[i*2-2],y0=pts[i*2-1],x1=pts[i*2],y1=pts[i*2+1],l=Math.hypot(x1-x0,y1-y0);s+=l;acc+=l;
  if(acc>=ev&&s<L*.97){acc=-ev*(R()-.5)*.5;side=-side;const a=Math.atan2(y1-y0,x1-x0);let ac=a+side*o.spread*(.75+.5*R());if(o.bias)ac=frTurn(ac,o.bias(x1,y1),o.biasK??.3);
   kid(x1,y1,ac,o.len[lv+1]*(.65+.7*R())*(1-.35*s/L));}}
 if(o.fork&&lv>=o.fork){const x=pts[n*2-2],y=pts[n*2-1],a=Math.atan2(y-pts[n*2-3],x-pts[n*2-4]);for(const sd of [-1,1])kid(x,y,a+sd*o.spread*.7,o.len[lv+1]*.55);}}

// ── Space colonization (Runions, Fuhrer, Lane, Federl, Rolland-Lagan & Prusinkiewicz, 2005; Runions, Lane & Prusinkiewicz, 2007) ──
// Points of attraction fill a region; the network grows from its roots one step D at a time towards the points that each node is the
// nearest to (within di), and a point dies when a node comes within dk of it. The networks of leaf veins, roots, rivers, corals and
// fungi come out of this one rule. Then: the Horton–Strahler order of every node (Horton, 1945; Strahler, 1957), the thickness by the
// pipe model (a parent carries what all its children carry: w^g = Σ w_child^g), and the network cut into streams, each of one order.
// roots [{x, y, a}] (a: the first direction), pts: Float32Array [x, y, …] of points of attraction. Returns {nodes, streams, top}.
export function frColonize(roots,pts,o={}){const D=o.D||9,di=o.di||70,dk=o.dk||D*1.6,maxIt=o.it||400,P=pts.length/2,alive=new Uint8Array(P).fill(1);
 const N=[];for(const r of roots)N.push({x:r.x,y:r.y,p:-1,dx:Math.cos(r.a??-Math.PI/2),dy:Math.sin(r.a??-Math.PI/2),k:[],root:N.length});
 // each point keeps its nearest node; only the new nodes of each step can change it (a grid of the points finds those near a node)
 const cs=di,GW=Math.ceil(2600/cs)+2,GH=Math.ceil(1900/cs)+2,cell=(x,y)=>Math.min(GH-1,Math.max(0,Math.floor((y+500)/cs)))*GW+Math.min(GW-1,Math.max(0,Math.floor((x+500)/cs)));
 const PG=Array.from({length:GW*GH},()=>null);for(let j=0;j<P;j++){const c=cell(pts[j*2],pts[j*2+1]);(PG[c]||(PG[c]=[])).push(j);}
 const near=new Int32Array(P).fill(-1),nd=new Float32Array(P).fill(1e9);
 const touch=i=>{const n=N[i],c0=cell(n.x,n.y);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=PG[c0+b*GW+a];if(!l)continue;
   for(const j of l){if(!alive[j])continue;const d=Math.hypot(pts[j*2]-n.x,pts[j*2+1]-n.y);if(d<dk){alive[j]=0;continue;}if(d<nd[j]){nd[j]=d;near[j]=i;}}}};
 N.forEach((_,i)=>touch(i));
 for(let it=0;it<maxIt;it++){const acc=new Map();
  for(let j=0;j<P;j++){if(!alive[j]||nd[j]>=di)continue;const i=near[j],x=pts[j*2],y=pts[j*2+1],bd=nd[j];let v=acc.get(i);if(!v)acc.set(i,v=[0,0,0]);v[0]+=(x-N[i].x)/bd;v[1]+=(y-N[i].y)/bd;v[2]++;}
  if(!acc.size)break;const fresh=[];
  for(const [i,v] of acc){const n=N[i];let dx=v[0]/v[2]+n.dx*(o.inertia??.3)+(o.pull?o.pull[0]:0),dy=v[1]/v[2]+n.dy*(o.inertia??.3)+(o.pull?o.pull[1]:0);const l=Math.hypot(dx,dy);if(l<1e-6)continue;dx/=l;dy/=l;
   N.push({x:n.x+dx*D,y:n.y+dy*D,p:i,dx,dy,k:[],root:n.root});n.k.push(N.length-1);fresh.push(N.length-1);}
  for(const i of fresh)touch(i);}
 // the order of every node (from the tips down), the thickness, the distance from the root
 const ord=new Int8Array(N.length),w=new Float32Array(N.length),g=o.g||2.4;
 for(let i=N.length-1;i>=0;i--){const k=N[i].k;if(!k.length){ord[i]=1;w[i]=1;continue;}let m=0,c=0,s=0;for(const j of k){if(ord[j]>m){m=ord[j];c=1;}else if(ord[j]===m)c++;s+=Math.pow(w[j],g);}ord[i]=c>1?m+1:m;w[i]=Math.pow(s,1/g);}
 const dist=new Float32Array(N.length);for(let i=0;i<N.length;i++)if(N[i].p>=0)dist[i]=dist[N[i].p]+D;
 // the streams: from each root, the child of the highest order (and then the thickest) carries the stream on; the others begin new ones
 const streams=[],todo=N.map((n,i)=>n.p<0?i:-1).filter(i=>i>=0).map(i=>({i,from:-1}));
 while(todo.length){const {i,from}=todo.pop(),s={o:ord[i],ids:from>=0?[from,i]:[i]};let c=i;
  for(;;){const k=N[c].k;if(!k.length)break;let b=k[0];for(const j of k)if(ord[j]>ord[b]||(ord[j]===ord[b]&&w[j]>w[b]))b=j;for(const j of k)if(j!==b)todo.push({i:j,from:c});if(ord[b]!==s.o&&o.split!==false){todo.push({i:b,from:c});break;}s.ids.push(b);c=b;}
  streams.push(s);}
 let top=0;for(const s of streams)top=Math.max(top,s.o);return {nodes:N,ord,w,dist,streams,top};}
// points of attraction scattered in a region: n tries in the box [x0, y0, x1, y1], kept where inside(x, y) (a density 0–1, or true)
export function frScatter(R,n,box,inside=()=>1){const out=[];for(let i=0;i<n;i++){const x=box[0]+R()*(box[2]-box[0]),y=box[1]+R()*(box[3]-box[1]),d=inside(x,y);if(d===true||R()<d)out.push(x,y);}return new Float32Array(out);}
// a colonized network drawn stream by stream: the streams of the highest order first, then each lower order all at once, each stream
// growing from where it leaves its parent. o: W (the width of the thickest), wMin, C(order fraction 0 = trunk … 1 = finest, u along)
// → palette place, step (the time between orders), dur, lum, sway, hot
export function frDrawNet(S,net,t0,o={}){const {nodes:N,w,dist,streams,top}=net,k=S.k,wMax=Math.max(...net.w),W=o.W||20,wMin=o.wMin||1,step=(o.step||.55)*k,dur=(o.dur||.7)*k;
 const smooth=p=>{for(let it=0;it<2;it++){if(p.length<6)break;const q=[p[0],p[1]];for(let i=0;i<p.length-2;i+=2){const ax=p[i],ay=p[i+1],bx=p[i+2],by=p[i+3];q.push(ax*.75+bx*.25,ay*.75+by*.25,ax*.25+bx*.75,ay*.25+by*.75);}q.push(p[p.length-2],p[p.length-1]);p=q;}return p;};
 const wid=i=>Math.max(wMin,W*Math.pow(w[i]/wMax,o.wExp??.75));
 for(const s of streams){if(s.ids.length<2)continue;const lvl=(top-s.o)/Math.max(1,top-1),T=t0+(top-s.o)*step+(o.lag?o.lag(N[s.ids[0]]):0)*k;
  const raw=[];for(const i of s.ids)raw.push(N[i].x,N[i].y);const pts=smooth(raw),n=pts.length/2,m=s.ids.length;
  if(!pts.some((v,j)=>j%2===0&&!frOut(v,pts[j+1],0)))continue;
  const ts=[],L=[0];for(let j=1;j<n;j++)L.push(L[j-1]+Math.hypot(pts[j*2]-pts[j*2-2],pts[j*2+1]-pts[j*2-1]));const tot=L[n-1]||1,d=dur*(o.durK?o.durK(s.o,top):1);for(let j=0;j<n;j++)ts.push(T+d*L[j]/tot);
  const at=j=>s.ids[Math.min(m-1,Math.round(j/(n-1)*(m-1)))];
  frPathT(S,pts,ts,{wf:j=>wid(at(j)),cf:j=>o.C(lvl,j/(n-1)),lum:o.lum?o.lum(lvl):1,d0:dist[s.ids[0]],hot:o.hot??.7,sway:o.sway||0,seed:pts[0]*.01});}
 return top;}

// ── Room to grow ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// A grid over the frame of the concept (cells of cs units) that remembers which branch holds each place, so that a branch that
// grows later turns aside from the ones already there (as real branches, roots and corals do: they grow where there is light, food
// or soil left). Places outside the frame (with a margin) count as taken.
export function frRoom(cs=9){const X0=-60,Y0=-60,GW=Math.ceil(1800/cs),GH=Math.ceil(1080/cs),o=new Int32Array(GW*GH).fill(-1);
 const at=(x,y)=>{const i=Math.floor((x-X0)/cs),j=Math.floor((y-Y0)/cs);return i<0||j<0||i>=GW||j>=GH?-1:j*GW+i;};
 return {cs,
  // a polyline holds the places within r of it (r: a number, or a function of the fraction along the line)
  mark(pts,r0,id){const m=pts.length/2-1;for(let i=0;i<pts.length-2;i+=2){const r=typeof r0==='function'?r0(i/2/Math.max(1,m)):r0,rr=Math.ceil(r/cs);const x0=pts[i],y0=pts[i+1],dx=pts[i+2]-x0,dy=pts[i+3]-y0,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/(cs*.5)));
    for(let s=0;s<=n;s++){const x=x0+dx*s/n,y=y0+dy*s/n,ci=Math.floor((x-X0)/cs),cj=Math.floor((y-Y0)/cs);
     for(let b=-rr;b<=rr;b++)for(let a=-rr;a<=rr;a++){const ii=ci+a,jj=cj+b;if(ii<0||jj<0||ii>=GW||jj>=GH)continue;const cx=X0+(ii+.5)*cs,cy=Y0+(jj+.5)*cs;if((cx-x)**2+(cy-y)**2<=r*r+cs*cs*.25)o[jj*GW+ii]=id;}}}},
  // the owner of a place (−1 free, −2 out of the frame)
  who(x,y,m=24){if(x<-m||y<-m||x>1672+m||y>941+m)return -2;const i=at(x,y);return i<0?-2:o[i];}};}
// A tree that finds its room: every branch forks in two at its end, the daughters shorter by a ratio and spread by an angle, and each
// one is laid where there is room: if its way is taken it turns aside (it tries other angles, nearest first); if there is no room
// anywhere it stays shorter, or is not born. All the branches of one order grow together (o.T(lv)), so the same fork is seen
// happening at every scale. The trees grow order by order all together (breadth first), so the big branches take their room first.
// seeds [{x, y, a, len, w, d (distance from the root), t (the earliest moment), s0 (the length near the start not checked)}].
// o: ratio, sp (the half angle of a fork), wr (the width ratio), minLen, depth, up (how much the branches bend upwards: 0–1), bend
// (random curvature), pad(lv) (the room kept round a branch), C(lv) → [c0, c1], T(lv), dur(lv), lum, hot, sway, R (randomness).
export function frTree(S,G,seeds,o){const R=o.R||S.rnd,k=S.k;let id=1e5;const tries=o.tries||[0,.22,-.22,.45,-.45,.7,-.7],out=[];
 let q=seeds.map(s=>({par:-1,...s,lv:0,id:id++}));
 for(let lv=0;lv<=o.depth&&q.length;lv++){const next=[];
  for(let i=q.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[q[i],q[j]]=[q[j],q[i]];}
  if(q.some(b=>b.pri))q.sort((a,b)=>(b.pri||0)-(a.pri||0));// the branches of a higher priority take their room first
  for(const b of q){const turn=(R()-.5)*2*(o.bend??.3),up=typeof o.up==='function'?o.up(lv):o.up??.25,s0=b.s0??Math.max(6,b.w*.8+o.pad(lv)+3);
   // the curve of an angle: a bend at random and a pull upwards (towards −π/2), spread along the branch
   // (the pull upwards bends the branch most near its start, as a lyre: it leaves its mother aside and then rises)
   const curve=(a,len)=>{let d=((-Math.PI/2-a)%FRF_TAU+3*Math.PI)%FRF_TAU-Math.PI;const K=(turn+d*up)/Math.max(1,len),ly=o.lyre??0;return frCurve(b.x,b.y,a,len,Math.max(2,Math.round(len/7)),u=>K*(1+ly*(1-2*u)));};
   const free=c=>{for(const q2 of c.nodes){if(o.inside&&q2.s>2&&!o.inside(q2.x,q2.y))return q2.s;if(q2.s<s0)continue;const w=G.who(q2.x,q2.y);if(w===-2||(w>=0&&w!==b.par&&w!==b.id&&w!==b.sib&&w!==b.gp))return q2.s;}return c.len;};
   let best=null;for(const da of tries){const c=curve(b.a+da,b.len),f=free(c);if(!best||f>best.f+4)best={c,f,a:b.a+da};if(f>=b.len*.98)break;}
   let len=best.f>=b.len*.98?b.len:best.f-o.pad(lv)-2;if(len<o.minLen*(lv?1:2))continue;
   const c=len===b.len?best.c:curve(best.a,len);G.mark(c.pts,b.w*.5+o.pad(lv),b.id);
   const e=c.nodes[c.nodes.length-1],wEnd=b.w*(b.wr??o.wr),T=Math.max(o.T(lv)*k+(o.t0||0),b.t??0),dur=o.dur(lv)*k,col=o.Cxy?[o.Cxy(b.x,b.y,lv),o.Cxy(e.x,e.y,lv)]:o.Cw?[o.Cw(b.w),o.Cw(wEnd)]:o.C(lv);
   frGrow(S,c.pts,T,dur,{w0:b.w,w1:wEnd,c0:col[0],c1:col[1],lum:o.lum?.(lv)??1,d0:b.d,hot:o.hot??.7,sway:o.sway||0,seed:b.x*.01});
   out.push({x:e.x,y:e.y,a:e.a,lv,len});
   if(lv>=o.depth||len*(o.mono?o.mono.rm:o.ratio)<o.minLen){
    // the last fork, a small Y at every tip (too small to need room)
    if(o.tipFork){const l=len*o.tipFork,T2=Math.max(o.T(lv+1)*k+(o.t0||0),T+dur*.9),c2=o.Cxy?[0,o.Cxy(e.x,e.y,lv+1)]:o.Cw?[o.Cw(wEnd*.8),o.Cw(wEnd*.6)]:(o.C(lv+1)||col);for(const sd of [-1,1]){const b2=e.a+sd*o.sp*(.8+.4*R());
     frLine(S,e.x,e.y,e.x+Math.cos(b2)*l*(.8+.4*R()),e.y+Math.sin(b2)*l*(.8+.4*R()),T2,dur*.7,{w0:wEnd*.94,w1:wEnd*.7,c0:c2[1],lum:o.lum?.(lv+1)??1,d0:b.d+len,hot:o.hot??.7,sway:o.sway||0,seed:b.x*.01},40);}}
    continue;}
   const sd=R()<.5?-1:1,i0=id;id+=2;for(const s of [sd,-sd]){const big=s===sd,M=o.mono;
    // a fork in two alike (dichotomous), or a stem that goes on with a side branch (monopodial: o.mono {rm, am, wm, rs, as, ws})
    const ang=M?(big?M.am:M.as):o.sp,rat=M?(big?M.rm:M.rs):o.ratio*(big?1.04:.9),wr=M?(big?M.wm:M.ws):o.wr;
    next.push({x:e.x,y:e.y,a:e.a+s*ang*(.75+.5*R()),len:len*rat*(.88+.24*R()),w:wEnd*(M?(big?1:M.ws/M.wm):.94),wr,d:b.d+len,t:T+dur*.92,id:big?i0:i0+1,sib:big?i0+1:i0,par:b.id,gp:b.par,pri:b.pri});}}
  q=next;}
 return out;}

// A point inside a closed polygon [x, y, …] (even–odd)?
export function frInPoly(P,x,y){let c=false;for(let i=0,n=P.length/2,j=n-1;i<n;j=i++){const yi=P[i*2+1],yj=P[j*2+1];if((yi>y)!==(yj>y)&&x<P[j*2]+(y-yj)/(yi-yj)*(P[i*2]-P[j*2]))c=!c;}return c;}
// The walls of a Voronoi tessellation of points scattered on a jittered grid (spacing sp) where inside(x, y): each wall once, as
// [x0, y0, x1, y1, xs, ys] (xs, ys: the seed of one of its two cells). The cells of leaf veins (areoles), of dried mud, of a
// honeycomb, of a giraffe's coat come out of this one rule: each place belongs to the nearest centre.
export function frVoronoi(R,box,sp,inside,jit=.85){const pts=[],gw=Math.ceil((box[2]-box[0])/sp)+1,gh=Math.ceil((box[3]-box[1])/sp)+1,cell=new Int32Array(gw*gh).fill(-1);
 for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){const x=box[0]+(i+.5+(R()-.5)*jit)*sp,y=box[1]+(j+.5+(R()-.5)*jit)*sp;if(!inside(x,y))continue;cell[j*gw+i]=pts.length/2;pts.push(x,y);}
 const out=[];for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){const a=cell[j*gw+i];if(a<0)continue;const ax=pts[a*2],ay=pts[a*2+1];
  // the cell of a: a square round it, cut by the half-planes of its neighbours; each side remembers who cut it
  let poly=[[ax-2*sp,ay-2*sp,-1],[ax+2*sp,ay-2*sp,-1],[ax+2*sp,ay+2*sp,-1],[ax-2*sp,ay+2*sp,-1]];
  for(let b2=-2;b2<=2;b2++)for(let a2=-2;a2<=2;a2++){if(!a2&&!b2)continue;const ii=i+a2,jj=j+b2;if(ii<0||jj<0||ii>=gw||jj>=gh)continue;const b=cell[jj*gw+ii];if(b<0)continue;
   const bx=pts[b*2],by=pts[b*2+1],mx=(ax+bx)/2,my=(ay+by)/2,nx=bx-ax,ny=by-ay,side=p=>(p[0]-mx)*nx+(p[1]-my)*ny,np=[];
   for(let k=0;k<poly.length;k++){const P=poly[k],Q=poly[(k+1)%poly.length],sp1=side(P),sq=side(Q);if(sp1<=0)np.push(P);
    if((sp1<=0)!==(sq<=0)){const t=sp1/(sp1-sq);np.push([P[0]+(Q[0]-P[0])*t,P[1]+(Q[1]-P[1])*t,sp1<=0?b:P[2]]);}}
   // the side that starts at a cut point carries the id of the neighbour that cut it
   poly=np;for(let k=0;k<poly.length;k++){const P=poly[k],Q=poly[(k+1)%poly.length];if(Math.abs(((P[0]+Q[0])/2-mx)*nx+((P[1]+Q[1])/2-my)*ny)<1e-6*(nx*nx+ny*ny)+1e-6)P[2]=b;}}
  for(let k=0;k<poly.length;k++){const P=poly[k],Q=poly[(k+1)%poly.length];if(P[2]>=0&&P[2]<a)continue;out.push([P[0],P[1],Q[0],Q[1],ax,ay,P[2]]);}}
 return {pts,walls:out};}

// A network traced from its concept picture (tools/fractals-traca.py), in the order it grows: paths, each one [n (+32768 when it ends
// in a free tip), x0, y0 (½ px, from −64), d0 (its distance from the root), t0 (ms), speed (px/s)] as u16 and its n points [dx, dy (½ px) as i8, width (0.1 px), colour (/255)] as
// u8. Unpacked once.
const FR_TRACED=new Map();
export function frTraced(b64){let P=FR_TRACED.get(b64);if(P)return P;P=[];const t=atob(b64),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);
 const dv=new DataView(u.buffer);let p=0;const v2=u.length>4&&dv.getUint16(0,true)===65535;if(v2)p=4;
 while(p+12<=u.length){const n0=dv.getUint16(p,true),n=n0&32767,tip=n0>32767;let x=dv.getUint16(p+2,true),y=dv.getUint16(p+4,true);const d0=dv.getUint16(p+6,true),t0=dv.getUint16(p+8,true)/1000,sp=dv.getUint16(p+10,true);p+=12;
  const b=v2?dv.getUint16(p,true)/1000:1;if(v2)p+=2;
  const pts=new Float32Array(n*2),w=new Float32Array(n),c=new Float32Array(n),ts=new Float32Array(n);let s=0;
  for(let i=0;i<n;i++,p+=4){x+=dv.getInt8(p);y+=dv.getInt8(p+1);pts[i*2]=x/2-64;pts[i*2+1]=y/2-64;w[i]=u[p+2]/10;c[i]=u[p+3]/255;
   if(i)s+=Math.hypot(pts[i*2]-pts[i*2-2],pts[i*2+1]-pts[i*2-1]);ts[i]=t0+s/sp;}
  P.push({pts,w,c,ts,d0,t0,tip,len:s,b});}
 FR_TRACED.set(b64,P);return P;}
// a free tip of a traced line carried on (the faint end that the tracing lost), narrowing to a point: o = [the most px, the share of
// the line's length]; the line keeps its pace
function frTipX(p,o){const n=p.w.length,x=p.pts[n*2-2],y=p.pts[n*2-1],dx=x-p.pts[n*2-4],dy=y-p.pts[n*2-3],l=Math.hypot(dx,dy)||1,
 e=Math.min(o[0],o[1]*p.len),v=p.len/Math.max(.02,p.ts[n-1]-p.ts[0]);
 const pts=new Float32Array(p.pts.length+2),w=new Float32Array(n+1),c=new Float32Array(n+1),ts=new Float32Array(n+1);
 pts.set(p.pts);w.set(p.w);c.set(p.c);ts.set(p.ts);pts[n*2]=x+dx/l*e;pts[n*2+1]=y+dy/l*e;w[n]=p.w[n-1]*(o[2]??.15);c[n]=p.c[n-1];ts[n]=p.ts[n-1]+e/v;
 return {...p,pts,w,c,ts,len:p.len+e};}
// Its drawing: every path grows point by point at its moment (scaled by the growth setting k) from t0; o: wk (width factor), wpow
// (widths pressed towards the thin ones: w^wpow), wmin, lum, lumw [the brightness of the finest lines, from the width w0 up to w1
// where it is whole], lumv [its brightness in the picture that is whole, a power, the least] (traced with lumv), hot, sway, under
// (see below), tipx (frTipX), taper, and fork: [length, half angle, levels, ratio, brightness] of the last small forks that every free
// tip makes (the finest orders, too fine to be traced from the picture), or none.
export function frDrawTraced(S,P,t0,o={}){const k=S.k,wk=o.wk??1,wm=o.wmin??0,wp=o.wpow??1,wx=o.wmax??1e9,R=S.rnd,W=w=>Math.min(wx,Math.max(wm,Math.pow(w,wp)*wk));
 for(let p of P){if(o.tipx&&p.tip&&p.w.length>1)p=frTipX(p,o.tipx);
  const ts=Array.from(p.ts,t=>t0+t*k),n=p.w.length,wa=p.w.reduce((a,b)=>a+b,0)/n,
  lum=(o.lum??1)*(o.lumw?Math.min(1,o.lumw[0]+(1-o.lumw[0])*Math.max(0,wa-o.lumw[1])/(o.lumw[2]-o.lumw[1])):1)*(o.lumv?Math.max(o.lumv[2]??0,Math.pow(Math.min(1,p.b/o.lumv[0]),o.lumv[1])):1),
  base={d0:p.d0,lum,hot:o.hot??.7,sway:o.sway??0,seed:p.pts[0]*.01};
  // under a wide line, a wider and dimmer one of a deeper colour: the glow at its edges (o.under: [the least mean width, the width
  // factor, its brightness, the shift of its colour, the least colour of the lines that have it (optional)])
  if(o.under&&wa>=o.under[0]&&(o.under[4]==null||p.c[0]>=o.under[4]))frPathT(S,p.pts,ts,{...base,lum:lum*o.under[2],hot:0,wf:i=>W(p.w[i])*o.under[1],cf:i=>Math.min(1,p.c[i]+o.under[3])});
  // (o.taper: a line that ends in a free tip narrows along its whole length to this share of its width)
  const tp=o.taper&&p.tip?(()=>{const a=new Float32Array(n);let s=0;for(let i=1;i<n;i++){s+=Math.hypot(p.pts[i*2]-p.pts[i*2-2],p.pts[i*2+1]-p.pts[i*2-1]);a[i]=s;}return i=>1-(1-o.taper)*a[i]/Math.max(1e-6,s);})():null;
  frPathT(S,p.pts,ts,{...base,wf:tp?i=>W(p.w[i])*tp(i):i=>W(p.w[i]),cf:i=>p.c[i]});
  if(o.fork&&p.tip&&n>1){const v=Math.max(40,p.len/Math.max(.05,p.ts[n-1]-p.ts[0]));
   // the forks of the forks: each level a Y smaller by o.fork[3] (o.fork[2] levels)
   const Y=(x,y,a,l,we,T,c,d,lv)=>{for(const sd of [-1,1]){const b=a+sd*o.fork[1]*(.7+.6*R()),L=l*(.75+.5*R()),x1=x+Math.cos(b)*L,y1=y+Math.sin(b)*L,dur=L/v*k;
    frLine(S,x,y,x1,y1,T,dur,{...base,lum:base.lum*(o.fork[4]??1),w0:we,w1:we*.6,c0:c,d0:d},40);if(lv>1)Y(x1,y1,b,l*(o.fork[3]??.6),we*.75,T+dur,Math.min(1,c+.04),d+L,lv-1);}};
   Y(p.pts[n*2-2],p.pts[n*2-1],Math.atan2(p.pts[n*2-1]-p.pts[n*2-3],p.pts[n*2-2]-p.pts[n*2-4]),o.fork[0],W(p.w[n-1])*.9,ts[n-1],Math.min(1,p.c[n-1]+.04),p.d0+p.len,o.fork[2]??1);}}}
