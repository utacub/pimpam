# Gegants del blau (CE38, 0.36) · production notes

Pim Pam is a suite of cause–effect activities for children with severe and multiple disabilities, used with one switch. «Gegants del
blau» is a journey across the oceans, from the Arctic to the Southern Ocean, in twenty scenes. Marc chose style C, «documental pintat»,
on 2026-11-01 (style tests: production/gegants_proves). Plan: https://claude.ai/artifact/Ahxsugem1v9T9bMGY4HmzB

## One press

- 0–2 s, travel: a horizontal travelling through open water to the next place. The scene left behind veils into its water colour while
  the camera speeds away to the right; the new one comes out of its own water as the camera slows down into its first framing. Marine
  snow streaks with the speed. Longer and faster between oceans.
- 2–5 s, entrance: the main animal swims into the frame (from a side, up from the dark, down from the surface). The giants come in
  close, so a part (an eye, a flipper) is seen before the size.
- 5–11 s, the gesture, with things happening round it (birds, remoras, light, bubbles, small fish).
- 11–14 s, exit: the animal leaves the frame; its trail (bubbles, ripples, sand) stays.
- Then the empty scene slows and darkens until the next press (waitCue, done by the app's clocks and the renderer's uDark).
- 16 s per press for the whale shark (15) and the blue whale (20): stimulus 14 s instead of 12.
- After the twentieth, the climb (GG_RETURN s): the camera rises with the blue whale to the surface, its blow against the sunset. That
  is the surface scene (scene_20.glsl, #define SURFACE) at a small clock; with a large clock (GG_IDLE) the same sea, empty, is the rest
  picture before the first press and after the climb.

## Engine

- World units of 10 m, local to each scene; the sea surface is y = 0, depth is -y. Screen y in [-.5, .5].
- The camera is computed in JavaScript (dist/gegants.js): each scene has keys [t, x, y, view height], joined by a monotone cubic (no
  overshoot; log of the height). The travel joins the scene left behind and the new one with the veil. «Moviment de càmera: suau»
  (setting ggCamera 'soft') draws every key towards the scene's mean framing and pulls back a little; the travel is shorter.
- Narrow screens (4:3, portrait) pull the camera back (GG_FIT), as in the well.
- One WebGL2 program per scene: common.glsl + scene_head.glsl + scene_NN.glsl + scene_tail.glsl, gathered by make_shaders.py into
  dist/gegants-shaders.js. dist/gegants-gl.js draws one or two layers (two during a travel) and a last pass (vignette, darkening,
  dither).
- A scene file defines `void scene(vec2 w,float T)`: it fills BG (decor: water, sky, sea floor, light) and FG (figures, premultiplied
  with putF: the animals and everything that takes part in their gesture: splashes, bubbles they make, the ice the bowhead breaks).
  It may set the light (SUND, SUNC, SKYC, WAT0) and VEIL (the colour of its open water) at its start.
- The tail composes: decor (full, dim with its opacity, none: the base, black or white), the figures over it, the veil, the tone of
  style C (ACES ×1.4, gamma 2), and the layer's mix.

## Art direction: style C, «documental pintat»

- Physical light under water: red absorbed first (KD, KH; Pope & Fry, 1997), caustics strongest near the surface, light shafts that
  move with the swell, marine snow in three layers, the surface seen from below as a bright rippled mirror.
- Scale by slowness, haze (blue and pale with distance) and small companions (fish, birds, a hull), never by numbers or people.
- Every figure: shading with a tube normal, a rim light, a soft dark edge that separates it from the water, also with dim or no decor.
- Whole-screen compositions; the giants take more than half the frame when they pass.
- Cetaceans swim with an up-and-down stroke; fish with a side-to-side stroke (seen from the side, their tail fin narrows and widens).
  The bigger the animal, the slower its wave.

## Rules (strict)

- No predation, no hunting; filter feeding is fine. No frightening sound or gesture.
- Faces only on animals. No written words, numbers or symbols.
- Photosensitivity: ≤ 3 flashes per second, none saturated red; ≤ 5 pairs of high-contrast stripes; rotation ≤ one turn per 4 s
  (spinner dolphins: the spin is shown by the body's light and dark sides, slowly enough, a few turns in a long leap); the camera never
  shakes (the water moves instead); glints soft and slow.
- Decor settings must work: dim, none, base black or white.
- Sound: everything must sound real (recorded or generated); no pads, organs or held drones; every phrase ends plucked or struck.

## The twenty scenes (index = scene - 1)

| # | Ocean | Animal | Entrance | Gesture | Exit | Camera |
|---|---|---|---|---|---|---|
| 1 | Arctic | narwhals | from the left under the ice | rise to a crack in the ice and breathe, tusks up | under the ice to the right | low angle to the ice |
| 2 | Arctic estuary | belugas | from the right over the pebbles | roll and rub on the pebbles, a cloud of silt | away into the green | over the floor |
| 3 | Arctic | bowhead | the head from below, close | pushes up through thin ice, V blow | sinks under the ice | scale reveal, split |
| 4 | N Atlantic | basking shark | head-on, mouth closed | opens its mouth wide, gill arches, plankton | out to the right | scale reveal |
| 5 | Gulf of Maine | three humpbacks | from below, unseen | a spiral of bubbles rises into a ring; the three rise through it, mouths open | sink | low angle |
| 6 | Gibraltar | bluefin tuna school | a river from the left | the whole school turns at once, a flash of silver | out to the right | panning |
| 7 | Ligurian Sea | four sperm whales | out of the dark, upright | sleeping still, then all wake, turn level and go, clicking | into the dark | over the floor (deep) |
| 8 | Pelagos | fin whale | fast, right to left, close | rolls on its side (white right jaw), rises to blow | out to the left | low angle, panning |
| 9 | Mediterranean | ocean sunfish | up from the deep blue | lies on its side at the surface to warm, fins slowly | sinks | low angle |
| 10 | Mediterranean | six dolphins + sailboat | from behind | ride the bow wave, leap in pairs | ahead of the boat | split |
| 11 | Caribbean | humpback | rises from the deep, singing | hangs head down, singing; rises and breaches | swims away under the foam | split |
| 12 | Gulf of California | hammerhead school | as a shadow over the camera | circles slowly over the seamount, one turns fast | out of frame | low angle |
| 13 | Pacific deep | oarfish | down from above, vertical | holds upright, the red dorsal fin undulates head to tail | down into the dark | over the floor (deep) |
| 14 | Hawaii | spinner dolphins | from the left | one leaps and spins several times, others leap alongside | out to the right | split |
| 15 | Ningaloo | whale shark | head-on: the mouth and spots, then the body | rises, mouth open, filtering; passes over and shades the light | out to the left | scale reveal |
| 16 | Maldives | three mantas | flying in from the blue | one somersaults backwards again and again; one hovers over a cleaning station | out | over the floor |
| 17 | Shark Bay | dugong | grazing along the meadow | uproots seagrass, leaves a trail and a cloud of sand; rises to breathe | rises out of frame | over the floor |
| 18 | Head of Bight | southern right whale and calf | together | the calf slides over its mother's head; she lifts her tail out of the water | together | panning |
| 19 | Antarctica | orca family with a calf | between the ice floes | one spyhops: head straight out of the water, looking round | between the floes | split |
| 20 | Southern Ocean | blue whale | slowly: the eye first, then the whole body | speeds up, opens its mouth, the throat fills with water and krill; closes and filters | out to the left | scale reveal |

Then the climb (the surface scene): the blue whale rises with the camera to the surface and blows against the sunset.
