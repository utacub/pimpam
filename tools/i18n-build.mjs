// Builds the dictionaries of the languages (0.71): i18n/{ui,info,pat}-ca.tsv hold every Catalan text with its id (id<TAB>text; ids that start with
// «p» are patterns with {n} numbers and {x} pieces), i18n/{ui,info,pat}-<lang>.tsv the translation of each id. Writes dist/i18n/<lang>.json
// ({s:{catalan:translation}, p:[[catalan pattern, translated pattern]]}) and lists the ids still missing in each language.
// Usage: node tools/i18n-build.mjs [--strict]
import fs from 'node:fs';
const LANGS=['es','eu','gl','en','fr'];
const read=f=>{const m=new Map();if(!fs.existsSync(f))return m;for(const line of fs.readFileSync(f,'utf8').split('\n')){if(!line.trim()||line.startsWith('#'))continue;const i=line.indexOf('\t');if(i<0)continue;const id=line.slice(0,i).trim(),v=line.slice(i+1).replace(/\\n/g,'\n').trimEnd();if(m.has(id))console.warn('duplicate id',f,id);m.set(id,v);}return m;};
const PARTS=['ui','info','pat'];const readAll=l=>{const m=new Map();for(const x of PARTS)for(const [k,v] of read(`i18n/${x}-${l}.tsv`)){if(m.has(k))console.warn('duplicate id',l,k);m.set(k,v);}return m;};
const ca=readAll('ca');fs.mkdirSync('dist/i18n',{recursive:true});let bad=0;
const seen=new Map();for(const [id,v] of ca){if(seen.has(v)&&!id.startsWith('p'))console.warn('same Catalan text twice',seen.get(v),id);seen.set(v,id);}
for(const l of LANGS){const tr=readAll(l),s={},p=[],missing=[];
 for(const [id,v] of ca){const x=tr.get(id);if(x===undefined||x===''){missing.push(id);continue;}
  if(id.startsWith('p')){const ph=a=>a.match(/\{[a-z]\d?\}/g)||[];if(ph(x).some(k=>!ph(v).includes(k))||new Set(ph(x)).size!==ph(x).length){console.warn(l,id,'placeholders differ');bad++;}p.push([v,x]);}else s[v]=x;}
 for(const id of tr.keys())if(!ca.has(id))console.warn(l,'unknown id',id);
 // longer patterns first, so that the most specific one wins
 p.sort((a,b)=>b[0].replace(/\{[a-z]\d?\}/g,'').length-a[0].replace(/\{[a-z]\d?\}/g,'').length);
 fs.writeFileSync(`dist/i18n/${l}.json`,JSON.stringify({s,p}));
 console.log(l,'texts',Object.keys(s).length,'patterns',p.length,'missing',missing.length,missing.length?missing.slice(0,12).join(' ')+(missing.length>12?' …':''):'');
 if(process.argv.includes('--strict')&&missing.length)bad++;}
process.exit(bad?1:0);
