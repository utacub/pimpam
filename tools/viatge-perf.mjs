// Milliseconds a frame of El viatge en globus, with parts of the drawing left out, to find what costs (development harness).
import {createRequire} from 'node:module';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const srv=http.createServer((q,r)=>{const p=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,b)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':p.endsWith('.js')?'text/javascript':'text/html'});r.end(b);});}).listen(0);
const GPU=process.env.GPU?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-gpu-rasterization','--ignore-gpu-blocklist','--enable-accelerated-2d-canvas']:[];
const b=await playwright.chromium.launch({args:GPU});const pg=await b.newPage({viewport:{width:+(process.env.W||1440),height:+(process.env.H||900)},deviceScaleFactor:+(process.env.DPR||2)});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto(`http://localhost:${srv.address().port}/production/viatge/perf.html`);await pg.waitForFunction('window.ready');
const o=JSON.parse(process.env.O||'{"v":0,"p":0.18,"a":0.2}');
for(const sk of [{},{far:1},{plain:1},{near:1},{balloon:1},{far:1,plain:1,near:1,balloon:1}])console.log(JSON.stringify(sk),await pg.evaluate(([o,sk])=>window.perf(o,sk),[o,sk]));
await b.close();srv.close();
