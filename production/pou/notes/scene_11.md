# Scene 12 (scene_11.glsl): Pteranodon longiceps and an elasmosaurid at the Western Interior Seaway

## What happens

Sunset at the eastern shore of the Western Interior Seaway, about 85 million years ago (Niobrara Chalk time). The sun stands low over a
calm sea, right of centre, behind everything: the sky runs from gold at the horizon through salmon to violet, with long thin clouds lit
from below; a soft, slow sun path on the water; small swells; a wave breaks along the beach every 6.5 s and runs up the sand. On the
beach: warm sand with wind ripples, a strand line, a broken valve of a giant inoceramid clam (Platyceramus) and a bleached log of
driftwood in the bottom left corner. Three Ichthyornis (seabirds of the same sea) drift far off.

A big male Pteranodon (wingspan about 6.6 m) stands on all four limbs on the beach, left of centre and close to us (about .37 of the
screen high), its long shadow thrown towards us by the low sun, the edges of its fur (pycnofibres) glowing in the back light. Its stance
follows the trackways: the hands well forward and outside the feet, the body tilted up at the front, the neck up, the head and crest held
level; a full, furred torso with a deep chest; thick, muscular upper arms and forearms; each folded wing a dark bundle of membrane
gathered along the forearm, with a slack fold back to the ankle, and the wing finger one tapered spar folded up and back behind the
shoulder; short, thinner hind legs with plantigrade feet.

- 0–3.8 s: rest. It breathes, looks about and out to sea (1.0–3.0 s), blinks; at 2.1–3.1 s it settles its folded wing (a small shrug of
  the near arm).
- 3.8–4.36 s: it crouches on all fours, head down, arms flexed.
- 4.42–4.8 s, **the key**: the quadrupedal launch. The arms straighten under it and vault it into the air (the push is under way at
  4.6 s; sand is thrown back from the hands), the body pitches up, the wings unfold (4.56–4.8 s) and open raised.
- 4.8–7.7 s: three slow, deep flaps (mid-downstroke at 5.04, 5.99 and 6.94 s); it climbs and turns away towards the sun, getting
  smaller quickly as it flies away. The wings, lit through, glow orange with fine fibres in them, thicker and darker near the arm and
  the body; the wing finger flexes through the stroke (its tip lags behind), the trailing edge is drawn in and the membrane stays
  attached to the ankle.
- 7.7–10 s: it glides along the sunset in a three-quarter view, high over the sea, wings spread.
- 8.6–10.2 s, **the echo**: out on the sea, a plesiosaur's small head breaks the surface (8.72 s), then its long neck rises out of the
  water at a moderate slope, water running down it, drips falling from its chin, rings spreading on the water and its reflection under
  it. It holds, turning its head a little (9.4–10.6 s).
- 10.2–11.6 s: it goes back: the head goes forward and down into the sea first (10.9 s) and the neck follows it in an arc, the last of it
  under at about 11.5 s.
- 10–13.3 s: the pteranodon banks and turns slowly in the distance, passing above the sun, and glides back to the left; from 13.3 s it
  glides on in a three-quarter view. The waves go on.

## Audible events (seconds on the scene's clock)

The times are on the scene's own clock (the shader's `uTau`), as for my scene 8. **The app's clock wakes over the first 0.6 s, so these
are about 0.3 s earlier than the seconds since the press** (the frame tool renders `T` = clock + 0.3). If the sound is driven by the same
clock as the picture, use them as written.

| t (s) | event | sound wanted |
|---|---|---|
| 0–14 | ambience | a calm sea: soft regular waves on sand, a light evening breeze; far, faint seabird calls are acceptable (gentle, not gull screams) |
| 1.6 | a wave breaks along the beach (from left to right over ±0.3 s) | a soft low breaking wave |
| 1.7–2.8 | its water runs up the sand and back | a gentle swash, foam fizz, then a trickle draining back |
| 2.3, 2.9 | the pteranodon settles its folded wing | a soft leathery rustle, very short |
| 3.9–4.4 | it crouches | a faint scrape of claws on sand |
| **4.6** | **the key: the vault off its arms** | a soft muffled push in sand with grains thrown back (a puff), no voice |
| 4.8 | the wings open | the soft whump of a large membrane catching the air |
| 5.04, 5.99, 6.94 | three slow downstrokes | deep, slow, airy wing whooshes (large sail-like wings, about 1 beat per second), each a little further away |
| 7.7–10 | the glide | nothing, or the faintest rush of air fading out |
| 8.1 | the next wave breaks | soft low breaking wave (as at 1.6), then swash 8.2–9.3 |
| **8.72** | **the echo: the plesiosaur's head breaks the surface** | a gentle, rounded splash, water parting |
| 8.8–10.0 | the neck rises out of the sea | water streaming off it; a few drips 9.0–10.2 |
| 10.0 | it breathes at the surface | one soft, deep exhale through the nostrils (a puff), then a short inhale |
| 10.9 | its head goes back into the sea | a soft plop |
| 11.5 | the rest of the neck slides under | a low gurgle, rings lapping |
| 14.6 | the next wave | as at 1.6 |

## Camera

The default drift for this stimulus (3 % to the left, 4 % zoom in) suits it. Everything stays inside the final framing: standing, the
pteranodon spans x ≈ −.58 … −.21; in flight it stays within x ≈ −.62 … .62 (wing tips included) and y ≤ .35; the plesiosaur is at
x ≈ 0 … .15. The portrait frame was checked (540×960): the pteranodon fits, the beach and sky continue.

## Evidence followed and what is unverified

- Pteranodon longiceps (Smoky Hill Chalk, Niobrara Formation, Kansas, about 86–84.5 Ma): skull, crest and proportions after Bennett
  (1994, 2001: the osteology of Pteranodon, Palaeontographica A 260); a large male about 6.6 m in span. The crest is the long backswept
  male type. **Its colours are unknown**: the muted red band on the crest is a display colour assumed by me (to verify, or treat as an
  artistic choice); the warm brown pycnofibres and the dark membrane are likewise assumptions.
- Pycnofibres: hair-like body covering known in many pterosaurs (e.g. Kellner et al. 2010; Yang et al. 2019, Nature Ecology &
  Evolution 3: 24–30). Actinofibrils: stiffening fibres in the wing membrane (Bennett 2000; Kellner et al. 2010), drawn as fine lines
  running out along the wing.
- Quadrupedal launch: Habib (2008), "Comparative evidence for quadrupedal launch in pterosaurs", Zitteliana B 28: 159–166; Witton &
  Habib (2010). The vault off the arms is the key moment. The folded wing finger pointing up and back when standing follows skeletal
  reconstructions and trackway-based stances (Witton 2013, *Pterosaurs*).
- The flap rate (about one beat per second, three beats then gliding) is an estimate for a giant pterosaur, not a measurement.
- The plesiosaur is an elasmosaurid such as Styxosaurus snowii (Smoky Hill Chalk). Only its neck and head come out. **Elasmosaur neck
  posture is debated**: studies of vertebral flexibility (e.g. Zammit, Daniels & Kear 2008; Noè, Taylor & Gómez-Pérez 2017) argue the
  neck was held roughly straight and could not be raised like a swan's; raising the front of the neck at a moderate slope with the head
  held forward is the most I allowed, and **even this is an artistic liberty to verify**. It does not interact with the pteranodon (no
  predation, no threat).
- Ichthyornis dispar (seabird, same formation), Platyceramus (giant inoceramid clam, same formation) and drifted conifer logs (found in
  the chalk) are of the same age and place.
- A beach: the chalk itself was laid down far from shore; the scene shows the eastern shore of the same sea (artistic).
- Sun height: the long shadow is drawn shorter than a real sunset shadow would be, so that it stays on the screen.
- In flight the animal is seen a little more from below than the true view from the beach would give, so that its wings show their
  undersides against the light (an artistic liberty of the projection).

## Measured frame time (SwiftShader, 960×540)

The machine was shared, so I measured against the reference tyrannosaur frame (5, 6.0 s) in the same runs and take the least of several
runs (single frames jump by up to 2 s at random). After the revision (the animal is about 1.9 × the area it was): the standing frames at
full life (3.9–4.6 s) take about 1.4 s against 1.0–1.1 s for the reference (≈ 1.35 ×); the last frames of the window's opening (3.6 s)
about 1.7 s; flight 1.45–1.6 s; the plesiosaur frame (10.2 s) about 1.55 s.

Technique notes for the others: on SwiftShader the number of `piece()`/`PIECE` call sites (each inlines `styleA`) costs more than the
work skipped by early returns; merging the hand, the claws and the wing finger into one skin piece, and the open and folded membrane into
one, cut the standing frames by about a third. Two more savings: (1) the frame computes `fossil()` for every pixel while `uLife` < .999,
even inside the open window where the rock is not seen; a copy of the tail's `winD` at the top of `fossil()` returns early there;
(2) once `GROW` is larger than the flesh's own depth over the bones (about .14 here), `max(d, dB - GROW)` is just `d`, so the bones need
not be computed after that.

## Revision after the coordinator's review

The standing pteranodon read as a stick skeleton. It is now 1.37 × bigger (.205 screen units per metre, about .37 of the screen high),
with a full torso and deep chest, thick upper arms and forearms, the folded wing as one spar with a dark membrane bundle along the
forearm (the far wing's spar lies behind the near one), shorter and thinner hind legs with plantigrade feet, the trackway stance (hands
forward and outside, body tilted up at the front, head and crest level), and the faces towards us in a darker, violet-filled shade so
that its lit edges glow. In flight the wing finger now bends through the stroke, the trailing edge is drawn in deeper, the membrane is
shaded thicker near the arm, and the downstroke is a little less deep. The vault starts a little earlier (4.42 s) so that the push is
under way at the 4.6 s cue; the cue table is unchanged.

## Shared files

Nothing needed.
