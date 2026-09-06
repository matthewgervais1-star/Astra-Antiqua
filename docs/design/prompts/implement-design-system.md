# Prompt: wire the design system into the web and Android apps

Paste the fenced block into a fresh Claude Code terminal session opened at the repo root.
It is written for a session that has none of the design conversation and has to find
everything from the files named below.

## Before you paste: what is decided, and what is not

Everything visual is decided and committed under `docs/design/`. The session's job is
engineering: put the assets in front of users on two surfaces without redrawing, reinterpreting
or quietly replacing any of them. Three tier-1 marks (Egypt, Greece, Canaan) are typeset signs,
not drawings, and need converting to outlines before they can be icons; the prompt says how.
The Spectral small-caps display treatment is a prototype on the web and stays one.

```text
You are implementing the Astra Antiqua design system on two surfaces: the Next.js web app in
web/ and the Kotlin + Compose Android app in android/. Every asset and every decision already
exists in this repo. Your job is to wire them in, verify them on screen, and commit in small
steps. You will not redraw, restyle, rename or "improve" a mark or glyph. Where an asset is
missing or an instruction is ambiguous, stop and ask rather than invent.

READ THESE FIRST, IN THIS ORDER
  CLAUDE.md                                      repo rules; shared/content is generated, never hand-edit it
  docs/design/system/readme.md                   the design system: tokens, rules, iconography, glyphs
  docs/design/system/tokens/*.css                the canonical token values
  docs/design/canvas-1a/DECISIONS.md             what was decided per culture, and at what cost
  docs/design/deity-glyphs/README.md             the fifty glyphs: grid, weight, hands, honesty statuses
  docs/design/culture-marks.md                   the three-tier icon logic
  docs/android-rollout-plan.md                   what the Android app already has and how it is built

THE ASSETS, ALL UNDER docs/design/system/assets/
  marks/*.svg           twelve brand marks on a 512 grid, stroke and fill in currentColor
  wordmark/*.svg        the horizontal lockup, the monogram, eight letterforms
  traced/*.png          seven PNG alpha masks (she-wolf, Augustus, Baal stele) that take a colour via mask-image
  glyphs/<culture>/<body>.svg   the fifty deity glyphs, 24 grid, 1.5 nominal stroke, currentColor
Cultures are egypt greece canaan carthage rome. Bodies are sun moon mercury venus mars jupiter
saturn uranus neptune pluto. Each glyph's <title> carries its honesty status; keep it.

HOUSE RULES FOR ANYTHING YOU WRITE (docs, comments, commit messages)
  No em dashes; use a comma or a period. Active voice with a named actor. Be specific. Never
  rewrite quoted material: identifiers, hex values, file paths, string literals stay verbatim.
  Commit messages follow the existing style: `feat(web): ...`, `feat(android): ...`, a body
  that says why, and the Co-Authored-By trailer the log already uses.

VERIFY BEFORE EVERY COMMIT
  web:      cd web && npm run typecheck && npm run lint && npm run gates && npm run build
  android:  cd android && ./gradlew compileDebugSources && ./gradlew testDebugUnitTest
  Then look at it: run the web dev server and screenshot the affected page; build the Android
  debug APK, install on an emulator, and screenshot the affected screen. A green build is not
  evidence that a glyph rendered. If JAVA_HOME is unset, point it at the Android Studio JBR.

================================================================
PHASE 1. WEB: THE DEITY GLYPHS REPLACE THE UNICODE PLANET SIGNS
================================================================

THE DEFECT. web/src/data/cultures.ts exports PLANET_SYMBOLS, mapping the ten bodies to the
Unicode classical signs ☉☽☿♀♂♃♄♅♆♇. Those are Byzantine abstractions of Greek and Roman
deity attributes; the research calls using them for Egypt or Canaan a category error. The
running app prints ♀ beside "Isis" and ☿ beside "Kothar". Find every consumer with
  rg -n "PLANET_SYMBOLS" web/src
You will find roughly eight: the chart wheel (WheelSvg.tsx, an SVG <text> run in
var(--font-mono) at fontSize 16), ChartsInstrument.tsx, PlacementReading.tsx, the voices
page, buildHomeBundle.ts, and the home rails.

WHAT TO BUILD
1. Copy docs/design/system/assets/glyphs into web/src/glyphs/ (keep the culture/body tree).
   Write a small build step or a checked-in generated module that turns each SVG's inner
   markup into a typed record, so the app never reads SVG files at runtime:
     web/src/glyphs/index.ts  ->  GLYPHS[culture][body] = { inner: string; status: 'attested'|'composed'|'invented' }
   Generate it with a script under web/scripts/ that mirrors scripts/export-content.mjs in
   style, and add an npm script `export:glyphs`. Never hand-edit the generated module.

2. Add a component web/src/components/chrome/DeityGlyph.tsx:
     <DeityGlyph body="mars" culture={culture} size={16} className="..." />
   It renders an inline <svg viewBox="0 0 24 24"> with the glyph's inner markup, paints with
   currentColor, carries role="img" and an aria-label of the deity name from DEITY_MATRIX, and
   sets a <title> from the glyph's status. When culture is null (no culture chosen) fall back
   to the existing Unicode sign from PLANET_SYMBOLS; that is the one place the classical
   notation is the correct voice, and it must remain the visible fallback rather than an
   empty box.

3. Replace every PLANET_SYMBOLS consumer:
   - Inline text sites (tables, rails, the voices page, PlacementReading): render
     <DeityGlyph size={16}> aligned to the mono text's cap height (vertical-align or a
     flex row with align-items:center; check it beside real digits at the sizes used).
   - WheelSvg.tsx: the wheel already nudges a glyph inward when two bodies fall within
     COLLISION_ORB. Replace the <text> with a <g transform="translate(x-12,y-12)"> holding
     the 24-unit glyph so it centres on the same point and the nudge still works. Keep the
     existing accent rule: received bodies (uranus, neptune, pluto) paint var(--accent), the
     rest var(--color-bone). Do not change any radius constant.
   Keep PLANET_SYMBOLS exported for the null-culture fallback; do not delete it.

4. Prove it. Screenshot the wheel and a placements table for Egypt and for Rome. The Rome
   Mars helmet and the Greece Mars helmet must be visibly different hands at 16px; if they
   are not, you have scaled or restyled something. Then commit:
   feat(web): the deity glyphs replace the Unicode planet signs

================================================================
PHASE 2. WEB: WORDMARK, MONOGRAM, LAUNCHER AND SHARE ASSETS
================================================================

1. The wordmark. Find where "ASTRA ANTIQVA" is set in Cinzel in the shell (Lintel and
   NaveHead under web/src/components/chrome/). Replace that text with an inline render of
   docs/design/system/assets/wordmark/wordmark-horizontal.svg at the same cap height, colour
   currentColor, with the text kept in an sr-only span for accessibility. Do not change its
   position or the tracking of anything around it.

2. The monogram. docs/design/system/assets/wordmark/monogram.svg becomes the favicon and the
   apple-touch-icon. Its architrave is hard-coded #B59A55; for the in-app render make that
   stroke var(--accent) so it follows the active culture, and for the favicon keep the gold.
   Update web/src/app/opengraph-image.tsx to use the wordmark rather than typed text if it
   currently types it.

3. The PWA / launcher set for the web. If web/public carries a manifest with icons, generate
   the six launcher PNGs (egypt greece canaan carthage rome neutral) at 512 and 192 from the
   marks below, on each culture's ground from tokens/colors.css, with the mark at 0.66 of the
   canvas. Rome is marks/dr-lituus.svg, Carthage marks/em-tanit.svg (the outline cut, not
   em-tanit-hdr), neutral marks/mk-neutral-a.svg. Egypt, Greece and Canaan are typeset signs
   and need Phase 3's outline step first; do those three after Phase 3.

4. Fonts. web/scripts/fetch-fonts.mjs already vendors Cinzel, Spectral, Spectral SC and IBM
   Plex Mono for web and Android. Add the four epigraphic faces from
   docs/design/system/tokens/fonts.css (Noto Sans Egyptian Hieroglyphs, Noto Sans Ugaritic,
   Noto Sans Symbols 2, GFS Didot) to the web list only, declare them in layout.tsx as
   --font-hieroglyph, --font-ugaritic, --font-symbols, --font-greek-display, and bind them
   in globals.css. They are for setting attested signs only, never copy. Do not add them to
   the Android list; Android gets outlines, not fonts.

5. Confirm the tokens. Diff the @theme block in web/src/app/globals.css against
   docs/design/system/tokens/colors.css. They were checked to match on grounds, accents,
   inks, signals and the two rule colours. If you find any drift, the design system is
   canonical; fix the web. Do not touch the Spectral SC prototype block in globals.css;
   it is a prototype under review and stays as it is.

Commit as one or two commits under feat(web).

================================================================
PHASE 3. OUTLINES FOR THE THREE TYPESET MARKS
================================================================

Egypt's launcher mark is the ankh U+2625 set in Noto Sans Symbols 2. Greece's is omega
U+03A9 in GFS Didot. Canaan's is the two Ugaritic letters U+1039B U+1038D in Noto Sans
Ugaritic. Neither platform may depend on those fonts at runtime for an icon, so convert each
sign to a path once, at build time:

1. Write web/scripts/outline-signs.mjs. Fetch the three TTFs the way fetch-fonts.mjs does
   (no browser UA, so the css2 API serves TTF), load each with opentype.js (add it as a dev
   dependency), call font.charToGlyph(ch).getPath(x, y, fontSize) and emit an SVG path on a
   512 grid, centred, sized so the sign's bounding box spans 0.66 of the canvas. For the
   Ugaritic pair, lay the two glyphs out with the font's advance widths and centre the pair.
2. Write the results to docs/design/system/assets/marks/ts-ankh.svg, ts-omega.svg and
   ts-il.svg, using the same <svg viewBox="0 0 512 512"> and fill="currentColor" convention as
   the other marks, and record in the SVG <title> which font and codepoints they came from.
3. The design notes say the hieroglyph-class signs go thin at 48px and want a weighted cut
   with the same outline and a heavier stroke. Do not attempt that here; leave a TODO in the
   script header naming it, and ship the plain outline.
4. Commit: feat(design): outline the three typeset launcher marks

================================================================
PHASE 4. ANDROID: LAUNCHER ICONS THAT FOLLOW THE CULTURE
================================================================

WHAT EXISTS. android/app/src/main/res/drawable/ic_launcher_foreground.xml,
ic_launcher_background.xml and mipmap-anydpi-v26/ic_launcher.xml are the current single
adaptive icon. The app already switches culture: the choice is persisted through
data/local/datastore/DataStoreManager.kt, set from viewmodel/AppViewModel.kt, and
ui/theme/Theme.kt turns it into colours with accentFor(culture) and groundFor(culture).

WHAT TO BUILD
1. Six adaptive icons. For each of egypt greece canaan carthage rome neutral:
   - res/drawable/ic_launcher_<culture>_foreground.xml: a VectorDrawable on a 108dp canvas
     with the mark inside the middle 72dp (everything outside is masked by the launcher).
     Convert the SVG path data by hand or with Android Studio's Vector Asset importer; the
     marks are simple paths, arcs and circles. Paint with the culture accent, which
     accentFor(culture) in ui/theme/Theme.kt already returns, not a literal.
   - res/drawable/ic_launcher_<culture>_background.xml: a flat fill of that culture's ground.
   - res/mipmap-anydpi-v26/ic_launcher_<culture>.xml pairing the two.
   Marks: egypt ts-ankh, greece ts-omega, canaan ts-il, carthage em-tanit (outline cut),
   rome dr-lituus, neutral mk-neutral-a.
2. In AndroidManifest.xml, keep the existing launcher <activity> for neutral and add one
   <activity-alias> per culture, each android:enabled="false" except neutral, each with
   android:icon and android:roundIcon pointing at its mipmap, all targeting the same
   activity, all carrying the MAIN/LAUNCHER intent filter.
3. When the user changes culture, call PackageManager.setComponentEnabledSetting to enable
   the chosen alias and disable the others, with DONT_KILL_APP. Put this in one place that
   the culture setter calls; do not scatter it. Note in a comment that launchers may take a
   moment to redraw and that some launchers cache icons.
4. Prove it. Install on an emulator, switch culture to Rome, go home, and screenshot the
   launcher showing the lituus. Switch to Carthage and screenshot Tanit. Commit:
   feat(android): launcher icons that follow the chosen culture

================================================================
PHASE 5. ANDROID: THE DEITY GLYPHS
================================================================

Android has no planet symbol table at all today (model/Planet.kt carries names and
isReceived only), so this is a clean adoption with nothing to remove.

1. Convert the fifty glyph SVGs to ImageVector. Write a generator (a small Kotlin or Node
   script under android/scripts/ or reuse the web export) that emits
   ui/glyphs/DeityGlyphs.kt containing a function per (culture, body) built with
   ImageVector.Builder on a 24 x 24 viewport, translating each SVG path, circle, ellipse,
   line, polyline, polygon and rect into PathBuilder calls. stroke-width 1.5, caps and joins
   as the SVG states, fill and stroke as SolidColor(Color.Black) so tint controls colour.
   The SVGs use only those element types by design; if the generator meets anything else,
   fail loudly rather than skip.
2. Add a composable in ui/components/Instrument.kt or a new ui/components/DeityGlyph.kt:
     DeityGlyph(body: ClassicalPlanet, culture: AncientCulture?, size: Dp = 16.dp, tint: Color)
   Received bodies take accentFor(culture); the rest take the bone ink. With a null culture,
   draw nothing rather than a wrong glyph, and let the caller show the classical name.
3. Put it beside the body name everywhere a body is listed: the chart screen's placement
   rows, the decree cards, and any ephemeris table. Match the 16dp-in-mono-row alignment the
   web uses.
4. Prove it on the emulator: screenshot the placement list for Egypt and for Rome.
   Commit: feat(android): the deity glyphs beside every body

================================================================
PHASE 6. ANDROID: WORDMARK AND MONOGRAM
================================================================

1. Convert wordmark-horizontal.svg to an ImageVector (one Builder, twelve translated groups)
   and render it in the top bar where the app name is currently typed in Cinzel, at the same
   cap height, tinted with the bone ink. Keep the name in contentDescription.
2. Convert monogram.svg to an ImageVector and use it wherever the app currently shows a
   generic placeholder mark, with the architrave stroke tinted accentFor(culture).
3. Commit: feat(android): wordmark and monogram

================================================================
WHAT NOT TO DO
================================================================
- Do not hand-edit anything under shared/content/. It is generated.
- Do not change orb values, house logic, or any domain content; this work is presentation.
- Do not swap any mark for a "better" one, add a sixth culture, or draw a mark for Egypt,
  Greece or Canaan by hand. Their marks are the typeset signs, outlined in Phase 3.
- Do not promote the Spectral SC prototype into the design system tokens or into Android.
- Do not add gradients, shadows, rounded corners or animation anywhere. Square corners
  everywhere except the app icon, which the platform masks.
- Do not commit android/local.properties.

When all six phases are done, run the full verification on both surfaces once more, then
write docs/design/IMPLEMENTATION.md: what landed on each surface, with the commit hashes,
and what was left (the weighted cut for the three typeset signs, the cothon for Carthage,
the Spectral SC decision). No em dashes.
```
