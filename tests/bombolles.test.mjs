import test from 'node:test';
import assert from 'node:assert/strict';
import {BB_CAUSE,BB_STIMS,BB_IDS,BB_MUSIC,BB_BLACK,bbStart,bbPress,bbTick,bbBlocked,bbStatus,bbProgress,bbHelp,bbPhrase,bbEvents,bbRate,bbStim} from '../dist/bombolles.js';
import {bmbRole} from '../dist/bombolles-sabo.js';
import {EXTRA_CAUSES} from '../dist/cause-catalog.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {escRange} from '../dist/escenari.js';
import {defaults,validateProfile} from '../dist/input.js';
const S={bbPresses:8,bbFirst:'sabo',lock:true,sound:true,waitCue:true};
// runs the activity for `secs` seconds in steps of 1/30 s, pressing every `gap` seconds when a press is accepted
function run(g,s,secs,gap=1e9,on){let t=0,next=gap;while(t<secs){if(t>=next){if(!bbBlocked(g,s))bbPress(g,s);next=t+gap;}bbTick(g,s,1/30);t+=1/30;on?.(g.bombolles);}}
const until=(g,s,cond,max=60)=>{let t=0;while(!cond(g.bombolles)&&t<max){bbTick(g,s,1/30);t+=1/30;}return t;};

test('Bombolles sense pes takes the id and the code of Bombolles de sabó (0.63), and the old one is gone',()=>{
 assert.equal(BB_CAUSE.id,'bubbles');assert.equal(BB_CAUSE.code,'CE05');assert.equal(BB_CAUSE.name,'Bombolles sense pes');assert.ok(BB_CAUSE.bombolles&&BB_CAUSE.recorded);
 assert.ok(!EXTRA_CAUSES.some(x=>x.id==='bubbles'));assert.deepEqual(BB_IDS,['sabo','plasma','aigua','fum','lava','ferro','oli','nebulosa']);
 for(const m of BB_STIMS)for(const f of ['nou','prem','pas','pinta','buit'])assert.equal(typeof m[f],'function',m.id+' '+f);});

test('its settings: 4, 8 or 12 presses of each matter (8 by default) and the first matter',()=>{
 assert.equal(defaults.bbPresses,8);assert.equal(defaults.bbFirst,'sabo');
 assert.throws(()=>validateProfile({...defaults,bbPresses:6}));assert.throws(()=>validateProfile({...defaults,bbFirst:'foc'}));
 // Mel i caramel is gone (0.63.2): a profile saved with it as the first matter starts with the soap bubbles
 assert.equal(validateProfile({...defaults,bbFirst:'mel'}).bbFirst,'sabo');
 for(const P of [4,8,12])assert.equal(validateProfile({...defaults,bbPresses:P}).bbPresses,P);
 const g={};bbStart(g,{...S,bbFirst:'fum'});assert.equal(bbStim(g.bombolles).id,'fum');});

test('the arc of a matter: in from an edge, growth, the full moment, the way out to black (presses do nothing meanwhile), then the next matter',()=>{
 for(const P of [4,8,12]){const s={...S,bbPresses:P},g={};bbStart(g,s);const F=g.bombolles;assert.equal(F.S,null,'black before the first press');
  for(let k=1;k<=P;k++){assert.ok(bbPress(g,s),`press ${k}`);assert.equal(g.count,k);const role=bmbRole(k,P);
   if(k<P){assert.equal(F.phase,'run');assert.equal(bbPress(g,s),false,'locked during the phrase');until(g,s,F=>F.phase==='rest');assert.equal(F.wait.mode,'wait');}
   else assert.equal(role,'surt');}
  assert.equal(F.phase,'out');assert.ok(bbBlocked(g,s));assert.equal(bbPress(g,s),false);
  const out=until(g,s,F=>F.phase==='black',40);assert.ok(out<26,`out in ${out.toFixed(1)} s`);assert.ok(bbStim(F).buit(F.S)||out>=25);
  until(g,s,F=>F.phase==='rest',5);assert.equal(F.i,1);assert.equal(F.k,0);assert.equal(g.count,0);assert.equal(F.S,null);assert.equal(F.matters,1);}});

test('after the last matter the first one comes back with its second palette, at any rhythm of presses',()=>{
 for(const gap of [.4,3]){const s={...S,bbPresses:4},g={};bbStart(g,s);const seen=new Set();run(g,s,600,gap,F=>seen.add(F.i));const F=g.bombolles;
  assert.equal(seen.size,BB_STIMS.length);assert.ok(F.matters>=BB_STIMS.length,`${F.matters} matters`);assert.ok(F.lap>=1);}});

test('without «Espera que acabi cada efecte» a press during a phrase is taken, and the notes of the phrase not yet sent are left out',()=>{
 const s={...S,lock:false},g={};bbStart(g,s);bbPress(g,s);bbTick(g,s,.3);const F=g.bombolles,before=F.notes.filter(n=>!n.sent).length;assert.ok(before>0);
 for(const n of F.notes)if(n.at<=F.t)n.sent=true;const sent=F.notes.filter(n=>n.sent).length;
 assert.ok(bbPress(g,s));assert.equal(F.k,2);assert.equal(F.notes.filter(n=>n.sent).length,sent,'the sent notes stay');
 assert.ok(F.notes.every(n=>n.sent||n.at>=F.t),'only the new phrase is waiting');});

test('every phrase of every matter: recorded instruments only, inside the range of their recordings, and no held notes',()=>{
 for(const id of BB_IDS){const U=BB_MUSIC[id];for(const P of [4,8,12])for(let k=1;k<=P;k++)for(const lap of [0,1]){const p=bbPhrase(U,bmbRole(k,P),k,P,lap);
  assert.ok(p.notes.length>=4,`${id} ${k}/${P}`);assert.ok(p.length>0);
  for(const n of p.notes){const b=SAMPLE_BANK[n.inst];assert.ok(b,`${id}: ${n.inst}`);assert.ok(n.vel>0&&n.vel<=.6);assert.ok(n.len>0&&n.len<=5,'every note dies away');assert.ok(n.beat>=0&&n.beat<=p.length);
   if(b.zones.some(z=>z[1]>0)){const [lo,hi]=escRange(n.inst);assert.ok(n.midi[0]>=lo&&n.midi[0]<=hi,`${id} ${n.inst} ${n.midi[0]}`);}}}}
 // the full moment is the richest phrase of the matter, and it lasts long enough to be heard
 for(const id of BB_IDS){const U=BB_MUSIC[id],a=bbPhrase(U,'creix',4,8),f=bbPhrase(U,'ple',7,8);assert.ok(f.notes.length>a.notes.length);assert.ok(f.length*U.unit>=6&&f.length*U.unit<=11,`${id} full ${f.length*U.unit}`);}});

test('the sounds of the matter: one note of the chord at most every 0.22 s, each recording no closer than its own gap, and the events are read once',()=>{
 for(const id of BB_IDS){const s={...S,bbFirst:id},g={};bbStart(g,s);const F=g.bombolles,notes=[],fx=[];
  for(let k=1;k<=7;k++){bbPress(g,s);until(g,s,F=>F.phase==='rest'||F.phase==='out');}
  // the events since the last read, as the frame loop reads them
  let t=0;while(t<8){bbTick(g,s,1/30);t+=1/30;bbEvents(F,e=>notes.push(F.t),f=>fx.push([f[1],F.t]));assert.equal(F.S.ev.length,0);}
  for(let i=1;i<notes.length;i++)assert.ok(notes[i]-notes[i-1]>=.22-1e-9,id);
  const by={};for(const [n,at] of fx){if(by[n]!=null){const gap=Object.values(BB_MUSIC[id].fx).find(f=>f[1]===n)[3];assert.ok(at-by[n]>=gap-1e-9,`${id} ${n}`);}by[n]=at;}
  for(const [n] of fx)assert.ok(Object.values(SAMPLE_BANK).some(b=>b.zones.some(z=>z[9]===n)),`${id}: recording ${n}`);}});

test('the wait: once a step ends the matter slows down to a drift (15 %), never to a stop, and it always goes out at full pace',()=>{
 const g={};bbStart(g,S);const F=g.bombolles;bbPress(g,S);until(g,S,F=>F.phase==='rest');bbTick(g,S,3);assert.equal(bbRate(F,S),.15);
 assert.equal(bbRate(F,{...S,waitCue:false}),1);bbPress(g,S);bbTick(g,S,1);assert.ok(bbRate(F,S)>.9);
 for(let k=3;k<=8;k++){until(g,S,F=>F.phase==='rest');bbPress(g,S);}assert.equal(F.phase,'out');assert.equal(bbRate(F,S),1);});

test('the words for a screen reader and the progress',()=>{
 const g={};bbStart(g,S);assert.match(bbStatus(g,S),/Bombolles de sabó: la pantalla és negra/);bbPress(g,S);assert.match(bbStatus(g,S),/entren per una vora/);
 assert.equal((bbProgress(g,S).match(/<span/g)||[]).length,8);assert.equal((bbProgress(g,S).match(/class="done"/g)||[]).length,1);
 assert.match(bbHelp(S),/pulsació 7 omple la pantalla/);assert.match(bbHelp({...S,lock:false}),/Pots tornar a prémer/);
 assert.ok(BB_BLACK>0);});

test('in the app: the folder «Formes, llum i música» after Pluja de colors, out of «Per revisar», the loading cover, the black floor, the card picture and the build',async()=>{
 const fs=await import('node:fs'),read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8'),app=read('../dist/app.js'),build=read('../build_standalone.py'),art=read('../dist/art.js');
 assert.match(app,/ids:\['flower','pluja-colors','bubbles','kaleido'/);assert.match(app,/review:true,ids:\['dress'\]\}/);
 assert.match(app,/'pluja-colors','bubbles',\.\.\.LOAD_DIVES\]/);assert.match(app,/if\(item\.bombolles\)steps\.push\(\{w:2,share:\(\)=>\{try\{return bbLoad\(\);\}catch\{return 1;\}\}\}\);/);
 assert.match(app,/if\(item\.bombolles\)bbStart\(game,settings\)/);assert.match(app,/game\?\.bombolles\?bbBlocked\(game,settings\):/);assert.match(app,/pjSilence\(\);bbSilence\(\);/);
 assert.match(app,/if\(game\.bombolles\)\{bbTick\(game,settings,Math\.min\(dt,100\)\/1000\);bbAudio\(game,settings,audio,master,/);
 assert.match(art,/if\(id==='bubbles'\)\{bbDraw\(c,w,h,game,s,preview\);return;\}/);
 const order=['bombolles-shaders.js','bombolles-motor.js','bombolles-sabo.js','bombolles-lbm.js','bombolles-liquids.js','bombolles-plasma.js','bombolles-aigua.js','bombolles-fum.js','bombolles-lava.js','bombolles-ferro.js','bombolles-oli.js','bombolles-nebulosa.js','bombolles.js','bombolles-escena.js'];
 let at=-1;for(const f of order){const i=build.indexOf(`'${f}'`);assert.ok(i>at,f);at=i;}assert.ok(at<build.indexOf("'art.js'"));
 const {CARD_IMG}=await import('../dist/info-escenes.js');assert.match(CARD_IMG.bubbles,/^data:image\/jpeg;base64,/);
 const {bbDraw,bbLoad,bbGlFailed}=await import('../dist/bombolles-escena.js');assert.equal(bbLoad(),1,'no WebGL outside the browser: nothing to wait for');assert.equal(bbGlFailed(),false);
 const calls=[],c={canvas:{width:320,height:180},save(){},restore(){},setTransform(){},fillRect(...a){calls.push(a);}};bbDraw(c,320,180,{bombolles:null},{});assert.deepEqual(calls,[[0,0,320,180]],'black without a game');});
