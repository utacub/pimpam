// El vent del bosc (CE26), 0.15: the drawing. Every place is painted with short, thick strokes of paint (impasto), each with a
// thread of light along its top and a shadow below, that follow the air: in the sky they drift and curl, on the ground they lie with
// the grass, on the crowns they turn round. What flies is opaque gouache with a brushed edge, so that it reads over the paint.
// Painting a place takes thousands of strokes (about 70 µs each in Chromium), so it is done a little at a time between frames, from
// left to right; the first time, the flat colours show under the strokes as they arrive, and when the wind changes the place, the
// new one is painted over the old following the wind. What moves is drawn on top: the crowns lean from their trunks, the grass in
// front bends in waves (bands of painted grass sheared column by column), light strokes of wind cross the sky, and the clouds run.
// The wind never changes the brightness of the scene (Harding et al., 2005): only the waiting scene darkens, as in 0.14.1.
import {Kclamp,KeaseInOut,Krand,Krgb,Kmix,Ksmooth,K_TAU} from './kaleido-base.js';
import {escCanvas,escDecor,escFrame,escScale,escVeil} from './escenari.js';
import {VENT_CALM,VENT_GRADES,ventScene,ventWind} from './vent.js';
import {gpuCopy} from './carrega.js';

// ── Paint ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const VtRng=seed=>{let a=(seed*2654435761)>>>0||1;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
const VtHash=(x,y,s)=>{let h=(x*374761393+y*668265263+s*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;};
function VtNoise(x,y,s=0){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),a=VtHash(xi,yi,s),b=VtHash(xi+1,yi,s),c=VtHash(xi,yi+1,s),d=VtHash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
const VtFbm=(x,y,s=0)=>(VtNoise(x,y,s)*.57+VtNoise(2*x,2*y,s+17)*.29+VtNoise(4*x,4*y,s+34)*.14);
const VtNow=()=>typeof performance!=='undefined'?performance.now()/1000:0;
// A painting in the making. spec: W×H reference units at k device pixels per unit; base(c) draws the flat picture in units; flow(x,y)
// gives the direction of the paint at a point; passes: [strokes per 100 000 square units, length, width], the large ones first; veil:
// the light wash over the flat picture (the primed canvas showing between the strokes); size(x,y): smaller strokes where there is
// detail (a town, a farmhouse); top(c): touches of opaque paint over the strokes (flowers). The strokes are painted in bands of x,
// from left to right, the large ones of a band before the small ones.
function VtJob(spec){return {spec,PW:Math.max(1,Math.round(spec.W*spec.k)),PH:Math.max(1,Math.round(spec.H*spec.k)),phase:0,i:0,n:0,list:null,base:null,paint:null,sweep:-1e9,done:false,readyAt:0};}
const VT_BAND=90;
function VtStep(j,budget){const t0=typeof performance!=='undefined'?performance.now():0,over=()=>typeof performance!=='undefined'&&performance.now()-t0>budget,{spec,PW,PH}=j,k=spec.k;
 if(j.phase===0){const base=escCanvas(PW,PH),bc=base?.getContext?.('2d',{willReadFrequently:true});if(!bc||!bc.setTransform||!bc.getImageData){j.phase=9;return true;}
  bc.setTransform(k,0,0,k,0,0);spec.base(bc);const src=bc.getImageData(0,0,PW,PH).data;
  if(spec.veil){bc.save();bc.setTransform(1,0,0,1,0,0);bc.globalCompositeOperation='source-atop';bc.fillStyle=`rgba(250,246,234,${spec.veil})`;bc.fillRect(0,0,PW,PH);bc.restore();}
  const r=VtRng(spec.seed),area=spec.W*spec.H/1e5,rows=[];
  spec.passes.forEach(([per,len,wd],pass)=>{const N=Math.round(per*area);for(let i=0;i<N;i++){const x=r()*spec.W,y=r()*spec.H,px=Math.min(PW-1,(x*k)|0),py=Math.min(PH-1,(y*k)|0),o=4*(py*PW+px);
   const sz=spec.size?spec.size(x,y):1,jit=(r()-.5)*34,sat=1+(r()-.5)*.24,L=len*(.7+r()*.6)*sz,Wd=wd*(.75+r()*.5)*Math.sqrt(sz),hi=.2+r()*.2,band=Math.floor((x+(r()-.5)*30)/VT_BAND);if(src[o+3]<128)continue;
   const R=Kclamp(src[o]*sat+jit,0,255),G=Kclamp(src[o+1]*sat+jit,0,255),B=Kclamp(src[o+2]*sat+jit*.6,0,255);rows.push([band*8+pass,x,y,L,Wd,R,G,B,hi]);}});
  rows.sort((a,b)=>a[0]-b[0]);j.list=rows;j.n=rows.length;j.base=base;
  const paint=escCanvas(PW,PH),pc=paint.getContext('2d',{willReadFrequently:true});pc.setTransform(k,0,0,k,0,0);pc.lineCap='round';pc.lineJoin='round';j.paint=paint;j.pc=pc;j.phase=1;if(over())return false;}
 if(j.phase===1){const pc=j.pc,list=j.list,pts=new Float32Array(14);
  while(j.i<j.n){const [band,x0,y0,L,Wd,R,G,B,hi]=list[j.i++];let x=x0,y=y0;pts[0]=x;pts[1]=y;
   for(let s=1;s<7;s++){const a=spec.flow(x,y);x+=Math.cos(a)*L/6;y+=Math.sin(a)*L/6;pts[2*s]=x;pts[2*s+1]=y;}
   const line=(dx,dy,col,lw)=>{pc.strokeStyle=col;pc.lineWidth=lw;pc.beginPath();pc.moveTo(pts[0]+dx,pts[1]+dy);for(let s=1;s<7;s++)pc.lineTo(pts[2*s]+dx,pts[2*s+1]+dy);pc.stroke();};
   line(Wd*.18,Wd*.22,'rgba(24,20,40,.17)',Wd);line(0,0,`rgb(${R|0},${G|0},${B|0})`,Wd);line(-Wd*.2,-Wd*.22,`rgba(255,253,240,${hi.toFixed(2)})`,Wd*.28);
   j.sweep=(Math.floor(band/8)+1)*VT_BAND;VT_PAINTED++;if((j.i&15)===0&&over())return false;}
  // Done: the touches of opaque paint go on top, the wash under the strokes, and the two become one picture.
  if(spec.top){pc.save();spec.top(pc);pc.restore();}
  pc.save();pc.setTransform(1,0,0,1,0,0);pc.globalCompositeOperation='destination-over';pc.drawImage(j.base,0,0);pc.restore();j.base.width=j.base.height=1;j.base=null;j.list=null;j.pc=null;
  if(typeof HTMLCanvasElement!=='undefined'&&j.paint instanceof HTMLCanvasElement){const soft=j.paint;j.paint=gpuCopy(soft);if(j.paint!==soft)soft.width=soft.height=1;}
  j.phase=2;j.done=true;j.readyAt=VtNow();j.sweep=1e9;VT_DONE++;}
 return true;}
// Shows a painting at (x, y), size W×H units, up to x reveal (a place being painted over another). Before it is ready: the wash where
// the strokes have reached (all of it if wash), and the strokes so far. Without canvases (tests), the flat picture is drawn directly.
// veil: the decor setting (escDecor), when the painting is the decor and is atenuat.
function VtShow(c,j,x,y,W,H,reveal=1e9,wash=true,veil=null){if(!j)return;
 if(j.phase===9||!j.paint&&!j.base){if(reveal<1e8)return;c.save();c.translate(x,y);c.save();j.spec.base(c);c.restore();if(j.spec.top)j.spec.top(c);c.restore();if(veil)escVeil(c,veil,x,y,W,H);return;}
 const lim=Math.min(reveal,wash&&!j.done?1e9:j.sweep);
 const clip=lim<W;if(clip){c.save();c.beginPath();c.rect(x,y,Math.max(0,lim),H);c.clip();}
 if(!j.done&&j.base)c.drawImage(j.base,x,y,W,H);if(j.paint)c.drawImage(j.paint,x,y,W,H);if(veil)escVeil(c,veil,x,y,W,H);if(clip)c.restore();}
// The queue: paintings are made between frames, ten milliseconds at a time, in the order asked.
const VT_JOBS=new Map(),VT_QUEUE=[];let VT_FRAME=0,VT_PUMPING=false,VT_DONE=0,VT_PAINTED=0;
function VtPump(){VT_PUMPING=false;const j=VT_QUEUE[0];if(!j){VtCards();return;}if(VtStep(j,10))VT_QUEUE.shift();VtSchedule();if(!VT_QUEUE.length)VtCards();}
function VtSchedule(){if(VT_PUMPING||!VT_QUEUE.length||typeof setTimeout==='undefined')return;VT_PUMPING=true;setTimeout(VtPump,0);}
// A painting by key, made once; small ones (sprites) at once, large ones in the queue.
function VtPainting(key,spec){let j=VT_JOBS.get(key);if(!j){j=VtJob(spec);VT_JOBS.set(key,j);if(j.PW*j.PH<=40000)VtStep(j,1e9);else{VT_QUEUE.push(j);VtSchedule();}}j.used=VT_FRAME;return j;}
function VtEvict(){if(VT_FRAME%120)return;for(const [key,j] of VT_JOBS)if(VT_FRAME-j.used>900){const i=VT_QUEUE.indexOf(j);if(i>=0)VT_QUEUE.splice(i,1);for(const cv of [j.base,j.paint])if(cv)cv.width=cv.height=1;VT_JOBS.delete(key);}}
// Whether some painting is still being made (the review tools wait for it), and what the still waiting picture depends on.
export const vtBusy=()=>VT_QUEUE.length>0;
export const vtStamp=()=>`${VT_DONE}|${VT_QUEUE.length?Math.floor(VT_PAINTED/300):0}`;
// The cards of the home page are drawn once: they are drawn again when their paintings are ready (as in Fem castells).
const VT_CARDS=new Map();
function VtCards(){if(VT_QUEUE.length||!VT_CARDS.size)return;const cards=[...VT_CARDS.values()];VT_CARDS.clear();
 for(const [c,w,h,o,m] of cards){c.save();c.setTransform(m);c.globalAlpha=1;c.globalCompositeOperation='source-over';drawVent(c,w,h,o);c.restore();}}

// ── Colours of the time of day ───────────────────────────────────────────────────────────────────────────────────────────
// Sky from the top to the horizon, the sun, and how warm the light is (the ground colours lean towards it).
const VT_LIGHT=Object.freeze([
 {top:'#3d7ed6',mid:'#87bdec',low:'#eef3e4',sun:'#fff0b0',sx:.17,sy:150,sr:44,warm:'#ffe7b0',w:.08},
 {top:'#2b68ca',mid:'#5ba2ea',low:'#c3e2f7',sun:'#ffe17a',sx:.83,sy:92,sr:48,warm:'#fff3c8',w:0},
 {top:'#4470c4',mid:'#9fb9e0',low:'#f6d79c',sun:'#ffc85a',sx:.8,sy:205,sr:52,warm:'#ffc76e',w:.2},
 {top:'#3e47a6',mid:'#d77a9e',low:'#f8a75c',sun:'#ff8a3d',sx:.68,sy:-1,sr:60,warm:'#ff9a5a',w:.3}]);
const VtT=(hex,S)=>{const L=VT_LIGHT[S.time];return L.w?Kmix(hex,L.warm,L.w):hex;};
function VtSkyBase(c,W,hz,S){const L=VT_LIGHT[S.time],g=c.createLinearGradient(0,0,0,hz+20);g.addColorStop(0,L.top);g.addColorStop(.55,L.mid);g.addColorStop(1,L.low);c.fillStyle=g;c.fillRect(0,0,W,hz+40);
 const sy=L.sy<0?hz-70:L.sy;c.fillStyle=L.sun;c.beginPath();c.arc(W*L.sx,sy,L.sr,0,K_TAU);c.fill();
 if(S.sky===2){const f=c.createLinearGradient(0,hz-160,0,hz+30);f.addColorStop(0,'rgba(240,240,236,0)');f.addColorStop(1,'rgba(240,240,236,.75)');c.fillStyle=f;c.fillRect(0,hz-160,W,190);}}
// A silhouette: a filled band from y(x) down to bottom.
function VtRidge(c,W,bottom,fill,y){c.fillStyle=fill;c.beginPath();c.moveTo(-10,bottom);for(let x=-10;x<=W+10;x+=12)c.lineTo(x,y(x));c.lineTo(W+10,bottom);c.closePath();c.fill();}
function VtBlob(c,x,y,rx,ry,fill,a=0){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,a,0,K_TAU);c.fill();}
function VtBall(c,x,y,r,col){const g=c.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);g.addColorStop(0,Kmix(col,'#ffffff',.35));g.addColorStop(.6,col);g.addColorStop(1,Kmix(col,'#1d1a2a',.3));c.fillStyle=g;c.beginPath();c.ellipse(x,y,r*1.1,r*.86,-.2,0,K_TAU);c.fill();}

// ── The places ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// Reference units: the screen is 720 high and W wide. Each place: the horizon, the flat picture of sky, distance and ground, the flow
// of the paint, the trees (sprites that lean), the bands of grass in front, the clouds and what flies.
// Flow of the paint in the sky (drifting to the right, with eddies), and on the ground (lying with the grass).
const VtSkyFlow=(x,y)=>-.08+Math.sin(x*.006+y*.012)*.42+(VtFbm(x*.004,y*.004,7)-.5)*2;
const VtGrassFlow=(x,y,hz)=>{const k=Kclamp((y-hz)/(720-hz));return -Math.PI/2+.7+.25*Math.sin(x*.02)*k+(VtFbm(x*.01,y*.01,3)-.5)*.6;};
const VtAlong=(x,y,s=0)=>s+(VtFbm(x*.006,y*.01,5)-.5)*.5;
const VT_PLACES=new Map();
function VtPlace(S,W){const id=`${S.v}|${Math.round(W)}`;if(VT_PLACES.has(id))return VT_PLACES.get(id);const r=VtRng(S.place*977+S.year*31+7),cx=W/2,P={hz:380,trees:[],fringe:[],clouds:[],special:null,flyCols:['#ffffff']};
 const T=h=>VtT(h,S);
 switch(S.id){
 case 'ametllers':{P.hz=360;
  P.land=c=>{VtSkyBase(c,W,P.hz,S);
   // The cliffs of the mountain, with their layers of rock; the terraces below, each with its dry-stone wall.
   VtRidge(c,W,P.hz+30,T('#9a8fc0'),x=>250+Math.sin(x*.004+1)*16+(x%240<30?-8:0)-(Math.abs(x-W*.35)<W*.18?24:0));
   for(let b=0;b<3;b++){c.fillStyle=T(['#8a7fb2','#a69cc8','#8379ad'][b]);c.fillRect(0,272+b*28,W,9);}
   const bands=[[P.hz-10,'#b9a66a'],[410,'#aab46a'],[455,'#c4a464'],[505,'#9fb066'],[560,'#c08a5a']];
   bands.forEach(([y,col],i)=>{VtRidge(c,W,720,T(col),x=>y+Math.sin(x*.005+i*1.7)*12);c.fillStyle=T('#d9ccb2');c.beginPath();c.moveTo(-10,y+14);for(let x=-10;x<=W+10;x+=12)c.lineTo(x,y+14+Math.sin(x*.005+i*1.7)*12);for(let x=W+10;x>=-10;x-=12)c.lineTo(x,y+6+Math.sin(x*.005+i*1.7)*12);c.fill();});
   for(let i=0;i<160;i++){const x=Krand(i,3)*W,y=430+Krand(i,4)*280;VtBlob(c,x,y,3,2,T(i%3?'#6f9a48':'#f4dbe6'));}};
  P.flow=(x,y)=>y<P.hz-110?VtSkyFlow(x,y):y<P.hz+40?VtAlong(x,y,-.02):VtAlong(x,y,.06+Math.sin(x*.005)*.1);P.size=(x,y)=>y>240&&y<P.hz+10?.7:1;
  for(const [fx,fy,R] of [[.12,470,78],[.36,430,62],[.62,520,88],[.84,445,66],[.5,400,46]])P.trees.push({kind:'almond',x:fx*W,y:fy,h:R*1.25,R,cols:['#f8d6e2','#fdf0f4','#f1b5cb','#fbe3ec'],trunk:'#4b3532'});
  P.fringe.push({y:745,h:120,kind:'grass',cols:['#7fae4f','#a3c45e','#5f8f40'],dots:['#fde8ef','#f6c3d4','#ffffff']});
  P.flyCols=['#fbe6ee','#f6c2d4','#ffffff','#f2a9c1'];break;}
 case 'dents':{P.hz=380;
  P.land=c=>{VtSkyBase(c,W,P.hz,S);VtRidge(c,W,P.hz+20,T('#8ea7da'),x=>300+Math.sin(x*.003+2)*34+Math.sin(x*.011)*8);
   VtRidge(c,W,720,T('#86c86a'),x=>P.hz-12+Math.sin(x*.004+.5)*22);VtRidge(c,W,720,T('#62b257'),x=>P.hz+40+Math.sin(x*.006+2.2)*20);
   const g=c.createLinearGradient(0,P.hz+90,0,720);g.addColorStop(0,T('#6fc45a'));g.addColorStop(1,T('#3e9947'));c.fillStyle=g;c.beginPath();c.moveTo(0,720);for(let x=0;x<=W;x+=12)c.lineTo(x,P.hz+90+Math.sin(x*.005)*14);c.lineTo(W,720);c.fill();
   for(let i=0;i<420;i++){const x=Krand(i,5)*W,y=P.hz+60+Math.pow(Krand(i,6),.8)*(720-P.hz-60),s=1+(y-P.hz)/200;VtBlob(c,x,y,3.2*s,2.6*s,i%4?'#f8d23a':'#f4f2ea');}};
  P.flow=(x,y)=>y<P.hz-90?VtSkyFlow(x,y):y<P.hz+60?VtAlong(x,y,-.03):VtGrassFlow(x,y,P.hz);P.size=(x,y)=>y>280&&y<P.hz+30?.7:1;
  for(const [fx,fy,R] of [[.2,P.hz+2,40],[.27,P.hz+12,30],[.78,P.hz-6,46]])P.trees.push({kind:'round',x:fx*W,y:fy,h:R*1.5,R,cols:['#3f9a4c','#58b25a','#2f8240'],trunk:'#5a3e30'});
  P.fringe.push({y:640,h:90,kind:'dandelion',cols:['#5cae4c','#7cc860','#3f9445'],dots:['#f8d23a','#ffffff']},{y:745,h:130,kind:'dandelion',cols:['#4aa245','#6cbf55','#2f8a3c'],dots:['#f8d23a','#ffffff']});
  P.flyCols=['#ffffff','#f6f3e6'];break;}
 case 'terrat':{P.hz=300;P.special='laundry';
  P.land=c=>{VtSkyBase(c,W,P.hz,S);
   // The sea far off; the town in two rows of houses, with green shutters and tiled roofs, and its bell tower; the low wall of the
   // terrace and its tiled floor. The windows are mid-tones, so that the rows of them do not make a grid of strong contrast.
   c.fillStyle=T('#3f8fd0');c.fillRect(0,P.hz-22,W,40);c.fillStyle=T('#8cc4ea');c.fillRect(0,P.hz-22,W,5);
   const house=(x,w,top,base,i,big)=>{c.fillStyle=T(['#f3e4c4','#ebc99a','#f7eedc','#e9b88e','#f0d6b0'][i%5]);c.fillRect(x,top,w,base-top);
    c.fillStyle=T(['#c9663f','#d9845a','#b8553a'][i%3]);c.beginPath();c.moveTo(x-6,top+2);c.lineTo(x+w*.5,top-(big?30:18));c.lineTo(x+w+6,top+2);c.fill();
    const ww=big?18:11,wh=big?26:15,n=Math.max(1,Math.floor(w/(big?46:30)));for(let f=0;f<(big?2:1);f++)for(let k=0;k<n;k++){const wx=x+(k+.5)*w/n-ww/2,wy=top+(big?20:12)+f*(wh+18);c.fillStyle=T('#8a7f96');c.fillRect(wx,wy,ww,wh);c.fillStyle=T('#6fa37e');c.fillRect(wx-ww*.45,wy,ww*.42,wh);c.fillRect(wx+ww*1.03,wy,ww*.42,wh);}};
   let x=-20,i=0;while(x<W+20){const w=60+Krand(i,8)*50;house(x,w,P.hz+30+Krand(i,9)*20,600,i,false);x+=w+2;i++;}
   x=-30;i=3;while(x<W+30){const w=110+Krand(i,18)*70;house(x,w,P.hz+110+Krand(i,19)*40,600,i,true);x+=w+3;i++;}
   const bx=W*.3;c.fillStyle=T('#ead2a4');c.fillRect(bx,P.hz-120,62,260);c.fillStyle=T('#c9663f');c.beginPath();c.moveTo(bx-8,P.hz-118);c.lineTo(bx+31,P.hz-176);c.lineTo(bx+70,P.hz-118);c.fill();c.fillStyle=T('#3a3550');c.beginPath();c.arc(bx+31,P.hz-82,13,Math.PI,0);c.rect(bx+18,P.hz-82,26,24);c.fill();
   c.fillStyle=T('#f3e8d2');c.fillRect(0,588,W,40);c.fillStyle=T('#fbf4e6');c.fillRect(0,582,W,10);
   const fl=c.createLinearGradient(0,628,0,720);fl.addColorStop(0,T('#e0956a'));fl.addColorStop(1,T('#c9714a'));c.fillStyle=fl;c.fillRect(0,628,W,92);
   c.strokeStyle=T('#b45f3e');c.lineWidth=2;for(let y=650;y<720;y+=28){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}for(let xx=-400;xx<W+400;xx+=70){c.beginPath();c.moveTo(cx+(xx-cx)*.7,628);c.lineTo(xx,720);c.stroke();}
   for(const px of [W*.05,W*.95]){c.fillStyle=T('#b4552f');c.beginPath();c.moveTo(px-30,610);c.lineTo(px+30,610);c.lineTo(px+22,668);c.lineTo(px-22,668);c.fill();VtBlob(c,px,592,40,28,T('#3f8a3a'));for(let k=0;k<7;k++)VtBlob(c,px-28+k*9.5,578+(k%2)*12,6,6,'#e03b3b');}};
  P.flow=(x,y)=>y<P.hz-40?VtSkyFlow(x,y):y<588?VtAlong(x,y,0):VtAlong(x,y,(x-cx)*.0008);P.size=(x,y)=>y>P.hz-180&&y<590?.38:1;
  P.lines=[{x0:W*.03,x1:W*.56,y:228,sag:40,items:5},{x0:W*.44,x1:W*.98,y:318,sag:34,items:5}];
  P.flyCols=['#e8434f','#2f7fe0','#f7c234','#ffffff','#28b07a','#f07a2a'];break;}
 case 'blat':{P.hz=372;
  P.land=c=>{VtSkyBase(c,W,P.hz,S);VtRidge(c,W,P.hz+20,T('#9aa6d4'),x=>318+Math.sin(x*.0035+.7)*24);
   VtRidge(c,W,720,T('#b8b45e'),x=>P.hz-14+Math.sin(x*.005+1)*16);
   // The farmhouse on the hill, with its cypresses.
   const mx=W*.66;c.fillStyle=T('#efdcb4');c.fillRect(mx,P.hz-70,130,62);c.fillRect(mx+96,P.hz-96,40,40);c.fillStyle=T('#c66a45');c.beginPath();c.moveTo(mx-10,P.hz-68);c.lineTo(mx+65,P.hz-100);c.lineTo(mx+140,P.hz-68);c.fill();c.beginPath();c.moveTo(mx+92,P.hz-94);c.lineTo(mx+116,P.hz-112);c.lineTo(mx+140,P.hz-94);c.fill();
   c.fillStyle=T('#4a3c50');for(const [wx,wy] of [[18,-52],[52,-52],[18,-30],[76,-30]])c.fillRect(mx+wx,P.hz+wy,12,16);c.beginPath();c.arc(mx+60,P.hz-22,10,Math.PI,0);c.rect(mx+50,P.hz-22,20,14);c.fill();
   const g=c.createLinearGradient(0,P.hz,0,720);g.addColorStop(0,T('#ecc85e'));g.addColorStop(1,T('#d9a23e'));c.fillStyle=g;c.beginPath();c.moveTo(0,720);for(let x=0;x<=W;x+=12)c.lineTo(x,P.hz+6+Math.sin(x*.006)*8);c.lineTo(W,720);c.fill();
   for(let i=0;i<300;i++){const x=Krand(i,11)*W,y=P.hz+30+Math.pow(Krand(i,12),.7)*(720-P.hz-30),s=1+(y-P.hz)/180;VtBlob(c,x,y,3.4*s,3*s,i%5?'#e2412f':'#b8262a');}};
  P.flow=(x,y)=>y<P.hz-60?VtSkyFlow(x,y):y<P.hz+20?VtAlong(x,y,-.02):VtGrassFlow(x,y,P.hz)-.25;P.size=(x,y)=>Math.abs(x-W*.66-65)<100&&y>P.hz-125&&y<P.hz?.38:y>290&&y<P.hz+20?.75:1;
  for(const [fx,fy,hh] of [[.62,P.hz-14,104],[.79,P.hz-14,92],[.825,P.hz-12,76]])P.trees.push({kind:'cypress',x:fx*W,y:fy,h:hh,R:hh*.22,cols:['#2f5a3a','#3d6e45','#264a30'],trunk:'#4a3a2e'});
  P.trees.push({kind:'round',x:W*.16,y:P.hz+8,h:70,R:52,cols:['#5b7d3c','#6f9448','#4a6a32'],trunk:'#5a4434'});
  P.fringe.push({y:640,h:120,kind:'wheat',cols:['#e9c45a','#f4d77a','#d4a73c'],dots:['#e2412f']},{y:748,h:165,kind:'wheat',cols:['#e2b84c','#f2d070','#c99a34'],dots:['#e2412f','#c8202a']});
  P.flyCols=['#e2412f','#f05a3c','#c8202a'];break;}
 case 'platja':{P.hz=330;P.special=S.year%2?'gulls':'kites';
  P.land=c=>{VtSkyBase(c,W,P.hz,S);
   // The headland with its lighthouse, the sea in bands, the foam of the waves and the sand.
   VtRidge(c,W,P.hz+10,T('#7d8fc4'),x=>x>W*.72?P.hz-40-Math.min(1,(x-W*.72)/(W*.1))*40+Math.sin(x*.02)*4:P.hz+20);
   c.fillStyle=T('#f7f3ea');c.fillRect(W*.88,P.hz-118,14,40);c.fillStyle=T('#d84a3a');c.fillRect(W*.88,P.hz-100,14,8);
   const s=c.createLinearGradient(0,P.hz,0,560);s.addColorStop(0,T('#2c74c2'));s.addColorStop(1,T('#4fb0d6'));c.fillStyle=s;c.fillRect(0,P.hz,W,240);
   for(let b=0;b<4;b++){c.fillStyle='rgba(255,255,255,.85)';c.beginPath();const y0=430+b*34;for(let x=-10;x<=W+10;x+=10)c.lineTo(x,y0+Math.sin(x*.02+b*2)*4);for(let x=W+10;x>=-10;x-=10)c.lineTo(x,y0+5+Math.sin(x*.02+b*2)*4);c.fill();}
   const sa=c.createLinearGradient(0,540,0,720);sa.addColorStop(0,T('#f1dca8'));sa.addColorStop(1,T('#e3c385'));c.fillStyle=sa;c.beginPath();c.moveTo(0,720);for(let x=0;x<=W;x+=12)c.lineTo(x,548+Math.sin(x*.004+1)*14);c.lineTo(W,720);c.fill();};
  P.flow=(x,y)=>y<P.hz-10?VtSkyFlow(x,y):y<550?VtAlong(x,y,0):VtAlong(x,y,.08+Math.sin(x*.004)*.15);P.size=(x,y)=>x>W*.85&&y>P.hz-130&&y<P.hz?.4:y>P.hz-10&&y<560?.75:1;
  for(const [fx,fy,hh] of [[.06,580,260],[.2,610,200]])P.trees.push({kind:'pine',x:fx*W,y:fy,h:hh,R:hh*.3,cols:['#2f6a3c','#3f7f46','#25553a'],trunk:'#7a4a32'});
  P.fringe.push({y:748,h:120,kind:'dune',cols:['#b9c47a','#d4d898','#97a85e'],dots:[]});
  P.kites=[{x:.42,y:150,col:'#e8434f',col2:'#f7c234'},{x:.6,y:100,col:'#2f7fe0',col2:'#ffffff'},{x:.78,y:190,col:'#28b07a',col2:'#f07a2a'}];
  P.flyCols=['#ffffff','#f4f0e2','#e8f4f8'];break;}
 case 'vinya':{P.hz=350;
  P.land=c=>{VtSkyBase(c,W,P.hz,S);VtRidge(c,W,P.hz+20,T('#9a8cc4'),x=>290+Math.sin(x*.004+3)*30);VtRidge(c,W,P.hz+40,T('#c9a674'),x=>P.hz-30+Math.sin(x*.006+1)*14);
   // The village on the hill: white houses and a church.
   const vx=W*.3;for(let i=0;i<9;i++){const x=vx+i*26,y=P.hz-46+Math.abs(i-4)*4;c.fillStyle=T(i%3?'#f6efe0':'#efe0c4');c.fillRect(x,y,24,22);c.fillStyle=T('#c66a45');c.fillRect(x-1,y-5,26,6);}
   c.fillStyle=T('#efe0c4');c.fillRect(vx+96,P.hz-92,22,50);c.fillStyle=T('#c66a45');c.beginPath();c.moveTo(vx+92,P.hz-90);c.lineTo(vx+107,P.hz-112);c.lineTo(vx+122,P.hz-90);c.fill();
   c.fillStyle=T('#b87646');c.fillRect(0,P.hz-6,W,720);
   // The rows of vines, converging on the horizon. Their colours change in hue but hardly in lightness, and their widths vary, so that
   // the rows do not make a pattern of light and dark stripes (Harding et al., 2005).
   const vp=W*.55,cols=['#c99a2c','#da762d','#bb8636','#d4684a','#d17b22'];for(let i=-14;i<=14;i++){const xb=vp+i*150,xt=vp+i*12,hw=36+Krand(i+40,77)*22;c.fillStyle=T(cols[(i+20)%5]);c.beginPath();c.moveTo(xt-3,P.hz-4);c.lineTo(xt+3,P.hz-4);c.lineTo(xb+hw,724);c.lineTo(xb-hw,724);c.fill();}};
  P.flow=(x,y)=>{if(y<P.hz-50)return VtSkyFlow(x,y);if(y<P.hz)return VtAlong(x,y,0);const vp=W*.55;return Math.atan2(y-P.hz+40,(x-vp)*.9)+(VtFbm(x*.02,y*.02,9)-.5)*.6;};
  P.size=(x,y)=>Math.abs(x-W*.3-120)<170&&y>P.hz-120&&y<P.hz?.4:y>P.hz?.45+.55*Kclamp((y-P.hz)/(720-P.hz)):1;
  P.trees.push({kind:'olive',x:W*.88,y:520,h:120,R:86,cols:['#8fa07a','#a9b892','#6f8460','#c2cdb0'],trunk:'#6a5a4a'});
  P.fringe.push({y:748,h:130,kind:'vine',cols:['#e9b93a','#d8642f','#c94a2f','#8a9a3a'],dots:['#5b2a6a','#6e3a7e']});
  P.flyCols=['#e9b93a','#d8642f','#c94a2f','#f0c040'];break;}
 case 'fageda':{P.hz=470;
  P.land=c=>{VtSkyBase(c,W,P.hz,S);
   // Far trunks in the light, the canopy across the top, the floor of leaves and the brook.
   for(let i=0;i<26;i++){const x=Krand(i,21)*W,w=6+Krand(i,22)*8;c.fillStyle=T(Kmix('#b9b0c8','#ffffff',.2));c.fillRect(x,120,w,P.hz-110);}
   const canopy=['#e8a03a','#d8642f','#f0c050','#c9502f','#e48a3a'];for(let i=0;i<70;i++){const x=Krand(i,23)*W,y=40+Krand(i,24)*150,R=50+Krand(i,25)*60;VtBlob(c,x,y,R,R*.7,T(canopy[i%5]));}
   for(let i=0;i<9;i++){const x=(i+.3+Krand(i,26)*.4)*W/9,w=16+Krand(i,27)*16;c.fillStyle=T(i%2?'#9a96a8':'#8a8698');c.fillRect(x,60,w,P.hz-40);}
   // The big grey trunks of the beeches in front, with their light side.
   for(const [fx,w] of [[.22,46],[.55,38],[.82,52]]){const x=fx*W;c.fillStyle=T('#9d99ac');c.beginPath();c.moveTo(x-w/2,0);c.lineTo(x+w/2,0);c.lineTo(x+w*.6,730);c.lineTo(x-w*.6,730);c.fill();c.fillStyle=T('#c9c5d4');c.fillRect(x-w*.42,0,w*.22,730);c.fillStyle=T('#7d7a8e');c.fillRect(x+w*.22,0,w*.26,730);}
   const g=c.createLinearGradient(0,P.hz,0,720);g.addColorStop(0,T('#c98a4a'));g.addColorStop(1,T('#a4552e'));c.fillStyle=g;c.fillRect(0,P.hz,W,260);
   c.strokeStyle=T('#6fb0d8');c.lineWidth=26;c.lineCap='round';c.beginPath();c.moveTo(-20,560);c.bezierCurveTo(W*.3,500,W*.5,640,W*.75,560);c.quadraticCurveTo(W*.9,520,W+20,540);c.stroke();c.lineWidth=8;c.strokeStyle='#d8eef8';c.stroke();};
  P.flow=(x,y)=>{if([.22,.55,.82].some(f=>Math.abs(x-f*W)<34))return Math.PI/2+(VtFbm(x*.02,y*.01,6)-.5)*.2;if(y<210)return VtAlong(x,y,.1)+Math.sin(x*.02+y*.03)*.8;if(y<P.hz)return Math.PI/2+(VtFbm(x*.02,y*.01,4)-.5)*.3;return VtAlong(x,y,.05+Math.sin(x*.004)*.15);};P.size=(x,y)=>y>110&&y<P.hz?.7:1;
  for(const [fx,R] of [[.08,120],[.38,100],[.66,130],[.93,110]])P.trees.push({kind:'canopy',x:fx*W,y:0,h:0,R,cols:['#e8a03a','#d8642f','#f0c050','#c9502f'],trunk:null});
  P.fringe.push({y:748,h:110,kind:'fern',cols:['#b8682e','#d88a3a','#8a7a3a'],dots:[]});
  P.flyCols=['#e8a03a','#d8642f','#f0c050','#c9502f'];break;}
 default:{P.hz=400;// neu
  P.land=c=>{VtSkyBase(c,W,P.hz,S);
   VtRidge(c,W,P.hz+20,T('#b9c6e6'),x=>230+Math.abs(((x+60)%260)-130)*.9+Math.sin(x*.01)*10);
   VtRidge(c,W,P.hz+20,'#f4f7fc',x=>Math.max(230+Math.abs(((x+60)%260)-130)*.9+Math.sin(x*.01)*10,255+Math.abs(((x+60)%260)-130)*.3));
   for(let i=0;i<40;i++){const x=Krand(i,31)*W,y=P.hz-4+Krand(i,32)*14,h=24+Krand(i,33)*20;c.fillStyle=T('#3b5a54');c.beginPath();c.moveTo(x,y-h);c.lineTo(x+h*.32,y);c.lineTo(x-h*.32,y);c.fill();c.fillStyle='#eef4fb';c.beginPath();c.moveTo(x,y-h);c.lineTo(x+h*.14,y-h*.55);c.lineTo(x-h*.14,y-h*.55);c.fill();}
   const g=c.createLinearGradient(0,P.hz,0,720);g.addColorStop(0,'#f4f8fd');g.addColorStop(1,'#dfe8f6');c.fillStyle=g;c.fillRect(0,P.hz,W,330);
   c.fillStyle='rgba(150,175,220,.45)';for(let i=0;i<8;i++){c.beginPath();c.ellipse(Krand(i,34)*W,P.hz+60+Krand(i,35)*240,120+Krand(i,36)*120,10+Krand(i,37)*8,0,0,K_TAU);c.fill();}};
  P.flow=(x,y)=>y<P.hz-130?VtSkyFlow(x,y):y<P.hz?VtAlong(x,y,-.1+Math.sin(x*.03)*.5):VtAlong(x,y,.04);P.size=(x,y)=>y>P.hz-60&&y<P.hz+16?.45:1;
  for(const [fx,fy,hh] of [[.08,560,250],[.24,500,190],[.7,520,210],[.86,600,280],[.5,450,120]])P.trees.push({kind:'fir',x:fx*W,y:fy,h:hh,R:hh*.34,cols:['#2f5a4e','#3c6c5c','#24483f'],trunk:'#5a4434'});
  P.fringe.push({y:748,h:90,kind:'snowgrass',cols:['#9fb0a0','#7f9a88','#c8d6ec'],dots:['#ffffff']});
  P.flyCols=['#ffffff','#f4f8ff','#e2ecfa'];}
 }
 // Clouds: a few on a clear day, more under clouds; mist adds long low bands.
 const nC=S.sky===1?6:S.sky===2?2:3;for(let i=0;i<nC;i++)P.clouds.push({x:Krand(i,S.v*3+1)*W,y:50+Krand(i,S.v*3+2)*(P.hz-220),s:.55+Krand(i,S.v*3+3)*.6,i});
 if(S.sky===2)for(let i=0;i<3;i++)P.clouds.push({x:Krand(i,S.v+40)*W,y:P.hz-40-i*26,s:1.3,i:10+i,mist:true});
 P.trees.sort((a,b)=>a.y-b.y);
 VT_PLACES.set(id,P);if(VT_PLACES.size>24)VT_PLACES.delete(VT_PLACES.keys().next().value);return P;}

// ── Sprites: crowns, clouds and bands of grass ───────────────────────────────────────────────────────────────────────────
// The box of a tree's crown sprite, around its anchor (the top of the trunk; for the canopy, a point on the top edge).
function VtCrownBox(t){if(t.kind==='cypress')return [-t.R*1.3,-t.h*1.02,t.R*2.6,t.h*1.08];if(t.kind==='pine')return [-t.R*1.6,-t.R*.9,t.R*3.2,t.R*1.25];if(t.kind==='fir')return [-t.R*1.25,-t.h*1.04,t.R*2.5,t.h*1.08];
 if(t.kind==='canopy')return [-t.R*1.6,-10,t.R*3.2,t.R*1.5];return [-t.R*1.5,-t.R*1.45,t.R*3,t.R*2.2];}
function VtCrownBase(c,t,seed){const r=VtRng(seed),[bx,by,bw,bh]=VtCrownBox(t);c.translate(-bx,-by);const cols=t.cols;
 if(t.kind==='cypress'){c.fillStyle=cols[0];c.beginPath();c.moveTo(0,-t.h);c.bezierCurveTo(t.R*1.2,-t.h*.6,t.R*1.1,-t.h*.15,t.R*.4,0);c.lineTo(-t.R*.4,0);c.bezierCurveTo(-t.R*1.1,-t.h*.15,-t.R*1.2,-t.h*.6,0,-t.h);c.fill();
  for(let i=0;i<10;i++)VtBall(c,(r()-.5)*t.R*1.1,-t.h*(.15+r()*.7),t.R*.35,cols[i%3]);return;}
 if(t.kind==='fir'){
  // Six drooping tiers, from the bottom; snow lies in patches on their upper side.
  for(let k=0;k<6;k++){const top=-t.h*(1-k*.14),bot=top+t.h*(.24+k*.012),w=t.R*(.32+k*.15);c.fillStyle=cols[k%3];c.beginPath();c.moveTo(0,top);c.quadraticCurveTo(w*.35,top+(bot-top)*.5,w,bot);
   for(let q=1;q<=6;q++){const x=w-q*2*w/6;c.quadraticCurveTo(x+w/6,bot-(bot-top)*.12,x,bot+(q%2?-3:2));}c.quadraticCurveTo(-w*.35,top+(bot-top)*.5,0,top);c.fill();
   for(let n=0;n<3+k;n++){const sx=(r()-.5)*w*1.3,sy=top+(bot-top)*(.35+r()*.45)+Math.abs(sx)*.25;VtBlob(c,sx,sy,w*(.14+r()*.12),t.h*.018+r()*3,'#f6f9fe',(sx/w)*.4);}}
  c.fillStyle='#f6f9fe';c.beginPath();c.ellipse(0,-t.h*.97,t.R*.12,t.h*.03,0,0,K_TAU);c.fill();return;}
 if(t.kind==='pine'){for(let i=0;i<9;i++)VtBall(c,(i/8-.5)*t.R*2.4+(r()-.5)*20,-t.R*.25+(r()-.5)*t.R*.3-Math.sin(i/8*Math.PI)*t.R*.3,t.R*(.32+r()*.12),cols[i%3]);return;}
 if(t.kind==='canopy'){for(let i=0;i<12;i++)VtBall(c,(r()-.5)*t.R*2.6,t.R*(.15+r()*.75),t.R*(.28+r()*.2),cols[i%4]);return;}
 if(t.kind==='almond'){
  // Airy blossom in clusters, with the dark branches showing only at the edges and below.
  c.strokeStyle=t.trunk;c.lineCap='round';for(let i=0;i<6;i++){const a=-Math.PI/2+(i/5-.5)*2.4;c.lineWidth=3+r()*2;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a)*t.R*.45,-t.R*.15+Math.sin(a)*t.R*.25,Math.cos(a)*t.R*1.15,-t.R*.35+Math.sin(a)*t.R*.75);c.stroke();}
  for(let i=0;i<22;i++){const a=r()*K_TAU,d=t.R*Math.sqrt(r())*.85;VtBall(c,Math.cos(a)*d*1.2,-t.R*.5+Math.sin(a)*d*.72,t.R*(.17+r()*.12),cols[i%4]);}
  for(let i=0;i<8;i++){const a=(i/8)*K_TAU;VtBall(c,Math.cos(a)*t.R*.3,-t.R*.5+Math.sin(a)*t.R*.22,t.R*.24,cols[(i+1)%4]);}return;}
 for(let i=0;i<8;i++){const a=r()*K_TAU,d=t.R*(.2+r()*.45);VtBall(c,Math.cos(a)*d*1.2,-t.R*.55+Math.sin(a)*d*.8,t.R*(.42+r()*.2),cols[i%3]);}}
function VtCrownFlow(t,bx,by){return (x,y)=>{const X=x+bx,Y=y+by;if(t.kind==='cypress'||t.kind==='fir')return -Math.PI/2+.35*Math.sin(Y*.08)+(t.kind==='fir'?Math.sign(X)*.9:0);
 const cy=t.kind==='canopy'?t.R*.5:-t.R*.55,a=Math.atan2(Y-cy,X)+Math.PI/2,vx=Math.cos(a)*.55+Math.cos(-.15)*.6,vy=Math.sin(a)*.55+Math.sin(-.15)*.6;return Math.atan2(vy,vx)+(VtNoise(X*.05,Y*.05,3)-.5)*.8;};}
function VtCrown(t,S,k,i){const box=VtCrownBox(t);if(!box)return null;const [bx,by,bw,bh]=box;
 return VtPainting(`vt-crown-${S.v}-${i}-${k.toFixed(2)}`,{W:bw,H:bh,k,seed:S.v*13+i,base:c=>{c.save();VtCrownBase(c,t,S.v*7+i);c.restore();},flow:VtCrownFlow(t,bx,by),passes:[[4000,16,8],[6000,10,5]],veil:0});}
function VtCloud(cl,S,k){const w=240*cl.s,h=(cl.mist?40:96)*cl.s;
 return VtPainting(`vt-cloud-${S.time}-${cl.i}-${cl.s.toFixed(2)}-${cl.mist?1:0}-${k.toFixed(2)}`,{W:w,H:h,k,seed:cl.i*5+S.time,veil:0,passes:[[3200,18,8],[4200,11,5]],flow:(x,y)=>-.05+Math.sin(x*.03+y*.05)*.5,
  base:c=>{const col=S.time===3?'#f9dccf':S.time===2?'#fbf0dc':'#f8f8f4';if(cl.mist){const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(240,240,236,0)');g.addColorStop(.2,'#efefea');g.addColorStop(.8,'#efefea');g.addColorStop(1,'rgba(240,240,236,0)');c.fillStyle=g;c.beginPath();c.ellipse(w/2,h/2,w/2,h*.4,0,0,K_TAU);c.fill();return;}
   c.fillStyle=col;c.beginPath();c.ellipse(w*.5,h*.66,w*.46,h*.3,0,0,K_TAU);c.ellipse(w*.34,h*.48,w*.18,h*.28,0,0,K_TAU);c.ellipse(w*.58,h*.4,w*.22,h*.34,0,0,K_TAU);c.ellipse(w*.76,h*.54,w*.14,h*.22,0,0,K_TAU);c.fill();
   c.fillStyle=Kmix(col,'#9aa6c8',.25);c.beginPath();c.ellipse(w*.5,h*.82,w*.4,h*.1,0,0,K_TAU);c.fill();}});}
// A band of grass in front: blades painted upwards; the flowers of the place go on top in opaque paint. Dune grass and snowy shrubs
// grow in clumps.
function VtBand(f,S,W,k,i){const H=f.h+40;return VtPainting(`vt-band-${S.v}-${i}-${Math.round(W)}-${k.toFixed(2)}`,{W,H,k,seed:S.v*17+i,veil:0,passes:[[1600,26,7],[2400,16,4.5]],
  flow:(x,y)=>-Math.PI/2+.32+(VtFbm(x*.02,y*.02,i)-.5)*.5,
  base:c=>{const r=VtRng(S.v*29+i),cols=f.cols,clumps=f.kind==='dune'||f.kind==='snowgrass';for(let x=-10;x<W+10;x+=f.kind==='wheat'?7:9){const g=clumps?Kclamp((VtNoise(x*.012,i,9)-.42)*4):1;if(clumps&&g<.05){r();r();r();continue;}
    const h=f.h*(.55+r()*.5)*(clumps?.5+.5*g:1),col=cols[Math.floor(r()*cols.length)];c.fillStyle=VtT(col,S);c.beginPath();c.moveTo(x-5,H);c.lineTo(x+r()*10-2,H-h);c.lineTo(x+6,H);c.fill();
    if(f.kind==='wheat'&&r()<.7){c.fillStyle=VtT(Kmix(col,'#fff0b0',.3),S);c.beginPath();c.ellipse(x+3,H-h+6,3.5,11,.15,0,K_TAU);c.fill();}
    if(f.kind==='vine'&&r()<.5)VtBlob(c,x,H-h*.6,11,9,VtT(col,S));
    if(f.kind==='fern'&&r()<.4)VtBlob(c,x,H-h*.5,14,6,VtT(col,S),-.6);}},
  top:c=>{if(!f.dots.length)return;const r=VtRng(S.v*31+i);
   for(let n=0;n<W/(f.kind==='grass'?14:22);n++){const x=r()*W,y=H-f.h*(.35+r()*.55),col=f.dots[Math.floor(r()*f.dots.length)];
    if(f.kind==='dandelion'&&col==='#ffffff'){c.strokeStyle='#4f8f40';c.lineWidth=2;c.beginPath();c.moveTo(x,H);c.quadraticCurveTo(x+6,(H+y)/2,x+3,y);c.stroke();
     const g=c.createRadialGradient(x+3,y,1,x+3,y,11);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.7,'rgba(250,250,244,.85)');g.addColorStop(1,'rgba(250,250,244,0)');c.fillStyle=g;c.beginPath();c.arc(x+3,y,11,0,K_TAU);c.fill();}
    else if(f.kind==='dandelion'){for(let p=0;p<8;p++){const a=p*K_TAU/8;VtBlob(c,x+Math.cos(a)*4,y+Math.sin(a)*3,3.2,1.8,'#f6c92a',a);}VtBlob(c,x,y,3,2.6,'#f9dc5a');}
    else if(f.kind==='wheat'){for(let p=0;p<4;p++){const a=p*K_TAU/4+.4;VtBlob(c,x+Math.cos(a)*4,y+Math.sin(a)*3.4,5,4,col,a);}VtBlob(c,x,y,2,2,'#2a1a2a');}
    else if(f.kind==='vine'){if(n%3)continue;for(let p=0;p<10;p++){const row=p<4?0:p<7?1:p<9?2:3,cnt=[4,3,2,1][row];VtBlob(c,x+((p<4?p:p<7?p-4:p<9?p-7:0)-(cnt-1)/2)*7,y+row*6.5,4,4,col);}}
    else if(f.kind==='snowgrass'){if(VtNoise(x*.012,i,9)>.42)VtBlob(c,x,y+f.h*.25,12,6,'#ffffff');}
    else VtBlob(c,x,y,2.4,1.8,col,r()*3);}}});}
// ── Wind in the picture ──────────────────────────────────────────────────────────────────────────────────────────────────
// How far the wind has carried things since the press (units), by adding up its strength; kept per press and extended frame by frame.
const VT_TRAVEL={key:'',dt:1/30,d:[0]};
function VtTravel(key,t,wind){if(VT_TRAVEL.key!==key){VT_TRAVEL.key=key;VT_TRAVEL.d=[0];}const d=VT_TRAVEL.d,dt=VT_TRAVEL.dt,n=Math.min(Math.ceil(Math.max(0,t)/dt),36000);
 while(d.length<=n){const i=d.length;d.push(d[i-1]+wind((i-.5)*dt)*dt);}const f=Math.max(0,t)/dt,i=Math.min(n,Math.floor(f));return d[i]+(d[Math.min(n,i+1)]-d[i])*(f-i);}
// The direction of the wind at a point, by its character (radians; 0 blows to the right).
function VtWindDir(ch,x,y,t){if(ch==='ondulant')return Math.sin(x*.008-t*1.6)*.38;if(ch==='remoli')return Math.sin(x*.004+y*.01-t*.6)*.5;if(ch==='cops')return -.05+Math.sin(x*.003)*.12;return -.04+Math.sin(x*.002+y*.004)*.08;}
// Light strokes of wind crossing the sky (and the land, when it blows hard).
function VtRibbons(c,W,P,w,travel,t,ch,reduced,low){const n=Math.round(Kclamp((w.level-.08)/.92)*(reduced?12:26));if(!n)return;c.save();c.lineCap='round';c.lineJoin='round';
 for(let i=0;i<n;i++){const f=.7+Krand(i,41)*.7,span=W+700,u=((travel*1.25*f+Krand(i,42)*span)%span+span)%span-400,y0=low?P.hz+30+Krand(i,43)*(680-P.hz):30+Krand(i,43)*(P.hz-60),len=(140+Krand(i,44)*240)*(.6+.5*w.level),wd=3+Krand(i,45)*4;
  const fade=Kclamp(1-(i+1-n*Kclamp((w.level-.08)/.92+.15))/2)*(low?.55:.85);if(fade<=0)continue;let x=u,y=y0;c.beginPath();c.moveTo(x,y);
  for(let s=0;s<16;s++){const a=VtWindDir(ch,x,y,t)+(ch==='remoli'&&i%3===0&&!low?s*.2:0);x+=Math.cos(a)*len/16;y+=Math.sin(a)*len/16;c.lineTo(x,y);}
  c.globalAlpha=fade*.45;c.strokeStyle=low?'#f6f1dc':'#eaf3ff';c.lineWidth=wd*1.8;c.stroke();c.globalAlpha=fade*.8;c.strokeStyle='#fffdf2';c.lineWidth=wd*.6;c.stroke();}
 c.restore();}
// Whirls of light paint in the sky at the strong wind; at most one turn every four seconds.
function VtSwirls(c,W,P,w,t,reduced){const a=Kclamp((w.level-.62)/.3)*(reduced?.5:1);if(a<=0)return;c.save();c.lineCap='round';
 for(let i=0;i<3;i++){const cx=W*(.18+.3*i)+Math.sin(t*.2+i)*40,cy=70+(i%2)*90+Krand(i,51)*40,rot=t*K_TAU/4*(i%2?1:-1)*.8,R=60+Krand(i,52)*40;c.beginPath();
  for(let s=0;s<=40;s++){const q=s/40,ang=rot+q*K_TAU*1.6,rr=R*(1-q*.8);const x=cx+Math.cos(ang)*rr*1.3,y=cy+Math.sin(ang)*rr*.7;s?c.lineTo(x,y):c.moveTo(x,y);}
  c.globalAlpha=a*.35;c.strokeStyle='#f2f7ff';c.lineWidth=9;c.stroke();c.globalAlpha=a*.7;c.strokeStyle='#ffffff';c.lineWidth=3;c.stroke();}
 c.restore();}
// The lean of a tree: with the wind, a flutter, the ambient sway, and a small oscillation when the wind lets go.
function VtLean(t,i,w,idle,release,relLevel,reduced){const m=reduced?.5:1;let a=w.level*(.16+.04*Math.sin(t*1.1+i))*m+.012*Math.sin(idle*.7+i*1.9)+.02*w.level*Math.sin(t*6.5+i*2.3)*m;
 if(release!==null&&release!==undefined&&t>release){const s=t-release;a+=relLevel*.07*Math.exp(-s*2.2)*Math.sin(s*5.5)*m;}return a;}
// A trunk: a thick stroke of paint from the ground to the crown, with its shadow and light.
function VtTrunk(c,x0,y0,x1,y1,wd,col){const mx=(x0+x1)/2+(x1-x0)*.25,my=(y0+y1)/2;c.lineCap='round';
 for(const [dx,dy,cc,lw] of [[wd*.18,wd*.12,'rgba(24,20,40,.25)',wd],[0,0,col,wd],[-wd*.22,-wd*.1,'rgba(255,250,235,.28)',wd*.3]]){c.strokeStyle=cc;c.lineWidth=lw;c.beginPath();c.moveTo(x0+dx,y0+dy);c.quadraticCurveTo(mx+dx,my+dy,x1+dx,y1+dy);c.stroke();}}
// How much each kind of tree gives to the wind.
const VT_STIFF=Object.freeze({pine:.5,olive:.55,round:.85,almond:.75,cypress:1,fir:1,canopy:1});
function VtTrees(c,P,S,k,t,w,idle,release,relLevel,reduced){P.trees.forEach((tr,i)=>{const a=VtLean(t,i,w,idle,release,relLevel,reduced)*(VT_STIFF[tr.kind]??1);
 const sp=VtCrown(tr,S,k,i),box=VtCrownBox(tr);
 if(tr.kind==='canopy'){c.save();c.translate(tr.x,tr.y);c.rotate(a*.35);c.translate(a*60,0);VtShow(c,sp,box[0],box[1],box[2],box[3]);c.restore();return;}
 if(tr.kind==='fir'||tr.kind==='cypress'){const sh=a*(tr.kind==='fir'?.55:.8);c.save();c.transform(1,0,-sh,1,sh*tr.y,0);if(tr.kind==='cypress')VtTrunk(c,tr.x,tr.y+8,tr.x,tr.y-10,tr.R*.4,tr.trunk);VtShow(c,sp,tr.x+box[0],tr.y+box[1],box[2],box[3]);c.restore();return;}
 const tx=tr.x+Math.sin(a)*tr.h*.6,ty=tr.y-tr.h*Math.cos(a*.6);VtTrunk(c,tr.x,tr.y,tx,ty,Math.max(6,tr.R*(tr.kind==='pine'?.13:.17)),tr.trunk);
 c.save();c.translate(tx,ty);c.rotate(a*.8);VtShow(c,sp,box[0],box[1],box[2],box[3]);c.restore();});}
// The bands of grass, column by column: each column leans from its foot, more where a wave of wind passes.
function VtFringe(c,P,S,W,k,w,travel,t,idle,reduced){P.fringe.forEach((f,b)=>{const sp=VtBand(f,S,W,k,b),H=f.h+40,top=f.y-H+20,cw=64,m=reduced?.5:1;
 for(let x=0;x<W;x+=cw){const wave=.72+.28*Math.sin(x*.007-travel*.012+b*1.3),s=(w.level*.62*wave*m+.03*Math.sin(idle*.9+x*.01+b))*(1+b*.15),yb=top+H;
  c.save();c.transform(1,0,-s,1,s*yb,0);c.beginPath();c.rect(x-1,top-10,cw+2,H+10);c.clip();VtShow(c,sp,0,top,W,H);c.restore();}});}
// The laundry on the lines of the terrace: sheets, towels and socks, which swing and fly out with the wind.
const VT_CLOTH=['#e8434f','#2f7fe0','#f7c234','#fdfaf2','#28b07a','#f07a2a','#9b4fd1','#e86aa0'];
function VtLaundry(c,P,S,t,w,idle,reduced){const m=reduced?.55:1;
 P.lines.forEach((L,li)=>{const at=u=>[L.x0+(L.x1-L.x0)*u,L.y+Math.sin(u*Math.PI)*L.sag*(1-.3*w.level)];c.strokeStyle='#5a5060';c.lineWidth=2;c.beginPath();for(let s=0;s<=20;s++){const [x,y]=at(s/20);s?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  for(const u of [0,1]){const [x,y]=at(u);c.fillStyle='#8a7a6a';c.fillRect(x-4,y-8,8,640-y+8);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(x-3,y-8,2,640-y+8);}
  for(let i=0;i<L.items;i++){const u=(i+.5)/L.items,[x,y]=at(u),kind=(i+li*2)%4,col=VT_CLOTH[(i*3+li*5+S.year)%8],span=(L.x1-L.x0)/L.items,wd=kind===3?22:kind===2?span*.55:kind===1?span*.7:span*.86,hh=kind===3?40:kind===2?80:kind===1?110:170;
   const blow=Kclamp(w.level*m*(.8+.2*Math.sin(t*1.7+i)));const flap=Math.sin(t*(4+i)+i*1.3)*w.level*m+.15*Math.sin(idle*.8+i);
   // The cloth: its top on the line; its bottom billows out (it looks shorter) and swings a little downwind as the wind grows.
   const dx=hh*.38*blow+flap*7,dy=hh*(1-.42*blow)+flap*3;c.save();c.beginPath();c.moveTo(x-wd/2,y);c.lineTo(x+wd/2,y);
   for(let s=0;s<=8;s++){const q=1-s/8,bx=x+wd/2-wd*(1-q)+dx,by=y+dy+Math.sin(q*Math.PI*2+t*6+i)*6*w.level*m;c.lineTo(bx+(1-q)*0,by);}
   c.closePath();c.fillStyle=col;c.fill();c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=2;c.stroke();c.globalAlpha=.18;c.fillStyle='#20183a';c.beginPath();c.moveTo(x-wd/2+wd*.62,y);c.lineTo(x+wd/2,y);c.lineTo(x+wd/2+dx,y+dy);c.lineTo(x-wd/2+wd*.62+dx,y+dy);c.fill();c.restore();
   c.fillStyle='#d9b26a';c.fillRect(x-wd/2+3,y-5,4,10);c.fillRect(x+wd/2-7,y-5,4,10);}});}
// Kites at the beach: they rest on the sand when there is no wind and climb as it blows; their tails wave.
function VtKites(c,P,W,t,w,idle,reduced){const lift=Ksmooth(w.level/.5),m=reduced?.55:1;
 P.kites.forEach((K,i)=>{const ax=W*(K.x-.06),ay=740,kx=W*K.x+Math.sin(t*.9+i*2)*30*w.level*m,ky=560+(K.y-560)*lift+Math.sin(t*1.3+i)*12*w.level*m+Math.sin(idle*.6+i)*3,ang=-.3+lift*.5+Math.sin(t*2.1+i)*.25*w.level*m;
  c.strokeStyle='rgba(60,55,70,.6)';c.lineWidth=1.2;c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo((ax+kx)/2+40,(ay+ky)/2+60*(1-lift*.6),kx,ky);c.stroke();
  c.save();c.translate(kx,ky);c.rotate(ang);c.fillStyle=K.col;c.beginPath();c.moveTo(0,-34);c.lineTo(24,0);c.lineTo(0,40);c.lineTo(-24,0);c.closePath();c.fill();c.fillStyle=K.col2;c.beginPath();c.moveTo(0,-34);c.lineTo(24,0);c.lineTo(0,0);c.fill();c.beginPath();c.moveTo(0,40);c.lineTo(-24,0);c.lineTo(0,0);c.fill();
  c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;c.beginPath();c.moveTo(0,-34);c.lineTo(0,40);c.moveTo(-24,0);c.lineTo(24,0);c.stroke();
  c.strokeStyle='#5a5060';c.lineWidth=1.5;c.beginPath();c.moveTo(0,40);let px=0,py=40;for(let s=1;s<=10;s++){px=Math.sin(t*5+s*.8+i)*8*(.3+w.level)*m-s*2*lift;py=40+s*11;c.lineTo(px,py);}c.stroke();
  for(let s=2;s<=10;s+=2){const bx=Math.sin(t*5+s*.8+i)*8*(.3+w.level)*m-s*2*lift,by=40+s*11;c.fillStyle=s%4?K.col2:K.col;c.beginPath();c.moveTo(bx-6,by-3);c.lineTo(bx+6,by+3);c.lineTo(bx+6,by-3);c.lineTo(bx-6,by+3);c.fill();}c.restore();});}
// Gulls far over the sea: small, gliding, carried by the wind.
function VtGulls(c,W,P,travel,t,idle){c.strokeStyle='#f8f8f4';c.lineWidth=2.4;c.lineCap='round';for(let i=0;i<5;i++){const span=W+200,x=((W*Krand(i,61)+travel*.35+idle*12)%span+span)%span-100,y=150+Krand(i,62)*120+Math.sin(idle*.5+i)*10,f=Math.sin(idle*3+i*2)*4;
 c.beginPath();c.moveTo(x-12,y-2+f);c.quadraticCurveTo(x-5,y-8+f,x,y);c.quadraticCurveTo(x+5,y-8+f,x+12,y-2+f);c.stroke();}}
// What flies: small shapes of opaque gouache with a light brushed edge, carried by the wind from the left; when the wind lets go they
// float down and settle. More of them the stronger the wind; at the gale a gust brings a wave or a whirl of them.
function VtFlyer(c,kind,i,size,col,rot){c.save();c.rotate(rot);c.fillStyle=col;c.strokeStyle='rgba(255,255,250,.55)';c.lineWidth=1.2;
 switch(kind){case 'llavors':c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=1;c.beginPath();for(let k=0;k<7;k++){const a=-Math.PI/2+(k/6-.5)*2.2;c.moveTo(0,size*.8);c.lineTo(Math.cos(a)*size,Math.sin(a)*size*.9);}c.stroke();c.fillStyle='#8a7a5a';c.beginPath();c.ellipse(0,size*.9,1.4,2.6,0,0,K_TAU);c.fill();break;
  case 'roba':if(i%2){c.beginPath();c.moveTo(-size*.4,-size);c.lineTo(size*.2,-size);c.lineTo(size*.2,size*.3);c.lineTo(size*.8,size*.5);c.lineTo(size*.7,size);c.lineTo(-size*.4,size*.7);c.closePath();}else{c.beginPath();c.rect(-size,-size*.8,size*2,size*1.6);}c.fill();c.stroke();break;
  case 'pampols':for(const [dx,dy] of [[0,-size*.45],[-size*.45,0],[size*.45,0]]){c.beginPath();c.arc(dx,dy,size*.55,0,K_TAU);c.fill();}c.stroke();break;
  case 'neu':c.globalAlpha*=.8;c.beginPath();c.arc(0,0,size*.9,0,K_TAU);c.fill();break;
  case 'escuma':c.beginPath();c.ellipse(0,0,size*1.2,size*.45,0,0,K_TAU);c.fill();break;
  default:c.beginPath();c.ellipse(0,0,size,size*.55,0,0,K_TAU);c.fill();c.beginPath();c.moveTo(-size*.7,-size*.15);c.lineTo(size*.6,-size*.2);c.stroke();}
 c.restore();}
function VtFlyers(c,W,P,S,w,travel,t,release,reduced){const kind=S.id==='platja'?'escuma':S.fly,max=kind==='roba'?10:reduced?28:60,show=Kclamp((w.level-.1)/.8),n=Math.ceil(max*show);if(!n)return;
 const fall=release!==null&&release!==undefined&&t>release?t-release:0,ground=kind==='escuma'?560:690;
 for(let i=0;i<n;i++){const f=.65+Krand(i,71)*.7,span=W+300,x=((travel*f+Krand(i,72)*span)%span+span)%span-150,y0=(kind==='neu'?140:kind==='escuma'?420:120)+Krand(i,73)*(kind==='escuma'?140:P.hz+200-120),
  bob=Math.sin(t*(1.2+f)+i)*24*w.level,y=Math.min(ground-Krand(i,74)*40,y0+bob+fall*fall*30*(.6+Krand(i,75)*.4)),a=Kclamp(show*max-i)*(1-Ksmooth((fall-.9)/.9)*.8);if(a<=0)continue;
  c.save();c.globalAlpha*=a;c.translate(x,y);VtFlyer(c,kind,i,(kind==='roba'?16:kind==='neu'?7:kind==='llavors'?11:8.5)*(.75+Krand(i,76)*.6),P.flyCols[i%P.flyCols.length],t*(1+f)*2*w.level+i);c.restore();}}
// A gust of the gale: a whirl that climbs (odd gusts) or a wave of what flies (even gusts), from the left.
function VtGustFx(c,W,P,S,w,t,reduced){const g=w.gust;if(g.p<0||reduced)return;const kind=S.id==='platja'?'escuma':S.fly,p=g.p,env=Math.sin(Math.PI*p);
 if(g.k%2===0){for(let i=0;i<24;i++){const x=-80+(W+160)*Kclamp(p*1.15-Krand(i,81)*.15),y=P.hz-60+Math.sin(p*6+i)*60+(Krand(i,82)-.5)*160;c.save();c.globalAlpha*=env;c.translate(x,y);VtFlyer(c,kind,i,6,P.flyCols[i%P.flyCols.length],p*10+i);c.restore();}}
 else{const cx=W*(.25+.5*Krand(g.k,83)),base=P.hz+80;for(let i=0;i<22;i++){const q=Kclamp(p*1.2-i/40),ang=q*K_TAU*1.2+i,rr=20+q*70,x=cx+Math.cos(ang)*rr+q*120,y=base-q*320+Math.sin(ang)*rr*.4;c.save();c.globalAlpha*=env;c.translate(x,y);VtFlyer(c,kind,i,6,P.flyCols[i%P.flyCols.length],ang);c.restore();}}}

// ── The scene ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const VtLand=(S,P,W,k)=>VtPainting(`vt-land-${S.v}-${Math.round(W)}-${k.toFixed(2)}`,{W,H:720,k,seed:S.v*101+3,base:P.land,flow:P.flow,size:P.size,veil:.3,passes:[[330,34,13],[520,24,9],[700,16,6]]});
// Everything of one place, for the wind w at time t of the press (travel: how far the wind has carried things).
function VtDraw(c,W,k,S,o,w,travel,clip){const P=VtPlace(S,W),t=o.t,idle=o.idle||0,reduced=!!o.reduced,ch=o.character||'recta',d=o.decor;
 // The decor is the painted land and its sky (0.17): atenuat, under a veil; without it, the base colour (over the old place too, while
 // the new one is painted). The clouds, the trees, the grass and all that the wind carries are drawn as always.
 if(!d||d.fade>0)VtShow(c,VtLand(S,P,W,k),0,0,W,720,clip,!o.change||clip>=1e8,d&&!d.full?d:null);else{c.fillStyle=d.base;c.fillRect(0,0,Math.min(W,clip),720);}
 if(clip<1e8){c.save();c.beginPath();c.rect(0,0,Math.max(0,clip),720);c.clip();}
 for(const cl of P.clouds){const sp=VtCloud(cl,S,k),w0=240*cl.s,h0=(cl.mist?40:96)*cl.s,span=W+w0*2,x=((cl.x+idle*(cl.mist?2:4)+travel*(cl.mist?.15:.3))%span+span)%span-w0;VtShow(c,sp,x-w0/2+w0/2,cl.y-h0/2,w0,h0);}
 if(P.special==='gulls')VtGulls(c,W,P,travel,t,idle);
 VtSwirls(c,W,P,w,t,reduced);VtRibbons(c,W,P,w,travel,t,ch,reduced,false);
 if(P.special==='kites')VtKites(c,P,W,t,w,idle,reduced);
 VtTrees(c,P,S,k,t,w,idle,o.release,o.relLevel||0,reduced);
 if(P.special==='laundry')VtLaundry(c,P,S,t,w,idle,reduced);
 VtFringe(c,P,S,W,k,w,travel,t,idle,reduced);
 if(w.level>.5)VtRibbons(c,W,P,{level:(w.level-.5)*2*.7},travel,t,ch,reduced,true);
 VtFlyers(c,W,P,S,w,travel,t,o.release,reduced);VtGustFx(c,W,P,S,w,t,reduced);
 if(clip<1e8)c.restore();}
// Draws the scene. o: variant (the place and year), press (counts the presses: the character of the wind), t (seconds since the press;
// 1000 at rest), release (when the wind starts to calm; null while held), offset (seconds of wind already blowing at the press),
// change (this press carries the place away and paints the next one), from (the place before), next (the place to prepare), idle,
// reduced, preview.
export function drawVent(c,w,h,o){escFrame();VT_FRAME++;VtEvict();const m=o.preview&&c.getTransform&&c.canvas?c.getTransform():null;
 const S=h/720,W=w/S,k=escScale(c)*S,scene=ventScene(o.variant),ch=['recta','ondulant','remoli','cops'][((o.press||0)%4+4)%4];
 let t=o.t??1e3,release=o.release??null,offset=o.offset||0;if(o.preview){t=8.6;release=null;offset=0;}
 const resting=t>=1e3,wf=x=>resting?0:ventWind(x,release,offset,ch).level*(o.reduced?.6:1),wnd=resting?{level:0,held:0,grade:0,gust:{k:-1,p:-1},calm:1}:ventWind(t,release,offset,ch);if(o.reduced)wnd.level*=.6;
 const travel=resting?0:VtTravel(`${o.variant}|${o.press}|${release}|${offset}|${o.reduced?1:0}`,t,x=>180+520*wf(x))*1;
 const relLevel=release!==null&&release!==undefined?ventWind(release,null,offset,ch).level:0,decor=escDecor(o),opt={...o,t:resting?0:t,release,character:ch,relLevel,decor};
 c.save();c.scale(S,S);
 // A change of place: the new place is painted over the old one, from the left, following the wind (about three seconds, or as fast as
 // its strokes are ready).
 if(o.change&&o.from!==undefined&&!resting&&t<6){const old=ventScene(o.from),land=decor.fade>0?VtLand(scene,VtPlace(scene,W),W,k):null,front=Math.min(-160+(W+320)*Ksmooth(t/3.2),land?land.sweep:1e9);
  VtDraw(c,W,k,old,{...opt,change:false},wnd,travel,1e9);VtDraw(c,W,k,scene,{...opt,change:true},wnd,travel,Math.max(0,front));
  if(front<W){c.save();c.beginPath();c.rect(front-140,0,180,720);c.clip();VtRibbons(c,W,{hz:720},{level:1},travel*2,t,'recta',o.reduced,false);c.restore();}}
 else VtDraw(c,W,k,scene,opt,wnd,travel,1e9);
 c.restore();
 if(m&&typeof m==='object'){if(VT_QUEUE.length)VT_CARDS.set(c.canvas,[c,w,h,o,m]);else VT_CARDS.delete(c.canvas);}
 // The next place is prepared while this one is blown (once its own paintings are done).
 if(!o.preview&&o.next!==undefined&&!VT_QUEUE.length){const n=ventScene(o.next),P=VtPlace(n,W);if(decor.fade>0)VtLand(n,P,W,k);P.trees.forEach((tr,i)=>VtCrown(tr,n,k,i));P.fringe.forEach((f,b)=>VtBand(f,n,W,k,b));}
 return true;}
