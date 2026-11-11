// Fractals a la natura (CE46, 0.73) · the picture: the form of the moment drawn by the engine of light lines (fractals-motor.js) and
// copied into the canvas of the app. Always on black: the settings of the decor and the base do not apply (as in Pluja de colors and
// the Laboratori de matèria), and without WebGL2 the screen stays black and the help says why (the music still plays). The size of the
// picture adapts to the speed of the computer (glAdapt, as in the other WebGL activities).
import {FRM,frmSetup,frmDraw,frmCanvas,frmReady,frmProgramsList,frmSettle,frLin} from './fractals-motor.js';
import {glLoadShare,glAdapt} from './carrega.js';
import {escWaitClock,ESC_WAIT_START} from './escenari.js';
import {frStim,FR_STIMS,FR_OUT} from './fractals.js';
// the frame of every stimulus: the size of its concept picture (ChatGPT, 2026-11-11), filling the screen (cut at the sides of a narrower one)
export const FR_FW=1672,FR_FH=941;
const FRR={st:{scale:1,ema:16,slow:0,fast:0,last:0},fixed:0,pals:new Map()};
export function frLoad(){if(typeof document==='undefined')return 1;const list=frmProgramsList();if(!list.length)return 1;return glLoadShare(FRM.gl,list,FRM.par,frmSettle);}
export function frPrewarm(){if(typeof document==='undefined'||!frmReady()||!FRM.par)return false;frmProgramsList();return true;}
export const frGlFailed=()=>typeof document!=='undefined'&&!frmReady();
export function frFixedScale(k){FRR.fixed=k||0;}
// the darkness of the wait (the share of the app's darkness: about a third at most)
export const FR_DARK=.5;
const frPal=hexes=>{const k=hexes.join();let p=FRR.pals.get(k);if(!p){p=hexes.map((h,i)=>frLin(h,1+.5*i/4));FRR.pals.set(k,p);}return p;};
// the uniforms of a form at its moment: palettes, the slow breathing of the view, the wind, the way out
export function frUniforms(M,S,s){const T=S.t,still=!!s?.reduced;
 const view=still?[0,0,1,0]:[.004*Math.sin(T*.07+S.seed),.003*Math.sin(T*.053+S.seed*.3),1+.025*Math.sin(T*.041+1.3)+(S.full>=0?.02*Math.min(1,(T-S.full)/6):0),.012*Math.sin(T*.033+S.seed*.7)];
 const fade=S.exit>=0?Math.max(0,1-Math.max(0,T-S.exit-FR_OUT*.6)/(FR_OUT*.4)):1;
 const AR=FRM.view?.AR||16/9,k=Math.max(1/FR_FH,AR/FR_FW);
 return {T,frame:[(AR-FR_FW*k)/2,(1-FR_FH*k)/2,k],pal:frPal(M.pal),pal2:frPal(M.pal2||M.pal),view,wind:still?0:(M.wind||0),exit:S.exit,exitDur:FR_OUT,pulses:S.pulses,pulseV:M.pulseV||.42,fade,look:M.look,dmax:S.st.dmax};}
export function frDraw(c,w,h,G,s,preview=false){const F=G?.fractals,cv=c.canvas,W=cv.width,H=cv.height;
 c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,W,H);
 if(!F||preview||!frmReady()){c.restore();return;}
 F.AR=W/Math.max(1,H);
 if(!F.S){c.restore();return;}
 const scale=glAdapt(FRR.st,FRR.fixed,'fractals'),rw=Math.max(64,Math.round(W*scale)),rh=Math.max(36,Math.round(H*scale));
 if(!frmSetup(rw,rh)){c.restore();return;}
 const layers=[];if(F.old){const M=FR_STIMS.find(x=>x.id===F.old.id);if(M)layers.push({st:F.old.st,u:frUniforms(M,F.old,s)});}layers.push({st:F.S.st,u:frUniforms(frStim(F),F.S,s)});
 if(!frmDraw(layers)){c.restore();return;}
 c.imageSmoothingEnabled=true;c.drawImage(frmCanvas(),0,0,rw,rh,0,0,W,H);
 if(s?.waitCue!==false&&F.phase==='rest'){const wk=escWaitClock(F.wait||ESC_WAIT_START,F.t),dark=(wk.dark||0)*FR_DARK;if(dark>.005){c.fillStyle=`rgba(0,0,0,${dark.toFixed(3)})`;c.fillRect(0,0,W,H);}}
 c.restore();}
