// Encaixos de fusta (EN12, 0.45): the sound of a whole board rendered offline exactly as the app schedules it (the music of the world that
// grows a voice with every piece, exPatternScore; the «clac», the voice and the gag of the figure, exGagPattern; the refusal of a wrong
// piece), and its loudness effect by effect (ffmpeg ebur128, on the review copy +12 dB, as tools/masia-audio.mjs). Audio only.
// Usage: node tools/encaix-audio.mjs <output.wav> [world port|circ|ciutat|bosc|espai] [round 0..39] [rest s]
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const [out='encaix.wav',worldArg='port',roundArg='',restArg='1']=process.argv.slice(2);
const LEAD=.5,TAIL=1.5,VOLUME=40,REVIEW_GAIN=4,REST=+restArg;
const MODULES=['dist/kaleido-base.js','dist/paper.js','dist/sampler.js','dist/synth.js','dist/encaix.js','dist/encaix-so.js'];
const code=MODULES.map(n=>readFileSync(root+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'').replace(/^export \{[^}]+\};$/gm,'');
const browser=await playwright.chromium.launch();const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,exBoardOf,exVariant,exPatternScore,exGagPattern,exTimes,EX_WORLDS};})();'});
await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
await page.addScriptTag({content:`
window.loadRecorded=()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}});
window.renderAudio=async(world,round,rest,lead,tail,volume,reviewGain)=>{const presses=[];let T=lead;const placed=[];
 if(round===null||round===undefined||round===''){round=K.EX_WORLDS.indexOf(world);if(round<0)round=0;}
 const B=K.exBoardOf(round),times=K.exTimes({});
 // a wrong piece first (the guest, offered at the first stage), then the four pieces in the order of the board: three steps and the final
 presses.push({id:B.guest+' (no hi va)',start:T,D:times.wrong,score:K.exGagPattern(B.guest,0,false,false,[]),n:0});T+=times.wrong+rest;
 for(let stage=0;stage<4;stage++){const id=B.order[stage],final=stage===3,D=final?times.final:times.step,v=K.exVariant(round,stage);
  const music=K.exPatternScore(B.world,placed.length+1,final,round),gags=K.exGagPattern(id,v,final,true,placed),score=music.concat(gags).sort((a,b)=>a.at-b.at);
  presses.push({id,start:T,D,score,n:gags.length,music:music.length});T+=D+rest;placed.push(id);}
 const total=T-rest+tail,rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 // As playPatternAudio in app.js: onsets and lengths are fractions of the effect's duration; at its end the group fades over 1.2 s.
 for(const p of presses){const synth=K.createSynth(ctx,master);for(const e of p.score)synth.play(e,p.start+e.at*p.D,Math.min(p.D*e.length,p.D-e.at*p.D));synth.stop(1.2,p.start+p.D);}
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak,presses:presses.map(p=>({id:p.id,start:p.start,D:p.D,n:p.n,music:p.music})),total,world:B.world,light:B.light};};`});
const decoded=await page.evaluate(()=>loadRecorded());if(!decoded)console.warn('No recorded samples decoded: the built-in fallbacks will play.');
const {wav,peak,presses,total,world,light}=await page.evaluate(a=>renderAudio(...a),[worldArg,roundArg===''?'':+roundArg,REST,LEAD,TAIL,VOLUME,REVIEW_GAIN]);writeFileSync(out,Buffer.from(wav,'base64'));
const lufsOf=(a,b)=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostats','-ss',String(a),'-t',String(b-a),'-i',out,'-af','ebur128=peak=true','-f','null','-'],{encoding:'utf8'});
 const m=[...r.stderr.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop(),p=[...r.stderr.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop(),x=[...r.stderr.matchAll(/LRA:\s+(-?[\d.]+) LU/g)].pop();return [m?+m[1]:NaN,p?+p[1]:NaN,x?+x[1]:NaN];};
console.log(`${world} · ${light}`);
for(const p of presses){const [I,tp,lra]=lufsOf(p.start,p.start+p.D);console.log(`${p.id.padEnd(22)} ${p.start.toFixed(1)}s D=${p.D.toFixed(1)} music=${p.music??0} gags=${p.n} ${I.toFixed(1)} LUFS, LRA ${lra.toFixed(1)} LU, true peak ${tp.toFixed(1)} dBFS`);}
console.log('whole',lufsOf(0,total)[0].toFixed(1),'LUFS; app peak',(20*Math.log10(peak)).toFixed(1),'dBFS at volume 40 %; review copy +12 dB');
if(errors.length)console.log('errors',errors.slice(0,5).join(' | '));
await browser.close();
