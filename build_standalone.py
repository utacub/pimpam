from pathlib import Path
import base64,json,re
root=Path(__file__).resolve().parent
dist=root/'dist'
def data(name):
 return 'data:image/png;base64,'+base64.b64encode((dist/'assets'/name).read_bytes()).decode()
html=(dist/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+(dist/'style.css').read_text()+'</style>')
code='\n'.join((dist/name).read_text() for name in ['carrega.js','input.js','patterns.js','kaleido-base.js','kaleido-art.js','sampler.js','kaleido-music.js','kaleido.js','synth.js','glass.js','vitrall-art.js','vitrall.js','paper.js','natura-art.js','natura.js','firework.js','piro-art.js','piro.js','dia.js','dia-art.js','escenari.js','video-dives.js','fons-shaders.js','fons.js','fons-gl.js','selva-shaders.js','selva.js','selva-gl.js','sabana-shaders.js','sabana.js','sabana-gl.js','pou-shaders.js','pou.js','pou-gl.js','gegants-shaders.js','gegants.js','gegants-gl.js','orquestra.js','orquestra-art.js','constel.js','constel-art.js','castells.js','castells-gent.js','castells-art.js','globus.js','globus-art.js','mag.js','mag-art.js','far.js','far-art.js','toc.js','toc-art.js','fira.js','fira-llauna.js','fira-gent.js','fira-art.js','cambrer.js','cambrer-art.js','vent.js','vent-art.js','tauler.js','masia-pinzell.js','masia-natura.js','masia-personatges.js','masia-decorats.js','masia-efectes.js','masia.js','masia-episodis.js','masia-art.js','encaix.js','encaix-figures.js','encaix-mons.js','encaix-so.js','encaix-art.js','vehicles.js','vehicles-so.js','vehicles-3d.js','vehicles-art.js','pinta.js','pinta-shaders.js','pinta-gl.js','pinta-eines.js','pinta-terres.js','pinta-terres2.js','pinta-terres3.js','pinta-vida.js','pinta-gags.js','pinta-art.js','estacio.js','estacio-art.js','templet.js','templet-art.js','origen.js','origen-art.js','guix.js','guix-art.js','cassola.js','grec-art.js','grec-bestiari.js','cassola-mites2.js','cassola-mites3.js','cassola-mites.js','cassola-art.js','dibuixos-art.js','dibuixos.js','joguines-art.js','joguines.js','cuina-art.js','cuina.js','visual-patterns.js','ocean.js','cinc.js','viatge-pinzell.js','viatge-mon.js','viatge.js','viatge-art.js','flor-especies.js','flor-paper.js','flor-art.js','flor-escena.js','flor.js','marbre-tallers.js','marbre-tinta.js','color-rain.js','marbre-escena.js','pluja-escenes.js','pluja-colors.js','pluja-shaders.js','pluja-gl.js','pluja-escena.js','bombolles-shaders.js','bombolles-motor.js','bombolles-sabo.js','bombolles-lbm.js','bombolles-liquids.js','bombolles-gas.js','bombolles-plasma.js','bombolles-aigua.js','bombolles-fum.js','bombolles-lava.js','bombolles-ferro.js','bombolles-oli.js','bombolles-nebulosa.js','bombolles.js','bombolles-escena.js','info-escenes.js','cause-catalog.js','cause-art.js','scan-catalog.js','pellicules.js','pellicules-cartes.js','persona-dades.js','persona.js','persona-art.js','persona-editor.js','usuaris.js','usuaris-fitxer.js','scan-art.js','art.js','sobre.js','i18n.js','app.js'])
code=re.sub(r'^import .*;$','',code,flags=re.M)
code=re.sub(r'^export \{[^}]+\};$','',code,flags=re.M)
code=re.sub(r'\bexport\s+(?=(const|class|function))','',code)
for asset in ['utac.png','pim-pam.png']:
 code=code.replace('./assets/'+asset,data(asset))
# 0.62: the five institutional logos of «Informació» (dist/sobre.js), lossless WebP from LECAA Docs.
for p in sorted((dist/'assets'/'marca').glob('*.webp')):
 code=code.replace('./assets/marca/'+p.name,'data:image/webp;base64,'+base64.b64encode(p.read_bytes()).decode())
# The recorded instruments of Natura, Piromusical and Dia rere dia travel inside the file as base64, so the HTML still works offline and from a USB stick.
samples=dist/'assets'/'samples'
embedded={p.relative_to(samples).as_posix():base64.b64encode(p.read_bytes()).decode() for p in sorted(samples.rglob('*.mp3'))}
assert code.count('const SAMPLE_EMBEDDED=null;')==1
code=code.replace('const SAMPLE_EMBEDDED=null;','const SAMPLE_EMBEDDED='+json.dumps(embedded,separators=(',',':'))+';')
# The pictures of the four activities made with ChatGPT that remain (0.37, cinc.js), lossless WebP, travel inside the file too.
cinc={p.name:'data:image/webp;base64,'+base64.b64encode(p.read_bytes()).decode() for p in sorted((dist/'assets'/'cinc').glob('*.webp'))}
assert code.count('const CINC_IMAGES=null;')==1 and len(cinc)==8
code=code.replace('const CINC_IMAGES=null;','const CINC_IMAGES='+json.dumps(cinc,separators=(',',':'))+';')
assert not re.search(r'^import ',code,re.M)
# The sampler's development path stays in the code but is never used: every file it can ask for is embedded above.
assert all(z in embedded for z in re.findall(r'\["([A-Za-z]+/[A-Za-z0-9-]+\.mp3)"',code))
assert './assets/' not in code.replace("'./assets/samples/'+file",'').replace("'./assets/cinc/'+name",'')
assert '</script' not in code
# El taller de vehicles (0.53): three.js travels as its own script (dist/vendor/three-taller.js, made by tools/vendor-three.mjs), before the app.
vendor=(dist/'vendor'/'three-taller.js').read_text()
assert '</script' not in vendor and vendor.startswith('// three.js')
html=html.replace('<script src="./vendor/three-taller.js"></script>','<script>\n'+vendor+'\n</script>')
# 0.71: the dictionaries of the five other languages travel inside the file (dist/i18n/*.json, made by tools/i18n-build.mjs).
langs={l:json.loads((dist/'i18n'/f'{l}.json').read_text()) for l in ['es','eu','gl','en','fr']}
code=code.replace('const I18N_EMBEDDED=null;','const I18N_EMBEDDED='+json.dumps(langs,ensure_ascii=False,separators=(',',':'))+';')
html=html.replace('<script type="module" src="./app.js"></script>','<script>\n(()=>{\n'+code+'\n})();\n</script>')
target=dist/'Pim_Pam_44_activitats_v0_63_2.html'
target.write_text(html)
print(f'{target}: {target.stat().st_size} bytes, self-contained')
