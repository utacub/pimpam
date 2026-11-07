import {glLoadShare,glWarmNext,glAdapt} from './carrega.js';
import {POU_GLSL} from './pou-shaders.js';
import {POU_GARDEN,POU_POSES,POU_START,pouCamera,pouLayers,pouMove,pouRest,pouRestLayers} from './pou.js';

/* El pou del temps · CE37 · Pim Pam 0.31: the WebGL2 renderer of the well. The rock (rock.glsl: the strata and small fossils of every
 * age, and the dust while the camera travels), then the scenes over it (each its fossil and, as it wakes, its window of life,
 * premultiplied), then the tone of the picture (a soft vignette, the darkening while waiting, a fine dither). Where a scene is fully alive
 * its window covers the screen and the rock under it is not drawn. One program per scene, prepared in the background, the ones needed
 * soon first; the picture's size follows how fast the frames come.
 */
const PG_VS='#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const PG_COMP=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 R;uniform float T,uDark,uWhite;out vec4 O;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){vec2 uv=gl_FragCoord.xy/R;vec3 c=texture(S,uv).rgb;vec2 v=uv-.5;c*=1.-.30*dot(v,v)*(1.-.8*uWhite);
 c*=1.-uDark;c+=(h(gl_FragCoord.xy+fract(T)*91.)-.5)*(2./255.);O=vec4(c,1.);}`;
// The narrowest screen the scenes are composed for: half its width, in screen heights. The animals at the sides reach about .8 (the
// mammoth calf, the tyrannosaur chicks, the triceratops calf), so 4:3 and portrait screens pull the camera back; 16:9 is not changed.
const PG_FIT=.85;
const PG={gl:null,cv:null,failed:false,lost:false,progs:{},scene:[],target:null,size:[0,0],scale:.8,last:0,ema:16,slow:0,fast:0,par:null};
function pgShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
function pgProgram(gl,fs){const p=gl.createProgram(),v=pgShader(gl,gl.VERTEX_SHADER,PG_VS),f=pgShader(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);
 return {p,v,f,ok:null,u:{}};}
function pgReady(gl,o){if(o.ok!==null)return true;if(PG.par&&!gl.getProgramParameter(o.p,PG.par.COMPLETION_STATUS_KHR))return false;return true;}
function pgUse(gl,o){if(o.ok===null){o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);if(!o.ok&&typeof console!=='undefined')console.warn('El pou del temps: shader',gl.getShaderInfoLog(o.f)||gl.getProgramInfoLog(o.p));}if(!o.ok)return false;gl.useProgram(o.p);return true;}
const pgU=(gl,o,n)=>o.u[n]??(o.u[n]=gl.getUniformLocation(o.p,n));
function pgInit(){if(PG.gl||PG.failed)return PG.gl;
 try{const cv=document.createElement('canvas');cv.width=4;cv.height=4;const gl=cv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});
  if(!gl){PG.failed=true;return null;}
  PG.par=gl.getExtension('KHR_parallel_shader_compile');
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();PG.lost=true;});
  cv.addEventListener('webglcontextrestored',()=>{PG.gl=null;PG.cv=null;PG.lost=false;PG.progs={};PG.scene=[];PG.target=null;PG.size=[0,0];});
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  PG.gl=gl;PG.cv=cv;
  PG.progs={rock:pgProgram(gl,POU_GLSL.common+POU_GLSL.rock),comp:pgProgram(gl,PG_COMP)};
  PG.scene=POU_GLSL.scenes.map(()=>null);
  return gl;}catch{PG.failed=true;return null;}}
// The scenes are prepared one by one in the background, the ones needed soon first.
function pgScene(gl,j){if(j<0||j>=PG.scene.length)return null;if(!PG.scene[j])PG.scene[j]=pgProgram(gl,POU_GLSL.common+POU_GLSL.head+POU_GLSL.scenes[j]+POU_GLSL.tail);return PG.scene[j];}
// The next two scenes, one program at a time (carrega.js, 0.41).
function pgWarm(gl,from){glWarmNext(gl,PG.par,PG.scene,from,j=>pgScene(gl,j),PG);}
function pgTarget(gl,W,H){if(PG.target&&PG.size[0]===W&&PG.size[1]===H)return PG.target;
 if(PG.target){gl.deleteTexture(PG.target.t);gl.deleteFramebuffer(PG.target.f);}
 const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 for(const k of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR);for(const k of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
 const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
 PG.cv.width=W;PG.cv.height=H;PG.size=[W,H];PG.target={t,f,w:W,h:H};return PG.target;}
// The size of the picture follows how fast the frames come (fixed: a given scale, for the review tools and the cards).
function pgAdapt(fixed){return glAdapt(PG,fixed,'pou');}
function pgLook(gl,p,o){gl.uniform2f(pgU(gl,p,'uR'),o.W,o.H);gl.uniform3f(pgU(gl,p,'uCam'),...o.cam);gl.uniform1f(pgU(gl,p,'uG'),o.g);gl.uniform1f(pgU(gl,p,'uMove'),o.move||0);
 gl.uniform1f(pgU(gl,p,'uDecor'),o.decor==='none'?2:o.decor==='dim'?1:0);gl.uniform1f(pgU(gl,p,'uOpacity'),Math.max(0,Math.min(1,(o.opacity??25)/100)));gl.uniform1f(pgU(gl,p,'uBase'),o.white?1:0);}
const pgPose=j=>j===POU_GARDEN?POU_START:POU_POSES[j];
// o: cam [x,y,height], g (clock of the world), move, layers [{scene,tau,life}], decor 'full'|'dim'|'none', opacity 0–100, white, dark 0–1,
// scale (fixed size factor, optional). Returns the WebGL canvas with the picture, or null.
function pgRender(W,H,o){const gl=pgInit();if(!gl||PG.lost)return null;
 const scale=pgAdapt(o.scale),Wi=Math.max(8,Math.round(W*scale)),Hi=Math.max(8,Math.round(H*scale)),T=pgTarget(gl,Wi,Hi),draw=()=>gl.drawArrays(gl.TRIANGLES,0,3);const lo={...o,W:Wi,H:Hi};
 gl.bindFramebuffer(gl.FRAMEBUFFER,T.f);gl.viewport(0,0,Wi,Hi);gl.disable(gl.BLEND);
 // a scene fully alive covers the screen: nothing under it is drawn
 // 0.44.4: a scene whose program the graphics card is still compiling (in parallel, KHR_parallel_shader_compile) is left out of this
 // frame instead of being waited for: asking for its link status made the browser wait for the whole compile, which on some cards
 // takes many seconds, and the activity seemed to hang at the press after the mammoth. The rock and the scene left behind are drawn
 // meanwhile, and the new scene appears as soon as it is ready.
 const okL=o.layers.map(L=>{const S=pgScene(gl,L.scene);return !!S&&(!!o.scale||pgReady(gl,S));});   // (a fixed scale: the review tools and the card, which wait as before)
 let first=0;o.layers.forEach((L,k)=>{if(okL[k]&&L.scene!==POU_GARDEN&&L.life>=.999)first=k;});const cover=o.layers.length>0&&okL[first]&&o.layers[first].scene!==POU_GARDEN&&o.layers[first].life>=.999;
 if(!cover){if(!pgUse(gl,PG.progs.rock))return null;pgLook(gl,PG.progs.rock,lo);draw();}
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 for(let k=cover?first:0;k<o.layers.length;k++){if(!okL[k])continue;const L=o.layers[k];const S=pgScene(gl,L.scene);if(!S||!pgUse(gl,S))continue;
  if(cover&&k===first)gl.disable(gl.BLEND);else gl.enable(gl.BLEND);
  pgLook(gl,S,lo);gl.uniform3f(pgU(gl,S,'uScene'),...pgPose(L.scene));gl.uniform1f(pgU(gl,S,'uTau'),L.tau);gl.uniform1f(pgU(gl,S,'uLife'),L.life);draw();}
 gl.disable(gl.BLEND);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,Wi,Hi);if(!pgUse(gl,PG.progs.comp))return null;
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T.t);gl.uniform1i(pgU(gl,PG.progs.comp,'S'),0);gl.uniform2f(pgU(gl,PG.progs.comp,'R'),Wi,Hi);
 gl.uniform1f(pgU(gl,PG.progs.comp,'T'),o.g);gl.uniform1f(pgU(gl,PG.progs.comp,'uDark'),Math.max(0,Math.min(1,o.dark||0)));gl.uniform1f(pgU(gl,PG.progs.comp,'uWhite'),o.white?1:0);draw();
 pgWarm(gl,(o.layers.at(-1)?.scene??0)+1);
 return PG.cv;}
// The whole picture at one moment, into a 2D context c of size w×h (CSS pixels; the canvas may have more).
// o: variant (the stimulus, -1 before the first press), t (seconds since the press, null while waiting), tau and prevTau (clocks of
// the stimulus and of the one left behind), from (the camera at the press), stim, sea (the clock of the world), dark, background,
// opacity, base, done (the last stimulus has finished: the camera is back in the garden), scale, cam (optional, a camera to use).
export function drawPou(c,w,h,o){if(typeof document==='undefined')return false;
 const v=o.variant??-1,running=o.t!==null&&o.t!==undefined&&v>=0,cam0=o.cam?o.cam:running?pouCamera(v,o.t,o.stim,o.from):v<0||o.done?POU_START:pouRest(v);
 // On a narrow screen (portrait) the camera pulls back so that the whole width of each scene stays in view.
 const cam=[cam0[0],cam0[1],cam0[2]*Math.max(1,PG_FIT/(.5*Math.max(1,w)/Math.max(1,h)))];
 const layers=running?pouLayers(v,o.t,o.tau,o.prevTau,o.stim):pouRestLayers(v,o.tau??0,o.done||v<0);
 const cv=c.canvas,sx=cv?cv.width/Math.max(1,w):1,W=Math.max(8,Math.round(w*sx)),H=Math.max(8,Math.round(h*sx));
 const rw=Math.min(W,Math.round(W*Math.min(1,1080/H))),rh=Math.min(H,1080);
 const pic=pgRender(rw,rh,{cam,g:o.sea??0,move:running?pouMove(v,o.t,o.stim,o.from):0,layers,decor:o.background||'full',opacity:o.opacity,white:o.base==='white'&&o.background!=='full',dark:o.dark,scale:o.scale});
 if(!pic)return false;c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.imageSmoothingEnabled=true;c.drawImage(pic,0,0,cv?cv.width:w,cv?cv.height:h);c.restore();return true;}
// Whether the well can be drawn here (WebGL2).
// Prepares the first programs in the background while the menu is open, only where the browser compiles in parallel (0.35): the
// menu used to compile them by drawing the card live, and hung.
export function pouPrewarm(){if(typeof document==='undefined')return false;const gl=pgInit();if(!gl||PG.lost||!PG.par)return false;pgScene(gl,POU_GARDEN);pgScene(gl,0);return true;}
// The loading cover (0.40): the programs needed at the start (its passes, the garden and the first scene; 0.41: no longer the second,
// which is prepared while the garden waits for the first press), started together; the share already linked (carrega.js).
// 1 where WebGL cannot be used: the activity then draws its older pictures.
export function pouLoad(){if(typeof document==='undefined')return 1;const gl=pgInit();if(!gl||PG.lost)return 1;return glLoadShare(gl,[...Object.values(PG.progs),pgScene(gl,POU_GARDEN),pgScene(gl,0)],PG.par,o=>pgUse(gl,o));}
export const pouAvailable=()=>typeof document!=='undefined'&&!!pgInit()&&!PG.lost;
export const pouScale=()=>PG.scale;
