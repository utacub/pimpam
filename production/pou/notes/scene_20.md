# Scene 21 · `scene_20.glsl` · The garden of today (the robin)

## What happens
It is a clear autumn morning in a garden. The sun is low beyond the top left corner, the sky is blue with a few thin high clouds,
and morning mist lies along the far fields under hazy hills.
- Behind: a lawn strewn with fallen leaves and crossed by long soft tree shadows; a hedge of beech and hornbeam (green and copper);
  a golden poplar, a field maple in orange and a big copper beech, with more trees beyond the edges for wide and portrait screens.
- In front: a low branch of a hawthorn comes in from the right (the trunk is out of the picture). It has zigzag thorny twigs, a few
  lobed leaves in autumn colours (yellow, orange, russet, a few still green) and clusters of glossy red haws.
- A higher branch hangs down from the top right corner. In portrait it frames the sky.
- Leaves fall slowly from above, rocking from side to side.
- Everything is drawn only above the ground line (q.y = −0.30). It fades out just under it, as the placeholder did; the soil is the
  rock's.

The robin (*Erithacus rubecula*) perches on the branch. It is drawn big: about 0.32 screen heights from beak to tail.
- Colours: orange-red face and breast edged with blue-grey; olive-brown back, wings and tail; white belly and buff flanks.
- It has a large dark eye that blinks, a thin dark beak and thin legs whose toes grip the branch.
- The folded wing is made of feathers: primaries, tertials and greater coverts with pale tips. The feathers have lighter edges and
  each casts a soft shadow on the one below.

### Two clocks
- **The garden's clock `t`**: seconds since the climb started (after the twentieth scene). It is 100 at rest.
- **The world's clock `uG`**: drives the robin's idle life. Everything at rest moves on `uG`.

### At rest (`t` = 100, and any `t` ≥ 7): the idle cycle, 20 s on `uG`
| `uG` mod 20 (s) | what the robin does |
|---|---|
| 0–5.6 | on the right-hand perch, facing left (towards the sun). Head tilts every ~1.35 s (a quick 0.12 s turn, then still: looking down at the lawn, up, level). Breathing, blinks |
| 2.2 | tail flick: the tail cocks up fast and lowers slowly, and the wing tips droop |
| 3.1 | a bob (a quick bow of the body) |
| 5.6–5.98 | **hop** to the left along the branch. It crouches before take-off, the wings flick open, the tail fans, the legs tuck. On landing it dips, the branch gives and springs back, and the tail swings and settles |
| 7.0 | tail flick |
| 8.0–8.6 | **ruffle**: it fluffs up all its feathers and shivers. The feathers settle with a small wobble until about 9.1 |
| 9.2 | bob |
| 10.1 | tail flick |
| 11.0–11.3 | small hop on the spot, **turning round** (now facing right) |
| 12.7 | tail flick |
| 13.9–14.28 | **hop** back to the right-hand perch |
| 15.7 | bob |
| 16.4 | tail flick |
| 17.6–17.9 | hop on the spot, turning round (facing left again) |
| 19.0–19.4 | a smaller ruffle |

The branches and leaves sway gently, the tree crowns breathe, the clouds and mist drift, and leaves keep falling.
In reduced motion (`uG` = 0) the robin sits still on the right-hand perch, facing left.

### During the climb (`t` from 0 to 7)
- The camera arrives at 5 s.
- From the start of the climb the robin stays on the perch, facing the way it will face when the song ends. It does not hop
  while the camera arrives or while it sings. Head tilts, blinks and breathing go on.
- 4.55–5.15: it raises its head, stands more upright and puffs its breast.
- **5.20–5.85 first phrase, 6.10–6.95 second phrase**: the beak opens and closes quickly with the notes, showing the yellow gape.
  The throat pulses and the breast stays puffed.
- 6.80–7.00: back to its idle pose. At `t` ≥ 7 the state is exactly the idle state for the same `uG`, so the switch to `t` = 100
  at rest does not jump.

## Sound cues
Song times are on **the garden's clock** (seconds since the climb started), as asked. There is no 0.3 s lag on this clock: the frames
tool's `20,T` shows the garden at `t` = T − 14.

| garden `t` (s) | event | sound wanted |
|---|---|---|
| 3.4–7 | ambience | the autumn garden: a light breeze in the leaves, a few distant birds, very quiet |
| 4.55–5.15 | it gets ready (head up, breast puffed) | silence, or the softest feather rustle |
| **5.20–5.85** | **song, first phrase** | the robin's thin, clear, wistful autumn song: a short run of high warbles and trills |
| 5.85–6.10 | pause | silence |
| **6.10–6.95** | **song, second phrase** | a longer phrase, starting higher and falling, ending in a soft trill |
| 6.95–7.0 | beak closed | the song ends |

The existing sample `pitroig` has two phrases, at 0.90–1.55 s and 1.80–2.90 s into the file. Started at garden `t` = 4.30:
- its first phrase falls on 5.20–5.85, exactly on the beak;
- its second phrase falls on 6.10–7.20, so it runs 0.25 s past the closed beak (trim or fade it after 6.95).

It is currently started at 3.9, which is 0.4 s early for these beak times.

Optional idle sounds at rest (on `uG` mod 20; leave them out if the engine has no world-clock cues):
- soft wing flutters at the hops (5.6, 11.0, 13.9, 17.6);
- a light feather rustle at the ruffles (8.0, 19.0).

No alarm calls («tic»): it is a calm robin.

## Camera
Nothing special. The rest framing (`POU_START`) is the composition; the robin is just right of the centre, with the essentials within
|x| ≤ 0.45. In portrait the upper branch and the sky fill the top.

## Evidence followed
- European robin plumage: orange-red forehead, face, throat and breast bordered with blue-grey; olive-brown upperparts; whitish belly;
  large dark eye; thin dark bill; long thin legs. Both sexes look alike.
- Robins sing in autumn and winter as well as in spring: both males and females hold winter territories, and the autumn song is softer
  and more wistful. Phrases are short (about 1–3 s) with pauses.
- Behaviour: robins perch on low branches and watch the ground. They move in short hops, bob, flick the wings and tail, turn round
  with a hop on a perch, and fluff and shake their plumage.
- Hawthorn (*Crataegus monogyna*): deeply lobed leaves that turn yellow to red-brown in autumn; thorny zigzag twigs; clusters of red
  haws (one seed each) with the dark remains of the flower at the tip. It is a common garden and hedge tree, and robins eat its haws.
- Birds are living dinosaurs (avian theropods), which links the end of the well back to the first scenes. The robin has a beak and no
  teeth.

## Unverified / artistic choices
- All the colours are painted. The garden (hedge, trees, lawn) is generic, not a real place.
- The song's timing is stylised to fit 1.75 s. The beak flutters at about 7 notes per second, which is a plausible rate, but it does
  not follow any real recording note by note.
- The idle cycle repeats every 20 s on `uG`. The order of hops, flicks and ruffles is our staging.
- The robin's size relative to the hawthorn's leaves and haws is about right. The garden behind is not at the same scale: it is far.

## Frame time
Measured pinned to one core (`taskset -c 2`), interleaved with the reference scene 1 at 960×540 (scene 1: 3.8–4.2 s in these runs,
which corresponds to the brief's "about 1.0 s"):
- at rest (`0,0`): 3.1–3.2 s;
- singing (`20,19.45`): 3.3 s;
- mid-hop (`20,25.82`): 3.3 s.

That is about **0.8×** the reference. The shader compiles in about 6 s.

The scene has 5 PIECE call sites plus one eye:
- the sky;
- the lawn;
- the hawthorn's wood;
- the leaves and haws together (the haws plain);
- the falling leaves;
- the robin in one piece (legs, coat of feathers and beak; one material, with the legs and beak plain).

The backdrop (hills, mist, trees, hedge, clouds) is painted with `veil`. Leaves and haws are evaluated only near the twigs.

## Needed in a shared file (not changed: `dist/pou.js`)
On the first press after a full dive, `pouLayers` gives the garden layer `tau = prevTau − T0`. With the scene-20 clock stopped at its
end, that is about 6.7 s, so during the first 0.3 s of the travel down the garden shows the last moment of the song:
- the head is up;
- the breast is puffed;
- the second phrase's beak is still moving;

all of this instead of the idle state that was on screen at rest. This only matters if the press comes right after the climb.

A one-line fix would remove the jump: use `Math.max(POU_RETURN, prevTau - T0)` (or `POU_IDLE`) for the garden layer.
