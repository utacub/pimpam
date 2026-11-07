// 8 · Els facoquers. Close to the ground among the grass. A warthog grazes kneeling on its front wrists, its snout in the grass, and
// her three piglets graze beside her (0–3.6 s). She gets up and trots off to the right with her thin tail held straight up like an
// antenna; the piglets jump up and follow her in a line, their tails up too (the key moment, ≈ 3.6–6.6 s). At the old termite mound
// they stop; the mother turns her warty face to us and the piglets wag their tails. Kneeling on the wrists to graze and running with the
// tail upright are well-known warthog habits (CANVIS). Piglets are plain grey-brown (they have no stripes).
float WAG=0.;
struct Wh{float legsN,legsF,body,head,snout,nose,tusk,wart,ear,mane,tail,tuft;vec2 E,E2;float front;};
Wh whParts(vec2 f,float ph,float trot,float kneel,float tailUp,float young,float look){Wh P;
 float dn=.11*kneel;vec2 sF=vec2(.14,.25-dn),sB=vec2(-.17,.27);
 float a=sin(ph)*trot,b=sin(ph+PI)*trot,ca=max(0.,cos(ph))*trot,cb=max(0.,-cos(ph))*trot;
 vec2 f1=vec2(.16+.07*a,.035*ca),f2=vec2(.12+.07*b,.035*cb),h1=vec2(-.15+.07*b,.035*cb),h2=vec2(-.19+.07*a,.035*ca);
 // kneeling: the front legs fold at the wrist; the wrists rest on the ground and the feet lie back along it
 vec2 w1=vec2(.20,.022),w2=vec2(.16,.020);
 vec2 k1=knee(sF,f1,.13,.13,1.),k2=knee(sF-vec2(.035,0.),f2,.13,.13,1.);
 k1=mix(k1,w1,kneel);k2=mix(k2,w2,kneel);f1=mix(f1,vec2(.08,.016),kneel);f2=mix(f2,vec2(.04,.014),kneel);
 vec2 k3=knee(sB,h1,.14,.14,-1.),k4=knee(sB-vec2(.035,0.),h2,.14,.14,-1.);
 P.legsN=min(min(sdCap(f,sF,k1,.046,.022),sdCap(f,k1,f1+vec2(0.,.008),.022,.018)),min(sdCap(f,sB,k3,.060,.024),sdCap(f,k3,h1+vec2(0.,.008),.024,.018)));
 P.legsF=min(min(sdCap(f,sF-vec2(.035,0.),k2,.044,.021),sdCap(f,k2,f2+vec2(0.,.008),.021,.017)),min(sdCap(f,sB-vec2(.035,0.),k4,.057,.023),sdCap(f,k4,h2+vec2(0.,.008),.023,.017)));
 // the barrel of the body, the hump of the shoulders (lower when it kneels)
 vec2 bq=rot(.24*kneel)*(f-vec2(-.02,.31-dn*.45));P.body=smin(sdEll(bq,vec2(.26,.125)),length(f-vec2(.13,.32-dn))-.125,.06);
 // the head: big, held low; the flat disc of the nose, the warts, the curved tusks. Down to the grass when it kneels. Front view
 // (the face turned to us) when look is past half.
 float hs=mix(1.,1.22,young);vec2 hc=mix(vec2(.31,.29),vec2(.33,.115),kneel);float hang=mix(-.22,-.95,kneel);
 P.front=step(.5,look);
 if(P.front<.5){vec2 hq=rot(-hang)*(f-hc)/hs;
  P.head=smin(sdEll(hq,vec2(.105,.090)),sdEll(hq-vec2(.12,-.03),vec2(.10,.058)),.05);
  P.snout=max(sdEll(hq-vec2(.175,-.035),vec2(.065,.050)),P.head+.002);
  P.nose=sdEll(hq-vec2(.235,-.035),vec2(.016,.044));
  P.wart=young>.5?9.:min(sdEll(hq-vec2(.04,-.045),vec2(.024,.020)),sdEll(hq-vec2(.13,.02),vec2(.018,.022)));
  P.tusk=young>.5?9.:min(sdCap(hq,vec2(.15,-.065),vec2(.22,.03),.017,.006),sdCap(hq,vec2(.13,-.06),vec2(.17,.0),.012,.005));
  P.ear=sdEll(rot(.45)*(hq-vec2(-.055,.085)),vec2(.028,.052));
  P.E=hc+rot(hang)*vec2(.035,.035)*hs;P.E2=vec2(9.);}
 else{vec2 hq=(f-hc-vec2(.0,.02))/hs;vec2 m=vec2(abs(hq.x),hq.y);
  P.head=smin(sdEll(hq-vec2(0.,.02),vec2(.105,.095)),sdEll(hq-vec2(0.,-.07),vec2(.085,.060)),.05);
  P.snout=max(sdEll(hq-vec2(0.,-.085),vec2(.070,.050)),P.head+.002);
  P.nose=sdEll(hq-vec2(0.,-.11),vec2(.048,.030));
  P.wart=young>.5?9.:min(sdEll(m-vec2(.105,-.02),vec2(.022,.026)),sdEll(m-vec2(.075,.005),vec2(.015,.013)));
  P.tusk=young>.5?9.:sdCap(m,vec2(.055,-.11),vec2(.13,-.02),.016,.006);
  P.ear=sdEll(rot(-.7)*(m-vec2(.10,.10)),vec2(.026,.050));
  P.E=hc+vec2(-.050,.055)*hs;P.E2=hc+vec2(.050,.055)*hs;}
 P.head*=hs;P.snout*=hs;P.nose*=hs;P.wart*=hs;P.tusk*=hs;P.ear*=hs;
 // the long wiry mane along the neck and back (the adults); the tail: hanging, or straight up like an antenna
 float mn=9.;for(int i=0;i<8;i++){float fi=float(i)/7.;vec2 a2=mix(vec2(.24,.40-dn*1.2),vec2(-.12,.42),fi);mn=min(mn,sdCap(f,a2,a2+vec2(-.06,.055+.015*sin(fi*9.)),.011,.003));}
 P.mane=young>.5?9.:mn;
 vec2 ta=vec2(-.27,.34),tb=mix(vec2(-.31,.19),vec2(-.29+.035*sin(WAG),.60),tailUp)+vec2(.010*sin(ph*2.)*trot,0.);
 P.tail=sdCap(f,ta,tb,.010,.007);vec2 td=normalize(tb-ta);P.tuft=sdEll(vec2(dot(f-tb,vec2(td.y,-td.x)),dot(f-tb,td)),vec2(.014,.032));
 return P;}
float whUnion(Wh P){return min(min(min(P.legsN,P.legsF),min(P.body,P.head)),min(min(P.tail,P.ear),min(P.mane,P.tusk)));}
void warthog(vec2 q,vec2 c,float s,float dir,float ph,float trot,float kneel,float tailUp,float young,float look,float bl){
 vec2 f=(q-c)/s;f.x/=sdir(dir);if(f.y<-.05||f.y>.75||f.x<-.45||f.x>.6)return;float px=PX/s;
 Wh P=whParts(f,ph,trot,kneel,tailUp,young,look);
 {vec2 fs=f-SHD*.04/s*vec2(dir,1.);Wh S=whParts(fs,ph,trot,kneel,tailUp,young,look);dropShadow(whUnion(S)*s,.04,.32);}
 vec3 skin=mix(vec3(.115,.095,.085),vec3(.19,.145,.115),young),dark=vec3(.035,.028,.024),mane=vec3(.42,.28,.13);
 solid(litFlat(skin*.62,.1),ss(px,-px,P.legsF));
 solid(litFlat(skin*.8,.1),ss(px,-px,P.tail));solid(litFlat(young>.5?skin*.6:mane*.7,.3),ss(px,-px,P.tuft));
 CUT(P.legsN*s,skin*.95,f,.1,.004);
 under(P.body*s,.01);CUT(P.body*s,skin*(1.+.10*sin(f.x*46.+f.y*18.)),f*1.3,.1,.016);
 solid(litFlat(mane,.5),ss(px,-px,P.mane));
 solid(litFlat(skin*1.25,.3),ss(px,-px,P.ear));
 under(P.head*s,.01);CUT(P.head*s,skin*1.08,f*1.5,.1,.012);
 under(P.wart*s,.004);CUT(P.wart*s,skin*1.30,f*3.,.1,.010);
 CUT(P.snout*s,skin*1.22,f*2.,.1,.008);solid(litFlat(dark*1.6,.1),ss(px,-px,P.nose));
 if(P.front>.5){vec2 hq=(f-vec2(0.,.0))/1.;}
 CUT(P.tusk*s,vec3(.88,.84,.70),f*3.,.2,.003);
 float er=.015*mix(1.,1.25,young);eye(f,P.E,er,bl);eye(f,P.E2,er,bl);
 brad(q,c+vec2(.14*dir,(.25-.11*kneel))*s,.005);}
// The old termite mound at the right, with a dark burrow at its foot. Decor.
float moundD(vec2 u){vec2 l=u-vec2(.80,G0);float d=max(abs(l.x)-.15*(1.-l.y/.36)-.03,l.y-.34);d=smin(d,sdEll(l-vec2(-.02,.33),vec2(.05,.045)),.04);
 d=smin(d,sdEll(l-vec2(.07,.22),vec2(.05,.04)),.03);return max(d,-l.y-.1)+.007*(vn(u*30.)-.5);}
void mound(vec2 q){if(uDecor>1.5)return;vec2 u=atS(.06);dropShadow(moundD(u-SHD*.03),.03,.35*(uDecor>.5?uOpacity:1.));float d=moundD(u);float c=cov(d);if(c<=0.)return;
 vec3 col=litFlat(vec3(.34,.16,.075),.1)*(1.+.14*sin(u.y*70.+vn(u*20.)*4.))*(1.+fibre(u*2.)*.4);
 float hole=sdEll(u-vec2(.78,G0+.030),vec2(.060,.042));col=mix(col,vec3(.03,.02,.02),ss(PX,-PX,hole)*.9);
 col=mix(col,col*1.35,ss(-PX*3.,-PX*.3,d)*.5);solid(decCol(col),c);}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.)*vec3(.88,.86,.80);
 floorStrip(.10,G0+.04,.06,g*.95,7.);
 mound(q);
 floorStrip(.03,G0+.008,.05,g*.88,8.);
 // the mother: kneeling and grazing; up; trotting towards the mound with her tail up; then she turns her face to us
 float up=ss(3.3,3.7,t),go=ss(3.6,3.9,t)*ss(6.6,6.2,t);float xm=-.28+.52*ss(3.7,6.4,t);
 float look=ss(7.,7.6,t)*ss(10.8,10.2,t);
 float kn=(1.-up);WAG=0.;
 warthog(q,vec2(xm,G0-.012),.55,1.,(t-3.6)*TAU*1.8,go,kn,ss(3.5,3.8,t)*ss(10.6,9.6,t),0.,look,blinkAt(t,.3));
 // the piglets: grazing kneeling beside her; they jump up and follow her in a line, tails up, and wag them when they stop
 for(int i=0;i<3;i++){float fi=float(i);float d0=3.9+fi*.30;
  float xs=fi==0.?-.58:fi==1.?-.74:-.88,xe=-.06-.29*fi,ys=fi==1.?-.006:fi==2.?-.034:-.022,ye=-.020-.004*fi;
  float u=ss(d0,d0+2.4,t);float xp=mix(xs,xe,u),yp=mix(ys,ye,u);float gp=ss(d0-.1,d0+.25,t)*ss(d0+2.7,d0+2.3,t);
  WAG=ss(d0+2.5,d0+2.9,t)*ss(10.5,9.8,t)>0.?t*15.+fi:0.;
  float kp=1.-ss(d0-.45,d0-.15,t);
  warthog(q,vec2(xp,G0+yp),.27,1.,(t-d0)*TAU*2.6+fi,gp,kp,ss(d0-.3,d0,t)*ss(10.8,10.,t),1.,0.,blinkAt(t,fi*.23));}
 floorStrip(-.08,G0-.07,.07,g*.80,11.);
}
