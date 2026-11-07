# Scene 20 · `scene_19.glsl` · Eoraptor in the valley of Ischigualasto

## What happens
Dawn in the Late Triassic, about 231 million years ago, in the valley of Ischigualasto (San Juan, Argentina). The scene:
- a lilac sky hazed with volcanic ash, with long pink bands of ash;
- the low sun, pale through the haze, on the left beside a far volcano; its calm plume rises, bends and drifts slowly to the right;
- a far violet range, and a long wall of layered red cliffs across the right;
- rounded grey-green badlands in pale beds beyond a wide plain;
- on the plain, a river with the sky on it, green flats, small groves and two or three buttes;
- in front, a terrace of silt and sand with a block of layered sandstone, clumps of ferns, two clumps of horsetails and a tree of
  the seed fern *Dicroidium* on the right.

Scale: 0.60 screen units per metre. The animal is about 1 m long and stands about 0.9 m tall on the rock, head up.
- 0–3.6 s: a small, light *Eoraptor* forages among the ferns to the right of the rock. Its back shows above a low fern; its head is
  down among the fronds; it breathes and its tail sways. While the window opens (about 2.0–3.4) its skeleton shows through the
  growing flesh in the gap between the ferns.
- 3.8–4.25 s, **first beat**: its head and neck rise out of the ferns. The fronds around it part and swing back.
- 4.22–5.08 s: it looks round in three quick moves: back over its shoulder (4.22–4.32), up (4.62–4.72), then at the rock (4.98–5.08).
- 5.55–5.82 s: it crouches. The body sinks into the ferns, the neck reaches forward, its eyes on the rock.
- 5.80–5.88 s: it pushes off.
- 5.88–6.26 s, **key moment**: the leap, a smooth arc up and to the left onto the rock. The legs fold under it, then reach for the
  stone. The long tail lifts and swings to balance. The ferns it left swing back and forth (5.85–6.8).
- 6.26 s: it **lands** on the top of the rock. It takes the landing softly in its knees (6.26–6.9), with the tail swinging once
  and settling.
- 6.55–6.80 s: one small settling step with the back foot. The foot is set down again at 6.80.
- 6.9–7.6 s: it stands up tall on the rock. Its long shadow falls to the right across the top of the stone.
- 7.0–11.0 s, **echo**: it looks out across the valley:
  - first along it to the left, towards the sun and the volcano;
  - 7.7–8.3, it turns its head away from us into the far valley, with a small tilt at 8.45–9.1;
  - 9.2–9.8, it turns back and lifts its head a little towards the plume;
  - 10.1–10.7, it turns into the valley again, with a tilt the other way at 10.75–11.4.
- 11.2–12.4 s: it settles, head half turned. From then to the end it is calm: breathing, a slow sway of the tail, blinks. The
  plume drifts. This is a quiet end for the climb back to the garden.

## Sound cues
All times are on the **shader clock (uTau)**, in seconds. The sound engine adds its own 0.3 s lag (a still rendered with the
frames tool as `20,T` shows uTau = T − 0.3). No voice at all: only steps, rustles and the landing.
| t (s) | event | sound wanted |
|---|---|---|
| 0–end | ambience | a still dawn: a faint breeze through ferns, very calm. No birdsong (there were no birds yet) |
| 3.82–4.25 | head rises out of the ferns | a soft rustle of fern fronds parting, fading as they swing back (to about 4.6) |
| 4.25, 4.65, 5.02 | quick looks round | optional: three tiny brushes of fronds against the neck, very faint |
| 5.55–5.82 | crouch | a low soft rustle as the body sinks into the ferns |
| 5.80–5.88 | push-off | a quick scuff of two feet on sandy silt, with a brisk rustle |
| 5.85–6.6 | ferns spring back | a fading swish of fronds |
| 5.88–6.26 | in the air | nothing (the end of the fern swish) |
| 6.26 | **landing** on the sandstone | a soft double thump of two small feet with a light scrape of claws on stone |
| 6.30–6.70 | grit | a few grains of grit trickling off the rock (very faint) |
| 6.55 / 6.80 | settling step | the back foot lifts (silent) and is set down with a tiny claw tap at 6.80 |
| 7.0–end | looking out | silence apart from the ambience |

## Camera
The default drift goes right and pushes in 4 %. This scene would be better with a **small pull-back and a drift left, towards the
rock**: in `POU_POSES[19]`, for example `[0,PY(19),1,.15,-.03,0,.05]` instead of `[0,PY(19),1,.15,.03,0,-.04]`. That would open
the valley around the small animal while it stands on the rock (7–11 s), and end wide and still before the climb. I have not
changed `dist/pou.js`. The scene's content reaches well past the frame on every side, so a 5 % pull-back shows nothing unfinished.
In portrait the animal stays readable (checked at 540×960).

## Evidence followed
- *Eoraptor lunensis* (Sereno, Forster, Rogers & Monetta 1993, *Nature* 361), described fully by Sereno, Martínez & Alcober 2013
  (*SVP Memoir* 12). It comes from the Ischigualasto Formation, San Juan, Argentina. The Formation is Late Triassic (Carnian) and is
  dated to about 231 Ma on the volcanic ash beds within it (Rogers et al. 1993; Martínez et al. 2011).
- Body:
  - a small, lightly built biped, about 1 m long (about 10 kg);
  - long hind legs with a long shin and slim three-toed feet, the first toe small and high;
  - a long tail, about half the length of the body;
  - a light skull with a large antorbital opening and orbit;
  - short arms with a five-fingered hand: three long grasping fingers with curved claws, the fourth and fifth small.
  The fossil and the bones under the growing flesh show these features.
- Teeth: Eoraptor had both leaf-shaped and recurved teeth. Here they are covered by lips, because the mouth is always closed (the
  brief's rule).
- It is an early saurischian, now often placed near the base of the sauropodomorphs (Martínez et al. 2011). That fits an animal
  that forages close to the ground among ferns, as here.
- The land: a river floodplain with a seasonal climate. Volcanic ash falls were frequent, and their tuffs are interbedded in the
  Formation. Plants of the Formation:
  - the seed fern *Dicroidium* (a corystosperm with forked fronds);
  - horsetails (*Neocalamites*-type);
  - ferns;
  - conifers.
  The grey-green mudstones and sandstones of the Ischigualasto badlands are its rocks today.

## Unverified / artistic choices
- Colours and pattern (an ochre-brown back, paler flanks, a cream belly, a dark stripe through the eye, an amber eye) are invented.
  So is the fine scale texture: no skin of Eoraptor is known.
- The landscape mixes today's view with the Triassic one, as the brief asked. The red cliffs (today the younger Los Colorados beds)
  and the layered badlands evoke the place. In Eoraptor's time the basin was a floodplain between fault-block highlands, so these
  are drawn as far layered heights. The volcano and its plume are staged: the ash beds show that eruptions happened, not where.
- The leap onto a rock about 0.36 m high is a plausible small biped's jump, staged and quicker than a ballistic arc would be. The
  looking-out is animal behaviour without meaning. It has no voice.
- Dawn light and the lilac ash haze are artistic.

## Frame time
Measured pinned to one core (`taskset -c 2`) at 960×540, interleaved with the reference scene 1. Scene 1 took 3.7–4.4 s in the
quieter runs; other painters were rendering at the same time, so single frames vary by about ±0.5 s.
- Heaviest moments, the skeleton under the growing flesh (2.8–3.3) and the leap (6.3): 2.3–3.7 s, typically 3.3–3.5 s.
- Standing on the rock (7.5–13.5): 2.3–2.8 s.
- So about 0.8–0.9× the reference at the heaviest moment and about 0.6× most of the time.

Code: 11 PIECE call sites (sky, ground, Dicroidium, horsetails, ferns, rock, far limbs, body, near limbs, bones, fossil), plus one
eye. The ferns' function is called twice, behind and in front of the animal, so 12 once inlined.
- The far landscape (the volcano, the plume, the ranges, the cliffs, the badlands and the plain) is painted with `veil`.
- Bones are computed only while the flesh grows. Where the flesh has not yet reached, nothing past the bones is evaluated.
- Everything has bounding boxes.

## Checks done
- The fossil at 1.7 (it comes into view as the camera arrives).
- The window at 2.2, 2.6 and 3.0; rest at 3.6.
- The beats at 4.5, 5.1, 5.75, 6.05, 6.25, 6.35, 6.45, 6.6, 7.0, 7.5, 8.9, 10.3, 11.6 and 13.5.
- `wait`: for the last scene this shows the garden, as the app intends.
- `dim`, `none`, `none,white`, and a 540×960 portrait.
- No compile errors, and no reserved words used as names.
