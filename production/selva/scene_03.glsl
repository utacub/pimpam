// 4 · Colibrís a les heliconies. In the golden green light under the tops, the big paddle leaves of the heliconias, lit from behind,
// and their flowers: a hanging chain of red bracts with yellow lips, and an upright one. A hummingbird with a crimson body hovers by the
// hanging flowers; it turns towards us and its throat lights up green and gold (the key moment, tau ≈ 2.6–3.6 s; the colour of these
// feathers changes with the angle: Greenewalt et al., 1960), then it drinks from the flowers (≈ 4.5–6.6 s). A second hummingbird,
// green with a violet throat, darts in (≈ 7.2 s); they hover face to face and the first one flies off. Motes of pollen in the light.
// A hummingbird hovering, in its own frame (unit L ≈ its body), facing dir; kind 0 crimson with a gold-green throat and long tail,
// 1 green with a violet-blue throat; turn: how much it faces us (the throat lights up, the bill looks shorter); pitch: the body tilt.
void hummer(vec2 q,vec2 c,float L,float kind,float dir,float turn,float pitch,float t,float s){
 vec2 f=(q-c)/L;f.x/=sdir(dir);if(dot(f,f)>3.2)return;f=rot(pitch)*f;
 vec3 bodyC=kind<.5?vec3(.75,.06,.10):vec3(.10,.55,.20),dark=vec3(.02,.03,.03);
 // the wings: a blur of beats, a fan from the shoulder (brighter where the wing turns, at the ends of its sweep)
 vec2 S=vec2(-.02,.07);vec2 w=f-S;float r=length(w),a=atan(w.y,w.x);
 for(int k=0;k<2;k++){float fk=float(k),a0=mix(2.75,2.45,fk),sw=.95;float da=abs(a-a0)-sw;float edge=min(abs(a-(a0-sw)),abs(a-(a0+sw)));
  float m=ss(.55,.40,r)*ss(.02,.06,r)*ss(.05,-.05,da);float lit=.25+.6*exp(-edge*6.);
  put(vec3(.55,.75,.65)*m*lit*.10,m*.25,vec3(1.05,1.1,1.),vec2(0.));glow(vec3(.8,1.,.8)*ln(abs(r-.50)*L,.0006)*m*.15);}
 // the tail: a fork of long feathers in the crimson one, short and dark in the other
 if(kind<.5){for(int i=0;i<2;i++){float fi=float(i);vec2 a1=vec2(-.18,-.05),b1=vec2(-.62-.08*fi,-.30+.10*fi+.03*sin(t*3.+fi));float d=sdSeg(f,a1,b1)-mix(.030,.010,segU(f,a1,b1));solid(vec3(.25,.05,.05),cov(d*L));}}
 else{float d=sdEll(rot(.4)*(f-vec2(-.24,-.06)),vec2(.12,.04));solid(vec3(.05,.12,.10),cov(d*L));}
 // the body and the head
 float body=sdEll(rot(-.15)*(f-vec2(-.02,-.01)),vec2(.21,.10)),head=length(f-vec2(.17,.06))-.085;float bh=min(body,head);
 solid(mix(bodyC,bodyC*.5,ss(.0,-.08,f.y)),cov(bh*L));solid(dark*(1.-.4*turn)+bodyC*.15,cov(head*L));
 // the throat: dark when seen from the side, bright green and gold (or violet and blue) when it faces us
 vec2 g=f-vec2(.14,-.04);float gd=sdEll(rot(.4)*g,vec2(.075+.03*turn,.055+.02*turn));float gl=turn*turn;
 vec3 gc=kind<.5?mix(vec3(.55,.95,.25),vec3(1.,.80,.20),.5+.5*sin(g.x*60.+t)):mix(vec3(.45,.30,1.),vec3(.25,.65,1.),.5+.5*sin(g.y*60.+t));
 solid(mix(vec3(.04,.05,.03),gc*1.2,gl),cov(gd*L));glow(gc*cov(gd*L)*gl*.25+gc*ln(abs(gd)*L,.001)*gl*.4);
 // the eye with its white spot behind, the long bill (shorter when it turns to us)
 vec2 E=f-vec2(.19,.08);solid(vec3(.01),cov((length(E)-.022)*L));solid(vec3(1.),cov((length(E-vec2(-.006,.007))-.007)*L));
 float bl=.40*(1.-.55*turn);vec2 B0=vec2(.24,.05);float d=sdSeg(f,B0,B0+vec2(bl,-.04*bl/.4))-.012*(1.-.6*segU(f,B0,B0+vec2(bl,-.04)));solid(vec3(.05,.04,.03),cov(d*L));
 // the light from behind and above on its edges
 glow(vec3(1.,.85,.45)*ln(abs(bh)*L,.0012)*(.3+.5*ss(-.05,.1,f.y)));}
// A big heliconia leaf from its base b: a paddle with parallel veins, a few tears, lit from behind.
void paddle(vec2 q,vec2 b,float ang,float len,float t,float s){vec2 l=rot(ang+.03*sin(t*.5+s))*(q-b)/len;if(l.x<-.05||l.x>1.05||abs(l.y)>.3)return;
 float v,d=leafD(l,.20,v)*len;float tear=step(.85,vn(vec2(l.x*9.+s,sign(l.y)*3.)))*ss(.4,.8,abs(v));d=max(d,-(ss(.02,.0,abs(fract(l.x*9.+s)-.5)-.0)*tear-.5)*.01);
 float c=cov(d);if(c<=0.)return;float mid=exp(-abs(v)*14.),lat=pow(abs(sin((l.x*16.-abs(v)*2.5)*PI)),12.);
 vec3 col=mix(vec3(.25,.42,.05),vec3(.62,.75,.15),ss(-1.,1.,-v)*(.6+.4*sin(l.x*3.+s)))*(1.-.35*mid-.15*lat);solid(col,c);glow(vec3(1.,.85,.4)*ln(abs(d),.0014)*.4);}
// A bract of heliconia seen from the side: a red boat (o: the side it opens to), its lip yellow, its edge green; small yellow flowers
// peeking out of it.
void bract(vec2 q,vec2 p,float ang,float S,float o){vec2 l=rot(ang)*(q-p)/S;if(dot(l,l)>2.2)return;l.y*=o;
 float hull=max(length(l-vec2(.5,.62))-.78,l.y-.10-.15*l.x);float d=hull*S;float c=cov(d);if(c<=0.)return;
 float lip=ss(.05,.0,abs(l.y-.10-.15*l.x));vec3 col=mix(vec3(.70,.01,.05),vec3(.92,.06,.10),ss(-.1,.15,l.y));col=mix(col,vec3(1.,.80,.15),lip*.9);
 col=mix(col,vec3(.40,.65,.15),ss(-.012,.0,d)*.7);solid(col,c);glow(vec3(1.,.45,.35)*ln(abs(d),.0012)*.15);
 for(int k=0;k<2;k++){vec2 fl=l-vec2(.70+.16*float(k),.25+.10*float(k));solid(vec3(1.,.88,.30),cov((length(fl*vec2(1.,.6))-.06)*S));}}
void scene(vec2 q,float t){
 // soft circles of light far behind (the sun through the leaves)
 for(int i=0;i<7;i++){float fi=float(i);vec2 c=vec2(-ASP+2.*ASP*h11(fi+3.),-.3+.75*h11(fi+9.))+.01*vec2(sin(t*.2+fi),cos(t*.17+fi));float r=.03+.04*h11(fi+5.);
  glow(vec3(1.,.9,.5)*ss(r,r*.8,length(q-c))*.05);}
 // the big leaves, from the bottom
 paddle(q,vec2(-.80,-.62),-.95,.95,t,1.);paddle(q,vec2(.95,-.60),-2.25,.90,t,2.);paddle(q,vec2(-.20,-.70),-1.35,.55,t,3.);
 // the upright heliconia on the left: red bracts up a stem
 vec2 u0=vec2(-.62,-.55);solid(vec3(.20,.30,.05),cov(sdSeg(q,u0,u0+vec2(.03,.52))-.008));
 for(int i=0;i<6;i++){float fi=float(i),o=mod(fi,2.)<.5?1.:-1.;vec2 p=u0+vec2(.005*fi,.10+.085*fi);bract(q,p,o>0.?-.55:3.69,.20-.016*fi,o>0.?1.:-1.);}
 // the hanging chain of bracts on the right (Heliconia rostrata), swaying a little
 vec2 h0=vec2(.40,.56);float sw=.012*sin(t*.6);
 for(int i=0;i<6;i++){float fi=float(i),o=mod(fi,2.)<.5?1.:-1.;vec2 p=h0+vec2(sw*fi*.3+.012*o,-.105*fi-.02);
  solid(vec3(.25,.35,.06),cov(sdSeg(q,p,p+vec2(-.024*o,-.105))-.005));bract(q,p+vec2(0.,-.05),o>0.?.45:2.69,.19-.014*fi,o>0.?-1.:1.);}
 // motes of pollen in the light
 for(int i=0;i<16;i++){float fi=float(i);vec2 c=vec2(-ASP+2.*ASP*h11(fi+20.)+.03*sin(t*.3+fi),-.45+.95*fract(h11(fi+30.)+t*.012));float d=length(q-c);glow(vec3(1.,.9,.5)*exp(-d/.0035)*.5*(.5+.5*sin(t*1.3+fi*2.)));}
 // dark leaves in front, out of the light, at the corners
 {float v;vec2 l=rot(.6)*(q-vec2(-ASP-.05,.62))/.75;float d=leafD(l,.22,v)*.75;solid(vec3(.02,.05,.012)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.92);}
 {float v;vec2 l=rot(2.6)*(q-vec2(ASP+.05,-.62))/.70;float d=leafD(l,.22,v)*.70;solid(vec3(.02,.05,.012)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.92);}
 // the crimson hummingbird: hovers, turns to us, drinks from the hanging flowers, then flies off when the other comes
 float turn=ss(2.6,3.4,t)*ss(4.4,3.8,t)+.7*ss(7.6,8.0,t)*ss(9.2,8.8,t);
 vec2 p1=vec2(-.12,.10)+vec2(.02*sin(t*1.3),.012*sin(t*2.1));
 vec2 drink=vec2(.12,.03);p1=mix(p1,drink,ss(4.3,4.8,t)*ss(6.7,6.3,t));p1+=vec2(.006*sin(t*9.),0.)*ss(4.8,5.,t)*ss(6.6,6.4,t);
 p1=mix(p1,vec2(-.22,.06)+vec2(.01*sin(t*1.5),.01*sin(t*2.)),ss(6.8,7.2,t));p1=mix(p1,vec2(-1.3,.35),ss(9.4,10.2,t));
 float dir1=1.-2.*ss(9.3,9.45,t);
 hummer(q,p1,.30,0.,dir1,turn,-.45+.15*sin(t*1.7),t,1.);
 // the green hummingbird darts in from the right
 vec2 p2=mix(vec2(1.35,.30),vec2(.16,.10),ss(7.0,7.5,t))+vec2(.015*sin(t*1.6+2.),.012*sin(t*2.3+1.));p2=mix(p2,vec2(.14,.00),ss(10.,10.5,t));
 float turn2=ss(10.6,11.2,t)*.8;
 if(t>6.8)hummer(q,p2,.25,1.,-1.,turn2,-.5+.12*sin(t*1.9),t,2.);
}
