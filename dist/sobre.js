// 0.62 · «Informació» (sobre Pim Pam): what the app is, its origin and institutions, and the credits of the tools and recordings.
// Opened from the «Informació» button of the home page header. It is for the adults: it is not part of the switch scanning lap
// (scanning stays wordless), and the home scan stands still while the window is open. The institutional text and logos are the
// ones of LECAA Docs (utacub/lecaa_docs, src/about.ts), so both UTAC apps say the same.

export const SOBRE_LOGOS=Object.freeze([
 {src:'./assets/marca/utac-negre.webp',name:'UTAC',caption:'Unitat de Tècniques Augmentatives de Comunicació',url:'https://www.utac.cat/'},
 {src:'./assets/marca/ub.webp',name:'Universitat de Barcelona',caption:'Universitat de Barcelona',url:'https://web.ub.edu/'},
 {src:'./assets/marca/fbg.webp',name:'Fundació Bosch i Gimpera',caption:'Fundació Bosch i Gimpera',url:'https://www.fbg.ub.edu/'},
 {src:'./assets/marca/gencat-educacio.webp',name:'Departament d’Educació i Formació Professional',caption:'UTAC Educació · Departament d’Educació i Formació Professional',url:'https://educacio.gencat.cat/'},
 {src:'./assets/marca/gencat-drets-socials.webp',name:'Departament de Drets Socials i Inclusió',caption:'UTAC Sírius · Departament de Drets Socials i Inclusió',url:'https://dretssocials.gencat.cat/'},
]);

// [use, product, owner and licence, url]: every source named in dist/assets/samples/CREDITS.md and in the vendor files.
export const SOBRE_EINES=Object.freeze([
 ['Aplicació','Claude','Anthropic','https://claude.ai/'],
 ['Primeres versions d’algunes activitats','ChatGPT','OpenAI','https://chatgpt.com/'],
 ['Sons i veus generats','ElevenLabs (efectes de so i veus)','ElevenLabs','https://elevenlabs.io/'],
 ['Instruments enregistrats','Versilian Studios Chamber Orchestra 2, Community Edition','Versilian Studios · Samuel Gossner i col·laboradors · CC0 1.0','https://github.com/sgossner/VSCO-2-CE'],
 ['Rierol (natura)','«Brook sound», de TwoWings','Wikimedia Commons · CC BY 3.0 · fragment convertit en bucle, en mono i amb el volum ajustat','https://commons.wikimedia.org/wiki/File:Brook_sound.ogg'],
 ['Toc de castells','«Primer 5 de 8 descarregat pels Marrecs de Salt», de JordiGran','Wikimedia Commons · CC BY-SA 4.0 · set fragments de la banda sonora, editats; es distribueixen amb la mateixa llicència','https://commons.wikimedia.org/wiki/File:Primer_5_de_8_descarregat_pels_Marrecs_de_Salt.webm'],
 ['Gràfics 3D d’«El taller de vehicles»','three.js r187','three.js authors · MIT','https://threejs.org/'],
]);

export const SOBRE_CREDITS_URL='https://github.com/utacub/pimpam/blob/main/dist/assets/samples/CREDITS.md';
export const SOBRE_CODI_URL='https://github.com/utacub/pimpam';

const sobreEsc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sobreLink=(label,url)=>`<a href="${sobreEsc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${label}</a>`;

// counts: {ce, scan, films}; version: APP_VERSION; close: the close button's inner HTML (the app's icon).
export function sobreHtml(counts,version,close){
 const {ce=0,scan=0,films=0}=counts||{};
 return `<div class="dialog-head sobre-head"><div class="dialog-title"><h2 id="sobre-title">Informació</h2><button class="icon-button" data-close-sobre aria-label="Tanca la informació" title="Tanca">${close||'×'}</button></div></div>
<div class="dialog-body sobre-body">
<div class="sobre-brands"><img class="utac-logo" src="./assets/utac.png" alt="UTAC"><span class="brand-divider"></span><img class="pim-logo" src="./assets/pim-pam.png" alt="Pim Pam"></div>
<section><h3>Què és Pim Pam</h3>
<p>Pim Pam és un recull d’activitats per jugar amb un o dos commutadors. Està pensat per aprendre a fer servir commutadors: cada pulsació té una resposta clara, visual i sonora, un petit «pim» genera un gran «pam».</p>
<p>Hi ha activitats de causa-efecte, en què cada pulsació fa passar alguna cosa; activitats d’encercament, en què les opcions s’il·luminen una rere l’altra i una pulsació tria la que està marcada; i ${films} petites pel·lícules, que avancen una seqüència a cada pulsació. Les activitats s’agrupen en carpetes, i a «Activitats personalitzades» se’n poden fer de noves amb fotos, vídeos i sons propis.</p>
<p>Els commutadors poden arribar com a tecles, com a botons del ratolí o d’un comandament de joc, i també es pot tocar la pantalla. A «Configuració» s’ajusten el mode d’un o de dos commutadors, el temps i l’aspecte de l’encercament, el so, el decorat i el senyal que indica quan es pot tornar a prémer. Els ajustos es poden desar per a cada usuari.</p>
<p>Pim Pam funciona dins del navegador i es pot fer servir gratuïtament en línia. També es pot instal·lar com una aplicació amb el botó «Instal·la» de la pàgina principal: s’hi descarreguen totes les activitats i funciona sense connexió. Els sons i les imatges són a la mateixa aplicació: no es demanen dades personals i el que es desa queda en aquest dispositiu.</p></section>
<section><h3>Origen i institucions</h3>
<p>Pim Pam s’ha creat des de la Unitat de Tècniques Augmentatives de Comunicació (UTAC), fent servir eines d’intel·ligència artificial.</p>
<p>La UTAC és un equip de la Universitat de Barcelona i de la Fundació Bosch i Gimpera. Concreta la seva activitat a partir de dos serveis de la Generalitat de Catalunya: UTAC Educació, del Departament d’Educació i Formació Professional, i UTAC Sírius, del Departament de Drets Socials i Inclusió.</p>
<div class="sobre-institucions">${SOBRE_LOGOS.map(l=>`<figure>${sobreLink(`<img src="${l.src}" alt="${sobreEsc(l.name)}">`,l.url)}<figcaption>${sobreEsc(l.caption)}</figcaption></figure>`).join('')}</div></section>
<section><h3>Eines i recursos</h3>
<ul class="sobre-eines">${SOBRE_EINES.map(([use,product,owner,url])=>`<li><span class="use">${sobreEsc(use)}</span><strong>${sobreEsc(product)}</strong><span>${sobreEsc(owner)}</span>${sobreLink(sobreEsc(url.replace(/^https?:\/\//,'').replace(/\/$/,'')),url)}</li>`).join('')}</ul></section>
<section><h3>Crèdits i llicències</h3>
<p>La major part dels efectes de so, dels ambients de natura i dels animals, i alguns instruments (kalimba, udu, vibràfon, tambor i guitarra), s’han generat amb ElevenLabs. No són enregistraments reals: s’han retallat, igualat de volum i, alguns, convertit en bucles. Els dibuixos, les animacions i la música de les activitats es generen amb el codi de l’aplicació, i els vídeos dels viatges són enregistraments d’aquestes mateixes escenes. Els vídeos de les petites pel·lícules s’han generat amb Seedance 2.5, de ByteDance. Les imatges i els sons de les activitats que van començar amb ChatGPT són els dels fitxers que va lliurar aquella eina.</p>
<p>La llista completa, so per so, amb l’origen, l’autor, la llicència i els canvis que s’hi han fet, és a ${sobreLink('CREDITS.md',SOBRE_CREDITS_URL)}. El codi de l’aplicació és a ${sobreLink('github.com/utacub/pimpam',SOBRE_CODI_URL)}. Els logotips són marques de les institucions titulars.</p>
<p class="sobre-versio">Versió ${sobreEsc(version)} · <button type="button" class="sobre-novetats" data-sobre-novetats>Novetats d’aquesta versió</button></p></section>
</div>`;
}
