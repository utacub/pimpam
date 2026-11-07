// Pinta el món · eines de dibuix a tinta. Tot en coordenades del full. Un traç és {pts, w, k} (k: 'line', 'hatch', 'dot');
// un tall és {cut: polígon}: esborra la tinta que hi ha al darrere (els elements tapen el que tenen darrere, com en un dibuix de debò).
export function rnd(seed){let a=seed>>>0||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const P=(...a)=>a;
export function smooth(pts,n=8,closed=false){const out=[],L=pts.length,g=i=>pts[closed?((i%L)+L)%L:Math.max(0,Math.min(L-1,i))];const segs=closed?L:L-1;
 for(let i=0;i<segs;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
 if(!closed)out.push(pts[L-1]);return out;}
export function circle(cx,cy,r,n=24,ry=r,a0=0){return Array.from({length:n},(_,i)=>{const a=a0+i/n*Math.PI*2;return [cx+Math.cos(a)*r,cy+Math.sin(a)*ry];});}
export function arc(cx,cy,r,a0,a1,n=12,ry=r){return Array.from({length:n+1},(_,i)=>{const a=a0+(a1-a0)*i/n;return [cx+Math.cos(a)*r,cy+Math.sin(a)*ry];});}
export function blob(cx,cy,r,seed,wob=.18,n=28,ry=r){const R=rnd(seed),ph=[R()*6.3,R()*6.3,R()*6.3];return Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2,k=1+wob*(.6*Math.sin(2*a+ph[0])+.3*Math.sin(3*a+ph[1])+.2*Math.sin(5*a+ph[2]));return [cx+Math.cos(a)*r*k,cy+Math.sin(a)*ry*k];});}
export const shift=(pts,dx,dy)=>pts.map(([x,y])=>[x+dx,y+dy]);
export const scale=(pts,cx,cy,k,ky=k)=>pts.map(([x,y])=>[cx+(x-cx)*k,cy+(y-cy)*ky]);
export const rev=pts=>pts.slice().reverse();
export const lerp=(a,b,t)=>a+(b-a)*t;
export const mixp=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
// Contorn festonejat (capçades, núvols): bonys cap enfora de mida bump, de mides desiguals; per sota d'onlyAbove queda llis.
export function scallop(pts,bump,seed,n=5,onlyAbove=null){const out=[],L=pts.length,R=rnd(seed);let cx=0,cy=0;for(const p of pts){cx+=p[0]/L;cy+=p[1]/L;}
 for(let i=0;i<L;i++){const a=pts[i],b=pts[(i+1)%L],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;let nx=-dy/len,ny=dx/len;if((mx-cx)*nx+(my-cy)*ny<0){nx=-nx;ny=-ny;}
  const h=bump*(.45+1.1*R()),m=Math.max(2,Math.round(n*(.6+.8*R())));const flat=onlyAbove!==null&&my>onlyAbove;for(let k=0;k<m;k++){const t=k/m,s=flat?0:Math.sin(Math.PI*t)*h;out.push([a[0]+dx*t+nx*s,a[1]+dy*t+ny*s]);}}
 return out;}
// Ratllat dins d'un polígon: línies paral·leles a l'angle a, separades sp, retallades pel polígon. Retorna traços.
export function hatch(poly,a,sp,seed,w=1,jit=.35,k='hatch'){const ca=Math.cos(a),sa=Math.sin(a),R=rnd(seed),out=[];
 const proj=poly.map(([x,y])=>-x*sa+y*ca),lo=Math.min(...proj),hi=Math.max(...proj);
 for(let d=lo+sp*(.3+.4*R());d<hi;d+=sp*(1+jit*(R()-.5))){const xs=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],pp=-p[0]*sa+p[1]*ca,pq=-q[0]*sa+q[1]*ca;if((pp<=d)!==(pq<=d)){const t=(d-pp)/(pq-pp);xs.push(p[0]*ca+p[1]*sa+((q[0]*ca+q[1]*sa)-(p[0]*ca+p[1]*sa))*t);}}
  xs.sort((u,v)=>u-v);for(let i=0;i+1<xs.length;i+=2){const u0=xs[i]+2*R(),u1=xs[i+1]-2*R();if(u1-u0<4)continue;const seg=[];const n=Math.max(2,Math.round((u1-u0)/14));for(let j=0;j<=n;j++){const u=u0+(u1-u0)*j/n,wob=(R()-.5)*1.2;seg.push([u*ca-d*sa+wob*sa,u*sa+d*ca-wob*ca]);}out.push({pts:seg,w,k});}}
 return out;}
export const rect=(x,y,w,h)=>[P(x,y),P(x+w,y),P(x+w,y+h),P(x,y+h)];
// Tramesa de traços: st(pts,w,k); st.cut(poly) talla el que hi ha al darrere; st.add(traços).
export function Ink(){const S=[];const st=(pts,w=2.2,k='line')=>{if(pts&&pts.length>1)S.push({pts,w,k});return pts;};st.list=S;st.add=arr=>{for(const s of arr)S.push(s);};st.cut=poly=>{if(poly&&poly.length>2)S.push({cut:poly});return poly;};return st;}
// ── Elements ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Casa de poble en lleugera perspectiva: façana (x,y: cantonada inferior esquerra; w,h) i costat (depth cap a la dreta, pujant ky).
// Retorna {acc: polígons del color d'accent (teulada), sil: silueta (per a la zona i el tall)}.
export function house(st,x,y,w,h,o={}){const d=o.depth??w*.42,ky=o.ky??-.18,r=o.roof??h*.42,ov=o.over??6,R=rnd(o.seed??1);const acc=[];
 const A=P(x,y),B=P(x+w,y),C=P(x+w,y-h),D=P(x,y-h),E=P(x+w+d,y+d*ky),F=P(x+w+d,y-h+d*ky);let sil;
 if(o.gable){const T=P(x+w/2,y-h-r),T2=P(x+w/2+d,y-h-r+d*ky);sil=[A,B,E,P(x+w+d+ov,y-h+d*ky),T2,T,P(x-ov,y-h)];st.cut(sil);
  st([A,B,C,D,A],2.2);st([B,E,F,C],2);st([P(x-ov,y-h),T,P(x+w+ov,y-h)],2.6);st([T,T2],2.4);st([P(x+w+ov,y-h),P(x+w+d+ov,y-h+d*ky)],2.4);st([T2,P(x+w+d+ov,y-h+d*ky)],2.4);
  acc.push([T,T2,P(x+w+d+ov,y-h+d*ky),P(x+w+ov,y-h)]);for(let i=1;i<5;i++){const t=i/5;st([mixp(T,P(x+w+ov,y-h),t),mixp(T2,P(x+w+d+ov,y-h+d*ky),t)],1,'hatch');}}
 else{const rL=P(x-ov,y-h-r*.1),rR=P(x+w+ov,y-h-r*.1),tL=P(x-ov+w*.1,y-h-r),tR=P(x+w+ov-w*.1,y-h-r),sR=P(x+w+d+ov,y-h+d*ky-r*.1),sT=P(x+w+d-w*.1,y-h+d*ky-r);sil=[A,B,E,sR,sT,tR,tL,rL];st.cut(sil);
  st([A,B,C,D,A],2.2);st([B,E,F,C],2);st([rL,rR],2.4);st([tL,tR],2.4);st([rL,tL],2);st([rR,tR],2);acc.push([rL,rR,tR,tL]);
  for(let i=1;i<6;i++){const t=i/6;st([mixp(rL,tL,t),mixp(rR,tR,t)],1,'hatch');}
  st([rR,sR],2);st([tR,sT],1.8);st([sR,sT],1.8);acc.push([rR,sR,sT,tR]);}
 if(o.chimney!==false){const cx=x+w*(.62+.2*R()),top=y-h-r*.95;st([P(cx,top+r*.45),P(cx,top),P(cx+w*.09,top),P(cx+w*.09,top+r*.35)],1.8);}
 const cols=Math.max(1,Math.round(w/44)),rows=h>70?2:1;
 for(let r2=0;r2<rows;r2++)for(let c2=0;c2<cols;c2++){const wx=x+w*(c2+.5)/cols-9,wy=y-h*(rows===2?(r2===0?.78:.42):.6),ww=18,wh=20;if(rows===2&&r2===1&&c2===Math.floor(cols/2))continue;
  st([P(wx,wy),P(wx+ww,wy),P(wx+ww,wy+wh),P(wx,wy+wh),P(wx,wy)],1.3);st([P(wx+ww/2,wy),P(wx+ww/2,wy+wh)],.9,'hatch');st([P(wx,wy+wh/2),P(wx+ww,wy+wh/2)],.9,'hatch');
  if(R()<.6){st([P(wx-6,wy),P(wx-6,wy+wh)],1.2);st([P(wx+ww+6,wy),P(wx+ww+6,wy+wh)],1.2);}}
 const dx=x+w*.5-9,dh=h*.36;st([P(dx,y),P(dx,y-dh+6),...arc(dx+9,y-dh+6,9,Math.PI,2*Math.PI,8),P(dx+18,y)],1.5);
 if(o.sideWindow!==false&&d>24){const wx=x+w+d*.35,wy=y-h*.6+d*ky*.4;st([P(wx,wy),P(wx+12,wy+d*ky*.25),P(wx+12,wy+18+d*ky*.25),P(wx,wy+18),P(wx,wy)],1.2);}
 return {acc,sil};}
// Campanar amb nau: torre quadrada amb finestres d'arc, teulada piramidal i creu; nau a la dreta amb absis.
export function church(st,x,y,w,h,o={}){const acc=[];const d=o.depth??w*.6,ky=-.16;const T=P(x+w/2+d/2,y-h-w*.85+d*ky/2);
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
 return {acc,sil};}
// Arbres. Retornen {acc (tronc), sil (silueta: capçada i tronc)}.
export function oak(st,x,y,r,seed){const R=rnd(seed),c=scallop(blob(x,y-r*1.05,r,seed,.14,18,r*.8),r*.16,seed,5,y-r*.95),trunk=[P(x-r*.12,y+2),P(x+r*.12,y+2),P(x+r*.1,y-r*.5),P(x-r*.1,y-r*.5)];st.cut(c);st.cut(trunk);
 st([...c,c[0]],2.2);for(let i=0;i<3;i++){const cx=x+(R()-.5)*r*.9,cy=y-r*1.05+(R()-.5)*r*.7,rr=r*(.25+.2*R());st(arc(cx,cy,rr,Math.PI*1.05,Math.PI*1.95,7,rr*.8),1.2,'hatch');}
 st([P(x-r*.11,y),P(x-r*.1,y-r*.3),P(x-r*.3,y-r*.65)],2.4);st([P(x+r*.11,y),P(x+r*.08,y-r*.3),P(x+r*.26,y-r*.6)],2.4);st([P(x-r*.05,y-r*.3),P(x,y-r*.75)],1.8);
 st([P(x-r*.3,y+2),P(x-r*.11,y)],1.4);st([P(x+r*.11,y),P(x+r*.3,y+3)],1.4);return {acc:[trunk],sil:c,sil2:trunk};}
export function poplar(st,x,y,h,seed){const R=rnd(seed),c=scallop(blob(x,y-h*.56,h*.11,seed,.1,16,h*.46),h*.03,seed,4,y-h*.14),trunk=[P(x-3,y),P(x+3,y),P(x+2,y-h*.13),P(x-2,y-h*.13)];st.cut(c);st.cut(trunk);st([...c,c[0]],2);st([P(x,y),P(x,y-h*.12)],2.4);
 for(let i=0;i<4;i++){const yy=y-h*(.25+.15*i);st([P(x-h*.02,yy),P(x+(R()-.5)*h*.1,yy-h*.08)],1,'hatch');}return {acc:[trunk],sil:c,sil2:trunk};}
export function pine(st,x,y,h,seed){const R=rnd(seed),pts=[P(x,y-h)];const n=5;for(let i=1;i<=n;i++){const t=i/n,w=h*.14*t*(1+.2*(R()-.5)),yy=y-h+h*.78*t;pts.push(P(x+w,yy),P(x+w*.55,yy));}
 const left=[];for(let i=n;i>=1;i--){const t=i/n,w=h*.14*t*(1+.2*(R()-.5)),yy=y-h+h*.78*t;left.push(P(x-w*.55,yy),P(x-w,yy));}const c=[...pts,...left];st.cut(c);st([...c,c[0]],2);st([P(x,y),P(x,y-h*.22)],2.4);return {acc:[c],sil:c};}
export function cypress(st,x,y,h,seed){const c=scallop(blob(x,y-h*.5,h*.07,seed,.08,14,h*.5),h*.012,seed,3,y-h*.05);st.cut(c);st([...c,c[0]],1.8);return {acc:[c],sil:c};}
export function bush(st,x,y,r,seed){const c=scallop(blob(x,y-r*.6,r,seed,.15,12,r*.6),r*.2,seed,4,y-r*.2);st.cut(c);st([...c,c[0]],1.6);return {acc:[],sil:c};}
// Núvol: cúmul amb la part de dalt festonejada i la base plana; només se'n dibuixa la vora de dalt, com en un croquis.
export function cloud(st,x,y,w,h,seed){const base=blob(x,y,w/2,seed,.12,22,h/2),c=scallop(base,h*.2,seed,5,y+h*.08);const n=c.length,from=Math.floor(n*.55),to=Math.floor(n*.96);st(c.slice(from,to),1.5);return c;}
// Pont de pedra sobre el riu: x0..x1 a l'alçada y, pendent k. Retorna {acc, sil}.
export function bridge(st,x0,x1,y,k=0,o={}){const n=o.arches??2,acc=[];const top=x=>y+(x-x0)*k;const deck=[P(x0-14,top(x0-14)-8),P(x1+14,top(x1+14)-8),P(x1+14,top(x1+14)+10),P(x0-14,top(x0-14)+10)];
 const span=(x1-x0)/n,arcs=[];for(let i=0;i<n;i++){const cx=x0+span*(i+.5),r=span*.4;arcs.push({cx,r,a:arc(cx,top(cx)+12,r,Math.PI,2*Math.PI,14,r*.8)});}
 const sil=[P(x0-14,top(x0-14)-8),P(x1+14,top(x1+14)-8),P(x1+14,top(x1+14)+30),P(x0-14,top(x0-14)+30)];st.cut(sil);
 st([deck[0],deck[1]],3);st([deck[3],deck[2]],2.2);
 for(let i=0;i<n;i++){const {a,cx}=arcs[i];st(a,2.4);st(shift(a,0,9).slice(2,13),1.2,'hatch');if(i<n-1){const px=x0+span*(i+1);st([P(px-7,top(px)+12),P(px-7,top(px)+30)],2);st([P(px+7,top(px)+12),P(px+7,top(px)+30)],2);}}
 for(let i=0;i<Math.round((x1-x0)/26);i++){const x=x0+i*26;st([P(x,top(x)-7),P(x,top(x)+9)],1,'hatch');}
 acc.push(deck);return {acc,sil};}
export function scarecrow(st,x,y,s=1){const body=[P(x-14*s,y-110*s),P(x-20*s,y-60*s),P(x+22*s,y-60*s),P(x+14*s,y-110*s)],hd=circle(x,y-124*s,14*s,18);st.cut(body);st.cut(hd);
 st([P(x,y),P(x,y-60*s)],2.6);st([P(x-46*s,y-80*s),P(x+46*s,y-84*s)],2.4);st([...hd,hd[0]],2);st([P(x-18*s,y-134*s),P(x+18*s,y-136*s)],2.2);st([P(x-12*s,y-134*s),P(x-10*s,y-150*s),P(x+10*s,y-150*s),P(x+12*s,y-136*s)],2);
 st([...body,body[0]],1.8);st([P(x-6*s,y-121*s),P(x-4*s,y-119*s)],1.6,'dot');st([P(x+5*s,y-121*s),P(x+7*s,y-119*s)],1.6,'dot');st(smooth([P(x-5*s,y-114*s),P(x,y-111*s),P(x+5*s,y-114*s)],4),1.3);
 st([P(x-46*s,y-80*s),P(x-56*s,y-74*s)],1.2,'hatch');st([P(x+46*s,y-84*s),P(x+56*s,y-90*s)],1.2,'hatch');return {acc:[body],sil:body};}
export function haystack(st,x,y,r,seed){const c=scallop(blob(x,y-r*.7,r,seed,.08,16,r*.75),r*.1,seed,3,y-r*.1);st.cut(c);st([...c,c[0]],2);st.add(hatch(c,-.6,r*.3,seed,1,.4));return {acc:[c],sil:c};}
export function fence(st,x0,y0,x1,y1,n){for(let i=0;i<=n;i++){const t=i/n,x=lerp(x0,x1,t),y=lerp(y0,y1,t);st([P(x,y),P(x,y-20)],1.6);}st([P(x0,y0-8),P(x1,y1-8)],1.3);st([P(x0,y0-15),P(x1,y1-15)],1.3);}
export function fountain(st,x,y,r){const b=circle(x,y,r,24,r*.36);st.cut(b);st([...b,b[0]],1.8);st(shift(b,0,-6).slice(12,24),1.2,'hatch');st([P(x,y-4),P(x,y-r*.9)],2);const t=circle(x,y-r*.95,r*.34,16,r*.12);st([...t,t[0]],1.4);st([P(x-r*.25,y-r*.95),P(x-r*.4,y-r*.4)],.9,'hatch');st([P(x+r*.25,y-r*.95),P(x+r*.4,y-r*.4)],.9,'hatch');}
export function bird(st,x,y,s){st(smooth([P(x-s,y+s*.3),P(x-s*.45,y-s*.2),P(x,y+s*.15)],5),1.3);st(smooth([P(x,y+s*.15),P(x+s*.45,y-s*.25),P(x+s,y+s*.25)],5),1.3);}
