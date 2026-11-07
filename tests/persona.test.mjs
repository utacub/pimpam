import test from 'node:test';
import assert from 'node:assert/strict';
const D=await import('../dist/persona-dades.js');
const P=await import('../dist/persona.js');
const S=await import('../dist/scan-catalog.js');

test('the export zip goes in and out unchanged, with the CRC of each file', async()=>{
 const files=[{name:'pim-pam.json',blob:new Blob(['{"a":1}'])},{name:'media/m1.jpg',blob:new Blob([new Uint8Array(300000).map((_,i)=>i*7)])},{name:'media/buit.mp3',blob:new Blob([])}];
 const zip=await D.pdZip(files),back=await D.pdUnzip(zip);assert.deepEqual([...back.keys()],files.map(f=>f.name));
 for(const f of files)assert.deepEqual(new Uint8Array(await back.get(f.name).arrayBuffer()),new Uint8Array(await f.blob.arrayBuffer()));
 assert.equal(await D.pdCrc(new Blob(['123456789'])),0xCBF43926);
 await assert.rejects(D.pdUnzip(new Blob(['no és un zip'])),/no és una exportació/);});
test('the loudness gain brings a sound towards the target and never clips it', ()=>{
 const buf=(amp,n=44100)=>({length:n,numberOfChannels:1,sampleRate:44100,getChannelData:()=>Float32Array.from({length:n},(_,i)=>amp*Math.sin(i/7))});
 const quiet=D.pdLoudness(buf(.02)),loud=D.pdLoudness(buf(.95));assert.ok(D.pdGain(quiet)>1&&D.pdGain(loud)<1);assert.ok(D.pdGain(quiet)*.02<=1);assert.equal(D.pdGain(D.pdLoudness(buf(0))),1);});
test('an activity keeps only known fields and types', ()=>{
 const a=D.pdClean({id:'pp-x',name:'<b>Hola</b>'.repeat(20),tpl:'res',items:[{id:'i',media:'m1',sound:7},{media:''}],musicMode:'x',videoMax:999,evil:()=>1});
 assert.equal(a.tpl,'album');assert.equal(a.name.length,60);assert.equal(a.items.length,1);assert.equal(a.items[0].sound,'7');assert.equal(a.musicMode,'pimpam');assert.equal(a.videoMax,30);assert.ok(!('evil' in a));
 assert.deepEqual(D.pdUses({items:[{media:'a',sound:'b'}],music:'c'}),['a','b','c']);});
test('the five mechanics: no hold, the scanning ones on the scanning of the app', ()=>{
 assert.deepEqual(Object.keys(P.PS_TEMPLATES),D.PD_TEMPLATES);for(const t of Object.values(P.PS_TEMPLATES))assert.ok(['ce','scan'].includes(t.type));
 assert.ok(P.psIs('pp-abc')&&!P.psIs('flower'));assert.ok(!S.scanCued('pp-none')&&S.scanCued('sounds'));});
test('Descobreix pas a pas takes the 12 pieces away in exactly the steps of the profile', ()=>{
 for(const N of [3,5,7]){const steps=Array.from({length:12},(_,rank)=>P.psTileStep({rank},N));assert.equal(Math.min(...steps),1);assert.equal(Math.max(...steps),N);assert.equal(new Set(steps).size,N);}});
test('the zones of the boards stay inside the stage, above the strip', ()=>{
 for(const [w,h] of [[1280,720],[800,1000],[1920,1080],[390,700]])for(const n of [1,2,3,4]){const z=P.psLayout(n,w,h);assert.equal(z.length,n);for(const q of z){assert.ok(q.x>=0&&q.y>=0&&q.x+q.w<=w+.01&&q.y+q.h<=h-60,`${w}x${h} n${n}`);for(const v of [q.x,q.y,q.w,q.h])assert.ok(Number.isFinite(v)&&v>=0);}}});
test('the phrases of the recorded instruments are finite and inside their length', ()=>{
 for(const kind of ['show','final','step','open','close','knock','paper'])for(const len of [2,6,15]){for(const e of P.psPhrase(kind,3,len)){assert.ok(e.at>=0&&e.at<=len+.01&&e.len>0);assert.ok(Number.isFinite(e.e.midi[0]));}}
 assert.ok(P.psPhrase('show',0,6).length>12);});
test('an activity with too little material says what it needs', ()=>{
 assert.equal(P.psProblems({tpl:'tria',items:[{media:'a'}],musicMode:'pimpam'},new Map()).length,1);
 assert.equal(P.psProblems({tpl:'troba',items:[{media:'a',sound:'s'},{media:'v'}],musicMode:'pimpam'},new Map([['v',{kind:'video',sound:true}]])).length,0);
 assert.equal(P.psProblems({tpl:'album',items:[{media:'a'}],musicMode:'own',music:null},new Map()).length,1);});
