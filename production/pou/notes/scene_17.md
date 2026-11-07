# Scene 18 (scene_17.glsl): Brachiosaurus and Diplodocus on the Morrison plain

## What happens

The Morrison plain, western North America, about 152 million years ago. It is a warm, hazy late afternoon:
- The sun is low and out of the picture on the left.
- High streaks of cloud are lit warm from below. Flat-topped mesas fade in the haze.
- The ground is a fern savanna. Dry ochre soil is broken by darker carpets of low ferns, with ferns and a cycad in the near corners.
- Small araucarias and narrow conifers stand far off on the plain.

A tall araucaria stands at x ≈ .40, in depth between the two animals:
- Its trunk is straight and bare, with a few dead stubs.
- Its crown is a broad dome (y .40–.83) of irregular tiers of branch pads. The pads go to each side and towards us (foreshortened), each a hanging mass of rope-like shoots. Each pad is lit on top and towards the sun and shaded underneath. The edge on the sun side glows a little.
- Its lowest branch sticks out to the left, at y ≈ .44–.49. This is the branch the brachiosaurus strips.

**The brachiosaurus** (Brachiosaurus altithorax, about 20 m long, .058 screen units per metre) stands side-on in the left half, facing right:
- The shoulders are high, the back slopes down to the hips, and the tail is short and thick.
- The neck is long and raised. The head is the brachiosaur type: a raised arch over the nose, a broad muzzle, and the fleshy nostril low and forward on the muzzle.
- The skin has small polygonal scales, a few pixels across. The back is a warm grey-brown and the belly pale buff, with soft darker blotches and dusty lower legs.
- The light: a warm rim of the low sun along its edges on the left, a darker belly, warm light bounced up from the ground, darker far legs, and soft folds at the base of the neck, behind the shoulder and in front of the thigh.

**The diplodocus** (.032 per metre, further back, right half) walks slowly to the left from 3.6 s:
- It sweeps its square muzzle low over the ferns from side to side.
- Its long tail ends in a thin whip.
- Each footfall raises a small puff of dust.

The timeline (scene clock):
- **0–3.6 s, rest.** The brachiosaurus stands with its neck forward and its head a little down, breathing and looking about. The diplodocus grazes in place. The window opens on the fossil: the brachiosaurus's skeleton as it stands at the start.
- **3.6–5.0 s.** The brachiosaurus lifts its neck to the low branch, its mouth just short of the tip. The diplodocus starts to walk (first footfall 4.5 s).
- **4.95–5.35 s.** It takes the tip of the branch in its mouth.
- **5.45–5.95 s, the key.** It pulls its head back. The branch bends towards it and the leafy shoots of the outer part tear off (5.80–5.98 s).
- **5.95 s.** The bare branch springs back: a damped swing at about 1.25 Hz, settled by about 7.5 s. Shoots and needles flutter down from it (5.6–9 s).
- **5.95–6.55 s.** It draws its head back and down a little with a sprig hanging from its mouth.
- **6.05, 6.45, 6.85 s.** Three cropping bites work the sprig in; the sprig shortens at each.
- **7.0–8.2 s.** A swallow (a bulge) runs down the neck to the chest.
- **8.0–9.2 s.** It settles to a resting pose.
- **9.3–9.8 s.** The diplodocus lifts its head (it lowers it again 10.8–11.6 s).
- **9.4–10.6 s, the echo.** The brachiosaurus gives a soft deep rumble with its mouth closed. The throat at the base of the neck swells, and it looks down towards the diplodocus.
- **9.55–10.95 s.** The diplodocus answers with a slow swish of its whip tail: the whip swings round towards us and back.
- **10.6–12.6 s.** The brachiosaurus raises its neck high (head at about 13 m) into the side of the crown. The camera drifts up with it.
- **From 12.6 s.** It crops a shoot there about once a second.
- **Calm by 13 s.**

## Audible events (seconds on the scene's clock)

The times are on the scene's own clock (`uTau`). **They are about 0.3 s earlier than the seconds since the press** (the frame tool renders `T` = clock + 0.3).

| t (s) | event | sound wanted |
|---|---|---|
| 0–14 | ambience | a warm, dry breeze over the plain; a soft rustle in the araucaria; faint distant insects. No birdsong, no frogs. |
| 3.6–5.0 | the brachiosaurus lifts its neck | a long, soft, deep exhale |
| 4.95–5.35 | it takes the branch tip | a light rustle of shoots |
| **5.45–5.95** | **the key: it strips the shoots** | a tearing rustle of leafy shoots pulled off a branch, rising to 5.9 |
| **5.95** | the branch springs back | a woody swish and a shaking rustle, dying away over about 1.5 s |
| 5.6–9.0 | shoots and needles fall | a very faint patter (optional) |
| 6.05, 6.45, 6.85 | three cropping bites | soft crunches of fresh shoots; no grinding or chewing |
| 7.0–8.2 | the swallow | one deep, soft gulp at about 7.1, then a low gurgle going down |
| 4.5, 7.1 | diplodocus near hind foot comes down | a soft, distant, heavy thud (felt more than heard) and a little dust hiss |
| 5.15, 7.75 | near fore foot | the same |
| 5.8, 8.4 | far hind foot | the same, softer |
| 6.45, 9.05 | far fore foot | the same, softer |
| 3.6–9.3 | the diplodocus sweeps its head over the ferns | a quiet, intermittent brushing of fronds |
| **9.4–10.6** | **the echo: the brachiosaurus's rumble** | a very low, closed-mouth rumble (felt more than heard); swelling 9.4–9.75, held, fading 10.05–10.65; never a roar or growl |
| 9.55–10.95 | the diplodocus swishes its whip tail | a slow, airy whoosh; **no crack** |
| 10.6–12.6 | the brachiosaurus raises its neck into the crown | a long exhale; the crown rustles as its head reaches it (12.0–12.6) |
| 12.6 onwards | it crops shoots in the crown | soft, quiet crunches about once a second, under the ambience |

## Camera

The brief's drift is kept: up .30, 6 % wider, so the final framing is y −.23…+.83 and x ±.94.
- **Brachiosaurus:** tail tip at x ≈ −.78; front of the chest at about −.08; head at the branch at about .17 (y .49). The raised head at the end is at x ≈ .14, y ≈ .64, inside the final frame with room above. Its feet are at y ≈ −.17.
- **Araucaria:** the crown's domed top reaches .83, the top edge of the final frame. It is cut by the frame earlier (decor).
- **Diplodocus:** hip goes from x .62 to .52. The whip tip ends at about .88. The head sweeps between x ≈ .21 and .34.
- **4:3 (|x| ≤ .67):** the key action (the head, the branch and the tree), the brachiosaurus's body and the diplodocus's head and body are inside. The brachiosaurus's tail tip and the diplodocus's tail are cut.
- **Portrait (540×960), checked:** the key (head, branch, crown) and most of the brachiosaurus are inside |x| ≤ .62. The end of its tail runs out to the left and the diplodocus is half cut on the right. The sky fills the top and a dense fern carpet the bottom.

## Evidence followed and what is unverified

- **Brachiosaurus altithorax** (Riggs 1903; holotype FMNH P25107). Brushy Basin Member, Morrison Formation, Kimmeridgian–Tithonian.
  - Taylor 2009, J. Vert. Paleontol. 29: 787–806, separated it from Giraffatitan. The trunk proportions (long forelimbs, high shoulders, a long, deep trunk) follow his comparison.
  - The head follows the Felch Quarry skull referred to Brachiosaurus (USNM 5730; D'Emic & Carrano 2020, Anat. Rec. 303: 732–758), with the nasal arch lower than Giraffatitan's.
- **Nostril:** fleshy, low and forward on the muzzle (Witmer 2001, Science 293: 850–853).
- **Neck posture is debated.**
  - A raised neck follows Taylor, Wedel & Naish 2009, Acta Palaeontol. Pol. 54: 213–220.
  - Stevens & Parrish (1999, Science 284: 798–800; 2005) argued for a lower neutral posture.
  - The scene keeps the neck at about 50–60° and raises it to the crown only for a short browse.
- **No chewing.** Sauropods bit and swallowed without chewing (Sander et al. 2011, Biol. Rev. 86: 117–155). Brachiosaurids had chisel-like teeth with wear from tooth-to-tooth occlusion, a cropping bite (Upchurch & Barrett 2000). The brief's "chews" is therefore three **cropping bites** and a whole swallow; the sound should be crunching bites, not grinding.
- **Diplodocus** (Morrison Formation, Brushy Basin Member and others):
  - The square muzzle and low browsing follow Whitlock 2011, PLoS ONE 6: e18304.
  - The long whip tail follows the skeletons.
  - Its use is debated. Myhrvold & Currie 1997 (Paleobiology 23: 393–409) proposed a supersonic crack; Conti et al. 2022 (Sci. Rep. 12: 19900) found the tail could not reach it; Baron 2021 (Hist. Biol. 33: 2057–2066) proposed a tactile tail. The scene shows only a slow swish, no crack.
- **Coexistence:** both are known from the Brushy Basin Member of the Morrison Formation (Foster 2007, *Jurassic West*).
- **Flora:** a semi-arid fern savanna, with trees concentrated along watercourses (Parrish et al. 2004, Sediment. Geol. 167: 137–162). Morrison conifers include araucarian wood and foliage. Araucaria is energy-rich sauropod food (Hummel et al. 2008, Proc. R. Soc. B 275: 1015–1021; Gee 2011).
- **Unverified or invented:**
  - Stripping a branch by pulling is plausible, not attested.
  - The diplodocus's tail swish as an answer is behaviour invented for the story. So is the rumble; low-frequency calls are speculation.
  - The skin of either animal is unknown. The polygonal scales follow sauropod skin impressions generally, and are drawn far larger than real ones (real ones are 1–3 cm) so that they read on screen.
  - The colours are invented: plain countershading, no display colours.
  - The head is drawn 1.25× life size so that it reads at this scale.
- **Brief rules:** no predation, no roars, no scary sounds; no text. Colour changes are slow (only the light); there are no stripes and no camera shake.

## Measured frame time (960×540, `tools/pou-frames.mjs`, least of the runs, same run as the reference 5, 6.0)

| frame | time | reference 5, 6.0 |
|---|---|---|
| 18, 6.3 (the key) | 1.13 s | 1.04–1.21 s |
| 18, 4.4 | 1.11 s | |
| 18, 9.9 | 1.07 s | |
| 18, 13.3 | 1.00 s | |
| 18, 2.8 (window opening) | 1.54 s | |
| 18, 1.9 (fossil) | 1.61 s | scene 5's own 1.9 frame: 3.1 s (the shared rock dominates) |

Every frame after the window opens is at about 0.9–1.05× the reference; the fossil frames are cheaper than the reference scene's own.

## Changes made in this pass

- **The araucaria** was first a regular "bottle brush" of tiers, then a crown of separate discs. It is now irregular tiers of drooping branch pads with ragged ends, a domed top, limbs in the gaps and the low branch as one hanging mass of shoots that is stripped.
- **The fern carpets:**
  - Clumped: dense, larger ferns in the patches and few on bare soil.
  - The rows are broken up with a jitter of about half a row.
  - The patch ground itself is a darker carpet.
- **The brachiosaurus:** the scales are larger and softer-edged, and it moved .04 to the right. The diplodocus's skin is hazier and warmer.
- **The diplodocus:**
  - Its whip was pulled in (the tip ends at about .88).
  - Its steps now start at 3.6 s (rest until then) and end by 9.05 s, before the echo.
- **The feeding:** chewing was replaced by three cropping bites (see the evidence above).

## Shared files

Nothing was edited. Suggestions:
- **The shared tail calls `life()` for every pixel once `uLife` > .001.** This scene (as scenes 12 and 13) returns early outside its own copy of the window. Doing that once in the shared tail would save time in every scene.
- **`K_SCALE` has strong dark cell borders** (×.66) and ±17 % brightness per scale. On big pale animals they read as crazing. This scene partly undoes them locally (a matching `voro` lookup). A softer border, or a parameter for it, would help every scaly animal.
