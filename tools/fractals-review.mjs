// Stills of «Fractals a la natura» for review (no videos: Marc, 31 October 2026). node tools/fractals-review.mjs <outdir> [ids…] [--n presses] [--gap s] [--at t,t,…] [--dpr 1] [--lap 0] [--png]
// Each id is run from its own first press (frFirst), pressing n times gap seconds apart, with stills at the given moments.
import {createRequire} from 'node:module';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname),args=process.argv.slice(2),opt=k=>{const i=args.indexOf('--'+k);return i>=0?args.splice(i,2)[1]:null;};
const png=args.includes('--png');if(png)args.splice(args.indexOf('--png'),1);const P=+(opt('n')||1),gap=+(opt('gap')||9),dpr=+(opt('dpr')||1),lap=+(opt('lap')||0),only=opt('at');const out=args.shift()||'/tmp/fr';fs.mkdirSync(out,{recursive:true});
const require=createRequire(import.meta.url);let pw;for(const m of ['playwright','/opt/node22/lib/node_modules/playwright','/opt/node-tools/node_modules/playwright']){try{pw=require(m);break;}catch{}}const {chromium}=pw;
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.mp3':'audio/mpeg','.png':'image/png','.jpg':'image/jpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});}).listen(0);
const port=srv.address().port,b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const pg=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});pg.on('console',m=>console.log('page:',m.text()));pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto(`http://localhost:${port}/tools/fractals-prova.html`);await pg.waitForFunction(()=>window.ready);
const ids=args.length?args:await pg.evaluate(()=>window.FR_IDS);
for(const id of ids){const shots=only?only.split(',').map(Number):[2.5,5,9];
 const r=await pg.evaluate(([id,P,gap,shots,dpr,lap,png])=>{window.FR_PNG=png;return window.frShots(id,P,gap,shots,1920*dpr,1080*dpr,lap);},[id,P,gap,shots,dpr,lap,png]);
 r.out.forEach((o,i)=>fs.writeFileSync(path.join(out,`${id}_${String(i+1).padStart(2,'0')}_t${o.t}.${png?'png':'jpg'}`),Buffer.from(o.url.split(',')[1],'base64')));
 console.log(id,'segments',r.out.map(o=>o.n).join(' '),'ms',Math.round(r.ms));}
await b.close();srv.close();
