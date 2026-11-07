// ---- Scene 10: striped dolphins at the bow of a sailboat (the Ligurian Sea, summer) ----
// Half above and half under the water. A sailboat runs to the right under its white jib, pushing a wave ahead of its bow; 2–4.5 s six
// striped dolphins (2.2 m) come up from behind in pairs and take their places in that wave, riding it with hardly a beat of their
// flukes (riding a bow wave lets dolphins travel at very little cost; Williams et al., 1992); 5.6–8 one rolls onto its side, its eye
// turned up to the boat; 7 s and 9 s a pair leaps out of the bow wave together; 11 s they peel away, faster than the boat, and go.
// Each dolphin is drawn in its own world at its distance m, scaled about the waterline (the lens is at the surface).
const float LDL=.22,VBT=.35,XST=-.15;
float pitchB(float T){return .020*sin(T*1.7)+.008*sin(T*2.9+1.);}
float heaveB(float T){return .006*sin(T*1.7+.8);}
vec2 hullQ(vec2 w,float T){vec2 pv=vec2(XST-.45,0.);return rot(-pitchB(T))*(w-pv-vec2(0.,heaveB(T)))+pv;}
float surfD(float x,float T){float b=.026*exp(-pow((x-XST-.03)/.045,2.))-.008*exp(-pow((x-XST+.14)/.07,2.))*step(x,XST+.03);
 return waves(x+VBT*T,T,.85)+b;}
// the hull in the boat's frame: white topsides with a raked stem, the forefoot curving back under the water, the fin keel
float hullD(vec2 q){float yS=.125+.012*ss(XST-.6,XST,q.x);float dA=q.y-yS;
 float dF=q.y>=0.?(q.x-XST-.35*q.y)*.94:(q.x>XST-.10?sdEll(q-vec2(XST-.10,0.),vec2(.10,.09)):-.09-q.y);
 float d=max(dA,dF);
 vec2 kq=q-vec2(XST-.56,-.09);float kl=max(max(abs(kq.x+.012*kq.y/.13)-.050+.012*(-kq.y/.13),kq.y-.005),-kq.y-.13);
 kl=min(kl,sdEll(kq-vec2(-.020,-.135),vec2(.075,.016)));return min(d,kl);}
// ---- the dolphins ----
vec3 dSlot(int k){return k==0?vec3(.32,-.060,.86):k==1?vec3(.40,-.092,.96):k==2?vec3(.13,-.110,.80):k==3?vec3(.21,-.142,.90):k==4?vec3(.56,-.120,1.25):vec3(.48,-.090,1.38);}
float dArr(int k){return 2.0+.55*float(k/2)+.22*float(k-2*(k/2));}
float dLeap(int k){int p=k/2;return p==0?7.0+.12*float(k):p==2?9.0+.10*float(k-4):-100.;}
float dLeave(int k){return 11.0+.35*float(k/2)+.15*float(k-2*(k/2));}
float dRoll(int k,float T){return .12*sin(T*.5+float(k));}
// one comes up to breathe: its head and back break the surface, a quick puff from the blowhole
float dBreath(int k){return k==2?5.9:k==3?10.1:-100.;}
// A small splash of a dolphin: foam on the surface and a crown of spray and drops (no streaks)
void dSplash(vec2 w,float sy,float x0,float wd,float ht,float t,float k){if(k<=.001)return;float y=w.y-sy;float dx=(w.x-x0)/wd;if(abs(dx)>1.6||y<-.02||y>ht*1.6)return;
 float foam=ss(1.2,.3,abs(dx))*ss(.016,.0,abs(y-.003))*(.45+.55*fbm(w*90.+t));
 float cr=ht*(.35+.65*ss(.0,.8,abs(dx)))*ss(1.15,.75,abs(dx));float env=ss(cr,cr*.3,y)*ss(-.002,.006,y)*ss(1.2,.5,abs(dx));
 float spray=env*ss(.42,.70,fbm(vec2(w.x*70.,(y-t*.25)*55.)));
 vec2 dq=vec2(w.x*90.,(y+t*t*.5)*90.);vec2 di=floor(dq);float drop=ss(.22,.08,length(fract(dq)-.2-.6*h22(di)))*step(.82,h21(di+2.))*ss(1.5,.7,abs(dx))*ss(ht*1.5,ht*.6,y)*ss(.0,.01,y);
 putF(SUNC*vec3(.95,.97,.98),sat(foam*.85+spray*.8+drop*.9)*k);}
// the snout, in the dolphin's own world (x ahead of the stem, y the depth), relative to the boat
vec2 dPos(int k,float T){vec3 S=dSlot(k);float fk=float(k);
 vec2 p=vec2(S.x+.030*sin(T*.7+fk*1.3),S.y+.010*sin(T*1.1+fk*2.1));
 float ua=ss(dArr(k)-1.6,dArr(k)+.9,T);p+=vec2(-1.7,-.14)*(1.-ua)*(1.-ua);
 float tau=T-dLeap(k);float vy0=.55,g=.98,ta=2.*vy0/g;
 if(tau>-.7&&tau<ta+2.6){float y0=S.y;float dx=.15*clamp(tau+.35,0.,ta+.35)*(1.-ss(ta+.5,ta+2.6,tau));
  if(tau<0.){float u=(tau+.7)/.7;p.y=(2.*u*u*u-3.*u*u+1.)*y0+(u*u*u-u*u)*vy0*.7;}
  else if(tau<ta){p.y=vy0*tau-.5*g*tau*tau;}
  else{float u=min((tau-ta)/1.5,1.);p.y=(u*u*u-2.*u*u+u)*(-vy0*1.5)+(-2.*u*u*u+3.*u*u)*y0;}
  p.x+=dx;}
 float tb=T-dBreath(k);if(tb>-.7&&tb<1.1){float u=sat((tb+.7)/1.8);p.y=mix(p.y,.004,pow(sin(PI*u),1.5));p.x+=.04*sin(PI*u);}
 float tl=max(T-dLeave(k),0.);p+=vec2(.42*tl*tl,-.09*tl*tl);
 return p;}
float topDl(float s){float bk=.011+.03*s;float b=s<.42?.114*(1.-pow(1.-sat((s-.045)/.375),2.2)):.114*(1.-pow((s-.42)/.60,1.7))+.010*ss(.42,1.,s);return max(bk,b);}
float botDl(float s){float bk=.009+.02*s;float b=s<.43?.106*(1.-pow(1.-sat((s-.030)/.40),2.0)):.106*(1.-pow((s-.43)/.60,1.5))+.008*ss(.43,1.,s);return max(bk,b);}
float pfD(float s,float c,float sn,bool top){float t=topDl(s),b=botDl(s),m=.5*(t+b);
 float wt=max(c,0.)*max(c,0.),wb=max(-c,0.)*max(-c,0.),wm=sn*sn;return top?(t*wt+b*wb+m*wm):(b*wt+t*wb+m*wm);}
float pfSideD(vec2 f,float c,float sn,bool top){float e=.008;float t=pfD(f.x,c,sn,top)*BL;float dt=(pfD(f.x+e,c,sn,top)-pfD(f.x-e,c,sn,top))/(2.*e);
 return ((top?1.:-1.)*f.y-t)/sqrt(1.+dt*dt);}
void dolphin(vec2 w,int k,float T,float m,float wpx0){
 float sy=surfD(w.x,T);
 // where it breaks the surface: the splash out and the splash in
 {float tau=T-dLeap(k);float ta=2.*.55/.98;
  if(tau>-.15&&tau<ta+1.2&&w.y>sy-.03){float sx0=CAM.x+(XST+dPos(k,dLeap(k)).x-CAM.x)*m,sx1=CAM.x+(XST+dPos(k,dLeap(k)+ta).x-CAM.x)*m;
   dSplash(w,sy,sx0,.045,.035,tau+3.,ss(-.12,.03,tau)*(1.-ss(.20,.60,tau))*.80);
   dSplash(w,sy,sx1,.060,.070,tau-ta,ss(ta-.08,ta+.04,tau)*(1.-ss(ta+.35,ta+1.0,tau))*.90);}}
 vec2 p0=dPos(k,T-.10),p1=dPos(k,T-.05),p2=dPos(k,T);
 vec2 v1=(p1-p0)*vec2(m,1.)/.05+vec2(VBT,0.),v2=(p2-p1)*vec2(m,1.)/.05+vec2(VBT,0.);float a1=atan(v1.y,v1.x),a2=atan(v2.y,v2.x);
 float kap=(a2-a1)/(.05*max(length(v2),.05));
 vec2 head=vec2(CAM.x+(XST+p2.x-CAM.x)*m,p2.y);
 float fast=max(ss(dArr(k)-1.6,dArr(k)-.3,T)*(1.-ss(dArr(k)+.2,dArr(k)+1.2,T)),ss(dLeave(k),dLeave(k)+.6,T));
 float ph=TAU*1.7*T+float(k)*1.9;
 spine(head,a2,LDL,1.,mix(.018,.060,fast),ph,clamp(-kap*LDL,-1.,1.));
 {float tb=T-dBreath(k);if(tb>-.05&&tb<1.2){vec2 bh=bodyPt(.11,topDl(.11)*BL);bh.y=max(bh.y,surfD(bh.x,T));float r=1.-exp(-tb*7.);vec2 bq=(w-bh-vec2(-.010*tb,.022*r))/vec2(.012+.020*r,.020+.022*r);
  float pf=ss(1.,.2,length(bq))*(.4+.6*fbm(w*140.-vec2(0.,tb*2.)))*(1.-ss(.25,1.2,tb))*ss(-.05,.02,tb);putF(vec3(.90,.93,.96)*SUNC,pf*.75*step(sy-.004,w.y));}}
 if(spineNear(w)>.20*LDL)return;
 float phi=dRoll(k,T);float c=cos(phi),sn=sin(phi);
 vec3 f=bodyF(w);float d=max(pfSideD(f.xy,c,sn,true),pfSideD(f.xy,c,sn,false));d=smax(d,-f.x*BL,.010*BL);d=max(d,(f.x-1.02)*BL);
 // the falcate dorsal fin, turning away with the roll
 float H=.105*BL*max(c,0.);float dfin=1e5;
 if(H>.004*BL){vec2 fq=vec2((f.x-.40)*BL,f.y-pfD(.50,c,sn,true)*BL+.004*BL);float yn=sat(fq.y/H);
  float xle=.090*BL*pow(yn,1.7),xte=.088*BL+.112*BL*pow(1.-yn,2.2);dfin=max(max(xle-fq.x,fq.x-xte),max(-fq.y,fq.y-H));
  d=smin(d,dfin,.006*BL);}
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float dK=flukeD(tq,.14*LDL,min(.62+.16*abs(sin(ph-1.))+.4*sn*sn,1.),0.);   // (seen a little from above, so the flukes read: edge-on they vanished)
 // the near flipper
 vec2 dd=bodyDir(.24);vec2 fn=bodyNrm(.24);float fy=mix(-.45,.30,sat(sn))*pfD(.24,c,sn,false);
 vec2 fa=bodyPt(.24,fy*LDL);vec2 ft=fa-dd*.11*LDL-fn*(.05-.06*sn)*LDL;float dFl=min(sdCap(w,fa,mix(fa,ft,.4),.016*LDL,.012*LDL),sdCap(w,mix(fa,ft,.4),ft,.012*LDL,.002*LDL));
 float dB=min(d,dK);float al=covW(min(dB,dFl));if(al<.002)return;
 bool up=w.y>sy;float zz=max(-w.y,0.);
 vec3 E=up?SUNC*1.15:lightAt(zz)*1.45;vec3 amb=up?SKYC*.30+vec3(.02):waterCol(zz)*.9+vec3(.005,.01,.015);
 float u=0.;{float tt=pfD(f.x,c,sn,true)*BL,bb=pfD(f.x,c,sn,false)*BL;u=clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);}
 vec3 n=tubeN(f.xy,u);
 float th=asin(u)-phi;float dors=sin(th);float s=f.x;
 // the colours of the striped dolphin: the dark cape, the blue-grey flank with the pale blaze sweeping up toward the fin, the black stripe
 // from the eye to the vent and the shorter one to the flipper, the white belly
 vec3 cape=vec3(.016,.022,.038),flank=vec3(.16,.19,.25),belly=vec3(.70,.70,.68),stripe=vec3(.010,.012,.018);
 float capeL=.18-.15*ss(.15,.05,s)-.10*ss(.65,.95,s);
 vec3 alb=mix(belly,flank,ss(-.62,-.38,dors));alb=mix(alb,cape,ss(capeL-.12,capeL+.06,dors));
 float bl=ss(.27,.33,s)*ss(.60,.50,s);float bline=mix(-.05,.55,sat((s-.30)/.24));alb=mix(alb,vec3(.40,.44,.50),bl*ss(.13,.04,abs(dors-bline))*ss(.0,.06,s-.30));
 float sl=mix(.04,-.48,sat((s-.13)/.54));float sw=.075*ss(.12,.18,s)*ss(.70,.60,s)+.02;alb=mix(alb,stripe,ss(sw,sw*.55,abs(dors-sl))*ss(.10,.14,s)*ss(.70,.64,s));
 float sl2=mix(.0,-.30,sat((s-.13)/.12));alb=mix(alb,stripe,ss(.040,.022,abs(dors-sl2))*ss(.11,.14,s)*ss(.26,.22,s));
 alb=mix(alb,cape,ss(.075,.045,s)*ss(-.3,.2,dors));                       // the dark beak
 vec3 col=lit(alb,n,E,amb,up?0.:.12)+rimL(n,E,up?.12:.14);
 if(up){vec3 Hn=normalize(normalize(vec3(SUND*.9,.45))+vec3(0.,0.,1.));col+=E*.55*pow(sat(dot(n,Hn)),180.)+SKYC*.10*pow(1.-n.z,3.);}
 else col+=E*.22*caust(w*6.,T*.8)*sat(u+.3)*exp(-zz*3.);
 // the eye in its dark patch, on the near side
 float the=.10;float ue=sin(the+phi);float ve=cos(the+phi);if(ve>-.05){vec2 ep=bodyPt(.130,ue*pfD(.13,c,sn,ue>0.)*LDL*.92);float vis=ss(-.05,.25,ve);
  col=mix(col,col*.55,vis*ss(.018*LDL,.010*LDL,length(w-ep)));col=mix(col,eyeC(col,w,ep,.0075*LDL,E,vec3(.03)),vis);}
 // the mouth line
 float ml=abs(f.y-(-.004+.010*ss(.0,.10,s))*LDL);col*=1.-.45*ss(.0022*LDL,.0006*LDL,ml)*ss(.11,.09,s)*ss(.0,.01,s)*ss(.3,.8,c);
 vec3 fc=lit(mix(cape,flank,.25),normalize(vec3(-fn*.2,1.)),E,amb,up?0.:.2);col=mix(col,fc,covW(dFl));
 col*=1.-.30*edgeK(min(dB,dFl));
 if(!up)col=fogW(col,.03+.08*VH*m+.8*max(zz-.4,0.),zz);
 putF(col,al);}
void scene(vec2 w,float T){
 SUND=normalize(vec2(-.30,1.));SUNC=vec3(1.05,1.0,.92);WAT0=vec3(.025,.20,.36);
 KD=vec3(2.7,.58,.26);KH=vec3(2.2,.62,.34);VEIL=vec3(.015,.11,.22);
 SKYTOP=vec3(.035,.10,.30);SKYHOR=vec3(.20,.32,.50);SUNP=vec2(-1.0,.55);SUNK=.25;CLOUDC=vec3(.55,.57,.60);FARSEA=vec3(.03,.14,.30);NEARSEA=vec3(.08,.26,.44);
 float sy=surfD(w.x,T);float horiz=.03*VH;
 if(w.y>sy){float hy=w.y-sy-horiz;BG=hy>0.?skyAt(w,hy,T):seaAbove(w+vec2(VBT*T*.3,0.),hy,T,horiz);}
 else{BG=openWater(w,T,1.3,1.2);BG=mirrorBand(BG,w+vec2(VBT*T,0.),sy,T);
  // the specks in the water stream past
  vec2 sq=vec2(w.x+VBT*T,w.y)*26.;vec2 si=floor(sq);float sp=ss(.10,.03,length(fract(sq)-.5-.35*(h22(si)-.5)))*step(.86,h21(si+3.));BG+=lightAt(-w.y)*.25*sp;}
 float wpx0=WPX;float yw=-CAM.y/VH;
 // the dolphins on the far side of the bow first
 for(int j=0;j<6;j++){int k=5-j;float m=dSlot(k).z;if(m<=1.)continue;vec2 wk=vec2(CAM.x+P.x*VH*m,(P.y-yw)*VH*m);WPX=wpx0*m;dolphin(wk,k,T,m,wpx0);}
 WPX=wpx0;
 // ---- the sailboat ----
 vec2 q=hullQ(w,T);float hd=hullD(q);
 // the jib: tack at the stem head, luff up the forestay, foot back to the clew
 vec2 tk=vec2(XST+.045,.150),cl=vec2(XST-.46,.205),hd2=tk+vec2(-.33,.94)*1.6;
 float jb=sdTri(q,tk,cl,hd2);float ja=covW(jb);
 if(ja>.002){float fx=dot(q-tk,normalize(cl-tk));vec3 sc=vec3(.88,.87,.83)*(.80+.20*ss(-.5,.1,fx))*(.92+.08*sin(q.y*90.+q.x*20.)*.5);
  sc*=1.-.25*ss(.0,.05,-jb)*0.;putF(sc*SUNC*.95,ja);}
 // the forestay and the pulpit
 float stay=sdSeg(q,tk,hd2);putF(vec3(.70,.72,.74)*SUNC,covWs(stay-.0012,0.)*.9);
 float pul=min(min(sdSeg(q,vec2(XST+.035,.135),vec2(XST+.030,.200)),sdSeg(q,vec2(XST+.030,.200),vec2(XST-.32,.192))),min(sdSeg(q,vec2(XST-.12,.130),vec2(XST-.12,.196)),sdSeg(q,vec2(XST-.25,.128),vec2(XST-.25,.194))));
 putF(vec3(.80,.82,.84)*SUNC,covWs(pul-.0014,0.)*.95);
 float ha=covW(hd);
 if(ha>.002){bool up=w.y>sy;float zz=max(-w.y,0.);
  float bowc=ss(XST-.14,XST+.01,q.x);vec3 n=normalize(vec3(.65*bowc,-.15*ss(.0,-.08,q.y),1.));
  vec3 alb=vec3(.82,.82,.80);float yS=.125+.012*ss(XST-.6,XST,q.x);
  alb=mix(alb,vec3(.05,.08,.18),ss(.0012,.0,abs(q.y-(yS-.022))-.004));               // the cove stripe
  alb=mix(alb,vec3(.55,.56,.57),ss(yS-.010,yS-.006,q.y));                           // the rubbing strake
  alb=mix(alb,vec3(.04,.07,.17),ss(.024,.018,q.y));                                 // the boot top
  alb=mix(alb,vec3(.045,.060,.10),ss(-.004,-.010,q.y));                             // the antifouling
  vec3 E=up?SUNC*1.10:lightAt(zz)*1.6;vec3 amb=up?SKYC*.35+vec3(.03):waterCol(zz)*1.2+vec3(.01,.02,.03);
  vec3 c=lit(alb,n,E,amb,up?.15:.05);
  if(!up){c+=E*.06*caust(w*7.+vec2(VBT*T*7.,0.),T)*exp(-zz*6.);c=fogW(c,.05+.12*VH+.6*max(zz-.3,0.),zz);}
  // the hull's own wet line where the bow wave runs up it
  c=mix(c,vec3(.90,.94,.96)*SUNC,ss(.012,.0,abs(q.y-surfD(q.x,T)-.004))*ss(XST-.30,XST-.02,q.x)*.6*float(up));
  putF(c,ha);}
 // bubbles swept back along the hull under the bow wave
 if(w.y<sy){vec2 bq=vec2((q.x+VBT*T*1.6)*55.,q.y*55.);vec2 bi=floor(bq);float br=.10+.18*h21(bi+7.);
  float bb=ss(br,br*.5,length(fract(bq)-.5-.3*(h22(bi)-.5)))*step(.72,h21(bi+1.));float zone=ss(-.075,-.01,q.y)*ss(XST+.06,XST-.02,q.x)*ss(XST-.9,XST-.4,q.x);
  float haze=zone*.25*fbm(vec2((q.x+VBT*T*1.6)*9.,q.y*30.));putF(lightAt(0.)*1.2+.08,sat(bb*zone*.75+haze));}
 // the dolphins on the near side
 for(int j=0;j<6;j++){int k=5-j;float m=dSlot(k).z;if(m>1.)continue;vec2 wk=vec2(CAM.x+P.x*VH*m,(P.y-yw)*VH*m);WPX=wpx0*m;dolphin(wk,k,T,m,wpx0);}
 WPX=wpx0;
 // the bow wave: white water heaped at the stem and running back along the hull
 float sw=surfD(w.x,T);
 if(abs(w.y-sw)<.06){float bx=(w.x-XST-.035)/.065;float y=w.y-sw;
  float crest=ss(1.,.2,abs(bx))*ss(.014,.0,abs(y+.002))*(.40+.60*fbm(vec2((w.x+VBT*T)*70.,y*90.+T*2.)));
  float run=ss(.0,-.012,y-.0)*ss(-.03,-.0,y)*ss(XST-.01,XST+.05,w.x)*ss(XST+.12,XST+.05,w.x)*ss(.40,.65,fbm(w*120.+vec2(T*3.,0.)));
  vec2 dq=vec2((w.x+VBT*T*.3)*110.,(y-fract(T*1.3)*.03)*110.);vec2 di=floor(dq);float drop=ss(.22,.08,length(fract(dq)-.2-.6*h22(di)))*step(.88,h21(di+4.))*ss(1.,.3,abs(bx))*ss(.03,.0,y)*ss(.0,.004,y);
  putF(vec3(.92,.95,.97)*SUNC,sat(crest*.85+run*.5+drop*.8));
  float rb=ss(.012,.0,abs(w.y-sw-.003))*ss(XST+.06,XST-.02,w.x)*ss(XST-.70,XST-.20,w.x)*(.4+.6*fbm(vec2((w.x+VBT*T)*30.,T)));putF(vec3(.92,.95,.97)*SUNC,rb*.7);}
}
