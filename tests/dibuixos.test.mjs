// 0.25: Dibuixos que ballen (CE32). One big drawing of a thick line on black at each press: it draws itself, dances on itself to its
// own music for the length of «Durada dels efectes» and stops. Every moment of the drawing (a spoke at the top, a stick on the skin)
// falls on a note. And the «Contrast alt» of Caleidoscopi (CE21): one colour on plain black, big simple forms.
import test from 'node:test';
import assert from 'node:assert/strict';
import {NEW_CAUSES,beginCause,finishCause,retimeCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {DW_ART,DW_KIND,dwRest,dwWalk} from '../dist/dibuixos-art.js';
import {DB_MIN_DURATION,DB_MUSIC,DB_COLORS,dbTimeline,dbMoment,dbPulses,dbScore,dbTune,dbColors,drawDibuixos} from '../dist/dibuixos.js';
import {KALEIDO_MAX_TURN} from '../dist/kaleido-base.js';
import {KALEIDO_CONTRAST_COLORS,kaleidoContrastForm,kaleidoBreaths,kaleidoEvents,drawKaleido} from '../dist/kaleido.js';
import {MUSIC_TRANSPOSE} from '../dist/kaleido-music.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {defaults,validateProfile} from '../dist/input.js';
const settings={...defaults},item=NEW_CAUSES.find(x=>x.id==='drawings'),N=DW_ART.length;
const setup=()=>({item,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
function ctx(){const calls=[],styles=[],gradient={addColorStop(){}};return new Proxy({calls,styles},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push([k,...args.filter(x=>typeof x!=='object')]);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){if(k==='fillStyle'||k==='strokeStyle')styles.push(v);o[k]=v;return true;}});}
const range=inst=>{const z=SAMPLE_BANK[inst].zones.map(x=>x[1]);return [Math.min(...z),Math.max(...z)];};
const parts=art=>{const out=[];const go=p=>{out.push(p);p.kids.forEach(go);};go(art.root);return out;};

test('Dibuixos que ballen is CE32: twenty drawings, recorded music, ten seconds at least, and its own phases',()=>{
 assert.equal(item.code,'CE32');assert.equal(item.kind,'burst');assert.equal(item.ownPhases,true);assert.equal(item.recorded,true);assert.equal(item.variants,20);assert.equal(N,20);assert.equal(DB_MUSIC.length,20);
 assert.equal(item.minDuration,10);assert.equal(DB_MIN_DURATION,10);assert.equal(new Set(DW_ART.map(a=>a.name)).size,20);
 const kinds=DW_ART.map(a=>DW_KIND[a.name]);assert.ok(kinds.every(Boolean));assert.deepEqual([...new Set(kinds)].sort(),['instrument','person','vehicle']);
 for(const k of ['vehicle','instrument'])assert.equal(kinds.filter(x=>x===k).length,7,k);assert.equal(kinds.filter(x=>x==='person').length,6);});

test('the settings: the colour of the line, the speed and «Sense desplaçament», validated; Caleidoscopi «Contrast alt» and its colour',()=>{
 assert.equal(defaults.dbColor,'own');assert.equal(defaults.dbSpeed,'normal');assert.equal(defaults.dbStill,false);assert.equal(defaults.kaleidoContrast,false);assert.equal(defaults.kaleidoColor,'yellow');
 for(const ok of [{dbColor:'yellow'},{dbColor:'red'},{dbColor:'white'},{dbSpeed:'slow'},{dbStill:true},{kaleidoContrast:true},{kaleidoColor:'white'},{kaleidoColor:'blue'}])assert.doesNotThrow(()=>validateProfile({...defaults,...ok}));
 for(const bad of [{dbColor:'#ff0000'},{dbSpeed:'fast'},{dbStill:1},{kaleidoContrast:'yes'},{kaleidoColor:'black'}])assert.throws(()=>validateProfile({...defaults,...bad}),JSON.stringify(bad));});

test('every bar of every tune fills its meter, and each tune has eight bars (A and B)',()=>{for(const [i,spec] of DB_MUSIC.entries()){const tune=dbTune(spec);assert.equal(tune.length,8,`${i}`);assert.equal(spec.prog.length,8);
 tune.forEach((bar,j)=>assert.ok(Math.abs(bar.reduce((a,n)=>a+n.len,0)-spec.meter)<.01,`${DW_ART[i].name} bar ${j+1}`));}});

test('every moment of the drawing falls on a note: one pulse note per moment, at the same time, for every duration, speed and round',()=>{
 for(let i=0;i<N;i++)for(const D of [10,12,15])for(const speed of ['normal','slow'])for(const seed of [0,1,2]){const score=dbScore(i,D,seed,speed),times=dbPulses(i,D,speed),marked=score.filter(e=>e.pulse).map(e=>e.at*D);
  assert.ok(times.length>=2,`${DW_ART[i].name}`);assert.equal(marked.length,times.length,`${DW_ART[i].name} ${D} s ${speed}`);times.forEach((t,k)=>assert.ok(Math.abs(marked[k]-t)<1e-6,`${DW_ART[i].name}: pulse ${k}`));
  const L=dbTimeline(i,D,speed);for(const t of times){const m=dbMoment(t,L,{speed});assert.ok(Math.abs(m.b/DW_ART[i].pulse-Math.round(m.b/DW_ART[i].pulse))<1e-6,'the moment is a whole pulse');}}});

test('a sound answers the press, the dance stops with a struck and plucked chord, and held notes last at most 2.6 s',()=>{
 for(let i=0;i<N;i++)for(const D of [10,15])for(const speed of ['normal','slow']){const score=dbScore(i,D,0,speed),L=dbTimeline(i,D,speed);assert.equal(score[0].at,0);
  assert.ok(L.settleAt<=D-L.fade&&L.settleAt>L.draw);const end=score.filter(e=>Math.abs(e.at*D-L.settleAt)<1e-6);assert.ok(end.length>=2&&end.every(e=>!SAMPLE_BANK[e.inst].sustain),'struck end');
  for(const e of score){assert.ok(e.at>=0&&e.at<1&&e.at+e.length<=1+1e-9);if(SAMPLE_BANK[e.inst].sustain){assert.ok(e.length*D<=2.6,`${e.inst} held ${(e.length*D).toFixed(2)} s`);assert.ok(e.at*D+e.length*D<=L.settleAt+1e-6,'nothing held past the end');}}}});

test('only recorded acoustic instruments, always within reach of their recorded notes in every round',()=>{
 for(let i=0;i<N;i++)for(const D of [10,15])for(const seed of [0,1,2]){for(const e of dbScore(i,D,seed)){const b=SAMPLE_BANK[e.inst];assert.ok(b,e.inst);assert.ok(e.inst.endsWith('Rec'));if(!b.pitched)continue;
  const [lo,hi]=range(e.inst);for(const m of e.midi)assert.ok(m>=lo-5&&m<=hi+5,`${DW_ART[i].name}: ${e.inst} ${m} outside ${lo}–${hi}`);}}
 assert.equal(MUSIC_TRANSPOSE.length,3);});

test('nothing turns faster than one turn every four seconds: wheels, cranks and the pony wheel of the train',()=>{
 for(const [i,art] of DW_ART.entries()){const bps=DB_MUSIC[i].bpm/60;for(const p of parts(art))if(p.spin)assert.ok(p.spin*bps<=Math.PI/2+1e-9,`${art.name}: ${(p.spin*bps).toFixed(2)} rad/s`);}});

test('every drawing draws with finite geometry in every colour, base, decor, speed, «Sense desplaçament» and reduced motion',()=>{
 for(let i=0;i<N;i++)for(const t of [0,.3,1.2,2.5,4.9,8.6,9.5])for(const o of [{},{base:'white'},{background:'full'},{background:'dim',opacity:40},{base:'white',background:'full'},{still:true},{reduced:true},{speed:'slow'},{color:'yellow'},{color:'red'},{color:'white',base:'white'},{preview:true}]){
  const c=ctx();const drawn=drawDibuixos(c,1024,768,{index:i,t,duration:10,base:'black',background:'none',opacity:25,color:'own',speed:'normal',...o});assert.equal(drawn,true);if(t>0)assert.ok(c.calls.length>(t<1?3:10),`${DW_ART[i].name} at ${t}`);}
 assert.equal(drawDibuixos(ctx(),1024,768,{index:0,t:10,duration:10}),false);});

test('the colour of the line: each drawing’s own two colours, or one colour for the whole drawing; on white, white turns dark',()=>{
 for(const art of DW_ART){assert.deepEqual(dbColors(art,'own',false),art.colors);assert.deepEqual(dbColors(art,'yellow',false),[DB_COLORS.yellow,DB_COLORS.yellow]);assert.deepEqual(dbColors(art,'red',true),[DB_COLORS.red,DB_COLORS.red]);
  assert.ok(dbColors(art,'white',true).every(c=>c!=='#ffffff'));assert.ok(dbColors(art,'own',true).every(c=>c!=='#ffffff'));}
 const c=ctx();drawDibuixos(c,1024,768,{index:1,t:4,duration:10,color:'red',base:'black',background:'none'});assert.ok(c.styles.filter(x=>x!=='rgba(255,255,255,.55)').every(x=>x===DB_COLORS.red),'one colour only');});

test('«Sense desplaçament»: the movement of the whole drawing (hops, sways, swings) is left out and only its parts move',()=>{
 const points=(art,m,still)=>{const out=[];dwWalk(art,m,still,pts=>out.push(...pts.map(p=>p.map(v=>+v.toFixed(6)))),(x,y,r)=>out.push([+x.toFixed(6),+y.toFixed(6),+r.toFixed(6)]));return JSON.stringify(out);};
 for(const art of DW_ART){let moved=false;for(const b of [.5,1.3,2.25,3.5,7.1]){const m={b,e:1,u:1};assert.equal(points(art,m,true),points({...art,move:null},m,false),art.name);if(points(art,m,true)!==points(art,m,false))moved=true;}
  assert.ok(moved,`${art.name}: the whole drawing moves when it may`);
  let parts=false;for(const b of [.5,1.3,2.25,3.5,7.1])if(points(art,{b,e:1,u:1},true)!==points(art,{b:0,e:0,u:1},true))parts=true;assert.ok(parts,`${art.name}: its parts move without displacement`);}});

test('the speed is kept from the press: the music and the dance stay together when the setting changes during a drawing',()=>{
 const g=setup();beginCause(g,{...settings,dbSpeed:'slow'});assert.equal(g.dbSpeed,'slow');assert.equal(g.duration,Math.max(10,settings.duration));
 const slow=JSON.stringify(dbScore(g.variant,g.duration,g.completed,'slow'));assert.equal(JSON.stringify(g.score),slow);
 g.time=2;assert.equal(retimeCause(g,{...settings,dbSpeed:'normal'},15),true);assert.equal(JSON.stringify(g.score),JSON.stringify(dbScore(g.variant,15,g.completed,'slow')));
 finishCause(g,settings);beginCause(g,settings);assert.equal(g.dbSpeed,'normal');assert.equal(g.variant,1);});

test('the card shows a drawing dancing with its surroundings; nothing is drawn before the first press or after the drawing ends',()=>{
 const card=ctx();renderExtraCause(card,400,300,'drawings',setup(),settings,true);assert.ok(card.calls.length>30);
 const g=setup(),none=ctx();renderExtraCause(none,1024,768,'drawings',g,settings);assert.equal(none.calls.length,0);
 beginCause(g,settings);g.time=3;const live=ctx();renderExtraCause(live,1024,768,'drawings',g,{...settings,dbStill:true,dbColor:'yellow'});assert.ok(live.calls.length>30);
 finishCause(g,settings);const after=ctx();renderExtraCause(after,1024,768,'drawings',g,settings);assert.equal(after.calls.length,0);});

test('Caleidoscopi «Contrast alt»: never more than five stripe pairs, simple forms of five families, one colour on plain black',async()=>{
 const kinds=new Set();for(let i=0;i<20;i++){const f=kaleidoContrastForm(i);kinds.add(f.kind);assert.ok(f.n>=1&&f.n<=6);
  const pairs=f.kind==='rings'||f.kind==='petals'?f.n:f.kind==='star'?f.points:f.kind==='dots'?f.dots:f.n;assert.ok(pairs<=5,`pattern ${i+1}: ${pairs} stripe pairs`);}
 assert.equal(kinds.size,5);
 for(const [name,color] of Object.entries(KALEIDO_CONTRAST_COLORS))for(let i=0;i<20;i++)for(const t of [0,.2,1,3,6,9.5]){const c=ctx();drawKaleido(c,1024,768,{index:i,t,duration:10,reduced:false,base:'black',background:'none',opacity:25,seed:0,contrast:color});
  assert.ok(!c.calls.some(x=>x[0].startsWith('create')),'no gradients');assert.ok(c.styles.every(x=>x===color),`${name}: one colour`);}
 globalThis.Image??=class{set src(v){queueMicrotask(()=>this.onerror?.());}};const {background}=await import('../dist/art.js');
 for(const [base,bg] of [['white','none'],['white','full'],['black','full'],['black','dim']]){const c=ctx();background(c,800,600,'kaleido',{...settings,base,background:bg,opacity:60,kaleidoContrast:true});
  assert.deepEqual(c.styles,['#000']);assert.ok(!c.calls.some(x=>x[0].startsWith('create')),'plain black');}});

test('Caleidoscopi «Contrast alt»: it turns at most once every sixteen seconds and breathes at most once every 0.7 s, never with light',()=>{
 for(let i=0;i<20;i++){const turns=[];for(const t of [3,3.5]){const c=ctx();drawKaleido(c,1024,768,{index:i,t,duration:10,reduced:false,base:'black',background:'none',opacity:25,seed:0,contrast:'#ffd400'});turns.push(c.calls.find(x=>x[0]==='rotate')[1]);}
  const rate=Math.abs(turns[1]-turns[0])/.5;assert.ok(rate<=KALEIDO_MAX_TURN/4+1e-9,`pattern ${i+1}: ${rate.toFixed(3)} rad/s`);
  for(const D of [8,10,15]){const b=kaleidoBreaths(kaleidoEvents(i,D));for(let k=1;k<b.length;k++)assert.ok(b[k]-b[k-1]>=.7-1e-9);}}});
