// Bombolles sense pes · checks of the «Plasma» solver (0.69), in Node (no drawing): node tools/bombolles-plasma-proves.mjs [coaxial|fractal]
// coaxial: Laplace's equation between a disc at φ = 1 (radius r0) and a grounded circle (radius R), solved by the same red-black
//   over-relaxation as the stimulus, against φ(r) = ln(r/R) / ln(r0/R).
// fractal: a discharge grown from one cell at φ = 1 inside a grounded circle with η = 1 and no threshold (the dielectric breakdown model
//   of Niemeyer, Pietronero & Wiesmann, 1984, who found D ≈ 1.75), one bond for each solution and, as in the stimulus, several; its
//   fractal dimension by the mass inside a radius r against r, N(r) ∝ r^D.
import {plaGrid,plaSolve,plaTree,plaPool,plaPick,plaAdd} from '../dist/bombolles-plasma.js';
import {bmbRandom} from '../dist/bombolles-motor.js';
const which=process.argv[2]||'all';
// a square grid with a grounded circle of radius R around its centre
function disc(N,R){const g=plaGrid(N,N),c=N/2;for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(Math.hypot(i+.5-c,j+.5-c)>=R){g.kind[j*N+i]=3;g.phi[j*N+i]=0;}return {g,c};}
if(which==='all'||which==='coaxial'){const N=181,R=80,r0=4.5,{g,c}=disc(N,R);const e=plaTree(g,{id:0,sign:1,V:1,cx:c,cy:c,r:r0});
 const t0=performance.now();plaSolve(g,3000,1.95);let worst=0;const rows=[];
 for(const r of [8,12,20,30,45,60,70]){let s=0,n=0;for(let a=0;a<64;a++){const x=c+r*Math.cos(a/64*2*Math.PI),y=c+r*Math.sin(a/64*2*Math.PI),i=Math.floor(x-.5),j=Math.floor(y-.5),fx=x-.5-i,fy=y-.5-j;
   const p=k=>g.phi[k];const k=j*N+i;s+=p(k)*(1-fx)*(1-fy)+p(k+1)*fx*(1-fy)+p(k+N)*(1-fx)*fy+p(k+N+1)*fx*fy;n++;}
  const sim=s/n,th=Math.log(r/R)/Math.log(r0/R),err=Math.abs(sim-th);worst=Math.max(worst,err);rows.push(`r ${r}: φ ${sim.toFixed(4)} (theory ${th.toFixed(4)})`);}
 console.log(`coaxial (${e.disc.length} cells in the disc, ${(performance.now()-t0).toFixed(0)} ms):\n  ${rows.join('\n  ')}\n  largest difference ${worst.toFixed(4)} (of a potential 1)`);}
if(which==='all'||which==='fractal'){const ph={Ec:0,eta:1,Es:0,dV:.3};
 const grow=(seed,batch,sweeps)=>{const N=201,R=96,{g,c}=disc(N,R),r=bmbRandom(seed),e=plaTree(g,{id:0,sign:1,V:1,cx:c,cy:c,r:.5});e.grow=true;const c0=e.disc[0];
  plaSolve(g,400,1.94);let rmax=0,done=false;
  while(!done&&rmax<.62*R){const P=plaPool(g,[e],ph);if(!P.n)break;const used=new Set();
   for(let q=0;q<batch&&!done;q++){const i=plaPick(P,r());const t=P.to[i];if(used.has(t)||g.kind[t])continue;used.add(t);const d=t-P.from[i],len=Math.abs(d)===1||Math.abs(d)===N?1:Math.SQRT2;
    if(plaAdd(g,e,P.from[i],t,ph,len))done=true;const x=t%N+.5-c,y=Math.floor(t/N)+.5-c;rmax=Math.max(rmax,Math.hypot(x,y));}
   plaSolve(g,sweeps,1.9);}
  // mass against radius, between 5 cells and half the radius reached
  const d=e.cells.map(k=>Math.hypot(k%N+.5-c,Math.floor(k/N)+.5-c)),xs=[],ys=[];for(let rr=5;rr<=rmax*.55;rr*=1.12){xs.push(Math.log(rr));ys.push(Math.log(d.filter(v=>v<=rr).length+1));}
  const n=xs.length,mx=xs.reduce((a,b)=>a+b)/n,my=ys.reduce((a,b)=>a+b)/n;let sxy=0,sxx=0;for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;}
  return {D:sxy/sxx,cells:e.cells.length,rmax};};
 for(const [label,batch,sweeps] of [['one bond for each solution (the model)',1,24],['ten bonds for each solution (as in the stimulus)',10,12]]){const t0=performance.now(),out=[];
  for(const seed of [3,5,7,9,11])out.push(grow(seed,batch,sweeps));const m=out.reduce((a,b)=>a+b.D,0)/out.length;
  console.log(`fractal, ${label}: D = ${out.map(o=>o.D.toFixed(3)).join(', ')} (mean ${m.toFixed(3)}; ${out.map(o=>o.cells).join(', ')} cells; ${((performance.now()-t0)/1000).toFixed(1)} s)`);}}
