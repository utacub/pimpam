// El vestidor fantàstic (EN06, 0.73): the sound of one artist's round rendered offline as the app schedules it (three steps and the show,
// vsStepScore and vsFinalScore through playPatternAudio's timing), with the loudness of each effect and of three stems (the band, the foley
// and the audience, the voices), so the mix can be balanced by measurement. Audio only. Usage:
//   node tools/vestidor-audio.mjs <output.wav> [round 0..] [pick index 0..3] [flags: nodesp,steps3,curt,llarg]
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const [out='vestidor.wav',roundArg='0',pickArg='0',flags='']=process.argv.slice(2);
const LEAD=.5,TAIL=1.5,VOLUME=40,REVIEW_GAIN=4,REST=1;
const MODULES=['dist/kaleido-base.js','dist/paper.js','dist/sampler.js','dist/synth.js','dist/vestidor.js','dist/vestidor-so.js'];
const code=MODULES.map(n=>readFileSync(root+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'').replace(/^export \{[^}]+\};$/gm,'');
const browser=await playwright.chromium.launch();const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,vsRoundOf,vsOptions,vsPicks,vsSteps,vsSlip,vsTimes,vsTimeline,vsStepScore,vsFinalScore,vsPattern,VS_STEP,VS_SLIP};})();'});
await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9_-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
await page.addScriptTag({content:`
window.loadRecorded=()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}});
window.renderAudio=async(round,pick,flags,rest,lead,tail,volume,reviewGain,stem)=>{const F=flags.split(','),s={scanOptions:3,vsSteps:F.includes('steps3')?'3':'4',vsDespistes:!F.includes('nodesp'),vsNumber:F.includes('curt')?'curt':F.includes('llarg')?'llarg':'normal',vsFirst:'rita'};
 const presses=[];let T=lead;const st={round,stage:0,picks:[]},n=K.vsSteps(s);
 for(let stage=0;stage<n;stage++){st.stage=stage;const opts=K.vsOptions(st,s),id=opts[Math.min(pick,opts.length-1)],picks=K.vsPicks(st,s,id),final=stage===n-1,D=final?K.vsTimes(s,st).final:K.vsTimes(s,st).step;
  let ev=final?K.vsFinalScore(s,round,stage,picks,id):K.vsStepScore(s,round,stage,picks,id);
  if(stem==='band')ev=ev.filter(e=>!/^vestidor|^natureRec/.test(e.inst));else if(stem==='foley')ev=ev.filter(e=>e.inst==='vestidorRec'||e.inst==='natureRec');else if(stem==='voices')ev=ev.filter(e=>e.inst==='vestidorVeu');
  presses.push({id:(final?'show ':'step ')+id,start:T,D,score:K.vsPattern(ev,D)});T+=D+rest;st.picks.push({value:id});}
 const total=T-rest+tail,rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 for(const p of presses){const synth=K.createSynth(ctx,master);for(const e of p.score)synth.play(e,p.start+e.at*p.D,Math.min(p.D*e.length,p.D-e.at*p.D));synth.stop(1.2,p.start+p.D);}
 const buf=await ctx.startRendering(),N=buf.length,data=new DataView(new ArrayBuffer(44+N*4)),str=(o,x)=>[...x].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+N*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,N*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<N;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<N;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak,presses:presses.map(p=>({id:p.id,start:p.start,D:p.D,n:p.score.length})),total,artist:K.vsRoundOf(round,s).artist};};`});
const decoded=await page.evaluate(()=>loadRecorded());console.log('decoded zones',decoded);
const lufsOf=(file,a,b)=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostats','-ss',String(a),'-t',String(b-a),'-i',file,'-af','ebur128=peak=true','-f','null','-'],{encoding:'utf8'});
 const m=[...r.stderr.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop(),p=[...r.stderr.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop();return [m?+m[1]:NaN,p?+p[1]:NaN];};
let whole=null;
for(const stem of ['all','band','foley','voices']){const r=await page.evaluate(a=>renderAudio(...a),[+roundArg,+pickArg,flags,REST,LEAD,TAIL,VOLUME,REVIEW_GAIN,stem]);const file=stem==='all'?out:out.replace(/\.wav$/,`_${stem}.wav`);writeFileSync(file,Buffer.from(r.wav,'base64'));
 if(stem==='all'){whole=r;console.log(`round ${roundArg} · ${r.artist} · app peak ${(20*Math.log10(r.peak)).toFixed(1)} dBFS at volume 40 % (review copies +12 dB)`);}else console.log(stem,"peak",(20*Math.log10(r.peak)).toFixed(1),r.presses.map(p=>p.n).join(","));
 console.log(stem.padEnd(7),r.presses.map(p=>{const [I,tp]=lufsOf(file,p.start,p.start+p.D);return `${p.id} ${I.toFixed(1)} LUFS/${tp.toFixed(1)}`;}).join(' · '));}
if(errors.length)console.log('errors',errors.slice(0,5).join(' | '));
await browser.close();
