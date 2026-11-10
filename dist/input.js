export const defaults = Object.freeze({name:'El meu perfil',mode:1,source:'keyboard',keys:['Space','Enter'],buttons:[0,1],pointer:[0,2],hold:[0,0],gap:[180,180],scanTime:2400,background:'none',opacity:25,base:'black',lock:true,duration:6,steps:5,sound:true,volume:40,reduced:false,swap:false,interaction:'effect',density:65,scanOptions:3,scanFirst:1000,scanDirection:'forward',scanStart:'auto',scanReturn:'first',scanGrouping:false,visualHint:true,freeRecipe:false,potPick:'choose',creativeSteps:2,dayMoments:8,waitCue:true,plainScene:false,speakOptions:false,scanVoiceGap:600,scanLaps:0,boardTaste:'sound',boardLabels:true,switchHint:true,scanFrame:'progress',scanColor:'orange',scanWidth:10,scanRelief:false,scanFill:'none',scanFillAlpha:40,farSpeed:'slow',farWindow:'wide',farBoats:1,tcWait:'short',vgRoute:'atzar',flMode:'jardi',flCount:4,flOpen:'mitjana',flFirst:'prat',flTint:'mig',flCreatures:true,flNature:true,mbSteps:5,mbGestures:'pintes',mbSize:'grans',mbColors:'tradicionals',mbLine:true,mbFirst:'barcelona',pjDrops:'curta',pjPresses:10,bbPresses:8,bbFirst:'sabo',pjView:'perspectiva',pjFlow:'lent',pjFirst:'llum',vgSeason:'atzar',vgDay:'normal',tcLeave:'never',fiRhythm:'normal',fiCalm:'variable',fiEarly:'res',fiPress:'never',fiFirst:'bitlles',dbColor:'own',dbSpeed:'normal',dbStill:false,kaleidoContrast:false,kaleidoColor:'yellow',ggCamera:'full',repeatScene:false,exMode:'encaixa',exHint:'imatge',exLike:'diferents',exHelp:'2',exGlow:true,exPace:'normal',vhSteps:'3',vhCells:'4',vhCorner:'habitacio',vhWho:'alumne',vhGo:'puls',vhRide:'mitja',vhCamera:'dinamica',vhGarage:true,vhQuality:'auto',femShirt:'ronda',dsPool:'20',dsFamily:'altres'});
// The highlight of the scanning focus (0.17): its colours, by name. The frame either draws itself as the time of the option runs out
// (scanFrame 'progress') or is whole from the start and jumps from option to option ('whole'); scanWidth is its thickness in pixels and
// scanRelief adds a shadow and a light to it. From 0.40 the frame can also be left out ('none') and the focus can carry a colour layer
// (scanFill): the inside of the frame covered by the colour of the highlight, semi-transparent (scanFillAlpha, 20–70 %), whole from the
// start ('whole') or growing from left to right as the time of the option runs out ('grow'). One of the two is always there.
// Fem castells, 0.45.6: the shirt colour the adult can fix for the colla. The families are those of the real colles castelleres
// (Revista Castells, 2017 and 2026; Albalate, 2016): reds, pinks, garnet, magenta, mauves and purples, blues from sky blue to navy,
// turquoise, greens, yellow, orange, brown and grey. The tones are artistic approximations, not measured from any shirt; the app
// shows only the colour, never the name of a colla. 'ronda' keeps the colour that changes with every round.
export const FEM_SHIRT_COLORS=Object.freeze({vermell:'#d8312f',rosat:'#e98896',granat:'#7d2235',magenta:'#c42f7f',malva:'#b48bd0',morat:'#7445b0',cel:'#62b2e8',blau:'#2f6fd1',mari:'#1f3170',turquesa:'#1e9fa8',verd:'#2f9e52',llima:'#86c440',groc:'#f0c02c',taronja:'#f08a24',marro:'#9a6a42',gris:'#8b9097'});
export const SCAN_COLORS=Object.freeze({orange:'#ffa21f',yellow:'#ffe14a',red:'#ff3b30',pink:'#ff4fd8',green:'#2fd36b',blue:'#2f7bff',white:'#ffffff',black:'#14121c'});
export function scanRing(s){const color=SCAN_COLORS[s.scanColor]||SCAN_COLORS.orange,[r,g,b]=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),light=(.2126*r+.7152*g+.0722*b)/255;
 return {frame:s.scanFrame==='whole'?'whole':s.scanFrame==='none'?'none':'progress',fill:s.scanFill==='whole'||s.scanFill==='grow'?s.scanFill:'none',fillAlpha:Math.max(20,Math.min(70,s.scanFillAlpha??40))/100,color,width:Math.max(4,Math.min(24,s.scanWidth||10)),relief:!!s.scanRelief,edge:light<.2?'#fffffff0':'#100c1ce6',track:light>.7?'#5d5a6c':'#fff6dc'};}
export function validateProfile(raw) {
 if(!raw || typeof raw!=='object' || Array.isArray(raw)) throw Error('El perfil no és vàlid.');
 const s=structuredClone(defaults);
 const number=(k,min,max)=>{if(k in raw){if(typeof raw[k]!=='number'||!Number.isFinite(raw[k])||raw[k]<min||raw[k]>max)throw Error('Valor no vàlid: '+k);s[k]=raw[k];}};
 const enumeration=(k,list)=>{if(k in raw){if(!list.includes(raw[k]))throw Error('Opció no vàlida: '+k);s[k]=raw[k];}};
 enumeration('mode',[1,2]); enumeration('source',['keyboard','pointer','gamepad']); enumeration('background',['full','dim','none']); enumeration('base',['black','white']);
 enumeration('interaction',['effect','hold','toggle']);number('density',25,100);enumeration('scanOptions',[2,3,4]);enumeration('creativeSteps',[2,4]);enumeration('potPick',['choose','one']);enumeration('dayMoments',[2,4,8]);enumeration('scanDirection',['forward','reverse']);enumeration('scanStart',['auto','manual']);enumeration('scanReturn',['first','selected']);number('scanFirst',0,5000);number('scanVoiceGap',0,3000);enumeration('scanLaps',[0,1,2,3,5]);enumeration('boardTaste',['sound','click','off']);enumeration('scanFrame',['progress','whole','none']);enumeration('scanFill',['none','whole','grow']);number('scanFillAlpha',20,70);enumeration('scanColor',Object.keys(SCAN_COLORS));number('scanWidth',4,24);number('opacity',0,100);number('scanTime',500,10000);number('duration',2,15);enumeration('steps',[3,5,7]);enumeration('fiRhythm',['lent','normal','rapid']);enumeration('flMode',['jardi','una']);enumeration('mbSteps',[3,5,7]);enumeration('mbGestures',['gotes','pintes','flors']);enumeration('mbSize',['grans','mitjanes','petites']);enumeration('mbColors',['tradicionals','contrast']);enumeration('mbFirst',['barcelona','istanbul','kyoto','paris','nuremberg']);enumeration('pjDrops',['una','curta','llarga']);enumeration('pjPresses',[6,10,16]);enumeration('bbPresses',[4,8,12]);if(raw.bbFirst==='mel')raw={...raw,bbFirst:'sabo'};enumeration('bbFirst',['sabo','plasma','aigua','fum','lava','ferro','oli','nebulosa']);enumeration('pjView',['perspectiva','dalt']);enumeration('pjFlow',['quiet','lent','viu']);enumeration('pjFirst',['llum','mar','nit','foc','estiu','aurora','caramel','tempesta','fruites','estrelles']);enumeration('flCount',[2,3,4]);enumeration('flOpen',['curta','mitjana','llarga']);enumeration('flFirst',['prat','estany','bosc','nit','hivernacle']);enumeration('flTint',['suau','mig','intens']);enumeration('dsPool',['8','14','20']);enumeration('dsFamily',['altres','barreja']);enumeration('fiCalm',['curta','variable','llarga']);enumeration('fiEarly',['res','reinicia','lent']);enumeration('fiPress',['never','long','medium','short']);enumeration('fiFirst',['bitlles','cano','coet','forca','cavallets','atzar']);enumeration('farSpeed',['slow','medium','fast']);enumeration('farWindow',['wide','medium','narrow']);enumeration('farBoats',[1,2,3]);enumeration('tcWait',['short','medium','long']);enumeration('vgRoute',['atzar','vall','costa','muntanya','delta','illes']);enumeration('vgSeason',['atzar','primavera','estiu','tardor','hivern']);enumeration('vgDay',['curta','normal','llarga']);enumeration('exMode',['encaixa','lliure']);enumeration('exHint',['imatge','silueta']);enumeration('exLike',['diferents','semblants']);enumeration('exHelp',['mai','2','3']);enumeration('exPace',['normal','calmat']);enumeration('vhSteps',['2','3','4']);enumeration('vhCells',['2','3','4']);enumeration('vhCorner',['habitacio','sala','pati','passadis','bany']);enumeration('vhWho',['alumne','sorpresa']);enumeration('vhGo',['puls','auto']);enumeration('vhRide',['curt','mitja','llarg']);enumeration('vhCamera',['dinamica','tranquila']);enumeration('vhQuality',['auto','alta','mitjana','baixa']);enumeration('femShirt',['ronda',...Object.keys(FEM_SHIRT_COLORS)]);enumeration('tcLeave',['never','long','medium','short']);enumeration('dbColor',['own','yellow','red','white']);enumeration('dbSpeed',['normal','slow']);enumeration('ggCamera',['full','soft']);enumeration('kaleidoColor',['yellow','white','orange','red','pink','green','blue']);number('volume',0,100);
 for(const k of ['sound','lock','reduced','swap','scanGrouping','visualHint','freeRecipe','speakOptions','waitCue','plainScene','boardLabels','switchHint','scanRelief','dbStill','kaleidoContrast','repeatScene','exGlow','vhGarage','flCreatures','flNature','mbLine'])if(k in raw){if(typeof raw[k]!=='boolean')throw Error('Valor no vàlid: '+k);s[k]=raw[k];}
 for(const k of ['hold','gap','buttons','pointer'])if(k in raw){if(!Array.isArray(raw[k])||raw[k].length!==2||raw[k].some(n=>!Number.isInteger(n)||n<0||n>(['hold','gap'].includes(k)?5000:k==='pointer'?4:31)))throw Error('Assignació no vàlida: '+k);s[k]=[...raw[k]];}
 if('keys' in raw){if(!Array.isArray(raw.keys)||raw.keys.length!==2||raw.keys.some(k=>typeof k!=='string'||!/^(Space|Enter|Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|Numpad[0-9])$/.test(k)))throw Error('Tecla no admesa.');s.keys=[...raw.keys];}
 if(s.keys[0]===s.keys[1]||s.buttons[0]===s.buttons[1]||s.pointer[0]===s.pointer[1])throw Error('Cada commutador necessita una assignació diferent.');
 if('name' in raw){if(typeof raw.name!=='string')throw Error('Nom no vàlid.');s.name=raw.name.trim().slice(0,60)||'El meu perfil';}
 if(s.scanFrame==='none'&&s.scanFill==='none')s.scanFrame='whole';
 return s;
}
// Physical down/up events never queue. A held contact must be released before reuse.
// 0.37: the timers are called through arrows. Called as this.schedule(...), the browser's own setTimeout threw «Illegal invocation»,
// so with «Pressió mínima» above 0 no press was ever accepted (in every activity, since the setting exists).
export class SwitchEngine {
 constructor({settings,accept,log=()=>{},blocked=()=>false,clock=()=>performance.now(),schedule=(f,ms)=>setTimeout(f,ms),unschedule=id=>clearTimeout(id)}){Object.assign(this,{settings,accept,log,blocked,clock,schedule,unschedule});this.states=[this.fresh(),this.fresh()];this.suspended=false;}
 fresh(){return {down:false,token:null,pending:null,lastUp:-Infinity};}
 get pending(){return this.states.some(s=>s.pending!==null);}
 down(i,token='input'){
  const s=this.states[i];if(!s)return;
  if(s.down){this.log(i,'repeat');return;}
  s.down=true;s.token=token;this.log(i,'down');
  if(this.suspended||this.blocked()||this.states.some((v,n)=>n!==i&&v.down)){this.log(i,'blocked');return;}
  if(this.clock()-s.lastUp<this.settings.gap[i]){this.log(i,'gap');return;}
  const commit=()=>{s.pending=null;if(!s.down||this.suspended||this.blocked())return;this.log(i,'accepted');this.accept(i);};
  if(this.settings.hold[i]>0)s.pending=this.schedule(commit,this.settings.hold[i]);else commit();
 }
 up(i,token='input'){
  const s=this.states[i];if(!s||!s.down||s.token!==token)return;
  if(s.pending!==null){this.unschedule(s.pending);s.pending=null;this.log(i,'short');}
  s.down=false;s.token=null;s.lastUp=this.clock();this.log(i,'up');
 }
 pulse(i,token='click'){if(this.settings.hold[i]>0){this.log(i,'nohold');return;}this.down(i,token);this.up(i,token);}
 cancel(){for(const s of this.states){if(s.pending!==null)this.unschedule(s.pending);s.pending=null;}this.suspended=true;}
 resume(){this.suspended=false;}
 releaseAll(){for(let i=0;i<2;i++)this.up(i,this.states[i].token);}
}
export class ScanClock {
 constructor(){this.index=0;this.elapsed=0;this.first=true;this.turns=0;}
 reset(){this.index=0;this.elapsed=0;this.first=true;this.turns=0;}
 next(count,direction=1){const previous=this.index;this.index=(this.index+direction+count)%count;this.elapsed=0;this.first=false;if(direction>0&&this.index<=previous||direction<0&&this.index>=previous)this.turns++;}
 tick(dt,count,interval,frozen=false,direction=1){if(frozen)return false;this.elapsed+=dt;if(this.elapsed>=interval){this.next(count,direction);return true;}return false;}
}
