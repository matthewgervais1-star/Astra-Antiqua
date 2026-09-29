# Web rebrand: final report

The "Instrument in the Temple" rebrand rebuilt the web surface (`web/`). This report closes it.
It answers the verification bar in `docs/design/rebrand-brief.md` and Task 13 of
`docs/superpowers/plans/2026-08-11-web-rebrand-phase2.md` point by point. The evidence was
captured on 2026-09-29 against `pnpm dev` at commit `95e0180`, at 1x scale, into
`docs/design/screenshots/phase10-verification/`.

## What shipped

### Route map

| Group | Routes |
|-------|--------|
| The day and its horizons | `/` (day), `/week`, `/season`, `/year` |
| Personal instruments | `/reading` (cast), `/charts`, `/synastry`, `/forecast`, `/transits`, `/transits/[id]` |
| The five voices | `/voices`, `/voices/egypt`, `/voices/greece`, `/voices/canaan`, `/voices/carthage`, `/voices/rome` |
| Reference | `/method`, `/matrix`, `/learn` and six `/learn/*` pages |
| Entry and account | `/welcome`, `/signin` (`?mode=new` for first entry), `/account`, `/waitlist` |
| Legal | `/privacy`, `/terms`, `/confidentialite`, `/conditions` |
| Registers | `not-found.tsx`, `error.tsx`, a `loading.tsx` per slow route |

The sitemap lists the new routes only: `/`, the four horizons, the personal instruments,
`/voices` and its five doorways, `/method`, `/matrix`, `/learn` and its pages, and `/waitlist`.
No old path appears in it. The PWA manifest serves at `/manifest.webmanifest` with
`application/manifest+json`.

### The missing surfaces the brief required

1. **Long-transit readings.** `/transits` lists the slow transits against the natal points.
   Each `/transits/[id]` is a prose page with the real span named ("THROUGH THE SPRING OF
   2027"), a pass track, and the sections the brief asked for. The home rail and the forecast
   link to it. See `transits-saturn-opposition-asc-rome-1280.png`.
2. **Voice depth.** Each culture carries its own decree corpus, institution and imagery. The
   five-voice set below shows it.
3. **Reading feedback.** "AGAINST THIS DECREE: IT WAS SO · IT WAS NOT SO" sits under the day's
   decree and stays on the device.
4. **All planets.** Uranus, Neptune and Pluto appear on every ephemeris rail and wheel under
   each culture's own name (Caelus, Neptunus, Dis Pater for Rome). `/method` states that the
   three are a modern extension made in the ancient manner.
5. **The unfinished edges.** `/charts` has an empty state, `not-found.tsx` has its own
   register, and `error.tsx` has one (verified by reading, below).

## The two honesty deviations

Production departs from the design mocks in two places. Both departures keep the product
truthful.

1. **The engine name.** The mocks print "SWISS EPHEMERIS". Production computes positions with
   astronomy-engine (the cosinekitty/astronomy library), and `/method` says so: "Positions
   come from the astronomy-engine ephemeris, the cosinekitty/astronomy library." The home rail
   and the charts page print "ASTRONOMY-ENGINE · WHOLE-SIGN · ORBS DOCUMENTED".
2. **Password auth.** The mocks promise a one-time code by email. No mailer exists, so
   production keeps email and password. The comment at the top of `web/src/app/signin/page.tsx`
   records the decision, and the form states what it stores: "EMAIL AND A PASSWORD, KEPT
   HASHED · NOTHING ELSE STORED".

## The orb table

The rebrand replaced the old per-surface orbs with one documented table:

| Aspect | Orb |
|--------|-----|
| Conjunction | 8° |
| Opposition | 8° |
| Square | 7° |
| Trine | 7° |
| Sextile | 5° |

On web, `ASPECT_RULES` in `web/src/data/sampleChart.ts` holds it, and natal, transit and
synastry aspects all read it. The plan recorded Android as divergent. That divergence is
closed: Android's `AspectType` in
`android/app/src/main/java/com/astra/antiqua/domain/NatalChartData.kt` carries the same five
orbs.

## Later decisions that changed the plan

- **`8796ef7`: one chart per account.** The app used to keep a list of charts about other
  people. It now keeps the reader's own chart, under `astra-antiqua.chart.v3`. Synastry takes
  the second party's details, computes, and drops them. `/synastry` says so under the form:
  "THEIR DETAILS ARE USED FOR THIS COMPARISON AND THEN DISCARDED. NOTHING ABOUT THEM IS SAVED."
- **`67d67db`: the daily line composed from the sky.** The plan built a bank of fixed notification
  lines, and 160 shipped in `notifications.ts`. `web/src/lib/dailyMessage.ts` composes the line from the day's
  figure instead, so the line and the decree cannot disagree.
- **`82f921c`: the voice audit.** The audit rewrote the handoff's Rome and Egypt ruling
  phrases to meet the voice spec.
- **`c9beca0`: the decree-corpus corrections.** Two adversarial reviews found wrong deity
  charges and frames, and this commit corrected them.

## Screenshot index

All paths are under `docs/design/screenshots/phase10-verification/`. Captures are 1280 wide
unless the name says otherwise. "Seeded" means a reader with the Rome 1990-06-15 14:30 chart.

| Surface | File | State |
|---------|------|-------|
| Home, anonymous | `home-anon-rome-1280.png` | no chart, Rome |
| Home, seeded | `home-seeded-rome-1280.png` | natal modules and long-transit card |
| Cast form, empty | `reading-empty-rome-1280.png` | onboarded, no chart |
| Cast form, seeded | `reading-seeded-rome-1280.png` | editing the saved chart |
| Week | `week-rome-1280.png` | seeded |
| Season | `season-rome-1280.png` | seeded |
| Year | `year-rome-1280.png` | seeded |
| Long transits index | `transits-rome-1280.png` | seeded |
| One long transit | `transits-saturn-opposition-asc-rome-1280.png` | first id `/transits` links |
| Forecast | `forecast-rome-1280.png` | seeded |
| Charts, empty | `charts-empty-rome-1280.png` | onboarded, no chart |
| Charts, seeded | `charts-seeded-rome-1280.png` | wheel, placements, the three received |
| Synastry | `synastry-rome-1280.png` | seeded, second party not entered |
| Canaan doorway | `voices-canaan-1280-full.png` | full page, continuity section |
| Welcome | `welcome-rome-1280.png` | cleared profile |
| Sign in | `signin-rome-1280.png` | anonymous |
| Account | `account-rome-1280.png` | signed out, lands on sign-in |
| Method | `method-rome-1280.png` | names astronomy-engine |
| Matrix | `matrix-rome-1280.png` | ten bodies by five cultures |
| Learn: aspects | `learn-aspects-rome-1280.png` | the orb table |
| Not found | `not-found-rome-1280.png` | `/this-route-does-not-exist` |
| Five voices | `voices-home-{egypt,greece,canaan,carthage,rome}-1280.png` | seeded, same day |
| Responsive | `{home,week,charts-seeded,transits-saturn-opposition-asc}-rome-{375,768}.png` | seeded |

The Next dev indicator (the "N" badge, bottom left) appears in every capture. It is a dev-server
overlay and does not ship.

The reading flow ("cast and save a chart") runs through `/reading`, then `/charts`. With no
chart, `/reading` opens under "ENTER YOUR HOUR OF BIRTH" with an empty birthplace and a default
date and time (1989-08-19, 12:00) in the fields. With a saved chart, it opens under "EDITING ·
VERIFICATION" with the chart's date, time and city filled in. The seeded `/charts` capture shows
the result of a save. The seed writes the same object that `/reading` saves.

`error.tsx` renders only on a thrown error, and no route throws on demand, so this report
verifies it by reading. Its register reads "THE COMPUTATION FAILED", then "THE OMEN IS
ILLEGIBLE", a retry button "TAKE THE AUSPICES AGAIN", and a link home "YESTERDAY'S READING IS
STILL HERE".

## The five-voice check

The five captures read the same day, 2026-09-29, for the same seeded reader. Each culture
shows its own ground and accent: Egypt a warm brown ground with gold, Greece a blue-black
ground with blue, Canaan an olive-black ground with olive green, Carthage a plum ground with
violet, and Rome a red-brown ground with red. Each names its own institution in the kicker:
"THE HALL OF MA'AT", "THE DAY'S ORACLE", "THE COUNCIL OF EL", "THE DECREE OF THE TOPHET" and
"THE AUSPICES OF THE DAY". Each renders the ten bodies under its own names.

The five decrees share no sentence. `web/src/lib/decree.test.ts` asserts it in the test "five
cultures read one figure with no sentence in common", and `pnpm test:db` passes it. A search
of `web/src` for the legacy tokens (`bg-void`, `harmony-glow`, `film-grain`, `glass-panel`,
`panel-solid`, `text-gold-leaf`, `accent-glow`, `CULTURE_METALS`, `metalFor`, `GoldText`,
`GlassPanel`) finds none, and no relic token shows in the captures.

Carthage lists Baal Hammon at both Jupiter and Saturn. That is deliberate, and `/method`
documents it.

## The responsive check

`web/scripts/screenshot.mjs --report-scroll` compares `document.documentElement.scrollWidth`
with the viewport width after load.

| Page (seeded) | 375 | 768 | 1280 |
|---------------|-----|-----|------|
| `/` | 375 / 375, pass | 768 / 768, pass | pass |
| `/week` | 375 / 375, pass | 768 / 768, pass | pass |
| `/charts` | 375 / 375, pass | **1023 / 768, scrolls** | pass |
| `/transits/saturn-opposition-asc` | 375 / 375, pass | 768 / 768, pass | pass |

No page scrolls sideways at 375, which is the bar the plan set.

**Finding: the instrument pages overflow between 720 and about 1024.** `InstrumentShell`
switches to three columns at 720px with
`min-[720px]:grid-cols-[minmax(340px,360px)_1fr_minmax(380px,470px)]`. The two side columns
alone need 720px, so the centre column has no room. At 768 `/charts` measures 1023 wide,
`/synastry` 904 and `/forecast` 881. At 1024 all three fit. `charts-seeded-rome-768.png` shows
the right rail cut off and the placement names clipped. This task records the defect and does
not fix it.

## Redirects

`curl -sI` against the dev server:

| Old path | Status | `location` |
|----------|--------|------------|
| `/pantheon/rome` | 308 | `/voices/rome` |
| `/methodology` | 308 | `/method` |
| `/sign-up` | 308 | `/signin?mode=new` |
| `/wait-list` | 308 | `/waitlist` |
| `/onboarding` | 308 | `/welcome` |
| `/about` | 308 | `/method` |
| `/translation-matrix` | 308 | `/matrix` |

All seven pass. `/account` answers 200 and redirects on the client to `/signin?next=/account`
when no session exists.

## Remaining work

- Fix the 720 to 1024 overflow in `InstrumentShell`.
- The future-work rows in `docs/web-ios-android-plan.md` still stand: social features, push
  delivery for the daily line, and OS widgets.
