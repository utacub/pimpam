// Review tool for the stage stories (0.14): plays whole rounds as the activity does and reports frames where much more of the picture
// changes at once than in the frames just before, i.e. something that appears or vanishes instead of moving or fading. Presses come
// in two ways, in turn: after the press has ended and a short rest, and before it has ended (the press is cut short and its entry
// must go on instead of jumping). Steady motion (snow, fireflies) is not reported; a run of reports in a row usually is fast motion.
// Usage: node tools/stage-continuity.mjs orquestra|constel [first round] [rounds] [steps 3|5|7]
import {openStage} from './stage-frames.mjs';
const [kind='constel',...rest]=process.argv.slice(2),[first=0,rounds=3,steps=7]=rest.map(Number),[W,H]=[320,180];
const {browser,page,errors}=await openStage(W,H);
const res=await page.evaluate(([kind,first,rounds,steps,W,H])=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),draw=kind==='orquestra'?ST.drawOrquestra:ST.drawConstel,stepMin=kind==='orquestra'?ST.OQ_STEP_MIN:ST.SK_STEP_MIN,finMin=kind==='orquestra'?ST.OQ_FINAL_MIN:ST.SK_FINAL_MIN;
 // The presses: every other one comes at 55 % of the press before it (cut short), the others after it has ended and 1.2 s of rest.
 const presses=[];let T=1;for(let r=0;r<rounds;r++)for(let count=1;count<=steps;count++){const D=count===steps?finMin:stepMin,prev=presses[presses.length-1],quick=presses.length%2===1&&prev&&prev.count<steps;
  const start=prev?(quick?prev.start+prev.D*.55:prev.start+prev.D+1.2):T;presses.push({variant:first+r,count,D,start,held:quick?prev.D*.55:1e3});}
 const end=presses[presses.length-1].start+presses[presses.length-1].D+1.5,out=[],hist=[];let prev=null;
 for(let f=0;f*1/30<end;f++){const T=f/30;let o={variant:first,count:0,steps,t:1e3,idle:T};
  for(let i=0;i<presses.length;i++){const p=presses[i];if(T<p.start)break;const t=T-p.start;
   o=t>=p.D?{variant:p.variant,count:p.count===steps?0:p.count,steps,t:1e3,duration:p.D,held:1e3,idle:T}:{variant:p.variant,count:p.count,steps,t,duration:p.D,held:p.held,from:p.count===1&&i?presses[i-1].variant:undefined,idle:T};}
  c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,W,H);draw(c,W,H,o);const img=c.getImageData(0,0,W,H).data;
  if(prev){let big=0;for(let j=0;j<img.length;j+=4)if(Math.abs(img[j]-prev[j])+Math.abs(img[j+1]-prev[j+1])+Math.abs(img[j+2]-prev[j+2])>60)big++;big=100*big/(W*H);
   const med=hist.length?hist.slice().sort((a,b)=>a-b)[hist.length>>1]:0;if(big>1&&big>3*med+.5)out.push(`round ${o.variant} press ${o.count} t=${o.t>=1e3?'rest':o.t.toFixed(2)} (T=${T.toFixed(2)}): ${big.toFixed(1)}% of the picture changed (usually ${med.toFixed(1)}%)`);
   hist.push(big);if(hist.length>12)hist.shift();}
  prev=img;}
 return out;},[kind,first,rounds,steps,W,H]);
console.log(`${kind}: rounds ${first}–${first+rounds-1}, ${steps} presses: ${res.length} frames to look at`);if(res.length)console.log(res.join('\n'));if(errors.length)console.log(errors.join('\n'));
await browser.close();
