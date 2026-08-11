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
   Carthage, Rome. The five-voice idea is the product. A visitor must still
   be able to read the same placement in different voices and feel that only
   the names of the gods change.
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

## Verification bar (Phase 2 is done only when all of this holds)

1. Typecheck, lint, production build green; style gates zero matches.
2. Browser walkthrough with evidence (screenshots): home, reading flow
   (cast + save a chart), all four horizons, one full pantheon journey,
   onboarding funnel from a cleared profile, sign-up/sign-in, charts,
   synastry, account.
3. The five-voice check: the same day read in all five cultures, visually
   distinct, correctly themed, no leftover old-brand tokens.
4. Responsive check at mobile (375w), tablet, desktop on the key pages; no
   horizontal scroll; PWA install metadata intact.
5. Old URLs that moved return redirects, sitemap regenerated.
6. Docs synced: README design-token section, shared-content-model touchpoints,
   plan doc status row for the rebrand (plus an Android follow-up row).

## Working agreements

- Direct commits to master, conventional messages, present-tense summaries
  of what changed and why, as this repo already does.
- When a constraint here conflicts with a design ambition, the constraint
  wins; note the tension in the final report instead of silently bending it.
