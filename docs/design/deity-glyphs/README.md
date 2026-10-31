# The fifty deity glyphs, drawn

One mark per body per culture, drawn from the stroke specs in
`../deity-glyphs.md`. Fifty SVGs on a shared 24 grid, monochrome, single weight,
sized for 16 to 24 px beside a body's name in the chart wheel, the placements
table, and running prose.

`contact-sheet.html` is the proof sheet. Open it in a browser; it needs no
server. It carries the full matrix at 24 and at 16, the Greece-against-Rome
sorting test, every culture's ten on its own ground in its own accent, and the
glyphs set inline in Spectral at reading size.

## How to use one

Every glyph paints with `currentColor` and nothing else, so the active culture's
accent or bone ink is a CSS or theme change rather than a second file.

```
docs/design/deity-glyphs/<culture>/<body>.svg
```

Cultures are `egypt greece canaan carthage rome`. Bodies are
`sun moon mercury venus mars jupiter saturn uranus neptune pluto`.

## Construction

- **Grid** 24 x 24, live area 2..22, so a 2-unit optical margin.
- **Weight** 1.5 nominal, chosen so it lands on a whole pixel at 16px. A hand may
  taper below it. Nothing exceeds it, and weight is never used to separate two
  marks.
- **Budget** roughly five discrete drawn elements. Rome's Sol is the one
  declared exception, its radiate crown being a ring plus spikes.
- Only `g path circle ellipse line polyline polygon rect`. No text, no `use`, no
  `defs`, no literal colour, so each file survives becoming an Android vector
  drawable or an inline React component.

## The five hands

The set separates by drawing language, not only by subject. This is what carries
Greece and Rome, which share five subjects out of ten because Rome took those
gods from Greece wholesale.

| Culture | Hand | Taken from |
|---|---|---|
| Egypt | constant width, no swell, terminals cut flat, true verticals and horizontals, curves struck from a compass | incised relief and the scribe's reed |
| Greece | brush line: tapering, bowed, off square, segments unequal, nothing mirrored exactly | vase painting |
| Canaan | straight segments, angular joins, wedge terminals, curves drawn tight and mechanical | stylus in clay, chisel in stone |
| Carthage | shallow economical incision, and the one hand permitted geometric solids | Punic votive stele carving |
| Rome | ruled, exactly symmetric, equal segments, blunt squared terminals, axes at exact angles | struck coin relief |

**The test:** the contact sheet prints the shared five at 16px with labels off.
If they stop sorting into two rows, the hands are underdrawn, and the fix is
axis, symmetry and proportion rather than more detail.

## Honesty

Each glyph carries its status in its `<title>`, unchanged from the research:
**28 attested, 21 composed, 1 invented**, verified file by file against the
tables in `../deity-glyphs.md`.

The status is a drawing constraint, not a footnote. No glyph gets period
texture, wear or antiquing, so a composed mark cannot be made to look more
ancient than an attested one. The hand is a construction language, not a patina.

All fifteen received-body glyphs (uranus, neptune, pluto in every culture) are
composed or invented, because no ancient culture knew those planets. Canaan's
Shamem is the single invented mark in the set: two short bowed bars, and nothing
added, because it is labelled invented precisely so it does not pretend to a
pedigree it has not got.

## Two things that changed from the research

**Carthage's Mercury is no longer a caduceus.** It duplicated Rome's, which
holds the caduceus on solid attestation, and the icon research found the Punic
version reads Greek or medical to a modern eye. Sakun keeps the name and takes
the steering-oar, the quarter-rudder catalogued on Punic votive stelae, for the
god whose name reads as "superintendent". Status stays composed: no stele labels
a rudder with his name. Every edge of the blade is straight, because the moment
it curves it becomes Baal Hammon the elder's sickle.

**The research's own tally was one out.** Its prose said 27 attested and 22
composed while its fifty table rows said 28 and 21. The tables are the record
and the summary was miscounted; `../deity-glyphs.md` now agrees with itself.

## Wired in

Both surfaces render these glyphs. Web reads them through `DeityGlyph`
(`9759fb6`), and Android through ImageVectors that
`web/scripts/gen-android-glyphs.mjs` generates (`bb3d43c`). The running app
prints Isis's own mark beside her name. The commits and screenshots are in
[`../IMPLEMENTATION.md`](../IMPLEMENTATION.md).
