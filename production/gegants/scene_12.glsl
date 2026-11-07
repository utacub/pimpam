// ---- Scene 13: the oarfish (the twilight zone, a few hundred metres down, dim blue) ----
// 2–6 s down out of the dimness above comes a long silver ribbon, head up: the oarfish, 5.5 m long, hanging upright in the water
// (live oarfish have been filmed by remotely operated vehicles, Benfield et al., 2013; the upright posture and the fin waves are
// not stated in that paper's abstract: still to be checked); the camera starts on its crest and slides down its length. 6–9.5 it hangs still while waves run down the long red fin from
// the head to the tail, the crest swaying, the long pelvic «oars» drifting; specks of living light wink around it. 9.5–14 it tilts
// over and glides away to the right, the whole ribbon following.
const float LOF=.55;
// half depth / length: a blunt head with a steep forehead under the crest, a deep ribbon, a long taper to the tail
float hOF(float s){return .004+.022*ss(.0,.035,s)+.006*ss(.035,.10,s)-.003*ss(.10,.55,s)-.025*ss(.50,1.,s);}
// a line of width wpx pixels at distance a (in units of g, whose screen rate is fw), faded out when its period gets under a few pixels
float aaLine(float a,float wd,float fw){return ss(wd+fw,max(wd-fw,0.),a)*ss(.45,.18,fw);}
vec2 oHead(float T){float d=ss(2.,6.4,T);vec2 h=vec2(.02,-1.00-.56*d)+vec2(.006*sin(T*.5),.008*sin(T*.37));
 float g=max(T-9.6,0.);h+=vec2(.30*g*g/(1.+.25*g),-.10*ss(9.6,11.5,T));return h;}
float oAng(float T){return mix(PI*.5,.10,ss(9.6,11.6,T))+.03*sin(T*.4);}
void scene(vec2 w,float T){
 SUND=normalize(vec2(.05,1.));SUNC=vec3(.85,.92,1.);WAT0=vec3(.006,.050,.120);
 KD=vec3(3.0,.80,.42);KH=vec3(2.6,.90,.55);VEIL=vec3(.004,.030,.075);
 float z=max(-w.y,0.);
 // the dim blue: a little lighter upward, the faint snow
 vec3 bg=waterCol(z)*(.55+.90*ss(-.7,.6,P.y))+vec3(.0,.006,.016);
 bg+=lightAt(z)*vec3(.40,.60,.85)*.10*shafts(w*vec2(.5,1.),T*.5)*ss(-.5,.7,P.y);
 bg+=lightAt(z*.8)*.20*snow(P,T);
 // living light: small specks that brighten and fade slowly (each once every few seconds)
 {vec2 bq=w*vec2(9.,9.)+vec2(0.,T*.05);vec2 bi=floor(bq);float hh=h21(bi+11.);float ph=fract(T*.22+hh*7.);
  float on=step(.86,hh)*pow(sat(sin(PI*ph/.25)),2.)*step(ph,.25);float dd=length(fract(bq)-.5-.35*(h22(bi)-.5));
  bg+=vec3(.25,.75,.95)*on*(ss(.06,.0,dd)*.9+ss(.25,.0,dd)*.12);}
 BG=bg;
 // ---- the oarfish ----
 vec2 hd=oHead(T);float ang=oAng(T);float turn=ss(9.6,11.6,T);
 float ph=TAU*.30*T;spine2(hd,ang,LOF,1.,.05+.20*turn*(1.-turn)*4.*.25,ph,-.25*sin(PI*turn),.10*sin(T*.3));
 if(spineNear(w)>.42*LOF)return;
 vec3 f=bodyF(w);float s=f.x;
 float hb=hOF(s)*BL;float d=abs(f.y)-hb;d=smax(d,-s*BL,.010*BL);d=max(d,(s-1.03)*BL);
 float zz=max(-w.y,0.);vec3 E=lightAt(zz)*.9;vec3 amb=waterCol(zz)*.9+vec3(.004,.010,.020);
 vec3 EC=vec3(.78,.82,.88);   // a soft light from the camera's side, so the silver and the red show
 float fogD=.04+.10*VH;
 // the waves that run down the long dorsal fin, head to tail (the fin's undulation drives it; the body stays nearly straight)
 float psi=s*TAU*13.-T*4.2;
 // ---- the dorsal fin: one long membrane from behind the crest to the tail, coral red and translucent, stiffened by fine rays that lean
 // back and swing as the waves pass; where the membrane turns towards us it is brighter, where it turns away darker and narrower ----
 float fy=f.y-hb;
 float fh=BL*(.040-.014*ss(.30,1.,s))*ss(.045,.075,s)*(1.-.16*(.5+.5*cos(psi)));
 float dF=max(max(-fy-.002*BL,fy-fh),max(-(s-.05)*BL,(s-1.0)*BL));
 if(dF<4.*WPX){float yn=sat(fy/max(fh,1e-4));
  float sl=.55+.30*sin(psi);float gx=(s*BL-fy*sl)/(.0062*BL);float fw=fwidth(gx);
  float ray=aaLine(abs(fract(gx)-.5),.10,fw);
  float face=.5+.5*sin(psi+.9);
  vec3 mem=vec3(.60,.075,.045)*(.58+.42*face)*(.90+.10*yn);
  vec3 fc=mix(mem,vec3(.34,.030,.020),ray*.65)*(EC*.85+E*.30+amb);
  fc+=EC*vec3(.9,.35,.25)*.07*pow(face,6.)*(1.-yn*.5);
  float aF=covW(dF)*mix(.86,.62,yn)*(1.-.25*(1.-face)*yn);
  putF(fogW(fc,fogD,zz),aF);}
 // ---- the body: a deep, laterally flattened ribbon; bright silver, the upper flank tinged blue-grey, wavy oblique dark streaks and
 // rows of dark spots; the ribbon twists a little with the waves, so bands of sheen travel down it ----
 float aB=covW(d);
 if(aB>.002){float u=clamp(f.y/max(hb,1e-4),-1.,1.);vec2 nd=bodyNrm(s);
  float tw=.30*sin(s*TAU*2.2-T*1.5+.8*sin(T*.31));
  vec3 n=normalize(vec3(nd*(u*u*u*.85+tw),1.));
  vec3 alb=mix(vec3(.46,.49,.55),vec3(.40,.43,.50),ss(-.2,-.9,u));
  alb=mix(alb,vec3(.20,.26,.37),ss(.25,.95,u)*.85);
  // the streaks: oblique, wavy, on the upper two thirds
  float g=s*BL/(.016*BL)+u*.90+.35*sin(s*BL*55.+u*2.);float fwg=fwidth(g);
  float stk=aaLine(abs(fract(g)-.5),.07,fwg)*ss(-.55,.15,u)*ss(.06,.10,s)*(.55+.45*vn(vec2(s*BL*40.,u*2.)));
  alb=mix(alb,vec3(.13,.17,.25),stk*.75);
  // the spots: scattered dark spots between the streaks
  vec2 sq=vec2(s*BL/(.022*BL),u*2.6+.5);vec2 si=floor(sq);float sh=h21(si+3.);vec2 so=fract(sq)-.5-.28*(h22(si)-.5);
  float sr=.15+.10*h21(si+9.);float spd=length(so*vec2(1.,1.4));float fws=fwidth(sq.x);
  float spot=ss(sr+fws,sr-fws,spd)*step(.50,sh)*ss(.45,.18,fws)*ss(-.75,-.2,u)*ss(.08,.12,s);
  alb=mix(alb,vec3(.09,.11,.16),spot*.80);
  // the lateral line, low on the flank, curving up over the gill cover
  float ll=abs(u-(-.12+.30*ss(.12,.035,s)))*hb;alb*=1.-.22*aaLine(ll/WPX,.7,1.)*ss(.04,.06,s);
  // the head: pinkish silver, the gill cover edged darker, the big eye, the small oblique mouth
  float hz=ss(.050,.030,s);alb=mix(alb,vec3(.64,.55,.58),hz*.45);
  float op=abs((s-.042)*BL+.010*BL*u*u);alb*=1.-.35*ss(.0016*BL+WPX,.0004*BL,op)*ss(.95,.4,abs(u))*hz;
  vec3 c=alb*(EC*(.20+.45*n.z)+E*.30*sat(dot(n.xy,SUND)*.5+.5)+amb);
  float sb=ss(.09,.0,abs(tw+u*u*u*.85*.5));                                // where the twisting flank faces us: a band of sheen
  c+=EC*(.50*sb+.08)*(1.-stk*.6)*(1.-spot*.6);
  c=mix(c,waterCol(zz)*1.6+vec3(.01,.03,.06),.35*sat(1.-n.z*1.05)*(1.-hz));   // the silver mirrors the blue where it turns away                 // the sheen bands
  c+=E*vec3(.55,.75,1.)*.20*pow(sat(dot(n.xy,SUND)*.7+.4),3.);          // the light from above along the upper edge
  c+=rimL(n,E,.18);
  c=eyeC(c,w,bodyPt(.021,.004*BL),.0080*BL,EC*1.2,vec3(.62,.64,.68));
  float ml=sdSeg(w,bodyPt(.000,-.004*BL),bodyPt(.013,-.011*BL));c*=1.-.50*ss(.0016*BL,.0005*BL,ml);
  c*=1.-.32*edgeK(d);
  putF(fogW(c,fogD,zz),aB);}
 // ---- the crest: the first rays of the dorsal fin, long and red, rising from the head and arching back, joined near their base by
 // membrane, each with small red flaps along it; they sway slowly ----
 {float dC=1e5,dW=1e5;vec2 pb=vec2(0.),pc=vec2(0.);
  for(int i=0;i<7;i++){float fi=float(i);float sa=.018+.0065*fi;vec2 b0=bodyPt(sa,hOF(sa)*BL);vec2 dr=bodyDir(sa),nr=bodyNrm(sa);
   float ln=(.20-.017*fi)*BL;float sw=.20*sin(T*1.1+fi*.55)+.06*sin(T*2.3+fi);float fn=fi/6.;
   vec2 m1=b0+dr*ln*(.44-.20*fn+.08*sw)+nr*ln*(.22+.20*fn);vec2 t1=b0+dr*ln*(.70-.38*fn+.18*sw)+nr*ln*(.60+.30*fn-.06*sw);
   float dr1=1e5;
   for(int k=0;k<4;k++){float a0=float(k)/4.,a1=float(k+1)/4.;vec2 pa=bez(b0,m1,t1,a0),pq=bez(b0,m1,t1,a1);
    float r0=mix(.0060,.0018,a0)*BL,r1=mix(.0060,.0018,a1)*BL;dr1=min(dr1,sdCap(w,pa,pq,r0,r1));}
   // the small flaps along each ray
   for(int k=0;k<3;k++){float a=.40+.20*float(k);vec2 pf=bez(b0,m1,t1,a);vec2 tg=normalize(bez(b0,m1,t1,a+.02)-pf);
    dr1=min(dr1,sdEll(rot(atan(tg.y,tg.x))*(w-pf-vec2(-tg.y,tg.x)*.005*BL),vec2(.012,.0055)*BL));}
   dC=min(dC,dr1);
   // the membrane between neighbouring rays, near their base
   if(i>0)dW=min(dW,sdTri(w,pb,pc,bez(b0,m1,t1,.30)));
   if(i>0)dW=min(dW,sdTri(w,pb,b0,bez(b0,m1,t1,.30)));
   pb=b0;pc=bez(b0,m1,t1,.30);}
  float aW=covW(dW)*.55,aC=covW(dC);
  if(aW>.002)putF(fogW(vec3(.56,.07,.04)*(EC*.75+E*.30+amb),fogD,zz),aW);
  if(aC>.002)putF(fogW(vec3(.58,.05,.03)*(EC*.95+E*.35+amb)+EC*vec3(.04,.012,.008),fogD,zz),aC);}
 // ---- the pelvic fins: two long rays from under the head, hanging and drifting, each ending in a red paddle (the «oar») ----
 {float dP=1e5;
  for(int i=0;i<2;i++){float fi=float(i);vec2 b0=bodyPt(.060+.006*fi,-hOF(.06)*BL);vec2 dr=bodyDir(.06),nr=bodyNrm(.06);
   float sw=.16*sin(T*.7+fi*1.7)+.05*sin(T*1.9+fi);vec2 m1=b0-dr*BL*(.11+.02*fi)-nr*BL*(.030+.020*fi+.03*sw);vec2 t1=b0-dr*BL*(.22+.03*fi)-nr*BL*(.040+.030*fi+.06*sw);
   for(int k=0;k<4;k++){float a0=float(k)/4.,a1=float(k+1)/4.;dP=min(dP,sdCap(w,bez(b0,m1,t1,a0),bez(b0,m1,t1,a1),mix(.0030,.0018,a0)*BL,mix(.0030,.0018,a1)*BL));}
   vec2 tg=normalize(t1-bez(b0,m1,t1,.92));dP=min(dP,sdEll(rot(atan(tg.y,tg.x))*(w-t1-tg*.012*BL),vec2(.024,.0080)*BL));}
  float aP=covW(dP);if(aP>.002)putF(fogW(vec3(.66,.07,.04)*(EC*.90+E*.30+amb),fogD,zz),aP*.95);}
}
