// The loading cover (0.40, at Marc's request of 3 November 2026): every activity is shown only when what it needs at its start is ready,
// with a progress ring meanwhile; the recorded sounds are read in slices so the page keeps drawing; the WebGL engines report the share
// of their first programs that is linked.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cpuSheet,glLoadShare,LOAD_MAX,LOAD_SMOOTH,LOAD_GAP} from '../dist/carrega.js';
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
// a WebGL mock: programs that finish compiling when told, and count the waits for their link status
function gl(){const g={COMPLETION:0x91B1,LINK_STATUS:0x8B82,waits:0,ready:new Set(),fail:new Set(),getProgramParameter(p,k){if(k===g.LINK_STATUS){g.waits++;return !g.fail.has(p);}return g.ready.has(p);},getShaderInfoLog:()=>'bad',getProgramInfoLog:()=>''};return g;}
const prog=p=>({p,v:0,f:0,ok:null});
// the engines' use(): checks the link once, and says why a program fails
const use=g=>o=>{if(o.ok===null){o.ok=!!g.getProgramParameter(o.p,g.LINK_STATUS);if(!o.ok)console.warn('Prova: shader',g.getShaderInfoLog(o.f));}g.used=(g.used||0)+1;return o.ok;};

test('the share of the linked programs: in the background where the browser can, one per call where it cannot',()=>{
 const g=gl(),par={COMPLETION_STATUS_KHR:g.COMPLETION},list=[prog('a'),prog('b'),null,prog('c')];
 assert.equal(glLoadShare(g,list,par,use(g)),0,'nothing compiled yet');assert.equal(g.waits,0,'asking does not wait');
 g.ready.add('a');g.ready.add('c');assert.ok(Math.abs(glLoadShare(g,list,par,use(g))-2/3)<1e-9);assert.equal(list[0].ok,true);
 g.ready.add('b');assert.equal(glLoadShare(g,list,par,use(g)),1);
 // without parallel compile, every call waits for one program only, so the cover can move between them
 const h=gl(),slow=[prog('a'),prog('b'),prog('c')];const shares=[glLoadShare(h,slow,null,use(h)),glLoadShare(h,slow,null,use(h)),glLoadShare(h,slow,null,use(h))];
 assert.deepEqual(shares.map(v=>Math.round(v*3)),[1,2,3]);assert.equal(h.waits,3);assert.equal(h.used,3,'each settled once, with the engine\'s own use()');
 // a program that fails is settled (left out of the drawing, as the engines do) and says why
 const k=gl();k.fail.add('a');const warn=console.warn;let said='';console.warn=(...m)=>{said=m.join(' ');};try{assert.equal(glLoadShare(k,[prog('a')],null,use(k)),1);}finally{console.warn=warn;}assert.match(said,/Prova: shader bad/);
 assert.equal(glLoadShare(gl(),[],null,use(gl())),1,'nothing to wait for');
 assert.ok(LOAD_MAX>=20000&&LOAD_SMOOTH>=3&&LOAD_GAP>=120);});

test('the recorded sounds are read in slices, one task each, and their share settles at 1 (failures too)',async()=>{
 let decoded=0;globalThis.OfflineAudioContext=class{decodeAudioData(data,ok,fail){if(data.byteLength===1){fail(new Error('bad'));return;}decoded++;ok({duration:.5,sampleRate:44100,getChannelData:()=>new Float32Array(64)});}};
 const {loadSamples,samplesLoaded,samplesReady}=await import('../dist/sampler.js?slices');
 assert.equal(samplesLoaded(),0,'before loading');let calls=0,tasks=0;const load=file=>{calls++;return new ArrayBuffer(calls%50===0?1:8);};
 const iv=setInterval(()=>tasks++,0);
 const all=loadSamples({load,slice:0});const first=calls;assert.equal(first,1,'with no time to spare, one sample per task');
 await new Promise(r=>setTimeout(r,5));assert.ok(calls>first,'the next slices come in later tasks');assert.ok(samplesLoaded()>0&&samplesLoaded()<1);
 const n=await all;clearInterval(iv);assert.equal(samplesLoaded(),1);assert.equal(n,samplesReady());assert.equal(n,decoded);assert.ok(n<calls,'a failed one is settled but not counted');
 assert.ok(calls>300,'the whole bank');assert.equal(loadSamples(),all,'once per page');delete globalThis.OfflineAudioContext;});

test('at most a few sounds are decoded at a time, so the finished ones do not come back in one burst',async()=>{
 let now=0,most=0;globalThis.OfflineAudioContext=class{decodeAudioData(data,ok){now++;most=Math.max(most,now);setTimeout(()=>{now--;ok({duration:.5,sampleRate:44100,getChannelData:()=>new Float32Array(64)});},1);}};
 const {loadSamples,samplesLoaded}=await import('../dist/sampler.js?pool');const n=await loadSamples({load:()=>new ArrayBuffer(8),pool:4});
 assert.ok(most<=4&&most>=2,`at most 4 at a time (${most})`);assert.equal(samplesLoaded(),1);assert.ok(n>300);delete globalThis.OfflineAudioContext;});

test('a sheet is painted on a canvas kept in memory (the processor draws it) and copied once to an ordinary canvas',()=>{
 const made=[];globalThis.document={createElement(tag){const cv={tag,width:0,height:0,opts:null,calls:[],getContext(type,opts){cv.opts=opts||null;return {drawImage:(src,x,y)=>cv.calls.push(['drawImage',src,x,y]),fillRect:()=>cv.calls.push(['fillRect'])};}};made.push(cv);return cv;}};
 try{const sheet=cpuSheet(320,200,(x,w,h)=>{x.fillRect(0,0,w,h);});
  assert.equal(made.length,2);assert.deepEqual(made[0].opts,{willReadFrequently:true},'painted with the processor');assert.deepEqual(made[0].calls.map(c=>c[0]),['fillRect']);
  assert.equal(sheet,made[1]);assert.equal(made[1].opts,null,'the copy is an ordinary canvas');assert.equal(made[1].calls[0][1],made[0]);assert.deepEqual([sheet.width,sheet.height],[320,200]);}
 finally{delete globalThis.document;}
 assert.match(read('../dist/masia-pinzell.js'),/if\(!sheet\)\{sheet=cpuSheet\(w,h,paint\);/,'every masia sheet (panorama by hour, sets of the episodes)');});

test('every engine and every activity: the cover in the app, the ring in the stylesheet, the module in the build',async()=>{
 const app=read('../dist/app.js'),css=read('../dist/style.css'),build=read('../build_standalone.py');
 // every engine settles its programs with its own use() (Pinta el món reads its uniforms there: 0.40 review fix)
 for(const [f,u] of [['fons','fgUse'],['selva','sgUse'],['sabana','sbUse'],['pou','pgUse'],['gegants','gglUse'],['pinta','pwUse']])assert.match(read(`../dist/${f}-gl.js`),new RegExp(`\\.par,o=>${u}\\(gl,o\\)\\);\\}`),f);
 for(const f of ['fons','selva','sabana','pou','gegants']){const m=await import(`../dist/${f}-gl.js`);assert.equal(typeof m[`${f}Load`],'function',f);assert.equal(m[`${f}Load`](),1,'no WebGL outside the browser: nothing to wait for');}
 const pinta=await import('../dist/pinta-gl.js');assert.equal(pinta.pintaLoad(),1);
 const art=await import('../dist/cause-art.js');for(const id of ['jelly','jungle','savanna','well','giants','flower'])assert.equal(art.diveLoad(id),1,id);
 assert.match(app,/const LOAD_DIVES=\['jelly','jungle','savanna','well','giants'\];/);
 // the cover goes up in start, before the activity's first frame, for every activity
 assert.match(app,/<\/main><\/div>`;loadBegin\(item\);updateGameUI\(\);/);assert.match(app,/class="load-cover\$\{heavy\?' load-now':''\}" role="progressbar" aria-label="S’està preparant l’activitat"/);
 // 0.40.1 (Marc, Iris Xe laptop): slow activities show the ring at once and are drawn only after it has been seen and the screen has gone full
 assert.match(app,/const LOAD_HEAVY=\['masia','pinta','viatge','encaix','pluja-colors',\.\.\.LOAD_DIVES\],LOAD_RING_FIRST=300,LOAD_SETTLE=150,LOAD_FULL_WAIT=1200;/);
 assert.match(app,/if\(L\.frames<=2\|\|now<L\.hold\|\|!loadSettled\(L,now\)\)\{L\.smooth=0;return false;\}/);
 assert.match(app,/const L=loading;if\(L\)L\.fs=true;/);assert.match(app,/document\.addEventListener\('fullscreenchange',loadMark\);/);
 // under the cover no time passes, the switches and the choices do nothing, no sound, no taste of the board, no cue
 assert.match(app,/const covered=!!loading&&!loadTick\(dt\);if\(!loading&&!paused&&!modal&&!document\.hidden\)\{/);
 assert.match(app,/if\(page==='game'&&loading\)return;/);assert.match(app,/function select\(i\)\{if\(loading\|\|paused\|\|/);
 assert.match(app,/running=!loading&&!paused/);assert.match(app,/if\(game\.cueWanted&&!loading&&/);assert.equal((app.match(/master\.gain\.value=loading\?0:settings\.volume\/100\*\.35;/g)||[]).length,2);
 assert.match(app,/const canvas=covered\?null:\$\('#game-canvas'\);/);assert.match(app,/function home\(\)\{loading=null;/);
 // when it lifts: the first option with its whole time, the sound up in 0.4 s; the menu decodes the sounds in the background
 assert.match(app,/function loadEnd\(\)\{loading=null;[^\n]*\n scan\.reset\(\);/);assert.match(app,/linearRampToValueAtTime\(g,t\+\.4\)/);assert.match(app,/if\(!samplesLoaded\(\)\)setTimeout\(\(\)=>\{if\(page==='home'\)loadSamples\(\);\},4000\);/);
 for(const rule of ['.load-now .load-ring{animation:load-in .25s ease forwards}','.load-cover{position:absolute;inset:0;z-index:11;','.load-cover.gone{opacity:0;','animation:load-in .5s ease .4s forwards','stroke-dashoffset:calc(100 - var(--load-p,0))','.load-spin{position:absolute;inset:-14%;animation:load-turn'])assert.ok(css.includes(rule),rule);
 assert.match(build,/for name in \['carrega\.js','input\.js',/);});
