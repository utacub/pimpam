# Scene 8 (scene_07.glsl): Abditosaurus kuehnei, the titanosaur of the Pyrenees

## What happens

A misty morning in a river of the delta of the Tremp basin, about 70.5 million years ago. The sun is low on the left behind a thin veil
of mist; the river is turquoise; the far bank on the right is a cut bank of red clay with fan palms, slender conifers and round-crowned
broadleaf trees on top; low hills of the rising Pyrenees are faint in the distance. On the near bank: pale sand on the left (where a
titanosaur nest is buried), red clay on the right, ferns and horsetails in the corners.

The titanosaur (about 17.5 m; .070 screen units per metre, the whole animal in the frame at every moment) stands in the shallows, its
legs in the water, its reflection under it. At rest its head hangs low inside the river mist.

- 0–4 s: rest. Slow breathing (the chest swells), the tail sways, the eye blinks, the mist drifts, the water ripples.
- 4.2–6.8 s: it lifts its long neck slowly out of the mist (the head leads, the neck follows); the head is clear above the mist by ~5.5 s.
- 6.0 s, **the key**: a deep closed-mouth rumble (5.85–7.2 s): the throat at the base of the neck swells, a small nod, and three rings
  tremble out on the water from its front legs.
- 7.0–9.3 s: four slow steps forward (about 1.1 m) in a lateral sequence: near hind, near fore, far hind, far fore. The neck relaxes a
  little. Its push sends a small soft wave across the river towards the near bank.
- 8.8–10.9 s, **the echo**: the wave runs up the sand over the buried nest (a thin sheet of water with a foam edge); as it draws back it
  washes the sand off the top of five round white eggs with a nodular shell (Megaloolithus), which stay half-buried, wet and shining a
  little; the washed sand stays darker and dries slowly.
- 10.5–11.6 s: it lowers its head to the river and drinks (the mouth touches the water at 11.45 s: rings).
- From 12.6 s on, calm: every 5.2 s it lifts its head a little (12.6–13.5), three drops fall from its chin, and it dips again. Breathing,
  blinks, tail, mist, water go on.

## Audible events (seconds on the scene's clock)

The times are on the scene's own clock (the shader's `uTau`). The app's clock wakes over the first 0.6 s after the press, so they are
about 0.3 s earlier than the seconds since the press (the frame tool renders `T` = clock + 0.3). If the sound runs on the same clock
as the picture, use them as written.


| t (s) | event | sound wanted |
|---|---|---|
| 0–14 | ambience | a slow river flowing over gravel, soft lapping at the near bank, a faint morning hum of insects; no birdsong |
| 3.9 | first beat: a deep slow inhale | a huge, soft, airy breath in through the nose (low, unhurried) |
| 4.2–6.0 | the neck rises out of the mist | a long soft exhale through the nostrils, almost a sigh; very light skin creak optional |
| **6.0–7.2** | **the key: closed-mouth rumble** | a very deep closed-mouth rumble/boom, felt more than heard (40–80 Hz), swelling in 0.3 s and fading by 7.2 s; never a roar |
| 6.05, 6.41, 6.77 | rings tremble on the water at its feet | three faint low water shivers synced with pulses in the rumble |
| 7.00 | near hind foot lifts out of the water | water sucking off a heavy foot, a few drips |
| 7.85 | near hind foot comes down | very heavy, soft, slow step into shallow water: a deep muffled thud with a slosh |
| 7.45 / 8.30 | near fore foot lifts / comes down | same, a little lighter |
| 8.00 / 8.85 | far hind foot lifts / comes down | same, softer (further) |
| 8.45 / 9.30 | far fore foot lifts / comes down | same, softer |
| 7.6–8.8 | the small wave crosses the river | a soft rolling slosh moving towards the listener |
| **8.85–9.40** | **the echo: the wave runs up the sand over the nest** | a gentle swash on sand (foam fizz) |
| 9.6–10.9 | the backwash uncovers the eggs | a trickle of water draining back through sand, grains shifting; a tiny soft "reveal" sparkle is acceptable if it is not a chime |
| 10.5–11.4 | the neck goes down | a soft exhale |
| 11.45 | the mouth touches the water | a gentle plop and lapping |
| 11.6–12.5 | it drinks | slow deep gulps (2–3), muffled |
| 13.75, 14.08, 14.41 (then every 5.2 s) | drops fall from the chin | three small drips into the river |
| 14.95 (then every 5.2 s) | it dips its mouth again | a soft lap |

## Camera

The default drift for this stimulus (3 % sideways to the left, 4 % zoom in) suits it: the animal walks left and lowers its head on the
left. Everything (raised head at y ≈ .40, tail tip at x ≈ .55) stays inside the final framing (16:9 and 4:3).

## Evidence followed and what is unverified

- Abditosaurus kuehnei: Vila, B., Sellés, A., Moreno-Azanza, M., Razzolini, N. L., Gil-Delgado, A., Canudo, J. I. & Galobart, À. (2022).
  A titanosaurian sauropod with Gondwanan affinities in the latest Cretaceous of Europe. Nature Ecology & Evolution 6: 288–296. Locality
  Orcau-1 (Tremp basin, Pallars Jussà), about 70.5 Ma, about 17.5 m and 14 t (body length and mass as given there).
- The skull of Abditosaurus is not known well enough to draw: the head follows other titanosaurs (Tapuiasaurus, Sarmientosaurus): a rounded
  skull, a long low squarish muzzle, nostrils set back on top. **The head is drawn about 1.3 × life size** so that the eye and mouth read
  at this scale (an artistic liberty).
- Body plan: generic derived titanosaur: wide barrel body, the shoulders standing higher than the hips, columnar forelimbs ending in a round pad without fingers or claws (derived
  titanosaurs lost the manual phalanges), hind feet with three claws, a relatively short tail held off the ground, the neck raised high
  in the key moment (a posture within the range proposed for sauropods). Proportions are approximate.
- Skin: polygonal scales bigger on the body and smaller on the neck and head (sauropod skin impressions, e.g. the embryos of Auca Mahuevo
  and adult impressions); countershading is an assumption. **Osteoderms: none are reported for Abditosaurus as far as I know (to verify)**;
  a sparse double row of low, subtle bosses is drawn because other titanosaurs had them (Saltasaurus; Ampelosaurus of the same island).
- Closed-mouth rumble: non-avian dinosaurs probably used closed-mouth vocalisations (Riede et al., 2016, Evolution 70: 1734–1746); the
  water rings are an artistic sign of the low sound.
- Eggs: Megaloolithus, round, 15–20 cm, nodular shell, laid in clutches buried in sand or soft sediment; the Coll de Nargó nesting sites
  (Vila et al., 2010, PLoS ONE 5(5): e10362, "3-D modelling of megaloolithid clutches") are in the same Tremp Formation red beds.
  **Whether the Coll de Nargó eggs are of the same age as Abditosaurus (about 70.5 Ma) is to be verified**, as is the attribution of these
  eggs to titanosaurs in general (made on Megaloolithus patagonicus with titanosaur embryos at Auca Mahuevo). The eggs are drawn about
  2–3 × the size the perspective strictly allows at their distance, so that they read.
- Flora: fan palms (Sabalites-type leaves are reported from the Maastrichtian of the southern Pyrenees: to verify), conifers, broadleaf
  angiosperm trees, ferns and horsetails; no grass. The turquoise colour of the river is artistic (a clear carbonate river, like those
  of the Pyrenees today). Red clays with grey-green mottles: the floodplain palaeosols of the Tremp Formation.
- No other animals are shown (to avoid uncertain coexistences).

## Measured frame time (SwiftShader, 960×540)

The machine was shared and heavily loaded while I measured (load average 3–7 on 4 cores), so absolute times wander. Under the same load
the heaviest moments (3.0 s: fossil + growing flesh; 9.6 s: swash + rings + walking) took 1.06–1.1 × the time of the reference
tyrannosaur frame (5, 6.0 s): about 1.2–1.4 s per frame by the brief's yardstick. Quiet measurements: 1.06–1.32 s (6.2 s and 9.6 s).

## Revision after the coordinator's review

The mist now stays behind the body (in front it only lies low over the water and the legs, and around the resting head until it lifts);
warm rim light of the low sun on the top edges of the neck, back and tail; darker belly and underside of the neck with a little turquoise
light bounced from the river; darker far legs; soft folds behind the shoulder, behind the elbow and in front of the hip; no dark claw
above the water; forelimbs about 10 % longer and the shoulders lifted over the hips; the portrait ferns vary in size, angle, hue and
number of fronds. The neck and the tail are now smooth tubes along an exact quadratic Bézier (the polyline of the shared `sdTube`
showed as bands in the light on the bent neck). Frame time after the revision: 1.1–1.3 s at 6.3, 9.5 and 13.5 s in quieter moments
(load average about 4).

## Shared files

Nothing needed. Technique note for the others: on thin parts (necks) the engine's normal from screen derivatives steps in 2×2 blocks; I
call `piece()` directly with a smooth gradient built from each part's own axis (the neck's Bézier, the body ellipse, the legs' bones).
