// Natura (CE23): cut paper drawn from code. A scene is a list of layers of paper pieces (polygons in scene units, where the
// scene fits in a circle of radius 1). Each piece casts a soft shadow on what lies below it, and it can lift, fold open and sway.
// The fibre textures are generated once, in code, so the activity still needs no image files.
import {K_TAU,Kclamp,Ksmooth,KeaseOut,Krand,Kmix,Krgba} from './kaleido-base.js';
import {Gcanvas,Gfbm} from './glass.js';

// ── Shapes in scene units ─────────────────────────────────────────────────────────────────────────────────────────────
// Hand cut: every vertex moves a little, so a circle cut with scissors is never a perfect circle.
export function Pjitter(pts,amount,seed){return pts.map(([x,y],i)=>[x+(Krand(i,seed)-.5)*2*amount,y+(Krand(i+500,seed)-.5)*2*amount]);}
// Torn edge: each side is split into short steps that wander in and out of the line.
export function Ptorn(pts,amount,seed,step=.02){const out=[];for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length],len=Math.hypot(q[0]-p[0],q[1]-p[1]),k=Math.max(1,Math.round(len/step)),nx=-(q[1]-p[1])/(len||1),ny=(q[0]-p[0])/(len||1);
 for(let j=0;j<k;j++){const u=j/k,w=j===0?0:(Krand(i*97+j,seed)-.5)*2*amount+(Krand(i*97+j+1e3,seed)-.5)*amount;out.push([p[0]+(q[0]-p[0])*u+nx*w,p[1]+(q[1]-p[1])*u+ny*w]);}}return out;}
// Organic blob: a circle whose radius wobbles with a few slow waves.
export function Pblob(r,n,wobble,seed,cx=0,cy=0){const ph=[0,1,2].map(k=>Krand(k,seed)*K_TAU);return Array.from({length:n},(_,i)=>{const a=i*K_TAU/n,rr=r*(1+wobble*(.6*Math.sin(2*a+ph[0])+.3*Math.sin(3*a+ph[1])+.2*Math.sin(5*a+ph[2])));return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr];});}
// Leaf: a pointed oval from the stem (0,0) along the angle a, with a slightly asymmetric belly.
export function Pleaf(len,wd,a=0,n=14,tilt=.08){const ux=Math.cos(a),uy=Math.sin(a),pts=[];for(let i=0;i<=n;i++){const u=i/n,w=wd*Math.pow(Math.sin(Math.PI*Math.pow(u,.85)),.9)*(1+tilt);pts.push([ux*len*u-uy*w,uy*len*u+ux*w]);}
 for(let i=n-1;i>0;i--){const u=i/n,w=wd*Math.pow(Math.sin(Math.PI*Math.pow(u,.85)),.9)*(1-tilt);pts.push([ux*len*u+uy*w,uy*len*u-ux*w]);}return pts;}
// Rounded petal: wide and round at the tip (like a cherry or almond blossom), narrow at the base.
export function Ppetal(r0,r1,a,wd,n=14,notch=0){const ux=Math.cos(a),uy=Math.sin(a),pts=[];for(let i=0;i<=2*n;i++){const th=Math.PI*i/(2*n),u=Math.sin(th),side=Math.cos(th);
 const r=r0+(r1-r0)*(u*(1-notch*Math.exp(-Math.pow(side/.18,2)))),w=wd*side*Math.pow(u,.6);pts.push([ux*r-uy*w,uy*r+ux*w]);}return pts;}
// Ring of a band between two radii, as one closed polygon (outer edge forward, inner edge back).
export function Pring(r0,r1,n=48,a0=0,a1=K_TAU){const pts=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;pts.push([Math.cos(a)*r1,Math.sin(a)*r1]);}for(let i=n;i>=0;i--){const a=a0+(a1-a0)*i/n;pts.push([Math.cos(a)*r0,Math.sin(a)*r0]);}return pts;}

// ── Paper textures ───────────────────────────────────────────────────────────────────────────────────────────────────
// Grey tiles (256 px, generated once) centred on mid-grey and blended over the pieces in 'overlay' mode: lighter grey lifts the paper, darker grey shades it.
const P_TEX=new Map();
// Fibres: thin wandering strands, lighter or darker than the paper, added into the tile with wrap-around.
function Pfibres(n,count,seed,len,amp){const out=new Float32Array(n*n);for(let k=0;k<count;k++){let x=Krand(k,seed)*n,y=Krand(k+1e4,seed)*n,a=Krand(k+2e4,seed)*K_TAU;const L=len*(.4+Krand(k+3e4,seed)),v=(Krand(k+4e4,seed)<.62?1:-.8)*amp*(.5+Krand(k+5e4,seed)),bend=(Krand(k+6e4,seed)-.5)*.03;
 for(let s=0;s<L;s++){a+=bend+(Krand(k*131+s,seed+7)-.5)*.07;x+=Math.cos(a);y+=Math.sin(a);const X=((Math.floor(x)%n)+n)%n,Y=((Math.floor(y)%n)+n)%n,fx=x-Math.floor(x),fy=y-Math.floor(y),f=Math.sin(Math.PI*s/L);
  out[Y*n+X]+=v*f*(1-fx)*(1-fy);out[Y*n+(X+1)%n]+=v*f*fx*(1-fy);out[((Y+1)%n)*n+X]+=v*f*(1-fx)*fy;out[((Y+1)%n)*n+(X+1)%n]+=v*f*fx*fy;}}return out;}
const P_TEXTURES={
 // Cold-pressed watercolour paper: a soft, bumpy grain.
 cotton:n=>{const a=Gfbm(n,20,20,101,3),b=Gfbm(n,64,64,102,1);return i=>.5+.42*(a[i]-.5)+.22*(b[i]-.5);},
 // Mulberry (washi) paper: long silky fibres over a light mottling.
 washi:n=>{const a=Gfbm(n,5,5,111,3),f=Pfibres(n,260,113,90,.2);return i=>.5+.22*(a[i]-.5)+f[i];},
 // Construction paper: a fine felted grain with short fibres.
 card:n=>{const a=Gfbm(n,48,48,121,2),f=Pfibres(n,700,123,16,.12);return i=>.5+.3*(a[i]-.5)+f[i];},
 // Handmade paper: cloudy pulp with small flecks.
 pulp:n=>{const a=Gfbm(n,6,6,131,4),b=Gfbm(n,40,40,132,2),fl=new Float32Array(n*n);for(let k=0;k<90;k++){const X=Math.floor(Krand(k,133)*n),Y=Math.floor(Krand(k,134)*n),v=(Krand(k,135)<.5?-.18:.14);fl[Y*n+X]+=v;fl[Y*n+(X+1)%n]+=v*.5;}
  return i=>.5+.36*(a[i]-.5)+.18*(b[i]-.5)+fl[i];},
 // Crêpe paper: fine crinkles running across the sheet.
 crepe:n=>{const a=Gfbm(n,3,40,141,3),b=Gfbm(n,24,24,142,1);return i=>.5+.36*(a[i]-.5)+.12*(b[i]-.5);}
};
export function paperTexture(kind){if(P_TEX.has(kind))return P_TEX.get(kind);let cv=null;const make=P_TEXTURES[kind],n=256;
 if(make){cv=Gcanvas(n);const c=cv?.getContext?.('2d');if(c&&c.createImageData){const img=c.createImageData(n,n),d=img.data,val=make(n);for(let i=0;i<n*n;i++){const v=Math.round(Kclamp(val(i))*255);d[i*4]=d[i*4+1]=d[i*4+2]=v;d[i*4+3]=255;}c.putImageData(img,0,0);}else cv=null;}
 P_TEX.set(kind,cv);return cv;}

// ── Motion of a piece ────────────────────────────────────────────────────────────────────────────────────────────────
// Landing: the piece drops onto the page from just above it (it starts lifted and slightly larger, with a long soft shadow).
export function Pland(t,t0,len=.6){const x=Kclamp((t-t0)/len);return {v:Ksmooth(x*2.2),z:1-KeaseOut(x),s:1+.12*(1-KeaseOut(x))};}
// Unfolding: 0 (folded flat along its axis) to 1 (open), with a small overshoot like a pop-up card.
export function Punfold(t,t0,len=.7){const x=Kclamp((t-t0)/len);return x<=0?0:x>=1?1:1-Math.pow(1-x,3)*Math.cos(x*Math.PI*1.4);}

// ── Drawing ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// A piece: {pts, color, v (visibility 0–1), z (lift 0–1), tex, rim (torn white edge, scene units), j (shade −1…1),
//           x, y (position), s (scale), r (turn), fold:{a (axis angle), f (−1…1: negative shows the back)}, back (colour of the back)}.
// A layer: {pieces, rot, k (scale), dx, dy, texA, tex, after(c, S, unit)}.
// view: {cx, cy, R (pixels per scene unit), base ('black'|'white'), board:{pts|r, color, tex}, light (angle of the shadows),
//        clip (true: pieces are trimmed to the board, for scenes that run to the edge of the sheet)}.
const P_RIM='#fbfaf7';
function Pshade(p,fold){const j=p.j||0;let col=fold<0&&p.back?p.back:p.color;col=j>0?Kmix(col,'#ffffff',.16*j):Kmix(col,'#000000',-.14*j);
 // A piece seen at an angle while it folds catches less light.
 const tilt=1-Math.abs(fold);return tilt>.01?Kmix(col,'#000000',.32*tilt):col;}
function Ptrace(c,pts){c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();}
// Scene units to pixels for one piece of one layer.
function Pplace(p,S){const s=p.s??1,r=p.r||0,co=Math.cos(r)*s,si=Math.sin(r)*s,x0=p.x||0,y0=p.y||0,fo=p.fold;let ux=1,uy=0,f=1;if(fo){ux=Math.cos(fo.a||0);uy=Math.sin(fo.a||0);f=fo.f;}
 return p.pts.map(([x,y])=>{if(fo){const a=x*ux+y*uy,b=(-x*uy+y*ux)*f;x=a*ux-b*uy;y=a*uy+b*ux;}return S([x0+x*co-y*si,y0+x*si+y*co]);});}
export function paperScene(c,w,h,o,layers,view){const {cx,cy,R}=view,white=o.base==='white',quality=Kclamp(o.quality??1),la=view.light??.95,lx=Math.cos(la),ly=Math.sin(la);
 if(view.board)Pboard(c,view,white,quality);
 const clip=!!(view.clip&&view.board);if(clip){c.save();c.beginPath();Pboardpath(c,view);c.clip();}
 for(const layer of layers){const k=layer.k??1,rot=layer.rot||0,co=Math.cos(rot)*k*R,si=Math.sin(rot)*k*R,dx=cx+(layer.dx||0)*R,dy=cy+(layer.dy||0)*R,S=([x,y])=>[dx+x*co-y*si,dy+x*si+y*co],unit=R*k;
  const items=[];for(const p of layer.pieces){if(!p||p.pts.length<3)continue;const v=Kclamp(p.v??1);if(v<=.004)continue;const fold=p.fold?p.fold.f:1;if(Math.abs(fold)<.02)continue;items.push({p,v,fold,z:Kclamp(p.z||0),pts:Pplace(p,S)});}
  if(!items.length){if(layer.after)layer.after(c,S,unit);continue;}
  c.save();c.lineJoin='round';
  // Shadows: the pieces resting on the page share one soft shadow; lifted or fading pieces each cast their own, longer and softer.
  const sh=(layer.shadow??1)*unit,base=sh*.012,alpha=white?.2:.42,flat=items.filter(x=>x.z<.03&&x.v>=.99),lifted=items.filter(x=>!(x.z<.03&&x.v>=.99));
  const cast=(list,off,blur,a)=>{if(!list.length||off<=0)return;if(quality>.5&&c.shadowBlur!==undefined){const F=1e4+w;c.shadowColor=`rgba(8,6,20,${(a).toFixed(3)})`;c.shadowBlur=blur*quality;c.shadowOffsetX=F+lx*off;c.shadowOffsetY=ly*off;c.fillStyle='#000';c.beginPath();for(const x of list)Ptrace(c,x.pts.map(([px,py])=>[px-F,py]));c.fill();c.shadowColor='rgba(0,0,0,0)';c.shadowBlur=0;c.shadowOffsetX=c.shadowOffsetY=0;}
   else{c.fillStyle=`rgba(8,6,20,${(a*.8).toFixed(3)})`;c.beginPath();for(const x of list)Ptrace(c,x.pts.map(([px,py])=>[px+lx*off,py+ly*off]));c.fill();}};
  if(sh>0){cast(flat,base,base*1.6,alpha);for(const x of lifted){c.globalAlpha=x.v;cast([x],base+x.z*sh*.06,base*1.6+x.z*sh*.05,alpha*(1-.4*x.z));}c.globalAlpha=1;}
  // Torn pieces show the white core of the sheet along their edge.
  for(const x of items){if(!x.p.rim)continue;c.globalAlpha=x.v;c.strokeStyle=white?'#ffffff':P_RIM;c.lineWidth=2*x.p.rim*unit;c.beginPath();Ptrace(c,x.pts);c.stroke();}
  for(const x of items){c.globalAlpha=x.v;c.fillStyle=Pshade(x.p,x.fold);c.beginPath();Ptrace(c,x.pts);c.fill();}c.globalAlpha=1;
  // Paper grain follows the scene: it turns and scales with the layer, so it never shimmers on its own.
  const texA=(layer.texA??.5)*(.35+.65*quality),solid=items.filter(x=>x.v>.5);if(texA>.01&&solid.length){const kinds=new Set(solid.map(x=>x.p.tex||layer.tex||'card'));
   for(const kind of kinds){const tex=paperTexture(kind);if(!tex)continue;const pat=c.createPattern(tex,'repeat');if(!pat)continue;
    if(pat.setTransform&&typeof DOMMatrix!=='undefined'){const z=unit/420;pat.setTransform(new DOMMatrix([Math.cos(rot)*z,Math.sin(rot)*z,-Math.sin(rot)*z,Math.cos(rot)*z,dx,dy]));}
    c.globalCompositeOperation='overlay';c.globalAlpha=texA;c.fillStyle=pat;c.beginPath();for(const x of solid)if((x.p.tex||layer.tex||'card')===kind)Ptrace(c,x.pts);c.fill();c.globalAlpha=1;c.globalCompositeOperation='source-over';}}
  // A fine light line along the cut edge: the thickness of the paper catching the light.
  if(layer.edge!==false){c.strokeStyle=white?'rgba(255,255,255,.55)':'rgba(255,255,255,.2)';c.lineWidth=Math.max(.6,unit*.0028);c.beginPath();for(const x of solid)if(!x.p.rim)Ptrace(c,x.pts);c.stroke();}
  if(layer.after)layer.after(c,S,unit);
  c.restore();}
 if(clip)c.restore();}
// The backing sheet: a coloured card behind the whole scene, lit softly from the upper left.
function Pboardpath(c,view){const b=view.board,{cx,cy,R}=view;if(b.pts)Ptrace(c,b.pts.map(([x,y])=>[cx+x*R,cy+y*R]));else c.arc(cx,cy,(b.r||1.02)*R,0,K_TAU);}
function Pboard(c,view,white,quality){const b=view.board,{cx,cy,R}=view;c.save();c.beginPath();Pboardpath(c,view);c.clip();
 const g=c.createRadialGradient(cx-.45*R,cy-.55*R,0,cx,cy,1.5*R);g.addColorStop(0,Kmix(b.color,'#ffffff',white?.25:.12));g.addColorStop(1,Kmix(b.color,'#000000',white?0:.28));c.fillStyle=g;c.fillRect(cx-1.6*R,cy-1.6*R,3.2*R,3.2*R);
 const tex=paperTexture(b.tex||'pulp');if(tex){const pat=c.createPattern(tex,'repeat');if(pat){if(pat.setTransform&&typeof DOMMatrix!=='undefined'){const z=R/420;pat.setTransform(new DOMMatrix([z,0,0,z,cx,cy]));}c.globalCompositeOperation='overlay';c.globalAlpha=(b.texA??.55)*(.35+.65*quality);c.fillStyle=pat;c.fillRect(cx-1.6*R,cy-1.6*R,3.2*R,3.2*R);}}
 c.restore();}
// Soft reveal: 0 before the moment t0, 1 after t0 + len.
export const Pon=(t,t0,len=.5)=>Ksmooth((t-t0)/len);
// Seeded shade for each piece, so neighbouring pieces of the same colour still look like different sheets.
export const Pshadev=(i,seed)=>Krand(i*5.3+17,seed)*2-1;
export const Pcolor=Krgba;
