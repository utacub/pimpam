// La nova Pluja de colors (0.52): the pictures of the «Informació» panel (one per sheet: the bath once its gesture is done, as the
// paper is about to take it) and of the home card (the card's preview: Barcelona's «Cua de paó»), into production/info/.
// Usage: node tools/marbre-info.mjs  (then python3 production/info/make_info.py)
import {openMb} from './marbre-frames.mjs';
import {writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url)),tmp=mkdtempSync(join(tmpdir(),'marbre-info-'))+'/';
const {browser,page,errors}=await openMb(768,432,1);
const shot=async(order,file)=>{await page.evaluate(o=>window.paint(o),order);writeFileSync(file,await page.locator('#c').screenshot({type:'png'}));};
for(let i=0;i<20;i++)await shot({name:'i',s:{waitCue:false},sheet:[Math.floor(i/4),i%4,4,0]},tmp+`color-rain_${String(i+1).padStart(2,'0')}.png`);
await browser.close();
const card=await openMb(976,546,1);await card.page.evaluate(o=>window.paint(o),{name:'c',s:{waitCue:false},preview:true});writeFileSync(tmp+'card.png',await card.page.locator('#c').screenshot({type:'png'}));await card.browser.close();
if(errors.length||card.errors.length)console.log('ERRORS',errors,card.errors);
execFileSync('python3',['-c',`
from PIL import Image
import os
d='${tmp}';out='${root}production/info/'
for i in range(1,21):
    im=Image.open(d+'color-rain_%02d.png'%i).convert('RGB').resize((384,216),Image.LANCZOS)
    q=84
    while True:
        im.save(out+'img/color-rain_%02d.jpg'%i,quality=q,optimize=True)
        if os.path.getsize(out+'img/color-rain_%02d.jpg'%i)<28500 or q<=60:break
        q-=4
im=Image.open(d+'card.png').convert('RGB').resize((488,273),Image.LANCZOS);im.save(out+'cards/color-rain.jpg',quality=84,optimize=True)
print('ok',[os.path.getsize(out+'img/color-rain_%02d.jpg'%i) for i in range(1,21)],os.path.getsize(out+'cards/color-rain.jpg'))
`],{stdio:'inherit'});
rmSync(tmp,{recursive:true,force:true});
