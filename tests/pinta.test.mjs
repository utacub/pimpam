// Pinta el món (EN25, 0.38): the first free-exploration scanning board. Twenty ink pages (five landscapes in four seasons) whose six
// zones join the scanning; the picked zone fills with watercolour and gets its voice, its gag and its ambience; a full page turns.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PT_SHEET,PT_ZONES,PT_LANDS,PT_SEASONS,ptPage,PT_PAINT,PT_STEP,PT_FINAL,PT_TURN,ptOrder,ptOptions,ptWord,ptPalette,ptPatternScore,ptTaste,ptPiece} from '../dist/pinta.js';
import {PT_GAG,ptGagSounds,ptAmbience} from '../dist/pinta-gags.js';
import {ptTerra,ptMap,ptLayout} from '../dist/pinta-art.js';
import {pintaDraw,pintaPrewarm} from '../dist/pinta-gl.js';
import {SCAN_ACTIVITIES,createScanState,scanContent,scanPrompt,chooseScan,finishScan} from '../dist/scan-catalog.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {defaults} from '../dist/input.js';
const base={...defaults};
const samples=new URL('../dist/assets/samples/',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
const PLUCKED=['harpRec','celliPizzRec','glockRec','guitarRec','marimbaRec','uduRec','woodblockRec'];

test('EN25 is the tenth scanning activity (before EN26, 0.39): a creative board whose page has six zones, a step of a few seconds and a final of 16 s at most',()=>{
 const row=SCAN_ACTIVITIES.find(a=>a.id==='pinta');
 assert.ok(row);assert.equal(row.code,'EN25');assert.equal(row.scene,'pinta');assert.equal(row.task,'creative');assert.equal(SCAN_ACTIVITIES.at(-2),row);
 assert.equal(PT_ZONES.length,6);assert.equal(PT_LANDS.length,5);assert.equal(PT_SEASONS.length,4);assert.deepEqual([...PT_SHEET],[1280,800]);
 assert.ok(PT_PAINT<PT_STEP&&PT_STEP<PT_FINAL&&PT_FINAL<=16&&PT_TURN>0&&PT_TURN<PT_FINAL-PT_PAINT,'the step, the final and the turn of the page');
 assert.match(read('../dist/scan-catalog.js'),/pinta:\{wrong:[\d.]+,final:PT_FINAL,step:PT_STEP\}/);
});

test('twenty pages: every landscape meets every season once, and two pages in a row share neither',()=>{
 const seen=new Set();
 for(let r=0;r<20;r++){const p=ptPage(r);seen.add(p.land*4+p.season);if(r){const q=ptPage(r-1);assert.notEqual(p.land,q.land,`page ${r}`);assert.notEqual(p.season,q.season,`page ${r}`);}}
 assert.equal(seen.size,20);assert.equal(ptPage(20).land,0);assert.equal(ptPage(20).season,0);assert.equal(ptPage(-3).round,0);
});

test('the zones come round in a different order each page, and the options are the unpainted ones, two to four at a time',()=>{
 const orders=new Set();
 for(let r=0;r<40;r++){const o=ptOrder(r);assert.deepEqual([...o].sort(),[...PT_ZONES].sort(),`page ${r}: all six`);orders.add(o.join());}
 assert.ok(orders.size>=6,'several orders');
 for(const n of [2,3,4]){let picks=[];
  for(let k=0;k<6;k++){const opts=ptOptions({round:3,picks},n);assert.equal(opts.length,Math.min(n,6-k),`${n} options, ${k} painted`);
   assert.ok(opts.every(z=>!picks.some(p=>p.value===z)),'only unpainted zones');picks=[...picks,{value:opts[0]}];}
  assert.deepEqual(ptOptions({round:3,picks},n),[]);}
 assert.equal(ptOptions({round:0,picks:[]},0).length,3,'three by default');
});

test('every zone is one spoken word, capitalised, without its article: nothing is written on the board',()=>{
 for(let land=0;land<5;land++)for(const z of PT_ZONES){const w=ptWord(land,z);assert.match(w,/^[^\s]+$/,w);assert.equal(w,w.charAt(0).toUpperCase()+w.slice(1));assert.ok(w.length>=2);}
 assert.deepEqual(PT_ZONES.map(z=>ptWord(0,z)),['Cel','Muntanyes','Riu','Bosc','Poble','Camps']);
 for(const f of ['pinta-art.js','pinta-vida.js','pinta-gags.js','pinta-eines.js'])assert.doesNotMatch(read('../dist/'+f),/fillText|strokeText/,`${f} writes no words`);
});

test('through the catalogue: the page’s words are offered, a pick paints and advances, the sixth pick is final and turns the page',()=>{
 const s={...base,scanOptions:3};const state=createScanState('pinta',s);
 const c=scanContent(state,s);assert.equal(c.length,3);for(const x of c){assert.ok(PT_ZONES.includes(x.value),x.value);assert.match(x.label,/^[^\s]+$/);}
 assert.match(String(scanPrompt(state,s)),/pint/i);
 const painted=[];
 for(let k=0;k<6;k++){const opts=scanContent(state,s);assert.equal(opts.length,Math.min(3,6-k));const r=chooseScan(state,s,0);painted.push(opts[0].value);
  assert.equal(r.duration,k===5?PT_FINAL:PT_STEP,`pick ${k+1}`);assert.equal(!!state.pending?.final,k===5,`pick ${k+1} final`);finishScan(state,s);}
 assert.deepEqual([...painted].sort(),[...PT_ZONES].sort(),'the six zones, each once');
 assert.equal(state.round,1,'the page turned');assert.equal(state.picks.length,0);assert.equal(scanContent(state,s).length,3,'the next page offers its first three zones');
});

test('palettes: three transmittances per zone, and the seasons change the sky of every landscape',()=>{
 for(let land=0;land<5;land++)for(const z of PT_ZONES)for(const season of [0,1,2,3]){const p=ptPalette(season,land,z);
  for(const k of ['col','glaze','accent']){assert.equal(p[k].length,3,`${land} ${z} ${k}`);for(const x of p[k])assert.ok(x>=0&&x<=1,`${land} ${z} ${k} ${season}`);}
  if(z==='cel'&&season)assert.notDeepEqual(p.col,ptPalette(0,land,z).col,`${land}: the ${PT_SEASONS[season]} sky differs from the spring one`);}
});

test('the music: a piece per season, every note inside its bank, whole bars that fit the effect, and a plucked or struck ending',()=>{
 for(let season=0;season<4;season++){const piece=ptPiece(season);assert.ok(piece.name&&piece.bpm>0&&piece.chords.length===8);
  for(const final of [false,true])for(const voices of [['cel'],['aigua','poble'],[...PT_ZONES]]){const D=final?PT_FINAL:PT_STEP,ev=ptPatternScore(season,voices,final,season*3+1);
   assert.ok(ev.length>=6,`${piece.name}: ${ev.length} events`);for(let i=1;i<ev.length;i++)assert.ok(ev[i].at>=ev[i-1].at,'in order');
   for(const e of ev){assert.ok(e.at>=0&&e.at<1&&e.length>0&&e.vel>0&&e.vel<=1,`${e.inst} at ${e.at}`);const b=SAMPLE_BANK[e.inst];assert.ok(b,e.inst);
    if(b.pitched)for(const m of e.midi){const near=Math.min(...b.zones.map(z=>Math.abs(z[1]-m)));assert.ok(near<=4,`${e.inst} ${m} is ${near} semitones from a sample`);}}
   const last=ev.slice(-3).map(e=>e.inst);assert.ok(last.every(i=>PLUCKED.includes(i)),`${piece.name} ends plucked or struck: ${last}`);
   assert.ok(ev.at(-1).at*D<=(final?PT_FINAL-PT_TURN:PT_STEP),`${piece.name}: the closing notes start before the end (${(ev.at(-1).at*D).toFixed(2)} s)`);
   if(final)assert.ok(ev.some(e=>e.inst==='fluteRec'),'the sky sings in the finale even when it is not painted');
   if(voices.includes('poble'))assert.ok(ev.some(e=>e.inst==='guitarRec'),'the village plays the guitar');}}
 for(const z of PT_ZONES)for(let season=0;season<4;season++){const t=ptTaste(z,season,season%5);assert.equal(t.length,3);for(const n of t){assert.ok(SAMPLE_BANK[n.inst],n.inst);assert.ok(n.t>=0&&n.t<1.5&&n.vel>0&&n.vel<=1);}}
});

test('gags and ambiences: every zone of every landscape has its generated sounds in the bank, and its loop in the nature bank',()=>{
 const names=new Set(SAMPLE_BANK.pintaRec.zones.map(z=>z[9])),loops=new Set(SAMPLE_BANK.natureRec.zones.map(z=>z[9]));
 assert.ok(PT_GAG>0&&PT_GAG<PT_PAINT);let gags=0,airs=0;
 for(let land=0;land<5;land++)for(const z of PT_ZONES)for(let season=0;season<4;season++){
  for(const g of ptGagSounds(land,z,season)){gags++;assert.ok(names.has(g.name),`${land} ${z}: ${g.name}`);assert.ok(g.at>=0&&g.at<PT_FINAL-PT_TURN&&g.gain>0&&g.gain<=1,`${land} ${z} ${g.name}`);}
  const a=ptAmbience(land,season,z);if(a){airs++;assert.ok(loops.has(a.name),`${land} ${z} ${season}: ${a.name}`);assert.ok(a.level>0&&a.level<=.6&&a.lowpass>=500,`${land} ${z} ${season}`);}}
 assert.ok(gags>=60&&airs>=60,`${gags} gag sounds, ${airs} ambiences`);
 for(const z of PT_ZONES)assert.ok(ptAmbience(0,0,z)!==undefined);
});

test('the generated banks: 27 one-shots and a nylon guitar, every file here and credited, the guitar in order',()=>{
 const credits=fs.readFileSync(new URL('CREDITS.md',samples),'utf8');assert.ok(credits.includes('Pinta el món'));
 const p=SAMPLE_BANK.pintaRec;assert.equal(p.pitched,false);assert.equal(p.strict,true);assert.equal(p.zones.length,27);
 assert.equal(new Set(p.zones.map(z=>z[9])).size,27,'one variant per sound');
 const g=SAMPLE_BANK.guitarRec;assert.equal(g.pitched,true);assert.deepEqual(g.zones.map(z=>z[1]),[57,62,64,67,69]);
 for(const z of [...p.zones,...g.zones]){assert.ok(fs.existsSync(new URL(z[0],samples)),z[0]);assert.ok(z[3]>0);assert.ok(credits.includes(z[0].split('/').pop()),`${z[0]} credited`);}
 for(const n of ['ptCigales','ptTorrent','ptMoli','ptColoms'])assert.ok(SAMPLE_BANK.natureRec.zones.some(z=>z[9]===n),n);
});

test('the five landscapes: six zones with polygons on the sheet, their ink and their anchors; the layout gives each option its polygon',()=>{
 for(let land=0;land<5;land++){const T=ptTerra(land);assert.equal(T.zones.length,6,`land ${land}`);
  T.zones.forEach((z,i)=>{assert.equal(z.id,PT_ZONES[i]);assert.ok(z.polys?.length>=1,`${land} ${z.id}: polygons`);
   for(const poly of z.polys){assert.ok(poly.length>=3);for(const [x,y] of poly){assert.ok(Number.isFinite(x)&&Number.isFinite(y));assert.ok(x>=-200&&x<=1480&&y>=-200&&y<=1000,`${land} ${z.id}: ${x},${y}`);}}});
  assert.ok(T.strokes.length>=20,`${land}: ${T.strokes.length} ink strokes`);assert.ok(T.anchors&&T.anchors.crowns&&T.anchors.windows,`${land}: anchors`);}
 const m=ptMap(1280,720);assert.ok(Math.abs(m[0]-m[1])<1e-9,'uniform scale');assert.ok(m[0]*1280>=1280-1e-6&&m[1]*800>=720-1e-6,'the sheet covers the canvas');
 const s={...base,scanOptions:4},state=createScanState('pinta',s),opts=scanContent(state,s),L=ptLayout(state,opts,1280,720);
 assert.equal(L.length,4);L.forEach((z,i)=>{assert.equal(z.kind,'poly');assert.equal(z.zone,opts[i].value);assert.ok(z.pts.length>=3);assert.ok(z.w>0&&z.h>0);});
});

test('without a document or WebGL the painter steps aside and the board still draws (the canvas keeps the ink)',()=>{
 assert.equal(pintaDraw(null,{}),false);assert.equal(pintaPrewarm(),false);
});
