// 0.45.6: the shirt colour of Fem castells in the built HTML. Opens the settings, keeps a picture of the swatches, picks one,
// opens Fem castells, presses a few times and keeps a picture. Usage: node tools/castells-camisa-app.mjs <built.html> <outdir> <colour key> [dpr]
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,key='verd',dpr='1']=process.argv.slice(2);
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:+dpr});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('file://'+html);await page.waitForTimeout(1500);
await page.locator('[data-settings]').first().click();await page.waitForTimeout(500);
const field=page.locator('.swatches.shirts').first();await field.scrollIntoViewIfNeeded();
const box=page.locator('.field',{has:field}).first();await box.screenshot({path:`${out}/ajust_camisa_abans.png`});
const visible=await field.evaluate(e=>e.innerText.trim());console.log('visible text inside the swatches:',JSON.stringify(visible));
await page.locator(`[data-setting="femShirt"][data-value="${key}"]`).click();await page.waitForTimeout(300);
await page.locator('.swatches.shirts').first().scrollIntoViewIfNeeded();
await page.locator('.field',{has:page.locator('.swatches.shirts')}).first().screenshot({path:`${out}/ajust_camisa_${key}.png`});
console.log('saved setting:',await page.evaluate(()=>JSON.stringify(Object.entries(localStorage).map(([k,v])=>[k,(v.match(/"femShirt":"[a-z]+"/)||[''])[0]]).filter(x=>x[1]))));
await page.keyboard.press('Escape');await page.waitForTimeout(300);await page.evaluate(()=>document.querySelector('[data-settings-close],.dialog [data-close]')?.click());
await page.locator('.card-open[data-folder="historia"]').click();await page.waitForTimeout(400);
await page.locator('[data-start="castells"]').first().click();
await page.waitForFunction(()=>!document.querySelector('.load-cover:not(.gone)'),null,{timeout:45000,polling:100});await page.waitForTimeout(1500);
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(80);await page.keyboard.up('Space');};
for(let k=0;k<4;k++){await press();await page.waitForTimeout(8600);}
await page.screenshot({path:`${out}/castells_${key}_dpr${dpr}.jpg`,type:'jpeg',quality:80});
console.log('errors',errors.length?errors.join('\n'):'none');await browser.close();
