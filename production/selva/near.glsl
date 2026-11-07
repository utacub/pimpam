// Selva de llum (CE35, 0.29): the plane nearest to the camera, drawn small and blurred (out of focus) over the scene: wisps of cloud
// while the dive crosses the bank, big leaves and lianas in the canopy and the understory, specks and bubbles in the river. It moves
// faster than the world (parallax 1.8), so it tells the depth during the travellings. It stays at the edges of the screen and fades
// in the middle, so it never covers the whole picture at once. Premultiplied colour and coverage.
uniform float uDecor,uOpacity;
out vec4 O;
const float WATER=-10.55;
vec4 N=vec4(0.);
void over(vec3 col,float a){N.rgb=col*a+N.rgb*(1.-a);N.a=a+N.a*(1.-a);}
void leafAt(vec2 n,vec2 base,float ang,float len,float wd,float lit,float seed){vec2 l=rot(ang)*(n-base)/len;if(l.x<-.1||l.x>1.1||abs(l.y)>wd*1.3)return;
 float v,d=leafD(l,wd,v);float a=ss(.012,-.012,d*len);if(a<=0.)return;
 float vein=exp(-abs(l.y)/(.012/len*4.))+.6*exp(-abs(fract(l.x*7.-abs(v)*1.6)-.5)*12.)*ss(.05,.3,abs(v));
 vec3 col=mix(vec3(.003,.008,.004),mix(vec3(.025,.05,.01),vec3(.08,.12,.02),ss(-1.,1.,-v)),lit*.6)*(1.-.35*vein*lit);
 over(col,a*.8);}
void main(){vec2 p=pScreen();float Z=uCam.z,asp=.5*uR.x/uR.y;if(uDecor>1.5){O=vec4(0.);return;}
 vec2 n=uCam.xy*1.8+p*Z*.9;float y=uCam.y,G=uG;
 // wisps of the bank of clouds rushing past
 float cb=ss(1.25,1.6,y)*ss(2.95,2.55,y);if(cb>0.){float d=fbm(n*vec2(1.1,2.2)+vec2(G*.03,0.));over(mix(vec3(.55,.42,.6),vec3(1.,.78,.66),ss(.3,.8,d))*.8,ss(.45,.75,d)*cb*.8);}
 // leaves near the camera, in the canopy and the understory (and at the crown of the emergent tree)
 float lz=ss(.6,.2,y)*ss(-9.,-7.5,y);
 if(lz>0.){vec2 cell=floor(n/vec2(1.3,1.1));for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 id=cell+vec2(i,j);float h=h21(id+4.);if(h>.5)continue;
   vec2 base=(id+vec2(h21(id+9.),h21(id+13.)))*vec2(1.3,1.1);float sw=.04*sin(G*.6+h*20.)+.02*sin(G*1.3+h*7.);
   float a0=h*12.56,lit=ss(-8.,-1.,y)*.8+.2;
   for(int k=0;k<3;k++){float fk=float(k);leafAt(n,base,a0+fk*.9-.9+sw,.55+.25*h21(id+fk),.22+.06*fk,lit,fk);}}}
 // a liana hanging in the understory
 if(lz>0.&&y<-2.){float lx=floor(n.x/1.7+.5)*1.7+.5*sin(n.y*.6);float hh=h11(floor(n.x/1.7+.5)+31.);if(hh<.45){float dd=abs(n.x-lx-.2*sin(n.y*.9+G*.3));over(vec3(.02,.035,.015),ss(.03,.015,dd)*.9);}}
 // in the river: big out-of-focus specks and a bubble now and then
 if(y<WATER+.1){vec2 u=n*2.2+vec2(0.,G*.04);vec2 id=floor(u),f=fract(u)-.5;float h=h21(id+21.);if(h<.3){float dd=length(f-.25*sin(vec2(G*.2+h*9.,G*.17+h*5.)));over(vec3(.35,.28,.16)*.25,ss(.12,.06,dd)*.35);}}
 // only at the edges: fades in the middle of the picture
 float e=max(abs(p.y)*2.,abs(p.x)/asp);N*=mix(.0,1.,ss(.55,.98,e))*(uDecor>.5?uOpacity:1.);
 O=N;}
