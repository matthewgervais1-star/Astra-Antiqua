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
These sentences appear **verbatim in both**, for unrelated transits:

- "This part of yourself will transform into something else."
- "As a result of this situation, part of your personality will change and be
  replaced with something new."

And these are frames with a slot:

- "You will have to deal with ___ replacing your natural ___."
- "This transformative situation will see its beginnings in ___."
- "These changes might be related to ___."

That is a template with keyword fills. It produces four failures we must not
reproduce:

| Failure | Reference example | Our rule |
|---|---|---|
| **Template seams** | The same closing sentence on every transit | No sentence may repeat across two readings. The spine repeats; the sentences do not. |
| **Hedging** | "may feel a bit", "might be related to", "Try not to" | Declare. If the sky does not say it, say nothing. |
| **Abstraction** | "this transformative situation", "large-scale change" | Concrete nouns from the culture's own world: the scale, the harbor, the sickle, the docket, the censor's list. |
| **Therapy register** | "It may be painful, but this is how you grow." | The gods do not counsel. They weigh, question, convene, audit, and rule. |

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

## The bar, stated as a diff

The reference says:

> This part of yourself will transform into something else. It may be painful,
> but this is how you grow.

The same sky, in the Greek voice, must instead sound like:

> Kronos has settled against this point, and he does not visit briefly. He
> carries the sickle, and the sickle has one question: what here is ripe, and
> what is only tall?

Same structural slot. Same directness. A theology instead of a mood.
