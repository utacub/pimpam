// 3 · El banc de plata. A shoal of small silver fish turns as one ball in the rays of light; it stretches into a river, splits in two
// round a pair of blue hunters that cut through it, and closes again. Each fish shines silver, gold or pink as it turns.
vec2 hunter(float t,float k){float u=fract(t/7.+k*.5);return vec2(mix(-ASP-.5,ASP+.5,u)*(k>.5?-1.:1.),.25*sin(u*3.+k*4.)-.05+.12*k);}
vec2 hunterV(float t,float k){return (hunter(t+.05,k)-hunter(t-.05,k))/.1;}
void fishShape(vec2 q,vec2 c,vec2 v,float L,vec3 back,vec3 belly,float sheen,float t,float s){
 vec2 f=q-c;if(dot(f,f)>L*L*1.6)return;float a=atan(v.y,v.x);f=rot(a)*f/L;
 // the body bends with the tail beat
 f.y-=.08*sin(f.x*4.-t*9.-s)*ss(.3,-.6,f.x);
 float body=sdEll(f-vec2(.05,0.),vec2(.55,.13)),tail=max(abs(f.y)-.02-.6*max(-f.x-.42,0.),abs(f.x+.62)-.14),d=min(body,tail)*L;
 float c2=cov(d);if(c2<=0.)return;float up=ss(-.06,.08,f.y);
 vec3 col=mix(belly,back,up)*(.35+.65*sheen)+pal(.1+f.x*.4+s*.13)*.25*sheen*ss(.0,.06,abs(f.y-.01))+vec3(1.)*.35*sheen*ss(.03,.0,abs(f.y+.03));
 float eye=cov((length(f-vec2(.45,.02))-.055)*L);col=mix(col,vec3(.02,.03,.05),eye);
 put(col*c2*.8,c2*.95,vec3(.2,.3,.4),vec2(0.));}
void scene(vec2 q,float t){
 // the ball: its centre wanders, it stretches into a river and closes again; the hunters push the fish away from their path
 vec2 C=vec2(.25*sin(t*.23)-.05,.08*sin(t*.31));float stretch=.5+.5*sin(t*.42-1.2);
 vec2 H0=hunter(t,0.),H1=hunter(t,1.);
 vec2 dq=q-C;if(dot(dq,dq)<1.3){
 for(int i=0;i<64;i++){float fi=float(i),s=h11(fi*1.7+2.),rho=.35+.65*sqrt(h11(fi+.3)),dir=s<.12?-1.:1.;
  float w=dir*(.75+.25*h11(fi+5.))/(.6+rho*.4),ph=fi*2.39996+t*w;
  vec2 R=vec2(.24+.32*stretch,.19-.07*stretch);vec2 p=C+vec2(cos(ph),sin(ph))*R*rho+.03*vec2(sin(t*1.3+fi),cos(t*1.1+fi*1.3));
  vec2 v=vec2(-sin(ph),cos(ph))*R*w;
  // flee from the hunters
  for(int k=0;k<2;k++){vec2 H=k==0?H0:H1,e=p-H;float dd=length(e);vec2 push=e/max(dd,1e-3)*.16*exp(-dd/.12);p+=push;v+=push*3.;}
  float sheen=pow(.5+.5*cos(atan(v.y,v.x)*2.+fi),3.);
  fishShape(q,p,v,.042+.014*h11(fi+9.),vec3(.06,.3,.5),vec3(.75,.82,.9),sheen,t,fi);}}
 // a second, looser group far behind, smaller
 for(int i=0;i<14;i++){float fi=float(i),ph=fi*2.39996-t*.6;vec2 p=vec2(-.55+.08*sin(t*.2),.32)+vec2(cos(ph)*.2,sin(ph)*.08)*(.4+.6*h11(fi));
  fishShape(q,p,vec2(sin(ph),-cos(ph)),.022,vec3(.1,.25,.35)*.6,vec3(.5,.6,.7)*.6,.5+.5*cos(ph*2.),t,fi+70.);}
 // the hunters: two slim blue jacks with a yellow stripe
 for(int k=0;k<2;k++){vec2 H=k==0?H0:H1,v=hunterV(t,float(k));vec2 f=q-H;if(dot(f,f)>.1)continue;f=rot(atan(v.y,v.x))*f/.15;
  f.y-=.06*sin(f.x*3.-t*7.)*ss(.3,-.6,f.x);
  float body=sdEll(f,vec2(.62,.15)),tail=max(abs(f.y)-.03-.9*max(-f.x-.5,0.),abs(f.x+.72)-.18),fin=sdTri(f,vec2(-.05,.13),vec2(.2,.13),vec2(-.12,.32)),d=min(min(body,tail),fin)*.15;
  float c2=cov(d);float up=ss(-.05,.07,f.y);vec3 col=mix(vec3(.75,.85,.9),vec3(.05,.2,.55),up)+vec3(1.,.8,.1)*ss(.025,.0,abs(f.y-.0))*.9;
  col=mix(col,vec3(.02),cov((length(f-vec2(.48,.03))-.04)*.15));put(col*c2*.7,c2,vec3(.1,.2,.3),vec2(0.));}
}
