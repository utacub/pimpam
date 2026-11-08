// El taller de vehicles (0.53) in the built HTML, with WebGL (SwiftShader): the home and its folder, the card, the ⓘ panel, the activity
// through a whole vehicle (three pieces, the wait with its ring, the press, the ramp, the ride, the garage, the next round), the settings
// tab and the decor without the room; the errors of the page. Real time: SwiftShader draws a frame in seconds, so the pictures catch the
// moment they can; «Qualitat» is set to Alta first so the automatic tier does not drop because of the slow software renderer.
// Usage: node tools/vehicles-app.mjs <built.html> <outdir> [width] [height] [dpr] [full|ui]
// «ui» stops after the activity has opened (the home, the folder, the card, the ⓘ panel, the bench with its tray, the settings tab, the pause):
// the in-activity pictures of a delivery come from tools/vehicles-frames.mjs, which draws one deterministic frame per moment.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720',dArg='2',mode='full']=process.argv.slice(2),W=+wArg,H=+hArg,DPR=+dArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const errors=[];
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'&&!/willReadFrequently/.test(m.text()))errors.push(m.text());});
const t0=Date.now(),log=(...a)=>console.log(((Date.now()-t0)/1000).toFixed(1)+'s',...a);
await page.goto('file://'+html);await page.waitForTimeout(1500);
const shot=async s=>{await page.screenshot({path:`${out}/${s}.jpg`,type:'jpeg',quality:88,timeout:180000});log('shot',s);};
// closing a dialog leaves the activity paused: the «Continua» button resumes it
const closeDialog=async()=>{await page.keyboard.press('Escape');await page.waitForTimeout(300);await page.evaluate(()=>document.querySelector('dialog[open]')?.close());await page.waitForTimeout(400);await page.evaluate(()=>document.querySelector('[data-resume]')?.click());await page.waitForTimeout(600);};
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(60);await page.keyboard.up('Space');};
const stage=()=>page.evaluate(()=>{const st=document.querySelector('#stage');return {state:st?.dataset.scanState,stage:st?.dataset.scanStage,loading:!!document.querySelector('.load-cover:not(.gone)'),progress:document.querySelector('#progress')?.textContent||'',scanned:document.querySelector('[data-choice].scanned')?.getAttribute('aria-label')||''};});
const until=async(f,max=120000,every=250)=>{const s=Date.now();while(Date.now()-s<max){const v=await stage();if(f(v))return v;await page.waitForTimeout(every);}return {timeout:true,...(await stage())};};
await shot('00_portada');
await page.evaluate(()=>document.querySelector('[data-folder="triar"]')?.click());await page.waitForTimeout(900);await shot('01_carpeta_triar_i_crear');
await page.evaluate(()=>document.querySelector('[data-card="vehicles"]')?.scrollIntoView({block:'center'}));await page.waitForTimeout(400);await shot('02_fitxa');
await page.evaluate(()=>document.querySelector('[data-info="vehicles"]')?.click());await page.waitForTimeout(900);await shot('03_panell_informacio');
await page.evaluate(()=>{const d=document.querySelector('dialog[open]');d?.querySelector('.info-grid')?.scrollTo(0,10000);});await page.waitForTimeout(400);await shot('04_panell_informacio_final');
await closeDialog();
await page.evaluate(()=>document.querySelector('[data-start="vehicles"]')?.click());await page.waitForTimeout(800);await shot('05_carrega');
log('loaded',JSON.stringify(await until(v=>!v.loading,180000)));await page.waitForTimeout(1500);
// the quality to Alta (the software renderer would make the automatic tier drop)
await page.evaluate(()=>document.querySelector('.stage-tools [data-settings]')?.click());await page.waitForTimeout(500);await page.evaluate(()=>document.querySelector('[data-tab="activity"]')?.click());await page.waitForTimeout(400);
await page.selectOption('#vhQuality','alta').catch(e=>log('no vhQuality select',String(e).slice(0,80)));await page.waitForTimeout(300);await shot('06_ajustos_activitat');
await page.keyboard.press('Escape');await page.waitForTimeout(300);await page.evaluate(()=>document.querySelector('dialog[open]')?.close());await page.waitForTimeout(1500);await shot('07_pausa');await page.evaluate(()=>document.querySelector('[data-resume]')?.click());await page.waitForTimeout(1500);
await shot('08_taller_safata');log(JSON.stringify(await stage()));
// the real frame loop: frame times measured with requestAnimationFrame for ms milliseconds
const frames=async ms=>page.evaluate(ms=>new Promise(res=>{const d=[];let last=performance.now();const end=last+ms;const f=t=>{d.push(t-last);last=t;if(t<end)requestAnimationFrame(f);else{d.sort((a,b)=>a-b);res({n:d.length,mean:+(d.reduce((a,b)=>a+b,0)/d.length).toFixed(1),p95:+d[Math.floor(d.length*.95)].toFixed(1),max:+d.at(-1).toFixed(1)});}};requestAnimationFrame(f);}),ms);
log('frames at the bench',JSON.stringify(await frames(12000)));
if(mode==='ui'){console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();process.exit(0);}
// SwiftShader draws a frame in about a second and the app advances its clock at most 100 ms a frame: the activity runs at a tenth of its speed here
const game=async(seconds)=>page.waitForTimeout(seconds*1000*10);
await game(2.5);await shot('09_focus_carrosseria');log(JSON.stringify(await stage()));
await press();await game(.7);await shot('10_vol_de_la_peca');await game(1.6);await shot('11_clac');log(JSON.stringify(await stage()));
log('choose',JSON.stringify(await until(v=>v.state==='choose'&&v.stage==='1',600000)));await game(2);await shot('12_focus_rodes');
await press();await game(2.2);await shot('13_rodes_posades');log(JSON.stringify(await stage()));
log('choose',JSON.stringify(await until(v=>v.state==='choose'&&v.stage==='2',600000)));await game(2);await shot('14_focus_accessori');
await press();await game(1.2);await shot('15_ultima_peca');await game(2.2);await shot('16_espera_anell');log(JSON.stringify(await stage()));
await press();log('start pressed');await game(1.2);await shot('17_arrencada');await game(1.6);await shot('18_rampa');
await game(2.8);await shot('19_volta_1');await game(3.5);await shot('20_volta_2');await game(3);await shot('21_volta_3');
await game(2.4);await shot('22_arribada');await game(1.6);await shot('23_garatge');log(JSON.stringify(await stage()));
log('next round',JSON.stringify(await until(v=>v.state==='choose'&&v.stage==='0',600000)));await game(1.5);await shot('24_ronda_seguent_tarda');
// the decor without the room, on black, and dimmed
const decor=async(v,name)=>{await page.evaluate(()=>document.querySelector('.stage-tools [data-settings]')?.click());await page.waitForTimeout(500);await page.evaluate(()=>document.querySelector('[data-tab="common"],[data-tab="general"],[data-tab="look"]')?.click());await page.waitForTimeout(300);
 const ok=await page.selectOption('[data-string="background"]',v).then(()=>true).catch(()=>false);await page.waitForTimeout(300);await closeDialog();await page.waitForTimeout(2500);if(ok)await shot(name);else log('no background select for',v);};
await decor('none','25_sense_decorat');await decor('dim','26_decorat_atenuat');await decor('full','27_decorat_sencer');
console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();
