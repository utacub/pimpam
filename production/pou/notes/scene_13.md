# Scene 14 · `scene_13.glsl` · Yutyrannus shakes off the rain; a Sinosauropteryx runs past

All times are on the **shader clock (uTau)**, in seconds; the sound engine adds its own 0.3 s lag.

## What happens
A forest of conifers and ginkgos beside a lake in Liaoning, just after the rain. Pearl-grey light, mist lying on the water and among
the trunks, a volcanic cone and low hills faint in the haze, wet mud with puddles of sky, horsetails and ferns on the shore. A ginkgo
branch hangs into the top-left corner; drops swell at its leaf tips and fall; thin drops fall from the canopy now and then; rings
spread on the lake and the puddles. A *Yutyrannus huali* (about 9 m, scale .14 screen units per metre) stands on the shore facing left.
Its long filaments are soaked: the coat is dark, clings to the body and hangs in pointed clumps; water drips from the clump tips.

- 0–3.5 s: rest (slow breathing, slow glances, blinks, drips from the coat).
- 3.55–3.9 s, **first beat**: a big drop falls from the canopy onto its head (splash at 3.9). It blinks hard and flinches (3.9–4.45).
- 4.25–4.6 s: it braces itself (the knees bend a little, the head dips).
- **4.6–6.4 s, key moment, the shake (like a wet dog)**: a wave of shaking at about 2.4 a second runs from the head (4.6–5.45) to the
  body (4.85–5.95) and the tail (5.15–6.4). The clumps fly out and swing; drops fly off in arcs, first from the head, then from the
  body, then from the tail, and fall; a fine mist of spray hangs round each part as it shakes (4.6–7.0).
- 6.3–8.0 s: the coat, now much drier, fluffs up (6.3–6.9: lighter, warmer brown, a soft ragged outline) and settles (7.0–8.0, a small
  wobble at 7.3).
- 6.45–6.85 s: one small step of the near foot to steady itself (the foot lands at 6.85).
- **8.6–10.2 s, echo**: a little *Sinosauropteryx prima* (chestnut back, pale belly, dark mask through the eye, long tail with
  low-contrast rings) runs across the shore in front of it, from right to left, and is gone.
- 10.5–11.3 s: the Yutyrannus turns its head down and forward to look after it; 12.2–13.0 it raises it again. Calm from 13 s.

## Sound cues (shader clock, s)
| t (s) | event | sound wanted |
|---|---|---|
| 0–end | ambience | after-rain forest by a lake: soft drips from leaves, a distant trickle, very light breeze; no rain |
| 0–4.6 | drips from the coat | occasional heavy drops falling from the animal into mud (about one a second, irregular) |
| about every 2 s | leaf drops (top left) | a single small drop falling on leaves/mud now and then |
| 3.9 | **drop on the head** | one fat drop landing with a small "plip" on skin |
| 3.9–4.3 | flinch | a short soft snort/exhale through the nose (closed mouth) |
| 4.6–5.45 | head shake | a fast flapping rustle of wet filaments, water flung off ("frrrp") |
| 4.85–5.95 | **body shake** | the big wet-dog shake: a heavy "brrrrr" of a soaked coat, with a burst of spray |
| 5.15–6.4 | tail shake | the same, lighter, travelling away to the tail |
| 4.7–6.8 | spray falling | a shower of drops pattering onto the mud and the ferns around it, dying away |
| 6.3–6.9 | coat fluffs up | a soft dry fluffing |
| 6.85 | footfall | one heavy but soft step in wet mud (a squelch) |
| 7.3 | settle | a light shiver of the filaments |
| 8.6–10.2 | **Sinosauropteryx runs past** | quick, light pattering steps on wet ground (about 10 a second), a faint splash or two, from right to left |
| 10.5–11.3 | head turns | a slow soft rustle of the neck filaments; a calm breath |
No calls, no roar, no open mouth.

## Camera
Default drift is fine. The head is on the left; the little one runs along the bottom third between 8.6 and 10.2.

## Evidence followed
- *Yutyrannus huali* (Xu et al. 2012, Nature 484: 92–95): a 9 m tyrannosauroid from the Yixian Formation of Liaoning (about 125 Ma),
  with long filamentous feathers (up to about 15–20 cm) preserved on the neck, arm, hip and tail. Skull about 90 cm with a low midline
  crest; three-fingered arms. Lips cover the teeth (Cullen et al. 2023).
- *Sinosauropteryx prima* (Ji & Ji 1996), Yixian Formation (Sihetun, about 124.6 Ma): small compsognathid with a very long tail.
  Colours from melanosomes: chestnut/rufous with a banded tail (Zhang et al. 2010), countershading and a "bandit" eye mask (Smithwick
  et al. 2017).
- Setting: Yixian lake deposits with volcanic ash beds; flora with conifers, ginkgoaleans, horsetails and ferns.
- The shake: wet mammals shake at a frequency that falls with body size (Dickerson et al. 2012); about 2.4 Hz chosen for a 1.4-tonne
  animal. Inferred behaviour; no fossil evidence.

## Unverified / to check
- **That both animals lived at the same place and time is still to verify.** Both are from the Yixian Formation, but from different
  localities and beds; the exact horizon of *Yutyrannus* (specimens from the fossil trade) is uncertain.
- Colours and pattern of *Yutyrannus* (brown, darker back, pale belly), its crest colour, how far down the legs the feathers went.
- The ginkgo leaves are drawn like the modern fan (Early Cretaceous ginkgos had more divided leaves); the conifers are generic.
- The dog-like shake, the wet clumped coat and the drips are an artistic inference.

## Frame time
Measured single-core (`taskset -c 2`) at 960×540, second frames only, interleaved with scene 1 (the brief's reference: "about
1.0 s"). After the coat rework, scene 1 took 3.7–4.2 s in those runs.

| moment | this scene | ratio to scene 1 |
|---|---|---|
| fossil to life (2.5) | 3.9 s | about 1.0× |
| skeleton phase (3.0–3.4) | 4.0–4.6 s | about 1.0–1.1× |
| the shake (5.6) | 4.0 s | about 1.0× |
| dried and fluffed (7.6) | 3.6–4.1 s | about 0.97× |
| both animals (9.4) | 3.2–4.1 s | about 0.9–1.0× |

Before the coat rework (same day, same method): 4.0 s (2.5), 4.6 s (5.6), 3.6 s (7.6) and 3.1 s (9.4), against 3.7 s for scene 1.
The earlier speed pass is unchanged (it took the scene from 16 to 12 PIECE call sites).

The speed pass made these changes; the look is unchanged (frames before and after differ only by dither noise):
- Bounding boxes on every far and near conifer and ginkgo. Before, all 14 trees ran their noise on every pixel.
- Bounding boxes on the hanging ginkgo branch and on the fern and horsetail clumps.
- Ferns and horsetails: one plant piece per place instead of two.
- The near trunks and the forest floor are painted with `veil`, with the same light, instead of pieces.
- The far leg of *Sinosauropteryx* joins its coat piece.
- The Yutyrannus coat is skipped where the flesh has not yet grown from the bones.

## The coat (final review fix)
The coat of long filaments is painted in the scene, not in the shared fur texture:
- It flows down and a little back, with a gentle warp, so no rows or grid show.
- It is laid in locks: long ribbons that swell and taper to points, in two staggered layers, with darker partings.
- Fine strands, about 3 px wide at 960×540, run along each lock and gather where it narrows. They fade below 2 px.
- Soaked (to 4.75 s): narrow clumps, three strands across, deep partings, a cool sheen along their middles.
- Dried and fluffed (from about 6.3 s): broad soft locks, five strands across, lighter tips.
- The shake swings the locks.
- The light comes from the smooth body under the coat, not from the ragged outline. That outline caused the coarse vertical bars.

The *Sinosauropteryx* texture scales were raised above two pixels, so it does not shimmer.

The fossil-to-life phase was fixed:
- the bones' quick bound is now an honest lower bound, exact wherever the growing flesh can reach, so no thin dark contour lines float near the tail or the hip;
- drips start only once the flesh is there.

No timing of any event changed.
