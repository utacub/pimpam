// Estiu a la masia (EN26), 0.39: nature painters. Foliage, grass, wheat, stone, tiles, water, hills, paths, plants. Names start with mn.
// Every painter takes the light of the hour L (mpHour) and a seed; everything is deterministic so the cached sheets never flicker.
import {MP_TAU,mpRng,mpNoise,mpFbm,mpClamp,mpLerp,mpRgb,mpMix,mpLight,mpDark,mpSat,mpLit,mpShade,mpCol,mpPath,mpBounds,mpInside,mpBlob,mpSmooth,mpScatter,mpGouache,mpGrad,mpTone,mpLine,mpSoft,mpFill,mpGroundShadow,mpCastShadow,mpTreeShadow,mpDapple,mpHex,mpShift} from './masia-pinzell.js';
// ── Palettes of the farm (base colours, before the light of the hour) ────────────────────────────────────────────────────────────
export const MN_PAL={
 leafFig:[[46,92,44],[88,142,58],[150,196,86]],leafOak:[[52,84,40],[96,134,54],[160,186,80]],leafOlive:[[96,118,88],[138,160,122],[190,204,170]],leafCypress:[[30,58,40],[52,88,56],[86,124,76]],
 grass:[[96,142,52],[134,176,70],[184,210,104]],grassDry:[[150,152,78],[190,184,100],[224,212,138]],wheat:[[182,142,62],[220,186,92],[246,222,140]],
 hillFar:[108,132,150],hillMid:[130,150,112],vine:[76,112,60],earth:[164,120,80],path:[204,176,130],stone:[[158,146,128],[190,178,156],[214,204,186]],stoneWarm:[[172,150,118],[206,186,150],[230,214,180]],
 tile:[[160,86,60],[198,118,78],[224,150,104]],wood:[[92,62,40],[136,96,60],[176,134,88]],woodGrey:[[108,100,92],[150,140,126],[186,176,160]],water:[[52,96,122],[96,150,170],[170,206,214]],
 shutter:[76,112,80],door:[104,72,46],hay:[[190,150,70],[226,190,96],[248,224,140]],sunflower:[[236,178,40],[250,210,70]],tomato:[[200,50,40],[240,90,60]],lettuce:[[120,170,70],[180,214,110]],flowerW:[246,240,220],flowerR:[226,78,80],flowerY:[246,208,80],flowerP:[200,120,190]};
// ── Terrain ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A ridge line across the width: an array of [x,y] with soft hills.
export function mnRidge(W,baseY,amp,seed,n=24,pow=1.3){const pts=[];for(let i=0;i<=n;i++){const u=i/n;const k=mpFbm(u*3.1+seed*7.3,seed*1.7,seed,3);pts.push([u*W-W*.02,baseY-amp*Math.pow(k,pow)]);}pts[0][0]=-40;pts[n][0]=W+40;return mpSmooth(pts,4);}
export function mnRidgePoly(ridge,bottom){return ridge.concat([[ridge[ridge.length-1][0],bottom],[ridge[0][0],bottom]]);}
// Far hills: a flat mass tinted by the haze, lighter towards the sun, with a few soft folds.
export function mnHills(c,ridge,bottom,col,L,seed,o={}){const {hazeK=.5,folds=5,vines=0,village=null}=o;const poly=mnRidgePoly(ridge,bottom);const base=mpMix(mpCol(col,L,.5),L.haze[0],hazeK*L.haze[1]);
 mpFill(c,poly,base);c.save();mpPath(c,poly);c.clip();const b=mpBounds(poly);
 // light from the sun side
 const g=c.createLinearGradient(b.x+(L.sunDir>0?b.w:0),0,b.x+(L.sunDir>0?0:b.w),0);g.addColorStop(0,mpRgb(mpLight(mpMix(base,L.sun,.3),.12),.5));g.addColorStop(1,mpRgb(mpDark(mpMix(base,L.shadeTint,.3),.1),.45));c.fillStyle=g;c.fillRect(b.x,b.y,b.w,b.h);
 // folds: soft darker slopes going down from the ridge
 const r=mpRng(seed);for(let i=0;i<folds;i++){const x=b.x+(i+.5+(r()-.5)*.6)/folds*b.w;const top=ridge.reduce((best,p)=>Math.abs(p[0]-x)<Math.abs(best[0]-x)?p:best,ridge[0]);const w=b.w/folds*(.6+r()*.5);
  const pts=[[x-w*.1,top[1]],[x+w*.55*L.sunDir,top[1]+b.h*.35],[x+w*.5*L.sunDir,bottom+20],[x-w*.5*L.sunDir,bottom+20],[x-w*.3*L.sunDir,top[1]+b.h*.5]];mpSoft(c,mpSmooth(pts,3,true),mpDark(base,.16),10,.35);}
 if(vines)mnVineRows(c,poly,ridge,L,seed+3,vines);
 if(village)mnFarVillage(c,village[0],village[1],village[2],L,seed+9);
 c.restore();}
// Patchwork fields on a hill: the hill polygon is cut in strips (quads following the ridge) of different tones; some strips carry rows
// (vines or furrows), and a thin dark hedge separates them. hazeK fades it all to the haze colour.
export function mnPatchwork(c,poly,ridge,L,seed,o={}){const {n=9,hazeK=.4,rows=.5}=o;const b=mpBounds(poly);const r=mpRng(seed);c.save();mpPath(c,poly);c.clip();
 const tones=[MN_PAL.grass[1],MN_PAL.grassDry[1],MN_PAL.wheat[1],MN_PAL.vine,MN_PAL.grass[0],MN_PAL.earth,[140,170,90]];
 const ridgeY=x=>{const i=Math.max(0,Math.min(ridge.length-1,Math.round((x-ridge[0][0])/(ridge[ridge.length-1][0]-ridge[0][0])*(ridge.length-1))));return ridge[i][1];};
 let x=b.x-20;while(x<b.x+b.w+20){const w=b.w/n*(.5+r()*1);const x1=x+w;const skew=(r()-.5)*w*.6;const top0=ridgeY(x)+4+r()*b.h*.3,top1=ridgeY(x1)+4+r()*b.h*.3;
  const pts=[[x,top0],[x1,top1],[x1+skew,b.y+b.h+20],[x+skew,b.y+b.h+20]];const base=tones[Math.floor(r()*tones.length)];const col=mpMix(mpCol(base,L,.5),L.haze[0],hazeK*L.haze[1]);
  mpSoft(c,pts,col,1.5,.9);
  if(r()<rows){c.save();mpPath(c,pts);c.clip();c.strokeStyle=mpRgb(mpDark(col,.25),.5);c.lineWidth=1.2;const k=4+Math.floor(r()*5);for(let i=0;i<k;i++){const u=(i+.5)/k;c.beginPath();c.moveTo(x+(x1-x)*u,top0+(top1-top0)*u);c.lineTo(x+skew+(x1-x)*u,b.y+b.h+20);c.stroke();}c.restore();}
  // the hedge between fields
  c.strokeStyle=mpRgb(mpMix(mpDark(mpCol(MN_PAL.leafOak[0],L,.5),.1),L.haze[0],hazeK*L.haze[1]),.7);c.lineWidth=2+r()*2;c.beginPath();c.moveTo(x1,top1);c.lineTo(x1+skew,b.y+b.h+20);c.stroke();x=x1;}
 c.restore();}
// Rows of vines following the hill: thin dark green dotted lines, denser lower.
export function mnVineRows(c,poly,ridge,L,seed,n){const b=mpBounds(poly);const col=mpMix(mpCol(MN_PAL.vine,L,.5),L.haze[0],.35*L.haze[1]);c.save();mpPath(c,poly);c.clip();c.strokeStyle=mpRgb(col,.55);c.lineCap='round';
 for(let i=0;i<n;i++){const u=(i+.5)/n;const y0=b.y+b.h*(.18+u*.8);c.lineWidth=1.2+u*2.4;c.setLineDash([3+u*5,2+u*3]);c.beginPath();for(let x=b.x;x<=b.x+b.w;x+=12){const ry=ridge.reduce((best,p)=>Math.abs(p[0]-x)<Math.abs(best[0]-x)?p:best,ridge[0])[1];const y=y0+(ry-b.y)*.35+Math.sin(x*.01+i)*3;if(x===b.x)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();}
 c.restore();}
// A far village: small pale boxes with dark roofs and a church tower, hazed.
export function mnFarVillage(c,x,y,s,L,seed){const r=mpRng(seed);const wall=mpMix([236,226,206],L.haze[0],.45*L.haze[1]),roof=mpMix([170,96,70],L.haze[0],.5*L.haze[1]);const n=9;
 for(let i=0;i<n;i++){const u=(i-n/2)/n;const w=s*(.5+r()*.5),h=s*(.35+r()*.4),px=x+u*s*4.2+(r()-.5)*s*.4,py=y-Math.abs(u)*s*.6+(r()-.5)*s*.2;
  c.fillStyle=mpRgb(wall);c.fillRect(px-w/2,py-h,w,h);c.fillStyle=mpRgb(mpDark(wall,.12));c.fillRect(px-w/2+(L.sunDir>0?w*.62:0),py-h,w*.38,h);c.fillStyle=mpRgb(roof);c.beginPath();c.moveTo(px-w/2-1,py-h);c.lineTo(px+w/2+1,py-h);c.lineTo(px,py-h-w*.3);c.closePath();c.fill();}
 c.fillStyle=mpRgb(wall);c.fillRect(x-s*.22,y-s*2.2,s*.44,s*2.2);c.fillStyle=mpRgb(mpDark(wall,.12));c.fillRect(x+(L.sunDir>0?s*.04:-s*.22),y-s*2.2,s*.18,s*2.2);c.fillStyle=mpRgb(roof);c.beginPath();c.moveTo(x-s*.28,y-s*2.2);c.lineTo(x+s*.28,y-s*2.2);c.lineTo(x,y-s*2.7);c.closePath();c.fill();}
// Ground: a gouache mass with the hour's light, warmer and more saturated near.
export function mnGround(c,poly,pal,L,seed,o={}){const col=mpCol(pal[1],L,o.lightK??1);mpGouache(c,poly,col,{seed,strokes:o.strokes??22,light:.12,dark:.12,dir:o.dir??0,long:.5,soft:o.soft??0,sunDir:L.sunDir,L});}
// Grass: tufts of blades over the ground, in three tones, leaning with the wind (lean in px at the tip), denser near (y). The blades
// are batched by tone and width into a few paths, so a lawn of a thousand blades costs a handful of strokes.
export function mnGrass(c,poly,pal,L,seed,o={}){const {n=900,len=14,lean=0,flowers=0,tone=1,width=1.6,dapple=null,patches=0}=o;const r=mpRng(seed);const pts=mpScatter(poly,n,seed);const b=mpBounds(poly);
 const cols=pal.map(p=>mpCol(p,L,.8));c.save();mpPath(c,poly);c.clip();c.lineCap='round';
 for(let i=0;i<patches;i++){const x=b.x+r()*b.w,y=b.y+r()*b.h;const k=r();mpSoft(c,mpBlob(x,y,30+r()*110,seed+i*3,.3,14,8+r()*24),k<.4?mpDark(cols[0],.12):k<.7?cols[1]:mpLight(cols[2],.08),16,.4);}
 const buckets=new Map();const add=(ti,wb,x0,y0,cx,cy,x1,y1)=>{const k=ti*4+wb;let a=buckets.get(k);if(!a){a=[];buckets.set(k,a);}a.push(x0,y0,cx,cy,x1,y1);};
 for(const [x,y,k] of pts){const depth=mpClamp((y-b.y)/Math.max(1,b.h));const h=len*(.6+k*.8)*(.5+depth*.8);const lit=(x-b.cx)/b.w*L.sunDir;let ti=k<.3?0:k<.72?1:2;if(lit>.1&&ti<2&&r()<.5)ti++;if(lit<-.1&&ti>0&&r()<.5)ti--;
  const wb=Math.min(3,Math.floor(depth*4));const bend=(r()-.5)*6+lean*(.5+k);add(ti,wb,x,y,x+bend*.4,y-h*.55,x+bend,y-h);
  if(r()<.12)add(Math.max(0,ti-1),wb,x+1,y,x-bend*.3,y-h*.4,x-bend*.5-3,y-h*.72);}
 for(const [k,a] of buckets){const ti=Math.floor(k/4),wb=k%4;c.strokeStyle=mpRgb(cols[ti],.9*tone);c.lineWidth=width*(.6+(wb+.5)/4);c.beginPath();for(let i=0;i<a.length;i+=6){c.moveTo(a[i],a[i+1]);c.quadraticCurveTo(a[i+2],a[i+3],a[i+4],a[i+5]);}c.stroke();}
 if(flowers){const fp=mpScatter(poly,flowers,seed+5);const fc=[MN_PAL.flowerW,MN_PAL.flowerY,MN_PAL.flowerR,MN_PAL.flowerP];for(const [x,y,k] of fp){const col=fc[Math.floor(k*fc.length)%fc.length];const R=1.4+k*1.6;c.fillStyle=mpRgb(mpCol(col,L,.5));c.beginPath();for(let p=0;p<5;p++){const a=p/5*MP_TAU;c.moveTo(x+Math.cos(a)*R+R*.8,y-len*.5+Math.sin(a)*R*.7);c.arc(x+Math.cos(a)*R,y-len*.5+Math.sin(a)*R*.7,R*.8,0,MP_TAU);}c.fill();c.fillStyle=mpRgb(MN_PAL.flowerY);c.beginPath();c.arc(x,y-len*.5,R*.6,0,MP_TAU);c.fill();}}
 if(dapple)mpDapple(c,poly,dapple.col,seed+7,dapple.n||20,dapple.a||.3,dapple.size||16);c.restore();}
// Wheat: a golden field. Rows of stalks with heads, lighter where the wind wave passes (wave: phase 0..1 of a band of light that crosses).
export function mnWheat(c,poly,L,seed,o={}){const {rows=14,wave=.35,waveW=.22,lean=4,heads:withHeads=true}=o;const b=mpBounds(poly);const pal=MN_PAL.wheat.map(p=>mpCol(p,L,.9));
 mpGouache(c,poly,pal[1],{seed,strokes:18,light:.1,dark:.1,long:.6,sunDir:L.sunDir,L});c.save();mpPath(c,poly);c.clip();
 // soft patches of tone: the field is not even
 const r=mpRng(seed+1);for(let i=0;i<14;i++){const x=b.x+r()*b.w,y=b.y+r()*b.h;mpSoft(c,mpBlob(x,y,40+r()*120,seed+i,.3,14,10+r()*26),r()<.5?mpDark(pal[1],.1):mpLight(pal[2],.05),14,.35);}
 // the band of light of the wind
 const wx=b.x+b.w*wave;const g=c.createLinearGradient(wx-b.w*waveW,0,wx+b.w*waveW,0);g.addColorStop(0,mpRgb(pal[2],0));g.addColorStop(.5,mpRgb(mpLight(pal[2],.25),.5));g.addColorStop(1,mpRgb(pal[2],0));c.fillStyle=g;c.fillRect(b.x,b.y,b.w,b.h);
 // stalks: rows from far to near, each row denser and taller; nearly vertical, bending a little with the wind. Batched by tone.
 const buckets=new Map();const add=(ti,wb,x0,y0,cx,cy,x1,y1)=>{const k=ti*8+wb;let a=buckets.get(k);if(!a){a=[];buckets.set(k,a);}a.push(x0,y0,cx,cy,x1,y1);};const heads=[[],[],[]];
 for(let i=0;i<rows;i++){const u=(i+.5)/rows;const y=b.y+b.h*Math.pow(u,1.2);const h=5+u*24;const step=3+u*3;const wb=Math.min(7,Math.floor(u*8));
  for(let x=b.x-10;x<b.x+b.w+10;x+=step){const k=r();if(k>.7)continue;if(!mpInside(poly,x,y+h*.2))continue;const near=Math.abs(x-wx)/(b.w*waveW);const inWave=near<1?1-near:0;const ln=lean*(.3+u*.5)*(1+inWave*1.8)+(k-.5)*2;
   const ti=k<.25?0:k<.5?1:2;add(ti,wb,x,y+h*.3,x+ln*.2,y-h*.3,x+ln,y-h);
   if(withHeads&&k<.45)heads[inWave>.3?2:ti].push(x+ln,y-h-h*.12,1+u*1.4,h*.2,ln*.05);}}
 const tones=[mpDark(pal[0],.12),pal[1],pal[2]];for(const [k,a] of buckets){const ti=Math.floor(k/8),wb=k%8;c.strokeStyle=mpRgb(tones[ti],.5+wb/8*.35);c.lineWidth=.7+wb/8*1.1;c.beginPath();for(let i=0;i<a.length;i+=6){c.moveTo(a[i],a[i+1]);c.quadraticCurveTo(a[i+2],a[i+3],a[i+4],a[i+5]);}c.stroke();}
 if(withHeads){const hc=[pal[1],pal[2],mpLight(pal[2],.15)];for(let ti=0;ti<3;ti++){const a=heads[ti];if(!a.length)continue;c.fillStyle=mpRgb(hc[ti],.9);c.beginPath();for(let i=0;i<a.length;i+=5){c.moveTo(a[i]+a[i+2],a[i+1]);c.ellipse(a[i],a[i+1],a[i+2],a[i+3],a[i+4],0,MP_TAU);}c.fill();}}
 // the near edge: a strip of bare earth with a few stones
 const edge=poly.filter(p=>p[1]>b.y+b.h*.6);if(edge.length>2){const earth=mpCol(MN_PAL.earth,L,.7);c.strokeStyle=mpRgb(mpDark(earth,.1),.8);c.lineWidth=7;c.lineJoin='round';c.beginPath();for(let i=0;i<poly.length;i++){const p=poly[i];if(p[1]<b.y+b.h*.6)continue;if(i&&poly[i-1][1]>=b.y+b.h*.6)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);}c.stroke();}
 c.restore();}
// Earth: a bare patch, with furrows if rows>0.
export function mnEarth(c,poly,L,seed,o={}){const col=mpCol(MN_PAL.earth,L,.8);mpGouache(c,poly,col,{seed,strokes:16,light:.1,dark:.14,long:.5,sunDir:L.sunDir,L});
 if(o.rows){const b=mpBounds(poly);c.save();mpPath(c,poly);c.clip();for(let i=0;i<o.rows;i++){const u=(i+.5)/o.rows;const y=b.y+b.h*u;c.strokeStyle=mpRgb(mpDark(col,.22),.5);c.lineWidth=2+u*3;c.beginPath();c.moveTo(b.x,y);c.quadraticCurveTo(b.cx,y+2,b.x+b.w,y);c.stroke();c.strokeStyle=mpRgb(mpLight(col,.18),.5);c.lineWidth=1.5+u*2;c.beginPath();c.moveTo(b.x,y-3-u*3);c.quadraticCurveTo(b.cx,y-1-u*3,b.x+b.w,y-3-u*3);c.stroke();}c.restore();}}
// A dirt path along a polyline, soft edges, a lighter crown and some pebbles.
export function mnPath(c,pts,w0,w1,L,seed){const col=mpCol(MN_PAL.path,L,.8);const sm=mpSmooth(pts,6);c.save();c.lineCap='round';c.lineJoin='round';
 for(const [k,al] of [[1.18,.35],[1.08,.6],[1,1]])for(let i=1;i<sm.length;i++){const u=i/(sm.length-1);const w=(w0+(w1-w0)*u)*k;c.strokeStyle=mpRgb(mpDark(col,.1),al);c.lineWidth=w;c.beginPath();c.moveTo(sm[i-1][0],sm[i-1][1]);c.lineTo(sm[i][0],sm[i][1]);c.stroke();}
for(let i=1;i<sm.length;i++){const u=i/(sm.length-1);const w=(w0+(w1-w0)*u)*.72;c.strokeStyle=mpRgb(mpLight(col,.08),.9);c.lineWidth=w;c.beginPath();c.moveTo(sm[i-1][0],sm[i-1][1]);c.lineTo(sm[i][0],sm[i][1]);c.stroke();}
 const r=mpRng(seed);for(let i=1;i<sm.length;i+=2){const u=i/(sm.length-1);const w=w0+(w1-w0)*u;for(let k=0;k<2;k++){const x=sm[i][0]+(r()-.5)*w*.8,y=sm[i][1]+(r()-.5)*w*.25;c.fillStyle=mpRgb(r()<.5?mpDark(col,.25):mpLight(col,.2),.7);c.beginPath();c.ellipse(x,y,1.2+u*1.6,.8+u*1,0,0,MP_TAU);c.fill();}}c.restore();}
// ── Trees ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A trunk with branches: tapered dark strokes with a lighter side.
export function mnTrunk(c,x,y,h,w,L,seed,o={}){const {branches=3,lean=0,pal=MN_PAL.wood,bark=true}=o;const r=mpRng(seed);const dark=mpCol(pal[0],L,.6),mid=mpCol(pal[1],L,.6);
 const pts=[[x,y],[x+lean*.3,y-h*.35],[x+lean*.7,y-h*.7],[x+lean,y-h]];const sm=mpSmooth(pts,6);c.save();c.lineCap='round';c.lineJoin='round';
 for(let i=1;i<sm.length;i++){const u=i/(sm.length-1);c.strokeStyle=mpRgb(dark);c.lineWidth=w*(1-u*.55);c.beginPath();c.moveTo(sm[i-1][0],sm[i-1][1]);c.lineTo(sm[i][0],sm[i][1]);c.stroke();}
 for(let i=1;i<sm.length;i++){const u=i/(sm.length-1);c.strokeStyle=mpRgb(mpMix(mid,L.sun,.15),.8);c.lineWidth=w*(1-u*.55)*.38;c.beginPath();c.moveTo(sm[i-1][0]+L.sunDir*w*.22*(1-u*.5),sm[i-1][1]);c.lineTo(sm[i][0]+L.sunDir*w*.22*(1-u*.5),sm[i][1]);c.stroke();}
 const out=[];for(let i=0;i<branches;i++){const u=.45+i/branches*.5;const bx=x+lean*u,by=y-h*u;const side=i%2?-1:1;const len=h*(.3+r()*.3);const ang=-Math.PI/2+side*(.5+r()*.6);const ex=bx+Math.cos(ang)*len,ey=by+Math.sin(ang)*len;const mx=(bx+ex)/2+side*len*.12,my=(by+ey)/2-len*.1;
  c.strokeStyle=mpRgb(dark);c.lineWidth=w*(.38-u*.2);c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(mx,my,ex,ey);c.stroke();out.push([ex,ey,bx,by]);}
 if(bark){c.strokeStyle=mpRgb(mpDark(dark,.3),.4);c.lineWidth=1;for(let i=0;i<6;i++){const u=r();const px=x+lean*u+(r()-.5)*w*.5,py=y-h*u;c.beginPath();c.moveTo(px,py);c.lineTo(px+(r()-.5)*3,py-8-r()*10);c.stroke();}}
 c.restore();return out;}
// A leaf canopy painted the way a background painter does it: a silhouette of overlapping leaf clusters, filled with the shade tone,
// then bunches of leaves (3–6 leaves each) all over it, denser than the silhouette so the edge is made of leaves. Five tones from the
// three of the palette; the tone of a bunch comes from its place in its cluster and the cluster's place in the crown (sun side and top
// light, underside shade), with noise. kind: 'fig' (big lobed leaves), 'oak' (small ovals), 'olive' (narrow grey-green).
export function mnCanopy(c,cx,cy,rx,ry,pal,L,seed,o={}){const {kind='oak',clusters=9,density=1,soft=1.5,alpha=1,underside=.35,leafK=1}=o;const r=mpRng(seed);const p3=pal.map(p=>mpCol(p,L,.9));
 const cols=[mpDark(p3[0],.22),p3[0],mpMix(p3[0],p3[1],.5),p3[1],mpMix(p3[1],p3[2],.5),mpMix(p3[1],p3[2],.85),mpMix(p3[2],L.sun,.2)];const sd=L.sunDir;
 const R0=(rx+ry)/2;const leaf=(kind==='fig'?R0*.062:kind==='olive'?R0*.045:R0*.046)*leafK;
 // 1 the clusters: circles inside the crown ellipse, bigger near the centre
 const cl=[];for(let i=0;i<clusters;i++){const a=r()*MP_TAU,d=Math.sqrt(r())*.8;const px=cx+Math.cos(a)*rx*d,py=cy+Math.sin(a)*ry*d;const R=R0*(.28+r()*.2)*(1-d*.3);cl.push([px,py,R,(px-cx)*sd/rx*.6-(py-cy)/ry*.7]);}
 cl.push([cx,cy-ry*.08,R0*.52,.15]);
 c.save();c.globalAlpha*=alpha;
 // 2 the silhouette in the shade tone with a soft edge
 c.save();c.fillStyle=mpRgb(cols[0]);c.beginPath();for(const [px,py,R] of cl){c.moveTo(px+R*.94,py);c.arc(px,py,R*.94,0,MP_TAU);}c.fill();c.restore();
 c.save();c.beginPath();for(const [px,py,R] of cl){c.moveTo(px+R*1.1,py);c.arc(px,py,R*1.1,0,MP_TAU);}c.clip();
 // 3 the bunches of leaves: one path per bunch (all its leaves share a tone), filled once
 const leafAt=(x,y,s,rot)=>{if(kind==='fig'){c.moveTo(x+Math.cos(rot)*s*1.1,y+Math.sin(rot)*s*1.1);c.ellipse(x,y,s*1.1,s*.95,rot,0,MP_TAU);}else if(kind==='olive')c.ellipse(x,y,s*1.5,s*.42,rot,0,MP_TAU);else c.ellipse(x,y,s*1.05,s*.68,rot,0,MP_TAU);};
 for(const [px,py,R,clit] of cl){const nb=Math.round(R*R/(leaf*leaf)*.55*density);
  for(let j=0;j<nb;j++){const a=r()*MP_TAU,d=Math.sqrt(r())*1.04;const bx=px+Math.cos(a)*R*d,by=py+Math.sin(a)*R*d;
   const lit=clit*.9+((bx-px)*sd/R)*.5-((by-py)/R)*.6+(r()-.5)*.7+mpNoise(bx/30,by/30,seed)*.6-.3;
   let ti=lit>1.15?6:lit>.8?5:lit>.45?4:lit>.08?3:lit>-.3?2:lit>-.6?1:0;if((by-cy)/ry>.45&&ti>2)ti-=1;
   const rot=r()*MP_TAU;const k=2+Math.floor(r()*4);const col=cols[Math.max(0,Math.min(6,ti+(r()<.4?(r()<.5?-1:1):0)))];c.fillStyle=mpRgb(col,.97);c.beginPath();
   for(let q=0;q<k;q++){const qa=rot+q*1.9+(r()-.5)*.8,qd=leaf*(.3+r()*1.2);const lx=bx+Math.cos(qa)*qd,ly=by+Math.sin(qa)*qd*.8,ls=leaf*(.7+r()*.55),lr=qa+(r()-.5)*.6;c.moveTo(lx+Math.cos(lr)*ls,ly+Math.sin(lr)*ls);leafAt(lx,ly,ls,lr);}
   c.fill();}}
 // 4 the underside: a soft shade rising from the bottom of the crown
 const gu=c.createLinearGradient(0,cy+ry*.1,0,cy+ry*1.05);gu.addColorStop(0,mpRgb(mpDark(cols[0],.3),0));gu.addColorStop(1,mpRgb(mpDark(cols[0],.3),underside));c.fillStyle=gu;c.fillRect(cx-rx*1.3,cy-ry*1.3,rx*2.6,ry*2.6);
 c.restore();
 // 5 a few lit leaves on the sun edge of the crown
 for(let i=0;i<Math.round(clusters*2);i++){const a=-Math.PI*.5+sd*(r()-.5)*1.5;const px=cx+Math.cos(a)*rx*(.78+r()*.25),py=cy+Math.sin(a)*ry*(.78+r()*.25);c.fillStyle=mpRgb(cols[6],.95);c.beginPath();for(let q=0;q<3;q++){const lx=px+(r()-.5)*leaf*2,ly=py+(r()-.5)*leaf*2,lr=r()*MP_TAU,ls=leaf*(.7+r()*.4);c.moveTo(lx+Math.cos(lr)*ls,ly+Math.sin(lr)*ls);leafAt(lx,ly,ls,lr);}c.fill();}
 c.restore();return mpBlob(cx,cy,rx,seed,.1,24,ry);}
// A whole tree: trunk, branches, canopy, shadow on the ground. Returns {shape, top}.
export function mnTree(c,x,y,o,L,seed){const {h=180,rx=90,ry=70,trunk=14,pal=MN_PAL.leafOak,kind='oak',lean=0,shadow=true,branches=3,clusters=9,soft=12}=o;
 if(shadow)mpTreeShadow(c,x,y+2,rx,ry,h,L,.3,6);const br=mnTrunk(c,x,y,h*.62,trunk,L,seed,{branches,lean,pal:kind==='olive'?MN_PAL.woodGrey:MN_PAL.wood});
 const cy=y-h*.62-ry*.35;const shape=mnCanopy(c,x+lean*.7,cy,rx,ry,pal,L,seed+1,{kind,clusters,soft});return {shape,top:cy-ry,cx:x+lean*.7,cy};}
// A cypress: a tall narrow dark flame.
export function mnCypress(c,x,y,h,w,L,seed){const pal=MN_PAL.leafCypress.map(p=>mpCol(p,L,.6));const r=mpRng(seed);mpTreeShadow(c,x,y,w*1.6,w*1.2,h*.7,L,.25,4);
 const pts=[];for(let i=0;i<=10;i++){const u=i/10;const ww=w*Math.sin(Math.pow(u,.7)*Math.PI)*(1+(r()-.5)*.25);pts.push([x+ww,y-h*u]);}for(let i=10;i>=0;i--){const u=i/10;const ww=w*Math.sin(Math.pow(u,.7)*Math.PI)*(1+(r()-.5)*.25);pts.push([x-ww,y-h*u]);}
 const sm=mpSmooth(pts,3,true);mpFill(c,sm,pal[0]);c.save();mpPath(c,sm);c.clip();c.fillStyle=mpRgb(pal[1],.8);c.beginPath();for(let i=0;i<60;i++){const u=r();const px=x+(r()-.5)*w*1.3*Math.sin(u*Math.PI)+L.sunDir*w*.3,py=y-h*u;c.moveTo(px+w*.25,py);c.ellipse(px,py,w*.25,w*.12,(r()-.5)*.6,0,MP_TAU);}c.fill();
 c.fillStyle=mpRgb(pal[2],.7);c.beginPath();for(let i=0;i<22;i++){const u=r();const px=x+L.sunDir*w*.45*Math.sin(u*Math.PI)+(r()-.5)*w*.3,py=y-h*u;c.moveTo(px+w*.18,py);c.ellipse(px,py,w*.18,w*.09,(r()-.5)*.6,0,MP_TAU);}c.fill();c.restore();}
// A bush: a small canopy without trunk.
export function mnBush(c,x,y,rx,ry,pal,L,seed,o={}){mpGroundShadow(c,x,y+2,rx*.9,ry*.3,L,.25,4);return mnCanopy(c,x,y-ry*.6,rx,ry,pal,L,seed,{kind:'oak',clusters:5,soft:1.2,...o});}
// ── Stone, tiles, wood ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A stone wall inside a polygon: the mortar tone, then rounded stones of varied size and tone, each with a lit top-sun edge and a shade below.
export function mnStoneWall(c,poly,pal,L,seed,o={}){const {size=16,shade=0,lightK=1,rows=null}=o;const b=mpBounds(poly);const r=mpRng(seed);const cols=pal.map(p=>mpCol(p,L,.5));const sd=L.sunDir;
 const base=shade>0?mpShade(cols[1],L,shade):mpLit(cols[1],L,.2*lightK);c.save();mpPath(c,poly);c.clip();c.fillStyle=mpRgb(mpDark(base,.12));c.fillRect(b.x,b.y,b.w,b.h);
 // the big gradient of the wall (lit side / shade side and darker at the base)
 const g=c.createLinearGradient(0,b.y,0,b.y+b.h);g.addColorStop(0,mpRgb(base,0));g.addColorStop(1,mpRgb(mpDark(base,.25),.5));
 const ny=rows||Math.ceil(b.h/size);const nx=Math.ceil(b.w/(size*1.6))+1;
 for(let j=0;j<ny;j++){for(let i=0;i<nx;i++){const w=size*(1.1+r()*1.1),h=size*(.6+r()*.5);const x=b.x+(i+(j%2)*.5)*size*1.6+(r()-.5)*size*.3,y=b.y+j*size+(r()-.5)*size*.2;if(!mpInside(poly,x,y)&&!mpInside(poly,x+w*.5,y+h*.5))continue;
   const k=r();const col=shade>0?mpShade(cols[k<.3?0:k<.75?1:2],L,shade):mpMix(cols[k<.3?0:k<.75?1:2],base,.2);const pts=mpBlob(x,y,w/2,seed+i*7+j*13,.12,10,h/2);
   c.fillStyle=mpRgb(col);mpPath(c,pts);c.fill();
   // the lit edge (sun side and top) and the shade edge
   c.save();mpPath(c,pts);c.clip();c.strokeStyle=mpRgb(mpLight(col,.22*lightK),.6);c.lineWidth=1.6;c.beginPath();c.ellipse(x-sd*1.2,y-1.2,w/2,h/2,0,0,MP_TAU);c.stroke();c.strokeStyle=mpRgb(mpDark(col,.25),.55);c.lineWidth=1.8;c.beginPath();c.ellipse(x+sd*1.4,y+1.4,w/2,h/2,0,0,MP_TAU);c.stroke();c.restore();}}
 c.fillStyle=g;c.fillRect(b.x,b.y,b.w,b.h);c.restore();}
// A plain plastered wall (lime, warm), with a soft shade and a few stains.
export function mnPlaster(c,poly,col,L,seed,o={}){const {shade=0,lightK=1}=o;const base=shade>0?mpShade(mpCol(col,L,.5),L,shade):mpLit(mpCol(col,L,.5),L,.25*lightK);mpGouache(c,poly,base,{seed,strokes:10,light:.06,dark:.08,long:.5});
 const b=mpBounds(poly);c.save();mpPath(c,poly);c.clip();const g=c.createLinearGradient(0,b.y,0,b.y+b.h);g.addColorStop(0,mpRgb(base,0));g.addColorStop(1,mpRgb(mpDark(base,.22),.45));c.fillStyle=g;c.fillRect(b.x,b.y,b.w,b.h);c.restore();}
// A tiled roof: a polygon (quad: top-left, top-right, bottom-right, bottom-left) with rows of curved tiles (the Mediterranean tile),
// alternating lit and shaded, darker near the eave, some moss and lichen.
export function mnRoofTiles(c,poly,L,seed,o={}){const {rows=9,shade=0,moss=.2}=o;const pal=MN_PAL.tile.map(p=>mpCol(p,L,.9));const r=mpRng(seed);const b=mpBounds(poly);const sd=L.sunDir;
 const base=shade>0?mpShade(pal[1],L,shade):mpLit(pal[1],L,.3);mpFill(c,poly,base);c.save();mpPath(c,poly);c.clip();
 const top=poly[0],topR=poly[1],botR=poly[2],bot=poly[3];
 for(let j=0;j<rows;j++){const u=(j+.5)/rows;const y0=top[1]+(bot[1]-top[1])*u,y1=topR[1]+(botR[1]-topR[1])*u;const x0=top[0]+(bot[0]-top[0])*u,x1=topR[0]+(botR[0]-topR[0])*u;const len=Math.hypot(x1-x0,y1-y0);const tw=(b.h/rows)*1.1;const n=Math.ceil(len/tw);
  for(let i=0;i<=n;i++){const v=i/n;const x=x0+(x1-x0)*v,y=y0+(y1-y0)*v;const k=r();const col=shade>0?mpShade(pal[k<.3?0:k<.7?1:2],L,shade):mpMix(pal[k<.3?0:k<.7?1:2],base,.25);
   // a channel tile: a dark trough and a lit ridge
   c.fillStyle=mpRgb(mpDark(col,.2),.75);c.beginPath();c.ellipse(x,y+tw*.2,tw*.5,tw*.4,0,0,Math.PI);c.fill();
   c.fillStyle=mpRgb(col,.95);c.beginPath();c.ellipse(x+tw*.5,y,tw*.42,tw*.52,0,Math.PI,MP_TAU);c.fill();
   c.strokeStyle=mpRgb(mpLight(col,.3),.55);c.lineWidth=1.4;c.beginPath();c.ellipse(x+tw*.5-sd*1.5,y+1,tw*.36,tw*.44,0,Math.PI*1.1,Math.PI*1.9);c.stroke();}
  // the shade of the row above
  c.fillStyle=mpRgb(mpDark(base,.35),.22);c.fillRect(b.x,y0-2,b.w,3);}
 if(moss){const n=Math.round(b.w*b.h/4000*moss*8);for(let i=0;i<n;i++){const x=b.x+r()*b.w,y=b.y+r()*b.h;if(!mpInside(poly,x,y))continue;c.fillStyle=mpRgb(r()<.5?mpCol([120,140,80],L,.4):mpCol([200,180,120],L,.4),.5);c.beginPath();c.ellipse(x,y,3+r()*5,2+r()*3,r()*3,0,MP_TAU);c.fill();}}
 const g=c.createLinearGradient(0,b.y,0,b.y+b.h);g.addColorStop(0,mpRgb(mpLight(base,.1),.25));g.addColorStop(1,mpRgb(mpDark(base,.3),.35));c.fillStyle=g;c.fillRect(b.x,b.y,b.w,b.h);c.restore();}
// Wooden planks along a direction: a polygon filled with boards and a few knots.
export function mnPlanks(c,poly,pal,L,seed,o={}){const {n=6,dir='h',shade=0}=o;const b=mpBounds(poly);const r=mpRng(seed);const cols=pal.map(p=>shade>0?mpShade(mpCol(p,L,.6),L,shade):mpLit(mpCol(p,L,.6),L,.2));mpFill(c,poly,cols[1]);c.save();mpPath(c,poly);c.clip();
 for(let i=0;i<n;i++){const u=i/n,u1=(i+1)/n;const k=r();c.fillStyle=mpRgb(mpMix(cols[1],cols[k<.5?0:2],.35+r()*.3));if(dir==='h')c.fillRect(b.x,b.y+b.h*u,b.w,b.h*(u1-u)-1.2);else c.fillRect(b.x+b.w*u,b.y,b.w*(u1-u)-1.2,b.h);
  c.strokeStyle=mpRgb(mpDark(cols[0],.3),.6);c.lineWidth=1.2;c.beginPath();if(dir==='h'){c.moveTo(b.x,b.y+b.h*u1-1);c.lineTo(b.x+b.w,b.y+b.h*u1-1);}else{c.moveTo(b.x+b.w*u1-1,b.y);c.lineTo(b.x+b.w*u1-1,b.y+b.h);}c.stroke();
  // grain
  c.strokeStyle=mpRgb(mpDark(cols[0],.1),.25);c.lineWidth=.8;for(let g=0;g<3;g++){const t=u+(u1-u)*(.2+g*.3);c.beginPath();if(dir==='h'){c.moveTo(b.x,b.y+b.h*t);c.quadraticCurveTo(b.cx,b.y+b.h*t+(r()-.5)*3,b.x+b.w,b.y+b.h*t);}else{c.moveTo(b.x+b.w*t,b.y);c.quadraticCurveTo(b.x+b.w*t+(r()-.5)*3,b.cy,b.x+b.w*t,b.y+b.h);}c.stroke();}
  if(r()<.4){c.fillStyle=mpRgb(mpDark(cols[0],.35),.7);c.beginPath();c.ellipse(b.x+r()*b.w,b.y+b.h*(u+u1)/2,2.5,1.8,0,0,MP_TAU);c.fill();}}
 c.restore();}
// ── Water ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A pond: the water inside a polygon reflects the sky (light far, dark near the edges), a few soft reflections (dark shapes given by
// the caller as `mirror` polygons), glints along the sun, and ripple rings at `rings` [x,y,r,alpha].
export function mnPond(c,poly,L,seed,o={}){const {rings=[],mirror=[],glints=18,t=0}=o;const b=mpBounds(poly);const pal=MN_PAL.water.map(p=>mpCol(p,L,.5));const skyFar=L.sky[1][1],skyNear=L.sky[3][1];
 c.save();mpPath(c,poly);c.clip();const g=c.createLinearGradient(0,b.y,0,b.y+b.h);g.addColorStop(0,mpRgb(mpMix(mpMix(pal[2],[150,190,170],.45),skyNear,.35)));g.addColorStop(.5,mpRgb(mpMix(mpMix(pal[1],[90,150,130],.5),skyFar,.2)));g.addColorStop(1,mpRgb(mpMix(pal[0],[50,100,90],.55)));c.fillStyle=g;c.fillRect(b.x,b.y,b.w,b.h);
 // dark green rim along the edges (the bank's reflection)
 c.save();c.filter='blur(10px)';c.strokeStyle=mpRgb(mpMix(mpDark(pal[0],.2),[40,80,50],.5),.5);c.lineWidth=22;mpPath(c,poly);c.stroke();c.restore();
 for(const m of mirror)mpSoft(c,m.pts,m.col,m.blur||6,m.alpha||.45);
 // horizontal soft streaks: the surface
 const r=mpRng(seed);c.globalCompositeOperation='screen';for(let i=0;i<26;i++){const x=b.x+r()*b.w,y=b.y+r()*b.h,w=20+r()*90,h=1.2+r()*2;c.globalAlpha=.1+r()*.18;c.fillStyle=mpRgb(mpMix(pal[2],skyFar,.5));c.beginPath();c.ellipse(x,y,w,h,0,0,MP_TAU);c.fill();}
 // glints where the sun is reflected
 const gx=b.cx+L.sunX*b.w*.3;c.globalAlpha=1;for(let i=0;i<glints;i++){const x=gx+(r()-.5)*b.w*.4,y=b.y+b.h*(.15+r()*.6)+Math.sin(t*2+i)*1.5;const w=3+r()*9;if(!mpInside(poly,x,y))continue;c.fillStyle=mpRgb(mpLight(L.sun,.3),.4+r()*.4);c.beginPath();c.ellipse(x,y,w,1,0,0,MP_TAU);c.fill();}
 c.globalCompositeOperation='source-over';
 for(const [x,y,R,a] of rings){c.strokeStyle=mpRgb(mpLight(pal[2],.5),a*.8);c.lineWidth=1.4;c.beginPath();c.ellipse(x,y,R,R*.38,0,0,MP_TAU);c.stroke();c.strokeStyle=mpRgb(mpDark(pal[0],.2),a*.5);c.beginPath();c.ellipse(x,y+1.5,R*.96,R*.36,0,0,MP_TAU);c.stroke();}
 c.restore();}
export function mnLilies(c,pts,L,seed,o={}){const r=mpRng(seed);const pal=[mpCol([70,120,60],L,.6),mpCol([120,170,80],L,.6)];for(const [x,y,s] of pts){const R=s||10;c.fillStyle=mpRgb(r()<.5?pal[0]:pal[1]);c.beginPath();c.ellipse(x,y,R,R*.5,0,.35,MP_TAU-.3);c.lineTo(x,y);c.closePath();c.fill();c.strokeStyle=mpRgb(mpLight(pal[1],.25),.6);c.lineWidth=1;c.beginPath();c.ellipse(x,y-1,R*.9,R*.42,0,Math.PI*1.1,Math.PI*1.9);c.stroke();
 if(r()<.35){c.fillStyle=mpRgb([250,220,230]);for(let p=0;p<6;p++){const a=p/6*MP_TAU;c.beginPath();c.ellipse(x+Math.cos(a)*R*.25,y-R*.35+Math.sin(a)*R*.12,R*.22,R*.1,a,0,MP_TAU);c.fill();}c.fillStyle=mpRgb(MN_PAL.flowerY);c.beginPath();c.arc(x,y-R*.35,R*.1,0,MP_TAU);c.fill();}}}
// Reeds: tall thin stalks with a dark brown head, leaning with the wind (lean px at the top).
export function mnReeds(c,x,y,n,h,L,seed,o={}){const {lean=0,spread=30}=o;const r=mpRng(seed);const green=mpCol([96,140,60],L,.7),dark=mpCol([70,52,36],L,.6);c.save();c.lineCap='round';
 for(let i=0;i<n;i++){const px=x+(r()-.5)*spread,py=y+(r()-.5)*6;const hh=h*(.6+r()*.6);const ln=lean*(.6+r()*.8)+(r()-.5)*8;c.strokeStyle=mpRgb(r()<.4?mpDark(green,.2):green);c.lineWidth=1.4+r();c.beginPath();c.moveTo(px,py);c.quadraticCurveTo(px+ln*.3,py-hh*.55,px+ln,py-hh);c.stroke();
  if(r()<.5){c.fillStyle=mpRgb(dark);c.save();c.translate(px+ln,py-hh);c.rotate(ln*.01);c.beginPath();c.ellipse(0,-hh*.06,2.2,hh*.09,0,0,MP_TAU);c.fill();c.restore();}
  else{c.strokeStyle=mpRgb(mpLight(green,.2),.8);c.lineWidth=1;c.beginPath();c.moveTo(px+ln*.5,py-hh*.6);c.quadraticCurveTo(px+ln*.5+10,py-hh*.75,px+ln*.4+22,py-hh*.62);c.stroke();}}
 c.restore();}
// ── Garden plants ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function mnSunflower(c,x,y,h,L,seed,o={}){const r=mpRng(seed);const {lean=0,face=null}=o;const stem=mpCol([84,130,56],L,.7);c.save();c.lineCap='round';c.strokeStyle=mpRgb(stem);c.lineWidth=h*.035;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+lean*.3,y-h*.5,x+lean,y-h*.92);c.stroke();
 for(let i=0;i<2;i++){const u=.3+i*.28;const side=i%2?1:-1;const lx=x+lean*u,ly=y-h*u;c.fillStyle=mpRgb(mpCol(MN_PAL.leafOak[1],L,.7));c.beginPath();c.moveTo(lx,ly);c.quadraticCurveTo(lx+side*h*.14,ly-h*.08,lx+side*h*.2,ly+h*.02);c.quadraticCurveTo(lx+side*h*.1,ly+h*.08,lx,ly);c.fill();}
 const fx=x+lean,fy=y-h*.92,R=h*.16;const pal=MN_PAL.sunflower.map(p=>mpCol(p,L,.8));for(let p=0;p<18;p++){const a=p/18*MP_TAU+(face?0:.1);c.fillStyle=mpRgb(p%2?pal[0]:pal[1]);c.save();c.translate(fx+Math.cos(a)*R*.85,fy+Math.sin(a)*R*.85);c.rotate(a);c.beginPath();c.ellipse(0,0,R*.42,R*.16,0,0,MP_TAU);c.fill();c.restore();}
 c.fillStyle=mpRgb(mpCol([96,62,36],L,.5));c.beginPath();c.arc(fx,fy,R*.55,0,MP_TAU);c.fill();c.fillStyle=mpRgb(mpCol([140,96,50],L,.5),.8);c.beginPath();c.arc(fx-L.sunDir*R*.12,fy-R*.12,R*.3,0,MP_TAU);c.fill();c.restore();}
export function mnTomatoPlant(c,x,y,h,L,seed){const r=mpRng(seed);const stem=mpCol([80,120,56],L,.7),leaf=mpCol(MN_PAL.leafOak[1],L,.7),leafL=mpCol(MN_PAL.leafOak[2],L,.7);c.save();c.strokeStyle=mpRgb(mpCol(MN_PAL.wood[1],L,.6));c.lineWidth=h*.03;c.beginPath();c.moveTo(x+3,y);c.lineTo(x+3,y-h*1.05);c.stroke();
 c.strokeStyle=mpRgb(stem);c.lineWidth=h*.035;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-4,y-h*.5,x+2,y-h*.95);c.stroke();
 for(let i=0;i<8;i++){const u=.15+i/8*.8;const side=i%2?1:-1;const lx=x+(side*h*.1)*(.5+r()*.5),ly=y-h*u;c.fillStyle=mpRgb(r()<.5?leaf:leafL);for(let k=0;k<3;k++){c.beginPath();c.ellipse(lx+side*k*h*.05,ly+(r()-.5)*4,h*.05,h*.03,side*.5+(r()-.5),0,MP_TAU);c.fill();}}
 const pal=MN_PAL.tomato.map(p=>mpCol(p,L,.8));for(let i=0;i<4;i++){const tx=x+(r()-.5)*h*.25,ty=y-h*(.3+r()*.5);const R=h*.05*(.7+r()*.6);c.fillStyle=mpRgb(pal[0]);c.beginPath();c.arc(tx,ty,R,0,MP_TAU);c.fill();c.fillStyle=mpRgb(mpLight(pal[1],.3),.8);c.beginPath();c.arc(tx-L.sunDir*R*.3,ty-R*.3,R*.4,0,MP_TAU);c.fill();c.fillStyle=mpRgb(stem);c.beginPath();c.arc(tx,ty-R*.9,R*.25,0,MP_TAU);c.fill();}
 c.restore();}
export function mnLettuce(c,x,y,R,L,seed){const r=mpRng(seed);const pal=MN_PAL.lettuce.map(p=>mpCol(p,L,.7));mpGroundShadow(c,x,y+R*.2,R*1.1,R*.35,L,.3,3);for(let ring=3;ring>=0;ring--){const rr=R*(.35+ring*.22);const n=5+ring*3;for(let i=0;i<n;i++){const a=i/n*MP_TAU+ring*.4;const px=x+Math.cos(a)*rr*.75,py=y-R*.25+Math.sin(a)*rr*.35;const lit=Math.cos(a)*L.sunDir>0;c.fillStyle=mpRgb(ring<2?(lit?pal[1]:mpMix(pal[0],pal[1],.5)):(lit?mpMix(pal[0],pal[1],.5):pal[0]));
  c.save();c.translate(px,py);c.rotate(a+Math.PI/2);c.beginPath();c.ellipse(0,0,rr*.5,rr*.3,0,0,MP_TAU);c.fill();c.restore();}}
 c.fillStyle=mpRgb(mpLight(pal[1],.3),.9);c.beginPath();c.ellipse(x,y-R*.35,R*.22,R*.14,0,0,MP_TAU);c.fill();}
export function mnCarrotTops(c,x,y,h,L,seed,n=3){const r=mpRng(seed);const g=mpCol([76,130,52],L,.7),gl=mpCol([130,180,80],L,.7);c.save();c.lineCap='round';for(let i=0;i<n;i++){const px=x+(i-(n-1)/2)*h*.5;for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*.26+(r()-.5)*.2;const len=h*(.6+r()*.5);c.strokeStyle=mpRgb(k%2?g:gl);c.lineWidth=1.4;c.beginPath();c.moveTo(px,y);c.quadraticCurveTo(px+Math.cos(a)*len*.5+ (r()-.5)*4,y+Math.sin(a)*len*.5,px+Math.cos(a)*len,y+Math.sin(a)*len);c.stroke();
  for(let f=1;f<=3;f++){const u=f/4;const fx=px+Math.cos(a)*len*u,fy=y+Math.sin(a)*len*u;c.beginPath();c.moveTo(fx,fy);c.lineTo(fx+Math.cos(a+.9)*len*.14,fy+Math.sin(a+.9)*len*.14);c.moveTo(fx,fy);c.lineTo(fx+Math.cos(a-.9)*len*.14,fy+Math.sin(a-.9)*len*.14);c.stroke();}}}c.restore();}
// Climbing vine over a wall or a porch: a winding stem with leaves along it.
export function mnClimber(c,pts,L,seed,o={}){const {leaf=12,n=40,pal=MN_PAL.leafOak,flowers=null}=o;const sm=mpSmooth(pts,5);const r=mpRng(seed);const cols=pal.map(p=>mpCol(p,L,.8));c.save();mpLine(c,sm,{col:mpCol([84,96,50],L,.6),width:2.2});
 for(let i=0;i<n;i++){const u=r();const idx=Math.min(sm.length-1,Math.floor(u*sm.length));const p=sm[idx];const px=p[0]+(r()-.5)*leaf*1.6,py=p[1]+(r()-.5)*leaf*1.2;const k=r();c.fillStyle=mpRgb(cols[k<.3?0:k<.7?1:2],.95);c.save();c.translate(px,py);c.rotate(r()*MP_TAU);c.beginPath();const s=leaf*(.5+r()*.5);c.moveTo(0,-s);c.bezierCurveTo(s*.9,-s*.7,s*1.1,s*.4,0,s);c.bezierCurveTo(-s*1.1,s*.4,-s*.9,-s*.7,0,-s);c.fill();c.restore();
  if(flowers&&r()<.25){c.fillStyle=mpRgb(flowers);c.beginPath();c.arc(px+(r()-.5)*6,py+(r()-.5)*6,leaf*.22,0,MP_TAU);c.fill();}}
 c.restore();}
// Geranium pot on a sill.
export function mnGeranium(c,x,y,s,L,seed){const r=mpRng(seed);const pot=mpCol([190,110,70],L,.7);c.fillStyle=mpRgb(mpLit(pot,L,.25));c.beginPath();c.moveTo(x-s*.5,y-s*.7);c.lineTo(x+s*.5,y-s*.7);c.lineTo(x+s*.4,y);c.lineTo(x-s*.4,y);c.closePath();c.fill();c.fillStyle=mpRgb(mpShade(pot,L,.3),.6);c.fillRect(x+(L.sunDir>0?s*.1:-s*.4),y-s*.7,s*.3,s*.7);
 const leaf=mpCol(MN_PAL.leafOak[1],L,.7);for(let i=0;i<7;i++){c.fillStyle=mpRgb(i%2?leaf:mpLight(leaf,.2));c.beginPath();c.ellipse(x+(r()-.5)*s*1.1,y-s*.75-r()*s*.3,s*.2,s*.14,r()*3,0,MP_TAU);c.fill();}
 for(let i=0;i<5;i++){const fx=x+(r()-.5)*s*1.1,fy=y-s*1.05-r()*s*.35;c.fillStyle=mpRgb(mpCol(MN_PAL.flowerR,L,.6));for(let p=0;p<5;p++){c.beginPath();c.arc(fx+(r()-.5)*s*.18,fy+(r()-.5)*s*.14,s*.07,0,MP_TAU);c.fill();}}}
// A haystack: a rounded dome of straw strokes, lit on the sun side, with a pole on top.
export function mnHaystack(c,x,y,w,h,L,seed){const r=mpRng(seed);const pal=MN_PAL.hay.map(p=>mpCol(p,L,.9));mpTreeShadow(c,x,y+2,w*.55,w*.5,h,L,.32,6);const pts=[];for(let i=0;i<=16;i++){const a=Math.PI+i/16*Math.PI;pts.push([x+Math.cos(a)*w*.5,y+Math.sin(a)*h*(i===0||i===16?.02:1)]);}
 const shape=mpSmooth(pts.concat([[x+w*.5,y],[x-w*.5,y]]),3,true);mpGouache(c,shape,pal[1],{seed,strokes:12,light:.1,dark:.12,sunDir:L.sunDir,L});c.save();mpPath(c,shape);c.clip();c.lineCap='round';
 const straws=[[],[],[]];for(let i=0;i<260;i++){const a=r()*MP_TAU;const d=Math.sqrt(r());const px=x+Math.cos(a)*w*.5*d,py=y-h*.1-Math.abs(Math.sin(a))*h*.9*d*(1-Math.abs(Math.cos(a))*.2);const lit=(px-x)/w*L.sunDir*2-((py-y+h)/h-.5);const k=r();const ti=lit>.2?2:lit>-.3?(k<.5?1:2):0;const ang=Math.atan2(py-(y-h*.9),px-x)+Math.PI/2+(r()-.5)*.6;const len=4+r()*9;straws[ti].push(px,py,px+Math.cos(ang)*len,py+Math.sin(ang)*len);}
 for(let ti=0;ti<3;ti++){const a=straws[ti];c.strokeStyle=mpRgb(pal[ti],.8);c.lineWidth=1.6;c.beginPath();for(let i=0;i<a.length;i+=4){c.moveTo(a[i],a[i+1]);c.lineTo(a[i+2],a[i+3]);}c.stroke();}
 const g=c.createLinearGradient(x-L.sunDir*w*.5,0,x+L.sunDir*w*.5,0);g.addColorStop(0,mpRgb(mpShade(pal[0],L,.35),.55));g.addColorStop(.55,mpRgb(pal[1],0));g.addColorStop(1,mpRgb(mpLit(pal[2],L,.3),.35));c.fillStyle=g;c.fillRect(x-w,y-h*1.2,w*2,h*1.3);c.restore();
 c.strokeStyle=mpRgb(mpCol(MN_PAL.wood[0],L,.6));c.lineWidth=3;c.beginPath();c.moveTo(x,y-h*.85);c.lineTo(x+2,y-h*1.22);c.stroke();}
// A wooden fence: posts and two rails along pts.
export function mnFence(c,pts,h,L,seed,o={}){const r=mpRng(seed);const {step=26}=o;const wood=MN_PAL.woodGrey.map(p=>mpCol(p,L,.6));const sm=mpSmooth(pts,4);let acc=0;const posts=[];for(let i=1;i<sm.length;i++){const d=Math.hypot(sm[i][0]-sm[i-1][0],sm[i][1]-sm[i-1][1]);acc+=d;if(acc>=step||i===1){acc=0;posts.push(sm[i]);}}
 c.save();c.lineCap='round';for(const rail of [.35,.7]){c.strokeStyle=mpRgb(mpLit(wood[1],L,.2));c.lineWidth=3;c.beginPath();for(let i=0;i<sm.length;i++){const p=sm[i];if(i)c.lineTo(p[0],p[1]-h*rail);else c.moveTo(p[0],p[1]-h*rail);}c.stroke();c.strokeStyle=mpRgb(mpShade(wood[0],L,.3),.5);c.lineWidth=1.2;c.beginPath();for(let i=0;i<sm.length;i++){const p=sm[i];if(i)c.lineTo(p[0],p[1]-h*rail+1.6);else c.moveTo(p[0],p[1]-h*rail+1.6);}c.stroke();}
 for(const [x,y] of posts){const tilt=(r()-.5)*3;c.strokeStyle=mpRgb(mpLit(wood[1],L,.25));c.lineWidth=5;c.beginPath();c.moveTo(x,y+2);c.lineTo(x+tilt,y-h);c.stroke();c.strokeStyle=mpRgb(mpShade(wood[0],L,.35),.7);c.lineWidth=2;c.beginPath();c.moveTo(x+(L.sunDir>0?-1.6:1.6),y+2);c.lineTo(x+tilt+(L.sunDir>0?-1.6:1.6),y-h);c.stroke();c.fillStyle=mpRgb(mpLit(wood[2],L,.3));c.beginPath();c.ellipse(x+tilt,y-h,2.6,1.3,0,0,MP_TAU);c.fill();}
 c.restore();}
