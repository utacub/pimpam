import {escDecor,escVeil} from './escenari.js';
import {TL_DIM,tlRing,tlOpenBox,tlClipOpen,tlGrain} from './tauler.js';
import {scanRing} from './input.js';
import {pdMedia} from './persona-dades.js';
import {PS_TEMPLATES,psAct,psDarkOf,psLayout,psMediaOf,psOptions,psTileStep} from './persona.js';

// ---------- Activitats personalitzades (0.44): the drawing ----------
// The photos and videos of the family fill the screen: whole (with the same picture, blurred and darker, all around it) or cropped to
// fill it, as the activity asks. «Decorat atenuat» and «Sense decorat» veil that blurred picture, the theatre of Qui s’amaga? and the
// background of the boards towards the base colour; the photos themselves are never veiled. With «Moviment reduït» the entrances are
// a plain fade and nothing zooms.
const psClamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const psEase=u=>{u=psClamp(u);return u*u*(3-2*u);};
const psBack=u=>{u=psClamp(u)-1;return 1+2.2*u*u*u+1.2*u*u;};
function psSrc(h){if(!h||h.failed)return null;if(h.bmp)return h.bmp;if(h.el&&h.el.readyState>=2&&h.el.videoWidth)return h.el;return null;}
const psDims=src=>src?[src.videoWidth||src.width,src.videoHeight||src.height]:[1,1];
// a picture in a box: contain or cover, with a zoom k around its centre
function psDraw(c,src,x,y,w,h,fit,k=1,ox=0,oy=0){if(!src)return;const [sw,sh]=psDims(src),f=(fit==='cover'?Math.max(w/sw,h/sh):Math.min(w/sw,h/sh))*k,dw=sw*f,dh=sh*f;c.drawImage(src,x+(w-dw)/2+ox*w,y+(h-dh)/2+oy*h,dw,dh);}
// the blurred copy behind a whole picture: a tiny copy scaled up (videos refresh it every few frames)
const PS_BLUR=new WeakMap();let psFrame=0;
function psBlur(h){const src=psSrc(h);if(!src||typeof document==='undefined')return null;let b=PS_BLUR.get(h);const video=!h.bmp;if(!b){const cv=document.createElement('canvas');cv.width=48;cv.height=27;b={cv,at:-99};PS_BLUR.set(h,b);}
 if(b.at<0||video&&psFrame-b.at>8){const g=b.cv.getContext('2d');g.filter='blur(2px)';const [sw,sh]=psDims(src),f=Math.max(48/sw,27/sh);g.drawImage(src,(48-sw*f)/2,(27-sh*f)/2,sw*f,sh*f);b.at=psFrame;}return b.cv;}
function psBackdrop(c,w,h,hd,d){if(d.fade<=0||!hd){c.fillStyle=d.base;c.fillRect(0,0,w,h);return;}const b=psBlur(hd);if(!b){c.fillStyle='#14121f';c.fillRect(0,0,w,h);}else{c.save();c.imageSmoothingEnabled=true;c.drawImage(b,-w*.05,-h*.05,w*1.1,h*1.1);c.fillStyle='rgba(8,6,18,.42)';c.fillRect(0,0,w,h);c.restore();}escVeil(c,d,0,0,w,h);}
// one element on the whole stage: the backdrop and the picture, with a slow zoom while it is shown
function psStage(c,w,h,P,i,d,s,k=1){const it=P.act.items[i],hd=it&&psMediaOf(P,it.media),src=psSrc(hd);if(P.act.fit!=='cover')psBackdrop(c,w,h,hd,d);else{c.fillStyle=d.base;c.fillRect(0,0,w,h);}if(src)psDraw(c,src,0,0,w,h,P.act.fit,k);}
const psZoom=(P,s,t,show)=>s.reduced?1:1+.045*psEase(Math.min(1,t/Math.max(1,show)));
export function psRender(c,w,h,id,game,s,preview=false){psFrame++;const P=game?.persona,d=escDecor({background:s.background,base:s.base,opacity:s.opacity,preview});
 if(preview||!P||P.act.id!==id){psPreviewDraw(c,w,h,id);return;}
 c.save();if(P.tpl==='tria'||P.tpl==='troba')psBoard(c,w,h,P,game,s,d);else if(P.tpl==='pas')psPas(c,w,h,P,s,d);else if(P.tpl==='moment')psMoment(c,w,h,P,s,d);else if(P.tpl==='video')psStage(c,w,h,P,P.cur<0?0:P.cur,d,s,1);else psAlbum(c,w,h,P,s,d);c.restore();
 // Vídeo a poc a poc (0.46) always darkens at its pauses, as much as the activity says; the others follow «Escena aturada i enfosquida»
 if(P.tpl==='video'){if(P.dark>0){c.fillStyle=`rgba(0,0,0,${(psDarkOf(P.act)*psEase(P.dark)).toFixed(3)})`;c.fillRect(0,0,w,h);}}
 else if(P.tpl!=='tria'&&P.tpl!=='troba'&&P.dark>0&&s.waitCue!==false){c.fillStyle=`rgba(0,0,0,${(.6*psEase(P.dark)).toFixed(3)})`;c.fillRect(0,0,w,h);}}

// ---------- Àlbum de sorpreses: six entrances in turn ----------
function psAlbum(c,w,h,P,s,d){if(P.cur<0){const it=P.act.items[0],hd=it&&psMediaOf(P,it.media);psBackdrop(c,w,h,hd,{...d,fade:d.fade*.8});return;}
 const t=P.phase==='show'?P.t:P.show,u=Math.min(1,t/1.1),k=psZoom(P,s,t,P.show);
 if(u>=1){psStage(c,w,h,P,P.cur,d,s,k);return;}
 if(P.prev>=0)psStage(c,w,h,P,P.prev,d,s,psZoom(P,s,1e9,1));else{c.fillStyle=d.base;c.fillRect(0,0,w,h);}
 const e=psEase(u),draw=()=>psStage(c,w,h,P,P.cur,d,s,k);c.save();
 if(s.reduced){c.globalAlpha=e;draw();}
 else if(P.trans===0){c.beginPath();c.arc(w/2,h/2,Math.hypot(w,h)/2*e,0,Math.PI*2);c.clip();draw();c.restore();c.save();c.strokeStyle=`rgba(255,255,255,${.5*(1-e)})`;c.lineWidth=6;c.beginPath();c.arc(w/2,h/2,Math.hypot(w,h)/2*e,0,Math.PI*2);c.stroke();}
 else if(P.trans===1){draw();if(P.prev>=0)for(const side of [-1,1]){c.save();c.beginPath();c.rect(side<0?0:w/2,0,w/2,h);c.clip();c.translate(side*e*w/2,0);psStage(c,w,h,P,P.prev,d,s,1.045);c.restore();}}
 else if(P.trans===2){const sy=Math.max(.001,psBack(u));c.translate(0,h/2);c.scale(1,sy);c.translate(0,-h/2);c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=30;draw();}
 else if(P.trans===3){c.translate((1-psBack(u))*w,0);c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=40;c.shadowOffsetX=-12;draw();}
 else if(P.trans===4){const cols=8,rows=5,cw=w/cols,ch=h/rows;for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){const dist=Math.hypot(q+.5-cols/2,(r+.5-rows/2)*1.4)/5.2,v=psEase((u-dist*.55)/.45);if(v<=0)continue;c.save();const cx=(q+.5)*cw,cy=(r+.5)*ch;c.beginPath();c.rect(cx-cw/2*v-.5,cy-ch/2*v-.5,cw*v+1,ch*v+1);c.clip();draw();c.restore();}}
 else{const n=6,sw=w/n;for(let i=0;i<n;i++){const v=psEase((u-i*.07)/.6);if(v<=0)continue;c.save();c.beginPath();c.rect(i*sw+sw/2*(1-v),0,sw*v+1,h);c.clip();draw();c.restore();}}
 c.restore();}

// ---------- Descobreix pas a pas: paper pieces over the element ----------
function psTile(c,x,y,w,h,col,fold,lw){c.fillStyle=col;c.fillRect(x,y,w,h);const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'rgba(255,255,255,.22)');g.addColorStop(.55,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.18)');c.fillStyle=g;c.fillRect(x,y,w,h);
 const f=Math.min(w,h)*(.18+.12*fold);c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.moveTo(x+w-f,y);c.lineTo(x+w,y+f);c.lineTo(x+w-f,y+f);c.closePath();c.fill();c.strokeStyle='#16142a';c.lineWidth=lw;c.strokeRect(x+lw/2,y+lw/2,w-lw,h-lw);}
function psPas(c,w,h,P,s,d){const N=[3,5,7].includes(s.steps)?s.steps:5,showing=P.phase==='show'||P.phase==='rest',under=P.phase==='enter'&&P.t<.9&&P.prev>=0?P.prev:P.cur;
 psStage(c,w,h,P,under,d,s,showing?psZoom(P,s,P.phase==='show'?P.t:P.show,P.show):1);if(!P.tiles)return;
 const cw=w/P.cols,ch=h/P.rows,lw=Math.max(2,Math.min(w,h)*.005);
 for(const T of P.tiles){const step=psTileStep(T,N);let x=T.c*cw,y=T.r*ch,a=1,rot=0,sc=1;
  if(P.phase==='enter'){const v=psEase((P.t-T.rank*.04)/.5);if(v<=0)continue;y-= (1-v)*(h*.9+ch);}
  else if(step<P.done||step===P.done&&!(P.phase==='step'||P.phase==='show')&&P.t>1.25)continue;
  else if(step===P.done&&(P.phase==='step'||P.phase==='show'||P.phase==='rest')){const v=psClamp((P.t-(T.rank%4)*.05)/1.05);if(v>=1||P.phase==='rest')continue;if(s.reduced){a=1-v;}else{sc=1+.08*Math.sin(Math.min(1,v*3)*Math.PI/2);y+=v*v*h*.95;x+=T.dx*v*cw;rot=T.spin*v;a=1-psClamp((v-.6)/.4);}}
  if(P.phase==='rest')continue;c.save();c.globalAlpha=a;c.translate(x+cw/2,y+ch/2);c.rotate(rot);c.scale(sc,sc);psTile(c,-cw/2-.5,-ch/2-.5,cw+1,ch+1,T.color,T.fold,lw);c.restore();}}

// ---------- Qui s’amaga?: the theatre, the curtains and the knock ----------
function psCurtain(c,x,y,w,h,side,sway){if(w<=1)return;c.save();c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);const bx=side<0?x+w:x;
 c.lineTo(x+w+(side<0?sway:0),y+h);c.lineTo(x+(side>0?sway:0),y+h);c.closePath();const g=c.createLinearGradient(x,0,x+w,0),folds=Math.max(2,Math.round(w/70));for(let i=0;i<=folds*2;i++){const v=i/(folds*2);g.addColorStop(v,i%2?'#7d1730':'#a52645');}
 c.fillStyle=g;c.fill();c.strokeStyle='#2a0812';c.lineWidth=4;c.stroke();c.fillStyle='rgba(0,0,0,.18)';c.fillRect(bx-(side<0?10:0),y,10,h);c.restore();}
function psMoment(c,w,h,P,s,d){const phase=P.phase,t=P.t;let open=phase==='open'?psEase(t/1.3):phase==='show'?1:phase==='close'?1-psEase(t/1.3):0;
 // the back wall and the frame of the little theatre (the decor), and behind the curtains the element when they open
 c.fillStyle='#24152b';c.fillRect(0,0,w,h);const g=c.createRadialGradient(w/2,h*.6,h*.1,w/2,h*.6,h);g.addColorStop(0,'#4a2a3e');g.addColorStop(1,'#140b18');c.fillStyle=g;c.fillRect(0,0,w,h);escVeil(c,d,0,0,w,h);
 const top=h*.09;if(open>0){const i=P.cur>=0?P.cur:0;c.save();c.beginPath();c.rect(0,top,w,h-top);c.clip();c.globalAlpha=psClamp(open*1.6);psStage(c,w,h,P,i,d,s,psZoom(P,s,phase==='show'?t:0,P.show||6));c.restore();}
 const knock=phase==='knock',kt=knock?t%3.2:9,shake=knock&&!s.reduced?Math.sin(kt*38)*Math.exp(-kt*3)*w*.006:0,peek=knock?.04*psEase(Math.min(1,t/.8)):0,gath=w*.07;
 if(knock){const lg=c.createLinearGradient(0,h*.86,0,h);lg.addColorStop(0,'rgba(255,214,140,0)');lg.addColorStop(1,`rgba(255,214,140,${(.35+.15*Math.sin(t*2)).toFixed(3)})`);c.fillStyle=lg;c.fillRect(w*.3,h*.86,w*.4,h*.14);}
 const half=w/2,lw=gath+(half-gath)*(1-open);psCurtain(c,0,top,lw-peek*w*.5+shake,h-top,-1,0);psCurtain(c,w-lw+peek*w*.5+shake,top,lw-peek*w*.5-shake,h-top,1,0);
 // the valance with its golden fringe
 c.fillStyle='#6b1229';c.fillRect(0,0,w,top);c.fillStyle='#e0b04a';c.fillRect(0,top-5,w,5);c.strokeStyle='#2a0812';c.lineWidth=4;c.strokeRect(-2,-2,w+4,top+2);
 c.fillStyle='#e0b04a';const n=Math.round(w/26);for(let i=0;i<n;i++){c.beginPath();c.arc((i+.5)*w/n,top+2,w/n*.28,0,Math.PI);c.fill();}}

// ---------- The boards of Tria i mira and Escolta i troba ----------
function psBoardBack(c,w,h,d){if(d.fade<=0){c.fillStyle=d.base;c.fillRect(0,0,w,h);return;}const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#1d2350');g.addColorStop(.55,'#2f2160');g.addColorStop(1,'#1a3a55');c.fillStyle=g;c.fillRect(0,0,w,h);tlGrain(c,0,0,w,h,.12);escVeil(c,d,0,0,w,h);}
function psZone(c,z,P,i,light,scale=1,rot=0){const it=P.act.items[i],hd=it&&psMediaOf(P,it.media),src=psSrc(hd),bw=Math.max(4,z.w*.022);c.save();c.translate(z.x+z.w/2,z.y+z.h/2);c.rotate(rot);c.scale(scale,scale);c.translate(-z.w/2,-z.h/2);
 const box={x:0,y:0,w:z.w,h:z.h,r:z.radius,u:0};c.fillStyle='#fffaf0';c.save();tlClipOpen(c,z,box);c.fillRect(0,0,z.w,z.h);c.restore();const inner={x:bw,y:bw,w:z.w-2*bw,h:z.h-2*bw,r:Math.max(4,z.radius-bw),u:0};c.save();tlClipOpen(c,z,inner);c.fillStyle='#222';c.fillRect(inner.x,inner.y,inner.w,inner.h);if(src)psDraw(c,src,inner.x,inner.y,inner.w,inner.h,'cover');
 const dim=psClamp((1-light)/(1-TL_DIM))*.55;if(dim>0){c.fillStyle=`rgba(6,4,16,${dim.toFixed(3)})`;c.fillRect(0,0,z.w,z.h);}c.restore();c.beginPath();c.roundRect?.(0,0,z.w,z.h,z.radius);c.strokeStyle='#120f22';c.lineWidth=Math.max(2,bw*.5);c.stroke();c.restore();}
function psBoard(c,w,h,P,game,s,d){const state=game.scanState,b=game.board||{},options=psOptions(state.status==='done'?{...state,status:'choose'}:state,s),zones=psLayout(options.length,w,h),pending=state.pending,t=game.time;psBoardBack(c,w,h,d);
 const chosen=pending?options.findIndex(o=>o.id===pending.option?.id):-1,ring=scanRing(s),sc=Math.max(.6,Math.min(1.2,w/1280));
 if(t!==null&&t!==undefined&&pending&&pending.correct!==false&&chosen>=0){const z=zones[chosen],dur=game.duration||6,open=Math.min(t,dur-t)/.9,i=pending.option.value;
  if(open>=1){psStage(c,w,h,P,i,d,s,psZoom(P,s,t,dur));return;}
  options.forEach((o,k)=>{if(k!==chosen)psZone(c,zones[k],P,o.value,TL_DIM);});const box=tlOpenBox(z,w,h,psClamp(open)*1);c.save();tlClipOpen(c,z,box);c.fillStyle=d.base;c.fillRect(box.x,box.y,box.w,box.h);const it=P.act.items[i],src=psSrc(it&&psMediaOf(P,it.media));if(src)psDraw(c,src,box.x,box.y,box.w,box.h,box.u>.9?P.act.fit:'cover');c.restore();return;}
 const lights=b.lights&&b.lights.length===zones.length?b.lights:zones.map(()=>1);
 options.forEach((o,k)=>{let scale=1,rot=0;if(t!==null&&t!==undefined&&pending&&k===chosen&&!s.reduced)rot=Math.sin(t*14)*Math.exp(-t*2.2)*.035;if(b.sounding===k&&!s.reduced)scale=1+.012*Math.sin((b.clock||0)*9);psZone(c,zones[k],P,o.value,t!==null&&t!==undefined?(k===chosen?1:TL_DIM):lights[k],scale,rot);});
 const waiting=!state.armed&&state.status!=='done'&&s.waitCue!==false,wait=b.wait??(waiting?1:0);
 if(wait>0){c.fillStyle=`rgba(0,0,0,${(.6*psEase(wait)).toFixed(3)})`;c.fillRect(0,0,w,h);}
 const f=b.focus??-1;if(f>=0&&zones[f]&&!waiting&&(t===null||t===undefined))tlRing(c,zones[f].pts,b.progress??null,1,sc,ring);}

// ---------- The cards of the menu: the first pictures of the activity ----------
const PS_THUMBS=new Map();
function psThumb(id){if(!id)return null;let x=PS_THUMBS.get(id);if(x)return x;x={bmp:null,wait:[]};PS_THUMBS.set(id,x);pdMedia(id).then(m=>m?.thumb?createImageBitmap(m.thumb):null).then(b=>{x.bmp=b;for(const f of x.wait)f();x.wait=[];}).catch(()=>{});return x;}
export function psForgetThumbs(){PS_THUMBS.clear();}
function psPreviewDraw(c,w,h,id){const a=psAct(id),tw=c.canvas;c.fillStyle='#1d2350';c.fillRect(0,0,w,h);if(!a)return;const ids=a.items.slice(0,PS_TEMPLATES[a.tpl]?.type==='scan'?4:1).map(it=>it.media),cells=ids.length>1?psLayout(ids.length,w,h+66).map(z=>z):[{x:0,y:0,w,h,radius:0}];
 let missing=false;ids.forEach((mid,i)=>{const th=psThumb(mid);if(!th?.bmp){missing=true;th?.wait.push(()=>{if(tw.isConnected)tw.dispatchEvent(new Event('ps-thumb'));});return;}const z=cells[i];c.save();c.beginPath();if(ids.length>1)c.roundRect?.(z.x,z.y,z.w,z.h,10);else c.rect(0,0,w,h);c.clip();psDraw(c,th.bmp,z.x,z.y,z.w,z.h,'cover');c.restore();});
 if(a.tpl==='pas'&&!missing){const cw=w/4,ch=h/3;for(let i=0;i<12;i++)if(i%3!==1){c.fillStyle=['#f25c54','#ffd23f','#3bceac','#4d9de0','#e15a97'][i%5];c.globalAlpha=.92;c.fillRect((i%4)*cw,Math.floor(i/4)*ch,cw,ch);c.globalAlpha=1;c.strokeStyle='#16142a';c.lineWidth=2;c.strokeRect((i%4)*cw+1,Math.floor(i/4)*ch+1,cw-2,ch-2);}}
 if(a.tpl==='moment'&&!missing){psCurtain(c,0,0,w*.3,h,-1,0);psCurtain(c,w*.7,0,w*.3,h,1,0);}
 // the card of a Vídeo a poc a poc: the first frame, darkened, with the sign of a pause
 if(a.tpl==='video'&&!missing){c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,0,w,h);const r=Math.min(w,h)*.16,bw=r*.36;c.fillStyle='rgba(255,255,255,.88)';c.beginPath();c.roundRect?.(w/2-r*.62,h/2-r,bw,r*2,bw*.3);c.roundRect?.(w/2+r*.62-bw,h/2-r,bw,r*2,bw*.3);c.fill();}}
