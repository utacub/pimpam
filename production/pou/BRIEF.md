# El pou del temps (CE37) · brief for the scene painters

Pim Pam is a suite of cause–effect activities for children with severe and multiple disabilities, used with one switch. «El pou del
temps» is a descent through a column of rock, back in time. Before the first press the camera rests in a garden of today. Each press:
the camera travels down the rock for 2 s to an older layer; there the fossil of an animal wakes (a window of life opens in the rock from
the animal's body until it covers the screen, and the flesh grows out from the bones); then 12 s of a living scene, a **mini story**. At
the end the picture slows to a stop and darkens until the next press. Twenty scenes, from the Ice Age to the first dinosaurs. After the
twentieth the camera climbs back to the garden, where a robin sings.

The person who commissioned it asked for: accurate, fluid and realistic movements; beauty and visual harmony with plenty of movement;
each scene a mini story; professional production and an art direction worthy of a photography prize. Take your time: quality first.

## Art direction: «Diorama de museu viu» (chosen style A)

Naturalistic palaeoart with a museum-diorama finish: a painted backdrop, soft, with aerial perspective (bluer and paler in the distance);
animals in real relief with warm key light, rim light and a dark contour that separates them from the background. Living, believable
colours, saturated only in display areas (crests, frills, plates, sail), countershading on the body (darker above, lighter below).

Four planes in every scene:
1. **Painted backdrop** (decor): sky, horizon, far ranges. Low contrast, visible soft strokes (K_SKY, K_FAR).
2. **Mid-ground vegetation of the period** (decor): ferns, cycads, ginkgos, araucarias, horsetails in the Mesozoic (NO grass lawns for
   dinosaurs: grasses were not widespread); steppe grasses, dwarf willows and snow in the Ice Age.
3. **The figure(s)**: the main animal, big, with dark contour, contact shadow and its own shading. Animals are NOT decor (dec 0).
4. **An occasional foreground element** (decor): a leaf, snowflakes, drops, flying sand. Never covering the figures.

Use the whole screen, edge to edge (no small centred vignette). Real relative sizes within a scene.

## Content rules (strict)

- No predation, no hunting, no roars, no sound or gesture that frightens. Big predators appear with young, yawning or resting.
- Faces only on animals, and animal expressions (gaze, blink, posture, breathing), never human-like.
- Theropods have lips: no teeth visible with the mouth closed (Cullen et al., 2023). Avoid open-mouth teeth displays.
- No written words, numbers or symbols anywhere in the picture.
- The animals of a scene really coexisted (place and time). Follow the scene notes below.
- Photosensitivity: no flashes (at most 3 per second, none saturated red); colour changes of display areas take 1 s or more and are not
  saturated red; at most 5 pairs of high-contrast stripes on screen (the ringed tail of Sinosauropteryx and similar patterns must be of
  low contrast); rotations at most one turn per 4 s; the camera never shakes (water, leaves and dust move instead); glints soft and slow.
- It must work with the decor settings (see below): «Decorat atenuat» (dim), «Sense decorat» (none) and a white or black base.

## The engine (read these files; do not edit them)

- `production/pou/common.glsl`: helpers (hashes, noise, SDFs, `sdTube`, `voro`, `locks`, `wake`), the style A painter `styleA()`,
  `piece()` / `PIECE(d,alb,kind,u,dir,R,line,dec)`, `veil()`, `shadow()`, `glow()`, the kinds `K_*` (SKY, FAR, SNOW, GRASS, ROCK,
  FOSSIL, BONE, SKIN, WOOL, SCALE, FUZZ, IVORY, PLANT, WATER, MUD, EYE, FUR, FEATHER, MEMBRANE, HORN, PLATE, SHELL, LEAF, BARK, SAND,
  SMOOTH, FLAT), the light globals `SUNL` (direction towards the sun, z towards the viewer), `SUNC`, `AMBC`, `BACK` (0..1: sun behind the
  subject, lights membranes, fringes of fur, leaves from behind).
- `production/pou/scene_head.glsl`: the scene frame and helpers: `flesh(d,dB)`, `BONES()`, `GROW`, `knee()` (2-bone IK), `stepCycle()`,
  `blinkAt()`, `eyeA()` (modelled eye with lid and slit pupil option), `contact()` (contact shadow), backdrops `sky()`, `sunDisc()`,
  `range()`/`ridge()`.
- `production/pou/scene_tail.glsl`: the window of life and `main()`.
- `production/pou/rock.glsl`: the rock (not yours).
- Two finished scenes to learn from, at the quality expected: `scene_00.glsl` (the woolly mammoths) and `scene_04.glsl` (the
  tyrannosaurs). Read them completely before you start: how bodies are built from smooth SDF pieces, how the bones are drawn under the
  growing flesh, how fur and scales take direction, how the backdrop is layered, how timing is written with smoothsteps.

### Your scene file `production/pou/scene_NN.glsl` (scene_NN is scene NN+1) must define

```glsl
const vec2 WIN_C=vec2(x,y);   // centre of the window of life: on the main animal's body (the window opens from there)
void fossil(vec2 q){...}      // the skeleton(s) of the scene's animals lying in the rock (PIECE(..., K_FOSSIL, ..., dec 0)), roughly in
                              // the pose of the living animals at the start, so that flesh can grow from them
void life(vec2 q,float t){...} // the living scene at clock t: set SUNL/SUNC/AMBC/BACK first, then backdrop, plants, animals, foreground
```

Any other functions, constants and structs you need go in the same file, with names that do not clash with the shared files (e.g. prefix
them: `stego...`). Each scene is compiled alone (common + head + your scene + tail), so you can't break other scenes, but GLSL ES 3.0
reserved words (`input`, `output`, `filter`, `sample`, `common`, `cast`, `active`, `partition`, `half`, `fixed`, `long`, `short`,
`union`, `enum`, `class`, `template`, `this`, `packed`, `public`, `static`, `extern`, `interface`, `namespace`, `using`, `sizeof`, `asm`,
`noise1`… ) must not be used as identifiers.

### Coordinates and composition

- `q`: the scene's frame, in screen heights when the camera rests on it: y up, the screen is y ∈ [−.5, .5]; x ∈ ±.89 on a 16:9 screen
  (`ASP` holds the actual half width). Compose for 16:9 but keep the essential within |x| ≤ .62 (4:3 tablets). In portrait the camera
  pulls back, so the backdrop, the ground and the vegetation must continue gracefully to |x| ≤ 1.6 and |y| ≤ 1.3 (sky upwards, ground
  downwards; no hard ends).
- `PX`: the size of a pixel in q units (use it for anti-aliasing widths; `cov(d)`).
- A ground line around q.y = −.30 is typical (the camera looks slightly down on the ground plane); vary it if the scene asks for it.
- Units: the main animal should be big. The mammoth (3 m at the shoulder) is about .57 screen heights tall; the T. rex about
  .114 screen units per metre. Pick a scale per scene so the main animal fills the frame well; giants must fit whole in the final framing.

### Drawing

- Build each body as one smooth SDF (`smin` of ellipses, capsules, tubes), then `PIECE` it with the right kind, a texture coordinate `u`
  that moves with the body, a direction `dir` for hair/feathers/scale flow, roundness `R` (relief), `line` 1 for figures (dark contour).
- Draw back to front: far limbs (darker), body, near limbs, details (eye with `eyeA`, nostrils, folds, claws), then highlights.
- Flesh growing from bones: while `BONES()` is true, draw the skeleton with K_BONE under the body, and clip every flesh piece with
  `flesh(d,dB)` where `dB` is the bones' distance (see `mammoth()` / `trex()`); compute the bones only while needed (`GROW<.6`).
- Texture frequencies: scales should be several pixels across at 960×540; `lodk()` in styleA fades textures that get too fine, but do
  not rely on it for big patterns.
- Decor: everything of the backdrop, the ground and the plants uses `dec=1` (PIECE's last argument; `veil(...,1.)`, `shadow(...,1.)`):
  with «dim» it fades towards the base colour by the opacity, with «none» it is not drawn at all. The animals use `dec=0`. With «none»
  only the animals, their contour and their contact shadow (`contact()`) are left on the plain base (black or white). Check that dark
  animals still read on a black base (the engine lifts their darks and lightens their contour there) and pale ones on white.
- Light: one sun per scene, coherent with the backdrop's sun. `BACK>0` when the sun is behind (translucent wings, ears, fringes).
- Colours are painted values (no tone mapping): albedos ~.1–.9.
- Animal eyes: `eyeA(q,c,r,iris,lidColour,blinkAt(t,seed),slit)`. Every animal blinks now and then.

### Time and motion

- `t`: seconds since the press of this scene (already eased at the start; it slows to a stop after the end while waiting, and keeps
  growing afterwards, so everything must stay valid and calm for t up to 40 and beyond).
- 0–2 s the camera travels down the rock (the fossil is visible); the window opens about 1.3–3.5 s and the flesh grows. Keep the animals
  in a calm rest pose until about 3.6 s (gentle breathing, ear or tail movements are fine).
- Story: a first beat around 3.8–4.5 s; **the key moment between 4.5 and 7.5 s**; a second, softer beat (the echo) **between 9 and
  11.5 s**; everything calm again by 13 s (idle: breathing, blinks, small movements). Write the beats with `ss()` envelopes.
- Movement quality: weight and follow-through. Feet stay planted while on the ground (IK legs, `knee()`; no sliding); the body shifts
  its weight before a step; heads lead and bodies follow; tails and necks follow with a delay of 0.1–0.3 s; overlapping secondary motion
  (breathing, blinking, ears, tail tips, feathers that settle after a shake, water dripping). Ease in and out; nothing jerky or linear.
  Plants sway with the wind with different phases; water ripples; dust settles.
- There must always be movement on screen (the backdrop breathes too: clouds, mist, grass, insects, water), but calm.

### Performance

The app runs this in real time on school tablets. Here, without GPU, Chromium renders with SwiftShader: measure with the tool (the time
printed after the first frame of a run; the first includes compiling). Keep the heaviest moment of your scene under about **1.5 s per
frame at 960×540** in this environment (the two finished scenes take about 1.0 s). Use bounding boxes to skip creatures far from the
pixel (`if(abs(q.x-cx)>w||...)return;` early, before costly SDFs), keep loops short, compute bones only while needed, avoid evaluating
`voro`/`locks`/`fbm` on pixels that are not covered.

### Tools

```
python3 production/pou/make_shaders.py                      # after every edit: writes dist/pou-shaders.js
node tools/pou-frames.mjs OUTDIR 960 540 I,T[,flags] ...      # I = scene number 1–20 (scene_NN is I = NN+1), T seconds after its press
SHEET=sheet.jpg node tools/pou-frames.mjs OUTDIR 960 540 ...  # plus a contact sheet (4 columns)
```

Flags: `dim` (decor dimmed, opacity 25 %), `none` (no decor), `white` (white base; with dim/none), `op=N`, `wait` (the stopped, darkened
end). A compile error prints the shader log after the frames (`errors` line). Look at the JPGs with your image viewer (Read tool).
Check: the fossil and the window (T 1.2, 2.2, 3.0), rest pose (3.6), each beat, the end (13.5) and `wait`; then `dim`, `none`,
`none,white`, and once a portrait 540×960 frame. The machine has 4 cores shared by several painters: keep each run to ≤ 8 frames at
960×540 (or 640×360 for quick checks) and do not run renders in parallel.

### What to hand back

For each scene:
1. `production/pou/scene_NN.glsl` (complete, compiling, checked in all decor modes).
2. `production/pou/notes/scene_NN.md` (create the folder if needed): in plain English, what happens, and **the exact moments (seconds
   after the press) of every audible event** (steps, voices, gestures, splashes, the key moment and the echo), with a one-line
   description of each sound wanted (for the sound designer: no roars; closed-mouth booms, coos, chirps, breaths, rustles, splashes…);
   the camera drift you would like during the stimulus if any (the default is a slow drift of 3 % sideways and a 4 % zoom in); the
   evidence followed and anything unverified; the measured frame time.
3. Three to six JPGs of your best moments in `/tmp/pou_review/scene_NN/`.

Do not edit shared files (`common.glsl`, `scene_head.glsl`, `scene_tail.glsl`, `rock.glsl`, `dist/pou*.js`, tools) or other painters'
scenes; if you need something there, say so in your notes. Do not commit to git. Do not publish anything.
