// 0.50 · Petites pel·lícules: two films, a sequence per press, in their own folder right after «Històries pas a pas».
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const P=await import('../dist/pellicules.js');
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
test('the two films have 10 and 11 sequences, each a video file on disk with its URL',()=>{
 assert.deepEqual(P.PL_IDS,['mos','comunicar']);
 for(const [id,n] of [['mos',10],['comunicar',11]]){const a=P.plAct(id);assert.equal(a.tpl,'video');assert.equal(a.pauseMode,'marks');assert.equal(a.items.length,n);
  a.items.forEach((it,i)=>{const url=P.plUrl(it.media);assert.equal(url,`./videos/${id}/${id}_${String(i+1).padStart(2,'0')}.mp4`);assert.ok(fs.existsSync(new URL('../dist'+url.slice(1),import.meta.url)),url);});
  const item=P.plItem(id);assert.ok(item.persona&&item.film&&item.type==='ce');}
 assert.equal(P.plAct('nope'),null);assert.ok(!P.plIs('pp-1'));});
test('the folder goes right after «Històries pas a pas» and the films have card pictures and no UTAC logo over them',async()=>{
 const app=read('../dist/app.js'),i=app.indexOf("{id:'historia'"),j=app.indexOf("{id:PL_FOLDER"),k=app.indexOf("{id:'moment'");assert.ok(i>0&&i<j&&j<k);
 const {PL_CARD}=await import('../dist/pellicules-cartes.js');for(const id of P.PL_IDS)assert.match(PL_CARD[id],/^data:image\/jpeg;base64,/);
 assert.doesNotMatch(read('../dist/pellicules.js')+read('../dist/persona-art.js'),/utac\.png/);
 assert.ok(read('../build_standalone.py').includes("'pellicules.js','pellicules-cartes.js'"));});
