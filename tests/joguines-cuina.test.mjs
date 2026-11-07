// 0.26: Joguines que ballen (CE33) and La cuina que balla (CE34), two collections of twenty drawings each in the style of Dibuixos que
// ballen (CE32), drawn, danced and composed by the same engine (dibuixos.js) with their own drawings and music.
import test from 'node:test';
import assert from 'node:assert/strict';
import {NEW_CAUSES,beginCause,finishCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {dwWalk} from '../dist/dibuixos-art.js';
import {DB_SET,DB_MIN_DURATION,dbTimeline,dbMoment,dbPulses,dbScore,dbTune,drawDibuixos} from '../dist/dibuixos.js';
import {JG_SET} from '../dist/joguines.js';
import {CN_SET} from '../dist/cuina.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {defaults} from '../dist/input.js';
const settings={...defaults},SETS=[['toys','CE33',JG_SET],['kitchen','CE34',CN_SET]];
function ctx(){const calls=[],styles=[],gradient={addColorStop(){}};return new Proxy({calls,styles},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push([k,...args.filter(x=>typeof x!=='object')]);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){if(k==='fillStyle'||k==='strokeStyle')styles.push(v);o[k]=v;return true;}});}
const range=inst=>{const z=SAMPLE_BANK[inst].zones.map(x=>x[1]);return [Math.min(...z),Math.max(...z)];};
const parts=art=>{const out=[];const go=p=>{out.push(p);p.kids.forEach(go);};go(art.root);return out;};

test('two new activities, CE33 and CE34: twenty drawings each, recorded music, ten seconds at least, after Dibuixos que ballen',()=>{
 const ids=NEW_CAUSES.map(x=>x.id);assert.deepEqual(ids.slice(ids.indexOf('drawings')),['drawings','toys','kitchen']);
 for(const [id,code,set] of SETS){const item=NEW_CAUSES.find(x=>x.id===id);assert.equal(item.code,code);assert.equal(set.id,id);assert.equal(item.kind,'burst');assert.equal(item.ownPhases,true);assert.equal(item.recorded,true);
  assert.equal(item.variants,20);assert.equal(set.art.length,20);assert.equal(set.music.length,20);assert.equal(set.loud.length,20);assert.equal(item.minDuration,DB_MIN_DURATION);
  assert.equal(new Set(set.art.map(a=>a.name)).size,20);assert.ok(set.loud.every(d=>Math.abs(d)<=4));for(const a of set.art)assert.ok(a.colors.length===2&&a.pulse>=1&&a.env,a.name);}
 const names=[DB_SET,JG_SET,CN_SET].flatMap(s=>s.art.map(a=>a.name));assert.equal(new Set(names).size,60,'no drawing appears twice');});

test('every bar of every tune fills its meter, eight bars each, and the moments of each drawing fit its meter',()=>{
 for(const [,,set] of SETS)for(const [i,spec] of set.music.entries()){const tune=dbTune(spec),name=set.art[i].name;assert.equal(tune.length,8,name);assert.equal(spec.prog.length,8,name);
  tune.forEach((bar,j)=>assert.ok(Math.abs(bar.reduce((a,n)=>a+n.len,0)-spec.meter)<.01,`${name} bar ${j+1}`));
  const p=set.art[i].pulse;assert.ok(spec.meter%p===0||p%spec.meter===0,`${name}: a pulse of ${p} in a bar of ${spec.meter}`);}});

test('every moment of the drawing falls on a note, for every duration, speed and round',()=>{
 for(const [,,set] of SETS)for(let i=0;i<20;i++)for(const D of [10,15])for(const speed of ['normal','slow'])for(const seed of [0,1]){const name=set.art[i].name,score=dbScore(i,D,seed,speed,set),times=dbPulses(i,D,speed,set),marked=score.filter(e=>e.pulse).map(e=>e.at*D);
  assert.ok(times.length>=2,name);assert.equal(marked.length,times.length,`${name} ${D} s ${speed}`);times.forEach((t,k)=>assert.ok(Math.abs(marked[k]-t)<1e-6,`${name}: pulse ${k}`));
  const L=dbTimeline(i,D,speed,set);for(const t of times){const m=dbMoment(t,L,{speed});assert.ok(Math.abs(m.b/set.art[i].pulse-Math.round(m.b/set.art[i].pulse))<1e-6,`${name}: the moment is a whole pulse`);}}});

test('a sound answers the press, the dance stops with a struck and plucked chord, held notes last at most 2.6 s, recorded instruments in reach',()=>{
 for(const [,,set] of SETS)for(let i=0;i<20;i++)for(const D of [10,15])for(const speed of ['normal','slow']){const name=set.art[i].name,score=dbScore(i,D,0,speed,set),L=dbTimeline(i,D,speed,set);assert.equal(score[0].at,0);
  const end=score.filter(e=>Math.abs(e.at*D-L.settleAt)<1e-6);assert.ok(end.length>=2&&end.every(e=>!SAMPLE_BANK[e.inst].sustain),`${name}: struck end`);
  for(const e of score){const b=SAMPLE_BANK[e.inst];assert.ok(b&&e.inst.endsWith('Rec'),e.inst);assert.ok(e.at>=0&&e.at<1&&e.at+e.length<=1+1e-9);
   if(b.sustain){assert.ok(e.length*D<=2.6,`${name}: ${e.inst} held ${(e.length*D).toFixed(2)} s`);assert.ok(e.at*D+e.length*D<=L.settleAt+1e-6,'nothing held past the end');}
   if(b.pitched){const [lo,hi]=range(e.inst);for(const m of e.midi)assert.ok(m>=lo-5&&m<=hi+5,`${name}: ${e.inst} ${m} outside ${lo}–${hi}`);}}}});

test('a cartoon noise or a cymbal can wait for its own bar: the big pop of the popcorn and the bun of the burger on the fourth bar',()=>{
 for(const name of ['popcorn','burger']){const i=CN_SET.art.findIndex(a=>a.name===name),spec=CN_SET.music[i],L=dbTimeline(i,15,'normal',CN_SET),bar=L.beat*spec.meter;
  const hits=dbScore(i,15,0,'normal',CN_SET).filter(e=>e.inst==='cymbalRec').map(e=>Math.round(((e.at*15-L.draw)/bar-1/spec.meter)*1e6)/1e6);
  assert.ok(hits.length>=1,name);for(const h of hits)assert.equal(h%4,3,`${name}: the cymbal on bar ${h}`);}});

test('nothing turns faster than one turn every four seconds',()=>{
 for(const [,,set] of SETS)for(const [i,art] of set.art.entries()){const bps=set.music[i].bpm/60;for(const p of parts(art))if(p.spin)assert.ok(p.spin*bps<=Math.PI/2+1e-9,`${art.name}: ${(p.spin*bps).toFixed(2)} rad/s`);}});

test('every drawing draws with finite geometry in every colour, base, decor, speed, «Sense desplaçament» and reduced motion',()=>{
 for(const [,,set] of SETS)for(let i=0;i<20;i++)for(const t of [0,.4,1.3,2.6,5.1,8.7,9.6])for(const o of [{},{base:'white',background:'full'},{background:'full'},{background:'dim',opacity:40},{still:true},{reduced:true},{speed:'slow'},{color:'yellow'},{color:'white',base:'white'},{preview:true}]){
  const c=ctx();assert.equal(drawDibuixos(c,1024,768,{index:i,t,duration:10,base:'black',background:'none',opacity:25,color:'own',speed:'normal',set,...o}),true);if(t>0)assert.ok(c.calls.length>(t<1?3:10),`${set.art[i].name} at ${t}`);}});

test('«Sense desplaçament»: the movement of the whole drawing is left out, and the parts of every drawing still dance',()=>{
 const points=(art,m,still)=>{const out=[];dwWalk(art,m,still,pts=>out.push(...pts.map(p=>p.map(v=>+v.toFixed(6)))),(x,y,r)=>out.push([+x.toFixed(6),+y.toFixed(6),+r.toFixed(6)]));return JSON.stringify(out);};
 for(const [,,set] of SETS)for(const art of set.art){for(const b of [.5,1.3,2.25,3.5,7.1]){const m={b,e:1,u:1};assert.equal(points(art,m,true),points({...art,move:null},m,false),art.name);}
  let moving=false;for(const b of [.5,1.3,2.25,3.5,7.1])if(points(art,{b,e:1,u:1},true)!==points(art,{b:0,e:0,u:1},true))moving=true;assert.ok(moving,`${art.name}: its parts move without displacement`);}});

test('the card shows a drawing dancing; nothing is drawn before the first press or after the drawing ends; the speed is kept from the press',()=>{
 for(const [id,,set] of SETS){const item=NEW_CAUSES.find(x=>x.id===id),setup=()=>({item,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
  const card=ctx();renderExtraCause(card,400,300,id,setup(),settings,true);assert.ok(card.calls.length>30,id);
  const g=setup(),none=ctx();renderExtraCause(none,1024,768,id,g,settings);assert.equal(none.calls.length,0);
  beginCause(g,{...settings,dbSpeed:'slow'});assert.equal(g.dbSpeed,'slow');assert.equal(JSON.stringify(g.score),JSON.stringify(dbScore(g.variant,g.duration,g.completed,'slow',set)));
  g.time=3;const live=ctx();renderExtraCause(live,1024,768,id,g,{...settings,dbStill:true,dbColor:'red'});assert.ok(live.calls.length>30);
  finishCause(g,settings);const after=ctx();renderExtraCause(after,1024,768,id,g,settings);assert.equal(after.calls.length,0);beginCause(g,settings);assert.equal(g.variant,1);}});
