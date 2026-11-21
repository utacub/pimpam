import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {MJ_ITEMS,MJ_IDS,MJ_CARD} from '../dist/mira.js';
import {validateProfile,defaults} from '../dist/input.js';

// 0.78: six activities of Mira i Juga 2, run in an iframe (dist/mj2/) with the access and the settings of Pim Pam.
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');

test('0.78 the six Mira i Juga 2 activities: codes, kinds and folders',()=>{
 assert.deepEqual(MJ_ITEMS.map(x=>[x.id,x.code,x.task,x.mira]),[['mj-robot','EN27','creative','robots'],['mj-conte','EN28','creative','conte'],['mj-nenufars','EN29','creative','granotes'],['mj-planol','EN30','guided','robots'],['mj-escolta','EN31','guided','conte'],['mj-ou','EN32','guided','ous']]);
 for(const x of MJ_ITEMS){assert.equal(x.type,'scan');assert.ok(x.name&&x.desc.length>60,x.id);assert.ok(existsSync(new URL('../dist'+MJ_CARD[x.id].slice(1),import.meta.url)),x.id);}
 const app=read('../dist/app.js');
 assert.match(app,/id:'triar'[^}]*ids:\[[^\]]*'vestidor','mj-robot','mj-conte','mj-nenufars'\]/);
 assert.match(app,/id:'relacionar'[^}]*ids:\['sounds','sources','encaix','mj-planol','mj-escolta','mj-ou'\]/);
 assert.match(app,/\.concat\(SCAN_ACTIVITIES,MJ_ITEMS,plItems\(\)\)/);assert.match(app,/LOAD_HEAVY\.push\(\.\.\.MJ_IDS\)/);
 assert.match(app,/if\(game\.mira\)\{mjPress\(i\);return;\}/);assert.match(app,/else if\(game\.mira\)\{mjFrame\(dt\);\}/); assert.match(app,/if\(item\.type==='scan'&&!item\.mira\)game\.scanState=createScanState/);
 assert.match(read('../build_standalone.py'),/'vestidor-so\.js','mira\.js'/);
});

test('0.78 settings: size, speed and music, validated',()=>{
 assert.equal(defaults.mjSize,'1');assert.equal(defaults.mjSpeed,'normal');assert.equal(defaults.mjMusic,true);
 assert.equal(validateProfile({mjSize:'2',mjSpeed:'lenta',mjMusic:false}).mjSize,'2');
 assert.throws(()=>validateProfile({mjSize:'3'}));assert.throws(()=>validateProfile({mjSpeed:'molt'}));assert.throws(()=>validateProfile({mjMusic:'no'}));
});

test('0.78 the bridge: every activity is a mode of an imported scene; the app shell of Mira i Juga 2 is out',()=>{
 const pont=read('../dist/mj2/pont.js'),html=read('../dist/mj2/index.html');
 for(const id of MJ_IDS)assert.ok(pont.includes(`'${id}'`),id);
 assert.match(html,/<script src="pont\.js"><\/script>\n<\/body>/);
 assert.doesNotMatch(html,/<link rel="manifest"/);assert.doesNotMatch(html,/\nPWA\.init\(\);/);assert.doesNotMatch(html,/loadAnimals\(\);applyLang/);
 assert.match(html,/const __mjOk=p=>/);
 for(const d of ['ous','estany','robots','conte','so','fonts'])assert.ok(existsSync(new URL(`../dist/mj2/${d}`,import.meta.url)),d);
 const o=JSON.parse(read('../dist/mj2/origen.json'));assert.equal(o.from,'github.com/utacub/miraijuga2');
 // nothing written on the screen during the activity: the captions are cleared after every step
 assert.match(pont,/if\(st&&st\.cap\)st\.cap=null/);
});

test('0.78 the names, descriptions and settings are in the six languages',()=>{
 const ca=read('../i18n/ui-ca.tsv');
 for(const l of ['es','eu','gl','en','fr']){const d=JSON.parse(read(`../dist/i18n/${l}.json`)).s;
  for(const x of MJ_ITEMS){assert.ok(ca.includes('\t'+x.name+'\n'),x.name);assert.ok(d[x.name],`${l} ${x.name}`);assert.ok(d[x.desc],`${l} ${x.id} desc`);}
  for(const t of ['Mida','Velocitat de l’escena','Música de fons','Tria una opció.','Mira l’escena.'])assert.ok(d[t],`${l} ${t}`);}
});
