// 11 · El sifonòfor. A giant siphonophore: one colony as long as the screen and more, travelling like a slow glass train. At the head
// the swimming bells beat in turn; behind them the stem carries, again and again, a clear leaf (bract), a pink-orange feeding polyp
// and a fishing tentacle that hangs down with glowing coils. A wave runs along the stem; a second, thinner colony far behind.
void colony(vec2 q,vec2 o,vec2 dir,float len,float t,float sz,float s,float dim){
 vec2 pe=vec2(-dir.y,dir.x);float u=dot(q-o,dir),e0=dot(q-o,pe);
 float A=.03*sz/.1,k=6.,w=.9;float wave=A*sin(u*k/(sz/.1)-t*w+s);float e=e0-wave;
 // the swimming bells at the front (u from 0 to -.28·sz/.1), alternating sides, beating one after the other
 float bl=.06*sz/.1,nb=5.;if(u<.02*sz/.1&&u>-nb*bl-.02&&abs(e)<.09*sz/.1){
  float j=clamp(floor(-u/bl),0.,nb-1.);for(int d=-1;d<=1;d++){float jj=j+float(d);if(jj<0.||jj>=nb)continue;float sg=mod(jj,2.)<.5?1.:-1.;
   float b=beat(t-jj*.18,1.4,0.);vec2 c=vec2(-(jj+.5)*bl,sg*.032*sz/.1);vec2 l=vec2(u,e)-c;l=rot(sg*.5)*l;
   float dd=sdEll(l,vec2(.034,.026*(1.-.25*b))*sz/.1);glassN(dd,normalize(l),.012*sz/.1,vec3(.85,.95,1.08),vec3(.55,.9,1.),1.4,s+jj*.2,.6*dim);
   glow(vec3(.4,.8,1.)*ln(abs(dd),.002)*b*.3*dim);}}
 // the stem
 if(u<-.02&&u>-len)glow(vec3(.9,.6,.8)*ln(abs(e),.0022*sz/.1)*.5*dim);
 // the fishing tentacles hang from the stem towards the bottom of the screen, swaying, with coils of light along them (the cormidium
 // above a point is found from its x)
 float sp=.11*sz/.1,ux=-(q.x-o.x)/dir.x-nb*bl;if(ux>-sp&&ux<len+sp){float j=floor(ux/sp);
  for(int d=-1;d<=1;d++){float jj=j+float(d);if(jj<0.)continue;float uu=-((jj+.5)*sp+nb*bl);vec2 R=o+dir*uu+pe*(A*sin(uu*k/(sz/.1)-t*w+s));
   float L=(.28+.22*h11(jj+s))*sz/.1*(.75+.25*sin(t*.3+jj));float dy=R.y-q.y;
   if(dy>0.&&dy<L){float kk=dy/L,x=R.x+.06*sz/.1*kk*kk*sin(t*.6+jj)+.012*sz/.1*sin(dy*30./(sz/.1)-t*1.5+jj);float dt=abs(q.x-x);
    float coil=pow(.5+.5*sin(dy*90./(sz/.1)+jj),4.);float pulse=.5+.5*sin(t*1.1-dy*12./(sz/.1)+jj*.7);
    glow(vec3(.95,.5,.6)*ln(dt,.0018*sz/.1)*(1.-kk)*.45*dim+mix(vec3(.2,.85,1.),vec3(.4,1.,.7),h11(jj))*ln(dt,.005*sz/.1)*coil*pulse*(1.-kk*.5)*.8*dim);}}}
 // the bract (a clear leaf above the stem) and the polyp (a pink-orange drop below), every sp along the stem
 float u1=-u-nb*bl;if(u1>0.&&u1<len&&abs(e)<.08*sz/.1){float j=floor(u1/sp);
  for(int d=-1;d<=1;d++){float jj=j+float(d);if(jj<0.)continue;float uu=-((jj+.5)*sp+nb*bl);vec2 R=o+dir*uu+pe*(A*sin(uu*k/(sz/.1)-t*w+s));
   vec2 l=q-R;vec2 lb=rot(.4)*(l-vec2(0.,.025*sz/.1));float br=sdEll(lb,vec2(.032,.018)*sz/.1);
   glassN(br,normalize(lb),.01*sz/.1,vec3(.85,.95,1.1),vec3(.6,.85,1.),1.6,s+jj*.37,.5*dim);
   vec2 lp=l-vec2(.005,-.028*sz/.1);float pd=sdEll(lp,vec2(.011,.024)*sz/.1);
   put(cov(pd)*mix(vec3(1.,.45,.25),vec3(1.,.3,.6),h11(jj*2.+s))*.7*dim,cov(pd)*.8*dim,vec3(.4,.2,.2),vec2(0.));}}}
void scene(vec2 q,float t){
 vec2 dir=normalize(vec2(1.,-.32));
 // far behind: a thin one, going the other way
 colony(q,vec2(.8-.045*t,.36),normalize(vec2(-1.,-.12)),2.2,t,.065,3.,.45);
 // the big colony: it enters from the left and travels across
 colony(q,vec2(-.62+.11*t,.14-.035*t),dir,3.6,t,.19,0.,1.);
}
