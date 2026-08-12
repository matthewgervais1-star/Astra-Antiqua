# Prompt: audit and raise the reading corpus to the voice bar

Paste into a fresh Claude Code session (Opus) in `L:\Claude Projects\astra-antiqua`.

```text
Read docs/design/reading-voice.md. It is the cadence spec for every personal
reading on this surface, derived from the Co-Star reference screens in
docs/design/references/ read against docs/design/rebrand-brief.md.

Your job is to audit the authored reading corpus against that spec and raise
every entry that falls short. This is editorial work on our own prose. Do not
consult, fetch, or reproduce Co-Star text: the spec already carries everything
we take from it, which is structure and directness, never sentences.

CORPUS IN SCOPE (web/src/data/):
  transitSpine.ts        5 cultures x 5 slow bodies: changing / leaves / votive
  aspectRulings.ts       5 cultures x 5 aspect kinds
  cultureVoice.ts        institutions, surface names, house groups, reception lines
  notifications.ts       5 cultures x 32 daily lines
  permissionsRegister.ts 5 cultures x proceed/refrain banks
  planetInSign.ts        10 bodies x 12 signs (universal layer: no deities, but
                         the cadence rules still apply)
  aspectReadings.ts      45 pairs x 3 tones (universal layer, same caveat)
Also read, for the composed layer that assembles these at runtime:
  web/src/lib/decree.ts, web/src/lib/weekReading.ts,
  web/src/components/transits/spineTemplates.ts,
  web/src/components/charts/placementCopy.ts

METHOD (work bank by bank, most-read surfaces first: transitSpine, then
aspectRulings, then decree/week composers, then the rest):

1. CROSS-CULTURE LEAKAGE. For each shared slot, put the five cultures' entries
   side by side. Flag any sentence, image, or verb that could be swapped between
   two cultures without a reader noticing. Rewrite the weaker ones native: name
   the institution, its procedure, and its concrete objects.

2. TEMPLATE SEAMS. Find sentences or frames repeated across entries within a
   bank (this is the exact failure the reference exhibits). Every repeat is a
   defect. Rewrite so no sentence appears twice in the corpus.

3. HEDGING. Search for: may, might, perhaps, tends to, can be, try to, a bit,
   somewhat, often, sometimes, remember that. Each is a candidate deletion.
   Replace with a declarative, or cut the clause. The sky either says it or
   it does not.

4. ABSTRACTION. Flag abstract nouns doing the work of concrete ones: situation,
   energy, transformation, growth, journey, process, dynamic, aspect of
   yourself. Replace with the culture's own objects: the scale and the feather,
   the harbor and the manifest, the sickle, the docket, the censor's list.

5. THERAPY REGISTER. Flag any line that counsels, reassures, or explains
   feelings. The gods weigh, question, convene, audit, and rule. They do not
   comfort. (Exception: honesty lines about quiet days stay plain and calm.)

6. INSTRUCTION ENDINGS. Every reading-level entry must end on one concrete
   instruction, not a summary. Votives are exactly two lines, imperative,
   separated by \n.

7. ASTROLOGICAL TRUTH. Check that each body's characterization matches its
   real principle (Uranus rupture, Neptune dissolution, Pluto pressure and
   probate, Saturn limit and time, Jupiter increase and its price) and that
   received-body entries never imply the ancients knew them.

CONSTRAINTS (these are build-breaking):
- No em dash anywhere in web/src. Use a period, a comma, or a middle dot.
- Banned words: inter, roboto, harness, "unlock your", "discover your".
- Preserve every export name, key, shape, and count exactly. This is a prose
  edit, not a refactor. Nothing may change type.
- Scholarly grounding may not be weakened: deities keep their real attested
  domains, and the Canaan continuity passage and the method page copy ship
  verbatim as they stand.

VERIFY, from web/:
  npm run gates && npm run typecheck && npm run lint && npm run build
Then run the five-voice check: start the dev server, load /?culture=X for all
five cultures on the same day, and confirm the five decrees share no sentence.
Do the same for one long transit (/transits/[id]) across all five.

DELIVER:
- The edits, committed in reviewable slices by bank, conventional messages.
- A short report: how many entries you changed per bank, the three worst
  offenders you found with before/after, and any entry you judged already at
  the bar and left alone.
```

## Why this and not a crawl

The reference screens exposed Co-Star's long-transit engine completely: two
unrelated readings share byte-identical sentences ("This part of yourself will
transform into something else"), which means the pages are four template frames
with keyword fills. The structure is fully captured in
`docs/design/reading-voice.md`; more samples would return the same four frames.
The only thing volume would add is copyrighted prose in the register the brief
tells us to retire.
