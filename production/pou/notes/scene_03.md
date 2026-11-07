# Scene 4 (scene_03.glsl) · Megatherium and Glyptodon on the Pampa

## What happens

A late-autumn afternoon on the Pampa in the Late Pleistocene. The low sun stands on the left behind an old algarrobo, so the animals are
lit from behind with warm rims of light, and their long shadows run to the right and towards us. Golden dust drifts in the air near the
ground.

- **The setting:**
  - The sky is golden near the horizon, rising to pale blue, with thin warm clouds.
  - The low, blue Tandilia hills lie on the far horizon, with far groves of tala and algarrobo.
  - A shallow lagoon lies in the middle distance, holding the sky, with reeds at its edge.
  - The plain is golden bunchgrass in autumn: tussocks in rows to the horizon, some still green at their feet, their seed heads lit from
    behind. The grass sways in slow waves of wind and is trodden short where the animals are. Clumps of pampas grass (Cortaderia) stand
    to the left, to the right and in the near right corner, with silky cream plumes.
  - **The tree** (on the left) is an algarrobo-like Prosopis. It has a short, leaning, fissured trunk and spreading limbs. Its broad,
    flat-topped crown is built of layered, soft masses of fine feathery leaves.
    - The masses are lit softly from the sky, in shade beneath, with a warm rim where the low sun comes through their edges.
    - They are partly yellowing and glow near the sun.
    - The sky shows through a few soft gaps, and long yellow pods hang in bunches.
    - One long lower branch reaches out towards the sloth.
- **The Megatherium** (in the middle, facing left): a giant ground sloth about 5 m from snout to tail tip.
  - It has a heavy body with a broad pelvis, a small head with a narrow snout and a mobile upper lip, and a thick tail.
  - Its coat is coarse, long, warm brown hair, falling down the body and back along the tail, paler and greyer on the back and darker
    on the legs.
  - On all fours it rests on the outer sides of its hind feet and on the knuckles of its fore feet, the big curved claws turned
    inwards.
- **The Glyptodon** (in front, coming in from the left): about 3.4 m long and 1.6 m high.
  - It has a high domed shell of bony rosettes (a raised central disc ringed by small polygons) with a scalloped lower margin.
  - It has a bony cap on its deep, blunt head, a tail of rings of conical scutes, and short, stout legs with broad round feet.

The story (times on the shader clock):

- **Until 3.6:** calm. The sloth stands on all fours under the tree, breathing, blinking and flicking an ear. The front of the Glyptodon
  shows at the left edge. The grass and the tree sway.
- **3.6–5.65:** the Glyptodon walks in from the left, its head nodding with its steps. It stops in front of the foot of the tree,
  before the sloth rises.
  - While the sloth is up, the Glyptodon stays clear of it, so the sloth's feet, its tail tripod and its whole body stay in view from
    4.2 to 10.8.
- **3.8–4.9:** the sloth shifts its weight back onto its hind legs and sniffs upwards at the branch.
- **4.2–5.4:** it rises onto its hind legs, the tail pressing on the ground behind it as the third leg of a tripod. Its arms come up.
- **5.45–6.25, the key moment:** it hooks the branch with the claws of both hands and pulls it down to its mouth.
  - The branch bends.
  - Leaves shake loose and flutter down (from 5.55).
  - It bites into the leaves (mouth open 5.85–6.35) and chews with a sprig in its mouth (6.15–9.3).
- **9.0–9.2:** it lets go, and the branch springs back up with a damped sway (to about 10.5). More leaves fall.
- **9.0–11.0:** it lowers itself back onto all fours. The fore feet come down on their knuckles, landing at about 10.6–10.9.
- **6.2–9.7:** the Glyptodon grazes, its head down in the grass.
- **9.85–10.15:** it lifts its head a little, looks out and blinks (10.25–10.48).
- **From 10.8:** once the sloth is down, the Glyptodon walks on to the right across the front. At the end (13.5) it is passing in
  front of the sloth.
- **11.0–13.2:** the sloth chews again, on all fours. Calm afterwards.

## Sounds

Times are seconds after the press (shader clock + 0.3).

| Time (s) | Sound |
|---|---|
| 4.1–5.0 | **Weight shift and sniff:** a deep, soft snuffle through the nose; a creak of the turf under the hind feet. |
| 4.5–5.7 | **The rise:** a long rustle of coarse hair, ending with a dull, heavy press of the tail into the turf (about 5.7). |
| 5.75 | **The hook:** a dry knock of claws on wood. |
| 5.75–6.55 | **The pull:** the slow creak of a living branch bending. |
| 5.85–9.5 | **Leaves:** a light rustle, then single leaflets fluttering down. |
| 6.15–6.65 | **The bite:** a crisp tearing of leaves and twigs. |
| 6.45–9.6 | **Chewing:** slow, soft, crunchy chewing of leaves. |
| 9.3–9.5 | **Release:** the swish of the branch springing up, then a rustle of its leaves as it sways (to about 10.8); a few more leaves fall. |
| 9.3–11.3 | **Lowering:** a long rustle of hair and a soft, heavy exhalation. No growl or roar. |
| 10.9–11.2 | **Landing:** two heavy, soft thuds as the fore feet come down on their knuckles. |
| 11.3–13.5 | **Chewing** again, slower. |
| 3.9–5.95 | **Glyptodon steps:** short, heavy, soft footfalls in dry grass, about 3.4 a second (each foot every 1.2 s), with a faint creak of the shell. |
| 5.95 | **The stop:** a dry scrape of the shell margin brushing the grass (quiet, under the sloth's hook and branch creak). |
| 6.5–10.0 | **Glyptodon grazing:** soft, steady cropping and grinding of dry grass, quieter than the sloth's chewing. |
| 10.15–10.45 | **Head lift:** a soft snort or breath. |
| 10.55–10.8 | **The blink:** silent. |
| 11.1–13.5 | **Glyptodon steps** again, about 3.5 a second, walking on to the right. |

Under the whole scene: a light, warm wind through dry grass and the fine leaves of the tree.

## Camera

The default drift suits the scene. Nothing needed.

## Evidence followed, and what is unverified

- **Megatherium americanum.**
  - Size: the sloth here is about 5 m from snout to tail tip and stands about 4.5 m tall to the top of its head when it rises. The
    largest individuals are usually given as about 6 m long. It is drawn somewhat below the brief's "about 6 m" so that its rise reaches
    the tree's lower branch in frame.
  - The bipedal stance with the tail as a prop follows biomechanical studies of the skeleton (the massive pelvis, hind legs and tail).
    It is a **debated interpretation**, not an observation.
  - Walking on the outer sides of the hind feet (pedolateral) and on the knuckles of the fore feet, with the claws turned in, follows
    the anatomy of the feet.
  - A browser of trees and shrubs with a mobile (prehensile) lip follows the narrow snout and the teeth.
  - The hair: Megatherium's coat is not preserved. The coarse, long hair is **inferred** from the preserved skin and hair of smaller
    ground sloths (Mylodon, Cueva del Milodón). Some authors think so large an animal had a sparse coat. The colour is **unknown**.
- **Glyptodon** (G. clavipes / G. reticulatus).
  - The shell of fused osteoderms with a rosette pattern, the scalloped margin, the bony cap on the head, the ringed tail without a
    club (the club belongs to Doedicurus) and the short, stout legs follow the fossils.
  - Grazing on grass follows its ever-growing, high-crowned teeth and deep jaw.
  - The skin colour of the head and legs is **inferred**.
- **The tree.**
  - The Prosopis is drawn after the caldén and the algarrobos (P. caldenia, P. alba, P. nigra): fine bipinnate leaves, long yellow pods
    and autumn yellowing (the caldén is deciduous).
  - Whether Prosopis grew on this part of the Pampa in the Late Pleistocene is **unverified**. The Pampa was then drier and more
    steppe-like, and the Espinal woodland lay on its margins.
  - Megatherium feeding on Prosopis is plausible but **unverified**. Large pods like these are often seen as fruits once spread by the
    megafauna.
- **Coexistence.** Megatherium americanum and Glyptodon both lived on the Pampean plains in the Late Pleistocene (the Lujanian, the Luján
  Formation).
- **Setting.** Bunchgrass, pampas grass, a shallow lagoon and the Tandilia hills fit the region. The scene is not a reconstruction of a
  particular place.

## Frame time

Measured with `tools/pou-frames.mjs` at 960×540, pinned to one core with `taskset`, interleaved with the reference scene 1. The first
frame of each scene includes the shader compile and is not counted.

The machine was loaded by other renders (load about 4 on 4 cores). The reference measured 3.9–4.2 s.

| Frame | Time | Against the reference |
|---|---|---|
| 6.4 (the key moment) | 4.4 s | about 1.1× |
| 13.5 (the end) | 4.2 s | about 1.05× |
| 3.9 | 4.3 s | about 1.05× |
| 4.3 | 4.6 s | about 1.1× |
| 3.3 and 3.6 | 5.2–5.4 s | about 1.3× |

The 3.3 and 3.6 frames are heavier because of the opening (the end of the window transition): every frame up to about 3.6 costs
more, and from 3.9 the cost falls back. The scene's own heaviest moment is about 1.1×.

## Files

- **Review frames:** `/tmp/pou_review/scene_03/`
  - 3.6: rest
  - 4.6: the rise, the Glyptodon walking in
  - 6.4: the pull and the bite, the key moment
  - 8.0: chewing, the Glyptodon grazing at the left
  - 10.4: the lowering, the Glyptodon looking out
  - 13.5: the end
  - 6.4: portrait (540×960)

All frames were checked at the window (1.2, 2.2, 3.0), with «dim», «none» on black and «none» on white, and at the wait frame after
the end.

- The held branch, its falling leaves and the sprig in the mouth are drawn as part of the action, so they stay in every decor mode.
- The tree, the grass and the golden dust belong to the decor.
