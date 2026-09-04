# Prompt: the Greece launcher icon and emblem

Paste into Claude Design. It produces a canvas of artboards, not code.

## Before you paste

This prompt covers **Greece alone**. The earlier combined brief asked one canvas for all
six launcher icons and organised its requests by section, so the designer put every
culture onto shared comparison boards and no single icon came out as its own exportable
asset. Each culture now gets its own prompt, and each deliverable gets its own artboard.

Three things the fence below carries that a reader of the research would otherwise have to
look up. The mark is closed: the Delphic tripod, decided by research, not open to
exploration. The Android adaptive icon is two layers, so the foreground and the background
are separate artboards and are never flattened together. And the constraints Greece
inherits from the other four cultures, and from the fifty small deity glyphs the app also
carries, are written as absolute construction rules, because the designer cannot see any
of those marks from inside this prompt.

Eleven artboards come back. Seven are assets. Four are labelled proof sheets and ship
nothing. The two masked previews are proofs, since Android composes that mask at runtime
and no build step ever consumes a flattened icon.

Sources this prompt was built from, for a human checking it later and never for the
designer to open:

  L:/Claude Projects/astra-antiqua/docs/design/culture-marks.md
  L:/Claude Projects/astra-antiqua/docs/design/deity-glyphs.md
  L:/Claude Projects/astra-antiqua/docs/design/prompts/brand-identity-design.md

Checked before pasting:

- Em dashes: 0.
- Greece's surface reads THE DAY'S ORACLE, which is what the app ships. An earlier draft
  of this prompt said "the oracle of the day", which is Rome's construction, and it would
  have been drawn into the header emblem as label text.
- Every asset board holds one mark. Every composite or comparison board is labelled proof.
- The adaptive foreground has its own board with a transparent background and a named ink;
  the background has its own board and is a flat fill.

```text
You are drawing the launcher icon and the in-app emblem for GREECE, one culture inside an
ancient-astrology product called Astra Antiqua. This prompt covers Greece and nothing
else. No other culture's mark may appear anywhere in your output.

THE PRODUCT, IN ONE PARAGRAPH
One sky is computed from a real ephemeris, and five ancient cultures read that same sky
through their own theology. The same planetary placement keeps the same core meaning in
every voice, and each culture's reading is native to its own institutions. The reader picks
a culture and the app's icon changes to match, so each culture's icon is a shipped asset
that has to be recognised alone on a home screen with nothing beside it to explain it. The
product's claim is honesty rather than mysticism: it states plainly that positions are
computed and nothing is invented, and it says so on a method page.

GREECE'S SURFACE IN THE APP IS THE DAY'S ORACLE, where the sky is questioned. The mark has
to be the furniture of a petition, not a portrait of a god.

THE IDENTITY IT ALREADY HAS
The interface is called "The Instrument in the Temple". It is austere: flat culture-tinted
grounds, one muted accent per culture, square corners, no gradients, no shadows, no glass,
no glow. The only ornament is an incised 1px rule. Type is Cinzel for display in caps with
wide tracking, Spectral for prose, IBM Plex Mono for data and microcopy. It reads like a
museum wall label.

GREECE'S COLOURS, EXACT
  ground  #171A1C
  accent  #7C93A6  (aegean)
Inks available: bone #E6DECC, prose #D9D1BF, dim #9A917D, faint #6F6B60.
Neutral ground for the monochrome board: #171310.
Rules, if you draw one: rgb(230 222 204 / 0.16).
Use these hex values verbatim. Do not sample, tint, or approximate them.

THE MARK, ALREADY DECIDED
The Delphic tripod: three converging legs under a shallow bowl. The recurring image on
Delphic coinage for centuries, and the furniture where a petitioner's question met the
god's answer. Do not propose an alternative subject. Your commission is how it is drawn,
because it has specific ways of dying and those failures are the whole job.

HOW THIS MARK FAILS IF DRAWN CARELESSLY
  1. As a solid triangular mass under a disc. That is a different culture's emblem
     grammar, and drawing it hands Greece a mark that belongs to another surface in this
     same product. The legs must never fill into a triangle, and the bowl must never close
     into a plain disc.
  2. As a triskelion or a pinwheel, when the legs radiate from a hub instead of carrying a
     load. Another culture in this set is a radial plan with ticks around a hub, and both
     marks slide toward "spokes from a centre" and meet there. Greece has to be furniture
     under weight, and the construction rules below are what enforce that.
  3. As a wide horizontal beam with mass spread across the top. Another culture in this
     set is a vertical with a wide beam at the top, and Greece is also a vertical with
     mass at the top. That pair stays open on one condition: Greece's mass is a compact
     bowl. If the bowl widens toward a beam, the pair closes.
  4. As a fan of ribs meeting at a single point. This product also carries a small Greek
     scallop-shell glyph built exactly that way, ribs converging on one vertex closed by a
     shallow arc on the far side. The tripod's bowl sits on the same side as the
     convergence; the shell's arc sits opposite it. Keep that difference visible.
  5. As a trident. This product also carries a small Greek trident glyph, three tines
     rising above a shaft. The tripod's three members descend below its mass. Nothing on
     the tripod may rise above the bowl.
  6. As a crescent, once the ring handles are drawn and then shrunk. This product also
     carries a plain Greek crescent glyph for the moon. Drop the tripod's ring handles.

CONSTRUCTION RULES, ABSOLUTE
These are the rules the drawing has to obey. They are stated as rules rather than as
comparisons because you cannot see the other four cultures, or the small glyph set, from
here.

  Three legs, three separate strokes. Ground shows between them at every size. The
  triangle they enclose is negative space and stays open. That open space is load-bearing
  and must survive at 48px: the gap between adjacent legs never falls below the stroke
  weight.

  Two horizontal registers bind the legs, and this is the single defence against the
  pinwheel. Above, all three legs meet the underside of one horizontal object, the bowl.
  Below, all three feet land on one horizontal ground line. A pinwheel has rotational
  symmetry about a centre and no horizontal register anywhere. Draw both registers and the
  radial reading is impossible.

  The legs gather under the bowl and splay outward as they descend, so the silhouette
  widens toward the floor. Three feet, separated, never a single bottom vertex. Feet are
  plain terminals; drop the lion's paws, they are mud at 48px.

  The bowl is shallow, wider than deep, roughly 3:1 to 4:1. Draw its opening as a
  flattened ellipse seen slightly from above, so it reads as a vessel with an interior
  rather than a filled circle. That off-axis opening is what stops it collapsing into a
  disc. The bowl is never a full circle and never a horizontal bar.

  The bowl opens upward and shows that interior, and it carries nothing along its top
  edge. Two small Greek glyphs elsewhere in this product are a domed helmet closed at the
  top with one raised arc running along it, and a shallow open crown-band with spikes
  rising from its rim. The tripod's bowl takes neither signature: it is not a closed dome,
  and nothing sits on or rises from its rim.

  The bowl's width does not exceed 60 percent of the mark's total width at the feet. It is
  a compact vessel, not a beam. Nothing hangs from its ends.

  No ring handles, no lid, no serpent column, no omphalos, no laurel, no flame, no
  lettering. This set gives letterforms to one culture only and Greece is not it.

  One stroke weight throughout, an incised line of even width. Greek attributes reach us
  mostly through vase painting, so the hand is a drawn line rather than struck coin relief:
  even width, closed forms, no bevels, no tapering flourishes. At 512 the stroke reads
  about 20 to 24 units. At 48 it never falls below 3px, which means the 48px drawing
  carries a proportionally heavier stroke than the 512 master. That is why board 4 is
  redrawn at its own size rather than scaled down.

  Optical vertical. The mark stands upright, centred on its own optical weight, with the
  bowl's mass counted. A geometric centre will look top-heavy; correct by eye.

COLOUR RULE
Draw the mark in accent #7C93A6 on ground #171A1C. A second ink is permitted for the bowl
only, from bone #E6DECC, and only if the mark's silhouette is unchanged when the whole
thing collapses to one flat ink. Hue may never be the only thing carrying the mark, both
for colourblind readers and because monochrome contexts ship.

THE EXPORT CONTRACT, WHICH IS THE POINT OF THIS PROMPT
Every deliverable asset gets its own artboard. Name each board with the exact name given
below, spelled as written. Boards 1 through 7 are assets. A composite board, meaning one
that shows two marks together, two layers flattened, or one mark at several sizes, is
allowed only on boards 8 through 11, which are labelled proof. A proof sheet is never an
asset and nothing is exported from it.

No asset board carries more than one mark. Board 3 carries none, by design. On boards 1
through 7: no comparison strip, no family row, no size ladder, and no annotation inside
the live area. The Cinzel and IBM Plex Mono labels on boards 6 and 7 are part of the
emblem lockup being drawn, so they are artwork rather than annotation.

ARTBOARDS TO PRODUCE

  1. icon-greece-512
     512x512. The launcher mark on ground #171A1C, mark in accent #7C93A6. Mark occupies
     roughly 60 to 70 percent of the canvas width, optically centred. This is the master
     asset.

  2. icon-greece-fg
     108x108. The SAME mark as the Android adaptive-icon FOREGROUND LAYER ONLY, drawn in
     accent #7C93A6. Transparent background, no ground fill of any kind. Every part that
     carries meaning sits inside the middle 72x72; the outer 18 units on each side are
     masked away by the launcher and may hold nothing load-bearing. Keep the feet and the
     bowl rim inside the safe zone with room to spare, since some launchers crop harder
     than the spec.

  3. icon-greece-bg
     108x108. The adaptive-icon BACKGROUND LAYER: a flat fill of #171A1C, edge to edge.
     Nothing else on this board. No mark, no rule, no texture, no vignette.

  4. icon-greece-48
     48x48. The mark at the size that ships, drawn for that size rather than scaled down
     from 512. Thin the detail until the three legs, the open space between them, the
     ground line and the shallow bowl all still read. One instance only; the size ladder
     belongs on board 11.

  5. icon-greece-mono
     512x512. The mark in bone #E6DECC alone on neutral ground #171310, for notification
     icons and favicons where accent hue is gone. Single flat ink, no second value, no
     grey. If the mark needs its accent to hold together, fix the mark, not this board.

  6. emblem-greece-header
     640x160. THE TIER 2 EMBLEM: Athena's owl, from the Athenian tetradrachm. This is a
     different mark from the launcher icon and appears only here and on board 7. Draw the
     owl standing frontal: compact body, head facing the viewer with two large round eyes
     and a short beak, two legs on a ground line, short tail. No crescent, no lettering, no
     wreath. The olive sprig may stand behind the shoulder if it survives at this scale.
     Place it at header scale, roughly 32 units tall, beside its label set in Cinzel caps
     with wide tracking: GREECE, with THE DAY'S ORACLE beneath in IBM Plex Mono, smaller,
     in dim #9A917D. Ground #171A1C, owl in accent #7C93A6, label in bone #E6DECC. The
     label is why a famous mark is safe here when it would not be safe alone on a home
     screen. The owl is never a launcher icon and never appears on boards 1 through 5.
     Two things the owl must not do: it must not read as a bowl on legs, so keep the head
     and the two legs unmistakable against the tripod's headless three; and it may carry
     more detail than the launcher mark, because it never has to work alone.

  7. emblem-greece-share
     800x500. The same owl at share-card scale, roughly 128 units tall, on ground #171A1C,
     with the label lower in the field and an incised 1px rule at
     rgb(230 222 204 / 0.16) if the composition needs one. More detail is allowed here:
     feather texture on the breast, the olive sprig fully drawn. Same subject, same
     construction, nothing new introduced.

  8. proof-greece-mask-circle
     A PROOF SHEET, not an asset. The composed icon, board 2 over board 3, under a
     circular launcher mask. Present at 512x512 with the mask boundary at the artboard
     edge and nothing outside it. This board proves the safe zone held. The two layers
     stay separate on boards 2 and 3; this flattening exists here and nowhere else.

  9. proof-greece-mask-squircle
     A PROOF SHEET, not an asset. The same composed icon under a squircle mask, presented
     the same way, and flattened only on this board.

 10. proof-greece-failure
     A PROOF SHEET, not an asset. 1400x700. The correct mark drawn once at the left, then
     six failure specimens beside it, each one a wrongly drawn Greece tripod, each labelled
     with the failure name and a one-line note in IBM Plex Mono saying what in the correct
     construction defends against it. Do not draw any other culture's emblem on this board
     as a reference specimen; the failures are drawn as bad tripods, not as the marks they
     drift toward.
       FILLED TRIANGLE. Legs solid under a disc. Defence: three separate strokes, open
         negative space, an elliptical bowl opening.
       PINWHEEL. Legs radiating from a hub. Defence: the bowl's underside and the ground
         line, two horizontal registers a radial mark cannot have.
       WIDE BEAM. The bowl spread across the full width. Defence: the 60 percent width
         ceiling and the vessel's depth.
       SHELL FAN. Legs meeting at one bottom vertex with the arc opposite. Defence: three
         separated feet, and the bowl sitting on the same side as the convergence.
       TRIDENT. Members rising above the mass. Defence: nothing rises above the bowl.
       RING HANDLES. Handles restored, reading as a crescent at small size. Defence: the
         handles are dropped.

 11. proof-greece-scale
     A PROOF SHEET, not an asset. 1200x400. The mark at 512, 108, 48 and 24 in one row on
     ground #171A1C, each at true relative size, each labelled with its pixel size beneath
     in IBM Plex Mono. The point of this board is to make the failure point visible, so do
     not thicken the small sizes to flatter them. If the mark stops holding at 24, show
     that it stops and say in a note which element goes first.

ALREADY REFUSED, SO YOU DO NOT RE-PROPOSE IT
  The Antikythera mechanism. Conceptually apt for an app that computes an ephemeris and
  the wrong register entirely, a scientific instrument in a surface built on shrine and
  petition. A gear reads as "settings" in any interface.
  The crescent and disc. At 48px it is indistinguishable from the star and crescent, which
  postdates it by over a millennium and has no connection to it.
  Columns, laurel, the ordinary classical furniture of a stock-photo Greece.
  Zodiac clip-art, glowing orbs, starfields, crystal balls, purple nebulae. This product's
  differentiator is that it is not that.
  Deity portraits. Every launcher mark in this set is an instrument or a procedure, which
  keeps the set legible at icon size and keeps the app out of rendering gods. The owl on
  boards 6 and 7 is an attribute beside a label, and it stays there.

CONSTRAINTS
  Square corners everywhere in the interface. The icon is exempt, since platform masks
  round it anyway; design for the mask rather than fighting it.
  No gradients, no drop shadows, no bevels, no glow, on any board.
  Everything survives being flat. This identity has no depth to hide behind.
  Hue is never the only thing separating one mark from another.

IF YOU THINK A DECISION HERE IS WRONG, write a note on the relevant proof sheet saying so.
Do not quietly draw something else.
```
