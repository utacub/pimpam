// El vestidor fantàstic (EN06, 0.73): the pictures of the activity. The dressing room fills the screen (ChatGPT's illustration, CAM-1,
// with the wardrobe open while choosing, CAM-2): the artist on the rug, Pipa by the dressing table and, in the mirror, the reflection.
// To choose, the scene is dimmed and two to four big pieces, cut out with a white margin like a sheet of cut-outs, stand in a row from
// left to right (the zones of the scanning, with tlRing's highlight as every board); the one in focus swings a little. A pick: the
// piece flies onto the artist and its gag follows (vestidor-gags.js), Pipa copies it in small and the mirror plays its trick. The last
// pick: the dressing room is lifted like a set, the stage appears (ESC-1 with the backdrop of the body's costume, FONS-1..6, and the
// audience from behind), the artist comes in and does the number, bows with Pipa (every fourth show with the other three artists),
// the curtain closes (ESC-2) and the dressing room comes down again with the next artist. Without the decor only the figures, the pieces
// and the little things around them are drawn, on the base colour; dimmed, the decor goes under the veil of the base colour.
import {TL_STRIP,tlRound,tlRing} from './tauler.js';
import {escVeil} from './escenari.js';
import {VS_BOX,VS_PARROT} from './vestidor-dades.js';
import {VS_COSTUMES,VS_OBJECTS,VS_FLY,VS_STEP,VS_SLIP,VS_UP,VS_BOW,VS_ACTS,vsRoundOf,vsPicks,vsSlotOf,vsSlots,vsSlip,vsMirror,vsTimeline,vsNumber,vsBackdrop,vsCode,vsClamp,vsEase,vsOut,vsIn,vsPh,vsSettle,vsHash,VS_FACE} from './vestidor.js';
import {vsPic,vsWant,vsShare,vsNamesOf,VS_COMMON,VS_FOOT,VS_REL,VS_TOP,vsOutfit,vsPipaOutfit,vsFigure,vsT,vsDrawFigure,vsAt,vsDrawLayer,vsDrawPic,vsSticker,vsPieceNames,vsDevice} from './vestidor-motor.js';
import {vsState,vsGag,VS_GAG_LEN,vsPerform,vsGait,vsDrawFx,vsStar} from './vestidor-gags.js';
const VS_TAU2=Math.PI*2; // (VS_TAU is vestidor-gags.js's: every module shares one scope in the standalone file)
// ── the geometry of the screen (CSS pixels) ───────────────────────────────────────────────────────────────────────────────────────
// The illustrations (1536 × 1024) cover the screen; the figures are as big as the height allows (Hug, the tallest, 76% of it in the
// dressing room). bx, by: a point of the illustrations on the screen.
export function vsGeom(w,h,preview=false){const kb=Math.max(w/1536,h/1024),ox=(w-1536*kb)/2,oy=(h-1024*kb)/2,bx=x=>ox+x*kb,by=y=>oy+y*kb;
 const kCam=Math.min(h*.82/1186,w*.64/1186),kStage=Math.min(kb*.44,h*.6/1186);
 return {w,h,kb,ox,oy,bx,by,preview,kCam,kStage,strip:preview?0:TL_STRIP,
  cam:{x:bx(690),y:Math.min(by(905),h*.968)},pipa:{x:bx(1080),y:Math.min(by(968),h*.985)},stageY:by(842),pipaStageY:by(858)};}
// The cards of the choice, left to right across the middle of the screen, over the dimmed scene.
export function vsZones(G,n){const m=Math.max(16,G.w*.04),avail=Math.max(40,Math.min(G.h-G.strip-G.h*.05,G.h*.84)-G.h*.08),gap=Math.max(14,G.w*.028),zw=Math.min((G.w-2*m-(n-1)*gap)/n,avail*1.05),hh=Math.min(avail,zw*1.12),top=Math.max(G.h*.08,G.h*.46-hh/2),total=n*zw+(n-1)*gap,x0=(G.w-total)/2,r=Math.min(30,zw*.08);
 return Array.from({length:n},(_,i)=>{const x=x0+i*(zw+gap);return {x,y:top,w:zw,h:hh,kind:'panel',radius:r,pts:tlRound(x,top,zw,hh,r)};});}
export function vsLayout(state,options,w,h){const G=vsGeom(w,h,false);return vsZones(G,Math.max(1,options.length)).map((z,i)=>({...z,zone:options[i]?.value??options[i]?.id??options[i]}));}
// What the loading cover waits for: the dressing room, the stage, Pipa and the props, and the first two artists of the session.
export function vsLoad(s,round=0){const a=vsRoundOf(round,s).artist,b=vsRoundOf(round+1,s).artist;return vsShare([...VS_COMMON,...vsNamesOf(a),...vsNamesOf(b)]);}
const vsPrefetch=(s,round)=>{for(const r of [round,round+1])vsWant(vsNamesOf(vsRoundOf(r,s).artist));};
// ── the light of the show (afternoon, evening, opening night) ─────────────────────────────────────────────────────────────────────
const VS_TINT=Object.freeze({tarda:[255,176,96,.1],vespre:[120,78,170,.17],nit:[24,30,82,.3]});
function vsTint(c,G,light,k=1){const T=VS_TINT[light];if(!T||!(k>0))return;c.save();c.fillStyle=`rgba(${T[0]},${T[1]},${T[2]},${(T[3]*k).toFixed(3)})`;c.fillRect(0,0,G.w,G.h);c.restore();
 if(light!=='tarda'){const g=c.createRadialGradient(G.bx(1292),G.by(430),10,G.bx(1292),G.by(430),G.kb*300);g.addColorStop(0,`rgba(255,226,150,${(light==='nit'?.32:.2)*k})`);g.addColorStop(1,'rgba(255,226,150,0)');c.save();c.fillStyle=g;c.fillRect(0,0,G.w,G.h);c.restore();}}
// ── the figures on the screen ────────────────────────────────────────────────────────────────────────────────────────────────────
const fBox=(who,code)=>VS_BOX[`${who}-${code}`];
const FIG_H=who=>VS_FOOT[who][1]-VS_TOP[who];
// The points of a figure where the little things come from (in its drawing).
function vsPoint(who,at,P,S){const fb=fBox(who,'E1')||[400,400,200,200],base=fBox(who,'r')||[200,300,600,1000];
 if(at==='head'||at==='mouth')return [fb[0]+fb[2]/2,at==='mouth'?fb[1]+fb[3]*.8:fb[1]+fb[3]*.35];
 if(at==='snorkel'){const b=fBox(who,'31')||fb;return [b[0]+b[2]*.86,b[1]+8];}
 if(at==='hat'){const b=fBox(who,vsCode('cap',P.cap||'pastisser'))||fb;const sy=S.hat?.sy||1;return [b[0]+b[2]/2,b[1]+b[3]-b[3]*sy];}
 if(at==='hands')return [[base[0]+50,base[1]+base[3]*.5],[base[0]+base[2]-50,base[1]+base[3]*.5]];
 return [fb[0]+fb[2]/2,fb[1]];}
// Where the magic object floats by the artist's side in the rest pose (its picture is in Rita's drawing, held up: OBJ-1..6).
function vsObjSpot(who){const b=fBox(who,'r')||[200,300,600,1000];return [b[0]+b[2]+20,VS_TOP[who]+FIG_H(who)*.36];}
function vsObjFloat(c,who,T,id,o){const name='obj-'+(VS_OBJECTS.indexOf(id)+1),b=VS_BOX[name],im=vsPic(name);if(!b||!im)return null;const [px,py]=vsObjSpot(who),[x,y]=vsAt(who,{...T,sx:Math.abs(T.sx)},px,py),k=T.k*FIG_H(who)/FIG_H('rita')*.8*(o.in??1),bob=Math.sin((o.t||0)*2.4)*10*T.k;
 c.save();if((o.alpha??1)<1)c.globalAlpha*=o.alpha;c.translate(x,y+bob);c.rotate(.08*Math.sin((o.t||0)*1.7));c.drawImage(im,-b[2]*k/2,-b[3]*k/2,b[2]*k,b[3]*k);c.restore();return [x,y+bob,b[2]*k,b[3]*k];}
// The parrot on the brim of the pirate hat, or flying from it.
function vsParrot(c,who,T,p,hatMod){if(!p)return;const A=VS_PARROT[who];if(!A)return;const name='lloro-'+p.pic,b=VS_BOX[name],im=vsPic(name);if(!b||!im)return;
 const [px,py]=[A[0]+(hatMod?.dx||0),A[1]+(hatMod?.dy||0)],[x,y]=vsAt(who,T,px,py),s=A[2]*T.k;
 c.save();c.translate(x+(p.dx||0)*T.k,y+(p.dy||0)*T.k);if(T.rot)c.rotate(T.rot);c.scale(T.sx||1,T.sy||1);c.drawImage(im,(b[0]-245)*s,(b[1]-390)*s,b[2]*s,b[3]*s);c.restore();}
function vsShadow(c,x,y,rx,lift,alpha=1){const a=.2*alpha*Math.max(.25,1-lift/500),s=Math.max(.45,1-lift/700);c.save();c.fillStyle=`rgba(60,30,20,${a.toFixed(3)})`;c.beginPath();c.ellipse(x,y,rx*s,rx*.16*s,0,0,VS_TAU2);c.fill();c.restore();}
// An artist with a state at (x, y) (the feet) and scale k. Returns the transform, so that the caller can place things on the figure.
export function vsArtist(c,who,P,S,x,y,k,o={}){const pose=S.pose|0,skip={...(o.skip||{})};
 const hatApart=(S.hat||S.crown||S.hatFly>0)&&P.cap;if(hatApart)skip.cap=true;
 const codes=vsOutfit(P,pose,{roll:S.roll,skip});const dev=vsDevice(c),F=vsFigure(who,pose,codes,S.face|0,k*dev*Math.max(1,Math.abs(S.sx),S.sy));
 const T=vsT({x:x+S.dx*k,y,k,rot:S.rot,sx:S.sx,sy:S.sy,lift:S.lift,lean:S.lean,wa:S.wa,wp:S.wp,alpha:o.alpha??1});
 if(!o.noShadow)vsShadow(c,x+S.dx*k,y,230*k*VS_REL[who],S.lift,o.alpha??1);
 if(F)vsDrawFigure(c,F,who,T);
 // a hat that moves by itself: the chef's hat grows from its brim, the crown slides, a hat blown off flies up and comes back
 let hatMod=null;
 if(hatApart&&F){const code=pose&&P.cap==='astronauta'?'41t':vsCode('cap',P.cap),b=fBox(who,code);if(b){let m={};
  if(S.hat)m={sy:S.hat.sy,rot:S.hat.rot||0,px:b[0]+b[2]/2,py:b[1]+b[3]};
  if(S.crown)m={dx:S.crown.dx,dy:S.crown.dy,rot:S.crown.rot,px:b[0]+b[2]/2,py:b[1]+b[3]};
  if(S.hatFly>0){const f=S.hatFly,up=Math.sin(Math.PI*f);m={...m,dy:-620*up,dx:90*Math.sin(VS_TAU2*f),rot:VS_TAU2*1.5*vsEase(f),px:b[0]+b[2]/2,py:b[1]+b[3]/2};}
  vsDrawLayer(c,who,code,T,m);hatMod=m;}}
 if(P.cap==='pirata'&&S.parrot!==false)vsParrot(c,who,T,S.parrot||{pic:1,dx:0,dy:0},S.hatFly>0?hatMod:null);
 let objAt=null;if(S.obj&&P.objecte&&!pose)objAt=vsObjFloat(c,who,T,P.objecte,S.obj);
 if(!o.noFx&&S.fx.length){const K=3*k;for(const fx of S.fx){let A;
  if(fx.at==='stage')A={x0:0,y0:0,w:o.W||c.canvas?.clientWidth||1280,h:o.H||720};
  else if(fx.at==='obj'){if(objAt)A={x:objAt[0],y:objAt[1]-objAt[3]*.25};else{const ob=fBox(who,P.objecte?vsCode('objecte',P.objecte):'O1')||[700,300,200,200],[ax,ay]=vsAt(who,T,ob[0]+ob[2]*.5,ob[1]+ob[3]*.3);A={x:ax,y:ay};}}
  else if(fx.at==='hands'){for(const [px,py] of vsPoint(who,'hands',P,S)){const [ax,ay]=vsAt(who,T,px,py);vsDrawFx(c,fx,{x:ax,y:ay},K);}continue;}
  else{const [px,py]=vsPoint(who,fx.at,P,S),[ax,ay]=vsAt(who,T,px,py);A={x:ax,y:ay,r:fx.k==='orbit'?(fBox(who,'E1')?.[2]||200)*.95*k:undefined};}
  vsDrawFx(c,fx,A,K);}}
 return T;}
// Pipa with a state at (x, y), scale k: his own outfit, his face with the tongue out when he is pleased.
export function vsPipa(c,P,S,x,y,k,o={}){const codes=vsPipaOutfit(P),dev=vsDevice(c),F=vsFigure('pipa',0,codes,S.face?1:0,k*dev*Math.max(1,Math.abs(S.sx),S.sy));
 const T=vsT({x:x+S.dx*k,y,k,rot:S.rot,sx:S.sx,sy:S.sy,lift:S.lift,lean:S.lean,alpha:o.alpha??1});
 if(!o.noShadow)vsShadow(c,x+S.dx*k,y,220*k,S.lift,o.alpha??1);if(F)vsDrawFigure(c,F,'pipa',T);
 if(S.fx?.length)for(const fx of S.fx){const [ax,ay]=vsAt('pipa',T,560,470);vsDrawFx(c,fx,{x:ax,y:ay},k*3);}
 return T;}
// The reflection in the mirror: the artist seen from the front, small, inside the glass, with a sheen over it.
let VS_GLASS=null;
function vsMirrorDraw(c,G,who,P,S,t,decor){const b=VS_BOX.vidre,mask=vsPic('vidre');if(!b||!mask||decor.fade<=0)return;const dev=vsDevice(c),gw=Math.max(1,Math.round(b[2]*G.kb*dev)),gh=Math.max(1,Math.round(b[3]*G.kb*dev));
 if(!VS_GLASS||VS_GLASS.width!==gw||VS_GLASS.height!==gh){VS_GLASS=null;try{const cv=document.createElement('canvas');cv.width=gw;cv.height=gh;VS_GLASS=cv;}catch{return;}}const g=VS_GLASS.getContext('2d');if(!g)return;
 g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,gw,gh);g.fillStyle='#c4e8f6';g.fillRect(0,0,gw,gh);g.setTransform(dev,0,0,dev,0,0);
 const wv=b[2]*G.kb,hv=b[3]*G.kb,k=hv*.98/(FIG_H(who)+90),M={...S,fx:[],dx:0,sx:-Math.abs(S.sx||1)*Math.sign(S.sx||1),lean:-(S.lean||0),rot:-(S.rot||0),lift:(S.lift||0)*.6};
 g.save();g.globalAlpha=.94;vsArtist(g,who,P,M,wv*.5,hv-4*G.kb,k,{noShadow:true,noFx:true});g.restore();
 // the sheen of the glass: two pale diagonal bands
 g.setTransform(dev,0,0,dev,0,0);g.save();g.globalAlpha=.32;g.fillStyle='#ffffff';g.beginPath();g.moveTo(wv*.12,0);g.lineTo(wv*.3,0);g.lineTo(wv*.02,hv*.45);g.lineTo(0,hv*.45);g.lineTo(0,hv*.2);g.closePath();g.fill();g.beginPath();g.moveTo(wv*.62,hv);g.lineTo(wv*.74,hv);g.lineTo(wv,hv*.62);g.lineTo(wv,hv*.78);g.closePath();g.fill();g.restore();
 g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0,gw,gh);g.globalCompositeOperation='source-over';
 c.save();c.globalAlpha*=decor.fade;c.drawImage(VS_GLASS,G.bx(b[0]),G.by(b[1]),wv,hv);c.restore();}
// ── the dressing room ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// o: the artist (who, P, S), Pipa (pP, pS), the reflection (mP, mS: what the mirror shows), the wardrobe (open 0..1), the light.
function vsDressingRoom(c,G,o){const d=o.decor;c.fillStyle=d.base;c.fillRect(0,0,G.w,G.h);
 if(d.fade>0){if(!vsDrawPic(c,'cam-1',G.ox,G.oy,G.kb,1)){c.fillStyle='#f6c9b8';c.fillRect(0,0,G.w,G.h);}if(o.open>0)vsDrawPic(c,'cam-2',G.ox,G.oy,G.kb,vsClamp(o.open));vsTint(c,G,o.light);escVeil(c,d,0,0,G.w,G.h);
  vsMirrorDraw(c,G,o.who,o.mP||o.P,o.mS||o.S,o.t,d);}
 const k=G.kCam*VS_REL[o.who];
 if(!o.noArtist)o.T=vsArtist(c,o.who,o.P,o.S,G.cam.x,G.cam.y,k,{W:G.w,H:G.h});
 if(!o.noPipa)vsPipa(c,o.pP||{},o.pS||vsState(),G.pipa.x,G.pipa.y,G.kCam*VS_REL.pipa);
 return o.T;}
// ── the stage ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function vsSpot(c,G,light,x,k=1){const dark={tarda:.1,vespre:.24,nit:.38}[light]??.2;if(!(k>0))return;const g=c.createRadialGradient(x,G.stageY-G.h*.22,G.h*.12,x,G.stageY-G.h*.22,G.h*.75);g.addColorStop(0,'rgba(10,6,20,0)');g.addColorStop(1,`rgba(10,6,20,${(dark*k).toFixed(3)})`);c.save();c.fillStyle=g;c.fillRect(0,0,G.w,G.h);
 const f=c.createRadialGradient(x,G.stageY,4,x,G.stageY,G.kb*230);f.addColorStop(0,`rgba(255,240,190,${(.28*k).toFixed(3)})`);f.addColorStop(1,'rgba(255,240,190,0)');c.fillStyle=f;c.beginPath();c.ellipse(x,G.stageY,G.kb*260,G.kb*48,0,0,VS_TAU2);c.fill();c.restore();}
function vsStageBack(c,G,o){const d=o.decor;c.fillStyle=d.base;c.fillRect(0,0,G.w,G.h);if(d.fade<=0)return;
 if(!vsDrawPic(c,'esc-1',G.ox,G.oy,G.kb,1)){c.fillStyle='#bfe3f2';c.fillRect(0,0,G.w,G.h);}vsDrawPic(c,'fons-'+(o.backdrop+1),G.ox,G.oy,G.kb,1);escVeil(c,d,0,0,G.w,G.h);vsSpot(c,G,o.light,o.spotX??G.bx(768),d.fade);
 if(o.rainbow>0){const b=VS_BOX['obj-7'],im=vsPic('obj-7');if(b&&im){c.save();c.beginPath();c.rect(G.bx(b[0]),0,b[2]*G.kb*o.rainbow,G.h);c.clip();c.globalAlpha*=.92;c.drawImage(im,G.bx(b[0]),G.by(b[1]),b[2]*G.kb,b[3]*G.kb);c.restore();}}}
// The curtain (ESC-2) closing from both sides, and the audience in front (ESC-3), their hands up when they clap (ESC-4).
function vsStageFront(c,G,o){const d=o.decor;if(d.fade<=0)return;c.save();c.globalAlpha*=d.fade;
 if(o.curtain>0){const im=vsPic('esc-2');if(im){const L=112,Rr=1424,half=(Rr-L)/2*vsClamp(o.curtain);c.save();c.beginPath();c.rect(G.bx(L),0,half*G.kb,G.by(842));c.rect(G.bx(Rr-half),0,half*G.kb,G.by(842));c.clip();c.drawImage(im,G.ox,G.oy,1536*G.kb,1024*G.kb);c.restore();}}
 if(o.hands>0)vsDrawPic(c,'mans',G.ox,G.oy+(1-vsEase(o.hands))*90*G.kb,G.kb,vsClamp(o.hands*2));
 vsDrawPic(c,'public',G.ox,G.oy,G.kb,1);c.restore();}
// ── the cards of the choice ─────────────────────────────────────────────────────────────────────────────────────────────────────
const VS_SEEN=new Map();
function vsEnter(key,clock){if(clock===undefined||clock===null)return 1;let t0=VS_SEEN.get(key);if(t0===undefined||t0>clock){t0=clock;VS_SEEN.set(key,t0);if(VS_SEEN.size>40)VS_SEEN.delete(VS_SEEN.keys().next().value);}return vsClamp((clock-t0)/.85);}
// A card: the paper behind, then the piece; u is how far it has come out of the wardrobe (0 inside, 1 in its place).
function vsCard(c,G,z,names,o){const u=o.u??1,light=o.light??1,x0=G.bx(255),y0=G.by(580),cx=z.x+z.w/2,cy=z.y+z.h/2,e=vsOut(u),x=x0+(cx-x0)*e,y=y0+(cy-y0)*e-Math.sin(Math.PI*e)*G.h*.08,s=.15+.85*vsSettle(u,1.6);if(!(o.alpha>0))return;
 c.save();c.globalAlpha*=o.alpha;c.translate(x,y);c.rotate((o.rot||0)+(1-e)*.6);c.scale(s,s);
 c.fillStyle='#fff7ea';c.strokeStyle='rgba(120,70,50,.4)';c.lineWidth=2;c.beginPath();const r=z.radius||20;c.roundRect?c.roundRect(-z.w/2,-z.h/2,z.w,z.h,r):c.rect(-z.w/2,-z.h/2,z.w,z.h);c.fill();c.stroke();
 const dev=vsDevice(c),pad=.1,st=vsSticker(names,Math.max(z.w,z.h)*(1-2*pad)*dev);
 if(st){const k=Math.min(z.w*(1-2*pad)/st.w,z.h*(1-2*pad)/st.h)*(o.grow||1);c.drawImage(st.cv,-st.w*k/2,-st.h*k/2,st.w*k,st.h*k);}
 if(light<1){c.fillStyle=`rgba(40,24,40,${((1-light)*.42).toFixed(3)})`;c.beginPath();c.roundRect?c.roundRect(-z.w/2,-z.h/2,z.w,z.h,r):c.rect(-z.w/2,-z.h/2,z.w,z.h);c.fill();}
 c.restore();}
// ── idle life: breathing, blinking, looking at the piece in focus ────────────────────────────────────────────────────────────────
function vsIdle(S,t,look=0,seed=0){S.sy*=1+.008*Math.sin(t*2.1+seed);S.lean+=4*Math.sin(t*1.3+seed);const bl=(t+seed*.7)%3.4;if(look)S.face=look>0?VS_FACE.dreta:VS_FACE.esquerra;else if(bl<.14)S.face=VS_FACE.parpelleig;return S;}
function vsPipaIdle(S,t){const k=(t+1.3)%4.6;S.face=k<1.6?1:0;S.sy*=1+.012*Math.sin(t*3.1);if(k>3.9)S.lift+=18*Math.sin((k-3.9)/.7*Math.PI);return S;}
// ── the board at rest: the dressing room and the pieces of the moment ─────────────────────────────────────────────────────────
export function vsBoard(c,w,h,state,game,s,view){const preview=!!view.preview,G=vsGeom(w,h,preview),round=state?.round|0,R=vsRoundOf(round,s),who=R.artist,t=view.clock||0;
 if(!preview)vsPrefetch(s,round);
 const P=preview?{cap:'pirata',cos:'pirata',peus:'bus'}:vsPicks(state,s),slot=preview?'cap':vsSlotOf(state,s);
 const options=preview?[]:(view.options||[]).map(o=>o?.value??o?.id??o),zones=view.zones||vsZones(G,Math.max(1,options.length));
 const enter=preview?1:vsEnter(`${round}/${state?.stage|0}`,view.clock);
 const f=view.focus??-1,fz=zones[f],look=fz?Math.sign(Math.round((fz.x+fz.w/2-G.cam.x)/(G.w*.12))):0;
 const S=vsIdle(vsState(),t,preview?0:look,round),pS=vsPipaIdle(vsState(),t);if(P.objecte)S.obj={t,in:1};
 vsDressingRoom(c,G,{who,P,S,pP:P,pS,decor:view.decor,light:R.light,open:preview?0:vsClamp(enter*3),t});
 if(preview||!options.length)return;
 // the scene goes dim under the cards
 c.save();c.fillStyle=`rgba(28,16,34,${(.42*vsEase(enter*1.6)).toFixed(3)})`;c.fillRect(0,0,G.w,G.h);c.restore();
 options.forEach((id,i)=>{const z=zones[i];if(!z)return;const u=vsClamp(enter*1.25-i*.09),foc=i===f&&!view.waiting;vsCard(c,G,z,vsPieceNames(who,slot,id),{u,alpha:1,light:view.lights?.[i]??1,rot:foc?.035*Math.sin(t*2.6):0,grow:foc?1.05:1});});
 // the ring of the focus waits until its card has come out of the wardrobe and sits in its place
 vsVeilRing(c,G,f>=0&&vsClamp(enter*1.25-f*.09)<.98?{...view,focus:-1}:view);}
function vsVeilRing(c,G,view){const wait=view.wait??(view.waiting?1:0);if(wait>0){c.save();c.fillStyle=`rgba(10,8,16,${(.34*wait).toFixed(3)})`;c.fillRect(0,0,G.w,G.h);c.restore();}
 const f=view.focus??-1,zones=view.zones||[];if(f>=0&&zones[f]&&!view.waiting)tlRing(c,zones[f].pts,view.progress,1,Math.max(.6,Math.min(1.2,G.w/1280)),view.ring);}
// ── the result of a pick ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Where a piece goes on the figure at rest (the centre of its layer) and where it lands by mistake (the feet, the head).
function vsPiecePlace(who,slot,id,wrong=null){if(wrong==='peus'){const b=fBox(who,'13')||[400,1200,250,200];return [b[0]+b[2]/2,b[1]+b[3]*.5];}
 if(wrong==='cap'){const e=fBox(who,'E1')||[420,420,200,200];return [e[0]+e[2]/2,VS_TOP[who]+20];}
 if(slot==='objecte')return vsObjSpot(who);const names=vsPieceNames(who,slot,id),bs=names.map(n=>VS_BOX[n]).filter(Boolean);if(!bs.length)return [512,700];
 const x0=Math.min(...bs.map(b=>b[0])),y0=Math.min(...bs.map(b=>b[1])),x1=Math.max(...bs.map(b=>b[0]+b[2])),y1=Math.max(...bs.map(b=>b[1]+b[3]));return [(x0+x1)/2,(y0+y1)/2];}
// The flying piece: the layer pictures moved as one from (x0, y0) at scale k0 to (x1, y1) at scale k1 (the centre of the piece).
function vsFlyPiece(c,names,from,to,u,turn=0){const bs=names.map(n=>VS_BOX[n]).filter(Boolean);if(!bs.length)return;const x0=Math.min(...bs.map(b=>b[0])),y0=Math.min(...bs.map(b=>b[1])),x1=Math.max(...bs.map(b=>b[0]+b[2])),y1=Math.max(...bs.map(b=>b[1]+b[3])),cx=(x0+x1)/2,cy=(y0+y1)/2;
 const e=vsEase(u),x=from[0]+(to[0]-from[0])*e,y=from[1]+(to[1]-from[1])*e-Math.sin(Math.PI*u)*Math.abs(to[0]-from[0])*.25,k=from[2]*Math.pow(to[2]/from[2],e);
 c.save();c.translate(x,y);c.rotate(turn*Math.sin(Math.PI*u));c.scale(k,k);for(const n of names){const b=VS_BOX[n],im=vsPic(n);if(b&&im)c.drawImage(im,b[0]-cx,b[1]-cy,b[2],b[3]);}c.restore();}
// The size of a card's piece (the scale that fits it in its zone) and its centre on the screen.
function vsCardFit(G,z,names){const bs=names.map(n=>VS_BOX[n]).filter(Boolean);if(!bs.length||!z)return [G.w/2,G.h/2,.5];const w=Math.max(...bs.map(b=>b[0]+b[2]))-Math.min(...bs.map(b=>b[0])),h=Math.max(...bs.map(b=>b[1]+b[3]))-Math.min(...bs.map(b=>b[1]));return [z.x+z.w/2,z.y+z.h/2,Math.min(z.w*.8/(w+28),z.h*.8/(h+28))];}
// The state of the artist, of Pipa and of the mirror at time t of a pick (the step, or the first part of the last pick).
function vsPickStates(G,state,s,id,t,last,clock){const round=state.round|0,stage=state.stage|0,slot=vsSlotOf(state,s),who=vsRoundOf(round,s).artist,before=vsPicks(state,s),after=vsPicks(state,s,id),slip=vsSlip(round,stage,s),D=slip?VS_SLIP:0,land=VS_FLY+D,g=t-land;
 const on=t>=land;const P=on?after:before,S=vsIdle(vsState(),clock,0,round);if(!on&&slot==='objecte'&&before.objecte)S.obj={t:clock,in:1};
 if(on)vsGag(slot,id,g,S);
 if(slip&&t>=VS_FLY&&t<land){const u=t-VS_FLY;S.face=u<.5?VS_FACE.sorpresa:u<1?VS_FACE.ups:VS_FACE.riu;}
 // the look at the mirror closes a step (never the last pick: the wall goes up)
 const dur=VS_STEP+D,looking=!last&&t>dur-1.05;if(looking){S.face=t>dur-.45?VS_FACE.riu:VS_FACE.dreta;}
 // Pipa copies the piece a moment after the artist (a puff, a hop and a bark)
 const echo=on&&g>=2.05,pP=echo&&slot!=='objecte'?after:before,pS=vsPipaIdle(vsState(),clock);if(on&&g>=1.85&&g<2.9){const v=(g-1.85)/1.05;pS.lift+=70*Math.sin(Math.PI*vsClamp(v*1.3));pS.face=1;if(g>=2.05&&g<2.5)pS.fx=[{k:'sparkle',t:g-2.05}];}
 // the mirror's trick, from a moment after the piece lands until the artist turns to look
 let mP=P,mS=S;if(on&&!last&&g>.4&&!looking){const m=vsMirror(round,stage,s,id);if(m.kind==='peca')mP={...P,[m.slot]:m.id};else mS={...S,face:VS_FACE.llengua};}
 return {who,slot,P,S,pP,pS,mP,mS,slip,D,land,before,after};}
export function vsResult(c,w,h,state,game,s,view,time){const G=vsGeom(w,h,false),id=view.pendingId,final=!!view.final,round=state.round|0,R=vsRoundOf(round,s),who=R.artist,clock=view.clock||0;vsPrefetch(s,round);
 const options=(view.options||[]).map(o=>o?.value??o?.id??o),zones=view.zones||vsZones(G,Math.max(1,options.length)),chosen=Math.max(0,view.chosen??options.indexOf(id)),slot=vsSlotOf(state,s);
 const t=Math.max(0,time||0);
 if(final){const TL=vsTimeline(s,round,vsSlip(round,state.stage|0,s)?VS_SLIP:0);if(t>=TL.put){vsShow(c,G,state,s,view,t,TL,id);return;}}
 const X=vsPickStates(G,state,s,id,t,final,clock);
 // the wardrobe closes as the cards go back in; the veil lifts
 const open=1-vsPh(t,.45,.8);
 vsDressingRoom(c,G,{who,P:X.P,S:X.S,pP:X.pP,pS:X.pS,mP:X.mP,mS:X.mS,decor:view.decor,light:R.light,open,t:clock});
 const veil=1-vsPh(t,0,.5);if(veil>0){c.save();c.fillStyle=`rgba(28,16,34,${(.42*veil).toFixed(3)})`;c.fillRect(0,0,G.w,G.h);c.restore();}
 // the other cards go back into the wardrobe
 options.forEach((o,i)=>{if(i===chosen||!zones[i])return;const u=1-vsPh(t,0,.6);if(u>0)vsCard(c,G,zones[i],vsPieceNames(who,slot,o),{u,alpha:1,light:view.lights?.[i]??.6});});
 // the chosen piece flies onto the artist (or first to the wrong place)
 const names=vsPieceNames(who,slot,id),k=G.kCam*VS_REL[who],T0=vsT({x:G.cam.x,y:G.cam.y,k});
 if(t<VS_FLY){const z=zones[chosen],[zx,zy,zk]=vsCardFit(G,z,names);if(z&&t<.18){c.save();c.globalAlpha*=1-t/.18;c.fillStyle='rgba(255,248,236,.9)';c.fillRect(z.x,z.y,z.w,z.h);c.restore();}
  if(slot==='objecte'){const [px,py]=vsPiecePlace(who,slot,id),[tx,ty]=vsAt(who,T0,px,py);vsFlyPiece(c,names,[zx,zy,zk],[tx,ty,k*FIG_H(who)/FIG_H('rita')*.8],t/VS_FLY,.5);}
  else{const [px,py]=vsPiecePlace(who,slot,id,X.slip),[tx,ty]=vsAt(who,T0,px,py);vsFlyPiece(c,names,[zx,zy,zk],[tx,ty,k],t/VS_FLY,.4);}}
 else if(X.slip&&t<X.land){const u=t-VS_FLY,[ax,ay]=vsAt(who,T0,...vsPiecePlace(who,slot,id,X.slip)),[bx,by]=vsAt(who,T0,...vsPiecePlace(who,slot,id));
  if(u<1){c.save();c.translate(ax,ay+Math.sin(u*9)*4*k);c.rotate(.12*Math.sin(u*6));c.translate(-ax,-ay);vsFlyPiece(c,names,[ax,ay,k],[ax,ay,k],0);c.restore();}
  else vsFlyPiece(c,names,[ax,ay,k],[bx,by,k],vsClamp((u-1)/(VS_SLIP-1)),.3);}
 if(t>=VS_FLY&&t<VS_FLY+.9){const [px,py]=X.slip&&t<X.land?vsPiecePlace(who,slot,id,X.slip):vsPiecePlace(who,slot,id),[ax,ay]=vsAt(who,T0,px,py);vsDrawFx(c,{k:'sparkle',t:t-VS_FLY},{x:ax,y:ay},3*k);}
 if(X.slip&&t>=X.land&&t<X.land+.9){const [ax,ay]=vsAt(who,T0,...vsPiecePlace(who,slot,id));vsDrawFx(c,{k:'sparkle',t:t-X.land},{x:ax,y:ay},3*k);}}
// ── the show: the wall goes up, the number, the bow, the curtain, the way back ─────────────────────────────────────────────────
function vsPipaFollow(nb,t,S){if(nb.feet)vsGait(nb.feet,Math.max(0,t-.25),.55,S);S.face=(t%2.2)<1.2?1:0;return S;}
function vsShow(c,G,state,s,view,t,TL,id){const round=state.round|0,R=vsRoundOf(round,s),who=R.artist,P=vsPicks(state,s,id),nb=vsNumber(P),backdrop=vsBackdrop(P),d=view.decor,clock=view.clock||0,kS=G.kStage*VS_REL[who],kP=G.kStage*VS_REL.pipa;
 const cx=G.bx(700),stageBack=o=>vsStageBack(c,G,{decor:d,backdrop,light:R.light,...o});
 // the wall of the dressing room goes up like a set
 if(t<TL.up){const u=vsEase(vsPh(t,TL.put,TL.up));stageBack({});vsStageFront(c,G,{decor:d});
  c.save();c.translate(0,-G.h*1.02*u);const S=vsIdle(vsState(),clock,0,round);S.face=VS_FACE.riu;if(P.objecte)S.obj={t:clock,in:1};const pS=vsPipaIdle(vsState(),clock);vsDressingRoom(c,G,{who,P,S,pP:P,pS,decor:d,light:R.light,open:0,t:clock});
  c.restore();return;}
 // the number
 if(t<TL.numEnd){const tt=t-TL.num,S=vsState(),{pos,parts}=vsPerform(nb,tt,TL.N,S);S.wa=S.wa||0;
  let x=G.bx(-260)+(cx-G.bx(-260))*pos;if(nb.body==='reialesa'&&parts.move>=0)x+=Math.sin(parts.move*Math.PI*2)*G.kb*110*(parts.magic<0?1:1-parts.magic);
  stageBack({rainbow:S.rainbow||0,spotX:x});
  const pS=vsPipaFollow(nb,tt,vsState());let px=x-G.kb*250,py=G.pipaStageY;if(parts.move>=0){px=x+G.kb*(nb.body==='reialesa'&&parts.magic<0?-150:270);}
  if(nb.body==='reialesa'&&parts.move>=0&&parts.magic<0){py=G.pipaStageY-G.kb*10;vsPipa(c,P,pS,px,py,kP);vsArtist(c,who,P,S,x,G.stageY,kS,{W:G.w,H:G.h});}
  else{vsArtist(c,who,P,S,x,G.stageY,kS,{W:G.w,H:G.h});vsPipa(c,P,pS,px,py,kP);}
  vsStageFront(c,G,{decor:d});return;}
 // the bow (and every fourth show the four artists together)
 const bowEnd=TL.groupEnd;if(t<TL.close){const tb=t-TL.numEnd,inGroup=TL.group&&t>=TL.groupStart;stageBack({spotX:cx});
  const S=vsState();S.pose=1;S.face=(tb%2.6)<.14?VS_FACE.parpelleig:VS_FACE.riu;S.lift=26*Math.abs(Math.sin(tb*3.2))*Math.exp(-tb*.8);
  const pS=vsState();pS.face=1;pS.lift=50*Math.abs(Math.sin(tb*4))*Math.exp(-tb*.5);
  if(inGroup){const tg=t-TL.groupStart,made=view.made||{},line=[];for(let k=3;k>=1;k--){const r=round-k;if(r<0)continue;const Rr=vsRoundOf(r,s);line.push({who:Rr.artist,P:made[r]||vsDefaultPicks(r,s)});}line.push({who,P});
   const xs=[380,610,860,1110].slice(4-line.length),inU=vsOut(vsClamp(tg/1.2));line.forEach((a,i)=>{const from=i<line.length/2?-280:1820,x=G.bx(from+(xs[i]-from)*(a.who===who?1:inU)),Sa=vsState();Sa.pose=1;Sa.face=(tg+i*.7)%2.4<.14?VS_FACE.parpelleig:VS_FACE.riu;Sa.lift=20*Math.abs(Math.sin(tg*3+i));if(a.who===who&&inU<1)Sa.dx=0;vsArtist(c,a.who,a.P,Sa,x,G.stageY,G.kStage*VS_REL[a.who],{W:G.w,H:G.h});});
   vsPipa(c,P,pS,G.bx(1235),G.pipaStageY+G.kb*14,kP);if(tg<VS_BOW+2)vsDrawFx(c,{k:'confetti',t:tg},{x0:0,y0:0,w:G.w,h:G.h},G.kb*.8);}
  else{vsArtist(c,who,P,S,cx,G.stageY,kS,{W:G.w,H:G.h});vsPipa(c,P,pS,cx+G.kb*270,G.pipaStageY,kP);if(nb.full)vsDrawFx(c,{k:'confetti',t:tb+2},{x0:0,y0:0,w:G.w,h:G.h},G.kb*.8);}
  vsStageFront(c,G,{decor:d,hands:vsClamp(tb/.6)*(1-vsPh(t,bowEnd-.4,bowEnd+.3)),curtain:vsEase(vsPh(t,bowEnd,TL.close-.1))});return;}
 // the curtain closes, and the dressing room comes down with the next artist
 stageBack({spotX:cx});vsStageFront(c,G,{decor:d,curtain:1});
 if(t>=TL.close){const u=vsEase(vsPh(t,TL.close,TL.end-.15)),nx=vsRoundOf(round+1,s).artist,S=vsState();S.face=u>.7?VS_FACE.riu:0;S.lift=0;c.save();c.translate(0,-G.h*1.02*(1-u));vsDressingRoom(c,G,{who:nx,P:{},S,pP:{},pS:vsPipaIdle(vsState(),clock),decor:d,light:vsRoundOf(round+1,s).light,open:0,t:clock});c.restore();}}
// The outfit of an earlier show when the session did not see it (the group bow after starting late): the first piece of each round.
function vsDefaultPicks(round,s){const out={};vsSlots(s).forEach((slot,k)=>{const fam=slot==='objecte'?VS_OBJECTS:VS_COSTUMES;out[slot]=fam[(round*2+k*3)%fam.length];});return out;}
export {vsDefaultPicks};
