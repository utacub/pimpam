// Sabana de paper (CE36, 0.30): the backdrop of the diorama, drawn before the animals. From far to near: the sky (a sheet of thin paper
// lit from behind: the sun and the moon are paper discs that glow, at night it is a dark card pricked with holes, the stars and the
// Milky Way), flat-bottomed clouds of torn paper at three depths, Kilimanjaro far away (near the start of the route only), and the
// plain in eight strips of torn paper whose tops are cut into grass, with flat-topped acacias, bushes and termite mounds; the lake
// (x 1–8) and the river (x 17–24) are bands of paper water between the strips. High above the plain, at the start and at the end, a
// sea of clouds. Each strip casts a soft shadow on the one behind it, away from the sun. Everything repeats along x every SB_PERIOD.
out vec4 O;
float PXB;
// The water of strip k at x: how far inside the lake or the river (world units, positive inside), with a shore that moves from strip
// to strip (a ragged, curved outline).
float waterK(float x,float k){float w=wrapX(x),j=pfbm(x,.8,k+3.)-.5;
 float lake=min(w-(1.0+1.5*h11(k+1.)+j),(8.2-1.4*h11(k+7.)+j)-w);
 float riv=min(w-(16.9+.5*h11(k+3.)+j*.5),(24.1-.5*h11(k+9.)+j*.5)-w);
 return max(lake,riv);}
// Thin cut grass on the top edge of a strip: tufts of blades, taller in places.
float blades(float x,float s,float seed){float a=0.;
 for(int i=0;i<2;i++){float fi=float(i),f=(26.+fi*17.)/s,u=x*f+seed*3.1+fi*.37,id=floor(u),tri=1.-2.*abs(fract(u)-.5),h=h11(id+seed*7.+fi*13.);
  a=max(a,pow(tri,2.2+2.*h)*(.35+.65*h));}
 return a*(.45+.55*ss(.3,.75,pfbm(x,.9/s,seed)));}
// An umbrella-thorn acacia seen far away: a flat crown in two tiers on a trunk that forks. Distance to the crown (x) and to the
// trunk (y), in units of the strip. s: size.
vec2 acacia(vec2 u,float s,float seed,float pr){float cw=3.2*s,cell=floor(u.x/cw),h=h11(cell+seed);if(h>pr)return vec2(9.);
 float cx=(cell+.3+.4*h11(cell+seed+5.))*cw,ht=s*(.80+.5*h11(cell+seed+9.)),wd=s*(.70+.45*h11(cell+seed+3.));vec2 l=u-vec2(cx,0.);
 float e=.035*s*(vn(l*vec2(18.,26.)/s)-.5)+.012*s*(vn(l*90./s)-.5);
 float c1=sdEll(l-vec2(0.,ht),vec2(wd,wd*.17)),c2=sdEll(l-vec2(-wd*.18,ht+wd*.13),vec2(wd*.62,wd*.13));
 float crown=min(c1,c2)+e;crown=max(crown,-(l.y-ht+wd*.09));
 float tr=sdCap(l,vec2(0.,0.),vec2(.02*s,ht*.55),.030*s,.022*s);
 tr=min(tr,sdCap(l,vec2(.02*s,ht*.55),vec2(-wd*.45,ht),.020*s,.012*s));tr=min(tr,sdCap(l,vec2(.02*s,ht*.55),vec2(wd*.40,ht+.01*s),.018*s,.011*s));
 tr=min(tr,sdCap(l,vec2(.02*s,ht*.45),vec2(wd*.05,ht),.016*s,.010*s));
 return vec2(crown,tr);}
vec3 sky(vec2 p){vec2 d=p-HOR;
 vec3 c=mix(SKYH,SKYM,ss(-.01,.22,d.y));c=mix(c,SKYT,ss(.18,.75,d.y));c=mix(c,SKYH*.92,ss(0.,-.12,d.y));
 // handmade paper lit from behind: the thickness varies (mottling) and the fibres show
 float mott=fbm(p*2.6+vec2(7.,1.));c*=1.+(mott-.5)*.12*(1.-.5*NIGHT)+fibre(p*.9)*.035;
 // the night card: pinholes (stars), the Milky Way as a band of tiny holes and thin places, the moon a disc of paper lit from behind
 float nv=max(NIGHT,0.);
 if(nv>.01){float band=exp(-pow((d.y-.10-(p.x+.1)*.55)/.12,2.));
  for(int k=0;k<2;k++){float fk=float(k),sc=k==0?26.:64.;vec2 u=p*sc+fk*7.3,id=floor(u),f=fract(u)-.5;vec2 h=h22(id+fk*13.);
   float dens=k==0?.06+.16*band:.03+.30*band;if(h.x<dens){vec2 o=(h22(id+fk*3.+1.)-.5)*.6;float rr=length(f-o)/sc,sz=(k==0?1.0:.6)*(.7+.8*h.y)*PXB;
    float tw=.85+.15*sin(uG*(.4+.6*h.y)+h.x*40.);float ce=.5-max(abs(f.x),abs(f.y));c+=vec3(1.,.94,.82)*(ss(sz*1.6,sz*.3,rr)*(k==0?1.3:.8)+exp(-rr/(sz*2.6))*.20*ss(0.,.15,ce))*tw*nv*ss(-.01,.04,d.y);}}
  float mw=fbm(p*vec2(7.,11.)+3.);c+=mix(vec3(.30,.34,.55),vec3(.50,.42,.40),ss(.4,.7,mw))*band*sat(mw-.30)*.30*nv*ss(0.,.1,d.y);
  vec2 mp=d-MOONP;float mr=length(mp);c+=vec3(.5,.55,.75)*exp(-mr/.16)*.10*nv;
  float md=torn(mr-.042,mp*4.,.002,16.);vec3 mc=vec3(.95,.92,.82)*(.85+.25*fbm(mp*60.)-.2*ss(.4,.7,vn(mp*45.+2.)));c=mix(c,mc,ss(PXB*1.4,-PXB*1.4,md)*nv);}
 return c;}
// The sun: a disc of thin paper with a torn edge, a larger paler disc under it, and its glow; drawn after the far clouds, so that a
// cloud never hides it at dawn or at sunset.
vec3 sunDisc(vec3 c,vec2 p){vec2 d=p-HOR;
 float sv=ss(-.11,-.02,SUNP.y)*(1.-NIGHT);
 if(sv>0.){vec2 sp=d-SUNP;float r=length(sp);c+=SUNC*(exp(-r/.30)*.12+exp(-r/.07)*.20)*sv*(1.-.6*DAY*ss(.15,.5,SUNP.y));
  float r1=torn(r-.090,sp*3.,.006,9.),r2=torn(r-.052,sp*5.,.003,14.);
  c=mix(c,c*.6+vec3(1.0,.70,.42)*(.5+.3*DAY)+SUNC*.15,ss(PXB*1.5,-PXB*1.5,r1)*.55*sv);c=mix(c,vec3(1.55,1.18,.72)*(.80+.25*DAY)+SUNC*.20+vec3(.15,.12,.06)*fibre(sp*2.),ss(PXB*1.5,-PXB*1.5,r2)*sv);}
 return c;}
// A flat-bottomed cumulus of torn paper (the clouds of the savanna): puffs on a flat base. Distance at L on a sheet of size s.
float cloudBase(float cell,float fk,float s){return (.07+.10*h11(cell+fk*9.)+.05*fk)*s;}
float cloudD(vec2 L,float s,float fk){float cw=.36*s,x=L.x+uG*.012*s,cell=floor(x/cw);float h=h11(cell+fk*17.);if(h>.55)return 9.;
 float cx=(cell+.5)*cw+(h11(cell+fk*5.+2.)-.5)*.10*s,w=(.055+.06*h11(cell+fk*3.))*s,base=cloudBase(cell,fk,s);vec2 l=vec2(x-cx,L.y-base);
 float d=9.;for(int i=0;i<4;i++){float fi=float(i),ox=(-.62+fi*.42)*w,r=w*(.30+.22*h11(cell+fi*3.1+fk))*(i==1||i==2?1.25:.9);d=min(d,length(l-vec2(ox,r*.45))-r);}
 d=smin(d,sdBox(l-vec2(0.,w*.06),vec2(w*.95,w*.06)),.02*s);d=max(d,-l.y);return torn(d,L/s,.004*s,30.);}
vec3 clouds(vec3 c,vec2 p){
 // one long strip of thin tissue low in the sky, glowing at dawn and at sunset
 {float z=48.,s=z+1.;vec2 L=uCam.xy+(p-HOR)*(uCam.z+z)+HOR*uCam.z;float px=PXB*(uCam.z+z),x=L.x+uG*.004*s;
  float base=.035*s+.012*s*(pfbm(x,.5/s,4.)-.5),top=base+.010*s*(.4+pfbm(x,1.2/s,6.));float dd=torn(max(base-L.y,L.y-top),L/s,.003*s,9.);
  float a=ss(px,-px,dd)*(.25+.35*GLOW)*(1.-.7*NIGHT);c=mix(c,c*.8+SUNC*.30*(.3+GLOW)+vec3(.12,.06,.10)*GLOW,a);}
 for(int k=0;k<3;k++){float fk=float(k),z=k==0?64.:k==1?36.:21.;float s=z+1.,px=PXB*(uCam.z+z);
  vec2 L=uCam.xy+(p-HOR)*(uCam.z+z)+HOR*uCam.z;
  // the shadow of the cloud on the sky behind it
  float ds=cloudD(L-SHD*.010*s*vec2(1.,.6),s,fk);c*=mix(vec3(1.),mix(vec3(.80,.82,.94),vec3(.85,.72,.80),GLOW),ss(.006*s,-.004*s,ds)*(.55-.35*NIGHT));
  float d=cloudD(L,s,fk);float a=ss(px,-px,d);if(a<=0.)continue;
  float cw=.36*s,x=L.x+uG*.012*s,cell=floor(x/cw),up=sat((L.y-cloudBase(cell,fk,s))/(.09*s));
  vec3 top=vec3(1.,.99,.97),bot=mix(vec3(.80,.80,.92),vec3(.95,.70,.75),GLOW);vec3 alb=mix(bot,top,ss(.0,.8,up));
  float rim=ss(-.007*s,-.0005*s,d);vec3 lit=alb*(AMB*.9+SUNC*(.45+.15*max(0.,SUN.y)))+SUNC*rim*(.10+.45*GLOW);
  lit=mix(lit,vec3(.035,.04,.10)+vec3(.12,.13,.24)*rim*.5+vec3(.04,.04,.08)*up,NIGHT*.92);
  lit=mix(lit,SKYH*.9+SUNC*.1,(1.-exp(-z/90.))*.35);
  c=mix(c,lit*(1.+fibre(L/s*4.)*.35),a*(.94-.30*NIGHT));}
 return c;}
// The sea of clouds high above the plain, at the start and at the end (tops near y 4.6): four sheets of torn paper seen from above,
// each filling everything below its top, the nearest passed through by the camera; it is there only while the camera is high.
vec3 cloudSea(vec3 c,vec2 p){float vis=ss(3.6,4.1,uCam.y);if(vis<=0.)return c;
 for(int k=0;k<4;k++){float fk=float(k),z=k==0?16.:k==1?7.:k==2?3.:1.2;vec2 L=uCam.xy+(p-HOR)*(uCam.z+z)+HOR*uCam.z;float px=PXB*(uCam.z+z);
  float x=L.x+uG*.01*(4.-fk);float bump=0.;for(int j=0;j<2;j++){float fj=float(j),u=x*(1.6+fj*1.9)/(1.+fk*.2)+fk*3.,id=floor(u),fr=fract(u)-.5;bump=max(bump,(.10-fj*.04)*sqrt(max(0.,.25-fr*fr))*2.*(.5+h11(id+fk*7.+fj)));}
  float top=4.50+.14*(pfbm(x,.8,fk+11.)-.5)+bump;
  float dd=torn(L.y-top,L,.010,7.);
  float a=ss(px,-px,dd);if(a<=0.)continue;float rim=ss(-.035,-.002,dd);
  vec3 lit=mix(vec3(.80,.80,.92)*(AMB+SUNC*.35),vec3(1.,.84,.82)*(AMB+SUNC*.45),.5+.5*rim)+SUNC*.30*rim*(.3+GLOW);
  lit=mix(lit,vec3(.06,.07,.16)+vec3(.28,.30,.50)*rim*.5,NIGHT*.85);
  lit*=1.-.25*ss(0.,.30,top-L.y);
  c=mix(c,lit*(1.+fibre(L*2.)*.3),a*vis);}
 return c;}
// Kilimanjaro, far away (depth 40): a broad blue-violet sheet with a nearly flat top (Kibo), its cap of snow (pink at dawn), and the
// jagged peak of Mawenzi to the right. Only one: the copy nearest the camera, seen while the route is near the start (it fades out
// before the copies change) and while the camera is below the clouds.
vec3 mountain(vec3 c,vec2 p){float x0=SB_PERIOD*floor(uCam.x/SB_PERIOD+.5);float vis=ss(2.4,1.6,uCam.y)*ss(20.,12.,abs(uCam.x-x0-3.));if(vis<=0.)return c;
 float z=40.;vec2 L=uCam.xy+(p-HOR)*(uCam.z+z)+HOR*uCam.z;float px=PXB*(uCam.z+z);float x=L.x-x0-3.,ax=abs(x);
 float kibo=7.-1.6*pow(sat((ax-1.2)/2.6),1.6)-3.4*pow(sat((ax-2.5)/16.),.7)+.08*(fbm2(vec2(x*1.3,1.))-.5);kibo=min(kibo,7.+.04*sin(x*5.));
 float mz=x-7.;float maw=5.0-.9*abs(mz)-2.5*pow(sat((abs(mz)-1.)/8.),.7)+.45*(fbm2(vec2(x*3.,4.))-.5)+.25*(vn(vec2(x*9.,2.))-.5);
 float top=max(kibo,maw);float dd=torn(L.y-top,L*.3,.05,3.);
 // its shadow on the sky
 float dsh=torn(L.y+SHD.y*.5-top,L*.3,.05,3.);c*=mix(vec3(1.),vec3(.86,.86,.95),ss(px*3.,-px,dsh)*.5*(1.-NIGHT)*vis);
 float a=ss(px,-px,dd);if(a<=0.)return c;
 vec3 alb=mix(vec3(.42,.44,.66),vec3(.58,.48,.70),GLOW);
 // the flank turned to the sun is a lighter sheet
 float th=atan(x,max(7.4-L.y,.05));float fu=th*3.2+.45*(fbm2(vec2(th*2.5,L.y*.35))-.5);float fid=floor(fu);
 float lit=sat(.5+.42*tanh(th*2.2)*sign(SUN.x+1e-4)+.30*(h11(fid*1.7+3.)-.5));lit=mix(lit,.5,ss(.5,.0,7.4-L.y)*0.);vec3 col=litFlat(alb,.2)*(.50+.12*lit)+SKYH*.30;
 float snowL=6.05+.30*(fbm2(vec2(x*1.9,2.))-.5)+.30*(vn(vec2(x*7.,3.))-.5)+.25*ss(1.4,4.,ax);float sn=ss(px*2.,-px*2.,torn(snowL-L.y,L*.5,.04,5.))*ss(4.4,2.,ax);
 sn=max(sn,ss(px*2.,-px*2.,torn(4.75-L.y,L*.5,.04,6.))*ss(1.6,.8,abs(mz))*.85);
 vec3 scol=mix(vec3(.90,.92,.97),vec3(1.,.80,.84),GLOW*.8)*(AMB*.7+SUNC*.45)*(.9+.12*lit);col=mix(col,scol,sn*.95);
 col=mix(col,col*.30+vec3(.02,.025,.06),NIGHT*.6);
 col*=1.+fibre(L*.2)*.25;return mix(c,col,a*vis);}
// The plain: strips of torn paper at depths ZK, each with its top cut into grass; acacias, bushes and termite mounds on some.
const float ZK[8]=float[](26.,15.,9.,5.2,3.0,1.7,1.0,.55);
float stripTop(float x,int k,out float wat){float z=ZK[k];float s=(z+1.);float fk=float(k);wat=waterK(x,fk);
 float hills=k==0?s*.075*pow(pfbm(x,1.8/s,0.),1.5):k==1?s*.030*pfbm(x,3.2/s,1.):k==2?s*.012*pfbm(x,4.8/s,2.):s*.004*pfbm(x,1./s,fk);
 // a few kopjes (rounded granite hills) on the second strip
 if(k==1){float u=x/(.9*s),id=floor(u),fr=fract(u)-.5;if(h11(id+31.)<.35)hills+=s*.035*sqrt(max(0.,.04-fr*fr*.9))*5.*(.6+.6*h11(id+33.));}
 float g=blades(x,s*(k<3?3.:1.),fk)*s*(k<3?.0025:.007);
 // the bank slopes down to the water
 return mix(hills+g,.0010*s,ss(-.07*s,0.,wat));}
vec3 plain(vec3 c,vec2 p){
 for(int k=0;k<8;k++){float z=ZK[k],fk=float(k);vec2 L=uCam.xy+(p-HOR)*(uCam.z+z)+HOR*uCam.z;float px=PXB*(uCam.z+z),s=z+1.,wat;
  float top=stripTop(L.x,k,wat);float dd=torn(L.y-top,L/s,.0025*s,24.);
  // acacias, bushes and termite mounds standing on the strip (not in the water)
  float wc=ss(-px*1.5,px*1.5,wat-1.6*max(0.,top-L.y)+.006*s*(vn(L*vec2(3.,40.)/s)-.5)),dry=1.-ss(-.12*s,-.02*s,wat),asz=k==1?.9:k==2?.7:.55;
  vec2 ac=k>=1&&k<=4?acacia(vec2(L.x,L.y-top*.7),asz,fk*3.,k==1?.40:k==2?.30:.18):vec2(9.);
  float acC=ss(px,-px,ac.x)*dry,acT=ss(px,-px,ac.y)*dry;
  float bush=9.;if(k>=2&&k<=6){float cw=.055*s,cell=floor(L.x/cw),hb=h11(cell+fk*11.);if(hb<.30){float bx=(cell+.5)*cw,r=cw*(.22+.18*hb);vec2 l=vec2(L.x-bx,L.y-top+r*.2);
    bush=torn(sdEll(l,vec2(r*1.3,r)),L/s,.01*s,40.);}}
  float bsh=ss(px,-px,bush)*dry;
  float mound=0.;if(k>=3){float cw=.66*s,cell=floor(L.x/cw),hm=h11(cell+fk*5.);if(hm<.22){float mx=(cell+.5)*cw,mh=s*.022*(.6+hm*2.);vec2 l=vec2(L.x-mx,L.y-top);
    mound=ss(px,-px,max(max(abs(l.x)-mh*.30*(1.-l.y/mh)-mh*.10,l.y-mh),-l.y-mh*.3))*dry;}}
  float a=max(ss(px,-px,dd),max(max(acC,acT),max(bsh,mound)));if(a<=0.)continue;
  float fog=(1.-exp(-z/20.))*.72;vec3 alb=grassAlb(L.x,fk)*(.84+.16*h11(fk*7.3))*mix(vec3(1.),vec3(.92,1.,1.04),mod(fk,2.));
  // the water: bands of blue paper that take the colour of the sky (the far ones paler), a little turquoise by day; a light line at
  // the far shore, the darker reflection of the bank under it, slow ripples
  vec3 wcol=mix(mix(SKYH,SKYM,.6),mix(SKYM,SKYT,.35),sat(fk/6.))*.84;wcol=mix(wcol,vec3(.20,.55,.58)*(.55+.45*DAY),.35*DAY);
  float wy=(top-L.y)/s;float rip=sin(L.y/s*520.+sin(L.x*2.6/s+fk)*2.+uG*.4);
  vec3 wl=wcol*(1.+.035*rip)*(1.-.12*ss(.004,.03,wy)*ss(.06,.02,wy))+SUNC*.08*pow(max(0.,rip),10.)*DAY+mix(SKYH,vec3(1.),.3)*.22*ss(.004,.0,wy);
  vec3 col=litFlat(alb,.25);col=mix(col,wl,wc);
  // the torn top edge: a lighter fringe of fibres, glowing when the sun is low behind the paper
  float rim=ss(-px*3.5,-px*.3,dd)*(1.-wc)*(k<2?.4:1.);col=mix(col,col*1.22+SUNC*(.08+.35*GLOW),rim*.55);
  col*=1.+fibre(L/s*2.)*.35;
  // acacias: dark olive crown, lighter on its top, grey-brown trunk; bushes; termite mounds of red earth
  col=mix(col,litFlat(vec3(.26,.21,.16),.1),acT);
  float ctop=ss(-.02*asz,.06*asz,L.y-top*.7-asz*.95);
  col=mix(col,litFlat(vec3(.20,.25,.09),.35)*(1.+.30*ctop),acC);
  col=mix(col,litFlat(vec3(.22,.28,.10),.3)*(1.+fibre(L/s*3.)*.3),bsh);
  col=mix(col,litFlat(vec3(.60,.34,.20),.1),mound);
  // the shadow of the next strip in front, away from the sun, softer with the gap
  if(k<7){float z2=ZK[k+1];vec2 L2=uCam.xy+(p-HOR)*(uCam.z+z2)+HOR*uCam.z;float gap=z-z2,o=gap/(uCam.z+z)*.10;vec2 Ls=L2-SHD*o*(uCam.z+z2);float w2;
   float t2=stripTop(Ls.x,k+1,w2);float sh=ss(.003*(z2+1.)+o*.3*(uCam.z+z2),-o*.1,Ls.y-t2)*(1.-.6*NIGHT);col*=mix(vec3(1.),vec3(.52,.54,.78),sh*.70*DAY+sh*.30*(1.-DAY));}
  col=mix(col,mix(SKYM,SKYH,.5)*.86+AMB*.06,fog);col=mix(col,col*.30+vec3(.010,.012,.035),NIGHT*.6);
  c=mix(c,col,a);}
 return c;}
void main(){hourLight();vec2 p=pScreen();PXB=1./uR.y;
 if(uDecor>1.5){O=vec4(baseCol(),1.);return;}
 vec3 c=sky(p);c=clouds(c,p);c=sunDisc(c,p);c=mountain(c,p);c=plain(c,p);c=cloudSea(c,p);
 if(uDecor>.5)c=mix(baseCol(),c,uOpacity);
 O=vec4(c,1.);}
