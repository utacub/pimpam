// On anem? (EN04), 0.16: the station of the four doors. The hall of a station fills the stage and each destination is a large arched
// door (sea, forest, snow, space) with its place seen through the glass. The chosen door opens to the whole screen and the little red
// train becomes the vehicle of the place (a sailing boat, the train on a wooden bridge, a sledge, a rocket); it crosses the place to a
// discovery and the music closes on plucked and struck notes. Rounds change the time of day of the station (morning, afternoon, night),
// the discovery (five per place) and the route of the trip (four), so twenty rounds never give the same trip twice.
// Recorded instruments of sampler.js only, and two nature sounds of the collection (waves and a blackbird, generated with ElevenLabs
// like most of the nature sounds; see CREDITS.md) for the sea and the forest.
import {SAMPLE_BANK} from './sampler.js';
export const ET_PLACES=Object.freeze(['sea','forest','snow','space']);
export const ET_TIMES=Object.freeze(['mati','tarda','nit']);
export const ET_FINDS=Object.freeze({sea:['far','illa','posta','velers','balena'],forest:['cascada','cabana','estany','globus','clariana'],snow:['refugi','glac','telecabina','nevada','cims'],space:['anells','cometa','lluna','estel','nebulosa']});
export const ET_ROUTES=4;
// Seconds of the trip: the door opens (1 s), the vehicle travels and the discovery appears, and the scene settles with the last notes.
export const ET_TRIP=9,ET_ARRIVE=7.4;
// Loudness of the music against the other activities (measured on the review video, EBU R128).
export const ET_LOUD=.86;
// The round sets the time of day of the station; the trip (by default the round; the app counts the trips to each place, so that going
// back to the same door gives another trip) sets the discovery and the route.
export function etRound(round,place,trip=round){const r=Math.max(0,round|0),k=Math.max(0,trip|0),finds=ET_FINDS[place]||ET_FINDS.sea;return {time:ET_TIMES[r%3],find:finds[k%5],route:k%ET_ROUTES,place:ET_PLACES.includes(place)?place:'sea'};}
// Every note is moved by octaves into the reach of the recordings of its instrument.
export function etFit(inst,m){const b=SAMPLE_BANK[inst];if(!b?.pitched)return m;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;while(m>hi)m-=12;while(m<lo)m+=12;return m;}
const etEv=(inst,midi,t,len,vel,extra={})=>({inst,midi:[].concat(midi).map(m=>etFit(inst,m)),at:t/ET_TRIP,length:len/ET_TRIP,vel:Math.min(1,vel*ET_LOUD),...extra});
// The taste of each door while it has the focus (seconds from the moment it gets the focus). The sea and the forest are nature sounds (played by the app with a short fade); the snow and the space, notes of glockenspiel, triangle and harp.
export function etTaste(place){
 if(place==='sea')return {nature:'waves',length:1.4,level:.9,notes:[]};
 if(place==='forest')return {nature:'blackbird',length:1.4,level:.85,notes:[]};
 if(place==='snow')return {nature:null,notes:[{inst:'glockRec',midi:[88],t:0,len:.9,vel:.55},{inst:'triangleRec',midi:[0],variant:'hit',t:.18,len:.8,vel:.42},{inst:'glockRec',midi:[91],t:.36,len:.9,vel:.5}]};
 return {nature:null,notes:[{inst:'harpRec',midi:[79],t:0,len:1,vel:.5},{inst:'harpRec',midi:[86],t:.14,len:1,vel:.48},{inst:'glockRec',midi:[95],t:.3,len:.9,vel:.42}]};}
// Major scale degrees and chords (degree of the root) used by the trips.
const ET_SCALE=[0,2,4,5,7,9,11];
const etDeg=(root,d)=>root+ET_SCALE[((d%7)+7)%7]+12*Math.floor(d/7);
const ET_PROGS=[[0,4,5],[0,3,4],[5,3,4],[0,5,3]];
const ET_RHYTHMS=[[0,1,1.5,2,3],[0,.5,1,2,2.5,3],[0,1,2,2.5,3.5],[0,.75,1.5,2,3]];
function etRng(seed){let a=seed>>>0||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// The music of a trip: a harp glissando while the door opens, then three bars with melody, harmony, bass and a little percussion in
// the colours of the place, and a closing chord of harp and glockenspiel at the arrival. Fractions of ET_TRIP, as playPatternAudio wants.
export function etScore(place,round,trip=round){const R=etRound(round,place,trip),k=Math.max(0,trip|0),rnd=etRng(1+k*97+ET_PLACES.indexOf(R.place)*13),root=[62,65,60,67][(k+ET_PLACES.indexOf(R.place))%4],prog=ET_PROGS[(k+R.route)%4],rhythm=ET_RHYTHMS[(k*3+1)%4];
 const beat={sea:.55,forest:.5,snow:.53,space:.58}[R.place],start=1,out=[];
 // the door opens: a harp glissando up the scale
 for(let i=0;i<9;i++)out.push(etEv('harpRec',[etDeg(root-12,i)],.08+i*.085,1.2,.36+i*.02));
 const melodyInst={sea:'marimbaRec',forest:'fluteRec',snow:'glockRec',space:'glockRec'}[R.place],accInst={sea:'harpRec',forest:'violinsPizzRec',snow:'harpRec',space:'harpRec'}[R.place];
 const melodyOct={sea:12,forest:12,snow:36,space:36}[R.place];let prev=2;
 for(let bar=0;bar<3;bar++){const chord=prog[bar],t0=start+bar*4*beat,tones=[0,2,4].map(k=>chord+k);
  // bass: plucked cellos on beats 1 and 3
  out.push(etEv('celliPizzRec',[etDeg(root-24,chord)],t0,beat*1.6,.62));out.push(etEv('celliPizzRec',[etDeg(root-24,chord+(bar===2?4:0))],t0+2*beat,beat*1.6,.52));
  // accompaniment: broken chords in eighths
  for(let k=0;k<8;k++){const d=tones[[0,1,2,1,0,2,1,2][k]]+(k>3?7:0)*(R.place==='space'?1:0);out.push(etEv(accInst,[etDeg(root-(R.place==='forest'?0:12),d)],t0+k*beat/2,beat*.9,(k%2?.3:.38)*(R.place==='forest'?1.15:1)));}
  // melody: notes of the chord or steps between them, along the rhythm of the round
  for(const b of rhythm){const target=tones[Math.floor(rnd()*3)],step=rnd()<.35?(rnd()<.5?1:-1):0;let d=target+step+(Math.abs(target-prev)>4?(target>prev?-7:7):0);if(d<0)d+=7;prev=d;
   out.push(etEv(melodyInst,[etDeg(root+melodyOct-12,d)],t0+b*beat,beat*(R.place==='forest'?.95:.7),R.place==='forest'?.5:.55));}
  // colour of the place
  if(R.place==='forest')for(const b of [1.5,3.5])out.push(etEv('woodblockRec',[0],t0+b*beat,.2,.28,{variant:'claves'}));
  if(R.place==='snow')for(const b of [1,3])out.push(etEv('triangleRec',[0],t0+b*beat,.6,.25,{variant:'muted'}));
  if(R.place==='space'&&bar<2)out.push(etEv('violinsRec',[etDeg(root,tones[2])],t0+beat*.5,beat*3,.3));
 }
 const arrive=start+12*beat;
 // the nature of the place under the music (waves, a blackbird; the snow and the space have none)
 if(R.place==='sea')out.push(etEv('natureRec',[0],0,arrive+1.2,.34,{variant:'waves'}));
 if(R.place==='forest')out.push(etEv('natureRec',[0],.4,arrive+.8,.3,{variant:'blackbird'}));
 // arrival: a rolled harp chord, a glockenspiel note and the triangle, all plucked or struck, ringing out
 [0,2,4,7,9].forEach((d,i)=>out.push(etEv('harpRec',[etDeg(root-12,d)],arrive+i*.045,1.4,.52)));out.push(etEv('glockRec',[etDeg(root+24,4)],arrive+.22,1.3,.42));out.push(etEv('triangleRec',[0],arrive+.05,1.2,.3,{variant:'hit'}));
 return out.filter(e=>e.at<1).sort((a,b)=>a.at-b.at);}
