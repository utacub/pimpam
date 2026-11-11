// Fractals a la natura (CE46, 0.73) · the shaders of the engine of light lines (fractals-motor.js).
// Every line is a segment drawn as an instanced capsule: it grows from its start to its end after its birth, with a hot white point at
// the tip while it grows; a pulse of light runs along the structure (by the distance to the root); plants sway with a soft wind; at the
// way out the lines are gathered back from the tips to the root. The lines are drawn with MAX blending into a half-float picture, so
// where two lines meet the light does not pile up into a white knot; the glow comes after, from smaller copies of the picture.
// Instance layout (20 floats): A = x0 y0 x1 y1 · B = t0 dur w0 w1 · C = col lum d0 d1 · D = sway vx vy hot · E = pal tm fall seed
// Positions, widths and drift are in the units of the frame of the stimulus (the pixels of its 1672 × 941 concept picture): uFrame
// (ox, oy, k) brings them to scene units, x ∈ [0, AR], y ∈ [0, 1].
// (tm: the moment a whole object begins to drift with velocity vx vy and the downward acceleration fall; 0 = it never drifts).
export const FR_VS_FULL=`#version 300 es
layout(location=0) in vec2 aP;out vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
export const FR_VS_LINE=`#version 300 es
precision highp float;
layout(location=0) in vec2 aQ;layout(location=1) in vec4 aA;layout(location=2) in vec4 aB;layout(location=3) in vec4 aC;layout(location=4) in vec4 aD;layout(location=5) in vec4 aE;
uniform float uT,uAR,uPx,uDmax,uExit,uExitDur,uWind,uFade,uPulseV,uMinW,uGlowW;uniform vec3 uFrame;uniform vec4 uView;uniform vec4 uPulse;uniform vec3 uPalA[5];uniform vec3 uPalB[5];
out vec2 vP;flat out vec2 vA,vB;flat out float vW,vR,vTip;flat out vec3 vCol,vHot;
vec3 frPal(float c,float which){c=clamp(c,0.,1.)*4.;int i=int(min(floor(c),3.));float f=c-float(i);vec3 a=which<.5?uPalA[i]:uPalB[i],b=which<.5?uPalA[i+1]:uPalB[i+1];return mix(a,b,smoothstep(0.,1.,f));}
// the wind: a smooth field of the place, felt more the further the point is from the root (so a trunk stays and the tips move)
vec2 frWind(vec2 p,float d,float sway,float seed){if(sway<=0.||uWind<=0.)return vec2(0.);float k=sway*uWind*pow(clamp(d/uDmax,0.,1.),1.5);
 float a=sin(uT*.71+p.y*2.3+p.x*.9+seed)+.5*sin(uT*1.37+p.x*3.1-p.y*1.3+seed*2.)+.25*sin(uT*2.3+p.y*5.+p.x*4.);
 return k*vec2(a,.35*sin(uT*.93+p.x*2.7+seed*3.));}
vec2 frView(vec2 p){vec2 c=vec2(uAR*.5,.5);float s=sin(uView.w),co=cos(uView.w);vec2 q=(p-c)*uView.z;q=vec2(co*q.x-s*q.y,s*q.x+co*q.y);return c+q+uView.xy;}
void main(){float t0=aB.x,dur=max(aB.y,1e-3),g=clamp((uT-t0)/dur,0.,1.);
 float r=0.;if(uExit>=0.){float dn=clamp(aC.w/max(uDmax,1e-4),0.,1.),rs=uExit+(1.-dn)*uExitDur*.62;r=clamp((uT-rs)/(uExitDur*.38),0.,1.);}
 float e=g*(1.-r);
 if(e<=0.){gl_Position=vec4(2.,2.,2.,1.);vW=0.;return;}
 // a whole object that drifts (a snow crystal, a seed that flies away): all its lines move together from the moment tm
 float age=aE.y>0.?max(0.,uT-aE.y):0.;vec2 mv=aD.yz*age+vec2(0.,aE.z*age*age*.5);
 vec2 p0=aA.xy,p1=mix(aA.xy,aA.zw,e);float d0=aC.z,d1=mix(aC.z,aC.w,e);
 vec2 q0=uFrame.xy+(p0+mv)*uFrame.z,q1=uFrame.xy+(p1+mv)*uFrame.z;
 vec2 a=frView(q0+frWind(q0,d0,aD.x,aE.w))*uPx,b=frView(q1+frWind(q1,d1,aD.x,aE.w))*uPx;
 float w=max(mix(aB.z,aB.w,e)*uFrame.z*uPx*uView.z,uMinW),R=max(w*uGlowW,2.5)+1.;if(g<1.&&aD.w>0.)R=max(R,clamp(w*1.6,2.2,9.)*4.5+1.);
 vec2 dir=b-a;float L=length(dir);dir=L>1e-4?dir/L:vec2(1.,0.);vec2 nrm=vec2(-dir.y,dir.x);
 vec2 P=(aQ.x<0.?a-dir*R:b+dir*R)+nrm*aQ.y*R;vP=P;vA=a;vB=b;vW=w;vR=R;
 // the light: the colour of its place in the palette, its brightness, the pulses running along it, the fade of the way out
 float dn=clamp(.5*(d0+d1)/max(uDmax,1e-4),0.,1.),boost=1.;
 for(int i=0;i<4;i++){float ps=uPulse[i];if(ps<0.)continue;float f=(uT-ps)*uPulseV;if(f<-.2||f>1.4)continue;float x=(dn-f)/.07;boost+=1.15*exp(-x*x)*(1.-.4*clamp(f,0.,1.));}
 float thin=min(1.,w/1.2);
 vCol=frPal(aC.x,aE.x)*aC.y*boost*thin*uFade*(1.-.5*r);
 vTip=(g<1.&&r<=0.)?aD.w*uFade:0.;vHot=mix(vCol,vec3(1.)*max(aC.y,.6)*1.6,.55);
 gl_Position=vec4(P.x/(uAR*uPx)*2.-1.,1.-P.y/uPx*2.,0.,1.);}`;
export const FR_FS_LINE=`#version 300 es
precision highp float;in vec2 vP;flat in vec2 vA,vB;flat in float vW,vR,vTip;flat in vec3 vCol,vHot;uniform float uHalo,uCore,uRim,uTubeW,uTubeP;out vec4 o;
void main(){if(vW<=0.)discard;vec2 ab=vB-vA,ap=vP-vA;float h=clamp(dot(ap,ab)/max(dot(ab,ab),1e-6),0.,1.),d=length(ap-ab*h);
 float hw=vW*.5,core=1.-smoothstep(hw-.6,hw+.6,d),s=vR*.42,halo=exp(-d*d/(s*s))*uHalo*(1.-smoothstep(vR*.7,vR,d));
 // a neon tube: wide lines (wider than look.tubeW px) have a paler, brighter core along their middle (narrower with look.tubeP)
 float tube=core*pow(max(0.,1.-d*d/(hw*hw+1e-3)),uTubeP)*clamp((vW-uTubeW)/5.,0.,1.);
 vec3 c=vCol*(core+halo)+mix(vCol,vec3(max(vCol.r,max(vCol.g,vCol.b))),.55)*tube*uCore;
 // a glass tube (corals): the edges of a wide line shine brighter than its inside
 // (measured across the line, not from its ends, so that the joints of a curve do not show)
 if(uRim>0.){float dp=abs(dot(ap,vec2(-ab.y,ab.x)))/max(length(ab),1e-4),wk=clamp((vW-5.)/9.,0.,1.),rim=core*smoothstep(hw*.58,hw*.9,dp)*wk;
  c=mix(c,mix(vCol,vec3(max(vCol.r,max(vCol.g,vCol.b))),.5)*1.2,rim*uRim);}
 if(vTip>0.){float q=length(vP-vB),tw=clamp(vW*1.6,2.2,9.);c+=vHot*vTip*(exp(-q*q/(tw*tw))*1.8+exp(-q*q/(tw*tw*5.))*.35)*(1.-smoothstep(vR*.55,vR*.98,q));}
 if(max(c.r,max(c.g,c.b))<.002)discard;o=vec4(c,1.);}`;
export const FR_FS_DOWN=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uS;uniform vec2 uTx;out vec4 o;
void main(){vec3 c=texture(uS,vUv+uTx*vec2(-1.,-1.)).rgb+texture(uS,vUv+uTx*vec2(1.,-1.)).rgb+texture(uS,vUv+uTx*vec2(-1.,1.)).rgb+texture(uS,vUv+uTx*vec2(1.,1.)).rgb;o=vec4(c*.25,1.);}`;
export const FR_FS_UP=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uS,uB;uniform vec2 uTx;uniform float uMix;out vec4 o;
void main(){vec3 c=texture(uS,vUv+uTx*vec2(-1.,-1.)).rgb+texture(uS,vUv+uTx*vec2(1.,-1.)).rgb+texture(uS,vUv+uTx*vec2(-1.,1.)).rgb+texture(uS,vUv+uTx*vec2(1.,1.)).rgb;
 o=vec4(texture(uB,vUv).rgb+c*.25*uMix,1.);}`;
// to the screen: the lines and their glow, light pressed into the range of the screen with a gentle shoulder that keeps the colour
// (a very bright line turns towards white, as light does), the darkness of the wait, sRGB, and a little noise against banding; the
// glow and the whole picture can be made more saturated (look.gsat, look.sat), as the glow of real coloured light is, and the
// brightness where light begins to turn white can be raised (look.white), for forms whose colours stay pure at their brightest
export const FR_FS_FINAL=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uS,uB;uniform float uBloom,uExp,uDim,uGSat,uSat,uWhite;out vec4 o;
void main(){vec3 g=texture(uB,vUv).rgb;g=max(mix(vec3(dot(g,vec3(.2126,.7152,.0722))),g,uGSat),vec3(0.));
 vec3 c=(texture(uS,vUv).rgb+g*uBloom)*uExp;c=max(mix(vec3(dot(c,vec3(.2126,.7152,.0722))),c,uSat),vec3(0.));
 float m=max(c.r,max(c.g,c.b));vec3 t=c/(1.+m);float hot=clamp((m-uWhite)/4.,0.,1.);t=mix(t,vec3(max(t.r,max(t.g,t.b))),hot*.5);
 t=pow(t*1.18,vec3(1./2.2))*uDim;float n=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
 o=vec4(t+(n-.5)/255.,1.);}`;
