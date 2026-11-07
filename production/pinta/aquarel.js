// Pinta el món · motor d'aquarel·la (proves d'estil). WebGL2: les zones arriben com a màscares (dures, desenfocades i d'accent) en
// textures RGBA (tres zones per textura), i el fragment shader pinta cada zona com una aiguada que creix des d'un punt.
export const AQ_VS='#version 300 es\nin vec2 a;out vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
export const AQ_FS=`#version 300 es
precision highp float;
in vec2 v;out vec4 o;
uniform vec2 uR;uniform float uT;uniform vec4 uMap;   // uMap: escala del full al canvas (sx, sy) i desplaçament (ox, oy) en px del canvas
uniform sampler2D uM0,uM1,uB0,uB1,uA0,uA1;
uniform vec3 uCol[6],uGlz[6],uAcc[6],uFade[6];uniform vec2 uSeed[6];uniform float uProg[6],uRad[6];
uniform float uDens,uEdge,uGran,uBleed,uGrain,uBloom,uGlaze,uWarm,uDecor,uBase;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(17.1,9.7);a*=.5;}return s;}
// gra del paper: dues escales de soroll i fibres allargades
float paper(vec2 px){float g=vn(px*.9)*.55+vn(px*.35)*.3+vn(px*3.1)*.15;float fib=vn(vec2(px.x*.12,px.y*1.9))*.5+vn(vec2(px.x*2.2,px.y*.1))*.5;return mix(.5,g*.72+fib*.28,uGrain);}
void zone(int i,float m,float b,float a,vec2 sh,vec2 px,inout vec3 col,inout float wet,inout float cover){
 float t=uProg[i];if(t<=0.||b<=.001)return;
 float d=distance(sh,uSeed[i]);float nz=fbm(sh*.012+float(i)*3.1)-.5;float nf=fbm(sh*.05+float(i)*1.7)-.5;
 float front=t*(uRad[i]*1.12+60.)-d+nz*120.*(.6+.6*uBleed)+nf*30.;   // el front d'aigua, irregular
 float cov=smoothstep(-26.,10.,front);
 // la vora de la taca: la màscara desenfocada amb un llindar que el soroll mou (vora irregular); amb sagnat, el color surt més
 float bn=b+nf*.4+nz*.15;float mk=smoothstep(.5-.1-.3*uBleed,.56,bn);
 cov*=mk;if(cov<=.002)return;
 // densitat: cos de l'aiguada amb bassals, vora dura (acumulació a la vora), front moll, granulació, gradient de la zona
 float edge=smoothstep(.84,.58,bn)*(.4+1.1*fbm(sh*.08+float(i)));
 float wf=exp(-front*front/900.)*(1.-smoothstep(.85,1.,t));
 float gr=(fbm(sh*.09+float(i)*7.)-.5)*uGran+(paper(px)-.5)*uGran*.9;
 float pool=.66+.62*fbm(sh*.006+float(i)*2.3)+.28*(fbm(sh*.028+float(i)*4.1)-.5);
 float fade=clamp(1.-uFade[i].z*dot(sh-uSeed[i],uFade[i].xy)/max(1.,uRad[i]),.3,1.6);
 float dens=(uDens*pool*fade+edge*uEdge*.75+wf*.5+gr);
 // flors d'aigua: anells clars amb vora fosca, en llocs fixos
 for(int k=0;k<3;k++){vec2 c=uSeed[i]+vec2(h21(vec2(float(i)*5.+float(k),1.7))-.5,h21(vec2(float(k)*3.+2.,float(i)+.3))-.5)*uRad[i]*1.3;float r=28.+40.*h21(vec2(float(i),float(k)));
  float tk=.35+.4*h21(vec2(float(k)+9.,float(i)));float g=smoothstep(tk,tk+.25,t);float dd=distance(sh,c)+nz*34.+nf*22.;float inside=1.-smoothstep(r*.6,r,dd);float rim=smoothstep(r*.78,r,dd)*(1.-smoothstep(r,r*1.22,dd));dens+=g*uBloom*(-.22*inside+.3*rim);}
 dens=max(0.,dens)*cov;
 vec3 K=uCol[i];
 // veladura: segona aiguada des d'un altre punt, més tard
 float t2=clamp((t-.45)*1.8,0.,1.);
 if(uGlaze>0.&&t2>0.){vec2 s2=uSeed[i]+vec2(uRad[i]*.5,-uRad[i]*.25)*(h21(vec2(float(i),3.3))-.5)*2.;float d2=distance(sh,s2);float fr2=t2*(uRad[i]*1.1+60.)-d2+nz*90.;float c2=smoothstep(-30.,10.,fr2)*mk;
  float dn2=(.5*uDens*(.8+.3*fbm(sh*.03+9.))*fade+smoothstep(.9,.62,bn)*uEdge*.35+exp(-fr2*fr2/900.)*.3*(1.-smoothstep(.85,1.,t2)))*c2*uGlaze;
  col*=pow(uGlz[i],vec3(dn2));}
 // accent: la tercera capa, sobre la màscara d'accent, només quan la zona ja és gairebé seca
 float ta=clamp((t-.62)*2.6,0.,1.);if(ta>0.&&a>.002){float da=(.9*uDens+smoothstep(.9,.4,a)*.5)*smoothstep(0.,1.,ta)*a;col*=pow(uAcc[i],vec3(da));}
 col*=pow(K,vec3(dens));
 wet=max(wet,wf*cov);cover+=dens;}
void main(){vec2 px=gl_FragCoord.xy;px.y=uR.y-px.y;vec2 sh=(px-uMap.zw)/uMap.xy;vec2 tc=vec2(v.x,1.-v.y);
 vec4 m0=texture(uM0,tc),m1=texture(uM1,tc),b0=texture(uB0,tc),b1=texture(uB1,tc),a0=texture(uA0,tc),a1=texture(uA1,tc);
 float g=paper(px*.5);
 vec3 pap=mix(vec3(.985,.972,.94),vec3(.93,.90,.84),uWarm)*(.93+.14*g);
 // decorat: atenuat → paper velat cap a la base; sense → la base llisa
 vec3 base=uBase>.5?vec3(.985):vec3(.03,.035,.05);
 if(uDecor>1.5)pap=base;else if(uDecor>.5)pap=mix(pap,base,.35);
 bool dark=uDecor>1.5&&uBase<.5;if(dark)pap=vec3(1.);
 vec3 col=pap;float wet=0.,cover=0.;
 zone(0,m0.r,b0.r,a0.r,sh,px,col,wet,cover);zone(1,m0.g,b0.g,a0.g,sh,px,col,wet,cover);zone(2,m0.b,b0.b,a0.b,sh,px,col,wet,cover);
 zone(3,m1.r,b1.r,a1.r,sh,px,col,wet,cover);zone(4,m1.g,b1.g,a1.g,sh,px,col,wet,cover);zone(5,m1.b,b1.b,a1.b,sh,px,col,wet,cover);
 // sobre base negra sense decorat, les aiguades són llum del seu propi color: el que no és pintat queda negre
 if(dark)col=base+col*smoothstep(0.,.55,cover)*.92;
 // brillantor de l'aigua encara molla
 col+=wet*.06;
 o=vec4(clamp(col,0.,1.),1.);}`;
export function aqProgram(gl){const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
 const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,AQ_VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,AQ_FS));gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
 const U={},names=['uR','uT','uMap','uM0','uM1','uB0','uB1','uA0','uA1','uDens','uEdge','uGran','uBleed','uGrain','uBloom','uGlaze','uWarm','uDecor','uBase'];for(const n of names)U[n]=gl.getUniformLocation(p,n);
 for(let i=0;i<6;i++)for(const n of ['uCol','uGlz','uAcc','uFade','uSeed','uProg','uRad'])U[n+i]=gl.getUniformLocation(p,`${n}[${i}]`);
 return {p,U};}
export function aqTexture(gl,cv){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
// Màscares. Un canvas d'índex: cada zona omple els seus polígons (terra i siluetes) amb el seu número, de darrere cap endavant, i les
// reserves amb zero; d'aquest índex surten les màscares dures (un canal per zona, tres zones per textura), les desenfocades (la vora
// de la taca i l'acumulació) i les d'accent (desenfocades una mica). Tot a la mida del canvas (W×H) amb el mapa full→canvas.
function fillPoly(c,poly){c.beginPath();poly.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
export function aqMasks(zones,W,H,map,blurPx=8){const mk=()=>{const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d',{willReadFrequently:true});return [cv,c];};
 const [icv,ic]=mk();ic.fillStyle='#000';ic.fillRect(0,0,W,H);ic.setTransform(map[0],0,0,map[1],map[2],map[3]);
 zones.forEach((z,i)=>{const v=(i+1)*40;ic.fillStyle=`rgb(${v},${v},${v})`;for(const p of (z.polys||[z.poly]))fillPoly(ic,p);if(z.reserves){ic.fillStyle='#000';for(const r of z.reserves)fillPoly(ic,r);}});
 ic.setTransform(1,0,0,1,0,0);const idx=ic.getImageData(0,0,W,H).data;
 const out={M:[],B:[],A:[]};
 for(let g=0;g<2;g++){const [mcv,mc]=mk();const img=mc.createImageData(W,H),d=img.data;
  for(let p=0;p<W*H;p++){const k=Math.round(idx[p*4]/40);d[p*4]=k===g*3+1?255:0;d[p*4+1]=k===g*3+2?255:0;d[p*4+2]=k===g*3+3?255:0;d[p*4+3]=255;}
  mc.putImageData(img,0,0);
  const [bcv,bc]=mk();bc.fillStyle='#000';bc.fillRect(0,0,W,H);bc.filter=`blur(${blurPx}px)`;bc.drawImage(mcv,0,0);bc.filter='none';
  const [acv,ac]=mk(),[a2,a2c]=mk();ac.fillStyle='#000';ac.fillRect(0,0,W,H);ac.setTransform(map[0],0,0,map[1],map[2],map[3]);ac.globalCompositeOperation='lighter';
  for(let k=0;k<3;k++){const z=zones[g*3+k];if(!z)continue;ac.fillStyle=['#f00','#0f0','#00f'][k];for(const p of (z.accents||[]))fillPoly(ac,p);}
  ac.setTransform(1,0,0,1,0,0);a2c.fillStyle='#000';a2c.fillRect(0,0,W,H);a2c.filter=`blur(${Math.max(1,blurPx*.25)}px)`;a2c.drawImage(acv,0,0);a2c.filter='none';
  out.M.push(mcv);out.B.push(bcv);out.A.push(a2);}
 return out;}
// Radi d'una zona: la distància més gran del punt d'inici a un vèrtex del seu pol·lígon.
export const aqRadius=z=>Math.max(...(z.polys||[z.poly]).flat().map(([x,y])=>Math.hypot(x-z.seed[0],y-z.seed[1])));
export function aqDraw(gl,P,tex,o){gl.viewport(0,0,o.W,o.H);gl.useProgram(P.p);const U=P.U;
 gl.uniform2f(U.uR,o.W,o.H);gl.uniform1f(U.uT,o.t||0);gl.uniform4f(U.uMap,...o.map);
 [['uM0',tex.M[0]],['uM1',tex.M[1]],['uB0',tex.B[0]],['uB1',tex.B[1]],['uA0',tex.A[0]],['uA1',tex.A[1]]].forEach(([n,t],i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);gl.uniform1i(U[n],i);});
 const s=o.style;gl.uniform1f(U.uDens,s.dens);gl.uniform1f(U.uEdge,s.edge);gl.uniform1f(U.uGran,s.gran);gl.uniform1f(U.uBleed,s.bleed);gl.uniform1f(U.uGrain,s.grain);gl.uniform1f(U.uBloom,s.bloom);gl.uniform1f(U.uGlaze,s.glaze);gl.uniform1f(U.uWarm,s.warm);
 gl.uniform1f(U.uDecor,o.decor==='none'?2:o.decor==='dim'?1:0);gl.uniform1f(U.uBase,o.base==='white'?1:0);
 o.zones.forEach((z,i)=>{gl.uniform3f(U['uCol'+i],...z.col);gl.uniform3f(U['uGlz'+i],...(z.glaze||z.col));gl.uniform3f(U['uAcc'+i],...(z.accent||z.col));gl.uniform3f(U['uFade'+i],...(z.fade||[0,0,0]));gl.uniform2f(U['uSeed'+i],...z.seed);gl.uniform1f(U['uProg'+i],o.prog[i]||0);gl.uniform1f(U['uRad'+i],aqRadius(z));});
 gl.drawArrays(gl.TRIANGLES,0,3);}
