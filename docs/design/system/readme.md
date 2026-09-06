# Astra Antiqua, the design system

Ancient-astrology product. One sky is computed from a real ephemeris; five ancient cultures
read that same sky through their own theology. Egypt in the Hall of Ma'at, Greece at the
day's oracle, Canaan in the council of El, Carthage in the decree of the Tophet, Rome by the
auspices. The product's claim is honesty rather than mysticism: positions are computed,
nothing is invented, and it says so on a method page.

The interface is called **The Instrument in the Temple**. It should read like a well-set
almanac or a museum wall label.

This project is the design system. The working identity canvas, where the marks were drawn
and argued over, is the separate project "Canvas 1a design system"
(`42219d9c-93ce-4102-b92f-34c06c74f3f8`). The repository at `docs/design/` holds the
research behind every decision here.

## Index

- `styles.css`, the entry point. Consumers link this one file.
- `tokens/fonts.css`, the three product faces, the small-caps prototype face, four
  epigraphic faces.
- `tokens/colors.css`, grounds, accents, inks, signals, light ground, `[data-culture]`
  scopes.
- `tokens/typography.css`, display, prose, data and glyph scales with tracking.
- `tokens/rules.css`, rule weights, spacing, tile sizes, square corners.
- `guidelines/`, the cards. Colors, Type, Brand, Marks, Glyphs.
- `assets/marks/`, the twelve drawn brand marks, 512 grid, `currentColor`.
- `assets/wordmark/`, the horizontal lockup, the monogram, and the eight letterforms.
- `assets/traced/`, the seven PNG alpha masks traced from source photographs.
- `assets/glyphs/<culture>/<body>.svg`, the fifty deity glyphs, 24 grid, `currentColor`.
- `components/specs/`, one prompt-sized spec per component role.
- `components/previews/`, the web components as they render, one card each.

## Visual foundations

**Grounds.** Every surface is a flat culture-tinted near-black, warm on the Egypt, Canaan
and Rome side and cool for Greece. No gradients anywhere, ever. The ground carries the mood;
nothing else is asked to.

**Accents.** One muted accent per culture, all at comparable lightness and chroma so no
culture shouts. The accent has exactly three jobs: it marks the **active culture**, the
**votive instruction** (the one line asking something of the reader), and a **received
body** (Uranus, Neptune, Pluto, admitted under declared native names). It is never a
background, never a border for its own sake, never applied twice on one screen. A screen
with no active culture, no instruction and no reception has no accent.

**Colour is never load-bearing alone.** The five cultures stay distinguishable to a
colourblind reader: marks differ by form first, and hue only confirms.

**Type.** Cinzel for display, caps at 0.16em tracking, never lowercase and never running
text. Spectral for all prose at 1.65 leading. IBM Plex Mono for every number, label and
method note, data at 0.04em, microcopy at 0.18em. Four epigraphic faces exist solely to set
attested signs (hieroglyphs, Ugaritic cuneiform, Greek inscriptional caps, the ankh) and
must never be used for copy.

**The small-caps prototype.** A Roman inscriptional cap sets the titles for four cultures
that are not Roman. The web build carries a prototype that drops display on Egypt, Greece,
Canaan and Carthage to Spectral SC, true small capitals, tracked at 0.06em, with Cinzel kept
for Rome and the app shell. It is a prototype to be looked at, not yet the rule.

**Corners, depth, motion.** Square corners everywhere. The app icon is the single exemption,
because the platform masks it. No shadows, bevels, glow or glass; `--shadow: none` is a
real token. Everything must survive being flat. Transitions default to none; where motion is
unavoidable it is a plain opacity fade, never a bounce.

**Ornament.** One incised 1px rule, in three inks: `--rule-incised` structural, faint for
data interiors, accent for the active culture only. There is no other ornament. No
flourishes, no borders for decoration, no zodiac wheels, orbs, starfields or nebulae.

**Cards and layout.** A card is `--surface-card` with a 1px incised border and generous
padding, no radius, no shadow. Boards are wide and rule-delimited; content sits in grids with
real gaps rather than inline flow. Imagery is monochrome and desaturated onto its culture
ground.

**Hover and press.** Ink steps up one level (dim to prose to bone) or the accent rule
appears. Never a colour shift into a new hue, never a scale transform.

**Light ground.** For print and share cards, `--light-ground` bone with `--light-ink`;
the accent darkens to `--light-accent` (#8A6E2E) so the mark still holds 4.5:1. No other
change is permitted between grounds.

## Content fundamentals

Plain, declarative, and specific. The product states what it computed and refuses to
embellish: "Mars stands in the tenth, and the censor's list is read aloud: the day is lawful
for public business, and nothing here is invented." Method notes are in mono caps:
COMPUTED FROM EPHEMERIS · SEE METHOD.

- Display and label copy is caps; prose is sentence case.
- Second person for instruction, never "we".
- Each culture speaks in its own institutions: the scale and the feather, the tripod and the
  petition, the vow and the docket, the ledger and the harbour, the censor's list.
- No exclamation, no hype, no mystic register, no promises about the future.
- No emoji, ever.

## Iconography

Marks are instruments and procedures, never deity portraits. That is what keeps them legible
at icon size and keeps the product out of rendering gods.

Where a sign exists as an **encoded character**, palaeographers have already drawn it from
the material record and it is set as type, not redrawn: the ankh (U+2625), the wedjat
(U+13080), the seated king (U+1303B), the balance (U+1335D), Ugaritic ʾi + l (U+1039B
U+1038D), omega (U+03A9).

Where the subject only ever existed as an **object**, it is drawn flat from a cited source
(the lituus off Caesar's denarius RRC 443/1, the tripod after the Delphic stater, the owl
after the tetradrachm) or traced from a source photograph and stored as a PNG alpha mask,
so one file takes any culture accent or bone ink via `mask-image`:

- `assets/traced/icon-shewolf.png`, Capitoline bronze
- `assets/traced/icon-augustus.png`, Augustus of Prima Porta
- `assets/traced/icon-baal-stele.png`, Baal stele, Louvre AO 15775

Nothing figurative is drawn from memory. Carthage carries the sign of Tanit at tier 1 by
decision, with its costs recorded; the cothon remains the better answer if a Salammbo
harbour survey can be got.

Refused deliberately, do not reintroduce: fasces, aquila at launcher size, SPQR, the massebah,
crescent-and-disc alone, the Antikythera mechanism, pyramids, columns, laurel, the Colosseum,
zodiac clip-art, glowing orbs, starfields, crystal balls, purple nebulae.

## The deity glyphs

Fifty marks, one per body per culture, drawn from stroke-level research. They sit beside a
body's name in the chart wheel, the placements table and running prose at 16 to 24 px. Each
carries an honesty status in its `<title>`: 28 attested, 21 composed, 1 invented. A composed
mark is never drawn to look more ancient than an attested one; no glyph gets period texture
or antiquing.

The set separates by drawing hand rather than by subject. Greece and Rome share five
subjects out of ten because Rome took those gods wholesale, so Greece is drawn as vase-
painting brush line and Rome as struck coin relief. The Glyphs cards carry the sorting test.

## Caveats

- Fonts are pulled from Google Fonts by URL here. The web build vendors the same families
  as woff2 through `web/scripts/fetch-fonts.mjs`; Android as TTF from the same script.
- `uploads/rqgvol5zn55g1.jpeg` in the canvas project (584 KB) exceeds the sync size cap and
  is not mirrored here.
