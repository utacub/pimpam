// 11 · Granotes punta de fletxa. On the forest floor, in the green shade, the foot of a big tree with its buttress root, dead leaves,
// and a bromeliad with a little pool of water in its heart. A tiny poison frog, black with yellow stripes and blue legs, carries its
// tadpole on its back: it hops up the root and onto the bromeliad (≈ 1.5–3.3 s) and lowers the tadpole into the pool, where it swims
// off (the key moment, tau ≈ 3.8–4.8 s; the males of Ranitomeya imitator carry tadpoles to small pools in plants: Brown et al., 2010;
// "on the back" is a criterion of the design here). Then the other frog, on the floor, calls with its throat swelling (≈ 7.8–10 s).
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
float groundY(float x){return -.32+.03*sin(x*3.+1.)+.015*sin(x*7.);}
// Leaf litter: dead leaves in a cell grid, two layers, brown and ochre, with their middle vein.
void litter(vec2 q,float top){if(q.y>top+.04)return;
 for(int L=0;L<2;L++){float sc=L==0?.11:.08;vec2 g=q/sc+float(L)*vec2(.37,.71);vec2 id=floor(g);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 c=id+vec2(i,j);vec2 r=h22(c+float(L)*17.);if(r.x>.85)continue;vec2 p=(c+r)*sc-float(L)*vec2(.37,.71)*sc;
   if(p.y>top-.005)continue;float a=h21(c+3.)*6.28;vec2 l=rot(a)*(q-p)/(sc*.9);float v,d=leafD(l+vec2(.5,0.),.28,v)*sc*.9;float cv=cov(d);if(cv<=0.)continue;
   vec3 col=mix(vec3(.07,.04,.018),vec3(.15,.085,.035),h21(c+9.))*(1.-.25*exp(-abs(v)*12.))*(.75+.25*vn(l*20.))*(L==0?.75:1.);solid(col,cv);}}}
// A poison frog, side view facing dir, sitting up (unit L ≈ its length): black with two yellow stripes, blue legs with black spots,
// big black eyes. st: stretch of a hop; sac: the throat swelling as it calls; tad: a tadpole on its back (0–1, slides off with tadOff).
void dart(vec2 q,vec2 c,float L,float dir,float st,float sac,float tad,float tadOff,float t){
 vec2 f=(q-c)/L;f.x/=sdir(dir);if(dot(f,f)>3.)return;
 vec2 g=rot(.30*st)*f;
 vec3 blk=vec3(.012,.012,.015),yel=vec3(.85,.62,.03),blu=vec3(.05,.22,.42);
 // the far legs, in a hop
 if(st>.02){float d=sdSeg(g,vec2(-.30,.12),mix(vec2(-.05,.02),vec2(-.85,.04),st))-.05;solid(blu*.5,cov(d*L));}
 // the throat sac, behind the chin
 if(sac>.01){float d=length(g-vec2(.30,.05-.04*sac))-.10*sac;solid(mix(vec3(.55,.45,.10),vec3(.85,.75,.30),sac),cov(d*L));glow(vec3(1.,.9,.5)*ln(abs(d)*L,.001)*.3*sac);}
 // the body, tilted up at the front; the head
 float bd=sdEll(rot(-.35+.30*st)*(g-vec2(-.05,.20)),vec2(.36,.18)),hd=sdEll(g-vec2(.24,.32),vec2(.17,.14));float b=smin(bd,hd,.07);
 float s1=abs(g.y-(.30+.30*g.x*0.+.12*sin(g.x*2.)))-.030,s2=abs(g.y-(.12+.25*(g.x+.1)))-.026;
 vec3 col=mix(blk,yel*(.85+.15*vn(g*30.)),max(ss(.006,-.006,s1),ss(.006,-.006,s2)*ss(.20,.0,g.x)));
 solid(col,cov(b*L));glow(vec3(1.,.9,.6)*ln(abs(b)*L,.0012)*.35);
 // the near hind leg folded (or thrown back), blue with black spots; the front leg
 {vec2 hip=vec2(-.26,.10),kn=mix(vec2(-.02,.10),vec2(-.62,.02),st),an=mix(vec2(-.28,.0),vec2(-.95,.05),st),tp=mix(vec2(-.04,-.02),vec2(-1.08,.06),st);
  float d=min(min(sdSeg(g,hip,kn)-.068,sdSeg(g,kn,an)-.048),sdSeg(g,an,tp)-.026);float sp=step(.80,vn(g*14.));solid(mix(blu*(.9+.3*vn(g*10.)),blk,sp),cov(d*L));glow(vec3(.7,.9,1.)*ln(abs(d)*L,.001)*.25);
}
 {vec2 sh=vec2(.16,.16),hn=mix(vec2(.22,-.01),vec2(.52,.18),st);float d=sdSeg(g,sh,hn)-.035;solid(blu,cov(d*L));for(int k=0;k<3;k++){vec2 e=hn+vec2(.03*float(k)-.02,-.01);solid(blu*1.2,cov((length(g-e)-.018)*L));}}
 // the eye: big and black with a spot of light
 {vec2 E=g-vec2(.27,.40);float ed=length(E)-.075;solid(blk,cov(ed*L));solid(vec3(1.),cov((length(E-vec2(.02,.025))-.018)*L));glow(vec3(.8,.9,1.)*ln(abs(ed)*L,.001)*.3);}
 // the tadpole on its back: grey brown, its tail curled; it slides off backwards into the water
 if(tad>.01){vec2 tp=g-vec2(-.08,.36)-vec2(-.25,-.20)*tadOff;float d=min(sdEll(tp,vec2(.09,.065)),sdSeg(tp,vec2(-.05,0.),vec2(-.24,.04+.03*sin(t*9.)))-.018);solid(vec3(.28,.25,.18)*(.8+.3*vn(tp*40.)),cov(d*L)*tad);
  solid(vec3(.02),cov((length(tp-vec2(.05,.02))-.015)*L)*tad);}
}
// A tadpole swimming in the pool, seen through the water.
void tadpole(vec2 q,vec2 c,float S,float a,float t){vec2 p=rot(a)*(q-c)/S;float d=min(sdEll(p,vec2(.10,.07)),sdSeg(p,vec2(-.06,0.),vec2(-.30,.05*sin(t*10.)))-.02*(1.-.5*ss(-.06,-.3,p.x)));
 solid(vec3(.20,.17,.12),cov(d*S)*.85);}
void scene(vec2 q,float t){
 // the buttress of the big tree on the left: a tall plank of root, flaring down to the floor, ridged, with moss
 float px=q.x+ASP+.05;float top=-.30+.95*exp(-px*2.1);
 {float d=max(q.y-top,-px);vec3 bark=vec3(.040,.030,.022)*(.7+.5*fbm2(q*vec2(26.,5.)))*(.8+.3*ss(.0,.6,q.y-top+.6));float moss=ss(.45,.7,fbm(q*9.))*.8;
  solid(mix(bark,vec3(.035,.075,.018)*(.8+.4*vn(q*90.)),moss),cov(d));glow(vec3(.8,1.,.6)*ln(abs(q.y-top),.0015)*.30*step(-px,0.));
  solid(vec3(.02,.015,.012),cov(-px+.25)*cov(d)*.6);}
 // the floor: dark earth and dead leaves
 float gy=groundY(q.x);solid(vec3(.030,.020,.012)*(.8+.3*fbm2(q*30.)),cov(q.y-gy));litter(q,gy);
 // the bromeliad on the right: leaves behind the pool, the pool in its heart, leaves in front over the rim
 vec2 B=vec2(.48,-.36),pool=vec2(.48,-.08);
 for(int k=0;k<7;k++){float fk=float(k),a=mix(.95,2.2,fk/6.);vec2 d0=vec2(cos(a),sin(a));vec2 tip=B+d0*vec2(.40,.48);
  float u=sat(dot(q-B,tip-B)/dot(tip-B,tip-B));vec2 cp=mix(B,tip,u)+vec2(.06*u*u*sign(d0.x),-.04*u*u);float w=mix(.050,.010,u);float dd=length(q-cp)-w;
  vec3 lc=mix(vec3(.05,.13,.02),vec3(.12,.22,.04),u)*(1.-.35*ss(.3,1.,length(q-cp)/w));lc=mix(lc,vec3(.30,.04,.04),ss(.5,.25,u)*.7);
  solid(lc*(.45+.08*fk/6.),cov(dd));glow(vec3(.9,1.,.6)*ln(abs(dd),.001)*.2);}
 {vec2 pp=(q-pool)*vec2(1.,3.6);float pd=(length(pp)-.17)/3.6;float pc=cov(pd);
  if(pc>0.){put(vec3(.004,.010,.008)*pc,pc*.9,vec3(.55,.75,.65),vec2(0.,-.03)*pp.y);glow(vec3(.8,1.,.9)*ss(.05,.0,abs(pp.y-.06+.3*pp.x*pp.x))*ss(.15,.05,abs(pp.x+.04))*.10*pc);
   float ring=0.;float u=t-4.4;if(u>0.&&u<3.){for(int k=0;k<2;k++){float r=u*.05-.025*float(k);if(r>0.)ring+=exp(-abs(length(pp-vec2(-.05,0.))-r)/.004)*(1.-u/3.);}}glow(vec3(.8,1.,.9)*ring*.30*pc);
   float tw=ss(4.4,4.9,t);if(tw>0.){vec2 tc=pool+vec2(-.05+.09*sin(t*.6),.008*sin(t*1.3));tadpole(q,tc,.12,.4*sin(t*.6)+3.14*step(0.,cos(t*.6)),t);}}
  glow(vec3(.8,1.,.9)*ln(abs(pd),.0012)*.35);}
 for(int k=0;k<5;k++){float fk=float(k),a=k<2?.30+.28*fk:k==2?1.57:2.55+.28*(fk-3.);vec2 d0=vec2(cos(a),sin(a));vec2 tip=B+d0*vec2(.42,.26)+vec2(0.,k==2?-.20:.02);
  float u=sat(dot(q-B,tip-B)/dot(tip-B,tip-B));vec2 cp=mix(B,tip,u)+vec2(0.,-.06*u*u);float w=mix(.055,.012,u);float dd=length(q-cp)-w;if(k==2)dd=sdEll(q-B-vec2(0.,.10),vec2(.06,.13));
  vec3 lc=mix(vec3(.06,.15,.03),vec3(.14,.26,.05),u)*(1.-.35*ss(.3,1.,length(q-cp)/w));lc=mix(lc,vec3(.32,.05,.04),ss(.5,.2,u)*.7);
  solid(lc*.6,cov(dd));glow(vec3(.9,1.,.6)*ln(abs(dd),.001)*.18);}
 // the frog with its tadpole: up the root, onto the bromeliad, the tadpole into the pool
 float tx0=-.42,tx1=-.06;vec2 P0=vec2(tx0,-.30+.95*exp(-(tx0+ASP+.05)*2.1)),P1=vec2(tx1,-.30+.95*exp(-(tx1+ASP+.05)*2.1)),P2=vec2(.31,-.075);
 float h1=ss(1.5,2.2,t),h2=ss(2.6,3.3,t);vec2 p=mix(mix(P0,P1,h1),P2,h2)+vec2(0.,.10*sin(PI*h1)+.10*sin(PI*h2));
 float st=ss(1.45,1.6,t)*ss(2.25,2.1,t)+ss(2.55,2.7,t)*ss(3.35,3.2,t);float lean=ss(3.6,4.0,t)*ss(5.2,4.8,t);
 float tad=1.-ss(4.3,4.6,t),tadOff=ss(3.9,4.5,t);
 dart(q,p+vec2(0.,-.02*lean),.27,1.,st-.25*lean,0.,tad,tadOff,t);
 // the other frog on the floor, in front on the right, calling
 float sac=0.;for(int k=0;k<3;k++){float u=t-7.8-1.*float(k);sac=max(sac,ss(0.,.3,u)*ss(.8,.5,u));}
 dart(q,vec2(.06,groundY(.06)+.005),.25,-1.,0.,sac,0.,0.,t);
 // dark leaves in front, at the corners
 {float v;vec2 l=rot(2.6)*(q-vec2(ASP+.06,-.66))/.50;float d=leafD(l,.22,v)*.50;solid(vec3(.012,.03,.01)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.93);}
 {float v;vec2 l=rot(-.6)*(q-vec2(-ASP-.06,-.62))/.45;float d=leafD(l,.22,v)*.45;solid(vec3(.012,.03,.01)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.93);}
}
