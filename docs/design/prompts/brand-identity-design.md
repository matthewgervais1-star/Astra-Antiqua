# Prompt: brand, logotype, and the five culture icons

Paste into Claude Design. It produces a canvas of artboards, not code.

## Before you paste: two decisions this brief encodes

1. **Six icons, not a generative system.** Neither platform draws a launcher
   icon at runtime. Android switches between `<activity-alias>` entries and iOS
   calls `setAlternateIconName`; both require every variant compiled into the
   bundle. So the deliverable is a fixed set the build ships, and the icon
   changes when the reader picks a culture.
2. **The logotype and the typeface are separate commissions.** The app already
   ships Cinzel, Spectral and IBM Plex Mono on both surfaces from one font
   pipeline. Section D asks for a drawn wordmark that sits *with* those fonts,
   which is cheap and high-leverage. Section E asks the harder question, whether
   Cinzel should be replaced at all, and is optional. Do not silently retypeset
   the product inside section D.

---

```text
You are designing the brand identity for Astra Antiqua, an ancient-astrology
product. I want a canvas of artboards covering an app icon set, a logotype, and
the brand system that holds them together.

THE PRODUCT, IN ONE PARAGRAPH
One sky is computed from a real ephemeris, and five ancient cultures read that
same sky through their own theology. Egypt weighs it in the Hall of Ma'at.
Greece questions it at the day's oracle. Canaan convenes the council of El.
Carthage audits it in the decree of the Tophet. Rome takes the auspices. The
same planetary placement keeps the same core meaning in every voice, but each
culture's reading is native to its institutions: the scale and the feather, the
tripod and the petition, the vow and the docket, the ledger and the harbor, the
censor's list. The product's claim is honesty, not mysticism: it states plainly
that positions are computed and nothing is invented, and it says so on a method
page. Three modern bodies (Uranus, Neptune, Pluto) are carried as declared
receptions, admitted under native names because no ancient culture knew them.

THE IDENTITY IT ALREADY HAS
The interface is called "The Instrument in the Temple". It is deliberately
austere: flat culture-tinted grounds, one muted accent per culture, square
corners everywhere, no gradients, no shadows, no glass, no glow. The only
ornament is an incised 1px rule. Type is Cinzel for display in caps with wide
tracking, Spectral for prose, IBM Plex Mono for data and microcopy. It should
read like a well-set almanac or a museum wall label, not like a mystical app.

Grounds and accents, exact:
  Egypt     ground #1A1712   accent #B59A55  (gold)
  Greece    ground #171A1C   accent #7C93A6  (aegean)
  Canaan    ground #1A1813   accent #8A9268  (cedar)
  Carthage  ground #191218   accent #94648C  (tyrian)
  Rome      ground #1B1410   accent #A5544A  (pompeian red)
  Neutral   ground #171310   accent #B59A55
Inks: bone #E6DECC, prose #D9D1BF, dim #9A917D, faint #6F6B60.
Signals: harmony #B59A55, conflict #B56B71.

WHAT I WANT, AS ARTBOARDS

A. THE ICON SET (the heart of this brief)
Six app icons: one neutral, and one per culture. They must read as one family
at a glance and as five distinct marks on close look, because a reader who has
chosen Carthage should recognise their own icon on the home screen.

Design the family around a single structural idea rather than five unrelated
pictures. Some directions worth exploring, and I want you to try more than one:
  - one instrument per culture (scale, tripod, tablet, ledger-and-scale, lituus)
  - one shared armature (a ring, a horizon line, a gnomon) that each culture
    inflects
  - a letterform mark that takes the culture's accent and one native detail
Avoid the obvious zodiac clip-art, and avoid anything that reads as generic
"mystical app": no glowing orbs, no starfields, no crystal balls, no purple
nebulae. This product's whole differentiator is that it is not that.

Draw each icon at 512x512 on its culture's ground. Then show the SAME mark
placed on the Android adaptive-icon canvas: 108x108 units with all meaning
inside the middle 72 (the outer ring gets masked to circle, squircle or rounded
square depending on launcher, so nothing important may sit outside it). Show one
icon masked to a circle and to a squircle so I can see it survive both.

Also show the set at 48x48. If a mark stops being legible small, it fails: that
is the size that actually ships.

B. THE MONOCHROME REDUCTION
Show the icon family reduced to a single bone ink on the neutral ground, for
notification icons, favicons and anywhere colour is unavailable. If the five
cultures become indistinguishable without their accent, say so and adjust the
marks until they differ by form as well as colour.

C. THE BRAND SYSTEM SHEET
One artboard holding the system: the palette above with its role names, the type
scale, the rule weights, and what the accent is allowed to do (it marks the
active culture, the votive instruction, and the received bodies; it is never
decorative). Include a short do-and-do-not strip, since the temptation with an
ancient theme is always to add ornament.

D. THE LOGOTYPE
The product is written ASTRA ANTIQVA, with the classical V, and that stays. Draw
it as a wordmark rather than setting it in Cinzel: the current wordmark is just
Cinzel with wide tracking, which is why it looks competent and anonymous. I want
letterforms that are ours, sitting comfortably beside Cinzel where the two meet.
Show it in three lockups: horizontal, stacked, and a compact monogram for tight
spaces. Show it on a dark ground and on a light one.

E. THE TYPE QUESTION (optional, answer honestly)
Cinzel is the default choice for anything Roman, which makes it both apt and
generic. Tell me whether you would keep it, and if not, propose one alternative
display face with a reason grounded in this product rather than in taste. Note
that changing it means refetching fonts for two platforms, so only argue for it
if the gain is real. Spectral and IBM Plex Mono are working and are not in
question.

CONSTRAINTS
- Square corners in the interface, but the ICON is exempt: platform masks round
  it anyway, so design for the mask rather than fighting it.
- No gradients, no drop shadows, no bevels, no glow, anywhere.
- Everything must survive being flat: this identity has no depth to hide behind.
- The five cultures must stay distinguishable to someone who is colourblind, so
  do not let accent hue be the only thing separating two marks.

DELIVERABLE
A canvas of artboards covering A through E, each labelled. Where you explore
more than one direction for the icon family, keep the alternatives on the canvas
rather than deleting them, and add a short note on which you would ship and why.
```
