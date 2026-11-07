// Vitralls (CE22): stained glass drawn from code. A window is a list of layers of panes (polygons in window units, where the
// window fits in a circle of radius 1); this module draws the light coming through each pane, the texture of the glass and
// the lead between the panes. Textures are generated once, in code, so the activity still needs no image files.
import {K_TAU,Kclamp,Ksmooth,Krand,Kmix,Krgba} from './kaleido-base.js';

// ── Geometry in window units ────────────────────────────────────────────────────────────────────────────────────────────
export const Gpoly=(n,r=1,a0=0,cx=0,cy=0)=>Array.from({length:n},(_,i)=>{const a=a0+i*K_TAU/n;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];});
export const Gcircle=(cx,cy,r,n=36)=>Gpoly(n,r,0,cx,cy);
export const Gmove=(pts,dx,dy)=>pts.map(([x,y])=>[x+dx,y+dy]);
export const Gscale=(pts,k,cx=0,cy=0)=>pts.map(([x,y])=>[cx+(x-cx)*k,cy+(y-cy)*k]);
export function Grot(pts,a,cx=0,cy=0){const co=Math.cos(a),si=Math.sin(a);return pts.map(([x,y])=>[cx+(x-cx)*co-(y-cy)*si,cy+(x-cx)*si+(y-cy)*co]);}
export function Gcentroid(pts){let x=0,y=0;for(const p of pts){x+=p[0];y+=p[1];}return [x/pts.length,y/pts.length];}
// Annular sector between radii r0 and r1 and angles a0 and a1.
export function Gsector(r0,r1,a0,a1,steps=8){const pts=[];for(let i=0;i<=steps;i++){const a=a0+(a1-a0)*i/steps;pts.push([Math.cos(a)*r1,Math.sin(a)*r1]);}
 if(r0<=1e-6)pts.push([0,0]);else for(let i=steps;i>=0;i--){const a=a0+(a1-a0)*i/steps;pts.push([Math.cos(a)*r0,Math.sin(a)*r0]);}return pts;}
// Petal (pointed oval) from radius r0 to r1 along angle a, with half width hw at its widest; shape > 1 makes it pointier.
export function Gpetal(r0,r1,a,hw,shape=1,n=12){const ux=Math.cos(a),uy=Math.sin(a),pts=[];
 for(let i=0;i<=n;i++){const u=i/n,r=r0+(r1-r0)*u,wd=hw*Math.pow(Math.sin(Math.PI*u),shape);pts.push([ux*r-uy*wd,uy*r+ux*wd]);}
 for(let i=n-1;i>0;i--){const u=i/n,r=r0+(r1-r0)*u,wd=hw*Math.pow(Math.sin(Math.PI*u),shape);pts.push([ux*r+uy*wd,uy*r-ux*wd]);}return pts;}
// Pointed (Gothic) arch: base from x0 to x1 at y0, springing at y1, apex where the two arcs meet.
export function Garch(x0,x1,y0,y1,n=14){const wd=x1-x0,pts=[[x0,y0],[x0,y1]];
 for(let i=1;i<=n;i++){const a=Math.PI/3*i/n;pts.push([x1-wd*Math.cos(a),y1-wd*Math.sin(a)]);}
 for(let i=n-1;i>=1;i--){const a=Math.PI/3*i/n;pts.push([x0+wd*Math.cos(a),y1-wd*Math.sin(a)]);}pts.push([x1,y1],[x1,y0]);return pts;}
// Keep the part of a polygon where a·x + b·y ≤ k (Sutherland–Hodgman against one half-plane).
export function Gclip(pts,a,b,k){const out=[];for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length],fp=a*p[0]+b*p[1]-k,fq=a*q[0]+b*q[1]-k;
 if(fp<=0)out.push(p);if(fp*fq<0){const t=fp/(fp-fq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}return out;}
// The part of a polygon inside a convex polygon (clipped against each of its edges).
export function Gintersect(pts,convex){const [mx,my]=Gcentroid(convex);let out=pts;for(let i=0;i<convex.length&&out.length>2;i++){const p=convex[i],q=convex[(i+1)%convex.length];let nx=q[1]-p[1],ny=-(q[0]-p[0]),k=nx*p[0]+ny*p[1];if(nx*mx+ny*my>k){nx=-nx;ny=-ny;k=-k;}out=Gclip(out,nx,ny,k);}return out;}
// Voronoi cells of the sites inside a convex boundary, with a few rounds of relaxation so the pieces look cut by hand.
export function Gvoronoi(sites,boundary,relax=1){let s=sites.map(p=>p.slice()),cells=[];
 for(let round=0;round<=relax;round++){cells=s.map((p,i)=>{let cell=boundary;for(let j=0;j<s.length&&cell.length>2;j++){if(j===i)continue;const q=s[j];cell=Gclip(cell,q[0]-p[0],q[1]-p[1],(q[0]*q[0]+q[1]*q[1]-p[0]*p[0]-p[1]*p[1])/2);}return cell;});
  if(round<relax)s=cells.map((cell,i)=>cell.length>2?Gcentroid(cell):s[i]);}
 return cells.map((cell,i)=>({pts:cell,site:s[i]})).filter(x=>x.pts.length>2);}
// Wavy band between two curves y = f(x) and y = g(x), from x0 to x1.
export function Gband(f,g,x0,x1,n=24){const pts=[];for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;pts.push([x,f(x)]);}for(let i=n;i>=0;i--){const x=x0+(x1-x0)*i/n;pts.push([x,g(x)]);}return pts;}

// ── Glass textures ──────────────────────────────────────────────────────────────────────────────────────────────────────
// Grey tiles (256 px, generated once) centred on mid-grey, blended over the panes in 'overlay' mode: lighter grey brightens the glass, darker grey shades it.
const G_TEX=new Map();
export function Gcanvas(n){if(typeof document!=='undefined'&&document.createElement){const cv=document.createElement('canvas');cv.width=cv.height=n;return cv;}if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(n,n);return null;}
// Tileable value noise with smooth interpolation; cx and cy lattice cells across the tile.
function Gnoise(n,cx,cy,seed){const lat=(i,j)=>Krand(((i%cx)+cx)%cx*131+(((j%cy)+cy)%cy)*977,seed),out=new Float32Array(n*n),sm=x=>x*x*(3-2*x);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const fx=x/n*cx,fy=y/n*cy,i=Math.floor(fx),j=Math.floor(fy),u=sm(fx-i),v=sm(fy-j);
  out[y*n+x]=(lat(i,j)*(1-u)+lat(i+1,j)*u)*(1-v)+(lat(i,j+1)*(1-u)+lat(i+1,j+1)*u)*v;}return out;}
export function Gfbm(n,cx,cy,seed,octaves){const acc=new Float32Array(n*n);let amp=.5,tot=0;for(let o=0;o<octaves;o++){const v=Gnoise(n,cx<<o,cy<<o,seed+o*17);for(let i=0;i<acc.length;i++)acc[i]+=v[i]*amp;tot+=amp;amp*=.5;}for(let i=0;i<acc.length;i++)acc[i]/=tot;return acc;}
const G_TEXTURES={
 // Cathedral glass: streaks drawn while the glass was rolled, with small hammered dimples.
 cathedral:n=>{const a=Gfbm(n,2,16,3,3),b=Gfbm(n,12,12,9,2);return i=>.5+.55*(a[i]-.5)+.32*(b[i]-.5);},
 // Opalescent glass: milky clouds and veils.
 opal:n=>{const a=Gfbm(n,3,3,21,4),b=Gfbm(n,6,2,33,2);return i=>.5+.72*(a[i]-.5)+.13*Math.sin((b[i]-.5)*9);},
 // Seedy glass: a fine grain with small air bubbles.
 seedy:n=>{const a=Gfbm(n,16,16,41,2),bubbles=new Float32Array(n*n);for(let k=0;k<70;k++){const bx=Krand(k,51)*n,by=Krand(k,52)*n,r=1.5+Krand(k,53)*3.5;
  for(let y=Math.floor(by-r-2);y<=by+r+2;y++)for(let x=Math.floor(bx-r-2);x<=bx+r+2;x++){const d=Math.hypot(x-bx,y-by),rim=Math.exp(-Math.pow((d-r)/.9,2))*.45-Math.exp(-Math.pow(d/(r*.7),2))*.15,X=((x%n)+n)%n,Y=((y%n)+n)%n;bubbles[Y*n+X]+=rim;}}
  return i=>.5+.3*(a[i]-.5)+bubbles[i];},
 // Frosted glass: a soft, even grain.
 frost:n=>{const a=Gfbm(n,32,32,61,2),b=Gfbm(n,4,4,62,2);return i=>.5+.35*(a[i]-.5)+.25*(b[i]-.5);}
};
export function glassTexture(kind){if(G_TEX.has(kind))return G_TEX.get(kind);let cv=null;const make=G_TEXTURES[kind],n=256;
 if(make){cv=Gcanvas(n);const c=cv?.getContext?.('2d');if(c&&c.createImageData){const img=c.createImageData(n,n),d=img.data,val=make(n);for(let i=0;i<n*n;i++){const v=Math.round(Kclamp(val(i))*255);d[i*4]=d[i*4+1]=d[i*4+2]=v;d[i*4+3]=255;}c.putImageData(img,0,0);}else cv=null;}
 G_TEX.set(kind,cv);return cv;}

// ── Drawing ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A pane: {pts, color, a (light 0–1: dark glass → lit glass), l (extra local light 0–1), v (visibility 0–1), tex, j (shade −1…1)}.
// A layer: {panes, rot, k (scale), dx, dy, lead (width in window units), texA, after(c, toScreen)}.
// view: {cx, cy, R (pixels per window unit), lit, lead, glow:{color, a, r}, sweep:{angle, pos, a, width}, rays:{colors, a, turn}}.
const G_LEAD='#17151d',G_DARK='#07060c';
function Gpane(p,lit){const j=p.j||0,base=j>0?Kmix(p.color,'#ffffff',.14*j):Kmix(p.color,'#000000',-.16*j),a=Kclamp(p.a??1),l=Kclamp(p.l||0);
 if(!lit)return Kmix(Kmix(base,'#ffffff',.72*(1-a)),'#ffffff',.25*l);
 return Kmix(Kmix(base,G_DARK,.84*(1-a)),'#ffffff',.38*l*l*a);}
function Gtrace(c,pts,S){c.moveTo(S(pts[0])[0],S(pts[0])[1]);for(let i=1;i<pts.length;i++){const q=S(pts[i]);c.lineTo(q[0],q[1]);}c.closePath();}
// o.quality (0–1, default 1) scales the texture of the glass and the shadow along the lead; the drawing lowers it on slow devices.
export function glassWindow(c,w,h,o,layers,view){const {cx,cy,R}=view,lit=view.lit!==false&&o.lit!==false,quality=Kclamp(o.quality??1);
 if(lit&&view.glow&&view.glow.a>0){const r=R*(view.glow.r||1.35),g=c.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,Krgba(view.glow.color,view.glow.a));g.addColorStop(.55,Krgba(view.glow.color,view.glow.a*.35));g.addColorStop(1,Krgba(view.glow.color,0));
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=g;c.fillRect(cx-r,cy-r,2*r,2*r);c.restore();}
 if(lit&&view.rays)Grays(c,view,R);
 for(const layer of layers){const k=layer.k??1,rot=layer.rot||0,co=Math.cos(rot)*k*R,si=Math.sin(rot)*k*R,dx=cx+(layer.dx||0)*R,dy=cy+(layer.dy||0)*R,S=([x,y])=>[dx+x*co-y*si,dy+x*si+y*co];
  const lead=Math.max(1,(layer.lead??view.lead??.014)*R*k),solid=[],fading=[];for(const p of layer.panes){if(!p||p.pts.length<3)continue;const v=p.v??1;if(v<=.004)continue;(v>=.996?solid:fading).push(p);}
  c.save();c.globalCompositeOperation='source-over';c.lineJoin='miter';c.miterLimit=2.5;c.lineCap='butt';
  for(const p of solid){c.fillStyle=Gpane(p,lit);c.beginPath();Gtrace(c,p.pts,S);c.fill();}
  // The texture follows the window: it turns and scales with the layer, so it never shimmers on its own.
  const texA=(layer.texA??.55)*quality;if(texA>.01&&solid.length){const kinds=new Set(solid.map(p=>p.tex||layer.tex||'cathedral'));for(const kind of kinds){const tex=glassTexture(kind);if(!tex)continue;const pat=c.createPattern(tex,'repeat');if(!pat)continue;
   if(pat.setTransform&&typeof DOMMatrix!=='undefined'){const z=R*k/380;pat.setTransform(new DOMMatrix([Math.cos(rot)*z,Math.sin(rot)*z,-Math.sin(rot)*z,Math.cos(rot)*z,dx,dy]));}
   c.globalCompositeOperation='overlay';c.globalAlpha=texA;c.fillStyle=pat;c.beginPath();for(const p of solid)if((p.tex||layer.tex||'cathedral')===kind)Gtrace(c,p.pts,S);c.fill();c.globalAlpha=1;}c.globalCompositeOperation='source-over';}
  // Lead came: a soft shadow inside each pane, the dark lead and a thin highlight along its crest.
  if(solid.length&&lead>0){c.beginPath();for(const p of solid)Gtrace(c,p.pts,S);if(lit&&quality>.01){c.strokeStyle=`rgba(5,4,10,${(.38*quality).toFixed(3)})`;c.lineWidth=lead*2.6;c.stroke();}c.strokeStyle=G_LEAD;c.lineWidth=lead;c.stroke();c.strokeStyle=lit?'rgba(170,165,190,.28)':'rgba(255,255,255,.35)';c.lineWidth=Math.max(.6,lead*.28);c.stroke();}
  for(const p of fading){c.globalAlpha=Kclamp(p.v);c.fillStyle=Gpane(p,lit);c.beginPath();Gtrace(c,p.pts,S);c.fill();if(lead>0){c.strokeStyle=G_LEAD;c.lineWidth=lead;c.stroke();}c.globalAlpha=1;}
  if(layer.after)layer.after(c,S,lead);
  c.restore();}
 // A broad band of light that slides slowly across the glass.
 if(view.sweep&&view.sweep.a>0){const sw=view.sweep,ux=Math.cos(sw.angle),uy=Math.sin(sw.angle),px=cx+ux*sw.pos*R,py=cy+uy*sw.pos*R,half=(sw.width||.35)*R,g=c.createLinearGradient(px-ux*half,py-uy*half,px+ux*half,py+uy*half);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,`rgba(255,250,235,${Kclamp(sw.a).toFixed(3)})`);g.addColorStop(1,'rgba(255,255,255,0)');c.save();c.globalCompositeOperation=lit?'lighter':'soft-light';c.fillStyle=g;c.beginPath();
  for(const layer of layers){if(layer.noSweep)continue;const k=layer.k??1,rot=layer.rot||0,co=Math.cos(rot)*k*R,si=Math.sin(rot)*k*R,dx=cx+(layer.dx||0)*R,dy=cy+(layer.dy||0)*R,S=([x,y])=>[dx+x*co-y*si,dy+x*si+y*co];for(const p of layer.panes)if(p&&(p.v??1)>.5&&p.pts.length>2)Gtrace(c,p.pts,S);}
  c.fill();c.restore();}}
// Coloured light falling from the window: long soft beams that turn very slowly.
function Grays(c,view,R){const r=view.rays,n=r.colors.length,L=R*(r.length||2.4),X=view.cx+(r.x||0)*R,Y=view.cy+(r.y||0)*R;c.save();c.globalCompositeOperation='lighter';
 const span=r.span??K_TAU;for(let i=0;i<n;i++){const a=(r.turn||0)+(span===K_TAU?i*K_TAU/n:(i+.5)*span/n)+(r.offset||0),wd=r.width||.16,g=c.createRadialGradient(X,Y,R*(r.inner??.2),X,Y,L);g.addColorStop(0,Krgba(r.colors[i],r.a));g.addColorStop(1,Krgba(r.colors[i],0));
  c.fillStyle=g;c.beginPath();c.moveTo(X,Y);c.arc(X,Y,L,a-wd,a+wd);c.closePath();c.fill();}c.restore();}
// Soft reveal: 0 before the moment t0, 1 after t0 + len.
export const Gon=(t,t0,len=.5)=>Ksmooth((t-t0)/len);
// A seeded shade for each pane, so neighbouring pieces of the same colour still look like different sheets of glass.
export const Gshade=(i,seed)=>Krand(i*3.7+11,seed)*2-1;
