// El mag desastrós (CE29), 0.21: the picture. A cartoon of the 1930s: flat figures of ink and paint (thick dark outlines, white
// gloves, a rubber-hose body that bounces and stretches) on a small theatre painted in gouache. The theatre (backdrop, floor, side
// curtains, valance) is drawn once for each round, size and decor into two sheets, one behind and one in front of the figures; the
// magician, his props and everything that falls on the stage are drawn every frame. The scene is drawn in units of a screen 720 high
// (W wide); the stage is 1280 wide and is made smaller on narrower screens.
// On a black base with little or no theatre the outlines are cream instead of dark, so that the figures stay readable.
import {K_TAU,Kclamp,KeaseOut,Krand,Ksmooth} from './kaleido-base.js';
import {escBlit,escCanvas,escDecor,escDecorKey,escFrame,escVeiled} from './escenari.js';
import {MG_GAGS,MG_T,MG_VANISH,mgRound,mgStep} from './mag.js';

// The outlines are always dark, as in the cartoons. On a black base with little or no decor (MG_LIFT), the darkest fills (the coat,
// the shoes, the wand, the leg of the table) are a few shades lighter instead, so that the figure stands out from the black.
const MG_DARK='#1c1322',MG_INK=MG_DARK;
let MG_LIFT=false;
const MG_LIFTED=Object.freeze({'#151018':'#4a4458','#1a1420':'#4a4458','#3a2a3e':'#6a5a72'}),mgDk=col=>MG_LIFT&&MG_LIFTED[col]||col;
const MG_LW=5,MG_SKIN='#f6cda2',MG_NOSE='#ea7b62',MG_SHIRT='#fff8ea',MG_GLOVE='#ffffff',MG_GOLD='#efb83f',MG_GOLDDK='#a8731d',MG_SOCK='#e8403c';
// The tailcoats: [coat, its light side, lining and bow tie].
const MG_COATS=Object.freeze([['#29233f','#433a66','#cf2440'],['#1f4a3a','#2f6b55','#e9a62a'],['#5a1630','#7c2746','#2fb5a8'],['#22357a','#3550a8','#f08a24'],['#4a2457','#6a3a7c','#f2c53d']]);
const MG_COATS_LIFT=Object.freeze([['#4a4170','#62578f','#cf2440'],['#2f6b55','#3f8a6e','#e9a62a'],['#7c2746','#9a3a5c','#2fb5a8'],['#3550a8','#4a68c4','#f08a24'],['#6a3a7c','#87529a','#f2c53d']]);
// The curtains: [base, fold, light].
const MG_CURTAINS=Object.freeze([['#b3172f','#5c0614','#ee5266'],['#13744f','#063524','#4fc08c'],['#1f4fa8','#0b2257','#5d8be0'],['#6e2a8c','#2f0d40','#b06ad0']]);
const MG_SCARVES=Object.freeze(['#e63946','#ffd23f','#2ec4b6','#ff7eb6','#ff9f1c','#7bd389','#8e7dff','#4cc9f0']);
const mgRng=seed=>{let a=(seed>>>0)||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
const mgLerp=(a,b,k)=>a+(b-a)*k;
const mgSeg=(t,a,b)=>Kclamp((t-a)/(b-a));

// ── Ink and paint ────────────────────────────────────────────────────────────────────────────────────────────────────────────
function mgInk(c,build,fill,lw=MG_LW){c.beginPath();build(c);if(fill){c.fillStyle=fill;c.fill();}if(lw>0){c.lineWidth=lw;c.strokeStyle=MG_INK;c.lineJoin='round';c.lineCap='round';c.stroke();}}
function mgEll(c,x,y,rx,ry,rot=0){c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,K_TAU);}
// A smooth line through points (each corner rounded by a quadratic curve through the midpoints).
function mgSmooth(c,pts){c.moveTo(pts[0][0],pts[0][1]);if(pts.length===2){c.lineTo(pts[1][0],pts[1][1]);return;}
 for(let i=1;i<pts.length-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;c.quadraticCurveTo(pts[i][0],pts[i][1],i===pts.length-2?pts[i+1][0]:mx,i===pts.length-2?pts[i+1][1]:my);}}
// A rubber hose: a thick coloured line with an ink outline.
function mgTube(c,pts,w,fill){c.save();c.lineCap='round';c.lineJoin='round';c.beginPath();mgSmooth(c,pts);c.lineWidth=w+MG_LW*2;c.strokeStyle=MG_INK;c.stroke();c.lineWidth=w;c.strokeStyle=fill;c.stroke();c.restore();}
function mgStar(c,x,y,r,rot=0,inner=.45){c.moveTo(x+Math.cos(rot-Math.PI/2)*r,y+Math.sin(rot-Math.PI/2)*r);
 for(let i=1;i<10;i++){const a=rot-Math.PI/2+i*Math.PI/5,k=i%2?inner:1;c.lineTo(x+Math.cos(a)*r*k,y+Math.sin(a)*r*k);}c.closePath();}
// A cartoon sparkle: an eight-pointed star of cream with an ink outline.
function mgSpark(c,x,y,r,a=1){if(a<=0||r<=0)return;c.save();c.globalAlpha*=a;mgInk(c,cc=>{for(let i=0;i<8;i++){const ang=i*Math.PI/4,k=i%2?.3:1;cc.lineTo(x+Math.cos(ang)*r*k,y+Math.sin(ang)*r*k);}cc.closePath();},'#fff6c8',2.5);c.restore();}
// Gouache: a tile of soft value noise laid in overlay mode over the painted theatre (in the sheets only).
let MG_GRAIN=null;
function mgGrain(){if(MG_GRAIN!==null)return MG_GRAIN||null;const w=320,h=180,cv=escCanvas(w,h),c=cv?.getContext?.('2d');if(!c||!c.createImageData){MG_GRAIN=false;return null;}
 const hash=(x,y,s)=>{const v=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return v-Math.floor(v);};
 const noise=(x,y,s)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  return mgLerp(mgLerp(hash(xi,yi,s),hash(xi+1,yi,s),u),mgLerp(hash(xi,yi+1,s),hash(xi+1,yi+1,s),u),v);};
 const im=c.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let n=0,a=.5,f=1/26;for(let o=0;o<4;o++){n+=a*noise(x*f,y*f,3+o);a*=.5;f*=2;}
  const m=noise(x/3,y/3,9),g=Math.round(Kclamp(128+(n/.94-.5)*150+(m-.5)*40,0,255)),i=(y*w+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=g;im.data[i+3]=255;}
 c.putImageData(im,0,0);MG_GRAIN=cv;return cv;}
function mgPaint(c,x,y,w,h,alpha){const tile=mgGrain();if(!tile)return;c.save();c.globalCompositeOperation='overlay';c.globalAlpha=alpha;for(let ty=y;ty<y+h;ty+=360)for(let tx=x;tx<x+w;tx+=640)c.drawImage(tile,tx,ty,640,360);c.restore();}

// ── The painted theatre ──────────────────────────────────────────────────────────────────────────────────────────────────────
// Five backdrops, all light around the middle so that the dark tailcoat stands out: a starry night, a sunset, the sea, a garden
// and an art-deco sunburst (soft rays of two close colours).
function mgClouds(c,pts,fill){for(const [x,y,s] of pts)mgInk(c,cc=>{cc.moveTo(x-60*s,y);for(const [dx,dy,r] of [[-40,-8,26],[-12,-26,32],[22,-20,28],[48,-4,22]])cc.arc(x+dx*s,y+dy*s,r*s,Math.PI*.9,Math.PI*2.1);cc.lineTo(x+70*s,y);cc.closePath();},fill,3);}
function mgBackdrop(c,W,kind){const cx=W/2,r=mgRng(7+kind),star=(x,y,s)=>mgInk(c,cc=>mgStar(cc,x,y,s,r()*.6),r()<.5?MG_GOLD:'#ffe08a',2.5);
 if(kind===0){const g=c.createRadialGradient(cx,330,40,cx,330,Math.max(620,W*.55));g.addColorStop(0,'#8a78cc');g.addColorStop(.5,'#3e3279');g.addColorStop(1,'#140f2c');c.fillStyle=g;c.fillRect(0,0,W,720);
  c.save();c.globalAlpha=.35;c.strokeStyle='#a99ae0';c.lineWidth=10;for(let i=0;i<4;i++){c.beginPath();c.ellipse(cx,600,250+i*95,330+i*70,0,Math.PI,K_TAU);c.stroke();}c.restore();
  for(let i=0;i<30;i++){const x=r()*W,y=40+r()*380,s=6+r()*13;if(Math.abs(x-cx)<150&&y>140)continue;star(x,y,s);}
  c.save();c.beginPath();c.rect(0,0,W,720);c.arc(cx+378,138,40,0,K_TAU);c.clip('evenodd');mgInk(c,cc=>cc.arc(cx+360,150,44,0,K_TAU),'#ffe7a0',0);c.restore();}
 else if(kind===1){const g=c.createLinearGradient(0,60,0,580);g.addColorStop(0,'#d9566b');g.addColorStop(.45,'#f39a62');g.addColorStop(.8,'#fcd38c');g.addColorStop(1,'#fde9b8');c.fillStyle=g;c.fillRect(0,0,W,720);
  c.save();c.globalAlpha=.22;c.fillStyle='#fff3c4';for(let i=0;i<12;i++){const a=Math.PI+i*Math.PI/11;c.beginPath();c.moveTo(cx,560);c.arc(cx,560,1400,a-.05,a+.05);c.closePath();c.fill();}c.restore();
  mgInk(c,cc=>cc.arc(cx,580,170,Math.PI,K_TAU),'#ffd36b',4);
  mgClouds(c,[[cx-420,180,1.1],[cx+380,130,.9],[cx-150,90,.7],[cx+520,300,.8],[cx-560,340,.7]],'#fbe3c8');}
 else if(kind===2){const g=c.createLinearGradient(0,60,0,420);g.addColorStop(0,'#5fb4d6');g.addColorStop(1,'#cdeef2');c.fillStyle=g;c.fillRect(0,0,W,720);
  mgClouds(c,[[cx-400,140,1],[cx+420,110,.85],[cx+90,70,.6]],'#ffffff');
  const rows=[[400,'#2f8fb5','#1d6d91'],[455,'#3fa6c4','#26819f'],[510,'#5fc0d2','#3a9cb2']];
  for(const [y,f,d] of rows){mgInk(c,cc=>{cc.moveTo(0,720);cc.lineTo(0,y);for(let x=0;x<=W+60;x+=60)cc.quadraticCurveTo(x+30,y-26,x+60,y);cc.lineTo(W+60,720);cc.closePath();},f,4);
   c.strokeStyle=d;c.lineWidth=4;for(let x=20;x<W;x+=120){c.beginPath();c.arc(x,y+30,16,Math.PI*1.1,Math.PI*1.9);c.stroke();}}
  // a little painted sailing boat far away
  const bx=cx+330;mgInk(c,cc=>{cc.moveTo(bx-40,392);cc.lineTo(bx+40,392);cc.lineTo(bx+28,410);cc.lineTo(bx-28,410);cc.closePath();},'#c0573a',3);
  mgInk(c,cc=>{cc.moveTo(bx,388);cc.lineTo(bx,320);cc.lineTo(bx+34,384);cc.closePath();},'#fff8ea',3);}
 else if(kind===3){const g=c.createLinearGradient(0,0,0,560);g.addColorStop(0,'#bfe3d6');g.addColorStop(1,'#f4f1c9');c.fillStyle=g;c.fillRect(0,0,W,720);
  mgClouds(c,[[cx-380,120,.9],[cx+400,150,1]],'#ffffff');
  mgInk(c,cc=>{cc.moveTo(0,720);cc.lineTo(0,470);for(let x=0;x<=W+80;x+=80)cc.quadraticCurveTo(x+40,430,x+80,470);cc.lineTo(W+80,720);cc.closePath();},'#5aa95a',4);
  for(const [dx,h,s] of [[-520,250,1],[-300,200,.8],[300,210,.85],[520,260,1.05],[-700,230,.9],[700,220,.9]]){const x=cx+dx;
   mgInk(c,cc=>cc.rect(x-7,470-h*.45,14,h*.45),'#8b5a2b',3);mgInk(c,cc=>mgEll(cc,x,470-h*.55,62*s,70*s),'#3f8f4e',4);
   c.fillStyle='rgba(255,255,255,.18)';c.beginPath();mgEll(c,x-18*s,470-h*.62,24*s,18*s,-.5);c.fill();}
  for(let i=0;i<26;i++){const x=r()*W,y=478+r()*80;if(Math.abs(x-cx)<160)continue;mgInk(c,cc=>mgEll(cc,x,y,7,7),['#f26b8a','#ffd23f','#ffffff','#ff9f1c'][i%4],2.5);}}
 else{const g=c.createRadialGradient(cx,520,40,cx,520,Math.max(760,W*.6));g.addColorStop(0,'#fff1c2');g.addColorStop(1,'#e9b65a');c.fillStyle=g;c.fillRect(0,0,W,720);
  c.save();c.globalAlpha=.5;c.fillStyle='#f6d58a';for(let i=0;i<9;i++){const a=Math.PI+(i+.25)*Math.PI/9;c.beginPath();c.moveTo(cx,560);c.arc(cx,560,1500,a,a+Math.PI/18);c.closePath();c.fill();}c.restore();
  for(let i=0;i<4;i++){c.save();c.globalAlpha=.4;c.strokeStyle='#c98a2e';c.lineWidth=6;c.beginPath();c.arc(cx,560,180+i*120,Math.PI,K_TAU);c.stroke();c.restore();}
  for(let i=0;i<18;i++){const x=r()*W,y=40+r()*300;if(Math.abs(x-cx)<160&&y>120)continue;star(x,y,6+r()*10);}}
 mgPaint(c,0,0,W,720,.35);}
function mgFloor(c,W){const cx=W/2,y0=578;c.save();c.beginPath();c.rect(0,y0,W,720-y0);c.clip();
 const g=c.createLinearGradient(0,y0,0,720);g.addColorStop(0,'#a4642f');g.addColorStop(1,'#c98544');c.fillStyle=g;c.fillRect(0,y0,W,142);
 c.strokeStyle='#8b5226';c.lineWidth=3;for(let i=-24;i<=24;i++){c.beginPath();c.moveTo(cx+i*30,y0);c.lineTo(cx+i*120,720);c.stroke();}
 c.lineWidth=2;c.globalAlpha=.6;for(const y of [604,640,684]){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}c.globalAlpha=1;
 mgPaint(c,0,y0,W,142,.45);
 const s=c.createRadialGradient(cx,618,10,cx,618,360);s.addColorStop(0,'rgba(255,236,190,.55)');s.addColorStop(1,'rgba(255,236,190,0)');
 c.fillStyle=s;c.save();c.translate(cx,618);c.scale(1,.2);c.beginPath();c.arc(0,0,360,0,K_TAU);c.restore();c.fill();c.restore();
 c.fillStyle='#4a2a14';c.fillRect(0,690,W,30);c.fillStyle=MG_GOLD;c.fillRect(0,688,W,5);
 for(let x=cx%116-58;x<W+58;x+=116){const gl=c.createRadialGradient(x,690,4,x,690,70);gl.addColorStop(0,'rgba(255,226,150,.55)');gl.addColorStop(1,'rgba(255,226,150,0)');
  c.fillStyle=gl;c.beginPath();c.arc(x,690,70,Math.PI,K_TAU);c.fill();mgInk(c,cc=>{cc.moveTo(x-22,693);cc.quadraticCurveTo(x,664,x+22,693);cc.closePath();},'#ffe9b0',3);}}
// A soft cone of light from above, over the magician.
function mgCone(c,x){c.save();c.globalCompositeOperation='screen';const g=c.createLinearGradient(0,0,0,620);g.addColorStop(0,'rgba(255,240,200,0)');g.addColorStop(.3,'rgba(255,240,200,.10)');g.addColorStop(1,'rgba(255,240,200,.16)');
 c.fillStyle=g;c.beginPath();c.moveTo(x-70,0);c.lineTo(x+70,0);c.lineTo(x+300,620);c.lineTo(x-300,620);c.closePath();c.fill();c.restore();}
function mgBack(c,W,round){mgBackdrop(c,W,round.back);mgCone(c,W/2);mgFloor(c,W);}
function mgSideCurtain(c,W,cols,left){const k=.85*Math.min(1,W/1280);c.save();if(!left){c.translate(W,0);c.scale(-1,1);}c.scale(k,1);
 const shape=cc=>{cc.moveTo(-10,0);cc.lineTo(270,0);cc.bezierCurveTo(262,200,205,340,168,430);cc.bezierCurveTo(150,520,205,640,238,720);cc.lineTo(-10,720);cc.closePath();};
 c.save();c.beginPath();shape(c);c.clip();
 for(let i=0;i<9;i++){const x=i*32-6,g=c.createLinearGradient(x,0,x+32,0);g.addColorStop(0,cols[1]);g.addColorStop(.45,cols[0]);g.addColorStop(.62,cols[2]);g.addColorStop(1,cols[1]);
  c.fillStyle=g;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+10,250,x*.55+80,430,x*.6+70,440);c.bezierCurveTo(x*.7+80,560,x+20,680,x+30,720);c.lineTo(x+70,720);
  c.bezierCurveTo(x+60,650,x*.7+120,540,x*.6+102,440);c.bezierCurveTo(x*.55+110,430,x+40,250,x+32,0);c.closePath();c.fill();}
 mgPaint(c,0,0,300,720,.4);c.restore();mgInk(c,shape,null,6);
 mgTube(c,[[0,410],[90,440],[168,430]],10,MG_GOLD);
 mgInk(c,cc=>{cc.moveTo(160,438);cc.lineTo(150,500);cc.lineTo(186,500);cc.closePath();},MG_GOLD,4);mgInk(c,cc=>mgEll(cc,168,440,13,13),MG_GOLD,4);c.restore();}
function mgValance(c,W,cols){const sw=Math.max(4,Math.round(W/213)),w=W/sw;
 const shape=cc=>{cc.moveTo(0,0);cc.lineTo(W,0);cc.lineTo(W,62);for(let i=sw-1;i>=0;i--)cc.quadraticCurveTo(i*w+w/2,132,i*w,62);cc.closePath();};
 c.save();c.beginPath();shape(c);c.clip();const g=c.createLinearGradient(0,0,0,140);g.addColorStop(0,cols[1]);g.addColorStop(.6,cols[0]);g.addColorStop(1,cols[2]);
 c.fillStyle=g;c.fillRect(0,0,W,140);c.strokeStyle='rgba(30,0,10,.4)';c.lineWidth=5;
 for(let i=0;i<sw;i++)for(let k=1;k<4;k++){c.beginPath();c.moveTo(i*w+k*w/4,0);c.quadraticCurveTo(i*w+w/2,34+k*20,i*w+w-k*w/4,0);c.stroke();}
 mgPaint(c,0,0,W,140,.4);c.restore();mgInk(c,shape,null,6);
 c.strokeStyle=MG_GOLD;c.lineWidth=3;for(let i=0;i<sw;i++)for(let t=0;t<=1.0001;t+=1/16){const x=i*w+t*w,y=62+140*t*(1-t);c.beginPath();c.moveTo(x,y);c.lineTo(x,y+13);c.stroke();}
 for(let i=1;i<sw;i++){mgInk(c,cc=>{cc.moveTo(i*w-11,56);cc.lineTo(i*w+11,56);cc.lineTo(i*w+6,102);cc.lineTo(i*w-6,102);cc.closePath();},MG_GOLD,4);mgInk(c,cc=>mgEll(cc,i*w,56,11,9),MG_GOLD,4);}}
function mgFront(c,W,round){const cols=MG_CURTAINS[round.curtain];mgSideCurtain(c,W,cols,true);mgSideCurtain(c,W,cols,false);mgValance(c,W,cols);}

// ── Props ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The top hat, with its origin at the middle of the brim; rot π turns it upside down (the opening up).
function mgHat(c,x,y,s,rot,coat){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);const lw=MG_LW/s;
 mgInk(c,cc=>{cc.moveTo(-44,0);cc.lineTo(-38,-96);cc.quadraticCurveTo(0,-108,38,-96);cc.lineTo(44,0);cc.closePath();},coat[0],lw);
 mgInk(c,cc=>{cc.moveTo(-42,-10);cc.lineTo(-41,-32);cc.quadraticCurveTo(0,-38,41,-32);cc.lineTo(42,-10);cc.quadraticCurveTo(0,-4,-42,-10);cc.closePath();},coat[2],lw*.8);
 mgInk(c,cc=>mgEll(cc,0,-97,38,9),coat[1],lw);mgInk(c,cc=>mgEll(cc,0,0,72,14),coat[0],lw);
 c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=5;c.beginPath();c.moveTo(-26,-84);c.lineTo(-30,-44);c.stroke();c.restore();}
// The hat upside down and seen from a little above, so that its dark opening shows (to hold scarves or to spring out of).
function mgHatOpen(c,x,y,s,coat,part='all'){c.save();c.translate(x,y);c.scale(s,s);const lw=MG_LW/s;
 if(part!=='front'){mgInk(c,cc=>mgEll(cc,0,0,72,14),coat[0],lw);mgInk(c,cc=>mgEll(cc,0,0,42,8),'#0c0914',lw*.8);}
 if(part!=='back'){mgInk(c,cc=>{cc.moveTo(-42,2);cc.lineTo(-38,96);cc.quadraticCurveTo(0,104,38,96);cc.lineTo(42,2);cc.quadraticCurveTo(0,12,-42,2);cc.closePath();},coat[0],lw);
  mgInk(c,cc=>{cc.moveTo(-41,62);cc.lineTo(-40,84);cc.quadraticCurveTo(0,90,40,84);cc.lineTo(41,62);cc.quadraticCurveTo(0,68,-41,62);cc.closePath();},coat[2],lw*.8);
  mgInk(c,cc=>{cc.moveTo(-72,0);cc.quadraticCurveTo(0,30,72,0);cc.quadraticCurveTo(0,18,-72,0);cc.closePath();},coat[1],lw);}
 c.restore();}
function mgShoe(c,x,y,s,right){c.save();c.translate(x,y);c.scale(right?s:-s,s);
 mgInk(c,cc=>{cc.moveTo(-16,-14);cc.bezierCurveTo(10,-30,58,-22,60,0);cc.quadraticCurveTo(62,12,30,12);cc.lineTo(-18,12);cc.quadraticCurveTo(-28,0,-16,-14);cc.closePath();},mgDk('#151018'),MG_LW/s);
 c.fillStyle='rgba(255,255,255,.55)';c.beginPath();mgEll(c,30,-10,12,4,-.2);c.fill();c.restore();}
function mgSock(c,x,y,s,right){c.save();c.translate(x,y);c.scale(right?s:-s,s);
 mgInk(c,cc=>{cc.moveTo(-14,-26);cc.lineTo(14,-26);cc.lineTo(16,-2);cc.bezierCurveTo(40,-8,58,2,50,12);cc.lineTo(-14,12);cc.closePath();},MG_SOCK,4);
 c.strokeStyle='#fff';c.lineWidth=5;for(const yy of [-18,-8]){c.beginPath();c.moveTo(-12,yy);c.lineTo(13,yy);c.stroke();}c.restore();}
function mgGoblet(c,x,y,s,rot){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);const lw=MG_LW/s*.8;
 mgInk(c,cc=>mgEll(cc,0,-2,20,6),MG_GOLD,lw);mgInk(c,cc=>cc.rect(-4,-30,8,28),MG_GOLDDK,lw);
 mgInk(c,cc=>{cc.moveTo(-24,-62);cc.quadraticCurveTo(-24,-30,0,-28);cc.quadraticCurveTo(24,-30,24,-62);cc.closePath();},MG_GOLD,lw);
 mgInk(c,cc=>mgEll(cc,0,-62,24,6),'#e34a5c',lw);c.fillStyle='rgba(255,255,255,.6)';c.beginPath();mgEll(c,-12,-46,4,9,.2);c.fill();c.restore();}
// The table: a round top on a pedestal; the red tablecloth with a gold fringe until it has been pulled away.
function mgTable(c,x,cloth){c.fillStyle='rgba(20,10,30,.3)';c.beginPath();mgEll(c,x,4,90,14);c.fill();
 mgTube(c,[[x,-130],[x+4,-60],[x,-2]],16,mgDk('#3a2a3e'));mgInk(c,cc=>mgEll(cc,x,0,48,9),MG_GOLDDK,4);
 if(cloth){mgInk(c,cc=>{cc.moveTo(x-92,-148);cc.lineTo(x+92,-148);cc.lineTo(x+80,-80);cc.quadraticCurveTo(x,-64,x-80,-80);cc.closePath();},'#cf2440',5);
  c.strokeStyle=MG_GOLD;c.lineWidth=3;for(let t=-78;t<=78;t+=9){const y=-80+16*(1-(t/80)**2);c.beginPath();c.moveTo(x+t,y-4);c.lineTo(x+t,y+10);c.stroke();}
  mgInk(c,cc=>mgEll(cc,x,-148,94,14),'#e33a52',5);}
 else{mgInk(c,cc=>{cc.moveTo(x-90,-148);cc.lineTo(x-86,-136);cc.quadraticCurveTo(x,-120,x+86,-136);cc.lineTo(x+90,-148);cc.closePath();},'#8b5226',4);mgInk(c,cc=>mgEll(cc,x,-148,92,14),'#c98544',5);}}
// The magic cabinet (190 × 420, taller than the magician): its frame and inside, and its door, hinged on the right (open 0 shut,
// 1 swung open). The magician is drawn between the two when he is inside. j: [dx, dy, rot] while it shakes.
const MG_CAB_W=190,MG_CAB_H=420;
function mgCabinetBack(c,x,open,j,inside){const w=MG_CAB_W,h=MG_CAB_H,x0=-w/2,y0=-h;c.save();c.translate(x+j[0],j[1]);c.rotate(j[2]);
 c.fillStyle='rgba(20,10,30,.35)';c.beginPath();mgEll(c,0,4,w*.7,16);c.fill();
 mgInk(c,cc=>cc.rect(x0,y0,w,h),'#1f4f7a',6);
 if(open>0){mgInk(c,cc=>cc.rect(x0+16,y0+18,w-32,h-36),'#3d6c9c',5);c.fillStyle='rgba(255,240,200,.18)';c.beginPath();mgEll(c,0,-40,64,18);c.fill();
  for(let i=0;i<5;i++){c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=6;c.beginPath();c.moveTo(x0+30+i*30,y0+24);c.lineTo(x0+30+i*30,-24);c.stroke();}
  if(inside){c.save();c.beginPath();c.rect(x0+16,y0+18,w-32,h-36);c.clip();inside(c);c.restore();}}
 c.restore();}
function mgCabinetDoor(c,x,open,j){const w=MG_CAB_W,h=MG_CAB_H,x0=-w/2,y0=-h;c.save();c.translate(x+j[0],j[1]);c.rotate(j[2]);
 // the free edge of the door goes from the left side (shut) past the hinge to the right, where its back shows
 const fx=x0+open*(w+120),front=fx<w/2-2,sk=front?0:30*Kclamp((fx-w/2)/120);
 mgInk(c,cc=>{cc.moveTo(w/2,y0);cc.lineTo(fx,y0+sk);cc.lineTo(fx,y0+h-sk);cc.lineTo(w/2,y0+h);cc.closePath();},front?'#1f4f7a':'#123150',6);
 if(front){const k=(w/2-fx)/w,cxd=(w/2+fx)/2;
  for(const [sx,sy,s] of [[0,140,34],[-38,250,16],[34,300,20],[0,70,13]]){c.save();c.translate(cxd+sx*k,y0+sy);c.scale(Math.max(.05,k),1);mgInk(c,cc=>mgStar(cc,0,0,s,0),MG_GOLD,3/Math.max(.25,k));c.restore();}
  if(k>.15)mgInk(c,cc=>mgEll(cc,fx+14*k,y0+h/2,7*k,7),MG_GOLD,3);}
 else{c.save();c.translate((w/2+fx)/2,y0+h/2);c.scale(Kclamp((fx-w/2)/120),1);mgInk(c,cc=>mgStar(cc,0,0,24,0),MG_GOLD,3);c.restore();}
 mgInk(c,cc=>cc.rect(x0-10,y0-24,w+20,26),MG_GOLD,6);mgInk(c,cc=>cc.rect(x0-6,-6,w+12,12),MG_GOLD,5);
 for(const s of [-1,1])mgInk(c,cc=>mgEll(cc,s*(w/2-6),y0-32,10,10),MG_GOLD,4);c.restore();}

// ── Small things ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
function mgScarf(c,x,y,ang,s,i,a=1){if(a<=0)return;c.save();c.globalAlpha*=a;c.translate(x,y);c.rotate(ang+Math.sin(i*1.7)*.35);const col=MG_SCARVES[i%MG_SCARVES.length];
 mgInk(c,cc=>{cc.moveTo(-s,-s*.8);cc.quadraticCurveTo(0,-s*1.05,s,-s*.8);cc.quadraticCurveTo(s*1.1,0,s,s*.8);cc.quadraticCurveTo(0,s*1.05,-s,s*.8);cc.quadraticCurveTo(-s*1.1,0,-s,-s*.8);cc.closePath();},col,3.5);
 c.fillStyle='rgba(255,255,255,.75)';if(i%3===0){for(const [dx,dy] of [[-.45,-.35],[.4,-.3],[0,.3],[-.4,.45],[.45,.45]]){c.beginPath();mgEll(c,dx*s,dy*s,s*.12,s*.12);c.fill();}}
 else if(i%3===1){c.save();c.beginPath();c.rect(-s,-s,2*s,2*s);c.clip();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=s*.18;for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(-s+k*s*.6,-s);c.lineTo(s+k*s*.6,s);c.stroke();}c.restore();}
 c.restore();}
// Scarves knotted one after the other along a route, as far as a fraction of its length.
function mgScarfChain(c,pts,s,i0,frac=1,a=1){let L=0;const seg=[];for(let i=0;i<pts.length-1;i++){const d=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);seg.push(d);L+=d;}
 const step=s*1.75,max=L*Kclamp(frac);let k=i0;for(let d=step*.5;d<=max;d+=step){let r=d,i=0;while(i<seg.length-1&&r>seg[i]){r-=seg[i];i++;}const u=Math.min(1,r/seg[i]),p=pts[i],q=pts[i+1];
  mgScarf(c,p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u,Math.atan2(q[1]-p[1],q[0]-p[0]),s,k++,a);}return k;}
const mgBez=(p0,p1,p2,p3,n=24)=>Array.from({length:n+1},(_,i)=>{const t=i/n,u=1-t;return [u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]];});
// A playing card: its face (a red heart or a black spade, never a letter or a number) or its back, flipping with flip (−1…1).
function mgCard(c,x,y,rot,s,i,flip=1,flat=1){s*=1.35;c.save();c.translate(x,y);c.rotate(rot);c.scale(s*Math.max(.08,Math.abs(flip)),s*flat);const face=flip>=0,lw=3/s;
 mgInk(c,cc=>{if(cc.roundRect)cc.roundRect(-13,-18,26,36,4);else cc.rect(-13,-18,26,36);},face?'#fffdf6':'#2f6fb5',lw);
 if(face){c.fillStyle=i%2?'#d8263c':MG_DARK;c.beginPath();if(i%2){c.moveTo(0,8);c.bezierCurveTo(-12,-2,-8,-12,0,-5);c.bezierCurveTo(8,-12,12,-2,0,8);}else{c.moveTo(0,-9);c.bezierCurveTo(10,0,8,8,0,4);c.bezierCurveTo(-8,8,-10,0,0,-9);c.rect(-1.5,2,3,7);}c.fill();}
 else{c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.strokeRect(-9,-14,18,28);c.beginPath();c.moveTo(-9,-14);c.lineTo(9,14);c.moveTo(9,-14);c.lineTo(-9,14);c.stroke();}
 c.restore();}
// A feather: a curved quill and soft vanes.
function mgFeather(c,x,y,rot,s,i,flat=1){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s*flat);const col=['#ffffff','#ffe9f2','#fff3c9','#e6f4ff'][i%4];
 mgInk(c,cc=>{cc.moveTo(0,-30);cc.bezierCurveTo(14,-20,12,12,2,28);cc.bezierCurveTo(-12,14,-12,-18,0,-30);cc.closePath();},col,2.5/s);
 c.strokeStyle=MG_INK;c.lineWidth=2/s;c.beginPath();c.moveTo(0,-26);c.quadraticCurveTo(3,4,2,34);c.stroke();
 c.strokeStyle='rgba(120,100,140,.45)';c.lineWidth=1.4/s;for(let k=-20;k<20;k+=7){c.beginPath();c.moveTo(1,k);c.lineTo(9,k-6);c.moveTo(1,k);c.lineTo(-8,k-6);c.stroke();}c.restore();}
// The bouquet: three flowers on stems, coming out of a fist; open 0…1, wilt 0…1.
function mgBouquet(c,ang,s,open,wilt){if(s<=0)return;c.save();c.rotate(ang);c.scale(s,s);
 const heads=[[-14,-46,-.35,'#ff6fa5'],[0,-56,0,'#ffd23f'],[15,-44,.38,'#8e7dff']];
 for(const [hx,hy,a,col] of heads){const dx=hx+Math.sin(a+wilt*1.2*Math.sign(a||1))*wilt*26,dy=hy+wilt*30;
  c.strokeStyle=MG_INK;c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(hx*.3,hy*.6,dx,dy);c.stroke();c.strokeStyle='#4f9d4a';c.lineWidth=4;c.stroke();
  const r=4+12*open;c.save();c.translate(dx,dy);c.rotate(a+wilt*1.5*Math.sign(a||1));
  for(let k=0;k<6;k++){const pa=k*Math.PI/3;mgInk(c,cc=>mgEll(cc,Math.cos(pa)*r*.75,Math.sin(pa)*r*.75,r*.55,r*.38,pa),col,2.5);}
  mgInk(c,cc=>mgEll(cc,0,0,r*.38,r*.38),'#ffb43b',2.5);c.restore();}
 c.restore();}
// The wand: black with white tips. limp bends it over like a noodle; knot turns the end into a bow.
function mgWand(c,ang,limp,knot,wob){const n=16,L=150*(1-knot*.5),pts=[[0,0]];let a=ang-.15,x=-Math.cos(ang)*14,y=-Math.sin(ang)*14;pts[0]=[x,y];
 for(let i=1;i<=n;i++){const s=i/n;a=ang+limp*2.6*Math.pow(s,1.3)+Math.sin(wob*9+s*4)*limp*.35*s;x+=Math.cos(a)*L/n;y+=Math.sin(a)*L/n;pts.push([x,y]);}
 mgTube(c,pts,9,mgDk('#1a1420'));c.save();c.lineCap='round';c.lineWidth=9;c.strokeStyle='#ffffff';c.beginPath();const e=pts[n],f=pts[n-1];c.moveTo(e[0],e[1]);c.lineTo(e[0]+(f[0]-e[0])*.9,e[1]+(f[1]-e[1])*.9);c.stroke();c.restore();
 if(knot>0)mgBow(c,pts[n][0],pts[n][1],knot,a);}
function mgBow(c,x,y,k,rot){c.save();c.translate(x,y);c.rotate(rot*.2);c.scale(k*1.45,k*1.45);c.lineCap='round';
 const loop=sg=>{c.beginPath();c.moveTo(0,0);c.bezierCurveTo(sg*40,-34,sg*58,8,0,0);};
 for(const sg of [-1,1]){loop(sg);c.lineWidth=13;c.strokeStyle=MG_INK;c.stroke();c.lineWidth=6;c.strokeStyle=mgDk('#1a1420');c.stroke();}
 for(const sg of [-1,1]){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(sg*12,20,sg*24,30);c.lineWidth=13;c.strokeStyle=MG_INK;c.stroke();c.lineWidth=6;c.strokeStyle=mgDk('#1a1420');c.stroke();
  c.beginPath();c.moveTo(sg*20,26);c.lineTo(sg*24,30);c.lineWidth=6;c.strokeStyle='#fff';c.stroke();}
 mgInk(c,cc=>mgEll(cc,0,0,7,7),mgDk('#1a1420'),3);c.restore();}
// The tablecloth held by a corner: it trails and flaps; crumpled on the floor once dropped.
function mgClothHeld(c,t,dir=1){c.save();for(let pass=0;pass<1;pass++){const f=Math.sin(t*14)*10,g=Math.sin(t*11+1)*8;
 mgInk(c,cc=>{cc.moveTo(0,0);cc.bezierCurveTo(dir*40,20+f,dir*90,10+g,dir*150,40+f);cc.lineTo(dir*130+g*.5,120+g);cc.bezierCurveTo(dir*80,110+f,dir*30,90,0,70);cc.closePath();},'#cf2440',4);
 c.strokeStyle=MG_GOLD;c.lineWidth=3;for(let i=0;i<=8;i++){const u=i/8,x=mgLerp(dir*130+g*.5,0,u),y=mgLerp(120+g,70,u);c.beginPath();c.moveTo(x,y);c.lineTo(x,y+10);c.stroke();}}c.restore();}
// The tablecloth dropped in a crumpled heap: three lumps of different heights, a corner sticking up, folds and the gold fringe.
function mgClothHeap(c,x,s=1){c.save();c.translate(x,0);c.scale(s,s);
 mgInk(c,cc=>{cc.moveTo(-68,0);cc.bezierCurveTo(-72,-16,-58,-28,-42,-24);cc.bezierCurveTo(-40,-44,-12,-50,-2,-34);cc.bezierCurveTo(8,-44,26,-42,32,-30);
  cc.lineTo(50,-52);cc.quadraticCurveTo(54,-30,58,-18);cc.bezierCurveTo(70,-14,72,-4,68,0);cc.closePath();},'#cf2440',4);
 c.fillStyle='rgba(255,170,180,.45)';c.beginPath();c.moveTo(-30,-38);c.quadraticCurveTo(-16,-46,-6,-36);c.quadraticCurveTo(-18,-40,-30,-38);c.fill();
 c.strokeStyle='rgba(70,0,14,.45)';c.lineWidth=3;c.lineCap='round';c.beginPath();
 c.moveTo(-46,-4);c.quadraticCurveTo(-44,-16,-36,-22);c.moveTo(-14,-4);c.quadraticCurveTo(-12,-20,-4,-30);c.moveTo(10,-6);c.quadraticCurveTo(20,-18,30,-26);
 c.moveTo(40,-4);c.quadraticCurveTo(46,-20,48,-40);c.stroke();
 c.strokeStyle=MG_GOLD;c.lineWidth=3;for(let i=0;i<11;i++){const x0=-62+i*12.4;c.beginPath();c.moveTo(x0,-1);c.lineTo(x0+2,8);c.stroke();}c.restore();}
function mgPuddle(c,x,s){if(s<=0)return;c.save();c.translate(x,2);c.scale(s,s);mgInk(c,cc=>{cc.moveTo(-90,0);cc.bezierCurveTo(-90,-14,-40,-16,-10,-12);cc.bezierCurveTo(30,-18,92,-12,90,0);cc.bezierCurveTo(88,14,20,16,-20,12);cc.bezierCurveTo(-60,16,-90,12,-90,0);cc.closePath();},'#8fd3f0',3);
 c.fillStyle='rgba(255,255,255,.7)';c.beginPath();mgEll(c,-40,-3,16,3.5);mgEll(c,34,2,10,2.5);c.fill();c.restore();}
function mgDrop(c,x,y,s=1){mgInk(c,cc=>{cc.moveTo(x,y-9*s);cc.quadraticCurveTo(x+7*s,y+1*s,x,y+5*s);cc.quadraticCurveTo(x-7*s,y+1*s,x,y-9*s);cc.closePath();},'#8fd3f0',2);}
function mgPuff(c,x,y,r,a){if(a<=0)return;c.save();c.globalAlpha*=a;mgInk(c,cc=>{for(let i=0;i<7;i++){const an=i*K_TAU/7;cc.moveTo(x+Math.cos(an)*r*.62+r*.42,y+Math.sin(an)*r*.62);cc.arc(x+Math.cos(an)*r*.62,y+Math.sin(an)*r*.62,r*.42,0,K_TAU);}},'#f3eef6',3);
 c.fillStyle='#f3eef6';c.beginPath();mgEll(c,x,y,r*.7,r*.7);c.fill();c.restore();}

// ── The magician ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Rubber hose: arms and legs are bendy tubes with no elbows or knees. Figure coordinates: the origin between the feet on the floor;
// hips at −130, shoulders at −230, the middle of the head at −312. A pose: x, y (lift), lean, sq (squash), dip (knees), hL, hR (the
// wrists), gL, gR (glove: open, fist, point), aL, aR (glove angles), mood, look, and what he wears or carries.
function mgGlove(c,x,y,ang,pose){c.save();c.translate(x,y);c.rotate(ang);
 const fing=(a,len,w,ox=20,oy=0)=>{c.save();c.translate(ox,oy);c.rotate(a);mgInk(c,cc=>{cc.moveTo(0,-w/2);cc.lineTo(len,-w/2);cc.arc(len,0,w/2,-Math.PI/2,Math.PI/2);cc.lineTo(0,w/2);cc.closePath();},MG_GLOVE,4.5);c.restore();};
 if(pose==='open'){fing(-.55,30,15,22,-6);fing(-.05,34,15,24,0);fing(.45,30,15,22,6);fing(-1.5,20,14,14,-10);}
 else if(pose==='point'){fing(-1.4,15,14,18,-10);fing(0,40,14,26,-4);}
 else fing(-1.4,15,14,18,-10);
 mgInk(c,cc=>mgEll(cc,24,0,21,19),MG_GLOVE,4.5);
 if(pose!=='open'){c.strokeStyle=MG_INK;c.lineWidth=3;for(const yy of pose==='point'?[2,9]:[-7,0,7]){c.beginPath();c.arc(39,yy,5.5,-Math.PI/2,Math.PI/2);c.stroke();}}
 c.strokeStyle=MG_INK;c.lineWidth=2.6;for(const yy of [-7,0,7]){c.beginPath();c.moveTo(14,yy);c.lineTo(28,yy*1.1);c.stroke();}
 mgInk(c,cc=>{cc.moveTo(-10,-17);cc.lineTo(6,-19);cc.lineTo(6,19);cc.lineTo(-10,17);cc.quadraticCurveTo(-16,0,-10,-17);cc.closePath();},MG_GLOVE,4.5);c.restore();}
function mgEye(c,x,y,kind,look){c.lineCap='round';
 if(kind==='happy'||kind==='closed'||kind==='shut'){c.strokeStyle=MG_INK;c.lineWidth=5;c.beginPath();
  if(kind==='happy')c.arc(x,y+6,13,Math.PI*1.15,Math.PI*1.85);else if(kind==='closed'){c.moveTo(x-13,y+2);c.quadraticCurveTo(x,y+8,x+13,y+2);}
  else{const s=x<0?1:-1;c.moveTo(x-12*s,y-8);c.lineTo(x+10*s,y);c.lineTo(x-12*s,y+8);}c.stroke();return;}
 const wide=kind==='wide',rx=wide?17:14,ry=wide?25:21;mgInk(c,cc=>mgEll(cc,x,y,rx,ry),'#fff',4);
 const pr=wide?6:8,px=x+2+look[0]*(rx-pr-3),py=(wide?y-2:y+4)+look[1]*(ry-pr*1.5-3);c.fillStyle=MG_DARK;c.beginPath();mgEll(c,px,py,pr,pr*1.55);c.fill();
 c.fillStyle='#fff';c.beginPath();c.moveTo(px,py-2);c.arc(px,py-2,pr*1.3,-1.25,-.65);c.closePath();c.fill();
 if(kind==='half'){c.save();c.beginPath();mgEll(c,x,y,rx,ry);c.clip();c.fillStyle=MG_SKIN;c.fillRect(x-rx-2,y-ry-2,2*rx+4,ry+4);c.restore();
  c.strokeStyle=MG_INK;c.lineWidth=4;c.beginPath();c.moveTo(x-rx,y+1);c.lineTo(x+rx,y+1);c.stroke();mgInk(c,cc=>mgEll(cc,x,y,rx,ry),null,4);}}
const MG_FACES=Object.freeze({smile:['open','open','smile'],proud:['happy','happy','grin'],shock:['wide','wide','o'],sheep:['half','half','wavy'],
 wince:['shut','shut','tight'],tada:['wide','wide','grin'],wink:['open','happy','smile'],sniff:['closed','closed','sniff'],blink:['closed','closed','smile']});
function mgHead(c,x,y,P,coat){const f=MG_FACES[P.mood]||MG_FACES.smile,look=P.look||[0,0];let [eL,eR,mouth]=f;if(P.blink&&eL==='open'){eL=eR='closed';}
 if(P.card){c.save();c.translate(x-62,y-12);c.rotate(-.45);mgCard(c,0,-14,0,1.1,1,1);c.restore();}
 mgInk(c,cc=>mgEll(cc,x-58,y+8,11,15),MG_SKIN,4);mgInk(c,cc=>mgEll(cc,x+58,y+8,11,15),MG_SKIN,4);
 mgInk(c,cc=>mgEll(cc,x,y,58,62),MG_SKIN);
 c.fillStyle='rgba(224,150,110,.35)';c.beginPath();mgEll(c,x+22,y+20,30,34);c.fill();
 if(P.mood==='sheep'){c.fillStyle='rgba(240,110,120,.45)';c.beginPath();mgEll(c,x-34,y+16,13,8);mgEll(c,x+34,y+16,13,8);c.fill();}
 // a bald pate with three hairs
 c.strokeStyle=MG_INK;c.lineWidth=3.5;for(const [dx,k] of [[-10,-1],[0,0],[10,1]]){c.beginPath();c.moveTo(x+dx,y-60);c.bezierCurveTo(x+dx+k*6,y-84,x+dx+18+k*4,y-86,x+dx+16+k*6,y-72);c.stroke();}
 c.fillStyle='rgba(255,255,255,.55)';c.beginPath();mgEll(c,x-18,y-40,14,7,-.5);c.fill();
 mgEye(c,x-20,y-14,eL,look);mgEye(c,x+20,y-14,eR,look);
 c.strokeStyle=MG_INK;c.lineWidth=5;c.lineCap='round';const by=f[0]==='wide'?y-52:y-42,worry=P.mood==='sheep'||P.mood==='wince'?8:0;
 c.beginPath();c.moveTo(x-34,by+4-worry);c.quadraticCurveTo(x-22,by-6,x-8,by+worry);c.stroke();c.beginPath();c.moveTo(x+8,by+worry);c.quadraticCurveTo(x+22,by-6,x+34,by+4-worry);c.stroke();
 const my=y+40;
 if(mouth==='o')mgInk(c,cc=>mgEll(cc,x,my+4,12,15),'#5a1420',4);
 else if(mouth==='sniff')mgInk(c,cc=>mgEll(cc,x,my,6,7),'#5a1420',3.5);
 else if(mouth==='grin')mgInk(c,cc=>{cc.moveTo(x-24,my-6);cc.quadraticCurveTo(x,my+30,x+24,my-6);cc.quadraticCurveTo(x,my+2,x-24,my-6);cc.closePath();},'#7a1c2a',4);
 else if(mouth==='wavy'||mouth==='tight'){c.strokeStyle=MG_INK;c.lineWidth=4.5;c.beginPath();c.moveTo(x-18,my);for(let i=1;i<=4;i++)c.quadraticCurveTo(x-18+(i-.5)*9,my+(i%2?-6:6)*(mouth==='tight'?.6:1),x-18+i*9,my);c.stroke();}
 else mgInk(c,cc=>{cc.moveTo(x-18,my-4);cc.quadraticCurveTo(x,my+14,x+18,my-4);cc.quadraticCurveTo(x,my+4,x-18,my-4);cc.closePath();},'#7a1c2a',4);
 // the moustache: curled up, or hanging down when it is wet (droop); flap shakes it at the sneeze
 const d=Kclamp(P.droop||0),fl=P.flap||0;
 for(const sg of [-1,1]){const tx=x+sg*(46-6*d),ty=y+16+34*d+fl*sg*6;
  mgInk(c,cc=>{cc.moveTo(x,y+26);cc.bezierCurveTo(x+sg*22,y+16+8*d,x+sg*40,y+30+10*d,tx,ty);cc.bezierCurveTo(x+sg*(52-4*d),y+8+40*d,x+sg*58,y+18+30*d,x+sg*(52-2*d),y+24+20*d);
   cc.bezierCurveTo(x+sg*40,y+42+6*d,x+sg*16,y+38,x,y+32);cc.closePath();},'#2b1d22',3.5);}
 mgInk(c,cc=>mgEll(cc,x,y+14,19,16),MG_NOSE,4);c.fillStyle='rgba(255,255,255,.6)';c.beginPath();mgEll(c,x-6,y+8,6,4,-.4);c.fill();
 // water on the face
 if(P.wet>0){c.save();c.globalAlpha*=Kclamp(P.wet);const tt=P.time||0;
  for(const [dx,dy] of [[-30,-30],[26,-34],[-40,12],[44,6],[0,-50]])mgDrop(c,x+dx,y+dy,.9);
  for(let i=0;i<4;i++){const ph=(tt*1.3+i*.27)%1;mgDrop(c,x+(i-1.5)*24,y+52+ph*120,.8*(1-ph*.4));}c.restore();}
 if(P.goblet)mgGoblet(c,x+Math.sin((P.time||0)*5)*2,y-46-62*.95,.95,Math.PI+(P.gobletWob||0));}
function mgBody(c,coat,lapel){const y=-250;
 mgInk(c,cc=>{cc.moveTo(-46,y+120);cc.lineTo(-70,y+196);cc.lineTo(-34,y+178);cc.closePath();},coat[0]);
 mgInk(c,cc=>{cc.moveTo(46,y+120);cc.lineTo(72,y+196);cc.lineTo(36,y+178);cc.closePath();},coat[0]);
 mgInk(c,cc=>{cc.moveTo(-50,y+6);cc.bezierCurveTo(-74,y+60,-70,y+130,-40,y+150);cc.quadraticCurveTo(0,y+164,40,y+150);cc.bezierCurveTo(70,y+130,74,y+60,50,y+6);cc.quadraticCurveTo(0,y-8,-50,y+6);cc.closePath();},coat[0]);
 c.fillStyle=coat[1];c.beginPath();c.moveTo(-46,y+20);c.bezierCurveTo(-64,y+70,-60,y+118,-40,y+136);c.lineTo(-34,y+120);c.bezierCurveTo(-50,y+90,-50,y+50,-38,y+22);c.closePath();c.fill();
 mgInk(c,cc=>{cc.moveTo(-24,y+2);cc.lineTo(24,y+2);cc.lineTo(8,y+110);cc.quadraticCurveTo(0,y+118,-8,y+110);cc.closePath();},MG_SHIRT,4);
 for(const yy of [y+44,y+70,y+94])mgInk(c,cc=>mgEll(cc,0,yy,4,4),MG_INK,2);
 mgInk(c,cc=>{cc.moveTo(0,y+8);cc.lineTo(-26,y-6);cc.lineTo(-26,y+22);cc.closePath();},coat[2],4);
 mgInk(c,cc=>{cc.moveTo(0,y+8);cc.lineTo(26,y-6);cc.lineTo(26,y+22);cc.closePath();},coat[2],4);mgInk(c,cc=>mgEll(cc,0,y+8,7,8),coat[2],4);}
function mgArm(c,sx,sy,hx,hy,side,coat){const dx=hx-sx,dy=hy-sy,L=Math.hypot(dx,dy)||1;let nx=-dy/L,ny=dx/L;if(nx*side<0||(Math.abs(nx)<.2&&ny<0)){nx=-nx;ny=-ny;}
 const bow=Kclamp(64-L*.22,8,46),mx=(sx+hx)/2+nx*bow,my=(sy+hy)/2+ny*bow;mgTube(c,[[sx,sy],[mx,my],[hx,hy]],20,coat[0]);return Math.atan2(hy-my,hx-mx);}
// Draws the whole figure. P.under / P.holdL / P.holdR / P.over: extra drawings (behind him, in each hand before the glove, in front).
function mgFigure(c,P,coat,stageY=0){c.save();c.translate(P.x||0,0);
 if(P.shadow!==false){const up=Kclamp(-(P.y||0)/300);c.fillStyle=`rgba(20,10,30,${(.38*(1-up*.7)).toFixed(3)})`;c.beginPath();mgEll(c,0,stageY+5,120*(1-up*.4),16*(1-up*.4));c.fill();}
 c.translate(0,P.y||0);const sq=P.sq||1;c.scale(1/Math.sqrt(sq),sq);
 const dip=P.dip||0,hipY=-130+dip,wp=P.walk;
 // legs (a step lifts one foot while the walk goes on)
 const fL=[-57+(wp!==undefined?Math.sin(wp)*16:0),wp!==undefined?-Math.max(0,Math.sin(wp))*22:0],fR=[57-(wp!==undefined?Math.sin(wp)*16:0),wp!==undefined?-Math.max(0,-Math.sin(wp))*22:0];
 if(P.feet!==false){mgTube(c,[[-18,hipY],[-34,hipY+70*(1+dip/130)],fL],30,coat[0]);mgTube(c,[[18,hipY],[36,hipY+70*(1+dip/130)],fR],30,coat[0]);
  if(P.socks){mgSock(c,fL[0],fL[1],1,false);mgSock(c,fR[0],fR[1],1,true);}else{mgShoe(c,fL[0],fL[1],1,false);mgShoe(c,fR[0],fR[1],1,true);}}
 c.translate(0,hipY);c.rotate(P.lean||0);c.translate(0,-hipY+dip);
 if(P.under)P.under(c);
 mgBody(c,coat);
 mgHead(c,0,-312+(P.headDy||0),P,coat);
 const hL=P.hL,hR=P.hR,aL=mgArm(c,-46,-230,hL[0],hL[1],-1,coat),aR=mgArm(c,46,-230,hR[0],hR[1],1,coat);
 for(const [h,a,g,hold,ang] of [[hL,aL,P.gL,P.holdL,P.aL],[hR,aR,P.gR,P.holdR,P.aR]]){if(hold){c.save();c.translate(h[0],h[1]);hold(c);c.restore();}mgGlove(c,h[0],h[1],ang??a,g||'open');}
 if(P.over)P.over(c);
 c.restore();}

// ── The tricks ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
const MG_IDLE=Object.freeze({x:0,y:0,lean:0,sq:1,hL:[-64,-150],hR:[120,-236],gL:'fist',gR:'open',aL:.4,aR:-.5,mood:'smile',look:[0,0]});
// Poses at key moments: numbers and lists of numbers glide from one key to the next; the rest changes at its key.
function mgKeysOf(list){let prev={};return Object.freeze(list.map(([time,p])=>{prev=Object.freeze(Object.assign({},prev,p));return [time,prev];}));}
function mgPose(keys,t){let i=0;while(i<keys.length-1&&t>=keys[i+1][0])i++;const [t0,a]=keys[i],out=Object.assign({},a);if(i===keys.length-1||t<t0)return out;
 const [t1,b]=keys[i+1],k=Ksmooth((t-t0)/(t1-t0));
 for(const key in b){const u=a[key],v=b[key];if(typeof u==='number'&&typeof v==='number')out[key]=mgLerp(u,v,k);else if(Array.isArray(u)&&Array.isArray(v))out[key]=u.map((x,j)=>mgLerp(x,v[j],k));}return out;}
const MG_SHRUG={hL:[-150,-300],gL:'open',aL:-1.6,hR:[150,-300],gR:'open',aR:-1.45};
const MG_K=Object.freeze({
 scarf:mgKeysOf([[0,MG_IDLE],[.45,{hL:[-120,-200],gL:'open',aL:-1.35,hR:[40,-300],gR:'point',aR:-2.4,look:[-.6,-.4]}],[1.15,{hR:[110,-262],gR:'open',aR:-.6,mood:'proud'}],
  [2.3,{mood:'smile',look:[-1,.5]}],[2.8,{mood:'shock',look:[-.4,0]}],[3,{hR:[100,-212],aR:-.2}],[4.8,{mood:'sheep',...MG_SHRUG,hL:[-150,-280],look:[0,0]}],
  [5.7,{hL:[-64,-150],gL:'fist',aL:.4}],[6.3,{hR:[120,-236],aR:-.5,mood:'smile'}]]),
 flower:mgKeysOf([[0,MG_IDLE],[.45,{hR:[-70,-205],gR:'fist',aR:3,hL:[-96,-186],aL:-.4}],[.8,{hR:[120,-300],aR:-1.4,mood:'proud'}],[1.3,{hR:[140,-288],hL:[-64,-150],aL:.4}],
  [2.1,{mood:'smile',look:[-.4,-.2]}],[2.3,{hR:[132,-238],aR:-2.1,mood:'sniff'}],[2.85,{mood:'wince',lean:-.1}],[3.4,{mood:'blink',lean:0}],[3.8,{mood:'sheep',look:[0,.6]}],
  [4.4,{hR:[124,-240],aR:-1}],[5.15,{hR:[-70,-205],aR:3}],[5.6,{hR:[120,-236],gR:'open',aR:-.5}],[6.2,{mood:'smile',look:[0,0]}]]),
 wand:mgKeysOf([[0,MG_IDLE],[.35,{hR:[22,-205],gR:'fist',aR:2.6}],[.55,{hR:[120,-322],aR:-1.5,mood:'proud'}],[1.85,{mood:'smile',look:[.6,-.8]}],[2.4,{mood:'blink'}],
  [2.7,{mood:'smile'}],[3,{mood:'shock'}],[4,{gR:'open',aR:-1.2}],[4.55,{mood:'sheep',...MG_SHRUG,look:[.6,.7]}],[5.5,{hL:[-64,-150],gL:'fist',aL:.4}],
  [6.2,{hR:[120,-236],aR:-.5,mood:'smile',look:[0,0]}]]),
 feathers:mgKeysOf([[0,MG_IDLE],[.45,{hL:[-120,-205],gL:'open',aL:-1.35,hR:[60,-252],gR:'point',aR:-2.7,look:[-.6,.3]}],[1.6,{}],[1.75,{hL:[-96,-236],lean:.07,look:[-.4,.9]}],
  [2.3,{mood:'shock',lean:-.14,hL:[-124,-215],look:[0,-.4]}],[3,{lean:0,mood:'smile',look:[0,-.7]}],[3.7,{mood:'wince',lean:-.12,look:[0,0]}],[4.45,{lean:.2,sq:.92}],
  [4.8,{mood:'sheep',lean:0,sq:1,...MG_SHRUG,hL:[-124,-215],gL:'open',aL:-1.35}],[5.5,{hL:[-64,-150],gL:'fist',aL:.4,hR:[120,-236],aR:-.5}],[6.2,{mood:'smile'}]]),
 cards:mgKeysOf([[0,MG_IDLE],[.45,{hL:[-96,-182],gL:'open',aL:-1.05,hR:[96,-182],gR:'open',aR:-2.1,look:[0,.5]}],[1.8,{}],
  [1.95,{hL:[-28,-232],gL:'fist',aL:-.15,hR:[28,-232],gR:'fist',aR:-2.95,mood:'wink',look:[.4,0]}],[2.4,{...MG_SHRUG,hL:[-150,-320],hR:[150,-320],mood:'shock',look:[0,-.6]}],
  [3.6,{look:[.5,-.8]}],[4.2,{mood:'blink',look:[-.8,0]}],[4.5,{mood:'sheep',look:[-.7,0]}],[5.5,{hL:[-64,-150],gL:'fist',aL:.4,hR:[120,-236],aR:-.5,look:[0,0]}],[6.2,{mood:'smile'}]]),
 cloth:mgKeysOf([[0,MG_IDLE],[.7,{hR:[282,-98],gR:'fist',aR:.3,mood:'wink',look:[1,.3]}],[1,{hL:[-120,-282],gL:'open',aL:-1.9,lean:-.08,mood:'smile',look:[-.2,0]}],
  [1.95,{lean:-.12}],[2,{}],[2.14,{hR:[120,-215],aR:-.5,lean:.04}],[2.5,{look:[1,-.7],lean:0}],[3.25,{mood:'shock',look:[0,-1]}],
  [4,{mood:'tada',hL:[-120,-360],aL:-2,hR:[130,-360],aR:-1.2,look:[0,0]}],[5,{}],[5.4,{mood:'smile',hL:[-64,-150],gL:'fist',aL:.4,hR:[120,-236],gR:'open',aR:-.5}]]),
 final:mgKeysOf([[0,MG_IDLE],[.3,{hR:[120,-336],aR:-1.5,mood:'proud'}],[.6,{hR:[120,-236],aR:-.5,mood:'smile',x:0}],[2,{x:-330}],[2.15,{hR:[100,-330],gR:'open',aR:-1.4,mood:'proud'}],
  [2.6,{}],[7.2,{x:150,mood:'tada',hL:[-130,-350],gL:'open',aL:-2,hR:[130,-350],gR:'open',aR:-1.15}],[10,{}],[10.45,{hL:[-140,-300],hR:[140,-300]}],[10.8,{mood:'proud',hL:[-64,-150],gL:'fist',aL:.4,hR:[120,-236],aR:-.5}],
  [11.3,{}],[11.7,{lean:.5,hR:[70,-150],aR:1.1}],[12.2,{}],[12.6,{lean:0,mood:'smile'}]])});
// Things that fly and fall, worked out once: the feathers from the hat, the cards from the deck, the confetti from the giant hat.
// Each one leaves fast, slows down in the air, and drifts down swaying until it lands on the floor (y −6), where it stays.
function mgFlight(n,seed,p0,spread,speed,drag,fall,sway,floorY=-6){const r=mgRng(seed),out=[];
 for(let i=0;i<n;i++){const a=spread[0]+r()*(spread[1]-spread[0]),v=speed[0]+r()*(speed[1]-speed[0]),f={vx:Math.cos(a)*v,vy:Math.sin(a)*v,ph:r()*K_TAU,sw:sway*(.5+r()),spin:(r()-.5)*7,rot:r()*K_TAU,fall:fall*(.75+r()*.5),land:9,lx:0,lr:0};
  const pos=t=>{const e=(1-Math.exp(-drag*t))/drag;return [p0[0]+f.vx*e+Math.sin(f.ph+t*2.3)*f.sw*Math.min(1,t*1.5),p0[1]+f.vy*e+f.fall*Math.max(0,t-.3)];};
  const fy=floorY-r()*26;f.ly=fy;for(let t=.05;t<9;t+=.02){const p=pos(t);if(p[1]>=fy&&t>.3){f.land=t;f.lx=Kclamp(p[0],-560,560);f.lr=f.rot+f.spin*t;break;}}
  f.pos=t=>t>=f.land?[f.lx,fy]:pos(t);out.push(Object.freeze(f));}
 return Object.freeze(out);}
const MG_FEATHERS=mgFlight(26,31,[-124,-289],[-Math.PI*.95,-Math.PI*.05],[260,560],3.5,85,34);
const MG_CARDS=mgFlight(30,47,[0,-245],[-Math.PI*.97,-Math.PI*.03],[380,700],3.2,95,40);
const MG_CONFETTI=mgFlight(64,59,[150,-170],[-Math.PI*.9,-Math.PI*.1],[420,900],2.6,80,30);
const MG_HEAP=Object.freeze(Array.from({length:26},(_,i)=>{const r=mgRng(100+i),a=r()*Math.PI,d=Math.sqrt(r());return Object.freeze([-205+Math.cos(a)*112*d,-10-Math.sin(a)*52*d*(1-.3*d),r()*K_TAU]);}));
const MG_HAT_REST=Object.freeze([360,-150]),MG_GOBLET_REST=Object.freeze([420,-150]);
const mgHop=(a,b,u,peak)=>[mgLerp(a[0],b[0],u),mgLerp(a[1],b[1],u)-peak*4*u*(1-u)];

// Each trick sets the pose (S.P) and the scene (S) at its own time t, and adds drawings behind (S.back) or in front of him (S.front).
// S.hat: 'table', 'held' (in his left hand, upside down, its opening up) or a place in the air; S.res: what is left on the stage.
function mgHatHop(t,t0,t1,from,to,s0,s1,r0,r1,peak=260){const u=mgSeg(t,t0,t1),p=mgHop(from,to,Ksmooth(u),peak);return {x:p[0],y:p[1],s:mgLerp(s0,s1,u),rot:mgLerp(r0,r1,u)};}
function mgHeldHat(S,t,coat,from,to,shake=0){const P=S.P,hand=()=>[P.x+P.hL[0],P.hL[1]-74];
 if(t<from+.45)S.hat=mgHatHop(t,from,from+.45,MG_HAT_REST,hand(),.7,.7,.05,Math.PI);
 else if(t<to){S.hat='held';P.holdL=cc=>{cc.save();if(shake)cc.translate(Math.sin(t*70)*shake,Math.cos(t*53)*shake*.6);mgHatOpen(cc,0,-74,.7,coat);cc.restore();};}
 else if(t<to+.5)S.hat=mgHatHop(t,to,to+.5,hand(),MG_HAT_REST,.7,.7,Math.PI,K_TAU+.05);
 return hand();}
const MG_DO={
 scarf(S,t,coat){const T=MG_T.scarf,P=S.P;
  if(t>T.wave&&t<T.out){const a=(t-T.wave)/(T.out-T.wave)*K_TAU*1.5;P.hR=[-96+Math.cos(a)*46,-352+Math.sin(a)*16];P.gR='point';P.aR=-2.2+Math.sin(a)*.3;S.sparks.push([-96+Math.cos(a)*60,-372+Math.sin(a)*20,10]);}
  if(t>T.shake&&t<T.free){P.x+=Math.sin(t*62)*5;P.lean+=Math.sin(t*41)*.05;}
  const O=mgHeldHat(S,t,coat,0,T.back);
  // the scarves come out of the hat, up and over to the left, and pile up on the floor
  const e=mgSeg(t,T.out,T.full),fall=mgSeg(t,T.free,T.free+.6);S.res.heap=Math.floor(26*mgSeg(t,1.9,4.6));
  if(e>0&&fall<1){const route=[...mgBez(O,[O[0]+8,-480],[-340,-480],[-318,-250],18),[-262,-40]];
   S.front.push(cc=>{cc.save();cc.translate(0,fall*fall*220);mgScarfChain(cc,route,21,0,e,1-fall);cc.restore();});}
  // and then they wrap him up like a parcel; he wriggles free and they fall off
  if(t>=T.wrap&&fall<1){const bands=[[[-92,-220],[92,-198]],[[-94,-178],[94,-160]],[[-86,-136],[86,-122]]];
   P.over=cc=>{bands.forEach((b,i)=>{const p=mgSeg(t,T.wrap+i*.25,T.wrap+.35+i*.25);if(p<=0)return;cc.save();cc.translate(0,fall*fall*(150-i*30));mgScarfChain(cc,b,17,30+i*7,p,1-fall);cc.restore();});};}},
 flower(S,t,coat){const T=MG_T.flower,P=S.P,bs=mgSeg(t,T.pull,T.bloom)*(1-mgSeg(t,5.15,5.45)),open=mgSeg(t,T.bloom,1.2),wilt=mgSeg(t,3.9,4.7);
  const bang=t<T.show?-.15:t<2.3?mgLerp(-.15,-.86,mgSeg(t,2.1,2.3)):mgLerp(-.86,-.3,mgSeg(t,3.2,3.6));
  if(bs>0)P.holdR=cc=>mgBouquet(cc,bang,bs*1.35,open,wilt);
  P.wet=mgSeg(t,2.92,3.1)*(1-mgSeg(t,5.6,6.3));P.droop=mgSeg(t,3.3,4.2);P.time=t;S.res.puddle=mgSeg(t,3.6,5);
  // the squirt: from the middle flower straight into his face, and a splash all round
  const hx=P.x+P.hR[0]+Math.sin(bang)*72,hy=P.hR[1]-Math.cos(bang)*72*bs;
  if(t>=T.squirt&&t<T.squirt+.45){const u=mgSeg(t,T.squirt,T.squirt+.12),fx=P.x,fy=-300;
   S.front.push(cc=>{cc.save();cc.lineCap='round';cc.beginPath();cc.moveTo(hx,hy);cc.lineTo(mgLerp(hx,fx,u),mgLerp(hy,fy,u));cc.lineWidth=22;cc.strokeStyle=MG_INK;cc.stroke();cc.lineWidth=13;cc.strokeStyle='#8fd3f0';cc.stroke();cc.restore();});}
  if(t>=T.squirt+.1&&t<T.squirt+.9){const u=mgSeg(t,T.squirt+.1,T.squirt+.9);S.front.push(cc=>{for(let i=0;i<20;i++){const a=-Math.PI*1.15+i*Math.PI*1.3/19,d=50+u*(130+(i%3)*30);mgDrop(cc,P.x+Math.cos(a)*d,-300+Math.sin(a)*d*.8+u*u*80,1.6*(1-u*.4));}});}},
 wand(S,t,coat){const T=MG_T.wand,P=S.P;
  if(t>T.wave&&t<T.limp-.05){const a=(t-T.wave)/.55*K_TAU;P.hR=[120+Math.cos(a)*30,-322+Math.sin(a)*20];if(Math.sin(a*1.3)>.4)S.sparks.push([P.hR[0]+40*Math.cos(a),P.hR[1]-110,12]);}
  const limp=mgSeg(t,T.limp,T.limp+.8),knot=mgSeg(t,T.knot,T.knot+.9),vis=t>=.3;
  if(vis&&t<T.drop){const ang=-Math.PI/2-.12+(t<T.limp?Math.sin(t*9)*.1:0);P.holdR=cc=>{cc.save();cc.scale(Kclamp((t-.3)/.2),1);mgWand(cc,ang,limp,knot,t);cc.restore();};}
  if(t>=T.drop&&t<T.land+.6){const u=mgSeg(t,T.drop,T.land),x=mgLerp(P.x+120,150,u),y=mgLerp(-330,-26,u*u),b=t>T.land?Math.sin((t-T.land)*22)*Math.exp(-(t-T.land)*6):0;
   S.front.push(cc=>mgKnotted(cc,x,y-Math.abs(b)*24,mgLerp(-1.6,-.12,u)+u*K_TAU,1+b*.15));}
  if(t>=T.land+.6)S.res.knot=1;},
 feathers(S,t,coat){const T=MG_T.feathers,P=S.P;
  for(const [k,ti] of [[0,T.tap],[1,T.tap+.3],[2,T.tap+.6]]){const u=mgSeg(t,ti,ti+.22);if(u>0&&u<1){const s=Math.sin(Math.PI*u);P.hR=[mgLerp(60,-110,s),mgLerp(-252,-300,s)];}}
  const O=mgHeldHat(S,t,coat,0,T.back,t>T.shake&&t<T.poof?4:0);
  if(t>=T.poof&&t<T.poof+1){const u=mgSeg(t,T.poof,T.poof+1);S.front.push(cc=>{for(let i=0;i<6;i++){const a=-Math.PI/2+(i-2.5)*.5;mgPuff(cc,O[0]+Math.cos(a)*90*KeaseOut(u),O[1]+Math.sin(a)*70*KeaseOut(u)-20,22+46*KeaseOut(u),1-u);}});}
  // the feathers; the first one comes down onto his nose, and the sneeze blows it away
  if(t>=T.poof){const tt=t-T.poof;MG_FEATHERS.forEach((f,i)=>{let p=f.pos(tt),rot=f.rot+f.spin*Math.min(tt,f.land),flat=tt>=f.land?.42:1;
   if(i===0){const nose=[P.x+14,-300];if(t>=T.tickle-.7&&t<T.sneeze){const u=mgSeg(t,T.tickle-.7,T.tickle);p=[mgLerp(p[0],nose[0],u),mgLerp(p[1],nose[1],u)+Math.sin(t*20)*2*u];rot=mgLerp(rot,-1.1,u);}
    else if(t>=T.sneeze){const u=mgSeg(t,T.sneeze,T.sneeze+.9);p=mgHop(nose,[300,-6],u,120);rot=-1.1+u*5;flat=u>=1?.42:1;}}
   const landed=flat<1;(landed?S.back:S.front).push(cc=>mgFeather(cc,p[0],p[1]-(landed?4:0),landed?f.lr:rot,landed?.9:1,i,flat));});}
  if(t>=T.sneeze){const d=t-T.sneeze;P.flap=Math.sin(d*40)*Math.exp(-d*4);}},
 cards(S,t,coat){const T=MG_T.cards,P=S.P,hL=()=>[P.x+P.hL[0],P.hL[1]],hR=()=>[P.x+P.hR[0],P.hR[1]];
  if(t>=.3&&t<T.shuffle)P.holdL=cc=>{for(let i=0;i<5;i++)mgCard(cc,8,-26,-.5+i*.25,mgSeg(t,.3,.5),i,1);};
  if(t>=T.shuffle&&t<T.squeeze+.1){const a=hL(),b=hR(),back=t>1.2;S.front.push(cc=>{for(let j=0;j<8;j++){const u=((t-T.shuffle)*1.7+j/8)%1,v=back?1-u:u;
   mgCard(cc,mgLerp(a[0],b[0],v)+8,mgLerp(a[1],b[1],v)-30-70*4*v*(1-v),(v-.5)*1.2,1,j,1);}});}
  if(t>=T.squeeze&&t<T.burst){const j=t>T.squeeze+.2?Math.sin(t*60)*3:0;S.front.push(cc=>{for(let i=0;i<5;i++)mgCard(cc,P.x+j,-252-i*2,(i-2)*.08+j*.02,1,i,1-i%2*2*0);});}
  if(t>=T.burst){const tt=t-T.burst,ear=t>=T.ear;MG_CARDS.forEach((f,i)=>{if(i===0){if(ear)return;const p0=f.pos(Math.min(tt,1.1)),e=[P.x-62,-340],u=mgSeg(t,T.burst+1.1,T.ear),p=[mgLerp(p0[0],e[0],u),mgLerp(p0[1],e[1],u)];
     S.front.push(cc=>mgCard(cc,p[0],p[1],f.rot+tt*4*(1-u)-.45*u,1.1,1,Math.cos(f.ph+tt*6*(1-u))));return;}
    const p=f.pos(tt),landed=tt>=f.land;(landed?S.back:S.front).push(cc=>landed?mgCard(cc,p[0],p[1]-4,f.lr,1,i,1,.42):mgCard(cc,p[0],p[1],f.rot+f.spin*tt,1,i,Math.cos(f.ph+tt*7)));});
   P.card=ear;}},
 cloth(S,t,coat){const T=MG_T.cloth,P=S.P;S.cloth=t<T.yank;
  if(t>=T.yank&&t<T.drop)P.holdR=cc=>mgClothHeld(cc,t,1);
  if(t>=T.drop&&t<T.drop+.4){const u=mgSeg(t,T.drop,T.drop+.4),x=mgLerp(P.x+P.hR[0],268,u),y=mgLerp(P.hR[1],-40,u*u);S.front.push(cc=>{cc.save();cc.translate(x,y);cc.scale(1-.4*u,1-.6*u);mgClothHeld(cc,t,1);cc.restore();});}
  if(t>=T.drop+.4)S.res.clothHeap=1;
  if(t>=T.yank&&t<T.hatLand){const u=mgSeg(t,T.yank,T.hatLand);S.hat={x:MG_HAT_REST[0],y:MG_HAT_REST[1]-130*Math.sin(Math.PI*u),s:.7,rot:.05+u*K_TAU};}
  if(t>=T.yank&&t<T.goblet){const u=mgSeg(t,T.yank,T.goblet),p=mgHop(MG_GOBLET_REST,[P.x,-417],u,190);S.goblet='air';S.front.push(cc=>mgGoblet(cc,p[0],p[1],mgLerp(.8,.95,u),u*3*Math.PI));}
  else if(t>=T.goblet){S.goblet='head';P.goblet=1;const d=t-T.goblet;P.gobletWob=Math.sin(d*14)*.3*Math.exp(-d*3);P.time=t;}
  if(t>=T.goblet&&t<T.goblet+.6)S.sparks.push([P.x+60,-430,14*(1-mgSeg(t,T.goblet,T.goblet+.6))],[P.x-58,-410,10*(1-mgSeg(t,T.goblet,T.goblet+.6))]);}};
// The wand tied in a bow, as it falls and as it lies on the floor.
function mgKnotted(c,x,y,rot,s){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,1/s);mgWand(c,0,0,1,0);c.restore();}

// The final: the cabinet, the shoes, the giant hat, TA-RA!, the mess vanishes, the bow.
const MG_CAB_X=-330,MG_GIANT=1.6,MG_GIANT_X=150;
function mgDoFinal(S,t,coat,tricks){const T=MG_T.final,P=S.P;
 S.cab.open=t<2.3?mgSeg(t,.15,.6):t<T.open?1-mgSeg(t,2.3,2.6):mgSeg(t,T.open,T.open+.35);
 if(t>=T.walk&&t<T.enter){P.walk=(t-T.walk)*K_TAU*2.1;P.dip=(P.dip||0)+Math.abs(Math.sin(P.walk))*6;P.x=mgLerp(0,MG_CAB_X,mgSeg(t,T.walk,T.enter));}
 if(t>=T.enter&&t<T.shut)S.inCab=true;
 if(t>=T.shut&&t<T.tara)P.hidden=true;
 const env=mgSeg(t,T.shake,T.shake+.2)*(1-mgSeg(t,T.open-.25,T.open));
 if(env>0){S.cab.j=[Math.sin(t*31)*4*env,-Math.abs(Math.sin(t*9))*14*env,Math.sin(t*23)*.03*env];
  for(let i=0;i<4;i++){const ph=(t*1.6+i*.25)%1;if(ph<.5)S.sparks.push([MG_CAB_X+Math.cos(i*1.9)*(110+ph*90),-260+Math.sin(i*2.7)*170-ph*40,14*Math.sin(ph*2*Math.PI)]);}}
 S.cab.shoes=t>=T.open;P.socks=t>=T.open;
 // the hat: to the middle of the stage, growing and turning upside down; giant until it shrinks back to the table
 let s=.7;
 if(t>=T.grow&&t<T.tara)S.hat=mgHatHop(t,T.grow,T.tara,MG_HAT_REST,[MG_GIANT_X,-96*MG_GIANT],.7,MG_GIANT,.05,Math.PI,220);
 else if(t>=T.tara&&t<T.shrink+.9){s=mgLerp(MG_GIANT,.7,Ksmooth(mgSeg(t,T.shrink,T.shrink+.4)));S.hat='giant';S.giant=s;}
 else if(t>=T.shrink+.9&&t<T.shrink+1.4)S.hat=mgHatHop(t,T.shrink+.9,T.shrink+1.4,[MG_GIANT_X,-67],MG_HAT_REST,.7,.7,Math.PI,K_TAU+.05,160);
 // he springs out of it up to his waist; when the hat shrinks around him he hops out, in his socks
 if(t>=T.tara){const low=-96*MG_GIANT+140;let fy=0;
  if(t<T.tara+.28)fy=mgLerp(low+280,low-50,KeaseOut(mgSeg(t,T.tara,T.tara+.28)));
  else if(t<T.shrink+.4){const d=t-T.tara-.28;fy=low-50*Math.cos(d*13)*Math.exp(-d*5);}
  else if(t<T.shrink+.8){const u=mgSeg(t,T.shrink+.4,T.shrink+.8);fy=mgHop([0,low],[0,0],u,95)[1];P.x-=u*44;}
  else{P.x-=44;if(t<T.shrink+1)P.sq*=1-.16*Math.sin(Math.PI*mgSeg(t,T.shrink+.8,T.shrink+1));}
  P.y=fy;S.inHat=S.hat==='giant'&&t<T.shrink+.5;}
 if(t>=T.tara+.05&&t<T.tara+6){const tt=t-T.tara-.05,a=1-mgSeg(tt,4.5,5.5);
  S.front.push(cc=>{MG_CONFETTI.forEach((f,i)=>{const p=f.pos(tt),fl=tt>=f.land;cc.save();cc.globalAlpha*=a;cc.translate(p[0],p[1]);cc.rotate(fl?f.lr:f.rot+f.spin*tt*2);
   cc.scale(1,fl?.4:Math.cos(f.ph+tt*8));const w=12,h=7;cc.fillStyle=MG_SCARVES[i%MG_SCARVES.length];cc.fillRect(-w/2,-h/2,w,h);cc.strokeStyle=MG_INK;cc.lineWidth=1.5;cc.strokeRect(-w/2,-h/2,w,h);cc.restore();});});}
 if(t>=T.tara&&t<T.tara+.5)for(const [x,y,r] of [[-150,-200,22],[200,-120,16],[-60,-330,12],[250,-300,14],[-220,-60,10]])S.sparks.push([MG_GIANT_X+x,y,r*Math.sin(Math.PI*mgSeg(t,T.tara,T.tara+.5))]);
 // what is left of each trick vanishes in a sparkle, one after the other
 // (what one trick left goes together; a sparkle every MG_VANISH s, so never more than three a second)
 S.vanish=new Map(tricks.flatMap((g,i)=>MG_LEFT[MG_GAGS[g]].map(n=>[n,mgSeg(t,T.clean+i*MG_VANISH,T.clean+i*MG_VANISH+.35)])));}
const MG_LEFT=Object.freeze({scarf:['heap'],flower:['puddle','droop'],wand:['knot'],feathers:['feathers'],cards:['cards','ear'],cloth:['clothHeap','gobletHead']});
const MG_LEFT_AT=Object.freeze({heap:[-205,-40],puddle:[0,-6],knot:[160,-30],clothHeap:[268,-30]});

// The heap of scarves, the feathers and the cards on the floor are many small drawings that stay still once they have landed: each
// lies on a sheet of its own (the band of floor where things fall), made once for each colour of ink and copied while it is there.
function mgLeft(c,name,draw,alpha){if(alpha<=0)return;c.save();c.translate(-420,-110);escBlit(c,`mg-left|${name}|${MG_INK}`,820,140,sc=>{sc.translate(420,110);draw(sc);},alpha);c.restore();}
function mgStage(c,round,coat,count,steps,t,idle,reduced,held=1e3){
 const st=mgStep(round.v,Math.max(1,count),steps),name=count<1?'':st.final?'final':MG_GAGS[st.gag];
 const P=Object.assign({},name?mgPose(MG_K[name],t):MG_IDLE);
 const S={P,hat:'table',goblet:'table',cloth:true,cab:{open:0,j:[0,0,0],shoes:false},inCab:false,inHat:false,back:[],front:[],sparks:[],vanish:null,
  res:{heap:0,puddle:0,droop:0,knot:0,feathers:0,cards:0,ear:0,clothHeap:0,gobletHead:0}};
 for(const i of count<1?[]:st.final?st.tricks:st.done){const g=MG_GAGS[i],r=S.res;
  if(g==='scarf')r.heap=26;else if(g==='flower'){r.puddle=1;r.droop=1;}else if(g==='wand')r.knot=1;else if(g==='feathers')r.feathers=1;else if(g==='cards'){r.cards=1;r.ear=1;}
  else{r.clothHeap=1;r.gobletHead=1;S.cloth=false;S.goblet='head';}}
 if(name==='final')mgDoFinal(S,t,coat,st.tricks);else if(name)MG_DO[name](S,t,coat);
 // A press that cut the trick before it short (held: how long that one had run): what was still falling goes on falling and piling
 // up on its own clock, instead of landing all at once. The rest of that trick is settled.
 const before=count<1?[]:st.final?st.tricks:st.done,prev=before.length&&held<1e3?MG_GAGS[before[before.length-1]]:'',age=held+t;
 if(prev&&age<MG_T[prev].end){const T=MG_T[prev],S2={P:mgPose(MG_K[prev],age),hat:'table',goblet:'table',cloth:true,back:[],front:[],sparks:[],res:{heap:0,puddle:0,knot:0,clothHeap:0}};
  MG_DO[prev](S2,age,coat);
  if(prev==='scarf')S.res.heap=S2.res.heap;else if(prev==='flower')S.res.puddle=S2.res.puddle;
  else if(prev==='feathers'&&age>=T.poof){S.res.feathers=0;S.back.push(...S2.back);S.front.push(...S2.front);}
  else if(prev==='cards'&&age>=T.burst){S.res.cards=0;if(age<T.ear)S.res.ear=0;S.back.push(...S2.back);S.front.push(...S2.front);}}
 const V=n=>S.vanish?.get(n)||0,R=S.res,left=n=>R[n]*(1-V(n));
 if(S.vanish){for(const [n,k] of S.vanish)if(k>0&&k<1){const p=MG_LEFT_AT[n]||(n==='feathers'||n==='cards'?null:[P.x,n==='gobletHead'?-430:n==='ear'?-330:-290]);
   if(p)S.sparks.push([p[0],p[1]+(P.y&&!MG_LEFT_AT[n]?P.y:0),26*Math.sin(Math.PI*k)]);
   else for(const f of (n==='feathers'?MG_FEATHERS:MG_CARDS))S.sparks.push([f.lx,-12,12*Math.sin(Math.PI*k)]);}
  // the tablecloth and the goblet come back to the table
  if(R.clothHeap&&V('clothHeap')>=1){S.cloth=true;}if(R.gobletHead&&V('gobletHead')>=1)S.goblet='table';}
 P.droop=Math.max(P.droop||0,left('droop'));if(left('ear')>.5)P.card=true;if(S.goblet==='head'&&left('gobletHead')>.5){P.goblet=1;P.time=t;}
 if(!reduced){P.dip=(P.dip||0)+Math.abs(Math.sin(idle*2.6))*5;if(idle%3.4<.13)P.blink=true;}
 // 1 the cabinet, and the magician inside it
 mgCabinetBack(c,MG_CAB_X,S.cab.open,S.cab.j,S.cab.shoes?cc=>{cc.fillStyle='rgba(255,240,200,.35)';cc.beginPath();mgEll(cc,0,-34,74,16);cc.fill();mgShoe(cc,-36,-44,1.05,false);mgShoe(cc,36,-44,1.05,true);}:null);
 if(S.inCab){c.save();c.beginPath();c.rect(MG_CAB_X-MG_CAB_W/2+8,-MG_CAB_H+10,MG_CAB_W-16,MG_CAB_H-10);c.clip();mgFigure(c,Object.assign({},P,{shadow:false}),coat);c.restore();}
 mgCabinetDoor(c,MG_CAB_X,S.cab.open,S.cab.j);
 // 2 the table, the hat and the goblet on it
 mgTable(c,370,S.cloth);if(S.hat==='table')mgHat(c,MG_HAT_REST[0],MG_HAT_REST[1],.7,.05,coat);if(S.goblet==='table')mgGoblet(c,MG_GOBLET_REST[0],MG_GOBLET_REST[1],.8,0);
 // 3 what has fallen on the stage
 const pud=left('puddle');if(pud>0)mgPuddle(c,0,pud*1.45);
 const heap=Math.round(R.heap*(1-V('heap'))),scarves=cc=>{for(let i=0;i<heap;i++)mgScarf(cc,MG_HEAP[i][0],MG_HEAP[i][1],MG_HEAP[i][2],20,i);};
 if(heap===26)mgLeft(c,'heap',scarves,1);else scarves(c);
 if(left('knot')>0){c.save();c.globalAlpha*=left('knot');mgKnotted(c,150,-22,-.12,1);c.restore();}
 if(left('clothHeap')>0){c.save();c.globalAlpha*=left('clothHeap');mgClothHeap(c,268);c.restore();}
 mgLeft(c,'feathers',cc=>MG_FEATHERS.forEach((f,i)=>mgFeather(cc,i?f.lx:300,i?f.ly-4:-10,i?f.lr:3.9,.9,i,.42)),left('feathers'));
 mgLeft(c,'cards',cc=>MG_CARDS.forEach((f,i)=>{if(i)mgCard(cc,f.lx,f.ly-4,f.lr,1,i,1,.42);}),left('cards'));
 for(const f of S.back)f(c);
 // 4 the magician (out of the giant hat in the final)
 const giant=S.hat==='giant',gy=-96*(S.giant||MG_GIANT);
 if(giant)mgHatOpen(c,MG_GIANT_X,gy,S.giant,coat,S.inHat?'back':'all');
 if(!S.inCab&&!P.hidden){if(S.inHat){c.save();c.beginPath();c.rect(-2000,-2000,4000,2000+gy);c.clip();mgFigure(c,Object.assign({},P,{shadow:false}),coat,-P.y);c.restore();}
  else mgFigure(c,P,coat,giant&&P.y<0?gy-P.y:-(P.y||0));}
 if(giant&&S.inHat)mgHatOpen(c,MG_GIANT_X,gy,S.giant,coat,'front');
 // 5 what flies in front of him
 if(S.hat&&typeof S.hat==='object')mgHat(c,S.hat.x,S.hat.y,S.hat.s,S.hat.rot,coat);
 for(const f of S.front)f(c);
 for(const [x,y,r] of S.sparks)mgSpark(c,x,y,r,1);}

// ── The scene ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// o: variant (the round), count (presses so far), steps (3, 5 or 7), t (seconds since the press), from (the previous round, to cross
// over to the new theatre at the first press), idle (the clock of the bounce and the blinks, stopped while the scene waits), reduced,
// preview, and the decor settings (background, base, opacity).
export function drawMag(c,w,h,o){escFrame();const S=h/720,W=w/S,round=mgRound(o.variant),steps=o.steps||5;
 let count=Math.max(0,Math.min(o.count||0,steps)),t=o.t??1e3;if(o.preview){count=steps;t=7.8;}
 const decor=escDecor(o),idle=o.reduced?0:o.idle||0;MG_LIFT=!decor.white&&decor.fade<.5;const coat=(MG_LIFT?MG_COATS_LIFT:MG_COATS)[round.coat];
 c.save();c.scale(S,S);
 if(decor.fade<1){c.fillStyle=decor.base;c.fillRect(0,0,W,720);}
 const old=o.from!==undefined&&count===1&&o.from!==o.variant?mgRound(o.from):null,swap=old?Ksmooth(t/1.2):1,key=r=>`|${r.v}|${W.toFixed(1)}${escDecorKey(decor)}`;
 if(decor.fade>0){if(old&&swap<1)escBlit(c,'mg-back'+key(old),W,720,escVeiled(decor,(sc,sw)=>mgBack(sc,sw,old)));
  escBlit(c,'mg-back'+key(round),W,720,escVeiled(decor,(sc,sw)=>mgBack(sc,sw,round)),swap);}
 const k=Math.min(1,W/1280);c.save();c.translate(W/2,600);c.scale(k,k);mgStage(c,round,coat,count,steps,t,idle,o.reduced,o.held??1e3);c.restore();
 if(decor.fade>0){if(old&&swap<1)escBlit(c,'mg-front'+key(old),W,720,escVeiled(decor,(sc,sw)=>mgFront(sc,sw,old)),1-swap);
  escBlit(c,'mg-front'+key(round),W,720,escVeiled(decor,(sc,sw)=>mgFront(sc,sw,round)),old?swap:1);}
 c.restore();MG_LIFT=false;}
