// 17 · Els tetres neó. Under the dark water of the river at night, just below the giant leaves: their ribbed red undersides along the
// surface, their spiny stalks going down into the dark, the moonlight falling in rays (bg.glsl). A school of neon tetras goes round
// and round in a ring, near and far: the near ones bigger, the ones that swim towards or away from us short. The blue line along each
// fish shines and changes colour with the angle at which we see it, and the red of the tail. Twice the whole school turns round, a wave
// that runs through it (the key moments, tau ≈ 5 s and 9.5 s). The colour of the line changes with the angle in the real fish too
// (Yoshioka et al., 2011); the glow is a criterion of the style.
const float SURF=.43;const int NF=34;
// The stalks and undersides of the leaves (at the same places in the world as in scene 16).
void leaves(vec2 q,float t){for(int i=0;i<3;i++){float fi=float(i),x=fi==0.?-.15:fi==1.?.57:-.59,uw=fi==0.?.40:fi==1.?.24:.14;
 float sw=.015*sin(t*.4+fi*2.);float sx=x+sw*(SURF-q.y)*1.5;float st=abs(q.x-sx)-.012;
 float spn=step(.72,vn(vec2(q.y*80.,fi*7.+sign(q.x-sx)*3.)))*ss(.012,.018,abs(q.x-sx))*ss(.028,.018,abs(q.x-sx));
 vec3 sc=vec3(.06,.022,.012)*(.7+.3*fbm2(vec2(q.y*40.,fi)));solid(sc,max(cov(st),spn*.8)*ss(-.7,SURF,q.y)*step(q.y,SURF-.02));glow(vec3(.35,.28,.2)*ln(abs(q.x-sx+.011),.0012)*.10*step(q.y,SURF-.02)*ss(-.7,SURF,q.y));
 float rib=ln(abs(sin((q.x-x)/uw*13.)),.18);float hang=SURF-.012-.018*pow(abs(sin((q.x-x)/uw*13.)),.3)*(1.-abs(q.x-x)/uw);float ud=max(max(abs(q.x-x)-uw,hang-q.y),q.y-SURF);
 solid(mix(vec3(.012,.002,.005),vec3(.045,.010,.018),rib),cov(ud)*.95);glow(vec3(.45,.3,.3)*ln(abs(q.y-hang),.001)*step(abs(q.x-x),uw)*step(q.y,SURF)*.08);}}
// One tetra, side view, facing +x in its frame (length 1), foreshortened by k (1 side on … small head on), the line's hue by hu.
void tetra(vec2 q,vec2 c,float L,float hd,float k,float hu,float t,float s){vec2 f=q-c;if(dot(f,f)>L*L*.5)return;f=rot(hd)*f/L;
 float tw=.05*sin(t*14.+s)*ss(.0,-.5*k,f.x);f.y-=tw*(-f.x/k);
 float body=sdEll(f,vec2(.5*k,.15));float tail=min(sdEll(rot(-.5)*(f-vec2(-.55*k,.05)),vec2(.14*k+.02,.04)),sdEll(rot(.5)*(f-vec2(-.55*k,-.05)),vec2(.14*k+.02,.04)));
 float fin=sdEll(rot(-.6)*(f-vec2(-.08*k,.15)),vec2(.08*k+.01,.03));float d=min(body,min(tail,fin))*L;
 // clear body, silver belly, the red at the back of the belly, the shining line
 float cd=cov(d);put(vec3(.02,.03,.04)*cd,cd*.55,vec3(.75,.85,.9),vec2(0.));
 float cb=cov(body*L);solid(vec3(.55,.60,.65)*.5,cb*ss(.0,-.12,f.y)*.6);
 solid(vec3(.85,.06,.08),cb*ss(.04,-.04,f.y+.02)*ss(.05*k,-.15*k,f.x)*.9);
 vec3 neon=mix(vec3(.10,.85,1.),vec3(.35,.25,1.),hu);float x=f.x/k;float ln0=ln(abs(f.y-.035-.01*x)*L,.0042*L*12.)*ss(.42,.30,x)*ss(-.42,-.30,x);
 glow(neon*ln0*1.1+neon*exp(-abs(f.y-.035)/.08)*ss(.42,.2,x)*ss(-.42,-.2,x)*cb*.15);
 vec2 e=f-vec2(.34*k,.02);solid(vec3(.01),cov((length(e)-.05)*L));glow(vec3(.8,.9,1.)*ln(abs(length(e)-.055)*L,.0008)*.3);}
void scene(vec2 q,float t){
 leaves(q,t);
 // the school: a ring seen from the side; each fish turns when the wave reaches it (tau ≈ 5 and 9.5 s)
 for(int pass=0;pass<2;pass++){for(int i=0;i<NF;i++){float fi=float(i),a0=fi/float(NF)*TAU+.3*h11(fi);
  float w1=ss(4.8+.9*fract(a0/TAU),5.6+.9*fract(a0/TAU),t),w2=ss(9.3+.9*fract(a0/TAU+.5),10.1+.9*fract(a0/TAU+.5),t);float dir=1.-2.*w1+2.*w2;
  // the angle round the ring: it goes on in the new direction after each turn (integrated speed)
  float om=.42+.06*h11(fi+3.);float ph=a0+om*(min(t,4.8)+(t>4.8?-(min(t,9.3)-4.8):0.)+(t>9.3?(t-9.3):0.));
  float R=.36+.06*h11(fi+5.),z=sin(ph),side=pass==0?1.:-1.;if(z*side<0.)continue;
  float x=R*cos(ph)*1.15,y=-.06+.17*(h11(fi+7.)-.5)+.025*sin(t*.7+fi);float sc=1.-.22*z;
  // the heading in the ring's plane: along the ring (±) turning through head-on when the fish turns round
  float turn=(w1*(1.-w1)+w2*(1.-w2))*4.;float hx=-sin(ph)*dir,hz=cos(ph)*dir;vec2 h3=normalize(vec2(hx,hz)+vec2(0.,turn*.0001));
  float k=max(abs(h3.x),.22),hd=h3.x>=0.?0.:PI;hd+=.15*sin(t*1.3+fi)*k;
  tetra(q,vec2(x,y),.078*sc,hd,k,1.-abs(h3.x),t,fi);}}
 // bubbles rising now and then
 for(int i=0;i<4;i++){float fi=float(i),u=fract(t*.12+h11(fi));vec2 c=vec2(-.7+.45*fi+.02*sin(t*3.+fi),-.55+u*1.)  ;float r=.004+.003*h11(fi+2.);float d=length(q-c);
  glow(vec3(.8,.75,.6)*ln(abs(d-r),.0007)*.6*ss(SURF,SURF-.08,c.y));}
}
