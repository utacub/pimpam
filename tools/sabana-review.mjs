// Sabana de paper (CE36): review video of a few presses of the day on the savanna (after tools/fons-review.mjs), press after press with a short rest between presses (the scene stopped
// and dark, as when a person waits before pressing again), drawn by the app's own renderer (sabana-gl.js, WebGL2 in software here) and
// with the music of each press rendered offline exactly as the app schedules it (recorded instruments of sampler.js). The clocks are
// the app's: the waiting clock of escenari.js wakes the scene at each press and stops it at its end.
// Usage: node tools/sabana-review.mjs <output.mp4> [width] [height] [fps] [first stimulus 1–20] [presses] [rest s]
// JOBS=n: draw the frames in n browsers at once.
// AUDIO_ONLY=1: only the music (output.wav) and its loudness, press by press (ffmpeg ebur128, on the review copy +12 dB).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const [out='sabana.mp4',width='960',height='540',fpsArg='24',firstArg='1',countArg='20',restArg='2']=process.argv.slice(2);
const W=+width,H=+height,FPS=+fpsArg,LEAD=2,TAIL=1.5,VOLUME=40,REVIEW_GAIN=4,REST=+restArg,AUDIO_ONLY=!!process.env.AUDIO_ONLY;
const MODULES=['dist/kaleido-base.js','dist/paper.js','dist/sampler.js','dist/synth.js','dist/escenari.js','dist/sabana-shaders.js','dist/sabana.js','dist/sabana-gl.js'];
const code=MODULES.map(n=>readFileSync(root+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'').replace(/^export \{[^}]+\};$/gm,'');
// JOBS=n: the frames are drawn by n browsers at once (software WebGL uses one core each).
const JOBS=Math.max(1,+(process.env.JOBS||1)),errors=[],browsers=[];
async function openPage(){const browser=await playwright.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});browsers.push(browser);
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,drawFons:drawSabana,fonsScore:sabanaScore,fonsDuration:sabanaDuration,fonsRest:sabanaRest,fonsCamera:sabanaCamera,FONS_SURF:SABANA_START,FONS_STIM:SABANA_STIM,FONS_N:SABANA_N,ESC_WAIT,ESC_WAIT_START,escWaitTurn,escWaitClock};})();'});
await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
await page.addScriptTag({content:`
window.loadRecorded=()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}});
// The presses: stimulus, start, duration; the turns of the waiting clock (a press wakes it, the end of a stimulus stops it); the
// camera at each press and the clock of the scene left behind.
window.timeline=(first,count,rest,lead)=>{const presses=[],turns=[];let T=lead,wait=K.ESC_WAIT_START,prev=null;
 for(let k=0;k<count;k++){const v=(first-1+k)%K.FONS_N,D=K.fonsDuration(v);wait=K.escWaitTurn(wait,'run',T);turns.push({at:T,w:wait});
  const idle0=wait.idle,from=prev===null?(v>0?K.fonsRest(v-1):[...K.FONS_SURF]):prev.v===K.FONS_N-1?[...K.FONS_SURF]:K.fonsRest(prev.v),prevTau=prev?idle0-prev.idle0:null;
  const p={v,start:T,D,idle0,from,prevTau};presses.push(p);wait=K.escWaitTurn(wait,'wait',T+D);turns.push({at:T+D,w:wait});prev=p;T+=D+rest;}
 return {presses,turns,end:T-rest};};
window.frameAt=(T,line)=>{const cv=document.getElementById('c'),c=cv.getContext('2d');let w=K.ESC_WAIT_START;for(const x of line.turns)if(x.at<=T)w=x.w;const k=K.escWaitClock(w,T);
 let p=null;for(const q of line.presses)if(q.start<=T)p=q;const running=p&&T<p.start+p.D,tau=p?k.idle-p.idle0:0;
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);
 K.drawFons(c,cv.width,cv.height,{variant:p?p.v:line.presses[0].v-1,t:running?T-p.start:null,tau,prevTau:p&&p.prevTau!==null?p.prevTau+tau:null,from:p?.from,stim:K.FONS_STIM,sea:k.idle,dark:k.dark/K.ESC_WAIT.dark*.85,background:'full',opacity:25,base:'black',done:!!p&&p.v===K.FONS_N-1&&!running,scale:1});
 return cv.toDataURL('image/jpeg',.9);};
window.renderAudio=async(line,total,volume,reviewGain)=>{const rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 // As playPatternAudio in app.js: onsets and lengths are fractions of the press's duration; at its end the group fades over 1.2 s.
 for(const p of line.presses){const synth=K.createSynth(ctx,master);for(const e of K.fonsScore(p.v,K.FONS_STIM))synth.play(e,p.start+e.at*p.D,Math.min(p.D*e.length,p.D-e.at*p.D));synth.stop(1.2,p.start+p.D);}
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak};};`});
return page;}
const page=await openPage();
const decoded=await page.evaluate(()=>loadRecorded());if(!decoded)console.warn('No recorded samples decoded: the built-in fallbacks will play.');
const line=await page.evaluate(a=>timeline(...a),[+firstArg,+countArg,REST,LEAD]),TOTAL=line.end+TAIL,tmp=out.replace(/\.(mp4|wav)$/,'')+'.frames';
rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});
const {wav,peak}=await page.evaluate(a=>renderAudio(...a),[line,TOTAL,VOLUME,REVIEW_GAIN]);writeFileSync(`${tmp}/audio.wav`,Buffer.from(wav,'base64'));
// Loudness of each press (integrated, from its press to its end) and of the whole, on the review copy.
const lufsOf=(a,b)=>{const r=require('node:child_process').spawnSync('ffmpeg',['-hide_banner','-nostats','-ss',String(a),'-t',String(b-a),'-i',`${tmp}/audio.wav`,'-af','ebur128','-f','null','-'],{encoding:'utf8'});const m=[...r.stderr.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop();return m?+m[1]:NaN;};
for(const p of line.presses)console.log(`${String(p.v+1).padStart(2)} ${(p.start).toFixed(1)}s ${lufsOf(p.start,p.start+p.D).toFixed(1)} LUFS`);
console.log('whole',lufsOf(0,TOTAL).toFixed(1),'LUFS; app peak',(20*Math.log10(peak)).toFixed(1),'dBFS at volume 40 %; review copy +12 dB');
if(AUDIO_ONLY){writeFileSync(out.replace(/\.mp4$/,'.wav'),readFileSync(`${tmp}/audio.wav`));rmSync(tmp,{recursive:true,force:true});for(const b of browsers)await b.close();process.exit(0);}
const t0=Date.now(),NF=Math.round(TOTAL*FPS),pages=[page];for(let j=1;j<JOBS;j++)pages.push(await openPage());let done=0;
await Promise.all(pages.map(async(pg,j)=>{for(let f=j;f<NF;f+=JOBS){const url=await pg.evaluate(a=>frameAt(...a),[f/FPS,line]);writeFileSync(`${tmp}/${String(f).padStart(5,'0')}.jpg`,Buffer.from(url.split(',')[1],'base64'));
 if(++done%240===0)console.log(`frame ${done}/${NF}, ${((Date.now()-t0)/1000).toFixed(0)} s`);}}));
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(FPS),'-i',`${tmp}/%05d.jpg`,'-i',`${tmp}/audio.wav`,'-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out]);
// Contact sheet: each press at 60 % of its stimulus.
const picks=line.presses.map(p=>`${tmp}/${String(Math.round((p.start+2+7)*FPS)).padStart(5,'0')}.jpg`),cols=Math.min(5,picks.length);
try{execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...picks.flatMap(p=>['-i',p]),'-filter_complex',`${picks.map((_,i)=>`[${i}]scale=384:216[s${i}]`).join(';')};${picks.map((_,i)=>`[s${i}]`).join('')}xstack=inputs=${picks.length}:layout=${picks.map((_,i)=>`${(i%cols)*384}_${Math.floor(i/cols)*216}`).join('|')}`,out.replace(/\.mp4$/,'_tira.jpg')]);}catch(e){console.warn('contact sheet not made:',String(e).split('\n')[0]);}
rmSync(tmp,{recursive:true,force:true});for(const b of browsers)await b.close();
console.log(out,`${line.presses.length} pulsacions, ${TOTAL.toFixed(1)} s; errors`,errors.length?'\n'+errors.join('\n'):'none');
