// Bombolles sense pes (CE05, 0.63) · the picture: the matter of the moment drawn by the engine (bombolles-motor.js, WebGL2 with a
// floating-point picture, its glow and its tone mapping) and copied into the canvas of the app. Always on black: the settings of the
// decor and the base do not apply (as in Pluja de colors), and without WebGL2 the screen stays black and the help says why (the music
// still plays). The size of the picture adapts to the speed of the computer (glAdapt, as in the other WebGL activities).
import {BMB,bmbSetup,bmbCanvas,bmbBegin,bmbEnd,bmbRopeReset,bmbReady,bmbProgramsList,bmbSettle} from './bombolles-motor.js';
import {lbmProgramsList} from './bombolles-lbm.js';
import {gasProgramsList} from './bombolles-gas.js';
import {glLoadShare,glAdapt} from './carrega.js';
import {escWaitClock,ESC_WAIT_START} from './escenari.js';
import {bbStim} from './bombolles.js';
const BBR={st:{scale:1,ema:16,slow:0,fast:0,last:0},fixed:0};
// the loading cover: the programs of the pictures and of the liquid solver, compiled together (1 without WebGL2)
const bbPrograms=()=>{const list=bmbProgramsList();return list.length?[...list,...lbmProgramsList(BMB.gl),...gasProgramsList(BMB.gl)]:list;};
export function bbLoad(){if(typeof document==='undefined')return 1;const list=bbPrograms();if(!list.length)return 1;return glLoadShare(BMB.gl,list,BMB.par,bmbSettle);}
// from the home page, where the browser compiles in the background
export function bbPrewarm(){if(typeof document==='undefined'||!bmbReady()||!BMB.par)return false;bbPrograms();return true;}
export const bbGlFailed=()=>typeof document!=='undefined'&&!bmbReady();
// for the review tools: a fixed scale of the picture
export function bbFixedScale(k){BBR.fixed=k||0;}
// the darkness of the wait (the share of the app's darkness: about a third at most)
export const BB_DARK=.5;
export function bbDraw(c,w,h,G,s,preview=false){const F=G?.bombolles,cv=c.canvas,W=cv.width,H=cv.height;
 c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,W,H);
 // the card shows its picture (CARD_IMG); without WebGL2 the screen stays black
 if(!F||preview||!bmbReady()){c.restore();return;}
 // a new matter takes the shape of the screen of the moment
 if(!F.S||F.k===0)F.AR=W/Math.max(1,H);
 if(!F.S){c.restore();return;}
 const scale=glAdapt(BBR.st,BBR.fixed,'bubbles'),rw=Math.max(64,Math.round(W*scale)),rh=Math.max(36,Math.round(H*scale));
 if(!bmbSetup(rw,rh)||!bmbBegin(F.S.t)){c.restore();return;}
 bmbRopeReset();bbStim(F).pinta(F.S);bmbEnd(F.S.post||{});
 c.imageSmoothingEnabled=true;c.drawImage(bmbCanvas(),0,0,rw,rh,0,0,W,H);
 if(s?.waitCue!==false&&F.phase!=='out'&&F.phase!=='black'){const wk=escWaitClock(F.wait||ESC_WAIT_START,F.t),dark=(wk.dark||0)*BB_DARK;if(dark>.005){c.fillStyle=`rgba(0,0,0,${dark.toFixed(3)})`;c.fillRect(0,0,W,H);}}
 c.restore();}
