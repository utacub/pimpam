#define SURFACE
// ---- The garden of today, at the top of the well (before the first press, and where the climb after the twentieth scene ends): a
// clear autumn morning. A robin perches on a low branch of a hawthorn hung with red haws; behind, a lawn strewn with fallen leaves, a
// hedge of beech and hornbeam, trees in autumn colour, hazy hills and the low sun; leaves fall slowly. At rest (t large) it lives on
// the world's clock uG: little hops along the branch and turns, head tilts, tail flicks, a bob, a ruffle of its feathers now and then.
// During the climb (t from 0; the camera arrives at 5 s) it sings when the camera arrives: two phrases, 5.20–5.85 and 6.10–6.95 s
// (the beak, the throat, the puffed breast); from t = 7 it is the same as at rest. Only above the ground: the soil under it is the rock's.
const float GG=-.30;   // the ground (the cut of the well)
const float GH=-.035;  // the horizon (behind the far hills)
const float GL=-.085;  // the far edge of the lawn (the foot of the hedge)
vec2 R2(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
vec2 FU(vec2 p,vec2 dir,float ka,float kc){vec2 pp=vec2(-dir.y,dir.x);return dir*dot(p,dir)*ka+pp*dot(p,pp)*kc;}
vec2 bez(vec2 a,vec2 b,vec2 c,float t){return mix(mix(a,b,t),mix(b,c,t),t);}
float gWob(float a,float w,float k){return a<0.?0.:exp(-a*k)*sin(a*w);}

// ---- The hawthorn: the main branch comes in from the right (its trunk is out of the picture) and thins to a tip on the left ----
const float BT=-.54;   // the tip of the main branch
float brY(float x){return .006+.13*x+.07*x*x+.010*sin(x*7.+1.)+.004*sin(x*17.+.5);}
float brR(float x){return mix(.006,.046,ss(BT,1.15,x))*(1.+.10*sin(x*23.+1.)+.06*sin(x*41.));}
float brW(float x){float w=ss(1.2,BT,x);return w*w;}   // how much it moves with the wind (the tip most)
float BDIP=0.;   // the branch's give under the robin (its landings)
float brOff(float x,float g){return brW(x)*(.0045*sin(g*1.05+x*1.3)+.0020*sin(g*2.3+x*2.9+1.)-.010*BDIP);}
vec2 brAt(float x,float g){return vec2(x,brY(x)+brOff(x,g));}
// the upper branch (at the top of the picture; in portrait it frames the sky)
float ubY(float x){return .53+.18*(x-.3)+.008*sin(x*9.+2.);}
float ubR(float x){return mix(.005,.030,ss(.0,1.25,x))*(1.+.10*sin(x*27.));}
// the twigs: [base x, on the main (0) or the upper (1) branch, control point (from the base)], [end (from the base), radii]
const int NTW=7;
const vec4 TWA[NTW]=vec4[NTW](vec4(.40,0.,.03,.10),vec4(.03,0.,-.05,-.06),vec4(-.32,0.,-.04,.07),vec4(.66,0.,.06,.12),vec4(.84,0.,.07,-.07),
 vec4(.62,1.,-.05,.09),vec4(.30,1.,-.03,-.07));
const vec4 TWB[NTW]=vec4[NTW](vec4(-.06,.22,.011,.004),vec4(-.14,-.10,.008,.003),vec4(-.13,.11,.007,.003),vec4(.00,.25,.014,.005),
 vec4(.14,-.13,.012,.004),vec4(-.02,.22,.012,.004),vec4(-.07,-.15,.008,.003));
void twigAt(int i,float g,out vec2 a,out vec2 b,out vec2 c){vec4 A=TWA[i],B=TWB[i];
 a=A.y<.5?brAt(A.x,g):vec2(A.x,ubY(A.x)+.003*sin(g*.9+A.x));
 float s=.004*sin(g*1.6+float(i)*1.9)+.002*sin(g*2.7+float(i));
 b=a+A.zw+vec2(s*.5,s*.3);c=a+B.xy+vec2(s,s*.6);}
// where a cluster hangs: on a twig (index, parameter), on the main branch (-1, x) or on the upper branch (-2, x)
// leaf clusters [where (twig, parameter), the angle, how many] and clusters of haws [twig, parameter, how many]
const int NLC=11;
const vec4 LCL[NLC]=vec4[NLC](vec4(-1.,-.54,3.35,3.),vec4(0.,1.,2.0,3.),vec4(2.,1.,2.4,3.),vec4(3.,1.,1.7,3.),vec4(-1.,.25,1.35,2.),
 vec4(1.,.55,-2.4,2.),vec4(4.,1.,-.9,3.),vec4(5.,1.,1.9,3.),vec4(6.,1.,-1.8,3.),vec4(-1.,-.40,-2.0,2.),vec4(-2.,.12,-2.2,3.));
const int NBC=7;
const vec3 BCL[NBC]=vec3[NBC](vec3(1.,1.,6.),vec3(-1.,.30,5.),vec3(0.,.55,4.),vec3(3.,.62,5.),vec3(6.,1.,6.),vec3(2.,.85,3.),vec3(4.,1.,5.));

// ---- The robin's state: P where its feet grip the branch, fx its facing (-1 left, 1 right; through small values as it turns in a
// hop), the hop (lift, crouch, air), the body's pitch ba, the head's pitch hp, the tail (ta its cock, tsp its spread), the wings (wd
// drooped, wo opened), fl a ruffle of all its feathers (shiv the shiver of the shake), and the song: pf the puffed breast, th the
// throat, bg the open beak ----
struct RS{vec2 P;float fx,lift,crouch,air,ba,hp,ta,tsp,wd,wo,fl,shiv,pf,th,bg,dip;};
const float RXA=.15,RXB=-.12;   // the two places on the branch where it perches (x)
const float RPER=20.;           // its idle cycle (s of the world's clock)
// one hop of the idle cycle: take-off h0, landing h1, from x0 to x1, facing f0 then f1, height H
void rHop(float ph,float h0,float h1,float x0,float x1,float f0,float f1,float H,inout float x,inout float fx,inout float lift,inout float air,
 inout float cr,inout float land){
 if(ph<h0-.25||ph>h1+.8)return;
 float a=sat((ph-h0)/(h1-h0));
 if(ph>=h0){x=mix(x0,x1,mix(a,a*a*(3.-2.*a),.5));fx=mix(f0,f1,ss(.25,.75,a));}
 lift+=H*4.*a*(1.-a);   // (in the robin's frame)
 air=max(air,ss(h0,h0+.05,ph)*(1.-ss(h1-.04,h1,ph)));
 cr+=ss(h0-.20,h0-.05,ph)*(1.-ss(h0-.05,h0+.03,ph))+.8*ss(h1-.02,h1+.04,ph)*(1.-ss(h1+.06,h1+.32,ph));
 land+=gWob(ph-h1,13.,4.5);}
RS rIdle(float g){RS r;float ph=mod(g,RPER);
 float x=ph<5.6?RXA:ph<13.9?RXB:RXA,fx=ph<11.?-1.:ph<17.6?1.:-1.,lift=0.,air=0.,cr=0.,land=0.;
 rHop(ph,5.60,5.98,RXA,RXB,-1.,-1.,.040,x,fx,lift,air,cr,land);   // a hop forward, along the branch to the left
 rHop(ph,11.0,11.30,RXB,RXB,-1.,1.,.020,x,fx,lift,air,cr,land);   // a hop on the spot, turning round
 rHop(ph,13.9,14.28,RXB,RXA,1.,1.,.040,x,fx,lift,air,cr,land);    // a hop forward, back to the right
 rHop(ph,17.6,17.90,RXA,RXA,1.,-1.,.020,x,fx,lift,air,cr,land);   // turning round again
 r.P=vec2(x,0.);r.fx=fx;r.lift=lift;r.air=air;r.crouch=cr;r.dip=land;
 // bows (a quick bob of the body), tail flicks with the wings drooped, a ruffle of all its feathers that settle after the shake
 float bow=0.;for(int i=0;i<3;i++){float b=i==0?3.1:i==1?9.2:15.7;bow+=ss(b,b+.10,ph)*(1.-ss(b+.16,b+.42,ph));}
 float fk=0.;for(int i=0;i<5;i++){float e=i==0?2.2:i==1?7.0:i==2?10.1:i==3?12.7:16.4;fk+=ss(e,e+.06,ph)*(1.-ss(e+.09,e+.55,ph));}
 float sh=ss(8.0,8.12,ph)*(1.-ss(8.55,9.1,ph))+.6*ss(19.0,19.12,ph)*(1.-ss(19.4,19.9,ph));
 r.shiv=.05*sin(ph*TAU*8.5)*(ss(8.06,8.12,ph)*(1.-ss(8.45,8.55,ph))+.6*ss(19.06,19.12,ph)*(1.-ss(19.3,19.4,ph)));
 r.fl=sh+.30*gWob(ph-8.75,11.,3.5)+.2*gWob(ph-19.55,11.,3.5);
 r.ba=.52-.32*bow+.10*cr-.16*air;
 // the head: still for a while, then a quick tilt to a new look (down at the lawn, up, level), as robins do
 float hk=(g+.37)/1.35,k=floor(hk),f=fract(hk);
 float hA=(h11(k*.71+.3)-.55)*.62,hB=(h11((k-1.)*.71+.3)-.55)*.62;
 r.hp=mix(hB,hA,ss(0.,.09,f))-.30*bow;
 r.ta=-.50*fk+.35*bow+.40*land-.15*air;r.tsp=.10+.6*fk+.7*air+.5*sh;
 r.wd=.9*fk+.3*sh;r.wo=.75*air*ss(.0,.03,min(abs(x-RXA),abs(x-RXB)));
 r.pf=0.;r.th=0.;r.bg=0.;
 return r;}
RS rState(float t,float g){
 RS r=rIdle(g);
 if(t<7.){
  // during the climb it stays where it will be when the song ends (no hop while the camera arrives and while it sings)
  float gF=g+7.-t;float ph=mod(gF,RPER);
  if(ph>5.35&&ph<6.78)gF+=6.78-ph;else if(ph>10.75&&ph<12.1)gF+=12.1-ph;else if(ph>13.65&&ph<15.08)gF+=15.08-ph;else if(ph>17.35&&ph<18.7)gF+=18.7-ph;
  RS s=rIdle(gF);float k=ss(6.8,7.,t);
  r.P.x=mix(s.P.x,r.P.x,k);r.fx=mix(s.fx,r.fx,k);r.lift*=k;r.air*=k;r.crouch*=k;r.dip*=k;r.wo*=k;
  // the song: it lifts its head and puffs its breast; two phrases, the beak opening with the notes, the throat pulsing
  float sE=ss(4.55,5.15,t)*(1.-ss(6.80,7.0,t));
  float p1=ss(5.18,5.24,t)*(1.-ss(5.79,5.86,t)),p2=ss(6.08,6.14,t)*(1.-ss(6.88,6.95,t)),pe=p1+p2;
  float nt=.5+.5*sin(TAU*7.3*t+2.*sin(TAU*1.9*t));
  r.bg=pe*(.25+.75*nt);r.th=pe*(.6+.4*sin(TAU*7.3*t+1.4))+.3*sE;r.pf=sE*(.6+.3*pe);
  r.hp=mix(r.hp,.30+.05*sin(TAU*.8*t)+.05*p2,sE);r.ba=mix(r.ba,.64,sE);r.ta=mix(r.ta,.15,sE);r.tsp=mix(r.tsp,.12,sE);r.wd=mix(r.wd,.20,sE);
  r.fl*=1.-sE;r.shiv*=1.-sE;}
 BDIP=.9*r.dip+.3*r.crouch;
 r.P=brAt(r.P.x,g)+vec2(0.,brR(r.P.x)-.0012);
 return r;}

// ---- Backdrop ----
void gSky(vec2 q,float g){
 sky(q,vec3(.33,.53,.84),vec3(.93,.89,.79),GH);
 if(uDecor>1.5)return;
 // the low morning sun beyond the top left corner
 float ds=length((q-vec2(-1.10,.52))*vec2(1.,1.15));
 glow(vec3(.50,.38,.20)*(.50*exp(-ds*2.2)+.30*exp(-ds*6.)),1.);
 // a few thin high clouds drifting slowly
 if(q.y>.12){vec2 c=vec2((q.x-g*.006)*1.3,q.y*7.5);float n=fbm(c+vec2(0.,3.));float a=ss(.56,.80,n)*ss(.14,.30,q.y)*(1.-ss(.9,1.25,q.y));
  veil(vec3(.97,.95,.92),a*.45,1.);}}
void gFar(vec2 q,float g){
 if(q.y>.14||uDecor>1.5)return;
 vec3 sk=vec3(.90,.87,.80);
 float h1=GH+.075+.11*(fbm2(vec2(q.x*.9+4.,2.))-.5)+.02*sin(q.x*2.1+1.);
 veil(mix(vec3(.58,.62,.72),sk,.40)*(.96+.06*vn(q*vec2(8.,30.)))*(.94+.08*ss(h1-.05,h1,q.y)),cov(q.y-h1),1.);
 // the wooded ridge nearer: tree crowns along its top, autumn tints
 float h2=GH+.026+.040*(fbm2(vec2(q.x*1.9+9.,5.))-.5)+.007*(vn(vec2(q.x*55.,1.))-.5);
 vec3 c2=mix(vec3(.48,.54,.48),vec3(.68,.56,.38),ss(.4,.7,vn(vec2(q.x*9.,3.))));c2=mix(c2,sk,.30)*(.90+.12*vn(q*vec2(40.,60.)));
 veil(c2,cov(q.y-h2),1.);
 // morning mist lying along the far fields
 float mi=ss(.030,-.006,q.y-GH-.004)*ss(GL-.01,GL+.035,q.y)*(.55+.45*fbm2(vec2(q.x*3.-g*.010,q.y*20.)));
 veil(vec3(.91,.90,.87),mi*.55,1.);}
// a tree crown: a cluster of round masses of foliage (p: the crown's own coordinates); lit: the light on the nearest mass
float gCrown(vec2 p,float sd,out float lit){float d=1e5;lit=0.;
 for(int j=0;j<7;j++){float k=float(j);float th=k*2.39+sd,rho=.62*sqrt((k+.5)/7.);vec2 o=vec2(cos(th),sin(th))*rho*vec2(1.,.9)+vec2(0.,-.04);
  float rj=.40+.12*h11(k+sd);vec2 l=p-o;float e=length(l)-rj;
  if(e<d){d=e;lit=dot(l/rj,vec2(-.55,.70));}}
 return d;}
// the far side of the garden: a birch in gold, a field maple in orange, a big beech in copper, other trees; then the hedge
void gMid(vec2 q,float g){
 if(q.y>.40||q.y<GL-.01||uDecor>1.5)return;
 vec3 sk=vec3(.88,.86,.80);
 for(int i=0;i<6;i++){
  vec2 c=i==0?vec2(-.72,.10):i==1?vec2(-.44,.035):i==2?vec2(.52,.15):i==3?vec2(1.02,.08):i==4?vec2(-1.12,.08):vec2(1.45,.10);
  vec2 rr=i==0?vec2(.068,.15):i==1?vec2(.085,.070):i==2?vec2(.24,.15):i==3?vec2(.13,.11):i==4?vec2(.15,.12):vec2(.17,.14);
  vec3 col=i==0?vec3(.90,.72,.28):i==1?vec3(.88,.50,.18):i==2?vec3(.76,.46,.18):i==3?vec3(.66,.64,.30):i==4?vec3(.60,.56,.26):vec3(.64,.44,.20);
  if(abs(q.x-c.x)>rr.x*1.1+.03||q.y>c.y+rr.y*1.1+.03)continue;
  c.x+=.004*sin(g*.8+float(i)*2.)*ss(c.y-rr.y,c.y+rr.y,q.y);
  // the trunk (the birch white with dark marks)
  float tk=sdCap(q,vec2(c.x,GL),vec2(c.x+.01*sin(float(i)*3.),c.y),i==2?.014:.006,i==2?.008:.003);
  vec3 tc=i==0?vec3(.86,.84,.78)*(1.-.5*step(.80,vn(vec2(q.x*90.,q.y*50.)))):vec3(.36,.34,.31);
  veil(mix(tc*(.75+.35*ss(c.x+.01,c.x-.01,q.x)),sk,.20),cov(tk),1.);
  vec2 p=(q-c)/rr;float lit;float d=gCrown(p,float(i)*1.7,lit);
  d+=.20*(fbm2(q*30.+float(i))-.5)+.06*(vn(q*120.)-.5);d*=min(rr.x,rr.y);if(d>PX*2.)continue;
  float l=.66+.42*ss(-1.,.9,-p.x*.7+p.y*.6)+.14*ss(-.2,.9,lit);   // lit on the sun's side (left), each mass a little
  float fo=fbm2(q*vec2(55.,65.)+float(i));l*=.82+.30*fo;          // clumps of leaves
  l*=1.-.45*ss(.30,.10,fo)*ss(-.5,.3,p.x-p.y);                   // shade between the clumps
  l*=1.-.35*ss(-.2,-.9,p.y);                                      // the shade under the crown
  vec3 cc=col*l;cc=mix(cc,cc*vec3(.80,.62,.70),ss(.0,-.9,p.y)*.5);cc=mix(cc,sk,.20);
  veil(cc,cov(d),1.);}
 // the hedge: beech and hornbeam, green and copper, its top lit
 float hy=GL+.040+.008*sin(q.x*9.)+.007*(fbm2(vec2(q.x*20.,1.))-.5);
 if(q.y<hy+.01){vec3 hc=mix(vec3(.30,.40,.22),vec3(.62,.40,.20),ss(.35,.65,vn(vec2(q.x*4.,7.))));
  hc*=(.80+.30*fbm2(q*vec2(40.,55.)))*(.86+.24*vn(q*vec2(160.,190.)))*(.80+.30*ss(hy-.03,hy,q.y));
  veil(mix(hc,sk,.12),cov(q.y-hy),1.);}}
// the lawn: grass, long morning shadows, fallen leaves; the grass at the front edge
void gLawn(vec2 q,float g){
 float yl=GL+.004*sin(q.x*6.+1.)+.003*vn(vec2(q.x*30.,2.));
 float dL=q.y-yl;if(dL>PX*4.)return;
 float s=sat((GH-q.y)/(GH-GG));   // the perspective scale: 1 at the front, small far away
 vec3 c=mix(vec3(.56,.60,.40),vec3(.36,.47,.21),ss(.2,.9,s));
 c=mix(c,c*vec3(1.08,1.0,.82),.5*ss(.55,.75,fbm2(vec2(q.x/s*2.,1.6/s)+7.)));   // patches yellowed by the autumn
 // long shadows of the trees (the sun low on the left, so they reach to the right)
 float shd=ss(.48,.66,fbm2(vec2(q.x/s*1.2-.9/s,.9/s)+vec2(3.,1.)));
 c*=.90+.18*fbm2(vec2(q.x/s*3.,2.4/s));
 c*=mix(vec3(1.),vec3(.70,.76,.88),shd*.65);
 // fallen leaves, in perspective (flattened on the ground)
 vec2 cu=vec2(q.x/s*15.,8.5/s);vec2 id=floor(cu),f=fract(cu)-.5;float hh=h21(id);
 float dens=.06+.30*ss(.35,.75,fbm2(id*vec2(.11,.07)));
 if(hh<dens){vec2 o=(h22(id+3.)-.5)*.35;float a=h21(id+7.)*TAU;float e=sdEll(R2(f-o,a),vec2(.28,.19)*(.8+.4*h21(id+9.)));
  float k=h21(id+11.);vec3 lc=k<.3?vec3(.78,.62,.26):k<.55?vec3(.74,.44,.18):k<.8?vec3(.54,.34,.18):vec3(.66,.58,.32);
  lc*=.80+.3*h21(id+13.);lc=mix(lc,lc*vec3(.70,.76,.88),shd*.65);
  c=mix(c,lc,ss(.04,-.04,e)*ss(.12,.30,s));}
 // the grass at the front edge, blades swaying a little
 float bx=q.x*110.+.6*sin(g*1.3+q.x*4.)*sat((q.y-GG)*40.);float bi=floor(bx),bf=fract(bx)-.5;float hb=.010+.024*h11(bi);
 float yb=(q.y-GG+.004)/hb;float lean=(h11(bi+5.)-.5)*.8;
 float blade=ss(.20,.08,abs(bf-lean*yb*yb)/max(1.-yb,.05))*step(0.,yb)*step(yb,1.);
 c=mix(c,mix(vec3(.22,.36,.14),vec3(.58,.62,.30),yb*.8)*(.85+.3*h11(bi+2.)),blade*.85);
 PIECE(dL,c,K_GRASS,vec2(q.x/s,1./s)*.6,vec2(0,1),.02,0.,1.);}

// ---- The hawthorn ----
// a hawthorn leaf: its stalk at o, pointing along a, length L, sq its width (turned edgewise as it flutters): a broad blade cut by two
// pairs of deep narrow sinuses into lobes, a wedge-shaped base. lu: its own coordinates.
float hLeaf(vec2 p,vec2 o,float a,float L,float sq,out vec2 lu){vec2 l=R2(p-o,-a);l.y/=sq;lu=l/L;
 vec2 s=vec2(l.x,abs(l.y))/L;
 float d=sdEll(s-vec2(.56,.0),vec2(.44,.30));
 d=max(d,-sdEll(R2(s-vec2(.66,.27),.75),vec2(.035,.16)));     // the sinuses
 d=max(d,-sdEll(R2(s-vec2(.42,.25),.95),vec2(.030,.13)));
 d=max(d,(s.y-(s.x-.08)*.95)*.7);                               // the wedge-shaped base
 d*=L*sq;
 return min(d,sdCap(vec2(l.x,l.y*sq),vec2(-.02*L,0.),vec2(.25*L,0.),.0013,.0009));}
void hawthorn(vec2 q,float g,RS r){
 if(uDecor>1.5||q.y<-.21)return;
 // the bark: the main branch, the upper branch, the twigs and their thorns
 float x=max(q.x,BT);float y=brY(x)+brOff(x,g);float sl=.13+.14*x+.042*cos(x*7.+1.);
 float dM=(abs(q.y-y)-brR(x))/sqrt(1.+sl*sl);if(q.x<BT)dM=length(vec2(q.x-BT,q.y-y))-brR(BT);
 float xu=max(q.x,.0);float dU=(abs(q.y-ubY(xu))-ubR(xu))/1.02;if(q.x<.0)dU=length(vec2(q.x,q.y-ubY(.0)))-ubR(.0);
 float d=min(dM,dU);vec2 bdir=vec2(1,0);float tw=0.;
 // the twigs, once (the clusters hang from them); near: whether leaves or haws can be at this pixel
 vec2 ta[NTW],tb[NTW],tc[NTW];bool near=d<.16;
 for(int i=0;i<NTW;i++){vec2 a,b,c;twigAt(i,g,a,b,c);ta[i]=a;tb[i]=b;tc[i]=c;vec2 lo=min(min(a,b),c),hi=max(max(a,b),c);
  if(q.x>lo.x-.14&&q.y>lo.y-.14&&q.x<hi.x+.14&&q.y<hi.y+.14)near=true;
  if(q.x<lo.x-.03||q.y<lo.y-.03||q.x>hi.x+.03||q.y>hi.y+.03)continue;
  float rm=mix(TWB[i].z,TWB[i].w,.45);float e=min(sdCap(q,a,b,TWB[i].z,rm),sdCap(q,b,c,rm,TWB[i].w));
  // two thorns on each twig
  for(int j=0;j<2;j++){float s=.25+.45*float(j);vec2 p0=j==0?mix(a,b,.55):mix(b,c,.45),tg=normalize(j==0?b-a:c-b);vec2 nn=vec2(-tg.y,tg.x)*(j==0?1.:-1.);
   e=min(e,sdCap(q,p0,p0+nn*.020+tg*.008,.0028,.0002));}
  if(e<d){d=e;bdir=normalize(c-a);tw=1.;}}
 vec3 bc=vec3(0.);
 if(d<PX*4.){
  bc=mix(vec3(.40,.35,.30),vec3(.42,.28,.22),tw);
  // grey-green lichen on the old wood
  bc=mix(bc,vec3(.56,.60,.50),ss(.64,.76,fbm(q*vec2(40.,90.)))*(1.-tw)*.45);
  // the robin's shadow on the branch beside it (the sun low on the left)
  bc*=1.-.35*ss(.055,.0,length((q-r.P-vec2(.045,.006))*vec2(.8,1.6)))*(1.-r.air);}
 float dL=1e5,dB=1e5;vec3 lc=vec3(0.),hc=vec3(0.);vec2 lu=vec2(0.);
 if(near){
 // the leaves: the nearest of each cluster (autumn: yellow, orange, russet, a few still green)
 for(int i=0;i<NLC;i++){vec4 C=LCL[i];vec2 o;int ti=int(max(C.x,0.));
  if(C.x<-1.5)o=vec2(C.y,ubY(C.y)+.003*sin(g*.9+C.y));else if(C.x<-.5)o=brAt(C.y,g);else o=C.y<.45?mix(ta[ti],tb[ti],C.y/.45):mix(tb[ti],tc[ti],(C.y-.45)/.55);if(length(q-o-vec2(cos(C.z),sin(C.z))*.04)>.12)continue;
  for(int j=0;j<3;j++){if(float(j)>=C.w)break;float k=float(i*3+j);
   float sd=mod(float(j),2.)<.5?1.:-1.;vec2 dz=vec2(cos(C.z),sin(C.z));
   float a=C.z+sd*(.55+.25*h11(k*2.9))*(j==0?.3:1.)+.10*sin(g*1.9+k*1.3)+.05*sin(g*3.1+k);
   float L=.070+.020*h11(k*1.7);vec2 u;float e=hLeaf(q,o+dz*.028*float(j),a,L,.75+.25*abs(cos(g*.7+k*2.1)),u);
   if(e<dL){dL=e;lu=u;float hh=h11(k*3.3+.5);
    lc=hh<.2?vec3(.62,.62,.26):hh<.45?vec3(.86,.66,.22):hh<.7?vec3(.86,.46,.16):hh<.88?vec3(.70,.26,.12):vec3(.52,.34,.20);
    lc*=.9+.2*h11(k*5.1);}}}
 // the haws: small, deep red, glossy, on thin stalks, with the dark remains of the flower at the tip
 for(int i=0;i<NBC;i++){vec3 C=BCL[i];vec2 o;int ti=int(max(C.x,0.));
  if(C.x<-1.5)o=vec2(C.y,ubY(C.y)+.003*sin(g*.9+C.y));else if(C.x<-.5)o=brAt(C.y,g);else o=C.y<.45?mix(ta[ti],tb[ti],C.y/.45):mix(tb[ti],tc[ti],(C.y-.45)/.55);if(length(q-o-vec2(0.,-.024))>.06)continue;
  for(int j=0;j<6;j++){if(float(j)>=C.z)break;float k=float(i*6+j);float ph=float(j)*2.4+float(i);
   vec2 c=o+vec2(0.,-.024)+vec2(cos(ph),sin(ph)*.8)*.017*sqrt((float(j)+.5)/C.z)+vec2(.002*sin(g*1.7+k),0.);
   float rr=.0088+.0018*h11(k);
   float e=length(q-c)-rr;vec3 col=vec3(.66,.08,.06)*(.85+.25*h11(k*2.3));
   col=mix(col,vec3(.16,.07,.05),ss(.0034,.0016,length(q-c-vec2(.0,-rr*.75))));
   float st=sdCap(q,o,c+vec2(0.,rr*.6),.0011,.0009);if(st<e){e=st;col=vec3(.40,.30,.20);}
   if(e<dB){dB=e;hc=col;}}}
 }
 if(d<PX*4.)PIECE(d,bc,K_BARK,FU(q,bdir,2.5,2.5),bdir,.026,.35,1.);
 // the leaves and the haws in front of them: one piece (the haws plain and glossy)
 float dA=min(dL,dB);if(dA>PX*4.)return;
 if(dB<0.)dA=dB;
 float wb=cov(dB);vec3 col=mix(lc,hc,wb);vec2 ku=lu*.8;float R=.008;
 if(wb>.5||dB<dL){ku=vec2(0.,.5);R=.008;}
 PIECE(dA,col,K_LEAF,ku,vec2(1,0),R,.33,1.);}
// leaves falling slowly: a rocking fall, side to side, the leaf tilting with the swing
void fallLeaves(vec2 q,float g){
 if(uDecor>1.5)return;
 float dL=1e5;vec3 lc=vec3(0.);vec2 lu=vec2(0.);
 for(int i=0;i<6;i++){float k=float(i);float P=12.+4.*h11(k+.3);float ph=fract(g/P+h11(k*1.3));
  float sc=mix(.55,1.,h11(k*2.1));
  float w=TAU/(2.8+.9*h11(k*5.1)),sw=sin(g*w+k*1.7);
  vec2 c=vec2(mix(-.85,.85,h11(k*3.7))+.06*sc*sw+.12*(ph-.5),mix(1.25,-.36,ph)+.012*sc*abs(sw));
  if(length(q-c)>.05)continue;
  float a=-1.57+.55*cos(g*w+k*1.7);vec2 u;
  float e=hLeaf(q,c-R2(vec2(.022,0.),a)*sc,a,.042*sc,.45+.55*abs(cos(g*.9+k)),u);
  if(e<dL){dL=e;lu=u;float hh=h11(k*7.1);lc=hh<.35?vec3(.86,.66,.22):hh<.7?vec3(.84,.44,.15):vec3(.62,.30,.15);}}
 if(dL<PX*4.)PIECE(dL,lc,K_LEAF,lu*.8,vec2(1,0),.006,.3,1.);}

// ---- The robin (Erithacus rubecula): in its own frame (x forward, y up, the origin where its feet grip), drawn at P facing fx ----
// One feather: root o, angle a, length L, half width w; u along it (0 root .. 1 tip), v across (-1 .. 1).
float gFeather(vec2 m,vec2 o,float a,float L,float w,out float u,out float v){vec2 dv=vec2(cos(a),sin(a));vec2 l=m-o;float al=dot(l,dv),ac=dot(l,vec2(-dv.y,dv.x));
 u=sat(al/L);float r=w*(.45+.55*ss(.0,.22,u))*(1.-.42*ss(.60,1.,u)*ss(.60,1.,u));v=ac/max(r,1e-4);return length(vec2(al-clamp(al,0.,L),ac))-r;}
// the vane of a feather: its paler fringe, faint barbs, the shaft, the free edge catching the light, the shadow of the feather above
vec3 gVane(vec3 c,vec3 edge,float u,float v,float te,float sh,float L){
 c=mix(c,edge,ss(.30,.95,v)*.8);
 float barb=.5+.5*sin(u*L*900.-abs(v)*12.);c*=.95+.08*barb*ss(.0,.2,u);
 c=mix(c,c*.78,ss(.10,.0,abs(v+.15))*ss(.95,.4,u)*.5);
 c=mix(c,edge*1.08,ss(-.004,-.0008,te)*.45);
 c*=1.-.30*ss(.007,.0,sh);
 return c;}
const float RSC=1.9;   // the robin's size (its frame is 1/RSC of the screen's)
float DLG=1e5;vec3 LGC=vec3(0.);   // its legs (distance, colour), for its one piece
void robin(vec2 q,RS r,float g){
 vec2 m=(q-r.P)/RSC;if(m.x<-.17||m.x>.17||m.y<-.03||m.y>.22)return;
 r.fx=r.fx<0.?min(r.fx,-.28):max(r.fx,.28);   // turning round in a hop: it narrows, then shows its other side
 m.x/=r.fx;
 float br=.010*sin(g*TAU*.8);
 // the legs (behind the belly feathers): the far one darker; the toes grip the branch (three forward, one behind), in the air tucked
 {float dl=1e5;float nr=0.;vec2 T1=vec2(0.),T2=vec2(0.),T0=vec2(0.);
  for(int i=0;i<2;i++){float sd=i==0?-1.:1.;
   vec2 J=vec2(-.003+.004*sd-.008*r.crouch,.032+r.lift-.010*r.crouch);
   vec2 Ft=mix(vec2(.004*sd,0.),J+vec2(-.012,-.013),r.air);
   float e=sdCap(m,J,Ft,.0029,.0023);float g1=1.-r.air;
   vec2 t1=Ft+mix(vec2(.006,-.009),vec2(.015,-.0035),g1),t2=Ft+mix(vec2(.004,-.010),vec2(.012,-.006),g1),t0=Ft+mix(vec2(-.004,-.008),vec2(-.010,-.003),g1);
   e=min(e,min(sdCap(m,Ft,t1,.0018,.0011),min(sdCap(m,Ft,t2,.0017,.0011),sdCap(m,Ft,t0,.0017,.0011))));
   if(e<dl){dl=e;nr=float(i);T1=t1;T2=t2;T0=t0;}}
  DLG=dl;LGC=vec3(.54,.41,.35)*mix(.70,1.,nr)*(.92+.12*ss(.3,.0,abs(fract(m.y*300.)-.5)));
  LGC=mix(LGC,vec3(.12,.10,.09),ss(.0032,.0014,min(length(m-T1),min(length(m-T2),length(m-T0)))));}   // the claws
 // the body, the breast, the big round head and the throat; the tail; the folded wing: one coat of soft feathers
 vec2 Bc=vec2(-.010,.056+r.lift-.009*r.crouch);
 float ba=r.ba+r.shiv;vec2 fw=vec2(cos(ba),sin(ba)),up=vec2(-fw.y,fw.x);
 vec2 b=vec2(dot(m-Bc,fw),dot(m-Bc,up));
 float sw=1.+.12*r.fl+.05*r.pf+br*.5;
 float dBo=sdEll(b,vec2(.050,.037)*sw);
 dBo=smin(dBo,sdEll(b-vec2(.022,-.012),vec2(.034,.034)*(sw+.06*r.pf)),.022);
 vec2 Hc=Bc+fw*.046+up*.012+vec2(-.002,.004)*r.pf;
 vec2 hf=vec2(cos(r.hp),sin(r.hp)),hu=vec2(-hf.y,hf.x);
 vec2 h=vec2(dot(m-Hc,hf),dot(m-Hc,hu));
 float dHe=sdEll(h,vec2(.0265,.0240)*(1.+.10*r.fl));
 float dTh=sdEll(h-vec2(.006,-.019),vec2(.017,.012)*(1.+.30*r.th));
 float d=smin(smin(dBo,dHe,.020),dTh,.012);
 d-=(.0008+.0035*r.fl+.0012*r.pf)*(vn(R2(m,ba)*vec2(260.,170.))-.35);
 // the tail: five feathers seen from the side, fanning a little when it flicks
 vec2 Tb=Bc-fw*.040-up*.003;float aT=ba+PI-.42+r.ta;
 float tU=1e5,tu=0.,tv=0.,te=0.,tsh=1e5;vec2 tdir=vec2(-1,0),to=Tb;
 for(int i=0;i<5;i++){float k=float(i)-2.;float a=aT-k*(.035+.12*r.tsp);float L=.066-.003*abs(k);float u,v;
  float ei=gFeather(m,Tb+R2(vec2(0.,.0025*k),aT),a,L,.0098,u,v);
  if(ei<0.){tu=u;tv=v;te=ei;tdir=vec2(cos(a),sin(a));tsh=1e5;}else if(tU<0.)tsh=min(tsh,ei);tU=min(tU,ei);}
 // the folded wing along the flank, in the body's frame: four primaries reaching back to the tail, three tertials over them, a row of
 // greater coverts over their roots; the small coverts in front (plain). Drooped (wd) it lowers its tips; opened (wo) it lifts.
 float aW=ba+PI+.06+.20*r.wd-.55*r.wo;vec2 wf=vec2(cos(aW),sin(aW)),wq=vec2(wf.y,-wf.x);   // wf backwards, wq towards the back
 vec2 Ws=Bc+fw*.024+up*.010;
 float wU=1e5,wu=0.,wv=0.,we=0.,wsh=1e5,wk=0.,wL=.04;vec2 wdir=wf,wo=Ws;
 for(int i=0;i<12;i++){float k=float(i);vec2 o;float a,L,w;
  if(i<4){o=Ws+wf*(.028+.003*k)-wq*(.007-.0012*k);a=aW-.02+.012*k-.10*r.wo*(3.-k);L=.056-.003*k;w=.0085;}
  else if(i<7){float j=k-4.;o=Ws+wf*(.022+.007*j)+wq*(.004-.001*j);a=aW+.10-.03*j-.08*r.wo;L=.040-.003*j;w=.0100;}
  else{float j=k-7.;o=Ws+wf*(.004+.0070*j)+wq*(.006-.0004*j);a=aW+.26-.025*j;L=.019;w=.0068;}
  float u,v;float ei=gFeather(m,o,a,L,w,u,v);
  if(ei<0.){wu=u;wv=v;we=ei;wdir=vec2(cos(a),sin(a));wsh=1e5;wk=k;wo=o;wL=L;}else if(wU<0.)wsh=min(wsh,ei);wU=min(wU,ei);}
 float dWp=sdEll(R2(m-(Ws+wf*.016+wq*.002),-aW),vec2(.024,.0105));
 float dWg=min(wU,dWp);
 float dAll=min(min(d,tU),dWg);
 if(min(dAll,DLG)>.01)return;
 // the colours: olive-brown above; the orange-red face and breast edged with blue-grey; white belly, buff flanks
 vec3 oliv=vec3(.45,.39,.27),orng=vec3(.88,.44,.17),gry=vec3(.50,.53,.57),wht=vec3(.90,.88,.84),buf=vec3(.80,.70,.55);
 float dO=smin(sdEll(h-vec2(.006,-.003),vec2(.023,.020)),sdEll(b-vec2(.030,-.006),vec2(.034,.034)*sw),.016);
 dO=max(dO,h.y-.014-.30*h.x);
 dO+=.0018*(vn(m*vec2(300.,240.))-.5);
 float und=ss(.004,-.004,b.y+.004+.22*b.x);
 vec3 alb=mix(oliv,mix(buf,wht,ss(-.012,-.030,b.y)),und);
 alb=mix(alb,gry,ss(.0060,.0025,dO)*(1.-und)*ss(-.03,.0,h.x+.5*h.y+.02));
 alb=mix(alb,orng,ss(.0015,-.0015,dO));
 vec2 dd=normalize(-fw-up*.25);vec2 uu=FU(m-Bc,dd,9.,5.5);
 if(dHe<dBo){dd=-hf;uu=FU(h,-hf,10.,6.5);}
 // the tail where it shows beyond the body
 float tw=cov(tU*RSC)*(1.-cov((d+.002)*RSC));
 if(tw>0.){vec3 tc=gVane(vec3(.42,.34,.25),vec3(.52,.42,.30),tu,tv,te,tsh,.066);alb=mix(alb,tc,tw);if(tw>.5){dd=-tdir;uu=FU(m-to,tdir,6.,24.);}}
 // the wing over the body: the shadow under its lower edge, then its feathers
 alb*=1.-.22*ss(.006,.0,dWg)*step(0.,dWg);
 if(dWg<.002){vec3 wc,wE;
  if(wk<3.5){wc=vec3(.30,.26,.20);wE=vec3(.46,.40,.29);}else if(wk<6.5){wc=vec3(.37,.31,.22);wE=vec3(.52,.44,.30);}else{wc=vec3(.41,.35,.25);wE=vec3(.50,.43,.30);}
  vec3 c=wU<dWp?gVane(wc*(.94+.12*h11(wk*3.1)),wk>6.5?wc*1.04:wE,wu,wv,we,wsh,wL):oliv*.97;
  if(wk>6.5&&wU<dWp)c=mix(c,vec3(.60,.52,.36),ss(.80,.98,wu)*.6);   // the pale tips of the greater coverts
  float ww=cov(dWg*RSC);alb=mix(alb,c,ww);if(ww>.5&&wU<dWp){dd=-wdir;uu=FU(m-wo,wdir,6.,24.);}}
 // turned, the texture follows the facing
 dd.x*=sign(r.fx);
 // the beak: thin, dark; it opens with the notes (the yellow gape inside)
 {vec2 Bb=Hc+hf*.0220-hu*.0015;float ga=.42*r.bg;
  vec2 p=vec2(dot(m-Bb,hf),dot(m-Bb,hu));
  float dUp=min(sdCap(p,vec2(-.003,.0022),vec2(.010,.0012),.0040,.0022),sdCap(p,vec2(.010,.0012),vec2(.019,-.0010),.0022,.0006));
  vec2 pl=R2(p,ga);
  float dLo=min(sdCap(pl,vec2(-.003,-.0020),vec2(.009,-.0017),.0032,.0018),sdCap(pl,vec2(.009,-.0017),vec2(.0165,-.0006),.0018,.0005));
  float dM=ga>.02?max(max(p.y+.0004,-pl.y-.0004),length(p)-.011):1e5;
  float dk=min(min(dUp,dLo),dM);dk=max(dk,-(dHe+.0015));
  vec3 bc=dM<min(dUp,dLo)?vec3(.86,.64,.30):dLo<dUp?vec3(.30,.24,.20):vec3(.17,.14,.12);
  // one piece for all of it: the legs behind, the coat of feathers, the beak in front
  float wc=cov(dAll*RSC),wb=cov(dk*RSC);
  float dR=min(DLG,dAll);if(dAll<0.)dR=dAll;dR=min(dR,dk);if(dk<0.)dR=dk;
  // (the legs and the beak plain: their texture coordinates held still)
  vec3 col=mix(mix(LGC,alb,wc),bc,wb);float R=.003;vec2 ku=vec2(.3,.7),kdir=vec2(0,1);
  if(wc>.5||dAll<DLG){R=.034;ku=uu;kdir=dd;}
  if(wb>.5){R=.004;ku=vec2(.3,.7);kdir=vec2(1,0);}
  PIECE(dR*RSC,col,K_FEATHER,ku,kdir,R,1.,0.);}
 // the big dark eye
 vec2 E=Hc+hf*.010+hu*.0045;
 eyeA(q,r.P+vec2(E.x*r.fx,E.y)*RSC,.0064*RSC,vec3(.09,.06,.045),orng*.85,blinkAt(g,.17),0.);}

void life(vec2 q,float t){
 SUNL=normalize(vec3(-.62,.40,.62));SUNC=vec3(1.28,1.12,.92);AMBC=vec3(.48,.55,.66);BACK=.12;
 float above=ss(GG-.015,GG+.012+.012*vn(vec2(q.x*40.,1.)),q.y);if(above<=0.)return;
 F=vec4(baseCol(),1.);
 float g=uG;
 RS r=rState(t,g);
 gSky(q,g);gFar(q,g);gMid(q,g);gLawn(q,g);
 fallLeaves(q,g);
 hawthorn(q,g,r);
 // the robin's soft contact on the branch, then the robin
 if(abs(q.x-r.P.x)<.08&&abs(q.y-r.P.y)<.04)contact(q,r.P+vec2(0.,-.003),.045,.30*(1.-.8*r.air));
 robin(q,r,g);
 F*=above;}
