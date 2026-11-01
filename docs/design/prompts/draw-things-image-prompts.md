# Draw Things prompts for Astra Antiqua, 2026-10-27

A prompt sheet for a friend running Draw Things. Every prompt below is complete: copy the block,
paste it, run. Qwen-Image, FLUX and Ideogram read the text as written. SDXL takes the same text
plus the negative prompt in the settings section. Facts about the product come from `web/src/data/cultures.ts`,
`web/src/app/globals.css`, `docs/design/culture-marks.md` and `docs/design/deity-glyphs.md`.
Nothing here is final art: it is a first batch to look at.

## Which model

Checked 2026-10-28 against web sources, not against the app itself (INFERENCE where marked).
Draw Things now ships downloaders for FLUX.2, Qwen-Image, HiDream, Ideogram 4 and Krea 2 beside
the FLUX.1 and SD families. Two things decide the pick: the license, because these images may
ship inside a paid product, and the Mac's unified memory.

| Model | Quality for this job | License | Memory (INFERENCE) | Verdict |
|---|---|---|---|---|
| Qwen-Image (20B) | Best of the open set at flat graphics and exact layout; photoreal scenes rated top in head-to-head tests | Apache 2.0 | 32 GB or more, quantized | First choice for the stroke marks and the plates; fine for scenes |
| FLUX.2 dev | Highest open-weight photoreal quality | Non-commercial | 64 GB or more, quantized | Scenes for review only; nothing from it ships |
| Ideogram 4 | Top of the open leaderboard; strong prompt following | Terms must be accepted on download; read them | Unknown | Try it for scenes if the Mac runs it and the terms allow product use |
| Z-Image Turbo (6B) | Good fidelity, fast | Apache 2.0 | 16 GB | Quick drafts; support in Draw Things not confirmed |
| HiDream-I1 | Good, slower | MIT | 32 GB or more | Fallback with a clean license |
| FLUX.1 dev | Good photoreal | Non-commercial | 24 GB | Same rule as FLUX.2: review only |
| SDXL | Dated, needs the negative prompt | OpenRAIL++ (commercial use allowed) | 8 GB | Only if nothing larger runs |

In the Draw Things picker (screenshots of 2026-10-28, `docs/design/references/2026-10-28_draw-things-model-picker/`),
pick **Qwen Image 2.1 (6-bit)** under Community Models, or **Qwen Image 2.1 (4-bit S)** if the
6-bit one runs out of memory on the phone. **Qwen Image 2512 (8-bit S)** under Official Models is
the same family one release older; use it through the cloud option if local runs are too slow.
Skip the "Edit" entries (they take an image in and change it; useful later for fixes, not for
these prompts), "Turbo" (fewer steps, softer detail) and "Exact" (full precision, too large for
a phone). Steps 30, guidance 4, Euler, as in the table below; for the 4-bit build expect a little
more noise in the dark grounds and raise steps to 36.

Rule: a model with a non-commercial license can make pictures for choosing between directions.
Anything that goes into the app or the store listing is regenerated on Qwen-Image, HiDream or
SDXL, or redrawn by hand (the stroke marks always are).

## Settings

Start from one column and keep it for the whole batch.

| | Qwen-Image | FLUX.1 / FLUX.2 dev | SDXL base |
|---|---|---|---|
| Steps | 30 | 28 | 30 |
| Guidance / CFG | 4 | 3.5 | 6 |
| Sampler | Euler | Euler | DPM++ 2M Karras |
| Negative prompt | optional, the block below helps | none | the block below |

Sizes: scenes 1152 x 1536, symbols and objects 1024 x 1024, sky plates 1179 x 2556 (or 1024 x 2208
on SDXL), share cards 1536 x 864. Keep the seed of anything you like and put it in the file name.

The negative prompt is the same every time (SDXL, and Qwen-Image if the first batch drifts):

```text
text, watermark, signature, logo, frame, border, gold glitter, neon, lens flare, fantasy armour, anime, 3d render look, plastic, oversaturated, blurry, extra limbs, deformed hands, modern clothing
```

## 1. One scene per culture

Size 1152 x 1536. The rule from `culture-marks.md`: show the instrument and the procedure, not a
god's portrait. People may appear. Gods appear only as statues or reliefs.

### 1.1 Egypt, the Hall of Ma'at

```text
Editorial photograph, archaeological, restrained, museum-plate lighting. Warm near-black ground the colour of soot on old stone, hex 1a1712. Bone-white highlights, hex E6DECC, never pure white. Inside a dim stone hall, a great balance stands on a plinth: a feather finial on the post, a long crossbar, two hanging pans on cords, a plumb bob hanging visibly off the axis, a small baboon seated on top of the post. On one pan a single ostrich feather, on the other a small clay jar. A scribe kneels at the side with a palette and a reed pen, writing on papyrus. Painted wall registers behind, faded. The only colour in the frame is a dull gold, hex b59a55, on the two pans. Lit from one high slot window, dust in the beam, long soft shadows. Eye level, wide shot, the balance centred. Rendered as a photographed set, not as a painting. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

### 1.2 Greece, the Oracle of Delphi

```text
Editorial photograph, archaeological, restrained, museum-plate lighting. Cool near-black ground, hex 171a1c. Bone-white highlights, hex E6DECC, never pure white. The adyton at Delphi: a bronze tripod with three distinct converging legs under a shallow bowl, standing over a crack in the rock floor. A seated woman in plain undyed wool holds a laurel sprig and a shallow dish. Thin pale smoke rises from the crack and drifts through the frame; the smoke alone carries a slate-blue tint, hex 7c93a6. The omphalos stone, covered in a knotted net, in shadow to one side. Rough-cut stone walls, no columns in frame. One oil lamp, one light source, long soft shadows. Close, low angle, the tripod the subject. Rendered as a photographed set, not as a painting. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

### 1.3 Canaan, the council at the mountain

```text
Editorial photograph, archaeological, restrained, museum-plate lighting. Warm near-black ground, hex 1a1813. Bone-white highlights, hex E6DECC, never pure white. The summit of Mount Saphon at dusk: a flat rock terrace with a long low stone table and seven empty stone seats in a half ring, facing a storm forming over the sea far below. On the table, clay tablets covered in driven wedge signs, Ugaritic alphabetic cuneiform, a bronze mace head, a plain cup. Wind in the dry grass at the terrace edge. No figures. The only colour is an olive haze, hex 8a9268, along the horizon. Wide shot from behind the seats, looking out over the sea and the storm, one light source from the sky, long soft shadows. Rendered as a photographed set, not as a painting. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

### 1.4 Carthage, the decree of the council

```text
Editorial photograph, archaeological, restrained, museum-plate lighting. Cool near-black ground with a purple cast, hex 191218. Bone-white highlights, hex E6DECC, never pure white. The cothon of Carthage seen from a high rooftop at dusk: a circular naval harbour, a ring of covered ship sheds around an offset island with a tower, one channel opening to the sea, trireme prows showing in the sheds. The ring reads as a harbour plan, not as a gear or a wheel. In the foreground on the roof's edge, a stone counting table with a pair of hand scales, a few silver shekels, a wax tablet and a stylus. Still water, lamps being lit along the ring. The only colour is a dusk purple, hex 94648c, in the sky and on the water. Wide shot, high angle, one light source from the dusk sky, long soft shadows. Rendered as a photographed set, not as a painting. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

### 1.5 Rome, the auspices of the day

```text
Editorial photograph, archaeological, restrained, museum-plate lighting. Warm near-black ground, hex 1b1410. Bone-white highlights, hex E6DECC, never pure white. Dawn on the Capitoline hill in Rome: a man in a plain toga with his head veiled stands on a flat marked paving stone and holds a lituus, a straight staff with a knop on the shaft and a tight closed spiral at the top, raising it to mark a rectangle of sky. A clerk beside him holds a wax tablet. Birds crossing a thin band of dawn over the city roofs; that band alone is brick red, hex a5544a. Rough travertine underfoot, a cold temple step behind them. Medium shot from the side, the staff and the sky in the same frame, one light source, long soft shadows. Rendered as a photographed set, not as a painting. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

## 2. One symbol in stroke per culture

Size 1024 x 1024. These are the tier-1 launcher marks from `culture-marks.md`, drawn as one pale
stroke on the ground, the way the app's deity glyphs are drawn: one weight, no fill, no shading.
Generate twenty, pick one, redraw it by hand, then trace to SVG (Potrace or Illustrator Image
Trace). The model gives the gesture, not the final line.

### 2.1 Egypt, the balance of the weighing

```text
A single mark drawn in one continuous ink stroke on a flat warm near-black ground, hex 171310. Bone-white line, hex E6DECC, even line weight like a 2 px pen, no fill, no shading, no texture, no gradient, no perspective, centred, generous margins, the mark alone, vector-like, flat, monochrome. The Egyptian balance of the weighing of the heart, as in the Papyrus of Ani: a vertical post with an ostrich feather finial, a long horizontal crossbar, two shallow pans hanging on cords, a small baboon seated on the post, and a plumb bob hanging visibly off the axis. Not the scales-of-justice symbol. No text, no watermark, no border.
```

### 2.2 Greece, the Delphic tripod

```text
A single mark drawn in one continuous ink stroke on a flat warm near-black ground, hex 171310. Bone-white line, hex E6DECC, even line weight like a 2 px pen, no fill, no shading, no texture, no gradient, no perspective, centred, generous margins, the mark alone, vector-like, flat, monochrome. The Delphic tripod as struck on the coins of Delphi: three distinct separate legs converging upward under a shallow bowl, the bowl slightly off axis, no ring handles, the legs reading as load-bearing furniture. Never a solid triangle, never a triskelion. No text, no watermark, no border.
```

### 2.3 Canaan, Ugaritic cuneiform

```text
A single mark drawn in one continuous ink stroke on a flat warm near-black ground, hex 171310. Bone-white line, hex E6DECC, even line weight like a 2 px pen, no fill, no shading, no texture, no gradient, no perspective, centred, generous margins, the mark alone, vector-like, flat, monochrome. A cluster of six Ugaritic alphabetic cuneiform signs as pressed into clay by a stylus: driven wedge strokes, each with a triangular head and a tapering tail, some set at right angles to each other, some in a row, arranged as one short word. They must read as driven wedges, not as tally marks. No text in any modern script, no watermark, no border.
```

### 2.4 Carthage, the cothon in plan

```text
A single mark drawn in one continuous ink stroke on a flat warm near-black ground, hex 171310. Bone-white line, hex E6DECC, even line weight like a 2 px pen, no fill, no shading, no texture, no gradient, no perspective, centred, generous margins, the mark alone, vector-like, flat, monochrome. The circular naval harbour of Carthage drawn in plan from above: a ring broken at one point by a channel to the sea, short ship-shed ticks on the inside of the ring pointing inward but stopping well short of the centre, and a small island set off centre inside the ring. Not a gear, not a sun, not a wheel, no spokes reaching the middle. No text, no watermark, no border.
```

### 2.5 Rome, the lituus

```text
A single mark drawn in one continuous ink stroke on a flat warm near-black ground, hex 171310. Bone-white line, hex E6DECC, even line weight like a 2 px pen, no fill, no shading, no texture, no gradient, no perspective, centred, generous margins, the mark alone, vector-like, flat, monochrome. The lituus of a Roman augur as struck on the denarii of Julius Caesar: a straight staff with a small knop partway down the shaft and a tight closed spiral curling at the top. Not an open shepherd's crook, not a bishop's crozier. No text, no watermark, no border.
```

## 3. Other media the app will want

Ordered by how soon the product needs them.

### 3a. Sky plates, the backdrop behind the glass chrome

Size 1179 x 2556 (1024 x 2208 on SDXL). They must stay almost empty so the text on top reads.

#### 3a.1 Neutral

```text
A night sky photographed from a stone terrace, very dark, warm near-black, hex 171310, a thin scatter of small sharp stars, no moon, no milky way band, no clouds, no horizon glow, the top two thirds nearly black, the lower edge a faint line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

#### 3a.2 Egypt

```text
A night sky photographed from a stone terrace, very dark, warm near-black, hex 1a1712, a thin scatter of small sharp stars, no moon, no milky way band, no clouds, the top two thirds nearly black, a faint band of dull gold, hex b59a55, along the horizon one tenth of the way up from the bottom, the lower edge a line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

#### 3a.3 Greece

```text
A night sky photographed from a stone terrace, very dark, cool near-black, hex 171a1c, a thin scatter of small sharp stars, no moon, no milky way band, no clouds, the top two thirds nearly black, a faint band of slate blue, hex 7c93a6, along the horizon one tenth of the way up from the bottom, the lower edge a line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

#### 3a.4 Canaan

```text
A night sky photographed from a stone terrace, very dark, warm near-black, hex 1a1813, a thin scatter of small sharp stars, no moon, no milky way band, no clouds, the top two thirds nearly black, a faint band of olive, hex 8a9268, along the horizon one tenth of the way up from the bottom, the lower edge a line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

#### 3a.5 Carthage

```text
A night sky photographed from a stone terrace, very dark, near-black with a purple cast, hex 191218, a thin scatter of small sharp stars, no moon, no milky way band, no clouds, the top two thirds nearly black, a faint band of dusk purple, hex 94648c, along the horizon one tenth of the way up from the bottom, the lower edge a line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

#### 3a.6 Rome

```text
A night sky photographed from a stone terrace, very dark, warm near-black, hex 1b1410, a thin scatter of small sharp stars, no moon, no milky way band, no clouds, the top two thirds nearly black, a faint band of brick red, hex a5544a, along the horizon one tenth of the way up from the bottom, the lower edge a line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

### 3b. The glow disc

Size 1024 x 1024. From the owner's reference screenshots: a soft white disc bleeding off the frame
edge, behind the headline. Generate it alone; the app composites it.

#### 3b.1 Neutral

```text
A single soft luminous disc, bone-white, hex E6DECC, at the core, fading smoothly into a warm near-black ground, hex 171310, no hard edge, no rays, no lens flare, no stars, no texture inside the disc, the disc cut by the right edge of the frame so that one third of it is out of frame, a perfectly smooth gradient, fine film grain over the whole image, no text, no watermark, no border.
```

#### 3b.2 Egypt

```text
A single soft luminous disc, bone-white, hex E6DECC, at the core, its outer fringe faintly tinted dull gold, hex b59a55, fading smoothly into a warm near-black ground, hex 1a1712, no hard edge, no rays, no lens flare, no stars, no texture inside the disc, the disc cut by the right edge of the frame so that one third of it is out of frame, a perfectly smooth gradient, fine film grain over the whole image, no text, no watermark, no border.
```

#### 3b.3 Greece

```text
A single soft luminous disc, bone-white, hex E6DECC, at the core, its outer fringe faintly tinted slate blue, hex 7c93a6, fading smoothly into a cool near-black ground, hex 171a1c, no hard edge, no rays, no lens flare, no stars, no texture inside the disc, the disc cut by the right edge of the frame so that one third of it is out of frame, a perfectly smooth gradient, fine film grain over the whole image, no text, no watermark, no border.
```

#### 3b.4 Canaan

```text
A single soft luminous disc, bone-white, hex E6DECC, at the core, its outer fringe faintly tinted olive, hex 8a9268, fading smoothly into a warm near-black ground, hex 1a1813, no hard edge, no rays, no lens flare, no stars, no texture inside the disc, the disc cut by the right edge of the frame so that one third of it is out of frame, a perfectly smooth gradient, fine film grain over the whole image, no text, no watermark, no border.
```

#### 3b.5 Carthage

```text
A single soft luminous disc, bone-white, hex E6DECC, at the core, its outer fringe faintly tinted dusk purple, hex 94648c, fading smoothly into a near-black ground with a purple cast, hex 191218, no hard edge, no rays, no lens flare, no stars, no texture inside the disc, the disc cut by the right edge of the frame so that one third of it is out of frame, a perfectly smooth gradient, fine film grain over the whole image, no text, no watermark, no border.
```

#### 3b.6 Rome

```text
A single soft luminous disc, bone-white, hex E6DECC, at the core, its outer fringe faintly tinted brick red, hex a5544a, fading smoothly into a warm near-black ground, hex 1b1410, no hard edge, no rays, no lens flare, no stars, no texture inside the disc, the disc cut by the right edge of the frame so that one third of it is out of frame, a perfectly smooth gradient, fine film grain over the whole image, no text, no watermark, no border.
```

### 3c. The lesson object, one per culture

Size 1024 x 1024. From the second reference screenshot: a small rendered object centred below a
block of text.

#### 3c.1 Egypt

```text
Museum catalogue plate, product photograph, macro lens, shallow depth of field. A single ostrich feather, bone-white, slightly curled, standing upright in a small block of polished black basalt. Centred, floating a finger's width above a flat warm near-black ground, hex 1a1712. One key light from the top left, a long soft shadow to the lower right. The only colour is one dull gold highlight, hex b59a55, on the basalt's edge. Bone-white highlights, hex E6DECC, never pure white. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

#### 3c.2 Greece

```text
Museum catalogue plate, product photograph, macro lens, shallow depth of field. A fragment of a bronze tripod leg ending in a lion's paw foot, green patina, broken at the top. Centred, floating a finger's width above a flat cool near-black ground, hex 171a1c. One key light from the top left, a long soft shadow to the lower right. The only colour is one slate-blue highlight, hex 7c93a6, on the bronze. Bone-white highlights, hex E6DECC, never pure white. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

#### 3c.3 Canaan

```text
Museum catalogue plate, product photograph, macro lens, shallow depth of field. A hand-sized fired clay tablet, broken at one corner, driven wedge signs of Ugaritic alphabetic cuneiform across its face. Centred, floating a finger's width above a flat warm near-black ground, hex 1a1813. One key light from the top left, a long soft shadow to the lower right. The only colour is one olive highlight, hex 8a9268, on the clay. Bone-white highlights, hex E6DECC, never pure white. No text in any modern script, no watermark, no border, no gold glitter, no neon, no lens flare.
```

#### 3c.4 Carthage

```text
Museum catalogue plate, product photograph, macro lens, shallow depth of field. A worn silver shekel of Carthage lying on a wax writing tablet, the coin showing a horse standing before a palm tree. Centred, floating a finger's width above a flat near-black ground with a purple cast, hex 191218. One key light from the top left, a long soft shadow to the lower right. The only colour is one dusk-purple highlight, hex 94648c, on the wax. Bone-white highlights, hex E6DECC, never pure white. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

#### 3c.5 Rome

```text
Museum catalogue plate, product photograph, macro lens, shallow depth of field. The bronze head of a Roman augur's lituus alone: a short length of shaft with a knop and a tight closed spiral at the top, dark patina. Centred, floating a finger's width above a flat warm near-black ground, hex 1b1410. One key light from the top left, a long soft shadow to the lower right. The only colour is one brick-red highlight, hex a5544a, on the bronze. Bone-white highlights, hex E6DECC, never pure white. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

### 3d. Launcher icon plates

Size 1024 x 1024. The material under the icon. The stroke mark from section 2 goes on top in the
app; the plate carries no symbol.

#### 3d.1 Egypt

```text
A square plate of polished black basalt filling the frame edge to edge, flat on, a faint dull gold dust, hex b59a55, caught in the pores, soft raking light from the top left, fine surface detail, no object, no symbol, no text, no border, no watermark.
```

#### 3d.2 Greece

```text
A square plate of Pentelic marble filling the frame edge to edge, flat on, slate-grey veins, hex 7c93a6, in a cold light, soft raking light from the top left, fine surface detail, no object, no symbol, no text, no border, no watermark.
```

#### 3d.3 Canaan

```text
A square plate of fired clay filling the frame edge to edge, flat on, olive-grey, hex 8a9268, finger-smoothed with faint ridges, soft raking light from the top left, fine surface detail, no object, no symbol, no text, no border, no watermark.
```

#### 3d.4 Carthage

```text
A square plate of dark purple-grey limestone filling the frame edge to edge, flat on, hex 94648c in the shadows, a faint salt bloom at one edge, soft raking light from the top left, fine surface detail, no object, no symbol, no text, no border, no watermark.
```

#### 3d.5 Rome

```text
A square plate of warm travertine filling the frame edge to edge, flat on, brick-red dust, hex a5544a, settled in the pits, soft raking light from the top left, fine surface detail, no object, no symbol, no text, no border, no watermark.
```

#### 3d.6 Neutral

```text
A square plate of soot-black slate filling the frame edge to edge, flat on, hex 171310, no colour at all, soft raking light from the top left, fine surface detail, no object, no symbol, no text, no border, no watermark.
```

### 3e. Share card and OG image backgrounds

Size 1536 x 864. One per culture; the left third stays clear for type.

#### 3e.1 Egypt

```text
A night sky photographed from a stone terrace, wide format, very dark, warm near-black, hex 1a1712, a thin scatter of small sharp stars on the right two thirds, the left third empty and nearly black, no moon, no milky way band, no clouds, a faint band of dull gold, hex b59a55, along the horizon a quarter of the way up from the bottom, the lower edge a line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

#### 3e.2 Greece

```text
A night sky photographed from a stone terrace, wide format, very dark, cool near-black, hex 171a1c, a thin scatter of small sharp stars on the right two thirds, the left third empty and nearly black, no moon, no milky way band, no clouds, a faint band of slate blue, hex 7c93a6, along the horizon a quarter of the way up from the bottom, the lower edge a line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

#### 3e.3 Canaan

```text
A night sky photographed from a stone terrace, wide format, very dark, warm near-black, hex 1a1813, a thin scatter of small sharp stars on the right two thirds, the left third empty and nearly black, no moon, no milky way band, no clouds, a faint band of olive, hex 8a9268, along the horizon a quarter of the way up from the bottom, the lower edge a line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

#### 3e.4 Carthage

```text
A night sky photographed from a stone terrace, wide format, very dark, near-black with a purple cast, hex 191218, a thin scatter of small sharp stars on the right two thirds, the left third empty and nearly black, no moon, no milky way band, no clouds, a faint band of dusk purple, hex 94648c, along the horizon a quarter of the way up from the bottom, the lower edge a line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

#### 3e.5 Rome

```text
A night sky photographed from a stone terrace, wide format, very dark, warm near-black, hex 1b1410, a thin scatter of small sharp stars on the right two thirds, the left third empty and nearly black, no moon, no milky way band, no clouds, a faint band of brick red, hex a5544a, along the horizon a quarter of the way up from the bottom, the lower edge a line of darker stone, fine film grain, no text, no watermark, no border, no lens flare.
```

### 3f. Culture doorway emblems, tier 2

Size 1024 x 1024. The famous mark, for places where a label stands beside it. Canaan keeps the
cuneiform from 2.3. These carry the placement rules in `culture-marks.md`: never alone, always
captioned. Lower priority than section 2.

#### 3f.1 Egypt, the wedjat

```text
A single mark drawn in one continuous ink stroke on a flat warm near-black ground, hex 171310. Bone-white line, hex E6DECC, even line weight like a 2 px pen, no fill, no shading, no texture, no gradient, no perspective, centred, generous margins, the mark alone, vector-like, flat, monochrome. The Egyptian wedjat, the eye of Horus: an almond eye with its brow line above, the long cosmetic line extending from the outer corner, and the spiral and teardrop markings below. No text, no watermark, no border.
```

#### 3f.2 Greece, the owl of Athena

```text
A single mark drawn in one continuous ink stroke on a flat warm near-black ground, hex 171310. Bone-white line, hex E6DECC, even line weight like a 2 px pen, no fill, no shading, no texture, no gradient, no perspective, centred, generous margins, the mark alone, vector-like, flat, monochrome. The owl of Athena as struck on the Athenian tetradrachm: a standing owl facing the viewer, head turned frontal, large round eyes, the body in profile, a sprig of olive to one side. No text, no watermark, no border.
```

#### 3f.3 Carthage, the sign of Tanit

```text
A single mark drawn in one continuous ink stroke on a flat warm near-black ground, hex 171310. Bone-white line, hex E6DECC, even line weight like a 2 px pen, no fill, no shading, no texture, no gradient, no perspective, centred, generous margins, the mark alone, vector-like, flat, monochrome. The sign of Tanit as carved on Carthaginian stelae: a triangle for the body, a horizontal bar across its top with the two ends turned up like raised arms, and a disc above the bar. No text, no watermark, no border.
```

#### 3f.4 Rome, the aquila

```text
A single mark drawn in one continuous ink stroke on a flat warm near-black ground, hex 171310. Bone-white line, hex E6DECC, even line weight like a 2 px pen, no fill, no shading, no texture, no gradient, no perspective, centred, generous margins, the mark alone, vector-like, flat, monochrome. The Roman legionary aquila: an eagle with wings raised and spread, head turned to one side, standing on a short plinth at the top of a staff, holding a thunderbolt in its talons. No text, no watermark, no border.
```

### 3g. Onboarding and empty states

Size 1024 x 1024.

#### 3g.1 No chart yet

```text
Editorial photograph, archaeological, restrained, museum-plate lighting. A blank unrolled papyrus held flat on a stone table by two small dark stones at its corners, centred, small in the frame, a great deal of empty warm near-black ground, hex 171310, around it. Bone-white highlights, hex E6DECC, never pure white. One soft light from the top left, a long soft shadow. No text, no writing on the papyrus, no watermark, no border, no gold glitter, no neon, no lens flare.
```

#### 3g.2 Locating the sky

```text
Editorial photograph, archaeological, restrained, museum-plate lighting. A bronze ring instrument, like an armillary ring, seen edge on so that it reads as a thin ellipse, standing on a small stone base, centred, small in the frame, a great deal of empty warm near-black ground, hex 171310, around it. Bone-white highlights, hex E6DECC, never pure white. One soft light from the top left, a long soft shadow. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

#### 3g.3 Offline

```text
Editorial photograph, archaeological, restrained, museum-plate lighting. A small clay oil lamp, just snuffed, a single thin thread of smoke rising straight up from the spout, centred, small in the frame, a great deal of empty warm near-black ground, hex 171310, around it. Bone-white highlights, hex E6DECC, never pure white. One soft light from the top left, a long soft shadow. No text, no watermark, no border, no gold glitter, no neon, no lens flare.
```

## What not to generate

- Portraits of the gods for any brand position (icons, doorways, tab art). Statues and reliefs are
  fine inside a scene.
- Anything with the fasces outside a captioned page about magistrates.
- Gold-on-black ornament, zodiac wheels, tarot, crystal, galaxy swirls. None of it is this product.
- Text in the image. The app sets its own type (Cinzel, Spectral, IBM Plex Mono).

## Handing results back

Drop the files in `docs/design/references/<date>_draw-things/` with a README naming the model,
the seed and the prompt number used for each file, and the SHA-256 of each. Nothing goes into the
app until the owner has chosen, and the stroke marks get redrawn by hand before they ship.
