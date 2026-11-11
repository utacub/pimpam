import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// 0.71: the languages. The dictionaries are made by tools/i18n-build.mjs from i18n/*.tsv; the app keeps writing Catalan and
// dist/i18n.js translates what it shows.
const LANGS=['es','eu','gl','en','fr'];
const dict=l=>JSON.parse(readFileSync(new URL(`../dist/i18n/${l}.json`,import.meta.url),'utf8'));

async function withLang(l){
  globalThis.document={title:'UTAC · Pim Pam',documentElement:{},body:{},createTreeWalker:()=>({nextNode:()=>null})};
  globalThis.localStorage={getItem:()=>l,setItem(){}};
  globalThis.fetch=async u=>({ok:true,json:async()=>dict(u.match(/(\w+)\.json$/)[1])});
  globalThis.MutationObserver=class{observe(){}};
  const m=await import(`../dist/i18n.js?${l}`);await m.i18nInit();return m;
}

test('0.71 dictionaries: every language has the same texts and patterns, with the same pieces', ()=>{
  const sizes=LANGS.map(l=>{const d=dict(l);return [Object.keys(d.s).length,d.p.length];});
  for(const s of sizes)assert.deepEqual(s,sizes[0]);
  assert.ok(sizes[0][0]>2500&&sizes[0][1]>100,String(sizes[0]));
  for(const l of LANGS)for(const [ca,tr] of dict(l).p){const ph=a=>a.match(/\{[a-z]\d?\}/g)||[];for(const k of ph(tr))assert.ok(ph(ca).includes(k),`${l}: ${tr}`);}
  // no Cyrillic look-alike letters slipped into a translation
  for(const l of LANGS)assert.ok(!/[Ѐ-ӿ]/.test(JSON.stringify(dict(l))),l);
});

test('0.71 t(): whole texts, patterns with numbers and names, names with a description, lists', async ()=>{
  const en=await withLang('en');
  assert.equal(en.t('Pantalla completa'),'Full screen');
  assert.equal(en.t('Fons marí de vidre. Composició 1 de 20.'),'Glass seabed. Composition 1 of 20.');
  assert.equal(en.t('Bombolles de sabó: bombolles iridescents creixen. Pulsació 3 de 8.'),'Soap bubbles: iridescent bubbles grow. Press 3 of 8.');
  assert.equal(en.t('Desa Toc, toc! Qui hi ha? als preferits'),'Add Knock, knock! Who’s there? to favourites');
  assert.equal(en.t('Aquest ajust és compartit amb Flor de paper, Natura i Vitralls: si el canvieu aquí, també hi canvia.'),'This setting is shared with Paper flower, Nature and Stained glass: if you change it here, it changes there too.');
  assert.equal(en.t('  Obre la carpeta Viatges i immersions: 5 activitats '),'  Open the folder Journeys and dives: 5 activities ');
  // a text with no translation stays as it is (a name, a file)
  assert.equal(en.t('Tomàs'),'Tomàs');
  assert.equal(en.t('foto_01.jpg'),'foto_01.jpg');
});

test('0.71 every language translates the language menu label and the header', async ()=>{
  for(const l of LANGS){const m=await withLang(l);assert.notEqual(m.t('Configuració'),'Configuració',l);assert.equal(m.i18nLang(),l);}
  const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  assert.ok(app.includes('langMenuHtml()')&&app.includes('i18nInit()'));
});
