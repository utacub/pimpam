# Scene 9 · `scene_08.glsl` · Velociraptor in the dunes of the Gobi

## What happens
A single *Velociraptor mongoliensis* stands on the flat sand between dunes in a strong, low afternoon light. The sun is up on the left,
the sand is orange, the slip faces of the dunes are in lilac shadow, and sand streams off the crests and low over the ground, glowing
against the light. Scale: .70 screen units per metre (about 2 m from snout to tail; the body is the size of a turkey).

- 0–3.6 s: rest (breathing, quick bird-like head saccades, blinks, small tail sway).
- 3.7–4.6 s, **first beat**: it becomes alert. The head comes up and back and the small crest of head feathers lifts.
- 4.2–5.85 s, **key moment (display)**: the feathered arms rise and both wings open (11 flight feathers each: secondaries with a rufous
  base, dark primaries with pale tips). The tail frond fans 0.12 s later (4.34–6.05), showing one dark band and pale tips. The body leans
  back, the head rises and the crest stands up. Then everything folds. The feathers settle with a small damped wobble (5.85–6.5).
- 5.95–6.4 s: the weight goes forward and it shuffles its feet (two short steps).
- 6.4–7.15 s: it lowers itself onto the sand (the legs fold like a sitting bird's, the metatarsi flat).
- 6.95–9.5 s, **sand bath**: like a bird, it presses its belly into the sand, folds its legs under, fluffs its plumage (the body
  turns round), holds its neck in an arch with the head low, and rocks. The wings are half spread and drooped against the sand and
  **flick up three times (7.04, 7.88, 8.72 s)**. Each flick raises a soft warm plume of sand that rises slowly, drifts right with the wind
  and settles over about 3 s; a few grains catch the light. A low haze lies over the sand around it.
- 9.35–10.1 s: it leans forward and stands up.
- 10.1–11.25 s, **echo (the shake)**: a wave of shaking runs from the head (10.1–10.85) to the body (10.27–11.2) and the tail
  (10.4–11.3). The plumage fluffs out (a bigger, ragged outline, ruffled feathers) and a puff of sand flies off the body. The
  feathers settle again by about 12 s, with a damped wobble at 11.25.
- 11.5–12.05 s: two steps back to its stance. From 13 s it is calm (idle).

## Sound cues
All times are on the **shader clock (uTau)**, in seconds. The sound engine adds its own 0.3 s lag (a still rendered with the
frames tool as `9,T` shows uTau = T − 0.3).

| t (s) | event | sound wanted |
|---|---|---|
| 0–end | ambience | dry desert wind; a soft continuous hiss of sand blowing off the crests |
| 3.85 | alert, crest lifts | a very small feather rustle; one short soft breath through the nose |
| 4.25–4.8 | **wings open** | a full, soft feather whoosh/rustle (like a large bird opening its wings), rising |
| 4.4–5.0 | tail fans | a dry "frrrt" of a fan of feathers opening, a little after the wings |
| 5.3–5.85 | wings and tail fold | softer rustle, falling |
| 5.9–6.4 | feathers settle | tiny flutter |
| 6.26, 6.48 | footfalls | two soft steps in loose sand |
| 6.6–7.1 | lies down | a soft slide and settle in the sand ("shhh"), belly touches at about 7.0 |
| 7.0–9.4 | sand bath | continuous soft scratchy rustle of sand and feathers, rocking |
| 7.04, 7.88, 8.72 | **wing flicks** | short feather swish + a hiss of thrown sand; then a fine patter of falling grains 1–2.5 s later |
| 9.4–10.1 | stands up | sand sliding off the feathers; a soft push of the feet |
| 10.1–10.6 | head shake | a quick light flutter (head and neck feathers) |
| 10.27–11.2 | **body shake** | a "brrrr" feather shake like a bird or a dog shaking; a puff of sand; grains pattering down 10.5–12 |
| 11.25 | feathers settle | a soft fluffing sound |
| 11.78, 12.03 | footfalls | two soft steps in sand |
No calls or voice: it is a silent scene of feathers and sand.

## Camera
The default drift is fine (+3 % sideways, 4 % zoom in). The animal is centred a little left; the tail reaches the right edge of 16:9.

## Evidence followed
- *Velociraptor mongoliensis*, Djadochta Formation (Campanian, about 75–71 Ma), aeolian dune and interdune deposits of the Gobi.
- Feathers: quill knobs on the ulna of *Velociraptor* (Turner, Makovicky & Norell 2007): pennaceous secondaries on the forearm. The
  primaries on the hand, the body plumage, the leg feathers and the distal tail frond follow close relatives with preserved feathers
  (*Microraptor*, *Zhenyuanlong*). Metatarsi and toes left scaly.
- Lips cover the teeth (Cullen et al. 2023); the mouth is always closed.
- Skeleton: long low skull with a concave snout top, large antorbital opening; backward-pointing pubis; stiff tail braced by long rods
  (prezygapophyses and chevrons); second toe with the sickle claw held off the ground; semi-folding arm with three clawed fingers.
- Proportions after skeletal reconstructions (about 2 m long, hips about 0.45 m high).

## Unverified / artistic choices
- The colours (tawny, mottled back, pale belly, rufous wing bases, dark tail band) are invented. Countershading and display colours
  only on the wings and tail follow the art direction.
- The wing display and the sand bath are inferred from living birds (the extant phylogenetic bracket), not from fossils. The head crest
  of small feathers is speculative.
- The shrubs are generic: the plants of the Djadochta dunes are poorly known.
- The tail frond is shown spread in the picture plane (in life it spreads sideways), for legibility.

## Frame time
Measured pinned to one core (`taskset -c 2`), interleaved with the reference scene 1 at 960×540 (scene 1: 3.7–4.0 s per frame, which
corresponds to the brief's "about 1.0 s"):
- display (5.2): 2.1 s; bath (7.95): 2.4 s; shake (10.75): 2.4 s; skeleton under the growing flesh (2.4): 3.2 s.
- So about 0.55–0.65× the reference at rest and in action, and 0.85× while the skeleton grows.

Speed pass after the performance note: about 45 PIECE executions became 15. Each wing is one piece (all the feather rows, the
fingers and the claws, each row with its own colour and a soft shadow at its edge). The near leg and the foot are drawn once. The head,
crest and snout are one piece, with the mouth line and the nostril painted into it. Only the nearest shrub is drawn at each pixel, and
the far dunes and mesas are painted with veil(). The look is unchanged.
