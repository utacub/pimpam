// Review video for the scanning boards: On anem? (EN04) and Detectius de sons (EN11) of 0.16, D'on ve aquest so? (EN21) and El meu
// espectacle de llum (EN22) of 0.18, La cassola d'en Glups (EN23) of 0.24 (0.27). The pictures are recorded from the built
// HTML on a virtual clock (Playwright's page.clock) while a plan presses the switch when the focus has been on a given option for a
// while. The page keeps a list of every sound the app starts or stops (window.__pimpamSoundLog, see soundLog in app.js), and the sound is
// rendered offline from that list with the same recorded instruments (sampler.js, synth.js): the tastes, the clue, the trips and pieces.
// Usage: node tools/tauler-review.mjs <built.html> <destinations|sounds|sources|lights|pot> <output.mp4|.wav> [fps] [plan]
// PIMPAM_PROFILE='{"potPick":"one"}' starts with those settings; a plan step '*' presses on whichever option has the focus.
// With an output ending in .wav, only the sound is rendered (the pictures still drive the session, without being kept).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const SECONDS=+(process.env.PIMPAM_SECONDS||150),[html,id,out,fpsArg='30',planArg='']=process.argv.slice(2),FPS=+fpsArg,VOLUME=40,REVIEW_GAIN=4,video=!out.endsWith('.wav');
// The plan: press when the focus has stayed on this option for this long (s); the session ends some seconds after the last result.
const PLANS={destinations:[['La neu',1.2],['Una altra ronda',.8],['L’espai',1.2],['Canvia la tria',.8],['El bosc',1.2]],sounds:[['Els violins',1.2],['L’arpa',1.2],['Una altra ronda',.8],['La flauta',1.2]],
 // 0.18: a landscape that is not the one (the cave), then the right ones of three rounds; two shows, and all four musics in the long plan
 sources:[['Cova',1.2],['Platja',1.2],['Estany',1.2],['Rierol',1.2]],lights:[['Blau',1.2],['Espiral',1.2],['Arpa',1.2],['Rosa',1.2],['Palmera',1.2],['Banda',1.2]],
 lightslong:[['Blau',1],['Espiral',1],['Arpa',1],['Rosa',1],['Palmera',1],['Banda',1],['Verd',1],['Cascada',1],['Marimba',1],['Or',1],['Flor',1],['Cordes',1]],
 // 0.27: two recipes, so two shows (Medusa, Pegasus); with «Un ingredient sorpresa», one round of three presses
 pot:[['Pa',1.2],['Serp',1.2],['Ploma',1.2],['Cavall',1.2]],potone:[['*',1.2],['*',1.2],['*',1.2]],
 // the loudness of the eleven creatures, one after another (PIMPAM_PROFILE='{"scanOptions":4}')
 potlast:[['All',1],['Serp',1],['Pa',1],['Ocell',1],['Pa',1],['Cavall',1],['Pa',1],['Serp',1]],potrest:[['Ploma',1],['Cavall',1],['All',1],['Lleó',1],['Pa',1],['Brau',1],['Pa',1],['Cavall',1],['Pa',1],['Serp',1],['Pa',1],['Ocell',1]],potall:[['Ploma',1],['Cavall',1],['Ploma',1],['Lleó',1],['Ploma',1],['Ocell',1],['Ploma',1],['Serp',1],['All',1],['Gos',1],['All',1],['Serp',1],['All',1],['Lleó',1],['Pa',1],['Brau',1],['Pa',1],['Cavall',1],['Pa',1],['Serp',1],['Pa',1],['Ocell',1]]};
const plan=PLANS[id+planArg];if(!plan)throw Error('destinations, sounds, sources, lights or pot');
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.addInitScript(profile=>{window.__pimpamSoundLog=[];if(profile)try{localStorage.setItem('pimpam-profile',profile);}catch{}},process.env.PIMPAM_PROFILE||'');
await page.clock.install({time:new Date('2026-10-27T10:00:00Z')});await page.goto('file://'+html);await page.clock.pauseAt(new Date('2026-10-27T10:01:00Z'));
await page.clock.runFor(1500);await page.locator(`[data-start="${id}"]`).first().click();await page.waitForTimeout(3000);
const t0=await page.evaluate(()=>performance.now());
const tmp=out+'.frames';rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});
const status=()=>page.evaluate(()=>{const b=document.querySelector('[data-choice].scanned'),st=document.querySelector('#stage');return {label:(b?.getAttribute('aria-label')||b?.textContent||'').replace('▶','').trim(),phase:st?.dataset.phase,state:st?.dataset.scanState};});
let step=0,since=null,last='',ending=null,f=0,pressed=0;const marks=[];
for(let T=0;T<SECONDS;T+=1/FPS,f++){const s=await status();
 if(step<plan.length&&s.phase==='ready'){if(s.label!==last){last=s.label;since=T;}if((s.label===plan[step][0]||plan[step][0]==='*'&&s.label)&&T-since>=plan[step][1]){await page.keyboard.down('Space');await page.clock.runFor(40);await page.keyboard.up('Space');marks.push([T,plan[step][0]]);step++;last='';pressed=T;}}
 if(step>=plan.length&&ending===null&&s.phase==='ready'&&(s.state==='done'||T>pressed+1))ending=T;if(ending!==null&&T>ending+2.5)break;
 await page.clock.runFor(1000/FPS);if(video)writeFileSync(`${tmp}/${String(f).padStart(5,'0')}.jpg`,await page.screenshot({type:'jpeg',quality:90}));}
const TOTAL=f/FPS+1.5,log=await page.evaluate(()=>window.__pimpamSoundLog);
// The sound, offline, from the list kept by the page.
const MODULES=['kaleido-base.js','sampler.js','synth.js'];
const code=MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
const audioPage=await browser.newPage();await audioPage.setContent('<!doctype html><html><body></body></html>');
await audioPage.addScriptTag({content:'(()=>{'+code+'\nwindow.K={createSynth,loadSamples,sampleZone};})();'});
await audioPage.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
const decoded=await audioPage.evaluate(()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}}));
if(!decoded)console.warn('No recorded samples decoded.');
const {wav,peak}=await audioPage.evaluate(async([log,t0,total,volume,reviewGain])=>{const rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 const bus={main:K.createSynth(ctx,master),taste:K.createSynth(ctx,master)};let nature=null;
 for(const e of log){const T=Math.max(0,(e.t-t0)/1000)+.05;
  if(e.op==='play')bus[e.bus].play(e.event,T+e.delay,e.length,e.options);
  else if(e.op==='stop'){bus[e.bus].stop(e.fade,T);if(e.bus==='taste'&&nature){nature.g.gain.cancelScheduledValues(T);nature.g.gain.setValueAtTime(nature.g.gain.value,T);nature.g.gain.linearRampToValueAtTime(0,T+e.fade);try{nature.b.stop(T+e.fade+.02);}catch{}nature=null;}}
  else if(e.op==='nature'){const z=K.sampleZone('natureRec',0,e.name);if(!z)continue;const b=ctx.createBufferSource(),g=ctx.createGain(),t=T+e.delay,a=z.loopStart+z.shift;b.buffer=z.buffer;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(e.peak,t+.15);g.gain.setValueAtTime(e.peak,t+Math.max(.2,e.length-.35));g.gain.linearRampToValueAtTime(0,t+e.length);b.connect(g);g.connect(master);b.start(t,a+.5);b.stop(t+e.length+.05);nature={b,g};}}
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak};},[log,t0,TOTAL,VOLUME,REVIEW_GAIN]);
const summary=`${id}: ${(f/FPS).toFixed(1)} s, ${log.filter(e=>e.op==='play').length} notes, ${log.filter(e=>e.op==='nature').length} nature tastes; presses ${marks.map(([T,l])=>`${T.toFixed(1)} s ${l}`).join(', ')}; peak in the app ${(20*Math.log10(peak)).toFixed(1)} dBFS (volume 40 %), review copy +${(20*Math.log10(REVIEW_GAIN)).toFixed(0)} dB`;
if(!video){writeFileSync(out,Buffer.from(wav,'base64'));rmSync(tmp,{recursive:true,force:true});await browser.close();console.log(out,summary);if(errors.length)console.log('ERRORS',errors.join('\n'));process.exit(0);}
writeFileSync(`${tmp}/audio.wav`,Buffer.from(wav,'base64'));
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(FPS),'-i',`${tmp}/%05d.jpg`,'-i',`${tmp}/audio.wav`,'-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',out]);
writeFileSync(out.replace(/\.mp4$/,'.wav'),Buffer.from(wav,'base64'));
rmSync(tmp,{recursive:true,force:true});await browser.close();console.log(out,summary);if(errors.length)console.log('ERRORS',errors.join('\n'));
