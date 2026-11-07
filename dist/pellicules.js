// 0.50 · Petites pel·lícules (Marc, 7 November 2026): two short films of UTAC, cut into sequences, played one sequence per press:
// «Un mos a Barcelona» (10 sequences) and «Comunicar a tot arreu» (11). At the end of each sequence the film stops on its last frame,
// the screen darkens (the waiting cue of Pim Pam) and the next press plays the next sequence; after the last one, a press starts again.
// They use the mechanic of «Vídeo a poc a poc» of the personalised activities (persona.js, template 'video'), with the stops at the end
// of each file. The files are MP4 (H.264 + AAC) next to index.html: videos/<dir>/<dir>_NN.mp4. Only the sequence that plays and the next
// one are loaded. The UTAC logo is not shown over the films (Marc).
export const PL_FOLDER='pellicules';
const PL_FILMS=Object.freeze([
 Object.freeze({id:'mos',code:'PL01',dir:'mos',n:10,name:'Un mos a Barcelona',desc:'Una petita pel·lícula en deu seqüències. Cada pulsació en mostra una; quan s’acaba, la imatge s’atura i s’enfosqueix fins a la pulsació següent.',tag:'10 seqüències · una per pulsació'}),
 Object.freeze({id:'comunicar',code:'PL02',dir:'comunicar',n:11,name:'Comunicar a tot arreu',desc:'Una petita pel·lícula en onze seqüències. Cada pulsació en mostra una; quan s’acaba, la imatge s’atura i s’enfosqueix fins a la pulsació següent.',tag:'11 seqüències · una per pulsació'})]);
// the films are mixed at about −20.8 LUFS, like the videos of the dives; this gain (under the master of the app) gives the same loudness
export const PL_GAIN=.647;
export const PL_IDS=Object.freeze(PL_FILMS.map(f=>f.id));
export const plIs=id=>PL_IDS.includes(id);
const plFilm=id=>PL_FILMS.find(f=>f.id===id)||null;
const plPad=i=>String(i+1).padStart(2,'0');
// the media id of a sequence: 'pl:<film>:<NN>'
export const plMediaIs=mid=>typeof mid==='string'&&mid.startsWith('pl:');
export function plUrl(mid){const [,id,nn]=String(mid).split(':'),f=plFilm(id);return f?`./videos/${f.dir}/${f.dir}_${nn}.mp4`:'';}
// over the web the sound goes through the audio graph of the app; a file opened from disk cannot route a video of another file through
// it (the browser gives silence), so there the video plays its own sound at the volume of the profile
export const plRoutable=()=>typeof location==='undefined'||/^https?:$/.test(location.protocol);
// the activity as the personalised activities describe it (persona-dades.js pdClean): a video for each sequence, the only stop at its end
const PL_ACTS=new Map();
export function plAct(id){const f=plFilm(id);if(!f)return null;let a=PL_ACTS.get(id);if(a)return a;
 a=Object.freeze({id:f.id,film:true,tpl:'video',name:f.name,child:'',order:'list',fit:'contain',pauseMode:'marks',pauseEvery:5,dark:'mitja',musicMode:'none',music:null,videoMax:600,
  items:Object.freeze(Array.from({length:f.n},(_,i)=>Object.freeze({media:`pl:${f.id}:${plPad(i)}`,sound:null,marks:''})))});
 PL_ACTS.set(id,a);return a;}
export function plItem(id){const f=plFilm(id);if(!f)return null;return Object.freeze({id:f.id,code:f.code,type:'ce',persona:true,film:true,tpl:'video',name:f.name,desc:f.desc,level:'03 · Pas a pas',tag:f.tag,time:'Al teu ritme',kind:'persona',task:'free'});}
export const plItems=()=>PL_FILMS.map(f=>plItem(f.id));
export const plCount=id=>plFilm(id)?.n||0;
