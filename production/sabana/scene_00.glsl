// 1 · El Kilimanjaro a l'alba. High above the plain, the snowy summit of Kibo (a sheet of blue-violet card with its cap of white paper)
// rises out of a sea of clouds of torn tissue (three sheets, drifting). The sun rises behind the clouds on the left (the hour moves on
// from 2.6 to 6.2 s: sabana.js): its light comes up through the tissue, a fan of pale rays opens, and the snow of the summit turns pink
// (the key moment, ≈ 4–5.5 s), then golden. A ribbon of flamingos crosses the sky towards the sun, necks forward and legs behind.
// Rays and colours change slowly: no flashes.
float sunUp(){return ss(.020,.040,uHour);}
// The summit: Kibo, broad with a nearly flat top and the notch of its crater, and the jagged Mawenzi on the right. Height at x (atS units).
float summitTop(float x){x-=.24;float ax=abs(x+.06);
 float k=.21-.30*pow(sat((ax-.24)/.55),1.35)-.30*ss(.5,1.3,ax)+.010*(vn(vec2(x*9.,1.))-.5)+.005*(vn(vec2(x*31.,2.))-.5);
 k-=.012*ss(.07,.0,abs(x+.0));
 float m=x-.70,maw=.06-.90*abs(m)+.030*(vn(vec2(x*22.,4.))-.5)+.015*sin(x*55.);maw=max(maw,-.12-.35*abs(m));
 return max(k,maw);}
// The lower edge of the snow: glacier tongues on the plateau, a little snow on Mawenzi.
float snowLine(float x){x-=.24;float ax=abs(x+.06);return .125+.030*(vn(vec2(x*11.,7.))-.5)-.035*ss(.35,.0,abs(fract(x*4.3+.2)-.5))*ss(.4,.1,ax)+.08*ss(.20,.45,ax);}
void summit(vec2 q){vec2 u=atS(3.);float px=pxS(3.);
 // its shadow on the sky behind
 float ds=u.y+SHD.y*.02-summitTop(u.x-SHD.x*.02);shade(ss(px*4.,-px,ds)*.30,vec3(.70,.66,.86));
 float d=torn(u.y-summitTop(u.x),u*2.,.004,18.);float c=ss(px,-px,d);if(c<=0.)return;
 float x=u.x-.16;
 // the rock: blue-violet card, the flank towards the sun lighter, bands of old lava, warmer when the sun is up
 float side=ss(-.25,.25,-x*sign(SUN.x+1e-4)+.08*(fbm2(u*vec2(4.,9.))-.5));
 vec3 rock=mix(vec3(.20,.20,.40),vec3(.34,.31,.54),side);
 float fold=sin((x*4.2-(u.y-.2)*2.2*sign(x))*PI+fbm2(u*3.)*1.5);rock*=1.+.10*ss(-.2,.2,fold)*(sign(x)*sign(-SUN.x)*.5+.5);rock=mix(rock,rock*vec3(1.25,.95,.95)+vec3(.10,.04,.02),sunUp()*side*.8);
 rock*=1.+.06*sin(u.y*120.+fbm2(u*6.)*6.)*ss(.0,-.1,u.y);
 vec3 col=rock*(AMB*1.2+SUNC*.22)+SKYH*.06;
 // the cap of snow: white paper with a scalloped lower edge and the steps of the glaciers; blue before the sun, then pink, then gold
 float sl=snowLine(u.x),sn=ss(px*1.5,-px*1.5,torn(sl-u.y,u*3.,.004,22.))*ss(.62,.40,abs(x));
 sn*=1.-ss(.66,.74,vn(u*vec2(16.,30.)+3.))*ss(.02,.06,u.y-sl);
 float m=u.x-.94;sn=max(sn,ss(px*1.5,-px*1.5,torn(.015+.02*sin(u.x*40.)-u.y,u*3.,.004,22.))*ss(.08,.03,abs(m))*.9);
 float pinkA=sunUp()*ss(.060,.042,uHour)+ss(.040,.060,uHour)*.0,gold=ss(.040,.060,uHour);
 vec3 snow=mix(vec3(.66,.70,.88),vec3(1.0,.70,.74),sunUp());snow=mix(snow,vec3(1.,.90,.74),gold*.8);
 float step_=ss(.35,.65,fract(u.x*6.+fbm2(u*5.)))*ss(.0,.05,u.y-sl)*.07;
 vec3 scol=snow*(.62+.55*sunUp()*(.6+.4*side))*(1.-step_)+vec3(.06,.05,.10)*(1.-sunUp());
 col=mix(col,scol*(1.+fibre(u*2.)*.25),sn);
 // the cut edge of the card catches the light
 col=mix(col,col*1.3+SUNC*.12*sunUp(),ss(-px*3.,-px*.4,d)*.6);
 col*=1.+fibre(u*1.5)*.30;
 solid(col,c);}
// The sea of clouds: a sheet of torn tissue whose top, near ytop, is a row of rounded puffs; it drifts at speed v. Lit on its top by the
// sun, pink and gold after sunrise, glowing where the sun is behind it.
void cloudSheet(float z,float ytop,float v,float seed,float k){vec2 u=atS(z);float px=pxS(z);float x=u.x+uG*v;
 float b=0.;for(int j=0;j<3;j++){float fj=float(j),f=(3.+fj*3.7),uu=x*f+seed+fj*.7,id=floor(uu),fr=fract(uu)-.5,hh=h11(id+seed*3.+fj);b=max(b,(.040-fj*.011)*sqrt(max(0.,.25-fr*fr))*2.*(.25+1.2*hh*hh));}
 float top=ytop+b+.02*(fbm2(vec2(x*2.,seed))-.5);
 float ds=torn(u.y+.012-top,u*2.,.004,20.);shade(ss(px*3.,-px,ds)*.25,vec3(.70,.66,.86));
 float d=torn(u.y-top,u*2.,.004,20.);float c=ss(px,-px,d);if(c<=0.)return;
 float rim=ss(-.025,-.002,d),deep=ss(0.,.10,top-u.y);
 vec2 sp=u-(SUNP+HOR);float near=exp(-length(sp*vec2(.8,2.))/.35);
 vec3 lo=mix(vec3(.30,.28,.54),vec3(.52,.38,.62),sunUp()),hi=mix(vec3(.62,.58,.82),vec3(1.,.74,.74),sunUp());
 vec3 col=mix(hi,lo,deep)*(.70+.40*AMB.r)+SUNC*(rim*(.08+.22*sunUp())+near*.22*sunUp()*(1.-deep*.6));
 col*=1.+fibre(u*2.)*.3;solid(decCol(col),c*k*DEC());}
// A fan of pale rays of light from the sun, above the clouds, while it rises (tissue lit from behind).
void rays(vec2 q){float a=sunUp()*ss(.075,.050,uHour);if(a<=.002)return;vec2 sp=q-(SUNP+HOR);float ang=atan(sp.y,sp.x),r=length(sp);if(sp.y<0.)return;
 float w=0.;for(int i=0;i<6;i++){float fi=float(i),c=.35+fi*.42+.03*sin(uG*.13+fi*2.);w+=ss(.07,.0,abs(ang-c))*(.5+.5*h11(fi+3.));}
 glow(SUNC*w*a*.045*exp(-r/.9)*ss(.06,.2,r));}
// A flamingo flying, seen from the side, heading left: the neck stretched forward, the legs trailing behind, the wings beating (ph);
// black flight feathers under the pink. Size s. Distance-drawn in its own frame.
void flyingFlamingo(vec2 u,vec2 c,float s,float ph,float px){vec2 f=(u-c)/s;if(abs(f.x)>1.6||abs(f.y)>1.)return;
 float fl=sin(ph);vec3 pink=vec3(1.,.55,.62),deep=vec3(.95,.32,.45),blk=vec3(.06,.05,.07);
 float body=sdEll(f-vec2(.05,0.),vec2(.27,.12));
 float neck=sdCap(f,vec2(-.15,.02),vec2(-.78,.06+.03*fl),.045,.030);float head=sdEll(f-vec2(-.84,.06+.03*fl),vec2(.07,.05));
 float bill=sdCap(f,vec2(-.88,.05+.03*fl),vec2(-1.00,-.01+.03*fl),.028,.012);
 float legs=sdCap(f,vec2(.25,-.02),vec2(1.25,-.06),.018,.014);
 vec2 w0=vec2(.02,.04);vec2 wt=w0+vec2(.12,.66*fl);float wing=sdCap(f,w0,wt,.16,.06);float tip=sdCap(f,mix(w0,wt,.55),wt+vec2(.05,.12*fl),.07,.035);
 float far=sdCap(f,w0,w0+vec2(.06,.50*fl),.11,.04);
 float pxf=px/s;
 if(fl<0.)solid(litFlat(deep*.8,.6),ss(pxf,-pxf,far));
 solid(litFlat(blk,.2),ss(pxf,-pxf,legs));
 float bd=min(min(body,neck),head);solid(litFlat(pink,.6)*(1.+.2*GLOW),ss(pxf,-pxf,bd));
 solid(litFlat(vec3(.95,.90,.85),.2),ss(pxf,-pxf,bill));solid(blk,ss(pxf,-pxf,max(bill,f.x+.95)));
 if(fl>=0.)solid(litFlat(deep*.8,.6),ss(pxf,-pxf,far));
 solid(litFlat(mix(pink,deep,.4),.7),ss(pxf,-pxf,wing));solid(litFlat(blk,.2),ss(pxf,-pxf,max(tip,-wing+.0)));}
void flamingos(vec2 q,float t){vec2 u=atS(1.2);float px=pxS(1.2);if(u.y<.0||u.y>.5)return;
 for(int i=0;i<9;i++){float fi=float(i),x=1.30-(t-1.0)*.20+fi*.15+.04*sin(fi*2.3),y=.33-fi*.018+.012*sin(t*.7+fi*1.7);
  flyingFlamingo(u,vec2(x,y),.075+.010*h11(fi),t*TAU*1.5+fi*1.1,px);}}
void scene(vec2 q,float t){
 summit(q);
 rays(q);
 cloudSheet(1.8,-.135,.012,1.,1.);
 flamingos(q,t);
 cloudSheet(.8,-.27,.020,5.,1.);
 cloudSheet(-.12,-.41,.030,9.,1.);
}
