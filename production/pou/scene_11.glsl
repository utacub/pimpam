// ---- Scene 12 (El pou del temps, CE37): Pteranodon longiceps and an elasmosaurid plesiosaur (Styxosaurus) at the edge of the Western Interior
// Seaway (Niobrara Chalk, Kansas; about 87–82 million years ago), at sunset, the sun low behind them. Story: the pteranodon stands on all
// four limbs on the wet-edged beach, its long shadow running towards us; 3.8–4.6 s it crouches; 4.6–5.2 s it vaults into the air off its
// arms (the key: a quadrupedal launch) and opens its wings; three slow flaps (5.0, 6.0, 6.9 s) carry it up and away towards the sun; then
// it glides, wings glowing orange against the light, banks and turns along the sunset. 8.6–10.2 s the long neck of a plesiosaur rises out
// of the sea (rings, drips) and 10.2–11.6 s it sinks back (the echo). The pteranodon .15 screen units per metre on the beach (wingspan
// about 6.6 m), smaller as it flies away; the plesiosaur .045 per metre further out. ----
const float PH=.030;               // the horizon of the sea
const vec2 PSUN=vec2(.20,.085);    // the sun, low over the sea
const float PGY=-.40,PGX=-.42;      // the sand under the pteranodon's feet, and where it stands
const float PF=1.37;               // the camera's focal length (screen heights): how obliquely we see the animal follows where it is
// ---- The pteranodon's pose at the clock t ----
vec2 ptP;float ptTime,ptS,ptPhi,ptPitch,ptRoll,ptTh,ptUpF,ptHA,ptBr,ptOn,ptFly,ptCr,PCX,PCY,ptCP,ptSP;vec3 ptJ[11];vec2 ptHj;mat2 ptRP,ptTR;float ptFC[2],ptFS[2];
vec2 ptJN[11],ptJF[11];bool ptJDone=false;
// the joints of one side (body frame, metres: x forward, y up, z out to that side): standing on four limbs, crouched for the launch,
// wings spread in flight. 0 shoulder, 1 elbow, 2 wrist, 3 knuckle of the wing finger, 4 wing tip, 5 hip, 6 knee, 7 ankle, 8 toes.
// Standing, the hand is on the ground and the long wing finger is folded back up along the flank, its tip behind the hips.
const vec3 PJ_ST[9]=vec3[](vec3(.02,-.06,.16),vec3(-.08,-.31,.30),vec3(.13,-.63,.34),vec3(.22,-1.08,.36),vec3(-.24,.48,.34),vec3(-.36,-.30,.10),vec3(-.22,-.60,.16),vec3(-.38,-1.01,.16),vec3(-.17,-1.10,.15));
const vec3 PJ_CR[9]=vec3[](vec3(.02,-.05,.18),vec3(-.18,-.22,.32),vec3(.08,-.45,.36),vec3(.20,-.84,.37),vec3(-.44,.62,.34),vec3(-.34,-.24,.10),vec3(-.15,-.46,.16),vec3(-.34,-.78,.16),vec3(-.14,-.86,.15));
const vec3 PJ_FL[9]=vec3[](vec3(0.,0.,.15),vec3(.08,.04,.50),vec3(.20,.04,1.00),vec3(.30,.02,1.62),vec3(-.45,-.06,3.30),vec3(-.55,-.06,.10),vec3(-.80,-.14,.14),vec3(-1.06,-.12,.18),vec3(-1.22,-.14,.18));
// A smooth tube along a quadratic Bézier (exact distance), radius ra at A .. rb at C; tt its parameter at the nearest point.
float ptTube(vec2 pos,vec2 A,vec2 B,vec2 C,float ra,float rb,out float tt){B+=vec2(1e-4,-1e-4);
 // (an almost straight curve is measured as a segment: the exact formula divides by its bend, which is then close to zero)
 {vec2 bb=A-2.*B+C,ac=C-A;if(dot(bb,bb)<1e-6*dot(ac,ac)+1e-12){tt=sat(dot(pos-A,ac)/max(dot(ac,ac),1e-12));return length(pos-A-ac*tt)-mix(ra,rb,tt);}}
 vec2 a=B-A,b=A-2.*B+C,c=a*2.,d=A-pos;float kk=1./dot(b,b),kx=kk*dot(a,b),ky=kk*(2.*dot(a,a)+dot(d,b))/3.,kz=kk*dot(d,a);
 float p=ky-kx*kx,p3=p*p*p,q=kx*(2.*kx*kx-3.*ky)+kz,h=q*q+4.*p3,res;
 if(h>=0.){h=sqrt(h);vec2 x=(vec2(h,-h)-q)/2.;vec2 uv=sign(x)*pow(abs(x),vec2(1./3.));tt=sat(uv.x+uv.y-kx);vec2 e=d+(c+b*tt)*tt;res=dot(e,e);}
 else{float z=sqrt(-p),v=acos(clamp(q/min(p*z*2.,-1e-12),-1.,1.))/3.,m=cos(v),n=sin(v)*1.732050808;vec3 t3=clamp(vec3(m+m,-n-m,n-m)*z-kx,0.,1.);
  vec2 e1=d+(c+b*t3.x)*t3.x,e2=d+(c+b*t3.y)*t3.y;float r1=dot(e1,e1),r2=dot(e2,e2);if(r1<r2){res=r1;tt=t3.x;}else{res=r2;tt=t3.y;}}
 return sqrt(res)-mix(ra,rb,tt);}
vec2 plBez(vec2 a,vec2 b,vec2 c,float u){return mix(mix(a,b,u),mix(b,c,u),u);}
vec2 ptBez3(vec2 a,vec2 b,vec2 c,vec2 d,float u){vec2 ab=mix(a,b,u),bc=mix(b,c,u),cd=mix(c,d,u);return mix(mix(ab,bc,u),mix(bc,cd,u),u);}
float ptTri(vec2 p,vec2 p0,vec2 p1,vec2 p2){vec2 e0=p1-p0,e1=p2-p1,e2=p0-p2,v0=p-p0,v1=p-p1,v2=p-p2;
 vec2 a=v0-e0*sat(dot(v0,e0)/max(dot(e0,e0),1e-12)),b=v1-e1*sat(dot(v1,e1)/max(dot(e1,e1),1e-12)),c=v2-e2*sat(dot(v2,e2)/max(dot(e2,e2),1e-12));float s=e0.x*e2.y-e0.y*e2.x<0.?-1.:1.;   // (never 0: a flat triangle would read as inside everywhere)
 vec2 d=min(min(vec2(dot(a,a),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(b,b),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(c,c),s*(v2.x*e2.y-v2.y*e2.x)));return -sqrt(d.x)*sign(d.y);}
void ptPose(float t){ptTime=t;
 float cr=ss(3.8,4.36,t)*(1.-ss(4.46,4.68,t)),fly=ss(4.56,4.98,t);ptCr=cr;ptFly=fly;ptOn=1.-ss(4.60,4.82,t);
 ptBr=sin(t*1.7);
 for(int i=0;i<9;i++){vec3 g=mix(PJ_ST[i],PJ_CR[i],cr);ptJ[i]=mix(g,PJ_FL[i],fly);}
 // standing: breathing; at 2.1–3.1 s it settles its folded wing (a small shrug of the near arm)
 float sh=ss(2.1,2.5,t)*ss(3.1,2.7,t);ptJ[4]+=vec3(.05,.10,.08)*sh+vec3(0.,.025,0.)*ptBr*(1.-fly);ptJ[1].z+=.05*sh;
 // the vault: the arms straighten under the body while the hands are still on the ground
 float lift=.30*ss(4.42,4.72,t);for(int i=1;i<4;i++)ptJ[i].y-=lift*(1.-fly)*(i==1?.5:1.);
 ptJ[9]=mix(ptJ[0],ptJ[2],.5)+vec3(.13,.02,0.)*fly+vec3(0.,-.06,0.)*(1.-fly); // the front edge of the small membrane before the arm
 // the head: standing it looks about and out to sea; down as it crouches; forward in flight
 vec2 hs=vec2(.34,.62)+vec2(.025,.02)*sin(t*.45)+vec2(0.,.01)*ptBr,hc=vec2(.48,.38),hf=vec2(.62,.14);
 ptHj=mix(mix(hs,hc,cr),hf,fly);float look=.06*sin(t*.6)-.07*ss(1.0,1.5,t)*ss(3.0,2.5,t);ptHA=mix(mix(-.03+look,-.26,cr),-.05,fly);
 // where it is: on the beach; the vault and a rising path out over the sea, turning away towards the sun; then it glides on, banks to the
 // left in front of the sun and comes back along the sunset
 float s0=.205;ptS=s0;ptPhi=0.;ptPitch=.42*ss(4.44,4.74,t)*(1.-ss(4.95,5.8,t));ptRoll=0.;float away=(s0-.085)*exp(-.85*max(t-4.85,0.)); // it flies away from us
 vec2 P0=vec2(PGX,PGY+1.40*s0);
 if(t<4.80){ptP=vec2(PGX,PGY+(mix(1.10,.86,cr)+lift)*s0+.002*ptBr);}
 else if(t<9.){float u=(t-4.80)/4.2;u=u*(1.5-.5*u);ptP=ptBez3(P0,vec2(-.31,-.02),vec2(-.08,.17),vec2(.18,.20),u);ptS=.085+away;
  ptPhi=-.45*ss(5.0,6.8,t);}
 else{float u=min((t-9.)/4.,1.);vec2 Q0=vec2(.18,.20),Q2=vec2(.47,.17),Q3=vec2(.26,.23);ptP=ptBez3(Q0,Q0+vec2(.143,.004),Q2,Q3,u)+(Q3-Q2)*.75*max(t-13.,0.);
  ptS=.085+away-.035*ss(9.,12.5,t);ptPhi=-.45-1.15*ss(9.4,11.2,t)-1.09*ss(11.0,13.3,t);ptRoll=.30*ss(10.0,11.0,t)*(1.-ss(12.6,13.6,t));
  ptPitch=.02*sin(t*.5);}
 // the flaps: the wings open raised; three slow strokes (the downstrokes at about 5.0, 6.0 and 6.9 s), then the glide
 float fe=ss(4.56,4.80,t)*(1.-ss(7.3,8.0,t));float ph=(t-4.80)/.95;
 ptTh=mix(.07+.04*sin(t*.9)-.05*ptRoll,.25+.52*cos(TAU*ph),fe);ptTh=mix(.0,ptTh,fly);
 ptUpF=fe*sat(-sin(TAU*ph))*.35; // the outer wing folds a little on the upstroke
 float bend=fe*.34*sin(TAU*ph-1.0);ptJ[4].y+=bend*fly; // the wing finger flexes: its tip lags behind the stroke
 ptJ[10]=mix(ptJ[3],ptJ[4],.5)+vec3(-.03,.03,0.)*(1.-fly)+vec3(0.,-.28*bend+.03,0.)*fly; // the middle of the wing finger: bent
 // in flight we see it a little more from below than the true view would give (its wings read better against the light)
 PCX=clamp(ptP.x/PF,-.5,.5);PCY=(ptP.y-PH)/PF+.26*ss(5.2,7.5,t);
 ptCP=cos(ptPhi);ptSP=sin(ptPhi);ptRP=rot(-ptPitch);ptJDone=false;
 {vec2 H=ptJ[5].xy;ptTR=rot(atan(H.y+.03,H.x+.06));}
 for(int k=0;k<2;k++){float th=ptTh+(k==0?1.:-1.)*ptRoll;ptFC[k]=cos(th);ptFS[k]=sin(th);}
}
// a point of one side (side 1 or -1), with the flap, the bank, the pitch and the turn, in the world (z towards us): then on the screen
vec3 ptW(vec3 b,float side,int k){
 b.z*=side;
 if(k<=4||k>=9){float z=abs(b.z),y=b.y,c,s;int si=side>0.?0:1;if(z>1.){float th=(ptTh+side*ptRoll)*(1.+.25*sat((z-1.)/2.));c=cos(th);s=sin(th);}else{c=ptFC[si];s=ptFS[si];}
  b.y=y*c+z*s;b.z=sign(b.z)*(z*c-y*s);}
 b.xy=ptRP*b.xy;
 return vec3(b.x*ptCP-b.z*ptSP,b.y,b.x*ptSP+b.z*ptCP);}
vec2 ptScr(vec3 w){return ptP+ptS*vec2(w.x+PCX*w.z,w.y+PCY*w.z);}
void ptJoints(float side,bool far,out vec2 J[11]){for(int i=0;i<11;i++){vec3 b=ptJ[i];if(i==4||i==10){b=mix(b,ptJ[3]+(b-ptJ[3])*.72,ptUpF);if(far)b.z=mix(b.z,-b.z*.85,ptOn);}J[i]=ptScr(ptW(b,side,i));}}
// both sides once for this pixel (the near side first)
void ptJointsAll(){if(ptJDone)return;float n=ptCP>=0.?1.:-1.;ptJoints(n,false,ptJN);ptJoints(-n,true,ptJF);ptJDone=true;}
// The body plane (z = 0) seen from the screen: its point (metres), and how much it is foreshortened (1 side on .. 0 end on).
vec2 ptPlane(vec2 q,out float fore){vec2 o=(q-ptP)/ptS;float cp=cos(ptPhi),sp=sin(ptPhi);float den=cp+PCX*sp;fore=abs(den);
 float x=o.x/(sign(den+1e-6)*max(abs(den),.03));float y=o.y-PCY*x*sp;return rot(ptPitch)*vec2(x,y);}
vec2 ptPlaneScr(vec2 b){vec2 c=rot(-ptPitch)*b;return ptScr(vec3(c.x*cos(ptPhi),c.y,c.x*sin(ptPhi)));}
// A polygon of 8 points (its signed distance).
float ptPoly(vec2 p,vec2 v[8]){float d=dot(p-v[0],p-v[0]);float s=1.;
 for(int i=0;i<8;i++){int j=i==0?7:i-1;vec2 e=v[j]-v[i],w=p-v[i];vec2 b=w-e*sat(dot(w,e)/max(dot(e,e),1e-12));d=min(d,dot(b,b));
  bvec3 c=bvec3(p.y>=v[i].y,p.y<v[j].y,e.x*w.y>e.y*w.x);if(all(c)||all(not(c)))s=-s;}
 return s*sqrt(d);}
// The head (head frame: x along the beak, y up, metres; origin where the neck joins): a long straight toothless beak, the lower jaw a
// little upturned, the long crest swept back (a male P. longiceps).
float ptHeadD(vec2 h,out float beak,out float crest){
 float sk=sdEll(h-vec2(.04,.0),vec2(.18,.11));
 beak=smin(sdCap(h,vec2(.10,.035),vec2(1.10,-.025),.085,.006),sdCap(h,vec2(.08,-.045),vec2(1.02,-.040),.060,.006),.03);
 float tc;crest=ptTube(h,vec2(-.02,.06),vec2(-.36,.17),vec2(-.80,.25),.09,.010,tc);
 return smin(smin(sk,beak,.06),crest,.05);}
// The torso, neck and head in the body plane (metres): tn the neck's parameter.
float ptTorso(vec2 b){vec2 H=ptJ[5].xy;float d=smin(sdEll(mat2(.9394,.3429,-.3429,.9394)*(b-vec2(-.12,-.09)),vec2(.31,.225)),sdEll(ptTR*(b-mix(vec2(-.08,-.05),H,.62)),vec2(.22,.13)),.10);
 d=smin(d,sdEll(b-vec2(.03,-.19),vec2(.16,.17)),.08);
 return smin(d,sdCap(b,H,H+vec2(-.14,-.03),.035,.012),.03);}
// The bones of the body plane (for the fossil and while the flesh grows).
float ptBonesPlane(vec2 b){float d=1e5,tt;
 vec2 hf=vec2(cos(ptHA),sin(ptHA)),hu=vec2(-hf.y,hf.x);vec2 h=vec2(dot(b-ptHj,hf),dot(b-ptHj,hu));
 if(length(b-ptHj)<1.3){float be,cr;float sk=ptHeadD(h,be,cr);sk=max(sk,-sdEll(h-vec2(.04,.03),vec2(.045,.04)));sk=max(sk,-sdEll(h-vec2(.30,.0),vec2(.16,.035)));d=min(d,sk);}
 d=min(d,sdTube(b,vec2(.06,.05),mix(vec2(.06,.05),ptHj,.5)+vec2(-.06,.04),ptHj,.035,.03,tt));
 vec2 H=ptJ[5].xy;d=min(d,sdCap(b,vec2(.02,.04),H,.045,.04));
 for(int i=0;i<5;i++){vec2 a=mix(vec2(-.04,.03),H,.12+.17*float(i));vec2 n=normalize(vec2(-(H.y-.03),H.x+.04));d=min(d,sdSeg(b,a,a-n*.14+vec2(.0,-.02))-.012);}
 d=min(d,sdEll(rot(atan(H.y,H.x+1e-6))*(b-H),vec2(.13,.04)));
 return d;}
// limb bones of one side (screen): arm, wing finger, leg
float ptLimbBones(vec2 q,vec2 J[11]){float r=ptS;float d=sdCap(q,J[0],J[1],.045*r,.035*r);d=min(d,sdCap(q,J[1],J[2],.03*r,.026*r));d=min(d,sdCap(q,J[2],J[3],.025*r,.022*r));
 d=min(d,sdCap(q,J[3],J[4],.022*r,.008*r));d=min(d,sdCap(q,J[5],J[6],.028*r,.022*r));d=min(d,sdCap(q,J[6],J[7],.02*r,.016*r));d=min(d,sdCap(q,J[7],J[8],.014*r,.008*r));return d;}

// ---- Drawing the pteranodon: against the low sun it is a warm dark shape whose edges glow (the fuzz of pycnofibres catches the light),
// its wings lit through, orange, with fine fibres (actinofibrils) in them. ----
// The glowing fringe of a furred piece: d its distance, on the side towards the sun most.
void ptFringe(vec2 q,float d,float w,float k){if(d>PX||d<-w-PX)return;vec2 g=vec2(dFdx(d),dFdy(d));vec2 n=g/max(length(g),1e-9);
 float sd=sat(dot(n,normalize(PSUN-q+vec2(0.,.15)))*.8+.35);float f=ss(-w,-w*.25,d)*ss(PX*.8,-PX*.4,d);
 f*=.75+.5*vn(q*vec2(320.,260.));glow(vec3(1.,.62,.30)*f*sd*k*BACK,0.);}
// the light of the sun through a membrane: brighter towards the sun and where the membrane is thin
vec3 ptThrough(vec2 q,float thin){return vec3(1.,.47,.17)*(.30+.62*exp(-length((q-PSUN)*vec2(1.,1.3))/.42))*(.45+.55*thin)*BACK;}
float fq_dummy;
// A limb segment shaded from its own axis: its distance; g the direction out from the axis (for the light); up how far across it towards
// its upper side (-1 .. 1).
float ptLimb(vec2 q,vec2 a,vec2 b,float ra,float rb,out vec2 g,out float up){vec2 ba=b-a;float u=sat(dot(q-a,ba)/dot(ba,ba));vec2 c=a+ba*u;float r=mix(ra,rb,u);
 g=q-c;vec2 n=vec2(-ba.y,ba.x)/max(length(ba),1e-6);if(n.y<0.)n=-n;up=dot(g,n)/r;return length(g)-r;}
// the tone of a limb: lighter on its upper side (the sky), warmer underneath (light from the sand) while it stands
vec3 ptTone(vec3 c,float up){return c*mix(.66,1.0,ss(-.9,.8,up))*mix(vec3(1.),vec3(.94,.92,1.04),ptOn)+vec3(.07,.04,.02)*ss(-.1,-.9,up)*ptOn;}
void ptWing(vec2 q,vec2 J[11],float shade,float grow,float near,float dB){
 vec2 S=J[0],E=J[1],W=J[2],M=J[3],T=J[4],H=J[5],K=J[6],A=J[7],Pr=J[9],Fm=J[10];float r=ptS;
 vec2 lo=min(min(min(S,E),min(W,M)),min(min(T,A),K)),hi=max(max(max(S,E),max(W,M)),max(max(T,A),K));
 if(q.x<lo.x-.03||q.x>hi.x+.03||q.y<lo.y-.03||q.y>hi.y+.03)return;
 float G=grow;
 // (the bones show only while they are computed, grow<.14: with grow from .14 to .5, while the window opens or closes, dB was -1 and the
 // whole wing box was painted as bone, a big pale square)
 if(G<.14&&near>.5)PIECE(dB,vec3(.88,.84,.75),K_BONE,q*3.,vec2(1,0),.004,.8,0.);
 vec2 fd=normalize(T-W+1e-5);
 // the membrane. Open: from the arm and the wing finger back to the ankle, the trailing edge drawn in (a curve), a small membrane in
 // front of the arm; lit through, with fine fibres (actinofibrils) running out along it. Folded: it hangs in narrow pleats along the
 // folded finger and down to the ankle.
 // The folded bundle turns into the open wing over the vault (the two shapes morphed, kO: how far it has opened); a sudden switch from
 // one to the other showed for a moment as a big dark slab.
 float dmem=1e5,tr=0.,le=1.;vec3 mcol;vec2 mdir=fd;
 float kO=ss(.02,.30,ptFly),dO=1e5,dF=1e5,trO=0.,trF=0.;vec3 cO=vec3(0.),cF=vec3(0.);vec2 dirF=fd;
 if(kO>0.){vec2 v[8]=vec2[](S,W,M,Fm,T,A,K,H);dmem=min(ptPoly(q,v),ptTri(q,S,Pr,W));
  vec2 mid=(T+A)*.5,ta=A-T;float L=length(ta);vec2 nn=normalize(vec2(ta.y,-ta.x)+1e-6);if(dot(nn,mid-(S+W+M)/3.)<0.)nn=-nn;
  float sg=mix(.10,.21,ss(.02,.95,ptFly))*L,Rb=(L*L*.25+sg*sg)/max(2.*sg,1e-6);dmem=max(dmem,Rb-length(q-(mid+nn*(Rb-sg))));
  le=min(min(sdSeg(q,S,W),sdSeg(q,W,M)),min(sdSeg(q,M,Fm),sdSeg(q,Fm,T)));vec2 fp=vec2(-fd.y,fd.x);float fq=dot(q-W,fp)/(r*.035);
  float fib=mix(.5,.5+.5*sin(fq*TAU+3.*vn(q*30./r)),lodk(1.)*ss(.5,.2,PX/(r*.035)));
  float ch=ss(.0,.85*r,le),sp=ss(.25*r,1.1*r,length(q-S));
  mcol=mix(vec3(.24,.14,.10),vec3(.32,.18,.12),ch);tr=(.30+.70*ch*ch*(3.-2.*ch))*(.55+.45*sp)*(.86+.14*fib)*(.70+.30*ss(.0,.2*r,-dmem));
  tr*=1.-.22*ss(.25,.0,abs(ch-.55))*sp; // a soft fold where the membrane billows
  dO=dmem;cO=mcol;trO=tr;}
 // (folded, only near the arm; while it opens, everywhere in the wing's box, so the morph has a true distance to work from)
 if(kO<1.&&(kO>0.||sdSeg(q,mix(M,T,.4),mix(H,A,.5))<.55*length(T-M))){vec2 sd=T-M;float L=length(sd);vec2 sn=sd/max(L,1e-6);vec2 nb=vec2(sn.y,-sn.x);if(dot(nb,H-M)<0.)nb=-nb;
  // the bundle: the folded membrane gathered behind the wing finger, along the forearm
  vec2 s3=M+sd*.80,b3=M+sd*.72+nb*.04*r,b2=M+sd*.56+nb*.16*r,b1=M+sd*.36+nb*.21*r,b0=M+sd*.16+nb*.15*r,b00=M+sd*.04+nb*.05*r;
  vec2 v[8]=vec2[](M,M+sd*.45,s3,b3,b2,b1,b0,b00);float db=ptPoly(q,v);
  // the slack fold back to the leg, its free edge drawn in
  float dc=min(ptTri(q,b0,b1,K),ptTri(q,b0,K,A));
  vec2 ea=A-b0;float La=length(ea);vec2 en=normalize(vec2(-ea.y,ea.x)+1e-6);if(dot(en,K-b0)>0.)en=-en;float sa=.20*La,Ra=(La*La*.25+sa*sa)/max(2.*sa,1e-6);
  dc=max(dc,Ra-length(q-((b0+A)*.5-en*(Ra-sa))));
  dmem=smin(db,dc,.02*r);float al=dot(q-M,sn);
  float pleat=.5+.5*sin(al/r*26.+2.*vn(q*20./r));float inb=ss(.0,-.03*r,db);
  dF=dmem;cF=vec3(.25,.15,.11)*(.84+.20*pleat*inb);trF=mix(.55,.20,inb)*(.75+.25*pleat);dirF=sn;}
 dmem=kO<=0.?dF:kO>=1.?dO:mix(dF,dO,kO);mcol=mix(cF,cO,kO);tr=mix(trF,trO,kO);mdir=normalize(mix(dirF,fd,kO)+1e-5);
 if(G<.14)dmem=max(dmem,dB-G*.4);
 if(dmem<PX*4.){PIECE(dmem,mcol*shade,K_MEMBRANE,(q-ptP)/ptS*.5,mdir,.006*r,.5,0.);
  glow(ptThrough(q,1.)*tr*shade*cov(dmem),0.);
  // the arm and the body seen as a shadow through the open wing, near its leading edge
  shadow(ss(.10*r,.0,le)*.35*kO*cov(dmem),vec3(.55,.40,.40),0.);}
 // the arm (furred upper arm and forearm), and in one piece of bare skin the hand, its three small clawed fingers and the wing finger
 vec2 g1,g2,g3,g4;float u1,u2,u3,u4;
 float d1=ptLimb(q,S,E,.115*r,.075*r,g1,u1),d2=ptLimb(q,E,W,.082*r,.052*r,g2,u2),dh=ptLimb(q,W,M,.044*r,.032*r,g3,u3);float tf=0.;vec2 fb=2.*Fm-(M+T)*.5;float df=sdSeg(q,M,T)<.12*r?ptTube(q,M,fb,T,.034*r,.009*r,tf):1.;
 g4=q-plBez(M,fb,T,tf);u4=-dot(g4,normalize(vec2(-(T-M).y,(T-M).x)+1e-6)*sign((T-M).x+1e-6))/(.02*r);
 vec2 sc=mix(S,E,.30);float dsh=1e5;float da=smin(d1,d2,.02*r);
 vec2 ga=d1<d2?g1:g2;float ua=d1<d2?u1:u2;if(dsh<min(d1,d2)){ga=q-sc;ua=ga.y/(.13*r);}
 float dcl=1e5;if(G>.3&&length(q-M)<.25*r){for(int i=0;i<3;i++){float fi=float(i);vec2 b=mix(M,W,.12+.06*fi*ptFly);vec2 e=b+r*mix(vec2(.10+.02*fi,-.012+.004*fi),vec2(.05,-.03),ptFly);dcl=min(dcl,sdCap(q,b,e,.011*r,.003*r));}}
 if(G<.14){da=max(da,dB-G);dh=max(dh,dB-G);df=max(df,dB-G);}
 vec3 ac=vec3(.29,.21,.17)*shade,sk=vec3(.40,.33,.28)*shade;
 float dsk=min(min(df,dh),dcl);
 if(dsk<PX*4.){bool fi=df<dh;vec3 c=dcl<min(df,dh)?vec3(.16,.13,.11)*shade:ptTone(fi?sk*.9:sk,fi?u4:u3);
  piece(dsk,dcl<min(df,dh)?q-M:(fi?g4:g3),c,K_SKIN,(q-ptP)/ptS*2.,fi?fd:normalize(M-W+1e-5),.03*r,.7,0.);}
 if(da<PX*4.){float dd=da-.003*r*(fbm2(q*500.)-.45);piece(dd,ga,ptTone(ac,ua),K_FUZZ,(q-ptP)/ptS*.6,normalize(W-S+1e-5),.08*r,.30,0.);ptFringe(q,dd,max(.004*r/.15,PX*1.6),.55*shade);}
}
void ptLeg(vec2 q,vec2 J[11],float shade,float grow,float dB){vec2 H=J[5],K=J[6],A=J[7],F=J[8];float r=ptS;
 vec2 lo=min(min(H,K),min(A,F)),hi=max(max(H,K),max(A,F));if(q.x<lo.x-.02||q.x>hi.x+.02||q.y<lo.y-.02||q.y>hi.y+.02)return;
 vec2 g1,g2,g3;float u1,u2,u3;float d1=ptLimb(q,H,K,.075*r,.044*r,g1,u1),d2=ptLimb(q,K,A,.040*r,.026*r,g2,u2);float d=smin(d1,d2,.014*r);vec2 gl=d1<d2?g1:g2;float ul=d1<d2?u1:u2;
 float dfo=smin(ptLimb(q,A,F,.026*r,.014*r,g3,u3),sdCap(q,A+vec2(-.02,-.03)*r,F+vec2(.04,.0)*r,.018*r,.010*r),.008*r);
 if(grow<.14){d=max(d,dB-grow);dfo=max(dfo,dB-grow);}
 vec3 lc=vec3(.29,.21,.17)*shade;
 if(dfo<PX*4.)piece(dfo,g3,ptTone(vec3(.40,.33,.28)*shade*.85,u3),K_SKIN,(q-ptP)/ptS*2.,normalize(F-A+1e-5),.02*r,.7,0.);
 if(d<PX*4.){float dd=d-.003*r*(fbm2(q*500.)-.45);piece(dd,gl,ptTone(lc,ul),K_FUZZ,(q-ptP)/ptS*.6,normalize(A-H+1e-5),.06*r,.8,0.);ptFringe(q,dd,max(.004*r/.15,PX*1.6),.5*shade);}}
void ptBody(vec2 q,float t,float grow){
 float fore;vec2 b=ptPlane(q,fore);
 if(b.x<-.95||b.x>1.8||b.y<-.52||b.y>.95)return;
 float sq=ptS*max(fore,.3); // screen units per metre in the plane (roughly)
 float thick=ptS*.11*(1.-min(fore,1.)); // seen end on, the body still has its width
 bool needB=grow<.14;float dB=needB?ptBonesPlane(b)*sq:-1.; // once the flesh is more than its own depth from the bones, they are hidden
 if(needB&&grow<.5)PIECE(dB,vec3(.88,.84,.75),K_BONE,b*.5,vec2(1,0),.004,.8,0.);
 float dT=ptTorso(b);
 float tn=0.;vec2 n0=vec2(.10,.04),nc=mix(n0,ptHj,.5)+vec2(-.07,.03);float dN=sdSeg(b,n0,ptHj)<.25?ptTube(b,n0,nc,ptHj,.105,.060,tn):1.;
 vec2 hf=vec2(cos(ptHA),sin(ptHA)),hu=vec2(-hf.y,hf.x);vec2 h=vec2(dot(b-ptHj,hf),dot(b-ptHj,hu));
 float dbk=1.,dcr=1.;float dH=sdSeg(h,vec2(-.80,.25),vec2(1.10,-.03))<.22?ptHeadD(h,dbk,dcr):1.;
 float dF=smin(dT,dN,.07);
 float d1=dF*sq-thick,d2=dH*sq-thick*.5;
 if(needB){d1=max(d1,dB-grow);d2=max(d2,dB-grow);}
 // the furred body and neck: dark umber above, buff below (countershaded)
 if(d1<PX*4.){float sd;if(dN<dT){vec2 tg=normalize(mix(nc-n0,ptHj-nc,tn)+1e-5);sd=dot(b-plBez(n0,nc,ptHj,tn),vec2(-tg.y,tg.x))/.075;}
   else{vec2 H=ptJ[5].xy;float ax=mix(-.09,H.y+.02,sat((b.x+.02)/(H.x-.02)));sd=(b.y-ax)/.21;}
  vec3 fc=mix(vec3(.50,.40,.32),vec3(.25,.19,.15),ss(-.7,.5,sd));
  float dd=d1-.0022*ptS/.15*(fbm2(b*70.)-.45);PIECE(dd,fc,K_FUZZ,b*.7,normalize(vec2(-1.,-.2)),.06*ptS,.9,0.);
  ptFringe(q,dd,max(.005*ptS/.15,PX*1.8),.75);
  // warm light bounced up from the sand onto its underside while it stands
  glow(vec3(.10,.06,.03)*ss(.2,-.8,sd)*cov(dd)*ptOn,0.);}
 // the head: bare skin, the beak of horn (pale ochre, darker to the tip), the crest with a muted red display band
 if(d2<PX*4.){vec3 hc=vec3(.40,.33,.29);
  float wb=ss(.01,-.01,dbk);hc=mix(hc,mix(vec3(.74,.62,.42),vec3(.36,.29,.21),ss(.45,1.05,h.x)),wb*ss(.10,.20,h.x));
  float wc=ss(.01,-.01,dcr);hc=mix(hc,mix(vec3(.62,.27,.18),vec3(.26,.17,.15),ss(-.42,-.78,h.x)),wc*ss(-.05,-.15,h.x));
  PIECE(d2,hc,K_SKIN,h*3.,vec2(1,0),.05*ptS,.9,0.);
  // the edge of the beak and crest lit from behind
  ptFringe(q,d2,max(.003*ptS/.15,PX*1.4),.55);
  if(grow>.3){
   // the line of the closed beak
   float ml=abs(h.y+.008+.012*(h.x-.2))-.006;ml=max(ml,max(.12-h.x,h.x-.98));PIECE(ml*sq,vec3(.18,.13,.10),K_SKIN,h,vec2(1,0),.001,0.,0.);
   vec2 es=ptPlaneScr(ptHj+hf*.035+hu*.03);
   if(fore>.35)eyeA(q,es,.034*ptS*min(fore*1.2,1.),vec3(.45,.30,.12),hc*.8,blinkAt(t,.67),0.);}}
}
void ptDraw(vec2 q,float t,float grow){
 // a box around it (the wings reach far)
 float ex=max(ptFly,ss(4.40,4.48,t));
 vec2 lo=ptP+ptS*mix(vec2(-1.25,-1.3),vec2(-3.8,-3.6),ex)-.01,hi=ptP+ptS*mix(vec2(1.65,1.05),vec2(3.8,3.6),ex)+.01;
 if(q.x<lo.x||q.y<lo.y||q.x>hi.x||q.y>hi.y)return;
 // standing, the limbs and the folded wings keep to the back and lower part of that box
 vec2 llo=ptP+ptS*mix(vec2(-1.05,-1.25),vec2(-3.8,-3.6),ex)-.01,lhi=ptP+ptS*mix(vec2(.52,.55),vec2(3.8,3.6),ex)+.01;
 bool lb=q.x>llo.x&&q.y>llo.y&&q.x<lhi.x&&q.y<lhi.y;float bF=-1.,bN=-1.;
 if(lb){ptJointsAll();if(grow<.14){bF=ptLimbBones(q,ptJF);bN=ptLimbBones(q,ptJN);}float fs=mix(.72,.56,ptOn);ptWing(q,ptJF,fs,grow,0.,bF);ptLeg(q,ptJF,fs,grow,bF);}
 ptBody(q,t,grow);
 if(lb){ptLeg(q,ptJN,1.,grow,bN);ptWing(q,ptJN,1.,grow,1.,bN);}
}
// Its long shadow on the sand while it stands (the low sun throws it towards us and to the left): a few of its parts, sheared.
float ptSil(vec2 p,vec2 J[11]){float r=ptS;float d=min(min(sdCap(p,J[0],J[1],.11*r,.07*r),sdCap(p,J[1],J[2],.07*r,.045*r)),sdCap(p,J[2],J[3],.03*r,.025*r));
 d=min(d,sdCap(p,J[3],J[4],.03*r,.01*r));d=min(d,min(sdCap(p,J[5],J[6],.07*r,.045*r),sdCap(p,J[6],J[7],.04*r,.025*r)));
 d=min(d,sdCap(p,mix(J[3],J[4],.12),mix(J[3],J[4],.70),.08*r,.03*r));return d;}
void ptShadow(vec2 q,float t){float w=ptOn;if(w<.01||q.y>PGY+.01||q.y<PGY-.38||q.x>PGX+.30||q.x<-1.4)return;
 float hp=(PGY-q.y)/1.25;vec2 p=vec2(q.x+2.0*hp,PGY+hp);
 if(p.x<ptP.x-1.1*ptS||p.x>ptP.x+1.65*ptS||p.y>ptP.y+1.05*ptS)return;
 float d=1e5;if(p.x<ptP.x+.40*ptS){ptJointsAll();d=min(ptSil(p,ptJN),ptSil(p,ptJF));}
 // the body, the neck and the head as simple shapes (it stands side on)
 vec2 b=rot(ptPitch)*(p-ptP)/ptS;d=min(d,ptTorso(b)*ptS);d=min(d,sdCap(b,vec2(.10,.04),ptHj,.09,.058)*ptS);
 vec2 hf=vec2(cos(ptHA),sin(ptHA)),hu=vec2(-hf.y,hf.x);d=min(d,min(sdCap(b,ptHj,ptHj+hf*1.1,.09,.01),sdCap(b,ptHj,ptHj-hf*.8+hu*.25,.08,.01))*ptS);
 float pen=.002+.05*hp;shadow(ss(pen,-pen,d)*.42*w*(1.-.5*ss(.0,.25,hp)),vec3(.50,.42,.58),0.);}

// ---- The plesiosaur (an elasmosaurid such as Styxosaurus): only its long neck and small head come out of the water; the body stays a
// dark shape under the surface. The neck rises at a moderate slope and the head is held forward (elasmosaur necks could not stand up
// like a swan's). Wet skin, lit from behind by the low sun. ----
const vec2 PL_O=vec2(.12,-.11);const float PL_S=.045;
float plRise(float t){return ss(8.6,10.0,t);}
float plSink(float t){return ss(10.2,11.6,t);}
float plOn(float t){return plRise(t)*(1.-ss(11.55,11.7,t));}
// the neck (plesiosaur frame, metres: x towards its front = screen left, y up, the sea at y = 0): rising, the head comes out first; going
// back, the head goes forward and down into the sea first and the neck follows it in an arc
void plNeck(float t,out vec2 a,out vec2 c,out vec2 e,out float ha){float r=plRise(t),s=plSink(t);float y=-3.6*(1.-r);
 a=vec2(-.5,-1.6+y);c=vec2(.30,1.85+y+.08*sin(t*.8));e=vec2(2.05,2.30+y+.05*sin(t*.8+.6));ha=-.22+.08*sin(t*.55)+.10*ss(9.4,9.9,t)*ss(10.6,10.1,t);
 a+=vec2(1.0,-.6)*s;c+=vec2(1.5,-1.9)*s;e+=vec2(1.3,-3.8)*s;ha-=1.1*s;}
float plHead(vec2 h){return smin(sdEll(h-vec2(.10,.0),vec2(.24,.125)),sdCap(h,vec2(.16,-.015),vec2(.56,-.05),.085,.034),.07);}
vec2 plScr(vec2 l){return PL_O+PL_S*vec2(-l.x,l.y);}
void plesio(vec2 q,float t,float wy){if(plOn(t)<.001)return;
 vec2 l=(q-PL_O)/PL_S;l.x=-l.x;
 if(l.x<-1.5||l.x>4.2||l.y<-2.6||l.y>3.)return;
 vec2 a,c,e;float ha;plNeck(t,a,c,e,ha);float wl=(wy-PL_O.y)/PL_S;
 float tn;float dN=ptTube(l,a,c,e,.27,.085,tn);
 vec2 hf=vec2(cos(ha),sin(ha)),hu=vec2(-hf.y,hf.x);vec2 h=vec2(dot(l-e,hf),dot(l-e,hu));float dH=plHead(h);
 float d=smin(dN,dH,.07);
 // under the surface: the reflection of the neck, broken by the waves; the neck itself seen dimly through the water
 if(l.y<wl){vec2 lr=vec2(l.x+.10*sin(l.y*5.+t*3.),2.*wl-l.y);float tr;float dr=smin(ptTube(lr,a,c,e,.27,.085,tr),plHead(vec2(dot(lr-e,hf),dot(lr-e,hu))),.07);
  shadow(ss(.02,-.06,dr)*.40*ss(-2.5,-.2,l.y-wl)*plOn(t),vec3(.40,.34,.40),0.);
  shadow(ss(.04,-.04,d)*.30*ss(-1.2,0.,l.y-wl),vec3(.55,.50,.55),0.);return;}
 d=max(d,wl-l.y);if(d*PL_S>PX*4.)return;
 // the shading follows the neck's own axis (a smooth tube), the head its own outline
 vec2 ax=plBez(a,c,e,tn);vec2 tg=normalize(mix(c-a,e-c,tn)+1e-5);vec2 up=vec2(-tg.y,tg.x);if(up.y<0.)up=-up;
 float side=dot(l-ax,up)/mix(.27,.085,tn);
 bool head=dH<dN;vec2 gs=head?vec2(dFdx(d),dFdy(d)):vec2(-(l-ax).x,(l-ax).y);
 vec3 col=mix(vec3(.58,.54,.50),vec3(.21,.21,.24),ss(-.7,.4,head?h.y/.11:side));
 piece(d*PL_S,gs,col,K_SMOOTH,l*.6,tg,.15*PL_S,.8,0.);
 // the rim of light along its back, and wet glints on it
 float rim=ss(-.05,-.005,d)*ss(.2,.9,head?h.y/.10+.3:side);glow(vec3(1.,.72,.42)*rim*.85*cov(d*PL_S),0.);
 float wet=ss(.70,.92,vn(vec2(tn*28.,side*2.2+t*.6)))*ss(-.3,.5,side)*(head?.4:1.);glow(vec3(1.,.86,.64)*wet*.40*cov(d*PL_S),0.);
 // water running down it in the first seconds out of the sea
 float st=ss(.80,.95,vn(vec2(l.x*16.,l.y*1.2-t*2.2)))*.30*(1.-ss(9.8,10.6,t));glow(vec3(1.,.8,.55)*st*cov(d*PL_S),0.);
 // a collar of foam where the neck goes into the water
 veil(vec3(1.,.90,.80),ss(.18,.0,l.y-wl)*ss(.06,-.02,d)*.55,0.);
 if(dH<.05&&plRise(t)>.6){vec2 es=plScr(e+hf*.07+hu*.045);eyeA(q,es,.0026,vec3(.32,.26,.18),vec3(.24,.25,.28),blinkAt(t,.2),0.);
  float ml=abs(h.y+.035+.04*(h.x-.3))-.010;ml=max(ml,max(.16-h.x,h.x-.48));PIECE(ml*PL_S,vec3(.10,.09,.10),K_SKIN,h,vec2(1,0),.001,0.,0.);}
}
// ---- The backdrop: a sunset over the seaway ----
vec3 ptSkyCol(vec2 q){float ds=length((q-PSUN)*vec2(.75,1.15));
 vec3 c=mix(vec3(1.,.72,.44),vec3(.93,.56,.44),ss(.03,.20,q.y));c=mix(c,vec3(.62,.46,.56),ss(.16,.44,q.y));c=mix(c,vec3(.27,.29,.47),ss(.42,.95,q.y));
 return mix(c,vec3(1.,.88,.64),ss(.42,.0,ds)*.75);}
void ptSkyDraw(vec2 q,float t){
 if(q.y<PH-.006)return; // the sea and the beach cover the rest
 PIECE(-1.,ptSkyCol(q),K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
 // long low clouds, their undersides lit by the sun beneath them; the tops cooler
 if(q.y>.07&&q.y<.70){vec2 cu=vec2(q.x*1.1+t*.004,q.y*8.);float n=fbm(cu);float band=ss(.07,.15,q.y)*ss(.66,.32,q.y);float cl=ss(.50,.74,n)*band;
  if(cl>.001){float lit=sat((n-fbm2(cu+vec2(0.,.10)))*5.+.5);vec3 cc=mix(vec3(.56,.40,.52),vec3(1.,.66,.46),lit);cc=mix(cc,vec3(1.,.86,.62),ss(.35,.0,length(q-PSUN))*.6);
   veil(cc,cl*.80,1.);}}
 // the sun and its glow; a haze over the horizon
 float ds=length(q-PSUN);veil(vec3(1.,.96,.80),ss(.033,.026,ds),1.);glow(vec3(1.,.68,.38)*.22*exp(-ds/.11),1.);
 veil(vec3(1.,.80,.60),ss(.05,.0,q.y-PH)*.30,1.);
}
// Ichthyornis, seabirds of the same sea, far away over the water (decor)
void ptBirds(vec2 q,float t){if(q.y<.0||q.y>.32)return;
 for(int i=0;i<3;i++){float fi=float(i);vec2 c=vec2(-.75+mod(t*.018+fi*.31,1.7),.13+.05*fi+.01*sin(t*.4+fi*2.));if(abs(q.x-c.x)>.03||abs(q.y-c.y)>.02)continue;
  float f=sin(t*7.+fi*2.);vec2 l=q-c;l.x=abs(l.x);float d=sdSeg(l,vec2(0.),vec2(.011,.004+.006*f))-.0011;d=min(d,sdEll(q-c,vec2(.004,.0018)));
  PIECE(d,vec3(.22,.17,.20),K_FLAT,q,vec2(1,0),.001,0.,1.);}}


// ---- The sea and the beach ----
// the edge of the water on the sand: each wave runs up and draws back (every 6.5 s, a little later to the right)
float ptShore(float x,float t){float ph=fract(t/6.5+.044-x*.05);float run=ss(.30,.48,ph)*ss(.95,.55,ph);return -.262+.012*sin(x*1.6+.8)+.005*sin(x*4.1)-.026*run;}
// where the plesiosaur's neck goes into the water (screen)
vec2 plEntry(float t){vec2 a,c,e;float ha;plNeck(t,a,c,e,ha);float A=a.y-2.*c.y+e.y,B=2.*(c.y-a.y),C=a.y;float u=.5;
 if(abs(A)>1e-4){float D=B*B-4.*A*C;float sD=sqrt(max(D,0.));u=(-B+sD)/(2.*A);if(u<0.||u>1.)u=(-B-sD)/(2.*A);}else u=-C/B;
 vec2 p=plBez(a,c,e,sat(u));return plScr(vec2(p.x,0.));}
float ptRing(vec2 q,vec2 c,float a,float sp,float life){if(a<0.||a>life)return 0.;float r=.004+a*sp;float e=length((q-c)/vec2(1.,.22))-r;
 return (ss(.005,.0,abs(e-.0015))-.5*ss(.007,.0,abs(e+.005)))*(1.-a/life)*(1.-a/life);}
void ptSea(vec2 q,float t){
 float sh=ptShore(q.x,t);if(q.y>PH+.004||q.y<sh-.02)return;
 float dz=max(PH-q.y,0.),Z=1./(dz+.010),X=(q.x-PSUN.x)*Z;float near=ss(.03,.22,dz);
 // the swells coming in and a slow chop: their backs (towards the sun) mirror the bright sky low down, their faces the higher sky
 float s1=Z*1.15-t*.9+.8*sin(X*.08),s2=Z*2.3+X*.05-t*1.3;float wn=vn(vec2(X*.25,Z*.9-t*.2));
 float w=sin(s1)*.6+sin(s2)*.4,sl=cos(s1)*.6+cos(s2)*.5+(wn-.5)*.6;
 vec2 m=vec2(q.x+(wn-.5)*.02*dz,PH+dz*.80+(sat(sl)*.10*near+.004*w)*(.3+dz*3.));vec3 refl=ptSkyCol(m);
 float fr=mix(.92,.42,ss(.0,.30,dz));vec3 col=mix(vec3(.14,.12,.22),refl*.92,fr);
 col*=1.-.16*sat(sl)*near;col+=vec3(1.,.70,.42)*.05*sat(-sl)*ss(.5,.95,sin(s1))*near;
 // the sun's path: wide near us and narrow at the horizon; glints come and go slowly on the slopes that face it
 float sw=.012+.19*dz;float gx=(q.x-PSUN.x-(wn-.5)*.05*dz)/sw;float g=exp(-gx*gx);
 float gl=ss(.35,.95,vn(vec2(X*.35,Z*2.6-t*.5)))*ss(.2,.9,.5-.5*sl);
 col+=vec3(1.,.80,.52)*g*(.16+.42*gl)*(1.-.40*ss(.0,.3,dz));
 vec3 lw=AMBC*.5+SUNC*.6;
 PIECE(q.y-PH,col/lw,K_WATER,vec2(X*.05,Z*.3),vec2(1,0),.02,0.,1.);
 veil(vec3(1.,.80,.60),ss(.018,.0,dz)*.35,1.);
 if(uDecor>1.5)return;
 // the plesiosaur: its body a dark shape under the surface while its neck is up; rings where its head breaks the surface (8.7 s), where
 // its neck goes in, and where the head and the neck go back under (10.9 and 11.5 s)
 float on=plOn(t);
 if(t>8.5&&t<14.){vec2 bc=PL_O+PL_S*vec2(.6,-.25);shadow(ss(1.,.3,length((q-bc)/vec2(.10,.016)))*.30*on,vec3(.45,.40,.50),1.);
  vec2 en=plEntry(t);float rg=0.;if(on>.01)for(int k=0;k<3;k++){float a=mod(t-8.7-float(k)*.55,1.65);rg+=ptRing(q,en,a,.035,1.65)*.6*on;}
  vec2 hd=plScr(vec2(2.0,0.)),hd2=plScr(vec2(3.3,0.)),en2=plScr(vec2(1.4,0.));rg+=ptRing(q,hd,t-8.72,.04,2.4)*1.2;rg+=ptRing(q,hd2,t-10.9,.045,2.6);rg+=ptRing(q,en2,t-11.5,.04,2.4)*.8;
  if(rg>0.)glow(vec3(.50,.40,.30)*rg*.6,1.);else shadow(-rg*.25,vec3(.6,.55,.65),1.);}
 // the shore break: each wave rises as it nears the beach (a dark face, its thin lip lit through by the sun), breaks into a line of foam
 // that runs in, and leaves lace on the water
 float bz=q.y-sh;if(bz<.07){float ph=fract(t/6.5+.044-q.x*.05);
  float seg=ss(.30,.62,vn(vec2(q.x*3.2+floor(t/6.5+.044-q.x*.05)*5.3,.5)));
  float yb=sh+.008+.050*(1.-ss(.0,.36,ph));float hb=.013*ss(.02,.22,ph)*(1.-ss(.26,.34,ph))*(.55+.6*seg);
  float face=ss(-.007,.0,q.y-yb)*ss(hb+.007,hb,q.y-yb)*ss(.003,.009,hb)*seg;
  vec3 fc=mix(vec3(.24,.20,.30),vec3(.55,.40,.34),ss(.2*hb,hb,q.y-yb));
  shadow(face*.14,vec3(.70,.62,.80),1.);
  // the foam: a rolling white line from the break, then thinning as it runs in
  float bk=ss(.24,.32,ph)*(1.-ss(.50,.62,ph));float yf=yb+hb*.6;float fw=.003+.010*ss(.26,.45,ph);
  float fo=ss(fw,.0,abs(q.y-yf-fw*.4))*ss(.25,.75,fbm2(vec2(q.x*60.,t*.8+q.y*200.)))*bk*(.30+.70*seg);
  float lc=fbm2(q*vec2(70.,210.)+floor(t/6.5)*3.+vec2(0.,t*.3));float lace=ss(.04,.0,abs(lc-.55))*ss(.045,.0,bz)*(.25+.55*ss(.4,.7,ph)*ss(1.,.8,ph));
  veil(vec3(1.,.93,.84),fo*.60+lace*.28,1.);}
}
void ptBeach(vec2 q,float t){
 float sh=ptShore(q.x,t);if(q.y>sh+.004)return;
 float dw=sh-q.y,Zg=1./max(PH-q.y,.05);
 // dry sand: warm, with wind ripples whose crests catch the low light; a line of wrack (shell bits and weed) where the high water reached
 float rp=sin(Zg*95.+3.*fbm2(q*vec2(2.5,5.))+q.x*Zg*1.5);float lr=ss(.6,.18,PX*Zg*Zg*95./TAU);
 vec3 sand=mix(vec3(.66,.52,.47),vec3(.80,.62,.47),.5+.5*fbm2(q*vec2(3.,9.)))*(.94+.08*fbm2(q*vec2(14.,40.)));sand*=1.+mix(0.,.05*ss(.3,1.,rp)-.025*ss(-.3,-1.,rp),lr)*ss(.0,.05,dw);
 float wr=abs(q.y-(-.345+.006*sin(q.x*7.)+.004*sin(q.x*19.)));float wv=vn(q*vec2(90.,200.));sand*=1.-(.08*ss(.012,.0,wr)*(.4+.6*wv)+.25*ss(.002,.0,wr-.004*wv)*ss(.55,.8,wv))*ss(.0,.02,dw);
 // wet sand: a mirror of the sky near the water, darker sand behind it as it dries
 float wet=ss(.085,.0,dw);vec3 mir=ptSkyCol(vec2(q.x,PH+dw*1.4+.05));
 vec3 col=mix(sand,mix(sand*.55,mir*.92,.80),wet);
 // (painted flat: the sand faces away from the low sun, so it is lit by the sky alone, and its texture is painted above)
 PIECE(q.y-sh,col*AMBC/(AMBC*.6+SUNC*.5),K_FLAT,q,vec2(1,0),.02,0.,1.);
 // the sun's path on the wet sand, and the sheen of the thin sheet of water the wave leaves
 float gx=(q.x-PSUN.x)/(.05+.35*dw);float g=exp(-gx*gx)*wet;glow(vec3(1.,.74,.44)*g*.30,1.);
 float ph=fract(t/6.5+.044-q.x*.05);float sheet=ss(.020,.0,dw)*ss(.35,.5,ph)*ss(1.,.7,ph);glow(vec3(1.,.80,.56)*sheet*.10,1.);
 // where the pteranodon stood: the prints of its hands and feet, after it has gone
 if(t>4.7&&abs(q.x-PGX)<.1&&abs(q.y-PGY)<.03){float pr=1e5;for(int i=0;i<4;i++){float fi=float(i);vec2 c=vec2(PGX+(i<2?.06:-.055),PGY+.004-.008*mod(fi,2.))+vec2(.012*mod(fi,2.),0.);
   pr=min(pr,length((q-c)/vec2(1.,.40))-.008);}shadow(ss(.003,-.003,pr)*.35*ss(4.7,5.2,t),vec3(.55,.46,.52),1.);}
 // a broken valve of a giant inoceramid clam on the sand (decor): its concentric growth ridges, a pearly inner layer at the broken edge
 vec2 sc=vec2(.60,-.435);vec2 sl=rot(.06)*(q-sc);float ds=max(sdEll(sl,vec2(.080,.020)),-(sl.y+.010+.003*sin(sl.x*55.)));
 shadow(ss(.010,-.008,sdEll(sl-vec2(-.035,-.009),vec2(.090,.016)))*.32,vec3(.50,.42,.55),1.);
 if(ds<.01){vec2 um=vec2(.075,-.006);float rr=length((sl-um)*vec2(1.,3.2));float rg=.5+.5*sin(rr*260.+1.5*vn(sl*60.));
  vec3 shc=mix(vec3(.50,.45,.42),vec3(.70,.64,.58),.5+.5*sin(rr*40.))*(.80+.22*rg);shc=mix(shc,vec3(.90,.86,.84),ss(.006,.0,abs(ds+.002))*ss(-.004,.006,sl.y)*.45);
  PIECE(ds,shc,K_SHELL,q*4.,vec2(1,0),.008,.6,1.);
  glow(vec3(1.,.72,.42)*ss(-.004,-.0008,ds)*ss(-.005,.012,sl.y)*.35*cov(ds),1.);}
}
// Grains of sand thrown back by the push; drops falling from the plesiosaur's head while it is up.
void ptSpray(vec2 q,float t){if(uDecor>1.5)return;
 float a=t-4.55;if(a>0.&&a<1.2&&abs(q.x-PGX)<.14&&abs(q.y-PGY)<.09){for(int j=0;j<11;j++){float fj=float(j);vec2 v=vec2(-.05-.12*h11(fj),.03+.10*h11(fj*2.3));
   vec2 c=vec2(PGX+.03+.10*(h11(fj*3.)-.5),PGY)+v*a+vec2(0.,-.35*a*a);if(c.y<PGY-.01)continue;veil(vec3(.90,.72,.54),ss(.0022,.0008,length(q-c))*(1.-a/1.2),1.);}}
 float on=plOn(t)*(1.-plSink(t));if(on>.05){vec2 a0,c0,e0;float ha;plNeck(t,a0,c0,e0,ha);vec2 hd=plScr(e0+vec2(cos(ha),sin(ha))*.2);
  if(abs(q.x-hd.x)<.03&&q.y<hd.y+.01&&q.y>PL_O.y-.01){for(int j=0;j<5;j++){float fj=float(j);float ph=fract(t*.9+h11(fj));float ag=ph*.75;
    vec2 p=hd+vec2((h11(fj*5.)-.5)*.010,-.004-.5*1.2*ag*ag);if(p.y<PL_O.y)continue;veil(vec3(1.,.86,.66),ss(.0018,.0006,length((q-p)*vec2(1.,.7)))*.8*on,1.);}}}
}
// The foreground (decor): a bleached log of driftwood half sunk in the sand at the bottom left, lit at its edge; in tall screens, more of
// the beach below with small shells.
void ptFore(vec2 q,float t){
 if(q.x<-.45&&q.y<-.42&&q.y>-.62){float tt;float d=ptTube(q,vec2(-1.02,-.505),vec2(-.82,-.468),vec2(-.58,-.492),.026,.017,tt);
  d=min(d,sdCap(q,vec2(-.70,-.475),vec2(-.66,-.438),.007,.004));d=min(d,length((q-vec2(-.98,-.49))/vec2(1.,1.3))-.045);
  d=max(d,-(q.y+.515+.006*sin(q.x*40.)));
  shadow(ss(.02,-.02,ptTube(q-vec2(-.05,-.03),vec2(-1.02,-.505),vec2(-.82,-.468),vec2(-.58,-.492),.026,.017,tt))*.30,vec3(.45,.38,.50),1.);
  if(d<.01){vec2 ax=plBez(vec2(-1.02,-.505),vec2(-.82,-.468),vec2(-.58,-.492),tt);float sd=(q.y-ax.y)/.026;
   vec3 wc=mix(vec3(.30,.26,.24),vec3(.52,.45,.39),ss(-.7,.7,sd))*(.82+.24*vn(vec2(tt*260.,sd*2.5)))*(.9+.1*sin(tt*900.+sd*2.));
   PIECE(d,wc,K_BARK,vec2(tt*6.,sd*.3),vec2(1,0),.03,.7,1.);
   glow(vec3(1.,.68,.38)*ss(-.006,-.001,d)*ss(.1,.9,sd)*.40*cov(d),1.);}}
 if(q.y<-.56){vec2 g=vec2(q.x/.24,(q.y+.56)/.13);vec2 ci=floor(g);if(h21(ci)>.55){vec2 c=vec2((ci.x+.2+.6*h21(ci+3.))*.24,-.56+(ci.y+.3+.4*h21(ci+7.))*.13);
   float sz=.010+.012*h21(ci+9.);float ds=sdEll(rot(h21(ci+5.)*3.)*(q-c),vec2(sz,sz*.55));
   if(ds<.01){shadow(ss(.006,-.004,sdEll(q-c-vec2(-.006,-.004),vec2(sz,sz*.5)))*.3,vec3(.5,.42,.55),1.);
    PIECE(ds,vec3(.82,.74,.66)*(.85+.3*h21(ci+11.)),K_SHELL,q*6.,vec2(1,0),.006,.5,1.);}}}
}
// ---- The fossils: the pteranodon standing, the plesiosaur lying in the chalk under where it will swim ----
float plBones(vec2 l){float d=1e5,tt;
 d=min(d,sdTube(l,vec2(-3.4,.1),vec2(-1.6,.35),vec2(.0,.05),.07,.11,tt));      // the long neck
 d=min(d,sdTube(l,vec2(.0,.05),vec2(1.8,.25),vec2(3.6,-.05),.11,.03,tt));     // back and tail
 d=min(d,sdEll(l-vec2(-3.6,.12),vec2(.24,.10)));                                // the small skull
 for(int i=0;i<9;i++){float x=.15+float(i)*.20;d=min(d,sdSeg(l,vec2(x,.18),vec2(x+.12,-.55))-.035);}
 for(int i=0;i<4;i++){float fi=float(i);vec2 b=vec2(i<2?.35:1.85,-.30);vec2 tp=b+vec2(-.9+fi*.25,-.7+.2*mod(fi,2.));d=min(d,sdCap(l,b,tp,.16,.06));}
 return d;}
void fossilScene(vec2 q){
 ptPose(0.);
 // the plesiosaur
 vec2 l=(q-PL_O-vec2(-.02,-.07))/PL_S;l.x=-l.x;if(abs(l.x)<4.5&&abs(l.y)<1.5){float d=plBones(l)*PL_S;PIECE(d,vec3(.58,.48,.34),K_FOSSIL,l*.15,vec2(1,0),.004,.6,0.);}
 // the pteranodon
 vec2 lo=ptP+ptS*vec2(-1.25,-1.3),hi=ptP+ptS*vec2(1.65,1.05);if(q.x<lo.x||q.y<lo.y||q.x>hi.x||q.y>hi.y)return;
 float fore;vec2 b=ptPlane(q,fore);float d=ptBonesPlane(b)*ptS;
 ptJointsAll();d=min(d,min(ptLimbBones(q,ptJN),ptLimbBones(q,ptJF)));
 PIECE(d,vec3(.58,.48,.34),K_FOSSIL,q*3.,vec2(1,0),.006,.6,0.);}

const vec2 WIN_C=vec2(-.44,-.25);
// the edge of the window of life (as the frame draws it): inside it the rock is not seen, so its fossil need not be drawn there
float ptWinD(vec2 q){float R=RFULL*ss(0.,.62,uLife);return length((q-WIN_C)*vec2(1.,1.15))-R+.06*(fbm2(q*5.+3.)-.5)+.02*(vn(q*24.)-.5);}
void fossil(vec2 q){if(uLife>.001&&ptWinD(q)<-.004)return;fossilScene(q);}
void life(vec2 q,float t){
 SUNL=normalize(vec3(.35,.22,-.55));SUNC=vec3(1.45,1.05,.70);AMBC=vec3(.56,.46,.52);BACK=.95;
 ptPose(t);
 ptSkyDraw(q,t);
 ptBirds(q,t);
 ptSea(q,t);
 plesio(q,t,PL_O.y+.0022*sin(t*1.1+q.x*40.));
 ptBeach(q,t);
 ptShadow(q,t);
 // the pteranodon's contact with the sand where its hands and feet stand
 if(ptOn>.01&&abs(q.x-PGX)<.22&&abs(q.y-PGY)<.06){ptJointsAll();
  contact(q,ptJN[3]+vec2(.01,-.002),.034,.45*ptOn);contact(q,ptJF[3]+vec2(.01,-.002),.030,.35*ptOn);contact(q,mix(ptJN[7],ptJN[8],.6),.036,.45*ptOn);contact(q,mix(ptJF[7],ptJF[8],.6),.030,.35*ptOn);}
 ptDraw(q,t,GROW);
 ptSpray(q,t);
 ptFore(q,t);
}
