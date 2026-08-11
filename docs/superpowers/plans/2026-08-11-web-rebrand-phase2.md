# Web Rebrand Phase 2 Implementation Plan — "The Instrument in the Temple"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the entire Astra Antiqua web surface (`web/`) to the Phase 2 design contract in `docs/design/handoff/` — new design system, two chassis, 10 bodies, per-culture voices, all ~25 routes, missing surfaces (long transits, placements, permissions, day-pressure, glossary), honest methodology.

**Architecture:** Foundation first (fonts → tokens → culture config → chassis components), then the 10-body domain expansion, then authored content corpus, then a route-by-route sweep onto the new system, then assets/docs/verification. Legacy tokens and components stay alive during the sweep and are deleted in a final cleanup slice so every commit compiles.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4 (`@theme` in `globals.css`), `motion/react` only, `astronomy-engine`, `better-sqlite3`, self-hosted fonts via `next/font/local`.

## Global Constraints (from `docs/design/rebrand-brief.md` + `docs/design/handoff/README.md`)

- Style gates on `web/src` must return ZERO matches: `rg "—" src/` (no em dashes — use `·`, `–`, or `→` instead), `rg -i "\b(inter|roboto|harness|unlock your|discover your)\b" src/`, `rg "framer-motion" src/`.
- Fonts SELF-HOSTED only. Never fetch at build time. `node scripts/fetch-fonts.mjs` once, commit woff2.
- `npm run typecheck`, `npm run lint`, `npm run build` green at every commit. Commit in reviewable slices, conventional messages, direct to master.
- Geometry: border-radius 0 everywhere, shadows none, rules 1px only, `backdrop-filter` count 0, no gradients, no parallax. Mono microcopy floors at 11px (mock 9–10px is the one allowed deviation).
- Type: Cinzel 400–600 (display, caps, ls .06–.3em) · Spectral 300–400 + italic (prose 15–18px/1.65–1.75) · IBM Plex Mono 400–500 (data, ls .06–.22em).
- Grounds/accents: Egypt `#1A1712`/`#B59A55` · Greece `#171A1C`/`#7C93A6` · Canaan `#1A1813`/`#8A9268` · Carthage `#191218`/`#94648C` · Rome `#1B1410`/`#A5544A` · Neutral `#171310` (onboarding/auth/account/waitlist/error only). Inks: bone `#E6DECC`, prose `#D9D1BF`, dim `#9A917D`, faint `#6F6B60`. Signals: harmony `#B59A55`, conflict `#B56B71` (retrograde + destructive too). Rules `rgba(230,222,204,.16)`, row rules `.10–.12`.
- Copy cadence: short declarative sentences, direct address, votive imperatives. Egypt weighs · Greece questions · Canaan convenes · Carthage audits · Rome rules. Retire "only the names of the gods change"; replacement: "Every culture reads the same computed sky. What changes is the theology it must pass through."
- HONESTY OVERRIDES MOCKS (brief §Working agreements): mocks say "SWISS EPHEMERIS" — production says the truth: positions come from the astronomy-engine ephemeris (cosinekitty/astronomy). Mock auth says "one-time code by email" — no mailer exists; keep working email+password auth, adapt copy to stay true. Both tensions noted in the final report.
- New documented orb table (handoff supersedes old): ☌ 0° (8°) · ☍ 180° (8°) · □ 90° (7°) · △ 120° (7°) · ⚹ 60° (5°). Unify ALL three internal `ASPECT_RULES` tables to it. Record Android divergence in `docs/shared-content-model.md`.
- Anonymous-first survives: no auth walls, account adds sync only. Feedback is localStorage only.
- The Android app is NOT restyled; add a follow-up row in `docs/web-ios-android-plan.md`.

## Mock index (source of truth for exact values — read the file for the route you build)

`docs/design/handoff/screens/`: home `2a-home-desktop-rome` + `2b-home-desktop-egypt` (rails) + `2a-home-mobile-egypt`; week `4a-week-egypt`; season `2a-season-desktop-carthage`; year `4a-year-rome`; long transit `3a-long-transit-greece`; charts `3a-charts-canaan`; synastry `4a-synastry-carthage`; forecast `4a-forecast-greece`; placement `6a-placement-egypt`; onboarding `3a-onboarding-mobile`; auth `4a-auth-sign-in`; account `4a-account`; waitlist `6a-wait-list`; method `6a-methodology`; matrix `6a-translation-matrix`; glossary `7a-glossary-rome`; permissions `6a-permissions-rome`; day-pressure `7a-day-pressure-egypt`; error `6a-error-state`; empty `3a-empty-state-rome`; Canaan continuity `7a-canaan-continuity`; share `6a-share-card`; notifications `6a-notifications`; widgets `7a-widgets-carthage`; five-voice fixture `3a-voice-check-*`; per-culture variants `5a-*`. Turn 1 files are archive — ignore.

## Route map (old → new; redirects via `next.config.ts` `redirects()`)

| New route | Source | Old route (redirect) |
|---|---|---|
| `/` | rebuilt home | — |
| `/week` | NEW | — |
| `/season` | rebuilt | — |
| `/year` | NEW | — |
| `/transits` + `/transits/[id]` | NEW | — |
| `/charts` | rebuilt | — |
| `/charts/[id]/[body]` | NEW | — |
| `/reading` | rebuilt (cast flow) | — |
| `/synastry`, `/forecast` | rebuilt | — |
| `/voices`, `/voices/[culture]` | NEW | `/pantheon/[c]` → `/voices/[c]`; `/pantheon/[c]/today` → `/?culture=[c]`; `/pantheon/[c]/reading` → `/reading?culture=[c]`; `/pantheon/[c]/season` → `/season?culture=[c]`; `/pantheon/[c]/forecast` → `/forecast?culture=[c]` |
| `/welcome` | NEW (3 steps) | `/onboarding` → `/welcome` (keep `/onboarding/success` working or fold) |
| `/signin` | rebuilt (both modes) | `/sign-in` → `/signin`, `/sign-up` → `/signin?mode=new` |
| `/account` | rebuilt | — |
| `/waitlist` | rebuilt | `/wait-list` → `/waitlist` |
| `/method` | rebuilt | `/methodology` → `/method`, `/about` → `/method` |
| `/matrix` | rebuilt | `/translation-matrix` → `/matrix` |
| `/learn` + subpages | restyled; `/learn/aspects` = glossary | — |

Culture param: adopt `?culture=`; keep reading legacy `?pantheon=` for old links. localStorage keys unchanged.

---

### Task 1: Fonts

**Files:** Modify `web/scripts/fetch-fonts.mjs`, `web/src/app/layout.tsx`; delete old woff2 in `web/src/fonts/`; add 7 new woff2.

- [ ] Extend `pickUrl(cssText, style, weight?)`: when `weight` given, also require the block to contain `font-weight: ${weight}` (static families serve one URL per weight). Replace `FAMILIES` with: Cinzel (`family=Cinzel:wght@400;500;600`, variable → one file `cinzel-latin-var.woff2`), Spectral (`family=Spectral:ital,wght@0,300;0,400;1,300;1,400`, static → 4 files `spectral-latin-{300,400}.woff2`, `spectral-latin-{300,400}-italic.woff2`, each pick carries `weight`), IBM Plex Mono (`family=IBM+Plex+Mono:wght@400;500`, static → 2 files with `weight`).
- [ ] Run `node scripts/fetch-fonts.mjs`; delete `playfair-*`, `cormorant-*`, `jetbrains-*` woff2.
- [ ] `layout.tsx`: replace the three `localFont` blocks with `cinzel` (`--font-cinzel`, weight `"400 600"`), `spectral` (`--font-spectral`, 4 src entries w/ weights+styles), `plexMono` (`--font-plex-mono`, 2 src entries). Update `<html className>`.
- [ ] `npm run typecheck && npm run build` green (globals.css still references old vars — update the three `--font-*` @theme lines in this task too: `--font-display: var(--font-cinzel), serif`, `--font-body: var(--font-spectral), Georgia, serif`, `--font-mono: var(--font-plex-mono), ui-monospace, monospace`). Commit `feat(web): swap type to Cinzel, Spectral, IBM Plex Mono (self-hosted)`.

### Task 2: Tokens + culture theming (legacy tokens kept until Task 12)

**Files:** Modify `web/src/app/globals.css`, `web/src/data/palettes.ts`.

- [ ] `globals.css` `@theme`: ADD new tokens (keep legacy ones for now): `--color-ground-neutral #171310`, per-culture grounds/accents (values in Global Constraints), `--color-bone #E6DECC`, `--color-prose #D9D1BF`, `--color-dim #9A917D`, `--color-faint-ink #6F6B60`, `--color-harmony #B59A55`, `--color-conflict #B56B71`, `--color-rule rgb(230 222 204 / 0.16)`, `--color-rule-row rgb(230 222 204 / 0.11)`.
- [ ] Runtime vars on `:root`: `--ground: var(--color-ground-neutral); --accent: var(--color-harmony); --accent-border: color-mix(in srgb, var(--accent) 48%, transparent);` and five `body[data-pantheon="X"]` blocks setting `--ground`/`--accent` (+ derived `--accent-border`). LEAVE the legacy `--accent-*` var blocks in place until Task 12.
- [ ] Base: body background `var(--ground)` (replaces void + starfield layers — delete the radial-gradient starfield now; keep `.film-grain` class defined but empty, removed fully in Task 12), body font stays `--font-body` at `17px/1.7`. `:focus-visible { outline: 1px solid var(--accent); outline-offset: 2px; border-radius: 0 }`. `::selection` bone-on-accent.
- [ ] Reduced-motion + print blocks stay. Delete `@keyframes carthage-fire` + the Carthage `.text-gold-leaf` override.
- [ ] `palettes.ts`: add `CULTURE_ACCENTS: Readonly<Record<Culture,string>>` and `CULTURE_GROUNDS` (same hexes as CSS), `accentFor(culture: Culture | null): string` (neutral → `#B59A55`). Keep `CULTURE_METALS`/`metalFor` untouched until Task 12.
- [ ] Typecheck/lint/build; visual smoke: old pages now sit on culture grounds (transitional state, expected). Commit `feat(web): instrument-in-the-temple design tokens and culture grounds`.

### Task 3: Culture-voice config + copy registers

**Files:** Create `web/src/data/cultureVoice.ts`, `web/src/data/aspectRulings.ts`, `web/src/data/notifications.ts`, `web/src/data/permissionsRegister.ts`. Content sources: `docs/design/handoff/content-additions.md`, `screens/5a-*.html`, `6a-permissions-rome.html`, `7a-day-pressure-egypt.html`, `6a-notifications.html`.

- [ ] `cultureVoice.ts` — the finite per-culture config (`Readonly<Record<Culture, CultureVoice>>`):
```ts
export interface CultureVoice {
  institution: string;            // "THE HALL OF MA'AT" …
  weekTitle: string;              // "SEVEN DAYS WEIGHED" …
  weekNote: string;               // "DAYS TALLIED AGAINST THE FEATHER" …
  yearTitle: string;
  yearStructure: "seasons3" | "festivals" | "halvesRains" | "halvesSea" | "quarters4";
  synastryTitle: string;
  forecastTitle: string;
  forecastNote: string;           // "SPANS DRAWN AS FLOOD MARKS" …
  permissionPair: readonly [string, string];   // ["PROCEED","REFRAIN"] / ["OFFER","WITHHOLD"] / ["ASK","DO NOT ASK"] …
  houseGroups: readonly [string, string, string, string]; // Egypt GRANARY/HEARTH/ROAD/TEMPLE, Rome FORUM/DOMUS/VIA/TEMPLUM; author Greece/Canaan/Carthage to match
  dayFlags?: boolean;             // Rome F/N/C
  feedbackNoun: { day: string; week: string; season: string; year: string; reading: string; placement: string }; // "DECREE"/"WEEK"/…
  receptionLine: string;          // per-culture one-line framing of the received three
}
```
Fill all five from the strips (exact titles above in Route/mock index; author the two missing house-group sets and reception lines in register).
- [ ] `aspectRulings.ts` — `ASPECT_RULINGS: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>>` (25 rulings). Rome + Egypt partials given in content-additions.md §Aspect rulings; author Greece/Canaan/Carthage to the same shape (one sentence, native institution).
- [ ] `notifications.ts` — `NOTIFICATION_LINES: Readonly<Record<Culture, readonly string[]>>` with ≥30 per culture to the bar of the five samples. One line each, concrete noun, no em dashes.
- [ ] `permissionsRegister.ts` — per-culture verb banks for the permissions module: `Readonly<Record<Culture, { proceed: readonly string[]; refrain: readonly string[] }>>` with ≥12 items per list keyed loosely to aspect flavors (Rome samples in content-additions; author the rest native).
- [ ] Typecheck/lint. Commit `feat(web): per-culture voice config, rulings, notification and permission registers`.

### Task 4: 10-body expansion — math + mechanical data

**Files:** Modify `web/src/data/cultures.ts`, `sampleChart.ts`, `deityInscriptions.ts`, `planetAreas.ts`, `interpretations.ts`, `lifeDomains.ts`, `web/src/lib/ephemeris.ts`, `transits.ts`, `synastry.ts`, `personalReading.ts`, `houseReading.ts`, `annualReport.ts`, `yearForecast.ts`, `season.ts`, `web/src/components/forecast/ForecastExperience.tsx`, `web/src/components/wheel/wheelDraw.ts`, `web/src/data/deities.ts`.

**Interfaces produced:** `PLANETS` = 10 (`…,"uranus","neptune","pluto"`), `RECEIVED_BODIES = ["uranus","neptune","pluto"] as const` + `isReceived(planet)` in `cultures.ts`; unified exported `ASPECT_ORBS` in `sampleChart.ts` (conj 8, opp 8, square 7, trine 7, sextile 5) consumed by `computeAspects`, `transits.ts`, `synastry.ts`.

- [ ] Widen `PLANETS`; add `PLANET_LABELS/SYMBOLS` (♅ ♆ ♇), `RECEIVED_BODIES`, `isReceived`.
- [ ] `deities.ts`: +15 records from the handoff deity matrix (names fixed: Nut/Ouranos/Shamem/Baal Shamem/Caelus; Nun/Poseidon/Yammu/Yam/Neptunus; Osiris/Plouton/Motu/Mot/Dis Pater). Canaan epithets verbatim from content-additions.md; author the other 10 epithets+notes as designed receptions (note explains the reception, cites the modern body). Every one of the 15 gets `contested` OMITTED but a note beginning "Received:" so the UI can also detect textually.
- [ ] `deityInscriptions.ts` +15 · `planetAreas.ts` +3 · `interpretations.ts` `PLANET_DOMAINS` +3 and `PAIR_THEMES` +24 keys (short, universal) · `lifeDomains.ts`: uranus→friends, neptune→spirit(+family), pluto→work? — map: uranus into "friends"/"work" (disruption of structures), neptune into "family"/"love" (dissolution/ideal), pluto into "work"/"body" (power/regeneration); exact ids per current file, keep 5 domains.
- [ ] `sampleChart.ts`: `SAMPLE_CHART` +3 plausible longitudes; replace internal orb table with exported `ASPECT_ORBS`; `transits.ts` + `synastry.ts` import it (delete their local tables). `transitPlanetWeight`: uranus 4.5, neptune 4.5, pluto 5.
- [ ] `ephemeris.ts` `BODY_FOR_PLANET` +3 (`Body.Uranus/Neptune/Pluto`).
- [ ] `personalReading.ts`: `TRANSIT_PRINCIPLE` +3; give slow-mover weight so outer exact transits can headline: extend `personalScore` orb bonus — outers ×1.25.
- [ ] `houseReading.ts` `PLANET_CONCERN` +3. `annualReport.ts` `planetWeight` +3 cases (uranus 4, neptune 4, pluto 5); conjunction weather: pluto/uranus⇒tension bucket, neptune⇒mixed; standouts filter includes outers.
- [ ] `yearForecast.ts`: `RETROGRADE_PLANETS` +3 with `stepDays` branch (outers 5); `ALL_BODIES` → PLANETS-derived; `sampleDays` per-planet in `findMajorTransits` (jupiter/saturn 2, outers 8); export `SLOW_BODIES = ["jupiter","saturn","uranus","neptune","pluto"] as const`.
- [ ] `season.ts` `SEASON_TRANSIT_PLANETS` += outers. `ForecastExperience.tsx` `TRANSIT_PLANETS` → `SLOW_BODIES`, `OUTER_INGRESS_PLANETS` += outers.
- [ ] `wheelDraw.ts` inline symbol map +3 (compile-forced; wheel is replaced in Task 6 but must compile now).
- [ ] NEW `web/src/lib/transitSpans.ts`:
```ts
export interface TransitSpan {
  id: string;                    // `${transitPlanet}-${aspectKind}-${natalKey}`
  transitPlanet: Planet; natalKey: string; natalLongitude: number;
  aspectKind: AspectKind;
  start: Date; end: Date;        // first/last date within SPAN_ORB (3°) of exact
  passes: readonly Date[];       // exact hits inside the span (from findMajorTransits)
  transitSign: ZodiacSign; transitDegree: number;  // at first pass
}
export const SPAN_ORB = 3;
export function computeTransitSpans(natalPoints, transitPlanets, start: Date, days: number): readonly TransitSpan[]
export function findSpanById(spans, id): TransitSpan | undefined
```
Implementation: group `findMajorTransits` peaks by (planet, natalKey, kind); for each group walk outward from first/last pass in 5-day steps until angular distance > SPAN_ORB (cap search at ±700 days). Span rule is documented on `/method` ("a long transit is active while the body holds within three degrees of exact").
- [ ] Typecheck (this is the task where the 21 compile-guard sites all fire — fix each), lint, build. Commit `feat(web): ten bodies — outer planets computed, weighed, and spanned`.

### Task 5: 10-body authored content

**Files:** Modify `web/src/data/planetInSign.ts` (+36), `web/src/data/aspectReadings.ts` (+24 pairs × 3 tones), `web/src/data/yearNarrative.ts` (+36 themes + 6 beats).

- [ ] `planetInSign.ts`: 36 paragraphs (uranus/neptune/pluto × 12 signs), same length/register as existing (2 sentences, universal, no culture). Uranus = rupture/liberation of the sign's matter; Neptune = dissolution/idealization; Pluto = pressure/regeneration.
- [ ] `aspectReadings.ts`: 24 new pair keys × 3 tones to existing shape/quality (headline + body). Slow-slow pairs (e.g. uranus-pluto) may be generational in tone.
- [ ] `yearNarrative.ts`: `theme:{uranus|neptune|pluto}:{sun|moon|asc|mc}:{tension|ease|union}` (36) + `beat:{planet}-peak` and `beat:retrograde-{planet}` for the three.
- [ ] Typecheck/lint/build. Commit `feat(web): authored readings for the three received bodies`.

### Task 6: Chassis components

**Files:** Create under `web/src/components/chrome/`: `Lintel.tsx`, `SubBar.tsx`, `CultureChip.tsx`, `HorizonControl.tsx`, `NaveShell.tsx`, `InstrumentShell.tsx`, `NaveHead.tsx` (kicker+rule+headline+rule), `SectionDivider.tsx`, `Votive.tsx`, `FeedbackRow.tsx`, `MethodFooter.tsx`, `OrbBar.tsx`, `SpanBar.tsx`, `Skeleton.tsx`, `WheelSvg.tsx`, `ReceptionNote.tsx`. Create `web/src/lib/feedback.ts`. Modify `web/src/components/pantheon/PantheonContext.tsx` (accept `?culture=` and `?pantheon=`).

**Interfaces produced (exact — route tasks consume these):**
```ts
Lintel: { active?: "today"|"voices"|"learn"|"charts"|"account" }        // grid 1fr auto 1fr, ASTRA ANTIQVA Cinzel 500 17px ls .3em, sides Cinzel 12px ls .22em; ≤720px sides collapse to INDEX menu (client)
SubBar: { context: ReactNode; horizon?: Horizon; showSync?: boolean }   // 46px, mono 10.5px dim; right: HorizonControl + CultureChip (+ SYNC ON/OFF from useAuth)
HorizonControl: { active: "day"|"week"|"season"|"year" }                // D W S Y bordered cells → / /week /season /year; active = accent bg, ground text
CultureChip: {}                                                          // client dropdown; label `CULTURE: ${LABEL} ▾` accent text + accent-border; writes writePersistedPantheon + router ?culture=
NaveShell: { children; context; horizon?; active? }                     // Lintel + SubBar + <main class="mx-auto max-w-[720px] px-5 …"> + MethodFooter
InstrumentShell: { children; context; siblings: {label,href}[] }        // 60px bar variant + 3-col grid wrapper (grid-template-columns: minmax(340px,360px) 1fr minmax(380px,470px); stacks ≤720px reading-first)
NaveHead: { kicker: string; children /* headline */; sub?: ReactNode }  // centered kicker mono 11 ls .2em dim · 64×1 accent rule · Cinzel 40–58/1.25 ls .1em · rule
SectionDivider: { label: string }                                        // 1px rules flanking Cinzel 11 ls .24em accent label
Votive: { children }                                                     // top+bottom 1px rules, centered Cinzel 14/1.6 ls .14em accent, max 2 lines
FeedbackRow: { readingId: string; noun: string }                        // client; `AGAINST THIS ${noun} →` IT WAS SO · IT WAS NOT SO · KEPT ON THIS DEVICE; selected state = accent underline
MethodFooter: {}                                                         // 1px top rule; left "ASTRONOMY-ENGINE EPHEMERIS · WHOLE-SIGN · ORBS DOCUMENTED → METHOD"; right "NO ACCOUNT NEEDED · AN ACCOUNT ADDS SYNC"
OrbBar: { orb: number; maxOrb: number; tone: "harmony"|"conflict"|"quiet" }  // 3px track faint, fill width = 1 - orb/maxOrb
SpanBar: { startPct: number; endPct: number; ticks: number[] /* pct */; tone? } // 12-month bars, white tick = exact pass
Skeleton: { label?: string }                                             // faint rules + mono dim "COMPUTING THE SKY…"
WheelSvg: { chart: Readonly<Record<Planet, Longitude>>; ascendant?: number|null; aspects?: readonly Aspect[]; size?: number } // per 3a-charts-canaan: 3 circles, 12 spokes, mono sign abbrevs, Unicode glyphs (received = accent fill), aspect chords (conflict solid rose, harmony dashed bone)
ReceptionNote: { body: Planet | "any"; }                                 // bordered mono note + METHOD link, wording per 3a long-transit mock
feedback.ts: readFeedback(): Record<string,"so"|"notso">, writeFeedback(id, v|null), feedbackCount()  // localStorage "astra-antiqua.feedback.v1"
```
- [ ] Build each; all styles via Tailwind arbitrary values/new tokens; no rounded, no shadows. `PantheonContext`: `searchParams.get("culture") ?? searchParams.get("pantheon")`.
- [ ] Typecheck/lint/build. Commit `feat(web): nave and instrument chassis components`.

### Task 7: Reading-surface routes (nave)

**Files:** Rewrite `web/src/app/page.tsx` (+ new client components under `web/src/components/home/`), create `week/page.tsx`, rewrite `season/page.tsx`, create `year/page.tsx`, create `transits/page.tsx` + `transits/[id]/page.tsx` (+ `web/src/components/transits/*`). Create `web/src/lib/permissions.ts`, `web/src/lib/dayPressure.ts`, `web/src/lib/weekReading.ts` (7-day composer). Mocks: 2a/2b home, mobile, `4a-week-egypt`, `2a-season-desktop-carthage`, `4a-year-rome`, `3a-long-transit-greece`, `6a-permissions-rome`, `7a-day-pressure-egypt`.

- [ ] `/` home: Lintel + SubBar (LIVE datetime context, D active) + 3-col instrument-in-nave grid `310px 1fr 330px`: left ephemeris rail (10 body rows, deity names in active culture, retro rows conflict-colored with ℞; stations & ingresses list; method line), center decree (institution kicker line, accent rules, Cinzel headline from `buildPersonalDailyReading`/`buildSkyDailyReading`, 2 prose paragraphs, Votive, FeedbackRow readingId=`day-${yyyy-mm-dd}`, horizon links), right aspects-in-orb rail (OrbBar + per-culture ruling label from `ASPECT_RULINGS`) + long-transit box (tightest active span from `computeTransitSpans`, READ →) — then, when a natal profile exists, two nave modules below the grid: Day's permissions (two columns from `permissions.ts`: pick 3–4 proceed + 3–4 refrain items from `permissionsRegister` seeded deterministically by date + day's aspect tones; "DERIVED FROM TODAY'S ASPECTS, NOT A RANDOMIZER → WHY THESE" anchor to aspects rail) and Where the day falls (`dayPressure.ts`: bucket today's transit aspects to natal by whole-sign house of natal target into 4 house-groups (houses 10,6,2 / 4,8 / 3,9,11 / 12,1,5,7 → work/home/road/temple mapping: use 2,6,10 GRANARY · 3,7,11 ROAD · 4,8 HEARTH · 1,5,9,12 TEMPLE), bar height = tightest orb in group, labels LOUD/STRAINED/QUIET from tone mix, names from `cultureVoice.houseGroups`). Mobile 390 per mock: single column, compact sky table, long-transit teaser.
- [ ] `/week`: NaveShell (W active). `weekReading.ts`: for each of 7 days compute chart + top event (exact transit/ingress/station or quiet), compose one 1–2 sentence line in active culture (deity names + aspect ruling verbs; "quiet day" line when nothing in orb). Grid rows `104px 1fr auto`, today tinted `color-mix(in srgb, var(--accent) 7%, transparent)`, right cell mono aspect shorthand. Rome dayFlags: F (no tension exact), N (tension exact), C (mixed) shown in the date cell. Title/thesis from cultureVoice. Votive + FeedbackRow (`week-${isoWeek}`).
- [ ] `/season`: NaveShell (S active). Reuse `getCurrentSeason`/`getSeasonEvents`; render spine (WHAT IS CHANGING / WHERE IT BEGINS / WHAT IT TOUCHES / WHAT IT LEAVES BEHIND via SectionDivider + composed prose from season standouts in culture register), day-progress line `DAY n OF m · MIDPOINT PASSED`, THE SEASON'S SKY bordered box (dated event rows), votive, feedback (`season-${sign}`), horizon links.
- [ ] `/year`: NaveShell (Y active). `buildAnnualReport` + `computeTransitSpans`. Structure varies by `cultureVoice.yearStructure`: quarters4 = 4 quarter rows (Rome names VER/AESTAS/AUTUMNUS/HIEMS w/ DONE/DAY n/COMING states); seasons3 = Akhet/Peret/Shemu; halvesRains/halvesSea = 2 halves; festivals = quarter boundaries renamed as festival marks. Long-transit spine box lists spans with `→ MMM YYYY` + links. Votive, feedback (`year-${yyyy}`).
- [ ] `/transits` index: nave list of active + upcoming spans (each: headline, span, READ →), reachable from year/forecast/home. `/transits/[id]`: THE anatomy page per mock — sub-bar context `LONG TRANSIT · {DEITY} {symbol} NATAL {DEITY}` + span; NaveHead kicker `{institution} · A READING SCOPED TO THE TRANSIT'S WHOLE SPAN`; exact-degrees mono line + `THROUGH {season year}` accent line; progress bar with pass ticks + status line (`FIRST EXACT PASS DONE · TWO RETURNS REMAIN · RELEASES {MMM YYYY}`); spine sections composed per culture: WHAT IS CHANGING (transit deity characterization + aspect ruling), WHERE IT BEGINS (dates/passes/term language), WHAT IT TOUCHES (natal point + its whole-sign house group meaning), WHAT IT LEAVES BEHIND (one authored line per transit-planet × tone × culture — add `TRANSIT_SPINE` bank to `cultureVoice.ts` or new `web/src/data/transitSpine.ts`: 5 slow bodies × 5 cultures × {changing, leaves} + shared begin/touch templates); Votive (per culture × tone bank); FeedbackRow (`transit-${id}`); ReceptionNote when body is received; prev links ← THE YEAR · THE FORECAST · ALL LONG TRANSITS →. Client page computing spans from `loadSavedNatal()`; without a natal chart → empty state ("THE LONG TRANSITS ARE READ AGAINST A CHART" + CAST link).
- [ ] Each route: loading skeleton, no horizontal scroll at 375. Typecheck/lint/build. Commit per route group (`feat(web): the day's nave`, `feat(web): week, season, year horizons`, `feat(web): long-transit readings`).

### Task 8: Instrument routes + placements

**Files:** Rewrite `charts/page.tsx` (+ components), create `charts/[id]/[body]/page.tsx`, rewrite `synastry/page.tsx`, `forecast/page.tsx`, rewrite `reading/page.tsx` cast flow styling. Mocks: `3a-charts-canaan`, `6a-placement-egypt`, `4a-synastry-carthage`, `4a-forecast-greece`, `3a-empty-state-rome`.

- [ ] `/charts`: InstrumentShell. Left: placements table (BODY/LONG/SIGN, received rows accent-colored), ASC + method mono note. Center: `WheelSvg`. Right: saved charts list (Cinzel name + mono year·city), `+ CAST A NEW CHART` → `/reading`, THE THREE AS {CULTURE} RECEIVES THEM (accent-left-border epithet rows from deities), reception note box. Empty state per mock. Body rows link → `/charts/[id]/[body]`.
- [ ] `/charts/[id]/[body]`: nave spine-lite. Kicker `{institution} · YOUR STANDING PLACEMENT`, headline `YOUR {DEITY} IN {SIGN phrase}`, mono `{symbol} {deg} {SIGN} · {ordinal} HOUSE · FIXED AT YOUR BIRTH`. Spine: WHAT IT IS (planetInSign universal + deity inscription lens line), HOW IT SHOWS (whole-sign house + houseReading + register), WHAT TO KEEP IN VIEW (planetArea caution recast per culture template). Votive (placement bank), FeedbackRow (`placement-${chartId}-${body}`), prev/next body nav (`← YOUR {prev} · YOUR {next} →`), PLACEMENT nn / 10 context, ReceptionNote for outers.
- [ ] `/synastry`: InstrumentShell. Left: parties (two saved-chart cards + CHANGE A PARTY), weighing counts (HARMONIES n / CONFLICTS n / SHARED ALTARS n + "THE COUNT IS NOT THE VERDICT"). Center: bonds list strongest-first (deity-pair line, per-culture bond label, orb + OrbBar). Right: contract reading (synastryTitle headline, 2 paragraphs composed from top bonds, votive, feedback `synastry-${idA}-${idB}`). Reception note when outer in top bonds.
- [ ] `/forecast`: InstrumentShell. Left: COMING STATIONS & INGRESSES feed (dated mono rows; "DATES FROM THE EPHEMERIS, NOT VIBES → METHOD"). Center: THE SPANS · TWELVE MONTHS — month letters + SpanBar rows per span/retrograde window (white tick = exact pass; "BARS RUN UNTIL RELEASE, NOT UNTIL INTEREST FADES"), prose paragraph. Right: long-transit cards (headline, THROUGH {date} · READ →) + forecastTitle/Note framing.
- [ ] `/reading` (cast flow): keep BirthForm logic, restyle nave (mono labels, bordered inputs, radius 0), reading output on nave with new placement links.
- [ ] Typecheck/lint/build; commits `feat(web): charts instrument and placement readings`, `feat(web): synastry and forecast instruments`, `feat(web): cast flow on the nave`.

### Task 9: Voices, funnel, account, reference routes

**Files:** Create `voices/page.tsx`, `voices/[culture]/page.tsx`; create `welcome/page.tsx`; rewrite `sign-in` → `signin/page.tsx`, `account/page.tsx`, `wait-list` → `waitlist/page.tsx`, `methodology` → `method/page.tsx`, `translation-matrix` → `matrix/page.tsx`, `learn/*` restyle + `learn/aspects` glossary, `error.tsx`, `not-found.tsx`, delete `about/`, `pantheon/`, `onboarding/`, `sign-up/` (after redirects). Modify `AuthGate.tsx` funnel prefixes + target `/welcome`, `AccountChip` → simple ACCOUNT lintel link, `next.config.ts` redirects, `sitemap.ts`, `robots.ts`, `manifest.ts` (colors `#171310`), `data/methodologyContent.ts` rewrite. Mocks: `3a-onboarding-mobile`, `4a-auth-sign-in`, `4a-account`, `6a-wait-list`, `6a-methodology`, `6a-translation-matrix`, `7a-glossary-rome`, `7a-canaan-continuity`, `6a-error-state`.

- [ ] `/voices`: five doorway cards (onboarding row treatment: culture name Cinzel + institution subtitle, accent left border, each on its ground tint). `/voices/[culture]`: journey — orientation prose (rewritten registers; retire "only the names" copy), deity table (10 rows incl. received three w/ accent), aspect rulings list, today-specimen (live one-line decree in that culture), ENTER CTA (sets culture + →`/`), Canaan gets WHERE THIS RELIGION WENT closing section verbatim from content-additions + mono footer line (em-dash-free), no Yahweh deity slot anywhere.
- [ ] `/welcome`: neutral ground. Step I culture pick (five bordered rows, institution subtitles), READ TODAY'S SKY primary (accent border), `NO ACCOUNT NEEDED · BIRTH DETAILS OPTIONAL, STEP II`, SKIP ALL. Step II birth details (BirthForm fields, skippable), Step III account (skippable → `/signin`). Sets persisted culture; marks onboarding seen.
- [ ] `/signin`: neutral ground, THE RECORD kicker, "AN ACCOUNT ADDS SYNC, NOTHING ELSE" headline, email+password fields (mode toggle FIRST ENTRY/SIGN IN; honest microcopy "PASSWORD KEPT HASHED, NOTHING ELSE STORED"), CONTINUE WITHOUT AN ACCOUNT link. Keep useAuth flows + `?next=`.
- [ ] `/account`: neutral ground. Rows: CULTURE (current label), CHARTS SYNCED n, FEEDBACK ENTRIES n · THIS DEVICE (from `feedbackCount()`), SYNC ON/OFF; SIGN OUT bordered; STRIKE THE RECORD conflict-bordered (existing delete flow, type-to-confirm); mono note "STRIKING DELETES THE SERVER COPY; THIS DEVICE KEEPS ITS OWN." Keep display-name/password/export functions in quiet bordered sections below.
- [ ] `/waitlist`: THE ROLL IS OPEN + form + position line (`YOU WOULD BE nTH ON THE ROLL` — extend `waitlistStore` to return position) + "WE EMAIL ONCE, WHEN CALLED".
- [ ] `/method`: six SectionDivider sections per mock copy, with the honesty replacements: ephemeris paragraph names astronomy-engine (cosinekitty/astronomy); orb table row (☌8 ☍8 □7 △7 ⚹5 · TIGHTER = LOUDER); THE FIVE CULTURES paragraph verbatim; THE THREE RECEIVED BODIES verbatim; YOUR DATA verbatim. Rewrite `methodologyContent.ts` accordingly (delete "does not include them" position; state the reception). Fold /about's factual content here.
- [ ] `/matrix`: 10×5 table, glyph column, gold rule above received three, footer line + METHOD link.
- [ ] `/learn/aspects`: glossary per mock (angle glyph + Cinzel name + ruling in ACTIVE culture; footer "SAME ANGLES EVERYWHERE · EACH CULTURE SUPPLIES ITS OWN RULINGS"). Other learn pages: NaveShell restyle, copy sweep (update "seven" claims → ten, orb table → new values).
- [ ] `error.tsx`/`not-found.tsx`: OMEN register per mock (TAKE THE AUSPICES AGAIN reset; cached-reading link `/`).
- [ ] Redirects table (Route map above) in `next.config.ts`; `AuthGate` prefixes `["/reading","/charts","/forecast","/season","/synastry","/week","/year","/transits"]` target `/welcome`; sitemap regenerated to new routes; robots disallow `/signin`,`/account`,`/api/`.
- [ ] Sweep ALL remaining "seven" copy sites (list in explorer report: TodayDashboard, ReadingDisplay, NatalWheel caption, BehindForecast, PersonalTransits, WeekForecast, learn pages, matrix page) — replace with ten-body truthful copy; delete unused old components (PantheonSelector, PantheonJourney, OracleDecree, HorizonLinks, AuthOnboardingLayout, OnboardingFlow, GoldText/GlassPanel usages replaced… delete only when unreferenced).
- [ ] Typecheck/lint/build. Commits: `feat(web): voices and journeys`, `feat(web): welcome funnel, signin, account, waitlist`, `feat(web): method, matrix, glossary, error states`, `feat(web): redirects and sitemap for the new map`.

### Task 10: Assets

**Files:** Rewrite `web/scripts/generate-icons.mjs`, `web/src/app/opengraph-image.tsx`; regenerate `public/icons/*`; `layout.tsx` metadata/theme.

- [ ] Icons: neutral ground `#171310`, 1px inset bone border (14px at 512 scale), centered `AA` ligature-style wordmark strokes or ASTRA ANTIQVA monogram: draw wordmark letterforms as simple incised rules + harmony-gold accents (pure geometry, no star). Maskable variant at safe zone.
- [ ] `opengraph-image.tsx`: share card per `6a-share-card`: 1200×630, ground (culture-neutral), 1px inset border at 14px, kicker mono line, decree Cinzel 2–3 lines, ASTRA ANTIQVA footer. Load Cinzel from `src/fonts` via `fs.readFile` for ImageResponse.
- [ ] `viewport.themeColor #171310`; manifest colors; verify PWA install metadata. Commit `feat(web): brand assets on the new identity`.

### Task 11: Gates script + docs sync

**Files:** Create `web/scripts/check-gates.mjs` + `"gates"` npm script; modify `web/README.md`, `docs/shared-content-model.md`, `docs/web-ios-android-plan.md`.

- [ ] `check-gates.mjs`: scan `src/` for `—`, banned words regex `\b(inter|roboto|harness|unlock your|discover your)\b` (case-insensitive), `framer-motion`, plus `backdrop-filter` and `border-radius: (?!0)` in `src/` as new-identity guards; exit 1 with file:line list. Add `"gates": "node scripts/check-gates.mjs"`.
- [ ] `web/README.md`: design-token section rewritten (grounds/accents/inks/type/geometry), route map updated, gates section points at the script.
- [ ] `docs/shared-content-model.md`: planets row 7→**10** (web canonical; Android divergence noted), deity model 35→**50**, planet-in-sign 84→**120**, aspect orbs → new table (web changed; Android still old — divergence entry), new banks (aspect rulings 25, notifications 150+, permissions, transit spine), matrix 10×5.
- [ ] `docs/web-ios-android-plan.md`: status rows — web rebrand shipped; Android follow-up (restyle + 10 bodies + orb table); future work: social features (per brief), push delivery for the notification corpus, PWA widgets.
- [ ] Commit `docs: sync content model and plans to the ten-body rebrand`.

### Task 12: Legacy teardown

**Files:** `globals.css`, `palettes.ts`, delete dead components/utilities/fonts references.

- [ ] Remove legacy `@theme` tokens (`--color-bg-void`…`--color-harmony-glow`), legacy `--accent-*` blocks, `.film-grain`, `glass-panel`/`panel-solid`/`text-gold-leaf`/`accent-glow` utilities, starfield remnants, old scrollbar theme; delete `CULTURE_METALS`/`metalFor` once nothing imports them; delete unused components (`GoldText`, `GlassPanel`, `DeityGlyph`+`glyphs/`, canvas wheel trio if `WheelSvg` replaced all callers, `LifeAreaLegend` variants if unused). `rg` proves zero references before each deletion.
- [ ] Full `npm run gates && npm run typecheck && npm run lint && npm run build`. Commit `refactor(web): delete the relic design system`.

### Task 13: Verification bar (brief §Verification, handoff §Verification)

- [ ] Gates + typecheck + lint + production build green.
- [ ] Browser walkthrough with screenshots: home (anon + with natal), cast+save a chart, `/week` `/season` `/year`, one `/transits/[id]`, one full `/voices/[culture]` (Canaan for the continuity section), `/welcome` from cleared profile, `/signin`, `/charts`, `/synastry`, `/account`, sampled error/empty states.
- [ ] Five-voice check: same day at `/?culture=egypt|greece|canaan|carthage|rome` — five screenshots, no shared sentences in the decree, correct grounds/accents, no relic tokens.
- [ ] Responsive: 375 / 768 / 1280 on home, a horizon, charts, a transit page; no horizontal scroll at 375.
- [ ] Redirect spot-checks (`/pantheon/rome`, `/methodology`, `/sign-up`, `/wait-list`, `/onboarding`, `/about`, `/translation-matrix`); sitemap lists only new routes.
- [ ] Final report: what shipped, the two honesty deviations (engine name, password auth), orb-table change + Android divergence, future-work rows.

## Self-review notes

- Spec coverage: every handoff route-map row has a task (7–9); missing surfaces (long transits T7, voice depth T3/T5/T7, feedback T6, all planets T4/T5, unfinished edges T7–T9) covered; notifications corpus T3 (delivery infra out of scope — plan-doc future row T11); widgets = share card T10 + future row (no OS widget infra).
- Naming collisions flagged by recon (duplicate `MoonPhaseName`, `AspectReading`) — fix opportunistically in T4 (rename yearForecast's to `QuarterPhaseName`; leave the other).
- Type consistency: `TransitSpan.id` format used by `/transits/[id]`; `ASPECT_ORBS` consumed by transits/synastry/method page; `CultureVoice` consumed by week/year/synastry/forecast/permissions/day-pressure; `feedback.ts` consumed by FeedbackRow + account.
