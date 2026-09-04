# Prompt: the fifty deity glyphs

Paste into Claude Design. It produces a canvas of artboards, not code.

This is a different commission from `brand-identity-design.md`. That one asks for
six launcher icons that must survive alone on a home screen at 48px. This one
asks for fifty inline marks that never appear without a name beside them, at 16
to 24px, monochrome, single weight, inside the chart wheel, the placements
table, and running Spectral prose. The research they are drawn from is
`docs/design/deity-glyphs.md`; the icon set they must not collide with is
`docs/design/culture-marks.md`.

## Before you paste: four decisions this brief encodes

1. **The hand carries the difference, not the subject.** Greece and Rome share
   five of ten subjects: helmet, thunderbolt, harpe, trident, herald's staff.
   Rome took those gods from Greece wholesale, so forcing an artificial
   difference would be its own dishonesty. The research's resolution is to draw
   the Greek marks in one stroke language and the Roman in another, taking the
   cue from where each is attested: Greek attributes reach us through vase
   painting, Roman through struck coin relief. That is the one instruction in
   the source that cannot be solved by choosing a different attribute, so the
   brief is built around it. The five hands come first and the fifty hang off
   them.
2. **Status is a drawing constraint, not a footnote.** 27 attested, 22 composed,
   1 invented. A composed mark must not be drawn to look more ancient than an
   attested one, which means no glyph in the set gets period texture, wear, or
   antiquing. The hand is a construction language; it is not a patina.
3. **The sun-and-moon repetition is locked.** Four of five cultures draw the sun
   as a disc and the moon as a crescent, because that is what those objects look
   like. The separation lives in the frame. The brief tells the designer not to
   fix it.
4. **Carthage's Mercury is a bounded choice with four named candidates.** The
   current caduceus duplicates Rome's and must move. A research pass produced
   four replacements, two recommended and two included so the set can foreclose
   them on the record. The designer picks from those four and does not invent a
   fifth.

---

```text
You are designing fifty deity glyphs for Astra Antiqua, an ancient-astrology
product. Five cultures, ten celestial bodies each, one mark per pair. I want a
canvas of artboards. These are marks, not illustrations.

THE PRODUCT, IN ONE PARAGRAPH
One sky is computed from a real ephemeris, and five ancient cultures read that
same sky through their own theology: Egypt, Greece, Canaan, Carthage, Rome. The
same placement keeps the same core meaning in every voice; each culture's
reading is native to its own institutions. The product's claim is honesty rather
than mysticism. It states on a method page that positions are computed and
nothing is invented. Three modern bodies, Uranus, Neptune and Pluto, are carried
as declared receptions under native names, because no ancient culture knew them.

WHERE THESE MARKS LIVE
Beside a body's name in the chart wheel, in the placements table, and inline in
running prose. Roughly 16 to 24 px. Monochrome. Single weight. Always with a
label nearby, so the mark never has to identify itself alone. Bone #E6DECC on
the culture's ground; the culture accent is reserved for the three received
bodies. Grounds and accents, exact:
  Egypt     ground #1A1712   accent #B59A55  (gold)
  Greece    ground #171A1C   accent #7C93A6  (aegean)
  Canaan    ground #1A1813   accent #8A9268  (cedar)
  Carthage  ground #191218   accent #94648C  (tyrian)
  Rome      ground #1B1410   accent #A5544A  (pompeian red)
  Neutral   ground #171310   accent #B59A55
Inks: bone #E6DECC, prose #D9D1BF, dim #9A917D, faint #6F6B60.
Type: Cinzel for display caps, Spectral for prose, IBM Plex Mono for data.
The interface identity is "The Instrument in the Temple": flat culture-tinted
grounds, square corners, no gradients, no shadows, no glass, no glow. The only
ornament is an incised 1px rule. It should read like a museum wall label.

================================================================
PART 1. THE FIVE HANDS. START HERE.
================================================================

THE PROBLEM THIS SOLVES
Greece and Rome share five subjects out of ten. Mars is a crested helmet in
both. Jupiter is a thunderbolt in both. Saturn is the harpe in both. Neptune is
a trident in both. Mercury is the same herald's staff. This is the honest
answer, because Rome took these gods from Greece wholesale, and the product's
claim was never that the gods differ. It is that the readings differ: Greece
questions, Rome rules.

So the difference is carried by the hand. Same trident, different hand, is the
most truthful visual statement of "Rome inherited this god and read him its own
way." Every one of the fifty is drawn in its culture's hand, not only the ten
that collide.

THE THREE CARRIERS THAT SURVIVE MINIFICATION
A hand expressed only in terminal detail dies at 16px. Build each hand into
three properties that survive, in this order of importance:
  1. AXIS. Is the mark square to the grid, or tilted off it?
  2. SYMMETRY. Is it mirrored about a centre line, or hand-balanced?
  3. PROPORTION. Is it compact and fat, or elongated and generous?
Terminal shape is the fourth carrier and the weakest. Use it, but never let it
be the only thing separating a Greek mark from its Roman twin.

STROKE WEIGHT IS NOT A CARRIER. One nominal weight across all fifty. A hand may
taper a stroke below the nominal; no hand may exceed it.

--- HAND 1. EGYPT: the incised relief and the scribe's line ---
Taken from temple and tomb relief cut with a chisel, and the linear drawing of
funerary papyri.
  Line: constant width, no swell. Terminals cut flat and square.
  Axis: true vertical and true horizontal. Nothing tilts. Diagonals are held at
    fixed angles (30, 45, 60), never at an approximate one.
  Curves: arcs of a single circle, struck, not freehand. A curve meets a
    straight at a clean tangent or at a corner, never at a fudge.
  Symmetry: exact where the object is symmetric, and the object usually is.
  Composition: every mark sits between an implied baseline and an implied top
    line, the way a register does.
  Never: tapering points, calligraphic swell, wobble, rotated axes.

--- HAND 2. GREECE: the brush on the pot ---
Taken from black-figure and red-figure vase painting, where the line is laid
down in one pass with a loaded brush.
  Line: swells at the belly of a curve, tapers toward its end. Terminals come to
    a point, or thin out and stop.
  Axis: everything sits 3 to 8 degrees off square. A Greek mark is at rest, not
    at attention.
  Curves: generous, drawn from the wrist, running slightly longer than the
    object strictly needs. Nothing is ruled; a "straight" stroke in this hand
    carries a faint bow.
  Symmetry: hand-balanced, never mirrored. Paired elements differ slightly in
    length or angle. Circles are drawn, not struck: closing where the stroke
    began, with a visible entry.
  Never: compass circles, blunt square terminals, dead-vertical anything.

--- HAND 3. ROME: the struck die ---
Taken from engraved coin dies, cut with a graver into steel, struck, and worn.
  Line: even and slightly the heaviest read in the set, blunt squared terminals
    with a small flare where the graver entered.
  Axis: dead square. Verticals are vertical. The mark is centred in its field.
  Curves: compass-struck. Straights are ruled.
  Symmetry: mirrored about the vertical axis wherever the object allows.
  Proportion: compact, filling its field to the margins, because a coin's field
    is small. Small parts are enlarged out of true scale so they survive the
    strike: tines are stubbier and fatter than a real trident's, a crest is
    thicker than a real crest.
  Never: tapered points, tilt, a free curve, a shape that floats in its field.

--- HAND 4. CANAAN: the driven wedge and the cut seal ---
Taken from Ugaritic alphabetic cuneiform pressed into clay, and from stamp and
cylinder seals cut into stone.
  Line: short segments, each with one blunt end and one narrower end, the
    direction the stylus travelled. Where a stroke tapers, it is a wedge taper
    with straight sides ending in a chisel point, never a brush's curved swell.
  Axis: hard angles, held. Joins are corners rather than curves.
  Curves: permitted, but each is one uniform arc of a single tight radius. A
    compound curve is drawn as two arcs meeting at a visible corner.
  Composition: sparse. Two or three strokes with air around them. Every mark
    should read as pressed or cut, not drawn.
  Never: a continuous unbroken outline, thick-and-thin swell, ornament.

--- HAND 5. CARTHAGE: the shallow-chiselled votive stele ---
Taken from the Tophet stelae, cut in soft stone by workshop carvers rather than
court artists.
  Line: uniform, a touch heavy, blunt square terminals that sometimes overshoot
    the join. The precision is workmanlike, not refined.
  Geometry: everything reduces to a circle, a triangle, a trapezoid, a straight
    bar. Frontal and axial. No three-quarter views.
  Repetition: strictly regular. Rays evenly spaced, star points evenly spread.
  Fill: THIS IS THE ONLY HAND ALLOWED A SOLID FILL, and the permission is
    load-bearing (see the Carthage collision rules). Everywhere else in the
    fifty, a shape is an outline.
  Never: anatomical modelling, fine detail, elegance.

--- THE FIVE SHARED SUBJECTS, RESOLVED HAND BY HAND ---
Draw each of these twice. The subject is identical; the construction is not.

MARS, the crested helmet.
  Greece (Ares, attested): a smooth domed bowl in profile drawn as one tapering
    curve, one raised crest arc riding above it with a visible gap, the crest
    thinning to a point at the rear, the whole tilted about 5 degrees.
  Rome (Mars, attested): the bowl a struck arc, symmetric, sitting square on a
    horizontal brow-line, the crest a blunt thickened ridge cut flat at both
    ends, nothing tilted.

JUPITER, the thunderbolt.
  Greece (Zeus, attested): a zigzag double-headed keraunos, two flared ends
    joined by a short zigzag shaft. The flares open into tapering points, the
    zigzag segments are unequal, the whole sits off square.
  Rome (Iuppiter, attested): a bundled zigzag with flared ends, symmetric about
    its own centre, segments equal, flares blunt and squared, the axis held at
    exactly horizontal or exactly 45 degrees with no drift.

SATURN, the harpe.
  Greece (Kronos, composed): a curved blade with one small inward barb near the
    tip, on a short straight handle. The blade is a single tapering brush curve,
    thin at the tip, and the handle carries a faint bow.
  Rome (Saturnus, attested): a short, curve-bladed sickle. The blade is heavy
    and dominant with a visible cutting edge and a thick-to-thin taper; the
    handle is a stub. Blade-heavy proportion is what separates it from the
    lituus in the app icon set, so do not lengthen the handle.

NEPTUNE, the trident.
  Greece (Poseidon, composed): three straight tines rising from a short shaft,
    no crossbar. Tine lengths uneven, the outer two bending slightly outward,
    all three tapering to points.
  Rome (Neptunus, composed): three tapering tines on a short explicit crossbar,
    equal in length, stubby, fat, blunt-tipped, mirrored about the haft.

MERCURY, the herald's staff.
  Greece (Hermes, attested): a short vertical staff topped by a closed
    figure-eight loop, standing for the kerykeion's entwined serpents. The loop
    is drawn in one continuous tapering stroke that crosses itself and thins
    back toward its entry. No wings. The shaft bows.
  Rome (Mercurius, attested): a caduceus, a winged staff with two crossed
    serpent-loops. The shaft is ruled straight, the wings are two blunt
    symmetric ticks at the head, the loops are struck curves crossing on the
    axis. THE WINGS ARE ROME'S AND ONLY ROME'S. They are the second separation
    after the hand, and they must never migrate to the Greek mark.

THE TEST THAT MATTERS
Print the ten shared marks at 16px with their labels removed. If a viewer cannot
sort them into two columns of five, the hands are not doing their work, and the
fix is axis, symmetry and proportion, not more detail.

================================================================
PART 2. CONSTRUCTION
================================================================

GRID. One shared 24 x 24 grid for all fifty, with a 2-unit optical margin, so
the live area is 20 x 20. Draw at 24. Every glyph is verified at 24, 20 and 16.

WEIGHT. One nominal stroke weight across the whole set, sized so that at 16px it
lands on a whole pixel with no half-pixel softening. A hand may taper below the
nominal. No hand exceeds it. Do not use weight to separate two marks; the set
has to hold together as one system beside one size of Spectral.

OPTICAL SIZING. Circles overshoot the cap height slightly. Points and spikes run
a little long so they still read after antialiasing. A mark built from a
horizontal (Shamem's bars, El's crown band) needs more visual width than a mark
built from a vertical, or it will look smaller in the same box.

STROKE BUDGET. Roughly five discrete strokes at full size, and that is a
ceiling, not a target. One known exception is Rome's Sol, whose radiate crown
runs to a ring plus five to seven spikes. Fix it in one of two ways and say
which you chose: draw the spikes as a single repeated motif in one pass, or cap
the full-size rendering at five spikes rather than reserving that cap for the
small-size fallback.

THE 16px FALLBACK. Every glyph ships a named fallback that says WHICH stroke is
dropped first and what must survive. Where the research already fixed the order,
it is quoted in Part 4 and is not open. Where it did not, you decide and label
it. A fallback is never a different mark; it is the same mark with the
last-added stroke removed.

CULTURE-MARK CLEARANCE. The launcher icons live in the same product: Egypt's
balance, Greece's Delphic tripod, Canaan's cuneiform wedges, Carthage's cothon
harbour plan, Rome's lituus. No glyph may rhyme with its own culture's icon. Two
live cases: Rome's rod cluster against the lituus (Part 4), and Carthage's Yam
coil, and the proposed steering-oar, against the cothon ring (Parts 4 and 6).

================================================================
PART 3. THE HONESTY RULE, AND WHAT IT FORBIDS YOU TO DRAW
================================================================

Every entry carries a status:
  ATTESTED  this exact attribute is used for this deity in the real record.
  COMPOSED  the attribute is genuinely that deity's, but this reduction to a
            planetary sign is modern work.
  INVENTED  no ancient basis. Made for this product, and labelled so.
Across the fifty: 27 attested, 22 composed, 1 invented.

WHY THIS CONSTRAINS THE DRAWING. A mark can claim a pedigree by how it is drawn.
Distress, chipping, deliberate roughness, an archaic irregularity, a "found
object" finish: all of these say ancient. If a composed mark gets that treatment
and an attested one does not, the drawing contradicts the label, and the label
is the product's central claim.

THREE HARD RULES:
  1. NO PERIOD TEXTURE ANYWHERE. No wear, no chipping, no antiquing, no
     deliberate hand-tremor. Every one of the fifty is reduced to the same
     degree. The hand is a construction language taken from a medium, not a
     simulation of that medium's decay.
  2. THE MARK NEVER SIGNALS ITS OWN STATUS. Do not mark composed glyphs with a
     dashed stroke, a lighter weight, a dot, an outline, or any other tell. The
     app carries status in text on the method page. A composed glyph sits in the
     set at full visual confidence.
  3. ALL FIFTEEN RECEIVED-BODY GLYPHS ARE COMPOSED OR INVENTED, and none may be
     drawn to look otherwise. Uranus, Neptune and Pluto in every culture: no
     ancient culture knew those planets. Osiris's crook and flail is thoroughly
     attested for Osiris; nobody in Egypt ever used it for a planet, because
     Pluto was found in 1930. The attribute is ancient, the assignment is ours.

THE ONE INVENTION. Canaan's Shamem for Uranus survives as little more than a
name for "the heavens": no myth, no epithet, no image. It is drawn as two short
horizontal bars, stacked with a gap, each with a faint upward bow, and it is
marked invented. It is the plainest mark in the fifty and it must stay that way.
DO NOT ENRICH IT. Adding stars, a rim, a third bar, or any figurative hint would
dress an invention as a find, which is the exact failure this set exists to
avoid.

WHAT THE CLASSICAL PLANET SYMBOLS ARE. The familiar signs are Byzantine-era
abstractions of Greek and Roman deity attributes: the Venus sign is a hand
mirror, the Mars sign a shield and spear, the Saturn sign a harpe sickle. They
are not neutral astronomical notation, and they are not Egyptian or Canaanite in
any sense. Do not reach for them for Egypt, Canaan or Carthage. For Greece and
Rome a glyph that resembles the familiar sign is being honest rather than lazy,
because the familiar sign descends from that very attribute.

================================================================
PART 4. THE FIFTY
================================================================

Each row is body, deity, status, then the mark. The mark descriptions are
drawing instructions taken from the research. Follow them literally. Where you
believe one is wrong, say so on the canvas rather than quietly redrawing it.

---------------- EGYPT ---------------- hand 1, the incised relief

SUN      Ra                  attested
  a plain sun disc with a single rearing uraeus-cobra looping up beside its base
MOON     Khonsu              attested
  a crescent moon lying on its back, cradling a full disc resting inside/above it
MERCURY  Sebegu              composed
  a was-sceptre: a straight staff, forked at the base, with a small angular
  animal-head finial
VENUS    Isis                attested
  the throne hieroglyph: a low rectilinear seat with a back, seen in profile
MARS     Horus the Red       composed
  the wedjat (Eye of Horus): an almond eye with brow line, pupil, and a spiral
  tear-mark below the outer corner
JUPITER  Amun                attested
  the shuty: two tall parallel plumes rising from a short base
SATURN   Geb                 attested
  a seated goose in profile: rounded body, long curved neck, small bill
URANUS   Nut                 composed
  a shallow arc studded with a few small stars, as if a fragment of her
  star-covered arched body
NEPTUNE  Nun                 composed
  a pair of raised arms opening upward, cradling a small disc between the
  fingertips
PLUTO    Osiris              composed
  the crook and flail, crossed at a single point

ENFORCED CONSTRAINTS, EGYPT
E1 DISCS (Ra / Khonsu / Nun). Nobody gets a bare circle. Ra's disc stands alone
   beside a small uraeus hook. Khonsu's disc is caught inside a crescent cup.
   Nun's disc is the smallest of the three and is held between fingertips. If
   any two still crowd at 16px, DROP NUN'S DISC FIRST: the raised-arms V is
   independently legible without it, being itself an attested Egyptian sign, the
   ka-arms.
E2 TWIN PLUMES. Amun's shuty and Osiris's atef crown both carry paired ostrich
   feathers in the full record. Resolved by not using the atef for Osiris at
   all. Twin uprights belong to Amun alone in this set. Osiris is crook and
   flail. Do not restore the atef.
E3 ARCS (Khonsu / Nut). Nut's arc stays visibly SHALLOWER than Khonsu's deeper
   crescent cup. Her dots sit on the arc's CONVEX OUTER EDGE, never in a concave
   pocket. THE DOT COUNT NEVER DROPS TO ONE: a single dot beside an arc reads as
   Khonsu's disc at 20px.
E4 STAFFS (Sebegu / Osiris). Checked and cleared: a single vertical shaft versus
   a four-way diagonal cross. Hold that distinction; do not let the crook and
   flail collapse toward parallel.

---------------- GREECE ---------------- hand 2, the brush on the pot

SUN      Helios              attested
  A shallow crown-band studded with 5-7 upward spikes (a radiate diadem), open
  at the base, not a closed disc
MOON     Selene              attested
  A single crescent, horns up, drawn free-floating, no handle, no attached face
MERCURY  Hermes              attested
  A short vertical staff topped by a closed figure-eight (lemniscate) loop,
  standing for the kerykeion's entwined serpents
VENUS    Aphrodite           attested
  A scallop shell in profile: 4-5 ribs radiating from a single point, closed
  along a shallow outer arc
MARS     Ares                attested
  A crested helmet in profile: a smooth domed bowl with one raised arc (crest)
  along the top
JUPITER  Zeus                attested
  A zigzag double-headed thunderbolt (keraunos): two flared ends joined by a
  short zigzag shaft
SATURN   Kronos              composed
  A hooked sickle (harpe): a curved blade with one small inward barb near the
  tip, on a short straight handle
URANUS   Ouranos             composed
  A shallow arc (the vault of sky) carrying three small star-points along its
  curve
NEPTUNE  Poseidon            composed
  A trident: three straight tines rising from a short shaft
PLUTO    Plouton             composed
  A cornucopia: one thick horn curving and tapering from a wide open mouth to a
  point, with two small round marks spilling from the mouth

ENFORCED CONSTRAINTS, GREECE
G1 THE CURVE FAMILY (Selene / Kronos / Plouton). All three reduce to a curved
   line and a careless render collapses them at 20px. Selene stays a single
   uniform-width curve with nothing attached, and she is THE ANCHOR the other
   two are differentiated from. Kronos gets the small inward barb plus a
   straight handle stroke, both load-bearing; if only one can survive, KEEP THE
   HANDLE. Plouton's horn is drawn with two curves for real thickness, never a
   thin arc, plus the two overflow dots at the mouth. SIMPLIFICATION ORDER:
   Plouton's dots first, Kronos's barb second, NEVER SELENE.
G2 THE FAN FAMILY (Helios / Aphrodite). The crown's spikes rise from a distinct
   curved band drawn as a visible arc beneath them, like a rim; the shell's ribs
   converge to a single point with no band, closed by a shallow outer arc on the
   far side. Crown spikes EVEN in length, shell ribs UNEVEN, which is also how
   each is drawn in the source material.
G3 HEADWEAR ON AN IMPLIED BROW (Helios / Ares). The crown is angular and open,
   spikes with a gap at the base. The helmet is smooth and closed, a continuous
   domed bowl with one curved crest arc and no spikes. Third-closest pair in the
   set; give it a deliberate look at final art.
G4 STICK-WITH-SOMETHING-ON-IT (Hermes / Poseidon / Zeus). One closed loop,
   versus three separated open tines, versus flared fins at both ends of a bent
   spine rather than one end. The original research never examined this family
   even though staffs are a usual offender. It needs the same side-by-side pass
   as G3. Note that Poseidon's trident and Plouton's cornucopia do NOT collide:
   Plouton is a horn, not a bident.

---------------- CANAAN ---------------- hand 4, the driven wedge

SUN      Shapash             attested
  a small disc behind a flat horizontal bar with two short upturned wingtips (a
  winged sun-disc, unrayed)
MOON     Yarikh              attested
  a single closed crescent (sickle moon), tips nearly touching
MERCURY  Kothar              composed
  a barbed fishhook: an open hook-curve (~200 degrees of arc) with a short barb
  near the point
VENUS    Attart              composed
  a plain 5- or 6-point star, no enclosing circle
MARS     Resheph             attested
  a single arrow on the diagonal: shaft, small triangular head, two-stroke
  fletch at the tail
JUPITER  Baal Hadad          attested
  an upright shaft sprouting a small leaf-fork at its base
SATURN   El                  attested
  two short horns diverging upward from a horizontal band (a horned crown, seen
  frontally)
URANUS   Shamem              invented
  two short horizontal bars, stacked with a gap, each drawn with a faint upward
  bow
NEPTUNE  Yammu               composed
  a single coiling line with one full S-bend, tapering to a point at both ends
PLUTO    Motu                composed
  two shallow curves meeting tip-to-tip at both ends (an open lens/vesica),
  split by a short horizontal tongue-tick

ENFORCED CONSTRAINTS, CANAAN
C1 Yarikh's crescent stays CLOSED: tips nearly touching, one continuous curve,
   no bar.
C2 El's horns stay OPEN and diverging, sitting on a straight horizontal bar. THE
   BAR IS THE TELL AT ANY SIZE AND MUST NEVER BE DROPPED.
C3 Kothar's fishhook is a partial arc kept open rather than closing toward a
   full sickle. If the barb is lost at small size, the hook's more-open
   curvature is the only remaining differentiator, so DO NOT LET IT TIGHTEN.
C4 Yammu's line must show a FULL S-BEND, two opposing curves. A single gentle
   arc reads as Yarikh's moon.
C5 Motu's lens stays OPEN AT BOTH TIPS, a visible gap at each end. If the tips
   close up it reads as Yarikh's crescent.
C6 ORIENTATION IS FIXED (Resheph / Baal Hadad). Resheph's arrow is ALWAYS
   diagonal, with arrowhead and fletch. Baal's spear is ALWAYS vertical, with a
   leaf-fork foot. Never let either rotate into the other's angle.
C7 ASTRAL PAIR (Attart / Shapash). Attart's star has no enclosing circle and
   radiates points. Shapash's disc is a small solid circle with a horizontal
   wing-bar and no points. Do not let Shapash's disc pick up rays or Attart's
   star pick up a circle outline.
C8 THE FIVE-WAY CURVE FAMILY (Yarikh / El / Kothar / Yammu / Motu) has only ever
   been checked with Yarikh as the hub. There is no pairwise rule yet for
   Kothar-vs-Motu, Kothar-vs-Yammu or El-vs-Motu. "Distinct from Yarikh" does
   not guarantee "distinct from each other." TEST ALL FIVE AGAINST EACH OTHER
   and put the grid on the canvas.
C9 A WHOLE-WHEEL RISK, NOT A GLYPH RISK. Moon and Venus sit adjacent in most
   wheel layouts, which places Yarikh's crescent beside Attart's star. A crescent
   beside a star, monochrome, at small size, is also the star-and-crescent, an
   unintended reading of a living tradition. Check the real adjacency in the
   real wheel. If it fires, change the placement or the star's rotation and
   point count. Do not change what either glyph is.

---------------- CARTHAGE ---------------- hand 5, the votive stele

SUN      Semes                     composed
  a plain disc with four to six short rays radiating from its rim (no wings, no
  ring)
MOON     Tanit                     attested
  the Sign of Tanit: a trapezoid body, a horizontal crossbar for arms set near
  its top, and a disc for a head
MERCURY  Sakun                     composed
  CURRENTLY a caduceus, a vertical staff wrapped by two opposed serpent-curves.
  THIS MARK IS BEING REPLACED. See Part 6 and draw the replacement, not this.
VENUS    Astarte                   attested
  an eight-pointed star, optionally ringed by a thin circle at larger sizes
MARS     Melqart                   attested
  two parallel vertical pillars of equal height, each capped with a short
  horizontal tick
JUPITER  Baal Hammon in bounty     attested
  a pair of curling ram's horns, symmetric, meeting at a small brow-bridge
SATURN   Baal Hammon the elder     attested
  a single curved sickle blade on a short straight handle
URANUS   Baal Shamem               composed
  a forked lightning bolt: a short zigzag stroke with two barbed ends
NEPTUNE  Yam                       composed
  a single tight serpent coil, about one and a half turns, with a small distinct
  head and tongue-flick at one end and a tapering tail at the other, never
  closed into a full ring
PLUTO    Mot                       composed
  two curved, hook-tipped strokes meeting at a point, like a wide gaping pair of
  jaws

ENFORCED CONSTRAINTS, CARTHAGE
K1 NO BARE CRESCENT-PLUS-DISC FOR ANYONE. Crescent-over-disc is the single most
   reused Punic religious image and three of these ten could reach for it.
   Semes gets a disc alone, rayed, no crescent. Tanit gets the full compound
   Sign, trapezoid plus crossbar plus disc, because the trapezoid is what makes
   her mark exclusive. Astarte gets the star, not her also-attested
   horned-crescent variant.
K2 FILL IS LOAD-BEARING (Semes / Astarte). An eight-point star and a rayed disc
   are both a cluster of lines radiating from a centre, and the eight-point
   correction pushed them closer together. HARD RULE: Semes is a SOLID FILLED
   disc with short blunt external ticks. Astarte is an OPEN, UNFILLED
   crossing-line star with sharp points and no filled centre. This is the one
   place in the fifty where fill carries meaning.
K3 TWO CURVES MEETING AT A VERTEX (Baal Hammon's horns / Mot's jaws). Same
   underlying construction. The horns are a CLOSED, SYMMETRIC curl closing at a
   brow-bridge; the jaws are an ASYMMETRIC 90 to 120 degree gape. Each
   independently degrades toward a generic shape, the horns toward a comma, the
   jaws toward a checkmark, which is one failure arriving from two directions.
   Side-by-side check at 20px is mandatory. Secondary, lower confidence: Mot's
   jaws against Baal Shamem's lightning at extreme minification, since a
   maximally simplified version of either reduces to a bent line with one or two
   vertices.
K4 YAM NEVER CLOSES. The coil keeps a visible head and a tapering tail breaking
   its circumference and never becomes a full ring. This is what keeps it off
   the cothon, Carthage's own launcher icon, which is a broken ring of ship
   sheds around an offset island.
K5 THE SICKLE STAYS TIGHT (Baal Hammon the elder). A lone curved blade on a
   handle at 20px monochrome carries a modern hammer-and-sickle reading. The
   ancient Saturn attribute is genuine and stays. Keep the blade a TIGHT
   crescent and never place the glyph adjacent to anything hammer-shaped in a
   layout.
K6 THE SERPENT PROBLEM IS BEING SOLVED BY PART 6. The old caduceus and Yam's
   coil both used serpentine curves. Whatever replaces Sakun's mark must not
   reintroduce a serpent or a wrapped staff.

---------------- ROME ---------------- hand 3, the struck die

SUN      Sol                 attested
  a radiate crown: a plain ring rimmed with short, evenly spaced spikes
MOON     Luna                attested
  a plain crescent, horns up
MERCURY  Mercurius           attested
  a caduceus: a winged staff with two crossed serpent-loops
VENUS    Venus               attested
  a hand mirror: a round disc on a short stem
MARS     Mars                attested
  a crested helmet in profile
JUPITER  Iuppiter            attested
  a thunderbolt: a bundled zigzag with flared ends
SATURN   Saturnus            attested
  a harpe: a short, curve-bladed sickle
URANUS   Caelus              composed
  a billowing mantle held overhead in a shallow arc
NEPTUNE  Neptunus            composed
  a trident: three tapering tines on a short crossbar
PLUTO    Dis Pater           composed
  a key: a straight shaft ending in a ring and a right-angled bit

ENFORCED CONSTRAINTS, ROME
R1 THE ROD CLUSTER, AGAINST ROME'S OWN LAUNCHER ICON. The app icon is a lituus:
   a long, thin, uniformly curved shaft with a small round knop at the tip and
   nothing else attached. Mercurius's caduceus, Saturnus's harpe and Dis Pater's
   key all sit in that territory. Every glyph in the cluster carries a second
   feature the lituus lacks. The caduceus adds wings and a crossed double-loop.
   The harpe is short and blade-heavy, thick-to-thin taper, visible cutting
   edge, rather than long and uniform. The key is drawn straight-shafted with
   right angles, NEVER CURVED. The lituus stays the only pure single-curve wand
   with a plain ball terminal in the whole product.
R2 NO BIRDS. Iuppiter's eagle and Venus's dove would collide at this size, and
   the anatomical differences that separate them in full art do not survive the
   reduction. Resolved by using neither: Iuppiter takes the thunderbolt, Venus
   takes the mirror. No bird appears anywhere in Rome's ten.
R3 OPEN CURVES (Luna / Caelus). Luna's crescent is a tight, closed lens with two
   bare pointed horns. Caelus's mantle is a shallow, wide arc with two small
   outward hooks at its base for gripped fabric, drawn NOTICEABLY WIDER AND
   FLATTER than the crescent, so the two never read as one mark at two
   rotations.
R4 CIRCLES (Sol / Venus). Sol's circle is BROKEN by radiating spikes around its
   whole edge. Venus's is a CLOSED, UNBROKEN ring with a single short stem
   beneath and nothing else.
R5 THE CLOSEST REAL RISK IN THIS SET (Neptunus / Iuppiter). Both are built from
   short straight segments meeting at or fanning from a point, and at 16 to 24px
   that resemblance is closer than the rod cluster. The thunderbolt has no
   crossbar and no haft; the trident's tines all point the same direction off a
   horizontal bar. THIS is the pair to check side by side at production weight
   before locking, not the rod cluster.
R6 RING ON A STICK (Venus / Dis Pater). The mirror's disc is the LARGE, dominant
   element of its glyph. The key's ring is explicitly SMALL and paired with a
   right-angle bit the mirror has no equivalent of. Keep that size relationship
   explicit; it is the whole separation.
R7 SOL EXCEEDS THE STROKE BUDGET. A ring plus five to seven spikes is six or
   more discrete elements. Apply one of the two fixes in Part 2 and label which.

================================================================
PART 5. THE SUN AND THE MOON. DO NOT FIX THIS.
================================================================

Four of five cultures render the sun with a disc and the moon with a crescent.
That is not a failure of imagination. It is what the sun and the moon look like,
and every one of those cultures drew them that way.

THE SEPARATION COMES FROM THE FRAME, NOT THE SHAPE:
  Ra's disc carries a uraeus.        Khonsu's disc sits in a crescent cup.
  Helios is an open radiate band.    Selene is a bare free-floating crescent.
  Shapash's disc rides a winged bar. Yarikh's crescent is closed, tips touching.
  Semes is a filled rayed disc.      Carthage's moon is the Sign of Tanit.
  Sol is a ring rimmed with spikes.  Luna is a plain crescent, horns up.

You will be tempted to give one culture a square sun or a phase-diagram moon to
break the repetition. DO NOT. An invented shape for an attested body is exactly
the dishonesty this set is built to avoid, and the labels beside these marks
mean a reader is never left guessing. Spend the effort on the frames and on the
hand instead: a Roman crescent and a Canaanite crescent should differ visibly by
construction, and if they do not, the hands are underdrawn.

================================================================
PART 6. THE ONE OPEN DECISION: CARTHAGE / MERCURY
================================================================

THE PROBLEM. Carthage's Sakun currently carries a caduceus, which duplicates
Rome's Mercurius in the same row of any culture-comparison view, and which the
icon research already flagged as reading Greek or medical to a modern eye. With
Rome holding the caduceus on solid attestation, Carthage moves.

WHY THE NAME STAYS AND THE ATTRIBUTE GOES. Sakkun has no Punic image, and the
record says so bluntly. He survives almost entirely in theophoric names, his
earliest epigraphic appearance is 5th century BC, and the consensus reading of
Phoenician skn is "administrator" or "superintendent". The one object carrying
his name is the Hermes-Sakkon in the Prado, a Roman copy of an early-4th-century
Athenian original carved for a Phoenician sanctuary at Piraeus: Greek sculpture,
made in Athens, for diaspora Phoenicians, roughly 2000 km from Carthage. That is
evidence his iconography was borrowed rather than native, the opposite of what
this glyph needs. So: keep the name, drop the borrowed attribute, draw his
function from the Punic votive repertoire. Carthage's surface in this app is the
ledger and the harbour, and the god the Punic world called the superintendent
belongs there. No better Punic figure was available to substitute: Eshmun is a
healer and would put a serpent-staff back in frame, Shadrapa is also healing,
Sid is a hunter, Kothar is Canaan's and is barred.

FOUR CANDIDATES. Draw all four on a decision artboard at 24px and 16px. Ship
one, and say which. Do not invent a fifth.

--- CANDIDATE A. THE STEERING-OAR. RECOMMENDED, PRIMARY. status: composed ---
The quarter-rudder of a Punic ship, for Sakkun as the divine superintendent who
holds the helm.
STROKES. Five strokes. (1) One straight shaft running the full glyph height,
tilted about 20 degrees off vertical. (2) A short straight tiller bar crossing
the top of the shaft at a right angle and extending to ONE side only; the
asymmetry is the tell and must never be made symmetric. (3-4) The blade in the
lower third: a narrow quadrilateral hanging off one side of the shaft, drawn
with two straight edges, its lower edge cut at a slant so the blade is longer
where it meets the shaft than at its outer edge. (5) Optional short foot-tick
closing the blade's toe. Hard rule: every edge of the blade stays straight. The
moment the blade takes a curve it becomes Baal Hammon the elder's sickle. Blade
sits at the BOTTOM of the shaft, tiller at the top, which is the second
separation from the sickle (blade at top, handle below). 16px fallback: drop
stroke 5 and shorten the tiller to a stub; shaft plus slant-cut blade is what
has to survive.
ATTESTATION. The rudder is one of three maritime motif classes catalogued on
Punic votive stelae from Carthage and Cirta, alongside ships and anchors, in
Elsner's 2024 East Carolina University thesis on maritime iconography at Punic
cinerary votive sites, 72 stelae, 4th to 1st c. BCE. The Louvre's own
iconographic study of its Carthage stelae lists the gouvernail independently and
describes an axis with a handle at the summit and a rudder blade cut at an
angle, in both horizontal and vertical positioning. The motif is Punic and
votive, not borrowed. THE ASSIGNMENT TO SAKKUN IS OURS: it rests on the reading
of skn as superintendent, and no stele labels a rudder with his name. Hence
composed. Carry this caveat forward: one live scholarly reading takes the Punic
maritime motifs as Tanit-referential rather than as a separate deity's
attribute, which is a reading of intent rather than of form, and is exactly the
gap "composed" declares.
COLLISIONS. In-set: Baal Hammon the elder's sickle is the real risk, both being
a blade on a shaft, separated by two independent rules, straight blade edges
versus a tight crescent, and blade at the bottom versus blade at the top. Test
this pair side by side at 20px before locking. Melqart's twin capped pillars:
one shaft versus two, and symmetric caps versus a one-sided tiller. Baal
Shamem's forked lightning has no straight spine. No conflict with Yam's coil.
Out of set: Carthage's launcher icon is the cothon, the circular naval harbour,
so the culture's app icon and its Mercury glyph would both read "harbour" to a
cold viewer. They never appear at the same size in the same frame, but flag it
in the whole-set pass. A slant-cut blade on a pole can read as a pennant at very
small sizes, which is why stroke 5 exists to close the toe.

--- CANDIDATE B. THE TRANSPORT AMPHORA. RECOMMENDED, SECOND. status: composed --
The torpedo jar that carried Carthaginian trade.
STROKES. Five strokes. (1-2) The body as two mirrored curves running from a
narrow shoulder down to a point, a long cigar or torpedo silhouette, widest at
about one third from the top, closing to a sharp toe with no separate foot. (3)
A short flat rim tick across the top. (4-5) Two small ear handles, each a short
arc springing from the shoulder and returning to the neck, held tight to the
body so they read as ears rather than as wings. Hard rules: the handles and the
pointed toe are both load-bearing and neither may be dropped at small size,
because they are the only things separating this from the Punic bottle-idol.
Never lengthen the neck. 16px fallback: drop stroke 3 only.
ATTESTATION. Amphorae appear in the vessel repertoire of the Carthage stelae in
the Louvre's iconographic study, among the containers shown for libation. The
object itself is the best-attested artifact class in Punic Carthage, its
repertoire running from the city's foundation to 146 BC. The Phoenician torpedo
jar is a Levantine and Punic form, not a Greek or Roman one. THE HONEST
WEAKNESS: on the stelae an amphora is a cult vessel holding liquid for libation,
while the commerce reading that makes it fit Mercury comes from excavation and
trade archaeology rather than from the votive iconography. Nothing ties any
amphora to Sakkun. Do not upgrade this to attested.
COLLISIONS. In-set: the Punic bottle-idol is the live risk and it is a
within-corpus one, a cylindrical flask with a narrow neck on a curved-sided
support, which on a Punic stele is a divine image. Separated by the two ear
handles, the sharp toe, and the absence of a flaring support foot. Keep all
three or the glyph starts claiming to be an idol. Nothing else in the Carthage
ten is a closed vessel. Out of set: Rome's Venus mirror is a disc on a stem, a
different construction; Greece's Aphrodite shell is an open fan of ribs. Modern
reading: a narrow-necked vessel in an astrology app risks reading as a potion or
perfume bottle, which is why the neck stays short and the body wide-shouldered.

--- CANDIDATE C. THE PUNIC CADUCEUS, DRAWN CORRECTLY. NOT RECOMMENDED ---
A plain staff topped by two superimposed circles, which is what the Punic form
actually is, rather than the Greek serpent kerykeion. Three or four strokes: one
plain shaft with no wrap, no wings, no snakes; two circles stacked at the top,
the lower closed and the upper an open broken ring; an optional short crossbar
below them.
WHY IT FAILS. It fixes the "reads Greek" half of the problem and fails the other
half worse than the current mark does. Greece's Hermes is already specced as a
staff topped by a closed figure-eight loop, and two stacked circles on a shaft
IS a figure-eight on a shaft at 16px. Carthage would trade a duplication of Rome
for a duplication of Greece, in the same Mercury row, where the two sit side by
side in any culture-comparison view, and Greece and Carthage sit adjacent in the
layout where Rome and Carthage do not always. It also crowds K1's paired-circle
rule and sits near Semes's rayed disc and Astarte's star. Draw it once, on the
decision artboard, so the set can foreclose it on the record.

--- CANDIDATE D. THE OPEN HAND. NOT RECOMMENDED ---
The raised frontal palm of the Punic stelae: a rounded rectangle palm, four
short finger ticks along the top edge, one thumb tick off the side, optional
forearm stub. Attested and abundant, second in frequency only to the sign of
Tanit.
WHY IT FAILS. It belongs to no single deity. It is the dedicant's gesture or
divine protection generally, the same reason the research refused to assign the
civic horse, palm tree and ship's prow to any of the ten. On the stelae the hand
is the motif the caducei FLANK, which puts it on the wrong side of the very
pairing this replacement is leaving. And a frontal open palm, monochrome, at 16
to 24px, is the hamsa, a live symbol in Islamic, Jewish and North African
popular religion. That is the same failure the Carthage review already caught
twice, in the six-pointed star reading as a Star of David and in the lone sickle
reading as the hammer-and-sickle. It is also the universal interface glyph for
stop. Draw it once so it is foreclosed, and label why.

STANDING NOTE, WHICHEVER IS CHOSEN. Sakun is one of the two evidentially
weakest entries in the Carthage set, and a Punic-studies or Phoenician-epigraphy
specialist should check it before production. That note travels with the
replacement.

================================================================
PART 7. WHAT TO DELIVER
================================================================

Label every artboard. Keep alternatives on the canvas rather than deleting them.

1. THE MATRIX. All fifty at 24px on the neutral ground #171310: five rows, one
   per culture, ten columns, one per body, in the order sun, moon, mercury,
   venus, mars, jupiter, saturn, uranus, neptune, pluto. This is the artboard
   the whole commission is judged on.
2. THE FIVE HANDS. One artboard per culture: the culture's ten at 16px in bone
   #E6DECC on its own ground, with a short note naming the source medium and the
   three carriers as drawn. Include a strip showing that culture's three
   received bodies in the culture accent, since the accent marks receptions.
3. THE SHARED FIVE. Greece against Rome, the five shared subjects paired, at
   24px and again at 16px, Greek column and Roman column. Then the same ten with
   labels removed and shuffled, as the sorting test from Part 1.
4. GLYPHS IN PROSE. Every one of the fifty set inline in a real line of Spectral
   at real reading size, cap-height aligned, one line per glyph, so I can see
   whether the mark holds its weight beside text without shouting or vanishing.
   Show at least one paragraph of continuous Spectral with three glyphs in it.
5. THE COLLISION SHEETS. Each enforced pair or family from Part 4 drawn side by
   side at 20px: Egypt E1 and E3; Greece G1, G2, G3, G4; Canaan C8 as a full
   five-by-five grid; Carthage K2 and K3 plus the new oar-against-sickle pair;
   Rome R5 and R6.
6. THE FALLBACK SHEET. Every glyph at 24px next to its own 16px fallback, with
   the dropped stroke called out. Where Part 4 fixes the order, follow it.
7. THE CARTHAGE MERCURY DECISION. All four candidates from Part 6 at 24px and
   16px, the two recommended drawn to production quality, the two foreclosed
   drawn once with their refusal noted on the board. State your pick.
8. IN CONTEXT. One culture's ten placed around a chart wheel, and the same ten
   in a placements table, on the culture's ground with the incised 1px rule.
   Include the Canaan wheel specifically, with Yarikh and Attart in their real
   adjacent positions, as the C9 check.
9. CLEARANCE. The five launcher icons at 48px on one strip above the five
   cultures' glyph rows, so the Rome rod cluster against the lituus and the
   Carthage coil and oar against the cothon can be judged in one look.

================================================================
WHAT WILL GET THE SET SENT BACK
================================================================

- Greek and Roman twins that sort into two columns only because of their
  terminals. Axis, symmetry and proportion have to do that work at 16px.
- Any distressed, chipped, worn or antiqued mark. See Part 3.
- A composed glyph drawn with more period conviction than an attested one.
- Shamem given anything beyond its two bowed bars.
- A newly invented sun or moon shape introduced to break the repetition.
- A fifth Carthage Mercury candidate.
- A glyph that needs colour, weight, or size to be told from its neighbour.
- Any gradient, shadow, bevel, glow, or rounded corner anywhere on the canvas.
```
