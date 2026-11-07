// Review video for El vent del bosc (CE26). The pictures are recorded from the built HTML itself on a virtual clock (Playwright's
// page.clock), with the switch held for different lengths of time: a short press, a longer one, the gale with its gusts, and enough
// wind for the place to change. The sound is rendered offline as the app plays it: the music of each press (recorded instruments of
// sampler.js) and the recording of the wind and of the place, with the level and the opening of the filter of ventAir in app.js.
// Usage: node tools/vent-review.mjs <built.html> <output.mp4> [fps]
// With an output ending in .wav, only the sound is rendered; PARTS=music or PARTS=air keeps only the music or only the recordings of
// the wind and the place (to measure the balance between them).
// The app starts at the first place (almond trees in blossom); the fifth press paints the second one (the meadow of dandelions).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const [html,out,fpsArg='30']=process.argv.slice(2),FPS=+fpsArg,LEAD=3,REST=1.5,VOLUME=40,REVIEW_GAIN=4;
// How long the switch is held at each press, in seconds: 25 s of wind change the place.
const HOLDS=[.6,5.5,13,7,9];
const presses=[];{let T=LEAD,total=0,variant=0,from;for(let i=0;i<HOLDS.length;i++){let change=false;if(total>=25){from=variant;variant=(variant+1)%40;total=0;change=true;}
 const release=Math.max(HOLDS[i],3);presses.push({i,start:T,hold:HOLDS[i],release,end:release+2.3,variant,change,from});total+=release;T+=release+2.3+REST;}}
const TOTAL=presses.at(-1).start+presses.at(-1).end+2;
const browser=await playwright.chromium.launch();
// The sound, offline.
const MODULES=['kaleido-base.js','sampler.js','synth.js','escenari.js','vent.js'];
const code=MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
const audioPage=await browser.newPage();await audioPage.setContent('<!doctype html><html><body></body></html>');
await audioPage.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,sampleZone,ventScore,ventCoda,ventScene,ventWind,VENT_AIR,VENT_GUSTS,VENT_SPAN};})();'});
await audioPage.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
const decoded=await audioPage.evaluate(()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}}));
if(!decoded)console.warn('No recorded samples decoded.');
const PARTS=process.env.PARTS||'all';
const {wav,peak}=await audioPage.evaluate(async([presses,total,volume,reviewGain,parts])=>{const rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 const layer=(name,start,stop)=>{const z=K.sampleZone('natureRec',0,name);if(!z)return null;const b=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),a=z.loopStart+z.shift,e=z.loopEnd+z.shift;b.buffer=z.buffer;b.loop=true;b.loopStart=a;b.loopEnd=e;f.type='lowpass';f.frequency.value=name==='wind'?400:9000;g.gain.value=0;b.connect(f);f.connect(g);g.connect(master);b.start(start,a+((start*7.3)%(e-a)));b.stop(stop);return {f,g};};
 for(const p of presses){const S=K.ventScene(p.variant),D=K.VENT_SPAN,synth=K.createSynth(ctx,master),stop=p.start+p.end;
  // The music: sixteen seconds at a time until the wind starts to calm, then the closing notes; at the end the group fades over 1.2 s.
  if(parts!=='air')for(let cycle=0;cycle*D<p.release;cycle++)for(const e of K.ventScore(p.variant,p.i,cycle,0)){const t=cycle*D+e.at*D;if(t>=p.release+.12)continue;synth.play(e,p.start+t,Math.min(D*e.length,D-e.at*D));}
  if(parts!=='air')for(const e of K.ventCoda(p.variant,p.i))synth.play(e,p.start+p.release+e.at,e.length);synth.stop(1.2,stop);
  // The wind and the place: the same levels as ventAir, updated thirty times a second.
  const wind=parts==='music'?null:layer('wind',p.start,stop+1.4),nature=S.nature&&parts!=='music'?layer(S.nature,p.start,stop+1.4):null;
  for(let t=0;t<p.end;t+=1/30){const w=K.ventWind(t,t<p.hold?null:p.release,0,K.VENT_GUSTS[p.i%4]),level=Math.max(0,w.level),v=level>0?.14*Math.min(1,level/.3)+.3*Math.min(level,1.2):0,u=level>0?.12*Math.min(1,level/.3)+.16*Math.min(level,1):0,at=p.start+t;
   if(wind){wind.g.gain.setTargetAtTime(2.24*K.VENT_AIR*v*v,at,.12);wind.f.frequency.setTargetAtTime(380*16**Math.min(1.1,level),at,.15);}if(nature)nature.g.gain.setTargetAtTime(2.24*K.VENT_AIR*u*u,at,.2);}
  for(const n of [wind,nature])if(n){n.g.gain.cancelScheduledValues(stop);n.g.gain.setTargetAtTime(0,stop,.3);}}
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak};},[presses,TOTAL,VOLUME,REVIEW_GAIN,PARTS]);
if(out.endsWith('.wav')){writeFileSync(out,Buffer.from(wav,'base64'));await browser.close();console.log(out,`${PARTS}, ${TOTAL.toFixed(1)} s, pic a l'app ${(20*Math.log10(peak)).toFixed(1)} dBFS`);process.exit(0);}
// The pictures, from the built HTML.
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.clock.install({time:new Date('2026-10-27T10:00:00Z')});await page.goto('file://'+html);await page.clock.pauseAt(new Date('2026-10-27T10:01:00Z'));
await page.clock.runFor(1500);await page.locator('[data-start="wind"]').first().click();
const tmp=out+'.frames';rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});writeFileSync(`${tmp}/audio.wav`,Buffer.from(wav,'base64'));
let f=0,held=false;for(let T=0;T<TOTAL;T+=1/FPS,f++){
 for(const p of presses){if(!held&&Math.abs(T-p.start)<.5/FPS){await page.keyboard.down('Space');held=true;}if(held&&Math.abs(T-(p.start+p.hold))<.5/FPS){await page.keyboard.up('Space');held=false;}}
 await page.clock.runFor(1000/FPS);writeFileSync(`${tmp}/${String(f).padStart(5,'0')}.jpg`,await page.screenshot({type:'jpeg',quality:90}));}
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(FPS),'-i',`${tmp}/%05d.jpg`,'-i',`${tmp}/audio.wav`,'-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out]);
const picks=presses.flatMap(p=>[p.start+Math.min(p.hold,2.5)*.8,p.start+p.release*.95,p.start+p.release+.6]).map(T=>`${tmp}/${String(Math.round(T*FPS)).padStart(5,'0')}.jpg`),cols=3;
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...picks.flatMap(p=>['-i',p]),'-filter_complex',`${picks.map((_,i)=>`[${i}]scale=320:180[s${i}]`).join(';')};${picks.map((_,i)=>`[s${i}]`).join('')}xstack=inputs=${picks.length}:layout=${picks.map((_,i)=>`${(i%cols)*320}_${Math.floor(i/cols)*180}`).join('|')}`,out.replace(/\.mp4$/,'_tira.jpg')]);
rmSync(tmp,{recursive:true,force:true});await browser.close();
console.log(out,`${presses.length} pulsacions (${HOLDS.join(', ')} s premut), ${TOTAL.toFixed(1)} s, pic a l'app ${(20*Math.log10(peak)).toFixed(1)} dBFS (volum 40 %); còpia de revisió +${(20*Math.log10(REVIEW_GAIN)).toFixed(0)} dB`);
if(errors.length)console.log('ERRORS',errors.join('\n'));
