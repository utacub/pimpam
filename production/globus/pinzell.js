// El viatge en globus (CE43) · proves d'estil · eines de pintura (Canvas 2D). Full de 1280 × 800.
// Fons pintats a la manera del guaix dels fons d'animació (capes opaques, vores toves, gra de pinzell) i línia de cel·luloide.
export const SHEET=[1280,800];
export const P=(x,y)=>[x,y];
export function hash(i,j,k=0){let h=(i*374761393+j*668265263+k*1274126177)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296;}
export function noise(x,y,k=0){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=hash(xi,yi,k),b=hash(xi+1,yi,k),c=hash(xi,yi+1,k),d=hash(xi+1,yi+1,k);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
export function fbm(x,y,k=0,o=4){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=a*noise(x*f,y*f,k+i*7);n+=a;a*=.5;f*=2;}return s/n;}
export function rng(seed){let s=(seed*2654435761)>>>0||1;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
// ── Colors: [r,g,b] de 0 a 255 ───────────────────────────────────────────────────────────────────────────────────────────────
export const rgb=(c,a=1)=>`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
export const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
export const lighten=(c,t)=>mix(c,[255,255,255],t);
export const darken=(c,t)=>mix(c,[0,0,0],t);
export const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
export const sat=(c,t)=>{const l=(c[0]*.3+c[1]*.59+c[2]*.11);return c.map(v=>Math.max(0,Math.min(255,l+(v-l)*(1+t))));};
// ── Camins ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function smooth(pts,n=4,closed=false){const out=[];const N=pts.length;const at=i=>pts[closed?((i%N)+N)%N:Math.max(0,Math.min(N-1,i))];
 const last=closed?N:N-1;for(let i=0;i<last;i++){const p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2);for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;
  out.push([.5*(2*p1[0]+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*(2*p1[1]+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
 if(!closed)out.push(pts[N-1]);return out;}
export const rev=a=>[...a].reverse();
export function path(c,pts,close=true){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));if(close)c.closePath();}
export function bounds(pts){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of pts){if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y;}return {x:x0,y:y0,w:x1-x0,h:y1-y0};}
export function blob(cx,cy,rx,seed,amp=.15,n=28,ry=rx){const pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,k=1+amp*(noise(Math.cos(a)*1.7+seed*3.1,Math.sin(a)*1.7+seed*5.3,seed)-.5)*2;pts.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]);}return smooth(pts,3,true);}
export function ell(c,x,y,rx,ry,rot=0){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,Math.PI*2);c.closePath();}
export function shift(pts,dx,dy){return pts.map(p=>[p[0]+dx,p[1]+dy]);}
export function scale(pts,cx,cy,k){return pts.map(p=>[cx+(p[0]-cx)*k,cy+(p[1]-cy)*k]);}
// ── Pintura ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Un fons de guaix: la forma omplerta amb el color i, a dins, pinzellades (el·lipses) més clares i més fosques, amb gra.
export function gouache(c,pts,col,o={}){const {grain=.5,light=.09,dark=.09,seed=1,strokes=16,dir=0,soft=0,long=.3,alpha=1}=o;
 c.save();if(soft)c.filter=`blur(${soft}px)`;c.globalAlpha=alpha;path(c,pts);c.fillStyle=rgb(col);c.fill();c.filter='none';c.clip();
 const b=bounds(pts),r=rng(seed);
 for(let i=0;i<strokes;i++){const x=b.x+r()*b.w,y=b.y+r()*b.h,w=(long*.5+r()*long)*Math.max(60,b.w),h=(.04+r()*.1)*Math.max(40,b.h);const t=r();const k=t<.5?lighten(col,light*(.4+r())):darken(col,dark*(.4+r()));
  c.save();c.translate(x,y);c.rotate(dir+(r()-.5)*.35);c.globalAlpha=alpha*.22*grain;c.fillStyle=rgb(k);c.filter=`blur(${Math.max(1,h*.25)}px)`;c.beginPath();c.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);c.fill();c.restore();}
 c.restore();}
export function softShape(c,pts,col,blur=6,alpha=1){c.save();c.globalAlpha=alpha;c.filter=`blur(${blur}px)`;path(c,pts);c.fillStyle=rgb(col);c.fill();c.restore();}
// Un degradat vertical entre parades [[t,col],...] dins una forma (t de 0, a dalt, a 1, a baix).
export function vgrad(c,pts,stops,alpha=1,mode='source-over'){const b=bounds(pts);c.save();c.globalCompositeOperation=mode;path(c,pts);c.clip();const g=c.createLinearGradient(0,b.y,0,b.y+b.h);
 for(const [t,col,a] of stops)g.addColorStop(Math.max(0,Math.min(1,t)),rgb(col,a===undefined?1:a));c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(b.x-2,b.y-2,b.w+4,b.h+4);c.restore();}
// Un mantell de gra fi (paper o pinzell) sobre una zona.
export function mottle(c,x,y,w,h,amount=.06,cell=26,seed=3,col=null){const r=rng(seed);c.save();for(let i=0;i<(w*h)/(cell*cell)*.6;i++){const px=x+r()*w,py=y+r()*h,s=cell*(.6+r()*1.2);const k=noise(px/90,py/90,seed);
 c.globalAlpha=amount*Math.abs(k-.5)*2;c.fillStyle=col?rgb(col):(k>.5?'#fff':'#000');c.beginPath();c.ellipse(px,py,s,s*.6,r()*3,0,Math.PI*2);c.fill();}c.restore();}
// ── Línia de cel·luloide ─────────────────────────────────────────────────────────────────────────────────────────────────────
export function line(c,pts,o={}){const {col=[58,40,30],width=2.2,alpha=1,jitter=0,seed=1,close=false,taper=0}=o;if(pts.length<2)return;
 const q=jitter?pts.map((p,i)=>[p[0]+(hash(i,seed,1)-.5)*2*jitter,p[1]+(hash(i,seed,2)-.5)*2*jitter]):pts;
 c.save();c.strokeStyle=rgb(col,alpha);c.lineCap='round';c.lineJoin='round';
 if(!taper){c.lineWidth=width;path(c,q,close);c.stroke();}
 else{for(let i=1;i<q.length;i++){const u=i/(q.length-1);c.lineWidth=Math.max(.4,width*(1-taper*Math.pow(Math.abs(u-.5)*2,1.6)));c.beginPath();c.moveTo(q[i-1][0],q[i-1][1]);c.lineTo(q[i][0],q[i][1]);c.stroke();}}
 c.restore();}
export function tone(c,pts,col,alpha=.22,mode='multiply'){c.save();c.globalCompositeOperation=mode;c.globalAlpha=alpha;path(c,pts);c.fillStyle=rgb(col);c.fill();c.restore();}
export function fill(c,pts,col,alpha=1){c.save();c.globalAlpha=alpha;path(c,pts);c.fillStyle=rgb(col);c.fill();c.restore();}
// ── Elements pintats ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Un cúmul: lòbuls en dos pisos sobre una base plana; ombra a sota, cos, llum als lòbuls del costat del sol. (x, y) és el centre de la base.
export function cumulus(c,x,y,w,h,seed,pal,o={}){const {soft=1.6,sunDir=-1}=o;const r=rng(seed);
 const lobes=[];const n=Math.max(3,Math.round(w/(h*.7)));
 for(let i=0;i<n;i++){const u=n===1?.5:i/(n-1);const R=h*(.36+r()*.2)*(1-.3*Math.pow(Math.abs(u-.5)*2,2));lobes.push([x-w/2+R*.6+u*(w-R*1.2),y-R*.62-r()*h*.08,R]);}
 const top=Math.max(2,Math.round(n*.55));const off=(r()-.5)*w*.3;for(let i=0;i<top;i++){const u=top===1?.5:i/(top-1);const R=h*(.3+r()*.18);lobes.push([x+off-w*.22+u*w*.44+(r()-.5)*h*.2,y-h*.62-R*.3-r()*h*.12,R]);}
 const sil=(k,dx,dy)=>{c.beginPath();for(const [cx,cy,R] of lobes){c.moveTo(cx+dx+R*k,cy+dy);c.arc(cx+dx,cy+dy,R*k,0,Math.PI*2);}
  c.rect(x-w/2+h*.05,y-h*.3,w-h*.1,h*.3);};
 c.save();c.beginPath();c.rect(x-w,y-h*3,w*2,h*3+h*.06);c.clip(); // base plana
 c.save();c.filter=`blur(${soft*1.5}px)`;c.fillStyle=rgb(pal.shade);sil(1.03,0,h*.05);c.fill();c.restore();
 c.save();c.filter=`blur(${soft}px)`;c.fillStyle=rgb(pal.base);sil(1,0,0);c.fill();c.restore();
 // llum: els mateixos lòbuls, més petits i desplaçats cap al sol i amunt, retallats dins la silueta
 c.save();sil(1,0,0);c.clip();c.filter=`blur(${soft}px)`;c.fillStyle=rgb(pal.light);sil(.74,sunDir*h*.16,-h*.18);c.fill();
 // ombra de sota: un degradat a la part baixa
 const g=c.createLinearGradient(0,y-h*.55,0,y+h*.04);g.addColorStop(0,rgb(pal.shade,0));g.addColorStop(1,rgb(pal.shade,.75));c.filter='none';c.fillStyle=g;c.fillRect(x-w,y-h*.6,w*2,h*.7);
 if(pal.rim){c.filter=`blur(${soft*.8}px)`;c.strokeStyle=rgb(pal.rim,.5);c.lineWidth=h*.05;for(const [cx,cy,R] of lobes){c.beginPath();c.arc(cx,cy,R*.92,Math.PI*(sunDir<0?1.05:1.4),Math.PI*(sunDir<0?1.6:1.95));c.stroke();}}
 c.restore();c.restore();}
// Un núvol de pinzell (estratus, boirina): una franja tova allargada.
export function wisp(c,x,y,w,h,seed,col,alpha=.6,soft=10){const r=rng(seed);c.save();c.filter=`blur(${soft}px)`;c.fillStyle=rgb(col);
 for(let i=0;i<5;i++){c.globalAlpha=alpha*(.5+r()*.5);c.beginPath();c.ellipse(x+(r()-.5)*w*.6,y+(r()-.5)*h*.5,w*(.25+r()*.3),h*(.25+r()*.3),(r()-.5)*.2,0,Math.PI*2);c.fill();}c.restore();}
// Una massa d'arbre: grumolls irregulars agrupats; ombra, cos, llum cap al sol, fulles clares a la vora de la llum i ombra a terra.
export function treeMass(c,x,y,w,h,seed,pal,o={}){const {trunk=true,soft=1,lumps=0,sunDir=-1,ground=true}=o;const r=rng(seed);const N=lumps||Math.max(3,Math.round(w/(h*.5)));const cs=[];
 for(let i=0;i<N;i++){const u=N===1?.5:i/(N-1);const R=h*(.26+r()*.16)*(1-.25*Math.pow(Math.abs(u-.5)*2,2));cs.push([x-w/2+R*.7+u*(w-R*1.4),y-h*.5-(1-Math.abs(u-.5)*2)*h*.14+(r()-.5)*h*.1,R,10+i+seed]);}
 cs.push([x+(r()-.5)*w*.2,y-h*.78,h*(.2+r()*.1),99+seed]);
 if(ground){c.save();c.filter=`blur(${Math.max(2,h*.04)}px)`;c.globalCompositeOperation='multiply';c.fillStyle=rgb(pal.shade,.45);c.beginPath();c.ellipse(x-sunDir*w*.08,y+2,w*.46,h*.06,0,0,Math.PI*2);c.fill();c.restore();}
 if(trunk){c.save();c.strokeStyle=rgb(pal.trunk||[70,48,36]);c.lineWidth=Math.max(2,w*.07);c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x+(r()-.5)*w*.06,y-h*.5);c.stroke();c.restore();}
 const sil=(k,dx,dy)=>{c.beginPath();for(const [cx,cy,R,sd] of cs){const b=blob(cx+dx,cy+dy,R*k,sd,.14,18);c.moveTo(b[0][0],b[0][1]);for(const p of b)c.lineTo(p[0],p[1]);c.closePath();}};
 c.save();c.filter=`blur(${soft*1.4}px)`;c.fillStyle=rgb(pal.shade);sil(1.03,0,h*.03);c.fill();c.restore();
 c.save();sil(1,0,0);c.clip();c.filter=`blur(${soft}px)`;c.fillStyle=rgb(pal.base);sil(.92,sunDir*w*.04,-h*.05);c.fill();
 c.fillStyle=rgb(pal.light);sil(.68,sunDir*w*.1,-h*.12);c.fill();c.filter='none';
 if(pal.dab){c.fillStyle=rgb(pal.dab);for(const [cx,cy,R] of cs){const nd=2+Math.floor(r()*4);for(let i=0;i<nd;i++){c.globalAlpha=.3+r()*.5;const a=Math.PI*(sunDir<0?.9:.1)+(r()-.5)*1.4;const d=R*(.3+r()*.5);c.beginPath();c.ellipse(cx+Math.cos(a)*d*sunDir*-1,cy-Math.abs(Math.sin(a))*d,R*(.06+r()*.12),R*(.04+r()*.06),(r()-.5)*1.2,0,Math.PI*2);c.fill();}}}
 c.restore();}
// Un xiprer o pollancre: una flama estreta amb el costat de llum.
export function poplar(c,x,y,w,h,seed,pal,sunDir=-1){const pts=[];const r=rng(seed);for(let i=0;i<=10;i++){const u=i/10;pts.push([x-w/2*Math.sin(u*Math.PI)*(1+(r()-.5)*.25),y-u*h]);}for(let i=10;i>=0;i--){const u=i/10;pts.push([x+w/2*Math.sin(u*Math.PI)*(1+(r()-.5)*.25),y-u*h]);}
 const s=smooth(pts,2,true);softShape(c,s,pal.shade,1);fill(c,scale(shift(s,sunDir*w*.14,0),x,y-h*.5,.78),pal.light,.8);}
// Serralada: la silueta pintada a guaix; a cada cim, una cara d'ombra tova i irregular amb estrats, una cara de llum; neu irregular als cims alts; calitja a la base.
export function mountains(c,ridge,baseY,pal,o={}){const {sunDir=-1,snowAbove=null,soft=.8,haze=null,facets=true}=o;const poly=[...ridge,P(ridge[ridge.length-1][0],baseY),P(ridge[0][0],baseY)];
 gouache(c,poly,pal.base,{seed:3,strokes:14,soft,light:.08,dark:.06,long:.5});
 const peaks=[];for(let i=3;i<ridge.length-3;i++){let ok=true;for(let d=-3;d<=3;d++)if(d&&ridge[i+d][1]<ridge[i][1]-.01)ok=false;if(ok&&baseY-ridge[i][1]>22)peaks.push(i);}
 c.save();path(c,poly);c.clip();const r=rng(ridge.length+baseY);
 if(facets)for(const i of peaks){const p=ridge[i];const depth=baseY-p[1];const span=Math.round(ridge.length*(.05+r()*.05));
  // cara d'ombra: del cim, seguint la cresta cap al costat contrari del sol, i avall amb una vora ondulada
  const j=Math.min(ridge.length-1,Math.max(0,i-sunDir*span));const q=ridge[j];const face=[p];for(let k=1;k<=4;k++){const t=k/4;face.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
  const fx=q[0]+(q[0]-p[0])*(.2+r()*.5);face.push([fx,baseY+4],[p[0]+(q[0]-p[0])*(-.1+r()*.3)+(r()-.5)*depth*.2,baseY+4],[p[0]-(q[0]-p[0])*.08,p[1]+depth*.55]);
  c.save();c.filter=`blur(${soft*2.2}px)`;tone(c,smooth(face,3,true),pal.shade,.3+r()*.1);c.restore();
  // estrats: tres traços inclinats dins la cara d'ombra
  c.save();path(c,smooth(face,3,true));c.clip();c.strokeStyle=rgb(pal.shade,.22);c.lineCap='round';for(let k=0;k<3;k++){c.lineWidth=2+r()*3;const y0=p[1]+depth*(.25+k*.22+r()*.1);c.beginPath();c.moveTo(p[0]-sunDir*depth*.1,y0);c.lineTo(q[0]+(q[0]-p[0])*.5,y0+depth*(.12+r()*.1));c.stroke();}c.restore();
  // cara de llum: una pinzellada clara cap al sol
  const lf=[p,[p[0]+sunDir*depth*(.35+r()*.3),p[1]+depth*(.4+r()*.2)],[p[0]+sunDir*depth*.25,baseY+4],[p[0]-sunDir*depth*.05,baseY+4]];
  c.save();c.filter=`blur(${soft*2.5}px)`;tone(c,smooth(lf,3,true),pal.light,.14+r()*.08,'screen');c.restore();
  // neu: un llenç irregular penjat del cim, més gran com més alt
  if(snowAbove!==null&&p[1]<snowAbove){const w=8+(snowAbove-p[1])*(.45+r()*.3);const cap=[[p[0],p[1]-3]];const n=7;for(let k=0;k<=n;k++){const t=k/n;const ang=Math.PI*(.15+t*.7);cap.push([p[0]+Math.cos(ang)*w*(1+(r()-.5)*.5),p[1]+Math.sin(ang)*w*(.55+(r()-.5)*.5)+(k%2)*w*.25]);}
   c.save();c.filter=`blur(${soft*.8}px)`;fill(c,smooth(cap,3,true),pal.snow||[250,250,255],.9);c.restore();}}
 if(haze){const y0=bounds(ridge).y;const g=c.createLinearGradient(0,baseY-(baseY-y0)*1.1,0,baseY);g.addColorStop(0,rgb(haze[0],0));g.addColorStop(1,rgb(haze[0],haze[1]));c.fillStyle=g;c.fillRect(-100,y0-10,2000,baseY-y0+20);}
 c.restore();}
// Una casa: parets, teulada a dues aigües, finestres. «lit» encén les finestres.
export function house(c,x,y,w,h,pal,o={}){const {lit=false,roofK=.42,chimney=true,line:ln=null,sunDir=-1}=o;const rh=h*roofK;
 const wall=[P(x-w/2,y),P(x+w/2,y),P(x+w/2,y-h+rh),P(x-w/2,y-h+rh)];fill(c,wall,pal.wall);tone(c,sunDir<0?[P(x,y),P(x+w/2,y),P(x+w/2,y-h+rh),P(x,y-h+rh)]:[P(x-w/2,y),P(x,y),P(x,y-h+rh),P(x-w/2,y-h+rh)],pal.wallShade||[90,70,80],.18);
 const roof=[P(x-w/2-w*.08,y-h+rh),P(x,y-h-rh*.1),P(x+w/2+w*.08,y-h+rh)];fill(c,roof,pal.roof);tone(c,sunDir<0?[P(x,y-h-rh*.1),P(x+w/2+w*.08,y-h+rh),P(x,y-h+rh)]:[P(x-w/2-w*.08,y-h+rh),P(x,y-h-rh*.1),P(x,y-h+rh)],[60,30,40],.2);
 if(chimney)fill(c,[P(x+w*.2,y-h+rh*.3),P(x+w*.2+w*.12,y-h+rh*.3),P(x+w*.2+w*.12,y-h-rh*.25),P(x+w*.2,y-h-rh*.25)],pal.chimney||pal.roof);
 const wc=lit?pal.lit||[255,214,120]:pal.win||[70,80,110];const ww=w*.16,wh=h*.16;for(const [wx,wy] of [[x-w*.22,y-h*.45],[x+w*.22,y-h*.45]]){c.fillStyle=rgb(wc);c.fillRect(wx-ww/2,wy-wh/2,ww,wh);}
 if(ln){line(c,[...wall],{...ln,close:true});line(c,roof,{...ln});}}
export function tower(c,x,y,w,h,pal,o={}){const {lit=false,line:ln=null}=o;const body=[P(x-w/2,y),P(x+w/2,y),P(x+w/2,y-h),P(x-w/2,y-h)];fill(c,body,pal.wall);tone(c,[P(x,y),P(x+w/2,y),P(x+w/2,y-h),P(x,y-h)],[90,70,80],.18);
 const top=[P(x-w*.62,y-h),P(x,y-h-w*.9),P(x+w*.62,y-h)];fill(c,top,pal.roof);c.fillStyle=rgb(lit?pal.lit||[255,214,120]:[50,50,70]);c.fillRect(x-w*.16,y-h*.82,w*.32,h*.2);
 if(ln){line(c,body,{...ln,close:true});line(c,top,{...ln,close:true});}}
// Un cel amb degradat per parades i una boirina a l'horitzó.
export function sky(c,W,H,stops,haze=null){const g=c.createLinearGradient(0,0,0,H);for(const [t,col] of stops)g.addColorStop(t,rgb(col));c.fillStyle=g;c.fillRect(0,0,W,H);
 if(haze){const [y0,y1,col,a]=haze;const h=c.createLinearGradient(0,y0,0,y1);h.addColorStop(0,rgb(col,0));h.addColorStop(1,rgb(col,a));c.fillStyle=h;c.fillRect(0,y0,W,y1-y0);}}
export function sun(c,x,y,r,col,glow,gr=4){const g=c.createRadialGradient(x,y,r*.6,x,y,r*gr);g.addColorStop(0,rgb(glow,.55));g.addColorStop(.35,rgb(glow,.18));g.addColorStop(1,rgb(glow,0));c.fillStyle=g;c.fillRect(x-r*gr,y-r*gr,r*gr*2,r*gr*2);
 c.fillStyle=rgb(col);c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
export function stars(c,W,yMax,n,seed,alpha=.9){const r=rng(seed);c.save();for(let i=0;i<n;i++){const x=r()*W,y=r()*yMax,s=.6+r()*1.4,a=alpha*(.35+r()*.65)*(1-y/yMax*.5);c.fillStyle=`rgba(255,250,230,${a})`;c.beginPath();c.arc(x,y,s,0,Math.PI*2);c.fill();}c.restore();}
export function bird(c,x,y,s,phase,col=[50,40,40],w=1.4){c.save();c.strokeStyle=rgb(col);c.lineWidth=w;c.lineCap='round';const k=Math.sin(phase);c.beginPath();c.moveTo(x-s,y-k*s*.5);c.quadraticCurveTo(x-s*.45,y+k*s*.25,x,y);c.quadraticCurveTo(x+s*.45,y+k*s*.25,x+s,y-k*s*.5);c.stroke();c.restore();}
export function flock(c,x,y,n,s,seed,col,spread=1){const r=rng(seed);for(let i=0;i<n;i++){const side=i%2?1:-1,k=Math.ceil(i/2);bird(c,x+side*k*s*2.2*spread,y+k*s*1.3*spread,s*(.8+r()*.4),r()*6.3,col,Math.max(.8,s*.18));}}
// Camps en retalls: una graella irregular en perspectiva (files que s'estrenyen cap al fons, vèrtexs desplaçats), cada cel·la d'un to,
// algunes amb solcs; tanques fosques entre cel·les; un camí clar que serpenteja.
export function patchwork(c,pts,pals,seed,o={}){const {rows=6,hedge=null,vanish=.35,furrow=null,road=null}=o;const b=bounds(pts),r=rng(seed);c.save();path(c,pts);c.clip();
 const ys=[];for(let i=0;i<=rows;i++){const u=i/rows;ys.push(b.y+b.h*Math.pow(u,1.5));}
 const kAt=y=>1-(1-vanish)*(1-(y-b.y)/b.h);const cx=b.x+b.w/2;
 // vèrtexs: per cada fila límit, una llista de x (en unitats -1..1 del centre) amb desplaçaments; les files no s'alineen entre elles
 for(let i=0;i<rows;i++){const y0=ys[i],y1=ys[i+1],rh=y1-y0;const k0=kAt(y0),k1=kAt(y1);
  let x=-1.2+r()*.2;const cells=[];while(x<1.2){const w=.1+r()*.26;cells.push([x,x+w]);x+=w;}
  const skew=(r()-.5)*.12;
  for(const [u0,u1] of cells){const jy=()=>(r()-.5)*rh*.3,jx=()=>(r()-.5)*.03;
   const q=[[cx+(u0+jx())*b.w*k0+skew*rh,y0+jy()],[cx+(u1+jx())*b.w*k0+skew*rh,y0+jy()],[cx+(u1+jx())*b.w*k1,y1+jy()],[cx+(u0+jx())*b.w*k1,y1+jy()]];
   const col=pals[Math.floor(r()*pals.length)];gouache(c,q,col,{seed:seed+i*31+Math.round(u0*100),strokes:5,light:.07,dark:.07,long:.6,soft:.4});
   if(furrow&&r()<.4){c.save();path(c,q);c.clip();c.strokeStyle=rgb(furrow,.3);c.lineWidth=1;const n=Math.max(3,Math.round(rh/6));for(let k=1;k<n;k++){const t=k/n;c.beginPath();c.moveTo(q[0][0]+(q[3][0]-q[0][0])*t,q[0][1]+(q[3][1]-q[0][1])*t);c.lineTo(q[1][0]+(q[2][0]-q[1][0])*t,q[1][1]+(q[2][1]-q[1][1])*t);c.stroke();}c.restore();}
   if(hedge&&r()<.7){line(c,[q[0],q[1]],{col:hedge,width:1+k0*2.6,alpha:.5});}
   if(hedge&&r()<.35){line(c,[q[1],q[2]],{col:hedge,width:.8+k0*2,alpha:.4});}}}
 if(road){const q=[];for(let i=0;i<=6;i++){const t=i/6;q.push([road[0]+(road[2]-road[0])*t+Math.sin(t*5.5+seed)*b.w*.05*(.3+t),b.y+b.h*Math.pow(t,1.4)]);}const sm=smooth(q,5);
  c.save();c.filter='blur(.6px)';line(c,sm,{col:road[1]||[236,226,200],width:1,alpha:.85,taper:0});for(let i=1;i<sm.length;i++){const t=i/sm.length;c.lineWidth=.8+kAt(sm[i][1])*5;c.strokeStyle=rgb(road[1]||[236,226,200],.8);c.beginPath();c.moveTo(sm[i-1][0],sm[i-1][1]);c.lineTo(sm[i][0],sm[i][1]);c.stroke();}c.restore();}
 c.restore();}
// Un riu: dos marges suavitzats amb el color de l'aigua i reflexos clars.
export function river(c,axis,widths,pal,seed=1,o={}){const ax=smooth(axis,6),Lb=[],Rb=[];for(let i=0;i<ax.length;i++){const u=i/(ax.length-1),k=u*(widths.length-1),j=Math.min(widths.length-2,Math.floor(k)),w=widths[j]+(widths[j+1]-widths[j])*(k-j);
 const a=ax[Math.max(0,i-1)],b=ax[Math.min(ax.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1;Lb.push([ax[i][0]-dy/n*w/2,ax[i][1]+dx/n*w/2]);Rb.push([ax[i][0]+dy/n*w/2,ax[i][1]-dx/n*w/2]);}
 const poly=[...Lb,...rev(Rb)];gouache(c,poly,pal.base,{seed,strokes:14,light:.12,dark:.06,long:.5});if(pal.bank){c.save();c.filter='blur(1px)';line(c,Lb,{col:pal.bank,width:2.5,alpha:.5});line(c,Rb,{col:pal.bank,width:2.5,alpha:.5});c.restore();}
 if(pal.light){c.save();path(c,poly);c.clip();const r=rng(seed+3);c.fillStyle=rgb(pal.light);for(let i=0;i<ax.length;i+=3){c.globalAlpha=.25+r()*.45;const w=8+r()*22;c.beginPath();c.ellipse(ax[i][0]+(r()-.5)*20,ax[i][1]+(r()-.5)*8,w,1.2+r()*1.4,0,0,Math.PI*2);c.fill();}c.restore();}
 return {L:Lb,R:Rb,poly};}
// Una filera d'arbres petits (bosquina de la plana).
export function treeLine(c,pts,h,seed,pal,o={}){const r=rng(seed);const q=smooth(pts,3);for(let i=0;i<q.length;i+=Math.max(1,Math.round(h*.35))){const p=q[i];treeMass(c,p[0],p[1],h*(1+r()*.6),h*(.8+r()*.5),seed+i,pal,{soft:.6,lumps:3,ground:false,trunk:false});}}
