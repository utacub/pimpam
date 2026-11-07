// El viatge en globus (CE43): a flight rendered offline exactly as the app plays it (vgAudio with the recorded instruments, the burner,
// the wind, the air of the ground, the landmarks), and its loudness by stretch (ffmpeg ebur128, on the review copy +12 dB). Audio only.
// Usage: node tools/viatge-audio.mjs <output.wav> [journey 0–19] [start share of the day] [seconds] [music|fx|all]
import {createRequire} from 'node:module';import {readFileSync,writeFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const [out='viatge.wav',vArg='0',pArg='.12',secArg='150',what='all']=process.argv.slice(2);
const VOLUME=40,REVIEW_GAIN=4;
const MODULES=['dist/kaleido-base.js','dist/paper.js','dist/sampler.js','dist/synth.js','dist/escenari.js','dist/viatge.js'];
const code=MODULES.map(n=>readFileSync(root+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class|let))/gm,'').replace(/^export \{[^}]+\};$/gm,'');
const browser=await playwright.chromium.launch();const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,vgNewFlight,vgTick,vgAudio,vgPress,vgRelease,vgTotal,vgDay,vgStage};})();'});
await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
await page.addScriptTag({content:`
window.loadRecorded=()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}});
window.renderAudio=async(v,p0,secs,what,volume,reviewGain)=>{const rate=48000,total=secs+3,off=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=off.createGain();master.gain.value=volume/100*.35;master.connect(off.destination);
 const synth=K.createSynth(off,master);let T=0;const ctx={state:'running',get currentTime(){return T;},createGain:()=>off.createGain(),createBufferSource:()=>off.createBufferSource(),createStereoPanner:()=>off.createStereoPanner(),createBiquadFilter:()=>off.createBiquadFilter()};
 const fxOut=off.createGain();fxOut.gain.value=what==='music'?0:1;fxOut.connect(master);
 const s={vgDay:'normal',interaction:'hold',waitCue:false,sound:true},game={};const f=K.vgNewFlight(v,s);f.phase='fly';f.a=.05;f.dist=p0*K.vgTotal(s);game.viatge=f;
 // the presses: hold 8 s at 10 s, 3 s at 45 s, a tap at 70 s, hold 12 s at 95 s; then let it sink
 const holds=[[10,18],[45,48],[70,70.3],[95,107]],marks=[];let held=false;
 for(let i=0;T<secs;i++){T=i/60;const want=holds.some(([a,b])=>T>=a&&T<b);if(want&&!held){K.vgPress(game,s);held=true;marks.push(['press',T]);}if(!want&&held){K.vgRelease(game);held=false;marks.push(['release',T]);}
  K.vgTick(game,s,1/60);K.vgAudio(game,s,ctx,fxOut,(e,d,l)=>{if(what!=='fx')synth.play(e,T+d,l);});}
 const buf=await off.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak,total,marks,stage:K.vgStage(K.vgDay(f,s))};};`});
const decoded=await page.evaluate(()=>loadRecorded());if(!decoded)console.warn('No recorded samples decoded.');
const r=await page.evaluate(a=>renderAudio(...a),[+vArg,+pArg,+secArg,what,VOLUME,REVIEW_GAIN]);writeFileSync(out,Buffer.from(r.wav,'base64'));
const lufsOf=(a,b)=>{const x=spawnSync('ffmpeg',['-hide_banner','-nostats','-ss',String(a),'-t',String(b-a),'-i',out,'-af','ebur128=peak=true','-f','null','-'],{encoding:'utf8'});const m=[...x.stderr.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop(),p=[...x.stderr.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop();return [m?+m[1]:NaN,p?+p[1]:NaN];};
for(const [name,a,b] of [['low, quiet',1,10],['burning, climbing',10.5,18],['high, sinking',20,44],['short burn',45,52],['tap',69,76],['long climb',95,107],['sinking',110,+secArg]])if(b<=+secArg){const [I,tp]=lufsOf(a,b);console.log(`${name.padEnd(18)} ${a}–${b}s ${I.toFixed(1)} LUFS, peak ${tp.toFixed(1)} dBFS`);}
console.log('whole',lufsOf(0,+secArg)[0].toFixed(1),'LUFS; app peak',(20*Math.log10(r.peak)).toFixed(1),'dBFS; stage at the end',r.stage.toFixed(2));
if(errors.length)console.log('errors',errors.slice(0,5).join(' | '));await browser.close();
