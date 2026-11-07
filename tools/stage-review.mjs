// Review video for the stage stories, L'orquestra que es desperta (CE12), El cel de les constel·lacions (CE10) and Fem castells (CE25):
// one or more whole rounds, press after press, with a short rest between presses (as when a person waits before pressing again), and
// the music of each press rendered offline exactly as the app schedules it (recorded instruments of sampler.js).
// Festa de globus (CE27, 0.20), El mag desastrós (CE29, 0.21) and El cambrer equilibrista (CE31, 0.23) too.
// Usage: node tools/stage-review.mjs orquestra|constel|castells|globus|mag|cambrer <output.mp4> [width] [height] [fps] [first round] [rounds] [steps 3|5|7] [rest]
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {root} from './kaleido-harness.mjs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [kind='constel',out='stage.mp4',width='1280',height='720',fpsArg='30',firstArg='0',roundsArg='1',stepsArg='7',restArg='1.5']=process.argv.slice(2);
const W=+width,H=+height,FPS=+fpsArg,LEAD=2,TAIL=2,VOLUME=40,REVIEW_GAIN=4,STEPS=+stepsArg,REST=+restArg;
const MODULES=['kaleido-base.js','glass.js','paper.js','sampler.js','synth.js','escenari.js','orquestra.js','orquestra-art.js','constel.js','constel-art.js','castells.js','castells-gent.js','castells-art.js','globus.js','globus-art.js','mag.js','mag-art.js','cambrer.js','cambrer-art.js'];
const code=MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,drawOrquestra,oqScore,OQ_STEP_MIN,OQ_FINAL_MIN,drawConstel,skScore,SK_STEP_MIN,SK_FINAL_MIN,drawCastells,femScore,FEM_STEP_MIN,FEM_FINAL_MIN,fmBusy,drawGlobus,gbScore,GB_STEP_MIN,GB_FINAL_MIN,drawMag,mgScore,MG_STEP_MIN,MG_FINAL_MIN,drawCambrer,cbScore,CB_STEP_MIN,CB_FINAL_MIN};})();'});
await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
await page.addScriptTag({content:`
window.loadRecorded=()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}});
window.S=k=>k==='orquestra'?{draw:K.drawOrquestra,score:K.oqScore,step:K.OQ_STEP_MIN,fin:K.OQ_FINAL_MIN}:k==='castells'?{draw:K.drawCastells,score:K.femScore,step:K.FEM_STEP_MIN,fin:K.FEM_FINAL_MIN}:k==='globus'?{draw:K.drawGlobus,score:K.gbScore,step:K.GB_STEP_MIN,fin:K.GB_FINAL_MIN}:k==='mag'?{draw:K.drawMag,score:K.mgScore,step:K.MG_STEP_MIN,fin:K.MG_FINAL_MIN}:k==='cambrer'?{draw:K.drawCambrer,score:K.cbScore,step:K.CB_STEP_MIN,fin:K.CB_FINAL_MIN}:{draw:K.drawConstel,score:K.skScore,step:K.SK_STEP_MIN,fin:K.SK_FINAL_MIN};
// The presses in order: round, press, start time and duration; the state of the activity at any time T, as the app keeps it.
window.timeline=(k,first,rounds,steps,rest,lead)=>{const st=S(k),out=[];let T=lead;for(let r=0;r<rounds;r++)for(let count=1;count<=steps;count++){const D=count===steps?st.fin:st.step;out.push({variant:first+r,count,start:T,D});T+=D+rest;}return {presses:out,end:T};};
window.frameAt=(k,T,line,steps)=>{const st=S(k),cv=document.getElementById('c'),c=cv.getContext('2d');let o={variant:line.presses[0].variant,count:0,steps,t:1e3,idle:T};
 for(let i=0;i<line.presses.length;i++){const p=line.presses[i];if(T<p.start)break;const t=T-p.start,prev=line.presses[i-1];
  // After the final the count goes back to 0 and the finished round stays on screen until the next press.
  if(t>=p.D)o={variant:p.variant,count:p.count===steps?0:p.count,steps,t:1e3,duration:p.D,held:1e3,idle:T};
  else o={variant:p.variant,count:p.count,steps,t,duration:p.D,held:1e3,from:p.count===1&&prev?prev.variant:undefined,idle:T};}
 c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);st.draw(c,cv.width,cv.height,o);return cv.toDataURL('image/jpeg',.92);};
window.renderAudio=async(k,line,steps,total,volume,reviewGain)=>{const st=S(k),rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 // Same rule as playPatternAudio in app.js: onsets and lengths are fractions of the press's duration; at its end the group fades over 1.2 s.
 for(const p of line.presses){const synth=K.createSynth(ctx,master);for(const e of st.score(p.variant,p.count,steps,p.D))synth.play(e,p.start+e.at*p.D,Math.min(p.D*e.length,p.D-e.at*p.D));synth.stop(1.2,p.start+p.D);}
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak};};`});
const decoded=await page.evaluate(()=>loadRecorded());if(!decoded)console.warn('No recorded samples decoded: the built-in fallbacks will play.');
const line=await page.evaluate(a=>timeline(...a),[kind,+firstArg,+roundsArg,STEPS,REST,LEAD]),TOTAL=line.end+TAIL,tmp=out+'.frames';
rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});
// Fem castells makes its trencadís between frames; the video starts once the first square is ready (in the app the next square is
// prepared during the round before).
if(kind==='castells'){await page.evaluate(a=>frameAt(...a),[kind,0,line,STEPS]);await page.evaluate(async()=>{for(let i=0;i<1500&&K.fmBusy();i++)await new Promise(r=>setTimeout(r,20));});}
for(let f=0,n=Math.round(TOTAL*FPS);f<n;f++){const url=await page.evaluate(a=>frameAt(...a),[kind,f/FPS,line,STEPS]);writeFileSync(`${tmp}/${String(f).padStart(5,'0')}.jpg`,Buffer.from(url.split(',')[1],'base64'));}
const {wav,peak}=await page.evaluate(a=>renderAudio(...a),[kind,line,STEPS,TOTAL,VOLUME,REVIEW_GAIN]);writeFileSync(`${tmp}/audio.wav`,Buffer.from(wav,'base64'));
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(FPS),'-i',`${tmp}/%05d.jpg`,'-i',`${tmp}/audio.wav`,'-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out]);
// Contact sheet: each press, at 60 % of its duration (the final at 40 %, when the figure or the whole orchestra is there).
const picks=line.presses.map(p=>`${tmp}/${String(Math.round((p.start+p.D*(p.count===STEPS?.4:.6))*FPS)).padStart(5,'0')}.jpg`),cols=Math.min(7,picks.length);
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...picks.flatMap(p=>['-i',p]),'-filter_complex',`${picks.map((_,i)=>`[${i}]scale=320:180[s${i}]`).join(';')};${picks.map((_,i)=>`[s${i}]`).join('')}xstack=inputs=${picks.length}:layout=${picks.map((_,i)=>`${(i%cols)*320}_${Math.floor(i/cols)*180}`).join('|')}`,out.replace(/\.mp4$/,'_tira.jpg')]);
rmSync(tmp,{recursive:true,force:true});await browser.close();
console.log(out,`${line.presses.length} pulsacions, ${TOTAL.toFixed(1)} s, pic a l'app ${(20*Math.log10(peak)).toFixed(1)} dBFS (volum 40 %); còpia de revisió +${(20*Math.log10(REVIEW_GAIN)).toFixed(0)} dB`);
