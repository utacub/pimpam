import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {EXTRA_CAUSES,NEW_CAUSES,beginCause,finishCause,retimeCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {PC_CAUSE} from '../dist/color-rain.js';
import {defaults} from '../dist/input.js';
// 0.12 joins ChatGPT's 0.11 and Claude's 0.10.1 into one file: these checks cover what the join itself could break.
const settings={...defaults},ALL=[...EXTRA_CAUSES,PC_CAUSE,...NEW_CAUSES];
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
test('the modules of build_standalone.py join into one script without repeated top-level names',()=>{
 const build=fs.readFileSync(new URL('../build_standalone.py',import.meta.url),'utf8'),names=JSON.parse(build.match(/for name in (\[[^\]]+\])/)[1].replaceAll("'",'"'));
 for(const name of ['color-rain.js','ocean.js','sampler.js','vitrall.js','natura.js','piro.js'])assert.ok(names.includes(name),name);
 const code=names.map(n=>fs.readFileSync(new URL('../dist/'+n,import.meta.url),'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/\bexport\s+(?=(const|class|function))/g,'');
 assert.doesNotThrow(()=>new vm.Script('(()=>{\n'+code+'\n})'),'a repeated const, let or class name is a SyntaxError');
});
test('every cause-effect collection draws and scores each of its variants, and ends empty',()=>{
 for(const item of ALL){if(item.kind!=='burst')continue;const n=item.variants||20,g={item,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null};
  for(let v=0;v<n;v++){assert.ok(beginCause(g,settings),item.id);assert.equal(g.variant,v);assert.ok(g.score.length,`${item.id} ${v}: music`);
   for(let j=0;j<g.score.length;j++){const e=g.score[j];assert.ok(e.at>=0&&e.at<=1.001,`${item.id} ${v}`);if(j)assert.ok(e.at>=g.score[j-1].at);}
   g.time=g.duration*.5;const c=ctx();assert.equal(renderExtraCause(c,1280,720,item.id,g,settings),true,item.id);assert.ok(c.calls.length>0,`${item.id} ${v}: drawn`);
   finishCause(g,settings);const end=ctx();renderExtraCause(end,1280,720,item.id,g,settings);assert.equal(end.calls.filter(k=>/fill|stroke|drawImage/.test(k)).length,0,`${item.id}: empty at rest`);}}
});
test('changing the duration mid-effect keeps the phase in the collections that compose their own music',()=>{
 for(const id of ['jelly','kaleido','vitrall','natura','piro']){const item=ALL.find(x=>x.id===id),g={item,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null};
  beginCause(g,settings);const D=g.audioDuration||g.duration;g.time=D*.4;assert.ok(retimeCause(g,settings,15));assert.ok(Math.abs(g.time/(g.audioDuration||g.duration)-.4)<1e-9,id);}
});
