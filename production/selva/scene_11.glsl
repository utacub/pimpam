// 12 · Formigues talladores. Late afternoon on the forest floor: a fallen log covered with moss and bracket fungi. Along its top, a
// line of leafcutter ants walks to the left, each holding up a piece of leaf like a green sail; on one piece rides a tiny ant (the
// small workers that ride on the leaves: Roces & Hölldobler, 1995). In front, on the right, a worker cuts a half moon out of the edge of
// a leaf (the snips), lifts its piece over its head (the key moment, tau ≈ 3.4–4.4 s), turns and joins the line.
float logTop(float x){return -.10+.025*sin(x*2.+.5)+.008*sin(x*9.);}
// A piece of leaf held up as a sail, from the jaws at m: a half moon standing up, see-through green, its veins; s: seed of its shape.
void sail(vec2 f,vec2 m,float R,float s,float L,float tilt){vec2 p=rot(tilt)*(f-m);vec2 c=vec2(-.10*R/.3,R*.95);
 float d=max(length(p-c)-R,-(p.y-.02-.15*sin(p.x*9.+s)*R));d=max(d,-(length(p-c-vec2(R*.9,R*.4))-R*.35*h11(s)));float cv=cov(d*L);if(cv<=0.)return;
 float vein=ln(abs(p.x-c.x+.15*(p.y-c.y))*L,.0006)*ss(.0,.1,p.y);put(vec3(.03,.07,.01)*cv,cv*.80,vec3(.30,.60,.12),vec2(0.));solid(vec3(.10,.22,.03),cv*vein*.5);
 glow(vec3(.8,1.,.5)*ln(abs(d)*L,.0009)*.45);}
// An ant, side view facing dir (feet on the surface at the origin, unit L ≈ body length): head, thorax, waist, gaster; six legs in a
// tripod gait (ph); antennae; a piece of leaf held up (sz: its size, 0 none), maybe a tiny rider on its top edge.
void ant(vec2 q,vec2 c,float L,float dir,float ph,float sz,float s,float rider,float rh,float tilt,float dim){
 vec2 f=(q-c)/L;f.x/=sdir(dir);if(f.x<-.8||f.x>.9||f.y<-.1||f.y>1.4)return;
 vec3 col=vec3(.15,.045,.02)*dim;
 if(sz>.01){sail(f,vec2(.32,.16),.34*sz,s,L,tilt);
  if(rider>.5){vec2 r0=vec2(.32,.16)+rot(-tilt)*vec2(-.10*sz/.3*.34,.34*sz*1.95);vec2 g=(f-r0)/.32;float bd=min(min(sdEll(g-vec2(-.25,.12),vec2(.16,.10)),sdEll(g-vec2(0.,.12),vec2(.12,.06))),sdEll(g-vec2(.20,.15+.08*rh),vec2(.08,.07)));
   solid(col*1.1,cov(bd*.32*L));for(int k=0;k<3;k++){float fk=float(k);solid(col,cov((sdSeg(g,vec2(-.05+.07*fk,.10),vec2(-.10+.12*fk,0.))-.012)*.32*L));}
   solid(col,cov((sdSeg(g,vec2(.24,.20+.08*rh),vec2(.34,.34+.10*rh))-.012)*.32*L));}}
 // the legs: three on each side, the far ones darker
 for(int k=0;k<6;k++){float fk=float(k),side=k<3?0.:1.;float i=mod(fk,3.);float bx=-.06+.07*i;float p=ph+i*PI+side*PI;float sw=.11*sin(p),lift=max(0.,cos(p))*.04;
  vec2 hip=vec2(bx,.13),kn=vec2(bx+(i-1.)*.10+sw*.5,.20+lift),ft=vec2(bx+(i-1.)*.16+sw,lift*.5);float d=min(sdSeg(f,hip,kn),sdSeg(f,kn,ft))-.016;
  solid(col*(side>.5?.55:1.),cov(d*L));}
 // the body
 float g=sdEll(rot(.15)*(f-vec2(-.30,.15)),vec2(.17,.12)),pt=sdEll(f-vec2(-.12,.14),vec2(.05,.035)),th=sdEll(rot(-.20)*(f-vec2(.02,.16)),vec2(.13,.06)),hd=sdEll(f-vec2(.22,.18),vec2(.10,.09));
 float b=min(min(g,pt),min(th,hd));solid(col*(.85+.3*ss(.0,.2,f.y-.12)),cov(b*L));glow(vec3(1.,.75,.45)*ln(abs(b)*L,.0008)*.35*dim);
 // the spines of the back, the jaws, the antennae
 solid(col,cov((min(sdSeg(f,vec2(.0,.20),vec2(-.03,.27)),sdSeg(f,vec2(.07,.20),vec2(.06,.26)))-.010)*L));
 solid(col*.8,cov((sdSeg(f,vec2(.29,.15),vec2(.34,.13))-.018)*L));
 float a1=min(sdSeg(f,vec2(.25,.25),vec2(.33,.40)),sdSeg(f,vec2(.33,.40),vec2(.46,.34+.03*sin(ph*.5))));solid(col,cov((a1-.010)*L));
}
// A bracket fungus on the side of the log.
void bracket(vec2 q,vec2 p,float r){vec2 l=q-p;float d=max(length(l*vec2(1.,2.2))-r,-l.y-.002);solid(mix(vec3(.30,.20,.10),vec3(.55,.42,.25),ss(-r*.4,.0,l.y))*(.8+.2*sin(length(l)*160.)),cov(d));glow(vec3(1.,.8,.5)*ln(abs(d),.001)*.2);}
void scene(vec2 q,float t){
 // ferns behind the log
 for(int k=0;k<4;k++){float fk=float(k);vec2 b=vec2(-.85+.55*fk,logTop(-.85+.55*fk)-.02);for(int j=0;j<5;j++){float a=.8+.45*float(j)+.04*sin(t*.5+fk);vec2 d0=vec2(cos(a),sin(a));
  vec2 l=q-b;float u=sat(dot(l,d0)/.38);vec2 cp=b+d0*u*.38+vec2(0.,-.06*u*u);float w=.035*(1.-u)*(.6+.4*abs(sin(u*40.)));float dd=length(q-cp)-w;solid(vec3(.03,.07,.02),cov(dd));}}
 // the log: bark with long cracks, moss on top, bracket fungi
 {float y=logTop(q.x);float d=q.y-y;vec3 bark=vec3(.042,.030,.018)*(.7+.4*fbm2(q*vec2(6.,40.)))*(1.-.4*ss(.4,.6,vn(q*vec2(3.,60.))));
  float moss=ss(-.06,-.01,d)*ss(.3,.6,fbm(q*14.));solid(mix(bark,vec3(.08,.15,.03)*(.8+.4*vn(q*150.)),moss)*(1.-.5*ss(-.5,-.75,q.y)),cov(d)*ss(-.95,-.62,q.y));glow(vec3(1.,.85,.5)*ln(abs(d),.0012)*.30);}
 bracket(q,vec2(-.45,logTop(-.45)-.16),.08);bracket(q,vec2(-.36,logTop(-.36)-.22),.055);bracket(q,vec2(.20,logTop(.20)-.25),.07);
 // the line of ants on the top of the log, a little farther, walking to the left
 for(int i=0;i<6;i++){float fi=float(i),x=wrap(1.25-.08*t-.42*fi,-1.27,1.25);vec2 c=vec2(x,logTop(x)+.008);
  ant(q,c,.17,-1.,(1.25-.08*t)/.17*1.6*PI*.35+fi,.75+.25*h11(fi),fi*3.,i==2?1.:0.,ss(8.,8.5,t)*ss(9.8,9.3,t),.15*sin(t*1.5+fi),.80);}
 // the leaf being cut, on the right, from its stem; the half moon taken out once the cut is done
 vec2 E=vec2(.64,-.035);float cut=ss(.4,3.3,t);float done=step(3.35,t);
 {vec2 a=vec2(ASP+.1,.40),b=vec2(1.02,.14);solid(vec3(.05,.12,.02),cov(sdSeg(q,a,b)-.008));
  float v;vec2 l=rot(PI+.25)*(q-b)/.58;float d=leafD(l,.22,v)*.58;if(done>.5)d=max(d,-(length(q-E)-.06));float cv=cov(d);
  solid(mix(vec3(.08,.18,.03),vec3(.16,.30,.05),.5+.5*v)*(1.-.3*exp(-abs(v)*14.)),cv);glow(vec3(.9,1.,.5)*ln(abs(d),.0012)*.3);
  // the cut so far: a dark arc from the edge
  float an=atan(q.y-E.y,q.x-E.x);float arc=ln(abs(length(q-E)-.06),.0012)*step(an,mix(-2.6,.9,cut))*step(-2.6,an)*cv*(1.-done);solid(vec3(.02,.04,.01),arc*.8);}
 // the cutter: cuts (its head bobbing), lifts its piece, turns and goes off along the log
 float lift=ss(3.4,4.2,t),turn=ss(4.3,4.7,t);float wx=.50-.08*max(t-4.7,0.);float dir=turn<.5?1.:-1.;float sq=1.-.8*sin(PI*turn);
 {vec2 c=vec2(wx,logTop(wx)+.01);vec2 qq=c+(q-c)*vec2(1./max(sq,.2),1.);float bob=.03*sin(t*7.)*(1.-done);
  ant(qq,c+vec2(0.,bob*.02),.21,dir,t>4.7?(.50-wx)/.21*1.6*PI*.35*3.:t*.6,lift*.85,7.,0.,0.,-.25*(1.-lift)+.1*sin(t*1.3)*lift,1.);}
 // a dark leaf in front, bottom right, and one top left
 {float v;vec2 l=rot(2.6)*(q-vec2(ASP+.06,-.64))/.50;float d=leafD(l,.22,v)*.50;solid(vec3(.012,.025,.01)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.93);}
 {float v;vec2 l=rot(.5)*(q-vec2(-ASP-.06,.64))/.55;float d=leafD(l,.22,v)*.55;solid(vec3(.012,.025,.01)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.93);}
}
