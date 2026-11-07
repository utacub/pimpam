// Dia rere dia (CE09, replaces Dia i nit): a village of cut paper through a whole day. Each press moves the day on to its next moment
// (dawn, morning, noon, afternoon, sunset, dusk, night, small hours), and at each moment something different happens. When the sun
// rises again it is another day: the first four follow the seasons, and from the fifth on the events are drawn from pools, so no two
// days are the same. Music: recorded acoustic instruments (sampler.js) and recorded nature sounds; every piece ends on plucked or
// struck notes that die away on their own.
import {Kclamp,Ksmooth,Krand} from './kaleido-base.js';

export const DIA_MIN_DURATION=9;
export const DIA_MOMENTS=Object.freeze(['Albada','Matí','Migdia','Tarda','Posta','Vespre','Nit','Matinada']);
export const DIA_SEASONS=Object.freeze(['primavera','estiu','tardor','hivern']);
// Moments visited with 2, 4 or 8 moments per day. With 2, the activity is the old day and night: noon and night.
export const DIA_STOPS=Object.freeze({2:Object.freeze([2,6]),4:Object.freeze([0,2,4,6]),8:Object.freeze([0,1,2,3,4,5,6,7])});
export const diaStops=n=>DIA_STOPS[n]||DIA_STOPS[8];

// Events. moment: when it happens; season: the seasons it belongs to (all if absent); needs: a weather of the day ('rain', 'snow',
// 'festa') or its absence ('dry': no rain or snow); name: what an adult reads in the status line.
const E=(moment,name,o={})=>Object.freeze({moment,name,...o});
export const DIA_EVENTS=Object.freeze({
 boira:E(0,'la boira s’aixeca del riu',{needs:'dry'}),
 globus:E(0,'un globus aerostàtic s’enlaira',{needs:'dry',season:[0,1,2]}),
 nuvolsRosats:E(0,'núvols rosats sobre els turons'),
 gebre:E(0,'el gebre brilla als teulats',{season:[3]}),
 roba:E(1,'roba estesa de colors',{needs:'dry',season:[0,1,2]}),
 banderoles:E(1,'banderoles de festa al carrer',{needs:'festa'}),
 pluja:E(1,'comença a ploure',{needs:'rain'}),
 neu:E(1,'comença a nevar',{needs:'snow'}),
 floracio:E(2,'els arbres floreixen',{season:[0],needs:'dry'}),
 mercat:E(2,'parades de mercat al prat',{needs:'dry'}),
 arc:E(2,'la pluja s’atura i surt l’arc de Sant Martí',{needs:'rain'}),
 ninot:E(2,'un ninot de neu a la plaça',{needs:'snow'}),
 estels:E(3,'estels de paper al vent',{needs:'dry',season:[0,1,2]}),
 cercavila:E(3,'la cercavila amb banderes i cintes',{needs:'festa'}),
 fulles:E(3,'les fulles volen pertot',{season:[2]}),
 gel:E(3,'el riu es glaça',{season:[3]}),
 flors:E(4,'les flors es tanquen',{season:[0,1]}),
 garlandes:E(4,'s’encenen les garlandes',{needs:'festa'}),
 celVermell:E(4,'el cel s’encén de vermell',{season:[1,2,3]}),
 neuRosa:E(4,'la neu es torna rosa',{needs:'snow'}),
 cuques:E(5,'cuques de llum al prat',{season:[0,1],needs:'dry'}),
 concert:E(5,'concert de banda a la plaça',{needs:'festa'}),
 bassals:E(5,'els bassals reflecteixen els fanals',{needs:'rain'}),
 llumsColors:E(5,'llums de colors a les finestres',{season:[3]}),
 estelFugac:E(6,'un estel fugaç',{needs:'dry'}),
 focs:E(6,'un petit castell de focs',{needs:'festa'}),
 llunaNuvols:E(6,'la lluna surt entre núvols'),
 estrellesNeu:E(6,'les estrelles brillen sobre la neu',{needs:'snow'}),
 rosada:E(7,'la rosada cobreix el prat',{season:[0,1],needs:'dry'}),
 bombetes:E(7,'s’apaguen les últimes bombetes',{needs:'festa'}),
 boiraBaixa:E(7,'boira baixa al riu',{needs:'dry'}),
 neuFluixa:E(7,'torna a nevar, molt fluix',{needs:'snow'}),
 // Events that only the drawn days use (from the fifth day on).
 ocellsAlba:E(0,'un estol d’ocells travessa el cel'),
 avioneta:E(1,'passa una avioneta amb una cinta de colors',{needs:'dry'}),
 papallones:E(2,'papallones al prat',{season:[0,1],needs:'dry'}),
 bombolles:E(3,'bombolles de sabó sobre el poble',{needs:'dry'}),
 nuvolsDaurats:E(4,'núvols daurats a la posta'),
 fanalets:E(5,'s’encenen fanalets de colors al carrer'),
 plujaEstels:E(6,'una pluja d’estels',{needs:'dry'}),
 llunaGran:E(6,'surt una lluna plena molt gran'),
 forn:E(7,'el forn del poble s’encén'),
 // Added so that rainy and snowy days change from one to the next as much as the dry ones.
 bolesNeu:E(2,'boles de neu volen pel prat',{needs:'snow'}),
 trineus:E(3,'trineus de colors baixen pel turó',{needs:'snow'}),
 vaixells:E(3,'vaixells de paper a l’estany',{needs:'rain'}),
 cargols:E(7,'els cargols surten després de la pluja',{needs:'rain'})
});
// What happens every day at each moment (the frame the events add to).
export const DIA_DAILY=Object.freeze(['surt el sol i s’apaguen els fanals','s’obren les finestres i surt fum de les xemeneies','el campanar toca migdia','passa el tren pel viaducte','el sol es pon i els ocells tornen','s’encenen les finestres i surt la primera estrella','la lluna travessa el cel','s’apaguen les finestres i clareja']);
// The first four days, one per season.
const DIA_FIXED=Object.freeze([
 Object.freeze({season:0,rain:false,snow:false,festa:false,events:['boira','roba','floracio','estels','flors','cuques','estelFugac','rosada']}),
 Object.freeze({season:1,rain:false,snow:false,festa:true,events:['globus','banderoles','mercat','cercavila','garlandes','concert','focs','bombetes']}),
 Object.freeze({season:2,rain:true,snow:false,festa:false,events:['nuvolsRosats','pluja','arc','fulles','celVermell','bassals','llunaNuvols','boiraBaixa']}),
 Object.freeze({season:3,rain:false,snow:true,festa:false,events:['gebre','neu','ninot','gel','neuRosa','llumsColors','estrellesNeu','neuFluixa']})
]);
const fits=(e,day)=>{const x=DIA_EVENTS[e];if(x.season&&!x.season.includes(day.season))return false;
 if(x.needs==='dry')return !day.rain&&!day.snow;if(x.needs)return !!day[x.needs];return true;};
// A day: its season, its weather and the event of each moment. Day −1 is the quiet night before the first press.
const DIA_CACHE=new Map();
export function diaDay(d){d=Math.floor(d);if(DIA_CACHE.has(d))return DIA_CACHE.get(d);let day;
 if(d<0)day={d,season:0,rain:false,snow:false,festa:false,events:Array(8).fill(null)};
 else if(d<4)day={d,...DIA_FIXED[d],events:[...DIA_FIXED[d].events]};
 else{const season=d%4,r=k=>Krand(d*13+k,71);
  // Weather of a drawn day: showers in spring, a festival in summer, rain in autumn, snow in winter (not every time).
  day={d,season,rain:season===0?r(1)<.3:season===2?r(1)<.6:false,snow:season===3&&r(2)<.7,festa:season===1?r(3)<.65:r(3)<.12};
  if(day.rain&&day.festa)day.festa=false;
  const prev=diaDay(d-1);
  day.events=Array.from({length:8},(_,m)=>{const pool=Object.keys(DIA_EVENTS).filter(e=>DIA_EVENTS[e].moment===m&&fits(e,day));
   // The weather events of the day come first, so a rainy day does rain; otherwise any event that fits, never yesterday's one.
   const must=pool.filter(e=>['pluja','neu','banderoles','garlandes','arc'].includes(e));if(must.length&&r(30+m)<.8)return must[0];
   const fresh=pool.filter(e=>e!==prev.events[m]&&e!==diaDay(d-4).events[m]),from=fresh.length?fresh:pool;return from.length?from[Math.floor(r(10+m)*from.length)]:null;});}
 Object.freeze(day.events);day=Object.freeze(day);DIA_CACHE.set(d,day);return day;}

// Position in the day: Φ = 8 × day + moment. A press moves from the current position to the next stop.
export function diaNext(target,moments){const stops=diaStops(moments);for(let x=Math.floor(target)+1;;x++)if(stops.includes(((x%8)+8)%8))return x;}
export function diaStart(moments){const stops=diaStops(moments);return stops[stops.length-1]-8;}
// The sky moves from the old position to the new one in the first seconds of the press.
export const diaTravel=(from,to)=>Math.min(4.2,2.2+.55*Math.max(0,to-from-1));
export function diaPhase(from,to,t){const len=diaTravel(from,to);return from+(to-from)*Ksmooth(t/len);}
// Status line for an adult.
// Short label for the progress line: the moment, the day and its season.
export function diaLabel(target){const d=Math.floor(target/8),m=((target%8)+8)%8;return `${DIA_MOMENTS[m]} · dia ${d+1} · ${DIA_SEASONS[diaDay(d).season]}`;}
export function diaStatus(target){const day=diaDay(Math.floor(target/8)),m=((target%8)+8)%8,e=day.events[m];
 return `${DIA_MOMENTS[m]} del dia ${day.d+1} (${DIA_SEASONS[day.season]}): ${DIA_DAILY[m]}${e?'; '+DIA_EVENTS[e].name:''}.`;}

// ── Music ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// One piece per press, about nine seconds: a struck chord on the press, a melody whose instrument changes through the day, a plucked
// accompaniment, the sounds of the day's events and a recorded nature sound. Each season has its own key; each day transposes
// slightly and picks its own melody, so the same moment never sounds exactly the same on two days.
const DIA_SCALE=Object.freeze({major:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],mixolydian:[0,2,4,5,7,9,10],aeolian:[0,2,3,5,7,8,10]});
const DIA_KEYS=Object.freeze([[65,'major'],[67,'mixolydian'],[62,'dorian'],[69,'aeolian']]);
// Melody instrument, accompaniment and nature sound of each moment.
const DIA_VOICES=Object.freeze([
 {lead:'fluteRec',acc:'harpRec',shape:'up',prog:[0,3,4,0],nature:'dawn',oct:1},
 {lead:'clarinetRec',acc:'violinsPizzRec',shape:'updown',prog:[0,5,3,4],nature:'blackbird',oct:0},
 {lead:'marimbaRec',acc:'harpRec',shape:'broken',prog:[0,3,4,0],nature:'meadow',oct:0},
 {lead:'oboeRec',acc:'violinsPizzRec',shape:'up',prog:[0,4,5,3],nature:'wind',oct:0},
 {lead:'violinsRec',acc:'harpRec',shape:'down',prog:[0,5,3,4],nature:'blackbird',oct:0},
 {lead:'clarinetRec',acc:'celliPizzRec',shape:'updown',prog:[5,3,0,4],nature:'crickets',oct:-1},
 {lead:'harpRec',acc:'glockRec',shape:'up',prog:[0,5,3,0],nature:'crickets',oct:0},
 {lead:'fluteRec',acc:'harpRec',shape:'down',prog:[3,0,4,0],nature:'frogs',oct:0}
]);
// Melodies: scale degrees and lengths in beats (sixteen beats per piece, with the last bar left to the closing notes).
const DIA_TUNES=Object.freeze([
 [[0,1],[2,1],[4,2],[5,1],[4,1],[2,2],[1,1],[2,1],[4,1],[7,1],[4,2]],
 [[4,1.5],[5,.5],[4,1],[2,1],[0,2],[1,1],[2,1],[3,1.5],[2,.5],[1,1],[4,1],[2,2]],
 [[7,1],[6,1],[4,1],[5,1],[4,2],[2,2],[3,1],[4,1],[5,1],[3,1],[2,2]],
 [[2,.5],[3,.5],[4,1],[4,1],[5,1],[7,2],[6,1],[5,1],[4,2],[2,1],[1,1],[2,2]],
 [[0,2],[4,1],[3,1],[2,2],[4,1],[5,1],[4,2],[2,1],[1,1],[0,2]]
]);
const dnote=(key,mode,d)=>{const s=DIA_SCALE[mode],o=Math.floor(d/7),i=d-7*o;return key+12*o+s[i];};
const near=(m,c)=>{while(m<c-6)m+=12;while(m>c+6)m-=12;return m;};
// Event sounds, in seconds from the press: [time, length, instrument, midi (or [] for unpitched), velocity, extra].
function diaCues(id,key,mode,deg){const out=[],a=(t,l,inst,midi,vel,x={})=>out.push([t,l,inst,midi,vel,x]),run=(t0,dt,inst,degs,vel,oct=0)=>degs.forEach((d,i)=>a(t0+i*dt,1.2,inst,[deg(d)+12*oct],vel));
 switch(id){
  // Every day.
  case 'daily0':run(.9,.22,'glockRec',[0,2,4,7],.32,1);break;
  case 'daily1':run(1.2,.16,'violinsPizzRec',[4,5,7],.36);break;
  // Noon: the bell tower, as bells of glockenspiel over the harp and a soft stroke of timpani.
  case 'daily2':for(let i=0;i<3;i++){a(1+i*1.25,2.2,'glockRec',[deg(0)+12],.5);a(1+i*1.25,2.2,'harpRec',[deg(0)-12,deg(4)-12],.45);a(1+i*1.25,1.6,'timpaniRec',[deg(0)-24],.35);}break;
  // The train: the wheels on the rails (woodblock) and a two-note whistle on the flute.
  case 'daily3':for(let i=0;i<14;i++)a(2+i*.27,.2,'woodblockRec',[],i%2?.22:.32);a(2.2,.5,'fluteRec',[deg(4)+12],.4);a(2.7,.6,'fluteRec',[deg(2)+12],.36);break;
  case 'daily4':run(1.4,.3,'harpRec',[7,5,4,2,0],.36);break;
  case 'daily5':for(let i=0;i<7;i++)a(1.1+i*.45,1.4,'glockRec',[deg([0,2,4,5,4,2,7][i])+12],.22+i*.02);break;
  case 'daily6':run(1.6,.5,'harpRec',[0,4,7,9],.3,1);break;
  case 'daily7':run(1.4,.45,'glockRec',[7,4,2,0],.2,1);break;
  // The events.
  case 'boira':run(2.4,.5,'fluteRec',[2,4,5],.3);break;
  case 'globus':a(2.2,1.6,'timpaniRec',[deg(0)-24],.3);run(2.6,.35,'fluteRec',[0,2,4,7],.38,1);break;
  case 'nuvolsRosats':run(2.4,.4,'harpRec',[4,5,7,9],.32);break;
  case 'gebre':for(let i=0;i<6;i++)a(2.3+i*.33,1.2,'glockRec',[deg([7,9,11,9,7,11][i])+12],.24);a(2.3,1,'triangleRec',[],.18,{variant:'hit'});break;
  case 'roba':run(2.4,.2,'violinsPizzRec',[0,2,4,2,4,5,7],.34);break;
  case 'banderoles':run(2.2,.17,'violinsPizzRec',[0,2,4,5,7,9,11,14],.38);a(3.6,.6,'trumpetRec',[deg(4)],.3);break;
  case 'pluja':out.push([1.8,7,'natureRec',[60],.42,{variant:'rain',pan:0}]);for(let i=0;i<8;i++)a(2.3+i*.55,1,'marimbaRec',[deg([7,4,9,5,7,2,4,0][i])+12],.22);break;
  case 'neu':for(let i=0;i<9;i++)a(2.2+i*.6,1.6,'glockRec',[deg([4,7,9,7,11,9,7,4,2][i])+12],.2);a(2.2,1.4,'triangleRec',[],.14,{variant:'hit'});break;
  case 'floracio':run(2.3,.13,'harpRec',[0,2,4,5,7,9,11,14],.38,1);run(3.6,.3,'glockRec',[7,9,11],.24,1);break;
  case 'mercat':for(let i=0;i<8;i++)a(2.4+i*.3,.2,'woodblockRec',[],.22);run(2.4,.3,'marimbaRec',[0,4,2,5,4,7],.36);break;
  case 'arc':run(2.4,.16,'harpRec',[0,2,4,5,7,9,11,14,16],.4,0);a(4,2,'glockRec',[deg(7)+12],.3);break;
  case 'ninot':run(2.6,.42,'marimbaRec',[0,4,7,4,0],.38);break;
  case 'estels':out.push([1.6,7,'natureRec',[60],.3,{variant:'wind',pan:.3}]);run(2.5,.25,'fluteRec',[4,5,7,9,7],.34,1);break;
  case 'cercavila':for(let i=0;i<10;i++){a(2+i*.42,.3,i%2?'snareRec':'bassdrumRec',[],i%2?.18:.28);}run(2,.42,'trumpetRec',[0,2,4,4,5,4,2,0],.32);break;
  case 'fulles':out.push([1.6,6,'natureRec',[60],.36,{variant:'wind',pan:-.3}]);run(2.4,.22,'harpRec',[11,9,7,5,4,2,0],.32,0);break;
  case 'gel':for(let i=0;i<5;i++)a(2.4+i*.5,1.4,'glockRec',[deg([0,4,7,11,14][i])+12],.24);a(2.4,1.2,'triangleRec',[],.16,{variant:'hit'});break;
  case 'flors':run(2.4,.36,'harpRec',[9,7,5,4,2],.32);break;
  case 'garlandes':for(let i=0;i<10;i++)a(2.2+i*.24,1.1,'glockRec',[deg(i)+12],.22);break;
  case 'celVermell':run(2.4,.6,'celliPizzRec',[0,4,5,4],.4,-1);break;
  case 'neuRosa':run(2.5,.5,'glockRec',[4,2,4,7],.24,1);break;
  case 'cuques':for(let i=0;i<8;i++)a(2.2+Krand(i,9)*4.5,1.2,'glockRec',[deg([7,9,11,14][i%4])+12],.16);break;
  case 'concert':for(let i=0;i<8;i++){a(2.1+i*.5,.45,'trumpetRec',[deg([0,2,4,2,4,5,4,2][i])],.3);a(2.1+i*.5,.45,'tubaRec',[deg(i%2?4:0)-24],.3);}a(2.1,.4,'cymbalRec',[],.15,{variant:'soft'});break;
  case 'bassals':out.push([1.8,6,'natureRec',[60],.32,{variant:'drops',pan:0}]);run(2.6,.6,'marimbaRec',[4,2,4,7],.28);break;
  case 'llumsColors':for(let i=0;i<9;i++)a(2.2+i*.38,1.2,'glockRec',[deg([0,4,2,5,4,7,5,9,7][i])+12],.22);break;
  case 'estelFugac':run(2.8,.08,'harpRec',[14,12,11,9,7,5,4,2,0],.32);a(2.8,1.4,'triangleRec',[],.16,{variant:'hit'});break;
  case 'focs':for(const [t,v] of [[2.2,'launch'],[2.9,'bloom'],[3.6,'crackle'],[4.1,'bloom'],[4.9,'shimmer']])a(t,1.6,'fireRec',[],.3,{variant:v});run(2.9,.3,'glockRec',[0,4,7,11],.24,1);break;
  case 'llunaNuvols':run(2.4,.6,'clarinetRec',[0,2,4,2],.3,-1);break;
  case 'estrellesNeu':for(let i=0;i<10;i++)a(2.2+i*.42,1.2,'glockRec',[deg([7,4,9,7,11,9,14,11,9,7][i])+12],.18);break;
  case 'rosada':for(let i=0;i<7;i++)a(2.3+i*.5,1.1,'glockRec',[deg([9,7,9,4,7,2,4][i])+12],.18);break;
  case 'bombetes':for(let i=0;i<8;i++)a(2.2+i*.4,1,'glockRec',[deg(9-i)+12],.2);break;
  case 'boiraBaixa':run(2.6,.7,'fluteRec',[4,2,0],.26);break;
  case 'ocellsAlba':run(2.4,.18,'fluteRec',[7,9,7,11,9],.3,1);break;
  case 'avioneta':a(2.2,4,'cymbalRec',[],.08,{variant:'swell'});run(2.6,.4,'clarinetRec',[4,5,7,5],.3);break;
  case 'papallones':run(2.3,.2,'violinsPizzRec',[7,9,11,9,7,9,11,14],.3);break;
  case 'bombolles':for(let i=0;i<8;i++)a(2.2+i*.42,1,'marimbaRec',[deg([4,7,9,11,9,7,11,14][i])+12],.26);break;
  case 'nuvolsDaurats':run(2.4,.5,'harpRec',[2,4,7,9],.32);break;
  case 'fanalets':for(let i=0;i<7;i++)a(2.2+i*.42,1.2,'glockRec',[deg([0,2,4,7,4,2,0][i])+12],.2);break;
  case 'plujaEstels':for(let k=0;k<3;k++)run(2.4+k*1.3,.07,'harpRec',[14,11,9,7,4],.26);a(2.4,1.4,'triangleRec',[],.14,{variant:'hit'});break;
  case 'llunaGran':run(2.4,.7,'violinsRec',[0,4,7],.26);break;
  case 'forn':run(2.6,.5,'marimbaRec',[0,2,4],.3);break;
  case 'bolesNeu':for(let i=0;i<6;i++){a(2.2+i*.5,.6,'violinsPizzRec',[deg([0,2,4,2,4,7][i])+12],.3);a(2.55+i*.5,.4,'triangleRec',[],.1,{variant:'muted'});}break;
  case 'trineus':for(let i=0;i<10;i++)a(2+i*.25,.3,'triangleRec',[],.09,{variant:'muted'});run(2.2,.18,'harpRec',[14,12,11,9,7,5,4],.3);a(4.4,1.2,'glockRec',[deg(0)+24],.24);break;
  case 'vaixells':out.push([1.8,5,'natureRec',[60],.28,{variant:'drops',pan:.35}]);run(2.4,.4,'fluteRec',[4,2,0,2,4,4,4],.32,1);break;
  case 'cargols':run(2.4,.6,'marimbaRec',[0,2,4,2,0],.28);a(2.4,1.2,'celliPizzRec',[deg(0)-12],.3);break;
  case 'neuFluixa':for(let i=0;i<5;i++)a(2.6+i*.8,1.4,'glockRec',[deg([7,4,9,7,4][i])+12],.16);break;
 }
 return out;}
// The score of one press: events in fractions of the duration (at, length), as the app plays them.
export function diaScore(target,duration){const D=Math.max(DIA_MIN_DURATION,duration),day=diaDay(Math.floor(target/8)),m=((target%8)+8)%8,v=DIA_VOICES[m];
 const shift=[0,2,-3,-1][(day.d%4+4)%4]*(day.d>=4?1:0),[k0,mode]=DIA_KEYS[day.season],key=k0+shift,deg=d=>dnote(key,mode,d);
 const out=[],add=(time,length,inst,midi,vel,x={})=>{if(time>=D-.05)return;out.push({time,length:Math.min(length,D-time),inst,midi,vel:Kclamp(vel,0,1),...x});};
 const beat=Math.min(.62,(D-1.6)/16),end=16*beat;
 // The press: a struck chord on the harp over a low plucked note.
 const chord=r=>[0,2,4].map(i=>near(deg(r+i),key+7));add(0,1.8,'harpRec',chord(v.prog[0]),.62,{strum:.04});add(0,1.4,'celliPizzRec',[deg(v.prog[0])-24],.5);
 // Accompaniment: plucked chord tones, one per half beat, following the progression.
 const shapes={up:[0,1,2,3],down:[3,2,1,0],updown:[0,1,2,3,2,1],broken:[0,2,1,3]};
 for(let i=2;i<30;i++){const t=i*beat/2;if(t>=end-beat)break;const bar=Math.min(3,Math.floor(t/(4*beat))),r=v.prog[bar],sh=shapes[v.shape],tone=[0,2,4,7][sh[i%sh.length]];
  add(t,beat*1.4,v.acc,[near(deg(r+tone),v.acc==='glockRec'?key+24:v.acc==='celliPizzRec'?key-12:key+5)],(i%2?.24:.32));}
 // Bass: one plucked note per bar.
 for(let b=0;b<4;b++)add(b*4*beat,beat*2.2,'celliPizzRec',[near(deg(v.prog[b]),key-19)],.36);
 // Melody: the day picks one of five tunes; its instrument belongs to the moment.
 const tune=DIA_TUNES[(day.d+m*3+40)%DIA_TUNES.length];let t=beat*2;
 for(const [d,len] of tune){if(t>=end-beat)break;add(t,len*beat*.95,v.lead,[deg(d)+12*v.oct],v.lead==='marimbaRec'||v.lead==='harpRec'?.5:.42);t+=len*beat;}
 // The sounds of what happens every day and of today's event.
 const cues=[...diaCues('daily'+m,key,mode,deg),...(day.events[m]?diaCues(day.events[m],key,mode,deg):[])];
 for(const [time,length,inst,midi,vel,x] of cues)add(time,length,inst,midi.length?midi:[60],vel,x);
 // Nature: two voices of the moment's recording, panned apart (rain replaces the day sounds while it rains).
 const wet=day.rain&&m>=1&&m<=2,snowy=day.snow&&m>=5,sound=wet?'rain':snowy&&v.nature==='crickets'?'wind':day.season===3&&v.nature==='frogs'?'brook':v.nature;
 for(const [side,start] of [[-1,0],[1,4.3]])add(0,D-.4,'natureRec',[60],.4,{pan:side*.55,variant:sound,start:start+(day.d%3)*1.7});
 // Close: a rolled harp chord and a glockenspiel note that ring out on their own.
 add(end,2.6,'harpRec',chord(0).concat([deg(7)+12]),.5,{strum:.06});add(end+.12,2.2,'glockRec',[deg(4)+24],.28);
 return out.sort((a,b)=>a.time-b.time).map(({time,length,...e})=>({at:time/D,length:length/D,...e}));}
