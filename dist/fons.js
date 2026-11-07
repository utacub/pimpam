import {escScore} from './escenari.js';
/* Fons marí de vidre · CE06 · Pim Pam 0.28
 * The dive. Twenty stimuli in one continuous descent from the surface of the sea to the abyssal floor; after the twentieth, a fast
 * climb back to the surface. Each press: a travelling of the camera (FONS_TRAVEL s) from where the scene stopped to the next
 * creatures, then the stimulus; at its end the scene slows to a stop and darkens (escWaitClock) until the next press.
 * The creatures and the sea are drawn with WebGL2 (fons-gl.js, fons-shaders.js). This file: the poses, the camera and the clocks.
 */
export const FONS_TRAVEL=2,FONS_STIM=12,FONS_RETURN=5,FONS_N=20;
// The length of a press: travelling + stimulus (at least FONS_STIM; longer if «Durada» asks for it) + the climb after the last one.
export const fonsDuration=(i,duration=FONS_STIM)=>FONS_TRAVEL+Math.max(FONS_STIM,duration)+(i===FONS_N-1?FONS_RETURN:0);
// World: x to the right, y up, the surface at y=0, the floor near y=-22.95. A pose: the centre of the screen and its height in
// world units. FONS_SURF: just under the surface, where the dive starts and ends.
export const FONS_SURF=Object.freeze([0,-.24,1]);
// [x, y, height, how much the camera pulls back in the middle of the travelling (log of the zoom), drift during the stimulus:
// dx, dy (in screen heights) and change of the height]. Travellings: horizontal, vertical, diagonal, zoom in, zoom out, and mixes.
export const FONS_POSES=Object.freeze([
 [2.7,-.25,1.0,.10,.10,-.02,-.05],     // 1 surface fleet: horizontal, along the surface
 [3.7,-1.85,1.0,.25,-.06,.06,-.04],    // 2 moon jellies: diagonal, down and right
 [2.0,-3.35,1.15,.20,.08,-.03,-.04],   // 3 silver shoal: diagonal, down and left, a little wider
 [2.32,-3.62,.42,0,-.06,.02,-.05],     // 4 Venus girdles: zoom in
 [2.32,-4.42,.46,.18,.06,-.04,-.05],   // 5 salp chains: vertical, down
 [.55,-5.70,1.35,.15,-.05,.02,-.04],   // 6 sea angels: zoom out, down and left
 [-1.70,-6.10,1.0,.12,.08,0,-.05],     // 7 fried-egg jellies: horizontal, to the left
 [-1.70,-8.10,1.0,.35,-.04,-.05,-.04], // 8 comb jellies: vertical, pulling back in the middle
 [-1.43,-8.30,.36,0,.06,.03,-.05],     // 9 glass squid: zoom in
 [-.35,-8.75,.52,.15,-.06,-.02,-.05],  // 10 glass octopus: diagonal, right and down
 [1.60,-11.10,1.6,.25,.06,-.02,-.03],  // 11 siphonophore: zoom out, down
 [2.24,-11.48,.56,0,-.05,.03,-.05],    // 12 larvacean palace: zoom in
 [2.24,-13.70,1.3,.30,.04,-.04,-.04],  // 13 Deepstaria: vertical, down, wider
 [-.45,-15.10,1.0,.15,-.07,0,-.05],    // 14 Atolla: diagonal, left and down
 [-.25,-15.38,.45,0,.05,.03,-.05],     // 15 vampire squid: zoom in
 [1.60,-17.60,1.2,.25,-.06,-.03,-.04], // 16 pyrosomes: diagonal, right and down, wider
 [-1.00,-19.60,1.0,.20,.08,0,-.04],    // 17 lanternfish: diagonal, left and down
 [-1.00,-22.62,1.0,.30,0,.02,-.05],    // 18 glass sponges: vertical, down to the floor
 [1.45,-22.66,1.0,.08,.07,0,-.04],     // 19 sea pens and feather stars: horizontal, along the floor
 [2.95,-22.70,.72,.06,-.04,.03,-.04]   // 20 dumbo octopuses: horizontal, a little closer
].map(Object.freeze));
export const FONS_NAMES=Object.freeze(['La flota de veles blaves','Medusa de lluna','El banc de plata','Cinturons de Venus','Cadenes de salpes','Àngels de mar','Medusa ou ferrat','Ctenòfors irisats','Calamar de vidre','Pop de vidre','El sifonòfor','El palau del larvaci','El vel de seda','Atolla, la sirena blava','Calamar vampir','Pirosomes','Peixos llanterna','Jardí d’esponges de vidre','Plomes de mar i lliris','Pops dumbo']);
const Fclamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const Fsmooth=x=>{x=Fclamp(x);return x*x*(3-2*x);};
const Fsmoother=x=>{x=Fclamp(x);return x*x*x*(x*(x*6-15)+10);};
// Where the camera rests after stimulus i (before the first press, and after the last one: the surface).
export function fonsRest(i){if(i<0||i>=FONS_N)return FONS_SURF;const p=FONS_POSES[i];return [p[0]+p[4]*p[2],p[1]+p[5]*p[2],p[2]*(1+p[6])];}
function fonsDrift(i,t,stim){const p=FONS_POSES[i],u=Fsmooth((t-FONS_TRAVEL)/stim);return [p[0]+p[4]*p[2]*u,p[1]+p[5]*p[2]*u,p[2]*(1+p[6]*u)];}
// A travelling from pose a to pose b (u from 0 to 1): the centre moves with an easing that starts and ends softly, the height moves
// in log scale with a bump in the middle (the camera pulls back while it travels: more for the longer journeys).
function fonsTravel(a,b,u,bump){const e=Fsmoother(u),lz=Math.log(a[2])+(Math.log(b[2])-Math.log(a[2]))*e+bump*Math.sin(Math.PI*e);
 return [a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e,Math.exp(lz)];}
// The camera t seconds after the press of stimulus i (from: where it was when the press came).
export function fonsCamera(i,t,stim=FONS_STIM,from=fonsRest(i-1)){stim=Math.max(FONS_STIM,stim);
 if(t<FONS_TRAVEL)return fonsTravel(from,fonsDrift(i,FONS_TRAVEL,stim),t/FONS_TRAVEL,FONS_POSES[i][3]);
 if(i===FONS_N-1&&t>FONS_TRAVEL+stim)return fonsTravel(fonsRest(i),FONS_SURF,(t-FONS_TRAVEL-stim)/FONS_RETURN,1.25);
 return fonsDrift(i,Math.min(t,FONS_TRAVEL+stim),stim);}
// The scenes to draw: the stimulus and, during the travelling, the one left behind, which goes on moving and fades away. tau: the
// clock of each scene (the scene clock of the app: it wakes after the press and stops while the scene waits). After the climb the
// last scene is gone.
export function fonsLayers(i,t,tau,prevTau,stim=FONS_STIM){const out=[];if(i<0)return out;stim=Math.max(FONS_STIM,stim);
 const climb=i===FONS_N-1?Fsmooth((t-FONS_TRAVEL-stim-.4)/2):0;if(climb<1)out.push({scene:i,tau,alpha:1-climb});
 if(i>0&&prevTau!==null&&prevTau!==undefined&&t<FONS_TRAVEL+.2)out.unshift({scene:i-1,tau:prevTau,alpha:1-Fsmooth((t-.5)/1.5)});
 return out;}
// How much glow each depth gets (the deep scenes glow more).
export const fonsBloom=cam=>.10+.12*Fsmooth((-cam[1]-4)/10);

/* The music of the dive: one piece for each stimulus, played by recorded instruments (sampler.js) and natural sounds, with the
 * character of its creatures. The travelling has its own sound: a glissando of the harp in the direction the camera goes (down while
 * it descends, a wave while it travels sideways, glockenspiel sparks when it comes closer) over bubbles, or the waves at the surface.
 * Then bass, a broken chord pattern, a melody and an answer, on four chords; the gestures of the creatures (a beat of a bell, a jet, a
 * wheel of light) have their own notes at the moment they happen (scene clock tau = t − 0.3 once awake). Every piece ends on a
 * plucked or struck chord that dies away before the scene stops. After the twentieth, the climb: the harp rises, bubbles, the waves.
 */
const FM_SCALES=Object.freeze({major:[0,2,4,5,7,9,11],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],dorian:[0,2,3,5,7,9,10],aeolian:[0,2,3,5,7,8,10]});
// The hash of the shaders (common.glsl h21, h11), to find when the creatures move.
const fmFract=x=>x-Math.floor(x);
function fmH11(x){let a=fmFract(x*123.34),b=fmFract((x*1.37+.5)*456.21);const d=a*(a+45.32)+b*(b+45.32);a+=d;b+=d;return fmFract(a*b);}
// Seconds after the press at which a beating bell (period P, phase o: beat in the shaders) closes, from scene time a to b.
const fmBeats=(P,o,a,b)=>{const out=[];for(let k=Math.ceil(a/P+o);(k-o)*P<b;k++)out.push((k-o)*P+.3);return out;};
// [root, mode, bpm, lead, answer, arp, bass, spark, chords (degrees), motif ([degree, beats] … null = rest), arp figure, arp octave,
//  lead octave]
const FM_PIECES=Object.freeze([
 [62,'lydian',84,'fluteRec','glockRec','harpRec','celliPizzRec','glockRec',[0,4,5,1],[[4,1],[6,.5],[7,.5],[9,2],[7,1],[6,1],[4,2]],[0,4,7,9,11,9,7,4],0,1],
 [65,'major',72,'clarinetRec','harpRec','harpRec','harpRec','glockRec',[0,5,3,4],[[2,1.5],[4,.5],[5,1],[4,1],[2,3],[1,1]],[0,2,4,7,4,2],0,0],
 [57,'dorian',96,'violinsPizzRec','marimbaRec','marimbaRec','celliPizzRec','triangleRec',[0,6,3,4],[[7,.5],[9,.5],[10,.5],[9,.5],[7,1],[4,1],[5,.5],[7,.5],[4,1],[2,2]],[0,4,7,4,9,4,7,4],0,1],
 [64,'lydian',76,'violinsRec','glockRec','glockRec','harpRec','triangleRec',[0,1,5,4],[[4,2],[6,1],[7,1],[11,3],[9,1]],[0,2,4,6,7,9,11,9],1,0],
 [55,'mixolydian',80,'oboeRec','marimbaRec','marimbaRec','celliPizzRec','glockRec',[0,6,3,0],[[4,1],[5,1],[7,2],[6,1],[4,1],[2,2]],[0,4,7,11,7,4],0,1],
 [60,'major',88,'fluteRec','violinsPizzRec','harpRec','violinsPizzRec','glockRec',[0,3,4,5],[[7,.5],[9,.5],[11,1],[9,.5],[7,.5],[4,2],[5,1],[7,1]],[0,4,7,9,7,4],0,1],
 [58,'major',76,'clarinetRec','oboeRec','marimbaRec','celliPizzRec','glockRec',[0,3,1,4],[[4,1],[2,1],[4,1],[7,1],[6,2],[4,2]],[0,2,4,7,9,7,4,2],0,1],
 [64,'major',80,'glockRec','fluteRec','harpRec','celliPizzRec','triangleRec',[0,5,3,4],[[7,1],[9,1],[11,1],[14,1],[11,2],[9,2]],[0,4,7,11,14,11,7,4],0,0],
 [62,'dorian',84,'oboeRec','violinsPizzRec','violinsPizzRec','celliPizzRec','glockRec',[0,3,6,4],[[2,1],[4,1],[3,1],[1,1],[0,2],[4,2]],[0,4,7,4],0,0],
 [57,'aeolian',72,'clarinetRec','harpRec','harpRec','celliPizzRec','glockRec',[0,5,3,6],[[4,2],[3,1],[2,1],[0,2],[4,1],[6,1]],[0,2,4,7,4,2],0,1],
 [64,'dorian',86,'fluteRec','glockRec','marimbaRec','celliPizzRec','glockRec',[0,3,4,6],[[4,1],[7,1],[9,1],[7,1],[6,.5],[4,.5],[3,1],[4,2]],[0,4,7,9,7,4],0,1],
 [60,'dorian',96,'oboeRec','marimbaRec','marimbaRec','celliPizzRec','glockRec',[0,6,5,4],[[7,.5],[6,.5],[4,1],[2,1],[4,1],[6,1],[7,3]],[0,4,7,9,7,4,0,4],0,1],
 [61,'lydian',66,'violinsRec','harpRec','harpRec','celliPizzRec','glockRec',[0,1,5,4],[[4,3],[6,1],[7,2],[11,2],[9,4]],[0,4,7,11,7,4],0,0],
 [59,'aeolian',70,'clarinetRec','glockRec','glockRec','celliPizzRec','triangleRec',[0,5,6,4],[[0,2],[2,1],[4,1],[3,2],[2,2]],[0,2,4,7],1,0],
 [61,'dorian',70,'celliRec','violinsPizzRec','violinsPizzRec','celliPizzRec','glockRec',[0,6,5,4],[[4,2],[3,1],[2,1],[0,3],[-1,1]],[0,4,7,9,7,4],0,0],
 [57,'dorian',78,'fluteRec','glockRec','marimbaRec','celliPizzRec','glockRec',[0,3,1,4],[[4,1],[2,1],[4,1],[6,1],[7,2],[4,2]],[0,4,7,4,9,7],0,0],
 [54,'aeolian',76,'oboeRec','glockRec','harpRec','celliPizzRec','glockRec',[0,5,2,4],[[7,1],[6,1],[4,2],[2,1],[4,1],[0,2]],[0,4,7,9,7,4],1,1],
 [64,'dorian',70,'fluteRec','glockRec','harpRec','celliPizzRec','triangleRec',[0,3,5,4],[[7,2],[9,1],[10,1],[9,2],[7,2]],[0,4,7,11,7,4],1,0],
 [55,'lydian',74,'oboeRec','harpRec','harpRec','marimbaRec','glockRec',[0,1,4,0],[[4,1],[6,1],[7,2],[9,1],[7,1],[4,2]],[0,4,7,9,11,9,7,4],0,1],
 [60,'major',92,'fluteRec','marimbaRec','marimbaRec','celliPizzRec','glockRec',[0,3,4,0],[[7,.5],[9,.5],[7,.5],[4,.5],[5,1],[4,1],[2,1],[0,1],[4,2]],[0,4,7,4],0,1]
].map(([root,mode,bpm,lead,answer,arp,bass,spark,chords,motif,figure,arpOct,leadOct])=>Object.freeze({root,mode,bpm,lead,answer,arp,bass,spark,chords,motif,figure,arpOct,leadOct})));
// The range in which each recorded instrument sounds well; notes outside it are moved by octaves.
const FM_RANGE=Object.freeze({harpRec:[36,100],marimbaRec:[45,96],glockRec:[79,108],fluteRec:[60,96],oboeRec:[58,91],clarinetRec:[50,89],violinsRec:[55,98],celliRec:[36,72],violinsPizzRec:[55,96],celliPizzRec:[33,70]});
const fmFit=(inst,m)=>{const r=FM_RANGE[inst];if(!r)return m;while(m<r[0])m+=12;while(m>r[1])m-=12;return m;};
// The overall level of the dive (sampler gain grows with vel²) and of each piece, measured on the review copy (tools/fons-review.mjs,
// AUDIO_ONLY=1): about −29.5 LUFS for each press, as the other stories.
export const FONS_LOUD=1.52;
const FM_TRIM=Object.freeze([.94,.99,1.05,1.02,.99,1.04,1.01,1.13,.95,1.01,.96,.99,1.01,.98,.96,.96,1.04,.93,1.03,1.01]);
// The gestures of each scene, at their own moments (seconds after the press). n(t,len,inst,degrees,vel,octave,extra), fx(variant,t,
// len,vel), S: length of the stimulus.
const FM_CUES=Object.freeze([
 (n,fx,S)=>{fx('waves',2,S*.85,.14);for(const t of [2.6,5.2,8.4])n(t,1.6,'glockRec',[7,11],.16,1,{strum:.08});},
 (n,fx,S)=>{for(const t of fmBeats(1.9+.5*fmH11(1),fmH11(4),.2,S+1.6))n(t,1.4,'harpRec',[0],.26,-1);for(const t of fmBeats(1.9+.5*fmH11(2),fmH11(5),.2,S+1.6))n(t+.05,1.2,'harpRec',[4],.16,1);},
 (n,fx,S)=>{for(let k=0;k*3.5<S+1.5;k++){const t=k*3.5+.3;if(t<1.8)continue;for(let j=0;j<6;j++)n(t-.35+j*.07,.4,'violinsPizzRec',[j],.18+j*.02,1);fx('muted',t,.5,.14,'triangleRec');}},
 (n,fx,S)=>{for(let k=0;k<S/3-1;k++){const t=2.4+k*3;for(let j=0;j<7;j++)n(t+j*.09,1.2,'glockRec',[k%2?11-j:j+4],.12,0);}},
 (n,fx,S)=>{for(let t=2.3;t<S+1;t+=1.8)n(t,.7,'marimbaRec',[Math.round(t/1.8)%2?4:7],.2,0);},
 (n,fx,S)=>{for(let k=0;k<12;k++){const t=2.5+fmH11(k+30)*(S-2);n(t,.4,'violinsPizzRec',[7+Math.floor(fmH11(k+40)*5)],.14,1);}},
 (n,fx,S)=>{for(const t of fmBeats(2.7,fmH11(1),.2,S+1.6))n(t,1,'marimbaRec',[0,4],.2,-1);},
 (n,fx,S)=>{for(let k=0;k<S/6;k++){const t=2.6+k*6;for(let j=0;j<5;j++)n(t+j*.12,1.4,'glockRec',[j*2],.14,0);fx('hit',t+.6,2,.1,'triangleRec');}},
 (n,fx,S)=>{for(let k=1;k*3.6<S+1;k++){const t=(k+.12)*3.6+.3;for(let j=0;j<6;j++)n(t+j*.05,.6,'harpRec',[9-j],.16,1);n(t,.6,'celliPizzRec',[0],.28,-1);}},
 (n,fx,S)=>{for(const t of fmBeats(2.5,fmH11(1),.2,S+1.6))n(t,1.2,'marimbaRec',[0],.22,-1);},
 (n,fx,S)=>{for(let t=2.2;t<S+1.5;t+=1.4)n(t,.6,'marimbaRec',[4],.14,0);},
 (n,fx,S)=>{for(let t=2.1;t<S+1.5;t+=1.25)n(t,.5,'marimbaRec',[0,7],.15,-1);for(let k=0;k<10;k++)n(2.5+fmH11(k+50)*(S-2),.5,'glockRec',[7+Math.floor(fmH11(k+60)*4)],.08,1);},
 (n,fx,S)=>{n(3,4.5,'violinsRec',[4,7],.18,1);for(let j=0;j<10;j++)n(6.6+j*.08,1.6,'harpRec',[j],.18,0);if(S>15)n(10.5+(S-12)*.5,3,'violinsRec',[2,6],.15,1);},
 (n,fx,S)=>{fx('hit',1.3,3,.14,'triangleRec');for(let j=0;j<6;j++)n(1.2+j*.12,1.6,'glockRec',[j*2],.13,0);fx('hit',4.6,2.5,.09,'triangleRec');fx('hit',6.6,2.5,.08,'triangleRec');n(4.7,1.4,'glockRec',[11],.09,0);n(6.7,1.4,'glockRec',[9],.08,0);},
 (n,fx,S)=>{for(let j=0;j<5;j++)n(3.9+j*.2,.6,'celliPizzRec',[7-j*2],.26,-1);fx('hit',6.3,3,.14,'triangleRec');for(let j=0;j<14;j++)n(6.3+j*.15,1.4,'glockRec',[4+Math.floor(fmH11(j+70)*9)],.12,0);for(let j=0;j<9;j++)n(10.3+j*.1,1.5,'harpRec',[j],.16,0);},
 (n,fx,S)=>{[1,3.2,4.5,6,8.5].forEach((t,k)=>{for(let j=0;j<3;j++)n(t+.3+j*.18,1.2,'glockRec',[[0,4,7][j]+k%3],.13-k*.01,0);});},
 (n,fx,S)=>{for(let k=0;k<16;k++)n(2.3+fmH11(k+80)*(S-1.5),.6,'glockRec',[Math.floor(fmH11(k+90)*8)],.07,0);},
 (n,fx,S)=>{fx('drips',2,S*.9,.1);for(let t=2.8;t<S+1;t+=3.9)fx('hit',t,2.5,.08,'triangleRec');for(const t of fmBeats(3,.3,.2,S+1.6))n(t,1,'harpRec',[0,4],.15,-1);},
 (n,fx,S)=>{[.8,1.4,2,2.6,3.2,3.8].forEach((t,k)=>n(t+.3,1.4,'glockRec',[k*2],.11,0));for(let t=5;t<S;t+=4.2)for(let j=0;j<6;j++)n(t+j*.08,1,'harpRec',[j+2],.13,1);},
 (n,fx,S)=>{for(const t of fmBeats(2.2,fmH11(1),.2,S+1.6)){n(t,.4,'marimbaRec',[4],.18,0);n(t+.18,.4,'marimbaRec',[7],.14,0);}}
]);
// The score of stimulus i (0–19) for a press of the given duration («Durada»; at least FONS_STIM), in the format of escScore.
export function fonsScore(i,duration=FONS_STIM){i=((i%FONS_N)+FONS_N)%FONS_N;const S=Math.max(FONS_STIM,duration),D=fonsDuration(i,duration),M=FM_PIECES[i],sc=FM_SCALES[M.mode],E=escScore(D),T0=FONS_TRAVEL,L=FONS_LOUD*FM_TRIM[i];
 const deg=(d,o=0)=>M.root+12*(o+Math.floor(d/7))+sc[((d%7)+7)%7];
 const n=(t,len,inst,ds,vel,o=0,x={})=>E.add(t,len,inst,[...new Set([].concat(ds).map(d=>fmFit(inst,deg(d,o))))],vel*L,x);
 const fx=(variant,t,len,vel,inst='natureRec')=>E.add(t,len,inst,[60],vel*L,{variant});
 // the travelling
 const a=i>0?FONS_POSES[i-1]:FONS_SURF,b=FONS_POSES[i],dy=b[1]-a[1],closer=b[2]<a[2]*.7;
 if(i===0)fx('waves',0,2.6,.2);else fx('bubbles',.05,2.4,.16);
 if(closer)for(let j=0;j<6;j++)n(.3+j*.22,1.2,'glockRec',[j*2],.12,0);
 else if(dy<-.6)for(let j=0;j<14;j++)n(.15+j*.11,.9,'harpRec',[13-j],.2-j*.006,1);
 else for(let j=0;j<10;j++)n(.2+j*.15,.9,'harpRec',[[4,6,7,9,11,9,7,6,4,2][j]],.17,1);
 // the piece: bars of four beats on the chords, the last bar is the cadence
 const beat=60/M.bpm,B=4*beat,bars=Math.max(2,Math.floor(S/B)),cad=T0+S-B;
 for(let k=0;k<bars-1;k++){const t=T0+k*B,r=M.chords[k%M.chords.length];
  n(t,B*.5,M.bass,[r],.36,M.bass==='harpRec'||M.bass==='marimbaRec'?-1:-2);n(t+2*beat,B*.4,M.bass,[r+4],.26,M.bass==='harpRec'||M.bass==='marimbaRec'?-1:-2);
  M.figure.forEach((f,j)=>{const u=t+j*B/M.figure.length;if((j+k)%7===6||u>=cad)return;n(u,beat*1.4,M.arp,[r+f],j%4===0?.22:.17,M.arpOct);});
  if(k%2===0)n(t+.02,1.6,M.spark,[r+7],.12,1);}
 // the melody on bars 1–2, its answer (a third lower, another instrument) on 3–4, the melody again if there is time
 const phrase=(t0,inst,shift,vel,oct)=>{let u=t0;for(const [d,bt] of M.motif){if(u>=cad-.2)break;if(d!==null)n(u,Math.min(bt*beat*1.15,cad-u),inst,[d+shift],vel,oct);u+=bt*beat;}};
 phrase(T0+B*.5,M.lead,0,.34,M.leadOct);if(bars>3)phrase(T0+B*2.5,M.answer,-2,.26,M.answer==='glockRec'?0:M.leadOct);if(bars>5)phrase(T0+B*4.5,M.lead,0,.3,M.leadOct);
 FM_CUES[i](n,(v,t,len,vel,inst)=>fx(v,t,len,vel,inst),S);
 // the cadence: a plucked chord, a struck bell, the bass, all dying away
 n(cad,2.6,'harpRec',[0,4,7,9,14],.3,0,{strum:.07});n(cad+.35,2.2,'glockRec',[7],.15,1);n(cad,1.2,M.bass==='harpRec'?'celliPizzRec':M.bass,[0],.32,-2);
 // after the twentieth: the climb to the surface
 if(i===FONS_N-1){const c=T0+S;fx('bubbles',c,4,.22);for(let j=0;j<24;j++)n(c+.2+j*.12,1,'harpRec',[j-3],.14+j*.004,0);fx('waves',c+3,D-c-3,.2);n(c+4.1,2.4,'harpRec',[0,4,7,14],.28,0,{strum:.08});n(c+4.3,2,'glockRec',[0,7],.16,1,{strum:.1});}
 return E.done();}
