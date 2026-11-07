// ---- The picture: the rock with its fossils; where a scene is alive, a window of life that opens from the animal outwards (its
// edge a broken lip of rock with a shadow inside); the dust of the travelling; the darkening while waiting. ----
const vec2 C0=vec2(.08,0.),C1=vec2(.02,0.);
float winD(vec2 q,vec2 c,float life,float seed){float R=1.30*ss(.0,.62,life);return length((q-c)*vec2(1.,1.15))-R+.06*(fbm2(q*5.+seed)-.5)+.02*(vn(q*24.+seed)-.5);}
// Passes (PASS): 0 the rock and the dust; 1, 2 the fossil of scene 0, 1 (blended over the rock); 3, 4 the window of scene 0, 1.
void main(){
 P=(gl_FragCoord.xy-.5*uR)/uR.y;PX=1./uR.y;
 vec2 W=P+vec2(0.,uCamY);
 SUNL=normalize(vec3(-.45,.55,.70));SUNC=vec3(1.05,1.0,.92);AMBC=vec3(.55,.55,.58);
#if PASS==0
 F=vec4(baseCol(),1.);drawRock(W);dust(P,uCamY);OF=vec4(F.rgb*(1.-uDark),1.);
#elif PASS==1
 fossilMamut(W);OF=F*(1.-uDark);
#elif PASS==2
 fossilRex(W-vec2(0.,-2.2));OF=F*(1.-uDark);
#else
 vec2 q=PASS==3?W:W-vec2(0.,-2.2);float life=PASS==3?uLife.x:uLife.y;
 float wd=PASS==3?winD(q,C0,life,1.):winD(q,C1,life,5.);
 float grow=.62*pow(ss(.25,1.,life),1.7);
 F=vec4(baseCol(),1.);
#if PASS==3
 sceneMamut(q,uTau.x,grow);
#else
 sceneRex(q,uTau.y,grow);
#endif
 // the lip of the rock casts a shadow inside; the lip itself is a bright broken edge on the rock side
 shadow(ss(-.07,0.,wd)*.5,vec3(.35,.30,.30),1.);
 float m=cov(wd);float lip=uDecor<1.5?ss(.035,.0,wd)*ss(-.002,.004,wd)*(1.-m)*(uDecor>.5?uOpacity:1.):0.;
 vec3 lipAdd=vec3(.17,.15,.12)*lip;
 OF=vec4((F.rgb*m+lipAdd)*(1.-uDark),m);
#endif
}
