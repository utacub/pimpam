// Encaixos de fusta (EN12, 0.45): the five worlds, each with its four lights. A scene is painted once as pieces of wood set into the board
// (statics, through the region helper R of encaix-art.js: flat enamel, the grain turned a little for each piece, a fine dark cut between
// them), plus the pieces that xmSlide in their grooves during the party (movers: sprites made with the same pipeline as the figures, with a
// path by u, 0 at the start of the board and 1 at the end of its party), and the places of the five figures (holes). Scene units: 1600 × 640;
// the safe area, always on the screen, is x 170–1430 and y 40–600; the grounds and skies paint on from x −800 to 2400 for very wide panels.
import {xb,xr,xc,xe,xp,xF,xD,XC} from './encaix-figures.js';
const XM_TAU=Math.PI*2;
const xmRect=(x,y,w,h)=>g=>{g.beginPath();g.rect(x,y,w,h);};
const xmCirc=(x,y,r)=>g=>{g.beginPath();g.arc(x,y,r,0,XM_TAU);};
const xmPoly=pts=>g=>xp(g,pts);
const xmBlob=pts=>g=>xb(g,pts);
const xmEll=(x,y,rx,ry,rot=0)=>g=>xe(g,x,y,rx,ry,rot);
const xmCloud=(x,y,s)=>g=>{g.beginPath();g.moveTo(x-40*s,y+30*s);g.bezierCurveTo(x-90*s,y+30*s,x-80*s,y-40*s,x-20*s,y-25*s);g.bezierCurveTo(x-10*s,y-90*s,x+110*s,y-95*s,x+120*s,y-30*s);g.bezierCurveTo(x+190*s,y-40*s,x+200*s,y+30*s,x+150*s,y+30*s);g.closePath();};
const xmWaveTop=(w,h,amp,n=2)=>g=>{g.beginPath();g.moveTo(0,h);g.lineTo(0,amp+2);for(let x=0;x<=w;x+=10)g.lineTo(x,amp+2-Math.sin(x/w*XM_TAU*n)*amp);g.lineTo(w,h);g.closePath();};
// a sprite part of a xmMover: one piece, its own paint
const xmMover=(id,w,h,paint,path,o={})=>({id,w,h,pv:[w/2,h/2],paint,path,...o});
const xmSun=(col,rays=10)=>(g,M)=>{xc(g,80,80,46);xF(g,M,col);for(let i=0;i<rays;i++){const a=i/rays*XM_TAU;xp(g,[[80+Math.cos(a-.12)*54,80+Math.sin(a-.12)*54],[80+Math.cos(a)*78,80+Math.sin(a)*78],[80+Math.cos(a+.12)*54,80+Math.sin(a+.12)*54]]);xF(g,M,col);}xD(M,()=>{xc(g,80,80,46);g.lineWidth=2;g.strokeStyle='rgba(0,0,0,.12)';g.stroke();});};
const xmMoon=(g,M)=>{xc(g,80,80,54);xF(g,M,'#fff1c2');xD(M,()=>{for(const [x,y,r] of [[60,64,9],[96,92,12],[74,104,6]]){xc(g,x,y,r);g.fillStyle='rgba(120,100,60,.22)';g.fill();}});};
const xmCloudPiece=(col,s=1)=>(g,M)=>{xmCloud(110*s,95*s,s)(g);xF(g,M,col);};
const xmCloudMover=(id,col,s,path)=>xmMover(id,Math.ceil(330*s),Math.ceil(130*s),xmCloudPiece(col,s),path);
const xmArc=(x0,y0,x1,y1,lift)=>u=>({x:x0+(x1-x0)*u,y:y0+(y1-y0)*u-Math.sin(u*Math.PI)*lift,r:0,s:1,a:1});
const xmSlide=(x0,y0,dx,dy=0)=>u=>({x:x0+dx*u,y:y0+dy*u,r:0,s:1,a:1});
const xmStill=(x,y,r=0)=>()=>({x,y,r,s:1,a:1});
// a falling piece (leaves, flakes, confetti): from the top, k staggers it; it falls four times during a party and sways
const xmFall=(x,k,speed=1,sway=30)=>(u,t)=>{const v=(u*4*speed+k*.37)%1;return {x:x+Math.sin(v*XM_TAU+k)*sway,y:20+v*600,r:Math.sin(v*XM_TAU*2+k)*.6,s:1,a:1};};
// a band of waves: one long piece (no seams), n periods over its width w
const xmWave=(col,amp,h=130,w=1800,n=9)=>(g,M)=>{xmWaveTop(w,h,amp,n)(g);xF(g,M,col);xD(M,()=>{g.beginPath();for(let x=0;x<=w;x+=10)g.lineTo(x,amp+14-Math.sin(x/w*XM_TAU*n)*amp*.8);g.lineWidth=3;g.strokeStyle='rgba(255,255,255,.35)';g.stroke();});};
// ── palettes by light ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const XM_PAL={
 port:{mati:{sky:'#bfe3f4',xmCloud:'#f6f8fb',sun:'#ffd34d',sea:['#58b6e3','#2f93cf','#1f6fb0'],hill:'#8ccc6c',sand:'#f2d28a',houses:['#ff8a6a','#ffd25e','#7fcbe8','#ffa9bb','#fff3dc','#ffd25e','#ff8a6a'],roof:'#d9573a',pier:'#a8744a',win:'#26324a',lamp:null},
  migdia:{sky:'#6fc3ef',xmCloud:'#ffffff',sun:'#ffcc33',sea:['#2a9fd6','#1f7fc2','#1a5fa8'],hill:'#7cc464',sand:'#f6d98f',houses:['#ff7a59','#ffd25e','#6fc3e6','#ff9fb2','#fff3dc','#ffd25e','#ff7a59'],roof:'#d9573a',pier:'#a8744a',win:'#26324a',lamp:null},
  capvespre:{sky:'#ffb07a',xmCloud:'#ffd0c4',sun:'#ff6a3d',sea:['#6a6fb8','#4a4f99','#2f3677'],hill:'#5e8a56',sand:'#e8c07a',houses:['#e8705a','#f2bf54','#6aa8c4','#e88ea0','#f4e4c8','#f2bf54','#e8705a'],roof:'#b4482f',pier:'#8a5e3a',win:'#ffd36a',lamp:'#ffd36a'},
  nit:{sky:'#1b2a52',xmCloud:'#2e3d6b',sun:null,sea:['#1f3a73','#17305e','#102347'],hill:'#24473a',sand:'#8a7a5a',houses:['#6a4a5a','#7a6a48','#3f5f78','#7a5a6a','#7a7060','#7a6a48','#6a4a5a'],roof:'#4a2a30',pier:'#5a3e2a',win:'#ffd36a',lamp:'#ffe29a'}},
 circ:{entrada:{back:'#9b2a2a',stripe:['#e94b3c','#fff3dc'],floor:'#e2bb7a',ring:'#d9573a',curtain:'#8f6be0',gold:'#ffd96a',light:null},
  llums:{back:'#3a1f4f',stripe:['#b23a48','#d8c8e8'],floor:'#c9a66a',ring:'#9b2a2a',curtain:'#4a2a6a',gold:'#ffd96a',light:'#fff2b0'},
  confeti:{back:'#2a9fd6',stripe:['#ff6fa3','#fff3dc'],floor:'#f2d28a',ring:'#ff8a3d',curtain:'#e94b3c',gold:'#ffd96a',light:null},
  final:{back:'#26324a',stripe:['#ffd96a','#e94b3c'],floor:'#e2bb7a',ring:'#ffd96a',curtain:'#b23a48',gold:'#ffd96a',light:'#fff2b0'}},
 ciutat:{mercat:{sky:'#bfe3f4',sun:'#ffd34d',bld:['#ffb37a','#f7e4b8','#9fd0e8','#ffc1c8','#d9d2f0'],roof:'#b4482f',street:'#9aa3ad',pave:'#d8d2c4',win:'#5a7a9a',awn:['#e94b3c','#5cb85c'],rail:'#6b6f75',moon:null,lamp:null},
  pluja:{sky:'#9fb0bf',sun:null,bld:['#c9a98a','#d8d0bc','#8fb0c4','#c9a0a8','#b8b0cc'],roof:'#7a4a3a',street:'#6f7881',pave:'#b8b2a4',win:'#4a6a8a',awn:['#b23a48','#2f7d32'],rail:'#4a4e55',moon:null,lamp:null},
  festa:{sky:'#7fcbe8',sun:'#ffcc33',bld:['#ff9fb2','#fff3dc','#7fd8c0','#ffd25e','#c8b8f0'],roof:'#d9573a',street:'#9aa3ad',pave:'#e8e0cc',win:'#5a7a9a',awn:['#ff6fa3','#2a9fd6'],rail:'#6b6f75',moon:null,lamp:null},
  nit:{sky:'#1b2a52',sun:null,bld:['#4a3a5a','#5a5048','#2f4a6a','#5a3a48','#4a4a6a'],roof:'#2a1a20',street:'#3a3f4a',pave:'#6a6458',win:'#ffd36a',awn:['#8a2a30','#2f5a3a'],rail:'#8a8e95',moon:'#fff1c2',lamp:'#ffe29a'}},
 bosc:{primavera:{sky:'#cfeafa',sun:'#ffd96a',hill:'#a8d890',ground:'#8ccc6c',trunk:'#8d5a2b',leaf:['#9ad04a','#5cb85c','#ffa9bb'],water:'#58b6e3',extra:'flors'},
  estiu:{sky:'#7fcbe8',sun:'#ffcc33',hill:'#6aa84a',ground:'#5cb85c',trunk:'#7a4a22',leaf:['#2f7d32','#5cb85c','#3f9a40'],water:'#2a9fd6',extra:null},
  tardor:{sky:'#c8d8e0',sun:'#ffb347',hill:'#b8a060',ground:'#c89a5f',trunk:'#6a4020',leaf:['#ff8a3d','#e94b3c','#ffc53a'],water:'#5a9ab8',extra:'fulles'},
  hivern:{sky:'#dfe8f0',sun:null,hill:'#eef2f6',ground:'#fdfdff',trunk:'#5a3a22',leaf:['#eef2f6','#ffffff','#d8e4ee'],water:'#9ac8e8',extra:'neu'}},
 espai:{lluna:{sky:'#0f1735',star:'#fff6dc',ground:'#9aa0ad',crater:'#7c838f',extra:'lluna'},planetes:{sky:'#141a3f',star:'#fff6dc',ground:null,crater:null,extra:'planetes'},estels:{sky:'#0b1230',star:'#ffe9a0',ground:null,crater:null,extra:'estels'},terra:{sky:'#101a40',star:'#fff6dc',ground:'#8a8f9a',crater:'#6e737f',extra:'terra'}}};
// ── the worlds ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const XM_HOLES={port:{barca:[760,440,.85],gavina:[560,170,.8],pescadora:[1250,320,.75],pop:[1120,515,.7],cranc:[330,535,.62]},
 circ:{monocicle:[480,420,.8],malabarista:[800,400,.8],pallassa:[1150,470,.85],trapezi:[1000,170,.75],gos:[300,520,.7]},
 ciutat:{tramvia:[700,520,.8],bombera:[1200,330,.78],forner:[380,380,.7],gat:[520,170,.7],paraigua:[1000,400,.72]},
 bosc:{esquirol:[420,200,.72],mussol:[1150,170,.75],cervol:[820,360,.8],erico:[1250,520,.7],guineu:[420,500,.75]},
 espai:{coet:[430,330,.85],astronauta:[820,320,.8],planeta:[1220,220,.8],alien:[1130,480,.7],cometa:[650,110,.75]}};
function xmPort(light){const p=XM_PAL.port[light],night=light==='nit';
 const statics=(x,R,o)=>{R(xmRect(-800,-400,3200,1440),p.sky,0,0);
  if(night)for(let i=0;i<52;i++){const sx=(i*613)%3200-800,sy=20+(i*271)%230;R(xmCirc(sx,sy,3+(i%3)),'#fff6dc',0,i,true);}
  R(xmBlob([[-800,300],[300,200,120,200],[640,290,480,180],[900,250,780,210],[1150,310,1040,230],[1150,360],[-800,360]]),p.hill,10,5);
  const hc=p.houses;for(let i=-4;i<7;i++){const bx=40+i*124,w=120,h=118+(((i+7)*37)%42),by=330-h,j=(i+7)%7;R(xmRect(bx,by,w,h),hc[j],90,j*50);R(xmPoly([[bx-6,by],[bx+w/2,by-46],[bx+w+6,by]]),p.roof,20,j*40);
   x.save();x.fillStyle=p.win;x.globalAlpha=night||light==='capvespre'?.95:.75;x.fillRect(bx+22,by+36,26,36);x.fillRect(bx+72,by+36,26,36);x.fillStyle=p.win;x.fillRect(bx+47,by+h-54,26,54);x.restore();}
  R(xmPoly([[-800,330],[920,330],[900,362],[-800,362]]),p.sand,0,2);R(xmRect(-800,350,3200,700),p.sea[2],0,0);
  R(xmRect(1120,300,1280,42),p.pier,0,7);for(let i=0;i<13;i++)R(xmRect(1150+i*96,340,24,300),p.pier,90,i*20);
  if(p.lamp){for(const lx of [1180,1420]){R(xmRect(lx-4,220,8,84),'#3a2414',90,1);R(xmCirc(lx,214,12),p.lamp,0,0,true);x.save();const g=x.createRadialGradient(lx,214,6,lx,214,70);g.addColorStop(0,'rgba(255,226,154,.45)');g.addColorStop(1,'rgba(255,226,154,0)');x.fillStyle=g;x.beginPath();x.arc(lx,214,70,0,XM_TAU);x.fill();x.restore();}}};
 const movers=[];if(p.sun)movers.push(xmMover('sol',160,160,xmSun(p.sun),xmArc(1300,170,1440,80,30)));else movers.push(xmMover('lluna',160,160,xmMoon,xmArc(1300,150,1440,90,20)));
 movers.push(xmCloudMover('nuvol1',p.xmCloud,1.1,xmSlide(240,50,180)),xmCloudMover('nuvol2',p.xmCloud,.8,xmSlide(1000,46,140)));
 [[0,376,22,0],[1,448,26,1],[2,520,30,2]].forEach(([i,y,amp,k])=>movers.push(xmMover('ona'+i,2800,130,xmWave(p.sea[i],amp,130,2800,14),(u,t)=>({x:800+Math.sin(u*XM_TAU*(1+k*.5))*40*(k+1)*.5,y:y+65,r:0,s:1,a:1}))));
 return {world:'port',light,pal:p,dark:night,statics,movers,holes:XM_HOLES.port};}
function xmCircus(light){const p=XM_PAL.circ[light];
 const statics=(x,R,o)=>{R(xmRect(-800,-400,3200,1440),p.back,0,0);
  for(let i=-6;i<18;i++){R(xmPoly([[i*140-20,0],[i*140+120,0],[800,260]]),p.stripe[(i+6)%2],(i+6)*15,(i+6)*30);}
  if(light==='final')for(let i=-5;i<14;i++){const sx=120+i*170,sy=300+((i+5)%2)*40;R(xmCirc(sx,sy,12),p.gold,0,i+5,true);}
  R(xmRect(-800,420,3200,620),p.floor,0,3);R(xmEll(800,430,1700,40),p.ring,0,0);R(xmEll(800,432,1660,28),p.floor,0,2);
  R(xmPoly([[-800,250],[120,250],[200,1040],[-800,1040]]),p.curtain,90,4);R(xmPoly([[1480,250],[2400,250],[2400,1040],[1400,1040]]),p.curtain,90,5);
  if(light==='entrada'){R(xmBlob([[640,240],[960,240],[940,470,980,360],[660,470,620,360]]),p.curtain,90,9);R(xmRect(640,236,320,20),p.gold,0,0);}
  for(const [tx,ty] of [[140,262],[1460,262]]){R(xmCirc(tx,ty,16),p.gold,0,0,true);}};
 const movers=[xmMover('garlanda',720,80,(g,M)=>{for(let i=0;i<9;i++){const fx=20+i*85,fy=20+Math.sin(i/8*Math.PI)*30;xp(g,[[fx,fy],[fx+40,fy],[fx+20,fy+44]]);xF(g,M,[XC.red,XC.yellow,XC.teal][i%3]);}xD(M,()=>{g.beginPath();g.moveTo(20,20);g.quadraticCurveTo(360,110,700,20);g.lineWidth=3;g.strokeStyle=XC.dark;g.stroke();});},(u,t)=>({x:800,y:300,r:Math.sin(u*XM_TAU*2)*.03,s:1,a:1}))];
 if(light==='llums')movers.push(xmMover('focus1',120,460,(g,M)=>{xp(g,[[50,0],[70,0],[120,460],[0,460]]);xF(g,M,p.light);},(u)=>({x:300+u*500,y:230,r:-.3+u*.6,s:1,a:.55})),xmMover('focus2',120,460,(g,M)=>{xp(g,[[50,0],[70,0],[120,460],[0,460]]);xF(g,M,p.light);},(u)=>({x:1300-u*500,y:230,r:.3-u*.6,s:1,a:.55})));
 if(light==='confeti')for(let k=0;k<8;k++)movers.push(xmMover('confeti'+k,30,30,(g,M)=>{xc(g,15,15,11);xF(g,M,[XC.pink,XC.yellow,XC.teal,XC.lime][k%4]);},xmFall(200+k*170,k,.9,40)));
 if(light==='final')movers.push(xmMover('estrella',200,200,(g,M)=>{g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?40:96;g.lineTo(100+Math.cos(a)*r,100+Math.sin(a)*r);}g.closePath();xF(g,M,p.gold);},(u)=>({x:800,y:130,r:u*XM_TAU*.5,s:1,a:1})));
 return {world:'circ',light,pal:p,dark:light==='llums'||light==='final',statics,movers,holes:XM_HOLES.circ};}
function xmCiutat(light){const p=XM_PAL.ciutat[light],night=light==='nit';
 const statics=(x,R,o)=>{R(xmRect(-800,-400,3200,1440),p.sky,0,0);if(night)for(let i=0;i<44;i++){const sx=(i*613)%3200-800,sy=20+(i*271)%200;R(xmCirc(sx,sy,3),'#fff6dc',0,i,true);}
  const B=[[60,230,300,270],[380,240,260,260],[660,200,320,300],[1000,250,300,250],[1320,290,240,210],[-280,250,300,250],[1590,230,280,270],[-620,290,300,210],[1900,260,300,240]];B.forEach(([bx,by,w,h],i)=>{R(xmRect(bx,by,w,h),p.bld[i%5],90,i*40);R(xmRect(bx-8,by-14,w+16,18),p.roof,0,i*20);
   for(let r=0;r<Math.floor((h-60)/70);r++)for(let c=0;c<Math.floor(w/70);c++){x.save();x.fillStyle=p.win;x.globalAlpha=night?((r+c+i)%3?.95:.3):.8;x.fillRect(bx+22+c*70,by+26+r*70,30,38);x.restore();}});
  R(xmRect(1390,60,100,220),'#d8d2c4',90,3);R(xmPoly([[1380,60],[1440,10],[1500,60]]),p.roof,0,0);R(xmCirc(1440,120,34),'#fff3dc',0,0);
  R(xmPoly([[-800,500],[2400,500],[2400,1040],[-800,1040]]),p.street,0,0);R(xmRect(-800,470,3200,34),p.pave,0,1);
  x.save();x.strokeStyle=p.rail;x.lineWidth=6;x.beginPath();x.moveTo(-800,560);x.lineTo(2400,560);x.moveTo(-800,600);x.lineTo(2400,600);x.stroke();x.restore();
  R(xmRect(240,330,280,170),p.bld[0],90,7);R(xmRect(272,380,74,120),'#8d5a2b',0,0);R(xmRect(380,380,110,70),'#fff3dc',0,0);
  for(let i=0;i<7;i++)R(xmPoly([[240+i*40,318],[280+i*40,318],[290+i*40,350],[230+i*40,350]]),p.awn[i%2],0,i*9);
  if(light==='mercat'){R(xmRect(1040,420,200,80),'#8d5a2b',0,2);for(let i=0;i<5;i++)R(xmPoly([[1030+i*44,400],[1070+i*44,400],[1080+i*44,424],[1020+i*44,424]]),p.awn[(i+1)%2],0,i*5);for(let i=0;i<6;i++)R(xmCirc(1060+(i%3)*50,408+Math.floor(i/3)*-4,12),[XC.red,XC.orange,XC.green][i%3],0,i,true);}
  if(light==='pluja')for(const [px,py,rw] of [[300,610,120],[760,626,160],[1240,616,140]])R(xmEll(px,py,rw,12),'#b8c8d4',0,0,true);
  if(light==='festa')for(let i=-8;i<22;i++){const fy=90+Math.abs(Math.sin(i/13*Math.PI))*60;R(xmPoly([[90+i*110,fy],[130+i*110,fy],[110+i*110,fy+40]]),[XC.red,XC.yellow,XC.teal,XC.pink][(i+8)%4],0,i+8,true);}
  if(p.lamp)for(const lx of [600,1360]){R(xmRect(lx-5,330,10,170),'#3a2414',90,1);R(xmCirc(lx,322,14),p.lamp,0,0,true);x.save();const g=x.createRadialGradient(lx,322,6,lx,322,90);g.addColorStop(0,'rgba(255,226,154,.45)');g.addColorStop(1,'rgba(255,226,154,0)');x.fillStyle=g;x.beginPath();x.arc(lx,322,90,0,XM_TAU);x.fill();x.restore();}};
 const movers=[xmMover('busca',8,70,(g,M)=>{xr(g,2,0,5,40,2);xF(g,M,XC.dark);},(u)=>({x:1440,y:120,r:u*XM_TAU,s:1,a:1}),{pivot:[4,36]}),xmMover('busca2',8,70,(g,M)=>{xr(g,1,10,6,30,2);xF(g,M,XC.dark);},(u)=>({x:1440,y:120,r:u*XM_TAU/12+.9,s:1,a:1}),{pivot:[4,36]})];
 if(p.sun)movers.push(xmMover('sol',160,160,xmSun(p.sun),xmArc(160,110,300,80,20)));if(p.moon)movers.push(xmMover('lluna',160,160,xmMoon,xmArc(200,116,320,80,10)));
 for(let k=0;k<3;k++)movers.push(xmMover('colom'+k,60,40,(g,M)=>{xe(g,30,22,16,10);xF(g,M,XC.grey);xc(g,44,14,7);xF(g,M,XC.grey);},(u)=>({x:150+k*60+u*300,y:452+k*6-Math.sin(u*Math.PI)*(k?0:40),r:0,s:1,a:1})));
 if(light==='pluja')for(let k=0;k<7;k++)movers.push(xmMover('gota'+k,12,40,(g,M)=>{xb(g,[[6,0],[12,26,12,14],[6,40,10,38],[0,26,0,38],[6,0,0,14]]);xF(g,M,XC.sky);},xmFall(120+k*200,k,1.6,6)));
 if(light==='festa')for(let k=0;k<4;k++)movers.push(xmMover('globus'+k,60,90,(g,M)=>{xe(g,30,32,26,32);xF(g,M,[XC.red,XC.yellow,XC.teal,XC.pink][k]);xp(g,[[24,62],[36,62],[30,72]]);xF(g,M,[XC.red,XC.yellow,XC.teal,XC.pink][k]);xD(M,()=>{g.beginPath();g.moveTo(30,72);g.lineTo(28,90);g.lineWidth=2;g.strokeStyle=XC.dark;g.stroke();});},(u,t)=>({x:260+k*330+Math.sin(u*XM_TAU+k)*20,y:560-((u*1.2+k*.25)%1)*560,r:Math.sin(u*XM_TAU*2+k)*.15,s:1,a:1})));
 return {world:'ciutat',light,pal:p,dark:night,statics,movers,holes:XM_HOLES.ciutat};}
function xmBosc(light){const p=XM_PAL.bosc[light],winter=light==='hivern';
 const tree=(R,x0,y0,s,k)=>{R(xmRect(x0-18*s,y0-10,36*s,230),p.trunk,90,k);if(!winter){R(xmCirc(x0,y0-70*s,110*s),p.leaf[0],k*20,k);R(xmCirc(x0-80*s,y0-20*s,80*s),p.leaf[1],k*20+30,k+1);R(xmCirc(x0+86*s,y0-26*s,84*s),p.leaf[2],k*20+60,k+2);R(xmCirc(x0+10*s,y0-150*s,70*s),p.leaf[1],k*20+90,k+3);}
  else{for(const [dx,dy,a] of [[-70,-60,-.9],[70,-70,.9],[0,-140,0],[-40,-130,-.5],[50,-120,.6]]){R(xmPoly([[x0,y0-10],[x0+dx*s-8,y0+dy*s],[x0+dx*s+8,y0+dy*s]]),p.trunk,a*57,k);R(xmEll(x0+dx*s,y0+dy*s-4,18*s,7*s),'#ffffff',0,k,true);}}};
 const statics=(x,R,o)=>{R(xmRect(-800,-400,3200,1440),p.sky,0,0);R(xmBlob([[-800,330],[400,220,160,220],[900,300,700,200],[1600,250,1300,180],[2400,300,2000,200],[2400,480],[-800,480]]),p.hill,5,3);
  R(xmRect(-800,470,3200,570),p.ground,0,2);tree(R,400,480,1.1,1);tree(R,1150,440,1,2);tree(R,1500,470,.7,3);tree(R,120,460,.6,4);tree(R,-220,470,.9,5);tree(R,1880,460,.9,6);tree(R,-640,480,.7,7);tree(R,2260,470,.8,8);
  R(xmBlob([[-800,560],[2400,572],[2400,626],[-800,618]]),p.water,0,0);
  if(p.extra==='flors')for(let i=-8;i<22;i++){R(xmCirc(120+i*105,500+((i+9)%3)*22,8),[XC.pink,XC.yellow,XC.white][(i+9)%3],0,i+9,true);}
  if(light==='estiu')for(let i=-4;i<10;i++)R(xmEll(260+i*220,505+((i+4)%2)*10,40,10),p.hill,0,i+4,true);
  if(winter)for(let i=-3;i<8;i++)R(xmEll(200+i*300,520+((i+3)%2)*14,80,18),'#eef2f6',0,i+3,true);};
 const movers=[];if(p.sun)movers.push(xmMover('sol',160,160,xmSun(p.sun),xmArc(880,100,980,60,20)));movers.push(xmCloudMover('nuvol',winter?'#cfd8e0':'#ffffff',.9,xmSlide(600,60,-150)));
 movers.push(xmMover('aigua',2800,70,(g,M)=>{xmWaveTop(2800,70,8,21)(g);xF(g,M,p.water);xD(M,()=>{g.beginPath();for(let x=0;x<=2800;x+=10)g.lineTo(x,30-Math.sin(x/2800*XM_TAU*21)*6);g.lineWidth=3;g.strokeStyle='rgba(255,255,255,.4)';g.stroke();});},(u)=>({x:720+u*160,y:600,r:0,s:1,a:1})));
 const bit=p.extra==='fulles'?(g,M)=>{xb(g,[[14,2],[26,14,24,4],[14,26,24,24],[2,14,4,24],[14,2,4,4]]);xF(g,M,XC.orange);}:p.extra==='neu'?(g,M)=>{xc(g,14,14,9);xF(g,M,'#ffffff');}:(g,M)=>{xe(g,14,14,10,6,.5);xF(g,M,XC.pink);};
 if(p.extra)for(let k=0;k<7;k++)movers.push(xmMover('tros'+k,28,28,bit,xmFall(180+k*200,k,p.extra==='neu'?.6:.8,36)));
 return {world:'bosc',light,pal:p,dark:false,statics,movers,holes:XM_HOLES.bosc};}
function xmEspai(light){const p=XM_PAL.espai[light];
 const statics=(x,R,o)=>{R(xmRect(-800,-400,3200,1440),p.sky,0,0);for(let i=0;i<120;i++){const sx=(i*613+97)%3200-800,sy=(i*271+31)%640;R(xmCirc(sx,sy,2+(i%3)),p.star,0,i,true);}
  if(light==='lluna'){R(xmBlob([[-800,470],[400,430,-200,420],[900,470,700,440],[1600,440,1300,420],[2400,470,2000,420],[2400,1040],[-800,1040]]),p.ground,0,0);for(const [cx,cy,r] of [[300,540,44],[760,580,30],[1200,530,52],[1500,590,26]]){R(xmEll(cx,cy,r,r*.45),p.crater,0,0);}}
  if(light==='planetes'){R(xmCirc(260,560,160),'#e07a4a',0,1);R(xmCirc(260,560,160),'#e07a4a',0,1);x.save();x.beginPath();x.arc(260,560,160,0,XM_TAU);x.clip();R(xmRect(60,520,400,26),'#f2b06a',0,2);R(xmRect(60,590,400,16),'#c85a3a',0,3);x.restore();R(xmCirc(1420,520,110),'#7fd8c0',0,4);x.save();x.beginPath();x.arc(1420,520,110,0,XM_TAU);x.clip();R(xmEll(1380,500,40,24),'#5cb85c',0,5);R(xmEll(1460,560,30,18),'#5cb85c',0,6);x.restore();}
  if(light==='terra'){R(xmBlob([[-800,540],[2400,520,800,470],[2400,1040],[-800,1040]]),p.ground,0,0);for(const [cx,cy,r] of [[400,580,40],[1100,570,36]])R(xmEll(cx,cy,r,r*.4),p.crater,0,0);}
  if(light==='estels')for(let i=-3;i<8;i++){const sx=200+i*300,sy=80+((i+3)%2)*120;R(xmPoly([[sx,sy],[sx+120,sy-60],[sx+124,sy-54],[sx+8,sy+6]]),'rgba(255,233,160,.6)',0,i,true);}};
 const movers=[xmMover('satelit',120,70,(g,M)=>{xr(g,0,25,40,20,3);xF(g,M,XC.blue);xr(g,80,25,40,20,3);xF(g,M,XC.blue);xr(g,44,16,32,38,6);xF(g,M,XC.grey);xD(M,()=>{for(let k=0;k<3;k++){xr(g,4+k*12,28,8,14);g.fillStyle=XC.navy;g.fill();xr(g,84+k*12,28,8,14);g.fill();}});},(u)=>({x:200+u*1200,y:70+Math.sin(u*Math.PI)*60,r:u*1.2,s:1,a:1}))];
 if(light==='terra')movers.push(xmMover('terra',420,420,(g,M)=>{xc(g,210,210,200);xF(g,M,XC.teal);xD(M,()=>{g.save();xc(g,210,210,200);g.clip();xb(g,[[120,140],[220,100,160,90],[260,200,280,150],[160,260,200,240],[100,200,110,240]]);g.fillStyle=XC.green;g.fill();xb(g,[[280,250],[360,230,320,210],[380,320,390,280],[300,340,330,350]]);g.fill();xe(g,160,70,40,14,-.4);g.fillStyle='rgba(255,255,255,.7)';g.fill();xe(g,300,120,50,14,.3);g.fill();g.restore();});},(u)=>({x:1250,y:620-u*140,r:u*.3,s:1,a:1})));
 if(light==='estels')for(let k=0;k<4;k++)movers.push(xmMover('fugac'+k,160,40,(g,M)=>{xp(g,[[0,30],[120,6],[160,0],[130,16],[10,38]]);xF(g,M,XC.gold);},(u,t)=>{const v=(u*3+k*.31)%1;return {x:-100+v*1900+k*120,y:60+k*110+v*160,r:.2,s:1,a:1};}));
 if(light==='lluna')movers.push(xmMover('bandera',70,120,(g,M)=>{xr(g,4,0,6,120,2);xF(g,M,XC.grey);xr(g,10,6,56,38,2);xF(g,M,XC.red);xD(M,()=>{xr(g,10,18,56,10);g.fillStyle=XC.white;g.fill();});},(u)=>({x:980,y:420,r:Math.sin(u*XM_TAU*2)*.03,s:1,a:1})));
 return {world:'espai',light,pal:p,dark:true,statics,movers,holes:XM_HOLES.espai};}
const EX_SCENES=new Map();
export function exScene(world,light){const key=world+'|'+light;let s=EX_SCENES.get(key);if(!s){s=({port:xmPort,circ:xmCircus,ciutat:xmCiutat,bosc:xmBosc,espai:xmEspai}[world]||xmPort)(light);EX_SCENES.set(key,s);}return s;}
export const EX_HOLES=XM_HOLES;
