// La nova Pluja de colors (CE45, 0.55) · the WebGL2 engine of the floor of liquid paint.
// The floor is a rectangle of thick liquid seen from a fixed camera (in perspective, about 48° down, or from above). The liquid is a
// velocity grid (stable fluids); the ink is up to eight colours (seven of the scene and a pale one for the lace of the cells), kept as
// amounts in two RGBA16F textures moved by the liquid and pushed by every drop (pluja-shaders.js). The relief (paint thickness + the
// rings of the impacts) and two soft window lights make the wet gloss. Drops in the air, splash droplets and the thread above a falling
// drop are sprites drawn over the floor. Every scene uses the same programs; a scene only changes the palette and the drops.
// Coordinates: the floor ("f") runs x ∈ [0, AR], y ∈ [0, 1] (y = depth, 0 = near); the screen (s) runs [0, 1] from the top left.
// Needs WebGL2 and EXT_color_buffer_float; pljSetup returns false otherwise (Marc, 8 November 2026: no other picture for now).
import {PLJ_VS,PLJ_FS_ADVECT,PLJ_FS_CURL,PLJ_FS_FORCE,PLJ_FS_DIV,PLJ_FS_JACOBI,PLJ_FS_GRAD,PLJ_FS_DYE,PLJ_FS_RIPPLE,PLJ_FS_RENDER,PLJ_VS_SPRITE,PLJ_FS_SPRITE} from './pluja-shaders.js';
export const PLJ={gl:null,cv:null,failed:false,lost:false,par:null,P:null,quad:null,spr:null,S:null,t:0,drops:[],keep:1,lvl:1,dil:1,fill:0,view:null,pal:null,look:null,tOff:Math.random()*500};
// the look (the style trial tunes these): liquid, cells, relief and light
export const PLJ_LOOK=Object.freeze({damp:1.3,eps:0,drift:.035,jacobi:24,swirl:.12,rim:.06,cell:.05,ring:.09,streak:45,level:.08,gap:.014,fill:.05,cellsOn:.85,cellsBlack:0,
 bump:.0015,rip:.006,ripAmp:.05,ripC:.3,ripF:12,ripTau:.12,ripT:.3,ripDamp:.996,ripSteps:4,spec:.7,floor:.0005,soft:.75,sharp:1.6,gloss:.02,glint:1.2,fog:[.55,1],grow:.9,fall:.33,fallH:.55,crown:.36});
function pljInit(){if(PLJ.gl||PLJ.failed)return PLJ.gl;if(typeof document==='undefined')return null;
 try{const cv=document.createElement('canvas');cv.width=4;cv.height=4;const gl=cv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  if(!gl||!gl.getExtension('EXT_color_buffer_float')){PLJ.failed=true;return null;}PLJ.par=gl.getExtension('KHR_parallel_shader_compile');
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();PLJ.lost=true;},false);cv.addEventListener('webglcontextrestored',()=>{PLJ.lost=false;PLJ.P=null;PLJ.S=null;PLJ.quad=null;PLJ.spr=null;},false);
  PLJ.gl=gl;PLJ.cv=cv;return gl;}catch{PLJ.failed=true;return null;}}
const PLJ_SRC={advect:[PLJ_VS,PLJ_FS_ADVECT],curl:[PLJ_VS,PLJ_FS_CURL],force:[PLJ_VS,PLJ_FS_FORCE],div:[PLJ_VS,PLJ_FS_DIV],jacobi:[PLJ_VS,PLJ_FS_JACOBI],grad:[PLJ_VS,PLJ_FS_GRAD],
 dye:[PLJ_VS,PLJ_FS_DYE],ripple:[PLJ_VS,PLJ_FS_RIPPLE],render:[PLJ_VS,PLJ_FS_RENDER],sprite:[PLJ_VS_SPRITE,PLJ_FS_SPRITE]};
function pljShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
function pljPrograms(gl){if(PLJ.P)return PLJ.P;PLJ.P={};for(const [k,[vs,fs]] of Object.entries(PLJ_SRC)){const p=gl.createProgram(),v=pljShader(gl,gl.VERTEX_SHADER,vs),f=pljShader(gl,gl.FRAGMENT_SHADER,fs);
  gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);PLJ.P[k]={p,v,f,ok:null,U:{},name:k};}return PLJ.P;}
export function pljPrograms_list(){const gl=pljInit();return gl?Object.values(pljPrograms(gl)):[];}
function pljUse(gl,name){const o=PLJ.P[name];if(o.ok===null){o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);if(!o.ok&&typeof console!=='undefined')console.warn('Pluja de colors: shader',name,gl.getShaderInfoLog(o.v)||'',gl.getShaderInfoLog(o.f)||'',gl.getProgramInfoLog(o.p));}
 if(!o.ok)return null;gl.useProgram(o.p);return o;}
// a program settled (linked or failed) for the loading cover (carrega.js): the cover calls it once the browser has linked it
export function pljSettle(o){const gl=PLJ.gl;if(!gl||o.ok!==null)return;o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);if(!o.ok&&typeof console!=='undefined')console.warn('Pluja de colors: shader',o.name,gl.getShaderInfoLog(o.v)||'',gl.getShaderInfoLog(o.f)||'',gl.getProgramInfoLog(o.p));}
export const pljReady=()=>{const gl=pljInit();return !!gl&&!PLJ.lost;};
const pljLoc=(gl,o,n)=>n in o.U?o.U[n]:(o.U[n]=gl.getUniformLocation(o.p,n));
function pljSet(gl,o,u){for(const [n,v] of Object.entries(u)){const l=pljLoc(gl,o,n);if(l===null)continue;
 if(typeof v==='number'){if(/^u[NI]$|^uN$/.test(n))gl.uniform1i(l,v);else gl.uniform1f(l,v);}else if(v.tex){gl.activeTexture(gl.TEXTURE0+v.unit);gl.bindTexture(gl.TEXTURE_2D,v.tex);gl.uniform1i(l,v.unit);}
 else if(v.v4)gl.uniform4fv(l,v.v4);else if(v.v3)gl.uniform3fv(l,v.v3);else if(v.f1)gl.uniform1fv(l,v.f1);else if(v.length===2)gl.uniform2fv(l,v);else if(v.length===3)gl.uniform3fv(l,v);else if(v.length===4)gl.uniform4fv(l,v);}}
function pljTex(gl,w,h,fmt,mips){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);const lv=mips?Math.floor(Math.log2(Math.max(w,h)))+1:1;gl.texStorage2D(gl.TEXTURE_2D,lv,fmt,w,h);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mips?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function pljFbo(gl,texs){const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);texs.forEach((t,i)=>gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0+i,gl.TEXTURE_2D,t,0));
 gl.drawBuffers(texs.map((_,i)=>gl.COLOR_ATTACHMENT0+i));return {f,texs};}
function pljQuad(gl){if(PLJ.quad)return;const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);PLJ.quad=vao;
 const sv=gl.createVertexArray();gl.bindVertexArray(sv);const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);const ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,4096*48,gl.DYNAMIC_DRAW);
 gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,48,0);gl.vertexAttribDivisor(1,1);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,48,16);gl.vertexAttribDivisor(2,1);
 gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,48,32);gl.vertexAttribDivisor(3,1);
 PLJ.spr={vao:sv,buf:ib};gl.bindVertexArray(null);}
function pljPass(gl,fbo,w,h){gl.bindFramebuffer(gl.FRAMEBUFFER,fbo?fbo.f:null);gl.viewport(0,0,w,h);gl.bindVertexArray(PLJ.quad);gl.drawArrays(gl.TRIANGLES,0,3);}
// colours: '#rrggbb' → linear RGB and OKLab (Ottosson, 2020)
export function pljLin(hex){const n=parseInt(hex.slice(1),16),f=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};return [f(n>>16&255),f(n>>8&255),f(n&255)];}
export function pljLab(hex){const [r,g,b]=pljLin(hex),l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];}
// the camera and the rectangle of floor it sees
export function pljView(W,H,o={}){const top=!!o.top,asp=W/H;
 if(top)return {top,W,H,asp,AR:asp};
 const p=(o.pitch??48)*Math.PI/180,fov=(o.fov??44)*Math.PI/180,ty=Math.tan(fov/2),tx=ty*asp,cam=[0,1,0],fwd=[0,-Math.sin(p),Math.cos(p)],up=[0,Math.cos(p),Math.sin(p)],right=[1,0,0];
 const hit=(sx,sy)=>{const d=[sx*tx,fwd[1]+sy*ty*up[1],fwd[2]+sy*ty*up[2]],t=-cam[1]/d[1];return [d[0]*t,d[2]*t];};
 const tr=hit(1,1),bt=hit(0,-1),maxX=tr[0],minZ=bt[1],maxZ=tr[1],rect=[-maxX,minZ,2*maxX,maxZ-minZ];
 return {top,W,H,asp,AR:rect[2]/rect[3],cam,fwd,up,right,tx,ty,rect};}
export function pljScreenToFloor(V,sx,sy){if(V.top)return [sx*V.AR,1-sy];const x=2*sx-1,y=1-2*sy,d=[x*V.tx,V.fwd[1]+y*V.ty*V.up[1],V.fwd[2]+y*V.ty*V.up[2]];if(d[1]>=0)return null;const t=-V.cam[1]/d[1];
 return [(d[0]*t-V.rect[0])/V.rect[3],(d[2]*t-V.rect[1])/V.rect[3]];}
// floor point (and height above it, in floor units) → clip space, and how many clip units of height one floor unit takes there
export function pljFloorToClip(V,fx,fy,h=0){if(V.top){const k=2*(1+h*1.6);return [fx/V.AR*2-1,fy*2-1,k];}
 const w=V.rect[3],P=[V.rect[0]+fx*w,h*w,V.rect[1]+fy*w],d=[P[0]-V.cam[0],P[1]-V.cam[1],P[2]-V.cam[2]],x=d[0],y=d[1]*V.up[1]+d[2]*V.up[2],z=d[1]*V.fwd[1]+d[2]*V.fwd[2];
 return [x/(z*V.tx),y/(z*V.ty),w/(z*V.ty)];}
// textures for a view; kept while the sizes do not change
// The textures for a view; kept (with the paint on them) while their sizes do not change, so a new size of the picture alone (the
// adaptive scale) keeps the floor as it is. Returns 'new' when the floor was made again (and is black), true when it was kept.
export function pljSetup(W,H,o={}){const gl=pljInit();if(!gl||PLJ.lost)return false;pljPrograms(gl);pljQuad(gl);
 const V=pljView(W,H,o),dyeH=o.dyeH||864,velH=o.velH||144,ripH=o.ripH||288,DW=Math.round(dyeH*V.AR),VW=Math.round(velH*V.AR),RW=Math.round(ripH*V.AR),key=[DW,dyeH,VW,velH,RW,ripH].join();
 if(PLJ.cv.width!==W||PLJ.cv.height!==H){PLJ.cv.width=W;PLJ.cv.height=H;}PLJ.view={...V,DW,DH:dyeH,VW,VH:velH,RW,RH:ripH};PLJ.look={...PLJ_LOOK,...(o.look||{})};
 if(PLJ.S&&PLJ.S.key===key&&PLJ.pal&&!o.clear)return true;
 if(!PLJ.S||PLJ.S.key!==key){const F=gl.RGBA16F,G=gl.RG16F,R=gl.R16F,S={key};
  S.vel=[pljFbo(gl,[pljTex(gl,VW,velH,G)]),pljFbo(gl,[pljTex(gl,VW,velH,G)])];S.curl=pljFbo(gl,[pljTex(gl,VW,velH,R)]);S.div=pljFbo(gl,[pljTex(gl,VW,velH,R)]);
  S.pres=[pljFbo(gl,[pljTex(gl,VW,velH,R)]),pljFbo(gl,[pljTex(gl,VW,velH,R)])];
  S.dye=[pljFbo(gl,[pljTex(gl,DW,dyeH,F,true),pljTex(gl,DW,dyeH,F,true)]),pljFbo(gl,[pljTex(gl,DW,dyeH,F,true),pljTex(gl,DW,dyeH,F,true)])];
  S.rip=[pljFbo(gl,[pljTex(gl,RW,ripH,G)]),pljFbo(gl,[pljTex(gl,RW,ripH,G)])];PLJ.S=S;}
 pljPalette(o.pal||PLJ_TRIAL_PAL,o.hgt);pljClear();return 'new';}
export function pljLook(over){PLJ.look={...PLJ_LOOK,...(over||{})};}
export function pljPalette(pal,hgt){PLJ.pal={hex:pal.slice(0,8),lab:new Float32Array(pal.slice(0,8).flatMap(pljLab)),lin:pal.slice(0,8).map(pljLin),hgt:new Float32Array(hgt||[.9,.7,1,.6,.85,.75,.95,1.25])};}
export function pljClear(){const gl=PLJ.gl,S=PLJ.S;if(!gl||!S)return;const z=new Float32Array([0,0,0,0]);
 for(const fb of [...S.vel,S.curl,S.div,...S.pres,...S.dye,...S.rip]){gl.bindFramebuffer(gl.FRAMEBUFFER,fb.f);fb.texs.forEach((_,i)=>gl.clearBufferfv(gl.COLOR,i,z));}
 PLJ.t=0;PLJ.drops=[];PLJ.keep=1;PLJ.lvl=1;PLJ.dil=1;PLJ.fill=0;PLJ.tOff=Math.random()*500;}
// a drop: {x, y (floor), R (final radius, floor units), ink (0–6), under (colour below it, −1 on bare floor), t0 (impact), seed, size}
export function pljDrop(d){const L=PLJ.look||PLJ_LOOK;PLJ.drops.push({grow:L.grow,swirl:L.swirl,rim:L.rim,seed:Math.random(),under:-1,size:1,...d,A:0,R2:d.R*d.R,hit:false});}
const pljEase=x=>1-(1-x)**3;
export function pljStep(dt){const gl=PLJ.gl,S=PLJ.S,V=PLJ.view,L=PLJ.look;if(!gl||!S||PLJ.lost)return false;const t=PLJ.t+dt;PLJ.t=t;
 if(PLJ.dil<1){PLJ.keep=Math.pow(PLJ.dil,dt);PLJ.lvl*=PLJ.keep;}else{PLJ.keep=1;PLJ.lvl=1;}
 const grow=[],swirl=[],imp=[];
 // a drop that lands inside a drop still spreading stops that one (its source is covered) and takes over the rest of its paint:
 // two sources at one spot would otherwise lay a ring of each colour every frame (a fine striped spiral)
 for(const d of PLJ.drops){if(d.hit||t<d.t0)continue;for(const o of PLJ.drops){if(o===d||!o.hit||o.A>=o.R2)continue;
   if(Math.hypot(d.x-o.x,d.y-o.y)<Math.sqrt(o.A)+.5*d.R){const rem=o.R2-o.A;o.R2=o.A;d.R2+=rem;d.R=Math.sqrt(d.R2);}}}
 for(const d of PLJ.drops){const tau=(t-d.t0)/d.grow;if(tau>0&&d.A<d.R2){const A=d.R2*pljEase(Math.min(1,tau)),dA=A-d.A;d.A=A;if(dA>0)grow.push([d,dA]);}
  if(t>=d.t0&&t<d.t0+d.grow*1.6)swirl.push([d,1-(t-d.t0)/(d.grow*1.6)]);if(!d.hit&&t>=d.t0){d.hit=true;imp.push(d);}}
 grow.splice(0,Math.max(0,grow.length-8));swirl.splice(0,Math.max(0,swirl.length-8));
 const tx=[1/V.VW,1/V.VH];
 let o=pljUse(gl,'advect');if(!o)return false;pljSet(gl,o,{uVel:{tex:S.vel[0].texs[0],unit:0},uDt:dt,uAR:V.AR,uDamp:Math.exp(-L.damp*dt)});pljPass(gl,S.vel[1],V.VW,V.VH);
 o=pljUse(gl,'curl');if(!o)return false;pljSet(gl,o,{uVel:{tex:S.vel[1].texs[0],unit:0},uTx:tx});pljPass(gl,S.curl,V.VW,V.VH);
 o=pljUse(gl,'force');if(!o)return false;const s1=new Float32Array(32),s2=new Float32Array(32);swirl.forEach(([d,k],i)=>{s1.set([d.x,d.y,d.R,d.swirl*k*(d.seed<.5?-1:1)],i*4);s2.set([d.seed,d.rim*k,0,0],i*4);});
 pljSet(gl,o,{uVel:{tex:S.vel[1].texs[0],unit:0},uCurl:{tex:S.curl.texs[0],unit:1},uTx:tx,uAR:V.AR,uDt:dt,uEps:L.eps,uT:t+PLJ.tOff,uDrift:L.drift,uN:swirl.length,'uS[0]':{v4:s1},'uS2[0]':{v4:s2}});pljPass(gl,S.vel[0],V.VW,V.VH);
 o=pljUse(gl,'div');if(!o)return false;pljSet(gl,o,{uVel:{tex:S.vel[0].texs[0],unit:0},uTx:tx});pljPass(gl,S.div,V.VW,V.VH);
 o=pljUse(gl,'jacobi');if(!o)return false;for(let i=0;i<L.jacobi;i++){pljSet(gl,o,{uP:{tex:S.pres[0].texs[0],unit:0},uDiv:{tex:S.div.texs[0],unit:1},uTx:tx});pljPass(gl,S.pres[1],V.VW,V.VH);S.pres.reverse();}
 o=pljUse(gl,'grad');if(!o)return false;pljSet(gl,o,{uVel:{tex:S.vel[0].texs[0],unit:0},uP:{tex:S.pres[0].texs[0],unit:1},uTx:tx});pljPass(gl,S.vel[1],V.VW,V.VH);S.vel.reverse();
 o=pljUse(gl,'dye');if(!o)return false;const p=new Float32Array(32),q=new Float32Array(32),q2=new Float32Array(32);
 grow.forEach(([d,dA],i)=>{p.set([d.x,d.y,dA,d.A],i*4);q.set([d.R2,d.ink,d.under,d.seed*97.13],i*4);q2.set([d.under>=0?L.cellsOn:L.cellsBlack,0,0,0],i*4);});
 pljSet(gl,o,{uD0:{tex:S.dye[0].texs[0],unit:0},uD1:{tex:S.dye[0].texs[1],unit:1},uVel:{tex:S.vel[0].texs[0],unit:2},uDS:[V.DW,V.DH],uAR:V.AR,uDt:dt,uKeep:PLJ.keep,uCell:L.cell,uRing:L.ring,uStreak:L.streak,uLevel:PLJ.keep<1?0:L.level,uGap:L.gap,uFill:PLJ.keep<1?0:PLJ.fill*L.fill,uT:t,
  uN:grow.length,'uP[0]':{v4:p},'uQ[0]':{v4:q},'uQ2[0]':{v4:q2}});pljPass(gl,S.dye[1],V.DW,V.DH);S.dye.reverse();
 // the rings: each impact shakes the surface for a moment (a damped oscillation at the point), so several rings leave it
 o=pljUse(gl,'ripple');if(!o)return false;const im=new Float32Array(32),ia=new Float32Array(8),act=PLJ.drops.filter(d=>t-dt>=d.t0-1e-9&&t-dt<d.t0+L.ripT).slice(-8);
 act.forEach((d,i)=>{im.set([d.x,d.y,Math.max(.011,d.R*.08),-L.ripAmp*Math.sqrt(d.size)],i*4);ia[i]=t-dt-d.t0;});
 for(let k=0;k<L.ripSteps;k++){pljSet(gl,o,{uH:{tex:S.rip[0].texs[0],unit:0},uTx:[1/V.RW,1/V.RH],uC:L.ripC,uDamp:L.ripDamp,uAR:V.AR,uN:act.length,'uI[0]':{v4:im},'uAge[0]':{f1:ia.map(x=>x+k*dt/L.ripSteps)},uF:L.ripF,uTau:L.ripTau});pljPass(gl,S.rip[1],V.RW,V.RH);S.rip.reverse();}
 PLJ.drops=PLJ.drops.filter(d=>d.A<d.R2||t<d.t0+1.2);return true;}
// the floor brought to the time t of the activity, in steps of at most 1/30 s (at most n steps per frame; far behind, as after a
// pause, the floor skips the time it missed instead of running it)
export function pljAdvance(t,n=3){if(!PLJ.gl||!PLJ.S||PLJ.lost)return false;if(t-PLJ.t>n/30)PLJ.t=t-n/30;let k=0;while(PLJ.t<t-1e-6&&k<n){if(!pljStep(Math.min(1/30,t-PLJ.t)))return false;k++;}return true;}
// after the last drop of a scene the paint flows on into the black that is left, until the floor is full
export function pljFill(on){PLJ.fill=on?1:0;}
// how much paint lies on each cell of a small grid of the floor (0 = bare, 1 = covered): a small mipmap level of the ink read back
// (once per press, to choose where the next drops fall and to know when the floor is full)
// (and which of the seven colours lies most on each cell: the colour a drop falls on, for the colour of its cells)
export function pljCoverage(lv=5){const gl=PLJ.gl,S=PLJ.S,V=PLJ.view;if(!gl||!S||PLJ.lost)return null;const w=Math.max(1,V.DW>>lv),h=Math.max(1,V.DH>>lv),c=new Float32Array(w*h),best=new Float32Array(w*h),ink=new Int8Array(w*h).fill(-1),buf=new Float32Array(w*h*4);
 const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
 S.dye[0].texs.forEach((t,g)=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.generateMipmap(gl.TEXTURE_2D);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,lv);gl.readBuffer(gl.COLOR_ATTACHMENT0);
  gl.readPixels(0,0,w,h,gl.RGBA,gl.FLOAT,buf);for(let i=0;i<w*h;i++)for(let k=0;k<4;k++){const v=buf[4*i+k];c[i]+=v;if(g*4+k<7&&v>best[i]){best[i]=v;ink[i]=g*4+k;}}});
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.deleteFramebuffer(fb);return {w,h,c,ink};}
// the dilution at the end of a scene: every ink fades a little each step
// (perSecond: the part of the paint kept each second; 1 = no dilution); each step of the floor applies it
export function pljDilute(perSecond){PLJ.dil=perSecond;}
// the sprites: falling drops with their thread, splash droplets
function pljSprites(V,t){const L=PLJ.look,out=[];const col=(k,l=0)=>{const c=PLJ.pal.lin[Math.max(0,k)]||[1,1,1];return [c[0]+(1-c[0])*l,c[1]+(1-c[1])*l,c[2]+(1-c[2])*l];};
 for(const d of PLJ.drops){const r=.012*Math.sqrt(d.size)+.006;
  if(t<d.t0&&t>d.t0-L.fall){const s=(t-(d.t0-L.fall))/L.fall,h=L.fallH*(1-s*s),c=pljFloorToClip(V,d.x,d.y,h+r),cl=col(d.ink,.1);
   out.push([c[0],c[1],r*c[2]*.9,2,...cl,.55*(1-s*.6)]);out.push([c[0],c[1],r*c[2],1,...cl,1]);}
  const tau=t-d.t0;if(tau>=0&&tau<L.crown){const u=tau/L.crown,c0=pljFloorToClip(V,d.x,d.y,0),c1=pljFloorToClip(V,d.x,d.y+.01,0),c2=pljFloorToClip(V,d.x+.01,d.y,0),kx=Math.max(1e-6,Math.abs(c2[0]-c0[0]))*V.asp/.01,e=Math.abs(c1[1]-c0[1])/.01/kx;
   const rc=Math.min(Math.sqrt(d.A)*1.03+.008,.03+.3*d.R),hp=Math.sin(Math.PI/2*Math.min(1,u/.22))*(u<.22?1:Math.max(0,1-(u-.22)/.78)**1.5),hc=Math.min(.045,.5*rc+.006)*hp,a=Math.min(1,u*14)*Math.min(1,(1-u)*4);
   if(hc>0)out.push([c0[0],c0[1],rc*kx,3,...col(d.ink,.12),a,V.top?1:e,V.top?.3*hc/.045:hc*c0[2]/(rc*kx),d.seed,u]);}
  if(tau>=0&&tau<.55){const n=11+Math.floor(d.seed*6),g=5.5;for(let i=0;i<n;i++){const j=Math.abs(Math.sin(i*7.7+d.seed*31)),k2=Math.abs(Math.sin(i*3.1+d.seed*17)),a=(i/n+d.seed*.37)*Math.PI*2+(k2-.5)*.5,te=tau-.04*k2;if(te<=0)continue;
    const vu=(.25+.6*j)*Math.sqrt(d.size),vr=.06+.28*k2,h=vu*te-.5*g*te*te;if(h<=0)continue;const rr=.015*Math.sqrt(d.size)+vr*te,x=d.x+Math.cos(a)*rr,y=d.y+Math.sin(a)*rr,c=pljFloorToClip(V,x,y,h);
    out.push([c[0],c[1],(.0015+.0045*(1-j)*k2+.001)*Math.sqrt(d.size)*c[2],0,...col(d.ink,.15),1]);}}}
 out.sort((a,b)=>b[3]-a[3]);return out.map(x=>x.length<12?[...x,0,0,0,0]:x);}
export function pljRender(o={}){const gl=PLJ.gl,S=PLJ.S,V=PLJ.view,L=PLJ.look;if(!gl||!S||PLJ.lost)return false;
 for(const t of S.dye[0].texs){gl.bindTexture(gl.TEXTURE_2D,t);gl.generateMipmap(gl.TEXTURE_2D);}
 const r=pljUse(gl,'render');if(!r)return false;
 pljSet(gl,r,{uD0:{tex:S.dye[0].texs[0],unit:0},uD1:{tex:S.dye[0].texs[1],unit:1},uH:{tex:S.rip[0].texs[0],unit:2},uRes:[V.W,V.H],uDS:[V.DW,V.DH],uAR:V.AR,uTop:V.top?1:0,uT:PLJ.t,
  uBump:L.bump,uRip:L.rip,uSpec:L.spec,uFloor:L.floor,uSoft:L.soft,uSharp:L.sharp,uGloss:L.gloss,uGlint:L.glint,uLvl:Math.max(.02,PLJ.lvl),uRS:[V.RW,V.RH],uCam:V.cam||[0,1,0],uFwd:V.fwd||[0,0,1],uRight:V.right||[1,0,0],uUp:V.up||[0,1,0],uTan:[V.tx||1,V.ty||1],uFog:V.rect?[Math.hypot(1,V.rect[1]+V.rect[3]*L.fog[0]),Math.hypot(1,V.rect[1]+V.rect[3]*L.fog[1])*1.06]:[9,10],
  uRect:V.rect||[0,0,1,1],'uLab[0]':{v3:PLJ.pal.lab},'uHgt[0]':{f1:PLJ.pal.hgt}});
 pljPass(gl,null,V.W,V.H);
 if(o.sprites!==false){const sp=pljSprites(V,PLJ.t);if(sp.length){const s=pljUse(gl,'sprite');if(s){const a=new Float32Array(sp.length*12);sp.forEach((x,i)=>a.set(x,i*12));
   gl.bindVertexArray(PLJ.spr.vao);gl.bindBuffer(gl.ARRAY_BUFFER,PLJ.spr.buf);gl.bufferSubData(gl.ARRAY_BUFFER,0,a);pljSet(gl,s,{uAsp:V.asp});
   gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,sp.length);gl.disable(gl.BLEND);gl.bindVertexArray(null);}}}
 return true;}
// the palette of the trial: the colours of Marc's concept art (magenta, orange, yellow, cyan, blue, violet, green) and a pale lace
export const PLJ_TRIAL_PAL=Object.freeze(['#ff1f9e','#ff7417','#ffc414','#16dcd6','#2f5cff','#8b3dff','#36e05c','#f4eefc']);
export function pljCanvas(){return PLJ.cv;}
export function pljTime(){return PLJ.t;}
