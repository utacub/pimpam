// La nova Flor de paper (CE02), 0.51 · the garden: the paper wall and ground that only show where the flowers' light reaches them,
// the light itself (each open flower is a lamp of its own colour that spreads like ink in wet paper), stems and leaves, creatures,
// the finale of each garden and the wait for the next press.
import {K_TAU,Kclamp,Ksmooth,KeaseOut,Krand,Kmix,Krgb,Krgba} from './kaleido-base.js';
import {escDecor,escVeil,escBlit,escLight,escGlowLayer,escGlow,escWaitClock,ESC_WAIT_START,escFrame,escCanvas} from './escenari.js';
import {fpShade,fpPattern,fpTexture,fpPath2D} from './flor-paper.js';
import {fpFlower,fpLook} from './flor-art.js';
import {FP_GARDENS,FP_SPECIES} from './flor-especies.js';
import {FP_ORDER,fpBloom,fpFinaleT,fpLayout,fpNowOf,FP_FINALE,FP_CHANGE} from './flor.js';

const fpL=(a,b,t)=>a+(b-a)*t;
// The strength of the light around the flowers (setting «Color a l'entorn»).
export const FP_TINT=Object.freeze({suau:.6,mig:1,intens:1.45});

// ── Light at a point (for leaves, stems and creatures) ─────────────────────────────────────────────────────────────────────
function fpLightAt(lights,amb,x,y){let r=amb[0],g=amb[1],b=amb[2];for(const L of lights){const dx=(x-L.x)/L.rx,dy=(y-L.y)/L.ry,d=Math.sqrt(dx*dx+dy*dy);if(d>=1)continue;const f=d<.55?1-.4*d/.55:.6*(1-(d-.55)/.45),[cr,cg,cb]=Krgb(L.color);r+=cr/255*L.a*f;g+=cg/255*L.a*f;b+=cb/255*L.a*f;}return [r,g,b];}
const fpLitRGB=(hex,l)=>{const x=Krgb(hex);return '#'+x.map((v,i)=>Math.round(Kclamp(v*l[i],0,255)).toString(16).padStart(2,'0')).join('');};

// ── Leaves ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A leaf from its base (0,0) along +x: half-width profile, lobes, teeth, a heart notch at the base, or a round pad with a slit.
function fpLeafPts(L,len,wd){const pts=[],n=26,lobes=L.lobes||0,serr=L.serr||0;
 if(L.k==='pad'){for(let i=0;i<=40;i++){const a=.12+i/40*(K_TAU-.24);pts.push([len*.5+Math.cos(a)*len*.5,Math.sin(a)*len*.5*(L.flat??.36)]);}pts.push([len*.5,0]);return pts;}
 const half=(u)=>{let w;switch(L.k){case 'heart':w=Math.sin(Math.PI*Math.pow(u,.6))*(1+.35*(1-u));break;case 'lance':case 'sword':case 'linear':w=Math.pow(Math.sin(Math.PI*Math.pow(u,.8)),.8)*(L.k==='linear'?.35:1);break;
  case 'broad':case 'paddle':w=Math.pow(Math.sin(Math.PI*Math.pow(u,.7)),.6);break;default:w=Math.pow(Math.sin(Math.PI*Math.pow(u,.85)),.9);}
  if(lobes)w*=1-.55*Math.pow(Math.abs(Math.sin(u*lobes*Math.PI)),1.5)*(u>.08?1:0);if(serr)w*=1-serr*(Math.floor(u*28)%2?0:1)*u;return w*wd;};
 for(let i=0;i<=n;i++){const u=i/n;pts.push([u*len+(L.k==='heart'&&i<4?-(3-i)*len*.04:0),-half(u)*(L.tilt?1.08:1)]);}
 for(let i=n-1;i>=1;i--){const u=i/n;pts.push([u*len+(L.k==='heart'&&i<4?-(3-i)*len*.04:0),half(u)*(L.tilt?.92:1)]);}return pts;}
function fpLeaf(c,L,x,y,ang,len,wd,col,dim,line=true){if(len<1)return;c.save();c.translate(x,y);c.rotate(ang);const pts=fpLeafPts(L,len,wd);
 const P=fpPath2D();P.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];P.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}P.closePath();
 c.fillStyle='rgba(4,6,4,.25)';c.save();c.translate(len*.02,len*.035);c.fill(P);c.restore();
 const g=c.createLinearGradient(0,-wd,0,wd);g.addColorStop(0,fpShade(col,1.18));g.addColorStop(.49,fpShade(col,1.05));g.addColorStop(.51,fpShade(col,.78));g.addColorStop(1,fpShade(col,.66));c.fillStyle=g;c.fill(P);
 const pat=fpPattern(c,'card',ang,.5);if(pat){c.save();c.globalCompositeOperation='overlay';c.globalAlpha=.32;c.fillStyle=pat;c.fill(P);c.restore();}
 if(L.marble){c.save();c.clip(P);c.scale(1,.62);c.translate(len*.06,0);c.fillStyle=Krgba(fpShade(col,1.9),.38);c.fill(P);c.restore();}
 if(L.k!=='pad'){c.strokeStyle=Krgba(fpShade(col,1.4),.35);c.lineWidth=Math.max(.6,len*.012);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(len*.5,-wd*.05,len*.95,0);c.stroke();
  c.strokeStyle=Krgba(fpShade(col,.55),.3);c.lineWidth=Math.max(.5,len*.007);for(let i=1;i<6;i++){const u=i/6.5;c.beginPath();c.moveTo(u*len,0);c.lineTo(u*len+len*.12,-wd*.7*Math.sin(Math.PI*u));c.moveTo(u*len,0);c.lineTo(u*len+len*.12,wd*.7*Math.sin(Math.PI*u));c.stroke();}}
 else{c.strokeStyle=Krgba(fpShade(col,.6),.35);c.lineWidth=Math.max(.5,len*.006);for(let i=0;i<9;i++){const a=.3+i/9*(K_TAU-.6);c.beginPath();c.moveTo(len*.5,0);c.lineTo(len*.5+Math.cos(a)*len*.46,Math.sin(a)*len*.46*(L.flat??.36));c.stroke();}}
 if(line){c.strokeStyle=Krgba(fpShade(col,.35),.7*(1-dim*.5));c.lineWidth=Math.max(.6,len*.01);c.stroke(P);}c.restore();}

// ── The paper wall and ground of each garden (the albedo: lit by the light map) ─────────────────────────────────────────────
function fpGrass(c,w,h,y0,n,hh,col,seed){for(let i=0;i<n;i++){const x=Krand(i,seed)*w*1.04-w*.02,bh=hh*(.5+.7*Krand(i,seed+1)),lean=(Krand(i,seed+2)-.5)*bh*.5,bw=Math.max(2,w*.004*(1+Krand(i,seed+3)));
 c.fillStyle=fpShade(col,.75+.5*Krand(i,seed+4));c.beginPath();c.moveTo(x-bw,y0+4);c.quadraticCurveTo(x+lean*.3,y0-bh*.6,x+lean,y0-bh);c.quadraticCurveTo(x+lean*.3+bw*.5,y0-bh*.55,x+bw,y0+4);c.closePath();c.fill();}}
function fpWall(id,mirror){return (c,w,h)=>{const G=FP_GARDENS.find(g=>g.id===id)||FP_GARDENS[0];c.save();if(mirror){c.translate(w,0);c.scale(-1,1);}
 c.fillStyle=G.wall;c.fillRect(0,0,w,h);
 const hill=(y,amp,col,seed)=>{c.fillStyle=col;c.beginPath();c.moveTo(0,h);for(let i=0;i<=24;i++){const x=i/24*w;c.lineTo(x,y+amp*(Math.sin(i*.55+seed)*.6+Math.sin(i*1.3+seed*2)*.4));}c.lineTo(w,h);c.closePath();c.fill();};
 if(id==='prat'){hill(h*.62,h*.04,fpShade(G.wall,.86),1);hill(h*.72,h*.05,Kmix(G.ground,G.wall,.45),3);c.fillStyle=G.ground;c.fillRect(0,h*.8,w,h*.2);
  fpGrass(c,w,h,h*.84,160,h*.16,Kmix(G.ground,G.wall,.25),11);fpGrass(c,w,h,h*1.0,220,h*.24,G.ground,12);
  for(let i=0;i<60;i++){const x=Krand(i,15)*w,y=h*(.74+.08*Krand(i,16)),r=h*(.003+.004*Krand(i,17));c.fillStyle=['#e8e4d8','#e8c860','#c8a0d8','#d86a50'][i%4];for(let k=0;k<5;k++){const an=k*K_TAU/5;c.beginPath();c.arc(x+Math.cos(an)*r,y+Math.sin(an)*r*.6,r*.75,0,K_TAU);c.fill();}c.fillStyle='#e0b030';c.beginPath();c.arc(x,y,r*.5,0,K_TAU);c.fill();}}
 else if(id==='estany'){hill(h*.5,h*.03,fpShade(G.wall,.85),2);c.fillStyle=G.ground;c.fillRect(0,h*.58,w,h*.42);
  for(let i=0;i<26;i++){const y=h*(.6+.4*Math.pow(i/26,1.3)),x=Krand(i,21)*w,len=w*(.05+.12*Krand(i,22));c.fillStyle=Krgba(fpShade(G.ground,1.35),.5);c.fillRect(x,y,len,Math.max(1,h*.003));}
  for(const side of [0,1])for(let i=0;i<16;i++){const x=side?w*(.88+.12*Krand(i,23)):w*.12*Krand(i,24),top=h*(.3+.15*Krand(i,25));c.strokeStyle=fpShade('#4a5a34',.8+.4*Krand(i,26));c.lineWidth=Math.max(2,w*.003);c.beginPath();c.moveTo(x,h*.62);c.quadraticCurveTo(x+(Krand(i,27)-.5)*w*.02,h*.45,x+(Krand(i,28)-.5)*w*.03,top);c.stroke();
   if(i%3===0){c.fillStyle='#5a3a22';c.beginPath();c.ellipse(x+(Krand(i,28)-.5)*w*.02,top+h*.05,w*.004,h*.03,0,0,K_TAU);c.fill();}}}
 else if(id==='bosc'){// far trunks, near trunks with a little bark, and a canopy of cut-paper leaves overhead
  for(let i=0;i<9;i++){const x=w*(i/8)+(Krand(i,30)-.5)*w*.05,tw=w*.012;c.fillStyle=fpShade(G.wall,.86);c.fillRect(x-tw/2,h*.1,tw,h*.72);}
  for(let i=0;i<5;i++){const x=w*(.06+.88*i/4+(Krand(i,31)-.5)*.05),tw=w*(.03+.025*Krand(i,32)),top=h*.05;c.fillStyle='#5a4a3a';c.beginPath();c.moveTo(x-tw*.7,h*.82);c.quadraticCurveTo(x-tw*.45,h*.5,x-tw*.4,top);c.lineTo(x+tw*.4,top);c.quadraticCurveTo(x+tw*.45,h*.5,x+tw*.7,h*.82);c.closePath();c.fill();
   c.strokeStyle=Krgba('#2a2018',.4);c.lineWidth=Math.max(1,w*.0015);for(let k=0;k<14;k++){const yy=h*(.08+.72*Krand(k+i*20,33)),xx=x+(Krand(k+i*20,34)-.5)*tw*.6;c.beginPath();c.moveTo(xx,yy);c.quadraticCurveTo(xx+tw*.05,yy+h*.03,xx,yy+h*.06);c.stroke();}
   c.strokeStyle='#5a4a3a';c.lineWidth=Math.max(2,tw*.25);c.lineCap='round';const by=h*(.18+.1*Krand(i,35)),sd=i%2?1:-1;c.beginPath();c.moveTo(x,by+h*.06);c.quadraticCurveTo(x+sd*w*.04,by,x+sd*w*.08,by-h*.06);c.stroke();}
  for(let i=0;i<70;i++){const x=Krand(i,36)*w*1.1-w*.05,y=h*(.02+.16*Math.pow(Krand(i,37),1.5)),L=h*(.05+.05*Krand(i,38));fpLeaf(c,{k:'ovate'},x,y,Krand(i,39)*K_TAU,L,L*.42,['#4a5a34','#56663c','#3e4e2e'][i%3],0,false);}
  c.fillStyle=G.ground;c.fillRect(0,h*.8,w,h*.2);hill(h*.82,h*.02,fpShade(G.ground,1.1),5);
  for(let i=0;i<9;i++){const x=Krand(i,35)*w,y=h*(.88+.1*Krand(i,36)),L=h*(.12+.08*Krand(i,37));for(let k=0;k<5;k++)fpFrond(c,x,y,-Math.PI/2+(k-2)*.45,L*(1-.1*Math.abs(k-2)),'#4f6a3a');}}
 else if(id==='nit'){for(let i=0;i<4;i++){const x=w*(.06+.3*i+.05*Krand(i,41)),ch=h*(.42+.12*Krand(i,42)),cw=w*.035;c.fillStyle=fpShade('#3a4a44',.8+.25*Krand(i,43));c.beginPath();c.moveTo(x,h*.82-ch);c.quadraticCurveTo(x+cw,h*.82-ch*.6,x+cw*.7,h*.82);c.lineTo(x-cw*.7,h*.82);c.quadraticCurveTo(x-cw,h*.82-ch*.6,x,h*.82-ch);c.fill();}
  c.fillStyle=G.ground;c.fillRect(0,h*.8,w,h*.2);c.fillStyle=fpShade('#3c5040',.9);c.beginPath();c.moveTo(0,h*.86);for(let i=0;i<=30;i++)c.lineTo(i/30*w,h*(.8-.03*Math.abs(Math.sin(i*.9))));c.lineTo(w,h*.86);c.closePath();c.fill();}
 else if(id==='hivernacle'){c.strokeStyle=Krgba('#e8ece0',.55);c.lineWidth=Math.max(2,w*.003);for(let i=0;i<=6;i++){const x=i/6*w;c.beginPath();c.moveTo(x,h);c.lineTo(x,h*.25);c.stroke();}
  for(let i=0;i<3;i++){c.beginPath();c.ellipse(w*.5,h*.25,w*(.5+.02*i),h*(.25-.03*i),0,Math.PI,K_TAU);c.stroke();}c.beginPath();c.moveTo(0,h*.55);c.lineTo(w,h*.55);c.stroke();
  c.fillStyle=G.ground;c.fillRect(0,h*.82,w,h*.18);
  for(const [x,y,a,L] of [[-.02,.42,.25,.36],[.0,.92,-.6,.34],[1.02,.4,Math.PI-.3,.36],[1.0,.93,Math.PI+.5,.32]])fpLeaf(c,{k:'paddle'},x*w,y*h,a,L*h,L*h*.26,'#6a9a52',0);
  for(let i=0;i<5;i++){const x=w*(.18+.16*i),y=h*.25;c.strokeStyle=Krgba('#e8ece0',.5);c.lineWidth=Math.max(1,w*.0012);c.beginPath();c.moveTo(x,h*.12);c.lineTo(x,y);c.stroke();c.fillStyle='#9a6a48';c.beginPath();c.moveTo(x-w*.022,y);c.lineTo(x+w*.022,y);c.lineTo(x+w*.016,y+h*.045);c.lineTo(x-w*.016,y+h*.045);c.closePath();c.fill();for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*.42+Math.PI;fpLeaf(c,{k:'lance'},x,y+h*.01,a+(k%2?.15:-.1)-Math.PI,h*(.06+.03*Krand(k+i*9,61)),h*.012,'#5a8a48',0,false);}}}
 // the grain of the paper over everything
 const pat=fpPattern(c,'wall',0,1.2);if(pat){c.globalCompositeOperation='overlay';c.globalAlpha=.34;c.fillStyle=pat;c.fillRect(0,0,w,h);}
 c.restore();};}
function fpFrond(c,x,y,a,L,col){c.save();c.translate(x,y);c.rotate(a);c.strokeStyle=fpShade(col,.8);c.lineWidth=Math.max(1,L*.015);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(L*.5,-L*.08,L,L*.05);c.stroke();
 c.fillStyle=col;for(let i=1;i<14;i++){const u=i/14,px=u*L,py=-L*.08*Math.sin(Math.PI*u),l=L*.18*Math.sin(Math.PI*Math.pow(u,.7));for(const sd of [-1,1]){c.beginPath();c.ellipse(px+l*.3,py+sd*l*.45,l*.5,l*.13,sd*.9,0,K_TAU);c.fill();}}c.restore();}

// ── The scene ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// G: the game (G.flor is the state of flor.js) or null for the cards; s: settings; now: seconds (for the tools).
export function fpScene(c,w,h,G,s,preview=false,now){const F=G?.flor||fpPreviewState(),t=now??fpNowOf(F),decor=escDecor({background:s.background,base:s.base,opacity:s.opacity,preview});
 const lay=fpLayout(F,s,w,h,t),garden=FP_GARDENS[lay.garden],tintK=(FP_TINT[s.flTint]||1)*(decor.mode==='none'?0:decor.mode==='dim'?.55:1),reduced=!!s.reduced;
 // the clock of the scene's motion: it stops while the scene waits for the next press
 const wk=preview||s.waitCue===false?{idle:t,dark:0}:escWaitClock(F.wait||ESC_WAIT_START,t),T=wk.idle,dark=preview?0:(wk.dark||0)*.75;
 c.save();
 // the light of every flower, by how far its colour has spread
 const lights=[],amb=lay.garden===3?[.07,.08,.12]:[.05,.05,.06];
 const U=Math.min(h,w*.5625);for(const f of lay.flowers){if(f.tint<=.003)continue;const sp=f.sp,r=Math.min(sp.k==='spike'?f.R*.62:f.R,U*.21),a=f.tint*tintK;
  lights.push({x:f.x,y:f.y,rx:r*(1.5+2.9*f.tint),ry:r*(1.4+2.5*f.tint),color:sp.light,a:.58*a});
  sp.pool.forEach((col,i)=>{const an=i*2.1+f.seed,dd=r*(.8+1.3*f.tint);lights.push({x:f.x+Math.cos(an)*dd,y:f.y+Math.sin(an)*dd*.8,rx:r*(1.1+1.9*f.tint),ry:r*(1+1.6*f.tint),color:col,a:.4*a*(1-.15*i)});});}
 if(lay.finale>0){const fin=lay.finale;lay.flowers.forEach((f,i)=>{for(let k=0;k<4;k++){const x=((k/4+i/16+T*.03)%1)*w*1.2-w*.1,y=h*(.3+.12*Math.sin(x/w*K_TAU+T*.4+i));lights.push({x,y,rx:w*.22,ry:h*.18,color:f.sp.pool[k%f.sp.pool.length],a:.3*fin*tintK});}});}
 // the lit decor (the paper wall, multiplied by the light, and the glows) is a sheet that is drawn again only when the light changes:
 // while a flower opens or the garden plays its finale, every frame; while the garden waits, never (the pools of light do not turn)
 const glows=[];if(decor.mode!=='none'){for(const f of lay.flowers)if(f.tint>.003)glows.push([f.x,f.y,f.R*(1.4+2.6*f.tint),f.sp.light,.2*f.tint*tintK]);
  if(lay.finale>0)for(const f of lay.flowers)glows.push([f.x,f.y-h*.1,w*.3,f.sp.pool[0],.08*lay.finale*tintK]);}
 else for(const f of lay.flowers)if(f.tint>.003)glows.push([f.x,f.y,f.R*1.5,f.sp.light,(decor.white?.12:.22)*f.tint]);
 const q=x=>Math.round(x*100),ambient=`rgb(${Math.round(amb[0]*255)},${Math.round(amb[1]*255)},${Math.round(amb[2]*255)})`;
 const sig=[garden.id,lay.mirror?1:0,decor.mode,decor.fade,decor.base,q(w),q(h),...lights.map(L=>[q(L.x),q(L.y),q(L.rx),q(L.ry),L.color,Math.round(L.a*2000)].join()),'g',...glows.map(g=>[q(g[0]),q(g[1]),q(g[2]),g[3],Math.round(g[4]*2000)].join())].join('|');
 fpBackdrop(c,w,h,sig,bc=>{bc.fillStyle=decor.base;bc.fillRect(0,0,w,h);
  if(decor.mode!=='none'){escBlit(bc,'fp-wall-'+garden.id+(lay.mirror?'-m':''),w,h,fpWall(garden.id,lay.mirror));escLight(bc,w,h,ambient,lights);}
  escGlowLayer(bc,w,h,gc=>{for(const g of glows)escGlow(gc,g[0],g[1],g[2],g[3],g[4]);});if(decor.mode!=='none')escVeil(bc,decor,0,0,w,h);},t,lay.finale>0?1/15:1/31);
 // the life of the garden moves every frame, over the sheet (under the veil of a dimmed decor, as faint as the decor)
 if(decor.mode!=='none'){c.save();c.globalAlpha*=decor.fade;fpGardenLife(c,w,h,lay,garden,T,s,reduced);c.restore();}
 // stems and leaves, then the flowers, far to near
 const order=lay.flowers.slice().sort((a,b)=>b.z-a.z);
 for(const f of order){const l=fpLightAt(lights,amb,f.x,f.y+f.R),lit=decor.mode==='none'?(decor.white?[.75,.75,.75]:[.55,.55,.55]):[Math.min(1.1,l[0]*1.4+.08),Math.min(1.1,l[1]*1.4+.08),Math.min(1.1,l[2]*1.4+.08)];
  fpStem(c,f,lit,h,decor,T);}
 for(const f of order){const sp=f.sp,dimBud=f.p<=0?.62*(1-f.wake):0,st={x:f.x,y:f.y,R:f.R,p:f.p,wake:f.wake,t:T,breath:reduced?0:f.breath,yaw:f.yaw,dim:Math.max(dimBud,f.fold*.4),rim:sp.light,white:decor.white,glow:1,seed:f.seed,alpha:f.alpha,lean:f.lean,sway:f.sway};
  if(!fpSpriteDraw(c,f,sp,st))fpFlower(c,sp,st);}
 if(s.flCreatures!==false)fpCreatures(c,w,h,lay,T,reduced,lights,amb);
 if(lay.finale>0)fpFinale(c,w,h,lay,garden,T,reduced);
 if(dark>0){c.fillStyle=`rgba(0,0,0,${dark.toFixed(3)})`;c.fillRect(0,0,w,h);}
 escFrame();FP_SPRITE_N++;c.restore();}

// ── The sheet of the lit decor ─────────────────────────────────────────────────────────────────────────────────────────────
// One canvas at the resolution of the screen; sig says what is on it, and it is drawn again only when sig changes, at most 30 times a
// second of the scene's time t, 15 in the finale (soft light that changes slowly needs no more; a change left waiting is drawn at the
// next frame).
let FP_BACK=null;
function fpBackdrop(c,w,h,sig,draw,t=0,every=1/31){const m=c.getTransform?c.getTransform():null,k=m?Math.hypot(m.a,m.b)||1:1,W=Math.max(1,Math.round(w*k)),H=Math.max(1,Math.round(h*k));
 if(!m||Math.abs(m.b)>1e-6||Math.abs(m.c)>1e-6){draw(c);return;}
 if(!FP_BACK||FP_BACK.cv.width!==W||FP_BACK.cv.height!==H){const cv=escCanvas(W,H),bc=cv?.getContext?.('2d');if(!bc||!bc.setTransform){draw(c);return;}FP_BACK={cv,sig:null,t:-1};}
 const key=sig+'|'+k;if(FP_BACK.sig!==key&&!(FP_BACK.sig!==null&&t>FP_BACK.t&&t-FP_BACK.t<every)){const bc=FP_BACK.cv.getContext('2d');bc.setTransform(k,0,0,k,0,0);bc.globalCompositeOperation='source-over';bc.globalAlpha=1;draw(bc);FP_BACK.sig=key;FP_BACK.t=t;}
 c.drawImage(FP_BACK.cv,0,0,w,h);}

// ── Flower sheets ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// A flower that is not moving (a closed bud, or wide open) is drawn once, petal by petal, into a sheet of its own at the resolution
// of the screen, and the sheet is copied every frame: only the flower that is opening (or folding) is drawn petal by petal. The breath
// of an open flower (a swell of 1.5 %) and the sway of the spikes, the sprays and the calla are given to the copy. The sheet is laid
// on whole device pixels, so a flower at rest is as sharp as when it is drawn directly.
const FP_SPRITES=new Map();let FP_SPRITE_N=0;
const FP_SPRITE_MAX=10;
function fpSpriteDraw(c,f,sp,st){if(!(st.alpha>0))return true;const still=!(f.fold>0)&&(st.p>=1&&st.wake>=1||st.p<=0&&st.wake<=0);if(!still||!c.getTransform)return false;
 const m=c.getTransform();if(!m||Math.abs(m.b)>1e-6||Math.abs(m.c)>1e-6||Math.abs(m.a-m.d)>1e-6)return false;const k=m.a,half=Math.ceil(st.R*1.45*k)+2;if(!(k>0)||2*half>4096)return false;
 const dx=m.a*st.x+m.e,dy=m.d*st.y+m.f,ix=Math.floor(dx),iy=Math.floor(dy),fx=Math.round((dx-ix)*4)/4,fy=Math.round((dy-iy)*4)/4;
 const key=[f.id,sp===FP_SPECIES[f.id]?0:1,Math.round(st.R*k*4),Math.round(st.yaw*1000),Math.round(st.dim*1000),st.white?1:0,Math.round(st.seed*100),st.lean,st.p>=1?1:0,fx,fy].join('|');
 let e=FP_SPRITES.get(key);
 if(!e){const cv=escCanvas(2*half,2*half),sc=cv?.getContext?.('2d');if(!sc||!sc.setTransform)return false;sc.setTransform(k,0,0,k,half+fx-k*st.x,half+fy-k*st.y);
  fpFlower(sc,sp,{...st,breath:0,sway:0,alpha:1});e={cv,half};FP_SPRITES.set(key,e);
  if(FP_SPRITES.size>FP_SPRITE_MAX){let old=null,ou=Infinity;for(const [kk,v] of FP_SPRITES)if(v!==e&&v.used<ou){ou=v.used;old=kk;}if(old){const v=FP_SPRITES.get(old);v.cv.width=v.cv.height=1;FP_SPRITES.delete(old);}}}
 e.used=FP_SPRITE_N;
 // the motion given to the copy
 const br=(st.breath||0)*Math.sin((st.t||0)*1.35+(st.seed||0)),sw=st.sway||0,R=st.R*k;
 c.save();c.setTransform(1,0,0,1,ix+fx,iy+fy);c.globalAlpha*=st.alpha;
 if(sp.k==='spike'){const y0=sp.spike.len*R*.38;c.translate(0,y0);c.transform(1,0,-sw*.15/sp.spike.len,1,0,0);c.translate(0,-y0);}
 else if(sp.k==='cluster'){const y0=R*.05;c.translate(0,y0);c.transform(1,0,-sw*.15,1,0,0);c.translate(0,-y0);}
 else if(sp.k==='funnel')c.translate(sw*R*.05,0);
 if(sp.k!=='spike'&&br)c.scale(1+.015*br,1+.015*br);
 c.drawImage(e.cv,-e.half-fx,-e.half-fy);c.restore();return true;}

// The stem and the leaves of one flower, lit by the light at its foot.
function fpStem(c,f,lit,h,decor,T){const sp=f.sp,st=sp.stem||{},alpha=f.alpha??1;if(alpha<=0||sp.k==='spike'&&!sp.leaves)return;c.save();c.globalAlpha*=alpha;
 const col=fpLitRGB(st.col||'#4a6a34',lit),leafCol=fpLitRGB(st.leaf||Kmix(st.col||'#4a6a34','#3a6a2a',.3),lit),dim=f.p<=0?.6:0;
 const bx=f.sx,by=h*1.02,hx=f.x+(f.sway||0)*f.R*.15,hy=f.y+(sp.k==='spike'?f.R*.7:f.R*.05);
 if(!st.water&&sp.k!=='spike'){const wdt=Math.max(1.5,f.R*(st.w||.03));c.strokeStyle=fpShade(col,.55);c.lineWidth=wdt+1.5;c.lineCap='round';const path=()=>{c.beginPath();c.moveTo(bx,by);c.bezierCurveTo(bx,fpL(by,hy,.55),hx+(st.arch?f.R*.6:0),hy+f.R*.9,hx,hy);};
  path();c.stroke();c.strokeStyle=col;c.lineWidth=wdt;path();c.stroke();c.strokeStyle=Krgba(fpShade(col,1.5),.35);c.lineWidth=wdt*.35;path();c.stroke();}
 if(sp.k==='spike'){c.strokeStyle=col;c.lineWidth=Math.max(1.5,f.R*.03);c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx,(by+hy)/2,hx,hy);c.stroke();}
 for(const L of sp.leaves||[]){const at=L.at||0,px=fpL(bx,hx,at*at),py=fpL(by,hy,at),side=L.side||1,len=f.R*(L.len||.6)*fpL(.85,1,Ksmooth(f.wake)),wd=len*(L.wid||.22);
  if(L.k==='pad'){const yy=st.water?f.y+f.R*.12:py;fpLeaf(c,L,f.x+side*f.R*(.05+.45*Math.abs(side)),yy,side>0?-.12:Math.PI+.12,len,wd,leafCol,dim);continue;}
  const ang=at<.12?-Math.PI/2+side*((L.spread??1.15)+.15*Math.sin(T*.4+f.seed)*.2):-Math.PI/2+side*(.75+.06*Math.sin(T*.5+f.seed+at*3));fpLeaf(c,L,px,py-(at<.12?f.R*.05:0),ang,len,wd,leafCol,dim);}
 c.restore();}

// ── Garden life: water shimmer, the moon and stars, rain on the glass, dust in the light ────────────────────────────────────
function fpGardenLife(c,w,h,lay,G,T,s,reduced){c.save();
 if(G.id==='estany'){c.globalCompositeOperation='lighter';for(const f of lay.flowers){if(f.tint<=.01)continue;for(let i=0;i<10;i++){const y=h*.6+i*h*.035,x=f.x+Math.sin(T*.8+i*1.7+f.seed)*f.R*.2,len=f.R*(1.2-.08*i)*f.tint;c.fillStyle=Krgba(f.sp.light,.12*f.tint*(1-i/12));c.fillRect(x-len/2,y,len,Math.max(1,h*.004));}}}
 if(G.id==='nit'){const mx=lay.mirror?w*.16:w*.84,my=h*.16,mr=h*.07;c.globalCompositeOperation='lighter';escGlow(c,mx,my,mr*4,'#c8d4ff',.12);c.globalCompositeOperation='source-over';
  const g=c.createRadialGradient(mx-mr*.3,my-mr*.3,0,mx,my,mr);g.addColorStop(0,'#fbf6e2');g.addColorStop(1,'#d8d2b8');c.fillStyle=g;c.beginPath();c.arc(mx,my,mr,0,K_TAU);c.fill();const pat=fpPattern(c,'wall',0,.6);if(pat){c.globalCompositeOperation='multiply';c.globalAlpha=.25;c.fillStyle=pat;c.fill();c.globalAlpha=1;}
  c.globalCompositeOperation='lighter';for(let i=0;i<40;i++){const x=Krand(i,81)*w,y=Krand(i,82)*h*.45,a=.25+.25*Math.sin(T*.5+i);c.fillStyle=Krgba('#e8ecff',a*.6);c.beginPath();c.arc(x,y,Math.max(.6,h*.0016),0,K_TAU);c.fill();}}
 if(G.id==='hivernacle'&&!reduced){c.globalCompositeOperation='lighter';c.strokeStyle='rgba(200,220,230,.07)';c.lineWidth=Math.max(1,h*.0012);for(let i=0;i<50;i++){const x=Krand(i,91)*w,y=((Krand(i,92)+T*.12)%1)*h*.8;c.beginPath();c.moveTo(x,y);c.lineTo(x-h*.006,y+h*.05);c.stroke();}}
 if((G.id==='prat'||G.id==='bosc')&&!reduced){c.globalCompositeOperation='lighter';for(const f of lay.flowers){if(f.tint<=.05)continue;for(let i=0;i<12;i++){const a=i*2.4+f.seed,rr=f.R*(1+1.8*((i*.37+T*.04)%1)),x=f.x+Math.cos(a+T*.1)*rr,y=f.y+Math.sin(a+T*.07)*rr*.7-((T*.03+i*.1)%1)*f.R*.6;c.fillStyle=Krgba(f.sp.pool[i%f.sp.pool.length],.35*f.tint);c.beginPath();c.arc(x,y,Math.max(.8,h*.0022),0,K_TAU);c.fill();}}}
 c.restore();}

// ── Creatures (small and far, no faces) ─────────────────────────────────────────────────────────────────────────────────
function fpCreatures(c,w,h,lay,T,reduced,lights,amb){for(const f of lay.flowers){const k=f.sp.creature,a=f.visit;if(!k||!(a>0)||(f.alpha??1)<=0)continue;const fn=FP_CREATURES[k];if(!fn)continue;
  const l=fpLightAt(lights,amb,f.x,f.y),lit=Math.min(1.15,.35+.75*Math.max(l[0],l[1],l[2]));c.save();c.globalAlpha*=(f.alpha??1)*Kclamp(a*3);fn(c,f,a,reduced?T*.15:T,h,w,lit);c.restore();}}
const fpWing=(c,x,y,rx,ry,rot,col)=>{c.save();c.translate(x,y);c.rotate(rot);c.fillStyle=col;c.beginPath();c.ellipse(0,0,rx,ry,0,0,K_TAU);c.fill();c.restore();};
// The path of a flying visitor: it comes in from the near edge of the screen and then loops gently beside the flower (never over its
// heart), on the outer side.
function fpVisitPos(f,a,T,h,w,o={}){const side=f.x<w*.5?-1:1,arrive=KeaseOut(Kclamp(a*1.4)),hx=f.x+side*f.R*(o.out??1.05),hy=f.y-f.R*(o.up??.3);
 const ox=side<0?-w*.06:w*1.06,oy=hy-h*.25,r=f.R*(o.r??.22),sp=o.sp??.7,lx=hx+Math.cos(T*sp+f.seed)*r+Math.sin(T*sp*.37+f.seed)*r*.6,ly=hy+Math.sin(T*sp*1.3+f.seed)*r*.6;
 return [fpL(ox,lx,arrive),fpL(oy,ly,arrive),side];}
// a pair of wings that beat: the near pair seen growing and shrinking (the beat is slow enough to stay soft)
const fpFlap=(T,rate)=>.35+.65*Math.abs(Math.cos(T*rate));
function fpButterfly(c,x,y,s,T,col,edge,spot,lit){const f=fpFlap(T,7);c.save();c.translate(x,y);c.rotate(Math.sin(T*1.7)*.15);
 for(const sd of [-1,1]){c.save();c.scale(sd*f,1);c.fillStyle=fpShade(col,lit);c.beginPath();c.moveTo(0,-s*.1);c.bezierCurveTo(s*.5,-s*1.3,s*1.5,-s*1.1,s*1.25,-s*.2);c.bezierCurveTo(s*1.1,s*.1,s*.4,s*.1,0,0);c.fill();
  c.beginPath();c.moveTo(0,0);c.bezierCurveTo(s*.6,s*.1,s*1.05,s*.5,s*.75,s*.95);c.bezierCurveTo(s*.45,s*1.05,s*.15,s*.5,0,s*.1);c.fill();
  if(edge){c.fillStyle=fpShade(edge,lit);c.beginPath();c.moveTo(s*.85,-s*1.05);c.bezierCurveTo(s*1.2,-s*1.1,s*1.45,-s*.9,s*1.3,-s*.45);c.bezierCurveTo(s*1.1,-s*.7,s*.95,-s*.85,s*.85,-s*1.05);c.fill();}
  if(spot){c.fillStyle=fpShade(spot,lit);c.beginPath();c.arc(s*.75,-s*.55,s*.13,0,K_TAU);c.fill();c.beginPath();c.arc(s*.5,s*.45,s*.1,0,K_TAU);c.fill();}
  c.strokeStyle=Krgba(fpShade(edge||col,.4),.6);c.lineWidth=Math.max(.5,s*.04);c.beginPath();c.moveTo(0,-s*.1);c.bezierCurveTo(s*.5,-s*1.3,s*1.5,-s*1.1,s*1.25,-s*.2);c.stroke();c.restore();}
 c.fillStyle=fpShade('#2a2420',lit);c.beginPath();c.ellipse(0,s*.2,s*.09,s*.55,0,0,K_TAU);c.fill();c.strokeStyle=fpShade('#2a2420',lit);c.lineWidth=Math.max(.5,s*.03);c.beginPath();c.moveTo(0,-s*.3);c.lineTo(-s*.25,-s*.75);c.moveTo(0,-s*.3);c.lineTo(s*.25,-s*.75);c.stroke();c.restore();}
function fpBee(c,x,y,s,T,body,band,wing,lit,big){const fl=Math.sin(T*9)*.4;fpWing(c,x-s*.3,y-s*.8,s*.95,s*.48,-.6+fl,wing);fpWing(c,x+s*.3,y-s*.8,s*.95,s*.48,.6-fl,wing);
 c.fillStyle=fpShade(body,lit);c.beginPath();c.ellipse(x,y,s*1.3,s*(big?.95:.8),.12,0,K_TAU);c.fill();if(band){c.fillStyle=fpShade(band,lit);for(const d of big?[-.2]:[-.45,.25])c.fillRect(x+d*s,y-s*.75,s*.38,s*1.5);}
 c.fillStyle=fpShade('#1e1612',lit);c.beginPath();c.arc(x-s*1.3,y,s*.5,0,K_TAU);c.fill();}
export const FP_CREATURES={
 abella(c,f,a,T,h,w,lit){const [x,y]=fpVisitPos(f,a,T,h,w,{sp:1.1});fpBee(c,x,y,h*.011,T,'#d8a020','#2a1a10','rgba(230,240,255,.55)',lit);},
 borinot(c,f,a,T,h,w,lit){const [x,y]=fpVisitPos(f,a,T,h,w,{sp:.7,out:.8,up:-.1});const s=h*.015;fpBee(c,x,y,s,T,'#1e1612',null,'rgba(220,230,250,.5)',lit,true);
  c.fillStyle=fpShade('#e8b830',lit);c.beginPath();c.ellipse(x-s*.15,y,s*.42,s*.9,0,0,K_TAU);c.fill();c.fillStyle=fpShade('#f2efe6',lit);c.beginPath();c.ellipse(x+s*1,y,s*.36,s*.7,0,0,K_TAU);c.fill();},
 fusteria(c,f,a,T,h,w,lit){const [x,y]=fpVisitPos(f,a,T,h,w,{sp:.6});fpBee(c,x,y,h*.016,T,'#1a1426',null,'rgba(120,90,200,.45)',lit,true);},
 papallona(c,f,a,T,h,w,lit){const [x,y]=fpVisitPos(f,a,T,h,w,{sp:.5,r:.35,up:.55});fpButterfly(c,x,y,h*.018,T,'#f6f4ea','#3a3a36','#4a4a44',lit);},
 papallonaMarro(c,f,a,T,h,w,lit){const [x,y]=fpVisitPos(f,a,T,h,w,{sp:.45,r:.3,up:.5});fpButterfly(c,x,y,h*.017,T,'#7a5a34','#4a3420','#f0d890',lit);},
 morfo(c,f,a,T,h,w,lit){const [x,y]=fpVisitPos(f,a,T,h,w,{sp:.4,r:.35,up:.55});fpButterfly(c,x,y,h*.022,T,'#3a8af0','#0e1a40',null,lit);},
 arna(c,f,a,T,h,w,lit){const [x,y]=fpVisitPos(f,a,T,h,w,{sp:1.3,r:.45,up:.2,out:.7});fpButterfly(c,x+Math.sin(T*3.1)*f.R*.06,y,h*.014,T*1.4,'#d8d0bc','#a89c80',null,lit);},
 libellula(c,f,a,T,h,w,lit){const [x,y]=fpVisitPos(f,a,T,h,w,{sp:.35,r:.3,up:.7}),s=h*.014,fl=Math.sin(T*6)*.2;
  for(const sd of [-1,1]){fpWing(c,x+sd*s*1.4,y-s*.2,s*1.6,s*.35,sd*(.15+fl),'rgba(210,235,255,.45)');fpWing(c,x+sd*s*1.3,y+s*.4,s*1.4,s*.3,sd*(-.2-fl),'rgba(210,235,255,.4)');}
  c.strokeStyle=fpShade('#2a6ab0',lit);c.lineWidth=s*.45;c.lineCap='round';c.beginPath();c.moveTo(x,y-s*.6);c.lineTo(x,y+s*3.2);c.stroke();c.fillStyle=fpShade('#3a8ad0',lit);c.beginPath();c.arc(x,y-s*.7,s*.5,0,K_TAU);c.fill();},
 cavallserp(c,f,a,T,h,w,lit){const [x,y,side]=fpVisitPos(f,a,T,h,w,{sp:.3,r:.25,up:.1,out:1.2}),s=h*.013,fl=Math.sin(T*6)*.18;c.save();c.translate(x,y);c.rotate(side*.25);
  for(const sd of [-1,1]){fpWing(c,sd*s*1.5,-s*.2,s*1.7,s*.33,sd*(.1+fl),'rgba(255,230,210,.45)');fpWing(c,sd*s*1.4,s*.4,s*1.5,s*.3,sd*(-.15-fl),'rgba(255,230,210,.4)');}
  c.strokeStyle=fpShade('#d03a28',lit);c.lineWidth=s*.5;c.lineCap='round';c.beginPath();c.moveTo(0,-s*.5);c.lineTo(0,s*3.2);c.stroke();c.fillStyle=fpShade('#a82a1c',lit);c.beginPath();c.arc(0,-s*.7,s*.55,0,K_TAU);c.fill();c.restore();},
 colibri(c,f,a,T,h,w,lit){const [x,y,side]=fpVisitPos(f,a,T,h,w,{sp:.45,r:.15,up:.05,out:1.1}),s=h*.016,dir=-side;c.save();c.translate(x,y);c.scale(dir,1);
  c.fillStyle='rgba(200,230,220,.35)';c.beginPath();c.ellipse(-s*.2,-s*1.1,s*.6,s*1.6,-.5+Math.sin(T*12)*.5,0,K_TAU);c.fill();c.fillStyle=fpShade('#2f8a5a',lit);c.beginPath();c.ellipse(0,0,s*1.4,s*.75,-.25,0,K_TAU);c.fill();c.fillStyle=fpShade('#c0304a',lit);c.beginPath();c.ellipse(-s*.9,s*.15,s*.45,s*.4,0,0,K_TAU);c.fill();
  c.fillStyle=fpShade('#2a5a40',lit);c.beginPath();c.arc(-s*1.5,-s*.35,s*.55,0,K_TAU);c.fill();c.strokeStyle='#1a1a1a';c.lineWidth=s*.18;c.beginPath();c.moveTo(-s*2,-s*.35);c.lineTo(-s*3.4,-s*.1);c.stroke();c.fillStyle=fpShade('#1e4030',lit);c.beginPath();c.moveTo(s*1.2,0);c.lineTo(s*2.4,-s*.4);c.lineTo(s*2.3,s*.4);c.closePath();c.fill();c.restore();},
 // the ladybird walks slowly along the rim of the flower
 marieta(c,f,a,T,h,w,lit){const an=-.9+Math.sin(T*.12+f.seed)*.8,x=f.x+Math.cos(an)*f.R*.78,y=f.y+Math.sin(an)*f.R*.72,s=h*.009;c.save();c.translate(x,y);c.rotate(an+Math.PI/2);
  c.fillStyle=fpShade('#1a1210',lit);c.beginPath();c.arc(0,-s*1.05,s*.55,0,K_TAU);c.fill();c.fillStyle=fpShade('#d81e1a',lit);c.beginPath();c.ellipse(0,0,s*1.05,s*1.2,0,0,K_TAU);c.fill();
  c.strokeStyle=fpShade('#1a1210',lit);c.lineWidth=Math.max(.5,s*.12);c.beginPath();c.moveTo(0,-s*1.2);c.lineTo(0,s*1.2);c.stroke();c.fillStyle=fpShade('#1a1210',lit);for(const [dx,dy] of [[-.5,-.4],[.5,-.4],[-.55,.45],[.55,.45],[0,-.85]]){c.beginPath();c.arc(dx*s,dy*s,s*.2,0,K_TAU);c.fill();}
  c.fillStyle=Krgba('#ffffff',.35);c.beginPath();c.ellipse(-s*.35,-s*.5,s*.25,s*.15,-.5,0,K_TAU);c.fill();c.restore();},
 // the frog jumps onto the lotus leaf and sits there; now and then it shifts
 granota(c,f,a,T,h,w,lit){const side=f.x<w*.5?1:-1,px=f.x+side*f.R*(.05+.45)+side*f.R*1.25*.5,py=f.y+f.R*.12,j=Kclamp(a*1.5),x=fpL(px+side*f.R*1.4,px,j),y=fpL(py+h*.08,py,j)-Math.sin(j*Math.PI)*h*.09-Math.max(0,Math.sin(T*.4+f.seed)-.96)*h*.6,s=h*.016;
  c.save();c.translate(x,y);c.scale(-side,1);c.fillStyle=fpShade('#3e7a30',lit);c.beginPath();c.ellipse(0,-s*.6,s*1.3,s*.75,-.2,0,K_TAU);c.fill();c.beginPath();c.ellipse(-s*1,-s*1.1,s*.55,s*.45,0,0,K_TAU);c.fill();
  c.fillStyle=fpShade('#5a9a3a',lit);c.beginPath();c.arc(-s*1.1,-s*1.45,s*.25,0,K_TAU);c.fill();c.beginPath();c.arc(-s*.7,-s*1.5,s*.25,0,K_TAU);c.fill();
  c.strokeStyle=fpShade('#2e5a24',lit);c.lineWidth=s*.35;c.lineCap='round';c.beginPath();c.moveTo(s*.6,-s*.4);c.lineTo(s*1.3,-s*.1);c.lineTo(s*.6,0);c.moveTo(-s*.8,-s*.3);c.lineTo(-s*1.1,0);c.stroke();
  c.fillStyle=fpShade('#d8e0a0',lit);c.beginPath();c.ellipse(-s*.4,-s*.25,s*.7,s*.22,-.1,0,K_TAU);c.fill();c.restore();},
 // drops of water gather at the tip and fall, one by one, with a ring where they land
 gotes(c,f,a,T,h,w,lit){const tx=f.x+f.R*.05,ty=f.y-f.R*.15;for(let i=0;i<3;i++){const ph=((T*.22+i/3+f.seed*.1)%1),x=tx+(i-1)*f.R*.35,y0=ty+f.R*(.2+.25*Math.abs(i-1)),fallY=f.y+f.R*1.6;
  if(ph<.6){const r=h*.004*(.4+ph);c.fillStyle=Krgba('#e8f4ff',.75*lit);c.beginPath();c.arc(x,y0+r,r,0,K_TAU);c.fill();}else if(ph<.85){const q=(ph-.6)/.25,y=fpL(y0,fallY,q*q);c.fillStyle=Krgba('#e8f4ff',.8*lit);c.beginPath();c.ellipse(x,y,h*.003,h*.005,0,0,K_TAU);c.fill();}
  else{const q=(ph-.85)/.15;c.strokeStyle=Krgba('#e8f4ff',.5*(1-q)*lit);c.lineWidth=Math.max(.6,h*.0015);c.beginPath();c.ellipse(x,fallY,h*.02*q,h*.005*q,0,0,K_TAU);c.stroke();}}},
 // the snail crawls along the ground below the cyclamen
 cargol(c,f,a,T,h,w,lit){const side=f.x<w*.5?1:-1,x=f.sx+side*f.R*(1.3-.5*Kclamp(a*1.2))+Math.sin(T*.05)*f.R*.1,y=h*.93,s=h*.016;c.save();c.translate(x,y);c.scale(-side,1);
  c.fillStyle=fpShade('#c8b090',lit);c.beginPath();c.moveTo(-s*1.6,0);c.quadraticCurveTo(-s*1.7,-s*.9,-s*1.2,-s*1.1);c.lineTo(-s*1.1,-s*.5);c.lineTo(s*1.4,-s*.1);c.lineTo(s*1.5,0);c.closePath();c.fill();
  c.strokeStyle=fpShade('#a89070',lit);c.lineWidth=Math.max(.5,s*.08);c.beginPath();c.moveTo(-s*1.25,-s*1.1);c.lineTo(-s*1.45,-s*1.6);c.moveTo(-s*1.1,-s*1.05);c.lineTo(-s*1.1,-s*1.6);c.stroke();
  const g=c.createRadialGradient(-s*.1,-s*1,0,0,-s*.9,s*1.1);g.addColorStop(0,fpShade('#e0b070',lit));g.addColorStop(1,fpShade('#8a5a28',lit));c.fillStyle=g;c.beginPath();c.arc(0,-s*.9,s*.95,0,K_TAU);c.fill();
  c.strokeStyle=fpShade('#5a3818',lit);c.lineWidth=Math.max(.6,s*.1);c.beginPath();for(let i=0;i<=40;i++){const an=i/40*K_TAU*2.2,r=s*.85*(1-i/46);i?c.lineTo(Math.cos(an)*r,-s*.9+Math.sin(an)*r):c.moveTo(Math.cos(an)*r,-s*.9+Math.sin(an)*r);}c.stroke();c.restore();},
 // the blackbird lands on the ground near the peony and hops (a silhouette)
 merla(c,f,a,T,h,w,lit){const side=f.x<w*.5?1:-1,j=Kclamp(a*1.3),gx=f.sx-side*f.R*1.2,gy=h*.9,x=fpL(gx-side*w*.3,gx,KeaseOut(j))+Math.max(0,Math.sin(T*.6+f.seed)-.8)*side*f.R*.5,y=fpL(gy-h*.3,gy,j)-Math.max(0,Math.sin(T*1.8+f.seed))*Math.max(0,Math.sin(T*.6+f.seed)-.8)*h*.08,s=h*.02;
  c.save();c.translate(x,y);c.scale(side,1);const flying=j<1;c.fillStyle=fpShade('#16120f',lit);c.beginPath();c.ellipse(0,-s*.9,s*1.1,s*.62,-.15,0,K_TAU);c.fill();c.beginPath();c.arc(s*.95,-s*1.35,s*.45,0,K_TAU);c.fill();
  c.beginPath();c.moveTo(-s*.8,-s*.9);c.lineTo(-s*2.1,-s*1.35);c.lineTo(-s*2,-s*.95);c.closePath();c.fill();c.fillStyle=fpShade('#f0a020',lit);c.beginPath();c.moveTo(s*1.3,-s*1.42);c.lineTo(s*1.85,-s*1.3);c.lineTo(s*1.3,-s*1.22);c.closePath();c.fill();
  if(flying){c.fillStyle=fpShade('#221c18',lit);c.beginPath();c.ellipse(-s*.1,-s*1.5,s*1.2,s*.35,-.6+Math.sin(T*10)*.5,0,K_TAU);c.fill();}else{c.strokeStyle=fpShade('#3a2a1a',lit);c.lineWidth=Math.max(.6,s*.1);c.beginPath();c.moveTo(0,-s*.4);c.lineTo(-s*.1,0);c.moveTo(s*.3,-s*.4);c.lineTo(s*.3,0);c.stroke();}c.restore();},
 // fireflies: a few soft lights that glow and fade slowly round the flower
 lluernes(c,f,a,T,h,w,lit){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const an=f.seed+i*1.3+T*.12,x=f.x+Math.cos(an)*f.R*(1.1+.3*Math.sin(T*.3+i)),y=f.y+Math.sin(an*1.3)*f.R*.6-f.R*.1,g=Kclamp(.5+.5*Math.sin(T*.9+i*2.1));
  if(g<.05)continue;escGlow(c,x,y,h*.022,'#e8ff9a',.45*g*Kclamp(a*2));c.fillStyle=Krgba('#f4ffc0',.9*g);c.beginPath();c.arc(x,y,Math.max(.8,h*.0025),0,K_TAU);c.fill();}c.restore();}
};

// ── The finale of each garden ───────────────────────────────────────────────────────────────────────────────────────────────
function fpFinale(c,w,h,lay,G,T,reduced){const fin=lay.finale;if(fin<=0||reduced&&G.id!=='nit')return;c.save();
 if(G.id==='prat'){for(let i=0;i<40;i++){const u=(lay.finT*.09+Krand(i,101))%1,x=u*w*1.3-w*.15,y=h*(.25+.5*Krand(i,102))+Math.sin(u*9+i)*h*.05,f=lay.flowers[i%lay.flowers.length];c.save();c.translate(x,y);c.rotate(u*12+i);c.globalAlpha=fin*.85;
   c.fillStyle=f.sp.whorls?.[1]?.col?.[1]||f.sp.light;c.beginPath();c.ellipse(0,0,h*.012,h*.007,0,0,K_TAU);c.fill();c.restore();}}
 if(G.id==='estany'){c.globalCompositeOperation='lighter';for(const f of lay.flowers)for(let k=0;k<3;k++){const r=((lay.finT*.25+k/3)%1),rr=f.R*(.5+2.5*r);c.strokeStyle=Krgba(f.sp.light,.25*fin*(1-r));c.lineWidth=Math.max(1,h*.003);c.beginPath();c.ellipse(f.x,f.y+f.R*.2,rr,rr*.25,0,0,K_TAU);c.stroke();}}
 if(G.id==='bosc'){for(let i=0;i<26;i++){const u=(lay.finT*.06+Krand(i,111))%1,x=w*Krand(i,112)+Math.sin(u*7+i)*w*.04,y=u*h*1.1-h*.05;c.save();c.translate(x,y);c.rotate(Math.sin(u*6+i)*1.2);c.globalAlpha=fin*.9;c.fillStyle=['#b8742a','#9a5a24','#c89a3a'][i%3];c.beginPath();c.moveTo(-h*.014,0);c.lineTo(0,-h*.008);c.lineTo(h*.014,0);c.lineTo(0,h*.008);c.closePath();c.fill();c.restore();}}
 if(G.id==='nit'){c.globalCompositeOperation='lighter';for(let i=0;i<30;i++){const u=(lay.finT*.05+i/30)%1,x=w*(.1+.8*u),y=h*(.55-.25*Math.sin(u*Math.PI))+Math.sin(i*1.3+lay.finT)*h*.02;escGlow(c,x,y,h*.025,'#e8ff9a',.5*fin*(.5+.5*Math.sin(i+lay.finT*.6)));}}
 if(G.id==='hivernacle'){c.globalCompositeOperation='lighter';for(let i=0;i<70;i++){const x=Krand(i,121)*w,y=((Krand(i,122)+lay.finT*.35)%1)*h;c.strokeStyle=`rgba(210,235,255,${(.28*fin).toFixed(3)})`;c.lineWidth=Math.max(1,h*.0018);c.beginPath();c.moveTo(x,y);c.lineTo(x-h*.004,y+h*.03);c.stroke();}}
 c.restore();}

// The state shown on the card of the activity and on the home page: the meadow with the poppy, the daisy and the sunflower open and
// the cornflower still a bud (opening times are clock times of the model, so they are positive).
function fpPreviewState(){return {preview:true,mode:'jardi',g:0,lap:0,n:4,opened:[200,150,100,null],count:3,phase:'rest',at:100,t:300,appear:0,presses:3,wait:null};}
