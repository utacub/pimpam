# Pim Pam 0.48 · Detectius de sons, renovada

Base: 0.47.3 (`v0_47_3_tres_activitats_menys`), que ja inclou la 0.47.2. Demanat per en Marc el 6 de novembre de 2026: «Millora a nivell gràfic, sonor, i de nombre d'instruments (fins a 20). En l'encercament el model que es busca hauria de ser més gran, i les caselles d'encercament no tan grosses. I elimina la lupa.» Pla: https://claude.ai/artifact/BZqWbUQMwLWfqFXzpDncJj

L’app continua tenint **42 activitats** (31 de causa-efecte i 11 d’encercament).

## Què canvia a Detectius de sons (EN11)

### Instruments: de 8 a 20, tots enregistrats

Vint instruments reals de cinc famílies, basades en la classificació de Hornbostel i Sachs (1961) però dites com les coneix l’escola:

| Família | Instruments |
|---|---|
| Corda | violí, violoncel, contrabaix, arpa, guitarra |
| Vent fusta | flauta travessera, oboè, clarinet, fagot |
| Vent metall | trompeta, trompa, trombó, tuba |
| Teclat i làmines | piano, marimba, glockenspiel |
| Percussió | timbal, triangle, pandereta, gong |

- **Sons:** 165 notes noves fetes a partir dels fitxers originals de VSCO-2 Community Edition (Versilian Studios, s. d.), amb llicència CC0. Cada nota es retalla des de l’atac, s’hi mesura l’afinació (el sintetitzador la corregeix), s’iguala a −18 LUFS i acaba amb una cua natural. La guitarra és la de «Pinta el món». Cap so sintètic: l’activitat espera que les gravacions estiguin carregades.
- **Peces:** cada instrument toca la seva peça de 8,5 s, adaptada al que és: arpegis i glissando a l’arpa, acords al piano i la guitarra, notes llargues a la corda greu i al metall, i ritmes propis al timbal, el triangle, la pandereta i el gong. L’acompanyament és lleuger (pizzicato de violoncel i arpa) i la peça acaba amb una nota pinçada o percudida que s’apaga sola.
- **Volum igualat:** s’ha mesurat cada peça amb EBU R 128 (European Broadcasting Union, 2020). Les vint peces queden entre −28,5 i −31,1 LUFS, en dues rondes diferents (`tools/detectius-audio.mjs`). El violí s’ha refet amb les notes de l’arc més ferm (*forte*), perquè les de *piano* arrencaven massa a poc a poc.

### Dibuix

- Estil «aparador de luthier»: contorn fosc, fusta amb veta i vernís, metall amb reflex, i cada instrument sobre el seu peu.
- **El model és més gran:** un marc oval daurat penjat de dues cadenes, a dalt, d’uns 300 px d’alt en una pantalla de 720 px.
- **Les caselles són més petites:** formen una fila a la meitat de baix, sota el marc. En pantalla vertical van en dues columnes, i si n’hi ha una de sola a l’última fila, queda centrada.
- **Sense lupa.**
- Pista visual (ajust): amb la pista activada, el marc mostra l’instrument; sense pista, hi surt una nota musical amb ones. Mentre sona la pista, unes ones surten del marc.
- En encertar, l’instrument surt a l’escenari sota un focus i toca la seva peça.
- Funciona amb el decorat complet, atenuat i sense decorat (fons negre o blanc), i amb «Fons sense decorat».

### Encercament

Es mantenen les normes de sempre: cap paraula escrita durant l’encercament, el marc de focus ben visible (i la capa de color, si està activada) i una tria fa avançar. Els tasts (el so curt de cada casella quan hi passa el focus) també són dels instruments enregistrats.

### Ajustos nous («Aquesta activitat»)

- **Quants instruments:** 8 (els d’abans), 14 o 20 (per defecte, 20).
- **Instruments de la mateixa família:** per defecte, «Famílies diferents»: a cada ronda, les opcions són de famílies diferents de la del model i també entre elles. «Barrejats» posa primer instruments de la mateixa família, i és més difícil.
- Cada ronda canvia de família respecte de l’anterior.

## Mida

L’HTML fa 57,2 MB (la 0.47.3 en fa 52,4): les 165 notes noves ocupen 5,8 MB.

## Proves

- `node --test tests/*.test.mjs`: 392 de 394. Les 2 que fallen són les mateixes de sempre (mida dels sons de la masia i dels instruments gravats), que ja fallaven a la 0.47.3. Hi ha proves noves per als grups de 8, 14 i 20 instruments, les normes de famílies, la pista, els tasts, les peces, els fitxers de so, els crèdits i la mida de les caselles.
- Prova al navegador (Chromium): un encert i una errada amb dos commutadors, la pantalla vertical (720×1280), DPR 2, sense decorat amb fons blanc, sense pista visual i amb el grup de 8. No hi ha hagut cap error.
- Prova de fum (`tools/smoke-all.mjs`): 9 carpetes i les 42 activitats obertes una darrere l’altra, sense cap error de pàgina.
- No s’ha fet l’auditoria de flaixos: la fas tu.

## Imatges (`imatges/`)

- `00_els_vint_instruments.jpg`: full de prova amb els vint dibuixos (els noms escrits només són per a tu; a l’activitat no hi surt cap paraula).
- `01_tauler_pista.jpg`: el tauler mentre sona la pista (1280×720): el marc gran amb el model i tres caselles a baix.
- `02_focus_a_la_trompeta.jpg`: el focus a la casella bona.
- `03_encert_escenari.jpg`: l’encert, amb la trompeta a l’escenari.
- `04_ronda_seguent_gong.jpg`: la ronda següent (una altra família, de dia).
- `05_vertical_sense_decorat_fons_blanc.jpg`: pantalla vertical (720×1280), sense decorat i fons blanc, la tercera casella centrada.
- `06_dpr2_atenuat_sense_pista.jpg` i `07_dpr2_encert_violi.jpg`: DPR 2, decorat atenuat, sense pista visual (nota musical al marc), grup de 8.

## Referències

Beukelman, D. R., & Light, J. C. (2020). *Augmentative and alternative communication: Supporting children and adults with complex communication needs* (5a ed.). Paul H. Brookes.

European Broadcasting Union. (2020). *EBU R 128: Loudness normalisation and permitted maximum level of audio signals* (Versió 4.0). https://tech.ebu.ch/publications/r128

Hornbostel, E. M. von, & Sachs, C. (1961). Classification of musical instruments (A. Baines & K. P. Wachsmann, Trad.). *The Galpin Society Journal, 14*, 3–29. https://doi.org/10.2307/842168

Versilian Studios. (s. d.). *VSCO 2: Community Edition* [Biblioteca de mostres; CC0 1.0]. GitHub. https://github.com/sgossner/VSCO-2-CE
