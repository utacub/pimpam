// El meu espectacle de llum (EN22), 0.18: the art. Coloured chalk on a school blackboard: a slate of deep green with the clouds of old
// rubbed-out chalk, a frame of wood and a tray with the sticks of chalk. At the bottom of the board a place is drawn in chalk (a bay, a
// mountain over a lake, a village square, a lake with a pier, a beach); over it the sky opens in tall windows, one per option, with the
// option drawn inside: a firework in the colour, the shape of the firework, or the instrument of the music. Only the window in focus
// moves (its rocket goes up and opens). Every chalk line is painted on a layer of its own and then loses a fine grain, as chalk does on
// the board. The show is the whole board: eight rockets go up from the boat and open in the chosen shape and colours, each one draws
// itself in half a second, holds and fades in a second, and leaves the faint trace of rubbed chalk; a rain of gold closes it.
// Light: the board never lights up as a whole; a firework is a drawing of lines with a soft rub of colour behind it.
import {GX_STAGES,GX_SHOW,GX_STEP,GX_RISE,GX_DRAW,GX_HOLD,GX_FADE,GX_RAIN,gxPlace,gxColors,gxShow} from './guix.js';
import {TL_DIM,TL_STRIP,TL_TAU,tlVeil,tlRing,tlSheet,tlRng} from './tauler.js';
import {escDecor,escDecorKey,escVeil} from './escenari.js';
const GC_PI=Math.PI;
const gcClamp=x=>Math.max(0,Math.min(1,x));
const gcEase=u=>{u=gcClamp(u);return 1-(1-u)*(1-u)*(1-u);};
const gcSmooth=u=>{u=gcClamp(u);return u*u*(3-2*u);};
const gcHex=h=>{const n=parseInt(h.slice(1,7),16);return [n>>16&255,n>>8&255,n&255];};
function gcShade(h,k){const f=x=>Math.round(Math.max(0,Math.min(255,k>0?x+(255-x)*k:x*(1+k))));return '#'+gcHex(h).map(x=>f(x).toString(16).padStart(2,'0')).join('');}
const gcRgba=(h,a)=>{const [r,g,b]=gcHex(h);return `rgba(${r},${g},${b},${a})`;};
// The chalks. On a white base without the board (ink), the same drawing is done in darker colours so that it shows.
const GC_WHITE='#f4f1e8',GC_COL={blue:'#7cc8ff',deep:'#5a9be0',green:'#8edb7a',pine:'#5fb07a',yellow:'#ffe27a',orange:'#ffb26a',red:'#ff7a6a',pink:'#ff9fd0',violet:'#b9a4ff',brown:'#d9a477',roof:'#ec8a62',sand:'#f2cf86'};
let GC_INK=false;
const gcC=col=>!GC_INK?col:col===GC_WHITE?'#2f3b45':gcShade(col,-.45);
// ── The chalk ──
// The grain: a tile of tiny marks that are taken out of what is drawn (destination-out), the black of the board showing between the
// grains of chalk. It is laid in device pixels, so it stays as fine on any screen.
let GC_GRAIN=null,GC_LAYER=null;
function gcGrain(){if(GC_GRAIN)return GC_GRAIN;const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d'),r=tlRng(41);
 for(let i=0;i<7000;i++){g.fillStyle=`rgba(0,0,0,${(.2+r()*.75).toFixed(3)})`;g.fillRect(r()*N,r()*N,1+r()*2.4,1+(r()<.35?1:0));}
 g.lineCap='round';for(let i=0;i<260;i++){const x=r()*N,y=r()*N,a=-.5+(r()-.5)*.5,l=4+r()*14;g.strokeStyle=`rgba(0,0,0,${(.15+r()*.35).toFixed(3)})`;g.lineWidth=.8+r()*1.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
 return GC_GRAIN=cv;}
// Draws paint() in chalk on c: on a layer of its own (the size of the canvas, or only of box), takes the grain out of it and lays it on
// c with c's own alpha and clip. Plain scenes and the tests draw straight on c.
function gcChalk(c,paint,plain=false,box=null){const cv=c.canvas;if(plain||!cv||typeof document==='undefined'||typeof c.getTransform!=='function'){paint(c);return;}
 if(!GC_LAYER)GC_LAYER=document.createElement('canvas');const L=GC_LAYER;if(L.width!==cv.width||L.height!==cv.height){L.width=cv.width;L.height=cv.height;}
 const T=c.getTransform(),x=L.getContext('2d');let r=[0,0,L.width,L.height];
 if(box){const x0=Math.max(0,Math.floor(T.a*box.x+T.e)-2),y0=Math.max(0,Math.floor(T.d*box.y+T.f)-2),x1=Math.min(L.width,Math.ceil(T.a*(box.x+box.w)+T.e)+2),y1=Math.min(L.height,Math.ceil(T.d*(box.y+box.h)+T.f)+2);if(x1<=x0||y1<=y0)return;r=[x0,y0,x1-x0,y1-y0];}
 x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.clearRect(...r);x.save();x.beginPath();x.rect(...r);x.clip();x.setTransform(T);paint(x);x.restore();
 x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='destination-out';x.fillStyle=x.createPattern(gcGrain(),'repeat');x.fillRect(...r);x.globalCompositeOperation='source-over';
 const ga=c.globalAlpha;c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=ga;c.globalCompositeOperation='source-over';c.drawImage(L,r[0],r[1],r[2],r[3],r[0],r[1],r[2],r[3]);c.restore();}
function gcDense(pts,step=8){const out=[pts[0]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],k=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let j=1;j<=k;j++)out.push([a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k]);}return out;}
const gcPath=(c,P)=>{c.beginPath();c.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)c.lineTo(P[i][0],P[i][1]);c.closePath();};
// A line of chalk through the points: a firm pass and a lighter, thinner one a little off it, so that its edges break like a real one.
function gcLine(c,pts,col,wd,seed,{alpha=1,close=false,passes=2}={}){if(pts.length<2)return;const P=gcDense(close?[...pts,pts[0]]:pts,Math.max(4,wd*2.5)),r=tlRng(seed),ga=c.globalAlpha;c.save();c.lineCap='round';c.lineJoin='round';c.strokeStyle=gcC(col);
 for(let p=0;p<passes;p++){c.globalAlpha=ga*alpha*(p?.5:.92);c.lineWidth=wd*(p?.55+r()*.25:1);const j=wd*(p?.45:.16);c.beginPath();P.forEach((q,i)=>{const x=q[0]+(r()-.5)*j,y=q[1]+(r()-.5)*j;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();}c.restore();}
function gcDot(c,x,y,r,col,alpha=1){const ga=c.globalAlpha;c.save();c.globalAlpha=ga*alpha;c.fillStyle=gcC(col);c.beginPath();c.arc(x,y,Math.max(.6,r),0,TL_TAU);c.fill();c.restore();}
// A surface coloured with the side of the chalk: a soft rub of the colour, and strokes across it.
function gcFill(c,pts,col,seed,{rub=.22,hatch=.55,ang=-.55,gap=6,wd=2.4}={}){const r=tlRng(seed),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),cx=(x0+x1)/2,cy=(y0+y1)/2,R=Math.hypot(x1-x0,y1-y0)/2+gap,ga=c.globalAlpha;
 c.save();gcPath(c,pts);c.clip();c.fillStyle=gcC(col);c.globalAlpha=ga*rub;c.fill();c.strokeStyle=gcC(col);c.lineCap='round';const ca=Math.cos(ang),sa=Math.sin(ang);
 for(let k=-R;k<=R;k+=gap){const ox=cx-sa*k,oy=cy+ca*k;let s=-R;while(s<R){const l=R*(.15+r()*.5),g=gap*(r()*2);c.globalAlpha=ga*hatch*(.45+r()*.55);c.lineWidth=wd*(.6+r()*.6);c.beginPath();c.moveTo(ox+ca*s,oy+sa*s);c.lineTo(ox+ca*(s+l),oy+sa*(s+l)+(r()-.5)*gap*.3);c.stroke();s+=l+g;}}
 c.restore();}
// The soft rub of chalk around a firework or a light (never more than a faint halo).
function gcGlow(c,x,y,r,col,a){if(r<=1||a<=0)return;const g=c.createRadialGradient?c.createRadialGradient(x,y,0,x,y,r):null;if(!g)return;g.addColorStop(0,gcRgba(gcC(col),a));g.addColorStop(1,gcRgba(gcC(col),0));c.save();c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TL_TAU);c.fill();c.restore();}
const gcWave=(x0,x1,y,amp,freq,ph,n=24)=>Array.from({length:n+1},(_,i)=>{const t=i/n;return [x0+(x1-x0)*t,y+Math.sin(t*freq+ph)*amp];});
// ── The fireworks ──
// A firework at (x, y) of radius R, in its shape and two colours, age seconds after it opened: it draws itself outwards in life.draw,
// holds for life.hold and fades in life.fade, its sparks falling a little as it fades. still: drawn whole and quiet (the options).
export const GC_LIFE=Object.freeze({draw:GX_DRAW,hold:GX_HOLD,fade:GX_FADE});
function gcBurst(c,x,y,R,shape,cols,age,seed,life=GC_LIFE,still=false){if(age<0)return;const g=still?1:gcEase(age/life.draw),out=still?0:age-life.draw-life.hold,f=out<=0?0:Math.min(1,out/life.fade),alpha=1-gcSmooth(f),fall=R*.28*f*f;if(alpha<=.002)return;
 const [A,B]=cols,wd=Math.max(1.6,R*.03),r=tlRng(seed),spin=still?0:age*.35,ga=c.globalAlpha;c.save();c.globalAlpha=ga*alpha;
 gcGlow(c,x,y+fall*.5,R*1.05*g,A,GC_INK?.08:.13);
 if(shape==='palm'){// a palm tree of light: a trunk (the trail of the rocket) and a crown of broad leaves that open and droop
  gcLine(c,[[x-R*.02,y+R*1.05*g],[x+R*.03,y+R*.7*g],[x-R*.01,y+R*.35*g],[x,y]],B,wd*2.4,seed+99,{alpha:.75});for(let j=1;j<5;j++){const ty=y+R*.25*j*g;gcLine(c,[[x-R*.035,ty],[x+R*.035,ty-R*.02]],A,wd*.9,seed+90+j,{alpha:.6,passes:1});}
  const n=7;for(let i=0;i<n;i++){const a=-GC_PI/2+(i-(n-1)/2)*.55+(r()-.5)*.08,L=R*(.95+r()*.12),C=[];for(let s=0;s<=14;s++){const q=s/14*g;C.push([x+Math.cos(a)*L*q,y+Math.sin(a)*L*q*.9+R*.7*q*q*q*(1+Math.abs(Math.cos(a))*.4)+fall*q]);}
   const left=[],right=[];C.forEach((p,k)=>{const q=C[Math.min(k+1,14)],o=C[Math.max(k-1,0)],dx=q[0]-o[0],dy=q[1]-o[1],l=Math.hypot(dx,dy)||1,hw=R*.06*Math.pow(Math.sin(GC_PI*Math.min(1,k/14*1.05)),.75);left.push([p[0]-dy/l*hw,p[1]+dx/l*hw]);right.push([p[0]+dy/l*hw,p[1]-dx/l*hw]);});
   const leaf=[...left,...right.reverse()];gcFill(c,leaf,A,seed+i*11,{rub:.45,hatch:.7,ang:a+GC_PI/2,gap:Math.max(2.5,R*.022),wd:wd*.8});gcLine(c,leaf,A,wd*.8,seed+i*11+3,{close:true,passes:1,alpha:.9});
   gcLine(c,C,B,wd*.7,seed+i*11+5,{passes:1,alpha:.8});gcDot(c,C[14][0],C[14][1],wd*1.4,B);}
  gcDot(c,x,y,wd*2,B);}
 else if(shape==='spiral'){const arms=5;for(let k=0;k<arms;k++){const a0=k/arms*TL_TAU+spin,P=[];for(let s=.06;s<=g+.001;s+=.035){const ang=a0+s*3.4,rad=R*s;P.push([x+Math.cos(ang)*rad,y+Math.sin(ang)*rad+fall*s]);}
   if(P.length>1)gcLine(c,P,k%2?B:A,wd*.75,seed+k,{alpha:.55,passes:1});P.forEach((p,j)=>{if(j%2===0)gcDot(c,p[0],p[1],wd*(.55+j/P.length*.9),k%2?B:A);});
   const e=P[P.length-1];if(e)gcDot(c,e[0],e[1],wd*1.6,k%2?A:B);}
  gcDot(c,x,y,wd*1.4,B);}
 else if(shape==='willow'){const n=15;for(let i=0;i<n;i++){const a=-GC_PI/2+(i/(n-1)-.5)*GC_PI*1.7+(r()-.5)*.1,v=R*(.85+r()*.12),P=[];for(let s=0;s<=14;s++){const q=s/14*g;P.push([x+Math.cos(a)*v*q,y+Math.sin(a)*v*q*.8+R*.95*q*q+fall*q]);}
   for(let j=0;j<4;j++){const seg=P.slice(Math.floor(j*14/4),Math.floor((j+1)*14/4)+1);gcLine(c,seg,j<3?B:A,wd*(.7+j*.2),seed+i*5+j,{alpha:.3+j*.22,passes:j<2?1:2});}
   gcDot(c,P[14][0],P[14][1],wd*1.3,A);}}
 else{// the flower (peony): an outer crown of long rays and a heart of short ones, each with a star at its end
  const n=22;for(let i=0;i<n;i++){const a=i/n*TL_TAU+(r()-.5)*.1+spin,L=R*g*(.86+r()*.14),r0=R*.2*g,P=[];for(let s=0;s<=6;s++){const q=r0+(L-r0)*s/6;P.push([x+Math.cos(a)*q,y+Math.sin(a)*q+fall*s/6]);}
   gcLine(c,P,A,wd,seed+i);gcDot(c,P[6][0],P[6][1],wd*1.25,B);}
  const m=12;for(let i=0;i<m;i++){const a=(i+.5)/m*TL_TAU-spin*.6,L=R*.44*g,P=[[x+Math.cos(a)*L*.25,y+Math.sin(a)*L*.25],[x+Math.cos(a)*L,y+Math.sin(a)*L+fall*.4]];gcLine(c,P,B,wd*.9,seed+40+i);gcDot(c,P[1][0],P[1][1],wd*1.05,A);}
  gcDot(c,x,y+fall*.2,wd*1.3,B);}
 c.restore();}
// With reduced motion a firework does not grow or fall: it is drawn whole, and only its light comes and goes (in life.draw and life.fade).
const gcEnv=(age,life)=>gcSmooth(age/life.draw)*(1-gcSmooth((age-life.draw-life.hold)/life.fade));
function gcBurstStill(c,x,y,R,shape,cols,age,seed,life){const ga=c.globalAlpha,a=gcEnv(age,life);if(a<=.002)return;c.globalAlpha=ga*a;gcBurst(c,x,y,R,shape,cols,0,seed,life,true);c.globalAlpha=ga;}
// A rocket going up from (x0, y0) to (x1, y1), u from 0 to 1: a head of chalk and the dashes of its trail.
function gcRocket(c,x0,y0,x1,y1,u,col,seed){if(u<=0||u>=1)return;const e=1-(1-u)*(1-u),S=Math.hypot(x1-x0,y1-y0),pos=v=>[x0+(x1-x0)*v+Math.sin(v*14+seed)*S*.012,y0+(y1-y0)*v];
 for(let j=1;j<=7;j++){const v0=Math.max(0,e-j*.045),v1=Math.max(0,e-j*.045+.025);if(v1<=0)break;gcLine(c,[pos(v0),pos(v1)],col,Math.max(1.5,S*.007),seed+j,{alpha:1-j/8,passes:1});}
 const h=pos(e);gcGlow(c,h[0],h[1],S*.05,col,.2);gcDot(c,h[0],h[1],Math.max(2,S*.009),GC_WHITE);}
// ── The instruments of the music, in chalk ──
function gcNote(c,x,y,s,col,seed,alpha=1){const ga=c.globalAlpha;c.save();c.globalAlpha=ga*alpha;c.fillStyle=gcC(col);c.beginPath();c.ellipse(x,y,s*.34,s*.25,-.4,0,TL_TAU);c.fill();c.restore();
 gcLine(c,[[x+s*.3,y-s*.05],[x+s*.32,y-s*1.25]],col,Math.max(1.4,s*.1),seed,{alpha,passes:1});gcLine(c,[[x+s*.32,y-s*1.25],[x+s*.62,y-s*.95],[x+s*.66,y-s*.62]],col,Math.max(1.4,s*.1),seed+1,{alpha,passes:1});}
function gcInstrument(c,id,x,y,s,seed){const wd=Math.max(1.8,s*.045);
 if(id==='harp'){const pil=[[x-s*.38,y+s*.92],[x-s*.5,y-s*.2],[x-s*.52,y-s*.95]],neck=[[x-s*.52,y-s*.95],[x-s*.25,y-s*.82],[x,y-s*.98],[x+s*.28,y-s*.72],[x+s*.55,y-s*.55]],board=[[x+s*.55,y-s*.55],[x-s*.3,y+s*.92]];
  for(let i=0;i<8;i++){const xt=x-s*.3+i*s*.107,u=(xt-(x-s*.52))/(s*1.07),top=[xt,y-s*.95+u*s*.4-Math.sin(u*GC_PI*2)*s*.08+s*.04],bot=[xt,y-s*.55+(x+s*.55-xt)/(s*.85)*s*1.47-s*.03];gcLine(c,[top,bot],i%4===0?GC_COL.red:GC_WHITE,wd*.5,seed+i,{alpha:.85,passes:1});}
  gcLine(c,pil,GC_COL.yellow,wd*1.6,seed+20);gcLine(c,neck,GC_COL.yellow,wd*1.5,seed+21);gcLine(c,board,GC_COL.orange,wd*2.4,seed+22);gcLine(c,[[x-s*.45,y+s*.94],[x-s*.2,y+s*.94]],GC_COL.yellow,wd*1.8,seed+23);return;}
 if(id==='band'){// a trumpet over a drum
  const ty=y-s*.35;gcLine(c,[[x-s*.85,ty],[x+s*.42,ty]],GC_COL.yellow,wd*1.3,seed);gcLine(c,[[x-s*.32,ty],[x-s*.36,ty+s*.24],[x+s*.18,ty+s*.24],[x+s*.22,ty]],GC_COL.yellow,wd*1.1,seed+1);
  gcLine(c,[[x+s*.42,ty-s*.04],[x+s*.82,ty-s*.24]],GC_COL.yellow,wd*1.1,seed+2);gcLine(c,[[x+s*.42,ty+s*.04],[x+s*.82,ty+s*.24]],GC_COL.yellow,wd*1.1,seed+3);c.save();c.lineWidth=wd*1.1;c.strokeStyle=gcC(GC_COL.yellow);c.beginPath();c.ellipse(x+s*.84,ty,s*.07,s*.25,0,0,TL_TAU);c.stroke();c.restore();
  for(let i=0;i<3;i++)gcLine(c,[[x-s*.18+i*s*.13,ty-s*.02],[x-s*.18+i*s*.13,ty-s*.2]],GC_WHITE,wd*.9,seed+5+i);gcDot(c,x-s*.86,ty,wd*1.2,GC_WHITE);
  const dy=y+s*.55,dr=s*.42;gcFill(c,[[x-dr,dy-s*.1],[x+dr,dy-s*.1],[x+dr,dy+s*.3],[x-dr,dy+s*.3]],GC_COL.red,seed+9,{rub:.25,hatch:.45,gap:Math.max(4,s*.08),wd:wd*.8});
  c.save();c.lineWidth=wd;c.strokeStyle=gcC(GC_WHITE);c.beginPath();c.ellipse(x,dy-s*.1,dr,s*.1,0,0,TL_TAU);c.stroke();c.restore();gcLine(c,[[x-dr,dy-s*.1],[x-dr,dy+s*.3],[x+dr,dy+s*.3],[x+dr,dy-s*.1]],GC_WHITE,wd,seed+10);
  for(let i=0;i<5;i++)gcLine(c,[[x-dr+i*dr*.5,dy-s*.02],[x-dr+(i+.5)*dr*.5,dy+s*.24]],GC_WHITE,wd*.5,seed+11+i,{alpha:.7,passes:1});
  gcLine(c,[[x-s*.15,dy-s*.18],[x-s*.6,dy-s*.45]],GC_COL.brown,wd,seed+17);gcLine(c,[[x+s*.15,dy-s*.18],[x+s*.55,dy-s*.5]],GC_COL.brown,wd,seed+18);return;}
 if(id==='marimba'){const n=6;for(let i=0;i<n;i++){const bx=x-s*.82+i*s*.3,bh=s*(1-i*.11),by=y-s*.2;gcFill(c,[[bx,by-bh*.4],[bx+s*.22,by-bh*.4],[bx+s*.22,by+bh*.4],[bx,by+bh*.4]],GC_COL.brown,seed+i,{rub:.4,hatch:.5,gap:Math.max(3,s*.06),wd:wd*.7,ang:1.4});
   gcLine(c,[[bx,by-bh*.4],[bx+s*.22,by-bh*.4],[bx+s*.22,by+bh*.4],[bx,by+bh*.4]],GC_WHITE,wd*.7,seed+10+i,{close:true});gcLine(c,[[bx+s*.11,by+bh*.4],[bx+s*.11,by+bh*.4+s*(.25+.2*(n-i)/n)]],GC_WHITE,wd*.6,seed+20+i,{alpha:.7,passes:1});}
  gcLine(c,[[x-s*.9,y+s*.25],[x+s*.95,y+s*.12]],GC_WHITE,wd,seed+30);
  for(const [mx,col,sd] of [[-.25,GC_COL.pink,1],[.25,GC_COL.violet,-1]]){gcLine(c,[[x+mx*s,y-s*.75],[x+mx*s+sd*s*.35,y-s*1.05]],GC_COL.brown,wd*.8,seed+40+sd);gcDot(c,x+mx*s,y-s*.75,wd*2.2,col);}return;}
 // strings: a violin, plucked
 const bx=x-s*.05,by=y+s*.15,body=[];for(let i=0;i<=48;i++){const a=i/48*TL_TAU,sy=Math.sin(a),rx=s*(sy>0?.42:.33)*(1-.3*Math.exp(-Math.pow(sy+.08,2)*28));body.push([bx+Math.cos(a)*rx,by+sy*s*.62]);}
 gcFill(c,body,GC_COL.orange,seed,{rub:.35,hatch:.5,gap:Math.max(3,s*.07),wd:wd*.7});gcLine(c,body,GC_WHITE,wd,seed+1,{close:true});
 gcLine(c,[[bx,by-s*.6],[bx,by-s*1.25]],GC_COL.brown,wd*1.6,seed+2);c.save();c.strokeStyle=gcC(GC_COL.brown);c.lineWidth=wd;c.beginPath();c.arc(bx+s*.04,by-s*1.3,s*.07,GC_PI*.5,GC_PI*2.3);c.stroke();c.restore();
 for(let i=0;i<4;i++)gcLine(c,[[bx-s*.045+i*s*.03,by-s*1.2],[bx-s*.045+i*s*.03,by+s*.42]],GC_WHITE,wd*.35,seed+5+i,{alpha:.8,passes:1});
 for(const sd of [-1,1])gcLine(c,[[bx+sd*s*.17,by-s*.08],[bx+sd*s*.13,by+s*.05],[bx+sd*s*.17,by+s*.18]],GC_WHITE,wd*.6,seed+12+sd,{passes:1});
 gcLine(c,[[bx-s*.1,by+s*.42],[bx+s*.1,by+s*.42]],GC_WHITE,wd*.9,seed+15);
 for(let i=0;i<3;i++){c.save();c.strokeStyle=gcC(GC_COL.yellow);c.lineWidth=wd*.6;c.globalAlpha*=.8;c.beginPath();c.arc(bx+s*.05,by-s*.2,s*(.22+i*.1),-.9,-.3);c.stroke();c.restore();}}
// ── The places ──
// Each place is drawn under the horizon hz (CSS px from the top) and has a point the rockets go up from: the boat on the water, or the
// square behind the roofs.
const GC_LAUNCH={bay:[.5,.86],mountain:[.48,.88],square:[.5,.66],lake:[.56,.88],beach:[.55,.79]};
export const gcLaunch=(place,w,H,hz)=>{const [u,v]=GC_LAUNCH[place]||GC_LAUNCH.bay;return [w*u,hz+(H-hz)*((v-.6)/.4)];};
function gcBoat(c,x,y,s,seed){gcFill(c,[[x-s,y-s*.12],[x+s,y-s*.12],[x+s*.7,y+s*.3],[x-s*.68,y+s*.3]],GC_COL.brown,seed,{rub:.35,hatch:.5,gap:Math.max(3,s*.12),wd:Math.max(1.4,s*.05)});
 gcLine(c,[[x-s,y-s*.12],[x+s,y-s*.12],[x+s*.7,y+s*.3],[x-s*.68,y+s*.3]],GC_WHITE,Math.max(1.6,s*.06),seed+1,{close:true});gcLine(c,[[x-s*.1,y-s*.12],[x-s*.1,y-s*1.1]],GC_WHITE,Math.max(1.4,s*.05),seed+2);
 gcFill(c,[[x-s*.05,y-s*1.05],[x+s*.6,y-s*.25],[x-s*.05,y-s*.25]],GC_WHITE,seed+3,{rub:.3,hatch:.45,gap:Math.max(3,s*.1),wd:Math.max(1.2,s*.04)});gcLine(c,[[x-s*.05,y-s*1.05],[x+s*.6,y-s*.25],[x-s*.05,y-s*.25]],GC_WHITE,Math.max(1.4,s*.05),seed+4,{close:true});
 gcFill(c,[[x-s*.1,y-s*1.12],[x-s*.45,y-s*1.02],[x-s*.1,y-s*.92]],GC_COL.red,seed+5,{rub:.6,hatch:.6,gap:3,wd:1.4});
 for(let j=0;j<2;j++)gcLine(c,gcWave(x-s*1.2+j*s*.3,x+s*1.1-j*s*.2,y+s*.45+j*s*.18,s*.04,9,j),GC_COL.blue,Math.max(1.3,s*.04),seed+8+j,{alpha:.7,passes:1});}
function gcWater(c,w,y0,y1,seed,col=GC_COL.blue){gcFill(c,[[-10,y0],[w+10,y0],[w+10,y1],[-10,y1]],GC_COL.deep,seed,{rub:.12,hatch:.18,ang:0,gap:Math.max(6,(y1-y0)*.07),wd:2});
 const r=tlRng(seed+1),n=Math.max(4,Math.round((y1-y0)/14));for(let i=0;i<n;i++){const yy=y0+(y1-y0)*(i+.5)/n,x0=r()*w*.5-w*.1,len=w*(.2+r()*.5);gcLine(c,gcWave(x0,x0+len,yy,(y1-y0)*.006,8+r()*6,r()*6,12),i%3?col:GC_WHITE,Math.max(1.4,(y1-y0)*.012),seed+10+i,{alpha:.45+r()*.35,passes:1});}
 gcLine(c,[[-10,y0],[w+10,y0]],GC_WHITE,2,seed+50,{alpha:.6,passes:1});}
function gcPine(c,x,y,s,seed){const P=[[x,y-s]];for(let i=1;i<=3;i++){P.push([x+s*.18*i,y-s+s*.3*i]);P.push([x+s*.07*i,y-s+s*.3*i-s*.05]);}P.push([x,y]);for(let i=3;i>=1;i--){P.push([x-s*.07*i,y-s+s*.3*i-s*.05]);P.push([x-s*.18*i,y-s+s*.3*i]);}
 gcFill(c,P,GC_COL.pine,seed,{rub:.3,hatch:.55,gap:Math.max(3,s*.09),wd:1.6});gcLine(c,P.slice(0,8),GC_COL.green,1.8,seed+1,{passes:1});gcLine(c,P.slice(7),GC_COL.green,1.8,seed+2,{passes:1});}
function gcTree(c,x,y,s,seed){gcLine(c,[[x,y],[x+s*.03,y-s*.55]],GC_COL.brown,Math.max(2,s*.09),seed);const P=[];for(let i=0;i<=24;i++){const a=i/24*TL_TAU,k=1+.12*Math.sin(a*5+seed);P.push([x+Math.cos(a)*s*.42*k,y-s*.85+Math.sin(a)*s*.38*k]);}
 gcFill(c,P,GC_COL.green,seed+1,{rub:.28,hatch:.5,gap:Math.max(3,s*.09),wd:1.6});gcLine(c,P,GC_COL.green,1.8,seed+2,{close:true,passes:1});}
function gcHouse(c,x,y,wd,ht,seed,roof=GC_COL.roof,lit=true){const R=[[x,y],[x,y-ht],[x+wd/2,y-ht-wd*.42],[x+wd,y-ht],[x+wd,y]];gcFill(c,[[x,y],[x,y-ht],[x+wd,y-ht],[x+wd,y]],GC_WHITE,seed,{rub:.12,hatch:.2,gap:5,wd:1.4});
 gcFill(c,[[x-wd*.06,y-ht],[x+wd/2,y-ht-wd*.42],[x+wd*1.06,y-ht]],roof,seed+1,{rub:.4,hatch:.6,gap:4,wd:1.8});gcLine(c,R,GC_WHITE,1.8,seed+2,{passes:1});
 if(lit)for(let i=0;i<2;i++){const wx=x+wd*(.2+i*.4),wy=y-ht*.7;gcFill(c,[[wx,wy],[wx+wd*.2,wy],[wx+wd*.2,wy+ht*.28],[wx,wy+ht*.28]],GC_COL.yellow,seed+5+i,{rub:.6,hatch:.6,gap:3,wd:1.4});}}
function gcPlace(c,w,H,hz,place,seed){const S=Math.min(w,H),g=H-hz,Y=v=>hz+g*v,wd=Math.max(2,S*.004);
 if(place==='mountain'){const peaks=[[.18,.55],[.42,.95],[.7,.7],[.9,.45]];for(const [u,hh] of peaks){const top=[w*u,hz-g*hh*1.1],L=[w*(u-.24),Y(.32)],Rr=[w*(u+.24),Y(.32)];gcFill(c,[L,top,Rr],GC_COL.violet,seed+u*100,{rub:.16,hatch:.35,gap:Math.max(5,S*.01),wd:2,ang:-1});
   const cap=[[top[0]-(top[0]-L[0])*.28,top[1]+(L[1]-top[1])*.28],top,[top[0]+(Rr[0]-top[0])*.28,top[1]+(Rr[1]-top[1])*.28],[top[0]+w*.02,top[1]+(L[1]-top[1])*.24],[top[0]-w*.015,top[1]+(L[1]-top[1])*.3]];gcFill(c,cap,GC_WHITE,seed+u*100+3,{rub:.4,hatch:.6,gap:3,wd:1.6});gcLine(c,[L,top,Rr],GC_WHITE,wd,seed+u*100+5);}
  for(let i=0;i<11;i++)gcPine(c,w*(.04+i*.093),Y(.36)+(i%2)*g*.02,S*(.07+(i%3)*.012),seed+200+i);gcWater(c,w,Y(.42),H,seed+300);}
 else if(place==='square'){// the village square: houses round it, the bell tower, lanterns and bunting
  const hs=[[.0,.1,.55],[.1,.12,.75],[.22,.1,.5],[.6,.12,.62],[.72,.1,.8],[.82,.18,.55]];hs.forEach(([u,ww,hh],i)=>gcHouse(c,w*u,Y(.72),w*ww,g*hh,seed+i*10,i%2?GC_COL.roof:GC_COL.orange));
  const tx=w*.4,tw=w*.09,th=g*1.25;gcFill(c,[[tx,Y(.72)],[tx,Y(.72)-th],[tx+tw,Y(.72)-th],[tx+tw,Y(.72)]],GC_WHITE,seed+70,{rub:.14,hatch:.25,gap:5,wd:1.4});gcLine(c,[[tx,Y(.72)],[tx,Y(.72)-th],[tx+tw,Y(.72)-th],[tx+tw,Y(.72)]],GC_WHITE,wd,seed+71);
  gcFill(c,[[tx-tw*.08,Y(.72)-th],[tx+tw/2,Y(.72)-th-tw*.8],[tx+tw*1.08,Y(.72)-th]],GC_COL.roof,seed+72,{rub:.45,hatch:.6,gap:4,wd:1.8});
  c.save();c.strokeStyle=gcC(GC_WHITE);c.lineWidth=wd;c.beginPath();c.arc(tx+tw/2,Y(.72)-th*.78,tw*.26,0,TL_TAU);c.stroke();c.restore();gcLine(c,[[tx+tw/2,Y(.72)-th*.78],[tx+tw/2,Y(.72)-th*.86]],GC_WHITE,wd*.8,seed+73,{passes:1});gcLine(c,[[tx+tw/2,Y(.72)-th*.78],[tx+tw*.64,Y(.72)-th*.76]],GC_WHITE,wd*.8,seed+74,{passes:1});
  gcFill(c,[[tx+tw*.3,Y(.72)-th*.55],[tx+tw*.7,Y(.72)-th*.55],[tx+tw*.7,Y(.72)-th*.38],[tx+tw*.3,Y(.72)-th*.38]],GC_COL.yellow,seed+75,{rub:.5,hatch:.6,gap:3,wd:1.4});
  for(const [x0,x1,y0] of [[.02,.4,.12],[.49,.98,.05]]){const P=[];for(let i=0;i<=20;i++){const t=i/20;P.push([w*(x0+(x1-x0)*t),Y(y0)+Math.sin(t*GC_PI)*g*.12]);}gcLine(c,P,GC_WHITE,wd*.6,seed+80+x0*10,{alpha:.7,passes:1});
   for(let i=1;i<20;i+=2){const [px,py]=P[i];gcFill(c,[[px-w*.008,py],[px+w*.008,py],[px,py+g*.08]],[GC_COL.red,GC_COL.yellow,GC_COL.blue,GC_COL.green,GC_COL.pink][i%5],seed+90+i,{rub:.7,hatch:.4,gap:3,wd:1.2});}}
  gcFill(c,[[-10,Y(.72)],[w+10,Y(.72)],[w+10,H],[-10,H]],GC_COL.sand,seed+95,{rub:.08,hatch:.22,gap:7,wd:2,ang:.15});
  for(let i=0;i<4;i++){const lx=w*(.08+i*.28);gcLine(c,[[lx,Y(.95)],[lx,Y(.55)]],GC_WHITE,wd,seed+100+i);gcGlow(c,lx,Y(.53),S*.03,GC_COL.yellow,.25);gcDot(c,lx,Y(.53),S*.009,GC_COL.yellow);}}
 else if(place==='lake'){for(let i=0;i<14;i++)gcTree(c,w*(.03+i*.073),Y(.36)+(i%3)*g*.025,S*(.09+(i%4)*.012),seed+i*3);
  gcHouse(c,w*.66,Y(.34),w*.07,g*.2,seed+60,GC_COL.roof);gcWater(c,w,Y(.38),H,seed+70);
  const py=Y(.62);gcFill(c,[[-10,py],[w*.32,py],[w*.32,py+g*.05],[-10,py+g*.05]],GC_COL.brown,seed+80,{rub:.45,hatch:.6,gap:4,wd:1.8,ang:1.4});gcLine(c,[[-10,py],[w*.32,py]],GC_WHITE,wd,seed+81);
  for(let i=0;i<5;i++){const px=w*(.03+i*.07);gcLine(c,[[px,py],[px,py+g*.22]],GC_COL.brown,wd*1.2,seed+82+i);}for(let i=0;i<3;i++){const px=w*(.06+i*.11);gcLine(c,[[px,py],[px,py-g*.2]],GC_WHITE,wd*.8,seed+90+i);gcGlow(c,px,py-g*.22,S*.025,GC_COL.yellow,.25);gcDot(c,px,py-g*.22,S*.007,GC_COL.yellow);}
  for(let i=0;i<9;i++){const rx=w*(.82+i*.02),rh=g*(.18+(i%3)*.06);gcLine(c,[[rx,Y(.75)],[rx+w*.004,Y(.75)-rh]],GC_COL.green,wd*.8,seed+100+i,{passes:1});if(i%2)gcFill(c,[[rx-1,Y(.75)-rh],[rx+w*.008,Y(.75)-rh],[rx+w*.008,Y(.75)-rh+g*.07],[rx-1,Y(.75)-rh+g*.07]],GC_COL.brown,seed+110+i,{rub:.7,hatch:.5,gap:2,wd:1.2});}}
 else if(place==='beach'){gcWater(c,w,hz,Y(.62),seed+10);const sand=gcWave(-10,w+10,Y(.6),g*.02,5,1);gcFill(c,[...sand,[w+10,H],[-10,H]],GC_COL.sand,seed+20,{rub:.18,hatch:.45,gap:Math.max(5,S*.009),wd:2,ang:.25});gcLine(c,sand,GC_WHITE,wd,seed+21,{alpha:.8});
  gcLine(c,gcWave(-10,w+10,Y(.66),g*.015,7,2),GC_WHITE,wd*.7,seed+22,{alpha:.5,passes:1});
  const tx=w*.12,ty=Y(.95);const trunk=[[tx,ty],[tx+w*.012,Y(.6)],[tx+w*.04,Y(.25)],[tx+w*.07,hz-g*.15]];gcLine(c,trunk,GC_COL.brown,Math.max(5,S*.014),seed+30);for(let i=1;i<7;i++){const p=[tx+w*.07*Math.pow(i/7,1.6),ty-(ty-(hz-g*.15))*i/7];gcLine(c,[[p[0]-S*.008,p[1]],[p[0]+S*.008,p[1]-S*.004]],GC_WHITE,wd*.6,seed+31+i,{alpha:.6,passes:1});}
  const top=trunk[3];for(let i=0;i<6;i++){const a=-GC_PI+i*GC_PI/5+(i>2?.2:-.2),L=S*(.12+(i%2)*.03),P=[];for(let s=0;s<=8;s++){const q=s/8;P.push([top[0]+Math.cos(a)*L*q,top[1]+Math.sin(a)*L*q*.6+L*.5*q*q]);}gcLine(c,P,GC_COL.green,wd*2,seed+40+i);for(let s=2;s<=8;s+=2)gcLine(c,[P[s],[P[s][0]+S*.006,P[s][1]+S*.025]],GC_COL.green,wd*.8,seed+50+i*9+s,{passes:1});}
  for(let i=0;i<3;i++){const hx=w*(.68+i*.1),hy=Y(.88),hw=w*.07,hh=g*.32;gcFill(c,[[hx,hy],[hx,hy-hh],[hx+hw,hy-hh],[hx+hw,hy]],[GC_COL.blue,GC_COL.red,GC_COL.green][i],seed+60+i,{rub:.3,hatch:.55,gap:4,wd:1.6,ang:1.57});gcLine(c,[[hx,hy],[hx,hy-hh],[hx+hw/2,hy-hh-hw*.4],[hx+hw,hy-hh],[hx+hw,hy]],GC_WHITE,wd,seed+64+i);}}
 else{// the bay: hills with houses, a headland with its lighthouse, the sea
  const hill=[[-10,Y(.3)],...gcWave(-10,w*.6,hz-g*.05,g*.08,4,1,18),[w*.64,hz+g*.02],[w*.68,Y(.3)]];gcFill(c,hill,GC_COL.pine,seed,{rub:.2,hatch:.4,gap:Math.max(5,S*.01),wd:2});gcLine(c,hill.slice(1,-1),GC_COL.green,wd,seed+1);
  for(let i=0;i<6;i++)gcHouse(c,w*(.05+i*.09),hz+g*(.12+(i%2)*.06),w*.045,g*.12,seed+10+i*7,i%2?GC_COL.roof:GC_COL.orange);
  const head=[[w*.74,Y(.3)],[w*.8,hz-g*.12],[w*.92,hz-g*.18],[w+10,hz-g*.2],[w+10,Y(.3)]];gcFill(c,head,GC_COL.brown,seed+60,{rub:.2,hatch:.45,gap:5,wd:2});gcLine(c,head.slice(0,4),GC_WHITE,wd,seed+61);
  const lx=w*.9,ly=hz-g*.17,lh=g*.55;gcFill(c,[[lx-w*.012,ly],[lx-w*.008,ly-lh],[lx+w*.008,ly-lh],[lx+w*.012,ly]],GC_WHITE,seed+62,{rub:.3,hatch:.4,gap:4,wd:1.5,ang:1.57});for(let i=0;i<3;i++)gcFill(c,[[lx-w*.012,ly-lh*(.2+i*.3)],[lx+w*.012,ly-lh*(.2+i*.3)],[lx+w*.011,ly-lh*(.32+i*.3)],[lx-w*.011,ly-lh*(.32+i*.3)]],GC_COL.red,seed+63+i,{rub:.6,hatch:.6,gap:3,wd:1.4});
  gcGlow(c,lx,ly-lh-g*.05,S*.05,GC_COL.yellow,.3);gcDot(c,lx,ly-lh-g*.05,S*.01,GC_COL.yellow);gcWater(c,w,Y(.3),H,seed+70);}
 if(place!=='square'){const [bx,by]=gcLaunch(place,w,H,hz);gcBoat(c,bx,by,S*.06,seed+400);}}
// The sky: a moon and stars in chalk.
function gcSky(c,w,hz,seed){const S=Math.min(w,hz/.7),r=tlRng(seed);gcGlow(c,w*.86,hz*.14,S*.09,GC_COL.yellow,.18);
 const P=[];for(let i=0;i<=20;i++){const a=-GC_PI*.6+i/20*GC_PI*1.25;P.push([w*.86+Math.cos(a)*S*.04,hz*.14+Math.sin(a)*S*.04]);}for(let i=20;i>=0;i--){const a=-GC_PI*.6+i/20*GC_PI*1.25;P.push([w*.86+S*.013+Math.cos(a)*S*.033,hz*.14-S*.006+Math.sin(a)*S*.035]);}
 gcFill(c,P,GC_COL.yellow,seed+1,{rub:.6,hatch:.6,gap:2.5,wd:1.4});gcLine(c,P,GC_COL.yellow,1.8,seed+2,{close:true,passes:1});
 for(let i=0;i<34;i++){const x=r()*w,y=r()*hz*.9,s=S*(.004+r()*.006);gcLine(c,[[x-s,y],[x+s,y]],i%4?GC_WHITE:GC_COL.yellow,1.4,seed+10+i,{alpha:.7,passes:1});gcLine(c,[[x,y-s],[x,y+s]],i%4?GC_WHITE:GC_COL.yellow,1.4,seed+60+i,{alpha:.7,passes:1});}}
// ── The board ──
// The slate (with the clouds of old chalk), the frame of wood and the tray at the bottom with its sticks of chalk and the duster.
function gcSlate(c,w,h,plain){c.fillStyle='#1c2925';c.fillRect(0,0,w,h);if(plain)return;const r=tlRng(5),S=Math.min(w,h);
 for(let i=0;i<10;i++){const x=r()*w,y=r()*h,R=S*(.15+r()*.3);gcGlow(c,x,y,R,'#ffffff',.025+r()*.03);}
 c.save();c.lineCap='round';for(let i=0;i<7;i++){const x=r()*w,y=r()*h*.8,R=S*(.2+r()*.3);c.strokeStyle=`rgba(255,255,255,${(.018+r()*.02).toFixed(3)})`;c.lineWidth=S*(.05+r()*.05);c.beginPath();c.arc(x,y+R,R,-GC_PI*.85,-GC_PI*.15);c.stroke();}c.restore();}
function gcFrame(c,w,h){const F=Math.max(10,Math.min(w,h)*.02),H=h-TL_STRIP,wood='#8a5b35',r=tlRng(9);c.save();c.fillStyle=wood;c.fillRect(0,0,w,F);c.fillRect(0,0,F,H);c.fillRect(w-F,0,F,H);
 const g=c.createLinearGradient?c.createLinearGradient(0,H,0,h):null;c.fillStyle=g?(g.addColorStop(0,'#a06a3e'),g.addColorStop(.25,'#7a4e2c'),g.addColorStop(1,'#5a381e'),g):wood;c.fillRect(0,H,w,h-H);
 c.strokeStyle='rgba(40,20,8,.35)';c.lineWidth=1.2;for(let i=0;i<40;i++){const y=r()*F,x=r()*w;c.beginPath();c.moveTo(x,y);c.lineTo(x+40+r()*120,y+(r()-.5)*2);c.stroke();}
 c.strokeStyle='rgba(255,220,170,.25)';c.lineWidth=2;c.strokeRect(F-1,F-1,w-2*F+2,H-F+1);
 // sticks of chalk lying on the tray, and the duster
 const ty=H+(h-H)*.42,cs=Math.max(8,(h-H)*.16);[GC_WHITE,GC_COL.yellow,GC_COL.pink,GC_COL.blue,GC_COL.green,GC_COL.orange].forEach((col,i)=>{const x=Math.max(14,w*.03)+i*cs*7.4,len=cs*(4+(i%3));c.save();c.translate(x,ty);c.rotate((i%2?.06:-.05));c.fillStyle='rgba(0,0,0,.3)';c.fillRect(2,cs*.5,len,cs*.4);c.fillStyle=col;c.beginPath();c.moveTo(cs*.3,0);c.lineTo(len,0);c.arc(len,cs*.5,cs*.5,-GC_PI/2,GC_PI/2);c.lineTo(cs*.3,cs);c.arc(cs*.3,cs*.5,cs*.5,GC_PI/2,GC_PI*1.5);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(cs*.3,cs*.15,len-cs*.3,cs*.2);c.restore();});
 const dx=w*.8,dw=Math.max(60,w*.1),dh=(h-H)*.5;c.fillStyle='#c79a62';c.fillRect(dx,ty-dh*.2,dw,dh*.5);c.fillStyle='#3c3f48';c.fillRect(dx,ty+dh*.3,dw,dh*.45);c.fillStyle='rgba(255,255,255,.18)';c.fillRect(dx,ty+dh*.62,dw,dh*.13);c.restore();}
export const gcHorizon=(w,H)=>H*(w<H*1.05?.76:.7);
// The windows of the sky (the options): a part of the board rubbed cleaner, and its edge in chalk.
function gcWindowFill(c,z,d){c.save();gcPath(c,z.pts);if(d.fade<=0){c.fillStyle=d.base;c.fill();c.restore();return;}c.fillStyle='#16221e';c.fill();c.clip();escVeil(c,d,z.x,z.y,z.w,z.h);c.restore();}
// What a window shows. stage 0: a firework of the colour, and its two sticks of chalk; stage 1: the shape, in the colour chosen; stage 2:
// the instrument, with the firework chosen over it. live: the time of the window in focus (its rocket goes up and opens, every 2.4 s);
// null draws it whole and quiet.
const GC_CYCLE=2.4,GC_FOCUS_LIFE=Object.freeze({draw:.5,hold:.6,fade:.7});
function gcOption(c,z,stage,id,picks,live,seed){const cx=z.x+z.w/2,R=Math.min(z.w*.4,z.h*.3),wd=Math.max(2,R*.03);
 gcLine(c,z.pts,GC_WHITE,Math.max(2,Math.min(z.w,z.h)*.008),seed+900,{close:true,alpha:.75});
 const music=stage===2,cy=z.y+z.h*(music?.27:.4),Rb=music?R*.7:R,shape=stage===0?'peony':stage===1?id:picks.shape,cols=gxColors(stage===0?id:picks.color);
 if(live===null||live===undefined)gcBurst(c,cx,cy,Rb,shape,cols,0,seed,GC_LIFE,true);
 else{const ph=live%GC_CYCLE,rise=.6,by=z.y+z.h*(music?.62:.96);if(ph<rise)gcRocket(c,cx,by,cx,cy,ph/rise,cols[0],seed+5);else gcBurst(c,cx,cy,Rb,shape,cols,ph-rise,seed,GC_FOCUS_LIFE);}
 if(stage===0){const sy=z.y+z.h*.86,len=z.w*.28,th=Math.max(7,z.w*.045);[[cols[0],-.18,-.05],[cols[1],.06,.08]].forEach(([col,dx,rot],i)=>{c.save();c.translate(cx+dx*z.w,sy+i*th*1.4);c.rotate(rot);c.fillStyle=gcC(col);c.beginPath();c.moveTo(0,0);c.lineTo(len,0);c.arc(len,th/2,th/2,-GC_PI/2,GC_PI/2);c.lineTo(0,th);c.arc(0,th/2,th/2,GC_PI/2,GC_PI*1.5);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(0,th*.15,len,th*.22);c.restore();});}
 if(music){const s=Math.min(z.w*.36,z.h*.19),iy=z.y+z.h*.75;gcInstrument(c,id,cx,iy,s,seed+300);
  const notes=live===null||live===undefined?[[.62,.5,0],[.3,.8,.5]]:[0,1,2].map(j=>{const p=((live/1.6)+j/3)%1;return [.3+.32*((j*.37)%1),1-p*1.4,Math.min(1,p*4,(1-p)*3)];});
  notes.forEach(([u,v,a],j)=>{const al=live===null||live===undefined?.85:a;if(al>.01)gcNote(c,z.x+z.w*u+(j%2?s*.6:-s*.9),iy-s*(.4+v*.9),s*.32,j%2?GC_COL.yellow:GC_WHITE,seed+500+j,al);});}}
const gcDecorOf=(s,view)=>view?.decor||escDecor({background:s.background,base:s.base,opacity:s.opacity});
const gcKey=d=>escDecorKey(d)+(d.fade>0?'':'|none'+d.base);
function gcDecor(c,w,h,d,place,plain){const H=h-TL_STRIP,hz=gcHorizon(w,H);if(d.fade<=0){c.fillStyle=d.base;c.fillRect(0,0,w,h);return;}
 gcSlate(c,w,h,plain);gcChalk(c,x=>{gcSky(x,w,hz,77);gcPlace(x,w,H,hz,place,101);},plain);gcFrame(c,w,h);escVeil(c,d,0,0,w,h);}
// The picks so far, as ids: colour, shape and music (with the defaults for what is still to choose).
const gcPicks=v=>({color:v[0]||'gold',shape:v[1]||'peony',music:v[2]||'harp'});
export function gxBoard(c,w,h,state,game,s,view){const r=state.round||0,place=gxPlace(r),plain=!!s.plainScene,still=!!s.reduced,d=gcDecorOf(s,view),stage=Math.min(2,state.stage||0),ids=view.options.map(o=>o.value),zones=view.zones,t=still?0:view.clock||0,H=h-TL_STRIP;
 const picks=gcPicks(view.picks||(state.picks||[]).map(p=>p?.value??p));GC_INK=d.white&&!d.full;
 tlSheet(c,['gx',w,h,place,stage,picks.color,picks.shape,ids.join(),plain,GC_INK].join('|')+gcKey(d),x=>{gcDecor(x,w,h,d,place,plain);zones.forEach(z=>gcWindowFill(x,z,d));gcChalk(x,y=>zones.forEach((z,i)=>gcOption(y,z,stage,ids[i],picks,null,r*17+i*101+stage*7)),plain);});
 const f=view.focus;
 if(f>=0&&zones[f]&&!still&&!view.waiting){const z=zones[f];c.save();gcPath(c,z.pts);c.clip();gcWindowFill(c,z,d);gcChalk(c,y=>gcOption(y,z,stage,ids[f],picks,t,r*17+f*101+stage*7),plain,z);c.restore();}
 tlVeil(c,w,H,zones,view.lights,.35*(view.wait??(view.waiting?1:0)));
 if(f>=0&&zones[f]&&!view.waiting)tlRing(c,zones[f].pts,view.progress,1,Math.max(.6,Math.min(1.2,w/1280)),view.ring);
 GC_INK=false;}
// The result of a choice. Not the last one: the board stays with the window chosen in the light, and its firework goes up from the boat
// and opens big over the board (GX_STEP seconds). The last one: the show (GX_SHOW seconds).
export function gxResult(c,w,h,state,game,s,view,T){const zones=view.zones,i=Math.max(0,Math.min(zones.length-1,view.chosen??0)),z=zones[i],r=state.round||0,place=gxPlace(r),still=!!s.reduced,plain=!!s.plainScene,d=gcDecorOf(s,view),H=h-TL_STRIP,hz=gcHorizon(w,H),S=Math.min(w,H),stage=Math.min(2,state.stage||0);
 const picks=gcPicks(view.picks||[]);
 if(!view.final){gxBoard(c,w,h,state,game,s,{...view,focus:-1,progress:null,lights:zones.map((_,k)=>k===i?1:TL_DIM),picks:view.picks.slice(0,stage)});GC_INK=d.white&&!d.full;
  const [lx,ly]=gcLaunch(place,w,H,hz),tx=z?z.x+z.w/2:w/2,ty=H*.3,shape=stage===0?'peony':picks.shape,cols=gxColors(picks.color);
  gcChalk(c,x=>{if(T<GX_RISE*.8&&!still)gcRocket(x,lx,ly,tx,ty,T/(GX_RISE*.8),cols[0],r+5);const age=T-GX_RISE*.8,life={draw:.45,hold:.05,fade:.6};if(age>=0)(still?gcBurstStill:gcBurst)(x,tx,ty,S*.3,shape,cols,age,r*13+stage,life);},plain);
  GC_INK=false;return;}
 gcShow(c,w,h,r,place,picks,T,d,plain,still,view,state,s,game);}
function gcShow(c,w,h,round,place,picks,T,d,plain,still,view,state,s,game){const H=h-TL_STRIP,hz=gcHorizon(w,H),S=Math.min(w,H),cols=gxColors(picks.color),shape=picks.shape,[lx,ly]=gcLaunch(place,w,H,hz),water=place!=='square';GC_INK=d.white&&!d.full;
 tlSheet(c,['gx-show',w,h,place,plain,GC_INK].join('|')+gcKey(d),x=>gcDecor(x,w,h,d,place,plain));
 // the windows of the board go out in the first 0.7 s
 if(T<.7&&view.zones?.length){const k=1-gcSmooth(T/.7),ids=view.options.map(o=>o.value);c.save();c.globalAlpha=k;view.zones.forEach(z=>gcWindowFill(c,z,d));gcChalk(c,y=>view.zones.forEach((z,i)=>gcOption(y,z,2,ids[i],picks,null,round*17+i*101+14)),plain);c.restore();}
 const rockets=gxShow(round),life=GC_LIFE,end=life.draw+life.hold+life.fade;
 gcChalk(c,x=>{for(const b of rockets){const bx=w*b.x,by=H*(.12+b.y*.8),R=S*.26*b.size,col=b.col?[cols[1],cols[0]]:cols,u=(T-(b.t-GX_RISE))/GX_RISE,age=T-b.t;
   if(u>0&&u<1&&!still)gcRocket(x,lx+(bx-lx)*.08,ly,bx,by,u,col[0],b.seed);
   if(age>=0&&age<end)(still?gcBurstStill:gcBurst)(x,bx,by,R,shape,col,age,b.seed,life);
   else if(age>=end){const ga=x.globalAlpha;x.globalAlpha=ga*.09;gcBurst(x,bx,still?by:by+R*.28,R,shape,col,0,b.seed,life,true);x.globalAlpha=ga;}
   // its light on the water: a few dashes of its colour under it
   if(water&&age>=0&&age<end&&d.fade>0){const a=(1-gcClamp((age-life.draw-life.hold)/life.fade))*gcEase(age/life.draw)*.5,yy=hz+(H-hz)*.18;for(let j=0;j<5;j++)gcLine(x,[[bx-R*(.25-j*.03),yy+j*(H-hz)*.11],[bx+R*(.25-j*.04),yy+j*(H-hz)*.11]],col[0],Math.max(1.5,S*.005),b.seed+j,{alpha:a*(1-j*.15),passes:1});}}
  // the rain of gold at the end
  const [t0,len]=GX_RAIN,p=(T-t0)/len;if(p>0&&p<1.15){const rr=tlRng(round*7+3),a=Math.min(1,p*3)*(1-gcSmooth((p-.55)/.6));for(let j=0;j<120;j++){const x0=rr()*w,y0=rr()*hz*.6,sp=H*(.06+rr()*.07),yy=y0+sp*p*len*(still?0:1),l=S*(.018+rr()*.02),sw=Math.sin(p*4+j)*S*.005,al=a*(.5+rr()*.5),col=j%6?'#ffd25a':j%12?GC_WHITE:cols[1];
    if(yy<hz){gcLine(x,[[x0+sw*.5,yy-l],[x0+sw,yy]],col,Math.max(1.4,S*.0038),j,{alpha:al*.8,passes:1});gcDot(x,x0+sw,yy,Math.max(1.3,S*.0035),col,al);}}}},plain);
 GC_INK=false;}
