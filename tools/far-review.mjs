// Review video for El far (CE28, 0.20): a scripted night, as a person would play it. The light sweeps; a press too early makes the water
// shimmer; then each boat is reached when it glows, goes home with its music, and after the third the night changes. The state of the
// sea is simulated frame by frame with far.js, as the app does, and the music of each press and the sea are rendered offline (recorded
// instruments and the waves of sampler.js), at the levels of the app.
// Usage: node tools/far-review.mjs <output.mp4> [width] [height] [fps] [night] [boats] [speed slow|medium|fast] [window wide|medium|narrow]
// PARTS=music|sea renders only one of the two (for the balance); the .wav is written next to the video.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {root} from './kaleido-harness.mjs';
import {FAR_FINAL,FAR_MISS,FAR_SEA,FAR_STEP,farDock,farEnsure,farGap,farPeriod,farPress,farScore,farTick,farWindow} from '../dist/far.js';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [out='far.mp4',width='1280',height='720',fpsArg='30',nightArg='0',boatsArg='2',speed='slow',win='wide']=process.argv.slice(2);
const W=+width,H=+height,FPS=+fpsArg,VOLUME=40,REVIEW_GAIN=4,TAIL=4,S={farSpeed:speed,farWindow:win,farBoats:+boatsArg};
// The session: the game as the app keeps it, a press when the script says so; frames keep a copy of the state and the time of the press.
const g=farEnsure({variant:+nightArg},S),frames=[],presses=[],plan=['miss','hit','miss','hit','hit'];let time=null,D=0,T=0,ended=0,homes=0;const dt=1/FPS;
const glow=()=>Math.max(...g.farSea.map(b=>g.farNow-b.born<1.8?0:1-farGap(g.farBeam,b.t,farPeriod(S))/(farWindow(S)/2)));
// No boat within reach, with a margin (for the presses meant to make the water shimmer).
const clear=()=>g.farSea.every(b=>farGap(g.farBeam,b.t,farPeriod(S))>farWindow(S)/2+.4);
while(T<240){farTick(g,S,dt);T+=dt;if(time!==null){time+=dt;if(time>=D){farDock(g,S);g.farMiss=null;time=null;ended=T;if(g.farHome===0&&homes>=3)break;}}
 // The script: a press while no boat glows (the water shimmers), a press in the middle of a window (a boat goes home), and so on;
 // at least 2.5 s after the start or after the end of an effect.
 let press=false;if(time===null&&plan.length&&T-ended>2.5){const want=plan[0];if(want==='miss'?clear():glow()>.97){press=true;plan.shift();}}
 if(press){const kind=farPress(g,S);D=kind==='miss'?FAR_MISS:kind==='final'?FAR_FINAL:FAR_STEP;time=0;presses.push({start:T,D,score:farScore(kind,g.farRet?.tune,g.farMiss?.p,D)});if(kind!=='miss')homes++;}
 frames.push({state:JSON.parse(JSON.stringify(g)),t:time,D});}
const TOTAL=T+TAIL;for(let k=0;k<TAIL*FPS;k++){farTick(g,S,dt);frames.push({state:JSON.parse(JSON.stringify(g)),t:null,D:0});}
for(let i=0;i<presses.length;i++){const next=presses[i+1];presses[i].cut=next&&next.start<presses[i].start+presses[i].D?next.start:presses[i].start+presses[i].D;}
const MODULES=['kaleido-base.js','glass.js','paper.js','sampler.js','synth.js','escenari.js','far.js','far-art.js'];
const code=MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,sampleZone,drawFar};})();'});
await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
const decoded=await page.evaluate(()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}}));if(!decoded)console.warn('No recorded samples decoded.');
const tmp=out+'.frames';rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});
const view={period:farPeriod(S),window:farWindow(S),boats:S.farBoats};
for(let f=0;f<frames.length;f++){const fr=frames[f];const url=await page.evaluate(([fr,view])=>{const cv=document.getElementById('c'),c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);
  K.drawFar(c,cv.width,cv.height,{game:fr.state,t:fr.t,duration:fr.D,...view,background:'full',base:'black'});return cv.toDataURL('image/jpeg',.92);},[fr,view]);
 writeFileSync(`${tmp}/${String(f).padStart(5,'0')}.jpg`,Buffer.from(url.split(',')[1],'base64'));}
const PARTS=process.env.PARTS||'all';
const {wav,peak}=await page.evaluate(async([presses,total,volume,reviewGain,parts,sea])=>{const rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 if(parts!=='music'){const z=K.sampleZone('natureRec',0,'waves');if(z){const b=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),a=z.loopStart+z.shift,e=z.loopEnd+z.shift;b.buffer=z.buffer;b.loop=true;b.loopStart=a;b.loopEnd=e;f.type='lowpass';f.frequency.value=9000;g.gain.value=0;b.connect(f);f.connect(g);g.connect(master);b.start(0,a);g.gain.setTargetAtTime(2.24*sea,0,.6);}}
 // Same rule as playPatternAudio in app.js: onsets and lengths are fractions of the press's duration; a press ends with a fade of 1.2 s,
 // and a new press cuts the shimmer of the one before.
 if(parts!=='sea')for(const p of presses){const synth=K.createSynth(ctx,master);for(const e of p.score){const at=p.start+e.at*p.D;if(at>=p.cut)continue;synth.play(e,at,Math.min(p.D*e.length,p.D-e.at*p.D));}synth.stop(p.cut<p.start+p.D?.03:1.2,p.cut);}
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak};},[presses,TOTAL,VOLUME,REVIEW_GAIN,PARTS,FAR_SEA]);
writeFileSync(out.replace(/\.mp4$/,'.wav'),Buffer.from(wav,'base64'));
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(FPS),'-i',`${tmp}/%05d.jpg`,'-i',out.replace(/\.mp4$/,'.wav'),'-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out]);
rmSync(tmp,{recursive:true,force:true});await browser.close();
console.log(out,`${presses.length} pulsacions (${presses.filter(p=>p.D!==FAR_MISS).length} barques a port), ${TOTAL.toFixed(1)} s, pic a l'app ${(20*Math.log10(peak)).toFixed(1)} dBFS (volum 40 %); còpia de revisió +${(20*Math.log10(REVIEW_GAIN)).toFixed(0)} dB`);
