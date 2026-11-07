// Pinta el món (EN25), 0.38: the drawing tools of the ink sheets, and the ink itself. Everything is in the coordinates of the sheet
// (1280 × 800). A stroke is {pts, w, k} (k 'line', 'hatch' or 'dot'); a cut {cut: polygon} rubs out the ink behind it, so that the
// things in front hide what is behind them, as in a real drawing. The tools live in PTK (one name at the top level) and the sheets
// (pinta-terres.js) take them out of it.
import {tlRng} from './tauler.js';
export const PTK=(()=>{
 const rnd=tlRng,P=(...a)=>a;
 function smooth(pts,n=8,closed=false){const out=[],L=pts.length,g=i=>pts[closed?((i%L)+L)%L:Math.max(0,Math.min(L-1,i))];const segs=closed?L:L-1;
  for(let i=0;i<segs;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
  if(!closed)out.push(pts[L-1]);return out;}
 const circle=(cx,cy,r,n=24,ry=r,a0=0)=>Array.from({length:n},(_,i)=>{const a=a0+i/n*Math.PI*2;return [cx+Math.cos(a)*r,cy+Math.sin(a)*ry];});
 const arc=(cx,cy,r,a0,a1,n=12,ry=r)=>Array.from({length:n+1},(_,i)=>{const a=a0+(a1-a0)*i/n;return [cx+Math.cos(a)*r,cy+Math.sin(a)*ry];});
 function blob(cx,cy,r,seed,wob=.18,n=28,ry=r){const R=rnd(seed),ph=[R()*6.3,R()*6.3,R()*6.3];return Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2,k=1+wob*(.6*Math.sin(2*a+ph[0])+.3*Math.sin(3*a+ph[1])+.2*Math.sin(5*a+ph[2]));return [cx+Math.cos(a)*r*k,cy+Math.sin(a)*ry*k];});}
 const shift=(pts,dx,dy)=>pts.map(([x,y])=>[x+dx,y+dy]),scale=(pts,cx,cy,k,ky=k)=>pts.map(([x,y])=>[cx+(x-cx)*k,cy+(y-cy)*ky]),rev=pts=>pts.slice().reverse(),lerp=(a,b,t)=>a+(b-a)*t,mixp=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
 // A scalloped outline (crowns, clouds): bumps outwards of size bump, uneven; below onlyAbove it stays smooth.
 function scallop(pts,bump,seed,n=5,onlyAbove=null){const out=[],L=pts.length,R=rnd(seed);let cx=0,cy=0;for(const p of pts){cx+=p[0]/L;cy+=p[1]/L;}
  for(let i=0;i<L;i++){const a=pts[i],b=pts[(i+1)%L],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;let nx=-dy/len,ny=dx/len;if((mx-cx)*nx+(my-cy)*ny<0){nx=-nx;ny=-ny;}
   const h=bump*(.45+1.1*R()),m=Math.max(2,Math.round(n*(.6+.8*R())));const flat=onlyAbove!==null&&my>onlyAbove;for(let k=0;k<m;k++){const t=k/m,s=flat?0:Math.sin(Math.PI*t)*h;out.push([a[0]+dx*t+nx*s,a[1]+dy*t+ny*s]);}}
  return out;}
 // Hatching inside a polygon: parallel lines at angle a, sp apart, clipped by the polygon. Returns strokes.
 function hatch(poly,a,sp,seed,w=1,jit=.35,k='hatch'){const ca=Math.cos(a),sa=Math.sin(a),R=rnd(seed),out=[];
  const proj=poly.map(([x,y])=>-x*sa+y*ca),lo=Math.min(...proj),hi=Math.max(...proj);
  for(let d=lo+sp*(.3+.4*R());d<hi;d+=sp*(1+jit*(R()-.5))){const xs=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],pp=-p[0]*sa+p[1]*ca,pq=-q[0]*sa+q[1]*ca;if((pp<=d)!==(pq<=d)){const t=(d-pp)/(pq-pp);xs.push(p[0]*ca+p[1]*sa+((q[0]*ca+q[1]*sa)-(p[0]*ca+p[1]*sa))*t);}}
   xs.sort((u,v)=>u-v);for(let i=0;i+1<xs.length;i+=2){const u0=xs[i]+2*R(),u1=xs[i+1]-2*R();if(u1-u0<4)continue;const seg=[];const n=Math.max(2,Math.round((u1-u0)/14));for(let j=0;j<=n;j++){const u=u0+(u1-u0)*j/n,wob=(R()-.5)*1.2;seg.push([u*ca-d*sa+wob*sa,u*sa+d*ca-wob*ca]);}out.push({pts:seg,w,k});}}
  return out;}
 const rect=(x,y,w,h)=>[P(x,y),P(x+w,y),P(x+w,y+h),P(x,y+h)];
 // The list of strokes: st(pts,w,k); st.cut(poly) cuts what is behind; st.add(strokes).
 function Ink(){const S=[];const st=(pts,w=2.2,k='line')=>{if(pts&&pts.length>1)S.push({pts,w,k});return pts;};st.list=S;st.add=arr=>{for(const s of arr)S.push(s);};st.cut=poly=>{if(poly&&poly.length>2)S.push({cut:poly});return poly;};return st;}
 // ── Elements ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 // A village house in a slight perspective: the front (x, y: bottom left corner; w, h) and the side (depth to the right, rising ky).
 // Returns {acc: polygons of the accent colour (the roof), sil: the silhouette (for the zone and the cut)}.
 function house(st,x,y,w,h,o={}){const d=o.depth??w*.42,ky=o.ky??-.18,r=o.roof??h*.42,ov=o.over??6,R=rnd(o.seed??1);const acc=[];
  const A=P(x,y),B=P(x+w,y),C=P(x+w,y-h),D=P(x,y-h),E=P(x+w+d,y+d*ky),F=P(x+w+d,y-h+d*ky);let sil;
  if(o.gable){const T=P(x+w/2,y-h-r),T2=P(x+w/2+d,y-h-r+d*ky);sil=[A,B,E,P(x+w+d+ov,y-h+d*ky),T2,T,P(x-ov,y-h)];st.cut(sil);
   st([A,B,C,D,A],2.2);st([B,E,F,C],2);st([P(x-ov,y-h),T,P(x+w+ov,y-h)],2.6);st([T,T2],2.4);st([P(x+w+ov,y-h),P(x+w+d+ov,y-h+d*ky)],2.4);st([T2,P(x+w+d+ov,y-h+d*ky)],2.4);
   acc.push([T,T2,P(x+w+d+ov,y-h+d*ky),P(x+w+ov,y-h)]);for(let i=1;i<5;i++){const t=i/5;st([mixp(T,P(x+w+ov,y-h),t),mixp(T2,P(x+w+d+ov,y-h+d*ky),t)],1,'hatch');}}
  else{const rL=P(x-ov,y-h-r*.1),rR=P(x+w+ov,y-h-r*.1),tL=P(x-ov+w*.1,y-h-r),tR=P(x+w+ov-w*.1,y-h-r),sR=P(x+w+d+ov,y-h+d*ky-r*.1),sT=P(x+w+d-w*.1,y-h+d*ky-r);sil=[A,B,E,sR,sT,tR,tL,rL];st.cut(sil);
   st([A,B,C,D,A],2.2);st([B,E,F,C],2);st([rL,rR],2.4);st([tL,tR],2.4);st([rL,tL],2);st([rR,tR],2);acc.push([rL,rR,tR,tL]);
   for(let i=1;i<6;i++){const t=i/6;st([mixp(rL,tL,t),mixp(rR,tR,t)],1,'hatch');}
   st([rR,sR],2);st([tR,sT],1.8);st([sR,sT],1.8);acc.push([rR,sR,sT,tR]);}
  if(o.chimney!==false){const cx=x+w*(.62+.2*R()),top=y-h-r*.95;st([P(cx,top+r*.45),P(cx,top),P(cx+w*.09,top),P(cx+w*.09,top+r*.35)],1.8);}
  const cols=Math.max(1,Math.round(w/44)),rows=h>70?2:1,win=[];
  for(let r2=0;r2<rows;r2++)for(let c2=0;c2<cols;c2++){const wx=x+w*(c2+.5)/cols-9,wy=y-h*(rows===2?(r2===0?.78:.42):.6),ww=18,wh=20;if(rows===2&&r2===1&&c2===Math.floor(cols/2))continue;win.push(rect(wx,wy,ww,wh));
   st([P(wx,wy),P(wx+ww,wy),P(wx+ww,wy+wh),P(wx,wy+wh),P(wx,wy)],1.3);st([P(wx+ww/2,wy),P(wx+ww/2,wy+wh)],.9,'hatch');st([P(wx,wy+wh/2),P(wx+ww,wy+wh/2)],.9,'hatch');
   if(R()<.6){st([P(wx-6,wy),P(wx-6,wy+wh)],1.2);st([P(wx+ww+6,wy),P(wx+ww+6,wy+wh)],1.2);}}
  const dx=x+w*.5-9,dh=h*.36;st([P(dx,y),P(dx,y-dh+6),...arc(dx+9,y-dh+6,9,Math.PI,2*Math.PI,8),P(dx+18,y)],1.5);
  if(o.sideWindow!==false&&d>24){const wx=x+w+d*.35,wy=y-h*.6+d*ky*.4;st([P(wx,wy),P(wx+12,wy+d*ky*.25),P(wx+12,wy+18+d*ky*.25),P(wx,wy+18),P(wx,wy)],1.2);}
  return {acc,sil,win,box:[x,y,w,h],chimney:o.chimney===false?null:P(x+w*.72,y-h-r*.95)};}
 // A bell tower with its nave: a square tower with arched windows, a pyramid roof and a cross; the nave to the right with an apse.
 function church(st,x,y,w,h,o={}){const acc=[];const d=o.depth??w*.6,ky=-.16;const T=P(x+w/2+d/2,y-h-w*.85+d*ky/2);
  const nx=x+w+d,nw=w*1.5,nh=h*.5,ny=y+d*ky,rt=P(nx+nw,ny-nh-nh*.5+nw*ky*.4),ax=nx+nw,ay=ny+nw*ky*.4;
  const sil=[P(x,y),P(x,y-h),P(x-4,y-h),T,P(x+w+d+4,y-h+d*ky),P(nx,ny-nh-nh*.5),rt,...arc(ax,ay-nh*.5,nh*.5,-Math.PI/2,Math.PI/2,8,nh*.5),P(nx,ny)];st.cut(sil);
  st([P(x,y),P(x,y-h),P(x+w,y-h),P(x+w,y)],2.6);st([P(x+w,y-h),P(x+w+d,y-h+d*ky),P(x+w+d,y+d*ky)],2.2);
  st([P(x-4,y-h),T,P(x+w+4,y-h)],2.6);st([P(x+w+4,y-h),P(x+w+d+4,y-h+d*ky),T],2.2);acc.push([P(x-4,y-h),T,P(x+w+d+4,y-h+d*ky),P(x+w+4,y-h)]);
  for(const dy of [h*.8,h*.52]){const cx=x+w/2,r=w*.2;st([P(cx-r,y-dy+r*1.4),...arc(cx,y-dy,r,Math.PI,2*Math.PI,10),P(cx+r,y-dy+r*1.4)],1.5);st([P(cx,y-dy-r*.2),P(cx,y-dy+r*1.3)],1,'hatch');}
  st([P(T[0],T[1]),P(T[0],T[1]-18)],1.6);st([P(T[0]-6,T[1]-12),P(T[0]+6,T[1]-12)],1.6);
  if(o.nave!==false){st([P(nx,ny),P(nx+nw,ny+nw*ky*.4),P(nx+nw,ny-nh+nw*ky*.4)],2);st([P(nx,ny-nh),P(nx+nw,ny-nh+nw*ky*.4)],2);
   st([P(nx,ny-nh-nh*.5),rt],2.2);st([P(nx,ny-nh-nh*.5),P(nx,ny-nh)],2);acc.push([P(nx,ny-nh-nh*.5),rt,P(nx+nw,ny-nh+nw*ky*.4),P(nx,ny-nh)]);
   for(let i=1;i<4;i++){const t=i/4;st([mixp(P(nx,ny-nh-nh*.5),P(nx,ny-nh),t),mixp(rt,P(nx+nw,ny-nh+nw*ky*.4),t)],1,'hatch');}
   st(arc(ax,ay-nh*.5,nh*.5,-Math.PI/2,Math.PI/2,10,nh*.5),2);st([P(ax,ay-nh*.85),...arc(ax,ay-nh*.5,nh*.38,-Math.PI/2,Math.PI/2,8,nh*.38)],1.6);}
  return {acc,sil,bell:P(x+w/2,y-h*.8),top:T};}
 // Trees. They return {acc (the trunk), sil (the silhouette: crown and trunk)}.
 function oak(st,x,y,r,seed){const R=rnd(seed),c=scallop(blob(x,y-r*1.05,r,seed,.14,18,r*.8),r*.16,seed,5,y-r*.95),trunk=[P(x-r*.12,y+2),P(x+r*.12,y+2),P(x+r*.1,y-r*.5),P(x-r*.1,y-r*.5)];st.cut(c);st.cut(trunk);
  st([...c,c[0]],2.2);for(let i=0;i<3;i++){const cx=x+(R()-.5)*r*.9,cy=y-r*1.05+(R()-.5)*r*.7,rr=r*(.25+.2*R());st(arc(cx,cy,rr,Math.PI*1.05,Math.PI*1.95,7,rr*.8),1.2,'hatch');}
  st([P(x-r*.11,y),P(x-r*.1,y-r*.3),P(x-r*.3,y-r*.65)],2.4);st([P(x+r*.11,y),P(x+r*.08,y-r*.3),P(x+r*.26,y-r*.6)],2.4);st([P(x-r*.05,y-r*.3),P(x,y-r*.75)],1.8);
  st([P(x-r*.3,y+2),P(x-r*.11,y)],1.4);st([P(x+r*.11,y),P(x+r*.3,y+3)],1.4);return {acc:[trunk],sil:c,sil2:trunk,crown:P(x,y-r*1.05),r};}
 function poplar(st,x,y,h,seed){const R=rnd(seed),c=scallop(blob(x,y-h*.56,h*.11,seed,.1,16,h*.46),h*.03,seed,4,y-h*.14),trunk=[P(x-3,y),P(x+3,y),P(x+2,y-h*.13),P(x-2,y-h*.13)];st.cut(c);st.cut(trunk);st([...c,c[0]],2);st([P(x,y),P(x,y-h*.12)],2.4);
  for(let i=0;i<4;i++){const yy=y-h*(.25+.15*i);st([P(x-h*.02,yy),P(x+(R()-.5)*h*.1,yy-h*.08)],1,'hatch');}return {acc:[trunk],sil:c,sil2:trunk,crown:P(x,y-h*.56)};}
 function pine(st,x,y,h,seed){const R=rnd(seed),pts=[P(x,y-h)];const n=5;for(let i=1;i<=n;i++){const t=i/n,w=h*.14*t*(1+.2*(R()-.5)),yy=y-h+h*.78*t;pts.push(P(x+w,yy),P(x+w*.55,yy));}
  const left=[];for(let i=n;i>=1;i--){const t=i/n,w=h*.14*t*(1+.2*(R()-.5)),yy=y-h+h*.78*t;left.push(P(x-w*.55,yy),P(x-w,yy));}const c=[...pts,...left];st.cut(c);st([...c,c[0]],2);st([P(x,y),P(x,y-h*.22)],2.4);return {acc:[c],sil:c,top:P(x,y-h)};}
 // A fir: a tall narrow cone of drooping layers, for the high mountain.
 function fir(st,x,y,h,seed){const R=rnd(seed),n=7,right=[P(x,y-h)],left=[];for(let i=1;i<=n;i++){const t=i/n,w=h*.17*Math.pow(t,.85)*(1+.15*(R()-.5)),yy=y-h+h*.84*t;right.push(P(x+w*.4,yy-h*.03),P(x+w,yy+h*.012),P(x+w*.5,yy));}
  for(let i=n;i>=1;i--){const t=i/n,w=h*.17*Math.pow(t,.85)*(1+.15*(R()-.5)),yy=y-h+h*.84*t;left.push(P(x-w*.5,yy),P(x-w,yy+h*.012),P(x-w*.4,yy-h*.03));}
  const c=[...right,...left];st.cut(c);st([...c,c[0]],1.9);st([P(x,y),P(x,y-h*.16)],2.4);for(let i=1;i<n;i+=2){const yy=y-h+h*.84*(i/n);st([P(x-h*.03,yy-h*.05),P(x,yy-h*.11)],1,'hatch');}return {acc:[c],sil:c,top:P(x,y-h)};}
 // A stone pine (Mediterranean): a broad umbrella crown on a leaning trunk.
 function stonePine(st,x,y,h,seed,lean=.15){const R=rnd(seed),tx=x+h*lean,c=scallop(blob(tx,y-h*.82,h*.42,seed,.12,20,h*.2),h*.05,seed,5,y-h*.72),trunk=[P(x-h*.045,y+2),P(x+h*.045,y+2),P(tx+h*.03,y-h*.62),P(tx-h*.03,y-h*.62)];st.cut(c);st.cut(trunk);
  st([...c,c[0]],2.2);for(let i=0;i<4;i++){const cx=tx+(R()-.5)*h*.6,cy=y-h*.82+(R()-.5)*h*.14,rr=h*(.08+.06*R());st(arc(cx,cy,rr,Math.PI*1.05,Math.PI*1.95,6,rr*.5),1.1,'hatch');}
  st([P(x-h*.045,y),P(tx-h*.03,y-h*.62),P(tx-h*.12,y-h*.74)],2.4);st([P(x+h*.045,y),P(tx+h*.03,y-h*.62),P(tx+h*.14,y-h*.72)],2.4);st([P(tx,y-h*.6),P(tx+h*.02,y-h*.76)],1.6);return {acc:[trunk],sil:c,sil2:trunk,crown:P(tx,y-h*.82)};}
 // A plane tree (city): a tall rounded crown on a straight pale trunk.
 function plane(st,x,y,h,seed){const R=rnd(seed),c=scallop(blob(x,y-h*.66,h*.3,seed,.12,20,h*.34),h*.045,seed,5,y-h*.4),trunk=[P(x-h*.035,y+2),P(x+h*.035,y+2),P(x+h*.03,y-h*.4),P(x-h*.03,y-h*.4)];st.cut(c);st.cut(trunk);
  st([...c,c[0]],2.1);st([P(x-h*.035,y),P(x-h*.03,y-h*.4),P(x-h*.12,y-h*.55)],2.3);st([P(x+h*.035,y),P(x+h*.03,y-h*.4),P(x+h*.12,y-h*.55)],2.3);st([P(x,y-h*.4),P(x,y-h*.7)],1.6);
  for(let i=0;i<3;i++){const yy=y-h*(.08+.1*i);st([P(x-h*.03,yy),P(x+h*.03,yy-h*.02)],1,'hatch');}return {acc:[trunk],sil:c,sil2:trunk,crown:P(x,y-h*.66)};}
 // A beech: a wide dome-shaped crown with a smooth grey trunk.
 function beech(st,x,y,r,seed){const R=rnd(seed),c=scallop(blob(x,y-r*1.1,r,seed,.1,20,r*.9),r*.12,seed,6,y-r*.9),trunk=[P(x-r*.1,y+2),P(x+r*.1,y+2),P(x+r*.08,y-r*.6),P(x-r*.08,y-r*.6)];st.cut(c);st.cut(trunk);
  st([...c,c[0]],2);for(let i=0;i<4;i++){const cx=x+(R()-.5)*r*1.2,cy=y-r*1.1+(R()-.5)*r*.9,rr=r*(.2+.2*R());st(arc(cx,cy,rr,Math.PI*1.1,Math.PI*1.9,6,rr*.7),1.1,'hatch');}
  st([P(x-r*.1,y),P(x-r*.08,y-r*.5),P(x-r*.3,y-r*.85)],2.2);st([P(x+r*.1,y),P(x+r*.07,y-r*.5),P(x+r*.28,y-r*.8)],2.2);st([P(x,y-r*.5),P(x,y-r*.95)],1.6);return {acc:[trunk],sil:c,sil2:trunk,crown:P(x,y-r*1.1),r};}
 function cypress(st,x,y,h,seed){const c=scallop(blob(x,y-h*.5,h*.07,seed,.08,14,h*.5),h*.012,seed,3,y-h*.05);st.cut(c);st([...c,c[0]],1.8);return {acc:[c],sil:c,top:P(x,y-h)};}
 function bush(st,x,y,r,seed){const c=scallop(blob(x,y-r*.6,r,seed,.15,12,r*.6),r*.2,seed,4,y-r*.2);st.cut(c);st([...c,c[0]],1.6);return {acc:[],sil:c};}
 // A cloud: a cumulus with a scalloped top and a flat base; only the top edge is drawn, as in a sketch.
 function cloud(st,x,y,w,h,seed){const base=blob(x,y,w/2,seed,.12,22,h/2),c=scallop(base,h*.2,seed,5,y+h*.08);const n=c.length,from=Math.floor(n*.55),to=Math.floor(n*.96);st(c.slice(from,to),1.5);return c;}
 const cloudShape=(x,y,w,h,seed)=>scallop(blob(x,y,w/2,seed,.12,22,h/2),h*.2,seed,5,y+h*.08);
 // A stone bridge over the river: x0..x1 at height y, slope k. Returns {acc, sil}.
 function bridge(st,x0,x1,y,k=0,o={}){const n=o.arches??2,acc=[];const top=x=>y+(x-x0)*k;const deck=[P(x0-14,top(x0-14)-8),P(x1+14,top(x1+14)-8),P(x1+14,top(x1+14)+10),P(x0-14,top(x0-14)+10)];
  const span=(x1-x0)/n,arcs=[];for(let i=0;i<n;i++){const cx=x0+span*(i+.5),r=span*.4;arcs.push({cx,r,a:arc(cx,top(cx)+12,r,Math.PI,2*Math.PI,14,r*.8)});}
  const sil=[P(x0-14,top(x0-14)-8),P(x1+14,top(x1+14)-8),P(x1+14,top(x1+14)+30),P(x0-14,top(x0-14)+30)];st.cut(sil);
  st([deck[0],deck[1]],3);st([deck[3],deck[2]],2.2);
  for(let i=0;i<n;i++){const {a}=arcs[i];st(a,2.4);st(shift(a,0,9).slice(2,13),1.2,'hatch');if(i<n-1){const px=x0+span*(i+1);st([P(px-7,top(px)+12),P(px-7,top(px)+30)],2);st([P(px+7,top(px)+12),P(px+7,top(px)+30)],2);}}
  for(let i=0;i<Math.round((x1-x0)/26);i++){const x=x0+i*26;st([P(x,top(x)-7),P(x,top(x)+9)],1,'hatch');}
  acc.push(deck);return {acc,sil,deck:P((x0+x1)/2,top((x0+x1)/2)-8)};}
 function scarecrow(st,x,y,s=1){const body=[P(x-14*s,y-110*s),P(x-20*s,y-60*s),P(x+22*s,y-60*s),P(x+14*s,y-110*s)],hd=circle(x,y-124*s,14*s,18);st.cut(body);st.cut(hd);
  st([P(x,y),P(x,y-60*s)],2.6);st([P(x-46*s,y-80*s),P(x+46*s,y-84*s)],2.4);st([...hd,hd[0]],2);st([P(x-18*s,y-134*s),P(x+18*s,y-136*s)],2.2);st([P(x-12*s,y-134*s),P(x-10*s,y-150*s),P(x+10*s,y-150*s),P(x+12*s,y-136*s)],2);
  st([...body,body[0]],1.8);st([P(x-6*s,y-121*s),P(x-4*s,y-119*s)],1.6,'dot');st([P(x+5*s,y-121*s),P(x+7*s,y-119*s)],1.6,'dot');st(smooth([P(x-5*s,y-114*s),P(x,y-111*s),P(x+5*s,y-114*s)],4),1.3);
  st([P(x-46*s,y-80*s),P(x-56*s,y-74*s)],1.2,'hatch');st([P(x+46*s,y-84*s),P(x+56*s,y-90*s)],1.2,'hatch');return {acc:[body],sil:body,head:P(x,y-124*s),hat:P(x,y-143*s),s};}
 function haystack(st,x,y,r,seed){const c=scallop(blob(x,y-r*.7,r,seed,.08,16,r*.75),r*.1,seed,3,y-r*.1);st.cut(c);st([...c,c[0]],2);st.add(hatch(c,-.6,r*.3,seed,1,.4));return {acc:[c],sil:c};}
 function fence(st,x0,y0,x1,y1,n){for(let i=0;i<=n;i++){const t=i/n,x=lerp(x0,x1,t),y=lerp(y0,y1,t);st([P(x,y),P(x,y-20)],1.6);}st([P(x0,y0-8),P(x1,y1-8)],1.3);st([P(x0,y0-15),P(x1,y1-15)],1.3);}
 function fountain(st,x,y,r){const b=circle(x,y,r,24,r*.36);st.cut(b);st([...b,b[0]],1.8);st(shift(b,0,-6).slice(12,24),1.2,'hatch');st([P(x,y-4),P(x,y-r*.9)],2);const t=circle(x,y-r*.95,r*.34,16,r*.12);st([...t,t[0]],1.4);st([P(x-r*.25,y-r*.95),P(x-r*.4,y-r*.4)],.9,'hatch');st([P(x+r*.25,y-r*.95),P(x+r*.4,y-r*.4)],.9,'hatch');return {sil:b,top:P(x,y-r*.95)};}
 function bird(st,x,y,s){st(smooth([P(x-s,y+s*.3),P(x-s*.45,y-s*.2),P(x,y+s*.15)],5),1.3);st(smooth([P(x,y+s*.15),P(x+s*.45,y-s*.25),P(x+s,y+s*.25)],5),1.3);}
 // A sailing boat seen from the side: hull, mast and a triangular sail. Returns {sil, acc (the hull)}.
 function boat(st,x,y,w,o={}){const h=o.hull??w*.22,mh=o.mast??w*.9,hull=[P(x-w/2,y-h),P(x+w/2,y-h),P(x+w*.38,y),P(x-w*.4,y)];st.cut(hull);st([...hull,hull[0]],2);
  if(o.sail!==false){const sail=[P(x-w*.02,y-h-4),P(x-w*.02,y-h-mh),P(x+w*.42,y-h-mh*.18)];st.cut(sail);st([...sail,sail[0]],1.8);st([P(x-w*.02,y-h-mh),P(x-w*.02,y-h)],2.2);return {sil:hull,sil2:sail,acc:[hull],mast:P(x-w*.02,y-h-mh)};}
  return {sil:hull,acc:[hull]};}
 // A rowing boat (lake): a low hull with two oars.
 function rowboat(st,x,y,w){const h=w*.2,hull=[P(x-w/2,y-h),P(x+w/2,y-h),P(x+w*.36,y),P(x-w*.36,y)];st.cut(hull);st([...hull,hull[0]],1.9);st([P(x-w*.3,y-h*.5),P(x+w*.3,y-h*.5)],1,'hatch');
  st([P(x-w*.1,y-h),P(x-w*.55,y+h*.35)],1.6);st([P(x+w*.14,y-h),P(x+w*.6,y+h*.3)],1.6);return {sil:hull,acc:[]};}
 // A lighthouse on its rock: a tapering tower with a lantern and gallery.
 function lighthouse(st,x,y,w,h){const sil=[P(x-w*.5,y),P(x+w*.5,y),P(x+w*.36,y-h*.78),P(x+w*.44,y-h*.78),P(x+w*.44,y-h*.84),P(x+w*.3,y-h*.84),P(x+w*.3,y-h*.96),P(x,y-h*1.06),P(x-w*.3,y-h*.96),P(x-w*.3,y-h*.84),P(x-w*.44,y-h*.84),P(x-w*.44,y-h*.78),P(x-w*.36,y-h*.78)];st.cut(sil);st([...sil,sil[0]],2.2);
  for(let i=1;i<4;i++){const t=i/4,yy=y-h*.78*t,ww=w*(.5-(.5-.36)*t);st([P(x-ww,yy),P(x+ww,yy)],1.1,'hatch');}st([P(x-w*.3,y-h*.84),P(x+w*.3,y-h*.84)],1.6);st([P(x-w*.18,y-h*.96),P(x-w*.18,y-h*.84)],1,'hatch');st([P(x+w*.18,y-h*.96),P(x+w*.18,y-h*.84)],1,'hatch');
  const dr=[P(x-w*.1,y),P(x-w*.1,y-h*.14),...arc(x,y-h*.14,w*.1,Math.PI,2*Math.PI,6),P(x+w*.1,y)];st(dr,1.4);return {sil,acc:[[P(x-w*.44,y-h*.84),P(x+w*.44,y-h*.84),P(x+w*.36,y-h*.6),P(x-w*.36,y-h*.6)]],lamp:P(x,y-h*.9)};}
 // A harbour crane: a tall mast, a jib and a hook.
 function crane(st,x,y,h){st([P(x-h*.06,y),P(x-h*.03,y-h),P(x+h*.03,y-h),P(x+h*.06,y)],2);for(let i=1;i<8;i++){const t=i/8,yy=y-h*t;st([P(x-h*.06+h*.03*t,yy),P(x+h*.06-h*.03*t,yy)],1,'hatch');}
  st([P(x-h*.4,y-h*.95),P(x+h*.12,y-h*1.02)],2.4);st([P(x-h*.4,y-h*.95),P(x-h*.36,y-h*.9),P(x+h*.1,y-h*.97)],1.2,'hatch');st([P(x+h*.1,y-h*1.02),P(x+h*.02,y-h*1.1),P(x-h*.03,y-h)],1.6);
  st([P(x-h*.3,y-h*.95),P(x-h*.3,y-h*.6)],1.2);st([P(x-h*.3,y-h*.6),P(x-h*.33,y-h*.56),P(x-h*.27,y-h*.56)],1.4);return {hook:P(x-h*.3,y-h*.56),tip:P(x-h*.4,y-h*.95)};}
 // A ship in the harbour: a hull, a superstructure and a funnel.
 function ship(st,x,y,w){const h=w*.14,hull=[P(x-w/2,y-h),P(x+w/2,y-h),P(x+w*.44,y),P(x-w*.46,y)],sup=rect(x-w*.1,y-h-w*.12,w*.3,w*.12),fun=rect(x+w*.02,y-h-w*.2,w*.06,w*.08);st.cut(hull);st.cut(sup);st.cut(fun);
  st([...hull,hull[0]],2.2);st([...sup,sup[0]],1.8);st([...fun,fun[0]],1.6);st([P(x-w*.44,y-h*.5),P(x+w*.44,y-h*.5)],1.1,'hatch');for(let i=0;i<4;i++){const wx=x-w*.06+i*w*.07;st(circle(wx,y-h-w*.06,w*.016,8),1.1);}
  return {sil:hull,sil2:sup,acc:[hull],funnel:P(x+w*.05,y-h-w*.2)};}
 // A carousel: a round tent roof on poles.
 function carousel(st,x,y,w,h){const roof=[P(x-w/2-6,y-h*.55),P(x,y-h),P(x+w/2+6,y-h*.55)],base=[P(x-w/2,y-h*.55),P(x+w/2,y-h*.55),P(x+w/2,y),P(x-w/2,y)];st.cut([...roof,P(x+w/2,y),P(x-w/2,y)]);
  st([...roof],2.2);st([P(x-w/2-6,y-h*.55),P(x+w/2+6,y-h*.55)],1.8);for(let i=0;i<5;i++){const t=i/4,px=x-w/2+w*t;st([P(px,y-h*.55),P(px,y)],1.5);}
  st([P(x-w/2,y),P(x+w/2,y)],1.8);for(let i=1;i<6;i++){const t=i/6;st([mixp(roof[0],roof[1],t),mixp(roof[2],roof[1],t)],1,'hatch');}st([P(x,y-h),P(x,y-h-10)],1.4);
  return {sil:[...roof,P(x+w/2,y),P(x-w/2,y)],acc:[roof],top:P(x,y-h)};}
 // A Ferris wheel: a big ring with spokes and small cabins.
 function ferris(st,x,y,r){const ring=circle(x,y-r-6,r,40);st(ring.concat([ring[0]]),2);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;st([P(x,y-r-6),P(x+Math.cos(a)*r,y-r-6+Math.sin(a)*r)],1.1,'hatch');const cx=x+Math.cos(a)*r,cy=y-r-6+Math.sin(a)*r;st([P(cx-5,cy),P(cx+5,cy),P(cx+5,cy+8),P(cx-5,cy+8),P(cx-5,cy)],1.3);}
  st([P(x-r*.5,y),P(x,y-r-6),P(x+r*.5,y)],2.2);return {hub:P(x,y-r-6),r};}
 // A windmill: a tapering tower with a cap and four sails.
 function windmill(st,x,y,w,h){const sil=[P(x-w*.5,y),P(x+w*.5,y),P(x+w*.34,y-h*.8),P(x-w*.34,y-h*.8)];st.cut(sil);st([...sil,sil[0]],2.2);const cap=[P(x-w*.4,y-h*.8),P(x,y-h),P(x+w*.4,y-h*.8)];st.cut([...cap]);st(cap,2.2);
  for(let i=1;i<4;i++){const t=i/4,yy=y-h*.8*t,ww=w*(.5-.16*t);st([P(x-ww,yy),P(x+ww,yy)],1,'hatch');}const dr=[P(x-w*.1,y),P(x-w*.1,y-h*.16),...arc(x,y-h*.16,w*.1,Math.PI,2*Math.PI,6),P(x+w*.1,y)];st(dr,1.4);
  return {sil,acc:[cap],hub:P(x,y-h*.86),arm:h*.42};}
 // A farmhouse (masia): a wide body with a low roof and a porch of arches.
 function farmhouse(st,x,y,w,h){const r=house(st,x,y,w,h,{depth:w*.3,seed:31,chimney:true});for(let i=0;i<3;i++){const ax=x+w*.1+i*w*.27;st([P(ax,y),P(ax,y-h*.3),...arc(ax+w*.09,y-h*.3,w*.09,Math.PI,2*Math.PI,8),P(ax+w*.18,y)],1.4);}return r;}
 // A hut / mountain refuge: a low stone house with a steep roof.
 function hut(st,x,y,w,h){return house(st,x,y,w,h,{depth:w*.4,gable:true,roof:h*.7,seed:17});}
 // A kite: a rhombus with a tail.
 function kite(st,x,y,s,a=0){const ca=Math.cos(a),sa=Math.sin(a),p=(dx,dy)=>P(x+dx*ca-dy*sa,y+dx*sa+dy*ca),k=[p(0,-s),p(s*.6,0),p(0,s*1.3),p(-s*.6,0)];st.cut(k);st([...k,k[0]],1.6);st([k[0],k[2]],1,'hatch');st([k[1],k[3]],1,'hatch');return {sil:k,acc:[k],tail:k[2]};}
 // A tram: a long box on wheels with windows and a pole.
 function tram(st,x,y,w,h){const body=[P(x-w/2,y),P(x-w/2+6,y-h),P(x+w/2-6,y-h),P(x+w/2,y)];st.cut(body);st([...body,body[0]],2.2);for(let i=0;i<5;i++){const wx=x-w*.4+i*w*.17;st(rect(wx,y-h*.82,w*.12,h*.4).concat([P(wx,y-h*.82)]),1.3);}
  st([P(x-w*.44,y-h*.35),P(x+w*.44,y-h*.35)],1.1,'hatch');for(const wx of [x-w*.3,x+w*.3])st(circle(wx,y+h*.08,h*.12,12),1.6);st([P(x,y-h),P(x-w*.1,y-h*1.3)],1.6);st([P(x-w*.1,y-h*1.3),P(x-w*.1,y-h*1.5)],1.2);return {sil:body,acc:[[P(x-w/2+6,y-h),P(x+w/2-6,y-h),P(x+w/2-10,y-h*.78),P(x-w/2+10,y-h*.78)]],roof:P(x,y-h)};}
 // A market stall: a striped awning on two poles with a table.
 function stall(st,x,y,w,h){const aw=[P(x-w/2-8,y-h*.72),P(x-w/2,y-h),P(x+w/2,y-h),P(x+w/2+8,y-h*.72)];st.cut([...aw,P(x+w/2,y),P(x-w/2,y)]);st([...aw],2);st([P(x-w/2-8,y-h*.72),P(x+w/2+8,y-h*.72)],1.6);
  for(let i=1;i<6;i++){const t=i/6;st([mixp(aw[1],aw[2],t),mixp(aw[0],aw[3],t)],1,'hatch');}st([P(x-w/2,y-h*.72),P(x-w/2,y)],1.6);st([P(x+w/2,y-h*.72),P(x+w/2,y)],1.6);st(rect(x-w*.45,y-h*.35,w*.9,h*.35).concat([P(x-w*.45,y-h*.35)]),1.5);
  return {sil:[...aw,P(x+w/2,y),P(x-w/2,y)],acc:[aw],top:P(x,y-h)};}
 return {rnd,P,smooth,circle,arc,blob,shift,scale,rev,lerp,mixp,scallop,hatch,rect,Ink,house,church,oak,poplar,pine,fir,stonePine,plane,beech,cypress,bush,cloud,cloudShape,bridge,scarecrow,haystack,fence,fountain,bird,boat,rowboat,lighthouse,crane,ship,carousel,ferris,windmill,farmhouse,hut,kite,tram,stall};})();
// ── The ink line ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Canvas 2D, over a transparent sheet: strokes of varying thickness with a slight tremor, like a pen; a cut {cut} rubs the ink
// behind it out. map = [sx, sy, ox, oy] sheet → canvas. st: {width, tremor, alpha, gaps, pool, ink:[r,g,b]}.
function ptTnoise(x,seed){const s=Math.sin(x*1.7+seed*12.9898)*43758.5453,a=s-Math.floor(s);const t=Math.sin(x*.53+seed*78.233)*23421.631,b=t-Math.floor(t);return (a*.6+b*.4);}
function ptResample(pts,step){const out=[pts[0]];let acc=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1e-6)continue;let s=step-acc;while(s<L){out.push([a[0]+(b[0]-a[0])*s/L,a[1]+(b[1]-a[1])*s/L]);s+=step;}acc=(L-(s-step));}
 const last=pts[pts.length-1],l2=out[out.length-1];if(Math.hypot(last[0]-l2[0],last[1]-l2[1])>.5)out.push(last);return out;}
export function ptInkDraw(c,strokes,map,st,seed=1){const [sx,sy,ox,oy]=map,k=(sx+sy)/2;c.save();c.setTransform(1,0,0,1,0,0);c.lineJoin='round';c.lineCap='round';
 let n=0;for(const S of strokes){n++;
  if(S.cut){c.save();c.globalCompositeOperation='destination-out';c.fillStyle='#000';c.beginPath();S.cut.forEach(([x,y],i)=>i?c.lineTo(x*sx+ox,y*sy+oy):c.moveTo(x*sx+ox,y*sy+oy));c.closePath();c.fill();c.restore();continue;}
  const base=S.w*st.width*k,hatch=S.k==='hatch',dot=S.k==='dot';
  const pts=ptResample(S.pts.map(([x,y])=>[x*sx+ox,y*sy+oy]),Math.max(1.5,2.2*k));if(pts.length<2)continue;
  const alpha=(hatch?.5:dot?.95:.9)*st.alpha;c.fillStyle=`rgba(${st.ink[0]},${st.ink[1]},${st.ink[2]},${alpha})`;
  const N=pts.length,segs=[];let cur=[];
  for(let i=0;i<N;i++){const u=i/(N-1),a=pts[Math.max(0,i-1)],b=pts[Math.min(N-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
   const tre=(ptTnoise(i*.11,seed+n)-.5)*2*st.tremor*k,w=base*(hatch?.7:1)*(.5+.5*Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,u))),.55))*(1+.3*(ptTnoise(i*.23,seed*3+n)-.5))+.35*k;
   if(st.gaps>0&&!hatch){const g=ptTnoise(i*.025,seed*7+n);if(g>1-st.gaps*.3&&i>3&&i<N-4){if(cur.length>1)segs.push(cur);cur=[];continue;}}
   cur.push([pts[i][0]+nx*tre,pts[i][1]+ny*tre,nx,ny,w]);}
  if(cur.length>1)segs.push(cur);
  for(const seg of segs){c.beginPath();for(let i=0;i<seg.length;i++){const [x,y,nx,ny,w]=seg[i];if(i===0)c.moveTo(x+nx*w/2,y+ny*w/2);else c.lineTo(x+nx*w/2,y+ny*w/2);}
   for(let i=seg.length-1;i>=0;i--){const [x,y,nx,ny,w]=seg[i];c.lineTo(x-nx*w/2,y-ny*w/2);}c.closePath();c.fill();
   if(!hatch&&st.pool>0){const [x,y,,,w]=seg[0];c.beginPath();c.arc(x,y,w*.6*st.pool+.3*k,0,Math.PI*2);c.fill();}}
 }
 c.restore();}
// A polygon clipped to a rectangle (Sutherland–Hodgman), for the zones on the screen.
export function ptClipRect(pts,x0,y0,x1,y1){let out=pts;for(const [axis,lim,keepLess] of [[0,x0,false],[0,x1,true],[1,y0,false],[1,y1,true]]){const inp=out;out=[];if(!inp.length)break;
  const inside=p=>keepLess?p[axis]<=lim:p[axis]>=lim;for(let i=0;i<inp.length;i++){const a=inp[i],b=inp[(i+1)%inp.length],ia=inside(a),ib=inside(b);
   if(ia)out.push(a);if(ia!==ib){const t=(lim-a[axis])/(b[axis]-a[axis]||1e-9);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}}
 return out;}
export function ptInside(pts,x,y){let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
// The windows of the ink houses as rectangles [x, y, w, h] (sheet units), for the lights of winter: the ones the house drew, or two
// on its front.
export const ptWinRects=hs=>hs.flatMap(h=>Array.isArray(h.win)&&h.win.length?h.win.map(w=>{if(typeof w[0]==='number')return w;const xs=w.map(p=>p[0]),ys=w.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);return [x,y,Math.max(...xs)-x,Math.max(...ys)-y];}):h.box?[[h.box[0]+h.box[2]*.14,h.box[1]-h.box[3]*.68,h.box[2]*.2,h.box[3]*.3],[h.box[0]+h.box[2]*.62,h.box[1]-h.box[3]*.68,h.box[2]*.2,h.box[3]*.3]]:[]);
