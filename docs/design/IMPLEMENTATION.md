# The design system, as wired in

What `docs/design/prompts/implement-design-system.md` asked for, landed on both
surfaces, with the commit that carries each piece and the screenshot that
proves it. Every mark and glyph is the design system's file, used as it was
drawn: nothing here was redrawn, restyled or replaced.

## Web

| Commit | What landed |
|---|---|
| `9759fb6` | The deity glyphs replace the Unicode planet signs |
| `e6bfd05` | Text colour utilities apply to links |
| `d1d6dd9` | Wordmark, monogram, launcher icons and the epigraphic faces |
| `4d77131` | The three typeset launcher marks, outlined |

**The glyphs.** `web/scripts/export-glyphs.mjs` copies the fifty SVGs into
`web/src/glyphs` and generates the typed module the app reads, asserting the 24
grid, the eight element types, the absence of any literal colour and the 28 / 21
/ 1 honesty tally before it writes. `DeityGlyph` paints the inner markup with
`currentColor` and carries the deity name and status. Every consumer of
`PLANET_SYMBOLS` now renders the active culture's glyph: the wheel, the
placements table, the reading, the voices page, the matrix, the home rails, the
week column and the long-transit line. The classical sign survives in the two
places no culture is chosen, the learn page's sample wheel and the matrix's body
column, which is the one context where that notation is the right voice.

**Brand.** `Wordmark.tsx` renders the twelve drawn caps in place of the typed
name at four sites, sized so the caps stand at the cap height of the type they
replaced. `scripts/generate-icons.mjs` emits the monogram as the favicon, the
SVG icon and the apple-touch icon, and the launcher set from the marks.

**Fonts and tokens.** The four epigraphic faces are vendored for the web only
and bound as `--font-hieroglyph`, `--font-ugaritic`, `--font-symbols` and
`--font-greek-display`, for attested signs only. The `@theme` grounds, accents,
inks and signals match `tokens/colors.css` exactly.

**The outlines.** `web/scripts/outline-signs.mjs` cuts the ankh, omega and the
Ugaritic pair from their fonts to paths on the 512 grid, so neither platform
depends on a font at runtime for an icon. Each was checked against its own face
rendered as live text: the silhouettes agree to 98.6, 98.9 and 97.9 percent of
their union, and the aspect ratios to four decimals.

Screenshots: `docs/design/screenshots/phase1`, `phase2`, `phase3`.

## Android

| Commit | What landed |
|---|---|
| `89a8c7a` | Launcher icons that follow the chosen culture |
| `bb3d43c` | The deity glyphs beside every body |
| `60d9120` | Wordmark and monogram |

**Launcher icons.** Six adaptive icons generated from the design-system marks by
`web/scripts/gen-android-launchers.mjs`, each mark rasterised and measured
against the circle a launcher mask leaves visible, and scaled until it clears.
`MainActivity` gives up its launcher filter to six activity-aliases, and
`ui/LauncherIcon.kt` is the single place that switches them.

**The glyphs.** `web/scripts/gen-android-glyphs.mjs` writes the fifty as
ImageVectors on their own 24 grid, checking the same invariants and the same
tally. They paint black and take their colour from the tint, so a received body
carries the culture accent and the rest the bone ink from one set. The decree
cards show the culture's own mark beside the name it gives the body.

**Brand.** The lockup and the monogram become ImageVectors with colour as a
parameter, because the monogram is two inks and a tint would flatten them.

Screenshots: `docs/design/screenshots/phase4`, `phase5`, `phase6`.

## Verified

Web: `npm run typecheck`, `npm run lint`, `npm run gates` and `npm run build`
pass. Android: `./gradlew compileDebugSources` and `./gradlew testDebugUnitTest`
pass. `node scripts/check-svgs.mjs docs/design/system` passes on all 75 files.
The launcher icons and the glyphs were checked on a Pixel emulator, not inferred
from a green build.

## What was decided along the way

**The lockup and the monogram went where the app speaks as itself.** The prompt
places the Android wordmark in the top bar where the app name is typed in
Cinzel, and the monogram where a generic placeholder mark stands. The app has
neither: nothing prints its name, there is no placeholder mark, and the shell
has no bar. So the monogram sits on the splash and the lockup on the
culture-selection screen, the two screens shown before a culture is chosen.

**The ankh came from a different family.** `tokens/fonts.css` names Noto Sans
Symbols 2 for U+2625. That family has no such glyph on Google Fonts; Noto Sans
Symbols does, verified in the vendored file's own cmap rather than trusted from
the API's declared range. The token name is unchanged.

**The 0.66 fit is a square, and a launcher mask is a circle.** A mark filling
the corners of that square reaches past the circle: the neutral A's stylobate
stood at 203 px against a 170 px radius. Both icon generators now measure each
mark's ink and shrink until it clears, so the number that ships is the measured
one.

**The launcher swap waits for the app to stop.** Disabling the alias that
started the running task makes the system drop that task, so a reader who chose
a culture watched the app close. The choice is recorded when it is made and
applied from `onStop`.

**Neither generator took a font or SVG library.** This repository's
`node_modules` is a pnpm tree that npm's resolver will not add to, so the
TrueType outline reader and the SVG shape converter are written out. That is why
`outline-signs.mjs` parses `glyf` itself rather than calling opentype.js.

## Left for people, not code

**The weighted cut for the three typeset signs.** The design notes record that
the hieroglyph-class signs go thin at 48px and want a heavier cut of the same
outline: same shape, more weight. That is type work rather than illustration, so
`outline-signs.mjs` names it as a TODO and ships the plain outline. The Ugaritic
pair is where it shows, since two letters on one line make each stroke half the
width the single signs get.

**The cothon for Carthage.** The research holds that the harbour plan is the
better mark and that Tanit carries a cost a launcher icon cannot disarm, having
no label. Tracing it needs a Salammbo harbour survey, which is a document to be
got rather than a thing to be drawn. Tanit ships meanwhile, in her outline cut.

**The Spectral SC display decision.** The small-caps treatment on the four
non-Roman surfaces is still a prototype in `globals.css` and was not promoted
into the tokens or carried to Android. Its open question is Cinzel's tracking,
set per component and loose on small caps, which wants looking at before it is
tuned.

**Two rule colours drift.** The web rules are bone with alpha (0.16 and 0.11)
where the design system has opaque hex (`--rule-hairline` `#4A3E28`,
`--rule-incised` `#2A241C`). Composited on the neutral ground they land at
`#38332E` and `#2E2925`, so the web pair is darker and ordered the other way
round. Alpha rules shift with the culture ground, which may be the better
behaviour; the design system is canonical, so this is a decision rather than a
bug to fix silently.

**The glyph names its deity twice for a screen reader.** `DeityGlyph` sets the
deity's name as the image's label and the visible name follows it, so a row
reads as "Sol SOL 24°09′ GEM". The Unicode sign it replaced had the same shape,
so this is not a regression, but an `aria-hidden` option for name-adjacent sites
would fix it.

**The Ugaritic codepoints.** `docs/design/culture-marks.md` gives U+1039B U+1038D
for the name of El, and `ts-il.svg` is cut from exactly those. Counting forward
through the Ugaritic block puts U+1039B at SSU rather than at ʾI, so someone who
reads Ugaritic should confirm the pair before it ships as Canaan's launcher.
