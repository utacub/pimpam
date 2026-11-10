import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {SOBRE_LOGOS,SOBRE_EINES,sobreHtml} from '../dist/sobre.js';

const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const build=readFileSync(new URL('../build_standalone.py',import.meta.url),'utf8');

test('0.62 Informació: logos exist, text has the origin, institutions and credits', ()=>{
  assert.equal(SOBRE_LOGOS.length,5);
  for(const l of SOBRE_LOGOS)assert.ok(existsSync(new URL('../dist/'+l.src.slice(2),import.meta.url)),l.src);
  const h=sobreHtml({ce:31,scan:11,films:2},'0.62','x');
  for(const t of ['Origen i institucions','Universitat de Barcelona','Fundació Bosch i Gimpera','UTAC Sírius','UTAC Educació','VSCO-2-CE','CC BY-SA 4.0','CC BY 3.0','ElevenLabs','three.js','CREDITS.md','Versió 0.62','Hi ha activitats de causa-efecte','; activitats d’encercament','aprendre a fer servir commutadors','2 petites pel·lícules'])
    assert.ok(h.includes(t),t);
  assert.ok(SOBRE_EINES.every(r=>r.length===4&&/^https:\/\//.test(r[3])));
});

test('0.62 Informació: header button, not in the switch scanning lap, embedded in the standalone build', ()=>{
  assert.match(app,/data-sobre aria-label="Informació sobre Pim Pam"/);
  // The home scan lap is the cards plus «Configuració» (.nav [data-settings]); the Informació button has no data-settings.
  const btn=app.match(/<button[^>]*data-sobre [^>]*>/)[0];
  assert.doesNotMatch(btn,/data-settings/);
  assert.match(app,/scan\.next\(targets\.length\+1/);
  assert.match(build,/'sobre\.js','app\.js'\]/);
  assert.match(build,/assets'\/'marca'/);
});
