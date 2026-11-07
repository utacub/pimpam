// La fira de llauna (CE44), 0.47: printed tin. Every piece is drawn as a toy of lithographed tinplate: flat inks of a small palette,
// shading made of halftone dots (not of gradients), a dark key line printed a little out of register, the metal under the ink (a
// diagonal sheen and darker edges), worn edges where the silver tin shows, rivets, tabs and rolled edges. A piece is printed once into
// a sprite of its own (at the resolution of the screen) and then only moved, turned and copied; where there is no canvas (the tests),
// it is drawn straight away.
import {Kclamp,Kmix,Krgba} from './kaleido-base.js';
import {escCanvas,escScale} from './escenari.js';

export const FI_TAU=Math.PI*2;
// The printed inks: a fair palette (no pure colours, as on old tin), and the key line.
export const FI_INK=Object.freeze({key:'#24180f',red:'#d8402f',red2:'#a52a22',cream:'#f6e7c4',navy:'#1f3a5f',teal:'#2a8c88',gold:'#e8b13a',green:'#4f9a3e',
 sky:'#7fc4c9',sun:'#f7e3a1',ground:'#c98f4e',ground2:'#9c6534',lane:'#e3b778',skin:'#f2c7a0',skin2:'#c98c62',skin3:'#8a5a3a',pink:'#e98a8a',brown:'#6a3d22',
 tin:'#c9c4b8',grey:'#7c8a8c',plum:'#7a3f6e',orange:'#e57a2e',blue:'#3f74b8',white:'#fbf6ea',black:'#2a2522'});
// A path: a function that traces it on a context (beginPath is done here).
const fiTrace=(c,path)=>{c.beginPath();path(c);};
export const fiEll=(x,y,rx,ry,r=0)=>c=>{c.moveTo(x+rx*Math.cos(r),y+rx*Math.sin(r));c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),r,0,FI_TAU);};
export const fiRR=(x,y,w,h,r)=>c=>{r=Math.max(0,Math.min(r,w/2,h/2));c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
export const fiPoly=pts=>c=>{c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();};
// A seeded random number for the wear and the dots.
export const fiRnd=seed=>{let s=(Math.abs(Math.floor(seed))%2147483646)+1;return ()=>(s=(s*16807)%2147483647)/2147483647;};
const fiSeed=str=>{let h=7;for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))|0;return h;};

// Halftone: dots on a staggered grid inside the path, larger towards (x1, y1). amount: the largest dot as a share of the cell.
export function fiHalftone(c,path,box,from,to,amount=.8,color='rgba(40,20,10,.35)',cell=7){const [bx,by,bw,bh]=box,[x0,y0]=from,[x1,y1]=to,dx=x1-x0,dy=y1-y0,L=dx*dx+dy*dy||1;
 c.save();fiTrace(c,path);c.clip();c.fillStyle=color;c.beginPath();
 for(let y=by-cell,row=0;y<by+bh+cell;y+=cell,row++)for(let x=bx-cell+(row%2?cell/2:0);x<bx+bw+cell;x+=cell){const t=Kclamp(((x-x0)*dx+(y-y0)*dy)/L),r=t*cell*.55*amount;if(r<.35)continue;c.moveTo(x+r,y);c.arc(x,y,r,0,FI_TAU);}
 c.fill();c.restore();}
// The metal under the ink: a diagonal band of light and darker edges.
export function fiSheen(c,path,box,k=1,angle=0){const [bx,by,bw,bh]=box;c.save();fiTrace(c,path);c.clip();
 const ux=Math.cos(angle+Math.PI/4),uy=Math.sin(angle+Math.PI/4),cx=bx+bw/2,cy=by+bh/2,R=Math.hypot(bw,bh)/2;
 const g=c.createLinearGradient(cx-R*ux,cy-R*uy,cx+R*ux,cy+R*uy);
 g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.36,'rgba(255,255,255,0)');g.addColorStop(.44,`rgba(255,250,235,${(.32*k).toFixed(3)})`);g.addColorStop(.48,`rgba(255,255,255,${(.5*k).toFixed(3)})`);
 g.addColorStop(.55,'rgba(255,255,255,0)');g.addColorStop(.74,`rgba(220,235,255,${(.1*k).toFixed(3)})`);g.addColorStop(1,'rgba(255,255,255,0)');
 c.globalCompositeOperation='screen';c.fillStyle=g;c.fillRect(bx-4,by-4,bw+8,bh+8);
 const r=c.createRadialGradient(cx-bw*.05,cy-bh*.1,Math.min(bw,bh)*.2,cx,cy,Math.max(bw,bh)*.72);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(1,`rgba(40,30,25,${(.32*k).toFixed(3)})`);
 c.globalCompositeOperation='source-over';c.fillStyle=r;c.fillRect(bx-4,by-4,bw+8,bh+8);c.restore();}
// Wear: little scratches near the edges where the tin shows through.
export function fiWear(c,path,box,seed,n=12){const [bx,by,bw,bh]=box,rnd=fiRnd(seed);c.save();fiTrace(c,path);c.clip();c.strokeStyle='rgba(228,230,234,.8)';c.lineWidth=1.1;c.beginPath();
 for(let i=0;i<n;i++){const top=rnd()<.5,x=bx+rnd()*bw,y=top?by+rnd()*bh*.1:by+bh-rnd()*bh*.1;c.moveTo(x,y);c.lineTo(x+2+rnd()*6,y+(rnd()-.5)*2);}c.stroke();c.restore();}
// A printed shape: the key line underneath (only its outer half shows), the ink a little out of register, the halftone, the sheen and
// the wear. o: shade [from, to] in fractions of the box, ht (halftone amount), sheen, wear, key (line width; 0 none), rim (a light rim
// outside the key line, for figures on a black base).
// The light rim of figures drawn on a black base (set by the picture for the frame; part of every sprite key).
let FI_RIM=null;export const fiSetRim=col=>{FI_RIM=col||null;};export const fiRimKey=()=>FI_RIM?'|r':'';
export function fiPrint(c,path,fill,box,o={}){const [bx,by,bw,bh]=box,key=o.key??5.5,rim=o.rim??(key>=4?FI_RIM:null);
 if(rim){c.save();fiTrace(c,path);c.strokeStyle=rim;c.lineWidth=key+5;c.lineJoin='round';c.stroke();c.restore();}
 if(key>0){c.save();fiTrace(c,path);c.strokeStyle=FI_INK.key;c.lineWidth=key;c.lineJoin='round';c.stroke();c.restore();}
 c.save();c.translate(1.2,.8);fiTrace(c,path);c.fillStyle=fill;c.fill();c.restore();
 if(o.pattern)o.pattern(c);
 const sd=o.shade||[0,0,1,1],ht=o.ht??.75;if(ht>0)fiHalftone(c,path,box,[bx+bw*sd[0],by+bh*sd[1]],[bx+bw*sd[2],by+bh*sd[3]],ht,o.dots||'rgba(40,20,10,.34)',o.cell||7);
 if(o.sheen!==0)fiSheen(c,path,box,o.sheen??1,o.angle||0);
 if(o.wear!==false)fiWear(c,path,box,o.seed??fiSeed(fill+bx+by),o.wearN??10);}
// A rivet and a rolled edge (bead) of bright tin.
export function fiRivet(c,x,y,r=4){const g=c.createRadialGradient(x-r*.35,y-r*.35,0,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.45,'#c9c9c4');g.addColorStop(1,'#5d5850');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,FI_TAU);c.fill();}
export function fiBead(c,x0,y0,x1,y1,w=8){const nx=-(y1-y0),ny=x1-x0,L=Math.hypot(nx,ny)||1,ux=nx/L*w,uy=ny/L*w,g=c.createLinearGradient(x0-ux,y0-uy,x0+ux,y0+uy);
 g.addColorStop(0,'#5a554c');g.addColorStop(.3,'#f4f2ea');g.addColorStop(.55,'#b7b3a8');g.addColorStop(1,'#4a463e');c.save();c.strokeStyle=g;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.restore();}
// A five-pointed star (printed decoration, the medals, the stars of the night and the gags).
export const fiStarPath=(x,y,R,r=R*.45,rot=-Math.PI/2)=>c=>{for(let j=0;j<10;j++){const a=rot+j*Math.PI/5,q=j%2?r:R;if(j)c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);else c.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();};
// A glass bulb with its socket of tin; lit: 0 to 1 (a warm glow around it). col: the colour of its light.
export function fiBulb(c,x,y,r,lit,col='#ffd978',glow=true){if(lit>0&&glow){const g=c.createRadialGradient(x,y,0,x,y,r*3.4);g.addColorStop(0,Krgba('#fff0be',.55*lit));g.addColorStop(.4,Krgba(col,.22*lit));g.addColorStop(1,Krgba(col,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r*3.4,0,FI_TAU);c.fill();}
 const g=c.createRadialGradient(x-r*.3,y-r*.35,r*.1,x,y,r);g.addColorStop(0,Kmix('#f4f1e6','#fffef6',lit));g.addColorStop(.55,Kmix('#cfc7b2',col,lit));g.addColorStop(1,Kmix('#8d8472','#c77a1c',lit));
 c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,FI_TAU);c.fill();c.strokeStyle=FI_INK.key;c.lineWidth=Math.max(1.5,r*.09);c.stroke();
 c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.ellipse(x-r*.35,y-r*.4,r*.22,r*.12,-.6,0,FI_TAU);c.fill();}

// ── Sprites ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A piece printed once: draw(sc) prints it in its own units with the pivot at (0, 0) inside the box [x, y, w, h]. The sprite is made at
// the scale the context draws now (rounded, so that a few sizes are kept), and freed when it has not been used for a while.
const FI_SPRITES=new Map();let FI_FRAME=0;
export function fiSpriteFrame(){FI_FRAME++;if(FI_FRAME%120)return;for(const [k,s] of FI_SPRITES)if(FI_FRAME-s.used>900){s.cv.width=s.cv.height=1;FI_SPRITES.delete(k);}}
export const FI_HAS_CANVAS=()=>typeof document!=='undefined'&&!!document.createElement;
export function fiSprite(c,key,box,draw){const [x,y,w,h]=box;if(!FI_HAS_CANVAS()){draw(c);return;}
 const m=escScale(c),q=Math.max(.25,Math.round(m*4)/4),W=Math.max(1,Math.ceil(w*q)),H=Math.max(1,Math.ceil(h*q)),id=`${key}|${q}${fiRimKey()}`;let s=FI_SPRITES.get(id);
 if(!s){const cv=escCanvas(W,H),sc=cv?.getContext?.('2d');if(!sc){draw(c);return;}sc.setTransform(q,0,0,q,-x*q,-y*q);draw(sc);s={cv,used:0};FI_SPRITES.set(id,s);}
 s.used=FI_FRAME;c.drawImage(s.cv,x,y,w,h);}
export const fiSpriteCount=()=>FI_SPRITES.size;
