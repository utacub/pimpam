// La cassola d'en Glups (EN23), 0.27: the drawing tools and the characters, shared by the board (cassola-art.js) and the scenes of the
// mythical creatures (cassola-mites.js). The look is that of a painted animation background with cut-out characters: smooth shapes,
// a dark warm outline of the same weight everywhere (it stays in every decor), two tones of colour on each part (light from the top
// left, a soft shadow on the bottom right) and a small highlight. The shapes are written as SVG paths in their own units and drawn by
// grPath, so the same path can be filled, shaded and outlined.
import {escScale} from './escenari.js';
export const GR_PI=Math.PI,GR_TAU=Math.PI*2;
export const GR_INK='#2a1810';
export const grClamp=x=>Math.max(0,Math.min(1,x));
export const grSmooth=u=>{u=grClamp(u);return u*u*(3-2*u);};
export const grOut=u=>{u=grClamp(u);return 1-(1-u)*(1-u)*(1-u);};
export const grIn=u=>{u=grClamp(u);return u*u*u;};
// An ease with a small overshoot (a bounce into place).
export const grBack=u=>{u=grClamp(u);const s=1.7;return 1+(s+1)*Math.pow(u-1,3)+s*Math.pow(u-1,2);};
export const grLerp=(a,b,t)=>a+(b-a)*t;
// The part of [a, b] where t is, from 0 to 1.
export const grSpan=(t,a,b)=>grClamp((t-a)/(b-a));
// Up and down once over [a, b] (0 → 1 → 0), smooth.
export const grBump=(t,a,b)=>{const u=grSpan(t,a,b);return u<=0||u>=1?0:Math.sin(GR_PI*u);};
export const grHex=h=>{const n=parseInt(h.slice(1,7),16);return [n>>16&255,n>>8&255,n&255];};
export const grMix=(a,b,t)=>{const A=grHex(a),B=grHex(b),k=grClamp(t);return '#'+A.map((x,i)=>Math.round(x+(B[i]-x)*k).toString(16).padStart(2,'0')).join('');};
export const grShade=(h,k)=>k>0?grMix(h,'#fff8ec',k):grMix(h,'#1c1020',-k);
export const grRgba=(h,a)=>{const [r,g,b]=grHex(h);return `rgba(${r},${g},${b},${Math.max(0,Math.min(1,a)).toFixed(3)})`;};
export const grRand=(i,s)=>{let h=(Math.imul(i|0,374761393)+Math.imul(s|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
// ── Paths ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// An SVG path (M L H V C S Q T Z, absolute and relative) parsed once into a list of commands.
const GR_PATHS=new Map();
export function grParse(d){let out=GR_PATHS.get(d);if(out)return out;out=[];const toks=[],re=/([MmLlHhVvCcSsQqTtZz])|(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/g;let m;while((m=re.exec(d)))toks.push(m[1]||+m[2]);
 let i=0,cmd='M',x=0,y=0,sx=0,sy=0,lc=null,lq=null;const n=()=>toks[i++];
 while(i<toks.length){if(typeof toks[i]==='string'){cmd=toks[i++];if(cmd==='Z'||cmd==='z'){out.push(['Z']);x=sx;y=sy;lc=lq=null;continue;}}
  if(typeof toks[i]!=='number'){i++;continue;}
  const rel=cmd>='a',C=cmd.toUpperCase();
  if(C==='M'){let a=n(),b=n();if(rel){a+=x;b+=y;}x=sx=a;y=sy=b;out.push(['M',x,y]);cmd=rel?'l':'L';lc=lq=null;}
  else if(C==='L'){let a=n(),b=n();if(rel){a+=x;b+=y;}x=a;y=b;out.push(['L',x,y]);lc=lq=null;}
  else if(C==='H'){let a=n();if(rel)a+=x;x=a;out.push(['L',x,y]);lc=lq=null;}
  else if(C==='V'){let b=n();if(rel)b+=y;y=b;out.push(['L',x,y]);lc=lq=null;}
  else if(C==='C'){let a=n(),b=n(),c1=n(),d1=n(),e=n(),f=n();if(rel){a+=x;b+=y;c1+=x;d1+=y;e+=x;f+=y;}out.push(['C',a,b,c1,d1,e,f]);lc=[c1,d1];lq=null;x=e;y=f;}
  else if(C==='S'){let c1=n(),d1=n(),e=n(),f=n();if(rel){c1+=x;d1+=y;e+=x;f+=y;}const a=lc?2*x-lc[0]:x,b=lc?2*y-lc[1]:y;out.push(['C',a,b,c1,d1,e,f]);lc=[c1,d1];lq=null;x=e;y=f;}
  else if(C==='Q'){let a=n(),b=n(),e=n(),f=n();if(rel){a+=x;b+=y;e+=x;f+=y;}out.push(['Q',a,b,e,f]);lq=[a,b];lc=null;x=e;y=f;}
  else if(C==='T'){let e=n(),f=n();if(rel){e+=x;f+=y;}const a=lq?2*x-lq[0]:x,b=lq?2*y-lq[1]:y;out.push(['Q',a,b,e,f]);lq=[a,b];lc=null;x=e;y=f;}
  else i++;}
 // a path built anew each frame (a moving arm) would fill the cache: it is emptied when it grows too big
 if(GR_PATHS.size>3000)GR_PATHS.clear();GR_PATHS.set(d,out);return out;}
// Adds a path to the current one: an SVG string, a list of points (a closed polygon) or a parsed list. A function of the context is
// called as it is (an ellipse, an arc).
export function grPath(c,d){if(!d)return;if(typeof d==='function'){d(c);return;}
 if(Array.isArray(d)&&Array.isArray(d[0])&&typeof d[0][0]==='number'){c.moveTo(d[0][0],d[0][1]);for(let i=1;i<d.length;i++)c.lineTo(d[i][0],d[i][1]);c.closePath();return;}
 const P=typeof d==='string'?grParse(d):d;for(const p of P){const k=p[0];if(k==='M')c.moveTo(p[1],p[2]);else if(k==='L')c.lineTo(p[1],p[2]);else if(k==='C')c.bezierCurveTo(p[1],p[2],p[3],p[4],p[5],p[6]);else if(k==='Q')c.quadraticCurveTo(p[1],p[2],p[3],p[4]);else c.closePath();}}
export const grEll=(x,y,rx,ry,rot=0)=>c=>{c.moveTo(x+rx*Math.cos(rot),y+rx*Math.sin(rot));c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot,0,GR_TAU);};
// The width of the outline in the current units: w units, but never under min device pixels.
export function grLW(c,w,min=1.6){return Math.max(w,min/(escScale(c)||1));}
// A part: the shape filled (a colour or a gradient), then, clipped to it, its shadows and lights ([path, colour] pairs; a colour may
// carry its alpha), then the outline. o.lw: the outline width in units (0 for none); o.alpha: the whole part.
export function grPart(c,d,fill,o={}){c.beginPath();grPath(c,d);if(fill){c.fillStyle=fill;c.fill(o.rule||'nonzero');}
 const tones=o.tones;if(tones&&tones.length){c.save();c.clip(o.rule||'nonzero');for(const [sd,col] of tones){c.beginPath();grPath(c,sd);c.fillStyle=col;c.fill();}c.restore();}
 if(o.lw!==0){c.beginPath();grPath(c,d);c.strokeStyle=o.ink||GR_INK;c.lineWidth=grLW(c,o.lw??8);c.lineJoin='round';c.lineCap='round';c.stroke();}}
// A line (open path) with the ink: lw units wide; col: its colour (the ink by default).
export function grLine(c,d,lw=8,col=GR_INK,cap='round'){c.beginPath();grPath(c,d);c.strokeStyle=col;c.lineWidth=grLW(c,lw);c.lineJoin='round';c.lineCap=cap;c.stroke();}
// A tube: a line of colour col, w units wide, with the outline around it (a limb, a rope, a handle, a neck).
export function grTube(c,d,w,col,lw=8,cap='round'){grLine(c,d,w+2*lw,GR_INK,cap);grLine(c,d,w,col,cap);}
// A linear gradient from top to bottom of [y0, y1] through the given colours.
export function grVGrad(c,y0,y1,cols,x=0){const g=c.createLinearGradient(x,y0,x,y1);cols.forEach((col,i)=>g.addColorStop(i/Math.max(1,cols.length-1),col));return g;}
export function grRGrad(c,x,y,r,cols,x0=x,y0=y,r0=0){const g=c.createRadialGradient(x0,y0,r0,x,y,Math.max(.01,r));cols.forEach((col,i)=>g.addColorStop(i/Math.max(1,cols.length-1),col));return g;}
// A soft round glow (light, a blush), drawn with a radial gradient.
export function grGlow(c,x,y,r,col,a=1){if(a<=.003||r<=0)return;c.fillStyle=grRGrad(c,x,y,r,[grRgba(col,a),grRgba(col,a*.5),grRgba(col,0)]);c.beginPath();c.arc(x,y,r,0,GR_TAU);c.fill();}
// A soft shadow on the ground (an ellipse that fades out at its edge).
export function grShadow(c,x,y,rx,ry,a=.28){if(rx<=0||ry<=0)return;c.save();c.translate(x,y);c.scale(1,ry/rx);c.fillStyle=grRGrad(c,0,0,rx,[`rgba(40,20,30,${a})`,`rgba(40,20,30,${a*.6})`,'rgba(40,20,30,0)']);c.beginPath();c.arc(0,0,rx,0,GR_TAU);c.fill();c.restore();}
// Points along a closed outline of bumps (curls of hair, a cloud, a beard): from angle a0 to a1 of an ellipse, n bumps of depth k.
export function grCurls(x,y,rx,ry,a0,a1,n,k=.18,close=true){let d='';const step=(a1-a0)/n,pt=(a,r)=>[x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r];
 for(let i=0;i<n;i++){const a=a0+i*step,b=a+step,[ax,ay]=pt(a,1),[bx,by]=pt(b,1),[c1x,c1y]=pt(a+step*.1,1+k*1.35),[c2x,c2y]=pt(b-step*.1,1+k*1.35);
  d+=(i===0?`M${ax.toFixed(1)} ${ay.toFixed(1)}`:'')+`C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;}
 return close?d+'Z':d;}
// A leaf (olive, laurel): from (x, y) along angle a, length L and width W.
export function grLeaf(x,y,a,L,W){const ca=Math.cos(a),sa=Math.sin(a),p=(u,v)=>[x+ca*u-sa*v,y+sa*u+ca*v],[ax,ay]=p(L,0),[b1x,b1y]=p(L*.35,W),[b2x,b2y]=p(L*.75,W*.6),[c1x,c1y]=p(L*.75,-W*.6),[c2x,c2y]=p(L*.35,-W);
 return `M${x.toFixed(1)} ${y.toFixed(1)}C${b1x.toFixed(1)} ${b1y.toFixed(1)} ${b2x.toFixed(1)} ${b2y.toFixed(1)} ${ax.toFixed(1)} ${ay.toFixed(1)}C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}Z`;}
// Draws in the units of a character: origin at (x, y), s screen units per unit, mirrored when flip < 0, turned by rot.
export function grAt(c,x,y,s,flip=1,rot=0,draw){c.save();c.translate(x,y);if(rot)c.rotate(rot);c.scale(s*(flip<0?-1:1),s);draw(c);c.restore();}
// ── Glups ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ── Glups ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A cook of ancient Greece: round and cheerful, with a beard of little spiral curls, a curled moustache, a big nose, an olive
// wreath, a white chiton pinned on the shoulder, a blue apron and laced sandals. He is drawn three quarters to the left (towards the
// cauldron), in units where his feet are at y = 0 and the top of his head at about y = −1000. Turned this way, his left side is the
// near one: his left shoulder and arm are in front of the body, and his right arm (the one that stirs) is partly hidden behind it.
export const GR_SKIN='#e3a77a',GR_HAIR='#2c2233',GR_CLOTH='#f3ead8',GR_APRON='#3474b4',GR_BORDER='#c2552f',GR_LEAF='#6e9a3c',GR_LEATHER='#8c5530';
const GR_HEAD={x:-20,y:-812,rx:168,ry:172},GR_CURL='#64587c',GR_LIP='#d97a6c',GR_MOUTH='#5e1c22',GR_GOLD='#e6b440';
// The shoulders, in his units: the far one (his right, towards the cauldron, behind the chest) and the near one (his left).
export const GR_SHOULDER={far:[-168,-608],near:[194,-604]};
// Where the arms go at rest (elbow and wrist of each arm): the right hand hangs by the belly and the left one rests on it.
export const GR_ARMS_REST={far:[[-344,-470],[-340,-372]],near:[[302,-462],[132,-432]]};
// ── Curves ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Points along a smooth curve through pts (Catmull-Rom), n points per span.
export function grSpline(pts,n=6){const L=pts.length,P=i=>pts[Math.max(0,Math.min(L-1,i))],out=[];
 for(let i=0;i<L-1;i++){const p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2);
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t,f=j=>.5*(2*p1[j]+(p2[j]-p0[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(3*p1[j]-p0[j]-3*p2[j]+p3[j])*t3);out.push([f(0),f(1)]);}}
 out.push([P(L-1)[0],P(L-1)[1]]);return out;}
// A tapered stroke along a smooth curve through pts, from w0 units wide to w1 (bulge: how much wider it gets in the middle), as a
// closed outline (a list of points).
export function grTaper(pts,w0,w1,n=6,bulge=0){const P=grSpline(pts,n),L=P.length,a=[],b=[];
 for(let i=0;i<L;i++){const p=P[Math.max(0,i-1)],q=P[Math.min(L-1,i+1)],dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy)||1,u=i/(L-1),w=grLerp(w0,w1,u)*(1+bulge*Math.sin(GR_PI*u))/2;
  a.push([P[i][0]-dy/d*w,P[i][1]+dx/d*w]);b.push([P[i][0]+dy/d*w,P[i][1]-dx/d*w]);}
 return a.concat(b.reverse());}
// An open line through the points, as a path.
export const grPoly=pts=>c=>{c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);};
// Little spiral curls (a beard, hair) as one path: each [x, y, r, a] (centre, radius, angle where it starts), turning inwards.
const grSpirals=list=>c=>{for(const [x,y,r,a] of list)for(let i=0;i<=9;i++){const u=i/9,g=a+u*GR_PI*1.7,rr=r*(1-.62*u),px=x+Math.cos(g)*rr,py=y+Math.sin(g)*rr;if(i)c.lineTo(px,py);else c.moveTo(px,py);}};
// ── Hands and arms ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// A hand at the wrist (x, y), pointing along angle a (from the elbow to the wrist). kind: 'grip' (a fist round a handle), 'open' (the
// palm, fingers spread), 'rest' (fingers loosely curled) or 'flat' (laid on the belly, fingers together).
function grHandAt(c,x,y,a,kind,col){c.save();c.translate(x,y);c.rotate(a);if(Math.cos(a)<0)c.scale(1,-1);
 const f=(pts,w)=>grTube(c,grPoly(pts),w,col,6),dark=grShade(col,-.12);
 // the fingers first, each one outlined, then the palm over their roots and the thumb on top
 if(kind==='grip'){grPart(c,grEll(28,0,34,32),col,{lw:6.5});for(let i=0;i<4;i++)f([[46,-22+i*15],[58,-20+i*15]],16);f([[14,-26],[42,-32],[56,-20]],18);}
 else if(kind==='open'){for(let i=3;i>=0;i--){const g=-.6+i*.4,L=[40,48,46,36][i];f([[36+Math.cos(g)*16,Math.sin(g)*20],[36+Math.cos(g)*(16+L),Math.sin(g)*(20+L*.8)]],18);}
  grPart(c,grEll(28,0,32,30),col,{tones:[[grEll(34,8,20,14),grRgba(dark,.5)]],lw:6.5});f([[18,-22],[30,-52],[28,-68]],19);}
 else if(kind==='flat'){for(let i=3;i>=0;i--){const L=[50,58,56,44][i];f([[28,-18+i*12],[28+L,-24+i*16]],17);}
  grPart(c,grEll(18,2,24,24),col,{tones:[[grEll(20,14,24,12),grRgba(dark,.45)]],lw:6.5});grLine(c,c=>{for(let i=0;i<3;i++){c.moveTo(42,-14+i*12);c.quadraticCurveTo(48,-10+i*12,52,-14+i*12);}},3.5,grRgba(GR_INK,.4));f([[12,-24],[36,-36],[52,-32]],18);}
 else{for(let i=3;i>=0;i--)f([[44,-18+i*13],[60,-14+i*13],[58,0+i*11]],15);grPart(c,grEll(26,0,31,29),col,{lw:6.5});f([[14,-24],[40,-34],[52,-24]],17);}
 c.restore();}
// The short sleeve of the chiton over a shoulder (s), along the upper arm towards e; near: with the gold pin of the chiton on top.
function grSleeve(c,s,e,near){const a=Math.atan2(e[1]-s[1],e[0]-s[0]),ca=Math.cos(a),sa=Math.sin(a),f=Math.cos(a)<0?-1:1,p=(u,v)=>[s[0]+ca*u-sa*v*f,s[1]+sa*u+ca*v*f];
 const W=62,L=84,pts=[[-46,-W*.9],[-6,-W*1.18],[L*.62,-W*1.12],[L+4,-W*.82],[L+12,-W*.2],[L+10,W*.5],[L,W*.9],[L*.6,W*1.16],[0,W*1.14],[-46,W*.9]],out=grSpline(pts,4).map(([u,v])=>p(u,v));
 const cloth=near?GR_CLOTH:grShade(GR_CLOTH,-.12),cuff=[[L-6,-W*2],[L+40,-W*2],[L+40,W*2],[L-6,W*2]].map(([u,v])=>p(u,v));
 grPart(c,out,cloth,{tones:[[cuff,GR_BORDER],[[p(-60,W*.3),p(L+40,W*.3),p(L+40,W*2),p(-60,W*2)],grRgba('#b9a682',.4)],[grPoly([p(L-10,-W*2),p(L-2,-W*2),p(L-2,W*2),p(L-10,W*2)]),grRgba(grShade(GR_BORDER,-.4),.8)]],lw:7});
 grLine(c,c=>{for(const v of [-.35,.25]){const [x0,y0]=p(4,W*v),[x1,y1]=p(L*.55,W*(v+.12)),[x2,y2]=p(L-20,W*(v+.05));c.moveTo(x0,y0);c.quadraticCurveTo(x1,y1,x2,y2);}},4.5,grRgba('#a8926c',.7));
 if(near){const [gx,gy]=p(-14,-W*.55);grPart(c,grEll(gx,gy,17,17),GR_GOLD,{tones:[[grEll(gx+5,gy+6,12,10),grRgba('#a8741e',.6)],[grEll(gx-5,gy-5,5,5),'#fff4c8']],lw:6});}}
// An arm: the upper arm from the shoulder s to the elbow e and the forearm to the wrist h, outlined as one, with the sleeve over the
// shoulder. far: the far arm (in the shadow of the body). bare: without the sleeve; shade: the shadow along the forearm.
function grArm(c,s,e,h,far,bare=false,shade=true){const sk=far?grShade(GR_SKIN,-.13):GR_SKIN;
 grUnion(c,[{line:grPoly([s,e]),w:88},{line:grPoly([e,h]),w:72}],sk,{lw:7});if(shade)grArmShade(c,e,h,sk);if(!bare)grSleeve(c,s,e,!far);}
// The shadow along the underside of a forearm (elbow e, wrist h).
function grArmShade(c,e,h,sk){const a=Math.atan2(h[1]-e[1],h[0]-e[0]),nx=-Math.sin(a),ny=Math.cos(a),k=(Math.cos(a)<0?-1:1)*20;grLine(c,grPoly([[e[0]+nx*k,e[1]+ny*k],[h[0]+nx*k*.9,h[1]+ny*k*.9]]),24,grRgba(grShade(sk,-.4),.22));}
// ── The face ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The eyes, the brows and the cheeks. P: look [x, y] (−1 to 1), lid (0 open, 1 closed), brows (−1 frown to 1 raised), cheeks (0 to 1).
function grFace(c,P){const look=P.look||[0,0],lid=grClamp(P.lid??0),br=P.brows||0;
 grGlow(c,10,-770,64,'#ff7d6e',.3+.32*(P.cheeks||0));grGlow(c,-178,-772,34,'#ff7d6e',.2+.22*(P.cheeks||0));
 // the far eye (by the nose) is a little smaller; the upper lid has a thick line, and the lid comes down over the eye when it shuts
 for(const [ex,ey,rx,ry] of [[-128,-856,23,31],[-44,-858,29,38]]){grPart(c,grEll(ex,ey,rx,ry),'#fffdf6',{lw:6});
  const px=ex+look[0]*rx*.42,py=ey+look[1]*ry*.36+4;c.save();c.beginPath();grPath(c,grEll(ex,ey,rx,ry));c.clip();
  c.fillStyle='#4a2c1e';c.beginPath();c.arc(px,py,rx*.62,0,GR_TAU);c.fill();c.fillStyle='#1e1216';c.beginPath();c.arc(px,py,rx*.36,0,GR_TAU);c.fill();
  c.fillStyle='#fff';c.beginPath();c.arc(px-rx*.22,py-rx*.28,rx*.2,0,GR_TAU);c.fill();
  const ly=ey-ry+(2*ry+4)*lid;if(lid>0){c.fillStyle=GR_SKIN;c.fillRect(ex-rx-4,ey-ry-6,2*rx+8,ly-(ey-ry-6));}c.restore();
  if(lid>.02)grLine(c,c=>{c.moveTo(ex-rx-3,ly);c.quadraticCurveTo(ex,ly+6*(1-lid),ex+rx+3,ly);},7);
  else grLine(c,c=>{c.ellipse(ex,ey,rx+1,ry+1,0,GR_PI*1.1,GR_PI*1.9);},9);}
 // the brows: thick and black, raised or frowning
 for(const [bx,by,L,k] of [[-132,-906,62,1],[-42,-914,78,-1]]){const lift=-br*20,tw=br<0?-br*.25*k:0;c.save();c.translate(bx,by+lift);c.rotate(tw);
  grPart(c,c=>{c.moveTo(-L/2,6);c.bezierCurveTo(-L/3,-16,L/3,-20,L/2,-2);c.bezierCurveTo(L/3,-6,-L/3,-4,-L/2,6);},GR_HAIR,{lw:5});c.restore();}}
// The nose: big and round, a little redder than the face.
function grNose(c){grPart(c,'M-112 -846C-150 -856 -206 -836 -210 -792C-213 -750 -176 -738 -146 -748C-124 -756 -108 -776 -108 -802Z',grMix(GR_SKIN,'#e07a62',.3),{tones:[['M-150 -760C-120 -770 -104 -790 -104 -812L-90 -812L-90 -740L-160 -740Z',grRgba('#a35a40',.35)]],lw:7});
 grGlow(c,-176,-812,16,'#fff4e0',.7);grLine(c,'M-170 -760Q-150 -752 -134 -762',5,grRgba(GR_INK,.7));}
// How far the jaw drops with each mouth (units): the chin and the beard go down with it.
const GR_JAW={smile:6,smileShut:3,grin:14,open:34,o:24,blow:6,chew:5,flat:0};
// The mouth, under the moustache: 'smile' (closed), 'grin' (open, with the teeth), 'open', 'o', 'blow' (a little o), 'chew' or 'flat'.
// j: the jaw (units). The beard, drawn after it, covers its lower edge, and the moustache its upper one.
function grMouth(c,m,j){const yb=-704+j;
 if(m==='smileShut'||m==='chew'||m==='flat'){
  if(m!=='flat')grPart(c,c=>{c.moveTo(-152,-714+j);c.quadraticCurveTo(-122,-690+j,-90,-714+j);c.quadraticCurveTo(-122,-704+j,-152,-714+j);},GR_LIP,{lw:5});
  grLine(c,m==='smileShut'?c=>{c.moveTo(-182,-744);c.quadraticCurveTo(-124,-704+j,-58,-746);}:m==='chew'?c=>{c.moveTo(-166,-730);c.quadraticCurveTo(-146,-716,-124,-726);c.quadraticCurveTo(-102,-736,-80,-724);}:c=>{c.moveTo(-168,-726);c.quadraticCurveTo(-140,-720,-120,-726);c.quadraticCurveTo(-98,-732,-74,-724);},8);return;}
 const hole=m==='o'||m==='blow'?(()=>{const rx=m==='blow'?13:21+j*.12,ry=m==='blow'?12:12+j*.5,cy=m==='blow'?-716:-724+ry;return grEll(m==='blow'?-136:-124,cy,rx,ry);})()
  :m==='smile'?c=>{c.moveTo(-178,-744);c.quadraticCurveTo(-122,-734,-62,-748);c.quadraticCurveTo(-94,yb+2,-124,yb+2);c.quadraticCurveTo(-158,yb+2,-178,-744);c.closePath();}
  :m==='open'?c=>{c.moveTo(-172,-742);c.quadraticCurveTo(-122,-732,-70,-744);c.bezierCurveTo(-70,yb-6,-96,yb+16,-122,yb+16);c.bezierCurveTo(-148,yb+16,-172,yb-6,-172,-742);c.closePath();}
  :c=>{c.moveTo(-184,-742);c.quadraticCurveTo(-122,-730,-58,-746);c.quadraticCurveTo(-92,yb+8,-124,yb+8);c.quadraticCurveTo(-160,yb+8,-184,-742);c.closePath();};
 grPart(c,hole,GR_MOUTH,{tones:[[c=>{c.rect(-200,-770,160,m==='o'||m==='blow'?24:46);},m==='o'||m==='blow'?GR_MOUTH:'#fffdf6'],[grEll(-112,yb+18,46,22),'#e2686a']],lw:6});
 if(m!=='blow')grPart(c,c=>{c.moveTo(-150,yb+4+(m==='o'?14:0));c.quadraticCurveTo(-122,yb+24+(m==='o'?14:0),-94,yb+4+(m==='o'?14:0));c.quadraticCurveTo(-122,yb+13+(m==='o'?14:0),-150,yb+4+(m==='o'?14:0));},GR_LIP,{lw:5});}
// The beard, round the jaw from the sideburn in front of the ear to the far cheek: [x, y, w], w how much the point goes down with
// the jaw. Its outside is a row of curls; inside, little spiral curls in rows, as on the beards of the old Greek statues.
const GR_BEARD_OUT=[[92,-862,0],[120,-800,.05],[121,-738,.15],[99,-672,.35],[55,-618,.6],[-12,-583,.85],[-92,-570,1],[-162,-588,1],[-216,-630,.92],[-243,-680,.72],[-238,-716,.55]];
const GR_BEARD_IN=[[-210,-716,.6],[-182,-702,.88],[-150,-694,1],[-104,-692,1],[-62,-702,.9],[-26,-720,.62],[18,-748,.36],[54,-790,.16],[72,-838,.03]];
function grBeard(c,j){const O=grSpline(GR_BEARD_OUT.map(([x,y,w])=>[x,y+j*w]),3),I=grSpline(GR_BEARD_IN.map(([x,y,w])=>[x,y+j*w]),3);
 const bump=(c,[ax,ay],[bx,by],k)=>{const nx=by-ay,ny=ax-bx,d=Math.hypot(nx,ny)||1;c.quadraticCurveTo((ax+bx)/2+nx/d*k,(ay+by)/2+ny/d*k,bx,by);};
 const path=c=>{c.moveTo(O[0][0],O[0][1]);for(let i=1;i<O.length;i++)bump(c,O[i-1],O[i],6);c.lineTo(I[0][0],I[0][1]);for(let i=1;i<I.length;i++)bump(c,I[i-1],I[i],i%2?6:3);c.closePath();};
 grPart(c,path,GR_HAIR,{tones:[[grEll(-70,-560+j,210,64),grRgba('#140c18',.5)]],lw:7});
 // the curls, in rows from the mouth down (each row over the one above it), evenly spaced along each row; the last row makes the
 // curly edge. A row only goes where the beard is thick enough for it.
 const N=O.length,M=I.length,at=(f,v)=>{const o=O[Math.round(f*(N-1))],i=I[M-1-Math.round(f*(M-1))];return [grLerp(i[0],o[0],v),grLerp(i[1],o[1],v),Math.hypot(o[0]-i[0],o[1]-i[1])];};
 [[.34,16,70],[.66,17,40],[.94,17,0]].forEach(([v,r,need],row)=>{const list=[];let last=null,acc=0;
  for(let k=0;k<=80;k++){const f=.02+.96*k/80,[x,y,th]=at(f,v);if(last)acc+=Math.hypot(x-last[0],y-last[1]);last=[x,y];
   if(th<need){acc=r*1.2;continue;}if(acc>=r*1.75||!list.length&&acc>=r*.9){list.push([x,y,r]);acc=0;}}
  c.beginPath();for(const [x,y,rr] of list){c.moveTo(x+rr,y);c.arc(x,y,rr,0,GR_TAU);}c.fillStyle=grShade(GR_HAIR,.02+.02*row);c.fill();if(row===2){c.strokeStyle=grRgba(GR_INK,.85);c.lineWidth=grLW(c,5);c.stroke();}
  grLine(c,grSpirals(list.map(([x,y,rr],k)=>[x,y,rr*.62,-GR_PI*.6+k*.9])),4.5,grRgba(GR_CURL,row===2?.9:.7));});}
// The moustache: two curled lobes from under the nose, the near one (to the right) longer. up: how much the ends lift.
function grMoustache(c,up=0){const far=grTaper([[-126,-756],[-160,-746],[-192,-744],[-214,-756-up*.5],[-216,-774-up],[-202,-780-up]],34,6,5,.3),
 near=grTaper([[-152,-758],[-112,-746],[-76,-744],[-52,-754-up*.5],[-46,-772-up],[-58,-780-up]],36,6,5,.3);
 grUnion(c,[{d:far},{d:near}],GR_HAIR,{lw:6,tones:[[grEll(-134,-768,96,16),grRgba('#5a4f6e',.6)]]});
 grLine(c,c=>{c.moveTo(-146,-760);c.quadraticCurveTo(-180,-758,-204,-764-up);c.moveTo(-128,-760);c.quadraticCurveTo(-90,-760,-64,-766-up);},4,grRgba(GR_CURL,.9));}
// The hair: curls on the top and the back of the head, and the olive wreath over them.
function grHair(c){const H=GR_HEAD;grPart(c,grCurls(H.x+6,H.y-14,H.rx+18,H.ry+10,-GR_PI*1.02,GR_PI*.2,10,.12,false)+`C150 -720 150 -760 132 -790C110 -840 60 -880 -10 -900C-80 -918 -150 -900 -184 -870Z`,GR_HAIR,{tones:[['M-40 -1000C40 -990 140 -930 180 -840L220 -840L220 -1010Z',grRgba('#5a4f6e',.45)]],lw:7});
 grLine(c,grSpirals([[150,-842,15,0],[160,-886,14,.8],[124,-924,14,1.6],[-150,-938,13,2.2],[-60,-980,13,1]]),5,grRgba(GR_CURL,.95));}
function grWreath(c,t=0){const pts=[];for(let i=0;i<=10;i++){const u=i/10,x=grLerp(-190,170,u),y=-905-Math.sin(u*GR_PI)*52+u*40;pts.push([x,y]);}
 grLine(c,'M-190 -905Q-10 -1000 170 -865',10,'#4f6e2a');
 pts.forEach(([x,y],i)=>{if(i===10)return;const [nx,ny]=pts[i+1],a=Math.atan2(ny-y,nx-x)+GR_PI,sw=Math.sin(t*1.3+i)*.04;
  grPart(c,grLeaf(x,y,a-.65+sw,62,17),grMix(GR_LEAF,'#a8c95e',(i%3)*.22),{lw:5});grPart(c,grLeaf(x,y,a+.6-sw,58,16),grMix(GR_LEAF,'#4f7a2a',(i%2)*.4),{lw:5});});
 // three olives
 for(const [x,y] of [[-150,-930],[150,-890],[30,-968]])grPart(c,grEll(x,y,13,16,.4),'#4b3a5e',{tones:[[grEll(x-4,y-5,4,5),'#9c8ab8']],lw:5});}
// The head, in the units of Glups (it turns about the neck by P.tilt). P: the face (see grFace), mouth (see grMouth), jaw (units, in
// place of the mouth's own), open (0 to 1: the jaw drops a little more).
export function grHead(c,P,t=0){c.save();c.translate(-30,-640);c.rotate(P.tilt||0);c.translate(30,640);
 const H=GR_HEAD,m=P.mouth||'smile',j=(P.jaw??GR_JAW[m]??0)+10*(P.open||0);
 grPart(c,grEll(H.x,H.y,H.rx,H.ry),grRGrad(c,H.x,H.y,H.rx*1.2,[grShade(GR_SKIN,.12),GR_SKIN,grShade(GR_SKIN,-.12)],H.x-70,H.y-80,10),{tones:[['M120 -940C190 -860 190 -720 100 -650L200 -640L200 -960Z',grRgba('#b8714c',.45)]],lw:8});
 grHair(c);grPart(c,grEll(144,-806,32,42,.2),GR_SKIN,{tones:[[grEll(150,-800,16,26,.2),grRgba('#c9805a',.6)]],lw:7});grLine(c,'M140 -830Q162 -810 142 -784',5,grRgba('#8e4a34',.8));
 grFace(c,P);grMouth(c,m,j);grBeard(c,j);grMoustache(c,m==='grin'||m==='open'?8:m==='o'?-4:0);grNose(c);grWreath(c,t);c.restore();}
// The body from the shoulders down (legs, sandals, chiton, apron). kick: how high each foot is lifted [left, right], in units.
function grTorso(c,P){const cloth=GR_CLOTH,kick=P.kick||[0,0];
 // the legs: the far one (his right, to the left of the picture) a little darker; laced sandals
 for(const [leg,foot,sole,laces,far] of [
  ['M-182 -232C-192 -168 -176 -104 -158 -58L-90 -58C-82 -110 -82 -170 -96 -232Z','M-160 -64C-202 -62 -242 -42 -246 -18C-248 -4 -238 2 -224 2L-86 2C-76 -12 -76 -44 -90 -64Z','M-254 -6C-256 8 -246 16 -230 16L-84 16C-74 16 -70 6 -74 -6Z','M-226 -26L-96 -50M-196 -10L-86 -30M-160 -60L-92 -96L-166 -126L-96 -156',true],
  ['M40 -232C30 -170 44 -110 62 -58L128 -58C136 -110 140 -170 128 -232Z','M62 -64C28 -62 2 -44 -2 -20C-4 -6 6 2 18 2L130 2C140 -14 138 -44 126 -64Z','M-10 -6C-12 8 -2 16 12 16L132 16C142 16 146 6 142 -6Z','M14 -26L118 -48M40 -12L124 -30M62 -60L128 -96L58 -126L130 -156',false]]){
  const sk=far?grShade(GR_SKIN,-.14):GR_SKIN,up=kick[far?0:1]||0;c.save();if(up)c.translate(far?-6:6,-up);
  grPart(c,leg,sk,{tones:[[`M${far?-120:100} -240L${far?-60:160} -240L${far?-60:160} 0L${far?-126:96} 0Z`,grRgba('#b8714c',.35)],[far?'M-170 -200C-176 -160 -168 -120 -160 -90L-150 -90C-158 -130 -160 -170 -156 -200Z':'M52 -200C46 -160 54 -120 64 -90L74 -90C66 -130 64 -170 66 -200Z',grRgba('#fff4e0',.35)]],lw:7});
  grPart(c,sole,grShade(GR_LEATHER,-.1),{lw:6});grPart(c,foot,sk,{lw:7});grLine(c,laces,10,GR_LEATHER);c.restore();}
 // the chiton: a pear with a round belly in front, with soft folds
 const body='M-140 -655C-232 -640 -302 -560 -320 -450C-340 -330 -302 -250 -252 -212C-160 -190 -40 -184 40 -188C130 -190 200 -198 252 -214C274 -300 280 -420 262 -500C244 -590 202 -642 130 -664C50 -684 -70 -676 -140 -655Z';
 grPart(c,body,cloth,{tones:[['M100 -668C226 -630 288 -520 280 -410C276 -310 266 -250 252 -214C200 -200 160 -195 120 -192C176 -300 190 -470 100 -668Z',grRgba('#c9b48f',.55)],['M-320 -330C-200 -300 100 -300 300 -330L300 -170L-320 -170Z',grRgba('#c9b48f',.25)],['M-270 -560C-246 -604 -200 -634 -150 -644L-160 -604C-200 -592 -236 -572 -270 -560Z',grRgba('#ffffff',.65)],
  ['M150 -540C170 -440 176 -330 168 -210L196 -210C204 -330 196 -450 172 -540Z',grRgba('#b39c74',.35)]],lw:8});
 // the border of the chiton: a band with a running wave
 c.save();c.beginPath();grPath(c,body);c.clip();grPart(c,'M-340 -236C-170 -212 -60 -208 20 -212C120 -214 200 -222 320 -240L320 -160L-340 -160Z',GR_BORDER,{lw:0});
 grLine(c,'M-340 -236C-170 -212 -60 -208 20 -212C120 -214 200 -222 320 -240',5,grShade(GR_BORDER,-.35));
 for(let i=0;i<9;i++){const x=-252+i*56;grLine(c,`M${x} -198C${x+8} -222 ${x+32} -222 ${x+32} -207C${x+32} -197 ${x+19} -197 ${x+19} -205`,6,'#f6dcb8');}c.restore();
 grLine(c,'M60 -540C82 -440 84 -320 92 -196M196 -560C226 -460 236 -330 222 -214M130 -520C146 -420 150 -300 146 -200',5,grRgba('#a8926c',.55));
 // the apron, over the belly, tied round the waist with a bow at the back
 const apron='M-212 -556C-140 -572 60 -574 112 -556C146 -460 152 -340 132 -262C40 -236 -140 -236 -262 -264C-306 -340 -296 -468 -212 -556Z';
 grPart(c,apron,GR_APRON,{tones:[['M50 -574C118 -470 146 -350 124 -240L180 -240L180 -574Z',grRgba('#1f4c80',.6)],['M-280 -300C-140 -276 60 -280 150 -300L150 -230L-280 -230Z',grRgba('#1f4c80',.35)],['M-236 -480C-214 -520 -186 -546 -150 -556L-170 -500C-196 -490 -216 -474 -236 -450Z',grRgba('#ffffff',.32)]],lw:8});
 grLine(c,'M-206 -552L-160 -640M106 -552L84 -600',11,grShade(GR_APRON,-.2));
 grPart(c,'M-160 -404C-120 -410 -70 -410 -40 -404L-38 -330C-72 -318 -124 -318 -156 -330Z',grShade(GR_APRON,-.12),{lw:6});
 grLine(c,'M-114 -404L-126 -462M-94 -404L-80 -458M-72 -404L-84 -450',7,'#5c8a32');for(const [x,y] of [[-126,-462],[-80,-458],[-84,-450]])grPart(c,grLeaf(x,y,-GR_PI/2+(x+100)*.01,26,9),'#7caf45',{lw:4});
 grLine(c,'M-238 -478C-80 -500 80 -500 140 -486',14,grShade(GR_APRON,-.25));grLine(c,'M140 -486C200 -480 248 -470 262 -462',14,grShade(GR_APRON,-.38));
 grPart(c,'M262 -462C290 -490 316 -486 312 -462C308 -444 284 -446 262 -462ZM262 -462C286 -436 300 -404 292 -380L276 -384C280 -404 270 -430 262 -462Z',grShade(GR_APRON,-.3),{lw:6});}
// The whole of Glups. P: x, y (his feet), s (screen units per unit), flip (−1 faces right), lean (radians), squash (height × and width ÷),
// tilt of the head, arms {far: [elbow, wrist], near: [elbow, wrist]} in his units (far: his right arm, towards where he looks; near:
// his left arm, in front of the body), hands {far, near} (see grHandAt; by default the far hand grips what it holds, else rests, and
// the near one lies flat), farFore (the far forearm comes in front of the body and the face: to taste, to comb), the face (see
// grHead), kick (see grTorso) and dance [dx, turn]: the lower half of him (under the belt) moves on its own. head(c): another head in
// place of his (the Minotaur); upper: only the half of him above the belt (the centaur). behind(c) is drawn first, mid(c) before the
// head and front(c) last; hold(c) draws what the far hand holds and nearHold(c) what the near one holds, each before its hand (all in
// his units). t: the clock (the wreath sways).
export function grGlups(c,P,t=0){grAt(c,P.x,P.y-(P.lift||0)*P.s,P.s,P.flip??1,0,()=>{const sq=P.squash??1;c.scale(1/Math.sqrt(sq),sq);c.rotate(P.lean||0);
 const A=P.arms||GR_ARMS_REST,S=GR_SHOULDER,far=A.far||GR_ARMS_REST.far,near=A.near||GR_ARMS_REST.near,hk=P.hands||{},fore=!!P.farFore;
 const hand=(arm,kind,col)=>grHandAt(c,arm[1][0],arm[1][1],Math.atan2(arm[1][1]-arm[0][1],arm[1][0]-arm[0][0]),kind,col);
 const farHand=()=>{if(P.hold)P.hold(c);hand(far,hk.far||(P.hold?'grip':'rest'),grShade(GR_SKIN,-.13));};
 if(P.behind)P.behind(c);
 grArm(c,S.far,far[0],far[1],true,false,!fore);if(!fore)farHand();
 if(P.dance&&(P.dance[0]||P.dance[1])){const cut=-474;c.save();c.beginPath();c.rect(-600,cut,1200,700);c.clip();c.translate(0,cut);c.rotate(P.dance[1]||0);c.translate(P.dance[0]||0,-cut);grTorso(c,P);c.restore();
  c.save();c.beginPath();c.rect(-600,-1200,1200,1200+cut+2);c.clip();grTorso(c,{...P,kick:[0,0]});c.restore();grLine(c,'M-238 -478C-80 -500 80 -500 140 -486',14,grShade(GR_APRON,-.25));}
 else if(P.upper){c.save();c.beginPath();c.rect(-600,-1400,1200,1400-444);c.clip();grTorso(c,P);c.restore();}
 else grTorso(c,P);
 if(P.mid)P.mid(c);if(P.head)P.head(c);else grHead(c,P,t);
 // the far forearm in front: the arm again, cut just before the elbow. Its outline is cut a little after its colour, so that the two
 // halves meet without a seam.
 if(fore){const [s0,e0]=[S.far,far[0]],L=Math.hypot(e0[0]-s0[0],e0[1]-s0[1])||1,dx=(e0[0]-s0[0])/L,dy=(e0[1]-s0[1])/L,sk=grShade(GR_SKIN,-.13),ls=[[s0,e0,88],[e0,far[1],72]];
  const half=k=>{const ox=e0[0]-dx*k,oy=e0[1]-dy*k;c.save();c.beginPath();grPath(c,[[ox-dy*2000,oy+dx*2000],[ox-dy*2000+dx*3000,oy+dx*2000+dy*3000],[ox+dy*2000+dx*3000,oy-dx*2000+dy*3000],[ox+dy*2000,oy-dx*2000]]);c.clip();};
  half(24);for(const [a,b,w] of ls)grLine(c,grPoly([a,b]),w+14,GR_INK);c.restore();half(28);for(const [a,b,w] of ls)grLine(c,grPoly([a,b]),w,sk);c.restore();
  half(24);grArmShade(c,e0,far[1],sk);c.restore();farHand();}
 grArm(c,S.near,near[0],near[1],false);if(P.nearHold)P.nearHold(c);hand(near,hk.near||'flat',GR_SKIN);
 if(P.front)P.front(c);});}
// ── The cauldron ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// A bronze cauldron on a tripod, as those found at Olympia, with two ring handles, over a small fire of logs. Units: the centre of the
// rim at (0, 0); the rim is 460 units wide; the feet of the tripod are at y = 520. soup: the colour of the soup (null: empty), t: the
// clock, o.bubbles, o.ring (a plop: 0 to 1), o.glow (the soup shines: 0 to 1), o.still (no movement).
export const GR_BRONZE='#c98b3c';
export const GR_POT={rx:230,ry:56,depth:250,feet:520};
export function grFire(c,t,still,k=1){if(k<=0)return;
 for(const [d,col] of [['M-150 470L120 430L132 452L-140 494Z','#7a4a2a'],['M-120 430L150 482L140 502L-130 452Z','#8f5a33']])grPart(c,d,col,{tones:[[d.replace(/L/g,' L'),grRgba('#000',0)]],lw:7});
 grGlow(c,0,430,240*k,'#ffb347',.32*k);
 for(let i=0;i<5;i++){const x=(i-2)*44,ph=t*2.1+i*1.7,sw=still?0:Math.sin(ph)*12,hh=(130+40*Math.sin(i*2.3)+(still?0:16*Math.sin(ph*1.3)))*k,wd=36+8*(i%2),b=468;
  const flame=(x,wd,hh,sw)=>`M${x-wd} ${b}C${x-wd} ${b-hh*.45} ${x-wd*.15+sw*.3} ${b-hh*.6} ${x+sw} ${b-hh}C${x+wd*.45+sw*.2} ${b-hh*.62} ${x+wd} ${b-hh*.42} ${x+wd} ${b}C${x+wd} ${b+wd*.55} ${x-wd} ${b+wd*.55} ${x-wd} ${b}Z`;
  grPart(c,flame(x,wd,hh,sw),i%2?'#ff9a2e':'#ffad38',{lw:5});grPart(c,flame(x,wd*.5,hh*.55,sw*.6),'#ffe27a',{lw:0});}}
export function grCauldron(c,soup,t=0,o={}){const P=GR_POT,still=!!o.still;
 // the tripod: three legs with lion's paws, the back one first
 const leg=(x0,x1,dark)=>{grTube(c,`M${x0} 120Q${(x0+x1)/2+(x1-x0)*.15} 330 ${x1} ${P.feet-30}`,30,dark?grShade(GR_BRONZE,-.3):grShade(GR_BRONZE,-.08),7);grPart(c,grEll(x1+(x1>0?8:-8),P.feet-14,34,20),dark?grShade(GR_BRONZE,-.3):GR_BRONZE,{lw:6});};
 leg(20,40,true);grFire(c,t,still,o.fire??1);leg(-150,-220,false);leg(150,220,false);
 // the bowl
 const bowl=`M${-P.rx} 0C${-P.rx} 120 ${-P.rx*.7} ${P.depth} 0 ${P.depth}C${P.rx*.7} ${P.depth} ${P.rx} 120 ${P.rx} 0Z`;
 grPart(c,bowl,grRGrad(c,-60,60,P.rx*1.5,['#f7d58c',GR_BRONZE,'#7a4a22'],-110,30,10),{tones:[[`M${P.rx*.2} 0C${P.rx*.5} 90 ${P.rx*.4} 200 0 ${P.depth+10}L${P.rx+20} ${P.depth}L${P.rx+20} 0Z`,grRgba('#5a3418',.45)],[`M${-P.rx*.82} 40C${-P.rx*.8} 100 ${-P.rx*.6} 170 ${-P.rx*.42} 200C${-P.rx*.62} 150 ${-P.rx*.74} 100 ${-P.rx*.74} 40Z`,grRgba('#fff2c8',.55)]],lw:9});
 // a band of waves around the bowl (dark bronze on bronze: soft)
 c.save();c.beginPath();grPath(c,bowl);c.clip();grLine(c,`M${-P.rx} 70C${-P.rx*.4} 96 ${P.rx*.4} 96 ${P.rx} 70`,26,grRgba('#6e4220',.4),'butt');
 for(let i=0;i<7;i++){const x=-P.rx*.82+i*P.rx*.27;grLine(c,`M${x} 92C${x+6} 70 ${x+28} 70 ${x+28} 84C${x+28} 94 ${x+16} 94 ${x+16} 86`,5,grRgba('#f3c97a',.6));}c.restore();
 // ring handles
 for(const k of [-1,1]){c.beginPath();c.ellipse(k*(P.rx+14),40,40,44,0,0,GR_TAU);c.strokeStyle=GR_INK;c.lineWidth=grLW(c,26);c.stroke();c.strokeStyle=grShade(GR_BRONZE,k<0?.1:-.2);c.lineWidth=grLW(c,12);c.stroke();}
 // the rim and the soup
 grPart(c,grEll(0,0,P.rx,P.ry),grShade(GR_BRONZE,-.45),{lw:9});
 if(soup){const sx=P.rx*.9,sy=P.ry*.72,cy=P.ry*.14;c.save();c.beginPath();grPath(c,grEll(0,cy,sx,sy));c.clip();
  c.fillStyle=grRGrad(c,-40,cy-10,sx,[grShade(soup,.25),soup,grShade(soup,-.25)]);c.fillRect(-sx,cy-sy,2*sx,2*sy);
  if(o.glow>0)grGlow(c,0,cy,sx,'#fff6d0',.6*o.glow);
  if(!still)for(let i=0;i<6;i++){const p=((t*.55+grRand(i,3))%1),x=(grRand(i,5)-.5)*sx*1.4,y=cy+(grRand(i,9)-.5)*sy*1.1,r=10+18*Math.sin(GR_PI*p);c.beginPath();c.arc(x,y,r,0,GR_TAU);c.strokeStyle=grRgba(grShade(soup,.45),.8*Math.sin(GR_PI*p));c.lineWidth=grLW(c,5);c.stroke();}
  if(o.ring>0&&o.ring<1){const k=o.ring;c.beginPath();c.ellipse(0,cy,sx*(.2+.8*k),sy*(.2+.8*k),0,0,GR_TAU);c.strokeStyle=grRgba('#ffffff',.7*(1-k));c.lineWidth=grLW(c,9);c.stroke();}
  c.restore();}
 c.beginPath();c.ellipse(0,0,P.rx,P.ry,0,0,GR_TAU);c.strokeStyle=GR_INK;c.lineWidth=grLW(c,22);c.stroke();c.strokeStyle='#e9b866';c.lineWidth=grLW(c,10);c.stroke();
 c.beginPath();c.ellipse(0,-2,P.rx,P.ry,0,GR_PI*1.05,GR_PI*1.6);c.strokeStyle='#fff0c0';c.lineWidth=grLW(c,4);c.stroke();}
// Wisps of steam over the soup (alpha 0 to 1).
export function grSteam(c,t,still,alpha=1,col='#ffffff'){if(still||alpha<=0)return;c.save();c.lineCap='round';for(let i=0;i<3;i++){const p=((t/3.4)+i/3)%1,a=Math.sin(GR_PI*p)*.5*alpha,x=(i-1)*80,y=-30-p*420;
  c.beginPath();c.moveTo(x,y+60);c.bezierCurveTo(x+40*Math.sin(t+i),y+20,x-40*Math.sin(t*1.2+i),y-30,x+10,y-80);c.strokeStyle=grRgba(col,a);c.lineWidth=grLW(c,26*(1-p*.5));c.stroke();}c.restore();}
// The ladle: a long handle of olive wood with a bronze bowl. From the bowl (bx, by) to the end of the handle (tx, ty).
export function grLadle(c,bx,by,tx,ty){grTube(c,`M${bx} ${by}L${tx} ${ty}`,22,'#b47b45',7);const a=Math.atan2(ty-by,tx-bx);
 grPart(c,`M${bx-46} ${by-6}C${bx-46} ${by+44} ${bx+46} ${by+44} ${bx+46} ${by-6}C${bx+20} ${by+4} ${bx-20} ${by+4} ${bx-46} ${by-6}Z`,GR_BRONZE,{tones:[[`M${bx+10} ${by}L${bx+50} ${by}L${bx+50} ${by+50}L${bx+10} ${by+50}Z`,grRgba('#5a3418',.4)]],lw:7});void a;}
// ── Wings ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A feathered wing from its root at (0, 0): the long feathers fan out to the right and up as it opens (open: 0 folded, 1 spread), the
// short ones under them and the small ones on top. Units: span about 340 at full size (scale with c.scale). cols: [feathers, coverts,
// shadow]. kind 'skin' draws a wing of skin with fingers (the dragon).
export function grWing(c,open=1,cols=['#ffffff','#f4f6ff','#b9c4e6'],kind='feather'){const o=grClamp(open),lw=7;
 if(kind==='skin'){const fan=[0,1,2,3].map(i=>{const a=-.25-o*(.5+i*.32)+(1-o)*.9,L=320-i*30;return [Math.cos(a)*L,Math.sin(a)*L];});
  let d='M0 0';fan.forEach(([x,y],i)=>{d+=`L${x.toFixed(1)} ${y.toFixed(1)}`;const n=fan[i+1];if(n)d+=`Q${((x+n[0])*.38).toFixed(1)} ${((y+n[1])*.38).toFixed(1)} ${n[0].toFixed(1)} ${n[1].toFixed(1)}`;});d+='Q60 40 0 0Z';
  grPart(c,d,cols[1],{tones:[['M0 0L400 120L400 400L0 400Z',grRgba(cols[2],.45)]],lw});for(const [x,y] of fan)grLine(c,`M0 0L${x} ${y}`,12,cols[0]);return;}
 // long feathers (primaries), from the tip inwards
 for(let i=5;i>=0;i--){const a=-.2-o*(.25+i*.2)+(1-o)*(.75-i*.05),L=(250-i*16)*(.7+.3*o),x=Math.cos(a)*90,y=Math.sin(a)*90;grPart(c,grLeaf(x*.6,y*.6,a-.12*(1-o),L,34),i%2?cols[0]:grShade(cols[0],-.06),{tones:[[grLeaf(x*.6,y*.6+14,a-.12*(1-o),L,18),grRgba(cols[2],.4)]],lw});}
 // short feathers along the bottom
 for(let i=4;i>=0;i--){const a=.35+i*.18-o*.3,L=150-i*10;grPart(c,grLeaf(10+i*18,10,a-GR_PI*.05,L,30),cols[0],{tones:[[grLeaf(10+i*18,24,a-GR_PI*.05,L,14),grRgba(cols[2],.35)]],lw});}
 // the small feathers on top (coverts)
 grPart(c,`M-20 10C-10 -60 80 -110 170 -${80+40*o}C150 -40 100 0 60 40C30 50 -10 40 -20 10Z`,cols[1],{tones:[['M-20 30C40 20 100 -10 170 -60L180 60L-20 60Z',grRgba(cols[2],.35)]],lw});
 for(let i=0;i<4;i++)grLine(c,`M${20+i*34} ${8-i*18}q16 18 32 0`,5,grRgba(cols[2],.8));}
// ── Unions ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Several shapes and thick strokes filled as one: all are outlined first and then filled with the same colour, so the outline goes
// round the whole (a body with its neck and legs). items: {d} (a closed shape) or {line, w} (a stroke w units wide). tones: shadows
// and lights clipped to the closed shapes.
export function grUnion(c,items,fill,o={}){const lw=o.lw??7;
 for(const p of items){c.beginPath();grPath(c,p.line||p.d);c.strokeStyle=o.ink||GR_INK;c.lineJoin='round';c.lineCap='round';c.lineWidth=grLW(c,p.line?p.w+2*lw:2*lw);c.stroke();}
 for(const p of items){c.beginPath();grPath(c,p.line||p.d);if(p.line){c.strokeStyle=p.col||fill;c.lineWidth=p.w;c.lineCap='round';c.lineJoin='round';c.stroke();}else{c.fillStyle=p.col||fill;c.fill();}}
 if(o.tones&&o.tones.length){c.save();c.beginPath();for(const p of items)if(!p.line)grPath(c,p.d);c.clip();for(const [sd,col] of o.tones){c.beginPath();grPath(c,sd);c.fillStyle=col;c.fill();}c.restore();}}
// A tapered limb as strokes for grUnion: through the points pts with the widths ws (one per segment).
export function grLimb(pts,ws){const out=[];for(let i=0;i<pts.length-1;i++)out.push({line:`M${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}L${pts[i+1][0].toFixed(1)} ${pts[i+1][1].toFixed(1)}`,w:ws[i]});return out;}
// A scalloped band (a mane, a crest of curls) along the points pts (each [x, y, r]): one outline round all the curls.
export function grMane(c,pts,col='#2c2233',hi='#5a4f6e'){c.beginPath();for(const [x,y,r] of pts){c.moveTo(x+r,y);c.arc(x,y,r,0,GR_TAU);}c.strokeStyle=GR_INK;c.lineWidth=grLW(c,14);c.stroke();
 c.beginPath();for(let i=0;i<pts.length-1;i++){const [x,y,r]=pts[i],[x2,y2,r2]=pts[i+1];c.moveTo(x,y);c.lineTo(x2,y2);}c.strokeStyle=GR_INK;c.lineWidth=grLW(c,Math.min(...pts.map(p=>p[2]))*1.6+14);c.lineCap='round';c.stroke();
 c.beginPath();for(const [x,y,r] of pts){c.moveTo(x+r,y);c.arc(x,y,r,0,GR_TAU);}c.fillStyle=col;c.fill();
 c.beginPath();for(let i=0;i<pts.length-1;i++){const [x,y]=pts[i],[x2,y2]=pts[i+1];c.moveTo(x,y);c.lineTo(x2,y2);}c.strokeStyle=col;c.lineWidth=grLW(c,Math.min(...pts.map(p=>p[2]))*1.6);c.stroke();
 for(const [x,y,r] of pts){c.beginPath();c.arc(x-r*.12,y-r*.1,r*.55,GR_PI*1.05,GR_PI*1.85);c.strokeStyle=grRgba(hi,.9);c.lineWidth=grLW(c,Math.max(4,r*.14));c.lineCap='round';c.stroke();}}
