// El viatge en globus (CE43), 0.43: the painting toolkit. Backgrounds are painted once, as gouache on animation backgrounds (opaque layers,
// soft edges, brush strokes); the characters and the near objects get the clean line and two flat tones of a cel. Everything here works on a
// 2D context in virtual pixels (the frame is 800 high); the sheets are painted on CPU canvases (cpuSheet, carrega.js), never every frame.
// The shapes of the style tests of 3 November (production/globus/pinzell.js), made cheaper: no blur per brush stroke (a soft radial
// gradient instead), periodic noise so that every strip loops without a seam, and sprites for the trees and clouds that repeat.
export const VGP=(()=>{
const TAU=Math.PI*2;
 function hash(i,j,k=0){let h=(i*374761393+j*668265263+k*1274126177)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296;}
 function noise(x,y,k=0){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=hash(xi,yi,k),b=hash(xi+1,yi,k),c=hash(xi,yi+1,k),d=hash(xi+1,yi+1,k);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
// Value noise along a loop: u from 0 to 1 goes once round, with n lattice cells, so f(0)=f(1).
 function loopNoise(u,n,seed){const x=((u%1)+1)%1*n,i=Math.floor(x),f=x-i,s=f*f*(3-2*f);const a=hash(i%n,seed,7),b=hash((i+1)%n,seed,7);return a+(b-a)*s;}
 function rng(seed){let s=(seed*2654435761)>>>0||1;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
const rgb=(c,a=1)=>`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const lighten=(c,t)=>mix(c,[255,255,255],t),darken=(c,t)=>mix(c,[0,0,0],t);
 function smooth(pts,n=4,closed=false){const out=[];const N=pts.length;const at=i=>pts[closed?((i%N)+N)%N:Math.max(0,Math.min(N-1,i))];
 const last=closed?N:N-1;for(let i=0;i<last;i++){const p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2);for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;
  out.push([.5*(2*p1[0]+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*(2*p1[1]+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
 if(!closed)out.push(pts[N-1]);return out;}
 function path(c,pts,close=true){c.beginPath();for(let i=0;i<pts.length;i++){const p=pts[i];if(i)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);}if(close)c.closePath();}
 function bounds(pts){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of pts){if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y;}return {x:x0,y:y0,w:x1-x0,h:y1-y0};}
 function blob(cx,cy,rx,seed,amp=.15,n=24,ry=rx){const pts=[];for(let i=0;i<n;i++){const a=i/n*TAU,k=1+amp*(noise(Math.cos(a)*1.7+seed*3.1,Math.sin(a)*1.7+seed*5.3,seed)-.5)*2;pts.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]);}return smooth(pts,3,true);}
 function ell(c,x,y,rx,ry,rot=0){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);c.closePath();}
 function fill(c,pts,col,alpha=1){c.save();c.globalAlpha*=alpha;path(c,pts);c.fillStyle=rgb(col);c.fill();c.restore();}
 function tone(c,pts,col,alpha=.22,mode='multiply'){c.save();c.globalCompositeOperation=mode;c.globalAlpha*=alpha;path(c,pts);c.fillStyle=rgb(col);c.fill();c.restore();}
// A soft dab: an ellipse whose edge fades out (a radial gradient), the cheap stand-in for a blurred brush stroke.
 function dab(c,x,y,rx,ry,col,alpha=1,rot=0,core=.35){if(rx<.3||ry<.3)return;c.save();c.translate(x,y);c.rotate(rot);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,rx*core,0,0,rx);
 g.addColorStop(0,rgb(col,alpha));g.addColorStop(1,rgb(col,0));c.fillStyle=g;c.fillRect(-rx,-rx,2*rx,2*rx);c.restore();}
// The cel line: round, even, dark brown; «taper» thins its ends.
 function line(c,pts,o={}){const {col=[58,40,30],width=2.2,alpha=1,close=false}=o;if(pts.length<2)return;c.save();c.strokeStyle=rgb(col,alpha);c.lineCap='round';c.lineJoin='round';c.lineWidth=width;path(c,pts,close);c.stroke();c.restore();}
// Gouache: the shape in its colour and, inside, lighter and darker strokes along a direction, soft-edged.
 function gouache(c,pts,col,o={}){const {light=.09,dark=.08,seed=1,strokes=14,dir=0,long=.35,alpha=1,soft=0}=o;
 c.save();c.globalAlpha*=alpha;if(soft)c.filter=`blur(${soft}px)`;path(c,pts);c.fillStyle=rgb(col);c.fill();c.filter='none';c.clip();
 const b=bounds(pts),r=rng(seed);
 for(let i=0;i<strokes;i++){const x=b.x+r()*b.w,y=b.y+r()*b.h,w=(long*.5+r()*long)*Math.max(60,b.w)*.5,h=(.04+r()*.09)*Math.max(40,b.h);const k=r()<.5?lighten(col,light*(.4+r())):darken(col,dark*(.4+r()));
  dab(c,x,y,w,h,k,.35,dir+(r()-.5)*.3,.2);}
 c.restore();}
// A vertical gradient inside a shape, between stops [[t,col,alpha?],…].
 function vgrad(c,pts,stops,alpha=1){const b=bounds(pts);c.save();path(c,pts);c.clip();const g=c.createLinearGradient(0,b.y,0,b.y+b.h);
 for(const [t,col,a] of stops)g.addColorStop(Math.max(0,Math.min(1,t)),rgb(col,a===undefined?1:a));c.globalAlpha*=alpha;c.fillStyle=g;c.fillRect(b.x-2,b.y-2,b.w+4,b.h+4);c.restore();}
// ── Sprites, painted once ────────────────────────────────────────────────────────────────────────────────────────────────
 function canvas(w,h){if(typeof document==='undefined')return null;const k=document.createElement('canvas');k.width=Math.max(1,Math.ceil(w));k.height=Math.max(1,Math.ceil(h));return k;}
 function ctx2(k){return k.getContext('2d',{willReadFrequently:true});}
// A cumulus: lobes on two tiers over a flat base; shade under, body, light on the lobes towards the sun. The sprite is w×h at scale q;
// its base is at sprite.base. 0.47.1: the canvas is sized from the lobes themselves (plus the blur), so no lobe is cut flat at the top
// or at the sides any more (the tall upper tier used to poke out of a canvas 1.5 h high).
 function cumulusSprite(w,h,seed,pal,q=1,sunDir=-1){const r=rng(seed),lobes=[];const n=Math.max(3,Math.round(w/(h*.7)));
 for(let i=0;i<n;i++){const u=n===1?.5:i/(n-1);const R=h*(.36+r()*.2)*(1-.3*Math.pow(Math.abs(u-.5)*2,2));lobes.push([-w/2+R*.6+u*(w-R*1.2),-R*.62-r()*h*.08,R]);}
 const top=Math.max(2,Math.round(n*.55)),off=(r()-.5)*w*.3;for(let i=0;i<top;i++){const u=top===1?.5:i/(top-1);const R=h*(.3+r()*.18);lobes.push([off-w*.22+u*w*.44+(r()-.5)*h*.2,-h*.62-R*.3-r()*h*.12,R]);}
 const m=h*.12+4;let x0=-w/2,x1=w/2,y0=-h*.3;for(const [cx,cy,R] of lobes){x0=Math.min(x0,cx-R*1.03);x1=Math.max(x1,cx+R*1.03);y0=Math.min(y0,cy-R*1.03);}
 const W=x1-x0+2*m,H=-y0+m+h*.1,k=canvas(W*q,H*q);if(!k)return null;const c=ctx2(k);c.scale(q,q);const x=m-x0,y=m-y0;
 for(const L of lobes){L[0]+=x;L[1]+=y;}
 const sil=(s,dx,dy)=>{c.beginPath();for(const [cx,cy,R] of lobes){c.moveTo(cx+dx+R*s,cy+dy);c.arc(cx+dx,cy+dy,R*s,0,TAU);}c.rect(x-w/2+h*.05,y-h*.3,w-h*.1,h*.3);};
 c.save();c.beginPath();c.rect(0,0,W,y+h*.05);c.clip();
 c.filter=`blur(${Math.max(1,h*.035)}px)`;c.fillStyle=rgb(pal.shade);sil(1.03,0,h*.05);c.fill();
 c.filter=`blur(${Math.max(.8,h*.02)}px)`;c.fillStyle=rgb(pal.base);sil(1,0,0);c.fill();
 c.save();sil(1,0,0);c.clip();c.fillStyle=rgb(pal.light);sil(.74,sunDir*h*.16,-h*.18);c.fill();c.filter='none';
 const g=c.createLinearGradient(0,y-h*.55,0,y+h*.04);g.addColorStop(0,rgb(pal.shade,0));g.addColorStop(1,rgb(pal.shade,.7));c.fillStyle=g;c.fillRect(0,y-h*.6,W,h*.7);c.restore();
 c.restore();return {img:k,w:W,h:H,base:y,cx:x};}
// A tree as a sprite: kinds round (broadleaf), poplar, pine (conifer), bare (winter), olive, palm. The sprite's foot is at its bottom centre.
 function treeSprite(kind,w,h,seed,pal,q=1,sunDir=-1){const W=w*1.3,H=h*1.12,k=canvas(W*q,H*q);if(!k)return null;const c=ctx2(k);c.scale(q,q);const x=W/2,y=H-1,r=rng(seed);
 const trunk=pal.trunk||[70,50,38];
 if(kind==='pine'){const tiers=5;c.fillStyle=rgb(trunk);c.fillRect(x-w*.04,y-h*.2,w*.08,h*.2);
  for(let i=0;i<tiers;i++){const t=i/tiers,yy=y-h*.12-t*h*.8,ww=w*(.5-.38*t)*(1+(r()-.5)*.15),hh=h*.32;
   const tri=[[x-ww,yy],[x-ww*.4,yy-hh*.55],[x,yy-hh],[x+ww*.4,yy-hh*.55],[x+ww,yy]];fill(c,smooth(tri,2),pal.shade);
   fill(c,smooth([[x+sunDir*ww*.9,yy-1],[x+sunDir*ww*.3,yy-hh*.6],[x,yy-hh*.92],[x-sunDir*ww*.05,yy-hh*.4],[x-sunDir*ww*.1,yy-2]],2),pal.base);
   if(pal.dab)for(let j=0;j<3;j++)dab(c,x+sunDir*ww*(.2+r()*.5),yy-hh*(.2+r()*.4),ww*.18,hh*.08,pal.light,.6);
   if(pal.snow)fill(c,smooth([[x-ww*.7,yy-hh*.12],[x,yy-hh*.95],[x+ww*.75,yy-hh*.15],[x+ww*.2,yy-hh*.3],[x-ww*.3,yy-hh*.22]],2),pal.snow,.9);}
  return {img:k,w:W,h:H};}
 if(kind==='poplar'){c.strokeStyle=rgb(trunk);c.lineWidth=Math.max(1,w*.08);c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h*.25);c.stroke();
  const pts=[];for(let i=0;i<=10;i++){const u=i/10;pts.push([x-w/2*Math.sin(u*Math.PI)*(1+(r()-.5)*.25),y-h*.08-u*h*.9]);}for(let i=10;i>=0;i--){const u=i/10;pts.push([x+w/2*Math.sin(u*Math.PI)*(1+(r()-.5)*.25),y-h*.08-u*h*.9]);}
  const s=smooth(pts,2,true);fill(c,s,pal.shade);c.save();path(c,s);c.clip();fill(c,s.map(p=>[p[0]+sunDir*w*.18,p[1]+h*.02]).map(p=>[x+(p[0]-x)*.75,p[1]]),pal.base);
  for(let j=0;j<6;j++)dab(c,x+sunDir*w*(.1+r()*.2),y-h*(.2+r()*.65),w*.16,h*.04,pal.light,.7);c.restore();
  if(pal.bare){c.clearRect(0,0,W,H);c.strokeStyle=rgb(trunk);c.lineCap='round';c.lineWidth=Math.max(1,w*.07);c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h);c.stroke();c.lineWidth=Math.max(.7,w*.03);
   for(let j=0;j<12;j++){const yy=y-h*(.2+j*.065),side=j%2?1:-1;c.beginPath();c.moveTo(x,yy);c.lineTo(x+side*w*(.25+r()*.2),yy-h*.12);c.stroke();}}
  return {img:k,w:W,h:H};}
 if(kind==='palm'){c.strokeStyle=rgb(trunk);c.lineCap='round';c.lineWidth=Math.max(1.4,w*.07);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+w*.15,y-h*.5,x+w*.05,y-h*.8);c.stroke();
  for(let j=0;j<7;j++){const a=-Math.PI/2+(j-3)*.5+(r()-.5)*.2,L=w*(.5+r()*.15);c.strokeStyle=rgb(j%2?pal.base:pal.shade);c.lineWidth=Math.max(1,w*.08);c.beginPath();c.moveTo(x+w*.05,y-h*.8);c.quadraticCurveTo(x+w*.05+Math.cos(a)*L*.6,y-h*.8+Math.sin(a)*L*.6-h*.08,x+w*.05+Math.cos(a)*L,y-h*.8+Math.sin(a)*L*.5+h*.12);c.stroke();}
  return {img:k,w:W,h:H};}
 // round broadleaf, olive (flatter, silver) and bare
 const flat=kind==='olive'?.75:1;
 if(kind==='bare'||pal.bare){c.strokeStyle=rgb(trunk);c.lineCap='round';const br=(x0,y0,a,L,wd,d)=>{const x1=x0+Math.cos(a)*L,y1=y0+Math.sin(a)*L;c.lineWidth=wd;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
   if(d>0){br(x1,y1,a-.45-r()*.25,L*.72,wd*.68,d-1);br(x1,y1,a+.4+r()*.25,L*.7,wd*.68,d-1);}};br(x,y,-Math.PI/2+(r()-.5)*.1,h*.36,Math.max(1,w*.08),4);
  if(pal.snow){for(let j=0;j<5;j++)dab(c,x+(r()-.5)*w*.6,y-h*(.45+r()*.4),w*.12,h*.03,pal.snow,.7);}return {img:k,w:W,h:H};}
 const N=Math.max(3,Math.round(w/(h*.5))),cs=[];
 for(let i=0;i<N;i++){const u=N===1?.5:i/(N-1);const R=h*(.26+r()*.16)*(1-.25*Math.pow(Math.abs(u-.5)*2,2));cs.push([x-w/2+R*.7+u*(w-R*1.4),y-h*.5*flat-(1-Math.abs(u-.5)*2)*h*.14+(r()-.5)*h*.1,R*(kind==='olive'?.85:1),10+i+seed]);}
 cs.push([x+(r()-.5)*w*.2,y-h*.78*flat,h*(.2+r()*.1),99+seed]);
 c.strokeStyle=rgb(trunk);c.lineWidth=Math.max(1.4,w*.07);c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x+(r()-.5)*w*.06,y-h*.5*flat);c.stroke();
 if(kind==='olive'){c.lineWidth=Math.max(1,w*.05);c.beginPath();c.moveTo(x,y-h*.2);c.lineTo(x-w*.2,y-h*.45);c.stroke();}
 const sil=(s,dx,dy)=>{c.beginPath();for(const [cx,cy,R,sd] of cs){const b=blob(cx+dx,cy+dy,R*s,sd,.14,14);c.moveTo(b[0][0],b[0][1]);for(const p of b)c.lineTo(p[0],p[1]);c.closePath();}};
 c.fillStyle=rgb(pal.shade);sil(1.03,0,h*.03);c.fill();
 c.save();sil(1,0,0);c.clip();c.fillStyle=rgb(pal.base);sil(.92,sunDir*w*.04,-h*.05);c.fill();c.fillStyle=rgb(pal.light);sil(.66,sunDir*w*.1,-h*.12);c.fill();
 if(pal.dab){for(const [cx,cy,R] of cs){const nd=2+Math.floor(r()*4);for(let i=0;i<nd;i++){const a=Math.PI*(sunDir<0?.9:.1)+(r()-.5)*1.4,d=R*(.3+r()*.5);c.globalAlpha=.4+r()*.5;c.fillStyle=rgb(pal.dab);ell(c,cx-Math.cos(a)*d*sunDir,cy-Math.abs(Math.sin(a))*d,R*(.06+r()*.12),R*(.04+r()*.06),(r()-.5)*1.2);c.fill();}}c.globalAlpha=1;}
 if(pal.blossom){for(let i=0;i<cs.length*7;i++){const [cx,cy,R]=cs[i%cs.length];c.fillStyle=rgb(r()<.5?pal.blossom:lighten(pal.blossom,.5));c.globalAlpha=.8;ell(c,cx+(r()-.5)*R*1.5,cy+(r()-.5)*R*1.3,R*.09,R*.07);c.fill();}c.globalAlpha=1;}
 if(pal.snow){c.fillStyle=rgb(pal.snow);for(const [cx,cy,R] of cs){c.globalAlpha=.85;ell(c,cx,cy-R*.62,R*.7,R*.25);c.fill();}c.globalAlpha=1;}
 c.restore();return {img:k,w:W,h:H};}
// Stamps a sprite with its foot at (x, y), at height h, on a strip that loops every TW pixels (it is drawn again across the seam).
 function stamp(c,sp,x,y,h,TW,o={}){if(!sp)return;const k=h/sp.h,w=sp.w*k,foot=o.foot===undefined?1:o.foot,x0=x-w/2,y0=y-h*foot;
 const put=xx=>c.drawImage(sp.img,xx,y0,w,h);put(x0);if(TW){if(x0+w>TW)put(x0-TW);if(x0<0)put(x0+TW);}}
// A ridge that loops: points over 0..TW (one beyond), heights from loop noise of two scales.
 function ridge(TW,base,amp,seed,n=24,sharp=1.4,sm=4){const pts=[];for(let i=0;i<=n;i++){const u=i/n,k=Math.pow(loopNoise(u,6,seed)*.62+loopNoise(u,17,seed+3)*.38,sharp);pts.push([u*TW,base-amp*(.12+k*1.3)]);}
 pts[n][1]=pts[0][1];return smooth(pts,sm);}
// A mountain range in gouache: the silhouette, a soft shadow face at each peak (away from the sun) with three strata, a light face, snow
// on the high peaks and haze at the foot.
 function mountains(c,rd,baseY,pal,o={}){const {sunDir=-1,snowAbove=null,haze=null,facets=true,seed=3}=o;const TWx=rd[rd.length-1][0];
 const poly=[...rd,[TWx,baseY],[0,baseY]];gouache(c,poly,pal.base,{seed,strokes:18,light:.08,dark:.06,long:.25});
 c.save();path(c,poly);c.clip();const r=rng(rd.length+Math.round(baseY)+seed);
 const peaks=[];for(let i=3;i<rd.length-3;i++){let ok=true;for(let d=-3;d<=3;d++)if(d&&rd[i+d][1]<rd[i][1]-.01)ok=false;if(ok&&baseY-rd[i][1]>22)peaks.push(i);}
 if(facets)for(const i of peaks){const p=rd[i],depth=baseY-p[1],span=Math.round(rd.length*(.02+r()*.025));
  const j=Math.min(rd.length-1,Math.max(0,i-sunDir*span)),q=rd[j],face=[p];for(let k=1;k<=4;k++){const t=k/4;face.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
  face.push([q[0]+(q[0]-p[0])*(.2+r()*.5),baseY+4],[p[0]+(q[0]-p[0])*(-.1+r()*.3)+(r()-.5)*depth*.2,baseY+4],[p[0]-(q[0]-p[0])*.08,p[1]+depth*.55]);
  const sf=smooth(face,3,true);tone(c,sf,pal.shade,.3+r()*.1);
  c.save();path(c,sf);c.clip();c.strokeStyle=rgb(pal.shade,.2);c.lineCap='round';for(let k=0;k<3;k++){c.lineWidth=2+r()*3;const y0=p[1]+depth*(.25+k*.22+r()*.1);c.beginPath();c.moveTo(p[0]-sunDir*depth*.1,y0);c.lineTo(q[0]+(q[0]-p[0])*.5,y0+depth*(.12+r()*.1));c.stroke();}c.restore();
  tone(c,smooth([p,[p[0]+sunDir*depth*(.35+r()*.3),p[1]+depth*(.4+r()*.2)],[p[0]+sunDir*depth*.25,baseY+4],[p[0]-sunDir*depth*.05,baseY+4]],3,true),pal.light,.16+r()*.08,'screen');
  if(snowAbove!==null&&p[1]<snowAbove){const w=8+(snowAbove-p[1])*(.45+r()*.3),cap=[[p[0],p[1]-2]];for(let k=0;k<=7;k++){const t=k/7,ang=Math.PI*(.15+t*.7);cap.push([p[0]+Math.cos(ang)*w*(1+(r()-.5)*.5),p[1]+Math.sin(ang)*w*(.55+(r()-.5)*.5)+(k%2)*w*.25]);}
   fill(c,smooth(cap,3,true),pal.snow||[250,250,255],.92);}}
 if(haze){const y0=bounds(rd).y,g=c.createLinearGradient(0,baseY-(baseY-y0)*1.1,0,baseY);g.addColorStop(0,rgb(haze[0],0));g.addColorStop(1,rgb(haze[0],haze[1]));c.fillStyle=g;c.fillRect(-10,y0-10,TWx+20,baseY-y0+20);}
 c.restore();}
// Houses and a bell tower (lit: windows lit). Windows are recorded in «lights» (if given) so that they can be lit at night over the sheet.
 function house(c,x,y,w,h,pal,o={}){const {roofK=.42,chimney=true,ln=null,sunDir=-1,lights=null,flat=false}=o;const rh=flat?h*.08:h*roofK;
 const wall=[[x-w/2,y],[x+w/2,y],[x+w/2,y-h+rh],[x-w/2,y-h+rh]];fill(c,wall,pal.wall);tone(c,sunDir<0?[[x,y],[x+w/2,y],[x+w/2,y-h+rh],[x,y-h+rh]]:[[x-w/2,y],[x,y],[x,y-h+rh],[x-w/2,y-h+rh]],[90,70,80],.18);
 if(flat){fill(c,[[x-w/2-1,y-h+rh],[x+w/2+1,y-h+rh],[x+w/2+1,y-h],[x-w/2-1,y-h]],pal.roof);}
 else{const roof=[[x-w/2-w*.08,y-h+rh],[x,y-h-rh*.1],[x+w/2+w*.08,y-h+rh]];fill(c,roof,pal.roof);tone(c,sunDir<0?[[x,y-h-rh*.1],[x+w/2+w*.08,y-h+rh],[x,y-h+rh]]:[[x-w/2-w*.08,y-h+rh],[x,y-h-rh*.1],[x,y-h+rh]],[60,30,40],.2);if(ln)line(c,roof,ln);
  if(chimney)fill(c,[[x+w*.2,y-h+rh*.3],[x+w*.32,y-h+rh*.3],[x+w*.32,y-h-rh*.25],[x+w*.2,y-h-rh*.25]],pal.chimney||pal.roof);}
 const ww=w*.16,wh=h*.16;c.fillStyle=rgb(pal.win||[70,80,110]);for(const wx of [x-w*.22,x+w*.22]){const wy=y-h*.45;c.fillRect(wx-ww/2,wy-wh/2,ww,wh);if(lights)lights.push([wx,wy,Math.max(ww,wh)]);}
 if(ln)line(c,wall,{...ln,close:true});}
 function tower(c,x,y,w,h,pal,o={}){const {ln=null,lights=null}=o;const body=[[x-w/2,y],[x+w/2,y],[x+w/2,y-h],[x-w/2,y-h]];fill(c,body,pal.wall);tone(c,[[x,y],[x+w/2,y],[x+w/2,y-h],[x,y-h]],[90,70,80],.18);
 const top=[[x-w*.62,y-h],[x,y-h-w*.9],[x+w*.62,y-h]];fill(c,top,pal.roof);c.fillStyle=rgb([50,50,70]);c.fillRect(x-w*.16,y-h*.82,w*.32,h*.2);if(lights)lights.push([x,y-h*.72,w*.3]);
 if(ln){line(c,body,{...ln,close:true});line(c,top,{...ln,close:true});}}
 function bird(c,x,y,s,phase,col=[50,40,40],w=1.4){c.save();c.strokeStyle=rgb(col);c.lineWidth=w;c.lineCap='round';const k=Math.sin(phase);c.beginPath();c.moveTo(x-s,y-k*s*.5);c.quadraticCurveTo(x-s*.45,y+k*s*.25,x,y);c.quadraticCurveTo(x+s*.45,y+k*s*.25,x+s,y-k*s*.5);c.stroke();c.restore();}
return {TAU,hash,noise,loopNoise,rng,rgb,mix,lighten,darken,smooth,path,bounds,blob,ell,fill,tone,dab,line,gouache,vgrad,canvas,ctx2,cumulusSprite,treeSprite,stamp,ridge,mountains,house,tower,bird};
})();
