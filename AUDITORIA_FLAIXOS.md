# Auditoria de flaixos · tota l’aplicació (0.77)

Generada el 12 de novembre de 2026 amb `tools/flash-audit-app.mjs` (activitats en directe), `tools/flash-audit-videos.sh` (els 121 vídeos MP4) i `tools/flash-analyze.py` (analitzador comú). Substitueix l’informe anterior, que només cobria el Caleidoscopi de la versió 0.7.

## Mètode

- **Criteri.** WCAG 2.2, criteri 2.3.1 (nivell A): cap part de la pantalla no pot fer més de tres flaixos en un segon, llevat que el flaix quedi per sota dels llindars de flaix general i de flaix vermell (World Wide Web Consortium [W3C], 2023). Un flaix és un parell de canvis oposats de lluminància relativa de 0,1 o més, amb l’estat fosc per sota de 0,8, que afecta conjuntament més del 25 % d’un camp visual de 10° (341×256 px en una pantalla de 1024×768 vista a la distància habitual).
- **Mesura.** Cada fotograma es porta a una graella de 1024×576 px en cel·les de 8×8. Per a cada camp de 10° (desplaçat de 4 en 4 cel·les) es compta una transició quan almenys el 25 % de les cel·les del camp han canviat juntes, en el mateix sentit, 0,1 o més des de la transició anterior, i com a màxim la meitat d’aquesta quantitat ha canviat en sentit contrari (així un desplaçament de càmera, que aclareix unes zones i enfosqueix les del costat, no compta com a flaix). El vermell es mesura igual amb el valor de vermell saturat de WCAG (canvi de 20 o més). Un camp falla amb 7 transicions o més dins d’un segon (més de tres flaixos).
- **Activitats en directe.** Chromium amb rellotge simulat (Playwright `clock.install` + `pauseAt`): cada fotograma es captura en un temps virtual exacte, sigui quina sigui la velocitat de la màquina; el rellotge d’àudio i el temps de `requestAnimationFrame` segueixen el mateix rellotge. 15 s per activitat a 20 fotogrames per segon, amb una pulsació cada 4 s (pulsació mantinguda a El vent del bosc i El viatge en globus). La portada s’analitza igual.
- **Vídeos.** Els 121 MP4 de `dist/videos/` es descodifiquen sencers amb ffmpeg a la seva freqüència original.
- **Validació.** Controls que han de fallar i fallen: negre/blanc a 5 Hz sobre 300×400 px i negre/vermell saturat a 5 Hz. Control que ha de passar i passa: un quadrat de 50×50 px que parpelleja a 5 Hz (massa petit per ser un flaix segons la definició).
- **Límits.** És una comprovació d’enginyeria, no una certificació: no substitueix un analitzador reconegut com el Harding Test, no avalua els patrons espacials regulars (ratlles i reixes) i suposa una pantalla d’ordinador a distància normal. En una pantalla gran o vista molt a prop, el camp de 10° ocupa menys píxels i el risc augmenta (Harding & Harding, 2010). Les activitats no s’han provat amb totes les combinacions d’ajustos.

## Resultats · activitats en directe

| Activitat | Identificador | Flaixos generals per segon (pitjor camp) | Flaixos vermells per segon | Errors JS | Resultat |
|---|---|---|---|---|---|
| Portada (imatges que es fonen) | `__home__` | 0 | 0 | 0 | Supera |
| Caleidoscopi | `kaleido` | 0,5 | 0 | 0 | Supera |
| Comunicar a tot arreu sempre | `comunicar` | 1 | 0 | 0 | Supera |
| Detectius de sons | `sounds` | 0 | 0 | 0 | Supera |
| Dia rere dia | `daynight` | 0,5 | 0 | 0 | Supera |
| Dibuixos que ballen | `drawings` | 10 | 0 | 0 | Supera (nota 1) |
| D’on ve aquest so? | `sources` | 1 | 0 | 0 | Supera |
| El cambrer equilibrista | `waiter` | 0 | 0 | 0 | Supera |
| El cel de les constel·lacions | `constellations` | 0,5 | 0 | 0 | Supera |
| El far | `lighthouse` | 0,5 | 0 | 0 | Supera |
| El mag desastrós | `magician` | 0 | 0 | 0 | Supera |
| El meu espectacle de llum | `lights` | 1 | 0 | 0 | Supera |
| El pou del temps | `well` | 2,5 | 0 | 0 | Supera |
| El taller de vehicles | `vehicles` | 1 | 0 | 0 | Supera |
| El vent del bosc | `wind` | 1 | 0 | 0 | Supera |
| El vestidor fantàstic | `vestidor` | 3 | 0 | 0 | Supera, al límit |
| El viatge en globus | `viatge` | 0 | 0 | 0 | Supera |
| Encaixos de fusta | `encaix` | 1,5 | 0 | 0 | Supera |
| Estiu a la masia | `masia` | 2 | 0 | 0 | Supera |
| Fem castells | `castells` | 0 | 0 | 0 | Supera |
| Festa de globus | `balloons` | 0,5 | 0 | 0 | Supera |
| Flor de paper | `flower` | 0 | 0 | 0 | Supera |
| Fons marí de vidre | `jelly` | 1 | 0 | 0 | Supera |
| Fractals a la natura | `fractals` | 0,5 | 0 | 0 | Supera |
| Gegants del blau | `giants` | 2,5 | 0 | 0 | Supera |
| Gotes de pintura | `color-rain` | 0 | 0 | 0 | Supera |
| Joguines que ballen | `toys` | 10 | 0 | 0 | Supera (nota 1) |
| La cassola de Glupòcrates | `pot` | 2 | 0 | 0 | Supera |
| La cuina que balla | `kitchen` | 1 | 0 | 0 | Supera |
| La fira de llauna | `fira` | 1 | 0 | 0 | Supera |
| La flor musical | `flora` | 0,5 | 0 | 0 | Supera |
| La fàbrica dels disbarats | `inventions` | 0 | 0 | 0 | Supera |
| La granota bombollaire | `frog` | 0,5 | 0 | 0 | Supera |
| Laboratori de matèria | `bubbles` | 0,5 | 0 | 0 | Supera |
| L’orquestra que es desperta | `orchestra` | 0,5 | 0 | 0 | Supera |
| Muntem el robot | `robotbuild` | 1 | 0 | 0 | Supera |
| Natura | `natura` | 0,5 | 0 | 0 | Supera |
| On anem? | `destinations` | 1 | 0 | 0 | Supera |
| Pinta el món | `pinta` | 1 | 0 | 0 | Supera |
| Piromusical | `piro` | 1 | 0 | 0 | Supera |
| Pluja de colors | `pluja-colors` | 1 | 0 | 0 | Supera |
| Sabana de paper | `savanna` | 1,5 | 0 | 0 | Supera |
| Selva de llum | `jungle` | 2 | 0 | 0 | Supera |
| Toc, toc! Qui hi ha? | `door` | 0 | 0 | 0 | Supera |
| Un mos a Barcelona | `mos` | 1 | 0 | 0 | Supera |
| Vitralls | `vitrall` | 0,5 | 0 | 0 | Supera |

**Nota 1 (Dibuixos que ballen, Joguines que ballen).** En dues execucions fetes amb la màquina saturada per altres processos, les captures alternaven el darrer dibuix i el negre durant l’espera, i el resultat era de 10 flaixos per segon. La traça del programa demostra que el llenç del joc és negre a cada fotograma de l’espera (el dibuix ja s’ha fos en 1 s al final de l’efecte): les imatges alternes eren fotogrames endarrerits del compositor del navegador en aquest entorn sense GPU, no contingut de l’aplicació. En totes les execucions sense càrrega (cinc) el resultat és de 0,5 flaixos per segon o menys.

## Resultats · vídeos (121)

Superen el criteri 120 de 121. Els que tenen 2 flaixos per segon o més:

| Vídeo | Flaixos generals per segon | Moment (s) | Flaixos vermells per segon | Resultat |
|---|---|---|---|---|
| sabana_escena_20.mp4 | 4,5 | 17,1 | 0,0 | **No supera** |
| pou_escena_20.mp4 | 3,0 | 15,5 | 0,0 | Supera, al límit |
| fons_escena_19.mp4 | 2,0 | 0,5 | 0,0 | Supera |
| pou_escena_03.mp4 | 2,0 | 0,3 | 0,0 | Supera |
| pou_escena_06.mp4 | 2,0 | 0,4 | 0,0 | Supera |
| pou_escena_09.mp4 | 2,0 | 0,5 | 0,0 | Supera |
| pou_escena_13.mp4 | 2,0 | 0,4 | 0,0 | Supera |
| selva_escena_06.mp4 | 2,0 | 0,5 | 0,0 | Supera |
| selva_escena_09.mp4 | 2,0 | 0,6 | 0,0 | Supera |

La resta de vídeos fan menys de 2 flaixos per segon en el pitjor camp. `sabana_escena_20.mp4` (Sabana de paper, travessa de núvols roses cap als 17 s) supera el llindar; `pou_escena_20.mp4` (El pou del temps, pujada ràpida entre estrats de roca cap als 15,5 s) queda exactament al límit. Cal decidir si es tornen a renderitzar més lents o més suaus.

## Referències

Harding, G. F. A., & Harding, P. F. (2010). Photosensitive epilepsy and image safety. *Applied Ergonomics, 41*(4), 504–508. https://doi.org/10.1016/j.apergo.2008.08.005

World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2* (W3C Recommendation). https://www.w3.org/TR/WCAG22/
