# Prompt: the Carthage launcher icon and emblem

Paste into Claude Design. It produces a canvas of artboards, not code.

## Before you paste: what this prompt fixes

The earlier combined brief asked one canvas for all six launcher icons and organised
its requests by section: "show the whole set at 48x48", "show the family reduced to a
single bone ink", "deliver these as one artboard showing all five emblems". Claude
Design did what it was told and put every culture on shared comparison boards, so no
single icon came out as a file anyone could export and ship.

This prompt covers Carthage alone, and every deliverable gets its own artboard with a
fixed name. The other four cultures are absent on purpose, including their colours, so
there is nothing on the canvas to line up against. The constraints Carthage carries
from the rest of the set are stated inside as absolute construction rules, because the
designer cannot see the marks those rules protect.

Eleven artboards come back. Seven are exportable assets, one mark each. Four are
labelled proof sheets and ship nothing. The two mask boards are proofs, because a
composited adaptive icon is a thing to inspect and never a file the build consumes.

Four sibling prompts cover Egypt, Greece, Canaan and Rome the same way. Run them
separately. The research behind all five is `docs/design/culture-marks.md` and
`docs/design/deity-glyphs.md`; the prompt below restates everything it needs, so the
designer never has to open either one.

House voice check on the fenced text: zero em dashes, no banned hedges.

---

```text
You are drawing ONE culture's marks for Astra Antiqua, an ancient-astrology product.
The culture is CARTHAGE. No other culture appears anywhere in this canvas.

THE EXPORT CONTRACT, READ THIS FIRST

Every deliverable asset gets its OWN artboard. One mark per board. Each board carries
the exact name given in the artboard list below. No second copy of the mark, no
comparison copy, no variant, and no other culture goes on an asset board.

Four boards are proof sheets, and each carries the word proof in its name. A proof
sheet is a thing I look at, never a thing the build ships. Everywhere else, one board
is one exportable file.

Do not draw a comparison strip, a family row, a variant grid, or another culture's
icon anywhere in this canvas. If you find yourself putting two versions of the mark
side by side to show a difference, that belongs on a proof board or nowhere.

The Android adaptive icon is two independent layers that the launcher composites at
runtime. The foreground must exist on its own artboard with a transparent background.
The background must exist on its own artboard as a flat colour fill. Never flatten
them into one exportable image. The composited views on boards 8 and 9 are proofs of
clearance, drawn so I can see the mask crop, and neither one is a file that ships.

THE PRODUCT, IN ONE PARAGRAPH

One sky is computed from a real ephemeris, and five ancient cultures read that same
sky through their own theology. Carthage audits it. Its surface in the app is THE
DECREE OF THE TOPHET, where a placement is entered, weighed against the terms of a
vow, and ruled on. The product's claim is honesty rather than mysticism: it states
plainly that positions are computed and nothing is invented, and it says so on a
method page.

THE IDENTITY IT ALREADY HAS

The interface is called "The Instrument in the Temple". It is austere: flat
culture-tinted grounds, one muted accent per culture, square corners, no gradients,
no shadows, no glass, no glow. The only ornament is an incised 1px rule. Type is
Cinzel for display in caps with wide tracking, Spectral for prose, IBM Plex Mono for
data and microcopy. It should read like a well-set almanac or a museum wall label.

COLOUR, EXACT VALUES, USE NO OTHERS

  Carthage ground   #191218
  Carthage accent   #94648C   (tyrian)
  Neutral ground    #171310   (mono board only)
  Bone ink          #E6DECC
  Prose ink         #D9D1BF
  Dim ink           #9A917D
  Faint ink         #6F6B60
  Incised rule      rgb(230 222 204 / 0.16)

Reproduce those values character for character. Do not sample, tint, or approximate
them.

The other four cultures have their own grounds and accents. They are deliberately
withheld from this prompt. Do not invent them, sample them, or place a second ground
on any board.

THE MARK: THE COTHON

Carthage's launcher icon is the cothon, the circular naval harbour at Salammbo, drawn
in plan: a broken ring of ship sheds around an offset island.

Appian describes a round war harbour with an island in the middle, sheds and slips
for over two hundred ships, reached through a channel from the rectangular commercial
harbour. Excavation at Salammbo found the ring, the island, and the shed foundations
where he said they were. It is civil infrastructure for auditing ships in and out,
which is what Carthage's surface in this app does with the sky.

It is a procedure and a piece of engineering rather than a deity portrait. That is
what keeps it legible at icon size and keeps the app out of rendering gods.

HOW THIS MARK DIES, WHICH IS THE COMMISSION

The ring fails as a GEAR, a SUN, or a WHEEL. A gear is the worst of the three,
because a gear reads as "settings" in any interface, and an app whose icon means
settings has no icon.

All three failures arrive by the same road: regularity. A gear is even teeth on the
outside of a closed ring. A sun is even rays on the outside of a closed disc. A wheel
is spokes crossing from a rim to a centred hub. Every symmetry you add walks the
cothon toward one of them.

Three things hold it back, and none is optional at any size:
  1. The ship sheds stand INSIDE the ring. Nothing protrudes past the outer edge
     except the two channel walls.
  2. The channel break is asymmetric, off every axis, and shaped as a mouth with
     walls rather than a bite taken out of a circle.
  3. The island is off centre, and no spoke ever reaches it.

THE CONSTRUCTION, IN PROPORTIONS OF D

D is the ring's outer diameter. Every measurement below is a fraction of D, so the
same construction serves every board. Each artboard states its own D.

  Ring band thickness        0.065 D
  Ring inner radius          0.435 D
  Ship-shed tick length      0.115 D, measured inward from the ring's inner edge
  Ship-shed tick weight      0.050 D
  Tick tips land at radius   0.320 D
  Island diameter            0.240 D
  Island centre offset       0.115 D from the ring's centre
  Channel wall length        0.085 D, measured outward from the ring's outer edge
  Channel break angle        34 degrees of arc
  Quay gap at each break end 13 degrees of arc, holding the shed run back from the mouth

THE RING. A continuous band of even weight, broken once. Flat fill, no outline on the
fill, no inner highlight. It fills its field: on every standalone icon board, D is 78
percent of the artboard's short side, so the mark is a ring occupying the frame. The
adaptive foreground board is the single exception, because the launcher mask crops it,
and that board states its own smaller D.

THE CHANNEL MOUTH. Centre the 34 degree break at bearing 205 degrees, measuring
clockwise from twelve o'clock, so it sits low and to the left, off the vertical, the
horizontal, and both diagonals. From each edge of the break, run one wall outward,
same weight as the ring band, 0.085 D long, the two walls converging by about 8
degrees so the channel narrows as it leaves. Those walls are what makes the gap read
as a harbour entrance. A bare gap in a ring reads as the letter C.

THE ISLAND. A plain filled disc, 0.240 D across, its centre 0.115 D from the ring's
centre on bearing 300 degrees. That bearing is chosen so the island offset and the
channel bearing differ by roughly 95 degrees. Hold that separation between 50 and 130
degrees. Any smaller and the mark gains a mirror axis through the mouth and the
island, which is the symmetry that turns it back into machinery.

THE SHIP SHEDS. Short radial ticks standing on the ring's inner edge, pointing inward,
evenly pitched along the surviving arc, stopping 13 degrees short of each end of the
break. They are 0.115 D long. They stop at radius 0.320 D and never touch the island;
the island's farthest edge sits at 0.235 D from the ring's centre, so the nearest tick
tip clears it by 0.085 D. Their even pitch is correct, because a shed row was a
colonnade and uneven ticks read as a drawing error. The asymmetry comes from the
break, the offset island, and the interrupted run, never from jittering the sheds.

THE TICK COUNT, PER SIZE. The real harbour held over a hundred sheds. Drawing a
hundred at icon size manufactures a gear, so the count drops as the mark shrinks:

  512 rung   22 ticks, plus four short notches on the island's own rim
  108 rung   18 ticks, island plain
  48 rung    14 ticks, island plain
  24 rung    no ticks at all, leaving ring, mouth and island

Never use a count divisible by four. A four-fold count lands the ticks on the
compass points and the gear comes straight back.

THE FLOOR. Below about 32 pixels the ring band computed from 0.065 D falls under two
device pixels and vanishes. At that point hold the band at two device pixels and let
the proportion break. The scale proof exists to show me exactly where that happens.

ABSOLUTE RULES CARRIED FROM A SET YOU CANNOT SEE

Four other cultures ship alongside this one, and the app carries fifty small deity
glyphs, ten per culture, drawn at 16 to 24 pixels. You will see none of them here.
These rules protect that work and are not open to negotiation on this canvas.

  1. NO SPOKES, EVER. Another mark in the set is built from three converging legs, and
     the shortest path to a collision is any stroke that runs from this ring toward its
     centre. The ticks stay inside the band, stay short, and stop well clear of the
     island. Nothing crosses the open interior. The cothon encloses; it does not
     radiate.

  2. THE RING FILLS THE FIELD. Another mark in the set is a staff carrying a small
     terminal curl, and the two coexist because their scale relationship is fixed: a
     small closed curve on a long stem there, a large closed ring here. Never shrink
     the cothon, never hang it off a stem, never give it a tail.

  3. THE CLOSED RING BELONGS TO CARTHAGE. Carthage's own Neptune glyph is a serpent
     coil, and that glyph is specified never to close into a full ring precisely so it
     does not rhyme with this icon. The cothon must claim the closed ring without
     ambiguity: one continuous circumference of even weight, one break at the mouth,
     no tapering, no head, no tail, no overlap where the ends pass, no second turn.
     If a viewer can read this as a coil, the icon has taken territory that was
     defended for it.

  4. NOTHING RADIATES OUTWARD. Carthage's own Sun glyph is a filled disc with short
     blunt ticks standing off its rim. Put ticks on the outside of this ring and the
     launcher icon becomes that glyph at eight times the size. The two channel walls
     are the only strokes in the whole mark that cross the outer edge, and they cross
     it at one bearing, in one place, as a pair.

  5. NO LETTERFORMS. Punic script is Phoenician script at a later stage, and the two
     are invisibly different at 48px, so exactly one culture in this set uses
     letterforms and it is not Carthage. No Punic characters, no inscriptions, no
     abstracted letter shapes anywhere in the launcher mark or the emblem.

  6. THE EMBLEM'S BODY IS A TRAPEZOID, NEVER A TRIANGLE. Another culture's launcher
     mark reduces at small size to a triangular mass under a rounded top, which is
     also what the sign of Tanit becomes if its body tapers to a point. Three things
     hold them apart and all three are fixed: the body keeps a flat top 0.18 H wide,
     the crossbar stays wider than the body's base, and the emblem is never drawn
     below 40 units tall or without the word CARTHAGE beside it.

  7. THE SIGN OF TANIT IS TIER 2 ONLY. It appears on boards 6 and 7, beside a label,
     and nowhere else. It is never the launcher icon. Boards 1 through 5 contain the
     cothon and nothing but the cothon.

  8. ACCENT HUE NEVER CARRIES MEANING ALONE. The set has to hold for a colourblind
     reader and in monochrome contexts, so form does all the separating work. Board 5
     is the test of that.

TIER 2: THE EMBLEM

A mark's meaning is fixed by where it sits. A launcher icon stands alone on a home
screen with nothing to explain it, so it gets read at its most loaded. The same mark
beside a label in a captioned interface is accurate. That split is the whole reason
the launcher mark and the emblem differ.

Carthage's tier 2 emblem is THE SIGN OF TANIT, and it is safe here because the word
CARTHAGE always stands next to it. It appears at culture doorways, section heads and
share cards, never alone.

Draw it in three parts, in this grammar and no other, where H is the emblem's total
height:

  A disc at the top, 0.22 H across, open stroke of even weight.
  A horizontal crossbar below it, 0.62 H wide, set with a 0.04 H gap under the disc,
  its ends turning slightly upward.
  A trapezoid body hanging from the bar, 0.55 H tall, 0.18 H across at the top and
  0.46 H across at the base.

The same three-part grammar is Carthage's Moon glyph elsewhere in the product at 16 to
24 pixels. Keep it identical here, so the two read as one mark at two sizes.

Stroke it as an outline of even weight, matched to the incised feel of the interface
rule, rather than filling it solid. It may carry more detail than the launcher mark,
because it never has to work alone, and the three-part grammar stays fixed regardless.
Draw the emblem in accent #94648C and the label in bone #E6DECC.

THE ARTBOARDS. Eleven boards, each named exactly as given, laid out in this order.
Boards 1 through 7 are exportable assets and each holds one mark. Boards 8 through 11
are proof sheets.

1. `icon-carthage-512`
   512x512, ground #191218, mark in accent #94648C. D = 400. The 512 rung's tick
   count, 22, with the four island rim notches. This is the master drawing.

2. `icon-carthage-fg`
   108x108, TRANSPARENT background, mark in accent #94648C. D = 58, centred at
   (54, 54). Tick count 18, island plain. Measured from the board centre, the ring's
   outer edge sits at radius 29 and the channel wall tips at radius 34, so the whole
   mark fits inside a 68 unit circle and clears the 72 unit mask by 2 units of radius
   all the way round. Verify that before you call this board done. This is the Android
   adaptive foreground layer and it ships as its own file, transparent, never merged
   with board 3.

3. `icon-carthage-bg`
   108x108, a flat fill of #191218 edge to edge. No mark, no vignette, no texture, no
   rule. This is the adaptive background layer and it ships as its own file.

4. `icon-carthage-48`
   48x48, ground #191218, mark in accent #94648C. D = 37.5. Tick count 14, island
   plain. This is the shipping size, so draw it at 48 and let me see it at 48. One
   mark on this board, at true size, with no magnified copy beside it. The scale proof
   is where enlargements live.

5. `icon-carthage-mono`
   512x512, ground #171310, mark in bone #E6DECC, no accent anywhere. Use the 48
   rung's construction, tick count 14, drawn at D = 400 so I can inspect it, since this
   serves notification icons and favicons. Bone on a dark ground blooms where accent
   does not: check the channel mouth and the shed gaps for filling in. If they close,
   widen the mouth and the tick pitch. Never thin the ring band to fix it.

6. `emblem-carthage-header`
   640x200, ground #191218. The sign of Tanit at 56 units tall in accent #94648C,
   left inset 64. Beside it, CARTHAGE in Cinzel caps, 22 unit cap height, tracking
   about 0.18em, bone #E6DECC. Under that, THE DECREE OF THE TOPHET in IBM Plex Mono
   at 12 units, dim #9A917D. One incised 1px rule at rgb(230 222 204 / 0.16) running
   the width with 64 units of margin each side.

7. `emblem-carthage-share`
   1200x630, ground #191218. The same emblem at 180 units tall in accent #94648C,
   set above the optical centre. CARTHAGE in Cinzel caps at 48 units, bone #E6DECC.
   THE DECREE OF THE TOPHET in IBM Plex Mono at 18 units, dim #9A917D. ASTRA ANTIQVA
   small in Plex Mono at the top edge, faint #6F6B60. One incised rule.

8. `proof-carthage-mask-circle`
   A PROOF SHEET, not an asset. 108x108. Boards 2 and 3 composited and clipped to a
   circular launcher mask of 72 units diameter, centred. Show the mask edge as a
   hairline so I can see the clearance. Composite only, no new drawing. This flattened
   view exists on this board and nowhere else; the two layers still ship separately.

9. `proof-carthage-mask-squircle`
   A PROOF SHEET. 108x108. The same composite clipped to a squircle mask. Same
   hairline, same rule about shipping. The channel walls are the part most likely to
   graze a mask edge; if they do, report it on the board rather than shortening them
   silently.

10. `proof-carthage-failure`
    A PROOF SHEET. The correct cothon at the left, then four rejected constructions to
    its right, each drawn wrong on purpose and labelled:
      GEAR      even teeth outside a closed ring
      SUN       even rays outside a closed disc
      WHEEL     spokes crossing to a centred hub
      LETTER C  a bare gap with no channel walls
    Under each rejection, one line naming what in the real construction defends
    against it: ticks inside the band, nothing protruding but the two channel walls,
    the island off centre with no stroke reaching it, the mouth built as walls. Only
    Carthage appears on this board.

11. `proof-carthage-scale`
    A PROOF SHEET. The mark at 512, 108, 48 and 24 in one row on ground #191218,
    each rendered at its true pixel size, each labelled with its size and tick count.
    Mark on the board where the mark stops being legible and say what fails first.
    My expectation is that the ship-shed ticks go before anything else, and the 24
    rung is ring, mouth and island alone. If your drawing fails somewhere else,
    say so on the board rather than adjusting the row to look clean.

WHAT THE RESEARCH REFUSED, SO IT IS NOT RE-PROPOSED

  The sign of Tanit as the launcher icon. Its densest attestation is on the tophet
  stelae at the centre of the contested child-sacrifice question, it carries live
  modern reappropriation, and its triangle-bar-disc grammar is the hardest shape in
  the set to keep apart from a neighbouring culture's mark. It moves to tier 2, where
  a label disarms all three problems. Boards 6 and 7 are its whole territory.

  The crescent and disc. At 48px it is indistinguishable from the star and crescent,
  which postdates it by over a millennium and has no connection to it.

  The Antikythera mechanism. Conceptually perfect for an app that computes an
  ephemeris, and the wrong register entirely, a scientific instrument in a surface
  built on shrine and petition. A gear reads as "settings" in any interface.

  Punic lettering of any kind, for the reason given in rule 5.

  Zodiac clip-art, glowing orbs, starfields, crystal balls, purple nebulae. This
  product's whole differentiator is that it is not that.

CONSTRAINTS

  Square corners everywhere in the interface. The icon is exempt, because the
  platform mask rounds it anyway. Design for the mask.
  No gradients, no drop shadows, no bevels, no glow, on any board.
  Everything survives being flat. This identity has no depth to hide behind.
  The icon boards carry two colours: the ground and one ink. The emblem boards add
  the type inks listed above and nothing beyond them.

DELIVERABLE

Eleven artboards, named exactly as listed, laid out in that order. Boards 1 through 7
are exportable assets and each holds exactly one mark. Boards 8 through 11 are proofs,
labelled as such, and still show only Carthage.

Where you believe one of these construction rules is wrong, write the objection on the
board as a note. Do not resolve it by quietly drawing something else.
```
