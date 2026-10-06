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
| `073c7de` | The type and spacing scales connected |
| `c707b40` | The tier-2 emblems on the doorways, the chip and the matrix |
| `eba8d47` | The shared components, and the scale on every surface |
| `a47a778` | `DeityGlyph` takes a `decorative` prop, set where the deity's name sits beside the glyph |
| `f62c971`, `a810581` | One `--breakpoint-instrument` token; the instrument stacks below it (now `68.75rem`, 1100px) |

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

**The second wave: what the audit found missing.** The first wave put the
glyphs and the brand in; the site still read as it had, because the type and
spacing scales were tokens nobody consumed, the six tier-2 emblems and the
traced masks had no consumer at all, and every call to action hand-typed its
own border. `073c7de` binds the scale in `globals.css` as Tailwind utilities,
`text-display-xl` through `text-data-xs`, `tracking-display` through
`tracking-microcopy`, `leading-display`, `leading-prose`, `leading-data`, and
the eight spacing steps as `var(--space-N)`. `c707b40` exports the emblems
through `scripts/export-marks.mjs` and sets them on the doorway heads, in the
culture chip and across the matrix header. `eba8d47` adds the components
`components/specs/` describes: `Button` in three weights, `Badge`, `IconTile`
for the attested signs and the traced masks, `DataRow` with house and motion,
`CultureSwitch` and `Monogram`, then moves 366 font sizes, 180 tracking
values, 137 leadings and 122 spacing steps onto the scale, and the accent
utilities onto `text-accent`, `bg-accent` and `border-rule-active`. Each
doorway carries its tier-3 figures with captions and has its own share card.

Screenshots: `docs/design/screenshots/phase7`, `phase8`.

## Android

| Commit | What landed |
|---|---|
| `89a8c7a` | Launcher icons that follow the chosen culture |
| `bb3d43c` | The deity glyphs beside every body |
| `60d9120` | Wordmark and monogram |
| `04e11c8` | The type and spacing scales, the emblems, and three components |
| `0a96dfc` | A shell, a nav graph, and four screens web already had |
| `4f23517` | The long transits, as spans rather than dates |
| `050844c` | The week, in the culture's own institution |
| `36581e5` | The season and the year |
| `d4381ad` | The traced masks, the outlined signs, the week's ingress line |
| `6ecba33` | A reading for every standing placement |
| `c4ec1ca` | The seven Learn sections |
| `9219b0e` | The forecast, casting again, and an offline birthplace picker |
| `e0aff05` | Synastry |
| `95e0180` | The balance beside the ankh on Egypt's doorway, outlined from Noto Sans Egyptian Hieroglyphs as `TypesetSign.BALANCE` |

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

**The second wave: the surfaces stop disagreeing.** Android carried its own
type and spacing scales that happened to resemble the system's, four screens
against web's twenty-six, no bar, and no emblem. `04e11c8` puts Type.kt and
Spacing.kt on the tokens, generates the five tier-2 emblems as ImageVectors
through `gen-android-emblems.mjs`, and adds ActionButton, Badge and a real
DataRow. `0a96dfc` replaces the four-branch phase machine with a container,
a nav graph and a shell, then adds the voices, one culture's doorway, the
matrix and the placements table. `4f23517`, `050844c` and `36581e5` port the
transit spans, the week and the sky-event finders, so the long transits and
all four horizons exist.

**The reading corpus is generated, not retyped.** The fifty deity charges, the
twenty-five ruling frames and the five ingress frames reach Kotlin through
`web/scripts/gen-android-reading-banks.mjs`, reading
`web/src/data/deityCharges.ts` and `aspectFrames.ts`. The same figure prints
the same sentence on both surfaces, and a change to the prose lands on both
from one edit.

Screenshots: `docs/design/screenshots/phase9`.

**The third wave: the gap closed.** Android went from four screens to
eighteen. The traced masks ship as alpha drawables tinted at the call site,
and the three encoded signs as outlines, because this surface gets outlines
and not fonts. Every standing placement has a reading. The seven Learn
sections are read out of the web pages themselves by `gen-android-learn.mjs`,
so the explainer prose lives once. The forecast reads the year against one
chart, with a computed solar return. Synastry compares the saved chart with a
second party entered for the reading and never stored.

**Four generators keep the two surfaces on one corpus.**
`gen-android-emblems.mjs` carries the marks, `gen-android-reading-banks.mjs`
the day page's banks and domains, the ingress charges and frames, the aspect
verbs (`2a43515`) and the day-page parity goldens, `gen-android-learn.mjs` the
explainer prose and its reference tables, and `gen-android-cities.mjs` the
birthplace list. Nothing in that corpus is retyped, so neither surface can
drift from the other by a sentence.

## Verified

Web: `npm run typecheck`, `npm run lint`, `npm run gates` and `npm run build`
pass after every wave, the second included. Android: `./gradlew assembleDebug` and `./gradlew testDebugUnitTest` pass,
40 tests, six of them ViewModel tests running against fakes. Eighteen screens
were walked on a Pixel 9 emulator with the network unreachable. `node scripts/check-svgs.mjs docs/design/system` passes on all 75 files.
The launcher icons and the glyphs were checked on a Pixel emulator, not inferred
from a green build.

2026-09-29: the Android suite now runs 65 unit tests, and all seven ViewModels
run against fakes (`7222c01`).

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

**The accent utilities are inline.** `text-accent` is declared in
`@theme inline`, not `@theme`. A plain entry would emit
`--color-accent: var(--accent)` on `:root`, where the accent is the neutral
gold, and every use would ignore the culture that `body[data-pantheon]` sets.
Inline, the utility carries `var(--accent)` itself and resolves where it lands.

**The spacing steps stay out of `@theme`.** Tailwind generates its numeric
scale from the `--spacing` namespace, so `--spacing-1: 6px` would silently
change `p-1` across the app. The steps live in `:root` and are consumed as
`p-[var(--space-3)]`.

**Cinzel below 18px stays literal.** The display scale has four steps and the
smallest is 22px. Sixty sites set Cinzel between 11 and 17px, as list names,
nav labels and small heads. Mapping them up would break those rows, and the
tokens file says not to add a step to fit one screen, so they stay at their
literal size and are listed by the sweep. The buttons that were among them are
now mono, which is what the Button spec asks for.

**Greece ships the omega, not the tripod.** The research names the tripod as
the launcher; both icon generators cut it from `ts-omega.svg`. The reasoning
is recorded in `docs/design/canvas-1a/DECISIONS.md`.

**The wheel's ten colours were the previous identity's.** The Compose natal
wheel painted each body a bright hue, five of them outside the palette
entirely, which broke the rule that separates by form and confirms by hue and
gave a colour-deficient reader nothing. It now draws the culture's own deity
glyphs, which differ by drawing hand, with the received three in the accent
and a quiet ring besides.

**Android took a container rather than Hilt.** The rollout plan names Hilt
and asks for a reason otherwise. The reason is size: the graph is four
objects with no scoping beyond the process, and what the plan actually asks
for is ViewModels that stop taking a Context per method and can be tested
with fakes. Repository interfaces and one factory deliver that with no
annotation processor to keep in step with Kotlin and AGP. A second entry
point or a real scope makes Hilt right, and this is small to replace.

**A doorway scopes the whole page to its culture.** Reading about Rome
through Egypt's accent puts two accents on one screen, which the system
forbids, so `VoiceScreen` swaps the theme for its own length, exactly as
`VoiceScope` does on web.

**Three defects were found by building the screens, not by reading the
code.** The navigation restored state on every push, so a second Learn
section, a second placement or a second doorway never opened: moving between
sections and moving into something are different operations now. Entering a
voice from its doorway called the first run's culture setter and dropped the
reader into the birth form, which a test now guards. The birth form had only
the platform Geocoder, so a reader offline could not finish the first run at
all; it now leads with the packaged city list.

**`ReadingDisplay`'s fade stands.** The reading fades in on opacity alone,
over 0.55 seconds, and drops to 0.01 seconds when the reader asks for reduced
motion. `docs/design/system/readme.md` permits a plain opacity fade where
motion is unavoidable, so the fade stays.

**The instrument stacks below one breakpoint.** At tablet widths the
three-column instrument scrolled sideways. `f62c971` and `a810581` add one
`--breakpoint-instrument` token in `globals.css`, read as the `instrument:`
variant by `InstrumentShell` and `ChartsInstrument`. Those commits set it to
1200px, measured while a specificity bug put the placements in the centre
column. With the columns in the handoff's order (data, visualization, reading),
the re-measured value is `68.75rem` (1100px): the smallest trial width at
which the data rail shows every body name whole and no instrument page scrolls
sideways. `docs/web-rebrand-report.md` records the trials.

**The zodiac notation needed a fourth face.** None of the three product faces
carries those codepoints, so Android's font chain fell through to the colour
emoji font and painted them as orange pictographs. Noto Sans Symbols ships in
`res/font` under the design system's own `--font-symbols` token. Notation
only, never copy.

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

**A display step under 22px, or none.** Whether the small Cinzel labels get
a `display-xs` step or move to mono is a design call; the sweep left them
literal so the decision is not made by a script.

**The account, sign-in and wait-list routes need a server, not a screen.**
Web talks to `/api/auth/*`, `/api/charts` and `/api/wait-list` from the same
origin. Android would need a base URL, a session store and a cookie client,
and the rollout plan calls sync with the web account "a real feature
decision, not a parity gap". Three of web's twenty-six routes are therefore
deliberately absent, and they are the three that do nothing without an
account.

**The Learn hub's sample wheel did not cross.** It is the one block the
extractor deliberately leaves behind: the day screen already draws a wheel
from a real chart, so a fixed illustration of one would be the weaker of the
two on a phone.

**The Spectral SC display decision.** The small-caps treatment on the four
non-Roman surfaces is still a prototype in `globals.css` and was not promoted
into the tokens or carried to Android. Its open question is Cinzel's tracking,
set per component and loose on small caps, which wants looking at before it is
tuned.

**The Ugaritic codepoints.** `docs/design/culture-marks.md` gives U+1039B U+1038D
for the name of El, and `ts-il.svg` is cut from exactly those. Counting forward
through the Ugaritic block puts U+1039B at SSU rather than at ʾI, so someone who
reads Ugaritic should confirm the pair before it ships as Canaan's launcher.

### Since closed

Recorded 2026-09-29. The first two items stood in this section; the third was
a gap between the two doorways. The tree has since closed all three.

- **The glyph named its deity twice for a screen reader.** A row read as
  "Sol SOL 24°09′ GEM". `a47a778` gives `DeityGlyph` a `decorative` prop that
  sets `aria-hidden`, and the name-adjacent sites pass it.
- **Android kept one birth record where web kept many.** Since `8796ef7` web
  keeps one chart per account too. On both surfaces casting replaces the one
  chart, and synastry enters the second party for the reading and never
  stores it.
- **Egypt's doorway on Android showed the ankh alone.** Web shows the ankh and
  the balance. `95e0180` outlines `ts-balance.svg` from Noto Sans Egyptian
  Hieroglyphs, adds `TypesetSign.BALANCE`, and sets it after the ankh.
- **Two rule colours drifted.** The web rules were bone with alpha (0.16 and
  0.11) where the design system has opaque hex. The rules now take
  `--rule-hairline` `#4A3E28` and `--rule-incised` `#2A241C` on web
  (`--color-rule`, `--color-rule-row`) and on Android (`Rule`, `RuleRow`).
  The rules no longer shift with the culture ground. The OG cards draw their
  own frame in literal values and never read the tokens, so they did not
  change. Landed with the commit `feat(design): the rules take the system's
  incised and hairline inks`; screenshots in
  `docs/design/screenshots/phase11-design-calls/`.
