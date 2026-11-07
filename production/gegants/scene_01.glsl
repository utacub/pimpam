// ---- Scene 2: the belugas of a high Arctic estuary (Cunningham Inlet, summer) ----
// Shallow green water over a bed of rounded pebbles, the rippled surface above, both receding into the green. 2–5 s three belugas
// (two white adults and a grey young one) come in from the right, low over the pebbles; one after another they roll right over,
// rubbing their sides and backs on the stones (belugas in Arctic estuaries rub on mud, pebbles and limestone; Smith et al., 1992),
// raising clouds of silt; then they rise a little and swim away to the left, into the green. The camera travels slowly with them.
// Each beluga is at its own distance m (1: the picture plane): drawn in its own world, scaled about the horizon so that it stays on the
// floor as it recedes.
const float FLY=-.32;              // the bed, 3.2 m down
const float HZ=.15;                // the horizon on the screen (both planes fade into the green there)
const float BV=.27;                // their speed along their paths (2.7 m/s)
float TOPB[11]=float[11](.040,.098,.092,.104,.114,.112,.098,.074,.048,.026,.014);   // the back: the melon, the neck, the ridge
float BOTB[11]=float[11](.034,.078,.098,.114,.122,.115,.096,.068,.042,.023,.014);   // the belly
float SYMB[11]=float[11](.037,.086,.092,.108,.119,.116,.098,.071,.045,.025,.014);   // half the width seen from above or below
float bM0(int k){return k==0?1.:k==1?1.42:1.28;}
float bL(int k){return k==2?.28:.42;}
float bT0(int k){return k==0?2.9:k==1?1.7:2.1;}
// the path: in low from the right, down onto the pebbles, a long run along them, then up a little and away to the left
void pathB(int k){float y0=FLY+.105+(k==2?.07:0.);pathSet(vec2(k==0?1.26:k==1?1.36:1.42,y0),PI+.13);
 PL[0]=.40;PL[1]=.32;PK[1]=-.40;PL[2]=k==2?.70:1.10;PL[3]=.40;PK[3]=-.55;PL[4]=2.4;PL[5]=0.;
 if(k==2){PL[0]=.34;PK[1]=-.25;}}
float floorEnd(int k){return k==2?1.36:1.82;}
// how far away it is: after its run along the stones it swims off into the green
float bM(int k,float T){float te=bT0(k)+(floorEnd(k)+.25)/BV;return bM0(k)*(1.+2.2*ss(te,te+3.4,T)*ss(te-.5,te+3.4,T));}
// the roll: one slow whole turn about its length while its middle runs along the pebbles (radians; the young one half a turn)
float rollB(int k,float a,float L){float s0=.80,s1=k==2?1.24:1.70;return TAU*(k==2?.5:1.)*ss(s0,s1,a-.45*L);}
// The profile at a roll phi: the back, a side (seen from below or above) and the belly come round in turn
float pf(float s,float c,float sn,bool top){float t=prof(s,TOPB),b=prof(s,BOTB),m=prof(s,SYMB);
 float wt=max(c,0.)*max(c,0.),wb=max(-c,0.)*max(-c,0.),wm=sn*sn;return top?(t*wt+b*wb+m*wm):(b*wt+t*wb+m*wm);}
float pfSide(vec2 f,float c,float sn,bool top){float e=.012;float t=pf(f.x,c,sn,top)*BL;float dt=(pf(f.x+e,c,sn,top)-pf(f.x-e,c,sn,top))/(2.*e);
 return ((top?1.:-1.)*f.y-t)/sqrt(1.+dt*dt);}
float belD(vec2 f,float c,float sn){float d=max(pfSide(f,c,sn,true),pfSide(f,c,sn,false));d=smax(d,-f.x*BL,.024*BL);return max(d,(f.x-1.02)*BL);}
// The bed: a gravel of small rounded stones with larger cobbles here and there, silt between them. Seen from low down each stone is
// lit on its top and on its far side (the light comes from above and beyond), its near side in shade with a dark crevice under it.
// p: the bed in cobbles (x across, y away from us); fw: cobbles per pixel. Returns the colour lit by E (amb: the water's light).
vec4 stone(vec2 p,float dens,float rmin,float rvar,float sd){vec2 i=floor(p),f=fract(p);float best=-1.;vec2 bo=vec2(0.);float bh=0.,bd=1.;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y);vec2 c=i+g+sd;if(h21(c+2.)>dens)continue;vec2 h=h22(c);float r=rmin+rvar*h21(c+4.);vec2 o=g+.5+.40*(h-.5)-f;
  float an=TAU*h.y;vec2 oe=mat2(cos(an),-sin(an),sin(an),cos(an))*o;oe.x*=1.+.40*h.x;float d=length(oe)/r;
  float ht=r*sqrt(max(1.-d*d,0.));if(ht>best){best=ht;bo=o/r;bh=h21(c+9.);bd=d;}}
 return vec4(-bo,best>0.?bd:2.,bh);}
vec3 stoneCol(float bh){return bh<.22?vec3(.27,.27,.26):bh<.40?vec3(.38,.33,.25):bh<.55?vec3(.17,.17,.18):bh<.68?vec3(.50,.48,.43):bh<.84?vec3(.33,.25,.18):vec3(.24,.28,.24);}
vec3 bedAt(vec2 p,float fw,vec3 E,vec3 amb){
 vec4 cb=stone(p,.45,.38,.22,0.);vec4 gv=stone(p*2.7,1.,.42,.16,17.);
 bool big=cb.z<1.;vec4 s=big?cb:gv;float pf=big?fw:fw*2.7;
 vec2 nb=s.xy;float d=min(s.z,1.);float top=sqrt(max(1.-d*d,0.));
 float lightK=sat(.30+.85*top*.6+.55*(-nb.y)*(1.-top*.5)-.20*nb.x);    // -nb.y: towards the far side (up on the screen)
 float nearSh=ss(.25,.95,nb.y)*ss(.0,.5,d);                           // the near side, turned from the light
 float rim=ss(.80,1.,d);                                               // the crevice round it
 vec3 alb=stoneCol(s.w)*(.80+.35*vn(p*5.+s.w*9.));alb=mix(alb,vec3(.30,.29,.20),.30*top*vn(p*2.+7.));
 vec3 c=alb*(E*lightK*(1.-.75*nearSh)+amb*(1.-.5*nearSh));
 c+=E*.07*pow(top,6.)*ss(.3,-.6,nb.y);                                // a soft sheen on its top
 c*=1.-.70*rim;
 if(s.z>1.5)c=vec3(.07,.065,.05)*(E+amb);                               // between them: silt in the dark
 vec3 avg=vec3(.20,.19,.16)*(E*.75+amb);return mix(c,avg,ss(.12,.45,pf));}
// A cloud of silt raised from the bed at c (its own clock age): it swells, rises and drifts with the current, and settles
void silt(vec2 w,vec2 c,float age,float dist,float sd){if(age<0.||age>8.)return;
 float r=.022+.060*(1.-exp(-age*.70));vec2 cc=c+vec2(-.018*age,.012*age+.040*(1.-exp(-age*1.8)));vec2 q=(w-cc)/vec2(r*1.8,r);
 float l=dot(q,q);if(l>2.5)return;float n=fbm(w*24.+vec2(sd*7.,-age*.25));float n2=fbm(w*9.+vec2(-sd*3.,age*.1));
 float dn=ss(1.15,.10,sqrt(l)+.75*(n2-.5))*ss(.25,.62,n*.6+n2*.6)*(1.-exp(-age*3.5))*exp(-age*.42)*1.15;
 float z=-cc.y;vec3 sc=vec3(.78,.70,.52)*(lightAt(z)*1.3+waterCol(z)*1.5)*(.70+.55*n+.35*ss(-.3,.8,(w.y-cc.y)/r));putF(fogW(sc,dist,z),dn);}
void beluga(vec2 w,int k,float T,float m){float L=bL(k);float a=BV*(T-bT0(k));pathB(k);if(a<-.1||a>pathLen()+L+.2)return;
 float ph=TAU*.50*T+float(k)*1.9;spinePath(a,L,-1.,.038,ph);if(spineNear(w)>.40*L)return;
 float phi=rollB(k,a,L);float c=cos(phi),sn=sin(phi);
 vec3 f=bodyF(w);float dB=belD(f.xy,c,sn);
 // the two flippers: broad paddles, the tips turned up; each sits on the round of the body and turns with the roll
 float dFr=1e5,dFb=1e5;
 for(int s=0;s<2;s++){float al=(s==0?-.88:-2.26)+phi;float z=cos(al),y=sin(al);float hh=mix(prof(.22,BOTB),prof(.22,TOPB),.5+.5*y)*L;
  vec2 fa=bodyPt(.22,y*hh*.78);vec2 dd=bodyDir(.22);vec2 fn=bodyNrm(.22);float sw=.6+.15*sin(T*1.1+float(k));
  vec2 tip=fa-dd*.10*L*cos(sw*.5)+fn*y*.11*L*(.55+.45*abs(y));vec2 mid=mix(fa,tip,.55)+fn*.012*L;
  float dF=min(sdCap(w,fa,mid,.034*L,.030*L),sdCap(w,mid,tip+fn*.010*L*sign(y),.030*L,.014*L));
  if(z>-.05)dFr=min(dFr,dF);else dFb=min(dFb,dF);}
 // the flukes: edge-on when upright, their whole spread when it lies on its side
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float tilt=.10+.06*abs(sin(ph-1.))+.84*sn*sn;float dK=flukeD(tq,.14*L,tilt,0.);
 float dS=min(dB,dK);
 float dAll=min(min(dS,dFr),dFb);if(covW(dAll)<.002)return;
 float zz=max(-w.y,0.);float dist=camDist()*m;
 vec3 E=lightAt(zz)*2.0;vec3 amb=waterCol(zz)*1.25+vec3(.008,.014,.012);
 float u=0.;{float tt=pf(f.x,c,sn,true)*BL,bb=pf(f.x,c,sn,false)*BL;u=clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);}
 vec3 n=tubeN(f.xy,u);
 // where on its round this point is: 1 on the back, -1 on the belly (it turns with the roll)
 float dors=sin(asin(clamp(u,-1.,1.))-phi);
 // the skin: creamy white, the back yellowed where the old skin has not yet worn away (it is the moult); the young one grey
 vec2 q=vec2(f.x*L*40.,f.y*40.);float mo=fbm(q*.8+float(k)*5.);
 vec3 alb=k==2?mix(vec3(.40,.43,.46),vec3(.52,.54,.56),ss(.2,-.8,dors))*(.92+.16*mo):
  mix(vec3(.90,.90,.87),vec3(.82,.72,.48),ss(.50,.70,mo+.30*dors)*(.35+.55*ss(-.3,.6,dors)));
 vec3 col=lit(alb,n,E,amb,.35)+rimL(n,E,.40);
 col+=E*.28*caust(w*7.,T*.9)*sat(u+.4)*exp(-zz*2.);
 // the eyes: one on each side of the head, seen while that side faces us; the gentle upturned line of the mouth
 for(int s=0;s<2;s++){float al=(s==0?.30:PI-.30)+phi;float vis=ss(.15,.45,cos(al));if(vis>.01){float hh=mix(prof(.11,BOTB),prof(.11,TOPB),.5+.5*sin(al))*L;
   vec2 ep=bodyPt(.11,sin(al)*hh*.50);vec3 ce=eyeC(col,w,ep,.013*L*(.5+.5*vis),E,vec3(.05,.05,.06));col=mix(col,ce,vis);}}
 if(abs(c)>.4){float sg=sign(c);float my=sg*(-.032*L+.030*L*ss(.0,.10,f.x)-.010*L*ss(.06,.11,f.x));float ml=abs(f.y-my);
  col*=1.-.35*ss(.004*L,.0015*L,ml)*ss(.12,.09,f.x)*ss(.0,.02,f.x)*ss(.4,.8,abs(c));}
 vec3 fcF=lit(alb*.96,normalize(vec3(-bodyNrm(.22)*.2,1.)),E,amb,.3)+rimL(vec3(0.,1.,.3),E,.2);
 // what is at this pixel: a flipper behind the body (only round it), the body, a flipper in front
 vec3 cc=fcF*.78;float aa=covW(dFb);
 cc=mix(cc,col,covW(dS));aa=max(aa,covW(dS));
 cc=mix(cc,fcF,covW(dFr));aa=max(aa,covW(dFr));
 cc*=1.-.35*edgeK(dAll);
 cc=fogW(cc,dist,zz);
 putF(cc,aa);
}
void scene(vec2 w,float T){
 SUND=normalize(vec2(-.25,1.));SUNC=vec3(1.0,.98,.90);WAT0=vec3(.060,.165,.115);
 KD=vec3(2.2,1.0,1.9);KH=vec3(.90,.55,.75);VEIL=vec3(.045,.120,.090);
 float D=1.;
 // ---- the green water: it glows towards the surface, darkens to the bed ----
 float z=max(-w.y,0.);vec3 wc=waterCol(z)*(.50+.95*ss(-.45,.55,P.y));
 wc+=lightAt(z)*vec3(.70,.88,.62)*.45*shafts(w*vec2(1.4,1.),T)*ss(-.55,.6,P.y);
 wc+=WAT0*.55*exp(-abs(P.y-HZ)*7.);
 vec3 bg=wc;vec3 KF=KH*camDist();
 // ---- the bed of pebbles, receding ----
 vec3 pl=planeAt(FLY,HZ,D);
 if(pl.z>.5){float dd=pl.y;float X=pl.x;float Zw=dd/D*1.2*VH;vec2 pp=vec2(X,Zw)*9.;float fw=length(fwidth(pp));
  float zf=-FLY;float ca=caust(vec2(X,Zw)*6.,T*.8);vec3 E=lightAt(zf)*1.6*(.60+1.0*ca*mix(1.,.4,ss(.1,.5,fw)));
  vec3 cb=bedAt(pp,fw,E,waterCol(zf)*1.2);
  // the shadows of the belugas on the stones, sharp when they touch, soft and faint as they rise
  for(int k=0;k<3;k++){float L=bL(k);pathB(k);float a=BV*(T-bT0(k));if(a<0.||a>pathLen()+L)continue;float m=bM(k,T);
   vec2 md=pathAt(a-.45*L).xy;float h=max(md.y-FLY,0.);vec2 sq=vec2((X-md.x-h*.25)/(.46*L+h*.6),(dd/D-m)*1.2*VH/((dd/D<m?.20:.08)+h*.6));
   cb*=1.-.80*exp(-h*4.)*ss(1.1,.25,length(sq))*ss(1.6,1.,m);}
  vec3 tf=exp(-KF*dd/D);bg=cb*tf+wc*(1.-tf);}
 // ---- the surface seen from below: a soft rippled mirror, bright overhead, fading to the green ----
 vec3 sp=planeAt(0.,HZ,D);
 if(sp.z>.5){float dd=sp.y;float X=sp.x;float Zw=dd/D*1.2*VH;vec2 q=vec2(X,Zw)*4.;q+=.35*vec2(vn(q*.8+T*.15),vn(q*.8+5.-T*.12));
  float fw=length(fwidth(q));float rip=voroE(q,T*.5);float gl=exp(-rip*4.5)*ss(.6,.15,fw);float ov=ss(D*1.8,D*.30,dd);
  vec3 sc=WAT0*vec3(1.2,1.5,1.3)*(1.+1.2*ov)+SUNC*vec3(.70,.86,.70)*(.06+.45*ov)*(.45+.55*gl);
  vec3 tf=exp(-KF*1.6*max(dd/D-.20,0.));bg=sc*tf+wc*(1.-tf);}
 bg+=lightAt(z+.1)*.22*snow(P,T);
 BG=bg;
 // ---- the belugas: the farthest first, each in its own world, with the silt it raises ----
 float wpx0=WPX;
 for(int j=0;j<3;j++){int k=j==0?1:j==1?2:0;
  float m=bM(k,T);vec2 wk=CAM+vec2(P.x*VH*m,(P.y-HZ)*VH*m+HZ*VH);WPX=wpx0*m;
  beluga(wk,k,T,m);
  float m0=bM0(k);vec2 ws=CAM+vec2(P.x*VH*m0,(P.y-HZ)*VH*m0+HZ*VH);WPX=wpx0*m0;
  float L=bL(k);pathB(k);float dist=camDist()*m0;
  for(int i=0;i<7;i++){float ai=.84+.14*float(i)+.03*sin(float(i*7+k));if(ai>floorEnd(k)-.12)break;float te=bT0(k)+(ai+.45*L)/BV;
   vec3 pq=pathAt(ai);silt(ws,vec2(pq.x,FLY+.020),T-te,dist,float(i+k*9));}
 }
 WPX=wpx0;
}
