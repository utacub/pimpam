// El taller de vehicles (EN07, 0.53): the first three-dimensional activity of the suite, built and drawn with three.js (bundled as the
// global PP3 in dist/vendor/three-taller.js and inlined by build_standalone.py). A toy vehicle is built piece by piece from the tray
// (body, wheels, accessory; with four steps, the colour too), each piece flies to the chassis and goes «clac», and the finished vehicle
// waits for a press (or goes alone), rolls down the ramp, tours the room with the gag of its accessory and parks in the garage. Here the
// model, the engine flow, the times, the sounds (from the banks of the suite), the geometry, the flat drawing without WebGL, the settings
// and the panel of information; the three.js picture itself is checked in a browser (tools/vehicles-frames.mjs, tools/vehicles-app.mjs).
// 0.56: the corners of the house (the room and the living room with its emergency vehicles), each with its own eighteen pieces, circuit,
// march and air; the corners turn every four vehicles from «Primer racó».
// 0.60: the finale of a corner: after the fourth vehicle parks, the vehicles made in the corner come out of the garage and parade across
// the front of the room (newest first) with the band once more; its own phase, times, route, music and flat drawing.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {VH_CORNERS,VH_LIGHTS,VH_BODIES,VH_WHEELS,VH_TOPS,VH_COLORS,VH_STAGES,VH_WORD,VH_NAME,VH_LIGHT_NAME,VH_BODY_COLOR,VH_PALETTE,VH_SNAP,VH_WAIT,VH_RIDE,VH_ROUNDS,VH_ROLL,VH_GAG,VH_CORNER_NAME,VH_PARADE,VH_PARADE_GAP,VH_PARADE_PATH,vhLightTitle,vhFirstCorner,vhRoundOf,vhSteps,vhCells,vhStageKinds,vhStageKind,vhFamily,vhOptions,vhPicks,vhTimes,vhTimeline,vhPhase,vhCanStart,vhSurprise,vhPathOf,vhFinale,vhParadeTime} from '../dist/vehicles.js';
import {VH_CLAC,vhStepScore,vhFinalScore,vhPattern,vhTaste,vhAmbience} from '../dist/vehicles-so.js';
import {VH_TRAY_MIN,VH_TRAY_MAX,vhGeom,vhSlots,vhLayout,vhBoard,vhResult,vhParadeList} from '../dist/vehicles-art.js';
import {SCAN_ACTIVITIES,createScanState,scanChoices,scanContent,chooseScan,finishScan} from '../dist/scan-catalog.js';
import {renderScanActivity} from '../dist/scan-art.js';
import {TL_BOARDS} from '../dist/tauler.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {defaults,validateProfile} from '../dist/input.js';
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
const names=bank=>new Set(SAMPLE_BANK[bank].zones.map(z=>z[9]));
const S=(o={})=>({...defaults,...o});
const C='habitacio',PIECES=[...VH_BODIES[C],...VH_WHEELS[C],...VH_TOPS[C]],SALA='sala',PATI='pati',PASSADIS='passadis',BANY='bany',PIECES_SALA=[...VH_BODIES[SALA],...VH_WHEELS[SALA],...VH_TOPS[SALA]];const piecesOf=k=>[...VH_BODIES[k],...VH_WHEELS[k],...VH_TOPS[k]];
const stateAt=(round,picks=[],s=S())=>{const st=createScanState('vehicles',s);st.round=round;st.stage=picks.length;st.picks=picks.map(value=>({id:value,value}));return st;};
// the mock of the tests of the decor: every call is counted and every coordinate must be finite
function ctx(){const calls=[],fills=[],gradient={addColorStop(){}};return new Proxy({calls,fills},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);if(k==='fillRect')fills.push(o.fillStyle);return k.startsWith('create')?gradient:k==='measureText'?{width:10}:undefined;};},set(o,k,v){o[k]=v;return true;}});}

test('EN07 is still El taller de vehicles, creative, recorded, in the folder of choosing and creating, heavy to load; the old drawing of it is gone and three.js travels inside the single file',()=>{
 const row=SCAN_ACTIVITIES.find(a=>a.id==='vehicles');assert.ok(row);assert.equal(row.code,'EN07');assert.equal(row.name,'El taller de vehicles');assert.equal(row.task,'creative');assert.equal(row.recorded,true);assert.match(row.desc,/tres dimensions/);
 assert.equal(SCAN_ACTIVITIES.length,10);assert.ok(TL_BOARDS.includes('vehicles'));
 const app=read('../dist/app.js');assert.match(app,/ids:\[[^\]]*'masia','vehicles'\]/);assert.match(app,/LOAD_HEAVY=\[[^\]]*'vehicles'/);assert.match(app,/APP_VERSION='0\.(5[4-9]|[6-9][0-9])/);
 for(const name of ['vhPressStart','vhRetime','vhSettings','vhAirUpdate','vhAirStop'])assert.match(app,new RegExp(`function ${name}\\(`),name);
 const art=read('../dist/scan-art.js');assert.doesNotMatch(art,/Svehicle|vehicle-body|vehicle-wheels|vehicle-top/);assert.match(art,/vhBoard\(c,w,h,state,game,s/);assert.match(art,/vhResult\(c,w,h,state,game,s/);
 const build=read('../build_standalone.py');assert.match(build,/'vehicles\.js','vehicles-so\.js','vehicles-3d\.js','vehicles-art\.js'/);assert.match(build,/three-taller\.js/);assert.match(build,/startswith\('\/\/ three\.js'\)/);
 assert.match(read('../dist/index.html'),/<script src="\.\/vendor\/three-taller\.js"><\/script><script type="module" src="\.\/app\.js">/);
 const vendor=read('../dist/vendor/three-taller.js');assert.match(vendor.slice(0,200),/^\/\/ three\.js r187 .*MIT License/);assert.ok(vendor.includes('globalThis.PP3'));assert.ok(!vendor.includes('</script'));assert.ok(vendor.length>400000&&vendor.length<900000);
 assert.match(read('../tools/vendor-three.mjs'),/THREE='0\.187\.0'/);
 // the drawing modules never share a top-level name with the rest of the suite (the build strips the imports and concatenates)
 const mods=['vehicles.js','vehicles-so.js','vehicles-3d.js','vehicles-art.js'];const own=new Set();for(const m of mods)for(const x of read('../dist/'+m).matchAll(/^(?:export )?(?:const|let|function|class) ([A-Za-z_$][\w$]*)/gm)){assert.ok(!own.has(x[1]),`${m}: ${x[1]} twice`);own.add(x[1]);}
 for(const n of own)assert.match(n,/^(vh|VH_)/,`${n}: every top-level name of the vehicles modules is prefixed`);});

test('the model: four corners (0.56, 0.57, 0.58) with four lights, six bodies, six wheel sets, six accessories each and six colours, one word each for the scanning and a long name for the panel',()=>{
 assert.deepEqual(VH_CORNERS,['habitacio','sala','pati','passadis','bany']);assert.deepEqual(Object.keys(VH_CORNER_NAME),VH_CORNERS);assert.deepEqual(VH_STAGES,['body','wheels','top','color']);assert.equal(VH_COLORS.length,6);
 for(const k of VH_CORNERS){assert.deepEqual(VH_LIGHTS[k],['mati','tarda','capvespre','nit']);assert.equal(VH_BODIES[k].length,6);assert.equal(VH_WHEELS[k].length,6);assert.equal(VH_TOPS[k].length,6);assert.equal(new Set(piecesOf(k)).size,18,`${k}: no id is shared between families`);
  assert.match(VH_CORNER_NAME[k],/^(L’|La |El )[a-zà-ú]+$/);for(const l of VH_LIGHTS[k])assert.equal(vhLightTitle(k,l),`${VH_CORNER_NAME[k]}, ${VH_LIGHT_NAME[l].toLowerCase()}`);
  for(const id of piecesOf(k)){assert.match(VH_WORD[id],/^[A-ZÀ-Ú][a-zà-ú·]+$/,id);assert.ok(VH_NAME[id].length>=VH_WORD[id].length,id);assert.match(VH_NAME[id],/^[A-ZÀ-Ú]/);}
  for(const b of VH_BODIES[k])assert.ok(VH_COLORS.includes(VH_BODY_COLOR[b])&&Number.isInteger(VH_PALETTE[VH_BODY_COLOR[b]]),b);assert.equal(new Set(VH_BODIES[k].map(b=>VH_BODY_COLOR[b])).size,6,`${k}: every body has its own colour`);
  for(const w of VH_WHEELS[k]){const R=VH_ROLL[w];assert.ok(R&&R.bounce>=0&&R.bounce<=1&&R.lean>=0&&R.lean<=1&&R.clack>=0&&R.wobble>=0,w);}
  for(const t of VH_TOPS[k]){const G=VH_GAG[t];assert.ok(G&&G.at>0&&G.at<=1&&typeof G.kind==='string',t);}}
 assert.equal(new Set(VH_BODIES.habitacio.concat(VH_BODIES.sala)).size,12,'the living room has its own six bodies');assert.deepEqual(VH_WHEELS.sala.filter(w=>VH_WHEELS.habitacio.includes(w)),['tacs','tapacubs']);assert.deepEqual(VH_TOPS.sala.filter(t=>VH_TOPS.habitacio.includes(t)),['escala','sirena']);
 assert.equal(new Set(VH_CORNERS.flatMap(k=>VH_BODIES[k])).size,30,'every corner has its own six bodies');assert.deepEqual(VH_WHEELS.bany.filter(w=>VH_WHEELS.habitacio.includes(w)),['amples']);assert.deepEqual(VH_WHEELS.bany.filter(w=>VH_WHEELS.sala.includes(w)),['balons']);assert.deepEqual(VH_TOPS.bany.filter(t=>VH_TOPS.habitacio.includes(t)),['bandera','globus']);assert.deepEqual(VH_WHEELS.passadis.filter(w=>VH_WHEELS.habitacio.includes(w)),['fusta','radis']);assert.deepEqual(VH_TOPS.passadis.filter(t=>VH_TOPS.habitacio.includes(t)||VH_TOPS.sala.includes(t)),['campana','bandera']);
 for(const id of VH_COLORS)assert.match(VH_WORD[id],/^[A-ZÀ-Ú][a-zà-ú·]+$/,id);for(const l of VH_LIGHTS[C])assert.match(VH_LIGHT_NAME[l],/^[A-ZÀ-Ú][a-zà-ú]+$/);
 // the rounds: the light turns with every vehicle, the corner turns every four vehicles from «Primer racó» and comes back round
 for(let r=0;r<40;r++){const R=vhRoundOf(r);assert.equal(R.corner,VH_CORNERS[Math.floor(r/4)%5]);assert.equal(R.light,VH_LIGHTS[R.corner][r%4]);assert.equal(R.li,r%4);assert.equal(R.visit,Math.floor(r/20));assert.equal(R.round,r);}
 for(let r=0;r<20;r++)assert.equal(vhRoundOf(r,S({vhCorner:'sala'})).corner,VH_CORNERS[(1+Math.floor(r/4))%5]);for(let r=0;r<20;r++)assert.equal(vhRoundOf(r,S({vhCorner:'pati'})).corner,VH_CORNERS[(2+Math.floor(r/4))%5]);for(let r=0;r<20;r++)assert.equal(vhRoundOf(r,S({vhCorner:'passadis'})).corner,VH_CORNERS[(3+Math.floor(r/4))%5]);for(let r=0;r<20;r++)assert.equal(vhRoundOf(r,S({vhCorner:'bany'})).corner,VH_CORNERS[(4+Math.floor(r/4))%5]);assert.equal(vhRoundOf(0,S({vhCorner:'pati'})).corner,'pati');assert.equal(vhRoundOf(4,S({vhCorner:'pati'})).corner,'passadis');assert.equal(vhRoundOf(0,S({vhCorner:'passadis'})).corner,'passadis');assert.equal(vhRoundOf(4,S({vhCorner:'passadis'})).corner,'bany');assert.equal(vhRoundOf(0,S({vhCorner:'bany'})).corner,'bany');assert.equal(vhRoundOf(4,S({vhCorner:'bany'})).corner,'habitacio');
 assert.equal(vhFirstCorner(S()),'habitacio');assert.equal(vhFirstCorner(S({vhCorner:'sala'})),'sala');assert.equal(vhFirstCorner({vhCorner:'cuina'}),'habitacio','an unknown corner falls back to the room');assert.equal(vhRoundOf(-3).round,0);
 assert.equal(VH_ROUNDS,4);
 // the circuits: each starts on the bench, drops to the floor and ends up on the plate of the garage; the room's never climbs on the way,
 // the living room's climbs the books once
 for(const k of VH_CORNERS){const path=vhPathOf(k);assert.ok(path.length>=12,k);assert.deepEqual(path[0],[0,0,0]);for(const p of path){assert.equal(p.length,3);assert.ok(p[1]>=-200&&p[1]<=0);}assert.deepEqual(path.at(-1),[-610,-192,420]);}
 {let y=0;const path=vhPathOf(C);for(const p of path.slice(0,-1)){assert.ok(p[1]<=y+1e-9,'the room\'s path only goes down');y=p[1];}}
 {const path=vhPathOf(PASSADIS);assert.ok(path.filter(p=>p[1]===-172).length>=2,'the hallway climbs the bridge');assert.ok(path.some(p=>p[1]===-200),'and runs on the floor');}
 {const path=vhPathOf(BANY);assert.ok(path.filter(p=>p[1]===-192).length>=3,'the bathroom climbs the duckboard');assert.ok(path.some(p=>p[1]===-200),'and runs on the tiles');}
 {const path=vhPathOf(PATI);assert.ok(path.filter(p=>p[1]===-190).length>=2,'the yard crosses the sand');assert.ok(path.slice(1,-1).every((p,i)=>p[1]<=path[i][1]+10+1e-9),'the yard circuit only goes down (and up the sand)');}
 {const path=vhPathOf(SALA),climbs=path.slice(1,-1).filter((p,i)=>p[1]>path[i][1]+1e-9);assert.ok(climbs.length>=1&&climbs.length<=3,'the living room climbs the books');assert.ok(path.some(p=>p[1]===-172));}
 assert.deepEqual(vhPathOf('cuina'),vhPathOf(C),'an unknown corner takes the room\'s circuit');});

test('the steps: two, three or four pieces by the setting; the tray offers as many as «Peces a la safata» (four by default, never more than the family has), always the same for the same round, and every piece comes round',()=>{
 assert.equal(vhCells(S()),4);assert.equal(vhCells(S({vhCells:'2'})),2);assert.equal(vhCells(S({vhCells:'3'})),3);assert.equal(vhCells(S({vhCells:'4',scanOptions:2})),4,'«Opcions de contingut» does not touch this tray');
 assert.deepEqual(vhStageKinds(S({vhSteps:'2'})),['body','wheels']);assert.deepEqual(vhStageKinds(S()),['body','wheels','top']);assert.deepEqual(vhStageKinds(S({vhSteps:'4'})),['body','wheels','top','color']);
 assert.equal(vhSteps(S()),3);assert.equal(vhSteps(S({vhSteps:'2'})),2);assert.equal(vhSteps(S({vhSteps:'4'})),4);
 assert.deepEqual(vhFamily('body',C),VH_BODIES[C]);assert.deepEqual(vhFamily('wheels',C),VH_WHEELS[C]);assert.deepEqual(vhFamily('top',C),VH_TOPS[C]);assert.deepEqual(vhFamily('color',C),VH_COLORS);
 const offered={};for(let r=0;r<40;r++)for(const steps of ['2','3','4']){const kinds=vhStageKinds(S({vhSteps:steps})),corner=vhRoundOf(r).corner;for(let stage=0;stage<kinds.length;stage++){
  const picks=kinds.slice(0,stage).map(k=>vhFamily(k,corner)[0]);for(const n of [2,3,4]){const s=S({vhSteps:steps,vhCells:String(n)}),st=stateAt(r,picks,s);assert.equal(vhStageKind(st,s),kinds[stage]);
   const fam=vhFamily(kinds[stage],corner),opts=vhOptions(st,s);assert.equal(opts.length,Math.min(n,fam.length),`round ${r} stage ${stage} n ${n}`);assert.equal(new Set(opts).size,opts.length);for(const id of opts)assert.ok(fam.includes(id));
   assert.deepEqual(opts,vhOptions(stateAt(r,picks,s),s),'the same round offers the same tray');
   if(n===4&&steps==='4')for(const id of opts)offered[id]=(offered[id]||0)+1;}}}
 for(const id of [...PIECES,...PIECES_SALA,...piecesOf(PATI),...piecesOf(PASSADIS),...piecesOf(BANY)])assert.ok(offered[id]>=4,`${id} is offered at least four times in the eight rounds of its corner`);assert.ok(offered.corall>=20);
 assert.deepEqual(vhFamily('body',SALA),VH_BODIES[SALA]);assert.deepEqual(vhFamily('top',SALA),VH_TOPS[SALA]);{const s=S({vhCorner:'sala'});for(const id of vhOptions(stateAt(0,[],s),s))assert.ok(VH_BODIES[SALA].includes(id),'with the living room first, its bodies come first');for(const id of vhOptions(stateAt(4,[],s),s))assert.ok(VH_BODIES[PATI].includes(id),'then the yard');for(const id of vhOptions(stateAt(8,[],s),s))assert.ok(VH_BODIES[PASSADIS].includes(id),'then the hallway');for(const id of vhOptions(stateAt(12,[],s),s))assert.ok(VH_BODIES[BANY].includes(id),'then the bathroom');for(const id of vhOptions(stateAt(16,[],s),s))assert.ok(VH_BODIES[C].includes(id),'then the room');}
 // the picks of a vehicle: what is on the chassis and the pending piece; the colour of the body when none was chosen
 assert.deepEqual(vhPicks(stateAt(0,['autobus']),S(),'fusta'),{body:'autobus',wheels:'fusta',top:null,color:null});
 assert.deepEqual(vhPicks(stateAt(0,['curses','primes','bandera']),S({vhSteps:'4'}),'groc'),{body:'curses',wheels:'primes',top:'bandera',color:'groc'});
 assert.deepEqual(vhPicks(stateAt(0),S(),null),{body:null,wheels:null,top:null,color:null});});

test('the engine: every piece is a good piece, the snap takes its time, the last one brings the whole ride, and the round moves on with the light',()=>{
 for(const steps of ['2','3','4']){const s=S({vhSteps:steps}),st=createScanState('vehicles',s),kinds=vhStageKinds(s),T=vhTimes(s);
  for(let i=0;i<kinds.length;i++){const content=scanContent(st,s);assert.equal(content.length,4);for(const c of content){assert.equal(c.kind,'vehicles');assert.equal(c.value,c.id);assert.equal(c.label,VH_WORD[c.id]);assert.ok(vhFamily(kinds[i],C).includes(c.id));}
   const r=chooseScan(st,s,content.length-1);assert.ok(r.accepted&&st.pending.correct,`${steps} ${i}`);const final=i===kinds.length-1;assert.equal(!!st.pending.final,final);assert.equal(r.duration,final?T.final:T.step);
   finishScan(st,s);}
  assert.equal(st.round,1);assert.equal(st.stage,0);assert.equal(st.picks.length,0);assert.equal(vhRoundOf(st.round).light,'tarda');}
 // the choices before arming: the start command only; once armed, the pieces
 const s=S({scanStart:'press'}),st=createScanState('vehicles',s);if(!st.armed){const ch=scanChoices(st,s);assert.equal(ch.length,1);assert.ok(ch[0].action);}
 // «Sorpresa»: the activity picks for the pupil; «Alumne» (the default) never
 assert.equal(vhSurprise(S()),false);assert.equal(vhSurprise(S({vhWho:'sorpresa'})),true);});

test('the times: the snap, the wait for the press (or none), the ride by its length and the garage; the timeline of a press and the phases in order',()=>{
 assert.equal(VH_SNAP,2.4);assert.equal(VH_WAIT,8);assert.deepEqual(VH_RIDE,{curt:8,mitja:14,llarg:20});
 assert.deepEqual(vhTimes(S()),{wrong:1,step:VH_SNAP,final:VH_SNAP+8+14+2.8,wait:8,ride:14,park:2.8});
 assert.deepEqual(vhTimes(S({vhRide:'curt',vhGo:'auto'})),{wrong:1,step:VH_SNAP,final:14,wait:.8,ride:8,park:2.8});
 assert.equal(vhTimes(S({vhRide:'llarg'})).ride,20);assert.equal(vhTimes(S({vhGarage:false})).park,1.2,'without the garage the vehicle just drives out of the picture');assert.ok(vhTimeline(S({vhGarage:false}),null).end<vhTimeline(S(),null).end);
 const alone=vhTimeline(S(),null);assert.equal(alone.snap,VH_SNAP);assert.equal(alone.start,VH_SNAP+8);assert.equal(alone.rideEnd,alone.start+14);assert.ok(Math.abs(alone.end-(alone.rideEnd+2.8))<1e-9);assert.equal(alone.pressed,false);assert.equal(alone.end,vhTimes(S()).final);
 const pressed=vhTimeline(S(),2.6);assert.ok(pressed.pressed);assert.ok(pressed.start>2.6&&pressed.start<3.3,'the press starts the engine within a moment');assert.equal(pressed.rideEnd,pressed.start+14);
 const auto=vhTimeline(S({vhGo:'auto'}),null);assert.ok(auto.start<VH_SNAP+1&&!auto.pressed);
 const early=vhTimeline(S(),1);assert.ok(early.start>=VH_SNAP,'a press during the snap starts after the snap');
 // the phases: snap, wait, ride, park, each with its u from 0 to 1, in order and without holes
 for(const TL of [alone,pressed,auto]){let last='snap',lastU=-1;const order=['snap','wait','ride','park'];for(let t=0;t<=TL.end+.5;t+=.05){const P=vhPhase(TL,t);assert.ok(order.includes(P.phase));assert.ok(P.u>=0&&P.u<=1,`${P.phase} ${P.u}`);
   if(P.phase!==last){assert.ok(order.indexOf(P.phase)>order.indexOf(last),`${last} then ${P.phase}`);last=P.phase;lastU=-1;}assert.ok(P.u>=lastU-1e-9);lastU=P.u;}
  assert.equal(vhPhase(TL,TL.end+2).phase,'park');assert.equal(vhPhase(TL,TL.end+2).u,1);}
 // the press that starts the vehicle: only while the last piece waits, once, and not before the snap
 const st=createScanState('vehicles',S());const waiting={...st,status:'effect',pending:{final:true}};
 assert.equal(vhCanStart(st,S(),null,null),false);assert.equal(vhCanStart(waiting,S(),2.5,null),true);assert.equal(vhCanStart(waiting,S(),1,null),false);assert.equal(vhCanStart(waiting,S(),2.5,2.5),false);
 assert.equal(vhCanStart({...st,status:'effect',pending:{final:false}},S(),2.5,null),false);assert.equal(vhCanStart(waiting,S(),VH_SNAP+8+1,null),false,'once rolling, a press does nothing');});

test('the sound, from the banks of the suite: wood for the «clac», a bar of the band at each piece, and for the last one the wait, the start, the ride with its wheels and its gag, and the garage, all inside the effect',()=>{
 const bank=e=>{const b=SAMPLE_BANK[e.inst];assert.ok(b,`bank ${e.inst}`);if(!b.pitched)assert.ok(e.variant&&names(e.inst).has(e.variant),`${e.inst}/${e.variant}`);assert.ok(e.t>=0&&e.len>0&&e.vel>0&&e.vel<=1,`${e.inst} ${e.t}`);};
 for(const e of VH_CLAC){assert.ok(['woodblockRec','tamborRec'].includes(e.inst)&&names(e.inst).has(e.variant),`${e.inst}/${e.variant}`);assert.ok(e.vel>0&&e.vel<=1&&e.dt>=0&&e.dt<.1);}
 for(let k=1;k<=4;k++)for(const round of [0,1,5]){const sc=vhStepScore(C,k,round);assert.ok(sc.length>=4,`step ${k}`);for(const e of sc){bank(e);assert.ok(e.t<VH_SNAP-.05,`step ${k}: ${e.inst} at ${e.t} starts inside the snap`);}
  assert.ok(sc.some(e=>e.inst==='woodblockRec'&&Math.abs(e.t-VH_SNAP*.62)<.02),'the clac when the piece lands');
  const pat=vhPattern(sc,VH_SNAP);assert.equal(pat.length,sc.length);assert.ok(pat.every(e=>e.at>=0&&e.at<1&&e.length>0&&e.inst&&e.vel>0));}
 // the band grows a voice with every piece
 const voices=k=>new Set(vhStepScore(C,k,0).filter(e=>!['woodblockRec','tamborRec'].includes(e.inst)).map(e=>e.inst)).size;assert.ok(voices(3)>=voices(1),'more voices with the third piece than with the first');
 const WHEEL={tacs:{inst:'tamborRec',variant:'baix',min:6},fusta:{inst:'woodblockRec',variant:'claves',min:12},primes:{inst:'masiaRec',variant:'whoosh',min:1},amples:{inst:'toonRec',variant:'boing',min:5},radis:{inst:'woodblockRec',variant:'claves',min:18},tapacubs:{inst:'masiaRec',variant:'rafega',min:1}},GAG={baca:{inst:'toonRec',variant:'doorOpen'},remolc:{inst:'toonRec',variant:'knock'},bandera:{inst:'pintaRec',variant:'campana'},sirena:{inst:'dsClarinet'},escala:{inst:'toonRec',variant:'stretch'},globus:{inst:'masiaRec',variant:'telainfla'}};
 for(const body of VH_BODIES[C])for(const wheels of VH_WHEELS[C])for(const top of VH_TOPS[C])for(const [s,go] of [[S(),null],[S(),2.6],[S({vhGo:'auto',vhRide:'curt'}),null],[S({vhRide:'llarg'}),4]]){
  const picks={body,wheels,top,color:VH_BODY_COLOR[body]},TL=vhTimeline(s,go),sc=vhFinalScore(C,picks,s,go,0);assert.ok(sc.length>=60,`${body} ${wheels} ${top}: ${sc.length} events`);
  for(let i=0;i<sc.length;i++){const e=sc[i];bank(e);assert.ok(e.t<TL.end-.05,`${e.inst} at ${e.t} of ${TL.end}`);if(i)assert.ok(e.t>=sc[i-1].t-1e-9,'in order');}
  const W=WHEEL[wheels];assert.ok(sc.filter(e=>e.inst===W.inst&&e.variant===W.variant&&e.t>=TL.start&&e.t<=TL.rideEnd).length>=W.min,`${wheels}: its sound on the floor`);
  const G=GAG[top];assert.ok(sc.some(e=>e.inst===G.inst&&(!G.variant||e.variant===G.variant)&&e.t>=TL.start),`${top}: its gag sounds`);
  assert.equal(sc.filter(e=>e.inst==='woodblockRec'&&e.variant==='claves'&&e.t>TL.start-.5&&e.t<TL.start).length,2,'two claves start the engine');
  assert.ok(sc.some(e=>e.inst==='pintaRec'&&e.variant==='campana'&&e.t>TL.rideEnd),'the bell of the garage');
  const band=sc.filter(e=>['dsBaix','dsPiano','dsClarinet'].includes(e.inst)&&e.t>=TL.start&&e.t<TL.rideEnd);assert.ok(band.length>=30,'the whole band rides along');
  if(TL.start-VH_SNAP>3)assert.ok(sc.some(e=>e.inst==='dsPiano'&&e.t>VH_SNAP+2.6&&e.t<TL.start-.3),'a soft vamp while the vehicle waits');
  const pat=vhPattern(sc,TL.end);assert.ok(pat.every(e=>e.at>=0&&e.at<1&&e.length>0));}
 // the living room (0.56): a brass march (tuba, horn, trumpet and a glockenspiel bell) without swing, its wheels and its gags
 const WHEEL_SALA={bessones:{inst:'tamborRec',variant:'baix',min:6},erugues:{inst:'masiaRec',variant:'terracruix',min:5},balons:{inst:'toonRec',variant:'jelly',min:4},ferro:{inst:'masiaRec',variant:'plat',min:8},tacs:WHEEL.tacs,tapacubs:WHEEL.tapacubs},GAG_SALA={brac:{inst:'toonRec',variant:'yank'},cano:{inst:'toonRec',variant:'squirt'},campana:{inst:'pintaRec',variant:'campana'},manega:{inst:'toonRec',variant:'slideDown'},escala:GAG.escala,sirena:{inst:'dsTrompeta'}};
 for(const body of VH_BODIES[SALA])for(const wheels of VH_WHEELS[SALA])for(const top of VH_TOPS[SALA])for(const [s,go] of [[S(),null],[S({vhGo:'auto',vhRide:'curt'}),null]]){
  const picks={body,wheels,top,color:VH_BODY_COLOR[body]},TL=vhTimeline(s,go),sc=vhFinalScore(SALA,picks,s,go,4);assert.ok(sc.length>=60,`${body} ${wheels} ${top}: ${sc.length} events`);
  for(let i=0;i<sc.length;i++){const e=sc[i];bank(e);assert.ok(e.t<TL.end-.05);if(i)assert.ok(e.t>=sc[i-1].t-1e-9,'in order');}
  const W=WHEEL_SALA[wheels];assert.ok(sc.filter(e=>e.inst===W.inst&&e.variant===W.variant&&e.t>=TL.start&&e.t<=TL.rideEnd).length>=W.min,`${wheels}: its sound on the tiles`);
  const G=GAG_SALA[top];assert.ok(sc.some(e=>e.inst===G.inst&&(!G.variant||e.variant===G.variant)&&e.t>=TL.start),`${top}: its gag sounds`);
  const band=sc.filter(e=>['dsTuba','dsTrompa','dsTrompeta'].includes(e.inst)&&e.t>=TL.start&&e.t<TL.rideEnd);assert.ok(band.length>=30,'the brass rides along');assert.ok(sc.some(e=>e.inst==='dsGlock'&&e.t>TL.rideEnd),'the bell of the cadence');
  assert.ok(!sc.some(e=>['dsBaix','dsPiano','dsClarinet'].includes(e.inst)),'the room\'s band stays in the room');
  for(const e of sc.filter(e=>e.inst==='dsTuba'&&e.t>=TL.start&&e.t<TL.rideEnd)){const beat=60/116,q=((e.t-TL.start)/beat)%2;assert.ok(q<.02||q>1.98,`the tuba on one and three (${q})`);}}
 for(let k=1;k<=3;k++){const sc=vhStepScore(SALA,k,4);assert.ok(sc.length>=4);for(const e of sc){bank(e);assert.ok(e.t<VH_SNAP-.05);}}
 for(const kind of VH_STAGES)for(const id of vhFamily(kind,SALA)){const t=vhTaste(kind,id,SALA);assert.ok(t.length>=1&&t.length<=4,`${kind} ${id}`);for(const n of t){bank(n);assert.ok(n.t+n.len<=1.6);}if(kind==='body')assert.equal(t[0].inst,'dsTrompa','the horn tastes the bodies of the living room');}
 assert.equal(vhTaste('top','sirena',SALA)[0].inst,'dsTrompeta');assert.equal(vhTaste('top','sirena')[0].inst,'dsClarinet');
 // the yard (0.57): a work song in D dorian (claves, plucked cello, bassoon, marimba) without swing, its wheels and its gags
 const WHEEL_PATI={corrons:{inst:'tamborRec',variant:'baix',min:5},grans:{inst:'tamborRec',variant:'mig',min:6},massisses:{inst:'woodblockRec',variant:'claves',min:12},gegants:{inst:'toonRec',variant:'boing',min:5},tacs:WHEEL.tacs,erugues:WHEEL_SALA.erugues},GAG_PATI={pala:{inst:'masiaRec',variant:'gratar'},caixa:{inst:'toonRec',variant:'slideUp'},tambor:{inst:'toonRec',variant:'blub'},cons:{inst:'toonRec',variant:'knock',n:3},remolc:GAG.remolc,sirena:{inst:'dsMarimba'}};
 for(const body of VH_BODIES[PATI])for(const wheels of VH_WHEELS[PATI])for(const top of VH_TOPS[PATI])for(const [s,go] of [[S(),null],[S({vhGo:'auto',vhRide:'curt'}),null]]){
  const picks={body,wheels,top,color:VH_BODY_COLOR[body]},TL=vhTimeline(s,go),sc=vhFinalScore(PATI,picks,s,go,8);assert.ok(sc.length>=60,`${body} ${wheels} ${top}: ${sc.length} events`);
  for(let i=0;i<sc.length;i++){const e=sc[i];bank(e);assert.ok(e.t<TL.end-.05);if(i)assert.ok(e.t>=sc[i-1].t-1e-9,'in order');}
  const W=WHEEL_PATI[wheels];assert.ok(sc.filter(e=>e.inst===W.inst&&e.variant===W.variant&&e.t>=TL.start&&e.t<=TL.rideEnd).length>=W.min,`${wheels}: its sound on the terracotta`);
  const G=GAG_PATI[top],gag=sc.filter(e=>e.inst===G.inst&&(!G.variant||e.variant===G.variant)&&e.t>=TL.start);assert.ok(gag.length>=(G.n||1),`${top}: its gag sounds`);
  if(top==='cons'){const knocks=gag.filter(e=>e.t<TL.rideEnd).map(e=>(e.t-TL.start)/TL.ride);assert.ok(knocks.length>=3&&knocks[0]>.25&&knocks.at(-1)<.75,`the cones fall along the way (${knocks.map(k=>k.toFixed(2))})`);}
  const band=sc.filter(e=>['dsCello','dsFagot','dsMarimba'].includes(e.inst)&&e.t>=TL.start&&e.t<TL.rideEnd);assert.ok(band.length>=26,'the work song rides along (sparser than the march: a hammer song at 100)');assert.ok(sc.filter(e=>e.inst==='woodblockRec'&&e.t>=TL.start&&e.t<TL.rideEnd).length>=10,'the claves hammer');
  assert.ok(!sc.some(e=>['dsBaix','dsPiano','dsClarinet','dsTuba','dsTrompa','dsTrompeta'].includes(e.inst)),'the other bands stay in their rooms');
  for(const e of sc.filter(e=>e.inst==='dsCello'&&e.t>=TL.start&&e.t<TL.rideEnd)){const beat=60/100,q=((e.t-TL.start)/beat)%4;assert.ok(Math.abs(q)<.02||Math.abs(q-2)<.02||Math.abs(q-3.5)<.02||q>3.98,`the cello on one, three and the and of four (${q})`);}}
 for(let k=1;k<=3;k++){const sc=vhStepScore(PATI,k,8);assert.ok(sc.length>=4);for(const e of sc){bank(e);assert.ok(e.t<VH_SNAP-.05);}}
 for(const kind of VH_STAGES)for(const id of vhFamily(kind,PATI)){const t=vhTaste(kind,id,PATI);assert.ok(t.length>=1&&t.length<=4,`${kind} ${id}`);for(const n of t){bank(n);assert.ok(n.t+n.len<=1.6);}if(kind==='body')assert.equal(t[0].inst,'dsMarimba','the marimba tastes the bodies of the yard');}
 assert.equal(vhTaste('top','sirena',PATI)[0].inst,'dsMarimba');assert.equal(vhTaste('wheels','corrons',PATI)[0].variant,'baix');assert.equal(vhTaste('top','cons',PATI)[0].variant,'knock');
 // the hallway (0.58): a train song in G major at 126 (walking bass, plucked violin, harp, triangle) without swing, its wheels and its gags
 const WHEEL_PASSADIS={pestanya:{inst:'woodblockRec',variant:'claves',min:12},bieles:{inst:'tamborRec',variant:'vora',min:10},vagoneta:{inst:'masiaRec',variant:'gratar',min:3},faldons:{inst:'tamborRec',variant:'sonall',min:5},fusta:WHEEL.fusta,radis:WHEEL.radis},GAG_PASSADIS={xemeneia:{inst:'toonRec',variant:'poof',n:4},xiulet:{inst:'dsFlauta',n:2},fanal:{inst:'toonRec',variant:'clink'},troncs:{inst:'masiaRec',variant:'branca',n:3},campana:{inst:'pintaRec',variant:'campana'},bandera:GAG.bandera};
 for(const body of VH_BODIES[PASSADIS])for(const wheels of VH_WHEELS[PASSADIS])for(const top of VH_TOPS[PASSADIS])for(const [s,go] of [[S(),null],[S({vhGo:'auto',vhRide:'curt'}),null]]){
  const picks={body,wheels,top,color:VH_BODY_COLOR[body]},TL=vhTimeline(s,go),sc=vhFinalScore(PASSADIS,picks,s,go,12);assert.ok(sc.length>=60,`${body} ${wheels} ${top}: ${sc.length} events`);
  for(let i=0;i<sc.length;i++){const e=sc[i];bank(e);assert.ok(e.t<TL.end-.05);if(i)assert.ok(e.t>=sc[i-1].t-1e-9,'in order');}
  const W=WHEEL_PASSADIS[wheels];assert.ok(sc.filter(e=>e.inst===W.inst&&e.variant===W.variant&&e.t>=TL.start&&e.t<=TL.rideEnd).length>=W.min,`${wheels}: its sound on the track`);
  const G=GAG_PASSADIS[top],gag=sc.filter(e=>e.inst===G.inst&&(!G.variant||e.variant===G.variant)&&e.t>=TL.start);assert.ok(gag.length>=(G.n||1),`${top}: its gag sounds`);
  if(top==='xiulet'){const u=gag.map(e=>(e.t-TL.start)/TL.ride);assert.ok(u[0]>.45&&u.at(-1)<.6,`the whistle blows at the middle of the way (${u.map(k=>k.toFixed(2))})`);}
  if(top==='troncs')assert.ok(gag.every(e=>e.t>=TL.rideEnd),'the logs roll at the garage');
  const band=sc.filter(e=>['dsBaix','dsVioli','dsArpa'].includes(e.inst)&&e.t>=TL.start&&e.t<TL.rideEnd);assert.ok(band.length>=40,`the train song rides along (${band.length})`);assert.ok(sc.some(e=>e.inst==='dsTriangle'),'the triangle rings');
  assert.ok(!sc.some(e=>['dsCello','dsFagot','dsMarimba','dsPiano','dsClarinet','dsTuba','dsTrompa','dsTrompeta'].includes(e.inst)),'the other bands stay in their rooms');
  for(const e of sc.filter(e=>e.inst==='dsBaix'&&e.t>=TL.start&&e.t<TL.rideEnd)){const beat=60/126,q=((e.t-TL.start)/beat)%1;assert.ok(q<.02||q>.98,`the bass walks on the beats (${q})`);}}
 for(let k=1;k<=3;k++){const sc=vhStepScore(PASSADIS,k,12);assert.ok(sc.length>=4);for(const e of sc){bank(e);assert.ok(e.t<VH_SNAP-.05);}}
 for(const kind of VH_STAGES)for(const id of vhFamily(kind,PASSADIS)){const t=vhTaste(kind,id,PASSADIS);assert.ok(t.length>=1&&t.length<=4,`${kind} ${id}`);for(const n of t){bank(n);assert.ok(n.t+n.len<=1.6);}if(kind==='body')assert.equal(t[0].inst,'dsArpa','the harp tastes the bodies of the hallway');}
 assert.equal(vhTaste('wheels','pestanya',PASSADIS)[0].variant,'claves');assert.equal(vhTaste('top','xemeneia',PASSADIS)[0].variant,'poof');assert.equal(vhTaste('wheels','faldons',PASSADIS)[0].variant,'sonall');
 // the taste of a piece in focus: a short sound of its own, from the banks
 for(const kind of VH_STAGES)for(const id of vhFamily(kind,C)){const t=vhTaste(kind,id);assert.ok(t.length>=1&&t.length<=4,`${kind} ${id}`);for(const n of t){bank(n);assert.ok(n.t+n.len<=1.6);}}
 // the air of the room by its light: the birds or the crickets through the window, quiet, from the nature loops
 const nat=names('natureRec');for(const l of VH_LIGHTS[C]){const air=vhAmbience(C,l);assert.ok(air.length>=1&&air.length<=2,l);for(const x of air){assert.ok(nat.has(x.name),`${l} ${x.name}`);assert.ok(x.level>0&&x.level<=.3&&x.lowpass>=700);}}
 assert.notEqual(vhAmbience(C,'mati')[0].name,vhAmbience(C,'nit')[0].name);
 for(const l of VH_LIGHTS[SALA]){const air=vhAmbience(SALA,l);assert.ok(air.length>=1&&air.length<=2,l);for(const x of air){assert.ok(nat.has(x.name),`${l} ${x.name}`);assert.ok(x.level>0&&x.level<=.3&&x.lowpass>=700);}}
 assert.equal(vhAmbience(SALA,'tarda')[0].name,'ptColoms','pigeons in the street in the afternoon');assert.equal(vhAmbience(SALA,'nit')[0].name,'nit');
 for(const l of VH_LIGHTS[PATI]){const air=vhAmbience(PATI,l);assert.ok(air.length>=1&&air.length<=2,l);for(const x of air){assert.ok(nat.has(x.name),`${l} ${x.name}`);assert.ok(x.level>0&&x.level<=.3&&x.lowpass>=700);}}
 assert.equal(vhAmbience(PATI,'tarda')[0].name,'ptCigales','cicadas in the yard in the afternoon');assert.equal(vhAmbience(PATI,'capvespre')[0].name,'crickets');assert.equal(vhAmbience(PATI,'nit')[0].name,'nit');
 for(const l of VH_LIGHTS[PASSADIS]){const air=vhAmbience(PASSADIS,l);assert.ok(air.length>=1&&air.length<=2,l);for(const x of air){assert.ok(nat.has(x.name),`${l} ${x.name}`);assert.ok(x.level>0&&x.level<=.3&&x.lowpass>=700);}}
 assert.equal(vhAmbience(PASSADIS,'mati')[0].name,'dawn','dawn through the hallway window');assert.equal(vhAmbience(PASSADIS,'tarda')[0].name,'wind');assert.equal(vhAmbience(PASSADIS,'capvespre')[0].name,'frogs');assert.equal(vhAmbience(PASSADIS,'nit')[0].name,'nit');
 // the bathroom (0.59): the barcarolle rides along, the wheels swish, splash, bounce and plop, the gags sound where they happen
 const WHEEL_BANY={flotadors:{inst:'masiaRec',variant:'whoosh',min:3},pales:{inst:'masiaRec',variant:'esquitxpetit',min:5},salvavides:{inst:'toonRec',variant:'boing',min:5},boies:{inst:'toonRec',variant:'plop',min:5},amples:WHEEL.amples,balons:WHEEL_SALA.balons},GAG_BANY={helix:{inst:'masiaRec',variant:'rafega'},periscopi:{inst:'toonRec',variant:'slideUp'},ancora:{inst:'toonRec',variant:'yank'},bombolles:{inst:'toonRec',variant:'blub',n:4},bandera:GAG.bandera,globus:GAG.globus};
 for(const body of VH_BODIES[BANY])for(const wheels of VH_WHEELS[BANY])for(const top of VH_TOPS[BANY])for(const [s,go] of [[S(),null],[S({vhGo:'auto',vhRide:'curt'}),null]]){
  const picks={body,wheels,top,color:VH_BODY_COLOR[body]},TL=vhTimeline(s,go),sc=vhFinalScore(BANY,picks,s,go,16);assert.ok(sc.length>=60,`${body} ${wheels} ${top}: ${sc.length} events`);
  for(let i=0;i<sc.length;i++){const e=sc[i];bank(e);assert.ok(e.t<TL.end-.05);if(i)assert.ok(e.t>=sc[i-1].t-1e-9,'in order');}
  const W=WHEEL_BANY[wheels];assert.ok(sc.filter(e=>e.inst===W.inst&&e.variant===W.variant&&e.t>=TL.start&&e.t<=TL.rideEnd).length>=W.min,`${wheels}: its sound on the way`);
  const G=GAG_BANY[top],gag=sc.filter(e=>e.inst===G.inst&&(!G.variant||e.variant===G.variant)&&e.t>=TL.start);assert.ok(gag.length>=(G.n||1),`${top}: its gag sounds`);
  if(top==='periscopi'){const u=gag.map(e=>(e.t-TL.start)/TL.ride);assert.ok(u[0]>.38&&u[0]<.42,`the periscope rises half way (${u[0].toFixed(2)})`);}
  if(top==='ancora')assert.ok(gag.every(e=>e.t>=TL.rideEnd),'the anchor drops at the garage');
  const band=sc.filter(e=>['dsMarimba','dsArpa','dsGlock'].includes(e.inst)&&e.t>=TL.start&&e.t<TL.rideEnd);assert.ok(band.length>=40,`the barcarolle rides along (${band.length})`);assert.ok(sc.some(e=>e.inst==='dsFlauta'),'the flute sings');
  assert.ok(!sc.some(e=>['dsCello','dsFagot','dsBaix','dsVioli','dsPiano','dsClarinet','dsTuba','dsTrompa','dsTrompeta','dsTriangle'].includes(e.inst)),'the other bands stay in their rooms');
  for(const e of sc.filter(e=>e.inst==='dsMarimba'&&e.t>=TL.start&&e.t<TL.rideEnd)){const beat=60/252,q=((e.t-TL.start)/beat)%6;assert.ok(q<.02||Math.abs(q-3)<.02||q>5.98,`the marimba on one and four (${q})`);}}
 for(let k=1;k<=3;k++){const sc=vhStepScore(BANY,k,16);assert.ok(sc.length>=4);for(const e of sc){bank(e);assert.ok(e.t<VH_SNAP-.05);}}
 for(const kind of VH_STAGES)for(const id of vhFamily(kind,BANY)){const t=vhTaste(kind,id,BANY);assert.ok(t.length>=1&&t.length<=4,`${kind} ${id}`);for(const n of t){bank(n);assert.ok(n.t+n.len<=1.6);}if(kind==='body')assert.equal(t[0].inst,'dsArpa','the harp tastes the bodies of the bathroom');}
 assert.equal(vhTaste('wheels','pales',BANY)[0].variant,'esquitxpetit');assert.equal(vhTaste('top','bombolles',BANY)[0].variant,'blub');assert.equal(vhTaste('wheels','boies',BANY)[0].variant,'plop');
 for(const l of VH_LIGHTS[BANY]){const air=vhAmbience(BANY,l);assert.ok(air.length>=1&&air.length<=2,l);for(const x of air){assert.ok(nat.has(x.name),`${l} ${x.name}`);assert.ok(x.level>0&&x.level<=.3&&x.lowpass>=700);}}
 assert.equal(vhAmbience(BANY,'mati')[0].name,'drips','drips in the morning');assert.equal(vhAmbience(BANY,'tarda')[0].name,'bubbles');assert.equal(vhAmbience(BANY,'capvespre')[0].name,'drops');assert.equal(vhAmbience(BANY,'nit')[0].name,'nit');});

test('the geometry: the bench fills the stage over the tray, the tray keeps its height within bounds, the cells go left to right, one per piece, and the zones carry the id of their piece',()=>{
 for(const [w,h] of [[1280,720],[1024,768],[1920,1080],[2560,1080],[800,600],[1280,1024],[1366,768],[360,640]]){const G=vhGeom(w,h,false);assert.equal(G.strip,66);assert.ok(G.panel.w>0&&G.panel.h>0,`${w}x${h}`);
  assert.ok(G.tray.h>=VH_TRAY_MIN-1e-9&&G.tray.h<=VH_TRAY_MAX+1e-9,`${w}x${h}: tray ${G.tray.h}`);assert.ok(G.tray.y>=G.panel.y+G.panel.h-1e-6&&G.tray.y+G.tray.h<=h-G.strip+1e-6,`${w}x${h}: the tray between the bench and the strip`);
  for(const n of [2,3,4]){const z=vhSlots(G,n);assert.equal(z.length,n);for(let i=0;i<n;i++){const c=z[i];assert.ok(c.x>=G.tray.x-1e-6&&c.x+c.w<=G.tray.x+G.tray.w+1e-6&&c.y>=G.tray.y-1e-6&&c.y+c.h<=G.tray.y+G.tray.h+1e-6,`${w}x${h} cell ${i}`);assert.ok(c.pts.length>=4);assert.ok(c.w/c.h<=1.7+1e-9,'a cell is never wider than 1.7 to 1');if(i)assert.ok(c.x>z[i-1].x+z[i-1].w-1e-6,'left to right');}}}
 const P=vhGeom(320,180,true);assert.equal(P.strip,0);assert.ok(P.preview&&P.tray.h<VH_TRAY_MIN,'the card has a small tray');
 const s=S(),st=createScanState('vehicles',s),content=scanContent(st,s),zones=vhLayout(st,content,1280,720);assert.equal(zones.length,4);assert.deepEqual(zones.map(z=>z.zone),content.map(c=>c.value));for(let i=1;i<zones.length;i++)assert.ok(zones[i].x>zones[i-1].x);});

test('without WebGL (and so in these tests) the bench is drawn flat, with and without the decor, through every phase of a vehicle, in reduced motion and on the card: finite everywhere',()=>{
 const item=SCAN_ACTIVITIES.find(a=>a.id==='vehicles');
 const draw=(o,time,pending,picks=[],round=0,view={})=>{const s=S(o),st=stateAt(round,picks,s);if(pending){st.pending=pending;st.status='effect';}
  const c=ctx();renderScanActivity(c,1280,720,'vehicles',{item,scanState:st,time,vhGo:view.go??null,focusedChoice:scanChoices(st,s)[0],board:{focus:0,lights:[1,.6,.6],clock:3.2,...view}},s);return c;};
 const rest=draw({background:'full'},null),none=draw({background:'none',base:'black'},null),dim=draw({background:'dim',opacity:40},null),white=draw({background:'none',base:'white'},null);
 assert.ok(rest.calls.length>none.calls.length&&dim.calls.length>none.calls.length,'the room is drawn only with the decor');assert.equal(none.fills[0],'#000000');assert.equal(white.fills[0],'#ffffff');
 assert.ok(rest.calls.filter(k=>k==='fill'||k==='fillRect'||k==='roundRect').length>30,'a flat workshop with bench, tools and shelf');
 const opt=id=>({id,value:id,label:VH_WORD[id],kind:'vehicles'});
 for(const time of [.1,.6,1.2,1.8,2.39])draw({},time,{option:opt('familiar'),correct:true,final:false});
 for(const time of [.3,1.5,2.3])draw({},time,{option:opt('fusta'),correct:true,final:false},['autobus']);
 const TL=vhTimeline(S(),null),times=[.5,2.3,2.5,6,TL.start-.1,TL.start+.3,TL.start+3,TL.start+7,TL.start+11,TL.rideEnd-.2,TL.rideEnd+.5,TL.end-.1,TL.end+.5];
 for(const top of VH_TOPS[C])for(const time of times){draw({},time,{option:opt(top),correct:true,final:true},['familiar','tacs']);draw({reduced:true},time,{option:opt(top),correct:true,final:true},['curses','primes'],3);draw({background:'none',base:'white',vhCamera:'tranquila',vhGarage:false},time,{option:opt(top),correct:true,final:true},['furgoneta','fusta'],2);}
 // a press at 2.6 shortens the wait; «Sorpresa» hides the ring of the wait; the fourth step paints the body
 const P=vhTimeline(S(),2.6);for(const time of [2.7,P.start+1,P.rideEnd+1])draw({},time,{option:opt('baca'),correct:true,final:true},['familiar','tacs'],0,{go:2.6});
 draw({vhWho:'sorpresa'},5,{option:opt('remolc'),correct:true,final:true},['autobus','fusta'],1);
 for(const time of [.5,2,4,20])draw({vhSteps:'4'},time,{option:opt('groc'),correct:true,final:true},['curses','primes','bandera'],3);
 for(let round=1;round<8;round+=2)draw({},null,null,['familiar'],round);
 // the living room (0.56): its pieces in the tray and on the chassis, its gags on the circuit, and as the first corner
 for(const [body,wheels,top] of [['bombers','erugues','cano'],['ambulancia','balons','campana'],['plataforma','bessones','brac'],['furgo','ferro','manega'],['totterreny','tapacubs','escala'],['policia','tacs','sirena']])for(const time of [.3,2.3,TL.start+2,TL.start+6,TL.rideEnd+.5,TL.end-.1]){draw({},time,{option:opt(top),correct:true,final:true},[body,wheels],4);draw({vhCorner:'sala',background:'none',base:'white'},time,{option:opt(top),correct:true,final:true},[body,wheels],1);}
 for(const body of VH_BODIES[SALA]){draw({},1.2,{option:opt(body),correct:true,final:false},[],5);draw({},null,null,[body],6);}for(const wheels of VH_WHEELS[SALA])draw({},1.5,{option:opt(wheels),correct:true,final:false},['furgo'],7);
 draw({vhCorner:'sala'},null,null,[],0);draw({vhCorner:'sala'},null,null,['policia','ferro'],3);
 // the yard (0.57): its pieces in the tray and on the chassis, its gags on the circuit, and as the first corner
 for(const [body,wheels,top] of [['bolquet','grans','caixa'],['excavadora','erugues','pala'],['buldozer','gegants','sirena'],['piconadora','corrons','tambor'],['carreto','massisses','cons'],['tractor','tacs','remolc']])for(const time of [.3,2.3,TL.start+2,TL.start+6,TL.rideEnd+.5,TL.end-.1]){draw({},time,{option:opt(top),correct:true,final:true},[body,wheels],8);draw({vhCorner:'pati',background:'none',base:'white'},time,{option:opt(top),correct:true,final:true},[body,wheels],1);}
 for(const body of VH_BODIES[PATI]){draw({},1.2,{option:opt(body),correct:true,final:false},[],9);draw({},null,null,[body],10);}for(const wheels of VH_WHEELS[PATI])draw({},1.5,{option:opt(wheels),correct:true,final:false},['tractor'],11);
 draw({vhCorner:'pati'},null,null,[],0);draw({vhCorner:'pati'},null,null,['carreto','corrons'],3);
 // the hallway (0.58): its pieces in the tray and on the chassis, its gags on the circuit, and as the first corner
 for(const [body,wheels,top] of [['locomotora','bieles','xemeneia'],['vago','pestanya','fanal'],['tramvia','faldons','xiulet'],['mercaderies','vagoneta','troncs'],['maniobres','radis','bandera'],['cua','fusta','campana']])for(const time of [.3,2.3,TL.start+2,TL.start+6,TL.rideEnd+.5,TL.end-.1]){draw({},time,{option:opt(top),correct:true,final:true},[body,wheels],12);draw({vhCorner:'passadis',background:'none',base:'white'},time,{option:opt(top),correct:true,final:true},[body,wheels],1);}
 for(const body of VH_BODIES[PASSADIS]){draw({},1.2,{option:opt(body),correct:true,final:false},[],13);draw({},null,null,[body],14);}for(const wheels of VH_WHEELS[PASSADIS])draw({},1.5,{option:opt(wheels),correct:true,final:false},['locomotora'],15);
 draw({vhCorner:'passadis'},null,null,[],0);draw({vhCorner:'passadis'},null,null,['tramvia','faldons'],3);
 // the bathroom (0.59): its vehicles through every phase, in the room and without the decor; its tray and its board
 for(const [body,wheels,top] of [['hidroavio','flotadors','bombolles'],['barca','pales','ancora'],['submari','boies','periscopi'],['helicopter','salvavides','globus'],['avioneta','amples','helix'],['vapor','balons','bandera']])for(const time of [.3,2.3,TL.start+2,TL.start+6,TL.rideEnd+.5,TL.end-.1]){draw({},time,{option:opt(top),correct:true,final:true},[body,wheels],16);draw({vhCorner:'bany',background:'none',base:'white'},time,{option:opt(top),correct:true,final:true},[body,wheels],1);}
 for(const body of VH_BODIES[BANY]){draw({},1.2,{option:opt(body),correct:true,final:false},[],17);draw({},null,null,[body],18);}for(const wheels of VH_WHEELS[BANY])draw({},1.5,{option:opt(wheels),correct:true,final:false},['barca'],19);
 draw({vhCorner:'bany'},null,null,[],0);draw({vhCorner:'bany'},null,null,['vapor','pales'],3);
 // the card of the home screen
 const card=ctx();renderScanActivity(card,320,180,'vehicles',{item,scanState:null,time:null},S({background:'none'}),true);assert.ok(card.calls.length>30);
 assert.ok(typeof vhBoard==='function'&&typeof vhResult==='function');});

test('the settings of the activity are validated, with their defaults: three pieces, the pupil chooses, a press starts, a middle ride, the dynamic camera, automatic quality and the garage',()=>{
 assert.deepEqual([defaults.vhSteps,defaults.vhCells,defaults.vhWho,defaults.vhGo,defaults.vhRide,defaults.vhCamera,defaults.vhGarage,defaults.vhQuality,defaults.vhCorner],['3','4','alumne','puls','mitja','dinamica',true,'auto','habitacio']);
 assert.equal(validateProfile(S({vhCorner:'sala'})).vhCorner,'sala');assert.equal(validateProfile(S({vhCorner:'pati'})).vhCorner,'pati');assert.equal(validateProfile(S({vhCorner:'passadis'})).vhCorner,'passadis');assert.equal(validateProfile(S({vhCorner:'bany'})).vhCorner,'bany');assert.throws(()=>validateProfile(S({vhCorner:'cuina'})));assert.throws(()=>validateProfile(S({vhCorner:1})));
 const ok=validateProfile(S({vhSteps:'4',vhCells:'2',vhWho:'sorpresa',vhGo:'auto',vhRide:'llarg',vhCamera:'tranquila',vhGarage:false,vhQuality:'baixa'}));assert.deepEqual([ok.vhSteps,ok.vhCells,ok.vhWho,ok.vhGo,ok.vhRide,ok.vhCamera,ok.vhGarage,ok.vhQuality],['4','2','sorpresa','auto','llarg','tranquila',false,'baixa']);
 for(const v of ['alta','mitjana','baixa','auto'])assert.equal(validateProfile(S({vhQuality:v})).vhQuality,v);
 for(const bad of [{vhSteps:'5'},{vhSteps:3},{vhCells:'5'},{vhCells:4},{vhWho:'mestre'},{vhGo:'tecla'},{vhRide:'infinit'},{vhCamera:'fixa'},{vhGarage:'si'},{vhQuality:'ultra'}])assert.throws(()=>validateProfile(S(bad)),JSON.stringify(bad));
 const app=read('../dist/app.js');for(const k of ['vhSteps','vhCells','vhCorner','vhWho','vhGo','vhRide','vhCamera','vhQuality'])assert.match(app,new RegExp(`sel\\('${k}',`),k);assert.match(app,/vhRoundOf\(0,settings\)\.corner/,'the first corner is the one built under the loading cover');assert.match(app,/vhGarage/);
 assert.match(app,/if\(id==='vehicles'\)out\.push\(vhSettings\(\)\)/);});

test('no «Informació» panel since 0.60.3 (Marc: «és completament irrellevant»), neither in the activity nor on its home card; the home card is still a picture',async()=>{
 const {SCENE_INFO,SCENE_INFO_HEAD,CARD_IMG}=await import('../dist/info-escenes.js');
 assert.equal(SCENE_INFO.vehicles,undefined);assert.equal(SCENE_INFO_HEAD.vehicles,undefined);
 // the ⓘ buttons of the game bar, of the stage tools and of the home card all ask SCENE_INFO first, so none of them shows for this activity
 const app=read('../dist/app.js');assert.match(app,/\$\{SCENE_INFO\[g\.id\]\?`<button class="favorite card-info" data-info/);assert.equal((app.match(/\$\{SCENE_INFO\[item\.id\]\?`<button[^`]*data-info/g)||[]).length,2);
 assert.ok(!fs.readdirSync(new URL('../production/info/img/',import.meta.url)).some(f=>f.startsWith('vehicles_')),'no panel pictures left');
 assert.ok(!JSON.parse(read('../production/info/escenes.json')).vehicles);assert.doesNotMatch(read('../tools/vehicles-info.mjs'),/img\/vehicles_/);
 assert.match(CARD_IMG.vehicles||'',/^data:image\/jpeg;base64,\/9j\//);
 assert.match(read('../production/info/make_info.py'),/'vehicles'/);
 const act=read('../ACTIVITATS.md');assert.match(act,/\| EN07 \| El taller de vehicles \| Composició creativa \| \(Refeta del tot a la 0\.53/);
 assert.match(read('../package.json'),/"version":\s*"0\.(5[4-9]|[6-9][0-9])/);});
test('the finale of a corner (0.60): the fourth vehicle ends with the parade of the vehicles made in the corner, with its own phase, time, route, music and flat drawing',()=>{
 assert.deepEqual(VH_PARADE,{curt:9,mitja:12,llarg:15});assert.equal(VH_PARADE_GAP,150);assert.equal(vhParadeTime(S()),12);assert.equal(vhParadeTime(S({vhRide:'curt'})),9);
 for(let r=0;r<40;r++)assert.equal(vhFinale(r,S()),r%4===3,`round ${r}`);assert.equal(vhFinale(null,S()),false);assert.equal(vhFinale(undefined,S()),false);assert.equal(vhFinale(3,S({vhCorner:'bany'})),true);
 // the times: only a round 3, 7, … carries the parade; the other rounds are as before
 assert.deepEqual(vhTimes(S()),vhTimes(S(),2));assert.deepEqual(vhTimes(S(),3),{wrong:1,step:VH_SNAP,final:VH_SNAP+8+14+2.8+12,wait:8,ride:14,park:2.8,parade:12});
 assert.equal(vhTimes(S({vhRide:'curt'}),7).parade,9);assert.equal(vhTimes(S({vhRide:'llarg'}),11).parade,15);assert.equal(vhTimes(S({vhRide:'llarg'}),11).final,VH_SNAP+8+20+2.8+15);
 const TL=vhTimeline(S(),null,3),plain=vhTimeline(S(),null,2);assert.ok(TL.finale&&!plain.finale);assert.equal(TL.parkEnd,plain.end);assert.equal(TL.end,plain.end+12);assert.equal(plain.parade,0);assert.equal(plain.parkEnd,plain.end);assert.deepEqual(vhTimeline(S(),null),vhTimeline(S(),null,0));
 // the phases in order, the parade last, each from 0 to 1; a plain round never reaches it
 const order=['snap','wait','ride','park','parade'];let last='snap';const seen=[];for(let t=0;t<=TL.end+.5;t+=.05){const P=vhPhase(TL,t);if(!seen.includes(P.phase))seen.push(P.phase);assert.ok(P.u>=0&&P.u<=1);if(P.phase!==last){assert.ok(order.indexOf(P.phase)>order.indexOf(last),`${last} then ${P.phase}`);last=P.phase;}}
 assert.deepEqual(seen,order);assert.equal(vhPhase(TL,TL.end+1).phase,'parade');assert.equal(vhPhase(TL,TL.end+1).u,1);assert.equal(vhPhase(plain,plain.end+1).phase,'park');assert.equal(vhPhase(plain,plain.end+1).u,1);
 assert.equal(vhPhase(TL,TL.parkEnd-.01).phase,'park');assert.ok(vhPhase(TL,TL.parkEnd-.01).u>.99);assert.equal(vhPhase(TL,TL.parkEnd).phase,'parade');assert.ok(vhPhase(TL,TL.parkEnd+6).u>.49&&vhPhase(TL,TL.parkEnd+6).u<.51);
 // a press shortens the wait, never the parade; without the garage the parade still comes
 const pressed=vhTimeline(S(),2.6,3);assert.equal(pressed.parade,12);assert.ok(Math.abs(pressed.end-pressed.parkEnd-12)<1e-9);assert.ok(pressed.end<TL.end);assert.equal(vhTimeline(S({vhGarage:false}),null,3).parade,12);
 // the route: it starts inside the garage where the vehicle parked, goes out by its door towards the front of the room, along the front and off to the right, always on the floor
 const P=VH_PARADE_PATH;assert.ok(P.length>=8);assert.deepEqual(P[0],[-680,-192,420]);assert.ok(P.every(p=>p[1]<=-192&&p[1]>=-200),'on the floor');assert.ok(P[P.length-1][0]>=1000,'off to the right');for(let i=1;i<P.length;i++)assert.ok(P[i][0]>P[i-1][0],'always towards the right');
 assert.ok(P.some(p=>p[2]>=850),'along the front of the room');assert.ok(Math.max(...P.map(p=>p[2]))<1000,'inside the room');assert.ok(P.every(p=>Math.hypot(p[0]+380,p[2]-640)>90),'clear of the living room flower pot');
 // the vehicles of the parade: the one just finished first, then the earlier ones of this corner, newest first; a round without a vehicle is skipped, another corner's never comes
 const made={0:{body:'familiar',wheels:'tacs',top:'baca',color:null},1:{body:'autobus',wheels:'fusta',top:'remolc',color:'groc'},2:{body:'curses',wheels:'primes',top:null,color:null},4:{body:'bombers',wheels:'erugues',top:'cano',color:null},6:{body:'policia',wheels:'tacs',top:null,color:null}};
 const cur={body:'furgoneta',wheels:'amples',top:'sirena',color:null},list=vhParadeList(stateAt(3,['furgoneta','amples']),{vhMade:made},S(),cur);
 assert.deepEqual(list.map(v=>v.body),['furgoneta','curses','autobus','familiar']);assert.equal(list[2].color,'groc');assert.equal(list[3].color,VH_BODY_COLOR.familiar);assert.equal(list[0].color,VH_BODY_COLOR.furgoneta);assert.equal(list[1].top,null);assert.equal(list[0].top,'sirena');
 const partial=vhParadeList(stateAt(7,['ambulancia','balons']),{vhMade:made},S(),{body:'ambulancia',wheels:'balons',top:'campana',color:null});assert.deepEqual(partial.map(v=>v.body),['ambulancia','policia','bombers']);
 assert.deepEqual(vhParadeList(stateAt(3,[]),{},S(),cur).map(v=>v.body),['furgoneta']);assert.deepEqual(vhParadeList(stateAt(3,[]),null,S(),cur).length,1);
 // the music: after the garage the claves count the parade in, the whole band plays once more with the wheels of the leader under it, and the cadence closes before the end
 const picks={body:'familiar',wheels:'fusta',top:'baca',color:'blau'},sc=vhFinalScore(C,picks,S(),null,3),plainSc=vhFinalScore(C,picks,S(),null,2);
 assert.ok(sc.every(e=>e.t<TL.end-.05));assert.ok(plainSc.every(e=>e.t<plain.end-.05));const after=sc.filter(e=>e.t>=TL.parkEnd),before=sc.filter(e=>e.t<plain.end-.05);assert.ok(after.length>40,'the band of the parade');assert.ok(Math.abs(before.length-plainSc.length)<=4,'up to the garage a finale round sounds as any other (the bars of the band turn with the round)');assert.deepEqual([...new Set(before.map(e=>e.inst))].sort(),[...new Set(plainSc.map(e=>e.inst))].sort());assert.ok(sc.filter(e=>e.t>=plain.end-.05&&e.t<TL.parkEnd+.25).length<=1,'at most one late note of the garage, then nothing until the claves');
 assert.ok(after.filter(e=>e.inst==='woodblockRec'&&e.t<TL.parkEnd+.6).length>=2,'the claves count in');assert.ok(after.some(e=>e.inst==='dsClarinet'),'the tune');assert.ok(after.some(e=>e.inst==='dsBaix')&&after.some(e=>e.inst==='dsPiano'));
 assert.ok(after.filter(e=>e.inst==='woodblockRec'&&e.variant==='claves'&&e.t>TL.parkEnd+1.5&&e.t<TL.end-2.5).length>5,'the wooden wheels of the leader');assert.ok(after.some(e=>e.t>TL.end-2.5&&e.inst==='dsPiano'),'the cadence');
 assert.ok(after.every(e=>e.vel<=1&&e.vel>0));const pat=vhPattern(sc,TL.end);assert.ok(pat.every(e=>e.at>=0&&e.at<1&&e.length>0));
 for(const [K,w] of [[SALA,'ferro'],[PATI,'corrons'],[PASSADIS,'bieles'],[BANY,'pales']]){const s2=vhFinalScore(K,{body:VH_BODIES[K][0],wheels:w,top:VH_TOPS[K][0],color:null},S(),null,3);assert.ok(s2.filter(e=>e.t>=TL.parkEnd).length>30,K);assert.ok(s2.every(e=>e.t<TL.end-.05));}
 // the flat drawing of the parade: every vehicle of the convoy, finite everywhere; a plain round keeps its single car
 const item=SCAN_ACTIVITIES.find(a=>a.id==='vehicles'),opt=id=>({id,value:id,label:VH_WORD[id],kind:'vehicles'});
 const draw=(round,time,game={})=>{const s=S(),st=stateAt(round,['familiar','tacs'],s);st.pending={option:opt('baca'),correct:true,final:true};st.status='effect';const c=ctx();renderScanActivity(c,1280,720,'vehicles',{item,scanState:st,time,vhGo:null,focusedChoice:scanChoices(st,s)[0],board:{focus:0,lights:[1,.6,.6],clock:3.2},...game},s);return c;};
 for(const t of [TL.parkEnd-.1,TL.parkEnd+.1,TL.parkEnd+3,TL.parkEnd+6,TL.parkEnd+9,TL.end-.1,TL.end+.5])draw(3,t,{vhMade:made});
 draw(3,TL.parkEnd+4,{});draw(7,TL.parkEnd+4,{vhMade:made});draw(2,plain.end-.1,{vhMade:made});
 // the engine: the last pick of a round 3 lasts the parade too, the others as before
 const s=S(),st=stateAt(3,['familiar','tacs'],s),res=chooseScan(st,s,0);assert.ok(res.accepted&&res.action==='effect');assert.equal(res.duration,vhTimes(s,3).final);assert.equal(res.duration,TL.end);
 assert.equal(chooseScan(stateAt(2,['familiar','tacs'],s),s,0).duration,vhTimes(s,2).final);assert.equal(chooseScan(stateAt(3,['familiar'],s),s,0).duration,VH_SNAP);
 // 0.60.1: the vehicle on the bench leads the convoy, so putting the convoy away after the parade must never hide it (the toy of the next corner was invisible)
 const src3d=read('../dist/vehicles-3d.js');assert.match(src3d,/parade\.groups\)if\(g!==toy\)g\.visible=false/);assert.doesNotMatch(src3d,/parade\.groups\)g\.visible=false/);});

test('the circuits keep clear of the room objects (0.60.2): the living room plant pot and coffee table legs, the yard tyres, the bathroom towel rail',()=>{
 // where the room code puts them (tools/vehicles-sweep.mjs sweeps the real footprint of every body with its wheels and accessories; these are the
 // numbers it was run with, so moving one of these objects or a circuit asks for the sweep again)
 const src=read('../dist/vehicles-3d.js');assert.match(src,/pot\.position\.set\(-380,VH_FLOOR,640\)/);assert.match(src,/table\.position\.set\(-40,VH_FLOOR,575\)/);
 assert.match(src,/tyres\.position\.set\(700,VH_FLOOR,300\)/);assert.match(src,/rail\.position\.set\(250,VH_FLOOR,360\)/);
 for(const k of ['books','pit','tub','bridge','rails','sleepers','board'])assert.match(src,new RegExp(k+'\\.userData\\.drive=true'),k);
 const seg=(p,a,b)=>{const dx=b[0]-a[0],dz=b[2]-a[2],L=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[2])*dz)/L));return Math.hypot(a[0]+t*dx-p[0],a[2]+t*dz-p[1]);};
 const clear=(path,p)=>Math.min(...path.slice(1).map((b,i)=>seg(p,path[i],b)));
 // the living room: its second lap went through the plant pot, a leg of the coffee table and the corner of the books (0.60.1 and before)
 const sala=vhPathOf(SALA);assert.ok(clear(sala,[-380,640])>=110,'the plant pot');for(const x of[-145,65])for(const z of[505,645])assert.ok(clear(sala,[x,z])>=45,`the table leg at ${x},${z}`);
 assert.ok(clear(sala.slice(sala.findIndex(p=>p[0]===125&&p[2]===440)),[65,645])>=55,'the second lap passes the front leg with room to spare');
 assert.ok(clear(VH_PARADE_PATH,[-380,640])>=110,'the parade and the plant pot');
 // the yard: the stack and the tyre leaning on it, away from the foot of the ramp; the bathroom: the towel rail, back from the turn after the ramp
 const pati=vhPathOf(PATI);assert.ok(clear(pati,[700,300])>=180&&clear(pati,[628,320])>=140,'the tyres');
 const bany=vhPathOf(BANY);for(const x of[170,330])assert.ok(clear(bany,[x,360])>=95,`the towel rail leg at ${x}`);});
test('the accessories sit on the real top of every body of their corner (0.61.1): no part sinks deeper than the seat, one part always touches, and the weak ones are redrawn',async()=>{
 // Marc 8 Nov 2026: «Revisa com estan dibuixats els complements… com la campana… Sovint queden massa ensorrats per dins del vehicle». The
 // accessory is lowered onto a height map of the body until its first part touches (the body's rounded edge stands 2.2 above its outline).
 if(!globalThis.PP3)vm.runInThisContext(fs.readFileSync(new URL('../dist/vendor/three-taller.js',import.meta.url),'utf8'));
 const m=await import('../dist/vehicles-3d.js'),src=read('../dist/vehicles-3d.js'),BY=+/const VH_BODY_Y=([\d.]+)/.exec(src)[1],SINK=+/VH_SEAT_SINK=([\d.]+)/.exec(src)[1];
 for(const c of VH_CORNERS)for(const top of VH_TOPS[c]){if(top==='remolc'||top==='globus')continue;const seat=m.vhPiece('top',top).children[0].userData.seat;assert.ok(seat.length>0,top);
  for(const body of VH_BODIES[c]){const [x,y]=m.vhTopMount(body,top),base=y-BY;let least=Infinity;for(const p of seat){const hi=m.vhRoofTop(body,x,p);if(hi<-1e8)continue;const gap=base+p[4]-hi;assert.ok(gap>=-SINK-1e-6,`${top} on ${body}: a part sinks ${(-gap).toFixed(2)}`);least=Math.min(least,gap);}
   assert.ok(Math.abs(least+SINK)<1e-6,`${top} on ${body} rests on the body (${least.toFixed(2)})`);}}
 assert.match(src,/const VH_TOP_AT=Object\.freeze\(\{'bolquet\|pala':-14,'excavadora\|caixa':10\.5,'helicopter\|helix':-13\}\)/);
 // the bell's yoke runs along the body (no post in front of it for the bench camera) and it swings towards the room; the mixer drum lies down
 assert.match(src,/for\(const x of\[-6\.1,6\.1\]\)\{vhM\(vhRB\(1\.3,10\.4,1\.3/);assert.match(src,/top\.userData\.bell\.rotation\.x=k>0/);assert.match(src,/frame\.rotation\.z=VH_DRUM;/);assert.doesNotMatch(src,/frame\.rotation\.z=\.4\+k\*\.7/);
 const size=id=>{const T=globalThis.PP3,b=new T.Box3();const p=m.vhPiece('top',id);p.updateMatrixWorld(true);p.traverse(o=>{if(!o.isMesh)return;for(let q=o;q;q=q.parent)if(q.visible===false)return;b.expandByObject(o,true);});return b.getSize(new T.Vector3());};
 for(const [id,h] of Object.entries({campana:12,sirena:7,escala:8,manega:10,xiulet:10,fanal:9.5,periscopi:11,ancora:10,bombolles:12}))assert.ok(size(id).y>=h,`${id} stands at least ${h} high (${size(id).y.toFixed(1)})`);
});

