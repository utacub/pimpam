// El viatge en globus (CE43), 0.43: the drawing. Every frame lays the strips painted once per journey (viatge-mon.js), in the light of
// the hour (each strip has a graded copy, redone a couple a frame only while the light changes), the landmarks with their life, the
// weather, and the balloon with Mila and Bru, drawn in cel line over the gouache. The virtual frame is 800 high; the transform the app
// set (the screen's density) is composed with, never reset.
import {VGP} from './viatge-pinzell.js';
import {VGM} from './viatge-mon.js';
import {vgJourney,vgDay,vgStage,vgLight,vgWeather,vgMarkDist,vgBegin,vgWind,VG_FADE,VG_GROUND,VG_TAKEOFF} from './viatge.js';
import {escDecor} from './escenari.js';
import {cpuSheet} from './carrega.js';

export const VGA=(()=>{
const VA={cur:null,next:null,q:1,balloon:null,riders:null,ridersKey:'',ridersAt:-1,flame:0,last:0,stars:null,dropsT:0};
const {TAU,rgb,mix,lighten,darken,smooth,path,blob,ell,fill,tone,dab,line,bird,rng}=VGP;
const LINE=VGM.LINE,P=(x,y)=>[x,y];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),ss=x=>{x=clamp(x);return x*x*(3-2*x);};
const BS=.8; // the balloon's scale (1: a basket 110 px wide)

// ── Quality and journeys ──────────────────────────────────────────────────────────────────────────────────────────────────────
 function vaQ(){if(typeof window==='undefined')return 1;return clamp((window.innerHeight||800)*(window.devicePixelRatio||1)/800,.5,1.5);}
// The world of journey v, planned and painted by jobs (one sheet each); graded the first time it is drawn.
 function vaPlan(v){const j=vgJourney(v),{W,jobs}=VGM.plan(j.route,j.season,VA.q,1+v*13);return {v,W,jobs,i:0,graded:false,grade:{}};}
 function vaRun(P,budget=14){if(!P)return 1;const t0=performance.now();while(P.i<P.jobs.length){P.jobs[P.i++]();if(performance.now()-t0>budget)break;}return P.i/P.jobs.length;}
// The share loaded, for the loading cover: the world of the first journey and the balloon.
 function vgLoadShare(game){if(typeof document==='undefined')return 1;const f=game?.viatge;if(!f)return 1;
 if(!VA.cur||VA.cur.v!==f.v){VA.q=vaQ();VA.cur=vaPlan(f.v);VA.next=null;}
 if(!VA.balloon)VA.balloon=vaBalloon(VA.q);
 return vaRun(VA.cur);}

// ── Grading ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A graded copy: the sheet multiplied by the light's tint (only where it paints), then hazed towards the sky colour for the far strips.
 function vaGrade(dst,src,tint,haze,hk){const c=dst.getContext('2d'),w=dst.width,h=dst.height;c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,w,h);c.drawImage(src,0,0);
 c.globalCompositeOperation='multiply';c.fillStyle=rgb(tint);c.fillRect(0,0,w,h);c.globalCompositeOperation='destination-in';c.drawImage(src,0,0);
 if(hk>0){c.globalCompositeOperation='source-atop';c.globalAlpha=hk;c.fillStyle=rgb(haze);c.fillRect(0,0,w,h);c.globalAlpha=1;}c.globalCompositeOperation='source-over';}
const HAZE={clouds:0,mt1:.42,mt2:.26,plain:.12,near:0,deck:.06,mark:0,markPlain:.1};
 function vaTintOf(name,L){if(name==='clouds'||name==='deck')return mix(L.tint,L.sunCol,.35);return L.tint;}
// The graded copies of journey P that are furthest from the light, up to n of them (all of them the first time).
 function vaRegrade(P,L,n){const W=P.W,items=[];for(const [k,S] of Object.entries(W.sheets))items.push([k,S.img,HAZE[k]??0]);
 for(const [k,M] of Object.entries(W.marks))items.push(['m:'+k,M.img,M.layer==='plain'?HAZE.markPlain:HAZE.mark]);
 const want=[];for(const [k,img,hk] of items){const t=vaTintOf(k.startsWith('m:')?'mark':k,L),key=t.map(x=>Math.round(x/3)).join(',')+'|'+Math.round(hk*L.stars*0+hk*100);const G=P.grade[k];
  if(!G||G.key!==key){const d=G?Math.abs(G.t[0]-t[0])+Math.abs(G.t[1]-t[1])+Math.abs(G.t[2]-t[2]):1e9;want.push({k,img,hk,t,key,d});}}
 want.sort((a,b)=>b.d-a.d);for(const o of want.slice(0,P.graded?n:want.length)){let G=P.grade[o.k];if(!G){const cv=document.createElement('canvas');cv.width=o.img.width;cv.height=o.img.height;G=P.grade[o.k]={cv};}
  vaGrade(G.cv,o.img,o.t,L.haze,o.hk);G.key=o.key;G.t=o.t;}
 P.graded=true;}
const vaImg=(P,k)=>P.grade[k]?.cv||P.W.sheets[k]?.img||P.W.marks[k.slice(2)]?.img;

// ── The balloon: three sprites (wires, frame and burner; envelope; basket), painted once, graded like the strips ─────────────────
// 0.47.1 (Marc: «la forma del globus és molt estranya»): redrawn after real sport balloons. A «natural shape» envelope: a rounded,
// slightly flattened crown, the widest point in the upper third, and below it a long, gently convex cone down to the mouth; about as
// tall as it is wide (Cameron A-105: ≈ 22.6 m × 18.7 m with 20 gores). It is sewn of vertical gores (here 20, ten in view) with load
// tapes along their seams and horizontal panel seams; at the bottom the mouth (throat) with its heat-resistant skirt, the flying
// wires from the mouth down to the load frame, the burner on the frame, and the padded poles and cables down to the wicker basket.
// The proportions are kept for legibility: the basket is drawn larger than real (a real basket is ~1/13 of the envelope's width).
// Seen from the basket's height, a little below the envelope: the near side of every horizontal ring looks higher than the far side,
// so the mouth shows as a dark ellipse below the fabric.
const ENV=[[214,70,58],[246,230,196],[232,160,62],[246,230,196]],BAND=[64,48,70],SKIRT=[70,58,72],BASKET=[176,122,70],BASKET_D=[120,78,46],ROPE=[90,70,52],BURNER=[150,152,162],POLE=[112,74,48];
const EG={throat:292,h:404,R:190,rm:56,skirt:26,rs:62,te:.64,e:.15,gores:20,frame:214,fw:50,bw:110,bh:72};
// the envelope's radius at height t (0 the throat, 1 the crown)
const envR=t=>{const {R,rm,te}=EG;if(t>=te){const u=Math.min(1,(t-te)/(1-te));return R*Math.pow(Math.max(0,1-Math.pow(u,2.1)),1/2.1);}const u=(te-t)/te;return rm+(R-rm)*(1-Math.pow(u,1.7));};
// a point of the envelope's surface: height t, longitude φ (0 faces the viewer), in sprite units around (x, y = the basket's foot)
const envP=(s,x,y,t,ph)=>{const r=envR(t);return [x+r*Math.sin(ph)*s,y-(EG.throat+t*EG.h+EG.e*r*Math.cos(ph))*s];};
 function envelope(s,x,y,withSkirt=true){const pts=[],N=40;for(let i=0;i<=N;i++)pts.push(envP(s,x,y,i/N,Math.PI/2));for(let i=N;i>=0;i--)pts.push(envP(s,x,y,i/N,-Math.PI/2));
 if(withSkirt){const b=y-(EG.throat-EG.skirt)*s;for(let i=0;i<=16;i++){const ph=-Math.PI/2+Math.PI*i/16;pts.push([x+EG.rs*Math.sin(ph)*s,b-EG.e*EG.rs*Math.cos(ph)*s]);}}
 else for(let i=0;i<=16;i++)pts.push(envP(s,x,y,0,-Math.PI/2+Math.PI*i/16));
 return pts;}
// the front fabric (envelope + skirt), as one closed outline: what hides the flame above the skirt's edge
 function vaFabric(s,x,y){return envelope(s,x,y,true);}
 function vaBalloon(q){const s=BS,W=460*s,H=(EG.throat+EG.h+30)*s,x=W/2,y=H-6;const L={col:LINE,width:2,alpha:.9};
 const {bw,bh}=EG,throat=y-EG.throat*s,fy=y-EG.frame*s,fw=EG.fw*s,top=y-(EG.throat+EG.h)*s;
 const mk=(y0,y1,paint)=>{const h=y1-y0,img=cpuSheet(Math.ceil(W*q),Math.ceil(h*q),c=>{c.scale(q,q);c.translate(0,-y0);paint(c);});img.y0=y0;img.vh=h;return img;};
 // behind: the flying wires from the mouth to the frame, the poles and cables down to the basket, the frame and the double burner
 const back=mk(throat-EG.e*EG.rm*s-8,y+2,c=>{c.lineCap='round';
  c.strokeStyle=rgb(ROPE,.9);c.lineWidth=1.3;for(let k=0;k<10;k++){const ph=-Math.PI/2+Math.PI*(k+.5)/10,[wx,wy]=envP(s,x,y,0,ph),fx=x+Math.sign(Math.sin(ph))*fw*(Math.cos(ph)>.5?.75:1);c.beginPath();c.moveTo(wx,wy);c.lineTo(fx,fy);c.stroke();}
  for(const sx of [-1,1]){const p0=[x+sx*bw*.5,y-bh-4*s],p1=[x+sx*fw,fy];line(c,[p0,p1],{col:LINE,width:6*s+1.6});line(c,[p0,p1],{col:POLE,width:6*s});
   c.strokeStyle=rgb(ROPE);c.lineWidth=1.2;c.beginPath();c.moveTo(x+sx*(bw*.5-6*s),y-bh);c.lineTo(x+sx*(fw-4*s),fy);c.stroke();}
  const fr=[P(x-fw,fy-3*s),P(x+fw,fy-3*s),P(x+fw,fy+3*s),P(x-fw,fy+3*s)];fill(c,fr,[110,112,122]);line(c,fr,{...L,close:true,width:1.4});
  // two burner coils side by side, and their valves
  for(const sx of [-1,1]){const cx=x+sx*13*s,b=[P(cx-11*s,fy-3*s),P(cx+11*s,fy-3*s),P(cx+11*s,fy-26*s),P(cx-11*s,fy-26*s)];fill(c,b,BURNER);tone(c,[P(cx-11*s,fy-3*s),P(cx-2*s,fy-3*s),P(cx-2*s,fy-26*s),P(cx-11*s,fy-26*s)],[60,60,80],.25);
   c.strokeStyle=rgb([90,92,104]);c.lineWidth=1;for(let i=1;i<5;i++){c.beginPath();c.moveTo(cx-11*s,fy-3*s-i*4.6*s);c.lineTo(cx+11*s,fy-3*s-i*4.6*s);c.stroke();}line(c,b,{...L,close:true,width:1.3});}
  fill(c,[P(x-4*s,fy+3*s),P(x+4*s,fy+3*s),P(x+4*s,fy+12*s),P(x-4*s,fy+12*s)],[70,70,80]);});
 const env=mk(top-6,throat+EG.skirt*s+EG.e*EG.rs*s+6,c=>{const sil=envelope(s,x,y,false),G=EG.gores,vis=G/2;
  // the inside, seen through the mouth and the skirt
  const sb=y-(EG.throat-EG.skirt)*s;ell(c,x,throat,EG.rm*s,EG.e*EG.rm*s);c.fillStyle=rgb([40,26,34]);c.fill();ell(c,x,sb,EG.rs*s,EG.e*EG.rs*s);c.fill();
  c.fillRect(x-EG.rm*s,throat,EG.rm*2*s,sb-throat);c.beginPath();c.moveTo(x-EG.rm*s,throat);c.lineTo(x-EG.rs*s,sb);c.lineTo(x+EG.rs*s,sb);c.lineTo(x+EG.rm*s,throat);c.closePath();c.fill();
  // the skirt (scoop): heat-resistant fabric hanging from the mouth, in narrow panels
  const sk=[];for(let i=0;i<=16;i++){const ph=-Math.PI/2+Math.PI*i/16;sk.push([x+EG.rm*Math.sin(ph)*s,throat-EG.e*EG.rm*Math.cos(ph)*s]);}for(let i=16;i>=0;i--){const ph=-Math.PI/2+Math.PI*i/16;sk.push([x+EG.rs*Math.sin(ph)*s,sb-EG.e*EG.rs*Math.cos(ph)*s]);}
  fill(c,sk,SKIRT);c.save();path(c,sk);c.clip();c.strokeStyle=rgb([30,22,30],.45);c.lineWidth=1;for(let k=1;k<10;k++){const ph=-Math.PI/2+Math.PI*k/10;c.beginPath();c.moveTo(x+EG.rm*Math.sin(ph)*s,throat-EG.e*EG.rm*Math.cos(ph)*s);c.lineTo(x+EG.rs*Math.sin(ph)*s,sb-EG.e*EG.rs*Math.cos(ph)*s);c.stroke();}
  tone(c,[P(x-EG.rs*s,throat-20*s),P(x-EG.rs*s*.2,throat-20*s),P(x-EG.rs*s*.2,sb+10*s),P(x-EG.rs*s,sb+10*s)],[30,20,40],.3);c.restore();line(c,sk,{...L,close:true,width:1.6});
  // the gores: ten of the twenty in view, each a strip between two load tapes, lit from the right (the sun is ahead most of the day)
  const off=Math.PI/G*.0,N=34;c.save();path(c,sil);c.clip();
  for(let g=0;g<vis;g++){const a0=-Math.PI/2+Math.PI*g/vis+off,a1=a0+Math.PI/vis,am=(a0+a1)/2,pts=[];for(let i=0;i<=N;i++)pts.push(envP(s,x,y,i/N,a0));for(let i=N;i>=0;i--)pts.push(envP(s,x,y,i/N,a1));
   fill(c,pts,ENV[g%4]);const k=.5-.5*Math.sin(am-.35);tone(c,pts,[96,52,92],.06+.34*k*k);}
  // the decorated band just under the widest point, following the curve of the envelope, with a diamond on every gore
  const t0=.53,t1=.6,band=[];for(let i=0;i<=40;i++)band.push(envP(s,x,y,t1,-Math.PI/2+Math.PI*i/40));for(let i=40;i>=0;i--)band.push(envP(s,x,y,t0,-Math.PI/2+Math.PI*i/40));fill(c,band,BAND);
  for(let g=0;g<vis;g++){const am=-Math.PI/2+Math.PI*(g+.5)/vis,cw=Math.cos(am);if(cw<.18)continue;const d=[envP(s,x,y,t1-.012,am),envP(s,x,y,(t0+t1)/2,am+.11),envP(s,x,y,t0+.012,am),envP(s,x,y,(t0+t1)/2,am-.11)];fill(c,d,[236,210,150]);}
  tone(c,band,[40,30,60],.0);
  // the horizontal panel seams and the load tapes along the gore seams
  c.strokeStyle=rgb(LINE,.14);c.lineWidth=1;for(let j=1;j<9;j++){const t=j/9;if(t>t0-.02&&t<t1+.02)continue;c.beginPath();for(let i=0;i<=40;i++){const p=envP(s,x,y,t,-Math.PI/2+Math.PI*i/40);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);}c.stroke();}
  c.strokeStyle=rgb(LINE,.42);c.lineWidth=1.3;for(let g=1;g<vis;g++){const a=-Math.PI/2+Math.PI*g/vis;c.beginPath();for(let i=0;i<=N;i++){const p=envP(s,x,y,i/N,a);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);}c.stroke();}
  // the round shading of the whole envelope: shade on the side away from the sun and under the belly, light on the sun's side
  const sh=[],li=[];for(let i=0;i<=30;i++){const t=i/30;sh.push(envP(s,x,y,t,-Math.PI/2));}for(let i=30;i>=0;i--){const t=i/30;sh.push(envP(s,x,y,t,-.95));}tone(c,sh,[80,44,86],.22);
  const g2=c.createLinearGradient(0,throat-EG.h*.62*s,0,throat);g2.addColorStop(0,'rgba(70,40,80,0)');g2.addColorStop(1,'rgba(70,40,80,.28)');c.globalCompositeOperation='multiply';c.fillStyle=g2;c.fillRect(x-EG.R*s,throat-EG.h*.62*s,EG.R*2*s,EG.h*.62*s+4);c.globalCompositeOperation='source-over';
  void li;{const [hx,hy]=envP(s,x,y,.7,.6);c.save();c.globalCompositeOperation='screen';dab(c,hx,hy,46*s,120*s,[255,255,255],.3,-.12,.1);c.restore();}
  c.restore();line(c,sil,{...L,close:true,width:2.2});});
 const basket=mk(y-bh-6*s-6,y+4,c=>{const b=[P(x-bw/2,y),P(x+bw/2,y),P(x+bw*.53,y-bh),P(x-bw*.53,y-bh)];fill(c,b,BASKET);tone(c,[P(x-bw/2,y),P(x,y),P(x,y-bh),P(x-bw*.53,y-bh)],[80,50,70],.22);
  c.save();path(c,b);c.clip();c.strokeStyle=rgb(BASKET_D,.55);c.lineWidth=1.2;for(let i=1;i<7;i++){const yy=y-bh*i/7;c.beginPath();c.moveTo(x-bw,yy);c.lineTo(x+bw,yy);c.stroke();}
  for(let i=-6;i<=6;i++){c.beginPath();c.moveTo(x+i*bw*.09,y);c.lineTo(x+i*bw*.1,y-bh);c.stroke();}c.restore();line(c,b,{...L,close:true});
  // the padded leather rim, and the leather skid at the foot
  const rim=[P(x-bw*.57,y-bh-6*s),P(x+bw*.57,y-bh-6*s),P(x+bw*.57,y-bh+5*s),P(x-bw*.57,y-bh+5*s)];fill(c,smooth(rim,1,true),[96,58,38]);line(c,rim,{...L,close:true});
  const ft=[P(x-bw*.52,y-5*s),P(x+bw*.52,y-5*s),P(x+bw*.5,y),P(x-bw*.5,y)];fill(c,ft,[96,58,38]);line(c,ft,{...L,close:true,width:1.3});});
 const sheets={back,env,basket},grade={};return {W,H,x,y,s,q,sheets,grade,mouth:throat,top,bh};}
 function vaBalloonGrade(B,L,all){for(const k of ['back','env','basket']){const t=L.tint,key=t.map(x=>Math.round(x/3)).join(',');let G=B.grade[k];if(G&&G.key===key)continue;
 if(!G){const cv=document.createElement('canvas');cv.width=B.sheets[k].width;cv.height=B.sheets[k].height;cv.y0=B.sheets[k].y0;cv.vh=B.sheets[k].vh;G=B.grade[k]={cv};}vaGrade(G.cv,B.sheets[k],t,L.haze,0);G.key=key;if(!all)break;}}

// ── Mila and Bru ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const SKIN=[250,218,184],HAIR=[70,40,28],BERET=[204,52,52],JERSEY=[246,240,220],STRIPE=[200,60,60],STRAP=[62,92,160],WHITE=[250,246,236],BROWN=[150,96,56];
 function cel(c,pts,col,L,o={}){fill(c,pts,col);if(o.shade)tone(c,o.shade,[80,50,70],o.shadeK??.2);if(L)line(c,pts,{...L,width:L.width*(o.width||1),close:true});}
 function limb(c,pts,L,w,col=SKIN){if(L)line(c,pts,{...L,width:L.width*.8+w});line(c,pts,{col,width:w-1.5});}
 function hand(c,x,y,r,L){ell(c,x,y,r,r*.9);c.fillStyle=rgb(SKIN);c.fill();if(L){c.strokeStyle=rgb(L.col,L.alpha);c.lineWidth=L.width*.8;c.stroke();}}
// pose: look (up at the flame), point, wave, rope, sleep, lantern, down; ph: the animation phase on twos
 function girl(c,x,y,s,pose,ph,L,lantern){const tors=smooth([P(x-26*s,y),P(x+26*s,y),P(x+24*s,y-40*s),P(x+10*s,y-56*s),P(x-10*s,y-56*s),P(x-24*s,y-40*s)],2,true);
 const lean=pose==='down'?8*s:pose==='sleep'?4*s:0;
 // arms behind the head first when raised
 const arms=[];const sh=[x+18*s,y-38*s],sh2=[x-18*s,y-38*s];
 if(pose==='point'){const k=Math.sin(ph*.9)*3*s;arms.push([sh,P(x+40*s,y-60*s+k),P(x+62*s,y-82*s+k)],[sh2,P(x-34*s,y-20*s),P(x-40*s,y-2*s)]);}
 else if(pose==='wave'){const k=Math.sin(ph*3.2)*12*s;arms.push([sh,P(x+42*s,y-66*s),P(x+54*s+k,y-98*s)],[sh2,P(x-34*s,y-20*s),P(x-40*s,y-2*s)]);}
 else if(pose==='rope'){arms.push([sh,P(x+30*s,y-74*s),P(x+40*s,y-110*s)],[sh2,P(x-30*s,y-74*s),P(x-40*s,y-110*s)]);}
 else if(pose==='lantern'){const k=Math.sin(ph*.8)*2*s;arms.push([sh,P(x+36*s,y-60*s),P(x+44*s,y-88*s+k)],[sh2,P(x-34*s,y-20*s),P(x-40*s,y-2*s)]);}
 else if(pose==='sleep'){arms.push([sh,P(x+24*s,y-20*s),P(x+8*s,y-8*s)],[sh2,P(x-24*s,y-20*s),P(x-8*s,y-8*s)]);}
 else {arms.push([sh,P(x+34*s,y-20*s),P(x+40*s,y-2*s)],[sh2,P(x-34*s,y-20*s),P(x-40*s,y-2*s)]);}
 cel(c,tors,JERSEY,L);c.save();path(c,tors);c.clip();c.fillStyle=rgb(STRIPE);for(let i=0;i<3;i++)c.fillRect(x-30*s,y-12*s-i*14*s,60*s,5*s);c.restore();
 for(const sx of [-1,1]){const st=[P(x+sx*12*s,y),P(x+sx*18*s,y),P(x+sx*14*s,y-52*s),P(x+sx*8*s,y-52*s)];fill(c,st,STRAP);if(L)line(c,st,{...L,close:true,width:L.width*.7});}
 fill(c,[P(x-7*s,y-52*s),P(x+7*s,y-52*s),P(x+7*s+lean*.4,y-64*s),P(x-7*s+lean*.4,y-64*s)],SKIN);
 const hx=x+lean,hy=y-86*s+(pose==='sleep'?6*s:pose==='down'?4*s:0),hr=24*s;
 const braid=[P(hx+16*s,hy+6*s),P(hx+30*s,hy+20*s+Math.sin(ph*1.7)*2*s),P(hx+36*s,hy+42*s)];limb(c,braid,L,8*s,HAIR);fill(c,[P(hx+32*s,hy+38*s),P(hx+42*s,hy+42*s),P(hx+36*s,hy+50*s)],BERET);
 const head=blob(hx,hy,hr,3,.02,20,hr*1.04);cel(c,head,SKIN,L,{shade:[P(hx-hr*.2,hy-hr),P(hx-hr*1.1,hy-hr),P(hx-hr*1.1,hy+hr),P(hx-hr*.3,hy+hr)],shadeK:.14});
 const bang=smooth([P(hx-hr*1.02,hy-hr*.1),P(hx-hr*.95,hy-hr*.7),P(hx-hr*.5,hy-hr*1.02),P(hx+hr*.3,hy-hr*1.02),P(hx+hr*.95,hy-hr*.7),P(hx+hr*1.02,hy-hr*.05),P(hx+hr*.8,hy-hr*.4),P(hx+hr*.45,hy-hr*.55),P(hx+hr*.05,hy-hr*.5),P(hx-hr*.35,hy-hr*.62),P(hx-hr*.7,hy-hr*.42),P(hx-hr*.86,hy-hr*.05)],2,true);cel(c,bang,HAIR,L);
 const ber=smooth([P(hx-hr*1.12,hy-hr*.58),P(hx-hr*.9,hy-hr*1.1),P(hx-hr*.2,hy-hr*1.34),P(hx+hr*.5,hy-hr*1.3),P(hx+hr*1.05,hy-hr*1.0),P(hx+hr*1.0,hy-hr*.62),P(hx+hr*.3,hy-hr*.9),P(hx-hr*.5,hy-hr*.92)],2,true);cel(c,ber,BERET,L);
 // the face: eyes look up at the flame, ahead, or down; closed asleep
 const lc=LINE,ey=pose==='look'?-.12:pose==='down'||pose==='wave'?.12:0,ex=pose==='point'||pose==='lantern'?.06:0;
 for(const sx of [-1,1]){const cx=hx+sx*hr*.36,cy=hy+hr*.02;
  if(pose==='sleep')line(c,[P(cx-hr*.1,cy),P(cx,cy+hr*.06),P(cx+hr*.1,cy)],{col:lc,width:1.5*s+.4});
  else{ell(c,cx+ex*hr,cy+ey*hr,hr*.085,hr*.13);c.fillStyle=rgb(lc);c.fill();ell(c,cx+ex*hr-hr*.03,cy+ey*hr-hr*.05,hr*.03,hr*.04);c.fillStyle='#fff';c.fill();}
  ell(c,hx+sx*hr*.5,hy+hr*.3,hr*.16,hr*.1);c.fillStyle='rgba(240,120,110,.45)';c.fill();}
 if(pose==='wave'||pose==='look')line(c,[P(hx-hr*.22,hy+hr*.36),P(hx,hy+hr*.54),P(hx+hr*.24,hy+hr*.34)],{col:lc,width:1.8*s+.4});
 else if(pose==='sleep'){ell(c,hx,hy+hr*.46,hr*.08,hr*.06);c.strokeStyle=rgb(lc);c.lineWidth=1.2;c.stroke();}
 else line(c,[P(hx-hr*.16,hy+hr*.4),P(hx,hy+hr*.48),P(hx+hr*.18,hy+hr*.38)],{col:lc,width:1.6*s+.4});
 for(const a of arms){limb(c,a,L,9*s);const e=a[a.length-1];hand(c,e[0],e[1],6.5*s,L);}
 if(pose==='lantern'){const e=arms[0][2],lx=e[0],ly=e[1]+4*s;c.strokeStyle=rgb(LINE);c.lineWidth=1.4;c.beginPath();c.moveTo(lx,ly);c.lineTo(lx,ly+8*s);c.stroke();
  fill(c,[P(lx-7*s,ly+8*s),P(lx+7*s,ly+8*s),P(lx+6*s,ly+24*s),P(lx-6*s,ly+24*s)],[255,226,140]);line(c,[P(lx-7*s,ly+8*s),P(lx+7*s,ly+8*s),P(lx+6*s,ly+24*s),P(lx-6*s,ly+24*s)],{...L,close:true,width:L.width*.7});lantern.push([lx,ly+16*s]);}}
// pose: up (ears up at the flame), peek, bark, wind, sleep, howl
 function dog(c,x,y,s,pose,ph,L){const lc=LINE;
 for(const sx of [-1,1]){const paw=smooth([P(x+sx*12*s,y+2*s),P(x+sx*24*s,y+2*s),P(x+sx*22*s,y-10*s),P(x+sx*12*s,y-10*s)],2,true);cel(c,paw,WHITE,L);}
 const up=pose==='howl'?-10*s:pose==='peek'?6*s:pose==='sleep'?10*s:0,hx=x+(pose==='peek'?6*s:0),hy=y-30*s+up,hr=22*s,tilt=pose==='howl'?-.35:0;
 c.save();c.translate(hx,hy);c.rotate(tilt);c.translate(-hx,-hy);
 const head=blob(hx,hy,hr*1.1,5,.03,20,hr);cel(c,head,WHITE,L,{shade:[P(hx,hy-hr),P(hx+hr*1.3,hy-hr),P(hx+hr*1.3,hy+hr),P(hx,hy+hr)],shadeK:.12});
 c.save();path(c,head);c.clip();fill(c,blob(hx+hr*.55,hy-hr*.3,hr*.42,8,.1,14,hr*.5),BROWN);c.restore();
 // the ears: up, flying in the wind, or down
 const fly=pose==='wind'?Math.sin(ph*4)*.12:0;
 const earL=pose==='up'||pose==='bark'?[P(hx-hr*.8,hy-hr*.7),P(hx-hr*1.15,hy-hr*1.35),P(hx-hr*.95,hy-hr*1.5),P(hx-hr*.5,hy-hr*.85)]
  :pose==='wind'?[P(hx-hr*.9,hy-hr*.55),P(hx-hr*1.7,hy-hr*(.8+fly)),P(hx-hr*1.8,hy-hr*(.4+fly)),P(hx-hr*.8,hy-hr*.1)]
  :[P(hx-hr*.95,hy-hr*.55),P(hx-hr*1.25,hy-hr*.1),P(hx-hr*1.15,hy+hr*.45),P(hx-hr*.8,hy+hr*.2),P(hx-hr*.7,hy-hr*.3)];
 cel(c,smooth(earL,2,true),BROWN,L);
 const earR=pose==='up'||pose==='bark'?[P(hx+hr*.8,hy-hr*.7),P(hx+hr*1.15,hy-hr*1.35),P(hx+hr*.95,hy-hr*1.5),P(hx+hr*.5,hy-hr*.85)]
  :pose==='wind'?[P(hx+hr*.6,hy-hr*.8),P(hx-hr*.2,hy-hr*(1.5+fly)),P(hx-hr*.5,hy-hr*(1.2+fly)),P(hx+hr*.3,hy-hr*.7)]
  :[P(hx+hr*.9,hy-hr*.6),P(hx+hr*1.3,hy-hr*.85),P(hx+hr*1.2,hy-hr*.1),P(hx+hr*.85,hy)];
 cel(c,smooth(earR,2,true),WHITE,L);
 const open=pose==='bark'?(Math.sin(ph*6)>0?1:.3):pose==='howl'?1:0;
 ell(c,hx,hy+hr*.45,hr*.5,hr*.32);c.fillStyle=rgb(WHITE);c.fill();if(L){c.strokeStyle=rgb(lc,L.alpha);c.lineWidth=L.width*.8;c.stroke();}
 if(open>0){ell(c,hx,hy+hr*.72,hr*.2,hr*.16*open+hr*.04);c.fillStyle=rgb([90,40,50]);c.fill();}
 else if(pose!=='sleep'){const t=smooth([P(hx-hr*.14,hy+hr*.6),P(hx+hr*.14,hy+hr*.6),P(hx+hr*.14,hy+hr*.95),P(hx,hy+hr*1.05),P(hx-hr*.14,hy+hr*.95)],2,true);cel(c,t,[236,110,120],L,{width:.7});}
 ell(c,hx,hy+hr*.28,hr*.17,hr*.12);c.fillStyle=rgb(lc);c.fill();
 for(const sx of [-1,1]){const cx=hx+sx*hr*.38,cy=hy-hr*.08;if(pose==='sleep'||pose==='howl')line(c,[P(cx-hr*.1,cy),P(cx,cy+hr*.06),P(cx+hr*.1,cy)],{col:lc,width:1.5});
  else{const ey=pose==='up'?-hr*.05:pose==='peek'?hr*.05:0;ell(c,cx,cy+ey,hr*.09,hr*.12);c.fillStyle=rgb(lc);c.fill();ell(c,cx-hr*.03,cy+ey-hr*.05,hr*.03,hr*.035);c.fillStyle='#fff';c.fill();}}
 c.restore();}
// The riders on their own small canvas, redrawn on twos (12 a second) and graded like the rest.
 function vaRiders(f,L,lightLine){const B=VA.balloon,s=BS,q=VA.q,W=260*s,H=200*s;let R=VA.riders;
 if(!R){const a=document.createElement('canvas'),b=document.createElement('canvas');a.width=b.width=Math.ceil(W*q);a.height=b.height=Math.ceil(H*q);R=VA.riders={a,b,W,H,lantern:[]};}
 const ph=Math.floor(f.t*12)/12,pose=f.pose||{mila:'look',bru:'up'},key=`${pose.mila}|${pose.bru}|${ph}|${L.tint.map(x=>Math.round(x/3))}|${lightLine?1:0}`;
 if(key===VA.ridersKey)return R;VA.ridersKey=key;
 const c=R.a.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,R.a.width,R.a.height);c.scale(q,q);
 const Ls={col:lightLine?[236,232,222]:LINE,width:1.8,alpha:.9};R.lantern=[];
 // origin: the middle of the basket's rim, at (W/2, H-10)
 const ox=W/2,oy=H-10;girl(c,ox-22*s/.72,oy+2,s,pose.mila,ph,Ls,R.lantern);dog(c,ox+36*s/.72,oy+4,s,pose.bru,ph,Ls);
 const g=R.b.getContext('2d');g.setTransform(1,0,0,1,0,0);vaGrade(R.b,R.a,lightLine?[255,255,255]:L.tint,L.haze,0);void g;void B;return R;}

// ── The life on the landmarks (drawn over their sprites, in the sprite's own coordinates) ────────────────────────────────────────
 function vaLife(c,id,t,L,f,night){const ln={col:LINE,width:1.4};
 switch(id){
 case 'ramat':{for(let i=0;i<7;i++){const x=80+i*70+Math.sin(t*.3+i*2)*14,y=200+(i%3)*12;fill(c,blob(x,y,16,i,.15,12,10),[248,244,232]);line(c,blob(x,y,16,i,.15,12,10),{...ln,close:true,width:1});ell(c,x+(i%2?-15:15),y-2,5,4.5);c.fillStyle=rgb([50,40,40]);c.fill();}break;}
 case 'masia':{for(let i=0;i<4;i++){const x=150+i*22+Math.sin(t*.8+i)*6,y=246,peck=Math.sin(t*3+i*1.7)>.6?3:0;ell(c,x,y-6+peck*.4,6,5);c.fillStyle=rgb([250,248,240]);c.fill();ell(c,x+5,y-10+peck,2.5,2.5);c.fill();c.fillStyle=rgb([220,60,50]);c.fillRect(x+4,y-14+peck,2,2);}
  smoke(c,180,118,t,night);break;}
 case 'viaducte':{const x=((t*80)%1600)-500;train(c,x,130,.9,night);break;}
 case 'refugi':smoke(c,292,160,t,night);break;
 case 'port':case 'canal':{const x=id==='port'?((t*30)%1000)-100:((t*36)%1100)-150,y=id==='port'?250:220;boat(c,x,y,t);break;}
 case 'cala':case 'cala2':{const x=330+Math.sin(t*.25)*60,y=230+Math.sin(t*1.3)*2;sailboat(c,x,y);if(id==='cala2')dolphins(c,450,250,t);break;}
 case 'gola':dolphins(c,500,250,t);break;
 case 'panta':case 'llacuna':{for(let i=0;i<4;i++){const x=300+i*40+Math.sin(t*.2+i)*30,y=200+(i%2)*12;ell(c,x,y,7,4);c.fillStyle=rgb([250,248,240]);c.fill();ell(c,x+6,y-5,3,3);c.fillStyle=rgb([60,120,80]);c.fill();line(c,[P(x-14,y+3),P(x+14,y+3)],{col:[240,250,255],width:1,alpha:.6});}break;}
 case 'arrossars':{for(let i=0;i<6;i++){const u=((t*.08+i*.17)%1),x=120+i*110+u*60,y=250-u*120-(i%2)*20;bird(c,x,y,8,t*6+i,[236,120,140],2);}break;}
 case 'tartera':{const x=200+((t*14)%300),y=180+((t*14)%300)*.18;c.fillStyle=rgb([150,100,60]);ell(c,x,y,10,6);c.fill();ell(c,x+9,y-6,4,3.5);c.fill();c.strokeStyle=rgb([60,40,30]);c.lineWidth=1.5;c.beginPath();c.moveTo(x+9,y-9);c.lineTo(x+7,y-14);c.moveTo(x+11,y-9);c.lineTo(x+12,y-14);c.stroke();break;}
 case 'pontpenjant':{const pts=[];for(let i=0;i<=24;i++){const u=i/24;pts.push(P(150+u*460,72+Math.sin(u*Math.PI)*40+Math.sin(t*.9)*1.5*Math.sin(u*Math.PI)));}
  c.strokeStyle=rgb([120,90,60]);c.lineWidth=5;path(c,pts,false);c.stroke();c.strokeStyle=rgb(LINE);c.lineWidth=1.2;path(c,pts.map(p=>[p[0],p[1]-16]),false);c.stroke();for(const p of pts){c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0],p[1]-16);c.stroke();}break;}
 case 'telecabina':{const cab=u=>P(120+u*660,64+Math.sin(u*Math.PI)*60);c.strokeStyle=rgb(LINE);c.lineWidth=1.4;c.beginPath();for(let i=0;i<=20;i++){const p=cab(i/20);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);}c.stroke();
  const u=.5+.45*Math.sin(t*.12),p=cab(u);c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0],p[1]+16);c.stroke();const b=[P(p[0]-16,p[1]+16),P(p[0]+16,p[1]+16),P(p[0]+14,p[1]+40),P(p[0]-14,p[1]+40)];fill(c,b,[214,60,50]);line(c,b,{...ln,close:true});
  c.fillStyle=rgb(night?[255,220,140]:[200,226,240]);c.fillRect(p[0]-11,p[1]+20,22,8);break;}
 case 'moli':{const x=260,y=110,a=t*TAU/6;for(let k=0;k<4;k++){const b=a+k*TAU/4,cx=Math.cos(b),sy=Math.sin(b);const q=[P(x+cx*8,y+sy*8),P(x+cx*70-sy*6,y+sy*70+cx*6),P(x+cx*70+sy*10,y+sy*70-cx*10),P(x+cx*12+sy*8,y+sy*12-cx*8)];fill(c,q,[248,244,232]);line(c,q,{...ln,close:true,width:1});}
  ell(c,x,y,6,6);c.fillStyle=rgb([120,90,60]);c.fill();break;}
 case 'castell':{const k=Math.sin(t*2.4);fill(c,[P(410,10),P(450,16+k*3),P(410,28)],[236,200,60]);c.strokeStyle=rgb(LINE);c.lineWidth=1.4;c.beginPath();c.moveTo(410,10);c.lineTo(410,40);c.stroke();break;}
 case 'far':case 'farpetit':{const M=id==='far'?[250,91]:[230,117];beam(c,M[0],M[1],t,night,id==='far'?1:.7);break;}
 case 'platja':{for(let i=0;i<5;i++){const x=140+i*150+Math.sin(t*.6+i)*20,jump=Math.max(0,Math.sin(t*2.2+i*1.3))*8;c.fillStyle=rgb([[236,90,80],[90,150,210],[250,210,90]][i%3]);ell(c,x,196-jump,4,6);c.fill();ell(c,x,186-jump,3.4,3.4);c.fillStyle=rgb([240,200,160]);c.fill();}break;}
 }}
 function smoke(c,x,y,t,night){for(let i=0;i<4;i++){const u=((t*.25+i/4)%1);dab(c,x-u*30,y-u*70,6+u*14,5+u*10,night?[150,150,170]:[245,242,236],.55*(1-u));}}
 function boat(c,x,y,t){const k=Math.sin(t*1.6)*1.5,h=[P(x-30,y-8+k),P(x+34,y-8+k),P(x+24,y+6+k),P(x-24,y+6+k)];fill(c,h,[236,226,200]);fill(c,[P(x-30,y-8+k),P(x+34,y-8+k),P(x+32,y-3+k),P(x-29,y-3+k)],[60,120,170]);line(c,h,{col:LINE,width:1.3,close:true});
 const cab=[P(x-6,y-8+k),P(x+14,y-8+k),P(x+14,y-22+k),P(x-6,y-22+k)];fill(c,cab,[250,248,240]);line(c,cab,{col:LINE,width:1.1,close:true});line(c,[P(x-40,y+8),P(x-80,y+8)],{col:[255,255,255],width:1.4,alpha:.6});}
 function sailboat(c,x,y){const h=[P(x-24,y),P(x+26,y),P(x+18,y+9),P(x-18,y+9)];fill(c,h,[250,248,240]);line(c,h,{col:LINE,width:1.2,close:true});c.strokeStyle=rgb(LINE);c.lineWidth=1.4;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-56);c.stroke();
 const s1=[P(x+2,y-54),P(x+2,y-4),P(x+30,y-6)],s2=[P(x-2,y-46),P(x-2,y-6),P(x-22,y-8)];fill(c,s1,[250,250,246]);fill(c,s2,[236,96,80]);line(c,s1,{col:LINE,width:1.1,close:true});line(c,s2,{col:LINE,width:1.1,close:true});}
 function dolphins(c,x,y,t){for(let i=0;i<2;i++){const u=((t*.35+i*.5)%1);if(u>.5)continue;const k=u/.5,px=x+i*60+k*80,py=y-Math.sin(k*Math.PI)*40,rot=Math.cos(k*Math.PI)*-.9;c.save();c.translate(px,py);c.rotate(rot);
  const b=smooth([P(-22,0),P(-8,-8),P(14,-6),P(24,0),P(10,4),P(-12,4)],2,true);fill(c,b,[110,130,160]);line(c,b,{col:LINE,width:1.2,close:true});fill(c,[P(-2,-7),P(4,-15),P(8,-6)],[110,130,160]);c.restore();
  if(k<.12||k>.88)dab(c,x+i*60+(k<.5?0:80),y+2,14,4,[255,255,255],.6);}}
 function beam(c,x,y,t,night,k){if(night<.05){dab(c,x,y,8*k,8*k,[255,250,220],.6);return;}const a=t*TAU/10;c.save();c.globalCompositeOperation='lighter';
 for(const side of [0,Math.PI]){const b=a+side,dx=Math.cos(b),dy=Math.sin(b)*.25,L2=420*k*(.4+.6*Math.abs(Math.cos(b)));const g=c.createLinearGradient(x,y,x+dx*L2,y+dy*L2);g.addColorStop(0,`rgba(255,240,190,${.38*night})`);g.addColorStop(1,'rgba(255,240,190,0)');
  c.fillStyle=g;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx*L2-dy*L2*.25,y+dy*L2+dx*30*k);c.lineTo(x+dx*L2+dy*L2*.25,y+dy*L2-dx*30*k);c.closePath();c.fill();}
 c.restore();dab(c,x,y,22*k,22*k,[255,236,170],.9*night);}
 function train(c,x,y,s,night){const green=[60,120,80],red=[190,60,50],cream=night>.3?[255,220,140]:[240,228,190],dark=[40,36,40],L={col:LINE,width:1.2};
 let cx=x;const loco=[P(cx,y),P(cx+70*s,y),P(cx+70*s,y-34*s),P(cx+40*s,y-34*s),P(cx+40*s,y-48*s),P(cx+16*s,y-48*s),P(cx+16*s,y-24*s),P(cx,y-24*s)];fill(c,loco,green);line(c,loco,{...L,close:true});
 fill(c,[P(cx+4*s,y-24*s),P(cx+12*s,y-24*s),P(cx+12*s,y-44*s),P(cx+4*s,y-44*s)],dark);c.fillStyle=rgb(cream);c.fillRect(cx+48*s,y-32*s,14*s,10*s);
 for(const wx of [14,36,58]){ell(c,cx+wx*s,y,7*s,7*s);c.fillStyle=rgb(dark);c.fill();}
 cx+=78*s;for(let i=0;i<3;i++){const car=[P(cx,y),P(cx+60*s,y),P(cx+60*s,y-30*s),P(cx,y-30*s)];fill(c,car,i%2?green:red);line(c,car,{...L,close:true});c.fillStyle=rgb(cream);for(let k=0;k<3;k++)c.fillRect(cx+(8+k*18)*s,y-26*s,11*s,9*s);
  for(const wx of [12,48]){ell(c,cx+wx*s,y,6*s,6*s);c.fillStyle=rgb(dark);c.fill();}cx+=66*s;}
 for(let i=0;i<4;i++)dab(c,x+8*s-i*24*s,y-56*s-i*18*s,(8+i*5)*s,(7+i*4)*s,[250,246,240],.8-i*.16);}

// ── The sky ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 function vaStars(){if(VA.stars)return VA.stars;const r=rng(77),out=[];for(let i=0;i<110;i++)out.push([r(),Math.pow(r(),1.4)*.62,.6+r()*1.4,r()*TAU]);return VA.stars=out;}
 function sky(c,VW,L,hy,t){const g=c.createLinearGradient(0,0,0,hy);g.addColorStop(0,rgb(L.sky[0]));g.addColorStop(.45,rgb(L.sky[1]));g.addColorStop(.82,rgb(L.sky[2]));g.addColorStop(1,rgb(L.sky[3]));c.fillStyle=g;c.fillRect(0,0,VW,hy+60);
 if(L.stars>.02){c.fillStyle='#fff';for(const [x,y,s,p] of vaStars()){c.globalAlpha=L.stars*(.55+.45*Math.sin(t*.7+p));c.fillRect(x*VW,y*hy,s,s);}c.globalAlpha=1;}
 const sx=L.sun[0]*VW,sy=hy-L.sun[1]*hy*.9;
 if(L.moon>.02){c.globalAlpha=L.moon;dab(c,sx,sy,90,90,[170,190,240],.35);ell(c,sx,sy,26,26);c.fillStyle=rgb([246,244,226]);c.fill();ell(c,sx+8,sy-6,6,5);c.fillStyle=rgb([214,212,200]);c.fill();ell(c,sx-9,sy+8,4,4);c.fill();c.globalAlpha=1;}
 else if(L.sun[1]>-.15){dab(c,sx,sy,150,150,L.glow,.5);ell(c,sx,sy,34,34);c.fillStyle=rgb(L.sunCol);c.fill();}
 return [sx,sy];}

// ── The strips ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
 function strip(c,img,q,h,ox,y,VW,TW,alpha=1){if(!img||y>800||y+h<0)return;ox=((ox%TW)+TW)%TW;let x=0,u=ox;c.globalAlpha=alpha;
 while(x<VW-.01){const seg=Math.min(TW-u,VW-x);c.drawImage(img,u*q,0,Math.max(1,seg*q),h*q,x,y,seg,h);x+=seg;u=0;}c.globalAlpha=1;}
 function lights(c,list,ox,y,VW,TW,k,alpha){if(alpha<.03||!list.length)return;c.save();c.globalCompositeOperation='lighter';ox=((ox%TW)+TW)%TW;
 for(const [lx,ly,s] of list){let x=lx-ox;if(x<-20)x+=TW;if(x>VW+20)continue;c.globalAlpha=alpha*.9;c.fillStyle='rgb(255,214,130)';c.fillRect(x-s*.4*k,y+ly-s*.4*k,s*.8*k,s*.8*k);c.globalAlpha=alpha*.35;dab(c,x,y+ly,s*1.8*k,s*1.8*k,[255,190,100],1);}c.restore();}

// ── The frame ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Where each strip lies at height a (0 treetops, 1 top), and its parallax.
 function vgLayers(a){const k=clamp((a-.4)/.6);return {clouds:{y:40+120*a,p:.04},mt1:{y:230+40*a,p:.06},mt2:{y:330+80*a,p:.12},plain:{y:455+150*a,p:.3},near:{y:520+520*a,p:1},deck:{y:920-400*k-VGM.DECK_TOP,p:.25},horizon:520+40*a};}
 function vgRender(c,w,h,game,s,preview=false){const S=h/800,VW=w/S,f=game?.viatge,d=escDecor({preview,background:s.background,base:s.base,opacity:s.opacity});
 c.save();c.scale(S,S);
 if(!f||preview&&!VA.cur?.W?.sheets?.near){vaPreview(c,VW,d);c.restore();return true;}
 // the journey on screen: painted at load; a new one is painted while the screen is dark between journeys
 if(!VA.cur||VA.cur.v!==f.v||VA.cur.i<VA.cur.jobs.length){if(f.phase!=='next'){if(!VA.cur||VA.cur.v!==f.v){VA.q=vaQ();VA.cur=vaPlan(f.v);}vaRun(VA.cur,40);}}
 if(f.phase==='next'){if(!VA.next||VA.next.v!==vgNextV(f))VA.next=vaPlan(vgNextV(f));if(vaRun(VA.next,24)>=1){VA.cur=VA.next;VA.next=null;vgBegin(game,s);}c.fillStyle='#000';c.fillRect(0,0,VW,800);c.restore();return true;}
 if(!VA.balloon)VA.balloon=vaBalloon(VA.q);
 const P0=VA.cur,W=P0.W,TW=W.TW,ready=P0.i>=P0.jobs.length;
 const p=vgDay(f,s),st=vgStage(p),L=vgLight(st),a=f.a,lay=vgLayers(Math.max(0,a)),gnd=Math.min(0,a),t=f.t,night=clamp((L.lights-.2)/.8);
 const now=performance.now();const dt=Math.min(.1,(now-(VA.last||now))/1000);VA.last=now;VA.flame+=((f.burn?1:0)-VA.flame)*Math.min(1,dt*8);
 if(ready){vaRegrade(P0,L,2);vaBalloonGrade(VA.balloon,L,false);}
 const dist=f.dist,BX=VW*.32,by=600+(a>0?Math.sin(f.bob*1.1)*4:0)+(gnd<0?0:0),lift=gnd*520;
 // a little lower everything when on the ground (the near strip rises to the basket)
 const Y=k=>lay[k].y+(k==='near'?lift:k==='plain'?gnd*150:0);
 if(d.mode==='none'){c.fillStyle=d.base;c.fillRect(0,0,VW,800);vaWeatherBirds(c,VW,f,s,p,t,d);vaDrawBalloon(c,BX,by,f,L,night,d);vaFade(c,VW,f);c.restore();return true;}
 // sky, sun or moon, stars
 if(!ready){sky(c,VW,L,lay.horizon,t);vaDrawBalloon(c,BX,by,f,L,night,d);c.restore();return true;}
 const wx=vgWeather(W.season,p);
 // The far layers (sky, sun or moon, stars, far clouds, the two ranges, the storm's glow, the rainbow, the warm light near the sun) move
 // slowly: they are drawn on a canvas the size of the screen every third frame and laid as one picture in between (0.43, a third of the
 // cost of a frame on a dense screen without a graphics card).
 const far=vaFar(c,VW,(F,sx,sy)=>{const [x,y]=sky(F,VW,L,lay.horizon,t);
  if(wx.storm>0){const k=wx.storm*(.18+.12*Math.sin(t*1.7)+.06*Math.sin(t*.63));dab(F,VW*.8,lay.horizon-120,260,140,[255,214,170],k);}
  strip(F,vaImg(P0,'clouds'),W.sheets.clouds.q,W.H.clouds,dist*lay.clouds.p+t*3,Y('clouds'),VW,TW);
  strip(F,vaImg(P0,'mt1'),W.sheets.mt1.q,W.H.mt1,dist*lay.mt1.p,Y('mt1'),VW,TW);
  strip(F,vaImg(P0,'mt2'),W.sheets.mt2.q,W.H.mt2,dist*lay.mt2.p,Y('mt2'),VW,TW);
  if(wx.rainbow>0)rainbow(F,VW,lay.horizon,wx.rainbow);
  if(L.liftA>.02&&L.moon<.5){const r=VW*.55,g=F.createRadialGradient(x,y,10,x,y,r);g.addColorStop(0,rgb(L.lift,L.liftA*.8));g.addColorStop(1,rgb(L.lift,0));F.fillStyle=g;F.fillRect(Math.max(0,x-r),0,Math.min(VW,x+r)-Math.max(0,x-r),Math.min(800,y+r));}
  return [x,y];},Math.min(800,Y('mt2')+W.H.mt2),P0.v);
 const sx=far[0],sy=far[1];void sx;void sy;
 strip(c,vaImg(P0,'plain'),W.sheets.plain.q,W.H.plain,dist*lay.plain.p,Y('plain'),VW,TW);
 lights(c,W.lights.plain,dist*lay.plain.p,Y('plain'),VW,TW,.7,L.lights*.9);
 vaMarks(c,P0,'plain',BX,dist,Y('plain'),lay.plain.p,VW,s,t,L,f,night);
 if(Y('near')<800){strip(c,vaImg(P0,'near'),W.sheets.near.q,W.H.near,dist,Y('near'),VW,TW);lights(c,W.lights.near,dist,Y('near'),VW,TW,1,L.lights);vaMarks(c,P0,'near',BX,dist,Y('near'),1,VW,s,t,L,f,night);
  // the balloon's shadow on the ground, and the people waiting with lanterns where it lands
  if(a<.35&&L.lights<.6)dab(c,BX+20,Y('near')+175,90*(1-a),14*(1-a),[30,40,30],.22*(1-a/.35)*(1-L.lights));
  vaSite(c,f,BX,dist,Y('near'),L,t);}
 // fog in autumn mornings, lying low: the balloon climbs out of it
 if(wx.fog>0){const k=wx.fog*(1-ss(Math.max(0,a)/.55));if(k>.01){const g=c.createLinearGradient(0,lay.horizon-80,0,800);g.addColorStop(0,rgb(L.haze,0));g.addColorStop(.35,rgb(lighten(L.haze,.3),.85*k));g.addColorStop(1,rgb(lighten(L.haze,.3),.95*k));c.fillStyle=g;c.fillRect(0,lay.horizon-80,VW,880-lay.horizon);}}
 strip(c,vaImg(P0,'deck'),W.sheets.deck.q,W.H.deck,dist*lay.deck.p,Y('deck'),VW,TW);
 // the warm light near the sun at dawn and dusk
 if(d.fade<1){c.save();c.globalAlpha=1-d.fade;c.fillStyle=d.base;c.fillRect(0,0,VW,800);c.restore();}
 vaWeatherBirds(c,VW,f,s,p,t,d,wx,L);
 vaDrawBalloon(c,BX,by,f,L,night,d);
 // wisps of the cloud deck passing in front while the balloon climbs through it
 const wisp=ss((a-.45)/.12)*(1-ss((a-.68)/.12));if(wisp>.01&&d.full)strip(c,vaImg(P0,'deck'),W.sheets.deck.q,W.H.deck,dist*1.4+300,by-200-VGM.DECK_TOP,VW,TW,wisp*.38);
 vaWeatherFront(c,VW,t,wx,L);
 if(f.dark>.002){c.fillStyle=`rgba(3,5,14,${f.dark.toFixed(3)})`;c.fillRect(0,0,VW,800);}
 vaFade(c,VW,f);c.restore();return true;}
// The cache of the far layers, at most 1.5 pixels a virtual pixel (the sheets have no more): redrawn every third frame (or when the journey, the screen or the height of the cache changes much).
function vaFar(c,VW,paint,fh,v){const T=c.getTransform(),k=Math.min(1.5,Math.hypot(T.a,T.b)),w=Math.ceil(VW*k),h=Math.ceil(800*k);let F=VA.far;
 if(!F||F.cv.width!==w||F.cv.height!==h){const cv=document.createElement('canvas');cv.width=w;cv.height=h;F=VA.far={cv,n:0,v:-1,fh:0,sun:[0,0]};}
 if(F.v!==v||F.n%3===0||fh>F.fh+2){const g=F.cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,Math.ceil(Math.max(fh,F.fh)*k)+2);g.setTransform(k,0,0,k,0,0);F.sun=paint(g);F.v=v;F.fh=fh;}
 F.n++;const hh=Math.min(h,Math.ceil(F.fh*k));c.drawImage(F.cv,0,0,w,hh,0,0,VW,hh/k);return F.sun;}
const vgNextV=f=>{const j=vgJourney(f.v);return ((j.route+1)%5)*4+(j.season+1)%4;};
 function vaFade(c,VW,f){let k=0;if(f.phase==='fade')k=ss(f.phaseT/VG_FADE);else if(f.phase==='takeoff')k=1-ss(f.phaseT/1.6);if(k>.002){c.fillStyle=`rgba(0,0,0,${k.toFixed(3)})`;c.fillRect(0,0,VW,800);}}
 function vaMarks(c,P0,layer,BX,dist,y,k,VW,s,t,L,f,night){const W=P0.W,R=vgJourney(P0.v).R;
 R.marks.forEach((id,i)=>{const M=W.marks[id];if(!M||M.layer!==layer)return;const x=BX+(vgMarkDist(i,s)-dist)*k;if(x+M.w/2<-50||x-M.w/2>VW+50)return;
  const x0=x-M.w/2,y0=y+M.y-M.g;c.drawImage(vaImg(P0,'m:'+id),x0,y0,M.w,M.h);
  c.save();c.translate(x0,y0);vaLife(c,id,t,L,f,night);c.restore();
  if(L.lights>.05&&M.lights.length){c.save();c.globalCompositeOperation='lighter';for(const [lx,ly,sz] of M.lights){c.globalAlpha=L.lights*.9;c.fillStyle='rgb(255,214,130)';c.fillRect(x0+lx-sz*.35,y0+ly-sz*.35,sz*.7,sz*.7);c.globalAlpha=L.lights*.3;dab(c,x0+lx,y0+ly,sz*2,sz*2,[255,190,100],1);}c.restore();}});}
 function vaSite(c,f,BX,dist,y,L,t){if(!f.land)return;const x=BX+(f.land.site-dist)+170;if(x<-150||x>2600)return;const gy=y+150,k=1.5;
 for(let i=0;i<3;i++){const px=x+i*62,jump=f.phase==='landed'?Math.max(0,Math.sin(t*4+i*1.4))*8:0,cols=[[86,130,170],[200,96,70],[120,160,90]][i],b=gy-jump;
  const body=[P(px-11*k,b),P(px+11*k,b),P(px+7*k,b-30*k),P(px-7*k,b-30*k)];fill(c,body,cols);line(c,body,{col:LINE,width:1.4,close:true});
  ell(c,px,b-38*k,8*k,8*k);c.fillStyle=rgb([240,200,160]);c.fill();c.strokeStyle=rgb(LINE);c.lineWidth=1.3;c.stroke();
  const arm=f.phase==='landed'&&i===1?Math.sin(t*6)*6:0,lx=px+15*k,ly=b-34*k+Math.sin(t*2+i)*1.5-(i===1?arm+10:0);c.beginPath();c.moveTo(px+6*k,b-24*k);c.lineTo(lx,ly);c.stroke();
  const lan=[P(lx-4*k,ly),P(lx+4*k,ly),P(lx+3*k,ly+10*k),P(lx-3*k,ly+10*k)];fill(c,lan,[255,224,140]);line(c,lan,{col:LINE,width:1,close:true});
  if(L.lights>.05)dab(c,lx,ly+5*k,34,34,[255,200,110],.55*L.lights);}}
function vaDrawBalloon(c,BX,by,f,L,night,d){const B=VA.balloon;if(!B)return;const s=BS,x0=BX-B.x,y0=by-B.y,img=k=>d.mode==='none'?B.sheets[k]:B.grade[k]?.cv||B.sheets[k];
 const tilt=Math.sin(f.bob*.7)*.012;c.save();c.translate(BX,by);c.rotate(tilt);c.translate(-BX,-by);
 const put=k=>{const im=img(k);c.drawImage(im,x0,y0+im.y0,B.W,im.vh);};put('back');
 const fl=VA.flame;
 put('env');
 // the flame, flickering on twos: from the burner up into the mouth, hidden by the fabric above the skirt's edge
 if(fl>.02){const ph=Math.floor(f.t*12),n=.85+.15*Math.sin(ph*2.3)+.08*Math.sin(ph*5.1),fh=(96+44*fl)*s*n,bx=BX,fy=by-(EG.frame+26)*s;
  c.save();c.beginPath();c.rect(BX-260*s,by-900*s,520*s,900*s);vaFabric(s,BX,by).forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.clip('evenodd');
  const pts=smooth([P(bx-14*s,fy),P(bx-20*s,fy-fh*.45),P(bx-8*s,fy-fh*.8),P(bx,fy-fh),P(bx+9*s,fy-fh*.78),P(bx+20*s,fy-fh*.5),P(bx+14*s,fy)],3,true);
  dab(c,bx,fy-fh*.45,30*s,fh*.62,[255,150,40],.9*fl);fill(c,pts.map(p=>[bx+(p[0]-bx)*.9,fy+(p[1]-fy)*.85]),[255,200,90],fl);fill(c,pts.map(p=>[bx+(p[0]-bx)*.4,fy+(p[1]-fy)*.5]),[255,255,230],fl);
  c.restore();
  // the inside of the mouth lit by the flame
  const mo=by-EG.throat*s;c.save();c.globalCompositeOperation='screen';dab(c,bx,mo+EG.skirt*s*.5,EG.rs*s,EG.skirt*s*.9,[255,170,70],.75*fl);c.restore();}
 const lightLine=d.mode==='none'&&!d.white;if(lightLine){const e=envelope(s,BX,by);line(c,e,{col:[236,232,222],width:2,close:true});}
 // the envelope lit from inside by the flame (dusk and night), and a halo
 const glow=Math.max(L.lantern*.6,fl*(.25+.75*L.lantern));if(glow>.03&&d.mode!=='none'){const mouth=by-EG.throat*s,top=by-(EG.throat+EG.h)*s;c.save();path(c,envelope(s,BX,by,false));c.clip();
  const g=c.createRadialGradient(BX,mouth-130*s,10*s,BX,mouth-170*s,360*s);g.addColorStop(0,`rgba(255,190,90,${.9*glow})`);g.addColorStop(.35,`rgba(255,150,60,${.5*glow})`);g.addColorStop(1,'rgba(255,120,40,0)');
  c.globalCompositeOperation='screen';c.fillStyle=g;c.fillRect(BX-EG.R*s-4,top,EG.R*2*s+8,mouth-top+10);c.restore();
  if(night>.1)dab(c,BX,mouth-180*s,360*s,330*s,[255,170,70],.22*glow*night);}
 const R=vaRiders(f,d.mode==='none'?{tint:[255,255,255],haze:L.haze}:L,lightLine);c.drawImage(R.b,BX-R.W/2,by-B.bh-R.H+10,R.W,R.H);
 if(R.lantern.length&&L.lantern>.05)for(const [lx,ly] of R.lantern)dab(c,BX-R.W/2+lx,by-B.bh-R.H+10+ly,40,40,[255,200,110],.5*L.lantern);
 put('basket');if(lightLine){const bw=110*s,bh=72*s;line(c,[P(BX-bw/2,by),P(BX+bw/2,by),P(BX+bw*.53,by-bh),P(BX-bw*.53,by-bh)],{col:[236,232,222],width:2,close:true});}
 c.restore();}
 function rainbow(c,VW,hy,k){const cx=VW*.72,cy=hy+160,cols=[[230,80,80],[240,160,70],[240,220,90],[110,190,100],[90,140,220],[150,100,200]];c.save();c.lineWidth=9;for(let i=0;i<6;i++){c.strokeStyle=rgb(cols[i],.32*k);c.beginPath();c.arc(cx,cy,430-i*9,Math.PI*1.05,Math.PI*1.95);c.stroke();}c.restore();}
 function vaWeatherBirds(c,VW,f,s,p,t,d,wx,L){wx=wx||vgWeather(vgJourney(f.v).season,p);const col=d?.mode==='none'&&!d.white?[236,232,222]:L&&L.lights>.5?[30,30,50]:[50,40,40];
 if(wx.geese>0){const u=clamp((p-.3)/.1),x=VW*(1.1-u*1.3),y=180+Math.sin(u*3)*20;for(let i=0;i<9;i++){const r=i===0?0:Math.ceil(i/2),side=i%2?1:-1;bird(c,x+r*22,y+side*r*12,7,t*5+i*.7,col,1.6);}}
 if(wx.swallows>0)for(let i=0;i<5;i++){const u=t*.15+i*.21,x=VW*(.15+.7*((u*.6)%1)),y=300+Math.sin(u*5+i)*80;bird(c,x,y,6,t*9+i,col,1.4);}}
 function vaWeatherFront(c,VW,t,wx,L){
 if(wx.rain>0){c.save();c.strokeStyle=rgb(lighten(L.haze,.2),.4*wx.rain);c.lineWidth=1.2;c.beginPath();const r=rng(3);for(let i=0;i<140;i++){const x=(r()*VW*1.2+t*-120)%(VW*1.2),y=((r()*800+t*700)%860)-40;const xx=x<0?x+VW*1.2:x;c.moveTo(xx,y);c.lineTo(xx-5,y+18);}c.stroke();c.restore();}
 if(wx.snow>0){c.save();c.fillStyle=`rgba(255,255,255,${(.85*wx.snow).toFixed(3)})`;const r=rng(9);for(let i=0;i<150;i++){const sz=1.5+r()*2.5,x=((r()*VW+Math.sin(t*.6+i)*20-t*30*sz/3)%VW+VW)%VW,y=((r()*800+t*(18+sz*8))%820)-10;c.fillRect(x,y,sz,sz);}c.restore();}}
// Without a journey painted (the card, the settings): the sky of the morning and the balloon.
 function vaPreview(c,VW,d){if(d.mode==='none'){c.fillStyle=d.base;c.fillRect(0,0,VW,800);}else{const L=vgLight(1.2);sky(c,VW,L,560,0);}
 if(!VA.balloon&&typeof document!=='undefined'){VA.q=vaQ();VA.balloon=vaBalloon(VA.q);}const f={t:0,bob:0,pose:{mila:'point',bru:'peek'},burn:false};const L=vgLight(1.2);
 if(VA.balloon){vaBalloonGrade(VA.balloon,L,true);vaDrawBalloon(c,VW*.5,640,f,L,0,d);}}
 function vgReset(){VA.next=null;VA.ridersKey='';}


return {vgRender,vgLoadShare,vgReset,vgLayers};
})();
export const vgRender=VGA.vgRender,vgLoadShare=VGA.vgLoadShare,vgReset=VGA.vgReset,vgLayers=VGA.vgLayers;
