# Scene 19 (scene_18.glsl): Stenopterygius in the Posidonia Shale sea

## What happens

The Early Jurassic sea over south-west Germany: the Posidonia Shale of Holzmaden, Early Toarcian, about 182 million years ago. The camera is at the surface, half over and half under the water (an over-under view). The waterline crosses the picture at y = .10 and moves gently.

**Above the water:**
- a hazy summer sky, brighter towards the high sun up on the left, with thin high streaks;
- a row of fair-weather cumulus on the horizon with lumpy tops and flat grey bases;
- a low coast in the haze on the right;
- the sea going away to the horizon, with soft, slow glints under the sun.

**Under the water:**
- blue-green water, darker with depth;
- shafts of light from the surface and slow caustics;
- drifting particles, and a far school of small fish (*Leptolepis*);
- six ammonites (*Harpoceras* and *Dactylioceras*);
- on the left, a floating log, weathered grey above the water and filmed green below. A colony of the sea lily *Seirocrinus* hangs under it on long stalks, with feathery crowns.

**The animals:**
- **The group:** three *Stenopterygius quadriscissus*, 2.6 m long, at .17, .15 and .13 screen units per metre (nearest to farthest).
- **The near one:** a fourth at .36 per metre, close to the camera.
- **Their look:**
  - They are dolphin-shaped, with a smooth skin (`K_SMOOTH`).
  - They are countershaded: dark grey-blue above and pale below, with a soft, wavy border.
  - Each has a crescent tail fin, a triangular dorsal fin, big front paddles and small hind paddles.
  - Each has a big eye with a ring of bony plates (the sclerotic ring), and nostrils in front of the eye.
  - The bones show through the growing flesh while the window opens.
  - Every animal blinks. The near one does not blink while it looks at us.

**The timeline (scene clock):**
- **0–3.6 s, rest.**
  - The group cruises slowly at mid-depth on the left. They swim side by side in a loose echelon, the leader highest and the others lower and a little ahead, with slow tail beats.
  - The window opens on the fossil: the three as they lie at the start, each a dark film of skin with its bones (as in the Holzmaden slabs).
- **3.6–4.6 s.** The group speeds up and swims up together, in parallel.
- **4.6–7.8 s, the key.** One after another they leap out of the water like porpoising dolphins. Each breathes as it leaves the water (a soft puff of spray), arcs over (tops at 5.10, 6.15 and 7.20 s) and goes back in, trailing a cloud of bubbles.
  - The leader dives deepest. The second levels off at mid-depth and the third stays shallow.
- **7.8–9 s.** The three glide on to the right half and settle into a slow cruise, stacked in depth and not overlapping.
- **9.0–12.2 s, the echo.**
  - A fourth comes in from the left, close to the camera. It slows (9.85–10.35) and turns its big eye on us: the pupil moves to the middle (9.95–11.05).
  - It then speeds up (10.75–11.45) and swims out of the picture to the right, passing in front of the group.
  - The ammonites in its way jet gently aside, shell first, in three soft pulses.
- **Calm by 12.3 s.** The group cruises; the bubbles have gone; the light and the waterline move slowly.

## Audible events (seconds on the scene's clock)

The times are on the scene's own clock (`uTau`). They are about 0.3 s earlier than the seconds since the press (the frame tool renders `T` = clock + 0.3).

| t (s) | event | sound wanted |
|---|---|---|
| 0–14 | ambience | over-under: soft lapping of small waves at the surface, and a muffled, calm underwater hush; no gulls, no wind |
| 3.6–4.6 | the group speeds up and swims up | a faint swish of tails in the water |
| **4.60** | the first (the leader, the biggest) leaves the water | a soft splash of the surface breaking, with **a short breath at the surface** (a puff out and a quick draw in) |
| 4.6–5.6 | it flies | drops falling back (light patter) |
| **5.60** | it re-enters | a deeper splash: a clean "plunge", then the fizz of bubbles for about 2 s |
| **5.61** | the second leaves the water | splash and breath, as at 4.60 but a little lighter |
| **6.62** | the third leaves the water | splash and breath, lighter again |
| **6.69** | the second re-enters | plunge and bubbles |
| **7.78** | the third re-enters | plunge and bubbles, fading by about 9.5 |
| 9.0–9.9 | the near one arrives | a soft, low whoosh of displaced water |
| 9.45, 9.60, 9.70 (+0.42, +0.84 each) | three ammonites jet aside | tiny soft squirts, barely audible |
| 9.95–11.05 | it looks at us | nothing new; the ambience only (a held moment) |
| 10.75–11.9 | it speeds away | a stronger soft whoosh, passing left to right |
| 11.20 (+0.42, +0.84) | the big ammonite on the right jets aside | a tiny soft squirt |
| 12.3 onwards | calm | ambience only |

There is no predation, and no roar or call. The splashes are soft (no hard slaps).

## Camera

The pose is `[0, PY(18), 1, .15, -.03, 0, -.04]`: a drift of .03 to the left and 4 % closer during the scene. The final framing is x −.883…+.823 and y ±.48.
- **The group at rest:** heads at x −.42 to −.35, tails reaching −.87 (the leader's tail is close to the left edge at the start).
- **The leaps:**
  - The animals leave the water at x −.39, −.21 and −.05 and re-enter at .07, .21 and .34.
  - At the tops of the arcs the centres of mass are at y .29, .26 and .24 (the bodies level), well under the top of the frame (.48).
- **The group at the end:** at y −.36, −.20 and −.06, heads at x .59–.71 (at most .77 by 40 s), inside the frame.
- **The near one:** its snout reaches about x −.1 during the look (eye at about −.24, y −.17). It leaves the frame on the right by about 12.2 s.
- **4:3 (|x| ≤ .67):** all the leaps and the look are inside. At rest the tails are cut; at the end the heads are at the edge.
- **Portrait (540×960), checked at 5.7 and 10.4:**
  - The sky continues above and the deep water below.
  - The leaps and the near one's head and eye are inside |x| ≤ .62. The group at the end is half cut on the right.

## Evidence followed and what is unverified

- ***Stenopterygius quadriscissus:*** the commonest ichthyosaur of the Posidonia Shale (Posidonienschiefer) of Holzmaden and Ohmden, Baden-Württemberg.
  - Lower Toarcian, mainly the *serpentinum* (*falciferum*) zone.
  - About 183–181 Ma; the brief's "about 182 Ma" is within it. The exact zone and date are still to verify against a current Toarcian time scale.
  - The adult length of about 2.5–3 m follows the Holzmaden specimens; 2.6 m was used.
- **Body outline, dorsal fin and crescent tail fin:** from the Holzmaden soft-tissue outlines (Hauff specimens). The tail bends down into the lower lobe of the fin.
- **Smooth skin, countershading and blubber:** Lindgren et al. 2018, Nature 564: 359–365, on a *Stenopterygius* from Holzmaden. Its pigment cells were darker on the back than on the belly, which suggests countershading (crypsis), and it had a layer of blubber (likely warm-blooded).
  - The tones used (grey-blue above, pale below) are an interpretation; the real colours are unknown.
- **Big eyes with sclerotic rings:** known in all ichthyosaurs (Motani, Rothschild & Wahl 1999, Nature 402: 747). The ring is drawn in the bones.
- **Nostrils in front of the eyes**, not a blowhole on top. The breath puff starts there.
- **Front paddles larger than the hind ones**, with a mosaic of small bones (as in the drawn bones).
- ***Seirocrinus subangularis*** colonies hanging from drifting logs, with very long stalks: Hunter, Casenove & Mayers 2020, R. Soc. Open Sci. 7: 200142 (the Hauff colony).
  - The crowns are drawn smaller than the real ones (which spread up to about a metre) so that they read as decor.
- ***Harpoceras*** (*H. falciferum*) and ***Dactylioceras*** are typical ammonites of the Posidonia Shale. *Leptolepis* (*L. coryphaenoides*) is a common small fish there.
- **Unverified or invented:**
  - **The leaping:** ichthyosaurs had to breathe air at the surface. Porpoising leaps are behaviour borrowed from dolphins, plausible for a fast thunniform swimmer but not attested.
  - **The group:** Holzmaden has many individuals, but no evidence of pods. The group is a story choice.
  - **The colours and the countershading border.**
  - **The ammonites:** their soft parts (arm number and length) are unknown, and the arms are drawn short and few. The "jetting" follows living *Nautilus* and other cephalopods.
  - **The clear, blue-green surface water** is invented. The Posidonia sea was stratified, with oxygen-poor bottom water, but the upper water must have been oxygenated for these animals.
- **Brief rules:**
  - No predation. The ammonites are placed clear of the group's lanes, so that no animal swims at one, and they jet away from the near one.
  - No text, no roars, no scary sounds.
  - The light changes slowly; the glints are soft and slow; no flashing; no stripes; no camera shake.

## Measured frame time (960×540, `tools/pou-frames.mjs`)

Each run is 4 interleaved pairs with the reference 5, 6.0 (8 frames a run); the first pair (compiling) is left out.

| frame | least / median | reference 5, 6.0 in the same run | ratio (least / median) |
|---|---|---|---|
| 19, 6.4 (the key: one in the air, splashes, bubbles) | 0.97 / 1.04 s | 1.00 / 1.03 s | 0.96 / 1.01 |
| 19, 5.7 (a leap, splash and breath) | 0.87 / 0.89 s | 0.98 / 1.00 s | 0.88 / 0.89 |
| 19, 10.4 (the echo: the near one) | 1.04 / 1.07 s | 1.02 / 1.03 s | 1.02 / 1.04 |
| 19, 13.3 (calm) | 0.97 / 1.01 s | 0.99 / 1.02 s | 0.98 / 1.00 |
| 19, 3.2 (rest, the window still opening) | 1.22 / 1.30 s | 1.08 / 1.20 s | 1.13 / 1.08 |
| 19, 2.4 (the window opening on the bones) | 1.04 / 1.05 s | 0.93 / 0.96 s | 1.11 / 1.09 |
| 19, 1.6 (the fossil in the rock, arriving) | 1.69 / 1.76 s | 1.18 / 1.20 s | 1.44 / 1.46 |

At 1.6 the shared rock dominates. In a separate run at the same moment, the reference scene's own frame took 1.55 s, this scene 1.78 s and scene 18 1.91 s. Every frame from the opening of the window on is at about 0.9–1.1× the reference.

## Notes on the work

- **The path:**
  - Each animal follows `icPath`: a slow cruise; the climb from 3.8 s; a leap whose top falls at about g (half-width .58·√(.17/scale) s); then a glide down to its final depth.
  - The pose (`icPose`) takes the heading from the path's velocity and bends the spine to the path's curvature.
- **The layout:** the rest positions, depths and leap times were chosen with a small simulation of each body as a segment, so that no two bodies overlap at any time from 0 to 14 s (the smallest gap is about .05).
  - At rest they swim side by side in a lateral echelon, so that they climb in parallel lanes rather than in a nose-to-tail chain.
  - The leader dives deepest after its leap, so that the later ones do not land on it.
- **The waterline events** (exits and entries, their x, the breath positions) are a table generated from the same parameters.

## Shared files

Nothing was edited. Suggestions:
- **SwiftShader (the frame tool) charges for code in branches that are not taken.** This scene went from about 1.7× the reference to about 1.0× by turning the costly optional parts into loops with a uniform, dynamic trip count, which do skip the work:
  - `for(int z=0;z<(cond?1:0);z++)`;
  - event loops over only the events under way;
  - fewer call sites of `piece()`.

  This may be worth a line in the brief for every painter.
- **As in scenes 12, 13 and 18:** `life()` returns early outside its own copy of the window. Doing that once in the shared tail would save time in every scene.
- **The fossil frames while the camera arrives** (about 1.2–1.9 s) are the slowest of every scene, mostly because of the shared rock.
