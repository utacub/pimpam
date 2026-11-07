import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
globalThis.Image=class {set src(v){this.width=1680;this.height=1260;queueMicrotask(()=>this.onload?.())}};
const art=await import('../dist/art.js');await art.ready;
function canvas(){const calls=[];const gradient={addColorStop(){}};const c=new Proxy({},{get(o,k){if(k==='calls')return calls;if(k in o)return o[k];return (...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`${k} has non-finite coordinate`);calls.push([k,...args]);if(k.startsWith('create'))return gradient;};},set(o,k,v){o[k]=v;return true;}});return c;}
const settings={base:'black',background:'none',opacity:25,duration:6,steps:3,reduced:false};
test('the paper flower renders start, middle, final and reduced states without invalid geometry',()=>{
 for(const id of ['flower'])for(const time of [null,0,.4,1.25,2,4,6])for(const reduced of [false,true])for(const base of ['white','black']){
  art.render(canvas(),1024,768,id,{time,count:3,parts:[0,1,2]}, {...settings,reduced,base});
 }
});
function appHarness(){
 const raw=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 const app=raw.slice(0,raw.indexOf('// Delegated UI')).replace(/^import .*;$/gm,'');
 const document={querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}};
 const context=vm.createContext({document,structuredClone,matchMedia:()=>({matches:false}),localStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>0},setTimeout,clearTimeout,window:{},console});
 // The same transformation and order as build_standalone.py, without the drawing modules: cause-catalog.js depends on
 // Caleidoscopi (0.7), Vitralls (0.8), Natura (0.9), Piromusical (0.10) and, since 0.11, on Tinta viva, Pluja de colors,
 // Fons marí de vidre and Pluja musical, and since 0.14 on the stage stories (escenari.js, orquestra.js, constel.js); app.js on synth.js
 // since 0.7.1 and on sampler.js since 0.9.
 const plain=s=>s.replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/\bexport\s+(?=(const|class|function))/g,'');
 const modules=['input.js','patterns.js','kaleido-base.js','kaleido-art.js','sampler.js','kaleido-music.js','kaleido.js','synth.js','glass.js','vitrall-art.js','vitrall.js','paper.js','natura-art.js','natura.js','firework.js','piro-art.js','piro.js','dia.js','escenari.js','fons.js','selva.js','sabana.js','pou.js','gegants.js','orquestra.js','constel.js','castells.js','globus.js','mag.js','far.js','toc.js','fira.js','cambrer.js','vent.js','tauler.js','masia-pinzell.js','masia-natura.js','masia-personatges.js','masia-decorats.js','masia-efectes.js','masia.js','masia-episodis.js','masia-art.js','encaix.js','encaix-figures.js','encaix-mons.js','encaix-so.js','encaix-art.js','pinta.js','pinta-shaders.js','pinta-gl.js','pinta-eines.js','pinta-terres.js','pinta-terres2.js','pinta-terres3.js','pinta-vida.js','pinta-gags.js','pinta-art.js','estacio.js','templet.js','origen.js','guix.js','cassola.js','dibuixos-art.js','dibuixos.js','joguines-art.js','joguines.js','cuina-art.js','cuina.js','visual-patterns.js','color-rain.js','ocean.js','musical-rain.js','cause-catalog.js','cinc.js','viatge-pinzell.js','viatge-mon.js','viatge.js','viatge-art.js','scan-catalog.js','persona-dades.js','persona.js','persona-art.js','persona-editor.js','usuaris.js','usuaris-fitxer.js'].map(name=>plain(fs.readFileSync(new URL('../dist/'+name,import.meta.url),'utf8'))).join('\n');
 vm.runInContext(modules+'\n'+app+`\nupdateGameUI=()=>{};noise=()=>{};note=()=>{};chord=()=>{};
 this.harness={setup:(id,count=0)=>{settings={...defaults,steps:3};game={item:catalog.find(g=>g.id===id),time:null,count,parts:[],completed:0};if(scanDefinition(id))game.scanState=createScanState(id,settings);},trigger:()=>triggerEffect(),finish:()=>finishEffect(),select:i=>select(i),state:()=>JSON.parse(JSON.stringify(game)),unlock:()=>settings.lock=false,at:t=>game.time=t,duration:d=>changeSetting('duration',d),steps:n=>changeSetting('steps',n),catalog:()=>catalog.map(g=>({id:g.id,code:g.code,type:g.type,name:g.name,recorded:!!g.recorded}))};`,context);
 return context.harness;
}
// The paper flower keeps the configured 6 s.
const INK_DURATIONS=[['flower',6]];
test('the paper flower returns to empty rest after its effect',()=>{
 const h=appHarness();for(const [id,d] of INK_DURATIONS){h.setup(id);h.trigger();assert.equal(h.state().duration,d,id);h.finish();assert.equal(h.state().time,null);assert.equal(h.state().count,0);assert.equal(h.state().completed,1);}
});
test('each activity plays all 20 patterns in order, skips rejected presses and loops at 20',()=>{
 const h=appHarness();for(const id of ['flower']){h.setup(id);for(let i=0;i<42;i++){h.trigger();assert.equal(h.state().pattern,i%20);h.trigger();assert.equal(h.state().pattern,i%20);assert.equal(h.state().patternActivations,i+1);h.finish();}assert.equal(h.state().nextPattern,2);}
});
test('unlocked new presses advance optical patterns, one pattern per press',()=>{
 const h=appHarness();h.setup('flower');h.unlock();for(let i=0;i<24;i++){h.trigger();assert.equal(h.state().pattern,i%20);}
});
test('duration changes preserve audiovisual phase and never advance the sequence',()=>{
 const h=appHarness();for(const [id,d] of INK_DURATIONS){h.setup(id);h.trigger();h.at(3);h.duration(10);assert.equal(h.state().time,3/d*10,id);assert.equal(h.state().duration,10);assert.equal(h.state().pattern,0);assert.equal(h.state().nextPattern,1);}
});

test('changing the cause-effect step preference never cancels or strands a pending scan choice',()=>{const h=appHarness();h.setup('dress');h.select(0);h.steps(7);assert.equal(h.state().scanState.status,'effect');assert.ok(h.state().time!==null);h.finish();assert.equal(h.state().scanState.status,'choose');assert.equal(h.state().scanState.stage,1);});
// 0.26.1 takes out the 27 activities made with ChatGPT (Tinta viva and its original, Focs artificials, Pluja musical - original, Cintes de
// pintura, the six old step stories, Petit Pim gran Pam and fifteen scanning activities). The codes of the others do not change, so
// they have gaps.
// 0.47.3 takes out Jardí de paper (CE11), La llenyataire (CE13) and La caixa sorpresa (CE39), at Marc's request.
const GONE_0473=['garden','tree','surprise'];
const GONE=['tinta','tinta-original','fireworks','rain-original','ribbons','egg','rocket','cake','popcorn','robot','train','emblem','greeting','effects','radio','ice','conductor','twins','places','recipe','explorer','story','picnic','stations','plots','cinema','show'];
test('the integrated catalogue lists 31 cause-effect and 11 scanning activities once each, in code order, without the ones taken out',()=>{
 const list=JSON.parse(JSON.stringify(appHarness().catalog())),ce=list.filter(g=>g.type==='ce');
 assert.equal(GONE.length,27);assert.equal(list.length,42);assert.equal(ce.length,31);assert.equal(list.length-ce.length,11);assert.equal(new Set(list.map(g=>g.id)).size,42);
 for(const id of [...GONE,...GONE_0473])assert.ok(!list.some(g=>g.id===id),id);
 const codes=ce.map(g=>Number(g.code.slice(2)));assert.deepEqual(codes,[...codes].sort((a,b)=>a-b));assert.deepEqual(codes,[2,3,5,6,7,9,10,12,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,40,41,42,43,44]);
 for(const id of ['flower','color-rain','jelly','jungle','savanna','well','giants','rain','kaleido','vitrall','natura','piro','castells','wind','balloons','lighthouse','magician','door','fira','waiter','drawings','toys','kitchen'])assert.ok(ce.some(g=>g.id===id),id);
 assert.deepEqual(ce.filter(g=>g.recorded).map(g=>g.id),['jelly','daynight','constellations','orchestra','kaleido','vitrall','natura','piro','castells','wind','balloons','lighthouse','magician','door','waiter','drawings','toys','kitchen','jungle','savanna','well','giants','robotbuild','flora','frog','viatge','fira']);
 assert.deepEqual(list.filter(g=>g.type==='scan').map(g=>g.code),['EN04','EN06','EN07','EN11','EN12','EN21','EN22','EN23','EN24','EN25','EN26']);
});
