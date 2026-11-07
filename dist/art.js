import {cincRender,isCinc} from './cinc.js';
import {vgRender} from './viatge-art.js';
import {fpScene} from './flor-escena.js';
import {psIs} from './persona.js';
import {plIs} from './pellicules.js';
import {psRender} from './persona-art.js';
import {drawPaperFlower} from './visual-patterns.js';
import {renderExtraCause} from './cause-art.js';
import {renderScanActivity} from './scan-art.js';

const PI=Math.PI,TAU=PI*2;
const images={};
// 0.47.3: La llenyataire was removed with its lumberjack drawings; nothing is loaded here any more, but the menu still waits on this.
const ready=Promise.resolve();
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const rand=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)};
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),0,0,TAU);c.fill()}
// Caleidoscopi with «Contrast alt»: always plain black, with or without decor and on either base, so that only the form is seen.
function background(c,w,h,id,s){const plain=id==='kaleido'&&s.kaleidoContrast;c.fillStyle=s.base==='white'&&!plain?'#fff':'#000';c.fillRect(0,0,w,h);if(s.background==='none'||plain)return;c.save();c.globalAlpha=s.background==='dim'?s.opacity/100:1;
 const palettes={flower:['#123b83','#0d697d'],kaleido:['#000000','#0b0920'],'color-rain':['#09142d','#163654'],jelly:['#010a14','#071c28'],jungle:['#03120d','#0a2a1f'],savanna:['#2a2440','#c9a860'],well:['#3a2a20','#c8a070'],rain:['#080f29','#183c59'],vitrall:['#000000','#0d0a16'],natura:['#000000','#0a0d12'],piro:['#03041a','#121a4e']};const p=['drawings','toys','kitchen'].includes(id)?(s.base==='white'?['#ffffff','#f3f2f8']:['#000000','#06050e']):palettes[id]||(['constellations','jelly'].includes(id)?['#071d34','#243956']:['#103c68','#137b79']);
 const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,p[0]);g.addColorStop(1,p[1]);c.fillStyle=g;c.fillRect(0,0,w,h);
 if(!['kaleido','color-rain','jelly','jungle','savanna','well','rain','vitrall','natura','piro','drawings','toys','kitchen'].includes(id)){c.strokeStyle='#d3e5da0b';for(let j=0;j<8;j++){c.beginPath();c.ellipse(w*.5,h*.5,w*(.2+j*.09),h*(.2+j*.09),-.25,0,TAU);c.stroke();}}
 c.restore();}
function flower(c,w,h,t=3,duration=6,s={base:'black',reduced:false},index=0){drawPaperFlower(c,w,h,t,duration,index,s.reduced,s.base);}
function render(c,w,h,id,game,s,preview=false){c.clearRect(0,0,w,h);if(isCinc(id)){cincRender(c,w,h,id,game,s,preview);return;}if(id==='viatge'){vgRender(c,w,h,game,s,preview);return;}if(id==='flower'){fpScene(c,w,h,game,s,preview);return;}if(psIs(id)||plIs(id)){psRender(c,w,h,id,game,s,preview);return;}background(c,w,h,id,s);if(renderScanActivity(c,w,h,id,game,s,preview))return;if(renderExtraCause(c,w,h,id,game,s,preview))return;if(id==='flower')flower(c,w,h,preview?s.duration*.48:game.time,s.duration,s,game.pattern||0);}
function setupCanvas(canvas){const rect=canvas.getBoundingClientRect();const maxDpr=canvas.dataset.preview?1.25:canvas.id==='hero-canvas'?1.5:2;const dpr=Math.min(window.devicePixelRatio||1,maxDpr),w=Math.max(1,rect.width),h=Math.max(1,rect.height);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return {c,w,h};}

export {background,clamp,flower,images,ready,render,setupCanvas};
