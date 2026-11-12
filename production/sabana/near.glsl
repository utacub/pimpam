// Sabana de paper (CE36, 0.30): the paper nearest to the camera, drawn small and blurred (out of focus) over the scene: tufts of cut
// grass along the bottom when the camera is near the ground, thorny acacia twigs at the top in the canopy, reeds by the water, wisps of
// tissue cloud while the camera crosses the clouds. Twice as close as the scene, so it moves twice as fast and tells the depth during
// the travellings. It stays at the edges of the screen and fades in the middle, so it never covers the whole picture at once.
// Premultiplied colour and coverage.
out vec4 O;
vec4 N=vec4(0.);
void over(vec3 col,float a){N.rgb=col*a+N.rgb*(1.-a);N.a=a+N.a*(1.-a);}
void main(){hourLight();vec2 p=pScreen();float asp=.5*uR.x/uR.y;if(uDecor>1.5){O=vec4(0.);return;}
 float Z=uCam.z,zn=-.55*Z;vec2 L=uCam.xy+(p-HOR)*(Z+zn)+HOR*Z;float s=Z+zn,y=uCam.y;
 // the bottom and the top of the screen at this depth: the near plane hangs from them
 float yb=uCam.y+(-.5-HOR.y)*s+HOR.y*Z,yt=uCam.y+(.5-HOR.y)*s+HOR.y*Z;
 vec3 dark=litFlat(vec3(.26,.27,.09),.6)*.62;dark=mix(dark,vec3(.012,.014,.03),NIGHT*.7);
 // grass along the bottom: two rows of tall cut blades, swaying a little
 // (none over the section of the termite mound, scene 13, nor under the river, scene 10)
 float gz=ss(.95,.45,y)*ss(.45,.95,abs(wrapX(uCam.x)-27.4))*ss(.35,.85,abs(wrapX(uCam.x)-21.0));
 if(gz>0.){for(int k=0;k<2;k++){float fk=float(k),f=(5.+fk*3.)/s,u=L.x*f+fk*.4+.05*sin(uG*.7+L.x*2.),id=floor(u),h=h11(id+fk*9.);
   float tri=1.-2.*abs(fract(u)-.5),hh=s*(.06+.11*h)*(1.-.3*fk),top=yb-s*.02+hh*pow(tri,1.6+2.*h);
   float d=L.y-top;over(dark*(1.+.25*fk)+SUNC*.05*GLOW,ss(.004*s,-.004*s,d)*gz*(.78-.2*fk));}}
 // acacia twigs in the canopy: a zigzag twig with small leaflets and white thorns, hanging from the top
 float tz=ss(.65,.95,y)*ss(2.2,1.6,y);
 if(tz>0.){vec2 u=vec2(L.x,L.y-yt)/s*1.4;float cell=floor(u.x/1.3),h=h11(cell+3.);if(h<.6){float cx=(cell+.5)*1.3,ty=-.06-.14*h;vec2 l=u-vec2(cx,ty);
   float zig=abs(l.y+.05*abs(fract(l.x*3.)-.5))-.010;float tw=ss(.012,0.,max(zig,abs(l.x)-.6));
   float lf=0.;for(int i=0;i<6;i++){float fi=float(i);vec2 c=vec2(-.5+fi*.2,-.03*sin(fi*2.1));float r=length((l-c)*vec2(1.,2.2))-.06;lf=max(lf,ss(.01,-.01,r));}
   over(dark*.9,max(tw,lf*.95)*tz);}}
 // reeds by the water
 float wz=max(ss(16.9,17.8,wrapX(L.x))*ss(24.,23.,wrapX(L.x)),0.)*ss(.8,.3,y);
 if(wz>0.){float u=L.x*3./s,id=floor(u),h=h11(id+21.);if(h<.5){float x=fract(u)-.5-.2*(h-.25)+.04*sin(uG*.5+h*9.)*(L.y/s+.2);float top=yb+s*(.12+.25*h);
   over(dark,ss(.035,.02,abs(x))*ss(top+.01,top-.02,L.y)*wz);}}
 // wisps of tissue cloud while crossing the clouds over Kilimanjaro (y 1.8–3.0) and the high sea of clouds (y 4.0–4.9)
 float cz=ss(1.7,2.1,y)*ss(3.1,2.7,y)*ss(5.,3.,wrapX(uCam.x))+ss(3.9,4.2,y)*ss(5.0,4.7,y);
 if(cz>0.){float d=fbm(L*vec2(1.2,2.4)/s+vec2(uG*.02,0.));vec3 wc=mix(SKYH*.8+SUNC*.3,vec3(1.,.85,.82),GLOW*.4);over(wc,ss(.40,.85,d)*cz*.40);}
 float e=max(abs(p.y)*2.,abs(p.x)/asp);N*=ss(.50,.96,e)*(uDecor>.5?uOpacity:1.);
 O=N;}
