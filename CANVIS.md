# Pim Pam 0.75 · Portada amb il·lustracions de les activitats

Base: 0.74.2 (65b62d0). Respon als missatges d’en Marc de l’11 de novembre de 2026: «La imatge inicial de la pàgina principal hauria de ser un Gif que mostrés 15 imatges espectaculars de les activitats… que semblin il·lustracions d’un conte, i van transicionant d’una a una altra» i «En comptes de la imatge estàtica de flors que hi ha ara, que pot ser la primera».

## Què canvia

- **La imatge de la portada és ara una seqüència de 15 il·lustracions** que es fonen l’una en l’altra (fos de 2,5 s, 6 s cadascuna, i un desplaçament lent que no salta mai). La primera és el prat de flors de paper de sempre; les altres 14 són fotogrames reals de les activitats: Viatge a la selva (guacamais, nenúfar de nit, granota), El pou del temps (mamut, triceratops, pterosaure a la posta), Fons marí (bosc de llum), Sabana (girafes, lleons), les dues pel·lícules (Park Güell i Barcelona a la posta; l’escola), Fractals a la natura (falgueres i flocs) i Fem castells.
- **Per què no un GIF:** un GIF només té 256 colors per fotograma i, en un fos encadenat d’imatges pintades, fa bandes i soroll; a més, 15 imatges en GIF pesarien desenes de MB. Les il·lustracions són WebP de 1440 × 878 (1,2 MB en total) i el fos el fa el navegador, amb els colors sencers.
- **Càrrega:** només es baixa la imatge següent; la seqüència s’espera si la pestanya és amagada, si hi ha un diàleg obert o si la imatge encara no ha arribat. En tornar a la portada (per exemple, en sortir d’una carpeta) continua per on anava.
- **Moviment reduït:** amb «reduir el moviment» del sistema, les imatges no es desplacen; només es fonen.
- **Text alternatiu** de la imatge actualitzat als sis idiomes.

## Proves

- Comprovat a Chromium: la seqüència avança, carrega les imatges una a una, es manté en tornar a la portada i no hi ha errors. Suite 466/469 (els 3 errors coneguts dels arxius de so que no són al repositori). L’auditoria de flaixos no s’ha passat (la passa en Marc); el canvi és un fos lent, sense flaixos.

