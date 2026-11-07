// La cassola d'en Glups (EN23), 0.27: the bestiary. The parts of the mythical creatures (the body of a horse, of a lion, of a dog, of a
// bird, of a snake, and their heads) and the stage of their scenes. Every creature is Glups changed, so every head keeps something of
// him: the black curls, the olive wreath, the thick eyebrows and, on most of them, the curly moustache. The parts are drawn in their
// own units, facing left, with the same outline and the same two tones of colour as Glups.
import {escSheet,escVeiled} from './escenari.js';
import {GR_PI,GR_TAU,GR_INK,GR_HAIR,GR_LEAF,grUnion,grLimb,grMane,grClamp,grSmooth,grLerp,grSpan,grMix,grShade,grRgba,grRand,grPath,grEll,grLW,grPart,grLine,grTube,grVGrad,grRGrad,grGlow,grCurls,grLeaf,grAt,grWing} from './grec-art.js';
// ── The stage of a scene ───────────────────────────────────────────────────────────────────────────────────────────────────
// A scene is drawn in units of a stage whose core (1000 × 900, centred) is always on the screen; on a wide or a tall screen the decor
// goes on beyond it. myStage gives the scale k and the origin (x, y) of the centre of the core, and the visible extent in stage units.
export function myStage(w,h,H){const k=Math.min(w/1000,H/900),x=w/2,y=H/2;return {k,x,y,w,h,H,left:-x/k,right:(w-x)/k,top:-y/k,bottom:(h-y)/k};}
// Draws in stage units.
export function myIn(c,S,draw){c.save();c.translate(S.x,S.y);c.scale(S.k,S.k);draw(c);c.restore();}
// The decor of a scene, painted once into a sheet (with the veil of «Presentació del decorat»): paint(c, S) draws in stage units.
export function myBackdrop(c,S,key,decor,paint){const d=decor||{fade:1,base:'#000'},draw=(x)=>{x.fillStyle=d.base||'#000';x.fillRect(0,0,S.w,S.h);if(d.fade>0)escVeiled(d,y=>myIn(y,S,z=>paint(z,S)))(x,S.w,S.h);},
 cv=escSheet(c,key+'|'+(d.fade>=1?'':`v${Math.round(d.fade*100)}${d.white?'w':'b'}`),S.w,S.h,draw);if(cv)c.drawImage(cv,0,0,S.w,S.h);else draw(c);}
// A cartoon cloud of round puffs (r: its size), white with a soft blue shade under it.
export function myCloud(c,x,y,r,o={}){const sq=o.squash||0,col=o.col||'#ffffff',sh=o.shade||'#c9d8ee',lw=o.lw??Math.max(4,r*.045),blobs=o.blobs||[[0,0,1],[-.95,.3,.68],[1,.28,.72],[-.45,-.38,.74],[.5,-.32,.68],[0,.38,.8]];
 c.save();c.translate(x,y);c.scale(1+sq*.5,1-sq);c.beginPath();for(const [dx,dy,k] of blobs){c.moveTo(dx*r+k*r,dy*r);c.arc(dx*r,dy*r,k*r,0,GR_TAU);}
 if(lw>0){c.strokeStyle=o.ink||grRgba(GR_INK,.55);c.lineWidth=grLW(c,lw*2);c.stroke();}c.fillStyle=col;c.fill();
 c.save();c.clip();c.beginPath();for(const [dx,dy,k] of blobs){c.moveTo(dx*r+k*r,dy*r+r*.35);c.arc(dx*r,dy*r+r*.35,k*r*.92,0,GR_TAU);}c.fillStyle=grRgba(sh,.55);c.fill();c.restore();c.restore();}
// A sparkle (a four-pointed star) of size r.
export function mySpark(c,x,y,r,col='#fff6c8',a=1){if(a<=0)return;c.save();c.globalAlpha*=a;grGlow(c,x,y,r*1.6,col,.5);c.fillStyle=col;c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x,y,x+r,y);c.quadraticCurveTo(x,y,x,y+r);c.quadraticCurveTo(x,y,x-r,y);c.quadraticCurveTo(x,y,x,y-r);c.fill();c.restore();}
// ── Eyes, brows, moustache, wreath: what every creature keeps of Glups ─────────────────────────────────────────────────────
// A cartoon eye: white, a round dark pupil looking at look [x, y], a highlight; lid (0 to 1) closes it from the top.
export function myEye(c,x,y,r,look=[0,0],lid=0,lidCol='#e3a77a',col='#fffdf6'){grPart(c,grEll(x,y,r,r*1.15),col,{lw:Math.max(4,r*.18)});const px=x+look[0]*r*.38,py=y+look[1]*r*.36;
 c.save();c.beginPath();grPath(c,grEll(x,y,r,r*1.15));c.clip();c.fillStyle='#2a1a1c';c.beginPath();c.arc(px,py,r*.56,0,GR_TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(px-r*.2,py-r*.24,r*.2,0,GR_TAU);c.fill();
 if(lid>0){c.fillStyle=lidCol;c.fillRect(x-r-2,y-r*1.2,2*r+4,(2.3*r)*grClamp(lid));}c.restore();if(lid>.02)grLine(c,`M${x-r} ${y-r*1.15+2.3*r*grClamp(lid)}L${x+r} ${y-r*1.15+2.3*r*grClamp(lid)}`,Math.max(3,r*.16));}
// A thick black eyebrow centred on (x, y), L long, raised (lift > 0) or frowning (turn).
export function myBrow(c,x,y,L,lift=0,turn=0){c.save();c.translate(x,y-lift*L*.28);c.rotate(turn);grPart(c,`M${-L/2} ${L*.08}C${-L/3} ${-L*.22} ${L/3} ${-L*.24} ${L/2} ${-L*.03}C${L/3} ${-L*.08} ${-L/3} ${-L*.05} ${-L/2} ${L*.08}Z`,GR_HAIR,{lw:Math.max(3,L*.07)});c.restore();}
// Glups's curly moustache under a nose at (x, y), W wide.
export function myMoustache(c,x,y,W,turn=0){c.save();c.translate(x,y);c.rotate(turn);const k=W/190;c.scale(k,k);
 grPart(c,'M0 -6C-26 -14 -64 -12 -78 8C-88 24 -78 44 -62 38C-72 24 -56 8 -34 14C-20 18 -8 22 4 14C30 22 66 24 90 14C110 4 120 -16 108 -34C98 -16 74 -8 50 -12C32 -16 14 -16 0 -6Z',GR_HAIR,{tones:[['M0 -6C30 2 70 0 108 -32L120 -60L-10 -60Z',grRgba('#5a4f6e',.55)]],lw:6});c.restore();}
// An olive wreath round a head: an arc from (x0, y0) to (x1, y1) bulging by bulge (negative: upwards).
export function myWreath(c,x0,y0,x1,y1,bulge,size=1,t=0){const pts=[];for(let i=0;i<=8;i++){const u=i/8,x=grLerp(x0,x1,u),y=grLerp(y0,y1,u)+Math.sin(u*GR_PI)*bulge;pts.push([x,y]);}
 grLine(c,`M${x0} ${y0}Q${(x0+x1)/2} ${(y0+y1)/2+bulge*2} ${x1} ${y1}`,10*size,'#4f6e2a');
 pts.forEach(([x,y],i)=>{if(i===8)return;const [nx,ny]=pts[i+1],a=Math.atan2(ny-y,nx-x)+GR_PI,sw=Math.sin(t*1.3+i)*.05;
  grPart(c,grLeaf(x,y,a-.65+sw,58*size,16*size),grMix(GR_LEAF,'#a8c95e',(i%3)*.22),{lw:5*size});grPart(c,grLeaf(x,y,a+.6-sw,54*size,15*size),grMix(GR_LEAF,'#4f7a2a',(i%2)*.4),{lw:5*size});});}
// A mass of black curls (a mane, a tuft) along the points pts, r the size of a curl.
export function myCurlsAlong(c,pts,r,col=GR_HAIR){c.beginPath();for(const [x,y,k=1] of pts){c.moveTo(x+r*k,y);c.arc(x,y,r*k,0,GR_TAU);}c.strokeStyle=GR_INK;c.lineWidth=grLW(c,12);c.stroke();c.fillStyle=col;c.fill();
 for(const [x,y,k=1] of pts){c.beginPath();c.arc(x-r*k*.15,y-r*k*.1,r*k*.55,GR_PI*1.1,GR_PI*1.9);c.strokeStyle=grRgba('#6a5f80',.8);c.lineWidth=grLW(c,5);c.stroke();}}
// Points along a quadratic curve (a, control b, c), n of them.
export function myAlong(a,b,c,n){const out=[];for(let i=0;i<n;i++){const u=n>1?i/(n-1):0,v=1-u;out.push([v*v*a[0]+2*v*u*b[0]+u*u*c[0],v*v*a[1]+2*v*u*b[1]+u*u*c[1]]);}return out;}
// ── Legs ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A leg of two segments from the hip (x, y): a1 the angle of the upper part from straight down, a2 the bend of the lower part; L1, L2
// their lengths, w1, w2 their widths; foot(c, x, y, angle) draws the hoof or the paw at the end.
export function myLeg(c,x,y,a1,a2,L1,L2,w1,w2,col,foot){const kx=x+Math.sin(a1)*L1,ky=y+Math.cos(a1)*L1,b=a1+a2,fx=kx+Math.sin(b)*L2,fy=ky+Math.cos(b)*L2;
 grTube(c,`M${x} ${y}L${kx} ${ky}`,w1,col,7);grTube(c,`M${kx} ${ky}L${fx} ${fy}`,w2,col,7);c.beginPath();c.arc(kx,ky,(w1+w2)/4,0,GR_TAU);c.fillStyle=col;c.fill();if(foot)foot(c,fx,fy,b);return [fx,fy];}
// A gait: the angles of a leg at phase p (0 to 1) of a stride. kind 'gallop', 'trot', 'stand', 'tuck' (folded under, flying).
export function myGait(kind,p,front=true){const s=Math.sin(p*GR_TAU),c2=Math.cos(p*GR_TAU);
 if(kind==='tuck')return front?[-.9,1.9]:[.9,-1.6];
 if(kind==='stand')return [0,0];
 if(kind==='trot')return front?[.35*s,.5*Math.max(0,-c2)]:[.32*s,-.5*Math.max(0,c2)];
 return front?[.55*s,.9*Math.max(0,-c2)]:[.5*s,-.8*Math.max(0,c2)];}
// ── The horse (Pegasus, the centaur) ───────────────────────────────────────────────────────────────────────────────────────
// Units: the middle of the belly at (0, 0), the back at y ≈ −140, the hooves at y ≈ +330 when it stands; the chest to the left.
export const MY_HORSE={col:'#fbf8f2',shade:'#b9c3dc',hoof:'#e0b04a'};
// The points of a leg from the hip (x, y): a1 the angle of the upper part from straight down, a2 the bend at the knee; L1, L2, L3 the
// lengths (upper, cannon, pastern).
export function myLegPts(x,y,a1,a2,L1,L2,L3=36){const k=[x+Math.sin(a1)*L1,y+Math.cos(a1)*L1],b=a1+a2,f=[k[0]+Math.sin(b)*L2,k[1]+Math.cos(b)*L2],e=[f[0]+Math.sin(b*.6)*L3,f[1]+Math.cos(b*.6)*L3];return [[x,y],k,f,e];}
function myHoofAt(c,p,q,col){const a=Math.atan2(q[1]-p[1],q[0]-p[0])-GR_PI/2;c.save();c.translate(q[0],q[1]);c.rotate(a);grPart(c,'M-26 -10L26 -10L34 24C10 30 -10 30 -34 24Z',col,{lw:7});c.restore();}
const MY_HORSE_BODY='M-210 -40C-222 -112 -140 -152 -40 -142C60 -134 160 -152 222 -102C272 -62 262 40 200 82C120 112 -80 118 -160 92C-212 72 -206 20 -210 -40Z';
const MY_HORSE_NECK='M-104 -126C-146 -224 -186 -292 -240 -334L-326 -266C-286 -220 -256 -130 -214 -20Z';
// legs: [front far, front near, back far, back near] as [a1, a2]; P.noNeck: no neck (the centaur has Glups there); P.tail: the tail
// swings (−1 to 1).
export function myHorseBody(c,P={}){const H=MY_HORSE,legs=P.legs||[[0,0],[0,0],[0,0],[0,0]],col=P.col||H.col,sh=P.shade||H.shade,dark=grShade(col,-.13),hoof=P.hoof||H.hoof;
 const leg=(i,x,y)=>myLegPts(x,y,legs[i][0],legs[i][1],150,128,40);
 const ff=leg(0,-150,40),bf=leg(2,150,30);grUnion(c,[...grLimb(ff,[56,40,34]),...grLimb(bf,[66,40,34])],dark);myHoofAt(c,ff[2],ff[3],grShade(hoof,-.15));myHoofAt(c,bf[2],bf[3],grShade(hoof,-.15));
 // the tail: a flow of curls
 const tw=P.tail||0;grMane(c,myAlong([224,-86],[330+40*tw,-60],[300+40*tw,140],7).map(([x,y],i)=>[x+(i%2?10:-6),y,34-i*2.2]),P.hair);
 const fn=leg(1,-118,50),bn=leg(3,176,40),items=[{d:MY_HORSE_BODY},...grLimb(fn,[60,42,36]),...grLimb(bn,[70,42,36])];if(!P.noNeck)items.push({d:MY_HORSE_NECK});
 grUnion(c,items,col,{lw:8,tones:[['M-240 40C-100 76 100 76 280 30L280 160L-240 160Z',grRgba(sh,.55)],['M-160 -122C-80 -142 40 -132 120 -138L100 -104C20 -104 -80 -108 -150 -92Z',grRgba('#ffffff',.6)],['M-214 -20C-256 -130 -286 -220 -326 -266L-300 -290C-252 -230 -230 -150 -180 -30Z',grRgba(sh,.5)]]});
 myHoofAt(c,fn[2],fn[3],hoof);myHoofAt(c,bn[2],bn[3],hoof);}
// The head of the horse, with Glups's curls for a mane, his eyebrows, his wreath and his moustache. P: look, lid, brow, mouth ('smile',
// 'open', 'o'), turn (the head about the top of the neck), t.
export function myHorseHead(c,P={}){const H=MY_HORSE,col=P.col||H.col,sh=P.shade||H.shade;
 grMane(c,myAlong([-236,-384],[-176,-300],[-116,-136],7).map(([x,y],i)=>[x+8,y,40-i*2.5]),P.hair);
 c.save();c.translate(-262,-300);c.rotate(P.turn||0);c.translate(262,300);
 const head='M-244 -386C-290 -416 -352 -404 -382 -362C-412 -320 -424 -280 -412 -248C-400 -222 -360 -218 -330 -238C-300 -258 -258 -280 -238 -312C-226 -338 -228 -368 -244 -386Z';
 grPart(c,grLeaf(-262,-386,-GR_PI/2-.25,70,22),col,{lw:7});
 grPart(c,head,col,{tones:[['M-420 -270C-380 -230 -330 -230 -290 -262L-280 -200L-430 -200Z',grRgba(sh,.5)]],lw:8});
 grPart(c,grLeaf(-292,-388,-GR_PI/2-.5,64,20),col,{lw:7});grLine(c,`M-292 -392L-312 -430`,5,grRgba(sh,.9));
 grPart(c,grEll(-398,-262,10,7,.4),'#7a5a6a',{lw:0});
 myEye(c,-318,-336,24,P.look||[-.6,0],P.lid||0,col);myBrow(c,-320,-372,58,P.brow||0,0);
 if(P.mouth==='open')grPart(c,'M-404 -232C-396 -206 -370 -200 -352 -214C-370 -220 -390 -226 -404 -232Z','#8e2f2a',{lw:5});else if(P.mouth==='o')grPart(c,grEll(-392,-226,10,12),'#8e2f2a',{lw:5});else grLine(c,'M-404 -232C-390 -218 -370 -216 -352 -226',6);
 myMoustache(c,-386,-244,110,-.15);
 grMane(c,[[-250,-392,28],[-282,-398,24],[-306,-390,20]],P.hair);myWreath(c,-226,-370,-338,-390,-24,.75,P.t||0);c.restore();}
// Key frames of a move: [u, x, y, k, dir] (dir: 1 to the right, −1 to the left). Smooth (Catmull–Rom) between them; dir and the rest
// are those of the key before. Returns {x, y, k, dir, dx, dy} (dx, dy: the direction of the move).
export function myKeys(keys,u){if(u<=keys[0][0])return {x:keys[0][1],y:keys[0][2],k:keys[0][3],dir:keys[0][4],dx:0,dy:0};const n=keys.length;if(u>=keys[n-1][0])return {x:keys[n-1][1],y:keys[n-1][2],k:keys[n-1][3],dir:keys[n-1][4],dx:0,dy:0};
 let i=0;while(i<n-2&&u>keys[i+1][0])i++;const p0=keys[Math.max(0,i-1)],p1=keys[i],p2=keys[i+1],p3=keys[Math.min(n-1,i+2)],v=(u-p1[0])/(p2[0]-p1[0]);
 const cr=(j,v)=>{const a=p0[j],b=p1[j],c=p2[j],d=p3[j];return .5*((2*b)+(-a+c)*v+(2*a-5*b+4*c-d)*v*v+(-a+3*b-3*c+d)*v*v*v);};
 return {x:cr(1,v),y:cr(2,v),k:cr(3,v),dir:p1[4],dx:cr(1,Math.min(1,v+.02))-cr(1,v),dy:cr(2,Math.min(1,v+.02))-cr(2,v),i,v};}
// The anchor of a creature (stage units) on the screen: where the puff of the hiccup goes.
export const myAnchor=(S,x,y,r)=>({x:S.x+x*S.k,y:S.y+y*S.k,r:r*S.k});
// Flames like drops (a torch, a brazier, the phoenix): n of them over the base (x, b), spread wide, h high; they sway slowly (still:
// they stay). k (0 to 1) grows them.
export function myFlames(c,x,b,n,spread,h,t,still,k=1,cols=['#ff9a2e','#ffad38','#ffe27a']){if(k<=0)return;grGlow(c,x,b-h*.3,(spread+h)*.8*k,'#ffb347',.3*k);
 for(let i=0;i<n;i++){const fx=x+(n>1?(i/(n-1)-.5)*spread:0),ph=t*2.1+i*1.7,sw=still?0:Math.sin(ph)*h*.08,hh=(h*(.8+.25*Math.sin(i*2.3))+(still?0:h*.1*Math.sin(ph*1.3)))*k,wd=Math.max(8,spread/Math.max(1,n)*.75+h*.12)*k;
  const fl=(x,wd,hh,sw)=>`M${x-wd} ${b}C${x-wd} ${b-hh*.45} ${x-wd*.15+sw*.3} ${b-hh*.6} ${x+sw} ${b-hh}C${x+wd*.45+sw*.2} ${b-hh*.62} ${x+wd} ${b-hh*.42} ${x+wd} ${b}C${x+wd} ${b+wd*.55} ${x-wd} ${b+wd*.55} ${x-wd} ${b}Z`;
  grPart(c,fl(fx,wd,hh,sw),i%2?cols[0]:cols[1],{lw:Math.max(3,wd*.12)});grPart(c,fl(fx,wd*.5,hh*.55,sw*.6),cols[2],{lw:0});}}
// ── Little things of every scene ───────────────────────────────────────────────────────────────────────────────────────────
// A note of music (a sign that something sounds, not a letter), s its size, leaning by rot.
export function myNote(c,x,y,s,col='#3a2a4a',a=1,rot=0){if(a<=0)return;c.save();c.globalAlpha*=a;c.translate(x,y);c.rotate(rot);c.scale(s/100,s/100);
 grPart(c,'M8 -100L18 -100L18 20L8 20Z',col,{lw:5});grPart(c,'M14 -100C40 -86 64 -70 58 -34C54 -54 40 -64 18 -70Z',col,{lw:5});grPart(c,grEll(-8,24,28,20,-.4),col,{lw:6});c.restore();}
// A bubble (of sleep, of soap) of radius r, see-through, with a shine.
export function myBubble(c,x,y,r,a=1){if(r<=1||a<=0)return;c.save();c.globalAlpha*=a;c.beginPath();c.arc(x,y,r,0,GR_TAU);c.fillStyle='rgba(214,236,255,.45)';c.fill();c.strokeStyle=grRgba(GR_INK,.6);c.lineWidth=grLW(c,Math.max(3,r*.07));c.stroke();
 c.beginPath();c.arc(x-r*.3,y-r*.3,r*.28,GR_PI*1.05,GR_PI*1.7);c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=grLW(c,Math.max(3,r*.1));c.stroke();c.restore();}
// Glups's moustache seen from the front (two curls), W wide, under a nose at (x, y).
export function myMoustache2(c,x,y,W,droop=0){c.save();c.translate(x,y);const k=W/160;c.scale(k,k);for(const s of [-1,1]){c.save();c.scale(s,1);c.rotate(droop*.35);
 grPart(c,'M0 -6C20 -16 56 -14 72 4C84 18 78 38 62 34C68 20 54 8 36 12C24 16 12 18 0 10Z',GR_HAIR,{tones:[['M0 -6C30 -14 60 -10 80 6L90 -30L0 -30Z',grRgba('#5a4f6e',.55)]],lw:6});c.restore();}c.restore();}
// A mouth seen from the front at (x, y), W wide: 'smile', 'grin', 'open' (barking, singing), 'yawn', 'o', 'flat', 'chew'.
export function myMouth(c,x,y,W,m='smile',open=1){const h=W*.5;
 if(m==='open'||m==='yawn'){const H=(m==='yawn'?W*.95:W*.6)*Math.max(.15,open),w2=m==='yawn'?W*.42:W*.5;grPart(c,`M${x-w2} ${y}C${x-w2} ${y+H} ${x+w2} ${y+H} ${x+w2} ${y}C${x+w2*.4} ${y+H*.12} ${x-w2*.4} ${y+H*.12} ${x-w2} ${y}Z`,'#8e2f2a',{tones:[[grEll(x,y+H*.85,w2*.6,H*.32),'#e07a78']],lw:Math.max(4,W*.06)});return;}
 if(m==='o'){grPart(c,grEll(x,y+h*.3,W*.16,W*.2*Math.max(.3,open)),'#8e2f2a',{lw:Math.max(4,W*.06)});return;}
 if(m==='flat'){grLine(c,`M${x-W*.3} ${y+h*.2}L${x+W*.3} ${y+h*.2}`,Math.max(4,W*.06));return;}
 if(m==='chew'){grLine(c,`M${x-W*.3} ${y+h*.2}Q${x-W*.15} ${y} ${x} ${y+h*.25}Q${x+W*.15} ${y+h*.45} ${x+W*.3} ${y+h*.2}`,Math.max(4,W*.06));return;}
 if(m==='grin'){grPart(c,`M${x-W*.45} ${y}Q${x} ${y+h*1.1} ${x+W*.45} ${y}Q${x} ${y+h*.25} ${x-W*.45} ${y}Z`,'#ffffff',{lw:Math.max(4,W*.06)});return;}
 grLine(c,`M${x-W*.4} ${y}Q${x} ${y+h*.8} ${x+W*.4} ${y}`,Math.max(4,W*.06));}
// Points along a cubic curve (p0, p1, p2, p3), n + 1 of them.
export function myBez(p0,p1,p2,p3,n=16){const out=[];for(let i=0;i<=n;i++){const u=i/n,v=1-u;out.push([v*v*v*p0[0]+3*v*v*u*p1[0]+3*v*u*u*p2[0]+u*u*u*p3[0],v*v*v*p0[1]+3*v*v*u*p1[1]+3*v*u*u*p2[1]+u*u*u*p3[1]]);}return out;}
// The outline of a ribbon along the points pts, w(u) wide at u (0 at the first point, 1 at the last), with a round tip at the end: a
// tail, a neck, the body of a snake.
export function myRibbon(pts,w){const n=pts.length,L=[],R=[];for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1,h=w(i/(n-1))/2;
  L.push([pts[i][0]-dy/m*h,pts[i][1]+dx/m*h]);R.push([pts[i][0]+dy/m*h,pts[i][1]-dx/m*h]);}
 const e=pts[n-1],q=pts[n-2]||e,ang=Math.atan2(e[1]-q[1],e[0]-q[0]),he=w(1)/2,f=x=>x.toFixed(1);let d=`M${f(L[0][0])} ${f(L[0][1])}`;for(let i=1;i<n;i++)d+=`L${f(L[i][0])} ${f(L[i][1])}`;
 d+=`C${f(L[n-1][0]+Math.cos(ang)*he*1.3)} ${f(L[n-1][1]+Math.sin(ang)*he*1.3)} ${f(R[n-1][0]+Math.cos(ang)*he*1.3)} ${f(R[n-1][1]+Math.sin(ang)*he*1.3)} ${f(R[n-1][0])} ${f(R[n-1][1])}`;
 for(let i=n-2;i>=0;i--)d+=`L${f(R[i][0])} ${f(R[i][1])}`;return d+'Z';}
// ── The dog (Cerberus) ─────────────────────────────────────────────────────────────────────────────────────────────────────
export const MY_DOG={col:'#dca56a',dark:'#9c6038',light:'#f6dcb0'};
// A dog's head from the front, centred on (0, 0), about 200 units wide. P: look, lid, brow (raised > 0, cross < 0), mouth, open (how
// much the mouth opens), ear (0 floppy, 1 pricked up), wreath, bubble (0 to 1: a bubble of sleep from the nose), droop (the moustache
// hangs, asleep), t.
export function myDogHead(c,P={}){const D=MY_DOG,col=P.col||D.col,dark=P.dark||D.dark,light=P.light||D.light,ear=P.ear||0,lid=Array.isArray(P.lid)?P.lid:[P.lid||0,P.lid||0],br=P.brow||0;
 for(const s of [-1,1]){c.save();c.translate(s*70,-56);c.rotate(s*(.35-ear*1.1));grPart(c,`M0 0C${s*44} -16 ${s*70} 40 ${s*64} 112C${s*60} 152 ${s*22} 154 ${s*8} 122C${-s*8} 84 ${-s*18} 30 0 0Z`,dark,{tones:[[`M${s*20} 20C${s*40} 40 ${s*50} 90 ${s*40} 130L${s*90} 130L${s*90} 0Z`,grRgba('#1c1020',.18)]],lw:7});c.restore();}
 grPart(c,grEll(0,0,100,90),col,{tones:[[grEll(0,80,96,44),grRgba(dark,.35)],[grEll(-34,-52,40,20,-.35),grRgba('#ffffff',.4)]],lw:8});
 grMane(c,[[-34,-82,24],[-4,-94,27],[28,-84,24],[52,-66,18]],GR_HAIR);
 grPart(c,grEll(0,44,62,42),light,{tones:[[grEll(0,74,62,22),grRgba(dark,.25)]],lw:7});
 for(const s of [-1,1]){myEye(c,s*40,-14,17,P.look||[0,0],lid[s<0?0:1],col);myBrow(c,s*40,-42,44,br,s*(br<0?.35:-.12));}
 const op=P.open??1;myMouth(c,0,64,P.mouthW||56,P.mouth||'smile',op);
 grPart(c,'M-22 18C-24 4 24 4 22 18C20 30 8 36 0 36C-8 36 -20 30 -22 18Z','#2a1a1c',{tones:[[grEll(-6,12,8,5),'rgba(255,255,255,.55)']],lw:5});
 myMoustache2(c,0,40,118,P.droop||0);
 if(P.wreath)myWreath(c,-86,-54,86,-54,-46,.6,P.t||0);
 if(P.bubble>0){const r=6+30*P.bubble;myBubble(c,26+r*.85,30-r*.35,r,1);}}
// The body of the dog from the front, sitting (lie 0) or lying down (lie 1), the ground at y = 0 and the shoulders at y ≈ −300.
// necks: the points [x, y] where the necks join the heads (drawn with the body, in one outline); wag: the tail (−1 to 1).
export function myDogBody(c,P={}){const D=MY_DOG,col=P.col||D.col,dark=P.dark||D.dark,light=P.light||D.light,L=grClamp(P.lie||0),l=(a,b)=>grLerp(a,b,L),wag=P.wag||0;
 const tx=l(150,180),ty=l(-70,-40);grPart(c,myRibbon(myBez([tx,ty],[tx+100,ty-30],[tx+120+40*wag,ty-150],[tx+60+100*wag,ty-240+40*Math.abs(wag)],14),u=>grLerp(54,22,u)),col,{tones:[[myRibbon(myBez([tx,ty],[tx+100,ty-30],[tx+120+40*wag,ty-150],[tx+60+100*wag,ty-240+40*Math.abs(wag)],14).map(([x,y])=>[x+12,y+6]),u=>grLerp(30,10,u)),grRgba(dark,.35)]],lw:8});
 const sh=[[-92,l(-262,-150)],[0,l(-286,-166)],[92,l(-262,-150)]],items=[{d:grEll(0,l(-196,-104),l(150,186),l(146,96))},{d:grEll(0,l(-104,-60),l(168,214),l(104,62))},
  {d:grEll(-150,l(-86,-50),l(94,104),l(84,58))},{d:grEll(150,l(-86,-50),l(94,104),l(84,58))}];
 (P.necks||[]).forEach((p,i)=>items.push(...grLimb([sh[i],p],[96,92])));
 grUnion(c,items,col,{lw:8,tones:[[grEll(0,l(-214,-112),l(72,96),l(82,52)),grRgba(light,.95)],[`M-260 ${l(-30,-20)}L260 ${l(-30,-20)}L260 20L-260 20Z`,grRgba(dark,.3)],[grEll(-150,l(-110,-70),46,26,-.4),grRgba('#ffffff',.3)],[grEll(150,l(-110,-70),46,26,.4),grRgba('#ffffff',.3)]]});
 for(const s of [-1,1]){const top=l(-170,-84);grPart(c,`M${s*68-31} ${top}C${s*68-34} ${top+60} ${s*68-32} -60 ${s*68-30} -24L${s*68+30} -24C${s*68+32} -60 ${s*68+34} ${top+60} ${s*68+31} ${top}Z`,col,{tones:[[`M${s*68+8} ${top}L${s*68+40} ${top}L${s*68+40} 0L${s*68+8} 0Z`,grRgba(dark,.28)]],lw:7});}
 for(const s of [-1,1]){grPart(c,grEll(s*68,-18,l(46,52),l(26,30)),col,{tones:[[grEll(s*68,-6,46,12),grRgba(dark,.3)]],lw:7});for(const q of [-1,0,1])grLine(c,`M${s*68+q*15} -30L${s*68+q*15} -10`,5,grRgba(GR_INK,.7));
  grPart(c,grEll(s*196,-16,46,24),col,{lw:7});}
 // a blue collar with a bronze tag on each neck, the colours of Glups's apron
 (P.necks||[]).forEach((p,i)=>{const a=sh[i],m=[grLerp(a[0],p[0],.42),grLerp(a[1],p[1],.42)],ang=Math.atan2(p[1]-a[1],p[0]-a[0])+GR_PI/2;c.save();c.translate(m[0],m[1]);c.rotate(ang);
  grPart(c,'M-56 -14C-20 -20 20 -20 56 -14L56 14C20 8 -20 8 -56 14Z','#3474b4',{tones:[['M-60 6L60 6L60 20L-60 20Z','#c2552f']],lw:6});c.restore();grPart(c,grEll(m[0],m[1]+20,13,13),'#d8a24a',{lw:5});});}
// ── People of the myths (Orpheus, Odysseus, the sailors) ───────────────────────────────────────────────────────────────────
// A person of ancient Greece, the feet at (0, 0), the top of the head at y ≈ −590, facing right. P: walk (0 to 1, how much), p (the phase
// of the step), tip (on tiptoe), arms {front: [elbow, hand], back: [elbow, hand]}, skin, hair, cloth, border, beard, wreath, look,
// lid, brow, mouth, lean, hold(c) (drawn between the body and the front arm: a lyre, a rope).
export function myPerson(c,P={}){const skin=P.skin||'#e8b48a',hair=P.hair||'#5a3a24',cloth=P.cloth||'#f6efe0',border=P.border||'#2f6fb0',w=P.walk||0,ph=(P.p||0)*GR_TAU,tip=P.tip||0;
 c.save();c.rotate(P.lean||0);const A=P.arms||{front:[[40,-330],[70,-260]],back:[[-36,-330],[-40,-250]]};
 const leg=(x,a,bend,front)=>{const k=[x+Math.sin(a)*125,-250+Math.cos(a)*125],f=[k[0]+Math.sin(a-bend)*118,k[1]+Math.cos(a-bend)*118-tip*16];grTube(c,`M${x} -250L${k[0]} ${k[1]}L${f[0]} ${f[1]}`,46,front?skin:grShade(skin,-.12),7);
  c.save();c.translate(f[0],f[1]);c.rotate(-tip*.5);grPart(c,'M-18 -6C-10 -14 40 -14 50 -2C54 6 44 10 30 10L-16 10C-24 8 -24 0 -18 -6Z','#8a5a34',{lw:6});c.restore();};
 const sw=Math.sin(ph)*.42*w;
 grTube(c,`M-36 -420L${A.back[0][0]} ${A.back[0][1]}L${A.back[1][0]} ${A.back[1][1]}`,34,grShade(skin,-.12),7);grPart(c,grEll(A.back[1][0],A.back[1][1],18,16),grShade(skin,-.12),{lw:6});
 leg(-10,-sw,w*.5*Math.max(0,Math.sin(ph+1.6)),false);leg(14,sw,w*.5*Math.max(0,Math.sin(ph+1.6+GR_PI)),true);
 grPart(c,'M-64 -446C-76 -360 -98 -262 -102 -176L102 -176C98 -262 76 -360 64 -446C30 -462 -30 -462 -64 -446Z',cloth,{tones:[['M-110 -204L110 -204L110 -170L-110 -170Z',border],['M-110 -460L-30 -460C-40 -360 -60 -260 -64 -170L-120 -170Z',grRgba('#8a92b8',.28)]],lw:8});
 grLine(c,'M-80 -330Q0 -312 80 -330',7);
 grTube(c,'M2 -450L6 -484',34,skin,7);
 c.save();c.translate(0,-520);c.rotate(P.tilt||0);
 grPart(c,grEll(0,0,64,70),skin,{tones:[[grEll(-30,30,46,40),grRgba('#b07050',.25)]],lw:8});grPart(c,'M52 -6C78 0 80 20 56 22Z',skin,{lw:6});
 grPart(c,grEll(-40,6,12,16),skin,{lw:5});
 myEye(c,8,-10,12,P.look||[.5,0],P.lid||0,skin);myEye(c,40,-10,11,P.look||[.5,0],P.lid||0,skin);myBrow(c,8,-32,26,P.brow||0,.1);myBrow(c,40,-32,24,P.brow||0,-.1);
 if(P.beard)grPart(c,grCurls(4,34,62,40,-.1,GR_PI+.1,6,.2,true),hair,{lw:7});
 myMouth(c,30,32,30,P.mouth||'smile',P.open??1);
 grMane(c,[[-58,6,22],[-62,-24,24],[-46,-52,26],[-14,-68,26],[18,-68,22],[42,-54,18]],hair,grShade(hair,.25));
 if(P.wreath)myWreath(c,-60,-30,48,-50,-26,.5,P.t||0);c.restore();
 if(P.hold)P.hold(c);
 grTube(c,`M40 -420L${A.front[0][0]} ${A.front[0][1]}L${A.front[1][0]} ${A.front[1][1]}`,34,skin,7);grPart(c,grEll(A.front[1][0],A.front[1][1],18,16),skin,{lw:6});c.restore();}
// A lyre: a sound box of tortoise shell, two curved arms and a bar, the strings; (x, y) the box, s its size, strum (0 to 1) shakes the
// strings.
export function myLyre(c,x,y,s,strum=0){c.save();c.translate(x,y);c.scale(s/100,s/100);
 grTube(c,'M-30 -10C-70 -60 -60 -120 -36 -150',16,'#c8913a',6);grTube(c,'M30 -10C70 -60 60 -120 36 -150',16,'#c8913a',6);grTube(c,'M-50 -140L50 -140',14,'#a8702a',6);
 for(let i=-2;i<=2;i++){const q=Math.sin(strum*GR_TAU*3+i)*strum*4;grLine(c,`M${i*10} -140Q${i*10+q} -80 ${i*10} -14`,3,'#f6e9c8');}
 grPart(c,grEll(0,0,48,36),'#9a6a3a',{tones:[[grEll(0,0,30,22),'#7a4a2a']],lw:6});c.restore();}
// ── The snake (the Hydra, the dragon of the golden apples, the hair of Medusa) ─────────────────────────────────────────────
export const MY_SNAKE={col:'#62b98c',dark:'#2f7d63',belly:'#e4eea6',spot:'#3f9474'};
// A snake's head from the front, centred on (0, 0), about 170 units wide: eyes on top, the nostrils, Glups's moustache and a wide mouth.
// P: look, lid, brow, mouth, open, tongue (0 to 1), wreath, tuft (Glups's curls on top), sniff (the nose wrinkles), col, dark, belly.
export function mySnakeHead(c,P={}){const S=MY_SNAKE,col=P.col||S.col,dark=P.dark||S.dark,belly=P.belly||S.belly,lid=Array.isArray(P.lid)?P.lid:[P.lid||0,P.lid||0],br=P.brow||0;
 if(P.tongue>0){const L=60*P.tongue;grPart(c,`M-6 40L-6 ${40+L}L-18 ${52+L}L-10 ${54+L}L0 ${44+L}L10 ${54+L}L18 ${52+L}L6 ${40+L}L6 40Z`,'#d8505a',{lw:4});}
 for(const s of [-1,1])grPart(c,grEll(s*38,-40,30,28),col,{lw:7});
 grPart(c,'M-84 4C-88 -42 -48 -62 0 -62C48 -62 88 -42 84 4C80 46 44 66 0 66C-44 66 -80 46 -84 4Z',col,{tones:[[grEll(0,40,66,30),grRgba(belly,.95)],[grEll(-40,-30,26,12,-.3),grRgba('#ffffff',.35)],[grEll(52,-6,10,8),grRgba(dark,.4)],[grEll(-58,8,8,6),grRgba(dark,.4)],[grEll(30,-48,8,6),grRgba(dark,.35)]]});
 if(P.tuft)grMane(c,[[-18,-62,18],[4,-70,20],[26,-62,16]],GR_HAIR);
 for(const s of [-1,1]){myEye(c,s*38,-42,19,P.look||[0,0],lid[s<0?0:1],col);myBrow(c,s*38,-70,40,br,s*(br<0?.35:-.12));}
 const sn=P.sniff||0;for(const s of [-1,1])grPart(c,grEll(s*12,4-sn*4,5+sn*2,4),'#1f3a30',{lw:0});if(sn>.1)grLine(c,`M-26 ${-10}Q0 ${-18-6*sn} 26 -10`,4,grRgba(GR_INK,.6*sn));
 myMoustache2(c,0,16,104,P.droop||0);myMouth(c,0,36,P.mouthW||62,P.mouth||'smile',P.open??1);
 if(P.wreath)myWreath(c,-70,-56,70,-56,-34,.5,P.t||0);}
// The neck (or the body) of a snake along the points pts, w0 wide at the start and w1 at the end: the back with spots and the light belly
// along one side.
export function mySnakeNeck(c,pts,w0,w1,P={}){const S=MY_SNAKE,col=P.col||S.col,belly=P.belly||S.belly,spot=P.spot||S.spot;
 grPart(c,myRibbon(pts,u=>grLerp(w0,w1,u)),col,{tones:[[myRibbon(pts.map(([x,y],i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1,o=grLerp(w0,w1,i/(pts.length-1))*.28;return [x+dy/m*o,y-dx/m*o];}),u=>grLerp(w0,w1,u)*.45),grRgba(belly,.95)]],lw:7});
 for(let i=2;i<pts.length-2;i+=3){const [x,y]=pts[i],a=pts[i-1],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1,o=grLerp(w0,w1,i/(pts.length-1))*.22;grPart(c,grEll(x-dy/m*o,y+dx/m*o,7+grLerp(w0,w1,i/(pts.length-1))*.08,5+grLerp(w0,w1,i/(pts.length-1))*.06,Math.atan2(dy,dx)),spot,{lw:0});}}
// A water lily on its pad, (x, y) the middle of the flower, s its size.
export function myLily(c,x,y,s,t=0){c.save();c.translate(x,y);c.scale(s/100,s/100);grPart(c,'M-150 30C-150 -10 150 -10 150 30C150 70 -150 70 -150 30ZM0 30L40 10L60 30Z','#5aa060',{tones:[[grEll(0,44,140,18),grRgba('#2f6f40',.35)]],lw:6,rule:'evenodd'});
 for(let i=0;i<8;i++){const a=GR_PI+GR_PI*(i+.5)/8+Math.sin(t+i)*.02;grPart(c,grLeaf(0,14,a,70,22),i%2?'#ffd0dc':'#ffe4ec',{lw:5});}for(let i=0;i<6;i++){const a=GR_PI*1.15+GR_PI*.7*(i+.5)/6;grPart(c,grLeaf(0,10,a,50,18),'#ffb8c8',{lw:5});}
 grPart(c,grEll(0,4,18,12),'#ffd24a',{lw:5});c.restore();}
// ── The lion and the goat (the Chimera, the griffin) ───────────────────────────────────────────────────────────────────────
export const MY_LION={col:'#e8b25c',dark:'#b9773a',light:'#f8dcaa',mane:'#b5652a',maneHi:'#e3a05a'};
// A lion's head from the front, centred on (0, 0), about 300 units wide with its mane: Glups's eyes, eyebrows and moustache on a lion.
// P: look, lid, brow, mouth, open, turn (−1 to 1: the face turns a little to one side), wreath, puff (0 to 1: the cheeks fill with air to
// blow), droop, t.
export function myLionHead(c,P={}){const L=MY_LION,tn=P.turn||0,lid=Array.isArray(P.lid)?P.lid:[P.lid||0,P.lid||0],br=P.brow||0,fx=tn*28,pf=P.puff||0;
 const ring=[];for(let i=0;i<=18;i++){const a=i/18*GR_TAU;ring.push([Math.cos(a)*120+fx*.2,8+Math.sin(a)*114,34+4*Math.sin(i*2)]);}grMane(c,ring,L.mane,L.maneHi);
 for(const s of [-1,1]){grPart(c,grEll(s*74+fx*.4,-76,28,26),L.col,{tones:[[grEll(s*74+fx*.4,-72,15,13),grRgba('#e88a7a',.8)]],lw:7});}
 grPart(c,grEll(fx*.15,10,98+8*pf,92),L.col,{tones:[[grEll(fx*.15,86,96,40),grRgba(L.dark,.32)],[grEll(-40+fx*.15,-46,36,18,-.35),grRgba('#ffffff',.38)]],lw:8});
 grPart(c,grEll(fx,50,62+12*pf,42+4*pf),L.light,{tones:[[grEll(fx,80,62,18),grRgba(L.dark,.22)]],lw:7});
 for(const s of [-1,1]){const k=1-s*tn*.12;myEye(c,s*38+fx,-14,17*k,P.look||[0,0],lid[s<0?0:1],L.col);myBrow(c,s*38+fx,-42,44*k,br,s*(br<0?.35:-.12));}
 grPart(c,`M${fx-24} 16C${fx-24} 6 ${fx+24} 6 ${fx+24} 16C${fx+20} 30 ${fx+8} 38 ${fx} 38C${fx-8} 38 ${fx-20} 30 ${fx-24} 16Z`,'#7a3e30',{tones:[[grEll(fx-6,14,8,4),'rgba(255,255,255,.5)']],lw:5});
 myMoustache2(c,fx,42,120,P.droop||0);myMouth(c,fx+(P.mouth==='o'?tn*10:0),66,P.mouthW||50,P.mouth||'smile',P.open??1);
 if(P.wreath)myWreath(c,-92+fx*.2,-62,92+fx*.2,-62,-44,.6,P.t||0);}
// A lion lying down, seen from the side, facing right; the ground at y = 0, the back at y ≈ −220, from x ≈ −330 (the rump) to the front
// paws at x ≈ 360. The head is drawn by itself (at about (210, −200)). P: breath (0 to 1, the chest rises), paw (0 to 1, the front paw
// lifts a little).
export function myLionBody(c,P={}){const L=MY_LION,b=P.breath||0,pw=P.paw||0,col=P.col||L.col;
 const items=[{d:grEll(-205,-96,118,96)},{d:grEll(-40,-104,215,98+6*b)},{d:grEll(150,-116,108,108+4*b)},...grLimb([[150,-60],[300,-30-30*pw]],[70]),...grLimb([[110,-50],[260,-24]],[62]),{d:grEll(326,-22-30*pw,52,26)},{d:grEll(282,-18,48,24)},{d:grEll(-110,-20,74,24)}];
 grUnion(c,items,col,{lw:8,tones:[[`M-340 -40L380 -40L380 10L-340 10Z`,grRgba(L.dark,.28)],[grEll(-60,-176,170,30,-.04),grRgba('#ffffff',.25)],[grEll(-205,-110,70,52),grRgba(L.dark,.18)],[grEll(150,-60,90,40),grRgba(L.light,.7)]]});
 grLine(c,'M-230 -60Q-200 -20 -150 -20',6,grRgba(GR_INK,.6));for(const [x,y] of [[326,-22-30*pw],[282,-18],[-110,-20]])for(const q of [-1,0,1])grLine(c,`M${x+20+q*0} ${y-14+q*12}L${x+44} ${y-12+q*12}`,4,grRgba(GR_INK,.55));
 // the mane falls on the shoulders
 if(P.mane!==false)grMane(c,[[110,-196,40],[150,-150,44],[180,-120,36]],L.mane,L.maneHi);}
export const MY_GOAT={col:'#efe9dc',dark:'#b8ad98',horn:'#c9a874',hornDark:'#8a6a40',beard:'#d8cfbd'};
// A goat's head from the front, centred on (0, 0), about 160 units wide: curled horns, ears to the sides, a goatee under Glups's
// moustache. P: look, lid, brow, mouth, open, turn, chew (0 to 1: the jaw moves), t.
export function myGoatHead(c,P={}){const G=MY_GOAT,tn=P.turn||0,fx=tn*16,lid=Array.isArray(P.lid)?P.lid:[P.lid||0,P.lid||0],br=P.brow||0,ch=P.chew||0;
 for(const s of [-1,1]){const pts=myBez([s*26,-62],[s*40,-150],[s*120,-150],[s*112,-80],14);grPart(c,myRibbon(pts,u=>grLerp(30,10,u)),G.horn,{lw:6});for(let i=2;i<12;i+=2){const [x,y]=pts[i];grLine(c,`M${x-9} ${y-4}L${x+9} ${y+4}`,4,grRgba(G.hornDark,.8));}}
 for(const s of [-1,1]){c.save();c.translate(s*58,-22);c.rotate(s*.25);grPart(c,`M0 -14C${s*40} -24 ${s*84} -8 ${s*92} 10C${s*70} 22 ${s*30} 16 0 14Z`,G.col,{tones:[[`M${s*10} -4C${s*40} -10 ${s*70} 0 ${s*80} 8C${s*60} 12 ${s*30} 10 ${s*10} 6Z`,grRgba('#e8a0a0',.7)]],lw:6});c.restore();}
 grPart(c,`M-64 -38C-64 -86 64 -86 64 -38C64 16 40 ${84+ch*6} 0 ${92+ch*6}C-40 ${84+ch*6} -64 16 -64 -38Z`,G.col,{tones:[[grEll(fx,70,50,30),grRgba(G.dark,.45)],[grEll(-28,-56,24,12,-.3),grRgba('#ffffff',.6)]],lw:7});
 grPart(c,`M${fx-16} ${90+ch*6}C${fx-14} ${122+ch*8} ${fx-4} ${146+ch*10} ${fx+2} ${158+ch*10}C${fx+6} ${144+ch*10} ${fx+14} ${122+ch*8} ${fx+16} ${90+ch*6}Z`,G.beard,{lw:5});
 grMane(c,[[-20,-74,14],[0,-80,16],[20,-74,14]],GR_HAIR);
 for(const s of [-1,1]){const k=1-s*tn*.12;myEye(c,s*30+fx,-22,15*k,P.look||[0,0],lid[s<0?0:1],G.col);myBrow(c,s*30+fx,-48,36*k,br,s*(br<0?.35:-.12));}
 for(const s of [-1,1])grPart(c,grEll(fx+s*10,30,5,4),'#5a4a40',{lw:0});
 myMoustache2(c,fx,40,90,P.droop||0);myMouth(c,fx,60+ch*4,P.mouthW||38,P.mouth||'smile',P.open??1);}
// The neck of the goat (or another furry neck) along pts, w0 wide at the start and w1 at the end, with a mane of tufts on its back.
export function myFurNeck(c,pts,w0,w1,col=MY_GOAT.col,dark=MY_GOAT.dark){grPart(c,myRibbon(pts,u=>grLerp(w0,w1,u)),col,{tones:[[myRibbon(pts.map(([x,y])=>[x+w0*.18,y+4]),u=>grLerp(w0,w1,u)*.5),grRgba(dark,.35)]],lw:7});}
// A round loaf of bread on (x, y), s its size: toast from 0 (pale) to 1 (golden brown); bites (0 to 1) takes bites out of its right side.
export function myBread(c,x,y,s,toast=0,bites=0){if(bites>=1)return;c.save();c.translate(x,y);c.scale(s/100,s/100);
 if(bites>0)for(let i=0;i<3;i++){const a=-.8+i*.8;c.beginPath();c.rect(-200,-200,400,400);c.arc(70-90*bites+Math.cos(a)*30,Math.sin(a)*36,30,0,GR_TAU);c.clip('evenodd');}
 const col=grMix('#f6deaa','#cf7f30',grClamp(toast));grPart(c,grEll(0,0,50,38),col,{tones:[[grEll(0,20,50,18),grRgba('#8a4a20',.25+.2*toast)],[grEll(-16,-18,22,10,-.3),grRgba('#ffffff',.45*(1-toast)+.15)]],lw:6});
 for(const q of [-1,0,1])grLine(c,`M${q*20-8} -18L${q*20+8} 12`,5,grRgba(grMix('#d8a868','#7a3a18',toast),.9));c.restore();}
// A basket woven of willow, (x, y) the middle of its bottom, s its size; loaves n of them inside.
export function myBasket(c,x,y,s,n=3){c.save();c.translate(x,y);c.scale(s/100,s/100);for(let i=0;i<n;i++)myBread(c,-40+i*40,-86-(i%2)*10,70,.05);
 grPart(c,'M-80 -80L80 -80L64 0L-64 0Z','#c48a4a',{tones:[['M-80 -40L80 -40L80 0L-80 0Z',grRgba('#8a5a2a',.35)]],lw:7});for(const yy of [-60,-36,-14])grLine(c,`M${-74+(-60-yy)*-.2} ${yy}L${74-(-60-yy)*-.2} ${yy}`,4,grRgba('#7a4a20',.6));
 grPart(c,'M-88 -92L88 -92L88 -76L-88 -76Z','#d8a060',{lw:6});c.restore();}
// A gentle breath of fire from (x0, y0) towards (x1, y1): tongues of flame along the line, k (0 to 1) how far it reaches. No flash: the
// tongues sway slowly and the glow grows and fades with k.
export function myBreath(c,x0,y0,x1,y1,k,t,still){if(k<=0)return;const L=Math.hypot(x1-x0,y1-y0)*k,a=Math.atan2(y1-y0,x1-x0);grGlow(c,x0+(x1-x0)*k,y0+(y1-y0)*k,110,'#ffb347',.35*k);
 c.save();c.translate(x0,y0);c.rotate(a);for(let i=0;i<6;i++){const u=(i+.5)/6,x=u*L,r=(10+26*Math.sin(GR_PI*Math.min(1,u*1.15)))*(still?1:1+.1*Math.sin(t*5+i*1.9)),dy=still?0:4*Math.sin(t*4+i*2.3);
  grPart(c,`M${x-r*1.4} ${dy}C${x-r} ${dy-r*.9} ${x+r*.6} ${dy-r} ${x+r*1.5} ${dy}C${x+r*.6} ${dy+r} ${x-r} ${dy+r*.9} ${x-r*1.4} ${dy}Z`,i%2?'#ff9a2e':'#ffb53c',{lw:Math.max(3,r*.12)});grPart(c,grEll(x,dy,r*.7,r*.42),'#ffe27a',{lw:0});}c.restore();}
// ── The eagle (the griffin) ────────────────────────────────────────────────────────────────────────────────────────────────
export const MY_EAGLE={col:'#f6efe0',dark:'#c9b48e',gold:'#e0a83a',beak:'#f2b53c',beakDark:'#b87620'};
// An eagle's head from the front, centred on (0, 0), about 200 units wide: tufts of feathers like ears, a hooked beak, and Glups's
// eyebrows and moustache (under the beak). P: look, lid, brow, beak (0 shut to 1 open), turn, wreath, t.
export function myEagleHead(c,P={}){const E=MY_EAGLE,tn=P.turn||0,fx=tn*20,lid=Array.isArray(P.lid)?P.lid:[P.lid||0,P.lid||0],br=P.brow||0,bk=grClamp(P.beak||0);
 for(const s of [-1,1]){c.save();c.translate(s*58,-64);c.rotate(s*.5);grPart(c,`M-18 10C-22 -30 -6 -60 ${s*16} -78C14 -56 20 -26 18 10Z`,E.gold,{tones:[['M0 -60L30 -60L30 10L0 10Z',grRgba('#a8762a',.35)]],lw:6});c.restore();}
 // the feathers of the neck below, then the head
 grPart(c,'M-96 30C-100 90 -60 120 0 124C60 120 100 90 96 30Z',E.dark,{lw:7});for(let i=0;i<5;i++)grLine(c,`M${-70+i*35} ${84+(i%2)*8}q12 14 24 0`,5,grRgba('#8a7454',.8));
 grPart(c,'M-90 0C-96 -64 -50 -96 0 -96C50 -96 96 -64 90 0C86 50 50 82 0 84C-50 82 -86 50 -90 0Z',E.col,{tones:[[grEll(0,64,80,26),grRgba(E.dark,.45)],[grEll(-36,-60,30,14,-.3),grRgba('#ffffff',.6)]],lw:8});
 for(const s of [-1,1]){const k=1-s*tn*.12;myEye(c,s*40+fx,-26,19*k,P.look||[0,0],lid[s<0?0:1],E.col);myBrow(c,s*40+fx,-58,46*k,br,s*(br<0?.35:-.12));}
 // the beak: the upper part hooks down; when it opens the lower part drops
 if(bk>.05)grPart(c,grEll(fx,40+bk*14,20,8+bk*18),'#8e2f2a',{lw:5});grPart(c,`M${fx-22} ${34+bk*14}C${fx-20} ${58+bk*40} ${fx+20} ${58+bk*40} ${fx+22} ${34+bk*14}Z`,E.beakDark,{lw:5});
 grPart(c,`M${fx-30} -6C${fx-34} 24 ${fx-16} 40 ${fx} 62C${fx+16} 40 ${fx+34} 24 ${fx+30} -6C${fx+18} -16 ${fx-18} -16 ${fx-30} -6Z`,E.beak,{tones:[[`M${fx+4} -10L${fx+40} -10L${fx+40} 70L${fx+4} 70Z`,grRgba(E.beakDark,.35)],[grEll(fx-14,4,7,10,.2),grRgba('#ffffff',.5)]],lw:6});
 for(const s of [-1,1])grPart(c,grEll(fx+s*10,8,4,3),'#6a4418',{lw:0});
 c.save();c.translate(fx,72+bk*36);myMoustache2(c,0,0,110,P.droop||0);c.restore();
 if(P.wreath)myWreath(c,-80,-70,80,-70,-40,.55,P.t||0);}
// A gold coin at (x, y), r its radius, turned by a (0 flat to the eye, 1 seen on its edge).
export function myCoin(c,x,y,r,a=0){const w=Math.max(.15,Math.abs(Math.cos(a*GR_PI/2)));grPart(c,grEll(x,y,r*w,r),'#f0c040',{tones:[[grEll(x+r*w*.3,y+r*.3,r*w*.8,r*.8),grRgba('#c08a20',.45)]],lw:Math.max(2.5,r*.16)});if(w>.5)grPart(c,grEll(x,y,r*w*.55,r*.55),'#ffe07a',{lw:Math.max(1.5,r*.08)});}
// A wide golden bowl (a phiale), its middle at (x, y), s its size, upside down by flip (0 to 1).
export function myPhiale(c,x,y,s,rot=0){c.save();c.translate(x,y);c.rotate(rot);c.scale(s/100,s/100);grPart(c,'M-100 -10C-90 50 90 50 100 -10Z','#e8b440',{tones:[['M10 -10L110 -10L110 60L10 60Z',grRgba('#a8742a',.4)],[grEll(-50,8,20,8,.2),grRgba('#ffffff',.55)]],lw:7});
 grPart(c,'M-104 -16L104 -16L100 -2L-100 -2Z','#f4cc60',{lw:6});for(let i=0;i<7;i++)grPart(c,grEll(-66+i*22,18,7,11),'#d09a30',{lw:3});c.restore();}
// ── The bird (the phoenix, the siren) ──────────────────────────────────────────────────────────────────────────────────────
export const MY_PHOENIX={col:'#ff9a3c',dark:'#d4602a',chest:'#ffd36a',wing:['#ffb347','#ffcf6a','#d8642c'],tail:['#ff8a3a','#ffc04a','#e85a3a']};
// The body of a bird seen from the side, facing right, the feet at (0, 0): a round body, a tail of long feathers, a wing and two thin
// legs; the neck goes up to (60, −250), where the head is drawn by itself. P: col, dark, chest, wing (the colours of grWing), tail
// (the colours of the tail feathers), open (the wing, 0 folded to 1 open), flap (an extra lift of the wing), tailL (the length of the
// tail), fluff (0 to 1: round and fluffy, a chick), sit (0 to 1: the legs fold).
export function myBirdBody(c,P={}){const B=MY_PHOENIX,col=P.col||B.col,dark=P.dark||B.dark,chest=P.chest||B.chest,tl=P.tailL??1,fl=P.fluff||0,sit=P.sit||0,op=P.open??.15;
 const tc=P.tail||B.tail;for(let i=4;i>=0;i--){const a=GR_PI*(.92+i*.05)+.12*Math.sin((P.t||0)*1.1+i),L=(220+60*Math.sin(i*1.7))*tl;grPart(c,grLeaf(-90,-150,a,L,34-i*2),tc[i%3],{tones:[[grLeaf(-90,-144,a,L,14),grRgba(dark,.35)]],lw:6});if(tl>.4)grPart(c,grEll(-90+Math.cos(a)*L*.92,-150+Math.sin(a)*L*.92,16*tl,12*tl,a),tc[(i+1)%3],{lw:5});}
 if(sit<1)for(const [x,d] of [[-20,0],[30,1]]){const k=1-sit;grLine(c,`M${x} -70L${x+10*d-6} ${-70+66*k}L${x+6} ${-4*sit}`,10,'#c88a3a');for(const q of [-1,0,1])grLine(c,`M${x+6} ${-4*sit}l${18+q*4} ${q*8}`,7,'#c88a3a');}
 c.save();c.translate(-30,-190);c.scale(-1,1);c.rotate(-.1-(P.flap||0)*.6);grWing(c,op,P.wing||B.wing);c.restore();
 grUnion(c,[{d:grEll(0,-150,120+20*fl,100+16*fl)},...grLimb([[30,-200],[60,-250]],[110-20*fl])],col,{lw:8,tones:[[grEll(46,-140,62+10*fl,70+10*fl),grRgba(chest,.95)],[grEll(-40,-90,100,40),grRgba(dark,.35)],[grEll(-30,-210,50,20,-.3),grRgba('#ffffff',.3)]]});
 if(fl>0)for(let i=0;i<10;i++){const a=GR_TAU*i/10,x=Math.cos(a)*(132+20*fl),y=-150+Math.sin(a)*(110+16*fl);grPart(c,grLeaf(x*.92,y*.92+(-150)*.08,a,30*fl,16*fl),col,{lw:5});}
 c.save();c.translate(-20,-180);c.scale(-.8,.8);c.rotate(-.35-(P.flap||0)*1.1);grWing(c,op,P.wing||B.wing);c.restore();}
// A bird's head from the front, centred on (0, 0), about 160 units wide: a crest of three feathers, a small hooked beak, Glups's
// eyebrows and his moustache under the beak. P: look, lid, brow, beak (0 to 1, open), turn, wreath, col, dark, crest, chick (0 to 1:
// rounder, with bigger eyes), t.
export function myBirdHead(c,P={}){const B=MY_PHOENIX,col=P.col||B.col,dark=P.dark||B.dark,tn=P.turn||0,fx=tn*18,lid=Array.isArray(P.lid)?P.lid:[P.lid||0,P.lid||0],br=P.brow||0,bk=grClamp(P.beak||0),ch=P.chick||0;
 const cr=P.crest||B.tail;for(let i=0;i<3;i++){const a=-GR_PI/2+(i-1)*.45+.06*Math.sin((P.t||0)*1.4+i);grPart(c,grLeaf(fx*.3+(i-1)*14,-64,a,(80-ch*30)*(i===1?1.15:1),24),cr[i%3],{tones:[[grLeaf(fx*.3+(i-1)*14,-60,a,(80-ch*30)*(i===1?1.15:1),10),grRgba(dark,.3)]],lw:6});}
 grPart(c,grEll(0,0,80+6*ch,76+4*ch),col,{tones:[[grEll(fx*.4,50,64,26),grRgba(dark,.35)],[grEll(-32,-44,26,12,-.3),grRgba('#ffffff',.4)]],lw:8});
 for(const s of [-1,1]){const k=(1-s*tn*.12)*(1+ch*.35);myEye(c,s*34+fx,-14,17*k,P.look||[0,0],lid[s<0?0:1],col);myBrow(c,s*34+fx,-44-ch*6,40*k,br,s*(br<0?.35:-.12));}
 if(bk>.05)grPart(c,grEll(fx,30+bk*8,12,5+bk*12),'#8e2f2a',{lw:4});grPart(c,`M${fx-14} ${24+bk*8}C${fx-12} ${40+bk*24} ${fx+12} ${40+bk*24} ${fx+14} ${24+bk*8}Z`,'#c88a2a',{lw:4});
 grPart(c,`M${fx-20} 4C${fx-22} 22 ${fx-8} 32 ${fx} 46C${fx+8} 32 ${fx+22} 22 ${fx+20} 4C${fx+10} -4 ${fx-10} -4 ${fx-20} 4Z`,'#ffd040',{tones:[[`M${fx+3} 0L${fx+30} 0L${fx+30} 50L${fx+3} 50Z`,grRgba('#c88a2a',.4)]],lw:5});
 c.save();c.translate(fx,54+bk*26);myMoustache2(c,0,0,96-ch*30,P.droop||0);c.restore();
 if(P.wreath)myWreath(c,-70,-52,70,-52,-34,.5-ch*.15,P.t||0);}
// ── The bull (the Minotaur) ────────────────────────────────────────────────────────────────────────────────────────────────
export const MY_BULL={col:'#a8683c',dark:'#7a4424',muzzle:'#e8b48a',horn:'#f4ead0'};
// A bull's head from the front, centred on (0, 0), about 330 units wide with the horns: Glups's curls between the horns, his eyebrows
// and his moustache on the big muzzle, and a gold ring in the nose. P: look, lid, brow, mouth, open, turn, wreath, bow (0 to 1: a red
// bow of thread grows between the horns), t.
export function myBullHead(c,P={}){const B=MY_BULL,tn=P.turn||0,fx=tn*22,lid=Array.isArray(P.lid)?P.lid:[P.lid||0,P.lid||0],br=P.brow||0;
 for(const s of [-1,1]){const pts=myBez([s*70,-58],[s*170,-70],[s*230,-160],[s*176,-236],14);grPart(c,myRibbon(pts,u=>grLerp(46,12,u)),B.horn,{tones:[[myRibbon(pts.map(([x,y])=>[x+s*8,y+6]),u=>grLerp(20,4,u)),grRgba('#c8b890',.6)]],lw:7});}
 for(const s of [-1,1]){c.save();c.translate(s*104,-30);c.rotate(s*.35);grPart(c,`M0 -18C${s*40} -30 ${s*86} -8 ${s*92} 12C${s*66} 26 ${s*30} 20 0 16Z`,B.col,{tones:[[`M${s*10} -6C${s*40} -14 ${s*70} 0 ${s*80} 10C${s*56} 16 ${s*30} 12 ${s*10} 8Z`,grRgba('#e8a0a0',.7)]],lw:7});c.restore();}
 grPart(c,'M-112 -54C-118 -120 118 -120 112 -54C110 20 92 70 0 80C-92 70 -110 20 -112 -54Z',B.col,{tones:[[grEll(0,60,100,40),grRgba(B.dark,.4)],[grEll(-50,-80,40,16,-.2),grRgba('#ffffff',.25)]],lw:8});
 grMane(c,[[-40,-104,22],[-12,-114,24],[16,-112,22],[40,-102,18]],'#2c2233');
 for(const s of [-1,1]){const k=1-s*tn*.12;myEye(c,s*50+fx,-34,20*k,P.look||[0,0],lid[s<0?0:1],B.col);myBrow(c,s*50+fx,-66,50*k,br,s*(br<0?.35:-.12));}
 grPart(c,grEll(fx,58,82,56),B.muzzle,{tones:[[grEll(fx,88,80,24),grRgba(B.dark,.25)],[grEll(fx-30,36,24,10),grRgba('#ffffff',.45)]],lw:7});
 for(const s of [-1,1])grPart(c,grEll(fx+s*30,44,13,10,s*.3),'#5a3020',{lw:0});
 grPart(c,`M${fx-16} 56C${fx-18} 82 ${fx+18} 82 ${fx+16} 56`,'rgba(0,0,0,0)',{lw:0});c.beginPath();c.arc(fx,66,16,.15*GR_PI,.85*GR_PI);c.strokeStyle=GR_INK;c.lineWidth=grLW(c,12);c.stroke();c.strokeStyle='#e8b440';c.lineWidth=grLW(c,6);c.stroke();
 myMoustache2(c,fx,84,128,P.droop||0);myMouth(c,fx,102,P.mouthW||54,P.mouth||'smile',P.open??1);
 if(P.wreath)myWreath(c,-96,-82,96,-82,-40,.6,P.t||0);
 if(P.bow>0){c.save();c.translate(0,-128);c.scale(P.bow,P.bow);for(const s of [-1,1])grPart(c,`M0 0C${s*30} -40 ${s*80} -30 ${s*70} 0C${s*80} 30 ${s*30} 40 0 0Z`,'#d8443a',{lw:6});for(const s of [-1,1])grLine(c,`M0 0Q${s*20} 40 ${s*34} 66`,10,'#d8443a');grPart(c,grEll(0,0,16,14),'#c03a30',{lw:6});c.restore();}}
