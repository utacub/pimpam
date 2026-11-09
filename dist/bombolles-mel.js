// Bombolles sense pes · stimulus 2, «Mel i caramel»: a liquid so viscous that it coils like a rope.
// The matter: thick streams that come in from an edge and, where they meet a mass, wind round and round into a pile («liquid rope
// coiling», Ribe, Habibi & Bonn, 2012); each turn settles outward and down as the next one lands on top, so the pile is a spiral
// of rings that keeps flowing while the stream pours. Between piles a drop shoots across and leaves a thread, thick at the roots and
// thin in the middle, on which beads swell (the way a thin thread of liquid breaks, Rayleigh–Plateau). At the end everything is drawn
// out towards the edges and the threads break into beads that float away.
// All the motion is computed here (kinematics of design, not a fluid solver); bombolles-motor.js draws the ropes and the beads.
import {bmbBodies,bmbRope,bmbRopes,bmbRandom} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
// the two liquids: how much each colour is absorbed along the thickness, the light inside, the bright focus, the lamps, the density
export const MEL_LIQUIDS=Object.freeze([{sig:[.15,1.02,2],glow:[2.2,.95,.1],spec:[1,.97,.9],depth:1,opac:2.2},// honey and caramel
 {sig:[.5,3.2,.25],glow:[2.3,.8,.3],spec:[1,.94,1],depth:1,opac:2.2}]);// raspberry and blackberry syrup: orange where it is thin
const MEL_POST=Object.freeze({spread:.5,bloom:.1,exp:1});// little glow around: it is a liquid, not a light
const MEL_TURN=2.14;// seconds a turn of the coil takes (two beats at 56 to the minute)
export function melNew(o={}){const rnd=bmbRandom(o.seed||23);return {kind:'mel',AR:o.AR||16/9,lap:o.lap||0,rnd,t:0,piles:[],ribbons:[],threads:[],beads:[],ev:[],role:'buit',k:0,P:o.presses||8,e0:Math.floor(rnd()*4),id:0,post:MEL_POST};}
const melEase=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
// a point outside the screen, on edge e (0 left, 1 top, 2 right, 3 bottom), at u along it
function melEdge(S,e,u,g=.08){const AR=S.AR;return e===0?[-g,u]:e===2?[AR+g,u]:e===1?[u*AR,-g]:[u*AR,1+g];}
function melPile(S,x,y,R){const r=S.rnd,a=-1.5708+(r()-.5)*.7,p={id:S.id++,x,y,tx:x,ty:y,Ax:Math.cos(a),Ay:Math.sin(a),e:.44+.14*r(),R0:R,Rout:R,Rgoal:R,th:0,om:0,pours:0,pour:null,tint:r(),ph:r()*20,born:S.t,pull:null,gone:false};S.piles.push(p);return p;}
// a pour: the stream comes from the edge, reaches the top of the pile, coils for `turns` turns and its tail follows it in
function melPour(S,p,e,u,turns){const s=melEdge(S,e,u,.1+p.Rout*.3);if(!p.pours){let a=Math.atan2(s[1]-p.y,s[0]-p.x)+1.5708;a=Math.atan2(Math.sin(a),Math.cos(a));a=Math.max(-1.15,Math.min(1.15,a))*.8+(S.rnd()-.5)*.3-1.5708;p.Ax=Math.cos(a);p.Ay=Math.sin(a);}p.pours++;p.Rgoal=p.R0*(1+.25*(p.pours-1));p.pour={sx:s[0],sy:s[1],t0:S.t,in:1.3,t1:S.t+1.3+turns*MEL_TURN,tail:1.6,sw:S.rnd()*6.28,side:S.rnd()<.5?-1:1};S.ev.push({t:S.t,type:'raig',x:p.x/S.AR,R:p.Rout});}
// the place for a new pile: far from the others, inside the screen
function melSpot(S,near){const r=S.rnd,AR=S.AR;let best=null;for(let i=0;i<60;i++){const x=AR*(.1+.8*r()),y=.16+.68*r();let c=9;for(const p of S.piles){const d=Math.hypot(x-p.tx,(y-p.ty)*1.25)-p.Rgoal;if(d<c)c=d;}
  const s=Math.min(c,.6)-(near?.9*Math.hypot(x-near[0],y-near[1]):0)+.05*r();if(!best||s>best.s)best={s,x,y,c};}return best;}
// a ribbon: a thick stream that crosses the screen from one edge to another in a long S that sways; it runs in head first and,
// at the end, its tail runs out after it
function melRibbon(S,e,delay=0){const r=S.rnd,A=melEdge(S,e,.2+.6*r(),.12),B=melEdge(S,(e+1+Math.floor(r()*2))%4,.2+.6*r(),.12);S.ribbons.push({ax:A[0],ay:A[1],bx:B[0],by:B[1],w:.05+.02*r(),amp:(r()<.5?-1:1)*(.2+.12*r()),ph:r()*9,tint:r(),t0:S.t+delay,in:2.8,out:0});S.ev.push({t:S.t,type:'cinta'});}
function melRibbonPts(S,q,t){const dx=q.bx-q.ax,dy=q.by-q.ay,D=Math.hypot(dx,dy)||1,nx=-dy/D,ny=dx/D,am=q.amp*D*(1+.2*Math.sin(t*.31+q.ph)),am2=q.amp*D*(1+.2*Math.sin(t*.23+q.ph*1.7));
 const c1x=q.ax+dx*.3+nx*am,c1y=q.ay+dy*.3+ny*am,c2x=q.ax+dx*.7-nx*am2,c2y=q.ay+dy*.7-ny*am2,u1=melEase((t-q.t0)/q.in),u0=q.out&&t>q.out?melEase((t-q.out)/3.2):0,M=80,out=[];if(u1<=u0)return out;let len=0;
 for(let i=0;i<=M;i++){const u=u0+(u1-u0)*i/M,a=1-u,x=a*a*a*q.ax+3*a*a*u*c1x+3*a*u*u*c2x+u*u*u*q.bx,y=a*a*a*q.ay+3*a*a*u*c1y+3*a*u*u*c2y+u*u*u*q.by;if(i)len+=Math.hypot(x-out[i-1].x,y-out[i-1].y);out.push({x,y,d:len,u});}
 for(const o of out){o.w=q.w*(1+.22*Math.sin(o.u*7+q.ph)+.1*Math.sin(o.u*17+q.ph*2))*Math.sqrt(Math.min(1,(len-o.d)/(q.w*2.5)+.004))*Math.sqrt(Math.min(1,o.d/(q.w*2.5)+.004));o.v=o.u*D*1.2/q.w-t*1.6;o.sh=.75;o.tint=.15+.5*q.tint;}return out;}
function melThread(S,a,b,delay=0){if(a===b||S.threads.some(q=>(q.a===a&&q.b===b)||(q.a===b&&q.b===a)))return;const r=S.rnd,n=1+Math.floor(r()*3),beads=[];for(let i=0;i<n;i++)beads.push({u:.22+.56*(i+.5+.5*(r()-.5))/n,r:.008+.012*r(),ph:r()*6});
 S.threads.push({a,b,t0:S.t+delay,dur:1+.5*r(),r0:.0035+.002*r(),sg:(r()<.5?-1:1)*(.08+.16*r()),ph:r()*9,beads,brk:null,done:false,hit:false});}
function melDrop(S,p){const r=S.rnd,a=r()*6.283,sp=.03+.05*r();S.beads.push({x:p.x+Math.cos(a)*p.Rout*.9,y:p.y+Math.sin(a)*p.Rout*p.e,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:.012+.018*r(),tl:.8+1.2*r(),seed:r(),t0:S.t+r()*2,grow:1,free:true});}
export function melPress(S,k,P=S.P){const r=S.rnd,AR=S.AR,role=bmbRole(k,P),E=i=>(S.e0+i)%4;S.k=k;S.P=P;S.role=role;const live=S.piles.filter(p=>!p.gone);
 if(role==='arriba'&&!live.length){// the first stream coils close to where it comes in
  const e=E(0),s=melEdge(S,e,.25+.2*r()),x=Math.min(AR*.8,Math.max(AR*.2,s[0]+(e===0?.42:e===2?-.42:0))),y=Math.min(.72,Math.max(.3,s[1]+(e===1?.34:e===3?-.34:0)));
  melPour(S,melPile(S,x,y,.2),e,.3+.3*r(),3);return;}
 if(role==='arriba'||role==='creix'){// in turn: a new pile far from the others, or more liquid on a pile that is there; threads between neighbours
  const fresh=live.length<2||(k%2===0&&live.length<4);let p;
  if(fresh){const sp=melSpot(S);p=melPile(S,sp.x,sp.y,.15+.08*r());}else{p=live.filter(q=>!q.pour).sort((a,b)=>a.pours-b.pours||a.born-b.born)[0]||live[0];}
  // the stream comes from the edge farthest from the pile, so it crosses the screen in a long curve
  const d=[p.x,p.y*AR,AR-p.x,(1-p.y)*AR];let e=E(k);if(d[e]<AR*.3)e=d.indexOf(Math.max(...d));melPour(S,p,e,.2+.6*r(),3+(fresh?0:1));
  const others=S.piles.filter(q=>!q.gone&&q!==p).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));if(others[0])melThread(S,others[0],p,2.2);if(others[1]&&k>3)melThread(S,p,others[1],3.4);
  if(live.length>=2&&!S.ribbons.length)melRibbon(S,E(k+1));if(k>2)for(let i=0;i<2;i++)melDrop(S,live[Math.floor(r()*live.length)]);return;}
 if(role==='ple'){// the lace: every pile takes a last stream at once, and threads join every pair of neighbours
  while(S.piles.filter(p=>!p.gone).length<4){const sp=melSpot(S);melPile(S,sp.x,sp.y,.14+.07*r());}
  while(S.ribbons.length<2)melRibbon(S,E(S.ribbons.length*2+1),.6*S.ribbons.length);
  const L=S.piles.filter(p=>!p.gone);L.forEach((p,i)=>{if(!p.pour||S.t>p.pour.t1){const d=[p.x,p.y*AR,AR-p.x,(1-p.y)*AR];let e=E(i);if(d[e]<AR*.25)e=d.indexOf(Math.max(...d));melPour(S,p,e,.15+.7*r(),4+i%2);p.pour.t0+=i*.35;p.pour.t1+=i*.35;}});
  let n=0;for(const a of L)for(const b of L){if(a.id>=b.id)continue;if(Math.hypot(a.x-b.x,a.y-b.y)<.95)melThread(S,a,b,1+.5*n++);}
  for(let i=0;i<8;i++)melDrop(S,L[i%L.length]);S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: every mass is drawn out towards the edge it is nearest to, and the threads break
 const cx=AR/2;for(const p of S.piles){if(p.gone)continue;let dx=p.x-cx,dy=(p.y-.5)*1.4;const l=Math.hypot(dx,dy);if(l<.04){const a=r()*6.283;dx=Math.cos(a);dy=Math.sin(a);}else{dx/=l;dy/=l;}
  p.pull={dx,dy,t0:S.t+.3*r(),acc:.085+.05*r()};if(p.pour&&S.t<p.pour.t1)p.pour.t1=S.t;}
 S.threads.forEach((q,i)=>{if(!q.brk)q.brk=S.t+.4+.25*i+.3*r();});S.ribbons.forEach((q,i)=>{if(!q.out)q.out=S.t+.3+.5*i;});for(const b of S.beads){const dx=b.x-cx,dy=b.y-.5,l=Math.hypot(dx,dy)||1;b.ox=dx/l;b.oy=dy/l;}S.ev.push({t:S.t,type:'surt'});}
// the pile at age s (turns since that bit of rope landed): where it lies, how thick it is, how high in the pile
const MEL_W=.2,MEL_TOP=.45;// the radius of the rope and of the top turn of a pile, in radii of the pile// the radius of the rope, in radii of its pile
function melCoil(p,s,o){const th=p.th-6.2832*s,k=1-Math.exp(-s/1.7),Rt=p.Rout*MEL_TOP,wob=1+(.1*Math.sin(th*.37+p.ph)+.06*Math.sin(th*1.31+p.ph*2.3))*k,R=(Rt+(p.Rout-Rt)*k)*wob,h=p.Rout*1.1*Math.exp(-s/2.1),lx=R*Math.cos(th),ly=p.e*R*Math.sin(th)+h;
 o.x=p.x-p.Ay*lx+p.Ax*ly;o.y=p.y+p.Ax*lx+p.Ay*ly;o.w=p.Rout*MEL_W*(1+.3*k)*(1+.13*Math.sin(th*.53+p.ph*3.1)*Math.min(1,s*2));o.sh=.2+.8*Math.exp(-s/2);o.v=th*3;return o;}
// the drawing-out at the end: the points of a mass slide along the direction it is pulled in
function melPull(p,o,t){const q=p.pull;if(!q||t<=q.t0)return o;const u=t-q.t0,sh=.5*q.acc*u*u,st=1.9*(1-Math.exp(-u/2.6)),rx=o.x-p.x,ry=o.y-p.y,al=rx*q.dx+ry*q.dy,pe=-rx*q.dy+ry*q.dx,a2=al*(1+st)+sh,p2=pe*(1-.3*Math.min(1,st));
 o.x=p.x+q.dx*a2-q.dy*p2;o.y=p.y+q.dy*a2+q.dx*p2;o.w*=1/Math.sqrt(1+.5*st);return o;}
export function melStep(S,dt){const t=S.t+dt,AR=S.AR;S.t=t;
 for(const p of S.piles){if(p.gone)continue;p.Rout+=(p.Rgoal-p.Rout)*(1-Math.exp(-dt/2.2));
  // a slow drift around its place
  p.x=p.tx+.012*Math.sin(t*.17+p.ph);p.y=p.ty+.01*Math.cos(t*.13+p.ph*1.7);
  const q=p.pour;let om=0;if(q&&t>q.t0+q.in){const end=q.t1+q.tail;om=t<q.t1?6.2832/MEL_TURN:t<end?6.2832/MEL_TURN*(1-melEase((t-q.t1)/q.tail)*.85):0;}
  p.om+=(om-p.om)*(1-Math.exp(-dt/.35));const th0=p.th;p.th+=p.om*dt;if(Math.floor(p.th/6.2832)>Math.floor(th0/6.2832))S.ev.push({t,type:'volta',x:p.x/AR,R:p.Rout,n:Math.floor(p.th/6.2832)});
  if(p.pull&&t>p.pull.t0){const u=t-p.pull.t0,sh=.5*p.pull.acc*u*u,cx=p.x+p.pull.dx*sh,cy=p.y+p.pull.dy*sh,m=p.Rout*3.2;if(cx<-m||cx>AR+m||cy<-m||cy>1+m)p.gone=true;}}
 for(const q of S.threads){if(q.done)continue;if(!q.hit&&t>=q.t0+q.dur){q.hit=true;S.ev.push({t,type:'fil',x:(q.a.x+q.b.x)/2/AR});}
  if(q.brk&&t>=q.brk){if(!q.broke){q.broke=true;S.ev.push({t,type:'trenca',x:(q.a.x+q.b.x)/2/AR});// the beads of a broken thread go free
    const P=melThreadPts(S,q,t);for(const b of q.beads){const i=Math.min(P.length-1,Math.round(b.u*(P.length-1))),o=P[i],dx=o.x-AR/2,dy=o.y-.5,l=Math.hypot(dx,dy)||1;S.beads.push({x:o.x,y:o.y,vx:dx/l*.03,vy:dy/l*.03,ox:dx/l,oy:dy/l,r:b.r,tl:.6,seed:b.ph/6,t0:t,grow:0,free:true});}q.beads=[];}
   if(t>q.brk+1.5)q.done=true;}
  if(q.a.gone&&q.b.gone)q.done=true;}
 const out=S.role==='surt';for(const b of S.beads){if(t<b.t0)continue;if(out&&b.ox!==undefined){b.vx+=b.ox*.09*dt;b.vy+=b.oy*.09*dt;}else{b.vx*=Math.exp(-.5*dt);b.vy*=Math.exp(-.5*dt);}b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<-.1||b.x>AR+.1||b.y<-.1||b.y>1.1)b.gone=true;}
 S.beads=S.beads.filter(b=>!b.gone);S.threads=S.threads.filter(q=>!q.done);if(S.piles.some(p=>p.gone)&&S.piles.every(p=>p.gone))S.piles=[];S.ribbons=S.ribbons.filter(q=>!(q.out&&t>q.out+3.3));if(S.ev.length>200)S.ev.splice(0,S.ev.length-200);}
// the ropes of a pile: the coil from its oldest turn to the newest and, joined to it, the stream back to the edge it comes from
// (while a new stream is still on its way to the pile, it is a rope of its own). The stream comes down the axis of the pile and,
// close to it, whirls round wider and wider until it lies on the top turn, as a rope of liquid does when it coils.
function melPileRopes(S,p,t){const coil=[],N=Math.min(p.th/6.2832,4.6),q=p.pour,tint=.15+.5*p.tint,on=q&&t>q.t0&&t<q.t1+q.tail,g=on?melEase((t-q.t0)/q.in):0,cut=on&&t>q.t1?melEase((t-q.t1)/q.tail):0;
 // the newest end of the coil is round while no stream is joined to it
 const cap=!on||g<1?1:Math.max(cut,1-(t-q.t0-q.in)/.4);
 if(N>.02){const n=Math.max(2,Math.ceil(N*96)),tl=.1+.5*melEase((N-3.4)/1.2);for(let i=0;i<=n;i++){const s=N*(1-i/n),o=melCoil(p,s,{});o.w*=Math.sqrt(Math.min(1,(N-s)/tl+.003));if(cap>0)o.w*=1-cap*(1-Math.sqrt(Math.min(1,s/.1+.003)));o.tint=tint;coil.push(melPull(p,o,t));}}
 if(!on)return coil.length>1?[coil]:[];
 const Rt=p.Rout*MEL_TOP,h0=p.Rout*1.1,cx=p.x+p.Ax*h0,cy=p.y+p.Ay*h0,dx=q.sx-cx,dy=q.sy-cy,D=Math.hypot(dx,dy)||1,sw=q.side*(.14+.05*Math.sin(t*.5+q.sw))*D;
 const p1x=cx+p.Ax*p.Rout*1.6,p1y=cy+p.Ay*p.Rout*1.6,p2x=q.sx-dx*.4-dy/D*sw,p2y=q.sy-dy*.4+dx/D*sw,M=56,base=[];let len=0;
 for(let i=0;i<=M;i++){const u=i/M,a=1-u,x=a*a*a*cx+3*a*a*u*p1x+3*a*u*u*p2x+u*u*u*q.sx,y=a*a*a*cy+3*a*a*u*p1y+3*a*u*u*p2y+u*u*u*q.sy;if(i)len+=Math.hypot(x-base[i-1].x,y-base[i-1].y);base.push({x,y,d:len});}
 const at=f=>{const i=Math.min(M-1,Math.floor(f));return base[i].d+(base[i+1].d-base[i].d)*(f-i);};
 // sg = length along the rope from the pile; z = how far up the axis that is (the rope leaves the top turn along it, then rises)
 const L=.75*Rt,lam=Rt,zOf=g=>g-.82*L*(1-Math.exp(-g/L)),sOf=z=>{let g=z+.82*L;for(let i=0;i<6;i++)g=z+.82*L*(1-Math.exp(-g/L));return g;};
 // while it comes in, the head runs from the edge to the pile; once the tap closes, the tail runs in after it
 const zA=at((1-g)*M),zB=at((1-cut)*M),sA=zA>0?sOf(zA):0,sB=sOf(zB),w0=p.Rout*MEL_W,v0=p.th*3,joined=g>=1&&coil.length>1,stream=[],K=84;let bi=0;
 for(let j=joined?1:0;j<=K;j++){const sg=sA+(sB-sA)*Math.pow(j/K,1.7),z=Math.min(len,Math.max(0,zOf(sg)));while(bi<M-1&&base[bi+1].d<z)bi++;const A=base[bi],B=base[bi+1],fr=(z-A.d)/Math.max(1e-9,B.d-A.d);
  const r=Rt*Math.exp(-z/lam),th=p.th+.9*L/Rt*(1-Math.exp(-sg/(.9*L))),lx=r*Math.cos(th),ly=p.e*r*Math.sin(th);
  const o={x:A.x+(B.x-A.x)*fr-p.Ay*lx+p.Ax*ly,y:A.y+(B.y-A.y)*fr+p.Ax*lx+p.Ay*ly,w:w0*(1+.14*Math.sin(sg*7+q.sw)*Math.min(1,sg/(4*w0))),v:v0+sg/w0,sh:1,tint};
  if(g<1)o.w*=Math.sqrt(Math.min(1,Math.max(0,sg-sA)/(w0*2.5)+.004));if(cut>0)o.w*=Math.sqrt(Math.min(1,Math.max(0,sB-sg)/(w0*3)+.004));stream.push(melPull(p,o,t));}
 if(joined)return [coil.concat(stream)];return coil.length>1?[coil,stream]:[stream];}
// where a thread holds on to a pile: on the side of its widest turn that faces the other end
function melAnchor(p,ox,oy,t){const N=Math.min(p.th/6.2832,4.6),s=Math.min(N,2.4),k=1-Math.exp(-s/1.7),R=p.Rout*(MEL_TOP+(1-MEL_TOP)*k)*.9,h=p.Rout*1.1*Math.exp(-s/2.1),cx=p.x+p.Ax*h,cy=p.y+p.Ay*h,dx=ox-cx,dy=oy-cy,a=Math.atan2((p.Ax*dx+p.Ay*dy)/p.e,-p.Ay*dx+p.Ax*dy),lx=R*Math.cos(a),ly=p.e*R*Math.sin(a)+h;
 return melPull(p,{x:p.x-p.Ay*lx+p.Ax*ly,y:p.y+p.Ax*lx+p.Ay*ly,w:0},t);}
function melThreadPts(S,q,t){const A=melAnchor(q.a,q.b.x,q.b.y,t),B=melAnchor(q.b,q.a.x,q.a.y,t),dx=B.x-A.x,dy=B.y-A.y,D=Math.hypot(dx,dy)||1,sg=q.sg*(1+.25*Math.sin(t*.4+q.ph))*D,cx=(A.x+B.x)/2-dy/D*sg,cy=(A.y+B.y)/2+dx/D*sg,out=[],M=30;
 for(let i=0;i<=M;i++){const u=i/M,a=1-u;out.push({x:a*a*A.x+2*a*u*cx+u*u*B.x,y:a*a*A.y+2*a*u*cy+u*u*B.y,u});}return out;}
export function melCover(S){const G=48,H=27,c=new Uint8Array(G*H),mark=(x,y,rad)=>{const i0=Math.max(0,Math.floor((x-rad)/S.AR*G)),i1=Math.min(G-1,Math.floor((x+rad)/S.AR*G)),j0=Math.max(0,Math.floor((y-rad)*H)),j1=Math.min(H-1,Math.floor((y+rad)*H));for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)c[j*G+i]=1;};
 for(const p of S.piles){if(p.gone)continue;for(const R of melPileRopes(S,p,S.t))for(const o of R)mark(o.x,o.y,o.w);}for(const q of S.ribbons)for(const o of melRibbonPts(S,q,S.t))mark(o.x,o.y,o.w);for(const q of S.threads)for(const o of melThreadPts(S,q,S.t))mark(o.x,o.y,.004);for(const b of S.beads)mark(b.x,b.y,b.r);let n=0;for(const v of c)n+=v;return n/(G*H);}
export const melEmptyNow=S=>!S.piles.length&&!S.beads.length&&!S.threads.length&&!S.ribbons.length;
const MEL_BUF=new Float32Array(600*20);
export function melDraw(S){const Lq=MEL_LIQUIDS[S.lap%2],U={uSig:Lq.sig,uGlow:Lq.glow,uSpecCol:Lq.spec,uDepth:Lq.depth,uOpac:Lq.opac},t=S.t,d=MEL_BUF;let n=0;
 const bead=(x,y,r,sh,tint,ang,tl,seed,a=1)=>{if(n>=590||r<=0)return;const k=n*20;d.fill(0,k,k+20);d[k]=x;d[k+1]=y;d[k+2]=r;d[k+3]=seed;d[k+4]=a;d[k+5]=sh;d[k+6]=tint;d[k+7]=ang;d[k+8]=tl;n++;};
 for(const q of S.ribbons){const R=melRibbonPts(S,q,t);if(R.length>1)bmbRope(R);}
 for(const q of S.threads){if(t<q.t0)continue;const P=melThreadPts(S,q,t),M=P.length-1,g=Math.min(1,(t-q.t0)/q.dur),gap=q.brk&&t>q.brk?.5*melEase((t-q.brk)/1.5):0,tint=.3;
  const rad=u=>q.r0*(.32+2.2*Math.pow(Math.abs(2*u-1),3.2));
  const seg=(u0,u1)=>{const pts=[];for(const o of P){if(o.u<u0-1e-6||o.u>u1+1e-6)continue;pts.push({x:o.x,y:o.y,w:rad(o.u),v:o.u*40,sh:1,tint,sd:.6});}if(pts.length>1)bmbRope(pts);};
  if(gap>0){seg(0,.5-gap);seg(.5+gap,1);for(const u of [.5-gap,.5+gap]){const o=P[Math.min(M,Math.max(0,Math.round(u*M)))];bead(o.x,o.y,q.r0*2.2*(1+gap),1,tint,0,0,q.ph);}}
  else{seg(0,g);if(g<1){const i=Math.min(M,Math.round(g*M)),o=P[i],b=P[Math.max(0,i-1)];bead(o.x,o.y,q.r0*3.2,1,tint,Math.atan2(b.y-o.y,b.x-o.x),1.2,q.ph);}
   else{const k=melEase((t-q.t0-q.dur)/2.5);for(const b of q.beads){const o=P[Math.min(M,Math.round((b.u+.02*Math.sin(t*.3+b.ph))*M))];bead(o.x,o.y,b.r*k,1,tint,0,0,b.ph);}}}}
 for(const b of S.beads){if(t<b.t0)continue;const k=melEase((t-b.t0)/1.2),sp=Math.hypot(b.vx,b.vy);bead(b.x,b.y,b.r*(b.grow?k:1),1,.3,Math.atan2(-b.vy,-b.vx),Math.min(b.tl,sp*30),b.seed);}
 for(const p of S.piles){if(p.gone)continue;for(const R of melPileRopes(S,p,t))if(R.length>1)bmbRope(R,48);}
 bmbRopes(U);if(n)bmbBodies('bead',d,n,U,'liquid',3.3);}
