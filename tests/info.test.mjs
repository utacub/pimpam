// The «Informació» panel of the four dives (0.32), of the cassola, the castells, the orchestra, the bandstand and the sound places (0.33) and of the five landscapes of Pinta el món (0.38) and the six stories of Estiu a la masia (0.39): every scene has its picture and one to three plain lines about what it shows,
// in the same order and with the same titles as the activity itself.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SCENE_INFO,SCENE_INFO_HEAD} from '../dist/info-escenes.js';
import {FONS_NAMES} from '../dist/fons.js';
import {SELVA_NAMES} from '../dist/selva.js';
import {SABANA_NAMES} from '../dist/sabana.js';
import {POU_NAMES} from '../dist/pou.js';
import {GG_NAMES} from '../dist/gegants.js';
const expected={jelly:20,jungle:20,savanna:20,well:21,pot:11,castells:11,orchestra:6,sounds:8,sources:9,giants:20,pinta:5,masia:6,viatge:7,encaix:20,fira:5,flower:20,'color-rain':20,vehicles:110};
test('each dive has every scene, with a picture and one to three short lines',()=>{
  assert.deepEqual(Object.keys(SCENE_INFO).sort(),Object.keys(expected).sort());
  for(const [id,n] of Object.entries(expected)){
    assert.equal(SCENE_INFO[id].length,n,id);
    for(const s of SCENE_INFO[id]){
      assert.ok(s.t&&s.t.length<80,`${id} title`);
      assert.ok(s.l.length>=1&&s.l.length<=3,`${id} ${s.t}: ${s.l.length} lines`);
      for(const l of s.l)assert.ok(l.length>10&&l.length<=230,`${id} ${s.t}: line length ${l.length}`);
      assert.match(s.img,/^data:image\/jpeg;base64,\/9j\//,`${id} ${s.t} picture`);
      assert.ok(s.img.length<40000,`${id} ${s.t} picture size`);
      assert.doesNotMatch(s.l.join(' '),/\(\D*\d{4}\)|et al\./,`${id} ${s.t}: no citations`);
    }
  }
});
test('every panel has its heading',()=>{for(const id of Object.keys(expected))assert.ok(SCENE_INFO_HEAD[id]?.length>10,id);});
test('the scene titles follow the activity names',()=>{
  const names={jelly:FONS_NAMES,jungle:SELVA_NAMES,savanna:SABANA_NAMES,well:POU_NAMES,giants:GG_NAMES};
  for(const [id,list] of Object.entries(names))list.slice(0,20).forEach((n,i)=>assert.equal(SCENE_INFO[id][i].t,n,`${id} ${i+1}`));
});
test('the game header (both tool rows) and the home cards offer the panel',()=>{
  const src=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  assert.equal((src.match(/data-info aria-label/g)||[]).length,2);
  assert.match(src,/function openInfo\(id\)/);assert.match(src,/class="favorite card-info" data-info="\$\{g.id\}"/);assert.match(src,/function closeInfo\(\)/);
});
// 0.35: the home cards of the four dives are pictures; drawing them live compiled their WebGL shaders while the menu opened (it hung).
test('the dives have a picture for their home card, and the previews are painted a few per frame',async()=>{
  const {CARD_IMG}=await import('../dist/info-escenes.js');
  for(const id of ['jelly','jungle','savanna','well','giants','pinta','masia','viatge','flower','color-rain','vehicles'])assert.match(CARD_IMG[id]||'',/^data:image\/jpeg;base64,\/9j\//,id);
  const src=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  assert.match(src,/function paintPreview\(canvas\)\{[^\n]*CARD_IMG\[id\]/);assert.match(src,/performance\.now\(\)-t0<12/);
});
