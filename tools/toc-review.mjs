// Review video for Toc, toc! Qui hi ha? (CE30, 0.22): a scripted round, as a person would play it. The house is shown, somebody knocks
// (the knocking comes back every four seconds), the pupil presses after one or two knocks, and the visitor comes out with their gag
// and walks to the street; after the last visit of the round comes the party, and then the next house and its first knock. The
// street is simulated frame by frame with toc.js, as the app does, and the music (the knocking and each visit) is rendered offline
// with the recorded instruments of sampler.js, at the levels of the app.
// Usage: node tools/toc-review.mjs <output.mp4> [width] [height] [fps] [round] [steps] [decor full|dim|none] [base black|white]
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {root} from './kaleido-harness.mjs';
import {TC_FINAL,TC_KNOCK_EVERY,TC_VISIT,tcDone,tcEnsure,tcKnockScore,tcPress,tcScore,tcTick} from '../dist/toc.js';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [out='toc.mp4',width='1280',height='720',fpsArg='30',roundArg='0',stepsArg='3',decor='full',base='black']=process.argv.slice(2);
const W=+width,H=+height,FPS=+fpsArg,VOLUME=40,REVIEW_GAIN=4,TAIL=3,S={steps:+stepsArg,tcWait:'short',tcLeave:'never'};
// The session: the pupil lets the visitor knock for a while (two knocks the first time, then one or two), then presses.
const g=tcEnsure({variant:+roundArg},S),frames=[],presses=[],waits=[4.6,1.3,5.2,1.6,4.9,1.4,2.2];let time=null,D=0,T=0,visits=0,done=false,knockAt=null,cycle=0,after=null;const dt=1/FPS;
while(T<260){const ev=tcTick(g,S,dt);T+=dt;
 if(ev==='knock'){knockAt=T-dt;cycle=0;}
 if(g.tcPhase==='knock'&&knockAt!==null&&T-dt>=knockAt+cycle*TC_KNOCK_EVERY-1e-9){presses.push({start:knockAt+cycle*TC_KNOCK_EVERY,D:TC_KNOCK_EVERY,score:tcKnockScore(g.variant)});cycle++;}
 if(time!==null){time+=dt;if(time>=D){tcDone(g,S);time=null;if(g.tcOut.length===0)after=T;}}
 if(after!==null&&g.tcPhase==='knock'&&T-knockAt>2.2)break;
 if(after===null&&g.tcPhase==='knock'&&T-knockAt>=waits[visits%waits.length]){const v=tcPress(g,S);D=v.final?TC_FINAL:TC_VISIT;time=0;presses.push({start:T,D,score:tcScore(g.variant,v.who,v.final,D)});visits++;knockAt=null;}
 frames.push({state:JSON.parse(JSON.stringify(g)),t:time,D});}
const TOTAL=T+TAIL;for(let k=0;k<TAIL*FPS;k++){tcTick(g,S,dt);frames.push({state:JSON.parse(JSON.stringify(g)),t:null,D:0});}
for(let i=0;i<presses.length;i++){const next=presses[i+1];presses[i].cut=next&&next.start<presses[i].start+presses[i].D?next.start:presses[i].start+presses[i].D;}
const MODULES=['kaleido-base.js','glass.js','paper.js','sampler.js','synth.js','escenari.js','toc.js','toc-art.js'];
const code=MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,sampleZone,drawToc};})();'});
await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
const decoded=await page.evaluate(()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}}));if(!decoded)console.warn('No recorded samples decoded.');
const tmp=out+'.frames';rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});
const view={background:decor,base,opacity:30};
for(let f=0;f<frames.length;f++){const fr=frames[f];const url=await page.evaluate(([fr,view])=>{const cv=document.getElementById('c'),c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);
  K.drawToc(c,cv.width,cv.height,{game:fr.state,t:fr.t,duration:fr.D,...view});return cv.toDataURL('image/jpeg',.92);},[fr,view]);
 writeFileSync(`${tmp}/${String(f).padStart(5,'0')}.jpg`,Buffer.from(url.split(',')[1],'base64'));}
const {wav,peak}=await page.evaluate(async([presses,total,volume,reviewGain])=>{const rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 // Same rule as playPatternAudio in app.js: onsets and lengths are fractions of the press's duration; a press ends with a fade of 1.2 s,
 // and the press cuts the knocking.
 for(const p of presses){const synth=K.createSynth(ctx,master);for(const e of p.score){const at=p.start+e.at*p.D;if(at>=p.cut)continue;synth.play(e,at,Math.min(p.D*e.length,p.D-e.at*p.D));}synth.stop(p.cut<p.start+p.D?.03:1.2,p.cut);}
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak};},[presses,TOTAL,VOLUME,REVIEW_GAIN]);
writeFileSync(out.replace(/\.mp4$/,'.wav'),Buffer.from(wav,'base64'));
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(FPS),'-i',`${tmp}/%05d.jpg`,'-i',out.replace(/\.mp4$/,'.wav'),'-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out]);
rmSync(tmp,{recursive:true,force:true});await browser.close();
console.log(out,`${visits} visites, ${presses.length-visits} trucs, ${TOTAL.toFixed(1)} s, pic a l'app ${(20*Math.log10(peak)).toFixed(1)} dBFS (volum 40 %); còpia de revisió +${(20*Math.log10(REVIEW_GAIN)).toFixed(0)} dB`);
