# Shared Content Model

The contract for the domain content that every Astra Antiqua surface (web today,
Android today, iOS later) must agree on. The two codebases implement this model
independently and are kept in sync **by hand**; this document is the arbiter when
they disagree. Until a shared module or content API exists, **the web
implementation (`web/src/data/*.ts`) is the source of truth for content**, and
`web/src/lib/*.ts` is the source of truth for interpretation rules.

## Canonical vocabulary

| Concept | Canonical set | Web | Android |
|---------|---------------|-----|---------|
| Cultures | **5**: egypt, greece, canaan, carthage, rome | `CULTURES` in `cultures.ts` | `AncientCulture` enum ✓ |
| Classical planets | **7**: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn | `PLANETS` in `cultures.ts` | `ClassicalPlanet` enum ✓ |
| Zodiac signs | **12**, with element, modality, traits, date range | `ZODIAC_SIGN_INFO` in `zodiacSigns.ts` | `ZodiacSign` enum (names only) |
| Houses | **12**, whole-sign, each with title/domain/arena | `HOUSE_MEANINGS` in `houses.ts` | `HouseMeanings` in `domain/HouseMeanings.kt` ✓ (ported verbatim) |
| Aspect kinds | **5**: conjunction, sextile, square, trine, opposition | `AspectKind` in `sampleChart.ts` | `AspectType` enum ✓ (orbs match) |
| Life domains | **5**: self, bonds, work, fortune, spirit | `LIFE_DOMAINS` in `lifeDomains.ts` | none |

## Deity model

One deity per (culture × planet) — 35 records. Canonical shape (web
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
  duplicating names. `assets/oracle_decrees.json` bakes its own copies of the
  deity names and prose into its decree records (now 84 x 5 = 420, Roman
  column included) — that duplication persists until it migrates to the
  universal model. Any deity change on web must be applied to `DeityRegistry`
  and, until the migration, to `oracle_decrees.json`.

## Interpretation model

The two surfaces currently model placement text differently:

- **Web (canonical going forward):** placement meaning is *universal* text —
  `PLANET_IN_SIGN` (7 × 12 = 84 paragraphs) — and the active culture is a
  *render-time mask*: deity names, epithets, aspect verbs, and cultural register
  are layered on top when displayed. Content grows linearly (84 + 35 + 25 …).
- **Android (legacy):** fully denormalized per culture —
  `assets/oracle_decrees.json` holds 84 placements × 5 cultures = 420 records
  with the deity and prose baked in. Content grows multiplicatively and drifts.

New content must follow the web model. The Roman column was added under the
legacy shape to reach five-culture parity now (grounded in the web's
`PLANET_IN_SIGN` meanings); the eventual migration of `oracle_decrees.json`
to universal text + cultural mask is still the plan, and collapses all five
baked pantheons at once.

**Product principle, either way:** the universal layer carries the
placement's core astrological meaning, and the cultural layer must be
culturally substantive: each culture's own theology, institutions, imagery,
and register, not merely a different deity name on the same sentence.
Whether that is achieved by masking rich per-culture fragments (web) or by
fully authored per-culture prose (the decree corpus), the five readings must
feel native to their cultures while agreeing on what the placement means.

Web-only interpretive banks (no Android counterpart yet; they become shared
content when Android gains those features): aspect readings (21 pairs × 3
tones), domain readings (15), week readings (12), year narrative (41), planet
areas/domains, sign registers, aspect reflections, pair themes, cultural
orientations, methodology sources.

Android-only vocabulary (needed by any future shared schema): per-culture UI
lexicon — menu titles, officer roles, priest titles, aspect labels
(`LexiconDictionary`).

## Chart-math rules

| Rule | Canonical | Web | Android |
|------|-----------|-----|---------|
| House system | **Whole-sign** (Hellenistic; stated publicly on the learn pages) | `lib/houses.ts` ✓ | Whole-sign (`CalculateNatalChartUseCase.wholeSignHouseCusps`) ✓ |
| Aspect orbs | conjunction 4°, sextile 3°, square 4°, trine 4°, opposition 5° | `ASPECT_RULES` in `lib/transits.ts` ✓ | `AspectType` in `NatalChartData.kt` ✓ |
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
6. **Planned (rebrand brief):** the system expands from 7 to 10 bodies —
   Uranus, Neptune, and Pluto as designed cultural receptions — on web
   first, per docs/design/rebrand-brief.md. The canonical-planets row above
   changes when that ships; Android follows after the rebrand.

## Sync protocol

- Changing domain content or interpretation rules on one surface? Check this
  document, apply the same change to the other surface (or record a new
  divergence here), and update the counts above if the shape changed.
- New surfaces (iOS) implement the canonical column of each table, not the
  legacy Android variants.
- Medium-term (plan Phase 4): extract this model into structured JSON or a
  typed schema served by the shared backend, and delete the per-surface copies.
