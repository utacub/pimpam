// The colour layer of the focus (0.40) in the built HTML: for each look of the highlight (frame and layer), pictures of the menu with its
// focus, a card activity (EN06) and a board activity (EN26) with the focus part of the way through an option, and the sample in the
// settings; lists the errors of the page. Usage: node tools/capa-app.mjs <built.html> <outdir> [width] [height] [dpr]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1000',hArg='625',dArg='2']=process.argv.slice(2),W=+wArg,H=+hArg,DPR=+dArg;mkdirSync(out,{recursive:true});
const LOOKS={
 grow:{scanFrame:'progress',scanFill:'grow',scanFillAlpha:40},
 sola:{scanFrame:'none',scanFill:'whole',scanFillAlpha:50},
 verda:{scanFrame:'whole',scanFill:'whole',scanFillAlpha:30,scanColor:'green',scanRelief:true},
};
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errors=[];
for(const [name,look] of Object.entries(LOOKS)){
 const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});
 page.on('pageerror',e=>errors.push(name+': '+e));page.on('console',m=>{if(m.type()==='error')errors.push(name+': '+m.text());});
 await page.clock.install({time:new Date('2026-11-03T10:00:00Z')});await page.goto('file://'+html);await page.clock.pauseAt(new Date('2026-11-03T10:01:00Z'));await page.clock.runFor(800);
 // the look goes in through the stored profile, as a teacher's saved settings would
 await page.evaluate(l=>{const p=JSON.parse(localStorage.getItem('pimpam-profile')||'{}');localStorage.setItem('pimpam-profile',JSON.stringify({...p,...l}));},look);
 await page.reload();await page.clock.runFor(800);
 const run=async(ms,step=50)=>{for(let t=0;t<ms;t+=step){await page.clock.runFor(step);if(t%1000===0)await page.waitForTimeout(20);}};
 const press=async()=>{await page.keyboard.down('Space');await page.clock.runFor(60);await page.keyboard.up('Space');};
 const shot=async s=>page.screenshot({path:`${out}/${name}_${s}.jpg`,type:'jpeg',quality:86});
 await press();await run(1200);await page.evaluate(()=>document.querySelector('.scan-target')?.scrollIntoView({block:'center'}));await run(200);await shot('menu');
 const menu=await page.evaluate(()=>{const t=document.querySelector('.scan-target');if(!t)return null;const a=getComputedStyle(t,'::after');return {p:t.style.getPropertyValue('--ring-p'),after:a.content,clip:a.clipPath,root:document.documentElement.className};});
 console.log(name,'menu',JSON.stringify(menu));
 await page.evaluate(()=>{document.querySelector('[data-start="dress"]').click();});await run(1500);await run(1400);await shot('vestidor');
 const card=await page.evaluate(()=>{const s=document.querySelector('.scanned');if(!s)return null;const f=s.querySelector('.ring-fill');const st=document.querySelector('#stage');return {stage:st.className,fill:f?getComputedStyle(f).display+' '+getComputedStyle(f).opacity:null,clip:f?getComputedStyle(f,'::after').clipPath:null};});
 console.log(name,'card',JSON.stringify(card));
 await page.evaluate(()=>{document.querySelector('[data-nav="home"]').click();});await run(800);
 await page.evaluate(()=>{document.querySelector('[data-start="masia"]').click();});await run(2500);await run(1200);await shot('masia');
 await page.evaluate(()=>{document.querySelector('.stage-tools [data-settings]')?.click();});await run(400);await page.evaluate(()=>document.querySelector('[data-tab="scanning"]')?.click());await run(300);
 await page.evaluate(()=>{const el=document.querySelector('.ring-sample');el?.scrollIntoView({block:'center'});});await run(1600);await shot('ajustos');
 await page.close();}
console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();
