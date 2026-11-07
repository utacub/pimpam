// 0.49 · The five dives (Fons marí de vidre, Selva de llum, Sabana de paper, El pou del temps, Gegants del blau) play pre-rendered videos
// when the app is served over the web (at Marc's request of 7 November 2026): one MP4 per scene (1920×1080, H.264 High 8-bit, 30 fps since 0.50.1, AAC,
// with its music), made frame by frame from the same WebGL engine. The video of scene N starts where scene N−1 rests, so pressing again
// goes on from the last frame. Tablets no longer have to compile and draw the shaders live.
// Files: videos/<folder>/<folder>_escena_NN.mp4 next to index.html. Where they cannot be played (the single offline file opened from disk,
// or a file missing), the live WebGL drawing and its music are used, as before.
// Two <video> elements take turns: one shows the scene, the other loads the next. Their sound goes into the app's master gain (volume and
// mute as in every activity). The videos are mixed at about −20.8 LUFS each; the live music of the dives sits at about −33.7 LUFS at
// volume 100 %, so VD_GAIN × 0.35 (master at 100 %) ≈ −12.9 dB keeps the same loudness as before.
const VD_DIR=Object.freeze({jelly:'fons',jungle:'selva',savanna:'sabana',well:'pou',giants:'gegants'});
export const VD_IDS=Object.freeze(Object.keys(VD_DIR));
const VD_N=20,VD_GAIN=.647,VD_TAIL=1.2,VD_STILL=8;
let VD=null;
export function vdAvailable(){return typeof document!=='undefined'&&typeof location!=='undefined'&&/^https?:$/.test(location.protocol)&&!globalThis.PIMPAM_NO_VIDEO;}
export function vdUrl(id,v){const d=VD_DIR[id];return `./videos/${d}/${d}_escena_${String((v%VD_N)+1).padStart(2,'0')}.mp4`;}
// Is this dive playing its videos now? (false: the live drawing is used)
export function vdOn(id){return !!VD&&VD.id===id&&!VD.failed;}
function vdMake(){const el=document.createElement('video');el.playsInline=true;el.setAttribute('playsinline','');el.setAttribute('webkit-playsinline','');el.preload='auto';el.disableRemotePlayback=true;el.muted=false;return el;}
function vdSet(i,v){const el=VD.els[i];if(VD.scene[i]===v)return;VD.scene[i]=v;el.vdErr=false;el.src=vdUrl(VD.id,v);try{el.load();}catch{}}
// Opening a dive: the first scene is shown at its first frame (the place where the journey starts), the second one loads.
export function vdStart(id,audio,master){vdStop();if(!VD_DIR[id]||!vdAvailable())return false;
 const els=[vdMake(),vdMake()];VD={id,els,cur:0,scene:[-1,-1],want:null,failed:false,routed:false,gains:[],pending:false,snap:null,snapScene:-2,unlock:null};
 els.forEach(el=>el.addEventListener('error',()=>{el.vdErr=true;if(VD&&VD.els===els&&el===els[VD.cur])VD.failed=true;}));
 vdSet(0,0);vdSet(1,1);vdRoute(audio,master);
 // iOS and some tablets only let a video play with sound after a gesture. Opening the activity is one (a click or a key), and so is the
 // first touch, click or key inside it: each plays both elements for a moment, silent through their gain, and stops them again.
 const unlock=()=>{if(!VD||VD.els!==els)return;els.forEach((el,i)=>{if(!el.paused||(i===VD.cur&&VD.want!==null))return;const g=VD.gains[i];if(g)g.gain.value=0;
  const done=()=>{if(VD&&VD.els===els&&!(i===VD.cur&&VD.want!==null)){el.pause();try{el.currentTime=0;}catch{}}if(g)g.gain.value=VD_GAIN;};
  try{const p=el.play();if(p&&p.then)p.then(done,done);else done();}catch{done();}});};
 VD.unlock=unlock;for(const ev of ['pointerdown','keydown','touchend'])document.addEventListener(ev,unlock,{once:true,capture:true});
 unlock();return true;}
function vdRoute(audio,master){if(!VD||VD.routed||!audio||!master)return;VD.routed=true;try{VD.gains=VD.els.map(el=>{const src=audio.createMediaElementSource(el),g=audio.createGain();g.gain.value=VD_GAIN;src.connect(g);g.connect(master);return g;});}catch{VD.gains=[];}}
export function vdStop(){if(!VD)return;for(const el of VD.els){try{el.pause();el.removeAttribute('src');el.load();}catch{}}
 if(VD.unlock)for(const ev of ['pointerdown','keydown','touchend'])document.removeEventListener(ev,VD.unlock,{capture:true});
 for(const g of VD.gains||[])try{g.disconnect();}catch{}VD=null;}
// The loading cover waits until the first scene can play.
export function vdLoadShare(){if(!VD)return 1;if(VD.failed)return 1;const el=VD.els[VD.cur];return el.readyState>=3?1:el.readyState>=1?.6:.2;}
// A press: scene v starts from its first frame. Its length is the video's own (2 s of travelling, 12 s of scene, 1.2 s for the sound to
// fade; 5 s more for the climb after the twentieth); fallback: the length the live dive would take.
export function vdPress(v,fallback){if(!VD)return fallback;const old=VD.els[VD.cur];
 let i=VD.scene.indexOf(v);if(i<0){i=1-VD.cur;vdSet(i,v);}
 if(i!==VD.cur){try{old.pause();}catch{}}
 VD.cur=i;VD.want=v;const el=VD.els[i];if(el.vdErr){VD.failed=true;return fallback;}
 try{el.currentTime=0;}catch{}VD.pending=false;
 return Number.isFinite(el.duration)&&el.duration>0?el.duration:fallback;}
// Every frame while a dive is open: the sound goes to the app's master gain once there is one; the video of the scene plays only while the
// activity runs (not paused, no dialog open, page visible), and the next scene loads once the current one can play.
export function vdSync(game,active,sound,volume,audio,master){if(!vdOn(game?.item?.id))return;
 vdRoute(audio,master);
 const el=VD.els[VD.cur],other=VD.els[1-VD.cur];
 for(const e of VD.els){e.muted=!sound;e.volume=VD.gains.length?1:Math.max(0,Math.min(1,volume/100*.35*VD_GAIN));}
 const running=game.time!==null&&VD.want!==null&&VD.scene[VD.cur]===VD.want;
 if(running&&active){if(el.paused&&!el.ended&&!VD.pending&&game.time<(game.duration||Infinity)){VD.pending=true;const p=el.play();if(p&&p.then)p.then(()=>{VD.pending=false;},()=>{VD.pending=false;if(!el.muted){el.muted=true;el.play().catch(()=>{});}});else VD.pending=false;}}
 else if(!el.paused)el.pause();
 if(!other.paused)other.pause();
 const next=((VD.want??-1)+1)%VD_N;if(el.readyState>=3&&VD.scene[1-VD.cur]!==next)vdSet(1-VD.cur,next);}
// The clock of the press follows the video (it waits while the video loads more, and ends when the video ends).
export function vdTime(game){if(!vdOn(game?.item?.id)||VD.scene[VD.cur]!==VD.want)return;const el=VD.els[VD.cur];
 if(el.ended){game.time=Math.max(game.time,game.duration);return;}
 if(Number.isFinite(el.duration)&&el.duration>0&&Math.abs(game.duration-el.duration)>.05&&game.duration<1e6){game.duration=el.duration;game.audioDuration=el.duration;}
 if(el.readyState>=2)game.time=el.paused&&VD.pending?Math.min(game.time,el.currentTime+.05):Math.min(game.time,el.currentTime+.1);}
// What the waiting picture depends on (the still picture is kept and copied once the scene has stopped).
export function vdKey(){if(!VD)return 'off';const el=VD.els[VD.cur];return [VD.cur,VD.scene[VD.cur],el.readyState>=2?1:0,el.paused?Math.round(el.currentTime*10):'p'].join(':');}
// The picture: the frame of the video, filling the screen (cut at most about 15 % on screens of another shape; black bands beyond that),
// darkened while it waits for the next press. With «Reducció de moviment», each scene is shown still (the frame VD_STILL s in) while
// its music plays.
function vdFit(c,w,h,src,sw,sh){const cover=Math.max(w/sw,h/sh),contain=Math.min(w/sw,h/sh),k=Math.min(cover,contain*1.15),dw=sw*k,dh=sh*k;c.drawImage(src,(w-dw)/2,(h-dh)/2,dw,dh);}
export function vdDraw(c,w,h,reduced,dark){if(!VD)return false;const el=VD.els[VD.cur];
 c.save();c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,w,h);
 const ready=el.readyState>=2&&el.videoWidth>0;
 if(ready&&reduced){const take=VD.snap===null||(VD.snapScene!==VD.want&&(el.currentTime>=VD_STILL||el.ended))||(VD.want===null&&VD.snapScene!==-1);
  if(take){const s=VD.snap||document.createElement('canvas');s.width=el.videoWidth;s.height=el.videoHeight;s.getContext('2d').drawImage(el,0,0);VD.snap=s;VD.snapScene=VD.want===null?-1:VD.want;}}
 if(reduced&&VD.snap)vdFit(c,w,h,VD.snap,VD.snap.width,VD.snap.height);else if(ready)vdFit(c,w,h,el,el.videoWidth,el.videoHeight);
 if(dark>.002){c.fillStyle=`rgba(3,5,14,${Math.min(.9,dark).toFixed(3)})`;c.fillRect(0,0,w,h);}
 c.restore();return ready;}
export const VD_TAIL_S=VD_TAIL;
