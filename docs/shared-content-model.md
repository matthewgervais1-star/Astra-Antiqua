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
| Cultures | **5**: egypt, greece, canaan, carthage, rome | `CULTURES` in `cultures.ts` | `AncientCulture` enum — **missing rome** (see Divergences) |
| Classical planets | **7**: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn | `PLANETS` in `cultures.ts` | `ClassicalPlanet` enum ✓ |
| Zodiac signs | **12**, with element, modality, traits, date range | `ZODIAC_SIGN_INFO` in `zodiacSigns.ts` | `ZodiacSign` enum (names only) |
| Houses | **12**, whole-sign, each with title/domain/arena | `HOUSE_MEANINGS` in `houses.ts` | none |
| Aspect kinds | **5**: conjunction, sextile, square, trine, opposition | `AspectKind` in `sampleChart.ts` | `AspectType` enum ✓ (different orbs) |
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
- Android holds the same identities in **three places** (`DeityManager`,
  `LexiconDictionary.culturalVoices`, and baked into `oracle_decrees.json`) with
  a reduced `{name, epithet}` shape. Any deity change on web must be applied to
  all three, until they are consolidated.

## Interpretation model

The two surfaces currently model placement text differently:

- **Web (canonical going forward):** placement meaning is *universal* text —
  `PLANET_IN_SIGN` (7 × 12 = 84 paragraphs) — and the active culture is a
  *render-time mask*: deity names, epithets, aspect verbs, and cultural register
  are layered on top when displayed. Content grows linearly (84 + 35 + 25 …).
- **Android (legacy):** fully denormalized per culture —
  `assets/oracle_decrees.json` holds 84 placements × 4 cultures = 336 records
  with the deity and prose baked in. Content grows multiplicatively and drifts.

New content must follow the web model. When Android content is next touched at
scale, migrate `oracle_decrees.json` toward universal text + cultural mask
rather than adding a 5th baked-in pantheon column.

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
| House system | **Whole-sign** (Hellenistic; stated publicly on the learn pages) | `lib/houses.ts` ✓ | Placidus (`CalculateNatalChartUseCase`, `'P'`) — must migrate |
| Aspect orbs | conjunction 4°, sextile 3°, square 4°, trine 4°, opposition 5° | `ASPECT_RULES` in `lib/transits.ts` ✓ | 8/6/7/8/8 — must migrate |
| Ephemeris | astronomy-engine (same upstream: cosinekitty/astronomy) | npm package | JAR ✓ |
| degree → sign | 30° blocks from 0° Aries | `longitudeToSign()` | `ZodiacUtils` ✓ |

The web values are canonical because the site's methodology pages document them
as product commitments (whole-sign houses are named on `/learn`).

## Known divergences (reconciliation backlog)

1. **Rome is missing from Android entirely** — enum, lexicon, deity data, and
   decree JSON. Adding it under the current Android model means 84 new baked
   decree records; prefer doing it as part of the migration to the universal
   model.
2. **House systems differ** (whole-sign vs Placidus) — the same birth data gives
   different house placements on the two surfaces today.
3. **Aspect orbs differ** — the two surfaces can disagree about whether an
   aspect exists at all.
4. **Deity data triplicated on Android** with reduced fields and some
   diverging names (e.g. the Greek solar deity).
5. **Android lacks** houses/meanings, transits, synastry, forecast, and the
   whole reading-composition layer; web lacks Android's per-culture UI lexicon.

## Sync protocol

- Changing domain content or interpretation rules on one surface? Check this
  document, apply the same change to the other surface (or record a new
  divergence here), and update the counts above if the shape changed.
- New surfaces (iOS) implement the canonical column of each table, not the
  legacy Android variants.
- Medium-term (plan Phase 4): extract this model into structured JSON or a
  typed schema served by the shared backend, and delete the per-surface copies.
