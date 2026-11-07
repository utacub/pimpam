// Encaixos de fusta (EN12, 0.45): the painting. A painted wooden peg puzzle fills the stage: the plank, the scene set into it as pieces of
// wood (painted once into a sheet, cpuSheet), the pieces that slide in their grooves, the holes of the figures (raw birch with an inner
// shadow, and a soft ghost of the figure when «Pista al forat» asks for it), the figures fitted, alive as articulated toys, and the tray
// carved at the bottom with the pieces to scan. Every figure part is a sprite made once at the size of the screen (grain through the
// enamel, a dark painted contour, a milled rim with light and shade, a varnish gloss) and only placed, turned and shifted each frame.
// Everything is composed in CSS pixels on the canvas's own transform; the sprites are made at the device's density (0.39.1 rule).
import {cpuSheet} from './carrega.js';
import {TL_STRIP,TL_DIM,tlRound,tlRing,tlSheet} from './tauler.js';
import {EX_FLY,EX_LIFE,EX_STEP,EX_PARTY,EX_OUT,EX_FINAL,EX_WRONG,exBoardOf,exTarget,exPlaced,exHelp,exVariant,exPace,exClamp,exEase,exOut,exSettle} from './encaix.js';
import {exFigure} from './encaix-figures.js';
import {exScene} from './encaix-mons.js';
export const EX_SCENE_W=1600,EX_SCENE_H=640;
const EXTAU=Math.PI*2;
// ── the grain of the wood: periodic value noise, so the tiles have no seams ───────────────────────────────────────────────────────
const EX_LAT=new Map();
function exLattice(px,py,s){const key=px+'|'+py+'|'+s;let a=EX_LAT.get(key);if(!a){a=new Float32Array(px*py);for(let j=0;j<py;j++)for(let i=0;i<px;i++){const x=Math.sin(i*127.1+j*311.7+s*74.7)*43758.5453;a[j*px+i]=x-Math.floor(x);}EX_LAT.set(key,a);}return a;}
// fbm of four octaves as a closure: the lattice tables are looked up once, not once per pixel
function exFbm(s,px,py){const L=[0,1,2,3].map(k=>{const f=1<<k;return {f,px:px*f,py:py*f,a:exLattice(px*f,py*f,s+k)};});
 return (x,y)=>{let t=0,a=.5;for(const o of L){const X=x*o.f,Y=y*o.f;let i=Math.floor(X),j=Math.floor(Y);const fx=X-i,fy=Y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);i=((i%o.px)+o.px)%o.px;j=((j%o.py)+o.py)%o.py;const i1=(i+1)%o.px,j1=(j+1)%o.py,A=o.a[j*o.px+i],B=o.a[j*o.px+i1],C=o.a[j1*o.px+i],E=o.a[j1*o.px+i1];t+=a*(A+(B-A)*u+(C-A)*v+(A-B-C+E)*u*v);a*=.5;}return t;};}
// a tile of grain: horizontal planks whose rings warp a little, with a fine texture; base and dark are the two colours
function exGrainTile(n,seed,base,dark,str){const c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d'),im=g.createImageData(n,n),d=im.data,fW=exFbm(seed,2,6),fR=exFbm(seed+9,5,26),fF=exFbm(seed+3,40,230);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const warp=fW(x*2/n,y*6/n)*60,ring=Math.sin((y+warp)*EXTAU*17/n+fR(x*5/n,y*26/n)*3);let v=.5+.5*ring;v=v*v*v;const fine=fF(x*40/n,y*230/n)*.35;const t=Math.min(1,v*.75+fine*.6)*str;
  const k=(y*n+x)*4;for(let q=0;q<3;q++)d[k+q]=base[q]*(1-t)+dark[q]*t;d[k+3]=255;}
 g.putImageData(im,0,0);return c;}
let EX_TILES=null;
export function exTiles(){if(!EX_TILES){if(typeof document==='undefined')return null;EX_TILES={birch:exGrainTile(256,1,[236,214,176],[176,138,92],1),grain:exGrainTile(256,5,[255,255,255],[120,90,60],1)};}return EX_TILES;}
function exPat(c,tile,rot=0,sc=1,off=0){const p=c.createPattern(tile,'repeat');if(p&&p.setTransform&&typeof DOMMatrix!=='undefined')p.setTransform(new DOMMatrix().translate(off,off*.3).rotate(rot).scale(sc));return p;}
// ── the sprite pipeline ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const EX_SPR=new Map(),EX_SPR_MAX=220;
function exCached(key,make){let v=EX_SPR.get(key);if(v){EX_SPR.delete(key);EX_SPR.set(key,v);return v;}v=make();EX_SPR.set(key,v);if(EX_SPR.size>EX_SPR_MAX)EX_SPR.delete(EX_SPR.keys().next().value);return v;}
export function exClearSprites(){EX_SPR.clear();}
const EX_DOM=typeof document!=='undefined';
// Outside a browser (the tests) there are no sprites: a figure is painted flat, straight on the context, from its parts.
function exDirect(c,fig,kc,A=null,env=1,ghost=false){fig.parts.forEach(p=>{const t=A?.[p.n];if(p.prop&&!(t&&t.a>0))return;c.save();c.translate((p.pv[0]+(t?.x||0)*env)*kc,(p.pv[1]+(t?.y||0)*env)*kc);c.rotate((t?.r||0)*env);c.translate(-p.pv[0]*kc,-p.pv[1]*kc);c.scale(kc,kc);p.paint(c,{m:ghost,d:false});if(!ghost)p.paint(c,{m:false,d:true});c.restore();});}
const exCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;};
// the mask tinted with a colour
function exTint(m,col){const c=exCanvas(m.width,m.height),g=c.getContext('2d');g.drawImage(m,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);return c;}
// the rim of the mask on one side: the mask minus itself shifted by d (blurred a little), in a colour
function exRim(m,d,col,blur){const c=exCanvas(m.width,m.height),g=c.getContext('2d');g.drawImage(m,0,0);g.globalCompositeOperation='destination-out';if(blur>0)g.filter=`blur(${(blur*.4).toFixed(2)}px)`;g.drawImage(m,-d,-d);g.filter='none';g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);return c;}
// the painted contour: the mask minus the mask eroded by r (the intersection of its offsets), in a colour
function exEdge(m,r,col){const w=m.width,h=m.height,e=exCanvas(w,h),eg=e.getContext('2d');eg.drawImage(m,0,0);eg.globalCompositeOperation='destination-in';for(let a=0;a<8;a++)eg.drawImage(m,Math.cos(a/8*EXTAU)*r,Math.sin(a/8*EXTAU)*r);
 const f=exCanvas(w,h),fg=f.getContext('2d');fg.drawImage(m,0,0);fg.globalCompositeOperation='destination-out';fg.drawImage(e,0,0);fg.globalCompositeOperation='source-in';fg.fillStyle=col;fg.fillRect(0,0,w,h);return f;}
// the box of a part in figure units, measured once on a small mask (64 px): no readback of the real sprites
const EX_UBOX=new Map();
function exUnitBox(fig,part){const key=fig.id+'|'+part.n;let b=EX_UBOX.get(key);if(b)return b;const qq=64/Math.max(fig.w,fig.h),pad=8,c=exCanvas(fig.w*qq+2*pad,fig.h*qq+2*pad),g=c.getContext('2d',{willReadFrequently:true});
 g.setTransform(qq,0,0,qq,pad,pad);part.paint(g,{m:true,d:false});g.setTransform(1,0,0,1,0,0);const w=c.width,h=c.height,d=g.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(d[(y*w+x)*4+3]>4){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
 b=x1<0?{x:0,y:0,w:1,h:1}:{x:(x0-pad)/qq,y:(y0-pad)/qq,w:(x1-x0+1)/qq,h:(y1-y0+1)/qq};EX_UBOX.set(key,b);return b;}
const exQ=scale=>Math.max(.02,Math.round(scale*32)/32);
// A part of a figure as wood: {cv, mk, ux, uy, uw, uh} (the canvas, its mask, and its box in figure units). q: device pixels per unit.
export function exPartSprite(fig,part,scale,dpr=1,rotSeed=0){const q=exQ(scale);return exCached(`p|${fig.id}|${part.n}|${q}|${dpr}`,()=>{const T=exTiles(),ub=exUnitBox(fig,part),mg0=8+(10*q+4)/q,ux=ub.x-mg0,uy=ub.y-mg0,cw=Math.ceil((ub.w+2*mg0)*q),ch=Math.ceil((ub.h+2*mg0)*q);
 const m=exCanvas(cw,ch),mg=m.getContext('2d');mg.setTransform(q,0,0,q,-ux*q,-uy*q);part.paint(mg,{m:true,d:false});
 const c=exCanvas(cw,ch),g=c.getContext('2d');g.setTransform(q,0,0,q,-ux*q,-uy*q);part.paint(g,{m:false,d:false});g.setTransform(1,0,0,1,0,0);
 if(T){g.globalCompositeOperation='multiply';g.globalAlpha=.2*(fig.grain??1);g.fillStyle=exPat(g,T.grain,(rotSeed*37)%180,.6*dpr,rotSeed*11);g.fillRect(0,0,cw,ch);g.globalAlpha=1;}
 g.globalCompositeOperation='destination-in';g.drawImage(m,0,0);g.globalCompositeOperation='source-over';
 g.setTransform(q,0,0,q,-ux*q,-uy*q);part.paint(g,{m:false,d:true});g.setTransform(1,0,0,1,0,0);
 g.drawImage(exEdge(m,1.5*q+.6,'#2a1c14'),0,0);
 g.globalAlpha=.55;g.drawImage(exRim(m,-3*q,'#fff8e8',4*q),0,0);g.globalAlpha=.42;g.drawImage(exRim(m,3*q,'#3a2414',4*q),0,0);g.globalAlpha=1;
 g.globalCompositeOperation='source-atop';const gr=g.createRadialGradient(cw*.3,ch*.22,0,cw*.3,ch*.22,Math.max(cw,ch)*.6);gr.addColorStop(0,'rgba(255,255,255,.2)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,cw,ch);g.globalCompositeOperation='source-over';
 return {cv:c,mk:m,ux,uy,uw:cw/q,uh:ch/q,q};});}
// The whole figure at rest: the union of the masks of its parts (the hole), and the raised piece for the tray and the flight (its shadow,
// its thickness of raw wood, the parts), with a dimming layer of its own shape.
export function exPieceSprite(fig,scale,dpr=1){const q=exQ(scale);return exCached(`f|${fig.id}|${q}|${dpr}`,()=>{const pad=Math.ceil(14*q)+6,cw=Math.ceil(fig.w*q)+2*pad,ch=Math.ceil(fig.h*q)+2*pad;
 const parts=fig.parts.map((p,i)=>({p,s:exPartSprite(fig,p,scale,dpr,i)}));const m=exCanvas(cw,ch),mg=m.getContext('2d');
 for(const {p,s} of parts){if(p.prop)continue;mg.drawImage(s.mk,pad+s.ux*q,pad+s.uy*q,s.uw*q,s.uh*q);}
 const c=exCanvas(cw,ch),g=c.getContext('2d');
 g.save();g.filter=`blur(${(5*q).toFixed(2)}px)`;g.globalAlpha=.42;g.drawImage(exTint(m,'#1a0e06'),5*q,8*q);g.restore();
 const side=exTint(m,'#b48a58');for(let k=7;k>=1;k--)g.drawImage(side,k*.55*q,k*.8*q);g.globalAlpha=.25;g.drawImage(exTint(m,'#3a2414'),3.5*q,5*q);g.globalAlpha=1;
 for(const {p,s} of parts){if(p.prop)continue;g.drawImage(s.cv,pad+s.ux*q,pad+s.uy*q,s.uw*q,s.uh*q);}
 return {cv:c,mk:m,dark:exTint(m,'#000'),light:exTint(m,'#fff'),ux:-pad/q,uy:-pad/q,uw:cw/q,uh:ch/q,q,pad};});}
// The hole of a figure: raw birch, darker, an inner shadow on the upper left edge, a light on the lower right one; with the ghost of the
// figure (30 %, a little grey) when the hint is the picture. On the white base the hole is darker, so it still reads as a hole.
export function exHoleSprite(fig,scale,dpr=1,ghost=true,white=false){const q=exQ(scale);return exCached(`h|${fig.id}|${q}|${dpr}|${ghost?1:0}|${white?1:0}`,()=>{const T=exTiles(),P=exPieceSprite(fig,scale,dpr),m=P.mk,w=m.width,h=m.height,c=exCanvas(w,h),g=c.getContext('2d');
 if(T)g.fillStyle=exPat(g,T.birch,0,.7*dpr);else g.fillStyle='#d8c09a';g.fillRect(0,0,w,h);g.fillStyle=white?'rgba(70,45,20,.42)':'rgba(90,60,30,.3)';g.fillRect(0,0,w,h);
 if(ghost){g.globalAlpha=.3;g.filter='grayscale(.55)';for(const [i,p] of fig.parts.entries()){if(p.prop)continue;const s=exPartSprite(fig,p,scale,dpr,i);g.drawImage(s.cv,P.pad+s.ux*q,P.pad+s.uy*q,s.uw*q,s.uh*q);}g.filter='none';g.globalAlpha=1;}
 g.globalCompositeOperation='destination-in';g.drawImage(m,0,0);g.globalCompositeOperation='source-over';
 g.globalAlpha=.8;g.filter=`blur(${(4*q).toFixed(2)}px)`;g.drawImage(exRim(m,9*q,'#1c0f06',0),0,0);g.filter='none';g.globalAlpha=1;
 g.globalCompositeOperation='destination-in';g.drawImage(m,0,0);g.globalCompositeOperation='source-over';
 g.globalAlpha=.6;g.drawImage(exRim(m,-2.5*q,'#fff2d8',0),q,q);g.globalAlpha=1;
 g.drawImage(exEdge(m,1.2*q+.4,'rgba(30,16,6,.55)'),0,0);
 const hp=Math.ceil(28*q),warm=exTint(m,white?'#ff9f2a':'#ffd77a'),dil=exCanvas(w+2*hp,h+2*hp),dg=dil.getContext('2d');for(let a=0;a<8;a++)dg.drawImage(warm,hp+Math.cos(a/8*EXTAU)*6*q,hp+Math.sin(a/8*EXTAU)*6*q);dg.drawImage(warm,hp,hp);
 const halo=exCanvas(w+2*hp,h+2*hp),hg=halo.getContext('2d');hg.filter=`blur(${(13*q).toFixed(2)}px)`;hg.drawImage(dil,0,0);hg.filter='none';
 return {cv:c,halo,warm,hp:hp/q,ux:P.ux,uy:P.uy,uw:P.uw,uh:P.uh,q};});}
// a mover of the scene as a piece of wood (one part)
// (a big mover, such as a band of waves, is made at a capped density and drawn scaled up: it is a soft shape, and the pipeline costs by the pixel)
function exMoverSprite(scene,mv,scale,dpr){const fig={id:`m|${scene.world}|${scene.light}|${mv.id}`,w:mv.w,h:mv.h,parts:[{n:'x',pv:mv.pv,paint:mv.paint}],grain:.8},area=mv.w*mv.h;return exPartSprite(fig,fig.parts[0],Math.min(scale,area>150000?1.3:area>40000?2:4),dpr,mv.id.length);}
// ── geometry ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The plank fills the stage: the scene in a panel above, the carved tray below it, the command strip of the boards under the tray. The
// scene (1600 × 640) covers the panel; what the panel cannot show is sky or ground, never a hole (safe area: x 170–1430, so a tall panel
// never scales the scene past its width over 1260; the worlds paint on above and below the scene as well).
export function exGeom(w,h,preview=false){const strip=preview?0:TL_STRIP,trayH=preview?h*.27:Math.max(104,Math.min(264,h*.28)),m=Math.max(8,Math.min(w,h)*.016);
 const panel={x:m,y:m,w:w-2*m,h:Math.max(40,h-strip-trayH-2*m)},tray={x:m,y:h-strip-trayH+m*.4,w:w-2*m,h:trayH-m*1.4};
 // the scene covers the panel; on a panel wider than 2.5:1 it keeps at least 92 % of its height and the worlds paint on past their sides
 const kw=panel.w/EX_SCENE_W,kh=panel.h/EX_SCENE_H,k=kh>=kw?Math.min(kh,panel.w/1260):Math.min(kw,kh/.92),ox=panel.x+(panel.w-EX_SCENE_W*k)/2,oy=panel.y+(panel.h-EX_SCENE_H*k)/2;return {w,h,m,strip,panel,tray,k,ox,oy,preview};}
export function exSlots(G,n){const gap=Math.max(10,G.w*.018),pad=G.tray.h*.08,slotH=G.tray.h-2*pad,slotW=Math.min((G.tray.w-gap*(n+1))/n,slotH*2.1),total=n*slotW+(n-1)*gap,x0=G.tray.x+(G.tray.w-total)/2,y=G.tray.y+pad,r=Math.min(22,slotH*.16);
 return Array.from({length:n},(_,i)=>{const x=x0+i*(slotW+gap);return {x,y,w:slotW,h:slotH,kind:'panel',radius:r,pts:tlRound(x,y,slotW,slotH,r)};});}
// The zones of the scanning: the slots of the tray, one per piece offered (CSS pixels).
export function exLayout(state,options,w,h){const G=exGeom(w,h,false);return exSlots(G,Math.max(1,options.length)).map((z,i)=>({...z,zone:options[i]?.value??options[i]?.id??options[i]}));}
const exDpr=c=>{const m=c.getTransform&&c.getTransform();return m&&m.a?m.a:1;};
// the place of a hole on the screen: the figure's box origin (CSS), and its scale (CSS pixels per unit)
function exHolePlace(G,scene,id){const fig=exFigure(id),hp=scene.holes[id]||[800,320,.7];const kc=hp[2]*G.k;return {fig,kc,X:G.ox+hp[0]*G.k-fig.w*kc/2,Y:G.oy+hp[1]*G.k-fig.h*kc/2,cx:G.ox+hp[0]*G.k,cy:G.oy+hp[1]*G.k};}
// ── painting a figure from its parts ─────────────────────────────────────────────────────────────────────────────────────────────
// X, Y: the figure box origin (CSS); kc: CSS pixels per unit; A: the anim of the moment (or null: at rest); env: how much of it (0..1).
export function exDrawFigure(c,fig,X,Y,kc,dpr,A=null,env=1,alpha=1){const q=kc*dpr;c.save();c.globalAlpha*=alpha;c.translate(X,Y);
 const W=A?._;if(W&&env>0){c.translate(fig.w*kc/2+(W.x||0)*kc*env,fig.h*kc/2+(W.y||0)*kc*env);c.rotate((W.r||0)*env);c.scale(1+((W.s??1)-1)*env,1+((W.s??1)-1)*env);c.translate(-fig.w*kc/2,-fig.h*kc/2);}
 if(!EX_DOM){exDirect(c,fig,kc,A,env);c.restore();return;}
 fig.parts.forEach((p,i)=>{const t=A?.[p.n];if(p.prop&&!(t&&t.a>0))return;const s=exPartSprite(fig,p,kc,dpr,i);const r=(t?.r||0)*env,dx=(t?.x||0)*env,dy=(t?.y||0)*env,sc=1+((t?.s??1)-1)*env;
  c.save();if(p.prop)c.globalAlpha*=exClamp(t.a)*env;c.translate((p.pv[0]+dx)*kc,(p.pv[1]+dy)*kc);c.rotate(r);c.scale(sc,sc);c.translate(-p.pv[0]*kc,-p.pv[1]*kc);c.drawImage(s.cv,s.ux*kc,s.uy*kc,s.uw*kc,s.uh*kc);c.restore();});
 c.restore();}
// the raised piece (tray, flight): centred at (cx, cy), kc CSS pixels per unit, turned by r
function exDrawPiece(c,fig,cx,cy,kc,dpr,r=0,lift=0,alpha=1){if(!EX_DOM){c.save();c.globalAlpha*=alpha;c.translate(cx,cy-lift);c.rotate(r);c.translate(-fig.w*kc/2,-fig.h*kc/2);exDirect(c,fig,kc);c.restore();return null;}const P=exPieceSprite(fig,kc,dpr);c.save();c.globalAlpha*=alpha;c.translate(cx,cy-lift);c.rotate(r);c.translate(-fig.w*kc/2,-fig.h*kc/2);
 if(lift>0){c.save();c.globalAlpha*=.3*Math.min(1,lift/12);c.translate(lift*.5,lift*1.2);c.drawImage(P.dark,P.ux*kc,P.uy*kc,P.uw*kc,P.uh*kc);c.restore();}
 c.drawImage(P.cv,P.ux*kc,P.uy*kc,P.uw*kc,P.uh*kc);c.restore();return P;}
function exDrawDim(c,fig,cx,cy,kc,dpr,r,lift,a,white){if(a<=.002||!EX_DOM)return;const P=exPieceSprite(fig,kc,dpr);c.save();c.globalAlpha*=a;c.translate(cx,cy-lift);c.rotate(r);c.translate(-fig.w*kc/2,-fig.h*kc/2);c.drawImage(white?P.light:P.dark,P.ux*kc,P.uy*kc,P.uw*kc,P.uh*kc);c.restore();}
// the scale of a piece in a slot of the tray (CSS pixels per unit)
const exTrayScale=(fig,z)=>Math.min((z.w*.9)/fig.w,(z.h*.86)/fig.h);
// ── the sheet: the plank, the scene set into it, the tray ─────────────────────────────────────────────────────────────────────────
function exPaintSheet(x,G,scene,decor){const {w,h,panel,tray,k,ox,oy}=G,T=exTiles();
 if(decor.mode==='none'){x.fillStyle=decor.base;x.fillRect(0,0,w,h);return;}
 x.fillStyle=T?exPat(x,T.birch,90,.7):'#e0c89c';x.fillRect(0,0,w,h);x.fillStyle='rgba(80,50,20,.18)';x.fillRect(0,0,w,h);
 // the scene: pieces of painted wood
 const R=(path,col,rot=0,off=0,plain=false)=>{x.save();path(x);x.fillStyle=col;x.fill();if(!plain&&T){x.clip();x.globalCompositeOperation='multiply';x.globalAlpha=.22;x.fillStyle=exPat(x,T.grain,rot,.6/k,off);x.fillRect(-1200,-400,EX_SCENE_W+2400,EX_SCENE_H+1200);}x.restore();
  x.save();path(x);x.strokeStyle=plain?'rgba(40,24,12,.4)':'rgba(40,24,12,.55)';x.lineWidth=(plain?1.6:2.4)/k;x.stroke();x.restore();};
 x.save();x.beginPath();x.rect(panel.x,panel.y,panel.w,panel.h);x.clip();x.translate(ox,oy);x.scale(k,k);scene.statics(x,R,{white:decor.white});x.restore();
 // the rim of the panel: a shadow inside the upper left edge, a light on the lower right one, the bevel
 x.save();x.beginPath();x.rect(panel.x,panel.y,panel.w,panel.h);x.clip();x.lineWidth=2;for(let i=0;i<8;i++){x.strokeStyle=`rgba(20,10,4,${(.2-i*.024).toFixed(3)})`;x.strokeRect(panel.x+1+i*2,panel.y+1+i*2,panel.w-2-i*4,panel.h-2-i*4);}x.restore();
 x.save();x.strokeStyle='rgba(30,16,6,.6)';x.lineWidth=4;x.strokeRect(panel.x,panel.y,panel.w,panel.h);x.strokeStyle='rgba(255,240,210,.5)';x.lineWidth=2;x.strokeRect(panel.x-3,panel.y-3,panel.w+6,panel.h+6);x.restore();
 // the tray: a trough carved in the plank
 x.save();x.beginPath();x.roundRect(tray.x,tray.y,tray.w,tray.h,22);x.clip();x.fillStyle=T?exPat(x,T.birch,0,.75):'#d8bd92';x.fillRect(0,0,w,h);x.fillStyle='rgba(60,35,15,.3)';x.fillRect(0,0,w,h);
 x.lineWidth=2.5;for(let i=0;i<9;i++){x.strokeStyle=`rgba(20,10,4,${(.26-i*.027).toFixed(3)})`;x.beginPath();x.roundRect(tray.x+1.2+i*2.4,tray.y+1.2+i*2.4,tray.w-2.4-i*4.8,tray.h-2.4-i*4.8,Math.max(4,22-i*2));x.stroke();}
 const tg=x.createLinearGradient(0,tray.y,0,tray.y+Math.min(40,tray.h*.3));tg.addColorStop(0,'rgba(20,10,4,.38)');tg.addColorStop(1,'rgba(20,10,4,0)');x.fillStyle=tg;x.fillRect(tray.x,tray.y,tray.w,Math.min(40,tray.h*.3));x.restore();
 x.save();x.strokeStyle='rgba(255,240,210,.55)';x.lineWidth=2;x.beginPath();x.roundRect(tray.x,tray.y,tray.w,tray.h,22);x.stroke();x.restore();}
const exSheetKey=(B,G,decor)=>`ex|${B.b}|${decor.mode}|${decor.base}|${G.preview?1:0}`;
function exSheet(c,G,B,decor,dx=0,alpha=1){const scene=exScene(B.world,B.light);tlSheet(c,exSheetKey(B,G,decor),x=>exPaintSheet(x,G,scene,decor),dx,0,alpha);}
// the movers at u (0 at the start of the board, 1 at the end of its party), clipped to the panel
function exMovers(c,G,scene,u,t,dpr,decor){if(decor.mode==='none')return;const {panel,k,ox,oy}=G;c.save();c.beginPath();c.rect(panel.x,panel.y,panel.w,panel.h);c.clip();
 for(const mv of scene.movers){const p=mv.path(u,t),pv=mv.pivot||mv.pv;c.save();if(p.a!==undefined&&p.a<1)c.globalAlpha*=exClamp(p.a);c.translate(ox+p.x*k,oy+p.y*k);c.rotate(p.r||0);const sc=(p.s??1)*k;c.scale(sc,sc);c.translate(-pv[0],-pv[1]);
  if(EX_DOM){const s=exMoverSprite(scene,mv,k*dpr,dpr);c.drawImage(s.cv,s.ux,s.uy,s.uw,s.uh);}else{mv.paint(c,{m:false,d:false});mv.paint(c,{m:false,d:true});}c.restore();}
 c.restore();}
// the veil of «Decorat atenuat» over the plank, the scene and the tray (the holes, the figures and the pieces go over it)
function exDimVeil(c,G,decor){if(decor.fade>=1||decor.mode==='none')return;c.save();c.globalAlpha=1-decor.fade;c.fillStyle=decor.base;c.fillRect(0,0,G.w,G.h);c.restore();}
// a hole, with its glow when it is the one of the round (breathing slowly, no flicker)
function exDrawHole(c,G,scene,id,dpr,ghost,white,glow,clock){const H=exHolePlace(G,scene,id);
 if(!EX_DOM){c.save();c.fillStyle=white?'#b9955e':'#d9bd8c';c.fillRect(H.X,H.Y,H.fig.w*H.kc,H.fig.h*H.kc);if(ghost){c.globalAlpha*=.3;c.translate(H.X,H.Y);exDirect(c,H.fig,H.kc,null,1,true);}c.restore();return H;}
 const S=exHoleSprite(H.fig,H.kc,dpr,ghost,white);
 if(glow>0){const a=glow*(.66+.2*Math.sin(clock*EXTAU/3.2));c.save();c.globalAlpha*=a;c.translate(H.X,H.Y);c.drawImage(S.halo,(S.ux-S.hp)*H.kc,(S.uy-S.hp)*H.kc,(S.uw+2*S.hp)*H.kc,(S.uh+2*S.hp)*H.kc);c.restore();}
 c.save();c.translate(H.X,H.Y);c.drawImage(S.cv,S.ux*H.kc,S.uy*H.kc,S.uw*H.kc,S.uh*H.kc);if(glow>0){c.globalAlpha*=glow*.2;c.drawImage(S.warm,S.ux*H.kc,S.uy*H.kc,S.uw*H.kc,S.uh*H.kc);}c.restore();return H;}
// ── the mark of the target hole (0.45.1 proposals): «contorn» a thick bright outline that breathes, «focus» a spotlight that dims the rest
// of the scene, «fletxa» a wooden arrow that bounces over the hole. Slow motions only (a period of 1.6 to 3.2 s), no flashes.
function exMarkRing(fig,kc,dpr,r,col,blur=0){const P=exPieceSprite(fig,kc,dpr),q=P.q,m=P.mk,pd=Math.ceil((r+blur*2)*q)+4;return exCached(`mr|${fig.id}|${q}|${dpr}|${r}|${col}|${blur}`,()=>{
 const w=m.width+2*pd,h=m.height+2*pd,d=exCanvas(w,h),g=d.getContext('2d');for(let k=1;k<=3;k++)for(let a=0;a<16;a++)g.drawImage(m,pd+Math.cos(a/16*EXTAU)*r*q*k/3,pd+Math.sin(a/16*EXTAU)*r*q*k/3);
 g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-out';g.drawImage(m,pd,pd);
 if(blur>0){const e=exCanvas(w,h),eg=e.getContext('2d');eg.filter=`blur(${(blur*q).toFixed(2)}px)`;eg.drawImage(d,0,0);eg.filter='none';eg.globalCompositeOperation='destination-out';eg.drawImage(m,pd,pd);return {cv:e,pd:pd/q,P};}
 return {cv:d,pd:pd/q,P};});}
function exArrow(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(-22,-70);c.lineTo(22,-70);c.lineTo(22,-26);c.lineTo(44,-26);c.lineTo(0,18);c.lineTo(-44,-26);c.lineTo(-22,-26);c.closePath();
 c.shadowColor='rgba(20,10,4,.45)';c.shadowBlur=10;c.shadowOffsetY=6;c.fillStyle='#ff8a1e';c.fill();c.shadowColor='transparent';c.lineJoin='round';c.lineWidth=6;c.strokeStyle='#3a1a06';c.stroke();
 c.beginPath();c.moveTo(-14,-62);c.lineTo(-14,-30);c.strokeStyle='rgba(255,236,190,.7)';c.lineWidth=4;c.stroke();c.restore();}
function exMark(c,G,scene,id,dpr,style,clock,white){if(!style||!id||!EX_DOM)return;const H=exHolePlace(G,scene,id),{panel}=G,fw=H.fig.w*H.kc,fh=H.fig.h*H.kc,br=.5+.5*Math.sin(clock*EXTAU/2.4);
 if(style==='focus'){const r0=Math.max(fw,fh)*.62,r1=r0+Math.min(G.w,G.h)*.22;c.save();c.beginPath();c.rect(panel.x,panel.y,panel.w,panel.h);c.clip();const g=c.createRadialGradient(H.cx,H.cy,r0,H.cx,H.cy,r1);g.addColorStop(0,'rgba(8,6,18,0)');g.addColorStop(1,`rgba(8,6,18,${(.58+.06*br).toFixed(3)})`);c.fillStyle=g;c.fillRect(panel.x,panel.y,panel.w,panel.h);c.restore();
  const R=exMarkRing(H.fig,H.kc,dpr,7,'#fff1b0');c.save();c.globalAlpha=.75+.25*br;c.translate(H.X,H.Y);c.drawImage(R.cv,(R.P.ux-R.pd)*H.kc,(R.P.uy-R.pd)*H.kc,(R.P.uw+2*R.pd)*H.kc,(R.P.uh+2*R.pd)*H.kc);c.restore();return;}
 if(style==='contorn'){const R0=exMarkRing(H.fig,H.kc,dpr,13,'#2a1404'),R=exMarkRing(H.fig,H.kc,dpr,10,white?'#ff7a00':'#ffd21f');c.save();c.translate(H.X,H.Y);
  const dr=(o,a)=>{c.globalAlpha=a;c.drawImage(o.cv,(o.P.ux-o.pd)*H.kc,(o.P.uy-o.pd)*H.kc,(o.P.uw+2*o.pd)*H.kc,(o.P.uh+2*o.pd)*H.kc);};dr(R0,.85);dr(R,1);
  // 0.45.5: the halo stays attached to the outline: it does not grow (growing made it read as a second line, Marc); it breathes by
  // its light only, a soft glow that fades outwards from the outline
  dr(exMarkRing(H.fig,H.kc,dpr,20,white?'rgba(255,110,0,.75)':'rgba(255,214,70,.8)',6),.45+.4*br);c.restore();return;}
 if(style==='fletxa'){const R=exMarkRing(H.fig,H.kc,dpr,6,'#ffd21f');c.save();c.translate(H.X,H.Y);c.globalAlpha=.9;c.drawImage(R.cv,(R.P.ux-R.pd)*H.kc,(R.P.uy-R.pd)*H.kc,(R.P.uw+2*R.pd)*H.kc,(R.P.uh+2*R.pd)*H.kc);c.restore();
  const sc=Math.max(.7,Math.min(1.5,G.h/720)),top=H.cy-fh*.5-14*sc,y=Math.max(panel.y+92*sc,top)-Math.abs(Math.sin(clock*EXTAU/1.6))*20*sc;exArrow(c,H.cx,y,sc);}}
// the sawdust of a piece that lands: a few specks from the lower edge, falling, for half a second
function exSawdust(c,H,t,dpr){if(t<0||t>.6)return;const u=t/.6;c.save();c.globalAlpha=(1-u)*.8;c.fillStyle='#c9a46a';for(let i=0;i<9;i++){const a=Math.PI*(.15+.7*i/8),r=(10+i%3*8)*H.kc*u*1.6;const x=H.cx+Math.cos(a)*r*1.4,y=H.cy+H.fig.h*H.kc*.42+Math.sin(a)*r*.4+u*u*26*H.kc;c.beginPath();c.arc(x,y,(1.6+i%2)*Math.max(.6,H.kc),0,EXTAU);c.fill();}c.restore();}
// the pupil's focus: the veil of the waiting cue, the ring of the zone in focus (tlRing: every setting of the highlight)
function exVeilRing(c,G,view){const wait=view.wait??(view.waiting?1:0);if(wait>0){c.save();c.fillStyle=`rgba(10,8,16,${(.34*wait).toFixed(3)})`;c.fillRect(0,0,G.w,G.h);c.restore();}
 const f=view.focus??-1,zones=view.zones||[];if(f>=0&&zones[f]&&!view.waiting)tlRing(c,zones[f].pts,view.progress,1,Math.max(.6,Math.min(1.2,G.w/1280)),view.ring);}
// the idle of a fitted figure: a breath, and nothing else
const exIdle=(t,i)=>({_:{x:0,y:Math.sin(t*1.7+i*1.9)*1.2,r:0,s:1}});
// the envelope of a life: in over .25 s, out over the last .4 s (so a figure settles back into its hole)
const exEnv=(t,T)=>exClamp(t/.25)*(1-exEase((t-(T-.45))/.45));
// ── the board at rest ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function exBoard(c,w,h,state,game,s,view){const preview=!!view.preview,G=exGeom(w,h,preview),dpr=exDpr(c),decor=view.decor,B=exBoardOf(preview?0:state.round),scene=exScene(B.world,B.light);
 const placed=preview?['gavina','pop']:(view.picks||exPlaced(state)),options=preview?['pescadora','cranc','barca']:(view.options||[]).map(o=>o?.value??o?.id??o),zones=preview?exSlots(G,3):(view.zones||exSlots(G,options.length));
 const target=preview?'pescadora':exTarget(state,s),lliure=!preview&&s?.exMode==='lliure',ghost=preview||s?.exHint!=='silueta',glowOn=preview||s?.exGlow!==false,clock=view.clock||0,t=s?.reduced?0:clock;
 exSheet(c,G,B,decor);exMovers(c,G,scene,Math.min(.45,placed.length*.15),t,dpr,decor);exDimVeil(c,G,decor);
 for(const id of B.holes){if(placed.includes(id)){const H=exHolePlace(G,scene,id);exDrawFigure(c,H.fig,H.X,H.Y,H.kc,dpr,s?.reduced?null:exIdle(t,B.holes.indexOf(id)),1);}
  else exDrawHole(c,G,scene,id,dpr,ghost,decor.white,glowOn?(id===target?1:lliure?.4:0):0,clock);}
 if(glowOn&&target&&!preview)exMark(c,G,scene,target,dpr,s?.exMark||'contorn',clock,decor.white);
 // the tray
 const help=!preview&&exHelp(state,s);options.forEach((id,i)=>{const z=zones[i];if(!z)return;const fig=exFigure(id),kc=exTrayScale(fig,z),light=preview?1:(view.lights?.[i]??TL_DIM),k=exClamp((light-TL_DIM)/(1-TL_DIM)),lift=4+exEase(k)*6;
  const wig=help&&id===target&&!s?.reduced?Math.sin(clock*EXTAU*.8)*.08*(.5+.5*Math.sin(clock*EXTAU/2.6)):0;const cx=z.x+z.w/2,cy=z.y+z.h/2+2;
  exDrawPiece(c,fig,cx,cy,kc,dpr,wig,lift,1);exDrawDim(c,fig,cx,cy,kc,dpr,wig,lift,preview?0:.26*(1-k),decor.white);});
 if(!preview)exVeilRing(c,G,view);}
// ── the result of a pick ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// A piece that fits: its flight from the tray (an arc, EX_FLY), the «clac», its life (its gag), and it stays. The fourth: the party of
// the board (all the figures, the movers in their grooves), then the figures hop out and the board slides away as the next one comes.
// A piece that does not fit: it lifts, flies to the hole, tries it, taps twice on the rim and hops back to its place in the tray.
export function exResult(c,w,h,state,game,s,view,time){time*=exPace(s);const G=exGeom(w,h,false),dpr=exDpr(c),decor=view.decor,B=exBoardOf(state.round),scene=exScene(B.world,B.light),reduced=!!s?.reduced,pace=1;
 const placed=view.picks||exPlaced(state),id=view.pendingId,correct=!!view.correct,final=!!view.final,options=(view.options||[]).map(o=>o?.value??o?.id??o),zones=view.zones||exSlots(G,options.length),chosen=Math.max(0,view.chosen??options.indexOf(id)),clock=view.clock||0,tt=reduced?0:clock;
 const target=exTarget(state,s),lliure=s?.exMode==='lliure',ghost=s?.exHint!=='silueta',glowOn=s?.exGlow!==false,variant=exVariant(state.round,state.stage),white=decor.white;
 const tp=final?time-EX_FLY:-1,partyU=final?exClamp(tp/EX_PARTY):0,te=final?time-EX_FLY-EX_PARTY:-1;
 // the change of board: both boards slide (the next one is painted at rest with every hole open)
 let slideU=0;if(final&&te>.45){slideU=reduced?exClamp((te-.45)/(EX_OUT-.45)):exEase((te-.45)/(EX_OUT-.45));}
 const drawNext=()=>{const B2=exBoardOf(state.round+1),sc2=exScene(B2.world,B2.light),dx=reduced?0:G.w*(1-slideU);c.save();exSheet(c,G,B2,decor,dx,reduced?slideU:1);if(reduced)c.globalAlpha*=slideU;else c.translate(dx,0);exMovers(c,G,sc2,0,tt,dpr,decor);exDimVeil(c,G,decor);for(const hid of B2.holes)exDrawHole(c,G,sc2,hid,dpr,ghost,white,0,clock);c.restore();};
 // (with reduced motion the current board stays and the next one fades in over it)
 const dx0=slideU>0&&!reduced?-G.w*slideU:0;c.save();exSheet(c,G,B,decor,dx0);if(dx0)c.translate(dx0,0);
 exMovers(c,G,scene,final?.45+.55*(reduced?1:partyU):Math.min(.45,placed.length*.15),tt,dpr,decor);exDimVeil(c,G,decor);
 const landed=correct&&time>=EX_FLY,all=landed?[...placed,id]:placed;
 // the figures on the board
 for(const hid of B.holes){const isNew=hid===id&&correct;
  if(!all.includes(hid)){const glow=glowOn&&!landed&&(hid===target||lliure&&hid===id)?1:0;exDrawHole(c,G,scene,hid,dpr,ghost,white,glow,clock);continue;}
  const H=exHolePlace(G,scene,hid);let A=null,env=1,alpha=1,hopY=0;
  if(final){// the party: the new figure plays its gag at once and another one later; the others in turn
   const i=placed.indexOf(hid),starts=isNew?[[.05,variant],[7.4,1-variant]]:[[1.8+i*2.2,(variant+i)%2]];let on=null;for(const [t0,v] of starts){const tl=(tp-t0)*pace;if(tl>=0&&tl<EX_LIFE){on=[tl,v];}}
   if(on&&!reduced){A=H.fig.anim(on[0],on[1],{T:EX_LIFE,party:true,pace});env=exEnv(on[0],EX_LIFE);}else if(!reduced)A=exIdle(tt,B.holes.indexOf(hid));
   if(te>0){const u=exClamp(te/.5);hopY=reduced?0:-Math.sin(u*Math.PI)*40*H.kc+u*u*(G.panel.y+G.panel.h-H.Y)*1.1;alpha=reduced?1-u:1;}}
  else if(isNew){const tl=(time-EX_FLY)*pace;if(!reduced&&tl<EX_LIFE){A=H.fig.anim(tl,variant,{T:EX_LIFE,party:false,pace});env=exEnv(tl,EX_LIFE);}else if(reduced&&tl<EX_LIFE){A=H.fig.anim(Math.min(tl,1.4),variant,{T:EX_LIFE,party:false,pace});env=.3*exEnv(tl,EX_LIFE);}}
  else if(!reduced)A=exIdle(tt,B.holes.indexOf(hid));
  c.save();if(te>0){c.beginPath();c.rect(G.panel.x,G.panel.y,G.panel.w,G.panel.h);c.clip();}
  const settle=isNew&&!final&&!reduced?1+.05*(1-exSettle((time-EX_FLY)/.5)):1;c.translate(H.cx,H.cy+hopY);c.scale(settle,settle);c.translate(-H.cx,-H.cy);
  exDrawFigure(c,H.fig,H.X,H.Y,H.kc,dpr,A,env,alpha);c.restore();if(isNew&&!final)exSawdust(c,H,time-EX_FLY,dpr);if(isNew&&final)exSawdust(c,H,time-EX_FLY,dpr);}
 if(glowOn&&!landed&&!lliure&&target&&!all.includes(target))exMark(c,G,scene,target,dpr,s?.exMark||'contorn',clock,white);
 // the tray: the other pieces at rest
 options.forEach((oid,i)=>{if(i===chosen)return;const z=zones[i];if(!z)return;const fig=exFigure(oid),kc=exTrayScale(fig,z),light=view.lights?.[i]??TL_DIM,k=exClamp((light-TL_DIM)/(1-TL_DIM));exDrawPiece(c,fig,z.x+z.w/2,z.y+z.h/2+2,kc,dpr,0,4+k*6,1);exDrawDim(c,fig,z.x+z.w/2,z.y+z.h/2+2,kc,dpr,0,4+k*6,.26*(1-k),white);});
 // the piece in flight
 const z0=zones[chosen]||zones[0];if(z0&&id){const fig=exFigure(id),ts=exTrayScale(fig,z0),sx=z0.x+z0.w/2,sy=z0.y+z0.h/2+2,own=scene.holes[id]?exHolePlace(G,scene,id):null,hole=correct?own:(target&&scene.holes[target]?exHolePlace(G,scene,target):own);
  const fly=(u,lift,r0)=>{if(!hole)return;const ex=hole.cx,ey=hole.cy,kc=ts+(hole.kc-ts)*u;exDrawPiece(c,fig,sx+(ex-sx)*u,sy+(ey-sy)*u-Math.sin(u*Math.PI)*lift,kc,dpr,r0*Math.sin(u*Math.PI),6+Math.sin(u*Math.PI)*14,1);};
  if(correct&&time<EX_FLY){if(reduced){if(time<EX_FLY*.5)exDrawPiece(c,fig,sx,sy,ts,dpr,0,6,1-time/(EX_FLY*.5));}else fly(exEase(time/EX_FLY),Math.min(150,G.h*.2),-.12);}
  if(!correct){const lift=exEase(time/.25)*10;if(reduced){const a=time<.7?1:time<1.1?.6:1;exDrawPiece(c,fig,sx,sy,ts,dpr,0,4+lift,a);}
   else if(time<.25)exDrawPiece(c,fig,sx,sy,ts,dpr,0,4+lift,1);
   else if(time<.7)fly(exEase((time-.25)/.45),Math.min(120,G.h*.16),-.1);
   else if(time<1.1){const u=(time-.7)/.4,wob=Math.sin(u*EXTAU*2.5)*.1,tap=(time>.88&&time<.96)||(time>1.02&&time<1.1)?3:0;if(hole)exDrawPiece(c,fig,hole.cx,hole.cy+tap,hole.kc,dpr,wob,10,1);}
   else {const u=exEase((time-1.1)/(EX_WRONG-1.1));if(hole){const kc=hole.kc+(ts-hole.kc)*u,b=u>=1?0:1;exDrawPiece(c,fig,hole.cx+(sx-hole.cx)*u,hole.cy+(sy-hole.cy)*u-Math.sin(u*Math.PI)*Math.min(170,G.h*.22),kc,dpr,.25*Math.sin(u*Math.PI),4+Math.sin(u*Math.PI)*16*b,1);}}}}
 c.restore();
 if(slideU>0)drawNext();
 // while the party plays, the next board gets ready a piece at a time, so the change does not stutter
 if(final&&tp>3&&tp<EX_PARTY-.5)exWarmNext(c,G,state.round+1,decor,dpr,ghost,white,options.length);
 exVeilRing(c,G,{...view,focus:-1,wait:0,waiting:false});}
// ── getting ready ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
let exWarmRound=-1,exWarmQueue=[];
function exWarmNext(c,G,round,decor,dpr,ghost,white,nOpts=3){if(!EX_DOM)return;if(exWarmRound!==round){exWarmRound=round;const B=exBoardOf(round),scene=exScene(B.world,B.light),z=exSlots(G,Math.max(1,nOpts))[0];exWarmQueue=[()=>exSheet(c,G,B,decor,0,0)];
  for(const hid of B.holes){const H=exHolePlace(G,scene,hid);exWarmQueue.push(()=>exHoleSprite(H.fig,H.kc,dpr,ghost,white));}for(const hid of [...B.holes,B.guest]){const fig=exFigure(hid);exWarmQueue.push(()=>exPieceSprite(fig,exTrayScale(fig,z),dpr));}
  for(const mv of scene.movers)exWarmQueue.push(()=>exMoverSprite(scene,mv,G.k*dpr,dpr));}
 const job=exWarmQueue.shift();if(job)try{job();}catch{}}
// Behind the loading cover: the grain, the sheet of the first board and the sprites of its figures (the first frames do it).
export function exPrewarm(c,w,h,decor,round=0,nOpts=3){if(!EX_DOM)return;exTiles();const G=exGeom(w,h,false),B=exBoardOf(round),scene=exScene(B.world,B.light),dpr=exDpr(c),z=exSlots(G,Math.max(1,nOpts))[0];exSheet(c,G,B,decor);
 for(const hid of B.holes){const H=exHolePlace(G,scene,hid);exHoleSprite(H.fig,H.kc,dpr,true,decor.white);}for(const hid of [...B.holes,B.guest]){const fig=exFigure(hid);exPieceSprite(fig,exTrayScale(fig,z),dpr);}for(const mv of scene.movers)exMoverSprite(scene,mv,G.k*dpr,dpr);}
