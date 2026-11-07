// Review video of the waiting scene (0.14.1), recorded from the built HTML itself: the page runs on a virtual clock (Playwright's
// page.clock), so every frame is drawn at its exact time however slow the machine is. The switch is pressed a few times with a rest
// between presses, to show the scene lit while a step runs and still and dark while it waits. Silent: the sound is that of 0.14.
// Usage: node tools/wait-video.mjs <built.html> <output.mp4> <activity id> [presses] [rest s] [fps] [setting on|off]
import {createRequire} from 'node:module';
import {mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,id,pressArg='3',restArg='3',fpsArg='30',cue='on']=process.argv.slice(2),PRESSES=+pressArg,REST=+restArg,FPS=+fpsArg,LEAD=2;
const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
await page.clock.install({time:new Date('2026-10-27T10:00:00Z')});
await page.goto('file://'+html);
// The clock would also flow in real time between frames (screenshots are slow): it is paused and only moved on frame by frame.
await page.clock.pauseAt(new Date('2026-10-27T10:00:05Z'));
if(cue==='off'){await page.evaluate(()=>localStorage.setItem('pimpam-profile',JSON.stringify({waitCue:false})));await page.reload();}
await page.clock.runFor(1500);await page.locator(`[data-start="${id}"]`).first().click();await page.clock.runFor(500);
// The length of each step with the default settings (the minimum of each activity, as the effect duration is 6 s).
const step={daynight:9,orchestra:8.5,constellations:7.5}[id]??8;
const tmp=out+'.frames';rmSync(tmp,{recursive:true,force:true});mkdirSync(tmp,{recursive:true});
const presses=Array.from({length:PRESSES},(_,i)=>LEAD+i*(step+REST)),total=LEAD+PRESSES*(step+REST)+.5;let f=0,down=-1;
for(let T=0;T<total;T+=1/FPS,f++){
 if(presses.some(p=>Math.abs(p-T)<.5/FPS)){await page.keyboard.down('Space');down=f;}
 if(down>=0&&f===down+3){await page.keyboard.up('Space');down=-1;}
 await page.clock.runFor(1000/FPS);writeFileSync(`${tmp}/${String(f).padStart(5,'0')}.jpg`,await page.screenshot({type:'jpeg',quality:90}));}
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(FPS),'-i',`${tmp}/%05d.jpg`,'-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',out]);
rmSync(tmp,{recursive:true,force:true});await browser.close();console.log(out,`${PRESSES} pulsacions, ${total.toFixed(1)} s`);
