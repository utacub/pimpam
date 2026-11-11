// Fractals a la natura (CE46, 0.73) · the engine of light lines: WebGL2, a half-float picture, MAX blending of the lines, a glow from
// smaller copies, and the picture brought to the screen. The stimuli (fractals-*.js) only make segments, with frSeg, in a store of
// their own (frStore); the engine uploads what is new each frame and draws all of it in one call. Scene units: x ∈ [0, AR], y ∈ [0, 1]
// from the top; widths in the same units (1 / 1080 is one pixel of a full HD screen).
// Needs WebGL2 and EXT_color_buffer_float; frmSetup returns false otherwise (as in Pluja de colors there is no other picture).
import {FR_VS_FULL,FR_VS_LINE,FR_FS_LINE,FR_FS_DOWN,FR_FS_UP,FR_FS_FINAL} from './fractals-shaders.js';
export const FRM={gl:null,cv:null,failed:false,lost:false,par:null,P:null,quad:null,inst:null,S:null,view:null};
export const FR_STRIDE=20,FR_MAXSEG=240000;
const FRM_LEVELS=6;
// ── The store of segments of a stimulus ──────────────────────────────────────────────────────────────────────────────────
export function frStore(cap=4096){return {seg:new Float32Array(cap*FR_STRIDE),n:0,uid:(frStore.k=(frStore.k||0)+1),dmax:1e-3};}
// one segment: from (x0, y0) to (x1, y1), born at t0 (s, on the clock of the stimulus) and grown in dur seconds; w0 → w1 its width;
// col its place in the palette (0–1), lum its brightness, d0 → d1 its distance from the root (scene units: the pulse and the way out
// follow it). o: sway (wind), vx vy (drift after growing), hot (the white point at the tip while it grows), pal (0 first palette, 1
// second), tm (the moment the object begins to drift, 0 never), fall (downward acceleration), seed (of the wind).
export function frSeg(st,x0,y0,x1,y1,t0,dur,w0,w1,col,lum,d0,d1,o){if(st.n>=FR_MAXSEG)return -1;
 if((st.n+1)*FR_STRIDE>st.seg.length){const b=new Float32Array(Math.min(FR_MAXSEG,st.seg.length/FR_STRIDE*2)*FR_STRIDE);b.set(st.seg);st.seg=b;}
 const a=st.seg,i=st.n*FR_STRIDE;
 a[i]=x0;a[i+1]=y0;a[i+2]=x1;a[i+3]=y1;a[i+4]=t0;a[i+5]=dur;a[i+6]=w0;a[i+7]=w1;a[i+8]=col;a[i+9]=lum;a[i+10]=d0;a[i+11]=d1;
 a[i+12]=o?.sway||0;a[i+13]=o?.vx||0;a[i+14]=o?.vy||0;a[i+15]=o?.hot??1;a[i+16]=o?.pal||0;a[i+17]=o?.tm||0;a[i+18]=o?.fall||0;a[i+19]=o?.seed||0;
 if(d1>st.dmax)st.dmax=d1;return st.n++;}
// the time at which everything in the store has finished growing
export function frGrownAt(st){let m=0;for(let i=0;i<st.n;i++){const j=i*FR_STRIDE,e=st.seg[j+4]+st.seg[j+5];if(e>m)m=e;}return m;}
// ── WebGL ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function frmInit(){if(FRM.gl||FRM.failed)return FRM.gl;if(typeof document==='undefined')return null;
 try{const cv=document.createElement('canvas');cv.width=4;cv.height=4;const gl=cv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  if(!gl||!gl.getExtension('EXT_color_buffer_float')){FRM.failed=true;return null;}FRM.par=gl.getExtension('KHR_parallel_shader_compile');
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();FRM.lost=true;},false);cv.addEventListener('webglcontextrestored',()=>{FRM.lost=false;FRM.P=null;FRM.S=null;FRM.quad=null;FRM.inst=null;},false);
  FRM.gl=gl;FRM.cv=cv;return gl;}catch{FRM.failed=true;return null;}}
const FRM_SRC={line:[FR_VS_LINE,FR_FS_LINE],down:[FR_VS_FULL,FR_FS_DOWN],up:[FR_VS_FULL,FR_FS_UP],final:[FR_VS_FULL,FR_FS_FINAL]};
function frmShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
function frmPrograms(gl){if(!FRM.P)FRM.P={};for(const [k,[vs,fs]] of Object.entries(FRM_SRC)){if(FRM.P[k])continue;const p=gl.createProgram(),v=frmShader(gl,gl.VERTEX_SHADER,vs),f=frmShader(gl,gl.FRAGMENT_SHADER,fs);
  gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);FRM.P[k]={p,v,f,ok:null,U:{},name:k};}return FRM.P;}
export function frmProgramsList(){const gl=frmInit();return gl?Object.values(frmPrograms(gl)):[];}
export function frmSettle(o){const gl=FRM.gl;if(!gl||o.ok!==null)return;o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);
 if(!o.ok&&typeof console!=='undefined')console.warn('Fractals a la natura: shader',o.name,gl.getShaderInfoLog(o.v)||'',gl.getShaderInfoLog(o.f)||'',gl.getProgramInfoLog(o.p));}
function frmUse(gl,name){const o=FRM.P[name];if(o.ok===null)frmSettle(o);if(!o.ok)return null;gl.useProgram(o.p);return o;}
export const frmReady=()=>{const gl=frmInit();return !!gl&&!FRM.lost;};
function frmSet(gl,o,u){for(const n in u){const v=u[n],l=n in o.U?o.U[n]:(o.U[n]=gl.getUniformLocation(o.p,n));if(l===null)continue;
  if(typeof v==='number')gl.uniform1f(l,v);else if(v.arr)gl['uniform'+v.size+'fv'](l,v.arr);else if(v.tex){gl.activeTexture(gl.TEXTURE0+v.unit);gl.bindTexture(gl.TEXTURE_2D,v.tex);gl.uniform1i(l,v.unit);}
  else if(v.length===2)gl.uniform2fv(l,v);else if(v.length===3)gl.uniform3fv(l,v);else if(v.length===4)gl.uniform4fv(l,v);}}
function frmTarget(gl,w,h){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texStorage2D(gl.TEXTURE_2D,1,gl.RGBA16F,w,h);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return {f,t,w,h};}
function frmBuffers(gl){if(FRM.quad)return;const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);FRM.quad=vao;
 // two sets of lines can be on the screen at once (the form that goes back to its root and the one that grows): two buffers
 const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);FRM.inst=[];
 for(let k=0;k<2;k++){const iv=gl.createVertexArray();gl.bindVertexArray(iv);gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);const ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,FR_MAXSEG*FR_STRIDE*4,gl.DYNAMIC_DRAW);
  for(let i=0;i<5;i++){gl.enableVertexAttribArray(1+i);gl.vertexAttribPointer(1+i,4,gl.FLOAT,false,FR_STRIDE*4,i*16);gl.vertexAttribDivisor(1+i,1);}FRM.inst.push({vao:iv,buf:ib,uid:0,up:0,used:0});}
 gl.bindVertexArray(null);}
// the picture: W × H pixels (the glow uses smaller copies)
export function frmSetup(W,H){const gl=frmInit();if(!gl||FRM.lost)return false;frmPrograms(gl);frmBuffers(gl);W=Math.max(16,Math.round(W));H=Math.max(16,Math.round(H));
 if(FRM.cv.width!==W||FRM.cv.height!==H){FRM.cv.width=W;FRM.cv.height=H;}FRM.view={W,H,AR:W/H};
 if(FRM.S&&FRM.S.key===W+'x'+H)return true;
 if(FRM.S)for(const x of [FRM.S.hdr,...FRM.S.bl,...FRM.S.up]){gl.deleteFramebuffer(x.f);gl.deleteTexture(x.t);}
 const S={key:W+'x'+H,hdr:frmTarget(gl,W,H),bl:[],up:[]};let w=W,h=H;for(let i=0;i<FRM_LEVELS;i++){w=Math.max(2,w>>1);h=Math.max(2,h>>1);S.bl.push(frmTarget(gl,w,h));S.up.push(frmTarget(gl,w,h));}FRM.S=S;return true;}
export const frmCanvas=()=>FRM.cv;
const frmPalArr=p=>{const a=new Float32Array(15);for(let i=0;i<5;i++){const c=p[Math.min(i,p.length-1)];a[i*3]=c[0];a[i*3+1]=c[1];a[i*3+2]=c[2];}return {arr:a,size:3};};
// One frame: layers [{st, u}], drawn one over the other (MAX), then the glow and the screen with the look of the last one.
// u: T (the clock of the form), frame [ox, oy, k] (the units of the stimulus → scene units), pal [5 linear colours], pal2, view [dx, dy, zoom, turn], wind, exit (the moment the way out began, or
// −1), exitDur, pulses [up to 4 start times], fade, dmax, look {bloom, exp, spread, halo, glow, minW}, dim.
let FRM_USE=0;
function frmSlot(st){const I=FRM.inst;let o=I.find(x=>x.uid===st.uid);if(!o){o=I[0].used<=I[1].used?I[0]:I[1];o.uid=st.uid;o.up=0;}o.used=++FRM_USE;return o;}
export function frmDraw(layers,dim=1){const gl=FRM.gl,S=FRM.S;if(!gl||!S||FRM.lost)return false;if(!Array.isArray(layers))layers=[layers];
 gl.bindFramebuffer(gl.FRAMEBUFFER,S.hdr.f);gl.viewport(0,0,S.hdr.w,S.hdr.h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);let L={};
 for(const {st,u} of layers){if(!st)continue;L=u.look||{};if(!st.n)continue;const I=frmSlot(st);
  gl.bindBuffer(gl.ARRAY_BUFFER,I.buf);if(st.n>I.up){gl.bufferSubData(gl.ARRAY_BUFFER,I.up*FR_STRIDE*4,st.seg,I.up*FR_STRIDE,(st.n-I.up)*FR_STRIDE);I.up=st.n;}
  const o=frmUse(gl,'line');if(!o)return false;gl.enable(gl.BLEND);gl.blendEquation(gl.MAX);gl.blendFunc(gl.ONE,gl.ONE);gl.bindVertexArray(I.vao);const ps=u.pulses||[];
  frmSet(gl,o,{uT:u.T,uAR:FRM.view.AR,uPx:FRM.view.H,uDmax:Math.max(1e-3,u.dmax??st.dmax),uExit:u.exit??-1,uExitDur:u.exitDur||4,uWind:u.wind||0,uFade:u.fade??1,uPulseV:u.pulseV||.5,
   uMinW:L.minW??.9,uGlowW:L.glow??3,uFrame:{arr:new Float32Array(u.frame||[0,0,1]),size:3},uHalo:L.halo??.22,uCore:L.core??.7,uRim:L.rim??0,uTubeW:L.tubeW??1.4,uTubeP:L.tubeP??1,uView:u.view||[0,0,1,0],uPulse:[ps[0]??-1,ps[1]??-1,ps[2]??-1,ps[3]??-1],uPalA:frmPalArr(u.pal),uPalB:frmPalArr(u.pal2||u.pal)});
  gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,st.n);gl.blendEquation(gl.FUNC_ADD);}
 gl.disable(gl.BLEND);gl.bindVertexArray(FRM.quad);
 let p=frmUse(gl,'down');if(!p)return false;let src=S.hdr;for(const t of S.bl){gl.bindFramebuffer(gl.FRAMEBUFFER,t.f);gl.viewport(0,0,t.w,t.h);frmSet(gl,p,{uS:{tex:src.t,unit:0},uTx:[.5/src.w,.5/src.h]});gl.drawArrays(gl.TRIANGLES,0,3);src=t;}
 p=frmUse(gl,'up');if(!p)return false;let low=S.bl[FRM_LEVELS-1];for(let i=FRM_LEVELS-2;i>=0;i--){const t=S.up[i];gl.bindFramebuffer(gl.FRAMEBUFFER,t.f);gl.viewport(0,0,t.w,t.h);
  frmSet(gl,p,{uS:{tex:low.t,unit:0},uB:{tex:S.bl[i].t,unit:1},uTx:[.5/low.w,.5/low.h],uMix:L.spread??.85});gl.drawArrays(gl.TRIANGLES,0,3);low=t;}
 p=frmUse(gl,'final');if(!p)return false;gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,FRM.view.W,FRM.view.H);
 frmSet(gl,p,{uS:{tex:S.hdr.t,unit:0},uB:{tex:low.t,unit:1},uBloom:L.bloom??.55,uExp:L.exp??1,uDim:dim,uGSat:L.gsat??1,uSat:L.sat??1,uWhite:L.white??1.2});gl.drawArrays(gl.TRIANGLES,0,3);gl.bindVertexArray(null);return true;}
// ── Small tools for the stimuli ───────────────────────────────────────────────────────────────────────────────────────────
// '#rrggbb' → linear RGB, multiplied by k (k > 1: a light brighter than the screen)
export function frLin(hex,k=1){const n=parseInt(hex.slice(1),16),f=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};return [f(n>>16&255)*k,f(n>>8&255)*k,f(n&255)*k];}
// a small random generator with a seed (the same seed gives the same picture: the review tools and the tests need it)
export function frRandom(seed){let s=(seed>>>0)||1;return ()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
// smooth value noise in 2D (for terrains, wind fields, coasts): fbm of `oct` octaves, about −1…1
export function frNoise(seed){const R=frRandom(seed),P=new Uint16Array(512),G=new Float32Array(512);const p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(R()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
 for(let i=0;i<512;i++){P[i]=p[i&255];G[i]=R()*2-1;}
 const f=t=>t*t*t*(t*(t*6-15)+10),v=(x,y)=>G[P[(P[x&255]+y)&511]];
 const n=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=f(xf),w=f(yf);const a=v(xi,yi),b=v(xi+1,yi),c=v(xi,yi+1),d=v(xi+1,yi+1);return a+(b-a)*u+(c-a)*w+(a-b-c+d)*u*w;};
 return (x,y,oct=5,lac=2,gain=.5)=>{let s=0,a=1,fq=1,m=0;for(let i=0;i<oct;i++){s+=a*n(x*fq+i*17.3,y*fq-i*9.1);m+=a;a*=gain;fq*=lac;}return s/m;};}
// Marching squares on a scalar field f (nx × ny values, cell size h, origin ox, oy): the segments of the iso-line at level lv,
// [[x0, y0, x1, y1], …]
export function frIso(f,nx,ny,lv,h,ox=0,oy=0){const out=[],at=(i,j)=>f[j*nx+i];
 const ip=(x0,y0,v0,x1,y1,v1)=>{const t=(lv-v0)/((v1-v0)||1e-9);return [x0+(x1-x0)*t,y0+(y1-y0)*t];};
 for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const a=at(i,j),b=at(i+1,j),c=at(i+1,j+1),d=at(i,j+1);
  const k=(a>lv?1:0)|(b>lv?2:0)|(c>lv?4:0)|(d>lv?8:0);if(k===0||k===15)continue;
  const x=ox+i*h,y=oy+j*h,T=ip(x,y,a,x+h,y,b),Rr=ip(x+h,y,b,x+h,y+h,c),B=ip(x,y+h,d,x+h,y+h,c),Lf=ip(x,y,a,x,y+h,d);
  const s=(p,q)=>out.push([p[0],p[1],q[0],q[1]]);
  switch(k){case 1:case 14:s(Lf,T);break;case 2:case 13:s(T,Rr);break;case 3:case 12:s(Lf,Rr);break;case 4:case 11:s(Rr,B);break;case 6:case 9:s(T,B);break;case 7:case 8:s(Lf,B);break;
   case 5:s(Lf,T);s(Rr,B);break;case 10:s(T,Rr);s(B,Lf);break;}}
 return out;}
// Segments → chains (polylines), joining the ends that meet: [[x, y, x, y, …], …]; the iso-lines come out as loose pieces
export function frChains(segs,eps=1e-6){const key=(x,y)=>Math.round(x/eps/50)+','+Math.round(y/eps/50),ends=new Map(),used=new Uint8Array(segs.length);
 segs.forEach((s,i)=>{for(const e of [0,1]){const k=key(s[e*2],s[e*2+1]);let l=ends.get(k);if(!l)ends.set(k,l=[]);l.push(i);}});
 const out=[];for(let i=0;i<segs.length;i++){if(used[i])continue;used[i]=1;const s=segs[i];let pts=[s[0],s[1],s[2],s[3]];
  for(const dir of [1,0]){for(;;){const x=dir?pts[pts.length-2]:pts[0],y=dir?pts[pts.length-1]:pts[1],l=ends.get(key(x,y));let nx=-1;if(l)for(const j of l)if(!used[j]){nx=j;break;}if(nx<0)break;used[nx]=1;const t=segs[nx];
    const far=key(t[0],t[1])===key(x,y)?[t[2],t[3]]:[t[0],t[1]];if(dir)pts.push(far[0],far[1]);else pts.unshift(far[0],far[1]);}}
  out.push(pts);}
 return out;}
