# Astra Antiqua Website

Web surface of **Astra Antiqua**, an ancient-astrology product. The astronomical
engine renders a real computed ephemeris through the religious frameworks of
five ancient cultures: Egypt, Greece, Canaan, Carthage, and Rome. A native
Android app (`android/`, Kotlin + Jetpack Compose) reimplements the same domain
independently — the two surfaces share a domain but no code; see the repo-root
`CLAUDE.md`.

This is the product itself, not a marketing preview: anonymous and signed-in
visitors can cast and save natal charts, read synastry between two charts, pull
an annual forecast, and browse the methodology and translation matrix. It ships
a web app manifest and icon set for install-to-home-screen (`src/app/manifest.ts`,
`public/icons/`). It still carries `/wait-list`, a holdover page for visitors who
want to be told when the Android app ships.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript 5** (strict, `noUncheckedIndexedAccess: true`)
- **Tailwind CSS 4** with CSS-first `@theme` configuration
- **motion** (the official rewrite of framer-motion)
- **Zod** + **react-hook-form** + **@hookform/resolvers** for the wait-list
- **next/font/google** self-hosting Playfair Display, Cormorant Garamond, and JetBrains Mono

No CSS-in-JS. No UI library. No shadcn/ui. No Radix.

## Getting started

```bash
# one time, in any shell (writes pnpm shim to ~/.npm-global/bin if you do not have admin rights)
corepack enable --install-directory "$HOME/.npm-global/bin"
corepack prepare pnpm@latest --activate

# install + run
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build, Turbopack
pnpm start        # serve the production build
pnpm start:lan    # serve the production build on the LAN over plain HTTP (sets ASTRA_ALLOW_HTTP=1)
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint with --max-warnings 0
```

The project requires Node 24+. See `.nvmrc`.

## Project layout

```
web/
  src/
    app/                              Routes (App Router)
      layout.tsx                      Font loaders, SiteHeader, SiteFooter, AuthProvider, AuthGate
      globals.css                     Tailwind v4 @theme tokens + @utility text-gold-leaf
      manifest.ts                     PWA manifest -> /manifest.webmanifest (icons, standalone display)
      page.tsx                        Home: hero, selector, today dashboard, week, demo, method, wait-list
      about/page.tsx
      pantheon/[culture]/             Overview + /today, /reading, /forecast (SSG, 5 cultures)
      learn/                          Overview + signs, houses, house-systems, aspects, transits, rising
      reading/page.tsx                Cast a chart
      forecast/page.tsx               Annual report
      charts/page.tsx                 Saved-chart management (anonymous and signed-in)
      synastry/page.tsx               Two-chart comparison
      onboarding/, onboarding/success/  First-visit funnel for anonymous visitors
      sign-in/, sign-up/, account/    Auth
      methodology/page.tsx
      translation-matrix/page.tsx
      wait-list/page.tsx
      api/                             auth/{signup,signin,signout,me}, charts, charts/[id], me, me/export,
                                       geocode, wait-list
    components/
      layout/                         SiteHeader, SiteFooter, MobileMenu, PantheonBodyAttribute
      auth/                           AuthProvider, AuthGate, AccountChip, AuthOnboardingLayout
      onboarding/                     OnboardingFlow, SuccessState
      pantheon/                       PantheonSelector, PantheonContext, PantheonJourney, DeityCard, InterpretiveNote
      wheel/                          NatalWheel (client), wheelDraw (pure), wheelHitTest (pure), WheelTooltip
      oracle/                         OracleDecree
      daily/                          TodayDashboard, WeekForecastSection, BigThree, MoonPhasePanel, and related
      forecast/                       ForecastExperience, AnnualReportSection
      reading/                        ReadingExperience, ReadingDisplay, BirthForm
      charts/                         SaveChartPanel
      matrix/                         TranslationMatrix
      waitlist/                       WaitListForm
      glyphs/                         DeityGlyph + 5 culture path modules (35 glyphs total)
      ui/                             GoldText, GlassPanel, SectionContainer, PrintButton
    data/                             cultures, deities (35), oracleDecrees, culturalOrientations,
                                      methodologyContent (3 sections + 4 interpretive notes + sources),
                                      sampleChart (SAMPLE_CHART + aspect computation), plus zodiacSigns,
                                      houses, lifeDomains, and other per-domain content tables
    lib/                              ephemeris, houses, transits, reading, savedCharts, onboarding,
                                      pantheonPreference, waitlistSchema/waitlistStore, siteUrl, classNames,
                                      reducedMotion
    lib/auth/                         session, db, users, charts, rateLimit, origin, nextPath
    types/                            deity (Deity, DeityMatrix)
  data/                               Wait-list JSON + SQLite auth db (local dev only, gitignored)
```

## Where things live

| Need this                          | Look here                                                     |
| ---------------------------------- | ------------------------------------------------------------- |
| Add or edit a deity                | `src/data/deities.ts`                                         |
| Add or edit oracle decree copy     | `src/data/oracleDecrees.ts`                                   |
| Add or edit a glyph                | `src/components/glyphs/paths/<culture>.ts`                    |
| Change the mock chart positions    | `src/data/sampleChart.ts` (`SAMPLE_CHART`)                    |
| Tune design tokens                 | `src/app/globals.css` (`@theme` block)                        |
| Wait-list file (local dev)         | `data/wait-list.json` (gitignored)                             |
| Wait-list adapter                  | `src/lib/waitlistStore.ts`                                    |
| Validation schema                  | `src/lib/waitlistSchema.ts`                                   |
| Regenerate PWA icons                | `node scripts/generate-icons.mjs` (writes `public/icons/`)    |

## Wait-list persistence

The wait-list route at `POST /api/wait-list` uses an environment-driven storage
adapter. It selects at request time:

1. `WAITLIST_STORE=noop` -> no-op (logs the entry, returns success, does not persist).
2. `WAITLIST_FILE=<absolute path>` -> append to that JSON file.
3. `VERCEL=1` -> no-op with a one-time `console.warn`. The entry is still logged
   via `console.info` so submissions are visible in Vercel runtime logs.
   `persisted: false` is returned to the client.
4. Otherwise (local dev) -> append to `data/wait-list.json`.

The form UI is identical in all environments. A clear note appears in the
success state when `persisted: false`.

This is an intentional placeholder. The "future swap to a real backend" task
replaces only `src/lib/waitlistStore.ts`.

## Design tokens

The "Relic" aesthetic is gold on near-black. The signature gold-leaf gradient is
defined as the `text-gold-leaf` utility in `globals.css` and as a canvas linear
gradient in `wheelDraw.ts`. The same gradient is also baked into the SVG
`<linearGradient>` of each `DeityGlyph` instance.

Restrict `text-gold-leaf` to display headings (24px and above). Body copy uses
solid `text-ink-primary` so contrast is clear to a11y auditors. The utility
carries a solid `color: #d4af37` fallback for tools that cannot interpret
gradient text.

## Glassmorphism

`backdrop-filter` is expensive on mid-tier mobile. The `glass-panel` utility is
limited to at most three simultaneous instances per route. The deity grid uses
solid `bg-bg-deep` with hairline borders instead of glass.

## Reduced motion

Two layers, both active:

1. `globals.css` zeroes out CSS animation and transition durations under
   `prefers-reduced-motion: reduce`.
2. JS-driven motion (Framer Motion via `motion/react`, the canvas conjunction
   pulse, the oracle decree crossfade) reads `usePrefersReducedMotion()` from
   `src/lib/reducedMotion.ts` and skips the animated frame.

## Style gates (CI-friendly)

```bash
rg "—" src/                                                          # no em dashes
rg -i "\b(inter|roboto|harness|unlock your|discover your)\b" src/   # no banned terms
rg "framer-motion" src/                                              # must use motion/react instead
```

All three return zero matches on a clean tree.

## Known shortcuts

None. The 35 deity glyphs are all hand-authored geometric line-art per the
culture vocabulary brief (Egyptian hieroglyph-style strokes, Greek geometric
clarity, Canaanite cuneiform-inflected angularity, Punic Tanit-based geometry,
Roman legionary/augural motifs).

## Routes

| Route                          | Type         | Notes                                                |
| ------------------------------ | ------------ | ---------------------------------------------------- |
| `/`                            | static       | Hero, selector, today dashboard, week, demo, method, wait-list |
| `/about`                       | static       | "Why real astronomy" pitch for a skeptical reader     |
| `/forecast`                    | static       | Annual report + moon phases, eclipses, retrogrades, ingresses |
| `/reading`                     | static       | Cast a natal chart, save it, read it in any pantheon |
| `/charts`                      | static       | Saved-chart management (anonymous and signed-in)     |
| `/synastry`                    | static       | Two-chart comparison                                 |
| `/learn`                       | static       | Plain-language explainer: planets, signs, houses, cultures |
| `/learn/{signs,houses,house-systems,aspects,transits,rising}` | static | One topic explainer per route |
| `/onboarding`, `/onboarding/success` | static | First-visit funnel shown once to anonymous visitors entering `/reading`, `/charts`, `/forecast`, or `/synastry` |
| `/sign-in`, `/sign-up`         | static       | Auth                                                 |
| `/account`                     | static       | Display name, password, data export, deletion       |
| `/pantheon/[culture]`          | SSG (5 pages) | Overview: deities, oracle decree, interpretive notes. `generateStaticParams` (culture layout) over the five cultures |
| `/pantheon/[culture]/today`    | SSG (5 pages) | Today + week, read in that pantheon's voice          |
| `/pantheon/[culture]/reading`  | SSG (5 pages) | Cast/read a chart with the pantheon fixed (no selector) |
| `/pantheon/[culture]/forecast` | SSG (5 pages) | Annual forecast with the pantheon fixed (no selector) |
| `/methodology`                 | static       | Methodology page                                     |
| `/translation-matrix`          | static       | 7x5 interactive table                                |
| `/wait-list`                   | static       | Long-form pitch + form for the Android launch        |
| `/manifest.webmanifest`        | generated    | PWA manifest from `src/app/manifest.ts`; icons in `public/icons/` |
| `/api/auth/{signup,signin,signout,me}` | dynamic | Email/password auth                                  |
| `/api/charts`, `/api/charts/[id]` | dynamic    | Authenticated chart CRUD                             |
| `/api/me`                      | dynamic      | PATCH (name, password), DELETE (account)             |
| `/api/me/export`               | dynamic      | JSON export of account + saved charts                |
| `/api/geocode`                 | dynamic      | OSM Nominatim proxy with caching + rate limiting    |
| `/api/wait-list`               | dynamic      | POST only, file-backed in dev, no-op + log on Vercel |

## Environment variables

| Var | Required | Purpose |
| --- | --- | --- |
| `AUTH_SECRET` | yes in production | JWT signing secret. Must be at least 16 characters. The app **refuses to start** in production without it. Generate with `openssl rand -base64 32`. |
| `AUTH_DB_PATH` | no | Absolute path to the SQLite file. Defaults to `./data/astra-antiqua.sqlite`. For production, swap the DB driver (see below) and ignore this. |
| `WAITLIST_FILE` | no | Absolute path to the wait-list JSON file. Defaults to `./data/wait-list.json`. |
| `WAITLIST_STORE` | no | Set to `noop` to log entries only without writing anywhere. Used in environments where filesystem writes are not desired. |
| `NODE_ENV` | usually set by host | When `production`, enforces `AUTH_SECRET` presence and enables `Secure` cookies. |
| `ASTRA_ALLOW_HTTP` | no | Set to `1` **only for home-LAN installs served over plain HTTP** (the `start:lan` script sets it). Disables the `Secure` flag on session cookies so sign-in works without TLS. **Never set this on an internet-facing deploy** — it downgrades session cookies to plaintext-transmittable. |

## Security

The app ships with defense-in-depth defaults:

- **`AUTH_SECRET` hard-required in production.** The session module throws at boot if it is unset or shorter than 16 characters.
- **HTTP security headers** set by `next.config.ts`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera/mic/geolocation/payment, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, and a same-origin Content-Security-Policy.
- **Origin/Referer check** on every state-changing API route (`POST`, `PATCH`, `DELETE`) in addition to the `SameSite=Lax` cookie default.
- **Rate limiting** per IP on `/api/auth/signin` (20/min), `/api/auth/signup` (5/hour), `/api/geocode` (60/min). In-memory sliding window; swap to Redis for multi-instance production.
- **Login throttling** per email address: 5 consecutive failures within 15 minutes triggers a 15-minute lockout. Successful sign-in clears the counter.
- **Constant-time login.** When the email does not exist, the auth flow still runs a dummy `bcrypt.compare` so an attacker cannot probe whether an email is registered by timing.
- **Session cookie** is `HttpOnly`, `SameSite=Lax`, and `Secure` when `NODE_ENV=production` (unless `ASTRA_ALLOW_HTTP=1`, the documented home-LAN escape hatch — see Environment variables). 30-day expiry, signed with HS256.
- **Password hashing** via `bcryptjs`, cost factor 11.
- **Prepared statements** everywhere SQL is run (no string concatenation), so SQL injection is not reachable.
- **Account deletion** cascades via the foreign key from `charts(user_id) → users(id)`. The session cookie is cleared as part of the same response.
- **Data export.** GDPR-shaped JSON dump available at `/api/me/export` for any signed-in user.

Known security work still to do (not in this build):

- Email verification on sign-up. Needs an email service (Resend, Postmark, etc.).
- Password reset flow. Same dependency.
- Server-side session revocation list. Currently a stolen JWT is usable until its 30-day expiry; rotating `AUTH_SECRET` invalidates all sessions at once.
- 2FA / TOTP.
- OAuth (Google, Apple, GitHub). Each provider account to be configured in their respective consoles.
- A real database in production (the SQLite driver does not survive serverless cold starts; see below).

## Deployment

**Vercel (or any serverless host):** SQLite via `better-sqlite3` will not persist data across cold starts on serverless platforms. Before deploying:

1. **Swap the DB layer.** `src/lib/auth/db.ts` and `src/lib/auth/charts.ts` (plus the relevant lines of `src/lib/auth/users.ts`) are the only files that touch SQLite directly. Replace them with a Postgres-backed implementation (Neon, Supabase, Vercel Postgres) using the same schema:
   ```sql
   CREATE TABLE users (id text primary key, email text unique not null, password_hash text not null, display_name text, created_at bigint not null);
   CREATE TABLE charts (id text primary key, user_id text not null references users(id) on delete cascade, name text not null, relationship text not null, date text not null, time text not null, city_label text not null, latitude double precision not null, longitude double precision not null, is_primary integer not null default 0, created_at bigint not null);
   CREATE INDEX charts_user_id_idx ON charts (user_id);
   ```
2. **Set `AUTH_SECRET`** to a strong random value (`openssl rand -base64 32`). The app will refuse to start without it.
3. **Set the wait-list adapter.** Either leave it as the no-op (entries log to runtime logs only) or wire it to a real backend in `src/lib/waitlistStore.ts`.
4. **Move rate-limiter state to Redis** (Upstash works well with Vercel) if you expect multi-instance traffic. The current in-memory map is process-local.
5. Push the `web/` directory as the project root. No `vercel.json` required.

**Self-hosted (single instance):** the defaults work as-is. SQLite, in-memory rate limiter, file-backed wait-list all behave correctly. Run behind a reverse proxy (Caddy, nginx) that terminates TLS so the `Secure` cookie flag has effect.
