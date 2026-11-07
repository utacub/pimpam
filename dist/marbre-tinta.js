// La nova Pluja de colors (CE03), 0.52 · the ink on the water: mathematical marbling.
// Every drop and every stroke is an exact function that moves every point of the ink (Lu, Jaffer, Jin, Zhao & Mao, 2012;
// Jaffer, «Dropping paint», «The mathematics of marbling»): the ink is never created or lost, only moved, which is what makes
// marbled paper look the way it does. The ink is a list of polygons (one for each drop) in bath units: the bath is 1 high and
// `a` (its aspect) wide. Operations are queued with the time they begin and how long they take; while one is under way its
// effect is applied to the polygons at its present strength (never stored), and when it ends it is applied once for good.
// Before an operation begins, every edge that the operation would stretch is cut in two (in the space before it), so the
// curves stay smooth while they move.

const MB_LN2=Math.LN2,MB_TRI=.94,MB_TRIN=Math.asin(MB_TRI);
const mbSmooth=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
export const mbEase=x=>x<=0?0:x>=1?1:1-Math.pow(1-x,3);
// the most vertices the ink may hold before the curves are cut more coarsely
export const MB_BUDGET=90000;

// every ink has its own number, so a picture kept of one is never shown for another
let MB_INK_UID=0;
export function mbInk(a=16/9){return {a,uid:++MB_INK_UID,polys:[],ops:[],seq:0,maxLen:.0032,verts:0,version:0,born:0};}
export const mbBusy=(ink,t)=>ink.ops.some(o=>o.begun&&t<o.t0+o.dur);

// ── One operation on one point. k is its strength now (0 nothing, 1 the whole of it); o.p is the out pair ──────────────
function mbMap(o,x,y,k,out){out[0]=x;out[1]=y;if(k<=0)return out;
 switch(o.kind){
 case 'drop':{const r=o.r*k,dx=x-o.cx,dy=y-o.cy,d2=dx*dx+dy*dy;if(d2<1e-14){out[0]=o.cx+r;out[1]=o.cy;return out;}const f=Math.sqrt(1+r*r/d2);out[0]=o.cx+dx*f;out[1]=o.cy+dy*f;return out;}
 case 'tine':{// a stylus or a comb drawn along M, starting at B and travelling L; the tip has passed a point when it is behind it
  const dx=x-o.bx,dy=y-o.by,s=dx*o.mx+dy*o.my,q=dx*o.nx+dy*o.ny,soft=o.soft,tip=k*(o.L+2*soft)-soft;
  const W=mbSmooth(s/soft+1)*mbSmooth((tip-s)/soft);if(W<=0)return out;
  let D=0,mx=o.mx,my=o.my;
  if(o.sp){// a comb: the three nearest tines (the others are too far to move the point); alternate tines may pull the other way
   // a zigzag is a triangle wave with its corners very slightly rounded (a sharp corner would tear the ink)
   const ph=s*o.fr+o.ph,sn=Math.sin(ph),wave=o.amp?o.amp*(o.tri?Math.asin(MB_TRI*sn)/MB_TRIN:sn):0,qq=q-wave-o.off,i=Math.round(qq/o.sp);
   for(let j=i-1;j<=i+1;j++){const d=Math.abs(qq-j*o.sp);D+=(o.alt&&(j&1)?-1:1)*Math.exp(-d*MB_LN2/o.w);}
   if(o.amp){const cs=Math.cos(ph),sl=o.amp*o.fr*(o.tri?MB_TRI*cs/Math.sqrt(1-MB_TRI*MB_TRI*sn*sn)/MB_TRIN:cs),n=Math.hypot(1,sl);mx=(o.mx+o.nx*sl)/n;my=(o.my+o.ny*sl)/n;}}
  else D=Math.exp(-Math.abs(q)*MB_LN2/o.w);
  D*=o.z*W;out[0]=x+D*mx;out[1]=y+D*my;return out;}
 case 'circle':{// a stylus drawn round a circle of radius r (or, with r 0, a vortex at the centre)
  const dx=x-o.cx,dy=y-o.cy,h=Math.sqrt(dx*dx+dy*dy);if(h<1e-9)return out;const d=o.r>0?Math.abs(h-o.r):h;let a=k*o.z*Math.exp(-d*MB_LN2/o.w)/Math.max(h,o.r>0?1e-6:o.w*.35);
  if(a>12.6)a=12.6;if(a<-12.6)a=-12.6;const c=Math.cos(a),sn=Math.sin(a);out[0]=o.cx+dx*c-dy*sn;out[1]=o.cy+dx*sn+dy*c;return out;}
 case 'shear':{// a breath of wind (a fan over the water): a wave that slides the rows (or the columns); it keeps the area
  if(o.axis==='x'){out[0]=x+k*o.amp*Math.sin(y*o.fr+o.ph);}else{out[1]=y+k*o.amp*Math.sin(x*o.fr+o.ph);}return out;}}
 return out;}

// The strength of an operation at time t (eased), and the operations that act now.
function mbK(o,t){if(t<o.t0)return 0;const x=(t-o.t0)/o.dur;return o.kind==='drop'?mbEase(x):o.kind==='tine'?Math.min(1,Math.max(0,x)):mbSmooth(x);}

// A new drop: a circle of colour col (its polygon exists from its own operation on, and grows with it).
function mbCircle(o,maxLen){const n=Math.max(48,Math.min(640,Math.ceil(2*Math.PI*o.r/maxLen))),p=new Array(2*n);
 for(let i=0;i<n;i++){const a=i/n*2*Math.PI;p[2*i]=o.cx+Math.cos(a)*o.r;p[2*i+1]=o.cy+Math.sin(a)*o.r;}return p;}

// Queue an operation: {kind, t0, dur, ...}. A drop also gives its colour (col) and adds its polygon when it begins.
export function mbQueue(ink,o){o.seq=++ink.seq;o.begun=false;ink.ops.push(o);return o;}

// What the chain of operations does to a point of a polygon born at `born`, each at its strength.
function mbChain(chain,born,x,y,out){out[0]=x;out[1]=y;for(const [o,k] of chain){if(o.seq<=born)continue;mbMap(o,out[0],out[1],k,out);}return out;}

// Cut the edges that the chain would stretch beyond maxLen (in view: an edge outside the bath stays long).
function mbRefine(ink,chain){const L=ink.maxLen,L2=L*L,a=ink.a,m=.12,P=[0,0],Q=[0,0],M=[0,0];let total=0;
 const inView=(x0,y0,x1,y1)=>!(Math.max(x0,x1)<-m||Math.min(x0,x1)>a+m||Math.max(y0,y1)<-m||Math.min(y0,y1)>1+m);
 for(const poly of ink.polys){const b=poly.p,n=b.length/2;if(!chain.some(([o])=>o.seq>poly.born)){total+=n;continue;}
  const mapped=new Array(b.length);for(let i=0;i<n;i++){mbChain(chain,poly.born,b[2*i],b[2*i+1],P);mapped[2*i]=P[0];mapped[2*i+1]=P[1];}
  const out=[];
  const split=(ax,ay,afx,afy,bx,by,bfx,bfy,depth)=>{const dx=bfx-afx,dy=bfy-afy;if(depth>=9||dx*dx+dy*dy<=L2||!inView(afx,afy,bfx,bfy))return;
   const mx=(ax+bx)/2,my=(ay+by)/2;mbChain(chain,poly.born,mx,my,M);const mfx=M[0],mfy=M[1];split(ax,ay,afx,afy,mx,my,mfx,mfy,depth+1);out.push(mx,my);split(mx,my,mfx,mfy,bx,by,bfx,bfy,depth+1);};
  for(let i=0;i<n;i++){const j=(i+1)%n;out.push(b[2*i],b[2*i+1]);split(b[2*i],b[2*i+1],mapped[2*i],mapped[2*i+1],b[2*j],b[2*j+1],mapped[2*j],mapped[2*j+1],0);}
  poly.p=out;total+=out.length/2;}
 ink.verts=total;if(total>MB_BUDGET)ink.maxLen*=1.3;}

// Apply an operation for good to every polygon born before it; then drop what has been pushed far out of the bath, and thin
// out vertices that have crowded together (where the ink was squeezed).
function mbCommit(ink,o){const P=[0,0],a=ink.a,m=.25,L=ink.maxLen*.3,L2=L*L;let total=0;
 ink.polys=ink.polys.filter(poly=>{if(poly.grow===o)poly.grow=null;
  if(poly.born<o.seq){const b=poly.p;for(let i=0;i<b.length;i+=2){mbMap(o,b[i],b[i+1],1,P);b[i]=P[0];b[i+1]=P[1];}mbMap(o,poly.cx,poly.cy,1,P);poly.cx=P[0];poly.cy=P[1];}
  const b=poly.p;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(let i=0;i<b.length;i+=2){const x=b[i],y=b[i+1];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1<-m||x0>a+m||y1<-m||y0>1+m)return false;
  if(b.length>256){const out=[b[0],b[1]];let lx=b[0],ly=b[1];for(let i=2;i<b.length-2;i+=2){const dx=b[i]-lx,dy=b[i+1]-ly;if(dx*dx+dy*dy<L2)continue;out.push(b[i],b[i+1]);lx=b[i];ly=b[i+1];}out.push(b[b.length-2],b[b.length-1]);if(out.length>=96)poly.p=out;}
  total+=poly.p.length/2;return true;});
 ink.verts=total;ink.version++;}

// Move the ink on to time t: operations whose time has come begin (and their polygons are cut ready for them), finished ones
// are applied for good, in order.
export function mbAdvance(ink,t){let changed=false;
 for(const o of ink.ops){if(o.begun||t<o.t0)continue;o.begun=true;changed=true;
  if(o.kind==='drop'){const poly={p:mbCircle(o,ink.maxLen),col:o.col,born:o.seq,grow:o,cx:o.cx,cy:o.cy,id:++ink.born};ink.polys.push(poly);}
  const chain=ink.ops.filter(x=>x.begun).map(x=>[x,1]);mbRefine(ink,chain);}
 while(ink.ops.length){const o=ink.ops[0];if(!o.begun||t<o.t0+o.dur)break;ink.ops.shift();mbCommit(ink,o);changed=true;}
 return changed;}

// The polygons as they are seen at time t: [{p (bath units), col, id}] (the stored ones when nothing is under way).
export function mbView(ink,t){const live=ink.ops.filter(o=>o.begun).map(o=>[o,mbK(o,t)]);if(!live.length)return ink.polys;const P=[0,0];
 return ink.polys.map(poly=>{const b=poly.p,n=b.length,out=new Array(n);let g=1;if(poly.grow){g=mbK(poly.grow,t);}
  for(let i=0;i<n;i+=2){let x=b[i],y=b[i+1];if(g<1){x=poly.cx+(x-poly.cx)*g;y=poly.cy+(y-poly.cy)*g;}mbChain(live,poly.born,x,y,P);out[i]=P[0];out[i+1]=P[1];}
  return {p:out,col:poly.col,id:poly.id};});}

// Where a point of the water (a drop's centre, say) has been carried by now: the committed operations have already moved the
// stored centres; this follows the ones under way.
export function mbFollow(ink,x,y,t){const live=ink.ops.filter(o=>o.begun).map(o=>[o,mbK(o,t)]);return mbChain(live,-1,x,y,[0,0]);}

// The area of a polygon (for the tests: the drops keep the area of the ink around them).
export function mbArea(p){let s=0;for(let i=0,n=p.length;i<n;i+=2){const j=(i+2)%n;s+=p[i]*p[j+1]-p[j]*p[i+1];}return Math.abs(s)/2;}
export {mbMap};
