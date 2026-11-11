// Writes dist/pwa-fitxers.json (0.76): the list of every file that the installed app (PWA) keeps for offline use,
// with its size and a hash of its content. pwa.js shows the total size before installing and downloads exactly this
// list; on later versions it downloads only the files whose hash changed. The Pages workflow runs this script before
// publishing, so the list always matches the published dist/. Usage: node tools/pwa-build.mjs [dist]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const DIST=process.argv[2]||'dist';
// Not part of the app: trial pages, the list itself, the service worker (the browser keeps it), the single-file build, notes.
const SKIP=[/^proves\//,/^pwa-fitxers\.json$/,/^sw\.js$/,/^Pim_Pam_.*\.html$/,/\.md$/,/(^|\/)\./];
const files=[];
(function walk(dir){for(const e of fs.readdirSync(path.join(DIST,dir),{withFileTypes:true})){
 const rel=dir?dir+'/'+e.name:e.name;
 if(e.isDirectory()){walk(rel);continue;}
 if(!e.isFile()||SKIP.some(r=>r.test(rel)))continue;
 const buf=fs.readFileSync(path.join(DIST,rel));
 files.push([rel,buf.length,crypto.createHash('sha256').update(buf).digest('hex').slice(0,16)]);
}})('');
files.sort((a,b)=>a[0]<b[0]?-1:1);
const version=(/const APP_VERSION='([^']+)'/.exec(fs.readFileSync(path.join(DIST,'app.js'),'utf8'))||[])[1]||'';
const total=files.reduce((s,f)=>s+f[1],0);
const hash=crypto.createHash('sha256').update(files.map(f=>f[0]+' '+f[2]).join('\n')).digest('hex').slice(0,16);
fs.writeFileSync(path.join(DIST,'pwa-fitxers.json'),JSON.stringify({version,hash,total,files}));
console.log('pwa-fitxers.json',version,files.length,'files',(total/1048576).toFixed(1),'MB');
