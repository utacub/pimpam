// The loading cover (0.40, at Marc's request of 3 November 2026): an activity appears only when what it needs at its start is ready, with
// a progress bar meanwhile. This module holds what the WebGL engines share: the share of a list of programs that is linked. Where the
// browser compiles in the background (KHR_parallel_shader_compile) the list only asks; where it cannot, one program is linked at every
// call (the call waits for it), so the cover shows the progress between one program and the next. A program is settled with the engine's
// own use(o), which checks the link (a program that fails is left out of the drawing and says why in the console) and reads what the
// engine reads on the first link (the uniforms of Pinta el món).
export function glLoadShare(gl,list,par,use){let k=0,n=0,waited=false;
 for(const o of list){if(!o)continue;n++;if(o.ok!==null){k++;continue;}
  if(par){if(gl.getProgramParameter(o.p,par.COMPLETION_STATUS_KHR)){use(o);k++;}continue;}
  if(!waited){waited=true;use(o);k++;}}
 return n?k/n:1;}
// 0.40.1 · A sheet painted once and drawn many times (a panorama, a set). It is painted on a canvas that the browser keeps in memory
// (willReadFrequently: Chrome and Firefox then draw it with the processor), where thousands of small brush strokes take a fraction of a
// second. On an accelerated canvas the same strokes go to the graphics card one by one and kept it busy for seconds: on Marc's laptop
// (Intel Iris Xe, 3 November 2026) the masia showed nothing, not even the loading ring, while its panorama was being painted. Then the
// sheet is copied once to an ordinary canvas, which the browser keeps on the graphics card, so drawing it every frame stays cheap.
export function cpuSheet(w,h,paint){const soft=document.createElement('canvas');soft.width=w;soft.height=h;const x=soft.getContext('2d',{willReadFrequently:true});paint(x,w,h);return gpuCopy(soft);}
// The copy of a finished processor canvas on an ordinary canvas (0.41: also the paintings of El vent del bosc, painted a little at a
// time); the processor canvas itself if the copy cannot be made.
export function gpuCopy(soft){if(typeof document==='undefined'||!soft)return soft;let out=null;try{out=document.createElement('canvas');out.width=soft.width;out.height=soft.height;const o=out.getContext('2d');if(!o)return soft;o.drawImage(soft,0,0);}catch{return soft;}return out;}
// 0.41 · The scenes of a dive prepared ahead, between frames: only the next two, and one program at a time. Where the browser compiles
// in parallel (KHR_parallel_shader_compile), all twenty were started within the first second: the graphics process then compiled for
// tens of seconds behind the first scene, and each link that finished there held the frames (gaps of 2 to 5 s every few seconds under
// the emulated graphics card, in El pou del temps and Fons marí de vidre). Where it cannot, a compile holds the frames anyway, so one
// at most every 1.5 s (0.35). A scene lasts about sixteen seconds, enough to prepare the next one. st keeps the time of the last one.
export function glWarmNext(gl,par,list,from,make,st){if(par){for(const o of list)if(o&&o.ok===null&&!gl.getProgramParameter(o.p,par.COMPLETION_STATUS_KHR))return;}
 else{const n=performance.now();if(n-(st.warmAt||0)<1500)return;st.warmAt=n;}
 for(let k=0;k<2;k++){const j=(from+k)%list.length;if(!list[j]){make(j);return;}}}
// 0.41 · How big a dive's picture is drawn follows how fast the frames come (fixed: a given scale, for the review tools and the cards).
// The rule of 0.28 for the five dives (down by .85 after .7 s of frames slower than 19.5 ms, up by 1.1 after 3 s faster than 14.5 ms,
// between .4 and 1), with two changes: where the frames are much too slow (over 34 ms on average) it steps down sooner and further,
// and the size it settles at is remembered on this device for that dive (localStorage), so that the next visit starts there instead
// of spending its first seconds stepping down. st: the dive's state (scale, ema, slow, fast, last); key: its name.
export function glAdapt(st,fixed,key){const now=typeof performance!=='undefined'?performance.now():0,dt=now-st.last;st.last=now;if(fixed)return fixed;
 if(!st.learnt){st.learnt=true;const v=glScaleRead(key);if(v)st.scale=v;}
 if(dt>0&&dt<120){st.ema+=(dt-st.ema)*.08;if(st.ema>19.5){st.slow+=dt;st.fast=0;}else if(st.ema<14.5){st.fast+=dt;st.slow=0;}else{st.slow=0;st.fast=0;}
  const bad=st.ema>34;
  if(st.slow>(bad?350:700)){st.scale=Math.max(.4,st.scale*(bad?.7:.85));st.slow=0;st.ema=16;glScaleKeep(key,st.scale);}
  else if(st.fast>3000){st.scale=Math.min(1,st.scale*1.1);st.fast=0;glScaleKeep(key,st.scale);}}
 return st.scale;}
const GL_SCALE_KEY='pimpam-escala-immersions';
function glScaleRead(key){try{const v=+(JSON.parse(localStorage.getItem(GL_SCALE_KEY)||'{}')[key]);return Number.isFinite(v)&&v>=.4&&v<=1?v:0;}catch{return 0;}}
function glScaleKeep(key,v){try{const o=JSON.parse(localStorage.getItem(GL_SCALE_KEY)||'{}');o[key]=Math.round(v*1000)/1000;localStorage.setItem(GL_SCALE_KEY,JSON.stringify(o));}catch{}}
// How long a cover may wait at most (ms): past it the activity is shown anyway (a resource that never arrives must not lock it out).
export const LOAD_MAX=30000;
// Smooth frames drawn behind the cover before it lifts: none of them waited more than LOAD_GAP ms for the one before.
export const LOAD_SMOOTH=5,LOAD_GAP=200;
