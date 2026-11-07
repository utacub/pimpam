// Toc, toc! Qui hi ha? (CE30), 0.22: the picture, a street from a humour comic of the 1950s: pen line of an even weight, flat colours
// with a little shading, round heads with big noses and tall eyes, skin of several tones drawn in the same way. A house stands in the
// middle (a farmhouse, a town house, a circus caravan, a log cabin, a rocket) at one of four times of day. The door is always drawn,
// also without decor: when somebody knocks it shakes, light comes from under it with the shadow of their feet; when it opens, it swings
// into the warm light of the house and the visitor comes out. Who is still in the doorway is drawn behind the frame (cut by it), who
// is in the street in front of it. The scene is drawn in units of a screen 720 high; the stage (1280 wide) shrinks on narrow screens
// around the foot of the picture. The still back (sky, landscape, house) is drawn once for each round, size and decor into a sheet.
// Rotations stay slow (a tilt of less than a quarter of a turn a second); pirouettes and turns of the head are drawn as a flip.
import {Kbump,Kclamp,KeaseBack,KeaseInOut,KeaseOut,Kmix,Krand,Ksmooth} from './kaleido-base.js';
import {escBlit,escCanvas,escDecor,escDecorKey,escFrame,escVeiled} from './escenari.js';
import {TC_FINAL,TC_FIRST,TC_KNOCKS,TC_KNOCK_EVERY,TC_LEAVING,TC_T,TC_VISIT,TC_VISITORS,tcEnsure,tcRound} from './toc.js';

const TK_TAU=Math.PI*2,TK_INK='#231a20';
// Marks drawn as lines alone (the knocks, speed lines, notes): in ink, or light on a black base with little or no decor.
let TK_MARK=TK_INK;
// The door: half its width, its top, its sill; where the people stand in the street.
const TK_DX=75,TK_DT=322,TK_DB=596,TK_GY=652;
// The places in the street, left and right of the door in turn; the last visitor of a round stands in the middle, in front.

// The stage is drawn a little larger than the screen, so that the people are big; the outer places come in on narrow screens.
const TK_ZOOM=1.15;
const tkEll=(c,x,y,rx,ry,r=0)=>{c.moveTo(x+rx*Math.cos(r),y+rx*Math.sin(r));c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),r,0,TK_TAU);};
const tkRR=(c,x,y,w,h,r)=>{r=Math.max(0,Math.min(r,w/2,h/2));c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
function tkInk(c,path,fill,lw=4){c.beginPath();path(c);if(fill){c.fillStyle=fill;c.fill();}if(lw>0){c.strokeStyle=TK_INK;c.lineWidth=lw;c.lineJoin='round';c.lineCap='round';c.stroke();}}
function tkLine(c,pts,lw=4,col=TK_INK){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.strokeStyle=col;c.lineWidth=lw;c.lineCap='round';c.lineJoin='round';c.stroke();}
// A limb, a neck or a pipe: a stroke of colour over a wider one of ink.
function tkLimb(c,pts,w,col){tkLine(c,pts,w+7,TK_INK);tkLine(c,pts,w,col);}
// The colour of the light on the house: each channel multiplied (the evening, the night).
const tkMul=(hex,m)=>{if(!m)return hex;const a=parseInt(hex.slice(1),16),b=parseInt(m.slice(1),16),ch=s=>Math.round(((a>>s)&255)*((b>>s)&255)/255);return '#'+[16,8,0].map(s=>ch(s).toString(16).padStart(2,'0')).join('');};
const tkHit=(t,at,rate=10)=>t>=at?Math.exp(-(t-at)*rate):0;
// A spring: from `from` to 1, settling with a few small bounces.
const tkSpring=(t,from,rate=8,freq=22)=>t<=0?from:1+(from-1)*Math.exp(-t*rate)*Math.cos(t*freq);

// ── Times of day and houses ──────────────────────────────────────────────────────────────────────────────────────────────
// sky: top, middle, bottom; sun: [x, y (fractions of the screen), radius, colour]; mul: the light on the house.
const TK_TIMES=Object.freeze([
 {sky:['#86c9ec','#bfe3f3','#fcebc4'],sun:[.18,.3,44,'#fff3b8'],mul:'#fff6ea',cloud:'#ffffff'},
 {sky:['#3a8fdc','#79bdee','#d4ecfa'],sun:[.76,.12,40,'#fff8d6'],mul:null,cloud:'#ffffff'},
 {sky:['#4b3f8e','#c0648c','#f7a65e'],sun:[.84,.5,72,'#ffcf6a'],mul:'#ffe2cc',cloud:'#f6b9a8'},
 {sky:['#0a1236','#1c2a62','#3a4f8a'],moon:[.8,.16,34],mul:'#6672b0',cloud:null}]);
// The door of each house: the leaf (outside and inside), the frame, the sill.
const TK_HOUSES=Object.freeze([
 {leaf:'#8a5a34',frame:'#dccaa6',step:'#cdb894',kind:'planks'},
 {leaf:'#2f6db5',frame:'#f3ead8',step:'#c9c0b0',kind:'panels'},
 {leaf:'#f2c14e',frame:'#2e8a8f',step:'#a8743f',kind:'porthole'},
 {leaf:'#c08a4e',frame:'#8a5a30',step:'#a39d92',kind:'brace'},
 {leaf:'#a3b4c6',frame:'#6d7d90',step:'#b9b2a6',kind:'hatch'}]);
const TK_LIT='#ffd36a',TK_WARM='#ffcf7a';

function tkCloud(c,x,y,s,col){const B=[[0,0,34],[30,-14,30],[60,0,30],[28,8,28],[-28,6,24],[86,8,20]];c.save();c.translate(x,y);c.scale(s,s);
 c.beginPath();for(const [bx,by,r] of B)tkEll(c,bx,by,r,r*.8);c.strokeStyle=TK_INK;c.lineWidth=5/s;c.stroke();c.fillStyle=col;c.fill();c.restore();}
// A window: glass (warm light at night), a sill, shutters, a flower box. x: its middle; y: its top.
function tkWindow(c,x,y,w,h,t,night,o={}){
 if(o.shut){for(const sg of [-1,1]){const sx=x+sg*(w/2+3)-(sg<0?w*.48:0);tkInk(c,cc=>cc.rect(sx,y,w*.48,h),t(o.shut),3);c.strokeStyle=t(Kmix(o.shut,'#000000',.25));c.lineWidth=2;for(let k=1;k<4;k++){c.beginPath();c.moveTo(sx+5,y+h*k/4);c.lineTo(sx+w*.48-5,y+h*k/4);c.stroke();}}}
 const glass=night?TK_LIT:t('#a9d4ec'),shape=cc=>{if(o.round){tkEll(cc,x,y+h/2,w/2,h/2);}else if(o.arch){cc.moveTo(x-w/2,y+h);cc.lineTo(x-w/2,y+w/2);cc.arc(x,y+w/2,w/2,Math.PI,0);cc.lineTo(x+w/2,y+h);cc.closePath();}else cc.rect(x-w/2,y,w,h);};
 if(night){c.save();const g=c.createRadialGradient(x,y+h/2,4,x,y+h/2,w*1.1);g.addColorStop(0,'rgba(255,211,106,.45)');g.addColorStop(1,'rgba(255,211,106,0)');c.fillStyle=g;c.fillRect(x-w*1.2,y+h/2-w*1.2,w*2.4,w*2.4);c.restore();}
 tkInk(c,shape,glass,4);
 if(!night){c.save();c.beginPath();shape(c);c.clip();c.strokeStyle='rgba(255,255,255,.65)';c.lineWidth=5;c.beginPath();c.moveTo(x-w*.3,y+h*.75);c.lineTo(x+w*.1,y+h*.2);c.stroke();c.restore();}
 else if(o.curtain!==false){c.fillStyle='rgba(214,120,70,.45)';c.beginPath();c.moveTo(x-w/2+3,y+(o.round?h*.2:3));c.quadraticCurveTo(x-w*.15,y+h*.4,x-w/2+3,y+h-3);c.closePath();c.fill();}
 c.strokeStyle=TK_INK;c.lineWidth=3;if(!o.round&&!o.plain){c.beginPath();c.moveTo(x,y+(o.arch?w*.2:0));c.lineTo(x,y+h);c.moveTo(x-w/2,y+h*.45);c.lineTo(x+w/2,y+h*.45);c.stroke();}
 if(!o.round)tkInk(c,cc=>cc.rect(x-w/2-6,y+h,w+12,8),t('#e8dcc6'),3);
 if(o.box){tkInk(c,cc=>cc.rect(x-w/2,y+h+8,w,14),t('#b5643a'),3);for(let k=0;k<5;k++){const fx=x-w/2+8+k*(w-16)/4;tkInk(c,cc=>tkEll(cc,fx,y+h+4,7,6),t(k%2?'#7ab84a':'#e85a6a'),2.5);}}}
function tkPine(c,x,y,hh,col,t){tkInk(c,cc=>{cc.moveTo(x,y-hh);for(let k=0;k<3;k++){const yy=y-hh+hh*(k+1)/3,ww=hh*(.22+k*.08);cc.lineTo(x+ww,yy);cc.lineTo(x+ww*.45,yy);}cc.lineTo(x+4,y);cc.lineTo(x-4,y);for(let k=2;k>=0;k--){const yy=y-hh+hh*(k+1)/3,ww=hh*(.22+k*.08);cc.lineTo(x-ww*.45,yy);cc.lineTo(x-ww,yy);}cc.closePath();},t(col),3);}
function tkHills(c,HW,y0,amp,col,seed,t){tkInk(c,cc=>{cc.moveTo(-HW,720);cc.lineTo(-HW,y0);const n=5;for(let i=0;i<n;i++){const x0=-HW+2*HW*i/n,x1=-HW+2*HW*(i+1)/n;cc.quadraticCurveTo((x0+x1)/2,y0-amp*(.4+.6*Krand(i,seed)),x1,y0+amp*.15*(Krand(i+5,seed)-.5));}cc.lineTo(HW,720);cc.closePath();},t(col),3);}

// The houses, around a door at (0, 596). t: the colour in the light of the hour.
const TK_BUILD=Object.freeze([
 // A farmhouse (masia): whitewashed stone, a low gable roof of tiles, a round arch of stones over the door, geraniums.
 (c,HW,t,night)=>{tkHills(c,HW,440,60,'#a9cf8c',3,t);tkHills(c,HW,505,34,'#8cc063',4,t);
  c.strokeStyle=t('#79ad52');c.lineWidth=3;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-HW,540+i*16);c.quadraticCurveTo(0,522+i*18,HW,536+i*16);c.stroke();}
  for(const [x,hh] of [[-470,170],[-528,130],[486,150]])tkInk(c,cc=>{cc.moveTo(x,600-hh);cc.quadraticCurveTo(x+26,600-hh*.5,x+12,598);cc.lineTo(x-12,598);cc.quadraticCurveTo(x-26,600-hh*.5,x,600-hh);},t('#3f7a4a'),3);
  c.fillStyle=t('#d6b47e');c.fillRect(-HW,598,2*HW,130);c.fillStyle=t('#c29c64');for(let i=0;i<26;i++){c.beginPath();tkEll(c,(Krand(i,7)*2-1)*HW,625+Krand(i,8)*90,6+Krand(i,9)*6,3);c.fill();}
  tkInk(c,cc=>{cc.moveTo(-310,600);cc.lineTo(-310,250);cc.lineTo(0,140);cc.lineTo(310,250);cc.lineTo(310,600);cc.closePath();},t('#efe1c4'),4);
  for(const sg of [-1,1])for(let k=0;k<9;k++){const w=k%2?24:36,x=sg<0?-310:310-w;tkInk(c,cc=>cc.rect(x,240+k*40,w,40),t('#dcc8a2'),2.5);}
  tkInk(c,cc=>{cc.moveTo(-358,250);cc.lineTo(0,124);cc.lineTo(358,250);cc.lineTo(342,262);cc.lineTo(0,144);cc.lineTo(-342,262);cc.closePath();},t('#c8693c'),4);
  c.strokeStyle=t('#a9542f');c.lineWidth=3;for(const f of [.3,.55,.8]){c.beginPath();c.moveTo(-358*f,250-126*(1-f)+4);c.lineTo(0,132);c.lineTo(358*f,250-126*(1-f)+4);c.stroke();}
  tkInk(c,cc=>{cc.moveTo(-104,600);cc.lineTo(-104,346);cc.arc(0,346,104,Math.PI,0);cc.lineTo(104,600);cc.closePath();},t('#cbb48c'),3);
  for(let i=0;i<9;i++){const a0=Math.PI+i*Math.PI/9,a1=a0+Math.PI/9;tkInk(c,cc=>{cc.arc(0,346,134,a0,a1);cc.arc(0,346,104,a1,a0,true);cc.closePath();},t(i%2?'#e3d1ae':'#d6c29c'),3);}
  for(const sg of [-1,1])for(let k=0;k<6;k++){const x=sg<0?-134:104;tkInk(c,cc=>cc.rect(x,346+k*42,30,42),t(k%2?'#e3d1ae':'#d6c29c'),2.5);}
  tkWindow(c,-196,272,58,78,t,night,{shut:'#5f8f4a'});tkWindow(c,196,272,58,78,t,night,{shut:'#5f8f4a'});tkWindow(c,0,166,40,54,t,night,{arch:true,plain:true});
  for(const sg of [-1,1]){const x=sg*178;tkInk(c,cc=>{cc.moveTo(x-22,560);cc.lineTo(x+22,560);cc.lineTo(x+16,600);cc.lineTo(x-16,600);cc.closePath();},t('#c8693c'),3);
   for(let k=0;k<6;k++)tkInk(c,cc=>tkEll(cc,x-20+k*8,548-(k%2)*12,9,8),t(k%3?'#6fae4a':'#e0485a'),2.5);}},
 // A town house: two floors in ochre with a cornice, balconies with iron railings, green shutters; other houses on both sides; a
 // lantern on the wall.
 (c,HW,t,night)=>{tkInk(c,cc=>cc.rect(-HW-10,214,HW-245,400),t('#d9785c'),4);tkInk(c,cc=>cc.rect(255,136,HW-245,480),t('#8fbccc'),4);
  tkInk(c,cc=>cc.rect(-HW-10,202,HW-245,16),t('#efd8b8'),3);tkInk(c,cc=>cc.rect(255,124,HW-245,16),t('#e6eef0'),3);
  for(let x=-320;x>-HW-40;x-=118)for(const y of [262,420])tkWindow(c,x,y,52,84,t,night,{shut:'#b8574a'});
  for(let x=320;x<HW+40;x+=118)for(const y of [170,300,440])tkWindow(c,x,y,52,84,t,night,{shut:'#4f7f9a'});
  c.fillStyle=t('#d4c8b2');c.fillRect(-HW,598,2*HW,102);c.fillStyle=t('#a99c88');c.fillRect(-HW,700,2*HW,40);tkLine(c,[[-HW,700],[HW,700]],4);
  c.strokeStyle=t('#b9ab93');c.lineWidth=3;for(let x=-HW+40;x<HW;x+=120){c.beginPath();c.moveTo(x,600);c.lineTo(x-30,700);c.stroke();}
  tkInk(c,cc=>cc.rect(-255,166,510,434),t('#ebb85e'),4);tkInk(c,cc=>{cc.moveTo(-276,150);cc.lineTo(276,150);cc.lineTo(268,172);cc.lineTo(-268,172);cc.closePath();},t('#f3e2b8'),4);
  tkInk(c,cc=>{cc.moveTo(-262,150);cc.lineTo(-240,118);cc.lineTo(240,118);cc.lineTo(262,150);cc.closePath();},t('#c4683a'),4);tkInk(c,cc=>cc.rect(-255,560,510,40),t('#c99a4a'),4);
  for(const x of [-150,150]){tkWindow(c,x,190,64,92,t,night,{shut:'#3f8f6a'});tkInk(c,cc=>cc.rect(x-60,282,120,10),t('#efe1c4'),3);
   tkInk(c,cc=>cc.rect(x-56,242,112,6),t('#4a4458'),2.5);for(let k=0;k<5;k++)tkLine(c,[[x-52+k*26,246],[x-52+k*26,282]],4,t('#4a4458'));}
  tkWindow(c,0,196,44,56,t,night,{box:true});
  for(const x of [-196,196])tkWindow(c,x,420,56,98,t,night,{shut:'#3f8f6a',box:true});
  tkLine(c,[[-140,360],[-118,360],[-118,370]],5);tkInk(c,cc=>{cc.moveTo(-130,370);cc.lineTo(-106,370);cc.lineTo(-110,402);cc.lineTo(-126,402);cc.closePath();},night?TK_LIT:t('#e9e2c8'),3.5);
  if(night){c.save();const g=c.createRadialGradient(-118,388,4,-118,388,70);g.addColorStop(0,'rgba(255,211,106,.5)');g.addColorStop(1,'rgba(255,211,106,0)');c.fillStyle=g;c.fillRect(-190,318,144,144);c.restore();}},
 // A circus caravan: red with yellow trim, an arched teal roof with a stove pipe, round windows, big wheels; a big top far away.
 (c,HW,t,night)=>{tkHills(c,HW,470,46,'#b5da7a',11,t);
  const tx=Math.min(HW-90,470);tkInk(c,cc=>{cc.moveTo(tx-80,520);cc.lineTo(tx-60,470);cc.lineTo(tx,440);cc.lineTo(tx+60,470);cc.lineTo(tx+80,520);cc.closePath();},t('#f3e6cf'),3);
  for(let k=0;k<3;k++){const a=-60+k*40;tkInk(c,cc=>{cc.moveTo(tx,440);cc.lineTo(tx+a,470);cc.lineTo(tx+a*1.33,520);cc.lineTo(tx+a*1.33+18,520);cc.lineTo(tx+a+14,470);cc.closePath();},t('#d0584e'),2);}
  tkLine(c,[[tx,440],[tx,418]],3);tkInk(c,cc=>{cc.moveTo(tx,418);cc.lineTo(tx+18,424);cc.lineTo(tx,430);},t('#f2c14e'),2);
  for(const x of [-430,-510,-HW+30])if(x>-HW-30){tkLine(c,[[x,560],[x,500]],10,t('#7a4a26'));tkInk(c,cc=>{tkEll(cc,x,480,40,36);tkEll(cc,x-22,500,26,22);tkEll(cc,x+24,498,28,22);},t('#5f9e4a'),3);}
  c.fillStyle=t('#93c75a');c.fillRect(-HW,560,2*HW,170);tkLine(c,[[-HW,560],[HW,560]],3);c.strokeStyle=t('#6fa548');c.lineWidth=3;for(let i=0;i<30;i++){const x=(Krand(i,21)*2-1)*HW,y=590+Krand(i,22)*120;c.beginPath();c.moveTo(x-6,y);c.lineTo(x-2,y-10);c.moveTo(x,y);c.lineTo(x+2,y-12);c.moveTo(x+6,y);c.lineTo(x+5,y-9);c.stroke();}
  tkLine(c,[[170,252],[170,190]],18,t('#8a8a96'));tkLine(c,[[156,190],[184,190]],8,t('#8a8a96'));
  tkInk(c,cc=>{cc.moveTo(-278,300);cc.quadraticCurveTo(0,190,278,300);cc.lineTo(278,312);cc.lineTo(-278,312);cc.closePath();},t('#2e8a8f'),4);
  tkInk(c,cc=>cc.rect(-256,306,512,292),t('#c9524a'),4);
  c.strokeStyle=t('#f2c14e');c.lineWidth=5;c.beginPath();c.rect(-242,320,484,264);c.stroke();
  for(const sg of [-1,1]){c.beginPath();c.arc(sg*214,350,16,0,Math.PI*1.5,sg>0);c.stroke();c.beginPath();c.arc(sg*214,556,16,Math.PI*.5,Math.PI*2,sg<0);c.stroke();}
  for(const x of [-168,168])tkWindow(c,x,350,72,72,t,night,{round:true});
  for(const x of [-196,196]){tkInk(c,cc=>tkEll(cc,x,570,54,54),t('#f2c14e'),4);tkInk(c,cc=>tkEll(cc,x,570,38,38),t('#c9524a'),3);for(let k=0;k<6;k++){const a=k*Math.PI/3;tkLine(c,[[x,570],[x+Math.cos(a)*40,570+Math.sin(a)*40]],6,t('#f2c14e'));}tkInk(c,cc=>tkEll(cc,x,570,11,11),t('#8a5a30'),3);}},
 // A log cabin in the mountains: logs with round ends, a roof of green shingles, a stone chimney, pines; a lantern by the door.
 (c,HW,t,night)=>{for(const [x,hh,w] of [[-HW*.6,260,360],[0,220,420],[HW*.62,280,380]]){tkInk(c,cc=>{cc.moveTo(x-w,560);cc.lineTo(x,560-hh);cc.lineTo(x+w,560);cc.closePath();},t('#9cb2d4'),3);
   tkInk(c,cc=>{cc.moveTo(x-w*.25,560-hh*.75);cc.lineTo(x,560-hh);cc.lineTo(x+w*.25,560-hh*.75);cc.lineTo(x+w*.1,560-hh*.68);cc.lineTo(x,560-hh*.76);cc.lineTo(x-w*.12,560-hh*.68);cc.closePath();},t('#f4f6fa'),3);}
  for(let i=0;i<16;i++){const x=-HW+2*HW*(i+.5)/16+(Krand(i,31)-.5)*40;if(Math.abs(x)<300)continue;tkPine(c,x,566,120+Krand(i,32)*80,i%2?'#2f6a4a':'#3a7a55',t);}
  c.fillStyle=t('#7fa858');c.fillRect(-HW,566,2*HW,170);tkLine(c,[[-HW,566],[HW,566]],3);
  tkInk(c,cc=>{cc.moveTo(-105,604);cc.lineTo(105,604);cc.lineTo(170,730);cc.lineTo(-170,730);cc.closePath();},t('#c9a473'),3);
  for(let i=0;i<14;i++){const x=(Krand(i,33)*2-1)*HW,y=610+Krand(i,34)*100;if(Math.abs(x)<200)continue;tkInk(c,cc=>tkEll(cc,x,y,5,5),t(i%2?'#f2e27a':'#ffffff'),2);}
  tkInk(c,cc=>cc.rect(150,180,64,100),t('#9a9488'),4);c.strokeStyle=t('#7a746a');c.lineWidth=2.5;for(let k=1;k<4;k++){c.beginPath();c.moveTo(150,180+k*25);c.lineTo(214,180+k*25);c.stroke();}
  tkInk(c,cc=>cc.rect(-282,300,564,300),t('#b07a45'),4);c.strokeStyle=t('#7a4a2c');c.lineWidth=3;for(let y=330;y<600;y+=30){c.beginPath();c.moveTo(-282,y);c.lineTo(282,y);c.stroke();}
  for(const sg of [-1,1])for(let y=315;y<600;y+=30){tkInk(c,cc=>tkEll(cc,sg*282,y,15,14),t('#d9a86a'),3);c.beginPath();tkEll(c,sg*282,y,6,5);c.strokeStyle=t('#a8703f');c.lineWidth=2;c.stroke();}
  tkInk(c,cc=>{cc.moveTo(-326,316);cc.lineTo(0,160);cc.lineTo(326,316);cc.lineTo(310,326);cc.lineTo(0,180);cc.lineTo(-310,326);cc.closePath();},t('#5d7a3c'),4);
  c.strokeStyle=t('#4a6430');c.lineWidth=3;for(const f of [.35,.6,.85]){c.beginPath();c.moveTo(-326*f,316-156*(1-f)+6);c.lineTo(0,170);c.lineTo(326*f,316-156*(1-f)+6);c.stroke();}
  for(const x of [-180,180])tkWindow(c,x,384,72,76,t,night,{box:true});
  tkLine(c,[[-112,372],[-112,388]],4);tkInk(c,cc=>tkRR(cc,-124,388,24,30,6),night?TK_LIT:t('#e9e2c8'),3.5);
  if(night){c.save();const g=c.createRadialGradient(-112,402,3,-112,402,60);g.addColorStop(0,'rgba(255,211,106,.5)');g.addColorStop(1,'rgba(255,211,106,0)');c.fillStyle=g;c.fillRect(-172,342,120,120);c.restore();}},
 // A rocket at its launch pad in a desert: a silver body with a red band and red fins, portholes, a gantry; mesas far away.
 (c,HW,t,night)=>{for(const [x,w,hh] of [[-HW*.62,180,90],[HW*.55,240,70],[-HW*.15,120,50]])tkInk(c,cc=>{cc.moveTo(x-w/2-30,560);cc.lineTo(x-w/2,560-hh);cc.lineTo(x+w/2,560-hh);cc.lineTo(x+w/2+30,560);cc.closePath();},t('#d9956a'),3);
  c.fillStyle=t('#ecc68e');c.fillRect(-HW,556,2*HW,180);tkLine(c,[[-HW,556],[HW,556]],3);
  for(const x of [-HW*.8,HW*.82])if(Math.abs(x)>330){tkLimb(c,[[x,580],[x,530]],12,t('#5f9e5a'));tkLimb(c,[[x,560],[x-16,560],[x-16,544]],8,t('#5f9e5a'));tkLimb(c,[[x,552],[x+14,552],[x+14,536]],8,t('#5f9e5a'));}
  tkInk(c,cc=>{cc.moveTo(-HW,600);cc.lineTo(HW,600);cc.lineTo(HW,740);cc.lineTo(-HW,740);cc.closePath();},t('#c9c2b5'),3);c.strokeStyle=t('#aaa294');c.lineWidth=3;for(let x=-HW+60;x<HW;x+=150){c.beginPath();c.moveTo(x,602);c.lineTo(x-40,740);c.stroke();}
  const gx=-420;if(gx>-HW){for(const dx of [-26,26])tkLine(c,[[gx+dx,600],[gx+dx,140]],9,t('#7d8ea3'));for(let k=0;k<4;k++){const y=600-k*115;tkLine(c,[[gx-26,y],[gx+26,y-115]],5,t('#7d8ea3'));tkLine(c,[[gx-26,y-115],[gx+26,y-115]],6,t('#7d8ea3'));}
   tkLine(c,[[gx+26,230],[-150,230]],7,t('#7d8ea3'));}
  for(const sg of [-1,1])tkInk(c,cc=>{cc.moveTo(sg*160,420);cc.quadraticCurveTo(sg*300,500,sg*304,600);cc.lineTo(sg*160,580);cc.closePath();},t('#d6533f'),4);
  tkInk(c,cc=>{cc.moveTo(-166,600);cc.lineTo(-166,130);cc.quadraticCurveTo(-150,10,0,-40);cc.quadraticCurveTo(150,10,166,130);cc.lineTo(166,600);cc.closePath();},t('#ebe7de'),4);
  c.fillStyle=t('#d2cdc2');c.beginPath();c.moveTo(110,600);c.lineTo(110,140);c.quadraticCurveTo(116,70,70,10);c.quadraticCurveTo(160,60,163,130);c.lineTo(163,600);c.closePath();c.fill();
  tkInk(c,cc=>{cc.moveTo(-166,236);cc.lineTo(166,236);cc.lineTo(166,268);cc.lineTo(-166,268);cc.closePath();},t('#d6533f'),4);
  c.fillStyle=TK_INK;for(let x=-150;x<=150;x+=30){c.beginPath();tkEll(c,x,252,2.5,2.5);c.fill();}
  tkInk(c,cc=>tkEll(cc,0,170,44,44),t('#9aa3ad'),4);tkWindow(c,0,140,60,60,t,night,{round:true,curtain:false});}]);

// The back: sky, landscape and house, for one round.
function tkBack(c,W,v,k){const r=tcRound(v),T=TK_TIMES[r.time],night=r.time===3,mul=T.mul,t=col=>tkMul(col,mul);
 const g=c.createLinearGradient(0,0,0,720);g.addColorStop(0,T.sky[0]);g.addColorStop(.55,T.sky[1]);g.addColorStop(1,T.sky[2]);c.fillStyle=g;c.fillRect(0,0,W,720);
 if(T.moon){c.fillStyle='#fff6d8';for(let i=0;i<46;i++){const x=Krand(i,41)*W,y=Krand(i,42)*380,s=1.2+Krand(i,43)*2;c.beginPath();tkEll(c,x,y,s,s);c.fill();}
  const [mx,my,mr]=T.moon,X=mx*W,Y=my*720;c.save();const gl=c.createRadialGradient(X,Y,mr,X,Y,mr*3);gl.addColorStop(0,'rgba(255,246,216,.35)');gl.addColorStop(1,'rgba(255,246,216,0)');c.fillStyle=gl;c.fillRect(X-mr*3,Y-mr*3,mr*6,mr*6);c.restore();
  tkInk(c,cc=>{cc.arc(X,Y,mr,-Math.PI*.62,Math.PI*.62);cc.quadraticCurveTo(X+mr*.15,Y,X+mr*Math.cos(-Math.PI*.62),Y+mr*Math.sin(-Math.PI*.62));},'#fff1c8',3.5);}
 else{const [sx,sy,sr,col]=T.sun,X=sx*W,Y=sy*720;c.save();const gl=c.createRadialGradient(X,Y,sr*.8,X,Y,sr*2.6);gl.addColorStop(0,'rgba(255,240,190,.55)');gl.addColorStop(1,'rgba(255,240,190,0)');c.fillStyle=gl;c.fillRect(X-sr*2.6,Y-sr*2.6,sr*5.2,sr*5.2);c.restore();tkInk(c,cc=>tkEll(cc,X,Y,sr,sr),col,3.5);}
 if(T.cloud)for(let i=0;i<3;i++)tkCloud(c,W*(.08+.33*i+.12*Krand(i,v+50)),70+Krand(i,v+60)*110,.8+.5*Krand(i,v+70),T.cloud);
 c.save();c.translate(W/2,720);c.scale(k,k);c.translate(0,-720);TK_BUILD[r.house](c,W/2/k+20,t,night);c.restore();}

// ── The door ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The warm hall behind it: a floor running in, a far wall with a little picture and a coat stand.
function tkInterior(c){const g=c.createLinearGradient(0,TK_DT,0,TK_DB);g.addColorStop(0,'#ffe7b0');g.addColorStop(1,'#f4b25e');c.fillStyle=g;c.fillRect(-TK_DX,TK_DT,2*TK_DX,TK_DB-TK_DT);
 tkInk(c,cc=>{cc.moveTo(-TK_DX,TK_DB);cc.lineTo(-40,520);cc.lineTo(40,520);cc.lineTo(TK_DX,TK_DB);cc.closePath();},'#d98d4a',3);
 tkInk(c,cc=>cc.rect(-40,350,80,170),'#ffdca0',3);tkInk(c,cc=>cc.rect(-16,380,32,24),'#9fd0e0',2.5);c.fillStyle='#7ab84a';c.beginPath();c.moveTo(-16,404);c.lineTo(-4,392);c.lineTo(8,400);c.lineTo(16,394);c.lineTo(16,404);c.fill();}
// The leaf: shut (a = 0), or swung into the house (a in radians), seen from the street; dx: it shakes when somebody knocks.
function tkLeaf(c,H,t,a,dx){const col=t(H.leaf),dark=t(Kmix(H.leaf,'#1a1020',.28)),light=t(Kmix(H.leaf,'#ffffff',.14));
 if(a<.02){c.save();c.translate(dx,0);tkInk(c,cc=>cc.rect(-TK_DX+2,TK_DT+2,2*TK_DX-4,TK_DB-TK_DT-11),col,4);const k=H.kind;
  if(k==='panels'){for(const [x,y,h] of [[-60,342,112],[8,342,112],[-60,474,98],[8,474,98]])tkInk(c,cc=>cc.rect(x,y,52,h),light,3);tkInk(c,cc=>tkEll(cc,56,466,8,8),'#f2c14e',3);}
  else if(k==='planks'){c.strokeStyle=dark;c.lineWidth=3;for(const x of [-37,0,37]){c.beginPath();c.moveTo(x,TK_DT+4);c.lineTo(x,TK_DB-8);c.stroke();}
   for(const y of [360,552])tkInk(c,cc=>cc.rect(-73,y,70,9),t('#4a4458'),2.5);c.fillStyle=t('#4a4458');for(let i=0;i<12;i++){c.beginPath();tkEll(c,-56+(i%4)*37,400+Math.floor(i/4)*60,3.5,3.5);c.fill();}
   c.strokeStyle=t('#4a4458');c.lineWidth=5;c.beginPath();tkEll(c,0,446,15,15);c.stroke();}
  else if(k==='porthole'){c.strokeStyle=t('#c9524a');c.lineWidth=4;c.beginPath();c.rect(-60,336,120,244);c.stroke();tkInk(c,cc=>tkEll(cc,0,396,30,30),t('#a9d4ec'),4);
   c.fillStyle='rgba(214,90,80,.55)';c.beginPath();c.moveTo(-28,384);c.quadraticCurveTo(-6,396,-24,414);c.lineTo(-28,410);c.closePath();c.fill();tkInk(c,cc=>tkEll(cc,52,480,7,7),t('#c9524a'),3);}
  else if(k==='brace'){c.strokeStyle=dark;c.lineWidth=3;for(const x of [-45,-15,15,45]){c.beginPath();c.moveTo(x,TK_DT+4);c.lineTo(x,TK_DB-8);c.stroke();}
   tkInk(c,cc=>{cc.rect(-70,356,140,16);cc.rect(-70,540,140,16);},light,3);tkInk(c,cc=>{cc.moveTo(-62,540);cc.lineTo(50,372);cc.lineTo(66,372);cc.lineTo(-46,540);cc.closePath();},light,3);tkInk(c,cc=>cc.rect(50,454,16,10),t('#4a4458'),2.5);}
  else{tkInk(c,cc=>tkRR(cc,-62,334,124,250,16),light,3);c.fillStyle=TK_INK;for(let i=0;i<9;i++){c.beginPath();tkEll(c,-52,350+i*28,2.6,2.6);tkEll(c,52,350+i*28,2.6,2.6);c.fill();}
   tkInk(c,cc=>tkEll(cc,0,384,26,26),t('#7d8ea3'),4);tkInk(c,cc=>tkEll(cc,0,384,18,18),t('#a9d4ec'),3);c.strokeStyle=TK_INK;c.lineWidth=5;c.beginPath();tkEll(c,0,486,22,22);c.moveTo(-22,486);c.lineTo(22,486);c.moveTo(0,464);c.lineTo(0,508);c.stroke();}
  // the gap under the door
  c.fillStyle='#2a2026';c.fillRect(-TK_DX+4,TK_DB-9,2*TK_DX-8,9);c.restore();return;}
 const ca=Math.cos(a),d=150*Math.sin(a),xe=-TK_DX+2*TK_DX*ca,top=TK_DT+d*.12,bot=TK_DB-d*.07;
 tkInk(c,cc=>{cc.moveTo(-TK_DX,TK_DT);cc.lineTo(xe,top);cc.lineTo(xe,bot);cc.lineTo(-TK_DX,TK_DB);cc.closePath();},Kmix(col,'#5a3a2a',.25),3.5);
 if(ca>.2){c.strokeStyle=dark;c.lineWidth=2.5;for(const f of [.33,.66]){const x=-TK_DX+(xe+TK_DX)*f;c.beginPath();c.moveTo(x,TK_DT+(top-TK_DT)*f+16);c.lineTo(x,TK_DB+(bot-TK_DB)*f-16);c.stroke();}}
 const e=7*Math.sin(a);if(e>1)tkInk(c,cc=>cc.rect(xe-e,top,e,bot-top),light,2.5);}
// The frame (bulge: the posts bow outwards while the giant squeezes through) and the sill.
function tkFrame(c,H,t,bulge){const col=t(H.frame),O=TK_DX+18,k=H.kind,b=bulge||0;
 for(const sg of [-1,1])tkInk(c,cc=>{cc.moveTo(sg*TK_DX,TK_DT);cc.quadraticCurveTo(sg*(TK_DX+b*2),460,sg*TK_DX,TK_DB);cc.lineTo(sg*O,TK_DB);cc.quadraticCurveTo(sg*(O+b*2),460,sg*O,TK_DT-18);cc.lineTo(sg*TK_DX,TK_DT-18);cc.closePath();},col,4);
 tkInk(c,cc=>cc.rect(-O,TK_DT-18-b*.4,2*O,18),col,4);
 c.strokeStyle=t(Kmix(H.frame,'#1a1020',.3));c.lineWidth=2.5;
 if(k==='planks')for(const sg of [-1,1])for(let y=TK_DT+30;y<TK_DB;y+=48){c.beginPath();c.moveTo(sg*TK_DX,y);c.lineTo(sg*O,y);c.stroke();}
 if(k==='panels'){tkInk(c,cc=>cc.rect(-O-12,TK_DT-34,2*O+24,16),col,4);}
 if(k==='porthole'){c.strokeStyle=t('#f2c14e');c.lineWidth=3;for(const sg of [-1,1]){c.beginPath();c.moveTo(sg*(TK_DX+9),TK_DT-8);c.lineTo(sg*(TK_DX+9),TK_DB-4);c.stroke();}}
 if(k==='hatch'){c.fillStyle=TK_INK;for(const sg of [-1,1])for(let y=TK_DT+10;y<TK_DB;y+=34){c.beginPath();tkEll(c,sg*(TK_DX+9),y,2.4,2.4);c.fill();}}
 tkInk(c,cc=>cc.rect(-TK_DX-30,TK_DB,2*TK_DX+60,15),t(H.step),3.5);}
// Light under the door while somebody waits behind it, and the shadow of their feet (who: the next visitor).
function tkUnder(c,light,who,shift){if(light<=0)return;c.save();c.globalAlpha*=light;
 const g=c.createRadialGradient(0,TK_DB+8,4,0,TK_DB+8,170);g.addColorStop(0,'rgba(255,214,122,.95)');g.addColorStop(.5,'rgba(255,214,122,.4)');g.addColorStop(1,'rgba(255,214,122,0)');c.fillStyle=g;c.save();c.translate(0,TK_DB+8);c.scale(1,.24);c.translate(0,-TK_DB-8);c.fillRect(-180,TK_DB-170,360,360);c.restore();
 c.fillStyle='#ffe08a';c.fillRect(-TK_DX+4,TK_DB-9,2*TK_DX-8,9);
 c.save();c.beginPath();c.rect(-TK_DX+4,TK_DB-9,2*TK_DX-8,9);c.clip();c.fillStyle='rgba(35,26,32,.88)';c.beginPath();const name=TC_VISITORS[who];
 const feet=name==='giant'?[[-34,30],[34,30]]:name==='band'?[[-58,7],[-40,7],[-16,7],[2,7],[24,8],[44,8]]:name==='snowman'?[[0,40]]:[[-20,13],[20,13]];
 for(const [x,w] of feet)c.rect(x+shift-w/2,TK_DB-9,w,9);c.fill();c.restore();c.restore();}
// Three short strokes on each side of the door at the knocks (they stay for the whole knocking, so that they never blink).
function tkKnockMarks(c,ct){const a=Ksmooth((ct-TC_KNOCKS[0]+.03)/.06)*(1-Ksmooth((ct-TC_KNOCKS[2]-.35)/.3));if(a<=0)return;c.save();c.globalAlpha*=a;
 for(const sg of [-1,1])for(const an of [-.62,0,.62]){const x=sg*(TK_DX+20),y=440,ux=sg*Math.cos(an),uy=Math.sin(an);tkLine(c,[[x+ux*20,y+uy*20],[x+ux*50,y+uy*50]],7,TK_MARK);}
 c.restore();}

// ── The people ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// A face: round head, big nose, tall eyes. P.mood: smile, grin, o, strain, worry, happy, proud, dizzy, lick; P.look (-1 to 1);
// P.turn (1: facing us, -1: the back of the head; a flip in between); P.blink.
function tkHead(c,x,y,r,F,P={}){const turn=P.turn??1,look=Kclamp(P.look??0,-1,1),mood=P.mood||'smile';
 c.save();c.translate(x,y);if(P.tilt)c.rotate(P.tilt);c.scale(Math.max(.08,Math.abs(turn))*(P.hsx||1),P.hsy||1);
 if(turn<0){tkInk(c,cc=>{tkEll(cc,-r*.98,r*.05,r*.16,r*.22);tkEll(cc,r*.98,r*.05,r*.16,r*.22);},F.skin,3.5);tkInk(c,cc=>tkEll(cc,0,0,r,r*1.04),F.skin,4);(F.back||F.hair)?.(c,r,P,true);F.hat?.(c,r,P);c.restore();return;}
 F.hairBack?.(c,r,P);tkInk(c,cc=>{tkEll(cc,-r*.98,r*.05,r*.16,r*.22);tkEll(cc,r*.98,r*.05,r*.16,r*.22);},F.skin,3.5);
 tkInk(c,cc=>tkEll(cc,0,0,r,r*1.04),F.skin,4);
 c.fillStyle='rgba(235,110,100,.3)';c.beginPath();tkEll(c,-r*.52,r*.34,r*.2,r*.13);tkEll(c,r*.52,r*.34,r*.2,r*.13);c.fill();
 F.face?.(c,r,P);
 const ex=r*.27,ey=-r*.13,erx=r*.15,ery=r*.21,lx=look*r*.07;
 const eye=sg=>{const X=sg*ex+lx;
  if(P.blink||mood==='happy'||mood==='proud'||mood==='lick'){tkLine(c,[[X-erx,ey+2],[X,ey-ery*.7],[X+erx,ey+2]],4);return;}
  if(mood==='strain'){tkLine(c,[[X-sg*erx,ey-ery*.6],[X+sg*erx*.8,ey],[X-sg*erx,ey+ery*.6]],4);return;}
  const big=mood==='o'||mood==='worry'?1.12:1;tkInk(c,cc=>tkEll(cc,X,ey,erx*big,ery*big),'#ffffff',3);
  if(mood==='dizzy'){c.beginPath();for(let i=0;i<=24;i++){const an=i*.55,rr=erx*.9*i/24;c.lineTo(X+Math.cos(an)*rr,ey+Math.sin(an)*rr*1.3);}c.strokeStyle=TK_INK;c.lineWidth=2.5;c.stroke();return;}
  c.fillStyle=TK_INK;c.beginPath();tkEll(c,X+look*erx*.45,ey+ery*.18,erx*(big>1?.42:.55),ery*(big>1?.42:.55));c.fill();
  c.fillStyle='#ffffff';c.beginPath();tkEll(c,X+look*erx*.45-erx*.15,ey,erx*.14,erx*.14);c.fill();};
 eye(-1);eye(1);
 const by=ey-ery-r*(mood==='o'||mood==='worry'?.2:.1);for(const sg of [-1,1]){const X=sg*ex+lx,inn=mood==='strain'?r*.08:mood==='worry'?-r*.08:0;tkLine(c,[[X-sg*erx*1.1,by+(mood==='strain'?-r*.04:0)],[X,by-r*.06],[X+sg*erx*1.1,by+inn]].map(([a,b])=>[a,b]),4.5);}
 const my=r*.5;c.strokeStyle=TK_INK;
 if(mood==='o'||mood==='dizzy')tkInk(c,cc=>tkEll(cc,lx,my+r*.06,r*.1,r*.13),'#7a2430',3);
 else if(mood==='strain'){tkInk(c,cc=>tkRR(cc,-r*.3+lx,my-r*.08,r*.6,r*.2,4),'#ffffff',3);tkLine(c,[[-r*.3+lx,my+r*.02],[r*.3+lx,my+r*.02]],2);}
 else if(mood==='worry'){c.lineWidth=4;c.beginPath();c.moveTo(-r*.24+lx,my);for(let i=1;i<=4;i++)c.quadraticCurveTo(-r*.24+lx+(i-.5)*r*.12,my+(i%2?-r*.07:r*.07),-r*.24+lx+i*r*.12,my);c.stroke();}
 else if(mood==='grin'||mood==='lick'){tkInk(c,cc=>{cc.moveTo(-r*.34+lx,my-r*.08);cc.quadraticCurveTo(lx,my+r*.42,r*.34+lx,my-r*.08);cc.quadraticCurveTo(lx,my+r*.04,-r*.34+lx,my-r*.08);cc.closePath();},'#7a2430',3.5);
  c.fillStyle='#e8707a';c.beginPath();tkEll(c,lx,my+r*.15,r*.13,r*.06);c.fill();
  if(mood==='lick')tkInk(c,cc=>{cc.moveTo(r*.06+lx,my+r*.02);cc.quadraticCurveTo(r*.42,my-r*.05,r*.3,my-r*.38);cc.quadraticCurveTo(r*.18,my-r*.2,-r*.04+lx,my);cc.closePath();},'#ef7f8c',3);}
 else{c.lineWidth=4;c.beginPath();c.moveTo(-r*.3+lx,my-r*.06);c.quadraticCurveTo(lx,my+r*(mood==='proud'?.2:.26),r*.3+lx,my-r*.06);c.stroke();}
 if(!F.noNose){const nc=F.nose||Kmix(F.skin,'#b8484a',.28);tkInk(c,cc=>tkEll(cc,lx*1.3,r*.17,r*.21,r*.17),nc,3.5);c.fillStyle='rgba(255,255,255,.5)';c.beginPath();tkEll(c,lx*1.3-r*.07,r*.11,r*.06,r*.04);c.fill();}
 F.hair?.(c,r,P,false);F.hat?.(c,r,P);c.restore();}
// A figure standing on (0, 0), facing us. F: how it looks; P: its pose (step: the phase of walking; arms: [left, right], each
// [shoulder, elbow] in radians from hanging down; bow; sit; squat; passe: the right foot at the left knee; hold: what the hands hold).
function tkPerson(c,F,P){const st=P.step,b=Kclamp(P.bow||0),sit=Kclamp(P.sit||0),sq=Kclamp(P.squat||0),legH=F.legH*(1-.3*sq),hipY=-legH*(1-.72*sit),shY=hipY-F.bodyH*(1-.22*b),hw=F.bodyW/2;
 F.behind?.(c,F,P,hipY,shY);
 if(!F.noLegs){tkInk(c,cc=>tkRR(cc,-F.hipW-F.legW*.7,hipY-12,2*F.hipW+F.legW*1.4,22,8),F.pants,3.5);
  for(const sg of [-1,1]){const hx=sg*F.hipW;let kx,ky,fx,fy;
   if(sit>0){fx=sg*(F.hipW+26);fy=-2;kx=sg*(F.hipW+34);ky=hipY-18*sit;}
   else if(P.passe&&sg>0){kx=hx+F.legH*.42;ky=hipY+legH*.42;fx=8;fy=hipY+legH*.6;}
   else{const sw=st==null?0:Math.sin(st)*.32*sg,lift=st==null?0:Math.max(0,Math.sin(st)*sg)*12*(P.stride??1);fx=hx+Math.sin(sw*(P.stride??1))*legH+sg*(P.wide||0);fy=-lift;kx=(hx+fx)/2+sg*4;ky=(hipY+fy)/2;}
   tkLimb(c,[[hx,hipY],[kx,ky],[fx,fy-6]],F.legW,F.pants);
   if(F.shoe)F.shoe(c,fx,fy,sg,P,sit);else tkInk(c,cc=>tkEll(cc,fx+sg*7,fy-7,F.shoeW||19,9),F.shoes,3.5);}}
 else F.shoe?.(c,0,0,0,P,sit);
 (F.torso||tkTorso)(c,F,P,hipY,shY);
 const arms=P.arms||[[.2,.25],[.2,.25]],hands=[];
 for(let i=0;i<2;i++){const sg=i?1:-1,[a1,a2]=arms[i],sx=sg*hw*.86,sy=shY+F.armW*.7,ex=sx+sg*Math.sin(a1)*F.l1,ey=sy+Math.cos(a1)*F.l1,hx=ex+sg*Math.sin(a1+a2)*F.l2,hy=ey+Math.cos(a1+a2)*F.l2;
  tkLimb(c,[[sx,sy],[ex,ey],[hx,hy]],F.armW,F.sleeve||F.shirt);hands.push([hx,hy]);}
 P.hold?.(c,hands,shY,hipY);
 for(const [x,y] of hands)tkInk(c,cc=>tkEll(cc,x,y,F.handR,F.handR),F.glove||F.skin,3.5);
 const hx=P.headDx||0,hy=shY-F.neck-F.headR*.92+b*F.headR*.45;
 if(!P.noHead)(F.head||((cc,x,y,PP)=>tkHead(cc,x,y,F.headR,F,PP)))(c,hx,hy,P);
 P.over?.(c,hx,hy,hands);
 return {hands,head:[hx,hy],shY,hipY};}
function tkTorso(c,F,P,hipY,shY){const hw=F.bodyW/2,bw=hw*(F.waist??.9),sh=Math.min(hw*.45,(hipY-shY)*.4);
 tkInk(c,cc=>{cc.moveTo(-bw,hipY+6);cc.lineTo(-hw,shY+sh);cc.quadraticCurveTo(-hw,shY,-hw+sh,shY);cc.lineTo(hw-sh,shY);cc.quadraticCurveTo(hw,shY,hw,shY+sh);cc.lineTo(bw,hipY+6);cc.quadraticCurveTo(0,hipY+14,-bw,hipY+6);cc.closePath();},F.shirt,4);
 F.dress?.(c,F,P,hipY,shY);}
// A figure at a place: P.x, P.y (feet), P.s (size), P.sx and P.sy (squash), P.tilt around P.pivot (height above the feet).
function tkAt(c,P,draw,shadow=true){c.save();c.translate(P.x||0,P.y||0);const s=P.s||1;
 if(shadow&&!(P.air>0)){c.fillStyle='rgba(35,26,32,.18)';c.beginPath();tkEll(c,0,2,56*s*(P.sx||1),9*s);c.fill();}
 if(P.air>0){c.fillStyle='rgba(35,26,32,.12)';c.beginPath();tkEll(c,0,2+P.air*s,40*s,7*s);c.fill();}
 c.scale(s*(P.sx||1)*(P.flip||1),s*(P.sy||1));if(P.tilt){const py=-(P.pivot||0);c.translate(0,py);c.rotate(P.tilt);c.translate(0,-py);}draw(c);c.restore();}

// Hair, hats and faces.
const tkHairShort=col=>(c,r,P,back)=>{if(back){tkInk(c,cc=>{cc.moveTo(-r*.98,r*.1);cc.quadraticCurveTo(-r*1.05,-r*1.1,0,-r*1.08);cc.quadraticCurveTo(r*1.05,-r*1.1,r*.98,r*.1);cc.quadraticCurveTo(0,r*.5,-r*.98,r*.1);cc.closePath();},col,4);return;}
 tkInk(c,cc=>{cc.moveTo(-r*.96,-r*.18);cc.quadraticCurveTo(-r*1.02,-r*1.08,0,-r*1.07);cc.quadraticCurveTo(r*1.02,-r*1.08,r*.96,-r*.18);cc.quadraticCurveTo(r*.6,-r*.62,r*.1,-r*.56);cc.quadraticCurveTo(-r*.5,-r*.8,-r*.96,-r*.18);cc.closePath();},col,4);};
const tkHairCurly=col=>(c,r,P,back)=>{tkInk(c,cc=>{const n=back?11:8;for(let i=0;i<n;i++){const an=Math.PI*(back?.95+1.1*i/(n-1):1.05+.9*i/(n-1)),rr=r*(back?.9:.98);tkEll(cc,Math.cos(an)*rr,Math.sin(an)*rr*(back?1:.95)+(back?r*.05:0),r*.26,r*.24);}if(back)tkEll(cc,0,0,r*.85,r*.85);},col,3.5);};

// The giant of the festa: a long blue robe with gold, a purple cape, a brown beard and a crown (P.crown: it slips over his eyes).
const TK_GIANT=Object.freeze({skin:'#e6b088',shirt:'#2f6db5',pants:'#2f6db5',shoes:'#7a4a26',legH:112,bodyH:205,bodyW:186,hipW:40,legW:30,armW:32,l1:88,l2:80,headR:58,handR:19,neck:4,noLegs:true,
 shoe:(c,x,y,sg,P,sit)=>{for(const s2 of [-1,1])tkInk(c,cc=>tkEll(cc,s2*42+s2*6,-12,36,15),'#7a4a26',4);},
 behind:(c,F,P,hipY,shY)=>tkInk(c,cc=>{cc.moveTo(-F.bodyW*.48,shY+10);cc.quadraticCurveTo(-F.bodyW*.78,(shY-22)/2,-F.bodyW*.72,-30);cc.lineTo(F.bodyW*.72,-30);cc.quadraticCurveTo(F.bodyW*.78,(shY-22)/2,F.bodyW*.48,shY+10);cc.closePath();},'#7b3f98',4),
 torso:(c,F,P,hipY,shY)=>{const hw=F.bodyW/2;tkInk(c,cc=>{cc.moveTo(-hw,shY+30);cc.quadraticCurveTo(-hw,shY,-hw+30,shY);cc.lineTo(hw-30,shY);cc.quadraticCurveTo(hw,shY,hw,shY+30);cc.quadraticCurveTo(hw*1.22,-60,hw*1.3,-24);cc.quadraticCurveTo(0,-14,-hw*1.3,-24);cc.quadraticCurveTo(-hw*1.22,-60,-hw,shY+30);cc.closePath();},'#2f6db5',4);
  c.fillStyle='rgba(20,30,80,.18)';c.beginPath();c.moveTo(hw*.35,shY+10);c.quadraticCurveTo(hw*.9,-80,hw*1.1,-26);c.lineTo(hw*.5,-22);c.closePath();c.fill();
  tkInk(c,cc=>{cc.moveTo(-14,shY+4);cc.lineTo(14,shY+4);cc.lineTo(20,-18);cc.lineTo(-20,-18);cc.closePath();},'#f2c14e',3.5);
  tkInk(c,cc=>cc.rect(-hw*.95,hipY-8,hw*1.9,20),'#f2c14e',3.5);tkInk(c,cc=>tkEll(cc,0,hipY+2,14,14),'#d6334a',3);
  tkInk(c,cc=>{cc.moveTo(-hw*1.3,-24);cc.quadraticCurveTo(0,-14,hw*1.3,-24);cc.lineTo(hw*1.32,-36);cc.quadraticCurveTo(0,-26,-hw*1.32,-36);cc.closePath();},'#f2c14e',3);},
 face:(c,r)=>tkInk(c,cc=>{cc.moveTo(-r*.95,r*.05);cc.quadraticCurveTo(-r*1.05,r*1.2,0,r*1.45);cc.quadraticCurveTo(r*1.05,r*1.2,r*.95,r*.05);cc.quadraticCurveTo(r*.6,r*.5,0,r*.48);cc.quadraticCurveTo(-r*.6,r*.5,-r*.95,r*.05);cc.closePath();},'#7a4a26',4),
 hair:(c,r,P,back)=>{tkHairShort('#7a4a26')(c,r,P,back);},
 hat:(c,r,P)=>{const s=Kclamp(P.crown||0);c.save();c.translate(r*.12*s,r*.62*s);c.rotate(.28*s);
  tkInk(c,cc=>{cc.moveTo(-r*.78,-r*.72);cc.lineTo(-r*.86,-r*1.32);cc.lineTo(-r*.48,-r*1.06);cc.lineTo(-r*.2,-r*1.45);cc.lineTo(0,-r*1.1);cc.lineTo(r*.2,-r*1.45);cc.lineTo(r*.48,-r*1.06);cc.lineTo(r*.86,-r*1.32);cc.lineTo(r*.78,-r*.72);cc.closePath();},'#f2c14e',4);
  for(const [x,col] of [[-r*.45,'#d6334a'],[0,'#3fb0b0'],[r*.45,'#d6334a']])tkInk(c,cc=>tkEll(cc,x,-r*.88,r*.09,r*.09),col,2.5);c.restore();}});
function tkGiant(c,P){tkAt(c,P,cc=>tkPerson(cc,TK_GIANT,P));}

// The big-headed figure (capgròs): a huge papier-mâché head with a red barretina on a small body in a green jacket and a red sash.
const TK_CAP=Object.freeze({skin:'#f2c39a',shirt:'#3a9a72',pants:'#f3e7cc',shoes:'#4a4458',legH:78,bodyH:88,bodyW:104,hipW:22,legW:20,armW:20,l1:46,l2:42,headR:86,handR:12,neck:6,
 dress:(c,F,P,hipY,shY)=>{tkInk(c,cc=>{cc.moveTo(-F.bodyW*.46,hipY-26);cc.lineTo(F.bodyW*.46,hipY-26);cc.lineTo(F.bodyW*.46,hipY-8);cc.lineTo(-F.bodyW*.46,hipY-8);cc.closePath();},'#d0483c',3.5);
  c.fillStyle='#f2c14e';for(const y of [shY+22,shY+46])for(const sg of [-1,1]){c.beginPath();tkEll(c,sg*12,y,4,4);c.fill();}},
 hairBack:(c,r)=>tkInk(c,cc=>{tkEll(cc,-r*.82,r*.2,r*.3,r*.42);tkEll(cc,r*.82,r*.2,r*.3,r*.42);},'#2a2026',4),
 hair:(c,r,P,back)=>{if(back){tkInk(c,cc=>{cc.moveTo(-r*.98,r*.3);cc.quadraticCurveTo(-r*1.1,-r*1.05,0,-r*1.06);cc.quadraticCurveTo(r*1.1,-r*1.05,r*.98,r*.3);cc.quadraticCurveTo(0,r*.75,-r*.98,r*.3);cc.closePath();},'#2a2026',4);}
  else tkInk(c,cc=>{cc.moveTo(-r*.95,-r*.1);cc.quadraticCurveTo(-r*.95,-r*.85,-r*.3,-r*.98);cc.quadraticCurveTo(-r*.2,-r*.62,-r*.62,-r*.12);cc.closePath();cc.moveTo(r*.95,-r*.1);cc.quadraticCurveTo(r*.95,-r*.85,r*.3,-r*.98);cc.quadraticCurveTo(r*.2,-r*.62,r*.62,-r*.12);cc.closePath();},'#2a2026',4);},
 hat:(c,r)=>{tkInk(c,cc=>{cc.moveTo(-r*.82,-r*.6);cc.quadraticCurveTo(-r*.6,-r*1.25,r*.1,-r*1.2);cc.quadraticCurveTo(r*.9,-r*1.15,r*1.25,-r*.62);cc.quadraticCurveTo(r*1.32,-r*.36,r*1.1,-r*.36);cc.quadraticCurveTo(r*.9,-r*.72,r*.6,-r*.8);cc.quadraticCurveTo(0,-r*.9,-r*.82,-r*.6);cc.closePath();},'#d0483c',4);
  tkInk(c,cc=>{cc.moveTo(-r*.86,-r*.62);cc.quadraticCurveTo(0,-r*.96,r*.84,-r*.66);cc.lineTo(r*.8,-r*.52);cc.quadraticCurveTo(0,-r*.82,-r*.84,-r*.48);cc.closePath();},'#3a3346',3);}});
function tkCapHead(c,x,y,s,P){c.save();c.translate(x,y);c.scale(s,s);tkHead(c,0,0,TK_CAP.headR,TK_CAP,P);c.restore();}
function tkBighead(c,P){tkAt(c,P,cc=>tkPerson(cc,TK_CAP,P));}

// The band: four musicians in blue with red caps (trumpet, clarinet, flute, tuba), each with a skin of their own.
const TK_MUS=Object.freeze([['#f2c7a0','#7a4a26'],['#7a4a2c','#2a2026'],['#d9a066','#2a2026'],['#a8683e','#5a3a22']].map(([skin,hair],i)=>Object.freeze({skin,shirt:'#2e56a8',pants:'#f2efe6',shoes:'#4a4458',legH:70,bodyH:76,bodyW:i===3?100:80,hipW:i===3?20:16,legW:18,armW:18,l1:38,l2:34,headR:34,handR:11,neck:4,
 hair:i===1?tkHairCurly(hair):tkHairShort(hair),
 dress:(c,F)=>{c.fillStyle='#f2c14e';for(let k=0;k<3;k++){c.beginPath();tkEll(c,0,-F.legH-F.bodyH+20+k*20,4,4);c.fill();}tkInk(c,cc=>{cc.rect(-F.bodyW/2-4,-F.legH-F.bodyH-2,20,8);cc.rect(F.bodyW/2-16,-F.legH-F.bodyH-2,20,8);},'#f2c14e',2.5);},
 hat:(c,r)=>{tkInk(c,cc=>{cc.moveTo(-r*.78,-r*.55);cc.lineTo(-r*.7,-r*1.2);cc.lineTo(r*.7,-r*1.2);cc.lineTo(r*.78,-r*.55);cc.closePath();},'#c8463a',3.5);tkInk(c,cc=>{cc.moveTo(-r*.82,-r*.55);cc.quadraticCurveTo(0,-r*.3,r*.82,-r*.55);cc.quadraticCurveTo(0,-r*.42,-r*.82,-r*.55);cc.closePath();},'#3a3346',3);tkInk(c,cc=>tkEll(cc,0,-r*.86,r*.12,r*.12),'#f2c14e',2.5);}})));
// The instruments. play: 0 to 1, how far the instrument is raised to play.
function tkInstrument(c,i,hands,shY,P){const [L,R]=hands,hy=shY-34-4*(P.play||0);
 if(i===0){c.save();c.translate(10,hy+8);c.rotate(-.12-.18*(P.play||0));tkLimb(c,[[0,0],[60,0]],7,'#f2c14e');tkInk(c,cc=>{cc.moveTo(54,-6);cc.lineTo(84,-18);cc.lineTo(84,18);cc.lineTo(54,6);cc.closePath();},'#f2c14e',3.5);tkInk(c,cc=>cc.rect(22,-12,24,9),'#f2c14e',2.5);c.restore();}
 else if(i===1){c.save();c.translate(0,hy+12);c.rotate(.2*(P.play||0)*0);tkLimb(c,[[0,0],[0,74]],9,'#4a3a3e');tkInk(c,cc=>{cc.moveTo(-8,70);cc.lineTo(8,70);cc.lineTo(14,90);cc.lineTo(-14,90);cc.closePath();},'#4a3a3e',3.5);c.fillStyle='#c9c3d0';for(let k=0;k<4;k++){c.beginPath();tkEll(c,0,18+k*13,3,3);c.fill();}c.restore();}
 else if(i===2){c.save();c.translate(-20,hy+4);c.rotate(-.06);tkLimb(c,[[0,0],[96,0]],7,'#d8dde4');c.fillStyle=TK_INK;for(let k=0;k<5;k++){c.beginPath();tkEll(c,30+k*12,0,2,2);c.fill();}c.restore();}
 else{const cx=0,cy=shY+68;tkInk(c,cc=>{tkEll(cc,cx,cy,38,34);},'#f2c14e',4);tkInk(c,cc=>tkEll(cc,cx,cy,20,17),'#d9a83a',3);
  tkLimb(c,[[cx-24,cy-22],[-52,shY-10],[-76,shY-60]],22,'#f2c14e');tkInk(c,cc=>{cc.moveTo(-124,shY-80);cc.quadraticCurveTo(-82,shY-48,-40,shY-80);cc.quadraticCurveTo(-82,shY-104,-124,shY-80);cc.closePath();},'#f2c14e',4);
  tkInk(c,cc=>tkEll(cc,-82,shY-80,36,10),'#8a6a24',3);tkLimb(c,[[cx+8,cy-30],[8,shY-20],[2,shY-34]],5,'#d9a83a');}}
// The arms of each musician while playing (the clarinet and the tuba are held in front; the trumpet and the flute to one side).
const TK_MUS_ARMS=Object.freeze([[[.5,-1.9],[.7,-2.0]],[[-.15,-.9],[-.15,-.6]],[[.25,-1.9],[1.0,-2.3]],[[.15,-.9],[.15,-.9]]]);
function tkMusician(c,i,P){const F=TK_MUS[i],play=P.play||0;
 tkAt(c,P,cc=>tkPerson(cc,F,{...P,arms:P.arms||TK_MUS_ARMS[i],hold:(c2,hands,shY)=>tkInstrument(c2,i,hands,shY,P),mood:P.mood||(play>0&&i!==3?'o':'smile')}));}
// The four together: P.m, the pose of each.
function tkBand(c,P){const s=P.s||1;for(let i=0;i<4;i++){const m=P.m?.[i]||{};tkMusician(c,i,{...P,...m,x:(P.x||0)+(m.dx||0)*s,y:(P.y||0)+(m.dy||0),s:s*(m.s||1),m:undefined});}}

// The snowman: two balls of snow, a hat, a scarf, stick arms. P.melt: 0 to 1 (a puddle with the hat on it); P.sweat; P.shiver.
function tkSnowman(c,P){tkAt(c,{...P,tilt:0,sx:1,sy:1},cc=>{const m=Kclamp(P.melt||0),puff=P.puff||1,sh=P.shiver?Math.sin((P.time||0)*46)*2.2*P.shiver:0;
 if(m>0)tkInk(cc,c2=>tkEll(c2,0,-2,44+110*m,8+10*m),'#c5e6f4',3);
 cc.save();cc.translate(sh,0);if(P.tilt)cc.rotate(P.tilt);
 const r1=64,r2=44,b1y=-r1*(1-m*.86),b1rx=r1*(1+m*.75)*puff,b1ry=r1*(1-m*.84),b2y=b1y-b1ry-r2*(1-m*.55)*.92+8,b2rx=r2*(1+m*.3),b2ry=r2*(1-m*.4);
 const arm=(sg,a)=>{const x0=sg*b1rx*.7,y0=b1y-b1ry*.55,x1=x0+sg*Math.sin(a)*70,y1=y0+Math.cos(a)*70*(1-m*.7);tkLimb(cc,[[x0,y0],[x1,y1]],6,'#7a4a26');tkLimb(cc,[[x1,y1],[x1+sg*14,y1-12]],4,'#7a4a26');tkLimb(cc,[[x1,y1],[x1+sg*16,y1+4]],4,'#7a4a26');};
 const arms=P.arms||[[1.9],[1.9]];arm(-1,arms[0][0]);arm(1,arms[1][0]);
 tkInk(cc,c2=>tkEll(c2,0,b1y,b1rx,b1ry),'#f8fbff',4);cc.fillStyle='rgba(120,160,210,.22)';cc.beginPath();tkEll(cc,b1rx*.3,b1y+b1ry*.2,b1rx*.6,b1ry*.7);cc.fill();
 if(m<.6){cc.fillStyle=TK_INK;for(let k=0;k<3;k++){cc.beginPath();tkEll(cc,0,b1y-b1ry*.5+k*b1ry*.38,5,5);cc.fill();}}
 tkInk(cc,c2=>tkEll(c2,0,b2y,b2rx,b2ry),'#f8fbff',4);
 const ny=b2y+b2ry*.85;tkInk(cc,c2=>{c2.moveTo(-b2rx*.85,ny-8);c2.quadraticCurveTo(0,ny+10,b2rx*.85,ny-8);c2.lineTo(b2rx*.8,ny+6);c2.quadraticCurveTo(0,ny+24,-b2rx*.8,ny+6);c2.closePath();},'#d04a3a',3.5);
 tkInk(cc,c2=>{c2.moveTo(b2rx*.3,ny+6);c2.lineTo(b2rx*.62,ny+48*(1-m*.6));c2.lineTo(b2rx*.32,ny+50*(1-m*.6));c2.lineTo(b2rx*.08,ny+10);c2.closePath();},'#d04a3a',3.5);
 cc.strokeStyle='#f3e6cf';cc.lineWidth=4;cc.beginPath();cc.moveTo(b2rx*.42,ny+26*(1-m*.6));cc.lineTo(b2rx*.2,ny+28*(1-m*.6));cc.stroke();
 const mood=P.mood||'smile',look=Kclamp(P.look||0,-1,1)*6,ey=b2y-b2ry*.2;
 for(const sg of [-1,1]){if(P.blink||mood==='proud'||mood==='happy')tkLine(cc,[[sg*16+look-7,ey+2],[sg*16+look,ey-5],[sg*16+look+7,ey+2]],4);else if(mood==='strain')tkLine(cc,[[sg*16+look-sg*7,ey-6],[sg*16+look+sg*5,ey],[sg*16+look-sg*7,ey+6]],4);
  else{cc.fillStyle=TK_INK;cc.beginPath();tkEll(cc,sg*16+look,ey,mood==='o'||mood==='worry'?8:6.5,mood==='o'||mood==='worry'?9:7.5);cc.fill();cc.fillStyle='#ffffff';cc.beginPath();tkEll(cc,sg*16+look-2,ey-3,2,2);cc.fill();}}
 if(mood==='worry'||mood==='o'){tkLine(cc,[[-26+look,ey-16],[-8+look,ey-12]],4);tkLine(cc,[[26+look,ey-16],[8+look,ey-12]],4);}
 const my=b2y+b2ry*.45;cc.fillStyle=TK_INK;
 if(mood==='o')tkInk(cc,c2=>tkEll(c2,look,my+2,7,8),'#4a3a3e',3);
 else if(mood==='strain'){for(let k=0;k<5;k++){cc.beginPath();tkEll(cc,look-16+k*8,my+(k%2?3:-3),3,3);cc.fill();}}
 else for(let k=0;k<5;k++){const u=(k-2)/2;cc.beginPath();tkEll(cc,look+u*16,my+(mood==='worry'?-(1-u*u)*6:(1-u*u)*7),3.2,3.2);cc.fill();}
 tkInk(cc,c2=>{c2.moveTo(look,b2y);c2.lineTo(look+46,b2y+8);c2.lineTo(look,b2y+12);c2.closePath();},'#f08a2a',3);
 const hy=b2y-b2ry*.78;cc.save();cc.translate(0,hy);cc.rotate(-.08+(P.hatTilt||0));tkInk(cc,c2=>{tkRR(c2,-44,-6,88,12,5);},'#4a4458',3.5);tkInk(cc,c2=>tkRR(c2,-28,-58,56,56,4),'#4a4458',3.5);tkInk(cc,c2=>c2.rect(-28,-18,56,10),'#d04a3a',2.5);cc.restore();
 if(P.sweat>0){cc.save();cc.globalAlpha*=Kclamp(P.sweat);const tt=P.time||0;for(let k=0;k<3;k++){const u=((tt*1.4+k/3)%1),sg=k%2?1:-1,x=sg*(b2rx+6+u*36),y=b2y-b2ry*.5-Math.sin(u*Math.PI)*28+u*30;
   tkInk(cc,c2=>{c2.moveTo(x,y-10);c2.quadraticCurveTo(x+7,y,x,y+6);c2.quadraticCurveTo(x-7,y,x,y-10);c2.closePath();},'#8fd0f0',2.5);}cc.restore();}
 cc.restore();},true);}

// The astronaut: a white suit with orange, a backpack, a glass helmet with the face inside.
const TK_ASTRO=Object.freeze({skin:'#7a4a2c',shirt:'#f1efe8',pants:'#f1efe8',shoes:'#9aa3ad',glove:'#f08a3a',legH:78,bodyH:90,bodyW:112,hipW:26,legW:30,armW:28,l1:44,l2:40,headR:34,handR:15,neck:10,shoeW:22,
 behind:(c,F,P,hipY,shY)=>tkInk(c,cc=>tkRR(cc,-F.bodyW*.62,shY-6,F.bodyW*1.24,F.bodyH*.86,14),'#b9c0c8',4),
 dress:(c,F,P,hipY,shY)=>{tkInk(c,cc=>tkRR(cc,-26,shY+22,52,34,6),'#9aa3ad',3);for(const [x,col] of [[-12,'#f08a3a'],[0,'#3fb0b0'],[12,'#f2c14e']])tkInk(c,cc=>tkEll(cc,x,shY+39,4.5,4.5),col,2);
  tkInk(c,cc=>cc.rect(-F.bodyW*.46,hipY-14,F.bodyW*.92,10),'#f08a3a',3);},
 hair:tkHairCurly('#2a2026'),
 hat:(c,r)=>{c.fillStyle='rgba(190,225,250,.28)';c.beginPath();tkEll(c,0,r*.1,r*1.68,r*1.62);c.fill();c.strokeStyle=TK_INK;c.lineWidth=4;c.stroke();
  c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=6;c.beginPath();c.arc(0,r*.1,r*1.4,Math.PI*1.12,Math.PI*1.4);c.stroke();tkInk(c,cc=>tkRR(cc,-r*1.2,r*1.48,r*2.4,r*.36,8),'#f08a3a',3.5);}});
function tkAstronaut(c,P){tkAt(c,{...P,pivot:150},cc=>tkPerson(cc,TK_ASTRO,P));}

// The cook: a white jacket, a red neckerchief, checked trousers, a tall hat, a moustache; the cake on a plate (P.tiers, P.bend,
// P.wob; P.cream: the cream on his nose).
const TK_COOK=Object.freeze({skin:'#f3cfb0',shirt:'#fbf7ef',pants:'#dcd6e6',shoes:'#4a4458',legH:76,bodyH:96,bodyW:122,hipW:24,legW:24,armW:24,l1:42,l2:38,headR:40,handR:14,neck:2,waist:1.05,
 dress:(c,F,P,hipY,shY)=>{c.fillStyle=TK_INK;for(let k=0;k<3;k++)for(const sg of [-1,1]){c.beginPath();tkEll(c,sg*16,shY+26+k*22,3.5,3.5);c.fill();}
  tkInk(c,cc=>{cc.moveTo(-24,shY);cc.lineTo(24,shY);cc.lineTo(0,shY+22);cc.closePath();},'#d04a3a',3);},
 face:(c,r)=>{for(const sg of [-1,1])tkInk(c,cc=>{cc.moveTo(0,r*.3);cc.quadraticCurveTo(sg*r*.3,r*.2,sg*r*.52,r*.38);cc.quadraticCurveTo(sg*r*.3,r*.46,0,r*.4);cc.closePath();},'#6b4a34',3);},
 hair:tkHairShort('#6b4a34'),
 hat:(c,r)=>tkInk(c,cc=>{cc.moveTo(-r*.8,-r*.6);cc.lineTo(-r*.74,-r*1.2);cc.quadraticCurveTo(-r*1.12,-r*1.5,-r*.7,-r*1.82);cc.quadraticCurveTo(-r*.3,-r*2.1,0,-r*1.86);cc.quadraticCurveTo(r*.3,-r*2.1,r*.7,-r*1.82);cc.quadraticCurveTo(r*1.12,-r*1.5,r*.74,-r*1.2);cc.lineTo(r*.8,-r*.6);cc.closePath();},'#ffffff',4)});
const TK_TIERS=Object.freeze(['#f4a6b8','#8a5a3a','#b8d88a','#f6df7a','#f4a6b8']);
function tkCake(c,x,y,P){const n=Kclamp(P.tiers??1,0,5),bend=P.bend||0,wob=P.wob||0;
 tkInk(c,cc=>tkEll(cc,x,y,64,11),'#ffffff',3.5);c.strokeStyle='#5a8fdc';c.lineWidth=2.5;c.beginPath();tkEll(c,x,y,52,7);c.stroke();
 let cy=y-4,cx=x;const full=Math.floor(n),part=n-full;
 for(let i=0;i<Math.ceil(n);i++){const grow=i<full?1:KeaseBack(part),w=(100-i*14)*grow,h=30*grow,off=Math.sin(wob)*i*3.2-bend*i*i*5.5;cx=x+off;const tilt=-bend*i*.07;
  c.save();c.translate(cx,cy);c.rotate(tilt);tkInk(c,cc=>tkRR(cc,-w/2,-h,w,h,5),TK_TIERS[i],3.5);
  tkInk(c,cc=>{cc.moveTo(-w/2,-h);cc.lineTo(w/2,-h);cc.lineTo(w/2,-h+7);for(let k=4;k>=0;k--){const xx=-w/2+w*k/4;cc.quadraticCurveTo(xx+w/16,-h+(k%2?16:9),xx,-h+7);}cc.closePath();},'#fff6e8',3);c.restore();
  cy-=h*Math.cos(tilt);}
 if(n>=1&&!P.splatted)tkInk(c,cc=>tkEll(cc,cx,cy-8,8,8),'#d6334a',3);
 return [cx,cy];}
function tkCook(c,P){tkAt(c,P,cc=>tkPerson(cc,TK_COOK,{...P,arms:P.arms||[[.45,-.7],[1.6,1.4]],
 over:(c2,hx,hy,hands)=>{if(!P.noCake){const R=hands[1];tkCake(c2,R[0]-4,R[1]-8,P);}if(P.cream>0){const r=TK_COOK.headR,s=Kclamp(P.cream);tkInk(c2,c3=>{tkEll(c3,hx,hy+r*.12,r*.42*s,r*.3*s);tkEll(c3,hx-r*.3*s,hy+r*.26,r*.16*s,r*.13*s);tkEll(c3,hx+r*.32*s,hy+r*.02,r*.14*s,r*.12*s);},'#fff6e8',3);
  if(P.cherry)tkInk(c2,c3=>tkEll(c3,hx+r*.36,hy-r*1.92,8,8),'#d6334a',3);}}}));}

// The dancer: a turquoise leotard, a pink tutu, her hair in a bun with a yellow flower. P.turn: the flip of a pirouette.
const TK_DANCER=Object.freeze({skin:'#a8683e',shirt:'#35a7a2',pants:'#e7c2ae',shoes:'#f29ab8',legH:104,bodyH:66,bodyW:66,hipW:13,legW:14,armW:13,l1:40,l2:36,headR:34,handR:10,neck:8,waist:.72,shoeW:13,
 dress:(c,F,P,hipY)=>tkInk(c,cc=>{cc.moveTo(-64,hipY+4);for(let k=0;k<=8;k++){const x=-64+k*16;cc.quadraticCurveTo(x-8,hipY+(k%2?22:14),x,hipY+4+(k%2?6:0));}cc.quadraticCurveTo(0,hipY-22,-64,hipY+4);cc.closePath();},'#f7b6d2',3.5),
 hair:(c,r,P,back)=>{tkInk(c,cc=>tkEll(cc,0,-r*1.08,r*.42,r*.36),'#2a2026',4);tkHairShort('#2a2026')(c,r,P,back);tkInk(c,cc=>{for(let k=0;k<5;k++){const an=k*TK_TAU/5;tkEll(cc,r*.42+Math.cos(an)*7,-r*1.02+Math.sin(an)*7,5,5);}},'#f2c14e',2.5);}});
function tkDancer(c,P){tkAt(c,P,cc=>tkPerson(cc,TK_DANCER,{...P,shirt:undefined}));}

// ── Effects ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
function tkPuff(c,x,y,age,size=1){if(age<0||age>.7)return;const u=KeaseOut(age/.7),r=20*size*(.6+.6*u);c.save();c.globalAlpha*=.9*(1-Ksmooth((age-.25)/.45));
 c.beginPath();for(let k=0;k<7;k++){const f=(k-3)/3;tkEll(c,x+f*size*(30+60*u),y-10-(1-f*f)*14*size,r*(1-.35*Math.abs(f)),r*.8*(1-.35*Math.abs(f)));}c.strokeStyle=TK_INK;c.lineWidth=5;c.stroke();c.fillStyle='#f1e7d4';c.fill();c.restore();}
function tkSpeed(c,x,y,age,dir=1){if(age<0||age>.4)return;c.save();c.globalAlpha*=1-age/.4;for(let k=0;k<4;k++){const yy=y-60+k*40;tkLine(c,[[x-dir*30,yy],[x-dir*(80+k*12),yy+6]],4,TK_MARK);}c.restore();}
function tkSpark(c,x,y,r,a=1){if(a<=0||r<=0)return;c.save();c.globalAlpha*=a;tkInk(c,cc=>{cc.moveTo(x,y-r);cc.quadraticCurveTo(x,y,x+r,y);cc.quadraticCurveTo(x,y,x,y+r);cc.quadraticCurveTo(x,y,x-r,y);cc.quadraticCurveTo(x,y,x,y-r);cc.closePath();},'#fff2a8',2.5);c.restore();}
function tkNote(c,x,y,a){if(a<=0)return;c.save();c.globalAlpha*=a;c.fillStyle=TK_MARK;c.beginPath();tkEll(c,x,y,8,6,-.4);c.fill();tkLine(c,[[x+7,y-2],[x+7,y-32],[x+18,y-24]],3.5,TK_MARK);c.restore();}
function tkStars(c,x,y,time,a){if(a<=0)return;c.save();c.globalAlpha*=a;for(let k=0;k<3;k++){const an=time*1.3+k*TK_TAU/3;tkSpark(c,x+Math.cos(an)*52,y+Math.sin(an)*14,11,1);}c.restore();}
function tkHeat(c,x,y,age,a){if(a<=0)return;c.save();c.globalAlpha*=a;c.strokeStyle='rgba(240,140,60,.85)';c.lineWidth=4;c.lineCap='round';
 for(let k=0;k<3;k++){const u=((age*.7+k/3)%1),yy=y-u*120,xx=x+(k-1)*50;c.globalAlpha=a*Math.sin(u*Math.PI);c.beginPath();c.moveTo(xx,yy);c.bezierCurveTo(xx+12,yy-14,xx-12,yy-26,xx,yy-40);c.stroke();}c.restore();}

// ── The visits ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// Coming out of the door: z goes from 0 (in the doorway) to 1 (in the street, in front of the door).
const tkOut=z=>({y:TK_DB+2+(TK_GY-TK_DB-2)*z,s:.9+.1*z});
// Where each visitor ends their gag, before walking to their place.
const TK_BAND_X=Object.freeze([-178,-92,92,176]);
const TK_END=Object.freeze({giant:[0,TK_GY],bighead:[0,TK_GY],band:[0,TK_GY],snowman:[24,TK_GY],astronaut:[0,TK_GY],cook:[0,TK_GY],dancer:[30,TK_GY]});
// The door during a visit (shake: the picture jolts; bulge: the frame bows), and the gag of each visitor, drawn in two passes: 'in'
// (in the doorway, behind the frame and cut by it) and 'out' (in the street).
const TK_DOORFX=Object.freeze({
 giant:t=>{const T=TC_T.giant;let shake=0;for(const s of [T.foot,T.stomp,T.stomp2])shake+=6*tkHit(t,s,9);const sq=Ksmooth((t-T.squeeze)/.2)*(1-Ksmooth((t-T.pop+.05)/.08));
  return {shake,bulge:sq*(8+2*Math.sin((t-T.squeeze)*13))+(t>=T.pop?9*Math.exp(-(t-T.pop)*7)*Math.cos((t-T.pop)*26):0)};},
 bighead:t=>{const T=TC_T.bighead;let b=0;for(const s of [T.tug,T.tug+.4,T.tug+.8])b+=4*tkHit(t,s,7);return {shake:0,bulge:t<T.pop?b+(t>T.stuck?1.5:0):5*Math.exp(-(t-T.pop)*7)*Math.cos((t-T.pop)*26)};},
 band:t=>{const T=TC_T.band;return {shake:0,bulge:3*tkHit(t,T.stuck,8)+3*tkHit(t,T.stuck+.35,8)};}});
const TK_GAG=Object.freeze({
 giant(c,t,pass){const T=TC_T.giant,slams=[T.foot,T.stomp,T.stomp2];
  if(t<T.squeeze-.05){if(pass==='in')tkGiant(c,{x:0,y:TK_DB+4,s:.9,mood:'smile',arms:[[.35,.3],[.35,.3]]});
   if(pass==='out'&&t>T.foot-.12){const outU=KeaseOut((t-(T.foot-.12))/.12),back=Ksmooth((t-T.squeeze+.4)/.3);let lift=0;
    for(let i=0;i<2;i++){const a=slams[i]+.12,b=slams[i+1];if(t>a&&t<b)lift=58*Math.sin(Math.PI*(t-a)/(b-a))**.7;}
    const x=-6,y=TK_DB+2+46*outU*(1-back)-lift,s=1+.12*outU*(1-back),tip=-.12*lift/58;tkLimb(c,[[-14,TK_DB-120],[x-6*s,y-58*s]],46*s,'#2f6db5');
    c.save();c.translate(x,y);c.rotate(tip);c.scale(s,s);tkInk(c,cc=>{cc.moveTo(-34,0);cc.lineTo(92,0);cc.quadraticCurveTo(112,-2,108,-22);cc.quadraticCurveTo(100,-46,52,-50);cc.lineTo(26,-66);cc.lineTo(-30,-66);cc.quadraticCurveTo(-40,-34,-34,0);cc.closePath();},'#7a4a26',4.5);
    tkInk(c,cc=>{cc.moveTo(-36,0);cc.lineTo(96,0);cc.quadraticCurveTo(104,4,96,10);cc.lineTo(-34,10);cc.closePath();},'#4a2e1c',3.5);c.fillStyle='rgba(255,255,255,.35)';c.beginPath();tkEll(c,70,-30,16,6,-.4);c.fill();
    tkInk(c,cc=>{cc.moveTo(-40,-60);cc.lineTo(36,-60);cc.lineTo(40,-76);cc.lineTo(-44,-76);cc.closePath();},'#f2c14e',3.5);c.restore();
    for(const s0 of slams)tkPuff(c,x+40,y+14,t-s0,1.3);}}
  else if(t<T.pop){if(pass==='out'){const w=t-T.squeeze,wr=Math.sin(w*13)*Kclamp(w*4);c.save();c.beginPath();c.rect(-125,TK_DT,250,500);c.clip();
   tkGiant(c,{x:wr*5,y:TK_DB+10,s:1,sx:.56+.03*wr,sy:.63,mood:'strain',arms:[[1.5,-.4],[1.5,-.4]]});c.restore();}}
  else if(pass==='out'){const p=t-T.pop,y=TK_DB+10+(TK_GY-TK_DB-10)*KeaseOut(p/.15),sx=tkSpring(p,.56,7,20),rise=KeaseBack((t-T.rise)/1),sy=.63+.37*rise;
   const up=Ksmooth((t-T.tall)/.15)*(1-Ksmooth((t-T.bow)/.15)),bow=Ksmooth((t-T.bow)/.3)*(1-Ksmooth((t-T.up)/.3)),crown=Ksmooth((t-T.bow-.15)/.25)*(1-Ksmooth((t-T.up-.05)/.3)),fix=Kbump(t,T.up+.15,.2);
   tkGiant(c,{x:0,y,s:1,sx,sy,mood:p<.6?'o':bow>.3?'happy':up>.3?'grin':'smile',bow,crown,arms:[[.3+2.3*up+.3*bow,.3-.1*up],[.3+2.3*up+.3*bow+2.4*fix,.3-.1*up+.6*fix]]});
   tkSpeed(c,0,560,p,1);tkSpeed(c,0,560,p,-1);tkPuff(c,0,TK_GY-10,p,1.4);}},
 bighead(c,t,pass){const T=TC_T.bighead,F=TK_CAP;let j=0;for(const s of [T.tug,T.tug+.4,T.tug+.8])j+=tkHit(t,s,7);
  const z=Ksmooth((t-.4)/.75),bs=.92+.08*z,stuck=t>=T.stuck&&t<T.pop,hop=Math.sin(Math.PI*Kclamp((t-T.hop)/.38))*36,back=Ksmooth((t-T.hop)/.38),by=TK_DB+2+(TK_END.bighead[1]+40-TK_DB-2)*z-40*back+6*j-hop;
  const step=t<T.stuck?t*11:t<T.tug?t*17:null,shY=by-bs*(F.legH+F.bodyH*(1-.22*0))*(1-.1*j),neckTop=shY-bs*F.neck;
  // the head: stuck in the doorway until it pops out, then on the body backwards, and turning round
  const inY=TK_DB+2-.92*(F.legH+F.bodyH+F.neck)-.92*F.headR*.92;
  const mood=t<T.stuck?'smile':t<T.tug?'o':t<T.pop?'strain':t<T.set?'o':t<T.hop?'smile':'grin';
  if(t<T.pop){if(pass==='in'){if(t>.45){const w=Math.sin(t*9)*6*j;tkLimb(c,[[0,neckTop+10],[w,(neckTop+inY)/2+20],[0,inY+F.headR*.8]],20,F.skin);}tkCapHead(c,Math.sin(t*15)*2*(stuck?1:0),inY,.92,{mood,hsx:1.06+.06*j,hsy:1+.08*j,look:0});}
   if(pass==='out')tkBighead(c,{x:0,y:by,s:bs,step,stride:stuck?.6:1,squat:.3*j,mood,noHead:true,arms:stuck&&t>=T.tug-.2?[[-.5+.3*j,-1.5],[-.5+.3*j,-1.5]]:[[.2,.25],[.2,.25]]});}
  else if(pass==='out'){const p=Kclamp((t-T.pop)/.25),headY=shY-bs*(F.neck+F.headR*.92),hy=inY+(headY-inY)*p-70*Math.sin(Math.PI*p),turn=p<1?Math.cos(Math.PI*p):Math.cos(Math.PI*(1-Ksmooth((t-T.pop-.3)/.65))),boing=t>=T.set?.16*Math.exp(-(t-T.set)*7)*Math.cos((t-T.set)*28):0;
   tkBighead(c,{x:0,y:by,s:bs,mood,noHead:true});if(p<1)tkLimb(c,[[0,shY],[0,hy+F.headR*.6*bs]],20*bs,F.skin);
   tkCapHead(c,0,hy,bs,{mood,turn:Math.abs(turn)<.08?(turn<0?-.08:.08):turn,hsy:1+boing,hsx:1-boing*.6});
   tkPuff(c,0,inY+40,t-T.pop,1.1);}},
 band(c,t,pass){const T=TC_T.band,ms=[T.m1,T.m2,T.m3,T.m4],playing=Ksmooth((t-T.play)/.15),beat=Math.abs(Math.sin(Math.PI*(t-T.play)/.54))*playing;
  for(let i=0;i<4;i++){let z,x,sx=1,mv=false;const u=t-ms[i];if(u<-.1)continue;
   if(i<3){z=Ksmooth(u/.35);x=TK_BAND_X[i]*Ksmooth((u-.2)/.5);mv=u<.7;}
   else{const bump=-.12*tkHit(t,T.stuck,9)*(t>=T.stuck?1:0)-.12*tkHit(t,T.stuck+.35,9);z=t<T.through-.25?Math.min(.42,Ksmooth(u/.4)*.42)+bump:.42+.58*Ksmooth((t-T.through+.25)/.4);
    sx=1-.58*Ksmooth((t-T.turn)/.3)*(1-Ksmooth((t-T.through-.05)/.25));x=TK_BAND_X[3]*Ksmooth((t-T.through-.05)/.4);mv=t<T.play;}
   if((pass==='in')!==(z<.5))continue;const o=tkOut(z),play=i<3?Ksmooth((t-T.play)/.2):playing;
   tkMusician(c,i,{x,y:o.y-6*beat*(i%2?1:.6),s:o.s,sx,step:mv?t*10:null,play,look:Kclamp(-x/150,-1,1),mood:i===3&&t>=T.stuck&&t<T.through?'worry':undefined});}
  if(pass==='out'&&t>T.play)for(let k=0;k<6;k++){const age=(t-T.play-k*.36);if(age<0)continue;const u=(age%2.2)/2.2,i=k%4;tkNote(c,TK_BAND_X[i]+(i===3?-60:i===2?80:i===0?90:0)+Math.sin(age*3)*10,520-u*170-(i===3?40:0),Math.sin(Math.PI*u)*.9);}},
 snowman(c,t,pass){const T=TC_T.snowman,z=Ksmooth((t-.45)/1.05),o=tkOut(z),x=TK_END.snowman[0]*z;if((pass==='in')!==(z<.5))return;
  const warm=Ksmooth((t-T.warm)/.3),melt=Ksmooth((t-T.melt)/(T.puddle-T.melt))*.9*(1-Ksmooth((t-T.freeze)/.4)),re=t>T.freeze+.3?tkSpring(t-T.freeze-.3,.9,6,18):1,proud=Ksmooth((t-T.proud)/.25);
  const mood=t<T.warm?'smile':t<T.melt?'worry':t<T.shiver?'o':t<T.freeze?'strain':t<T.proud?'o':'proud';
  tkSnowman(c,{x,y:o.y,s:o.s,melt,sweat:warm*(1-Ksmooth((t-T.puddle)/.3)),shiver:t>=T.shiver&&t<T.freeze?1:0,time:t,mood,look:t>T.warm&&t<T.melt?-1:0,puff:(1+.08*proud)*(t>T.freeze+.3?re:1),
   tilt:t<1.6?-.08*Math.sin(Math.PI*z):0,arms:[[1.9-1.2*melt+.9*proud],[1.9-1.2*melt+.9*proud]],hatTilt:-.3*melt});
  if(pass==='out'){tkHeat(c,0,TK_DB-40,t-T.warm,warm*(1-Ksmooth((t-T.puddle)/.4))*.9);
   for(let k=0;k<5;k++){const age=t-T.freeze-k*.07;tkSpark(c,x+Math.cos(k*1.3)*90,o.y-120+Math.sin(k*2.1)*70,14*Math.sin(Math.PI*Kclamp(age/.6)),age>0&&age<.6?1:0);}}},
 astronaut(c,t,pass){const T=TC_T.astronaut,z=Ksmooth((t-.45)/.9),o=tkOut(z);if((pass==='in')!==(z<.5))return;
  const fl=Ksmooth((t-.8)/1.1)*(1-Ksmooth((t-T.land+.3)/.3)),drift=Math.sin((t-.5)*1.1)*40*fl,tilt=(.12*Math.sin(t*1.3)*fl)-1.1*Math.sin(Math.PI*Kclamp((t-T.flip)/(T.land-.1-T.flip))),air=95*fl+Math.sin(t*2)*6*fl;
  const land=t>=T.land?tkSpring(t-T.land,.82,8,20):1,wave=Ksmooth((t-T.wave)/.2)*(1-Ksmooth((t-T.wave-1.1)/.2));
  tkAstronaut(c,{x:drift,y:o.y-air,s:o.s,air,tilt,sy:land,sx:2-land,mood:t<T.flip?'smile':t<T.land?'o':'grin',step:fl>0?t*2.4:null,stride:fl>.1?.6:0,
   arms:[[.9*fl+.25,.4],[.9*fl+.25+2.3*wave,.4+.5*Math.sin(t*9)*wave]],look:Math.sin(t*.8)*fl});
  if(pass==='out')tkPuff(c,0,TK_GY,t-T.land,1.3);},
 cook(c,t,pass){const T=TC_T.cook,z=Ksmooth((t-.45)/.8),o=tkOut(z);if((pass==='in')!==(z<.5))return;
  const tiers=1+4*Kclamp((t-T.grow)/.9),wob=(t-T.wobble)*9,wa=Ksmooth((t-T.wobble)/.15)*(1-Ksmooth((t-T.sag)/.2)),bend=.9*Ksmooth((t-T.sag)/(T.splat-T.sag))*(1-.4*Ksmooth((t-T.lick-.6)/.5)),split=t>=T.splat;
  const fall=Kclamp((t-T.splat+.16)/.16),cream=split?(1-.75*Ksmooth((t-T.lick-.1)/.8))*KeaseBack((t-T.splat)/.15):0;
  tkCook(c,{x:0,y:o.y,s:o.s,step:z<1?t*10:null,tiers:split||fall>0?4:tiers,wob:wa>0?wob:0,bend,cream,cherry:split,splatted:split,mood:t<T.grow?'smile':t<T.sag?'o':t<T.splat?'worry':t<T.lick?'o':'lick',look:t>T.grow&&t<T.sag?.6:0});
  if(pass==='out'&&fall>0&&!split){const x=44-44*fall,y=o.y-330+125*fall*fall;c.save();c.translate(x,y);c.rotate(-.5*fall);tkInk(c,cc=>tkRR(cc,-22,-30,44,30,5),TK_TIERS[4],3.5);tkInk(c,cc=>tkEll(cc,0,-38,8,8),'#d6334a',3);c.restore();}
  if(pass==='out'&&split){const age=t-T.splat;if(age<.5){c.save();c.globalAlpha*=1-age/.5;for(let k=0;k<6;k++){const an=k*TK_TAU/6+.3;tkInk(c,cc=>tkEll(cc,Math.cos(an)*(30+80*age),o.y-215+Math.sin(an)*(24+60*age),7,6),'#fff6e8',2.5);}c.restore();}}},
 dancer(c,t,pass){const T=TC_T.dancer,z=Ksmooth((t-.45)/1.1),o=tkOut(z);if((pass==='in')!==(z<.5))return;
  const spin=3*KeaseOut(Kclamp((t-T.twirl)/(T.dizzy-T.twirl))),turn=t<T.dizzy?Math.cos(TK_TAU*spin):1,dz=t>=T.dizzy&&t<T.up?1:0,sway=dz*.16*Math.sin((t-T.dizzy)*4.2)*(1-Ksmooth((t-T.sit)/.1));
  const sit=Ksmooth((t-T.sit)/.12)*(1-Ksmooth((t-T.up)/.12)),jump=Math.sin(Math.PI*Kclamp((t-T.up-.03)/.42))*44,curt=Kbump(t,T.up+.85,.28);
  const flip=turn<0?-1:1,sx=Math.max(.1,Math.abs(turn));
  tkDancer(c,{x:TK_END.dancer[0]*z,y:o.y-jump,s:o.s,sx,flip:1,tilt:sway,pivot:0,sit,squat:.35*curt,bow:.4*curt,passe:t<T.dizzy&&t>T.twirl,turn:turn<0?-1:1,
   mood:t<T.dizzy?'happy':t<T.sit?'dizzy':t<T.up?'o':'happy',arms:t<T.dizzy?[[2.8,.45],[2.8,.45]]:dz?[[.6+.3*Math.sin(t*5),.8],[.6-.3*Math.sin(t*5),.8]]:[[.9+1.6*Ksmooth((t-T.up)/.2)*(1-curt),.3],[.9+1.6*Ksmooth((t-T.up)/.2)*(1-curt),.3]]});
  if(pass==='out'){tkStars(c,TK_END.dancer[0]*z,o.y-(TK_DANCER.legH+TK_DANCER.bodyH+TK_DANCER.neck+TK_DANCER.headR*2.1)*(1-.72*sit*.6),t,dz*Ksmooth((t-T.dizzy)/.2));tkPuff(c,TK_END.dancer[0],TK_GY,t-T.sit,1.1);}}});
// A turn of the head (back or front) is drawn by the head itself; the dancer's body only flips its width.

// ── The street ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// A visitor at rest, walking (step), at the party (party: the time into it) or bowing; look: towards the door or whoever is busy.
function tkFigure(c,name,P){const party=P.party,ph=party!=null?Math.PI*party/.6:0,bounce=party!=null?Math.abs(Math.sin(ph))*10:0,alt=Math.sin(ph);
 const Q={...P,y:P.y-bounce};
 if(name==='giant')return tkGiant(c,{...Q,mood:P.mood||(party!=null?'grin':'smile'),arms:party!=null?[[2.4+.3*alt,.3],[2.4-.3*alt,.3]]:undefined});
 if(name==='bighead')return tkBighead(c,{...Q,mood:P.mood||(party!=null?'grin':'smile'),arms:party!=null?[[2.5+.35*alt,.3],[2.5-.35*alt,.3]]:undefined});
 if(name==='band'){const s=P.s||1;return tkBand(c,{...P,m:[0,1,2,3].map(i=>({dx:[-105,-35,35,105][i]*(P.spread??1)+(P.bandX?.[i]||0),dy:-(party!=null?Math.abs(Math.sin(ph+i*.8))*8:0),s:.8,play:party!=null?1:0,step:P.step!=null?P.step+i:null}))});}
 if(name==='snowman')return tkSnowman(c,{...Q,mood:P.mood||(party!=null?'happy':'smile'),arms:party!=null?[[2.5+.3*alt],[2.5-.3*alt]]:undefined,tilt:P.step!=null?-.05:0});
 if(name==='astronaut')return tkAstronaut(c,{...Q,mood:P.mood||(party!=null?'grin':'smile'),arms:party!=null?[[.3,.3],[2.6,.4+.5*alt]]:undefined});
 if(name==='cook')return tkCook(c,{...Q,mood:P.mood||(party!=null?'grin':'smile'),tiers:4,bend:.55});
 return tkDancer(c,{...Q,mood:P.mood||(party!=null?'happy':'smile'),passe:party!=null&&alt>0,arms:party!=null?[[2.8,.45],[2.8,.45]]:[[.35,.3],[.35,.3]]});}
// The places in the street: the nearest stays clear of the door; the others share what the screen shows of the street (half: its
// half-width in stage units).
const tkSlot=(k,final,half)=>final?[0,TK_GY+40,1.05]:[(k%2?1:-1)*(240+Math.min(150,Math.max(30,(half-370)/2))*Math.min(2,k>>1)),TK_GY,1];
// A string of little flags across the street for the party.
function tkBunting(c,HW,drop){const cols=['#f2c14e','#3fb0b0','#f7a8c8','#7ab84a','#5a8fdc','#f08a3a'];const y0=250-220*(1-drop);
 c.strokeStyle=TK_INK;c.lineWidth=3;c.beginPath();c.moveTo(-HW,y0);c.quadraticCurveTo(0,y0+80,HW,y0);c.stroke();
 const n=Math.ceil(2*HW/48);for(let i=0;i<n;i++){const u=(i+.5)/n,x=-HW+2*HW*u,y=(1-u)*(1-u)*y0+2*u*(1-u)*(y0+80)+u*u*y0;tkInk(c,cc=>{cc.moveTo(x-16,y);cc.lineTo(x+16,y);cc.lineTo(x,y+30);cc.closePath();},cols[i%cols.length],2.5);}}
function tkConfetti(c,HW,top,age,a,reduced){if(a<=0)return;const cols=['#f2c14e','#3fb0b0','#f7a8c8','#7ab84a','#5a8fdc','#f08a3a'],n=reduced?20:44;c.save();c.globalAlpha*=a;
 for(let i=0;i<n;i++){const sp=55+35*Krand(i,61),y=top+((age*sp+Krand(i,62)*(720-top))%(780-top)),x=(Krand(i,63)*2-1)*HW+Math.sin(age*1.1+i)*14,fl=Math.cos(age*1.5+i*1.7);
  c.save();c.translate(x,y);c.rotate(Krand(i,64)*TK_TAU);c.scale(1,Math.max(.15,Math.abs(fl)));c.fillStyle=cols[i%cols.length];c.fillRect(-6,-4,12,8);c.restore();}c.restore();}

// ── A scene ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
// S: {v (the round), out (who is in the street), visit ({who, slot, final}), vt (seconds into the visit), D, phase, pt (seconds into
// the phase), now, next (who will come out next), reduced}.
function tkScene(c,W,k,decor,S){const r=tcRound(S.v),H=TK_HOUSES[r.house],T=TK_TIMES[r.time],night=r.time===3,t=col=>tkMul(col,T.mul),HW=W/2/k+20,f=W/2/k;
 const visit=S.visit,vt=visit?S.vt:null,name=visit?TC_VISITORS[visit.who]:null,fx=name&&TK_DOORFX[name]?TK_DOORFX[name](vt):{shake:0,bulge:0},jolt=-fx.shake*.8;
 const key=`tk-back|${S.v}|${W.toFixed(1)}${escDecorKey(decor)}`;if(decor.fade>0)escBlit(c,key,W,720,escVeiled(decor,(sc,sw)=>tkBack(sc,sw,S.v,k)),1,jolt);
 c.save();c.translate(W/2,720+jolt);c.scale(k,k);c.translate(0,-720);
 // the door: open (a), knocked on, or the light going as the visitor walks away
 const a=vt==null?0:1.45*KeaseOut(vt/.45)*(1-KeaseInOut((vt-TC_T.door.shut)/(TC_T.door.closed-TC_T.door.shut))),ct=S.phase==='knock'?S.pt%TC_KNOCK_EVERY:-1;
 let dx=0;if(ct>=0)for(const kn of TC_KNOCKS)if(ct>=kn)dx+=3.4*Math.exp(-(ct-kn)*16)*Math.sin((ct-kn)*70);
 if(a>=.02){c.save();c.beginPath();c.rect(-TK_DX,TK_DT,2*TK_DX,TK_DB-TK_DT);c.clip();tkInterior(c);tkLeaf(c,H,t,a,0);if(vt<TC_T.door.walk+.4)TK_GAG[name](c,vt,'in');c.restore();}
 else tkLeaf(c,H,t,0,dx);
 const light=S.phase==='knock'?Ksmooth(S.pt/.3):S.phase==='leave'?1-Ksmooth(S.pt/TC_LEAVING):0;tkUnder(c,light,S.next,S.phase==='leave'?S.pt*40:0);
 tkFrame(c,H,t,fx.bulge);if(ct>=0)tkKnockMarks(c,ct);
 // the light of the hall on the street
 if(a>=.02){const g=c.createLinearGradient(0,TK_DB,0,720);g.addColorStop(0,`rgba(255,207,122,${(night?.42:.22)*Math.min(1,a)})`);g.addColorStop(1,'rgba(255,207,122,0)');c.fillStyle=g;c.beginPath();c.moveTo(-TK_DX,TK_DB+15);c.lineTo(TK_DX,TK_DB+15);c.lineTo(TK_DX+110,720);c.lineTo(-TK_DX-110,720);c.closePath();c.fill();}
 const party=visit?.final&&vt!=null&&vt>=TC_T.final.party?vt-TC_T.final.party:null,bowing=party!=null?Ksmooth((vt-TC_T.final.bow)/.3)*(1-Ksmooth((vt-TC_T.final.end+.2)/.3)):0,inParty=party!=null&&vt<TC_T.final.bow?party:null;
 if(party!=null)tkBunting(c,HW,KeaseOut(party/.7));
 // the visitor of this press, once the gag is over: walking to a place in the street
 const walk=()=>{const W1=TC_T.door.walk,W2=TC_T.door.placed,[sx,sy,ss]=tkSlot(visit.slot,visit.final,f),u=KeaseInOut((vt-W1)/(W2-W1)),[x0,y0]=TK_END[name],x=x0+(sx-x0)*u,y=y0+(sy-y0)*u,s=1+(ss-1)*u,walking=u<1;
  const P={x,y,s,step:walking&&name!=='snowman'?vt*9:null,look:walking?Math.sign(sx-x0)*.8:0,party:inParty,bow:bowing,mood:bowing>.3?'happy':undefined};
  if(name==='band'){P.spread=1;P.bandX=walking?TK_BAND_X.map((bx,i)=>(bx-[-105,-35,35,105][i]*.8)/(.8)*(1-u)):null;}
  tkFigure(c,name,P);};
 const walking=visit&&vt!=null&&vt>=TC_T.door.walk+.02;
 // The giant always stands behind the others, so nobody disappears behind the giant's cloak; the others from the outer places in.
 if(walking&&name==='giant')walk();
 // who is already in the street: they turn to the door when somebody knocks, and to the visitor
 const motion=S.reduced?0:S.now,lookAt=S.phase==='knock'||(vt!=null&&vt<TC_T.door.walk)?0:null,out=S.out||[];
 out.map((who,i)=>i).sort((a,b)=>(out[b]===0)-(out[a]===0)||b-a).forEach(i=>{const [x,y,s]=tkSlot(i,false,f),nm=TC_VISITORS[out[i]],look=lookAt==null?0:Kclamp((lookAt-x)/200,-1,1),blink=!S.reduced&&((S.now+i*1.7)%4.3)<.12;
  tkFigure(c,nm,{x,y:y-(S.reduced?0:Math.abs(Math.sin(motion*1.6+i))*1.5),s,look,blink,party:inParty,bow:bowing,mood:bowing>.3?'happy':undefined,spread:1});});
 // the visitor of this press: the gag, in front of the door
 if(visit&&vt!=null){if(!walking)TK_GAG[name](c,vt,'out');else if(name!=='giant')walk();}
 if(party!=null)tkConfetti(c,HW,720-720/k,party,1-Ksmooth((vt-TC_T.final.end)/.8),S.reduced);
 c.restore();}

// The picture of the home card: the cook's cake sagging, two visitors already in the street.
function tkPreview(o){const g={variant:o.game?.variant??0,tcNow:30,tcPhase:'visit',tcAt:26.6,tcOut:[0,3],tcVisit:{who:5,slot:2,final:false,at:26.6},tcFrom:null,tcAgain:0};return g;}
// The stage scale: as big as on the other stories, but on a portrait screen small enough for the whole street (about 500 stage
// units on each side of the door) to fit.
export function drawToc(c,w,h,o){escFrame();const S=h/720,W=w/S,decor=escDecor(o),k=Math.min(Kclamp(W/1280,.62,1)*TK_ZOOM,W/1000);TK_MARK=!decor.white&&decor.fade<.5?'#ffe6a8':TK_INK;
 const G=o.preview?tkPreview(o):o.game&&o.game.tcNow!==undefined?o.game:tcEnsure({variant:o.game?.variant??0},{});
 const visit=G.tcPhase==='visit'?G.tcVisit:null,vt=visit?(o.preview?3.4:o.t??(G.tcNow-G.tcAt)):null,r=tcRound(G.variant),out=G.tcOut||[];
 c.save();c.scale(S,S);if(decor.fade<1){c.fillStyle=decor.base;c.fillRect(0,0,W,720);}
 tkScene(c,W,k,decor,{v:r.v,out,visit,vt,D:o.duration||(visit?.final?TC_FINAL:TC_VISIT),phase:G.tcPhase,pt:(G.tcNow||0)-(G.tcAt||0),now:G.tcNow||0,next:r.order[out.length%7],reduced:!!o.reduced});
 // a new round: the last house and its people fade away over the new one
 const fr=G.tcFrom,fu=fr?Kclamp(((G.tcNow||0)-fr.at)/TC_FIRST):1;
 if(fr&&fu<1){const old=cc=>{if(decor.fade<1){cc.fillStyle=decor.base;cc.fillRect(0,0,W,720);}tkScene(cc,W,k,decor,{v:fr.variant,out:fr.out,visit:null,vt:null,phase:'wait',pt:0,now:G.tcNow||0,next:0,reduced:true});};
  // drawn whole on a sheet of its own and laid over at once, so that the people do not show through each other as they fade
  const cv=c.canvas&&c.getTransform?tkFadeSheet(c.canvas.width,c.canvas.height):null,oc=cv?.getContext?.('2d');
  if(oc&&oc.setTransform){oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,cv.width,cv.height);oc.setTransform(c.getTransform());old(oc);c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1-Ksmooth(fu);c.drawImage(cv,0,0);c.restore();}
  else{c.save();c.globalAlpha*=1-Ksmooth(fu);old(c);c.restore();}}
 c.restore();}
let TK_FADE=null;
function tkFadeSheet(w,h){if(!TK_FADE||TK_FADE.width!==w||TK_FADE.height!==h){if(TK_FADE)TK_FADE.width=TK_FADE.height=1;TK_FADE=escCanvas(w,h);}return TK_FADE;}
