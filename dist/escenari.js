// Escenari (0.14): the shared engine of the step-by-step stories rebuilt in phase 1 of the redesign, L'orquestra que es desperta (CE12)
// and El cel de les constel·lacions (CE10). A story has seven moments: six that the presses bring in turn, and the final. With 3 or 5
// presses the six moments are shared out between the presses, so that every press still changes the scene and the music.
// The engine also keeps the clock of each moment (a press that comes before the previous step has ended lets that step finish its
// entry instead of jumping), the offscreen sheets that hold what does not move, the light of the stage and the score helpers.
import {Kclamp,KeaseOut,Krgba,Ksmooth} from './kaleido-base.js';
import {SAMPLE_BANK} from './sampler.js';
import {paperTexture} from './paper.js';

export const ESC_MOMENTS=7;
// The moments each press brings: the last press is always the final (moment 6); the six others are shared out as evenly as possible,
// the larger groups first (5 presses: 2, 1, 2, 1 and the final; 3 presses: 3, 3 and the final).
export function escGroups(steps){const n=Math.min(6,Math.max(1,Math.round(steps||7)-1)),base=Math.floor(6/n),extra=6%n,big=new Set(Array.from({length:extra},(_,k)=>Math.floor(k*n/extra))),out=[];let m=0;
 for(let i=0;i<n;i++){const size=base+(big.has(i)?1:0);out.push(Array.from({length:size},(_,j)=>m+j));m+=size;}out.push([6]);return out;}
// Seconds since each moment came in (-1 before it). The press that brought a moment keeps its clock: the current press counts t, the
// previous one counts the time it had run when it was cut short (held) plus t, and older ones are long settled. Within a press, the
// moments of a group come in one after another (stagger, in seconds).
export function escAges(count,steps,t,held,stagger=0){const groups=escGroups(steps),age=new Array(ESC_MOMENTS).fill(-1),n=Math.min(count||0,groups.length);
 for(let p=0;p<n;p++){const base=p===n-1?t:p===n-2?(held??1e3)+t:1e4;groups[p].forEach((k,j)=>{const a=base-j*stagger;age[k]=a>=0?a:-1;});}return age;}
// How far the story has gone: the moments reached (0 to 7), counting a moment from the moment it starts to come in.
export const escReached=age=>age.filter(a=>a>=0).length;

// ── Sheets ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// What does not move (a backdrop, a floor, a landscape) is drawn once into an offscreen canvas for its key and size, and then only
// copied. A sheet unused for about five seconds is freed. Where there is no canvas (the tests), the caller draws directly.
const ESC_SHEETS=new Map();let ESC_FRAME=0;
export function escCanvas(W,H){if(typeof document!=='undefined'&&document.createElement){const cv=document.createElement('canvas');cv.width=W;cv.height=H;return cv;}if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(W,H);return null;}
export function escFrame(){ESC_FRAME++;if(ESC_FRAME%60)return;for(const [k,s] of ESC_SHEETS)if(ESC_FRAME-s.used>300){s.cv.width=s.cv.height=1;ESC_SHEETS.delete(k);}}
// The scale of the canvas in device pixels, so that a sheet is as sharp as the screen.
export function escScale(c){const m=c.getTransform?c.getTransform():null;return m?Math.hypot(m.a,m.b)||1:1;}
// draw(sc,w,h) draws in the same units as the screen (CSS pixels); the sheet is made at the device resolution.
export function escSheet(c,key,w,h,draw){const k=escScale(c),W=Math.max(1,Math.round(w*k)),H=Math.max(1,Math.round(h*k)),id=`${key}|${W}x${H}`;let s=ESC_SHEETS.get(id);
 if(!s){const cv=escCanvas(W,H),sc=cv?.getContext?.('2d');if(!sc||!sc.setTransform)return null;sc.setTransform(k,0,0,k,0,0);draw(sc,w,h);s={cv,used:0};ESC_SHEETS.set(id,s);}s.used=ESC_FRAME;return s.cv;}
// Copies a sheet, or draws the same picture directly when sheets are not available.
export function escBlit(c,key,w,h,draw,alpha=1,dy=0){if(alpha<=0)return;c.save();c.globalAlpha*=alpha;const cv=escSheet(c,key,w,h,draw);if(cv)c.drawImage(cv,0,dy,w,h);else{c.translate(0,dy);draw(c,w,h);}c.restore();}
// Paper grain over a sheet: the construction-paper texture of Natura, blended in overlay mode.
export function escGrain(c,w,h,alpha=.22){const tex=paperTexture('card');if(!tex||!c.createPattern)return;const p=c.createPattern(tex,'repeat');if(!p)return;c.save();c.globalCompositeOperation='overlay';c.globalAlpha=alpha;c.fillStyle=p;c.fillRect(0,0,w,h);c.restore();}

// ── Decor ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The setting «Presentació del decorat» (0.17, in every activity that has a decor): full; dim, the decor under a veil of the base
// colour (it shows as much as «Visibilitat del decorat»); or none, the base colour alone. What answers the presses is always drawn whole,
// at its own colours, over it. The cards of the home page always show the full decor.
export function escDecor(o){const mode=o.preview?'full':['full','dim','none'].includes(o.background)?o.background:'full';return {mode,full:mode==='full',fade:mode==='none'?0:mode==='dim'?Kclamp((o.opacity??25)/100):1,base:o.base==='white'?'#ffffff':'#000000',white:o.base==='white'};}
// The veil over a rectangle of decor.
export function escVeil(c,d,x,y,w,h){if(d.fade>=1)return;c.save();c.globalAlpha*=1-d.fade;c.fillStyle=d.base;c.fillRect(x,y,w,h);c.restore();}
// A sheet of decor with its own veil, which covers only what the sheet draws (source-atop): what is behind the sheet shows as before.
// escDecorKey goes into the key of such a sheet.
export function escVeiled(d,draw){if(d.fade>=1)return draw;return (sc,sw,sh)=>{draw(sc,sw,sh);sc.save();sc.globalCompositeOperation='source-atop';sc.globalAlpha=1-d.fade;sc.fillStyle=d.base;sc.fillRect(-sw,-sh,3*sw,3*sh);sc.restore();};}
export const escDecorKey=d=>d.fade>=1?'':`|v${Math.round(d.fade*100)}${d.white?'w':'b'}`;

// ── Light ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The scene is drawn fully lit and then multiplied by a small light map: the ambient colour, with soft pools of light added on top.
// Light is soft, so the map can be small (an eighth of the screen) and still look smooth when it is stretched. Glows, beams and sparks
// are drawn after it. lights: {x, y, rx, ry, color, a} in screen units; extra: a light sheet (escLightSheet) with its alpha, or a list
// of [sheet, alpha] pairs.
let ESC_LIGHT=null,ESC_SCRATCH=null;
// Stretching a small picture over the screen while blending it is slow on a computer without a graphics card: it is first stretched
// into a scratch canvas of the screen's size (a plain copy), and the blend is then done pixel for pixel.
function escUpscale(c,w,h,src){const k=escScale(c),W=Math.max(1,Math.round(w*k)),H=Math.max(1,Math.round(h*k));if(!ESC_SCRATCH||ESC_SCRATCH.width!==W||ESC_SCRATCH.height!==H)ESC_SCRATCH=escCanvas(W,H);
 const sc=ESC_SCRATCH?.getContext?.('2d');if(!sc||!sc.setTransform)return src;sc.setTransform(1,0,0,1,0,0);sc.globalCompositeOperation='source-over';sc.globalAlpha=1;sc.clearRect(0,0,W,H);sc.imageSmoothingEnabled=true;sc.drawImage(src,0,0,W,H);return ESC_SCRATCH;}
export function escLight(c,w,h,ambient,lights,extra=null,extraAlpha=1){const W=Math.max(8,Math.ceil(w/8)),H=Math.max(8,Math.ceil(h/8));
 if(!ESC_LIGHT||ESC_LIGHT.width!==W||ESC_LIGHT.height!==H)ESC_LIGHT=escCanvas(W,H);const lc=ESC_LIGHT?.getContext?.('2d');
 c.save();c.globalCompositeOperation='multiply';
 if(!lc||!lc.setTransform){c.fillStyle=ambient;c.fillRect(0,0,w,h);c.restore();return;}
 lc.setTransform(1,0,0,1,0,0);lc.globalCompositeOperation='source-over';lc.globalAlpha=1;lc.fillStyle=ambient;lc.fillRect(0,0,W,H);lc.globalCompositeOperation='lighter';
 for(const [sheet,a] of Array.isArray(extra)?extra:[[extra,extraAlpha]])if(sheet&&a>0){lc.globalAlpha=Kclamp(a);lc.drawImage(sheet,0,0,W,H);lc.globalAlpha=1;}
 for(const L of lights){if(!(L.a>0.004))continue;lc.setTransform(L.rx/8,0,0,L.ry/8,L.x/8,L.y/8);const g=lc.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,Krgba(L.color,L.a));g.addColorStop(.55,Krgba(L.color,L.a*.6));g.addColorStop(1,Krgba(L.color,0));lc.fillStyle=g;lc.beginPath();lc.arc(0,0,1,0,Math.PI*2);lc.fill();}
 c.drawImage(escUpscale(c,w,h,ESC_LIGHT),0,0,w,h);c.restore();}
// Lights that do not change (the lamps of a place), drawn once at the size of the light map and added to it as one picture.
export function escLightSheet(c,key,w,h,lights){const W=Math.max(8,Math.ceil(w/8)),H=Math.max(8,Math.ceil(h/8)),id=`${key}|${W}x${H}`;let s=ESC_SHEETS.get(id);
 if(!s){const cv=escCanvas(W,H),lc=cv?.getContext?.('2d');if(!lc||!lc.setTransform)return null;lc.globalCompositeOperation='lighter';
  for(const L of lights){lc.setTransform(L.rx/8,0,0,L.ry/8,L.x/8,L.y/8);const g=lc.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,Krgba(L.color,L.a));g.addColorStop(.55,Krgba(L.color,L.a*.6));g.addColorStop(1,Krgba(L.color,0));lc.fillStyle=g;lc.beginPath();lc.arc(0,0,1,0,Math.PI*2);lc.fill();}
  s={cv,used:0};ESC_SHEETS.set(id,s);}s.used=ESC_FRAME;return s.cv;}
// A layer of soft light at a quarter of the resolution: lamps, beams and blooms are drawn into it (in screen units) and added to the
// screen in one step, which costs far less than adding each of them at full size. Sheets drawn into it are made at its resolution.
let ESC_GLOWL=null;
export function escGlowLayer(c,w,h,draw){const W=Math.max(8,Math.ceil(w/4)),H=Math.max(8,Math.ceil(h/4));if(!ESC_GLOWL||ESC_GLOWL.width!==W||ESC_GLOWL.height!==H)ESC_GLOWL=escCanvas(W,H);const gc=ESC_GLOWL?.getContext?.('2d');
 c.save();c.globalCompositeOperation='lighter';if(!gc||!gc.setTransform){draw(c);c.restore();return;}
 gc.setTransform(1,0,0,1,0,0);gc.globalCompositeOperation='source-over';gc.globalAlpha=1;gc.clearRect(0,0,W,H);gc.setTransform(W/w,0,0,H/h,0,0);gc.globalCompositeOperation='lighter';draw(gc);
 c.drawImage(escUpscale(c,w,h,ESC_GLOWL),0,0,w,h);c.restore();}
// A soft round glow, added to what is below it.
export function escGlow(c,x,y,r,color,a){if(!(a>0.003)||!(r>0))return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,Krgba(color,a));g.addColorStop(.35,Krgba(color,a*.45));g.addColorStop(1,Krgba(color,0));c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}

// ── Music ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const ESC_SCALES=Object.freeze({major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],mixolydian:[0,2,4,5,7,9,10]});
export const escNote=(key,mode,d)=>{const s=ESC_SCALES[mode]||ESC_SCALES.major,o=Math.floor(d/7),i=d-7*o;return key+12*o+s[i];};
// Where each recorded instrument sounds best (the centre of a part), as in Piromusical; every note stays within four semitones of a
// recording, so no note is stretched far from how the instrument was played.
const ESC_CENTRE=Object.freeze({harpRec:67,marimbaRec:74,glockRec:88,fluteRec:79,oboeRec:74,clarinetRec:67,violinsRec:76,violinsPizzRec:67,celliPizzRec:45,trumpetRec:70,hornRec:55,tromboneRec:50,tubaRec:38,timpaniRec:47});
export function escRange(inst){const z=SAMPLE_BANK[inst].zones.map(x=>x[1]);return [Math.min(...z)-4,Math.max(...z)+4];}
// The shift by octaves that puts a whole part nearest to where its instrument sounds best while every note stays within reach.
export function escFit(notes,inst,centre=ESC_CENTRE[inst]??64){const [lo,hi]=escRange(inst),mean=notes.reduce((a,b)=>a+b,0)/Math.max(1,notes.length),a=Math.min(...notes),b=Math.max(...notes);let best=null;
 for(let o=-5;o<=5;o++){if(a+12*o<lo||b+12*o>hi)continue;if(best===null||Math.abs(mean+12*o-centre)<Math.abs(mean+12*best-centre))best=o;}
 if(best===null){best=Math.round((centre-mean)/12);}return 12*best;}
// One note brought by octaves into the reach of an instrument.
export function escInto(m,inst){const [lo,hi]=escRange(inst);while(m<lo)m+=12;while(m>hi)m-=12;return m;}
// A score under construction, in seconds from the press. Notes that would start in the last moment are dropped and lengths are cut at
// the end; done() gives the events in fractions of the duration (at, length), as the app plays them.
export function escScore(D){const out=[];return {out,
 add(time,length,inst,midi,vel,x={}){if(!(time>=0)||time>=D-.05)return;out.push({time,length:Math.max(.05,Math.min(length,D-time)),inst,midi:midi.length?midi:[60],vel:Kclamp(vel,.01,1),...x});},
 done(){return out.slice().sort((a,b)=>a.time-b.time).map(({time,length,...e})=>({at:time/D,length:length/D,...e}));}};}

// Waiting for the next press (0.14.1). When a step has ended, the scene slows down to a stop and darkens, so that it is clear that
// nothing more will happen until the next press; the press brings the light back and the motion goes on from where it stopped.
// The ambient clock of the scene (idle: snow, fireflies, the train, the lamps) is a clock of its own that stops while the scene
// waits, so that nothing jumps when it starts again. Used by Dia rere dia, L'orquestra que es desperta and El cel de les constel·lacions.
// dark: how dark the waiting scene is (0.65 leaves 35 % of the light); stop: seconds to slow down and darken; wake: seconds to light up.
export const ESC_WAIT=Object.freeze({dark:.65,stop:1.2,wake:.6});
// Before the first press the scene is already waiting: dark and still, at the moment shown on the card of the activity (idle 4).
export const ESC_WAIT_START=Object.freeze({mode:'wait',at:-1e9,idle:4,rate:0,dark:ESC_WAIT.dark});
// The clock of the scene at real time now (seconds): idle, its rate (1 running, 0 still), how dark the scene is, and whether the
// picture is still (nothing moves or changes any more). w is the state kept by the activity: the mode ('wait' or 'run') and, at
// the time it began, the idle clock, its rate and the darkness. The rate changes evenly, so idle never jumps.
export function escWaitClock(w,now){const x=Math.max(0,now-w.at),r0=Kclamp(w.rate);
 if(w.mode==='wait'){const T=ESC_WAIT.stop*r0,still=x>=Math.max(T,ESC_WAIT.stop);
  return {idle:w.idle+(x<T?r0*x-r0*x*x/(2*T):r0*T/2),rate:x<T?r0*(1-x/T):0,dark:w.dark+(ESC_WAIT.dark-w.dark)*Ksmooth(x/ESC_WAIT.stop),still};}
 const T=ESC_WAIT.wake*(1-r0);
 return {idle:w.idle+(x<T?r0*x+(1-r0)*x*x/(2*T):r0*T+(1-r0)*T/2+(x-T)),rate:x<T?r0+(1-r0)*x/T:1,dark:w.dark*(1-KeaseOut(x/ESC_WAIT.wake)),still:false};}
// The state from now on, when a press starts a step (mode 'run') or a step ends (mode 'wait').
export function escWaitTurn(w,mode,now){const k=escWaitClock(w||ESC_WAIT_START,now);return {mode,at:now,idle:k.idle,rate:k.rate,dark:k.dark};}
