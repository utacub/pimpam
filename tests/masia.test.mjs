// Estiu a la masia (EN26, 0.39): the scanning among the five of the farm (the grandmother, the grandfather, Nina, Pol and the goat), each with
// its animated episode (a plain gag the first round, a twist from the second), the day that advances one hour per pick, the dinner after the
// fifth, and the sound: the family band with the voice of the character, the ElevenLabs foley and voices on the choreography, the air by the hour.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MS_LTR,MS_CHARS,MS_NAMES,MS_PUSH,MS_EP,MS_STEP,MS_FINAL,msOrder,msOptions,msWord,msHour,msVariant,msPhase,msScore,msPatternScore,msTaste,msGagEvents,msGagPattern,msAmbience,msFocusSound} from '../dist/masia.js';
import {SCAN_ACTIVITIES,createScanState,scanContent,chooseScan,finishScan} from '../dist/scan-catalog.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {defaults} from '../dist/input.js';
const samples=new URL('../dist/assets/samples/',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
const names=bank=>new Set(SAMPLE_BANK[bank].zones.map(z=>z[9]));

test('EN26 is the eleventh scanning activity: five characters, one word each, a step of 16.5 s and a final of 35 s',()=>{
 const row=SCAN_ACTIVITIES.find(a=>a.id==='masia');assert.ok(row);assert.equal(row.code,'EN26');assert.equal(SCAN_ACTIVITIES.at(-1),row);
 assert.equal(MS_CHARS.length,5);for(const id of MS_CHARS)assert.match(msWord(id),/^[A-Za-zàèéíòóú]+$/);
 assert.equal(MS_STEP,16.5);assert.equal(MS_FINAL,35);assert.equal(MS_PUSH+MS_EP,15.5);});

test('every round shows the five in another order, the options leave out the characters already picked, and the hour advances one fifth per pick',()=>{
 const orders=[0,1,2,3,4].map(r=>msOrder(r).join(''));assert.equal(new Set(orders).size,5);for(const o of msOrder(3))assert.ok(MS_CHARS.includes(o));
 const state={picks:[{value:'avia'},{value:'pol'}]};const opts=msOptions(state,3);assert.ok(!opts.includes('avia')&&!opts.includes('pol'));
 for(const n of [2,3,4]){assert.equal(msOptions({picks:[]},n).length,5,'0.44.3: every character from the start');assert.equal(opts.length,3);}
 assert.equal(msHour(0),0);assert.equal(msHour(2),.4);assert.equal(msHour(5),1);assert.ok(msHour(4,MS_PUSH+MS_EP,true)>msHour(4));
 assert.equal(msVariant(0),0);assert.equal(msVariant(1),1);assert.equal(msVariant(7),1);
 assert.equal(msPhase(0,false).phase,'push');assert.equal(msPhase(MS_PUSH+1,false).phase,'ep');assert.equal(msPhase(MS_STEP-.5,false).phase,'back');assert.equal(msPhase(MS_FINAL-1,true).phase,'sopar');});

test('the music: the piece ends plucked inside the effect, the final lasts into the dinner, and the taste is a short motif of the character',()=>{
 for(const id of MS_CHARS){const sc=msScore(id,['avia'],false,0);assert.ok(sc.length>20);const last=sc.at(-1);assert.ok(last.t+last.len<MS_STEP);assert.ok(['harpRec','celliPizzRec','glockRec'].includes(last.inst));
  const pat=msPatternScore(id,[],true,1);assert.ok(pat.every(e=>e.at>=0&&e.at<1&&e.length>0));assert.ok(pat.some(e=>e.at>(MS_PUSH+MS_EP)/MS_FINAL));
  const taste=msTaste(id);assert.ok(taste.length>=3&&Math.max(...taste.map(n=>n.t+n.len))<1.6);}});

test('the foley and the voices of every episode exist in the banks (masiaRec, a drop and a hen of pintaRec), in order, inside the effect',()=>{
 const ok=new Set([...names('masiaRec'),...names('pintaRec')]);
 for(const id of MS_CHARS)for(const v of [0,1])for(const final of [false,true]){const ev=msGagEvents(id,v,final,[]);assert.ok(ev.length>=15,`${id} ${v}`);
  for(let i=1;i<ev.length;i++)assert.ok(ev[i].at>=ev[i-1].at);for(const e of ev){assert.ok(ok.has(e.name),e.name);assert.ok(e.at>=MS_PUSH&&e.gain>0&&e.gain<=.8);}
  const pat=msGagPattern(id,v,final,[]);const D=final?MS_FINAL:MS_STEP;assert.ok(pat.every(e=>e.at>=0&&e.at<1&&e.length>0&&e.at+e.length<=1+1e-9&&e.inst&&e.variant));
  assert.equal(pat.some(e=>e.at*D>MS_PUSH+MS_EP+1),final);}
 // the twists: the cat under the omelette, the boot on the hat, the hens on the leaves, the ghost goat, the hen on the goat's back
 assert.ok(msGagEvents('avia',1,false).some(e=>e.name==='gatxiscle')&&!msGagEvents('avia',0,false).some(e=>e.name==='gatxiscle'));
 assert.ok(msGagEvents('avi',1,false).some(e=>e.name==='bota'));assert.ok(msGagEvents('cabra',1,false).some(e=>e.name==='gallina'));
 // Pol's ghost goat only while the goat is still on the board; with the goat picked the sheet falls on the grandfather, who snores
 assert.ok(msGagEvents('pol',1,false,[]).some(e=>e.name==='campaneta'));assert.ok(msGagEvents('pol',1,false,['cabra']).some(e=>e.name==='aviRonc'));
 // the dinner: the toast and the tablecloth after the fifth episode
 const sopar=msGagEvents('nina',0,true,[]);for(const n of ['plats','brindis','estovalles','riallagrup'])assert.ok(sopar.some(e=>e.name===n&&e.at>MS_PUSH+MS_EP));
 // a recording cut short keeps its length in seconds (the strain ends with the pop)
 const strain=msGagPattern('nina',0,false).find(e=>e.variant==='ninaEsforc');assert.ok(Math.abs(strain.length*MS_STEP-1.5)<1e-6);});

test('the 71 recordings of the masia are on disk, one shot each, normalised, with a credit line and a prompt in CREDITS.md',()=>{
 const zones=SAMPLE_BANK.masiaRec.zones;assert.equal(zones.length,71);assert.equal(SAMPLE_BANK.masiaRec.pitched,false);assert.equal(SAMPLE_BANK.masiaRec.strict,true);
 const credits=read('../dist/assets/samples/CREDITS.md');assert.match(credits,/Estiu a la masia \(EN26, 0\.39\)/);assert.match(credits,/7yhgOGoARG3njMTQXFwa/);
 let bytes=0;for(const z of zones){const f=new URL(z[0],samples);assert.ok(fs.existsSync(f),z[0]);bytes+=fs.statSync(f).size;assert.ok(z[3]>=.5&&z[3]<=5.01,z[0]);assert.equal(z[9],z[0].slice(6,-4));assert.ok(credits.includes('`'+z[0]+'`'),z[0]);}
 assert.ok(bytes<1.4e6,`${bytes} bytes of masia recordings`);
 assert.equal(new Set(zones.map(z=>z[9])).size,71);
 for(const id of MS_CHARS){const f=msFocusSound(id);assert.ok(f&&names('masiaRec').has(f.variant)&&f.len<=2);}});

test('the air of the board by the hour: the dawn chorus, a blackbird over the meadow, the cicadas, the crickets and the frogs of the evening',()=>{
 const nat=names('natureRec');const seen=[];
 for(const h of [0,.2,.4,.6,.8]){const a=msAmbience(h);assert.ok(a.length>=1&&a.length<=2);for(const x of a){assert.ok(nat.has(x.name),x.name);assert.ok(x.level>0&&x.level<=.35&&x.lowpass>=4000);}seen.push(a.map(x=>x.name).join('+'));}
 assert.equal(new Set(seen).size,5);assert.equal(msAmbience(0)[0].name,'dawn');assert.equal(msAmbience(.4)[0].name,'ptCigales');assert.equal(msAmbience(.8)[0].name,'crickets');});

test('a game of the masia: five picks make a round, the fifth effect is the final one (35 s), and a new round starts at dawn',()=>{
 const s={...defaults,mode:2,scanStart:'auto'};const state=createScanState('masia',s);assert.equal(state.round,0);const picked=[];
 for(let k=0;k<5;k++){const opts=scanContent(state,s);assert.ok(opts.length>=1);assert.ok(opts.every(o=>!picked.includes(o.value)));const r=chooseScan(state,s,0);picked.push(opts[0].value);
  assert.equal(r.duration,k===4?MS_FINAL:MS_STEP,`pick ${k+1}`);assert.equal(!!state.pending?.final,k===4,`pick ${k+1} final`);assert.equal(msHour(state.picks.length),k/5);finishScan(state,s);}
 assert.equal(new Set(picked).size,5);assert.equal(state.round,1);assert.equal(state.picks.length,0);assert.equal(msVariant(state.round),1);});

test('0.45.2: the scanning goes left to right over the scene in every round, leaving out the characters already picked',async()=>{
 const {MD}=await import('../dist/masia-decorats.js');const xs=MS_LTR.map(id=>MD.spots[id][0]);assert.deepEqual(xs,[...xs].sort((a,b)=>a-b));assert.equal(new Set(MS_LTR).size,5);
 for(let r=0;r<6;r++){assert.deepEqual(msOptions({round:r,picks:[]},3),[...MS_LTR]);assert.deepEqual(msOptions({round:r,picks:[{value:'pol'}]},3),MS_LTR.filter(x=>x!=='pol'));}});
