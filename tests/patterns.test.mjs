import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {INK_PATTERNS,FLOWER_PATTERNS,advancePattern,patternScore} from '../dist/patterns.js';
import {drawPaperFlower} from '../dist/visual-patterns.js';
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const x of args)if(typeof x==='number')assert.ok(Number.isFinite(x),`${k}: invalid coordinate`);calls.push([k,...args.filter(x=>typeof x==='number')]);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
test('20 different flowers, and 20 distinct palettes for them and for the effects of causa-efecte',()=>{
 for(const list of [INK_PATTERNS,FLOWER_PATTERNS]){assert.equal(list.length,20);assert.equal(new Set(list.map(x=>x.id)).size,20);assert.equal(new Set(list.map(x=>x.name)).size,20);assert.equal(new Set(list.map(x=>x.palette.join(','))).size,20);assert.equal(new Set(list.map(x=>x.palette[0])).size,20);for(const p of list)assert.ok(p.palette.every(c=>/^#[a-f\d]{6}$/i.test(c)));}
 assert.equal(new Set(INK_PATTERNS.map(x=>x.kind)).size,20);
 assert.equal(new Set(FLOWER_PATTERNS.map(x=>JSON.stringify([x.shape,x.layers,x.move]))).size,20);
});
test('every pattern has a genuinely different drawing trace independent of colour',()=>{
 for(const draw of [drawPaperFlower]){const hashes=[];for(let i=0;i<20;i++){const c=ctx();draw(c,1024,768,3,6,i,false,'black');hashes.push(crypto.createHash('sha256').update(JSON.stringify(c.calls)).digest('hex'));}assert.equal(new Set(hashes).size,20);}
});
test('all 20 flowers render finite coordinates through their lifecycle in both background bases and motion modes',()=>{
 for(const draw of [drawPaperFlower])for(let i=0;i<20;i++)for(const u of [0,.14,.38,.64,.87,1])for(const reduced of [false,true])for(const base of ['black','white'])draw(ctx(),1024,768,6*u,6,i,reduced,base);
});
test('all effects are empty at rest and at the exact end',()=>{
 for(const draw of [drawPaperFlower])for(let i=0;i<20;i++)for(const t of [null,0,6]){const c=ctx();draw(c,1024,768,t,6,i);assert.equal(c.calls.length,0);}
});
test('harmonic accompaniments differ across the 20 flowers and fit within the visual lifecycle',()=>{
 const hashes=[];for(const id of ['flower'])for(let i=0;i<20;i++){const score=patternScore(id,i);hashes.push(JSON.stringify(score));assert.equal(score[0].at,0);for(let j=0;j<score.length;j++){const e=score[j];assert.ok(e.at>=0&&e.at<1);assert.ok(e.length>0&&e.at+e.length<=1.001);assert.ok(e.level>0&&e.level<=.1);assert.ok(e.midi.every(m=>m>=24&&m<=96));if(j)assert.ok(e.at>=score[j-1].at);}}assert.equal(new Set(hashes).size,20);
});
