// 15 · Els teixidors. In the crown of an acacia, where weaver nests hang from the tips of the branches. A male weaver (yellow, black
// mask, red eye) is weaving his green nest: he threads strips of fresh grass through the wall, pulling and tucking (≈ 2–4.4 s). The key
// moment (≈ 4.6–7 s): he hangs upside down under his nest and flaps his wings, showing off. A female (olive yellow, no mask) comes, looks
// the nest over and goes in by the entrance at the bottom; he sings on the twig. Weaving: Collias and Collias (1962), through a secondary source; the hanging display
// is not verified for these species (CANVIS).
// A weaver: ba body angle (towards the head), wing: −1 folded else flap phase (−1..1); fem: female colours; sing: bill open.
void weaver(vec2 q,vec2 c,float s,float dir,float ba,float bang,float wing,float fem,float sing,float bl){vec2 f=(q-c)/s;f.x/=sdir(dir);if(dot(f,f)>.5)return;float px=PX/s;
 vec3 yel=fem>.5?vec3(.50,.45,.12):vec3(.78,.60,.03),blk=vec3(.03,.025,.02),olv=fem>.5?vec3(.30,.28,.10):vec3(.40,.34,.06),bll=fem>.5?vec3(.55,.48,.36):blk*2.;
 vec2 a=vec2(cos(ba),sin(ba)),n=vec2(-a.y,a.x);vec2 bq=vec2(dot(f,a),dot(f,n));
 vec2 db=vec2(cos(bang),sin(bang)),pb=vec2(-db.y,db.x);if(pb.y<0.)pb=-pb;vec2 H=a*.17;
 float body=sdEll(bq,vec2(.17,.105));float tail=sdCap(bq,vec2(-.13,0.),vec2(-.30,0.),.035,.045);float head=length(f-H)-.085;
 float bill=sdCap(f,H+db*.06,H+db*.16,.038,.008);float billO=sing>0.?sdCap(f,H+db*.06,H+(db*cos(.35*sing)-pb*sin(.35*sing))*.15,.030,.006):9.;
 float wingF=9.,wingN=9.;vec2 S=a*.03+n*.03;
 if(wing>-.99){vec2 w=normalize(n*cos(wing*1.1)+a*sin(wing*1.1)*.5);wingN=min(sdCap(f,S,S+w*.16,.055,.040),sdCap(f,S+w*.16,S+w*.25-a*.04,.040,.015));
  vec2 w2=normalize(n*cos(wing*1.1-.3)+a*sin(wing*1.1)*.5);wingF=min(sdCap(f,S-a*.02,S-a*.02+w2*.15,.05,.036),sdCap(f,S-a*.02+w2*.15,S-a*.02+w2*.23-a*.05,.036,.014));}
 solid(litFlat(olv*.7,.3),ss(px,-px,wingF));
 CUT(tail*s,olv,f*3.,.3,.004);
 CUT(body*s,mix(yel,yel*.85,ss(.0,.06,bq.y)),f*3.,.3,.010);
 if(wing<=-.99){float wf=sdEll(bq-vec2(-.03,.03),vec2(.13,.055));vec3 wc=mix(olv,blk,.5*ss(.3,.8,sin(bq.x*70.)));CUT(wf*s,wc,f*3.,.2,.006);}
 else{vec3 wc=mix(yel,blk,.35*ss(.3,.8,sin(dot(f-S,a)*70.)));CUT(wingN*s,wc,f*3.,.3,.006);}
 vec3 hc=yel;if(fem<.5){vec2 hq=vec2(dot(f-H,db),dot(f-H,pb));hc=mix(yel,blk,ss(.012,-.004,hq.y-.025)*ss(-.06,-.02,hq.x)+ss(.0,-.01,hq.y-.025)*ss(-.09,-.05,hq.x)*0.);hc=mix(hc,blk,ss(.02,-.01,length(hq-vec2(.03,-.01))-.05));}
 CUT(head*s,hc,f*3.,.3,.008);
 CUT(min(bill,billO)*s,bll,f*3.,.1,.004);
 vec2 E=H+db*.02+pb*.018;solid(litFlat(fem>.5?vec3(.20,.12,.06):vec3(.55,.06,.03),.2)*1.4,ss(px,-px,length(f-E)-.022));eye(f,E,.013,bl);}
// A hanging nest: a woven ball with an entrance tube at the bottom, tied to the tip of a twig. fresh: green (new) or straw (old);
// done: how much is woven (the new nest is a ring that closes into a ball).
float nestD(vec2 l,float done){float ball=sdEll(l-vec2(0.,-.10),vec2(.085,.095));float tube=sdCap(l,vec2(.03,-.16),vec2(.05,-.24),.034,.030);float tie=sdCap(l,vec2(0.,0.),vec2(0.,-.03),.012,.02);
 float d=min(min(ball,tube),tie);return d;}
void nest(vec2 q,vec2 top,float s,float fresh,float swing,float t){vec2 l=rot(swing)*(q-top)/s;if(dot(l,l)>.16)return;float px=PX/s;float d=nestD(l,1.);
 dropShadow(nestD(rot(swing)*(q-top-SHD*.02)/s,1.)*s,.02,.28);
 float c=ss(px,-px,d);if(c<=0.)return;
 vec3 g=mix(vec3(.50,.40,.18),vec3(.20,.34,.06),fresh);
 float st1=sin(dot(l,vec2(.8,.6))*260.+vn(l*40.)*6.),st2=sin(dot(l,vec2(-.7,.7))*240.+vn(l*37.+5.)*6.),st3=sin(l.y*300.+vn(l*30.+9.)*8.);
 float wv=max(max(ss(.6,.95,st1),ss(.6,.95,st2)*.8),ss(.7,.98,st3)*.6);vec3 col=g*(.82+.40*wv)*(1.+.12*(vn(l*25.)-.5));
 col=litFlat(col,.3)*(1.+fibre(l*4.)*.3);col=mix(col,col*1.3,ss(-px*3.,-px*.3,d)*.5);
 float hole=sdEll(l-vec2(.052,-.245),vec2(.020,.010));col=mix(col,vec3(.03,.025,.01),ss(px,-px,hole));
 // the strands sticking out, loose
 solid(col,c);
 float st=9.;for(int i=0;i<5;i++){float fi=float(i);vec2 a=vec2(.06*cos(fi*1.3+1.),-.10+.08*sin(fi*1.3+1.));st=min(st,sdCap(l,a,a*1.5+vec2(.0,-.02),.004,.002));}
 solid(litFlat(g*1.1,.3),ss(px,-px,st));}
// The acacia crown: thick and thin branches of dark card, flat tufts of tiny leaves, white thorns.
float twigs(vec2 q){float d=sdCap(q,vec2(-1.1,.42),vec2(-.30,.28),.035,.026);d=min(d,sdCap(q,vec2(-.30,.28),vec2(.30,.30),.026,.018));d=min(d,sdCap(q,vec2(.30,.30),vec2(1.1,.40),.018,.016));
 d=min(d,sdCap(q,vec2(-.30,.28),vec2(-.52,.17),.012,.007));d=min(d,sdCap(q,vec2(.02,.29),vec2(.05,.18),.010,.006));d=min(d,sdCap(q,vec2(.30,.30),vec2(.52,.22),.010,.006));
 d=min(d,sdCap(q,vec2(-.80,.38),vec2(-.82,.25),.010,.006));d=min(d,sdCap(q,vec2(.75,.36),vec2(.78,.24),.010,.006));return d;}
void crown(vec2 q,float t){if(uDecor>1.5)return;
 // the far foliage (back layer), then the branches, then the near tufts
 vec2 u=atS(.25)+vec2(0.,.17);float px=pxS(.25);float lf=9.;for(int i=0;i<10;i++){float fi=float(i);vec2 p=vec2(-1.1+fi*.25,.46+.04*sin(fi*2.1));lf=min(lf,sdEll(u-p,vec2(.20,.06))+.012*(vn(u*vec2(60.,90.))-.5));}
 solid(decCol(litFlat(vec3(.13,.17,.06),.5)*(1.+fibre(u)*.3)),ss(px,-px,lf)*DEC());
 float d=twigs(q);dropShadow(twigs(q-SHD*.03),.03,.28*(uDecor>.5?uOpacity:1.));
 vec3 bc=litFlat(vec3(.16,.11,.08),.1)*(1.+.12*sin(q.x*120.+vn(q*30.)*3.))*(1.+fibre(q*2.)*.4);solid(decCol(bc),cov(d)*DEC());
 float th=9.;for(int i=0;i<26;i++){float fi=float(i);float x=-1.05+fi*.083;float y=x<-.3?.42-.18*(x+1.1)/.8:x<.3?.28+.02*(x+.3)/.6:.30+.10*(x-.3)/.8;vec2 b=vec2(x,y);float sd=mod(fi,2.)<.5?1.:-1.;
  th=min(th,sdCap(q,b,b+vec2(.02,sd*.045),.004,.001));}
 solid(decCol(litFlat(vec3(.85,.82,.74),.4)),cov(th)*DEC());
 vec2 v=atS(-.06)+vec2(0.,.17);float pv=pxS(-.06);float lt=9.;for(int i=0;i<7;i++){float fi=float(i);vec2 p=vec2(-1.0+fi*.33+.08*sin(fi*3.),.50+.03*sin(fi*1.7));lt=min(lt,sdEll(v-p,vec2(.17,.05))+.012*(vn(v*vec2(70.,110.))-.5));}
 solid(decCol(litFlat(vec3(.18,.24,.07),.5)*(1.+fibre(v)*.3)),ss(pv,-pv,lt)*DEC());}
void scene(vec2 q0,float t){
 // the whole crown a little lower in the picture
 vec2 q=q0+vec2(0.,.17);
 crown(q,t);
 // the old nests on other twigs
 nest(q,vec2(-.52,.17),.55,.15,.04*sin(t*.8),t);nest(q,vec2(.52,.22),.52,.25,.03*sin(t*.7+1.),t);nest(q,vec2(-.82,.25),.50,.10,.03*sin(t*.6+2.),t);nest(q,vec2(.78,.24),.48,.30,.03*sin(t*.9+3.),t);
 nest(q,vec2(-.30,.28)+vec2(-.06,-.02),.45,.2,.03*sin(t*.75+4.),t);
 // the new nest: fresh green, swinging a little more while the bird works on it
 const float NS=.62;vec2 NT=vec2(.05,.18);float sw=.05*sin(t*1.9)*ss(2.,2.5,t)+.08*sin(t*7.)*ss(4.6,4.9,t)*ss(7.,6.6,t);nest(q,NT,NS,1.,sw,t);
 mat2 R=rot(-sw);vec2 Bc=NT+R*vec2(0.,-.10)*NS,Bl=NT+R*vec2(-.02,-.19)*NS,Door=NT+R*vec2(.05,-.245)*NS;
 // the male: weaving (on the side of the nest), then hanging under it flapping, then singing on the twig
 if(t<4.5){vec2 c=Bc+R*vec2(.095,-.005);float poke=.5+.5*sin(t*5.);
  weaver(q,c+vec2(-.012*poke,0.),.22,-1.,1.0,-.25-.30*poke,-1.,0.,0.,blinkAt(t,.3));
  // the strip of grass: from the bill into the wall, pulled and tucked
  vec2 bt=c+vec2(-.012*poke,0.)+vec2(-.036,.040);float sd=sdCap(q,bt,Bc+R*vec2(.045,.02+.02*sin(t*3.)),.004,.003);solid(litFlat(vec3(.25,.42,.07),.4),cov(sd));}
 else if(t<7.1){vec2 c=Bl+vec2(0.,-.045);float fl=sin(t*TAU*2.8);
  weaver(q,c,.22,1.,-1.65+.12*sin(t*2.),-1.75,fl,0.,0.,blinkAt(t,.3));}
 else{float u=ss(7.1,7.6,t);vec2 c=mix(Bl+vec2(0.,-.045),vec2(.20,.335),u)+vec2(0.,.05*sin(PI*u));float sing=ss(8.6,8.8,t)*ss(10.6,10.3,t)*(.5+.5*sin(t*18.));
  weaver(q,c,.22,-1.,1.10,-.25+.3*sing,t<7.6?sin(t*TAU*3.):-1.,0.,sing,blinkAt(t,.3));}
 // the female: flies in, lands on the nest, looks it over, goes in by the door at the bottom
 float fa=ss(7.0,7.8,t),fin=ss(9.0,9.6,t);if(t>6.8&&fin<1.){vec2 from=vec2(-1.1,.05),on=Bc+R*vec2(-.10,-.01);
  vec2 c=mix(from,on,fa)+vec2(0.,.08*sin(PI*fa));c=mix(c,Door+vec2(0.,-.01),fin);
  float al0=AL;AL*=1.-ss(.6,1.,fin);weaver(q,c,.20,1.,fa<1.?.25:mix(1.0,-1.2,fin),fa<1.?.1:mix(-.4,-1.4,fin),fa<.99?sin(t*TAU*3.2):-1.,1.,0.,blinkAt(t,.6));AL=al0;}
}
