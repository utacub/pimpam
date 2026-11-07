// Detectius de sons (EN11): the art. 0.16: a bandstand in the style of a luthier's workshop. 0.48 (Marc, 6 November 2026): the twenty
// instruments are drawn anew as in a luthier's showcase at night: each one in a velvet niche, with a dark contour so that it stands
// out (the rule of contrast of figures), wood with its grain and varnish, metal with its reflections. The board is laid out again:
// the instrument that is searched hangs from the roof in a large gilt oval frame, about three times the old medallion, and the
// options are a row of smaller niches under it (two columns on a tall screen). The magnifying glass is gone.
// The square, the bandstand, the niches with their instruments and the frame are painted once into a sheet; each frame adds the
// instrument that sounds, the waves, the veil over the niches out of focus and the contour of the focus (tlRing).
// Every instrument is drawn in a box of 300 × 400 units, standing on the floor of the box, and scaled to its place.
import {TL_STRIP,TL_DIM,TL_TAU,tlVeil,tlRing,tlOpenBox,tlClipOpen,tlSheet,tlRng} from './tauler.js';
import {TM_PIECE,tmTarget,tmTime,tmBeats} from './templet.js';
import {escDecor,escDecorKey,escVeil} from './escenari.js';
const TM_INK='#1d1009',TM_BW=300,TM_BH=400;
const TM_GOLD=['#6e4a12','#d8b25a','#fff1b8','#c99a3a','#5e3e0e'],TM_SILVER=['#4f5662','#cfd5de','#ffffff','#9aa3b0','#424852'],TM_COPPER=['#5a2410','#c8693a','#ffc59a','#b4532a','#4a1c0c'],TM_BRONZE=['#4a2a0c','#a8742c','#f2d08a','#8a5a1c','#3a2008'];
const TM_SKY={tarda:['#16285a','#3a3f86','#9a5a9a','#f39a6a','#ffc98a'],mati:['#3f8fe0','#79b8f0','#b9dcf7','#e8f4ff','#fff6dc'],nit:['#070b24','#0f1a44','#1d2a5e','#2c3770','#3a3f7a']};
const TM_HOUSES={tarda:'#3a2a52',mati:'#c98a6a',nit:'#141a3a'},TM_ROOF={tarda:['#173d30','#2a6a52'],mati:['#2a7a5a','#3a9a72'],nit:['#0c2822','#1a4a3c']},TM_PLAIN={tarda:'#5a4a8a',mati:'#8fc6f0',nit:'#1d2a5e'};
const TM_VELVET={tarda:['#4a0f22','#7a1c36','#3a0a1a'],mati:['#3a1030','#6a1e4e','#2a0a22'],nit:['#12183e','#26306a','#0c1030']};
function tmV(c,y0,y1,stops){const g=c.createLinearGradient(0,y0,0,y1);stops.forEach((s,i)=>g.addColorStop(i/Math.max(1,stops.length-1),s));return g;}
function tmMetal(c,x0,y0,x1,y1,cols){const g=c.createLinearGradient(x0,y0,x1,y1);cols.forEach((s,i)=>g.addColorStop(i/Math.max(1,cols.length-1),s));return g;}
function tmRR(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function tmDot(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TL_TAU);c.fill();}
function tmGlow(c,x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TL_TAU);c.fill();}
// Fill the current path and draw the dark contour round it.
function tmInk(c,fill,lw=3){c.fillStyle=fill;c.fill();c.lineWidth=lw;c.strokeStyle=TM_INK;c.lineJoin='round';c.stroke();}
// A tube from a to b with a metal gradient across it and a dark contour.
function tmTube(c,a,b,wd,cols,lw=2.2){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L*wd/2,ny=dx/L*wd/2;
 c.beginPath();c.moveTo(a[0]+nx,a[1]+ny);c.lineTo(b[0]+nx,b[1]+ny);c.lineTo(b[0]-nx,b[1]-ny);c.lineTo(a[0]-nx,a[1]-ny);c.closePath();tmInk(c,tmMetal(c,a[0]+nx,a[1]+ny,a[0]-nx,a[1]-ny,cols),lw);}
// Wood: the grain (thin wavy lines along the length), then a soft varnish highlight. Call it with the shape as the current path.
function tmWood(c,x,y,w,h,cols,seed=1,vertical=true,lw=3){c.save();tmInk(c,tmMetal(c,x,y,vertical?x+w:x,vertical?y:y+h,cols),lw);c.clip();
 const r=tlRng(seed);c.lineWidth=1.1;for(let i=0;i<(vertical?w:h)/5;i++){const u=r();c.strokeStyle=`rgba(${r()<.5?'40,14,4':'255,214,160'},${(.08+r()*.12).toFixed(3)})`;c.beginPath();
  if(vertical){const xx=x+u*w;c.moveTo(xx,y);c.bezierCurveTo(xx+(r()-.5)*10,y+h*.33,xx+(r()-.5)*10,y+h*.66,xx+(r()-.5)*6,y+h);}else{const yy=y+u*h;c.moveTo(x,yy);c.bezierCurveTo(x+w*.33,yy+(r()-.5)*8,x+w*.66,yy+(r()-.5)*8,x+w,yy+(r()-.5)*5);}c.stroke();}
 const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'rgba(255,240,210,0)');g.addColorStop(.3,'rgba(255,240,210,.22)');g.addColorStop(.42,'rgba(255,240,210,0)');c.fillStyle=g;c.fillRect(x-4,y-4,w+8,h+8);c.restore();
 c.lineWidth=lw;c.strokeStyle=TM_INK;c.stroke();}
// A stand of dark wood with a brass foot, used by several instruments.
function tmPlinth(c,x,w,y=372,h=22){tmRR(c,x,y,w,h,8);tmWood(c,x,y,w,h,['#3a1a0a','#7a3e1a','#4a220c'],7,false,2.5);tmRR(c,x+6,y+h-6,w-12,6,3);tmInk(c,tmMetal(c,0,y+h-6,0,y+h,TM_GOLD),1.5);}
const TM_WOOD=['#5a2208','#b4581c','#e8963e','#c0641e','#5e2408'],TM_DARKW=['#2a0e04','#6a2a0e','#a04a1a','#6a2a0e','#2a0e04'],TM_EBONY=['#0c0a0c','#3a3440','#6a6270','#2a2630','#0c0a0c'],TM_SPRUCE=['#b07a3a','#f0c880','#ffe2a8','#e0b46a','#a8702e'];
// ---------- the string family ----------
function tmFiddle(c,s,cols,{bass=false,seed=3,neck=200}={}){c.save();c.scale(s,s);
 const body=()=>{c.beginPath();if(bass){c.moveTo(0,-122);c.bezierCurveTo(20,-122,30,-108,44,-80);c.bezierCurveTo(56,-58,34,-44,34,-26);c.bezierCurveTo(34,-6,66,6,66,46);c.bezierCurveTo(66,96,32,114,0,114);c.bezierCurveTo(-32,114,-66,96,-66,46);c.bezierCurveTo(-66,6,-34,-6,-34,-26);c.bezierCurveTo(-34,-44,-56,-58,-44,-80);c.bezierCurveTo(-30,-108,-20,-122,0,-122);}
  else{c.moveTo(0,-118);c.bezierCurveTo(46,-118,58,-92,50,-66);c.bezierCurveTo(44,-48,30,-44,32,-26);c.bezierCurveTo(34,-6,62,4,62,42);c.bezierCurveTo(64,92,30,112,0,112);c.bezierCurveTo(-30,112,-64,92,-62,42);c.bezierCurveTo(-62,4,-34,-6,-32,-26);c.bezierCurveTo(-30,-44,-44,-48,-50,-66);c.bezierCurveTo(-58,-92,-46,-118,0,-118);}c.closePath();};
 body();tmWood(c,-66,-122,132,236,cols,seed,true,3.2/s);
 // purfling, f-holes, tailpiece, bridge, fingerboard, strings, pegbox and scroll
 c.save();c.translate(0,-2);c.scale(.93,.95);body();c.restore();c.lineWidth=1.2/s;c.strokeStyle='rgba(30,10,2,.6)';c.stroke();
 for(const sd of [-1,1]){c.strokeStyle=TM_INK;c.lineWidth=3/s;c.beginPath();c.moveTo(sd*22,-20);c.bezierCurveTo(sd*30,-2,sd*14,14,sd*22,32);c.stroke();tmDot(c,sd*22,-20,3,TM_INK);tmDot(c,sd*22,32,3,TM_INK);}
 tmRR(c,-15,72,30,38,9);tmInk(c,'#1a1210',1.6/s);
 c.beginPath();c.moveTo(-20,46);c.lineTo(20,46);c.lineTo(16,38);c.lineTo(-16,38);c.closePath();tmInk(c,'#e8cc8a',1.4/s);
 c.beginPath();c.moveTo(-9,-neck);c.lineTo(9,-neck);c.lineTo(12,20);c.lineTo(-12,20);c.closePath();tmInk(c,tmMetal(c,-12,0,12,0,TM_EBONY),2/s);
 c.strokeStyle='rgba(255,246,220,.9)';c.lineWidth=1.1/s;for(const k of [-6,-2,2,6]){c.beginPath();c.moveTo(k*.6,-neck+4);c.lineTo(k*1.4,42);c.lineTo(k*1.1,76);c.stroke();}
 c.beginPath();c.moveTo(-10,-neck);c.lineTo(10,-neck);c.lineTo(9,-neck-44);c.lineTo(-9,-neck-44);c.closePath();tmWood(c,-10,-neck-44,20,44,cols,seed+1,true,2.4/s);
 c.beginPath();c.arc(0,-neck-54,13,0,TL_TAU);tmWood(c,-13,-neck-67,26,26,cols,seed+2,true,2.4/s);c.beginPath();c.arc(2,-neck-54,5.5,0,TL_TAU);tmInk(c,'#3a1206',1.6/s);
 for(const sd of [-1,1])for(const j of [0,1]){c.beginPath();c.ellipse(sd*15,-neck-34+j*16,6,4,0,0,TL_TAU);tmInk(c,'#1a1008',1.4/s);}
 c.restore();}
function tmStrings(c,pts,p,t,col='rgba(255,246,220,.9)',lw=1.2){c.strokeStyle=col;c.lineWidth=lw;for(let k=0;k<pts.length;k++){const [a,b]=pts[k],w=p>0?Math.sin(t*44+k*1.9)*p*2.4:0,mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(mx+w,my,b[0],b[1]);c.stroke();}}
function tmBow(c,x,y,a,len,p,t){const sw=p>0?Math.sin(t*5)*len*.12*p:0;c.save();c.translate(x+Math.cos(a)*sw,y+Math.sin(a)*sw);c.rotate(a);
 c.beginPath();c.moveTo(-len/2,-4);c.quadraticCurveTo(0,-9,len/2,-3);c.lineTo(len/2,0);c.quadraticCurveTo(0,-5,-len/2,0);c.closePath();tmInk(c,'#5a2a10',1.6);
 c.fillStyle='rgba(250,245,230,.95)';c.fillRect(-len/2+14,2,len-18,2.6);tmRR(c,-len/2,-8,22,16,4);tmInk(c,'#1a1008',1.6);tmDot(c,-len/2+11,0,3,'#fff');c.restore();}
function tmViolin(c,p,t){tmPlinth(c,70,160);tmTube(c,[150,372],[150,300],10,TM_GOLD);
 c.save();c.translate(150,232);c.rotate(-.36);tmFiddle(c,.84,TM_WOOD,{seed:3,neck:150});c.restore();
 tmBow(c,158,236,.9,230,p,t);}
function tmCello(c,p,t){tmTube(c,[150,392],[150,330],5,TM_SILVER);c.save();c.translate(150,240);tmFiddle(c,1.02,['#4a1606','#9a3a12','#d0702c','#a0441a','#4a1606'],{seed:5,neck:120});c.restore();tmBow(c,206,302,-.5,200,p,t);}
function tmBass(c,p,t){tmTube(c,[150,394],[150,350],5,TM_SILVER);c.save();c.translate(150,256);tmFiddle(c,1.1,TM_DARKW,{bass:true,seed:9,neck:110});c.restore();
 if(p>0){c.strokeStyle=`rgba(255,240,200,${(.6*p).toFixed(3)})`;c.lineWidth=3;c.beginPath();c.arc(150,262,18+8*p,-.4,.4);c.stroke();}}
function tmHarp(c,p,t){const sb0=[96,370],sb1=[262,120],neckY=xx=>{const u=(xx-74)/(266-74);return 46+90*u-34*Math.sin(Math.PI*u)+12*Math.sin(TL_TAU*u);},sbY=xx=>sb0[1]+(sb1[1]-sb0[1])*(xx-sb0[0])/(sb1[0]-sb0[0]);
 const st=[];for(let k=0;k<24;k++){const xx=100+k*(250-100)/23;st.push([[xx,neckY(xx)+6],[xx,sbY(xx)]]);}
 c.beginPath();c.moveTo(sb0[0]-30,sb0[1]+4);c.lineTo(sb1[0]-10,sb1[1]-8);c.lineTo(sb1[0]+12,sb1[1]+6);c.lineTo(sb0[0]+36,sb0[1]+10);c.closePath();tmWood(c,60,110,220,270,TM_WOOD,11,false,3);
 tmStrings(c,st,p,t);c.lineWidth=2;for(const k of [0,7,14,21]){const [a,b]=st[k];c.strokeStyle='#d8352a';c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();}
 c.lineCap='round';c.strokeStyle=TM_INK;c.lineWidth=24;c.beginPath();for(let xx=74;xx<=268;xx+=3){const yy=neckY(xx);xx===74?c.moveTo(xx,yy):c.lineTo(xx,yy);}c.stroke();c.strokeStyle='#7a3a14';c.lineWidth=18;c.stroke();c.strokeStyle='#d8b25a';c.lineWidth=4;c.stroke();c.lineCap='butt';
 tmTube(c,[74,384],[74,40],24,TM_GOLD,2.6);tmRR(c,52,22,44,28,8);tmInk(c,tmMetal(c,52,0,96,0,TM_GOLD),2.4);c.beginPath();c.arc(74,22,14,Math.PI,0);tmInk(c,tmMetal(c,60,0,88,0,TM_GOLD),2.4);
 tmRR(c,44,368,200,24,8);tmWood(c,44,368,200,24,TM_DARKW,12,false,2.6);c.fillStyle='#d8b25a';for(let k=0;k<5;k++){tmRR(c,64+k*20,386,12,8,2);c.fill();}}
function tmGuitar(c,p,t){tmTube(c,[110,394],[150,250],7,TM_DARKW);tmTube(c,[190,394],[150,250],7,TM_DARKW);
 c.save();c.translate(150,262);c.rotate(-.06);
 const body=()=>{c.beginPath();c.moveTo(0,-62);c.bezierCurveTo(42,-64,58,-40,48,-14);c.bezierCurveTo(42,0,40,8,52,24);c.bezierCurveTo(78,58,62,124,0,126);c.bezierCurveTo(-62,124,-78,58,-52,24);c.bezierCurveTo(-40,8,-42,0,-48,-14);c.bezierCurveTo(-58,-40,-42,-64,0,-62);c.closePath();};
 body();tmWood(c,-80,-64,160,190,['#5a2208','#9a4a18','#6a2a0c'],13,true,3.2);c.save();c.scale(.95,.96);body();c.restore();tmWood(c,-76,-62,152,182,TM_SPRUCE,14,true,1.4);
 c.beginPath();c.arc(0,10,25,0,TL_TAU);c.lineWidth=7;c.strokeStyle='#7a3a14';c.stroke();c.lineWidth=2;c.strokeStyle='#e8c070';c.stroke();c.beginPath();c.arc(0,10,20,0,TL_TAU);tmInk(c,'#1a0e08',1.8);
 c.beginPath();c.moveTo(-22,82);c.lineTo(22,82);c.lineTo(20,92);c.lineTo(-20,92);c.closePath();tmInk(c,'#5a2208',1.8);
 c.beginPath();c.moveTo(-11,-200);c.lineTo(11,-200);c.lineTo(13,-56);c.lineTo(-13,-56);c.closePath();tmInk(c,tmMetal(c,-13,0,13,0,TM_EBONY),2);c.strokeStyle='#c8ccd4';c.lineWidth=1;for(let f=0;f<9;f++){const yy=-196+f*15*(1-f*.03);c.beginPath();c.moveTo(-11,yy);c.lineTo(11,yy);c.stroke();}
 c.beginPath();c.moveTo(-14,-200);c.lineTo(14,-200);c.lineTo(16,-252);c.lineTo(-16,-252);c.closePath();tmWood(c,-16,-252,32,52,TM_WOOD,15,true,2.4);for(const sd of [-1,1])for(let j=0;j<3;j++)tmDot(c,sd*21,-240+j*14,4.5,'#e8e0c8');
 tmStrings(c,[-7.5,-4.5,-1.5,1.5,4.5,7.5].map(k=>[[k*1.1,-198],[k*1.6,86]]),p,t,'rgba(255,240,210,.95)',1.1);c.restore();}
// ---------- woodwinds ----------
function tmKeyRow(c,pts,p,t,r=5.5){pts.forEach(([x,y],k)=>{const down=p>0&&((k+Math.floor(t*6))%4===0);c.beginPath();c.arc(x,y,r,0,TL_TAU);tmInk(c,tmMetal(c,x-r,y-r,x+r,y+r,down?['#d8d0b8','#9aa2ae','#5a606c']:TM_SILVER),1.4);});}
function tmFlute(c,p,t){tmPlinth(c,40,220);tmTube(c,[80,372],[96,340],8,TM_DARKW);const a=[62,350],b=[250,60];
 tmTube(c,a,b,18,TM_SILVER,2.6);const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;
 tmTube(c,[a[0]+dx*.18+nx*9,a[1]+dy*.18+ny*9],[a[0]+dx*.72+nx*9,a[1]+dy*.72+ny*9],4,TM_SILVER,1.2);
 tmKeyRow(c,Array.from({length:12},(_,k)=>{const u=.14+k*.052;return [a[0]+dx*u+nx*2,a[1]+dy*u+ny*2];}),p,t,7);
 const lp=[a[0]+dx*.9,a[1]+dy*.9],ang=Math.atan2(dy,dx);c.beginPath();c.ellipse(lp[0]-nx*10,lp[1]-ny*10,15,8,ang,0,TL_TAU);tmInk(c,tmMetal(c,lp[0]-14,lp[1]-14,lp[0]+14,lp[1]+14,TM_SILVER),1.8);c.beginPath();c.ellipse(lp[0]-nx*10,lp[1]-ny*10,6,3.2,ang,0,TL_TAU);tmInk(c,'#2a2e36',1);
 c.beginPath();c.arc(b[0],b[1],10,0,TL_TAU);tmInk(c,tmMetal(c,b[0]-10,b[1]-10,b[0]+10,b[1]+10,TM_SILVER),2);}
// A vertical woodwind: a body from top to bottom with its width at each height (wf(u), u from 0 at the top to 1 at the bottom).
function tmPipe(c,x,y0,y1,wf,cols,seed){c.beginPath();const n=40;for(let i=0;i<=n;i++){const u=i/n;c.lineTo(x+wf(u)/2,y0+(y1-y0)*u);}for(let i=n;i>=0;i--){const u=i/n;c.lineTo(x-wf(u)/2,y0+(y1-y0)*u);}c.closePath();tmWood(c,x-40,y0,80,y1-y0,cols,seed,true,2.6);}
function tmRings(c,x,ys,wf,y0,y1){for(const yy of ys){const w=wf((yy-y0)/(y1-y0))+3;tmRR(c,x-w/2,yy-3,w,6,2);tmInk(c,tmMetal(c,x-w/2,0,x+w/2,0,TM_SILVER),1.3);}}
function tmOboe(c,p,t){tmPlinth(c,90,120);const x=150,y0=42,y1=362,wf=u=>12+u*10+(u>.88?(u-.88)*120:0);
 c.beginPath();c.moveTo(x-2,y0);c.lineTo(x-3.5,y0-28);c.lineTo(x+3.5,y0-28);c.lineTo(x+2,y0);c.closePath();tmInk(c,'#d8a860',1.6);tmRR(c,x-4,y0-6,8,10,2);tmInk(c,'#7a2a1a',1.2);
 tmPipe(c,x,y0,y1,wf,['#140608','#4a1c1e','#7a3a34','#3a1416','#140608'],21);tmRings(c,x,[y0+4,140,250,330],wf,y0,y1);
 tmKeyRow(c,[60,86,112,170,196,222,276].map((yy,k)=>[x+(k%2?2:-2),yy]),p,t,5);c.strokeStyle='#cfd5de';c.lineWidth=2;c.beginPath();c.moveTo(x+9,70);c.lineTo(x+9,300);c.stroke();}
function tmClarinet(c,p,t){tmPlinth(c,90,120);const x=150,y0=30,y1=360,wf=u=>u<.06?13+u*180:u<.12?24:18+(u>.82?Math.pow((u-.82)/.18,2.2)*44:0);
 tmPipe(c,x,y0,y1,wf,TM_EBONY,23);tmRings(c,x,[y0+22,y0+40,150,268,300],wf,y0,y1);c.beginPath();c.moveTo(x-6,y0+2);c.lineTo(x+6,y0+2);c.lineTo(x+3,y0-10);c.lineTo(x-3,y0-10);c.closePath();tmInk(c,'#c8a060',1.4);
 tmRR(c,x-12,y0+8,24,10,3);tmInk(c,tmMetal(c,x-12,0,x+12,0,TM_SILVER),1.4);tmKeyRow(c,[82,108,134,180,206,232].map(yy=>[x,yy]),p,t,6);c.strokeStyle='#cfd5de';c.lineWidth=2;c.beginPath();c.moveTo(x+11,90);c.lineTo(x+11,290);c.stroke();}
function tmBassoon(c,p,t){tmPlinth(c,80,140);const x=150,maple=['#5a1c06','#a8461a','#e88a46','#9a3e16','#4a1604'];
 tmRR(c,x-34,296,60,90,10);tmWood(c,x-34,296,60,90,maple,31,true,2.6);
 tmPipe(c,x+8,22,312,u=>24+u*4,maple,32);tmPipe(c,x-18,150,312,()=>20,maple,33);
 c.beginPath();c.ellipse(x+8,22,15,5,0,0,TL_TAU);tmInk(c,'#2a0c04',1.6);tmRings(c,x+8,[30,150,296],()=>28,22,312);tmRings(c,x-18,[156,296],()=>20,150,312);
 c.strokeStyle=TM_INK;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(x-18,152);c.bezierCurveTo(x-22,110,x-60,110,x-62,78);c.stroke();c.strokeStyle='#d9dee6';c.lineWidth=4;c.stroke();c.lineCap='butt';
 c.beginPath();c.moveTo(x-64,80);c.lineTo(x-68,62);c.lineTo(x-60,60);c.lineTo(x-58,78);c.closePath();tmInk(c,'#d8a860',1.4);
 tmKeyRow(c,[[x-18,200],[x-18,226],[x-18,252],[x+8,200],[x+8,226]],p,t,6);}
// ---------- brass ----------
function tmBell(c,cx,cy,r,ang,cols=TM_GOLD){c.save();c.translate(cx,cy);c.rotate(ang);c.beginPath();c.ellipse(0,0,r*.28,r,0,0,TL_TAU);tmInk(c,tmMetal(c,-r,-r,r,r,cols),2.4);c.beginPath();c.ellipse(r*.04,0,r*.17,r*.74,0,0,TL_TAU);tmInk(c,tmMetal(c,-r,r,r,-r,['#3a240a','#8a5a1c','#c99a3a']),1.4);c.restore();}
function tmPipeLine(c,pts,wd,cols=TM_GOLD){c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=TM_INK;c.lineWidth=wd+4.5;c.stroke();c.strokeStyle=cols[1];c.lineWidth=wd;c.stroke();c.strokeStyle='rgba(255,246,200,.75)';c.lineWidth=Math.max(1.2,wd*.28);c.stroke();c.lineCap='butt';}
function tmTrumpet(c,p,t){tmPlinth(c,80,140);tmTube(c,[150,372],[150,250],9,TM_SILVER);
 c.save();c.translate(150,200);c.rotate(-.42);
 tmPipeLine(c,[[-130,0],[60,0]],11);tmPipeLine(c,[[-60,0],[-70,8],[-70,40],[30,40],[52,30],[52,10]],11);tmPipeLine(c,[[-30,40],[-30,62],[30,62],[30,40]],8);
 c.beginPath();c.moveTo(56,-7);c.quadraticCurveTo(110,-10,138,-52);c.lineTo(138,52);c.quadraticCurveTo(110,10,56,7);c.closePath();tmInk(c,tmMetal(c,0,-52,0,52,TM_GOLD),2.4);tmBell(c,138,0,52,0);
 for(let k=0;k<3;k++){const vx=-34+k*21,press=p>0&&(Math.floor(t*5)+k)%3===0?6:0;tmTube(c,[vx,-24+press],[vx,52],13,TM_GOLD,1.8);tmRR(c,vx-9,-38+press,18,12,4);tmInk(c,tmMetal(c,vx-9,0,vx+9,0,TM_SILVER),1.4);}
 tmRR(c,-150,-7,24,14,5);tmInk(c,tmMetal(c,-150,-7,-126,7,TM_SILVER),1.6);if(p>0)tmGlow(c,150,0,80*p,'rgba(255,220,140,.5)');c.restore();}
function tmHorn(c,p,t){tmPlinth(c,70,160);tmTube(c,[150,372],[150,320],9,TM_SILVER);const cx=140,cy=200;
 for(const r of [96,76,58]){c.beginPath();c.arc(cx,cy,r,0,TL_TAU);c.strokeStyle=TM_INK;c.lineWidth=15;c.stroke();c.strokeStyle='#d8b25a';c.lineWidth=10.5;c.stroke();c.strokeStyle='rgba(255,246,200,.7)';c.lineWidth=3;c.beginPath();c.arc(cx,cy,r,3.4,5.4);c.stroke();}
 tmPipeLine(c,[[cx-58,cy],[cx-40,cy-40],[cx+10,cy-50],[cx+40,cy-30]],9);
 c.beginPath();c.moveTo(cx+80,cy+50);c.quadraticCurveTo(cx+120,cy+90,cx+130,cy+150);c.lineTo(cx+30,cy+170);c.quadraticCurveTo(cx+70,cy+110,cx+66,cy+62);c.closePath();tmInk(c,tmMetal(c,cx+30,0,cx+130,0,TM_GOLD),2.4);
 c.beginPath();c.ellipse(cx+80,cy+160,52,15,-.2,0,TL_TAU);tmInk(c,tmMetal(c,cx+30,cy+150,cx+130,cy+170,TM_GOLD),2.4);c.beginPath();c.ellipse(cx+80,cy+160,36,9,-.2,0,TL_TAU);tmInk(c,'#5a3a10',1.4);
 for(let k=0;k<3;k++){const vx=cx-14+k*22,vy=cy-6,rot=p>0&&(Math.floor(t*5)+k)%3===0?.6:0;c.beginPath();c.arc(vx,vy,11,0,TL_TAU);tmInk(c,tmMetal(c,vx-11,vy-11,vx+11,vy+11,TM_SILVER),1.8);c.save();c.translate(vx,vy);c.rotate(rot);c.fillStyle='#4f5662';c.fillRect(-7,-2,14,4);c.restore();}
 tmRR(c,cx-104,cy-70,26,14,5);tmInk(c,tmMetal(c,0,cy-70,0,cy-56,TM_SILVER),1.6);tmPipeLine(c,[[cx-80,cy-63],[cx-60,cy-40]],7);if(p>0)tmGlow(c,cx+80,cy+160,70*p,'rgba(255,220,140,.45)');}
function tmTrombone(c,p,t){tmPlinth(c,80,140);tmTube(c,[150,372],[150,236],9,TM_SILVER);const sl=p>0?Math.sin(t*3)*18*p:0;
 c.save();c.translate(158,206);c.rotate(.5);
 // the slide (it moves while it plays), the crook behind and the bell tube coming forward to the bell, which faces the same way as the slide
 tmPipeLine(c,[[60,30],[-150-sl,30],[-160-sl,20],[-150-sl,10],[30,10]],8);tmRR(c,-28,4,10,32,3);tmInk(c,tmMetal(c,-28,0,-18,0,TM_SILVER),1.2);tmRR(c,-150-sl-6,4,10,32,3);tmInk(c,tmMetal(c,0,0,10,0,TM_SILVER),1.2);
 tmPipeLine(c,[[30,10],[70,8],[78,-12],[64,-26],[-40,-26]],9);
 c.beginPath();c.moveTo(-40,-32);c.quadraticCurveTo(-90,-34,-118,-74);c.lineTo(-118,22);c.quadraticCurveTo(-90,-18,-40,-20);c.closePath();tmInk(c,tmMetal(c,0,-74,0,22,TM_GOLD),2.4);tmBell(c,-118,-26,48,0);
 tmRR(c,56,24,22,12,4);tmInk(c,tmMetal(c,56,0,78,0,TM_SILVER),1.4);if(p>0)tmGlow(c,-130,-26,70*p,'rgba(255,220,140,.45)');c.restore();}
function tmTuba(c,p,t){tmPlinth(c,60,180);
 c.beginPath();c.moveTo(110,330);c.bezierCurveTo(100,250,112,150,118,90);c.lineTo(182,90);c.bezierCurveTo(188,150,200,250,190,330);c.bezierCurveTo(186,360,114,360,110,330);c.closePath();tmInk(c,tmMetal(c,100,0,200,0,TM_GOLD),2.6);
 c.beginPath();c.moveTo(118,92);c.quadraticCurveTo(110,40,70,14);c.lineTo(230,14);c.quadraticCurveTo(190,40,182,92);c.closePath();tmInk(c,tmMetal(c,70,0,230,0,TM_GOLD),2.6);c.beginPath();c.ellipse(150,14,80,14,0,0,TL_TAU);tmInk(c,tmMetal(c,70,0,230,0,TM_GOLD),2.6);c.beginPath();c.ellipse(150,14,62,9,0,0,TL_TAU);tmInk(c,'#5a3a10',1.4);
 tmPipeLine(c,[[190,300],[226,290],[232,230],[200,214],[190,214]],10);tmPipeLine(c,[[110,240],[80,236],[74,180],[100,160],[118,160]],10);
 for(let k=0;k<4;k++){const vx=128+k*15,press=p>0&&(Math.floor(t*4)+k)%4===0?5:0;tmTube(c,[vx,180+press],[vx,250],11,TM_SILVER,1.6);c.beginPath();c.arc(vx,176+press,7,0,TL_TAU);tmInk(c,tmMetal(c,vx-7,0,vx+7,0,TM_SILVER),1.4);}
 tmPipeLine(c,[[100,160],[70,120],[60,96]],6);tmRR(c,48,84,22,16,5);tmInk(c,tmMetal(c,48,0,70,0,TM_SILVER),1.6);if(p>0)tmGlow(c,150,14,90*p,'rgba(255,220,140,.45)');}
// ---------- keyboards and bars ----------
function tmPiano(c,p,t){const x0=34,x1=266;
 tmRR(c,x0,40,x1-x0,240,10);tmWood(c,x0,40,x1-x0,240,['#2a0c04','#5a2008','#8a3a14','#4a1a06','#220a02'],41,false,3);
 tmRR(c,x0+14,58,x1-x0-28,120,6);tmWood(c,x0+14,58,x1-x0-28,120,['#3a1206','#7a3010','#a4501e','#6a280c','#3a1206'],42,false,2);
 c.strokeStyle='rgba(255,220,160,.35)';c.lineWidth=2;tmRR(c,x0+28,72,x1-x0-56,92,4);c.stroke();
 tmRR(c,x0+40,150,x1-x0-80,26,3);tmInk(c,'#3a1a0a',1.6);
 tmRR(c,x0-8,226,x1-x0+16,20,4);tmWood(c,x0-8,226,x1-x0+16,20,['#2a0c04','#6a2a0e','#2a0c04'],43,false,2.4);
 const kx=x0+4,kw=(x1-x0-8)/21,lit=Math.floor(t*4)%21;for(let k=0;k<21;k++){c.beginPath();c.rect(kx+k*kw,198,kw,30);tmInk(c,p>0&&k===lit?'#f0e6c8':'#fbf8ee',1.2);}
 for(let k=0;k<20;k++)if([0,1,3,4,5].includes(k%7)){c.beginPath();c.rect(kx+(k+1)*kw-kw*.3,198,kw*.6,18);tmInk(c,'#14100e',1);}
 tmRR(c,x0+8,184,x1-x0-16,14,3);tmWood(c,x0+8,184,x1-x0-16,14,TM_DARKW,44,false,2);
 for(const lx of [x0+10,x1-30]){tmRR(c,lx,246,20,130,4);tmWood(c,lx,246,20,130,TM_DARKW,45+lx,true,2.4);}
 tmRR(c,x0+20,350,x1-x0-40,26,4);tmWood(c,x0+20,350,x1-x0-40,26,TM_DARKW,47,false,2.4);for(const k of [-1,0,1]){tmRR(c,150+k*20-5,368,10,20,3);tmInk(c,tmMetal(c,0,368,0,388,TM_GOLD),1.4);}
 tmRR(c,x0+4,384,x1-x0-8,8,3);tmInk(c,'#1a0a04',1.4);}
function tmMallets(c,pairs,head,cols,p){const lift=p*14;pairs.forEach(([a,b],i)=>{const B=[b[0],b[1]-lift*(i?.6:1)];tmTube(c,a,B,5,['#8a6a3a','#e8cf98','#8a6a3a'],1.4);c.beginPath();c.arc(B[0],B[1],head,0,TL_TAU);tmInk(c,tmMetal(c,B[0]-head,B[1]-head,B[0]+head,B[1]+head,cols),1.8);});}
function tmMarimba(c,p,t,beat){const n=11,X0=24,X1=276,bw=(X1-X0)/n,lit=Math.floor(beat*3.7)%n;
 for(const x of [X0+6,X1-6])tmTube(c,[x,392],[x,200],10,TM_DARKW);tmTube(c,[X0,372],[X1,372],8,TM_DARKW);
 for(let k=0;k<n;k++){const bx=X0+k*bw,L=180-k*12;tmTube(c,[bx+bw/2,196],[bx+bw/2,196+L],bw*.56,TM_GOLD,1.6);c.beginPath();c.ellipse(bx+bw/2,196+L,bw*.28,4,0,0,TL_TAU);tmInk(c,'#5e3e0e',1.2);}
 tmRR(c,X0-8,184,X1-X0+16,16,5);tmWood(c,X0-8,184,X1-X0+16,16,TM_DARKW,51,false,2.4);
 for(let k=0;k<n;k++){const bx=X0+k*bw,L=140-k*6,top=170-L/2-4;tmRR(c,bx+2,top,bw-4,L,4);tmWood(c,bx+2,top,bw-4,L,['#6a2a0c','#b4581c','#e09048','#a04a18'],52+k,true,1.8);
  if(p>0&&k===lit){c.fillStyle=`rgba(255,226,160,${(.6*p).toFixed(3)})`;tmRR(c,bx+2,top,bw-4,L,4);c.fill();}tmDot(c,bx+bw/2,top+L*.2,2.4,'#d9c27a');tmDot(c,bx+bw/2,top+L*.8,2.4,'#d9c27a');}
 tmMallets(c,[[[70,40],[170,18]],[[78,58],[196,46]]],12,['#fff1d0','#e0a050','#8a4a1a'],p);}
function tmGlock(c,p,t,beat){const n=11,lit=Math.floor(beat*3.7)%n;
 for(const sd of [-1,1])tmTube(c,[150+sd*90,392],[150+sd*36,250],8,TM_SILVER);tmTube(c,[56,392],[244,392],7,TM_SILVER);
 c.beginPath();c.moveTo(24,120);c.lineTo(276,120);c.lineTo(262,268);c.lineTo(38,268);c.closePath();tmInk(c,tmMetal(c,0,120,0,268,['#5a1414','#b0362c','#5a1414']),3);
 c.beginPath();c.moveTo(36,130);c.lineTo(264,130);c.lineTo(252,258);c.lineTo(48,258);c.closePath();tmInk(c,'#2a0c0c',1.6);
 for(let k=0;k<n;k++){const bh=110-k*5,bx=48+k*19.4,bw=15,by=194-bh/2;tmRR(c,bx,by,bw,bh,3);tmInk(c,tmMetal(c,bx,0,bx+bw,0,TM_SILVER),1.4);
  if(p>0&&k===lit){c.fillStyle=`rgba(255,250,220,${(.75*p).toFixed(3)})`;tmRR(c,bx,by,bw,bh,3);c.fill();}tmDot(c,bx+bw/2,by+bh*.16,2,'#4f5662');tmDot(c,bx+bw/2,by+bh*.84,2,'#4f5662');}
 tmMallets(c,[[[70,70],[160,40]],[[86,86],[200,74]]],10,['#ff9a8a','#d8352a','#7a1010'],p);}
// ---------- percussion ----------
function tmTimpani(c,p,t){const cx=150,top=176,R=124;
 for(const [a,b] of [[[cx-80,300],[cx-100,392]],[[cx+80,300],[cx+100,392]],[[cx,320],[cx,394]]])tmTube(c,a,b,10,TM_SILVER);
 c.beginPath();c.moveTo(cx-R,top);c.bezierCurveTo(cx-R,top+120,cx-R*.4,top+146,cx,top+146);c.bezierCurveTo(cx+R*.4,top+146,cx+R,top+120,cx+R,top);c.closePath();tmInk(c,tmMetal(c,cx-R,0,cx+R,0,TM_COPPER),3);
 c.fillStyle='rgba(255,220,180,.35)';c.beginPath();c.ellipse(cx-R*.45,top+50,R*.1,40,.2,0,TL_TAU);c.fill();
 c.beginPath();c.ellipse(cx,top,R+6,R*.3+6,0,0,TL_TAU);tmInk(c,tmMetal(c,cx-R,0,cx+R,0,TM_SILVER),2.6);
 c.beginPath();c.ellipse(cx,top,R,R*.28,0,0,TL_TAU);tmInk(c,tmV(c,top-R*.28,top+R*.28,['#fffaf0','#efe4cc','#d8c8a8']),1.6);
 if(p>0){c.strokeStyle=`rgba(150,110,60,${(.5*p).toFixed(3)})`;c.lineWidth=2;for(let k=0;k<3;k++){const u=((t*1.4+k/3)%1);c.beginPath();c.ellipse(cx,top,R*u,R*.28*u,0,0,TL_TAU);c.stroke();}}
 for(let k=0;k<6;k++){const a=Math.PI*(.08+k*.168),px=cx-Math.cos(a)*(R+4),py=top+Math.sin(a)*(R*.3+4);tmTube(c,[px,py-8],[px,py+44*Math.sin(a)+10],6,TM_SILVER,1.4);c.beginPath();c.arc(px,py-8,5,0,TL_TAU);tmInk(c,'#e8eaee',1.2);}
 const lift=p*18;for(const [a,b] of [[[cx-120,top-90-lift],[cx-30,top-14-lift]],[[cx+128,top-70],[cx+40,top-6]]]){tmTube(c,a,b,6,['#5a3a1a','#c8a070','#5a3a1a'],1.4);c.beginPath();c.arc(b[0],b[1],14,0,TL_TAU);tmInk(c,tmMetal(c,b[0]-14,b[1]-14,b[0]+14,b[1]+14,['#fff','#e8e0d0','#a89880']),1.8);}}
function tmTriangle(c,p,t){const sway=p>0?Math.sin(t*9)*.05*p:0;
 tmTube(c,[70,392],[70,40],10,TM_DARKW);tmTube(c,[70,44],[196,44],9,TM_DARKW);tmRR(c,30,380,80,14,5);tmInk(c,tmMetal(c,0,380,0,394,TM_GOLD),1.6);
 c.strokeStyle='#8a8f98';c.lineWidth=2;c.beginPath();c.moveTo(190,48);c.lineTo(190,96);c.stroke();
 c.save();c.translate(190,96);c.rotate(sway);const s=170;c.lineJoin='round';c.lineCap='round';c.beginPath();c.moveTo(-s*.06,s*.02);c.lineTo(-s/2,s*.86);c.lineTo(s/2,s*.86);c.lineTo(s*.06,s*.02);c.strokeStyle=TM_INK;c.lineWidth=15;c.stroke();c.strokeStyle=tmMetal(c,-s/2,0,s/2,s,TM_SILVER);c.lineWidth=10;c.stroke();c.restore();c.lineCap='butt';
 const hit=p>0?Math.abs(Math.sin(t*6))*12:0;tmTube(c,[272,180],[196+hit,236],6,TM_SILVER,1.4);c.beginPath();c.arc(272,180,6,0,TL_TAU);tmInk(c,'#3a3e46',1.2);}
function tmTambourine(c,p,t){const cx=150,cy=210,R=112,rot=p>0?Math.sin(t*12)*.06*p:0;
 tmTube(c,[cx,392],[cx,300],9,TM_SILVER);tmTube(c,[cx-60,392],[cx,330],7,TM_SILVER);tmTube(c,[cx+60,392],[cx,330],7,TM_SILVER);
 c.save();c.translate(cx,cy);c.rotate(-.12+rot);
 c.beginPath();c.ellipse(0,0,R,R*.92,0,0,TL_TAU);tmWood(c,-R,-R,2*R,2*R,['#6a2a0c','#c06a28','#f0a050','#b05a20','#5a2208'],61,false,3);
 c.beginPath();c.ellipse(0,0,R-14,R*.92-14,0,0,TL_TAU);tmInk(c,tmV(c,-R,R,['#fbf2dc','#efdfb8','#dcc694']),1.8);
 c.fillStyle='rgba(120,80,40,.08)';for(let k=0;k<5;k++){c.beginPath();c.ellipse(-20+k*8,-10+k*5,30-k*4,20-k*3,.3,0,TL_TAU);c.fill();}
 for(let k=0;k<5;k++){const a=-Math.PI*.5+k*TL_TAU/5+.3,x=Math.cos(a)*(R-6),y=Math.sin(a)*(R*.92-6);c.save();c.translate(x,y);c.rotate(a+Math.PI/2);c.beginPath();c.rect(-17,-6,34,12);tmInk(c,'#2a1206',1.4);
  for(const sd of [-1,1]){const j=p>0?Math.sin(t*30+k+sd)*1.5*p:0;c.beginPath();c.ellipse(sd*6+j,0,9,4.5,0,0,TL_TAU);tmInk(c,tmMetal(c,-9,-4,9,4,TM_BRONZE),1.2);}c.restore();}
 c.restore();}
function tmGong(c,p,t){const cx=150,cy=176,R=104,sw=p>0?Math.sin(t*4)*.04*p:0;
 tmTube(c,[34,394],[34,30],14,TM_DARKW,2.4);tmTube(c,[266,394],[266,30],14,TM_DARKW,2.4);tmRR(c,22,18,256,20,6);tmWood(c,22,18,256,20,TM_DARKW,71,false,2.4);tmRR(c,14,380,272,14,5);tmWood(c,14,380,272,14,TM_DARKW,72,false,2.2);
 for(const sd of [-1,1]){c.strokeStyle='#3a2a1a';c.lineWidth=3;c.beginPath();c.moveTo(cx+sd*44,38);c.lineTo(cx+sd*36,cy-R+12);c.stroke();}
 c.save();c.translate(cx,cy);c.rotate(sw);c.beginPath();c.arc(0,0,R,0,TL_TAU);tmInk(c,tmMetal(c,-R,-R,R,R,TM_BRONZE),3);
 const g=c.createRadialGradient(-R*.3,-R*.3,4,0,0,R);g.addColorStop(0,'rgba(255,236,170,.55)');g.addColorStop(.5,'rgba(255,236,170,0)');g.addColorStop(1,'rgba(40,20,0,.35)');c.fillStyle=g;c.beginPath();c.arc(0,0,R,0,TL_TAU);c.fill();
 c.strokeStyle='rgba(60,30,6,.5)';c.lineWidth=1.4;for(let k=1;k<7;k++){c.beginPath();c.arc(0,0,R*k/7.4,0,TL_TAU);c.stroke();}
 c.beginPath();c.arc(0,0,R*.3,0,TL_TAU);tmInk(c,tmMetal(c,-R*.3,-R*.3,R*.3,R*.3,['#f2d08a','#a8742c','#5a3a10']),2);c.restore();
 if(p>0){c.strokeStyle=`rgba(255,226,150,${(.5*p).toFixed(3)})`;c.lineWidth=2.5;for(let k=0;k<3;k++){const u=(t*.8+k/3)%1;c.beginPath();c.arc(cx,cy,R*(.35+.6*u),0,TL_TAU);c.stroke();}}
 const lift=p*14;tmTube(c,[250,330-lift],[204,260-lift],7,['#4a2a10','#a06a30','#4a2a10'],1.4);c.beginPath();c.arc(200,254-lift,16,0,TL_TAU);tmInk(c,tmMetal(c,184,238,216,270,['#e8dcc8','#a89880','#5a4a3a']),1.8);}
const TM_DRAW={violi:tmViolin,arpa:tmHarp,flauta:tmFlute,trompeta:tmTrumpet,marimba:tmMarimba,glock:tmGlock,timbal:tmTimpani,triangle:tmTriangle,piano:tmPiano,guitarra:tmGuitar,violoncel:tmCello,clarinet:tmClarinet,trombo:tmTrombone,pandereta:tmTambourine,contrabaix:tmBass,oboe:tmOboe,fagot:tmBassoon,trompa:tmHorn,tuba:tmTuba,gong:tmGong};
// Where the sound comes out, in the units of the box (for the waves).
const TM_MOUTH={violi:[150,200],arpa:[170,220],flauta:[200,120],trompeta:[250,150],marimba:[150,150],glock:[150,190],timbal:[150,176],triangle:[190,190],piano:[150,120],guitarra:[150,270],violoncel:[150,230],clarinet:[150,350],trombo:[80,130],pandereta:[150,210],contrabaix:[150,260],oboe:[150,350],fagot:[158,22],trompa:[220,360],tuba:[150,14],gong:[150,176]};
export const TM_DRAWN=Object.freeze(Object.keys(TM_DRAW));
// Draws the instrument in the box (x, y, w, h), standing on its bottom and centred; returns the scale.
export function tmDrawInstrument(c,id,x,y,w,h,{p=0,t=0,beat=0}={}){const k=Math.min(w/TM_BW,h/TM_BH);c.save();c.translate(x+(w-TM_BW*k)/2,y+h-TM_BH*k);c.scale(k,k);c.lineJoin='round';(TM_DRAW[id]||tmHarp)(c,p,t,beat);c.restore();return k;}
const tmMouth=(id,x,y,w,h)=>{const k=Math.min(w/TM_BW,h/TM_BH),m=TM_MOUTH[id]||[150,200];return [x+(w-TM_BW*k)/2+m[0]*k,y+h-TM_BH*k+m[1]*k];};
// Sound waves: arcs moving out from the mouth of the instrument (or the frame), soft and slow, never a flash.
function tmWaves(c,x,y,r,p,t,still,col='255,236,190'){if(p<=0)return;c.save();c.lineCap='round';for(let k=0;k<3;k++){const u=still?(k+1)/3.5:((t*.7+k/3)%1),a=p*(1-u)*.8;if(a<=.01)continue;c.strokeStyle=`rgba(${col},${a.toFixed(3)})`;c.lineWidth=Math.max(2,r*.06)*(1-u*.5);for(const sd of [-1,1]){c.beginPath();c.arc(x,y,r*(.35+u),sd<0?Math.PI-.6:-.6,sd<0?Math.PI+.6:.6);c.stroke();}}c.restore();}
// ---------- the bandstand ----------
export const tmRoofH=h=>Math.round(Math.max(34,Math.min(60,(h-TL_STRIP)*.07)));
// The square and the bandstand (d: the decor setting, escDecor). Without decor, the base colour: the niches, their instruments and
// the frame of the model are content and stand on it.
function tmSquare(c,w,h,time,plain,d){const H=h-TL_STRIP,roofH=tmRoofH(h),floorTop=H-Math.min(70,H*.1);
 if(d.fade<=0){c.fillStyle=d.base;c.fillRect(0,0,w,H);c.fillStyle='rgba(20,16,30,.88)';c.fillRect(0,H,w,h-H);return;}
 if(plain){c.fillStyle=TM_PLAIN[time];c.fillRect(0,0,w,H);c.fillStyle=time==='mati'?'#2a7a5a':'#1a4a3c';c.fillRect(0,0,w,roofH);c.fillStyle='#8a4e26';c.fillRect(0,floorTop,w,H-floorTop);escVeil(c,d,0,0,w,H);c.fillStyle='rgba(20,16,30,.88)';c.fillRect(0,H,w,h-H);return;}
 c.fillStyle=tmV(c,0,H,TM_SKY[time]);c.fillRect(0,0,w,H);
 if(time==='nit'){const r=tlRng(4);for(let i=0;i<w*H/5000;i++)tmDot(c,r()*w,r()*H*.6,.6+r()*1.2,'rgba(255,250,230,.7)');}
 if(time==='mati'){c.fillStyle='rgba(255,255,255,.85)';for(const [cx,cy,s] of [[.12,.2,1],[.88,.16,.8]]){const R=Math.min(w,H)*.05*s;c.beginPath();c.ellipse(w*cx,H*cy,R*2.4,R*.7,0,0,TL_TAU);c.ellipse(w*cx-R*.6,H*cy-R*.5,R,R*.8,0,0,TL_TAU);c.ellipse(w*cx+R*.5,H*cy-R*.35,R*.8,R*.6,0,0,TL_TAU);c.fill();}}
 // the houses of the square, and the trees in front of them
 const r=tlRng(9),hc=TM_HOUSES[time],win=time==='mati'?'#7fb8e0':'#ffd27a';
 for(let x0=-20;x0<w;){const hw=60+r()*60,hh=(H*.32+r()*H*.18);c.fillStyle=hc;c.fillRect(x0,floorTop-hh,hw,hh);if(time==='mati'){c.fillStyle='#a86a4a';c.beginPath();c.moveTo(x0-4,floorTop-hh);c.lineTo(x0+hw/2,floorTop-hh-20);c.lineTo(x0+hw+4,floorTop-hh);c.fill();}
  c.fillStyle=win;for(let row=0;row<3;row++)for(let k=0;k<3;k++)if(r()<.5)c.fillRect(x0+10+k*18,floorTop-hh+16+row*30,8,13);x0+=hw+r()*30;}
 const tree=time==='nit'?['#0c2a24','#163a30']:time==='tarda'?['#1c3a2c','#2a5a40']:['#2a6a3a','#3a8a4a'];for(const [tx,s] of [[.04,1],[.96,.9],[.5,.6]]){const R=H*.11*s,X=w*tx,Y=floorTop-R*1.1;c.fillStyle=tree[0];c.beginPath();c.arc(X,Y,R,0,TL_TAU);c.arc(X-R*.7,Y+R*.3,R*.7,0,TL_TAU);c.arc(X+R*.7,Y+R*.3,R*.7,0,TL_TAU);c.fill();c.fillStyle=tree[1];c.beginPath();c.arc(X-R*.2,Y-R*.25,R*.55,0,TL_TAU);c.fill();}
 // the roof of the bandstand: a green band with a gilt cornice, a cast-iron lace and the garland of lights
 c.fillStyle=tmV(c,0,roofH,TM_ROOF[time]);c.fillRect(0,0,w,roofH);c.fillStyle=tmMetal(c,0,roofH-6,0,roofH+6,TM_GOLD);c.fillRect(0,roofH-5,w,9);
 c.strokeStyle='#0e2a20';c.lineWidth=3;const nb=Math.max(10,Math.round(w/60));for(let i=0;i<nb;i++){const x0=i*w/nb,x1=(i+1)*w/nb,xm=(x0+x1)/2;c.beginPath();c.moveTo(x0,roofH+4);c.quadraticCurveTo(xm,roofH+26,x1,roofH+4);c.stroke();c.beginPath();c.arc(xm,roofH+14,4,0,TL_TAU);c.stroke();}
 const lit=time!=='mati';for(let i=0;i<8;i++)for(let k=1;k<6;k++){const u=k/6,x0=i*w/8+u*w/8,yy=roofH+8+18*u*(1-u)*4;if(lit)tmGlow(c,x0,yy,12,'rgba(255,230,150,.85)');tmDot(c,x0,yy,3,lit?'#fff3c0':'#e8e0c8');}
 for(const x0 of [w*.015,w*.985]){c.fillStyle=tmMetal(c,x0-7,0,x0+7,0,['#0e2a20','#3a7a5e','#0e2a20']);c.fillRect(x0-7,roofH,14,floorTop-roofH);}
 c.fillStyle=tmV(c,floorTop,H,['#8a4e26','#5a2e12']);c.fillRect(0,floorTop,w,H-floorTop);c.strokeStyle='rgba(40,18,6,.35)';c.lineWidth=2;for(let k=0;k<5;k++){const yy=floorTop+k*k*3+k*5;if(yy<H){c.beginPath();c.moveTo(0,yy);c.lineTo(w,yy);c.stroke();}}
 escVeil(c,d,0,0,w,H);c.fillStyle='rgba(20,16,30,.88)';c.fillRect(0,H,w,h-H);}
const tmDecor=(s,view)=>view?.decor||escDecor({background:s.background,base:s.base,opacity:s.opacity});
// A niche of velvet with a gilt edge and a spotlight from above (with decor); without decor only a thin gilt edge on the base colour.
function tmNiche(c,z,time,plain,d,p=0){const {x,y,w,h}=z,path=()=>{c.beginPath();c.moveTo(z.pts[0][0],z.pts[0][1]);for(const q of z.pts)c.lineTo(q[0],q[1]);c.closePath();};
 if(d.fade>0){path();const v=TM_VELVET[time];c.fillStyle=plain?v[1]:tmV(c,y,y+h,[v[0],v[1],v[2]]);c.fill();
  if(!plain){c.save();path();c.clip();const g=c.createRadialGradient(x+w/2,y+h*.12,4,x+w/2,y+h*.4,h*.8);g.addColorStop(0,`rgba(255,236,190,${(.42+.25*p).toFixed(3)})`);g.addColorStop(1,'rgba(255,236,190,0)');c.fillStyle=g;c.fillRect(x,y,w,h);
   c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x,y+h*.86,w,h*.14);c.restore();}}
 path();c.lineWidth=Math.max(3,w*.02);c.strokeStyle=d.fade<=0&&d.white?'#8a6a2a':'#c99a3a';c.stroke();}
function tmPanel(c,z,id,time,plain,d,{p=0,t=0,beat=0}={}){tmNiche(c,z,time,plain,d,p);const {x,y,w,h}=z,pad=Math.max(6,w*.05);
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x+w/2,y+h-pad*.9,w*.38,Math.max(4,h*.02),0,0,TL_TAU);c.fill();
 return tmDrawInstrument(c,id,x+pad,y+pad,w-2*pad,h-pad*1.6,{p,t,beat});}
// The frame of the model: a large gilt oval, hanging from the roof by two chains, between the roof and the row of niches. Inside, on
// dark velvet, the instrument that is searched (the visual clue on), or a large note with waves (off).
export function tmFrameBox(w,h,zones){const H=h-TL_STRIP,roofH=tmRoofH(h),top=roofH+Math.max(14,H*.03),bottom=(zones.length?Math.min(...zones.map(z=>z.y)):H*.5)-Math.max(10,H*.022),fh=Math.max(60,bottom-top),fw=Math.min(w*.62,fh*.92);return {x:w/2-fw/2,y:top,w:fw,h:fh,cx:w/2,cy:top+fh/2};}
function tmFrame(c,w,h,zones,target,hint){const b=tmFrameBox(w,h,zones),rx=b.w/2,ry=b.h/2,lw=Math.max(8,b.h*.06),roofH=tmRoofH(h);
 for(const sd of [-1,1]){c.strokeStyle=TM_INK;c.lineWidth=4;c.beginPath();c.moveTo(b.cx+sd*rx*.42,roofH);c.lineTo(b.cx+sd*rx*.3,b.cy-ry*.9);c.stroke();c.strokeStyle='#d8b25a';c.lineWidth=2;c.setLineDash([5,4]);c.stroke();c.setLineDash([]);}
 c.save();c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=18;c.shadowOffsetY=6;c.beginPath();c.ellipse(b.cx,b.cy,rx,ry,0,0,TL_TAU);c.fillStyle='#2a1a08';c.fill();c.restore();
 c.beginPath();c.ellipse(b.cx,b.cy,rx,ry,0,0,TL_TAU);tmInk(c,tmMetal(c,b.x,b.y,b.x+b.w,b.y+b.h,TM_GOLD),3);
 // the beads of the gilt moulding
 for(let k=0;k<36;k++){const a=k/36*TL_TAU;tmDot(c,b.cx+Math.cos(a)*(rx-lw*.5),b.cy+Math.sin(a)*(ry-lw*.5),Math.max(1.6,lw*.16),'rgba(255,241,184,.85)');}
 const ix=rx-lw,iy=ry-lw,v=TM_VELVET.nit;c.beginPath();c.ellipse(b.cx,b.cy,ix,iy,0,0,TL_TAU);const g=c.createRadialGradient(b.cx,b.cy-iy*.3,4,b.cx,b.cy,Math.max(ix,iy));g.addColorStop(0,v[1]);g.addColorStop(1,v[2]);c.fillStyle=g;c.fill();c.lineWidth=2.5;c.strokeStyle=TM_INK;c.stroke();
 // a crest on top of the frame, of gilt metal
 const cr=Math.max(10,b.h*.07);c.beginPath();c.moveTo(b.cx-cr,b.y+lw*.2);c.quadraticCurveTo(b.cx-cr*1.2,b.y-cr*1.4,b.cx,b.y-cr*1.6);c.quadraticCurveTo(b.cx+cr*1.2,b.y-cr*1.4,b.cx+cr,b.y+lw*.2);c.closePath();tmInk(c,tmMetal(c,b.cx-cr,b.y-cr*1.6,b.cx+cr,b.y,TM_GOLD),2);
 c.save();c.beginPath();c.ellipse(b.cx,b.cy,ix,iy,0,0,TL_TAU);c.clip();
 if(hint){const bh=iy*1.84,bw=ix*1.6;tmDrawInstrument(c,target,b.cx-bw/2,b.cy-bh/2+iy*.04,bw,bh);}
 else{const R=Math.min(ix,iy);c.fillStyle='#ffe6a0';c.strokeStyle=TM_INK;c.lineWidth=3;c.beginPath();c.ellipse(b.cx-R*.18,b.cy+R*.36,R*.2,R*.15,-.4,0,TL_TAU);c.fill();c.stroke();
  c.beginPath();c.rect(b.cx-R*.02,b.cy-R*.6,R*.08,R*.96);c.fill();c.stroke();c.beginPath();c.moveTo(b.cx+R*.06,b.cy-R*.6);c.quadraticCurveTo(b.cx+R*.4,b.cy-R*.4,b.cx+R*.3,b.cy-R*.08);c.quadraticCurveTo(b.cx+R*.3,b.cy-R*.36,b.cx+R*.06,b.cy-R*.36);c.closePath();c.fill();c.stroke();
  c.strokeStyle='#ffe6a0';c.lineCap='round';for(let k=0;k<3;k++){c.lineWidth=R*.06;c.beginPath();c.arc(b.cx-R*.1,b.cy,R*(.5+k*.16),-.6,.6);c.stroke();c.beginPath();c.arc(b.cx-R*.1,b.cy,R*(.5+k*.16),Math.PI-.6,Math.PI+.6);c.stroke();}c.lineCap='butt';}
 c.restore();return b;}
function tmSmooth(u){return u<=0?0:u>=1?1:u*u*(3-2*u);}
// How strongly the lead instrument sounds at time T of the piece: a pulse at each note it plays.
function tmPulse(beats,T){let p=0;for(const b of beats){const d=T-b;if(d>=0&&d<.6)p=Math.max(p,1-d/.6);}return p;}
// The board: square, bandstand, niches and frame from the sheet; then the instrument in focus (or the one that answers) plays, the veil
// and the contour of the focus go on top, and the frame glows and sends out waves while the clue sounds.
export function tmBoard(c,w,h,state,game,s,view){const time=tmTime(state.round||0),plain=!!s.plainScene,still=!!s.reduced,ids=view.options.map(o=>o.value),zones=view.zones,t=still?0:view.clock||0,target=tmTarget(state.round||0,s).id,hint=!!state.hint,d=tmDecor(s,view),dk=escDecorKey(d)+(d.fade>0?'':'|none'+d.base);
 tlSheet(c,['tm48',w,h,time,plain,ids.join(),target,hint].join('|')+dk,x=>{tmSquare(x,w,h,time,plain,d);zones.forEach((z,i)=>tmPanel(x,z,ids[i],time,plain,d));tmFrame(x,w,h,zones,target,hint);});
 const sounding=view.sounding??-1,sp=view.soundLevel||0;
 if(sounding>=0&&zones[sounding]){const z=zones[sounding],pad=Math.max(6,z.w*.05),id=ids[sounding];
  if(!still){c.save();c.beginPath();c.moveTo(z.pts[0][0],z.pts[0][1]);for(const q of z.pts)c.lineTo(q[0],q[1]);c.closePath();c.clip();tlSheet(c,['tm48-bg',w,h,time,plain].join('|')+dk,x=>tmSquare(x,w,h,time,plain,d));tmPanel(c,z,id,time,plain,d,{p:sp,t,beat:t});c.restore();}
  const [mx,my]=tmMouth(id,z.x+pad,z.y+pad,z.w-2*pad,z.h-pad*1.6);tmWaves(c,mx,my,Math.min(z.w,z.h)*.35,sp,t,still);}
 tlVeil(c,w,h-TL_STRIP,zones,view.lights,.35*(view.wait??(view.waiting?1:0)));
 const f=view.focus;if(f>=0&&zones[f]&&!view.waiting)tlRing(c,zones[f].pts,view.progress,1,Math.max(.6,Math.min(1.2,w/1280)),view.ring);
 const cue=view.cue||0;if(cue>0){const b=tmFrameBox(w,h,zones);c.save();c.beginPath();c.ellipse(b.cx,b.cy,b.w/2+6,b.h/2+6,0,0,TL_TAU);c.lineWidth=Math.max(4,b.h*.03);c.strokeStyle=`rgba(255,226,150,${(.6*cue).toFixed(3)})`;c.stroke();c.restore();
  tmWaves(c,b.cx,b.cy,b.w*.62,cue,t,still);}}
// The result. The right instrument: its niche opens to the whole stage and the instrument plays its piece in the middle of the
// bandstand, with a warm light and golden motes at each note. Another one: the board stays, the chosen instrument plays its taste,
// with no sign of a mistake, and the clue then sounds again.
export function tmResult(c,w,h,state,game,s,view,T){const zones=view.zones,i=Math.max(0,Math.min(zones.length-1,view.chosen??0)),z=zones[i],id=view.picked||view.options[i]?.value||'arpa',time=tmTime(state.round||0),still=!!s.reduced,plain=!!s.plainScene;
 if(!view.correct){const p=Math.max(0,1-T/1.2);tmBoard(c,w,h,state,game,s,{...view,focus:-1,progress:null,lights:zones.map((_,k)=>k===i?1:TL_DIM),sounding:i,soundLevel:.4+.6*p,clock:view.clock});return;}
 const scene=()=>tmStageScene(c,w,h,id,time,plain,still?Math.min(T,TM_PIECE):T,state.round||0,still,tmDecor(s,view));
 if(T<1&&z){tmBoard(c,w,h,state,game,s,{...view,focus:-1,progress:null,lights:zones.map((_,k)=>k===i?1:TL_DIM)});const box=tlOpenBox(z,w,h,T);c.save();tlClipOpen(c,z,box);scene();c.restore();return;}
 scene();}
function tmStageScene(c,w,h,id,time,plain,T,round,still,d){tlSheet(c,['tm48-stage',w,h,time,plain].join('|')+escDecorKey(d)+(d.fade>0?'':'|none'+d.base),x=>tmSquare(x,w,h,time,plain,d));
 const H=h-TL_STRIP,roofH=tmRoofH(h),floorTop=H-Math.min(70,H*.1),base=floorTop+Math.min(26,(H-floorTop)*.45),bh=Math.max(60,base-roofH-40),bw=Math.min(w*.7,bh*TM_BW/TM_BH),bx=w/2-bw/2,by=base-bh;
 const beats=tmBeats(id,round),p=still?0:tmPulse(beats,T),t=still?0:T,end=tmSmooth((T-6)/1.5);
 if(!plain&&d.fade>0){c.save();const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,`rgba(255,236,190,${(.28+.2*p).toFixed(3)})`);g.addColorStop(1,'rgba(255,236,190,.04)');c.fillStyle=g;c.beginPath();c.moveTo(w/2-w*.08,roofH);c.lineTo(w/2+w*.08,roofH);c.lineTo(w/2+bw*.75,floorTop+20);c.lineTo(w/2-bw*.75,floorTop+20);c.fill();c.restore();}
 c.fillStyle='rgba(30,12,4,.4)';c.beginPath();c.ellipse(w/2,base-bh*.01,bw*.42,Math.max(8,bh*.03),0,0,TL_TAU);c.fill();
 tmDrawInstrument(c,id,bx,by,bw,bh,{p,t,beat:t});const [mx,my]=tmMouth(id,bx,by,bw,bh);tmWaves(c,mx,my,bw*.45,Math.max(p,end*.4),t,still);
 // golden motes rise from the instrument at each note and settle at the end
 if(!still){const r=tlRng(77);for(let j=0;j<26;j++){const b=beats[j%beats.length]||0,dd=T-b-(j%3)*.05;if(dd<0||dd>2.4)continue;const x0=w/2+(r()-.5)*bw*.9,y0=by+bh*(.2+r()*.5),a=(1-dd/2.4)*.8;tmDot(c,x0+Math.sin(dd*2+j)*12,y0-dd*bh*.18,2+r()*3,`rgba(255,226,140,${a.toFixed(3)})`);}}}
