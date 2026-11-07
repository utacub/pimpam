// Fem castells (CE25), 0.15: the drawing. What stays still is trencadís (the sky, the façades, the paving of the square, the sun and
// the clouds): each surface is painted flat and then broken into glazed pieces with a joint between them, which follow its edges.
// What moves is smooth glazed ceramic: the castellers (articulated people since 0.45.7, castells-gent.js), the pinya, the bunting, the hangings on the balconies,
// the people at the windows, the flags and the confetti. The balcony railings are wrought iron. The whole screen is used: the sky above,
// the square from edge to edge, the castell up to near the top and the pinya across the bottom.
// Breaking a surface into pieces is slow (every pixel looks for its nearest piece), so it is done a little at a time between frames;
// until a surface is ready its flat colours are shown, and the pieces then appear over them in less than a second. Setting plain
// (fons senzill) keeps the flat colours.
import {Kclamp,KeaseInOut,KeaseOut,Krand,Krgb,Krgba,Kmix,Ksmooth} from './kaleido-base.js';
import {escAges,escBlit,escCanvas,escDecor,escFrame,escGroups,escScale} from './escenari.js';
import {fgDims,fgLook,fgMix,fgPerson,fgPoints} from './castells-gent.js';
import {FEM_ALETA,FEM_CLIMB,FEM_DOWN,FEM_DOWN_GAP,FEM_DOWN_LEN,FEM_FINAL_MIN,FEM_STEP_MIN,femEvent,femLeave,femRound,femAges,FEM_PRESSES,FEM_TOC} from './castells.js';

// ── Trencadís ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A zone of a flat picture: its flat colour, the colours of its pieces (the first ones more often) and the size of a piece.
const FmZ=(base,fam,size)=>({base,fam,size});
const FM_ZONES=Object.freeze({
 red:FmZ('#e2574c',['#e2574c','#ea6d5f','#c9443c','#f08a74'],22),ochre:FmZ('#f4b13d',['#f4b13d','#f7c45e','#e89a2c','#f9d27e'],22),
 green:FmZ('#38b49a',['#38b49a','#4cc6ab','#2a9a84','#7fd8c1'],22),violet:FmZ('#8c6ad1',['#8c6ad1','#a083de','#7556bb','#b9a2ea'],22),
 pink:FmZ('#ef7fa8',['#ef7fa8','#f59bbb','#e0648f','#f8b9cf'],22),blue:FmZ('#3f6fd1',['#3f6fd1','#5584e0','#2f5cbc','#8fb0f0'],22),
 cream:FmZ('#f3e3c3',['#f3e3c3','#faf0d9','#e9d4ad','#fff8e8'],26),stone:FmZ('#dccaa6',['#dccaa6','#e7d8bb','#cdb893','#f0e4cc'],24),
 window:FmZ('#2b2a4a',['#2b2a4a','#38375c','#232240'],12),arch:FmZ('#5a3d52',['#5a3d52','#6b4a62','#4a3244'],16),
 roof:FmZ('#c8553d',['#c8553d','#d96a4f','#b4462f','#e0805f'],16),floor:FmZ('#c9b597',['#c9b597','#d6c4a6','#bba483','#e2d3b6'],30),
 sea:FmZ('#2a8fb5',['#2a8fb5','#3aa3c6','#1f7ea3','#7fd0e6'],20),far:FmZ('#7b86c9',['#7b86c9','#8f99d4','#6a74b8','#a9b1e2'],30),
 near:FmZ('#4aa36a',['#4aa36a','#5bb67b','#3b8c59','#86cf98'],26),leaf:FmZ('#2f8f4e',['#2f8f4e','#3fa35e','#25793f'],13),
 trunk:FmZ('#9a6b45',['#9a6b45','#ad7c53','#875c3a'],12),white:FmZ('#f7f5ee',['#f7f5ee','#ffffff','#e9e6dc'],18)
});
const FM_FACADE_ZONES=Object.values(FM_ZONES);
// The sky of each time of day, in three wavy bands from the top.
const FM_SKIES=Object.freeze([
 [FmZ('#2a72cf',['#2a72cf','#3580d8','#2163bb','#4a92e2'],36),FmZ('#3f8ee0',['#3f8ee0','#4d9ae6','#3280d4','#e9f2fb'],34),FmZ('#7fbdf0',['#7fbdf0','#92c9f3','#6cb0ea','#ffffff'],30)],
 [FmZ('#3b86d6',['#3b86d6','#4893dd','#2f78c8','#5ca2e4'],36),FmZ('#73afe8',['#73afe8','#84bbec','#64a2df','#f3efe0'],34),FmZ('#f3dfb8',['#f3dfb8','#f8e8c8','#ecd2a2','#fff4dc'],30)],
 [FmZ('#5a5fb8',['#5a5fb8','#6a6fc4','#4b50a8','#7d7fcf'],36),FmZ('#e9788a',['#e9788a','#f08c9b','#de6479','#f6a9b4'],34),FmZ('#f6a35f',['#f6a35f','#f8b574','#f0904b','#fbd08e'],30)]
]);
const FM_SUNS=Object.freeze([FmZ('#f6c431',['#f6c431','#f8d35a','#f0a91f','#fbe08a'],15),FmZ('#f7b733',['#f7b733','#f9c95a','#ee9f22','#fcd98a'],15),FmZ('#f26a3a',['#f26a3a','#f5824f','#e65428','#f9a06a'],15)]);
const FM_CLOUDS=Object.freeze([FmZ('#fbf7ee',['#fbf7ee','#f1ecdf','#ffffff','#e6eef7'],20),FmZ('#fbf3e6',['#fbf3e6','#f5e8d3','#ffffff','#efe3d0'],20),FmZ('#f8d9cf',['#f8d9cf','#fbe6dc','#f2c6b9','#ffffff'],20)]);
const FmHash=(x,y)=>{const v=Math.sin(x*12.9898+y*78.233)*43758.5453;return v-Math.floor(v);};
// A mosaic in the making: the zone of each pixel, then the pieces, then the pixels, a band of rows at a time.
function FmJob(src,W,H,zones,k,seed){return {src,W,H,zones,k,seed,phase:0,y:0};}
function FmStep(j,budget){const t0=performance.now(),{W,H}=j,over=()=>performance.now()-t0>budget;
 if(j.phase===0){if(!j.label){j.label=new Uint8Array(W*H);j.pal=j.zones.map(z=>Krgb(z.base));}const s=j.src,pal=j.pal,L=j.label,Z=pal.length;
  while(j.y<H){for(let x=0,i=j.y*W;x<W;x++,i++){const o=4*i;if(s[o+3]<128){L[i]=255;continue;}const R=s[o],G=s[o+1],B=s[o+2];let best=0,bd=1e9;for(let z=0;z<Z;z++){const p=pal[z],d=(R-p[0])*(R-p[0])+(G-p[1])*(G-p[1])+(B-p[2])*(B-p[2]);if(d<bd){bd=d;best=z;}}L[i]=best;}
   j.y++;if((j.y&7)===0&&over())return false;}
  j.phase=1;j.y=0;j.src=null;}
 if(j.phase===1){let a=(j.seed*2654435761)>>>0||1;const r=()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296;};
  const cell=Math.max(8,Math.round(20*j.k)),gw=Math.ceil(W/cell),gh=Math.ceil(H/cell),grid=Array.from({length:gw*gh},()=>[]),seeds=[];
  for(let z=0;z<j.zones.length;z++){const s=j.zones[z].size*j.k,fam=j.zones[z].fam.map(Krgb);
   for(let y=s/2,row=0;y<H;y+=s,row++)for(let x=(row%2)*s/2;x<W;x+=s){const px=Math.round(x+(r()-.5)*s*.8),py=Math.round(y+(r()-.5)*s*.8);if(px<0||py<0||px>=W||py>=H||j.label[py*W+px]!==z){r();r();continue;}
    const col=fam[Math.floor(Math.pow(r(),1.6)*fam.length)],an=r()*Math.PI*2;seeds.push({x:px,y:py,z,col,gx:Math.cos(an),gy:Math.sin(an),g:.06+r()*.1,s});grid[Math.floor(py/cell)*gw+Math.floor(px/cell)].push(seeds.length-1);}}
  Object.assign(j,{seeds,grid,cell,gw,gh,phase:2,out:new Uint8ClampedArray(W*H*4)});if(over())return false;}
 if(j.phase===2){const {label:L,seeds,grid,cell,gw,gh,out:o,pal,k}=j,e=Math.max(1,Math.round(k)),gr=[128,121,114];
  while(j.y<H){const y=j.y,by=Math.floor(y/cell);
   for(let x=0;x<W;x++){const i=y*W+x,z=L[i],q=4*i;if(z===255){o[q+3]=0;continue;}const bx=Math.floor(x/cell);let d1=1e18,d2=1e18,best=-1;
    for(let yy=by-2;yy<=by+2;yy++){if(yy<0||yy>=gh)continue;for(let xx=bx-2;xx<=bx+2;xx++){if(xx<0||xx>=gw)continue;const list=grid[yy*gw+xx];for(let n=0;n<list.length;n++){const sd=seeds[list[n]];if(sd.z!==z)continue;const dx=sd.x-x,dy=sd.y-y,d=dx*dx+dy*dy;if(d<d1){d2=d1;d1=d;best=list[n];}else if(d<d2)d2=d;}}}
    const edge=(x+e<W&&L[i+e]!==z)||(y+e<H&&L[i+e*W]!==z)||(x>=e&&L[i-e]!==z)||(y>=e&&L[i-e*W]!==z);let R,G,B;
    if(best<0){[R,G,B]=pal[z];}
    else{const sd=seeds[best],gap=Math.sqrt(d2)-Math.sqrt(d1);
     if(edge||gap<Math.max(1.3*k,sd.s*.075)){const n=FmHash(x,y)*14-7;R=gr[0]+n;G=gr[1]+n;B=gr[2]+n;}
     else{const u=((x-sd.x)*sd.gx+(y-sd.y)*sd.gy)/sd.s,lit=1+sd.g*u*2+(gap<Math.max(2.6*k,sd.s*.13)?-.1:0),spec=sd.s<16*k?0:Math.max(0,1-Math.hypot(x-sd.x+sd.s*.2,y-sd.y+sd.s*.22)/(sd.s*.16))*.22,n=(FmHash(x+7,y)-.5)*8;
      R=sd.col[0]*lit+255*spec+n;G=sd.col[1]*lit+255*spec+n;B=sd.col[2]*lit+255*spec+n;}}
    o[q]=R;o[q+1]=G;o[q+2]=B;o[q+3]=255;}
   j.y++;if((j.y&3)===0&&over())return false;}
  j.phase=3;}
 return true;}
// The layers: a flat picture at once, and its mosaic when it is ready. They are made at the resolution of the screen; a layer unused
// for about ten seconds is freed.
const FM_LAYERS=new Map(),FM_QUEUE=[];let FM_FRAME=0,FM_PUMPING=false,FM_DONE=0,FM_FADE_UNTIL=0;
const FmNow=()=>typeof performance!=='undefined'?performance.now()/1000:0;
function FmPump(){FM_PUMPING=false;const L=FM_QUEUE[0];if(!L){FmCards();return;}if(!L.job){FM_QUEUE.shift();FmSchedule();FmCards();return;}
 if(FmStep(L.job,10)){const j=L.job,cv=escCanvas(j.W,j.H),x=cv?.getContext?.('2d');if(x&&typeof ImageData!=='undefined'){x.putImageData(new ImageData(j.out,j.W,j.H),0,0);L.mosaic=cv;L.readyAt=FmNow();FM_FADE_UNTIL=L.readyAt+.9;FM_DONE++;}L.job=null;FM_QUEUE.shift();}
 FmSchedule();FmCards();}
function FmSchedule(){if(FM_PUMPING||!FM_QUEUE.length||typeof setTimeout==='undefined')return;FM_PUMPING=true;setTimeout(FmPump,0);}
function FmEvict(){if(FM_FRAME%120)return;for(const [key,L] of FM_LAYERS)if(FM_FRAME-L.used>600){const i=FM_QUEUE.indexOf(L);if(i>=0)FM_QUEUE.splice(i,1);for(const cv of [L.flat,L.mosaic])if(cv)cv.width=cv.height=1;FM_LAYERS.delete(key);}}
// A layer of W×H reference units drawn by draw(c) (in those units) at k device pixels per unit. plain: the flat picture only.
function FmLayer(key,W,H,k,draw,zones,seed,plain){const PW=Math.max(1,Math.round(W*k)),PH=Math.max(1,Math.round(H*k)),id=`${key}|${PW}x${PH}|${plain?1:0}`;let L=FM_LAYERS.get(id);
 if(!L){const flat=escCanvas(PW,PH),fc=flat?.getContext?.('2d');if(!fc||!fc.setTransform)return null;fc.setTransform(PW/W,0,0,PH/H,0,0);draw(fc);L={flat,mosaic:null,readyAt:0,used:0,job:null};
  if(!plain&&fc.getImageData){L.job=FmJob(fc.getImageData(0,0,PW,PH).data,PW,PH,zones,k,seed);
   // A small layer (a card, the sun, a cloud) is made at once.
   if(PW*PH<=90000){FmStep(L.job,1e9);const x=escCanvas(PW,PH)?.getContext?.('2d');if(x){x.putImageData(new ImageData(L.job.out,PW,PH),0,0);L.mosaic=x.canvas;L.readyAt=-1e3;}L.job=null;}
   else{FM_QUEUE.push(L);FmSchedule();}}
  FM_LAYERS.set(id,L);}
 L.used=FM_FRAME;return L;}
// The cards of the home page are drawn only once, with flat colours if their mosaics are not ready: they are drawn again, on the same
// canvas and with the same transform, once all the mosaics are made (FM_CARD: a card is being drawn; its mosaics show without a fade).
const FM_CARDS=new Map();let FM_CARD=false;
function FmCards(){if(FM_QUEUE.length||!FM_CARDS.size)return;const cards=[...FM_CARDS.values()];FM_CARDS.clear();
 for(const [c,w,h,o,m] of cards){c.save();c.setTransform(m);c.globalAlpha=1;c.globalCompositeOperation='source-over';drawCastells(c,w,h,o);c.restore();}}
// Draws a layer at (x, y) with size W×H; until the mosaic is ready, its flat picture; then the mosaic comes in over it.
function FmPut(c,L,x,y,W,H,alpha=1){if(!L||alpha<=0)return;const f=L.mosaic?FM_CARD?1:Kclamp((FmNow()-L.readyAt)/.8):0;c.save();c.globalAlpha*=alpha;if(f<1&&L.flat)c.drawImage(L.flat,x,y,W,H);if(L.mosaic){c.globalAlpha*=f<1?KeaseOut(f):1;c.drawImage(L.mosaic,x,y,W,H);}c.restore();
 if(L.mosaic&&f>=1&&L.flat){L.flat.width=L.flat.height=1;L.flat=null;}}
// What the still picture of a waiting scene depends on, besides the state of the game: the mosaics made so far, and the fade of the
// latest (cause-art.js keeps the still picture until this changes).
// Whether some mosaic is still being made (the review tools wait for it).
export const fmBusy=()=>FM_QUEUE.length>0;
export const fmStamp=()=>{const now=FmNow();return `${FM_DONE}|${now<FM_FADE_UNTIL?Math.floor(now*30):0}`;};

// ── The places ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// Reference units: the screen is 720 high and W wide. The square's floor starts at y 600.
const FM_FLOOR=600;
const FmRng=seed=>{let a=(seed*2654435761)>>>0||1;return ()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296;};};
// The buildings of a place, its balconies (where hangings and people can appear) and its flagpoles.
const FM_GEO=new Map();
function FmGeo(place,W){const id=`${place}|${Math.round(W)}`;if(FM_GEO.has(id))return FM_GEO.get(id);const r=FmRng(place*131+17),cx=W/2,B=[],cols=['red','ochre','green','violet','pink','blue'];let ci=place*2;
 const house=(x,w,top,o={})=>{const b={x,w,top,col:o.col||cols[(ci++)%cols.length],floors:o.floors||Math.max(2,Math.min(4,Math.round((FM_FLOOR-top-40)/88))),arcade:!!o.arcade,roof:!!o.roof,wavy:o.wavy??!o.roof,door:o.door??(r()<.5?.22:.78),...o};B.push(b);return b;};
 const flags=[];let gap=200,low=[230,320],sea=false,mountains=false;
 if(place===0){const b=house(cx-190-330,330,245,{col:'cream',floors:3,arcade:true,wavy:false,flat:true,door:.5});flags.push({x:b.x+b.w/2,y:b.top-14,h:78});gap=190;}
 if(place===1){house(cx-500,290,300,{col:'stone',floors:2,wavy:false,church:true,door:.5});house(cx-590,92,78,{col:'stone',floors:5,tower:true,wavy:false,door:-1});flags.push({x:cx-544,y:8,h:60});gap=210;low=[250,330];}
 if(place===2){sea=true;gap=180;}
 if(place===3){mountains=true;low=[330,400];gap=190;}
 const arcade=place===0;
 // Left of the centre (after the church, if any) and right of it, out to the edges.
 let x=place===1?cx-596:place===0?cx-190-334:cx-gap;while(x>-20){const w=140+r()*70,top=low[0]+r()*(low[1]-low[0]);house(x-w,w,top,{arcade,roof:place===3});x-=w+4;}
 if(!sea){x=cx+gap;while(x<W+20){const w=140+r()*70,top=low[0]+r()*(low[1]-low[0]);house(x,w,top,{arcade,roof:place===3});x+=w+4;}}
 for(const b of B)if(!b.tower&&!b.church&&r()<.4&&flags.length<4)flags.push({x:b.x+b.w*(.3+r()*.4),y:b.top+(b.wavy?-6:0),h:56});
 if(sea)for(const fx of [cx+300,cx+430,cx+560])if(fx<W-30)flags.push({x:fx,y:FM_FLOOR-4,h:150,pole:true});
 // Windows: arched, a few columns a floor; on the first floor up, balconies with railings.
 const windows=[],balconies=[];
 for(const b of B){if(b.tower){windows.push({x:b.x+b.w/2-14,y:b.top+40,w:28,h:44,bell:true});continue;}
  if(b.church){windows.push({x:b.x+b.w/2-34,y:b.top+40,w:68,h:68,rose:true});continue;}
  const n=Math.max(2,Math.round(b.w/72)),fh=(FM_FLOOR-b.top-(b.arcade?96:70))/b.floors;
  for(let f=0;f<b.floors;f++)for(let i=0;i<n;i++){const wx=b.x+b.w*(i+.5)/n,wy=b.top+34+f*fh,ww=Math.min(30,b.w/n*.48),wh=fh*.62,balcony=f===b.floors-1||f===b.floors-2&&r()<.35;
   const win={x:wx-ww/2,y:wy,w:ww,h:wh,balcony};windows.push(win);if(balcony)balconies.push({x:wx,y:wy+wh*.62,w:ww*1.8,noble:f===b.floors-1,bx:b.x,bw:b.w});}}
 // The castell stands in front of the centre: no balcony behind it hangs anything.
 const free=balconies.filter(p=>Math.abs(p.x-cx)>130);
 const geo={place,W,B,flags,windows,balconies:free,sea,mountains};FM_GEO.set(id,geo);return geo;}
// A flat picture of the place, with the colours of FM_ZONES only (the sky is left empty).
function FmFlatPlace(c,geo){const {W,B}=geo,Z=FM_ZONES,cx=W/2;
 if(geo.mountains){c.fillStyle=Z.far.base;c.beginPath();c.moveTo(0,FM_FLOOR);for(let x=0;x<=W;x+=20)c.lineTo(x,300+Math.sin(x*.0065+1)*46+Math.sin(x*.019)*16);c.lineTo(W,FM_FLOOR);c.closePath();c.fill();
  c.fillStyle=Z.near.base;c.beginPath();c.moveTo(0,FM_FLOOR);for(let x=0;x<=W;x+=20)c.lineTo(x,388+Math.sin(x*.009+2.4)*30+Math.sin(x*.023)*10);c.lineTo(W,FM_FLOOR);c.closePath();c.fill();}
 if(geo.place===0){c.fillStyle=Z.far.base;c.beginPath();c.moveTo(0,FM_FLOOR);let x=0,i=0;while(x<W){const w=60+((i*37)%5)*14,top=470+((i*53)%4)*16;c.lineTo(x,top+18);c.lineTo(x+w/2,top);c.lineTo(x+w,top+18);x+=w;i++;}c.lineTo(W,FM_FLOOR);c.closePath();c.fill();}
 if(geo.place===1){c.fillStyle=Z.near.base;c.beginPath();c.moveTo(0,FM_FLOOR);for(let x=0;x<=W;x+=20)c.lineTo(x,470+Math.sin(x*.008+.6)*22+Math.sin(x*.021)*8);c.lineTo(W,FM_FLOOR);c.closePath();c.fill();}
 if(geo.sea){c.fillStyle=Z.sea.base;c.fillRect(0,470,W,FM_FLOOR-470);c.fillStyle=Z.white.base;for(const [sx,sh] of [[cx+380,40],[cx+560,30],[cx+250,24]]){if(sx>W-20)continue;c.beginPath();c.moveTo(sx,452-sh);c.lineTo(sx,462);c.lineTo(sx+sh*.7,462);c.closePath();c.fill();}
  // palm trees on the promenade
  for(const px of [cx+200,cx+470,cx+700]){if(px>W+40)continue;c.fillStyle=Z.trunk.base;c.beginPath();c.moveTo(px-8,FM_FLOOR);c.quadraticCurveTo(px-4,420,px+16,300);c.lineTo(px+28,302);c.quadraticCurveTo(px+10,420,px+8,FM_FLOOR);c.closePath();c.fill();
   c.fillStyle=Z.leaf.base;for(let i=0;i<7;i++){const a=-Math.PI*.95+i*Math.PI*.9/6;c.beginPath();c.moveTo(px+22,300);c.quadraticCurveTo(px+22+Math.cos(a)*60,300+Math.sin(a)*40-20,px+22+Math.cos(a)*110,300+Math.sin(a)*60+30);c.quadraticCurveTo(px+22+Math.cos(a)*55,300+Math.sin(a)*30,px+22,306);c.fill();}}}
 for(const b of B){c.fillStyle=Z[b.col].base;c.beginPath();c.moveTo(b.x,FM_FLOOR);c.lineTo(b.x,b.top+(b.wavy?20:0));
  if(b.wavy)for(let k=0;k<=8;k++){const t=k/8;c.lineTo(b.x+b.w*t,b.top+20-Math.sin(t*Math.PI)*24-Math.sin(t*Math.PI*3)*6);}else c.lineTo(b.x+b.w,b.top);
  c.lineTo(b.x+b.w,FM_FLOOR);c.closePath();c.fill();
  if(b.roof||b.tower||b.church){c.fillStyle=Z.roof.base;c.beginPath();if(b.tower){c.moveTo(b.x-6,b.top+2);c.lineTo(b.x+b.w/2,b.top-70);c.lineTo(b.x+b.w+6,b.top+2);}else{c.moveTo(b.x-8,b.top+2);c.lineTo(b.x+b.w/2,b.top-(b.church?56:30));c.lineTo(b.x+b.w+8,b.top+2);}c.closePath();c.fill();}
  if(b.flat){c.fillStyle=Z.ochre.base;c.fillRect(b.x-6,b.top-14,b.w+12,16);}
  if(b.arcade){c.fillStyle=Z.arch.base;const n=Math.max(2,Math.round(b.w/62));for(let i=0;i<n;i++){const ax=b.x+b.w*(i+.5)/n,aw=b.w/n*.7;c.beginPath();c.moveTo(ax-aw/2,FM_FLOOR);c.lineTo(ax-aw/2,FM_FLOOR-62);c.arc(ax,FM_FLOOR-62,aw/2,Math.PI,0);c.lineTo(ax+aw/2,FM_FLOOR);c.closePath();c.fill();}}
  else if(b.door>=0){c.fillStyle=Z.window.base;const dx=b.x+b.w*b.door,dw=b.church?54:30,dh=b.church?92:58;c.beginPath();c.moveTo(dx-dw/2,FM_FLOOR);c.lineTo(dx-dw/2,FM_FLOOR-dh+dw/2);c.arc(dx,FM_FLOOR-dh+dw/2,dw/2,Math.PI,0);c.lineTo(dx+dw/2,FM_FLOOR);c.closePath();c.fill();}}
 c.fillStyle=FM_ZONES.window.base;for(const w of geo.windows){if(w.rose){c.beginPath();c.arc(w.x+w.w/2,w.y+w.h/2,w.w/2,0,Math.PI*2);c.fill();continue;}c.beginPath();c.moveTo(w.x,w.y+w.h);c.lineTo(w.x,w.y+w.w/2);c.arc(w.x+w.w/2,w.y+w.w/2,w.w/2,Math.PI,0);c.lineTo(w.x+w.w,w.y+w.h);c.closePath();c.fill();}
 c.fillStyle=Z.floor.base;c.fillRect(0,FM_FLOOR,W,720-FM_FLOOR);}
// The sky as the castell sees it (0.16.1): smooth, from the colour at the top to the colour at the horizon, with no mosaic, so that
// the castellers stand out against it.
function FmSmoothSky(c,W,time){const S=FM_SKIES[time],g=c.createLinearGradient(0,0,0,FM_FLOOR);g.addColorStop(0,S[0].base);g.addColorStop(.5,S[1].base);g.addColorStop(1,S[2].base);c.fillStyle=g;c.fillRect(0,0,W,FM_FLOOR+2);}
// Wrought-iron railings, drawn over the mosaic.
function FmIron(c,geo){c.lineCap='round';for(const p of geo.balconies.concat(geo.hidden||[])){const x0=p.x-p.w/2,x1=p.x+p.w/2,y=p.y;
  c.fillStyle='#e9dcc2';c.fillRect(x0-3,y+18,p.w+6,4);c.strokeStyle='#2c2733';c.lineWidth=1.6;for(let k=0;k<=7;k++){const xx=x0+k*p.w/7;c.beginPath();c.moveTo(xx,y);c.lineTo(xx,y+18);c.stroke();}
  c.lineWidth=2.4;c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.stroke();c.lineWidth=1.2;for(let k=0;k<3;k++){const xx=x0+(k+.5)*p.w/3;c.beginPath();c.arc(xx,y+9,4,0,Math.PI*2);c.stroke();}
  c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=.8;c.beginPath();c.moveTo(x0,y-1);c.lineTo(x1,y-1);c.stroke();}
 for(const f of geo.flags){c.strokeStyle='#3a3440';c.lineWidth=f.pole?3:2.4;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.x,f.y-f.h);c.stroke();c.fillStyle='#f2c14e';c.beginPath();c.arc(f.x,f.y-f.h-3,3.4,0,Math.PI*2);c.fill();}}

// ── Ceramic ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A smooth glazed shape lit from the upper left: its colour, a soft light and a darker edge, and a gloss streak.
// The dark contour of the figures (0.16.1), in reference pixels; 0 while the square is drawn. It keeps the castellers apart from the
// façades, the paving and the sky whatever the colour of the colla.
let FM_INK=0;const FM_INK_COL='#1b1424';
function FmInk(c){if(!FM_INK)return;c.lineJoin='round';c.strokeStyle=FM_INK_COL;c.lineWidth=FM_INK;c.stroke();}
function FmGlaze(c,path,color,bbox,light=.36,edge=.34){c.save();path();c.fillStyle=color;c.fill();c.clip();const [x,y,w,h]=bbox;
 const g=c.createLinearGradient(x,y,x+w*.9,y+h);g.addColorStop(0,`rgba(255,252,240,${light})`);g.addColorStop(.45,'rgba(255,252,240,0)');g.addColorStop(1,`rgba(40,20,30,${edge})`);c.fillStyle=g;c.fillRect(x-2,y-2,w+4,h+4);
 if(w>6){c.globalCompositeOperation='screen';const s=c.createLinearGradient(x,y,x+w*.5,y+h*.3);s.addColorStop(.45,'rgba(255,255,255,0)');s.addColorStop(.55,'rgba(255,255,255,.4)');s.addColorStop(.63,'rgba(255,255,255,0)');c.fillStyle=s;c.fillRect(x,y,w,h);}
 c.restore();if(FM_INK){path();FmInk(c);}}
function FmRR(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function FmRod(c,x0,y0,x1,y1,w,color){const a=Math.atan2(y1-y0,x1-x0),l=Math.hypot(x1-x0,y1-y0);c.save();c.translate(x0,y0);c.rotate(a);FmGlaze(c,()=>FmRR(c,-w/2,-w/2,l+w,w,w/2),color,[-w/2,-w/2,l+w,w],.3,.36);c.restore();}
function FmBall(c,x,y,r,color='#f0c79a'){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();const g=c.createRadialGradient(x-r*.38,y-r*.42,r*.05,x,y,r*1.05);
 g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.25,'rgba(255,245,225,.2)');g.addColorStop(.75,'rgba(90,50,20,0)');g.addColorStop(1,'rgba(70,35,10,.45)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();FmInk(c);}
// A figure drawn once into a small picture (at the screen's resolution) and then copied: the pinya at rest, the castellers in place.
const FM_SPRITES=new Map();
function FmSprite(c,key,x,y,bx,by,bw,bh,k,draw){let s=FM_SPRITES.get(key);
 if(!s){const PW=Math.max(1,Math.ceil(bw*k)),PH=Math.max(1,Math.ceil(bh*k)),cv=escCanvas(PW,PH),sc=cv?.getContext?.('2d');if(!sc||!sc.setTransform){draw(c,x,y);return;}sc.setTransform(k,0,0,k,-bx*k,-by*k);draw(sc,0,0);s={cv,used:0};FM_SPRITES.set(key,s);
  if(FM_SPRITES.size>400){for(const [kk,ss] of FM_SPRITES)if(FM_FRAME-ss.used>300){ss.cv.width=ss.cv.height=1;FM_SPRITES.delete(kk);}}}
 s.used=FM_FRAME;c.drawImage(s.cv,x+bx,y+by,bw,bh);}
// A person drawn at its place, or copied from its picture once it stays still.
// At most a few new pictures are made in one frame (the pinya changes all of them at once when the hands go up); the rest are drawn
// directly until their turn comes.
let FM_NEW_AT=-1,FM_NEW=0;
function FmFigure(c,k,key,pose,look,box){if(key&&!FM_SPRITES.has(key)){if(FM_NEW_AT!==FM_FRAME){FM_NEW_AT=FM_FRAME;FM_NEW=0;}if(++FM_NEW>6)key=null;}
 if(!key){fgPerson(c,pose,look);return;}const [X,Y]=pose.pelvis;
 FmSprite(c,key,X,Y,box[0],box[1],box[2],box[3],k,(sc,x0,y0)=>{sc.save();sc.translate(x0-X,y0-Y);fgPerson(sc,pose,look);sc.restore();});}

// ── The castell (0.45.7) ─────────────────────────────────────────────────────────────────────────────────────────────────
// A castell de set: four levels of the trunk (baixos, segons, terços and quarts) of two, three or four people, then the pom de dalt:
// the two dosos, the aixecador squatting with one foot on each of them, and the enxaneta astride the aixecador (Castell, 2026). Each
// level stands on the shoulders of the one below. Those of a level hold one another by the shoulders and face the inside of the
// castell, so the viewer sees the backs of those at the front, with their faixes, and the faces of those at the back (a criterion
// drawn from photographs, not from a written source). Everyone climbs up the back of the castellers below, with a foot on their faixa
// and then on their shoulders, as the faixa is the foothold and handhold for climbing (Castell, 2026; UNESCO, 2010); they come down
// the same way, from the top, after the enxaneta, who climbs down the other side.
const FM_BASE=694,FM_H0=146,FM_SIZES=[1,.96,.92,.88];
// The ring of each level: the angle of each casteller around it (depth = its sine: 1 at the front, −1 at the back) and its radius.
const FM_RING={2:{th:[Math.PI*2/3,-Math.PI/3],R:.42},3:{th:[Math.PI/2,Math.PI*7/6,-Math.PI/6],R:.28},4:{th:[1.18,1.18+Math.PI/2,1.18+Math.PI,1.18+Math.PI*1.5],R:.3}};
const FmShoulders=q=>[(q.S[0][0]+q.S[1][0])/2,Math.min(q.S[0][1],q.S[1][1])];
// Everyone in place, the castell complete: poses, looks and the holds of the climb. Made once per round and screen width.
const FM_COLLAS=new Map();
function FmColla(round,cx){const id=`${round.v}|${round.per}|${round.shirt}|${cx.toFixed(1)}`;if(FM_COLLAS.has(id))return FM_COLLAS.get(id);
 const per=round.per,ring=FM_RING[per],levels=[];let seed=round.v*97+11;
 const look=(o,depth)=>fgLook(seed++,{...o,shirt:depth<-.2?Kmix(round.shirt,'#2a2030',.18):round.shirt});
 for(let L=0;L<4;L++){const H=FM_H0*FM_SIZES[L],list=[];
  ring.th.forEach((th,j)=>{const depth=Math.sin(th);list.push({L,j,H,depth,x:cx+Math.cos(th)*ring.R*H,kid:false,facing:depth>=0?-1:1,turn:.55+.45*Math.abs(depth),look:look({broad:L===0?1.14:L===1?1.06:.98},depth)});});
  levels.push(list);}
 // From the bottom: the baixos on the ground, each one above on the shoulders of the one below.
 levels.forEach((list,L)=>list.forEach(f=>{const D=fgDims(f.H,false,f.look.broad);
  if(L===0){const y=FM_BASE-f.depth*f.H*.04;f.feet=[[f.x-.075*f.H,y],[f.x+.075*f.H,y]];f.pelvis=[f.x,y-D.stand*.985];}
  else{const b=levels[L-1][f.j],q=fgPoints(b.pose),y=Math.min(q.S[0][1],q.S[1][1])-.035*b.H;f.feet=[[q.S[0][0],y],[q.S[1][0],y]];f.x=(q.S[0][0]+q.S[1][0])/2;f.pelvis=[f.x,y-D.stand*.94];}
  f.pose={H:f.H,kid:false,broad:f.look.broad,pelvis:f.pelvis,feet:f.feet,turn:f.turn,facing:f.facing};}));
 // Holding the neighbours by the shoulders (in a torre of two, each holds the other).
 levels.forEach(list=>{const n=list.length,pts=list.map(f=>fgPoints(f.pose));list.forEach((f,j)=>{
  if(n===2){const q=pts[1-j];f.pose.hands=[[q.S[0][0],q.S[0][1]+.01*f.H],[q.S[1][0],q.S[1][1]+.01*f.H]];return;}
  const nb=[(j+n-1)%n,(j+1)%n].sort((a,b)=>list[a].x-list[b].x),near=i=>{const S=pts[i].S;return Math.abs(S[0][0]-f.x)<Math.abs(S[1][0]-f.x)?S[0]:S[1];};
  f.pose.hands=nb.map(i=>{const h=near(i);return [h[0],h[1]+.006*f.H];});});});
 // The pom de dalt: the dosos on the quarts, the aixecador squatting on the dosos, the enxaneta astride the aixecador.
 const Q=levels[3].flatMap(f=>fgPoints(f.pose).S.map(s=>({s,f}))),Hd=FM_H0*.62,Ha=FM_H0*.56,He=FM_H0*.5;
 const dosos=[-1,1].map((sd,k)=>{const x0=cx+sd*.085*FM_H0,near=[...Q].sort((a,b)=>Math.abs(a.s[0]-x0)-Math.abs(b.s[0]-x0)).slice(0,2),y=Math.min(near[0].s[1],near[1].s[1])-.035*FM_H0*.88;
  let fx=near.map(n=>n.s[0]).sort((a,b)=>a-b);if(fx[1]-fx[0]<.15*Hd){const m=(fx[0]+fx[1])/2;fx=[m-.075*Hd,m+.075*Hd];}
  const x=(fx[0]+fx[1])/2,lk=fgLook(seed++,{kid:true,helmet:true,shirt:round.shirt,noMoc:false});
  return {L:4,j:k,H:Hd,depth:.3,x,kid:true,facing:-1,turn:.8,look:lk,base:near[0].f,pose:{H:Hd,kid:true,broad:lk.broad,pelvis:[x,y-fgDims(Hd,true).stand*.95],feet:[[fx[0],y],[fx[1],y]],turn:.8,facing:-1}};});
 const dq=dosos.map(d=>fgPoints(d.pose));
 dosos.forEach((d,k)=>{const o=dq[1-k],head=fgPoints(d.base.pose).head,inner=k?o.S[1]:o.S[0];d.pose.hands=k?[[inner[0],inner[1]+.01*Hd],[head[0]+.04*Hd,head[1]]]:[[head[0]-.04*Hd,head[1]],[inner[0],inner[1]+.01*Hd]];});
 const ay=Math.min(dq[0].S[1][1],dq[1].S[0][1])-.03*Hd,afeet=[[dq[0].S[1][0]-.01*Hd,ay],[dq[1].S[0][0]+.01*Hd,ay]],ax=(afeet[0][0]+afeet[1][0])/2,alook=fgLook(seed++,{kid:true,helmet:true,shirt:round.shirt});
 const aix={L:5,j:0,H:Ha,depth:.32,x:ax,kid:true,facing:-1,turn:.92,look:alook,pose:{H:Ha,kid:true,broad:alook.broad,pelvis:[ax,ay-.2*Ha],feet:afeet,turn:.92,facing:-1,torsoK:.62,hands:[[dq[0].head[0],dq[0].head[1]-.02*Hd],[dq[1].head[0],dq[1].head[1]-.02*Hd]],elbowUp:true}};
 const aq=fgPoints(aix.pose),ey=Math.min(dq[0].S[0][1],dq[1].S[1][1])-.03*Hd,efeet=[[dq[0].S[0][0],ey],[dq[1].S[1][0],ey]],ex=(efeet[0][0]+efeet[1][0])/2,elook=fgLook(seed++,{kid:true,helmet:true,shirt:round.shirt});
 const enx={L:6,j:0,H:He,depth:.34,x:ex,kid:true,facing:-1,turn:.95,look:elook,pose:{H:He,kid:true,broad:elook.broad,pelvis:[ex,ey-.44*He],feet:efeet,turn:.95,facing:-1,hands:[[aq.head[0]-.05*He,aq.head[1]-.02*He],[aq.head[0]+.05*He,aq.head[1]-.02*He]],elbowUp:true}};
 enx.aleta={...enx.pose,hands:[enx.pose.hands[0],[ex+.16*He,enx.pose.pelvis[1]-.86*He]],open:2};
 levels.push(dosos,[aix],[enx]);
 // The holds of each climb: from inside the pinya, up the back of the column below (its faixa, then its shoulders), to its place.
 const front=levels[0].reduce((a,b)=>b.depth>a.depth?b:a),back=levels[0].reduce((a,b)=>b.depth<a.depth?b:a);
 const holds=(col,L,extra)=>{const r=[[col.x,FM_BASE+.6*FM_H0],[col.x,FM_BASE-.12*FM_H0]];for(let l=0;l<Math.min(L,4);l++){const f=levels[l][col.j],q=fgPoints(f.pose);r.push([q.waist[0],q.waist[1]],FmShoulders(q));}
  for(const e of extra||[]){const q=fgPoints(e.pose);r.push([q.waist[0],q.waist[1]],FmShoulders(q));}return r;};
 levels.forEach((list,L)=>list.forEach(f=>{let col=levels[0][f.j],extra=null;
  if(L===4){col=levels[0][f.base.j];}else if(L>=5){col=front;extra=[dosos[0]];}
  if(L===6)extra=[dosos[1]];
  f.col=col;f.holds=holds(col,Math.min(L,4),extra);const q=fgPoints(f.pose);f.holds.push([q.head[0],q.head[1]-.1*f.H]);
  // where the hands grip at the top: the head of the one below (or of the aixecador)
  const top=L===0?null:L<4?levels[L-1][f.j]:L===4?f.base:L===5?dosos[0]:aix;if(top){const tq=fgPoints(top.pose);f.holds[f.holds.length-1]=[tq.head[0],tq.head[1]-.02*top.H];}}));
 enx.down=holds(back,4,[dosos[1]]);enx.down.push([dq[1].head[0],dq[1].head[1]]);enx.backCol=back;
 const out={levels,front,back};if(FM_COLLAS.size>12)FM_COLLAS.delete(FM_COLLAS.keys().next().value);FM_COLLAS.set(id,out);return out;}
// A pose between two (feet, hands and pelvis move together; the rest is taken from the nearer one).
function FmBlend(a,b,t){if(t<=0)return a;if(t>=1)return b;const m=(u,v)=>u&&v?fgMix(u,v,t):(t<.5?u:v);
 return {...(t<.5?a:b),pelvis:m(a.pelvis,b.pelvis),feet:[0,1].map(i=>m(a.feet?.[i],b.feet?.[i])),hands:[0,1].map(i=>m(a.hands?.[i],b.hands?.[i])),torsoK:(a.torsoK??1)+((b.torsoK??1)-(a.torsoK??1))*t};}
// Climbing: u runs along the holds (0 at the first). Each foot steps from a hold to the next in turn, half a hold apart; the hands reach
// two holds above the feet. The body hangs between, knees up, facing the castell.
function FmClimbPose(f,r,u,facing){const n=r.length,H=f.H,at=(v,dx)=>{v=Kclamp(v,0,n-1);const s=Math.min(n-2,Math.floor(v)),q=Ksmooth((v-s-.45)/.55),a=r[s],b=r[s+1];return [a[0]+(b[0]-a[0])*q+dx,a[1]+(b[1]-a[1])*q];};
 const feet=[at(u,-.055*H),at(u-.5,.055*H)],hands=[at(u+2.2,-.085*H),at(u+1.7,.085*H)],fy=Math.max(feet[0][1],feet[1][1]),px=(feet[0][0]+feet[1][0])/2;
 return {H,kid:f.kid,broad:f.look.broad,pelvis:[px,fy-.43*H],feet,hands,facing,turn:.92,elbowUp:true,kneesFwd:true};}
// The time each one takes to climb to its place (seconds). 0.45.9 (Marc): the climb fills the piece of toc of its press (FEM_TOC),
// ending a little over a second before the music, the last of the level (stagger up to 0.75 s) included; the enxaneta in time for the aleta.
const FmClimbTime=L=>L>=6?FEM_ALETA-.3:Math.max(FEM_CLIMB,FEM_TOC[L]-1.1);
// The pinya: rows from the back to the front, across the bottom of the screen, seen from behind, pushing in towards the castell.
function FmPinyaLayout(W,round){const cx=W/2,r=FmRng(round.v*7+3),rows=[[658,60,230,10,1],[684,72,320,12,0],[714,86,430,12,0],[748,102,540,12,0]],out=[];let seed=round.v*131+5;
 rows.forEach(([y,H,half,n,up],ri)=>{for(let i=0;i<n;i++){const x=cx-half+(i+.5)*2*half/n+(r()-.5)*12,lean=Kclamp((x-cx)/half,-1,1),own=r()<.72,h=H*(.92+r()*.14)*(ri===3?.9:1);
  const shirt=own?round.shirt:['#f4f0e6','#3f6fd1','#f2b632','#5bb67b','#d8314a','#8c6ad1'][Math.floor(r()*6)];
  out.push({x,y:y+(r()-.5)*6,H:h,F:h*2.25,lean,up,row:ri,look:fgLook(seed++,{shirt,broad:1.04+r()*.12}),side:x<cx?-1:1,delay:r()*.7+ri*.12});}});
 return out;}
// A member of the pinya: x, y, H as the old figure (y the bottom of the body on screen, the shoulders at y − H/2); arms raised forward,
// higher with up (the hands go up with the aixecador).
function FmPinyaPose(m,x,y,up){const F=m.F,ys=y-m.H*.5,P=[x,ys+.28*F],s=m.lean,lean=-s*.12,inx=-s*.07*F;
 // the hands on the back of the one in front, at shoulder height; the first row (and everyone, with the aixecador) reaches up
 const lift=up<.5?-.06:.02+.26*up,w=up<.5?.08:.11-.03*up;return {H:F,broad:m.look.broad,pelvis:P,lean,facing:-1,turn:.95,noLegs:true,elbowUp:up>.5,armsBehind:up<.5,hands:[[x-w*F+inx,ys-lift*F],[x+w*F+inx,ys-(lift-.015)*F]]};}

// ── Events in the square ─────────────────────────────────────────────────────────────────────────────────────────────────
const FM_FESTIVE=['#e8394f','#f7c234','#2f7fe0','#28b07a','#f07a2a','#9b4fd1'];
function FmBunting(c,W,age,idle){const p=Ksmooth(age/2.2);if(p<=0)return;const cx=W/2,lines=[[cx-205,250,-20,300,46],[cx+205,250,W+20,300,46],[cx-215,330,-20,372,34],[cx+215,330,W+20,372,34]];
 lines.forEach(([x0,y0,x1,y1,sag],li)=>{const mx=(x0+x1)/2,my=(y0+y1)/2+sag,P=t=>[(1-t)*(1-t)*x0+2*t*(1-t)*mx+t*t*x1,(1-t)*(1-t)*y0+2*t*(1-t)*my+t*t*y1],reach=Kclamp(p*1.15-(li>>1)*.15);if(reach<=0)return;
  c.strokeStyle='#4a4048';c.lineWidth=2;c.beginPath();for(let i=0;i<=40;i++){const t=i/40*reach,[x,y]=P(t);i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  const n=Math.max(4,Math.round(Math.abs(x1-x0)/46));for(let k=1;k<n;k++){const t=k/n;if(t>reach)break;const pop=Ksmooth((reach-t)/.06),[bx,by]=P(t),sw=Math.sin(idle*1.3+k*.9+li)*.1;c.save();c.translate(bx,by);c.rotate(sw);c.scale(pop,pop);
   FmGlaze(c,()=>{c.beginPath();c.moveTo(-12,0);c.lineTo(12,0);c.lineTo(0,28);c.closePath();},FM_FESTIVE[(k+li*3)%6],[-12,0,24,28],.3,.25);c.restore();}});}
// The hangings (domassos) on the balconies: each of one colour, with no band (0.16.2).
function FmHangings(c,geo,age,idle){if(age<0)return;const list=geo.balconies.filter(b=>b.noble).filter((b,i)=>i%2===0).slice(0,10);
 list.forEach((b,i)=>{const d=i*.12,p=Ksmooth((age-d)/1.4);if(p<=0)return;const w=b.w*.92,hFull=Math.min(64,w*1.3)*p,x=b.x-w/2,y=b.y+20,col=['#d8314a','#f2b632','#2f6fd1','#e8618c','#7a3fb8','#1aa39a'][(i+geo.place)%6],sk=Math.sin(idle*.9+i)*.04;
  c.save();c.translate(x+w/2,y);c.transform(1,0,sk,1,0,0);FmGlaze(c,()=>{c.beginPath();c.moveTo(-w/2,0);c.lineTo(w/2,0);c.lineTo(w/2,hFull);for(let k=6;k>=0;k--)c.lineTo(-w/2+k*w/6,hFull+(k%2?5:0));c.closePath();},col,[-w/2,0,w,hFull+5],.32,.3);
  c.restore();});}
function FmPeople(c,geo,age,idle){if(age<0)return;const list=geo.balconies.filter((b,i)=>!b.noble||i%2===1).slice(0,7);
 list.forEach((b,i)=>{const p=Ksmooth((age-i*.18)/1.1);if(p<=0)return;const H=34,x=b.x+(i%2?-6:6),y=b.y+16+(1-p)*30,col=['#5b4a6b','#3d5a73','#6b4a4a','#4a6b5a'][i%4];c.save();c.beginPath();c.rect(b.x-b.w,b.y-60,b.w*2,76);c.clip();
  FmGlaze(c,()=>{c.beginPath();c.moveTo(x-11,y);c.lineTo(x-11,y-H*.5);c.quadraticCurveTo(x,y-H*.62,x+11,y-H*.5);c.lineTo(x+11,y);c.closePath();},col,[x-11,y-H*.62,22,H*.62],.3,.3);FmBall(c,x,y-H*.72,6.5,'#e8c39a');
  const wave=Math.sin(idle*5.5+i)*.45*p,ax=x+9,ay=y-H*.48;c.translate(ax,ay);c.rotate(-.5+wave);c.strokeStyle=col;c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(0,-18);c.stroke();c.fillStyle='#ffffff';c.beginPath();c.moveTo(0,-18);c.lineTo(10,-24);c.lineTo(9,-12);c.closePath();c.fill();c.restore();});}
// The flags on the roofs and the poles: each of one colour, with no stripe (0.16.2), in colours that stand out against the sky of the
// time of day (no blue against the blue sky, no orange or red against the sunset).
const FM_FLAG_COLS=[['#e8394f','#f7c234','#28b07a','#9b4fd1','#f07a2a'],['#e8394f','#28b07a','#9b4fd1','#2a5bd8'],['#2a5bd8','#1f9a6a','#fbf7ee','#3a2f8f']];
function FmFlags(c,geo,age,idle,time){if(age<0)return;const cols=FM_FLAG_COLS[time]||FM_FLAG_COLS[0];geo.flags.forEach((f,i)=>{const p=Ksmooth((age-i*.25)/1.6);if(p<=0)return;const top=f.y-f.h,y=f.y-6-(f.h-12)*p,col=cols[(i*2+geo.place)%cols.length],len=f.pole?44:36,hh=f.pole?28:22;
  c.save();c.beginPath();for(let k=0;k<=10;k++){const u=k/10,xx=f.x+u*len,yy=y+Math.sin(idle*3-u*5+i)*3*u;k?c.lineTo(xx,yy):c.moveTo(xx,yy);}for(let k=10;k>=0;k--){const u=k/10,xx=f.x+u*len,yy=y+hh+Math.sin(idle*3-u*5+i)*3*u;c.lineTo(xx,yy);}c.closePath();c.fillStyle=col;c.fill();c.restore();});}
function FmConfetti(c,W,age,leave,round){if(age<0)return;const n=70,fade=1-Ksmooth((age-leave-2)/1.5);if(fade<=0)return;c.save();c.globalAlpha*=fade;
 for(let i=0;i<n;i++){const d=Krand(i,3)*2.2,a=age-d;if(a<0)continue;const sp=55+Krand(i,5)*55,x0=Krand(i,7)*W,land=612+Krand(i,9)*96,y=Math.min(land,-20+a*sp),x=x0+Math.sin(a*1.6+i)*18*(y<land?1:0),rot=y<land?a*(2+Krand(i,11)*2)+i:i;
  c.save();c.translate(x,y);c.rotate(rot);const col=FM_FESTIVE[i%6];c.fillStyle=col;c.fillRect(-5,-3,10,6);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-5,-3,10,2);c.restore();}
 c.restore();}

// ── The scene ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The two large layers: the sky of a time of day and the buildings of a square (three skies and four squares in all).
const FmPlaceLayer=(W,k,place,plain)=>{const geo=FmGeo(place,W);return FmLayer(`fm-place-${place}`,W,720,k,sc=>FmFlatPlace(sc,geo),FM_FACADE_ZONES,53+place,plain);};
// The still part of a round's scene: sky, sun and clouds (the sun hidden until its event), façades, iron. sunAge: −1 before the sun comes out.
function FmBack(c,W,k,round,idle,plain,sunAge){const time=round.time,geo=FmGeo(round.place,W);
 FmSmoothSky(c,W,time);
 // The sun: high at midday, lower in the afternoon, low and orange at sunset.
 const sx=W*[.78,.8,.22][time],sy=[118,170,300][time],sr=[58,56,66][time];
 const sun=FmLayer(`fm-sun-${time}`,2*sr+8,2*sr+8,k,sc=>{sc.fillStyle=FM_SUNS[time].base;sc.beginPath();sc.arc(sr+4,sr+4,sr,0,Math.PI*2);sc.fill();},[FM_SUNS[time]],29+time,true);
 if(sun)FmPut(c,sun,sx-sr-4,sy-sr-4,2*sr+8,2*sr+8);else{c.fillStyle=FM_SUNS[time].base;c.beginPath();c.arc(sx,sy,sr,0,Math.PI*2);c.fill();}
 // Clouds drift slowly; one covers the sun until it comes out.
 const cloud=(i,x,y,s)=>{const cw=220*s,ch=80*s,L=FmLayer(`fm-cloud-${time}-${i}-${s}`,cw,ch,k,sc=>{sc.fillStyle=FM_CLOUDS[time].base;sc.beginPath();sc.ellipse(cw*.5,ch*.62,cw*.48,ch*.34,0,0,Math.PI*2);sc.ellipse(cw*.36,ch*.45,cw*.2,ch*.3,0,0,Math.PI*2);sc.ellipse(cw*.6,ch*.38,cw*.24,ch*.34,0,0,Math.PI*2);sc.fill();},[FM_CLOUDS[time]],40+i,true);
  if(L)FmPut(c,L,x-cw/2,y-ch/2,cw,ch);};
 const drift=idle*4;cloud(0,((W*.16+drift)%(W+300))-150,88,1);cloud(1,((W*.5+drift*.7)%(W+300))-150,58,.75);cloud(2,((W*.62+drift*.85)%(W+300))-150,200,.6);
 const out=sunAge<0?0:KeaseInOut(sunAge/2.5);cloud(3,sx+out*W*.32*(time===2?1:-1),sy+6,1.05);
 const fac=FmPlaceLayer(W,k,round.place,plain);if(fac)FmPut(c,fac,0,0,W,720);else FmFlatPlace(c,geo);
 escBlit(c,`fm-iron-${round.place}-${Math.round(W)}`,W,720,sc=>FmIron(sc,geo));
 return {geo,sx,sy};}
// The light of the time of day, and the warmth of the sun once it has come out.
function FmLight(c,W,time,sun,sunAge){const warm=sunAge<0?0:Ksmooth(sunAge/3);c.save();
 if(time>0){c.globalCompositeOperation='multiply';const g=c.createLinearGradient(0,0,W*.3,720);g.addColorStop(0,time===2?'#ffc4a0':'#fff0d6');g.addColorStop(1,time===2?'#ffe3c8':'#fff8ea');c.fillStyle=g;c.globalAlpha=time===2?.55:.4;c.fillRect(0,0,W,720);}
 if(warm<1){c.globalCompositeOperation='multiply';c.globalAlpha=.16*(1-warm);c.fillStyle='#c9d4e6';c.fillRect(0,0,W,720);}
 if(warm>0){c.globalCompositeOperation='screen';c.globalAlpha=.22*warm;const g=c.createRadialGradient(sun.sx,sun.sy,10,sun.sx,sun.sy,W*.7);g.addColorStop(0,'#ffd27a');g.addColorStop(1,'rgba(255,210,122,0)');c.fillStyle=g;c.fillRect(0,0,W,720);}
 c.restore();}
// The events of a round and the age of each (seconds since it came; −1 not yet; 1e3 long done).
function FmEvents(round,ages){const out={};for(let k=0;k<7;k++)out[femEvent(round,k)]=ages[k];return out;}
function FmSquare(c,W,round,geo,ev,idle){FmFlags(c,geo,ev.banderes??-1,idle,round.time);FmHangings(c,geo,ev.domassos??-1,idle);FmPeople(c,geo,ev.balcons??-1,idle);FmBunting(c,W,ev.banderoles??-1,idle);}

// The decor of the square (0.16.1), from the setting «Presentació del decorat»: complete; dimmed over the base colour, as much as the
// visibility of the decor says; or none, and then the castell, the pinya and the confetti stand on the base colour (black or white).
// The cards of the home page always show the square.
export const fmDecor=escDecor;
// Draws the scene. o: variant, count, steps, t (seconds since the press; 1000 at rest), duration, held, from (the round before), idle,
// reduced, preview, plain (fons senzill), background, base, opacity (the decor, see fmDecor).
export function drawCastells(c,w,h,o){escFrame();FM_FRAME++;FmEvict();FM_CARD=!!o.preview;const m=o.preview&&c.getTransform&&c.canvas?c.getTransform():null;
 const S=h/720,W=w/S,k=escScale(c)*S,round=femRound(o.variant,o.shirt),steps=FEM_PRESSES;let count=Math.max(0,Math.min(o.count||0,steps)),t=o.t??1e3,D=o.duration||(count>=steps?FEM_FINAL_MIN:FEM_STEP_MIN);
 if(o.preview){count=steps;t=FEM_ALETA+1.6;D=FEM_FINAL_MIN;}
 const A=femAges(count,t,o.preview?1e3:o.held),ages=A.levels,idle=o.reduced?0:o.idle||0,cx=W/2;
 const aF=count>=steps?ages[6]:-1,leave=femLeave(D),out=aF<0?0:Ksmooth((aF-leave.at)/leave.len);
 const decor=fmDecor(o);c.save();c.scale(S,S);
 if(decor.fade<=0){c.fillStyle=decor.base;c.fillRect(0,0,W,720);}
 // A new round comes in over the old one, which is drawn as it ended (everything done, the castell gone).
 const old=o.from!==undefined&&count===1&&o.from!==o.variant?femRound(o.from,o.shirt):null,swap=old?Ksmooth(t/1.6):1,full=decor.mode==='full';
 if(old&&swap<1){if(decor.fade>0){const done=new Array(7).fill(1e3),b=FmBack(c,W,k,old,idle,o.plain,1e3);FmSquare(c,W,old,b.geo,FmEvents(old,done),idle);if(full)FmLight(c,W,old.time,b,1e3);}
  FmConfetti(c,W,1e3,femLeave(FEM_FINAL_MIN).at,old);}
 const ev=FmEvents(round,ages);let back=null;
 if(decor.fade>0){c.save();c.globalAlpha=swap;back=FmBack(c,W,k,round,idle,o.plain,ev.sol??-1);c.restore();
  c.save();c.globalAlpha=swap;FmSquare(c,W,round,back.geo,ev,idle);c.restore();
  // dimmed: the base colour over the square, so that the square shows as much as the visibility of the decor says
  if(!full){c.save();c.globalAlpha=1-decor.fade;c.fillStyle=decor.base;c.fillRect(0,0,W,720);c.restore();}}
 // The castell: each level climbs in with its moment, up the backs of those below; in the final, after the aleta, the enxaneta goes down
 // the other side and the rest come down from the top, the same way they went up. The baixos walk in with the pinya.
 const colla=FmColla(round,cx),aR=count>=steps&&aF>=0,figs=[];
 // A gentle sway, more at the top, as a castell of people never stands perfectly still.
 const sway=L=>o.reduced?0:Math.pow(L/6,1.5)*2.4*Math.sin(idle*1.25+.4)+Math.pow(L/6,2)*1.2*Math.sin(idle*2.3);
 colla.levels.forEach((list,L)=>{const a=ages[L];if(a<0)return;
  const dS=aF<0?-1:FEM_DOWN+(6-L)*FEM_DOWN_GAP+(L===6?-.6:0),down=aF<0?0:Kclamp((aF-dS)/(L===0?1.6:FEM_DOWN_LEN+.35*Math.min(L,4)/4));if(down>=1)return;
  for(const f of list){let pose=f.pose,still=true,behind=f.depth<0,climbing=false;
   if(L===0){// the baixos walk in from the sides with the pinya, then hold one another
    const p=Ksmooth((a-1-f.j*.2)/1.6),side=f.x<cx||(f.x===cx&&f.j%2)?-1:1,walk=p<1?1-p:down>0?down:0;
    if(walk>0){const dx=side*walk*W*.34,ph=walk*9,lift=i=>Math.max(0,Math.sin(ph*Math.PI+i*Math.PI))*.05*f.H;
     pose={...f.pose,pelvis:[f.pelvis[0]+dx,f.pelvis[1]-Math.abs(Math.sin(ph*Math.PI))*.012*f.H],feet:f.feet.map((q,i)=>[q[0]+dx+Math.sin(ph*Math.PI+i*Math.PI)*.04*f.H,q[1]-lift(i)]),hands:null};
     pose=FmBlend(pose,{...pose,hands:f.pose.hands},Ksmooth((p-.8)/.2)*(down>0?0:1));still=false;}}
   else{const d=list.length>1&&L<4?f.j*.25:L===4?f.j*.35:0,T=FmClimbTime(L),p=L===6&&aR?Kclamp(aF/T):Kclamp((a-d)/T),n=f.holds.length;
    if(p<=0)continue;
    if(p<1){const c0=.8,u=(n-2)*KeaseInOut(Math.min(1,p/c0)),cp=FmClimbPose(f,f.holds,u,behind?1:-1);pose=p<c0?cp:FmBlend(FmClimbPose(f,f.holds,n-2,behind?1:-1),f.pose,Ksmooth((p-c0)/(1-c0)));still=false;climbing=p<c0;}
    if(L===6&&aR){const al=Ksmooth((aF-FEM_ALETA)/.5)*(1-Ksmooth((aF-dS+.1)/.5));if(al>0){pose=FmBlend(pose,f.aleta,al);still=false;}}
    if(down>0){// coming down the same way; the enxaneta by the other side of the castell
     const r=L===6?f.down:f.holds,m=r.length,q=(down-.18)/.82,fc=L===6?1:behind?1:-1;
     pose=q<=0?FmBlend(pose,FmClimbPose(f,r,m-2,fc),down/.18):FmClimbPose(f,r,(m-2)*(1-KeaseInOut(q)),fc);still=false;climbing=true;if(L===6)behind=true;}}
   const dx=climbing?0:sway(L),key=still&&!(L===6&&aR&&aF<dS+.6)?`fg-${round.v}-${round.shirt}-${L}-${f.j}-${k.toFixed(2)}`:null;
   figs.push({L,f,pose:{...pose,facing:pose.facing??f.facing},dx,key,order:(behind?0:2)+(climbing?(behind?-1:1):0),depth:f.depth});}});
 // From the back: climbers behind, the back of the ring, the front of the ring, climbers in front; each from the bottom up.
 figs.sort((A,B)=>A.order-B.order||A.L-B.L||A.depth-B.depth);
 for(const F of figs){const H=F.f.H;c.save();c.translate(F.dx,0);FmFigure(c,k,F.key,F.pose,F.f.look,[-.7*H,-.72*H,1.4*H,1.32*H]);c.restore();}
 // The pinya walks in with the first moment and leaves at the end of the final; its hands go up with the aixecador.
 const a0=A.pinya;
 if(a0>=0&&out<1){const pin=FmPinyaLayout(W,round),hands=ev.mans>=0?Ksmooth(ev.mans/2):0;
  for(const m of pin){const pin0=Ksmooth((a0-m.delay)/1.6),gone=Ksmooth((out*1.4-m.delay*.4)),q=pin0*(1-gone);if(q<=0)continue;
   const x=m.x+m.side*(1-q)*(W*.55),y=m.y+Math.abs(Math.sin((1-q)*Math.PI*4))*-5,up=Math.round(Kclamp(m.up+hands*(m.row<2?1:0))*20)/20,F=m.F;
   const key=hands<=0||hands>=1||m.row>=2?`fp-${m.look.seed}-${m.look.shirt}-${up}-${k.toFixed(2)}`:null;
   FmFigure(c,k,key,FmPinyaPose(m,x,y,up),m.look,[-.52*F,-.68*F,1.04*F,.8*F]);}}
 FmConfetti(c,W,ev.confeti??-1,leave.at,round);
 if(back&&full)FmLight(c,W,round.time,back,ev.sol??-1);
 c.restore();
 if(m&&typeof m==='object'){if(FM_QUEUE.length)FM_CARDS.set(c.canvas,[c,w,h,o,m]);else FM_CARDS.delete(c.canvas);}
 // Once this round's mosaics are made, the next round's are prepared, so that its square is ready when it comes.
 if(!o.preview&&!FM_QUEUE.length&&decor.fade>0){const next=femRound(round.v+1);FmPlaceLayer(W,k,next.place,o.plain);}
 return true;}
