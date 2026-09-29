# Astra Antiqua Platform Plan

## Delivery status, 2026-09-29

Checked against the tree on 2026-09-29. This table replaces the 2026-07-12 one,
which git history keeps.

| Plan item | Status |
|-----------|--------|
| Web reading flow (Milestone 1) | **Done.** Reading, forecast, synastry, learn and pantheon journeys ship; the production build is green. |
| Android reading flow (Milestone 1) | **Done.** 18 screens in `android/`, walked on a Pixel 9 emulator (see [design/IMPLEMENTATION.md](design/IMPLEMENTATION.md)). |
| Android content + chart-math parity (Milestone 1/2) | **Done.** Five cultures, ten bodies, whole-sign houses and the documented orb table, per [shared-content-model.md](shared-content-model.md). |
| Shared content model (Milestone 1) | **Done.** `cd web && npm run export:content` generates `shared/content/*.json`. Android reads it as a build-time asset and the C# core embeds it. |
| Auth flow on web (Milestone 2) | **Done.** Email/password accounts (`jose` + `bcryptjs`), the sign-up and sign-in funnel, and an account page with export and deletion. |
| Saved charts on web (Milestone 2) | **Done.** One chart per account since `8796ef7`, stored in Postgres. Synastry enters the second party for the reading and never stores it. |
| Onboarding + PWA install (web) | **Done.** First-visit onboarding, a web app manifest, install icons and the LAN install path (`start:lan` + `ASTRA_ALLOW_HTTP`). There is no service worker. |
| Auth + saved charts on Android (Milestone 2) | **Not started.** It needs a deployed backend, and deploying one is an owner decision. Android keeps one chart on the device in Room. |
| iOS app (Milestone 2/3) | **Partial.** A .NET MAUI head (`dotnet/AstraAntiqua.App`) with one page and no reading flow; `.github/workflows/ios.yml` builds it on a macOS runner. The chart core under it (`dotnet/AstraAntiqua.Core`) passes 39 tests, golden parity with web's own output among them. |
| Web rebrand Phase 2 ("The Instrument in the Temple") | **Done.** The visual and structural rebrand of `web/` per [rebrand-brief.md](design/rebrand-brief.md) and the [Phase 2 handoff](design/handoff/README.md): two chassis, the new type and per-culture grounds, ten bodies, long transits and the reorganized route map. |
| Android restyle to the new identity | **Done.** The design system (`e0eb763`) and every screen on it (`5837c7b`), then the deity glyphs, emblems and brand marks per [design/IMPLEMENTATION.md](design/IMPLEMENTATION.md). |
| Android ten-body + orb-table catch-up | **Done.** `c1cfac3` widens the body enum to ten, `b598060` renames it `Planet`, and `AspectType` runs the documented orb table. |
| Notification delivery (web) | **Not started.** No push infrastructure exists. The fixed 160-line corpus is gone: `67d67db` replaced it with `web/src/lib/dailyMessage.ts`, which composes the day's line from the sky. |
| PWA home-screen widgets | **Not started.** The handoff designs small and medium widgets; the OG share cards ship, the widget surfaces do not. |
| Social features ("add friends") | **Out of scope, per brief.** Needs a backend social graph. |
| Shared domain extraction (Phase 4) | **Partial.** Content is shared through `shared/content`. The chart rules are still written three times, in TypeScript, Kotlin and C#, and golden tests pin them to each other. |
| CI | **Done.** `.github/workflows/web.yml` and `android.yml` (`14b8d37`, `60ba2ec`) join `ios.yml`, so every surface builds and tests when a push touches its paths. |
| Verification evidence | **Done.** 41 screenshots in `docs/design/screenshots/phase10-verification/` and the rebrand's final report, [web-rebrand-report.md](web-rebrand-report.md) (`a8d6cbe`, `cb73ec8`). |

## Overview

Astra Antiqua is currently structured as a web experience plus an Android app, with the same domain concepts implemented independently in each surface. The next step is to formalize a shared delivery plan for web, iOS, and Android so the product can scale without duplicating effort unnecessarily.

## Goals

- Deliver a consistent astrology experience across web, iOS, and Android.
- Preserve the current content model and editorial quality already established in the web experience.
- Keep platform-specific implementations isolated where needed, while sharing reusable domain logic where practical.
- Prepare a path for authentication, saved charts, and reading features across all surfaces.

## Current State

- Web: Next.js + React + TypeScript marketing and app experience.
- Android: Kotlin + Jetpack Compose app with domain and UI layers.
- iOS: Not yet implemented; needs a native SwiftUI foundation.
- Shared concepts already exist in both codebases and must remain in sync by hand until a shared core is introduced.

## Recommended Product Scope

### Phase 1 — Foundation

- Finalize the shared feature set for MVP:
  - natal chart entry
  - chart rendering
  - sign and house interpretation
  - saved charts
  - sign-in and account basics
- Define the shared content model for:
  - zodiac signs
  - houses
  - cultures and deities
  - oracle decrees
  - interpretation rules
- Establish a design system and component vocabulary for all platforms.

### Phase 2 — Web and Android Parity

- Stabilize the web experience around the core reading flow.
- Finish Android feature parity for the core astrology experience.
- Standardize copy, terminology, and content structure between platforms.

### Phase 3 — iOS Delivery

- Build an iOS app in SwiftUI with the same core user journeys.
- Reuse the same domain data structure and business rules where possible.
- Integrate the same authentication and chart storage flows.

### Phase 4 — Cross-Platform Hardening

- Add offline support where relevant.
- Improve analytics, crash reporting, and performance monitoring.
- Introduce a shared backend contract for auth, charts, and user data.

## Architecture Direction

### Web

- Keep Next.js as the primary web surface.
- Continue using the existing app-router structure and content-driven data layer.
- Use the web experience for marketing, preview, and user acquisition.

### Android

- Continue with Kotlin and Jetpack Compose.
- Keep the current MVVM-style structure and domain separation.
- Reuse the same charts and interpretation rules as the web experience where practical.

### iOS

- Build with SwiftUI and Combine or Swift Concurrency.
- Mirror the Android architecture patterns at the feature level.
- Use the same API contract and data models as the other platforms.

## Shared Domain Strategy

The current approach of keeping concepts in sync by hand is workable for early delivery but should be treated as temporary. The medium-term goal should be to extract a shared domain layer for:

- chart calculation rules
- zodiac and house logic
- reading interpretation rules
- cultural and deity content

A practical path is:

1. Keep platform-specific UI layers separate.
2. Move shared rules into a common module or API contract.
3. Treat content data as structured JSON or typed schema shared by all platforms.

## Backend Requirements

The app will need a consistent backend for:

- authentication
- saved chart storage
- user preferences
- account management
- future syncing across devices

Recommended backend priorities:

- Auth and user profile endpoints
- Chart CRUD endpoints
- Export and deletion flows
- Rate limiting and abuse protection

## Delivery Milestones

### Milestone 1

- Web reading flow polished
- Android reading flow polished
- Shared content model agreed

### Milestone 2

- iOS MVP scaffold delivered
- Auth flow available on all surfaces
- Saved charts available on all surfaces

### Milestone 3

- Feature parity across web, iOS, and Android
- Performance and reliability improvements completed
- Analytics and feedback loops enabled

## Risks and Decisions

- Shared domain extraction will take time; it should be phased rather than attempted all at once.
- The web and Android repos currently diverge in implementation style, so a shared design system is important.
- iOS should not be treated as an afterthought; the product experience should be consistent from the start.
- Any new shared module should preserve the product’s editorial tone and astrological accuracy.

## Definition of Done

The platform plan is complete when:

- web, iOS, and Android have a shared MVP feature set
- the core astrology flow is usable on each platform
- the content and interpretation model are documented and maintainable
- the team has a clear path for future shared infrastructure and backend work
