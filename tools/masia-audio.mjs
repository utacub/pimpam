// Estiu a la masia (EN26, 0.39): the sound of the five effects (and the dinner) rendered offline exactly as the app schedules it (the family
// band of masia.js with the recorded instruments, the ElevenLabs foley and voices of masiaRec on the choreography), and its loudness effect by
// effect (ffmpeg ebur128, on the review copy +12 dB). Audio only: no frames, no video.
// Usage: node tools/masia-audio.mjs <output.wav> [variant 0|1] [part music|gags|all] [rest s]
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const [out='masia.wav',variantArg='0',partArg='all',restArg='1']=process.argv.slice(2);
const LEAD=.5,TAIL=1.5,VOLUME=40,REVIEW_GAIN=4,REST=+restArg;
const MODULES=['dist/kaleido-base.js','dist/paper.js','dist/sampler.js','dist/synth.js','dist/masia.js'];
const code=MODULES.map(n=>readFileSync(root+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'').replace(/^export \{[^}]+\};$/gm,'');
const browser=await playwright.chromium.launch();const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,msPatternScore,msGagPattern,MS_CHARS,MS_STEP,MS_FINAL};})();'});
await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
await page.addScriptTag({content:`
window.loadRecorded=()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}});
window.renderAudio=async(variant,part,rest,lead,tail,volume,reviewGain)=>{const presses=[];let T=lead;const picks=[];
 for(const id of K.MS_CHARS){const final=picks.length===4,D=final?K.MS_FINAL:K.MS_STEP;const music=K.msPatternScore(id,picks,final,variant),gags=K.msGagPattern(id,variant,final,picks);
  const score=(part==='music'?music:part==='gags'?gags:music.concat(gags)).sort((a,b)=>a.at-b.at);presses.push({id,start:T,D,score,n:gags.length});T+=D+rest;picks.push(id);}
 const total=T-rest+tail,rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 // As playPatternAudio in app.js: onsets and lengths are fractions of the effect's duration; at its end the group fades over 1.2 s.
 for(const p of presses){const synth=K.createSynth(ctx,master);for(const e of p.score)synth.play(e,p.start+e.at*p.D,Math.min(p.D*e.length,p.D-e.at*p.D));synth.stop(1.2,p.start+p.D);}
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak,presses:presses.map(p=>({id:p.id,start:p.start,D:p.D,n:p.n})),total};};`});
const decoded=await page.evaluate(()=>loadRecorded());if(!decoded)console.warn('No recorded samples decoded: the built-in fallbacks will play.');
const {wav,peak,presses,total}=await page.evaluate(a=>renderAudio(...a),[+variantArg,partArg,REST,LEAD,TAIL,VOLUME,REVIEW_GAIN]);writeFileSync(out,Buffer.from(wav,'base64'));
const lufsOf=(a,b)=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostats','-ss',String(a),'-t',String(b-a),'-i',out,'-af','ebur128=peak=true','-f','null','-'],{encoding:'utf8'});
 const m=[...r.stderr.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop(),p=[...r.stderr.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop(),x=[...r.stderr.matchAll(/LRA:\s+(-?[\d.]+) LU/g)].pop();return [m?+m[1]:NaN,p?+p[1]:NaN,x?+x[1]:NaN];};
for(const p of presses){const [I,tp,lra]=lufsOf(p.start,p.start+p.D);const ep=lufsOf(p.start,p.start+15.5)[0],din=p.D>20?lufsOf(p.start+15.5,p.start+p.D)[0]:NaN;
 console.log(`${p.id.padEnd(6)} ${p.start.toFixed(1)}s D=${p.D} gags=${p.n} ${I.toFixed(1)} LUFS (episode ${ep.toFixed(1)}${p.D>20?', dinner '+din.toFixed(1):''}), LRA ${lra.toFixed(1)} LU, true peak ${tp.toFixed(1)} dBFS`);}
console.log('whole',lufsOf(0,total)[0].toFixed(1),'LUFS; app peak',(20*Math.log10(peak)).toFixed(1),'dBFS at volume 40 %; review copy +12 dB');
if(errors.length)console.log('errors',errors.slice(0,5).join(' | '));
await browser.close();
