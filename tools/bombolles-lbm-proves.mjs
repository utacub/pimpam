// The liquid solver of Bombolles sense pes (dist/bombolles-lbm.js) against known physics, on the graphics card of a browser.
// Usage: node tools/bombolles-lbm-proves.mjs [laplace,massa,oscil,fusio,iman,rosensweig] [--gpu]   (serves the repository on a free port)
// 1 · Laplace: a drop at rest; the pressure inside minus outside must be σ/R (two dimensions), for several radii.
// 2 · Mass: the amount of each fluid stays the same in a closed (periodic) box.
// 3 · Oscillation: an elliptic drop oscillates with ω² = n(n²−1)σ / ((ρin + ρout) R³) for n = 2 (Rayleigh, 1879; Lamb, 1932, §275,
//     for a cylinder of liquid in another fluid), slightly slower because of viscosity.
// 4 · Merging: two drops that touch become one with the area of both, round.
// 5 · Magnetic field (the ferrofluid): a cylinder of liquid of permeability μ = 1 + χ in a uniform field H0 has inside it the uniform
//     field 2H0/(1 + μ), and outside, on its axis, H0 (1 + K R²/r²) with K = (μ − 1)/(μ + 1) (two dimensions).
// 6 · The normal-field instability (Cowley & Rosensweig, 1967): a flat layer of ferrofluid under a uniform vertical field, perturbed
//     at the critical wavelength λc = 2π√(σ/(Δρ g)); the perturbation grows only above the critical field, M_c² = 2 (1 + 1/μ) √(Δρ g σ)
//     (μ0 = 1, M = χ H inside the layer = χ H0/μ).
// Headless Chromium draws with the processor here (SwiftShader): small boxes only.
import {createRequire} from 'node:module';
import http from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,extname} from 'node:path';
const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=new URL('..',import.meta.url).pathname,want=(process.argv[2]||'laplace,massa,oscil,fusio').split(',');
const server=http.createServer((q,r)=>{const p=join(root,decodeURIComponent(q.url.split('?')[0]));if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(200,{'content-type':'text/html'});r.end('<!doctype html><title>lbm</title>');return;}
 r.writeHead(200,{'content-type':{'.js':'text/javascript','.mjs':'text/javascript'}[extname(p)]||'application/octet-stream'});r.end(readFileSync(p));}).listen(0);
const port=server.address().port;
const browser=await playwright.chromium.launch({args:process.argv.includes('--gpu')?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const page=await browser.newPage();
page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')console.log('[page]',m.text().slice(0,400));});page.on('pageerror',e=>console.log('[page error]',String(e)));
await page.goto(`http://localhost:${port}/`);
const out=await page.evaluate(async want=>{const L=await import('/dist/bombolles-lbm.js');const cv=document.createElement('canvas');const gl=cv.getContext('webgl2');if(!gl||!gl.getExtension('EXT_color_buffer_float'))return {error:'no WebGL2 float'};
 const res={};const N=+(new URLSearchParams(location.search).get('n')||96);
 // the measures of a field U (ux, uy, p*, φ): area, centre, pressures
 const meas=(S,U)=>{let A=0,cx=0,cy=0;for(let j=0;j<S.H;j++)for(let i=0;i<S.W;i++){const f=U[(j*S.W+i)*4+3];A+=f;cx+=f*(i+.5);cy+=f*(j+.5);}cx/=A;cy/=A;return {A,cx,cy};};
 const pres=(S,U,cx,cy,R,xi)=>{const p=S.par;let pi=0,ni=0,po=0,no=0,um=0;for(let j=0;j<S.H;j++)for(let i=0;i<S.W;i++){const k=(j*S.W+i)*4,r=Math.hypot(i+.5-cx,j+.5-cy),phi=U[k+3],rho=p.rhoL+phi*(p.rhoH-p.rhoL),P=U[k+2]*rho/3;um=Math.max(um,Math.hypot(U[k],U[k+1]));
   if(r<R-2*xi){pi+=P;ni++;}else if(r>R+2*xi){po+=P;no++;}}return {dp:pi/ni-po/no,umax:um};};
 const box=o=>L.lbmCreate(gl,{W:N,H:N,per:3,rhoL:.1,rhoH:1,tauL:.1,tauH:.1,xi:4,tauPhi:.5,...o});
 if(want.includes('laplace')||want.includes('massa')){const rows=[];const SIG=.01;for(const R of [10,14,20,28]){const S=box({sigma:SIG});L.lbmPaint(S,[{x:N/2,y:N/2,r:R,phi:1,soft:4}]);
   const U0=L.lbmRead(S),m0=meas(S,U0);L.lbmStep(S,3000);
   // the sound waves of the start ring through the periodic box for long: the pressures are averaged over 16 moments (several periods)
   let dp=0,um=0,m,Re;for(let q=0;q<16;q++){L.lbmStep(S,97);const U=L.lbmRead(S);m=meas(S,U);Re=Math.sqrt(m.A/Math.PI);const pr=pres(S,U,m.cx,m.cy,Re,4);dp+=pr.dp/16;um=Math.max(um,pr.umax);}
   rows.push({R,Reff:+Re.toFixed(2),dp,theory:SIG/Re,ratio:+(dp/(SIG/Re)).toFixed(3),massDrift:+((m.A-m0.A)/m0.A).toExponential(2),umax:+um.toExponential(2)});L.lbmDestroy(S);}
  // the best line through (1/R, Δp): its slope is the surface tension
  let sx=0,sy=0,sxx=0,sxy=0;for(const r of rows){const x=1/r.Reff;sx+=x;sy+=r.dp;sxx+=x*x;sxy+=x*r.dp;}const n=rows.length,slope=(n*sxy-sx*sy)/(n*sxx-sx*sx),icpt=(sy-slope*sx)/n;
  res.laplace={rows,sigmaSet:SIG,sigmaFit:slope,intercept:icpt};}
 if(want.includes('oscil')){const R=24,eps=.15,sig=.01,S=box({sigma:sig,tauL:.05,tauH:.05});L.lbmPaint(S,[{x:N/2,y:N/2,rx:R*(1+eps),ry:R/(1+eps),phi:1,soft:4}]);
  const series=[];for(let k=0;k<=160;k++){if(k)L.lbmStep(S,50);const U=L.lbmRead(S);const m=meas(S,U);
   // the half-widths along x and y through the centre (where φ crosses ½, interpolated)
   const half=(dx,dy)=>{let prev=1,r=0;for(let s=0;s<N/2;s+=.5){const i=Math.floor(m.cx+dx*s),j=Math.floor(m.cy+dy*s);const f=U[(((j%N)+N)%N*N+((i%N)+N)%N)*4+3];if(f<.5){r=s-.5*(.5-f)/Math.max(1e-6,prev-f);break;}prev=f;}return r;};
   series.push([k*50,half(1,0)-half(0,1)]);}
  // the period: the times the deformation crosses zero
  const z=[];for(let i=1;i<series.length;i++){const [t0,a]=series[i-1],[t1,b]=series[i];if(a>0!==b>0)z.push(t0+(t1-t0)*a/(a-b));}
  const T=z.length>=3?2*(z[z.length-1]-z[0])/(z.length-1):NaN,Re=Math.sqrt(meas(S,L.lbmRead(S)).A/Math.PI),w2=6*sig/((1+.1)*Re**3),Tth=2*Math.PI/Math.sqrt(w2);
  res.oscil={R:Re,Tsim:T,Ttheory:Tth,ratio:T/Tth,crossings:z.map(x=>Math.round(x)),amp:series.filter((_,i)=>i%8===0).map(([t,d])=>[t,+d.toFixed(2)])};L.lbmDestroy(S);}
 if(want.includes('fusio')){const S=box({sigma:.008});const R=16;L.lbmPaint(S,[{x:N/2-R-1,y:N/2,r:R,phi:1,soft:4},{x:N/2+R+1,y:N/2,r:R,phi:1,soft:4}]);const A0=meas(S,L.lbmRead(S)).A;
  const snaps=[];for(let k=0;k<6;k++){L.lbmStep(S,2000);const U=L.lbmRead(S),m=meas(S,U);let w=0,h=0;for(let i=0;i<N;i++){if(U[((Math.round(m.cy))*N+i)*4+3]>.5)w++;if(U[(i*N+Math.round(m.cx))*4+3]>.5)h++;}snaps.push({step:(k+1)*2000,width:w,height:h,area:+m.A.toFixed(1)});}
  res.fusio={A0:+A0.toFixed(1),snaps,expectRadius:+Math.sqrt(A0/Math.PI).toFixed(2)};L.lbmDestroy(S);}
 if(want.includes('iman')){const rows=[];for(const chi of [1,2]){const M=128,R=12,S=L.lbmCreate(gl,{W:M,H:M,rhoL:.1,rhoH:1,tauL:.1,tauH:.1,sigma:.01,xi:3,tauPhi:.2});
   L.lbmPaint(S,[{x:M/2,y:M/2,r:R,phi:1,soft:3}]);L.lbmStep(S,1);const H0=.1,mu=1+chi,K=(mu-1)/(mu+1);L.lbmMagnet(S,[],{H:[0,H0],chi,sweeps:3000});
   const F=new Float32Array(M*M*4);gl.bindFramebuffer(gl.FRAMEBUFFER,S.mag.fF);gl.readPixels(0,0,M,M,gl.RGBA,gl.FLOAT,F);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
   let hi=0,n=0;for(let j=0;j<M;j++)for(let i=0;i<M;i++){if(Math.hypot(i+.5-M/2,j+.5-M/2)<R-4){hi+=F[(j*M+i)*4+3];n++;}}
   const r=R+8,above=F[((M/2+r)*M+M/2)*4+3]/H0,ra=Math.hypot(.5,r+.5);
   rows.push({chi,Hin:+(hi/n/H0).toFixed(4),theory:+(2/(1+mu)).toFixed(4),ratio:+((hi/n/H0)/(2/(1+mu))).toFixed(4),above:+above.toFixed(4),aboveTheory:+(1+K*R*R/(ra*ra)).toFixed(4)});L.lbmDestroy(S);}
  res.iman=rows;}
 if(want.includes('rosensweig')){const sig=.02,g=2.9e-4,rl=.1,rh=1,chi=2,mu=1+chi,dr=rh-rl,lc=Math.sqrt(sig/(dr*g)),W=Math.round(2*Math.PI*lc),Hh=128,y0=56;
  const Mc=Math.sqrt(2*(1+1/mu)*Math.sqrt(dr*g*sig)),Hc=Mc/chi*mu,rows=[];
  for(const f of [.8,.9,1,1.1,1.25]){const S=L.lbmCreate(gl,{W,H:Hh,per:1,wall:12,rhoL:rl,rhoH:rh,tauL:.06,tauH:.1,sigma:sig,xi:3,tauPhi:.2});S.grav=g;
   L.lbmPaint(S,[{x:W/2,y:y0-2000,rx:W*40,ry:2000,phi:1,soft:3}]);L.lbmPaint(S,[{x:W/2,y:y0,rx:W*.3,ry:3,phi:1,soft:2},{x:0,y:y0,rx:W*.3,ry:3,phi:0,soft:2},{x:W,y:y0,rx:W*.3,ry:3,phi:0,soft:2}]);
   L.lbmStep(S,1);L.lbmMagnet(S,[],{H:[0,f*Hc],chi,sweeps:1500});
   // the height of the surface in each column (φ = ½), and its first Fourier mode
   const amp=()=>{const U=L.lbmRead(S);let re=0,im=0;for(let i=0;i<W;i++){let h=0;for(let j=1;j<Hh;j++){const a=U[((j-1)*W+i)*4+3],b=U[(j*W+i)*4+3];if(a>=.5&&b<.5){h=j-.5+(a-.5)/(a-b);break;}}const th=2*Math.PI*(i+.5)/W;re+=h*Math.cos(th);im+=h*Math.sin(th);}return 2*Math.hypot(re,im)/W;};
   const series=[[0,amp()]];for(let k=1;k<=24;k++){for(let q=0;q<100;q++){L.lbmMagnet(S,[],{H:[0,f*Hc],chi,sweeps:2});L.lbmStep(S,2);}series.push([k*200,amp()]);}
   rows.push({HoverHc:f,amp:series.filter((_,i)=>i%2===0).map(([t,a])=>[t,+a.toFixed(2)])});L.lbmDestroy(S);}
  res.rosensweig={W,lc:+lc.toFixed(2),Hc:+Hc.toFixed(4),rows};}
 return res;},want);
console.log(JSON.stringify(out,null,1));await browser.close();server.close();
