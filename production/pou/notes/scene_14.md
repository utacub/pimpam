# Scene 15 (scene_14.glsl): Iguanodon bernissartensis, an adult and its young, Bernissart

## What happens

It is a still, grey-green overcast day at the edge of a pool in the Bernissart basin (Belgium), about 125 million years ago. A pale
sun behind thin cloud, high on the left and out of the picture, brightens that side of the sky and its reflection. It gives one clear
key light from the upper left and a little in front: warm on the sunlit planes, cool in the shade, with soft bluish shadows cast back
and to the right on the bank. The pool fills the middle of the picture and mirrors:

- the pale sky;
- a misty forest wall;
- three conifers;
- two tree ferns on the far bank;
- the trunk of the feeding tree.

A slow ring spreads on the water now and then. On the near bank there is dark, damp earth with fern litter, moss and a few three-toed
footprints. Horsetails stand at the water's edge, low ferns grow in the foreground, and a tall tree fern frames the left. On the right
stands a conifer. Its trunk rises out of the top of the picture, and one low branch reaches to the left, hung with rope-like shoots of
small scale leaves (like the conifer foliage *Brachyphyllum*). There is no grass.

The adult *Iguanodon* (about 10 m, facing right) stands on all fours on the bank. It is built heavy:

- a deep, bulky trunk and chest;
- a thick neck, and a thick, deep tail that tapers only towards its end;
- massive forelimbs, each hand with three middle fingers bound into a hoof-like pad and a pale conical thumb spike pointing forwards
  and up;
- big hind legs with broad, three-hoofed feet;
- a long, deep, horse-like head with a toothless beak of dark keratin.

Its skin:

- Colour: dark grey-olive along the back, warm ochre-brown on the flanks and pale cream below (countershading), with darker bars
  across the back and tail and soft mottling, all at low contrast. The legs are mid-toned and darker towards the feet.
- Scales: small pebbly scales that catch the light, bigger on the body and smaller on the neck, the head, the limbs and the end of the
  tail.
- Folds: soft folds at the base of the neck, behind the elbow and at the groin.
- Form: the trunk's barrel, the thigh and the shoulder are shaped by light and shade, with a warm rim of light along the top. The dark
  contour runs only round the outside. The near forearm, where it lies over the body, is set off by its own roundness and a soft
  shadow beside it, not by a line.

Its young (about a third of its length, with the same build but a relatively bigger head and eyes, and paler, with its bars a little
bolder) stands in front on the right, facing left, with its head down in a clump of low ferns.

All times are on the **shader clock (uTau)**, the scene clock that the code uses. The sound adds the 0.3 s by which this clock lags
the press.

- 0–4.25 s: rest. The adult breathes, blinks, moves its head a little, and its tail sways slowly. The young nibbles the ferns
  throughout, with quick small bites.
- 4.25–4.55 s: the adult settles its hips back, and its near hind foot steps forward to brace (it lands at **4.55 s**).
- 4.55–5.7 s: **it rises from four legs to two.** The near hand leaves the ground at about 4.6 s and the far one at about 4.75 s. The
  body tilts up to about 40° over the hips, the hips sink and the knees bend under the weight, the hind feet stay planted, and the
  thick, stiff tail stays out behind, almost level, as a counterweight (it does not touch the ground).
  The arms hang in front of the chest, with the thumb spikes showing; they do nothing.
- 5.55–6.0 s: it stretches its neck into the low branch, and its beak opens (5.8–6.0 s).
- **6.0–7.3 s, the key: it plucks and chews.**
  - 6.2 s: the beak closes on a twig.
  - 6.22–6.42 s: the head tugs back and down, and the branch bends after it.
  - **6.45 s: the twig breaks off.** The branch springs back and shakes, and the shaking dies away by about 7.9 s. Four loose shoots
    flutter down and fade.
  - 6.45–7.5 s: a sprig hangs from the beak and shortens as it is eaten.
  - 6.55–7.9 s: it chews, about twice a second, and its head bobs slightly.
- 8.0–9.2 s: **it comes back down onto its hands.** The body tilts forward, the tail settles back into line, and the near hand lands
  at **9.0 s**, the far one at **9.18 s**. The weight then shifts forwards over the hands (8.95–9.3 s) and settles back (9.4–10.2 s).
- **9.5–11.0 s, the echo: the young looks up.** It lifts its head from the ferns (9.5–9.95 s) and looks up at the adult, holds, and
  goes back down to the ferns (10.6–11.1 s).
- From 11.1 s on everything is calm: breathing, blinks, small head movements, the young nibbling, the ripples, the wind in the
  plants.

Nothing threatening happens. The thumb spike is visible but not used.

## Audible events (shader clock uTau; the sound adds the 0.3 s lag)

| t (s) | event | sound wanted |
|---|---|---|
| 0–14 | ambience | a still pool under an overcast sky: a faint hum of insects, a light breath of wind in the conifer and the ferns, the odd drip; no roars, no birds |
| 4.8, 9.5 | a ring spreads on the pool | a single soft drip or plink on still water |
| 0–9.5, 11.1–14 | the young nibbles | small, quick, soft crunches of fern fronds (quiet, in short bursts) |
| 4.25–4.55 | the adult settles back | a deep breath out |
| **4.55** | the near hind foot lands | a heavy, soft thud on damp earth (a big animal, about 3 tonnes; dull, not a boom) |
| 4.6–5.7 | it rises | a long, deep breath in; the soft scrape of its hands leaving the ground (4.6, 4.75); the creak and shift of a heavy body |
| 5.55–6.0 | its head goes into the branch | a rustle of stiff conifer shoots |
| 6.22–6.42 | the tug | the branch creaks as it bends |
| **6.45** | **the twig breaks** | a crisp but soft snap of a green twig, then a swish as the branch springs back |
| 6.45–7.9 | the branch shakes | a dry rustle of shoots, dying away; a light patter as loose shoots fall |
| **6.55–7.9** | **chewing** | slow, rhythmic grinding of plant matter between cheek teeth, about twice a second, with the crunch of the twig at the start |
| 8.0–9.0 | it lowers itself | a long breath out |
| **9.0, 9.18** | the hands land | two heavy, soft thuds, a little lighter than the hind foot |
| 8.95–9.4 | the weight shift | a soft settling of the body; perhaps a contented low exhale through the nose |
| 9.5–11.0 | the young looks up | a tiny soft sniff, nothing more |

## Camera

The default drift is fine. Please keep these parts in view:

- the adult's head and the branch it feeds from, at x ≈ +0.10 to +0.30 and y up to about +0.30;
- the young, at x ≈ +0.19 to +0.40, y ≈ −0.43;
- the feeding tree's trunk, at x ≈ +0.56.

The adult's tail reaches x ≈ −0.78 when standing and runs to the left edge (about −0.9) when it rears; it may be cropped on 4:3. The adult's head goes up to about y = +0.30 when it rears, so the
zoom-in should not cut the top more than the default.

## Evidence followed

- *Iguanodon bernissartensis*: about 38 skeletons were found in 1878 in a coal mine at Bernissart, in the Sainte-Barbe Clays
  Formation (late Barremian–earliest Aptian, about 126–122 Ma). An adult is about 10 m long. Its anatomy follows Norman 1980 and 1986
  (the Bernissart monographs):
  - the long, deep skull with a toothless beak and cheek teeth;
  - a facultative quadruped: mostly on four legs as an adult, able to rear on its hind legs;
  - strong forelimbs, with the three middle fingers bound into a hoof-like unit, a conical thumb spike and a mobile fifth finger;
  - three-toed hind feet with hoof-like unguals;
  - a lattice of ossified tendons that stiffens the back and tail (this is why the tail stays straight and is held out behind as a
    counterweight when the animal rears, not dragged).
- Rearing to browse higher plants (to about 4–5 m) is the usual reading of its build. The function of the thumb spike is unknown
  (defence, foraging and display have all been suggested), so it is shown and kept neutral.
- Chewing: iguanodontians and hadrosaurs chewed with a grinding action of the cheek teeth (Norman & Weishampel 1985); the mouth
  stays nearly closed with small jaw movements.
- Plants: the Bernissart and Wealden floras include ferns (*Weichselia* is very common), tree ferns (*Tempskya* in the Wealden),
  horsetails, cycadophytes and conifers with scale leaves (*Brachyphyllum*-type). Grasses did not exist yet.

**Unverified or invented for the story:**

- the colours and countershading, the young's pale bars, and the skin texture (no skin is preserved for *I. bernissartensis*, so I
  painted small tubercles as in other ornithopods);
- the adult and its young together, with no evidence of parental care in *Iguanodon* (juveniles are rare at Bernissart);
- the exact rearing sequence and the sounds;
- the tree species being browsed.

## Frame time (SwiftShader, 960×540)

Measured pinned to one core (`taskset -c 3`) as the minimum of 3 runs, interleaved with scene 1 (the mammoths, which the brief puts
at about 1.0 s), after the quality pass, on a machine shared with the other painters:

- scene 1 at T 6: 4288 ms
- this scene at T 6.3 (reared, reaching): 4340 ms (**1.01×**)
- at T 9.4 (the hands landing): 4706 ms (**1.10×**)
- at T 2.2 (the window starting to open): 3624 ms (**0.85×**)
- at T 2.6 (the window opening, the heaviest moment): 5184 ms (**1.21×**)

So the cost is about 1.0–1.1 s in full life and about 1.2 s while the window opens. Both are within the 1.5 s limit.

The two animals are drawn by one body function, called once in a loop. Each animal has two skin pieces:

- the far limbs;
- one smooth piece for everything else (the body, the near legs, the forearm and the head, coloured per region), so that its outline
  is the outer silhouette only.

The thumb spike, the hoof-like pad, the hooves and the beak are colours within it, and the sprig is its own small piece. The scale
pattern is drawn at two fixed sizes (body and fine) plus the head's own, cross-faded where they meet; most pixels evaluate only one.
The roundness of each part follows its own thickness, so thin parts are never split along their axis. The trunk, thigh and shoulder
are modelled by smooth low domes, and the forearm by a tube. The cast shadows use a cheap silhouette. The bounding boxes stay, for the
tablets' GPUs.

## Shared files

Nothing is required.
