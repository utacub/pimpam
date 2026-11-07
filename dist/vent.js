// El vent del bosc (CE26), 0.15: while the switch is held, the wind blows over a painted landscape, and the longer it is held the
// stronger it blows, up to a maximum. When it is let go, the wind dies down and everything settles; then the scene waits for the next
// press. A press shorter than three seconds still blows for three seconds, so that switches that only click have an answer too.
// The wind has four grades (breeze, wind, strong wind, gale); at the gale it no longer grows, but every four seconds a different gust
// comes. There are eight places of Catalonia through the year; once the wind has blown for 25 seconds in a place, the next press
// carries it away and the brushstrokes paint the next one. Each year a place comes back at another time of day, under another sky.
// Music: recorded harp, glockenspiel, marimba, plucked strings and flute that join grade by grade; the wind itself is the recording of
// wind in the leaves, louder and brighter as it grows. Everything ends on plucked or struck notes that fade by themselves.
import {escNote,escFit,escInto,escScore} from './escenari.js';

// Seconds: the shortest blow, the calm after letting go, the trees settling, the wind a place takes before it changes, the span
// of the music (it is composed sixteen seconds at a time) and its pulse.
export const VENT_MIN=3,VENT_CALM=1.5,VENT_SETTLE=.8,VENT_CHANGE=25,VENT_SPAN=16,VENT_PULSE=.25;
// When each grade starts, in seconds of wind, and how strong it is (0 to 1).
export const VENT_GRADES=Object.freeze([0,2,4.5,7]);
export const VENT_LEVELS=Object.freeze([.3,.52,.76,1]);
// The character of the wind of each press: straight, wavy, swirling or in bursts.
export const VENT_GUSTS=Object.freeze(['recta','ondulant','remoli','cops']);
// The eight places, through the year: what flies at the strong wind (two kinds, for alternate years), the nature sound under the
// wind and the key of the music.
export const VENT_PLACES=Object.freeze([
 {id:'ametllers',name:'Ametllers florits',fly:['petals','petals'],nature:null,key:[62,'major']},
 {id:'dents',name:'Prat de dents de lleó',fly:['llavors','llavors'],nature:'meadow',key:[67,'major']},
 {id:'terrat',name:'Terrat amb roba estesa',fly:['roba','roba'],nature:null,key:[65,'major']},
 {id:'blat',name:'Camp de blat amb roselles',fly:['roselles','roselles'],nature:'crickets',key:[60,'mixolydian']},
 {id:'platja',name:'Platja amb estels',fly:['estels','gavines'],nature:'waves',key:[64,'major']},
 {id:'vinya',name:'Vinya a la verema',fly:['pampols','pampols'],nature:null,key:[62,'dorian']},
 {id:'fageda',name:'Fageda',fly:['fulles','fulles'],nature:'brook',key:[69,'dorian']},
 {id:'neu',name:'Bosc nevat',fly:['neu','neu'],nature:null,key:[64,'dorian']}
]);
export const VENT_TIMES=Object.freeze(['mati','migdia','tarda','posta']);
export const VENT_SKIES=Object.freeze(['net','nuvols','boira']);
// Five years of eight places; then it starts again.
export const VENT_VARIANTS=40;
// A place in a given year: the time of day and the sky change every year, and so does what flies at the beach.
export function ventScene(variant){const v=((Math.round(variant||0)%VENT_VARIANTS)+VENT_VARIANTS)%VENT_VARIANTS,place=v%8,year=Math.floor(v/8),P=VENT_PLACES[place];
 const time=(place+3*year)%4,sky=(place*2+year)%3,fly=P.fly[year%2];
 // The crickets sing only in the afternoon and at sunset.
 const nature=P.nature==='crickets'&&time<2?null:P.nature;
 return {v,place,year,id:P.id,time,sky,fly,nature,key:P.key[0],mode:P.key[1]};}

// ── The wind of a press ──────────────────────────────────────────────────────────────────────────────────────────────────
const Vs=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// The strength after h seconds of wind, from rest: it starts at once (a breeze within 0.3 s) and climbs a grade at a time.
export function ventHeld(h){if(!(h>0))return 0;let L=VENT_LEVELS[0]*Vs(h/.3);
 for(let g=1;g<4;g++)L+=(VENT_LEVELS[g]-VENT_LEVELS[g-1])*Vs((h-VENT_GRADES[g])/.8);return L;}
// The seconds of wind that give a strength (to go on from where the wind was when a press comes during the calm).
export function ventOffset(level){if(!(level>0))return 0;if(level>=1)return VENT_GRADES[3]+.8;let a=0,b=VENT_GRADES[3]+.8;for(let i=0;i<30;i++){const m=(a+b)/2;if(ventHeld(m)<level)a=m;else b=m;}return b;}
// The grade (1 to 4) after h seconds of wind.
export const ventGrade=h=>h>=VENT_GRADES[3]?4:h>=VENT_GRADES[2]?3:h>=VENT_GRADES[1]?2:1;
// The gusts of the gale: one every four seconds from the seventh, each lasting about two and a half seconds. k: which gust; p: 0 to 1
// through it (−1 between gusts).
export function ventGust(h){if(h<VENT_GRADES[3])return {k:-1,p:-1};const k=Math.floor((h-VENT_GRADES[3])/4),p=(h-VENT_GRADES[3]-4*k)/2.6;return p<=1?{k,p}:{k,p:-1};}
// The wind at time t of a press. release: when the wind starts to calm (null while held); offset: seconds of wind already blowing when
// the press came; character: one of VENT_GUSTS. level: strength (gusts can take it a little over 1); calm: 0 to 1 after the release.
export function ventWind(t,release,offset=0,character='recta'){const hold=release===null||release===undefined?t:Math.min(t,release),h=hold+offset;
 let level=ventHeld(h);const g=ventGust(h);if(g.p>=0)level+=.16*Math.sin(Math.PI*g.p);
 // In bursts, the wind comes in waves of about a second and a half.
 if(character==='cops'&&h>.6)level*=.82+.18*Math.sin(h*4.2);
 const calm=release===null||release===undefined||t<=release?0:Vs((t-release)/VENT_CALM);
 return {level:level*(1-calm),held:h,grade:ventGrade(h),gust:g,calm};}
// When a press ends: the wind blows at least VENT_MIN seconds, then calms and the trees settle.
export const ventRelease=t=>Math.max(t,VENT_MIN);
export const ventEnd=release=>release+VENT_CALM+VENT_SETTLE;
// How many seconds of wind a press gave (they add up towards the change of place).
export const ventBlown=(t,release)=>Math.max(0,Math.min(t,release??t));

// ── The music of a press ─────────────────────────────────────────────────────────────────────────────────────────────────
// The chords of each place go round every two seconds (eight pulses): the scale degrees of their roots.
const VENT_CHORDS=Object.freeze([[0,3,4,0],[0,5,3,4],[0,4,5,3],[0,6,3,4],[0,3,5,4],[0,2,3,4],[0,5,2,4],[0,3,6,4]]);
// The flute's phrases for the gale: [degree above the chord's root, pulses]; each lasts sixteen pulses (four seconds).
const VENT_TUNES=Object.freeze([
 [[4,2],[5,1],[4,1],[2,2],[4,2],[7,4],[6,2],[4,2]],
 [[2,1],[4,1],[5,2],[7,3],[5,1],[4,2],[5,2],[2,4]],
 [[7,2],[6,1],[5,1],[4,2],[2,2],[4,3],[5,1],[4,4]],
 [[0,2],[2,2],[4,2],[5,2],[7,2],[9,2],[7,4]]
]);
const VENT_CACHE=new Map();
// Loudness, measured on the review video (EBU R 128): these light instruments sounded about 10 dB below the stage stories, so their
// velocities are raised by that much (velocity is quadratic); the recording of the wind and of the place (VENT_AIR, a gain used by
// ventAir in app.js) is raised by 12 dB, so that it sits a few decibels under the music.
const VENT_LOUD=1.78;
export const VENT_AIR=4;
// The music of sixteen seconds of a press: cycle 0 starts at the press, cycle c at 16·c seconds; offset: seconds of wind already blowing
// when the press came (the music goes on from that grade). Times are seconds of the press; the app plays them as fractions of VENT_SPAN.
export function ventPlan(variant,press,cycle=0,offset=0){const id=`${variant}|${press}|${cycle}|${offset.toFixed(2)}`;if(VENT_CACHE.has(id))return VENT_CACHE.get(id);
 const S=ventScene(variant),D=VENT_SPAN,P=VENT_PULSE,sc=escScore(D),deg=d=>escNote(S.key,S.mode,d),put=(t,len,inst,m,vel,x={})=>sc.add(t,len,inst,m,Math.min(1,vel*VENT_LOUD),x);
 const fit=(ds,inst,c)=>escFit(ds.map(deg),inst,c),into=(d,inst,sh)=>escInto(deg(d)+sh,inst),chords=VENT_CHORDS[(S.place+press)%8];
 const shH=fit([0,9],'harpRec',64),shG=fit([4,11],'glockRec'),shM=fit([0,7],'marimbaRec'),shV=fit([0,4],'violinsPizzRec'),shC=fit([0],'celliPizzRec',45),shF=fit([4,11],'fluteRec');
 const n=Math.round(D/P);
 for(let i=0;i<n;i++){const t=i*P,h=cycle*D+t+offset,grade=ventGrade(h),bar=Math.floor((cycle*D+t)/2),root=chords[bar%4],q=i%8;
  if(t>=D-.3)break;
  if(grade===1){
   // The breeze: slow harp notes that climb, one every two pulses.
   if(q%2===0)put(t,1.6,'harpRec',[into(root+[0,2,4,7][(q/2)%4],'harpRec',shH)],.2+.04*(q/2),{pan:-.25});
  }else{
   // From the wind on: broken chords on the harp, one note a pulse.
   put(t,1.2,'harpRec',[into(root+[0,2,4,7,9,7,4,2][q],'harpRec',shH)],grade>=4?.22:.19,{pan:-.25});
   // The glockenspiel sparkles on the beats.
   if(q%4===0)put(t,1.4,'glockRec',[into(root+(q?4:7),'glockRec',shG)],grade>=4?.2:.16,{pan:.2});
   if(grade>=3){
    // The strong wind: marimba in quavers and plucked strings off the beat, the root on the cellos at the bar.
    if(q%2===0)put(t,.5,'marimbaRec',[into(root+[0,4,2,4][(q/2)%4],'marimbaRec',shM)],.17,{pan:.32});
    if(q%2===1)put(t,.4,'violinsPizzRec',[into(root+[4,2,4,7][(q>>1)%4],'violinsPizzRec',shV)],.13,{pan:-.12});
    if(q===0)put(t,1,'celliPizzRec',[into(root,'celliPizzRec',shC)],.24,{pan:.08});}}
 }
 // The gale: the flute sings a phrase with every gust (every four seconds), a different one each time. A phrase that began in the
 // sixteen seconds before goes on into these.
 for(let k=0;k<12;k++){const t0=VENT_GRADES[3]+4*k-offset-cycle*D;if(t0<=-4||t0>=D-.4)continue;
  const tune=VENT_TUNES[(press+k)%4];let p=0;
  for(const [d,len] of tune){const t=t0+p*P;p+=len;if(t<0)continue;if(t>=D-.4)break;const root=chords[Math.floor((cycle*D+t)/2)%4];put(t,len*P*.92,'fluteRec',[into(root+d,'fluteRec',shF)],.3,{pan:-.05});}}
 // Each gust of the gale: a harp glissando that climbs and a high glockenspiel note.
 for(let k=0;k<12;k++){const h=VENT_GRADES[3]+4*k,t=h-offset-cycle*D;if(t<0||t>=D-.6)continue;
  for(let i=0;i<8;i++)put(t+i*.05,1.2,'harpRec',[into(i+7,'harpRec',shH)],.15+.015*i,{pan:-.3});put(t+.42,1.6,'glockRec',[into(11,'glockRec',shG)],.22,{pan:.25});}
 const plan={D,scene:S,cycle,offset,score:sc.done()};if(VENT_CACHE.size>64)VENT_CACHE.delete(VENT_CACHE.keys().next().value);VENT_CACHE.set(id,plan);return plan;}
export const ventScore=(variant,press,cycle=0,offset=0)=>ventPlan(variant,press,cycle,offset).score;
// When the wind calms: a harp note and a glockenspiel note that fade (times in seconds from the calm).
export function ventCoda(variant,press){const S=ventScene(variant),deg=d=>escNote(S.key,S.mode,d),root=VENT_CHORDS[(S.place+press)%8][0];
 const shH=escFit([0,4].map(deg),'harpRec',62),shG=escFit([4].map(deg),'glockRec');
 return [{at:0,length:2.2,inst:'harpRec',midi:[escInto(deg(root)+shH,'harpRec'),escInto(deg(root+4)+shH,'harpRec')],vel:.3*VENT_LOUD,pan:-.2,strum:.06},{at:.35,length:2,inst:'glockRec',midi:[escInto(deg(root+4)+shG,'glockRec')],vel:.18*VENT_LOUD,pan:.2}];}
