# Astra Antiqua Website

Web surface of **Astra Antiqua**, an ancient-astrology product. The astronomical
engine renders a real computed ephemeris through the religious frameworks of
five ancient cultures: Egypt, Greece, Canaan, Carthage, and Rome. A native
Android app (`android/`, Kotlin + Jetpack Compose) reimplements the same domain
independently — the two surfaces share a domain but no code; see the repo-root
`CLAUDE.md`.

This is the product itself, not a marketing preview: anonymous and signed-in
visitors read the day, the week, the season, and the year in their chosen
culture's voice, cast and save natal charts, read one placement at length, weigh
two charts against each other, follow a long transit across its whole span, and
browse the method and the translation matrix. It ships a web app manifest and
icon set for install-to-home-screen (`src/app/manifest.ts`, `public/icons/`).
`/waitlist` collects names for the Android launch.

The visual identity is documented under **Design tokens** below; the design
contract it was built from lives in `docs/design/handoff/`.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript 5** (strict, `noUncheckedIndexedAccess: true`)
- **Tailwind CSS 4** with CSS-first `@theme` configuration
- **motion** (the official rewrite of framer-motion)
- **Zod** + **react-hook-form** + **@hookform/resolvers** for the wait-list
- **next/font/local** serving committed woff2 files (Cinzel, Spectral, IBM Plex Mono) from `src/fonts/`; refetch with `node scripts/fetch-fonts.mjs` only when families/weights change. Not next/font/google: its parallel build-time fetch burst gets connection-reset on some networks and breaks the build. A Cinzel TTF also ships for the OG card, since Satori cannot read woff2.

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
      layout.tsx                      Font loaders, AuthProvider, PantheonProvider, AuthGate
      globals.css                     Tailwind v4 @theme tokens + per-culture ground/accent
      manifest.ts                     PWA manifest -> /manifest.webmanifest
      opengraph-image.tsx             The share card (Satori, Cinzel TTF)
      page.tsx                        The day
      week/, season/, year/           The other three horizons
      transits/, transits/[id]/       Long-transit readings
      reading/                        Cast a chart
      charts/, charts/[id]/[body]/    The natal instrument and placement readings
      synastry/, forecast/            The other two instruments
      voices/, voices/[culture]/      The five doorways and journeys (SSG)
      matrix/, method/, learn/        Reference surfaces
      welcome/, signin/, account/     Funnel and the record (neutral ground)
      waitlist/                       The roll
      error.tsx, not-found.tsx        The illegible omen and the unmapped sky
      api/                            auth/{signup,signin,signout,me}, charts, charts/[id], me,
                                      me/export, geocode, wait-list
    components/
      chrome/                         The two chassis: Lintel, SubBar, CultureChip, CultureGate,
                                      HorizonControl, NaveShell, NaveHead, InstrumentShell,
                                      SectionDivider, Votive, FeedbackRow, MethodFooter, OrbBar,
                                      SpanBar, Skeleton, WheelSvg, ReceptionNote
      home/                           The day's grid, rails, and the two natal modules
      horizons/                       Week, season, and year naves
      transits/                       Long-transit index, detail, and spine templates
      charts/, reading/               Instrument, placements, cast flow
      synastry/, forecast/            Instruments
      voices/                         Journey islands
      welcome/                        Funnel steps
      auth/                           AuthProvider, AuthGate, AccountChip
      pantheon/                       PantheonContext (culture resolution)
      matrix/, waitlist/              TranslationMatrix, WaitListForm
    data/                             cultures (10 bodies), deities (50), cultureVoice, aspectRulings,
                                      transitSpine, notifications, permissionsRegister, planetInSign
                                      (120), aspectReadings (45 pairs), yearNarrative, oracleDecrees,
                                      methodologyContent, zodiacSigns, houses, and related tables
    lib/                              ephemeris, houses, transits, transitSpans, reading,
                                      personalReading, weekReading, permissions, dayPressure,
                                      savedCharts, feedback, onboarding, pantheonPreference,
                                      waitlistSchema/waitlistStore, siteUrl, classNames, reducedMotion
    lib/auth/                         session, db, users, charts, rateLimit, origin, nextPath
    types/                            deity (Deity, DeityMatrix)
  scripts/                            fetch-fonts.mjs, generate-icons.mjs, check-gates.mjs
  data/                               Wait-list JSON + SQLite auth db (local dev only, gitignored)
```

## Where things live

| Need this                          | Look here                                                     |
| ---------------------------------- | ------------------------------------------------------------- |
| Add or edit a deity                | `src/data/deities.ts` (50 records, 5 cultures x 10 bodies)     |
| Add or edit oracle decree copy     | `src/data/oracleDecrees.ts`                                   |
| Rename a surface per culture       | `src/data/cultureVoice.ts` (titles, structures, house groups) |
| Edit an aspect ruling              | `src/data/aspectRulings.ts` (5 x 5)                           |
| Edit long-transit prose            | `src/data/transitSpine.ts` (5 cultures x 5 slow bodies)       |
| Edit a daily notification line     | `src/data/notifications.ts` (32 per culture)                  |
| Edit the day's permission items    | `src/data/permissionsRegister.ts`                             |
| Change the orb table               | `src/data/sampleChart.ts` (`ASPECT_RULES`, published on `/method`) |
| Change the mock chart positions    | `src/data/sampleChart.ts` (`SAMPLE_CHART`)                    |
| Tune design tokens                 | `src/app/globals.css` (`@theme` block)                        |
| Change the shared chassis          | `src/components/chrome/`                                      |
| Run the style gates                | `npm run gates`                                               |
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

The identity is "The Instrument in the Temple": a lapidary reading surface on a
flat, culture-tinted ground, with a single muted accent per culture. The whole
scheme shifts with the active culture. Tokens live in the `@theme` block of
`globals.css`; the same values are mirrored in `src/data/palettes.ts` for the
few places that need them in JS.

| Culture | Ground | Accent |
|---------|--------|--------|
| Egypt | `#1A1712` | `#B59A55` gold |
| Greece | `#171A1C` | `#7C93A6` aegean |
| Canaan | `#1A1813` | `#8A9268` cedar |
| Carthage | `#191218` | `#94648C` Tyrian purple |
| Rome | `#1B1410` | `#A5544A` Pompeian red |
| (neutral) | `#171310` | `#B59A55` |

Neutral ground is used only where no culture is presumed: `/welcome`,
`/signin`, `/account`, `/waitlist`, and the error states.

Inks: bone `#E6DECC`, prose `#D9D1BF`, dim `#9A917D`, faint `#6F6B60`. Signals:
harmony `#B59A55`, conflict `#B56B71` (also retrograde values and destructive
actions). Rules are `rgba(230,222,204,.16)`, row rules `.11`.

Runtime CSS variables `--ground` and `--accent` are set per culture by
`body[data-pantheon="..."]`, so components reference `var(--accent)` rather
than any specific hex.

## Geometry

Hard rules, enforced by eye and by review:

- `border-radius: 0` everywhere. No shadows. No gradients. No `backdrop-filter`.
- Rules are 1px only. Accent-tinted borders use `color-mix` at 48% of the accent.
- Mono microcopy floors at 11px, even where the design mocks show 9.5 to 10px.

## Type

Cinzel (`font-display`) for display and caps, letter-spacing .06 to .3em.
Spectral (`font-body`) for prose, 15 to 18px at 1.65 to 1.75 line-height.
IBM Plex Mono (`font-mono`) for data and microcopy, letter-spacing .06 to .22em.

## Reduced motion

Two layers, both active:

1. `globals.css` zeroes out CSS animation and transition durations under
   `prefers-reduced-motion: reduce`.
2. JS-driven motion (via `motion/react`, and the canvas conjunction pulse where
   it survives) reads `usePrefersReducedMotion()` from `src/lib/reducedMotion.ts`
   and skips the animated frame.

The rebrand removed nearly all motion: progress bars render static, page
transitions are at most a 200ms opacity fade.

## Style gates

```bash
npm run gates
```

Scans `src/` for em dashes, banned terms (`inter`, `roboto`, `harness`,
"unlock your", "discover your"), `framer-motion` imports, backdrop filters
(`backdrop-filter`, the `backdropFilter` style key, Tailwind `backdrop-blur`),
and radius: `border-radius` or a corner longhand other than `0`, `0px` or
`0 !important`, a non-zero `borderRadius` style key, and any Tailwind
`rounded` class except `rounded-none`. It exits non-zero with a `file:line`
list. Run it alongside `npm run typecheck` and
`npm run lint` before every commit.

## Routes

| Route                          | Type         | Notes                                                |
| ------------------------------ | ------------ | ---------------------------------------------------- |
| `/`                            | static       | The day: ephemeris rail, the decree, aspects in orb, the active long transit, plus the day's permissions and where the day falls |
| `/week`                        | static       | Seven days, per-culture structure (Rome flags days F/N/C) |
| `/season`                      | static       | The current zodiac season, spine reading + the season's sky |
| `/year`                        | static       | The year, structured per culture (3 river seasons, festival circuit, 2 rain halves, open/closed sea, 4 quarters) |
| `/transits`, `/transits/[id]`  | static       | Long-transit readings scoped to the transit's real span |
| `/reading`                     | static       | Cast a natal chart and save it                       |
| `/charts`                      | static       | The natal instrument: placements, wheel, saved charts |
| `/charts/[id]/[body]`          | static       | One placement read at length                         |
| `/synastry`                    | static       | Two charts weighed                                   |
| `/forecast`                    | static       | Stations, twelve-month spans, long-transit cards     |
| `/voices`, `/voices/[culture]` | SSG (5 pages) | The five doorways and their journeys. Canaan carries the continuity passage |
| `/matrix`                      | static       | The 10x5 translation matrix                          |
| `/method`                      | static       | How the sky is computed, including the reception statement |
| `/learn`                       | static       | Plain-language explainers                            |
| `/learn/{signs,houses,house-systems,aspects,transits,rising}` | static | One topic each; `/learn/aspects` is the per-culture glossary |
| `/welcome`                     | static       | Three-step funnel: culture, birth details, account. All skippable |
| `/signin`                      | static       | Email and password, both modes                       |
| `/account`                     | static       | The record: culture, counts, sign out, strike the record |
| `/waitlist`                    | static       | The roll                                             |
| `/manifest.webmanifest`        | generated    | PWA manifest from `src/app/manifest.ts`; icons in `public/icons/` |
| `/api/auth/{signup,signin,signout,me}` | dynamic | Email/password auth                                  |
| `/api/charts`, `/api/charts/[id]` | dynamic    | Authenticated chart CRUD                             |
| `/api/me`                      | dynamic      | PATCH (name, password), DELETE (account)             |
| `/api/me/export`               | dynamic      | JSON export of account + saved charts                |
| `/api/geocode`                 | dynamic      | OSM Nominatim proxy with caching + rate limiting    |
| `/api/wait-list`               | dynamic      | POST only, file-backed in dev, no-op + log on Vercel |

Redirects in `next.config.ts` keep every pre-rebrand URL working: the pantheon
journeys map onto `/voices` and the shared horizons with a `?culture=` param,
and `/about`, `/methodology`, `/translation-matrix`, `/onboarding`, `/sign-in`,
`/sign-up`, and `/wait-list` all point at their replacements.

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
