// Estiu a la masia (EN26), 0.39: the painting toolkit. Backgrounds are painted the way a film background is: opaque layers, soft edges,
// a brush grain, and a light with a direction that depends on the hour of the day. Everything here is pure Canvas 2D and works on any
// context (the sheets of the sets, the live frame, the tests). Names start with mp (masia pinzell).
import {cpuSheet} from './carrega.js';
export const MS_SHEET=Object.freeze([1280,800]);
export const MP_TAU=Math.PI*2;
export function mpHash(i,j,k=0){let h=(i*374761393+j*668265263+k*1274126177)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296;}
export function mpNoise(x,y,k=0){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=mpHash(xi,yi,k),b=mpHash(xi+1,yi,k),c=mpHash(xi,yi+1,k),d=mpHash(xi+1,yi+1,k);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
export function mpFbm(x,y,k=0,o=4){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=a*mpNoise(x*f,y*f,k+i*7);n+=a;a*=.5;f*=2;}return s/n;}
export function mpRng(seed){let s=(Math.floor(seed*2654435761)>>>0)||1;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
export const mpClamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
export const mpLerp=(a,b,t)=>a+(b-a)*t;
export const mpEase=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
// ── Colours: [r,g,b] 0..255 ───────────────────────────────────────────────────────────────────────────────────────────────────────
export const mpRgb=(c,a=1)=>`rgba(${c[0]+.5|0},${c[1]+.5|0},${c[2]+.5|0},${a})`;
export const mpMix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
export const mpLight=(c,t)=>mpMix(c,[255,255,255],t);
export const mpDark=(c,t)=>mpMix(c,[0,0,0],t);
export const mpHex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
export const mpSat=(c,t)=>{const l=c[0]*.3+c[1]*.59+c[2]*.11;return c.map(v=>mpClamp(l+(v-l)*(1+t),0,255));};
export const mpWarm=(c,t)=>[mpClamp(c[0]+40*t,0,255),mpClamp(c[1]+10*t,0,255),mpClamp(c[2]-40*t,0,255)];
// Tints a colour with the light of the hour: lit faces take the sun colour, shaded faces take the sky colour.
export const mpLit=(c,L,k=.25)=>mpMix(c,mpMix(c,L.sun,.55),k*L.lightK);
export const mpShade=(c,L,k=.3)=>mpDark(mpMix(c,L.shadeTint,k*.6),k*.9*L.shadowK);
// ── Paths ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const mpP=(x,y)=>[x,y];
export function mpSmooth(pts,n=4,closed=false){const out=[];const N=pts.length;if(N<2)return pts.slice();const at=i=>pts[closed?((i%N)+N)%N:Math.max(0,Math.min(N-1,i))];
 const last=closed?N:N-1;for(let i=0;i<last;i++){const p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2);for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;
  out.push([.5*(2*p1[0]+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*(2*p1[1]+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
 if(!closed)out.push(pts[N-1]);return out;}
export function mpPath(c,pts,close=true){c.beginPath();for(let i=0;i<pts.length;i++){const p=pts[i];if(i)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);}if(close)c.closePath();}
export function mpBounds(pts){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){if(p[0]<x0)x0=p[0];if(p[1]<y0)y0=p[1];if(p[0]>x1)x1=p[0];if(p[1]>y1)y1=p[1];}return {x:x0,y:y0,w:x1-x0,h:y1-y0,cx:(x0+x1)/2,cy:(y0+y1)/2};}
export function mpInside(poly,x,y){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;}return inside;}
export function mpBlob(cx,cy,rx,seed,amp=.15,n=28,ry=rx){const pts=[];for(let i=0;i<n;i++){const a=i/n*MP_TAU,k=1+amp*(mpNoise(Math.cos(a)*1.7+seed*3.1,Math.sin(a)*1.7+seed*5.3,seed)-.5)*2;pts.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]);}return mpSmooth(pts,3,true);}
export const mpShift=(pts,dx,dy)=>pts.map(p=>[p[0]+dx,p[1]+dy]);
export const mpScalePts=(pts,cx,cy,k,ky=k)=>pts.map(p=>[cx+(p[0]-cx)*k,cy+(p[1]-cy)*ky]);
export const mpRect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
export function mpEllipsePts(cx,cy,rx,ry,n=32,rot=0){const pts=[];for(let i=0;i<n;i++){const a=i/n*MP_TAU,x=Math.cos(a)*rx,y=Math.sin(a)*ry;pts.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}return pts;}
// Points inside a polygon, deterministic (rejection sampling), n at most.
export function mpScatter(poly,n,seed,o={}){const b=mpBounds(poly),r=mpRng(seed),out=[];const {min=0}=o;let tries=0;while(out.length<n&&tries++<n*6){const x=b.x+r()*b.w,y=b.y+r()*b.h;if(!mpInside(poly,x,y))continue;
 if(min>0){let ok=true;for(let i=out.length-1;i>=0&&i>out.length-40;i--){const q=out[i];if((q[0]-x)*(q[0]-x)+(q[1]-y)*(q[1]-y)<min*min){ok=false;break;}}if(!ok)continue;}out.push([x,y,r()]);}return out;}
// ── Paint ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function mpFill(c,pts,col,alpha=1){c.save();c.globalAlpha*=alpha;mpPath(c,pts);c.fillStyle=mpRgb(col);c.fill();c.restore();}
// A soft patch: a blob whose edge fades out. A real blur is slow on big areas, so from 4 px on the fade is a radial gradient
// over the shape grown by the blur radius (the shape loses its detail, which is what a soft patch is for).
export function mpSoft(c,pts,col,blur=6,alpha=1){c.save();c.globalAlpha*=alpha;
 if(blur<4){c.filter=`blur(${blur}px)`;mpPath(c,pts);c.fillStyle=mpRgb(col);c.fill();c.restore();return;}
 const b=mpBounds(pts);const k=1+blur*1.6/Math.max(8,Math.min(b.w,b.h));const g=c.createRadialGradient(b.cx,b.cy,0,b.cx,b.cy,1);g.addColorStop(0,mpRgb(col,1));g.addColorStop(.45,mpRgb(col,.92));g.addColorStop(.8,mpRgb(col,.4));g.addColorStop(1,mpRgb(col,0));
 c.translate(b.cx,b.cy);c.scale(b.w/2*k,b.h/2*k);c.beginPath();for(let i=0;i<pts.length;i++){const p=pts[i];const x=(p[0]-b.cx)/(b.w/2),y=(p[1]-b.cy)/(b.h/2);if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.closePath();c.fillStyle=g;c.fill();c.restore();}
// A gouache mass: the shape filled, then wide soft strokes of lighter and darker tone inside it, a light side and a shade side.
export function mpGouache(c,pts,col,o={}){const {light=.1,dark=.1,seed=1,strokes=14,dir=0,soft=0,long=.35,alpha=1,sunDir=0,L=null}=o;
 c.save();c.globalAlpha*=alpha;if(soft)c.filter=`blur(${soft}px)`;mpPath(c,pts);c.fillStyle=mpRgb(col);c.fill();c.filter='none';c.clip();
 const b=mpBounds(pts),r=mpRng(seed);
 if(sunDir&&L){const g=c.createLinearGradient(b.cx-sunDir*b.w*.5,0,b.cx+sunDir*b.w*.5,0);g.addColorStop(0,mpRgb(mpShade(col,L,.35)));g.addColorStop(.5,mpRgb(col,0));g.addColorStop(1,mpRgb(mpLit(col,L,.35)));c.globalAlpha*=.8;c.fillStyle=g;c.fillRect(b.x,b.y,b.w,b.h);c.globalAlpha/= .8;}
 for(let i=0;i<strokes;i++){const x=b.x+r()*b.w,y=b.y+r()*b.h,w=(long*.5+r()*long)*Math.max(60,b.w),h=(.04+r()*.1)*Math.max(40,b.h);const k=r()<.5?mpLight(col,light*(.4+r())):mpDark(col,dark*(.4+r()));
  c.save();c.translate(x,y);c.rotate(dir+(r()-.5)*.35);c.scale(w/2,h/2);const gs=c.createRadialGradient(0,0,0,0,0,1);gs.addColorStop(0,mpRgb(k,.22));gs.addColorStop(.6,mpRgb(k,.14));gs.addColorStop(1,mpRgb(k,0));c.fillStyle=gs;c.beginPath();c.arc(0,0,1,0,MP_TAU);c.fill();c.restore();}
 c.restore();}
export function mpGrad(c,pts,stops,alpha=1,mode='source-over',dir='v'){const b=mpBounds(pts);c.save();c.globalCompositeOperation=mode;mpPath(c,pts);c.clip();const g=dir==='v'?c.createLinearGradient(0,b.y,0,b.y+b.h):c.createLinearGradient(b.x,0,b.x+b.w,0);
 for(const [t,col,a] of stops)g.addColorStop(mpClamp(t),mpRgb(col,a===undefined?1:a));c.globalAlpha*=alpha;c.fillStyle=g;c.fillRect(b.x-2,b.y-2,b.w+4,b.h+4);c.restore();}
export function mpTone(c,pts,col,alpha=.22,mode='multiply',blur=0){c.save();c.globalCompositeOperation=mode;c.globalAlpha*=alpha;mpPath(c,pts);c.fillStyle=mpRgb(col);c.fill();if(blur){c.globalAlpha*=.5;c.lineJoin='round';c.strokeStyle=mpRgb(col);c.lineWidth=blur*1.5;c.stroke();}c.restore();}
export function mpLine(c,pts,o={}){const {col=[52,36,28],width=2,alpha=1,close=false,taper=0,cap='round'}=o;if(pts.length<2)return;c.save();c.strokeStyle=mpRgb(col,alpha);c.lineCap=cap;c.lineJoin='round';
 if(!taper){c.lineWidth=width;mpPath(c,pts,close);c.stroke();}
 else{for(let i=1;i<pts.length;i++){const u=i/(pts.length-1);c.lineWidth=Math.max(.3,width*(1-taper*Math.pow(Math.abs(u-.5)*2,1.6)));c.beginPath();c.moveTo(pts[i-1][0],pts[i-1][1]);c.lineTo(pts[i][0],pts[i][1]);c.stroke();}}
 c.restore();}
// A fine brush grain over a zone (never a paper grain over the whole picture).
export function mpGrain(c,x,y,w,h,amount=.05,seed=3,cell=9){const r=mpRng(seed);c.save();const n=(w*h)/(cell*cell)*.5;for(let i=0;i<n;i++){const px=x+r()*w,py=y+r()*h,k=mpNoise(px/60,py/60,seed);c.globalAlpha=amount*Math.abs(k-.5)*2;c.fillStyle=k>.5?'#fff':'#000';c.beginPath();c.ellipse(px,py,cell*(.4+r()*.8),cell*(.2+r()*.3),r()*3,0,MP_TAU);c.fill();}c.restore();}
export function mpVignette(c,W,H,a=.18){const g=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.45,W/2,H/2,Math.max(W,H)*.78);g.addColorStop(0,'rgba(20,10,30,0)');g.addColorStop(1,`rgba(20,10,30,${a})`);c.save();c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();}
// ── The hour of the day ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// h from 0 (early morning) to 1 (dusk). Returns the light: sun direction and height, sky stops, sun and shade tints, shadow strength,
// haze colour and strength, global warmth and saturation. Four key moments, blended.
const MP_HOURS=[
 {h:0,  sunX:.85,sunY:.22,sky:[[0,[86,132,204]],[.45,[150,190,230]],[.78,[214,226,232]],[1,[238,230,214]]],sun:[255,236,196],shadeTint:[110,130,190],lightK:.9,shadowK:.75,haze:[[226,224,224],.5],warm:.05,sat:0,glow:[255,220,170],cloud:{shade:[176,180,206],base:[236,236,240],light:[255,252,246],rim:[255,236,200]},ground:[0,0,0]},
 {h:.36,sunX:.35,sunY:.05,sky:[[0,[48,110,206]],[.5,[112,172,232]],[.84,[192,222,236]],[1,[220,236,240]]],sun:[255,252,236],shadeTint:[96,124,196],lightK:1,shadowK:.9,haze:[[220,236,242],.36],warm:0,sat:.05,glow:[255,250,220],cloud:{shade:[160,172,206],base:[246,246,250],light:[255,255,255],rim:null},ground:[0,0,0]},
 {h:.7, sunX:-.55,sunY:.2,sky:[[0,[64,114,196]],[.5,[138,180,226]],[.84,[222,220,206]],[1,[244,226,190]]],sun:[255,232,170],shadeTint:[120,120,190],lightK:1,shadowK:.85,haze:[[240,226,200],.42],warm:.18,sat:.08,glow:[255,210,140],cloud:{shade:[180,160,186],base:[244,232,220],light:[255,246,226],rim:[255,228,170]},ground:[0,0,0]},
 {h:1,  sunX:-.92,sunY:.42,sky:[[0,[76,66,140]],[.4,[180,112,130]],[.74,[250,170,110]],[1,[255,208,140]]],sun:[255,200,130],shadeTint:[110,80,150],lightK:1,shadowK:.95,haze:[[255,190,140],.5],warm:.4,sat:.1,glow:[255,150,80],cloud:{shade:[150,90,130],base:[240,150,130],light:[255,218,160],rim:[255,236,190]},ground:[0,0,0]}];
export function mpHour(h){h=mpClamp(h);let i=0;while(i<MP_HOURS.length-2&&MP_HOURS[i+1].h<=h)i++;const A=MP_HOURS[i],B=MP_HOURS[i+1],t=mpEase((h-A.h)/(B.h-A.h));
 const m=(a,b)=>a+(b-a)*t,mc=(a,b)=>mpMix(a,b,t);
 const sky=A.sky.map((s,k)=>[m(s[0],B.sky[k][0]),mc(s[1],B.sky[k][1])]);
 return {h,sunX:m(A.sunX,B.sunX),sunY:m(A.sunY,B.sunY),sunDir:Math.sign(m(A.sunX,B.sunX))||1,sky,sun:mc(A.sun,B.sun),shadeTint:mc(A.shadeTint,B.shadeTint),lightK:m(A.lightK,B.lightK),shadowK:m(A.shadowK,B.shadowK),
  haze:[mc(A.haze[0],B.haze[0]),m(A.haze[1],B.haze[1])],warm:m(A.warm,B.warm),sat:m(A.sat,B.sat),glow:mc(A.glow,B.glow),cloud:{shade:mc(A.cloud.shade,B.cloud.shade),base:mc(A.cloud.base,B.cloud.base),light:mc(A.cloud.light,B.cloud.light),rim:mc(A.cloud.rim||B.cloud.rim||[255,236,200],B.cloud.rim||A.cloud.rim||[255,236,200]),rimK:m(A.cloud.rim?1:0,B.cloud.rim?1:0)},
  dusk:mpClamp((h-.7)/.3),night:0};}
// A colour of the scene under the light of the hour: warmer and a little more saturated at dusk.
export const mpCol=(c,L,k=1)=>mpSat(mpWarm(c,L.warm*k),L.sat*k);
// ── Sky, sun, clouds, haze, light ────────────────────────────────────────────────────────────────────────────────────────────────
export function mpSky(c,W,H,L,horizon){const g=c.createLinearGradient(0,0,0,horizon);for(const [t,col] of L.sky)g.addColorStop(t,mpRgb(col));c.fillStyle=g;c.fillRect(0,0,W,horizon+2);
 // the glow of the sun near the horizon
 const sx=W*(.5+L.sunX*.5),sy=horizon-horizon*(1-L.sunY)*.85;const r=W*.55;const gg=c.createRadialGradient(sx,sy,0,sx,sy,r);gg.addColorStop(0,mpRgb(L.glow,.5*(.4+L.dusk*.6)));gg.addColorStop(.3,mpRgb(L.glow,.16));gg.addColorStop(1,mpRgb(L.glow,0));c.fillStyle=gg;c.fillRect(0,0,W,horizon+2);
 return [sx,sy];}
export function mpSun(c,x,y,r,L){const g=c.createRadialGradient(x,y,r*.5,x,y,r*5);g.addColorStop(0,mpRgb(L.glow,.55));g.addColorStop(.3,mpRgb(L.glow,.18));g.addColorStop(1,mpRgb(L.glow,0));c.fillStyle=g;c.fillRect(x-r*5,y-r*5,r*10,r*10);c.fillStyle=mpRgb(mpLight(L.sun,.5));c.beginPath();c.arc(x,y,r,0,MP_TAU);c.fill();}
// A cumulus: a cauliflower of lobes in three tiers on a flat base. The mass is painted in the base tone with a soft edge, the underside
// takes the blue-grey shade in a vertical gradient, one broad light falls on the sun side, each lobe gets only a faint round light so the
// lobes read as soft forms and not as bubbles, and at dusk a thin warm rim.
export function mpCumulus(c,x,y,w,h,seed,L,o={}){const {soft=2,alpha=1}=o,pal=L.cloud,sd=L.sunDir,r=mpRng(seed);
 const lobes=[];const n=Math.max(3,Math.round(w/(h*.5)));
 for(let i=0;i<n;i++){const u=n===1?.5:i/(n-1);const edge=Math.pow(Math.abs(u-.5)*2,1.6);const R=h*(.32+r()*.14)*(1-.45*edge);lobes.push([x-w/2+R*.5+u*(w-R),y-R*.72-r()*h*.05,R]);}
 const top=Math.max(2,Math.round(n*.6));const off=(r()-.5)*w*.25;for(let i=0;i<top;i++){const u=top===1?.5:i/(top-1);const R=h*(.26+r()*.14)*(1-.3*Math.abs(u-.5)*2);lobes.push([x+off-w*.26+u*w*.52+(r()-.5)*h*.15,y-h*.54-R*.5-r()*h*.1,R]);}
 const bumps=Math.round(n*.8);for(let i=0;i<bumps;i++){const base=lobes[Math.floor(r()*lobes.length)];const a=-Math.PI*(.2+r()*.6);const R=base[2]*(.35+r()*.25);lobes.push([base[0]+Math.cos(a)*base[2]*.8,base[1]+Math.sin(a)*base[2]*.8,R]);}
 const sil=(k,dx,dy)=>{c.beginPath();for(const [cx,cy,R] of lobes){c.moveTo(cx+dx+R*k,cy+dy);c.arc(cx+dx,cy+dy,R*k,0,MP_TAU);}c.rect(x-w/2+h*.08,y-h*.3,w-h*.16,h*.3);};
 c.save();c.globalAlpha*=alpha;c.beginPath();c.rect(x-w,y-h*3,w*2,h*3+h*.04);c.clip();
 c.save();c.filter=`blur(${soft}px)`;c.fillStyle=mpRgb(pal.base);sil(1,0,0);c.fill();c.restore();
 c.save();c.filter=`blur(${soft*.6}px)`;sil(1,0,0);c.clip();c.filter='none';
 // the underside: shade rising from the base
 const g=c.createLinearGradient(0,y-h*1.1,0,y+h*.02);g.addColorStop(0,mpRgb(pal.shade,0));g.addColorStop(.5,mpRgb(pal.shade,.3));g.addColorStop(1,mpRgb(pal.shade,.9));c.fillStyle=g;c.fillRect(x-w,y-h*1.3,w*2,h*1.4);
 // the shade side (away from the sun) and the broad light on the sun side
 const gs=c.createLinearGradient(x-sd*w*.5,0,x+sd*w*.5,0);gs.addColorStop(0,mpRgb(pal.shade,.4));gs.addColorStop(.6,mpRgb(pal.shade,0));c.fillStyle=gs;c.fillRect(x-w,y-h*1.3,w*2,h*1.4);
 const gl=c.createRadialGradient(x+sd*w*.18,y-h*.75,h*.1,x+sd*w*.1,y-h*.5,w*.6);gl.addColorStop(0,mpRgb(pal.light,.9));gl.addColorStop(.5,mpRgb(pal.light,.3));gl.addColorStop(1,mpRgb(pal.light,0));c.fillStyle=gl;c.fillRect(x-w,y-h*1.3,w*2,h*1.4);
 // faint round lights and shades per lobe (the cauliflower)
 c.filter=`blur(${soft}px)`;for(const [cx,cy,R] of lobes){let q=c.createRadialGradient(cx+sd*R*.25,cy-R*.3,0,cx+sd*R*.15,cy-R*.15,R*1.1);q.addColorStop(0,mpRgb(pal.light,.5));q.addColorStop(1,mpRgb(pal.light,0));c.fillStyle=q;c.fillRect(cx-R*1.3,cy-R*1.3,R*2.6,R*2.6);
  q=c.createRadialGradient(cx-sd*R*.5,cy+R*.55,0,cx-sd*R*.35,cy+R*.4,R*1.1);q.addColorStop(0,mpRgb(pal.shade,.22));q.addColorStop(1,mpRgb(pal.shade,0));c.fillStyle=q;c.fillRect(cx-R*1.3,cy-R*1.3,R*2.6,R*2.6);}
 if(pal.rimK>0){c.strokeStyle=mpRgb(pal.rim,.5*pal.rimK);c.lineWidth=h*.035;for(const [cx,cy,R] of lobes){c.beginPath();c.arc(cx,cy,R*.93,Math.PI*(sd<0?1.05:1.4),Math.PI*(sd<0?1.6:1.95));c.stroke();}}
 c.restore();c.restore();}
export function mpWisp(c,x,y,w,h,seed,col,alpha=.5,soft=10){const r=mpRng(seed);for(let i=0;i<5;i++){const ex=x+(r()-.5)*w*.6,ey=y+(r()-.5)*h*.5,rx=w*(.25+r()*.3)+soft,ry=h*(.25+r()*.3)+soft*.5;c.save();c.translate(ex,ey);c.rotate((r()-.5)*.2);c.scale(rx,ry);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,mpRgb(col,alpha*(.5+r()*.5)));g.addColorStop(.5,mpRgb(col,alpha*.3));g.addColorStop(1,mpRgb(col,0));c.fillStyle=g;c.beginPath();c.arc(0,0,1,0,MP_TAU);c.fill();c.restore();}}
export function mpHaze(c,W,y0,y1,col,a){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,mpRgb(col,0));g.addColorStop(1,mpRgb(col,a));c.save();c.fillStyle=g;c.fillRect(0,y0,W,y1-y0);c.restore();}
// A shaft of light: a soft quadrilateral from (x,y) along an angle, that fades with the distance.
export function mpShaft(c,x,y,ang,w0,w1,len,col,a=.25,blur=8){c.save();c.translate(x,y);c.rotate(ang);c.filter=`blur(${blur}px)`;const g=c.createLinearGradient(0,0,len,0);g.addColorStop(0,mpRgb(col,a));g.addColorStop(.7,mpRgb(col,a*.5));g.addColorStop(1,mpRgb(col,0));c.fillStyle=g;c.globalCompositeOperation='screen';
 c.beginPath();c.moveTo(0,-w0/2);c.lineTo(len,-w1/2);c.lineTo(len,w1/2);c.lineTo(0,w0/2);c.closePath();c.fill();c.restore();}
// Dappled light on the ground under a tree: soft spots of sun inside a zone.
export function mpDapple(c,poly,col,seed,n=24,a=.35,size=18){const pts=mpScatter(poly,n,seed);c.save();mpPath(c,poly);c.clip();c.globalCompositeOperation='screen';c.filter='blur(3px)';for(const [x,y,k] of pts){c.globalAlpha=a*(.5+k*.5);c.fillStyle=mpRgb(col);c.beginPath();c.ellipse(x,y,size*(.6+k),size*(.3+k*.3),k*3,0,MP_TAU);c.fill();}c.restore();}
// A shadow on the ground: a soft ellipse, multiplied.
export function mpGroundShadow(c,x,y,rx,ry,L,a=.35,blur=4){c.save();c.globalCompositeOperation='multiply';c.translate(x,y);c.scale(rx+blur,ry+blur*.5);const col=mpMix([60,50,90],L.shadeTint,.4);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,mpRgb(col,a*L.shadowK));g.addColorStop(Math.max(.1,1-blur*1.6/(rx+blur)),mpRgb(col,a*L.shadowK));g.addColorStop(1,mpRgb(col,0));c.fillStyle=g;c.beginPath();c.arc(0,0,1,0,MP_TAU);c.fill();c.restore();}
// The shadow a thing of width w, height h and footprint depth d at (x,y) throws on the ground, away from the sun: the footprint and
// its copy pushed sideways by the shadow length (long at dusk, short at noon), bluish, multiplied. Trees use mpTreeShadow.
export function mpShadowLen(L){return .3+L.sunY*1.7;}
export function mpShadowVec(L,h){const len=h*mpShadowLen(L);return [-L.sunDir*len*(.55+Math.abs(L.sunX)*.5),-len*.1];}
export function mpCastShadow(c,x,y,w,h,L,a=.3,blur=3,o={}){const d=o.d??Math.min(h*.3,w*.4);const [dx,dy]=mpShadowVec(L,h);c.save();c.globalCompositeOperation='multiply';c.fillStyle=mpRgb(mpMix([70,80,140],L.shadeTint,.5),a*1.2*L.shadowK);c.lineJoin='round';c.strokeStyle=mpRgb(mpMix([70,80,140],L.shadeTint,.5),a*.5*L.shadowK);c.lineWidth=blur*1.5;
 c.beginPath();if(dx<0){c.moveTo(x+w/2,y-d);c.lineTo(x+w/2,y);c.lineTo(x-w/2,y);c.lineTo(x-w/2+dx,y+dy);c.lineTo(x-w/2+dx,y-d+dy);c.lineTo(x+w/2+dx,y-d+dy);}else{c.moveTo(x-w/2,y-d);c.lineTo(x-w/2,y);c.lineTo(x+w/2,y);c.lineTo(x+w/2+dx,y+dy);c.lineTo(x+w/2+dx,y-d+dy);c.lineTo(x-w/2+dx,y-d+dy);}c.closePath();c.fill();c.stroke();c.restore();}
export function mpTreeShadow(c,x,y,rx,ry,h,L,a=.32,blur=6){const [dx,dy]=mpShadowVec(L,h);c.save();c.globalCompositeOperation='multiply';c.translate(x+dx*.85,y+dy*.5+2);c.scale(rx*1.05+blur,ry*.34+blur*.5);const col=mpMix([70,80,140],L.shadeTint,.5);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,mpRgb(col,a*1.2*L.shadowK));g.addColorStop(.7,mpRgb(col,a*1.1*L.shadowK));g.addColorStop(1,mpRgb(col,0));c.fillStyle=g;c.beginPath();c.arc(0,0,1,0,MP_TAU);c.fill();c.restore();}
// Stamps n leaves or dabs inside a polygon; fn(x,y,k,r) draws one. Deterministic by seed.
export function mpStamp(c,poly,n,seed,fn,min=0){const pts=mpScatter(poly,n,seed,{min});const r=mpRng(seed+11);for(const [x,y,k] of pts)fn(x,y,k,r);}
// Cel shading helper shared with the characters: fills a shape, shades the side away from the light, draws the line.
export function mpCel(c,pts,col,o={}){const {line=null,shadeK=.18,lightK=.1,sunDir=1,shade=null,width=null,alpha=1,shadeCol=[70,40,80],lightCol=[255,250,230]}=o;c.save();c.globalAlpha*=alpha;mpPath(c,pts);c.fillStyle=mpRgb(col);c.fill();
 if(shadeK>0){c.save();mpPath(c,pts);c.clip();const b=mpBounds(pts);if(shade){mpPath(c,shade);c.globalCompositeOperation='multiply';c.globalAlpha*=shadeK*2.4;c.fillStyle=mpRgb(shadeCol);c.fill();}
  else{const g=c.createLinearGradient(b.cx-sunDir*b.w*.55,0,b.cx+sunDir*b.w*.55,0);g.addColorStop(0,mpRgb(mpDark(mpMix(col,shadeCol,.3),.25),shadeK*2.2));g.addColorStop(.55,mpRgb(col,0));g.addColorStop(1,mpRgb(mpMix(col,lightCol,.5),lightK*1.6));c.fillStyle=g;c.fillRect(b.x-2,b.y-2,b.w+4,b.h+4);}c.restore();}
 if(line){c.strokeStyle=mpRgb(line.col||[52,36,28],line.alpha??1);c.lineWidth=width||line.width||1.8;c.lineJoin='round';c.lineCap='round';mpPath(c,pts);c.stroke();}
 c.restore();}

// ── Sheets ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A cache of full-size canvases (a panorama at a key hour, the set of an episode), the oldest dropped first; null without a DOM.
const MP_SHEETS=new Map();
export const MP_SHEET_MAX=9;
export function mpSheet(c,key,paint,o={}){const cv=c.canvas;if(!cv||typeof document==='undefined')return null;const w=o.w||cv.width,h=o.h||cv.height;const full=key+'|'+w+'x'+h;let sheet=MP_SHEETS.get(full);
 // 0.40.1: painted with the processor and copied once to the graphics card (cpuSheet, carrega.js)
 if(!sheet){sheet=cpuSheet(w,h,paint);MP_SHEETS.set(full,sheet);if(MP_SHEETS.size>MP_SHEET_MAX)MP_SHEETS.delete(MP_SHEETS.keys().next().value);}
 else{MP_SHEETS.delete(full);MP_SHEETS.set(full,sheet);}return sheet;}
export function mpSheetHas(c,key,o={}){const cv=c.canvas;if(!cv)return false;const w=o.w||cv.width,h=o.h||cv.height;return MP_SHEETS.has(key+'|'+w+'x'+h);}
export function mpClearSheets(){MP_SHEETS.clear();}
// The cover-fit of the 1280×800 sheet on a w×h screen, and a camera on it: world point (cx,cy) at the centre of the screen, zoom z.
export function mpMap(w,h){const s=Math.max(w/MS_SHEET[0],h/MS_SHEET[1]);return [s,s,(w-MS_SHEET[0]*s)/2,(h-MS_SHEET[1]*s)/2];}
export function mpCam(w,h,cx,cy,z=1){const m=mpMap(w,h);const k=m[0]*z;return {cx,cy,z,k,ox:w/2-cx*k,oy:h/2-cy*k};}
export function mpCamBoard(w,h){const m=mpMap(w,h);return mpCam(w,h,(w/2-m[2])/m[0],(h/2-m[3])/m[1],1);}
