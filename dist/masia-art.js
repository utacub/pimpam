// Estiu a la masia (EN26), 0.39: the board on screen. The painted panorama (cached sheets for the key hours, cross-faded as the day
// goes on), the life on it every frame (the five characters, the hens, the cat, the swallows, the smoke, the washing), the veil and the
// ring of the scanning, the camera push-in of a pick, the episode, the way back, and the dinner. Names start with ma.
import {MS_SHEET,mpHour,mpRgb,mpMix,mpLit,mpCol,mpClamp,mpEase,mpVignette,mpRect,mpTone,MP_TAU,mpSheet,mpSheetHas,mpClearSheets,mpMap,mpCam,mpCamBoard} from './masia-pinzell.js';
import {MN_PAL} from './masia-natura.js';
import {MD,MD_ORDER,mdPanorama,mdSwing,mdFore} from './masia-decorats.js';
import {MC_CHARS,mcDrawHuman,mcDrawGoat,mcDrawCat,mcDrawHen,mcShape,mcStroke,mcDot,mcEllipse,MC_LINE} from './masia-personatges.js';
import {MS_PUSH,MS_EP,MS_BACK,MS_SOPAR,MS_STEP,MS_FINAL,msHour,msPhase,msIdle,msVariant,msClamp,msEase,msEaseOut,msBlink,msSpring} from './masia.js';
import {mfSmoke,mfSwallows,mfWater,mfSnore,mfWind,mfRings} from './masia-efectes.js';
import {meDraw,ME_CAM,meSet,meCharacter,meWashing,mePondLife} from './masia-episodis.js';
const maCharacter=meCharacter,maWashing=meWashing,maPondLife=mePondLife;
export {maCharacter};
import {tlRing,TL_DIM} from './tauler.js';
const [SW,SH]=MS_SHEET;
export const MA_HOURS=Object.freeze([0,.36,.7,1]);
export const maMap=mpMap;
const maScreen=(pts,m)=>pts.map(([x,y])=>[x*m[0]+m[2],y*m[1]+m[3]]);
const maDark=d=>d.mode==='none'&&d.base!=='#ffffff';
// The zones of the board (app.js buttons, the ring): the polygon of each offered character, on screen.
export function maLayout(state,options,w,h){const m=maMap(w,h);return options.map(o=>{const id=o?.value??o?.id??o;const z=MD.zones[id]||MD.zones.avia;const pts=maScreen(z,m).map(([x,y])=>[Math.max(1,Math.min(w-1,x)),Math.max(1,Math.min(h-1,y))]);
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);return {x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y,kind:'poly',radius:0,pts,zone:id};});}
// ── Sheets ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The cache of full-size canvases lives in the toolkit (mpSheet), shared with the episodes.
export const maSheet=mpSheet,maSheetHas=mpSheetHas,maClearSheets=mpClearSheets;
const maDecorKey=d=>`${d.mode}|${d.base}|${d.opacity??1}`;
// The panorama at a key hour under a camera (world → screen transform), with the decor setting applied.
function maPaintWorld(x,w,h,L,cam,decor,o={}){x.setTransform(1,0,0,1,0,0);x.fillStyle=decor.base||'#000';x.fillRect(0,0,w,h);if(decor.mode==='none')return;
 x.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);const paint=o.paint||(c=>mdPanorama(c,L,{fore:false,vignette:false,wave:o.wave??.35}));paint(x);
 x.setTransform(1,0,0,1,0,0);if(decor.mode==='dim'){x.fillStyle=decor.base||'#000';x.globalAlpha=.5;x.fillRect(0,0,w,h);x.globalAlpha=1;}}
// A camera: world point (cx,cy) at the centre of the screen, zoom z over the cover-fit scale. k, ox, oy give the transform.
export const maCam=mpCam,maCamBoard=mpCamBoard;
// Which key hours bracket h, and the blend between them.
export function maHourBlend(h){let i=0;while(i<MA_HOURS.length-2&&MA_HOURS[i+1]<=h)i++;const a=MA_HOURS[i],b=MA_HOURS[i+1];return [a,b,mpClamp((h-a)/(b-a))];}
// The panorama at hour h: the two bracketing sheets cross-faded, drawn through the camera (the sheets are painted at the board camera).
function maPanorama(c,w,h,hour,decor,cam){const [a,b,u]=maHourBlend(hour);const base=maCamBoard(w,h);const key=k=>`ma-pan|${k}|${maDecorKey(decor)}`;const ga=c.globalAlpha;
 const sa=maSheet(c,key(a),x=>maPaintWorld(x,w,h,mpHour(a),base,decor));const sb=u>0.01?maSheet(c,key(b),x=>maPaintWorld(x,w,h,mpHour(b),base,decor)):null;
 c.save();c.setTransform(1,0,0,1,0,0);
 // a camera other than the board's: the sheet is drawn scaled about the camera centre
 const draw=(sheet,alpha)=>{alpha*=ga;if(!sheet){c.globalAlpha=alpha;c.fillStyle=decor.base||'#000';c.fillRect(0,0,w,h);return;}c.globalAlpha=alpha;if(cam.z===1&&Math.abs(cam.ox-base.ox)<.5&&Math.abs(cam.oy-base.oy)<.5)c.drawImage(sheet,0,0);else{const s=cam.k/base.k;c.setTransform(s,0,0,s,cam.ox-base.ox*s,cam.oy-base.oy*s);c.drawImage(sheet,0,0);c.setTransform(1,0,0,1,0,0);}};
 draw(sa,1);if(sb&&u>0.01)draw(sb,u);c.restore();}
// ── The life on the board ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Everything that moves on the panorama, in world coordinates (the caller has set the camera transform). lights: the focus of each
// offered character (0..1); picks: the characters already picked (their traces stay); t the clock.
export function maLife(c,L,t,o={}){const {lights={},picks=[],lw=1.5,wind=.25,hens=true,swallows=true,smoke=1,reduced=false}=o;const tt=reduced?0:t;const W=mfWind(tt,wind);
 if(swallows)mfSwallows(c,tt,5,11,{scale:.9});
 mfSmoke(c,MD.house.chimney.x,MD.house.chimney.y-34,tt,L,smoke,L.sunDir>0?-1:1);
 // the washing on the line, swaying with the wind (Pol's sheet is gone after his episode)
 maWashing(c,L,tt,W,picks.includes('pol'));
 // the swing, swaying a little (the goat sits on it after her episode)
 const f=MD.fig;const sw=picks.includes('cabra')?Math.sin(tt*1.4)*.22:Math.sin(tt*.9)*.05;mdSwing(c,f.swing.x,f.swing.y,f.swing.len,sw,L);
 if(picks.includes('cabra')){const sx=f.swing.x+Math.sin(sw)*f.swing.len,sy=f.swing.y+Math.cos(sw)*f.swing.len;mcDrawGoat(c,{x:sx-4,y:sy-2,facing:1,legs:[.9,.9,-.6,-.6],neck:.2,head:-.2,ears:.5,eyes:'open',mouth:'open',scale:.72,tail:Math.sin(tt*5)},{lw:lw/.72,L});}
 // the pond: a few glints move, and the bobber of the grandpa
 maPondLife(c,L,tt);
 // the cat on the bench, the hens
 mcDrawCat(c,{x:MD.bench.x,y:MD.bench.y-20,facing:-1,state:'sleep',scale:.7,tail:tt*1.3,ear:Math.max(0,Math.sin(tt*.7))*2},{lw:1.2});
 if(hens)for(let i=0;i<3;i++){const ph=i*2.1;const peck=Math.max(0,Math.sin(tt*2.6+ph))>.6?1:0;const step=Math.abs(Math.sin(tt*3+ph));mcDrawHen(c,{x:1120+i*34+Math.sin(tt*.3+ph)*12,y:588+(i%2)*8,facing:Math.cos(tt*.3+ph)>0?1:-1,peck,step,col:[[200,140,80],[240,236,220],[120,80,60]][i],scale:.75},{lw:1.1});}
 // the five, each at its spot, reacting to the focus of the scanning; the ones already picked carry the trace of their episode
 for(const id of MD_ORDER){const k=lights[id]??0;maCharacter(c,id,L,tt,k,{lw,picked:picks.includes(id),wind:W});}}
// ── The veil and the ring ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// (in CSS pixels, under the app's base transform: the zones come from maLayout)
function maVeilRing(c,w,h,view,dark){const zones=view.zones||[],lights=view.lights||[],f=view.focus??-1,wait=view.wait??(view.waiting?1:0);const veil=a=>dark?`rgba(0,0,0,${a})`:`rgba(40,36,70,${a})`;
 c.save();
 // everything but the offered characters, lightly veiled; each offered one by its light; all of it more when waiting
 c.beginPath();c.rect(0,0,w,h);for(const z of zones){const p=z.pts;c.moveTo(p[0][0],p[0][1]);for(let i=p.length-1;i>0;i--)c.lineTo(p[i][0],p[i][1]);c.closePath();}c.fillStyle=veil(Math.min(.9,.12+.3*wait));c.fill('evenodd');
 zones.forEach((z,i)=>{const light=lights[i]??TL_DIM;const a=.14*(1-light)/(1-TL_DIM)+.3*wait;if(a<=.003)return;c.beginPath();z.pts.forEach((p,k)=>k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=veil(Math.min(.9,a));c.fill();});
 if(f>=0&&zones[f]&&!view.waiting){const light=lights[f]??TL_DIM,sheen=(light-TL_DIM)/(1-TL_DIM);c.beginPath();zones[f].pts.forEach((p,k)=>k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=`rgba(255,250,230,${.1*sheen})`;c.fill();}
 c.restore();
 if(f>=0&&zones[f]&&!view.waiting)tlRing(c,zones[f].pts,view.progress,1,Math.max(.6,Math.min(1.2,w/1280)),view.ring);}
// ── The frame ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function maBoard(c,w,h,state,game,s,view){if(view.preview){maPreview(c,w,h,view);return;}maDraw(c,w,h,state,game,s,view,null);}
export function maResult(c,w,h,state,game,s,view,time){maDraw(c,w,h,state,game,s,view,time);}
// The app hands the canvas scaled to the screen's pixel density (its base transform); the masia paints in device pixels, so the
// sheets stay crisp on dense screens: the base is read, the size converted, and only the ring (zones in CSS pixels) goes through the base.
const maBase=c=>{const m=c.getTransform&&c.getTransform();return m&&m.a?{a:m.a,b:m.b||0,c:m.c||0,d:m.d||m.a,e:m.e||0,f:m.f||0}:{a:1,b:0,c:0,d:1,e:0,f:0};};
function maDraw(c,w,h,state,game,s,view,time){const B=maBase(c);c.save();c.setTransform(1,0,0,1,0,0);try{maDrawDev(c,w*B.a,h*B.d,state,game,s,view,time,B,w,h);}finally{c.restore();}}
function maDrawDev(c,w,h,state,game,s,view,time,B,w0,h0){const b=game.board||(game.board={}),dark=maDark(view.decor),decor=view.decor;const picks=view.picks||[];const pend=time!=null?view.pendingChar:null,final=time!=null&&!!view.final;
 if(b.clock===undefined)b.clock=0;const t=b.clock;const reduced=!!s.reduced;
 const nPicks=picks.length;const hour=msHour(nPicks,time,final);const L=mpHour(hour);
 // the focus lights by character
 const lights={};(view.zones||[]).forEach((z,i)=>{lights[z.zone]=view.lights?.[i]??TL_DIM;});const lightK={};for(const id of MD_ORDER)lightK[id]=lights[id]===undefined?0:msClamp((lights[id]-TL_DIM)/(1-TL_DIM));
 const lifeOpts={lights:lightK,picks,reduced,smoke:1};
 if(time==null){// the board at rest
  const cam=maCamBoard(w,h);maPanorama(c,w,h,hour,decor,cam);c.save();c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);if(decor.mode!=='none')maLife(c,L,t,lifeOpts);else maLifeBare(c,L,t,lifeOpts);c.restore();
  c.save();c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);if(decor.mode==='full')mdFore(c,L);c.restore();c.save();c.setTransform(B.a,B.b,B.c,B.d,B.e,B.f);maVeilRing(c,w0,h0,view,dark);c.restore();return;}
 // a pick: the push-in, the episode, the way back or the dinner
 const ph=msPhase(time,final);const id=pend||'avia';const cam0=maCamBoard(w,h);const camE=ME_CAM[id]||ME_CAM.avia;const variant=msVariant(state.round);
 const ctx={L,hour,variant,s,decor,b,t,w,h,picks,reduced,lifeOpts};
 if(ph.phase==='push'){const u=msEase(ph.u);const z=1+(camE.z-1)*u;const cx=cam0.cx+(camE.x-cam0.cx)*u,cy=cam0.cy+(camE.y-cam0.cy)*u;const cam=maCam(w,h,cx,cy,z);
  maPanorama(c,w,h,hour,decor,cam);c.save();c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);if(decor.mode!=='none')maLife(c,L,t,{...lifeOpts,lights:{...lightK,[id]:1}});else maLifeBare(c,L,t,{...lifeOpts,lights:{...lightK,[id]:1}});c.restore();
  // the last fifth of the push-in cross-fades into the first frame of the episode
  if(ph.u>.8){c.save();c.globalAlpha=msClamp((ph.u-.8)/.2);meDraw(id,c,w,h,0,ctx);c.restore();}return;}
 if(ph.phase==='ep'){meDraw(id,c,w,h,ph.t,ctx);return;}
 if(ph.phase==='back'){// the episode's last frame dissolves into the board, later in the day
  const u=msEase(ph.u);meDraw(id,c,w,h,MS_EP,ctx);c.save();c.globalAlpha=u;const cam=maCamBoard(w,h);maPanorama(c,w,h,hour,decor,cam);c.save();c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);if(decor.mode!=='none')maLife(c,L,t,{...lifeOpts,picks:[...picks,id]});else maLifeBare(c,L,t,{...lifeOpts,picks:[...picks,id]});if(decor.mode==='full')mdFore(c,L);c.restore();c.restore();return;}
 // the dinner: the fifth episode dissolves into the table under the fig tree
 const u=msClamp(ph.t/1);if(u<1)meDraw(id,c,w,h,MS_EP,ctx);c.save();c.globalAlpha=u;meDraw('sopar',c,w,h,ph.t,{...ctx,picks:[...picks,id]});c.restore();}
// Without decor: a plain base and the five on it, with their props (the scanning still has its places).
function maLifeBare(c,L,t,o){for(const id of MD_ORDER){const k=o.lights[id]??0;maCharacter(c,id,L,t,k,{lw:1.5,picked:(o.picks||[]).includes(id),wind:.2});}}
// The home card: the panorama at noon with the five at rest, small.
function maPreview(c,w0,h0,view){const B=maBase(c),w=w0*B.a,h=h0*B.d;c.save();c.setTransform(1,0,0,1,0,0);try{maPreviewDev(c,w,h,view);}finally{c.restore();}}
function maPreviewDev(c,w,h,view){const cam=maCamBoard(w,h);const L=mpHour(.36);const decor=view.decor;const sheet=maSheet(c,`ma-prev|${maDecorKey(decor)}`,x=>{maPaintWorld(x,w,h,L,cam,decor);x.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);if(decor.mode!=='none')maLife(x,L,1.2,{lights:{},picks:[],reduced:true,swallows:true});else maLifeBare(x,L,1.2,{lights:{},picks:[]});if(decor.mode==='full')mdFore(x,L);});
 if(sheet){c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(sheet,0,0);c.restore();}else{maPaintWorld(c,w,h,L,cam,decor);}}
// Warms the sheets the board needs first (the panorama at the first hour), called when the activity opens.
export function maPrewarm(c,w0,h0,decor){const B=maBase(c),w=w0*B.a,h=h0*B.d;const cam=maCamBoard(w,h);maSheet(c,`ma-pan|0|${maDecorKey(decor)}`,x=>maPaintWorld(x,w,h,mpHour(0),cam,decor));}
