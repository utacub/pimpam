// Where the time goes when an activity opens (0.40.1): a CPU profile of the built HTML from the click on the card until the loading cover
// lifts (and a few seconds more), totalled by function (self time and time with the functions it calls), plus the long gaps between
// frames. GPU=1 emulates a graphics card (see carrega-mesura.mjs). Usage: [GPU=1] node tools/perfil-obertura.mjs <built.html> <activity id> [width] [height] [dpr] [seconds after the click]
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,ACT,wArg='1280',hArg='720',dArg='1.5',sArg='8']=process.argv.slice(2);
const GPU_ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-gpu-rasterization','--ignore-gpu-blocklist','--enable-accelerated-2d-canvas'];
const browser=await playwright.chromium.launch({args:process.env.GPU==='1'?GPU_ARGS:[]}),page=await browser.newPage({viewport:{width:+wArg,height:+hArg},deviceScaleFactor:+dArg});
await page.addInitScript(()=>{const F=window.__f=[];const tick=t=>{F.push([t,!!document.querySelector('.load-cover:not(.gone)')]);requestAnimationFrame(tick);};requestAnimationFrame(tick);});
await page.goto('file://'+html);await page.waitForTimeout(9000);
const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});await cdp.send('Profiler.start');
const t0=await page.evaluate(id=>{const t=performance.now();document.querySelector(`[data-start="${id}"]`).click();return t;},ACT);
await page.waitForTimeout(+sArg*1000);const {profile}=await cdp.send('Profiler.stop');
const byId=new Map(profile.nodes.map(n=>[n.id,n])),self=new Map(),total=new Map(),parent=new Map();for(const n of profile.nodes)for(const c of n.children||[])parent.set(c,n.id);
const dt=profile.timeDeltas,counts=new Map();profile.samples.forEach((id,i)=>counts.set(id,(counts.get(id)||0)+(dt[i]||0)/1000));
const name=n=>`${n.callFrame.functionName||'(anon)'}`;
for(const [id,ms] of counts){const n=byId.get(id);const k=name(n);self.set(k,(self.get(k)||0)+ms);const seen=new Set();let cur=id;while(cur!=null){const m=byId.get(cur),kk=name(m);if(!seen.has(kk)){seen.add(kk);total.set(kk,(total.get(kk)||0)+ms);}cur=parent.get(cur);}}
const top=(m,n)=>[...m].sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,v])=>`${k} ${Math.round(v)}`).join(' | ');
console.log('SELF',top(self,22));console.log('TOTAL',top(total,40));
const f=await page.evaluate(t0=>{const F=window.__f.filter(([t])=>t>=t0),g=[];let lift=null;for(let i=1;i<F.length;i++){g.push([Math.round(F[i-1][0]-t0),Math.round(F[i][0]-F[i-1][0])]);if(lift===null&&F[i-1][1]&&!F[i][1])lift=Math.round(F[i][0]-t0);}return {lift,gaps:g.filter(x=>x[1]>100)};},t0);
console.log('cover lifted at',f.lift,'ms; gaps over 100 ms',JSON.stringify(f.gaps));await browser.close();
