import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
const read=f=>readFileSync(new URL(f,import.meta.url),'utf8');
// 0.49: the five dives play one video per scene when served over the web, and keep the live drawing offline.
test('the dives: one video per scene on disk, under the GitHub limit, wired into the app and the build',async()=>{
 const vd=await import('../dist/video-dives.js');
 assert.deepEqual([...vd.VD_IDS],['jelly','jungle','savanna','well','giants']);
 assert.equal(vd.vdAvailable(),false,'no videos outside the browser');assert.equal(vd.vdStart('jelly'),false);assert.equal(vd.vdOn('jelly'),false);
 assert.equal(vd.vdUrl('well',0),'./videos/pou/pou_escena_01.mp4');assert.equal(vd.vdUrl('giants',19),'./videos/gegants/gegants_escena_20.mp4');
 let total=0;for(const id of vd.VD_IDS)for(let v=0;v<20;v++){const f=new URL('../dist/'+vd.vdUrl(id,v).slice(2),import.meta.url);assert.ok(existsSync(f),f.pathname);const n=statSync(f).size;assert.ok(n<50e6,f.pathname);total+=n;}
 assert.ok(total<700e6,'the published site stays well under 1 GB');
 const app=read('../dist/app.js'),build=read('../build_standalone.py'),art=read('../dist/cause-art.js');
 assert.match(build,/'escenari\.js','video-dives\.js',/);
 for(const id of vd.VD_IDS)assert.match(art,new RegExp(`if\\(vdOn\\('${id}'\\)\\)\\{Cvideo\\(c,w,h,'${id}',g,s\\);return;\\}`));
 assert.match(app,/const bg=LOAD_DIVES\.includes\(id\)\?\{background:'full'\}:/,'the dives are always shown with the full decor');
 assert.match(app,/const dive=page==='game'&&LOAD_DIVES\.includes\(game\?\.item\?\.id\);/,'no decor choice inside a dive');
 assert.match(app,/if\(!vdAvailable\(\)\)prewarmDives\(\);/,'no shader warm-up on the home page when the videos are used');
 // 0.49.1: «Versió WebGL 2» (0.50.3; «Alta qualitat» in 0.50.2) on each dive card opens the live WebGL drawing instead of the videos
 assert.match(app,/data-start-hq="\$\{g\.id\}"[^>]*data-tip="Més requisits de maquinari">Versió WebGL 2<\/button>/);
 assert.match(app,/else if\(b\.dataset\.startHq\)start\(b\.dataset\.startHq,\{live:true\}\);/);assert.match(app,/if\(LOAD_DIVES\.includes\(id\)&&!opts\.live\)vdStart\(id,audio,master\);/);
});
