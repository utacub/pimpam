// ---- Scene 7: the sleeping sperm whales (the Ligurian Sea, deep blue, dim) ----
// 2–4 s out of the dark, four sperm whales hang upright, heads up, quite still: they are asleep (sperm whales take short naps hanging
// still near the surface; Miller et al., 2008); 6.3–8.2 one after another they wake, turn level and set off, clicking, into the dark
// on the right. Each whale at its own distance m (drawn in its own world, scaled about the middle of the screen).
const float LS=1.15;
float TOPS[11]=float[11](.074,.086,.089,.088,.082,.076,.072,.062,.044,.026,.013);
float BOTS[11]=float[11](.060,.084,.094,.100,.104,.100,.088,.070,.049,.029,.013);
float sM(int k){return k==0?1.0:k==1?1.32:k==2?1.12:1.50;}
vec2 sC0(int k){return k==0?vec2(-.20,-1.62):k==1?vec2(-.95,-1.50):k==2?vec2(.55,-1.68):vec2(1.20,-1.54);}
float sWake(int k){return k==0?6.6:k==1?6.0:k==2?7.0:7.4;}
// the wrinkled body behind the great head, the low hump and the knuckles along the back
float spermD(vec2 f){float kn=0.;for(int i=0;i<5;i++){float sx=.63+.055*float(i);kn=max(kn,(i==0?.020:.009)*exp(-pow((f.x-sx)/.018,2.)));}
 float top=(prof(f.x,TOPS)+kn)*BL;float d=max(f.y-top,profSide(f,BOTS,-1.));d=smax(d,-f.x*BL,.035*BL);return max(d,(f.x-1.02)*BL);}
void sperm(vec2 w,int k,float T,float m){float tw=T-sWake(k);float turn=ss(.0,2.2,tw);float go=max(tw-.8,0.);
 vec2 c=sC0(k)+vec2(.02*sin(T*.25+float(k)),.012*sin(T*.31+float(k)*2.))+vec2(go<2.?.40*go*go/4.:.40+.50*(go-2.),.0);
 float ang=mix(PI*.5,.05,turn);float bend=.55*sin(PI*turn);
 vec2 dir=vec2(cos(ang),sin(ang));vec2 head=c+dir*.45*LS;
 spine(head,ang,LS,-1.,.07*ss(.6,2.,tw),TAU*.28*T,bend);
 if(spineNear(w)>.25*LS)return;
 vec3 f=bodyF(w);float dB=spermD(f.xy);
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float dK=flukeD(tq,.14*LS,.10+.30*abs(sin(TAU*.28*T-1.))*ss(.5,2.,tw)+.08,0.);
 vec2 dd=bodyDir(.36);vec2 fn=bodyNrm(.36);vec2 fa=bodyPt(.36,-prof(.36,BOTS)*LS*.50);vec2 ft=fa-dd*.08*LS-fn*.035*LS;float dF=sdCap(w,fa,ft,.020*LS,.012*LS);
 // the narrow lower jaw under the head
 vec2 j0=bodyPt(.07,-prof(.07,BOTS)*LS*.78),j1=bodyPt(.30,-prof(.30,BOTS)*LS*.70);float dJ=sdCap(w,j0,j1,.010*LS,.016*LS);
 float dAll=min(min(dB,dK),dF);float a=covW(dAll);if(a<.002)return;
 float zz=max(-w.y,0.);vec3 E=lightAt(zz)*1.7;vec3 amb=waterCol(zz)*1.1+vec3(.004,.008,.014);
 float u=bodyU(f.xy,TOPS,BOTS);vec3 n=tubeN(f.xy,u);
 vec2 q=vec2(f.x*LS*12.,f.y*30.);float mo=fbm(q);
 vec3 alb=vec3(.12,.11,.10)*(.85+.30*mo);
 // the skin behind the head is wrinkled in ridges across the body; pale scars on the head
 float wr=ss(.30,.42,f.x)*(.5+.5*sin(f.x*LS*190.+4.*fbm(q*.6)+3.*fbm(vec2(f.y*40.,f.x*3.))));n=normalize(n+vec3(bodyDir(f.x)*.12*(wr-.5)*ss(.30,.42,f.x),0.));
 float sc=ss(.35,.0,f.x)*ss(.80,.92,vn(vec2(f.x*LS*30.,f.y*120.)+3.));alb=mix(alb,vec3(.45,.44,.42),sc*.6);
 vec3 col=lit(alb,n,E,amb,.25)+rimL(n,E,.45);
 // the jaw: pale lips; the small eye near the corner of the mouth
 col=mix(col,lit(vec3(.34,.33,.31),normalize(vec3(-fn*.4,1.)),E,amb,.2),covW(dJ)*.55);
 col=eyeC(col,w,bodyPt(.29,-prof(.29,BOTS)*LS*.35),.007*LS,E,vec3(.03));
 vec3 fc=lit(alb*.9,normalize(vec3(-fn*.3,1.)),E,amb,.2);col=mix(col,fc,covW(dF));
 col*=1.-.35*edgeK(dAll);
 // out of the dark at first, into it as they go
 float dark=(1.-ss(2.,4.6,T))*.75;col=fogW(col,.10+.22*VH*m+2.2*dark+2.6*ss(1.8,4.8,go),zz);
 putF(col,a);}
void scene(vec2 w,float T){
 SUND=normalize(vec2(.10,1.));SUNC=vec3(.95,.97,1.);WAT0=vec3(.012,.085,.20);
 KD=vec3(2.8,.62,.30);KH=vec3(2.4,.70,.42);VEIL=vec3(.004,.030,.075);
 float z=max(-w.y,0.);vec3 wc=waterCol(z)*(.40+1.1*ss(-.8,.6,P.y));
 wc+=lightAt(z)*vec3(.55,.70,.85)*.55*shafts(w*vec2(.6,1.),T*.6)*ss(-.6,.7,P.y);
 wc+=lightAt(z*.7)*.30*snow(P,T);
 BG=wc;
 float wpx0=WPX;
 for(int j=0;j<4;j++){int k=j==0?3:j==1?1:j==2?2:0;float m=sM(k);float go=max(T-sWake(k)-.8,0.);float mm=m;
  vec2 wk=CAM+P*VH*mm;WPX=wpx0*mm;sperm(wk,k,T,mm);}
 WPX=wpx0;
}
