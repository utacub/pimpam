// Bombolles sense pes · stimulus 6, «Ferrofluid»: a black liquid mirror that grows spikes.
// The matter: a liquid full of tiny magnets. When the field through it is strong enough its flat surface is no longer stable and rises
// in a regular pattern of spikes, each row set between the spikes of the row behind (the hexagonal pattern of the instability that
// Cowley & Rosensweig described in 1967). The liquid is black and shiny: all its colour is the coloured lamps around it, mirrored.
// Each press makes the field stronger: more liquid, a new row of spikes behind, taller spikes. Drops of the same liquid float around.
// Nothing here is simulated: the rows and the heights are worked out, and each spike, each mound of liquid and each drop is one
// drawing with the shape and the mirror of its surface. Things are drawn from the far ones to the near ones.
// Scene units: x ∈ [0, AR], y ∈ [0, 1] from the top.
import {BMB_VS_SPRITE,BMB_GLSL_NOISE} from './bombolles-shaders.js';
import {bmbKind,bmbBodies,bmbRandom,bmbLin} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
// A = x, y, half the size of the drawing, seed · B = (spike: width of its foot · mound: its two radii · drop: –), how much of it is
// there (z) · E = kind (0 drop, 1 spike, 2 mound), side the field points to (1 up the screen, −1 down)
bmbKind('ferro',BMB_VS_SPRITE,`#version 300 es
precision highp float;in vec2 vQ;flat in vec4 vA,vB,vC,vD,vE;uniform float uT,uPx;uniform vec3 uL1,uL2,uL3,uL4;out vec4 o;
${BMB_GLSL_NOISE}
// the lamps of the room, seen in the direction r: two long coloured ones behind (left and right), a small warm one in front, a dim one below
vec3 ferEnv(vec3 r){float a=dot(r,normalize(vec3(-.78,-.3,-.55))),b=dot(r,normalize(vec3(.8,-.2,-.52))),c=dot(r,normalize(vec3(.3,-.62,.72))),d=dot(r,normalize(vec3(.1,.55,-.8))),e=dot(r,normalize(vec3(-.2,-.9,-.35)));
 float g=dot(r,normalize(vec3(-.55,-.1,.83))),k=dot(r,normalize(vec3(.6,-.55,.58)));
 return uL1*(pow(max(a,0.),6.)*1.5+pow(max(a,0.),28.)*1.6)+uL2*(pow(max(b,0.),6.)*1.5+pow(max(b,0.),28.)*1.5)+uL3*(pow(max(c,0.),16.)*.7+pow(max(c,0.),90.)*1.2+pow(max(g,0.),10.)*.55)+vec3(1.)*pow(max(k,0.),60.)*.7
  +uL4*(pow(max(d,0.),2.)*.05+pow(max(e,0.),7.)*.2);}
void main(){float dir=vE.y,al=vB.z,kind=vE.x;vec2 q=vec2(vQ.x,vQ.y*dir);vec3 n;float st,fres=1.;
 if(kind>.5&&kind<1.5){// a spike: a body of revolution, wide and almost flat at its foot, thin and steep towards its point
  float h=.5-q.y*.5,x=q.x*.5;if(h>1.||h<0.){discard;}float hh=max(h,.015),c=vB.x,w=c*(1./sqrt(hh)-1.),s=x/max(w,1e-4),aa=1.5/(uPx*vA.z*2.*max(w,.004));if(abs(s)>1.+aa){discard;}
  al*=(1.-smoothstep(1.-aa,1.+aa,abs(s)))*smoothstep(0.,.07,h)*(1.-smoothstep(.5,.62,abs(x)));float sl=c/(2.*pow(hh,1.5));vec3 N=normalize(vec3(s,sl,sqrt(max(0.,1.-s*s))));n=vec3(N.x,-N.y,N.z);st=h*3.+vA.w*7.;}
 else if(kind>1.5){// a mound of liquid: a low dome seen from a little above, its skin moving in slow waves
  vec2 e=q*vA.z/vB.xy;float r2=dot(e,e),aa=1.5/(uPx*min(vB.x,vB.y));if(r2>1.+2.*aa){discard;}al*=1.-smoothstep(1.-aa,1.+aa,sqrt(r2));
  vec4 wv=bmbN4(vec2(q.x*vA.z*2.6+vA.w*31.,q.y*vA.z*7.-uT*.05+vA.w*17.)),w2=bmbN4(vec2(q.x*vA.z*6.+uT*.04+vA.w*5.,q.y*vA.z*16.+vA.w*3.));
  n=normalize(vec3(e.x*.3*r2+(wv.r-.5)*2.4+(w2.r-.5)*.7,-.95+e.y*.5*r2,.42-.75*smoothstep(.55,1.,r2)*step(e.y,0.)+(wv.g-.5)*.7+(w2.g-.5)*.3));st=q.x*4.+vA.w*3.;}
 else{float r2=dot(q,q),aa=1.5/(uPx*vA.z);if(r2>1.+2.*aa){discard;}al*=1.-smoothstep(1.-aa,1.+aa,sqrt(r2));n=normalize(vec3(q,sqrt(max(0.,1.-r2))));st=q.y*2.+vA.w*9.;}
 vec3 I=normalize(vec3(0.,.3,-1.)),r=reflect(I,n);float fr=.3+.7*pow(1.-max(0.,dot(n,-I)),2.5),flow=.75+.5*bmbN4(vec2(st,vA.w*13.+dot(n.xz,vec2(3.,2.)))).b;
 vec3 col=ferEnv(r)*fr*flow;o=vec4(col*al,al);}`);
// the lamps of the two laps (left, right, front, below)
export const FER_PALS=Object.freeze([['#ff2fd0','#2a9cff','#ffb02e','#7a4cff'],['#ff9a1e','#19e0c8','#ff3fb0','#9a5cff']]);
const FER_ROWS=[[.95,1],[.77,.8],[.62,.64],[.5,.51],[.4,.41],[.32,.33]];// each row: where its foot is, how big it is seen
export function ferNew(o={}){const rnd=bmbRandom(o.seed||11),AR=o.AR||16/9,lap=o.lap||0,dir=lap%2?-1:1,S={kind:'ferro',AR,lap,rnd,t:0,rows:[],drops:[],ev:[],role:'buit',k:0,P:o.presses||8,dir,x0:AR*(.3+.4*rnd()),field:0,FIELD:0,post:{spread:.55,bloom:.22,exp:1}};
 FER_ROWS.forEach(([y,s],j)=>{const sp=.58*s,n=Math.ceil(AR/sp)+2,row={y,s,j,on:0,ON:0,rx:0,RX:0,sink:1,SINK:1,seed:rnd(),sp:[]};
  for(let i=0;i<n;i++)row.sp.push({x:(i-1+(j%2?.5:0)+(rnd()-.5)*.22)*sp,H:.56*s*(.7+.5*rnd()),h:0,c:.34+.1*rnd(),seed:rnd(),ph:rnd()*6.28});S.rows.push(row);});return S;}
function ferDrop(S,tx,ty,R,crown){const AR=S.AR,r=S.rnd,d=[tx,AR-tx],e=d[0]<d[1]?-1:1,D={x:e<0?-R-.05:AR+R+.05,y:ty+(r()-.5)*.1,tx,ty,vx:0,vy:0,r:R,seed:r(),ph:r()*40,crown:crown?[-.5,0,.5].map(a=>({a:a+(r()-.5)*.2,H:R*(1.3+.6*r()),h:0,seed:r()})):null,out:false,gone:false};S.drops.push(D);S.ev.push({t:S.t,type:'gota',R,x:tx/AR});return D;}
export function ferPress(S,k,P=S.P){const r=S.rnd,AR=S.AR,role=bmbRole(k,P),R=S.rows;S.k=k;S.P=P;S.role=role;const up=y=>S.dir>0?y:1-y;
 if(role==='arriba'){if(!R[0].ON){R[0].ON=1;R[0].RX=.46;R[0].SINK=.08;S.FIELD=.36;}else{R[0].RX=.62;R[0].SINK=.03;S.FIELD=.5;ferDrop(S,S.x0+(S.x0<AR/2?.6:-.6),up(.42),.06,true);ferDrop(S,AR*(.2+.6*r()),up(.22),.035);}S.ev.push({t:S.t,type:'camp',f:S.FIELD});return;}
 if(role==='creix'){const n=R.filter(w=>w.ON).length,steps=Math.max(1,P-3-Math.min(2,Math.max(1,P-3))),add=Math.max(1,Math.round((R.length-1-1)/steps));R[0].RX=AR;R[0].SINK=0;
  for(let i=n;i<Math.min(R.length-1,n+add);i++){R[i].ON=1;R[i].RX=AR;R[i].SINK=0;}for(let i=1;i<n;i++){R[i].RX=AR;R[i].SINK=0;}S.FIELD=Math.min(.85,S.FIELD+.12);
  ferDrop(S,AR*(.15+.7*r()),up(.1+.2*r()),.03+.03*r(),r()<.5);S.ev.push({t:S.t,type:'camp',f:S.FIELD});return;}
 if(role==='ple'){for(const w of R){w.ON=1;w.RX=AR;w.SINK=0;}S.FIELD=1;for(let i=0;i<3;i++)ferDrop(S,AR*(.1+.8*r()),up(.05+.12*r()),.022+.03*r(),i===0);S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: the field dies, the spikes lie down, the liquid sinks back through the edge it came from and the drops fly away
 S.FIELD=0;S.out=true;S.tout=S.t;for(const d of S.drops){d.out=true;d.ox=d.x<AR/2?-1:1;d.oy=-.6*S.dir;d.wait=.4*r();}S.ev.push({t:S.t,type:'surt'});}
export function ferStep(S,dt){const AR=S.AR,t=S.t+dt;S.t=t;S.field+=(S.FIELD-S.field)*(1-Math.exp(-dt/(S.out?.9:1.6)));
 for(const w of S.rows){if(S.out){const t0=S.tout+1.1+(S.rows.length-1-w.j)*.45;if(t>t0)w.SINK=2.2;}w.on+=(w.ON-w.on)*(1-Math.exp(-dt/1.2));w.rx+=(w.RX-w.rx)*(1-Math.exp(-dt/1.6));w.sink+=(w.SINK-w.sink)*(1-Math.exp(-dt/(S.out?1.5:1.8)));
  for(const s of w.sp){const inside=Math.abs(s.x-(w.j?AR/2:S.x0))<w.rx*.8?1:0,breath=1+.07*Math.sin(t*.9+s.ph),H=s.H*inside*w.ON*Math.max(0,Math.min(1,(S.FIELD-.12-.07*w.j)*2.2+.25*(S.FIELD>.2?1:0)))*breath;s.h+=(H-s.h)*(1-Math.exp(-dt/(.9+.6*s.seed)));}}
 for(const d of S.drops){if(d.out){d.wait-=dt;if(d.wait<=0){d.vx+=d.ox*.12*dt;d.vy+=d.oy*.1*dt;}}else{const wx=Math.sin(t*.2+d.ph)*.03,wy=Math.cos(t*.16+d.ph*1.6)*.025;d.vx+=((d.tx+wx-d.x)*.8-d.vx*1.7)*dt;d.vy+=((d.ty+wy-d.y)*.8-d.vy*1.7)*dt;}
  d.x+=d.vx*dt;d.y+=d.vy*dt;if(d.crown)for(const c of d.crown){const H=c.H*(S.out?0:Math.min(1,S.field*1.6));c.h+=(H-c.h)*(1-Math.exp(-dt/1.1));}if(d.out&&(d.x<-.2||d.x>AR+.2||d.y<-.2||d.y>1.2))d.gone=true;}
 if(S.drops.some(d=>d.gone))S.drops=S.drops.filter(d=>!d.gone);if(S.out&&S.rows.every(w=>w.sink>1.9)){for(const w of S.rows){w.ON=0;w.on=0;}S.gone=true;}if(S.ev.length>200)S.ev.splice(0,S.ev.length-200);}
// where the liquid of a row is on the screen (the top of its mound), with the row sunk by its share
const ferTop=(S,w)=>w.y+w.sink*(1.12-w.y);
export function ferCover(S){if(S.gone)return 0;const G=48,H=27;let n=0;for(let j=0;j<H;j++)for(let i=0;i<G;i++){const x=(i+.5)/G*S.AR,yy=(j+.5)/H,y=S.dir>0?yy:1-yy;let c=false;for(const w of S.rows){if(w.on<.05)continue;const top=ferTop(S,w),cx=w.j?S.AR/2:S.x0;
    if(y>top+.02*w.s&&Math.abs(x-cx)<w.rx){c=true;break;}for(const s of w.sp){if(s.h>.02&&Math.abs(x-s.x)<s.c*s.h*1.2&&y<top+.03&&y>top-s.h*.8){c=true;break;}}if(c)break;}if(c)n++;}return n/(G*H);}
export const ferEmptyNow=S=>(S.gone||S.rows.every(w=>!w.ON&&w.on<.01))&&!S.drops.length;
const FER_BUF=new Float32Array(400*20),FER_U={};
export function ferDraw(S){const d=FER_BUF,dir=S.dir,fy=y=>dir>0?y:1-y;let n=0;const put=(x,y,hs,seed,b0,b1,al,kind)=>{if(n>=400)return;const k=n*20;d.fill(0,k,k+20);d[k]=x;d[k+1]=fy(y);d[k+2]=hs;d[k+3]=seed;d[k+4]=b0;d[k+5]=b1;d[k+6]=al;d[k+16]=kind;d[k+17]=dir;n++;};
 if(!S.gone)for(let j=S.rows.length-1;j>=0;j--){const w=S.rows[j];if(w.on<.01)continue;const top=ferTop(S,w),cx=w.j?S.AR/2:S.x0,ry=.34*w.s+.1;put(cx,top+ry*.985,Math.max(w.rx,ry),w.seed,Math.max(w.rx,.02),ry,1,2);
   for(const s of w.sp){if(s.h<.004)continue;put(s.x,top+.018*w.s-s.h*.5,s.h*.5,s.seed,s.c,0,1,1);}}
 for(const o of S.drops){if(o.crown)for(const c of o.crown){if(c.h<.003)continue;const bx=o.x+Math.sin(c.a)*o.r*.75,by=o.y-Math.cos(c.a)*o.r*.5;put(bx,by-c.h*.5,c.h*.5,c.seed,.3,0,1,1);}put(o.x,fy(o.y),o.r,o.seed,0,0,1,0);}
 if(!n)return;const P=FER_PALS[S.lap%2].map(bmbLin);bmbBodies('ferro',d,n,{uL1:P[0],uL2:P[1],uL3:P[2],uL4:P[3],uT:S.t},false,1.25);}
