// L'orquestra que es desperta (CE12), 0.14: the stage, drawn from code. Four places at nightfall (a town square, a theatre, a garden
// bandstand, a harbour), a stage floor with empty chairs and music stands, and six sections whose instruments wake up and play by
// themselves (no players, no faces). Each section brings a change that reaches far beyond its chair and stays: the harp lets threads of
// light fall over the whole width, the strings send bouncing dots across the floor, the marimba lights the floor tiles, the woodwinds
// release ribbons into the air, the brass unfold golden banners and the percussion makes the floor tremble with rings of light. The
// stage gets brighter with every section; the final fills it with light and a rain of paper notes, and then everything goes back to
// sleep for the next round. What does not move is drawn once into sheets (escenari.js).
import {K_TAU,Kclamp,Ksmooth,KeaseOut,KeaseBack,Krand,Kmix,Krgba} from './kaleido-base.js';
import {escAges,escBlit,escDecor,escDecorKey,escFrame,escGrain,escGlow,escGlowLayer,escGroups,escLight,escLightSheet,escVeil,escVeiled} from './escenari.js';
import {oqPlan,oqRound,OQ_STEP_MIN} from './orquestra.js';

// Stations of the six sections (harp, strings, woodwinds, brass, percussion, marimba) in stage units: the screen is 1000 units high
// and x = 0 is its centre. Narrow screens bring the stations closer together.
const OV_ST=Object.freeze([{x:-628,y:910,s:1.12},{x:-372,y:822,s:1.04},{x:-130,y:736,s:.98},{x:136,y:736,s:.98},{x:388,y:822,s:1.04},{x:632,y:910,s:1.08}]);
const OV_VP=200,OV_BACK=620,OV_FRONT=945;
function Ovgeo(w,h){const u=h/1000,hw=w/(2*u),f=Kclamp((hw-220)/640,.42,.96),k=.62+.38*f;return {w,h,u,hw,f,st:OV_ST.map(p=>({x:p.x*f,y:p.y,s:p.s*k}))};}
const Ovunits=(c,G,fn)=>{c.save();c.translate(G.w/2,0);c.scale(G.u,G.u);fn(c);c.restore();};
// The floor is seen in perspective: a line that meets the front edge at xf passes through the vanishing point.
const Ovfx=(xf,y)=>xf*(y-OV_VP)/(OV_FRONT-OV_VP);
const OV_VIVID=Object.freeze(['#ff4d6d','#ff9f1c','#ffd23f','#3bceac','#2ec4f1','#5a7bff','#b15cff','#ff6fb5']);
const OV_PLACES=Object.freeze([
 {sky:['#1d2766','#45398f','#a9579a','#ff9f73'],night:'#7b74c2',floor:['#d99b5f','#b47445','#8a5530'],lip:'#7a3f24',chair:'#6e4126',seat:'#8f5a36'},
 {sky:['#2a1240','#4a1a55','#6b2458','#7f2f5a'],night:'#8c6aaa',floor:['#c07a40','#9b5e2e','#6f4020'],lip:'#2e1610',chair:'#5c1426',seat:'#c22a45'},
 {sky:['#172f68','#2f55a3','#8572b9','#ffb487'],night:'#7190c8',floor:['#f1e8d0','#d8cba8','#b5a682'],lip:'#3f8f5f',chair:'#2f6b55',seat:'#47a37e'},
 {sky:['#0b1d4b','#1c428a','#5a5aab','#ff9476'],night:'#6a8ccc',floor:['#a46f48','#835536','#5f3c24'],lip:'#4a2e1c',chair:'#e9e4d4',seat:'#2f78b8'}
]);
function Ovsky(c,G,cols,y1){const g=c.createLinearGradient(0,0,0,y1);cols.forEach((col,i)=>g.addColorStop(i/(cols.length-1),col));c.fillStyle=g;c.fillRect(-G.hw-2,0,2*G.hw+4,y1+2);}
export function Ovpoly(c,pts,fill){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();}
export function Ovcircle(c,x,y,r,fill){c.beginPath();c.arc(x,y,Math.max(.01,r),0,K_TAU);c.fillStyle=fill;c.fill();}
export function Ovell(c,x,y,rx,ry,fill,rot=0){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot,0,K_TAU);c.fillStyle=fill;c.fill();}
export function Ovrect(c,x,y,w,h,fill,r=0){c.beginPath();if(r>0&&c.roundRect)c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));else c.rect(x,y,w,h);c.fillStyle=fill;c.fill();}
export function Ovline(c,pts,color,width){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
// A cut-paper piece: the shape, with a soft shadow below it (sheets only, where it is drawn once).
export function Ovpaper(c,draw,fill,lift=6){c.save();c.shadowColor='rgba(18,10,40,.38)';c.shadowBlur=lift*1.6;c.shadowOffsetY=lift*.6;draw();c.fillStyle=fill;c.fill();c.restore();}
const Ovsag=(x,x0,x1,y0,sag)=>y0+sag*(1-Math.pow(2*(x-x0)/(x1-x0)-1,2));
function Ovstars(c,G,n,seed,y1,color='#fff6d8'){for(let i=0;i<n;i++){const x=(Krand(i,seed)*2-1)*G.hw,y=12+Krand(i+300,seed)*y1,r=.8+Krand(i+600,seed)*1.8;Ovcircle(c,x,y,r,Krgba(color,.5+Krand(i+900,seed)*.5));}}

// ── The four places ──────────────────────────────────────────────────────────────────────────────────────────────────────
// Each place gives its backdrop, its foreground and its lamps (windows, bulbs, lanterns), which glow in the dark and light what is near.
const OV_PLACE=new Map();
function Ovplace(place,G){const id=`${place}|${Math.round(G.hw)}`;if(OV_PLACE.has(id))return OV_PLACE.get(id);const P=OV_PLACES[place],lamps=[],hw=G.hw;let back,front;
 if(place===0){
  // The town square: coloured houses with balconies and shutters, a bell tower, two plane trees and strings of bulbs.
  const houses=[];for(let x=-hw-70,i=0;x<hw+70;i++){const wd=150+Krand(i,3)*90,ht=215+Krand(i,4)*140;houses.push({x,wd,ht,col:['#ff7a59','#ffc145','#35c4a6','#f0609a','#5b8def','#ffd166','#a06bd8','#ff9f43'][i%8],roof:Math.floor(Krand(i,5)*3),i});x+=wd-6;}
  const wins=[];for(const H of houses){const cols=Math.max(1,Math.floor((H.wd-30)/52)),rows=Math.max(1,Math.floor((H.ht-70)/74));for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const x=H.x+(H.wd-cols*52)/2+k*52+15,y=OV_BACK-H.ht+42+r*74,lit=Krand(H.i*31+r*7+k,6)<.42;wins.push({x,y,lit,H,r});if(lit)lamps.push({x:x+11,y:y+16,r:26,color:'#ffcf70',a:.5});}}
  const tower={x:-hw*.4,wd:96,top:120},bulbs=[];
  for(let s=0;s<3;s++){const x0=-hw-30+s*(2*hw+60)/3,x1=x0+(2*hw+60)/3;for(let x=x0+24;x<x1-10;x+=44){const y=Ovsag(x,x0,x1,285+s%2*25,62);const col=['#fff2b3','#ff8fab','#ffd166','#8be9fd','#b9fbc0'][Math.round((x+hw)/44)%5];bulbs.push({x,y,col,x0,x1,s});lamps.push({x,y:y+8,r:15,color:col,a:.85,bulb:true});}}
  back=c=>{Ovsky(c,G,P.sky,OV_BACK);Ovstars(c,G,40,11,200);
   Ovpaper(c,()=>{c.beginPath();c.rect(tower.x-tower.wd/2,tower.top,tower.wd,OV_BACK-tower.top);},'#e9a35a',8);Ovpoly(c,[[tower.x-tower.wd/2-8,tower.top],[tower.x,tower.top-90],[tower.x+tower.wd/2+8,tower.top]],'#c4513a');
   Ovrect(c,tower.x-22,tower.top+30,44,60,'#3a2a55',20);Ovell(c,tower.x,tower.top+64,14,18,'#f2c14e');Ovcircle(c,tower.x,tower.top+150,24,'#fff1c9');Ovcircle(c,tower.x,tower.top+150,18,'#f0b35a');
   for(const H of houses){const top=OV_BACK-H.ht;Ovpaper(c,()=>{c.beginPath();c.rect(H.x,top,H.wd,H.ht+4);},H.col,7);
    if(H.roof===0)Ovpoly(c,[[H.x-8,top+2],[H.x+H.wd/2,top-56],[H.x+H.wd+8,top+2]],'#c4513a');else if(H.roof===1)Ovrect(c,H.x-6,top-10,H.wd+12,16,Kmix(H.col,'#ffffff',.35),3);else{Ovrect(c,H.x+H.wd*.2,top-26,H.wd*.6,28,H.col);Ovrect(c,H.x+H.wd*.2-5,top-32,H.wd*.6+10,10,Kmix(H.col,'#ffffff',.35),3);}}
   for(const W of wins){Ovrect(c,W.x-8,W.y-2,8,36,Kmix(W.H.col,'#1d2b55',.35));Ovrect(c,W.x+22,W.y-2,8,36,Kmix(W.H.col,'#1d2b55',.35));Ovrect(c,W.x,W.y,22,32,W.lit?'#ffd98a':'#2b2d58',3);if(W.r===1&&W.H.i%2===0)Ovline(c,[[W.x-10,W.y+36],[W.x+32,W.y+36]],'#26283f',4);}
   for(const side of [-1,1]){const x=side*(hw-110);Ovrect(c,x-12,430,24,190,'#6b4a32');for(let j=0;j<7;j++)Ovpaper(c,()=>{c.beginPath();c.arc(x+(Krand(j,side+20)-.5)*170,330+Krand(j,side+30)*120,62+Krand(j,side+40)*30,0,K_TAU);},['#2fb36b','#49c47a','#1e9a5a','#63d18c'][j%4],5);}
   for(let s=0;s<3;s++){const x0=-hw-30+s*(2*hw+60)/3,x1=x0+(2*hw+60)/3,pts=[];for(let x=x0;x<=x1;x+=12)pts.push([x,Ovsag(x,x0,x1,285+s%2*25,62)]);Ovline(c,pts,'#2a2140',2);}
   for(const b of bulbs){Ovline(c,[[b.x,b.y],[b.x,b.y+6]],'#2a2140',2);Ovell(c,b.x,b.y+12,7,9,b.col);}};
  front=c=>{for(const side of [-1,1]){const x=side*(hw-52);Ovpaper(c,()=>{c.beginPath();c.rect(x-7,470,14,540);},'#1f4a46',8);Ovrect(c,x-20,455,40,12,'#1f4a46',4);Ovpoly(c,[[x-22,455],[x,418],[x+22,455]],'#1f4a46');Ovrect(c,x-15,458,30,40,'#ffe29a',6);Ovrect(c,x-18,496,36,8,'#1f4a46',3);}};
  for(const side of [-1,1])lamps.push({x:side*(hw-52),y:478,r:56,color:'#ffd27a',a:.85});
 }else if(place===1){
  // The theatre: a painted sky with paper clouds, a moon and stars hung on threads, boxes with little lamps, a chandelier, and red
  // velvet curtains with a gold valance in front.
  for(const side of [-1,1])for(let tier=0;tier<3;tier++){const x0=side>0?Math.max(260,hw-270):-hw,x1=side>0?hw:-Math.max(260,hw-270);for(let x=x0+16;x<x1-50;x+=86)if(Math.abs(x+35)<hw-140)lamps.push({x:x+35,y:150+tier*150-30,r:14,color:'#ffcf80',a:.75});}
  const inner=Math.max(260,hw-270),clouds=[[-.62,170,1],[-.08,128,.8],[.42,190,1.1],[.82,120,.7]].map(([x,y,s])=>({x:x*inner,y,s})),hung=Array.from({length:7},(_,i)=>({x:(i/6*2-1)*inner*.86+(Krand(i,41)-.5)*60,y:70+Krand(i,42)*170,r:12+Krand(i,43)*8}));
  back=c=>{const g=c.createLinearGradient(0,0,0,OV_BACK);g.addColorStop(0,'#2a1240');g.addColorStop(1,'#5b1d4c');c.fillStyle=g;c.fillRect(-hw-2,0,2*hw+4,OV_BACK+2);
   const s=c.createLinearGradient(0,40,0,OV_BACK);s.addColorStop(0,'#2546b8');s.addColorStop(.6,'#4f86e8');s.addColorStop(1,'#a6d6ff');c.fillStyle=s;c.fillRect(-inner,40,2*inner,OV_BACK-40);
   for(let i=0;i<5;i++)Ovpaper(c,()=>{c.beginPath();c.ellipse((i-2)*inner*.5,OV_BACK-10,inner*.36,70+i%2*30,0,Math.PI,0);},['#3e7a68','#4a9a72','#3e7a68','#58a77c','#3e7a68'][i],5);
   for(const k of clouds){Ovline(c,[[k.x,40],[k.x,k.y-30*k.s]],'rgba(255,255,255,.55)',1.5);Ovpaper(c,()=>{c.beginPath();for(const [dx,dy,r] of [[-50,6,34],[-15,-12,42],[25,-4,36],[55,10,26],[0,14,40]])c.arc(k.x+dx*k.s,k.y+dy*k.s,r*k.s,0,K_TAU);},'#f6f2ff',6);}
   Ovline(c,[[150,40],[150,60]],'rgba(255,255,255,.55)',1.5);Ovpaper(c,()=>{c.beginPath();c.arc(150,95,36,0,K_TAU);c.arc(166,85,32,0,K_TAU,true);},'#ffe066',6);
   for(const st of hung){Ovline(c,[[st.x,40],[st.x,st.y-st.r]],'rgba(255,255,255,.5)',1.2);Ovpaper(c,()=>{c.beginPath();for(let j=0;j<10;j++){const a=j*Math.PI/5-Math.PI/2,r=j%2?st.r*.45:st.r;c.lineTo(st.x+Math.cos(a)*r,st.y+Math.sin(a)*r);}c.closePath();},'#ffd23f',4);}
   for(const side of [-1,1])for(let tier=0;tier<3;tier++){const x0=side>0?inner:-hw,x1=side>0?hw:-inner,y=150+tier*150;Ovrect(c,x0,y-70,x1-x0,140,'#41123d');
    for(let x=x0+16;x<x1-50;x+=86){Ovrect(c,x,y-55,70,90,'#22081f',30);Ovpaper(c,()=>{c.beginPath();c.rect(x-4,y+12,78,28);},'#c8233f',5);Ovrect(c,x-4,y+10,78,5,'#f2c14e');Ovcircle(c,x+35,y-30,4,'#ffe2a0');}}
   Ovline(c,[[0,0],[0,150]],'#c99a2e',3);Ovell(c,0,160,30,12,'#f2c14e');for(let a=0;a<7;a++){const x=(a-3)*40,y=168-Math.abs(a-3)*7;Ovline(c,[[0,160],[x*.6,y+16],[x,y]],'#f2c14e',3);Ovrect(c,x-3,y-12,6,12,'#fff3d6',2);Ovcircle(c,x,y-15,4,'#fff3c4');}};
  for(let a=0;a<7;a++)lamps.push({x:(a-3)*40,y:153-Math.abs(a-3)*7,r:15,color:'#fff0b8',a:.9});
  front=c=>{for(const side of [-1,1]){const x0=side*hw,x1=side*(hw-128);for(let k=0;k<6;k++){const xa=x0+(x1-x0)*k/6,xb=x0+(x1-x0)*(k+1)/6;const g=c.createLinearGradient(xa,0,xb,0);g.addColorStop(0,'#8c0d24');g.addColorStop(.5,'#e23a4f');g.addColorStop(1,'#8c0d24');
     c.beginPath();c.moveTo(xa,0);c.lineTo(xb,0);c.quadraticCurveTo(xb-side*30*(k/6),600,xb+side*10,1000);c.lineTo(xa,1000);c.closePath();c.fillStyle=g;c.fill();}
    Ovpaper(c,()=>{c.beginPath();c.ellipse(x1+side*8,600,14,22,0,0,K_TAU);},'#f2c14e',5);}
   const sw=150,n=Math.ceil(2*hw/sw)+1;c.beginPath();c.moveTo(-hw-10,0);for(let i=0;i<=n;i++){const x=-hw+i*sw;c.lineTo(x,0);}c.lineTo(hw+10,0);c.lineTo(hw+10,60);for(let i=n;i>=0;i--){const x=-hw+i*sw;c.quadraticCurveTo(x+sw/2,120,x,60);}c.closePath();c.fillStyle='#b3122e';c.fill();
   Ovrect(c,-hw-4,0,2*hw+8,22,'#f2c14e');for(let i=0;i<=n;i++)Ovell(c,-hw+i*sw,64,9,14,'#f2c14e');
   for(let x=-hw+60;x<hw;x+=120){Ovrect(c,x-14,952,28,10,'#1a0c08',4);lamps.push({x,y:950,r:22,color:'#ffe0a0',a:.9,foot:true});}};
 }else if(place===2){
  // The garden: rolling hills, round trees (one in blossom), paper lanterns between the trees, a flowering hedge, and the columns and
  // scalloped roof of the bandstand in front.
  const trees=[];for(let i=0,x=-hw-40;x<hw+60;i++){trees.push({x,r:70+Krand(i,51)*40,y:400+Krand(i,52)*50,col:['#2fbf71','#ff8fb8','#1fa463','#ffb347','#3ccf88','#2a9d8f'][i%6],i});x+=150+Krand(i,53)*70;}
  const lant=[];for(let i=0;i<trees.length-1;i++){const a=trees[i],b=trees[i+1],x0=a.x,x1=b.x,y0=a.y-a.r*.3;for(let k=1;k<4;k++){const x=x0+(x1-x0)*k/4,y=Ovsag(x,x0,x1,y0,48);const col=['#ff5d73','#ffd166','#06d6a0','#4cc9f0','#b388eb'][(i*3+k)%5];lant.push({x,y,col,x0,x1,y0});lamps.push({x,y:y+16,r:26,color:col,a:.8});}}
  back=c=>{Ovsky(c,G,P.sky,OV_BACK);Ovstars(c,G,30,21,180);
   for(const [y,col,amp,seed] of [[470,'#3a6f8c',40,1],[520,'#2f8a68',34,2]]){c.beginPath();c.moveTo(-hw-5,OV_BACK);for(let x=-hw-5;x<=hw+5;x+=20)c.lineTo(x,y-amp*Math.sin(x/170+seed)-amp*.5*Math.sin(x/90+seed*2));c.lineTo(hw+5,OV_BACK);c.closePath();c.fillStyle=col;c.fill();}
   for(const T of trees){Ovrect(c,T.x-10,T.y,20,OV_BACK-T.y,'#6b4a32');for(let j=0;j<6;j++)Ovpaper(c,()=>{c.beginPath();c.arc(T.x+(Krand(j,T.i+60)-.5)*T.r*1.3,T.y-T.r*.4+(Krand(j,T.i+70)-.5)*T.r*.9,T.r*(.45+Krand(j,T.i+80)*.25),0,K_TAU);},Kmix(T.col,j%2?'#ffffff':'#0b3d2e',.12),5);}
   for(let i=0;i<trees.length-1;i++){const x0=trees[i].x,x1=trees[i+1].x,y0=trees[i].y-trees[i].r*.3,pts=[];for(let x=x0;x<=x1;x+=10)pts.push([x,Ovsag(x,x0,x1,y0,48)]);Ovline(c,pts,'#243048',1.6);}
   for(const L of lant){Ovline(c,[[L.x,L.y],[L.x,L.y+4]],'#243048',2);Ovpaper(c,()=>{c.beginPath();c.ellipse(L.x,L.y+18,13,16,0,0,K_TAU);},L.col,4);Ovrect(c,L.x-6,L.y+2,12,4,'#3a3a4a');}
   Ovpaper(c,()=>{c.beginPath();c.moveTo(-hw-5,OV_BACK+4);for(let x=-hw-5;x<=hw+5;x+=30)c.lineTo(x,585-8*Math.sin(x/23));c.lineTo(hw+5,OV_BACK+4);c.closePath();},'#2e8b57',5);
   for(let i=0;i<80;i++){const x=(Krand(i,91)*2-1)*hw,y=590+Krand(i,92)*25;Ovcircle(c,x,y,4+Krand(i,93)*3,['#ff6fb5','#ffd23f','#ffffff','#ff9f1c'][i%4]);}};
  front=c=>{for(const side of [-1,1]){const x=side*(hw-48);Ovpaper(c,()=>{c.beginPath();c.rect(x-13,60,26,900);},'#f4f1e8',8);Ovrect(c,x-20,940,40,20,'#d8d2c0',4);Ovrect(c,x-19,70,38,16,'#d8d2c0',4);
    Ovpaper(c,()=>{c.beginPath();c.moveTo(x-side*120-38,1000);c.lineTo(x-side*120-28,930);c.lineTo(x-side*120+28,930);c.lineTo(x-side*120+38,1000);c.closePath();},'#d9643a',6);
    for(let j=0;j<7;j++)Ovpaper(c,()=>{c.beginPath();c.arc(x-side*120+(j-3)*13,915-Math.abs(j-3)*6-Krand(j,side+5)*20,15,0,K_TAU);},j%2?'#ff6fb5':'#3bb273',4);}
   c.beginPath();c.moveTo(-hw-5,0);c.lineTo(hw+5,0);c.lineTo(hw+5,58);const sw=90,n=Math.ceil(2*hw/sw)+1;for(let i=n;i>=0;i--){const x=-hw+i*sw;c.quadraticCurveTo(x+sw/2,104,x,58);}c.closePath();c.fillStyle='#f4f1e8';c.fill();
   Ovrect(c,-hw-5,0,2*hw+10,30,'#3f8f5f');for(let i=0;i<=n;i++)Ovcircle(c,-hw+i*sw,60,6,'#ff6fb5');};
 }else{
  // The harbour: the moon, a far coast with small lights, a lighthouse, the sea with reflections and sailing boats, and bollards with
  // ropes and a lantern in front.
  const boats=[[-.78,560,1,'#ef476f'],[-.3,525,.75,'#ffd166'],[.18,575,1.15,'#06d6a0'],[.5,535,.8,'#5a7bff']].map(([x,y,s,col],i)=>({x:x*hw,y,s,col,i}));const moon={x:hw*.42,y:118};
  const town=Array.from({length:22},(_,i)=>({x:(Krand(i,71)*1.6-1)*hw,y:440+Krand(i,72)*16}));for(const t of town)lamps.push({x:t.x,y:t.y,r:9,color:'#ffd27a',a:.7});
  lamps.push({x:moon.x,y:moon.y,r:110,color:'#fff3c4',a:.45});const lh={x:hw*.8,y:300};lamps.push({x:lh.x,y:lh.y,r:70,color:'#fff1b0',a:.9});for(const b of boats)lamps.push({x:b.x+30*b.s,y:b.y-60*b.s,r:14,color:'#ffcf70',a:.85});
  back=c=>{Ovsky(c,G,P.sky,470);Ovstars(c,G,70,31,330);Ovcircle(c,moon.x,moon.y,52,'#fff3c4');Ovcircle(c,moon.x-14,moon.y-10,9,'#f3e2a8');Ovcircle(c,moon.x+18,moon.y+14,6,'#f3e2a8');
   c.beginPath();c.moveTo(-hw-5,470);for(let x=-hw-5;x<=hw*.7;x+=20)c.lineTo(x,440-26*Math.sin(x/160)-14*Math.sin(x/61));c.lineTo(hw*.7,470);c.closePath();c.fillStyle='#2b2f6e';c.fill();
   for(const t of town)Ovrect(c,t.x-3,t.y-3,6,6,'#ffd98a',1);
   Ovpaper(c,()=>{c.beginPath();c.ellipse(lh.x,470,150,60,0,Math.PI,0);},'#3b3f6b',6);
   for(let k=0;k<5;k++){const y0=440-k*28,y1=y0-28,w0=22-k*1.6,w1=w0-1.6;Ovpoly(c,[[lh.x-w0,y0],[lh.x-w1,y1],[lh.x+w1,y1],[lh.x+w0,y0]],k%2?'#ef476f':'#f7f7f2');}
   Ovrect(c,lh.x-15,lh.y-14,30,22,'#ffe9a8',3);Ovpoly(c,[[lh.x-20,lh.y-14],[lh.x,lh.y-36],[lh.x+20,lh.y-14]],'#ef476f');
   const s=c.createLinearGradient(0,470,0,OV_BACK);s.addColorStop(0,'#1f4592');s.addColorStop(1,'#3a86cc');c.fillStyle=s;c.fillRect(-hw-2,470,2*hw+4,OV_BACK-470+2);
   for(let i=0;i<60;i++){const y=478+Krand(i,81)*135,x=(Krand(i,82)*2-1)*hw,near=Math.abs(x-moon.x)<70;Ovline(c,[[x-18-Krand(i,83)*30,y],[x+18,y]],near?'rgba(255,243,196,.7)':'rgba(170,215,255,.35)',2.2);}
   for(const b of boats){const s=b.s;c.save();c.globalAlpha=.25;c.translate(b.x,b.y);c.scale(s,-s*.7);Ovpoly(c,[[-60,0],[60,0],[44,22],[-46,22]],b.col);c.restore();
    Ovline(c,[[b.x,b.y-4],[b.x,b.y-120*s]],'#3a2a20',3*s);Ovpaper(c,()=>{c.beginPath();c.moveTo(b.x+4*s,b.y-116*s);c.lineTo(b.x+4*s,b.y-12*s);c.lineTo(b.x+62*s,b.y-12*s);c.closePath();},'#fbf7ea',5);
    Ovpaper(c,()=>{c.beginPath();c.moveTo(b.x-4*s,b.y-100*s);c.lineTo(b.x-4*s,b.y-16*s);c.lineTo(b.x-44*s,b.y-16*s);c.closePath();},Kmix(b.col,'#ffffff',.55),5);
    Ovpoly(c,[[b.x,b.y-120*s],[b.x+22*s,b.y-113*s],[b.x,b.y-106*s]],OV_VIVID[b.i+2]);Ovpaper(c,()=>{c.beginPath();c.moveTo(b.x-64*s,b.y-6*s);c.lineTo(b.x+66*s,b.y-6*s);c.lineTo(b.x+46*s,b.y+18*s);c.lineTo(b.x-48*s,b.y+18*s);c.closePath();},b.col,6);
    Ovcircle(c,b.x+30*s,b.y-60*s,4*s,'#ffe29a');}};
  front=c=>{for(const side of [-1,1]){const x=side*(hw-70);Ovpaper(c,()=>{c.beginPath();c.rect(x-26,880,52,140);},'#3b2a20',8);Ovell(c,x,880,26,9,'#5a4030');for(let j=0;j<3;j++)Ovline(c,[[x-28,915+j*12],[x+28,920+j*12]],'#d9b77a',5);}
   const x=-hw+30;Ovpaper(c,()=>{c.beginPath();c.rect(x-6,430,12,580);},'#22323f',6);Ovrect(c,x-16,430,32,40,'#ffe29a',6);Ovpoly(c,[[x-20,432],[x,404],[x+20,432]],'#22323f');};
  lamps.push({x:-hw+30,y:450,r:52,color:'#ffd27a',a:.85});
 }
 const out={back,front,lamps};OV_PLACE.set(id,out);if(OV_PLACE.size>8)OV_PLACE.delete(OV_PLACE.keys().next().value);return out;}

// ── The stage floor, the chairs and the music stands ─────────────────────────────────────────────────────────────────────────
const OV_CHAIRS=Object.freeze([[[62,-4]],[[-58,0],[52,6]],[[-52,0],[46,4]],[[-72,0],[0,6],[72,0]],[],[]]);
const OV_STANDS=Object.freeze([[],[[-4,40]],[[0,38]],[[-36,40],[40,40]],[[0,46]],[]]);
function Ovchair(c,x,y,s,P){c.save();c.translate(x,y);c.scale(s,s);Ovline(c,[[-20,0],[-22,-44]],P.chair,5);Ovline(c,[[20,0],[22,-44]],P.chair,5);Ovline(c,[[-14,-4],[-16,-40]],P.chair,4);Ovline(c,[[16,-4],[18,-40]],P.chair,4);
 Ovrect(c,-27,-52,54,12,P.seat,5);Ovline(c,[[-20,-52],[-22,-112]],P.chair,5);Ovline(c,[[20,-52],[22,-112]],P.chair,5);Ovrect(c,-26,-118,52,30,P.seat,8);c.restore();}
function Ovstand(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);Ovline(c,[[-16,0],[0,-12],[16,0]],'#2d2b3a',3);Ovline(c,[[0,-12],[0,-104]],'#2d2b3a',3);Ovpoly(c,[[-30,-150],[30,-150],[34,-104],[-34,-104]],'#2d2b3a');Ovrect(c,-24,-146,48,36,'#f3ecd8',2);c.restore();}
function Ovfloor(c,G,place){const P=OV_PLACES[place],hw=G.hw,[c0,c1,c2]=P.floor;
 const g=c.createLinearGradient(0,OV_BACK,0,OV_FRONT);g.addColorStop(0,Kmix(c1,'#000000',.15));g.addColorStop(1,c0);c.fillStyle=g;c.fillRect(-hw-2,OV_BACK,2*hw+4,OV_FRONT-OV_BACK);
 for(let xf=-hw*2;xf<=hw*2;xf+=78)Ovline(c,[[Ovfx(xf,OV_BACK),OV_BACK],[xf,OV_FRONT]],Krgba(c2,.55),1.6);
 for(const y of [650,690,742,808,890])Ovline(c,[[-hw,y],[hw,y]],Krgba(c2,.35),1.2);
 Ovrect(c,-hw-2,OV_BACK-8,2*hw+4,10,Kmix(c2,'#000000',.3));
 Ovrect(c,-hw-2,OV_FRONT,2*hw+4,60,P.lip);
 if(place===0)for(let x=-hw-40,i=0;x<hw+40;x+=56,i++){Ovpoly(c,[[x,OV_FRONT],[x+56,OV_FRONT],[x+28,OV_FRONT+40]],i%2?'#ffd166':'#ef476f');}
 if(place===2)Ovrect(c,-hw-2,OV_FRONT,2*hw+4,8,'#f4f1e8');
 if(place===3)for(let x=-hw;x<hw;x+=140)Ovcircle(c,x,OV_FRONT+28,5,'#2b1a10');
 for(let s=0;s<6;s++){const st=G.st[s];for(const [dx,dy] of OV_STANDS[s])Ovstand(c,st.x+dx*st.s,st.y-dy*st.s*.2+18*st.s,st.s);for(const [dx,dy] of OV_CHAIRS[s])Ovchair(c,st.x+dx*st.s,st.y+dy*st.s-20*st.s,st.s*.95,P);}}

// ── Instruments ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each instrument is drawn in its own units (the base at 0, up is negative y). S: the state of the section this frame: its wake, the
// notes it is playing (recent hits with their age), the motion clock and a list E of glows to draw after the light.
const OV_GOLD=['#fff0a8','#f4c542','#d99a1e','#a86f10'];
function Ovbrass(c,x0,y0,x1,y1){const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,OV_GOLD[0]);g.addColorStop(.4,OV_GOLD[1]);g.addColorStop(.8,OV_GOLD[2]);g.addColorStop(1,OV_GOLD[3]);return g;}
const Ovhits=(S,from,len=.7)=>S.hits.filter(h=>h.age>=from&&h.age<len);
// Harp: the column, the curved neck, the soundboard and fifteen strings (red C and blue F strings, as on a concert harp).
const OvneckY=x=>{const s=(x+58)/158;return -365+62*s-22*Math.sin(K_TAU*s);};
function Ovharp(c,S){c.save();Ovell(c,10,2,95,12,'rgba(20,10,30,.35)');
 const sb=x=>-36-260*((x+24)/124);
 Ovpoly(c,[[-30,-28],[-6,-44],[108,-300],[92,-292]],'#e8743b');Ovpoly(c,[[-22,-34],[-12,-40],[100,-296],[96,-293]],'#ff9b5c');
 const strings=[];for(let i=0;i<15;i++){const x=-14+i*7.6;strings.push([x,sb(x)-4,OvneckY(x)+8]);}
 const hit=new Array(15).fill(0);for(const h of Ovhits(S,0,1.2)){const i=Math.round(Kclamp((h.midi-41)/48)*14);hit[i]=Math.max(hit[i],h.vel*Math.exp(-h.age*3.2));}
 strings.forEach(([x,yb,yt],i)=>{const col=i%7===0?'#ff4d6d':i%7===3?'#4d7cff':'#fff4dc',a=hit[i]*5*(S.reduced?0:1),ph=S.t*55+i;c.beginPath();c.moveTo(x,yb);c.quadraticCurveTo(x+a*Math.sin(ph),(yb+yt)/2,x,yt);c.strokeStyle=col;c.lineWidth=1.8;c.stroke();
  if(hit[i]>.02)S.E.push(cc=>{cc.beginPath();cc.moveTo(x,yb);cc.quadraticCurveTo(x+a*Math.sin(ph),(yb+yt)/2,x,yt);cc.strokeStyle=Krgba('#ffe9a0',Kclamp(hit[i]*1.6));cc.lineWidth=5;cc.stroke();});});
 const top=[];for(let x=-60;x<=104;x+=6)top.push([x,OvneckY(x)-10]);const bot=[];for(let x=104;x>=-60;x-=6)bot.push([x,OvneckY(x)+8]);Ovpoly(c,[...top,...bot],Ovbrass(c,-60,-380,104,-300));
 Ovrect(c,-72,-366,26,330,Ovbrass(c,-72,0,-46,0),6);Ovcircle(c,-59,-374,17,OV_GOLD[1]);Ovcircle(c,-59,-374,9,OV_GOLD[0]);Ovpoly(c,[[-70,-388],[-59,-412],[-48,-388]],OV_GOLD[2]);
 Ovrect(c,-86,-42,118,42,Ovbrass(c,-86,-42,32,0),8);Ovrect(c,-80,-10,106,8,OV_GOLD[3],3);c.restore();}
// A bowed instrument (cello or violin): body, f-holes, fingerboard, strings and scroll, at height H (body) from its foot.
function Ovviol(c,H,col){const half=yn=>{const e=Math.pow(Math.max(0,1-Math.pow(2*yn,2)),.32);return H*(.27+.13*Math.exp(-Math.pow((yn-.2)/.17,2))+.08*Math.exp(-Math.pow((yn+.24)/.15,2))-.05*Math.exp(-Math.pow(yn/.07,2)))*e;};
 const pts=[];for(let i=0;i<=24;i++){const yn=-.5+i/24;pts.push([half(yn),yn*H]);}for(let i=24;i>=0;i--){const yn=-.5+i/24;pts.push([-half(yn),yn*H]);}
 const g=c.createRadialGradient(-H*.1,-H*.1,H*.05,0,0,H*.6);g.addColorStop(0,Kmix(col,'#ffd29a',.35));g.addColorStop(.6,col);g.addColorStop(1,Kmix(col,'#3a1408',.45));Ovpoly(c,pts,g);
 for(const side of [-1,1]){c.beginPath();c.moveTo(side*H*.13,-H*.1);c.bezierCurveTo(side*H*.08,-H*.02,side*H*.18,H*.06,side*H*.12,H*.14);c.strokeStyle='#2a0e05';c.lineWidth=H*.018;c.stroke();}
 Ovrect(c,-H*.05,-H*1.02,H*.1,H*.82,'#221c26',H*.03);Ovrect(c,-H*.1,H*.02,H*.2,H*.04,'#f0d7a6',2);Ovpoly(c,[[-H*.06,H*.22],[H*.06,H*.22],[H*.04,H*.44],[-H*.04,H*.44]],'#221c26');
 for(let k=0;k<4;k++){const x=(k-1.5)*H*.024;Ovline(c,[[x*1.6,H*.42],[x,-H*.98]],'#f5ecd9',Math.max(.6,H*.006));}
 Ovcircle(c,0,-H*1.08,H*.07,Kmix(col,'#000000',.2));Ovcircle(c,H*.02,-H*1.1,H*.035,Kmix(col,'#ffd29a',.3));}
function Ovstrings(c,S){c.save();Ovell(c,-10,2,80,10,'rgba(20,10,30,.35)');const lead=S.lead,bow=S.reduced?0:Math.sin(S.idle*2.4)*(lead?24:4);
 c.save();c.translate(-12,-118);c.rotate(.08+S.sway);Ovline(c,[[0,118],[0,96]],'#c9c9d4',3);Ovviol(c,150,'#c75b2a');c.restore();
 for(const [x,y,r,col,ph] of [[62,-228,-.55,'#d9792e',0],[-92,-246,.5,'#e08a3a',1.7]]){c.save();c.translate(x,y+(S.reduced?0:Math.sin(S.idle*1.3+ph)*5));c.rotate(r+S.sway);Ovviol(c,62,col);
  c.save();c.translate(0,8);c.rotate(-r*1.2+.9);c.translate(bow*(ph?-1:1),0);Ovline(c,[[-62,0],[62,0]],'#7a4a24',2.6);Ovline(c,[[-58,4],[58,4]],'#fbf3df',1.4);Ovrect(c,-66,-3,9,10,'#2a1a10',2);c.restore();c.restore();}
 for(const h of Ovhits(S,0,.5)){const a=h.vel*Math.exp(-h.age*6),x=-12+(Krand(h.time*97,3)-.5)*40,y=-160+Krand(h.time*53,4)*60;S.E.push(cc=>escGlow(cc,x,y,22,'#ffe8b0',a*1.4));}
 c.restore();}
// Woodwinds: a flute, a clarinet and an oboe floating at different heights.
function Ovtube(c,len,width,col,keys,bell=0,bellCol=col){Ovrect(c,-len/2,-width/2,len,width,col,width/2);for(let k=0;k<keys;k++)Ovcircle(c,-len*.3+k*len*.6/Math.max(1,keys-1),0,width*.32,'#e8edf6');if(bell)Ovpoly(c,[[len/2-6,-width/2],[len/2+bell*.6,-bell],[len/2+bell*.6,bell],[len/2-6,width/2]],bellCol);}
function Ovwinds(c,S){c.save();Ovell(c,0,2,90,10,'rgba(20,10,30,.28)');const bob=k=>S.reduced?0:Math.sin(S.idle*1.4+k*1.9)*6;
 c.save();c.translate(0,-200+bob(0));c.rotate(-.12+S.sway);const fg=c.createLinearGradient(0,-6,0,6);fg.addColorStop(0,'#f7f9fd');fg.addColorStop(.5,'#c3cbd9');fg.addColorStop(1,'#8d97ab');Ovtube(c,210,11,fg,9);Ovell(c,-82,-6,8,4,'#dfe5ef');c.restore();
 c.save();c.translate(-50,-118+bob(1));c.rotate(1.28+S.sway);Ovtube(c,150,12,'#26242f',6,16,'#26242f');for(const x of [-40,10,52])Ovrect(c,x,-7,4,14,'#c9ced8',1);c.restore();
 c.save();c.translate(56,-126+bob(2));c.rotate(1.86+S.sway);Ovtube(c,130,10,'#4a2a1a',5,9,'#4a2a1a');for(const x of [-30,20])Ovrect(c,x,-6,4,12,'#c9ced8',1);c.restore();
 for(const h of Ovhits(S,0,1)){const a=h.vel*Math.exp(-h.age*2.4),x=100+h.age*60,y=-215-h.age*70+Math.sin(h.age*9)*8;S.E.push(cc=>{escGlow(cc,x,y,16,'#c8f7ff',a*1.3);});}
 c.restore();}
// Brass: a trumpet, a horn and a tuba; their bells shine when they play.
function Ovbrassband(c,S){c.save();Ovell(c,10,2,110,12,'rgba(20,10,30,.3)');const lift=k=>S.reduced?0:Math.sin(S.idle*1.2+k*2.1)*4-S.act*6;
 c.save();c.translate(-78,-178+lift(0));c.rotate(-.1+S.sway);const g=Ovbrass(c,0,-14,0,14);Ovrect(c,-70,-4,104,8,g,4);Ovrect(c,-40,8,60,7,g,3);for(const x of [-20,-6,8])Ovrect(c,x,-16,9,30,g,2);
  Ovpoly(c,[[30,-5],[70,-24],[70,24],[30,5]],g);Ovell(c,70,0,5,24,OV_GOLD[0]);Ovrect(c,-78,-3,10,6,OV_GOLD[2],2);c.restore();
 c.save();c.translate(10,-118+lift(1));c.rotate(S.sway);c.beginPath();c.arc(0,0,36,0,K_TAU);c.strokeStyle=Ovbrass(c,-36,-36,36,36);c.lineWidth=10;c.stroke();c.beginPath();c.arc(0,0,21,0,K_TAU);c.lineWidth=6;c.stroke();
  Ovpoly(c,[[24,20],[58,52],[78,30],[30,12]],Ovbrass(c,24,10,80,50));Ovell(c,70,42,8,26,OV_GOLD[0],-.8);c.restore();
 c.save();c.translate(102,-40+lift(2)*.6);c.rotate(S.sway*.6);const t=Ovbrass(c,-26,0,26,0);Ovrect(c,-24,-130,48,128,t,22);Ovpoly(c,[[-20,-120],[-52,-196],[40,-196],[18,-120]],t);Ovell(c,-6,-196,46,10,OV_GOLD[0]);Ovell(c,-6,-196,36,6,OV_GOLD[3]);
  for(const y of [-92,-74,-56])Ovrect(c,22,y,16,10,OV_GOLD[2],3);Ovline(c,[[-24,-60],[-46,-70],[-50,-100]],OV_GOLD[2],6);c.restore();
 if(S.act>.02){const a=S.act;S.E.push(cc=>{escGlow(cc,-8,-178,44,'#fff1a8',a*.8);escGlow(cc,82,-82,40,'#fff1a8',a*.6);escGlow(cc,96,-236,58,'#fff1a8',a*.7);});}
 c.restore();}
// Percussion: two timpani with their mallets, a glockenspiel and a triangle.
function Ovkettle(c,x,r,y){Ovline(c,[[x-r*.7,y+r*.7],[x-r*.8,0]],'#555b6e',4);Ovline(c,[[x+r*.7,y+r*.7],[x+r*.8,0]],'#555b6e',4);Ovline(c,[[x,y+r*.9],[x,0]],'#555b6e',4);
 const g=c.createLinearGradient(x-r,0,x+r,0);g.addColorStop(0,'#8a4a14');g.addColorStop(.35,'#f0a050');g.addColorStop(.6,'#d9822b');g.addColorStop(1,'#7a3d10');c.beginPath();c.ellipse(x,y,r,r*.95,0,0,Math.PI);c.closePath();c.fillStyle=g;c.fill();
 Ovell(c,x,y,r+3,r*.25+2,'#c7cbd6');Ovell(c,x,y,r,r*.25,'#f6efe0');}
function Ovpercussion(c,S){c.save();Ovell(c,0,4,130,14,'rgba(20,10,30,.32)');const K=[[-58,58,-92],[52,50,-84]];for(const [x,r,y] of K)Ovkettle(c,x,r,y);
 for(const h of Ovhits(S,0,1.4).filter(h=>h.inst==='timpaniRec')){const k=Krand(h.time*31,2)<.5?0:1,[x,r,y]=K[k],a=h.vel*Math.exp(-h.age*2);S.E.push(cc=>{for(let j=0;j<2;j++){const q=Kclamp(h.age*1.6-j*.25);if(q<=0)continue;cc.beginPath();cc.ellipse(x,y,r*q,r*.25*q,0,0,K_TAU);cc.strokeStyle=Krgba('#fff2c0',a*(1-q));cc.lineWidth=3;cc.stroke();}});}
 const last=S.hits.filter(h=>h.inst==='timpaniRec'&&h.age>=-.15).reduce((m,h)=>Math.min(m,Math.abs(h.age+.04)),1);const down=S.reduced?0:Math.exp(-last*14);
 for(const [k,sg] of [[0,-1],[1,1]]){const [x,r,y]=K[k],a=-.5*sg-.9*down*sg;c.save();c.translate(x+sg*r*.2,y-70);c.rotate(a*.5);Ovline(c,[[0,0],[sg*8,62]],'#e8d7b5',4);Ovcircle(c,sg*8,66,9,'#f4efe6');c.restore();}
 c.save();c.translate(-4,-212);Ovline(c,[[0,0],[0,-30],[60,-30]],'#555b6e',3);const sw=S.reduced?0:Math.sin(S.idle*2)*.12;c.rotate(sw);Ovline(c,[[0,0],[0,10]],'#d0d0d0',1);c.beginPath();c.moveTo(0,10);c.lineTo(-18,44);c.lineTo(18,44);c.closePath();c.strokeStyle='#e8ecf5';c.lineWidth=3.5;c.stroke();c.restore();
 c.save();c.translate(138,-122);c.scale(1.35,1.35);Ovline(c,[[-30,0],[-36,118]],'#555b6e',4);Ovline(c,[[30,0],[36,118]],'#555b6e',4);Ovpoly(c,[[-62,-8],[62,-20],[62,6],[-62,12]],'#d63447');
 const gl=Ovhits(S,0,.8).filter(h=>h.inst==='glockRec');for(let i=0;i<10;i++){const x=-54+i*12,hgt=30-i*1.4,lit=gl.some(h=>Math.round(Kclamp((h.midi-79)/24)*9)===i);Ovrect(c,x,-12-hgt/2+i*-1.2,9,hgt,Kmix('#eef2fa',OV_VIVID[i%8],.28),2);
  if(lit){const a=gl.filter(h=>Math.round(Kclamp((h.midi-79)/24)*9)===i).reduce((m,h)=>Math.max(m,h.vel*Math.exp(-h.age*4)),0);S.E.push(cc=>escGlow(cc,138+(x+4)*1.35,-122+(-12+i*-1.2)*1.35,30,'#ffffff',a*1.5));}}c.restore();
 c.restore();}
// Marimba: thirteen bars in the colours of the rainbow over gold resonators, and two mallets that go to the bar that sounds.
function Ovmarimba(c,S){c.save();Ovell(c,0,4,170,14,'rgba(20,10,30,.32)');Ovline(c,[[-150,0],[-150,-100]],'#5a3a26',8);Ovline(c,[[150,0],[150,-100]],'#5a3a26',8);Ovline(c,[[-150,-30],[150,-30]],'#5a3a26',6);
 for(let i=0;i<13;i++){const x=-138+i*22.5,len=88-i*3.4;Ovrect(c,x,-104,10,len*.7,Ovbrass(c,x,0,x+10,0),4);}
 Ovrect(c,-160,-116,320,12,'#6b4228',4);const hit=new Array(13).fill(0);for(const h of Ovhits(S,0,.7)){const i=Math.round(Kclamp((h.midi-55)/36)*12);hit[i]=Math.max(hit[i],h.vel*Math.exp(-h.age*5));}
 for(let i=0;i<13;i++){const x=-142+i*22.5,len=66-i*2.4;Ovpoly(c,[[x,-112],[x+20,-112],[x+18+len*.12,-112-len*.42],[x-2+len*.12,-112-len*.42]],Kmix(['#e63946','#f3722c','#f8961e','#f9c74f','#90be6d','#43aa8b','#4d908e','#277da1','#577590','#7b2cbf','#b5179e','#f72585','#ff6fb5'][i],'#ffffff',.12));
  if(hit[i]>.02){const a=hit[i];S.E.push(cc=>escGlow(cc,x+12,-126,38,'#fff6d0',a*1.6));}}
 const recent=S.hits.filter(h=>h.age>-.25&&h.age<1.5).sort((a,b)=>a.age-b.age);
 for(const [k,col] of [[0,'#ff4d6d'],[1,'#2ec4f1']]){const h=recent[k]||null,i=h?Math.round(Kclamp((h.midi-55)/36)*12):(k?9:3),x=-132+i*22.5,dn=h&&!S.reduced?Math.exp(-Math.abs(h.age)*12):0,y=-150+dn*24+(S.reduced?0:Math.sin(S.idle*2+k)*4);
  Ovline(c,[[x,y],[x+(k?16:-16),y-58]],'#d9b77a',4);Ovcircle(c,x,y,10,col);Ovcircle(c,x-3,y-3,3.5,Kmix(col,'#ffffff',.5));}
 c.restore();}
const OV_DRAW=[Ovharp,Ovstrings,Ovwinds,Ovbrassband,Ovpercussion,Ovmarimba];

// ── The effects that stay ───────────────────────────────────────────────────────────────────────────────────────────────
// Harp: threads of light fall over the whole width, one after another from the harp's side; each harp note makes its thread ring.
function Ovthreads(c,G,o,age,hits,R){const n=34,hw=G.hw;for(let i=0;i<n;i++){const x=(i/(n-1)*2-1)*hw*.98+(Krand(i,7)-.5)*30,end=300+Krand(i,8)*270,start=i/n*.9,g=Ksmooth((age-start)/.8),len=end*g*(1-R);if(len<2)continue;
 let ring=0;for(const h of hits){if(h.age<0||h.age>1.2)continue;const j=Math.round(Kclamp((h.midi-41)/48)*(n-1));if(j===i)ring=Math.max(ring,h.vel*Math.exp(-h.age*2.6));}
 const sway=o.reduced?0:Math.sin(o.idle*.7+i)*6,y0=R*-end;c.beginPath();c.moveTo(x,y0);c.quadraticCurveTo(x+sway+(o.reduced?0:ring*14*Math.sin(o.t*40+i)),y0+len/2,x+sway*.4,y0+len);const fresh=1-Ksmooth((age-start-.6)/1.6);c.strokeStyle=Krgba('#ffe38a',.34+.4*fresh+ring*.6);c.lineWidth=2.4+ring*3+fresh*1.6;c.stroke();
 if(fresh>.02||ring>.05)escGlow(c,x+sway*.4,y0+len,14+ring*16+fresh*14,'#fff3c0',.75*fresh+ring);Ovcircle(c,x+sway*.4,y0+len,3.2,Krgba('#fff8dc',.9));}}
// Strings: coloured dots bounce out across the floor and stay there, each hopping again on the plucked notes.
function Ovdots(c,G,o,age,hits,R,st){const n=16;for(let i=0;i<n;i++){const xf=(Krand(i,15)*2-1)*G.hw*.95,yy=660+Krand(i,16)*270,x1=Ovfx(xf,yy)*1,start=i*.08,q=Kclamp((age-start)/1.1);if(q<=0)continue;
 const x=st.x+(x1-st.x)*Ksmooth(q),hop=Math.abs(Math.sin(q*Math.PI*3))*(1-q)*160;let bounce=0;for(const h of hits){if(h.age<0||h.age>.6)continue;if(Math.round(Krand(h.time*41,9)*(n-1))===i)bounce=Math.max(bounce,Math.sin(Math.min(1,h.age/.5)*Math.PI)*h.vel*70);}
 const y=yy-hop-(o.reduced?0:bounce),r=(9+Krand(i,17)*8)*(.5+.5*(yy-OV_BACK)/(OV_FRONT-OV_BACK))*(1-R*.8),col=OV_VIVID[i%8],a=1-R;if(a<=0)continue;
 Ovell(c,x,yy,r*1.1,r*.32,Krgba('#000000',.25*a));escGlow(c,x,y,r*3,col,.45*a);Ovcircle(c,x,y,r,Krgba(Kmix(col,'#ffffff',.25),a));if(bounce>2)escGlow(c,x,yy,r*4,col,.25*a);}}
// Marimba: the floor tiles light up in a wave from the marimba, then glow with each note.
function Ovtiles(c,G,o,age,hits,R,st){const cols=14,rows=4,hw=G.hw,ys=[650,712,790,866,945];let tick=0;for(const h of hits)if(h.age>=0&&h.age<.5)tick=Math.max(tick,h.vel*Math.exp(-h.age*5));
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const xa=(i/cols*2-1)*hw*1.05,xb=((i+1)/cols*2-1)*hw*1.05,cx=Ovfx((xa+xb)/2,(ys[j]+ys[j+1])/2),d=Math.hypot(cx-st.x,((ys[j]+ys[j+1])/2-st.y)*1.5)/(2*hw),q=Ksmooth((age-d*1.4)/.5);if(q<=0)continue;
  let pulse=0;for(const h of hits){if(h.age<0||h.age>.6)continue;if(Math.round(Kclamp((h.midi-55)/36)*(cols-1))===i)pulse=Math.max(pulse,h.vel*Math.exp(-h.age*4));}
  const col=OV_VIVID[(i+j*3)%8],a=(.16+.2*pulse+.06*tick+(1-q)*.25*q*4)*q*(1-R);if(a<=.004)continue;
  c.beginPath();c.moveTo(Ovfx(xa,ys[j])+2,ys[j]+1);c.lineTo(Ovfx(xb,ys[j])-2,ys[j]+1);c.lineTo(Ovfx(xb,ys[j+1])-2,ys[j+1]-1);c.lineTo(Ovfx(xa,ys[j+1])+2,ys[j+1]-1);c.closePath();c.fillStyle=Krgba(col,a);c.fill();}}
// Woodwinds: ribbons fly out of the woodwinds and float in the air above the stage, rippling with the tune.
function Ovribbons(c,G,o,age,hits,R,st,dim){const hw=G.hw;let lift=0;for(const h of hits)if(h.age>=0&&h.age<.8)lift=Math.max(lift,h.vel*Math.exp(-h.age*3));
 for(let i=0;i<5;i++){const side=i%2?1:-1,xs=st.x+side*20,ys=st.y-(200+i*14)*st.s,xe=side*(hw+90),ye=90+i*80,grow=Ksmooth((age-i*.22)/1.7),tail=R;if(grow<=tail)continue;const n=44,top=[],bot=[],col=OV_VIVID[(i*3+1)%8],back=Kmix(col,'#1b1340',.35);
  const ph=o.reduced?0:o.idle*.9+i*1.3,ang=Math.atan2(ye-ys,xe-xs)+Math.PI/2,ca=Math.cos(ang),sa=Math.sin(ang);
  for(let k=0;k<=n;k++){const s=tail+(grow-tail)*k/n,x=xs+(xe-xs)*s,y=ys+(ye-ys)*Math.pow(s,.6)+Math.sin(s*6.5+ph)*75*s*(1+lift*.4)-R*320*s,tw=Math.cos(s*8+ph*1.3),wd=(9+12*Math.sin(Math.PI*Math.min(1,s*1.2)))*Math.abs(tw)+1.5;
   top.push([x+ca*wd,y+sa*wd,tw>0]);bot.push([x-ca*wd,y-sa*wd]);}
  // Runs of the same face are filled as one piece: the front of the ribbon in its colour, the back a shade darker.
  let k0=0;for(let k=1;k<=n;k++){if(k<n&&top[k][2]===top[k0][2])continue;c.beginPath();for(let j=k0;j<=k;j++)j===k0?c.moveTo(top[j][0],top[j][1]):c.lineTo(top[j][0],top[j][1]);for(let j=k;j>=k0;j--)c.lineTo(bot[j][0],bot[j][1]);c.closePath();c.fillStyle=Kmix(top[k0][2]?col:back,'#20183a',dim);c.fill();k0=k;}}}
// Brass: garlands of pennants drop and unfold across the top, and two long banners unroll at the sides.
function Ovbanners(c,G,o,age,hits,R,st,dim){const hw=G.hw;let flap=0;for(const h of hits)if(h.age>=0&&h.age<.6)flap=Math.max(flap,h.vel*Math.exp(-h.age*4));
 for(let gi=0;gi<2;gi++){const drop=KeaseBack(Kclamp((age-gi*.3)/.9)),y0=58+gi*70-(1-drop)*260-R*340,sag=50+gi*22,x0=-hw-30,x1=hw+30;if(drop<=0)continue;const pts=[];for(let x=x0;x<=x1;x+=24)pts.push([x,Ovsag(x,x0,x1,y0,sag)]);Ovline(c,pts,Kmix('#5a3a1a','#20183a',dim),2);
  const n=Math.floor((x1-x0)/58);for(let k=0;k<n;k++){const x=x0+29+k*58,y=Ovsag(x,x0,x1,y0,sag),open=Ksmooth((age-gi*.3-.4-Math.abs(x-st.x)/hw*.5)/.4);if(open<=0)continue;const rot=(o.reduced?0:Math.sin(o.idle*2.2+k*.7+gi)*.12)*(1+flap*2),col=k%3===1?OV_GOLD[1]:OV_VIVID[(k+gi*2)%8];
   const cs=Math.cos(rot),sn=Math.sin(rot),P=(px,py)=>[x+px*cs-py*open*sn,y+px*sn+py*open*cs];Ovpoly(c,[P(-20,0),P(20,0),P(0,48)],Kmix(col,'#20183a',dim));Ovpoly(c,[P(-20,0),P(20,0),P(0,10)],Kmix(Kmix(col,'#ffffff',.3),'#20183a',dim));}}
 for(const side of [-1,1]){const x=side*hw*.52,len=270*Ksmooth((age-.9)/1)*(1-R);if(len<4)continue;const wave=o.reduced?0:Math.sin(o.idle*1.6+side)*6*(1+flap);Ovrect(c,x-46,24,92,10,Kmix('#7a4a1a','#20183a',dim),4);
  c.beginPath();c.moveTo(x-38,30);c.lineTo(x+38,30);c.lineTo(x+38+wave,30+len);c.lineTo(x+wave,30+len-28);c.lineTo(x-38+wave,30+len);c.closePath();c.fillStyle=Kmix(side<0?'#d62246':'#2b59c3','#20183a',dim);c.fill();
  Ovcircle(c,x+wave*.6,30+len*.45,24,Kmix(OV_GOLD[1],'#20183a',dim));Ovcircle(c,x+wave*.6,30+len*.45,12,Kmix(side<0?'#ffd23f':'#ff6fb5','#20183a',dim));Ovrect(c,x-38,36,76,8,Kmix(OV_GOLD[1],'#20183a',dim));}}
// Percussion: little stars come out in the sky and sparkle with the glockenspiel; rings of light run over the floor with each timpani stroke.
function Ovstarsfx(c,G,o,age,hits,R,st){const hw=G.hw;for(let i=0;i<18;i++){const x=(Krand(i,61)*2-1)*hw*.95,y=40+Krand(i,62)*300,q=Ksmooth((age-i*.06)/.5)*(1-R);if(q<=0)continue;let tw=0;for(const h of hits){if(h.inst!=='glockRec'||h.age<0||h.age>.9)continue;if(Math.round(Krand(h.time*17,5)*17)===i)tw=Math.max(tw,h.vel*Math.exp(-h.age*3));}
  const r=(5+Krand(i,63)*4)*q*(1+tw*1.2),idle=o.reduced?0:.15*Math.sin(o.idle*2.4+i*2);escGlow(c,x,y,r*4,'#fff3c0',.35*q+tw+idle*q);c.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,rr=j%2?r*.4:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fillStyle=Krgba('#fffbe6',q);c.fill();}
 for(const h of hits){if(h.inst!=='timpaniRec'||h.age<0||h.age>2)continue;const q=h.age/2,rx=60+q*G.hw*1.2;c.beginPath();c.ellipse(st.x,st.y-6,rx,rx*.22,0,0,K_TAU);c.strokeStyle=Krgba('#ffe7a8',h.vel*.9*(1-q)*(1-R));c.lineWidth=4*(1-q)+1;c.stroke();}}

// Paper notes of every colour that rain down at the final (drawn shapes, not letters).
function Ovnote(c,x,y,s,rot,col,kind){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);Ovell(c,0,0,11,8,col,-.4);if(kind===1){Ovell(c,34,-8,11,8,col,-.4);Ovline(c,[[9,-4],[9,-52]],col,3.5);Ovline(c,[[43,-12],[43,-60]],col,3.5);Ovline(c,[[9,-52],[43,-60]],col,7);}
 else{Ovline(c,[[9,-4],[9,-54]],col,3.5);c.beginPath();c.moveTo(9,-54);c.quadraticCurveTo(30,-40,24,-18);c.strokeStyle=col;c.lineWidth=4;c.stroke();}c.restore();}

// ── The whole stage ─────────────────────────────────────────────────────────────────────────────────────────────────────
// o: {variant, count, steps, t (s since the press; 1e3 at rest), duration, held, from (the round before), idle, reduced, preview}
export function drawOrquestra(c,w,h,o){escFrame();const d=escDecor(o),G=Ovgeo(w,h),round=oqRound(o.variant),steps=o.steps||5,count=Math.max(0,Math.min(o.count||0,steps)),t=o.t??1e3,running=t<1e3;
 const plan=count?oqPlan(o.variant,count,steps,o.duration||OQ_STEP_MIN):null,ages=escAges(count,steps,t,o.held,.45),final=plan?.final&&ages[6]>=0;
 const idle=o.reduced?0:o.idle||0,oo={...o,idle,t};
 // Ages and notes of each section: the moment k of the round's order brings section order[k].
 const age=new Array(6).fill(-1);round.order.forEach((sec,k)=>{age[sec]=ages[k];});
 const hits=plan&&running?plan.hits.map(list=>list.filter(x=>t-x.time>-.3&&t-x.time<2.2).map(x=>({...x,age:t-x.time}))):[[],[],[],[],[],[]];
 // The final: everything lights up, plays, and then goes back to sleep (R) for the next round.
 const aF=final?ages[6]:-1,R=final?Ksmooth((aF-(plan.close+1))/Math.max(.5,plan.D-plan.close-1.3)):0,F=final?Ksmooth(aF/1.2)*(1-R):0;
 const awake=age.map(a=>a>=0?Ksmooth(a/.8)*(1-R):0),nAwake=awake.reduce((s,x)=>s+x,0),light=Kclamp(.16+.085*nAwake+.5*F);
 // The place: at the first press of a new round the backdrop of the new place comes down from above, in front of the old one.
 const from=o.from!==undefined&&count===1?oqRound(o.from).place:round.place,swap=from!==round.place?Ksmooth(t/1.8):1,place=round.place,PL=Ovplace(place,G),P=OV_PLACES[place];
 const sheet=(key,draw,alpha=1,dy=0)=>escBlit(c,`oq-${key}-${Math.round(G.hw)}`,w,h,(sc,sw,sh)=>{Ovunits(sc,G,draw);if(!key.startsWith('front'))escGrain(sc,sw,sh,.16);},alpha,dy);
 // The backdrop and the floor are one sheet (they cover the whole screen); during a change of place the new backdrop and floor are drawn apart.
 // The decor (escDecor): without it the instruments play on the base colour; atenuat, the place is drawn under a veil of it.
 c.save();const scene=pl=>cc=>{Ovplace(pl,G).back(cc);Ovfloor(cc,G,pl);};
 if(d.fade<=0){c.fillStyle=d.base;c.fillRect(0,0,w,h);}
 else{if(swap<1){sheet(`scene${from}`,scene(from));sheet(`back${place}`,PL.back,1,-(1-swap)*OV_BACK*G.u);sheet(`floor${place}`,cc=>Ovfloor(cc,G,place),swap);}
  else sheet(`scene${place}`,scene(place));escVeil(c,d,0,0,w,h);}
 // The floor trembles a little with the timpani.
 let quake=0;if(!o.reduced)for(const x of hits[4])if(x.inst==='timpaniRec'&&x.age>=0&&x.age<.5)quake=Math.max(quake,x.vel*Math.exp(-x.age*7)*Math.sin(x.age*60)*2.2);
 const E=[];Ovunits(c,G,cc=>{
  // The instruments of the sections that are awake, rising from their places as they wake.
  for(let sec=0;sec<6;sec++){const a=age[sec];if(a<0||awake[sec]<=.002)continue;const st=G.st[sec],rise=a<1e3?KeaseBack(Kclamp(a/.85)):1,act=hits[sec].reduce((m,x)=>x.age>=0&&x.age<.5?Math.max(m,x.vel*Math.exp(-x.age*6)):m,0);
   const S={hits:hits[sec],t,idle,reduced:o.reduced,lead:plan?(plan.final||plan.lead===sec):false,act,sway:o.reduced?0:Math.sin(idle*.9+sec*1.7)*.025,E:[]};
   cc.save();cc.translate(st.x,st.y+(1-rise)*50+R*30+quake);cc.scale(st.s*(.75+.25*rise)*(1-.12*R),st.s*(.75+.25*rise)*(1-.12*R));cc.globalAlpha*=Ksmooth(a/.35)*(1-R);OV_DRAW[sec](cc,S);cc.restore();
   if(S.E.length)E.push({st,rise,list:S.E,alpha:Ksmooth(a/.35)*(1-R)});}
 });
 // What stands in front of the stage belongs to the place, and has the same veil.
 const front=(pl,draw,alpha=1,dy=0)=>escBlit(c,`oq-front${pl}-${Math.round(G.hw)}${escDecorKey(d)}`,w,h,escVeiled(d,sc=>Ovunits(sc,G,draw)),alpha,dy);
 if(d.fade>0){if(swap<1){const PO=Ovplace(from,G);front(from,PO.front,1-swap);front(place,PL.front,1,-(1-swap)*1000*G.u);}else front(place,PL.front);}
 // The lamps of the place glow in the dark and light what is near them. While a new backdrop comes down they wait, and the old ones go out.
 const lampOn=Ksmooth((swap-.75)/.25),oldOn=swap<1?Math.pow(1-swap,2):0,lampLights=pl=>Ovplace(pl,G).lamps.map(L=>({x:w/2+L.x*G.u,y:L.y*G.u,rx:L.r*2.4*G.u,ry:L.r*2.4*G.u,color:L.color,a:.28}));
 // Light: the night tint of the place, brighter with every section that is awake; a pool of light on each section; the lamps of the place.
 const lights=[],ambient=Kmix(P.night,'#fff7ec',light),X=x=>w/2+x*G.u,Y=y=>y*G.u;
 for(let sec=0;sec<6;sec++){if(awake[sec]<=.002)continue;const st=G.st[sec];lights.push({x:X(st.x),y:Y(st.y-8),rx:250*G.u*st.s,ry:90*G.u*st.s,color:'#fff1d8',a:.55*awake[sec]},{x:X(st.x),y:Y(st.y-180*st.s),rx:190*G.u*st.s,ry:260*G.u*st.s,color:'#ffe9cc',a:.55*awake[sec]});}
 // Between presses, a soft light breathes on the place of the section that wakes next.
 const m=count&&count<steps&&!running?escGroups(steps)[count]?.[0]:undefined,next=m!==undefined&&m<6?round.order[m]:undefined;
 if(next!==undefined&&age[next]<0){const st=G.st[next];lights.push({x:X(st.x),y:Y(st.y-60*st.s),rx:150*G.u*st.s,ry:150*G.u*st.s,color:'#ffe9c4',a:.16+(o.reduced?0:.08*Math.sin(idle*1.8))});}
 // During a change of place the lamps of the old place still light the stage while they go out.
 const lampMap=escLightSheet(c,`oq-lamps-${place}-${Math.round(G.hw)}`,w,h,lampLights(place)),oldMap=oldOn>0?escLightSheet(c,`oq-lamps-${from}-${Math.round(G.hw)}`,w,h,lampLights(from)):null;
 if(!lampMap)for(const x of lampLights(place))lights.push({...x,a:x.a*lampOn});if(oldOn>0&&!oldMap)for(const x of lampLights(from))lights.push({...x,a:x.a*oldOn});
 // Atenuat or without the decor, the night light of the place is left out: the instruments keep their own colours.
 if(d.full)escLight(c,w,h,ambient,lights,[[lampMap,lampOn],[oldMap,oldOn]]);
 // What glows: the lamps of the place, the beams of the spotlights, and the light of the instruments.
 // Soft light, at a quarter of the resolution: the lamps of the place (two sheets, the even and the odd lamps, that breathe in turn, so
 // bulbs and windows seem to flicker gently), the beams of the spotlights and, at the final, coloured beams and the bloom of the cymbal.
 const glows=(pl,half)=>(sc)=>Ovunits(sc,G,cc=>{Ovplace(pl,G).lamps.forEach((L,i)=>{if(i%2===half)escGlow(cc,L.x,L.y,L.r,L.color,L.a);});}),dimLamps=1-.4*light;
 escGlowLayer(c,w,h,gc=>{for(const half of [0,1]){const tw=o.reduced?1:.86+.14*Math.sin(idle*1.7+half*Math.PI);escBlit(gc,`oq-glow${half}-${place}-${Math.round(G.hw)}`,w,h,glows(place,half),tw*lampOn*dimLamps*d.fade);
  if(oldOn>0){gc.save();gc.beginPath();gc.rect(0,swap*OV_BACK*G.u,w,h);gc.clip();escBlit(gc,`oq-glow${half}-${from}-${Math.round(G.hw)}`,w,h,glows(from,half),tw*oldOn*dimLamps*d.fade);gc.restore();}}
  Ovunits(gc,G,cc=>{
  for(let sec=0;sec<6;sec++){if(awake[sec]<=.002)continue;const st=G.st[sec],a=awake[sec]*(.75+.25*(plan?.lead===sec?1:0)),xt=st.x*.62,g=cc.createLinearGradient(0,0,0,st.y);g.addColorStop(0,Krgba('#fff4d6',.13*a));g.addColorStop(1,Krgba('#fff4d6',.05*a));
   cc.beginPath();cc.moveTo(xt-26,0);cc.lineTo(xt+26,0);cc.lineTo(st.x+170*st.s,st.y);cc.lineTo(st.x-170*st.s,st.y);cc.closePath();cc.fillStyle=g;cc.fill();}
  if(F>0)for(let k=0;k<3;k++){const sw=o.reduced?0:Math.sin(idle*.8+k*2.1)*G.hw*.6,xb=(k-1)*G.hw*.55+sw,col=['#ff8fab','#8be9fd','#ffe066'][k],g=cc.createLinearGradient(0,0,0,OV_FRONT);g.addColorStop(0,Krgba(col,.16*F));g.addColorStop(1,Krgba(col,.04*F));
   cc.beginPath();cc.moveTo((k-1)*G.hw*.7-20,0);cc.lineTo((k-1)*G.hw*.7+20,0);cc.lineTo(xb+220,OV_FRONT);cc.lineTo(xb-220,OV_FRONT);cc.closePath();cc.fillStyle=g;cc.fill();}
  if(final){const cl=aF-plan.close,bloom=cl>0?Ksmooth(cl/.35)*Math.exp(-Math.max(0,cl-.35)*1.4):0;if(bloom>0)escGlow(cc,0,560,G.hw*1.1,'#ffe6b0',.3*bloom);}});});
 // Light adds to what is below it; on a white base without the decor it would not show, and it is laid on instead.
 c.globalCompositeOperation=d.white&&!d.full?'source-over':'lighter';Ovunits(c,G,cc=>{
  for(const e of E){cc.save();cc.translate(e.st.x,e.st.y+(1-e.rise)*50+R*30+quake);cc.scale(e.st.s,e.st.s);cc.globalAlpha*=e.alpha;for(const f of e.list)f(cc);cc.restore();}
  // Effects of light that stay: threads, dots, tiles, stars and rings.
  if(age[0]>=0)Ovthreads(cc,G,oo,age[0],hits[0],R);
  if(age[5]>=0)Ovtiles(cc,G,oo,age[5],hits[5],R,G.st[5]);
  if(age[1]>=0)Ovdots(cc,G,oo,age[1],hits[1],R,G.st[1]);
  if(age[4]>=0)Ovstarsfx(cc,G,oo,age[4],hits[4],R,G.st[4]);
 });c.globalCompositeOperation='source-over';
 // Paper that catches the light: ribbons and banners, and at the final a rain of paper notes.
 const dim=d.full?.45*(1-light):0;Ovunits(c,G,cc=>{
  if(age[2]>=0)Ovribbons(cc,G,oo,age[2],hits[2],R,G.st[2],dim);
  if(age[3]>=0)Ovbanners(cc,G,oo,age[3],hits[3],R,G.st[3],dim);
  if(final){const n=70,span=Math.max(2,plan.phraseEnd+1.5-plan.s0);for(let i=0;i<n;i++){const t0=plan.s0-.6+Krand(i,101)*span,q=(aF-t0)/5.5;if(q<=0||q>=1)continue;const x=(Krand(i,102)*2-1)*G.hw+(o.reduced?0:Math.sin(q*6+i)*40),y=-60+q*1120,rot=(Krand(i,103)-.5)*1.2+(o.reduced?0:Math.sin(q*5+i)*.5);
   cc.globalAlpha=Ksmooth(q/.08)*(1-Ksmooth((q-.85)/.15))*(1-R);Ovnote(cc,x,y,.7+Krand(i,104)*.6,rot,OV_VIVID[i%8],i%3===0?1:0);}cc.globalAlpha=1;}
 });
 c.restore();return true;}
