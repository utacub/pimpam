// ---- Scene 12: the school of scalloped hammerheads (a seamount in the eastern Pacific, by day) ----
// Seen from below, against the light: 2–4 s the first hammerheads come in from the left, then the whole school streams across over the
// camera, each shark sweeping its tail, the T of its head clear against the bright water; by day they gather in schools over seamounts
// and disperse at night (Klimley et al., 1988). 6.6–8.6 in the middle of the school one shakes its head from side to side, again and
// again; 7–10 one passes very close, below the others; 9.5–14 the school rises a little toward the light and goes on out to the right.
// Each shark is laid out on the screen and drawn in its own world at its distance m (smaller and paler with distance, into the light).
const float LHH=.30;
const int NH=22;
float WHH[11]=float[11](.027,.048,.066,.074,.070,.060,.046,.032,.020,.012,.005);
// shark i: (screen height, delay, distance m, own phase)
vec4 hhI(int i){float fi=float(i);float h1=h11(fi*1.37+.2),h2=h11(fi*2.53+1.1),h3=h11(fi*.91+3.7);
 if(i==NH-1)return vec4(-.30,3.37,.58,h3);       // the one that passes close (drawn last, the nearest)
 if(i==17)return vec4(.02,1.21,1.30,h3);         // the one that shakes its head
 float m=2.60-1.65*fi/float(NH-2);return vec4(.70*(h3-.5)+.08*(m-1.6),2.8*h2,m,h11(fi*4.1));}   // the farthest first
float hhV(int i){return i==NH-1?.30:.24;}
float hhShake(int i,float T){if(i!=17)return 0.;float e=ss(6.6,6.9,T)*(1.-ss(8.2,8.6,T));return .30*sin(TAU*2.2*(T-6.6))*e;}
// the shark in plan view: the body, the hammer (cephalofoil, its front edge scalloped and notched), the sickle pectorals, the pelvics
float hhD(vec3 f,out float fin){float s=f.x,y=abs(f.y);
 float e=.01;float t=prof(s,WHH)*BL;float dt=(prof(s+e,WHH)-prof(s-e,WHH))/(2.*e);float d=(y-t)/sqrt(1.+dt*dt);d=smax(d,-s*BL,.010*BL);d=max(d,(s-1.02)*BL);
 float S=.135*BL;float yn=sat(y/S);
 float s0=.028*yn*yn+.008*exp(-pow(yn/.12,2.))+.0025*abs(sin(yn*PI*2.5));float s1=.112-.050*yn+.010*ss(.75,1.,yn);
 float dc=max(max((s0-s)*BL,(s-s1)*BL),y-S);d=smin(d,dc,.008*BL);
 vec2 q=vec2(s*BL,y);
 float pc=sdTri(q,vec2(.21*BL,.050*BL),vec2(.34*BL,.046*BL),vec2(.47*BL,.200*BL))-.005*BL;
 float pv=sdTri(q,vec2(.57*BL,.034*BL),vec2(.64*BL,.030*BL),vec2(.68*BL,.075*BL))-.002*BL;
 float fn=min(pc,pv);fin=ss(.004*BL,-.004*BL,fn-d);return smin(d,fn,.004*BL);}
void shark(vec2 w,int i,float T,vec2 hs,float m,vec3 bgc){vec4 F=hhI(i);
 float ang=.07*sin(T*.4+F.w*6.)+.28*ss(9.5,12.5,T)*(.6+.4*F.w);float sh=hhShake(i,T);
 vec2 head=CAM+hs*VH*m;float ph=TAU*.55*T+F.w*TAU;
 spine2(head,ang+sh,LHH,1.,.32,ph,-sh*2.2,sh*1.2);
 if(spineNear(w)>.20*LHH)return;
 vec3 f=bodyF(w);float fin;float d=hhD(f,fin);
 // the tail: the upper lobe of the caudal fin, seen edge-on from below, a thin blade beyond the tail stock
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.95);float dt=sdCap(w,tp,tp-td*.20*LHH,.006*LHH,.0015*LHH);d=smin(d,dt,.004*LHH);
 float a=covW(d);if(a<.002)return;
 float u=clamp(f.y/max(prof(f.x,WHH)*BL,1e-4),-1.,1.);vec3 n=tubeN(f.xy,u);
 if(f.x<.10)n=normalize(vec3(bodyNrm(f.x)*sign(f.y)*.4*ss(.6,1.,abs(f.y)/(.135*BL)),1.));
 n=normalize(mix(n,vec3(0.,0.,1.),fin*.85));
 float zz=max(-w.y,0.);vec3 E=lightAt(zz)*1.6;
 // the underside, white but in its own shadow, lit by the water below; the edges and the fins glowing with the light behind them
 vec3 alb=vec3(.46,.46,.45)*(.92+.10*fbm(f.xy*vec2(30.,300.)));
 vec3 c=alb*(waterCol(zz)*.85+E*.08*sat(.5-.5*n.y))+E*.28*pow(1.-n.z,2.5)+E*.05*fin;
 // the eyes at the ends of the hammer, the mouth, the gill slits
 vec2 e1=bodyPt(.040,.128*LHH),e2=bodyPt(.040,-.128*LHH);c=mix(c,vec3(.02),ss(.010*LHH,.005*LHH,min(length(w-e1),length(w-e2))));
 float mo=abs(length(vec2((f.x-.115)*BL*1.6,f.y))-.032*LHH);c*=1.-.45*ss(.004*LHH,.0015*LHH,mo)*ss(.10,.13,f.x)*ss(.0,.02*LHH,.040*LHH-abs(f.y));
 float gs=fract((f.x-.17)*BL/(.012*LHH));c*=1.-.35*ss(.18,.0,abs(gs-.5))*ss(.16,.17,f.x)*ss(.235,.225,f.x)*ss(.45,.65,abs(u))*ss(.95,.80,abs(u));
 c*=1.-.30*edgeK(d)*(1.-fin);
 // the farther, the paler: into the light of the water
 c=mix(c,bgc,1.-exp(-.38*max(m-.55,0.)));
 putF(c,a);}
void scene(vec2 w,float T){
 SUND=normalize(vec2(-.20,1.));SUNC=vec3(1.0,1.0,.94);WAT0=vec3(.020,.200,.300);
 KD=vec3(2.6,.55,.30);KH=vec3(2.2,.62,.38);VEIL=vec3(.012,.10,.17);
 // looking up: dark below, the light of the surface above, the rays spreading from the sun's place, the rippled window of the surface
 vec2 SPs=vec2(-.30,.78);vec2 dv=P-SPs;float r=length(dv);float an=atan(dv.x,-dv.y);
 vec3 c=mix(vec3(.004,.030,.075),vec3(.040,.220,.330),ss(-.55,.55,P.y));
 c+=vec3(.55,.75,.80)*.55*exp(-r*1.7);
 float ray=pow(vn(vec2(an*14.,T*.10))*.6+vn(vec2(an*37.+3.,T*.16))*.4,3.)*exp(-r*.9)*ss(.0,.25,r);c+=vec3(.50,.70,.75)*.36*ray;
 vec2 sq=vec2(P.x*1.0,(P.y-.75)*2.6)*5.5;float rp=voroE(sq+.3*vec2(vn(sq*.7+T*.2),vn(sq*.7+4.-T*.2)),T*.55);float fw=length(fwidth(sq));c+=vec3(.55,.75,.78)*.22*exp(-rp*3.5)*ss(.8,.2,fw)*ss(.30,.55,P.y)*(.4+.6*exp(-r*1.2));
 c+=vec3(.30,.45,.50)*.30*snow(P,T);
 // the seamount: a dark ridge of rock low on the left, its edge lit
 float rx=P.x;float re=-.60+.42*ss(.35,-.95,rx)+.035*fbm(vec2(rx*5.,1.3))-.02*sin(rx*9.);
 float rk=ss(.004,-.004,P.y-re);if(rk>0.){float tx=fbm(P*vec2(14.,22.));vec3 rc=vec3(.012,.026,.036)*(.7+.6*tx);rc+=vec3(.06,.16,.20)*.5*ss(-.03,.0,P.y-re);
  rc=mix(rc,c,.25+.25*ss(-.2,.5,rx));c=mix(c,rc,rk);}
 BG=c;
 // ---- the hammerheads, the farthest first ----
 float wpx0=WPX;
 for(int j=0;j<NH;j++){int i=j;vec4 F=hhI(i);float m=F.z;
  float rec=ss(10.,14.,T)*(.5+.5*F.w);m*=1.+.45*rec;
  float hx=-1.15+hhV(i)*(T-1.6-F.y);vec2 hs=vec2(hx,F.x+.010*sin(T*.6+F.w*7.)+.20*rec);
  float len=LHH/(VH*m);if(P.x>hs.x+.10*len||P.x<hs.x-1.30*len||abs(P.y-hs.y)>.45*len)continue;
  vec2 wk=CAM+P*VH*m;WPX=wpx0*m;shark(wk,i,T,hs,m,BG);}
 WPX=wpx0;
}
