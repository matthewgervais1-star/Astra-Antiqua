# Design: the rebrand prompt

Deliverable: a prompt package that a future Claude Code session uses to
execute a full rebrand of the Astra Antiqua web surface.

## Decisions (from brainstorm Q&A)

1. Motivation: full rebrand; every layer of expression on the table.
2. Consumer: a Claude Code session that designs AND builds in this repo.
3. Invariants: the core identity and substance (five cultures reading one
   computed sky, the content corpus, theming capability, horizons, feature
   completeness, astronomical honesty, anonymous-first). Visuals, GUI,
   nav/IA, structure, and copy voice are all changeable.
4. Direction: not prescribed; three named directions rendered as real pages,
   human picks (remixes allowed), then build.
5. Delivery: one-shot build of the winner after the pick, browser-verified
   against an explicit bar.
6. Voices are substantive interpretation: same core astrological meaning,
   culturally native readings; "only the names change" framing retired.
7. Phase 2 completes missing surfaces: long-transit reading pages,
   voice-depth uplift, reading feedback, finished empty/error states.
8. All planets: Uranus, Neptune, Pluto join as designed cultural
   receptions, transparent in the methodology; web first, Android follows.

## Shape (approach A of three considered)

Brief-in-repo plus a short launcher prompt:

- `docs/design/rebrand-brief.md`: the full standing brief (mission,
  inviolable core, open-to-change list, technical constraints, Phase 1
  three-direction protocol with a hard stop, Phase 2 one-shot build,
  verification bar, working agreements).
- `docs/design/rebrand-launcher.md`: the ~12-line prompt to paste into the
  executing session, pointing at the brief.

Rejected: a single self-contained mega-prompt (unversioned, skimmable,
fragile across the pick gap); two separate phase prompts (two artifacts to
manage, drift risk between them).

## Why the brief carries the weight

The Phase 1 stop means the exploration and the build may happen in different
sessions, possibly days apart. A committed brief is the only artifact that
survives that gap without re-pasting, and it is reusable for the later
Android restyle noted in the brief's constraints.
