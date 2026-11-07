import {pdActs,pdMedia,pdClean,pdMarks} from './persona-dades.js';
import {tcWaitRange,tcLeave} from './toc.js';
import {TL_STRIP,tlRound} from './tauler.js';
import {scanExtend} from './scan-catalog.js';
import {plAct,plMediaIs,plUrl,plRoutable,PL_GAIN} from './pellicules.js';

// ---------- Activitats personalitzades (0.44): the mechanics and the time ----------
// Each activity made by a family or a professional takes one of five mechanics of Pim Pam, with the photos, videos and music they add;
// nothing else can be changed or programmed (Marc, 4 November 2026). The three of cause and effect (a press) and the two of scanning:
//  · album  «Àlbum de sorpreses»: like the dives and the shows, each press brings the next photo or video, with a transition of its own.
//  · pas    «Descobreix pas a pas»: like the stories, the photo is hidden under paper pieces; each press takes some away, the last one
//           shows it whole, with its sound. The waiting cue darkens the scene between presses.
//  · moment «Qui s’amaga?»: like Toc, toc!, somebody knocks behind the curtain after a wait (tcWait, tcLeave) and a press opens it.
//  · tria   «Tria i mira»: like the scanning boards, 2 to 4 photos; the one chosen opens to the whole screen.
//  · troba  «Escolta i troba»: like Detectius de sons, a sound is heard and the photo it belongs to is found; another one only plays
//           its own sound (no sign of a mistake) and the clue can be heard again.
// There are no hold activities (Marc, 3 November 2026).
export const PS_TEMPLATES=Object.freeze({
 album:Object.freeze({type:'ce',name:'Àlbum de sorpreses',short:'Cada pulsació, una foto o un vídeo',desc:'Cada pulsació porta la foto o el vídeo següent, amb una entrada diferent i la seva música o el seu so.',min:1,level:'01 · Descobrir'}),
 pas:Object.freeze({type:'ce',name:'Descobreix pas a pas',short:'Les peces de paper s’aparten',desc:'La foto o el vídeo s’amaga sota peces de paper de colors. Cada pulsació n’aparta unes quantes; a l’última apareix sencer amb el seu so.',min:1,level:'03 · Pas a pas'}),
 moment:Object.freeze({type:'ce',name:'Qui s’amaga?',short:'Esperar i prémer quan truquen',desc:'Darrere el teló hi ha algú. Quan truquen i el teló es mou, una pulsació l’obre i apareix la foto o el vídeo.',min:1,level:'04 · Al moment'}),
 // 0.46 (Marc, 6 November 2026): a video that goes on a stretch at every press; at each pause it stops and the screen darkens until the
 // next press. The pauses come every few seconds or at the moments marked on the video in the editor.
 video:Object.freeze({type:'ce',name:'Vídeo a poc a poc',short:'El vídeo avança a cada pulsació',desc:'Cada pulsació fa avançar el vídeo un tros. A cada pausa el vídeo s’atura i la pantalla s’enfosqueix fins a la pulsació següent. Les pauses arriben cada pocs segons o als moments que hi marqueu.',min:1,level:'03 · Pas a pas',videoOnly:true}),
 tria:Object.freeze({type:'scan',name:'Tria i mira',short:'Encercament: triar una foto',desc:'Encercament amb 2, 3 o 4 fotos o vídeos a la pantalla. El que es tria s’obre a tota la pantalla i sona.',min:2,level:'04 · Triar'}),
 troba:Object.freeze({type:'scan',name:'Escolta i troba',short:'Encercament: d’on ve el so?',desc:'Sona un so (una veu, una cançó, un soroll) i cal trobar la foto o el vídeo que li correspon. Cada element necessita el seu so.',min:2,level:'05 · Relacionar',needSound:true})});
export const PS_FOLDER='personal';
// the activities of this device, kept in memory for the menu (the media are read only when an activity opens)
let PS_ACTS=[],PS_READY=null,PS_LISTENERS=[],PS_OWNER='guest';
// 0.46: the folder shows only the activities of the user who is playing (usuaris.js); the guest has those with no owner.
export const psOwner=()=>PS_OWNER;
export function psSetOwner(id){PS_OWNER=id||'guest';PS_READY=psReload();return PS_READY;}
export const psIs=id=>typeof id==='string'&&id.startsWith('pp-');
export function psInit(){if(!PS_READY)PS_READY=psReload();return PS_READY;}
async function psReload(){try{PS_ACTS=(await pdActs()).filter(a=>(a.owner||'guest')===PS_OWNER).map(pdClean).sort((a,b)=>a.created-b.created);}catch{PS_ACTS=[];}for(const f of PS_LISTENERS)try{f();}catch{}return PS_ACTS;}
export const psOnChange=f=>PS_LISTENERS.push(f);
export const psActs=()=>PS_ACTS;
export const psAct=id=>PS_ACTS.find(a=>a.id===id)||plAct(id); // 0.50: also the films of «Petites pel·lícules» (pellicules.js)
// An activity as a card of the catalogue: the code PE01, PE02… in the order they were made.
// the name and the child are written by the family: they are escaped here, since the catalogue goes into the HTML of the menu
const psEsc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function psCatalogItem(a,i){const T=PS_TEMPLATES[a.tpl]||PS_TEMPLATES.album,n=a.items.length;return Object.freeze({id:a.id,code:'PE'+String(i+1).padStart(2,'0'),type:T.type,persona:true,recorded:true,tpl:a.tpl,name:psEsc(a.name),desc:(a.child?`Per a ${psEsc(a.child)}. `:'')+T.desc,level:T.level,tag:`${T.name} · ${n} ${n===1?'element':'elements'}`,time:T.type==='scan'?'1 o 2 commutadors':'Al teu ritme',kind:T.type==='scan'?'scan':'persona',task:a.tpl==='troba'?'guided':'free'});}
export const psItems=()=>PS_ACTS.map(psCatalogItem);
export const psItem=id=>{const i=PS_ACTS.findIndex(a=>a.id===id);return i<0?null:psCatalogItem(PS_ACTS[i],i);};
// What an activity still needs before it can be played (for the editor): too few elements, or a missing sound in Escolta i troba.
export function psProblems(a,media){const T=PS_TEMPLATES[a.tpl],out=[];if(!T)return ['Cal triar una mecànica.'];if(a.items.length<T.min)out.push(T.min===1?'Cal afegir com a mínim una foto o un vídeo.':`Cal afegir com a mínim ${T.min} fotos o vídeos.`);
 if(T.needSound&&a.items.some(it=>!it.sound&&!(media?.get(it.media)?.kind==='video'&&media.get(it.media).sound)))out.push('A «Escolta i troba» cada foto necessita el seu so (un vídeo pot fer servir el seu propi so).');if(a.musicMode==='own'&&!a.music&&!T.videoOnly)out.push('Falta el fitxer de la música de l’activitat (o trieu una altra opció de música).');
 if(T.videoOnly&&media&&a.items.some(it=>media.get(it.media)&&media.get(it.media).kind!=='video'))out.push('A «Vídeo a poc a poc» només hi pot haver vídeos: traieu les fotos o trieu una altra mecànica.');return out;}

// ---------- The media of the activity that is open ----------
// Photos are decoded once (ImageBitmap); videos and sounds are media elements whose sound goes through the audio graph of the app (a
// gain with the loudness of the file, under the volume of the profile), so everything sounds about as loud as the rest of Pim Pam.
let PS_CUR=null;
const psNow=()=>typeof performance!=='undefined'?performance.now()/1000:0;
async function psLoadMedia(P,id){if(!id||P.media.has(id))return;const h={id,rec:null,bmp:null,el:null,url:null,ready:false,g:null,until:null,playing:false};P.media.set(id,h);
 // 0.50: a sequence of a film is a file next to the app (not in the database of the device)
 try{const film=plMediaIs(id),rec=film?{kind:'video',sound:true,gain:PL_GAIN}:await pdMedia(id);if(!rec)throw Error('missing');h.rec=rec;if(P.closed)return;if(film)h.noRoute=!plRoutable();
  if(rec.kind==='image'){h.bmp=await createImageBitmap(rec.blob);}
  else{h.url=film?null:URL.createObjectURL(rec.blob);const el=document.createElement(rec.kind==='video'?'video':'audio');el.preload='auto';el.playsInline=true;el.muted=true;el.src=film?plUrl(id):h.url;h.el=el;
   await new Promise(res=>{const done=()=>{clearTimeout(t);res();},t=setTimeout(done,15000);el.addEventListener(rec.kind==='video'?'loadeddata':'canplay',done,{once:true});el.addEventListener('error',()=>{if(film)h.failed=true;done();},{once:true});});
   if(rec.kind==='video'&&el.duration>1.2&&P.tpl!=='video'){el.currentTime=Math.min(1,el.duration/3);await new Promise(res=>{const t=setTimeout(res,3000);el.addEventListener('seeked',()=>{clearTimeout(t);res();},{once:true});});}}
 }catch{h.failed=true;}h.ready=true;P.loaded++;}
export function psStart(game,s){psStop();const a=psAct(game.item.id);if(!a)return;const T=PS_TEMPLATES[a.tpl];
 const P={act:a,tpl:a.tpl,T,media:new Map(),need:0,loaded:0,closed:false,k:0,cur:-1,prev:-1,phase:a.tpl==='moment'?'wait':a.tpl==='pas'||a.tpl==='video'?'cover':'idle',vi:0,seg:0,stops:null,target:0,t:0,show:0,trans:0,done:0,dark:1,queue:[],seed:(Math.random()*1e6)|0,order:[],knocks:0,again:0,wait:0,wake:0,bus:null,paused:[],started:psNow()};
 const ids=new Set();for(const it of a.items){ids.add(it.media);if(it.sound)ids.add(it.sound);}if(a.musicMode==='own'&&a.music)ids.add(a.music);P.need=ids.size;if(a.film)psFilmKeep(P);else for(const id of ids)psLoadMedia(P,id);
 P.settings=s;P.order=psOrder(P,0);if(a.tpl==='pas'){P.cur=P.order[0];psTiles(P);}if(a.tpl==='moment')P.wait=psWaitFor(P,s);if(a.tpl==='video')P.cur=0;game.persona=P;PS_CUR=P;}
export function psLoadShare(game){const P=game?.persona;if(!P)return 1;if(P.act.film){const h=psMediaOf(P,P.act.items[0]?.media);return h?.ready?1:.3;}return P.need?P.loaded/P.need:1;}
// 0.50 · a film keeps loaded only the sequence it is on and the next one (21 videos at once would fight for the network and the memory)
function psFilmKeep(P){const n=P.act.items.length,keep=new Set([P.vi%n,(P.vi+1)%n].map(i=>P.act.items[i].media));
 for(const [id,h] of P.media)if(!keep.has(id)){try{h.el?.pause();}catch{}if(h.el){h.el.removeAttribute('src');try{h.el.load();}catch{}}try{h.g?.disconnect();h.src?.disconnect();}catch{}P.media.delete(id);}
 for(const id of keep)psLoadMedia(P,id);}
function psFilmNext(P){const n=P.act.items.length,h=psMediaOf(P,P.act.items[(P.vi+1)%n]?.media);return h;}
export function psStop(){const P=PS_CUR;PS_CUR=null;if(!P)return;P.closed=true;for(const h of P.media.values()){try{h.el?.pause();}catch{}try{h.bmp?.close?.();}catch{}if(h.el){h.el.removeAttribute('src');try{h.el.load();}catch{}}if(h.url)URL.revokeObjectURL(h.url);try{h.g?.disconnect();h.src?.disconnect();}catch{}}P.media.clear();try{P.bus?.disconnect();}catch{}}
// The order of the elements: as listed, or shuffled at every lap when the activity asks for it.
function psOrder(P,lap){const n=P.act.items.length,list=Array.from({length:n},(_,i)=>i);if(P.act.order!=='shuffle')return list;let x=(P.seed+lap*7919)>>>0;for(let i=n-1;i>0;i--){x=(x*1103515245+12345)>>>0;const j=x%(i+1);[list[i],list[j]]=[list[j],list[i]];}if(lap&&n>1&&list[0]===P.lastShown)[list[0],list[1]]=[list[1],list[0]];return list;}
const psItemAt=(P,i)=>P.act.items[i]||null;
export const psMediaOf=(P,id)=>P?.media.get(id)||null;
// How long an element is shown: a photo the time of the profile (or the length of its own sound, from 3 to 40 s); a video its length,
// up to the limit of the activity.
export function psShowTime(P,item,s){const m=psMediaOf(P,item?.media),snd=item?.sound?psMediaOf(P,item.sound):null,sd=snd?.rec?.dur;
 if(m?.rec?.kind==='video'){const d=m.el&&Number.isFinite(m.el.duration)?m.el.duration:m.rec.dur||8;return Math.max(2,Math.min(P.act.videoMax||30,d));}
 if(sd>0)return Math.max(3,Math.min(40,sd));return Math.max(2,Math.min(15,s.duration||6));}

// ---------- Sound ----------
// The queue is played by psAudio, called every frame by the app with its audio context, its master gain and its way of playing the notes
// of the recorded instruments of Pim Pam.
const psQ=(P,op)=>{if(P)P.queue.push(op);};
function psHandle(P,audio,h){if(!h?.el||h.g||h.noRoute||!audio||!P.bus)return h;try{h.src=audio.createMediaElementSource(h.el);h.g=audio.createGain();h.g.gain.value=0;h.src.connect(h.g);h.g.connect(P.bus);h.el.muted=false;}catch{h.g=null;}return h;}
function psFadeTo(audio,h,level,fade){if(!h.g||!audio)return;const t=audio.currentTime;h.g.gain.cancelScheduledValues(t);h.g.gain.setValueAtTime(h.g.gain.value,t);h.g.gain.linearRampToValueAtTime(level,t+Math.max(.02,fade));}
// Plays a media element (a sound, the music or the sound of a video) from a point and for a length, with fades.
function psPlay(P,audio,s,h,from,len,fadeIn=.05,fadeOut=.6){if(!h?.el||h.failed)return 0;psHandle(P,audio,h);const el=h.el;try{if(from!==null&&from!==undefined)el.currentTime=Math.max(0,from);}catch{}
 const level=(h.rec?.gain||1)*(s.sound?1:0);if(h.g){h.g.gain.cancelScheduledValues(audio.currentTime);h.g.gain.setValueAtTime(fadeIn>.05?0:h.g.gain.value,audio.currentTime);psFadeTo(audio,h,level,fadeIn);}
 h.until=len>0?(el.currentTime||0)+len:null;h.fadeOut=fadeOut;h.level=level;h.playing=true;const p=el.play?.();p?.catch?.(()=>{h.playing=false;});return len;}
function psHush(P,audio,h,fade=.3){if(!h?.el||!h.playing)return;if(h.g&&audio){psFadeTo(audio,h,0,fade);h.until=(h.el.currentTime||0)+fade;h.fadeOut=0;}else{try{h.el.pause();}catch{}h.playing=false;}}
// The music of the activity goes on from where it stopped at every press (so the next photo goes on with the song).
function psMusic(P){return P.act.musicMode==='own'&&P.act.music?psMediaOf(P,P.act.music):null;}
// What sounds with an element: its own sound; else the sound of the video; else the music of the activity; else a phrase of the
// recorded instruments of Pim Pam (a harp, a marimba, a kalimba, a vibraphone and pizzicato cellos); with «Sense música», nothing.
function psSoundOf(P,item){const m=psMediaOf(P,item?.media);if(item?.sound)return {kind:'own',h:psMediaOf(P,item.sound)};if(m?.rec?.kind==='video'&&m.rec.sound)return {kind:'video',h:m};const mu=psMusic(P);if(mu)return {kind:'music',h:mu};return {kind:P.act.musicMode==='none'?'none':'pimpam'};}
export function psAudio(game,s,audio,master,play){const P=game?.persona;if(!P||!audio)return;if(!P.bus){P.bus=audio.createGain();P.bus.gain.value=1;P.bus.connect(master);}
 for(const h of P.media.values())if(h.el&&!h.g&&h.ready)psHandle(P,audio,h);
 for(const h of P.media.values())if(h.noRoute&&h.el){h.el.muted=!s.sound||P.showing!==h.id;h.el.volume=Math.max(0,Math.min(1,(s.volume??100)/100*.35*(h.rec?.gain||1)));}
 const running=audio.state==='running';
 while(P.queue.length){const op=P.queue.shift();if(!running&&op.op!=='hush')continue;
  if(op.op==='item'){const item=psItemAt(P,op.i),snd=psSoundOf(P,item),v=psMediaOf(P,item?.media);if(v?.rec?.kind==='video'&&v.el){if(v.g)psFadeTo(audio,v,snd.kind==='video'?(v.rec.gain||1)*(s.sound?1:0):0,.05);}
   if(snd.kind==='own')psPlay(P,audio,s,snd.h,0,op.len,.05,.5);else if(snd.kind==='music')psPlay(P,audio,s,snd.h,P.musicPos||0,op.len,.35,.8);else if(snd.kind==='pimpam')for(const e of psPhrase(P.tpl==='pas'?'final':'show',P.k+P.seed,op.len))play(e.e,e.at,e.len);}
  else if(op.op==='step'){const mu=psMusic(P);if(mu)psPlay(P,audio,s,mu,P.musicPos||0,2.4,.25,.7);else if(P.act.musicMode!=='none')for(const e of psPhrase('step',op.n,2.2))play(e.e,e.at,e.len);for(const e of psPhrase('paper',op.n,1))play(e.e,e.at,e.len);}
  else if(op.op==='knock'){for(const e of psPhrase('knock',op.n,1.2))play(e.e,e.at,e.len);}
  else if(op.op==='open'){for(const e of psPhrase('open',P.k,1.4))play(e.e,e.at,e.len);}
  else if(op.op==='close'){for(const e of psPhrase('close',P.k,1.2))play(e.e,e.at,e.len);}
  else if(op.op==='taste'){const item=psItemAt(P,op.i),snd=item&&psSoundOf(P,item);if(snd&&(snd.kind==='own'||snd.kind==='video'))psPlay(P,audio,s,snd.h,0,op.len,.05,.15);else if(op.click)play({inst:'woodblockRec',midi:[0],vel:.32,variant:'claves'},.03,.2);}
  else if(op.op==='unhush'){const h=psMediaOf(P,op.id),item=P.act.items.find(it=>it.media===op.id);if(h&&item&&psSoundOf(P,item).kind==='video')psFadeTo(audio,h,(h.rec.gain||1)*(s.sound?1:0),.4);}
  else if(op.op==='hush'){for(const h of P.media.values())psHush(P,audio,h,op.fade);}
  else if(op.op==='vplay'){const h=psMediaOf(P,op.id);if(h){psHandle(P,audio,h);if(h.g){h.g.gain.cancelScheduledValues(audio.currentTime);h.g.gain.setValueAtTime(0,audio.currentTime);psFadeTo(audio,h,(h.rec?.gain||1)*(s.sound?1:0),.12);}}}
  else if(op.op==='vfade'){const h=psMediaOf(P,op.id);if(h)psFadeTo(audio,h,0,op.fade);}}
 // a sound reaches its end: it fades and stops; the music remembers where it was
 for(const h of P.media.values()){if(!h.playing||!h.el)continue;const ct=h.el.currentTime||0;if(h.until!==null&&ct>=h.until-(h.fadeOut||0)&&h.fadeOut>0){psFadeTo(audio,h,0,h.fadeOut);h.fadeOut=0;}
  if(h.until!==null&&ct>=h.until||h.el.ended){if(h===psMusic(P))P.musicPos=h.el.ended?0:ct;if(h.rec?.kind!=='video'||!P.showing||P.showing!==h.id)try{h.el.pause();}catch{}h.playing=false;h.until=null;}}}
// After an element, the music goes back to where it was heard last (also if the press cut it).
function psRememberMusic(P){const mu=psMusic(P);if(mu?.el&&mu.playing)P.musicPos=mu.el.currentTime||0;}
export function psSilence(fade=.03){const P=PS_CUR;if(!P)return;psRememberMusic(P);if(P.tpl==='tria'||P.tpl==='troba')P.showing=null;P.queue=P.queue.filter(q=>q.op==='hush');P.queue.push({op:'hush',fade:Math.max(.03,fade)});for(const h of P.media.values())if(h.el&&!h.g&&h.playing){try{h.el.pause();}catch{}h.playing=false;}}
// The pause stops the video where it is; going on plays it again (its sound comes back with the next element).
export function psPause(game){const P=game?.persona;if(!P)return;P.pausedShowing=P.showing;P.paused=[];for(const h of P.media.values())if(h.el&&!h.el.paused){P.paused.push(h);try{h.el.pause();}catch{}}}
export function psResume(game){const P=game?.persona;if(!P)return;if(P.pausedShowing)P.showing=P.pausedShowing;P.pausedShowing=null;for(const h of P.paused)if(h.rec?.kind==='video'&&P.showing===h.id){h.playing=true;h.until=null;h.el.play?.()?.catch?.(()=>{});psQ(P,{op:'unhush',id:h.id});}P.paused=[];}
// The phrases of the recorded instruments: major pentatonic, a key for each element, ending on plucked notes that ring out.
const PS_KEYS=[60,62,65,67,57,63];const PS_PENTA=[0,2,4,7,9];
const psDeg=(key,d)=>{const o=Math.floor(d/5),i=((d%5)+5)%5;return key+12*o+PS_PENTA[i];};
export function psPhrase(kind,n,len){const out=[],key=PS_KEYS[((n%6)+6)%6],add=(inst,midi,at,l,vel,extra={})=>{if(at<len+.01)out.push({e:{inst,midi:[midi],vel,...extra},at,len:l});};
 if(kind==='paper'){add('toonRec',0,.02,.6,.38,{variant:n%2?'cards':'slideUp'});return out;}
 if(kind==='knock'){add('toonRec',0,0,.9,.5,{variant:'knock'});return out;}
 if(kind==='open'){for(let i=0;i<8;i++)add('harpRec',psDeg(key,5+i),i*.07,1.2,.42);add('vibRec',psDeg(key,10),.6,1.4,.3);add('glockRec',psDeg(key,15),.62,1.2,.22);return out;}
 if(kind==='close'){for(let i=0;i<5;i++)add('harpRec',psDeg(key,11-i),i*.09,1,.3);add('celliPizzRec',key-12,.5,1,.4);return out;}
 if(kind==='step'){const d=3+(n%7);[0,2,4].forEach((x,i)=>add('marimbaRec',psDeg(key,d+x),i*.18,.9,.5));add('celliPizzRec',psDeg(key-12,n%3),0,1.2,.45);add('glockRec',psDeg(key,d+9),.56,1,.2);return out;}
 // a whole element: an arpeggio of the harp over a pizzicato bass, a melody of the marimba or the kalimba, the glockenspiel at the top
 const beat=.42,bars=Math.max(1,Math.floor((len-1.6)/(beat*8))),prog=[[0,2,4],[4,6,8],[2,4,6],[3,5,7]],lead=kind==='final'?'kalimbaRec':'marimbaRec';
 for(let b=0;b<bars;b++){const ch=prog[(b+n)%4],t0=b*beat*8;add('celliPizzRec',psDeg(key-12,ch[0]),t0,beat*4,.5);add('celliPizzRec',psDeg(key-12,ch[0]+2),t0+beat*4,beat*4,.42);
  for(let i=0;i<8;i++)add('harpRec',psDeg(key,ch[i%3]+(i>2?5:0)),t0+i*beat,beat*2.2,.34+(i%4===0?.08:0));
  const mel=[ch[2]+5,ch[1]+5,ch[2]+6,ch[0]+7];for(let i=0;i<4;i++)if((b+i+n)%3!==2)add(lead,psDeg(key,mel[i]),t0+i*beat*2+beat*.5,beat*1.6,.42);
  if(b%2===1)add('glockRec',psDeg(key,ch[0]+10),t0+beat*6,1.2,.18);}
 const end=bars*beat*8;if(end<len-.3){add('harpRec',psDeg(key,0),end,1.8,.42);add('harpRec',psDeg(key,4),end+.08,1.8,.38);add('harpRec',psDeg(key,7),end+.16,1.8,.36);add('celliPizzRec',key-12,end,1.5,.5);add('glockRec',psDeg(key,10),end+.3,1.4,.2);}
 return out;}

// ---------- Cause and effect: the press and the time ----------
const PS_TRANS=6,PS_IN=1.1;
// a press is refused while an element is entering or (with «Espera que acabi cada efecte») still shown
export function psBlocked(game,s){const P=game?.persona;if(!P)return false;if(P.tpl==='moment')return P.phase!=='knock';if(P.tpl==='video')return P.phase==='play'||(P.act.film&&P.phase==='end'?!psFilmNext(P)?.ready||!!psFilmNext(P)?.failed:!psVideoReady(P));if(P.tpl==='pas')return P.phase==='enter'||(s.lock&&(P.phase==='step'||P.phase==='show'));return s.lock&&P.phase==='show'||P.phase==='show'&&P.t<PS_IN;}
function psNext(P){const n=P.act.items.length;if(!n)return -1;const lap=Math.floor(P.k/n),pos=P.k%n;if(pos===0)P.order=psOrder(P,lap);P.k++;return P.order[pos]??0;}
function psShowItem(P,s,i){P.prev=P.cur;P.cur=i;P.lastShown=i;P.phase='show';P.t=0;P.show=psShowTime(P,psItemAt(P,i),s)+(P.tpl==='album'?PS_IN*.6:0);P.trans=(P.k-1)%PS_TRANS;psStartVideo(P,psItemAt(P,i));psQ(P,{op:'item',i,len:P.show});}
function psStartVideo(P,item){for(const h of P.media.values())if(h.rec?.kind==='video'&&h.el&&!h.el.paused&&h.id!==item?.media)try{h.el.pause();}catch{}const v=psMediaOf(P,item?.media);P.showing=null;if(v?.rec?.kind!=='video'||!v.el)return;P.showing=v.id;try{v.el.currentTime=0;}catch{}if(!v.g)v.el.muted=true;v.playing=true;v.until=null;v.el.play?.()?.catch?.(()=>{});}
function psStopVideo(P){const v=P.showing&&psMediaOf(P,P.showing);if(v?.el)try{v.el.pause();}catch{}}
export function psPress(game,s){const P=game?.persona;if(!P||psBlocked(game,s))return false;P.wake=psNow();psRememberMusic(P);
 if(P.tpl==='album'){psSilence(.25);const i=psNext(P);if(i<0)return false;psShowItem(P,s,i);game.count=P.k;return true;}
 if(P.tpl==='pas'){const N=psSteps(s);if(P.phase==='show'||P.phase==='rest'){psSilence(.25);psNewCover(P,s);P.phase='enter';P.t=0;return true;}
  P.done=Math.min(N,P.done+1);P.stepAt=P.t=0;if(P.done>=N){P.k++;psShowItem(P,s,P.cur);P.phase='show';}else{P.phase='step';psQ(P,{op:'step',n:P.done+P.k*3});}game.count=P.done;return true;}
 if(P.tpl==='moment'){P.phase='open';P.t=0;psQ(P,{op:'open'});psSilence(.2);return true;}
 if(P.tpl==='video')return psVideoPress(game,P);
 return false;}
// ---------- Vídeo a poc a poc (0.46) ----------
// The stops of a video: every pauseEvery seconds, or at its marks, and always its end; a stop closer than 0.6 s to the next is dropped.
export function psVideoStops(dur,act,item){if(!(dur>0))return [];let list=act?.pauseMode==='marks'?pdMarks(item?.marks):[];if(act?.pauseMode!=='marks'){const e=Math.max(1,+act?.pauseEvery||5);for(let t=e;t<dur-.6;t+=e)list.push(Math.round(t*10)/10);}
 list=list.filter(t=>t<dur-.6);const out=[];for(const t of list)if(!out.length||t-out[out.length-1]>=.6)out.push(t);out.push(dur);return out;}
const PS_DARK={suau:.4,mitja:.62,fort:.82};
export const psDarkOf=act=>PS_DARK[act?.dark]??PS_DARK.mitja;
function psVideoEl(P){const it=psItemAt(P,P.vi),h=psMediaOf(P,it?.media);return h?.rec?.kind==='video'&&h.el&&!h.failed?h:null;}
function psVideoReady(P){const h=psVideoEl(P);return !!h&&h.ready;}
function psVideoPrime(P){const h=psVideoEl(P);if(!h)return null;const d=Number.isFinite(h.el.duration)&&h.el.duration>0?h.el.duration:h.rec.dur||0;P.stops=psVideoStops(d,P.act,psItemAt(P,P.vi));return h;}
function psVideoPress(game,P){const n=P.act.items.length;if(!n)return false;
 if(P.phase==='end'){for(const h of P.media.values())if(h.el)try{h.el.pause();}catch{}P.vi=(P.vi+1)%n;P.seg=0;P.cur=P.vi;P.stops=null;if(P.act.film)psFilmKeep(P);const h0=psVideoEl(P);if(h0)try{h0.el.currentTime=0;}catch{}}
 const h=P.stops?psVideoEl(P):psVideoPrime(P);if(!h||!P.stops?.length)return false;if(P.seg===0&&P.phase!=='pause')try{h.el.currentTime=0;}catch{}
 P.target=P.stops[Math.min(P.seg,P.stops.length-1)];P.phase='play';P.t=0;P.showing=h.id;P.cur=P.vi;P.faded=false;h.playing=true;h.until=null;if(!h.g&&!h.noRoute)h.el.muted=true;h.el.play?.()?.catch?.(()=>{});psQ(P,{op:'vplay',id:h.id});P.k++;game.count=P.act.film?P.vi+1:P.seg+1;return true;}
// every frame while it plays: the sound fades in the last 0.35 s before the stop; at the stop the video pauses and the screen darkens
function psVideoTick(game,P){const h=psVideoEl(P);if(!h){if(P.phase==='play')P.phase='pause';return;}if(P.phase==='cover'&&!P.primed&&h.ready){P.primed=true;try{h.el.currentTime=0;}catch{}}
 if(P.phase!=='play')return;const ct=h.el.currentTime||0,last=P.seg>=P.stops.length-1;
 if(!P.faded&&ct>=P.target-.35){P.faded=true;psQ(P,{op:'vfade',id:h.id,fade:Math.max(.05,Math.min(.35,P.target-ct))});}
 if(ct>=P.target-.02||h.el.ended||(h.el.paused&&P.t>1.5)){try{h.el.pause();}catch{}h.playing=false;P.showing=null;P.t=0;if(last){P.phase='end';P.seg=0;}else{P.phase='pause';P.seg++;}game.count=P.act.film?P.vi+1:last?P.stops.length:P.seg;}}
const psSteps=s=>[3,5,7].includes(s.steps)?s.steps:5;
// Descobreix pas a pas: the paper pieces over the element, 12 of them (4 × 3), in groups of the steps of the profile, in another order and
// other colours for every element.
const PS_PAPER=['#f25c54','#f7b267','#ffd23f','#3bceac','#0ead69','#4d9de0','#7768ae','#e15a97','#f4845f','#57cc99'];
function psTiles(P){const cols=4,rows=3,n=cols*rows;let x=(P.seed*31+P.k*977+7)>>>0;const r=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296;};const order=Array.from({length:n},(_,i)=>i).sort(()=>r()-.5);
 P.tiles=order.map((cell,j)=>({cell,c:cell%cols,r:Math.floor(cell/cols),rank:j,color:PS_PAPER[(cell*3+P.k*7)%PS_PAPER.length],spin:(r()-.5)*1.6,dx:(r()-.5)*.5,fold:r()}));P.cols=cols;P.rows=rows;}
// which pieces go at each step: the 12 pieces in N groups (the last step takes all that are left)
export function psTileStep(tile,N,n=12){return Math.min(N,Math.floor(tile.rank*N/n)+1);}
function psNewCover(P,s){const i=psNext(P);P.k--;P.prev=P.cur;P.cur=i<0?0:i;P.done=0;psTiles(P);psStopVideo(P);}
function psWaitFor(P,s){const [a,b]=tcWaitRange(s);let x=(P.seed+P.k*131+P.again*17)>>>0;x=(x*1103515245+12345)>>>0;return a+(b-a)*(x%1000)/1000;}
export function psTick(game,s,dt){const P=game?.persona;if(!P)return;P.t+=dt;// the waiting cue (0.14.1): dark while a press is awaited; in Qui s’amaga? the knock itself is the sign, so its theatre never darkens
 const wantDark=P.tpl==='video'?P.phase!=='play':s.waitCue!==false&&P.tpl!=='moment'&&(P.phase==='idle'||P.phase==='rest'||P.phase==='cover');P.dark=Math.max(0,Math.min(1,P.dark+(wantDark?dt/1.2:-dt/.5)));
 if(P.tpl==='video'){psVideoTick(game,P);return;}
 if(P.tpl==='album'){if(P.phase==='show'&&P.t>=P.show){P.phase='rest';P.t=0;psStopVideo(P);}return;}
 if(P.tpl==='pas'){if(P.phase==='step'&&P.t>=1.25){P.phase='cover';P.t=0;}else if(P.phase==='show'&&P.t>=P.show+1.2){P.phase='rest';P.t=0;psStopVideo(P);}else if(P.phase==='rest'&&P.t>=1.6){psNewCover(P,s);P.phase='enter';P.t=0;}else if(P.phase==='enter'&&P.t>=1){P.phase='cover';P.t=0;game.count=0;}return;}
 if(P.tpl==='moment'){if(P.phase==='wait'&&P.t>=P.wait){P.phase='knock';P.t=0;P.knocks=0;}
  if(P.phase==='knock'){const due=Math.floor(P.t/3.2);if(due>=P.knocks){P.knocks=due+1;psQ(P,{op:'knock',n:P.knocks});}const leave=tcLeave(s);if(leave>0&&P.t>=leave){P.phase='wait';P.t=0;P.again++;P.wait=psWaitFor(P,s);}}
  if(P.phase==='open'&&P.t>=1.3){const i=psNext(P);psShowItem(P,s,i<0?0:i);P.phase='show';game.count=P.k;}
  else if(P.phase==='show'&&P.t>=P.show){P.phase='close';P.t=0;psStopVideo(P);psQ(P,{op:'close'});}
  else if(P.phase==='close'&&P.t>=1.3){P.phase='wait';P.t=0;P.again=0;P.wait=psWaitFor(P,s);}}}
export function psProgress(game,s){const P=game?.persona;if(!P)return '';const n=P.act.items.length;if(P.act.film){const done=P.phase==='cover'?0:P.vi+(P.phase==='end'?1:0);return Array.from({length:n},(_,i)=>`<span class="${i<done||P.phase==='play'&&i===P.vi?'done':''}"></span>`).join('');}if(P.tpl==='video'){const N=P.stops?.length||0;if(!N)return '';const done=P.phase==='end'?N:P.seg+(P.phase==='play'?0:0);return N<=16?Array.from({length:N},(_,i)=>`<span class="${i<done||P.phase==='play'&&i===P.seg?'done':''}"></span>`).join(''):`${Math.min(N,done+(P.phase==='play'?1:0))} / ${N}`;}if(P.tpl==='pas'){const N=psSteps(s);return Array.from({length:N},(_,i)=>`<span class="${i<P.done?'done':''}"></span>`).join('');}
 return P.k?`${((P.k-1)%n)+1} / ${n}`:`${n} ${n===1?'element':'elements'}`;}
export function psStatus(game,s){const P=game?.persona;if(!P)return '';if(P.act.film)return psFilmStatus(P);if(P.tpl==='video')return P.phase==='play'?'El vídeo avança.':P.phase==='end'?'S’ha acabat el vídeo. Prem per tornar a començar.':P.phase==='cover'?'Prem per començar el vídeo.':'El vídeo espera la pulsació següent.';if(P.tpl==='moment')return P.phase==='knock'?'Truquen darrere el teló.':P.phase==='open'||P.phase==='show'?'S’obre el teló.':'Esperem que truquin.';
 if(P.tpl==='pas')return P.phase==='show'||P.phase==='rest'?'Ja es veu sencer.':`Pas ${P.done} de ${psSteps(s)}.`;return P.k?`Element ${((P.k-1)%P.act.items.length)+1} de ${P.act.items.length}.`:'Preparat per a una nova pulsació.';}
function psFilmStatus(P){const n=P.act.items.length,h=psVideoEl(P)||psMediaOf(P,P.act.items[P.vi]?.media),next=psFilmNext(P);
 if(h?.failed||!h&&P.media.size)return 'No s’han pogut carregar els vídeos d’aquesta pel·lícula. Obriu Pim Pam des del web, o poseu la carpeta «videos» al costat del fitxer.';
 if(P.phase==='play')return `Seqüència ${P.vi+1} de ${n}.`;if(P.phase==='cover')return h?.ready?'Prem per començar la pel·lícula.':'Carregant la pel·lícula…';
 if(P.phase==='end')return P.vi>=n-1?'S’ha acabat la pel·lícula. Prem per tornar a començar.':next&&!next.ready?'Carregant la seqüència següent…':`S’ha acabat la seqüència ${P.vi+1}. Prem per veure la següent.`;return 'Prem per continuar.';}
export function psHelp(game,s){const P=game?.persona;if(!P)return '';if(P.act.film)return 'Cada pulsació mostra una seqüència de la pel·lícula. Quan s’acaba, la imatge s’atura i s’enfosqueix fins a la pulsació següent.';return P.tpl==='video'?'Cada pulsació fa avançar el vídeo fins a la pausa següent.':P.tpl==='moment'?'Espera que truquin darrere el teló i prem per obrir-lo.':P.tpl==='pas'?'Cada pulsació aparta unes quantes peces de paper.':'Prem per veure la foto o el vídeo següent.';}

// ---------- Scanning: the options, the clue and the times (through the scanning of the app, scan-catalog.js) ----------
const psChoice=(P,i)=>({id:'pi-'+i,label:`Foto ${i+1}`,kind:'persona',value:i,color:null});
function psRoundOptions(a,round,n,target){const len=a.items.length;n=Math.max(1,Math.min(n,len));if(target===null){const start=(round*n)%len;return Array.from({length:n},(_,k)=>(start+k)%len);}
 const others=Array.from({length:len},(_,i)=>i).filter(i=>i!==target),pick=[];for(let k=0;k<n-1&&others.length;k++)pick.push(others.splice((round*3+k*5)%others.length,1)[0]);const at=round%n;pick.splice(at,0,target);return pick;}
export function psTarget(a,round){const list=a.items.map((it,i)=>i);return list[round%Math.max(1,list.length)];}
export function psOptions(state,s){const a=psAct(state.id);if(!a)return [];const target=a.tpl==='troba'?psTarget(a,state.round|0):null;return psRoundOptions(a,state.round|0,s.scanOptions||3,target).map(i=>psChoice(null,i));}
scanExtend({match:psIs,definition:id=>{const it=psItem(id);return it?{...it,scene:'persona'}:undefined;},guided:id=>psAct(id)?.tpl==='troba',content:psOptions,
 target:(state,s)=>{const a=psAct(state.id);return a?psChoice(null,psTarget(a,state.round|0)):null;},
 times:(state,option,final,correct)=>{if(!correct)return 1.6;const P=PS_CUR;if(!P||P.act.id!==state.id)return 6;return psShowTime(P,psItemAt(P,option?.value),P.settings||{duration:6})+1.6;}});
// the scanning of the app calls these on a choice, on the focus of an option and for the clue
export function psBoardEffect(game,s,pending){const P=game?.persona;if(!P)return;P.settings=s;const i=pending?.option?.value;psRememberMusic(P);
 if(pending?.correct===false){psQ(P,{op:'taste',i,len:1.4,click:false});return;}P.k++;P.cur=i;P.showing=null;const item=psItemAt(P,i);P.show=psShowTime(P,item,s);psStartVideo(P,item);psQ(P,{op:'item',i,len:P.show});}
export function psTaste(game,option){const P=game?.persona;if(!P||!option||option.action)return 0;const item=psItemAt(P,option.value),snd=item&&psSoundOf(P,item);if(!snd||snd.kind!=='own'&&snd.kind!=='video')return 0;psQ(P,{op:'taste',i:option.value,len:1.4});return 1.4;}
export function psCue(game){const P=game?.persona;if(!P)return 0;const i=psTarget(P.act,game.scanState?.round|0),item=psItemAt(P,i),snd=item&&psSoundOf(P,item);if(!snd||snd.kind!=='own'&&snd.kind!=='video')return 0;const h=snd.h,d=Math.max(1.5,Math.min(4,h?.rec?.dur||(h?.el?.duration)||3));psQ(P,{op:'taste',i,len:d});return d;}
export function psScanSettle(game,s){const P=game?.persona;if(P)P.settings=s;}
// The zones of the board: as many panels as options, as big as the stage allows above the strip of the commands, with the shape of
// the photo when there is only one row.
export function psLayout(n,w,h){const H=Math.max(1,h-TL_STRIP),cols=n>2&&w<H*1.4?2:n,rows=Math.ceil(n/cols),gap=Math.max(16,w*.028),top=Math.max(18,H*.05),bottom=H-Math.max(14,H*.03),rowH=(bottom-top-(rows-1)*gap)/rows,zw=Math.min((w-gap*(cols+1))/cols,rowH*(rows>1?1.6:1.45)),zh=Math.min(rowH,zw/ (rows>1?1.25:.95)),x0=(w-cols*zw-(cols-1)*gap)/2,y0=top+(bottom-top-(rows*zh+(rows-1)*gap))/2,r=Math.min(26,zw*.06),zones=[];
 for(let i=0;i<n;i++){const c=i%cols,rr=Math.floor(i/cols),inRow=rr===rows-1?n-rr*cols:cols,xr=(w-inRow*zw-(inRow-1)*gap)/2,x=(rr===rows-1?xr:x0)+c*(zw+gap),y=y0+rr*(zh+gap);zones.push({x,y,w:zw,h:zh,kind:'panel',radius:r,pts:tlRound(x,y,zw,zh,r)});}
 return zones;}
export {psReload};
