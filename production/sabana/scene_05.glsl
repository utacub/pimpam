// 6 · Les zebres. A group of plains zebras on the golden morning grass. Two stand side by side, head to tail, and nibble each other's
// withers (mutual grooming). The mother grazes; her foal, browner and fluffier, sets off on a short playful run, kicks up its heels and
// comes back to her side (the key moment, ≈ 3–6 s). Then the whole group lifts its heads and turns its ears forward at once (≈ 8.2–9.6 s).
// The stripes are few, broad and soft (about eight to ten on each zebra, brown-black on cream, not black on white): a rule against
// patterns of high-contrast stripes for photosensitive children.
struct Ze{float legsN,legsF,hoof,body,neck,mane,head,muz,ear,tail,tuft;vec2 B,H,E;float ha;};
Ze zeParts(vec2 f,float ph,float run,float graze,float earUp,float kick,float young){Ze P;
 float lg=mix(1.,1.12,young);vec2 sF=vec2(.19,.46*lg),sB=vec2(-.19,.48*lg);
 // legs: a walk or a gallop (run), or the hind legs kicking up (kick)
 float a=sin(ph),b=sin(ph+PI*.5);
 vec2 f1=vec2(.20+.10*a*run,.05*max(0.,cos(ph))*run),f2=vec2(.16-.10*a*run,.05*max(0.,-cos(ph))*run);
 vec2 h1=vec2(-.18+.10*b*run,.05*max(0.,cos(ph+PI*.5))*run),h2=vec2(-.22-.10*b*run,.05*max(0.,-cos(ph+PI*.5))*run);
 h1=mix(h1,vec2(-.40,.22),kick);h2=mix(h2,vec2(-.42,.18),kick);
 float l=.235*lg;
 vec2 k1=knee(sF,f1,l,l,1.),k2=knee(sF-vec2(.04,0.),f2,l,l,1.),k3=knee(sB,h1,l,l,-1.),k4=knee(sB-vec2(.04,0.),h2,l,l,-1.);
 P.legsN=min(min(sdCap(f,sF,k1,.045,.026),sdCap(f,k1,f1+vec2(0.,.012),.026,.020)),min(sdCap(f,sB,k3,.060,.026),sdCap(f,k3,h1+vec2(0.,.012),.026,.020)));
 P.legsF=min(min(sdCap(f,sF-vec2(.04,0.),k2,.043,.025),sdCap(f,k2,f2+vec2(0.,.012),.025,.019)),min(sdCap(f,sB-vec2(.04,0.),k4,.058,.025),sdCap(f,k4,h2+vec2(0.,.012),.025,.019)));
 P.hoof=min(min(length(f-f1-vec2(0.,.008))-.024,length(f-h1-vec2(0.,.008))-.024),min(length(f-f2-vec2(0.,.008))-.023,length(f-h2-vec2(0.,.008))-.023));
 vec2 bc=vec2(0.,.53*lg);P.body=smin(smin(sdEll(f-bc,vec2(.27,.125)),length(f-vec2(.17,.52*lg))-.12,.06),length(f-vec2(-.19,.55*lg))-.125,.06);
 // the neck up or down to the grass, the mane on it
 vec2 B=vec2(.20,.60*lg);vec2 H=mix(B+vec2(.17,.17),B+vec2(.22,-.38*lg),graze);vec2 C=mix(B+vec2(.06,.14),B+vec2(.20,.0),graze);
 float nk=9.;vec2 pr=B;for(int i=1;i<=5;i++){float u=float(i)/5.;vec2 pt=mix(mix(B,C,u),mix(C,H,u),u);nk=min(nk,sdCap(f,pr,pt,mix(.085,.050,(u-.2)),mix(.085,.050,u)));pr=pt;}
 P.neck=nk;vec2 nd=normalize(H-B),pp=vec2(-nd.y,nd.x);P.mane=max(max(nk-.030*mix(1.,1.3,young),-nk+.0),max(-dot(f-B,pp)+.02,max(-dot(f-B,nd)-.05,dot(f-H,nd)+.02)));
 // the head: long, the dark muzzle; the ears turned forward when it listens
 P.B=B;P.H=H;P.ha=mix(-.80,-1.40,graze);vec2 hq=rot(P.ha)*(f-H);
 P.head=smin(length(hq)-.055,sdEll(hq-vec2(.10,-.005),vec2(.085,.040)),.03);P.muz=max(sdEll(hq-vec2(.16,-.005),vec2(.045,.038)),P.head+.002);
 float ea=mix(.6,1.25,earUp);P.ear=min(sdEll(rot(-ea)*(hq-vec2(-.03,.03))-vec2(.0,-.045),vec2(.018,.050)),sdEll(rot(-ea-.25)*(hq-vec2(-.045,.025))-vec2(.0,-.04),vec2(.017,.045)));
 P.ear=min(sdEll(rot(ea-1.57)*(hq-vec2(-.03,.035))-vec2(.0,.045),vec2(.020,.052)),sdEll(rot(ea-1.85)*(hq-vec2(-.045,.030))-vec2(.0,.040),vec2(.018,.046)));
 P.E=H+rot(-P.ha)*vec2(.025,.018);
 vec2 ta=vec2(-.30,.60*lg),tb=vec2(-.35+.03*sin(ph*.4+1.),.33*lg);P.tail=sdCap(f,ta,tb,.012,.008);P.tuft=sdEll(f-tb-vec2(0.,-.02),vec2(.018,.04));
 return P;}
float zeUnion(Ze P){return min(min(min(P.legsN,P.legsF),min(P.body,P.neck)),min(min(P.head,P.ear),P.tail));}
// The stripes: vertical on the body and across the neck, across the legs and the rump; soft and broad.
float stripes(vec2 f,Ze P,float young){float s=0.;vec2 nd=normalize(P.H-P.B);
 float body=sin(f.x*58.+1.2*sin(f.y*9.)+.5);float rump=sin(length(f-vec2(-.30,.70))*52.);float neck=sin(dot(f-P.B,nd)*62.);float leg=sin(f.y*46.);
 float w=f.x<-.10?mix(body,rump,ss(-.10,-.22,f.x)):body;
 w=mix(w,neck,ss(.08,.0,P.neck-.0)*ss(.12,.18,f.x+(f.y-.5)*.3));
 w=mix(w,leg,ss(.40,.30,f.y));
 return ss(.15,.35,w)*ss(.0,.12,f.y);}
void zebra(vec2 q,vec2 c,float s,float dir,float ph,float run,float graze,float earUp,float kick,float young,float bl,float nib,float t){
 vec2 f=(q-c)/s;f.x/=sdir(dir);if(f.y<-.05||f.y>1.1||f.x<-.55||f.x>.75)return;float px=PX/s;
 Ze P=zeParts(f,ph,run,graze,earUp,kick,young);
 {vec2 fs=f-SHD*.05/s*vec2(dir,1.);Ze S=zeParts(fs,ph,run,graze,earUp,kick,young);dropShadow(zeUnion(S)*s,.05,.32);}
 vec3 cream=mix(vec3(.82,.78,.70),vec3(.80,.70,.58),young),str=mix(vec3(.17,.15,.14),vec3(.30,.20,.13),young),dark=vec3(.06,.05,.05);
 float sp=stripes(f,P,young);vec3 alb=mix(cream,str,sp);
 solid(litFlat(alb*.68,.1),ss(px,-px,P.legsF));
 solid(litFlat(cream*.9,.1),ss(px,-px,P.tail));solid(litFlat(dark,.1),ss(px,-px,P.tuft));
 CUT(P.legsN*s,alb,f,.1,.004);solid(litFlat(dark,.1),ss(px,-px,P.hoof));
 under(min(P.body,P.neck)*s+.004,.012);
 CUT(min(P.body,P.neck)*s,alb,f*1.3,.15,.016);
 solid(litFlat(mix(cream,str,ss(-.3,.3,sin(dot(f-P.B,normalize(P.H-P.B))*62.))),.2),ss(px,-px,P.mane));
 solid(litFlat(alb*.85,.2),ss(px,-px,P.ear));
 vec2 hq=rot(P.ha)*(f-P.H);float hs=ss(.15,.35,sin(hq.x*70.+hq.y*20.))*ss(.10,.06,hq.x);
 CUT(P.head*s,mix(cream,str,hs),f*2.,.15,.008);
 solid(litFlat(dark*1.4,.1),ss(px,-px,P.muz));
 eye(f,P.E,.016,bl);
 solid(litFlat(dark,.1),ss(px,-px,length((hq-vec2(.185,.005))*vec2(1.,1.6))-.010));
 brad(q,c+vec2(.19*dir,.46*mix(1.,1.12,young))*s,.0045);}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.);
 floorStrip(.14,G0+.05,.04,g*.95,5.);
 float earUp=ss(8.2,8.6,t)*ss(9.8,9.3,t);
 // a zebra grazing at the back
 float gz3=mix(.9,0.,earUp);
 zebra(q,vec2(-.66,G0+.07),.34,1.,0.,0.,gz3,earUp,0.,0.,blinkAt(t,.8),0.,t);
 // the grooming pair, side by side, head to tail: each nibbles the withers of the other
 float nib1=.5+.5*sin(t*5.)*ss(.5,1.,sin(t*.8)),nib2=.5+.5*sin(t*5.3+1.)*ss(.5,1.,sin(t*.8+2.));
 zebra(q,vec2(.38,G0+.03),.44,1.,0.,0.,mix(.30+.06*nib2,0.,earUp),earUp,0.,0.,blinkAt(t,.2),0.,t);
 zebra(q,vec2(.61,G0+.0),.45,-1.,0.,0.,mix(.30+.06*nib1,0.,earUp),earUp,0.,0.,blinkAt(t,.6),0.,t);
 // the mother grazing, and her foal: a short run out to the right and back (with a kick of its heels at the far end)
 float u=sat((t-3.0)/3.0),ex=sin(PI*u);float back=step(.5,u);
 vec2 fc=vec2(.04-.52*ex,G0-.02+.035*abs(sin(t*TAU*1.6))*ss(0.,.1,ex));float run=ss(2.9,3.2,t)*ss(6.1,5.7,t);
 float kick=ss(4.25,4.45,t)*ss(4.8,4.6,t);float fdir=back>.5?1.:-1.;if(t<3.)fdir=1.;
 zebra(q,vec2(-.14,G0-.005),.46,1.,0.,0.,mix(.95,0.,earUp),earUp,0.,0.,blinkAt(t,.4),0.,t);
 zebra(q,fc,.33,fdir,t*TAU*1.6,run,0.,earUp,kick,1.,blinkAt(t,.9),0.,t);
 floorStrip(-.10,G0-.06,.05,g*.82,9.);
}
