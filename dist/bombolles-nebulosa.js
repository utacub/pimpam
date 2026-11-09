// Bombolles sense pes · stimulus 8, «Nebulosa»: clouds of coloured gas that gather into a spiral, and stars.
// The matter: a thin gas that shines with its own light. It comes in from the edges as banks of cloud, fills the screen and winds
// itself around a bright heart (every point is turned around the centre by an angle that grows with the logarithm of its distance,
// which is what draws the arms of a spiral); dark lanes of dust cross it and small stars light up slowly, never in a blink. At the
// end the heart opens and the gas draws back beyond the edges.
// The gas is one field worked out for every point of the screen, at half the size of the picture (gas is soft); the stars are
// small dots drawn over it. Scene units: x ∈ [0, AR], y ∈ [0, 1] from the top.
import {BMB_VS_FULL,BMB_VS_SPRITE,BMB_GLSL_NOISE} from './bombolles-shaders.js';
import {bmbKind,bmbField,bmbBodies,bmbLayer,bmbLayerEnd,bmbRandom,bmbLin} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
// uBank = x, y, how far it reaches, how much of it is there
bmbKind('nebulosa',BMB_VS_FULL,`#version 300 es
precision highp float;in vec2 vUv;uniform float uAR,uT,uTwist,uRot,uFill,uHole,uCore,uSpiral,uZoom;uniform vec2 uC;uniform vec4 uBank[4];uniform vec3 uPal[5];out vec4 o;
${BMB_GLSL_NOISE}
vec3 nebPal(float x){x=clamp(x,0.,3.999);float i=floor(x),f=x-i;f=f*f*(3.-2.*f);return mix(uPal[int(i)],uPal[int(i)+1],f);}
void main(){vec2 p=vec2(vUv.x*uAR,1.-vUv.y),v=(p-uC)*uZoom;float r=length(v),sw=uTwist*log(r+.07)+uRot,cs=cos(sw),sn=sin(sw);vec2 s=vec2(cs*v.x-sn*v.y,sn*v.x+cs*v.y);
 float tt=uT*.02;vec2 w1=vec2(bmbFbm(s*1.6+vec2(0.,tt)),bmbFbm(s*1.6+vec2(5.2,-tt)+3.1))-.5,sq=s*3.6+w1*1.5+vec2(tt*.7,1.);float dt0=bmbFbm(v*7.+w1*1.2+vec2(7.,tt*2.)),gr=abs(2.*bmbFbm(v*15.+w1*2.+3.)-1.),D0=bmbFbm(sq)+(dt0-.5)*.34+(gr-.25)*.1;
 // how much gas there is here: the banks that came in from the edges, the whole screen once it is full, the hole that opens at the end
 float M=uFill;for(int i=0;i<4;i++){vec4 b=uBank[i];if(b.w<=0.)continue;M+=b.w*(1.-smoothstep(.25,1.,(length(p-b.xy)+(D0-.5)*.35)/max(b.z,1e-3)));}
 M=min(M,1.)*smoothstep(uHole-.2,uHole+.16,r/uZoom+(D0-.5)*.5);float arm=cos(2.*atan(s.y,s.x)+r*3.)*uSpiral*smoothstep(.05,.35,r);
 float vv=(D0-.5)*3.+M*1.2-.62+.34*arm,D=smoothstep(-.3,.8,vv)*smoothstep(0.,.1,M),vl=(bmbFbm(sq+vec2(-.1,-.13))+(bmbFbm(v*7.+w1*1.2+vec2(7.,tt*2.)+vec2(-.2,-.26))-.5)*.34-.5)*3.+M*1.2-.62+.34*arm+(gr-.25)*.3,lit=clamp(.8+(vv-vl)*1.2,.3,1.6);
 float hue=r*3./uZoom+(bmbFbm(s*.8+w1*1.1+9.)-.5)*4.4+.9*arm+.2;vec3 col=nebPal(hue)*D*D*lit*(.3+1.5*smoothstep(0.,.9,vv));
 // bright seams where a cloud ends, dark lanes of dust, a fine dust of far stars, the heart
 float seam=smoothstep(-.1,.1,vv)*(1.-smoothstep(.1,.4,vv));col+=nebPal(hue-.8)*seam*.16*smoothstep(0.,.1,M);
 float lane=smoothstep(.5,.7,bmbFbm(s*2.6+w1*2.6+13.));col*=1.-.65*lane*smoothstep(.08,.4,r);
 vec4 sp=bmbN4(p*90.);col+=vec3(1.,.9,.8)*smoothstep(.97,1.,sp.r)*D*sp.g*1.4;
 float hf=uCore*(1.-smoothstep(0.,.35,uHole));col+=(uPal[0]*(exp(-r*r/.006)*2.2+exp(-r/.13)*.6)+vec3(1.)*exp(-r*r/.0009)*2.)*hf;
 o=vec4(col,0.);}`);
// a star: A = x, y, radius · B = colour (linear), how much it shines
bmbKind('estel',BMB_VS_SPRITE,`#version 300 es
precision highp float;in vec2 vQ;flat in vec4 vA,vB,vC,vD,vE;out vec4 o;void main(){float r2=dot(vQ,vQ);if(r2>1.){discard;}float g=exp(-r2*9.)+.25*exp(-r2*2.5)*(1.-r2);o=vec4(vB.rgb*vB.a*g,0.);}`);
export const NEB_PALS=Object.freeze([['#ffd9a0','#ff6a4a','#ff2fb4','#22c8ff','#5a3cff'],['#ffe0f0','#ff5fc0','#3cff9a','#2a8cff','#7a3cff']]);
export function nebNew(o={}){const rnd=bmbRandom(o.seed||11),AR=o.AR||16/9,S={kind:'nebulosa',AR,lap:o.lap||0,rnd,t:0,cx:AR*(.44+.12*rnd()),cy:.44+.12*rnd(),rot:rnd()*6,tw:1.1*(rnd()<.5?1:-1),banks:[],fill:0,FILL:0,hole:0,hv:0,core:0,CORE:0,spiral:0,SPIRAL:0,zoom:1,stars:[],ev:[],role:'buit',k:0,P:o.presses||8,e0:Math.floor(rnd()*4),out:false,gone:true,post:{spread:.6,bloom:.38,exp:1}};
 return S;}
function nebBank(S,e,reach){if(S.banks.length>=4)return;const AR=S.AR,r=S.rnd,u=.2+.6*r(),p=e===0?[-.08,u]:e===2?[AR+.08,u]:e===1?[u*AR,-.08]:[u*AR,1.08];S.banks.push({x:p[0],y:p[1],r:.02,R:reach,a:1});S.ev.push({t:S.t,type:'banc',e});}
function nebStars(S,n){const r=S.rnd,AR=S.AR,cols=[[1,.92,.8],[.8,.9,1],[1,.8,.9],[1,1,1]];for(let i=0;i<n&&S.stars.length<150;i++)S.stars.push({x:r()*AR,y:r(),r:.0022+.005*r()*r()*r(),c:cols[Math.floor(r()*4)],a:0,A:.4+1.2*r(),t0:S.t+r()*3.5,vx:0,vy:0});S.ev.push({t:S.t,type:'estels',n});}
export function nebPress(S,k,P=S.P){const r=S.rnd,role=bmbRole(k,P);S.k=k;S.P=P;S.role=role;S.gone=false;
 if(role==='arriba'){if(!S.banks.length){nebBank(S,S.e0,.5);nebStars(S,6);}else{S.banks[0].R=.72;nebBank(S,(S.e0+2)%4,.42);nebStars(S,8);}return;}
 if(role==='creix'){for(const b of S.banks)b.R=Math.min(1.1,b.R*1.22);nebBank(S,(S.e0+1+2*(S.banks.length%2))%4,.5);S.FILL=Math.min(.6,S.FILL+.16);S.SPIRAL=Math.min(.7,S.SPIRAL+.25);S.CORE=Math.min(.6,S.CORE+.2);nebStars(S,14);S.ev.push({t:S.t,type:'creix'});return;}
 if(role==='ple'){S.FILL=1;S.SPIRAL=1;S.CORE=1;nebStars(S,45);S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: the heart opens and the gas and the stars draw back beyond the edges
 S.out=true;S.hv=.02;S.ev.push({t:S.t,type:'surt'});}
export function nebStep(S,dt){const t=S.t+dt;S.t=t;if(S.gone)return;const e=x=>1-Math.exp(-dt/x);S.rot+=dt*.035*(S.tw>0?1:-1)*(.6+.8*S.spiral);S.fill+=(S.FILL-S.fill)*e(2.5);S.core+=(S.CORE-S.core)*e(2.5);S.spiral+=(S.SPIRAL-S.spiral)*e(3);
 for(const b of S.banks)b.r+=(b.R-b.r)*e(2.2);
 if(S.out){S.hv+=.05*dt;S.hole+=S.hv*dt;S.zoom=1/(1+S.hole*.5);if(S.hole>1.5){S.gone=true;S.stars=[];S.banks=[];S.fill=S.FILL=0;}}
 for(const s of S.stars){if(t>s.t0)s.a+=(s.A-s.a)*e(1.6);if(S.out){const dx=s.x-S.cx,dy=s.y-S.cy,l=Math.hypot(dx,dy)||1;s.vx+=dx/l*S.hv*2.2*dt;s.vy+=dy/l*S.hv*2.2*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;}}
 if(S.out)S.stars=S.stars.filter(s=>s.x>-.05&&s.x<S.AR+.05&&s.y>-.05&&s.y<1.05);if(S.ev.length>200)S.ev.splice(0,S.ev.length-200);}
export function nebCover(S){if(S.gone)return 0;const G=32,H=18;let n=0;for(let j=0;j<H;j++)for(let i=0;i<G;i++){const x=(i+.5)/G*S.AR,y=(j+.5)/H;let M=S.fill;for(const b of S.banks){const q=Math.hypot(x-b.x,y-b.y)/Math.max(b.r,1e-3);M+=q<.25?1:q>1?0:1-(q-.25)/.75;}
   if(Math.hypot(x-S.cx,y-S.cy)<S.hole)M=0;if(M>.45)n++;}return n/(G*H);}
export const nebEmptyNow=S=>S.gone;
const NEB_BANK=new Float32Array(16),NEB_PAL=new Float32Array(15),NEB_STAR=new Float32Array(150*20);
export function nebDraw(S){if(S.gone)return;NEB_BANK.fill(0);S.banks.forEach((b,i)=>{NEB_BANK.set([b.x,b.y,b.r,b.a],i*4);});NEB_PALS[S.lap%2].forEach((h,i)=>NEB_PAL.set(bmbLin(h),i*3));
 bmbLayer();bmbField('nebulosa',{uT:S.t,uC:[S.cx,S.cy],uTwist:S.tw*(.35+.75*S.spiral),uRot:S.rot,uFill:S.fill,uHole:S.hole,uCore:S.core,uSpiral:S.spiral,uZoom:S.zoom,uBank:{arr:NEB_BANK,size:4},uPal:{arr:NEB_PAL,size:3}});bmbLayerEnd(true);
 const d=NEB_STAR;let n=0;for(const s of S.stars){if(s.a<.01)continue;const k=n*20;d.fill(0,k,k+20);d[k]=s.x;d[k+1]=s.y;d[k+2]=s.r*2.2;d[k+4]=s.c[0];d[k+5]=s.c[1];d[k+6]=s.c[2];d[k+7]=s.a;n++;}if(n)bmbBodies('estel',d,n,{},true,1);}
