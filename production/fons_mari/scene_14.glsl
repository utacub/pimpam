// 15 · Calamar vampir. Close to a vampire squid (Vampyroteuthis): a wine-red body with big blue eyes, two round fins like ears and a
// cloak of web between its eight arms, lined with soft white spines. It glides in flapping its fins; it turns the cloak over its body
// (the "pineapple"), lets a cloud of blue lights out of its arm tips and slips away from it; then it opens the cloak like an umbrella
// and floats.
void scene(vec2 q,float t){
 // the choreography: glide (0–4 s), pineapple (4–7), lights (6–10), open and float (10 on)
 float pine=ss(3.6,5.,t)*(1.-ss(8.5,10.5,t)),open=ss(10.,12.,t)*(.75+.25*sin(t*.9));
 float back=ss(6.5,9.5,t);
 vec2 C=vec2(mix(-.8,-.02,ss(0.,4.6,t))-.2*back+.1*ss(10.,15.,t),.02*sin(t*.6)+.04-.08*back+.04*ss(10.,15.,t));
 float ang=mix(-.45,.08,ss(0.,4.,t))+.12*sin(t*.4)+.3*back*(1.-ss(10.,13.,t));
 float sz=.36;vec2 l=rot(ang)*(q-C)/sz;
 // the cloud of blue lights: let out of the arm tips round the body, it spreads and drifts slowly, glittering
 vec2 K=vec2(-.02,.05);
 for(int i=0;i<60;i++){float fi=float(i),born=6.+1.8*h11(fi),age=t-born;if(age<0.)continue;
  float a=TAU*h11(fi+2.),rr=(.05+.32*sqrt(h11(fi+4.)))*(1.-exp(-age*.5));
  vec2 wp=K+vec2(cos(a),sin(a)*.8)*rr+vec2(.012*age,.01*age+.01*sin(age+fi));
  float tw=.6+.4*sin(t*(1.+h11(fi+6.))+fi);float fade=exp(-age*.12);
  glow(mix(vec3(.15,.55,1.),vec3(.4,.9,1.),h11(fi+7.))*(exp(-length(q-wp)/.006)*1.3+exp(-length(q-wp)/.03)*.12)*tw*fade*ss(0.,.4,age));}
 if(abs(l.x)>2.3||abs(l.y)>2.3)return;enter(sz);
 // the arms and the cloak: from the head (at the origin) towards -x when gliding; turned back over the body (towards +x) in the
 // pineapple; spread wide when it opens
 vec2 p=l;float pr=length(p),pa=atan(p.y,-p.x);
 float span=mix(.35,1.25,open)*(1.-pine)+pine*.5,dirA=pine*2.75;
 float arms=0.,armc=0.,spines=0.,tips=0.;float aMin=1e3,aMax=-1e3;
 for(int i=0;i<8;i++){float fi=float(i),u0=(fi/7.-.5)*2.;float a=u0*span+.06*sin(t*1.4+fi);float sgn=u0<0.?-1.:1.;
  float L=1.05+.1*h11(fi);float u=sat(pr/L);float aa=a+sgn*dirA*u*.9+(.25*(1.-open))*sgn*u*u+.1*sin(u*5.-t*1.6+fi);
  float da=abs(pa-aa)*pr,w=.075*(1.-.7*u);float on=step(pr,L);armc+=cov(da-w)*on;arms+=ln(abs(da-w),.015)*on;
  float sp=fract(pr*14.)-.5;spines+=ln(length(vec2(sp/14.,da-w-.025)),.01)*on*ss(.15,.3,pr);
  vec2 tp=vec2(-cos(aa),sin(aa))*L;tips+=exp(-length(p-tp)/.04);aMin=min(aMin,a);aMax=max(aMax,a);}
 float webL=.62+.05*cos(pa*12.);float inWeb=ss(aMin-.1,aMin,pa)*ss(aMax+.1,aMax,pa)*ss(webL+.02,webL-.02,pr)*(1.-pine);
 put(inWeb*vec3(.25,.02,.07)*.5,inWeb*.75,vec3(.3,.06,.12),vec2(0.));
 put(armc*vec3(.3,.03,.08)*.6,min(.9,armc*.8),vec3(.25,.04,.08),vec2(0.));glow(vec3(.7,.12,.22)*arms*.22+vec3(1.,.9,.95)*spines*.4*(.4+.6*pine+.4*open));
 // the light at the arm tips: on while the cloud is let out, a faint glow otherwise
 glow(vec3(.3,.7,1.)*tips*(.25+1.2*ss(5.8,6.5,t)*(1.-ss(9.,10.5,t))));
 // the body: mantle towards +x, the two round fins on it, flapping
 float fl=sin(t*TAU*.75);
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.;vec2 f=l-vec2(.55,sg*.22);f=rot(sg*(.5+.45*fl))*f;float fd=sdEll(f-vec2(0.,sg*.12),vec2(.13,.17*(.6+.4*abs(fl))));
  glassN(fd,normalize(f),.06,vec3(.6,.12,.2),vec3(.75,.18,.28),.6,.2,.8);}
 float md=min(sdEll(l-vec2(.38,0.),vec2(.42,.26)),sdEll(l-vec2(.0,0.),vec2(.2,.22)));
 glassN(md,normalize(l-vec2(.3,0.)),.1,vec3(.5,.1,.18),vec3(.7,.15,.26),.6,.1,.92);
 glow(mix(vec3(.18,.01,.04),vec3(.42,.04,.1),ss(-.2,.2,l.y))*cov(md)*.5);
 // the light organs at the base of the fins: two soft lids of light that open and close
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.;vec2 o=l-vec2(.62,sg*.13);float lid=.5+.5*sin(t*.7+sg);glow(vec3(.5,.85,1.)*exp(-dot(o,o)/(.0012+.002*lid))*(.4+.6*lid));}
 // the eyes: big, blue, with a bright point
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.;vec2 e=l-vec2(.05,sg*.13);float ed=length(e)-.09;
  put(cov(ed)*mix(vec3(.1,.35,.9),vec3(.02,.05,.15),ss(.02,.08,length(e)))*.9,cov(ed),vec3(0.),vec2(0.));
  glow(vec3(.3,.6,1.)*ln(abs(ed),.012)*.6+vec3(.9,.95,1.)*exp(-length(e-vec2(.02,.03))/.012)*.8);}
 leave();
}
