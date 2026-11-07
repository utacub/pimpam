// ---- The frame: the scene, the decor, the open water of the travel, the tone of style C ----
vec3 aces(vec3 x){return sat3((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14));}
void main(){P=(gl_FragCoord.xy-.5*uR)/uR.y;PX=1./uR.y;CAM=uCam.xy;VH=uCam.z;WPX=PX*VH;
 scene(toW(P),uTau);
 vec3 base=uBase>.5?vec3(.86,.85,.82):vec3(0.);
 vec3 bg=BG;if(uDecor>1.5)bg=base;else if(uDecor>.5)bg=mix(base,bg,uOpacity);
 vec3 c=bg*(1.-FG.a)+FG.rgb;
 if(uVeil>.001){vec3 vc=VEIL.r<0.?waterCol(max(-CAM.y,.25))*1.15:VEIL;
  // the open water: its colour, a little brighter towards the surface, and the snow streaking past
  vc*=.80+.40*ss(-.5,.5,P.y);vc+=lightAt(max(-CAM.y,.25)+.2)*.35*snow(P,uTau);
  if(uDecor>1.5)vc=base;else if(uDecor>.5)vc=mix(base,vc,uOpacity);
  c=mix(c,vc,ss(0.,1.,uVeil));}
 c=aces(c*1.4);c=pow(c,vec3(1./2.0));
 OF=vec4(c*uMix,uMix);}
