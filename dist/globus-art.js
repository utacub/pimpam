// Festa de globus (CE27), 0.20: the picture. Felt and embroidery: every shape is a piece of felt with soft edges, its fibres showing, a
// small shadow under it, sewn on with running stitches of coloured thread. The square (sky, façades, trees, bunting, cobbles) is drawn
// once for each round, size and decor into a sheet; the balloons, their threads and the little felt things that hang from them are
// sprites, drawn once and then moved. The scene is drawn in units of a screen 720 high (W wide).
import {Kclamp,KeaseOut,Krand,Ksmooth} from './kaleido-base.js';
import {escAges,escBlit,escCanvas,escDecor,escDecorKey,escFrame,escScale,escSheet,escVeiled} from './escenari.js';
import {GB_FLY,GB_LIFT,GB_RISE,gbRound,gbStagger} from './globus.js';

const GB_THREAD='#fff6e4',GB_SEAM='rgba(60,30,20,.22)';
const GB_SKY=Object.freeze({mati:['#7fbde3','#c4e4f1','#f2f7f4'],tarda:['#efa46f','#fbd29a','#fff0cf'],vespre:['#4b3f86','#9a6aa6','#e7a0a6']});
const GB_WALLS=Object.freeze(['#e48a6a','#f1c46c','#f3b6b9','#9fd3c0','#e9a35a','#d9c3e8','#b7d98b']);
const GB_SHUTTERS=Object.freeze(['#3f7f8c','#5a6fb1','#7d4f8f','#2f8a6a','#b0503e']);
const GB_BUNTING=Object.freeze(['#e8433f','#f6b93b','#2e8fd6','#5fb544','#e86fb0','#ff8a3d','#8e6ad1','#1fa5a0']);
// colour helpers: a hex colour mixed towards white (k>0) or black (k<0)
function gbShade(hex,k){const n=parseInt(hex.slice(1),16),f=x=>Math.round(Math.max(0,Math.min(255,k>0?x+(255-x)*k:x*(1+k))));return `rgb(${f(n>>16&255)},${f(n>>8&255)},${f(n&255)})`;}
const gbRng=seed=>{let a=(seed>>>0)||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
// ── Felt ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The fibres: a tile of soft noise and short curly strokes, laid in overlay mode over every piece.
let GB_FIBRE=null;
function gbFibre(){if(GB_FIBRE!==null)return GB_FIBRE||null;const n=192,cv=escCanvas(n,n),c=cv?.getContext?.('2d');if(!c||!c.createImageData){GB_FIBRE=false;return null;}
 const r=gbRng(5),img=c.createImageData(n,n),d=img.data;for(let i=0;i<n*n;i++){const x=i%n,y=Math.floor(i/n),v=128+(Krand(Math.floor(x/6)*31+Math.floor(y/6),3)-.5)*28+(Krand(i,4)-.5)*34;d[i*4]=d[i*4+1]=d[i*4+2]=v;d[i*4+3]=255;}
 c.putImageData(img,0,0);c.lineCap='round';for(let i=0;i<1700;i++){const x=r()*n,y=r()*n,a=r()*Math.PI*2,l=3+r()*8,v=r()<.5?255:0;c.strokeStyle=`rgba(${v},${v},${v},${(.12+r()*.18).toFixed(3)})`;c.lineWidth=.5+r()*.7;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a+.6)*l*.5,y+Math.sin(a+.6)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}
 GB_FIBRE=cv;return cv;}
function gbPath(c,pts){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
// A piece of felt: k is the scale of the canvas in device pixels (shadows are measured in device pixels).
function gbFelt(c,pts,col,k,o={}){c.save();if(o.shadow!==false){c.shadowColor='rgba(40,25,20,.34)';c.shadowBlur=(o.blur??6)*k;c.shadowOffsetX=(o.sx??2)*k;c.shadowOffsetY=(o.sy??3)*k;}gbPath(c,pts);c.fillStyle=col;c.fill();c.restore();
 const fib=gbFibre();if(fib&&c.createPattern){const p=c.createPattern(fib,'repeat');if(p){c.save();gbPath(c,pts);c.clip();c.globalCompositeOperation='overlay';c.globalAlpha*=o.fibre??.55;c.fillStyle=p;c.fillRect(-1e4,-1e4,2e4,2e4);c.restore();}}
 if(o.rim!==0){c.save();gbPath(c,pts);c.clip();gbPath(c,pts);c.strokeStyle=GB_SEAM;c.lineWidth=o.rim??6;c.stroke();c.restore();}
 if(o.light){c.save();gbPath(c,pts);c.clip();c.translate(-2.5,-2.5);gbPath(c,pts);c.strokeStyle='rgba(255,255,255,.26)';c.lineWidth=4;c.stroke();c.restore();}
 if(o.stitch){const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),cx=(x0+x1)/2,cy=(y0+y1)/2,ins=o.inset??6;
  const kx=Math.max(.2,1-2*ins/Math.max(1,x1-x0)),ky=Math.max(.2,1-2*ins/Math.max(1,y1-y0)),q=pts.map(([x,y])=>[cx+(x-cx)*kx,cy+(y-cy)*ky]);q.push(q[0]);gbStitch(c,q,o.stitch,o.sw??2,o.dash??[7,6]);}}
// A running stitch along a line of points: the thread and a small shadow under it.
function gbStitch(c,pts,col,w=2,dash=[7,6]){if(!c.setLineDash){return;}c.save();c.setLineDash(dash);c.lineCap='round';c.lineJoin='round';
 c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y+1.1):c.moveTo(x,y+1.1));c.strokeStyle='rgba(40,20,10,.33)';c.lineWidth=w+.6;c.stroke();
 c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=col;c.lineWidth=w;c.stroke();c.restore();}
const gbRing=(cx,cy,rx,ry,n=48)=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return [cx+Math.cos(a)*rx,cy+Math.sin(a)*ry];});
function gbBlob(cx,cy,rx,ry,n,wob,r){const ph=[r()*6.28,r()*6.28,r()*6.28];return Array.from({length:n},(_,i)=>{const a=i*Math.PI*2/n,f=1+wob*(.55*Math.sin(2*a+ph[0])+.3*Math.sin(3*a+ph[1])+.15*Math.sin(5*a+ph[2]));return [cx+Math.cos(a)*rx*f,cy+Math.sin(a)*ry*f];});}
const gbRect=(x,y,w,h)=>[[x,y+h],[x,y],[x+w,y],[x+w,y+h]];

// ── The square ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
function gbSky(c,W,time,k,r){const [a,b,d]=GB_SKY[time],g=c.createLinearGradient(0,0,0,600);g.addColorStop(0,a);g.addColorStop(.62,b);g.addColorStop(1,d);
 gbFelt(c,gbRect(-10,-10,W+20,740),a,k,{shadow:false,rim:0,fibre:.42});c.save();c.globalAlpha=.85;c.fillStyle=g;c.fillRect(-10,-10,W+20,740);c.restore();
 const fib=gbFibre();if(fib&&c.createPattern){const p=c.createPattern(fib,'repeat');if(p){c.save();c.globalCompositeOperation='overlay';c.globalAlpha=.4;c.fillStyle=p;c.fillRect(-10,-10,W+20,740);c.restore();}}
 if(time==='vespre'){gbFelt(c,gbRing(W*.84,92,34,34,40),'#fbefcf',k,{rim:4,stitch:'#fff9ea',inset:5});c.fillStyle='rgba(75,63,134,.9)';c.beginPath();c.arc(W*.84+16,82,30,0,Math.PI*2);c.fill();
  for(let i=0;i<26;i++){const x=r()*W,y=20+r()*230,s=3+r()*3;gbStitch(c,[[x-s,y],[x+s,y]],'#fff3c4',1.6,[20,0]);gbStitch(c,[[x,y-s],[x,y+s]],'#fff3c4',1.6,[20,0]);}}
 else{const sx=time==='mati'?W*.12:W*.86,sy=time==='mati'?86:150,col=time==='mati'?'#ffd84a':'#ff9a3c';gbFelt(c,gbRing(sx,sy,40,40,40),col,k,{rim:5,stitch:'#fff6d0',inset:6});
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;gbStitch(c,[[sx+Math.cos(a)*50,sy+Math.sin(a)*50],[sx+Math.cos(a)*66,sy+Math.sin(a)*66]],col,3,[20,0]);}
  for(const [cx,cy,cs] of [[.3,.1,1],[.58,.06,.8],[.74,.17,1.1],[.44,.22,.62]]){const pts=[],X=W*cx,Y=720*cy;for(let j=0;j<5;j++){const a=j/4;pts.push(...gbRing(X+(a-.5)*150*cs,Y-Math.sin(a*Math.PI)*18*cs,(38-Math.abs(a-.5)*30)*cs,(26-Math.abs(a-.5)*16)*cs,20));}
   const hull=[];for(let j=0;j<56;j++){const a=j/56*Math.PI*2;let best=0;for(const [px,py] of pts){const d=(px-X)*Math.cos(a)+(py-Y)*Math.sin(a);if(d>best)best=d;}hull.push([X+Math.cos(a)*best,Y+Math.sin(a)*best*.75]);}
   gbFelt(c,hull,time==='tarda'?'#fff3e2':'#f8f5ee',k,{rim:5,stitch:'#ffffff',fibre:.45,blur:4});}}}
function gbHouse(c,x0,x1,top,base,col,k,r,roof='#b9533d'){gbFelt(c,gbRect(x0,top,x1-x0,base-top),col,k,{rim:7,stitch:gbShade(col,.6)});
 gbFelt(c,[[x0-6,top+4],[(x0+x1)/2,top-26],[x1+6,top+4]],roof,k,{rim:4});
 const cols=Math.max(1,Math.round((x1-x0)/72)),rows=Math.max(1,Math.floor((base-top-60)/88));
 for(let a=0;a<cols;a++)for(let b=0;b<rows;b++){const ww=(x1-x0)/cols,wx=x0+a*ww+ww*.25,wy=top+30+b*88,wW=ww*.5,wH=48;
  gbFelt(c,gbRect(wx,wy,wW,wH),GB_SHUTTERS[Math.floor(r()*5)],k,{rim:3,blur:3});gbStitch(c,[[wx+wW/2,wy+4],[wx+wW/2,wy+wH-4]],GB_THREAD,1.5,[5,4]);
  if(b===rows-1&&a%2===0)gbFelt(c,gbRect(wx-8,wy+wH,wW+16,11),'#4a3b3a',k,{rim:2,blur:2});}}
function gbTree(c,x,base,s,k,r,cols=['#4f9a55','#6fb86a']){gbFelt(c,[[x-13*s,base],[x-8*s,base-170*s],[x+8*s,base-170*s],[x+13*s,base]],'#8a6243',k,{rim:4});
 for(const [ox,oy,rr,ci] of [[-48,-210,76,0],[44,-224,80,0],[0,-280,86,1],[-18,-192,58,1]])gbFelt(c,gbBlob(x+ox*s,base+oy*s,rr*s,rr*.85*s,36,.12,r),cols[ci],k,{rim:8,stitch:'#d9efc0',inset:6});}
function gbPalm(c,x,base,s,k,r){const top=[x+18*s,base-200*s];gbStitch(c,[[x,base],[x+6*s,base-100*s],top],'#8a6243',10*s,[20,0]);
 for(let i=0;i<8;i++){const a=-Math.PI/2+(i-3.5)*.42,L=(70+r()*14)*s,p=[];for(let j=0;j<=8;j++){const t=j/8,bend=Math.sin(t*Math.PI)*.3;p.push([top[0]+Math.cos(a+bend*Math.sign(Math.cos(a)))*L*t,top[1]+Math.sin(a)*L*t+t*t*36*s]);}
  const pts=[...p.map(([px,py],j)=>[px,py-(9-j)*1.2*s]),...p.slice().reverse().map(([px,py],j)=>[px,py+(j+1)*1.2*s])];gbFelt(c,pts,i%2?'#3f9b5a':'#5bb46a',k,{rim:3,blur:3});}}
function gbBunting(c,W,rows,k,lights){for(const [y0,sag,off] of rows){const pts=[];for(let j=0;j<=40;j++){const t=j/40;pts.push([t*W,y0+Math.sin(t*Math.PI)*sag]);}gbStitch(c,pts,GB_THREAD,2.2,[10,0]);
 const n=Math.max(6,Math.round(W/80));for(let j=0;j<n;j++){const t=(j+off)/n,x=t*W,y=y0+Math.sin(t*Math.PI)*sag;
  if(lights){c.save();const g=c.createRadialGradient(x,y+4,0,x,y+4,26);g.addColorStop(0,'rgba(255,226,140,.55)');g.addColorStop(1,'rgba(255,226,140,0)');c.fillStyle=g;c.fillRect(x-26,y-22,52,52);c.restore();gbFelt(c,gbRing(x,y+6,6,7,16),'#ffe9a8',k,{rim:2,blur:2});}
  else gbFelt(c,[[x-16,y],[x+16,y],[x,y+36]],GB_BUNTING[(j*3)%8],k,{rim:3,blur:3,stitch:GB_THREAD,inset:3});}}}
function gbCobbles(c,W,top,k,r,cols=['#b9ab98','#a8987f']){gbFelt(c,gbRect(-10,top,W+20,740-top),'#d9c8ad',k,{shadow:false,rim:0});
 for(let row=0;row<5;row++){const hh=(720-top)/5;for(let j=-1;j<W/88+1;j++){const ww=88,x=j*ww+(row%2)*ww*.5,y=top+4+row*hh;gbFelt(c,gbBlob(x+ww/2,y+hh/2,ww*.44,hh*.38,18,.08,r),r()<.5?cols[0]:cols[1],k,{rim:3,blur:2,sx:1,sy:1.5});}}}
// The church square: façades of many colours, the church with its bell tower in the middle, two plane trees.
function gbPlaca(c,W,k,r,time){const cx=W/2;let x=-20;const fronts=[];while(x<W+20){const fw=150+r()*90;if(Math.abs(x+fw/2-cx)<170){x=cx+110;continue;}fronts.push([x,x+fw]);x+=fw+6;}
 fronts.forEach(([x0,x1],i)=>gbHouse(c,x0,x1,250+r()*70,580,GB_WALLS[i%7],k,r));
 const bw=110,bt=86;gbFelt(c,gbRect(cx-bw/2,bt+60,bw,580-bt-60),'#e6c79a',k,{rim:6,stitch:'#fff3dc'});gbFelt(c,[[cx-bw/2-10,bt+62],[cx,bt-10],[cx+bw/2+10,bt+62]],'#c8553d',k,{rim:5});
 gbFelt(c,[[cx-26,bt+150],[cx-26,bt+100],[cx,bt+82],[cx+26,bt+100],[cx+26,bt+150]],'#5a3b2e',k,{rim:3});gbFelt(c,gbRing(cx,bt+126,14,16,24),'#f2b443',k,{rim:3,blur:2});
 gbFelt(c,gbRing(cx,bt+212,26,26,32),'#fbf5e8',k,{rim:3,stitch:'#5a3b2e'});c.strokeStyle='#5a3b2e';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(cx,bt+212);c.lineTo(cx,bt+197);c.moveTo(cx,bt+212);c.lineTo(cx+12,bt+216);c.stroke();
 const y0=360;gbFelt(c,[[cx-96,580],[cx-96,y0],[cx,y0-70],[cx+96,y0],[cx+96,580]],'#f0d7ae',k,{rim:7,stitch:'#c99a63'});
 gbFelt(c,gbRing(cx,y0+20,30,30,36),'#5aa0c8',k,{rim:4,stitch:GB_THREAD,inset:6});for(let j=0;j<8;j++){const a=j/8*Math.PI*2;gbStitch(c,[[cx,y0+20],[cx+Math.cos(a)*26,y0+20+Math.sin(a)*26]],GB_THREAD,1.4,[4,3]);}
 gbFelt(c,[[cx-34,580],[cx-34,478],[cx-20,456],[cx,448],[cx+20,456],[cx+34,478],[cx+34,580]],'#8a5636',k,{rim:5,stitch:'#e2b98a'});gbStitch(c,[[cx,452],[cx,578]],'#e2b98a',2,[6,5]);
 gbTree(c,W*.05,620,1.1,k,r);gbTree(c,W*.95,620,1,k,r);
 gbBunting(c,W,[[210,50,0],[300,44,.5]],k,time==='vespre');gbCobbles(c,W,576,k,r);}
// The seafront: the sea and its horizon, a little sailing boat, palm trees and lamps along a railing, tiles underfoot.
function gbMar(c,W,k,r,time){const hz=430,sea=time==='vespre'?'#3d4f8e':time==='tarda'?'#4f8fb8':'#3a8fc4';
 gbFelt(c,gbRect(-10,hz,W+20,160),sea,k,{shadow:false,rim:0});for(let j=0;j<6;j++){const y=hz+16+j*22,pts=[];for(let x=-10;x<=W+10;x+=14)pts.push([x,y+Math.sin(x*.05+j)*3]);gbStitch(c,pts,gbShade(sea,.5),1.6,[10,7]);}
 gbFelt(c,[[W*.62-50,hz+40],[W*.62+50,hz+40],[W*.62+36,hz+58],[W*.62-36,hz+58]],'#8a5636',k,{rim:3,blur:3});gbFelt(c,[[W*.62-4,hz+38],[W*.62-4,hz-40],[W*.62+38,hz+34]],'#fbf5e8',k,{rim:3,blur:3,stitch:'#e8433f',inset:5});
 gbFelt(c,[[W*.84,hz],[W*.86,hz-40],[W*.95,hz-48],[W+20,hz-20],[W+20,hz]],'#6f9d72',k,{rim:4,blur:3});
 const promenade=560;gbFelt(c,gbRect(-10,promenade-20,W+20,26),'#f3ece0',k,{rim:4,stitch:'#c9b89a',inset:4});
 for(let x=10;x<W;x+=46)gbFelt(c,gbRect(x,promenade-58,9,40),'#f3ece0',k,{rim:2,blur:2});gbFelt(c,gbRect(-10,promenade-64,W+20,10),'#f3ece0',k,{rim:2,blur:3});
 const n=Math.max(3,Math.round(W/320));for(let j=0;j<n;j++){const x=(j+.5)*W/n;if(j%2===0)gbPalm(c,x-60,promenade+6,1.15,k,r);
  c.strokeStyle='#3c3f4a';c.lineWidth=6;c.beginPath();c.moveTo(x+70,promenade);c.lineTo(x+70,promenade-190);c.stroke();gbFelt(c,gbRing(x+70,promenade-200,16,20,24),time==='vespre'?'#ffe08a':'#fff3c8',k,{rim:3,stitch:'#3c3f4a',inset:4});
  if(time==='vespre'){c.save();const g=c.createRadialGradient(x+70,promenade-200,0,x+70,promenade-200,70);g.addColorStop(0,'rgba(255,224,140,.5)');g.addColorStop(1,'rgba(255,224,140,0)');c.fillStyle=g;c.fillRect(x,promenade-270,140,140);c.restore();}}
 gbBunting(c,W,[[250,40,.25]],k,time==='vespre');gbCobbles(c,W,576,k,r,['#e6d9c3','#d8c8ac']);}
// The mountain village: three ranges with snow, stone houses climbing the slope, pines, a stone bridge.
function gbMuntanya(c,W,k,r,time){const cols=time==='vespre'?['#8a76b0','#7d6aa8','#6b5d9a']:time==='tarda'?['#b8a7b6','#a99ab0','#9a8aa6']:['#a4bcd2','#8eaac6','#7b98b8'];
 // Three ranges, the far one lightest; the peaks are sharp, and the far ones keep snow on top, cut to the shape of the peak.
 [[300,180,0],[340,150,1],[390,120,2]].forEach(([base,amp,ci],L)=>{const pts=[[-10,600]];for(let x=-10;x<=W+10;x+=10){const u=x/W*Math.PI*(2.2+L*.6)+L*1.7;pts.push([x,base-Math.pow(1-Math.abs(Math.sin(u)),1.25)*amp*(.7+.3*Math.sin(u*.37+L))]);}pts.push([W+10,600]);
  gbFelt(c,pts,cols[ci],k,{rim:6,blur:4});
  if(L<2)for(let j=2;j<pts.length-3;j++){const [x,y]=pts[j],[,yp]=pts[j-1],[,yn]=pts[j+1];if(!(y<=yp&&y<yn&&y<base-amp*.6))continue;const d=amp*.2,zig=[];for(let q=0;q<=8;q++)zig.push([x+70-q*17.5,y+d+(q%2?-d*.35:0)]);
   c.save();gbPath(c,pts);c.clip();gbFelt(c,[[x-80,y-20],[x+80,y-20],...zig],'#fbf8f2',k,{rim:3,blur:2,sy:2});c.restore();
   c.save();gbPath(c,pts);c.clip();gbStitch(c,zig.map(([a,b])=>[a,b-5]),'#c9d6e4',1.6,[6,5]);c.restore();}});
 gbFelt(c,gbBlob(W/2,640,W*.7,200,40,.04,r),time==='vespre'?'#4f7a5a':'#7cb46a',k,{rim:8,blur:5});
 let x=-10;const houses=[];while(x<W){const hw=90+r()*50;houses.push([x,x+hw,430+r()*60]);x+=hw+14+r()*20;}
 houses.forEach(([x0,x1,top],i)=>gbHouse(c,x0,x1,top,590,['#e8dcc6','#d9c3a5','#f0e2c8','#cdb796'][i%4],k,r,i%2?'#8a4b3a':'#6f5a4a'));
 for(const px of [.08,.3,.72,.93]){const xx=W*px,b=600;gbFelt(c,[[xx,b-150],[xx-38,b-40],[xx+38,b-40]],time==='vespre'?'#2f5a46':'#2f7a4f',k,{rim:4,stitch:'#a9d9a0',inset:6});gbFelt(c,gbRect(xx-6,b-42,12,40),'#7a5338',k,{rim:2,blur:2});}
 gbBunting(c,W,[[230,46,0],[322,40,.5]],k,time==='vespre');gbCobbles(c,W,586,k,r,['#a9a39a','#97918a']);}
function gbBack(c,W,round,decor){const k=escScale(c),r=gbRng(round.v*97+7);gbSky(c,W,round.time,k,r);
 if(round.place==='mar')gbMar(c,W,k,r,round.time);else if(round.place==='muntanya')gbMuntanya(c,W,k,r,round.time);else gbPlaca(c,W,k,r,round.time);}
// ── Balloons ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The outline of a balloon of the round's shape, centred on 0,0 (the knot below it).
function gbOutline(shape,s){if(shape==='cor'){const p=[];for(let i=0;i<56;i++){const t=i/56*Math.PI*2;p.push([16*Math.pow(Math.sin(t),3)*3.3*s,-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*3.4*s-6*s]);}return {pts:p,knot:[0,58*s]};}
 const rx=(shape==='llarg'?35:46)*s,ry=(shape==='llarg'?66:56)*s;return {pts:Array.from({length:64},(_,i)=>{const a=i/64*Math.PI*2,narrow=1-.18*Math.max(0,Math.sin(a));return [Math.cos(a)*rx*narrow,Math.sin(a)*ry];}),knot:[0,ry],rx,ry};}
function gbBalloonSprite(sc,shape,col,s){const k=escScale(sc),{pts,knot}=gbOutline(shape,s),cx=80*s,cy=80*s,P=pts.map(([x,y])=>[x+cx,y+cy]);
 gbFelt(sc,[[cx+knot[0]-7*s,cy+knot[1]+9*s],[cx+knot[0]+7*s,cy+knot[1]+9*s],[cx+knot[0],cy+knot[1]-3*s]],gbShade(col,-.15),k,{rim:2,blur:2});
 gbFelt(sc,P,col,k,{rim:9*s,light:true});
 sc.save();gbPath(sc,P);sc.clip();sc.fillStyle='rgba(255,255,255,.2)';sc.beginPath();sc.ellipse(cx-15*s,cy-20*s,12*s,21*s,-.4,0,Math.PI*2);sc.fill();sc.restore();
 const seam=[];for(let j=0;j<=20;j++){const t=j/20,yy=cy-50*s+t*96*s;seam.push([cx+Math.sin(t*Math.PI)*12*s,yy]);}if(shape!=='cor')gbStitch(sc,seam,gbShade(col,.55),2*s+.4,[7*s,5*s]);
 const rim=P.map(([x,y])=>[cx+(x-cx)*.84,cy+(y-cy)*.86]);rim.push(rim[0]);gbStitch(sc,rim,GB_THREAD,1.8*s+.3,[7*s,6*s]);}
function gbTokenSprite(sc,kind,s){const k=escScale(sc),x=24*s,y=24*s;
 if(kind===0){gbFelt(sc,Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,rr=i%2?7*s:16*s;return [x+Math.cos(a)*rr,y+Math.sin(a)*rr];}),'#ffd54a',k,{rim:3,blur:3});}
 else if(kind===1){for(let p=0;p<5;p++){const a=p/5*Math.PI*2;gbFelt(sc,gbRing(x+Math.cos(a)*9*s,y+Math.sin(a)*9*s,7*s,7*s,16),'#fff2f2',k,{rim:2,blur:2,sx:1,sy:1});}gbFelt(sc,gbRing(x,y,6*s,6*s,16),'#f6b93b',k,{rim:2,blur:2});}
 else{const p=[];for(let i=0;i<36;i++){const t=i/36*Math.PI*2;p.push([x+13*Math.pow(Math.sin(t),3)*s,y-(10*Math.cos(t)-4*Math.cos(2*t)-1.6*Math.cos(3*t)-.8*Math.cos(4*t))*s]);}gbFelt(sc,p,'#e8433f',k,{rim:3,blur:3});}}
// One balloon at x,y (its centre), leaning by a, with its thread swaying (sway) and the little thing hanging from it.
function gbBalloon(c,x,y,a,shape,col,s,i,sway,alpha,thread='#f7efe0'){if(alpha<=0)return;c.save();c.globalAlpha*=alpha;const o=gbOutline(shape,s),kx=x+Math.sin(a)*-o.knot[1],ky=y+Math.cos(a)*o.knot[1];
 const L=112*s,pts=[];for(let j=0;j<=16;j++){const t=j/16;pts.push([kx+Math.sin(t*4.5+i+sway)*7*s*t-Math.sin(a)*L*t*.3,ky+8*s+t*L]);}gbStitch(c,pts,thread,1.6*s+.5,[5,3]);
 const [tx,ty]=pts[pts.length-1];const tok=escSheet(c,`gb-tok|${i%3}|${s.toFixed(2)}`,48*s,48*s,sc=>gbTokenSprite(sc,i%3,s));if(tok)c.drawImage(tok,tx-24*s,ty-14*s,48*s,48*s);
 c.translate(x,y);c.rotate(a);const sp=escSheet(c,`gb-bal|${shape}|${col}|${s.toFixed(2)}`,160*s,180*s,sc=>gbBalloonSprite(sc,shape,col,s));if(sp)c.drawImage(sp,-80*s,-80*s,160*s,180*s);else{c.fillStyle=col;gbPath(c,o.pts);c.fill();}
 c.restore();}
// ── The picture ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function drawGlobus(c,w,h,o){escFrame();const S=h/720,W=w/S,round=gbRound(o.variant),steps=o.steps||5;let count=Math.max(0,Math.min(o.count||0,steps)),t=o.t??1e3;
 if(o.preview){count=steps;t=GB_LIFT-.3;}
 const stagger=gbStagger(steps,count),ages=escAges(count,steps,t,o.preview?1e3:o.held,stagger),idle=o.reduced?0:o.idle||0,decor=escDecor(o);
 c.save();c.scale(S,S);
 if(decor.fade<1){c.fillStyle=decor.base;c.fillRect(0,0,W,720);}
 // A new round comes in over the old one (the first press of a round changes the square).
 const old=o.from!==undefined&&count===1&&o.from!==o.variant?gbRound(o.from):null,swap=old?Ksmooth(t/1.2):1;
 if(decor.fade>0){if(old&&swap<1)escBlit(c,`gb-back|${old.v}|${W.toFixed(1)}${escDecorKey(decor)}`,W,720,escVeiled(decor,(sc,sw)=>gbBack(sc,sw,old,decor)));
  escBlit(c,`gb-back|${round.v}|${W.toFixed(1)}${escDecorKey(decor)}`,W,720,escVeiled(decor,(sc,sw)=>gbBack(sc,sw,round,decor)),swap);}
 // The balloons: each one comes up from below the screen to its place with its moment, and sways there; in the final, after GB_LIFT,
 // all of them rise together and leave the sky, each a little later and a little faster than the one before.
 // On a white base with little or no square the cream thread would not show: it is brown.
 const thread=decor.white&&decor.fade<.5?'#8a6a52':'#f7efe0',aF=count>=steps?ages[6]:-1,s0=Math.max(.72,Math.min(1.05,W/1280*1.05)),order=[0,1,2,3,4,5,6];
 for(const i of order){const a=ages[i];if(a<0)continue;const [fx,fy]=round.spots[i],col=round.colors[i],s=s0*(.92+((i*7)%4)*.05);
  const X=Math.max(70*s,Math.min(W-70*s,W*fx)),Y=86+fy*330;let p=KeaseOut(a/GB_RISE),x=X+(1-p)*((i%2?1:-1)*60),y=820+(Y-820)*p;
  const sw=o.reduced?0:Math.sin(idle*.9+i*1.7)*(1-.6*(1-p)),lean=sw*.08+(1-p)*(i%2?.12:-.12);x+=sw*8;y+=o.reduced?0:Math.sin(idle*.7+i)*4;
  let alpha=1;if(aF>=0){const L=Kclamp((aF-GB_LIFT-i*.12)/GB_FLY);const q=Math.pow(L,1.6);y-=q*(Y+420);x+=Math.sin(L*3+i)*30*L;if(L>=1)alpha=0;}
  gbBalloon(c,x,y,lean,round.shape,col,s,i,o.reduced?0:idle*1.4,alpha,thread);}
 c.restore();}
