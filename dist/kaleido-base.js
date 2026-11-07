// Caleidoscopi (CE21): shared helpers and the common timeline (appear, evolve, settle, dissolve) of the twenty patterns.
export const K_TAU=Math.PI*2;
export const Kclamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const Ksmooth=x=>{x=Kclamp(x);return x*x*(3-2*x)};
export const KeaseOut=x=>1-Math.pow(1-Kclamp(x),3);
export const KeaseInOut=x=>{x=Kclamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
export const KeaseBack=x=>{x=Kclamp(x);return 1+2.2*Math.pow(x-1,3)+1.2*Math.pow(x-1,2)};
export const Krand=(i,seed=0)=>{const v=Math.sin(i*91.17+seed*53.31+7.13)*24634.6345;return v-Math.floor(v)};
export const Krgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
export const Kmix=(a,b,n)=>{const x=Krgb(a),y=Krgb(b);return '#'+x.map((v,i)=>Math.round(v*(1-n)+y[i]*n).toString(16).padStart(2,'0')).join('');};
export const Krgba=(hex,alpha)=>{const [r,g,b]=Krgb(hex);return `rgba(${r},${g},${b},${Kclamp(alpha).toFixed(3)})`;};
export const Kramp=(stops,x)=>{x=Kclamp(x)*(stops.length-1);const i=Math.min(stops.length-2,Math.floor(x));return Kmix(stops[i],stops[i+1],x-i);};
// Cyclic ramp: the last colour leads back to the first, for hues that go all the way round.
export const Kloop=(stops,x)=>{x=((x%1)+1)%1*stops.length;const i=Math.floor(x)%stops.length;return Kmix(stops[i],stops[(i+1)%stops.length],x-Math.floor(x));};
// Gaussian bump centred on c: a soft pulse that never switches on or off abruptly.
export const Kbump=(x,c,width)=>Math.exp(-Math.pow((x-c)/width,2));
// Safety ceiling for any rotation in this activity: one turn every four seconds. A design criterion, not a clinical threshold.
export const KALEIDO_MAX_TURN=K_TAU/4;
export const KALEIDO_MIN_DURATION=8;
export function kaleidoTimeline(duration){const D=Math.max(.5,duration),appear=Math.min(.55,D*.1),dissolve=Math.min(.9,D*.15),settle=Kclamp(D*.25,Math.min(1.5,D*.2),3),settleAt=Math.max(appear,D-dissolve-settle);return {D,appear,dissolve,settle,settleAt,fadeAt:D-dissolve};}
// Appear from the centre, evolve, settle into a stable pose that still breathes, then dissolve to black.
export function kaleidoPhase(t,duration,reduced=false){
 const L=kaleidoTimeline(duration),grow=reduced?.82+.18*KeaseOut(t/L.appear):.12+.88*KeaseBack(t/L.appear);
 const alpha=(.35+.65*Ksmooth(t/(L.appear*.7)))*(1-Ksmooth((t-L.fadeAt)/L.dissolve));
 const evolve=Kclamp((t-L.appear)/Math.max(.1,L.settleAt-L.appear)),ramp=.8,x=Kclamp((t-L.settleAt)/ramp);
 // The motion clock slows to a quarter during the settle: the integral of a smoothstep keeps the rotation free of jerks.
 const motion=t-.75*(ramp*(x**3-x**4/2)+Math.max(0,t-L.settleAt-ramp));
 return {...L,t,grow,alpha:t>=L.D?0:alpha,evolve,motion:reduced?0:motion,clock:motion};
}
// Musical grid over the evolution: about 0.28–0.45 s per step whatever the duration, so longer effects get more steps, not slower ones.
export function kaleidoGrid(duration,steps){const L=kaleidoTimeline(duration),span=L.settleAt-L.appear,m=Math.max(1,Math.round(span/4.55)),n=steps*m;return {L,m,n,step:span/n,time:i=>L.appear+i*span/n};}
