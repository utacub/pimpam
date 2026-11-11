// 0.76: installation as an app (PWA): the size shown before installing, the file list and the service worker.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pwaMida,pwaParts,pwaBotoHtml} from '../dist/pwa.js';

test('0.76 sizes as Windows shows them and the parts of the total', ()=>{
  assert.equal(pwaMida(520417638),'496 MB');
  assert.equal(pwaMida(5*1048576+524288),'5,5 MB');
  assert.equal(pwaMida(3.25*1073741824),'3,3 GB');
  const p=pwaParts({files:[['videos/a/x.mp4',10],['assets/samples/a.mp3',5],['assets/p.webp',3],['icones/i.svg',1],['app.js',7],['i18n/en.json',2]]});
  assert.deepEqual(p,{video:10,so:5,imatge:4,codi:9});
  assert.match(pwaBotoHtml('<svg></svg>'),/data-instal[^>]*>.*Instal·la/);
});

test('0.76 pwa-fitxers.json lists every file of the app with its real size, and nothing else', ()=>{
  execFileSync('node',['tools/pwa-build.mjs','dist']);
  const l=JSON.parse(fs.readFileSync('dist/pwa-fitxers.json','utf8'));
  const paths=new Set(l.files.map(f=>f[0]));
  for(const f of ['index.html','app.js','pwa.js','style.css','manifest.webmanifest','icones/icona-192.png','icones/icona-512.png'])assert.ok(paths.has(f),f);
  for(const f of paths)assert.ok(!/^proves\/|^sw\.js$|^pwa-fitxers\.json$|\.md$/.test(f),f);
  let total=0;for(const [p,size,h] of l.files){assert.equal(fs.statSync('dist/'+p).size,size,p);assert.match(h,/^[0-9a-f]{16}$/);total+=size;}
  assert.equal(l.total,total);
  assert.equal(l.version,/const APP_VERSION='([^']+)'/.exec(fs.readFileSync('dist/app.js','utf8'))[1]);
  // every module app.js imports is in the list (the app must open offline)
  for(const m of fs.readFileSync('dist/app.js','utf8').matchAll(/from '\.\/([^']+)'/g))assert.ok(paths.has(m[1]),m[1]);
});

test('0.76 manifest, icons and service worker', ()=>{
  const m=JSON.parse(fs.readFileSync('dist/manifest.webmanifest','utf8'));
  assert.equal(m.display,'standalone');assert.equal(m.start_url,'./');
  for(const s of ['192x192','512x512'])assert.ok(m.icons.some(i=>i.sizes===s&&fs.existsSync('dist/'+i.src)),s);
  assert.ok(m.icons.some(i=>i.purpose==='maskable'));
  const html=fs.readFileSync('dist/index.html','utf8');assert.match(html,/rel="manifest" href="\.\/manifest\.webmanifest"/);
  const sw=fs.readFileSync('dist/sw.js','utf8');
  assert.match(sw,/pwa-baixa=/);assert.match(sw,/status:206/);assert.match(sw,/actiu===null\)return/);
  const wf=fs.readFileSync('.github/workflows/pages.yml','utf8');assert.ok(wf.indexOf('tools/pwa-build.mjs')<wf.indexOf('upload-pages-artifact'));
});
