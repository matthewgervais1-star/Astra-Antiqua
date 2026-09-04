# Prompt: brand, logotype, and the five culture icons

Paste into Claude Design. It produces a canvas of artboards, not code.

## Before you paste: four decisions this brief encodes

1. **The icon exploration is closed.** An earlier version of this brief asked the
   designer to try several directions for the icon family. `docs/design/culture-marks.md`
   settled it: five parallel research briefs, one per culture, each required to
   find a mark attested in the material record that also matches what that
   culture's surface in this app does. The five marks are named below and are
   not up for redesign. The brief now spends its words on how to draw them,
   because every one of them has a specific way it dies at 48px, and those
   failure modes are the commission.
2. **Six icons, not a generative system.** Neither platform draws a launcher
   icon at runtime. Android switches between `<activity-alias>` entries and iOS
   calls `setAlternateIconName`; both require every variant compiled into the
   bundle. The deliverable is a fixed set the build ships, and the icon changes
   when the reader picks a culture.
3. **Three tiers, and the launcher is the strictest.** A mark's meaning is fixed
   by where it sits. A launcher icon stands alone on a home screen with nothing
   to explain it, so it gets read at its most loaded. The same mark beside a
   caption is accurate. That split is why the sign of Tanit and the aquila are
   wrong for tier 1 and right for tier 2, and why section C exists at all. The
   old brief never mentioned tier 2, and the in-app emblems were going unbriefed.
4. **The logotype and the typeface are separate commissions.** The app already
   ships Cinzel, Spectral and IBM Plex Mono on both surfaces from one font
   pipeline. Section D asks for a drawn wordmark that sits *with* those fonts,
   which is cheap and high-leverage. Section E asks the harder question, whether
   Cinzel should be replaced at all, and is optional. Do not silently retypeset
   the product inside section D.

---

```text
You are designing the brand identity for Astra Antiqua, an ancient-astrology
product. I want a canvas of artboards covering the app icon set, a second tier
of in-app emblems, a logotype, and the brand system that holds them together.

The five launcher marks are already decided by research. Your job is to draw
them so they survive. Each one has a documented way it fails, and those failures
are the centre of this brief.

THE PRODUCT, IN ONE PARAGRAPH
One sky is computed from a real ephemeris, and five ancient cultures read that
same sky through their own theology. Egypt weighs it in the Hall of Ma'at.
Greece questions it at the day's oracle. Canaan convenes the council of El.
Carthage audits it in the decree of the Tophet. Rome takes the auspices. The
same planetary placement keeps the same core meaning in every voice, and each
culture's reading is native to its institutions: the scale and the feather, the
tripod and the petition, the vow and the docket, the ledger and the harbour, the
censor's list. The product's claim is honesty rather than mysticism: it states
plainly that positions are computed and nothing is invented, and it says so on a
method page. Three modern bodies (Uranus, Neptune, Pluto) are carried as
declared receptions, admitted under native names because no ancient culture
knew them.

THE IDENTITY IT ALREADY HAS
The interface is called "The Instrument in the Temple". It is deliberately
austere: flat culture-tinted grounds, one muted accent per culture, square
corners everywhere, no gradients, no shadows, no glass, no glow. The only
ornament is an incised 1px rule. Type is Cinzel for display in caps with wide
tracking, Spectral for prose, IBM Plex Mono for data and microcopy. It should
read like a well-set almanac or a museum wall label.

Grounds and accents, exact:
  Egypt     ground #1A1712   accent #B59A55  (gold)
  Greece    ground #171A1C   accent #7C93A6  (aegean)
  Canaan    ground #1A1813   accent #8A9268  (cedar)
  Carthage  ground #191218   accent #94648C  (tyrian)
  Rome      ground #1B1410   accent #A5544A  (pompeian red)
  Neutral   ground #171310   accent #B59A55
Inks: bone #E6DECC, prose #D9D1BF, dim #9A917D, faint #6F6B60.
Signals: harmony #B59A55, conflict #B56B71.

A. THE FIVE LAUNCHER MARKS, AND HOW EACH ONE DIES

Every mark below is an instrument or a procedure rather than a deity portrait.
That is what keeps the set legible at icon size and keeps the app out of
rendering gods. Read each entry's failure first. The positive spec exists to
prevent that specific failure, not as decoration.

EGYPT: the balance of the weighing, in its Papyrus of Ani form.
  Fails as: a bare symmetric beam, which collapses into the generic
  scales-of-justice glyph. At that point Egypt is a courthouse and the Hall of
  Ma'at is gone.
  Draw: feather finial, crossbar with two hanging pans, the baboon of Thoth, and
  a plumb bob steadied at the base. The feather, the baboon and a visibly
  off-axis plumb bob are the three things that keep it Egyptian. None of them is
  optional at 48px.
  Why this mark: the device that does the weighing, not a metaphor for it, and
  the most repeated judgment image in the Egyptian corpus across roughly 1500
  years.

GREECE: the Delphic tripod.
  Fails as: a solid triangular mass under a disc, which is the sign of Tanit's
  grammar and hands Carthage's tier 2 emblem to Greece. It fails a second way as
  a triskelion, when the legs radiate from a hub instead of carrying a load.
  Draw: three distinct converging legs, visible as three separate strokes, never
  filled into a triangle. A shallow off-axis bowl sitting on them as load-bearing
  furniture. Drop the ring handles.
  Why this mark: the recurring image on Delphic coinage for centuries, and the
  furniture where a petitioner's question met the god's answer.

CANAAN: Ugaritic alphabetic cuneiform, a cluster of driven wedge signs.
  Fails as: tally marks. A row of even strokes is counting, not writing.
  Draw: wedges that read as driven strokes, with both corner and linear forms
  present in the cluster, in the proportions real cuneiform uses. A cold viewer
  will read "Mesopotamia" before "Ugarit"; the set's context carries that and a
  label closes the gap, so do not compensate by inventing an ornament.
  Why this mark: the world's earliest alphabet, Ugarit's own invention, and the
  medium the vow and the docket were written in.

CARTHAGE: the cothon, the circular naval harbour at Salammbo, in plan.
  Fails as: a gear, a sun, or a wheel. A gear in particular reads as "settings"
  in any interface, which is the worst available outcome for a launcher icon.
  Draw: a broken ring of ship sheds around an offset island. The channel break
  is asymmetric. The island is off centre. The ship sheds are short ticks
  standing inside the ring, never spokes crossing to the middle. Symmetry is the
  enemy here; every regularity you add moves it toward machinery.
  Why this mark: Appian's description matches the excavated remains, and it is
  civil infrastructure for auditing ships in and out, which is what Carthage's
  surface does with the sky.

ROME: the lituus, the augur's curved staff, with the shaft knop from Caesar's
denarii.
  Fails as: an open shepherd's crook, which reads ecclesiastical. The lituus is
  the probable ancestor of the bishop's crozier, so a loose rendering does not
  land in neutral territory, it lands in a different religion.
  Draw: a tight closed spiral at the head, the shaft knop present, a long thin
  uniformly curved shaft, and nothing else attached.
  Why this mark: the instrument an augur held to mark the templum before
  declaring a day lawful. Rome's surface in this app is THE AUSPICES OF THE DAY.

NEUTRAL: the sixth icon, and the one open question in this section.
  Fails as: a sixth culture. If it reads as another pantheon the set stops
  meaning "before you have chosen" and starts meaning "there are six of them".
  It also fails as generic mysticism: no zodiac wheel, no starfield, no orb.
  Draw: on ground #171310 with accent #B59A55, a mark derived from the product
  itself rather than from any culture's repertoire. The instrument-in-the-temple
  idea, the incised rule, or the wordmark's classical V are all legitimate
  starting points. Show two or three options for this one icon and say which you
  would ship. This is the only place in section A where I want exploration.

A2. THE COLLISIONS YOU MUST ENFORCE IN THE DRAWING

Ten pairs were checked. Six are clean or already resolved by which mark each
culture takes. Four make demands on your pencil.

1. Greece against Carthage, second order. A tripod with radiating legs reads as
   a triskelion, and the cothon is radial ticks around a hub. Both slide toward
   "spokes from a centre" and meet in the middle. Enforce the difference in
   construction: the tripod's legs converge under a bowl and carry weight; the
   cothon's ring encloses and breaks only at the channel mouth. Neither may
   become a pinwheel.
2. Egypt against Greece, vertical mass. Both are a vertical with mass at the
   top. This is acceptable and does not need a redesign, on one condition:
   Egypt's mass stays a wide horizontal beam with pans hanging from it, and
   Greece's stays a compact bowl. If the beam narrows or the bowl widens, the
   pair closes.
3. Carthage against Rome, closed curves. A spiral head and a ring are both
   closed curves. Acceptable as drawn: the lituus is a staff carrying a small
   terminal spiral, the cothon is a ring that fills its field. Keep that scale
   relationship. A large lituus spiral or a small cothon breaks it.
4. Canaan against Carthage, script. Punic script IS Phoenician script at a
   later stage and the two are invisibly different at 48px. Carthage's script
   candidate was ruled out for that reason. Only Canaan uses letterforms
   anywhere in this set. Do not reintroduce Punic lettering into the Carthage
   icon in any form.

Two more resolved before they reached you, recorded so you do not undo them:
Roman Iustitia also carries a scale, and Rome taking a staff is what lets Egypt
keep the balance. Canaan and Carthage are the closest related cultures in the
set, a Phoenician colony sharing Baal and Astarte with its metropolis, and wedge
cuneiform against a harbour plan share no stroke primitive at all. The hardest
pair became the most separable.

Cross-tier reservation: the app also carries fifty small deity glyphs, and that
set is written to defer to these icons. The lituus is reserved as the only pure
single-curve wand with a plain ball terminal anywhere in the product, and
Carthage's Yam glyph is specified never to close into a full ring so it does not
rhyme with the cothon. Draw both launcher marks to claim that territory clearly.

B. PLATFORM MECHANICS

Draw each icon at 512x512 on its culture's ground.

Then place the SAME mark on the Android adaptive-icon canvas: 108x108 units with
all meaning inside the middle 72. The outer ring is masked to circle, squircle or
rounded square depending on the launcher, so nothing that carries meaning may sit
outside the safe zone. Show at least one icon masked to a circle and to a
squircle so I can see it survive both.

Show the whole set at 48x48. That is the size that ships, and a mark that stops
being legible there has failed regardless of how it looks large. Egypt's baboon
and Carthage's ship-shed ticks are the two most likely casualties; show me what
they do at that size rather than hiding it.

Show the family reduced to a single bone ink on the neutral ground, for
notification icons and favicons. If two cultures become indistinguishable
without their accent, say so on the canvas and adjust the marks until they
differ by form. Accent hue may never be the only thing separating two icons,
both for colourblind readers and because monochrome contexts exist.

C. TIER 2, THE IN-APP EMBLEMS

These are the marks each culture is actually known by. They belong where a label
stands beside them: culture doorways, section heads, share cards, chapter marks.
The label is what makes a famous mark safe here, and it is the whole reason
these are not the launcher icons.

  Egypt     the wedjat, or the ankh where the context is life rather than
            judgment
  Greece    Athena's owl, from the Athenian tetradrachm
  Canaan    no popular emblem exists; cuneiform carries both tiers
  Carthage  the sign of Tanit
  Rome      the aquila

Canaan's gap is stated rather than papered over. It has no mark a general
audience recognises, which is exactly why an emblem-first icon set would have
broken. Beside the word "Canaan" and the council passage, cuneiform reads fine.
Draw Canaan's tier 2 as a different treatment of the wedges rather than a new
subject: a larger, more deliberate arrangement that can carry a header, not a
scaled-up launcher icon.

Deliver these as one artboard showing all five emblems at header scale beside
their labels, plus one showing them at share-card scale. They may be more
detailed than the launcher marks, because they never have to work alone.

D. THE BRAND SYSTEM SHEET AND THE LOGOTYPE

One artboard holding the system: the palette above with its role names, the type
scale, the rule weights, and what the accent is allowed to do. The accent marks
the active culture, the votive instruction, and the received bodies. It is never
decorative. Include a short do-and-do-not strip, since the temptation with an
ancient theme is always to add ornament.

The logotype: the product is written ASTRA ANTIQVA, with the classical V, and
that stays. Draw it as a wordmark rather than setting it in Cinzel. The current
wordmark is Cinzel with wide tracking, which is why it looks competent and
anonymous. I want letterforms that are ours, sitting comfortably beside Cinzel
where the two meet. Three lockups: horizontal, stacked, and a compact monogram
for tight spaces. Show it on a dark ground and on a light one.

E. THE TYPE QUESTION (optional, answer honestly)

Cinzel is the default choice for anything Roman, which makes it both apt and
generic. Tell me whether you would keep it, and if not, propose one alternative
display face with a reason grounded in this product rather than in taste.
Changing it means refetching fonts for two platforms, so argue for it only if
the gain is real. Spectral and IBM Plex Mono are working and are not in question.

WHAT THE RESEARCH REFUSED, SO YOU DO NOT RE-PROPOSE IT

  The sign of Tanit as Carthage's launcher icon. Its densest attestation is on
  the tophet stelae at the centre of the contested child-sacrifice question, it
  carries live modern reappropriation, and its triangle-bar-disc grammar is the
  hardest shape in the set to separate from Greece's tripod. It moves to tier 2,
  where a label disarms all three problems.

  The massebah for Canaan. The object the Hebrew Bible commands torn down. It
  would read as taking a position in a live religious argument.

  The crescent and disc. At 48px it is indistinguishable from the star and
  crescent, which postdates it by over a millennium and has no connection to it.

  The Antikythera mechanism. The tempting wrong answer: conceptually perfect for
  an app that computes an ephemeris, and the wrong register entirely, a
  scientific instrument in a surface built on shrine and petition. A gear reads
  as "settings" in any interface.

  The fasces for Rome. Mussolini took his movement's name from it and it sits on
  the ADL's hate symbol list, which keeps it out of tier 1 where nothing explains
  it. It stays available in editorial illustration, captioned, on a page about
  magistrates and imperium.

  The aquila and SPQR for Rome, refused on meaning rather than contamination.
  The aquila is a legionary standard and means military authority, not reading
  the sky. SPQR is a political slogan. Neither describes what Rome's surface does.

  The ordinary cliches: the ankh and the Eye of Horus as launcher icons,
  pyramids, columns, laurel, the Colosseum, the Capitoline Wolf, zodiac
  clip-art, glowing orbs, starfields, crystal balls, purple nebulae. This
  product's whole differentiator is that it is not that.

TWO KNOWN RISKS, CARRIED DELIBERATELY

Cold recognisability is uneven. Egypt's balance and Rome's lituus read
immediately. Canaan's wedges and Carthage's cothon need the product to have
taught "the docket" and "the harbour" first, which onboarding and the method
page do. The icons lean on that teaching and should not be redesigned to avoid
leaning on it.

The set mixes categories: three instruments, one script, one architectural plan.
All five are what that culture used to read or record fate, so it holds, but do
not try to harmonise them into one visual category. That flattening would cost
more than the inconsistency does.

CONSTRAINTS
- Square corners in the interface, and the ICON is exempt: platform masks round
  it anyway, so design for the mask rather than fighting it.
- No gradients, no drop shadows, no bevels, no glow, anywhere.
- Everything must survive being flat. This identity has no depth to hide behind.
- The five cultures must stay distinguishable to a colourblind reader, so accent
  hue is never the only difference between two marks.

DELIVERABLE
A canvas of labelled artboards covering A through E. For each of the five
launcher marks, show the drawing next to a short note naming the failure mode
you were defending against and what in your construction defends against it.
Keep the neutral icon's alternatives on the canvas rather than deleting them,
with a note on which you would ship and why. Where you believe a research
decision is wrong, say so in a note rather than quietly drawing something else.
```
