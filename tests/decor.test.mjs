// 0.17: the setting «Presentació del decorat» in every activity that has a decor (escDecor, escVeil, escVeiled in escenari.js), and the
// highlight of the scanning focus as a setting (scanRing in input.js, tlRing in tauler.js): a frame that draws itself or a whole frame,
// its colour, its thickness and its relief.
import test from 'node:test';
import assert from 'node:assert/strict';
import {escDecor,escDecorKey,escVeiled} from '../dist/escenari.js';
import {drawOrquestra} from '../dist/orquestra-art.js';
import {drawConstel} from '../dist/constel-art.js';
import {drawDia} from '../dist/dia-art.js';
import {diaStops} from '../dist/dia.js';
import {drawVent} from '../dist/vent-art.js';
import {drawPiro} from '../dist/piro.js';
import {renderScanActivity} from '../dist/scan-art.js';
import {SCAN_ACTIVITIES,createScanState,scanChoices} from '../dist/scan-catalog.js';
import {TL_RING,tlRing,tlLayout} from '../dist/tauler.js';
import {defaults,validateProfile,scanRing,SCAN_COLORS} from '../dist/input.js';
// the mock records every call and the fill colour of every fillRect
function ctx(){const calls=[],fills=[],gradient={addColorStop(){}};return new Proxy({calls,fills},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);if(k==='fillRect')fills.push(o.fillStyle);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
const MODES={full:{background:'full'},dim:{background:'dim',opacity:30,base:'black'},none:{background:'none',base:'black'},white:{background:'none',base:'white'}};
const measure=draw=>Object.fromEntries(Object.entries(MODES).map(([m,o])=>{const c=ctx();draw(c,o);return [m,{n:c.calls.length,first:c.fills[0]}];}));
test('the decor setting: full, dim under a veil of the base colour, or none; the cards always show the decor whole',()=>{
 assert.deepEqual((({mode,fade,base,white})=>({mode,fade,base,white}))(escDecor({background:'none',base:'white'})),{mode:'none',fade:0,base:'#ffffff',white:true});
 assert.equal(escDecor({background:'dim',opacity:40}).fade,.4);assert.equal(escDecor({background:'dim'}).fade,.25);assert.equal(escDecor({background:'dim',opacity:300}).fade,1);
 assert.equal(escDecor({}).mode,'full');assert.equal(escDecor({background:'bogus'}).mode,'full');assert.equal(escDecor({background:'none',preview:true}).mode,'full');
 // the cached sheets of the decor are kept apart by mode, fade and base
 const keys=new Set([{background:'full'},{background:'dim',opacity:30},{background:'dim',opacity:60},{background:'dim',opacity:30,base:'white'}].map(o=>escDecorKey(escDecor(o))));assert.equal(keys.size,4);assert.equal(escDecorKey(escDecor({})),'');
 const draw=()=>{},full=escVeiled(escDecor({}),draw);assert.equal(full,draw,'whole, the sheet is drawn as it was');
 const c=ctx();escVeiled(escDecor({background:'dim',opacity:30}),(sc)=>sc.fillRect(0,0,10,10))(c,10,10);assert.deepEqual(c.calls.slice(0,2),['fillRect','save']);assert.equal(c.globalCompositeOperation,'source-atop','the veil only covers what the sheet drew');});
const STORIES=[
 ['L’orquestra que es desperta',(c,o)=>drawOrquestra(c,1280,720,{variant:3,count:3,steps:5,t:2,duration:9,idle:3,...o})],
 ['El cel de les constel·lacions',(c,o)=>drawConstel(c,1280,720,{variant:3,count:3,steps:5,t:2,duration:9,held:1,idle:3,...o})],
 ['Dia rere dia',(c,o)=>drawDia(c,1280,720,{phi:13.4,target:14,t:4,stops:diaStops(8),idle:3,reduced:false,...o})],
 ['El vent del bosc',(c,o)=>drawVent(c,1280,720,{variant:2,press:2,t:3,release:null,offset:0,idle:2,...o})]];
test('the stories: without the decor, the figures stay on the base colour (black or white); dimmed, the decor is drawn and veiled',()=>{
 for(const [name,draw] of STORIES){const r=measure(draw);
  assert.equal(r.none.first,'#000000',`${name}: the base, black`);assert.equal(r.white.first,'#ffffff',`${name}: the base, white`);
  assert.ok(r.none.n<r.full.n,`${name}: without the decor, less is drawn (${r.none.n} against ${r.full.n})`);assert.ok(r.dim.n>r.none.n,`${name}: dimmed, the decor is drawn`);
  // a change of round, a press, the final and the cards, in every mode
  for(const background of ['full','dim','none'])draw(ctx(),{background,opacity:50});}
 for(const background of ['dim','none']){const c=ctx();drawVent(c,1024,768,{variant:9,press:1,t:1.2,release:null,offset:0,change:true,from:8,idle:0,background,base:'white'});assert.ok(c.calls.length>20,'the wind changes place without the decor');}});
test('Piromusical: without the decor, the fireworks go up from the base colour, with no sky, land or reflection',()=>{
 const r=measure((c,o)=>drawPiro(c,1280,720,{index:2,t:5,duration:10,seed:0,adaptive:false,...o}));
 assert.ok(r.none.n<r.full.n&&r.dim.n>r.none.n);assert.equal(r.none.first,undefined,'the app has already filled the base');
 assert.equal(r.full.first,r.dim.first,'dimmed, the night sky is drawn and veiled');});
test('the scanning activities with a decor: the scene, the backdrop and the boards follow the setting; the content stays whole',()=>{
 for(const id of ['vehicles','encaix','destinations','sounds','sources','lights']){const item=SCAN_ACTIVITIES.find(x=>x.id===id);assert.ok(item,id);
  const r=measure((c,o)=>{const s={...defaults,...o},state=createScanState(id,s);renderScanActivity(c,1280,720,id,{item,scanState:state,time:null,focusedChoice:scanChoices(state,s)[0],board:{focus:0,lights:[1,.6,.6,.6]}},s);});
  assert.equal(r.none.first,'#000000',`${id}: the base, black`);assert.equal(r.white.first,'#ffffff',`${id}: the base, white`);
  assert.ok(r.none.n<=r.full.n&&r.dim.n>r.none.n,`${id}: ${JSON.stringify(r)}`);}
 // the cards of the home screen always show the decor
 for(const id of ['destinations','explorer','sources','lights']){const item=SCAN_ACTIVITIES.find(x=>x.id===id),s={...defaults,background:'none'},a=ctx(),b=ctx();
  renderScanActivity(a,320,180,id,{item,scanState:null,time:null},s,true);renderScanActivity(b,320,180,id,{item,scanState:null,time:null},{...s,background:'full'},true);assert.equal(a.calls.length,b.calls.length,`${id}: the card`);}});
test('the highlight of the focus is a setting: a frame that draws itself or a whole one, eight colours, 4 to 24 px, and a relief',()=>{
 assert.equal(defaults.scanFrame,'progress');assert.equal(defaults.scanColor,'orange');assert.equal(defaults.scanWidth,10);assert.equal(defaults.scanRelief,false);
 const s=validateProfile({...defaults,scanFrame:'whole',scanColor:'green',scanWidth:18,scanRelief:true});assert.deepEqual([s.scanFrame,s.scanColor,s.scanWidth,s.scanRelief],['whole','green',18,true]);
 for(const bad of [{scanFrame:'dots'},{scanColor:'#123456'},{scanWidth:2},{scanWidth:40},{scanRelief:1}])assert.throws(()=>validateProfile({...defaults,...bad}),JSON.stringify(bad));
 const ring=scanRing(s);assert.deepEqual([ring.frame,ring.color,ring.width,ring.relief],['whole',SCAN_COLORS.green,18,true]);
 // a dark highlight gets a light edge, so that it stands out on a dark scene too; a light one, a dark edge
 assert.equal(scanRing({...defaults,scanColor:'black'}).edge,'#fffffff0');assert.equal(scanRing({...defaults,scanColor:'yellow'}).edge,'#100c1ce6');
 assert.equal(Object.keys(SCAN_COLORS).length,8);assert.ok(Object.values(SCAN_COLORS).every(x=>/^#[0-9a-f]{6}$/.test(x)));});
test('the ring of a board: the whole frame draws the full outline at once; the relief adds a shadow and two offset strokes',()=>{
 const pts=tlLayout('destinations',4,1280,720)[1].pts,strokes=style=>{const c=ctx();tlRing(c,pts,.3,1,1,style);return c.calls.filter(k=>k==='stroke').length;};
 const progress=strokes(TL_RING),whole=strokes({...TL_RING,frame:'whole'}),relief=strokes({...TL_RING,frame:'whole',relief:true});
 assert.equal(whole,progress-1,'whole, there is no track for the time left');assert.equal(relief,whole+2,'the relief: a dark and a light stroke');
 const c=ctx();tlRing(c,pts,null,1,1,{...TL_RING,frame:'progress'});assert.ok(c.calls.includes('stroke'),'with no time, the progress frame is drawn whole');
 const off=ctx();tlRing(off,pts,.5,0,1,TL_RING);assert.equal(off.calls.length,0);});
