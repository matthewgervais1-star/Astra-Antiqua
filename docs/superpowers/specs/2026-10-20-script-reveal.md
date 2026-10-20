# Script reveal: each culture's names in its own writing, resolved as you read

**Date:** 2026-10-20. **Owner's request:** "each culture in its script that changes into
readable latin script for english or french when you scroll towards it, and change back as you
scroll away." **Owner's answers (popup, 2026-10-20):** deity names and headings; Rome starts from
inscriptional Latin; build the French names now; web and Android together.

## What changes

A name set in its culture's writing (the script form) turns into the reader's Latin form as it
scrolls into the middle of the screen, and turns back as it leaves.

| Culture | Script form | Font (all SIL OFL) |
|---|---|---|
| Egypt | Egyptian hieroglyphs (Unicode 13000 block) | Noto Sans Egyptian Hieroglyphs (loaded) |
| Greece | Greek, polytonic where attested | GFS Didot (loaded) |
| Canaan | Ugaritic alphabetic cuneiform | Noto Sans Ugaritic (loaded) |
| Carthage | Phoenician (Punic forms, Unicode 10900 block) | Noto Sans Phoenician (add) |
| Rome | Inscriptional Latin capitals, V for U, I for J (IVPPITER) | Cinzel (loaded) |

## Rules that do not bend

1. **Attested only.** Every script form is a spelling attested for that god or word, with its
   source recorded beside it in the data file (a text, an inscription or a standard reference).
   Nothing is transliterated letter by letter from English. A name with no attested spelling has
   no script form and shows no effect; the data says so with a note. This keeps the design
   system's rule: epigraphic faces set attested signs, never copy.
2. **What counts as a heading.** The culture's own name (Kemet, Hellas, Ugarit or Canaan as
   attested, Qart-hadasht, Roma) and the culture's institution names where an attested native
   word exists. Generic English section headings ("What it looks like in space") stay Latin.
3. **Readable target.** English or French, chosen by the page language: web uses the `lang` of
   the nearest ancestor (`fr`, `fr-CA` give French), Android uses the device locale. French
   forms are the established French scholarly forms (Rê or Râ, Amon, Osiris, Isis; Baal, Anat;
   Tanit, Baal Hammon; Zeus, Héra; Jupiter, Mercure). Every name gets both forms in the data.
4. **Readers come first.**
   - The Latin form is always the accessible name (web: real text with the script layer
     `aria-hidden`; Android: `contentDescription` / semantics).
   - Reduced motion (web `prefers-reduced-motion`, Android animator scale 0 or the system
     "remove animations") shows the Latin form, no swap.
   - Layout does not move: the element reserves the wider of the two forms, so the swap never
     shifts text around it.
   - Search engines and copy-paste get the Latin form.
5. **The swap.** In: the name crosses into the middle band of the viewport (the band between
   30% and 70% of its height) and resolves to Latin. Out: it leaves the band and returns to
   script. A cross-fade of about 400 ms, eased; no per-letter scramble.

## Where it shows

Every place a deity name is set as a name: voices pages, the matrix, the chart and its table,
figure and transit pages, the day page's evidence line, the week. The culture name in the
culture chip and page headers. Not inside running prose, the data columns of a table where the
name is a cell value next to numbers (keep those Latin), or form controls.

## Data

`web/src/data/scriptForms.ts`: for each culture, each deity and each heading word: `script`
(string, or null with `note`), `en`, `fr`, `source`. Android mirrors it through a generator in
`web/scripts/` like the reading banks, and a JVM parity test pins it.

## Verification

- A test reads every script string and checks each code point sits in its culture's Unicode
  block (Rome: A to Z only) and that every entry has `en`, `fr` and a non-empty `source`.
- A test checks the French forms differ from English only where French usage differs.
- Screenshots of one page per culture, script and resolved, light and dark, web and Android,
  join `docs/design/screenshots/phase14-script-reveal/`.
- An adversarial review checks every script form against its stated source.
