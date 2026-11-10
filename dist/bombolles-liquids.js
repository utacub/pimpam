// Bombolles sense pes · what the liquid matters share (0.64): the box of the solver around the screen, the nozzles, syringes and heaters
// that a press opens outside the screen or inside the matter, the small picture read back from the card (drops, coverage, mergers),
// and the loop that runs the solver inside the drawing of a frame. The matters: aigua, lava, oli, ferro (bombolles-<name>.js).
// Units: the scene runs x ∈ [0, AR], y ∈ [0, 1] from the top; the box runs in cells with y up, the screen inside it after a margin.
import {lbmCreate,lbmStep,lbmPaint,lbmDye,lbmInflate,lbmDownAsk,lbmDownGet} from './bombolles-lbm.js';
// the box of a matter: Hs cells per screen height, a margin (cells) on each side, or [left, right, bottom, top]
export function lqBox(ph,AR){const Hs=ph.Hs,Ws=Math.round(Hs*AR),m=Array.isArray(ph.margin)?ph.margin:[ph.margin,ph.margin,ph.margin,ph.margin];
 return {Hs,Ws,mx:m[0],my:m[2],W:Ws+m[0]+m[1],H:Hs+m[2]+m[3],sim:null,simT:0,due:0,acts:[],mom:[0,0],blobs:[],nBlobs:0,ask:0,cover:0,vis:0,thrust:null,outT:null};}
// scene → cells
export const lqCell=(S,x,y)=>[S.mx+x*S.Hs,S.my+(1-y)*S.Hs];
export const lqScrX=(S,cx)=>Math.max(0,Math.min(1,(cx-S.mx)/S.Ws));
// a nozzle outside the screen at edge e (0 left, 1 top, 2 right, 3 bottom), at u along that edge (0–1, left to right / top to bottom),
// aimed at a cell. It pours phase o.phi (1 the liquid of the matter, 0 the other one) and/or dye o.dye for o.dur seconds, at a speed
// that falls from U to (1 − taper) U; then it closes (the liquid in its mouth goes back little by little).
export function lqNozzle(S,e,u,target,o={}){const gx=S.mx*.55,gy=S.my*.55,x=e===0?gx:e===2?S.W-(S.W-S.mx-S.Ws)*.55:S.mx+u*S.Ws,y=e===1?S.H-(S.H-S.my-S.Hs)*.55:e===3?gy:S.my+(1-u)*S.Hs;
 const dx=target[0]-x,dy=target[1]-y,L=Math.hypot(dx,dy)||1,U=o.U??.07,t0=S.simT+(o.delay||0),dur=o.dur??3,taper=o.taper??.7;
 S.acts.push({kind:'nozzle',t0,t1:t0+dur,x,y,ux:dx/L,uy:dy/L,U,taper,r:(o.r??13)*S.Hs/180,phi:o.phi??1,dye:o.dye||null,ev:false,e});
 // the momentum given (the mean speed of a squirt that slows down)
 const mean=U*(1-taper/2);S.mom[0]+=dx/L*mean*dur;S.mom[1]+=dy/L*mean*dur;}
// a syringe: a little liquid with dye `col` ([r, g, b, a]) pushed into the drop b (from the small picture), towards its middle
export function lqSyringe(S,b,col,o={}){const r=S.rnd,a=r()*6.283,R=Math.sqrt(b.A/Math.PI),x=b.x+Math.cos(a)*R*.55,y=b.y+Math.sin(a)*R*.55,t0=S.simT+(o.delay||0);
 S.acts.push({kind:'syringe',t0,t1:t0+(o.dur??.55),x,y,ux:-Math.cos(a+(r()-.5)*.6),uy:-Math.sin(a+(r()-.5)*.6),U:o.U??.045,r:Math.max(3,Math.min(6,R*.12)),col,ev:false});}
// a hole in the plate of a Hele-Shaw cell (the oil): liquid o.phi with dye `col` pushed in at pressure p for o.dur seconds; the
// pressure is set only in the inner half of the hole, so that what flows out of it is all new liquid (a source where the phase is
// not kept would dilute it)
export function lqHole(S,x,y,col,o={}){const t0=S.simT+(o.delay||0);S.acts.push({kind:'hole',t0,t1:t0+(o.dur??2.6),x,y,r:(o.r??12)*S.Hs/160,p:o.p??.15,phi:o.phi??1,col,ev:false});}
// a puff: a short push of the fluid itself through a slot outside the screen at edge e (as lqNozzle), with smoke `col`: the speed
// rises and falls as a half sine over o.dur seconds (a piston), and nothing is added or taken. The edges of the slot shed vorticity
// that rolls up into a pair of vortices (the section of a smoke ring), which then travels by itself
export function lqPuff(S,e,u,target,o={}){const gx=S.mx*.5,x=e===0?gx:e===2?S.W-(S.W-S.mx-S.Ws)*.5:S.mx+u*S.Ws,y=e===1?S.H-(S.H-S.my-S.Hs)*.5:e===3?S.my*.5:S.my+(1-u)*S.Hs;
 const dx=target[0]-x,dy=target[1]-y,L=Math.hypot(dx,dy)||1,t0=S.simT+(o.delay||0);
 S.acts.push({kind:'puff',t0,t1:t0+(o.dur??.45),x,y,ux:dx/L,uy:dy/L,U:o.U??.11,r:(o.r??10)*S.Hs/160,col:o.col,ev:false,e});}
// the drops seen on the screen, the biggest first; the emptiest place of the screen (cells)
export const lqBig=S=>S.blobs.filter(b=>b.vis).sort((a,b)=>b.A-a.A);
export function lqGap(S){let best=null;for(let j=0;j<5;j++)for(let i=0;i<9;i++){const x=S.mx+(i+.5)/9*S.Ws,y=S.my+(j+.5)/5*S.Hs;let c=1e9;for(const b of S.blobs)c=Math.min(c,Math.hypot(x-b.x,y-b.y)-Math.sqrt(b.A/Math.PI));c+=S.rnd()*8;if(!best||c>best.c)best={c,x,y};}return best;}
// the edge whose nozzle brings the total momentum back towards zero
export const lqEdge=S=>Math.abs(S.mom[0])>Math.abs(S.mom[1])*1.4?(S.mom[0]>0?2:0):(S.mom[1]>0?1:3);
// the events of the actions that start (sounds), and the actions that are over
export function lqEvents(S){for(const a of S.acts)if(!a.ev&&S.simT>=a.t0){a.ev=true;if(a.kind==='nozzle'||a.kind==='hole')S.ev.push({t:S.t,type:'raig',x:lqScrX(S,a.x)});else if(a.kind==='puff')S.ev.push({t:S.t,type:'anell',x:lqScrX(S,a.x)});}
 S.acts=S.acts.filter(a=>S.simT<a.t1+.5);if(S.ev.length>60)S.ev.splice(0,S.ev.length-60);}
// what the actions paint at this moment: {out (phase and velocity), dye}
export function lqShapes(S){const out=[],dye=[],T=S.simT;
 for(const a of S.acts){if(T<a.t0)continue;const ang=Math.atan2(a.uy,a.ux);
  if(a.kind==='nozzle'){if(T<a.t1){const s=(T-a.t0)/(a.t1-a.t0),U=a.U*(1-a.taper*s);out.push({x:a.x,y:a.y,rx:a.r*1.5,ry:a.r,angle:ang,phi:a.phi,ux:a.ux*U,uy:a.uy*U,vel:'set',k:1,soft:4});
    if(a.dye)dye.push({x:a.x,y:a.y,rx:a.r*1.4,ry:a.r*.9,angle:ang,k:1,soft:2,dye:a.dye});}
   // the nozzle closes: what is in its mouth goes back into it little by little (an abrupt cut would make an interface thinner than
   // the solver allows, and it blew up)
   else if(T<a.t1+.4&&a.phi===1)out.push({x:a.x,y:a.y,rx:a.r*1.4,ry:a.r*1.15,angle:ang,phi:0,ux:0,uy:0,vel:'set',k:.1,soft:5});
   else if(T<a.t1+.4)out.push({x:a.x,y:a.y,rx:a.r*1.4,ry:a.r*1.15,angle:ang,ux:0,uy:0,vel:'set',k:.1,soft:5});}
  // a hole: the pressure comes up in 0.3 s and stays while it is open; then the hole is shut and the pressure left in it dies away
  else if(a.kind==='hole'&&T<a.t1){const ramp=Math.min(1,(T-a.t0)/.3);out.push({x:a.x,y:a.y,r:a.r,phi:a.phi,k:1,soft:2},{x:a.x,y:a.y,r:a.r*.5,p:a.p*ramp,k:.5,soft:2});dye.push({x:a.x,y:a.y,r:a.r*1.6,k:1,soft:2,dye:a.col});}
  else if(a.kind==='puff'&&T<a.t1){const s=Math.sin(Math.PI*(T-a.t0)/(a.t1-a.t0)),U=a.U*s;out.push({x:a.x,y:a.y,rx:a.r*1.3,ry:a.r,angle:ang,ux:a.ux*U,uy:a.uy*U,vel:'set',k:1,soft:3});
   if(a.col)dye.push({x:a.x,y:a.y,rx:a.r*1.3,ry:a.r*.95,angle:ang,k:1,soft:2.5,dye:a.col});}
  else if(a.kind==='syringe'&&T<a.t1){out.push({x:a.x,y:a.y,r:a.r,ux:a.ux*a.U,uy:a.uy*a.U,vel:'set',k:.5,soft:2});dye.push({x:a.x,y:a.y,r:a.r*.9,k:1,soft:1,dye:a.col});}}
 return {out,dye};}
// the way out by an acceleration of the whole room towards edge `side` (0 left, 1 top, 2 right, 3 bottom), its speed kept under vmax
export function lqThrustStart(S,side,ph,secs=8,screens=1.3){const T=secs*ph.sps;S.thrust={t0:S.simT,side,a:2*screens*(side%2?S.Hs:S.Ws)/(T*T)};S.outT=S.t;}
export function lqThrust(S,ph,vmax=.09){const f=S.thrust;if(!f)return [0,0];const st=(S.simT-f.t0)*ph.sps,a=st*f.a<vmax?f.a:0,d=[[-1,0],[0,1],[1,0],[0,-1]][f.side];return [d[0]*a,d[1]*a];}
// the small picture (block means of φ): drops (connected blocks with φ > thr), coverage of the screen, the amount on it; a drop fewer
// is a merger (event 'fusio'), one more a break-up ('trenca')
export function lqRead(S,D,thr=.4){const {w,h,data}=D,bw=S.W/w,bh=S.H/h,seen=new Int32Array(w*h).fill(-1),blobs=[];let cov=0,vis=0,tot=0;
 const inScr=(i,j)=>{const x=(i+.5)*bw,y=(j+.5)*bh;return x>S.mx&&x<S.mx+S.Ws&&y>S.my&&y<S.my+S.Hs;};
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const v=data[(j*w+i)*4];if(inScr(i,j)){tot++;if(v>thr)cov++;vis+=v;}}
 for(let s=0;s<w*h;s++){if(seen[s]>=0||data[s*4]<=thr)continue;const st=[s];seen[s]=blobs.length;let A=0,x=0,y=0,v=false;
  while(st.length){const q=st.pop(),i=q%w,j=(q-i)/w,f=data[q*4];A+=f;x+=f*(i+.5);y+=f*(j+.5);if(inScr(i,j))v=true;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=w||b>=h)continue;const p=b*w+a;if(seen[p]<0&&data[p*4]>thr){seen[p]=blobs.length;st.push(p);}}}
  blobs.push({x:x/A*bw,y:y/A*bh,A:A*bw*bh,vis:v});}
 const vb=blobs.filter(b=>b.vis&&b.A>40).sort((a,b)=>b.A-a.A),n=vb.length;
 if(S.role!=='surt'&&vb[0]){if(n<S.nBlobs)S.ev.push({t:S.t,type:'fusio',x:lqScrX(S,vb[0].x)});else if(n>S.nBlobs&&S.nBlobs>0)S.ev.push({t:S.t,type:'trenca',x:lqScrX(S,vb[n-1].x)});}
 S.nBlobs=n;S.blobs=blobs;S.cover=tot?cov/tot:0;S.vis=vis*bw*bh;}
// one frame of the solver: the steps that the elapsed time asks for (at most ph.maxSteps: a slow card runs the matter slower, never
// jerkily), painting the actions every ph.chunk steps; then the dyes, the thickness, and the small picture every eighth of a second.
// make(): creates the box; each(S, sim, k): what the matter does before each chunk of k steps (its own forces).
export function lqRun(S,ph,make,each){if(S.sim?.dead)S.sim=null;if(!S.sim){S.sim=make();S.due=0;}const sim=S.sim;
 const n=Math.min(ph.maxSteps,Math.round(S.due*ph.sps));S.due=Math.max(0,S.due-n/ph.sps);if(S.due>2/60)S.due=0;
 let done=0;const dyeQ=[];while(done<n){const k=Math.min(ph.chunk,n-done),sh=lqShapes(S);if(sh.out.length)lbmPaint(sim,sh.out);dyeQ.push(...sh.dye);each?.(S,sim,k);lbmStep(sim,k);done+=k;S.simT+=k/ph.sps;lqEvents(S);}
 lbmDye(sim,n,ph.dyeFade??1,dyeQ.slice(-8));if(sim.inf)lbmInflate(sim,n,n?18:4);
 if(S.t-S.ask>.12){const D=lbmDownGet(sim);if(D)lqRead(S,D,ph.thr??.4);if(lbmDownAsk(sim,6,6))S.ask=S.t;}
 return sim;}
// the clock of a matter: with a graphics card the solver runs inside the drawing (S.due); without one, the actions still happen in time
export function lqStep(S,dt){S.t+=dt;if(S.sim)S.due=Math.min(S.due+dt,.25);else{S.simT+=dt;lqEvents(S);}}
// a box for a matter: the solver with its physical numbers, the dye picture at twice the size, the thickness
export const lqMake=(gl,S,ph,extra={})=>lbmCreate(gl,{slot:'bombolles',W:S.W,H:S.H,rhoL:ph.rhoL,rhoH:ph.rhoH,tauL:ph.tauL,tauH:ph.tauH,sigma:ph.sigma,xi:ph.xi,tauPhi:ph.tauPhi,dye:{w:S.W*2,h:S.H*2},inflate:true,...extra});
