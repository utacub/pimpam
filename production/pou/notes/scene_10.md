# Scene 11 (scene_10.glsl): a herd of Parasaurolophus walkeri calling across a swamp, Dinosaur Park Formation

## What happens

It is a grey, misty morning in a swamp on the coastal plain of the Dinosaur Park Formation, about 76 million years ago. A low sun
shows as a soft, pale disc through the mist at the upper right, with a warm glow around it that is mirrored in the water. Its light is
warm but veiled: the lit sides of the animals are warm, their core shadows cool, and their shadows on the mud are soft and bluish. A still, shallow sheet of water fills the middle of the picture. It mirrors the pale sky, the
forest wall and three tall conifers (like dawn redwoods or swamp cypresses), and there are faint ripples on it. Two misty walls of
forest lie behind it, with spire-like conifers and rounded crowns. Low ferns grow along the far shore, horsetails stand at the
water's edges, and large ferns grow in the foreground. The near bank is wet, dark mud with a trail of three-toed footprints. There is
no grass.

Five *Parasaurolophus* stand at different depths. Each has a long tubular crest sweeping back from a slightly large head, a broad
duck bill of dark keratin edged by paler, fleshy skin, a thick arched neck, a deep body that is deepest at the hips, and a deep tail
held level and tapering. They walk on four legs: big muscular thighs, steep shins and three-toed hoofed feet at the back, and
slender forelimbs with a long hoof-like hand at the front.

- Skin: small pebbly scales that catch the light on their sunny side, bigger on the body and smaller on the neck, the head, the legs
  and the end of the tail, with a few larger feature scales. There are soft folds at the base of the neck, behind the elbow and in
  front of the thigh.
- Colour: each animal has its own living colour, darker on the back and paler on the belly (countershading), with faint darker
  saddles across the back and tail and soft mottling, all at low contrast. The caller is olive-brown; the others are grey-olive,
  rufous, sage green and ochre-brown. The legs are mid-toned, darker towards the feet. The head has a darker crown and a pale jaw and
  throat.
- Display colour: only the crest is coloured, a muted rust-ochre, paler near its end, with a soft rim of light along its top and its
  underside in its own shade. This colour does not change.
- Light and form: the trunk, the thigh and the shoulder are shaped by light and shade, not by drawn lines; the dark contour runs
  only round the outside of each animal. A warm rim of light runs along the top of the back.
- Distance: the farther animals fade in value and colour into the mist (aerial perspective).

- The caller, the large adult in front on the mud bank, faces right.
- Three answerers stand in the water, each smaller, paler (more misty) and farther back than the last:
  - the nearest, right of centre;
  - the next, on the far right;
  - the farthest, a small one in the middle.
- The drinker stands in the water on the left. It drinks, and a ring spreads from its bill.

The animals in the water are mirrored in it, and slow rings spread around their legs.

All times are on the **shader clock (uTau)**, the scene clock that the code uses. The sound adds the 0.3 s by which this clock lags
the press.

- 0–3.5 s: rest. The animals breathe and blink, their heads bob a little and their tails sway. The drinker drinks.
- 3.5–4.35 s: the caller takes a step forward in the mud. The near front foot lands at 3.9 s, then the near hind foot at 4.35 s.
- 4.35–4.85 s: the caller lifts its head high, and the crest tilts back over its shoulders.
- **4.8–6.3 s, the key: the call.** The caller's throat and chest swell, and the throat pulses slowly (about twice a second) while the
  low note sounds. It ends at 6.3 s, and the head comes down by 7.0 s.
- 4.9–5.6 s: the others raise their heads a little to listen. They ease back from 6.6 s, but stay a little attentive until 11–12.5 s.
- **7.2 s: the first answer**, from the nearest answerer: head up, crest back, throat swelling, for about 1 s (7.2–8.2 s). Its head
  starts to rise at 6.75 s.
- **8.6 s: the second answer**, from the next one, smaller and paler (8.6–9.6 s).
- **10.0 s: the third answer, the echo**, from the farthest and palest one (10.0–11.0 s).
- 7.0–11 s: the caller holds its head a little higher to listen to the answers, then relaxes (11–12 s).
- 11.0–11.6 s: the drinker lifts its head from the water. It looks up, then lowers it again to drink (12.2–13.0 s).
- From 13 s on everything is calm: breathing, blinks, small head and tail movements, the ripples.

Nothing threatening happens. The calls are made with the mouth closed, and there are no roars or open jaws.

## Audible events (shader clock uTau; the sound adds the 0.3 s lag)

| t (s) | event | sound wanted |
|---|---|---|
| 0–14 | ambience | a quiet misty swamp: soft lapping and the odd drip of water, a faint hum of insects, a light breath of wind in the horsetails; no frogs (to keep the calls clear), no roars |
| 3.1, 6.25, 9.4 | the drinker sips | a soft sip or lap at the water as a ring spreads from its bill |
| 3.9 | the caller's front foot lands | a soft, wet squelch in mud |
| 4.35 | the caller's hind foot lands | a heavier, deeper squelch, with a little suck of mud as the foot settles |
| 4.35–4.85 | the caller lifts its head | a long, deep breath in through the nose |
| **4.8–6.3** | **the key: the call** | a low, mellow horn-like note (a low brass or deep wooden horn, a fundamental around 50–100 Hz with soft harmonics, a hollow, resonant tone from the long crest). It swells over about 0.3 s, holds with a slow, gentle pulse (about 2 per second) and fades by 6.3 s. 1.5 s in all. Calm, not a roar |
| **7.2–8.2** | the first answer | the same kind of horn note, softer and a little higher, farther away (less bass, more reverberation), about 1 s |
| **8.6–9.6** | the second answer | softer still, higher, farther |
| **10.0–11.0** | the third answer (the echo) | the softest, highest and most distant of the three, almost lost in the mist |
| 11.0–11.6 | the drinker lifts its head | water dripping and trickling from its bill back into the swamp |
| 12.2–13.0 | the drinker lowers its head | a faint ripple as its bill touches the water |

## Camera

The default drift is fine. Keep the essential area visible:

- the caller's head is near x ≈ 0 to +0.05;
- the nearest answerer's head is at x ≈ +0.33;
- the farthest one is at x ≈ +0.17;
- the second answerer's head is at x ≈ +0.61, at the right edge of the essential zone.

So please do not drift or zoom so far that x = +0.62 leaves the frame. The caller's tail runs off to the left edge; that is fine.

## Evidence followed

- *Parasaurolophus walkeri*: Dinosaur Park Formation, Alberta, late Campanian, about 76.5–75 Ma (holotype ROM 768, Parks 1922). An
  adult is about 9–10 m long.
- The crest is a long, hollow tube formed by the premaxillae and nasals, with the nasal passages looping inside it. Its use as a
  resonator for low sounds follows Weishampel 1981 (*Paleobiology*, acoustic analyses of lambeosaurine crests) and the computer model of
  the *P. tubicen* crest by Sullivan & Williamson 1999. The low hearing range follows the inner-ear work on lambeosaurines by Evans,
  Ridgely & Witmer 2009 (*Anatomical Record*). A display role for the crest (visual and acoustic) is the usual reading (Hone, Naish &
  Cuthill 2012). The calls are drawn with the mouth closed and the throat swelling, as closed-mouth vocalisation in archosaurs (Riede
  et al. 2016).
- Body: hadrosaurid proportions follow published skeletal reconstructions:
  - a deep body with tall neural spines over the hips, sloping down to the shoulders;
  - a deep, level tail stiffened by ossified tendons;
  - an arched neck;
  - long hind limbs with three-toed hoofed feet;
  - slender forelimbs that bear weight, with a long hand of fused, hoof-like fingers in a fleshy pad, as known from hadrosaur
    "mummies".
- Skin: small pebbly, non-overlapping tubercles with a few larger feature scales, as in hadrosaurid skin impressions (Bell 2014, on
  hadrosaurid skin in general).
- Herd: hadrosaurids are thought to have lived in groups (bonebeds of several individuals and parallel trackways). For
  *Parasaurolophus* itself this is not shown directly.
- Setting: the Dinosaur Park Formation was a humid coastal plain crossed by rivers, with swamps and backwaters. Its flora includes
  ferns, horsetails, taxodiacean and other conifers, and flowering plants. There is no grass.

**Unverified or invented for the story:**

- the colours and countershading, and the crest's display colour;
- the exact sound of the call, and the call-and-answer exchange;
- the throat swelling;
- the drinking.

The size order of the answerers (smaller and paler farther back) shows depth as well as age.

## Frame time (SwiftShader, 960×540)

Measured pinned to one core (`taskset -c 3`) as the minimum of 3 runs, interleaved with scene 1 (the mammoths, which the brief puts
at about 1.0 s), after the quality pass:

- scene 1 at T 6: 3878 ms
- this scene during the call (T 5.6): 3261 ms (**0.84×**, about 0.8 s)
- this scene during the second answer (T 9.0): 3271 ms (**0.84×**)
- this scene while the window opens (T 2.6), the heaviest moment, with the fossil and the life both drawn: 4457 ms (**1.15×**, about
  1.15 s)

All are within the 1.5 s limit.

To keep the cost down, the five animals are drawn by a single body function called once per pass, in two passes. Each animal always
uses the same pass, so its screen derivatives stay continuous. Each animal has three pieces: the far legs, the crest, and one smooth
piece for the body, the near legs and the head together. The scale pattern is drawn at two fixed sizes (body and fine) cross-faded
where they meet, so the cells never shear into stripes; most pixels evaluate only one. The roundness of each part follows its own
thickness, so thin parts (legs, arm, the end of the tail, the bill) are never split along their axis; the thigh, shoulder and trunk
are modelled by smooth low domes. The reflections are a cheap silhouette mirrored in the water.

## Shared files

Nothing is required.
