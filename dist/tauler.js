// Scanning as a scene (0.16): in On anem? (EN04) and Detectius de sons (EN11) the options are no longer small cards under a scene in a
// window. The scene fills the stage and the options are large zones of it (doors of a station, instruments in a bandstand). The scanning
// engine is the same (scan-catalog.js, ScanClock); only the way it is drawn changes. Shared here: where the zones go, how the light of
// each zone follows the focus, the veil over what is not in focus, the contour of the focus with the time left drawn along it, and the
// opening of the chosen zone to the whole screen.
import {cpuSheet} from './carrega.js';
export const TL_BOARDS=Object.freeze(['destinations','sounds','sources','lights','pot','pinta','masia','encaix']);
export const tlBoard=id=>TL_BOARDS.includes(id)||typeof id==='string'&&id.startsWith('pp-');
// Height (CSS px) kept free at the bottom of the stage for the strip of commands.
export const TL_STRIP=66;
// Light of a zone out of focus, time of the fade between zones, and time the chosen zone takes to fill the screen.
export const TL_DIM=.6,TL_FADE=.25,TL_OPEN=1;
export const TL_TAU=Math.PI*2;
// The outline of an arch (a door) or of a rectangle with round corners, as a polygon.
export function tlArch(x,y,w,h,n=36){const r=w/2,pts=[[x,y+h],[x,y+r]];for(let i=1;i<n;i++){const a=Math.PI+i*Math.PI/n;pts.push([x+r+Math.cos(a)*r,y+r+Math.sin(a)*r]);}pts.push([x+w,y+r],[x+w,y+h]);return pts;}
export function tlRound(x,y,w,h,r,k=8){r=Math.min(r,w/2,h/2);const p=[];for(const [cx,cy,a0] of [[x+w-r,y+r,-Math.PI/2],[x+w-r,y+h-r,0],[x+r,y+h-r,Math.PI/2],[x+r,y+r,Math.PI]])for(let i=0;i<=k;i++){const a=a0+i*Math.PI/2/k;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return p;}
// The outline of a small temple front (a naiskos): a rectangle with a low pediment on top.
export function tlNaiskos(x,y,w,h){const ph=Math.min(w*.22,h*.2);return [[x,y+h],[x,y+ph],[x+w/2,y],[x+w,y+ph],[x+w,y+h]];}
// The zones of a board with n options on a stage of w × h CSS px. Each zone has its box (x, y, w, h), the outline used for the veil and
// the contour (pts) and, for the doors, the inner glass (inner). In a narrow stage (portrait) three or four options go in two rows.
export function tlLayout(id,n,w,h){const H=Math.max(1,h-TL_STRIP),cols=n>2&&w<H*1.05?2:n,rows=Math.ceil(n/cols),zones=[];
 if(id==='destinations'){const gap=Math.max(14,w*.034),top=Math.max(64,H*(rows>1?.12:.2)),bottom=H-Math.max(30,H*.12),rowH=(bottom-top-(rows-1)*gap)/rows;
  const dw=Math.min((w-gap*(cols+1))/cols/1.09,rowH*(n<=2?.78:.62)),dh=rowH,frame=Math.max(6,dw*.045),cw=dw+2*frame,x0=(w-cols*cw-(cols-1)*gap)/2;
  for(let i=0;i<n;i++){const c=i%cols,r=Math.floor(i/cols),x=x0+c*(cw+gap)+frame,y=top+r*(rowH+gap);zones.push({x:x-frame,y:y-frame,w:dw+2*frame,h:dh+frame,frame,inner:{x,y,w:dw,h:dh},kind:'arch',pts:tlArch(x-frame,y-frame,dw+2*frame,dh+frame),glass:tlArch(x,y,dw,dh)});}
  return zones;}
 // The sky of El meu espectacle de llum (0.18): tall windows over the place drawn at the bottom of the blackboard.
 if(id==='lights'){const gap=Math.max(14,w*.028),top=Math.max(24,H*.05),bottom=H*(rows>1?.74:.66),rowH=(bottom-top-(rows-1)*gap)/rows,zw=Math.min((w-gap*(cols+1))/cols,rowH*(n<=2?.9:.74)),x0=(w-cols*zw-(cols-1)*gap)/2,r=Math.min(22,zw*.07);
  for(let i=0;i<n;i++){const c=i%cols,rr=Math.floor(i/cols),x=x0+c*(zw+gap),y=top+rr*(rowH+gap);zones.push({x,y,w:zw,h:rowH,kind:'panel',radius:r,pts:tlRound(x,y,zw,rowH,r)});}
  return zones;}
 // La cassola d’en Glups (0.24; 0.27): the niches of the wall, over Glups and the cauldron, each one a small temple front (a pediment
 // over a rectangle). One niche alone («Un ingredient sorpresa») is wider.
 if(id==='pot'){const gap=Math.max(14,w*.026),top=Math.max(14,H*.03),bottom=H*(rows>1?.58:.48),rowH=(bottom-top-(rows-1)*gap)/rows,zw=Math.min((w-gap*(cols+1))/cols,rowH*(n<=1?1.3:n<=2?1.15:1)),x0=(w-cols*zw-(cols-1)*gap)/2,r=Math.min(22,zw*.08);
  for(let i=0;i<n;i++){const c=i%cols,rr=Math.floor(i/cols),x=x0+c*(zw+gap),y=top+rr*(rowH+gap);zones.push({x,y,w:zw,h:rowH,kind:'panel',radius:r,pts:tlNaiskos(x,y,zw,rowH)});}
  return zones;}
 // Detectius de sons (0.48): a row of niches in the lower half, under the large frame of the model (two columns on a tall screen, an odd last niche centred).
 if(id==='sounds'){const gap=Math.max(12,w*.022),top=H*(rows>1?.5:.62),bottom=H-Math.max(14,H*.03),rowH=(bottom-top-(rows-1)*gap)/rows,zw=Math.min((w-gap*(cols+1))/cols*.9,rowH*.8),x0=(w-cols*zw-(cols-1)*gap)/2,r=Math.min(20,zw*.08);
  for(let i=0;i<n;i++){const c=i%cols,rr=Math.floor(i/cols),inRow=Math.min(cols,n-rr*cols),x=x0+(cols-inRow)*(zw+gap)/2+c*(zw+gap),y=top+rr*(rowH+gap);zones.push({x,y,w:zw,h:rowH,kind:'panel',radius:r,pts:tlRound(x,y,zw,rowH,r)});}
  return zones;}
 // The panels of D'on ve aquest so? (0.18): rounded panels under the roof, its landscapes wide.
 const gap=Math.max(14,w*.03),top=Math.max(84,H*(rows>1?.14:.17)),bottom=H-Math.max(24,H*.05),rowH=(bottom-top-(rows-1)*gap)/rows,zw=Math.min((w-gap*(cols+1))/cols,rowH*(id==='sources'?(n<=2?1.15:.8):(n<=2?.95:.62))),x0=(w-cols*zw-(cols-1)*gap)/2,r=Math.min(26,zw*.08);
 for(let i=0;i<n;i++){const c=i%cols,rr=Math.floor(i/cols),x=x0+c*(zw+gap),y=top+rr*(rowH+gap);zones.push({x,y,w:zw,h:rowH,kind:'panel',radius:r,pts:tlRound(x,y,zw,rowH,r)});}
 return zones;}
// The light of each zone follows the focus with a fade of TL_FADE seconds (from TL_DIM to full light and back); no zone ever jumps.
// focus is the index of the zone in focus, or -1 when the focus is on a command or the scanning waits.
export function tlLights(prev,n,focus,dt){const out=[],step=(1-TL_DIM)/TL_FADE*Math.max(0,dt);for(let i=0;i<n;i++){const from=prev&&Number.isFinite(prev[i])?prev[i]:TL_DIM,to=i===focus?1:TL_DIM;out.push(from<to?Math.min(to,from+step):Math.max(to,from-step));}return out;}
function tlPath(c,pts){c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();}
// The veil: what is outside the zones keeps TL_DIM of its light; each zone keeps the light it has now.
export function tlVeil(c,w,h,zones,lights,extra=0){c.save();c.beginPath();c.rect(0,0,w,h);for(const z of zones){const p=z.pts;c.moveTo(p[0][0],p[0][1]);for(let i=p.length-1;i>0;i--)c.lineTo(p[i][0],p[i][1]);c.closePath();}
 c.fillStyle=`rgba(8,6,20,${Math.min(.92,1-TL_DIM+extra)})`;c.fill('evenodd');
 zones.forEach((z,i)=>{const a=Math.min(.92,1-(lights[i]??TL_DIM)+extra);if(a<=.003)return;c.beginPath();tlPath(c,z.pts);c.fillStyle=`rgba(8,6,20,${a})`;c.fill();});c.restore();}
// Points every few pixels along the outline, so the time drawn along the contour moves smoothly and starts at the top centre.
export function tlDensify(pts,step=6){const out=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],k=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let j=0;j<k;j++)out.push([a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k]);}return out;}
// The contour of the focus: thick and steady (it never blinks), with a dark edge so that it shows on light and dark scenes. Its look is
// the profile's (scanRing in input.js, 0.17): colour and thickness, and a relief (a shadow under it and a light along it). With the
// frame that draws itself, the time of the option fills it clockwise from the top over a pale track (progress from 0 to 1); the whole
// frame is complete from the start. In step-by-step scanning (progress null) the frame is always whole.
export const TL_RING=Object.freeze({frame:'progress',fill:'none',fillAlpha:.4,color:'#ffa21f',width:11,relief:false,edge:'#100c1ce6',track:'#fff6dc'});
// The colour layer of the focus (0.40): the inside of the zone in the colour of the highlight, semi-transparent; whole, or growing from
// the left edge of the zone to the right one with the time of the option over a pale track (in step-by-step scanning it is whole).
export function tlFill(c,P,progress,alpha,style){if(style.fill!=='whole'&&style.fill!=='grow')return;const a=alpha*(style.fillAlpha??.4);if(a<=0)return;
 c.save();c.fillStyle=style.color;const grow=style.fill==='grow'&&progress!==null;
 if(grow){c.globalAlpha=a*.3;c.beginPath();tlPath(c,P);c.fill();const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),u=Math.max(0,Math.min(1,progress));
  if(u>0){c.beginPath();c.rect(x0-1,y0-1,(x1-x0)*u+1,y1-y0+2);c.clip();c.globalAlpha=a;c.beginPath();tlPath(c,P);c.fill();}}
 else{c.globalAlpha=a;c.beginPath();tlPath(c,P);c.fill();}
 c.restore();}
export function tlRing(c,pts,progress=null,alpha=1,scale=1,style=TL_RING){if(alpha<=0)return;const P=tlDensify(pts),n=P.length,cx=P.reduce((m,p)=>m+p[0],0)/n;let s=0;
 for(let i=1;i<n;i++)if(P[i][1]<P[s][1]-.5||Math.abs(P[i][1]-P[s][1])<=.5&&Math.abs(P[i][0]-cx)<Math.abs(P[s][0]-cx))s=i;
 tlFill(c,P,progress,alpha,style);if(style.frame==='none')return;const W=style.width*scale,run=style.frame==='progress'&&progress!==null;
 // the part of the contour that is lit: all of it, or the time gone by from the top centre
 const lit=()=>{c.beginPath();if(!run){tlPath(c,P);return true;}if(!(progress>0))return false;let total=0;const seg=P.map((a,i)=>{const b=P[(i+1)%n],d=Math.hypot(b[0]-a[0],b[1]-a[1]);total+=d;return d;});let left=total*Math.min(1,progress);c.moveTo(P[s][0],P[s][1]);
  for(let k=0;k<n&&left>0;k++){const i=(s+k)%n,a=P[i],b=P[(i+1)%n],t=Math.min(1,left/(seg[i]||1));c.lineTo(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);left-=seg[i];}return true;};
 c.save();c.globalAlpha=alpha;c.lineJoin='round';c.lineCap='round';
 c.beginPath();tlPath(c,P);c.strokeStyle=style.edge;c.lineWidth=W+9*scale;if(style.relief){c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=9*scale;c.shadowOffsetX=3*scale;c.shadowOffsetY=5*scale;}c.stroke();
 c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetX=0;c.shadowOffsetY=0;
 if(run){c.strokeStyle=style.track;c.lineWidth=W;c.stroke();}
 if(lit()){c.strokeStyle=style.color;c.lineWidth=W;c.stroke();
  // the relief: a darker line on the lower side and a light one on the upper side of the stroke, as if it were a raised tube
  if(style.relief)for(const [d,col] of [[.17,'rgba(0,0,0,.28)'],[-.17,'rgba(255,255,255,.6)']]){c.save();c.translate(W*d,W*d);lit();c.strokeStyle=col;c.lineWidth=W*.3;c.stroke();c.restore();}}
 c.restore();}
const tlEase=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
// The chosen zone grows to fill the screen in TL_OPEN seconds: the box at time t (seconds since the choice) and its corner radius.
export function tlOpenBox(zone,w,h,t){const u=tlEase(t/TL_OPEN),b=zone.inner||zone;return {x:b.x*(1-u),y:b.y*(1-u),w:b.w+(w-b.w)*u,h:b.h+(h-b.h)*u,r:(zone.kind==='arch'?b.w/2:zone.radius||20)*(1-u),u};}
// Clips the drawing to the opening box (an arch for a door, a rounded rectangle for a panel).
export function tlClipOpen(c,zone,box){c.beginPath();if(zone.kind==='arch'&&box.u<1){const r=Math.min(box.r,box.w/2);c.moveTo(box.x,box.y+box.h);c.lineTo(box.x,box.y+r);c.arc(box.x+box.w/2,box.y+r,box.w/2,Math.PI,0,false);c.lineTo(box.x+box.w,box.y+box.h);c.closePath();}
 else{const r=Math.min(box.r,box.w/2,box.h/2);c.moveTo(box.x+r,box.y);c.arcTo(box.x+box.w,box.y,box.x+box.w,box.y+box.h,r);c.arcTo(box.x+box.w,box.y+box.h,box.x,box.y+box.h,r);c.arcTo(box.x,box.y+box.h,box.x,box.y,r);c.arcTo(box.x,box.y,box.x+box.w,box.y,r);c.closePath();}c.clip();}
// A small deterministic random generator for the art of the boards.
export function tlRng(seed){let a=seed>>>0||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// Static layers of a board (the hall, the doors, the bandstand) are painted once into a sheet the size of the canvas and copied each
// frame. Outside a browser (the tests) they are simply drawn. 0.41: painted with the processor and copied once (cpuSheet, carrega.js),
// as the sheets of the masia since 0.40.1.
const TL_SHEETS=new Map();
// 0.45: dx, dy shift the sheet on the screen (CSS pixels, for a board that slides away) and alpha fades it; the sheet itself is painted
// under the transform of the first call, so a caller shifts with these, never with a translate of the context.
export function tlSheet(c,key,paint,dx=0,dy=0,alpha=1){const cv=c.canvas;if(!cv||typeof document==='undefined'||typeof c.getTransform!=='function'){paint(c);return;}
 const full=key+'|'+cv.width+'x'+cv.height,m=c.getTransform();let sheet=TL_SHEETS.get(full);
 if(!sheet){sheet=cpuSheet(cv.width,cv.height,x=>{x.setTransform(m);paint(x);});TL_SHEETS.set(full,sheet);if(TL_SHEETS.size>8)TL_SHEETS.delete(TL_SHEETS.keys().next().value);}
 c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=alpha;c.globalCompositeOperation='source-over';c.drawImage(sheet,Math.round(dx*m.a),Math.round(dy*m.d));c.restore();}
// A fine grain of paper for the poster style: a small tile of speckles laid over the picture.
let TL_GRAIN=null;
export function tlGrain(c,x,y,w,h,alpha=.16){if(typeof document==='undefined'||typeof c.createPattern!=='function')return;if(!TL_GRAIN){const cv=document.createElement('canvas');cv.width=cv.height=160;const g=cv.getContext('2d'),r=tlRng(7);
  for(let i=0;i<5200;i++){const v=r()<.5?0:255;g.fillStyle=`rgba(${v},${v},${v},${.05+r()*.22})`;g.fillRect(Math.floor(r()*160),Math.floor(r()*160),1+(r()<.2?1:0),1);}TL_GRAIN=cv;}
 const p=c.createPattern(TL_GRAIN,'repeat');if(!p)return;c.save();c.globalAlpha=alpha;c.fillStyle=p;c.fillRect(x,y,w,h);c.restore();}
