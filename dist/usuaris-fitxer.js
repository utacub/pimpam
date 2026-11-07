import {pdActs,pdDelAct,pdExport,pdFileName,pdImportData,pdPersist,pdRead,pdSweep} from './persona-dades.js';
import {usRestore,usSnapshot} from './usuaris.js';

// ---------- Usuaris (0.46): the file of a user, with its personalised activities ----------
// The same stored .zip as the personalised activities (persona-dades.js), with kind 'usuaris': pim-pam.json carries the users (their
// name, settings, favourites, decor choices, visits and record) and their activities with the owner of each one; media/ the photos,
// videos and sounds those activities use. One user or all of them go in one file.
async function ufExport(ids){const snaps=ids.map(usSnapshot).filter(Boolean);if(!snaps.length)throw Error('No hi ha cap usuari per exportar.');const set=new Set(snaps.map(u=>u.id)),acts=(await pdActs()).filter(a=>set.has(a.owner));
 const blob=await pdExport(acts,null,{kind:'usuaris',users:snaps});return {blob,name:pdFileName(snaps.length===1?'usuari-'+snaps[0].name:'usuaris-'+new Date().toISOString().slice(0,10)),users:snaps.length,acts:acts.length};}
// The import: every user in the file comes in (the same user again replaces its data, see usRestore), then its activities, which belong to
// it on this device. An export of activities alone is refused here, with a word on where it goes.
async function ufImport(file){const {zip,data}=await pdRead(file);if(data.kind!=='usuaris')throw Error('Aquest fitxer és una exportació d’activitats personalitzades: importeu-lo des de la carpeta «Activitats personalitzades».');
 if(!Array.isArray(data.users)||!data.users.length)throw Error('El fitxer no té cap usuari.');const map=new Map(),users=[];for(const snap of data.users){const r=usRestore(snap);map.set(String(snap?.id),r.user.id);users.push(r);}
 const res=await pdImportData(zip,data,a=>map.get(String(a.owner))||null);await pdPersist();return {users,added:res.added.length,skipped:res.skipped};}
// A user deleted takes its personalised activities with it (and the media no other activity uses).
async function ufDeleteActs(owner){for(const a of await pdActs())if((a.owner||'guest')===owner)await pdDelAct(a.id);await pdSweep();}
async function ufCounts(){const m=new Map();try{for(const a of await pdActs()){const o=a.owner||'guest';m.set(o,(m.get(o)||0)+1);}}catch{}return m;}
export {ufExport,ufImport,ufDeleteActs,ufCounts};
