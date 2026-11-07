// Pinta el món (EN25), 0.38: the page on the scanning board. The whole screen is a sheet of paper with an ink landscape; the scanned zones
// are the parts of the drawing (the sky, the mountains, the river, the forest, the village, the fields), each one chosen fills with
// watercolour in real time (pinta-gl.js) and comes alive (pinta-vida.js, pinta-gags.js). Layers, back to front: the washes (WebGL, or
// flat fills without it) → the ink sheet (cached) → the life of the painted zones → the veil of the unpainted zones, the sheen and the
// ring of the scanned zone → the brush while a zone is being painted → the finale of the page and the page turn.
import {PT_SHEET,PT_ZONES,ptPage,PT_PAINT,PT_STEP,PT_FINAL,PT_TURN,ptPalette,PT_STYLE,ptEase,ptWash} from './pinta.js';
import {pintaDraw,pintaGlFailed} from './pinta-gl.js';
import {PTK,ptInkDraw,ptClipRect,ptInside} from './pinta-eines.js';
import {ptTerraVall} from './pinta-terres.js';
import {ptTerraCosta,ptTerraMuntanya} from './pinta-terres2.js';
import {ptTerraCiutat,ptTerraLlac} from './pinta-terres3.js';
import {ptFinal} from './pinta-vida.js';
import {ptVida} from './pinta-gags.js';
import {tlSheet,tlRing,tlRng,TL_DIM} from './tauler.js';
const PT_TERRES=[ptTerraVall,ptTerraCosta,ptTerraMuntanya,ptTerraCiutat,ptTerraLlac],PT_CACHE=new Map(),PT_GLZ=new Map(),PT_PATHS=new Map();
export function ptTerra(land){const k=((land|0)%5+5)%5;let t=PT_CACHE.get(k);if(!t){t=PT_TERRES[k]();PT_CACHE.set(k,t);}return t;}
// The sheet covers the screen (cover fit, centred): map = [sx, sy, ox, oy] from sheet units to CSS px.
export function ptMap(w,h){const s=Math.max(w/PT_SHEET[0],h/PT_SHEET[1]);return [s,s,(w-PT_SHEET[0]*s)/2,(h-PT_SHEET[1]*s)/2];}
const ptScreen=(pts,m)=>pts.map(([x,y])=>[x*m[0]+m[2],y*m[1]+m[3]]);
const ptPath=(c,pts)=>{pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();};
const ptRgb=(v,a=1)=>`rgba(${Math.round(v[0]*255)},${Math.round(v[1]*255)},${Math.round(v[2]*255)},${a})`;
const ptDark=d=>d.mode==='none'&&d.base!=='#ffffff';
// The zones of the board (app.js buttons, the ring): the polygon of each offered zone, clipped to the screen, and its box.
export function ptLayout(state,options,w,h){const page=ptPage(state?.round||0),T=ptTerra(page.land),m=ptMap(w,h);
 return options.map(o=>{const id=o?.value??o?.id??o,z=T.zones.find(z=>z.id===id)||T.zones[0];let pts=ptClipRect(ptScreen(z.poly,m),1,1,w-1,h-1);if(pts.length<3)pts=[[1,1],[w-1,1],[w-1,h-1],[1,h-1]];
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);return {x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y,kind:'poly',radius:0,pts,zone:z.id};});}
function ptGlZones(T,land,season){const k=land+'|'+season;let z=PT_GLZ.get(k);if(!z){z=T.zones.map(z=>({...z,pal:ptPalette(season,land,z.id)}));PT_GLZ.set(k,z);}return z;}
function ptProgress(T,picks,pend,time,reduced){const set=new Set(picks);const prog=T.zones.map(z=>set.has(z.id)?1:0);
 if(pend!=null&&time!=null){const i=T.zones.findIndex(z=>z.id===pend);if(i>=0)prog[i]=Math.max(prog[i],ptWash(time,reduced));}return prog;}
const ptInkStyle=dark=>({...PT_STYLE.ink,ink:dark?[222,216,205]:[40,32,30]});
function ptPaperFill(c,w,h,decor){c.fillStyle=ptDark(decor)?'#000000':decor.mode==='dim'?'#9e9a91':'#f6f1e6';c.fillRect(0,0,w,h);}
// The washes: WebGL draws paper, grain and the watercolour of every zone by its progress; without WebGL, flat fills on the paper.
function ptWashes(c,w,h,T,land,season,prog,decor,m,plain,moving,t){const zones=ptGlZones(T,land,season),dark=ptDark(decor);
 if(!pintaGlFailed()&&pintaDraw(c,{key:`pt|${land}|${season}`,zones,prog,map:m,decor:decor.mode,base:decor.base==='#ffffff'?'white':'black',plain,t,moving}))return true;
 ptPaperFill(c,w,h,decor);c.save();c.transform(m[0],0,0,m[1],m[2],m[3]);c.globalCompositeOperation=dark?'lighter':'multiply';
 zones.forEach((z,i)=>{const p=prog[i];if(p<=0)return;c.globalAlpha=(dark?.6:.85)*p;c.fillStyle=ptRgb(dark?z.pal.col.map(v=>1-v):z.pal.col);c.beginPath();for(const poly of z.polys)ptPath(c,poly);if(z.reserves.length){for(const r of z.reserves)ptPath(c,r);c.fill('evenodd');}else c.fill();
  c.fillStyle=ptRgb(dark?z.pal.accent.map(v=>1-v):z.pal.accent);c.beginPath();for(const a of z.accents)ptPath(c,a);c.fill();});
 c.restore();return false;}
function ptInk(c,w,h,T,land,m,dark){tlSheet(c,['pt-ink',land,dark?1:0,w,h].join('|'),x=>{const tr=x.getTransform&&x.getTransform(),k=tr?.a||1;ptInkDraw(x,T.strokes,[m[0]*k,m[1]*k,m[2]*k,m[3]*k],ptInkStyle(dark),land+1);});}
// The life of the painted zones, in sheet coordinates; age: seconds since the zone began to be painted (its gag plays once, then its
// life goes on).
function ptLife(c,T,land,season,prog,b,view,m,o){c.save();c.transform(m[0],0,0,m[1],m[2],m[3]);
 T.zones.forEach((z,i)=>{const p=prog[i];if(p<=0)return;const age=view.preview?40:b.clock-(b.ptDone?.[z.id]??b.clock);ptVida(c,land,season,z.id,T.anchors,view.preview?0:b.clock,age,{...o,prog:p});});
 c.restore();}
// The veil over the unpainted zones (a cool grey; black on a black decor), lifted on the scanned zone, with a sheen of wet paper on it,
// and the ring. While the board waits for the first switch press, the whole page is veiled a little more.
function ptVeilRing(c,w,h,T,m,prog,view,dark){const zones=view.zones||[],lights=view.lights||[],f=view.focus??-1,wait=view.wait??(view.waiting?1:0);
 const veil=a=>dark?`rgba(0,0,0,${a})`:`rgba(52,48,76,${a})`,offered=new Map(zones.map((z,i)=>[z.zone,i]));c.save();
 T.zones.forEach((z,i)=>{if(prog[i]>=1)return;const j=offered.get(z.id);let a;if(j===undefined)a=.24;else{const light=lights[j]??TL_DIM;a=.24*(1-light)/(1-TL_DIM);}
  a+=.3*wait;if(a<=.003)return;const pts=j===undefined?ptClipRect(ptScreen(z.poly,m),0,0,w,h):zones[j].pts;if(pts.length<3)return;c.beginPath();ptPath(c,pts);c.fillStyle=veil(Math.min(.9,a));c.fill();});
 if(f>=0&&zones[f]&&!view.waiting){const light=lights[f]??TL_DIM,sheen=(light-TL_DIM)/(1-TL_DIM);c.beginPath();ptPath(c,zones[f].pts);c.fillStyle=`rgba(255,255,255,${(dark?.07:.11)*sheen})`;c.fill();}
 c.restore();
 if(f>=0&&zones[f]&&!view.waiting)tlRing(c,zones[f].pts,view.progress,1,Math.max(.6,Math.min(1.2,w/1280)),view.ring);}
// The brush. It comes in from the right edge, wanders over the zone (a tour of points inside it, from the seed) while the wash grows,
// and leaves by the right edge; its bristles carry the colour of the zone.
function ptBrushPath(T,z,w,h,m){const k=['pt-path',T.anchors.horizon,z.id,w,h].join('|');let P=PT_PATHS.get(k);if(P)return P;
 const poly=ptClipRect(ptScreen(z.poly,m),0,0,w,h),xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),R=tlRng(z.seed[0]*7+z.seed[1]);
 const inside=[];for(let i=0;i<400&&inside.length<12;i++){const x=x0+R()*(x1-x0),y=y0+R()*(y1-y0);if(poly.length>2&&ptInside(poly,x,y))inside.push([x,y]);}
 let cur=[z.seed[0]*m[0]+m[2],z.seed[1]*m[1]+m[3]];const tour=[cur];while(inside.length){let b=0,bd=1e9;inside.forEach((p,i)=>{const d=Math.hypot(p[0]-cur[0],p[1]-cur[1]);if(d<bd){bd=d;b=i;}});cur=inside.splice(b,1)[0];tour.push(cur);}
 const pts=PTK.smooth([[w+90*m[0],Math.min(h*.8,tour[0][1])],...tour,[w+120*m[0],Math.max(h*.2,cur[1])]],5);const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
 P={pts,L,total:L[L.length-1]};PT_PATHS.set(k,P);return P;}
function ptBrush(c,w,h,T,m,zone,time,season,land,dark){const z=T.zones.find(z=>z.id===zone);if(!z||time>PT_PAINT+.45)return;const P=ptBrushPath(T,z,w,h,m),u=ptEase(Math.min(1,time/(PT_PAINT+.4)));
 const d=u*P.total;let i=1;while(i<P.L.length-1&&P.L[i]<d)i++;const a=P.pts[i-1],b=P.pts[i],f=(d-P.L[i-1])/Math.max(1e-6,P.L[i]-P.L[i-1]),x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f+Math.sin(time*9)*2*m[0];
 const s=m[0],pal=ptPalette(season,land,zone),col=pal.col,ink=dark?'rgba(222,216,205,.9)':'rgba(40,32,30,.9)';
 c.save();c.translate(x,y);c.rotate(-.95+Math.sin(time*4)*.06);c.lineJoin='round';c.lineCap='round';c.lineWidth=1.3*s;c.strokeStyle=ink;
 // the wet tuft, then the ferrule and the handle, upward
 c.fillStyle=ptRgb(col.map(v=>v*.92),.95);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-8*s,-14*s,-7*s,-30*s);c.lineTo(7*s,-30*s);c.quadraticCurveTo(8*s,-14*s,0,0);c.closePath();c.fill();c.stroke();
 c.fillStyle='#d9d4c6';c.fillRect(-8*s,-46*s,16*s,16*s);c.strokeRect(-8*s,-46*s,16*s,16*s);
 c.fillStyle='#b9793d';c.beginPath();c.moveTo(-6*s,-46*s);c.lineTo(-4*s,-190*s);c.lineTo(4*s,-190*s);c.lineTo(6*s,-46*s);c.closePath();c.fill();c.stroke();
 c.strokeStyle='rgba(255,255,255,.35)';c.beginPath();c.moveTo(-2*s,-52*s);c.lineTo(-1*s,-184*s);c.stroke();
 c.restore();
 // a drop now and then, falling from the tuft
 const drop=(time*1.7)%1;if(drop<.5&&time>.6){c.fillStyle=ptRgb(col,.55*(1-drop*2));c.beginPath();c.ellipse(x+8*s,y+10*s+drop*70*s,3*s,4.5*s,0,0,Math.PI*2);c.fill();}}
function ptSnapshot(c){if(typeof document==='undefined'||!c.canvas)return null;const cv=c.canvas,o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;o.getContext('2d').drawImage(cv,0,0);return o;}
// The page turn (the last PT_TURN seconds of the final): the finished page, snapped once, folds to the left over the next page; with
// reduced motion it fades instead.
function ptTurn(c,w,h,state,view,s,b,turn,m,o){const e=ptEase(turn),next=ptPage((state.round||0)+1),TN=ptTerra(next.land);
 ptWashes(c,w,h,TN,next.land,next.season,[0,0,0,0,0,0],view.decor,m,o.plain,false,0);ptInk(c,w,h,TN,next.land,m,o.dark);
 const snap=b.ptSnap;if(!snap)return;const cv=c.canvas,W=cv.width,H=cv.height;c.save();c.setTransform(1,0,0,1,0,0);
 if(s.reduced){c.globalAlpha=1-e;c.drawImage(snap,0,0,W,H);c.restore();return;}
 const k=1-e,x1=W*k;if(e>0){const g=c.createLinearGradient(x1,0,Math.min(W,x1+W*.1),0);g.addColorStop(0,`rgba(0,0,0,${.3*Math.min(1,e*4)})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x1,0,W*.1,H);}
 if(k>.002){c.drawImage(snap,0,0,W,H,0,0,x1,H);const g2=c.createLinearGradient(Math.max(0,x1-W*.3),0,x1,0);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(1,`rgba(0,0,0,${.38*e})`);c.fillStyle=g2;c.fillRect(0,0,x1,H);
  c.fillStyle=`rgba(255,255,255,${.5*e})`;c.fillRect(Math.max(0,x1-2*m[0]),0,2*m[0],H);}
 c.restore();}
// The preview of the home card: the spring valley, fully painted, flat (no WebGL, no life).
function ptPreview(c,w,h,view){const T=ptTerra(0),m=ptMap(w,h);ptPaperFill(c,w,h,view.decor);c.save();c.transform(m[0],0,0,m[1],m[2],m[3]);c.globalCompositeOperation='multiply';
 ptGlZones(T,0,0).forEach(z=>{c.globalAlpha=.8;c.fillStyle=ptRgb(z.pal.col);c.beginPath();for(const poly of z.polys)ptPath(c,poly);for(const r of z.reserves)ptPath(c,r);c.fill('evenodd');c.fillStyle=ptRgb(z.pal.accent);c.beginPath();for(const a of z.accents)ptPath(c,a);c.fill();});
 c.restore();ptInk(c,w,h,T,0,m,false);}
// ── The board and the result ──────────────────────────────────────────────────────────────────────────────────────────────────────
// view: {decor, ring, zones (ptLayout), lights, focus, progress, waiting, wait, clock, picks (the zones painted on this page),
// pendingZone (the zone being painted, in the result), final, preview}. time: seconds into the result, or null on the board.
export function ptBoard(c,w,h,state,game,s,view){if(view.preview){ptPreview(c,w,h,view);return;}ptDraw(c,w,h,state,game,s,view,null);}
export function ptResult(c,w,h,state,game,s,view,time){ptDraw(c,w,h,state,game,s,view,time);}
function ptDraw(c,w,h,state,game,s,view,time){const page=ptPage(state.round||0),{land,season}=page,T=ptTerra(land),m=ptMap(w,h),b=game.board||(game.board={}),dark=ptDark(view.decor);
 const o={dark,reduced:!!s.reduced,plain:!!s.plainScene,w,h,m,season,land,sky:T.zones[0].poly},picks=view.picks||[],pend=time!=null?view.pendingZone:null,final=time!=null&&!!view.final;
 if(b.ptPage!==state.round){b.ptPage=state.round;b.ptDone={};b.ptSnap=null;}
 if(b.clock===undefined)b.clock=0;for(const z of picks)if(b.ptDone[z]==null)b.ptDone[z]=b.clock-PT_STEP;if(pend&&b.ptDone[pend]==null)b.ptDone[pend]=b.clock-time;
 const turn=final?Math.max(0,(time-(PT_FINAL-PT_TURN))/PT_TURN):0;
 if(turn>0&&b.ptSnap){ptTurn(c,w,h,state,view,s,b,Math.min(1,turn),m,o);return;}
 const prog=ptProgress(T,picks,pend,time,o.reduced),moving=pend!=null&&time<PT_PAINT*(o.reduced?1.4:1)+.3;
 ptWashes(c,w,h,T,land,season,prog,view.decor,m,o.plain,moving&&!o.reduced,b.clock);
 ptInk(c,w,h,T,land,m,dark);
 ptLife(c,T,land,season,prog,b,view,m,o);
 if(final){const u=Math.max(0,Math.min(1,(time-PT_PAINT*.75)/(PT_FINAL-PT_TURN-PT_PAINT*.75)));if(u>0)ptFinal(c,land,season,T.anchors,b.clock,u,o);}
 if(time==null)ptVeilRing(c,w,h,T,m,prog,view,dark);
 else if(pend&&!o.reduced)ptBrush(c,w,h,T,m,pend,time,season,land,dark);
 // the finished page is snapped at the end of the frame just before the turn (the turn then slides this picture away)
 if(final&&time>=PT_FINAL-PT_TURN-.2&&!b.ptSnap)b.ptSnap=ptSnapshot(c)||false;}
