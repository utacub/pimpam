// 14 · Cuques de llum. Night falls among the ferns. Fireflies drift between the fronds, each lighting up and fading slowly in its own
// time (never together; each one less than once every two seconds). On a fern in the middle sits a headlight beetle, its two green
// lights steady on its back: it opens its wing cases and takes off (the key moment, tau ≈ 3.0–4.0 s), showing a warm light under its
// belly as it flies, and lands on another frond (≈ 9 s). That the headlight beetle has two lights on its back and one under its belly
// shown in flight follows the usual descriptions of Pyrophorus; their exact colours here are a criterion of the design.
// A fern frond from b along the angle a, length len, its leaflets; dark against the dusk, with a faint rim of light.
float frond(vec2 q,vec2 b,float a,float len,float bend,float t,float s){vec2 d0=vec2(cos(a),sin(a)),n=vec2(-d0.y,d0.x);vec2 l=q-b;float u=dot(l,d0)/len;if(u<-.05||u>1.1)return 1e5;
 float uu=sat(u);float off=bend*uu*uu*len+.006*sin(t*.6+s+uu*3.);float v=dot(l,n)-off;float w=.20*len*(1.-uu)*(.35+.65*sin(PI*min(uu*1.3,1.)));
 float sc=abs(sin(uu*len*26.+s));float leaf=abs(v)-w*(.70+.30*sqrt(sc))+.004*ss(.3,.0,sc);float rach=abs(v)-.004*(1.-uu);return max(min(leaf,rach),max(-u,u-1.)*len);}
// A firefly: a small dark body and its light, which rises and fades (I).
void firefly(vec2 q,vec2 c,float I){float d=length(q-c);solid(vec3(.02,.015,.01),cov(d-.004));glow(vec3(.80,1.,.30)*(exp(-d/.006)*.9+exp(-d/.035)*.18)*I);}
// The headlight beetle, side view facing dir (unit S ≈ its length): dark brown; two green lights on its back (steady), its wing cases
// open in flight (op) with the wings a blur, a warm light under its belly shown in flight.
void headlight(vec2 q,vec2 c,float S,float dir,float op,float t){vec2 f=(q-c)/S;f.x/=sdir(dir);if(dot(f,f)>6.)return;
 vec3 br=vec3(.035,.025,.018);
 float body=min(sdEll(f-vec2(-.12,0.),vec2(.42,.17)),sdEll(f-vec2(.30,.04),vec2(.18,.15)));
 if(op>.01){float bl=ss(.5,.9,op);glow(vec3(1.,.55,.15)*(exp(-length((f-vec2(-.12,-.16))*vec2(.6,1.))/.10)*.5)*bl*S*12.);
  float w=sdEll(rot(-.5-.3*sin(t*38.))*(f-vec2(-.05,.25)),vec2(.55,.16));put(vec3(.03,.03,.05)*cov(w*S)*op,cov(w*S)*.35*op,vec3(1.),vec2(0.));}
 solid(br*(.8+.4*ss(-.1,.15,f.y)),cov(body*S));
 // the wing cases: closed along the back, raised in flight
 {vec2 e=rot(-.9*op)*(f-vec2(.12,.12));float d=sdEll(e-vec2(-.30,0.),vec2(.32,.07));solid(br*1.4,cov(d*S));glow(vec3(.8,.9,1.)*ln(abs(d)*S,.0006)*.25);}
 // the two lights on the back of the head shield
 for(int k=0;k<2;k++){vec2 lp=f-vec2(.26+.12*float(k),.13);float d=length(lp*vec2(1.,1.3))-.050;solid(vec3(.55,1.,.40),cov(d*S));glow(vec3(.50,1.,.35)*(exp(-length(lp)/.10)*.20+exp(-length(lp)/.35)*.05));}
 // legs and antennae
 for(int k=0;k<3;k++){float fk=float(k);solid(br,cov((sdSeg(f,vec2(-.20+.18*fk,-.10),vec2(-.28+.25*fk,-.30+.14*op))-.02)*S));}
 solid(br,cov((sdSeg(f,vec2(.44,.08),vec2(.62,.16))-.015)*S));}
void scene(vec2 q,float t){
 // ferns in the middle distance, faint
 for(int k=0;k<5;k++){float fk=float(k);vec2 b=vec2(-1.+.5*fk+.1*h11(fk),-.45);for(int j=0;j<4;j++){float a=1.0+.38*float(j)+.1*h11(fk*4.+float(j));
  float d=frond(q,b,a,.45+.15*h11(fk+float(j)),-.25*sign(cos(a)),t,fk*3.+float(j));solid(vec3(.010,.008,.022),cov(d));glow(vec3(.5,.4,.9)*ln(abs(d),.0008)*.07);}}
 // the fireflies: drifting, each pulsing in its own time
 for(int i=0;i<16;i++){float fi=float(i);float P=2.4+1.6*h11(fi+3.),ph=h11(fi+7.);float u=fract(t/P+ph);float I=exp(-pow((u-.3)/.09,2.));
  vec2 c=vec2(-ASP+2.*ASP*h11(fi+1.)+.10*sin(t*.23+fi*2.)+.05*sin(t*.61+fi),-.35+.75*h11(fi+2.)+.06*sin(t*.31+fi*1.3)+.03*sin(t*.9+fi));firefly(q,c,I);}
 // the near ferns: the one in the middle where the beetle sits, one on the left, one on the right
 vec2 F0=vec2(-.30,-.62);float fa=1.22,fl=.95;
 {float d=frond(q,F0,fa,fl,-.20,t,1.);d=min(d,frond(q,F0,fa+.5,.75,.25,t,2.));solid(vec3(.010,.010,.024),cov(d));glow(vec3(.6,.5,1.)*ln(abs(d),.001)*.18);}
 {float d=min(frond(q,vec2(.55,-.62),1.7,.85,.30,t,4.),frond(q,vec2(.55,-.62),2.2,.70,.25,t,5.));solid(vec3(.010,.010,.024),cov(d));glow(vec3(.6,.5,1.)*ln(abs(d),.001)*.18);}
 // the headlight beetle: sits, opens its wing cases, takes off, flies in an arc, lands on the right fern
 vec2 S0=F0+vec2(cos(fa),sin(fa))*fl*.62+vec2(-sin(fa),cos(fa))*(-.20*.62*.62*fl)+vec2(.0,.03);vec2 S1=vec2(.42,.20);
 float op=ss(2.9,3.4,t)*ss(9.4,8.9,t);float fly=ss(3.4,8.9,t);float e=fly*fly*(3.-2.*fly);
 vec2 p=mix(S0,S1,e)+vec2(.25*sin(PI*e)*sin(e*6.),.30*sin(PI*e));p+=vec2(.01*sin(t*3.),.012*sin(t*4.2))*op*(1.-step(8.9,t));
 float dir=fly>0.&&fly<1.?sign(cos(e*6.)*.3+1.):1.;
 headlight(q,p,.11,dir,op,t);
 // grass and the dark front frond, bottom left
 {float d=frond(q,vec2(-ASP-.10,-.62),.75,.75,.20,t,8.);for(int k=0;k<14;k++){float fk=float(k),x=-ASP+2.*ASP*h11(fk+40.);vec2 a=vec2(x,-.52),b=a+vec2(.05*sin(fk*3.)+.01*sin(t*.5+fk),.10+.08*h11(fk+41.));
  d=min(d,sdSeg(q,a,b)-.004*(1.-segU(q,a,b)));}solid(vec3(.006,.006,.014),cov(d));}
}
