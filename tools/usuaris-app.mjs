// 0.46 in the built HTML: the settings inside an activity, a user made with only a name, its record, a «Vídeo a poc a poc» that stops
// and darkens at its marks, the personalised activities by user, and a user exported, deleted and imported again.
// Usage: node tools/usuaris-app.mjs <built.html> <video.webm> <outdir> [dpr]
import {createRequire} from 'node:module';
import {mkdirSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,video,out,dprArg='1']=process.argv.slice(2),dpr=+dprArg;mkdirSync(out,{recursive:true});
const ctx=await playwright.chromium.launchPersistentContext(mkdtempSync(join(tmpdir(),'us-')),{viewport:{width:1280,height:800},deviceScaleFactor:dpr,acceptDownloads:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=ctx.pages()[0]||await ctx.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('dialog',d=>d.accept());
const ok=(cond,what)=>{checks.push(`${cond?'OK ':'FALLA'} ${what}`);};
const shot=async n=>page.screenshot({path:`${out}/${n}.jpg`,type:'jpeg',quality:74});
const wait=ms=>page.waitForTimeout(ms);
await page.goto('file://'+html);await wait(1500);
try{
ok(await page.locator('.user-chip').innerText()==='Convidat','opens as the guest');
// 1. the settings inside an activity
const toPersonal=async()=>{if(!await page.locator('.ps-tools').count())await page.locator('.card-open[data-folder="personal"]').click();await wait(500);};
const open=async id=>{await page.evaluate(id=>{const b=document.createElement('button');b.dataset.start=id;document.body.append(b);b.click();b.remove();},id);await page.waitForFunction(()=>!document.querySelector('.load-cover:not(.gone)'),null,{timeout:30000});await wait(500);};
await open('lighthouse');await page.click('.stage-tools [data-settings]');await wait(300);
ok(await page.locator('[data-tab="activity"].active').count()===1,'the settings open on «Aquesta activitat» inside El far');ok(await page.locator('#farSpeed').count()===1,'the light speed is there');await shot('01-far-aquesta-activitat');
await page.click('[data-tab="general"]');await wait(200);ok(await page.locator('#farSpeed,#femShirt,#exMode').count()===0,'not in the general tab');await shot('02-far-general');
await page.click('[data-close-settings] >> nth=0');await page.keyboard.press('Escape');await wait(400);
await page.click('.settings-button');await wait(300);ok(await page.locator('[data-tab="activity"]').count()===0&&await page.locator('#farSpeed,#femShirt,#exMode,#interaction,#dayMoments').count()===0,'the menu settings have no activity settings');await page.click('[data-close-settings] >> nth=0');await wait(300);
await open('castells');await page.click('.stage-tools [data-settings]');await wait(300);ok(await page.locator('[data-setting="femShirt"]').count()>5&&await page.locator('[data-check="plainScene"]').count()===1,'Fem castells: shirt and plain background');await shot('03-castells-aquesta-activitat');await page.click('[data-close-settings] >> nth=0');await page.keyboard.press('Escape');await wait(400);
// 2. a user
await page.click('.user-chip');await wait(300);await shot('04-usuaris-convidat');await page.fill('#user-new-name','Martina');await page.click('[data-user-create]');await wait(600);
ok((await page.locator('.user-chip').innerText()).includes('Martina'),'Martina plays');
await open('kaleido');for(let i=0;i<3;i++){await page.keyboard.press('Space');await wait(2200);}await wait(1500);await page.keyboard.press('Escape');await wait(500);
await open('castells');for(let i=0;i<2;i++){await page.keyboard.press('Space');await wait(3000);}await page.keyboard.press('Escape');await wait(500);
// 3. a Vídeo a poc a poc for Martina
await page.locator('.card-open[data-folder="personal"]').click();await wait(400);await page.locator('[data-ps-new]').first().click();await page.waitForSelector('#ps-editor');
await page.fill('#pe-name','El parc');await page.fill('#pe-child','Martina');await page.click('[data-pe-tpl="video"]');await page.setInputFiles('#pe-files',video);
await page.waitForFunction(()=>{const s=document.querySelector('#pe-status');return s&&s.hidden&&document.querySelectorAll('.pe-item').length===1;},null,{timeout:60000});
await page.click('[data-pe-set="pauseMode"][data-value="marks"]');await wait(200);await page.fill('#pe-marks-0','0:03, 0:07');await page.click('[data-pe-preview="0"]');await wait(1200);
await page.evaluate(()=>{const v=document.querySelector('#pe-video');v.currentTime=9.5;});await wait(600);await page.click('[data-pe-mark="0"]');await wait(200);
ok(await page.inputValue('#pe-marks-0')==="0:03, 0:07, 0:09'5",'a pause marked while watching: '+await page.inputValue('#pe-marks-0'));await shot('05-editor-video');
await page.click('[data-pe-save]');await wait(1200);ok(await page.locator('.ps-card').count()===1,'the activity is in Martina’s folder');await shot('06-carpeta-martina');
const id=await page.locator('.ps-card [data-start]').getAttribute('data-start');await open(id);await wait(800);
const st=()=>page.evaluate(()=>{const v=document.querySelector('video')||null;return {status:document.querySelector('#live')?.textContent||'',progress:document.querySelector('#progress')?.innerHTML||''};});
await shot('07-video-abans');await page.keyboard.press('Space');await wait(1500);await shot('08-video-avanca');await wait(2500);await shot('09-video-pausa-fosc');
const p1=await page.evaluate(()=>document.querySelectorAll('#progress .done').length);await page.keyboard.press('Space');await wait(4600);const p2=await page.evaluate(()=>document.querySelectorAll('#progress .done').length);
ok(p1===1&&p2===2,`pause by pause (${p1}, ${p2})`);for(let i=0;i<3;i++){await page.keyboard.press('Space');await wait(3200);}await shot('10-video-final');await page.keyboard.press('Escape');await wait(500);
// 4. the record
await page.click('.user-chip');await wait(400);await page.click('[data-user-log]');await wait(400);const rows=await page.locator('.log-days li').count();ok(rows===3,`three lines in the record: kaleido, castells and the video (${rows})`);await shot('11-registre');
const [csv]=await Promise.all([page.waitForEvent('download'),page.click('[data-log-csv]')]);ok(/registre-martina/.test(csv.suggestedFilename()),'the record as CSV: '+csv.suggestedFilename());await page.click('[data-close-log] >> nth=0');await wait(400);
// 5. the guest does not see Martina's activities
await page.click('[data-user-enter="guest"]');await wait(800);await toPersonal();ok(await page.locator('.ps-card').count()===0,'the guest does not see them');
// 6. export, delete, import
await page.click('.user-chip');await wait(400);const uid=await page.locator('[data-user-export]').getAttribute('data-user-export');
const [dl]=await Promise.all([page.waitForEvent('download'),page.click(`[data-user-export="${uid}"]`)]);const file=join(out,dl.suggestedFilename());await dl.saveAs(file);ok(/usuari-martina\.zip$/.test(file),'exported: '+dl.suggestedFilename());
await page.click(`[data-user-delete="${uid}"]`);await wait(800);ok(await page.locator('.user-row').count()===1,'deleted');
await page.setInputFiles('#users-import-file',file);await page.waitForFunction(()=>/importat/.test(document.querySelector('#users-status')?.textContent||''),null,{timeout:60000});await shot('12-importat');
ok(await page.locator('.user-row').count()===2,'imported');await page.click(`[data-user-enter="${uid}"]`);await wait(800);await toPersonal();ok(await page.locator('.ps-card').count()===1,'its activity is back');
await page.click('.user-chip');await wait(300);await page.click('[data-user-log]');await wait(300);ok(await page.locator('.log-days li').count()===3,'its record is back');
}catch(e){console.log('STOP',e.message.split('\n')[0]);await shot('99-error');}
console.log(checks.join('\n'));console.log(errors.length?'ERRORS:\n'+errors.join('\n'):'no page errors');await ctx.close();
