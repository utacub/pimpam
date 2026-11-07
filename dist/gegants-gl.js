import {glLoadShare,glWarmNext,glAdapt} from './carrega.js';
import {GG_GLSL} from './gegants-shaders.js';
import {GG_N,GG_STIM,GG_SURF,ggCamera,ggLayers,ggRest,ggRestLayers} from './gegants.js';

/* Gegants del blau · CE38 · Pim Pam 0.36: the WebGL2 renderer of the journey. Each scene is one program that draws the whole screen
 * (its water, sky and floor, and its animals); during a travel the scene left behind is drawn first, veiled in its water, and the new one
 * over it as it comes out of its own; then the tone of the picture (a soft vignette, the darkening while waiting, a fine dither). The
 * programs are prepared in the background, the ones needed soon first; the picture's size follows how fast the frames come.
 */
const GGL_VS='#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const GGL_COMP=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 R;uniform float T,uDark,uWhite;out vec4 O;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){vec2 uv=gl_FragCoord.xy/R;vec3 c=texture(S,uv).rgb;vec2 v=(uv-.5)*vec2(R.x/R.y,1.);c*=1.-.22*pow(length(v*vec2(.75,1.)),2.2)*(1.-.8*uWhite);
 c*=1.-uDark;c+=(h(gl_FragCoord.xy+fract(T)*91.)-.5)*(2./255.);O=vec4(c,1.);}`;
// The narrowest screen the scenes are composed for: half its width, in screen heights. The animals reach the sides on 16:9, so 4:3 and
// portrait screens pull the camera back; 16:9 is not changed.
const GGL_FIT=.80;
const GGL={gl:null,cv:null,failed:false,lost:false,progs:{},scene:[],target:null,size:[0,0],scale:.8,last:0,ema:16,slow:0,fast:0,par:null,warmAt:0};
function gglShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
function gglProgram(gl,fs){const p=gl.createProgram(),v=gglShader(gl,gl.VERTEX_SHADER,GGL_VS),f=gglShader(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);
 return {p,v,f,ok:null,u:{}};}
function gglUse(gl,o){if(o.ok===null){o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);if(!o.ok&&typeof console!=='undefined')console.warn('Gegants del blau: shader',gl.getShaderInfoLog(o.f)||gl.getProgramInfoLog(o.p));}if(!o.ok)return false;gl.useProgram(o.p);return true;}
const gglU=(gl,o,n)=>o.u[n]??(o.u[n]=gl.getUniformLocation(o.p,n));
function gglInit(){if(GGL.gl||GGL.failed)return GGL.gl;
 try{const cv=document.createElement('canvas');cv.width=4;cv.height=4;const gl=cv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});
  if(!gl){GGL.failed=true;return null;}
  GGL.par=gl.getExtension('KHR_parallel_shader_compile');
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();GGL.lost=true;});
  cv.addEventListener('webglcontextrestored',()=>{GGL.gl=null;GGL.cv=null;GGL.lost=false;GGL.progs={};GGL.scene=[];GGL.target=null;GGL.size=[0,0];});
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  GGL.gl=gl;GGL.cv=cv;GGL.progs={comp:gglProgram(gl,GGL_COMP)};GGL.scene=GG_GLSL.scenes.map(()=>null);
  return gl;}catch{GGL.failed=true;return null;}}
function gglScene(gl,j){if(j<0||j>=GGL.scene.length)return null;if(!GGL.scene[j])GGL.scene[j]=gglProgram(gl,GG_GLSL.common+GG_GLSL.head+GG_GLSL.scenes[j]+GG_GLSL.tail);return GGL.scene[j];}
// Without parallel compiling (KHR_parallel_shader_compile) a compile holds every following frame, so one at most every 1.5 s (as 0.35).
function gglWarm(gl,from){glWarmNext(gl,GGL.par,GGL.scene,from,j=>gglScene(gl,j),GGL);}
function gglTarget(gl,W,H){if(GGL.target&&GGL.size[0]===W&&GGL.size[1]===H)return GGL.target;
 if(GGL.target){gl.deleteTexture(GGL.target.t);gl.deleteFramebuffer(GGL.target.f);}
 const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 for(const k of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR);for(const k of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
 const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
 GGL.cv.width=W;GGL.cv.height=H;GGL.size=[W,H];GGL.target={t,f,w:W,h:H};return GGL.target;}
// The size of the picture follows how fast the frames come (fixed: a given scale, for the review tools and the cards).
function gglAdapt(fixed){return glAdapt(GGL,fixed,'gegants');}
// o: layers [{scene, cam, tau, veil, mix, move}], fit (the pull back of narrow screens), decor 'full'|'dim'|'none', opacity 0–100, white,
// dark 0–1, g (clock of the world, for the dither), scale (fixed size factor, optional). Returns the WebGL canvas with the picture, or null.
function gglRender(W,H,o){const gl=gglInit();if(!gl||GGL.lost)return null;
 const scale=gglAdapt(o.scale),Wi=Math.max(8,Math.round(W*scale)),Hi=Math.max(8,Math.round(H*scale)),T=gglTarget(gl,Wi,Hi),draw=()=>gl.drawArrays(gl.TRIANGLES,0,3);
 gl.bindFramebuffer(gl.FRAMEBUFFER,T.f);gl.viewport(0,0,Wi,Hi);gl.disable(gl.BLEND);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
 let first=0;o.layers.forEach((L,k)=>{if(L.mix>=.999)first=k;});let drawn=0;
 for(let k=first;k<o.layers.length;k++){const L=o.layers[k];const S=gglScene(gl,L.scene);if(!S||!gglUse(gl,S))continue;
  if(k===first){gl.disable(gl.BLEND);}else{gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);}
  gl.uniform2f(gglU(gl,S,'uR'),Wi,Hi);gl.uniform3f(gglU(gl,S,'uCam'),L.cam[1],L.cam[2],L.cam[3]*o.fit);gl.uniform1f(gglU(gl,S,'uTau'),L.tau);
  gl.uniform1f(gglU(gl,S,'uVeil'),L.veil);gl.uniform1f(gglU(gl,S,'uMove'),L.move||0);gl.uniform1f(gglU(gl,S,'uMix'),k===first?1:L.mix);
  gl.uniform1f(gglU(gl,S,'uDecor'),o.decor==='none'?2:o.decor==='dim'?1:0);gl.uniform1f(gglU(gl,S,'uOpacity'),Math.max(0,Math.min(1,(o.opacity??25)/100)));gl.uniform1f(gglU(gl,S,'uBase'),o.white?1:0);
  draw();drawn++;}
 gl.disable(gl.BLEND);if(!drawn)return null;
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,Wi,Hi);if(!gglUse(gl,GGL.progs.comp))return null;
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T.t);gl.uniform1i(gglU(gl,GGL.progs.comp,'S'),0);gl.uniform2f(gglU(gl,GGL.progs.comp,'R'),Wi,Hi);
 gl.uniform1f(gglU(gl,GGL.progs.comp,'T'),o.g||0);gl.uniform1f(gglU(gl,GGL.progs.comp,'uDark'),Math.max(0,Math.min(1,o.dark||0)));gl.uniform1f(gglU(gl,GGL.progs.comp,'uWhite'),o.white?1:0);draw();
 gglWarm(gl,(o.layers.at(-1)?.scene??0)+1);
 return GGL.cv;}
// The whole picture at one moment, into a 2D context c of size w×h (CSS pixels; the canvas may have more).
// o: variant (the stimulus, -1 before the first press), t (seconds since the press, null while waiting), tau and prevTau (clocks of the
// stimulus and of the one left behind), from (the camera at the press), stim, sea (the clock of the world), dark, background, opacity,
// base, done (the last stimulus has finished: the camera is at the surface), scale, cam (optional, a camera to use: [scene, x, y, height]).
export function drawGegants(c,w,h,o){if(typeof document==='undefined')return false;
 const v=o.variant??-1,running=o.t!==null&&o.t!==undefined&&v>=0;
 let layers=running?ggLayers(v,o.t,o.tau,o.prevTau,o.stim??GG_STIM,o.from??ggRest(v-1)):ggRestLayers(v,o.tau??0,o.done||v<0);
 if(o.cam)layers=[{scene:o.cam[0],cam:o.cam,tau:o.tau??0,veil:0,mix:1,move:0}];
 const fit=Math.max(1,GGL_FIT/(.5*Math.max(1,w)/Math.max(1,h)));
 const cv=c.canvas,sx=cv?cv.width/Math.max(1,w):1,W=Math.max(8,Math.round(w*sx)),H=Math.max(8,Math.round(h*sx));
 const rw=Math.min(W,Math.round(W*Math.min(1,1080/H))),rh=Math.min(H,1080);
 const pic=gglRender(rw,rh,{layers,fit,g:o.sea??0,decor:o.background||'full',opacity:o.opacity,white:o.base==='white'&&o.background!=='full',dark:o.dark,scale:o.scale});
 if(!pic)return false;c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.imageSmoothingEnabled=true;c.drawImage(pic,0,0,cv?cv.width:w,cv?cv.height:h);c.restore();return true;}
// Prepares the first programs in the background while the menu is open, only where the browser compiles in parallel (as 0.35).
export function gegantsPrewarm(){if(typeof document==='undefined')return false;const gl=gglInit();if(!gl||GGL.lost||!GGL.par)return false;gglScene(gl,GG_SURF);gglScene(gl,0);return true;}
// The loading cover (0.40): the programs needed at the start (its pass, the surface and the first two scenes), started together; the share already linked (carrega.js).
// 1 where WebGL cannot be used: the activity then draws its older pictures.
export function gegantsLoad(){if(typeof document==='undefined')return 1;const gl=gglInit();if(!gl||GGL.lost)return 1;return glLoadShare(gl,[...Object.values(GGL.progs),gglScene(gl,GG_SURF),gglScene(gl,0),gglScene(gl,1)],GGL.par,o=>gglUse(gl,o));}
export const gegantsAvailable=()=>typeof document!=='undefined'&&!!gglInit()&&!GGL.lost;
