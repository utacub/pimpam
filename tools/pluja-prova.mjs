// La nova Pluja de colors (0.53, phase 1): the style trial. Runs the real engine (dist/pluja-gl.js) in Chromium with a fixed sequence
// of drops (a first drop in the middle, then phrases of drops spreading out until the floor is full, then the dilution) and writes
// still frames at the chosen moments, as JPEG files.
// Usage: node tools/pluja-prova.mjs OUTDIR [top] [W H DPR]   (top = seen from above)
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const PLJ_MODULES=['pluja-shaders.js','pluja-gl.js'];
export function pljSource(){const code=PLJ_MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/^export\s+(?=(const|let|function|class)\b)/gm,'');
 return '(()=>{'+code+'\nwindow.PL={PLJ,PLJ_LOOK,pljSetup,pljDrop,pljStep,pljRender,pljDilute,pljCoverage,pljFill,pljScreenToFloor,pljFloorToClip,pljCanvas,pljTime};})();';}
// the trial sequence, press by press, as the activity will do it: before each press the real coverage of the floor is read back
// (pljCoverage) and the phrase is placed where the paint meets the black, so the new drops push the paint outward into it.
// Press 1 = one drop in the middle. Then phrases of 3–6 drops: a target (each drop inside the one before: rings that become bands),
// a chain (each drop half over the one before, along the edge of the paint) or a pair (two centres taking turns). The size of each
// phrase is the black area left divided by the presses left, so the floor is full at the last press; the last press fills the holes.
export function pljPlanner(o={}){const PL=window.PL,V=PL.PLJ.view,G=48,Hs=27,P=o.presses||10;let seed=o.seed||7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const notes=[0,2,4,1,5,3,6,2,0,4,5,1,3,6,2,5];let ni=0;
 const rh=[[0,.35,.7],[0,.3,.6,.9],[0,.4,.6,1],[0,.25,.5,.75,1],[0,.45,.6,.9,1.2],[0,.3,.45,.9,1.05,1.35],[0,.2,.4,.6,.8],[0,.35,.7,.9,1.1,1.4],[0,.3,.6,.9,1.2,1.5]];
 const shapes=['diana','cadena','diana','parella','diana','cadena','diana','parella','cadena'];
 // the floor cells that are on the screen, and each screen cell's floor point
 const S2F=[];for(let j=0;j<Hs;j++)for(let i=0;i<G;i++)S2F.push(PL.pljScreenToFloor(V,(i+.5)/G,(j+.5)/Hs));
 let vis=null;
 function state(){const cv=PL.pljCoverage(5);if(!vis){vis=new Uint8Array(cv.w*cv.h);for(let y=0;y<cv.h;y++)for(let x=0;x<cv.w;x++){const c=PL.pljFloorToClip(V,(x+.5)/cv.w*V.AR,(y+.5)/cv.h,0);vis[y*cv.w+x]=Math.abs(c[0])<=1&&Math.abs(c[1])<=1?1:0;}}
  let black=0,all=0;const ca=V.AR/cv.w/cv.h;for(let i=0;i<cv.w*cv.h;i++)if(vis[i]){all+=ca;if(cv.c[i]<.5)black+=ca*(1-cv.c[i]*2);}
  const sc=new Float32Array(G*Hs);S2F.forEach((f,i)=>{if(!f){sc[i]=1;return;}const x=Math.min(cv.w-1,Math.max(0,Math.floor(f[0]/V.AR*cv.w))),y=Math.min(cv.h-1,Math.max(0,Math.floor(f[1]*cv.h)));sc[i]=cv.c[y*cv.w+x];});
  // what counts is what the eye sees: the black share of the screen (the top rows fade into the dark far away and do not count)
  let bn=0,nn=0;for(let j=TOP;j<Hs;j++)for(let i=0;i<G;i++){if(!S2F[j*G+i])continue;nn++;if(sc[j*G+i]<.5)bn++;}
  return {black,all,sc,bs:bn/Math.max(1,nn),cells:nn};}
 const TOP=3;
 // floor area of one screen cell around cell (i, j)
 const ca=(i,j)=>{const i2=Math.min(G-1,i+1),i1=i2-1,j2=Math.max(0,j-1),j1=j2+1,a=S2F[j*G+i1],b=S2F[j*G+i2],c=S2F[j2*G+i],d=S2F[j1*G+i];if(!a||!b||!c||!d)return 1e-4;return Math.abs(b[0]-a[0])*Math.abs(c[1]-d[1]);};
 function drop(f,R,t0,under){const ink=notes[ni++%notes.length];PL.pljDrop({x:f[0],y:f[1],R:Math.min(.24,Math.max(.022,R)),ink,under,t0,seed:rnd(),size:Math.min(1.6,Math.max(.4,R/.07))});return ink;}
 return function press(k,now){const st=state(),left=P-k,first=k===0,fall=PL.PLJ.look.fall+.05;
  if(first){const jc=Math.floor(.55*Hs),f=S2F[jc*G+G/2];const A=st.cells/P*.5*ca(G/2,jc);drop(f,Math.sqrt(A/Math.PI),now+fall,-1);return {k,bs:st.bs};}
  const far=sc=>{let best=null;for(let j=TOP;j<Hs;j++)for(let i=0;i<G;i++){if(sc[j*G+i]>=.5||!S2F[j*G+i])continue;let d=99;
    for(let q=-10;q<=10;q++)for(let r=-10;r<=10;r++){const ii=i+r,jj=j+q;if(ii<0||jj<0||ii>=G||jj>=Hs)continue;if(sc[jj*G+ii]>=.5){const dd=Math.hypot(r,q);if(dd<d)d=dd;}}
    if(!best||d>best.d)best={d,i,j};}return best;};
  const cellR=(b)=>{const f=S2F[b.j*G+b.i],c=PL.pljFloorToClip(V,f[0],f[1],0);return (b.d+.8)/G*2*V.asp/c[2];};
  const R=rh[(k-1)%rh.length],last=left===1||(left===2&&st.bs<.12);
  if(last){// fill the holes: the black cell farthest from the paint, again and again
   const sc=st.sc.slice(),out=[];for(let n=0;n<10;n++){const best=far(sc);
    if(!best)break;const f=S2F[best.j*G+best.i],Rf=Math.max(.03,Math.min(.2,cellR(best)*1.3));
    drop(f,Rf,now+fall+n*.18,-1);out.push(best);const rs=best.d+1.5;for(let q=-12;q<=12;q++)for(let r=-12;r<=12;r++){const ii=best.i+r,jj=best.j+q;if(ii>=0&&jj>=0&&ii<G&&jj<Hs&&Math.hypot(r,q)<=rs)sc[jj*G+ii]=1;}}
   if(left===1)PL.pljFill(true);return {k,bs:st.bs,holes:out.length};}
  // the anchor: a painted cell at the edge of the paint with much black around it, turning around the middle (golden angle)
  const late=st.bs<.4;let best=late?far(st.sc):null;const ta=k*2.4;if(!best)for(let j=0;j<Hs;j++)for(let i=0;i<G;i++){if(st.sc[j*G+i]<.6||!S2F[j*G+i])continue;let b=0,n=0;
   for(let q=-5;q<=5;q++)for(let r=-5;r<=5;r++){const ii=i+r,jj=j+q;if(ii<0||jj<0||ii>=G||jj>=Hs||r*r+q*q>25)continue;n++;if(st.sc[jj*G+ii]<.4)b++;}
   if(!b)continue;const a=Math.atan2(((j+.5)/Hs-.55)*9/16,(i+.5)/G-.5),da=Math.abs(Math.atan2(Math.sin(a-ta),Math.cos(a-ta)));const sco=b/n-da*.12+rnd()*.15;if(!best||sco>best.s)best={s:sco,i,j};}
  if(!best){for(let j=0;j<Hs&&!best;j++)for(let i=0;i<G;i++)if(st.sc[j*G+i]<.4&&S2F[j*G+i]){best={i,j};break;}}
  if(!best)return {k,black:0};
  const shape=late?(k%2?'diana':'parella'):shapes[(k-1)%shapes.length],A=Math.min(st.bs*st.cells/Math.max(1,left-1)*1.5*ca(best.i,best.j),late?Math.PI*cellR(best)**2*2.2:9),w=R.map((_,n)=>n===0?1.5:.55+.5*rnd()),ws=w.reduce((x,y)=>x+y,0);
  const f0=S2F[best.j*G+best.i];let cen=[0,0],cn=0;st.sc.forEach((v,i)=>{if(v>.6&&S2F[i]){cen[0]+=S2F[i][0];cen[1]+=S2F[i][1];cn++;}});cen=cn?[cen[0]/cn,cen[1]/cn]:f0;
  let out=[f0[0]-cen[0],f0[1]-cen[1]];const ol=Math.hypot(...out)||1;out=[out[0]/ol,out[1]/ol];const tan=[-out[1],out[0]],sg=rnd()<.5?-1:1;
  let cx=f0[0],cy=f0[1],prevR=0,under=-1;const R0=Math.sqrt(A*w[0]/ws/Math.PI);const other=[f0[0]+tan[0]*R0*1.3*sg,f0[1]+tan[1]*R0*1.3*sg];
  for(let n=0;n<R.length;n++){const Rn=Math.sqrt(A*w[n]/ws/Math.PI);let f;
   if(shape==='diana'){f=[cx+(rnd()-.5)*.25*Rn,cy+(rnd()-.5)*.25*Rn];}
   else if(shape==='cadena'){if(n>0){cx+=tan[0]*sg*(prevR*.55+Rn*.35)+out[0]*(rnd()-.5)*.3*Rn;cy+=tan[1]*sg*(prevR*.55+Rn*.35)+out[1]*(rnd()-.5)*.3*Rn;}f=[cx,cy];}
   else{const q=n%2?other:[f0[0],f0[1]];f=[q[0]+(rnd()-.5)*.2*Rn,q[1]+(rnd()-.5)*.2*Rn];}
   f=[Math.min(V.AR-.01,Math.max(.01,f[0])),Math.min(.99,Math.max(.01,f[1]))];
   const ink=drop(f,Rn,now+fall+R[n],n===0?0:under);under=ink;prevR=Rn;}
  return {k,shape,late,bs:+st.bs.toFixed(3),A:+A.toFixed(3)};};}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const [out,mode='persp',W0='1280',H0='720',D0='2']=process.argv.slice(2),W=+W0,H=+H0,dpr=+D0,top=mode==='top';mkdirSync(out,{recursive:true});
 const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:dpr});const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text());});
 await page.setContent('<!doctype html><html><body style="margin:0;background:#000"></body></html>');
 await page.addScriptTag({content:pljSource()});
 await page.addScriptTag({content:'window.pljPlanner='+pljPlanner.toString()+';'});
 const look=process.env.PLJ_LOOK?JSON.parse(process.env.PLJ_LOOK):{};
 const ok=await page.evaluate(([W,H,dpr,top,look])=>{const ok=window.PL.pljSetup(W*dpr,H*dpr,{top,look,dyeH:look.dyeH||864});if(!ok)return false;const cv=window.PL.pljCanvas();cv.style.width=W+'px';cv.style.height=H+'px';cv.id='gl';document.body.appendChild(cv);
  const V=window.PL.PLJ.view;window.press=window.pljPlanner({presses:+(look.presses||10)});window.pressLog=[];window.nextPress=0;return {AR:V.AR,DW:V.DW,DH:V.DH};},[W,H,dpr,top,look]);
 console.log('setup',JSON.stringify(ok));if(!ok){console.log(errors);await browser.close();process.exit(1);}
 const shots=(process.env.PLJ_SHOTS?JSON.parse(process.env.PLJ_SHOTS):[['01_primera_gota',1.05],['02_un_terc',9.6],['03_plena',27.2],['04_dilucio',30.2]]);const dilStart=+(process.env.PLJ_DIL||27.6);
 let t=0;const dt=1/60;const t1=Date.now();
 for(const [name,at] of shots){if(top&&!/plena|terc/.test(name)&&process.env.PLJ_ALL!=='1')continue;
  const ms=await page.evaluate(([t,at,dt,dil,gap,P])=>{const t0=performance.now();let x=t;while(x<at-1e-6){
    if(window.nextPress<P&&x>=.45+gap*window.nextPress-1e-6){window.pressLog.push(window.press(window.nextPress,x));window.nextPress++;}
    window.PL.pljDilute(x>=dil?.66:1,dt);window.PL.pljStep(dt);x+=dt;}window.PL.pljRender();window.PL.PLJ.gl.finish();const lg=window.pressLog.splice(0);return [x,performance.now()-t0,lg,window.PL.PLJ.lost||window.PL.PLJ.gl.isContextLost()];},[t,at,dt,dilStart,+(look.gap||2.6),+(look.presses||10)]);
  for(const l of ms[2])console.log('press',JSON.stringify(l));
  t=ms[0];const buf=await page.screenshot({type:'jpeg',quality:90,timeout:180000});writeFileSync(`${out}/${name}${top?'_des_de_dalt':''}.jpg`,buf);console.log(name,'t',t.toFixed(2),'chunk ms',ms[1].toFixed(0),'lost',ms[3]);}
 console.log('total s',((Date.now()-t1)/1000).toFixed(1));if(errors.length)console.log('ERRORS',errors.slice(0,6));await browser.close();}
