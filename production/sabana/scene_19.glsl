// 20 · L'oricteròp. The end of the night, by the moon. From a hole in the ground, beside the heap of earth it has dug out, the long ears
// of an aardvark rise and turn; its snout comes up sniffing; it climbs out (≈ 2.4–4.6 s). It sniffs the ground, its ears turning, and
// ambles to a termite mound; it digs at the foot of the mound with its strong clawed front feet and the clods fly back between its legs
// (the key moment, ≈ 7–9.6 s). Then it sits up on its hind legs and its thick tail, turns its face to us and moves its ears. After the
// stimulus, the climb to the stars (sabana.js). Aardvarks come out of their burrows at night, find termite mounds by smell and open them
// with their front claws (CANVIS). It is not shown eating.
// The aardvark in its frame (facing +x, feet on y = 0). ph: the steps; walk: how much it walks; dig: digging with the front feet
// (crouched); rear: sitting up on the hind legs and the tail (the front of the body raised); sniff: the twitching of the nose; earA,
// earB: the angles of the two ears; front: the head turned to us; ha: the head lowered (positive) or raised.
struct Ar{float legsN,legsF,claw,body,neck,head,snout,nose,earN,earF,earIn,tail;vec2 E,E2,N;float front;};
Ar arParts(vec2 f,float ph,float walk,float dig,float rear,float sniff,float earA,float earB,float front,float ha){Ar P;
 vec2 Hp=vec2(-.24,.30);float pitch=.62*rear-.10*dig;
 vec2 fb=Hp+rot(pitch)*(f-Hp);fb.y+=.05*dig*ss(-.1,.3,fb.x);
 #define toF(v) (Hp+rot(-pitch)*((v)-vec2(0.,.05*dig*ss(-.1,.3,(v).x))-Hp))
 // the body: the high rump, the long barrel, the chest; the short neck
 P.body=smin(smin(length(fb-vec2(-.27,.43))-.20,sdEll(fb-vec2(-.03,.40),vec2(.30,.175)),.08),length(fb-vec2(.20,.35))-.15,.08);
 vec2 Hd=vec2(.43,.35)+vec2(.03,-.08)*dig+vec2(-.02,.02)*rear;P.neck=sdCap(fb,vec2(.22,.38),Hd,.11,.075);
 // the head: from the side, the skull and the long snout ending in the disc of the nose; or turned to us
 P.front=step(.5,front);float h2=-(ha+.22*dig-.10*rear);
 if(P.front<.5){vec2 hq=rot(h2)*(fb-Hd);float sn=.006*sin(sniff);
  P.head=sdEll(hq-vec2(.01,0.),vec2(.11,.078));
  P.snout=smin(sdCap(hq,vec2(.06,-.01),vec2(.29,-.07+sn),.050,.030),P.head,.04);
  P.nose=sdEll(hq-vec2(.300,-.073+sn),vec2(.016,.034));
  vec2 eb=vec2(-.035,.06);P.earN=sdEll(rot(1.95+earA)*(hq-eb)-vec2(.13,0.),vec2(.135,.042));P.earF=sdEll(rot(2.15+earB)*(hq-eb-vec2(-.03,.0))-vec2(.13,0.),vec2(.13,.040));
  P.earIn=sdEll(rot(1.95+earA)*(hq-eb)-vec2(.14,.004),vec2(.10,.018));
  P.E=toF(Hd+rot(-h2)*vec2(.025,.022));P.E2=vec2(9.);P.N=toF(Hd+rot(-h2)*vec2(.30,-.073));}
 else{vec2 HdF=toF(Hd);vec2 hq=f-HdF-vec2(0.,.02);vec2 m=vec2(abs(hq.x),hq.y);float sn=.004*sin(sniff);
  P.head=sdEll(hq,vec2(.10,.095));
  P.snout=smin(sdCap(hq,vec2(0.,-.02),vec2(0.,-.13+sn),.055,.045),P.head,.04);
  P.nose=sdEll(hq-vec2(0.,-.15+sn),vec2(.050,.034));
  P.earN=sdEll(rot(1.25+earA*.6)*(m-vec2(.05,.07))-vec2(.13,0.),vec2(.135,.042));P.earF=9.;
  P.earIn=sdEll(rot(1.25+earA*.6)*(m-vec2(.05,.07))-vec2(.14,.0),vec2(.10,.018));
  P.E=HdF+vec2(-.050,.065);P.E2=HdF+vec2(.050,.065);P.N=HdF+vec2(0.,-.13);}
 // the thick tail, tapering, lying on the ground behind
 vec2 t0=Hp+rot(-pitch)*vec2(-.19,.12),t1=vec2(-.62,.20-.12*rear),t2=vec2(-.80,.035);
 P.tail=min(sdCap(f,t0,t1,.085,.055),sdCap(f,t1,t2,.055,.022));
 // the legs: short and stout; the hind feet long; the front feet with their big spade claws. Walking: diagonal pairs; digging: the
 // front feet scrape forward and back in turn; sitting up: the front feet held up against the chest.
 float lN=9.,lF=9.,cl=9.;
 for(int sd=0;sd<2;sd++){float side=float(sd),o=side*PI;
  vec2 hip=Hp+vec2(.02,.0)-vec2(.04,0.)*(1.-side);vec2 fh=vec2(-.20+.09*sin(ph+o+PI)*walk-.04*(1.-side),.035*max(0.,cos(ph+o+PI))*walk);
  vec2 ank=fh+vec2(-.11,.06);vec2 kn=knee(hip,ank,.17,.17,1.);
  float dh=min(sdCap(f,hip,kn,.10,.065),min(sdCap(f,kn,ank,.065,.045),sdCap(f,ank,fh+vec2(.03,.016),.045,.028)));
  vec2 sh=Hp+rot(-pitch)*(vec2(.20,.27)-Hp)-vec2(.04,0.)*(1.-side);
  vec2 ff=vec2(.24+.09*sin(ph+o)*walk-.03*(1.-side),.035*max(0.,cos(ph+o))*walk);
  float dg=sin(ph*1.0+o);ff=mix(ff,vec2(.45+.13*dg,.025+.08*max(0.,cos(ph+o))),dig);
  ff=mix(ff,sh+vec2(.10,-.16),rear);
  vec2 el=knee(sh,ff,.16,.16,-1.);
  float df=min(sdCap(f,sh,el,.085,.055),sdCap(f,el,ff+vec2(0.,.02),.055,.04));
  vec2 cd=normalize(ff-el+vec2(.12,0.));vec2 cp=vec2(-cd.y,cd.x);float c3=9.;
  for(int i=0;i<3;i++){float fi=float(i)-1.;vec2 a=ff+vec2(.03,.008)+cp*fi*.018;c3=min(c3,sdCap(f,a,a+cd*.06+cp*fi*.01-vec2(0.,.012),.014,.004));}
  if(sd==0){lF=min(dh,df);}else{lN=min(dh,df);cl=min(cl,c3);}
  if(sd==0)cl=min(cl,c3+.0);}
 P.legsN=lN;P.legsF=lF;P.claw=cl;return P;}
float arUnion(Ar P){return min(min(min(P.legsN,P.legsF),min(P.body,P.neck)),min(min(P.head,P.snout),min(P.tail,P.earN)));}
void aardvark(vec2 q,vec2 c,float s,float ph,float walk,float dig,float rear,float sniff,float earA,float earB,float front,float ha,float bl,float shadow){
 vec2 f=(q-c)/s;if(f.y<-.08||f.y>1.5||f.x<-1.1||f.x>1.1)return;float px=PX/s;
 Ar P=arParts(f,ph,walk,dig,rear,sniff,earA,earB,front,ha);
 if(shadow>0.){vec2 fs=f-SHD*.04/s;Ar S=arParts(fs,ph,walk,dig,rear,sniff,earA,earB,front,ha);dropShadow(arUnion(S)*s,.04,.32*shadow);}
 // sparse-haired skin, greyish pink with a yellow tinge, the legs darker with the earth it digs
 vec3 skin=vec3(.18,.135,.105),leg=vec3(.11,.082,.058),pink=vec3(.30,.16,.15),dark=vec3(.02,.017,.016);
 solid(litFlat(leg*.70,.1),ss(px,-px,P.legsF));
 solid(litFlat(skin*.62,.3),ss(px,-px,P.earF));
 under(P.tail*s,.01);CUT(P.tail*s,skin*.95,f*1.4,.1,.012);
 vec3 bodyC=skin*(1.+.10*(vn(f*vec2(9.,14.))-.5));
 under(min(P.body,P.neck)*s+.004,.012);CUT(min(P.body,P.neck)*s,mix(leg,bodyC,ss(.12,.26,f.y)),f*1.2,.1,.018);
 // a few coarse hairs on the legs and the flank
 CUT(P.legsN*s,mix(leg,skin,ss(.10,.30,f.y)*.6),f,.1,.006);
 CUT(P.earN*s,skin*1.02,f*1.6,.6,.006);solid(litFlat(pink,.6),ss(px,-px,P.earIn)*.7);
 under(P.head*s,.008);CUT(min(P.head,P.snout)*s,skin*1.06,f*1.8,.1,.012);
 solid(litFlat(pink,.2),ss(px,-px,P.nose));
 solid(litFlat(dark*2.,.1),ss(px,-px,P.claw));
 if(P.front>.5){vec2 hq=f-P.N;solid(litFlat(dark*3.,.1),ss(px,-px,min(length(hq-vec2(-.018,-.02))-.010,length(hq-vec2(.018,-.02))-.010)));}
 else solid(litFlat(dark*3.,.1),ss(px,-px,length((f-P.N-vec2(.006,-.008))*vec2(1.,1.6))-.008));
 eye(f,P.E,.017,bl);eye(f,P.E2,.017,bl);
 brad(q,c+(vec2(-.24,.30)+rot(-(.62*rear-.10*dig))*vec2(.44,-.03))*s,.005);}
// The termite mound: tall, of red earth, with two chimneys; the hole the aardvark digs at its foot. Decor (its hole too).
float tmD(vec2 u){vec2 l=u-vec2(.64,G0);float h=sat(l.y/.50);float w=.14*pow(1.-h,1.4)+.022+.008*sin(l.y*45.+1.)+.010*(vn(u*vec2(8.,30.))-.5);
 float d=max(abs(l.x-.03*h*h+.012*sin(l.y*7.))-w,l.y-.50);
 float ch=max(abs(l.x+.075+.01*sin(l.y*20.))-.020*(1.2-sat((l.y-.10)/.24)),l.y-.33);d=smin(d,ch,.035);
 float ch2=max(abs(l.x-.085)-.017*(1.2-sat((l.y-.06)/.18)),l.y-.22);d=smin(d,ch2,.03);return max(d,-l.y-.2);}
void termites(vec2 q,float t){if(uDecor>1.5)return;vec2 u=atS(.05);float px=pxS(.05);dropShadow(tmD(u-SHD*.03),.03,.32*(uDecor>.5?uOpacity:1.));
 float d=tmD(u);float c=ss(px,-px,d);if(c<=0.)return;
 vec3 col=litFlat(vec3(.27,.15,.09),.1)*(1.+.14*sin(u.y*60.+vn(u*18.)*4.))*(1.+fibre(u*2.)*.4);
 col=mix(col,col*1.3,ss(-px*3.,-px*.3,d)*.5);
 float hl=sdEll(u-vec2(.515,G0+.035),vec2(.055,.040)*ss(7.0,9.4,t));col=mix(col,col*.12,ss(px,-px,hl)*.92);
 solid(decCol(col),c);}
// The burrow: a heap of fresh earth, and the dark mouth of the hole in the ground in front of it.
vec2 HOLE;
void burrowBack(vec2 q){if(uDecor>1.5)return;vec2 l=q-vec2(-.72,G0);float d=sdEll(l-vec2(0.,-.01),vec2(.26,.115))+.008*(vn(q*40.)-.5);d=max(d,-l.y+.0);
 dropShadow(d,.02,.25*(uDecor>.5?uOpacity:1.));float c=cov(d);if(c>0.){vec3 col=litFlat(vec3(.30,.20,.13),.1)*(1.+.25*(vn(q*vec2(60.,70.))-.5))*(1.+fibre(q*2.)*.4);
  col=mix(col,col*1.3,ss(-PX*3.,-PX*.3,d)*.5);solid(decCol(col),c);}
 float h=sdEll(q-HOLE,vec2(.17,.044));solid(decCol(litFlat(vec3(.03,.02,.018),.1)),cov(h));}
void burrowLip(vec2 q){if(uDecor>1.5)return;vec2 l=q-HOLE;float d=max(sdEll(l-vec2(0.,-.006),vec2(.185,.050)),-sdEll(l,vec2(.17,.044)));d=max(d,-l.y-.03);
 d=max(d,l.y+.004);float c=cov(d+.002*sin(l.x*90.));if(c<=0.)return;solid(decCol(litFlat(vec3(.27,.18,.12),.1)*(1.+fibre(q*2.)*.4)),c);}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.)*mix(vec3(1.),vec3(.58,.62,.84),NIGHT);
 floorStrip(.22,G0+.06,.05,g*.92,21.);
 termites(q,t);
 HOLE=vec2(-.40,G0+.004);
 burrowBack(q);
 // where the aardvark is and what it does
 float s=.36;vec2 c;float walk=0.,dig=0.,rear=0.,front=0.,ha=0.,ph=0.,earA=.1*sin(t*1.3),earB=.1*sin(t*1.1+1.);
 // coming out: up the slope of its tunnel, head first, ears first
 vec2 cA=vec2(-.50,G0-.31),cB=vec2(-.45,G0-.13),c1=vec2(-.23,G0);float tl=.70*(1.-ss(3.5,4.6,t));
 if(t<4.6){c=t<3.5?mix(cA,cB,ss(2.2,2.9,t)):mix(cB,c1,ss(3.5,4.6,t));ha=-.30+.06*sin(t*7.)*ss(2.6,2.9,t)*ss(3.6,3.3,t);earA+=.25*sin(t*4.)*ss(2.4,2.8,t);earB+=.25*sin(t*3.6+1.)*ss(2.4,2.8,t);ph=t*TAU*.9;walk=ss(3.4,3.7,t)*.6;}
 else if(t<7.0){float u=ss(5.2,6.9,t);c=mix(c1,vec2(.33,G0),u);walk=ss(5.0,5.3,t)*ss(7.0,6.7,t);ph=(t-5.)*TAU*1.25;ha=.35*ss(4.6,4.9,t)*ss(5.3,5.1,t)+.12*walk;
  earA+=.35*ss(4.7,4.9,t)*ss(5.3,5.1,t);}
 else if(t<9.9){c=vec2(.33,G0);dig=ss(7.0,7.3,t)*ss(9.9,9.6,t);ph=(t-7.)*TAU*2.4;earA+=.2*dig;earB+=.25*dig;}
 else{c=vec2(.33,G0);rear=ss(9.9,10.6,t);front=ss(10.7,10.8,t);earA+=.30*sin(max(0.,t-11.)*2.2)*ss(11.,11.4,t);earB+=.30*sin(max(0.,t-11.)*2.2+1.6)*ss(11.,11.4,t);}
 // while it is still in the hole, only what is above the ground or in the mouth of the hole shows
 float inH=t<4.7?1.:0.;
 float vis=max(step(G0+.004,q.y),ss(.004,-.004,sdEll(q-HOLE,vec2(.17,.044))));
 float sAL=AL;if(inH>.5)AL=vis;
 {float tilt=tl*inH;vec2 qr=c+rot(tilt)*(q-c);
  aardvark(qr,c,s,ph,walk,dig,rear,(t)*TAU*5.,earA,earB,front,ha,blinkAt(t,.15),1.-inH*(1.-ss(4.2,4.6,t)));}
 AL=sAL;
 // inside the hole it is dark
 if(uDecor<1.5)shade(ss(.004,-.004,sdEll(q-HOLE,vec2(.17,.044)))*step(q.y,G0+.004)*.55,vec3(.2,.18,.2));
 burrowLip(q);
 // the clods it throws back while it digs: small pieces of earth that fly between its legs and fall in a heap behind it
 if(t>7.0&&t<14.5){for(int i=0;i<12;i++){float fi=float(i),ts=7.2+fi*.21;if(t<ts||ts>9.6)continue;float u=t-ts;
   vec2 p0=vec2(.33+.44*s,G0+.03),v=vec2(-.62-.25*h11(fi),.42+.25*h11(fi+3.));vec2 p=p0+v*u+vec2(0.,-1.6)*u*u;
   float land=G0+.006+.006*h11(fi+5.);float tl=(v.y+sqrt(v.y*v.y+6.4*(p0.y-land)))/3.2;if(u>tl){p=p0+v*tl+vec2(0.,-1.6)*tl*tl;p.y=land;}
   vec2 l=rot(u*6.*(u>tl?0.:1.)+fi)*(q-p);float d=max(abs(l.x)-.010-.004*h11(fi+1.),abs(l.y)-.007)+.002*sin(l.x*300.);
   solid(litFlat(vec3(.28,.17,.10),.1),cov(d));}}
 floorStrip(-.10,G0-.07,.05,g*.82,23.);
}
