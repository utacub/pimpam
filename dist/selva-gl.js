import {glLoadShare,glWarmNext,glAdapt} from './carrega.js';
import {SELVA_GLSL} from './selva-shaders.js';
import {SELVA_POSES,SELVA_START,selvaBloom,selvaCamera,selvaLayers,selvaRest} from './selva.js';

/* Selva de llum · CE35 · Pim Pam 0.29: the WebGL2 renderer, the one of the Fons marí de vidre (fons-gl.js) with one more plane: after the
 * creatures, the plane nearest to the camera (near.glsl) is drawn at a quarter of the size and blurred, so that it is out of focus as
 * in a film, and laid over the picture. Then the glow, the tone mapping, the darkening while the scene waits and the white base.
 */
const SG_VS='#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const SG_DOWN=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 px;out vec4 O;void main(){vec2 uv=gl_FragCoord.xy*px*2.;vec2 d=px*.5;
O=(texture(S,uv+vec2(-d.x,-d.y))+texture(S,uv+vec2(d.x,-d.y))+texture(S,uv+vec2(-d.x,d.y))+texture(S,uv+d))*.25;}`;
const SG_UP=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 px;uniform vec2 sz;out vec4 O;void main(){vec2 uv=gl_FragCoord.xy/sz;vec2 d=px;
O=(texture(S,uv)*4.+(texture(S,uv+vec2(d.x,0))+texture(S,uv-vec2(d.x,0))+texture(S,uv+vec2(0,d.y))+texture(S,uv-vec2(0,d.y)))*2.+texture(S,uv+d)+texture(S,uv-d)+texture(S,uv+vec2(d.x,-d.y))+texture(S,uv+vec2(-d.x,d.y)))/16.;}`;
const SG_BLUR=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 px;uniform vec2 dir;out vec4 O;void main(){vec2 uv=gl_FragCoord.xy*px;vec2 d=dir*px;
O=texture(S,uv)*.2270+(texture(S,uv+d*1.3846)+texture(S,uv-d*1.3846))*.3162+(texture(S,uv+d*3.2308)+texture(S,uv-d*3.2308))*.0703;}`;
const SG_LAY=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 R;out vec4 O;void main(){O=texture(S,gl_FragCoord.xy/R);}`;
const SG_COMP=`#version 300 es
precision highp float;uniform sampler2D S;uniform sampler2D Bl;uniform vec2 R;uniform float K,T,uDark,uWhite;out vec4 O;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){vec2 uv=gl_FragCoord.xy/R;vec3 c=texture(S,uv).rgb+texture(Bl,uv).rgb*K;vec2 v=uv-.5;c*=1.-.5*dot(v,v)*(1.-uWhite);c=max(vec3(0.),mix(vec3(dot(c,vec3(.2126,.7152,.0722))),c,1.2));
 c=aces(c*1.15);c=pow(c,vec3(1./2.2));
 if(uWhite>.5){float y=dot(c,vec3(.299,.587,.114));vec3 ch=c-y;c=clamp(vec3(1.-y)+ch*1.15,0.,1.);}
 c*=1.-uDark;
 c+=(h(gl_FragCoord.xy+fract(T)*91.)-.5)*(2.5/255.);O=vec4(c,1.);}`;
// The narrowest screen the scenes are composed for: half its width, in screen heights (portrait screens see more sea above and below).
const SG_FIT=.62;
const SG={gl:null,cv:null,failed:false,lost:false,progs:{},scene:[],targets:null,size:[0,0],scale:.8,last:0,ema:16,slow:0,fast:0,par:null};
function sgShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
// A program is linked in the background where the browser can (KHR_parallel_shader_compile); ready() says whether it can be used
// without waiting; use() waits if it must.
function sgProgram(gl,fs){const p=gl.createProgram(),v=sgShader(gl,gl.VERTEX_SHADER,SG_VS),f=sgShader(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);
 const o={p,v,f,ok:null,u:{}};return o;}
function sgReady(gl,o){if(o.ok!==null)return true;if(SG.par&&!gl.getProgramParameter(o.p,SG.par.COMPLETION_STATUS_KHR))return false;return true;}
function sgUse(gl,o){if(o.ok===null){o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);if(!o.ok&&typeof console!=='undefined')console.warn('Selva: shader',gl.getShaderInfoLog(o.f)||gl.getProgramInfoLog(o.p));}if(!o.ok)return false;gl.useProgram(o.p);return true;}
const sgU=(gl,o,n)=>o.u[n]??(o.u[n]=gl.getUniformLocation(o.p,n));
function sgInit(){if(SG.gl||SG.failed)return SG.gl;
 try{const cv=document.createElement('canvas');cv.width=4;cv.height=4;const gl=cv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});
  if(!gl||!gl.getExtension('EXT_color_buffer_float')){SG.failed=true;return null;}
  SG.par=gl.getExtension('KHR_parallel_shader_compile');
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();SG.lost=true;});
  cv.addEventListener('webglcontextrestored',()=>{SG.gl=null;SG.cv=null;SG.lost=false;SG.progs={};SG.scene=[];SG.targets=null;SG.size=[0,0];});
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  SG.gl=gl;SG.cv=cv;
  SG.progs={bg:sgProgram(gl,SELVA_GLSL.common+SELVA_GLSL.bg),near:sgProgram(gl,SELVA_GLSL.common+SELVA_GLSL.near),blur:sgProgram(gl,SG_BLUR),lay:sgProgram(gl,SG_LAY),down:sgProgram(gl,SG_DOWN),up:sgProgram(gl,SG_UP),comp:sgProgram(gl,SG_COMP)};
  SG.scene=SELVA_GLSL.scenes.map(()=>null);
  return gl;}catch{SG.failed=true;return null;}}
// The scenes are prepared one by one in the background, the ones needed soon first.
function sgScene(gl,j){if(j<0||j>=SG.scene.length)return null;if(!SG.scene[j])SG.scene[j]=sgProgram(gl,SELVA_GLSL.common+SELVA_GLSL.head+SELVA_GLSL.scenes[j]+SELVA_GLSL.tail);return SG.scene[j];}
// Without parallel compiling (KHR_parallel_shader_compile) a compile holds every following frame, so one at most every 1.5 s (0.35).
function sgWarm(gl,from){glWarmNext(gl,SG.par,SG.scene,from,j=>sgScene(gl,j),SG);}
function sgTex(gl,w,h,fmt=gl.RGBA16F,type=gl.HALF_FLOAT,base=gl.RGBA){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,fmt,w,h,0,base,type,null);
 for(const k of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR);for(const k of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
 const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return {t,f,w,h};}
function sgTargets(gl,W,H){if(SG.targets&&SG.size[0]===W&&SG.size[1]===H)return SG.targets;
 if(SG.targets)for(const x of [SG.targets.bg,SG.targets.A,...SG.targets.mips,SG.targets.n1,SG.targets.n2]){gl.deleteTexture(x.t);gl.deleteFramebuffer(x.f);}
 const mips=[];let w=W,h=H;for(let i=0;i<6;i++){w=Math.max(1,w>>1);h=Math.max(1,h>>1);mips.push(sgTex(gl,w,h));}
 SG.cv.width=W;SG.cv.height=H;SG.size=[W,H];SG.targets={bg:sgTex(gl,W,H),A:sgTex(gl,W,H),mips,n1:sgTex(gl,Math.max(2,W>>2),Math.max(2,H>>2)),n2:sgTex(gl,Math.max(2,W>>2),Math.max(2,H>>2))};return SG.targets;}
// The size of the picture follows how fast the frames come (fixed: a given scale, for the review tools and the cards).
function sgAdapt(fixed){return glAdapt(SG,fixed,'selva');}
// o: cam [x,y,zoom], sea (clock of the sea), layers [{scene,tau,alpha}], decor 'full'|'dim'|'none', opacity 0–100, white, dark 0–1,
// scale (fixed size factor, optional). Returns the WebGL canvas with the picture, or null.
function sgRender(W,H,o){const gl=sgInit();if(!gl||SG.lost)return null;
 const scale=sgAdapt(o.scale),Wi=Math.max(8,Math.round(W*scale)),Hi=Math.max(8,Math.round(H*scale)),T=sgTargets(gl,Wi,Hi),P=SG.progs,draw=()=>gl.drawArrays(gl.TRIANGLES,0,3);
 gl.disable(gl.BLEND);gl.bindFramebuffer(gl.FRAMEBUFFER,T.bg.f);gl.viewport(0,0,Wi,Hi);
 if(!sgUse(gl,P.bg))return null;gl.uniform2f(sgU(gl,P.bg,'uR'),Wi,Hi);gl.uniform3f(sgU(gl,P.bg,'uCam'),...o.cam);gl.uniform1f(sgU(gl,P.bg,'uG'),o.sea);
 gl.uniform1f(sgU(gl,P.bg,'uDecor'),o.decor==='none'?2:o.decor==='dim'?1:0);gl.uniform1f(sgU(gl,P.bg,'uOpacity'),Math.max(0,Math.min(1,(o.opacity??25)/100)));draw();
 gl.bindFramebuffer(gl.READ_FRAMEBUFFER,T.bg.f);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,T.A.f);gl.blitFramebuffer(0,0,Wi,Hi,0,0,Wi,Hi,gl.COLOR_BUFFER_BIT,gl.NEAREST);
 gl.bindFramebuffer(gl.FRAMEBUFFER,T.A.f);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 for(const L of o.layers){if(!(L.alpha>.002))continue;const S=sgScene(gl,L.scene);if(!S||!sgUse(gl,S))continue;const F=o.frames(L.scene);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T.bg.t);gl.uniform1i(sgU(gl,S,'uBg'),0);
  gl.uniform2f(sgU(gl,S,'uR'),Wi,Hi);gl.uniform3f(sgU(gl,S,'uCam'),...o.cam);gl.uniform1f(sgU(gl,S,'uG'),o.sea);gl.uniform3f(sgU(gl,S,'uScene'),...F);gl.uniform1f(sgU(gl,S,'uTau'),L.tau);gl.uniform1f(sgU(gl,S,'uAlpha'),L.alpha);draw();}
 gl.disable(gl.BLEND);
 // the nearest plane: drawn small, blurred twice (across, then down), laid over the picture
 if(o.decor!=='none'&&sgUse(gl,P.near)){const n1=T.n1,n2=T.n2;gl.bindFramebuffer(gl.FRAMEBUFFER,n1.f);gl.viewport(0,0,n1.w,n1.h);
  gl.uniform2f(sgU(gl,P.near,'uR'),n1.w,n1.h);gl.uniform3f(sgU(gl,P.near,'uCam'),...o.cam);gl.uniform1f(sgU(gl,P.near,'uG'),o.sea);
  gl.uniform1f(sgU(gl,P.near,'uDecor'),o.decor==='dim'?1:0);gl.uniform1f(sgU(gl,P.near,'uOpacity'),Math.max(0,Math.min(1,(o.opacity??25)/100)));draw();
  if(sgUse(gl,P.blur)){for(const [a,b,dx,dy] of [[n1,n2,1.6,0],[n2,n1,0,1.6]]){gl.bindFramebuffer(gl.FRAMEBUFFER,b.f);gl.bindTexture(gl.TEXTURE_2D,a.t);gl.uniform1i(sgU(gl,P.blur,'S'),0);gl.uniform2f(sgU(gl,P.blur,'px'),1/a.w,1/a.h);gl.uniform2f(sgU(gl,P.blur,'dir'),dx,dy);draw();}}
  if(sgUse(gl,P.lay)){gl.bindFramebuffer(gl.FRAMEBUFFER,T.A.f);gl.viewport(0,0,Wi,Hi);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindTexture(gl.TEXTURE_2D,n1.t);gl.uniform1i(sgU(gl,P.lay,'S'),0);gl.uniform2f(sgU(gl,P.lay,'R'),Wi,Hi);draw();gl.disable(gl.BLEND);}}
 // glow: smaller and smaller copies, then added back from the smallest
 let src=T.A;if(!sgUse(gl,P.down))return null;for(const m of T.mips){gl.bindFramebuffer(gl.FRAMEBUFFER,m.f);gl.viewport(0,0,m.w,m.h);gl.bindTexture(gl.TEXTURE_2D,src.t);gl.uniform1i(sgU(gl,P.down,'S'),0);gl.uniform2f(sgU(gl,P.down,'px'),1/src.w,1/src.h);draw();src=m;}
 if(!sgUse(gl,P.up))return null;gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
 for(let i=T.mips.length-1;i>0;i--){const d=T.mips[i-1];gl.bindFramebuffer(gl.FRAMEBUFFER,d.f);gl.viewport(0,0,d.w,d.h);gl.bindTexture(gl.TEXTURE_2D,T.mips[i].t);gl.uniform1i(sgU(gl,P.up,'S'),0);gl.uniform2f(sgU(gl,P.up,'px'),1/T.mips[i].w,1/T.mips[i].h);gl.uniform2f(sgU(gl,P.up,'sz'),d.w,d.h);draw();}
 gl.disable(gl.BLEND);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,Wi,Hi);if(!sgUse(gl,P.comp))return null;
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T.A.t);gl.uniform1i(sgU(gl,P.comp,'S'),0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,T.mips[0].t);gl.uniform1i(sgU(gl,P.comp,'Bl'),1);
 gl.uniform2f(sgU(gl,P.comp,'R'),Wi,Hi);gl.uniform1f(sgU(gl,P.comp,'K'),o.bloom??selvaBloom(o.cam));gl.uniform1f(sgU(gl,P.comp,'T'),o.sea);gl.uniform1f(sgU(gl,P.comp,'uDark'),Math.max(0,Math.min(1,o.dark||0)));gl.uniform1f(sgU(gl,P.comp,'uWhite'),o.white?1:0);draw();gl.activeTexture(gl.TEXTURE0);
 sgWarm(gl,(o.layers.at(-1)?.scene??0)+1);
 return SG.cv;}
// The frame of scene j: its creatures are designed in screen units around its pose (centre and height).
const sgPose=j=>SELVA_POSES[j];
// The whole picture of the dive at one moment, into a 2D context c of size w×h (CSS pixels; the canvas may have more).
// o: variant (the stimulus, -1 before the first press), t (seconds since the press, null while waiting), tau and prevTau (clocks of
// the stimulus and of the one left behind), from (the camera at the press), stim, sea, dark, background, opacity, base, done (the
// last stimulus has finished: the camera is back at the surface), scale.
export function drawSelva(c,w,h,o){if(typeof document==='undefined')return false;
 const v=o.variant??-1,running=o.t!==null&&o.t!==undefined&&v>=0,cam0=running?selvaCamera(v,o.t,o.stim,o.from):v<0||o.done?SELVA_START:selvaRest(v);
 // On a narrow screen (portrait) the camera pulls back so that the whole width of each scene stays in view (scene_tail.glsl).
 const cam=[cam0[0],cam0[1],cam0[2]*Math.max(1,SG_FIT/(.5*Math.max(1,w)/Math.max(1,h)))];
 const layers=running?selvaLayers(v,o.t,o.tau,o.prevTau,o.stim):v>=0&&!o.done?[{scene:v,tau:o.tau,alpha:1}]:[];
 const cv=c.canvas,sx=cv?cv.width/Math.max(1,w):1,W=Math.max(8,Math.round(w*sx)),H=Math.max(8,Math.round(h*sx));
 const pic=sgRender(Math.min(W,Math.round(W*Math.min(1,1080/H))),Math.min(H,1080),{cam,sea:o.sea??0,layers,decor:o.background||'full',opacity:o.opacity,white:o.base==='white'&&o.background!=='full',dark:o.dark,scale:o.scale,frames:sgPose});
 if(!pic)return false;c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.imageSmoothingEnabled=true;c.drawImage(pic,0,0,cv?cv.width:w,cv?cv.height:h);c.restore();return true;}
// Whether the dive can be drawn here (WebGL2 with float targets).
// Prepares the first programs in the background while the menu is open, only where the browser compiles in parallel (0.35): the
// menu used to compile them by drawing the card live, and hung.
export function selvaPrewarm(){if(typeof document==='undefined')return false;const gl=sgInit();if(!gl||SG.lost||!SG.par)return false;sgScene(gl,0);return true;}
// The loading cover (0.40): the programs needed at the start (its passes and its first two scenes), started together; the share already linked (carrega.js).
// 1 where WebGL cannot be used: the activity then draws its older pictures.
export function selvaLoad(){if(typeof document==='undefined')return 1;const gl=sgInit();if(!gl||SG.lost)return 1;return glLoadShare(gl,[...Object.values(SG.progs),sgScene(gl,0),sgScene(gl,1)],SG.par,o=>sgUse(gl,o));}
export const selvaAvailable=()=>typeof document!=='undefined'&&!!sgInit()&&!SG.lost;
export const selvaScale=()=>SG.scale;
