// 12 · Els rinoceronts i els picabous. A black rhino mother and her calf stand in a mud wallow, grazing; red-billed oxpeckers walk and
// hop along their backs. All at once the oxpeckers fly up calling (the key moment, ≈ 4.6 s); the rhinos lift their heads, prick their
// ears and turn their faces to us (≈ 5–6.3 s). The birds circle and come back to the backs; the rhinos settle and graze again. Oxpeckers'
// alarm calls warn black rhinos: Plötz and Linklater (2020); that the call turns the rhinos here, with no people in the scene, is a design
// criterion (CANVIS).
struct Rh{float legsN,legsF,body,neck,head,horn1,horn2,ear,lip,fold,tail,tuft;vec2 E,E2;float front;};
Rh rhParts(vec2 f,float lift,float turn,float earF,float young,float sw){Rh P;
 float lg=mix(1.,1.1,young);
 vec2 sF=vec2(.25,.26*lg),sB=vec2(-.27,.27*lg);
 P.legsN=min(sdCap(f,sF,vec2(.27,0.),.090,.068),sdCap(f,sB,vec2(-.27,0.),.100,.070));
 P.legsF=min(sdCap(f,sF-vec2(.07,0.),vec2(.19,0.),.085,.064),sdCap(f,sB-vec2(.07,0.),vec2(-.34,0.),.095,.066));
 P.body=smin(smin(sdEll(f-vec2(-.02,.42*lg),vec2(.42,.20)),length(f-vec2(.20,.47*lg))-.17,.08),length(f-vec2(-.30,.43*lg))-.165,.08);
 // the head: low to graze, or up; from the side, or turned to us
 vec2 hc=mix(vec2(.58,.27),vec2(.60,.42),lift)*vec2(1.,lg);float ha=mix(-.50,-.12,lift);
 P.neck=sdCap(f,vec2(.30,.48*lg),hc-vec2(.06,-.01),.16,.11);
 P.front=step(.5,turn);float hs=mix(1.,1.22,young);
 if(P.front<.5){vec2 hq=rot(ha)*(f-hc)/hs;
  P.head=smin(sdEll(hq,vec2(.17,.105)),sdEll(hq-vec2(.15,-.025),vec2(.105,.080)),.05);
  P.lip=sdEll(rot(.5)*(hq-vec2(.255,-.050)),vec2(.030,.022));
  float hl=young>.5?.45:1.;
  P.horn1=sdCap(hq,vec2(.17,.05),vec2(.17,.05)+vec2(.07,.20)*hl,.050*hl+.01,.006);
  P.horn2=sdCap(hq,vec2(.06,.075),vec2(.06,.075)+vec2(.025,.085)*hl,.034*hl+.006,.006);
  P.ear=sdEll(rot(mix(.35,-.25,earF))*(hq-vec2(-.11,.11))-vec2(0.,.04),vec2(.026,.062));
  P.E=hc+rot(-ha)*vec2(.025,.025)*hs;P.E2=vec2(9.);
  P.head*=hs;P.lip*=hs;P.horn1*=hs;P.horn2*=hs;P.ear*=hs;}
 else{vec2 hq=(f-hc-vec2(-.02,.02))/hs;vec2 m=vec2(abs(hq.x),hq.y);
  P.head=smin(sdEll(hq-vec2(0.,.02),vec2(.125,.13)),sdEll(hq-vec2(0.,-.10),vec2(.095,.08)),.06);
  P.lip=sdEll(hq-vec2(0.,-.175),vec2(.040,.022));
  float hl=young>.5?.45:1.;
  P.horn1=sdCap(hq,vec2(0.,-.07),vec2(0.,-.07+.20*hl),.050*hl+.01,.006);
  P.horn2=sdCap(hq,vec2(0.,.03),vec2(0.,.03+.09*hl),.034*hl+.006,.006);
  P.ear=sdEll(rot(mix(-.9,-.5,earF))*(m-vec2(.11,.13))-vec2(0.,.04),vec2(.026,.062));
  P.E=hc+vec2(-.02,.02)+vec2(-.095,.03)*hs;P.E2=hc+vec2(-.02,.02)+vec2(.095,.03)*hs;
  P.head*=hs;P.lip*=hs;P.horn1*=hs;P.horn2*=hs;P.ear*=hs;}
 // the folds of the skin at the shoulder and the hip
 P.fold=min(abs(sdEll(f-vec2(.30,.40*lg),vec2(.16,.26)))-.004,abs(sdEll(f-vec2(-.38,.40*lg),vec2(.17,.25)))-.004);
 vec2 ta=vec2(-.44,.50*lg),tb=vec2(-.47+.04*sin(sw),.30*lg);P.tail=sdCap(f,ta,tb,.012,.008);P.tuft=sdEll(f-tb-vec2(0.,-.02),vec2(.016,.032));
 return P;}
float rhUnion(Rh P){return min(min(min(P.legsN,P.legsF),min(P.body,P.neck)),min(min(P.head,P.horn1),P.ear));}
void rhino(vec2 q,vec2 c,float s,float dir,float lift,float turn,float earF,float young,float sw,float bl){
 vec2 f=(q-c)/s;f.x/=sdir(dir);if(f.y<-.05||f.y>1.0||f.x<-.6||f.x>.95)return;float px=PX/s;
 Rh P=rhParts(f,lift,turn,earF,young,sw);
 {vec2 fs=f-SHD*.05/s*vec2(dir,1.);Rh S=rhParts(fs,lift,turn,earF,young,sw);dropShadow(rhUnion(S)*s,.05,.30);}
 vec3 grey=mix(vec3(.15,.145,.14),vec3(.19,.17,.16),young),mud=vec3(.18,.115,.07);
 float mudK=ss(.30,.22,f.y+.03*sin(f.x*14.)+.02*sin(f.x*37.));
 solid(litFlat(mix(grey,mud,mudK)*.62,.1),ss(px,-px,P.legsF));
 solid(litFlat(grey*.7,.1),ss(px,-px,P.tail));solid(litFlat(grey*.3,.1),ss(px,-px,P.tuft));
 CUT(P.legsN*s,mix(grey,mud,mudK),f,.1,.006);
 under(min(P.body,P.neck)*s,.012);CUT(min(P.body,P.neck)*s,mix(grey,mud,mudK)*(1.+.05*sin(f.x*30.+f.y*12.)),f*1.2,.1,.020);
 shade(ss(px*1.5,0.,P.fold)*ss(.0,-.02,P.body)*.45,vec3(.45,.45,.55));
 solid(litFlat(grey*1.05,.2),ss(px,-px,P.ear));
 under(P.head*s,.010);CUT(P.head*s,grey*1.08,f*1.5,.1,.014);
 CUT(P.lip*s,grey*1.2,f*2.,.1,.004);
 CUT(P.horn2*s,vec3(.20,.18,.155),f*3.,.1,.004);CUT(P.horn1*s,vec3(.23,.21,.18),f*3.,.1,.006);
 eye(f,P.E,.014,bl);eye(f,P.E2,.014,bl);
 brad(q,c+vec2(.25*dir,.26*mix(1.,1.1,young))*s,.006);}
// A red-billed oxpecker: brown above, pale below, a red bill, a yellow ring round the eye. fly: wings flapping.
void oxpecker(vec2 q,vec2 c,float s,float dir,float fly,float ph,float peck){vec2 f=(q-c)/s;f.x/=sdir(dir);if(dot(f,f)>1.)return;float px=PX/s;
 vec3 br=vec3(.22,.15,.08),bf=vec3(.62,.50,.32);
 float body=sdEll(rot(mix(.35,.05,fly))*(f-vec2(0.,.28)),vec2(.30,.15));float tail=sdCap(f,vec2(-.20,.30),vec2(-.48,mix(.18,.30,fly)),.06,.04);
 vec2 H=vec2(.25,.40)+vec2(.06,-.14)*peck;float head=length(f-H)-.11;float bill=sdCap(f,H+vec2(.08,-.01),H+vec2(.22,-.04-.06*peck),.035,.012);
 float wing=fly>0.?sdCap(f,vec2(0.,.34),vec2(-.08,.34)+vec2(-.10,.45)*sin(ph)*1.,.10,.04):sdEll(f-vec2(-.05,.32),vec2(.22,.10));
 float legs=fly>0.?9.:min(sdSeg(f,vec2(.05,.18),vec2(.08,0.)),sdSeg(f,vec2(-.04,.18),vec2(-.06,0.)))-.018;
 solid(litFlat(vec3(.35,.12,.05),.1),ss(px,-px,legs));
 solid(litFlat(br,.2),ss(px,-px,tail));solid(litFlat(mix(bf,br,ss(.26,.34,f.y)),.2),ss(px,-px,body));solid(litFlat(br*.8,.2),ss(px,-px,wing));
 solid(litFlat(br,.2),ss(px,-px,head));solid(litFlat(vec3(.65,.07,.03),.1)*1.3,ss(px,-px,bill));
 vec2 E=H+vec2(.03,.02);solid(litFlat(vec3(.75,.60,.05),.2)*1.2,ss(px,-px,length(f-E)-.045));eye(f,E,.028,0.);}
// The mud wallow: brown mud with a wet shine, in front of the rhinos' legs.
void wallow(vec2 q,float t){if(uDecor>1.5)return;float top=G0+.075+.008*sin(q.x*5.+.5)+.004*sin(q.x*17.);
 float e=sdEll(q-vec2(.10,G0+.0),vec2(.98,.11));float d=max(q.y-top,e);d=torn(d,q*2.,.003,25.);float c=cov(d);if(c<=0.)return;
 float v=sat((top-q.y)/.14);vec3 col=mix(vec3(.17,.11,.065),vec3(.10,.065,.04),v);
 // the wet shine: streaks of sky colour, broken; the dry rim at the back edge
 float sh=ss(.55,.95,sin(q.y*120.+sin(q.x*7.)*1.5))*ss(.3,.7,vn(vec2(q.x*6.,q.y*30.)+t*.05))*ss(top-.005,top-.03,q.y);
 col=mix(col,mix(SKYM,SKYH,.5)*.55,sh*.45);col=mix(col,vec3(.30,.20,.12),ss(.010,.0,top-q.y)*.8);
 solid(decCol(litFlat(col,.1)*1.15*(1.+fibre(q)*.3)),c);}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.);
 floorStrip(.16,G0+.05,.05,g*.95,12.);
 // the rhinos: grazing, then heads up and faces to us, then back to grazing
 float lift=ss(5.0,5.6,t)*ss(10.4,9.6,t),turn=ss(5.8,6.2,t)*ss(9.4,9.0,t),earF=ss(4.8,5.1,t)*ss(9.8,9.4,t);
 float liftC=ss(5.3,5.9,t)*ss(10.6,9.8,t),turnC=ss(6.1,6.5,t)*ss(9.6,9.2,t);
 rhino(q,vec2(.48,G0+.015),.30,-1.,liftC,turnC,earF,1.,t*1.3+1.,blinkAt(t,.7));
 rhino(q,vec2(-.25,G0-.005),.50,1.,lift,turn,earF,0.,t*1.1,blinkAt(t,.2));
 wallow(q,t);
 // the oxpeckers: along the backs (hops and pecks), up and round in the air, and back
 for(int i=0;i<4;i++){float fi=float(i);bool calf=i==3;
  float bx=calf?.48+(-.05+.06*sin(t*.7))*1.:-.25+(-.18+.14*fi+.04*sin(t*.6+fi*2.))*.50*1.;
  float base=calf?G0+.015+.30*.64:G0-.005+.50*(.60+.03*cos(fi*1.3))-.0;
  vec2 onBack=vec2(bx,base+.006*abs(sin(t*3.+fi*1.7)));
  float t0=4.6+fi*.07,t1=8.6+fi*.25;float up=ss(t0,t0+.25,t)*ss(t1+.9,t1,t);
  float ang=(t-t0)*1.1+fi*1.57;vec2 air=vec2(.10+.45*cos(ang),.24+.08*sin(ang*1.3)+.03*fi);
  vec2 p=mix(onBack,air,ss(0.,1.,up));float fly=step(.02,up)*step(up,.999)+step(.999,up);
  float dirB=fly>0.?(cos(ang)<0.?1.:-1.):(calf?-1.:1.);float peck=fly>0.?0.:ss(.6,.9,sin(t*2.3+fi*2.1));
  oxpecker(q,p,.050,dirB,fly,t*TAU*4.+fi,peck);}
 floorStrip(-.10,G0-.07,.05,g*.82,13.);
}
