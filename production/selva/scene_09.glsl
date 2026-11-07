// 10 · Granotes de vidre. Two glass frogs asleep on a broad leaf over a stream, a clutch of eggs hanging from the edge of the leaf. Asleep,
// they are almost clear glass: the green is faint, the heart pale, the blood hidden in the liver, which shines like a mirror (Taboada
// et al., 2022). At tau ≈ 4.2 s the big one wakes: the blood comes back from the heart outwards (red veins, the body greener and less
// clear) and its eyes open (the key moment, ≈ 5.5 s); it looks round, blinks, and hops towards the eggs (≈ 8 s). A drop grows at the
// tip of the leaf, falls and rings the water of the stream.
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
vec2 TIP=vec2(-.44,-.13);const float LBX=1.15,LBY=-.03;
float leafMid(float x){float u=sat((x-TIP.x)/(LBX-TIP.x));return mix(TIP.y,LBY,u)+.035*sin(u*PI);}
float leafHW(float x){float u=sat((x-TIP.x)/(LBX-TIP.x));return .105*pow(sin(PI*pow(u,.55)*.9+.06),.8);}
// A glass frog sitting, facing left, in its own frame (unit: its length). blood: 0 asleep (clear) … 1 awake; eye: 0 closed … 1 open;
// jump: 0 sitting … 1 legs stretched; beat: the heart.
void frog(vec2 q,vec2 c,float L,float blood,float eye,float jump,float beat,float t,float s){
 vec2 f=(q-c)/L;if(abs(f.x)>.85||f.y<-.45||f.y>.45)return;enter(L);
 vec3 tint=mix(vec3(.80,1.,.85),vec3(.55,.95,.35),blood);float opa=mix(.30,.62,blood);
 // legs (behind the body): the hind leg folded (stretched back while it jumps), the front leg
 vec2 H=vec2(.30,.0),K=mix(vec2(.0,-.10),vec2(.42,-.10),jump),A=mix(vec2(.30,-.15),vec2(.62,-.13),jump),T=mix(vec2(.05,-.17),vec2(.74,-.17),jump);
 float lg=min(min(sdSeg(f,H,K)-.065,sdSeg(f,K,A)-.048),sdSeg(f,A,T)-.028);lg=min(lg,min(length(f-T)-.03,length(f-T-vec2(-.04,.012))-.024));
 vec2 Sh=vec2(-.15,-.06),E=vec2(-.18,-.13),Hd=mix(vec2(-.30,-.17),vec2(-.36,-.12),jump);float fl=min(sdSeg(f,Sh,E)-.035,sdSeg(f,E,Hd)-.03);fl=min(fl,length(f-Hd)-.03);
 float legs=min(lg,fl);vec2 ln0=normalize(f-vec2(.15,-.1)+1e-4);glassN(legs,ln0,.05,tint,vec3(.35,.5,.35),.12,s,opa*.9);solid(mix(vec3(.18,.38,.16),vec3(.36,.72,.14),blood),cov(legs)*mix(.25,.55,blood));
 // bones and veins in the legs
 float bones=min(min(sdSeg(f,H,K),sdSeg(f,K,A)),min(sdSeg(f,A,T),min(sdSeg(f,Sh,E),sdSeg(f,E,Hd))));
 glow(vec3(.85,.9,.85)*ln(bones,.006)*.18*cov(legs));
 glow(vec3(1.,.12,.10)*ln(abs(bones-.022),.004)*blood*.5*cov(legs));
 // the body and the head, one piece of glass
 vec2 bq=rot(.15)*(f-vec2(.06,.02));float body=sdEll(bq,vec2(.36,.17)),head=sdEll(f-vec2(-.25,-.01),vec2(.19,.13));float bd=smin(body,head,.08);
 vec2 bn=normalize(f-vec2(-.02,-.03)+1e-4);glassN(bd,bn,.10,tint,vec3(.40,.55,.40),.15,s+1.,opa);
 solid(mix(vec3(.20,.42,.18),vec3(.42,.80,.16),blood)*(.8+.3*ss(-.1,.15,f.y)),cov(bd)*mix(.38,.70,blood));glow(vec3(.7,1.,.6)*ln(abs(bd),.004)*.25);
 float inb=cov(bd);
 // inside: the spine and the skull (pale), the liver (a mirror while asleep, dark red awake), the gut, the heart beating
 glow(vec3(.8,.85,.8)*ln(abs(length((f-vec2(.02,-.25))*vec2(1.,1.6))-.37),.008)*.15*inb*ss(-.35,.3,f.x));
 float liv=sdEll(f-vec2(.03,-.05),vec2(.09,.05));solid(mix(vec3(.85,.88,.90),vec3(.35,.04,.04),blood),cov(liv)*inb*.85);
 glow(vec3(1.)*exp(-length(f-vec2(.0,-.03))/.03)*.25*(1.-blood)*inb);
 float gut=sdEll(f-vec2(.15,-.06),vec2(.07,.045));solid(vec3(.75,.80,.70)*.7,cov(gut)*inb*.6);
 float hr=sdEll(f-vec2(-.10,-.07),vec2(.045,.04)*(1.+.18*beat));vec3 hc=mix(vec3(.55,.30,.32)*.6,vec3(1.,.10,.12),blood);solid(hc,cov(hr)*inb);glow(hc*exp(-max(hr,0.)/.03)*.25*inb*(.3+blood));
 // the blood coming back: a red wave from the heart through the body
 float front=blood*.9;glow(vec3(1.,.15,.12)*ln(abs(length(f-vec2(-.1,-.07))-front),.02)*ss(.0,.2,blood)*ss(1.,.7,blood)*.3*inb);
 // pale yellow spots on the back when awake
 glow(vec3(1.,1.,.5)*step(.86,vn(f*28.))*ss(-.02,.1,f.y)*inb*.25*blood);
 // the eye: gold with a fine net and a dark pupil across; the lid, clear green, closes over it
float mouth=abs(f.y+.05+.04*ss(-.45,-.2,f.x)*(f.x+.2))-.004;solid(vec3(.05,.12,.05),cov(max(mouth,max(f.x+.43,-.17-f.x)))*.7);
 vec2 ec=f-vec2(-.25,.105);float er=length(ec)-.088;
 if(er<.02){solid(vec3(.95,.82,.45)*(.75+.25*vn(ec*90.)),cov(er));solid(vec3(.02),cov(sdEll(ec-vec2(-.01,0.),vec2(.04,.018)*mix(.2,1.,eye)))*eye);
  solid(vec3(1.),cov(length(ec-vec2(.02,.03))-.012)*.8*eye);
  float lid=ec.y-mix(-.095,.095,eye);solid(mix(vec3(.30,.50,.30),vec3(.35,.62,.22),blood),cov(er)*cov(-lid)*.95);solid(vec3(.04,.10,.04),cov(abs(lid)-.006)*cov(er)*(1.-eye)*.8);
  glow(vec3(.9,1.,.85)*ln(abs(er),.004)*.4);}
 leave();}
// One egg of the clutch: a glass ball with a curled tadpole inside that wriggles.
void egg(vec2 q,vec2 c,float r,float t,float s){vec2 d=q-c;float dl=length(d);if(dl>r*1.3)return;
 glassN(dl-r,d/max(dl,1e-4),r*.8,vec3(.85,1.,.9),vec3(.35,.45,.38),.1,s,.45);solid(vec3(.25,.35,.25),cov(dl-r)*.25);
 vec2 e=rot(.3*sin(t*2.+s*5.)+s)*d/r;float body=length(e-vec2(.1,.05))-.32,tail=sdSeg(e,vec2(-.1,0.),vec2(-.45,-.3+.2*sin(t*4.+s)))-.1;
 solid(vec3(.05,.06,.05),cov(min(body,tail)*r)*.85);}
void scene(vec2 q,float t){
 // the stream below: dark water running to the left, light on its ripples, rings where the drops fall
 if(q.y<-.24){float y=q.y+.24;vec3 wc=mix(vec3(.008,.035,.035),vec3(.002,.012,.014),ss(0.,-.25,y));
  float st=pow(fbm(vec2((q.x+t*.07)*3.,y*90.)),3.)*1.6+pow(vn(vec2((q.x+t*.12)*14.,y*160.)),8.)*.8;
  wc+=vec3(.25,.55,.45)*st*.10*ss(-.26,-.02,y);wc*=1.-.6*ss(.6,1.,1.-abs(q.x-.3)/.8)*ss(-.12,-.02,y)*ss(-.3,-.1,y);
  for(int k=0;k<3;k++){float tk=3.5+float(k)*3.8,u=t-tk;if(u<0.||u>2.2)continue;vec2 rp=(q-vec2(TIP.x+.005,-.36))*vec2(1.,3.2);float rr=u*.09;wc+=vec3(.6,.9,.8)*ln(abs(length(rp)-rr),.0025)*(1.-u/2.2)*.6+vec3(.6,.9,.8)*ln(abs(length(rp)-rr*.6),.002)*(1.-u/2.2)*.3;}
  solid(wc,ss(.0,-.004,y)*.92);glow(vec3(.4,.7,.6)*ln(abs(y),.002)*.3);}
 // the leaf: dark green, lighter where the light goes through, a midrib and side veins, a wet shine, a bright edge
 float my=leafMid(q.x),hw=leafHW(q.x);float v=(q.y-my)/max(hw,1e-3);float ld=(abs(q.y-my)-hw);ld=max(ld,TIP.x-q.x);
 if(ld<.01){float u=(q.x-TIP.x)/(LBX-TIP.x);float vein=exp(-abs(q.y-my)/.003)*.7+.45*exp(-abs(fract((q.x-TIP.x)*11.+abs(v)*1.3)-.5)*9.)*ss(.1,.5,abs(v));
  float fleck=ss(.55,.8,fbm(q*vec2(5.,9.)+3.));vec3 lc=mix(vec3(.006,.035,.015),vec3(.04,.12,.03),ss(-1.,.7,v))*(.7+.3*fbm2(q*14.));lc+=vec3(.20,.32,.04)*fleck*.5;lc*=1.-.45*vein;lc+=vec3(.5,.8,.6)*pow(ss(.2,1.,1.-abs(v-.35)),8.)*.08;
  solid(lc,cov(ld));glow(vec3(.6,.95,.6)*ln(abs(ld),.0015)*.35);}
 // the clutch of eggs, hanging under the edge of the leaf
 for(int i=0;i<11;i++){float fi=float(i);vec2 c=vec2(-.27+.08*h11(fi+1.)+.04*sin(fi*2.4),leafMid(-.24)-leafHW(-.24)-.016-.06*h11(fi+5.));egg(q,c,.022+.005*h11(fi+3.),t,fi);}
 // the small frog, asleep all the time, its heart beating slowly
 frog(q,vec2(.55,leafMid(.55)+.07),.34,0.,0.,0.,.5+.5*sin(t*4.4),t,7.);
 // the big frog: wakes, opens its eyes, blinks, hops towards the eggs
 float blood=ss(4.2,6.2,t),eye=ss(5.1,5.6,t)*(1.-ss(.0,.08,.12-abs(t-7.2))),hop=ss(8.,8.7,t);
 float jx=mix(.10,-.06,hop),jy=sin(hop*PI)*.11,jump=sin(hop*PI);
 frog(q,vec2(jx,leafMid(jx)+.095+jy),.48,blood,eye,jump,pow(.5+.5*sin(t*mix(4.4,9.,blood)),3.),t,1.);
 // the drop at the tip: it grows, falls, and is gone into the water
 for(int k=0;k<3;k++){float tk=3.5+float(k)*3.8,u=t-(tk-3.2);if(u<0.||u>3.4)continue;float r=.004+.008*ss(0.,2.6,u),fall=max(0.,u-2.7);
  vec2 c=vec2(TIP.x+.005,TIP.y-.008-r-fall*fall*1.9);if(c.y<-.36)continue;vec2 d=q-c;float dl=length(d*vec2(1.,.85));
  put(vec3(0.),cov(dl-r)*.9,vec3(1.05),-d*5.*SC);glow(vec3(1.)*exp(-length(d-r*vec2(-.3,.35))/(r*.18))*.7*cov(dl-r)+vec3(.8,1.,.9)*ln(abs(dl-r),.0008)*.4);}
}
