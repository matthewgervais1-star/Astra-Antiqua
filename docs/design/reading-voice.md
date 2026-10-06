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
   friend, with a noun from the culture's own world: "Start the heavy thing
   while the light holds." Keyed by culture, aspect kind and the headline body
   (the fast body of the figure, the faster when both are). 125 lines, no two
   alike, and no run of three words (other than stop words such as "the",
   "your", "and") appears in two cultures' headlines; `decreeBanks.test.ts`
   checks it.
2. **Evidence line**, in mono: the two gods, the glyph, and the orb, or EXACT
   under half a degree (`RA ⚹ AMUN · 1°19′`, `MARS ☍ DIS PATER · EXACT`). Half a
   degree is the one exact threshold for the evidence line, the exact tail and
   the week's flag. The sky's facts sit here, under the headline, so the
   prose does not have to recite them.
3. **One paragraph of five sentences**: the meaning ("your day's work and your
   plans for the new season float on the same current", two plain domains and
   a relation, with one of the culture's exact tails under half a degree);
   the consequence, keyed by the kind and the partner body; the institution's
   image, keyed by the kind and the headline body and naming the headline god;
   the second figure in one sentence, opened by one of three phrases; and,
   last, the instruction, keyed by the kind and the headline body and written
   for that body's domain. Two kinds per culture close the instruction on a
   rite to the god; the other three end on the act itself.

The banks live in `data/decreeBanks.ts` and `data/deityDomains.ts`. A domain is
plain second person ("your letters", "your war chest"), never a metonym the
reader has to decode, and it reads as the subject of every relation. The
instructions are written per headline body, so no domain sits in an object
slot.

**The sky picks the figure; the day picks the words.** The headline figure is
the tightest figure that touches a fast body, every day, and nothing moves it to
avoid a repeat: that would be the editorializing the method page disowns. When
the sky changes figure, no sentence returns within seven days. When the same
figure holds for days, the headline holds with it, because the sky did; the
paragraph rotates its openers and tails so two days never print alike. The
relation, the exact tail and the second-figure opener each come in three
variants chosen by the UTC day number. The opener names the headline figure's
two gods, so two different figures never print the same second sentence,
unless the two figures share a god; then the opener names no god at all.

The rule has exceptions, and they follow the keys. The meaning sentence names
both domains, so it never returns under a new figure. The other sentences can:

- The **headline**, the **image** and the **instruction** are keyed by the
  kind and the headline body. Two figures with the same kind and headline body
  (Moon square Saturn, then Moon square Pluto four days later) print the same
  three lines within the week.
- The **consequence** is keyed by the kind and the partner body. Two figures
  that share both (Sun conjunct Mars, then Venus conjunct Mars) print it alike.
- The **second-figure sentence** returns when the same second figure falls on
  the same day variant under a headline figure that shares one of its gods.

`decree.test.ts` checks that every return within seven days has one of these
causes, and no other.

**What asks.** The day page asks more than once, and each ask is earned by the
sky. The headline is an order more often than not. The paragraph ends on one
concrete instruction, because a page that says what the day means and not what
to do with it reads as a riddle. The Do and Don't lists name things to do, give, ask, bring or
pay, and things to hold back, each in the culture's own pair of verbs. The votive asks once more. The week asks only in its
headlines; the line under each headline (the meaning and the consequence) and
the ingress lines never order. A week row whose figure is the row above's
prints the culture's holds line ("The auspices stand as they stood.") in place
of a second copy of the headline.

A daily message (`lib/dailyMessage.ts`) is the headline plus the meaning, the
consequence and the instruction, every one a sentence the day page prints.
There is no bank of fixed daily lines: a message that says the same thing
whatever the ephemeris shows is the invention the method page disowns.

The Do and Don't lists (the culture's permission pair) show for every reader.
They come from the bodies of the day's figures (`data/permissionsRegister.ts`,
three of each per body, two to four words): on a day of favor the headline
figure's bodies fill the first column and the second figure's the second; on a
day of trial the two swap. The UTC day turns which of a body's three items
leads, so a figure that holds from one day to the next does not print the same
lists twice. Every item fits its column verb and needs no footnote.

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
