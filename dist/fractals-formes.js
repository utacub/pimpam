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
 const A=n[lo],B=n[hi],t=B.s>A.s?(s-A.s)/(B.s-A.s):0;let da=B.a-A.a;if(da>Math.PI)da-=FR_TAU;if(da<-Math.PI)da+=FR_TAU;return {x:A.x+(B.x-A.x)*t,y:A.y+(B.y-A.y)*t,a:A.a+da*t,s,u};}
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
