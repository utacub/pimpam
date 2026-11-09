// Bombolles sense pes (CE06 'bubbles', made again in November 2026) · the common WebGL2 engine of the stimuli.
// Matter floating on black, drawn in linear light into a half-float picture (so lights can be brighter than the screen and bleed a
// soft glow), then brought to the screen. Two kinds of things are drawn: bodies (instanced quads: 20 numbers each, see the shaders)
// and ropes (a line of points cut into instanced four-sided pieces). Each stimulus (bombolles-sabo.js, bombolles-mel.js …) moves its matter
// on the CPU and hands the engine what to draw each frame. Scene units: x ∈ [0, AR], y ∈ [0, 1] from the top.
// Needs WebGL2 and EXT_color_buffer_float; bmbSetup returns false otherwise (as in Pluja de colors, there is no other picture).
import {BMB_VS_FULL,BMB_VS_SPRITE,BMB_FS_BUBBLE,BMB_FS_WALL,BMB_FS_DOT,BMB_VS_SEG,BMB_FS_ROPE,BMB_FS_BEAD,BMB_FS_DOWN,BMB_FS_UP,BMB_FS_FINAL,BMB_FS_COPY} from './bombolles-shaders.js';
export const BMB={gl:null,cv:null,failed:false,lost:false,par:null,P:null,quad:null,spr:null,rib:null,S:null,view:null,t:0,noise:null,px:0,lay:null};
const BMB_SPR=20,BMB_MAXSPR=1536,BMB_MAXSEG=8192,BMB_LEVELS=5;
function bmbInit(){if(BMB.gl||BMB.failed)return BMB.gl;if(typeof document==='undefined')return null;
 try{const cv=document.createElement('canvas');cv.width=4;cv.height=4;const gl=cv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  if(!gl||!gl.getExtension('EXT_color_buffer_float')){BMB.failed=true;return null;}BMB.par=gl.getExtension('KHR_parallel_shader_compile');
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();BMB.lost=true;},false);cv.addEventListener('webglcontextrestored',()=>{BMB.lost=false;BMB.P=null;BMB.S=null;BMB.quad=null;BMB.spr=null;BMB.rib=null;BMB.noise=null;BMB.lay=null;},false);
  BMB.gl=gl;BMB.cv=cv;return gl;}catch{BMB.failed=true;return null;}}
const BMB_SRC={bubble:[BMB_VS_SPRITE,BMB_FS_BUBBLE],wall:[BMB_VS_SPRITE,BMB_FS_WALL],dot:[BMB_VS_SPRITE,BMB_FS_DOT],bead:[BMB_VS_SPRITE,BMB_FS_BEAD],rope:[BMB_VS_SEG,BMB_FS_ROPE],
 down:[BMB_VS_FULL,BMB_FS_DOWN],up:[BMB_VS_FULL,BMB_FS_UP],final:[BMB_VS_FULL,BMB_FS_FINAL],copy:[BMB_VS_FULL,BMB_FS_COPY]};
// a stimulus adds its own kinds of matter (its shaders) when its module loads
export function bmbKind(name,vs,fs){BMB_SRC[name]=[vs,fs];}
function bmbShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
function bmbPrograms(gl){if(!BMB.P)BMB.P={};for(const [k,[vs,fs]] of Object.entries(BMB_SRC)){if(BMB.P[k])continue;const p=gl.createProgram(),v=bmbShader(gl,gl.VERTEX_SHADER,vs),f=bmbShader(gl,gl.FRAGMENT_SHADER,fs);
  gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);BMB.P[k]={p,v,f,ok:null,U:{},name:k};}return BMB.P;}
export function bmbProgramsList(){const gl=bmbInit();return gl?Object.values(bmbPrograms(gl)):[];}
export function bmbSettle(o){const gl=BMB.gl;if(!gl||o.ok!==null)return;o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);
 if(!o.ok&&typeof console!=='undefined')console.warn('Bombolles sense pes: shader',o.name,gl.getShaderInfoLog(o.v)||'',gl.getShaderInfoLog(o.f)||'',gl.getProgramInfoLog(o.p));}
function bmbUse(gl,name){const o=BMB.P[name];if(o.ok===null)bmbSettle(o);if(!o.ok)return null;gl.useProgram(o.p);return o;}
export const bmbReady=()=>{const gl=bmbInit();return !!gl&&!BMB.lost;};
function bmbSet(gl,o,u){for(const n in u){const v=u[n],l=n in o.U?o.U[n]:(o.U[n]=gl.getUniformLocation(o.p,n));if(l===null)continue;
  if(typeof v==='number')gl.uniform1f(l,v);else if(v.arr){gl['uniform'+v.size+'fv'](l,v.arr);}else if(v.tex){gl.activeTexture(gl.TEXTURE0+v.unit);gl.bindTexture(gl.TEXTURE_2D,v.tex);gl.uniform1i(l,v.unit);}
  else if(v.length===2)gl.uniform2fv(l,v);else if(v.length===3)gl.uniform3fv(l,v);else if(v.length===4)gl.uniform4fv(l,v);}}
function bmbTarget(gl,w,h){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texStorage2D(gl.TEXTURE_2D,1,gl.RGBA16F,w,h);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return {f,t,w,h};}
function bmbBuffers(gl){if(BMB.quad)return;const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);BMB.quad=vao;
 // a picture of random numbers (256 × 256, four in each point) that repeats: the shaders read their noise from it
 const nz=new Uint8Array(262144),rn=bmbRandom(7);for(let i=0;i<nz.length;i++)nz[i]=Math.floor(rn()*256);const nt=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,nt);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,256,256,0,gl.RGBA,gl.UNSIGNED_BYTE,nz);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);BMB.noise=nt;
 const sv=gl.createVertexArray();gl.bindVertexArray(sv);const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);const ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,BMB_MAXSPR*BMB_SPR*4,gl.DYNAMIC_DRAW);
 for(let i=0;i<5;i++){gl.enableVertexAttribArray(1+i);gl.vertexAttribPointer(1+i,4,gl.FLOAT,false,BMB_SPR*4,i*16);gl.vertexAttribDivisor(1+i,1);}BMB.spr={vao:sv,buf:ib};
 const rv=gl.createVertexArray();gl.bindVertexArray(rv);gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);const rb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,rb);gl.bufferData(gl.ARRAY_BUFFER,BMB_MAXSEG*BMB_SPR*4,gl.DYNAMIC_DRAW);
 for(let i=0;i<5;i++){gl.enableVertexAttribArray(1+i);gl.vertexAttribPointer(1+i,4,gl.FLOAT,false,BMB_SPR*4,i*16);gl.vertexAttribDivisor(1+i,1);}BMB.rib={vao:rv,buf:rb,data:new Float32Array(BMB_MAXSEG*BMB_SPR),n:0,ranges:[],tmp:new Float32Array(6*512)};gl.bindVertexArray(null);}
// the picture: W × H pixels of the screen (the glow uses smaller copies)
export function bmbSetup(W,H){const gl=bmbInit();if(!gl||BMB.lost)return false;bmbPrograms(gl);bmbBuffers(gl);W=Math.max(16,Math.round(W));H=Math.max(16,Math.round(H));
 if(BMB.cv.width!==W||BMB.cv.height!==H){BMB.cv.width=W;BMB.cv.height=H;}BMB.view={W,H,AR:W/H,px:H};BMB.px=H;BMB.lay=null;
 if(BMB.S&&BMB.S.key===W+'x'+H)return true;
 if(BMB.S){for(const x of [BMB.S.hdr,BMB.S.half,...BMB.S.bl,...BMB.S.up]){gl.deleteFramebuffer(x.f);gl.deleteTexture(x.t);}}
 const S={key:W+'x'+H,hdr:bmbTarget(gl,W,H),half:bmbTarget(gl,Math.max(2,W>>1),Math.max(2,H>>1)),bl:[],up:[]};let w=W,h=H;for(let i=0;i<BMB_LEVELS;i++){w=Math.max(2,w>>1);h=Math.max(2,h>>1);S.bl.push(bmbTarget(gl,w,h));S.up.push(bmbTarget(gl,w,h));}BMB.S=S;return true;}
export function bmbCanvas(){return BMB.cv;}
// one frame: bmbBegin, the things to draw in order (the later ones over the earlier ones), bmbEnd
export function bmbBegin(t=0){const gl=BMB.gl,S=BMB.S;if(!gl||!S||BMB.lost)return false;BMB.t=t;BMB.px=BMB.view.px;BMB.lay=null;gl.bindFramebuffer(gl.FRAMEBUFFER,S.hdr.f);gl.viewport(0,0,S.hdr.w,S.hdr.h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);return true;}
// bodies: `data` holds n × 20 numbers; `add` = true: light added to what is there (films, sparks) · false: laid over it ·
// 'liquid': drawn twice, first filtering what is under it and then adding its own light (see bmbThrough in the shaders)
export function bmbBodies(kind,data,n,u={},add=true,pad=1.3){const gl=BMB.gl;if(!gl||!n)return;const o=bmbUse(gl,kind);if(!o)return;n=Math.min(n,BMB_MAXSPR);
 gl.bindVertexArray(BMB.spr.vao);gl.bindBuffer(gl.ARRAY_BUFFER,BMB.spr.buf);gl.bufferSubData(gl.ARRAY_BUFFER,0,data,0,n*BMB_SPR);
 bmbSet(gl,o,{uAR:BMB.view.AR,uPx:BMB.px,uT:BMB.t,uPad:pad,uPass:1,uNoise:{tex:BMB.noise,unit:2},...u});
 if(add==='liquid'){gl.blendFunc(gl.ZERO,gl.SRC_COLOR);bmbSet(gl,o,{uPass:0});gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,n);bmbSet(gl,o,{uPass:1});gl.blendFunc(gl.ONE,gl.ONE);}
 else if(add)gl.blendFunc(gl.ONE,gl.ONE);else gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,n);gl.bindVertexArray(null);}
// matter that is worked out for every point of the screen (a field): one drawing over the whole picture. `add` as in bmbBodies
export function bmbField(kind,u={},add=true){const gl=BMB.gl;if(!gl)return;const o=bmbUse(gl,kind);if(!o)return;gl.bindVertexArray(BMB.quad);
 bmbSet(gl,o,{uAR:BMB.view.AR,uPx:BMB.px,uT:BMB.t,uPass:1,uNoise:{tex:BMB.noise,unit:2},...u});
 if(add==='liquid'){gl.blendFunc(gl.ZERO,gl.SRC_COLOR);bmbSet(gl,o,{uPass:0});gl.drawArrays(gl.TRIANGLES,0,3);bmbSet(gl,o,{uPass:1});gl.blendFunc(gl.ONE,gl.ONE);}
 else if(add)gl.blendFunc(gl.ONE,gl.ONE);else gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,3);gl.bindVertexArray(null);}
// soft matter (gas, smoke) can be drawn at half the size and laid over the picture afterwards: bmbLayer(), the things, bmbLayerEnd(add)
export function bmbLayer(){const gl=BMB.gl,S=BMB.S;if(!gl||!S)return;BMB.lay=S.half;BMB.px=S.half.h;gl.bindFramebuffer(gl.FRAMEBUFFER,S.half.f);gl.viewport(0,0,S.half.w,S.half.h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);}
export function bmbLayerEnd(add=false){const gl=BMB.gl,S=BMB.S;if(!gl||!S||!BMB.lay)return;BMB.lay=null;BMB.px=BMB.view.px;gl.bindFramebuffer(gl.FRAMEBUFFER,S.hdr.f);gl.viewport(0,0,S.hdr.w,S.hdr.h);const o=bmbUse(gl,'copy');if(!o)return;
 gl.bindVertexArray(BMB.quad);bmbSet(gl,o,{uS:{tex:S.half.t,unit:0}});if(add)gl.blendFunc(gl.ONE,gl.ONE);else gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,3);gl.bindVertexArray(null);}
// A rope from a line of points [{x, y, w (radius), v (along, in radii), sh (0–1, height in its pile), tint, sd (shadow)}]: one piece
// (an instanced four-sided shape) between each two points, reaching a little beyond the liquid at each side (the soft shadow it lays
// on what is under it). Ropes are drawn in the order they are given, and each rope from its first point to its last: what comes
// later lies over what came before. A rope that crosses over itself (a coil) is given in stretches of `chunk` pieces that do not:
// each stretch filters what is under it and then adds its light, so a turn is seen through the turn that lies on it.
// Returns the number of pieces.
export const BMB_SKIRT=1.45;
export function bmbRopeReset(){if(BMB.rib){BMB.rib.n=0;BMB.rib.ranges.length=0;}}
export function bmbRope(pts,chunk=0){const R=BMB.rib,n=pts?pts.length:0;if(!R||n<2)return 0;if(R.tmp.length<n*6)R.tmp=new Float32Array(n*12);const d=R.data,T=R.tmp,first=R.n;let made=0;
 for(let i=0;i<n;i++){const p=pts[i],a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let tx=b.x-a.x,ty=b.y-a.y;const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;const nx=-ty,ny=tx,w=Math.max(1e-6,p.w);
  // where the rope bends tighter than its own radius, the inner side stops at the centre of the bend (the rope never folds over itself)
  let lim=1e9,side=0;if(i>0&&i<n-1){const ax=p.x-a.x,ay=p.y-a.y,bx=b.x-p.x,by=b.y-p.y,ang=Math.atan2(ax*by-ay*bx,ax*bx+ay*by);if(Math.abs(ang)>1e-4){lim=.82*(Math.hypot(ax,ay)+Math.hypot(bx,by))/2/Math.abs(ang);side=ang>0?1:-1;}}
  const o0=side===-1?Math.min(w*BMB_SKIRT,lim):w*BMB_SKIRT,o1=side===1?Math.min(w*BMB_SKIRT,lim):w*BMB_SKIRT,k=i*6;T[k]=p.x-nx*o0;T[k+1]=p.y-ny*o0;T[k+2]=-o0/w;T[k+3]=p.x+nx*o1;T[k+4]=p.y+ny*o1;T[k+5]=o1/w;}
 for(let i=0;i<n-1&&R.n<BMB_MAXSEG;i++){const p=pts[i],q=pts[i+1];if(Math.abs(q.x-p.x)+Math.abs(q.y-p.y)<1e-7)continue;const a=i*6,b=a+6;let k=R.n*BMB_SPR;
  d[k++]=T[a];d[k++]=T[a+1];d[k++]=T[a+3];d[k++]=T[a+4];d[k++]=T[b];d[k++]=T[b+1];d[k++]=T[b+3];d[k++]=T[b+4];d[k++]=T[a+2];d[k++]=T[a+5];d[k++]=T[b+2];d[k++]=T[b+5];
  d[k++]=p.v;d[k++]=q.v;d[k++]=p.w;d[k++]=q.w;d[k++]=p.sh??1;d[k++]=q.sh??1;d[k++]=p.tint||0;d[k++]=p.sd??1;R.n++;made++;}
 for(let f=first;f<R.n;f+=chunk>0?chunk:R.n)R.ranges.push(f,Math.min(R.n-f,chunk>0?chunk:R.n));
 return made;}
// draws the ropes given since bmbRopeReset, and starts again
export function bmbRopes(u={}){const gl=BMB.gl,R=BMB.rib;if(!gl||!R||!R.n)return;const o=bmbUse(gl,'rope');if(!o){bmbRopeReset();return;}
 gl.bindVertexArray(R.vao);gl.bindBuffer(gl.ARRAY_BUFFER,R.buf);gl.bufferSubData(gl.ARRAY_BUFFER,0,R.data,0,R.n*BMB_SPR);bmbSet(gl,o,{uAR:BMB.view.AR,uPx:BMB.view.px,uT:BMB.t,uSkirt:BMB_SKIRT,...u});const lp=o.U.uPass!==undefined?o.U.uPass:(o.U.uPass=gl.getUniformLocation(o.p,'uPass'));
 for(let r=0;r<R.ranges.length;r+=2){const off=R.ranges[r]*BMB_SPR*4;for(let i=0;i<5;i++)gl.vertexAttribPointer(1+i,4,gl.FLOAT,false,BMB_SPR*4,off+i*16);
  gl.uniform1f(lp,0);gl.blendFunc(gl.ZERO,gl.SRC_COLOR);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,R.ranges[r+1]);gl.uniform1f(lp,1);gl.blendFunc(gl.ONE,gl.ONE);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,R.ranges[r+1]);}
 for(let i=0;i<5;i++)gl.vertexAttribPointer(1+i,4,gl.FLOAT,false,BMB_SPR*4,i*16);gl.bindVertexArray(null);bmbRopeReset();}
// the uniforms of a program set once before several bmbBodies of the same kind are not kept between kinds: pass them each time
// the end of the frame: glow, and to the screen. dim: 1, or less while the picture waits for the next press
export function bmbEnd(o={}){const gl=BMB.gl,S=BMB.S;if(!gl||!S||BMB.lost)return false;gl.disable(gl.BLEND);gl.bindVertexArray(BMB.quad);
 let p=bmbUse(gl,'down');if(!p)return false;let src=S.hdr;for(const t of S.bl){gl.bindFramebuffer(gl.FRAMEBUFFER,t.f);gl.viewport(0,0,t.w,t.h);bmbSet(gl,p,{uS:{tex:src.t,unit:0},uTx:[.5/src.w,.5/src.h]});gl.drawArrays(gl.TRIANGLES,0,3);src=t;}
 p=bmbUse(gl,'up');if(!p)return false;let low=S.bl[BMB_LEVELS-1];for(let i=BMB_LEVELS-2;i>=0;i--){const t=S.up[i];gl.bindFramebuffer(gl.FRAMEBUFFER,t.f);gl.viewport(0,0,t.w,t.h);
  bmbSet(gl,p,{uS:{tex:low.t,unit:0},uB:{tex:S.bl[i].t,unit:1},uTx:[.5/low.w,.5/low.h],uMix:o.spread??.6});gl.drawArrays(gl.TRIANGLES,0,3);low=t;}
 p=bmbUse(gl,'final');if(!p)return false;gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,BMB.view.W,BMB.view.H);
 bmbSet(gl,p,{uS:{tex:S.hdr.t,unit:0},uB:{tex:low.t,unit:1},uBloom:o.bloom??.35,uExp:o.exp??1,uDim:o.dim??1});gl.drawArrays(gl.TRIANGLES,0,3);gl.bindVertexArray(null);return true;}
// colours: '#rrggbb' → linear RGB
export function bmbLin(hex){const n=parseInt(hex.slice(1),16),f=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};return [f(n>>16&255),f(n>>8&255),f(n&255)];}
// a small random generator with a seed (the same seed gives the same picture: the review tools and the tests need it)
export function bmbRandom(seed){let s=(seed>>>0)||1;return ()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
