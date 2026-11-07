# Scene 7 (scene_06.glsl): Ankylosaurus magniventris at Hell Creek, late afternoon

## What happens

It is late afternoon at the edge of a forest clearing on the Hell Creek floodplain, about 66.5 million years ago. The sun is low on
the left behind the trees, and soft shafts of light slant through the haze. Across the clearing there is a hazy wall of forest, with
two tall conifers (like dawn redwoods) in the middle distance. Big trunks frame the left and right edges, and their crowns hang into
the top corners (in portrait they cover the top, with holes of sky). On the ground there are ferns, cycads and a magnolia-like shrub
with large cream flowers behind the animal's head. The forest floor has litter, moss and flecks of sun, and gnats glint in the light.
The plants sway in a light wind.

The ankylosaur (about 7 m long, facing left towards the sun) browses low ferns. Its body is a low, broad dome covered by bands of
keeled oval osteoderms, with little ossicles between them. Two armoured half-rings cover the neck, keeled triangular osteoderms run
along the lower flank and down the sides of the tail, and the stiff tail ends in a big two-lobed club. Its colours, at low contrast:

- a dark reddish brown along the back, warm tan on the flanks and pale buff below (three-tone countershading);
- the armour sheathed in darker keratin.

Its skin:

- the armour on the back, cross-faded into bigger scales on the lower flank and smaller ones on the limbs;
- the tail and the neck's half-rings each have their own pattern, blended where they meet;
- soft folds at the base of the neck, at the groin and behind the elbow.

The trunk's low barrel, the thigh and the shoulder are shaped by light and shade. The near legs are part of the same smooth skin as
the body, so the dark contour runs only round the outside (the club, the lateral osteoderms, the head and the nails are separate
structures).

The low sun on the left is the one key light: warm on the lit side, with a warm rim where the body turns towards it, and cool shade.
The animal casts a long soft shadow low along the ground to the right, besides the contact shadows under the feet. Its head is a broad wedge with the horns at the back corners of the skull, an armoured brow over a
small eye, and a short broad beak.

A hollow fallen log lies beside its tail, a little nearer to us. Its trunk is slightly bent and uneven, with deeply furrowed, flaking
bark, patches of moss and a small fern on top. Its broken end faces us: a ragged rim of weathered wood with splinters around a dark
hollow. A few dry leaves rest on it.

The legs are columns, with the elbows turned out, and stand on short toes with broad, hoof-like unguals.

All times are on the **shader clock (uTau)**, the scene clock that the code uses. The sound adds the 0.3 s by which this clock lags
the press.

- 0–3.75 s: rest. It crops ferns and chews, breathes and blinks, and the tail sways slowly.
- 3.75–4.65 s: it lifts its head and turns it towards the log (towards us). The near hind foot steps to brace (it lands at 4.45 s),
  and the forequarters settle a little lower (4.5–4.9 s).
- 4.75–4.97 s: the tail winds up and swings away from us, and the club rises.
- 4.97–5.15 s: the tail swings back hard towards us and down onto the log. The hips swing against it.
- **5.15 s, the key:** the club knocks the log, a hollow wooden «bong». The club bounces off a little (5.15–5.45 s), rests by the
  log, and goes back to rest (5.65–6.45 s).
- 5.15–6.3 s: the log shivers (the shiver dies away over about a second). A puff of dust comes out of the hollow end towards us, and
  a burst of dust rises where the club hit. Both drift and thin out, and they are gone by about 7.5 s. Seven dry leaves hop off the
  top of the log, flutter down in front of it and land between 6.6 and 6.9 s.
- 6.15–6.9 s: its head turns back.
- 6.55–7.95 s: it bobs its head twice and blinks twice (6.63 and 7.13 s), and the near front foot takes a small settling step (it
  lands at 7.35 s).
- **9.6–10.4 s, the echo:** a soft bird-like coo with the mouth shut. The throat swells and pulses twice (peaks about 9.8 and
  10.2 s), and the head lifts slightly.
- 10.9–11.9 s: it lowers its head to the ferns again. From 12 s on everything is calm, with browsing, breathing, blinks, the tail,
  the wind, the gnats and the shafts of light.

It never strikes another animal.

## Audible events (shader clock uTau; the sound adds the 0.3 s lag)

| t (s) | event | sound wanted |
|---|---|---|
| 0–14 | ambience | a quiet forest edge in the evening: a soft hum of gnats, a light wind in the conifers and ferns, now and then a faint, high call of a small bird far off; no roars |
| 0–3.75, 12–14 | browsing | soft crunches of fern fronds cropped by a beak, slow chewing, quiet breaths through the nose |
| 3.75–4.65 | it lifts and turns its head | a low breath out, a light rustle of ferns released |
| 4.45 | the near hind foot lands | a heavy, soft, padded step on forest litter (a dull thud, a little crackle of leaves) |
| 4.75–4.97 | the tail winds up | a short, low swish of a heavy tail through the air |
| 4.97–5.15 | the swing | a faster, deeper whoosh rising towards the hit |
| **5.15** | **the key: the club knocks the hollow log** | a resonant hollow wooden «bong», like a slit drum or a hollow log drum: a clear low knock (about 120–200 Hz) with a ringing body that decays over about 1 s; not a crack or a smash |
| 5.15–6.3 | the log shivers | the bong's tail: a soft wooden ring and a faint rattle of bark |
| 5.2–6.9 | leaves slip off and flutter down | a light patter and rustle of dry leaves; small taps as they land (6.6–6.9) |
| 5.15–6.5 | dust | a soft dry puff (barely audible, an airy «pff» from the hollow end) |
| 5.65–6.45 | the tail goes back to rest | a gentle swish |
| 6.55–7.95 | head bobs, blinks | nothing loud: perhaps a soft contented nasal breath |
| 7.35 | the near front foot settles | a soft padded step |
| **9.6–10.4** | **the echo: the coo** | a soft, low, bird-like coo with the mouth shut, in two pulses («hoo-hoo», like a large dove or a bittern, about 150–300 Hz), peaks at about 9.8 and 10.2 s; gentle, not a call of alarm |
| 10.9–11.9 | it lowers its head to graze | a breath out, ferns rustling |

## Camera

The default drift is fine. For this scene it moves to the right, towards the log, which suits the story, with the slow 4 % zoom-in.
The log's hollow end is at x ≈ +0.56–0.62 (the edge of the essential zone), so please do not let the drift go further right than the
default.

## Evidence followed

- *Ankylosaurus magniventris*: Hell Creek, Lance and Scollard formations, latest Maastrichtian (about 68–66 Ma). For size (about
  6–8 m), the broad wedge-shaped skull with squamosal and quadratojugal horns, the cervical half-rings, the keeled oval dorsal
  osteoderms, the keeled triangular lateral osteoderms (not long spikes), and the large two-lobed tail club with its stiff handle of
  interlocking vertebrae, I followed Arbour & Mallon 2017 (*FACETS*, "Unusual cranial and postcranial anatomy in the archetypal
  ankylosaur *Ankylosaurus magniventris*").
- Countershading follows *Borealopelta* (Brown et al. 2017, *Current Biology*), a nodosaurid with a reddish-brown back and a pale
  belly, used as an analogy.
- The coo follows the bird-like larynx of the ankylosaur *Pinacosaurus* (Yoshida et al. 2023, *Communications Biology*), which
  suggests bird-like sounds, and the closed-mouth vocalisation of archosaurs.
- Tail swing: the club was swung from side to side, mostly from the base, with the handle stiff (Arbour 2009; Arbour & Snively 2009).
  Here it strikes only a log.
- The plants of Hell Creek include ferns, cycads, flowering trees and shrubs (some magnolia-like) and taxodiacean conifers. There is
  no grass.

**Unverified or invented for the story:** the colours, knocking a log with the tail (no evidence of such behaviour), the head turn
towards the object, and the exact sound of the coo. The armour is simplified: the number and arrangement of the osteoderm bands are
schematic. The fossil shows the osteoderms lying in place over the skeleton.

## Frame time (SwiftShader, 960×540)

Measured pinned to one core (`taskset -c 3`) as the minimum of 3 runs, interleaved with scene 1 (the mammoths, which the brief puts
at about 1.0 s), after the quality pass:

- scene 1 at T 6: 3918 ms
- this scene at the knock (T 5.45): 3222 ms (**0.82×**)
- during the coo (T 10.3): 3122 ms (**0.80×**)
- while the window opens (T 2.6): 4009 ms (**1.02×**)

All are within the 1.5 s limit (it was 0.84× and 1.07× before the pass).

The animal is drawn with these pieces:

- the far legs;
- one smooth piece for the body, the neck, the tail and the near legs;
- the lateral osteoderms;
- the club;
- the nails;
- the face;
- the horns.

The trunk, thigh and shoulder are modelled by smooth low domes. The roundness of each part follows its own thickness. The long shadow
uses a cheap silhouette.

## Shared files

Nothing is required.
