// Pinta el món (EN25), 0.38: the WebGL2 painter of the page. The landscape's zones (polygons of the sheet, with their reserves and
// accents) are rasterised once per page and screen size into mask textures; each frame the shader (pinta-shaders.js) paints every zone
// at its progress (0 unpainted, 1 dry) over the paper, and the picture is copied into the canvas of the app. While nothing changes
// (no zone is being painted) the last picture is kept and copied, so the page costs nothing at rest. While a zone is being painted
// the picture is drawn at half size and scaled up (and once more at full size when the wash is dry). Without WebGL2, or when the
// context is lost, ptgDraw returns false and pinta-art.js draws flat washes instead.
import {glLoadShare} from './carrega.js';
import {PT_FS,PT_VS} from './pinta-shaders.js';
import {PT_STYLE} from './pinta.js';
const PW={gl:null,cv:null,failed:false,lost:false,prog:null,U:null,par:null,masks:null,maskKey:'',image:null,imageKey:'',quad:false};
function pwInit(){if(PW.gl||PW.failed)return PW.gl;if(typeof document==='undefined')return null;
 try{const cv=document.createElement('canvas');cv.width=4;cv.height=4;const gl=cv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  if(!gl){PW.failed=true;return null;}PW.par=gl.getExtension('KHR_parallel_shader_compile');
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();PW.lost=true;},false);cv.addEventListener('webglcontextrestored',()=>{PW.lost=false;PW.prog=null;PW.masks=null;PW.maskKey='';PW.quad=false;},false);
  PW.gl=gl;PW.cv=cv;return gl;}catch{PW.failed=true;return null;}}
function pwShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
function pwProgram(gl){if(PW.prog)return PW.prog;const p=gl.createProgram(),v=pwShader(gl,gl.VERTEX_SHADER,PT_VS),f=pwShader(gl,gl.FRAGMENT_SHADER,PT_FS);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);PW.prog={p,v,f,ok:null};return PW.prog;}
function pwReady(gl,o){if(o.ok!==null)return true;if(PW.par&&!gl.getProgramParameter(o.p,PW.par.COMPLETION_STATUS_KHR))return false;return true;}
function pwUse(gl,o){if(o.ok===null){o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);if(!o.ok&&typeof console!=='undefined')console.warn('Pinta el món: shader',gl.getShaderInfoLog(o.f)||gl.getProgramInfoLog(o.p));
  if(o.ok){const U={},names=['uR','uT','uMap','uM0','uM1','uB0','uB1','uA0','uA1','uDens','uEdge','uGran','uBleed','uGrain','uBloom','uGlaze','uWarm','uDecor','uBase'];for(const n of names)U[n]=gl.getUniformLocation(o.p,n);
   for(let i=0;i<6;i++)for(const n of ['uCol','uGlz','uAcc','uFade','uSeed','uProg','uRad'])U[n+i]=gl.getUniformLocation(o.p,`${n}[${i}]`);PW.U=U;}}
 if(!o.ok)return false;gl.useProgram(o.p);if(!PW.quad){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);PW.quad=true;}return true;}
// The shader is linked in the background from the home page, so the first page does not wait for it.
// 0.40: only where the browser compiles in the background, as the dives (0.35); elsewhere the program waited on the menu for a moment
// (about 0.4 s without a graphics card), and the loading cover of the activity compiles it now.
export function pintaPrewarm(){if(typeof document==='undefined')return false;const gl=pwInit();if(!gl||PW.lost||!PW.par)return false;pwProgram(gl);return true;}
// The loading cover (0.40): the programs needed at the start (the watercolour), started together; the share already linked (carrega.js).
// 1 where WebGL cannot be used: the activity then draws its older pictures.
export function pintaLoad(){if(typeof document==='undefined')return 1;const gl=pwInit();if(!gl||PW.lost)return 1;return glLoadShare(gl,[pwProgram(gl)],PW.par,o=>pwUse(gl,o));}
function pwTexture(gl,cv,old){const t=old||gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function pwFill(c,poly){c.beginPath();poly.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
// The masks of a page at W × H device pixels: an index canvas (each zone fills its polygons back to front with its number, the reserves
// with zero) gives the hard masks (one channel per zone, three zones per texture); blurred they give the edge of the wash; the accents
// get their own, blurred a little. map = [sx, sy, ox, oy], sheet → device pixels.
export function pintaMasks(zones,W,H,map,blurPx=6){const mk=()=>{const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d',{willReadFrequently:true});return [cv,c];};
 const [icv,ic]=mk();ic.fillStyle='#000';ic.fillRect(0,0,W,H);ic.setTransform(map[0],0,0,map[1],map[2],map[3]);
 // the zones are drawn in their layer order (a torrent over the meadows it crosses), later ones covering earlier ones
 zones.map((z,i)=>i).sort((a,b)=>(zones[a].layer??a)-(zones[b].layer??b)).forEach(i=>{const z=zones[i],v=(i+1)*40;ic.fillStyle=`rgb(${v},${v},${v})`;for(const p of (z.polys||[z.poly]))pwFill(ic,p);if(z.reserves){ic.fillStyle='#000';for(const r of z.reserves)pwFill(ic,r);}});
 ic.setTransform(1,0,0,1,0,0);const idx=ic.getImageData(0,0,W,H).data,out={M:[],B:[],A:[]};
 for(let g=0;g<2;g++){const [mcv,mc]=mk(),img=mc.createImageData(W,H),d=img.data;
  for(let p=0;p<W*H;p++){const k=Math.round(idx[p*4]/40);d[p*4]=k===g*3+1?255:0;d[p*4+1]=k===g*3+2?255:0;d[p*4+2]=k===g*3+3?255:0;d[p*4+3]=255;}
  mc.putImageData(img,0,0);const [bcv,bc]=mk();bc.fillStyle='#000';bc.fillRect(0,0,W,H);bc.filter=`blur(${blurPx}px)`;bc.drawImage(mcv,0,0);bc.filter='none';
  const [acv,ac]=mk(),[a2,a2c]=mk();ac.fillStyle='#000';ac.fillRect(0,0,W,H);ac.setTransform(map[0],0,0,map[1],map[2],map[3]);ac.globalCompositeOperation='lighter';
  for(let k=0;k<3;k++){const z=zones[g*3+k];if(!z)continue;ac.fillStyle=['#f00','#0f0','#00f'][k];for(const p of (z.accents||[]))pwFill(ac,p);}
  ac.setTransform(1,0,0,1,0,0);a2c.fillStyle='#000';a2c.fillRect(0,0,W,H);a2c.filter=`blur(${Math.max(1,blurPx*.3)}px)`;a2c.drawImage(acv,0,0);a2c.filter='none';
  out.M.push(mcv);out.B.push(bcv);out.A.push(a2);}
 return out;}
const pwRadius=z=>Math.max(...(z.polys||[z.poly]).flat().map(([x,y])=>Math.hypot(x-z.seed[0],y-z.seed[1])));
function pwRender(gl,W,H,map,zones,prog,o){const U=PW.U;gl.viewport(0,0,W,H);
 gl.uniform2f(U.uR,W,H);gl.uniform1f(U.uT,o.t||0);gl.uniform4f(U.uMap,map[0],map[1],map[2],map[3]);
 const T=PW.masks.tex;[['uM0',T.M[0]],['uM1',T.M[1]],['uB0',T.B[0]],['uB1',T.B[1]],['uA0',T.A[0]],['uA1',T.A[1]]].forEach(([n,t],i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);gl.uniform1i(U[n],i);});
 const s=o.style||PT_STYLE;gl.uniform1f(U.uDens,s.dens);gl.uniform1f(U.uEdge,s.edge);gl.uniform1f(U.uGran,s.gran);gl.uniform1f(U.uBleed,s.bleed);gl.uniform1f(U.uGrain,o.plain?s.grain*.5:s.grain);gl.uniform1f(U.uBloom,s.bloom);gl.uniform1f(U.uGlaze,s.glaze);gl.uniform1f(U.uWarm,s.warm);
 gl.uniform1f(U.uDecor,o.decor==='none'?2:o.decor==='dim'?1:0);gl.uniform1f(U.uBase,o.base==='white'?1:0);
 zones.forEach((z,i)=>{const p=z.pal;gl.uniform3f(U['uCol'+i],p.col[0],p.col[1],p.col[2]);gl.uniform3f(U['uGlz'+i],p.glaze[0],p.glaze[1],p.glaze[2]);gl.uniform3f(U['uAcc'+i],p.accent[0],p.accent[1],p.accent[2]);gl.uniform3f(U['uFade'+i],p.fade[0],p.fade[1],p.fade[2]);gl.uniform2f(U['uSeed'+i],z.seed[0],z.seed[1]);gl.uniform1f(U['uProg'+i],prog[i]||0);gl.uniform1f(U['uRad'+i],pwRadius(z));});
 gl.drawArrays(gl.TRIANGLES,0,3);}
// Draws the watercolour of the page into the 2D context c (device pixels: the transform is reset). o: {key (page and size), zones (with
// pal and seed), prog[6], map (sheet → CSS px), decor, base, plain, t, moving (a zone is being painted now)}. Returns false when
// WebGL cannot draw.
export function pintaDraw(c,o){if(typeof document==='undefined')return false;const gl=pwInit();if(!gl||PW.lost)return false;const P=pwProgram(gl);if(!pwReady(gl,P))return false;if(!pwUse(gl,P))return false;
 const cv=c.canvas,W=cv.width,H=cv.height,m=(c.getTransform&&c.getTransform())||{a:1,d:1},k=m.a||1;const mapD=[o.map[0]*k,o.map[1]*(m.d||k),o.map[2]*k,o.map[3]*(m.d||k)];
 const maskKey=`${o.key}|${W}x${H}|${mapD.map(x=>x.toFixed(2)).join(',')}`;
 if(PW.maskKey!==maskKey){const masks=pintaMasks(o.zones,W,H,mapD,Math.max(4,6*k*Math.min(W/1280,1.5)));const old=PW.masks?.tex;const tex={M:masks.M.map((x,i)=>pwTexture(gl,x,old?.M[i])),B:masks.B.map((x,i)=>pwTexture(gl,x,old?.B[i])),A:masks.A.map((x,i)=>pwTexture(gl,x,old?.A[i]))};PW.masks={tex};PW.maskKey=maskKey;PW.imageKey='';}
 const half=o.moving&&W*H>700*400?2:1,w=Math.ceil(W/half),h=Math.ceil(H/half);
 const imageKey=`${maskKey}|${o.prog.map(x=>x.toFixed(3)).join(',')}|${o.decor}|${o.base}|${o.plain?1:0}|${half}|${(o.moving?o.t:0).toFixed(2)}`;
 if(PW.imageKey!==imageKey){if(PW.cv.width!==w||PW.cv.height!==h){PW.cv.width=w;PW.cv.height=h;}
  pwRender(gl,w,h,[mapD[0]/half,mapD[1]/half,mapD[2]/half,mapD[3]/half],o.zones,o.prog,o);PW.imageKey=imageKey;}
 c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.imageSmoothingEnabled=true;c.drawImage(PW.cv,0,0,w,h,0,0,W,H);c.restore();return true;}
export const pintaGlFailed=()=>PW.failed||PW.lost;
