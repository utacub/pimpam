# Crèdits dels instruments enregistrats (Natura, CE23, i Piromusical, CE24)

Les 123 notes d’instrument d’aquesta carpeta són fragments editats (retallats, en mono, amb el volum igualat, amb bucles fets i codificats en MP3) de:

**Versilian Studios Chamber Orchestra 2 – Community Edition (VSCO-2 CE)**, de Versilian Studios / Samuel Gossner i col·laboradors.

- https://github.com/sgossner/VSCO-2-CE
- https://vis.versilstudios.com/vsco-community.html

VSCO-2 CE es publica amb la dedicació al domini públic **CC0 1.0 Universal**. Els fragments editats provenen del paquet npm `tiny-orchestra` 0.2.0, que també els publica amb CC0 1.0. La llicència no exigeix cap atribució; la fem igualment, per reconeixement.

| Carpeta | Instrument a Pim Pam | Notes |
|---|---|---|
| `harp` | arpa (`harpRec`) | 9 |
| `marimba` | marimba (`marimbaRec`) | 7 |
| `glockenspiel` | glockenspiel (`glockRec`) | 5 |
| `flute` | flauta travessera (`fluteRec`) | 9 |
| `oboe` | oboè (`oboeRec`) | 7 |
| `clarinet` | clarinet (`clarinetRec`) | 7 |
| `violins` | secció de violins, *piano* (`violinsRec`) | 6 |
| `celli` | secció de violoncels (`celliRec`) | 8 |
| `violinsPizz` | violins en pizzicato (`violinsPizzRec`) | 11 |
| `celliPizz` | violoncels en pizzicato (`celliPizzRec`) | 10 |
| `triangle` | triangle (`triangleRec`) | 2 |
| `woodblock` | claves (`woodblockRec`) | 2 |
| `trumpet` | trompeta (`trumpetRec`) · Piromusical | 10 |
| `horn` | trompa (`hornRec`) · Piromusical | 6 |
| `trombone` | trombó (`tromboneRec`) · Piromusical | 5 |
| `tuba` | tuba (`tubaRec`) · Piromusical | 7 |
| `timpani` | timbales (`timpaniRec`) · Piromusical | 5 |
| `cymbal` | plats: un crescendo i dos cops suaus (`cymbalRec`) · Piromusical | 3 |
| `bassdrum` | bombo, cop suau (`bassdrumRec`) · Piromusical | 1 |
| `snare` | caixa (`snareRec`) · Piromusical | 2 |
| `snareRoll` | redoble de caixa (`snareRollRec`) · Piromusical | 1 |

La taula de notes (fitxer, nota MIDI, inici, afinació i bucle) és a `dist/sampler.js`. L’HTML autònom porta aquests fitxers a dins, codificats en base64.

# Crèdits dels sons de natura

Els sons de natura de la carpeta `nature` s’han preparat amb `tools/make_ambience.py`:

- s’han convertit en un bucle sense costura amb una fosa encadenada de 2 s;
- s’han passat a mono;
- als sons densos, s’han rebaixat les puntes rares;
- s’ha igualat el volum a −32 LUFS;
- s’han codificat en MP3.

Al prat i a les bombolles també s’hi ha aplicat un filtre passaalt de 60 Hz, que treu un retró per sota del que se sent.

## Enregistrament de camp

Només s’accepten enregistraments en domini públic, amb CC0 o amb CC BY. No n’hi ha cap amb CC BY-SA.

| Fitxer | So | Títol original | Autor | Font | Llicència |
|---|---|---|---|---|---|
| `brook.mp3` | rierol (`brook`) | Brook sound | TwoWings | https://commons.wikimedia.org/wiki/File:Brook_sound.ogg | CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/) |

Atribució requerida: «Brook sound», de TwoWings, Wikimedia Commons, CC BY 3.0. Modificat: fragment de 16 s convertit en bucle, en mono i amb el volum ajustat.

## Sons generats amb ElevenLabs

Els onze sons següents s’han generat amb ElevenLabs Sound Effects (model `eleven_text_to_sound_v2`), el 25 d’octubre de 2026. No són enregistraments reals ni obres de tercers. Els drets d’ús depenen de les condicions d’ElevenLabs i del pla del compte que els va generar, i no s’han verificat. Les indicacions i els identificadors de generació són a `natura_sons/FONTS.md`, a la carpeta del projecte.

| Fitxer | So | Fitxer original |
|---|---|---|
| `dawn.mp3` | cor d’ocells a l’alba (`dawn`) | `b_cor_alba_EL_1.mp3` |
| `blackbird.mp3` | merla (`blackbird`) | `c_merla_EL_1.mp3` |
| `rain.mp3` | pluja suau sobre fulles (`rain`) | `d_pluja_fulles_EL_1.mp3` |
| `drops.mp3` | gotes d’aigua en una bassa (`drops`) | `e_gotes_EL_1.mp3` |
| `waves.mp3` | onades suaus (`waves`) | `f_onades_EL_1.mp3` |
| `wind.mp3` | vent a les fulles (`wind`) | `g_vent_fulles_EL_1.mp3` |
| `meadow.mp3` | prat d’estiu amb abelles (`meadow`) | `h_prat_abelles_EL_1.mp3` |
| `crickets.mp3` | grills al capvespre (`crickets`) | `i_grills_EL_1.mp3` |
| `frogs.mp3` | granotes a la bassa (`frogs`) | `j_granotes_EL_1.mp3` |
| `bubbles.mp3` | bombolles sota l’aigua (`bubbles`) | `k_bombolles_EL_1.mp3` |
| `drips.mp3` | degoteig de cova amb ressò (`drips`) | `l_cova_EL_1.mp3` |

Crèdit: «Sons generats amb ElevenLabs».

# Crèdits dels sons dels focs (Piromusical, CE24)

Els sis sons de la carpeta `fire` s’han generat amb ElevenLabs Sound Effects (model `eleven_text_to_sound_v2`), el 25 d’octubre de 2026, amb permís explícit d’en Marc per fer-hi esclats suaus. No són enregistraments reals ni obres de tercers. Els drets d’ús depenen de les condicions d’ElevenLabs i del pla del compte que els va generar, i no s’han verificat. Les indicacions, els identificadors de generació i els originals són a `focs_sons/` (amb `FONTS.md`), a la carpeta del projecte.

Els esclats s’han suavitzat amb `tools/make_oneshot.py`: comencen al primer so, amb una entrada arrodonida de 20 a 80 ms perquè cap esclat no arribi com un cop sec; s’hi ha aplicat un filtre passaalt (i passabaix al bum, perquè sigui rodó i llunyà); s’han tret els tons fixos a múltiples de 100 Hz que portaven dos dels sons; s’han tallat amb una fosa de sortida; i s’ha igualat el volum (sonoritat momentània màxima de −20 a −24 LUFS, mai per sobre de −1 dBFS). La font s’ha fet amb `tools/make_ambience.py` (bucle sense costura, −26 LUFS).

| Fitxer | So | Fitxer original |
|---|---|---|
| `boom.mp3` | esclat gran, bum suau i llunyà (`boom`) | `boom_EL_4.mp3` |
| `bloom.mp3` | esclat petit amb espurneig (`bloom`) | `bloom_EL_2.mp3` |
| `crackle.mp3` | crepiteig suau de purpurina (`crackle`) | `crackle_EL_4.mp3` |
| `launch.mp3` | xiuxiueig del coet que puja, sense xiulet (`launch`) | `launch_EL_1.mp3` |
| `shimmer.mp3` | pluja d’espurnes que cauen (`shimmer`) | `shimmer_EL_3.mp3` |
| `fizz.mp3` | font d’espurnes, xiuxiueig continu (`fizz`) | `fountain_EL_3.mp3` |

Crèdit: «Sons generats amb ElevenLabs».

# Crèdits dels efectes de dibuixos animats (El mag desastrós, CE29; Toc, toc! Qui hi ha?, CE30; El cambrer equilibrista, CE31; La cassola de Glupòcrates, EN23)

Els dinou sons de la carpeta `toon` s’han generat amb ElevenLabs Sound Effects (model `eleven_text_to_sound_v2`), el 30 d’octubre de 2026 (set per al mag, tres per a la porta, tres per al cambrer i sis per a la cassola), amb el permís general d’en Marc per fer servir ElevenLabs. No són enregistraments reals ni obres de tercers. Els drets d’ús depenen de les condicions d’ElevenLabs i del pla del compte que els va generar, i no s’han verificat. Les indicacions, els identificadors de generació i els originals són a `dibuixos_sons/` (amb `FONTS.md`), a la carpeta del projecte.

S’han preparat amb `tools/make_oneshot.py`, com els focs: comencen al primer so amb una entrada arrodonida de 3 a 15 ms, tallats amb una fosa de sortida i amb el volum igualat (sonoritat momentània màxima de −19 a −26 LUFS). Els de la porta (CE30) són del flux `pHmeRJ4gioYnTV4uNYmM`, els del cambrer (CE31), del flux `xxxjpqjDvRXObu5yuW5j`, i els de la cassola (EN23), del flux `xLGVaN6ORimymDrTlokz`. Les variacions s’han triat per mesura, no escoltant-les.

| Fitxer | So | Fitxer original |
|---|---|---|
| `poof.mp3` | puf de fum del barret (`poof`) | `poof_3.mp3` |
| `squirt.mp3` | raig d’aigua de la flor (`squirt`) | `squirt_3.mp3` |
| `cards.mp3` | baralla que salta pels aires (`cards`) | `cards_4.mp3` |
| `yank.mp3` | estirada de les estovalles (`yank`) | `yank_2.mp3` |
| `slideDown.mp3` | xiulet de pistó que baixa (`slideDown`) | `slideDown_4.mp3` |
| `slideUp.mp3` | xiulet de pistó que puja (`slideUp`) | `slideUp_2.mp3` |
| `boing.mp3` | molla (`boing`) | `boing_1.mp3` |
| `knock.mp3` | tres trucs de nusos a la porta (`knock`, CE30) | `knock_4.mp3` |
| `doorOpen.mp3` | porta que s’obre amb un grinyol curt (`doorOpen`, CE30) | `doorOpen_2.mp3` |
| `doorClose.mp3` | porta que es tanca suau (`doorClose`, CE30) | `doorClose_1.mp3` |
| `clink.mp3` | dring d’un plat de porcellana sobre la safata (`clink`, CE31) | `clink_2.mp3` |
| `jelly.mp3` | gelatina que cau i tremola (`jelly`, CE31) | `jelly_3.mp3` |
| `clatter.mp3` | plats, tassa i tetera que cauen suaument sense trencar-se (`clatter`, CE31) | `clatter_4.mp3` |
| `plop.mp3` | ingredient que cau a la sopa espessa (`plop`, EN23) | `plop_1.mp3` |
| `blub.mp3` | sopa que bull suaument a l’olla (`blub`, EN23) | `blub_1.mp3` |
| `slurp.mp3` | xarrup del cuiner que tasta la sopa amb el cullerot (`slurp`, EN23) | `slurp_1.mp3` |
| `inflate.mp3` | globus de goma que s’infla, sense esclatar (`inflate`, EN23) | `inflate_3.mp3` |
| `stretch.mp3` | goma que s’estira cap als costats (`stretch`, EN23) | `stretch_2.mp3` |
| `hiccup.mp3` | singlot petit i còmic (`hiccup`, EN23) | `hiccup_3.mp3`, a partir de 0,18 s |

Crèdit: «Sons generats amb ElevenLabs».

# Crèdits dels sons de Selva de llum (CE35, 0.29)

Els quinze sons d’aquesta llista s’han generat amb ElevenLabs Sound Effects (model `eleven_text_to_sound_v2`) el 31 d’octubre de 2026, amb el permís general d’en Marc per fer servir ElevenLabs, al flux `kFyrrz6n2moRPZfkg1Pc`, quatre variacions per so. No són enregistraments de camp: són sons generats, i els drets d’ús que en dona ElevenLabs no s’han comprovat aquí. La presa s’ha triat per mesura (durada, sonoritat, pic i espectrograma), sense escoltar-la. Els tres ambients (carpeta `nature`) s’han fet bucles amb `tools/make_ambience.py`; els dotze sons curts (carpeta `selva`) s’han preparat amb `tools/make_oneshot.py`, amb el volum igualat (sonoritat momentània màxima de −20 a −30 LUFS).

| Fitxer | So | Fitxer original | Indicació donada a ElevenLabs |
|---|---|---|---|
| `nature/alba.mp3` | alba de la selva: ocells i lloros llunyans (`alba`, bucle de 12 s) | `alba_1.mp3` | «Tropical rainforest dawn ambience, many distant songbirds and parrots, gentle and calm, no wind, no people» |
| `nature/nit.mp3` | nit de la selva: grills i granotes llunyanes (`nit`, bucle de 12,5 s fet de la presa i la mateixa presa del revés) | `nit_2.mp3` | «Tropical rainforest night ambience, soft katydids and distant tree frogs, steady and gentle» |
| `nature/riu.mp3` | sota l’aigua d’un riu tranquil (`riu`, bucle de 13,5 s fet de la presa, del revés i un altre cop) | `riu_1.mp3` | «Underwater ambience in a calm river, soft muffled flow, faint distant bubbles, deep and quiet» |
| `selva/guacamai.mp3` | dos crits de guacamai, llunyans (`guacamai`) | `guacamai_3.mp3` | «Two scarlet macaw squawks, distant, echoing softly over a rainforest canopy» |
| `selva/tuca.mp3` | tres crits rogallosos de tucà (`tuca`) | `tuca_1.mp3` | «Toucan call, three short croaking yelps, close, in a rainforest tree» |
| `selva/colibri.mp3` | brunzit d’ales de colibrí amb dos piulets (`colibri`) | `colibri_3.mp3` | «Hummingbird hovering close-mic, soft fast wing hum with two tiny chirps» |
| `selva/fulles.mp3` | fulles grans que freguen en passar (`fulles`, el travelling per les capçades) | `fulles_2.mp3` | «Large tropical leaves swishing past quickly, soft dry rustle, close» |
| `selva/tamari.mp3` | xiulets i trinats d’un tamarí (`tamari`) | `tamari_1.mp3` | «Small tamarin monkey calling, high soft whistled trills and chirps, close, in a tree» |
| `selva/granota.mp3` | trinat d’una granota punta de fletxa (`granota`) | `granota_3.mp3` | «Tiny poison dart frog calling, fast soft buzzing trill, close-mic» |
| `selva/capibara.mp3` | ronc suau de capibara (`capibara`) | `capibara_1.mp3` | «Capybara soft clicking purr, calm and close, quiet riverbank at night» |
| `selva/capbussada.mp3` | capbussada suau al riu i bombolles (`capbussada`, el travelling sota l’aigua) | `capbussada_1.mp3` | «Soft splash into calm river water, then muffled underwater bubbles rising» |
| `selva/dofi.mp3` | clics i xiulet de dofí de riu (`dofi`) | `dofi_2.mp3` | «River dolphin underwater, soft echolocation clicks and a gentle whistle» |
| `selva/glup.mp3` | glop d’aire d’un peix gros a la superfície (`glup`) | `glup_0.mp3` | «Large fish surfacing on calm water to gulp air, one deep gulp with a soft splash» |
| `selva/escarabat.mp3` | escarabat que alça el vol (`escarabat`) | `escarabat_3.mp3` | «Small beetle taking off, short soft buzzing flight passing by» |
| `selva/talla.mp3` | talls petits d’una fulla (`talla`, les formigues talladores) | `talla_3.mp3` | «Tiny crisp snips of a leaf being cut, close-mic, very quiet» |

Crèdit: «Sons generats amb ElevenLabs».

# Crèdits dels sons de Sabana de paper (CE36, 0.30)

Els 46 sons d’aquesta llista s’han generat amb ElevenLabs Sound Effects (model `eleven_text_to_sound_v2`) el 31 d’octubre de 2026, amb el permís general d’en Marc per fer servir ElevenLabs, al flux `dKzHjx2JtSN3IiGdGUem`, quatre variacions per so. No són enregistraments de camp ni d’instruments reals: són sons generats, i els drets d’ús que en dona ElevenLabs no s’han comprovat aquí. La presa s’ha triat per mesura (durada, sonoritat, pic, espectrograma i, per a les notes de kalimba, l’altura i la netedat de la nota), sense escoltar-la. Els cinc ambients (carpeta `nature`, noms `sb…`) s’han fet bucles de 14 s amb `tools/make_ambience.py` (alguns amb el filtre passa-baixos nou, `--lowpass`); els sons curts (carpetes `sabana`, `kalimba` i `tambor`) s’han preparat amb `tools/make_oneshot.py`, amb el volum igualat. Les sis notes de kalimba formen el banc `kalimbaRec`: cada nota es fa sonar a les altures properes canviant-ne la velocitat, amb la correcció d’afinació mesurada (`tune`, en cèntims, a `sampler.js`). El tambor i el sonall formen el banc `tamborRec`; els animals, l’aigua, l’aire i el paper, el banc `sabanaRec`. Ni el tambor ni els sons de la sabana tenen substitut sintètic: fins que no s’han descodificat, no sonen.

| Fitxer | So | Fitxer original | Indicació donada a ElevenLabs |
|---|---|---|---|
| `nature/sbAlba.mp3` | alba a la sabana: ocells llunyans i tórtores, una mica de brisa a l’herba seca (`sbAlba`, bucle de 14 s) | `amb_alba_llarg_0.mp3` | «African savanna at dawn ambience, distant birdsong and cooing doves, very light breeze in dry grass, calm, no people» |
| `nature/sbMigdia.mp3` | migdia a la sabana: cigales suaus, vent a l’herba, ocells llunyans (`sbMigdia`, bucle de 14 s, filtre passa-baixos de 6,5 kHz) | `amb_migdia_llarg_2.mp3` | «Hot midday on the African savanna ambience, steady soft cicadas, gentle wind in dry grass, distant bird calls, no people» |
| `nature/sbRiu.mp3` | un riu ample i tranquil: l’aigua que toca la riba de fang (`sbRiu`, bucle de 14 s) | `amb_riu_llarg_3.mp3` | «Wide calm river in the savanna ambience, gentle water lapping on a muddy bank, soft flow, distant birds, no people» |
| `nature/sbVespre.mp3` | el vespre: ocells que s’ajoquen i els primers grills (`sbVespre`, bucle de 14 s, filtre passa-baixos de 7,5 kHz) | `amb_vespre_llarg_2.mp3` | «African savanna at dusk ambience, birds calling softly as they settle to roost, first gentle crickets, calm» |
| `nature/sbNit.mp3` | la nit: grills i granotes llunyanes (`sbNit`, bucle de 14 s, filtre passa-baixos de 7,5 kHz) | `amb_nit_llarg_1.mp3` | «African savanna at night ambience, steady soft crickets, distant gentle frogs, calm and quiet» |
| `kalimba/k58.mp3` | una nota de kalimba (`kalimbaRec`, la més greu, presa com a si♭3 afinat) | `kalimba_a_0.mp3` | «Single soft kalimba note, thumb plucked metal tine, warm wooden box resonance, close-mic, clean long decay» |
| `kalimba/k59.mp3` | una nota de kalimba (`kalimbaRec`) | `kalimba_a_3.mp3` | «Single soft kalimba note, thumb plucked metal tine, warm wooden box resonance, close-mic, clean long decay» |
| `kalimba/k62.mp3` | una nota de kalimba (`kalimbaRec`) | `kalimba_a_2.mp3` | «Single soft kalimba note, thumb plucked metal tine, warm wooden box resonance, close-mic, clean long decay» |
| `kalimba/k64.mp3` | una nota de kalimba (`kalimbaRec`) | `kalimba_a_1.mp3` | «Single soft kalimba note, thumb plucked metal tine, warm wooden box resonance, close-mic, clean long decay» |
| `kalimba/k69.mp3` | una nota aguda de kalimba (`kalimbaRec`) | `kalimba_b_0.mp3` | «Single high kalimba note, gentle thumb pluck, bright bell-like metal tine on a wooden resonator, close-mic, clean decay» |
| `kalimba/k71.mp3` | una nota aguda de kalimba (`kalimbaRec`) | `kalimba_b_1.mp3` | «Single high kalimba note, gentle thumb pluck, bright bell-like metal tine on a wooden resonator, close-mic, clean decay» |
| `tambor/baix.mp3` | un cop de mà greu en un tambor petit de fusta (`tamborRec` `baix`) | `tambor_2.mp3` | «One soft hand tap on a small wooden hand drum, warm round low thump, close-mic, single hit» |
| `tambor/mig.mp3` | un cop de mà mitjà en el mateix tambor (`tamborRec` `mig`) | `tambor_3.mp3` | «One soft hand tap on a small wooden hand drum, warm round low thump, close-mic, single hit» |
| `tambor/alt.mp3` | un toc de dit a la vora del tambor, agut (`tamborRec` `alt`) | `tambor_agut_0.mp3` | «One light fingertip tap on the rim of a small hand drum, soft high wooden tone, close-mic, single hit» |
| `tambor/vora.mp3` | un toc de dit a la vora, més curt (`tamborRec` `vora`) | `tambor_agut_2.mp3` | «One light fingertip tap on the rim of a small hand drum, soft high wooden tone, close-mic, single hit» |
| `tambor/sonall.mp3` | una sacsejada d’un sonall de llavors (`tamborRec` `sonall`) | `sonall_0.mp3` | «One soft shake of a small seed shaker, gentle dry rattle, close-mic, single short stroke» |
| `tambor/sonall2.mp3` | una altra sacsejada del sonall (`tamborRec` `sonall2`) | `sonall_3.mp3` | «One soft shake of a small seed shaker, gentle dry rattle, close-mic, single short stroke» |
| `sabana/elefant.mp3` | el ronc suau i un barrit curt d’un elefant, lluny (`elefant`) | `elefant_2.mp3` | «Elephant soft low rumble and a short gentle trumpet, far away, not loud» |
| `sabana/zebra.mp3` | el crit d’una zebra, com un lladruc curt (`zebra`) | `zebra_3.mp3` | «Zebra calling, short barking whinny, distant, open plain» |
| `sabana/facoquer.mp3` | grunys i esbufecs suaus d’un facoquer (`facoquer`) | `facoquer_3.mp3` | «Warthog soft grunts and snorts, close, dry grass» |
| `sabana/nyus.mp3` | un ramat de nyus que grunyen, lluny (`nyus`) | `nyus_1.mp3` | «Herd of wildebeest grunting, low nasal calls, distant» |
| `sabana/rinoceront.mp3` | l’esbufec suau d’un rinoceront (`rinoceront`) | `rinoceront_0.mp3` | «Rhinoceros snorting softly, heavy breath through the nose, close» |
| `sabana/mangostes.mp3` | un grup de mangostes que piulen (`mangostes`) | `mangostes_0.mp3` | «Small mongooses twittering and chirping softly in a group, close» |
| `sabana/calau.mp3` | el cloqueig rítmic d’un càlau (`calau`) | `calau_3.mp3` | «Hornbill call, soft rhythmic clucking, open bushland» |
| `sabana/teixidors.mp3` | una colònia de teixidors que xerren (`teixidors`) | `teixidors_2.mp3` | «Weaver birds chattering, busy colony of small birds in a tree, close» |
| `sabana/guepard.mp3` | la mare guepard que crida els cadells amb piulets aguts (`guepard`) | `guepard_1.mp3` | «Cheetah mother calling her cubs, soft high chirping calls, grassland» |
| `sabana/flamencs.mp3` | un estol de flamencs: gemecs suaus i murmuris (`flamencs`) | `flamencs_3.mp3` | «Flock of flamingos at a lake, many soft goose-like honks and low murmurs» |
| `sabana/grua.mp3` | dos crits suaus d’una grua coronada, lluny (`grua`) | `grua_1.mp3` | «Grey crowned crane calling, two soft honking calls, distant, open grassland» |
| `sabana/hipopotam.mp3` | el bram rogallós d’un hipopòtam des de l’aigua, lluny (`hipopotam`) | `hipopotam_1.mp3` | «Hippopotamus wheezing honking grunts, deep and distant, from the water» |
| `sabana/blauet.mp3` | el crit agut d’un blauet sobre l’aigua (`blauet`) | `blauet_0.mp3` | «Pied kingfisher calling, sharp high chattering chirps over water» |
| `sabana/picabous.mp3` | un estol d’ocells petits que alça el vol (`picabous`) | `picabous_2.mp3` | «Flock of small birds taking off together, hissing chatter and quick wing flutter» |
| `sabana/lleo.mp3` | un rugit de lleó molt lluny, al capvespre (`lleo`) | `lleo_3.mp3` | «Lion roaring far away at dusk, soft and distant across the open plain» |
| `sabana/ratpenats.mp3` | ratpenats de la fruita que xisclen i baten les ales (`ratpenats`, filtre passa-baixos de 9 kHz) | `ratpenats_2.mp3` | «Fruit bats squeaking softly and flapping their wings at night in a tree» |
| `sabana/galag.mp3` | el crit repetit d’un gàlag a la nit (`galag`) | `galag_3.mp3` | «Bushbaby galago calling at night, soft repeated croaking cries in a tree» |
| `sabana/oricterop.mp3` | un animal que ensuma i escarba la terra seca (`oricterop`) | `oricterop_1.mp3` | «Small animal sniffing and digging in dry earth, soft scraping claws and quiet grunts, close» |
| `sabana/capbussada.mp3` | un ocell petit que es capbussa a l’aigua (`capbussada`) | `capbussada_3.mp3` | «Small bird diving into water, quick small plop and a tiny splash» |
| `sabana/escarabat.mp3` | una boleta de terra que roda per terra seca (`escarabat`) | `escarabat_1.mp3` | «Dung beetle rolling a small ball of earth over dry ground, faint soft crunching, very close» |
| `sabana/esquitx.mp3` | una dutxa de gotes que cau sobre l’aigua i el fang (`esquitx`, l’elefant que es mulla) | `esquitx_0.mp3` | «Water sprayed from an elephant's trunk, a shower of droplets splashing onto water and mud» |
| `sabana/termitsAire.mp3` | un alè d’aire tebi que puja per un túnel d’argila (`termitsAire`, el termiter per dins) | `termits_aire_3.mp3` | «Soft breath of warm air rising through a narrow clay tunnel, gentle low whoosh» |
| `sabana/termits.mp3` | insectes petits que rasquen dins la terra (`termits`) | `termits_2.mp3` | «Tiny insects scratching and clicking inside dry earth, very quiet, close-mic» |
| `sabana/aire.mp3` | un buf d’aire que puja (`aire`, el travelling cap amunt i la pujada final) | `aire_amunt_3.mp3` | «Gentle whoosh of air rising upward, soft and airy, like flying up into the sky» |
| `sabana/salt.mp3` | un animal gran que salta al riu (`salt`, els nyus) | `salt_riu_0.mp3` | «Large animal jumping into a river, one big splash, water settling afterwards» |
| `sabana/fulles.mp3` | una branca que perd les fulles en estirar-la (`fulles`, la girafa que menja) | `fulles_3.mp3` | «Leafy branch pulled and stripped of leaves, soft rustle and a small twig snap» |
| `sabana/paperLlisca.mp3` | un full de paper fi que passa lliscant (`paperLlisca`, el travelling) | `paper_llisca_2.mp3` | «Large sheet of thin paper sliding quickly past the microphone, soft airy swish» |
| `sabana/paperDesplega.mp3` | un full de paper gruixut que es desplega (`paperDesplega`) | `paper_desplega_1.mp3` | «Sheet of thick paper being unfolded slowly, soft gentle crinkle, close-mic» |
| `sabana/paperAles.mp3` | paper que aleteja com unes ales (`paperAles`) | `paper_ales_1.mp3` | «Paper fluttering like bird wings, quick soft flaps, close» |

Crèdit: «Sons generats amb ElevenLabs».

<!-- pou:start -->
## El pou del temps (0.31)

Sons generats amb ElevenLabs (model de sons `eleven_text_to_sound_v2`) el 31 d’octubre de 2026 i preparats amb tools/make_oneshot.py i tools/make_ambience.py (inici, fosa, volum; alguns amb filtres). Als sons molt greus (sauròpodes, tiranosaure, passes de gegant, ala de membrana) s’hi han afegit harmònics perquè se sentin en altaveus petits. Les condicions d’ús d’ElevenLabs per a aquests sons no s’han verificat per a aquest projecte, i ningú no els ha escoltat: només s’han mesurat (espectre, volum, to).

| fitxer | què és | presa | «indicació» |
|---|---|---|---|
| `nature/pouEstepa.mp3` | vent sec sobre l’estepa glacial (ambient de les escenes 1 i 3; filtre passa-alts de 110 Hz) | `estepa_llarg_2.mp3` | «Calm winter steppe ambience: soft steady wind over open snowy grassland, dry grass rustling gently, very quiet, no gusts, no birds, seamless background» |
| `nature/pouPrada.mp3` | prada seca al capvespre, amb grills (escena 2; filtre passa-baixos de 5 kHz) | `amb_prada_1.mp3` | «Warm late-afternoon grassland ambience: a soft steady breeze in tall dry grass, gentle crickets and a faint insect buzz, calm and spacious, seamless background, no birds, no voices, no music» |
| `nature/pouPampa.mp3` | vent càlid entre herbes i fulles seques (escenes 4 i 18) | `amb_pampa_2.mp3` | «Open dry plain with scattered trees ambience: a light warm wind rustling leaves and dry grass, a few dry leaves skittering, faint distant insects, calm, seamless background, no birds, no voices, no mu» |
| `nature/pouAiguamoll.mp3` | aiguamoll amb insectes i aigua (escenes 5 i 15) | `aiguamoll_llarg_0.mp3` | «Warm humid swamp morning ambience: soft insect trills and katydid chirps, gentle water lapping at a pond edge, distant soft frog croaks, calm, no birds, seamless background» |
| `nature/pouRiu.mp3` | riu ample i tranquil (escenes 8 i 13) | `amb_riu_2.mp3` | «Calm wide river in the morning mist: soft flowing water, gentle lapping on a sandy bank, faint insect hum, peaceful and spacious, seamless background, no birds, no frogs, no music» |
| `nature/pouDesert.mp3` | vent suau sobre les dunes (escenes 9 i 10; tons fixos retallats) | `amb_desert_3.mp3` | «Quiet desert dunes ambience: a soft warm wind blowing over sand, faint hiss of drifting grains, very calm and spacious, seamless background, no birds, no insects, no music» |
| `nature/pouMar.mp3` | onades suaus en una platja (escena 12) | `amb_mar_1.mp3` | «Calm sea shore at sunset: slow gentle waves breaking softly on a sandy beach, soft foam, a light sea breeze, peaceful, seamless background, no seagulls, no birds, no voices, no music» |
| `nature/pouBosc.mp3` | bosc de coníferes després de la pluja (escenes 7, 11 i 14) | `amb_bosc_pluja_3.mp3` | «Conifer forest just after rain: water dripping from needles and leaves, soft wind in the trees, a distant small stream, misty and calm, seamless background, no birds, no thunder, no music» |
| `nature/pouLlacuna.mp3` | llacuna càlida sobre roca calcària (escena 16) | `amb_llacuna_1.mp3` | «Warm shallow lagoon ambience: tiny waves lapping on pale limestone, a soft warm breeze in low shrubs, gentle cricket trills, calm, seamless background, no birds, no frogs, no music» |
| `nature/pouPlana.mp3` | vent càlid entre coníferes i falgueres (escenes 6, 17 i 20; cigales retallades amb un passa-baixos fort) | `amb_plana_seca_2.mp3` | «Vast dry warm plain with scattered conifers: a slow warm wind, stiff leaves and ferns rustling, soft cicada-like insect hum in the distance, calm and spacious, seamless background, no birds, no music» |
| `nature/pouSotaAigua.mp3` | el mar per sota de la superfície (escena 19) | `amb_sota_aigua_1.mp3` | «Peaceful underwater ambience just below the surface of a calm sea: soft muffled water movement, gentle slow swell, a few distant bubbles, seamless background, no whales, no clicks, no music» |
| `nature/pouJardi.mp3` | jardí de tardor al matí (el final) | `amb_jardi_2.mp3` | «Quiet autumn garden in the morning: a soft breeze in the leaves of a tree, a few dry leaves falling and skittering, very calm and close, seamless background, no birds, no traffic, no voices, no music» |
| `pou/mamut.mp3` | la crida suau d’una mamut, lluny (`pouRec` `mamut`) | `mamut_barrit_2.mp3` | «A gentle, soft elephant trumpet heard from a distance on a quiet snowy plain, short and warm, not loud, no echo, single call, about 1.5 seconds» |
| `pou/mamutCria.mp3` | la resposta aguda d’una cria de mamut (`pouRec` `mamutCria`) | `cria_barrit_1.mp3` | «A baby elephant's small, high, playful squeaky trumpet, soft and cute, close but quiet, single short call, about 1 second» |
| `pou/neuTrompa.mp3` | una trompa que s’enfonsa a la neu tova (`pouRec` `neuTrompa`) | `neu_trompa_3.mp3` | «Soft puffs of powdery snow: an elephant trunk gently pushing into fresh snow three times, light crunch and whoosh, quiet, close» |
| `pou/llana.mp3` | un animal de pèl llarg que es sacseja la neu (`pouRec` `llana`) | `llana_sacseja_0.mp3` | «A large shaggy animal shaking its thick long fur coat, soft rustle of hair, then light snow falling off and pattering softly on snow, gentle, about 2 seconds» |
| `pou/rex.mp3` | un retruny greu amb la boca tancada (tiranosaure; harmònics afegits perquè se senti en altaveus petits) (`pouRec` `rex`) | `rex_retruny_0.mp3` | «A deep, soft, closed-mouth booming hoot like an emu or a bittern, very low resonant thrum from a large bird's inflated throat, gentle, not a roar, single boom about 1 second» |
| `pou/tollOnes.mp3` | onades petites en un toll (`pouRec` `tollOnes`) | `toll_ones_3.mp3` | «Gentle ripples on a still pond: soft water lapping and a small slow wave, quiet and close, about 1.5 seconds» |
| `pou/criesPiulen.mp3` | dues cries que piulen (`pouRec` `criesPiulen`) | `cries_piulen_1.mp3` | «Two small fluffy chicks peeping softly back and forth, gentle high chirps, close, quiet, about 2 seconds» |
| `pou/roca.mp3` | sorra i pedretes que llisquen per la roca (els travellings) (`pouRec` `roca`) | `roca_sorra_2.mp3` | «Soft trickle of fine sand and small pebbles sliding down through rock, gentle earthy rustle, quiet, about 2 seconds, no impacts» |
| `pou/smilBadall.mp3` | el badall d’un gran felí (`pouRec` `smilBadall`) | `smil_badall_1.mp3` | «A big cat's slow, sleepy yawn: a long soft airy exhale that ends in a tiny contented squeak, close and quiet, natural recording, no growl, no roar, no music» |
| `pou/smilCries.mp3` | cadells de felí que juguen (`pouRec` `smilCries`) | `smil_cries_1.mp3` | «Two lion cubs playing: small soft high mews and one gentle chuff, close, quiet, natural recording, no growl, no music» |
| `pou/cervol.mp3` | la crida greu d’un cérvol gran (`pouRec` `cervol`) | `cervol_bram_2.mp3` | «A large deer's gentle low moaning call heard across a quiet snowy plain, soft and short, calm, not aggressive, single call, natural recording, no music» |
| `pou/rino.mp3` | l’esbufec d’un rinoceront (`pouRec` `rino`) | `rino_esbufec_1.mp3` | «A large rhinoceros gently snorting and breathing through its nose as it pushes its horn into soft snow, two soft snorts, close, calm, natural recording, no music» |
| `pou/megateri.mp3` | el sospir d’un animal gran que s’estira (`pouRec` `megateri`) | `megateri_sospir_1.mp3` | «A huge gentle animal's slow deep contented sigh and a soft low grunt of effort as it stretches up, warm and calm, close, natural recording, no growl, no music» |
| `pou/trike.mp3` | un retruny greu de gola, amb la boca tancada (`pouRec` `trike`) | `trike_retruny_0.mp3` | «A soft, deep, closed-mouth rumbling hoot from a big bird's inflated throat, like an emu or cassowary booming gently, warm and short, not a roar, single call, natural recording, no music» |
| `pou/trikeCria.mp3` | la resposta curta d’una cria (`pouRec` `trikeCria`) | `trike_cria_0.mp3` | «A young emu chick's small soft closed-mouth hoot, higher and cute, a short gentle answer call, close, quiet, natural recording, no music» |
| `pou/anquilo.mp3` | dos arrulls greus, com de colom gran (`pouRec` `anquilo`) | `anquilo_arrull_0.mp3` | «A soft dove-like cooing, two gentle low round coos from a big contented bird, close, quiet, natural recording, no other birds, no music» |
| `pou/sauropode.mp3` | un retruny molt greu amb la boca tancada (sauròpodes; harmònics afegits) (`pouRec` `sauropode`) | `sauropode_retruny_2.mp3` | «A very deep, slow, soft closed-mouth boom from an enormous animal, like a giant bittern or cassowary rumble heard over a misty river, gentle and warm, not a roar, single call, natural recording, no mu» |
| `pou/sauropode2.mp3` | un altre retruny molt greu (harmònics afegits) (`pouRec` `sauropode2`) | `sauropode_retruny_1.mp3` | «A very deep, slow, soft closed-mouth boom from an enormous animal, like a giant bittern or cassowary rumble heard over a misty river, gentle and warm, not a roar, single call, natural recording, no mu» |
| `pou/citipati.mp3` | els cloqueigs suaus d’una mare que cova (`pouRec` `citipati`) | `citipati_mare_0.mp3` | «A mother hen's soft low motherly clucks as she settles over her chicks, gentle and warm, close, quiet, natural recording, no music» |
| `pou/pollets.mp3` | pollets acabats de néixer que piulen (`pouRec` `pollets`) | `pollets_piulen_0.mp3` | «Newly hatched chicks peeping softly, tiny high sweet peeps from two or three chicks, close, very quiet, natural recording, no music» |
| `pou/becClic.mp3` | un bec que fa dos clics (`pouRec` `becClic`) | `bec_clic_0.mp3` | «A bird softly clacking its beak twice, small dry wooden clicks, close, quiet, natural recording, no song, no music» |
| `pou/pitroig.mp3` | el cant d’un pit-roig (només al final) (`pouRec` `pitroig`) | `pitroig_cant_0.mp3` | «A single European robin singing its clear, sweet, wistful warbling song from a branch in a quiet autumn garden, close, natural field recording, no other birds, no music» |
| `pou/banySorra.mp3` | un ocell que es banya a la sorra (`pouRec` `banySorra`) | `bany_sorra_1.mp3` | «A bird dust-bathing in dry sand: soft scratching, wings fluttering against the ground and fine sand spraying and pattering down, gentle, close, natural recording, no call, no music» |
| `pou/cascadaNeu.mp3` | neu en pols que cau d’unes branques (`pouRec` `cascadaNeu`) | `cascada_neu_3.mp3` | «A soft cascade of powdery snow sliding off branches and falling onto deep snow, gentle whoosh and light patter, calm, natural recording, no music» |
| `pou/escombra.mp3` | falgueres fregades lentament per un cap gran (`pouRec` `escombra`) | `escombra_falgueres_1.mp3` | «Low leafy ferns brushed slowly by a large animal's head, one long soft swish through plants and leaves settling, gentle, natural recording, no music» |
| `pou/passesAigua.mp3` | un animal gran que camina per un riu poc fondo (`pouRec` `passesAigua`) | `passes_aigua_2.mp3` | «A large animal wading slowly through a shallow river, water swishing and gurgling around its legs, two slow steps, gentle, natural recording, no music» |
| `pou/passesGegant.mp3` | passes molt pesades i toves (harmònics afegits) (`pouRec` `passesGegant`) | `passes_gegant_0.mp3` | «Two slow, very heavy, soft footfalls of a giant animal on damp earth, deep muffled thuds with a little dust and gravel settling, no crack, no boom, calm, natural recording, no music» |
| `pou/passesLleugeres.mp3` | passes ràpides i lleugeres sobre fulles (`pouRec` `passesLleugeres`) | `passes_lleugeres_1.mp3` | «Quick light footsteps of a small two-legged animal running across damp leaves and ferns, soft pattering and rustle, passing by, natural recording, no music» |
| `pou/passesNeu.mp3` | passes pesades a la neu (`pouRec` `passesNeu`) | `passes_neu_1.mp3` | «Two slow heavy footsteps of a big animal in fresh deep snow, soft muffled crunch, close, quiet, natural recording, no music» |
| `pou/plomes.mp3` | un ocell gran que obre les ales i s’estarrufa (`pouRec` `plomes`) | `plomes_obre_0.mp3` | «A large bird spreading its wings slowly and fluffing its feathers, soft feathery rustle and a gentle whoosh, close, natural recording, no call, no music» |
| `pou/sacseja.mp3` | un animal mullat que s’espolsa l’aigua (`pouRec` `sacseja`) | `sacseja_aigua_3.mp3` | «A big wet shaggy animal shaking water off its coat like a dog, a quick whirr of wet fur and a spray of droplets pattering onto leaves, natural recording, no music» |
| `pou/bombolles.mp3` | bombolles sota l’aigua (`pouRec` `bombolles`) | `bombolles_0.mp3` | «Soft underwater bubbles rising in a calm sea, a few gentle bloops, muffled, close, natural recording, no music» |
| `pou/branca.mp3` | una branca amb fulles estirada a poc a poc (`pouRec` `branca`) | `branca_2.mp3` | «A leafy tree branch slowly pulled down with a soft creak of wood and rustle of leaves, then released with a gentle swish and leaves shaking, no snap, natural recording, no music» |
| `pou/capbussa.mp3` | un animal llis que torna a l’aigua (`pouRec` `capbussa`) | `capbussa_3.mp3` | «A large smooth animal sliding back into calm water, a soft deep splash and gurgle, water settling, gentle, not loud, natural recording, no music» |
| `pou/cuaEscombra.mp3` | una cua pesada que frega plantes (`pouRec` `cuaEscombra`) | `cua_escombra_1.mp3` | «A heavy tail swinging slowly through the air and brushing through stiff leafy plants, soft whoosh and leaf rustle, gentle, natural recording, no impact, no music» |
| `pou/falgueres.mp3` | falgueres que es mouen quan en surt un animal petit (`pouRec` `falgueres`) | `falgueres_frec_0.mp3` | «Ferns rustling softly as a small animal pokes its head out between the fronds, a short leafy rustle, close, quiet, natural recording, no music» |
| `pou/gotes.mp3` | gotes que cauen en un bassal (`pouRec` `gotes`) | `gotes_2.mp3` | «Sparse water drops falling from leaves into a still puddle after rain, a few clear gentle plinks, close, quiet, natural recording, no music» |
| `pou/herba.mp3` | dos animals petits que rodolen per l’herba (`pouRec` `herba`) | `herba_rodola_1.mp3` | «Two small animals tumbling playfully in tall dry grass, soft rustling and light thumps on the ground, close, natural recording, no voices, no music» |
| `pou/mastega.mp3` | un herbívor gran que mastega fulles (`pouRec` `mastega`) | `mastega_1.mp3` | «A large herbivore slowly chewing fresh leaves, soft crunchy munching, close, quiet, natural recording, no music» |
| `pou/onada.mp3` | una onada que puja per la sorra i torna (`pouRec` `onada`) | `onada_1.mp3` | «A single gentle wave washing up a sandy beach and pulling back with soft foam fizz, calm sea, close, natural recording, no wind, no birds, no music» |
| `pou/ou.mp3` | ous que s’esquerden (`pouRec` `ou`) | `ou_esquerda_0.mp3` | «Small eggs cracking open as chicks hatch: tiny gentle cracks and taps of shell, a few small pieces falling on sand, close, quiet, natural recording, no music» |
| `pou/saltRoca.mp3` | un animal petit que salta a una roca (`pouRec` `saltRoca`) | `salt_roca_3.mp3` | «A small animal hopping up onto a rock: a light scrape of claws on stone and a few tiny pebbles trickling down, close, quiet, natural recording, no music» |
| `pou/tronc.mp3` | un tronc buit picat amb una maça tova (`pouPerc` `tronc`) | `tronc_bong_0.mp3` | «A heavy round club gently knocking a big hollow fallen log once: a warm, round, resonant wooden bong like a log drum, soft attack, letting it ring, natural, no music» |
| `pou/marc.mp3` | un tambor de marc picat amb el palmell (`pouPerc` `marc`) | `tambor_marc_1.mp3` | «A single soft stroke of the palm on a large frame drum, deep warm round thump with a short skin resonance, dry studio recording, one hit only, no music» |
| `pou/pluja.mp3` | un bastó de pluja (`pouPerc` `pluja`) | `pal_pluja_0.mp3` | «A cactus rain stick turned over slowly once: seeds cascading inside with a smooth gentle pattering that fades out, dry studio recording, no music» |
| `pou/pedra.mp3` | dues pedres de riu picades (`pouPerc` `pedra`) | `pedres_0.mp3` | «Two smooth river stones knocked together gently once, a clear bright click with a short stony ring, dry studio recording, one hit only, no music» |
| `pou/pedra2.mp3` | dues pedres de riu picades (una altra presa) (`pouPerc` `pedra2`) | `pedres_1.mp3` | «Two smooth river stones knocked together gently once, a clear bright click with a short stony ring, dry studio recording, one hit only, no music» |
| `pou/gegantRespira.mp3` | la respiració lenta i profunda d’un animal gegant (`pouRec` `gegantRespira`) | `gegant_respira_0.mp3` | «A huge gentle animal breathing slowly through its nostrils: one long deep soft inhale, then a long airy exhale like a calm sigh, close and quiet, natural recording, no voice, no growl, no music» |
| `pou/cresta.mp3` | la crida buida i suau d’un dinosaure de cresta (es toca a les altures de la música) (`pouRec` `cresta`) | `cresta_3.mp3` | «One deep, soft, hollow hooting note like a large conch shell blown gently, warm and round, swelling and fading, about one and a half seconds, natural acoustic sound, no echo, no music» |
| `pou/ictioRespira.mp3` | un animal marí que treu el cap i respira (`pouRec` `ictioRespira`) | `ictio_respira_2.mp3` | «A dolphin-sized sea animal breaking the calm surface and taking one quick soft breath: a gentle short puff of air with a little spray of water, close, calm, no whistles, no clicks, no squeaks, no musi» |
| `pou/saltIctio.mp3` | un animal marí que salta i torna a l’aigua (`pouRec` `saltIctio`) | `salt_ictio_0.mp3` | «A smooth sea animal leaping out of calm water and diving back in: a soft rising splash, a few drips falling, then a clean gentle plunge, natural recording, no animal voice, no whistles, no clicks, no » |
| `pou/closca.mp3` | una closca gran que frega les herbes seques (`pouRec` `closca`) | `closca_0.mp3` | «A big heavy tortoise walking slowly over dry grass: its domed shell scrapes softly against the stems, a gentle hollow scraping and two soft footfalls, close and quiet, no music» |
| `pou/collSurt.mp3` | un coll llarg que surt de l’aigua i regalima (`pouRec` `collSurt`) | `coll_surt_2.mp3` | «A long smooth neck rising slowly out of calm sea water: water streaming and dripping off it, soft gurgle, gentle and calm, close, natural recording, no voice, no music» |
| `pou/alesPetites.mp3` | un animal petit que salta d’una branca obrint les ales (`pouRec` `alesPetites`) | `ales_petites_2.mp3` | «A crow-sized bird jumping off a branch and opening its wings: three soft feathery wing flaps and a light twig creak, close, natural recording, no bird call, no music» |
| `pou/aterraBranca.mp3` | un animal petit que es posa en una branca (`pouRec` `aterraBranca`) | `aterra_branca_1.mp3` | «A crow-sized bird landing on a thin branch: a short soft flutter of wings, the twig creaks and a few small leaves rustle, close, natural recording, no bird call, no music» |
| `pou/banyaNeu.mp3` | un cap gran que aparta la neu a banda i banda (`pouRec` `banyaNeu`) | `banya_neu_0.mp3` | «A large animal sweeping its head side to side through deep powdery snow to uncover grass: soft swishing and crunching snow, slow and calm, close, natural recording, no voice, no music» |
| `pou/sacsejaSorra.mp3` | un ocell gran que s’espolsa la sorra de les plomes (`pouRec` `sacsejaSorra`) | `sacseja_sorra_1.mp3` | «A large bird shaking its dry feathers after a dust bath: a quick soft whirr of feathers and fine sand pattering down, close, natural recording, no bird call, no music» |
| `pou/pasAigua.mp3` | una passa molt pesada dins l’aigua (harmònics afegits) (`pouRec` `pasAigua`) | `pas_aigua_3.mp3` | «One very heavy, slow footstep of a giant animal coming down into shallow river water: a deep soft muffled thud with a slosh, then a few drips, close, natural recording, no voice, no music» |
| `pou/beure.mp3` | un animal gran que beu en un riu (`pouRec` `beure`) | `beure_1.mp3` | «A large animal drinking from a calm river: its mouth touches the water with a soft plop and lapping, then two or three slow deep gulps, close and quiet, natural recording, no music» |
| `pou/peixos.mp3` | peixets que fugen a flor d’aigua (`pouRec` `peixos`) | `peixos_3.mp3` | «Two or three small fish darting away just under the surface of shallow calm water: quick tiny splashes and flicks, close, natural recording, no music» |
| `pou/alaCop.mp3` | un sol cop d’una ala gran de membrana (harmònics afegits) (`pouRec` `alaCop`) | `ala_membrana_2.mp3` | «Two slow deep wing beats of a huge leathery wing, soft whoomp of a skin membrane catching the air like a sail, then gliding wind, natural, no call, no music» |
| `udu/greu.mp3` | udu greu, mi2 (`uduRec`) | `udu_greu_1.mp3` | «A single deep resonant stroke on an udu clay pot drum, warm round bassy tone with a gentle downward bend, dry studio recording, one hit only, no reverb, no music» |
| `udu/mig.mp3` | udu, si2 (`uduRec`) | `udu_agut_3.mp3` | «A single light finger tap on the side of an udu clay pot drum, short warm clay tone, dry studio recording, one hit only, no reverb, no music» |
| `udu/agut.mp3` | udu agut, mi3 (`uduRec`) | `udu_agut_2.mp3` | «A single light finger tap on the side of an udu clay pot drum, short warm clay tone, dry studio recording, one hit only, no reverb, no music» |
| `escletxa/sol.mp3` | tambor d’escletxa, sol♯3 (`escletxaRec`) | `tambor_escletxa_0.mp3` | «A single note on a wooden slit drum (log drum) struck with a soft rubber mallet, warm hollow woody tone that rings briefly, dry studio recording, one hit only, no music» |
| `escletxa/si.mp3` | tambor d’escletxa, si3 (`escletxaRec`) | `tambor_escletxa_1.mp3` | «A single note on a wooden slit drum (log drum) struck with a soft rubber mallet, warm hollow woody tone that rings briefly, dry studio recording, one hit only, no music» |
| `vib/v67.mp3` | vibràfon sense motor, sol4 (`vibRec`) | `vibrafon_1.mp3` | «A single soft vibraphone note struck with a yarn mallet, motor off, pure bell-like metallic tone left to ring and fade naturally, dry studio recording, one note only, no music» |
| `vib/v71.mp3` | vibràfon sense motor, si4 (`vibRec`) | `vibrafon_0.mp3` | «A single soft vibraphone note struck with a yarn mallet, motor off, pure bell-like metallic tone left to ring and fade naturally, dry studio recording, one note only, no music» |

Crèdit: «Sons generats amb ElevenLabs».
<!-- pou:end -->

## Gegants del blau (0.36)

Sons generats amb ElevenLabs (model de sons `eleven_text_to_sound_v2`) l’1 de novembre de 2026, amb el permís d’en Marc per gastar-hi crèdits, i preparats amb tools/make_oneshot.py (inici, fosa, volum, passa-alts). Les preses s’han triat mesurant-les (espectrograma, to i nivell), no escoltant-les. Als tres sons més greus (iubarta, balena blava, rorqual) s’hi han afegit harmònics perquè se sentin en altaveus petits. Són sons generats, no enregistraments reals d’aquests animals. Les condicions d’ús d’ElevenLabs per a aquests sons no s’han verificat per a aquest projecte. La resta de sons de l’activitat són dels bancs anteriors (`pouRec`, `selvaRec`, `sabanaRec`, `natureRec`).

| fitxer | què és | presa | «indicació» |
|---|---|---|---|
| `gegants/iubarta.mp3` | el cant d’una iubarta (escenes 5 i 11; harmònics afegits) (`ggRec` `iubarta`) | `iubarta_2.mp3` | «Humpback whale song underwater, a long low moan rising into a higher wail, hydrophone recording, clear and distant, no music» |
| `gegants/beluga.mp3` | les crides d’una beluga (escena 2) (`ggRec` `beluga`) | `beluga_0.mp3` | «Beluga whale calls underwater, bright chirps, squeaks and whistles, hydrophone recording in calm Arctic water, no music» |
| `gegants/narval.mp3` | clics i xiulets de narval (escena 1) (`ggRec` `narval`) | `narval_2.mp3` | «Narwhal underwater, a fast train of clicks and a few high whistles, hydrophone recording in quiet cold water, no music» |
| `gegants/groenlandia.mp3` | el cant d’una balena de Groenlàndia (escena 3) (`ggRec` `groenlandia`) | `grenlandia_3.mp3` | «Bowhead whale song underwater, low moaning calls rising and falling, hydrophone recording under Arctic ice, no music» |
| `gegants/catxalot.mp3` | els clics d’un catxalot (escena 7) (`ggRec` `catxalot`) | `catxalot_1.mp3` | «Sperm whale clicks underwater, slow regular loud clicks echoing in deep water, hydrophone recording, no music» |
| `gegants/dofins.mp3` | xiulets i clics de dofins (escenes 10 i 14) (`ggRec` `dofins`) | `dofins_2.mp3` | «Bottlenose dolphins underwater, several bright whistles and quick clicks close to the hydrophone, no music» |
| `gegants/franca.mp3` | la crida ascendent d’una balena franca (escena 18) (`ggRec` `franca`) | `franca_3.mp3` | «Right whale upcall underwater, a low smooth rising whoop repeated twice, hydrophone recording, no music» |
| `gegants/orques.mp3` | les crides d’una família d’orques (escena 19) (`ggRec` `orques`) | `orques_0.mp3` | «Killer whale calls underwater, pulsed squealing calls and whistles of a family group, hydrophone recording, no music» |
| `gegants/blava.mp3` | la crida greu d’una balena blava (escena 20 i el final; harmònics afegits) (`ggRec` `blava`) | `blava_0.mp3` | «Blue whale call underwater, a very deep long low moan followed by a lower groan, hydrophone recording, no music» |
| `gegants/rorqual.mp3` | el pols greu d’un rorqual comú (escena 8; harmònics afegits) (`ggRec` `rorqual`) | `rorqual_1.mp3` | «Fin whale call underwater, a deep short downward pulse repeated slowly, hydrophone recording, no music» |
| `gegants/bufada.mp3` | l’esbufec d’una balena gran a la superfície (escenes 3, 8, 19 i el final) (`ggRec` `bufada`) | `bufaGran_3.mp3` | «A large whale exhaling at the sea surface, one powerful deep whoosh of air and spray, close, natural recording, no music» |
| `gegants/dugongRespira.mp3` | la respiració d’un dugong a la superfície (escena 17) (`ggRec` `dugongRespira`) | `dugongRespira_1.mp3` | «A dugong surfacing to breathe, one soft short puff of air through the nostrils at the calm water surface, close, no music» |

# Crèdits dels sons de Pinta el món (EN25, 0.38)

Els sons d’aquesta llista s’han generat amb ElevenLabs Sound Effects (model `eleven_text_to_sound_v2`) el 2 de novembre de 2026, amb el permís d’en Marc per fer servir ElevenLabs en aquesta activitat, al flux `11uugaitQ12Ui3XOlm4z`, quatre variacions per so (37 nodes, 148 preses, totes descarregades). Cada so d’una tirada s’ha preparat amb `tools/make_oneshot.py` (−18 LUFS momentani; els pinzells, el pot i el full, de −20 a −22) i cada ambient amb `tools/make_ambience.py` (−32 LUFS); el handpan demanat (quatre notes) tenia una afinació inconsistent entre preses i s’ha descartat: el llac sona amb l’arpa. La indicació donada a ElevenLabs es reprodueix pel seu inici (el text complet és al node del flux).

| Fitxer (`pinta/`) | So | Fitxer original | Indicació donada a ElevenLabs (inici) |
|---|---|---|---|
| `pinta/campana.mp3` | campana petita d’església de poble, un sol toc (`campana`) | `campana_1.mp3` | «Small village church bell…» |
| `pinta/esquellots.mp3` | esquellots de cabres i vaques que dringuen (`esquellots`) | `esquellots_1.mp3` | «A few cowbells clank…» |
| `pinta/gavines.mp3` | gavines que criden, lluny (`gavines`) | `gavines_3.mp3` | «Seagulls calling…» |
| `pinta/gavines2.mp3` | una gavina que crida, a prop (`gavines2`) | `gavines_1.mp3` | «Seagulls calling…» |
| `pinta/marmota.mp3` | xiulet d’alarma d’una marmota (`marmota`) | `marmota_1.mp3` | «Marmot alarm whistle…» |
| `pinta/cabra.mp3` | una cabra que bela un cop (`cabra`) | `cabra_2.mp3` | «Goat bleating once…» |
| `pinta/foca.mp3` | una foca que lladra fluix (`foca`) | `foca_1.mp3` | «Seal barking softly…» |
| `pinta/peix.mp3` | un peix que salta i cau a l’aigua (`peix`) | `peix_2.mp3` | «A fish jumping out of the water…» |
| `pinta/picot.mp3` | un picot que pica un tronc (`picot`) | `picot_4.mp3` | «Woodpecker drumming…» |
| `pinta/os.mp3` | un os que gruny fluix (`os`) | `os_1.mp3` | «Bear grunting softly…» |
| `pinta/coloms.mp3` | coloms que parrupen i aletegen (`coloms`) | `coloms_1.mp3` | «Pigeons cooing and flapping…» |
| `pinta/senglar.mp3` | un senglar que esbufega (`senglar`) | `senglar_1.mp3` | «Wild boar snorting…» |
| `pinta/gat.mp3` | un gat que miola un cop (`gat`) | `gat_3.mp3` | «Cat meowing once…» |
| `pinta/sirena.mp3` | sirena d’un vaixell gran, un toc (`sirena`) | `sirena_2.mp3` | «Large ship horn, one…» |
| `pinta/tramvia.mp3` | campaneta d’un tramvia (`tramvia`) | `tramvia_2.mp3` | «Tram bell ringing…» |
| `pinta/moli.mp3` | aspes d’un molí de vent de fusta (`moli`) | `moli_2.mp3` | «Old wooden windmill…» |
| `pinta/gallina.mp3` | una gallina que escataina (`gallina`) | `gallina_3.mp3` | «Hen clucking a few times…» |
| `pinta/ermita.mp3` | campaneta d’una ermita (`ermita`) | `ermita_1.mp3` | «Small chapel bell…» |
| `pinta/vaca.mp3` | una vaca que mugeix (`vaca`) | `vaca_2.mp3` | «Cow mooing once…» |
| `pinta/anec.mp3` | un ànec que fa quac (`anec`) | `anec_1.mp3` | «Duck quacking three times…» |
| `pinta/corb.mp3` | un corb que grasna (`corb`) | `corb_1.mp3` | «Crow cawing twice…» |
| `pinta/pinzell1.mp3` | pinzell moll d’aquarel·la sobre paper (`pinzell1`) | `pinzell1_4.mp3` | «A wet watercolour brush…» |
| `pinta/pinzell2.mp3` | pinzell moll que llisca (`pinzell2`) | `pinzell2_1.mp3` | «Wet paintbrush swish…» |
| `pinta/pinzell3.mp3` | pinzell ample i tou arrossegat (`pinzell3`) | `pinzell3_1.mp3` | «Broad soft brush dragged…» |
| `pinta/gota.mp3` | una gota d’aigua que cau (`gota`) | `gota_1.mp3` | «A single water drop…» |
| `pinta/pot.mp3` | pinzell remenat dins el pot d’aigua (`pot`) | `pot_1.mp3` | «Paintbrush swirled in a water jar…» |
| `pinta/full.mp3` | un full de paper gruixut que es gira (`full`) | `full_1.mp3` | «A single sheet of thick paper…» |

Cinc notes de guitarra clàssica de cordes de niló (`guitarRec`, afinades i tocades amb el sampler; la nota demanada era una o dues octaves més greu, i les preses s’han reafinat a 440 Hz per remostreig, amb la desviació mesurada):

| Fitxer (`pinta/`) | Nota (MIDI) | Fitxer original | Desviació corregida |
|---|---|---|---|
| `pinta/guitA3.mp3` | la 3 (57) | `guitA2_4.mp3` | +17 ¢ |
| `pinta/guitD4.mp3` | re 4 (62) | `guitD3_2.mp3` | +11 ¢ |
| `pinta/guitE4.mp3` | mi 4 (64) | `guitE2_1.mp3` | +11 ¢ |
| `pinta/guitG4.mp3` | sol 4 (67) | `guitG3_4.mp3` | +7 ¢ |
| `pinta/guitA4.mp3` | la 4 (69) | `guitA2_1.mp3` | +10 ¢ |

Quatre ambients en bucle, a la carpeta `nature/` (banc `natureRec`, com els de Natura):

| Fitxer | So | Fitxer original | Indicació donada a ElevenLabs (inici) |
|---|---|---|---|
| `nature/ptCigales.mp3` | cigales d’una tarda d’estiu (`ptCigales`, bucle de 9,3 s fet de la presa encadenada amb ella mateixa) | `cigales_2.mp3` | «Cicadas chirping in…» |
| `nature/ptTorrent.mp3` | torrent de muntanya (`ptTorrent`, bucle d’11,5 s, tres cops la presa encadenada) | `torrent_2.mp3` | «Mountain stream rushing…» |
| `nature/ptMoli.mp3` | molí de vent que gira (`ptMoli`, bucle d’11,9 s) | `moli_1.mp3` | «Old wooden windmill…» |
| `nature/ptColoms.mp3` | coloms d’un poble (`ptColoms`, bucle de 12,5 s, la presa encadenada amb ella mateixa) | `coloms_3.mp3` | «Pigeons cooing and flapping…» |

Crèdit: «Sons generats amb ElevenLabs».

# Crèdits dels sons d’Estiu a la masia (EN26, 0.39)

Els efectes d’aquesta llista s’han generat amb ElevenLabs Sound Effects (model `eleven_text_to_sound_v2`, influència de la indicació 0,3) i les veus amb ElevenLabs Text to Speech (model `eleven_v3`, veus de la biblioteca pública) el 3 de novembre de 2026, amb el permís d’en Marc per fer servir ElevenLabs en aquesta activitat, al flux `7yhgOGoARG3njMTQXFwa`: 57 nodes d’efectes amb quatre preses cadascun (228 preses) i 14 nodes de veu amb dues preses (28), totes descarregades i mesurades (`/tmp/w/masia/sons/mesures.txt`). La presa de cada so s’ha triat a cegues per les mesures (durada, atac, soroll de fons; `tria.py`) i s’ha preparat amb `tools/make_oneshot.py` (−18 LUFS momentani; la paella, el foc, la mosca, el tro, la pluja, les abelles, el mastegar, el ronc i les bombolles, de −20 a −24, amb cua esvaïda).

| Fitxer (`masia/`) | So | Fitxer original | Indicació donada a ElevenLabs |
|---|---|---|---|
| `masia/paella.mp3` | la truita que fregeix a la paella (E1, la cuina) (`paella`) | `paella_1.mp3` | «Omelette sizzling in a hot frying pan with olive oil, close-mic, steady crackle» |
| `masia/sacsejada.mp3` | la paella sacsejada, dos cops (E1) (`sacsejada`) | `sacsejada_3.mp3` | «Frying pan shaken briskly on a stove, metallic rattle, two shakes» |
| `masia/whoosh.mp3` | un xiulet d’aire curt quan alguna cosa surt disparada (E1, E2, E3) (`whoosh`) | `whoosh_3.mp3` | «Quick soft whoosh of something flung upward, short» |
| `masia/splat.mp3` | la truita que s’enganxa a la biga (E1) (`splat`) | `splat_1.mp3` | «Wet soft splat of food hitting a wooden beam, short» |
| `masia/desenganxar.mp3` | la truita que es desenganxa a poc a poc de la biga (E1) (`desenganxar`) | `desenganxar_3.mp3` | «Sticky wet peel, something slowly unsticking from wood, short» |
| `masia/picapeus.mp3` | tres cops de peu impacients a terra (E1) (`picapeus`) | `picapeus_2.mp3` | «Three impatient foot taps on a stone kitchen floor, leather shoes» |
| `masia/plat.mp3` | el plat que l’àvia despenja del ganxo (E1) (`plat`) | `plat_3.mp3` | «A ceramic plate lifted off a wall hook, light clink» |
| `masia/flop.mp3` | la truita que cau al plat (E1) (`flop`) | `flop_4.mp3` | «Soft floppy food landing on a ceramic plate, short wet thud» |
| `masia/gatxiscle.mp3` | el xiscle del gat quan la truita li cau a sobre (E1, variant) (`gatxiscle`) | `gatxiscle_4.mp3` | «A real cat startled, short surprised yowl» |
| `masia/focllar.mp3` | el foc de la llar que crepita (E1) (`focllar`) | `focllar_2.mp3` | «Hearth fire crackling softly with occasional pops, close-mic» |
| `masia/mosca.mp3` | una mosca que passa (E1) (`mosca`) | `mosca_2.mp3` | «A fly buzzing past close to the ear, short» |
| `masia/suro.mp3` | el suro que cau a l’aigua (E2, la bassa) (`suro`) | `suro_1.mp3` | «Fishing bobber dropping into still pond water, small plop» |
| `masia/fil.mp3` | el fil que es tensa d’un cop (E2) (`fil`) | `fil_1.mp3` | «Fishing line snapping taut with a quick twang» |
| `masia/canya.mp3` | la canya que grinyola (E2) (`canya`) | `canya_2.mp3` | «Bamboo fishing rod creaking as it bends under strain» |
| `masia/tamboret.mp3` | el tamboret que grinyola a terra (E2) (`tamboret`) | `tamboret_3.mp3` | «Wooden stool scraping over packed earth, short» |
| `masia/esquitxpetit.mp3` | esquitxos petits del peix (E2) (`esquitxpetit`) | `esquitxpetit_2.mp3` | «Small splashes in a pond, a fish thrashing at the surface» |
| `masia/esquitxgran.mp3` | l’esquitx gran de la carpa que salta (E2) (`esquitxgran`) | `esquitxgran_4.mp3` | «Big splash of a large fish leaping out of a pond» |
| `masia/carpacua.mp3` | la cua de la carpa que pica dos cops (E2) (`carpacua`) | `carpacua_2.mp3` | «Wet fish tail slapping twice, close» |
| `masia/bombolles.mp3` | bombolles a la superfície (E2) (`bombolles`) | `bombolles_1.mp3` | «Bubbles rising and popping at a pond surface» |
| `masia/degoteig.mp3` | l’aigua que degota del barret (E2) (`degoteig`) | `degoteig_3.mp3` | «Water dripping from a wet hat brim onto grass, several drops» |
| `masia/granota.mp3` | una granota de la bassa (E2) (`granota`) | `granota_3.mp3` | «A single pond frog croak, close» |
| `masia/bota.mp3` | l’aigua que surt de la bota (E2, variant) (`bota`) | `bota_4.mp3` | «Water pouring out of an old rubber boot onto grass, splashy» |
| `masia/terracruix.mp3` | la terra seca que cruix (E3, l’hort) (`terracruix`) | `terracruix_3.mp3` | «Dry garden soil crunching and crumbling as roots are pulled» |
| `masia/pop.mp3` | la pastanaga petita que surt d’un cop (E3) (`pop`) | `pop_3.mp3` | «A hollow cork-like pop of a root pulled out of soil, short» |
| `masia/caigudafulles.mp3` | la caiguda sobre les fulles de l’hort (E3) (`caigudafulles`) | `caigudafulles_1.mp3` | «Soft fall onto leafy garden plants, rustling thump» |
| `masia/terraobre.mp3` | la terra que s’obre (E3) (`terraobre`) | `terraobre_2.mp3` | «Ground cracking and heaving open, soil rumbling, short» |
| `masia/boing.mp3` | la pastanaga gegant que surt de la terra (E3) (`boing`) | `boing_3.mp3` | «Deep rubbery springy boing, like a giant root springing up from the ground» |
| `masia/gallines.mp3` | les gallines que s’esvaloten (E3, E5) (`gallines`) | `gallines_2.mp3` | «Hens squawking and flapping in alarm, close» |
| `masia/relliscada.mp3` | la relliscada per la pastanaga avall (E3) (`relliscada`) | `relliscada_2.mp3` | «Sliding down a smooth surface, a quick zip of fabric on wood, short whoosh» |
| `masia/aterratge.mp3` | l’aterratge a la terra tova (E3) (`aterratge`) | `aterratge_1.mp3` | «A child landing on soft soil with both feet, soft thump» |
| `masia/rafega.mp3` | una ràfega de vent per l’herba (E4, el prat) (`rafega`) | `rafega_3.mp3` | «A gust of wind rushing through tall grass, rising then falling» |
| `masia/llencol.mp3` | el llençol que espetega a l’estenedor (E4) (`llencol`) | `llencol_4.mp3` | «A bed sheet flapping hard on a clothesline in the wind» |
| `masia/telainfla.mp3` | el llençol que s’infla com una vela (E4) (`telainfla`) | `telainfla_3.mp3` | «Cloth billowing and snapping as it fills with wind, like a sail catching» |
| `masia/gorra.mp3` | la gorra que el vent s’endú (E4) (`gorra`) | `gorra_4.mp3` | «A cap whisked off a head by the wind, small fabric whoosh» |
| `masia/pinces.mp3` | les pinces que salten (E4) (`pinces`) | `pinces_2.mp3` | «Wooden clothes pegs popping off a line, two quick snaps» |
| `masia/poffpalla.mp3` | la caiguda al paller (E4) (`poffpalla`) | `poffpalla_1.mp3` | «Someone landing in a soft haystack, dry straw poff» |
| `masia/campaneta.mp3` | la campaneta de la cabra (E4, E5, sopar) (`campaneta`) | `campaneta_1.mp3` | «A small goat bell tinkling, two shakes» |
| `masia/gratar.mp3` | la peülla que grata la terra (E5, la figuera) (`gratar`) | `gratar_2.mp3` | «A goat hoof scraping dry earth twice» |
| `masia/trot.mp3` | el trot de la cabra (E5, sopar) (`trot`) | `trot_1.mp3` | «Goat hooves trotting on grass, several quick steps» |
| `masia/bonk.mp3` | el cop de cap al tronc (E5) (`bonk`) | `bonk_1.mp3` | «A head butting a thick tree trunk, deep wooden thud» |
| `masia/branca.mp3` | la branca que es sacseja (E5) (`branca`) | `branca_4.mp3` | «A fig tree branch shaking, leaves rustling vigorously» |
| `masia/figues.mp3` | les figues que cauen (E5) (`figues`) | `figues_2.mp3` | «Several ripe figs dropping onto grass and dry earth, soft plops» |
| `masia/figacap.mp3` | una figa que cau al cap (E5) (`figacap`) | `figacap_3.mp3` | «One soft ripe fig landing, a single squishy plop» |
| `masia/mossegada.mp3` | la cabra que mastega (E5, sopar) (`mossegada`) | `mossegada_3.mp3` | «A goat chewing a ripe fig, wet munching, close» |
| `masia/tro.mp3` | un tro molt llunyà (E5) (`tro`) | `tro_2.mp3` | «Very distant soft summer thunder, far away, gentle rumble» |
| `masia/pluja.mp3` | el ruixat d’estiu (E5) (`pluja`) | `pluja_3.mp3` | «Summer rain shower on leaves, light to medium, close-mic» |
| `masia/sacsejadapel.mp3` | la cabra que s’espolsa l’aigua (E5) (`sacsejadapel`) | `sacsejadapel_3.mp3` | «A wet animal shaking water off its fur, quick flapping of wet fur and droplets» |
| `masia/gronxador.mp3` | el gronxador que grinyola (E5) (`gronxador`) | `gronxador_2.mp3` | «A rope swing creaking rhythmically on a tree branch» |
| `masia/abelles.mp3` | abelles (E5) (`abelles`) | `abelles_2.mp3` | «Bees buzzing around flowers, close, gentle» |
| `masia/plats.mp3` | els plats i els coberts a taula (sopar) (`plats`) | `plats_1.mp3` | «Ceramic plates and cutlery set down on a wooden table outdoors» |
| `masia/passescorrent.mp3` | els nens que corren per la grava (sopar) (`passescorrent`) | `passescorrent_2.mp3` | «Two children running on gravel, light quick footsteps» |
| `masia/brindis.mp3` | el brindis (sopar) (`brindis`) | `brindis_4.mp3` | «Two glasses clinking in a toast, bright» |
| `masia/estovalles.mp3` | les estovalles estirades (sopar) (`estovalles`) | `estovalles_2.mp3` | «A tablecloth yanked across a table, crockery sliding and rattling» |
| `masia/mastegar.mp3` | la família que sopa (sopar) (`mastegar`) | `mastegar_4.mp3` | «A family eating, cutlery on plates and soft chewing, close» |
| `masia/gerro.mp3` | la carpa que cau al gerro (sopar) (`gerro`) | `gerro_3.mp3` | «A fish flopping into a water jug, small contained splash» |
| `masia/gatsalt.mp3` | el gat que salta a la falda (sopar) (`gatsalt`) | `gatsalt_2.mp3` | «A cat jumping onto a wooden table, soft paws landing» |
| `masia/riallagrup.mp3` | la rialla de tota la família (sopar) (`riallagrup`) | `riallagrup_2.mp3` | «A family of four laughing together at an outdoor dinner, warm, one burst» |

Les veus (no verbals: rialles, esbufecs, roncs i exclamacions, amb etiquetes d’expressió del model v3):

| Fitxer (`masia/`) | Veu | Veu d’ElevenLabs | Fitxer original | Text donat |
|---|---|---|---|---|
| `masia/aviaRialla.mp3` | àvia Pepa, rialla (`aviaRialla`) | «Abuelita de Cuento» (`M9RTtrzRACmbUzsEMq8p`) | `vAviaRialla_1.mp3` | «[laughs heartily] Ha ha ha ha ha!» |
| `masia/aviaHup.mp3` | àvia Pepa, «hup!» en llançar la truita (`aviaHup`) | «Abuelita de Cuento» (`M9RTtrzRACmbUzsEMq8p`) | `vAviaHup_1.mp3` | «[grunts with effort] Hup!» |
| `masia/aviaOh.mp3` | àvia Pepa, «oooh?» de sorpresa (`aviaOh`) | «Abuelita de Cuento» (`M9RTtrzRACmbUzsEMq8p`) | `vAviaOh_2.mp3` | «[surprised] [elderly voice] Oooh?» |
| `masia/aviaAi.mp3` | àvia Pepa, «ai, ai, ai!» (`aviaAi`) | «Abuelita de Cuento» (`M9RTtrzRACmbUzsEMq8p`) | `vAviaAi_2.mp3` | «[worried] [hurried] Ai, ai, ai, ai!» |
| `masia/aviRonc.mp3` | avi Tomàs, roncs amb xiulet (`aviRonc`) | «El Abuelo Charlie» (`Yb8JGzcZyW5YYzenhRCm`) | `vAviRonc_2.mp3` | «[snoring loudly] [elderly voice] Khhhrrrr… fiuuuu… khhhrrrr… fiuuuu… khhhrrrr…» |
| `masia/aviEh.mp3` | avi Tomàs, «eh?!» en despertar-se (`aviEh`) | «El Abuelo Charlie» (`Yb8JGzcZyW5YYzenhRCm`) | `vAviEh_2.mp3` | «[startled] [waking up] Eh?! Eh?» |
| `masia/aviRialla.mp3` | avi Tomàs, rialleta greu (`aviRialla`) | «El Abuelo Charlie» (`Yb8JGzcZyW5YYzenhRCm`) | `vAviRialla_2.mp3` | «[chuckles warmly] [deep voice] Heh heh heh heh.» |
| `masia/ninaEsforc.mp3` | Nina, esforç en estirar la pastanaga (`ninaEsforc`) | «Mini – Lively Cute Little Girl» (`nUX4UWK0Tf1qh5zvFZWR`) | `vNinaEsforc_2.mp3` | «[straining with effort] [childlike voice] Nnnngh! Nnnnngh!» |
| `masia/ninaEsbufec.mp3` | Nina, esbufec (`ninaEsbufec`) | «Mini – Lively Cute Little Girl» (`nUX4UWK0Tf1qh5zvFZWR`) | `vNinaEsbufec_1.mp3` | «[exhales] [out of breath] Pffff!» |
| `masia/ninaRialla.mp3` | Nina, rialla (`ninaRialla`) | «Mini – Lively Cute Little Girl» (`nUX4UWK0Tf1qh5zvFZWR`) | `vNinaRialla_2.mp3` | «[giggles] [childlike voice] Hi hi hi hi hi!» |
| `masia/ninaUuuh.mp3` | Nina, «uuuh!» de meravella (`ninaUuuh`) | «Mini – Lively Cute Little Girl» (`nUX4UWK0Tf1qh5zvFZWR`) | `vNinaUuuh_1.mp3` | «[amazed] [childlike voice] Uuuuuuh!» |
| `masia/polRialla.mp3` | Pol, rialla aguda (`polRialla`) | «Teddy Twinkle – Cute Cartoon Boy» (`XjGYkUkzth8BPs29fmcV`) | `vPolRialla_2.mp3` | «[laughs] [high voice] [childlike voice] Ha ha ha ha ha ha!» |
| `masia/polIiih.mp3` | Pol, crit d’alegria en volar (`polIiih`) | «Teddy Twinkle – Cute Cartoon Boy» (`XjGYkUkzth8BPs29fmcV`) | `vPolIiih_2.mp3` | «[screaming with joy] [childlike voice] Iiiiiiiiiih!» |
| `masia/polUep.mp3` | Pol, «uep!» de sorpresa (`polUep`) | «Teddy Twinkle – Cute Cartoon Boy» (`XjGYkUkzth8BPs29fmcV`) | `vPolUep_1.mp3` | «[surprised] [childlike voice] Uep!» |

Els episodis reutilitzen també sons de Pinta el món (`pinta/`, banc `pintaRec`: la gota, la gallina) i els bucles de Natura i de Pinta el món per a l’aire del tauler (`nature/`: `dawn`, `blackbird`, `meadow`, `ptCigales`, `crickets`, `frogs`).

Crèdit: «Sons generats amb ElevenLabs».

# Crèdits dels sons d’El viatge en globus (CE43, 0.43)

Generats amb ElevenLabs Sound Effects (model `eleven_text_to_sound_v2`) el 4 de novembre de 2026, amb el permís d’en Marc per fer servir ElevenLabs, al flux `AMAytcShyXonNt9lXn0o`: 20 nodes amb quatre preses cadascun (80 preses). La presa de cada so s’ha triat a cegues per les mesures (durada activa, tons fixos, saturació, centroide espectral; `tria.py`) i s’ha preparat amb `tools/make_oneshot.py` (−18 a −20 LUFS momentani). El cremador i el vent de les altures són bucles sense costura (encadenament d’1 a 1,5 s; −20 i −22 LUFS). La resta de sons dels llocs són de les col·leccions `natureRec`, `pintaRec` i `masiaRec` ja acreditades més amunt.

| Fitxer (`viatge/`) | So | Fitxer original | Indicació donada a ElevenLabs |
|---|---|---|---|
| `viatge/apagada.mp3` | el cremador que s’apaga (`apagada`) | `apagada_4.mp3` | «Hot air balloon burner valve closing, the flame roar cut off quickly with a soft puff and a little hiss» |
| `viatge/badall.mp3` | en Bru que badalla (`badall`) | `badall_2.mp3` | «Small dog yawning, a cute squeaky yawn, close up, quiet room» |
| `viatge/barca.mp3` | la barca del port i del canal (`barca`) | `barca_2.mp3` | «Small wooden fishing boat with a little diesel engine putt-putting past in a harbour» |
| `viatge/canalla.mp3` | la canalla a la platja (`canalla`) | `canalla_4.mp3` | «Children on a beach in the distance cheering and laughing happily, no words» |
| `viatge/cistella.mp3` | la cistella que toca terra (`cistella`) | `cistella_4.mp3` | «Wicker basket landing softly on grass: creak of wicker and a gentle thump» |
| `viatge/cremador.mp3` | el cremador del globus encès (bucle) (`cremador`) | `cremador_4.mp3` | «Hot air balloon propane burner firing continuously, a steady deep roaring blast of flame, close up, no music» |
| `viatge/dofins.mp3` | els dofins a la gola i a la cala (`dofins`) | `dofins_1.mp3` | «Dolphins leaping out of the sea: splashes and playful clicks and whistles» |
| `viatge/encesa.mp3` | el cremador que s’encén (`encesa`) | `encesa_2.mp3` | «Hot air balloon burner ignition: a metallic valve click then a sudden whoosh of flame starting, close up» |
| `viatge/festa.mp3` | la gent que rep el globus a l’alba (`festa`) | `festa_1.mp3` | «Small group of people at dawn in a field cheering softly and clapping to welcome someone, no words» |
| `viatge/flamencs.mp3` | els flamencs als arrossars (`flamencs`) | `flamencs_2.mp3` | «Flock of flamingos taking off from shallow water, many wing flaps, splashes and honking calls» |
| `viatge/isard.mp3` | l’isard a la tartera (`isard`) | `isard_1.mp3` | «Mountain goat hooves clattering over rocks, a few small pebbles tumbling down a scree slope» |
| `viatge/lladruc.mp3` | en Bru que borda (`lladruc`) | `lladruc_2.mp3` | «Small happy dog barking twice, two short clean barks, close up, no background» |
| `viatge/mussol.mp3` | el mussol prop del far (`mussol`) | `mussol_1.mp3` | «An owl hooting softly at night in a quiet forest, two or three hoots» |
| `viatge/oques.mp3` | les oques que passen volant (`oques`) | `oques_2.mp3` | «Flock of wild geese honking as they fly past overhead in V formation» |
| `viatge/ovelles.mp3` | el ramat (`ovelles`) | `ovelles_1.mp3` | «Small flock of sheep bleating in a sunny meadow, a few gentle bleats, outdoors» |
| `viatge/telecabina.mp3` | el telecabina (`telecabina`) | `telecabina_2.mp3` | «Mountain cable car gondola passing over a pylon pulley: soft mechanical hum and rhythmic clack» |
| `viatge/tren.mp3` | el tren pel viaducte (`tren`) | `tren_3.mp3` | «Small steam train in the distance whistling two short cheerful toots while chugging along» |
| `viatge/udol.mp3` | en Bru que udola a la lluna (`udol`) | `udol_2.mp3` | «Small dog doing one short soft cute howl, close up, quiet night» |
| `viatge/vela.mp3` | la vela a la cala (`vela`) | `vela_3.mp3` | «Sailboat sail flapping in the wind, ropes and wood creaking gently» |
| `viatge/ventalt.mp3` | el vent de les altures (bucle) (`ventalt`) | `ventalt_1.mp3` | «Soft airy wind high in the open sky, smooth gentle breeze, no gusts, no leaves, calm and wide» |

## Encaixos de fusta (0.45)

«Encaixos de fusta» (EN12) no afegeix cap enregistrament ni cap so generat: el «clac» de la peça i el refús són el bloc de fusta (`woodblockRec`) i el tambor (`tamborRec`), les veus de les figures són sons que ja tenia la suite (`masiaRec`, `pintaRec`, `pouRec`, `vgRec`, `toonRec`, `fireRec`, `sabanaRec` i els instruments afinats), i l’aire de cada escena són els bucles de natura (`natureRec`, `pintaRec`). Els crèdits de cada so són els de les seccions anteriors.

# Crèdits del toc de castells de Fem castells (CE25, 0.45.8–0.45.9)

Els fitxers `castells/toc1.mp3` a `castells/toc7.mp3` són set fragments d’un enregistrament real: la banda sonora del vídeo «Primer 5 de 8 descarregat pels Marrecs de Salt», de JordiGran, gravat el 26 de juliol de 2015 a la Diada de Sant Jaume de Salt i publicat a Wikimedia Commons amb la llicència Creative Commons Reconeixement-CompartirIgual 4.0 Internacional (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Primer_5_de_8_descarregat_pels_Marrecs_de_Salt.webm. Hi sonen els grallers i el timbal que toquen el toc de castells mentre el castell puja i baixa, i la plaça. La còpia la va baixar en Marc el 6 de novembre de 2026.

Modificacions (tools/make_toc.py): només la pista de so, a mono; filtre passaaltes a 120 Hz; s’han escurçat amb un encadenat dos silencis llargs dels grallers (144,6–149,1 s i 161,3–166,9 s); els fragments 1 a 3 segueixen el toc des de l’inici (120,4 s) i els 4 a 6 són el tros que acaba a 195,8 s, tots tallats entre dues notes; el 7 va de 3:20 a 3:34,5 (200,0–214,5 s), amb l’última frase de les gralles i els aplaudiments, com va indicar en Marc; entrades de 60 ms i sortides de 0,6 s (1,2 s el setè); un sol guany per a tots (−20 LUFS integrats, pic per sota de −1 dBFS); MP3 a 96 kb/s. Els fragments modificats es distribueixen amb la mateixa llicència CC BY-SA 4.0.

| Fitxer (`castells/`) | Pulsació | Durada |
|---|---|---|
| `toc1.mp3` | 1, la pinya amb els baixos | 7,25 s |
| `toc2.mp3` | 2, els segons | 6,70 s |
| `toc3.mp3` | 3, els terços | 7,35 s |
| `toc4.mp3` | 4, els quarts | 7,10 s |
| `toc5.mp3` | 5, els dosos | 7,05 s |
| `toc6.mp3` | 6, l’aixecador | 7,00 s |
| `toc7.mp3` | 7, l’enxaneta, l’aleta i la baixada | 14,50 s |

## La nova Pluja de colors (CE03, 0.52)

«Pluja de colors» (CE03) no afegeix cap enregistrament ni cap so generat. La música és feta amb instruments que ja tenia la suite: guitarra (`guitarRec`), clarinet (`clarinetRec`), oboè (`oboeRec`), flauta (`fluteRec`), fagot (`dsFagot`), contrabaix (`dsBaix`), violins i violoncels en pizzicato (`violinsPizzRec`, `celliPizzRec`), arpa (`harpRec`, `dsArpa`), piano (`dsPiano`), marimba (`marimbaRec`, `dsMarimba`), glockenspiel (`glockRec`, `dsGlock`), udu (`uduRec`), tambor (`tamborRec`), pandereta (`dsPandereta`), triangle (`triangleRec`) i claves (`woodblockRec`). Els sons del taller són dels bancs `pintaRec` (gota, pinzell, full), `pouRec` (escombra, ones del toll), `sabanaRec` (paper que llisca, aire) i `masiaRec` (desenganxar, pinces); l’aire de cada taller és de `natureRec` (cigales, rierol, vent, coloms, molí). Els crèdits de tots són als apartats d’aquests bancs.

## La nova Flor de paper (CE02, 0.51)

«Flor de paper» (CE02) no afegeix cap enregistrament ni cap so generat. La música és feta amb instruments que ja tenia la suite: guitarra (`guitarRec`), flauta (`fluteRec`), clarinet (`clarinetRec`), oboè (`oboeRec`), violins i violoncels en pizzicato (`violinsPizzRec`, `celliPizzRec`), arpa (`harpRec`, `dsArpa`), piano (`dsPiano`), fagot (`dsFagot`), marimba (`marimbaRec`), vibràfon (`vibRec`), glockenspiel (`glockRec`), kalimba (`kalimbaRec`) i udu (`uduRec`). L’aire dels cinc jardins són bucles de natura (`natureRec`: prat, cigales, llacuna, rierol, bosc, vent, nit, grills, pluja, gotes; la merla). El paper que es desplega, que llisca i les ales de paper són de `sabanaRec`. Les veus dels visitants són `masiaRec` (abelles: l’abella, el borinot i l’abella fustera, els dos últims amb el mateix enregistrament més lent i més greu; la granota), `selvaRec` (el colibrí) i `pouRec` (les gotes). Els crèdits de cada so són els de les seccions anteriors.

## Detectius de sons (EN11, 0.48)

Les 165 notes de la carpeta `detectius/` són fragments editats (retallats a partir de l'atac, en mono, igualats a −18 LUFS momentanis, amb un final esvaït i codificats en MP3 a 96 kbps) dels fitxers originals de VSCO-2 CE (CC0 1.0), obtinguts del repositori https://github.com/sgossner/VSCO-2-CE. L'afinació mesurada de cada nota es desa al banc (`tune`) i el sintetitzador la corregeix en reproduir-la. La guitarra continua sent `guitarRec` (carpeta `pinta/`).

| Prefix a `detectius/` | Instrument a Pim Pam | Banc |
|---|---|---|
| `arpa_…` | arpa | `dsArpa` (18 notes) |
| `clarinet_…` | clarinet | `dsClarinet` (9 notes) |
| `contrabaix_…` | contrabaix | `dsBaix` (12 notes) |
| `fagot_…` | fagot | `dsFagot` (8 notes) |
| `flauta_…` | flauta travessera | `dsFlauta` (10 notes) |
| `glock_…` | glockenspiel | `dsGlock` (6 notes) |
| `gong_…` | gong (tam-tam) | `dsGong` (3 notes) |
| `marimba_…` | marimba | `dsMarimba` (9 notes) |
| `oboe_…` | oboè | `dsOboe` (8 notes) |
| `pandereta_…` | pandereta | `dsPandereta` (3 notes) |
| `piano_…` | piano | `dsPiano` (15 notes) |
| `timbal_…` | timbal | `dsTimbal` (5 notes) |
| `triangle_…` | triangle | `dsTriangle` (2 notes) |
| `trombo_…` | trombó | `dsTrombo` (8 notes) |
| `trompa_…` | trompa | `dsTrompa` (6 notes) |
| `trompeta_…` | trompeta | `dsTrompeta` (11 notes) |
| `tuba_…` | tuba | `dsTuba` (7 notes) |
| `violi_…` | violí | `dsVioli` (14 notes) |
| `violoncel_…` | violoncel | `dsCello` (11 notes) |

## El vestidor fantàstic (EN06, 0.73)

Els 54 sons de la carpeta `vestidor` (els efectes del camerino i de l’escenari, el públic, el gosset Pipa i el lloro) i les 69 veus de la carpeta `vestidorVeu` (exclamacions sense paraules dels quatre artistes) s’han generat amb ElevenLabs el 2026-11-11: els efectes amb Sound Effects (model `eleven_text_to_sound_v2`) i les veus amb `eleven_v4`, amb veus de la biblioteca d’ElevenLabs. No són enregistraments reals ni obres de tercers. Els drets d’ús depenen de les condicions d’ElevenLabs i del pla del compte que els va generar, i **no s’han verificat**. Tampoc no s’han escoltat: s’han triat i tallat per mesura (durada, atacs, brillantor), i en Marc els ha d’escoltar abans de donar-los per bons. Les indicacions, les variacions descartades, els scripts de tria i tall i els identificadors de cada generació són a `propostes/vestidor_sons/` (amb `FONTS.md`), a la carpeta del projecte.

Preparació: comencen al primer so amb una entrada de 5 ms i acaben amb una fosa de sortida; alguns porten un filtre passabaix; el volum s’iguala per la sonoritat momentània màxima (EBU R128), sense passar de −1 dBFS de pic; mono, MP3. Els dos ambients (`murmuri.mp3`, el públic que xerra darrere la paret, i `vaixell.mp3`, el vaixell que cruix) són bucles amb mig segon de marge a cada costat. Quatre efectes de la proposta no es fan servir i no són a l’app (l’armari que s’obre, la botzina, el gos que panteixa i el redoble, que és el redoble de caixa enregistrat de `snareRoll`), ni les vuit preses de «Hmm?». La música de l’activitat és feta amb instruments que ja tenia la suite (els de Detectius de sons, VSCO-2 CE, CC0 1.0).

| Fitxer | Indicació (ElevenLabs) | Variació triada (identificador de la generació) |
|---|---|---|
| `vestidor/aletes.mp3` | Swim flippers slapping on a wooden floor, two wet floppy flaps | `d02_2` (`raEwrGBhGfkTHJfUrhAa`) |
| `vestidor/aplaudiments.mp3` | Small theatre audience of children and parents applauding warmly, steady clapping that fades out at the end | `i11_2` (`PUV8s6ZQKoJlEJyxs6MQ`) |
| `vestidor/armariTanca.mp3` | Wooden wardrobe doors closing softly with a gentle wooden click, close | `a07_3` (`ZoSBaaiNCAKAbbZ3Yn4N`) |
| `vestidor/awwPublic.mp3` | Theatre audience saying aww together, sweet and tender | `i09_1` (`j5IftLakVjmljpj1YpXD`) |
| `vestidor/badumtss.mp3` | Comedy drum rimshot, snare and cymbal, ba-dum-tss | `i04_1` (`c62ccsLXv5ir2ikTDKTT`) |
| `vestidor/barretPosa.mp3` | A felt hat plopped onto a head, soft muffled thump, close | `a05_4` (`b0MCNiwogFi2y3aCOBMY`) |
| `vestidor/barretVola.mp3` | A short airy whoosh of a hat flying off | `h03_4` (`fXU4dM91hu5wctWIdrSb`) |
| `vestidor/bombolles.mp3` | Bubbles blown through a snorkel underwater, three soft blub blub sounds, close | `d01_4` (`xsVXpBblq9nKhZBVDawC`) |
| `vestidor/botesLluna.mp3` | Heavy padded boots landing softly, a low muffled thump with a springy wobble | `e02_4` (`cPl36BqtcR2XOsGTDoiw`) |
| `vestidor/botesPirata.mp3` | Four clear wooden boot stomps on a wooden stage, evenly spaced, steady rhythm, close, no music | `b08_3` (`tbxIwRBvq6eU8ZSAqsVe`) |
| `vestidor/capaEnrotlla.mp3` | Heavy fabric being wrapped around and around a body, thick cloth rustles | `g03_1` (`8URcCMUpoWWjaJkEH6EO`) |
| `vestidor/capaGira.mp3` | A long velvet cape swooshing through the air as someone spins around | `g02_4` (`LaXXurnwWMFz8WahJlaJ`) |
| `vestidor/casc.mp3` | A space helmet clicking shut with a short pressurised air hiss | `e01_4` (`WTwI3K5GxH8tRvpSWgDy`) |
| `vestidor/cinta.mp3` | A gymnastics ribbon swishing through the air in loops, silky whooshes | `h07_1` (`6FzdKieNYPQyE8Dalre1`) |
| `vestidor/confeti.mp3` | Paper confetti bursting out with a soft pop and a gentle paper rustle | `h08_3` (`B3hWGbU0NYIKpU9AKaFA`) |
| `vestidor/corona.mp3` | A small metal crown wobbling on a head, light rattling clinks | `g01_1` (`FL2JwBNutQ6U2RBm9rBC`) |
| `vestidor/esclops.mp3` | Three wooden clog steps on a wooden stage floor, clop clop clop, evenly spaced, close, no music | `f05_2` (`3PQNW7PQmzWwa6GbGZgo`) |
| `vestidor/farina.mp3` | A puff of flour blown into the air, soft powdery whoomph | `f01_2` (`bqYgq1pmOEyFqiTc9eTn`) |
| `vestidor/focus.mp3` | A big old theatre spotlight switching on with a heavy clunk | `i02_3` (`s03VsBG7TMouPaGbvTLW`) |
| `vestidor/globus.mp3` | A rubber balloon squeaking as it is squeezed, short playful squeaks | `h04_3` (`ag8kFNjm6V3o9W0H66w5`) |
| `vestidor/gorroCreix.mp3` | A long rising rubbery stretching squeak, like a balloon being stretched slowly | `f02_4` (`y1jiVAOf2UOJS5FSj56c`) |
| `vestidor/gosBorda.mp3` | A small fluffy dog giving two happy high barks, close | `j01_3` (`HjibLbObkCpwZNVanxVg`) |
| `vestidor/gosCanta.mp3` | A small dog howling along musically, a short cute aroo | `j07_1` (`XnieR0Z8e6Z6NPJrSa4U`) |
| `vestidor/gosEsternuda.mp3` | A small dog sneezing once, a short cute sneeze | `j04_3` (`HeL71tCrmgPEyPGkcxt1`) |
| `vestidor/gosPotes.mp3` | A small dog's paws tapping quickly across a wooden floor | `j06_4` (`K7AhyzpbbxRMseijaGB9`) |
| `vestidor/gosSacseja.mp3` | A small dog shaking its fur and floppy ears, quick flappy rustle | `j05_3` (`LkWdsPC2OzVwBQm73Ldr`) |
| `vestidor/gosYip.mp3` | A small dog giving one excited yip, close | `j02_4` (`qPnkY9SOvnr6mscEfCpV`) |
| `vestidor/lloroAles.mp3` | A parrot flapping its wings quickly, feathery flutter, close | `b03_1` (`aITe0dVlCk4IUtrRaOLM`) |
| `vestidor/lloroCrida.mp3` | A cheerful parrot squawk, one short bright call, close | `b01_3` (`kitrpiTC0VlvLU4wPoCk`) |
| `vestidor/lloroXerra.mp3` | A parrot chattering playfully, a short burst of squawky babble, close | `b04_2` (`Gvmeqlp0XaUFGWTWyMPG`) |
| `vestidor/lloroXiula.mp3` | A parrot whistling a short cheerful two-note whistle, close | `b02_4` (`p2fNIvKrC6k32Btfsh28`) |
| `vestidor/mirall.mp3` | Short magical glass shimmer, a soft bright twinkle like a wind chime brushed once | `a08_4` (`ixvbSQgHiBhYd9PugpYn`) |
| `vestidor/murmuri.mp3` | Theatre audience murmuring quietly before a show begins, distant chatter with no clear words, calm and even | `i15_3` (`gR8uLQFuUYUP8RstRgiw`) |
| `vestidor/neda.mp3` | Two gentle swimming strokes splashing in a pool | `d03_1` (`8dxfgyYQWgFY9j2UuCNN`) |
| `vestidor/neopre.mp3` | A rubber wetsuit being stretched and snapping back, rubbery squeak and slap | `d04_1` (`MSDCUCdMtuqxmuTT7LAt`) |
| `vestidor/oohPublic.mp3` | Theatre audience of children and adults saying a long ooooh together in amazement | `i14_3` (`2TwfDJ7ZWHkVZ6YLxppu`) |
| `vestidor/ovacio.mp3` | Enthusiastic theatre audience applause with happy cheers and whistles, children and adults, fading out at the end | `i12_3` (`h6QCnntQKzfiCk9HHJqT`) |
| `vestidor/paraigua.mp3` | An umbrella snapping open with a quick whoosh and fabric pop | `h01_1` (`y5a9XEWvHB7GBUQCQh8E`) |
| `vestidor/passosMitjons.mp3` | Four soft padded footsteps of a child in socks on a wooden stage floor, evenly spaced, close, no music | `a10_3` (`USsTlGoockCgdS5kh95d`) |
| `vestidor/pirueta.mp3` | A quick spinning swish of a tulle tutu, airy fabric swirl | `c02_3` (`I99deaL3OyyZTld3Own0`) |
| `vestidor/puntetes.mp3` | Ballet slippers tiptoeing quickly across a wooden stage, light soft taps | `c01_3` (`HygMoT3UisCKf8KbloGt`) |
| `vestidor/regadora.mp3` | Water sprinkling from a watering can onto leaves, gentle shower, short | `h05_1` (`ueC1DaVR9MJsNGkwJ2c1`) |
| `vestidor/rellisca.mp3` | A shoe slipping on a slippery floor, quick squeak and a sliding scrape | `f03_1` (`lnP8XMBAvAYves1hRkvW`) |
| `vestidor/riallesPublic.mp3` | Small theatre audience laughing warmly together, children and adults, a burst of laughter that settles down | `i13_3` (`6aHpd87l6VAwjZjshkD0`) |
| `vestidor/robaPosa.mp3` | A soft cloth garment dropping onto a person's shoulders, quick fabric rustle and gentle pat, close | `a04_3` (`dwK16HbOHXzdGeHOVWVn`) |
| `vestidor/robaVola.mp3` | Several pieces of clothing flying quickly past through the air, soft fabric flaps and whooshes, no music | `a03_1` (`Fz5yVHQVCU3H41g9uc59`) |
| `vestidor/sabatesPosa.mp3` | Feet slipping into shoes, quick soft leather squeak and a light tap, close | `a06_1` (`lamR2LW1jUV7KDJCS8fe`) |
| `vestidor/teloner.mp3` | A heavy theatre curtain being raised, fabric swoosh and a rope pulley creak | `i01_4` (`QY8mlZEDesGOUpRoHmiA`) |
| `vestidor/tuba.mp3` | A tuba playing one silly low out-of-tune blat, short and funny | `h02_1` (`t5GKMuC6UUERkilz0UV4`) |
| `vestidor/tutuPop.mp3` | A soft playful pop like a small cork coming out, gentle | `c03_4` (`bs4Kq4gZjSuCRwAtHqUb`) |
| `vestidor/vaixell.mp3` | Wooden ship deck creaking gently with small waves lapping against the hull, calm and even, no music | `b07_4` (`0v5R1R9peV4xdfqwJ07a`) |
| `vestidor/ventada.mp3` | A sudden magical gust of wind rushing out of a cupboard, airy whoosh with fluttering fabric, no music | `a02_3` (`ruxWdGqEHbwmru7WtGTX`) |
| `vestidor/ventall.mp3` | A paper folding fan snapping open, then two quick fanning flutters | `h06_2` (`JoVsZ0jQcqySOFYPxzNH`) |
| `vestidor/vestitInfla.mp3` | A puffy suit inflating quickly with air, soft rubbery whoosh, no pop | `e03_4` (`yw6Bqc7H6G92Cg1OjxH4`) |

| Artista | Veu de la biblioteca d’ElevenLabs | Fitxers |
|---|---|---|
| Rita | Betty – Quirky, Cartoonish & Warm | `ritaEsforc1.mp3`, `ritaEsforc2.mp3`, `ritaIupi1.mp3`, `ritaIupi2.mp3`, `ritaOh1.mp3`, `ritaOh2.mp3`, `ritaOoh1.mp3`, `ritaOoh2.mp3`, `ritaRialleta1.mp3`, `ritaRialleta2.mp3`, `ritaRiure1.mp3`, `ritaRiure2.mp3`, `ritaTada1.mp3`, `ritaTada2.mp3`, `ritaUau1.mp3`, `ritaUau2.mp3`, `ritaUps1.mp3`, `ritaUps2.mp3` |
| Hug | Wilf – Cheerful, Quirky and Northern | `hugEsforc1.mp3`, `hugEsforc2.mp3`, `hugIupi1.mp3`, `hugIupi2.mp3`, `hugOh1.mp3`, `hugOh2.mp3`, `hugOoh1.mp3`, `hugOoh2.mp3`, `hugRialleta1.mp3`, `hugRiure1.mp3`, `hugRiure2.mp3`, `hugTada1.mp3`, `hugTada2.mp3`, `hugUau1.mp3`, `hugUau2.mp3`, `hugUps1.mp3`, `hugUps2.mp3` |
| Avi Quim | El Abuelo Charlie – Anciano Narrador de Historias | `quimEsforc1.mp3`, `quimEsforc2.mp3`, `quimIupi1.mp3`, `quimIupi2.mp3`, `quimOh1.mp3`, `quimOh2.mp3`, `quimOoh1.mp3`, `quimOoh2.mp3`, `quimRialleta1.mp3`, `quimRialleta2.mp3`, `quimRiure1.mp3`, `quimRiure2.mp3`, `quimTada1.mp3`, `quimTada2.mp3`, `quimUau1.mp3`, `quimUau2.mp3`, `quimUps1.mp3`, `quimUps2.mp3` |
| Ona | Lulu Lollipop – Sweet & Bubbly Girl | `onaEsforc1.mp3`, `onaEsforc2.mp3`, `onaIupi1.mp3`, `onaIupi2.mp3`, `onaOh1.mp3`, `onaOh2.mp3`, `onaOoh1.mp3`, `onaOoh2.mp3`, `onaRialleta1.mp3`, `onaRiure1.mp3`, `onaRiure2.mp3`, `onaTada1.mp3`, `onaTada2.mp3`, `onaUau1.mp3`, `onaUps1.mp3`, `onaUps2.mp3` |

Crèdit: «Sons i veus generats amb ElevenLabs».

## Fractals a la natura (CE46, 0.74)

Els 40 sons de la carpeta `fractals` (per a cada una de les vint formes, sis segons del lloc on viu, que sonen sota el creixement, i un accent propi: una fulla, un cristall, una abella, una onada…) s’han generat amb ElevenLabs el 2026-11-11 amb Sound Effects (model `eleven_text_to_sound_v2`, influència de la indicació 0,4), al flux `a2wJiA3YtKsf1XaMrs56`. No són enregistraments reals ni obres de tercers. Els drets d’ús depenen de les condicions d’ElevenLabs i del pla del compte que els va generar, i **no s’han verificat**. Tampoc no s’han escoltat: de dues a quatre variacions de cada indicació, s’han triat i tallat per mesura (constància i absència de tons fixos en els ambients; un sol esclat, l’atac al principi i la durada en els accents), i en Marc els ha d’escoltar abans de donar-los per bons.

Preparació: els ambients comencen al principi de la presa amb una entrada de 0,3 s i acaben amb una fosa de sortida d’1,5 s; els accents comencen al primer so amb una entrada de 5 ms i acaben amb una fosa de 0,15 s; el volum s’iguala per la sonoritat momentània màxima (EBU R128: −30 LUFS els ambients, −24 els accents), sense passar de −1 dBFS de pic; mono, MP3 de 96 kb/s.

| Fitxer | Indicació (ElevenLabs) | Variació triada (identificador de la generació) |
|---|---|---|
| `fractals/falgueresAmb.mp3` | Quiet damp forest floor among ferns, a soft breeze brushing through the fronds, a few slow water drips nearby, calm and gentle, no birds, no music | `01a_4` (`bAM9ohyjOsMLN6g8mVA2`) |
| `fractals/falgueresAcc.mp3` | A single soft fern frond uncurling and brushing against other leaves, gentle leafy rustle, close, quiet | `01b_3` (`kjOcSrl7oYVYsUrjCWhO`) |
| `fractals/flocsAmb.mp3` | Gentle snowfall in still winter air, a soft hush of falling snow, faint distant wind, calm and peaceful, no music | `02a_3` (`xLEvpOKRNuoEarY6OrHp`) |
| `fractals/flocsAcc.mp3` | Tiny ice crystals tinkling softly, a delicate glassy sparkle, close and gentle | `02b_1` (`cGjJS2c5H4MjwKjZgJr0`) |
| `fractals/girasolAmb.mp3` | Warm summer sunflower field, bees humming softly around the flowers, a light breeze through tall stems, calm, no music | `03a_1` (`vyV6svffXkufOtCjwiZL`) |
| `fractals/girasolAcc.mp3` | One bumblebee flying past close by, a short soft buzz that comes and goes | `03b_3` (`vxjzNd5XizlZF36HJ8jq`) |
| `fractals/llampsAmb.mp3` | Very distant soft thunder rolling far away over the hills, low and muffled, gentle, no rain, no sharp crack, no music (filtre passabaix de 2,5 kHz) | `04a_2` (`uo3B78tvNRDaLUfSUTnl`) |
| `fractals/llampsAcc.mp3` | A soft crackle of static electricity, quick faint sparkling crackle, gentle and quiet | `04b_1` (`KAgpRwtn0BHLkRTmkqfp`) |
| `fractals/arbreAmb.mp3` | The leaves of a large old tree rustling in a gentle wind, a few soft birds chirping far away, calm, no music | `05a_3` (`WLsTCIubwerJKXtlrenC`) |
| `fractals/arbreAcc.mp3` | A short rustle of a leafy branch swaying once in the wind, close | `05b_3` (`m6yUW4fVgBnsr267ImeC`) |
| `fractals/riuAmb.mp3` | A wide calm river flowing gently, soft steady water murmur over sand and pebbles, peaceful, no music | `06a_2` (`k3t8BtFLXjLOTCvpB4eA`) |
| `fractals/riuAcc.mp3` | A small trickle of water, a short gentle babble of a little stream over stones, close | `06b_2` (`Ev7dK7pc8JYWWJSokqtF`) |
| `fractals/corallAmb.mp3` | Underwater coral reef ambience, soft muffled water, gentle bubbles rising, faint crackling of tiny reef creatures, calm, no music | `07a_3` (`rBaw8P4SdylTlvtrTTp5`) |
| `fractals/corallAcc.mp3` | A few small air bubbles rising underwater, soft round blub sounds, close | `07b_3` (`TaGCL66p5QIAWKTbempY`) |
| `fractals/romanescoAmb.mp3` | A quiet vegetable garden early in the morning, a soft breeze through big cabbage leaves, a few distant birds, calm, no music | `08a_3` (`xFzcK4gsDKrak8CCC5Qe`) |
| `fractals/romanescoAcc.mp3` | Crisp fresh cabbage leaves gently rubbing together, a short soft squeaky leafy crunch, close | `08b_2` (`pFlPfx5e6HWafFMc5Obl`) |
| `fractals/neuronesAmb.mp3` | A slow calm heartbeat and soft breathing heard from inside the body, warm, muffled and peaceful, no music | `09a_2` (`E1N7edaTsD9eLxrGEEPd`) |
| `fractals/neuronesAcc.mp3` | A tiny soft electric tick, a gentle little spark of electricity, short and quiet | `09b_3` (`kYsKOHYBzSuvqiuazmgi`) |
| `fractals/costaAmb.mp3` | Gentle waves washing slowly onto a sandy shore, calm sea, one seagull calling far away, peaceful, no music | `10a_2` (`NbeHPepQh0vMW5GhCXW5`) |
| `fractals/costaAcc.mp3` | One small wave lapping onto pebbles and pulling back, short and soft | `10b_3` (`V1JRod0SFPpHwEG6t6xx`) |
| `fractals/fullaAmb.mp3` | Light gentle rain falling on large green leaves in a garden, soft patter, no thunder, calm, no music | `11a_2` (`Ar5gRhMZRIrRt3dVuBE2`) |
| `fractals/fullaAcc.mp3` | A single water drop falling onto a leaf, one soft clear tap | `11b_3` (`3GlFzIMvqiONJuEdHUvz`) |
| `fractals/gelAmb.mp3` | A cold quiet winter night, frost slowly forming on a glass window pane with faint delicate crackling, soft distant wind, no music | `12a_1` (`ujgdpvsfjqvc5OcAyXXt`) |
| `fractals/gelAcc.mp3` | Thin ice crackling softly, a short crisp delicate crack, close and quiet | `12b_1` (`vpk8Jd8zRbdXvVRvwIe3`) |
| `fractals/nautilusAmb.mp3` | Deep calm ocean ambience, slow soft underwater swell, a very faint distant whale song, peaceful, no music | `13a_1` (`zm68BDtPW7VetgNYMAJr`) |
| `fractals/nautilusAcc.mp3` | A soft underwater swoosh, as of a shell gliding slowly through the water, gentle | `13b_2` (`NoR2dYV5CS6yBd9xuvF7`) |
| `fractals/miceliAmb.mp3` | A quiet forest floor at night, damp moss and soil, faint creak of old wood, tiny crickets far away, calm, no music | `14a_2` (`hqfBW1Dj1yIMynBrah55`) |
| `fractals/miceliAcc.mp3` | A soft crunch of damp leaves and soil, gentle and close, short | `14b_1` (`k7ECtapvv8coBE7iSX4P`) |
| `fractals/fangAmb.mp3` | A hot dry afternoon over cracked earth, a warm gentle wind, faint cicadas far away, calm, no music (filtre passabaix de 7 kHz) | `15a_2` (`CvM3ZmRW1VHhkFdSTSo1`) |
| `fractals/fangAcc.mp3` | Dry mud cracking softly, a small brittle crack of drying clay, close | `15b_3` (`DYUiKEzqkwsdsIPwh2nD`) |
| `fractals/paoAmb.mp3` | A peaceful garden at dusk, a small fountain trickling softly, one peacock calling once far away, calm, no music | `16a_2` (`fIFSQDsb5satyuuzKWTR`) |
| `fractals/paoAcc.mp3` | A peacock's long tail feathers fanning open, a soft feathery shiver and rustle, close | `16b_2` (`hJtGMajxBjvnUdsRAPTd`) |
| `fractals/serraAmb.mp3` | High mountain wind blowing softly over rocky peaks, wide open space, one eagle crying far away, calm, no music | `17a_1` (`ZedO9HqwXG7oa3xzvDoq`) |
| `fractals/serraAcc.mp3` | A few small pebbles trickling down a rocky slope, short, soft and distant | `17b_1` (`Nhd3kKo02cPwhLhBBs0a`) |
| `fractals/arrelsAmb.mp3` | Underground among roots, slow water seeping and dripping through soil, soft low creaks of roots, muffled and calm, no music (filtre passabaix de 3 kHz (tons fixos aguts retallats)) | `18a_1` (`fltTIfUMAqoEUdZVQMz8`) |
| `fractals/arrelsAcc.mp3` | A soft low creak of a wooden root stretching in the earth, short and gentle | `18b_3` (`91fh1lbgEYjcsGTkrdOR`) |
| `fractals/petxinaAmb.mp3` | The soft ocean roar heard inside a seashell held to the ear, a gentle hollow whooshing sea sound, calm, no music | `19a_1` (`TTG6eoRX17BrpOezW6L7`) |
| `fractals/petxinaAcc.mp3` | Two small seashells clinking gently together, a light porcelain click, close | `19b_1` (`ZpsiR9pZfI7wWyACc2S6`) |
| `fractals/dentAmb.mp3` | A soft summer breeze across a meadow, gentle airy wind through grass, a few birds far away, calm, no music | `20a_2` (`gctmRGs7GSy3xptZGEyu`) |
| `fractals/dentAcc.mp3` | A gentle breath blowing on a dandelion clock, a soft airy puff, close | `20b_1` (`MXQ7FXqi6XerAHrKPPIG`) |
