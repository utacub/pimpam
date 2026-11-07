// Review video for Dia rere dia (CE09): the scene from rest through a series of presses, each one moving the day on to the next moment of
// the chosen set, with the music of each moment rendered offline exactly as the app schedules it (recorded instruments of sampler.js).
// Usage: node tools/dia-review.mjs <output.mp4> [width] [height] [fps] [first press] [presses] [moments 8|4|2] [duration]
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {KALEIDO_MODULES,root} from './kaleido-harness.mjs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [out='dia.mp4',width='1280',height='720',fpsArg='30',firstArg='1',countArg='16',momentsArg='8',durationArg='9']=process.argv.slice(2);
const W=+width,H=+height,FPS=+fpsArg,LEAD=2,TAIL=2,VOLUME=40,REVIEW_GAIN=4,MOMENTS=+momentsArg;
const code=[...KALEIDO_MODULES,'dia.js','dia-art.js'].map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,drawDia,diaScore,diaPhase,diaNext,diaStart,diaStops,DIA_MIN_DURATION};})();'});
await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
await page.addScriptTag({content:`
window.loadRecorded=()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}});
// The presses: the first stop after the rest position, then one stop per press.
window.plan=(first,count,moments)=>{let x=K.diaStart(moments);const all=[];for(let i=0;i<first-1+count;i++){x=K.diaNext(x,moments);all.push(x);}return all.slice(first-1);};
window.frameAt=(T,lead,D,targets,start,moments)=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),i=Math.floor((T-lead)/D);let o;
 if(i<0)o={phi:start,target:start,t:1e3};else{const k=Math.min(i,targets.length-1),t=T-lead-k*D,from=k?targets[k-1]:start;o={phi:K.diaPhase(from,targets[k],t),target:targets[k],t,prev:k?from:undefined,held:D};}
 c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);K.drawDia(c,cv.width,cv.height,{...o,stops:K.diaStops(moments),idle:T,reduced:false});return cv.toDataURL('image/jpeg',.92);};
window.renderAudio=async(targets,lead,D,total,volume,reviewGain)=>{const rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 // Same rule as playPatternAudio in app.js: onsets and lengths are fractions of the effect's duration; at its end the group fades over 1.2 s.
 targets.forEach((target,i)=>{const synth=K.createSynth(ctx,master),t0=lead+i*D;for(const e of K.diaScore(target,D))synth.play(e,t0+e.at*D,Math.min(D*e.length,D-e.at*D));synth.stop(1.2,t0+D);});
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak};};`});
const decoded=await page.evaluate(()=>loadRecorded());if(!decoded)console.warn('No recorded samples decoded: the built-in fallbacks will play.');
const D=Math.max(await page.evaluate(()=>K.DIA_MIN_DURATION),+durationArg),targets=await page.evaluate(([a,b,m])=>plan(a,b,m),[+firstArg,+countArg,MOMENTS]),start=+firstArg>1?targets[0]-1:await page.evaluate(m=>K.diaStart(m),MOMENTS);
const startPos=+firstArg>1?(await page.evaluate(([a,m])=>plan(1,a-1,m),[+firstArg,MOMENTS])).pop():start,TOTAL=LEAD+targets.length*D+TAIL,tmp=out+'.frames';
rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});
for(let f=0,n=Math.round(TOTAL*FPS);f<n;f++){const url=await page.evaluate(a=>frameAt(...a),[f/FPS,LEAD,D,targets,startPos,MOMENTS]);writeFileSync(`${tmp}/${String(f).padStart(5,'0')}.jpg`,Buffer.from(url.split(',')[1],'base64'));}
const {wav,peak}=await page.evaluate(a=>renderAudio(...a),[targets,LEAD,D,TOTAL,VOLUME,REVIEW_GAIN]);writeFileSync(`${tmp}/audio.wav`,Buffer.from(wav,'base64'));
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(FPS),'-i',`${tmp}/%05d.jpg`,'-i',`${tmp}/audio.wav`,'-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out]);
// Contact sheet: each press, a little after the light has arrived.
const picks=targets.map((_,i)=>`${tmp}/${String(Math.round((LEAD+i*D+D*.62)*FPS)).padStart(5,'0')}.jpg`);
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...picks.flatMap(p=>['-i',p]),'-filter_complex',`${picks.map((_,i)=>`[${i}]scale=320:-1[s${i}]`).join(';')};${picks.map((_,i)=>`[s${i}]`).join('')}xstack=inputs=${picks.length}:layout=${picks.map((_,i)=>`${(i%8)*320}_${Math.floor(i/8)}*180`.replace(/_(\d+)\*180/,(m,r)=>'_'+(+r*180))).join('|')}`,out.replace(/\.mp4$/,'_tira.jpg')]);
rmSync(tmp,{recursive:true,force:true});await browser.close();
console.log(out,`${targets.length} pulsacions de ${D} s, pic a l'app ${(20*Math.log10(peak)).toFixed(1)} dBFS (volum 40 %); còpia de revisió +${(20*Math.log10(REVIEW_GAIN)).toFixed(0)} dB`);
