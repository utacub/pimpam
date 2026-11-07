// 10 · Els hipopòtams. The camera at the surface of the river: half above and half below the water. Below, in the green water, a big
// hippo stands on the riverbed with only the top of its head (ears, eyes, nostrils) above the surface; farther back another hippo walks
// along the bottom in slow bounds, raising puffs of mud, and a few small fish pass. The key moment (≈ 3.4–6 s): the big hippo pushes up
// and gives an enormous yawn, its jaws wide open (the big lower tusks, the pink mouth), water dripping; then it closes and sinks back to
// eye level and flicks its ears. Yawning as a display and moving along shallow river bottoms: mason (2013); the slow bounds are a criterion (CANVIS).
const float WLv=.02;   // the waterline on the screen (scene units)
const float BED=-.37;  // the top of the riverbed
float waterY(float x,float t){return WLv+.004*sin(x*9.+t*1.3)+.002*sin(x*23.-t*1.9);}
struct Hp{float legsN,legsF,body,up,jaw,mouth,throat,tuskL,tuskU,inc,ear,eyeB,nos;vec2 E;};
// The parts of a hippo in its frame f (feet at y = 0, back at ≈ .58, facing +x). ph/walk: the legs; gape: 0 shut .. 1 a full yawn
// (the head piece turns up, the jaw down); ear: an ear flick.
Hp hpParts(vec2 f,float ph,float walk,float gape,float ear){Hp P;
 float a=sin(ph)*walk,b=sin(ph+PI)*walk;
 vec2 sF=vec2(.22,.22),sB=vec2(-.24,.22);
 P.legsN=min(sdCap(f,sF,vec2(.24+.07*a,.0+.03*max(0.,cos(ph))*walk),.085,.070),sdCap(f,sB,vec2(-.24-.07*b,.0+.03*max(0.,-cos(ph))*walk),.095,.072));
 P.legsF=min(sdCap(f,sF-vec2(.06,0.),vec2(.17+.07*b,.0),.080,.066),sdCap(f,sB-vec2(.06,0.),vec2(-.30-.07*a,.0),.090,.068));
 P.body=smin(sdEll(f-vec2(-.02,.33),vec2(.42,.22)),length(f-vec2(.22,.34))-.20,.08);
 // the head: hinge J at the back of the jaw; the head piece (skull and upper jaw, the bumps of the eyes, the ears and the nostrils on
 // top) turns up by ua, the lower jaw down by da
 vec2 J=vec2(.42,.33);float ua=.95*gape,da=.42*gape;
 vec2 u=rot(ua)*(f-J),d=rot(-da)*(f-J);
 P.up=smin(smin(sdEll(u-vec2(.02,.10),vec2(.13,.11)),sdEll(u-vec2(.21,.065),vec2(.135,.085)),.06),sdEll(u-vec2(.29,.085),vec2(.07,.075)),.03);
 P.up=max(P.up,-(u.y-.0)-.0);P.up=smin(P.up,sdEll(u-vec2(-.03,.06),vec2(.12,.10)),.04);
 P.eyeB=sdEll(u-vec2(.05,.19),vec2(.040,.032));P.nos=sdEll(u-vec2(.30,.155),vec2(.032,.022));
 P.ear=sdEll(rot(-.4+.5*ear)*(u-vec2(-.05,.20))-vec2(0.,.025),vec2(.020,.035));
 P.E=J+rot(-ua)*vec2(.055,.195);
 P.jaw=max(smin(sdEll(d-vec2(.15,-.03),vec2(.17,.085)),sdEll(d-vec2(.29,-.01),vec2(.085,.075)),.05),d.y-.035);
 // the open mouth: the wedge between the jaws, pink, dark at the throat; the big lower tusks, the smaller upper ones, the incisors
 float am=atan(u.y,u.x),dm=atan(d.y,d.x);float r=length(f-J);
 P.mouth=max(max(u.y-.01,-d.y+.0),max(r-.34,J.x-f.x-.02));P.mouth=max(P.mouth,-gape+.04);
 P.throat=max(P.mouth,r-.10);
 P.tuskL=gape<.05?9.:sdCap(d,vec2(.27,.0),vec2(.25,.11),.022,.006);
 P.tuskU=gape<.05?9.:sdCap(u,vec2(.25,.01),vec2(.26,-.045),.012,.004);
 P.inc=gape<.05?9.:min(sdCap(d,vec2(.34,.005),vec2(.39,.035),.010,.005),sdCap(d,vec2(.32,.0),vec2(.36,.04),.009,.004));
 return P;}
float hpUnion(Hp P){return min(min(min(P.legsN,P.legsF),P.body),min(min(P.up,P.jaw),P.ear));}
void hippo(vec2 q,vec2 c,float s,float dir,float ph,float walk,float gape,float ear,float bl){
 vec2 f=(q-c)/s;f.x/=sdir(dir);if(f.y<-.05||f.y>.95||f.x<-.55||f.x>.95)return;float px=PX/s;
 Hp P=hpParts(f,ph,walk,gape,ear);
 vec3 skin=vec3(.17,.13,.14),pink=vec3(.46,.24,.22),belly=vec3(.30,.19,.18);
 solid(litFlat(skin*.65,.1),ss(px,-px,P.legsF));
 CUT(P.legsN*s,skin*.95,f,.1,.006);
 under(P.body*s,.012);CUT(P.body*s,mix(skin,belly,ss(.28,.14,f.y)*.6),f*1.2,.1,.020);
 // the mouth (behind the jaws), then the jaw, then the head piece
 float mc=ss(px,-px,P.mouth);if(mc>0.){solid(litFlat(mix(vec3(.55,.24,.26),vec3(.18,.05,.07),ss(.25,.06,length(f-vec2(.42,.33)))),.2),mc);}
 CUT(P.tuskL*s,vec3(.92,.88,.76),f*3.,.2,.004);
 under(P.jaw*s,.006);CUT(P.jaw*s,mix(skin*1.1,pink,.30),f*1.6,.1,.012);
 CUT(P.inc*s,vec3(.90,.86,.74),f*3.,.2,.003);
 solid(litFlat(skin*1.1,.2),ss(px,-px,P.ear));solid(litFlat(pink,.2),ss(px,-px,P.ear+.008));
 under(P.up*s,.008);CUT(P.up*s,skin*1.12,f*1.5,.1,.016);
 CUT(P.tuskU*s,vec3(.92,.88,.76),f*3.,.2,.003);
 CUT(P.eyeB*s,skin*1.25,f*2.,.1,.008);CUT(P.nos*s,skin*1.25,f*2.,.1,.006);
 solid(litFlat(pink*.9,.2),ss(px,-px,abs(P.up+.012)-.006)*ss(.0,.02,-P.up)*0.);
 eye(f,P.E,.017,bl);
 vec2 n=vec2(.30,.155);}
// The water below the surface: green, lighter just under the surface; the riverbed of mud and stones, the waterweed.
void underwater(vec2 q,float t){if(uDecor>1.5)return;float w=waterY(q.x,t);if(q.y>w)return;
 float dep=sat((w-q.y)/.42);vec3 col=mix(vec3(.17,.27,.21),vec3(.06,.10,.08),pow(dep,.8));col=mix(col,col+SKYH*.06,ss(.04,.0,w-q.y));
 col*=1.+(fbm(q*vec2(3.,7.)+vec2(t*.03,0.))-.5)*.18;
 solid(decCol(litFlat(col,.1)*1.35*(1.+fibre(q)*.2)),1.);}
void riverbed(vec2 q,float t){if(uDecor>1.5)return;float top=BED+.020*sin(q.x*3.+1.)+.010*sin(q.x*9.);float d=torn(q.y-top,q*2.,.004,25.);float c=cov(d);if(c<=0.)return;
 vec3 col=mix(vec3(.20,.16,.09),vec3(.13,.10,.06),ss(top,top-.12,q.y));col*=1.+.1*(vn(q*vec2(30.,60.))-.5);
 float st=9.;for(int i=0;i<9;i++){float fi=float(i);vec2 p=vec2(-.85+fi*.21+.05*h11(fi),top-.015-.02*h11(fi+2.));st=min(st,sdEll(q-p,vec2(.025+.02*h11(fi+5.),.014+.008*h11(fi+7.))));}
 col=mix(col,vec3(.16,.14,.10),ss(PX,-PX,st)*.8);
 solid(decCol(litFlat(col,.1)*1.3*(1.+fibre(q)*.35)),c);}
void weed(vec2 q,float t){if(uDecor>1.5)return;float d=9.;
 for(int i=0;i<6;i++){float fi=float(i);float x=fi<3.?-.85+fi*.07:.55+fi*.06;vec2 a=vec2(x,BED-.01);vec2 pr=a;
  for(int k=1;k<=5;k++){float u=float(k)/5.;vec2 p=a+vec2(.03*sin(t*.7+fi+u*3.)*u,u*(.16+.08*h11(fi)));d=min(d,sdCap(q,pr,p,.010-.006*u,.010-.006*u));pr=p;}}
 float c=cov(d);if(c<=0.)return;solid(decCol(litFlat(vec3(.10,.20,.07),.4)*1.3),c);}
// The veil of the water over what is in it: tints and dims with the depth; the light rays from the surface; the motes.
void veil(vec2 q,float t,float k){if(uDecor>1.5)return;float w=waterY(q.x,t);if(q.y>w)return;float dep=sat((w-q.y)/.42);
 shade(k*(.25+.45*dep),mix(vec3(.55,.85,.72),vec3(.35,.55,.50),dep));
 float ray=0.;for(int i=0;i<4;i++){float fi=float(i);float x=-.6+fi*.42+.08*sin(t*.2+fi);float l=q.x-x-(q.y-w)*.35;ray+=ss(.06,.0,abs(l))*(.6+.4*sin(t*.5+fi*2.));}
 glow(mix(SUNC,vec3(.6,.9,.7),.4)*ray*.035*(1.-dep)*k);
 vec2 g=q*vec2(22.,22.)+vec2(t*.15,t*.05);vec2 id=floor(g),fr=fract(g)-.5;vec2 h=h22(id);if(h.x<.12){float r=length(fr-(h-.5)*.6);glow(vec3(.5,.6,.5)*ss(.07,.02,r)*.06*k);}}
// The surface seen from just below and just above: a bright line where the paper of the water ends; the far bank with its grass.
void surface(vec2 q,float t){if(uDecor>1.5)return;float w=waterY(q.x,t);float l=abs(q.y-w);
 solid(decCol(litFlat(mix(SKYH,vec3(1.),.4),.3)),ss(PX*2.,0.,l-PX*.6)*.75);}
void farBank10(vec2 q,float t){if(uDecor>1.5)return;vec2 u=atS(.40);float px=pxS(.40);float top=WLv+.07+.012*sin(u.x*2.5+.4)+.006*sin(u.x*9.);
 float d=torn(u.y-top,u*2.,.004,22.);float c=ss(px,-px,d)*step(WLv-.01,u.y);if(c<=0.)return;
 vec3 col=mix(vec3(.18,.20,.07),grassAlb(uScene.x,4.)*.8,ss(WLv,top,u.y));vec3 cc=litFlat(col,.3)*(1.+fibre(u)*.35);
 // papyrus heads along the top
 solid(decCol(cc),c*DEC());
 float pd=9.;for(int i=0;i<14;i++){float fi=float(i);float x=-.95+fi*.14+.05*h11(fi);float h=.07+.05*h11(fi+3.);vec2 b=vec2(x,top-.01),tp=b+vec2(.01*sin(t*.8+fi),h);
  pd=min(pd,sdCap(u,b,tp,.004,.003));pd=min(pd,max(length(u-tp-vec2(0.,.012))-.028,-(u.y-tp.y+.004)));}
 solid(decCol(litFlat(vec3(.20,.26,.08),.4)),ss(px,-px,pd)*DEC());}
// Small fish passing, silver olive, in a loose school.
void fishes(vec2 q,float t){float d=9.;for(int i=0;i<6;i++){float fi=float(i);float x=-1.1+(t-3.5)*.16+.10*fi*0.+.07*sin(fi*2.3)-.06*fi;float y=-.13+.05*sin(fi*1.7)+.012*sin(t*1.5+fi);
  vec2 l=(q-vec2(x,y))/.06;l.y+=.06*sin(l.x*3.+t*8.+fi);float b=sdEll(l,vec2(.55,.22));b=min(b,max(sdEll(l-vec2(-.62,0.),vec2(.22,.28)),l.x+.48));d=min(d,b*.06);}
 float c=cov(d);if(c<=0.)return;solid(litFlat(vec3(.40,.42,.32),.3)*1.3,c*.9);}
// Bubbles from the walking hippo: rising, wobbling.
void bubbles(vec2 q,vec2 src,float t){for(int i=0;i<10;i++){float fi=float(i);float t0=fi*.9+.3*h11(fi);float a=mod(t-t0,9.);vec2 p=src+vec2(.015*sin(a*4.+fi)+.03*h11(fi+1.)*a,a*.07);
  if(p.y>WLv-.01||a<0.)continue;float r=.006+.004*h11(fi+3.);float d=abs(length(q-p)-r)-.0015;glow(vec3(.55,.75,.65)*ss(PX,-PX,d)*.30);}}
void scene(vec2 q,float t){
 farBank10(q,t);
 underwater(q,t);
 riverbed(q,t);
 // the walking hippo, far back on the bottom: slow bounds, a puff of mud at each landing
 float bt=min(t*.62,5.);float bi=floor(bt),bu=bt<5.?fract(bt):0.;float xb=.88-.11*(bi+ss(.0,.8,bu));float yb=BED+.03+.05*sin(PI*ss(.05,.8,bu));
 for(int k=0;k<3;k++){float a=bu+float(k)-.85;float pa=a/.62;if(pa<0.||pa>1.6)continue;vec2 pc=vec2(xb+.11*float(k)-.02,BED+.02);float dz=fbm((q-pc)*vec2(14.,20.)+t*.3);float m=ss(.10+pa*.08,.0,length((q-pc)*vec2(1.,1.7)))*ss(1.6,.6,pa);
  shade(sat(dz*m*1.4)*.5,vec3(.70,.62,.45));}
 hippo(q,vec2(xb,yb),.30,-1.,bu*TAU,ss(.0,.2,bu)*ss(.9,.7,bu),0.,0.,blinkAt(t,.6));
 bubbles(q,vec2(xb-.15,yb+.16),t);
 veil(q,t,.55);
 fishes(q,t);
 weed(q,t);
 // the big hippo: on the bottom at the left, the top of its head out of the water; it pushes up and yawns, then sinks back
 float up=ss(3.2,3.9,t)*ss(7.2,6.4,t);float gape=ss(3.6,4.5,t)*ss(5.9,5.2,t);float ear=ss(.0,.1,fract(t*.7))*ss(.3,.15,fract(t*.7))*ss(7.,7.3,t)*0.+(ss(7.6,7.7,t)-ss(7.8,7.95,t))+(ss(8.3,8.4,t)-ss(8.5,8.65,t));
 vec2 hc=vec2(-.42,BED+.035+.06*up);
 hippo(q,hc,.70,1.,0.,0.,gape,ear,blinkAt(t,.2));
 veil(q,t,.25);
 // the drips from the jaws when it yawns; the ripples on the surface around the head
 for(int i=0;i<12;i++){float fi=float(i);float t0=4.0+fi*.14;float a=t-t0;if(a<0.||a>.8)continue;vec2 p=hc+vec2(.38+.12*h11(fi),.33+.12*h11(fi+2.))*.70+vec2(0.,-.9*a*a);
  if(p.y<WLv)continue;glow(vec3(.8,.9,.9)*ss(.006,.002,length(q-p))*.5);}
 surface(q,t);
}
