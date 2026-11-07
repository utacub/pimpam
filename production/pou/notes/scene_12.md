# Scene 13 (scene_12.glsl): Spinosaurus aegyptiacus in a river of the Kem Kem

## What happens

A broad, slow river of the Kem Kem (south-east Morocco), about 95 million years ago, at late morning. On the far bank stands a gallery
forest: billowing crowns, sunlit on top and dark underneath, with trunks in the shade. Paler forest shows in the haze behind, and soft
shafts of light fall through the haze. A strip of wet sand and mud runs along the waterline. Overhanging branches hang into the top of
the frame from both sides. On a tall screen they become a canopy with sky through its gaps.

The river is green-brown and murky. It mirrors the far forest and the sky, and nearer to us the leaves overhead. The water near us is in
the shade of the canopy, with warm sunlit patches that drift slowly. Fallen leaves float on the current.

A Spinosaurus, about 14 m long (.112 screen units per metre), stands side-on in the middle of the river. The water crosses its thighs;
below the waterline its legs and belly show dimly through the murky water, bent by the refraction (they look shallower), darker and
broken by the ripples. A wet, darker band runs along its body just above the water, with small wavelets lapping out from it and a
moving play of light thrown up from the ripples. Its reflection lies under it.

- The tail is a deep paddle, flattened from side to side: a muscular core with a fin of tall spines above and long chevrons below
  (the spines and chevrons show as soft ridges), rising a little from the hips and then going back into the water.
- The sail is highest over the rear of the trunk, low over the shoulders, its top a little irregular and sagging between the spine
  tips; behind the hips it slopes down into the upper fin of the tail. The spines show as relief ridges under the skin and the thin
  upper part glows a little where the sun comes through.
- The neck is thick and muscular, in an S: up from the shoulders and then forward into the back of the skull.
- The skull is long, low and crocodile-like: a deep back of the skull, a brow over the small eye, a small crest on the snout in front
  of the eyes, the nostril set far back, a narrow snout ending in a slightly bulbous rosette. The lips cover the teeth.
- The arms are robust and held folded above the water; the hand shows the big curved thumb claw, the other claws folded under.
- The skin has small scales in rows along the body, countershading (dark olive-brown back, paler belly) and darker saddles.

- 0–2.5 s: rest. It breathes, its head moves slightly as it peers at the water, it blinks, and its tail sways. A small shoal of fish
  holds near its chest under the surface.
- 2.5–8.0 s: it wades slowly to the right (about 1.1 m). Each step sends rings out from its thighs; the body dips a little just after
  each footfall and rolls with the steps, the arms swing a little and the tail sways. Its head is held still like a heron's while
  the body wades on under it, then glides forward to catch up, once a step. A low mound of water is pushed up at its chest (the bow
  wave) and a broken V-wake trails behind.
- 4.7–5.6 s: it raises its head high (the display pose, held to 7.1 s).
- 4.8–6.4 s, **the key**: the sail flushes a dull, desaturated red, from its upper middle and most along the spines. The rise takes
  1.6 s. It holds to 7.2 s and fades over 7.2–9.0 s.
- 5.5 s: the shoal at its chest darts away (never caught).
- 5.6–7.0 s: a low closed-mouth hum. The throat swells a little.
- 8.15–8.75 s: it lowers its head. The tip of the snout touches the water at 8.75 s (rings) and it drinks until about 9.3 s. A second
  shoal gathers near the snout.
- 9.36 s: the snout comes out of the water.
- 9.5 s: the shoal at the snout darts away (never caught).
- 9.45–10.4 s, **the echo**: it shakes the water off its head. The head swings about 2.6 times a second and the neck follows a moment
  later. Spray flies from the head and a fine veil of mist hangs around it.
- 10.4–13 s: drops fall from the tip of its snout into the river, with small rings. Then calm: breathing, the tail swaying, the light
  moving.

## Audible events (seconds on the scene's clock)

The times are on the scene's own clock (the shader's `uTau`), as for my scenes 8 and 12. **They are about 0.3 s earlier than the
seconds since the press** (the frame tool renders `T` = clock + 0.3).

| t (s) | event | sound wanted |
|---|---|---|
| 0–14 | ambience | a slow, broad river; soft lapping; a warm forest hum of insects; leaves rustling in a light breeze. No birdsong, no frogs. |
| 2.95, 4.75, 6.55 | near foot comes down in the water | a heavy, slow wading step: a deep slosh and swirl of water (not a thud) |
| 3.85, 5.65, 7.45 | far foot comes down | the same, softer |
| 2.5–8.0 | it wades | a continuous soft swish of water against its chest and thighs, fading out by 8.3 |
| 4.7–5.6 | it raises its head | a soft, deep exhale through the nostrils |
| 4.8–6.4 | the sail flushes | nothing (visual), or a very faint warm swell under the hum |
| 5.5 | the shoal at its chest darts away | a few tiny, quick water flicks |
| **5.6–7.0** | **the key: closed-mouth hum** | a low closed-mouth hum (felt more than heard), swelling 5.6–6.0, held, fading 6.5–7.0; never a roar or growl |
| 8.15–8.75 | the head goes down | a soft exhale |
| 8.75 | the snout touches the water | a gentle plop, then lapping |
| 8.8–9.3 | it drinks | two slow, soft gulps |
| 9.36 | the snout comes out | water running off the jaws, a small splash |
| 9.5 | the shoal at the snout darts away | tiny water flicks |
| **9.45–10.4** | **the echo: it shakes the water off its head** | a wet shake of a big head (flapping skin, water flung off), spray pattering on the river 9.6–10.6 |
| 10.6–13.0 | drops from the snout | small drips into the river, about one every 0.3–0.4 s at first, then fewer |

## Camera

The default drift for this stimulus (3 % to the right, 4 % zoom in) suits it: the animal wades to the right. The whole animal stays inside
the final 16:9 framing:
- At the start the tail goes into the water at x ≈ −.71 (its submerged end, seen dimly, to about −.76); at the end at about −.59.
- At the drink (8.75 s) the snout tip is at x ≈ .57.
- The sail top is at y ≈ .19; the raised head at about .17.
- The overhanging leaves stay above y ≈ .34.

On a 4:3 screen (|x| ≤ .62) the head, the body, the sail and most of the tail are inside; only the last part of the tail, where it goes
into the water, is cut at the start.

The portrait frame (540×960) was checked: the head, the sail and the body fit (the end of the tail runs out at the left), the canopy
fills the top and the river fills the bottom.

## Evidence followed and what is unverified

- **Spinosaurus aegyptiacus** of the Kem Kem Group (Cenomanian, about 100–94 Ma):
  - Ibrahim et al. 2014, Science 345: 1613–1616 (the neotype; semiaquatic adaptations; neural spines up to about 1.65 m).
  - Ibrahim et al. 2020, Nature 581: 67–70 (the tail: tall neural spines and long chevrons make a deep, flexible, paddle-like tail,
    which they read as tail-propelled swimming).
  - Sereno et al. 2022, eLife 11: e80092 (a bipedal shoreline and wading animal, about 14 m, too buoyant and unstable to pursue prey
    under water; a sail profile highest over the back half of the trunk).
  - **The debate**: Ibrahim et al. (2020) and Fabbri et al. (2022, Nature 603: 852–857) argue for an animal that swam and dived;
    Sereno et al. (2022) for a wader that fished from the shallows. Wading with the water at the thighs and a paddle tail, as shown,
    is compatible with both; swimming or diving is not shown.
- **Body**:
  - The overall proportions, the sail outline, the S-curved neck and the head angle follow published skeletal reconstructions
    approximately.
  - **The head is drawn about 1.15 × life size** (about 1.4 m, a tenth of the body length instead of about a twelfth) so that it reads
    at this scale (an artistic liberty). The shape of the snout, the rosette, the retracted nostril and the small nasal crest follow
    the skull material and published reconstructions approximately.
  - The neck is drawn shorter and thicker than in some skeletal reconstructions, in an S-curve; the exact neck length is uncertain.
  - The feet are not shown; they are in the murky water.
- **Lips**: the teeth are covered by extraoral tissue (lips), as the brief asks. This follows the case for lipped theropods (Cullen et
  al. 2023, Science 379: 1348–1352). **For spinosaurids, with their long interlocking front teeth, this is still debated** (to verify).
- **Colours and the sail flush are assumptions**: the olive-brown skin with darker saddles and a paler belly, and the dull red flush of
  the sail as a display. A display role for the sail is the favoured hypothesis; blood-flow colour change is speculative.
- The closed-mouth hum follows the case for closed-mouth vocalisation in archosaurs (Riede et al. 2016, Evolution 70: 1734–1746). The
  throat swell is artistic.
- **The environment**: the Kem Kem was a vast river system rich in fish (e.g. Onchopristis, Mawsonia, lungfishes; see the review by
  Ibrahim et al. 2020, ZooKeys 928: 1–216).
  - The small fish shown are generic.
  - **The flora of the Kem Kem is poorly known**: the gallery forest of broadleaf flowering trees is generic for the Cenomanian (to
    verify).
  - No other dinosaurs or pterosaurs are shown, to avoid uncertain coexistences.
- The fossil lies in the red sandstone of the Kem Kem beds (the rock's colour comes from the shared rock).

## Measured frame time (SwiftShader, 960×540)

Measured after the rework against the reference tyrannosaur frame (5, 6.0 s) in the same runs. The reference took 1.15–1.48 s in these
runs (the machine was slower than before). The times are the least of two or more runs; the frame tool's T is the clock + 0.3.

| frame (scene clock) | time |
|---|---|
| the window still opening (2.3 s, 3.0 s) | 1.04–1.14 s |
| the end of the window's opening (3.6 s) | 1.24 s |
| wading (4.7 s) | 0.81 s |
| the display (6.5 s) | 0.83 s |
| the drink (9.0 s) | 0.79 s |
| the shake (9.9 s) | 0.83 s |

So about 0.7–1.0 × the reference.

The frame at 1.6 s (T 1.9, the camera still descending, the fossil in the rock) takes 2.3–2.6 s. This is not this scene's fossil: with
`fossil()` switched off as a test the same frame took 2.38 s. The reference scene's own frame at the same moment took 1.78 s.

## Rework after the coordinator's second review

The animal was redrawn, about 1.3 × bigger (.112 screen units per metre instead of .087):
- **Head and neck**: the neck is shorter, thick and muscular, in an S. The skull is new: long and low, with a deep back, the brow, the
  small crest before the eyes, the nostril set far back, the rosette, and creases at the back of the skull and the angle of the jaw.
- **Arms**: robust, folded above the water, with the big thumb claw and the folded claws.
- **Legs in the water**: refracted, darker and broken by the ripples. There is a wet, darker band and contact shading at the
  waterline, wavelets lapping out from the body, and a mound of water at the chest as the bow wave.
- **Tail**: a deep paddle flattened from side to side. A core with a fin of spines above and chevrons below, with soft ridges, rising
  from the hips and going back into the water.
- **Sail**: the profile follows the spine lengths, highest over the rear of the trunk, with an irregular top that slopes into the
  tail's fin. The spines show as relief ridges, the thin upper part glows a little in the sun, and the flush follows the spines.
- **Skin**: scales in rows along each part, stronger countershading, darker saddles, a wet sheen and the light of the ripples playing
  on the lower body.
- **Reflections**: the river now mirrors a softened copy of the far forest, the haze and the sky. It is blurrier nearer to us and
  broken into horizontal bands that drift slowly towards us. The animal's reflection uses the same bands and blur.
- **Motion**: the body dips after each footfall and rolls with the steps, the arms swing, the tail sways, and the head is held still
  like a heron's while the body wades on under it.
- The cue times are unchanged.

## Shared files

Nothing needed. As in scene 12, `fossil()` returns early inside the open window (a copy of the tail's `winD`), and the bones are not
computed once `GROW` is larger than the flesh's own depth over them. New here, and safe for any scene: `life()` returns at once outside
the opening window while `uLife` < .999. The frame shows only the rock there, but the shared tail still calls `life()` for every
pixel. A suggestion for the shared tail: call `life()` only where `winD` < a few pixels.
