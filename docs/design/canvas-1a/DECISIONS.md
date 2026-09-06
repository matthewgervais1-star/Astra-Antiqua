# Canvas 1a, and where it argues with the research

Imported from the Claude Design project `Astra Antiqua Brand.dc.html`
(project `42219d9c-93ce-4102-b92f-34c06c74f3f8`). Extracted vector assets sit in
`marks/` and `wordmark/`.

**Read the per-culture board, not A1.** The canvas carries several boards and
they disagree. A0 offers candidates, A1 picks one per culture, and the board
titled THE MARKS, PER CULTURE says `supersedes A1`. That last board is the
handoff. An earlier version of this file quoted A1 and had Egypt and Greece
wrong as a result.

## The move it makes

The brief asked for five drawn instruments. Canvas 1a splits the set by whether
the culture wrote the thing down:

> Where the sign exists as an encoded character, palaeographers have already
> drawn it from the material record and it is set as type. The augur's staff and
> the coin devices never existed as signs, so they are drawn flat from their
> named sources.

This is a stronger form of the honesty claim than the brief asked for. A modern
drawing of a balance sits one remove further from the record than the glyph
Egyptian scribes used to write "balance".

The guidelines make it a fourth type role. `guidelines/type-epigraphic.html`
names the faces: Hieroglyphs at `U+13080`, Ugaritic at `U+1039B U+1038D`,
**GFS Didot** for the Greek `U+0395`, and Symbols 2 for `U+2625`.

## The marks, per culture, as the board has them

| Culture | Marks | Form |
|---|---|---|
| Egypt | ☥ the ankh `U+2625`, 𓂀 the wedjat `U+13080`, 𓀻 the seated king `U+1303B` | all typeset |
| Greece | Ω omega `U+03A9`, the tripod (after the Delphic stater), Athena's owl (after the tetradrachm) | typeset + two drawn |
| Canaan | the Baal stele (Louvre AO 15775), 𐎛𐎍 ʾIl "El" | raster mask + typeset |
| Carthage | Tanit launcher (outline, no crescent), Tanit header (crescent, solid disc, arms up), Tanit with crescent (full stela form) | all drawn |
| Rome | the she-wolf (Capitoline bronze), Augustus (Prima Porta), the aquila, the eagle, the lituus (after RRC 443/1) | two raster masks + three drawn |
| Neutral | the monogram, two A's as a ruined temple front | drawn |

Egypt's balance (`𓍝`, Gardiner U38, `U+1335D`) appears on A0 and A1 and **not**
on the per-culture board. The designer's note explains the shape of Egypt's row:
Ramses was the one statue with no source supplied, and rather than draw a
colossus from memory they left Egypt to its attested signs.

## Decisions taken

| Question | Answer |
|---|---|
| Carthage at tier 1 | **Ship Tanit**, accepting the two named costs |
| Greece | **All three**: the owl, the omega, and the tripod |
| Rome tier 2 | **The aquila, Augustus and the she-wolf** |
| Display type | **Prototype** Spectral small caps on the four non-Roman surfaces |

### What shipping Tanit costs, on the record

The research refused Tanit at tier 1 on three grounds. The designer defends two
and concedes the third:

> Two of them I can defend against in the drawing: the tripod collision is
> answered by keeping Tanit in outline while Greece is three separate strokes
> under a bowl, and the 48px test passes. The third I cannot: its densest
> attestation is the tophet stelae, and a launcher icon has no label to disarm
> that.

It also breaks the tier system. The same sign now stands at tier 1 and tier 2,
so C1's rule that Tanit never appears without the word Carthage is broken by the
launcher, which has no label by definition. The two cuts are drawn to be told
apart by weight and terminal rather than size: `marks/em-tanit.svg` is the plain
outline for the launcher, `marks/em-tanit-hdr.svg` the solid disc with upturned
arms for headers.

The cothon stays the better answer and needs a Salammbo harbour survey to trace
from. The designer's words: "a harbour plan is a surveyed document and no glyph
substitutes for it."

### Rome tier 2, and the aquila argument that was overruled

Canvas 1a argued the aquila fails on the brief's own logic, since the brief
refused it at tier 1 for meaning rather than contamination and meaning does not
change with a caption. It drew a templum instead (`marks/dr-templum.svg`).

That argument was heard and overruled: Rome tier 2 carries the aquila, Augustus
and the she-wolf. The templum stays in `marks/` unused rather than deleted.

## The crescent, which the research and the canvas half agree on

The research refused the crescent and disc because it collapses into the star
and crescent at 48px. The canvas agrees for the launcher and disagrees for the
header, on the grounds that the stelae carry the disc under a crescent with
horns up. `marks/em-tanit-cr.svg` is the full stela form, kept so the loss is
visible: "the crescent is the first thing to go at 48px".

## The type question

`guidelines/type-display.html` still specs `CINZEL 400/600 · 52 / 40 / 26 / 22 ·
TRACKING 0.16EM`. Small caps exist only in the designer's note, not in the spec,
which is why this is a prototype rather than an adoption.

The note keeps Cinzel and gives three reasons: a Trajanic cap is the museum wall
label's actual voice rather than an allusion to it; it is the only face a reader
sees in caps at large size, where a less conventional display face would compete
with the marks; and it already pairs with Spectral at matched optical weight.

Then it raises an objection the brief never considered:

> a Roman inscriptional cap sets the titles for four cultures that are not
> Roman. "THE COUNCIL OF EL" in Trajanic caps is a small act of imperial
> typesetting, and the product's whole claim is that five theologies read the
> same sky on equal terms.

The proposed fix is a code change: display caps drop to Spectral small caps on
Egypt, Greece, Canaan and Carthage, and Cinzel keeps Rome and the app shell.

## What this costs in engineering

1. **Three tier-1 marks are type, not drawings.** Egyptian Hieroglyphs
   (`U+13000`), Ugaritic (`U+10380`) and GFS Didot are in none of the three
   shipped faces. The canvas answers this for icons: "THE ANDROID FOREGROUND
   SHIPS AS A VECTOR OUTLINE OF THE GLYPH, NOT AS LIVE TEXT". Any in-app
   epigraphic use needs those faces added to `web/scripts/fetch-fonts.mjs`.
2. **The hieroglyph goes thin at 48px.** The named fix is a weighted cut of the
   same sign, same outline, heavier stroke, no shape change. The designer calls
   it "type work, not illustration".
3. **Two Rome marks and one Canaan mark are raster.** The she-wolf, Augustus and
   the Baal stele are PNG alpha masks in the project's `assets/`, coloured by a
   `background` behind a `mask`, which is what lets each take its culture accent
   without a second file. They will not scale to a 512 launcher or become an
   Android vector drawable without being traced to paths first.
4. **Mask fitting is solved.** Setting a glyph at 0.66 of the canvas puts it
   inside the 72-unit safe circle under every launcher mask.
5. **Every extracted vector paints with `currentColor`**, so a culture accent is
   a CSS change rather than a second file. The monogram's architrave is the one
   hardcoded colour (`#B59A55`) and should take `var(--accent)` when wired in.

## Still needed from the design project

These are binary and could not be pulled through the browser bridge. They need
either `/design-login` run once in an interactive session, so `DesignSync` can
read the project directly, or a download.

- `assets/icon-shewolf.png`, `assets/icon-augustus.png` (Rome tier 2, chosen)
- `assets/icon-baal-stele.png`, `assets/icon-baal.png` (Canaan)
- `assets/canaan-baal-stele.png`, `assets/rome-augustus.png`, `assets/rome-shewolf.png`
- `uploads/BAAL.jpg`, `uploads/Statue-Augustus.jpg`, `uploads/rqgvol5zn55g1.jpeg`
