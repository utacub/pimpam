// 6 · Morfos i papallones de vidre. Shafts of sun slant through the canopy, with dust shining in them. A blue morpho flies across in
// its slow, floppy way, showing blue above and brown with eyespots below at each beat; when it crosses the brightest shaft its blue
// lights up (the key moment, tau ≈ 3–5 s; the blue of morphos is a structural colour: Vukusic et al., 1999). A second morpho crosses
// higher later. In front, by a twig of small flowers, three glasswing butterflies flutter and settle; through their clear wings the
// forest shows, a little bent (their wings hardly reflect light: Siddique et al., 2015). Beats are slow (photosensitivity).
// The shafts of sun: soft diagonal bands; returns their light at q.
float shafts(vec2 q,float t){vec2 d=normalize(vec2(-.45,-1.));float u=dot(q,vec2(-d.y,d.x));float s=0.;
 for(int i=0;i<4;i++){float fi=float(i),c=(i==0?-.30:-.95+.55*fi)+.03*sin(t*.15+fi),w=i==0?.07:.04+.03*h11(fi+2.);s+=exp(-pow((u-c)/w,2.))*(i==0?1.:.45+.3*h11(fi+5.))*(.8+.2*sin(t*.4+fi*2.));}
 return s*ss(-.6,.4,q.y+.2*q.x);}
// A morpho seen from above and a little from the side, body along +x: o = cos of the beat (1 open, seen from above: blue; −1 closed
// upwards, seen from below: brown with eyespots); lit: the sun on it (the blue glows).
void morpho(vec2 q,vec2 c,float S,float ang,float o,float lit,float t){vec2 f=rot(ang)*(q-c)/S;if(dot(f,f)>1.6)return;
 float k=abs(o)*.92+.08;vec2 g=vec2(f.x,abs(f.y)/k);bool top=o>0.;
 float fw=sdEll(rot(-.35)*(g-vec2(.02,.42)),vec2(.20,.42)),hw=sdEll(rot(.45)*(g-vec2(-.20,.30)),vec2(.20,.30));float w=min(fw,hw)*S*k;
 float cw=cov(w);
 if(cw>0.){vec3 col;if(top){float rim=ss(-.09,-.04,min(fw,hw));col=mix(vec3(.10,.35,.95),vec3(.30,.80,1.),.5+.5*sin(g.y*6.+t*.5))*(.6+.35*lit);col=mix(col,vec3(.02,.02,.04),rim);
   for(int i=0;i<3;i++){vec2 sp=g-vec2(.08-.06*float(i),.70-.05*float(i));col=mix(col,vec3(.9),cov((length(sp)-.022)*S*k)*rim);}}
  else{col=mix(vec3(.13,.08,.04),vec3(.22,.14,.07),ss(.0,.5,g.y));for(int i=0;i<3;i++){vec2 oc=i==0?vec2(.05,.55):i==1?vec2(-.18,.28):vec2(-.06,.40);float r=length(g-oc);
    col=mix(col,vec3(.95,.70,.20),ss(.065,.055,r));col=mix(col,vec3(.03),ss(.045,.035,r));col=mix(col,vec3(.9),ss(.014,.008,r));}}
  solid(col,cw);if(top)glow(vec3(.05,.35,1.)*cw*lit*.22+vec3(.5,.85,1.)*ln(abs(w),.0012)*(.2+.5*lit));}
 float body=sdEll(f-vec2(-.02,0.),vec2(.20,.035))*S;solid(vec3(.06,.05,.05),cov(body));
 solid(vec3(.06),cov(sdSeg(f,vec2(.17,.0),vec2(.32,.08))*S-.0015)+cov(sdSeg(f,vec2(.17,.0),vec2(.32,-.08))*S-.0015));}
// A glasswing butterfly from above, body along +x, o = cos of the beat: clear wings (the forest seen through, a little bent), dark
// veins and edges, a white band near the tips, a touch of orange at the edge of the hind wings.
void glasswing(vec2 q,vec2 c,float S,float ang,float o,float t){vec2 f=rot(ang)*(q-c)/S;if(dot(f,f)>1.6)return;
 float k=abs(o)*.92+.08;vec2 g=vec2(f.x,abs(f.y)/k);
 float fw=sdEll(rot(-.30)*(g-vec2(.02,.40)),vec2(.17,.40)),hw=sdEll(rot(.50)*(g-vec2(-.18,.28)),vec2(.17,.27));float w=min(fw,hw);float cw=cov(w*S*k);
 if(cw>0.){float edge=ss(-.045,-.015,w);float vein=0.;for(int i=0;i<5;i++){float a=-.9+float(i)*.32;vec2 d=vec2(sin(a),cos(a));vein=max(vein,ln(abs(dot(g-vec2(.0,.03),vec2(d.y,-d.x)))*S*k,.0006)*ss(.0,.1,dot(g,d)));}
  put(vec3(.02)*cw,cw*.9*(1.-edge),vec3(1.02,1.03,1.06),-(g-vec2(-.05,.3))*.012*S);
  solid(vec3(.05,.04,.03),cw*max(edge,vein*.8));solid(vec3(.95,.92,.88),cw*cov((length((g-vec2(.12,.62))*vec2(1.,2.2))-.06)*S*k));
  solid(vec3(.85,.40,.12),cw*ss(-.03,-.01,hw)*step(g.x,-.25)*.8);glow(vec3(.9,1.,.9)*ln(abs(w)*S*k,.0008)*.3);}
 solid(vec3(.05),cov(sdEll(f-vec2(-.02,0.),vec2(.18,.03))*S));}
void scene(vec2 q,float t){
 // the shafts of sun, with dust floating in them
 float sh=shafts(q,t);glow(vec3(1.,.88,.55)*sh*.10);
 for(int i=0;i<30;i++){float fi=float(i);vec2 c=vec2(-ASP+2.*ASP*h11(fi+1.)+.04*sin(t*.2+fi),-.5+fract(h11(fi+2.)+t*.01*(.5+h11(fi))));float d=length(q-c);
  glow(vec3(1.,.9,.6)*exp(-d/.0035)*shafts(c,t)*1.2);}
 // a twig with small orange and pink flowers in front, on the right
 vec2 tw0=vec2(.95,-.55);for(int i=0;i<3;i++){float fi=float(i);vec2 a=tw0,b=tw0+vec2(-.22-.12*fi,.18+.08*fi);float d=sdSeg(q,a,b)-.005;solid(vec3(.08,.10,.03),cov(d));
  for(int k=0;k<12;k++){float fk=float(k);vec2 fc=b+.045*vec2(cos(fk*2.4),sin(fk*2.4))*sqrt(fk/12.)*1.6;solid(mix(vec3(.85,.22,.03),vec3(.80,.16,.40),h11(fk+fi*9.)),cov(length(q-fc)-.015));
   solid(vec3(1.,.9,.4),cov(length(q-fc)-.004));}}
 // a dark leaf in front, top left, out of the light
 {float v;vec2 l=rot(.5)*(q-vec2(-ASP-.06,.66))/.70;float d=leafD(l,.24,v)*.70;solid(vec3(.015,.04,.015)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.93);}
 // the glasswings: flutter round the flowers, settle with the wings still, take off again
 for(int i=0;i<3;i++){float fi=float(i);vec2 home=tw0+vec2(-.22-.12*fi,.18+.08*fi)+vec2(.0,.03);float ph=t*.55+fi*2.1;float sit=ss(.55,.75,sin(ph))*1.;
  vec2 p=home+vec2(.12*sin(t*.7+fi*2.)+.05*sin(t*1.9+fi),.06*sin(t*1.1+fi*3.)+.06)*(1.-sit);float o=mix(cos(t*TAU*1.4+fi*2.),.35,sit);
  glasswing(q,p,.11,-.3+.4*sin(t*.5+fi)*(1.-sit),o,t);}
 // the first morpho crosses through the brightest shaft; the second, higher, later
 {float u=t-1.0;vec2 p=vec2(-1.1+u*.26,-.05+.10*sin(u*.8)+.04*sin(u*2.3));float lit=ss(.0,.6,shafts(p,t))*1.3;float ph=u*TAU*1.25,glide=max(ss(.3,.8,sin(u*.9+1.))*.6,ss(.3,.9,lit)*.9);float o=mix(cos(ph),.92,glide);
  morpho(q,p,.24,-.15+.2*sin(u*.8),o,lit,t);}
 {float u=t-6.0;if(u>0.){vec2 p=vec2(1.2-u*.24,.30+.08*sin(u*.9)+.03*sin(u*2.1));float ph=u*TAU*1.15+1.;float o=mix(cos(ph),.85,ss(.4,.9,sin(u*1.1))*.6);
  morpho(q,p,.15,3.14-.15+.2*sin(u*.7),o,ss(.0,.6,shafts(p,t))*1.3,t);}}
}
