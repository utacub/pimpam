// Stills of El viatge en globus for review (no video): journey, share of the day, height, poses. node tools/viatge-frames.mjs out/ [list.json]
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}const {chromium}=playwright;
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'),out=process.argv[2]||'/tmp/vgframes';fs.mkdirSync(out,{recursive:true});
const types={'.js':'text/javascript','.html':'text/html','.mp3':'audio/mpeg','.json':'application/json'};
const srv=http.createServer((q,r)=>{const p=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,b)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':types[path.extname(p)]||'application/octet-stream'});r.end(b);});}).listen(0);
const port=srv.address().port;
const list=process.argv[3]?JSON.parse(fs.readFileSync(process.argv[3])):[
 {n:'01_vall_primavera_mati',v:0,p:.18,a:.15},{n:'02_vall_alt',v:0,p:.22,a:.95,burn:true,pose:{mila:'look',bru:'wind'}},{n:'03_costa_estiu_migdia',v:5,p:.31,a:.2},
 {n:'04_muntanya_tardor_posta',v:10,p:.55,a:.3,pose:{mila:'wave',bru:'bark'}},{n:'05_delta_hivern_nit',v:15,p:.8,a:.2,pose:{mila:'sleep',bru:'sleep'}},{n:'06_illes_primavera_tarda',v:16,p:.45,a:.1},
 {n:'07_vall_estiu_vespre',v:1,p:.68,a:.5},{n:'08_costa_hivern_matinada',v:7,p:.97,a:.05,pose:{mila:'lantern',bru:'peek'}}];
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
pg.on('console',m=>console.log('page:',m.text()));pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto(`http://localhost:${port}/production/viatge/frames.html`);await pg.waitForFunction('window.ready');
for(const o of list){const r=await pg.evaluate(o=>window.shot(o),o);await pg.screenshot({path:path.join(out,o.n+'.png')});console.log(o.n,JSON.stringify(r));}
await b.close();srv.close();
