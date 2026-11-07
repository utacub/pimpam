// Selva de llum (CE35, 0.29): the backdrop of the jungle column, drawn before the creatures (who see it through their glass bodies).
// World y up. From the top: the dawn sky and a bank of clouds (y 1.5–2.7); the tops of the crowns near y=0, with the far jungle seen
// in perspective down to a horizon at eye level (mist, and the river shining like a ribbon); the canopy (0 to −3, green and gold);
// the understory (−3 to −7, emerald, trunks and rays of light); the floor at dusk (−7 to −10.3, violet); the river at night: its
// surface at y=WATER, seen over and under (the moon, the far bank, reflections), tea-coloured water below, the bed near −15.4.
// Every layer far from the camera moves less than the world (parallax), and is softer. uDecor: 0 full, 1 dim (veiled towards the base
// by 1−uOpacity), 2 none (black; a white base is made by the composite pass).
uniform float uDecor,uOpacity;
out vec4 O;
const float WATER=-10.55;
// The crowns of the canopy: round tops side by side (one emergent tree at x≈1.62, where the macaws sit), seen from the side, their
// edges made of small clumps of leaves; under them the canopy goes on. Returns the height of the top at x; crown: centre and radius.
float crownTop(float x,out vec3 crown){float best=-.20+.03*sin(x*3.1);crown=vec3(x,-.5,.4);float k0=floor(x/.42);
 for(int i=-2;i<=2;i++){float k=k0+float(i);float cx=(k+.5)*.42+(h11(k+3.)-.5)*.16,r=.17+.10*h11(k+7.),cy=-.07+.07*h11(k+11.);
  float dx=x-cx,u=abs(dx)/r;if(u<1.9){float t=u<1.?cy+r*sqrt(1.-u*u):cy-r*.45*(u-1.)*(u+.6);if(t>best){best=t;crown=vec3(cx,cy,r);}}}
 float ex=x-1.62;if(abs(ex)<.31){float t=.16+sqrt(.31*.31-ex*ex);if(t>best){best=t;crown=vec3(1.62,.16,.31);}}
 float u=fract(x/.055+h11(floor(x/.055))*.3)-.5;return best+.016*sqrt(max(0.,1.-4.*u*u))+.008*fbm2(vec2(x*40.,1.));}
// Marine snow becomes pollen and spores: soft motes in a drifting layer.
float motes(vec2 u,float G,float dens,float r,float seed){u.y+=G*.02;u.x+=sin(G*.04+seed)*.3;vec2 id=floor(u),f=fract(u);float a=0.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(i,j);vec2 h=h22(id+o+seed);if(h.x>dens)continue;
  vec2 c=o+.5+.36*sin(h*6.28+G*.2*(h.yx+.3))-f;a+=ss(r,r*.4,length(c))*(.35+.65*h.y);}
 return a;}
// The dawn sky above a horizon at height yH (screen units above it: alt), the sun low on the left.
vec3 dawnSky(vec2 w,float alt,float G,float Z){
 vec3 c=mix(vec3(.95,.45,.20),vec3(.70,.24,.34),ss(0.,.14,alt));c=mix(c,vec3(.24,.10,.32),ss(.10,.45,alt));c=mix(c,vec3(.035,.04,.16),ss(.4,1.1,alt));
 float sx=w.x-uCam.x*.97+.42,sy=alt-.075;float sd=length(vec2(sx,sy)/Z*vec2(1.,1.15));
 c+=vec3(1.,.72,.42)*exp(-sd/.22)*.35+vec3(1.,.85,.6)*exp(-sd/.05)*.5;c=mix(c,vec3(1.3,1.1,.85),ss(.032,.024,sd));
 float ci=fbm(vec2((w.x-uCam.x*.9)*.8+G*.004,alt*9.+1.7)),band=ss(.04,.12,alt)*ss(.55,.25,alt);
 c=mix(c,mix(vec3(.95,.55,.50),vec3(1.1,.80,.55),exp(-sd/.35)),ss(.52,.75,ci)*band*.75);
 return c;}
// The far jungle below the horizon, as a plane in perspective: crowns as lumps (some in flower) that grow smaller towards the horizon,
// banks of mist at four distances whose tops rise and fall slowly, and the river winding through, mirroring the sky. High above, a sea
// of clouds instead.
vec3 farJungle(vec2 w,float s,float G,float Z){
 float zd=.33/max(s,.004),X=(w.x-uCam.x)/Z*zd+uCam.x*.6,fog=1.-exp(-zd*.20),det=exp(-zd*.07);
 vec3 n,n2;vec2 g=vec2(X,zd)*7.,cid,c2;float hg=domes(g,0.,n,cid);float fl=h21(cid+40.);float h2=domes(g*3.1,5.,n2,c2);n=normalize(n+n2*.6*det);
 float lam=sat(dot(n,normalize(vec3(-.8,.35,.5)))),ao=ss(-.05,.35,hg)*mix(1.,ss(-.1,.3,h2),.5*det),tex=.8+.4*vn(g*7.)*det;
 vec3 lit=fl<.04?vec3(.70,.22,.42):fl<.08?vec3(.85,.55,.08):mix(vec3(.16,.24,.05),vec3(.26,.22,.04),h21(cid+3.));
 vec3 c=mix(vec3(.002,.012,.018),lit*.8,pow(lam,1.5)*tex)*(.2+.8*ao);c+=vec3(.9,.38,.10)*pow(lam,7.)*ao*.35*det;
 c=mix(vec3(.05,.06,.045),c,det);
 float rx=.42*sin(zd*.7+.8)+.22*sin(zd*1.7+2.)+.08*sin(zd*3.9)+uCam.x*.6,hw=.032+.008*sin(zd*.9),dr=abs(X-rx);
 float riv=ss(hw,hw*.55,dr),glint=pow(vn(vec2(X*40.,zd*9.-G*.5)),6.)*det;
 vec3 rc=mix(vec3(.55,.30,.16),vec3(.70,.36,.30),ss(.0,.3,s))*(.55+.45*ss(hw,0.,dr))+vec3(1.,.75,.45)*glint*1.2;
 c*=1.-.6*ss(hw*2.6,hw,dr)*(1.-riv);c=mix(c,rc,riv);
 // mist lying on the river
 c=mix(c,vec3(.75,.55,.62)*.7,exp(-dr/(hw*3.))*.35*(.5+.5*fbm2(vec2(X*4.+G*.02,zd*2.))));
 // banks of mist: each sits at its distance and covers the farther jungle above its foot
 for(int k=0;k<3;k++){float zk=2.4*pow(1.75,float(k)),sb=.33/zk;if(s>sb)continue;float Xk=(w.x-uCam.x)/Z*zk+uCam.x*.6,v=(sb-s)*zk;
  float top=.10+.10*fbm2(vec2(Xk*1.3+G*.01+float(k)*7.,G*.015))+.05*sin(G*.07+float(k)*2.)+.08*exp(-abs(Xk-rx)/.25);
  float m=ss(top,top*.35,v)*ss(0.,.012,v)*(.55+.45*fbm2(vec2(Xk*3.,v*8.-G*.04)));
  c=mix(c,mix(vec3(.55,.45,.62),vec3(.9,.66,.58),ss(2.,10.,zk))*.6,m*.5);}
 c=mix(c,mix(vec3(.30,.26,.42),vec3(.85,.45,.30),ss(.6,.9,fog))*.7,fog*.92);
 // the sea of clouds seen from above them
 float hi=ss(1.2,2.3,uCam.y);if(hi>0.){vec2 cg=vec2(X*1.3+G*.004,zd*.7);float cl=fbm(cg),cl2=fbm(cg+vec2(-.06,.03));float li=sat(.5+(cl-cl2)*7.);
  vec3 cc=mix(vec3(.24,.14,.34),vec3(1.,.64,.48),pow(li,1.3))*(.65+.45*ss(.3,.7,cl));cc=mix(cc,vec3(.85,.48,.36)*.7,fog);c=mix(c,cc,hi);}
 return c;}
// The bank of clouds the dive passes through before the first scene: lit pink and gold from above, lilac below.
float cloudDen(vec2 w,float G){float b=ss(1.45,1.8,w.y)*ss(2.75,2.35,w.y);if(b<=0.)return 0.;
 float n=fbm(vec2(w.x*1.5+G*.012,w.y*2.6))*.75+.25*vn(w*vec2(6.,9.)+G*.03);return ss(.38,.62,n*b+.32*b);}
vec3 clouds(vec3 c,vec2 w,float G){float d=cloudDen(w,G);if(d<=0.)return c;float up=cloudDen(w+vec2(-.03,.05),G);
 vec3 lit=mix(vec3(.40,.30,.52),vec3(1.0,.70,.58),ss(1.7,2.5,w.y))*.8;lit+=vec3(.9,.6,.3)*sat(d-up)*.9;
 return mix(c,lit,d*.96);}
// A plane of plants: in each cell of a grid, a twig with two to four leaves hanging from it (narrow, broad or heart-shaped), each at
// its own angle and size. Returns the coverage; v: the position across the top leaf (for the midrib and the light through it). px: the
// size of a pixel in u.
float plants(vec2 u,float seed,float big,float px,out float v){float a=0.;v=0.;vec2 id=floor(u);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cid=id+vec2(i,j),h=h22(cid+seed);if(h.x>.75)continue;
  vec2 base=cid+.5+.6*(h-.5);float a0=-1.57+(h.y-.5)*2.6,nl=2.+floor(h21(cid+seed+5.)*3.),ty=h21(cid+seed+9.),wd=ty<.4?.11:ty<.75?.22:.30;
  vec2 dir=vec2(cos(a0+1.57),sin(a0+1.57));
  for(int k=0;k<4;k++){float fk=float(k);if(fk>=nl)break;float hk=h21(cid+seed+fk*3.1),len=big*(.45+.45*hk)*(1.-.12*fk),ang=a0+(fk-(nl-1.)*.5)*.75+.4*(hk-.5);
   vec2 l=rot(ang)*(u-base-dir*fk*.07*big)/len;if(l.x<-.05||l.x>1.05||abs(l.y)>.36)continue;float vv,d=leafD(l,wd*(.85+.3*hk),vv);
   if(ty>.75)d=min(d,(length((l-vec2(.1,0.))*vec2(1.,1.4))-.17)*.7);d*=len;float c=ss(px,-px,d);
   if(c>0.){v=mix(v,clamp(vv,-1.,1.),c);a=c+a*(1.-c);}}}
 return a;}
// Inside the forest: colour by depth below the tops (d); a far plane of leaves, soft and pale; trunks in two planes; a middle plane of
// big leaves, dark against the light, glowing gold-green where a ray of light goes through them; rays from the upper right with motes;
// at dusk, violet and dark.
vec3 forest(vec2 w,vec2 p,float d,float G,float Z){
 vec3 c=d<2.5?mix(vec3(.10,.13,.03),vec3(.020,.06,.035),ss(0.,2.5,d)):d<8.?mix(vec3(.020,.06,.035),vec3(.006,.030,.026),ss(2.5,7.,d)):mix(vec3(.006,.030,.026),vec3(.005,.003,.013),ss(8.,9.8,d));
 float day=ss(9.6,7.6,d),can=ss(4.5,1.5,d);
 vec3 haze=mix(mix(vec3(.30,.34,.08),vec3(.05,.17,.12),ss(1.,5.,d)),vec3(.008,.007,.026),ss(7.8,9.6,d));
 float u=w.x+w.y*.42;float rays=pow(fbm2(vec2(u*2.4,G*.03)),3.)*2.2*ss(-.3,.6,d)*ss(8.8,4.5,d);
 vec3 rcol=mix(vec3(.9,.70,.28),vec3(.35,.75,.55),ss(1.,5.,d));
 // far plane of leaves
 vec2 l1=p*pow(Z,.5)+uCam.xy*.4;float v1,a1=plants(l1*2.6,3.,.9,.012*pow(Z,.5)*2.6,v1);
 c=mix(c,haze*(.55+.25*(1.-abs(v1))),a1*.6*(.4+.6*can+.3*day));
 // trunks in two planes (below the crowns)
 float tr=ss(.5,1.6,d);
 for(int k=0;k<2;k++){float par=k==0?.55:.8,sz=k==0?.5:.8;vec2 l=(p*pow(Z,.7)+uCam.xy*par)/sz;float cx=floor(l.x+.5);float h=h11(cx+float(k)*17.);
  if(h<.5){float x=l.x-cx-(h-.25)*.7+.035*sin(l.y*1.1+h*9.),wt=.016+.022*h+.004*sin(l.y*3.);float a=ss(wt,wt*.55,abs(x))*tr;
   vec3 tc=mix(mix(vec3(.02,.04,.028),vec3(.004,.010,.010),float(k))*mix(1.,.5,ss(4.,9.6,d)),vec3(.004,.003,.008)*(1.-.5*float(k)),ss(7.8,9.6,d));tc+=haze*ss(-wt,wt,x)*.25*day;c=mix(c,tc,a*(.5+.45*float(k))*(1.+.4*ss(7.8,9.6,d)));}}
 // rays and motes behind the middle plane
 c+=rcol*rays*.12;c+=rcol*(.3+rays)*motes((p*pow(Z,.6)+uCam.xy*.8)*7.,G,.35,.08,5.)*.09*ss(-.2,.5,d)*day;
 // middle plane: big leaves, dark against the light, glowing where the light goes through them
 vec2 l2=p*pow(Z,.8)+uCam.xy*.75;float v2,a2=plants(l2*1.5,11.,1.,.004*pow(Z,.8)*1.5,v2);
 float through=sat(.25*can+rays*.9)*day;float vein=exp(-abs(v2)*9.)*.6;
 vec3 lc=mix(vec3(.003,.012,.008),mix(vec3(.40,.55,.06),vec3(.08,.42,.30),ss(1.,5.,d))*(.6+.4*(1.-abs(v2))),through)*(1.-vein*through);
 lc+=vec3(.012,.008,.03)*ss(7.8,9.6,d)*(1.-abs(v2));
 c=mix(c,lc,a2*.92*ss(-.2,.6,d));
 // dusk: a violet glow low in the floor
 float dusk=ss(7.8,9.8,d);c+=vec3(.012,.005,.022)*dusk*(.5+.5*fbm2(l1*2.));
 return c;}
// Night over the river: the sky in the gap of the canopy, stars, the moon, the far bank; under eye level the water mirrors them.
const vec2 MOON=vec2(3.35,WATER+.66);
vec3 nightAir(vec2 w,float G,float Z){
 vec3 c=mix(vec3(.008,.012,.036),vec3(.0025,.004,.015),ss(WATER+.2,WATER+1.4,w.y));
 vec2 st=floor(w*90.);float sh=h21(st);c+=vec3(.7,.75,1.)*step(.985,sh)*ss(.5,.1,length(fract(w*90.)-.5))*(.5+.5*sin(G*(.5+sh)+sh*30.))*.5;
 float md=length(w-MOON);c+=vec3(.55,.62,.75)*exp(-md/.25)*.25+vec3(.9,.92,1.)*ss(.052,.046,md);
 return c;}
vec3 riverAir(vec2 w,float G,float Z){
 float eye=max(uCam.y,WATER+.02),bank=eye+.015*Z+.03*fbm2(vec2(w.x*3.,.5));
 vec3 cr;float tree=.04+.10*fbm2(vec2(w.x*1.3,3.))+.30*max(0.,crownTop(w.x*(2.+.6*sin(w.x*.7))+40.,cr)+.12)+.35*max(0.,crownTop(w.x*1.1+13.,cr)-.05)*ss(.45,.62,fbm2(vec2(w.x*.8,9.)));
 if(w.y>bank){vec3 c=nightAir(w,G,Z);float top=bank+tree;c=mix(c,vec3(.003,.006,.010)+vec3(.02,.025,.04)*ss(top-.03,top,w.y),ss(top,top-.004*Z,w.y));
  float hang=WATER+1.25+.25*fbm2(vec2(w.x*1.6,7.));c=mix(c,vec3(.002,.004,.006),ss(hang-.02,hang+.03,w.y));
  return c;}
 // the water seen from above, in perspective, between the near line and the far bank: the bank mirrored (dark), the sky, the path of
 // the moon broken into ripples that grow finer with the distance
 float s=sat((eye-w.y)/max(.02,eye-WATER)),zd=1./max(s,.03);
 vec3 c=mix(vec3(.010,.015,.035),vec3(.003,.005,.012),ss(.6,.0,s));c*=1.-.7*ss(.25,.0,s);
 float rip=.5+.5*sin(zd*22.-G*1.1+1.5*sin(w.x*5.+G*.3));float mx=w.x-MOON.x-.004*zd*sin(zd*5.-G*1.3);
 c+=vec3(.75,.80,.95)*exp(-abs(mx)/(.015+.03*s))*pow(rip,4.)*ss(.0,.12,s)*.9;
 c+=vec3(.20,.25,.40)*pow(vn(vec2(w.x*18.*s+3.,zd*3.-G*.5)),10.)*.4*ss(.1,.5,s);
 return c;}
// Under the water of the river: tea-coloured, dark, lit by the moon from above; the surface seen from below; motes; the bed.
float bedY(float x){return mix(-10.25,-15.4,ss(.3,3.2,x))+.06*sin(x*2.1+.4)+.03*sin(x*5.3);}
vec3 riverWater(vec2 w,vec2 p,float G,float Z){
 float dw=WATER-w.y;vec3 c=mix(vec3(.0065,.0036,.0014),vec3(.0036,.0021,.0009),ss(0.,2.5,dw));c=mix(c,vec3(.0020,.0012,.0005),ss(2.5,5.,dw));
 float u=(w.x-MOON.x)+(w.y-WATER)*.25;float rays=pow(fbm2(vec2(u*3.,G*.04)),4.)*1.6*exp(-dw/2.6);
 c+=vec3(.26,.24,.17)*rays*.035+vec3(.30,.30,.24)*.5*exp(-length((w-vec2(MOON.x+.2*(WATER-w.y),w.y))*vec2(1.6,.35))/.7)*.05*exp(-dw/2.);
 c+=vec3(.5,.45,.3)*min(caustic(w*vec2(1.,2.6)+vec2(0,G*.02),G*.25),1.5)*exp(-dw/.2)*.03;
 c+=vec3(.55,.45,.25)*motes((p*pow(Z,.6)+uCam.xy*.8)*9.,G*.6,.28,.07,9.)*.025*(1.-ss(3.,5.,dw));
 // the flooded forest (right of the bank): trunks in two planes rise from the bed through the surface, dark against the moonlit water,
 // a thin edge of moonlight on their left
 float fl=ss(2.9,3.7,w.x);
 if(fl>0.){for(int k=0;k<2;k++){float fk=float(k),par=k==0?.45:.75,sz=k==0?.55:.95;vec2 l=(p*pow(Z,.7)+uCam.xy*par)/sz;float cx=floor(l.x+.5),h=h11(cx+fk*23.+5.);
   if(h<.6){float x=l.x-cx-(h-.3)*.6+.03*sin(l.y*1.3+h*7.),wt=.022+.035*h+.006*sin(l.y*2.+h*9.);float a=ss(wt,wt*.6,abs(x));
    vec3 tc=vec3(.0012,.0009,.0005)*(1.+fk)+vec3(.05,.045,.035)*exp(-abs(x+wt)/.004)*exp(-dw/2.5)*.12;c=mix(c,tc,a*fl*(.5+.45*fk));}}}
 // the surface seen from below: the ripples catch the moonlight, brightest right under the moon
 float sb=exp(-dw/.07),rp=pow(vn(vec2(w.x*14.+G*.3,G*.4)),3.);c*=1.-.3*exp(-dw/.03);
 c+=vec3(.45,.45,.40)*sb*(.15+.85*rp)*.03+vec3(.8,.8,.7)*sb*exp(-abs(w.x-MOON.x-.1*sin(G*.3))/.3)*.06*(.4+rp);
 float by=bedY(w.x);vec3 bed=mix(vec3(.008,.005,.003),vec3(.02,.014,.007),fbm(w*vec2(6.,22.)))*(.6+.4*min(caustic(w*1.3,G*.2),1.5));
 c=mix(c,bed*.6,ss(by+.004*Z,by-.004*Z,w.y));
 return c;}
// The forest floor at dusk, seen from a little above it as a plane in perspective down to a horizon below eye level: dark earth and
// moss, fallen leaves lit lilac by the last light, fading into a violet mist; far away, a few points of green light (glowing fungi).
vec3 floorPlane(vec2 w,float s,float G,float Z){
 float zd=.16/max(s,.003),X=(w.x-uCam.x)/Z*zd+uCam.x*.9,fog=1.-exp(-zd*.45),det=exp(-zd*.22);vec2 g=vec2(X,zd);
 vec3 c=mix(vec3(.010,.006,.012),vec3(.014,.020,.010),ss(.45,.75,fbm(g*vec2(3.,5.))));
 for(int k=0;k<2;k++){float fk=float(k);vec2 u=g*vec2(5.,8.)*(1.+.8*fk)+fk*3.7;vec2 id=floor(u),f=fract(u)-.5;vec2 h=h22(id+fk*9.);if(h.y<.12)continue;
  vec2 l=rot(h.x*6.28)*(f-.42*(h22(id+fk*9.+4.)-.5))/(.30+.30*h.y);float v,dl=leafD(l+vec2(.5,0.),.22+.12*h.x,v);float a=ss(.025,-.025,dl)*det*step(.35,h21(id+fk*5.+2.));
  vec3 lc=mix(vec3(.014,.007,.008),vec3(.026,.015,.010),h.y)*(1.-.45*exp(-abs(v)*7.));lc+=vec3(.016,.012,.032)*ss(-.6,.8,v)*(.4+.6*fk);c=mix(c,lc,a);}
 // twigs
 float tw=abs(fract(X*1.7+.4*fbm2(g*vec2(.8,1.6)))-.5);c=mix(c,vec3(.006,.004,.006),ss(.012,.006,tw)*step(.62,vn(g*vec2(1.3,.9)))*det);
 // far glowing fungi
 vec2 u=g*vec2(1.6,1.1);vec2 id=floor(u),f=fract(u)-.5-.35*(h22(id+21.)-.5);float hh=h21(id+31.);
 c+=vec3(.35,1.,.45)*exp(-length(f*vec2(1.,2.2))*zd/.06)*step(hh,.22)*.06*ss(1.5,3.,zd)*(.6+.4*sin(G*.4+hh*20.));
 c=mix(c,mix(vec3(.010,.007,.022),vec3(.022,.013,.034),exp(-s*18.)),fog*.95);
 return c;}
// The bed of the river seen from just above it, in perspective: sand in ripples, dead leaves and pebbles, the net of moonlight moving
// on it, fading into the dark water (c0).
vec3 bedPlane(vec2 w,float s,float G,float Z,vec3 c0){
 float zd=.13/max(s,.003),X=(w.x-uCam.x)/Z*zd+uCam.x*.9,fog=1.-exp(-zd*.7),det=exp(-zd*.3);vec2 g=vec2(X,zd);
 float rip=.5+.5*sin(g.y*24.+fbm2(g*2.)*5.+g.x*3.);
 vec3 c=mix(vec3(.022,.015,.008),vec3(.044,.031,.017),fbm(g*vec2(4.,7.)))*(.75+.25*rip*det);
 c+=vec3(.20,.17,.11)*min(caustic(g*vec2(1.3,2.),G*.22),1.4)*.09*det;
 vec2 u=g*vec2(5.,8.);vec2 id=floor(u),f=fract(u)-.5;vec2 h=h22(id+3.);
 if(h.x<.22){vec2 l=rot(h.y*6.28)*(f-.2*(h-.5))/.35;float v,dl=leafD(l+vec2(.5,0.),.3,v);c=mix(c,vec3(.016,.008,.004)*(1.-.4*exp(-abs(v)*6.)),ss(.03,-.03,dl)*det*.9);}
 else if(h.x<.30){vec2 e=(f-.25*(h.yx-.5))*vec2(1.,1.5);float dp=length(e)-.10;c=mix(c,vec3(.022,.020,.018)*(1.+.7*ss(.0,.1,e.y)),ss(.02,-.02,dp)*det);}
 return mix(c,c0,fog);}
vec3 jungle(vec2 p,float G){
 float Z=uCam.z;vec2 w=uCam.xy+p*Z;
 vec3 crown;float top=crownTop(w.x,crown),d=top-w.y;
 vec3 c;
 if(d<0.){float yH=uCam.y+.12*Z,s=(yH-w.y)/Z;c=s<0.?dawnSky(w,-s,G,Z):farJungle(w,s,G,Z);c=mix(c,dawnSky(w,0.,G,Z),ss(.006,0.,abs(s))*.5);c=clouds(c,w,G);}
 else{c=forest(w,p,d,G,Z);
  // the crowns: round masses of leaves, lit gold from the low sun on the left, dark towards the inside
  if(d<.6){vec3 n,n2;vec2 i1,i2;float hg=domes(w*vec2(13.,14.),7.,n,i1),h2=domes(w*vec2(37.,40.),8.,n2,i2);n=normalize(n+n2*.7);hg=min(hg,hg*.5+h2*.6);vec2 cn=(w-crown.xy)/crown.z;float side=sat(dot(cn,normalize(vec2(-.75,.66)))*.5+.5);
   float lam=sat(dot(n,normalize(vec3(-.7,.5,.5))))*(.3+.7*side),ao=ss(-.05,.4,hg),tex=.7+.6*vn(w*vec2(130.,140.));
   vec3 cc=mix(vec3(.004,.022,.022),vec3(.28,.32,.06),pow(lam,1.3)*tex)*(.2+.8*ao);
   cc+=vec3(1.,.5,.14)*pow(lam,5.)*side*ao*.5;cc+=vec3(1.,.55,.2)*exp(-d/.005)*side*.6;
   c=mix(cc,c,ss(.25,.6,d));}
  c*=mix(.35,1.,ss(.3,1.6,d));}
 // the forest floor at dusk, left of the river: a plane in perspective below eye level
 float rz=ss(-2.2,-1.4,w.x);float fz=ss(-8.6,-9.3,uCam.y)*(1.-rz);
 if(fz>0.){float yH=uCam.y-.08*Z,s=(yH-w.y)/Z;if(s>0.)c=mix(c,floorPlane(w,s,G,Z),fz*ss(0.,.004,s));}
 // the river column: the floor at dusk becomes the bank; over the water, night; under it, the water
 float by=bedY(w.x);
 if(w.y<WATER+1.6){vec3 r=w.y>WATER?riverAir(w,G,Z):riverWater(w,p,G,Z);float k=w.y>WATER?rz*ss(WATER+1.6,WATER+1.1,w.y):ss(WATER+.0,WATER-.02,by);c=mix(c,r,k);
  // near the bed: the bed as a plane in perspective
  float bz=ss(-13.6,-14.4,uCam.y);if(bz>0.&&w.y<WATER){float yH=uCam.y-.02*Z,s=(yH-w.y)/Z;if(s>0.)c=mix(c,bedPlane(w,s,G,Z,r),bz*ss(0.,.004,s));}}
 float gm=0.;
 if(w.y<-9.6&&w.x<1.6&&w.x>-2.4){float gy=-10.25-.45*ss(.3,1.5,w.x)+.04*sin(w.x*7.)+.02*fbm2(vec2(w.x*20.,.2));vec3 gc=mix(vec3(.006,.005,.010),vec3(.016,.012,.016),fbm(w*vec2(9.,30.)));float gr=abs(fract(w.x*90.+.5*fbm2(w*vec2(30.,4.)))-.5);
  float blade=ss(.18,.0,gr)*ss(gy-.035-.02*vn(vec2(w.x*60.,1.)),gy-.002,w.y);gc=mix(gc,vec3(.004,.008,.006),blade*.7);gy+=.03*vn(vec2(w.x*70.,3.))*ss(.3,.6,vn(vec2(w.x*9.,5.)));
  gc+=vec3(.25,.25,.35)*exp(-abs(w.y-gy)/.004)*.12;gm=ss(gy+.004*Z,gy-.004*Z,w.y)*ss(WATER-.25,WATER+.02,gy)*ss(-2.4,-1.6,w.x);c=mix(c,gc,gm);}
 // the surface line of the river, bright under the moon
 c+=vec3(.6,.62,.75)*exp(-abs(w.y-WATER)/(.0025*Z))*.5*rz*(1.-gm);
 return c;}
void main(){vec2 p=pScreen();vec3 c=uDecor>1.5?vec3(0.):jungle(p,uG);if(uDecor>.5&&uDecor<1.5)c*=uOpacity;O=vec4(c,1.);}
