# Scene 16 · `scene_15.glsl` · Archaeopteryx in the lagoon of Solnhofen

## What happens
Midday in the Late Jurassic archipelago of Solnhofen, about 150 million years ago:
- a shallow turquoise lagoon over a pale floor;
- low islets of white limestone with dark blue-green shrubs of the conifer *Brachyphyllum*;
- a low islet in the middle distance, and long low islands on the horizon under a high blue sky with small drifting clouds.

A black-feathered *Archaeopteryx* perches on a bare branch that reaches out over the water from the shrub on the left islet. Scale:
1.05 screen units per metre at the depth of the two perches (the bird is about half a metre long).
- 0–3.6 s: perched. It breathes, makes quick bird-like head turns and blinks; its long feathered tail sways a little.
- 3.6–4.4 s, **first beat**: it crouches. The body tilts forward, the head goes low, the tail lifts and the branch bends under it.
- 4.55–4.72 s: it opens its black wings. At 4.6 it **jumps**: the legs straighten, it leaves the branch, and the branch springs back
  and quivers (4.66–5.4).
- **Key moment.** One deep wing beat: down 4.80–4.96, up 4.96–5.16, down again into the glide 5.16–5.38. Then it **glides** low over the
  water (5.4–7.05), banked a little towards us. The long tail frond is spread, its reflection runs on the water under it and a faint
  shadow falls on the floor of the lagoon. It swoops out, away from us and back (it grows smaller and then larger again), passing in
  front of the middle islet.
- 7.05–7.35 s: it brakes. The body tilts up, the wings rise and the legs reach forward.
- 7.42 s: it **lands** on the branch of the right shrub. The branch dips and springs (7.42–8.2), the body swings over the branch and
  back, and two small balancing wing beats follow (7.45, 7.67). It holds its wings half raised.
- 8.40–8.80 and 8.95–9.40 s: it **folds its wings** in two steps.
- 9.8–10.6 s, **echo**: it fluffs its plumage (a bigger, ragged outline). 10.0–10.45 it preens briefly, the head down at the bend of the
  wing with small nibbling movements. 10.62 a little shake, then the feathers settle (to 11.2).
- 11.2 s to the end: calm on the right branch (breathing, head turns, blinks).

## Sound cues
All times are on the **shader clock (uTau)**, in seconds. The sound engine adds its own 0.3 s lag (a still rendered with the
frames tool as `16,T` shows uTau = T − 0.3).
| t (s) | event | sound wanted |
|---|---|---|
| 0–end | ambience | gentle water lapping on the limestone; a light warm breeze; very calm |
| 3.7 | crouch | a faint creak of the branch, a tiny feather rustle |
| 4.55–4.72 | wings open | a quick soft feather rustle |
| 4.60 | jump | a light push off the wood; the shrub's shoots rustle as the branch springs back (4.66–5.2) |
| 4.80–4.96 | downstroke | a soft wing whoosh |
| 4.96–5.16 | upstroke | a lighter swish |
| 5.16–5.38 | downstroke into the glide | a soft whoosh |
| 5.4–7.05 | glide | a very faint hiss of air over the water |
| 7.05–7.35 | braking | a broad soft feather rustle (wings up, air) |
| 7.42 | landing | a soft tap of claws on wood; the branch creaks and its shoots rustle (7.42–8.2) |
| 7.45, 7.67 | balance beats | two small quick flutters |
| 8.40–8.80, 8.95–9.40 | wings fold | two soft feather rustles |
| 9.8–10.1 | fluff | a soft «frrr» of feathers fluffing up |
| 10.0–10.45 | preening | tiny soft nibbling clicks of the beak in the feathers |
| 10.62 | shake | a short light feather shake |
No calls: the voice of *Archaeopteryx* is unknown, so it stays silent.

## Camera
The default drift is fine. If it can go sideways, a drift to the right (with the bird's flight) suits it best.

## Evidence followed
- *Archaeopteryx*: the Solnhofen and Mörnsheim limestones of Bavaria (Late Jurassic, Tithonian, about 150 Ma). It lived on low arid
  islands of an archipelago around a shallow, often hypersaline lagoon. The vegetation was xerophytic conifer scrub
  (*Brachyphyllum* and other Cheirolepidiaceae) with thick cord-like shoots covered in scale leaves.
- Black plumage: melanosomes in the isolated feather (Carney et al. 2012; matte black, Carney et al. 2020).
- Body:
  - long bony tail with a frond of paired feathers;
  - three free clawed fingers at the leading edge of the wing;
  - pennaceous "trousers" on the legs (Longrich 2006; Foth et al. 2014);
  - teeth in the jaws, covered here by lips because the mouth is always closed (the brief's rule).
- Flight: the wing bones are consistent with active flapping and gliding over short distances (Voeten et al. 2018). The flight shown is
  one beat and a short glide.

## Unverified / artistic choices
- The colours beyond "black" (the dark grey snout and feet, the amber eye) are invented. So is the extent of the black: only some
  feathers were analysed.
- Perching is debated: the first toe was not fully reversed (Mayr et al. 2005). Here it grips a branch with three toes forward and
  the first toe behind.
- The exact path and speed of the flight are staged. It swoops away and back in depth so that it stays in the frame. Its real speed
  would have been higher.
- The tail frond, spread sideways in life, is shown spread in the picture's plane, for legibility.
- Preening and fluffing come from living birds.

## Frame time
Measured pinned to one core (`taskset -c 2`), interleaved with the reference scene 1 at 960×540 (scene 1: 3.8–4.2 s per frame, which
corresponds to the brief's "about 1.0 s"):
- glide (6.2), landing (7.6) and preening (10.4): 1.7–1.8 s each;
- skeleton under the growing flesh (3.6): 3.3 s.
- So about 0.45× the reference, and 0.85× while the skeleton grows.

The scene has 10 PIECE call sites: one coat for the body, head, tail and frond; one piece each for a wing and a leg, each called twice;
the bones; the fossil; the sky, the water, the rock, the foliage and the branches. Shader compile time: about 7 s.
