// El cambrer equilibrista (CE31), 0.23: the picture. A picture book of the 1960s: gouache in flat, slightly uneven shapes, a dark brush
// line, paper grain, a warm limited palette (mustard, tomato, teal, olive, pink and cream). The place and the sky are a sheet of decor;
// the kitchen door, the café table and the chair are always drawn whole, because things fly out of the door and land on the table and
// the chair. The waiter, the tray, the pile and everything that moves are drawn in every frame.
// Stage units: 1280 wide around the middle of the screen and 720 high; the ground is at CW_GY.
import {Kbump,Kclamp,KeaseInOut,Kmix,Krand,Ksmooth} from './kaleido-base.js';
import {escBlit,escCanvas,escDecor,escDecorKey,escFrame,escGrain,escVeiled} from './escenari.js';
import {CB_FALL,CB_FALL_GAP,CB_HEROES,CB_ITEMS,CB_PLACES,CB_SLIPS,CB_T,cbRound,cbStep,cbSway} from './cambrer.js';

const CW_INK='#2a211e',CW_TAU=Math.PI*2,CW_GY=650;
// On a black base with little decor, the darkest fills turn a few tones lighter, so that they do not sink into the black; the line
// stays dark (as in El mag desastrós, 0.21.1).
let CW_LIFT=false;
const CW_LIFTED=Object.freeze({'#2e3240':'#596079','#3a2a22':'#6b5040','#2a1d18':'#634a3c','#3b2418':'#6e4c38','#2a2422':'#5b4c44','#2e3d5c':'#4f6290','#7b4a2b':'#94603d'});
const cwDk=col=>CW_LIFT&&CW_LIFTED[col]||col;
// A shape in gouache: the fill, then the brush line.
function cwInk(c,path,fill,lw=3.6){c.beginPath();path(c);if(fill){c.fillStyle=fill;c.fill();}if(lw>0){c.strokeStyle=CW_INK;c.lineWidth=lw;c.lineJoin='round';c.lineCap='round';c.stroke();}}
const cwEll=(c,x,y,rx,ry,a=0)=>{c.moveTo(x+rx*Math.cos(a),y+rx*Math.sin(a));c.ellipse(x,y,Math.abs(rx),Math.abs(ry),a,0,CW_TAU);};
// A rounded rectangle with slightly uneven corners, as a brush would paint it.
function cwRect(c,x,y,w,h,r=8,seed=0){const j=i=>(Krand(i,seed)-.5)*2.4;c.moveTo(x+r,y+j(1));c.lineTo(x+w-r,y+j(2));c.quadraticCurveTo(x+w,y,x+w+j(3),y+r);c.lineTo(x+w+j(4),y+h-r);
 c.quadraticCurveTo(x+w,y+h,x+w-r,y+h+j(5));c.lineTo(x+r,y+h+j(6));c.quadraticCurveTo(x,y+h,x+j(7),y+h-r);c.lineTo(x+j(8),y+r);c.quadraticCurveTo(x,y,x+r,y+j(1));c.closePath();}
// A few lighter strokes of the brush over a fill (the texture of gouache), without clipping.
function cwBrush(c,x,y,w,h,col,n=4,seed=0,alpha=.35){c.save();c.globalAlpha*=alpha;c.strokeStyle=col;c.lineCap='round';
 for(let i=0;i<n;i++){const a=x+w*(.1+.8*Krand(i,seed)),b=y+h*(.15+.7*Krand(i+9,seed)),l=w*(.12+.2*Krand(i+17,seed));c.lineWidth=2+3*Krand(i+23,seed);c.beginPath();c.moveTo(a,b);c.quadraticCurveTo(a+l/2,b-2,a+l,b+1);c.stroke();}c.restore();}
// Several round shapes as one (a tree, a cloud, curls): the line is drawn twice as wide and the fill covers its inner half, so that only
// the outside of the whole shape keeps its line.
function cwBlob(c,path,fill,lw=3.2){c.beginPath();path(c);c.strokeStyle=CW_INK;c.lineWidth=lw*2;c.lineJoin='round';c.stroke();c.fillStyle=fill;c.fill();}
const cwSpring=(t,rate=7,freq=22)=>t<0?0:Math.exp(-t*rate)*Math.cos(t*freq);

// ── The places ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// sky: top and bottom of the sky; ground: the floor and its line; door: the leaf of the kitchen door; cloth: the tablecloth;
// chair: the wood of the chair. night: the square by night (stars, lit windows).
const CW_PLACES=Object.freeze({
 terrace:{sky:['#9fcfd8','#f3e3b8'],ground:['#d9b98a','#b8925f'],door:'#2f8c88',cloth:'#d8573a',chair:'#7b4a2b',wall:'#e2a93a'},
 beach:{sky:['#8fc7dc','#e9f1df'],ground:['#ecd39a','#cfae6c'],door:'#2e6fa0',cloth:'#2f8c88',chair:'#e8958c',wall:'#f3e5c4'},
 garden:{sky:['#b4dbe0','#eef0cf'],ground:['#8fb35a','#6f9440'],door:'#d8573a',cloth:'#e2a93a',chair:'#fbf6ea',wall:'#e8958c'},
 train:{sky:['#c9b28a','#e8d6b0'],ground:['#8a3f3a','#6d2f2c'],door:'#7b4a2b',cloth:'#fbf6ea',chair:'#e2a93a',wall:'#efe2c0',panel:'#4d7a68'},
 square:{sky:['#1f2b4f','#4b5a86'],ground:['#7c7486','#5e5868'],door:'#e2a93a',cloth:'#2f8c88',chair:'#d8573a',wall:'#c76a45',night:true}});
// Where things stand: the kitchen door (left), the café table, the chair (right), the waiter.
const CW_DOOR=Object.freeze({x:-505,w:110,top:398}),CW_TABLE=Object.freeze({x:-262,top:532,r:92}),CW_CHAIR=Object.freeze({x:392,seat:552}),CW_WX=40;

// The sky and the place, behind everything: sky in screen units, the rest in stage units.
function cwBack(c,W,round,k){const P=CW_PLACES[CB_PLACES[round.place]],name=CB_PLACES[round.place];
 const g=c.createLinearGradient(0,0,0,720);g.addColorStop(0,P.sky[0]);g.addColorStop(1,P.sky[1]);c.fillStyle=g;c.fillRect(0,0,W,720);
 // the moon or the sun and the clouds, in the sky of the screen but at the size of the stage
 const at=(x,y,draw)=>{c.save();c.translate(x,y);c.scale(k,k);draw();c.restore();};
 if(P.night){for(let i=0;i<70;i++){const x=Krand(i,3)*W,y=Krand(i,5)*380;c.fillStyle=`rgba(255,246,214,${.35+.5*Krand(i,8)})`;c.beginPath();c.arc(x,y,1+1.4*Krand(i,9),0,CW_TAU);c.fill();}
  at(W*.78,110,()=>{c.fillStyle='rgba(255,240,200,.18)';c.beginPath();c.arc(0,0,70,0,CW_TAU);c.fill();cwInk(c,cc=>cwEll(cc,0,0,34,34),'#f6e9bf',3);});}
 else if(name!=='train'){for(let i=0;i<3;i++)at(W*(.18+.3*i)+40*Krand(i,4),70+50*Krand(i,6),()=>cwBlob(c,cc=>{cwEll(cc,0,0,58,20);cwEll(cc,38,-12,36,22);cwEll(cc,-30,-6,30,18);},'#fbf6ea',1.6));
  at(W*.86,96,()=>cwInk(c,cc=>cwEll(cc,0,0,36,36),'#f4c65a',3));}
 c.save();c.translate(W/2,720);c.scale(k,k);c.translate(0,-720);const HW=W/2/k+40;
 CW_SCENE[name](c,HW,P);
 // the floor
 c.fillStyle=P.ground[0];c.fillRect(-HW,CW_GY-6,2*HW,720-CW_GY+400);c.strokeStyle=CW_INK;c.lineWidth=3.4;c.beginPath();c.moveTo(-HW,CW_GY-6);c.lineTo(HW,CW_GY-6);c.stroke();
 for(let i=0;i<46;i++){const x=-HW+2*HW*Krand(i,11),y=CW_GY+6+64*Krand(i,12);c.fillStyle=Kmix(P.ground[0],P.ground[1],.6);c.beginPath();cwEll(c,x,y,10+14*Krand(i,13),3+2*Krand(i,14));c.fill();}
 c.restore();}
// The far scenery of each place, and the wall that holds the kitchen door.
const CW_SCENE=Object.freeze({
 terrace(c,HW,P){// plane trees, the bunting of the festa major, the café with its awning
  for(let i=0;i<4;i++){const x=-80+i*240+40*Krand(i,2);cwInk(c,cc=>cc.rect(x-9,400,18,250),'#8a7a5a',3);cwBlob(c,cc=>{cwEll(cc,x,360,92,70);cwEll(cc,x-60,400,52,40);cwEll(cc,x+64,396,56,42);},Kmix('#6f9a48',P.sky[0],.25),3);
   cwBrush(c,x-80,300,160,110,'#a9c96a',6,i);}
  c.strokeStyle=CW_INK;c.lineWidth=2;for(const [y0,x0,x1] of [[250,-380,620],[300,-380,640]]){c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo((x0+x1)/2,y0+50,x1,y0);c.stroke();
   for(let i=0;i<14;i++){const u=(i+.5)/14,x=x0+(x1-x0)*u,y=y0+50*4*u*(1-u)*.5*2;cwInk(c,cc=>{cc.moveTo(x-11,y);cc.lineTo(x+11,y);cc.lineTo(x,y+22);cc.closePath();},['#d8573a','#e2a93a','#2f8c88','#fbf6ea'][i%4],1.6);}}
  cwInk(c,cc=>cwRect(cc,-HW,250,HW-350,410,4,1),P.wall,3.6);cwBrush(c,-HW,260,HW-350,380,'#f3d27a',10,2,.4);
  for(let i=0;i<4;i++)cwInk(c,cc=>{cc.moveTo(-600+i*62,250);cc.lineTo(-569+i*62,250);cc.lineTo(-580+i*62,300);cc.lineTo(-611+i*62,300);cc.closePath();},i%2?'#fbf6ea':'#d8573a',2.6);
  cwInk(c,cc=>cwRect(cc,-HW,236,HW-350,22,4,2),'#d8573a',3);},
 beach(c,HW,P){// the sea, a sail far away, the beach bar of planks, a parasol
  cwInk(c,cc=>cc.rect(-HW,430,2*HW,220),'#3f9fb0',0);c.fillStyle='#57b5c2';c.fillRect(-HW,430,2*HW,26);c.strokeStyle=CW_INK;c.lineWidth=2.4;c.beginPath();c.moveTo(-HW,430);c.lineTo(HW,430);c.stroke();
  for(let i=0;i<9;i++){const x=-HW+i*170+60*Krand(i,3),y=470+120*Krand(i,4);c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+20,y-6,x+40,y);c.stroke();}
  cwInk(c,cc=>{cc.moveTo(250,422);cc.lineTo(250,370);cc.lineTo(282,418);cc.closePath();},'#fbf6ea',2.2);cwInk(c,cc=>{cc.moveTo(236,424);cc.lineTo(290,424);cc.lineTo(282,432);cc.lineTo(242,432);cc.closePath();},'#d8573a',2.2);
  cwInk(c,cc=>cwRect(cc,-HW,300,HW-350,360,4,3),P.wall,3.6);for(let i=0;i<7;i++){c.strokeStyle='rgba(42,33,30,.35)';c.lineWidth=2;c.beginPath();c.moveTo(-HW+20,330+i*44);c.lineTo(-372,330+i*44);c.stroke();}
  cwInk(c,cc=>{cc.moveTo(-HW-10,300);cc.lineTo(-320,300);cc.lineTo(-360,250);cc.lineTo(-HW-10,250);cc.closePath();},'#e2a93a',3);
  cwInk(c,cc=>cc.rect(536,330,8,320),'#fbf6ea',2.6);for(let i=0;i<4;i++)cwInk(c,cc=>{cc.moveTo(540,300);cc.lineTo(440+i*50,350);cc.lineTo(490+i*50,350);cc.closePath();},i%2?'#fbf6ea':'#2f8c88',2.6);},
 garden(c,HW,P){// a hedge, two round trees, flowers, the pink house with its French door
  for(let i=0;i<3;i++){const x=40+i*260;cwInk(c,cc=>cc.rect(x-8,360,16,200),'#7b5a3a',3);cwBlob(c,cc=>{cwEll(cc,x,330,70,80);cwEll(cc,x-44,370,40,36);cwEll(cc,x+46,366,42,38);},Kmix('#5d8a3c',P.sky[0],.15),3);cwBrush(c,x-60,270,120,120,'#93c35e',5,i+4);}
  cwInk(c,cc=>{cc.moveTo(-360,560);for(let i=0;i<=14;i++){const x=-360+i*(HW+360)/14;cc.quadraticCurveTo(x-24,500+12*Krand(i,7),x,520);}cc.lineTo(HW,650);cc.lineTo(-360,650);cc.closePath();},'#4f7d34',3.2);
  for(let i=0;i<16;i++){const x=-300+(HW+300)*Krand(i,8),y=560+60*Krand(i,9);cwInk(c,cc=>cwEll(cc,x,y,7,7),['#e8958c','#fbf6ea','#e2a93a'][i%3],1.6);}
  cwInk(c,cc=>cwRect(cc,-HW,220,HW-350,440,4,4),P.wall,3.6);cwBrush(c,-HW,240,HW-350,400,'#f4b4a8',10,5,.45);
  cwInk(c,cc=>{cc.moveTo(-HW-10,220);cc.lineTo(-330,220);cc.lineTo(-380,170);cc.lineTo(-HW-10,170);cc.closePath();},'#8a5a3a',3);},
 train(c,HW,P){// the dining car: a cream wall, green velvet under the rail, three windows on the countryside, lamps
  cwInk(c,cc=>cc.rect(-HW,120,2*HW,540),P.wall,0);cwBrush(c,-HW,140,2*HW,280,'#d9c49a',14,6,.45);
  cwInk(c,cc=>cc.rect(-HW-10,420,2*HW+20,240),P.panel,3.4);cwBrush(c,-HW,430,2*HW,200,'#6f9a86',16,8,.4);
  for(let i=0;i<9;i++){const x=-HW+i*2*HW/9+40;c.strokeStyle='rgba(42,33,30,.3)';c.lineWidth=2.4;c.beginPath();c.moveTo(x,436);c.lineTo(x,640);c.stroke();}
  for(let i=0;i<3;i++){const x=-250+i*330;cwInk(c,cc=>cwRect(cc,x,190,240,190,26,i),'#bfe0e2',4);
   c.save();c.beginPath();cwRect(c,x,190,240,190,26,i);c.clip();cwInk(c,cc=>{cc.moveTo(x-10,330);cc.quadraticCurveTo(x+80,280,x+160,320);cc.quadraticCurveTo(x+220,290,x+260,310);cc.lineTo(x+260,400);cc.lineTo(x-10,400);cc.closePath();},'#8fb35a',2.4);
   cwInk(c,cc=>{cc.moveTo(x-10,360);cc.quadraticCurveTo(x+120,330,x+260,350);cc.lineTo(x+260,400);cc.lineTo(x-10,400);cc.closePath();},'#6f9440',2.4);c.restore();cwInk(c,cc=>cwRect(cc,x,190,240,190,26,i),null,5);}
  cwInk(c,cc=>cc.rect(-HW-10,412,2*HW+20,12),'#a8774a',3);
  for(let i=0;i<4;i++){const x=-410+i*330;cwInk(c,cc=>{cc.moveTo(x-22,130);cc.lineTo(x+22,130);cc.lineTo(x+14,160);cc.lineTo(x-14,160);cc.closePath();},'#f3e5c4',2.6);}},
 square(c,HW,P){// the square by night: houses with lit windows, a string of lamps, the café
  for(let i=0;i<4;i++){const x=-260+i*250,h=230+50*Krand(i,2);cwInk(c,cc=>cwRect(cc,x,650-h-160,220,h+160,4,i),['#4a4f7a','#5b4a6e','#3f5a6e','#5d5470'][i],3.4);
   for(let r=0;r<2;r++)for(let q=0;q<3;q++){const lit=Krand(i*6+r*3+q,4)>.4;cwInk(c,cc=>cwRect(cc,x+24+q*64,650-h-120+r*90,40,54,4,q),lit?'#f2cf7a':'#2e3550',2.4);}}
  c.strokeStyle=CW_INK;c.lineWidth=2;c.beginPath();c.moveTo(-340,250);c.quadraticCurveTo(160,330,HW,240);c.stroke();
  for(let i=0;i<12;i++){const u=(i+.5)/12,x=-340+(HW+340)*u,y=250+(330-250)*2*u*(1-u)*1.6-10*u;c.fillStyle='rgba(255,226,140,.25)';c.beginPath();c.arc(x,y+12,16,0,CW_TAU);c.fill();cwInk(c,cc=>cwEll(cc,x,y+12,7,9),'#f6d58a',2);}
  cwInk(c,cc=>cwRect(cc,-HW,230,HW-350,430,4,6),P.wall,3.6);cwBrush(c,-HW,240,HW-350,400,'#e08a62',10,7,.4);
  cwInk(c,cc=>cwRect(cc,-HW,214,HW-350,24,4,7),'#2f8c88',3);}});

// ── The props: the kitchen door, the table and the chair ────────────────────────────────────────────────────────────────
// The frame of the door and what is behind it (the warm kitchen), drawn with the props; the leaf swings in every frame. Without the
// decor (or under its veil), a line of floor in the colour of the line, so that the waiter and the table stand on something.
function cwProps(c,round,decor,HW){const P=CW_PLACES[CB_PLACES[round.place]],D=CW_DOOR,bottom=CW_GY-6;
 if(decor.fade<1){c.save();c.globalAlpha*=(1-decor.fade)*.7;c.strokeStyle=decor.white?CW_INK:'#e9dcc0';c.lineWidth=3;c.beginPath();c.moveTo(-HW,bottom);c.lineTo(HW,bottom);c.stroke();c.restore();}
 cwInk(c,cc=>cc.rect(D.x-D.w/2-12,D.top-14,D.w+24,bottom-D.top+14),'#fbf6ea',3.6);
 cwInk(c,cc=>cc.rect(D.x-D.w/2,D.top,D.w,bottom-D.top),'#f6d58a',3);c.fillStyle='rgba(176,110,50,.35)';c.fillRect(D.x-D.w/2,D.top,D.w,26);
 // the café table: a round top with its cloth and one leg; the chair, of bent wood
 const T=CW_TABLE;cwInk(c,cc=>{cc.moveTo(T.x-8,T.top+10);cc.lineTo(T.x-8,CW_GY-14);cc.lineTo(T.x-30,CW_GY-4);cc.lineTo(T.x+30,CW_GY-4);cc.lineTo(T.x+8,CW_GY-14);cc.lineTo(T.x+8,T.top+10);cc.closePath();},'#5b4c44',3);
 cwInk(c,cc=>{cc.moveTo(T.x-T.r,T.top);cc.lineTo(T.x+T.r,T.top);cc.lineTo(T.x+T.r+8,T.top+40);cc.quadraticCurveTo(T.x+T.r-10,T.top+52,T.x+T.r-24,T.top+42);cc.quadraticCurveTo(T.x,T.top+56,T.x-T.r+24,T.top+42);cc.quadraticCurveTo(T.x-T.r+10,T.top+52,T.x-T.r-8,T.top+40);cc.closePath();},P.cloth,3.4);
 cwInk(c,cc=>cwEll(cc,T.x,T.top,T.r,10),Kmix(P.cloth,'#ffffff',.25),3.4);
 const C=CW_CHAIR,cc0=P.chair;cwInk(c,cc=>{cc.moveTo(C.x+30,C.seat);cc.lineTo(C.x+34,C.seat-120);cc.quadraticCurveTo(C.x+38,C.seat-150,C.x+10,C.seat-148);cc.quadraticCurveTo(C.x-14,C.seat-146,C.x-10,C.seat-118);},null,7);
 c.strokeStyle=cc0;c.lineWidth=4;c.beginPath();c.moveTo(C.x+30,C.seat);c.lineTo(C.x+34,C.seat-120);c.quadraticCurveTo(C.x+38,C.seat-150,C.x+10,C.seat-148);c.quadraticCurveTo(C.x-14,C.seat-146,C.x-10,C.seat-118);c.stroke();
 for(const [a,b] of [[-30,-38],[30,38],[-14,-18],[14,18]])cwInk(c,cc=>{cc.moveTo(C.x+a,C.seat+6);cc.lineTo(C.x+b,CW_GY-6);},null,6.5);
 for(const [a,b] of [[-30,-38],[30,38],[-14,-18],[14,18]]){c.strokeStyle=cc0;c.lineWidth=3.4;c.beginPath();c.moveTo(C.x+a,C.seat+6);c.lineTo(C.x+b,CW_GY-6);c.stroke();}
 cwInk(c,cc=>cwEll(cc,C.x,C.seat,44,10),cc0,3.4);}
// The leaf of the kitchen door: shut, or swung open towards the room (0 to 1).
function cwLeaf(c,round,open){const P=CW_PLACES[CB_PLACES[round.place]],D=CW_DOOR,bottom=CW_GY-6,l=D.x-D.w/2,w=D.w*(1-.82*open),skew=34*open;
 cwInk(c,cc=>{cc.moveTo(l,D.top);cc.lineTo(l+w,D.top-skew*.3);cc.lineTo(l+w,bottom+skew*.3);cc.lineTo(l,bottom);cc.closePath();},P.door,3.6);
 if(open<.7){const px=l+w*.5,py=D.top+62;cwInk(c,cc=>cwEll(cc,px,py,22*(1-open),22),'#f6d58a',3.4);cwInk(c,cc=>cc.rect(l+w*.18,bottom-70,w*.64,10),Kmix(P.door,'#ffffff',.3),2.2);}}

// ── The things ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each is drawn with the middle of its base at 0,0, going up to -h. wob: a wobble (the jelly, the cake), squash: the bounce of landing.
const CW_SIZE=Object.freeze({plates:[128,26],cup:[78,42],cake:[112,56],teapot:[104,54],melon:[116,50],fruit:[112,52],jelly:[86,50]});
const CW_THING=Object.freeze({
 plates(c){for(let i=0;i<3;i++){const y=-6-i*8;cwInk(c,cc=>cwEll(cc,0,y,64,8),'#fbf6ea',3);c.strokeStyle='#2f8c88';c.lineWidth=2.4;c.beginPath();cwEll(c,0,y,52,5.4);c.stroke();}},
 cup(c){cwInk(c,cc=>cwEll(cc,0,-5,38,6),'#fbf6ea',3);cwInk(c,cc=>{cc.moveTo(22,-34);cc.bezierCurveTo(44,-36,42,-14,18,-14);},null,4.5);
  cwInk(c,cc=>{cc.moveTo(-26,-38);cc.lineTo(26,-38);cc.quadraticCurveTo(24,-10,10,-8);cc.lineTo(-10,-8);cc.quadraticCurveTo(-24,-10,-26,-38);cc.closePath();},'#f3e5c4',3.2);
  c.fillStyle='#d8573a';c.fillRect(-24,-30,48,6);cwInk(c,cc=>cwEll(cc,0,-38,26,5),'#8a5a3a',2.6);},
 cake(c,o){const w=o.wob||0;c.save();c.transform(1,0,w*.25,1,0,0);cwInk(c,cc=>cwRect(cc,-56,-30,112,30,6,1),'#f3e5c4',3.4);
  cwInk(c,cc=>{cc.moveTo(-56,-22);for(let i=0;i<=8;i++)cc.quadraticCurveTo(-56+i*14-7,-12+(i%2)*4,-56+i*14,-22);cc.lineTo(56,-30);cc.lineTo(-56,-30);cc.closePath();},'#e8958c',2.6);
  cwInk(c,cc=>cwRect(cc,-38,-52,76,24,6,2),'#e8958c',3.2);cwInk(c,cc=>cwEll(cc,0,-58,7,7),'#d8573a',2.4);cwBrush(c,-50,-28,100,20,'#ffffff',3,4,.35);c.restore();},
 teapot(c){cwInk(c,cc=>{cc.moveTo(-34,-30);cc.quadraticCurveTo(-52,-36,-60,-50);cc.lineTo(-54,-52);cc.quadraticCurveTo(-44,-40,-30,-40);},'#e2a93a',3);
  cwInk(c,cc=>{cc.moveTo(34,-40);cc.bezierCurveTo(58,-46,58,-14,32,-14);},null,5);cwInk(c,cc=>cwEll(cc,0,-24,40,24),'#e2a93a',3.4);
  for(let i=0;i<5;i++){c.fillStyle='#fbf6ea';c.beginPath();cwEll(c,-22+i*11,-22+(i%2)*8,3.4,3.4);c.fill();}cwInk(c,cc=>cwEll(cc,0,-47,18,5),'#e2a93a',2.8);cwInk(c,cc=>cwEll(cc,0,-54,6,5),'#d8573a',2.4);},
 melon(c){cwInk(c,cc=>cwEll(cc,0,-25,58,25),'#5d8a3c',3.4);c.strokeStyle='#3f6a2a';c.lineWidth=5;c.lineCap='round';
  for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*20-6,-48);c.quadraticCurveTo(i*24,-25,i*20-6,-2);c.stroke();}cwBrush(c,-44,-44,60,16,'#a9c96a',3,5,.5);},
 fruit(c){for(const [x,y,col] of [[-22,-34,'#e2a93a'],[18,-36,'#e2a93a'],[-2,-46,'#d8573a']])cwInk(c,cc=>cwEll(cc,x,y,16,16),col,2.8);
  cwInk(c,cc=>{cc.moveTo(30,-44);cc.quadraticCurveTo(42,-60,34,-64);},null,3);cwInk(c,cc=>cwEll(cc,24,-50,9,13,.4),'#a9c96a',2.6);
  cwInk(c,cc=>{cc.moveTo(-56,-28);cc.lineTo(56,-28);cc.quadraticCurveTo(50,0,0,0);cc.quadraticCurveTo(-50,0,-56,-28);cc.closePath();},'#2f8c88',3.4);cwBrush(c,-46,-24,90,18,'#7cc4be',3,6,.45);},
 jelly(c,o){const w=o.wob||0;cwInk(c,cc=>cwEll(cc,0,-4,43,6),'#fbf6ea',3);c.save();c.translate(0,-8);c.scale(1+w*.22,1-w*.22);c.transform(1,0,w*.18,1,0,0);
  cwInk(c,cc=>{cc.moveTo(-36,0);cc.lineTo(36,0);cc.bezierCurveTo(38,-18,30,-42,0,-42);cc.bezierCurveTo(-30,-42,-38,-18,-36,0);cc.closePath();},'#d94f68',3.4);
  c.strokeStyle='rgba(42,33,30,.45)';c.lineWidth=2.2;for(const x of [-16,0,16]){c.beginPath();c.moveTo(x,-2);c.quadraticCurveTo(x*1.15,-24,x*.6,-38);c.stroke();}
  c.fillStyle='rgba(255,255,255,.55)';c.beginPath();cwEll(c,-14,-30,6,9,-.4);c.fill();c.restore();},
 // the banana skin of the third mishap: on the floor from the start of the round, never on the pile
 _banana(c){c.scale(1.5,1.5);cwInk(c,cc=>{cc.moveTo(-22,0);cc.quadraticCurveTo(-30,-16,-18,-22);cc.quadraticCurveTo(-8,-8,0,-6);cc.quadraticCurveTo(10,-22,24,-18);cc.quadraticCurveTo(18,-4,22,0);cc.closePath();},'#f2cf4a',3);
  cwInk(c,cc=>cwEll(cc,0,-3,10,4),'#e2a93a',2.4);}});
function cwThing(c,name,x,y,a=0,o={}){c.save();c.translate(x,y);if(a)c.rotate(a);const s=o.squash||0;if(s)c.scale(1+s*.5,1-s);CW_THING[name](c,o);c.restore();}


// ── The waiter ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Four waiters, each with their own clothes, skin and hair; hat: how tall the hat is above the head (the jelly lands on top of it).
const CW_HEROES=Object.freeze({
 waiter:{skin:'#f1c7a0',hair:'#3a2a22',top:'#fbf6ea',legs:'#2e3240',shoes:'#2a2422',tie:'#d8573a',hat:4,tash:true},
 skater:{skin:'#8d5a3b',hair:'#2a1d18',top:'#d8573a',legs:'#8d5a3b',shoes:'#2e6fa0',apron:'#fbf6ea',hat:6,skates:true,dress:true,tail:true},
 chef:{skin:'#e0ab84',hair:'#7b4a2b',top:'#fbf6ea',legs:'#2e3d5c',shoes:'#2a2422',tie:'#d8573a',hat:62,toque:true,belly:true},
 baker:{skin:'#c98d62',hair:'#3b2418',top:'#e8958c',legs:'#c98d62',shoes:'#7b4a2b',apron:'#fbf6ea',hat:16,cap:true,dress:true,curls:true}});
const CW_LEG=95,CW_TORSO=100,CW_HEAD=42,CW_NECK=6;
const cwRot=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
const cwLerp=(a,b,t)=>a+(b-a)*t;
// The head: face to the front, with dot eyes, rosy cheeks and a mouth for each mood.
function cwHead(c,H,P){const R=CW_HEAD,m=P.mood||'smile',lx=(P.look?.[0]||0)*5,ly=(P.look?.[1]||0)*5;
 if(H.tail){const sw=P.swing||0;cwInk(c,cc=>{cc.moveTo(-20,-24);cc.quadraticCurveTo(-62,-30+sw*8,-56,8+sw*6);cc.quadraticCurveTo(-40,-8,-26,-12);cc.closePath();},cwDk(H.hair),3);}
 if(H.curls)cwBlob(c,cc=>{for(let i=0;i<7;i++){const a=Math.PI*(1.05+i*.13);cwEll(cc,Math.cos(a)*R*.98,Math.sin(a)*R*.9-2,12,12);}},cwDk(H.hair),2.6);
 cwInk(c,cc=>cwEll(cc,0,0,R,R*1.04),H.skin,3.6);
 if(!H.curls&&!H.toque)cwInk(c,cc=>{cc.moveTo(-R+1,-6);cc.quadraticCurveTo(-R,-R*1.1,4,-R*1.06);cc.quadraticCurveTo(R*.9,-R,R-1,-10);cc.quadraticCurveTo(10,-R*.62,-R+1,-6);cc.closePath();},cwDk(H.hair),3);
 if(H.toque){cwInk(c,cc=>{cc.moveTo(-R*.82,-R*.66);cc.lineTo(-R*.9,-R-18);cc.bezierCurveTo(-R*1.3,-R-60,-R*.2,-R-74,0,-R-58);cc.bezierCurveTo(R*.3,-R-80,R*1.4,-R-58,R*.9,-R-18);cc.lineTo(R*.82,-R*.66);cc.closePath();},'#fbf6ea',3.4);
  cwInk(c,cc=>cc.rect(-R*.86,-R-20,R*1.72,16),'#fbf6ea',3);}
 if(H.cap)cwInk(c,cc=>{cc.moveTo(-R*.9,-R*.55);cc.quadraticCurveTo(0,-R*1.55,R*.9,-R*.55);cc.lineTo(R*.7,-R*.4);cc.quadraticCurveTo(0,-R*.8,-R*.7,-R*.4);cc.closePath();},'#fbf6ea',3);
 // cheeks, eyes and brows, nose, moustache, mouth
 c.fillStyle='rgba(232,120,110,.45)';c.beginPath();cwEll(c,-R*.56,R*.24,8,6);cwEll(c,R*.56,R*.24,8,6);c.fill();
 const shut=P.blink||m==='proud'||m==='laugh',squeeze=m==='tickle'||m==='sneeze';c.strokeStyle=CW_INK;c.fillStyle=CW_INK;c.lineWidth=3;c.lineCap='round';
 for(const s of [-1,1]){const ex=s*12+lx,ey=-4+ly;c.beginPath();
  if(squeeze){c.moveTo(ex-6*s,ey-4);c.lineTo(ex+5*s,ey);c.lineTo(ex-6*s,ey+4);c.stroke();}
  else if(shut){c.moveTo(ex-6,ey+1);c.quadraticCurveTo(ex,ey-6,ex+6,ey+1);c.stroke();}
  else if(m==='dazed'){c.moveTo(ex-5,ey-4);c.lineTo(ex+5,ey+4);c.moveTo(ex+5,ey-4);c.lineTo(ex-5,ey+4);c.stroke();}
  else{const big=m==='o'||m==='worry';cwEll(c,ex,ey,big?4.6:3.8,big?6:5.2);c.fill();}
  const bw=m==='worry'?-.4:m==='strain'?.4:m==='o'?-.15:0;c.beginPath();c.moveTo(ex-7,ey-13-(m==='o'?4:0)+bw*10*s);c.lineTo(ex+7,ey-13-(m==='o'?4:0)-bw*10*s);c.stroke();}
 c.fillStyle=Kmix(H.skin,'#d8573a',.35);c.beginPath();cwEll(c,0,6,5,4);c.fill();
 if(H.tash)cwInk(c,cc=>{cc.moveTo(0,13);cc.quadraticCurveTo(-12,8,-20,15);cc.quadraticCurveTo(-10,17,0,15);cc.quadraticCurveTo(10,17,20,15);cc.quadraticCurveTo(12,8,0,13);cc.closePath();},cwDk(H.hair),2);
 c.lineWidth=3;c.beginPath();
 if(m==='o'){c.fillStyle='#7a2f2a';cwEll(c,0,22,5,6);c.fill();c.stroke();}
 else if(m==='laugh'||m==='ah'){c.fillStyle='#7a2f2a';c.moveTo(-13,17);c.quadraticCurveTo(0,m==='ah'?40:34,13,17);c.closePath();c.fill();c.stroke();}
 else if(m==='worry'){c.moveTo(-11,22);c.quadraticCurveTo(-5,17,0,21);c.quadraticCurveTo(5,25,11,20);c.stroke();}
 else if(m==='strain'){c.fillStyle='#fbf6ea';c.rect(-11,17,22,8);c.fill();c.stroke();c.beginPath();c.moveTo(-11,21);c.lineTo(11,21);c.stroke();}
 else if(m==='sneeze'){c.fillStyle='#7a2f2a';cwEll(c,0,21,9,4);c.fill();c.stroke();}
 else if(m==='tickle'){c.moveTo(-6,22);c.quadraticCurveTo(0,26,6,22);c.stroke();}
 else if(m==='dazed'){c.moveTo(-10,21);c.quadraticCurveTo(-4,17,0,21);c.quadraticCurveTo(4,25,10,21);c.stroke();}
 else{c.moveTo(-12,18);c.quadraticCurveTo(0,m==='proud'?31:28,12,18);c.stroke();}}
// A limb: a tube of gouache through a joint, with its dark line.
function cwLimb(c,pts,w,col){c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(pts[0][0],pts[0][1]);c.quadraticCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1]);
 c.strokeStyle=CW_INK;c.lineWidth=w+7;c.stroke();c.strokeStyle=col;c.lineWidth=w;c.stroke();}
// An arm from the shoulder: a (radians from hanging down, outwards), bend (the forearm, further out), side (-1 left, 1 right).
function cwArm(sh,a,bend,side,lean){const u=(ang,l)=>{const [x,y]=cwRot(side*Math.sin(ang)*l,Math.cos(ang)*l,lean);return [x,y];};
 const e=u(a,44),h=u(a+bend,42),el=[sh[0]+e[0],sh[1]+e[1]];return [sh,el,[el[0]+h[0],el[1]+h[1]]];}
// The waiter. P: x and y of the feet; lean (radians, from the hips); sit (0 standing, 1 sitting on the floor with the legs apart);
// lift (one foot up, 0 to 1); hop (how high the feet are); stepL, stepR (the feet, sideways); free, bend: the left arm (0 hanging, 1.6
// out, 2.6 up); tray: false when the right hand no longer holds the tray, and then free2, bend2 for that arm; head (tilt), mood, look,
// blink, swing (the ponytail); bow (0 to 1). Returns the hand under the tray, the top of the hat, the head and the free hand.
function cwHero(c,H,P,draw=true){const sit=P.sit||0,bow=P.bow||0,lean=(P.lean||0)-.12*sit,hop=P.hop||0;
 const hipX=P.x,hipY=cwLerp(P.y-CW_LEG-hop,CW_GY-14-hop,sit);
 // a bow, seen from the front: the body folds towards us, so it gets shorter and the head comes down
 const fold=1-.36*bow,at=(lx,ly)=>{const [a,b]=cwRot(lx,ly*fold,lean);return [hipX+a,hipY+b];};
 const tilt=lean+(P.head||0),headC=at(0,-CW_TORSO-CW_NECK-CW_HEAD),shR=at(28,-CW_TORSO+14),shL=at(-28,-CW_TORSO+14);
 const trayHand=at(112+(P.reach||0),-172),elbowR=at(80,-100);
 const hatTop=[headC[0]+Math.sin(tilt)*(CW_HEAD+H.hat),headC[1]-Math.cos(tilt)*(CW_HEAD+H.hat)];
 const armL=cwArm(shL,P.free??.25,P.bend??.4,-1,lean),armR=P.tray===false?cwArm(shR,P.free2??.3,P.bend2??.4,1,lean):[shR,elbowR,trayHand];
 const rig={tray:trayHand,hat:hatTop,head:headC,lean,tilt,hand:armL[2],hand2:armR[2]};if(!draw)return rig;
 const sleeve=H.dress?H.skin:H.top,legCol=cwDk(H.legs),shoe=cwDk(H.shoes);
 // the shadow, the legs and the feet: standing (one foot can go up), or sitting with the legs apart and the soles to the front
 c.fillStyle='rgba(42,33,30,.2)';c.beginPath();cwEll(c,hipX,CW_GY-2,66+16*sit,9);c.fill();
 const fy=P.y-hop,lift=P.lift||0,stand=[[hipX-15+(P.stepL||0),fy],[hipX+16+40*lift+(P.stepR||0),fy-46*lift]],sat=[[hipX-74,CW_GY+12-hop],[hipX+74,CW_GY+12-hop]];
 for(let i=0;i<2;i++){const f=[cwLerp(stand[i][0],sat[i][0],sit),cwLerp(stand[i][1],sat[i][1],sit)],hx=hipX+(i?11:-11),out=i?1:-1;
  const knee=[(hx+f[0])/2+out*6*(1-sit)+12*lift*i,(hipY+f[1])/2-10*lift*i-4*sit];
  cwLimb(c,[[hx,hipY],knee,[f[0],f[1]-8]],H.dress?11:20,legCol);
  if(sit>.6){cwInk(c,cc=>cwEll(cc,f[0],f[1]-10,13,17),shoe,3);if(H.skates)for(const wx of [-7,7])cwInk(c,cc=>cwEll(cc,f[0]+wx,f[1]+8,5,5),'#e2a93a',2.4);}
  else if(H.skates){cwInk(c,cc=>cwRect(cc,f[0]-16,f[1]-20,36,14,5,i),shoe,3);for(const wx of [-8,12])cwInk(c,cc=>cwEll(cc,f[0]+wx,f[1]-3,5.5,5.5),'#e2a93a',2.4);}
  else cwInk(c,cc=>cwEll(cc,f[0]+out*6,f[1]-6,17,8),shoe,3);}
 // the body
 c.save();c.translate(hipX,hipY);c.rotate(lean);c.scale(1,fold);const bw=H.belly?50:40;
 if(H.dress)cwInk(c,cc=>{cc.moveTo(-bw+4,-CW_TORSO+16);cc.lineTo(bw-4,-CW_TORSO+16);cc.lineTo(bw+12,8);cc.quadraticCurveTo(0,18,-bw-12,8);cc.closePath();},H.top,3.6);
 else{cwInk(c,cc=>cwRect(cc,-bw*.62,-30,bw*1.24,38,8,3),legCol,3.4);
  cwInk(c,cc=>{cc.moveTo(-bw+6,-CW_TORSO+14);cc.lineTo(bw-6,-CW_TORSO+14);cc.quadraticCurveTo(bw+(H.belly?16:4),-46,bw-4,-10);cc.lineTo(-bw+4,-10);cc.quadraticCurveTo(-bw-(H.belly?16:4),-46,-bw+6,-CW_TORSO+14);cc.closePath();},H.top,3.6);}
 if(H.apron)cwInk(c,cc=>{cc.moveTo(-24,-52);cc.lineTo(24,-52);cc.lineTo(30,0);cc.quadraticCurveTo(0,6,-30,0);cc.closePath();},H.apron,3);
 if(H.belly){c.fillStyle=cwDk('#2e3d5c');for(const y of [-70,-50,-30])for(const x of [-10,10]){c.beginPath();cwEll(c,x,y,3.2,3.2);c.fill();}}
 cwBrush(c,-bw*.6,-CW_TORSO+20,bw*1.2,60,'#ffffff',3,7,.22);
 if(H.tie)cwInk(c,cc=>{cc.moveTo(0,-CW_TORSO+16);cc.lineTo(-14,-CW_TORSO+8);cc.lineTo(-14,-CW_TORSO+26);cc.closePath();cc.moveTo(0,-CW_TORSO+16);cc.lineTo(14,-CW_TORSO+8);cc.lineTo(14,-CW_TORSO+26);cc.closePath();},H.tie,2.4);
 cwInk(c,cc=>cc.rect(-8,-CW_TORSO-CW_NECK+2,16,CW_NECK+6),H.skin,2.6);
 c.restore();
 // the arms and the head
 cwLimb(c,armL,15,sleeve);cwInk(c,cc=>cwEll(cc,armL[2][0],armL[2][1],10,10),H.skin,3);
 c.save();c.translate(headC[0],headC[1]);c.rotate(tilt);if(bow)c.scale(1,1-.1*bow);cwHead(c,H,P);c.restore();
 cwLimb(c,armR,15,sleeve);cwInk(c,cc=>cwEll(cc,armR[2][0],armR[2][1]+(P.tray===false?0:4),11,P.tray===false?10:9),H.skin,3);
 return rig;}
// The tray, flat on the hand, tilted by the pile.
function cwTray(c,x,y,a,sy=1){c.save();c.translate(x,y);c.rotate(a);c.scale(1,sy);cwInk(c,cc=>cwEll(cc,0,0,76,9),'#c4c8cc',3.4);c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2.4;c.beginPath();c.moveTo(-50,-3);c.lineTo(10,-4);c.stroke();c.restore();}

// ── The pile ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The things on the tray, from the bottom up: each one leans a little more than the one under it (bend, radians per thing), so the pile
// curves as it sways. Returns where each one stands (x, y of its base, angle) and the top.
function cwPile(names,x,y,a,bend){const out=[];let px=x,py=y-6,ang=a;
 for(let i=0;i<names.length;i++){ang+=bend;const h=CW_SIZE[names[i]][1];out.push({name:names[i],x:px,y:py,a:ang});const [dx,dy]=cwRot(0,-h,ang);px+=dx;py+=dy;}
 return {at:out,top:[px,py]};}
// How the pile sways during a press: the thing lands and the pile swings (wider with more things), the waiter fights it, and it is steady
// by CB_T.step.steady; then it only breathes a little (with the clock of waiting). k: the things on the tray.
function cwSwayAt(k,t,idle){const T=CB_T.step,A=cbSway(k),s=t-T.land,rest=A*.14*Math.sin(idle*1.9+k);if(s<0)return rest;
 const amp=A*(1-Math.exp(-s*5))*Math.exp(-Math.max(0,s-1.1)*.9),ph=Ksmooth((s-1.8)/1.2);
 return amp*Math.sin(s*CW_TAU/1.3)*(1-ph)+rest*ph;}
// The pile bends less than the tray swings, so that a tall pile still reads as a pile.
const CW_BEND=.55;
// A thing thrown from the kitchen door to the top of the pile, on an arc that stays on the screen.
function cwThrow(c,name,t,T,to,spin){const from=[CW_DOOR.x+30,CW_DOOR.top+80],u=Kclamp((t-T.toss)/(T.land-T.toss)),e=KeaseInOut(u),arc=Math.max(60,Math.min(240,(from[1]+to[1])/2-70));
 cwThing(c,name,from[0]+(to[0]-from[0])*e,from[1]+(to[1]-from[1])*e-arc*4*u*(1-u),(1-u)*spin,{});}

// ── A press ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The things already on the tray, the one that flies in, and the waiter's balance: the more things, the bigger the feat (the free arm
// out, a foot up, little hops, quick steps from side to side; the skater rolls).
function cwStep(c,H,round,step,t,idle,reduced){const T=CB_T.step,names=step.done.map(i=>CB_ITEMS[i]),name=CB_ITEMS[step.item],k=step.index;
 const landed=t>=T.land,n=names.length+(landed?1:0),idl=reduced?0:idle,sway=cwSwayAt(Math.max(1,n),t,idl);
 const s=t-T.land,fight=landed?1-Ksmooth((s-2.6)/1):0,grow=k/5;
 const P={x:CW_WX+sway*220*(.5+.5*grow)+(H.skates&&landed?Math.sin(s*2.4)*26*fight:0),y:CW_GY,lean:-sway*1.5,mood:'smile',look:[0,-.6],blink:!reduced&&(idle*.8)%3.6<.1};
 if(!landed){P.mood='o';const u=Kclamp((t-T.toss)/(T.land-T.toss));P.look=[-.9+1.3*u,-.4-.6*u];}
 else{const proud=t>=T.proud&&t<T.settle+.4;P.mood=proud?'proud':s<.35?'o':fight>.3?(k>=3?'strain':'worry'):'smile';
  P.free=.25+Math.min(1.4,.5+.25*k)*fight+(proud?1.6*Kbump(t,T.proud+.35,.4):0);P.bend=.4+.5*fight;
  if(k>=2)P.lift=Kclamp(Math.abs(sway)/cbSway(n)*1.4)*fight*Math.min(1,(k-1)*.5);
  if(k>=3&&!H.skates)P.hop=Math.abs(Math.sin(s*CW_TAU/1.3))*(6+4*k)*fight;
  if(k>=4){P.stepL=Math.sin(s*7)*10*fight;P.stepR=-Math.sin(s*7)*10*fight;}
  P.look=[sway*6,-.8];P.head=-sway*.8;}
 if(H.tail)P.swing=Math.sin(idl*2)*.3+sway*6;
 const rig=cwHero(c,H,P),tray=rig.tray,ta=sway*.8+rig.lean*.3;cwTray(c,tray[0],tray[1],ta);
 const pile=cwPile(landed?[...names,name]:names,tray[0],tray[1],ta,sway*CW_BEND);
 pile.at.forEach((p,i)=>{const last=landed&&i===pile.at.length-1;cwThing(c,p.name,p.x,p.y,p.a,{squash:last?.18*cwSpring(s,9,26):0,wob:p.name==='cake'?sway*4:0});});
 if(!landed&&t>=T.toss)cwThrow(c,name,t,T,pile.top,.5-.2*(k%3));
 return Kbump(t,.32,.22);}

// ── The final ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The jelly lands on top; the waiter is proud; the mishap; the pile comes down in slow motion and every thing lands somewhere safe:
// the plates and the teapot on the table, the cake on the chair, the melon and the fruit on the floor, the cup in the waiter's hand,
// the tray in front, spinning like a coin, and the jelly on the waiter's head. The waiter laughs, gets up and bows.
const CW_LAND=Object.freeze({plates:[CW_TABLE.x-30,CW_TABLE.top-3],teapot:[CW_TABLE.x+50,CW_TABLE.top-3],cake:[CW_CHAIR.x,CW_CHAIR.seat-6],melon:[268,CW_GY-6],fruit:[-112,CW_GY-6]});
const CW_SITX=CW_WX+20,CW_TRAYAT=Object.freeze([232,CW_GY+44]);
function cwFinal(c,H,round,step,t,idle,reduced){const T=CB_T.final,slip=CB_SLIPS[round.slip],S=CB_T[slip],names=step.items.map(i=>CB_ITEMS[i]),all=[...names,'jelly'];
 const A=cbSway(all.length),idl=reduced?0:idle,cupIn=names.includes('cup'),x0=slip==='banana'?CW_WX+70:CW_WX,sat=T.sit+.3;
 // The waiter at time u, and the sway of the pile.
 const pose=u=>{const s=u-T.land,P={x:CW_WX,y:CW_GY,mood:'smile',look:[0,-.6],blink:!reduced&&(idle*.8)%3.6<.1};
  let sway=A*(1-Math.exp(-Math.max(0,s)*5))*Math.exp(-Math.max(0,s-1)*1.4)*Math.sin(Math.max(0,s)*CW_TAU/1.3)+A*.12*Math.sin(idl*1.9);
  if(u<T.land){P.mood='o';const v=Kclamp((u-T.toss)/(T.land-T.toss));P.look=[-.9+1.3*v,-.4-.6*v];}
  else if(u<T.slip){const pr=Ksmooth((u-T.proud)/.25);P.mood=u<T.proud?(s<.35?'o':'worry'):'proud';P.free=.25+2.1*pr;P.bend=.4-.2*pr;}
  else if(u<S.go){// the mishap: each one tips the pile a little before it all goes
   if(slip==='sneeze'){const ah=.5*Ksmooth((u-S.ah1)/.3)+.5*Ksmooth((u-S.ah2)/.3);P.mood=u<S.ah1?'tickle':'ah';P.head=-.3*ah;P.lean=-.1*ah;P.free=.5;sway+=-A*.8*ah;}
   if(slip==='banana'){const st=KeaseInOut((u-S.step)/.5);P.x=CW_WX+70*st;P.stepR=Math.sin(Math.min(1,st)*Math.PI)*18;P.mood=u<S.slip?'proud':'o';P.free=.6;
    if(u>=S.slip){const v=Ksmooth((u-S.slip)/(S.go-S.slip));P.lean=.22*v;P.lift=v;P.free=.6+1.2*v;sway+=-A*1.2*v;}}
   if(slip==='hiccup'){const j1=Kbump(u,S.hic1+.08,.07),j2=Kbump(u,S.hic2+.08,.07);P.hop=j1*14+j2*22;P.mood=j1>.3||j2>.3?'o':'worry';P.free=.6;sway+=A*.5*(j1-j2);}}
  else{// in the air, then sitting on the floor
   const v=Kclamp((u-S.go)/(sat-S.go)),air=Math.sin(Math.PI*v)*(slip==='hiccup'?100:slip==='banana'?70:50);
   P.x=cwLerp(x0,CW_SITX,KeaseInOut(v));P.sit=KeaseInOut(v);P.hop=air;P.lean=(slip==='sneeze'?.25:-.15)*(1-v);P.tray=false;
   P.mood=u<sat?(slip==='sneeze'&&u<S.go+.3?'sneeze':'o'):'dazed';P.free=2.4-1.6*v;P.free2=2.4-1.9*v;P.bend=P.bend2=.3;
   if(slip==='banana')P.lift=1-v;
   if(cupIn&&u>T.fall+1){const g=Ksmooth((u-T.fall-1)/.4);P.free=cwLerp(P.free,2.5,g);P.bend=cwLerp(.3,-.5,g);}
   if(u>=T.jelly){P.mood=u<T.laugh?'o':u<T.up+.3?'laugh':'smile';P.look=u>=T.notice&&u<T.laugh?[0,-1]:[0,0];
    const up=KeaseInOut((u-T.up)/.7),bow=Ksmooth((u-T.bow)/.4)*(1-Ksmooth((u-T.bow-1.1)/.5));P.sit=1-up;P.bow=bow;if(bow>.3)P.mood='proud';
    if(u>=T.laugh&&u<T.up+.3)P.head=.06*Math.sin((u-T.laugh)*22);
    P.free2=.3+.4*up+.5*bow;P.free=cupIn?2.5-.7*up:.9-.5*up+.9*bow;}}
  if(H.tail)P.swing=Math.sin(idl*2)*.3+sway*6;
  return {P,sway};};
 const now=pose(t),fell=t>=T.fall;
 // the banana skin, on the floor from the start of the round, flips away at the slip
 if(slip==='banana'){const f=Ksmooth((t-S.go)/.6);cwThing(c,'_banana',CW_WX+92+60*f,CW_GY-4-40*Math.sin(Math.PI*f),.8*f,{});}
 const me=cwHero(c,H,now.P);
 // the hiccups: a little bubble rises from the mouth at each one; the sneeze: a soft puff in front of the face
 const fade=(a,draw)=>{if(a<=0)return;c.save();c.globalAlpha*=a;draw();c.restore();};
 if(slip==='hiccup')for(const [h,r] of [[S.hic1,6],[S.hic2,7],[S.go,9]]){const p=(t-h)/.8;if(p>0&&p<1)fade(1-Ksmooth(p),()=>cwInk(c,cc=>cwEll(cc,me.head[0]+46+24*p,me.head[1]+12-56*p,r*(1+.5*p),r*(1+.5*p)),'#fbf6ea',2.2));}
 if(slip==='sneeze'){const p=(t-S.go)/.8;if(p>0&&p<1){const x=me.head[0]+58+36*p,y=me.head[1]+10,r=12+10*p;fade(1-Ksmooth(p),()=>cwBlob(c,cc=>{cwEll(cc,x,y,r,r);cwEll(cc,x+r*.9,y-r*.5,r*.8,r*.8);cwEll(cc,x+r*.9,y+r*.6,r*.75,r*.75);cwEll(cc,x+r*1.7,y,r*.7,r*.7);},'#fbf6ea',1.6));}}
 if(!fell){const tray=me.tray,ta=now.sway*.8+me.lean*.3;cwTray(c,tray[0],tray[1],ta);const s=t-T.land;
  const pile=cwPile(t>=T.land?all:names,tray[0],tray[1],ta,now.sway*CW_BEND);
  pile.at.forEach((p,i)=>{const isJ=p.name==='jelly';cwThing(c,p.name,p.x,p.y,p.a,{squash:isJ?.2*cwSpring(s,9,26):0,wob:isJ?cwSpring(s,3,16)*1.2:p.name==='cake'?now.sway*4:0});});
  if(t<T.land&&t>=T.toss)cwThrow(c,'jelly',t,T,cwPile(names,tray[0],tray[1],ta,now.sway*CW_BEND).top,.4);}
 else{// the slow fall, from where everything was when the waiter let go
  const p0=pose(T.fall),r0=cwHero(c,H,p0.P,false),ta0=p0.sway*.8+r0.lean*.3,pile=cwPile(all,r0.tray[0],r0.tray[1],ta0,p0.sway*CW_BEND);
  const tl=Kclamp((t-T.fall)/1.6),te=KeaseInOut(tl),spin=t-T.fall-1.6;
  // the tray flips twice on its way down, then spins on the floor like a coin until it lies flat
  cwTray(c,cwLerp(r0.tray[0],CW_TRAYAT[0],te),cwLerp(r0.tray[1],CW_TRAYAT[1],te)-90*Math.sin(Math.PI*tl),cwLerp(ta0,0,te)+(spin>0?.12*Math.sin(spin*16)*Math.exp(-spin*2.2):.4*Math.sin(Math.PI*tl)),Math.cos(CW_TAU*2*tl));
  pile.at.forEach((p,i)=>{const nm=p.name,isJ=nm==='jelly',at=isJ?T.jelly:T.fall+CB_FALL+i*CB_FALL_GAP,u=Kclamp((t-T.fall)/(at-T.fall)),e=Ksmooth(u),after=t-at;
   const to=isJ?me.hat:nm==='cup'?[me.hand[0],me.hand[1]-6]:CW_LAND[nm],arc=Math.max(0,Math.min(isJ?220:120+40*i,p.y-80))*Math.sin(Math.PI*u);
   const bounce=after>=0&&nm==='melon'?Math.abs(Math.sin(after*7))*26*Math.exp(-after*3):0,turn=(.7-.35*(i%3))*Math.sin(Math.PI*u);
   const ang=after>=0?(isJ||nm==='cup'?(isJ?me.tilt:0):0):p.a*(1-e)+turn;
   cwThing(c,nm,cwLerp(p.x,to[0],e),cwLerp(p.y,to[1],e)-arc-bounce,ang,{squash:after>=0?.2*cwSpring(after,7,24):0,wob:isJ?(after>=0?cwSpring(after,2.2,14)*1.3:.3*Math.sin(t*9)):0});});}
 // a soft puff of dust where the waiter sits down
 if(t>sat&&t<sat+.8){const p=Kclamp((t-sat)/.8);c.save();c.globalAlpha*=1-p;for(let i=0;i<6;i++){const a=Math.PI*(.95+.22*i);cwInk(c,cc=>cwEll(cc,CW_SITX+Math.cos(a)*(70+50*p),CW_GY+10+Math.sin(a)*(10+8*p),12+8*p,8+4*p),'#fbf6ea',2);}c.restore();}
 return Kbump(t,.32,.22);}

// ── The scene ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
function cwScene(c,W,k,decor,round,count,steps,t,idle,reduced){const H=CW_HEROES[CB_HEROES[round.hero]],banana=CB_SLIPS[round.slip]==='banana';
 if(decor.fade>0)escBlit(c,`cw-back|${round.v}|${W.toFixed(1)}${escDecorKey(decor)}`,W,720,escVeiled(decor,(sc,sw)=>{cwBack(sc,sw,round,k);escGrain(sc,sw,720,.2);}));
 c.save();c.translate(W/2,720);c.scale(k,k);c.translate(0,-720);
 cwProps(c,round,decor,W/2/k+40);
 let open=0;
 if(count<=0){// before the first press: the waiter waits with the empty tray
  const idl=reduced?0:idle,P={x:CW_WX,y:CW_GY,mood:'smile',look:[0,0],blink:!reduced&&(idle*.8)%3.6<.1,lean:.02*Math.sin(idl*1.4)};if(H.tail)P.swing=Math.sin(idl*2)*.3;
  if(banana)cwThing(c,'_banana',CW_WX+92,CW_GY-4,0,{});
  const r=cwHero(c,H,P);cwTray(c,r.tray[0],r.tray[1],0);}
 else{const step=cbStep(round.v,count,steps);
  if(!step.final&&banana)cwThing(c,'_banana',CW_WX+92,CW_GY-4,0,{});
  open=(step.final?cwFinal:cwStep)(c,H,round,step,t,idle,reduced);}
 cwLeaf(c,round,Kclamp(open*1.4));
 c.restore();}

// o: variant, count, steps, t (seconds into the press; 1e3 when it is over), idle, from (the last round), reduced, preview, and the
// decor settings. The card of the home page: four things in the middle of a struggle.
export function drawCambrer(c,w,h,o){escFrame();const S=h/720,W=w/S,decor=escDecor(o),k=Math.min(Kclamp(W/1280,.62,1),W/1150);CW_LIFT=!decor.white&&decor.fade<.5;
 const round=cbRound(o.variant),steps=o.preview?7:o.steps||5,count=o.preview?4:Math.max(0,Math.min(o.count||0,steps)),t=o.preview?2.3:o.t??1e3,idle=o.reduced?0:o.idle||0;
 c.save();c.scale(S,S);if(decor.fade<1){c.fillStyle=decor.base;c.fillRect(0,0,W,720);}
 cwScene(c,W,k,decor,round,count,steps,t,idle,!!o.reduced);
 // a new round: the last place, with everything where it landed, fades away over the new one
 const old=o.from!==undefined&&count===1&&o.from!==o.variant?cbRound(o.from):null,fu=old?Ksmooth(t/1.2):1;
 if(old&&fu<1){const draw=cc=>{if(decor.fade<1){cc.fillStyle=decor.base;cc.fillRect(0,0,W,720);}cwScene(cc,W,k,decor,old,steps,steps,1e3,idle,true);};
  const cv=c.canvas&&c.getTransform?cwFadeSheet(c.canvas.width,c.canvas.height):null,oc=cv?.getContext?.('2d');
  if(oc&&oc.setTransform){oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,cv.width,cv.height);oc.setTransform(c.getTransform());draw(oc);c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1-fu;c.drawImage(cv,0,0);c.restore();}
  else{c.save();c.globalAlpha*=1-fu;draw(c);c.restore();}}
 c.restore();CW_LIFT=false;return true;}
let CW_FADE=null;
function cwFadeSheet(w,h){if(!CW_FADE||CW_FADE.width!==w||CW_FADE.height!==h){if(CW_FADE)CW_FADE.width=CW_FADE.height=1;CW_FADE=escCanvas(w,h);}return CW_FADE;}
