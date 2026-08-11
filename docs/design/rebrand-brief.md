# Astra Antiqua Web Rebrand Brief

The standing brief for a full rebrand of the web surface (`web/`). A design
session reads this document, executes Phase 1, stops for the human pick, then
executes Phase 2. Everything in **Inviolable core** is a hard constraint;
everything in **Open to change** is genuinely open, including choices the
current site is proud of.

## Mission

Rebrand Astra Antiqua's web surface end to end. This is not a refresh: the
visual identity, GUI, navigation and information architecture, page structure,
and copy voice are all on the table. The destination is not prescribed; it is
discovered through the three-direction exploration in Phase 1 and chosen by
the human.

## Inviolable core (must survive the rebrand intact)

1. **The concept.** One professionally computed sky, read through the
   religious frameworks of five ancient cultures: Egypt, Greece, Canaan,
   Carthage, Rome. The five-voice idea is the product. The same placement
   keeps the same core astrological meaning in every voice, but each
   culture's interpretation must be culturally substantive: its own
   theology, institutions, imagery, and concerns, not a name swap on shared
   prose. The current site's "only the names of the gods change" framing
   undersells this; the rebrand should retire that copy and let the five
   readings feel genuinely native to their cultures while agreeing on what
   the placement means.
2. **The content corpus.** Deity records, decrees, aspect verbs, sign
   registers, house meanings, season/week/year readings, methodology and
   learn material. Copy REGISTER may change (see Open to change); the
   substance, accuracy, and scholarly grounding may not be dumbed down or
   deleted.
3. **The per-culture theming capability.** Choosing a pantheon re-skins the
   reading experience. The mechanism (data-pantheon body attribute, culture
   query param, persisted preference) may be redesigned, but the capability
   must remain, and each culture must remain visually distinguishable.
4. **The horizon system.** Day, Week, Season, Year as reading horizons with
   cross-links. Their presentation and organization may change freely.
5. **Feature completeness.** Every current feature and route keeps working:
   reading/casting, saved charts, synastry, forecast, season, learn section,
   methodology, translation matrix, pantheon journeys, onboarding funnel,
   auth + account, wait-list. URLs may be reorganized only with redirects
   from the old paths.
6. **Astronomical honesty.** Real ephemeris, whole-sign houses, the
   documented orb table, and the methodology's claims stay truthful and
   visible. The rebrand may not trade accuracy framing for vibes.
7. **Anonymous-first.** The product works without an account; sign-up adds
   sync. The onboarding funnel may be redesigned but not turned into a wall.

## Open to change (explicitly, even if it feels sacred)

- The entire "Relic" visual identity: gold-on-black palette, Playfair
  Display / Cormorant Garamond / JetBrains Mono, glass panels, metal
  gradients, glyph rendering style.
- Navigation and IA: the 9-item header, entry paths, how horizons and
  pantheon pages are reached, what the home page is for.
- Page structure and density everywhere, including the home dashboard.
- Copy voice: headline register, UI microcopy, section naming ("The season's
  instruction", "Decrees", etc.). Substance stays; register may be reinvented.
- The five culture themes' specific palettes, as long as cultures stay
  distinguishable and the theming capability survives.

## Technical constraints

- Stack stays: Next.js 16 App Router, React 19, TypeScript strict,
  Tailwind CSS 4 (`@theme` tokens in `globals.css`), `motion/react` only
  (never framer-motion).
- Fonts must remain SELF-HOSTED via `next/font/local` (this network resets
  parallel fetch bursts to Google Fonts, so builds must not fetch). New
  typefaces are welcome: extend `web/scripts/fetch-fonts.mjs` to download
  them once, commit the woff2 files, keep variable-font files deduplicated.
- Style gates on `web/src` must pass with zero matches: no em dashes, no
  banned terms (`inter|roboto|harness|unlock your|discover your` as whole
  words), no framer-motion import.
- Accessibility: body copy meets contrast floors (no gradient text below
  display sizes), reduced-motion is honored through both existing layers,
  keyboard/focus states styled, `backdrop-filter` stays within the
  three-per-route budget if glass survives at all.
- PWA install stays intact: manifest, icons (regenerate
  `web/scripts/generate-icons.mjs` artwork to match the new identity),
  themed viewport.
- `npm run typecheck`, `npm run lint`, `npm run build` green at every commit.
- Update `docs/shared-content-model.md` and `web/README.md` wherever the
  rebrand moves or renames things the docs describe. The Android app is NOT
  restyled in this effort; note follow-up work for it in the plan doc status
  table instead.

## Phase 1: three directions, then stop

Produce THREE named design directions. Distinct means different design
theses, not one thesis at three intensities. For each direction:

- A one-paragraph thesis: what the site believes about itself in this
  direction, and what changes about IA/structure/voice, not just paint.
- Real rendered pages, not static images: implement throwaway versions of
  the HOME page, ONE horizon page (season or today), and ONE pantheon
  journey page in the direction's full identity, behind temporary routes
  (e.g. `/_directions/<name>/...`) or a branch per direction, whichever
  keeps the working tree clean.
- Each shown in the browser pane at desktop and mobile widths, in at least
  two culture themes, with screenshots captured as the presentation.

Then STOP. Present the three directions with their theses and screenshots
and ask the human to pick (or to remix: "A's type with C's nav" is a valid
answer). Do not begin Phase 2 without an explicit pick.

## Phase 2: one-shot build of the winner

- Rebuild the design system first: `globals.css` `@theme` tokens, fonts,
  shared UI components (`GoldText`, `GlassPanel`, `SectionContainer`,
  headers/footers), then sweep every route onto the new system.
- Delete the losing directions' throwaway routes/branches.
- No page may ship half-migrated: the sweep covers all ~25 routes including
  auth, onboarding, account, wait-list, and error/empty states.
- Regenerate PWA icons and OG imagery to the new identity.
- Commit in reviewable slices (tokens/system, then route groups), each
  compiling and gate-clean.

## Phase 2 also completes what is missing

The rebrand ships the product's missing surfaces, not just new skin on the
existing ones:

1. **Long-transit readings.** Duration-scoped reading pages for the slow
   transits (Jupiter and Saturn against the natal points), each presented
   as its own quiet prose page in the chosen direction's identity: what is
   changing, where it begins, what it touches, what it leaves behind, one
   instruction, with the transit's real span named ("through next spring"),
   read in the active culture's voice. The math already exists
   (`web/src/lib/yearForecast.ts` findMajorTransits, `yearNarrative`
   themes/beats); the surface does not. Reachable from the horizons and the
   forecast.
2. **Substantive voice depth.** Wherever the five voices appear, the
   per-culture layer is brought up to the decree corpus's quality bar
   (culturally native imagery and concerns), replacing name-mask rendering.
   This is authored content work; budget for it.
3. **Reading feedback.** A lightweight accurate/not-accurate affordance on
   personal readings (local storage is enough; no backend). The chosen
   direction decides its form, not whether it exists.
4. **All planets.** Uranus, Neptune, and Pluto join the system as
   first-class bodies: computed in charts, drawn on wheels, and driving the
   long-transit readings (they are the slowest, most defining transits).
   Because no ancient culture knew them, each culture's treatment must be a
   designed act of reception, the way Rome absorbed foreign gods: every
   culture names and characterizes the three through its own theology, and
   the methodology page states plainly that the outer planets are a modern
   extension made in the ancient manner. The content expansion this implies
   (deity mappings 5x3, placement readings, transit principles, glyphs) is
   part of Phase 2's authored-content budget, and
   `docs/shared-content-model.md` must be updated as the counts change.
5. **The unfinished edges.** Empty states, error states, and loading states
   on every route get the same design attention as the happy paths.

Explicitly still out of scope: social features (the "add friends" pattern
needs a backend social graph; record it in the plan doc as future work).

## Verification bar (Phase 2 is done only when all of this holds)

1. Typecheck, lint, production build green; style gates zero matches.
2. Browser walkthrough with evidence (screenshots): home, reading flow
   (cast + save a chart), all four horizons, a long-transit reading page,
   one full pantheon journey, onboarding funnel from a cleared profile,
   sign-up/sign-in, charts, synastry, account, and a sampled empty/error
   state.
3. The five-voice check: the same day read in all five cultures, visually
   distinct, correctly themed, no leftover old-brand tokens.
4. Responsive check at mobile (375w), tablet, desktop on the key pages; no
   horizontal scroll; PWA install metadata intact.
5. Old URLs that moved return redirects, sitemap regenerated.
6. Docs synced: README design-token section, shared-content-model touchpoints,
   plan doc status row for the rebrand (plus an Android follow-up row).

## References (docs/design/references/)

Co-Star long-transit reading screens, supplied by the product owner
(`costar-transit-reading-1.jpg`, `costar-transit-reading-2.jpg`,
`costar-pluto-transit-header.jpg`). Study them for:

- **Presentation density**: a reading as a quiet single-column prose page,
  generous line-height, one austere image, functional footer. Nothing
  competes with the text.
- **Reading anatomy**: a fixed narrative spine per reading: what is
  changing, where it begins, what it touches, what it leaves behind, then
  one direct instruction. The structure repeats; the content varies.
- **Duration-scoped readings**: the reading is scoped to the transit's real
  span ("Through 2028"), not a calendar unit. Astra Antiqua's classical
  equivalent is the slow Jupiter/Saturn transits already computed for the
  annual report.
- **A feedback affordance** (accurate / not accurate) as a lightweight
  engagement pattern; required by "Phase 2 also completes what is missing".

What NOT to absorb: the voice. These readings are deliberately cultureless,
generic-therapeutic second person. Astra Antiqua's differentiator is the
opposite: five culturally substantive voices reading the same sky (see
Inviolable core). Learn the typography and the spine; keep the gods.

## Working agreements

- Direct commits to master, conventional messages, present-tense summaries
  of what changed and why, as this repo already does.
- When a constraint here conflicts with a design ambition, the constraint
  wins; note the tension in the final report instead of silently bending it.
