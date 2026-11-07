// ---- Scene 5: the humpbacks' bubble net (Gulf of Maine, summer) ----
// Seen from below. 2.2–4.8 s a whale circling unseen in the deep breathes out a spiral of bubbles: column after column rises round a
// ring 10 m across, a shining curtain that reaches the surface as a ring of foam, the krill crowded inside it; 4.8–8.2 three humpbacks
// rise straight up through the middle, their mouths opening wide and their throats swelling (bubble-net feeding: Friedlaender et al.,
// 2011); at the top they close their mouths on the water and the krill; 8.8–13 they sink back down into the green-blue.
const float LH=1.30;
const float RN=.55;                          // the radius of the ring of bubbles
float TOPH[11]=float[11](.020,.054,.072,.082,.090,.088,.078,.060,.038,.020,.012);
float BOTH[11]=float[11](.030,.076,.098,.106,.108,.098,.081,.058,.036,.020,.012);
const float HG=.29;
float mouthH(float s){return (-.012+.020*ss(0.,HG,s)+.006*sin(PI*sat(s/HG)))*BL;}
// the three whales: their distance, where across, a little apart in time
float hM(int k){return k==0?1.:k==1?1.30:1.16;}
float hX(int k){return k==0?.06:k==1?-.36:.40;}
float hDT(int k){return k==0?0.:k==1?.45:.25;}
// the height of the snout: up fast, slowing at the surface, a moment there, then sinking back
float headY(float T){float u=T-4.6;if(u<0.)return -2.25+.50*u;if(u<3.6){float k=u/3.6;return -2.25+2.40*(1.-(1.-k)*(1.-k));}
 if(u<4.2)return .15;float v=u-4.2;return .15-.36*v*v/(2.*1.0)*step(v,1.)-(.18+.36*(v-1.))*step(1.,v);}
float jawH(float T){return .70*ss(6.6,7.6,T)*(1.-ss(8.4,9.4,T));}
float pouchH(float T){return .085*ss(6.9,8.3,T)*(1.-.75*ss(9.6,13.,T));}
float profT(vec2 f,float sgn){float e=.012;float t,dt;
 if(sgn>0.){t=prof(f.x,TOPH)*BL;dt=(prof(f.x+e,TOPH)-prof(f.x-e,TOPH))/(2.*e);}else{t=prof(f.x,BOTH)*BL;dt=(prof(f.x+e,BOTH)-prof(f.x-e,BOTH))/(2.*e);}
 return (sgn*f.y-t)/sqrt(1.+dt*dt);}
float humpClosed(vec2 f){float d=max(profT(f,1.),profT(f,-1.));d=smax(d,-f.x*BL,.018*BL);d=max(d,(f.x-1.02)*BL);
 vec2 df=vec2((f.x-.645)*BL,f.y-prof(.645,TOPH)*BL);return smin(d,sdCap(df,vec2(-.030*BL,-.006*BL),vec2(.012*BL,.018*BL),.012*BL,.003*BL),.012*BL);}
// One humpback rising with its mouth open (drawn in its own world w)
void humpback(vec2 w,int k,float T,float dist){float Tk=T-hDT(k);float fl=k==1?-1.:1.;
 float hy=headY(Tk);if(hy<-3.6)return;
 spine(vec2(hX(k)+.02*sin(Tk*.5+float(k)),hy),PI*.5+.03*sin(Tk*.4+float(k)*2.),LH,fl,.08*(1.-ss(5.5,6.5,Tk)),TAU*.30*Tk,.0);
 if(spineNear(w)>.32*LH)return;
 vec3 f=bodyF(w);
 float jaw=jawH(Tk),pch=pouchH(Tk);float open=ss(.0,.05,jaw);
 vec2 dr=bodyDir(.05);vec2 nr=BFLIP*vec2(-dr.y,dr.x);
 vec2 H=bodyPt(HG,mouthH(HG));vec2 R=bodyPt(.0,mouthH(0.));
 // the lower jaw turns down about the hinge, away from the back: pick the turn that does
 vec2 J0=bodyPt(-.004,mouthH(0.)-.006*BL);vec2 Ja=H+rot(jaw)*(J0-H),Jb=H+rot(-jaw)*(J0-H);float sgJ=dot(Ja-H,nr)<dot(Jb-H,nr)?1.:-1.;vec2 J=sgJ>0.?Ja:Jb;
 float dC=humpClosed(f.xy);
 float upper=dC;if(open>0.)upper=max(dC,-max(f.y-mouthH(f.x),(f.x-HG)*BL));
 // the jaw: the closed head's part below the mouth line, turned with the jaw
 float dJ=1e5;vec3 fj=f;if(open>0.){vec2 wj=H+rot(-sgJ*jaw)*(w-H);fj=bodyF(wj);dJ=max(humpClosed(fj.xy),max(fj.y-mouthH(fj.x),(fj.x-HG)*BL));}
 // the throat swelling into a great pouch along the belly, from the jaw back to the navel
 vec2 pc0=bodyPt(.30,-prof(.30,BOTH)*BL*.55-pch*BL*.95);vec2 pd=bodyDir(.30);
 vec2 pq=vec2(dot(w-pc0,pd),dot(w-pc0,BFLIP*vec2(-pd.y,pd.x)));float dP=pch>.002?sdEll(pq,vec2(.25*BL,(pch*1.05+.06)*BL)):1e5;
 float dM=1e5;if(open>0.)dM=sdTri(w,H,R,J);
 // the long white flippers, spread a little as it rises
 vec2 dd=bodyDir(.33);vec2 nd=BFLIP*vec2(-dd.y,dd.x);vec2 fa=bodyPt(.335,-prof(.335,BOTH)*BL*.40);
 float fang=.85+.35*ss(5.5,7.,Tk)+.08*sin(Tk*.9+float(k));vec2 fdir=-dd*cos(fang)-nd*sin(fang),fper=vec2(-fdir.y,fdir.x);
 vec2 ftip=fa+fdir*.30*BL;vec2 fmid=fa+fdir*.14*BL+fper*.025*BL*(dot(fper,dd)>0.?-1.:1.);vec2 fln=normalize(dd*sin(fang)-nd*cos(fang));
 float fu;float dF=flipD(w,fa,fmid,ftip,fln,.028*BL,1.,fu);
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float dK=flukeD(tq,.17*BL,.14+.10*abs(sin(TAU*.30*Tk-1.)),1.);
 float dB=min(min(upper,dK),min(dP,dJ));dB=min(dB,1e5);
 float a=covW(min(dB,dM)),af=covW(dF);
 if(a<.001&&af<.001)return;
 float zz=max(-w.y,0.);vec3 E=lightAt(zz)*1.8;vec3 amb=waterCol(zz)*1.25+vec3(.010,.018,.02);
 vec2 ndf=BFLIP*vec2(-bodyDir(f.x).y,bodyDir(f.x).x);
 float tt=prof(f.x,TOPH)*BL,bb=prof(f.x,BOTH)*BL;float u=clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);
 vec3 n=normalize(vec3(ndf*u*.92,sqrt(max(1.-u*u*.85,0.))));
 vec2 q=vec2(f.x*BL*14.,f.y*22.);float m=fbm(q);
 vec3 alb=vec3(.045,.05,.058)*(.85+.3*m);
 float throat=ss(.0,.05,f.x)*ss(.58,.44,f.x)*ss(-.30,-.55,u+.16*(fbm(q*.25+3.)-.5));alb=mix(alb,vec3(.80,.80,.78)*(.92+.08*m),throat);
 float gz=-f.y-prof(f.x,BOTH)*BL*.10;float gl=abs(fract(gz/(.0105*BL))-.5)*2.;alb=mix(alb,alb*.55,ss(.30,.0,gl)*throat*(1.-open)*.8);
 vec2 kq=vec2(f.x*BL*55.,(f.y-mouthH(f.x))*55.);vec2 ki=floor(kq);vec2 kf=fract(kq)-.5;float knob=ss(.30,.16,length(kf))*step(.55,h21(ki))*ss(.25,.08,f.x)*ss(.02,.04,f.x)*ss(.55,.85,u);
 alb=mix(alb,alb*1.6+.03,knob*.8);
 vec3 c=lit(alb,n,E*(1.+.6*caust(w*3.,T*.8)*sat(u+.2)*exp(-zz*1.5)),amb,.30)+rimL(n,E,.35);
 vec2 ep=bodyPt(.27,mouthH(.27)+.016*BL);float de=length(w-ep);c=mix(c,c*.6,ss(.016*BL,.010*BL,de));c=mix(c,vec3(.02),ss(.0065*BL,.0048*BL,de));
 if(open<=0.){float ml=abs(f.y-mouthH(f.x));c*=1.-.6*ss(.0035*BL,.0012*BL,ml)*ss(HG+.01,HG-.01,f.x)*ss(-.01,.01,f.x);}
 // the pouch: pale, the grooves stretched apart and curving round it
 if(dP<WPX*2.){float pa=covW(dP)*ss(-.004*BL,.004*BL,upper);vec2 en=pq/vec2(.25*BL,(pch*1.05+.06)*BL);float r=length(en);
  vec3 pn=normalize(vec3(BFLIP*vec2(-pd.y,pd.x)*en.y*.8+pd*en.x*.5,sqrt(max(1.-r*r*.8,.05))));
  float g2=abs(fract(en.y*7.+.2*en.x*en.x)-.5)*2.;float pg=ss(.30,.0,g2);
  vec3 palb=vec3(.84,.84,.82);palb=mix(palb,palb*vec3(.55,.52,.54),pg*.7);
  vec3 pcol=lit(palb,pn,E,amb*1.5,.15);c=mix(c,pcol,pa);}
 // the open mouth: dark, the fringe of baleen hanging from the upper jaw
 if(dM<WPX&&open>0.){float along=dot(w-H,dr);vec2 mp=bodyPt(f.x,mouthH(f.x));float hang=dot(w-mp,-nr);float gapeL=length(J-H)*sin(jaw);
  float comb=.5+.5*sin(along*1200./BL);float plates=ss(.30*gapeL,.0,hang)*(.55+.45*comb);
  vec3 mm=mix(vec3(.08,.04,.05),vec3(.32,.17,.18),ss(.2,1.,hang/max(gapeL,1e-4)));mm=mix(mm,vec3(.12,.12,.13),plates*.85);
  mm*=lightAt(zz)*1.3+.10;float am=covW(dM)*ss(-.002*BL,.003*BL,upper)*ss(-.002*BL,.003*BL,dJ);c=mix(c,mm,am);}
 // the jaw over it: black above, white below like the throat, with knobs on its edge
 if(dJ<WPX){float aj=covW(dJ);float uj=clamp((fj.y+prof(fj.x,BOTH)*BL*.5)/max(prof(fj.x,BOTH)*BL*.5,1e-4),-1.,1.);
  vec3 jalb=mix(vec3(.80,.80,.78),vec3(.05,.05,.06),ss(-.2,.5,uj));vec3 jc=lit(jalb,normalize(vec3(-nr*uj*.6,1.)),E,amb*1.2,.3);c=mix(c,jc,aj);}
 c*=1.-.30*edgeK(min(dB,dM));
 c=fogW(c,dist,zz);
 vec3 fcol=lit(vec3(.82,.83,.82)*(.85+.2*fbm(w*30.)),normalize(vec3(-nd*.2,1.)),E,amb,.25);fcol*=.82+.30*ss(-1.,1.,dot(w-fa,fln)/(.03*BL));
 fcol=fogW(fcol,dist,zz);
 vec4 acc=vec4(c*a,a);acc=vec4(fcol*af+acc.rgb*(1.-af),af+acc.a*(1.-af));
 FG=vec4(FG.rgb*(1.-acc.a)+acc.rgb,FG.a*(1.-acc.a)+acc.a);}
// The curtain of bubbles: column j released at its moment round the ring (a rising spiral); front: the near half (1) or the far (0)
void bubbleNet(vec2 w,float T,float front){float z=max(-w.y,0.);
 for(int j=0;j<44;j++){float fj=float(j)/44.;float th=TAU*(fj*1.12)+.4;float zc=sin(th);if((zc>0.)!=(front>.5))continue;
  float tj=2.2+2.6*fj;if(T<tj)continue;float xj=RN*cos(th)+.015*sin(fj*37.);float y0=-1.20+.30*fj;
  float age=T-tj;float top=min(y0+.27*age,.0);float bot=y0+.27*max(age-1.3,0.);if(bot>-.01)continue;
  float yr=sat((w.y-y0)/1.2);float wd=.010+.022*yr;float sway=.010*sin(w.y*7.+T*1.3+fj*20.)+.012*(fbm(vec2(w.y*4.,fj*9.+T*.2))-.5);
  float dx=w.x-xj-sway;if(abs(dx)>wd*3.||w.y<bot-.03||w.y>top+.04)continue;
  float dist=.25+.35*VH+.45*zc;
  // the column: a soft haze of fine bubbles, larger bubbles wobbling in it, a ragged top
  float topR=top-.03*fbm(vec2(w.x*30.,fj*7.+T));float body=ss(wd*1.6,wd*.2,abs(dx))*ss(bot-.03,bot+.05,w.y)*ss(topR+.01,topR-.04,w.y);
  vec2 bq=vec2(dx/(wd*.7),(w.y-T*.27)/(wd*.7));vec2 bi=floor(bq);vec2 bf=fract(bq)-.5;float on=step(.70,h21(bi+fj*31.));
  float br=.18+.20*h21(bi+3.);float d=length(bf-.25*(h22(bi)-.5));float rim=ss(br,br*.70,d)*(.35+.65*ss(br*.35,br*.85,d));
  float fine=vn(vec2(dx*900.,(w.y-T*.27)*500.));
  vec3 bc=fogW(lightAt(z)*1.7+waterCol(z)*.5+.03,dist,z);
  putF(bc,body*(.10+.20*fine+.75*rim*on)*(.7+.3*abs(zc)*0.+.3));}}
void scene(vec2 w,float T){
 SUND=normalize(vec2(.20,1.));SUNC=vec3(1.0,.97,.90);WAT0=vec3(.030,.190,.230);
 KD=vec3(2.6,.70,.65);KH=vec3(2.2,.80,.75);VEIL=vec3(.020,.11,.14);
 float z=max(-w.y,0.);vec3 wc=waterCol(z)*(.50+.95*ss(-.7,.55,P.y));
 wc+=lightAt(z)*vec3(.70,.82,.75)*.50*shafts(w*vec2(.9,1.),T)*ss(-.7,.6,P.y);
 wc+=lightAt(z+.15)*.25*snow(P,T);
 // the krill crowded inside the ring: a pink haze with specks
 {float kin=ss(RN*1.05,RN*.6,abs(w.x))*ss(-1.1,-.6,w.y)*ss(.05,-.25,w.y)*ss(3.5,6.,T)*(1.-.85*ss(7.,8.5,T));
  vec2 kq=w*32.+vec2(T*.3,T*.1);vec2 ki=floor(kq);float ks=ss(.14,.03,length(fract(kq)-.2-.6*h22(ki)))*step(.55,h21(ki+9.));
  wc=mix(wc,fogW(vec3(.95,.45,.38)*(lightAt(z)*1.2+.08),.4+.3*VH,z),kin*(.18+.50*ks));}
 BG=wc;
 // the surface seen from below, receding upwards: bright, rippled; the ring of foam where the bubbles break
 float yw=-CAM.y/VH;vec3 sp=planeAt(0.,yw-.14,1.);
 if(sp.z>.5){float dd=sp.y;float X=sp.x;float Zw=dd*1.2*VH;vec2 q=vec2(X,Zw)*3.;q+=.35*vec2(vn(q*.8+T*.15),vn(q*.8+5.-T*.12));
  float fw=length(fwidth(q));float rip=voroE(q,T*.5);float gl=exp(-rip*4.5)*ss(.6,.15,fw);float ov=ss(1.8,.30,dd);
  vec3 sc=WAT0*vec3(1.2,1.4,1.3)*(1.1+1.2*ov)+SUNC*vec3(.75,.86,.80)*(.06+.40*ov)*(.45+.55*gl);
  // the foam ring on the surface (seen from below: bright), forming as the columns arrive
  vec2 rq=vec2(X,(dd-1.)*1.2*VH);float rr=length(rq);float ring=ss(.10,.02,abs(rr-RN))*ss(5.6,7.,T)*(1.-ss(10.5,13.5,T))*(.6+.4*fbm(rq*8.+T*.2));
  sc=mix(sc,vec3(.85,.95,.95)*SUNC*1.2,ring*.75);
  vec3 tf=exp(-KH*camDist()*1.2*max(dd-.25,0.));BG=sc*tf+wc*(1.-tf);}
 // ---- the far half of the curtain, the whales (the farthest first), the near half ----
 bubbleNet(w,T,0.);
 float wpx0=WPX;float yS=-CAM.y/VH;
 for(int j=0;j<3;j++){int k=j==0?1:j==1?2:0;float m=hM(k);vec2 wk=CAM+vec2(P.x*VH*m,(P.y-yS)*VH*m+yS*VH);WPX=wpx0*m;
  humpback(wk,k,T,.10+.20*VH+.30*(m-1.));}
 WPX=wpx0;
 bubbleNet(w,T,1.);
}
