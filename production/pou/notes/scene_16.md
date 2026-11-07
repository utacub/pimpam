# Scene 17 (scene_16.glsl): Stegosaurus stenops on the Morrison floodplain

## What happens

It is a warm, bright day on the Morrison floodplain, about 152 million years ago. One key light, a warm sun, comes from high up and a
little from the left: the lit planes are warm, the shade is cool with the light of the wide sky, and the animal casts a soft shadow
on the ground, mostly under it and a little to the right. The sky is wide and blue, with a warm, pale haze towards the horizon and slow, soft clouds. Two pterosaurs glide far off, high
up, with a slow wingbeat now and then.

The ground is pale, dry silt cracked into polygons, with darker patches of moss and old leaves and a few three-toed footprints behind
the animal. Dust haze lies over the far ground, and pale wisps drift slowly across it. Motes of dust glint in the light near the
ground. Distant araucarias stand on the horizon: tall bare trunks with flat-topped crowns. Cycads and low ferns are scattered over the
plain, a cycad stands near the head, and another stands just behind the tail. There is no grass.

The Stegosaurus (about 6.5 m, facing left) browses low plants. Its back arches highest over the hips and slopes down to a small head
with a beak, carried low. Its hind legs are long pillars, and its front legs are short columns.

- Skin colour: dark olive-brown along the back, warm ochre on the flanks and pale cream below (countershading), with darker irregular
  blotches and soft mottling at low contrast. The legs are mid-toned and darker towards the feet.
- Scales: small pebbly scales that catch the light, bigger on the body and smaller on the neck, the head, the limbs and the end of the
  tail.
- Folds: soft folds at the base of the neck, behind the elbow and at the groin.
- Form: the trunk's barrel, the thigh and the shoulder are shaped by light and shade, with a warm rim of light along the top of the
  back. The dark contour runs only round the outside of the body.
- Plates: two alternating, staggered rows (17 in all) of large, thin, rounded plates with softly pointed tops. The largest (about
  0.6 m showing) stand over the hips and the base of the tail, and they get smaller towards the neck and the end of the tail.
  - Each is a dusky grey-olive, with fine vascular grooves radiating from its base.
  - Each has a thin edge that the high sun lights through, a warm pale glow along the upper rims.
  - The far row is in the shade of the near one.
- Thagomizer: two pairs of long pale horn spikes at the end of the tail, angled out, up and back. The front pair is more upright, the
  rear pair lies further back. The near spike of each pair is in front of the tail, the far one behind it.

All times are on the **shader clock (uTau)**, the scene clock that the code uses. The sound adds the 0.3 s by which this clock lags
the press.

- 0–3.8 s: rest. It crops low plants and chews (about 1.8 bites per second). It breathes and blinks, and its tail sways slowly. The
  plates are a dusky grey-olive.
- 3.8–4.3 s: it lifts its head to about a metre above the ground and takes a step forward. The near front foot lands at **4.0 s**,
  the near hind foot at **4.4 s**, the far front foot at about 4.6 s and the far hind foot at about 4.9 s. A small puff of dust rises
  where each near foot lands.
- **4.0–7.0 s, the key: the plates flush.** Over 3 s, a low-saturated rose rises through each plate from its base towards its
  top, following the vascular grooves (deeper in the grooves, lighter between them). The thin upper rims stay paler. They hold this
  colour until 9.6 s.
- 6.2–6.95 s: a soft rumble (optional). The throat swells slightly with a slow pulse, and the head dips a little.
- 7.2–7.9 s: it lowers its head to the plants again, and chewing resumes from about 7.75 s.
- **8.4–9.6 s, the echo: the tail swings.**
  - 8.4–9.15 s: the tail straightens and rises in a slow arc towards the cycad behind it.
  - **9.2 s:** the spikes brush the cycad's fronds. The fronds shake (dying away over about 1.5 s), and its crown leans away.
  - 9.25–9.9 s: the tail swings slowly back down to rest.
- 9.2–11.0 s: the cycad sways back and forth a few times and settles.
- **9.6–11.0 s:** the plates fade back to their dusky grey-olive, the colour draining back down towards the bases.
- From 11 s on everything is calm: browsing, breathing, blinks, the slow tail sway, the dust, the gliding pterosaurs.

Nothing threatening happens: the spikes only brush a plant.

## Audible events (shader clock uTau; the sound adds the 0.3 s lag)

| t (s) | event | sound wanted |
|---|---|---|
| 0–14 | ambience | a warm, dry, open plain: a light dry wind, a faint dry buzz of insects, now and then the soft rattle of stiff cycad leaves in the wind; no roars |
| 0–3.8, 7.75–14 | browsing | slow, soft crunching of tough fronds cropped by a small beak (about 1.8 bites per second), quiet breaths |
| 3.8–4.3 | it lifts its head | a breath out through the nose |
| **4.0** | the near front foot lands | a heavy, soft, padded step on dry silt, with a faint puff of dust |
| **4.4** | the near hind foot lands | a heavier padded step, the same kind |
| 4.6, 4.9 | the far feet settle | two softer steps |
| 4.0–7.0 | the plates flush | silent (if the score has an ambient layer, a slow warm swell can follow it) |
| 6.2–6.95 | a soft rumble (optional) | a very soft, low closed-mouth rumble (about 40–80 Hz) with a slow pulse of 3 per second; calm |
| 8.4–9.15 | the tail swings | a slow, low swish of a heavy tail through the air |
| **9.2** | **the spikes brush the cycad** | a dry rustle and scrape of stiff, leathery cycad leaflets against horn, then the leaves rattle and die away over about 1.5 s; not a hit or a crack |
| 9.25–9.9 | the tail swings back | a soft swish |
| 9.2–11.0 | the cycad sways back | the last faint rustles of its leaves |

## Camera

The default drift is fine. Please keep these parts in view:

- the head, at x ≈ −0.53 to −0.57 (after the step);
- the place where the spikes meet the cycad, at x ≈ +0.55 to +0.62, y ≈ 0.

So please do not drift or zoom so much that either end of |x| ≤ 0.62 leaves the frame. The tallest plates reach y ≈ +0.20.

## Evidence followed

- *Stegosaurus stenops* (Marsh 1887): Morrison Formation (Colorado, Wyoming, Utah), Kimmeridgian–Tithonian, about 155–150 Ma. An
  adult is about 6.5–7 m long. The most complete specimen is "Sophie", NHMUK PV R36730 (Maidment et al. 2015).
- Plates: 17 thin bony plates in two staggered, alternating rows, the largest over the hips and the base of the tail. Their surface
  has a network of vascular grooves, and in life they were covered in keratin (Christiansen & Tschopp 2010, on *Hesperosaurus*). A
  role in display and species recognition is favoured (Main et al. 2005, *Paleobiology*). The idea that blood flow through the plates
  could change their colour is speculative; the flush here is a gentle, low-saturated version of that idea.
- Tail: four spikes in two pairs, angled backwards, outwards and up (the thagomizer), on a fairly mobile tail. The spikes were used in defence
  (Carpenter et al. 2005, on an *Allosaurus* vertebra with a puncture wound); here the tail only brushes a plant.
- Head and feeding: a small, low head with a toothless beak and small leaf-shaped teeth, and a weak bite (Reichel 2010). It fed on
  low plants, mostly below about 1 m. Small bony ossicles in the throat skin (Gilmore 1914) are hinted at under the neck.
- Body and limbs: hind limbs much longer than forelimbs; columnar legs; short hind feet with three hoof-like toes; forefeet with
  short fingers in a tubular, hoof-like arrangement (Senter 2010). Skin of small polygonal scales and tubercles, as preserved in
  *Hesperosaurus* (Christiansen & Tschopp 2010).
- Setting: the Morrison was a semi-arid floodplain with seasonal rivers. Its flora had ferns, cycads, bennettitaleans, ginkgos,
  horsetails and conifers, including tall araucarians, but no grass. Pterosaurs (for example *Harpactognathus* and *Mesadactylus*)
  lived there.

**Unverified or invented for the story:**

- the colours, and above all the plates' flush (no evidence of colour change);
- the rumble;
- the tail brushing a cycad (the tail's lateral swing is real; the contact is a gentle, invented moment).

The tail swing is drawn in side view as a straightening and lifting arc, with the cycad just behind the tail.

## Frame time (SwiftShader, 960×540)

Measured pinned to one core (`taskset -c 3`) as the minimum of 3 runs, interleaved with scene 1 (the mammoths, which the brief puts
at about 1.0 s), after the quality pass:

- scene 1 at T 6: 3813 ms
- this scene, plates flushed (T 7.3): 3045 ms (**0.80×**)
- the tail brushing the cycad (T 9.5): 3177 ms (**0.83×**)
- the window opening (T 2.6), the heaviest moment: 3986 ms (**1.05×**)

All are within the 1.5 s limit.

There is one animal, drawn with these pieces:

- the far limbs;
- the far row of plates with the far spikes;
- the near row of plates;
- one smooth piece for the body, the neck, the tail, the near legs and the head, coloured per region, so that its outline is the
  outer silhouette only;
- the near spikes.

The scale pattern is drawn at two fixed sizes (body and fine) plus the head's own, cross-faded where they meet; most pixels evaluate
only one. The roundness of each part follows its own thickness. The trunk, thigh and shoulder are modelled by smooth low domes. The
cast shadow uses a cheap silhouette. The mouth line and the dust are drawn with shadow() and veil().

## Shared files

Nothing is required.
