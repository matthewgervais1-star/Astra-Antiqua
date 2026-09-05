# Canvas 1a, and where it argues with the research

Imported from the Claude Design project `Astra Antiqua Brand.dc.html`
(project `42219d9c-93ce-4102-b92f-34c06c74f3f8`, canvas `1a`, artboard 1440px).
The asset library extracted from it sits in `marks/` and `wordmark/`.

Canvas 1a states that it **supersedes A1**. It is not a clean handoff of the
brief. It reopens the tier 1 question, changes the answer for three cultures,
and marks one of those changes as a placeholder it wants replaced.

## The move it makes

The brief asked for five drawn instruments. Canvas 1a proposes something else:

> Tier 1 is now the attested signs themselves. Where the sign exists as an
> encoded character, palaeographers have already drawn it from the material
> record and it is set as type. The augur's staff and the coin devices never
> existed as signs, so they are drawn flat from their named sources.

So the set splits by whether the culture wrote the thing down. Egypt, Greece
and Canaan get real Unicode characters. Rome gets a drawing, because the lituus
existed as an object and never as a written sign.

This is a stronger form of the product's honesty claim than the brief asked for.
The brief said "attested in the material record". Canvas 1a answers that the
most attested form of a sign is the sign, and that a modern drawing of a balance
is one remove further from the record than the glyph Egyptian scribes used to
write "balance".

## The six tier-1 tiles

| Culture | Canvas 1a | Source it cites | Research said |
|---|---|---|---|
| Egypt | 𓍝 the balance | Gardiner U38, U+1335D | the balance, drawn from Papyrus of Ani |
| Greece | Ε the E at Delphi | Plutarch, *De E apud Delphos* | the Delphic tripod |
| Canaan | 𐎛𐎍 ʾIl, "El" | Ugaritic U+1039B, U+1038D | a cluster of driven wedge signs |
| Carthage | the sign of Tanit | tophet stelae | **refused at tier 1**, moved to tier 2 |
| Rome | the lituus | Caesar's denarius, RRC 443/1 | the lituus |
| Neutral | the monogram | ours | not specified |

Egypt and Canaan are refinements rather than reversals. The research wanted a
balance and got the balance sign; it wanted Ugaritic wedges and got the two
letters that spell the god whose council Canaan's surface actually convenes.
Canvas 1a is right that `𐎛𐎍` beats a generic wedge cluster, and it asks for a
Ugaritic reader to confirm the spelling before it ships.

Greece and Carthage are reversals, and only one of them is defended.

## Carthage, which the designer flags as broken

The research refused Tanit at tier 1 on three grounds. Canvas 1a promotes it
anyway and says plainly what that costs:

> Two of them I can defend against in the drawing: the tripod collision is
> answered by keeping Tanit in outline while Greece is three separate strokes
> under a bowl, and the 48px test passes. The third I cannot: its densest
> attestation is the tophet stelae, and a launcher icon has no label to disarm
> that.

It also breaks the tier system. The same sign now stands at tier 1 and tier 2,
so C1's rule that Tanit never appears without the word Carthage is broken by the
launcher, which has no label by definition. The designer split the treatments
(plain outline for the launcher in `marks/em-tanit.svg`, solid disc with
upturned arms and a heavier frame for headers in `marks/em-tanit-hdr.svg`) and
calls the result "a placeholder with two real costs, not a resolution".

**What it wants instead:** the cothon, and a Salammbo harbour survey plan to
trace it from. Its words: "a harbour plan is a surveyed document and no glyph
substitutes for it". Failing that, it proposes commissioning a Punic-free
abstraction of the harbour.

## Where it says the research is wrong

**The aquila at tier 2.** Canvas 1a accepts the brief's reasoning and then turns
it around: the brief refused the aquila at tier 1 for meaning rather than
contamination, and meaning does not change with a caption.

> A section head for the auspices carrying a legionary standard says "the army"
> beside a page about lawful days.

It proposes a captioned **templum** in that slot instead, the augur's marked-out
quarter of sky with the lituus laid across it, and drew it: `marks/dr-templum.svg`.
The aquila moves to editorial only.

**The crescent and disc.** The research refused it because it collapses into the
star and crescent at 48px. Canvas 1a agrees for the launcher and disagrees for
the header, on the grounds that the stelae carry the disc under a crescent with
horns up. It keeps the plain disc at launcher size and shows what is lost in
`marks/em-tanit-cr.svg`.

**Baal, the she-wolf and Augustus.** All three traced from photographs supplied
to the project, all three refused at tier 1, and the reasoning is the brief's
own: a deity portrait or an imperial statue says "five civilisations" where the
set needs to say "five ways of reading the sky". It offers them for tier 2 and
editorial on request. Egypt's Ramses is left undrawn because no source arrived,
and the designer refused to draw a colossus from memory.

## The Cinzel question, answered

Canvas 1a keeps Cinzel and gives three product-specific reasons: a Trajanic cap
is the museum wall label's actual voice rather than an allusion to it; it is the
only face a reader sees in caps at large size, where a less conventional display
face would compete with the marks; and it already pairs with Spectral at the
same optical weight.

Then it raises an objection the brief never considered:

> a Roman inscriptional cap sets the titles for four cultures that are not
> Roman. "THE COUNCIL OF EL" in Trajanic caps is a small act of imperial
> typesetting, and the product's whole claim is that five theologies read the
> same sky on equal terms.

Its proposed fix is a code change rather than a font purchase: drop display caps
to Spectral small caps on the four non-Roman surfaces, keep Cinzel for Rome and
the shell. It wants to prototype that before recommending it.

## What this costs in engineering

1. **The launcher marks are type, not drawings.** Egyptian Hieroglyphs (U+13000)
   and Ugaritic (U+10380) are in none of the three shipped faces. Canvas 1a
   already answers this: "THE ANDROID FOREGROUND SHIPS AS A VECTOR OUTLINE OF
   THE GLYPH, NOT AS LIVE TEXT". So the signs must be converted to outlines at
   build time and committed as vectors. No runtime font dependency.
2. **The hieroglyph goes thin at 48px.** Canvas 1a names the fix as a weighted
   cut of the same sign, same outline, heavier stroke, no shape change, and
   calls it "type work, not illustration". Three glyphs need that cut.
3. **Mask fitting is solved.** Setting the glyph at 0.66 of the canvas puts it
   inside the 72-unit safe circle under every mask.
4. **Every mark paints with `currentColor`**, so a culture accent or bone ink is
   a CSS change rather than a second file.

## Open, needing a decision

- Carthage at tier 1: keep the Tanit placeholder, or hold the slot for the cothon.
- Greece at tier 1: the E at Delphi, or the tripod the research chose.
- Rome at tier 2: the aquila, or the templum.
- The four non-Roman surfaces: keep Cinzel caps, or prototype Spectral small caps.
- Whether to trace Baal, the she-wolf and Augustus for tier 2 and editorial.

None of these is implemented. `marks/` holds what Canvas 1a drew, including the
alternatives, so any of them can be taken without redrawing.
