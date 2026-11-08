// El taller de vehicles (EN07, 0.53): the board of the scanning. The bench with the chassis fills the screen and the tray of pieces is the
// row of zones at the bottom (one per piece offered, left to right); vehicles-3d.js renders the picture and this module draws the
// highlight of the focus over it (tlRing, as every board), the veil of the wait and, while the finished vehicle waits for the press that
// starts it, a breathing ring round the vehicle. Without WebGL (old devices, the tests) a flat bench is drawn instead with the same layout.
import {TL_STRIP,TL_DIM,tlRound,tlRing} from './tauler.js';
import {VH_PALETTE,VH_BODY_COLOR,VH_SNAP,vhRoundOf,vhPicks,vhStageKind,vhTimeline,vhPhase,vhColorOf,vhHex,vhSurprise,vhClamp,vhEase,vhOut,vhSettle,vhPathOf} from './vehicles.js';
import {vhRender,vhVehicleRect} from './vehicles-3d.js';
export const VH_TRAY_MIN=104,VH_TRAY_MAX=264;
// The geometry of the screen (CSS pixels): the bench panel above, the tray at the bottom over the strip of the commands.
export function vhGeom(w,h,preview=false){const strip=preview?0:TL_STRIP,trayH=preview?h*.27:Math.max(VH_TRAY_MIN,Math.min(VH_TRAY_MAX,h*.28)),m=Math.max(8,Math.min(w,h)*.016);
 const panel={x:0,y:0,w,h:Math.max(40,h-strip-trayH)},tray={x:m,y:h-strip-trayH+m*.4,w:w-2*m,h:trayH-m*1.4};return {w,h,m,strip,panel,tray,preview};}
// The cells of the tray, one per piece, left to right; wider than tall, never wider than 1.7 times their height.
export function vhSlots(G,n){const gap=Math.max(10,G.w*.018),pad=G.tray.h*.09,slotH=G.tray.h-2*pad,slotW=Math.min((G.tray.w-gap*(n+1))/n,slotH*1.7),total=n*slotW+(n-1)*gap,x0=G.tray.x+(G.tray.w-total)/2,y=G.tray.y+pad,r=Math.min(20,slotH*.14);
 return Array.from({length:n},(_,i)=>{const x=x0+i*(slotW+gap);return {x,y,w:slotW,h:slotH,kind:'panel',radius:r,pts:tlRound(x,y,slotW,slotH,r)};});}
export function vhLayout(state,options,w,h){const G=vhGeom(w,h,false);return vhSlots(G,Math.max(1,options.length)).map((z,i)=>({...z,zone:options[i]?.value??options[i]?.id??options[i]}));}
const vhDpr=c=>{const m=c.getTransform&&c.getTransform();return m&&m.a?m.a:1;};
const VH_TAU=Math.PI*2;
// The common part of the view handed to the renderer.
function vhView(c,G,state,s,view,extra){const R=vhRoundOf(G.preview?0:state?.round|0);return {w:G.w,h:G.h,dpr:vhDpr(c),light:R.light,corner:R.corner,decor:view.decor,t:view.clock||0,reduced:!!s?.reduced,quality:s?.vhQuality||'auto',surprise:vhSurprise(s),camera:s?.vhCamera||'dinamica',...extra};}
// ── the board at rest: the chassis on the bench and the pieces of the moment in the tray ─────────────────────────────────────────
export function vhBoard(c,w,h,state,game,s,view){const preview=!!view.preview,G=vhGeom(w,h,preview),options=preview?['familiar','furgoneta','autobus']:(view.options||[]).map(o=>o?.value??o?.id??o),zones=preview?vhSlots(G,3):(view.zones||vhSlots(G,Math.max(1,options.length)));
 const P=preview?{body:null,wheels:null,top:null,color:null}:vhPicks(state,s),kind=preview?'body':vhStageKind(state,s);
 const v=vhView(c,G,state,s,view,{phase:'choose',picks:P,kind,options,lights:preview?options.map(()=>1):view.lights,tray:{...G.tray,cells:zones}});
 const drawn=preview?false:vhRender(c,v);if(!drawn)vhFlat(c,G,v);
 if(!preview)vhVeilRing(c,G,view,v);}
// ── the result of a pick ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// A step: the piece flies from its cell and clicks on the chassis (VH_SNAP). The last pick: the piece clicks on, the vehicle waits for the
// press (a breathing ring round it), rolls down the ramp and round the room with the gag of its accessory, and parks in the garage;
// then the bench comes back with a bare chassis for the next round.
export function vhResult(c,w,h,state,game,s,view,time){const G=vhGeom(w,h,false),kind=vhStageKind(state,s),id=view.pendingId,final=!!view.final,options=(view.options||[]).map(o=>o?.value??o?.id??o),zones=view.zones||vhSlots(G,Math.max(1,options.length)),chosen=Math.max(0,view.chosen??options.indexOf(id));
 const placed=vhPicks(state,s),full=vhPicks(state,s,id),base={options,lights:options.map((_,i)=>i===chosen?1:TL_DIM),tray:{...G.tray,cells:zones}};
 let v;if(!final){v=vhView(c,G,state,s,view,{...base,phase:'snap',picks:placed,kind,pending:{kind,id,index:chosen,u:vhClamp(time/VH_SNAP)}});}
 else{const TL=vhTimeline(s,game?.vhGo??null),ph=vhPhase(TL,time);
  if(ph.phase==='snap')v=vhView(c,G,state,s,view,{...base,phase:'snap',picks:placed,kind,pending:{kind,id,index:chosen,u:ph.u}});
  else if(ph.phase==='wait')v=vhView(c,G,state,s,view,{...base,phase:'wait',picks:full,kind,waitU:ph.u});
  else if(ph.phase==='ride')v=vhView(c,G,state,s,view,{...base,phase:'ride',picks:full,kind,ride:{u:ph.u,roll:full.wheels||'tacs',camera:s?.vhCamera||'dinamica'}});
  else v=vhView(c,G,state,s,view,{...base,phase:'park',picks:full,kind,park:{u:ph.u}});}
 const drawn=vhRender(c,v);if(!drawn)vhFlat(c,G,v);
 // the invitation to press: a ring round the finished vehicle that breathes slowly (never faster than one breath a second)
 if(v.phase==='wait'&&s?.vhGo!=='auto'){const rect=drawn?vhVehicleRect(v):vhFlatCarRect(G),t=view.clock||0;if(rect){const pad=Math.max(14,G.w*.012),a=.62+.38*Math.sin(t*VH_TAU*.7),pts=tlRound(rect.x-pad,rect.y-pad,rect.w+2*pad,rect.h+2*pad,Math.min(34,rect.h*.3));tlRing(c,pts,null,vhClamp(v.waitU*4)*a,Math.max(.6,Math.min(1.2,G.w/1280)),{...(view.ring||{}),frame:'whole',fill:'none'});}}}
// The veil of the wait (the scanning not yet started) and the ring of the focus on its cell; in mode sorpresa there is no focus to mark.
function vhVeilRing(c,G,view,v){const wait=view.wait??(view.waiting?1:0);if(wait>0){c.save();c.fillStyle=`rgba(10,8,16,${(.34*wait).toFixed(3)})`;c.fillRect(0,0,G.w,G.h);c.restore();}
 if(v.surprise)return;const f=view.focus??-1,zones=view.zones||[];if(f>=0&&zones[f]&&!view.waiting)tlRing(c,zones[f].pts,view.progress,1,Math.max(.6,Math.min(1.2,G.w/1280)),view.ring);}
// ── the flat bench (no WebGL) ────────────────────────────────────────────────────────────────────────────────────────────────────
const vhHx=vhHex;
function vhRR(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));c.fillStyle=fill;c.fill();}
function vhMix(a,b,k){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),ch=s=>Math.round(((A>>s)&255)*(1-k)+((B>>s)&255)*k);return '#'+[16,8,0].map(s=>ch(s).toString(16).padStart(2,'0')).join('');}
function vhFlatCarRect(G){const k=Math.min(G.panel.w/900,G.panel.h/520);return {x:G.w/2-20*k*3.2,y:G.panel.y+G.panel.h*.62-22*k*3.2,w:40*k*3.2,h:24*k*3.2};}
// The bench seen from the front: a wall, the bench and a side view of the toy; the cells of the tray with a glyph of each piece.
function vhFlat(c,G,v){const d=v.decor||{fade:1,base:'#000000',white:false},wall=vhMix(vhHx(VH_PALETTE.paret),d.base,1-d.fade);c.fillStyle=d.fade>0?wall:d.base;c.fillRect(0,0,G.w,G.h);
 const k=Math.min(G.panel.w/900,G.panel.h/520),by=G.panel.y+G.panel.h*.62;
 if(d.fade>0){c.save();c.globalAlpha=d.fade;for(const [x,r,col] of [[.2,.14,VH_PALETTE.menta],[.7,.2,0x8fdcc4],[.5,.09,0x9fe3cd]]){c.fillStyle=vhHx(col);c.beginPath();c.arc(G.w*x,by-80*k,G.w*r,0,VH_TAU);c.fill();}c.restore();}
 vhRR(c,G.w/2-430*k,by-6*k,860*k,G.panel.h-by+G.panel.y+40*k,16*k,vhHx(VH_PALETTE.verd));vhRR(c,G.w/2-410*k,by-2*k,820*k,30*k,10*k,vhHx(VH_PALETTE.crema));
 const P=v.picks||{},ride=v.phase==='ride'?v.ride.u:0,park=v.phase==='park'?v.park.u:0;let cx=G.w/2,cy=by,kk=k*3.2;
 if(v.phase==='ride'){const u=ride;cx=G.w/2+Math.sin(u*VH_TAU)*G.w*.3;cy=by+vhEase(vhClamp(u*3))*G.panel.h*.25;}if(v.phase==='park'){cx=G.w/2-G.w*.36*vhOut(vhClamp(park/.5));cy=by+G.panel.h*.25;}
 vhFlatCar(c,cx,cy,kk,P,v.pending,v.t||0,v.phase==='ride'?ride:0);
 if(v.tray&&(v.phase==='choose'||v.phase==='snap')){const T=v.tray;vhRR(c,T.x,T.y,T.w,T.h,Math.min(26,T.h*.12),vhHx(VH_PALETTE.verd));(T.cells||[]).forEach((cell,i)=>{const light=v.lights?.[i]??1,kq=vhClamp((light-TL_DIM)/(1-TL_DIM));vhRR(c,cell.x,cell.y,cell.w,cell.h,Math.min(18,cell.h*.1),vhMix(vhHx(VH_PALETTE.crema),d.white?'#ffffff':'#2a2f45',(1-kq)*(v.surprise?0:.16)));
  const id=(v.options||[])[i];if(id===undefined||(v.pending&&(v.pending.index|0)===i))return;vhFlatGlyph(c,v.kind,id,cell.x+cell.w/2,cell.y+cell.h/2-(4+kq*6),Math.min(cell.w/44,cell.h/30));});}}
// A side view of the vehicle: the chassis, the body in its colour, two wheels, the accessory (the pending piece arrives from above).
function vhFlatCar(c,x,y,k,P,pend,t,ride){const color=vhHx(VH_PALETTE[vhColorOf(P)]);c.save();c.translate(x,y);c.scale(k,k);
 vhRR(c,-15,-6.8,30,3.2,1.4,vhHx(VH_PALETTE.gris));for(const px of[-11,11])vhRR(c,px-2.3,-9,4.6,2.4,1,vhHx(VH_PALETTE.gris));
 const body=P.body||(pend?.kind==='body'?pend.id:null),bu=pend?.kind==='body'?vhSettle(vhClamp((pend.u-.6)/.4),1.6):1,lift=pend?.kind==='body'?(1-vhEase(vhClamp(pend.u/.65)))*40:0;
 if(body){c.save();c.translate(0,-9-lift-(1-bu)*2);vhFlatBody(c,body,color);c.restore();}
 const wheels=P.wheels||(pend?.kind==='wheels'?pend.id:null),wl=pend?.kind==='wheels'?(1-vhEase(vhClamp(pend.u/.65)))*40:0;
 if(wheels){const r=wheels==='primes'?3.3:3.5,ang=ride*60;for(const px of[-11,11]){c.save();c.translate(px,-5.2-wl);c.rotate(ang);c.fillStyle=wheels==='fusta'?vhHx(VH_PALETTE.fusta):vhHx(VH_PALETTE.marina);c.beginPath();c.arc(0,0,r,0,VH_TAU);c.fill();c.fillStyle=vhHx(wheels==='primes'?VH_PALETTE.corall:wheels==='fusta'?VH_PALETTE.verd:VH_PALETTE.groc);c.beginPath();c.arc(0,0,r*.55,0,VH_TAU);c.fill();c.fillStyle='rgba(0,0,0,.25)';c.fillRect(-r*.5,-.5,r,1);c.restore();}}
 const top=P.top||(pend?.kind==='top'?pend.id:null),tl=pend?.kind==='top'?(1-vhEase(vhClamp(pend.u/.65)))*40:0;
 if(top&&body){c.save();c.translate(0,-9-tl);vhFlatTop(c,top,body);c.restore();}
 if(pend?.kind==='color'){const u=pend.u,col=vhHx(VH_PALETTE[pend.id]||VH_PALETTE.blau);c.save();c.translate(0,-30-(1-vhEase(vhClamp(u/.45)))*30);c.rotate(vhEase(vhClamp((u-.4)/.25))*1.9);vhRR(c,-4.6,-7.5,9.2,7.5,1.5,vhHx(VH_PALETTE.crema));vhRR(c,-4.7,-4,9.4,2.2,.8,col);c.restore();}
 c.restore();}
function vhFlatBody(c,kind,color){c.fillStyle=color;c.beginPath();if(kind==='autobus'){c.roundRect(-18,-15.8,36,15.8,[3,3,1,1]);}else if(kind==='furgoneta'){c.moveTo(-17,0);c.lineTo(-17,-15.2);c.lineTo(11,-15.2);c.quadraticCurveTo(16,-15,17.4,-3);c.lineTo(17.4,0);c.closePath();}else if(kind==='curses'){c.moveTo(-18.4,0);c.lineTo(-18.4,-7.2);c.lineTo(-13,-7.2);c.lineTo(-8,-10.6);c.lineTo(-3,-10.6);c.lineTo(4.5,-5.6);c.lineTo(12,-5.4);c.quadraticCurveTo(19,-5,19,0);c.closePath();}else{c.moveTo(-18.4,0);c.lineTo(-18.4,-7.5);c.quadraticCurveTo(-17.6,-13.4,-11,-13.6);c.lineTo(0,-13.6);c.quadraticCurveTo(5,-13.4,7.5,-7.4);c.lineTo(13.5,-6.8);c.quadraticCurveTo(17.2,-6,17.2,0);c.closePath();}c.fill();
 c.fillStyle=vhHx(VH_PALETTE.marina);c.beginPath();if(kind==='autobus'){for(let i=0;i<3;i++)c.roundRect(2-i*8,-13.4,6,4.6,1.3);c.roundRect(11,-13.6,5.6,5,1);}else if(kind==='furgoneta')c.roundRect(5,-13.8,10,4.8,1.2);else if(kind==='curses')c.roundRect(-6,-9.5,9.4,3.1,.8);else c.roundRect(-14,-12.5,20,4.6,1.4);c.fill();
 vhRR(c,kind==='autobus'?17:kind==='curses'?17.8:16,-3,2.4,2.4,1.1,vhHx(VH_PALETTE.groc));}
function vhFlatTop(c,kind,body){const roof={familiar:[-5.5,13.6],autobus:[0,15.8],furgoneta:[-2,15.2],curses:[-5.5,10.6]}[body]||[0,13];
 if(kind==='baca'){vhRR(c,roof[0]-10,-roof[1]-2.2,20,1.8,.9,vhHx(VH_PALETTE.verd));vhRR(c,roof[0]-6.5,-roof[1]-6.6,13,4.6,1.1,vhHx(VH_PALETTE.corall));}
 else if(kind==='remolc'){vhRR(c,-37,-6.2,16,2.6,1.2,vhHx(VH_PALETTE.gris));c.fillStyle=vhHx(VH_PALETTE.marina);c.beginPath();c.arc(-30,-3.4,3.1,0,VH_TAU);c.fill();vhRR(c,-35,-10.6,4.4,4.4,.9,vhHx(VH_PALETTE.corall));vhRR(c,-28.5,-10.6,4.4,4.4,.9,vhHx(VH_PALETTE.groc));vhRR(c,-32,-15,4.4,4.4,.9,vhHx(VH_PALETTE.blau));}
 else{vhRR(c,roof[0]-.6,-roof[1]-11,1.2,11,.5,vhHx(VH_PALETTE.crema));c.fillStyle=vhHx(VH_PALETTE.corall);c.beginPath();c.moveTo(roof[0]+.5,-roof[1]-10.8);c.lineTo(roof[0]+8,-roof[1]-9.2);c.lineTo(roof[0]+.5,-roof[1]-6.6);c.closePath();c.fill();}}
function vhFlatGlyph(c,kind,id,x,y,k){c.save();c.translate(x,y);c.scale(k,k);if(kind==='body'){c.translate(0,7);vhFlatBody(c,id,vhHx(VH_PALETTE[VH_BODY_COLOR[id]||'blau']));}
 else if(kind==='wheels'){const r=id==='primes'?3.3:3.5;for(const px of[-7,7]){c.fillStyle=id==='fusta'?vhHx(VH_PALETTE.fusta):vhHx(VH_PALETTE.marina);c.beginPath();c.arc(px,0,r*1.6,0,VH_TAU);c.fill();c.fillStyle=vhHx(id==='primes'?VH_PALETTE.corall:id==='fusta'?VH_PALETTE.verd:VH_PALETTE.groc);c.beginPath();c.arc(px,0,r*.9,0,VH_TAU);c.fill();}}
 else if(kind==='top'){c.scale(1.4,1.4);c.translate(id==='remolc'?22:0,id==='bandera'?9:5);vhFlatTop(c,id,'familiar');}
 else{c.scale(1.4,1.4);vhRR(c,-4.6,-4,9.2,7.5,1.5,vhHx(VH_PALETTE.crema));vhRR(c,-4.7,-1,9.4,2.2,.8,vhHx(VH_PALETTE[id]||VH_PALETTE.blau));vhRR(c,-4.2,-5,8.4,1,.5,vhHx(VH_PALETTE[id]||VH_PALETTE.blau));}c.restore();}
