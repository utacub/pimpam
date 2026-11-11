// Fractals a la natura (CE46, 0.74): the sound of one press of each form rendered offline as the app schedules it (the phrase of the
// press, the notes and accents of the growth events, the sound of the place), whole and in three stems (music, place, accents), with the
// loudness of each (ffmpeg ebur128), so the mix can be balanced by measurement. Audio only (no videos). Usage:
//   node tools/fractals-audio.mjs <outdir> [ids…]      (writes <id>.wav at +12 dB for listening, and prints a table)
import {createRequire} from 'node:module';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=path.resolve(new URL('..',import.meta.url).pathname),args=process.argv.slice(2),out=args.shift()||'/tmp/fr-audio';fs.mkdirSync(out,{recursive:true});
const require=createRequire(import.meta.url);let pw;for(const m of ['playwright','/opt/node22/lib/node_modules/playwright','/opt/node-tools/node_modules/playwright']){try{pw=require(m);break;}catch{}}
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});}).listen(0);
const port=srv.address().port,b=await pw.chromium.launch(),pg=await b.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto(`http://localhost:${port}/tools/fractals-prova.html`);await pg.waitForFunction(()=>window.ready);
await pg.addScriptTag({type:'module',content:`
import {frStart,frPress,frTick,frEvents,FR_MUSIC,FR_STIMS} from '../dist/fractals.js';
import {loadSamples,sampleZone} from '../dist/sampler.js';import {createSynth} from '../dist/synth.js';
window.FR_IDS=FR_STIMS.map(x=>x.id);
window.frRender=async(id,stem,volume=40)=>{await loadSamples({load:f=>fetch('../dist/assets/samples/'+f).then(r=>{if(!r.ok)throw new Error(f);return r.arrayBuffer();})});const s={frFirst:id,lock:true,waitCue:false,sound:true},g={};frStart(g,s);g.fractals.seed=12345;
 const F=g.fractals,notes=[],fx=[],LEAD=.3,dt=1/60;let t=0;frPress(g,s);const U=FR_MUSIC[id],amb=U.amb;
 for(;t<12;t+=dt){frTick(g,s,dt);frEvents(F,(ev,d,len)=>notes.push({at:F.t+d,ev,len}),(f,pan)=>fx.push({at:F.t,f,pan}));}
 for(const n of F.notes)notes.push({at:n.at,ev:n.ev,len:n.ev.len});
 const total=14,rate=48000,ctx=new OfflineAudioContext(2,rate*total,rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 const one=(bank,name,level,pan,when)=>{const z=sampleZone(bank,0,name);if(!z?.buffer)return 0;const o=ctx.createBufferSource(),gn=ctx.createGain(),p=ctx.createStereoPanner();o.buffer=z.buffer;gn.gain.value=level;p.pan.value=pan;o.connect(gn);gn.connect(p);p.connect(master);o.start(when,(z.offset||0)+z.shift,z.duration||undefined);return 1;};
 if(stem==='all'||stem==='music'){const synth=createSynth(ctx,master);for(const n of notes)synth.play(n.ev,LEAD+n.at,n.len);}
 let placed=0,acc=0;if((stem==='all'||stem==='place')&&amb)placed=one(amb[0],amb[1],amb[2],0,LEAD+.05);
 if(stem==='all'||stem==='acc')for(const x of fx)acc+=one(x.f[0],x.f[1],x.f[2],x.pan,LEAD+x.at);
 const buf=await ctx.startRendering(),N=buf.length,L=buf.getChannelData(0),R=buf.getChannelData(1),i16=new Int16Array(N*2);let peak=0;
 for(let i=0;i<N;i++){peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));i16[2*i]=Math.max(-1,Math.min(1,L[i]*4))*32767;i16[2*i+1]=Math.max(-1,Math.min(1,R[i]*4))*32767;}
 let bin='';const bytes=new Uint8Array(i16.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));
 return {pcm:btoa(bin),peak,rate,notes:notes.length,fx:fx.length,acc,placed};};
window.audioReady=true;`});
await pg.waitForFunction(()=>window.audioReady);
const ids=args.length?args:await pg.evaluate(()=>window.FR_IDS);
const lufs=file=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostats','-v','verbose','-f','s16le','-ar','48000','-ac','2','-i',file,'-af','ebur128=peak=true:framelog=verbose','-f','null','-'],{encoding:'utf8'});
 const I=[...r.stderr.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop(),M=[...r.stderr.matchAll(/ M:\s*(-?[\d.]+)/g)].map(m=>+m[1]);return [I?+I[1]-12:NaN,M.length?Math.max(...M)-12:NaN];};
console.log('id          all I/Mmax     music I/Mmax   place I/Mmax   acc I/Mmax   (LUFS at volume 40 %; notes, accents)');
for(const id of ids){const row=[id.padEnd(11)];let info='';
 for(const stem of ['all','music','place','acc']){const r=await pg.evaluate(a=>frRender(...a),[id,stem]);const raw=path.join(out,`${id}_${stem}.raw`);fs.writeFileSync(raw,Buffer.from(r.pcm,'base64'));
  const [I,M]=lufs(raw);row.push(`${I.toFixed(1).padStart(6)}/${M.toFixed(1).padStart(6)}`);if(stem==='all'){info=`${r.notes} notes, ${r.acc} accents`;spawnSync('ffmpeg',['-v','error','-y','-f','s16le','-ar','48000','-ac','2','-i',raw,path.join(out,id+'.wav')]);}fs.unlinkSync(raw);}
 console.log(row.join('  '),' ',info);}
await b.close();srv.close();
