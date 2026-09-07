# Prompt: finish the design-system rollout, on ultracode

Paste the fenced block into a fresh Claude Code terminal session at the repo root. The
first word switches on multi-agent orchestration for the session. Run `/design-login` once in
that terminal before pasting, or the last step cannot push to Claude Design.

The engineering spec is `docs/design/prompts/implement-design-system.md`. This prompt does
not repeat it; it says how to run it at scale, where to fan out, where to verify
adversarially, and what "done" means.

```text
ultracode

Finish the Astra Antiqua design-system rollout on both surfaces. The full engineering spec is
docs/design/prompts/implement-design-system.md; read it first and treat every phase, rule and
"what not to do" in it as binding. This prompt tells you how to run that spec with workflows
and what closes it out.

READ FIRST
  docs/design/prompts/implement-design-system.md     the spec, six phases
  docs/design/system/readme.md                       the design system
  docs/design/canvas-1a/DECISIONS.md                 what was decided per culture
  docs/design/deity-glyphs/README.md                 the glyph grid, hands, honesty statuses
  CLAUDE.md                                          shared/content is generated; never hand-edit it

HOW TO RUN IT
Work one phase at a time, in the spec's order, and keep the human in the loop between phases:
after each phase report what landed, show the screenshot that proves it, and stop for a reply
before starting the next. Inside a phase, use a workflow wherever the work is many independent
items of the same shape, and always follow it with an adversarial verification pass whose job
is to refute, not confirm.

  Phase 1, web glyphs. One agent writes web/scripts/export-glyphs.mjs and the generated
  module; one writes DeityGlyph.tsx. Then fan out over every PLANET_SYMBOLS call site (rg -n
  PLANET_SYMBOLS web/src) so each replacement is one agent with one file, in a worktree. Then
  a verification panel of three, each given the rendered wheel and placements table at
  16px for Egypt, Greece and Rome, asked to refute: (a) that every body shows a glyph, (b)
  that the Greece and Rome helmets are visibly different hands, (c) that received bodies
  and only received bodies take the accent. A finding survives only if two of three agree.

  Phase 2, web brand. Three parallel agents: wordmark into Lintel and NaveHead; monogram as
  favicon and apple-touch-icon with the architrave on var(--accent) in-app; the four
  epigraphic faces added to fetch-fonts.mjs and layout.tsx for the web list only. One agent
  diffs the @theme block in globals.css against docs/design/system/tokens/colors.css and
  reports any drift; the design system is canonical. Verify with screenshots of the shell on
  two cultures.

  Phase 3, outlines. One agent writes web/scripts/outline-signs.mjs with opentype.js and
  emits ts-ankh.svg, ts-omega.svg, ts-il.svg into docs/design/system/assets/marks/. Run
  node scripts/check-svgs.mjs docs/design/system before anything else touches them. A
  verifier renders each at 48px beside the drawn marks and refutes legibility.

  Phase 4, Android launcher icons. Fan out six agents, one per culture plus neutral, each
  producing its foreground and background VectorDrawables and its mipmap pairing, in
  worktrees. One agent does the manifest aliases and the enable/disable switch in the single
  place the culture setter calls. Verify on the emulator: switch to Rome, screenshot the
  launcher; switch to Carthage, screenshot again. Two verifiers refute that the icon changed
  and that the mark sits inside the 72dp safe zone under a circular mask.

  Phase 5, Android glyphs. One agent writes the SVG-to-ImageVector generator and must make
  it fail loudly on any element type the fifty do not use. Then fan out over the five
  cultures, ten glyphs each, in worktrees, each agent building its ten and rendering them in
  a preview composable. A verifier compares each culture's ten against
  docs/design/deity-glyphs/<culture>/*.svg at 16dp and refutes fidelity.

  Phase 6, Android wordmark and monogram. Two agents. Screenshot the top bar.

CLOSING OUT, after the six phases
  1. Re-run the preview cards so they show the app as it now renders:
       cd web && npm run specimens
     Before that, fix the one known cosmetic fault: in web/scripts/specimens/specimens.json,
     give each entry a "culture" whose name matches the culture its sample text names
     (kickers like "the auspices of the day" are Rome; "the council of El" is Canaan;
     "the hall of Ma'at" is Egypt). Leave culture-neutral entries as they are.
  2. Push the refreshed cards to the Claude Design project "Astra Antiqua", id
     24e2b41c-9c28-47de-88ce-e515b647b2bf, with the DesignSync tool: finalize_plan with
     localDir docs/design/system, writes ["components/previews/*.html",
     "components/previews/*.css", "readme.md"] and deletes [], then write_files with every
     file, IN THE SAME TURN. Plan tokens do not survive a session restart; if write_files
     says the token is missing, mint a new one and write immediately.
  3. Run the full verification on both surfaces one last time:
       cd web && npm run typecheck && npm run lint && npm run gates && npm run build
       cd android && ./gradlew compileDebugSources && ./gradlew testDebugUnitTest
  4. Write docs/design/IMPLEMENTATION.md: what landed on each surface with commit hashes,
     the screenshots' paths, and what remains for people rather than code: the weighted cut
     for the three typeset signs, the cothon for Carthage pending a Salammbo survey, and the
     Spectral SC display decision. No em dashes anywhere in anything you write.

RULES THAT DO NOT BEND
  Do not redraw, restyle or replace any mark or glyph. Do not touch shared/content/. Do not
  change orbs, houses or domain content. Do not promote the Spectral SC prototype. No
  gradients, shadows, rounded corners or animation. Never commit android/local.properties.
  A green build is not evidence; a screenshot is. Commit after every phase in the repo's
  existing style with the Co-Authored-By trailer the log already carries.
```
