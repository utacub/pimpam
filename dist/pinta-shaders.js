// Pinta el món (EN25), 0.38: the watercolour of the page, as a WebGL2 fragment shader (pinta-gl.js runs it). The zones come as masks
// in RGBA textures (three zones per texture: the hard mask, the blurred mask and the accent mask) and the shader paints every zone as
// a wash that grows from the point where the brush touched: a wet front with an irregular edge (fbm), the pigment gathering at the
// edge of the mask and at the front, the grain of the paper through the pigment, pools, three water blooms, a second wash (the glaze)
// from another point when the first one is half way, and the accent layer (roofs, poppies) when the zone is nearly dry. Pigments
// multiply over the paper (a Beer–Lambert approximation of mixing). Without the decor on a black base the washes are light of their
// own colour. Only the comments are English; the shader is the one chosen in the style tests (style D, 2026-11-02).
export const PT_VS='#version 300 es\nin vec2 a;out vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
export const PT_FS=`#version 300 es
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
