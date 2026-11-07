// 11 · Els blauets. Over the river, at the height of the reeds. A pied kingfisher (black and white) sits on a dead branch, bobbing. It
// flies out and hovers in the air over the water, its wings a blur and its head still, looking down (≈ 3.7–5 s); it folds its wings and
// dives head first into the river (the key moment, ≈ 5 s, a small splash), comes out, flies back to the branch and shakes the water off
// in a spray of drops. It comes back without a fish (a design rule of the activity: no prey). A tiny malachite kingfisher, deep blue and
// orange with a red bill, watches from a reed in front. Hovering and diving: Ceryle rudis; the colours: field guides (CANVIS).
const float WS=-.30;   // the water surface under the hover point
// A kingfisher, its frame centred on its body: ba the angle of the body (towards the head), bang the angle of the bill; wing: −1 folded,
// else the flap angle (−1..1); blur: the hover (wings as a blurred fan); sp: 0 pied, 1 malachite; feet: perched; crest: raised.
void kingfisher(vec2 q,vec2 c,float s,float dir,float ba,float bang,float wing,float blur,float sp,float feet,float bl,float crest,float clipY){
 vec2 f=(q-c)/s;f.x/=sdir(dir);if(dot(f,f)>.36)return;float px=PX/s;
 float al0=AL;AL*=ss(clipY-.002,clipY+.004,q.y);if(AL<=0.){AL=al0;return;}
 vec2 a=vec2(cos(ba),sin(ba)),n=vec2(-a.y,a.x);if(n.y<0.)n=-n;vec2 bq=vec2(dot(f,a),dot(f,n));
 vec2 db=vec2(cos(bang),sin(bang)),pb=vec2(-db.y,db.x);if(pb.y<0.)pb=-pb;
 float hr=mix(.082,.088,sp);vec2 Hc=a*.165+n*.012;
 vec3 blk=vec3(.025,.024,.026),wht=vec3(.80,.80,.78),blue=vec3(.025,.075,.40),turq=vec3(.03,.26,.42),orng=vec3(.62,.22,.05),red=vec3(.62,.07,.03);
 vec3 back=sp<.5?blk:blue;
 // the tail
 float tail=sdCap(bq,vec2(-.11,.0),vec2(-.31,-.005),.030,.042);
 vec3 tc=sp<.5?mix(wht,blk,ss(-.25,-.23,bq.x)*ss(-.30,-.28,-bq.x)):blue;
 // the far wing (flying) and the blur of the hover
 vec2 S=a*.05+n*.03;
 if(blur>0.){vec2 l=f-S;float r=length(l);float an=atan(dot(l,a),dot(l,n));float fan=max(r-.30,abs(an)-.95);float fan2=max(r-.27,abs(atan(dot(l,a),-dot(l,n)))-.70);
  float fc=ss(.01,-.01,min(fan,fan2));solid(litFlat(mix(back,vec3(.5),.35),.3),fc*blur*.42*(.55+.45*ss(.30,.05,r)));}
 float wingF=9.,wingN=9.;
 if(wing>-.99){vec2 w=normalize(n*cos(wing*.9)+a*sin(wing*.9)*.6);vec2 w2=normalize(n*cos(wing*.9-.25)+a*sin(wing*.9)*.6);
  wingN=min(sdCap(f,S,S+w*.20,.060,.045),sdCap(f,S+w*.20,S+w*.31-a*.04,.045,.018));wingF=min(sdCap(f,S-a*.02,S-a*.02+w2*.19,.055,.040),sdCap(f,S-a*.02+w2*.19,S-a*.02+w2*.28-a*.05,.040,.016));}
 solid(litFlat(back*.7,.2),ss(px,-px,wingF));
 // feet on the perch
 if(feet>0.){float ft=min(sdCap(f,vec2(.02,-.10),vec2(.03,-.20),.010,.008),sdCap(f,vec2(-.02,-.10),vec2(-.01,-.20),.009,.007));solid(litFlat(sp<.5?blk*2.:red,.2),ss(px,-px,ft)*feet);}
 CUT(tail*s,tc,f*3.,.2,.004);
 // the body: white below with black breast bands (pied); orange below (malachite); the back dark
 float body=sdEll(bq-vec2(0.,-.005),vec2(.165,.098));
 vec3 bc=sp<.5?mix(wht,blk,ss(-.01,.03,bq.y)):mix(orng,blue,ss(-.005,.035,bq.y));
 if(sp<.5){float bandA=ss(.004,-.004,abs(bq.x-.085)-.018)*ss(.0,-.02,bq.y);bc=mix(bc,blk,bandA);
  vec2 sg=bq*vec2(30.,26.);vec2 id=floor(sg),fr=fract(sg)-.5;float sp1=ss(.30,.18,length(fr))*step(.5,h21(id))*ss(.01,.04,bq.y);bc=mix(bc,wht*.9,sp1);}
 under(body*s,.008);CUT(body*s,bc,f*2.,.15,.012);
 // the folded wing (perched, diving)
 if(wing<=-.99){float wf=sdEll(bq-vec2(-.035,.032),vec2(.135,.060));vec3 wc=back;
  if(sp<.5){vec2 sg=bq*vec2(34.,30.)+.5;vec2 id=floor(sg),fr=fract(sg)-.5;wc=mix(blk,wht*.9,ss(.28,.16,length(fr))*step(.35,h21(id+3.)));}
  else wc=mix(blue,turq,.25+.25*sin(bq.x*90.));
  under(wf*s,.004);CUT(wf*s,wc,f*3.,.1,.008);}
 else{vec2 sg=f*vec2(34.,30.)+.5;vec2 id=floor(sg),fr=fract(sg)-.5;vec3 wc=sp<.5?mix(blk,wht*.9,ss(.28,.16,length(fr))*step(.35,h21(id+3.))):blue;
  under(wingN*s,.004);CUT(wingN*s,wc,f*3.,.1,.008);}
 // the head: dark crown, white stripe over the eye and black stripe through it (pied); turquoise barred crown, orange cheek, white neck
 // patch (malachite); the shaggy crest at the back
 vec2 hq=vec2(dot(f-Hc,db),dot(f-Hc,pb));
 float cr=9.;for(int i=0;i<4;i++){float fi=float(i);vec2 o=vec2(-.045-.022*fi,.045-.006*fi);cr=min(cr,sdCap(hq,o,o+vec2(-.05-.015*crest,.03+.03*crest+.01*fi),.018,.004));}
 solid(litFlat(sp<.5?blk:turq,.2),ss(px,-px,cr));
 float head=length(f-Hc)-hr;
 vec3 hc=sp<.5?blk:turq;
 if(sp<.5){hc=mix(hc,wht,ss(.008,.0,abs(hq.y-.026)-.009));hc=mix(hc,wht,ss(-.005,-.02,hq.y));}
 else{hc=mix(hc,blk,.5*ss(.0,.7,sin(hq.x*120.))*ss(.01,.03,hq.y));hc=mix(hc,orng,ss(.012,-.004,hq.y));hc=mix(hc,wht*.95,ss(.022,.012,length(hq-vec2(-.050,-.035))));}
 under(head*s,.006);CUT(head*s,hc,f*3.,.15,.010);
 // the bill
 float bill=sdCap(f,Hc+db*.055,Hc+db*mix(.25,.19,sp),mix(.030,.032,sp),.003);
 CUT(bill*s,sp<.5?blk*1.5:red,f*3.,.1,.004);
 eye(f,Hc+db*.020+pb*.016,.017,bl);
 AL=al0;}
// The dead branch at the left, standing out of the water, and its twig where the pied kingfisher sits.
float branchD(vec2 u){float d=sdCap(u,vec2(-.42,-.62),vec2(-.36,-.02),.030,.020);d=min(d,sdCap(u,vec2(-.36,-.02),vec2(-.30,.06),.020,.012));d=min(d,sdCap(u,vec2(-.38,-.10),vec2(-.52,.02),.016,.008));
 d=min(d,sdCap(u,vec2(-.36,-.02),vec2(-.40,.13),.014,.007));return d;}
void branch(vec2 q){if(uDecor>1.5)return;vec2 u=q;float d=branchD(u);dropShadow(branchD(u-SHD*.02),.02,.28*(uDecor>.5?uOpacity:1.));float c=cov(d);if(c<=0.)return;
 vec3 col=litFlat(vec3(.20,.16,.12),.1)*(1.+.10*sin(u.y*90.+sin(u.x*40.)*2.)+.08*(vn(u*vec2(20.,120.))-.5))*(1.+fibre(u*2.)*.4);col=mix(col,col*1.4,ss(-PX*3.,-PX*.3,d)*.5);solid(decCol(col),c*DEC());}
// The reed in front at the right, where the malachite kingfisher sits; leaves of thin green card.
void reed(vec2 q,float t){if(uDecor>1.5)return;vec2 u=atS(-.08);float px=pxS(-.08);float sw=.006*sin(t*.9);
 float d=sdCap(u,vec2(.66,-.62),vec2(.60+sw,-.06),.012,.008);
 float lv=min(sdCap(u,vec2(.645,-.32),vec2(.78,-.14+sw),.014,.002),min(sdCap(u,vec2(.64,-.44),vec2(.50,-.30+sw),.014,.002),sdCap(u,vec2(.62,-.20),vec2(.72,.02+sw),.010,.002)));
 float c=ss(px,-px,min(d,lv));if(c<=0.)return;vec3 col=litFlat(mix(vec3(.22,.30,.07),vec3(.32,.38,.10),ss(.0,.01,-lv)),.5)*(1.+fibre(u)*.3);solid(decCol(col),c*DEC());}
// The water at the dive: a splash crown, drops and rings.
void kfSplash(vec2 q,vec2 c,float a){if(a<0.||a>2.5)return;
 float g=ss(0.,.12,a)*ss(.75,.30,a);if(g>0.){vec2 l=(q-c)/vec2(.045,.07*g);float ang=atan(l.x,max(l.y,1e-3));float d=max(length(l)-(.75+.25*pow(abs(cos(ang*3.5)),.6)),-l.y);d=max(d,abs(ang)-1.2);
  solid(litFlat(vec3(.74,.80,.82),.4),ss(.03,-.03,d)*.8);}
 for(int i=0;i<14;i++){float fi=float(i);vec2 h=h22(vec2(fi,3.1));float tt=a*(.8+.4*h.x);vec2 p=c+vec2((h.x-.5)*.30*tt,(.25+.30*h.y)*tt-.9*tt*tt);if(p.y<c.y)continue;
  solid(litFlat(vec3(.78,.84,.86),.4),ss(PX,-PX,length(q-p)-.004-.003*h.y)*.85);}
 vec2 l=(q-c)/vec2(1.,.24);float r=length(l);for(int k=0;k<3;k++){float R=.02+a*.06-float(k)*.03;if(R>0.)glow(SKYH*.12*ss(.005,.0,abs(r-R))*(1.-a/2.5)*step(q.y,c.y+.005));}}
void scene(vec2 q,float t){
 branch(q);
 // the pied kingfisher: perched, flying out, hovering, diving, coming back, shaking
 vec2 P1=vec2(-.30,.075),HV=vec2(.18,.12),DV=vec2(.22,WS);
 vec2 c=P1+vec2(0.,.050);float ba=1.15,bang=-.30,wing=-1.,blur=0.,feet=1.,crest=0.;float clipY=-9.;
 float bob=.5+.5*sin(t*2.2);bang+=.15*sin(t*1.3)*ss(.5,1.,sin(t*.7));
 if(t>=3.0&&t<3.7){float u=ss(3.0,3.7,t);c=mix(P1+vec2(0.,.050),HV,u)+vec2(0.,.05*sin(PI*u));ba=mix(1.15,.25,ss(0.,.3,u));bang=ba-.2;wing=sin((t-3.)*TAU*3.);feet=0.;}
 else if(t>=3.7&&t<5.0){c=HV+vec2(0.,.004*sin(t*5.));ba=mix(.25,1.05,ss(3.7,3.9,t));bang=-1.30;blur=ss(3.7,3.8,t);wing=-1.;feet=0.;crest=.5;}
 else if(t>=5.0&&t<5.5){float u=sat((t-5.0)/.36);u=u*u;c=mix(HV,DV-vec2(0.,.10),u);ba=mix(1.05,-1.50,ss(5.0,5.12,t));bang=ba;feet=0.;clipY=WS;}
 else if(t>=5.5&&t<5.8){c=vec2(9.);}
 else if(t>=5.8&&t<6.75){float u=ss(5.8,6.75,t);c=mix(DV,P1+vec2(0.,.050),u)+vec2(0.,.07*sin(PI*u));ba=mix(.9,.3,ss(0.,.3,u));bang=ba-.1;wing=sin((t-5.8)*TAU*3.);feet=ss(.85,1.,u);clipY=WS;
  if(u>.9){ba=mix(.3,1.15,ss(.9,1.,u));}}
 float shake=ss(6.95,7.05,t)*ss(7.75,7.6,t);ba+=shake*.18*sin(t*TAU*6.);bang+=shake*.35*sin(t*TAU*6.+1.);
 kingfisher(q,c,.30,1.,ba,bang,wing,blur,0.,feet,blinkAt(t,.4),crest+shake,clipY);
 // the drops: falling from it as it comes out; thrown off when it shakes
 for(int i=0;i<16;i++){float fi=float(i);vec2 h=h22(vec2(fi,9.7));float a=t-(5.85+fi*.05);if(a>0.&&a<.6){vec2 p0=mix(DV,P1+vec2(0.,.050),ss(5.8,6.75,5.85+fi*.05));vec2 p=p0+vec2((h.x-.5)*.03,-1.1*a*a);
   if(p.y>WS)glow(vec3(.7,.85,.9)*ss(.005,.0,length(q-p)-.002)*.6);}
  float b=t-(7.0+fi*.045);if(b>0.&&b<.7){vec2 dir2=normalize(h-.5+vec2(0.,.15));vec2 p=c+dir2*(.10+.35*b)+vec2(0.,-.9*b*b);glow(vec3(.75,.88,.92)*ss(.005,.0,length(q-p)-.0025)*.55*ss(.7,.4,b));}}
 kfSplash(q,DV,t-5.38);
 // the malachite kingfisher on the reed: it bobs, watches the splash, raises its crest
 reed(q,t);
 vec2 mq=atS(-.08);float look=ss(5.2,5.6,t)*ss(8.4,7.8,t);
 kingfisher(mq,vec2(.60,-.06)+vec2(0.,.045),.20,-1.,1.25,mix(-.20,-.75,look)+.06*sin(t*1.7),-1.,0.,1.,1.,blinkAt(t,.75),ss(8.6,8.9,t)*ss(10.4,10.,t),-9.);
}
