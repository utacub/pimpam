// 2 · Els guacamais. On a high branch of the emergent tree (its crown is drawn by bg.glsl), three macaws: two scarlet and one blue and
// yellow. They breathe, turn their heads and blink; the left one preens its wing (from tau ≈ 2.5 s); the right one opens its wings wide,
// red, yellow and blue (the key moment, tau ≈ 6–8.5 s), and folds them again; at the end the blue one and its neighbour touch beaks.
// The light of dawn comes from the low sun on the left: gold edges on that side.
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
// A wing spread from the shoulder S: the arm along angle th (length .42), and from it a fan of long feathers towards the back (side
// 1: the feathers fall to the left of the arm, as seen; −1 to the right). Returns its distance (in the bird's frame).
float wingD(vec2 f,vec2 S,float th,float op,float side){vec2 ax=vec2(cos(th),sin(th));vec2 W=S+ax*.42*op;float d=sdSeg(f,S,W)-.09*op;
 for(int i=0;i<9;i++){float fi=float(i),u=fi/8.;vec2 P=mix(S+ax*.08,W,u);float fa=th+side*(1.45-1.25*u);vec2 fd=vec2(cos(fa),sin(fa));
  d=min(d,sdSeg(f,P,P+fd*mix(.30,.62,u)*op)-.045*op);}
 return d;}
// A macaw perched, in its own frame (feet at y ≈ −.5, head at y ≈ .4, unit L): kind 0 scarlet, 1 blue and yellow; dir: 1 faces right,
// −1 left; ha: head turn (radians, negative bends it down and back), pr: preening (the head goes to the wing), op: wings open (0–1),
// bl: blink (1 closed), s: seed.
void macaw(vec2 q,vec2 c,float L,float kind,float dir,float ha,float pr,float op,float bl,float s,float t){
 vec2 f=(q-c)/L;f.x/=sdir(dir);if(abs(f.x)>1.3||f.y<-1.35||f.y>1.)return;
 float br=1.+.012*sin(t*2.4+s);f.y/=br;
 vec3 red=vec3(.90,.07,.05),blu=vec3(.06,.30,.92),yel=vec3(1.,.74,.08);
 vec3 bodyC=kind<.5?red:blu,bellyC=kind<.5?red*.92:vec3(1.,.62,.08);
 // the far wing, open forward and up behind the body (darker)
 vec2 S=vec2(-.03,.16);
 if(op>.01){float d=wingD(f,S,mix(-2.,1.15,op),op,-1.);float uu=length(f-S)/1.1;solid((kind<.5?(uu<.3?red:uu<.45?yel:blu):blu)*.45,cov(d*L));}
 // the tail, long, hanging behind the branch
 vec2 tq=f-vec2(-.10,-.36);vec2 ta=vec2(-.13,-.86)+vec2(.04*sin(t*.9+s),0.);float tu=segU(tq,vec2(0.),ta),td=sdSeg(tq,vec2(0.),ta)-mix(.075,.016,tu);
 solid(kind<.5?mix(red,blu,ss(.6,.9,tu)):mix(blu,blu*.7,tu),cov(td*L));
 // the body, leaning forward
 vec2 bq=rot(-.28)*(f-vec2(0.,-.06));float body=sdEll(bq,vec2(.18,.36));
 // the head: turned around the neck, and carried towards the wing while preening
 vec2 N=vec2(.06,.24),H0=vec2(.13,.38);float hang=ha-2.1*pr;vec2 hf=rot(hang)*(f-N-vec2(-.10,-.10)*pr)+N;
 float head=length(hf-H0)-.15;float bh=smin(body,head,.08);
 vec3 bc=mix(bodyC,bellyC,ss(-.05,.1,bq.x)*ss(.3,0.,bq.y));solid(bc,cov(bh*L));
 if(kind>.5){solid(vec3(.02,.03,.05),cov((sdEll(hf-H0-vec2(.04,-.12),vec2(.09,.03)))*L));solid(vec3(.25,.75,.30),cov((sdEll(hf-H0-vec2(.04,.11),vec2(.08,.045)))*L));}
 // the folded wing: red, then a band of yellow, then blue feathers (blue all over in the blue and yellow macaw)
 float fo=1.-ss(.0,.25,op);
 if(fo>0.){vec2 wq=rot(.38)*(f-vec2(-.07,-.10));float wd=sdEll(wq,vec2(.13,.31));float v=wq.y/.31;
  vec3 wc=kind<.5?(v>.25?red:v>-.08?mix(yel,vec3(.30,.55,.12),ss(.1,-.08,v)):blu):mix(blu,blu*.6,ss(.3,-.8,v));
  wc*=1.-.25*ss(.6,.95,abs(sin((v+.3)*14.)))*ss(.2,-.4,v);solid(wc,cov(wd*L)*fo);}
 // the face: white skin (with lines of tiny feathers in the blue one), the eye with its pale ring, the eyelid when it blinks
 vec2 F=hf-H0-vec2(.05,0.);float face=sdEll(F,vec2(.08,.065));solid(vec3(.96,.92,.88),cov(face*L));
 if(kind>.5)solid(vec3(.05),cov(abs(sin(F.y*60.))*.012-.004)*cov(face*L)*.6);
 vec2 E=hf-H0-vec2(.065,.02);solid(vec3(.95,.85,.40),cov((length(E)-.026)*L));solid(vec3(.01),cov((length(E-vec2(.004,0.))-.014)*L));
 solid(vec3(1.),cov((length(E-vec2(-.006,.008))-.005)*L)*.9);
 solid(kind<.5?vec3(.90,.12,.06):vec3(.08,.30,.85),cov((length(E)-.028)*L)*cov(-E.y+.028-.056*bl));
 // the beak: the upper part hooked (pale in the scarlet, black in the other), the lower part dark
 vec2 B=hf-H0-vec2(.15,-.02);float up=max(length(B)-.09,-(length(B-vec2(-.035,-.085))-.075));up=max(up,-B.x-.05);
 float lo=sdEll(B-vec2(-.02,-.07),vec2(.05,.035));solid(vec3(.05),cov(lo*L));solid(kind<.5?vec3(.90,.85,.72):vec3(.06),cov(up*L));
 // the near wing, opening: the arm rises and its long feathers spread from it, red at the root, a band of yellow, blue at the tips
 if(op>.01){float d=wingD(f,S,mix(-2.,2.05,op),op,1.);vec2 ax=vec2(cos(mix(-2.,2.05,op)),sin(mix(-2.,2.05,op)));float along=dot(f-S,ax)/.42,out_=length(f-S);
  vec3 wc=kind<.5?(out_<.32?red:out_<.48?yel:blu):mix(blu,vec3(.04,.18,.55),ss(.5,1.,out_));wc*=1.-.25*ss(.7,.95,abs(sin(atan((f-S).y,(f-S).x)*22.)))*ss(.4,.6,out_);
  solid(wc,cov(d*L));glow(vec3(1.,.7,.4)*ln(abs(d)*L,.0012)*.3);}
 // the feet holding the branch
 solid(vec3(.25,.22,.24),cov(min(sdEll(f-vec2(-.03,-.50),vec2(.05,.03)),sdEll(f-vec2(.07,-.50),vec2(.05,.03)))*L));
 // the light of dawn on the edges facing the sun (left)
 float lit=dir>0.?ss(.1,-.15,f.x):ss(-.1,.15,f.x);glow(vec3(1.,.62,.32)*ln(abs(bh)*L,.0016)*(.25+.6*lit));}
// The branch: bark, moss on top, the light of dawn on its upper edge; a twig with leaves lit from behind; a bromeliad with a red spike.
float branchY(float x){return -.20+.07*x+.025*sin(x*3.3+.6);}
void leaf(vec2 q,vec2 b,float ang,float len,float wd,float t,float s){vec2 l=rot(ang+.05*sin(t*.9+s))*(q-b)/len;if(l.x<-.05||l.x>1.05||abs(l.y)>.4)return;
 float v,d=leafD(l,wd,v)*len;float c=cov(d);if(c<=0.)return;float vein=exp(-abs(v)*8.)*.5+.3*exp(-abs(fract(l.x*6.-abs(v)*1.5)-.5)*10.)*ss(.1,.4,abs(v));
 solid(mix(vec3(.30,.42,.06),vec3(.55,.62,.12),ss(-1.,1.,-v))*(1.-.4*vein),c);glow(vec3(.8,.6,.2)*ln(abs(d),.0012)*.4);}
void scene(vec2 q,float t){
 float xb=q.x,yb=branchY(xb),thick=mix(.05,.02,ss(-ASP,.6,xb));
 // twig and leaves behind
 for(int i=0;i<6;i++){float fi=float(i);vec2 b=vec2(.42+.06*fi,branchY(.42)+.02+.035*fi);leaf(q,b,.4+.5*sin(fi*2.1)+(fi>2.5?.6:-.5),.13+.03*h11(fi),.24,t,fi);}
 // the branch
 if(xb<.62){float d=abs(q.y-yb)-thick;float c=cov(d);if(c>0.){float v=(q.y-yb)/thick;vec3 bark=mix(vec3(.05,.03,.02),vec3(.14,.09,.05),.5+.5*sin(xb*90.+3.*fbm2(q*30.)));
   bark=mix(bark,vec3(.12,.20,.04)*(.7+.6*fbm2(q*60.)),ss(.2,.8,v));solid(bark,c);glow(vec3(1.,.65,.3)*ln(abs(q.y-yb-thick),.0018)*.5);}}
 // the bromeliad
 vec2 bp=vec2(.50,branchY(.50)+.01);for(int i=0;i<5;i++){float fi=float(i);leaf(q,bp,1.57+(fi-2.)*.45,.12-.015*abs(fi-2.),.14,t,fi+9.);}
 for(int i=0;i<6;i++){float fi=float(i);vec2 bb=bp+vec2(.004*sin(fi*2.),.02+.016*fi);float bd=sdEll(rot(fi>2.5?.5:-.5)*(q-bb-vec2(mod(fi,2.)>.5?.012:-.012,0.)),vec2(.018,.008)*(1.-.08*fi));solid(mix(vec3(.95,.12,.18),vec3(1.,.55,.15),fi/6.),cov(bd));}
 // the macaws
 float pr=ss(2.5,3.3,t)*ss(5.6,4.8,t),nz1=ss(9.,9.7,t)*ss(11.8,11.,t),ha1=.25*sin(t*.7)*(1.-pr)*(1.-nz1)-.4*nz1;
 macaw(q,vec2(-.48,branchY(-.48)+.105),.20,0.,1.,ha1,pr*(.85+.15*sin(t*9.)),0.,ss(.0,.1,abs(fract(t*.23+.1)-.5)-.47),1.,t);
 float nuz=ss(9.,9.7,t)*ss(11.8,11.,t),bx=-.10-.24*ss(7.6,9.,t)+.012*sin(t*6.)*ss(7.6,7.9,t)*ss(9.,8.7,t);
 macaw(q,vec2(bx,branchY(bx)+.105),.19,1.,-1.,.2*sin(t*.9+2.)*(1.-nuz)-.62*nuz,0.,0.,ss(.0,.1,abs(fract(t*.19+.6)-.5)-.47),2.,t);
 float op=ss(5.8,6.8,t)*ss(9.,8.,t)*(1.-.12*ss(.3,1.,sin((t-6.8)*2.6))*ss(7.,7.3,t));
 macaw(q,vec2(.24,branchY(.24)+.105),.20,0.,1.,.15*sin(t*.6+4.),0.,op,ss(.0,.1,abs(fract(t*.21+.3)-.5)-.47),3.,t);
}
