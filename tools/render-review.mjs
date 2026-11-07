// Review videos for Caleidoscopi (CE21, also with «Contrast alt»), Vitralls (CE22), Natura (CE23), Piromusical (CE24), Dibuixos que ballen (CE32),
// Joguines que ballen (CE33) and La cuina que balla (CE34): each pattern from rest, through the press, to rest again, with its own music.
// Frames come from the collection's modules and the audio from synth.js (with the recorded instruments of sampler.js), rendered offline exactly as the app schedules it. Requires FFmpeg.
// Usage: node tools/render-review.mjs <output-dir> [width] [height] [fps] [duration] [first plan] [last plan] [round] [kaleido|kaleido-contrast|vitrall|natura|piro|drawings|toys|kitchen] [video-dir]
// With a video-dir (earlier review videos of the same collection, size, frame rate, duration and round, whose pictures have not changed),
// only the audio is rendered again: the pictures of each earlier video are copied unchanged, with their contact sheet.
import {openHarness} from './kaleido-harness.mjs';
import {mkdirSync,writeFileSync,rmSync,copyFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const [out='review',width='1280',height='720',fpsArg='60',durationArg='8',firstArg='1',lastArg='20',roundArg='0',COLLECTION_NAME='kaleido',VIDEO_DIR='']=process.argv.slice(2);
const W=+width,H=+height,FPS=+fpsArg,D=+durationArg,ROUND=+roundArg,LEAD=.6,TAIL=1.2,TOTAL=LEAD+D+TAIL,VOLUME=40,REVIEW_GAIN=4;
mkdirSync(out,{recursive:true});
const {browser,page}=await openHarness(W,H);
await page.addScriptTag({content:`
window.frameAt=(index,t,duration,seed,collection)=>{const cv=document.getElementById('c');if(t<0||t>duration){const c=cv.getContext('2d');c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);}else paint({index,t,duration,reduced:false,seed,collection});return cv.toDataURL('image/jpeg',.93);};
window.renderAudio=async(index,duration,lead,total,volume,seed,reviewGain,collection)=>{const rate=48000,ctx=new OfflineAudioContext(2,Math.ceil(rate*total),rate),master=ctx.createGain();master.gain.value=volume/100*.35;master.connect(ctx.destination);
 // Same rule as playPatternAudio in app.js: onsets and lengths are fractions of the effect's duration; at the end the group fades over 1.2 s.
 const synth=K.createSynth(ctx,master);for(const e of COLLECTION(collection).score(index,duration,seed))synth.play(e,lead+e.at*duration,Math.min(duration*e.length,duration-e.at*duration));synth.stop(1.2,lead+duration);
 const buf=await ctx.startRendering(),n=buf.length,data=new DataView(new ArrayBuffer(44+n*4)),str=(o,s)=>[...s].forEach((ch,i)=>data.setUint8(o+i,ch.charCodeAt(0)));
 str(0,'RIFF');data.setUint32(4,36+n*4,true);str(8,'WAVEfmt ');data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,2,true);data.setUint32(24,rate,true);data.setUint32(28,rate*4,true);data.setUint16(32,4,true);data.setUint16(34,16,true);str(36,'data');data.setUint32(40,n*4,true);
 // The same fixed gain for every pattern (not per-clip normalisation), so the review keeps the balance between patterns.
 const L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));for(let i=0;i<n;i++){data.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*reviewGain))*32767,true);data.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*reviewGain))*32767,true);}
 let bin='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));return {wav:btoa(bin),peak};};
`});
const decoded=await page.evaluate(()=>loadRecorded());if(!decoded)console.warn('No recorded samples decoded: the built-in fallbacks will play.');
const {patterns,code}=await page.evaluate(name=>{const C=COLLECTION(name);return {patterns:C.patterns,code:C.code};},COLLECTION_NAME);
for(let index=+firstArg-1;index<+lastArg;index++){
 const name=`${code}_${String(patterns[index].plan).padStart(2,'0')}_${patterns[index].id}`,tmp=`${out}/.frames_${index}`;rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});
 const frames=VIDEO_DIR?0:Math.round(TOTAL*FPS);
 for(let f=0;f<frames;f++){const url=await page.evaluate(({index,t,D,seed,collection})=>frameAt(index,t,D,seed,collection),{index,t:f/FPS-LEAD,D,seed:ROUND,collection:COLLECTION_NAME});writeFileSync(`${tmp}/${String(f).padStart(5,'0')}.jpg`,Buffer.from(url.split(',')[1],'base64'));}
 const {wav,peak}=await page.evaluate(({index,D,LEAD,TOTAL,VOLUME,ROUND,REVIEW_GAIN,COLLECTION_NAME})=>renderAudio(index,D,LEAD,TOTAL,VOLUME,ROUND,REVIEW_GAIN,COLLECTION_NAME),{index,D,LEAD,TOTAL,VOLUME,ROUND,REVIEW_GAIN,COLLECTION_NAME});writeFileSync(`${tmp}/audio.wav`,Buffer.from(wav,'base64'));
 const mp4=`${out}/${name}.mp4`;
 if(VIDEO_DIR){execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',`${VIDEO_DIR}/${name}.mp4`,'-i',`${tmp}/audio.wav`,'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',mp4]);
  copyFileSync(`${VIDEO_DIR}/${name}_tira.jpg`,`${out}/${name}_tira.jpg`);rmSync(tmp,{recursive:true,force:true});console.log(mp4,`(imatge de ${VIDEO_DIR}) pic a l'app ${(20*Math.log10(peak)).toFixed(1)} dBFS (volum 40 %); còpia de revisió +${(20*Math.log10(REVIEW_GAIN)).toFixed(0)} dB`);continue;}
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(FPS),'-i',`${tmp}/%05d.jpg`,'-i',`${tmp}/audio.wav`,'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',mp4]);
 // Contact sheet: eight moments from the press to the dissolve.
 const picks=[.05,.5,1.2,2.2,3.2,4.2,5.4,7.6].map(t=>t*D/8).map(t=>`${tmp}/${String(Math.round((t+LEAD)*FPS)).padStart(5,'0')}.jpg`);
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...picks.flatMap(p=>['-i',p]),'-filter_complex',`${picks.map((_,i)=>`[${i}]scale=400:-1[s${i}]`).join(';')};${picks.map((_,i)=>`[s${i}]`).join('')}hstack=inputs=${picks.length}`,`${out}/${name}_tira.jpg`]);
 rmSync(tmp,{recursive:true,force:true});console.log(mp4,`pic a l'app ${(20*Math.log10(peak)).toFixed(1)} dBFS (volum 40 %); còpia de revisió +${(20*Math.log10(REVIEW_GAIN)).toFixed(0)} dB`);
}
await browser.close();
