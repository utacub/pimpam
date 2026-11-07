import {glLoadShare,glWarmNext,glAdapt} from './carrega.js';
import {FONS_GLSL} from './fons-shaders.js';
import {FONS_POSES,FONS_SURF,fonsBloom,fonsCamera,fonsLayers,fonsRest} from './fons.js';

/* Fons marí de vidre · CE06 · Pim Pam 0.28: the WebGL2 renderer.
 * Each frame: the sea (bg) into a float texture; the creatures of one or two scenes over it (each scene is its own shader program,
 * which sees the sea through its glass bodies); a glow made from a chain of smaller copies; tone mapping, darkening while the scene
 * waits, the white base (lightness turned over) and a little grain against banding. The picture is copied to the canvas of the app.
 * The size of the picture adapts to the device: if frames come late, it is drawn smaller (and scaled up), and larger again when
 * there is room. Without WebGL2 (or if the context is lost) drawFons returns false and the activity draws its older 2D picture.
 */
const FG_VS='#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const FG_DOWN=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 px;out vec4 O;void main(){vec2 uv=gl_FragCoord.xy*px*2.;vec2 d=px*.5;
O=(texture(S,uv+vec2(-d.x,-d.y))+texture(S,uv+vec2(d.x,-d.y))+texture(S,uv+vec2(-d.x,d.y))+texture(S,uv+d))*.25;}`;
const FG_UP=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 px;uniform vec2 sz;out vec4 O;void main(){vec2 uv=gl_FragCoord.xy/sz;vec2 d=px;
O=(texture(S,uv)*4.+(texture(S,uv+vec2(d.x,0))+texture(S,uv-vec2(d.x,0))+texture(S,uv+vec2(0,d.y))+texture(S,uv-vec2(0,d.y)))*2.+texture(S,uv+d)+texture(S,uv-d)+texture(S,uv+vec2(d.x,-d.y))+texture(S,uv+vec2(-d.x,d.y)))/16.;}`;
const FG_COMP=`#version 300 es
precision highp float;uniform sampler2D S;uniform sampler2D Bl;uniform vec2 R;uniform float K,T,uDark,uWhite;out vec4 O;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){vec2 uv=gl_FragCoord.xy/R;vec3 c=texture(S,uv).rgb+texture(Bl,uv).rgb*K;vec2 v=uv-.5;c*=1.-.5*dot(v,v)*(1.-uWhite);c=max(vec3(0.),mix(vec3(dot(c,vec3(.2126,.7152,.0722))),c,1.2));
 c=aces(c*1.15);c=pow(c,vec3(1./2.2));
 if(uWhite>.5){float y=dot(c,vec3(.299,.587,.114));vec3 ch=c-y;c=clamp(vec3(1.-y)+ch*1.15,0.,1.);}
 c*=1.-uDark;
 c+=(h(gl_FragCoord.xy+fract(T)*91.)-.5)*(2.5/255.);O=vec4(c,1.);}`;
// The narrowest screen the scenes are composed for: half its width, in screen heights (portrait screens see more sea above and below).
const FG_FIT=.62;
const FG={gl:null,cv:null,failed:false,lost:false,progs:{},scene:[],targets:null,size:[0,0],scale:.8,last:0,ema:16,slow:0,fast:0,par:null};
function fgShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
// A program is linked in the background where the browser can (KHR_parallel_shader_compile); ready() says whether it can be used
// without waiting; use() waits if it must.
function fgProgram(gl,fs){const p=gl.createProgram(),v=fgShader(gl,gl.VERTEX_SHADER,FG_VS),f=fgShader(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);
 const o={p,v,f,ok:null,u:{}};return o;}
function fgReady(gl,o){if(o.ok!==null)return true;if(FG.par&&!gl.getProgramParameter(o.p,FG.par.COMPLETION_STATUS_KHR))return false;return true;}
function fgUse(gl,o){if(o.ok===null){o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);if(!o.ok&&typeof console!=='undefined')console.warn('Fons marí: shader',gl.getShaderInfoLog(o.f)||gl.getProgramInfoLog(o.p));}if(!o.ok)return false;gl.useProgram(o.p);return true;}
const fgU=(gl,o,n)=>o.u[n]??(o.u[n]=gl.getUniformLocation(o.p,n));
function fgInit(){if(FG.gl||FG.failed)return FG.gl;
 try{const cv=document.createElement('canvas');cv.width=4;cv.height=4;const gl=cv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});
  if(!gl||!gl.getExtension('EXT_color_buffer_float')){FG.failed=true;return null;}
  FG.par=gl.getExtension('KHR_parallel_shader_compile');
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();FG.lost=true;});
  cv.addEventListener('webglcontextrestored',()=>{FG.gl=null;FG.cv=null;FG.lost=false;FG.progs={};FG.scene=[];FG.targets=null;FG.size=[0,0];});
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  FG.gl=gl;FG.cv=cv;
  FG.progs={bg:fgProgram(gl,FONS_GLSL.common+FONS_GLSL.bg),down:fgProgram(gl,FG_DOWN),up:fgProgram(gl,FG_UP),comp:fgProgram(gl,FG_COMP)};
  FG.scene=FONS_GLSL.scenes.map(()=>null);
  return gl;}catch{FG.failed=true;return null;}}
// The scenes are prepared one by one in the background, the ones needed soon first.
function fgScene(gl,j){if(j<0||j>=FG.scene.length)return null;if(!FG.scene[j])FG.scene[j]=fgProgram(gl,FONS_GLSL.common+FONS_GLSL.head+FONS_GLSL.scenes[j]+FONS_GLSL.tail);return FG.scene[j];}
// Without parallel compiling (KHR_parallel_shader_compile) a compile holds every following frame, so one at most every 1.5 s (0.35).
function fgWarm(gl,from){glWarmNext(gl,FG.par,FG.scene,from,j=>fgScene(gl,j),FG);}
function fgTex(gl,w,h,fmt=gl.RGBA16F,type=gl.HALF_FLOAT,base=gl.RGBA){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,fmt,w,h,0,base,type,null);
 for(const k of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR);for(const k of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
 const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return {t,f,w,h};}
function fgTargets(gl,W,H){if(FG.targets&&FG.size[0]===W&&FG.size[1]===H)return FG.targets;
 if(FG.targets)for(const x of [FG.targets.bg,FG.targets.A,...FG.targets.mips]){gl.deleteTexture(x.t);gl.deleteFramebuffer(x.f);}
 const mips=[];let w=W,h=H;for(let i=0;i<6;i++){w=Math.max(1,w>>1);h=Math.max(1,h>>1);mips.push(fgTex(gl,w,h));}
 FG.cv.width=W;FG.cv.height=H;FG.size=[W,H];FG.targets={bg:fgTex(gl,W,H),A:fgTex(gl,W,H),mips};return FG.targets;}
// The size of the picture follows how fast the frames come (fixed: a given scale, for the review tools and the cards).
function fgAdapt(fixed){return glAdapt(FG,fixed,'fons');}
// o: cam [x,y,zoom], sea (clock of the sea), layers [{scene,tau,alpha}], decor 'full'|'dim'|'none', opacity 0–100, white, dark 0–1,
// scale (fixed size factor, optional). Returns the WebGL canvas with the picture, or null.
function fgRender(W,H,o){const gl=fgInit();if(!gl||FG.lost)return null;
 const scale=fgAdapt(o.scale),Wi=Math.max(8,Math.round(W*scale)),Hi=Math.max(8,Math.round(H*scale)),T=fgTargets(gl,Wi,Hi),P=FG.progs,draw=()=>gl.drawArrays(gl.TRIANGLES,0,3);
 gl.disable(gl.BLEND);gl.bindFramebuffer(gl.FRAMEBUFFER,T.bg.f);gl.viewport(0,0,Wi,Hi);
 if(!fgUse(gl,P.bg))return null;gl.uniform2f(fgU(gl,P.bg,'uR'),Wi,Hi);gl.uniform3f(fgU(gl,P.bg,'uCam'),...o.cam);gl.uniform1f(fgU(gl,P.bg,'uG'),o.sea);
 gl.uniform1f(fgU(gl,P.bg,'uDecor'),o.decor==='none'?2:o.decor==='dim'?1:0);gl.uniform1f(fgU(gl,P.bg,'uOpacity'),Math.max(0,Math.min(1,(o.opacity??25)/100)));draw();
 gl.bindFramebuffer(gl.READ_FRAMEBUFFER,T.bg.f);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,T.A.f);gl.blitFramebuffer(0,0,Wi,Hi,0,0,Wi,Hi,gl.COLOR_BUFFER_BIT,gl.NEAREST);
 gl.bindFramebuffer(gl.FRAMEBUFFER,T.A.f);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 for(const L of o.layers){if(!(L.alpha>.002))continue;const S=fgScene(gl,L.scene);if(!S||!fgUse(gl,S))continue;const F=o.frames(L.scene);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T.bg.t);gl.uniform1i(fgU(gl,S,'uBg'),0);
  gl.uniform2f(fgU(gl,S,'uR'),Wi,Hi);gl.uniform3f(fgU(gl,S,'uCam'),...o.cam);gl.uniform1f(fgU(gl,S,'uG'),o.sea);gl.uniform3f(fgU(gl,S,'uScene'),...F);gl.uniform1f(fgU(gl,S,'uTau'),L.tau);gl.uniform1f(fgU(gl,S,'uAlpha'),L.alpha);draw();}
 gl.disable(gl.BLEND);
 // glow: smaller and smaller copies, then added back from the smallest
 let src=T.A;if(!fgUse(gl,P.down))return null;for(const m of T.mips){gl.bindFramebuffer(gl.FRAMEBUFFER,m.f);gl.viewport(0,0,m.w,m.h);gl.bindTexture(gl.TEXTURE_2D,src.t);gl.uniform1i(fgU(gl,P.down,'S'),0);gl.uniform2f(fgU(gl,P.down,'px'),1/src.w,1/src.h);draw();src=m;}
 if(!fgUse(gl,P.up))return null;gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
 for(let i=T.mips.length-1;i>0;i--){const d=T.mips[i-1];gl.bindFramebuffer(gl.FRAMEBUFFER,d.f);gl.viewport(0,0,d.w,d.h);gl.bindTexture(gl.TEXTURE_2D,T.mips[i].t);gl.uniform1i(fgU(gl,P.up,'S'),0);gl.uniform2f(fgU(gl,P.up,'px'),1/T.mips[i].w,1/T.mips[i].h);gl.uniform2f(fgU(gl,P.up,'sz'),d.w,d.h);draw();}
 gl.disable(gl.BLEND);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,Wi,Hi);if(!fgUse(gl,P.comp))return null;
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T.A.t);gl.uniform1i(fgU(gl,P.comp,'S'),0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,T.mips[0].t);gl.uniform1i(fgU(gl,P.comp,'Bl'),1);
 gl.uniform2f(fgU(gl,P.comp,'R'),Wi,Hi);gl.uniform1f(fgU(gl,P.comp,'K'),o.bloom??fonsBloom(o.cam));gl.uniform1f(fgU(gl,P.comp,'T'),o.sea);gl.uniform1f(fgU(gl,P.comp,'uDark'),Math.max(0,Math.min(1,o.dark||0)));gl.uniform1f(fgU(gl,P.comp,'uWhite'),o.white?1:0);draw();gl.activeTexture(gl.TEXTURE0);
 fgWarm(gl,(o.layers.at(-1)?.scene??0)+1);
 return FG.cv;}
// The frame of scene j: its creatures are designed in screen units around its pose (centre and height).
const fgPose=j=>FONS_POSES[j];
// The whole picture of the dive at one moment, into a 2D context c of size w×h (CSS pixels; the canvas may have more).
// o: variant (the stimulus, -1 before the first press), t (seconds since the press, null while waiting), tau and prevTau (clocks of
// the stimulus and of the one left behind), from (the camera at the press), stim, sea, dark, background, opacity, base, done (the
// last stimulus has finished: the camera is back at the surface), scale.
export function drawFons(c,w,h,o){if(typeof document==='undefined')return false;
 const v=o.variant??-1,running=o.t!==null&&o.t!==undefined&&v>=0,cam0=running?fonsCamera(v,o.t,o.stim,o.from):v<0||o.done?FONS_SURF:fonsRest(v);
 // On a narrow screen (portrait) the camera pulls back so that the whole width of each scene stays in view (scene_tail.glsl).
 const cam=[cam0[0],cam0[1],cam0[2]*Math.max(1,FG_FIT/(.5*Math.max(1,w)/Math.max(1,h)))];
 const layers=running?fonsLayers(v,o.t,o.tau,o.prevTau,o.stim):v>=0&&!o.done?[{scene:v,tau:o.tau,alpha:1}]:[];
 const cv=c.canvas,sx=cv?cv.width/Math.max(1,w):1,W=Math.max(8,Math.round(w*sx)),H=Math.max(8,Math.round(h*sx));
 const pic=fgRender(Math.min(W,Math.round(W*Math.min(1,1080/H))),Math.min(H,1080),{cam,sea:o.sea??0,layers,decor:o.background||'full',opacity:o.opacity,white:o.base==='white'&&o.background!=='full',dark:o.dark,scale:o.scale,frames:fgPose});
 if(!pic)return false;c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.imageSmoothingEnabled=true;c.drawImage(pic,0,0,cv?cv.width:w,cv?cv.height:h);c.restore();return true;}
// Whether the dive can be drawn here (WebGL2 with float targets).
// Prepares the first programs in the background while the menu is open, only where the browser compiles in parallel (0.35): the
// menu used to compile them by drawing the card live, and hung.
export function fonsPrewarm(){if(typeof document==='undefined')return false;const gl=fgInit();if(!gl||FG.lost||!FG.par)return false;fgScene(gl,0);return true;}
// The loading cover (0.40): the programs needed at the start (its passes and its first two scenes), started together; the share already linked (carrega.js).
// 1 where WebGL cannot be used: the activity then draws its older pictures.
export function fonsLoad(){if(typeof document==='undefined')return 1;const gl=fgInit();if(!gl||FG.lost)return 1;return glLoadShare(gl,[...Object.values(FG.progs),fgScene(gl,0),fgScene(gl,1)],FG.par,o=>fgUse(gl,o));}
export const fonsAvailable=()=>typeof document!=='undefined'&&!!fgInit()&&!FG.lost;
export const fonsScale=()=>FG.scale;
