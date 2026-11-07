# Scene 6 (scene_05.glsl): Triceratops horridus, mother and calf, Hell Creek

## What happens

A golden late afternoon on the Hell Creek floodplain, about 66.5 million years ago. The sun is low on the right, in a warm haze. Behind
the animals there is a hazy band of forest: tall spire-shaped conifers (taxodiacean-like), fan palms (Sabalites) and broadleaf crowns
fade into the haze. In the middle distance there are flowering shrubs with cream blossoms, cycads, horsetails and a quiet backwater.
The ground is bare silt with moss and low ferns. There is no grass. Gnats glint in the low sun, two small dragonflies flit and hover over
the ferns on the right, and three small birds cross the sky slowly. Clouds drift, and the ferns and conifers sway in a light wind.

The mother (about 8 m) stands on the left, facing right and grazing low ferns. Her calf (about a third of her length) stands on the
right, facing her and nibbling. The calf has short stub horns that curve slightly back, a small frill with triangular edge bumps and big
eyes. Both have large rounded, non-overlapping scales, cross-faded between two sizes: big on the body, smaller on the limbs, with
the face and the frill their own. Their colours, at low contrast:

- dark olive-brown along the back, warm ochre-tan on the flanks and pale buff below (three-tone countershading);
- darker mottles along the back, and pale dapples on the calf.

The body, the thigh and the shoulder are shaped by light and shade. The near legs are part of the same smooth skin as the body, so
the dark contour runs only round the outside (the frill, the face and the keratin are separate structures in front). Soft folds sit
at the groin and behind the elbow, besides those on the neck.

The low sun is the one key light: warm on the lit side, with a warm rim where the bodies turn towards it, and cool shade. Each animal
casts a long soft shadow to the left and a little back, besides the contact shadows under the feet. Their horns are
conical keratin sheaths, thick at the base, pale at the base and darker towards the tip, with faint lengthwise grooves and a lit
side and a shadow side. Their beaks are keratin too. The frill is a warm brown with a soft, slightly rosy centre.

All times are on the **shader clock (uTau)**, the scene clock that the code uses. The sound adds the 0.3 s by which this clock lags
the press.

- 0–3.8 s: rest. Both graze with slow breathing and chewing, blinks and a slow tail sway.
- 3.8–4.35 s: the mother lifts her head. She shifts her weight back and takes one step forward with the near front foot (it lands at
  4.3 s). At the same time the calf lifts its head to watch (3.95–4.5 s).
- **4.3–5.75 s, the key:** the mother sways and shakes her frill. Her head tilts side to side and nods, with a period of 0.66 s (about
  four swings), and her body sways with it. Her frill slowly warms to a low-saturation rose-brown, rising over 1.2 s (4.4–5.6 s). It
  stays warm and fades over 1.8 s (8.0–9.8 s).
- 5.8–6.6 s: the mother turns her head down a little towards the calf.
- **6.0–7.3 s:** the calf imitates her. It makes quicker, smaller swings (a period of 0.56 s) with its little frill and two small
  stamps of its front feet (landing at 6.35 and 6.85 s). Its frill flushes more faintly, over 1.2 s, and fades by 10.6 s.
- **9.45–10.65 s, the echo:** the mother gives a soft closed-mouth rumble. Her throat swells under the jaw (a slow pulse of 3 per
  second) and her head dips slightly. **9.75–10.75 s:** the calf answers with a smaller rumble, and its throat swells too.
- 10.9–12.2 s: the mother lowers her head back to the ferns, and the calf goes back to nibbling (11.2–12.3 s). From 12.3 s on
  everything is calm, with grazing, breathing, blinks, the tail, the wind and the insects.

## Audible events (shader clock uTau; the sound adds the 0.3 s lag)

| t (s) | event | sound wanted |
|---|---|---|
| 0–14 | ambience | a warm evening hum of insects (gnats, a faint cicada-like buzz far off), light wind through ferns and conifers, now and then a thin soft call of a small bird far away; no frogs, no roars |
| 0–3.8, 12.2–14 | grazing | soft crunches of fern fronds being cropped by a beak, slow chewing, quiet nose breaths |
| 3.8 | the mother lifts her head | a low breath out through the nose, the rustle of a fern pulled loose |
| 4.3 | her near front foot lands | a heavy, soft, padded step on silt (a dull thud, a little dust) |
| **4.3–5.75** | **the key: the mother shakes her frill** | four slow, soft leathery whooshes with a dry rustle of skin and keratin, one on each swing of the head (about every 0.33 s, strongest 4.6–5.4); no voice |
| 6.0–7.3 | the calf imitates | quicker, lighter, smaller rustles (every 0.28 s), a little clumsy |
| 6.35, 6.85 | the calf's two stamps | two small, light padded taps on silt |
| **9.45–10.65** | **the echo: the mother's rumble** | a deep, soft closed-mouth rumble (about 50–90 Hz), swelling over 0.4 s with a slow tremolo of 3 per second; calm, not threatening |
| 9.75–10.75 | the calf's answering rumble | the same idea, higher (about 120–180 Hz) and quieter, a little wobbly |
| 10.9–12.2 | the mother lowers her head to graze | a soft exhale, the rustle of ferns |

## Camera

The default slow drift (3 % sideways and a 4 % zoom-in) is fine. If the sideways drift can be chosen, a slight drift to the right
(towards the calf) during 6–8 s would follow the imitation. The calf's tail reaches about x = +0.69; please keep the zoom from
cropping it.

## Evidence followed

- *Triceratops horridus*, Hell Creek Formation (Montana and the Dakotas), late Maastrichtian; *T. horridus* comes from the lower and
  middle parts, about 66.5 Ma. An adult is about 8–9 m long.
- Skin: from the "Lane" specimen (HMNS PR 2100), which shows large, rounded to polygonal, non-overlapping scales on the flank (several
  cm, some with a raised centre) and smaller ones on the limbs. I painted low domes with soft seams, larger on the body and smaller on
  the limbs, face and joints, with folds at the neck, shoulder and knee.
- Horns and beak: keratin sheaths over the bony cores (the sheaths make the horns longer and more pointed than the cores). The beak
  is a hooked rostral over a pointed predentary.
- The frill has epoccipitals along its edge, low and wide in the adult and more triangular in the calf. The juvenile has short brow
  horns that curve back and a small frill (Horner & Goodwin 2006, ontogeny of *Triceratops*).
- Posture: forelimbs semi-sprawled with the elbows a little out, and the hands pointing forward and outward (as in trackways); the
  hind limbs are erect and the tail is held off the ground.
- Behaviour: a frill display is a social signal (Hone, Naish & Cuthill 2012, on socio-sexual selection in ornamented dinosaurs). The
  closed-mouth rumble follows the closed-mouth vocalisation of archosaurs (Riede et al. 2016). Mother and calf together is reasonable
  (there are *Triceratops* juveniles and ceratopsid groups with young), but parental care in *Triceratops* itself is not shown.
- Plants and animals of Hell Creek: ferns, cycad-like plants, horsetails, *Sabalites* palms, taxodiacean conifers, many flowering
  shrubs and trees, dragonflies and small birds (birds are known from Hell Creek). There is no grass.

**Unverified or speculative:** the colours (countershading, the frill's warm display colour and its flush; nothing is known about
Triceratops colour), the throat swelling and the exact sound, the calf imitating its mother, the raised centres of the scales (left
out), and the exact sizes of the scales on the face.

## Frame time (SwiftShader, 960×540)

Measured pinned to one core (`taskset -c 3`) as the minimum of 3 runs, interleaved with scene 1 (the mammoths, which the brief puts
at about 1.0 s), after the quality pass:

- scene 1 at T 6: 3763 ms
- this scene during the display (T 5.0): 4231 ms (**1.12×**)
- during the rumble (T 10.0): 4262 ms (**1.13×**)
- while the window opens (T 2.6), the heaviest moment, with the fossil and the life both drawn: 5169 ms (**1.37×**)

All are within the 1.5 s limit (it was 1.13× and 1.41× before the pass).

Each animal is drawn with these pieces:

- the far legs;
- one smooth piece for the body with the near legs;
- the frill with the far horn;
- the face;
- the keratin (horns, beak, nails).

The scale pattern is cross-faded between fixed sizes (most pixels evaluate one). The roundness of each part follows its own
thickness. The trunk, thigh and shoulder are modelled by smooth low domes. The long shadows use a cheap silhouette. The bounding boxes
stay, for the tablets' GPUs.

## Shared files

Nothing is required. A wish: `K_SCALE` has fixed, strong cell seams that read as a mosaic. A parameter for seam strength and contrast
would have let me use it instead of painting the scales on `K_SKIN`.
