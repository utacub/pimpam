// Review tool for Dia rere dia (CE09): plays whole days of presses as the activity does (each press held for a given time) and reports
// frames where much more of the picture changes at once than in the frames just before, i.e. something that appears or vanishes
// instead of moving or fading. Steady motion (rain, drifting clouds) is not reported; a run of reports in a row usually is fast motion.
// Usage: node tools/dia-continuity.mjs [moments 8|4|2] [days] [seconds per press]
import {openDia} from './dia-frames.mjs';
const [n=8,days=5,hold=9]=process.argv.slice(2).map(Number),[W,H]=[320,180];
const {browser,page,errors}=await openDia(W,H);
const res=await page.evaluate(([n,days,hold,W,H])=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),stops=D.diaStops(n),out=[],hist=[];let prev=null,from=D.diaStart(n);
 for(let k=0;k<n*days;k++){const target=D.diaNext(from,n);
  for(let i=0;i<=hold*30;i++){const t=i/30,phi=D.diaPhase(from,target,t);paint({phi,target,t,idle:10+k*hold+t,quality:1,stops,prev:k?from:undefined,held:hold});const img=c.getImageData(0,0,W,H).data;
   if(prev){let big=0;for(let j=0;j<img.length;j+=4)if(Math.abs(img[j]-prev[j])+Math.abs(img[j+1]-prev[j+1])+Math.abs(img[j+2]-prev[j+2])>60)big++;big=100*big/(W*H);
    const med=hist.length?hist.slice().sort((a,b)=>a-b)[hist.length>>1]:0;if(big>1&&big>3*med+.5)out.push(`press ${k+1} (target ${target}) t=${t.toFixed(2)} phi=${phi.toFixed(3)}: ${big.toFixed(1)}% of the picture changed (usually ${med.toFixed(1)}%)`);
    hist.push(big);if(hist.length>12)hist.shift();}
   prev=img;}
  from=target;}
 return out;},[n,days,hold,W,H]);
console.log(`${n} moments, ${days} days, ${hold} s a press: ${res.length} frames to look at`);if(res.length)console.log(res.join('\n'));if(errors.length)console.log(errors.join('\n'));
await browser.close();
