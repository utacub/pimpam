// Encaixos de fusta (EN12, 0.45): the twenty-five figures, each a painted wooden toy of three to six rigid parts on pivots, and the two
// short stories of each (its gags). A part paints its shapes three times through the same function: as a white mask (M.m), as flat enamel
// (the colours) and as the details that go over the grain (M.d: eyes, stripes, lines, always inside the silhouette). Units are the figure's
// own box (w × h, y down); pivots are in those units. anim(t, v, o) gives, for a time t of the life (seconds) and the gag v (0 or 1), the
// turn, the shift and the scale of each part, the shift of the whole figure (_), and the props that appear only while it lives (prop:true
// parts, hidden at rest and left out of the hole). Nothing moves without a pivot: it is wood.
import {exClamp,exEase,exOut,exSettle} from './encaix.js';
export const XC=Object.freeze({red:'#e94b3c',orange:'#ff8a3d',yellow:'#ffc53a',green:'#5cb85c',teal:'#2a9fd6',blue:'#2f6fd0',navy:'#26324a',pink:'#ff6fa3',purple:'#8f6be0',brown:'#8d5a2b',tan:'#c89a5f',cream:'#fff3dc',white:'#fffaf0',grey:'#b8c3cc',dark:'#3b3b3b',skin:'#f6c9a0',lime:'#9ad04a',sky:'#bfe6f7',gold:'#ffd96a',rose:'#ff9fb2',mint:'#7fd8c0',wine:'#b23a48'});
const XTAU=Math.PI*2;
// ── shapes (each starts a new path) and the three passes ──────────────────────────────────────────────────────────────────────────
export const xb=(g,pts)=>{g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const [x,y,cx,cy]=pts[i];if(cx!==undefined)g.quadraticCurveTo(cx,cy,x,y);else g.lineTo(x,y);}g.closePath();};
export const xr=(g,x,y,w,h,r=0)=>{g.beginPath();if(r>0)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);};
export const xc=(g,x,y,r)=>{g.beginPath();g.arc(x,y,r,0,XTAU);};
export const xe=(g,x,y,rx,ry,rot=0)=>{g.beginPath();g.ellipse(x,y,rx,ry,rot,0,XTAU);};
export const xp=(g,pts)=>{g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();};
// fill the current path: white in the mask pass, the colour in the enamel pass, nothing in the detail pass
export const xF=(g,M,col)=>{if(M.d)return;g.fillStyle=M.m?'#fff':col;g.fill();};
// a detail: only in the detail pass (over the grain), inside the silhouette
export const xD=(M,fn)=>{if(M.d)fn();};
const xfill=(g,col)=>{g.fillStyle=col;g.fill();};
const xeye=(g,x,y,r,look=[0,0],col=XC.navy)=>{xc(g,x,y,r);xfill(g,'#fff');xc(g,x+look[0]*r*.35,y+look[1]*r*.35,r*.55);xfill(g,col);};
const xdot=(g,x,y,r,col=XC.navy)=>{xc(g,x,y,r);xfill(g,col);};
const xline=(g,x1,y1,x2,y2,w,col)=>{g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.lineWidth=w;g.lineCap='round';g.strokeStyle=col;g.stroke();};
const xsmile=(g,x,y,r,a0=.25,a1=Math.PI-.25,w=3,col=XC.navy)=>{g.beginPath();g.arc(x,y,r,a0,a1);g.lineWidth=w;g.lineCap='round';g.strokeStyle=col;g.stroke();};
const xcheek=(g,x,y,r)=>{xc(g,x,y,r);xfill(g,'rgba(255,110,110,.45)');};
// the painted screw of a pivot
const xscrew=(g,x,y,r=5)=>{xc(g,x,y,r);xfill(g,'#b48a58');xc(g,x,y,r*.6);xfill(g,'#7a5634');xline(g,x-r*.4,y,x+r*.4,y,1.4,'#f1dcbb');};
// ── motion helpers ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
const xS=(t,f,a,xph=0)=>Math.sin(t*f*XTAU+xph)*a;                  // a sway
const xph=(t,a,b)=>exEase((t-a)/(b-a));                         // 0..1 eased between a and b
const xbump=(t,a,b)=>{const u=exClamp((t-a)/(b-a));return Math.sin(u*Math.PI);}; // up and back
const xhop=(t,a,b,h)=>-xbump(t,a,b)*h;                           // a jump of height h (y up is negative)
const xhold=(t,a,b)=>t>=a&&t<=b?1:0;
const xP=(r=0,x=0,y=0,s=1)=>({r,x,y,s});
// ── the figures ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const EX_FIGURES={};
const xfig=(id,w,h,parts,anim,o={})=>{EX_FIGURES[id]={id,w,h,parts,anim,...o};};
// ═══ The port ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
xfig('barca',300,250,[
 {n:'buc',pv:[150,200],paint(g,M){xb(g,[[18,170],[282,170],[250,242,270,232],[52,242],[18,170,22,225]]);xF(g,M,XC.red);xr(g,30,178,240,14);xF(g,M,XC.white);xD(M,()=>{for(let i=0;i<3;i++){xc(g,88+i*62,214,9);xfill(g,XC.navy);xc(g,88+i*62,214,5);xfill(g,XC.sky);}xline(g,30,185,270,185,2,'rgba(0,0,0,.18)');});}},
 {n:'pal',pv:[152,175],paint(g,M){xr(g,145,16,14,166,4);xF(g,M,XC.tan);xD(M,()=>xline(g,152,20,152,176,2,'rgba(0,0,0,.15)'));}},
 {n:'vela',pv:[159,172],paint(g,M){xb(g,[[162,30],[270,168],[162,168]]);xF(g,M,XC.white);xD(M,()=>{xline(g,176,70,176,160,4,XC.red);xline(g,196,98,196,160,4,XC.red);});}},
 {n:'floc',pv:[145,172],paint(g,M){xb(g,[[142,42],[142,168],[56,168]]);xF(g,M,XC.yellow);xD(M,()=>xline(g,128,70,128,160,4,XC.orange));}},
 {n:'bandera',pv:[152,16],paint(g,M){xb(g,[[158,6],[206,20],[158,34]]);xF(g,M,XC.pink);}}],
 (t,v,o)=>{const T=o.T;if(v===0){const u=xph(t,.2,T-.4),go=Math.sin(u*Math.PI);return {_:xP(0,go*70,xS(t,.6,3)),buc:xP(xS(t,.6,.07)),vela:xP(0,0,0,1+Math.sin(t*2.2)*.03),floc:xP(xS(t,1.4,.03)),bandera:xP(xS(t,3,.25)),pal:xP(xS(t,.6,.04))};}
  const wave=xhop(t,.6,1.6,34)+xhop(t,2.4,3.4,26);return {_:xP(0,xS(t,.5,8),wave),buc:xP(xS(t,1.1,.09)),vela:xP(xS(t,1.1,.05),0,0,1+Math.max(0,Math.sin(t*1.6))*.04),floc:xP(xS(t,1.1,.06)),bandera:xP(xS(t,4,.3)+(xhold(t,.3,1)?.4:0)),pal:xP(xS(t,1.1,.05))};});
xfig('gavina',260,180,[
 {n:'alaE',pv:[112,74],paint(g,M){xb(g,[[114,70],[18,36,60,34],[10,46],[96,92,60,82]]);xF(g,M,XC.grey);xD(M,()=>xline(g,30,46,90,82,3,'rgba(38,50,74,.35)'));}},
 {n:'alaD',pv:[150,74],paint(g,M){xb(g,[[148,70],[246,32,200,30],[252,44],[166,92,210,84]]);xF(g,M,XC.grey);xD(M,()=>xline(g,232,44,172,84,3,'rgba(38,50,74,.35)'));}},
 {n:'cos',pv:[130,90],paint(g,M){xb(g,[[60,86],[120,60,80,58],[170,72,150,58],[170,102,190,90],[100,118,140,124],[60,86,64,112]]);xF(g,M,XC.white);xb(g,[[60,88],[22,78],[36,100],[62,104]]);xF(g,M,XC.white);xc(g,178,70,20);xF(g,M,XC.white);xb(g,[[194,64],[222,74],[194,82]]);xF(g,M,XC.yellow);xD(M,()=>{xdot(g,184,66,4.5);xline(g,40,84,60,98,2,'rgba(38,50,74,.3)');});}},
 {n:'peix',prop:true,pv:[200,150],paint(g,M){xb(g,[[176,142],[210,130,196,128],[222,142,222,136],[210,154,222,148],[176,142,196,156]]);xF(g,M,XC.teal);xb(g,[[176,142],[164,132],[164,152]]);xF(g,M,XC.teal);xD(M,()=>xdot(g,208,140,2.5,XC.white));}}],
 (t,v,o)=>{const T=o.T;const flap=xS(t,2.2,.55);if(v===0){const fishUp=xph(t,2.2,2.8),fishGo=xph(t,3.6,4.2);return {_:xP(0,0,xS(t,1.1,6)),alaE:xP(flap),alaD:xP(-flap),cos:xP(xS(t,2.2,.05)),peix:{r:xS(t,6,.3)*fishUp,x:0,y:40-fishUp*40,s:1,a:fishUp*(1-fishGo)}};}
  const dive=xbump(t,.6,2.6),fold=exClamp(dive*1.3);return {_:xP(dive*.5,dive*60,dive*70),alaE:xP(flap*(1-fold)+fold*.9),alaD:xP(-flap*(1-fold)-fold*.9),cos:xP(0),peix:{a:0}};});
xfig('pescadora',240,330,[
 {n:'cos',pv:[100,200],paint(g,M){xb(g,[[60,122],[140,122],[162,302],[38,302]]);xF(g,M,XC.yellow);xr(g,54,292,38,30,4);xF(g,M,XC.navy);xr(g,110,292,38,30,4);xF(g,M,XC.navy);xD(M,()=>{xline(g,100,140,100,282,3,'rgba(0,0,0,.2)');xdot(g,100,170,4,XC.navy);xdot(g,100,210,4,XC.navy);xdot(g,100,250,4,XC.navy);});}},
 {n:'cap',pv:[100,120],paint(g,M){xc(g,100,96,40);xF(g,M,XC.skin);xb(g,[[40,82],[100,30,60,30],[160,82,140,30],[176,92],[24,92]]);xF(g,M,XC.yellow);xD(M,()=>{xeye(g,86,98,6,[.2,.3]);xeye(g,116,98,6,[.2,.3]);xsmile(g,101,106,12,.3,2.8);xcheek(g,74,112,8);xcheek(g,128,112,8);});}},
 {n:'brac',pv:[150,150],paint(g,M){xb(g,[[134,138],[166,138],[172,196],[128,196]]);xF(g,M,XC.yellow);xc(g,150,200,16);xF(g,M,XC.skin);g.save();g.translate(150,196);g.rotate(-.95);xr(g,-6,-168,12,206,5);xF(g,M,XC.brown);g.restore();xD(M,()=>{xscrew(g,150,150,5);g.save();g.translate(150,196);g.rotate(-.95);xline(g,0,-150,0,20,2,'rgba(0,0,0,.2)');g.restore();});}},
 {n:'bota',prop:true,pv:[228,60],paint(g,M){xb(g,[[214,36],[246,36],[248,84],[272,96],[266,110],[214,106]]);xF(g,M,XC.dark);xD(M,()=>xline(g,222,44,222,100,2,'rgba(255,255,255,.25)'));}},
 {n:'peix',prop:true,pv:[228,60],paint(g,M){xb(g,[[204,70],[238,54,220,52],[254,70,254,62],[238,86,254,78],[204,70,220,88]]);xF(g,M,XC.orange);xb(g,[[204,70],[190,58],[190,82]]);xF(g,M,XC.orange);xD(M,()=>xdot(g,238,66,2.5,XC.white));}}],
 (t,v,o)=>{const back=xph(t,.1,.7),cast=xph(t,.7,1.1),arm=-back*.9+cast*1.5;const pull=xph(t,2.4,2.9);const up=xbump(t,2.6,4.4);const prop={r:xS(t,1.4,.25)*up,x:-20*pull,y:120-up*120,s:1,a:exClamp(up*2)};
  return {cos:xP(0,0,xS(t,1.6,2)),cap:xP(-.1*back+.12*cast-.2*up),brac:xP(arm-pull*.6),bota:v===0?prop:{a:0},peix:v===1?{...prop,r:xS(t,5,.4)*up}:{a:0}};});
xfig('pop',260,230,[
 ...[0,1,2,3,4].map(i=>({n:'t'+i,pv:[40+i*45,120],paint(g,M){const x=40+i*45;xb(g,[[x-16,116],[x+16,116],[x+22+(i%2?10:-10),212,x+30,168],[x-8,220],[x-16,116,x-25,172]]);xF(g,M,XC.pink);xD(M,()=>{for(let k=0;k<3;k++)xdot(g,x+(i%2?4:-4),150+k*22,4.5,'rgba(255,255,255,.55)');});}})),
 {n:'cap',pv:[130,100],paint(g,M){xe(g,130,80,80,70);xF(g,M,XC.pink);xD(M,()=>{xeye(g,105,80,15,[0,.3]);xeye(g,155,80,15,[0,.3]);xsmile(g,130,104,14,.2,2.9);xcheek(g,86,100,9);xcheek(g,174,100,9);});}},
 {n:'bombolles',prop:true,pv:[200,40],paint(g,M){xc(g,196,42,9);xF(g,M,XC.sky);xc(g,216,22,6);xF(g,M,XC.sky);xc(g,228,52,4.5);xF(g,M,XC.sky);xD(M,()=>{xdot(g,193,39,2.5,'#fff');xdot(g,214,20,1.8,'#fff');});}}],
 (t,v,o)=>{const out={cap:xP(xS(t,.8,.08),0,xS(t,.8,3))};for(let i=0;i<5;i++)out['t'+i]=xP(xS(t,1.1,.35,i*.9)*(v===0?1:.5));
  if(v===0){out.bombolles={a:0};return out;}const shy=xbump(t,1.6,3.6);out._=xP(0,0,shy*26,1-shy*.1);out.cap=xP(0,0,0,1);const bub=xbump(t,.2,1.4)+xbump(t,2.3,3.4);out.bombolles={r:0,x:xS(t,1.2,6),y:-bub*40,s:1,a:exClamp(bub*1.5)};return out;});
xfig('cranc',280,180,[
 {n:'potesE',pv:[90,120],paint(g,M){for(let k=0;k<3;k++){g.save();g.translate(84-k*4,112+k*2);g.rotate(.55+k*.35);xr(g,-7,0,14,56,6);g.restore();xF(g,M,XC.orange);}}},
 {n:'potesD',pv:[190,120],paint(g,M){for(let k=0;k<3;k++){g.save();g.translate(196+k*4,112+k*2);g.rotate(-.55-k*.35);xr(g,-7,0,14,56,6);g.restore();xF(g,M,XC.orange);}}},
 {n:'cos',pv:[140,110],paint(g,M){xe(g,140,108,74,46);xF(g,M,XC.red);xr(g,108,40,14,40,6);xF(g,M,XC.red);xr(g,158,40,14,40,6);xF(g,M,XC.red);xc(g,115,40,14);xF(g,M,XC.white);xc(g,165,40,14);xF(g,M,XC.white);xD(M,()=>{xdot(g,117,42,7);xdot(g,167,42,7);xsmile(g,140,112,14,.3,2.8,3,'#5a1a1a');xcheek(g,100,118,8);xcheek(g,180,118,8);});}},
 {n:'pinE',pv:[72,96],paint(g,M){xb(g,[[78,88],[40,60,52,78],[8,74,16,58],[26,96,6,88],[14,118,2,106],[46,110,30,124],[78,112]]);xF(g,M,XC.red);xD(M,()=>{xline(g,30,88,46,98,2.5,'rgba(0,0,0,.25)');xscrew(g,72,98,5);});}},
 {n:'pinD',pv:[208,96],paint(g,M){xb(g,[[202,88],[240,60,228,78],[272,74,264,58],[254,96,274,88],[266,118,278,106],[234,110,250,124],[202,112]]);xF(g,M,XC.red);xD(M,()=>{xline(g,250,88,234,98,2.5,'rgba(0,0,0,.25)');xscrew(g,208,98,5);});}}],
 (t,v,o)=>{if(v===0){const walk=Math.sin(xph(t,.2,4.2)*XTAU)*-44;const step=xS(t,3,.2);const snap=k=>(xhold(t,2.55,2.7)||xhold(t,2.72,2.85)?.35:0)*k;return {_:xP(0,walk,Math.abs(xS(t,3,3))),potesE:xP(step),potesD:xP(-step),cos:xP(xS(t,3,.03)),pinE:xP(-snap(1)+xS(t,3,.06)),pinD:xP(snap(1)-xS(t,3,.06))};}
  const up=xph(t,.2,.8)-xph(t,3.6,4.2),clap=Math.max(0,Math.sin(t*5.2))*up*.3;return {_:xP(0,0,-up*8+xS(t,2.6,2)),cos:xP(xS(t,2.6,.04)),potesE:xP(xS(t,2.6,.1)),potesD:xP(-xS(t,2.6,.1)),pinE:xP(-up*.9+clap),pinD:xP(up*.9-clap)};});
// ═══ The circus ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
xfig('monocicle',200,330,[
 {n:'roda',pv:[100,278],paint(g,M){xc(g,100,278,48);xF(g,M,XC.dark);xc(g,100,278,34);xF(g,M,XC.cream);xc(g,100,278,8);xF(g,M,XC.dark);xD(M,()=>{for(let k=0;k<6;k++)xline(g,100,278,100+Math.cos(k/6*XTAU)*32,278+Math.sin(k/6*XTAU)*32,3,XC.dark);});}},
 {n:'cos',pv:[100,170],paint(g,M){xr(g,94,186,12,52,4);xF(g,M,XC.grey);xr(g,74,172,52,14,6);xF(g,M,XC.dark);xb(g,[[70,98],[130,98],[136,180],[64,180]]);xF(g,M,XC.red);xr(g,72,176,22,60,8);xF(g,M,XC.blue);xr(g,106,176,22,60,8);xF(g,M,XC.blue);xD(M,()=>{for(let k=0;k<3;k++){xdot(g,100,118+k*22,5,XC.gold);}xline(g,70,150,130,150,3,XC.gold);});}},
 {n:'cap',pv:[100,100],paint(g,M){xc(g,100,66,34);xF(g,M,XC.skin);xb(g,[[66,50],[100,16,70,16],[134,50,130,16]]);xF(g,M,XC.purple);xD(M,()=>{xeye(g,88,66,5.5,[0,-.2]);xeye(g,112,66,5.5,[0,-.2]);xsmile(g,100,74,10,.3,2.8);xcheek(g,78,80,6);xcheek(g,122,80,6);});}},
 {n:'bracE',pv:[70,106],paint(g,M){xb(g,[[62,100],[78,100],[20,150,50,120],[6,140]]);xF(g,M,XC.red);xc(g,10,146,10);xF(g,M,XC.skin);xD(M,()=>xscrew(g,70,106,4.5));}},
 {n:'bracD',pv:[130,106],paint(g,M){xb(g,[[122,100],[138,100],[194,140,150,120],[180,150]]);xF(g,M,XC.red);xc(g,190,146,10);xF(g,M,XC.skin);xD(M,()=>xscrew(g,130,106,4.5));}}],
 (t,v,o)=>{if(v===0){const go=Math.sin(xph(t,.1,4.4)*XTAU),x=go*50,lean=xS(t,1.3,.12);return {_:xP(0,x,0),roda:xP(x/48),cos:xP(lean),cap:xP(-lean*.6),bracE:xP(lean*1.6-.2),bracD:xP(lean*1.6+.2)};}
  const ped=xS(t,1.2,.7),j=xhop(t,2.9,3.5,40);return {_:xP(0,0,j),roda:xP(ped),cos:xP(xS(t,1.2,.06)),cap:xP(xS(t,1.2,-.05)),bracE:xP(-.3+xS(t,1.2,.4)),bracD:xP(.3-xS(t,1.2,.4))};});
xfig('malabarista',220,330,[
 {n:'cos',pv:[110,180],paint(g,M){xb(g,[[72,112],[148,112],[158,250],[62,250]]);xF(g,M,XC.green);xr(g,74,244,28,76,8);xF(g,M,XC.navy);xr(g,118,244,28,76,8);xF(g,M,XC.navy);xr(g,66,312,40,14,5);xF(g,M,XC.dark);xr(g,114,312,40,14,5);xF(g,M,XC.dark);xD(M,()=>{xline(g,80,130,80,240,4,XC.gold);xline(g,140,130,140,240,4,XC.gold);xdot(g,110,140,5,XC.gold);xdot(g,110,170,5,XC.gold);});}},
 {n:'cap',pv:[110,112],paint(g,M){xc(g,110,74,36);xF(g,M,XC.skin);xb(g,[[74,62],[110,28,80,30],[146,62,140,30]]);xF(g,M,XC.orange);xD(M,()=>{xeye(g,98,74,6,[0,-.5]);xeye(g,122,74,6,[0,-.5]);xsmile(g,110,84,11,.3,2.8);xcheek(g,86,88,6);xcheek(g,134,88,6);});}},
 {n:'bracE',pv:[76,124],paint(g,M){xb(g,[[66,116],[86,116],[36,186,52,150],[18,176]]);xF(g,M,XC.green);xc(g,24,184,11);xF(g,M,XC.skin);xD(M,()=>xscrew(g,76,124,4.5));}},
 {n:'bracD',pv:[144,124],paint(g,M){xb(g,[[134,116],[154,116],[202,176,168,150],[184,186]]);xF(g,M,XC.green);xc(g,196,184,11);xF(g,M,XC.skin);xD(M,()=>xscrew(g,144,124,4.5));}},
 {n:'b0',prop:true,pv:[110,40],paint(g,M){xc(g,110,40,15);xF(g,M,XC.red);xD(M,()=>xdot(g,105,35,4,'rgba(255,255,255,.5)'));}},
 {n:'b1',prop:true,pv:[110,40],paint(g,M){xc(g,110,40,15);xF(g,M,XC.yellow);xD(M,()=>xdot(g,105,35,4,'rgba(255,255,255,.5)'));}},
 {n:'b2',prop:true,pv:[110,40],paint(g,M){xc(g,110,40,15);xF(g,M,XC.blue);xD(M,()=>xdot(g,105,35,4,'rgba(255,255,255,.5)'));}}],
 (t,v,o)=>{const T=o.T,per=.9,on=exClamp(t*3)*(1-xph(t,T-.5,T));const ball=(k,tt)=>{const u=((tt/per)+k/3)%1,side=Math.floor((tt/per)+k/3)%2?1:-1;const x=-86*side+172*side*u,y=144-Math.sin(u*Math.PI)*150;return {x,y};};
  const out={cos:xP(0,0,xS(t,2.2,2)),cap:xP(xS(t,1.1,.08)),bracE:xP(-.3+xS(t,1/per,.5)),bracD:xP(.3+xS(t,1/per,.5,Math.PI))};
  if(v===0){const drop=xph(t,3.3,3.9);for(let k=0;k<3;k++){const b=ball(k,Math.min(t,3.3));out['b'+k]={r:0,x:b.x+drop*(k-1)*40,y:b.y+drop*(300-b.y),s:1,a:on*(1-xph(t,T-.4,T))};}return out;}
  const bounce=xbump(t,2.2,2.9);for(let k=0;k<3;k++){const b=ball(k,t);out['b'+k]={r:0,x:b.x,y:b.y+(k===1?bounce*80:0),s:1,a:on};}return out;});
xfig('pallassa',300,240,[
 {n:'cotxet',pv:[150,170],paint(g,M){xb(g,[[40,150],[90,150],[112,100,96,100],[200,100],[232,150,212,100],[270,150],[274,196],[36,196]]);xF(g,M,XC.yellow);xr(g,118,110,70,34,8);xF(g,M,XC.sky);xD(M,()=>{xline(g,60,170,250,170,3,XC.red);xdot(g,266,164,6,XC.gold);xdot(g,44,164,6,XC.red);});}},
 {n:'rodaE',pv:[86,198],paint(g,M){xc(g,86,198,30);xF(g,M,XC.red);xc(g,86,198,12);xF(g,M,XC.cream);xD(M,()=>{for(let k=0;k<4;k++)xline(g,86,198,86+Math.cos(k/4*XTAU+.4)*24,198+Math.sin(k/4*XTAU+.4)*24,3,XC.cream);});}},
 {n:'rodaD',pv:[222,198],paint(g,M){xc(g,222,198,30);xF(g,M,XC.red);xc(g,222,198,12);xF(g,M,XC.cream);xD(M,()=>{for(let k=0;k<4;k++)xline(g,222,198,222+Math.cos(k/4*XTAU+.4)*24,198+Math.sin(k/4*XTAU+.4)*24,3,XC.cream);});}},
 {n:'pallassa',pv:[150,112],paint(g,M){xb(g,[[122,112],[178,112],[188,70],[112,70]]);xF(g,M,XC.teal);xc(g,150,50,30);xF(g,M,XC.skin);xb(g,[[122,40],[150,2,126,10],[178,40,174,10]]);xF(g,M,XC.purple);xc(g,120,54,13);xF(g,M,XC.orange);xc(g,180,54,13);xF(g,M,XC.orange);xD(M,()=>{xdot(g,150,56,9,XC.red);xeye(g,138,44,5.5,[0,.2]);xeye(g,162,44,5.5,[0,.2]);xsmile(g,150,60,13,.4,2.7);xdot(g,150,88,4,XC.gold);xdot(g,150,100,4,XC.gold);});}},
 {n:'flor',prop:true,pv:[180,90],paint(g,M){xc(g,180,90,9);xF(g,M,XC.pink);for(let k=0;k<5;k++){xc(g,180+Math.cos(k/5*XTAU)*12,90+Math.sin(k/5*XTAU)*12,6);xF(g,M,XC.pink);}xc(g,180,90,4);xF(g,M,XC.yellow);}},
 {n:'aigua',prop:true,pv:[200,80],paint(g,M){for(let k=0;k<4;k++){xc(g,204+k*12,76-k*10,4.5-k*.6);xF(g,M,XC.teal);}}},
 {n:'barret',prop:true,pv:[150,20],paint(g,M){xb(g,[[122,40],[150,2,126,10],[178,40,174,10]]);xF(g,M,XC.purple);}}],
 (t,v,o)=>{if(v===0){const go=xph(t,.2,1.6),off=xph(t,1.75,2.4),x=go*40,tilt=off*.14;const sq=xhold(t,.4,.8)?1:0;const hic=xbump(t,3,3.3);return {_:xP(0,x,0),cotxet:xP(tilt,0,off*14),rodaE:xP(x/30+off*3,-off*40,off*30),rodaD:xP(x/30+off*4,off*50,off*32),pallassa:xP(tilt-hic*.1,0,-hic*10),flor:{r:0,x:0,y:0,s:1,a:1},aigua:{r:0,x:xbump(t,.4,.9)*10,y:0,s:1,a:xbump(t,.35,.95)},barret:{a:0}};}
  const hic=xbump(t,.3,.6)+xbump(t,3.5,3.8),honk=xbump(t,1.6,1.9),pf=xph(t,2.4,2.6),fall=xph(t,2.9,3.4);return {cotxet:xP(0,0,-hic*6),rodaE:xP(xS(t,1,.1)),rodaD:xP(xS(t,1,.1)),pallassa:xP(-hic*.12+honk*.08,0,-hic*12),flor:{r:0,x:0,y:0,s:1,a:1},aigua:{a:0},barret:{r:xS(t,2,.2)*pf,x:pf*10,y:-pf*70+fall*70,s:1,a:pf}};});
xfig('trapezi',200,340,[
 {n:'barra',pv:[100,30],paint(g,M){xr(g,20,88,160,12,6);xF(g,M,XC.brown);xr(g,28,0,8,92,3);xF(g,M,XC.tan);xr(g,164,0,8,92,3);xF(g,M,XC.tan);xD(M,()=>{xline(g,30,96,170,96,2,'rgba(0,0,0,.2)');});}},
 {n:'cos',pv:[100,96],paint(g,M){xr(g,70,90,16,70,6);xF(g,M,XC.skin);xr(g,114,90,16,70,6);xF(g,M,XC.skin);xb(g,[[66,150],[134,150],[140,236],[60,236]]);xF(g,M,XC.pink);xD(M,()=>{for(let k=0;k<4;k++)xdot(g,78+k*15,200,4,XC.gold);xline(g,66,170,134,170,3,XC.gold);});}},
 {n:'cap',pv:[100,150],paint(g,M){xc(g,100,122,30);xF(g,M,XC.skin);xb(g,[[70,116],[100,86,74,88],[130,116,126,88]]);xF(g,M,XC.dark);xD(M,()=>{xeye(g,90,124,5,[0,.3]);xeye(g,110,124,5,[0,.3]);xsmile(g,100,132,9,.3,2.8);});}},
 {n:'cames',pv:[100,232],paint(g,M){xr(g,70,228,24,80,8);xF(g,M,XC.pink);xr(g,106,228,24,80,8);xF(g,M,XC.pink);xr(g,66,300,30,22,6);xF(g,M,XC.red);xr(g,104,300,30,22,6);xF(g,M,XC.red);xD(M,()=>xscrew(g,100,234,5));}}],
 (t,v,o)=>{if(v===0){const amp=.25+xph(t,0,2.4)*.35,sw=Math.sin(t*2.4)*amp,flip=xph(t,2.6,3.6)*XTAU;return {barra:xP(0,0,xS(t,2.4/XTAU,2)),cos:xP(sw+flip),cap:xP(-sw*.3),cames:xP(Math.sin(t*2.4-.6)*amp*.9+Math.sin(flip)*.4)};}
  const sw=Math.sin(t*2.2)*.5*(1-xph(t,2.2,3.2)),inv=xph(t,2,3.2)*Math.PI;return {barra:xP(0,0,xS(t,2.2/XTAU,2)),cos:xP(sw+inv),cap:xP(-sw*.3-inv*.2),cames:xP(Math.sin(t*2.2-.6)*.4*(1-xph(t,2.2,3.2))-inv*.9)};});
xfig('gos',260,210,[
 {n:'cua',pv:[46,112],paint(g,M){xb(g,[[50,106],[14,60,28,70],[26,54],[62,116]]);xF(g,M,XC.white);xD(M,()=>xdot(g,28,70,7,XC.brown));}},
 {n:'potesDar',pv:[76,150],paint(g,M){xr(g,56,142,22,56,8);xF(g,M,XC.white);xr(g,86,146,20,52,8);xF(g,M,XC.white);xD(M,()=>{xdot(g,67,190,6,XC.navy);xdot(g,96,190,6,XC.navy);});}},
 {n:'potesDav',pv:[176,150],paint(g,M){xr(g,160,142,22,56,8);xF(g,M,XC.white);xr(g,190,146,20,52,8);xF(g,M,XC.white);xD(M,()=>{xdot(g,171,190,6,XC.navy);xdot(g,200,190,6,XC.navy);});}},
 {n:'cos',pv:[130,120],paint(g,M){xe(g,126,118,86,42);xF(g,M,XC.white);xD(M,()=>{xe(g,100,104,18,14,.3);xfill(g,XC.brown);xe(g,150,126,14,10,-.4);xfill(g,XC.brown);xr(g,170,98,20,16,6);xfill(g,XC.red);});}},
 {n:'cap',pv:[196,96],paint(g,M){xe(g,212,78,38,32);xF(g,M,XC.white);xe(g,182,66,14,24,.5);xF(g,M,XC.brown);xe(g,240,100,18,12);xF(g,M,XC.white);xD(M,()=>{xeye(g,214,70,6,[.3,0]);xdot(g,250,98,6);xsmile(g,236,104,8,.5,2.6,2.5);xe(g,228,56,14,16,-.2);xfill(g,XC.brown);});}},
 {n:'cercol',prop:true,pv:[130,80],paint(g,M){g.beginPath();g.arc(130,80,74,0,XTAU);g.arc(130,80,62,0,XTAU,true);xF(g,M,XC.red);xD(M,()=>{for(let k=0;k<8;k++)xdot(g,130+Math.cos(k/8*XTAU)*68,80+Math.sin(k/8*XTAU)*68,4,XC.gold);});}}],
 (t,v,o)=>{const wag=xS(t,4,.35);if(v===0){const ring=xph(t,.3,.8)*(1-xph(t,4,4.5)),crouch=xbump(t,1,1.6),jump=xbump(t,1.5,2.3),x=xph(t,1.5,2.3)*140-70*ring;return {_:xP(-jump*.3,x*ring,-jump*110+crouch*8),cua:xP(wag),potesDar:xP(-jump*.9),potesDav:xP(jump*.9),cos:xP(0),cap:xP(-jump*.2),cercol:{r:0,x:0,y:-10,s:1,a:ring}};}
  const j=xbump(t,1.8,2.6),yawn=xph(t,3.2,3.6)-xph(t,4,4.4);return {_:xP(0,0,-j*90),cua:xP(wag),potesDar:xP(-j*.6),potesDav:xP(j*.6),cos:xP(0),cap:xP(-yawn*.5-j*.2),cercol:{a:0}};});
// ═══ The city ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
xfig('tramvia',320,200,[
 {n:'trole',pv:[160,60],paint(g,M){g.save();g.translate(160,62);g.rotate(-.5);xr(g,-4,-54,8,56,3);g.restore();xF(g,M,XC.dark);xc(g,186,16,6);xF(g,M,XC.dark);}},
 {n:'rodaE',pv:[80,170],paint(g,M){xc(g,80,170,24);xF(g,M,XC.dark);xc(g,80,170,10);xF(g,M,XC.grey);xD(M,()=>{for(let k=0;k<4;k++)xline(g,80,170,80+Math.cos(k/4*XTAU)*18,170+Math.sin(k/4*XTAU)*18,3,XC.grey);});}},
 {n:'rodaD',pv:[240,170],paint(g,M){xc(g,240,170,24);xF(g,M,XC.dark);xc(g,240,170,10);xF(g,M,XC.grey);xD(M,()=>{for(let k=0;k<4;k++)xline(g,240,170,240+Math.cos(k/4*XTAU)*18,170+Math.sin(k/4*XTAU)*18,3,XC.grey);});}},
 {n:'caixa',pv:[160,120],paint(g,M){xb(g,[[26,60],[294,60],[306,164],[14,164]]);xF(g,M,XC.red);xr(g,20,50,280,16,8);xF(g,M,XC.cream);xr(g,22,112,276,16);xF(g,M,XC.cream);xD(M,()=>{for(let i=0;i<4;i++){xr(g,46+i*62,72,46,34,5);xfill(g,XC.sky);}xdot(g,34,146,6,XC.gold);xdot(g,286,146,6,XC.gold);xline(g,30,150,290,150,2,'rgba(0,0,0,.2)');});}},
 {n:'campana',pv:[160,44],paint(g,M){xb(g,[[150,40],[170,40],[176,60],[144,60]]);xF(g,M,XC.gold);xc(g,160,62,5);xF(g,M,XC.dark);}},
 {n:'guspira',prop:true,pv:[186,16],paint(g,M){for(let k=0;k<4;k++){const a=k/4*XTAU+.4;xb(g,[[186+Math.cos(a)*6,16+Math.sin(a)*6],[186+Math.cos(a)*22,16+Math.sin(a)*22],[186+Math.cos(a+.5)*6,16+Math.sin(a+.5)*6]]);xF(g,M,XC.gold);}}}],
 (t,v,o)=>{if(v===0){const x=Math.sin(xph(t,.15,4.3)*XTAU)*80,ring=xS(t,5,.3)*(xbump(t,.1,.7)+xbump(t,2.9,3.6));return {_:xP(0,x,0),rodaE:xP(x/24),rodaD:xP(x/24),caixa:xP(xS(t,1.6,.012)),trole:xP(xS(t,1.6,.03)),campana:xP(ring),guspira:{a:0}};}
  const ding=xS(t,6,.35)*(xbump(t,.2,1)+xbump(t,3.3,3.9)),b=Math.abs(xS(t,1.5,4));return {_:xP(0,0,-b),rodaE:xP(xS(t,1.5,.05)),rodaD:xP(xS(t,1.5,.05)),caixa:xP(0),trole:xP(xS(t,3,.04)),campana:xP(ding),guspira:{r:xS(t,3,.5),x:0,y:0,s:1,a:xbump(t,1.1,1.6)}};});
xfig('bombera',240,340,[
 {n:'escala3',pv:[180,250],paint(g,M){xr(g,158,120,10,140,3);xF(g,M,XC.tan);xr(g,196,120,10,140,3);xF(g,M,XC.tan);for(let k=0;k<5;k++){xr(g,164,130+k*28,36,8,3);xF(g,M,XC.tan);}}},
 {n:'escala2',pv:[180,250],paint(g,M){xr(g,156,126,10,140,3);xF(g,M,XC.brown);xr(g,198,126,10,140,3);xF(g,M,XC.brown);for(let k=0;k<5;k++){xr(g,162,136+k*28,40,8,3);xF(g,M,XC.brown);}}},
 {n:'escala1',pv:[180,250],paint(g,M){xr(g,154,132,12,150,3);xF(g,M,XC.red);xr(g,198,132,12,150,3);xF(g,M,XC.red);for(let k=0;k<5;k++){xr(g,160,142+k*28,44,8,3);xF(g,M,XC.red);}xD(M,()=>xscrew(g,182,276,5));}},
 {n:'cos',pv:[100,200],paint(g,M){xb(g,[[62,130],[138,130],[150,250],[50,250]]);xF(g,M,XC.red);xr(g,64,246,30,76,8);xF(g,M,XC.navy);xr(g,106,246,30,76,8);xF(g,M,XC.navy);xr(g,58,312,40,16,5);xF(g,M,XC.dark);xr(g,102,312,40,16,5);xF(g,M,XC.dark);xb(g,[[136,140],[156,140],[166,236],[150,236]]);xF(g,M,XC.red);xc(g,158,240,13);xF(g,M,XC.skin);xD(M,()=>{xline(g,62,160,138,160,6,XC.gold);xline(g,62,200,138,200,6,XC.gold);xline(g,100,140,100,246,2,'rgba(0,0,0,.2)');});}},
 {n:'cap',pv:[100,130],paint(g,M){xc(g,100,96,36);xF(g,M,XC.skin);xb(g,[[58,86],[100,40,62,40],[142,86,138,40],[152,96],[48,96]]);xF(g,M,XC.yellow);xr(g,86,54,28,20,6);xF(g,M,XC.red);xD(M,()=>{xeye(g,88,98,6,[.2,-.2]);xeye(g,114,98,6,[.2,-.2]);xsmile(g,101,108,11,.3,2.8);xcheek(g,74,112,7);xcheek(g,128,112,7);});}},
 {n:'gat',prop:true,pv:[182,120],paint(g,M){xe(g,182,124,20,14);xF(g,M,XC.orange);xc(g,196,112,12);xF(g,M,XC.orange);xb(g,[[188,104],[190,94],[196,104]]);xF(g,M,XC.orange);xb(g,[[202,104],[206,94],[208,104]]);xF(g,M,XC.orange);xD(M,()=>{xdot(g,193,112,2);xdot(g,201,112,2);});}},
 {n:'aigua',prop:true,pv:[160,240],paint(g,M){for(let k=0;k<6;k++){xc(g,174+k*16,236-k*14,6-k*.5);xF(g,M,XC.teal);}}},
 {n:'coloms',prop:true,pv:[180,110],paint(g,M){for(let k=0;k<3;k++){const x=150+k*28,y=108-k*10;xb(g,[[x-14,y],[x,y-8,x-8,y-10],[x+14,y,x+8,y-10],[x,y+2]]);xF(g,M,XC.grey);}}}],
 (t,v,o)=>{const T=o.T,s1=xph(t,.55,.95),s2=xph(t,1.05,1.45),s3=xph(t,1.55,1.95),down=xph(t,T-.6,T-.1);const e=(k)=>xP(0,0,-(k)*(1-down));
  if(v===0){const cat=xph(t,2.4,2.7)*(1-xph(t,3.3,3.5)),jump=xbump(t,3.3,3.7);return {escala1:e(s1*40),escala2:e(s1*40+s2*44),escala3:e(s1*40+s2*44+s3*48),cos:xP(xS(t,1.5,.02)),cap:xP(-.25*(s3)*(1-down)),gat:{r:0,x:0,y:-(40+44+48)*cat+jump*0,s:1,a:cat},aigua:{a:0},coloms:{a:0}};}
  const spray=xbump(t,2,2.9),fly=xph(t,3.2,3.9);return {escala1:e(s1*40),escala2:e(s1*40+s2*44),escala3:e(s1*40+s2*44),cos:xP(0),cap:xP(-.15*s2*(1-down)),gat:{a:0},aigua:{r:-.2+xS(t,2,.15),x:0,y:0,s:.6+spray*.6,a:spray},coloms:{r:0,x:fly*60,y:-fly*90,s:1,a:xbump(t,3,4.2)}};});
xfig('forner',240,330,[
 {n:'cos',pv:[120,190],paint(g,M){xb(g,[[70,120],[170,120],[182,262],[58,262]]);xF(g,M,XC.white);xr(g,74,256,32,66,8);xF(g,M,XC.navy);xr(g,134,256,32,66,8);xF(g,M,XC.navy);xr(g,68,316,42,12,5);xF(g,M,XC.dark);xr(g,130,316,42,12,5);xF(g,M,XC.dark);xD(M,()=>{xr(g,82,150,76,96,10);xfill(g,XC.sky);xline(g,120,150,120,246,2,'rgba(0,0,0,.15)');xdot(g,120,136,4,XC.navy);});}},
 {n:'cap',pv:[120,120],paint(g,M){xc(g,120,84,38);xF(g,M,XC.skin);xb(g,[[80,70],[86,30,80,34],[120,18,100,20],[154,30,140,20],[160,70,160,34]]);xF(g,M,XC.white);xr(g,76,62,88,14,6);xF(g,M,XC.white);xD(M,()=>{xeye(g,106,86,6,[0,.3]);xeye(g,134,86,6,[0,.3]);xsmile(g,120,96,12,.3,2.8);xb(g,[[100,106],[140,106],[136,114],[104,114]]);xfill(g,XC.brown);xcheek(g,92,100,7);xcheek(g,148,100,7);});}},
 {n:'bracE',pv:[76,134],paint(g,M){xb(g,[[66,126],[88,126],[44,196,60,160],[26,188]]);xF(g,M,XC.white);xc(g,32,196,12);xF(g,M,XC.skin);xD(M,()=>xscrew(g,76,134,4.5));}},
 {n:'bracD',pv:[164,134],paint(g,M){xb(g,[[152,126],[174,126],[214,188,180,160],[196,196]]);xF(g,M,XC.white);xc(g,208,196,12);xF(g,M,XC.skin);xD(M,()=>xscrew(g,164,134,4.5));}},
 {n:'pa',prop:true,pv:[120,200],paint(g,M){xe(g,120,196,44,18);xF(g,M,XC.tan);xD(M,()=>{xline(g,100,190,112,200,3,XC.brown);xline(g,118,188,130,198,3,XC.brown);xline(g,136,190,146,198,3,XC.brown);});}},
 {n:'massa',prop:true,pv:[120,200],paint(g,M){xc(g,120,196,26);xF(g,M,XC.cream);}},
 {n:'farina',prop:true,pv:[120,180],paint(g,M){for(let k=0;k<7;k++){const a=k/7*XTAU;xc(g,120+Math.cos(a)*34,184+Math.sin(a)*22,6+(k%3)*2);xF(g,M,'#fff');}}}],
 (t,v,o)=>{if(v===0){const reach=xbump(t,.2,1.2),show=xph(t,1.3,1.7),eat=xbump(t,3.3,3.9),gone=xph(t,3.5,3.9);return {cos:xP(0,0,xS(t,2,2)),cap:xP(-.1*reach+.25*eat),bracE:xP(-.9*reach-1.4*show*(1-gone)-.3*eat),bracD:xP(.9*reach+1.4*show*(1-gone)+.3*eat),pa:{r:0,x:0,y:-show*60-eat*40,s:1,a:show*(1-gone)},massa:{a:0},farina:{a:0}};}
  const kn=xS(t,2,.5),grow=xph(t,1.3,2.5),pf=xph(t,2.55,2.7),laugh=Math.abs(xS(t,4,1))*xbump(t,3,4.4);return {cos:xP(0,0,-laugh*5),cap:xP(xS(t,2,.05)-laugh*.08),bracE:xP(-1.1-kn,0,0),bracD:xP(1.1+kn,0,0),pa:{a:0},massa:{r:0,x:0,y:-30-grow*20,s:.8+grow*.9*(1-pf),a:1-pf},farina:{r:xS(t,1,.2),x:0,y:-40-xph(t,2.6,3.6)*40,s:.6+xph(t,2.55,3.6)*1.2,a:pf*(1-xph(t,3,3.8))}};});
xfig('gat',280,200,[
 {n:'cua',pv:[46,130],paint(g,M){xb(g,[[52,128],[20,96,24,120],[40,60,10,80],[56,64],[44,98,56,86],[66,136]]);xF(g,M,XC.orange);xD(M,()=>xline(g,44,76,30,98,4,XC.brown));}},
 {n:'potes',pv:[176,136],paint(g,M){xr(g,164,130,22,54,9);xF(g,M,XC.orange);xr(g,196,134,20,50,9);xF(g,M,XC.orange);xD(M,()=>{xdot(g,175,176,6,XC.white);xdot(g,206,176,6,XC.white);});}},
 {n:'cos',pv:[130,130],paint(g,M){xe(g,128,128,88,44);xF(g,M,XC.orange);xr(g,60,150,36,38,10);xF(g,M,XC.orange);xD(M,()=>{xline(g,96,100,110,122,5,XC.brown);xline(g,130,96,138,120,5,XC.brown);xline(g,164,102,172,124,5,XC.brown);xdot(g,74,184,6,XC.white);});}},
 {n:'cap',pv:[200,106],paint(g,M){xc(g,218,84,36);xF(g,M,XC.orange);xb(g,[[190,62],[196,28],[216,54]]);xF(g,M,XC.orange);xb(g,[[222,54],[242,28],[246,62]]);xF(g,M,XC.orange);xD(M,()=>{xeye(g,206,82,6,[.2,0],XC.green);xeye(g,232,82,6,[.2,0],XC.green);xdot(g,220,94,4,XC.pink);xline(g,196,98,180,94,2,XC.navy);xline(g,196,102,180,106,2,XC.navy);xline(g,244,98,260,94,2,XC.navy);xline(g,244,102,260,106,2,XC.navy);xsmile(g,214,98,6,.3,2.8,2);xsmile(g,226,98,6,.3,2.8,2);});}},
 {n:'coloms',prop:true,pv:[80,60],paint(g,M){for(let k=0;k<3;k++){const x=50+k*34,y=70-k*8;xe(g,x,y,13,9);xF(g,M,XC.grey);xc(g,x+12,y-6,6);xF(g,M,XC.grey);}}}],
 (t,v,o)=>{const tail=xS(t,.8,.25);if(v===0){const st=xbump(t,.2,1.6),jump=xbump(t,2.8,3.4),x=xph(t,2.8,3.4)*80;return {_:xP(0,x,-jump*70),cua:xP(tail+st*.3),potes:xP(-st*.8+jump*.5),cos:xP(0,0,0,1+st*.08),cap:xP(-st*.15-jump*.2,0,-st*8),coloms:{a:0}};}
  const fly=xph(t,2.5,3.4),puff=xph(t,3.1,3.3)*(1-xph(t,4,4.4)),jump=xbump(t,2.6,3.2);return {_:xP(0,0,-jump*50),cua:xP(tail*(1+puff*2)),potes:xP(jump*.6),cos:xP(0,0,0,1+puff*.08),cap:xP(-jump*.2+xS(t,.6,.1)*(1-fly)),coloms:{r:0,x:fly*-70,y:-xph(t,2.5,3.6)*120,s:1,a:xbump(t,1.4,4)}};});
xfig('paraigua',220,340,[
 {n:'cames',pv:[110,236],paint(g,M){xr(g,84,230,22,68,8);xF(g,M,XC.red);xr(g,114,230,22,68,8);xF(g,M,XC.red);xr(g,78,290,32,30,6);xF(g,M,XC.navy);xr(g,110,290,32,30,6);xF(g,M,XC.navy);xD(M,()=>xscrew(g,110,238,5));}},
 {n:'cos',pv:[110,170],paint(g,M){xb(g,[[76,130],[144,130],[158,242],[62,242]]);xF(g,M,XC.yellow);xb(g,[[140,140],[158,140],[170,196],[156,200]]);xF(g,M,XC.yellow);xc(g,164,200,12);xF(g,M,XC.skin);xD(M,()=>{xline(g,110,146,110,236,2,'rgba(0,0,0,.18)');xdot(g,110,166,4,XC.navy);xdot(g,110,196,4,XC.navy);xdot(g,110,226,4,XC.navy);});}},
 {n:'cap',pv:[110,132],paint(g,M){xc(g,110,100,34);xF(g,M,XC.skin);xb(g,[[74,98],[110,54,76,58],[146,98,144,58],[138,124],[82,124]]);xF(g,M,XC.yellow);xc(g,110,100,30);xF(g,M,XC.skin);xD(M,()=>{xeye(g,98,100,6,[.2,.2]);xeye(g,122,100,6,[.2,.2]);xsmile(g,110,110,10,.3,2.8);xcheek(g,86,112,7);xcheek(g,134,112,7);});}},
 {n:'paraigua',pv:[164,200],paint(g,M){xr(g,160,80,8,124,3);xF(g,M,XC.brown);xb(g,[[70,86],[164,14,100,18],[258,86,228,18],[232,74,246,88],[206,86,218,74],[180,74,194,88],[150,86,166,74],[126,74,140,88],[98,86,112,74],[70,86,84,74]]);xF(g,M,XC.pink);xD(M,()=>{xline(g,164,24,164,84,2,'rgba(0,0,0,.2)');xline(g,164,30,110,84,2,'rgba(0,0,0,.2)');xline(g,164,30,218,84,2,'rgba(0,0,0,.2)');xdot(g,164,14,5,XC.wine);});}},
 {n:'gotes',prop:true,pv:[110,60],paint(g,M){for(let k=0;k<6;k++){const x=30+k*34,y=30+(k%3)*40;xb(g,[[x,y-10],[x+6,y+4,x+7,y-2],[x,y+8,x+4,y+8],[x-6,y+4,x-4,y+8],[x,y-10,x-7,y-2]]);xF(g,M,XC.sky);}}},
 {n:'esquitx',prop:true,pv:[110,320],paint(g,M){for(let k=0;k<5;k++){xc(g,70+k*20,320-Math.sin(k/4*Math.PI)*30,6);xF(g,M,XC.sky);}}}],
 (t,v,o)=>{if(v===0){const wind=xph(t,.3,1.2),lift=xbump(t,1.3,3.7),land=xph(t,3.5,3.7);return {_:xP(0,lift*20,-lift*60),cames:xP(xS(t,2,.3)*lift),cos:xP(-wind*.08),cap:xP(wind*.1),paraigua:xP(-wind*.5+xS(t,1.5,.08)*lift),gotes:{a:0},esquitx:{a:0}};}
  const spin=xph(t,.8,2.6)*XTAU,j=xhop(t,2.9,3.4,36),sp=xbump(t,3.35,3.9);return {_:xP(0,0,j),cames:xP(xS(t,1,.1)*xbump(t,2.9,3.4)),cos:xP(0),cap:xP(xS(t,.7,.08)),paraigua:xP(spin),gotes:{r:0,x:0,y:((t*90)%80)-40,s:1,a:xbump(t,.1,4.4)},esquitx:{r:0,x:0,y:0,s:.5+sp*.8,a:sp}};});
// ═══ The forest ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
xfig('esquirol',200,300,[
 {n:'cua',pv:[60,210],paint(g,M){xb(g,[[70,220],[20,150,26,210],[40,70,0,100],[90,60,74,50],[80,120,100,80],[100,200,84,170]]);xF(g,M,XC.wine);xD(M,()=>xb(g,[[66,196],[44,150,44,186],[54,96,30,120],[70,96]]),xfill(g,XC.orange));}},
 {n:'cos',pv:[110,200],paint(g,M){xe(g,114,196,50,66);xF(g,M,XC.wine);xe(g,114,206,30,44);xF(g,M,XC.cream);xr(g,70,250,26,34,8);xF(g,M,XC.wine);xr(g,132,250,26,34,8);xF(g,M,XC.wine);xD(M,()=>{xdot(g,82,280,5,XC.navy);xdot(g,146,280,5,XC.navy);});}},
 {n:'bracos',pv:[114,160],paint(g,M){xr(g,92,150,18,44,8);xF(g,M,XC.wine);xr(g,118,150,18,44,8);xF(g,M,XC.wine);xD(M,()=>xscrew(g,114,158,4));}},
 {n:'cap',pv:[114,140],paint(g,M){xc(g,114,106,38);xF(g,M,XC.wine);xb(g,[[84,84],[80,46],[106,74]]);xF(g,M,XC.wine);xb(g,[[122,74],[148,46],[144,84]]);xF(g,M,XC.wine);xe(g,114,122,16,12);xF(g,M,XC.cream);xD(M,()=>{xeye(g,100,102,6,[0,.3]);xeye(g,128,102,6,[0,.3]);xdot(g,114,116,4);xline(g,106,126,122,126,2,XC.navy);});}},
 {n:'gla',prop:true,pv:[114,170],paint(g,M){xe(g,114,176,13,16);xF(g,M,XC.tan);xb(g,[[98,168],[114,156,100,160],[130,168,128,160],[126,174],[102,174]]);xF(g,M,XC.brown);}}],
 (t,v,o)=>{const tail=xS(t,1.3,.12);if(v===0){const show=xph(t,.2,.6),nib=Math.abs(xS(t,5,1))*xbump(t,1.2,2.4),hide=xph(t,2.8,3.4);return {cua:xP(tail),cos:xP(0,0,xS(t,2,2)),bracos:xP(-.5*show+.3*hide),cap:xP(nib*.12+hide*.3),gla:{r:0,x:0,y:-10+hide*70,s:1,a:show*(1-xph(t,3.2,3.5))}};}
  const hp=xhop(t,.2,.7,30)+xhop(t,.8,1.3,24),fall=xph(t,2.4,2.9),bonk=xbump(t,2.85,3.2);return {_:xP(0,0,hp),cua:xP(tail+bonk*.3),cos:xP(0),bracos:xP(bonk*.4),cap:xP(bonk*.25,0,bonk*8),gla:{r:fall*2,x:0,y:-200+fall*110,s:1,a:xph(t,2.2,2.4)*(1-xph(t,3.5,3.9))}};});
xfig('mussol',220,260,[
 {n:'alaE',pv:[48,120],paint(g,M){xe(g,44,160,22,56,.15);xF(g,M,XC.brown);xD(M,()=>{xline(g,36,130,40,190,3,'rgba(0,0,0,.2)');});}},
 {n:'alaD',pv:[172,120],paint(g,M){xe(g,176,160,22,56,-.15);xF(g,M,XC.brown);xD(M,()=>{xline(g,184,130,180,190,3,'rgba(0,0,0,.2)');});}},
 {n:'cos',pv:[110,170],paint(g,M){xe(g,110,166,66,78);xF(g,M,XC.brown);xe(g,110,180,44,56);xF(g,M,XC.cream);xb(g,[[84,238],[104,238],[94,256]]);xF(g,M,XC.orange);xb(g,[[116,238],[136,238],[126,256]]);xF(g,M,XC.orange);xD(M,()=>{for(let r=0;r<3;r++)for(let k=0;k<3;k++)xsmile(g,86+k*24,150+r*22,8,.2,2.9,2,'rgba(141,90,43,.5)');});}},
 {n:'cap',pv:[110,100],paint(g,M){xc(g,110,92,58);xF(g,M,XC.brown);xb(g,[[60,60],[62,26],[90,46]]);xF(g,M,XC.brown);xb(g,[[130,46],[158,26],[160,60]]);xF(g,M,XC.brown);xc(g,86,92,24);xF(g,M,XC.cream);xc(g,134,92,24);xF(g,M,XC.cream);xb(g,[[100,106],[120,106],[110,124]]);xF(g,M,XC.orange);xD(M,()=>{xeye(g,86,92,15,[0,0]);xeye(g,134,92,15,[0,0]);});}},
 {n:'parpelles',prop:true,pv:[110,92],paint(g,M){xc(g,86,92,16);xF(g,M,XC.brown);xc(g,134,92,16);xF(g,M,XC.brown);}}],
 (t,v,o)=>{const blink=k=>(Math.abs((t-k)%4.6)<.08?1:0);if(v===0){const turn=-xph(t,.1,.5)*.7+xph(t,1.7,2.1)*1.4-xph(t,3.3,3.8)*.7;return {alaE:xP(xS(t,1,.03)),alaD:xP(-xS(t,1,.03)),cos:xP(0,0,xS(t,.8,2)),cap:xP(turn,0,xS(t,.8,2)),parpelles:{r:0,x:0,y:0,s:1,a:blink(1.2)+blink(2.9)}};}
  const ruffle=xbump(t,.2,1),flap=xS(t,4,.6)*xbump(t,2.8,3.6);return {alaE:xP(-ruffle*.8+flap),alaD:xP(ruffle*.8-flap),cos:xP(0,0,0,1+ruffle*.06),cap:xP(xS(t,1,.06),0,-ruffle*6),parpelles:{r:0,x:0,y:0,s:1,a:blink(.5)+blink(2.4)}};});
xfig('cervol',260,330,[
 {n:'cua',pv:[46,166],paint(g,M){xb(g,[[50,160],[30,140],[24,166],[44,180]]);xF(g,M,XC.tan);}},
 {n:'potesDar',pv:[76,230],paint(g,M){xr(g,60,220,20,86,8);xF(g,M,XC.tan);xr(g,88,224,18,82,8);xF(g,M,XC.tan);xr(g,58,296,24,14,4);xF(g,M,XC.dark);xr(g,86,296,22,14,4);xF(g,M,XC.dark);}},
 {n:'potesDav',pv:[160,230],paint(g,M){xr(g,148,220,20,86,8);xF(g,M,XC.tan);xr(g,176,224,18,82,8);xF(g,M,XC.tan);xr(g,146,296,24,14,4);xF(g,M,XC.dark);xr(g,174,296,22,14,4);xF(g,M,XC.dark);}},
 {n:'cos',pv:[120,190],paint(g,M){xe(g,118,186,80,46);xF(g,M,XC.tan);xD(M,()=>{for(let k=0;k<6;k++)xdot(g,90+(k%3)*26,172+Math.floor(k/3)*22,4.5,XC.cream);});}},
 {n:'cap',pv:[182,156],paint(g,M){xr(g,170,70,30,96,12);xF(g,M,XC.tan);xe(g,196,64,30,24);xF(g,M,XC.tan);xe(g,220,70,14,10);xF(g,M,XC.brown);xb(g,[[180,44],[160,0,150,20],[172,8],[186,40]]);xF(g,M,XC.brown);xb(g,[[200,44],[224,0,236,20],[214,8],[194,40]]);xF(g,M,XC.brown);xb(g,[[166,28],[140,14],[170,38]]);xF(g,M,XC.brown);xb(g,[[216,28],[242,14],[212,38]]);xF(g,M,XC.brown);xD(M,()=>{xeye(g,196,60,6,[.3,.2]);xdot(g,228,70,4);});}}],
 (t,v,o)=>{if(v===0){const down=xbump(t,.2,1.5),up=xph(t,1.3,1.5)*(1-xph(t,2.6,3.2)),step=xS(t,2,.2)*xbump(t,3,4.2);return {cua:xP(xS(t,2,.3)),potesDar:xP(step),potesDav:xP(-step),cos:xP(0,0,xS(t,1.4,1.5)),cap:xP(down*.55-up*.35)};}
  const chew=Math.abs(xS(t,3,1))*xbump(t,.2,1.8),call=xbump(t,1.9,2.8),shake=xS(t,8,.03)*xbump(t,3.3,3.9);return {_:xP(shake),cua:xP(xS(t,2,.3)),potesDar:xP(0),potesDav:xP(0),cos:xP(0),cap:xP(chew*.08-call*.4,0,chew*4)};});
xfig('erico',240,180,[
 {n:'potes',pv:[120,150],paint(g,M){xr(g,70,140,22,30,8);xF(g,M,XC.brown);xr(g,110,142,22,30,8);xF(g,M,XC.brown);xr(g,150,140,22,30,8);xF(g,M,XC.brown);}},
 {n:'cos',pv:[120,110],paint(g,M){xb(g,[[30,140],[36,96,24,118],[64,60,44,70],[110,40,86,44],[150,46,130,38],[180,70,170,52],[192,112,194,88],[180,142]]);xF(g,M,XC.brown);for(let k=0;k<7;k++){const a=Math.PI*1.05+k*.16,x=112+Math.cos(a)*74,y=118+Math.sin(a)*74;xb(g,[[x-10+Math.cos(a)*-4,y+Math.sin(a)*-4+6],[x+Math.cos(a)*26,y+Math.sin(a)*26],[x+10,y+6]]);xF(g,M,XC.dark);}
  xb(g,[[176,100],[232,122,220,100],[228,146,238,138],[180,150,208,156]]);xF(g,M,XC.tan);xD(M,()=>{xeye(g,200,118,5,[.4,.2]);xdot(g,230,128,5);xcheek(g,206,136,5);});}},
 {n:'bola',prop:true,pv:[120,100],paint(g,M){xc(g,120,100,60);xF(g,M,XC.brown);for(let k=0;k<12;k++){const a=k/12*XTAU,x=120+Math.cos(a)*58,y=100+Math.sin(a)*58;xb(g,[[x+Math.cos(a+1.5)*8,y+Math.sin(a+1.5)*8],[x+Math.cos(a)*20,y+Math.sin(a)*20],[x-Math.cos(a+1.5)*8,y-Math.sin(a+1.5)*8]]);xF(g,M,XC.dark);}xD(M,()=>{xdot(g,120,100,10,XC.tan);});}}],
 (t,v,o)=>{if(v===0){const sniff=xS(t,4,3)*xbump(t,.1,.9),curl=xph(t,1.1,1.5),un=xph(t,3.4,3.8),ball=curl*(1-un),roll=Math.sin(xph(t,1.5,3.4)*Math.PI)*90;return {_:xP(0,roll*ball,0),potes:xP(0,0,0,1-ball),cos:xP(0,0,sniff,1-ball),bola:{r:roll/60,x:0,y:28,s:1,a:ball}};}
  const walk=xph(t,.2,1.6)*30-xph(t,3.4,4.4)*30,pat=Math.abs(xS(t,4,3))*(xbump(t,.2,1.6)+xbump(t,3.4,4.4)),st=xbump(t,2.5,3.1),ball=xph(t,2.6,2.75)*(1-xph(t,3,3.2));return {_:xP(0,walk,-st*30+pat),potes:xP(xS(t,4,.2)*(xbump(t,.2,1.6)+xbump(t,3.4,4.4)),0,0,1-ball),cos:xP(0,0,0,1-ball),bola:{r:0,x:0,y:28,s:1,a:ball}};});
xfig('guineu',300,200,[
 {n:'cua',pv:[56,120],paint(g,M){xb(g,[[62,112],[20,80,36,86],[2,120,0,96],[30,150,8,146],[70,136]]);xF(g,M,XC.orange);xb(g,[[18,124],[2,120],[30,150,8,146],[40,138]]);xF(g,M,XC.white);}},
 {n:'potesDar',pv:[96,150],paint(g,M){xr(g,80,140,20,52,8);xF(g,M,XC.orange);xr(g,106,144,18,48,8);xF(g,M,XC.orange);xD(M,()=>{xr(g,80,178,20,14,5);xfill(g,XC.dark);xr(g,106,178,18,14,5);xfill(g,XC.dark);});}},
 {n:'potesDav',pv:[196,150],paint(g,M){xr(g,184,140,20,52,8);xF(g,M,XC.orange);xr(g,210,144,18,48,8);xF(g,M,XC.orange);xD(M,()=>{xr(g,184,178,20,14,5);xfill(g,XC.dark);xr(g,210,178,18,14,5);xfill(g,XC.dark);});}},
 {n:'cos',pv:[150,120],paint(g,M){xe(g,148,120,94,40);xF(g,M,XC.orange);xD(M,()=>{xe(g,148,134,60,20);xfill(g,XC.cream);});}},
 {n:'cap',pv:[218,104],paint(g,M){xb(g,[[196,76],[224,56,204,58],[262,74,246,56],[290,100,286,84],[256,118,284,120],[218,122],[196,100,190,118]]);xF(g,M,XC.orange);xb(g,[[204,66],[198,30],[228,58]]);xF(g,M,XC.orange);xb(g,[[236,56],[256,26],[262,70]]);xF(g,M,XC.orange);xb(g,[[244,98],[290,100],[262,118]]);xF(g,M,XC.white);xD(M,()=>{xeye(g,230,86,6,[.4,.1]);xdot(g,288,100,5);xdot(g,210,48,4,XC.dark);xdot(g,250,44,4,XC.dark);});}},
 {n:'fulles',prop:true,pv:[150,80],paint(g,M){for(let k=0;k<6;k++){const x=70+k*34,y=60+(k%2)*30;xb(g,[[x-12,y],[x,y-12,x-8,y-10],[x+12,y,x+8,y-10],[x,y+12,x+8,y+10],[x-12,y,x-8,y+10]]);xF(g,M,k%2?XC.orange:XC.gold);}}},
 {n:'neu',prop:true,pv:[230,150],paint(g,M){for(let k=0;k<6;k++){xc(g,200+k*14,160-Math.sin(k/5*Math.PI)*34,7-k%2*2);xF(g,M,'#fff');}}}],
 (t,v,o)=>{const T=o.T;if(v===0){const crouch=xbump(t,.3,1.6),leap=xbump(t,1.6,2.3),dive=xph(t,1.9,2.4)*(1-xph(t,3.1,3.5)),shake=xS(t,9,.05)*xbump(t,3.3,3.9),x=xph(t,1.6,2.3)*70-xph(t,3.4,4.3)*70;return {_:xP(-dive*1.1+shake,x,-leap*80+dive*50+crouch*6),cua:xP(xS(t,3,.3)*crouch-dive*.5),potesDar:xP(-leap*.6),potesDav:xP(leap*.8),cos:xP(0),cap:xP(-crouch*.1),fulles:{a:0},neu:{r:0,x:0,y:0,s:.6+xph(t,2.1,2.6),a:xbump(t,2.1,3.2)}};}
  const pounce=xbump(t,1.4,2.1),x=xph(t,1.4,2.1)*60-xph(t,3.4,4.3)*60,shake=xS(t,9,.05)*xbump(t,3.1,3.7);return {_:xP(-pounce*.4+shake,x,-pounce*70),cua:xP(xS(t,2.5,.25)),potesDar:xP(-pounce*.6),potesDav:xP(pounce*.8),cos:xP(0),cap:xP(-pounce*.2+xS(t,.7,.06)),fulles:{r:xS(t,1,.3),x:40,y:-xph(t,2,3.4)*60,s:1,a:xbump(t,2,3.6)},neu:{a:0}};});
// ═══ Space ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
xfig('coet',160,340,[
 {n:'ales',pv:[80,260],paint(g,M){xb(g,[[46,200],[46,290],[6,310],[10,250]]);xF(g,M,XC.red);xb(g,[[114,200],[114,290],[154,310],[150,250]]);xF(g,M,XC.red);}},
 {n:'cos',pv:[80,180],paint(g,M){xb(g,[[44,100],[80,8,46,30],[116,100,114,30],[118,280],[42,280]]);xF(g,M,XC.white);xb(g,[[44,100],[80,8,46,30],[116,100,114,30]]);xF(g,M,XC.red);xr(g,50,276,60,20,4);xF(g,M,XC.grey);xc(g,80,150,24);xF(g,M,XC.navy);xD(M,()=>{xc(g,80,150,17);xfill(g,XC.sky);xdot(g,74,144,5,'rgba(255,255,255,.6)');xline(g,50,200,110,200,6,XC.red);xline(g,50,236,110,236,6,XC.red);});}},
 {n:'flama',prop:true,pv:[80,296],paint(g,M){xb(g,[[56,296],[104,296],[80,352,110,330]]);xF(g,M,XC.orange);xb(g,[[66,296],[94,296],[80,330,96,318]]);xF(g,M,XC.yellow);}},
 {n:'fum',prop:true,pv:[80,330],paint(g,M){xc(g,50,330,16);xF(g,M,XC.grey);xc(g,80,338,18);xF(g,M,XC.grey);xc(g,112,328,14);xF(g,M,XC.grey);}}],
 (t,v,o)=>{const T=o.T;if(v===0){const sh=xS(t,14,2)*xbump(t,.1,1.4),go=xph(t,1.4,3.4)*(1-xph(t,3.6,T)),fl=xph(t,1.35,1.5)*(1-xph(t,3.4,3.8));return {_:xP(0,sh,-go*120),ales:xP(0),cos:xP(0),flama:{r:0,x:xS(t,9,2),y:0,s:.8+xS(t,9,.15),a:fl},fum:{r:0,x:0,y:go*60,s:.6+go,a:fl*(1-go*.6)}};}
  const cnt=xhop(t,.35,.55,8)+xhop(t,.75,.95,8)+xhop(t,1.15,1.35,8),go=xph(t,1.6,3.4)*(1-xph(t,3.6,T)),fl=xph(t,1.55,1.7)*(1-xph(t,3.4,3.8));return {_:xP(0,0,cnt-go*120),ales:xP(0),cos:xP(0),flama:{r:0,x:xS(t,9,2),y:0,s:.8+xS(t,9,.15),a:fl},fum:{r:0,x:0,y:go*60,s:.6+go,a:fl*(1-go*.6)}};});
xfig('astronauta',220,330,[
 {n:'motxilla',pv:[110,170],paint(g,M){xr(g,64,110,92,110,16);xF(g,M,XC.grey);xD(M,()=>{xline(g,80,124,140,124,3,XC.dark);xline(g,80,140,140,140,3,XC.dark);});}},
 {n:'cames',pv:[110,236],paint(g,M){xr(g,78,230,26,74,10);xF(g,M,XC.white);xr(g,116,230,26,74,10);xF(g,M,XC.white);xr(g,74,296,34,20,8);xF(g,M,XC.grey);xr(g,112,296,34,20,8);xF(g,M,XC.grey);xD(M,()=>xscrew(g,110,236,5));}},
 {n:'cos',pv:[110,180],paint(g,M){xb(g,[[70,120],[150,120],[160,244],[60,244]]);xF(g,M,XC.white);xD(M,()=>{xr(g,88,150,44,36,6);xfill(g,XC.grey);xdot(g,100,160,5,XC.red);xdot(g,120,160,5,XC.green);xline(g,92,178,128,178,3,XC.navy);});}},
 {n:'bracE',pv:[72,132],paint(g,M){xb(g,[[60,124],[84,124],[44,200,54,160],[22,192]]);xF(g,M,XC.white);xc(g,30,200,14);xF(g,M,XC.grey);xD(M,()=>xscrew(g,72,132,4.5));}},
 {n:'bracD',pv:[148,132],paint(g,M){xb(g,[[136,124],[160,124],[198,192,166,160],[176,200]]);xF(g,M,XC.white);xc(g,190,200,14);xF(g,M,XC.grey);xD(M,()=>xscrew(g,148,132,4.5));}},
 {n:'cap',pv:[110,124],paint(g,M){xc(g,110,80,46);xF(g,M,XC.white);xe(g,110,84,32,28);xF(g,M,XC.navy);xD(M,()=>{xe(g,110,84,26,22);xfill(g,XC.teal);xe(g,100,74,10,6,-.4);xfill(g,'rgba(255,255,255,.55)');xeye(g,102,88,4,[0,0]);xeye(g,118,88,4,[0,0]);xsmile(g,110,94,5,.3,2.8,2);});}}],
 (t,v,o)=>{const T=o.T;if(v===0){const roll=xph(t,.6,3.6)*XTAU,drift=xbump(t,.4,4);return {_:xP(roll,0,-drift*24),motxilla:xP(0),cames:xP(xS(t,.5,.15)),cos:xP(0),bracE:xP(-.6-xS(t,.5,.2)),bracD:xP(.6+xS(t,.5,.2)),cap:xP(xS(t,.5,.08))};}
  const wave=xS(t,2,.5)*xbump(t,.2,1.6),tap=xbump(t,1.9,2.4);return {_:xP(0,0,xS(t,.5,6)),motxilla:xP(0),cames:xP(xS(t,.5,.1)),cos:xP(0),bracE:xP(-.3-xS(t,.5,.1)),bracD:xP(.5+wave+tap*1.8),cap:xP(xS(t,.5,.06)+tap*.15)};});
xfig('planeta',260,260,[
 {n:'bola',pv:[130,130],paint(g,M){xc(g,130,130,84);xF(g,M,XC.orange);xD(M,()=>{g.save();xc(g,130,130,84);g.clip();xr(g,30,96,200,18);xfill(g,XC.gold);xr(g,30,140,200,26);xfill(g,XC.wine);xr(g,30,184,200,12);xfill(g,XC.gold);xe(g,170,116,16,9);xfill(g,XC.cream);g.restore();});}},
 {n:'anells',pv:[130,130],paint(g,M){g.beginPath();g.ellipse(130,138,128,30,-.18,0,XTAU);g.ellipse(130,138,94,18,-.18,0,XTAU,true);xF(g,M,XC.teal);xD(M,()=>{g.beginPath();g.ellipse(130,138,112,24,-.18,0,XTAU);g.lineWidth=3;g.strokeStyle=XC.sky;g.stroke();});}},
 {n:'lluna1',prop:true,pv:[130,130],paint(g,M){xc(g,130,130,12);xF(g,M,XC.grey);xD(M,()=>xdot(g,126,126,3,XC.white));}},
 {n:'lluna2',prop:true,pv:[130,130],paint(g,M){xc(g,130,130,8);xF(g,M,XC.cream);}}],
 (t,v,o)=>{const m=(k,R,f,p)=>({r:0,x:Math.cos(t*f*XTAU+p)*R,y:Math.sin(t*f*XTAU+p)*R*.32,s:1,a:1});if(v===0)return {bola:xP(0),anells:xP(xS(t,.25,.2)),lluna1:m(0,118,.22,0),lluna2:m(0,150,.15,2)};
  return {bola:xP(xS(t,.2,.35)),anells:xP(xS(t,.2,.06)),lluna1:m(0,118,.2,1),lluna2:m(0,150,.13,4)};});
xfig('alien',200,320,[
 {n:'cames',pv:[100,240],paint(g,M){xr(g,70,232,22,56,8);xF(g,M,XC.green);xr(g,108,232,22,56,8);xF(g,M,XC.green);xe(g,80,290,22,10);xF(g,M,XC.lime);xe(g,120,290,22,10);xF(g,M,XC.lime);}},
 {n:'cos',pv:[100,180],paint(g,M){xe(g,100,190,44,52);xF(g,M,XC.green);xD(M,()=>{for(let k=0;k<3;k++)xdot(g,88+k*12,196,5,XC.lime);});}},
 {n:'bracE',pv:[62,160],paint(g,M){xb(g,[[56,154],[70,154],[36,222,46,190],[22,216]]);xF(g,M,XC.green);xc(g,28,222,9);xF(g,M,XC.lime);xD(M,()=>xscrew(g,62,160,4));}},
 {n:'bracM',pv:[100,146],paint(g,M){xb(g,[[94,140],[106,140],[106,98,112,120],[94,98]]);xF(g,M,XC.green);xc(g,100,94,9);xF(g,M,XC.lime);xD(M,()=>xscrew(g,100,146,4));}},
 {n:'bracD',pv:[138,160],paint(g,M){xb(g,[[130,154],[144,154],[178,216,154,190],[164,222]]);xF(g,M,XC.green);xc(g,172,222,9);xF(g,M,XC.lime);xD(M,()=>xscrew(g,138,160,4));}},
 {n:'cap',pv:[100,140],paint(g,M){xe(g,100,96,54,48);xF(g,M,XC.green);xD(M,()=>{xeye(g,100,96,20,[0,.2]);xsmile(g,100,122,12,.3,2.8);xcheek(g,66,112,7);xcheek(g,134,112,7);});}},
 {n:'antena',pv:[100,50],paint(g,M){xr(g,96,10,8,44,3);xF(g,M,XC.green);xc(g,100,10,10);xF(g,M,XC.pink);}}],
 (t,v,o)=>{if(v===0){const w1=xS(t,1.5,.6)*xbump(t,.3,1.4),w2=xS(t,1.5,.6)*xbump(t,1,2.1),w3=xS(t,1.5,.6)*xbump(t,1.7,2.8),hic=xbump(t,3.1,3.4);return {_:xP(0,0,-hic*14),cames:xP(0),cos:xP(0,0,0,1+hic*.05),bracE:xP(-w1),bracM:xP(w2),bracD:xP(w3),cap:xP(xS(t,.8,.05)),antena:xP(xS(t,2.5,.3))};}
  const inf=xbump(t,.3,1.4),hp=xhop(t,1.7,2.1,30)+xhop(t,2.2,2.6,24),spin=xph(t,3.2,3.9)*XTAU;return {_:xP(0,0,hp),cames:xP(0),cos:xP(0,0,0,1+inf*.15),bracE:xP(-.3*inf),bracM:xP(0),bracD:xP(.3*inf),cap:xP(0,0,-inf*6),antena:xP(spin)};});
xfig('cometa',300,160,[
 {n:'cua2',pv:[150,80],paint(g,M){xb(g,[[160,56],[20,30,80,20],[10,86],[20,130,80,140],[160,104]]);xF(g,M,XC.gold);}},
 {n:'cua1',pv:[150,80],paint(g,M){xb(g,[[170,62],[60,50,110,44],[52,82],[60,112,110,116],[170,98]]);xF(g,M,XC.orange);}},
 {n:'nucli',pv:[210,80],paint(g,M){g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?22:52;g.lineTo(210+Math.cos(a)*r,80+Math.sin(a)*r);}g.closePath();xF(g,M,XC.yellow);xD(M,()=>{xeye(g,200,76,5,[.3,0]);xeye(g,220,76,5,[.3,0]);xsmile(g,210,86,7,.3,2.8,2);xcheek(g,194,86,4);xcheek(g,226,86,4);});}},
 {n:'espurnes',prop:true,pv:[100,80],paint(g,M){for(let k=0;k<5;k++){const x=30+k*30,y=40+(k%2)*80;xb(g,[[x,y-7],[x+7,y],[x,y+7],[x-7,y]]);xF(g,M,XC.gold);}}}],
 (t,v,o)=>{if(v===0){const u=xph(t,.2,4.2),x=Math.sin(u*Math.PI)*110,y=-Math.sin(u*XTAU)*20;return {_:xP(0,x,y),cua2:xP(xS(t,1.2,.1)),cua1:xP(xS(t,1.2,.06,1)),nucli:xP(xS(t,.5,.3)),espurnes:{r:0,x:-xph(t,.4,2)*30,y:xS(t,1,10),s:1,a:xbump(t,.3,4)}};}
  const dash=xbump(t,.4,1.2),loop=xph(t,1.2,2.8)*XTAU,lx=Math.sin(loop)*50,ly=-(1-Math.cos(loop))*40;return {_:xP(loop*.0,-dash*60+lx,-dash*30+ly),cua2:xP(xS(t,2,.15)-Math.sin(loop)*.4),cua1:xP(xS(t,2,.1,1)-Math.sin(loop)*.25),nucli:xP(Math.sin(loop)*.5),espurnes:{r:loop,x:0,y:0,s:1,a:xbump(t,1,3.4)}};});
export const exFigure=id=>EX_FIGURES[id]||EX_FIGURES.barca;
