# Shared Content Model

The contract for the domain content that every Astra Antiqua surface (web today,
Android today, iOS later) must agree on. The two codebases implement this model
independently and are kept in sync **by hand**; this document is the arbiter when
they disagree. Until a shared module or content API exists, **the web
implementation (`web/src/data/*.ts`) is the source of truth for content**, and
`web/src/lib/*.ts` is the source of truth for interpretation rules.

**The canonical column now has a generated JSON form.** `shared/content/*.json`
is exported from the web data by `cd web && npm run export:content` (cultures,
planets, deities, planet-in-sign, houses, zodiac signs, the orb table). The C#
core (`dotnet/AstraAntiqua.Core`) embeds it and Android reads it as a build-time
asset, so all three surfaces consume one generated corpus. The JSON is generated output — never hand-edit
it, and regenerate it whenever web content changes. `npm run export:goldens`
regenerates the chart-parity fixtures the C# tests assert against.

## Canonical vocabulary

| Concept | Canonical set | Web | Android |
|---------|---------------|-----|---------|
| Cultures | **5**: egypt, greece, canaan, carthage, rome | `CULTURES` in `cultures.ts` | `AncientCulture` enum ✓ |
| Bodies | **10**: the classical seven + Uranus, Neptune, Pluto as received bodies | `PLANETS` in `cultures.ts` (+ `RECEIVED_BODIES`, `isReceived`) | `ClassicalPlanet` enum, 10 with `isReceived` ✓ |
| Zodiac signs | **12**, with element, modality, traits, date range | `ZODIAC_SIGN_INFO` in `zodiacSigns.ts` | `ZodiacSign` enum (names only) |
| Houses | **12**, whole-sign, each with title/domain/arena | `HOUSE_MEANINGS` in `houses.ts` | `HouseMeanings` in `domain/HouseMeanings.kt` ✓ (ported verbatim) |
| Aspect kinds | **5**: conjunction, sextile, square, trine, opposition | `AspectKind` in `sampleChart.ts` | `AspectType` enum, kinds and orbs match ✓ |
| Life domains | **5**: self, bonds, work, fortune, spirit | `LIFE_DOMAINS` in `lifeDomains.ts` | none |

## Deity model

One deity per (culture × body) — **50 records** (5 × 10). Canonical shape (web
`types/deity.ts`):

```
Deity { planet, culture, name, epithet, note, contested? }
```

- Source of truth: `DEITIES` in `web/src/data/deities.ts` (+ one myth line per
  deity in `deityInscriptions.ts`, one aspect-verb table per culture in
  `aspectVerbs.ts`).
- Android holds the same identities, reduced to `{name, epithet}`, in
  `model/DeityRegistry.kt` — the single Android source of truth for all five
  cultures, ported from web. `data/DeityManager.getDeity` and
  `domain/LexiconDictionary.culturalVoices` both read from it rather than
  duplicating names. The denormalized `assets/oracle_decrees.json` that used to
  bake its own copies of every pantheon is retired; Android reads
  `shared/content/deities.json` instead, and a parity test asserts
  `DeityRegistry` agrees with it record for record, so a deity change on web
  reaches Android by regeneration rather than by hand.

## Interpretation model

The two surfaces currently model placement text differently:

- **Web (canonical going forward):** placement meaning is *universal* text —
  `PLANET_IN_SIGN` (10 × 12 = 120 paragraphs) — and the active culture is a
  *render-time mask*: deity names, epithets, aspect verbs, and cultural register
  are layered on top when displayed. Content grows linearly (120 + 50 + 25 …).
- **Android:** the same model, reading the same generated files. The
  denormalized 420-record corpus is retired, so content no longer grows
  multiplicatively on this surface either.

New content must follow the web model.

**Product principle, either way:** the universal layer carries the
placement's core astrological meaning, and the cultural layer must be
culturally substantive: each culture's own theology, institutions, imagery,
and register, not merely a different deity name on the same sentence.
Whether that is achieved by masking rich per-culture fragments (web) or by
fully authored per-culture prose (the decree corpus), the five readings must
feel native to their cultures while agreeing on what the placement means.

Web-only interpretive banks (no Android counterpart yet; they become shared
content when Android gains those features): placement text (`PLANET_IN_SIGN`,
10 × 12 = 120 paragraphs), aspect readings (45 pairs × 3 tones = 135), year
narrative (83 entries), aspect rulings (5 cultures × 5 kinds = 25),
deity charges (5 × 10 = 50) with aspect frames (25 rulings, 25 exact-only
instructions, 5 ingress frames) that the decree, the week lines and the daily
message are composed from, the permissions register, the long-transit
spine bank (5 cultures × 5 slow bodies), the culture voice config (surface
names and structural variants), domain readings (15), week readings (12),
planet areas/domains, sign registers, aspect reflections, pair themes,
cultural orientations, methodology sources.

Android-only vocabulary (needed by any future shared schema): per-culture UI
lexicon — menu titles, officer roles, priest titles, aspect labels
(`LexiconDictionary`).

## Chart-math rules

| Rule | Canonical | Web | Android |
|------|-----------|-----|---------|
| House system | **Whole-sign** (Hellenistic; stated publicly on the learn pages) | `lib/houses.ts` ✓ | Whole-sign (`CalculateNatalChartUseCase.wholeSignHouseCusps`) ✓ |
| Aspect orbs | **conjunction 8°, opposition 8°, square 7°, trine 7°, sextile 5°** (the one documented table, published on `/method`) | `ASPECT_RULES` in `data/sampleChart.ts`, read by natal, transit, and synastry detection ✓ | `AspectType` in `NatalChartData.kt`, same table ✓ |
| Ephemeris | astronomy-engine (same upstream: cosinekitty/astronomy) | npm package | JAR ✓ |
| degree → sign | 30° blocks from 0° Aries | `longitudeToSign()` | `ZodiacUtils` ✓ |

The web values are canonical because the site's methodology pages document them
as product commitments (whole-sign houses are named on `/learn`).

## Known divergences (reconciliation backlog)

1. ~~Rome is missing from Android~~ — resolved: `AncientCulture.ROME`,
   `model/DeityRegistry.kt` (Roman deities), `DeityManager.getOracleTitle`,
   `LexiconDictionary.Roman`, the Roman theme, and a full ROMAN column in
   `assets/oracle_decrees.json` (84 records, meanings grounded in the web's
   `PLANET_IN_SIGN`) all exist and match the web content.
2. ~~House systems differ (whole-sign vs Placidus)~~ — resolved: Android now
   computes whole-sign cusps from the Ascendant in `CalculateNatalChartUseCase`
   (the Placidus routines remain in `AstronomyEngine.kt`, unused).
3. ~~Aspect orbs differ~~ — resolved: Android's `AspectType` orbs now match
   `ASPECT_RULES` in `lib/transits.ts`.
4. ~~Deity data triplicated on Android~~ — reduced to one source of truth:
   `model/DeityRegistry.kt` now holds every (culture x planet) identity for
   all five cultures; `data/DeityManager.kt` and
   `domain/LexiconDictionary.kt`'s `culturalVoices` read from it instead of
   duplicating names. `assets/oracle_decrees.json` still bakes in its own
   copies of all five pantheons' names and prose — that collapses into one
   place only when it migrates to the universal model.
5. **Android lacks** transits, synastry, forecast, and the whole
   reading-composition layer; web lacks Android's per-culture UI lexicon.
   (House meanings are ported and rendered on the decree cards.)
6. ~~Planned: the system expands from 7 to 10 bodies~~ — **shipped on web**
   (rebrand Phase 2). Uranus, Neptune, and Pluto are first-class bodies with
   a named reception in every culture (Nut/Ouranos/Shamem/Baal Shamem/Caelus,
   Nun/Poseidon/Yammu/Yam/Neptunus, Osiris/Plouton/Motu/Mot/Dis Pater), each
   carrying a note that opens "Received:" and a `/method` statement that the
   extension is modern work made in the ancient manner. ~~Android is still
   7-planet~~ — resolved: `ClassicalPlanet` carries all ten with an
   `isReceived` flag, `DeityRegistry` holds the fifteen receptions ported from
   `shared/content/deities.json`, and the placement text comes from the same
   generated corpus rather than being re-authored.
7. ~~Orb table changed on web (Phase 2)~~ — resolved on both surfaces. Web
   unified its three divergent internal tables onto the one documented table
   so the published method page and the running detectors agree, and Android's
   `AspectType` now carries the same values, pinned by a test so it cannot
   drift back silently.
8. **Deity names corrected on web (Phase 2)** to the handoff matrix: Greece
   Sun is **Helios** (not Apollo) and Moon is **Selene** (not Artemis), since
   the planets take the older bodies rather than their later syncretisms;
   Greece Saturn is **Kronos**; Canaan Mercury is **Kothar** (full name kept
   in the note) and Venus is **Attart**, the Ugaritic form, which keeps
   Canaan distinct from Carthage's Astarte; Carthage's two Baal Hammon seats
   are disambiguated as **in bounty** (Jupiter) and **the elder** (Saturn).
   Android's `DeityRegistry` carries the corrected names, and a parity test
   asserts it against `shared/content/deities.json` record for record.

## Sync protocol

- Changing domain content or interpretation rules on one surface? Check this
  document, apply the same change to the other surface (or record a new
  divergence here), and update the counts above if the shape changed.
- Changed web content? Re-run `npm run export:content` (and `export:goldens` if
  chart math changed) so `shared/content/` and the C# parity fixtures follow.
- New surfaces (iOS) implement the canonical column of each table, not the
  legacy Android variants.
- Medium-term (plan Phase 4): extract this model into structured JSON or a
  typed schema served by the shared backend, and delete the per-surface copies.

## Android parity, as of the ten-body rollout

Android no longer diverges on the domain. It carries all **10 bodies** with
`isReceived` marking the three receptions, reads the same
`shared/content/*.json` the web exporter generates (so deity names and
placement text cannot drift), and runs the same documented orb table
(8 / 5 / 7 / 7 / 8). The divergences this document used to list under bodies,
orbs, and the denormalized decree corpus are closed.

What remains Android-only is `domain/LexiconDictionary.kt`: per-culture UI
vocabulary (dashboard titles, officer roles, the voice epithets) with no web
counterpart, because web names those surfaces differently. It is authored
content and should be held to the same voice bar as the rest.

## iOS parity, as of 2026-10-20

The C# core (`dotnet/AstraAntiqua.Core`) now reads the whole corpus the
readings are composed from, not only the natal tables. `pnpm export:content`
writes six more files into `shared/content/`, every one from web's own
modules:

| File | What it carries | Web source |
|------|-----------------|------------|
| `reading-banks.json` | aspect verbs, deity charges, inscriptions, aspect and ingress frames, exact forms and instructions, quiet lines, summary sentences, planet domains and concerns, reflections, pair themes, sign phrases, house-group names, season house lines | `data/aspectVerbs.ts`, `data/aspectFrames.ts`, `data/deityCharges.ts`, `data/deityInscriptions.ts`, `data/interpretations.ts`, `lib/reading.ts`, `lib/weekReading.ts`, `lib/houseReading.ts`, `components/horizons/*` |
| `cities.json` | the offline birthplace list, each city with its IANA zone resolved by tz-lookup at export time | `data/cities.ts` |
| `palettes.json` | the neutral and per-culture ground and accent | `data/palettes.ts` |
| `method.json` | the method sections, interpretive notes and sources | `data/methodologyContent.ts` |
| `glyphs.json` | the fifty deity glyphs as flattened paths on the 24 grid, with deity and status (28 attested, 21 composed, 1 invented) | `docs/design/system/assets/glyphs` |
| `learn.json` | the seven Learn sections as blocks, plus the planet verbs, house systems, aspect rulings and geometry | written by `scripts/gen-android-learn.mjs` (`pnpm export:learn`) from the same extraction that writes Android's `LearnContent.kt` |

Web functions are exported as templates: the exporter calls each with
sentinel arguments and swaps them for named slots, `{a}` for the argument as
given and `{A}` for it capitalised (web's `cap()`). `ReadingBanks.Fill` in C#
fills them. Four web constants gained an `export` for this
(`SUMMARY_INTRO`, `INGRESS_VERB`, `EXACT_FORMS`, `PLANET_CONCERN`), and
`buildReading`'s summary sentences moved into exported `SUMMARY_TONES` and
`SUMMARY_FUSED`; web's output is byte-identical before and after.

`pnpm export:goldens` also writes
`dotnet/AstraAntiqua.Core.Tests/TestData/horizons.json`: natal readings in all
five voices (including synthetic charts that force each summary branch), two
weeks in all five voices, long-transit spans, ingresses, stations, moon
quarters, eclipses, season windows and events, moon phases, solar returns,
synastry, transits, house readings and birth resolution. The C# suite asserts
composed text byte for byte and searched instants within one second. One
platform caveat is recorded in the test: Windows' zone data has no daylight
saving history for Tunis, so on Windows that one birth case is skipped; iOS
and Linux read IANA data and run it.

The iOS head (`dotnet/AstraAntiqua.App`) renders the canonical column on
every screen Android has: the day, the week, the season, the year, the long
transits and their detail, the placements, synastry with an unsaved second
party, the year ahead, the five voices, the matrix, the method and Learn.
