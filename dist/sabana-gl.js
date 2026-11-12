import {glLoadShare,glWarmNext,glAdapt} from './carrega.js';
import {SABANA_GLSL} from './sabana-shaders.js';
import {SABANA_N,SABANA_PERIOD,SABANA_POSES,SABANA_RETURN,SABANA_START,SABANA_STIM,SABANA_TRAVEL,sabanaBloom,sabanaCamera,sabanaLayers,sabanaRest} from './sabana.js';

/* Sabana de paper · CE36 · Pim Pam 0.30: the WebGL2 renderer of the paper diorama, the one of Selva de llum (selva-gl.js): the backdrop
 * (bg.glsl), the animals of the scenes over it (each reads the backdrop back to darken it with its shadows), the plane nearest to the
 * camera drawn small and blurred (out of focus), the glow, and the tone of the picture. The hour of the day goes to every shader (the
 * one sun of the diorama); the decor settings too, so the base (black or white card) is drawn by the shaders themselves.
 */
const SB_VS='#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const SB_DOWN=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 px;out vec4 O;void main(){vec2 uv=gl_FragCoord.xy*px*2.;vec2 d=px*.5;
O=(texture(S,uv+vec2(-d.x,-d.y))+texture(S,uv+vec2(d.x,-d.y))+texture(S,uv+vec2(-d.x,d.y))+texture(S,uv+d))*.25;}`;
const SB_UP=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 px;uniform vec2 sz;out vec4 O;void main(){vec2 uv=gl_FragCoord.xy/sz;vec2 d=px;
O=(texture(S,uv)*4.+(texture(S,uv+vec2(d.x,0))+texture(S,uv-vec2(d.x,0))+texture(S,uv+vec2(0,d.y))+texture(S,uv-vec2(0,d.y)))*2.+texture(S,uv+d)+texture(S,uv-d)+texture(S,uv+vec2(d.x,-d.y))+texture(S,uv+vec2(-d.x,d.y)))/16.;}`;
const SB_BLUR=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 px;uniform vec2 dir;out vec4 O;void main(){vec2 uv=gl_FragCoord.xy*px;vec2 d=dir*px;
O=texture(S,uv)*.2270+(texture(S,uv+d*1.3846)+texture(S,uv-d*1.3846))*.3162+(texture(S,uv+d*3.2308)+texture(S,uv-d*3.2308))*.0703;}`;
const SB_LAY=`#version 300 es
precision highp float;uniform sampler2D S;uniform vec2 R;out vec4 O;void main(){O=texture(S,gl_FragCoord.xy/R);}`;
// The tone of the picture: paper under sunlight, so a soft vignette, a little more colour, and more exposure at night (the night is of
// paper too: dark blue card with light passing through it). No inversion for the white base: the shaders draw the base themselves.
const SB_COMP=`#version 300 es
precision highp float;uniform sampler2D S;uniform sampler2D Bl;uniform vec2 R;uniform float K,T,uDark,uWhite,uExpo;out vec4 O;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){vec2 uv=gl_FragCoord.xy/R;vec3 c=texture(S,uv).rgb+texture(Bl,uv).rgb*K;vec2 v=uv-.5;c*=1.-.35*dot(v,v)*(1.-.8*uWhite);c=max(vec3(0.),mix(vec3(dot(c,vec3(.2126,.7152,.0722))),c,1.14));
 c=aces(c*uExpo);c=pow(c,vec3(1./2.2));c=mix(c,c*c*(3.-2.*c),.40);
 c*=1.-uDark;
 c+=(h(gl_FragCoord.xy+fract(T)*91.)-.5)*(2.5/255.);O=vec4(c,1.);}`;
// The narrowest screen the scenes are composed for: half its width, in screen heights (portrait screens see more sea above and below).
const SB_FIT=.62;
const SB={gl:null,cv:null,failed:false,lost:false,progs:{},scene:[],targets:null,size:[0,0],scale:.8,last:0,ema:16,slow:0,fast:0,par:null};
function sbShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
// A program is linked in the background where the browser can (KHR_parallel_shader_compile); ready() says whether it can be used
// without waiting; use() waits if it must.
function sbProgram(gl,fs){const p=gl.createProgram(),v=sbShader(gl,gl.VERTEX_SHADER,SB_VS),f=sbShader(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);
 const o={p,v,f,ok:null,u:{}};return o;}
function sbReady(gl,o){if(o.ok!==null)return true;if(SB.par&&!gl.getProgramParameter(o.p,SB.par.COMPLETION_STATUS_KHR))return false;return true;}
function sbUse(gl,o){if(o.ok===null){o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);if(!o.ok&&typeof console!=='undefined')console.warn('Sabana: shader',gl.getShaderInfoLog(o.f)||gl.getProgramInfoLog(o.p));}if(!o.ok)return false;gl.useProgram(o.p);return true;}
const sbU=(gl,o,n)=>o.u[n]??(o.u[n]=gl.getUniformLocation(o.p,n));
function sbInit(){if(SB.gl||SB.failed)return SB.gl;
 try{const cv=document.createElement('canvas');cv.width=4;cv.height=4;const gl=cv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});
  if(!gl||!gl.getExtension('EXT_color_buffer_float')){SB.failed=true;return null;}
  SB.par=gl.getExtension('KHR_parallel_shader_compile');
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();SB.lost=true;});
  cv.addEventListener('webglcontextrestored',()=>{SB.gl=null;SB.cv=null;SB.lost=false;SB.progs={};SB.scene=[];SB.targets=null;SB.size=[0,0];});
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  SB.gl=gl;SB.cv=cv;
  SB.progs={bg:sbProgram(gl,SABANA_GLSL.common+SABANA_GLSL.bg),near:sbProgram(gl,SABANA_GLSL.common+SABANA_GLSL.near),blur:sbProgram(gl,SB_BLUR),lay:sbProgram(gl,SB_LAY),down:sbProgram(gl,SB_DOWN),up:sbProgram(gl,SB_UP),comp:sbProgram(gl,SB_COMP)};
  SB.scene=SABANA_GLSL.scenes.map(()=>null);
  return gl;}catch{SB.failed=true;return null;}}
// The scenes are prepared one by one in the background, the ones needed soon first.
function sbScene(gl,j){if(j<0||j>=SB.scene.length)return null;if(!SB.scene[j])SB.scene[j]=sbProgram(gl,SABANA_GLSL.common+SABANA_GLSL.head+SABANA_GLSL.scenes[j]+SABANA_GLSL.tail);return SB.scene[j];}
// Without parallel compiling (KHR_parallel_shader_compile) a compile holds every following frame, so one at most every 1.5 s (0.35).
function sbWarm(gl,from){glWarmNext(gl,SB.par,SB.scene,from,j=>sbScene(gl,j),SB);}
function sbTex(gl,w,h,fmt=gl.RGBA16F,type=gl.HALF_FLOAT,base=gl.RGBA){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,fmt,w,h,0,base,type,null);
 for(const k of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR);for(const k of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
 const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return {t,f,w,h};}
function sbTargets(gl,W,H){if(SB.targets&&SB.size[0]===W&&SB.size[1]===H)return SB.targets;
 if(SB.targets)for(const x of [SB.targets.bg,SB.targets.A,...SB.targets.mips,SB.targets.n1,SB.targets.n2]){gl.deleteTexture(x.t);gl.deleteFramebuffer(x.f);}
 const mips=[];let w=W,h=H;for(let i=0;i<6;i++){w=Math.max(1,w>>1);h=Math.max(1,h>>1);mips.push(sbTex(gl,w,h));}
 SB.cv.width=W;SB.cv.height=H;SB.size=[W,H];SB.targets={bg:sbTex(gl,W,H),A:sbTex(gl,W,H),mips,n1:sbTex(gl,Math.max(2,W>>2),Math.max(2,H>>2)),n2:sbTex(gl,Math.max(2,W>>2),Math.max(2,H>>2))};return SB.targets;}
// The size of the picture follows how fast the frames come (fixed: a given scale, for the review tools and the cards).
function sbAdapt(fixed){return glAdapt(SB,fixed,'sabana');}
// The hour, the decor (0 full, 1 dim, 2 none), its opacity and the base card (0 black, 1 white) for a shader.
function sbLook(gl,p,o){gl.uniform1f(sbU(gl,p,'uHour'),o.cam[3]??0);gl.uniform1f(sbU(gl,p,'uDecor'),o.decor==='none'?2:o.decor==='dim'?1:0);
 gl.uniform1f(sbU(gl,p,'uOpacity'),Math.max(0,Math.min(1,(o.opacity??25)/100)));gl.uniform1f(sbU(gl,p,'uBase'),o.white?1:0);}
// Exposure: 1 by day, up to 1.3 at night.
function sbExpo(h){h=((h%1)+1)%1;const n=Math.max(0,Math.min(1,(h-.78)/.1))*Math.max(0,Math.min(1,(1.06-h)/.08))+Math.max(0,Math.min(1,(.05-h)/.05));return .84+.42*Math.min(1,n);}
// o: cam [x,y,zoom,hour], sea (clock of the sea), layers [{scene,tau,alpha}], decor 'full'|'dim'|'none', opacity 0–100, white, dark 0–1,
// scale (fixed size factor, optional). Returns the WebGL canvas with the picture, or null.
function sbRender(W,H,o){const gl=sbInit();if(!gl||SB.lost)return null;
 const scale=sbAdapt(o.scale),Wi=Math.max(8,Math.round(W*scale)),Hi=Math.max(8,Math.round(H*scale)),T=sbTargets(gl,Wi,Hi),P=SB.progs,draw=()=>gl.drawArrays(gl.TRIANGLES,0,3);
 gl.disable(gl.BLEND);gl.bindFramebuffer(gl.FRAMEBUFFER,T.bg.f);gl.viewport(0,0,Wi,Hi);
 if(!sbUse(gl,P.bg))return null;gl.uniform2f(sbU(gl,P.bg,'uR'),Wi,Hi);gl.uniform3f(sbU(gl,P.bg,'uCam'),...o.cam);gl.uniform1f(sbU(gl,P.bg,'uG'),o.sea);sbLook(gl,P.bg,o);draw();
 gl.bindFramebuffer(gl.READ_FRAMEBUFFER,T.bg.f);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,T.A.f);gl.blitFramebuffer(0,0,Wi,Hi,0,0,Wi,Hi,gl.COLOR_BUFFER_BIT,gl.NEAREST);
 gl.bindFramebuffer(gl.FRAMEBUFFER,T.A.f);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 for(const L of o.layers){if(!(L.alpha>.002))continue;const S=sbScene(gl,L.scene);if(!S||!sbUse(gl,S))continue;const F=o.frames(L.scene);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T.bg.t);gl.uniform1i(sbU(gl,S,'uBg'),0);
  gl.uniform2f(sbU(gl,S,'uR'),Wi,Hi);gl.uniform3f(sbU(gl,S,'uCam'),...o.cam);gl.uniform1f(sbU(gl,S,'uG'),o.sea);sbLook(gl,S,o);gl.uniform3f(sbU(gl,S,'uScene'),...F);gl.uniform1f(sbU(gl,S,'uTau'),L.tau);gl.uniform1f(sbU(gl,S,'uAlpha'),L.alpha);draw();}
 gl.disable(gl.BLEND);
 // the nearest plane: drawn small, blurred twice (across, then down), laid over the picture
 if(o.decor!=='none'&&sbUse(gl,P.near)){const n1=T.n1,n2=T.n2;gl.bindFramebuffer(gl.FRAMEBUFFER,n1.f);gl.viewport(0,0,n1.w,n1.h);
  gl.uniform2f(sbU(gl,P.near,'uR'),n1.w,n1.h);gl.uniform3f(sbU(gl,P.near,'uCam'),...o.cam);gl.uniform1f(sbU(gl,P.near,'uG'),o.sea);sbLook(gl,P.near,o);draw();
  if(sbUse(gl,P.blur)){for(const [a,b,dx,dy] of [[n1,n2,1.6,0],[n2,n1,0,1.6]]){gl.bindFramebuffer(gl.FRAMEBUFFER,b.f);gl.bindTexture(gl.TEXTURE_2D,a.t);gl.uniform1i(sbU(gl,P.blur,'S'),0);gl.uniform2f(sbU(gl,P.blur,'px'),1/a.w,1/a.h);gl.uniform2f(sbU(gl,P.blur,'dir'),dx,dy);draw();}}
  if(sbUse(gl,P.lay)){gl.bindFramebuffer(gl.FRAMEBUFFER,T.A.f);gl.viewport(0,0,Wi,Hi);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindTexture(gl.TEXTURE_2D,n1.t);gl.uniform1i(sbU(gl,P.lay,'S'),0);gl.uniform2f(sbU(gl,P.lay,'R'),Wi,Hi);draw();gl.disable(gl.BLEND);}}
 // glow: smaller and smaller copies, then added back from the smallest
 let src=T.A;if(!sbUse(gl,P.down))return null;for(const m of T.mips){gl.bindFramebuffer(gl.FRAMEBUFFER,m.f);gl.viewport(0,0,m.w,m.h);gl.bindTexture(gl.TEXTURE_2D,src.t);gl.uniform1i(sbU(gl,P.down,'S'),0);gl.uniform2f(sbU(gl,P.down,'px'),1/src.w,1/src.h);draw();src=m;}
 if(!sbUse(gl,P.up))return null;gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
 for(let i=T.mips.length-1;i>0;i--){const d=T.mips[i-1];gl.bindFramebuffer(gl.FRAMEBUFFER,d.f);gl.viewport(0,0,d.w,d.h);gl.bindTexture(gl.TEXTURE_2D,T.mips[i].t);gl.uniform1i(sbU(gl,P.up,'S'),0);gl.uniform2f(sbU(gl,P.up,'px'),1/T.mips[i].w,1/T.mips[i].h);gl.uniform2f(sbU(gl,P.up,'sz'),d.w,d.h);draw();}
 gl.disable(gl.BLEND);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,Wi,Hi);if(!sbUse(gl,P.comp))return null;
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T.A.t);gl.uniform1i(sbU(gl,P.comp,'S'),0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,T.mips[0].t);gl.uniform1i(sbU(gl,P.comp,'Bl'),1);
 gl.uniform2f(sbU(gl,P.comp,'R'),Wi,Hi);gl.uniform1f(sbU(gl,P.comp,'K'),o.bloom??sabanaBloom(o.cam));gl.uniform1f(sbU(gl,P.comp,'uExpo'),sbExpo(o.cam[3]??0));gl.uniform1f(sbU(gl,P.comp,'T'),o.sea);gl.uniform1f(sbU(gl,P.comp,'uDark'),Math.max(0,Math.min(1,o.dark||0)));gl.uniform1f(sbU(gl,P.comp,'uWhite'),o.white?1:0);draw();gl.activeTexture(gl.TEXTURE0);
 sbWarm(gl,(o.layers.at(-1)?.scene??0)+1);
 return SB.cv;}
// The frame of scene j: its animals are designed in screen units around its pose (centre and height).
const sbPose=j=>SABANA_POSES[j];
// The whole picture of the day at one moment, into a 2D context c of size w×h (CSS pixels; the canvas may have more).
// o: variant (the stimulus, -1 before the first press), t (seconds since the press, null while waiting), tau and prevTau (clocks of
// the stimulus and of the one left behind), from (the camera at the press), stim, sea (the clock of the world), dark, background,
// opacity, base, done (the last stimulus has finished: the camera is back in the sky), scale.
export function drawSabana(c,w,h,o){if(typeof document==='undefined')return false;
 const v=o.variant??-1,running=o.t!==null&&o.t!==undefined&&v>=0,cam0=o.cam?o.cam:running?sabanaCamera(v,o.t,o.stim,o.from):v<0||o.done?SABANA_START:sabanaRest(v);
 // On a narrow screen (portrait) the camera pulls back so that the whole width of each scene stays in view (scene_tail.glsl).
 const cam=[cam0[0],cam0[1],cam0[2]*Math.max(1,SB_FIT/(.5*Math.max(1,w)/Math.max(1,h))),cam0[3]??0];
 const layers=running?sabanaLayers(v,o.t,o.tau,o.prevTau,o.stim):v>=0&&!o.done?[{scene:v,tau:o.tau,alpha:1}]:[];
 const cv=c.canvas,sx=cv?cv.width/Math.max(1,w):1,W=Math.max(8,Math.round(w*sx)),H=Math.max(8,Math.round(h*sx));
 const rw=Math.min(W,Math.round(W*Math.min(1,1080/H))),rh=Math.min(H,1080),ro={cam,sea:o.sea??0,layers,decor:o.background||'full',opacity:o.opacity,white:o.base==='white'&&o.background!=='full',dark:o.dark,scale:o.scale,frames:sbPose};
 const pic=sbRender(rw,rh,ro);
 if(!pic)return false;c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.imageSmoothingEnabled=true;c.drawImage(pic,0,0,cv?cv.width:w,cv?cv.height:h);
 // The loop of the day: the climb after the twentieth scene ends in the night sky one period of the route on from the start. The
 // backdrop repeats, but its clouds do not, so in the last 1.2 s of the climb the same sky one period back (the start) is dissolved in
 // over it: when the camera is put back at the start, nothing jumps.
 if(running&&v===SABANA_N-1){const end=SABANA_TRAVEL+Math.max(SABANA_STIM,o.stim??SABANA_STIM)+SABANA_RETURN,k=SGsmooth((o.t-end+1.2)/1.2);
  if(k>0){const pic2=sbRender(rw,rh,{...ro,cam:[cam[0]-SABANA_PERIOD,cam[1],cam[2],Math.max(0,cam[3]-1)],layers:[]});
   if(pic2){c.globalAlpha=k;c.drawImage(pic2,0,0,cv?cv.width:w,cv?cv.height:h);}}}
 c.restore();return true;}
// 0.77.2 (audit): this module had used sabana.js's SBsmooth without importing it, so the last scene threw on every frame of the live version.
function SGsmooth(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
// Whether the diorama can be drawn here (WebGL2 with float targets).
// Prepares the first programs in the background while the menu is open, only where the browser compiles in parallel (0.35): the
// menu used to compile them by drawing the card live, and hung.
export function sabanaPrewarm(){if(typeof document==='undefined')return false;const gl=sbInit();if(!gl||SB.lost||!SB.par)return false;sbScene(gl,0);return true;}
// The loading cover (0.40): the programs needed at the start (its passes and its first two scenes), started together; the share already linked (carrega.js).
// 1 where WebGL cannot be used: the activity then draws its older pictures.
export function sabanaLoad(){if(typeof document==='undefined')return 1;const gl=sbInit();if(!gl||SB.lost)return 1;return glLoadShare(gl,[...Object.values(SB.progs),sbScene(gl,0),sbScene(gl,1)],SB.par,o=>sbUse(gl,o));}
export const sabanaAvailable=()=>typeof document!=='undefined'&&!!sbInit()&&!SB.lost;
export const sabanaScale=()=>SB.scale;
