# Pim Pam · Catàleg de 40 estímuls · 0.3

Cada fila correspon a una pulsació acceptada. Després del patró 20 torna el primer. La durada és configurable; l’acompanyament harmònic segueix el progrés de l’animació.

## Tinta viva

Tinta viva es va treure a la 0.26.1. Les seves vint paletes es conserven perquè donen color als efectes de causa-efecte (`causePalette`).

| Núm. | Composició | Geometria / desplegament | Paleta |
| --- | --- | --- | --- |
| 1 | Filaments vius | cinc ventalls que se separen i tornen al centre | #49ddd0 · #608ee8 · #bb91ed · #f3c18c |
| 2 | Espiral de nacre | una doble espiral que es desenrotlla | #7be0db · #3c9dbb · #8274d1 · #f4d4b4 |
| 3 | Nus de seda | llaços entrellaçats que es deformen suaument | #eca6b8 · #a88de2 · #6bcfc9 · #f5d69e |
| 4 | Òrbites de vidre | anells inclinats amb perles orbitals | #e8b98b · #db7e96 · #9e8fd6 · #8edbd1 |
| 5 | Ones de marea | bandes horitzontals que s’obren en onades | #f1cc78 · #b99bdb · #e2a682 · #eee0bf |
| 6 | Rosassa de tinta | una corol·la geomètrica de set lòbuls | #e993ba · #9b99e1 · #f2c8ad · #d6b1e6 |
| 7 | Cristalls hexagonals | una xarxa de cel·les que s’expandeix des del centre | #9de0b8 · #63bdb2 · #dce7ac · #f0d6c2 |
| 8 | Ventall de seda | un ventall asimètric que s’obre i es plega | #b4a3ec · #ddabd9 · #8fc8dd · #eee0cf |
| 9 | Dos remolins | dos vòrtexs que s’acosten i s’allunyen | #eab16f · #dd987d · #a7b9dc · #f4deac |
| 10 | Cintes trenades | tres cintes que es creuen com una trena | #a7b9ef · #82c8dd · #debae5 · #eddbbf |
| 11 | Estrella de neu | sis braços ramificats que creixen per etapes | #b7d88a · #78bca2 · #e7cf85 · #bedbd1 |
| 12 | Nautilus de llum | cambres corbes que despleguen una conquilla | #d890cf · #edacc0 · #9ea9df · #f2d8b3 |
| 13 | Teler circular | un volum anular teixit amb fils que giren | #8eddef · #5cb9d7 · #b6c7ee · #e5ecdc |
| 14 | Mandala angular | capes de triangles i quadrats que s’obren en contrapunt | #f0a076 · #f3c294 · #cc91a8 · #ebe0b1 |
| 15 | Mar de rombes | una malla ondulada de rombes que respira | #9897df · #6f9ecb · #c8b7e5 · #e7c5ae |
| 16 | Anells d’aigua | cercles que neixen successivament i es fonen | #cddd93 · #a8c6ac · #efd49e · #abd6ce |
| 17 | Ales de tinta | dos ventalls bilaterals que baten suaument | #dca5ac · #edc4b8 · #c5adc9 · #e5d8b8 |
| 18 | Arbre de corall | branques geomètriques que creixen des de baix | #7ed8c2 · #86b9c9 · #d6e8bd · #d0b7dc |
| 19 | Cometes de seda | quatre esteles que recorren un camí quadrilobulat | #c394bc · #e4adcc · #95bcd7 · #f1d0ae |
| 20 | Calidoscopi | sis sectors de motius triangulars que es despleguen | #c8dce5 · #eee3c6 · #adbbdc · #a5d3ce |

## Flor de paper

Des de la 0.51, Flor de paper no té vint patrons: té vint flors reals en cinc jardins (`dist/flor-especies.js`). Cada jardí és una peça musical que creix flor a flor.

| Jardí | Paper | Música | Flors (color de la llum) |
| --- | --- | --- | --- |
| El prat (matí d’estiu) | crespó | re major, 6/8 · guitarra, flauta, violins pizzicato, glockenspiel | rosella (vermell), margarida (blanc càlid), gira-sol (or), blauet (blau) |
| L’estany (alba) | seda | fa lidi, 3/4 · arpa, vibràfon, clarinet, violoncels pizzicato | nenúfar blanc, lotus (rosa), lliri groc, cala |
| El bosc (tarda) | cartolina plegada | la dòric, 4/4 · marimba, oboè, violoncels pizzicato, fagot | didalera (porpra), ciclamen (magenta), violeta (violeta), peònia (rosa) |
| El jardí de nit (lluna) | seda | mi pentatònic, 4/4 · piano, kalimba, glockenspiel, arpa | flor de lluna, lliri blanc, camèlia (vermell), gessamí |
| L’hivernacle (pluja càlida) | aquarel·la | sol mixolidi, 4/4 · marimba, udu, kalimba, flauta | orquídia (fúcsia), hibisc (vermell), passiflora (blau), ocell del paradís (taronja) |

A la segona volta, el jardí surt a l’inrevés i les flors que en tenen mostren una varietat real de color (per exemple, la rosella rosa, el gira-sol vermell, la camèlia blanca o l’hibisc groc). Les flors són de paper i s’inspiren en la forma, l’obertura i els visitants de cada espècie; no són il·lustracions botàniques.

## Gotes de pintura (abans Pluja de colors)

Des de la 0.52, Pluja de colors no té vint composicions: té vint fulls de paper marbrejat en cinc tallers (`dist/marbre-tallers.js`). Cada pulsació és un pas del full, i l’últim pas és l’estampa.

Des de la 0.52.1, cada full té la seva manera de posar la tinta (disposició) i el seu gest, i dues paletes pròpies (primera i segona volta). Cap tinta es repeteix entre els 40 conjunts, i dos fulls seguits es diferencien almenys 18 unitats ΔE00 (Sharma et al., 2005). A partir de la tercera volta, les paletes giren el to en l’espai OKLCH.

| Taller | Música | Fulls (disposició · gest) |
|---|---|---|
| Barcelona (enquadernació) | la major, 3/4 · guitarra, clarinet, contrabaix, violins pizzicato, arpa, pandereta | Turc (pedres grans i petites, vetes · punxó en diagonal), Espanyol (pedres de dos colors · vaivé en diagonal), Pentinat (franges verticals · punxó i pinta fina), Cua de paó (escaquer · punxó, pinta i pinta d’ones) |
| Istanbul (ebru) | re *hijaz*, 9/8 · arpa, udu, oboè, tambor | Pedres amb vora (tres colors, vora fosca · traç en essa), Anada i tornada (files en diagonal · punxó amunt i avall), Cadena de cors (quatre dianes · un sol traç), Tulipa (marc de pedres · flor feta amb el punxó) |
| Kyoto (suminagashi) | mi *in*, 4/4 · arpa, marimba, claves | Anells (pocs centres · ventall), Ventall (tres centres · dos bufs), Ondulació (centres en diagonal · una ona lenta), Roda (un sol centre · voltes alternes del punxó) |
| París (claraboia) | fa major, 3/4 · piano, violoncels i violins pizzicato, glockenspiel, triangle | Rodet francès (files encavalcades · pinta fina i caragols), Ram (files ondulades · punxó, pinta fina i pinta d’ones), Estel (una diana enorme · dotze raigs enfora i endins), Rosa (corona de gotes · flor feta amb el punxó) |
| Nuremberg (impressor) | sol major, 2/4 · marimba, fagot, flauta, glockenspiel, claves | Holandès antic (quadrícula · punxó, pinta i pinta de través), Ziga-zaga (franges de quatre colors · ziga-zaga), Espiral (gotes en espiral · voltes del punxó), Remolí (dues dianes · tres remolins) |

A la segona volta, cada full fa servir la seva segona paleta i els gestos van en mirall. Els patrons europeus i el suminagashi segueixen la bibliografia (vegeu `CANVIS.md`, 0.52 i 0.52.1); els colors, les eines i la música són decisions de disseny.
