// El viatge en globus (CE43), 0.43. A hold activity, and the last of its kind in Pim Pam (Marc, 4 November 2026). While the switch is
// held the burner roars and the balloon climbs; when it is let go the flame goes out and the balloon sinks slowly back towards the
// ground. The wind always carries it to the right, stronger the higher it flies, so the landscape never stops passing. A journey is a
// whole day over one of five routes in one of four seasons (twenty journeys): dawn take-off, eight stages of light, landmarks with their
// gags on the ground, and a landing at daybreak where people wait with lanterns; then the next journey, another route and season.
// This module is the model: the journey, the dynamics of the height, the day, the landmarks, the characters' poses, the cues for the
// sounds, the music and the sound bus. The painting is in viatge-pinzell.js, viatge-mon.js and viatge-art.js.
import {sampleZone} from './sampler.js';
import {escFit,escInto} from './escenari.js';
// The modes of the score (lydian is not among the collection's scales).
const VG_SCALES=Object.freeze({major:[0,2,4,5,7,9,11],lydian:[0,2,4,6,7,9,11],dorian:[0,2,3,5,7,9,10],mixolydian:[0,2,4,5,7,9,10]});
export const vgNote=(key,mode,d)=>{const s=VG_SCALES[mode]||VG_SCALES.major,o=Math.floor(d/7),i=d-7*o;return key+12*o+s[i];};

// ── Journeys ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const VG_ROUTES=Object.freeze([
 {id:'vall',name:'La vall',key:[62,'lydian'],marks:['masia','ramat','poble','viaducte','ermita','panta']},
 {id:'costa',name:'La costa',key:[64,'lydian'],marks:['port','platja','cala','pobleblanc','illot','far']},
 {id:'muntanya',name:'L’alta muntanya',key:[60,'lydian'],marks:['refugi','estany','tartera','pontpenjant','collada','telecabina']},
 {id:'delta',name:'El delta',key:[65,'lydian'],marks:['barraca','canal','arrossars','llacuna','dunes','gola']},
 {id:'illes',name:'Les illes',key:[67,'lydian'],marks:['moli','cala2','pobleenfilat','castell','illadeserta','farpetit']}]);
// The catalogue's card (app.js puts it among the cause-and-effect activities; the menu's folder «Mantenir premut»).
export const VG_CAUSE=Object.freeze({id:'viatge',code:'CE43',name:'El viatge en globus',desc:'La Mila i el seu gos Bru volen en globus d’albada a albada. Mentre mantens premut el commutador el cremador s’encén i el globus puja fins als núvols; en deixar-lo anar, baixa a poc a poc fins arran dels arbres. El vent l’empeny sempre endavant: una masia, un port, un far, un telecabina, flamencs, dofins… Cinc rutes i quatre estacions, vint viatges, cadascun un dia sencer que acaba amb un aterratge a l’alba.',kind:'hold',continuous:false,type:'ce',level:'01 · Descobrir',tag:'20 viatges · mantenir premut',time:'Al teu ritme',viatge:true,recorded:true});
export const VG_SEASONS=Object.freeze(['primavera','estiu','tardor','hivern']);
export const VG_SEASON_NAMES=Object.freeze(['primavera','estiu','tardor','hivern']);
export const VG_STAGES=Object.freeze(['albada','mati','migdia','tarda','posta','vespre','nit','matinada']);
export const VG_STAGE_NAMES=Object.freeze(['L’albada','El matí','El migdia','La tarda','La posta','El vespre','La nit','La matinada']);
// A journey: v = route·4 + season (0..19). The next one changes both, and in twenty journeys every pair comes once (5 and 4 are coprime).
export const vgJourney=v=>{v=((Math.round(v)||0)%20+20)%20;const route=Math.floor(v/4),season=v%4;return {v,route,season,R:VG_ROUTES[route],seasonId:VG_SEASONS[season]};};
export const vgNext=v=>{const j=vgJourney(v);return ((j.route+1)%5)*4+(j.season+1)%4;};
// The first journey: from the settings (vgRoute, vgSeason: 'atzar' or an id) or at random.
export function vgFirst(s,rand=Math.random){const ri=VG_ROUTES.findIndex(r=>r.id===s?.vgRoute),si=VG_SEASONS.indexOf(s?.vgSeason);
 return (ri>=0?ri:Math.floor(rand()*5))*4+(si>=0?si:Math.floor(rand()*4));}

// ── The dynamics, in seconds ─────────────────────────────────────────────────────────────────────────────────────────────────
// From the treetops to the clouds in 10 s of burning; from the top to the treetops in 24 s; a press burns at least 2 s.
export const VG_CLIMB=10,VG_SINK=24,VG_MIN_BURN=2,VG_LAG=.7;
// The wind: virtual pixels a second at the near ground (the frame is 800 high), and how much faster it blows at the top.
export const VG_WIND=70,VG_WIND_TOP=.8;
// Length of a day flown low (the setting vgDay), and where the landing begins (share of the day).
export const VG_DAYS=Object.freeze({curta:240,normal:360,llarga:480});
export const VG_LAND_AT=.93,VG_LAND_T=16,VG_LANDED=8,VG_FADE=2.4,VG_TAKEOFF=6,VG_GROUND=-.12;
// Where the six landmarks of a route come, as a share of the day (each is passed at the balloon then).
export const VG_MARK_AT=Object.freeze([.07,.2,.33,.47,.61,.77]);
// Waiting: low, burner off and no press for this long, the scene slows and darkens a little (setting waitCue).
export const VG_IDLE=12;
const vgClamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),vgSs=x=>{x=vgClamp(x);return x*x*(3-2*x);};
export const vgDayLength=s=>VG_DAYS[s?.vgDay]||VG_DAYS.normal;
// The wind at height a (0 low, 1 top); journey 19 (the islands in autumn) blows half as strong again at every height.
export const vgWind=(a,v)=>VG_WIND*(1+VG_WIND_TOP*vgClamp(a))*(v===18?1.45:1);
export const vgTotal=s=>VG_WIND*vgDayLength(s);

export function vgNewFlight(v,s){return {v,dist:0,a:VG_GROUND,vel:0,burn:false,burnSince:-1,burnUntil:0,held:false,toggled:false,t:0,phase:'takeoff',phaseT:0,
 idle:0,dark:0,slow:1,pose:{mila:'look',bru:'up',since:0},cues:[],marksDone:new Set(),barks:0,land:null,presses:0,flame:0,glowT:0,bob:0,lastBurnEnd:-99,events:{}};}
export function vgStart(game,s){const v=vgFirst(s);game.viatge=vgNewFlight(v,s);game.count=0;game.completed=0;return game.viatge;}

// The phase that lets the switch act: never while landing or between journeys.
const vgFlying=f=>f.phase==='fly'||f.phase==='takeoff';
export function vgBlocked(game,s){const f=game?.viatge;if(!f)return false;if(!vgFlying(f))return true;if(s.interaction==='toggle')return false;return f.held;}
export function vgPress(game,s){const f=game?.viatge;if(!f||!vgFlying(f))return false;f.presses++;f.idle=0;
 if(s.interaction==='toggle'){if(f.burn&&f.toggled){f.toggled=false;vgStop(f);return true;}f.toggled=true;vgBurn(f);return true;}
 f.held=true;vgBurn(f);return true;}
export function vgReleasing(game,s){return !!game?.viatge&&s.interaction!=='toggle'&&game.viatge.held;}
export function vgRelease(game){const f=game?.viatge;if(!f||!f.held)return false;f.held=false;if(f.burn)f.burnUntil=Math.max(f.t,f.burnSince+VG_MIN_BURN);return true;}
function vgBurn(f){if(!f.burn){f.burn=true;f.burnSince=f.t;f.cues.push('encesa');f.pose={mila:'look',bru:'up',since:f.t};}f.burnUntil=Infinity;}
function vgStop(f){if(!f.burn)return;f.burn=false;f.lastBurnEnd=f.t;f.cues.push('apagada');f.burnUntil=0;}

// The share of the day flown, the stage (0..7, fractional) and the light key.
export const vgDay=(f,s)=>vgClamp(f.dist/vgTotal(s));
export const vgStage=p=>vgClamp(p)*8;
// One step of the flight (dt seconds of activity time).
export function vgTick(game,s,dt){const f=game?.viatge;if(!f)return;f.t+=dt;f.phaseT+=dt;
 if(f.burn&&!f.held&&!f.toggled&&f.t>=f.burnUntil)vgStop(f);
 // the waiting cue: low, quiet and nobody pressing
 const low=f.a<.12&&!f.burn&&vgFlying(f);f.idle=low?f.idle+dt:0;const want=s.waitCue!==false&&f.idle>VG_IDLE?1:0;
 f.dark+=(want*.32-f.dark)*Math.min(1,dt*1.2);f.slow+=((want?.45:1)-f.slow)*Math.min(1,dt*1.5);
 const total=vgTotal(s);
 if(f.phase==='takeoff'){const k=vgSs(f.phaseT/VG_TAKEOFF);if(!f.burn)f.a=Math.max(f.a,VG_GROUND+(0-VG_GROUND)*k);
  if(f.phaseT>.4&&!f.events.lift){f.events.lift=1;f.cues.push('lladruc');}
  if(f.phaseT>=VG_TAKEOFF||f.a>=0){f.phase='fly';f.phaseT=0;}}
 if(f.phase==='fly'||f.phase==='takeoff'){
  // the climb follows the burner with a short lag; it eases off near the top (floats) and the sink eases off over the treetops
  let target=f.burn?1/VG_CLIMB:-1/VG_SINK;if(f.burn&&f.a>.9)target*=vgClamp((1.02-f.a)/.12);if(!f.burn&&f.a<.06)target*=vgClamp(f.a/.06);
  if(f.phase==='takeoff'&&!f.burn)target=Math.max(target,0);
  f.vel+=(target-f.vel)*Math.min(1,dt/VG_LAG);f.a=Math.min(1.02,f.a+f.vel*dt);if(f.phase==='fly')f.a=Math.max(-.01,f.a);
  f.dist+=vgWind(f.a,f.v)*dt*f.slow*(f.phase==='takeoff'?vgSs(f.phaseT/VG_TAKEOFF)*.8+.2:1);
  if(f.dist>=total*VG_LAND_AT&&f.phase==='fly'){if(f.burn)vgStop(f);f.held=false;f.toggled=false;const v0=vgWind(f.a,f.v);f.phase='landing';f.phaseT=0;f.land={a0:f.a,d0:f.dist,v0,site:f.dist+v0*VG_LAND_T*.5};f.cues.push('aterra');}}
 else if(f.phase==='landing'){const L=f.land,u=vgClamp(f.phaseT/VG_LAND_T),e=vgSs(u);f.a=L.a0+(VG_GROUND-L.a0)*vgSs(Math.pow(u,.8));
  // the distance: speed v0·(1−e), whose integral over the landing is v0·T/2 (so the site arrives under the basket)
  f.dist=L.d0+L.v0*VG_LAND_T*(u-(u*u*u-u*u*u*u/2));f.vel=0;
  if(u>=1){f.phase='landed';f.phaseT=0;f.cues.push('cistella','festa');game.completed=(game.completed||0)+1;}}
 else if(f.phase==='landed'){if(f.phaseT>1.5&&!f.events.bark2){f.events.bark2=1;f.cues.push('lladruc');}if(f.phaseT>=VG_LANDED){f.phase='fade';f.phaseT=0;}}
 else if(f.phase==='fade'){if(f.phaseT>=VG_FADE){f.phase='next';f.phaseT=0;}}
 // 'next': the painter swaps the journey when the new sheets are ready (viatge-art.js), then calls vgBegin
 f.bob+=dt;vgPoses(f,s);game.count=f.marksDone.size;}
// The next journey starts (after the painter has made its sheets).
export function vgBegin(game,s){const f=game.viatge;const n=vgNewFlight(vgNext(f.v),s);n.cues.push('alba');game.viatge=n;return n;}

// ── Landmarks ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The distance at which landmark i is under the balloon.
export const vgMarkDist=(i,s)=>VG_MARK_AT[i]*vgTotal(s);
// The landmark nearest the balloon: index, and how far (virtual px at the near ground; negative before it).
export function vgMarkNear(f,s){let best=-1,d=1e9;for(let i=0;i<6;i++){const x=f.dist-vgMarkDist(i,s);if(Math.abs(x)<Math.abs(d)){d=x;best=i;}}return {i:best,d};}

// ── The characters ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// Mila: look (up at the flame), point (at what comes), wave (to the people below), rope (holds on in the strong wind), sleep (night),
// lantern (lifts the lantern at daybreak). Bru: up (ears up at the flame), peek (head over the edge, going down), bark, wind (ears
// flying), yawn, sleep, howl (once, when the moon rises).
function vgPoses(f,s){const p=vgDay(f,s),st=vgStage(p),t=f.t,P=f.pose,mk=vgMarkNear(f,s);let mila='point',bru='peek';
 const night=st>=6&&st<7.4,since=t-P.since;
 if(f.phase==='landing'||f.phase==='landed'||f.phase==='fade'){mila=f.phase==='landing'?'lantern':'wave';bru=f.phase==='landed'?'bark':'peek';}
 else if(f.burn&&t-f.burnSince<1.4){mila='look';bru='up';}
 else if(night&&!f.burn){mila='sleep';bru=f.events.howl&&t-f.events.howl<2.6?'howl':'sleep';}
 else if(f.a>.7){mila=f.burn?'look':'rope';bru='wind';}
 else if(mk.i>=0&&Math.abs(mk.d)<260&&f.a<.4){mila=mk.d<-60?'point':'wave';bru=Math.abs(mk.d)<120?'bark':'peek';}
 else if(f.burn){mila='look';bru='up';}
 else {mila=f.vel<-.01?'down':'point';bru='peek';}
 if(st>=7.4&&f.phase==='fly')mila='lantern';
 if(mila!==P.mila||bru!==P.bru)f.pose={mila,bru,since:t};
 // the cues of the characters: two barks at each landmark passed low, a yawn at dusk, one howl when the moon rises
 if(mk.i>=0&&Math.abs(mk.d)<110&&!f.marksDone.has(mk.i)){f.marksDone.add(mk.i);f.cues.push('mark'+mk.i);if(f.a<.45)f.cues.push('lladruc');}
 if(st>=5.6&&!f.events.yawn){f.events.yawn=t;f.cues.push('badall');}
 if(st>=6.15&&!f.events.howl){f.events.howl=t;f.cues.push('udol');}}

// ── Light of the day: the eight stages ───────────────────────────────────────────────────────────────────────────────────────
// sky: four stops top→horizon; sun: [x share of the width, height share above the horizon (negative: under)], colour, glow;
// tint: multiply over the painted ground and clouds; lift: warm light added near the sun; stars, lights (windows), lantern (balloon glow).
export const VG_LIGHT=Object.freeze([
 {sky:[[110,124,186],[176,170,212],[244,206,184],[252,226,196]],sun:[.86,.05],sunCol:[255,236,196],glow:[255,196,150],tint:[236,214,226],lift:[255,200,170],liftA:.22,stars:.15,lights:.4,lantern:.35,haze:[236,212,214]},
 {sky:[[70,120,200],[128,172,226],[206,226,238],[232,236,236]],sun:[.74,.42],sunCol:[255,250,226],glow:[255,240,200],tint:[255,250,240],lift:[255,240,210],liftA:.1,stars:0,lights:0,lantern:0,haze:[226,234,240]},
 {sky:[[48,108,198],[106,164,228],[188,218,236],[214,232,240]],sun:[.5,.82],sunCol:[255,253,236],glow:[255,250,210],tint:[255,255,255],lift:[255,250,230],liftA:.05,stars:0,lights:0,lantern:0,haze:[226,236,242]},
 {sky:[[60,110,192],[120,166,220],[214,214,214],[240,226,200]],sun:[.34,.5],sunCol:[255,246,214],glow:[255,226,170],tint:[255,244,224],lift:[255,220,170],liftA:.12,stars:0,lights:0,lantern:0,haze:[240,230,214]},
 {sky:[[84,74,140],[196,118,128],[252,180,116],[255,210,146]],sun:[.16,.04],sunCol:[255,226,160],glow:[255,160,90],tint:[255,196,170],lift:[255,170,110],liftA:.26,stars:0,lights:.3,lantern:.55,haze:[255,196,150]},
 {sky:[[28,34,84],[64,62,124],[150,104,140],[196,140,150]],sun:[.08,-.2],sunCol:[255,200,150],glow:[220,120,110],tint:[150,136,190],lift:[200,120,140],liftA:.12,stars:.5,lights:1,lantern:.85,haze:[120,110,160]},
 {sky:[[8,14,42],[20,30,74],[44,60,110],[64,80,128]],sun:[.3,.7],sunCol:[244,244,230],glow:[170,184,230],tint:[78,94,150],lift:[150,170,220],liftA:.06,stars:1,lights:1,lantern:1,haze:[70,86,130],moon:true},
 {sky:[[44,54,112],[110,110,170],[214,166,170],[250,206,178]],sun:[.95,-.06],sunCol:[255,226,190],glow:[255,180,150],tint:[176,170,206],lift:[255,190,160],liftA:.18,stars:.35,lights:.8,lantern:.9,haze:[200,170,190]}]);
const vgMixA=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
// The light at stage st (0..8): each stage holds for its first half, then blends into the next over the second half.
export function vgLight(st){st=vgClamp(st,0,7.999);const i=Math.floor(st),f=st-i,k=vgSs((f-.45)/.55),A=VG_LIGHT[i],B=VG_LIGHT[Math.min(7,i+1)];
 const m=(x,y)=>Array.isArray(x)?(Array.isArray(x[0])?x.map((r,j)=>vgMixA(r,y[j],k)):vgMixA(x,y,k)):x+(y-x)*k;
 return {sky:m(A.sky,B.sky),sun:m(A.sun,B.sun),sunCol:m(A.sunCol,B.sunCol),glow:m(A.glow,B.glow),tint:m(A.tint,B.tint),lift:m(A.lift,B.lift),liftA:m(A.liftA,B.liftA),stars:m(A.stars,B.stars),
  lights:m(A.lights,B.lights),lantern:m(A.lantern,B.lantern),haze:m(A.haze,B.haze),moon:(A.moon?1-k:0)+(B.moon?k:0),stage:i,k};}

// ── The season's event (at the afternoon or the evening) ────────────────────────────────────────────────────────────────────
// spring: a shower then the rainbow; summer: a distant storm lit from inside at dusk (slowly, no flash); autumn: dawn fog that the
// balloon climbs out of, and geese; winter: snow in the evening. Returns the strengths (0..1) at share p of the day.
export function vgWeather(season,p){const b=(a,b2,fade=.02)=>vgClamp(Math.min((p-a)/fade,(b2-p)/fade));
 return {rain:season===0?b(.4,.46):0,rainbow:season===0?b(.46,.57,.03):0,storm:season===1?b(.58,.72,.03):0,fog:season===2?b(-.1,.16,.05):0,
  geese:season===2?b(.3,.4,.01):0,snow:season===3?b(.62,.86,.04):0,swallows:season===0||season===1?b(.12,.3,.02):0};}

// ── Status for screen readers and the progress bar ──────────────────────────────────────────────────────────────────────────
export function vgStatus(game,s){const f=game?.viatge;if(!f)return '';const j=vgJourney(f.v),st=Math.floor(vgStage(vgDay(f,s)));
 if(f.phase==='landing')return 'El globus baixa a aterrar al prat.';if(f.phase==='landed')return 'Han aterrat. Els esperaven amb fanalets.';if(f.phase==='fade'||f.phase==='next')return 'Comença un nou viatge.';
 return `${j.R.name} ${['a la primavera','a l’estiu','a la tardor','a l’hivern'][j.season]}. ${VG_STAGE_NAMES[st]}. ${f.burn?'El cremador crema i el globus puja.':f.a>.6?'El globus vola entre els núvols.':'El globus baixa a poc a poc.'}`;}
export function vgProgress(game,s){const f=game?.viatge;if(!f)return '';const j=vgJourney(f.v),st=Math.min(7,Math.floor(vgStage(vgDay(f,s))));
 return `${j.R.name} · ${VG_SEASON_NAMES[j.season]} · ${VG_STAGE_NAMES[st].replace('L’','').replace(/^(El|La) /,'').toLowerCase()}`;}

// ── Music ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// An original score with the recorded instruments of the collection: the balloon's theme (a rising fourth and two steps) on the flute
// when a burn starts, the answer coming down on the clarinet when the flame goes out; the harp is the air, slow arpeggios that open
// with the height. One mode per stage (lydian at dawn and morning, major at noon, mixolydian in the afternoon and at sunset, dorian in
// the evening and at night, major again at daybreak), 72 beats a minute, and every phrase ends on a plucked or struck note.
export const VG_BEAT=60/72,VG_BAR=4*VG_BEAT;
const VG_MODES=['lydian','lydian','major','mixolydian','mixolydian','dorian','dorian','major'];
// The chords of each stage (scale degrees of the roots, one per bar, four bars).
const VG_PROG=[[0,4,1,0],[0,3,4,0],[0,5,3,4],[0,6,3,4],[0,5,1,4],[0,3,5,4],[0,5,3,0],[0,3,4,0]];
// Loudness (EBU R 128 on the offline render, tools/viatge-audio.mjs): the music sits with the stories of the collection.
export const VG_LOUD=2.8;
export const VG_THEME=Object.freeze([[0,1],[3,1],[4,1],[5,3]]);
export const VG_ANSWER=Object.freeze([[5,1],[4,1],[2,1],[0,3]]);
// The notes of bar n (times in seconds from the bar). o: {stage, a, burn, key, night, theme:'up'|'down'|null, duck}.
export function vgBar(n,o){const out=[],key=o.key,mode=VG_MODES[o.stage]||'major',deg=d=>vgNote(key,mode,d),prog=VG_PROG[o.stage]||VG_PROG[0],root=prog[n%4];
 const L=VG_LOUD*(o.duck??1)*(o.night?.55:1),B=VG_BEAT,put=(t,len,inst,ds,vel,x={})=>{const sh=escFit(ds.map(deg),inst);out.push({t,len,inst,midi:ds.map(d=>escInto(deg(d)+sh,inst)),vel:Math.min(1,vel*L),...x});};
 const st=o.stage,spread=1+Math.round(vgClamp(o.a)*2);
 // harp: the air; one note a beat low down, two a beat higher up, wider; at night a music box (glockenspiel, very soft)
 if(st===6){if(n%2===0){put(0,2.4,'glockRec',[root+7],.12,{pan:.2});put(B*2,2.2,'glockRec',[root+4],.1,{pan:.15});}put(B*3,1.6,'harpRec',[root],.13,{pan:-.2});}
 else{const per=o.a>.45?2:1;for(let i=0;i<4*per;i++){const d=[0,2,4,7,9,7,4,2][i%8]+(i>=4&&spread>1?7:0);put(i*B/per,1.6,'harpRec',[root+d],.15+.03*(i%per===0),{pan:-.25});}}
 // the bass of the bar, plucked
 if(st!==6)put(0,1.4,'celliPizzRec',[root-7],.2,{pan:.06});
 // the stage's colours
 if(st===1&&n%2===1)put(B*1.5,1.4,'fluteRec',[root+4,],.12,{pan:-.05});
 if(st===2){for(let i=0;i<4;i++)put(i*B+B/2,.4,'violinsPizzRec',[root+[4,2,4,7][i]],.12,{pan:.1});if(n%2===0)put(B,2.2,'clarinetRec',[root+2],.13,{pan:.05});}
 if(st===3){for(let i=0;i<2;i++)put(i*2*B+B,.4,'violinsPizzRec',[root+[4,7][i]],.11,{pan:.1});if(n%4===1)put(0,3,'hornRec',[root+4],.12,{pan:-.1});}
 if(st===4&&n%2===0)put(B,2.6,'oboeRec',[root+4],.12,{pan:.05});
 if(st===5){put(0,2,'glockRec',[root+7],.11,{pan:.2});if(n%2)put(B*2,2,'glockRec',[root+9],.09,{pan:.25});}
 if(st===7){put(0,2.6,'glockRec',[root+11],.1,{pan:.25});if(n%2===0)put(B*2,2.4,'fluteRec',[root+4],.11);}
 // the theme with a burn, the answer when it ends (ending on a plucked harp note)
 if(o.theme){const tune=o.theme==='up'?VG_THEME:VG_ANSWER,inst=o.theme==='up'?(o.night?'glockRec':'fluteRec'):(o.night?'harpRec':'clarinetRec');let p=0;
  for(const [d,len] of tune){put(p*B*.5,len*B*.5*.95,inst,[root+d+(o.theme==='up'?4:7)],o.theme==='up'?.24:.2,{pan:0});p+=len;}
  put(p*B*.5,2.2,'harpRec',[root+(o.theme==='up'?9:7)],.18,{pan:-.1});}
 return out;}
// The end of a journey: the whole theme, on harp and flute, ending on a plucked harp chord that fades by itself.
export function vgCoda(key){const deg=d=>vgNote(key,'major',d),out=[],B=VG_BEAT,put=(t,len,inst,ds,vel)=>{const sh=escFit(ds.map(deg),inst);out.push({t,len,inst,midi:ds.map(d=>escInto(deg(d)+sh,inst)),vel:Math.min(1,vel*VG_LOUD)});};
 let p=0;for(const [d,len] of VG_THEME){put(p*B,len*B*.95,'fluteRec',[d+4],.22);put(p*B,1.6,'harpRec',[d],.16);p+=len;}
 for(const [d,len] of VG_ANSWER){put(p*B,len*B*.95,'clarinetRec',[d+7],.18);put(p*B,1.6,'harpRec',[d+2],.15);p+=len;}
 put(p*B,3.2,'harpRec',[0,4,7,11],.24);put(p*B+.1,2.8,'glockRec',[7],.1);return out;}

// ── Sounds ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The burner (ignition, roar in a loop, the valve closing), the wind (leaves low, open air high), the ground of each route by the hour
// and the sounds of the landmarks; Bru's barks, yawn and howl. Generated with ElevenLabs (bank vgRec, CREDITS.md) or from the
// collection's recordings (natureRec, pintaRec, masiaRec). Levels: vgRec one-shots are made at −18 LUFS momentary like masiaRec.
export const VG_MARK_SOUND=Object.freeze({
 masia:['masiaRec','gallines'],ramat:['vgRec','ovelles'],poble:['pintaRec','campana'],viaducte:['vgRec','tren'],ermita:['pintaRec','ermita'],panta:['pintaRec','anec'],
 port:['vgRec','barca'],platja:['vgRec','canalla'],cala:['vgRec','vela'],pobleblanc:['pintaRec','gavines'],illot:['pintaRec','gavines2'],far:['vgRec','mussol'],
 refugi:['pintaRec','esquellots'],estany:['pintaRec','marmota'],tartera:['vgRec','isard'],pontpenjant:['pintaRec','corb'],collada:['pintaRec','vaca'],telecabina:['vgRec','telecabina'],
 barraca:['pintaRec','gallina'],canal:['vgRec','barca'],arrossars:['vgRec','flamencs'],llacuna:['pintaRec','anec'],dunes:['pintaRec','gavines'],gola:['vgRec','dofins'],
 moli:['pintaRec','moli'],cala2:['vgRec','dofins'],pobleenfilat:['pintaRec','cabra'],castell:['pintaRec','campana'],illadeserta:['pintaRec','gavines2'],farpetit:['vgRec','mussol']});
// The air of the ground by route and hour (natureRec loops), heard more the lower the balloon flies.
export function vgAirLayers(route,season,st,a){const low=Math.pow(vgClamp(1-a/.75),1.5),out=[];const add=(name,level)=>{if(level>.01)out.push({name,level});};
 const night=st>=5.6&&st<7.5,dawn=st<.9||st>=7.5,sea=route===1||route===4||route===3;
 if(night){add(route===3?'frogs':'crickets',.22*low);}
 else if(dawn)add(route===2?'alba':'dawn',.2*low);
 else{add(season===1&&st>1.6&&st<4.6?'ptCigales':route===2?'pouPrada':'meadow',.2*low);if(route===0&&st>1&&st<3)add('blackbird',.14*low);}
 if(sea)add('waves',.24*low);if(route===0||route===2)add(route===2?'brook':'riu',.12*low);
 return out;}
class VgSound{
 constructor(ctx,out){this.context=ctx;this.input=ctx.createGain();this.input.gain.value=1;this.input.connect(out);this.loops=new Map();this.active=new Set();}
 zone(bank,name){const z=sampleZone(bank,0,name);return z&&z.buffer?z:null;}
 one(bank,name,level=1,pan=0,when=0){const z=this.zone(bank,name);if(!z)return;const c=this.context,o=c.createBufferSource(),g=c.createGain(),p=c.createStereoPanner();o.buffer=z.buffer;g.gain.value=level;p.pan.value=pan;
  o.connect(g);g.connect(p);p.connect(this.input);o.start(c.currentTime+when,(z.offset||0)+z.shift);this.active.add(o);o.onended=()=>{this.active.delete(o);o.disconnect();g.disconnect();p.disconnect();};}
 // a loop that follows a level: started when first heard, faded out and stopped when no longer wanted
 loop(key,bank,name,level,tc=.25,filter=null){let L=this.loops.get(key);const c=this.context;
  if(!L){if(level<.002)return;const z=this.zone(bank,name);if(!z)return;const o=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();o.buffer=z.buffer;o.loop=true;
   const a=(z.loopStart??z.offset??0)+z.shift,e=(z.loopEnd??z.buffer.duration-z.shift)+z.shift;o.loopStart=a;o.loopEnd=Math.min(z.buffer.duration,e);f.type='lowpass';f.frequency.value=filter||20000;g.gain.value=0;
   o.connect(f);f.connect(g);g.connect(this.input);o.start(c.currentTime,a+Math.random()*Math.max(0,o.loopEnd-a));L={o,g,f,name};this.loops.set(key,L);}
  L.g.gain.setTargetAtTime(level,c.currentTime,tc);if(filter)L.f.frequency.setTargetAtTime(filter,c.currentTime,.2);
  if(level<.002&&L.g.gain.value<.003){try{L.o.stop();}catch{}L.o.disconnect();L.g.disconnect();L.f.disconnect();this.loops.delete(key);}}
 stop(){for(const o of this.active){try{o.stop();}catch{}}this.active.clear();for(const [k,L] of this.loops){try{L.o.stop();}catch{}L.o.disconnect();L.g.disconnect();L.f.disconnect();}this.loops.clear();}
}
let VG_BUS=null;
const vgBus=(ctx,out)=>{if(!ctx||!out)return null;if(!VG_BUS||VG_BUS.context!==ctx)VG_BUS=new VgSound(ctx,out);return VG_BUS;};
export function vgSilence(){VG_BUS?.stop();}
// Air levels (velocity-like, squared to gain). VG_AIR raises the natureRec loops to sit a few dB under the music, as in El vent del bosc.
export const VG_AIR=14,VG_FX=1;
// Each frame: the cues of the frame, the loops, and the music bar by bar (scheduled half a second ahead through «play»).
export function vgAudio(game,s,ctx,out,play){const f=game?.viatge;if(!f)return;const cues=f.cues.splice(0);if(!s.sound||ctx?.state!=='running')return;const bus=vgBus(ctx,out);if(!bus)return;
 const j=vgJourney(f.v),p=vgDay(f,s),st=vgStage(p),a=vgClamp(f.a),low=vgClamp(1-a/.8),now=ctx.currentTime;
 for(const cue of cues){
  if(cue==='encesa')bus.one('vgRec','encesa',.6*VG_FX,-.1);
  else if(cue==='apagada')bus.one('vgRec','apagada',.5*VG_FX,-.1);
  else if(cue==='lladruc')bus.one('vgRec','lladruc',.55*VG_FX,.1);
  else if(cue==='badall')bus.one('vgRec','badall',.5*VG_FX,.1);
  else if(cue==='udol')bus.one('vgRec','udol',.45*VG_FX,.1);
  else if(cue==='cistella')bus.one('vgRec','cistella',.7*VG_FX,0);
  else if(cue==='festa')bus.one('vgRec','festa',.6*VG_FX,.3,.4);
  else if(cue.startsWith('mark')){const id=j.R.marks[+cue.slice(4)],snd=VG_MARK_SOUND[id];if(snd)bus.one(snd[0],snd[1],(.25+.55*low)*VG_FX,.25);}
  else if(cue==='aterra'){f.music={...(f.music||{}),coda:now+VG_LAND_T*.55};}
  else if(cue==='alba'&&f.music)f.music.n=0;}
 // the geese of autumn, once, as they cross the sky
 if(vgWeather(j.season,p).geese>.5&&!f.events.geese){f.events.geese=1;bus.one('vgRec','oques',.45*VG_FX,-.3);}
 // the burner's roar while it burns, with the flame's flicker; the wind, low (leaves) and high (open air)
 bus.loop('burn','vgRec','cremador',f.burn?.45*VG_FX:0,f.burn?.05:.12);
 const wind=.12+.18*a;bus.loop('wind','natureRec','wind',VG_AIR*.04*low*(1+a),.4,600+2400*a);bus.loop('high','vgRec','ventalt',(.1+.45*Math.max(0,a-.35))*VG_FX*(f.phase==='landed'?0:1),.5);
 const keep=new Set();for(const L of vgAirLayers(j.route,j.season,st,a)){keep.add(L.name);bus.loop('air:'+L.name,'natureRec',L.name,VG_AIR*L.level*L.level*(f.dark>.05?.8:1),.8);}
 for(const k of [...bus.loops.keys()])if(k.startsWith('air:')&&!keep.has(k.slice(4)))bus.loop(k,'natureRec',k.slice(4),0,.8);void wind;
 // the music: one bar at a time, half a second ahead; a burn starts the theme on the next half bar, its end the answer
 const M=f.music||(f.music={at:now+.3,n:0,theme:null});
 if(f.burn&&!M.burnSeen){M.burnSeen=true;M.theme='up';}if(!f.burn&&M.burnSeen){M.burnSeen=false;M.theme='down';}
 if(M.coda&&now>=M.coda-.6&&!M.codaDone){M.codaDone=true;for(const e of vgCoda(j.R.key[0]))play(e,Math.max(0,M.coda+e.t-now),e.len);M.at=M.coda+12;}
 if(f.phase==='fade'||f.phase==='next'||f.phase==='landed')return;
 while(M.at<now+.5){const bar=vgBar(M.n,{stage:Math.min(7,Math.floor(st)),a,burn:f.burn,key:j.R.key[0],night:st>=6&&st<7.4,theme:M.theme,duck:f.burn?.5:1});M.theme=null;
  for(const e of bar)play(e,Math.max(0,M.at+e.t-now),e.len);M.at+=VG_BAR*(f.slow<.8?1.25:1);M.n++;}}
