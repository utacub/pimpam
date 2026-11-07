// The sea: colour by depth, the surface seen from below, sun rays, caustics, three planes of marine snow, sparks of light in the
// deep and the floor. uDecor: 0 full, 1 dim (the sea veiled towards the base colour by 1-uOpacity), 2 none (only the base colour:
// black here; a white base is made by the composite pass, which turns the lightness over).
uniform float uDecor,uOpacity;
out vec4 O;
float floorY(float x){return -22.95+.07*sin(x*1.9+.4)+.035*sin(x*4.7+1.)+.012*sin(x*11.3);}
vec3 waterCol(float d){
 vec3 c0=vec3(.006,.085,.16),c1=vec3(.005,.058,.13),c2=vec3(.003,.028,.078),c3=vec3(.0016,.011,.036),c4=vec3(.0009,.0042,.015),c5=vec3(.0006,.0018,.0065);
 return d<3.?mix(c0,c1,d/3.):d<7.?mix(c1,c2,(d-3.)/4.):d<11.?mix(c2,c3,(d-7.)/4.):d<16.?mix(c3,c4,(d-11.)/5.):mix(c4,c5,sat((d-16.)/7.));}
float snowLayer(vec2 u,float G,float dens,float r,float seed){
 u.y+=G*.035;u.x+=sin(G*.05+seed)*.3;vec2 id=floor(u),f=fract(u);float a=0.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(i,j);vec2 h=h22(id+o+seed);if(h.x>dens)continue;
  vec2 c=o+.5+.36*sin(h*6.28+G*.2*(h.yx+.3))-f;float d=length(c);a+=ss(r,r*.45,d)*(.35+.65*h.y);}
 return a;}
float sparks(vec2 u,float G,float seed){vec2 id=floor(u),f=fract(u);vec2 h=h22(id+seed);if(h.x>.22)return 0.;
 vec2 c=.5+.3*sin(h*6.28+G*.15)-f;float d=length(c);float pulse=pow(.5+.5*sin(G*(.35+.5*h.y)+h.x*40.),10.);return exp(-d/.035)*pulse;}
vec3 sea(vec2 p,float G){
 float Z=uCam.z;vec2 w=uCam.xy+p*Z;float d=max(0.,-w.y);
 vec3 c=waterCol(d);
 // gentle variety of colour across the sea: teal and violet regions
 float v=fbm2(w*.22+vec2(3.1,7.7)+G*.004);c*=1.+.35*(v-.5);c+=mix(vec3(0.,.012,.01),vec3(.012,.0,.02),v)*exp(-d/7.)*.8+vec3(.006,0.,.011)*ss(9.,18.,d)*v;
 // light from above: rays in the world, fading with depth
 float u=w.x+w.y*.38;float rays=pow(fbm2(vec2(u*3.2,G*.045)),3.)*2.4;c+=vec3(.10,.28,.30)*rays*exp(-d/4.5)*.4;
 // the surface seen from below: the bright window of the sky, rippled, with caustics underneath
 float sy=.035*sin(w.x*7.+G*1.1)+.02*sin(w.x*13.-G*1.7)+.01*fbm2(vec2(w.x*9.,G*.5));
 float above=ss(sy-.003*Z,sy+.003*Z,w.y);
 // above the water, seen half in and half out of it: the far sea up to the horizon, then the open sky (azure overhead, a pale haze
 // at the horizon, white clouds drifting, the sun), so that the line between air and water is clear in colour and in light
 float hz=.05+.006*sin(w.x*1.7+.5),alt=w.y-hz;
 vec3 sky=mix(vec3(.24,.40,.62),vec3(.035,.13,.48),ss(0.,.22,alt));
 float cl=fbm(vec2(w.x*1.4+G*.010,alt*4.2+3.));sky=mix(sky,vec3(.85,.88,.94),ss(.5,.78,cl)*ss(.0,.05,alt)*.85);
 float sd=length((w-vec2(.62,hz+.17))*vec2(1.,1.3));sky+=vec3(1.,.9,.7)*(ss(.035,.025,sd)*.9+exp(-sd/.25)*.3);
 vec3 far=mix(vec3(.006,.05,.13),vec3(.012,.08,.18),ss(sy,hz,w.y))*(.85+.3*fbm2(vec2(w.x*18.,G*.3)));
 far+=vec3(.9,.95,1.)*pow(vn(vec2(w.x*60.,G*1.3+w.y*200.)),12.)*.6;
 sky=mix(far,sky,ss(hz-.002*Z,hz+.002*Z,w.y));
 c+=vec3(.3,.6,.6)*caustic(w*vec2(.8,2.2)+vec2(0,G*.02),G*.3)*exp(-d/.7)*.3;
 // just under the surface a darker band (the surface mirrors the water below it); after the sky, the bright line of the surface
 c*=1.-.35*exp(-max(0.,sy-w.y)/.025)*(1.-above);
 c=mix(c,sky,above);
 c+=vec3(.75,.95,1.)*exp(-abs(w.y-sy)/(.0025*Z))*.7+vec3(.3,.6,.65)*exp(-abs(w.y-sy)/.02)*.15*(1.-above);
 // marine snow in three planes (the near ones out of focus), drifting with the water; lit from above near the surface
 vec3 sn=mix(vec3(.15,.22,.3),vec3(.35,.5,.52),exp(-d/5.))*(1.-above);
 c+=sn*snowLayer((p*pow(Z,.35)+uCam.xy*.55)*13.,G,.42,.07,1.)*.10;
 c+=sn*snowLayer((p*pow(Z,.65)+uCam.xy*.9)*6.5,G*1.2,.40,.07,7.)*.13;
 c+=sn*snowLayer((p*pow(Z,.9)+uCam.xy*1.5)*2.6,G*1.5,.26,.12,13.)*.07;
 // sparks of living light in the deep (slow pulses, never flashes)
 float deep=ss(7.,13.,d);c+=mix(vec3(.2,.7,1.),vec3(.3,1.,.7),h21(floor((p*pow(Z,.6)+uCam.xy*.8)*9.)))*sparks((p*pow(Z,.6)+uCam.xy*.8)*9.,G,3.)*deep*.9;
 // the floor of the abyss
 float fy=floorY(w.x);float g=fbm(w*vec2(7.,20.));vec3 floorc=mix(vec3(.010,.008,.018),vec3(.030,.024,.040),g)*(.6+.4*ss(fy-.3,fy,w.y));
 floorc+=vec3(.05,.03,.08)*exp(-abs(w.y-fy)/.03)*.5;c+=vec3(.02,.012,.035)*exp(-max(0.,w.y-fy)/.5)*ss(18.,22.,d);
 c=mix(c,floorc,ss(fy+.004*Z,fy-.004*Z,w.y));
 return c;}
void main(){vec2 p=pScreen();vec3 c=uDecor>1.5?vec3(0.):sea(p,uG);if(uDecor>.5&&uDecor<1.5)c*=uOpacity;O=vec4(c,1.);}
