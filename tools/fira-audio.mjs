// La fira de llauna (CE44, 0.47): the sound of a round rendered offline as the app schedules it: the count (three rising notes), a few
// seconds of the ticking, then each launch with its gag and the band (the seven of the attraction, the last one the finale), and the
// loudness of each part (ffmpeg ebur128, on the review copy +12 dB, as tools/encaix-audio.mjs). Audio only.
// Usage: node tools/fira-audio.mjs <output.wav> [round 0..19]
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const [out='fira.wav',roundArg='0']=process.argv.slice(2);
const LEAD=.5,TAIL=1.5,VOLUME=40,REVIEW_GAIN=4;
const MODULES=['dist/kaleido-base.js','dist/paper.js','dist/sampler.js','dist/synth.js','dist/escenari.js','dist/fira.js'];
const code=MODULES.map(n=>readFileSync(root+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'').replace(/^export \{[^}]+\};$/gm,'');
const browser=await playwright.chromium.launch();const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,fiCountScore,fiRhythm,fiTickScore,fiPlan,FI_RING,FI_TICK};})();'});
await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
await page.addScriptTag({content:`
window.loadRecorded=()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}});
window.renderAudio=async(round,lead,tail,volume,reviewGain)=>{const presses=[];let T=lead;const s={};
 const c=K.fiCountScore(round,s),I=K.fiRhythm(s),go=2*I+K.FI_RING;presses.push({id:'compte',start:T,D:go,score:c.score,Dscore:c.D});T+=go;
 const tick=K.fiTickScore();presses.push({id:'tic-tac',start:T,D:3*K.FI_TICK,score:[0,1,2].flatMap(k=>tick.map(e=>({...e,at:(e.at+k)/3,length:e.length/3}))),Dscore:3*K.FI_TICK});T+=3*K.FI_TICK;
 for(let g=0;g<7;g++){const p=K.fiPlan(round,g,1);presses.push({id:p.name,start:T,D:p.D,score:p.score,Dscore:p.D});T+=p.D+.6;}
 const rest=.6;
 const total=T-rest+tail,rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 // As playPatternAudio in app.js: onsets and lengths are fractions of the effect's duration; at its end the group fades over 1.2 s.
 for(const p of presses){const synth=K.createSynth(ctx,master),Dd=p.Dscore;for(const e of p.score){if(e.at*Dd>p.D)continue;synth.play(e,p.start+e.at*Dd,Math.min(Dd*e.length,Dd-e.at*Dd));}synth.stop(1.2,p.start+p.D);}
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak,presses:presses.map(p=>({id:p.id,start:p.start,D:p.D,n:p.score.length})),total};};`});
const decoded=await page.evaluate(()=>loadRecorded());if(!decoded)console.warn('No recorded samples decoded: the built-in fallbacks will play.');
const {wav,peak,presses,total}=await page.evaluate(a=>renderAudio(...a),[+roundArg,LEAD,TAIL,VOLUME,REVIEW_GAIN]);writeFileSync(out,Buffer.from(wav,'base64'));
const lufsOf=(a,b)=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostats','-ss',String(a),'-t',String(b-a),'-i',out,'-af','ebur128=peak=true','-f','null','-'],{encoding:'utf8'});
 const m=[...r.stderr.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop(),p=[...r.stderr.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop(),x=[...r.stderr.matchAll(/LRA:\s+(-?[\d.]+) LU/g)].pop();return [m?+m[1]:NaN,p?+p[1]:NaN,x?+x[1]:NaN];};
console.log('round',roundArg);
for(const p of presses){const [I,tp,lra]=lufsOf(p.start,p.start+p.D);console.log(`${p.id.padEnd(22)} ${p.start.toFixed(1)}s D=${p.D.toFixed(1)} events=${p.n} ${I.toFixed(1)} LUFS, LRA ${lra.toFixed(1)} LU, true peak ${tp.toFixed(1)} dBFS`);}
console.log('whole',lufsOf(0,total)[0].toFixed(1),'LUFS; app peak',(20*Math.log10(peak)).toFixed(1),'dBFS at volume 40 %; review copy +12 dB');
if(errors.length)console.log('errors',errors.slice(0,5).join(' | '));
await browser.close();
