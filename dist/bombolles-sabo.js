// Bombolles sense pes · stimulus 1, «Bombolles de sabó»: weightless soap bubbles.
// The matter: spheres that are almost nothing but light on a film of soapy water. They drift in from an edge as if blown from outside
// the screen, wobble when they touch (modes 2 and 3 of the sphere, the bigger the slower), cling in pairs that share a wall (the centres
// at the distance that makes the films meet at 120°: d² = Ra² + Rb² − Ra·Rb), gather into a loose foam and at the end drift away
// through every edge; a few burst (the hole opens from one point at a steady speed, as Culick described in 1960, slowed down).
// All the motion is computed here; bombolles-motor.js draws the films. Scene units: x ∈ [0, AR], y ∈ [0, 1] from the top.
import {bmbBodies,bmbRandom,bmbLin} from './bombolles-motor.js';
// the two films: thickness in nanometres (thick: from, to, spread between bubbles; thick2: a second stretch and the share of the
// film that is in the first one — the first film runs through violet, blue and turquoise and then, skipping the greens, through gold,
// red and magenta; the second film is one stretch of the higher orders, greens and pinks), size of the swirls, how vivid, how much
// light at the centre
export const SBO_FILMS=Object.freeze([{thick:[402,470,22],thick2:[556,636,.42],freq:1.15,sat:1.6,f0:.34,gain:1.15,band:[.42,.7],bands:1.7,dots:['#ff5fd0','#ffc640','#3fe8e0','#a46bff']},
 {thick:[486,716,70],thick2:[716,716,1],freq:1.1,sat:1.6,f0:.34,gain:1.15,band:[.42,.7],bands:1.7,dots:['#ff5fc8','#5cff6a','#ffe070','#ff9ad8']}]);
const SBO_EDGES=[0,2,1,3];// left, right, top, bottom (0 left, 1 top, 2 right, 3 bottom)
export function sboNew(o={}){const rnd=bmbRandom(o.seed||11);return {kind:'sabo',AR:o.AR||16/9,lap:o.lap||0,rnd,t:0,ft:rnd()*40,fs:1,b:[],dots:[],ev:[],role:'buit',k:0,P:o.presses||8,e0:Math.floor(rnd()*4),id:0,touch:new Set(),bq:[]};}
const sboLive=S=>S.b.filter(b=>S.t>=b.born&&!b.gone);
function sboAdd(S,o){const r=S.rnd,b={id:S.id++,x:o.x,y:o.y,vx:0,vy:0,R:o.R,r:o.R*.35,tx:o.tx,ty:o.ty,born:S.t+(o.delay||0),seed:r(),a2:.1+.08*r(),v2:0,p2:r()*6.28,a3:.04*r(),v3:0,p3:r()*6.28,alpha:1,join:[],burst:null,gone:false,ph:r()*30};S.b.push(b);return b;}
// where a new bubble of radius R should settle: touching its neighbours (a little into them), near the point asked for
function sboPlace(S,R,near,w=1,tries=90){const r=S.rnd,AR=S.AR,m=R*.55;let best=null;
 for(let i=0;i<tries;i++){const x=i===0&&near?near[0]:-m+r()*(AR+2*m),y=i===0&&near?near[1]:-m+r()*(1+2*m);let c=9;for(const b of S.b){if(b.gone)continue;const d=Math.hypot(x-b.tx,y-b.ty)-b.R;if(d<c)c=d;}
  const fit=c>8?0:-Math.abs(c-.9*R)/R-(c<.45*R?3*(.45*R-c)/R:0),s=fit-(near?w*Math.hypot(x-near[0],y-near[1]):0)+.12*r();if(!best||s>best.s)best={s,x,y};}
 return best;}
// the emptiest place of the screen: the cell of a coarse grid farthest from every bubble
function sboEmpty(S){const AR=S.AR,r=S.rnd;let best=null;for(let j=0;j<9;j++)for(let i=0;i<16;i++){const x=(i+.5)/16*AR,y=(j+.5)/9;let c=9;for(const b of S.b){if(b.gone)continue;const d=Math.hypot(x-b.tx,y-b.ty)-b.R;if(d<c)c=d;}
  c+=.03*r();if(!best||c>best.c)best={c,x,y};}return best;}
function sboEdgePoint(S,e,x,y,R){const AR=S.AR,g=R+.03;return e===0?[-g,y]:e===2?[AR+g,y]:e===1?[x,-g]:[x,1+g];}
function sboNearEdge(S,x,y){const AR=S.AR,d=[x,y,AR-x,1-y];let e=0;for(let i=1;i<4;i++)if(d[i]<d[e])e=i;return e;}
// a puff from an edge: the bubbles leave one after another from the same point outside the screen
function sboPuff(S,e,list,focus,w){const r=S.rnd;let n=0,first=null;for(const R of list){const p=sboPlace(S,R,first?[first.tx,first.ty]:focus,first?1.4:w);const s=sboEdgePoint(S,e,p.x+(r()-.5)*.1,p.y+(r()-.5)*.1,R);
  const b=sboAdd(S,{x:s[0],y:s[1],R,tx:p.x,ty:p.y,delay:n*.28});if(!first)first=b;n++;}S.ev.push({t:S.t,type:'entra',n:list.length,R:list[0],e});return first;}
function sboJoin(S,a,b){if(a.join.length>=2||b.join.length>=2||a===b)return false;const r=S.rnd,mz=(r()<.5?-1:1)*(.34+.3*r());a.join.push({o:b,mz,on:false});b.join.push({o:a,mz:-mz,on:false});return true;}
function sboBurst(S,b){if(b.burst||b.gone)return;const r=S.rnd,dir=r()*6.283;b.burst={t0:S.t,dir,dur:.25+.5*b.r};for(const j of b.join){const k=j.o.join.findIndex(x=>x.o===b);if(k>=0)j.o.join.splice(k,1);}b.join=[];
 const pal=SBO_FILMS[S.lap%2].dots.map(bmbLin),n=Math.round(10+90*b.r),bx=Math.cos(dir)*.62,by=Math.sin(dir)*.62;
 for(let i=0;i<n;i++){const a=r()*6.283,q=Math.sqrt(r())*.98,px=Math.cos(a)*q,py=Math.sin(a)*q,dx=px-bx,dy=py-by,dl=Math.hypot(dx,dy)||1,sp=(.12+.5*r())*(.4+b.r*2.2);
  S.dots.push({x:b.x+px*b.r,y:b.y+py*b.r,vx:dx/dl*sp+b.vx,vy:dy/dl*sp+b.vy,r:.0016+.004*r()*r(),c:pal[i%pal.length],t0:S.t+b.burst.dur*Math.min(1,dl/1.6),life:.7+.7*r()});}
 S.ev.push({t:S.t,type:'esclat',R:b.R,x:b.x/S.AR});}
// The role of press k of P (k from 1): the arrival (the first two), the growth, the full moment and the way out
export function bmbRole(k,P){return k>=P?'surt':k===P-1?'ple':k<=Math.min(2,Math.max(1,P-3))?'arriba':'creix';}
export function sboPress(S,k,P=S.P){const r=S.rnd,AR=S.AR,role=bmbRole(k,P);S.k=k;S.P=P;S.role=role;
 if(role==='arriba'){// a big bubble that stays half out of the screen and two small ones
  const e=SBO_EDGES[(S.e0+k-1)%4],R=.25+.07*r(),u=.3+.4*r(),inn=R*(.3+.25*r()),t=e===0?[inn,u]:e===2?[AR-inn,u]:e===1?[u*AR,inn]:[u*AR,1-inn],s=sboEdgePoint(S,e,t[0],t[1],R);
  const big=sboAdd(S,{x:s[0],y:s[1],R,tx:t[0],ty:t[1]});let n=1;for(const Rs of [.045+.02*r(),.022+.012*r(),k>1?.07+.03*r():0]){if(!Rs)continue;const p=sboPlace(S,Rs,[big.tx,big.ty],1.4),q=sboEdgePoint(S,e,p.x,p.y,Rs);sboAdd(S,{x:q[0],y:q[1],R:Rs,tx:p.x,ty:p.y,delay:.35*n++});}
  S.ev.push({t:S.t,type:'entra',n,R,e});return;}
 if(role==='creix'){const f=sboEmpty(S),e=sboNearEdge(S,f.x,f.y),left=P-2-k+1,big=.13+.1*r();
  const first=sboPuff(S,e,[big,.07+.04*r(),.035+.02*r(),.02+.012*r(),.018+.01*r()],[f.x,f.y],.6);
  // a second, smaller puff from the opposite side, and a bubble that comes to cling to another one (a double bubble)
  const f2=sboEmpty(S);sboPuff(S,sboNearEdge(S,f2.x,f2.y),[.09+.06*r(),.03+.02*r(),.02+.01*r()],[f2.x,f2.y],.6);
  const hosts=S.b.filter(b=>!b.gone&&!b.burst&&b.join.length<1&&b.R>.07&&b.R<.24&&b!==first&&b.tx>.05&&b.tx<AR-.05&&b.ty>.05&&b.ty<.95);
  if(hosts.length){const h=hosts[Math.floor(r()*hosts.length)],R=h.R*(.7+.35*r()),D=Math.sqrt(h.R*h.R+R*R-h.R*R);let a=r()*6.283,bestA=a,bc=-9;
   for(let i=0;i<10;i++){a+=.63;const x=h.tx+Math.cos(a)*D,y=h.ty+Math.sin(a)*D;let c=9;for(const b of S.b){if(b===h||b.gone)continue;const d=Math.hypot(x-b.tx,y-b.ty)-b.R-R;if(d<c)c=d;}if(x<.05||x>AR-.05||y<.05||y>.95)c-=.2;if(c>bc){bc=c;bestA=a;}}
   const x=h.tx+Math.cos(bestA)*D*.8,y=h.ty+Math.sin(bestA)*D*.8,q=sboEdgePoint(S,sboNearEdge(S,x,y),x,y,R),nb=sboAdd(S,{x:q[0],y:q[1],R,tx:x,ty:y,delay:.5});sboJoin(S,h,nb);}
  // now and then one of the older bubbles bursts
  if(k%2===0){const c=S.b.filter(b=>!b.gone&&!b.burst&&!b.join.length&&S.t-b.born>3&&b.R>.05&&b.R<.16&&b.x>.1&&b.x<AR-.1&&b.y>.1&&b.y<.9);if(c.length)S.bq.push({b:c[Math.floor(r()*c.length)],t:S.t+1.6});}
  return;}
 if(role==='ple'){// the foam: every gap takes bubbles, small ones gather where two bubbles almost touch, and all swell a little
  for(let i=0;i<4;i++){const f=sboEmpty(S);if(f.c<.03)break;sboPuff(S,sboNearEdge(S,f.x,f.y),[Math.min(.3,Math.max(.06,f.c*1.05)),.05+.03*r(),.03+.015*r()],[f.x,f.y],.9);}
  for(let i=0;i<10;i++){const f=sboEmpty(S);if(f.c<.022)break;const R=Math.min(.12,Math.max(.02,f.c*.95)),q=sboEdgePoint(S,sboNearEdge(S,f.x,f.y),f.x,f.y,R);sboAdd(S,{x:q[0],y:q[1],R,tx:f.x,ty:f.y,delay:.3+.15*i});}
  const L=S.b.filter(b=>!b.gone&&!b.burst);let n=0;for(let i=0;i<L.length&&n<34;i++)for(let j=i+1;j<L.length&&n<34;j++){const a=L[i],b=L[j],d=Math.hypot(a.tx-b.tx,a.ty-b.ty),g=d-a.R-b.R;if(g<.012||g>.09||a.R<.05||b.R<.05)continue;
    const ux=(b.tx-a.tx)/d,uy=(b.ty-a.ty)/d;let s=a.R;for(let c=0;c<3&&s<d-b.R-.008;c++){const R=Math.min(.022,(d-b.R-s)/2,.008+.014*r());if(R<.006)break;const x=a.tx+ux*(s+R)+(-uy)*(r()-.5)*.02,y=a.ty+uy*(s+R)+ux*(r()-.5)*.02,q=sboEdgePoint(S,sboNearEdge(S,x,y),x,y,R);
     sboAdd(S,{x:q[0],y:q[1],R,tx:x,ty:y,delay:.8+.06*n});n++;s+=2*R*.92;}}
  for(const b of S.b)if(!b.gone)b.R*=1.08;S.fs=1.7;
  for(let i=0;i<3;i++){const c=S.b.filter(b=>!b.gone&&!b.burst&&b.join.length<1&&b.R>.07&&b.R<.2);if(c.length<2)break;const a=c[Math.floor(r()*c.length)];let o=null,od=9;for(const b of c){if(b===a)continue;const d=Math.hypot(a.tx-b.tx,a.ty-b.ty)-a.R-b.R;if(d<od){od=d;o=b;}}
   if(o&&od<.06&&sboJoin(S,a,o)){const D=Math.sqrt(a.R*a.R+o.R*o.R-a.R*o.R),d=Math.hypot(o.tx-a.tx,o.ty-a.ty)||1,mx=(a.tx+o.tx)/2,my=(a.ty+o.ty)/2,ux=(o.tx-a.tx)/d,uy=(o.ty-a.ty)/d;a.tx=mx-ux*D*.42;a.ty=my-uy*D*.42;o.tx=mx+ux*D*.42;o.ty=my+uy*D*.42;}}
  S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: every bubble leaves by the edge it is nearest to, away from the middle; a few burst on the way (two a second at most)
 S.fs=1;const cx=AR/2,cy=.5;for(const b of S.b){if(b.gone)continue;let dx=b.x-cx,dy=(b.y-cy)*1.3;const l=Math.hypot(dx,dy);if(l<.05){const a=r()*6.283;dx=Math.cos(a);dy=Math.sin(a);}else{dx/=l;dy/=l;}
  const a=Math.atan2(dy,dx)+(r()-.5)*.5;b.ox=Math.cos(a);b.oy=Math.sin(a);b.acc=.05+.05*r()+.12*b.R;b.wait=.25*r()+Math.max(0,.9-l)*.9;}
 const c=S.b.filter(b=>!b.gone&&!b.burst&&b.R>.035&&b.R<.14&&b.x>.2&&b.x<AR-.2&&b.y>.15&&b.y<.85).sort(()=>r()-.5).slice(0,7);c.forEach((b,i)=>S.bq.push({b,t:S.t+.7+i*.62+.2*r()}));
 S.ev.push({t:S.t,type:'surt'});}
export function sboStep(S,dt){const r=S.rnd,AR=S.AR,t=S.t+dt;S.t=t;S.ft+=dt*S.fs*.5;const L=sboLive(S),out=S.role==='surt';
 while(S.bq.length&&S.bq[0].t<=t){sboBurst(S,S.bq.shift().b);}
 for(const b of L){b.r+=(b.R-b.r)*(1-Math.exp(-dt/.55));
  if(out){b.wait-=dt;if(b.wait<=0){b.vx+=b.ox*b.acc*dt;b.vy+=b.oy*b.acc*dt;}b.vx*=Math.exp(-.15*dt);b.vy*=Math.exp(-.15*dt);}
  else{// towards the place it will settle in, slowly, and a gentle wander around it
   const wx=Math.sin(t*.23+b.ph)*.012+Math.sin(t*.11+b.ph*2.3)*.01,wy=Math.cos(t*.19+b.ph*1.7)*.012+Math.sin(t*.13+b.ph*.7)*.008;
   b.vx+=((b.tx+wx*3-b.x)*1.15-b.vx*2.1)*dt;b.vy+=((b.ty+wy*3-b.y)*1.15-b.vy*2.1)*dt;}}
 // pairs: touching bubbles push each other softly; a joined pair settles at the distance of a double bubble
 const now=new Set();for(let i=0;i<L.length;i++){const a=L[i];if(a.burst)continue;for(let j=i+1;j<L.length;j++){const b=L[j];if(b.burst)continue;const dx=b.x-a.x,dy=b.y-a.y,rr=a.r+b.r;if(Math.abs(dx)>rr||Math.abs(dy)>rr)continue;const d=Math.hypot(dx,dy)||1e-6;if(d>=rr)continue;
   const ux=dx/d,uy=dy/d,ma=a.r*a.r,mb=b.r*b.r,wa=mb/(ma+mb),wb=ma/(ma+mb),jn=a.join.find(x=>x.o===b);let f;
   if(jn){const D=Math.sqrt(a.r*a.r+b.r*b.r-a.r*b.r)*Math.sqrt(1-jn.mz*jn.mz);f=(d-D)*9;if(!jn.on&&d<D*1.25){jn.on=true;const k=b.join.find(x=>x.o===a);if(k)k.on=true;S.ev.push({t,type:'fusio',R:Math.max(a.R,b.R),x:a.x/AR});a.v2+=1.2;b.v2+=1.2;}}
   else{const lim=rr*(out?.985:.955);if(d>=lim){continue;}f=-(lim-d)*(out?6:11);const key=a.id*4096+b.id;now.add(key);
    if(!S.touch.has(key)){const vr=(b.vx-a.vx)*ux+(b.vy-a.vy)*uy;if(vr<-.012&&Math.min(a.r,b.r)>.012){S.ev.push({t,type:'toc',R:Math.min(a.R,b.R),x:(a.x+b.x)/2/AR,v:-vr});const k=Math.min(3,-vr*26);a.v2+=k*wa*2;b.v2+=k*wb*2;a.p2=Math.atan2(uy,ux)*2;b.p2=a.p2;a.v3+=k*wa;b.v3+=k*wb;}}}
   a.vx+=ux*f*wa*dt;a.vy+=uy*f*wa*dt;b.vx-=ux*f*wb*dt;b.vy-=uy*f*wb*dt;}}
 S.touch=now;
 for(const b of L){b.x+=b.vx*dt;b.y+=b.vy*dt;
  // the wobble: two damped springs; the bigger the bubble, the slower (frequency ∝ R^−1.5, kept inside what the eye follows)
  const w2=Math.min(13,Math.max(2.2,.3*Math.pow(b.r,-1.5)*.9)),w3=w2*1.9;b.v2+=(-w2*w2*b.a2-1.5*b.v2)*dt;b.a2+=b.v2*dt;b.v3+=(-w3*w3*b.a3-2.2*b.v3)*dt;b.a3+=b.v3*dt;b.a2=Math.max(-.1,Math.min(.1,b.a2));b.a3=Math.max(-.08,Math.min(.08,b.a3));
  if(b.burst&&t-b.burst.t0>=b.burst.dur)b.gone=true;if(out&&(b.x<-b.r-.05||b.x>AR+b.r+.05||b.y<-b.r-.05||b.y>1+b.r+.05))b.gone=true;}
 for(const d of S.dots){if(t<d.t0)continue;d.x+=d.vx*dt;d.y+=d.vy*dt;const k=Math.exp(-2.4*dt);d.vx*=k;d.vy*=k;}
 S.dots=S.dots.filter(d=>t<d.t0+d.life);if(S.b.some(b=>b.gone))S.b=S.b.filter(b=>!b.gone);if(S.ev.length>200)S.ev.splice(0,S.ev.length-200);}
// how much of the screen has matter over it (0–1), on a 48 × 27 grid
export function sboCover(S){const L=sboLive(S),G=48,H=27;let n=0;for(let j=0;j<H;j++)for(let i=0;i<G;i++){const x=(i+.5)/G*S.AR,y=(j+.5)/H;for(const b of L){const dx=x-b.x,dy=y-b.y;if(dx*dx+dy*dy<b.r*b.r){n++;break;}}}return n/(G*H);}
export const sboEmptyNow=S=>!S.b.length&&!S.dots.length;
const SBO_BUF=new Float32Array(1536*20);
export function sboDraw(S){const F=SBO_FILMS[S.lap%2],U={uThick:F.thick,uThick2:F.thick2,uFreq:F.freq,uSat:F.sat,uF0:F.f0,uGain:F.gain,uBand:F.band,uBands:F.bands},L=sboLive(S),d=SBO_BUF,t=S.t;let n=0,w=0;const walls=[];
 for(const b of L){if(n>=1500)break;const k=n*20;d.fill(0,k,k+20);d[k]=b.x;d[k+1]=b.y;d[k+2]=b.r;d[k+3]=b.seed;d[k+4]=b.a2;d[k+5]=b.p2;d[k+6]=b.a3;d[k+7]=b.p3;d[k+8]=b.alpha;
  if(b.burst){d[k+9]=Math.max(.001,(t-b.burst.t0)/b.burst.dur*3.1416);d[k+10]=b.burst.dir;}d[k+11]=b.ph;d[k+15]=9;d[k+19]=9;let q=0;
  for(const j of b.join){if(q>1)break;const o=j.o;if(t<o.born||o.gone)continue;const dx=o.x-b.x,dy=o.y-b.y,d2=Math.hypot(dx,dy)||1e-6,s=Math.sqrt(1-j.mz*j.mz),D=d2/s;if(D>=b.r+o.r)continue;
   const da=(D*D+b.r*b.r-o.r*o.r)/(2*D);if(Math.abs(da)>=b.r)continue;const mx=dx/d2*s,my=dy/d2*s,p=k+12+q*4;d[p]=mx;d[p+1]=my;d[p+2]=j.mz;d[p+3]=da/b.r;q++;
   if(b.id<o.id)walls.push([b.x+mx*da,b.y+my*da,Math.sqrt(b.r*b.r-da*da),b.seed,mx,my,j.mz,Math.min(b.alpha,o.alpha),b.ph]);}
  n++;}
 bmbBodies('bubble',d,n,{...U,uT:S.ft});
 for(const v of walls){const k=w*20;d.fill(0,k,k+20);d.set(v.slice(0,8),k);d[k+8]=v[8];w++;}if(w)bmbBodies('wall',d,w,{...U,uT:S.ft},true,1.1);
 let m=0;for(const o of S.dots){if(t<o.t0||m>=1500)continue;const k=m*20,a=Math.min(1,(o.t0+o.life-t)/.4);d.fill(0,k,k+20);d[k]=o.x;d[k+1]=o.y;d[k+2]=o.r;d[k+4]=o.c[0];d[k+5]=o.c[1];d[k+6]=o.c[2];d[k+7]=a;m++;}if(m)bmbBodies('dot',d,m,{},true,1.2);}
