// The gas solver of Bombolles sense pes (dist/bombolles-gas.js) against known physics, on the graphics card of a browser.
// Usage: node tools/bombolles-gas-proves.mjs [sod,stromgren,sedov,dtipus] [--gpu]   (serves the repository on a free port)
// 1 · Sod's shock tube (γ = 1.4; Sod, 1978): the density along the tube against the exact solution of the Riemann problem (Toro, 2009,
//     chapter 4): mean error, and where the shock, the contact and the rarefaction are.
// 2 · Strömgren: one star in gas of uniform density at rest: the ionised zone is a disc of radius √(2B / (α ρ²)) (in this plane,
//     B = Q / 2π).
// 3 · Sedov–Taylor: energy put into a small disc of cold gas drives a circular blast wave whose radius grows as t^½ (a cylindrical
//     blast: R = ξ (E/ρ)^¼ t^½); the energy in the box stays the same, and the front is round (no grid directions).
// 4 · The expansion of an ionised region (D type): one star switched on in neutral gas; the ionised gas, at Ti, pushes a shell out.
//     In this plane, with the ionised density set by the Strömgren condition (ρi = ρ0 Rs / R), the classical thin-shell estimate
//     (Spitzer, 1978) gives R = Rs (1 + 3 ci t / (2 Rs))^⅔, and keeping the inertia of the shell (as Hosokawa & Inutsuka, 2006) gives
//     the late law R = (3 ci² Rs)^⅓ t^⅔ (ci² = Ti); simulations of the spherical case fall between the two (Bisbas et al., 2015).
// Headless Chromium draws with the processor here (SwiftShader): small boxes only.
import {createRequire} from 'node:module';
import http from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,extname} from 'node:path';
const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=new URL('..',import.meta.url).pathname,want=(process.argv[2]||'sod,stromgren,sedov,dtipus').split(',');
const server=http.createServer((q,r)=>{const p=join(root,decodeURIComponent(q.url.split('?')[0]));if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(200,{'content-type':'text/html'});r.end('<!doctype html><title>gas</title>');return;}
 r.writeHead(200,{'content-type':{'.js':'text/javascript','.mjs':'text/javascript'}[extname(p)]||'application/octet-stream'});r.end(readFileSync(p));}).listen(0);
const browser=await playwright.chromium.launch({args:process.argv.includes('--gpu')?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const page=await browser.newPage();
page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')console.log('[page]',m.text().slice(0,600));});page.on('pageerror',e=>console.log('[page error]',String(e)));
await page.goto(`http://localhost:${server.address().port}/`);
// the exact solution of the Riemann problem for an ideal gas (Toro, 2009, chapter 4): ρ at x/t = s
function exactRiemann(L,R,g){const c=W=>Math.sqrt(g*W.p/W.r);const cl=c(L),cr=c(R);
 const f=(p,W,cK)=>{if(p>W.p){const A=2/((g+1)*W.r),B=(g-1)/(g+1)*W.p,q=Math.sqrt(A/(p+B));return [(p-W.p)*q,q*(1-(p-W.p)/(2*(B+p)))];}
  const pr=p/W.p;return [2*cK/(g-1)*(pr**((g-1)/(2*g))-1),1/(W.r*cK)*pr**(-(g+1)/(2*g))];};
 let p=Math.max(1e-8,.5*(L.p+R.p));for(let i=0;i<100;i++){const [fl,dl]=f(p,L,cl),[fr,dr]=f(p,R,cr),d=(fl+fr+R.u-L.u)/(dl+dr);p=Math.max(1e-8,p-d);if(Math.abs(d)<1e-12)break;}
 const u=.5*(L.u+R.u)+.5*(f(p,R,cr)[0]-f(p,L,cl)[0]);
 return s=>{if(s<u){if(p>L.p){const sh=L.u-cl*Math.sqrt((g+1)/(2*g)*p/L.p+(g-1)/(2*g));return s<sh?L.r:L.r*((p/L.p+(g-1)/(g+1))/((g-1)/(g+1)*p/L.p+1));}
   const head=L.u-cl,cs=cl*(p/L.p)**((g-1)/(2*g)),tail=u-cs;if(s<head)return L.r;if(s>tail)return L.r*(p/L.p)**(1/g);return L.r*(2/(g+1)+(g-1)/((g+1)*cl)*(L.u-s))**(2/(g-1));}
  if(p>R.p){const sh=R.u+cr*Math.sqrt((g+1)/(2*g)*p/R.p+(g-1)/(2*g));return s>sh?R.r:R.r*((p/R.p+(g-1)/(g+1))/((g-1)/(g+1)*p/R.p+1));}
  const head=R.u+cr,cs=cr*(p/R.p)**((g-1)/(2*g)),tail=u+cs;if(s>head)return R.r;if(s<tail)return R.r*(p/R.p)**(1/g);return R.r*(2/(g+1)-(g-1)/((g+1)*cr)*(R.u-s))**(2/(g-1));};}
const res=await page.evaluate(async want=>{const G=await import('/dist/bombolles-gas.js');const cv=document.createElement('canvas');const gl=cv.getContext('webgl2');if(!gl||!gl.getExtension('EXT_color_buffer_float'))return {error:'no WebGL2 float'};
 const out={},OFF={tauH:1e30,tauC:1e30,Tmax:1e30};
 // steps up to time t with the stable step worked out from the whole box (read back: these are tests)
 const smax=(B,g)=>{const U=G.gasRead(B);let m=0;for(let i=0;i<B.W*B.H;i++){const r=U[i*4],u=U[i*4+1]/r,v=U[i*4+2]/r,p=(g-1)*(U[i*4+3]-.5*r*(u*u+v*v));m=Math.max(m,Math.abs(u)+Math.abs(v)+2*Math.sqrt(g*Math.max(p,1e-12)/r));}return m;};
 const run=(B,t,g,each)=>{let n=0;while(B.t<t-1e-9){const dt=Math.min(G.gasMaxDt(smax(B,g),.4),t-B.t);each?.(B);G.gasStep(B,dt);n++;}return n;};
 if(want.includes('sod')){const W=400,H=4,g=1.4,U=new Float32Array(W*H*4);for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=(j*W+i)*4,l=i<W/2;U[k]=l?1:.125;U[k+3]=(l?1:.1)/(g-1);}
  const B=G.gasCreate(gl,{W,H,U,gam:g,edge:0,...OFF});const T=.2*W,n=run(B,T,g);const D=G.gasRead(B);out.sod={W,steps:n,t:T,rho:Array.from({length:W},(_,i)=>D[(1*W+i)*4])};G.gasDestroy(B);}
 if(want.includes('stromgren')){const rows=[];for(const rho of [1,2]){const N=160,alpha=3,Bq=337.5,B=G.gasCreate(gl,{W:N,H:N,rho:new Float32Array(N*N).fill(rho),p0:.7*rho,alpha,Ti:70});
   G.gasLightUp(B,[{x:N/2,y:N/2,B:Bq,on:1}]);const I=G.gasRead(B,'I');let A=0;for(let i=0;i<N*N;i++)A+=I[i*4];rows.push({rho,R:Math.sqrt(A/Math.PI),theory:Math.sqrt(2*Bq/(alpha*rho*rho))});G.gasDestroy(B);}
  out.stromgren=rows;}
 if(want.includes('sedov')){const N=200,g=5/3,E=2e5,B=G.gasCreate(gl,{W:N,H:N,p0:1e-3,gam:g,...OFF});G.gasInject(B,[{x:N/2,y:N/2,r:2.5,E,M:0}]);
  const tot=()=>{const U=G.gasRead(B);let e=0,m=0;for(let i=0;i<N*N;i++){e+=U[i*4+3];m+=U[i*4];}return {e,m};},e0=tot(),rows=[];
  for(const t of [1,2,4,7,10]){run(B,t,g);const U=G.gasRead(B);const rs=[];for(let a=0;a<16;a++){const an=a/16*2*Math.PI;let best=0,bi=0;for(let r=1;r<N/2-1;r+=.5){const i=Math.floor(N/2+Math.cos(an)*r),j=Math.floor(N/2+Math.sin(an)*r),v=U[(j*N+i)*4];if(v>best){best=v;bi=r;}}rs.push(bi);}
   const m=rs.reduce((a,b)=>a+b)/rs.length,sd=Math.sqrt(rs.reduce((a,b)=>a+(b-m)**2,0)/rs.length);const e=tot();rows.push({t,R:m,spread:sd/m,energy:e.e/e0.e,mass:e.m/e0.m,xi:m/((E/1)**.25*Math.sqrt(t))});}
  out.sedov=rows;G.gasDestroy(B);}
 if(want.includes('dtipus')){const N=200,g=5/3,alpha=3,Ti=70,Rs=15,Bq=alpha*Rs*Rs/2,B=G.gasCreate(gl,{W:N,H:N,p0:.7,alpha,Ti,gam:g});const st=[{x:N/2,y:N/2,B:Bq,on:1}],rows=[];
  const U0=G.gasRead(B);let m0=0;for(let i=0;i<N*N;i++)m0+=U0[i*4];
  for(const t of [.5,1,2,3,4,6]){run(B,t,g,B=>G.gasLightUp(B,st));const I=G.gasRead(B,'X'),U=G.gasRead(B);let A=0,m=0;for(let i=0;i<N*N;i++){A+=I[i*4+1]/U[i*4]>.5?1:0;m+=U[i*4];}
   const R=Math.sqrt(A/Math.PI),ci=Math.sqrt(Ti);rows.push({t,R,spitzer:Rs*(1+1.5*ci*t/Rs)**(2/3),hi:(3*ci*ci*Rs)**(1/3)*t**(2/3),mass:m/m0});}
  out.dtipus=rows;G.gasDestroy(B);}
 return out;},want);
if(res.sod){const {W,t,rho}=res.sod,ex=exactRiemann({r:1,u:0,p:1},{r:.125,u:0,p:.1},1.4);let e=0;const cells=[];for(let i=0;i<W;i++){const s=(i+.5-W/2)/t,r=ex(s);e+=Math.abs(rho[i]-r);}
 res.sod={steps:res.sod.steps,L1:e/W,shock:{sim:rho.findLastIndex(r=>r>.2)-W/2,exact:rho.length&&Array.from({length:W},(_,i)=>ex((i+.5-W/2)/t)).findLastIndex(r=>r>.2)-W/2}};}
console.log(JSON.stringify(res,null,1));await browser.close();server.close();
