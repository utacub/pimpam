// El viatge en globus in the built app: open it from its folder, time the cover, hold the switch, let go, pictures and frame rate.
// Usage: [DPR=2] [GPU=1] node tools/viatge-app.mjs <built.html> <outdir> [width] [height]
import {createRequire} from 'node:module';import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720']=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const args=['--autoplay-policy=no-user-gesture-required',...(process.env.GPU?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-gpu-rasterization']:[])];
const browser=await playwright.chromium.launch({args}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:+(process.env.DPR||1)});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('file://'+html);await page.waitForTimeout(1200);
await page.locator('.card-open[data-folder="premut"]').click();await page.waitForTimeout(300);const t0=Date.now();await page.locator('.cards [data-start="viatge"]').first().click();
await page.waitForFunction(()=>!document.querySelector('.load-cover:not(.gone)'),null,{timeout:60000,polling:50});console.log('cover',Date.now()-t0,'ms');
const fps=async ms=>page.evaluate(ms=>new Promise(r=>{let n=0,worst=0,last=performance.now();const t0=last;const f=t=>{n++;worst=Math.max(worst,t-last);last=t;if(t-t0<ms)requestAnimationFrame(f);else r({fps:+(n/(t-t0)*1000).toFixed(1),worst:Math.round(worst)});};requestAnimationFrame(f);}),ms);
const st=()=>page.evaluate(()=>({phase:document.querySelector('#stage')?.dataset.phase,progress:document.querySelector('#progress')?.textContent,live:document.querySelector('#live')?.textContent}));
await page.waitForTimeout(6500);console.log('after takeoff',JSON.stringify(await st()),JSON.stringify(await fps(3000)));await page.screenshot({path:out+'/1_enlairat.jpg',type:'jpeg',quality:80});
await page.keyboard.down('Space');await page.waitForTimeout(500);console.log('burning',JSON.stringify(await st()));const f1=await fps(5000);await page.waitForTimeout(4500);console.log('climb fps',JSON.stringify(f1));await page.screenshot({path:out+'/2_amunt.jpg',type:'jpeg',quality:80});
await page.keyboard.up('Space');await page.waitForTimeout(1500);console.log('released',JSON.stringify(await st()));const f2=await fps(5000);console.log('top fps',JSON.stringify(f2));await page.screenshot({path:out+'/3_dalt.jpg',type:'jpeg',quality:80});
await page.waitForTimeout(14000);await page.screenshot({path:out+'/4_baixant.jpg',type:'jpeg',quality:80});console.log('sinking',JSON.stringify(await st()));
console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();
