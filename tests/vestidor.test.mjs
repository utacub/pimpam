// El vestidor fantàstic (EN06, rebuilt in 0.73): a variety-theatre dressing room. Four artists take turns; each picks a hat, a body, the
// feet and (with four pieces) a magic object from the wardrobe; every piece flies on with its sound and its gag, Pipa copies it, and with
// the last one the wall rises and the artist does a number on the stage. These tests cover the model (options, slips, the timeline), the
// scanning flow, the sound (every note in a bank that has it, every event inside its effect) and the drawing (finite coordinates, with and
// without the decor), plus the wiring in the app, the build, the dictionaries and the credits.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {VS_ARTISTS,VS_COSTUMES,VS_OBJECTS,VS_SLOTS,VS_WORD,VS_NAME,VS_NUMBER,VS_STEP,VS_SLIP,VS_FLY,vsSteps,vsSlots,vsSlotOf,vsRoundOf,vsOptions,vsPicks,vsSlip,vsMirror,vsTimes,vsTimeline,vsNumber,vsPair,vsBackdrop} from '../dist/vestidor.js';
import {VS_INST,VS_SFX,vsStepScore,vsFinalScore,vsPattern,vsTaste,vsAmbience} from '../dist/vestidor-so.js';
import {VS_BOX} from '../dist/vestidor-dades.js';
import {vsLayout} from '../dist/vestidor-art.js';
import {SCAN_ACTIVITIES,createScanState,scanChoices,scanContent,chooseScan,finishScan} from '../dist/scan-catalog.js';
import {renderScanActivity} from '../dist/scan-art.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {defaults,validateProfile} from '../dist/input.js';
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
const S=(o={})=>validateProfile({...defaults,...o});
const SETTINGS=[S(),S({vsSteps:'3'}),S({vsDespistes:false}),S({vsNumber:'curt'}),S({vsNumber:'llarg'}),S({vsFirst:'quim',scanOptions:2}),S({scanOptions:4,vsFirst:'ona'})];
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${String(k)}: non-finite coordinate`);calls.push(k);return String(k).startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}

test('the row: EN06, creative, recorded, one-word labels for every piece, a long name for each',()=>{
 const row=SCAN_ACTIVITIES.find(a=>a.id==='vestidor');assert.ok(row);assert.equal(row.code,'EN06');assert.equal(row.name,'El vestidor fantàstic');assert.equal(row.task,'creative');assert.equal(row.recorded,true);
 assert.ok(!SCAN_ACTIVITIES.some(a=>a.id==='dress'),'the old activity stays out');
 for(const slot of VS_SLOTS){const fam=slot==='objecte'?VS_OBJECTS:VS_COSTUMES;assert.equal(Object.keys(VS_WORD[slot]).length,6);for(const id of fam){assert.match(VS_WORD[slot][id],/^[^\s]+$/,`${slot} ${id}: one word`);assert.ok(VS_NAME[slot][id],`${slot} ${id}: a long name`);}}
 assert.equal(new Set(VS_COSTUMES.map(id=>VS_WORD.cap[id])).size,6);assert.equal(new Set(VS_COSTUMES.map(id=>VS_WORD.peus[id])).size,6);});

test('the rounds: four artists in turn from «Primer artista», three lights, the four together every fourth show',()=>{
 for(const first of VS_ARTISTS){const s=S({vsFirst:first});const order=[0,1,2,3].map(r=>vsRoundOf(r,s).artist);assert.equal(order[0],first);assert.equal(new Set(order).size,4);assert.equal(vsRoundOf(4,s).artist,first);}
 const s=S();assert.deepEqual([0,1,2,3,4,5,6,7].map(r=>vsRoundOf(r,s).group),[false,false,false,true,false,false,false,true]);assert.deepEqual([0,1,2,3].map(r=>vsRoundOf(r,s).light),['tarda','vespre','nit','tarda']);});

test('the options: between two and four different pieces of the right family, changing from round to round',()=>{
 for(const s of SETTINGS){const n=Math.max(2,Math.min(4,s.scanOptions));for(let round=0;round<12;round++){const st={round,stage:0,picks:[]};
  for(let stage=0;stage<vsSteps(s);stage++){st.stage=stage;const slot=vsSlotOf(st,s),opts=vsOptions(st,s),fam=slot==='objecte'?VS_OBJECTS:VS_COSTUMES;assert.equal(opts.length,n);assert.equal(new Set(opts).size,n);for(const o of opts)assert.ok(fam.includes(o),`${slot} ${o}`);st.picks.push({value:opts[0]});}}}
 const s=S(),seen=new Set();for(let r=0;r<6;r++)seen.add(vsOptions({round:r,stage:0,picks:[]},s).join());assert.ok(seen.size>=4,'the offer changes');
 assert.deepEqual(vsSlots(S({vsSteps:'3'})),['cap','cos','peus']);assert.deepEqual(vsSlots(S()),['cap','cos','peus','objecte']);});

test('the slips («Despistes»): about one pick in three, never two in a row, never the object, and none when the setting is off',()=>{
 const s=S();let hits=0,total=0;for(let r=0;r<60;r++){let prev=null;for(let st=0;st<4;st++){const h=vsSlip(r,st,s);total++;if(h)hits++;if(st===3)assert.equal(h,null,'never the object');if(h)assert.ok(!prev,'never twice in a row');if(h)assert.equal(h,st===0?'peus':'cap');prev=h;}}
 assert.ok(hits/total>.12&&hits/total<.34,`${hits}/${total}`);
 const off=S({vsDespistes:false});for(let r=0;r<20;r++)for(let st=0;st<4;st++)assert.equal(vsSlip(r,st,off),null);
 for(let r=0;r<8;r++)for(let st=0;st<3;st++){const m=vsMirror(r,st,s,'pirata');assert.ok(m.kind==='ganyota'||(m.kind==='peca'&&m.id!=='pirata'));}});

test('the times: a step of 5 s (6.6 with a slip), and every show, with the group bow and a slip, under 36 s',()=>{
 for(const s of SETTINGS)for(let round=0;round<8;round++)for(let stage=0;stage<vsSteps(s);stage++){const st={round,stage,picks:[]},T=vsTimes(s,st),slip=vsSlip(round,stage,s);
  assert.equal(T.step,VS_STEP+(slip?VS_SLIP:0));const TL=vsTimeline(s,round,slip?VS_SLIP:0);assert.equal(T.final,TL.end);assert.ok(TL.end<=36,`${TL.end}`);
  assert.ok(TL.put<TL.up&&TL.up<=TL.num&&TL.num<TL.numEnd&&TL.numEnd<TL.bow&&TL.bow<=TL.groupStart&&TL.groupEnd<TL.close&&TL.close<TL.end);assert.ok(Math.abs(TL.numEnd-TL.num-VS_NUMBER[s.vsNumber])<1e-9);}
 const longest=vsTimeline(S({vsNumber:'llarg'}),3,VS_SLIP);assert.ok(longest.group&&longest.end<=36&&longest.end>34);});

test('the number: the pieces decide the walk, the move, the magic and the backdrop; the twelve pairs have their surprise',()=>{
 const P={cap:'pirata',cos:'reialesa',peus:'bus',objecte:'paraigua'},nb=vsNumber(P);assert.deepEqual([nb.head,nb.body,nb.feet,nb.object,nb.full],['pirata','reialesa','bus','paraigua',null]);assert.equal(nb.pair,'planeja','the umbrella with the flippers glides (the first pair wins)');assert.equal(vsPair({...P,peus:'pirata'}),'vela');assert.equal(vsBackdrop(P),5);
 assert.equal(vsNumber({cap:'bus',cos:'bus',peus:'bus',objecte:null}).full,'bus');let pairs=new Set();
 for(const cap of VS_COSTUMES)for(const cos of VS_COSTUMES)for(const peus of VS_COSTUMES)for(const objecte of VS_OBJECTS){const p=vsPair({cap,cos,peus,objecte});if(p)pairs.add(p);}assert.equal(pairs.size,12);});

test('the scanning flow: each pick a step of its own length, the last one the show, then the next artist',()=>{
 for(const s of [S(),S({vsSteps:'3'})]){const st=createScanState('vestidor',s);st.armed=true;const n=vsSteps(s);
  for(let round=0;round<2;round++){assert.equal(st.round,round);for(let i=0;i<n;i++){const ch=scanChoices(st,s),content=scanContent(st,s);assert.ok(content.length>=2);for(const c of content){assert.match(c.label,/^[^\s]+$/);assert.equal(c.kind,'vestidor');}
   const k=ch.findIndex(c=>!c.action),T=vsTimes(s,st),r=chooseScan(st,s,k);assert.ok(r.accepted&&st.pending.correct,'every piece is good');assert.equal(!!st.pending.final,i===n-1);assert.equal(r.duration,i===n-1?T.final:T.step);finishScan(st,s);}}}});

test('the sound: every note in a bank that has it, every event inside its effect, the band grows with the outfit',()=>{
 const zones=bank=>SAMPLE_BANK[bank].zones,variants=bank=>new Set(zones(bank).map(z=>z[9]));
 const check=(ev,D,label)=>{assert.ok(ev.length>0,label);for(const e of ev){const b=SAMPLE_BANK[e.inst];assert.ok(b,`${label}: ${e.inst}`);assert.ok(e.t>=0&&e.t<D,`${label}: ${e.inst} at ${e.t}`);assert.ok(e.vel>0&&e.vel<=1);assert.ok(e.len>0);
  if(b.pitched){const ns=zones(e.inst).map(z=>z[1]);for(const m of e.midi)assert.ok(m>=Math.min(...ns)-4&&m<=Math.max(...ns)+4,`${label}: ${e.inst} ${m}`);}else assert.ok(variants(e.inst).has(e.variant),`${label}: ${e.inst} ${e.variant}`);}};
 for(const s of SETTINGS)for(let round=0;round<5;round++){const st={round,stage:0,picks:[]};for(let stage=0;stage<vsSteps(s);stage++){st.stage=stage;const opts=vsOptions(st,s);for(const id of opts){const picks=vsPicks(st,s,id),slip=vsSlip(round,stage,s)?VS_SLIP:0;
   if(stage<vsSteps(s)-1){const ev=vsStepScore(s,round,stage,picks,id);check(ev,VS_STEP+slip,`step ${round}/${stage} ${id}`);assert.ok(ev.some(e=>e.inst==='vestidorVeu'),'the artist says something');}
   else{const TL=vsTimeline(s,round,slip),ev=vsFinalScore(s,round,stage,picks,id);check(ev,TL.end,`show ${round} ${id}`);assert.ok(ev.some(e=>e.variant===vsRoundOf(round,s).artist+'Tada'),'ta-da');assert.ok(ev.some(e=>e.variant==='ovacio'));
    const pat=vsPattern(ev,TL.end);for(const p of pat)assert.ok(p.at>=0&&p.at<1&&p.at+p.length<=1+1e-9);}}
   st.picks.push({value:opts[0]});}}
 // one more costume, one more instrument
 const s=S({vsDespistes:false}),a=vsStepScore(s,0,0,{cap:'pirata',cos:null,peus:null,objecte:null},'pirata'),b=vsStepScore(s,0,1,{cap:'pirata',cos:'ballarina',peus:null,objecte:null},'ballarina');
 assert.ok(a.some(e=>e.inst===VS_INST.pirata)&&!a.some(e=>e.inst===VS_INST.ballarina));assert.ok(b.some(e=>e.inst===VS_INST.ballarina));
 for(const slot of VS_SLOTS)for(const id of slot==='objecte'?VS_OBJECTS:VS_COSTUMES){const t=vsTaste(slot,id);assert.ok(t.length);check(t,1.3,`taste ${slot} ${id}`);}
 assert.equal(vsAmbience('nit')[0].name,'murmuri');assert.ok(variants('natureRec').has('murmuri')&&variants('natureRec').has('vaixell'));
 for(const k of Object.keys(VS_SFX))assert.ok(variants('vestidorRec').has(k),k);
 for(const who of VS_ARTISTS)for(const v of ['Tada','Ooh','Uau','Rialleta','Ups','Esforc','Oh','Iupi','Riure'])assert.ok(variants('vestidorVeu').has(who+v),who+v);});

test('the recordings: every file on disk, strict banks, credited with the unverified rights of ElevenLabs',()=>{
 const credits=read('../dist/assets/samples/CREDITS.md');assert.match(credits,/## El vestidor fantàstic \(EN06, 0\.73\)/);assert.match(credits,/no s’han verificat/);
 for(const bank of ['vestidorRec','vestidorVeu']){const b=SAMPLE_BANK[bank];assert.equal(b.strict,true);assert.equal(b.fallback,null);for(const z of b.zones){assert.ok(fs.existsSync(new URL('../dist/assets/samples/'+z[0],import.meta.url)),z[0]);assert.ok(credits.includes(z[0].split('/').pop()),z[0]);}}});

test('the drawing: board and effects with finite coordinates, with and without the decor, at any size',()=>{
 const item={id:'vestidor'};for(const s of [S(),S({background:'none'}),S({background:'dim',scanOptions:4}),S({vsSteps:'3',scanOptions:2})])for(const [w,h] of [[1280,720],[800,1280],[320,180]])for(let round=0;round<4;round++){
  const st=createScanState('vestidor',s);st.round=round;st.armed=true;
  let c=ctx();renderScanActivity(c,w,h,'vestidor',{item,scanState:st,time:null,board:{focus:0,lights:[1,.6,.6,.6],clock:2.5},vsMade:{}},s);assert.ok(c.calls.length>10);
  const zones=vsLayout(st,scanContent(st,s),w,h);for(const z of zones){assert.ok(z.x>=0&&z.y>=0&&z.x+z.w<=w+1&&z.y+z.h<=h+1,'cards on the screen');}
  for(let stage=0;stage<vsSteps(s);stage++){const opts=scanContent(st,s);st.pending={option:opts[0],correct:true,final:stage===vsSteps(s)-1};st.status='effect';const T=vsTimes(s,st),D=st.pending.final?T.final:T.step;
   for(const t of [0,.4,VS_FLY+.1,2,D*.5,D*.8,D-.1]){c=ctx();renderScanActivity(c,w,h,'vestidor',{item,scanState:st,time:t,board:{lights:[1,1,1,1],clock:t},vsMade:{}},s);}
   st.picks.push(opts[0]);st.stage=st.picks.length;st.pending=null;st.status='choose';}}
 const card=ctx();renderScanActivity(card,320,180,'vestidor',{item,scanState:null,time:null},S(),true);assert.ok(card.calls.length>5);
 assert.ok(Object.keys(VS_BOX).length>300);});

test('the wiring: the folder, the settings, the loading, the sound, the build, the dictionaries and the home card',()=>{
 const app=read('../dist/app.js'),build=read('../build_standalone.py'),input=read('../dist/input.js');
 assert.match(app,/ids:\[[^\]]*'vehicles','vestidor'\]/);assert.match(app,/LOAD_HEAVY=\[[^\]]*'vestidor'/);assert.match(app,/if\(id==='vestidor'\)out\.push\(vsSettings\(\)\)/);
 for(const name of ['vsSettings','vsAirUpdate','vsAirStop'])assert.match(app,new RegExp(`function ${name}\\(`),name);assert.match(app,/vsAirStop\(\);ringStyle\(\)/);
 assert.match(app,/game\.vsMade\|\|\(game\.vsMade=\{\}\)\)\[state\.round\]=picks/);
 assert.match(build,/'vestidor-dades\.js','vestidor\.js','vestidor-gags\.js','vestidor-motor\.js','vestidor-art\.js','vestidor-so\.js'/);assert.match(build,/const VS_IMAGES=null;/);
 assert.match(input,/vsSteps:'4',vsDespistes:true,vsFirst:'rita',vsNumber:'normal'/);assert.throws(()=>validateProfile({...defaults,vsSteps:'5'}));assert.throws(()=>validateProfile({...defaults,vsFirst:'nil'}));
 assert.ok(fs.existsSync(new URL('../production/info/cards/vestidor.jpg',import.meta.url)));assert.match(read('../production/info/make_info.py'),/'bubbles','vestidor'\]/);
 const ca=read('../i18n/ui-ca.tsv');for(const l of ['es','eu','gl','en','fr']){const tr=read(`../i18n/ui-${l}.tsv`);for(const text of ['Peces per artista','Despistes','Botes-lunars','Què es posa al cap?']){const id=ca.split('\n').find(x=>x.endsWith('\t'+text)).split('\t')[0];assert.ok(tr.includes(id+'\t'),`${l} ${text}`);}}});
