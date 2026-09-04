# Prompt: the Rome launcher icon and emblem

Paste the fenced block into Claude Design. It produces a canvas of artboards, not code.

## Before you paste: what this prompt covers, and why it is Rome alone

This is one of six prompts, one per culture. The combining brief it replaces
produced boards with several marks sitting on them, and a board holding more
than one mark cannot be exported as an asset. The export contract is now stated
inside the prompt rather than assumed.

Three things the prompt encodes:

1. **The subject is closed.** Rome takes the lituus, the augur's curved staff.
   Prior research chose it, mapped its collisions against the other four marks,
   and recorded the way it fails when drawn carelessly. The prompt asks for
   drawing, not for candidates.
2. **The designer cannot see the other four cultures.** Every cross-culture
   requirement is restated as an absolute construction rule that holds on its
   own, without the designer needing to compare Rome against anything.
3. **One mark per artboard.** Composite boards appear twice, both labelled
   proof, and a proof is never an asset. The Android adaptive foreground gets
   its own board with a transparent background, because the platform composites
   the two layers at runtime and a flattened image cannot ship.

The neutral icon, the logotype, the brand system sheet and the type question
belong to their own prompts and are out of scope here.

---

```text
You are drawing two marks for Astra Antiqua, an ancient-astrology product: the
ROME LAUNCHER ICON and the ROME IN-APP EMBLEM. Those two subjects, and nothing
else. Do not draw the other cultures, the neutral icon, or the logotype.

THE PRODUCT, IN ONE PARAGRAPH
One sky is computed from a real ephemeris, and five ancient cultures read that
same sky through their own theology. Egypt weighs it in the Hall of Ma'at.
Greece questions it at the day's oracle. Canaan convenes the council of El.
Carthage audits it in the decree of the Tophet. Rome takes the auspices. The
same planetary placement keeps the same core meaning in every voice, and each
culture's reading is native to its institutions. The product's claim is honesty:
it states plainly that positions are computed and nothing is invented, and it
says so on a method page. Three modern bodies (Uranus, Neptune, Pluto) are
carried as declared receptions, admitted under native names because no ancient
culture knew them. Rome's surface in this app is THE AUSPICES OF THE DAY.

THE IDENTITY THIS MARK JOINS
The interface is called "The Instrument in the Temple". It is austere: flat
culture-tinted grounds, one muted accent per culture, square corners everywhere,
no gradients, no shadows, no glass, no glow. The only ornament is an incised 1px
rule. Type is Cinzel for display in caps with wide tracking, Spectral for prose,
IBM Plex Mono for data and microcopy. It should read like a well-set almanac or
a museum wall label, not like a mystical app.

The reader picks a culture and the app's launcher icon changes to match. This
icon ships as a compiled asset and stands alone on a home screen with nothing
beside it to explain it.

COLOUR, EXACT. Reproduce these hex values character for character.
  Rome      ground #1B1410   accent #A5544A  (pompeian red)
  Neutral   ground #171310   accent #B59A55  (gold)
Inks: bone #E6DECC, prose #D9D1BF, dim #9A917D, faint #6F6B60.
Rules: --color-rule rgb(230 222 204 / 0.16), --color-rule-row rgb(230 222 204 / 0.11).

The Rome ground #1B1410 is the only ground the Rome launcher icon uses. The
neutral ground #171310 appears once, on the monochrome reduction board. The four
other cultures have their own grounds and their own prompts, and none of them
appears on this canvas.

THE SUBJECT (closed)

THE LITUUS. The augur's curved staff, with the shaft knop, as struck on Caesar's
denarii. It is the instrument an augur held to mark out the templum before
declaring a day lawful for public business. It is an instrument rather than a
deity portrait, which keeps it legible at icon size and keeps the app out of the
business of rendering gods.

Draw: a long, thin, uniformly curved shaft, a tight closed curl at the head, the
shaft knop present as a small bead on the shaft below the curl, and nothing else
attached.

Degrees of freedom, which are yours: curl tightness within "tight and closed",
shaft length and taper, knop size and its position on the shaft, the angle the
staff sits in the field, stroke weight, and whether the stroke is uniform or
tapered.

THE NAMED FAILURE MODE, AND THE DEFENCE

This mark fails as an open shepherd's crook, which reads ecclesiastical. The
lituus is the probable ancestor of the bishop's crozier, so a loose rendering
does not land in neutral territory. It lands in a different religion, on a home
screen, under an app about Roman augury.

The defence is in the curl. A crozier's volute opens outward and flares. The
lituus curl turns tight and closes, the curve carrying past its own tangent so
the head reads as a completed hook rather than an opening spiral. Draw the knop
as a distinct bead, because the knop is the second thing separating the two
objects and it survives further down in size than the curl's tightness does.

Two secondary failures to check before you lock the drawing:
  It becomes a question mark, when the shaft runs straight and only the head
  curves. Keep the curvature continuous along the whole shaft.
  It becomes a walking stick or a candy cane, when the curl loosens to a half
  turn. A half turn is not closed.

ABSOLUTE CONSTRUCTION RULES

These come from the four sibling marks you cannot see, and from a separate set
of fifty deity glyphs drawn at 16 to 24px elsewhere in the product. Each rule
holds on its own. Treat every one as binding.

1. The curl stays SMALL against the shaft. This mark is a staff carrying a small
   terminal curl. Another mark in this set is a ring that fills its whole field,
   and the size relationship is what holds the two apart. A large curl on a
   short shaft breaks it.
2. The curl never becomes a clean unbroken circle. "Closed" means the curve
   completes its turn and passes its own tangent, with the stroke's free end
   still visible. A detached or perfectly circular head hands this mark to the
   ring form named in rule 1.
3. Nothing else attaches to the staff. No wings, no serpents, no blade, no
   crossbar, no tines, no right-angled bit, no ribbon, no fillet, no second
   terminal. The lituus is reserved as the only pure single-curve wand with a
   plain terminal anywhere in the product. The Roman deity glyphs for Mercury,
   Saturn and Pluto each carry a second feature the lituus lacks, and that
   reservation is what holds the whole cluster apart at 16 to 24px. Keep the
   lituus plain.
4. No letterforms. No inscription, no SPQR, no abbreviation, no monogram, no
   script of any kind, in any part of the mark. One culture in this set owns
   letterforms, and lettering here collides with it invisibly at 48px.
5. No balance, no beam, no hanging pans, no scale. Roman Iustitia also carries a
   scale, and the set resolved that risk by allocation: Rome takes a staff so
   another culture can keep the balance. Do not reintroduce weighing imagery.
6. No radiating legs, no spokes from a hub, no pinwheel, no triskelion, no three
   converging supports. Two other marks in the set are held apart at exactly
   that grammar, and a third radial form closes the gap between them.
7. No solid triangle under a disc, in any part of the construction.
8. The mark's mass stays distributed along the shaft. It must not become a
   vertical carrying a wide horizontal mass at the top.
9. A single continuous curvature. No S-bend, no reversing double curve. The
   S-bend belongs to a serpent glyph elsewhere in the product.
10. No bird anywhere in the launcher icon. The eagle belongs to the emblem only,
    for the reason given below.

THE IN-APP EMBLEM (closed: the subject)

THE AQUILA, the legionary standard. It appears at culture doorways, section
heads, share cards and chapter marks, always beside a label. That label is what
makes a famous mark safe here, where the launcher icon has nothing beside it.
The emblem optimises for recognition. The launcher icon optimises for
distinctness from four siblings with nothing to explain them.

The aquila is refused as a launcher icon on meaning rather than on
contamination. A legionary standard means military authority, not reading the
sky, and reading the sky is what Rome's surface does. Beside the word ROME on a
section head it is exactly right.

Draw: the standard as an object. An eagle perched on a small plinth at the head
of a pole, wings raised, gripping a bundled thunderbolt. The pole stays visible
and stays the larger part of the composition. A small wreath may sit on the
shaft below the plinth.

The named failure mode for the emblem: a frontal heraldic eagle with symmetric
spread wings, which is the shape modern national arms and twentieth-century
political emblems fixed. The defence is the object. Keep the pole and the
plinth, so the reader sees a standard a man carried rather than a crest. Keep
the bird in profile or three-quarter, wings raised asymmetrically. No shield, no
crown, no encircling text, no wreath enclosing the bird, no arrows, no banner.

The emblem may carry more detail than the launcher mark, because it never has to
work alone and never has to work at 48px.

THE EXPORT CONTRACT

Every deliverable asset gets ITS OWN artboard. One mark per board. No board
holds two marks, a comparison, a before and after, a size ramp, or a family
strip. The only composite boards are the two named proof below, and a proof is
never an asset.

Name the boards exactly as listed. Systematic names are what let the build find
them.

  icon-rome-512
    512 x 512. The lituus in bone #E6DECC on ground #1B1410.

  icon-rome-512-accent
    512 x 512. The lituus in accent #A5544A on ground #1B1410. The same drawing
    as the bone board, in the other ink. Put a one-line note on the canvas
    saying which of the two you would ship and why.

  icon-rome-fg
    108 x 108 units. The lituus alone, TRANSPARENT BACKGROUND, no ground colour
    on this board at all. All meaning inside the middle 72 units, because the
    launcher masks away the outer 18 on each side. Android composites this layer
    over the background layer at runtime, so a flattened image cannot ship. This
    board is the source for
    android/app/src/main/res/drawable/ic_launcher_foreground.xml

  icon-rome-bg
    108 x 108 units. A flat fill of #1B1410 and nothing else. No mark on this
    board. This board is the source for
    android/app/src/main/res/drawable/ic_launcher_background.xml
    The two layers are paired by
    android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml

  proof-rome-mask-circle
    Proof, not an asset. The two layers composited and masked to a circle.

  proof-rome-mask-squircle
    Proof, not an asset. The two layers composited and masked to a squircle.

  icon-rome-48
    48 x 48. The version you would ship at the size that actually appears on a
    home screen. If you dropped detail to get there, name the dropped detail in
    a note on the board and show the reduced drawing rather than describing it.

  icon-rome-mono
    48 x 48. A single bone ink #E6DECC on the neutral ground #171310, for
    notification icons, favicons, and anywhere colour is unavailable. Colour may
    never be the only thing separating this mark from another, both for
    colourblind readers and because monochrome contexts exist.

  emblem-rome-header
    The aquila at section-head scale, with the label ROME set in Cinzel caps
    with wide tracking beside it. One emblem on this board.

  emblem-rome-share
    The aquila at share-card scale. One emblem on this board.

  proof-rome-failure
    Notes, not an asset. One line per decision: the failure mode you were
    defending against, and what in the construction defends against it. Name any
    absolute construction rule that forced your hand.

The square launcher drawing also feeds the web icon set, which lives in
web/public/icons/ as icon-192.png, icon-512.png, icon-maskable-512.png and
apple-touch-icon.png. Keep the 512 boards square and keep the mark inside a
centred safe area that survives a maskable crop.

CONSTRAINTS
- No gradients, no drop shadows, no bevels, no glow, anywhere.
- Everything must survive being flat. This identity has no depth to hide behind.
- Square corners rule the interface. The ICON is exempt, because the platform
  mask rounds it anyway. Design for the mask rather than fighting it.
- Single stroke weight per mark. If the weight changes with size, show the
  weight you would ship at each size.
- Colour is never the only separator between two marks.

WHAT THE RESEARCH REFUSED FOR ROME, SO IT DOES NOT COME BACK
  The fasces. Mussolini took his movement's name from it and it sits on the
  ADL's hate symbol list, which keeps it out of a place where nothing explains
  it. It stays available in captioned editorial illustration, which is not part
  of this canvas.
  The aquila and SPQR as the launcher icon, refused on meaning. The aquila is a
  legionary standard and means military authority; SPQR is a political slogan.
  Neither describes reading the sky. The aquila is Rome's emblem, drawn above,
  where a label licenses it.
  The Colosseum, the Capitoline Wolf, laurel, columns, zodiac clip-art, glowing
  orbs, starfields, crystal balls, purple nebulae. The product's differentiator
  is that it is none of that.

ONE RISK THE RESEARCH ACCEPTED
The five marks mix categories: three instruments, one script, one architectural
plan. That is deliberate, since each is what its culture used to read or record
fate. Do not homogenise the lituus toward a shared visual category, and do not
add explanatory detail to make it easier to read cold. Rome's lituus is one of
the two marks in the set that reads immediately.

If you believe a closed decision is wrong, put the objection in a note on
proof-rome-failure and draw the decided mark anyway.
```
