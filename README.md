# Astra Antiqua Website

Marketing and preview website for **Astra Antiqua**, an ancient-astrology mobile app
in development for Android. The astronomical engine renders standard ephemeris
calculations through the religious frameworks of four ancient cultures: Egypt,
Greece, Canaan, and Carthage.

The website ships before the app and serves as the wait-list capture mechanism,
the methodology explainer for a scholarly-skeptical audience, and the visual
demonstration of the four-pantheon translation matrix.

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
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint with --max-warnings 0
```

The project requires Node 24+. See `.nvmrc`.

## Project layout

```
website/
  src/
    app/                              Routes (App Router)
      layout.tsx                      Font loaders, SiteHeader, SiteFooter
      globals.css                     Tailwind v4 @theme tokens + @utility text-gold-leaf
      page.tsx                        Home: hero, selector, wheel, oracle, CTA
      pantheon/[culture]/page.tsx     Dynamic pantheon page (4 SSG)
      methodology/page.tsx
      translation-matrix/page.tsx
      wait-list/page.tsx
      api/wait-list/route.ts          POST, Node runtime, dynamic
    components/
      layout/                         SiteHeader, SiteFooter
      pantheon/                       PantheonSelector, DeityCard, InterpretiveNote
      wheel/                          NatalWheel (client), wheelDraw (pure), wheelHitTest (pure), WheelTooltip
      oracle/                         OracleDecree
      matrix/                         TranslationMatrix
      waitlist/                       WaitListForm
      glyphs/                         DeityGlyph + 4 culture path modules (28 glyphs total)
      ui/                             GoldText, GlassPanel, SectionContainer
    data/                             cultures, deities (28), oracleDecrees, culturalOrientations,
                                      methodologyContent (5 sections + 4 interpretive notes + sources),
                                      sampleChart (SAMPLE_CHART + aspect computation)
    lib/                              waitlistSchema (Zod), waitlistStore (adapter), classNames, reducedMotion
    types/                            deity (Deity, DeityMatrix)
  data/                               Wait-list JSON output (local dev only, gitignored)
```

## Where things live

| Need this                          | Look here                                                     |
| ---------------------------------- | ------------------------------------------------------------- |
| Add or edit a deity                | `src/data/deities.ts`                                         |
| Add or edit oracle decree copy     | `src/data/oracleDecrees.ts`                                   |
| Add or edit a glyph                | `src/components/glyphs/paths/<culture>.ts`                    |
| Change the mock chart positions    | `src/data/sampleChart.ts` (`SAMPLE_CHART`)                    |
| Tune design tokens                 | `src/app/globals.css` (`@theme` block)                        |
| Wait-list file (local dev)         | `website/data/wait-list.json` (gitignored)                    |
| Wait-list adapter                  | `src/lib/waitlistStore.ts`                                    |
| Validation schema                  | `src/lib/waitlistSchema.ts`                                   |

## Wait-list persistence

The wait-list route at `POST /api/wait-list` uses an environment-driven storage
adapter. It selects at request time:

1. `WAITLIST_STORE=noop` -> no-op (logs the entry, returns success, does not persist).
2. `WAITLIST_FILE=<absolute path>` -> append to that JSON file.
3. `VERCEL=1` -> no-op with a one-time `console.warn`. The entry is still logged
   via `console.info` so submissions are visible in Vercel runtime logs.
   `persisted: false` is returned to the client.
4. Otherwise (local dev) -> append to `website/data/wait-list.json`.

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
rg "—" website/src/                                                          # no em dashes
rg -i "\b(inter|roboto|harness|unlock your|discover your)\b" website/src/   # no banned terms
rg "framer-motion" website/src/                                              # must use motion/react instead
```

All three return zero matches on a clean tree.

## Known shortcuts

None. The 28 deity glyphs are all hand-authored geometric line-art per the
culture vocabulary brief (Egyptian hieroglyph-style strokes, Greek geometric
clarity, Canaanite cuneiform-inflected angularity, Punic Tanit-based geometry).

## Routes

| Route                          | Type         | Notes                                                |
| ------------------------------ | ------------ | ---------------------------------------------------- |
| `/`                            | static       | Hero, selector, wheel, oracle, methodology teaser, CTA |
| `/pantheon/[culture]`          | SSG (4 pages) | `generateStaticParams` over the four cultures        |
| `/methodology`                 | static       | 5 sections, 4 interpretive notes, source bibliography |
| `/translation-matrix`          | static       | 7x4 interactive table with planet and pantheon filters |
| `/wait-list`                   | static       | Long-form pitch + form                               |
| `/api/wait-list`               | dynamic      | Node runtime, POST only                              |

## Deployment

Zero-config Vercel deployment. No `vercel.json` required. Push the `website/`
directory as the project root.
