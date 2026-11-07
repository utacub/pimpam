// El far (CE28), 0.20: the picture, a Japanese woodblock print of a night sea. Flat planes of colour printed one block at a time, each
// a little off register under its dark key line; graded bands (bokashi) in the sky and the sea; mist bands across the sky; a headland
// with pines and the lighthouse at the left, the port and its jetty at its foot; a great wave curling at the right of the foreground;
// the grain of the wood over the sea and the land. The beam is a soft cone of light ending in an oval pool on the water: its edges are graded and
// its light never changes quickly. The scene is drawn in units of a screen 720 high (W wide); the still parts (the back and the waves
// in front) are drawn once for each night, size and decor into sheets.
import {Kclamp,KeaseInOut,KeaseOut,Ksmooth} from './kaleido-base.js';
import {escBlit,escCanvas,escDecor,escDecorKey,escFrame,escSheet,escVeiled} from './escenari.js';
import {FAR_ARRIVE,FAR_FINAL,FAR_MISS,FAR_NIGHT,FAR_SAIL,FAR_STEP,farBoat,farEnsure,farNear,farPool} from './far.js';

const FR_TAU=Math.PI*2,FR_HZ=360;
const FR_INK='#0c1530',FR_FOAM='#f3eddd',FR_LAMP='#ffd879',FR_TOWER='#efe5cf',FR_BAND='#b3402e',FR_HOUSE='#dccbaa',FR_ROOF='#2b3a50';
// Five skies: [sky top, sky, sky low, horizon, sea near the horizon, sea, deep sea, far coast, near coast, rock, rock light, rock lighter].
const FR_PALETTES=Object.freeze([
 ['#081130','#16305f','#36628f','#86a7b9','#5585ad','#1a4a80','#0d2650','#3a5d86','#557a9e','#1b2840','#30435c','#4f6884'],
 ['#120c2e','#2c2460','#5a4f8f','#a59cc0','#6670a8','#2a3a78','#141f4a','#4a4780','#6a6898','#1d1a3a','#342f5c','#544e80'],
 ['#05201f','#0f3d3e','#2f6b6a','#8db5ad','#4d8a8e','#1a4f5a','#0b2a33','#2f5d5c','#4f7d78','#122826','#254241','#3f6460'],
 ['#0b1438','#243d75','#6a6f9a','#e0a77e','#6a86a8','#22457c','#0f2550','#4b4f7a','#6d6d8c','#1a2240','#2f3a5e','#4d5a80'],
 ['#14234d','#3a5a8c','#8aa3c0','#f0c9b8','#7a9cbc','#2d5a8a','#14305a','#5a7aa0','#7d97b4','#1f2f4f','#36506f','#57718f']]);
// The twenty nights: palette, moon (0 full, 1 crescent, 2 half, 3 none and a band of stars, 4 low and large over the coast), where the
// moon is (0 to 1 across the sea), and a seed for the mist and the coast. The twenty pairs of palette and moon all differ, and two nights
// in a row (also the last and the first) differ in both.
const FR_NIGHTS=Object.freeze(Array.from({length:20},(_,i)=>({pal:i%5,moon:(i*2+Math.floor(i/5))%5,mx:.62+.24*(((i*7)%5)/4),seed:i*31+5})));
export const frNight=v=>FR_NIGHTS[((Math.round(v||0)%20)+20)%20];
const frRng=seed=>{let a=(seed>>>0)||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
const frHash=(x,y,s)=>{let h=(x*374761393+y*668265263+s*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;};
// Value noise that repeats every px by py cells (for a tile of wood grain without seams).
function frNoise(x,y,s,px,py){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),X=i=>((i%px)+px)%px,Y=i=>((i%py)+py)%py;
 const a=frHash(X(xi),Y(yi),s),b=frHash(X(xi+1),Y(yi),s),c=frHash(X(xi),Y(yi+1),s),d=frHash(X(xi+1),Y(yi+1),s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
let FR_GRAIN=null;
// The grain of the wood block and the fibres of the paper: a tile of 384 pixels, laid over the whole print in overlay.
function frGrain(){if(FR_GRAIN!==null)return FR_GRAIN||null;const n=384,cv=escCanvas(n,n),c=cv?.getContext?.('2d');if(!c||!c.createImageData){FR_GRAIN=false;return null;}
 const img=c.createImageData(n,n),d=img.data;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const g=.6*frNoise(x/96,y/3,3,4,128)+.4*frNoise(x/48,y/1.5,4,8,256),k=frNoise(x/24,y/24,7,16,16),v=128+(g-.5)*70+(k-.5)*18+(frHash(x,y,9)-.5)*26,i=(y*n+x)*4;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}
 c.putImageData(img,0,0);FR_GRAIN=cv;return cv;}
// The grain over a sheet when it is made (not at every frame). masked: the sheet is transparent around its shapes (the waves in front),
// so the grain is laid on a copy and cut back to the shapes.
function frGrainOver(c,W,alpha,masked){const g=frGrain(),cv=c.canvas;if(!g||!c.createPattern||!cv)return;
 if(!masked){const p=c.createPattern(g,'repeat');if(!p)return;c.save();c.globalCompositeOperation='overlay';c.globalAlpha=alpha;c.fillStyle=p;c.fillRect(0,0,W,720);c.restore();return;}
 const tmp=escCanvas(cv.width,cv.height),t=tmp?.getContext?.('2d');if(!t||!t.setTransform)return;const p=t.createPattern(g,'repeat');if(!p)return;
 t.drawImage(cv,0,0);t.setTransform(c.getTransform());t.globalCompositeOperation='overlay';t.globalAlpha=alpha;t.fillStyle=p;t.fillRect(0,0,W,720);
 t.setTransform(1,0,0,1,0,0);t.globalCompositeOperation='destination-in';t.globalAlpha=1;t.drawImage(cv,0,0);
 c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='copy';c.drawImage(tmp,0,0);c.restore();tmp.width=tmp.height=1;}
// A printed block: a flat fill a little off register and the dark key line over it.
function frBlock(c,path,fill,line=FR_INK,lw=2.2,off=[1.2,.8]){c.save();c.translate(off[0],off[1]);path();c.fillStyle=fill;c.fill();c.restore();if(line){path();c.strokeStyle=line;c.lineWidth=lw;c.lineJoin='round';c.lineCap='round';c.stroke();}}
function frGrad(c,y0,y1,stops){const g=c.createLinearGradient(0,y0,0,y1);stops.forEach(([t,col])=>g.addColorStop(t,col));return g;}
function frRgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}
// A mist band (kasumi): long and flat with rounded ends, graded at its lower edge.
function frMist(c,x,y,len,th,alpha,col){c.save();c.globalAlpha*=alpha;const g=frGrad(c,y-th/2,y+th/2,[[0,frRgba(col,.95)],[.7,frRgba(col,.7)],[1,frRgba(col,0)]]);
 c.beginPath();c.moveTo(x,y-th/2);c.lineTo(x+len,y-th/2);c.arc(x+len,y,th/2,-Math.PI/2,Math.PI/2);c.lineTo(x,y+th/2);c.arc(x,y,th/2,Math.PI/2,Math.PI*1.5);c.fillStyle=g;c.fill();c.restore();}
// ── Where things are ─────────────────────────────────────────────────────────────────────────────────────────────────────
// A: the width that the headland and the port are drawn for (they keep their shape on wide screens; the sea takes the rest).
const frA=W=>Math.min(W,1280);
// The track of the pool across the sea: 0 out by the horizon at the right, 1 near the port at the left.
export function frTrack(W,t){const A=frA(W),x0=W*.95,x1=A*.36;return [x0+(x1-x0)*t,FR_HZ+720*(.06+.26*t*t)];}
// The size of a boat at a height on the sea (smaller towards the horizon).
const frDepth=y=>.56+.5*Kclamp((y-FR_HZ)/230);
// The berths at the jetty, from the land outwards.
function frBerth(W,j){const A=frA(W),x=A*(.25+.055*j);return [x,720*(.665-.025*(x/A-.13)/.245)+16];}
const frLamp=W=>{const A=frA(W);return [A*.15,720*.07+14];};
// ── The back: sky, moon, stars, mist, coast, sea, headland, lighthouse, port ────────────────────────────────────────────
function frBack(c,W,night){const N=frNight(night),P=FR_PALETTES[N.pal],r=frRng(N.seed),A=frA(W),hz=FR_HZ,h=720;
 c.fillStyle=frGrad(c,0,hz+4,[[0,P[0]],[.4,P[1]],[.8,P[2]],[1,P[3]]]);c.fillRect(-2,-2,W+4,hz+6);
 c.fillStyle=frGrad(c,0,h*.12,[[0,'rgba(5,10,30,.75)'],[1,'rgba(5,10,30,0)']]);c.fillRect(-2,-2,W+4,h*.12);
 // the moon with its halo printed in rings, or a band of stars when there is no moon
 const mx=W*N.mx,my=N.moon===4?hz-58:h*(.13+.05*(N.seed%3));
 if(N.moon!==3){const R=N.moon===4?62:42,moon=N.moon===4?'#f6d6a0':'#f4e7c6';for(let k=4;k>0;k--){c.fillStyle=frRgba(moon,.04*k);c.beginPath();c.arc(mx,my,R+k*20,0,FR_TAU);c.fill();}
  // the lit part only: the whole disc, a half (the left one) or a crescent (the disc without a second disc over its right side)
  const disc=()=>{c.beginPath();c.arc(mx,my,R,0,FR_TAU);},cut=()=>c.arc(mx+R*.45,my-R*.12,R*.9,0,FR_TAU);
  if(N.moon===2)frBlock(c,()=>{c.beginPath();c.arc(mx,my,R,Math.PI/2,Math.PI*1.5);c.closePath();},moon,'#c9b58a',1.4,[0,0]);
  else if(N.moon===1){c.save();disc();c.clip();c.beginPath();c.arc(mx,my,R,0,FR_TAU);cut();c.fillStyle=moon;c.fill('evenodd');c.beginPath();cut();c.strokeStyle='#c9b58a';c.lineWidth=1.4;c.stroke();c.restore();
   c.save();c.beginPath();c.rect(mx-2*R,my-2*R,4*R,4*R);cut();c.clip('evenodd');disc();c.strokeStyle='#c9b58a';c.lineWidth=1.4;c.stroke();c.restore();}
  else frBlock(c,disc,moon,'#c9b58a',1.4,[0,0]);}
 const stars=N.moon===3?150:80;for(let i=0;i<stars;i++){let x=r()*W,y=r()*hz*.8;if(N.moon===3&&i<70){const u=r();x=W*(.1+.85*u);y=h*(.06+.28*u)+(r()-.5)*60;}const s=r()<.12?2.4:1.3;if(N.moon!==3&&Math.hypot(x-mx,y-my)<110)continue;c.fillStyle=`rgba(244,231,198,${(.45+r()*.5).toFixed(2)})`;c.fillRect(x,y,s,s);}
 // the mist, across the sky and the far coast
 const mist=P[3];frMist(c,W*(.38+.1*r()),h*.3,W*.3,h*.03,.3,mist);frMist(c,W*(.58+.08*r()),h*.37,W*.38,h*.026,.26,mist);frMist(c,W*(.3+.1*r()),h*.435,W*.24,h*.022,.2,mist);
 // the far coast: a low range in two graded blocks, with a hill whose place changes with the night
 const hill=.55+.25*r();for(const [k,col,amp] of [[0,P[7],34],[1,P[8],18]]){c.beginPath();c.moveTo(A*.34,hz);for(let x=A*.34;x<=W+8;x+=8){const b=Math.abs(x/W-hill)<.12?40*Math.cos((x/W-hill)/.12*Math.PI/2):0;c.lineTo(x,hz-6-amp*frNoise(x*.006,k,N.seed+k,1e6,1e6)-b*(1-k*.6));}c.lineTo(W+8,hz);c.closePath();
  c.fillStyle=frGrad(c,hz-80,hz,[[0,col],[1,P[3]]]);c.fill();c.strokeStyle=FR_INK;c.lineWidth=1.3;c.stroke();}
 // the sea: graded from the horizon down, carved wave lines in rows that widen towards us
 c.fillStyle=frGrad(c,hz,h,[[0,P[4]],[.12,P[5]],[.55,P[6]],[1,'#081a38']]);c.fillRect(-2,hz,W+4,h-hz+2);
 if(N.moon===4){c.save();c.globalAlpha=.5;for(let k=0;k<14;k++){const y=hz+6+k*k*1.6,ww=(30+k*9)*(1-k/18);c.fillStyle=frRgba('#f6d6a0',.5-.03*k);c.fillRect(mx-ww/2+Math.sin(k*1.7)*6,y,ww,2+k*.25);}c.restore();}
 c.save();c.beginPath();c.rect(-2,hz,W+4,h-hz);c.clip();
 for(let row=0;row<30;row++){const t=row/29,y=hz+6+Math.pow(t,1.7)*(h-hz-10),amp=1.5+t*8,len=18+t*96;c.strokeStyle=t<.35?'rgba(170,204,228,.5)':'rgba(110,162,210,.45)';c.lineWidth=.7+t*1.7;
  for(let x=-len+(row%2)*len*.5;x<W+len;x+=len){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+len*.25,y-amp,x+len*.5,y);c.quadraticCurveTo(x+len*.75,y+amp*.35,x+len,y);c.stroke();}}
 c.restore();
 // the headland: rock planes with key lines and strata, pines on the ridge
 const rock=()=>{c.beginPath();c.moveTo(-5,h*.17);c.lineTo(A*.06,h*.2);c.lineTo(A*.12,h*.26);c.lineTo(A*.17,h*.27);c.lineTo(A*.22,h*.34);c.lineTo(A*.25,h*.44);c.lineTo(A*.31,h*.5);c.lineTo(A*.355,h*.59);c.lineTo(A*.28,h*.615);c.lineTo(-5,h*.65);c.closePath();};
 frBlock(c,rock,P[9],FR_INK,2.4);
 c.save();rock();c.clip();
 for(const [pts,col] of [[[[0,.24],[.11,.28],[.2,.36],[.23,.46],[.15,.44],[.05,.36],[0,.38]],P[10]],[[[.07,.44],[.2,.47],[.29,.53],[.33,.6],[.2,.58],[.1,.54]],P[11]],[[[0,.47],[.1,.5],[.16,.6],[0,.62]],P[10]]]){
  c.beginPath();pts.forEach(([a,b],i)=>i?c.lineTo(A*a,h*b):c.moveTo(A*a,h*b));c.closePath();c.fillStyle=frGrad(c,h*Math.min(...pts.map(p=>p[1])),h*Math.max(...pts.map(p=>p[1])),[[0,col],[1,P[9]]]);c.fill();c.strokeStyle=FR_INK;c.lineWidth=1.6;c.stroke();}
 c.strokeStyle='rgba(140,170,200,.42)';c.lineWidth=1.3;for(let i=0;i<46;i++){const x=r()*A*.33,y=h*.24+r()*h*.4;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+8,y+1,x+14+r()*16,y+4+r()*6);c.stroke();}
 c.restore();
 for(const [px,py,ps,lean] of [[.025,.19,1.1,-.1],[.075,.215,.85,.15],[.22,.35,.7,.25],[.25,.43,.55,.1]]){c.save();c.translate(A*px,h*py);c.scale(ps,ps);c.strokeStyle=FR_INK;c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(6,-24,-14,-40,-4+lean*40,-66);c.stroke();
  for(const [a,b,rw,col] of [[-4+lean*40,-70,40,'#173a34'],[10+lean*20,-50,34,'#24514a'],[-16+lean*10,-34,28,'#173a34']]){frBlock(c,()=>{c.beginPath();c.moveTo(a-rw,b+4);c.quadraticCurveTo(a-rw*.6,b-12,a,b-11);c.quadraticCurveTo(a+rw*.7,b-12,a+rw,b+4);c.quadraticCurveTo(a,b+9,a-rw,b+4);c.closePath();},col,FR_INK,1.6);
   c.strokeStyle='rgba(120,170,150,.6)';c.lineWidth=1.2;for(let j=-2;j<=2;j++){c.beginPath();c.moveTo(a+j*rw*.3-6,b-2);c.lineTo(a+j*rw*.3+6,b-6);c.stroke();}}c.restore();}
 frTower(c,W);
 // the port: a stone jetty and houses at the foot of the headland (their windows are lit in the picture of each moment)
 frBlock(c,()=>{c.beginPath();c.moveTo(A*.13,h*.635);c.lineTo(A*.37,h*.612);c.lineTo(A*.375,h*.64);c.lineTo(A*.13,h*.665);c.closePath();},'#8e8a7c',FR_INK,1.8);
 c.strokeStyle=FR_INK;c.lineWidth=1;for(let x=A*.15;x<A*.37;x+=17){const y=h*.635-(x-A*.13)/(A*.24)*h*.023;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+h*.024);c.stroke();}
 frHouses(c,W,(x,y,hw,hh)=>{c.fillStyle='#45464a';c.fillRect(x+12,y-hh+9,10,11);});
 // the rope of paper lanterns along the jetty (unlit), and the grain of the block
 frLanterns(c,W,0,1);frGrainOver(c,W,.32,false);}
function frHouses(c,W,window,walls=true){const A=frA(W),h=720;for(let i=0;i<6;i++){const x=A*(.005+i*.033),y=h*(.615-i*.005),hw=36,hh=28+(i%3)*7;
 if(walls){frBlock(c,()=>{c.beginPath();c.rect(x,y-hh,hw,hh);},FR_HOUSE,FR_INK,1.6);frBlock(c,()=>{c.beginPath();c.moveTo(x-5,y-hh);c.lineTo(x+hw/2,y-hh-15);c.lineTo(x+hw+5,y-hh);c.closePath();},FR_ROOF,FR_INK,1.6);}window(x,y,hw,hh,i);}}
// The lighthouse: a white tower with red bands, the gallery, the lantern and its roof.
function frTower(c,W){const A=frA(W),tx=A*.15,tb=720*.27,tt=720*.07,body=()=>{c.beginPath();c.moveTo(tx-26,tb);c.lineTo(tx-17,tt+30);c.lineTo(tx+17,tt+30);c.lineTo(tx+26,tb);c.closePath();};
 frBlock(c,body,FR_TOWER,FR_INK,2);c.save();body();c.clip();for(const k of [.12,.45,.78]){const y=tt+30+(tb-tt-30)*k;c.fillStyle=FR_BAND;c.fillRect(tx-40,y,80,13);}c.fillStyle='rgba(12,21,48,.18)';c.fillRect(tx+4,tt,30,tb);c.restore();
 c.strokeStyle=FR_INK;c.lineWidth=1.4;for(const k of [.12,.45,.78]){const y=tt+30+(tb-tt-30)*k;c.beginPath();c.moveTo(tx-30,y);c.lineTo(tx+30,y);c.moveTo(tx-30,y+13);c.lineTo(tx+30,y+13);c.stroke();}
 frBlock(c,()=>{c.beginPath();c.rect(tx-24,tt+24,48,6);},'#2a2f3c',FR_INK,1.4);frBlock(c,()=>{c.beginPath();c.rect(tx-13,tt+4,26,20);},FR_LAMP,FR_INK,1.6);
 frBlock(c,()=>{c.beginPath();c.moveTo(tx-18,tt+4);c.lineTo(tx,tt-14);c.lineTo(tx+18,tt+4);c.closePath();},'#8a2e24',FR_INK,1.6);c.fillStyle=FR_INK;c.beginPath();c.arc(tx,tt-16,3,0,FR_TAU);c.fill();}
// The rope of lanterns along the jetty: lit is how many are lit (0 to 5), a how much.
function frLanterns(c,W,lit,a){const A=frA(W),h=720,x0=A*.15,x1=A*.36,y=k=>h*.6-(k-x0)/(x1-x0)*h*.02;c.strokeStyle=FR_INK;c.lineWidth=1.2;c.beginPath();
 for(let x=x0;x<=x1;x+=4){const u=(x-x0)/(x1-x0),yy=y(x)+Math.sin(u*Math.PI*5)**2*7;x===x0?c.moveTo(x,yy):c.lineTo(x,yy);}c.stroke();
 for(let k=0;k<5;k++){const x=x0+(k+.5)/5*(x1-x0),yy=y(x)+7+4,on=k<lit?a:0;if(on>0){const g=c.createRadialGradient(x,yy,1,x,yy,24);g.addColorStop(0,`rgba(255,200,110,${(.55*on).toFixed(3)})`);g.addColorStop(1,'rgba(255,200,110,0)');c.fillStyle=g;c.fillRect(x-24,yy-24,48,48);}
  frBlock(c,()=>{c.beginPath();c.ellipse(x,yy,5,7,0,0,FR_TAU);},on>0?`rgb(${Math.round(120+135*on)},${Math.round(70+140*on)},${Math.round(60+60*on)})`:'#7a3b30',FR_INK,1.1,[0,0]);}}
// ── The waves in front ───────────────────────────────────────────────────────────────────────────────────────────────────
function frClaw(c,x,y,a,L,S){c.beginPath();c.moveTo(x-3*S*Math.sin(a),y+3*S*Math.cos(a));c.quadraticCurveTo(x+Math.cos(a)*L*.55-Math.sin(a)*5*S,y+Math.sin(a)*L*.55+Math.cos(a)*5*S,x+Math.cos(a+.55)*L,y+Math.sin(a+.55)*L);
 c.quadraticCurveTo(x+Math.cos(a)*L*.45+Math.sin(a)*2*S,y+Math.sin(a)*L*.45-Math.cos(a)*2*S,x+3*S*Math.sin(a),y-3*S*Math.cos(a));c.closePath();c.fillStyle=FR_FOAM;c.fill();c.strokeStyle=FR_INK;c.lineWidth=1.2*S;c.stroke();}
function frBez(p0,p1,p2,p3,t){const u=1-t;return [u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]];}
function frFront(c,W,night){const N=frNight(night),P=FR_PALETTES[N.pal],r=frRng(N.seed+3),h=720;
 // rolling waves over the whole width
 for(let k=0;k<2;k++){const base=h-(70-k*40),amp=30-k*8,per=230;const yAt=x=>base-Math.pow(Math.max(0,Math.sin(x/per+k*1.3)),2.4)*amp;
  const path=()=>{c.beginPath();c.moveTo(-10,h+10);for(let x=-10;x<=W+10;x+=5)c.lineTo(x,yAt(x));c.lineTo(W+10,h+10);c.closePath();};
  frBlock(c,path,k?P[6]:P[5],FR_INK,2);c.save();path();c.clip();c.strokeStyle='rgba(120,170,214,.45)';c.lineWidth=1.4;for(let j=1;j<6;j++){c.beginPath();for(let x=-10;x<=W+10;x+=5){const y=yAt(x)+j*9;x<=-10?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}c.restore();
  for(let x=0;x<W;x+=5){const u=x/per+k*1.3;if(Math.sin(u)>.985&&Math.cos(u)<0){for(let f=0;f<7;f++){const fx=x-14+f*5,fy=yAt(fx)-2;frClaw(c,fx,fy,-Math.PI/2-.5,9+r()*5,1);}x+=140;}}}
 // the great wave at the right, its crest curling to the left with claws of foam (smaller on narrow screens)
 const S=.8*Math.min(1,W/1280),X=x=>W-(1280-x)*S,Y=y=>h-(720-y)*S,Pt=([x,y])=>[X(x),Y(y)];
 const A=[600,722],B1=[760,706],B2=[860,650],B=[905,592],C1=[925,560],C2=[905,530],Ct=[870,534],D1=[900,440],D2=[1000,398],D=[1092,420],E1=[1185,434],E2=[1262,482],E=[1292,566];
 const body=()=>{c.beginPath();c.moveTo(...Pt(A));c.bezierCurveTo(...Pt(B1),...Pt(B2),...Pt(B));c.bezierCurveTo(...Pt(C1),...Pt(C2),...Pt(Ct));c.bezierCurveTo(...Pt(D1),...Pt(D2),...Pt(D));c.bezierCurveTo(...Pt(E1),...Pt(E2),...Pt(E));c.lineTo(...Pt([1292,722]));c.closePath();};
 frBlock(c,body,P[5],FR_INK,2.6);c.save();body();c.clip();c.fillStyle=frGrad(c,Y(430),Y(720),[[0,P[4]],[.35,P[5]],[1,P[6]]]);c.fillRect(0,Y(400),W,h);
 c.strokeStyle='rgba(160,205,236,.55)';c.lineWidth=1.7*S;for(let k=1;k<8;k++){const o=k*17;c.beginPath();c.moveTo(...Pt([A[0]+o,722]));c.bezierCurveTo(...Pt([B1[0]+o,B1[1]]),...Pt([B2[0]+o,B2[1]]),...Pt([B[0]+o,B[1]]));c.stroke();}
 for(let k=1;k<11;k++){const o=k*15;c.beginPath();c.moveTo(...Pt([Ct[0]+40,Ct[1]+o]));c.bezierCurveTo(...Pt([D1[0],D1[1]+o]),...Pt([D2[0],D2[1]+o]),...Pt([D[0],D[1]+o]));c.bezierCurveTo(...Pt([E1[0],E1[1]+o]),...Pt([E2[0],E2[1]+o]),...Pt([E[0],E[1]+o]));c.stroke();}
 c.fillStyle='rgba(8,24,56,.55)';c.beginPath();c.moveTo(...Pt(B));c.bezierCurveTo(...Pt([935,575]),...Pt([960,540]),...Pt([1000,520]));c.bezierCurveTo(...Pt([960,515]),...Pt([925,520]),...Pt(Ct));c.bezierCurveTo(...Pt(C2),...Pt(C1),...Pt(B));c.fill();c.restore();
 const crest=t=>t<.5?frBez(D,D2,D1,Ct,t*2):frBez(Ct,[C2[0]-6,C2[1]+4],[C1[0]-8,C1[1]],[B[0]-6,B[1]],(t-.5)*2*.6);
 const N2=40,outer=[],inner=[];for(let i=0;i<=N2;i++){const t=i/N2*.75,[x,y]=crest(t),[x2,y2]=crest(Math.min(1,t+.01)),a=Math.atan2(y2-y,x2-x),th=46*Math.pow(Math.sin(Math.PI*Math.min(1,t/.75)),.75)*(1-t*.45);outer.push(Pt([x,y]));inner.push(Pt([x+Math.cos(a-Math.PI/2)*th,y+Math.sin(a-Math.PI/2)*th]));}
 const band=()=>{c.beginPath();outer.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));inner.slice().reverse().forEach(p=>c.lineTo(...p));c.closePath();};
 frBlock(c,band,FR_FOAM,FR_INK,1.8);c.save();band();c.clip();c.strokeStyle='rgba(120,160,200,.5)';c.lineWidth=1.3*S;for(let k=1;k<4;k++){c.beginPath();outer.forEach(([x,y],i)=>{const [ix,iy]=inner[i],q=k/4;i?c.lineTo(x+(ix-x)*q,y+(iy-y)*q):c.moveTo(x+(ix-x)*q,y+(iy-y)*q);});c.stroke();}c.restore();
 for(let i=2;i<=N2;i++){const t=i/N2*.75,[x,y]=crest(t),[x2,y2]=crest(Math.min(1,t+.01)),a=Math.atan2(y2-y,x2-x)+Math.PI/2,L=(24+r()*16)*Math.min(1,.3+t*4)*S;frClaw(c,X(x),Y(y),a,L,S);if(i%2===0)frClaw(c,X(x),Y(y),a+.45,L*.65,S);}
 for(let i=0;i<90;i++){const t=r()*.6,[x,y]=crest(t),d=10+r()*60;c.fillStyle=`rgba(243,237,221,${(.55+r()*.45).toFixed(2)})`;c.beginPath();c.arc(X(x-d*.5),Y(y-d*.8),(1.2+r()*2.6)*S,0,FR_TAU);c.fill();}
 frGrainOver(c,W,.32,true);}
// ── Boats ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Eight boats: sail colour and sail (square with battens, or a long triangular one), hull.
const FR_SAILS=Object.freeze([['#8f9aa6','#f5e3b6'],['#9a8a78','#f2d39a'],['#8c7d8a','#f3cfc0'],['#7f9590','#e6efd8']]);
const FR_HULLS=Object.freeze(['#3a2418','#4a2a20','#2f2a28','#3d2c1c']);
// lit: 0 dark to 1 lanterns lit; glow: how much the light of the beam is on it (the window of the press).
function frBoat(c,x,y,s,look,lit,flip,glow){const [dark,light]=FR_SAILS[look%4],lateen=look>=4,hull=FR_HULLS[(look*3)%4];c.save();c.translate(x,y);c.scale(s*flip,s);
 if(glow>0){const g=c.createRadialGradient(0,-38,4,0,-38,96);g.addColorStop(0,`rgba(255,226,150,${(.32*glow).toFixed(3)})`);g.addColorStop(1,'rgba(255,226,150,0)');c.fillStyle=g;c.fillRect(-100,-140,200,200);}
 if(lit>0){const g=c.createRadialGradient(0,-34,2,0,-34,110);g.addColorStop(0,`rgba(255,214,120,${(.5*lit).toFixed(3)})`);g.addColorStop(1,'rgba(255,214,120,0)');c.fillStyle=g;c.fillRect(-110,-150,220,220);}
 frBlock(c,()=>{c.beginPath();c.moveTo(-50,-6);c.quadraticCurveTo(-32,16,0,16);c.quadraticCurveTo(36,16,58,-14);c.lineTo(40,-3);c.lineTo(-44,-3);c.closePath();},hull,FR_INK,2.2);
 c.strokeStyle='#6b4a2e';c.lineWidth=2;c.beginPath();c.moveTo(-40,4);c.quadraticCurveTo(0,10,46,-2);c.stroke();
 c.strokeStyle=FR_INK;c.lineWidth=2.6;c.beginPath();c.moveTo(-4,-3);c.lineTo(-4,-86);c.stroke();
 const k=Math.max(lit,glow*.45),sail=frMixHex(dark,light,k);
 if(!lateen){frBlock(c,()=>{c.beginPath();c.moveTo(-30,-82);c.lineTo(24,-82);c.quadraticCurveTo(30,-50,22,-16);c.lineTo(-26,-16);c.quadraticCurveTo(-20,-50,-30,-82);c.closePath();},sail,FR_INK,1.8);
  c.strokeStyle=frMixHex('#6c7783','#b9a173',k);c.lineWidth=1.6;for(let j=1;j<6;j++){const yy=-82+j*11;c.beginPath();c.moveTo(-28+Math.sin(j)*2,yy);c.lineTo(26-Math.abs(3-j),yy);c.stroke();}}
 else{frBlock(c,()=>{c.beginPath();c.moveTo(-4,-88);c.quadraticCurveTo(30,-50,44,-12);c.lineTo(-2,-12);c.closePath();},sail,FR_INK,1.8);
  c.strokeStyle=frMixHex('#6c7783','#b9a173',k);c.lineWidth=1.4;for(let j=1;j<4;j++){c.beginPath();c.moveTo(-3,-88+j*19);c.lineTo(-3+j*11,-12-j*2);c.stroke();}}
 for(const lx of [-38,46]){const ly=lx<0?-20:-26;c.strokeStyle=FR_INK;c.lineWidth=1.4;c.beginPath();c.moveTo(lx,-3);c.lineTo(lx,ly);c.stroke();
  frBlock(c,()=>{c.beginPath();c.ellipse(lx,ly-6,5,7,0,0,FR_TAU);},frMixHex('#4d4b46',FR_LAMP,Math.max(lit,glow*.3)),FR_INK,1.3,[0,0]);
  if(lit>0){const g=c.createRadialGradient(lx,ly-6,1,lx,ly-6,26);g.addColorStop(0,`rgba(255,222,140,${(.85*lit).toFixed(3)})`);g.addColorStop(1,'rgba(255,222,140,0)');c.fillStyle=g;c.beginPath();c.arc(lx,ly-6,26,0,FR_TAU);c.fill();}}
 c.restore();
 if(lit>0){c.save();c.globalCompositeOperation='screen';c.strokeStyle=`rgba(255,214,120,${(.5*lit).toFixed(3)})`;c.lineWidth=2.2*s;for(let j=0;j<6;j++){const ww=(22-j*2)*s;c.beginPath();c.moveTo(x-ww,y+(18+j*8)*s);c.lineTo(x+ww,y+(18+j*8)*s);c.stroke();}c.restore();}}
function frMixHex(a,b,t){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),m=(sh)=>Math.round((A>>sh&255)+((B>>sh&255)-(A>>sh&255))*Kclamp(t));return `rgb(${m(16)},${m(8)},${m(0)})`;}
// ── The beam ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A cone from the lantern to an oval pool on the water. On a white base with little picture the light is warm paint instead.
function frBeam(c,lx,ly,px,py,R,bright,paint){c.save();c.globalCompositeOperation=paint?'source-over':'screen';const a=Math.atan2(py-ly,px-lx),n=[-Math.sin(a),Math.cos(a)],col=paint?'255,176,60':'255,230,165',k=paint?.6:1;
 for(let j=0;j<6;j++){const s=R*(1-j*.14);c.beginPath();c.moveTo(lx+n[0]*4,ly+n[1]*4);c.lineTo(px+n[0]*s,py+n[1]*s*.45);c.lineTo(px-n[0]*s,py-n[1]*s*.45);c.lineTo(lx-n[0]*4,ly-n[1]*4);c.closePath();
  const g=c.createLinearGradient(lx,ly,px,py);g.addColorStop(0,`rgba(${col},${(.14*bright*k).toFixed(3)})`);g.addColorStop(1,`rgba(${col},${(.05*bright*k).toFixed(3)})`);c.fillStyle=g;c.fill();}
 c.translate(px,py);c.scale(1,.32);for(let j=0;j<5;j++){const g=c.createRadialGradient(0,0,0,0,0,R*(1.2-j*.15));g.addColorStop(0,`rgba(${col},${(.28*bright*k).toFixed(3)})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(0,0,R*1.3,0,FR_TAU);c.fill();}
 c.restore();}
// Light on the water inside the pool: short strokes that drift slowly.
function frGlints(c,px,py,R,time,alpha,paint){if(alpha<=0)return;c.save();c.globalCompositeOperation=paint?'source-over':'screen';c.lineCap='round';
 for(let i=0;i<9;i++){const u=(i*.37+time*.05)%1,ox=(frHash(i,1,3)-.5)*1.6*R,oy=(frHash(i,2,3)-.5)*.5*R,a=Math.sin(u*Math.PI)*alpha;if(a<=.01)continue;c.strokeStyle=paint?`rgba(220,140,40,${(.5*a).toFixed(3)})`:`rgba(255,240,200,${(.55*a).toFixed(3)})`;c.lineWidth=1.6;
  c.beginPath();c.moveTo(px+ox-8-u*6,py+oy);c.lineTo(px+ox+8-u*6,py+oy);c.stroke();}c.restore();}
// The shimmer of a press that reached no boat: small four-pointed sparks that come and go on the water where the light was.
function frSparks(c,px,py,R,age,paint){if(age<0||age>FAR_MISS)return;c.save();c.globalCompositeOperation=paint?'source-over':'screen';
 for(let i=0;i<11;i++){const t0=i*.06,u=Kclamp((age-t0)/1.1),a=Math.sin(u*Math.PI);if(a<=.01)continue;const x=px+(frHash(i,5,8)-.5)*1.5*R,y=py+(frHash(i,6,8)-.5)*.45*R-u*6,s=(3+frHash(i,7,8)*4)*(.6+.4*a);
  c.fillStyle=paint?`rgba(220,140,40,${(.7*a).toFixed(3)})`:`rgba(255,244,214,${(.8*a).toFixed(3)})`;c.beginPath();c.moveTo(x,y-s);c.quadraticCurveTo(x,y,x+s,y);c.quadraticCurveTo(x,y,x,y+s);c.quadraticCurveTo(x,y,x-s,y);c.quadraticCurveTo(x,y,x,y-s);c.fill();}c.restore();}
// ── The picture ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// o: game (the state of the sea, far.js), t (seconds of the press running, or null), duration, period and window (settings), boats,
// reduced, preview, background, base, opacity.
export function drawFar(c,w,h,o){escFrame();const S=h/720,W=w/S,decor=escDecor(o),paint=decor.white&&decor.fade<.5;
 const G=o.preview?frPreview(o):o.game&&o.game.farBeam!==undefined?o.game:farEnsure({variant:o.game?.variant??0},{farBoats:o.boats});
 const night=G.variant||0,now=o.preview?6:G.farNow||0,motion=o.reduced?0:now,ret=G.farRet,t=o.preview?null:o.t??null,D=o.duration||(ret?.final?FAR_FINAL:FAR_STEP);
 // The change of night, at the end of the third boat home: the next night comes in over this one.
 const change=ret?.final&&t!==null?Ksmooth((t-(D-FAR_NIGHT))/FAR_NIGHT):0,next=(night+1)%20;
 c.save();c.scale(S,S);if(decor.fade<1){c.fillStyle=decor.base;c.fillRect(0,0,W,720);}
 const key=n=>`${n}|${W.toFixed(1)}${escDecorKey(decor)}`;
 // The sheets of the next night are made a little ahead, while the third boat is at the jetty (one at a time), so that the change of
 // night does not wait for them.
 if(ret?.final&&t!==null&&decor.fade>0&&change===0){if(t>FAR_SAIL+1)escSheet(c,'fr-back|'+key(next),W,720,escVeiled(decor,(sc,sw)=>frBack(sc,sw,next)));if(t>FAR_SAIL+2.5)escSheet(c,'fr-front|'+key(next),W,720,escVeiled(decor,(sc,sw)=>frFront(sc,sw,next)));}
 if(decor.fade>0){escBlit(c,'fr-back|'+key(night),W,720,escVeiled(decor,(sc,sw)=>frBack(sc,sw,night)));if(change>0)escBlit(c,'fr-back|'+key(next),W,720,escVeiled(decor,(sc,sw)=>frBack(sc,sw,next)),change);}
 else frTower(c,W);
 // Lights of the port: windows and lanterns, more of them with each boat home.
 const home=G.farHome||0,docking=ret&&t!==null?KeaseOut(Kclamp((t-FAR_SAIL+.4)/1.2)):0,lights=Math.min(5,home*2+(ret?docking*2:0)),fade=decor.fade*(1-change);
 if(fade>0){c.save();c.globalAlpha*=fade;frHouses(c,W,(x,y,hw,hh,i)=>{const on=i%2===0||i<lights+1;if(!on)return;const g=c.createRadialGradient(x+17,y-hh+14,1,x+17,y-hh+14,22);g.addColorStop(0,'rgba(255,220,130,.45)');g.addColorStop(1,'rgba(255,220,130,0)');c.fillStyle=g;c.fillRect(x-10,y-hh-10,50,50);c.fillStyle=FR_LAMP;c.fillRect(x+12,y-hh+9,10,11);},false);
  frLanterns(c,W,Math.ceil(lights),1);c.restore();}
 // The lamp of the lighthouse glows; the beam comes from it.
 const [lx,ly]=frLamp(W);c.save();c.globalCompositeOperation=paint?'source-over':'screen';for(let k=3;k>0;k--){c.fillStyle=paint?`rgba(255,176,60,${.08*k})`:`rgba(255,226,150,${.12*k})`;c.beginPath();c.arc(lx,ly,18+k*16,0,FR_TAU);c.fill();}c.restore();
 // Where the beam points: along its track, or on the boat it is guiding home, and back to the near end of its track once it is there.
 const P=o.period||16,Wn=o.window||3;let aim=frTrack(W,farPool(G.farBeam??.5)),retPos=null;
 if(ret){const rt=o.preview?.9:t??0;retPos=frReturn(W,ret,rt,o.reduced);const back=KeaseInOut(Kclamp((rt-FAR_SAIL-.2)/1.4)),near=frTrack(W,1);aim=[retPos.x+(near[0]-retPos.x)*back,retPos.y-8+(near[1]-retPos.y+8)*back];}
 const R=60+70*Kclamp((aim[1]-FR_HZ)/230),missAge=G.farMiss&&t!==null&&!ret?t:-1,bright=1+.15*Math.sin(Kclamp(missAge/FAR_MISS)*Math.PI);
 frBeam(c,lx,ly,aim[0],aim[1],R,bright,paint);frGlints(c,aim[0],aim[1],R,now,1,paint);
 // Boats at the jetty (they leave with the night when it changes), boats at sea, the boat on its way home.
 (G.farDocked||[]).forEach((look,j)=>{const [x,y]=frBerth(W,j),bob=Math.sin(motion*1.1+j*2)*1.5;frBoat(c,x,y+bob,frDepth(y)*.92,look,1-change,-1,0);});
 const sea=(G.farSea||[]).filter(b=>!(ret&&b.slot===ret.slot));
 for(const b of sea){const [x,y0]=frTrack(W,b.t),age=now-b.born,arrive=o.preview?1:Ksmooth(age/FAR_ARRIVE),y=y0+6+(o.reduced?0:Math.sin(motion*1.3+b.slot*2.1)*2),s=frDepth(y);
  const glow=ret?0:farNear(G.farBeam??.5,b.t,P,Wn)*Ksmooth(age/(FAR_ARRIVE*.6));c.save();c.globalAlpha*=arrive;frBoat(c,x+(1-arrive)*30,y,s,b.look,0,b.flip,glow);c.restore();}
 if(retPos){const {x,y,s,flip,lit,wake}=retPos;if(wake>0){c.save();c.strokeStyle=`rgba(243,237,221,${(.7*wake).toFixed(3)})`;c.lineWidth=2;for(let k=0;k<5;k++){const d=(40+k*26)*s;c.beginPath();c.moveTo(x+d,y+8*s+k*2*s);c.quadraticCurveTo(x+d+14*s,y+3*s,x+d+28*s,y+9*s+k*2*s);c.stroke();}c.restore();}
  frBoat(c,x,y,s,ret.boat.look,lit,flip,0);}
 if(missAge>=0&&G.farMiss){const [mx,my]=frTrack(W,G.farMiss.p);frSparks(c,mx,my,60+70*Kclamp((my-FR_HZ)/230),missAge,paint);}
 // The waves in front.
 if(decor.fade>0){escBlit(c,'fr-front|'+key(night),W,720,escVeiled(decor,(sc,sw)=>frFront(sc,sw,night)));if(change>0)escBlit(c,'fr-front|'+key(next),W,720,escVeiled(decor,(sc,sw)=>frFront(sc,sw,next)),change);}
 c.restore();}
// The boat on its way home: from its place at sea to its berth, turning towards the port, its lanterns lighting up as it starts.
function frReturn(W,ret,t,reduced){const [x0,y0a]=frTrack(W,ret.boat.t),y0=y0a+6,[xb,yb]=frBerth(W,ret.berth),u=KeaseInOut(Kclamp((t-.6)/(FAR_SAIL-.6)));
 const cx=(x0+xb)/2+40,cy=(y0+yb)/2+24,x=(1-u)*(1-u)*x0+2*(1-u)*u*cx+u*u*xb,y=(1-u)*(1-u)*y0+2*(1-u)*u*cy+u*u*yb+(reduced?0:Math.sin(t*1.6)*1.5*(1-u));
 const turn=Kclamp(t/.6),flip=ret.boat.flip<0?-1:Math.cos(turn*Math.PI),s=frDepth(y)*(.92+.08*(1-u)),lit=Ksmooth(t/.5),wake=Math.sin(Math.PI*Kclamp((t-.6)/(FAR_SAIL-.6)))*.9;
 return {x,y,s,flip:Math.abs(flip)<.08?(flip<0?-.08:.08):flip,lit,wake};}
// The picture of the home card: the light on a boat whose lanterns have just lit, another boat out at sea, two boats home.
function frPreview(o){const v=o.game?.variant??0,a=farBoat(v,0,2,1,-9),b={...farBoat(v,1,2,2,-9),t:.62};
 return {variant:v,farBeam:Math.acos(1-2*b.t)/(2*Math.PI),farNow:6,farHome:2,farDocked:[3,6],farSea:[a,b],farRet:{slot:1,boat:b,berth:2,final:false},farMiss:null};}
