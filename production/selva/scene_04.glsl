// 5 · El peresós. In the gold of the morning, among the big round leaves of a cecropia lit from behind, a three-toed sloth hangs under
// a branch by its four long limbs, the hooked claws over the wood, its body slung below like a hammock. Slowly it lifts and turns its
// round head towards us, with its pale face, the dark stripe from each eye and its smile (the key moment, tau ≈ 2.5–5 s), and blinks.
// When it moves, small moths fly out of its fur (≈ 4.6–8 s; moths live in the fur of sloths: Pauli et al., 2014) and come back. Its
// baby, clinging to its belly between the arms, peeks out over it (≈ 7.5–10 s). 0.34: redrawn (the first sloth, hugging the trunk,
// was hard to read and its face looked like a mask): a clear hanging silhouette, warm fur, a bigger and friendlier face.
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
// A soft furry edge: the distance d pushed in and out a little along the outline.
float fuzz(float d,vec2 p,float k){return d+k*(fbm2(p*48.)-.5)+k*.35*(vn(p*150.)-.5);}
// Fur colour: warm brown, a faint green of algae in patches, streaks along the hair (direction dir), lighter on top (lit).
vec3 fur(vec2 p,vec2 dir,float k){vec2 a=vec2(dot(p,dir),dot(p,vec2(-dir.y,dir.x)));float st=.82+.18*vn(vec2(a.x*12.,a.y*60.))+.10*(vn(p*36.)-.5);float g=ss(.55,.78,fbm(p*6.+3.));
 return mix(vec3(.115,.078,.046),vec3(.085,.085,.045),g*.35)*st*k;}
// The branch: from the trunk on the right to the left edge; its centre line and radius.
float brY(float x){return .30+(.62-x)*.05;}
// Three claws hooked over the branch at x (k: brightness).
void claws(vec2 q,float x,float k){float y=brY(x);for(int i=0;i<3;i++){float fi=float(i)-1.;vec2 a=vec2(x+.014*fi,y-.012),b=a+vec2(.004,.047),c=b+vec2(-.020,-.007);
 float d=min(sdSeg(q,a,b)-.0050,sdSeg(q,b,c)-mix(.0045,.0022,segU(q,b,c)));solid(vec3(.055,.045,.032)*k,cov(d));glow(vec3(1.,.85,.5)*ln(abs(d),.0008)*.30*k);}}
// A limb from a to b (the hand or foot on the branch), thick r.
float limb(vec2 q,vec2 a,vec2 b,float r){return sdSeg(q,a,b)-mix(r,r*.8,segU(q,a,b));}
// A big leaf of cecropia: lobes in a fan from the stalk, pale silver underneath, lit from behind.
void cecropia(vec2 q,vec2 c,float R,float ang,float t,float s){vec2 p=rot(ang+.03*sin(t*.6+s))*(q-c);if(length(p)>R*1.1)return;float a=atan(p.y,p.x),r=length(p);
 float lobes=8.,la=floor(a/(TAU/lobes)+.5)*(TAU/lobes),da=a-la;float lr=R*(.75+.25*cos(la*2.+s));float w=.36*(1.-.45*pow(r/lr,2.));
 float d=max(abs(da)*r-w*r-.006,r-lr*(1.-.3*da*da*20.));float cv=cov(d);if(cv<=0.)return;
 float vein=exp(-abs(da)*r/.004)+exp(-r/.02);vec3 col=mix(vec3(.22,.34,.06),vec3(.44,.56,.12),.5+.5*sin(s+r*9.))*(1.-.35*vein);
 solid(col,cv);glow(vec3(1.,.85,.4)*ln(abs(d),.0012)*.4);}
// A moth from the fur: small, brownish, wings beating; light on its edges.
void moth(vec2 q,vec2 c,float S,float t,float s){vec2 f=(q-c)/S;if(dot(f,f)>9.)return;float b=abs(sin(t*7.+s));
 float w=min(sdEll(rot(-.6*b)*(f-vec2(-.3,.1)),vec2(.55,.28*(.3+.7*b))),sdEll(rot(.6*b)*(f-vec2(.3,.1)),vec2(.55,.28*(.3+.7*b))));
 float body=sdEll(f,vec2(.12,.45));float d=min(w,body)*S;solid(mix(vec3(.16,.12,.08),vec3(.24,.19,.12),ss(.3,-.3,f.y)),cov(d));glow(vec3(1.,.85,.5)*ln(abs(d),.0008)*.18);}
void scene(vec2 q,float t){
 // leaves far behind, out of focus, and the light through them
 cecropia(q,vec2(-.62,.32),.26,.4,t,1.);cecropia(q,vec2(.72,.40),.24,-.3,t,2.);cecropia(q,vec2(-.30,-.40),.22,2.6,t,3.);
 // the trunk of the cecropia on the right, pale and ringed, and the branch going off to the left
 {float tx=.62+.02*q.y;float td=abs(q.x-tx)-.050;
  vec3 bark=mix(vec3(.40,.38,.30),vec3(.55,.52,.42),.5+.5*sin(q.y*14.))*(.75+.25*fbm2(q*vec2(40.,8.)));bark*=1.-.35*ss(.01,.04,abs(fract(q.y*7.)-.5)*.14);
  bark*=.65+.45*ss(.05,-.05,q.x-tx);solid(bark*.55,cov(td));glow(vec3(1.,.85,.5)*ln(abs(q.x-tx+.050),.0015)*.35);}
 {float d=abs(q.y-brY(q.x))-.034;d=max(d,q.x-.62);vec3 bk=vec3(.15,.12,.08)*(.7+.3*fbm2(q*vec2(14.,60.)))*(.75+.4*ss(-.02,.03,q.y-brY(q.x)));
  float moss=ss(.55,.7,fbm(q*9.))*ss(.0,.03,q.y-brY(q.x)+.01);solid(mix(bk,vec3(.10,.16,.05),moss*.7),cov(d));glow(vec3(1.,.85,.5)*ln(abs(q.y-brY(q.x)-.034),.0013)*.45*step(q.x,.60));}
 // the sloth: breathing, the head lifting and turning to us (ht), a small shift of the hands when it moves (mv), the blinks
 float ht=ss(2.4,5.0,t),br=1.+.015*sin(t*1.6);float mv=ss(4.4,4.8,t)*ss(5.6,5.2,t);float sw=.006*sin(t*.55);
 vec2 o=q-vec2(sw,0.);
 vec2 S1=vec2(.11,.11),S2=vec2(.05,.12),P1=vec2(-.17,.10),P2=vec2(-.23,.11);
 vec2 A1=vec2(.15+.01*mv,brY(.15)-.006),A2=vec2(.03,brY(.03)-.006),F1=vec2(-.13,brY(-.13)-.006),F2=vec2(-.28,brY(-.28)-.006);
 // the far arm and leg, behind the body, in shadow
 {float d=min(fuzz(limb(o,S2,A2,.032),o,.008),fuzz(limb(o,P2,F2,.034),o,.008));solid(fur(o,vec2(0.,1.),.62),cov(d));}
 claws(q,A2.x+sw,.7);claws(q,F2.x+sw,.7);
 // the body, slung under the branch: back down, belly up towards the wood
 vec2 bo=o-vec2(-.05,.07);bo.y/=br;bo=rot(-.06)*bo;
 float body=smin(sdEll(bo,vec2(.205,.115)),sdEll(bo-vec2(-.13,.015),vec2(.10,.10)),.06);body=fuzz(body,o,.010);
 vec3 bc=fur(o,vec2(0.,-1.),1.)*(.62+.55*ss(-.11,.09,bo.y));solid(bc,cov(body));
 glow(vec3(1.,.82,.45)*ln(abs(body),.002)*.35*ss(-.02,.08,bo.y));
 // the baby on the belly: a furry back, then its head peeks up over its mother (pk)
 float pk=ss(7.4,8.4,t)*ss(10.4,9.6,t);
 {vec2 bb=o-vec2(-.04,.165);float d=fuzz(sdEll(bb,vec2(.065,.04)),o,.008);solid(fur(o,vec2(1.,0.),.92),cov(d));
  vec2 bh=o-vec2(.035,.175+.035*pk);float hd=fuzz(length(bh)-.038,o,.007);solid(fur(o,vec2(0.,-1.),1.),cov(hd)*ss(.0,.2,pk+.05));
  vec2 bf=bh-vec2(.004,-.004);float face=sdEll(bf,vec2(.026,.022));solid(vec3(.32,.25,.15),cov(face)*pk);
  for(int e=-1;e<=1;e+=2){float fe=float(e);vec2 ep=bf-vec2(fe*.011,.004);solid(vec3(.07,.045,.03),cov(sdEll(rot(-fe*.5)*(ep-vec2(fe*.005,-.002)),vec2(.011,.0045)))*pk);
   solid(vec3(.01),cov(length(ep)-.0042)*pk);solid(vec3(.9),cov(length(ep-vec2(-.0012,.0015))-.0013)*pk);}
  solid(vec3(.05,.03,.02),cov(sdEll(bf-vec2(0.,-.008),vec2(.0055,.0038)))*pk);}
 // the near arm and leg, in front, and their claws over the branch
 {float d=min(fuzz(limb(o,S1,A1,.035),o,.008),fuzz(limb(o,P1,F1,.037),o,.008));solid(fur(o,vec2(0.,1.),1.05),cov(d));glow(vec3(1.,.82,.45)*ln(abs(d),.0016)*.28);}
 claws(q,A1.x+sw,1.);claws(q,F1.x+sw,1.);
 // the head: round and furry, at the front end of the body; it lifts and turns from looking along the branch to looking at us
 vec2 H=mix(vec2(.205,.035),vec2(.19,.065),ht);vec2 h=rot(mix(.35,-.08,ht))*(o-H);
 float head=fuzz(length(h*vec2(1.,1.06))-.088,o,.010);head=smin(head,body+.004,.03);solid(fur(o,vec2(0.,-1.),1.12)*(.85+.3*ss(-.06,.08,h.y)),cov(head));
 glow(vec3(1.,.82,.45)*ln(abs(head),.002)*.32*ss(-.05,.05,h.y));
 // the face: a warm pale mask, the dark stripe from each eye backwards, round dark eyes with a light, the dark nose, the smile
 float fx=mix(.030,.0,ht);vec2 fc=h-vec2(fx,-.010);float fw=mix(.052,.066,ht);
 float face=sdEll(fc,vec2(fw,.054));solid(vec3(.36,.28,.17),cov(face));solid(vec3(.42,.33,.21),cov(sdEll(fc-vec2(0.,-.018),vec2(fw*.6,.026)))*.6);
 float bl=ss(.0,.08,abs(fract(t*.13+.4)-.5)-.45);
 for(int e=-1;e<=1;e+=2){float fe=float(e);float ex=mix(fe<0.?-.012:.030,fe*.026,ht);vec2 ep=fc-vec2(ex,.010);
  float side=mix(fe<0.?.65:1.,1.,ht);
  vec2 sp=rot(-fe*.45)*(ep-vec2(fe*.016*side,-.006));solid(vec3(.10,.065,.04),cov(sdEll(sp,vec2(.026*side,.0095))));
  float er=.0105*side;solid(vec3(.012,.008,.006),cov(sdEll(ep,vec2(er,.0105*(1.-.9*bl)))));
  solid(vec3(.95),cov(length(ep-vec2(-.003,.004))-.0032)*(1.-bl));}
 vec2 np=fc-vec2(mix(.010,0.,ht),-.020);solid(vec3(.06,.035,.025),cov(sdEll(np,vec2(.013,.009))));solid(vec3(.4),cov(length(np-vec2(-.004,.003))-.0025)*.5);
 vec2 mp=fc-vec2(mix(.008,0.,ht),-.034);float m=abs(length(mp-vec2(0.,.024))-.024)-.0022;solid(vec3(.14,.08,.05),cov(max(m,mp.y-.008))*ss(.022,.0,abs(mp.x)));
 // moths: out of the fur when it moves, flutter round, and settle again
 for(int i=0;i<5;i++){float fi=float(i),t0=4.6+.35*fi,u=t-t0;if(u<0.||u>4.)continue;vec2 st=vec2(-.20+.07*fi,.05-.02*fi);
  float back=ss(2.8,4.,u);vec2 p=st+vec2(.12*sin(u*1.3+fi*2.)+.06*u*(h11(fi)-.4),-.10*ss(0.,1.,u)+.04*sin(u*2.1+fi))*(1.-back);moth(q,p,.020,t,fi);}
}
