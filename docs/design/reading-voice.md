# The reading voice

The cadence spec for every personal reading on this surface. Derived from the
Co-Star reference screens in `docs/design/references/` (supplied by the product
owner) read against the rebrand brief's voice mandate.

The reference is a **cadence and structure** reference only. Its prose is not
a source: it is deliberately cultureless, and the brief is explicit that our
differentiator is the opposite. Learn the spine and the directness. Keep the
gods.

## What the reference gets right (adopt)

1. **Duration scoping.** The header names a real span ("Through 2028") and a
   process, not an event ("Pluto transforming responsibility"). A long reading
   is a term, not a mood.
2. **A fixed narrative spine.** Four movements, always in order:
   what is changing · where it begins · what it touches · what it leaves behind.
   The structure repeats across every reading; only the content varies. This is
   what makes a reading feel authoritative rather than improvised.
3. **Direct address, present tense.** The reader is spoken to, not described.
4. **Quiet presentation.** One column, generous line height, nothing competing
   with the text, a functional footer.
5. **A cheap verdict affordance.** ACCURATE / NOT ACCURATE, costing one tap.
   Ours is IT WAS SO · IT WAS NOT SO.

## What the reference gets wrong (beat it)

Read the two long-transit references side by side and the engine shows through.
Two of its sentences appear **word for word in both** readings, for unrelated
transits: one asserting that a part of the self will become something else,
and one closing that a part of the personality is replaced with something new.
Three more are frames with a blank: a cause slot, a beginnings slot, and a
hedged relation slot. Quoting them here is neither necessary nor ours to do;
the finding is what matters, and it is reproducible from the reference screens
in one reading.

That is a template with keyword fills. It produces four failures we must not
reproduce:

| Failure | What it looks like | Our rule |
|---|---|---|
| **Template seams** | The same closing sentence under every transit | No sentence may repeat across two readings. The spine repeats; the sentences do not. |
| **Hedging** | may, might, tends to, try not to, a bit | Declare. If the sky does not say it, say nothing. |
| **Abstraction** | situation, transformation, growth, energy | Concrete nouns from the culture's own world: the scale, the harbor, the sickle, the docket, the censor's list. |
| **Therapy register** | Reassurance about pain being growth | The gods do not counsel. They weigh, question, convene, audit, and rule. |

## The constant and the variable

**Constant across all five cultures** (this is the cadence borrowed from the
reference):

- Short declarative sentences. One thought each.
- Second person, direct, unhedged.
- The four-part spine, in order.
- Ends on one concrete instruction, never a summary.
- No semicolon chains. No em dashes anywhere in `web/src`.

**Variable across the five cultures** (this is the whole product):

- The institution the reading is issued from, and its procedure.
- The deity, with its real attested domain and myth.
- The concrete nouns: what gets weighed, sailed, sworn, filed, harvested.
- What counts as a good or bad outcome in that theology.

Egypt weighs. Greece questions. Canaan convenes. Carthage audits. Rome rules.

The acceptance test is the five-voice check (`3a-voice-check-*` in the handoff):
the same placement, read five ways, sharing **no sentence and no image**. If two
cultures could swap a sentence without anyone noticing, that sentence is a
template fill and must be rewritten native.

## The decree, and what a daily line may say

The home decree and the week's daily lines are composed, not written, and the
composition speaks to the reader. The shape, from
`docs/superpowers/specs/2026-09-29-daily-reading-voice.md`:

1. **Headline.** One sentence to the reader, the kind a person could say to a
   friend: "Start the heavy thing while the light holds." Keyed by culture,
   aspect kind and the headline body (the fast body of the tightest figure,
   the faster when both are). 125 lines, no two alike.
2. **Evidence line**, in mono: the two gods, the glyph, the orb or EXACT
   (`RA △ NUT · 0°19′`). The sky's facts sit here, under the headline, so the
   prose does not have to recite them.
3. **One paragraph of five sentences**: the meaning ("your day's work and your
   sudden turns float on the same current", two plain domains and a relation,
   with the culture's exact tail under half a degree); the consequence for the
   reader; the institution's image, naming the headline god; the second figure
   in one sentence; and the instruction, always last, naming the headline god
   and its domain.

The banks live in `data/decreeBanks.ts` and `data/deityDomains.ts`. The rule
the old charges enforced still holds: **every sentence after the evidence line
takes the figure**. A line keyed on the aspect kind alone carries a god's name
or a domain, so Sun sextile Mars and Moon sextile Venus never print the same
sentence. A domain is plain second person ("your letters", "your war chest"),
never a metonym the reader has to decode.

**Two asks per screen, and both are earned.** The old rule allowed one ask, the
votive, and let the decree order only on an exact figure. The reading-voice
spec amends it: every day page ends on one concrete instruction, because a page
that tells the reader what the day means and not what to do with it reads as a
riddle. The votive stays. Week lines and ingress lines still never order: a
week day shows its headline and the meaning and consequence beneath it.

A daily message (`lib/dailyMessage.ts`) is the headline plus the meaning, the
consequence and the instruction, every one a sentence the day page prints.
There is no bank of fixed daily lines: a message that says the same thing
whatever the ephemeris shows is the invention the method page disowns.

The Do and Don't lists (the culture's permission pair) show for every reader,
seeded from the day's sky figures when no chart is saved.

## The bar, stated in our own prose

The test is not a comparison against anyone else's page. It is whether a
passage could only have been written for this body, in this theology.

Our Greek Saturn passage:

> Kronos has settled against this point, and he does not visit briefly. He
> carries the sickle, and the sickle has one question: what here is ripe, and
> what is only tall?

Read it against the four failures above. It declares rather than hedges. Its
nouns are a sickle and a stalk, not a situation. It issues no comfort. And it
could not be moved to another culture or another planet without rewriting every
clause, which is the property a template can never have.
