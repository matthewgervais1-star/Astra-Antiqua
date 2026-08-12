# Astra Antiqua Platform Plan

## Delivery status — 2026-07-12

| Plan item | Status |
|-----------|--------|
| Web reading flow (Milestone 1) | **Done.** Reading, forecast, synastry, learn, and pantheon journeys shipped; production build green. |
| Android reading flow (Milestone 1) | **Done.** Kotlin/Compose app in `android/` compiles (`compileDebugSources`); core reading experience implemented. |
| Android content + chart-math parity (Milestone 1/2) | **Done.** All five cultures including Rome (enum, deity registry, lexicon, theme, 84 Roman decrees), whole-sign houses, and the canonical aspect-orb table now match the web per [shared-content-model.md](shared-content-model.md). |
| Shared content model agreed (Milestone 1) | **Done.** Documented in [shared-content-model.md](shared-content-model.md); both surfaces stay in sync by hand against that document until a shared module exists. |
| Auth flow on web (Milestone 2) | **Done.** Email/password accounts (`jose` + `bcryptjs`), sign-up/sign-in/success onboarding funnel, account page with export and deletion. |
| Saved charts on web (Milestone 2) | **Done.** Anonymous charts live in localStorage; on sign-up they upload and thereafter mirror to the server (SQLite in dev). |
| Onboarding + PWA install (web) | **Done.** First-visit onboarding funnel, web app manifest, install icons, LAN install path (`start:lan` + `ASTRA_ALLOW_HTTP`). |
| Auth + saved charts on Android (Milestone 2) | **Deferred.** The Android app is standalone (Room storage, no backend client). Needs the shared backend contract below. |
| iOS app (Milestone 2/3) | **Deferred — blocked on tooling.** Requires macOS/Xcode; cannot be built or verified from this Windows workstation. Architecture direction below still stands. |
| Web rebrand Phase 2 ("The Instrument in the Temple") | **Done.** Full visual and structural rebrand of `web/` per [rebrand-brief.md](design/rebrand-brief.md) and the [Phase 2 handoff](design/handoff/README.md): two chassis (nave and instrument), Cinzel/Spectral/IBM Plex Mono, per-culture grounds and accents, ten bodies with designed receptions, long-transit readings, placement pages, reading feedback, the day's permissions and day-pressure modules, and the whole route map reorganized with redirects. |
| Android restyle to the new identity | **Not started.** The rebrand deliberately covered `web/` only. Android still carries the relic gold-on-black identity and the 7-planet model. |
| Android ten-body + orb-table catch-up | **Not started.** `ClassicalPlanet`, `DeityRegistry`, and `oracle_decrees.json` need the three received bodies and the corrected Greek and Canaanite deity names; `AspectType` needs the documented orb table. See divergences 6 to 8 in [shared-content-model.md](shared-content-model.md). |
| Notification delivery (web) | **Not started.** The per-culture notification corpus is authored and in the code (160 lines, one per day, user's culture only). No push infrastructure exists to deliver it. |
| PWA home-screen widgets | **Not started.** The handoff designs small and medium widgets; the OG share card ships, the widget surfaces do not. |
| Social features ("add friends") | **Out of scope, per brief.** Needs a backend social graph. |
| Shared domain extraction (Phase 4) | **Not started.** The content-model document is the agreed contract; extraction into a shared module/API remains future work. |

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
