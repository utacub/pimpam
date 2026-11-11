// El vestidor fantàstic (EN06, 0.73): the movements. A state says how a figure is drawn at a moment: moved (dx, in drawing pixels),
// lifted, turned, squashed or stretched, turned round like a cut-out (a negative sx), its top leaning or swaying, its face, its pose
// (0 at rest, 1 with the arms up), the cape rolled up, a hat or a crown that moves by itself, the parrot, the object floating by its side,
// and the little things around it (petals, bubbles, stars, flour, drops, notes, a ribbon). The gags of putting on each piece (3 to 5 s:
// the plan's catalogue) and the number on the stage (the feet say how the artist walks, the body how it moves, the head what happens
// above, the object brings the climax) are functions of time only, so any moment can be drawn again exactly.
import {VS_ACTS,vsClamp,vsEase,vsOut,vsIn,vsPh,vsSettle,vsHash,VS_FACE} from './vestidor.js';
const VS_TAU=Math.PI*2;
// A turn of the cut-out: cos of the angle, but never narrower than about a third (in a spin the cut-out squashes, it never becomes a line).
export const vsTurn=a=>{const c=Math.cos(a);return Math.sign(c||1)*Math.max(.3,Math.abs(c));};
export function vsState(){return {dx:0,lift:0,rot:0,sx:1,sy:1,lean:0,wa:0,wp:0,face:0,pose:0,roll:false,hat:null,crown:null,parrot:null,obj:null,fx:[]};}
const VS_F=VS_FACE;
// The parrot of the pirate hat: it flies in from the right, lands on the brim, squawks and flaps (LLORO-5 flies up, 6 down, 1 perched,
// 2 squawks, 3 wings open, 4 pleased). Its position is an offset from its perch, in the drawing's pixels.
export function vsParrotIn(g){if(g<0)return null;if(g<.9){const u=vsEase(g/.9);return {pic:6,dx:520*(1-u),dy:-380*(1-u)+60*Math.sin(u*Math.PI),flip:false};}
 if(g<1.5)return {pic:2,dx:0,dy:0};if(g<2.1)return {pic:3,dx:0,dy:-8*Math.sin((g-1.5)*VS_TAU*2)};return {pic:g%1.6<.4?2:4,dx:0,dy:0};}
// The parrot while the artist performs: perched, squawking on some steps, now and then flapping.
export function vsParrotIdle(t,seed=0){const k=(t+seed)%3.2;return {pic:k<.35?2:k<1.1?1:k<1.5?3:k<2.6?4:1,dx:0,dy:k>=1.1&&k<1.5?-10*Math.sin((k-1.1)*VS_TAU*2.5):0};}
// ── the gags of putting a piece on (g: seconds since it landed; up to about 3.2 s) ─────────────────────────────────────────────────
export const VS_GAG_LEN=3.2;
export function vsGag(slot,id,g,S,o={}){const fade=1-vsPh(g,VS_GAG_LEN-.5,VS_GAG_LEN);
 if(slot==='cap'){
  if(id==='pirata'){S.parrot=vsParrotIn(g-.15);S.face=g<.5?VS_F.sorpresa:g<2.4?VS_F.riu:0;return;}
  if(id==='ballarina'){S.fx.push({k:'petals',at:'head',t:g,n:14});S.face=g<1.8?VS_F.parpelleig:VS_F.riu;S.rot=.03*Math.sin(g*3)*fade;return;}
  if(id==='bus'){S.fx.push({k:'bubbles',at:'snorkel',t:g,n:12});S.face=g<1.4?VS_F.llengua:VS_F.riu;S.lift=12*Math.sin(g*5)*fade;return;}
  if(id==='astronauta'){S.fx.push({k:'orbit',at:'head',t:g});S.lift=70*Math.sin(Math.PI*vsClamp(g/2.8));S.face=g<.6?VS_F.sorpresa:VS_F.riu;return;}
  if(id==='pastisser'){const grow=g<1.5?vsEase(g/1.5):g<2.1?1:1-vsEase((g-2.1)/.35);S.hat={sy:1+1.4*grow,rot:.04*Math.sin(g*7)*grow};S.sy=1-.07*grow;S.sx=1+.035*grow;S.face=g<.4?VS_F.sorpresa:g<2.1?VS_F.esforc:g<2.8?VS_F.ups:VS_F.riu;if(g>2.1)S.fx.push({k:'flour',at:'hat',t:g-2.1});return;}
  if(id==='reialesa'){const sl=g<.7?vsEase(g/.7):g<1.5?1:1-vsSettle((g-1.5)/.7);S.crown={rot:-.38*sl,dx:-70*sl,dy:22*sl};S.face=g<.5?VS_F.sorpresa:g<1.6?VS_F.ups:VS_F.riu;S.rot=.035*sl;return;}}
 if(slot==='cos'){
  if(id==='pirata'){const a=Math.min(1,g/.4)*fade;S.rot=.085*Math.sin(g*VS_TAU/1.5)*a;S.lean=40*Math.sin(g*VS_TAU/1.5+.6)*a;S.face=g<1.2?VS_F.llengua:VS_F.riu;return;}
  if(id==='ballarina'){const u=vsClamp((g-.1)/1.7),sp=vsEase(u);S.sx=vsTurn(sp*VS_TAU*2);S.lift=50*Math.sin(Math.PI*u);S.face=u<1?VS_F.riu:g<2.6?VS_F.parpelleig:VS_F.riu;if(g>1.8&&g<2.1)S.sy=1-.06*Math.sin((g-1.8)/.3*Math.PI);return;}
  if(id==='bus'){if(g<.45){const u=g/.45;S.sy=1+.16*vsEase(u);S.sx=1-.06*vsEase(u);S.face=VS_F.esforc;return;}const u=vsClamp((g-.45)/2.3);S.lift=260*Math.sin(Math.PI*u);S.rot=-.32*Math.sin(Math.PI*u)+.09*Math.sin(g*7)*Math.sin(Math.PI*u);S.lean=-30*Math.sin(g*7)*Math.sin(Math.PI*u);S.face=u<1?VS_F.riu:0;if(u>=1)S.sy=1-.05*Math.sin(vsClamp((g-2.75)/.3)*Math.PI);return;}
  if(id==='astronauta'){const inf=g<.8?vsEase(g/.8):g<2.2?1:1-vsEase((g-2.2)/.6);S.sx=1+.14*inf;S.sy=1+.08*inf;S.lift=95*inf+12*Math.sin(g*3.6)*inf;S.face=inf>.5&&g<1.4?VS_F.sorpresa:VS_F.riu;return;}
  if(id==='pastisser'){S.fx.push({k:'flour',at:'hands',t:g});S.face=g>.5&&g<1.3?VS_F.parpelleig:g<2.2?VS_F.riu:VS_F.llengua;S.sy=1-.025*Math.abs(Math.sin(g*5))*fade;return;}
  if(id==='reialesa'){// it rolls itself up in the cape like a sausage, wobbles, and unrolls with a turn
   if(g<.25){S.face=VS_F.riu;return;}if(g<.6){const u=(g-.25)/.35;S.sx=vsTurn(vsEase(u)*VS_TAU);S.roll=u>.5;S.face=VS_F.sorpresa;return;}
   if(g<1.5){S.roll=true;S.face=VS_F.esforc;S.rot=.07*Math.sin((g-.6)*11);S.lift=16*Math.abs(Math.sin((g-.6)*8));return;}
   if(g<2){const u=(g-1.5)/.5;S.sx=vsTurn(vsEase(u)*VS_TAU);S.roll=u<.5;S.face=VS_F.riu;S.lift=40*Math.sin(Math.PI*u);return;}S.face=VS_F.riu;return;}}
 if(slot==='peus'){
  if(id==='pirata'){const n=4,per=.42,k=Math.floor(g/per);if(k<n){const u=(g%per)/per;S.lift=46*Math.sin(Math.PI*u);S.rot=.05*(k%2?1:-1)*Math.sin(Math.PI*u);}S.face=g<1.8?VS_F.riu:0;return;}
  if(id==='ballarina'){const r=g<.4?vsEase(g/.4):g<2.6?1:1-vsEase((g-2.6)/.4);S.sy=1+.06*r;S.dx=34*Math.sin(g*VS_TAU*1.6)*r;S.lift=8*Math.abs(Math.sin(g*VS_TAU*3.2))*r;S.face=VS_F.parpelleig;if(g>2.6)S.face=VS_F.riu;return;}
  if(id==='bus'){const per=.56,k=Math.floor(g/per),u=(g%per)/per,a=g<2.4?1:0;S.rot=.11*(k%2?1:-1)*Math.sin(Math.PI*u)*a;S.lift=12*Math.sin(Math.PI*u)*a;S.dx=(g<2.4?-60+50*g:60)*0;S.face=VS_F.llengua;return;}
  if(id==='astronauta'){const u=vsClamp((g-.25)/2.4);S.lift=300*Math.sin(Math.PI*u);if(g<.25){S.sy=1-.08*Math.sin(g/.25*Math.PI);S.sx=1+.04*Math.sin(g/.25*Math.PI);}if(u>=1){const v=vsClamp((g-2.65)/.3);S.sy=1-.07*Math.sin(v*Math.PI);}S.face=u>.1&&u<.9?VS_F.sorpresa:VS_F.riu;return;}
  if(id==='pastisser'){const s=vsPh(g,.15,.55),r=vsPh(g,1.2,1.9);S.dx=110*vsOut(s)-30*r;S.rot=-.32*Math.sin(Math.PI*vsClamp((g-.15)/1.75));S.lean=60*Math.sin(Math.PI*vsClamp((g-.15)/1.75));S.face=g<.3?0:g<1.6?VS_F.ups:VS_F.riu;return;}
  if(id==='reialesa'){const per=1.05,k=Math.floor(g/per),u=(g%per)/per;if(k<2){S.lift=u<.18?0:150*Math.sin(Math.PI*(u-.18)/.82);if(u<.18){S.sy=1-.18*Math.sin(u/.18*Math.PI);S.sx=1+.08*Math.sin(u/.18*Math.PI);}}S.face=VS_F.riu;return;}}
 if(slot==='objecte'){S.obj={t:g,in:vsSettle(vsClamp(g/.8))};S.face=g<.7?VS_F.sorpresa:VS_F.riu;S.fx.push({k:'sparkle',at:'obj',t:g});return;}}
// ── the number ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// How the artist walks (the feet), at time t of the walk, with amplitude a (1 while coming in, less later): lift, tilt, squash.
export function vsGait(feet,t,a=1,S){if(!feet||a<=0)return;
 if(feet==='pirata'){const per=.5,u=(t%per)/per;S.lift+=44*a*Math.sin(Math.PI*u);S.rot+=.045*a*(Math.floor(t/per)%2?1:-1)*Math.sin(Math.PI*u);return;}
 if(feet==='ballarina'){const per=.3,u=(t%per)/per;S.sy*=1+.05*a;S.lift+=12*a*Math.sin(Math.PI*u);S.rot+=.02*a*Math.sin(t*VS_TAU/.6);return;}
 if(feet==='bus'){const per=.62,u=(t%per)/per;S.rot+=.11*a*(Math.floor(t/per)%2?1:-1)*Math.sin(Math.PI*u);S.lift+=10*a*Math.sin(Math.PI*u);return;}
 if(feet==='astronauta'){const per=1.45,u=(t%per)/per;if(u<.14){S.sy*=1-.08*a*Math.sin(u/.14*Math.PI);S.sx*=1+.04*a*Math.sin(u/.14*Math.PI);}else S.lift+=210*a*Math.sin(Math.PI*(u-.14)/.86);return;}
 if(feet==='pastisser'){const per=1.6,u=(t%per)/per;if(u>.55){const v=(u-.55)/.45;S.rot+=-.26*a*Math.sin(Math.PI*v);S.lean+=55*a*Math.sin(Math.PI*v);}S.lift+=6*a*Math.abs(Math.sin(t*VS_TAU/.4));return;}
 if(feet==='reialesa'){const per=.72,u=(t%per)/per;if(u<.2){S.sy*=1-.17*a*Math.sin(u/.2*Math.PI);S.sx*=1+.07*a*Math.sin(u/.2*Math.PI);}else{S.lift+=120*a*Math.sin(Math.PI*(u-.2)/.8);S.sy*=1+.05*a*Math.sin(Math.PI*(u-.2)/.8);}return;}}
// How it moves (the body), at time t of the middle of the number, with amplitude a.
export function vsMove(body,t,a=1,S,N=13){if(!body||a<=0)return;
 if(body==='pirata'){S.rot+=.09*a*Math.sin(t*VS_TAU/1.7);S.lean+=45*a*Math.sin(t*VS_TAU/1.7+.7);return;}
 if(body==='ballarina'){S.sx*=vsTurn(t*VS_TAU/1.1*a);S.lift+=24*a*Math.abs(Math.sin(t*VS_TAU/1.1));return;}
 if(body==='bus'){const r=vsClamp(t/.8)*a;S.lift+=210*r+30*r*Math.sin(t*2.4);S.rot+=-.42*r+.1*r*Math.sin(t*6.5);S.lean+=-36*r*Math.sin(t*6.5);S.fx.push({k:'bubbles',at:'mouth',t,n:6});return;}
 if(body==='astronauta'){const r=vsEase(vsClamp(t/1))*a;S.sx*=1+.14*r;S.sy*=1+.08*r;S.lift+=130*r+22*r*Math.sin(t*2.2);S.rot+=.06*r*Math.sin(t*1.3);return;}
 if(body==='pastisser'){S.fx.push({k:'flour',at:'hands',t:t%1.1,seed:Math.floor(t/1.1)});S.sy*=1-.03*a*Math.abs(Math.sin(t*VS_TAU/1.1));return;}
 if(body==='reialesa'){S.rot+=.03*a*Math.sin(t*VS_TAU/2.2);S.cape=a;return;}}
// What happens above (the head), at time t of the number.
export function vsAbove(head,t,a,S,parts){if(!head)return;
 if(head==='pirata'){S.parrot=vsParrotIdle(t);return;}
 if(head==='ballarina'){S.fx.push({k:'petals',at:'head',t:8+t,n:22});return;}
 if(head==='bus'){S.fx.push({k:'bubbles',at:'snorkel',t:8+t,n:16});return;}
 if(head==='astronauta'){S.fx.push({k:'orbit',at:'head',t});return;}
 if(head==='pastisser'){const g=parts.move;const grow=g<0?0:g<1?vsEase(g):1;const shrink=parts.magic>0?vsEase(vsClamp(parts.magic*5)):0;S.hat={sy:1+1.6*grow*(1-shrink),rot:.05*Math.sin(t*4)*grow*(1-shrink)};if(shrink>0&&shrink<1)S.fx.push({k:'flour',at:'hat',t:parts.magic*parts.N});return;}
 if(head==='reialesa'){const per=1.4,u=(t%per)/per,k=Math.floor(t/per)%2?1:-1,sl=Math.sin(Math.PI*vsClamp(u*1.4));S.crown={rot:.3*k*sl,dx:50*k*sl,dy:14*sl};return;}}
// The climax of the magic object, at time g since it jumped into the hand (the act lasts L seconds). The pairs change it.
export function vsMagic(obj,g,L,S,pair,head){const u=vsClamp(g/L);S.pose=1;S.face=g<.5?VS_F.sorpresa:VS_F.riu;
 if(obj==='paraigua'){const up=pair==='espai'?.4:1,rise=vsEase(vsClamp(g/1.4)),down=vsEase(vsClamp((g-1.6)/(L-1.9)));S.lift+=330*rise*(1-down);S.rot+=.12*Math.sin(g*2.6)*rise*(1-down*.6);if(pair==='planeja'){S.rot+=.12*Math.sin(g*VS_TAU/.6)*down*(1-down);}if(pair==='vela'){S.lean+=70*Math.sin(g*3)*rise;}return;}
 if(obj==='tuba'){S.fx.push({k:'notes',at:'obj',t:g});const blow=vsClamp((g-.6)/(L-1.2));S.blow=blow;if(pair==='lloro'){S.parrot={pic:blow<.5?5:6,dx:-200*Math.sin(Math.PI*blow),dy:-520*Math.sin(Math.PI*blow)};}else if(head&&head!=='astronauta'){S.hatFly=blow;}S.lean+=-30*Math.sin(Math.PI*blow);return;}
 if(obj==='globus'){const high=pair==='espai'?520:pair==='flota'?380:200;S.lift+=high*vsEase(vsClamp(g/1.3))*(1-vsEase(vsClamp((g-(L-1.2))/1)))+14*Math.sin(g*2.8);S.rot+=.05*Math.sin(g*1.9);if(pair==='espai')S.fx.push({k:'orbit',at:'head',t:g});return;}
 if(obj==='regadora'){S.fx.push({k:'drops',at:'obj',t:g});S.rainbow=vsEase(vsClamp((g-.6)/1.6));if(pair==='flors')S.fx.push({k:'petals',at:'head',t:g+4,n:40});if(pair==='dutxa'){S.lift+=120*vsEase(vsClamp(g/1));S.rot+=-.35*vsEase(vsClamp(g/1))+.08*Math.sin(g*6);}return;}
 if(obj==='ventall'){const w=Math.sin(g*VS_TAU/.5);S.lean+=-70*vsClamp(g/.6)*(1-vsClamp((g-(L-.6))/.6))+20*w;S.fx.push({k:'wind',at:'head',t:g});if(pair==='gorro'||pair==='farina')S.hatFly=vsClamp((g-.5)/(L-1));if(pair==='farina')S.fx.push({k:'flour',at:'hands',t:g%1,seed:7});return;}
 if(obj==='cinta'){const turns=pair==='doble'?3:1.5;S.sx*=vsTurn(vsEase(u)*VS_TAU*turns);S.lift+=40*Math.sin(Math.PI*u);S.fx.push({k:'ribbon',at:'obj',t:g,u});if(pair==='corona')S.crown={rot:g*9,dx:0,dy:-160*Math.sin(Math.PI*u)};return;}}
// The whole number at time t (0..N): which act, how far into it, and the state of the artist; pos is how far it has come in (0 in the
// wing, 1 at the middle of the stage).
export function vsPerform(nb,t,N,S){const W=VS_ACTS.walk[1]*N,M=VS_ACTS.move[1]*N,parts={walk:vsClamp(t/W),move:t<W?-1:vsClamp((t-W)/(M-W)),magic:t<M?-1:vsClamp((t-M)/(N-M)),N};
 const pos=nb.feet==='pastisser'?vsEase(parts.walk):vsOut(Math.min(1,parts.walk*1.05));
 vsGait(nb.feet,t,t<W?1:.35,S);
 if(t>=W)vsMove(nb.body,t-W,t<M||!nb.object?1:.4,S,N);
 vsAbove(nb.head,t,1,S,parts);
 if(nb.object&&t>=M){vsMagic(nb.object,t-M,N-M,S,nb.pair,nb.head);}
 else if(!nb.object&&t>=M){S.pose=1;S.face=VS_F.riu;}
 else S.face=t<W?(nb.feet==='pastisser'&&(t%1.6)/1.6>.55?VS_F.ups:VS_F.riu):(Math.floor(t/1.3)%3===0?VS_F.llengua:VS_F.riu);
 if(S.face===VS_F.riu&&(t%3.1)<.14)S.face=VS_F.parpelleig;
 if(nb.full&&t>=M){S.fx.push({k:'confetti',at:'stage',t:t-M});}
 return {pos,parts};}
// ── the little things around a figure ─────────────────────────────────────────────────────────────────────────────────────────────
// Each is a function of its own time t, drawn at (x, y) with size k (screen pixels of 100 drawing pixels); paper cut-outs, flat
// colours with a dark ink line. Nothing flashes: they appear and fade over a third of a second or more.
const VS_INK='#2b1d1a';
function vsPaper(c,fill,draw,lw=2){c.fillStyle=fill;c.strokeStyle=VS_INK;c.lineWidth=lw;c.beginPath();draw();c.fill();c.stroke();}
export function vsDrawFx(c,fx,A,k,t0=0){const t=fx.t,K=k,seed=fx.seed||0;
 if(fx.k==='petals'){const n=fx.n||14,cols=['#ff9cc2','#ffd3e4','#ffb347','#fff3a8'];for(let i=0;i<n;i++){const born=i*.2,age=t-born;if(age<0||age>3.2)continue;const r=vsHash(i,seed,3),x=A.x+(r-.5)*140*K+Math.sin(age*2.2+i)*40*K,y=A.y+age*80*K,a=Math.min(1,age*3)*Math.min(1,(3.2-age)*2);c.save();c.globalAlpha*=a;c.translate(x,y);c.rotate(age*2+i);vsPaper(c,cols[i%4],()=>c.ellipse(0,0,13*K,7*K,0,0,VS_TAU),1.5);c.restore();}return;}
 if(fx.k==='bubbles'){const n=fx.n||12;for(let i=0;i<n;i++){const born=i*.22,age=t-born;if(age<0||age>2.4)continue;const r=vsHash(i,seed,5),x=A.x+Math.sin(age*3+i)*22*K+(r-.5)*30*K,y=A.y-age*110*K,s=(9+r*10)*K*(1+age*.2),a=Math.min(1,age*4)*Math.min(1,(2.4-age)*2);c.save();c.globalAlpha*=a*.9;c.fillStyle='rgba(200,236,255,.55)';c.strokeStyle='#3d6f9e';c.lineWidth=1.6;c.beginPath();c.arc(x,y,s,0,VS_TAU);c.fill();c.stroke();c.fillStyle='#ffffff';c.beginPath();c.arc(x-s*.35,y-s*.35,s*.25,0,VS_TAU);c.fill();c.restore();}return;}
 if(fx.k==='orbit'){const n=5,R=A.r||150*K;for(let i=0;i<n;i++){const a=t*1.6+i*VS_TAU/n,x=A.x+Math.cos(a)*R,y=A.y+Math.sin(a)*R*.32,front=Math.sin(a)>0,s=(10+4*(i%2))*K*(front?1.1:.8);c.save();c.globalAlpha*=Math.min(1,t*2);c.translate(x,y);c.rotate(t*2+i);vsStar(c,s,'#ffd84a');c.restore();}return;}
 if(fx.k==='flour'){for(let i=0;i<7;i++){const age=t-i*.05;if(age<0||age>1.4)continue;const r=vsHash(i,seed,7),a=(1-age/1.4)*Math.min(1,age*6),x=A.x+(r-.5)*80*K+(r-.5)*age*120*K,y=A.y-age*40*K+(vsHash(i,seed,9)-.5)*40*K,s=(18+age*30)*K;c.save();c.globalAlpha*=a*.85;c.fillStyle='#fbf6ec';c.strokeStyle='rgba(120,100,80,.45)';c.lineWidth=1.4;c.beginPath();c.arc(x,y,s,0,VS_TAU);c.arc(x+s*.7,y+s*.2,s*.7,0,VS_TAU);c.fill();c.stroke();c.restore();}return;}
 if(fx.k==='sparkle'){for(let i=0;i<8;i++){const age=t-i*.03;if(age<0||age>.9)continue;const a=i/8*VS_TAU,d=(30+age*140)*K,s=(12-age*8)*K;c.save();c.globalAlpha*=1-age/.9;c.translate(A.x+Math.cos(a)*d,A.y+Math.sin(a)*d);c.rotate(age*4);vsStar(c,Math.max(1,s),i%2?'#ffd84a':'#ffffff');c.restore();}return;}
 if(fx.k==='drops'){for(let i=0;i<18;i++){const born=i*.09,age=(t-born);if(age<0||age>1)continue;const r=vsHash(i,seed,11),x=A.x+(r-.5)*50*K+age*30*K,y=A.y+age*age*420*K+age*60*K;c.save();c.globalAlpha*=Math.min(1,(1-age)*3);vsPaper(c,'#7fd2ff',()=>{c.moveTo(x,y-9*K);c.quadraticCurveTo(x+6*K,y,x,y+5*K);c.quadraticCurveTo(x-6*K,y,x,y-9*K);},1.2);c.restore();}return;}
 if(fx.k==='notes'){for(let i=0;i<8;i++){const born=.6+i*.32,age=t-born;if(age<0||age>2)continue;const x=A.x+age*90*K+Math.sin(age*5+i)*20*K,y=A.y-age*70*K-i%3*10*K;c.save();c.globalAlpha*=Math.min(1,age*4)*Math.min(1,(2-age)*2);vsNote(c,x,y,K*(1+i%2*.2),i%2?'#ffd84a':'#ff7a59');c.restore();}return;}
 if(fx.k==='wind'){c.save();c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=4*K;c.lineCap='round';for(let i=0;i<5;i++){const ph=(t*1.4+i*.2)%1,x=A.x+(.4-ph)*700*K,y=A.y+(i-2)*60*K;c.globalAlpha=Math.sin(Math.PI*ph)*.8;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-60*K,y-20*K,x-130*K,y+6*K);c.stroke();}c.restore();return;}
 if(fx.k==='ribbon'){const pts=[];for(let i=0;i<60;i++){const v=i/59,a=t*7-v*9,r=(40+v*170)*K;pts.push([A.x+Math.cos(a)*r*1.1,A.y+Math.sin(a)*r*.55+v*120*K]);}c.save();c.lineCap='round';c.lineJoin='round';c.strokeStyle=VS_INK;c.lineWidth=11*K;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.strokeStyle='#ff4f7b';c.lineWidth=7*K;c.stroke();c.restore();return;}
 if(fx.k==='confetti'){const cols=['#ff5a5f','#ffd84a','#49c6e5','#8bd17c','#b388ff'];for(let i=0;i<46;i++){const born=vsHash(i,1,13)*1.4,age=t-born;if(age<0)continue;const fall=(age*(70+vsHash(i,2,13)*60)*K)%(A.h+60*K),x=A.x0+vsHash(i,3,13)*A.w+Math.sin(age*2+i)*24*K,y=A.y0-30*K+fall;c.save();c.globalAlpha*=Math.min(1,age*3);c.translate(x,y);c.rotate(age*3+i);c.scale(1,Math.cos(age*5+i));c.fillStyle=cols[i%5];c.fillRect(-7*K,-4*K,14*K,8*K);c.restore();}return;}}
export function vsStar(c,s,fill){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?s*.45:s;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=VS_INK;c.lineWidth=Math.max(1,s*.12);c.stroke();}
function vsNote(c,x,y,K,fill){c.fillStyle=fill;c.strokeStyle=VS_INK;c.lineWidth=2;c.beginPath();c.ellipse(x,y,11*K,8*K,-.4,0,VS_TAU);c.fill();c.stroke();c.beginPath();c.moveTo(x+9*K,y-3*K);c.lineTo(x+9*K,y-42*K);c.quadraticCurveTo(x+24*K,y-34*K,x+22*K,y-20*K);c.lineWidth=3*K;c.stroke();}
