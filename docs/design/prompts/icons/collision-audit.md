# Prompt: icon assembly and the collision audit

Paste the fenced block below into Claude Design. It produces a canvas of artboards, not code.

## What this prompt covers

The five launcher marks and the sixth neutral mark are drawn. This prompt assembles them into shippable assets and audits the four collisions that need active enforcement in the drawing. It is the last icon prompt in the sequence, and it is the one that produces the files a build consumes.

## Why this draft was rewritten

The previous version asked for family rows, a comparison strip, and "the whole set at 48x48" on boards that were also the deliverables. That is how the marks came back combined. This version separates the two jobs completely: an asset board carries one mark and nothing else, and every comparison lives on a board whose name starts with `proof-`, which nothing exports.

The Android section previously asked for the mark "placed on the adaptive-icon canvas", which produced one flattened image. Android needs two layers. The foreground now gets its own board with a transparent background, and the ground fill gets a second board of its own.

## The export contract

1. One mark per asset board. No asset board carries two marks, a family row, a comparison strip, a before-and-after pair, or a size ladder.
2. Board names follow a fixed grammar so a build script can find them.
3. Proof sheets are allowed, and only where the board name starts with `proof-`. A proof sheet is never an asset and is never exported.
4. The Android adaptive foreground sits on its own board over a transparent background. The Android adaptive background sits on a second board as a flat colour fill. The two are never flattened into one image on an asset board.

## Source of record

The decisions this prompt carries over live in:

- `L:/Claude Projects/astra-antiqua/docs/design/culture-marks.md`
- `L:/Claude Projects/astra-antiqua/docs/design/deity-glyphs.md`

Those paths are for the operator. The fenced prompt never refers to them, because the designer cannot open them.

## Checks run on this document

- Em dashes: **0**
- Asset boards carrying more than one mark: **0**
- Comparison instructions on asset boards: **0**. All comparison moved to `proof-` boards, each marked "not an asset, do not export".
- Android adaptive layers on separate boards: yes, foreground transparent, background flat fill.
- Cross-culture constraints stated as numeric construction rules verifiable on a single board: yes, all four pairs plus the pinwheel ban.
- Failure mode with its defence present for all six marks: yes.
- Hex values and file paths checked verbatim against the palette and the source paths above.

---

```text
You are producing the shipping icon assets for Astra Antiqua, an ancient-astrology
product, and auditing the six marks against each other before they ship. This is
an assembly and audit commission. The six marks are decided. Draw them, cut them
to every size and layer the platforms need, and prove they hold apart.

Everything you need is in this brief. Do not ask for research, source documents,
or a previous canvas.

THE PRODUCT, IN ONE PARAGRAPH
One sky is computed from a real ephemeris, and five ancient cultures read that
same sky through their own theology. Egypt weighs it in the Hall of Ma'at. Greece
questions it at the day's oracle. Canaan convenes the council of El. Carthage
audits it in the decree of the Tophet. Rome takes the auspices. The reader picks a
culture and the app's launcher icon changes to match, so each culture's icon is a
compiled asset that a reader must recognise alone on a home screen with nothing
beside it to explain it. The product's claim is honesty: positions are computed and
nothing is invented, and the app says so on a method page.

THE IDENTITY
The interface is called "The Instrument in the Temple". It is austere: flat
culture-tinted grounds, one muted accent per culture, square corners, no gradients,
no shadows, no glass, no glow. The only ornament is an incised 1px rule. Type is
Cinzel for display in caps with wide tracking, Spectral for prose, IBM Plex Mono
for data and microcopy. It reads like a museum wall label.

Grounds and accents, exact:
  Egypt     ground #1A1712   accent #B59A55  (gold)
  Greece    ground #171A1C   accent #7C93A6  (aegean)
  Canaan    ground #1A1813   accent #8A9268  (cedar)
  Carthage  ground #191218   accent #94648C  (tyrian)
  Rome      ground #1B1410   accent #A5544A  (pompeian red)
  Neutral   ground #171310   accent #B59A55
Inks: bone #E6DECC, prose #D9D1BF, dim #9A917D, faint #6F6B60.
Rules: --color-rule rgb(230 222 204 / 0.16), --color-rule-row rgb(230 222 204 / 0.11).

Draw each mark in its culture's accent on its culture's ground. Where the accent
loses the mark at 48px, draw it in bone #E6DECC on the same ground and put a
one-line note on the board saying you made that swap and why.

THE EXPORT CONTRACT. READ THIS BEFORE YOU DRAW ANYTHING.

1. Every asset board holds exactly ONE mark. Nothing else is on it. No second
   mark, no family row, no comparison strip, no size ladder, no before-and-after
   pair, no swatch, no caption inside the artboard bounds.
2. Board names use this grammar, lowercase, hyphen separated:
     icon-<culture>-<variant>-<size>
   Culture is one of: egypt, greece, canaan, carthage, rome, neutral.
3. Comparison sheets are allowed, and only on boards whose name begins with
   proof-. Write "NOT AN ASSET. DO NOT EXPORT." on every proof board. A proof
   board is where the audit happens and it is the only place two marks may appear
   together.
4. Android adaptive icons are two layers. The foreground goes on its own board
   with a TRANSPARENT background and the mark alone. The background goes on a
   second board as a flat colour fill with no mark on it. Never flatten the two
   into a single asset board. The composited preview belongs on a proof board.
5. Notes, reasoning, and the audit findings go on the canvas beside the board,
   outside the artboard bounds, set in Spectral. Board name strings and numbers
   go in IBM Plex Mono. Board titles go in Cinzel caps.

THE LIVE AREA, ONE RULE FOR EVERY BOARD

Every mark is drawn inside a LIVE AREA: the centred square holding 66.7% of the
board's width. That matches Android's 72 units inside 108, so one drawing survives
every board without redrawing. On a 512 board the live area is a centred 341x341.
On a 108 board it is a centred 72x72. On a 48 board it is a centred 32x32.

Nothing that carries meaning sits outside the live area on any board. Every
proportion rule below is measured against the live area's width or height, so you
can check each rule on one board alone with a ruler.

THE SIX MARKS

Each entry gives the subject, the way that mark dies when drawn carelessly, and
the construction that defends against that death. The subjects are closed. The
defences are binding. Stroke weight, taper, and level of abstraction are yours.

EGYPT: the balance of the weighing, in its Papyrus of Ani form.
  Dies as: a bare symmetric beam, which collapses into the generic
  scales-of-justice glyph. Egypt then reads as a courthouse and the Hall of Ma'at
  is gone.
  Defence, all four required at every size:
    - A feather finial at the top of the vertical post.
    - A horizontal crossbar with two pans hanging from its ends.
    - The baboon of Thoth, seated, present as a legible mass.
    - A plumb bob at the base, visibly OFF the vertical axis.
  Construction rules, absolute:
    - Crossbar width is at least 0.55 of the live area's width.
    - The plumb bob's line sits at least 0.04 of the live area's width off the
      post's vertical axis. It is never centred and never symmetric.
    - No lettering, no script, no character forms anywhere in this mark.
  Why the subject: the device that does the weighing rather than a metaphor for
  it, and the most repeated judgment image in the Egyptian corpus across roughly
  1500 years.

GREECE: the Delphic tripod.
  Dies as: a solid triangular mass under a disc, which is the triangle-bar-disc
  grammar of the sign of Tanit and hands Carthage's in-app emblem to Greece. It
  dies a second way as a triskelion, when the legs radiate from a hub instead of
  carrying a load.
  Defence:
    - Exactly three legs, drawn as three separate strokes with visible ground
      between them. The area enclosed by the legs is never filled.
    - The legs converge upward and terminate on the underside of the bowl,
      carrying it as load-bearing furniture.
    - A shallow bowl sitting slightly off axis.
    - No ring handles.
  Construction rules, absolute:
    - Bowl height is at most 0.30 of bowl width.
    - Bowl width is at most 0.45 of the live area's width.
    - No leg passes through or terminates at a shared centre point.
    - No lettering, no script, no character forms anywhere in this mark.
  Why the subject: the recurring image on Delphic coinage for centuries, and the
  furniture where a petitioner's question met the god's answer.

CANAAN: Ugaritic alphabetic cuneiform, a cluster of driven wedge signs.
  Dies as: tally marks. A row of even strokes is counting rather than writing.
  Defence:
    - Every stroke is a driven wedge: a wide head tapering to a point, with the
      head weight visible at 48px.
    - Both corner wedges and linear wedges appear in the cluster, in the
      proportions real cuneiform uses.
    - At least two distinct sign groups, with unequal spacing between them and
      unequal stroke counts within them.
  Construction rules, absolute:
    - No two adjacent strokes are parallel, equal in length, and equally spaced.
    - Canaan is the only mark in this product that carries letterforms. Add no
      ornament to explain it.
  Accepted cold read: a viewer with no context reads "Mesopotamia" before
  "Ugarit". The product's onboarding and its label close that gap. Do not
  compensate by inventing decoration.
  Why the subject: the world's earliest alphabet, Ugarit's own invention, and the
  medium the vow and the docket were written in.

CARTHAGE: the cothon, the circular naval harbour at Salammbo, in plan.
  Dies as: a gear, a sun, or a wheel. A gear reads as "settings" in any interface,
  which is the worst available outcome for a launcher icon.
  Defence:
    - One continuous ring, broken at exactly one point, the channel mouth.
    - An island inside the ring, off centre.
    - Ship sheds drawn as short ticks standing on the ring's inner edge, pointing
      inward, stopping well short of the island.
  Construction rules, absolute:
    - Ring outer diameter is at least 0.75 of the live area's width.
    - The channel break sits off the vertical and horizontal axes of the board.
    - The island's centre sits at least 0.08 of the ring diameter away from the
      ring's centre.
    - Tick length is between 0.10 and 0.18 of the ring diameter, and every tick
      stops at least 0.25 of the ring radius short of the ring's centre. No tick
      crosses to the middle.
    - Tick count is a prime number between 13 and 19, spacing is uneven, and the
      run is interrupted at the channel. The mark has no rotational symmetry.
    - No lettering, no script, no character forms anywhere in this mark. Punic
      script is Phoenician script at a later stage and the two are invisibly
      different at 48px, which is why script was ruled out here.
  Why the subject: Appian's description matches the excavated remains, and it is
  civil infrastructure for auditing ships in and out, which is what Carthage's
  surface does with the sky.

ROME: the lituus, the augur's curved staff, with the shaft knop from Caesar's
denarii.
  Dies as: an open shepherd's crook, which reads ecclesiastical. The lituus is the
  probable ancestor of the bishop's crozier, so a loose rendering lands in a
  different religion.
  Defence:
    - A tight closed spiral at the head, wrapping past 360 degrees.
    - The shaft knop present on the shaft.
    - A long, thin, uniformly curved shaft.
    - Nothing else attached.
  Construction rules, absolute:
    - The spiral's outer diameter is at most 0.22 of the live area's height.
    - The mark carries exactly one terminal. No wings, no blade, no crossbar, no
      second hook, no fork, no tines, no ring below the knop.
    - No lettering, no script, no character forms anywhere in this mark.
  Reserved territory, binding: the lituus stays the only pure single-curve wand
  with a plain ball terminal anywhere in this product. A separate set of small
  deity glyphs defers to it, and every rod-shaped glyph in that set carries a
  second feature the lituus lacks. Keep the lituus plain. Adding a second feature
  to it breaks that separation from the other side.
  Why the subject: the instrument an augur held to mark the templum before
  declaring a day lawful. Rome's surface in this product is THE AUSPICES OF THE
  DAY.

NEUTRAL: the sixth icon, shown before a reader has chosen a culture.
  Dies as: a sixth culture. If it reads as another pantheon, the set stops meaning
  "before you have chosen" and starts meaning "there are six of them". It dies a
  second way as generic mysticism.
  Defence:
    - Derive it from the product itself: the instrument-in-the-temple idea, the
      incised rule, or the classical V of the wordmark ASTRA ANTIQVA.
    - Borrow no element, no stroke, and no silhouette from the five culture marks.
  Construction rules, absolute:
    - Ground #171310, accent #B59A55.
    - No zodiac wheel, no starfield, no orb, no crescent, no eye, no crystal ball,
      no nebula.
    - No lettering beyond a single letterform drawn as a construction, since
      running script belongs to Canaan alone.
  This is the only mark where I want options. Draw three, each on its own board,
  and name which one you would ship with your reason in a note beside it.

THE FOUR COLLISIONS, AS ABSOLUTE CONSTRUCTION RULES

The set was checked pairwise. Four pairs need active enforcement in the drawing.
Each rule below is written so you can verify it on a single board without holding
two marks up against each other, and each is checked again on a proof board later.

R1. THE PINWHEEL BAN, applies to every mark.
    No mark presents three or more elements radiating from a shared centre point
    at equal angular spacing. Greece's legs converge under a bowl and carry it.
    Carthage's ring encloses and breaks only at the channel mouth. Neither becomes
    a pinwheel, and neither does anything else on this canvas.

R2. TOP MASS, Egypt against Greece.
    Both marks are a vertical with weight at the top, which is acceptable and is
    held by width. Egypt's crossbar is at least 0.55 of the live area's width.
    Greece's bowl is at most 0.45 of the live area's width. Those two numbers do
    not meet, and neither may drift toward the other.

R3. CLOSED CURVES, Carthage against Rome.
    A spiral head and a ring are both closed curves, which is acceptable and is
    held by scale. Rome's spiral is at most 0.22 of the live area's height.
    Carthage's ring is at least 0.75 of the live area's width. A large lituus
    spiral or a small cothon breaks this and is a redraw.

R4. LETTERFORMS, Canaan against everything.
    Canaan is the only mark in the product carrying letterforms. Egypt, Greece,
    Carthage, Rome and Neutral carry no script, no characters, no glyph-like
    forms, in any variant, at any size.

Two more pairs were resolved before this commission, recorded so you do not undo
them. Roman Iustitia also carries a scale, and Rome taking a staff is what lets
Egypt keep the balance. Canaan and Carthage are the closest related cultures in
the set, and driven wedges against a harbour plan share no stroke primitive, so
the hardest pair became the most separable.

One further reservation, binding: the cothon is the product's only closed ring
form. A Carthaginian deity glyph elsewhere in the product is specified never to
close into a full ring so it does not rhyme with this icon. Keep the cothon
reading as a ring.

PLATFORM MECHANICS, EVERY NUMBER HERE SHIPS

Master, per culture. 512x512. Culture ground filling the board edge to edge. The
mark inside the live area. Square corners, since the platform mask rounds the icon
and you design for the mask.

iOS, per culture. 1024x1024. Opaque, no transparency anywhere in the layer, no
rounded corners baked into the artwork, no drop shadow.

Android adaptive, per culture, two boards:
  - Foreground: 108x108 units, TRANSPARENT background, the mark alone, all meaning
    inside the centred 72x72. Nothing that carries meaning touches the outer
    18-unit margin on any side, because the launcher masks it to circle, squircle,
    or rounded square and crops what it wants.
  - Background: 108x108 units, flat culture ground fill edge to edge, no mark, no
    texture, no vignette, no rule.
  These are two separate boards. Do not composite them on an asset board.

Ship size, per culture. 48x48. This is the size that ships on a home screen, and a
mark that stops being legible here has failed however it looks large. Draw the
version you would ship at this size, including the detail you dropped to get
there. Egypt's baboon and Carthage's ship-shed ticks are the two most likely
casualties. Show what they actually become rather than hiding the reduction.

Monochrome, per culture. 48x48. Bone #E6DECC on the neutral ground #171310, for
notification icons and favicons. Accent hue may never be the only thing separating
two marks, both for colourblind readers and because monochrome contexts exist. If
two cultures stop being distinguishable here, change the FORM on that culture's
own asset boards until they differ by form, and note what you changed.

THE AUDIT, ON PROOF BOARDS ONLY

Every board in this section is a proof. Write "NOT AN ASSET. DO NOT EXPORT." on
each one. This is the only place on the canvas where two marks appear together.

  proof-ship-48        The six 48x48 ship versions in one row, each on its own
                       ground. One line under each naming the detail you dropped.
  proof-mono-48        The six monochrome versions in one row. State on the board
                       whether any two collapse together, and what you changed on
                       the asset board to fix it.
  proof-mask-egypt     The Egypt foreground and background layers composited and
                       masked to a circle, a squircle, and a rounded square.
  proof-mask-carthage  The same three masks for Carthage, since a ring is the
                       shape most exposed to an aggressive mask.
  proof-r1-pinwheel    Greece and Carthage side by side at 48px. State whether
                       either reads as spokes from a centre.
  proof-r2-topmass     Egypt and Greece side by side at 48px, with the crossbar
                       width and the bowl width measured and written as fractions
                       of the live area.
  proof-r3-curves      Carthage and Rome side by side at 48px, with the ring
                       diameter and the spiral diameter measured and written the
                       same way.
  proof-r4-script      Canaan at 48px beside the other five, confirming in one
                       line that no letterform appears outside Canaan.

Where a proof fails, fix the mark on its own asset board, redraw the proof, and
write one line saying what moved and which rule forced it.

WHAT WAS REFUSED, SO IT DOES NOT COME BACK AS A FIX

If an audit fails, fix it inside the construction rules. None of these is
available as a substitute mark.

  - The sign of Tanit as Carthage's launcher icon. Its densest attestation is on
    the tophet stelae at the centre of the contested child-sacrifice question, it
    carries live modern reappropriation, and its triangle-bar-disc grammar is the
    hardest shape in the set to separate from Canaan. It serves as Carthage's
    in-app emblem, where a label disarms all three problems.
  - The massebah for Canaan. The object the Hebrew Bible commands torn down. It
    would read as taking a position in a live religious argument.
  - The crescent and disc, for anyone. At 48px it is indistinguishable from the
    star and crescent, which postdates it by over a millennium and has no
    connection to it.
  - The Antikythera mechanism. Conceptually apt for an app that computes an
    ephemeris, and the wrong register entirely, a scientific instrument in a
    surface built on shrine and petition. A gear reads as "settings" in any
    interface.
  - The fasces for Rome as a launcher icon. Mussolini took his movement's name
    from it and it sits on the ADL's hate symbol list, which keeps it out of the
    one place where nothing explains it.
  - The aquila and SPQR as launcher icons, refused on meaning. The aquila is a
    legionary standard and means military authority rather than reading the sky.
    SPQR is a political slogan. The aquila is Rome's in-app emblem, where it
    belongs.
  - The ordinary cliches: the ankh and the Eye of Horus as launcher icons,
    pyramids, columns, laurel, the Colosseum, the Capitoline Wolf, zodiac
    clip-art, glowing orbs, starfields, crystal balls, purple nebulae.

TWO RISKS CARRIED DELIBERATELY. DO NOT SOLVE THEM.

Cold recognisability across the set is uneven. Egypt's balance and Rome's lituus
read immediately. Canaan's wedges and Carthage's cothon need the product to have
taught "the docket" and "the harbour" first, which onboarding and the method page
do. The icons lean on that teaching. Adding explanatory detail to compensate
breaks the marks.

The set mixes categories: three instruments, one script, one architectural plan.
All five are what that culture used to read or record fate, so it holds.
Homogenising them into one visual category costs more than the mix does.

CONSTRAINTS
- No gradients, no drop shadows, no bevels, no glow, anywhere.
- Everything survives being flat. This identity has no depth to hide behind.
- Square corners in the artwork. The platform mask rounds the icon.
- Colour is never the only separator between two marks.

DELIVERABLE, BOARD BY BOARD

Asset boards, each holding exactly one mark, named exactly as written:

  icon-egypt-master-512          icon-egypt-ios-1024
  icon-egypt-adaptive-fg-108     icon-egypt-adaptive-bg-108
  icon-egypt-ship-48             icon-egypt-mono-48

  icon-greece-master-512         icon-greece-ios-1024
  icon-greece-adaptive-fg-108    icon-greece-adaptive-bg-108
  icon-greece-ship-48            icon-greece-mono-48

  icon-canaan-master-512         icon-canaan-ios-1024
  icon-canaan-adaptive-fg-108    icon-canaan-adaptive-bg-108
  icon-canaan-ship-48            icon-canaan-mono-48

  icon-carthage-master-512       icon-carthage-ios-1024
  icon-carthage-adaptive-fg-108  icon-carthage-adaptive-bg-108
  icon-carthage-ship-48          icon-carthage-mono-48

  icon-rome-master-512           icon-rome-ios-1024
  icon-rome-adaptive-fg-108      icon-rome-adaptive-bg-108
  icon-rome-ship-48              icon-rome-mono-48

Neutral, three options first, each on its own board:

  icon-neutral-option-a-master-512   icon-neutral-option-a-ship-48
  icon-neutral-option-b-master-512   icon-neutral-option-b-ship-48
  icon-neutral-option-c-master-512   icon-neutral-option-c-ship-48

Then the full asset set for the option you would ship, drawn from that option and
named without the option letter:

  icon-neutral-master-512        icon-neutral-ios-1024
  icon-neutral-adaptive-fg-108   icon-neutral-adaptive-bg-108
  icon-neutral-ship-48           icon-neutral-mono-48

Keep the two options you did not pick on the canvas. Say which one ships and why
in a note beside it.

Proof boards, each marked NOT AN ASSET:

  proof-ship-48        proof-mono-48
  proof-mask-egypt     proof-mask-carthage
  proof-r1-pinwheel    proof-r2-topmass
  proof-r3-curves      proof-r4-script

Beside each culture's master board, write one line naming the failure mode you
defended against and the thing in your construction that defends against it.
Where a construction rule forced a drawing decision you would otherwise have made
differently, say so in the note and draw to the rule anyway.
```
