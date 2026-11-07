// ---- The window of life: a ragged opening in the rock that grows from WIN_C until it covers the screen (its edge a broken lip of rock
// with a shadow inside). The scene is drawn inside it, the fossil outside. ----
float winD(vec2 q,vec2 c,float life){float R=RFULL*ss(0.,.62,life);return length((q-c)*vec2(1.,1.15))-R+.06*(fbm2(q*5.+3.)-.5)+.02*(vn(q*24.)-.5);}
void main(){P=pScreen();Q=at(P);PX=uCam.z/(uScene.z*uR.y);float sa=.5*uR.x/uR.y;ASP=sa*uCam.z/uScene.z;
#ifdef SURFACE
 GROW=1.;F=vec4(0.);life(Q,uTau);OF=F;
#else
 vec2 c0=at(vec2(-sa,-.5)),c1=at(vec2(sa,.5));vec2 far=max(abs(c0-WIN_C),abs(c1-WIN_C));RFULL=length(far*vec2(1.,1.15))+.12;
 vec4 A=vec4(0.);
 if(uLife<.999){F=vec4(0.);SUNL=normalize(vec3(-.45,.55,.70));SUNC=vec3(1.05,1.,.92);AMBC=vec3(.55,.55,.58);BACK=0.;fossil(Q);A=F;}
 if(uLife>.001){float wd=winD(Q,WIN_C,uLife);GROW=.62*pow(ss(.25,1.,uLife),1.7);F=vec4(baseCol(),1.);
  // the living scene only where the window can show it (a margin of 4 pixels keeps whole 2×2 blocks inside, for the derivatives)
  if(wd<4.*PX)life(Q,uTau);
  shadow(ss(-.07,0.,wd)*.5,vec3(.35,.30,.30),1.);
  float m=cov(wd);float lip=uDecor<1.5?ss(.035,.0,wd)*ss(-.002,.004,wd)*(1.-m)*(uDecor>.5?uOpacity:1.):0.;
  OF=vec4(F.rgb*m+vec3(.17,.15,.12)*lip,m)+A*(1.-m);}
 else OF=A;
#endif
}
