# Handoff: Astra Antiqua Web Rebrand — "The Instrument in the Temple"

## Overview
Full rebrand of the Astra Antiqua web surface (`web/`) per `docs/design/rebrand-brief.md` (the standing contract in this repo). Phase 1 explored three directions; the product owner picked a merge of **The Instrument** (data-forward ephemeris chassis) and **Temple Monumental** (lapidary nave chassis), then iterated it across every required surface. This package is the Phase 2 design contract: implement it across all ~25 routes.

The owner's standing constraints, confirmed in session:
- Whole scheme shifts per culture (ground + accent), all colors muted, nothing full-chroma, **no glass panels**.
- Carthage accent is muted **Tyrian purple**; Rome is muted **Pompeian red**.
- On sign-up/onboarding the user picks a **culture** once; the whole site renders in that culture's voice until changed. Selector labels say CULTURE, prose may say "voice".
- All reading prose follows the **Co-Star cadence** (see Copy rules) with native theology — never generic-therapeutic.

## About the Design Files
`Rebrand Directions.dc.html` (+ its runtime `support.js`) is a **design reference created in HTML** — a multi-turn design canvas, not production code. Recreate the designs in this repo's existing environment: **Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4 (`@theme` tokens in `globals.css`), `motion/react` only**. Do not ship the HTML.

How to read the canvas (open it in a browser; sections are newest-first):
- **Turn 7** — widgets, "Where the day falls" module, aspect glossary, Canaan continuity passage.
- **Turn 6** — placement reading, day's permissions (do/don't), notifications, translation matrix, methodology, share/OG card, error + wait-list.
- **Turn 5** — voice × surface matrix: per-culture naming and structural variants for Week/Year/Synastry/Forecast.
- **Turn 4** — Week, Year, Synastry, Forecast full pages; auth + account cards.
- **Turn 3** — long-transit reading, five-voice check, charts (10 bodies), onboarding step I, empty state; token spec block.
- **Turn 2** — the picked base: home desktop/mobile + season in both chassis ratios (2a nave-first for reading surfaces, 2b instrument-first for tools).
- **Turn 1** — the two losing Phase 1 directions plus the Scriptorium. **Archive only; ignore.**

Every screen carries a `data-screen-label` attribute (e.g. `3a Long transit Greece`) — use these names when cross-referencing. Inline styles in those screens are the source of truth for exact values.

## Fidelity
**High-fidelity.** Colors, type, spacing, and copy are final; recreate pixel-close using Tailwind tokens. Mobile is mocked at 390 for home, onboarding, notifications, widgets; other routes follow the responsive rules below rather than a per-route mock. One deliberate deviation is allowed: mono microcopy mocked at 9–10px should floor at **11px** in production for accessibility.

## The two chassis
Every route uses one of two shells, both on the active culture's ground color:

**Nave chassis** (reading surfaces: Today, Week, Season, Year, long transits, journeys, placement readings, onboarding, method):
- Lintel header: CSS grid `1fr auto 1fr`, center wordmark `ASTRA ANTIQVA` (Cinzel 500, 17px, letter-spacing .3em), side navs Cinzel 12px caps ls .22em, 20px vertical padding, 56px side padding, 1px bottom rule.
- Sub-bar 46px: mono 10.5px context left (date/scope), right-aligned D·W·S·Y segmented control (bordered, active cell filled with culture accent + ground-colored text) and `CULTURE: <NAME> ▾` chip (accent text, accent-tinted 1px border).
- Content: single centered column, max-width 560–720px, centered kicker (mono 11px ls .2em dim), 64×1px accent rule, Cinzel headline 40–58px/1.25 ls .1em, prose left-aligned, section dividers = centered Cinzel 11px ls .24em label between 1px rules.
- Votive instruction: bordered top+bottom 1px, centered Cinzel 13–15px ls .14em in culture accent, two lines max.
- Feedback row (every personal reading): mono `AGAINST THIS <READING/DECREE/SEASON> →` + links `IT WAS SO · IT WAS NOT SO`, bone text with 1px bottom border; note `KEPT ON THIS DEVICE`.
- Footer: 1px top rule, mono 10.5px, method line left, anonymity line right.

**Instrument chassis** (tools: charts, synastry, forecast):
- 60px bar: wordmark (Cinzel 14px ls .28em), mono context, then right: segmented control, culture chip, sibling-tool links.
- Body: 3-column grid (`340–360px | 1fr | 380–470px`), 1px rules between columns, data left, visualization center, prose reading right.
- Data tables: mono 11.5px rows, 1px `faint` row rules, dim secondary columns; retrograde values in `conflict` color.
- Orb bars: 3px track in `faint`, fill width = orb tightness, harmony fills gold, conflict fills signal rose.

## Screens / Views (route map)
| Screen (canvas label) | Route | Notes |
| --- | --- | --- |
| Home Today (2a/2b home) | `/` | Nave. Decree + aspects; mobile 390 shown. |
| Week (4a Week Egypt) | `/week` | 7 day-rows grid `104px 1fr auto`, today row tinted accent 7%. |
| Season (2a Season Carthage) | `/season` | Spine sections + day-progress bar + season's-sky event box. |
| Year (4a Year Rome) | `/year` | Quarters list + long-transit spine box. Structure varies per culture (turn 5). |
| Long transit (3a Long transit Greece) | `/transits/[id]` | The Co-Star-anatomy page: kicker, exact-degrees mono line, span in accent, progress bar with pass ticks, spine (WHAT IS CHANGING / WHERE IT BEGINS / WHAT IT TOUCHES / WHAT IT LEAVES BEHIND), votive, feedback, reception note when body is outer. Reachable from Year, Forecast, home module. Data: `web/src/lib/yearForecast.ts` findMajorTransits. |
| Five-voice check (3a strip) | QA fixture, not a route | Same placement in 5 cultures; use as visual regression fixture. |
| Charts (3a Charts Canaan) | `/charts` | 10 bodies incl. received three (accent-colored rows + glyphs ♅♆♇), wheel SVG center, saved list + receptions right. |
| Synastry (4a Synastry Carthage) | `/synastry` | Parties, weighing counts, bond bars, contract reading. |
| Forecast (4a Forecast Greece) | `/forecast` | Stations feed, 12-month span bars (white tick = exact pass), long-transit cards. |
| Placement reading (6a Placement Egypt) | `/charts/[id]/[body]` | Spine-lite: WHAT IT IS / HOW IT SHOWS / WHAT TO KEEP IN VIEW + votive + feedback + prev/next body nav. |
| Journey (1a-style anatomy, 3a/7a content) | `/voices/[culture]` | Deity table, aspect rulings, today-specimen, enter CTA. Canaan gets the continuity closing section (7a, exact copy in content-additions.md). |
| Voices index | `/voices` | Five doorway cards using onboarding row treatment. |
| Onboarding I (3a Onboarding mobile) | `/welcome` | Culture pick on neutral ground `#171310`; READ TODAY'S SKY primary; steps II (birth details) and III (account) both skippable; SKIP ALL visible. |
| Auth (4a Auth sign-in) | `/signin` | Email one-time code; "AN ACCOUNT ADDS SYNC, NOTHING ELSE"; CONTINUE WITHOUT AN ACCOUNT link. |
| Account (4a Account) | `/account` | Culture, synced counts, devices, SIGN OUT + STRIKE THE RECORD (conflict-colored border) + server-copy note. |
| Wait-list (6a Wait-list) | `/waitlist` | "THE ROLL IS OPEN", position line, one-email promise. |
| Method (6a Methodology) | `/method` | Six sections; orb table row; reception statement is contractual. |
| Translation matrix (6a) | `/matrix` | 10×5 grid; gold rule above the received three. |
| Aspect glossary (7a Glossary Rome) | `/learn/aspects` | Angles fixed, rulings per culture. |
| Day's permissions (6a Permissions) | module on `/` | PROCEED/REFRAIN two columns, 3–4 concrete items, derived-from-aspects note + WHY THESE link. |
| Where the day falls (7a Day pressure) | module on `/` | 4 house-group bars, per-culture group names (Egypt GRANARY/HEARTH/ROAD/TEMPLE; Rome FORUM/DOMUS/VIA/TEMPLUM). |
| Notifications (6a) | push templates | One line/day, user's culture only, register per culture. |
| Widgets (7a) | PWA widgets/OG | Small = one line; medium = decree + permissions pair. |
| Empty (3a) / Error (6a) | all routes | Error: "THE OMEN IS ILLEGIBLE" + retry + cached-reading link. Same design attention as happy paths (brief §5). |
| Share/OG (6a Share card) | OG images | 1200×630, inset 1px border 14px, decree in Cinzel, culture accent rules. Feed `web/scripts/generate-icons.mjs` artwork from the same identity. |

## Interactions & Behavior
- **Culture**: chosen at onboarding or via header chip; persists (existing mechanism: `data-pantheon` body attribute + persisted preference + `?culture=` param). Changes ground, accent, deity names, surface titles, structural variants, notification/permission registers. Neutral ground `#171310` only where no culture is presumed (onboarding I, auth, account, wait-list, error).
- **Horizon control**: D·W·S·Y navigates `/`, `/week`, `/season`, `/year`.
- **Feedback**: IT WAS SO / IT WAS NOT SO writes `{readingId: so|notso}` to localStorage; no backend; count surfaces on `/account`.
- **Links/hover**: dim → bone on hover for nav; accent links brighten ~10%. Focus: 1px accent outline, 2px offset. No underlines except dotted-bottom affordances already in mocks.
- **Motion**: progress bars render static; page transitions ≤200ms opacity via `motion/react`; honor reduced-motion through both existing layers. No parallax, no gradients.
- **Responsive**: nave column → 100% at ≤720px with 20–24px gutters; instrument grid stacks reading-first, wheel collapses behind a tap at ≤720px; lintel side-navs collapse into an INDEX menu at ≤720px; grids for day/quarter rows go single-column at 390. No horizontal scroll at 375.

## State Management
- `culture` (persisted), `savedCharts[]` (device-first, synced when account), `feedback{}` (localStorage), `session` (email-code auth), wait-list position.
- Ephemeris per day + natal computation server-side as today; long transits from `findMajorTransits` + `yearNarrative` themes/beats.
- Loading states: skeleton = faint rules + dim mono `COMPUTING THE SKY…`; never spin.

## Design Tokens (→ `globals.css @theme`; also in tokens.css here)
Grounds/accents (culture): Egypt `#1A1712`/`#B59A55` · Greece `#171A1C`/`#7C93A6` · Canaan `#1A1813`/`#8A9268` · Carthage `#191218`/`#94648C` (Tyrian) · Rome `#1B1410`/`#A5544A` (Pompeian) · Neutral ground `#171310`.
Inks: bone `#E6DECC`, prose-dim `#D9D1BF`, dim `#9A917D`, faint-dim `#6F6B60`, rule `rgba(230,222,204,.16)`, row-rule `rgba(230,222,204,.10-.12)`.
Signals: harmony `#B59A55`, conflict `#B56B71` (also retrograde + destructive actions).
Type: Cinzel 400–600 (display, caps, ls .06–.3em) · Spectral 300–400 + italic (prose, 15–18px/1.65–1.75) · IBM Plex Mono 400–500 (data/microcopy, ls .06–.22em). Self-host all three via `web/scripts/fetch-fonts.mjs`; commit woff2.
Geometry: border-radius 0 everywhere; shadows none; rules 1px only; `backdrop-filter` count 0. Accent-tinted borders at 45–50% alpha of accent. Section paddings: 56px desktop gutters, 44–54px top of nave columns, 24–34px rail paddings.

## Copy rules (style gates enforce some of these)
- Cadence: short declarative sentences, one thought each, direct address. No semicolon chains. **No em dashes anywhere in `web/src`.** Banned words per gate: inter, roboto, harness, "unlock your", "discover your".
- Register per culture — Egypt weighs (scale/river/granary), Greece questions (oracle/price), Canaan convenes (council/vow), Carthage audits (ledger/harbor/precinct), Rome rules (auspices/censor/law). Instructions are votive: imperative, concrete, two lines.
- Retire the old "only the names of the gods change" copy everywhere; the replacement claim: "Every culture reads the same computed sky. What changes is the theology it must pass through."
- Honesty lines ship with the UI: methodology footer line on every reading chassis, reception note on outer-planet surfaces, "quiet day" over invented weather.

## Assets
No raster/vector imagery in the design besides the wheel SVG (drawn per mock: concentric circles, 12 spokes at faint alpha, mono sign abbreviations AR/TA/GE…, planet glyphs, aspect chords) and the share/OG card (pure type). PWA icons + OG must be regenerated to this identity (wordmark + incised rules on neutral ground). Co-Star reference JPGs stay in `docs/design/references/` (anatomy reference only — never the voice).

## Verification bar
Use the brief's bar verbatim (`docs/design/rebrand-brief.md` §Verification): green typecheck/lint/build + zero gate matches; browser walkthrough with screenshots (home, cast+save, four horizons, a long transit, one journey, onboarding from cleared profile, auth, charts, synastry, account, sampled empty/error); five-voice check on one day; 375/tablet/desktop; redirects + sitemap; docs synced (`docs/shared-content-model.md` counts change with the 10×5 matrix; README token section; plan-doc rows incl. Android follow-up).

## Files
- `Rebrand Directions.dc.html` + `support.js` — the design canvas (open in browser).
- `tokens.css` — Tailwind 4 `@theme` starter matching the token table.
- `content-additions.md` — deity matrix, institutions, surface names, structural variants, aspect rulings, notification/permission corpus, Canaan continuity passage, methodology copy.
