# Prompt: the Canaan launcher icon and emblem

Paste into Claude Design. It produces a canvas of artboards, not code.

## Before you paste

This prompt covers **Canaan alone**. The earlier combined brief asked one canvas for all six
launcher icons and organised its requests by section, so the designer put every culture onto
shared comparison boards and no single icon came out as its own exportable asset. Each
culture now gets its own prompt, and each deliverable gets its own artboard.

Provenance for anyone auditing this later, not for the designer: the mark and its failure
modes come from `docs/design/culture-marks.md`, and the small-glyph collisions it has to
clear come from `docs/design/deity-glyphs.md`. Neither path appears inside the fence, because
the fence has to work with nothing else open.

Four things the fence below carries that a reader of the research would otherwise have to
look up. The mark is closed: Ugaritic alphabetic cuneiform, decided by research, not open to
exploration. Canaan is the only culture in the set that gets letterforms, and the fence states
that as a rule the designer can obey without seeing the other four. The Android adaptive icon
is two layers, so the foreground and the background are separate artboards and are never
flattened together. And Canaan is the one culture whose tier 2 emblem shares its subject with
its launcher mark, because no popular Canaanite emblem exists, so the fence has to say how the
two arrangements differ instead of naming a different object.

Eleven artboards come back. Nine are assets. Two are labelled proof sheets and ship nothing.

```text
You are drawing the launcher icon and the in-app emblem for CANAAN, one culture inside an
ancient-astrology product called Astra Antiqua. This prompt covers Canaan and nothing else.
No other culture's mark may appear anywhere in your output.

THE PRODUCT, IN ONE PARAGRAPH
One sky is computed from a real ephemeris, and five ancient cultures read that same sky
through their own theology. The same planetary placement keeps the same core meaning in
every voice, and each culture's reading is native to its own institutions. The reader picks
a culture and the app's icon changes to match, so each culture's icon is a shipped asset
that has to be recognised alone on a home screen with nothing beside it to explain it. The
product's claim is honesty rather than mysticism: it states plainly that positions are
computed and nothing is invented, and it says so on a method page.

CANAAN'S SURFACE IN THE APP IS THE COUNCIL OF EL, where a matter is put before a seated
assembly and the ruling is entered. The mark has to be the record of that hearing, the
writing itself, not a portrait of a god and not a picture of the room.

THE IDENTITY IT ALREADY HAS
The interface is called "The Instrument in the Temple". It is austere: flat culture-tinted
grounds, one muted accent per culture, square corners, no gradients, no shadows, no glass,
no glow. The only ornament is an incised 1px rule. Type is Cinzel for display in caps with
wide tracking, Spectral for prose, IBM Plex Mono for data and microcopy. It reads like a
museum wall label.

CANAAN'S COLOURS, EXACT
  ground  #1A1813
  accent  #8A9268  (cedar)
Inks available: bone #E6DECC, prose #D9D1BF, dim #9A917D, faint #6F6B60.
Neutral ground for the monochrome board: #171310.
Rules, if you draw one: rgb(230 222 204 / 0.16).
Use these hex values verbatim. Do not sample, tint, or approximate them.

THE MARK, ALREADY DECIDED
Ugaritic alphabetic cuneiform: a small cluster of driven wedge signs. The world's earliest
alphabet, Ugarit's own invention, and the medium the vow and the docket were written in. Do
not propose an alternative subject. Your commission is how it is drawn, because it has
specific ways of dying and those failures are the whole job.

One demand this mark makes that a drawn object does not. Canaan's mark is writing, so it can
be wrong in a way a tripod or a staff cannot: it can spell nothing while looking as though it
spells something. Draw real Ugaritic signs. Do not invent sign shapes and do not improvise a
letter you cannot confirm. Name on the failure proof sheet which signs you drew and in what
order, so the team can check them against the sign list before anything ships. Where you are
unsure of a sign's exact wedge count, say so in that note rather than guessing quietly.

HOW THIS MARK FAILS IF DRAWN CARELESSLY
  1. As tally marks. A row of even strokes at even spacing is counting, not writing. This is
     the named failure for this mark and it is the one that arrives by default, because
     evenness is what a careful hand does unprompted.
  2. As a linear alphabet. If the wedges lose their triangular heads and thin into plain
     strokes, the mark becomes a linear script. Another culture in this set is a Phoenician
     colony, and that region's later linear alphabet was ruled out of its icon because it is
     invisibly different from its parent at 48px. Canaan is the only culture in this product
     that gets letterforms anywhere, and it holds that ground only while the letters are
     visibly driven wedges rather than drawn lines.
  3. As a burst or a star, when wedges converge on one shared point. This product also
     carries a small Canaanite star glyph for Venus, a plain five or six point star with no
     enclosing circle. Two other marks in this set already sit near "spokes from a centre"
     and are held apart from each other by construction; Canaan must not walk into that
     territory at all. No point in the cluster may be a hub.
  4. As a single arrowhead. This product also carries a small Canaanite arrow glyph for Mars,
     a diagonal shaft with a triangular head and a two-stroke fletch. One wedge drawn much
     larger than its neighbours becomes that arrow.
  5. As two stacked bars. This product also carries a small Canaanite glyph built exactly
     that way, two short horizontal bars stacked with a gap. A cluster reduced to horizontal
     wedges alone, evenly stacked, lands on it.
  6. As a logographic brick. A dense rectangular block of many signs reads as a museum
     caption of Sumerian and turns to texture at 48px. Ugaritic's alphabet is small and its
     signs are sparse, and that sparseness is the difference. It has to be visible.

CONSTRUCTION RULES, ABSOLUTE
These are the rules the drawing has to obey. They are stated as rules rather than as
comparisons because you cannot see the other four cultures from here.

  Three signs. Four at the most, and a fourth only if it still separates from its neighbours
  at 48px. Fewer signs, drawn larger, beat more signs drawn small.

  Every wedge has a head and a tail: a wide flat impression tapering to a point in one
  direction. The head runs about two and a half to three times the tail's width. Never a
  stroke of even width, and never a round cap at either end. This mark is impressed, not
  drawn, and the taper is the whole tell.

  Both wedge families appear in the cluster. At least one corner form, the small hooked wedge
  driven at an angle, and at least two straight forms, horizontal or vertical or oblique. A
  cluster built from one family alone reads as pattern rather than as script.

  Wedges group into signs, and that grouping is the defence against tally marks. The gap
  between two signs is at least twice the largest gap inside either sign. Draw the gaps first
  if it helps.

  No two adjacent wedges share all three of parallel angle, equal length, and equal spacing.
  Break at least one of the three every time. Regularity is counting.

  No shared vertex. Every wedge keeps at least one tail weight of ground between its point and
  any neighbour. Nothing in this mark radiates from a hub.

  No wedge exceeds about 1.4 times the length of any other wedge in the cluster. One dominant
  member is an arrow.

  The cluster sits on one baseline and runs left to right in a field wider than tall, roughly
  4:3. Writing runs; it does not compose into a device. If a chosen sign is itself a stack of
  horizontal wedges, do not let it stand alone and do not place it first, because on its own
  it lands on the stacked-bar failure.

  Straight edges only. No curve anywhere in this mark: no ring, no arc, no disc, no spiral,
  no hook that closes. Those shapes are claimed by other marks in this set and Canaan has no
  business in them.

  One tail weight throughout, an incised line of even width along the tail. At 512 the tail
  reads about 20 to 24 units and the head about 55 to 70 across its flat face. At 48 the tail
  never falls below 3px, the head never below 4px across, and the gap between signs never
  below the tail weight, after every scaling step.

  Optical vertical. The cluster is centred on its own optical weight, with the heavier heads
  counted, rather than on its bounding box. A geometrically centred cluster will look as
  though it is sliding toward its heads; correct by eye.

  No ornament. No frame, no border, no cartouche, no tablet edge, no clay texture, no
  crescent, no star. A cold viewer reads "Mesopotamia" before "Ugarit", the set's context
  carries that, and a label closes the gap. Do not compensate for it by adding something.

COLOUR RULE
Draw the mark in accent #8A9268 on ground #1A1813. A second ink is permitted for one sign
only, from bone #E6DECC, and only if the mark's silhouette is unchanged when the whole thing
collapses to one flat ink. Hue may never be the only thing carrying the mark, both for
colourblind readers and because monochrome contexts ship.

THE EXPORT CONTRACT, WHICH IS THE POINT OF THIS PROMPT
Every deliverable asset gets its own artboard. One mark per board. Name each board with the
exact name given below, spelled as written. Composite boards are allowed only on the two
boards labelled proof, and a proof sheet is never an asset. Boards 1 through 9 each contain a
single instance of a single mark and nothing else: no comparison strip, no family row, no
size ladder, no alphabet chart, no sign key, no annotation inside the live area.

ARTBOARDS TO PRODUCE

  1. icon-canaan-512
     512x512. The launcher mark on ground #1A1813, mark in accent #8A9268. The cluster
     occupies roughly 60 to 70 percent of the canvas width, optically centred. This is the
     master asset.

  2. icon-canaan-fg
     108x108. The SAME cluster as the Android adaptive-icon FOREGROUND LAYER ONLY.
     Transparent background, no ground fill of any kind. Every part that carries meaning sits
     inside the middle 72x72; the outer 18 units on each side are masked away by the launcher
     and may hold nothing load-bearing. Keep the outermost wedge points well inside the safe
     zone, since some launchers crop harder than the spec and a clipped wedge point is a
     different letter.

  3. icon-canaan-bg
     108x108. The adaptive-icon BACKGROUND LAYER: a flat fill of #1A1813, edge to edge.
     Nothing else on this board. No mark, no rule, no texture, no vignette.

  4. icon-canaan-mask-circle
     The composed icon, foreground over background, under a circular launcher mask. Present at
     512x512 with the mask boundary at the artboard edge and nothing outside it. This board
     proves the safe zone held, and a wide 4:3 cluster is exactly the shape a circular mask
     punishes, so this is the board where a too-long cluster shows itself.

  5. icon-canaan-mask-squircle
     The same composed icon under a squircle mask, presented the same way.

  6. icon-canaan-48
     48x48. The mark at the size that actually ships, drawn for that size rather than scaled
     down from 512. Thin the detail until the wedge heads, the taper, the inter-sign gaps and
     the corner form all still read. If a sign has to lose a wedge to survive here, lose the
     wedge and say which one in a note on board 11. One instance only; the size ladder belongs
     on board 11.

  7. icon-canaan-mono
     512x512. The mark in bone #E6DECC alone on neutral ground #171310, for notification icons
     and favicons where accent hue is gone. Single flat ink, no second value, no grey. If the
     mark needs its accent to hold together, fix the mark, not this board.

  8. emblem-canaan-header
     640x160. THE TIER 2 EMBLEM. Canaan has no emblem a general audience recognises, so
     cuneiform carries both tiers, and this is the only culture in the product where the
     emblem's subject is the launcher mark's subject. The difference between them is therefore
     a drawing instruction, not a different object. The emblem is a longer line: five to seven
     signs on one baseline, more deliberately spaced and more finely cut than the three-sign
     cluster, at header scale roughly 32 units tall. It is a line of writing that can carry a
     header. It is never the launcher cluster scaled up, and it never appears on boards 1
     through 7. Place it beside its label set in Cinzel caps with wide tracking: CANAAN, with
     THE COUNCIL OF EL beneath in IBM Plex Mono, smaller, in dim #9A917D. Ground #1A1813,
     wedges in accent #8A9268, label in bone #E6DECC. The label is why a script a cold reader
     cannot decode is safe here when it would not be safe alone on a home screen.
     Two things the emblem must not do: it must not run so long or so flat that it reads as a
     rule or a border, so keep it visibly a line of separate signs and leave the baseline
     implied rather than drawn; and it may carry more detail than the launcher mark, because
     it never has to work alone.

  9. emblem-canaan-share
     800x500. The same line of signs at share-card scale, roughly 128 units tall, on ground
     #1A1813, with the label lower in the field and an incised 1px rule at
     rgb(230 222 204 / 0.16) if the composition needs one. More detail is allowed here: the
     shading of each wedge's impressed face, the finer corner wedges drawn at full definition.
     Same subject, same construction, nothing new introduced.

 10. proof-canaan-failure
     A PROOF SHEET, not an asset. 1400x700. The correct mark drawn once at the left, then six
     failure specimens beside it, each one a wrongly drawn Canaanite wedge cluster, each
     labelled with the failure name and a one-line note in IBM Plex Mono saying what in the
     correct construction defends against it. Do not draw any other culture's emblem on this
     board as a reference specimen; the failures are drawn as bad clusters, not as the marks
     they drift toward. Add one line at the foot of this board, in IBM Plex Mono, naming the
     signs you drew in the correct mark and in what order, plus any sign whose form you could
     not confirm.
       TALLY MARKS. Even strokes at even spacing. Defence: signs group, and the gap between
         signs runs at least twice the largest gap inside a sign.
       LINEAR SCRIPT. Wedge heads lost, tails thinned to plain strokes. Defence: the head is
         two and a half to three times the tail's width, and there are no round caps.
       RADIAL BURST. Wedges converging on one shared point. Defence: no shared vertex, one
         tail weight of ground between every point and its neighbour.
       SINGLE ARROWHEAD. One wedge enlarged until it dominates. Defence: no wedge exceeds
         about 1.4 times the length of any other.
       STACKED BARS. Horizontal wedges alone, evenly stacked with a gap. Defence: both wedge
         families present, at least one corner form.
       LOGOGRAPHIC BRICK. A dense rectangular block of many small signs. Defence: three signs,
         four at the most, drawn large enough to separate at 48px.

 11. proof-canaan-scale
     A PROOF SHEET, not an asset. 1200x400. The mark at 512, 108, 48 and 24 in one row on
     ground #1A1813, each at true relative size, each labelled with its pixel size beneath in
     IBM Plex Mono. The point of this board is to make the failure point visible, so do not
     thicken the small sizes to flatter them. If the mark stops holding at 24, show that it
     stops and say in a note which element goes first. Say plainly whether the corner form or
     the inter-sign gap is the first casualty, since those are the two the whole mark rests on.

WHAT THE RESEARCH REFUSED, SO YOU DO NOT RE-PROPOSE IT
  The massebah, the standing stone. It is the object the Hebrew Bible commands torn down, and
  drawing it would read as taking a position in a live religious argument.
  The crescent and disc. At 48px it is indistinguishable from the star and crescent, which
  postdates it by over a millennium and has no connection to it.
  The tablet, meaning the clay object rather than the writing on it. The mark is the writing.
  A tablet outline is a frame, and frames are ornament here.
  A deity portrait, a seated council, an enthroned figure. Every launcher mark in this set is
  an instrument or a procedure, which keeps the set legible at icon size and keeps the app out
  of rendering gods.
  Zodiac clip-art, glowing orbs, starfields, crystal balls, purple nebulae. This product's
  differentiator is that it is not that.

CONSTRAINTS
  Square corners everywhere in the interface. The icon is exempt, since platform masks round
  it anyway; design for the mask rather than fighting it.
  No gradients, no drop shadows, no bevels, no glow, on any board.
  Everything survives being flat. This identity has no depth to hide behind.
  Hue is never the only thing separating one mark from another.

IF YOU THINK A DECISION HERE IS WRONG, write a note on the relevant proof sheet saying so.
Do not quietly draw something else.
```
