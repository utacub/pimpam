// 1 · La flota de veles blaves. At the surface: a Portuguese man o' war (Physalia) drifts across with its iridescent float and long
// blue fishing tentacles that contract and stretch again; a fleet of by-the-wind sailors (Velella) and blue buttons (Porpita) bob
// on the waves; a little group of man-of-war fish (Nomeus), silver with blue blotches, swims along with it among the tentacles,
// weaving in slow figures of eight and always facing the way they go.
float surfQ(float x){float wx=uScene.x+x*uScene.z;float sy=.035*sin(wx*7.+uG*1.1)+.02*sin(wx*13.-uG*1.7);return (sy-uScene.y)/uScene.z;}
void velella(vec2 q,float x0,float s,float t,float seed){
 float x=x0,y=surfQ(x)-.008*s;vec2 l=(q-vec2(x,y))/s;l=rot(.2*sin(t*1.3+seed)+(surfQ(x+.02)-surfQ(x-.02))*8.)*l;if(dot(l,l)>.05)return;
 // the short fringe of tentacles under the float
 float dy=-.015-l.y;if(dy>0.&&dy<.06&&abs(l.x)<.085){float k=dy/.06,x1=l.x+.01*sin(dy*70.-t*3.+seed);glow(vec3(.1,.35,1.)*ln(abs(fract(x1*36.)-.5)/36.*s,.0025)*(1.-k)*ss(.085,.06,abs(l.x))*.6);}
 // the float: an oval of cobalt blue with concentric chambers and a darker rim
 float d=sdEll(l,vec2(.085,.02))*s;float rings=.5+.5*sin(length(l*vec2(1.,4.))*130.-seed);float c=cov(d),h=sat(-d/(.016*s));
 put(c*(mix(vec3(.01,.04,.35),vec3(.08,.3,.95),rings*.5+.5*h)*.5)+vec3(.2,.5,1.)*ln(abs(d),.002)*.5,c*.92,vec3(.05,.2,.8),vec2(0.));
 // the sail: a clear triangle standing in the air, slanted
 float sail=sdTri(l,vec2(-.06,.012),vec2(.055,.012),vec2(.015,.085))*s;float cs=cov(sail);
 put(cs*vec3(.3,.5,.8)*.12+vec3(.55,.8,1.)*ln(abs(sail),.0018)*.45,cs*.3,vec3(.9,.95,1.),vec2(0.));}
void porpita(vec2 q,float x0,float s,float t,float seed){
 float y=surfQ(x0)-.008*s;vec2 l=(q-vec2(x0,y))/s;if(dot(l,l)>.06)return;float k=0.,kn=0.;
 // tentacles radiating down and out, with blue knobs
 for(int i=0;i<11;i++){float a=(float(i)/10.-.5)*2.5+.08*sin(t*1.2+float(i));vec2 dir=vec2(sin(a),-cos(a));float along=dot(l,dir),per=dot(l,vec2(-dir.y,dir.x));
  float wv=.008*sin(along*45.-t*2.5+float(i)*1.7);if(along>.02&&along<.16){k+=ln(abs(per-wv)*s,.0022)*(1.-along/.16);kn+=exp(-length(vec2(mod(along,.032)-.016,per-wv))/.0055)*(1.-along/.2);}}
 glow(vec3(.05,.65,1.)*k*.45+vec3(.15,.8,1.)*kn*.5);
 float d=sdEll(l,vec2(.055,.016))*s,c=cov(d);float rg=length(l/vec2(.055,.016));put(c*mix(vec3(.9,.65,.15),vec3(.05,.3,.95),ss(.3,.8,rg))*.55,c*.9,vec3(.02,.1,.35),vec2(0.));}
// A man-of-war fish of half-length L at c, swimming along v: silver, blue blotches on the back, dark blue fins, a forked tail.
void nomeus(vec2 q,vec2 c,vec2 v,float L,float t,float s){
 vec2 f=q-c;if(dot(f,f)>L*L*1.8)return;f=rot(atan(v.y,v.x))*f/L;f.y-=.07*sin(f.x*5.-t*9.-s)*ss(.2,-.8,f.x);
 float body=sdEll(f-vec2(.05,0.),vec2(.56,.18));
 float tail=max(abs(f.y)-.03-.75*max(-f.x-.42,0.),abs(f.x+.62)-.18);tail=max(tail,-sdEll(f-vec2(-.84,0.),vec2(.12,.08)));
 float fins=min(sdTri(f,vec2(-.28,.12),vec2(.16,.14),vec2(-.16,.3)),sdTri(f,vec2(.02,-.12),vec2(.24,-.14),vec2(-.04,-.34)));
 float d=min(min(body,tail),fins)*L;float cb=cov(d);if(cb<=0.&&d>.01)return;
 float back=ss(-.06,.1,f.y),spots=ss(.3,.6,.5+.5*sin(f.x*9.+1.5+.8*sin(f.y*7.)));
 vec3 col=mix(vec3(.62,.70,.78),vec3(.30,.42,.60),back);col=mix(col,vec3(.02,.08,.36),spots*ss(-.12,.05,f.y)*.95);
 col=mix(col,vec3(.03,.10,.42),cov(fins*L)*(1.-cov(body*L)));col=mix(col,vec3(.05,.14,.42),cov(tail*L)*(1.-cov(body*L))*.6);
 put(cb*col*.55,cb*.95,vec3(.1,.15,.25),vec2(0.));
 glow(vec3(.6,.85,1.)*ln(abs(d),.0025)*.22);
 vec2 e=f-vec2(.4,.03);put(cov((length(e)-.07)*L)*vec3(.7,.8,.9)*.4,cov((length(e)-.07)*L),vec3(0.),vec2(0.));put(vec3(0.),cov((length(e)-.04)*L),vec3(0.),vec2(0.));}
void scene(vec2 q,float t){
 // the man o' war crosses from right to left while the wind pushes it
 float px=.62-.07*t+.04*sin(t*.4),py=surfQ(px);float drift=-.07;
 // fishing tentacles: they contract (pulling prey up) and stretch again, each on its own clock
 float ten=0.,beads=0.;
 for(int i=0;i<9;i++){float fi=float(i),x0=px-.07+fi*.022+.01*sin(fi*2.3),cyc=.5+.5*sin(t*.55+fi*1.7),L=(.45+.4*h11(fi+3.))*(.55+.45*cyc);
  float dy=py-.03-q.y;if(dy>0.&&dy<L){float k=dy/L,x=x0-drift*dy*1.6+.035*dy*sin(dy*9.-t*1.4+fi)+.012*sin(dy*30.+t*2.+fi*4.)*(1.-cyc);
   float d=abs(q.x-x);ten+=ln(d,.0045*(1.-.5*k))*(1.-k*.7);
   beads+=exp(-length(vec2(d,(mod(dy+fi*.013,.03)-.015)*.8))/.006)*(1.-k)*(.4+.6*cyc);}}
 glow(vec3(.05,.22,1.)*ten*.5+vec3(.45,.2,1.)*beads*.35+vec3(.1,.6,1.)*beads*.2);
 // the iridescent float (pneumatophore) with its pink crest
 vec2 l=rot(.12*sin(t*1.1)+(surfQ(px+.03)-surfQ(px-.03))*4.)*(q-vec2(px,py+.01));
 float fd=sdEll(l-vec2(0.,.0),vec2(.2,.055))+.012*sin(l.x*30.)*ss(.0,.04,l.y);
 vec2 fg=vec2(dFdx(fd),dFdy(fd));
 float crest=abs(l.y-.045-.022*sin(l.x*28.+t*2.)*ss(.2,.0,abs(l.x)))-.007;
 glass(fd,fg,.05,vec3(.35,.28,.95),vec3(.6,.45,1.),1.4,.6,.9);glow(cov(fd)*mix(vec3(.25,.12,.9),vec3(.95,.35,.75),ss(-.02,.05,l.y))*.5);
 glow((vec3(1.,.4,.75)*ln(abs(crest),.004)+vec3(1.,.5,.8)*cov(crest)*.6)*ss(.21,.12,abs(l.x)));
 glow(vec3(.6,.35,1.)*exp(-length(l*vec2(1.,3.))/.06)*.25);
 // the fleet: sailors and buttons spread along the whole surface, drifting with the waves
 for(int i=0;i<7;i++){float fi=float(i),x0=-ASP-.1+mod(fi*.33+t*(.02+.012*h11(fi))+.1*h11(fi+9.),2.*ASP+.2);velella(q,x0,.75+.5*h11(fi*1.3),t,fi);}
 for(int i=0;i<4;i++){float fi=float(i),x0=-ASP+mod(fi*.47+.3-t*.015,2.*ASP);porpita(q,x0,.8+.4*h11(fi+20.),t,fi);}
 // the man-of-war fish: they travel with the float (its speed is theirs) and weave slow figures of eight among the tentacles, so they
 // always swim forwards, to the left
 float pv=-.07+.016*cos(t*.4);
 for(int i=0;i<6;i++){float fi=float(i),w=.42+.16*h11(fi+1.),a=t*w+fi*2.4,b=2.*t*w+fi*1.3;
  vec2 c=vec2(px-.09+.18*h11(fi+5.)+.07*sin(a),py-.13-.2*h11(fi+7.)+.03*sin(b));
  vec2 v=vec2(pv+.07*w*cos(a),.06*w*cos(b));nomeus(q,c,v,.042+.012*h11(fi+9.),t,fi*3.);}
}
