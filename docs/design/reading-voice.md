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
   checks it. Five headlines that give the same advice in five worlds are the
   product (same sky, same meaning); a headline a reader could move to another
   culture unnoticed is a template fill, so each one carries a noun, place or
   institution of its own world (the sledge, the Pnyx, the ram's horn, the
   suffetes, the paterfamilias).
2. **Evidence line**, in mono: the two gods, the glyph, and the measured orb
   (`RA ⚹ AMUN · 1°19′`, `RA △ NUT · 0°19′`). It says EXACT only under one
   minute of arc (`MARS ☍ DIS PATER · EXACT`) and never rounds a near miss up
   to it. Half a degree is the tight threshold, `TIGHT_ORB` in `lib/decree.ts`
   and one constant on both surfaces: under it the meaning sentence carries the
   culture's tight tail and the week flags the day TIGHT. The sky's facts sit
   here, under the headline, so the prose does not have to recite them.
3. **One paragraph of five sentences**: the meaning ("your day's work and your
   plans for the new season float on the same current", two plain domains and
   a relation, with one of the culture's tight tails under half a degree);
   the consequence, keyed by the kind and the partner body; the institution's
   image, keyed by the kind and the headline body, naming the headline god and
   no other, and claiming nothing about the sky: no phase, no visibility, no
   rising or setting, no kinship to the partner (`decreeBanks.test.ts` walks
   the image bank for every deity name and for the words that make those
   claims); the second figure in one sentence, opened by one of three phrases;
   and, last, the instruction, keyed by the kind and the headline body and
   written for that body's domain. Two kinds per culture close the instruction
   on a rite to the god, and at most four of the fifty rites pour a cup; the
   rest lay, burn, hang or leave something. The other three kinds end on the
   act itself.

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
relation, the tight tail and the second-figure opener each come in three
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
lists twice. Every item reads as the object of its column verb when the verb is
spoken before it (OFFER a short letter, HOLD BACK your blade at supper, DEFER
perfume on credit), with no footnote and no inverted sense; the register is
read through in column order that way whenever an item changes.

A reader with a chart gets lists from the day's transits to it instead: the
tightest contact (a transiting body to a natal planet) and the tightest
contact of another kind fill the columns by the same rule, and the day turns
the items the same way. Only the bodies that move daily (Sun, Moon, Mercury,
Venus, Mars) are read while one touches the chart, because a slow body's
contact holds for months and belongs to the long transits. A body against its
own natal place is left out.

## Dive deeper

Under the lists, four titled paragraphs, one per house group in the culture's
names (`data/diveDeeperBanks.ts`, composed by `lib/diveDeeper.ts`). The title
is the group's name and its concern in plain words ("The Forum: your standing
and your coin"); a mono line under it names the figure the paragraph reads.
The paragraph is composed, not written, from banks the page already has:

1. **The two domains and a relation**, the group's own domain first. The
   relation is one of the two variants the decree does not use that day, so
   the paragraph never repeats the decree's meaning sentence; a variant that
   shares a word with the consequence gives way to another.
2. **The consequence**, keyed as the decree and the figure page key it. One
   already printed on the page gives way to the other body's, or to none.
3. **One concrete thing**, from the figure page's manifestations for the group
   and the tone, turned by the UTC day, in the culture's frame ("Reckon on
   ...", "Take ... as Delphi's reply", "Be ready for ...", "Enter it in the
   daybook: ...", "Count ... as a sign.").

Without a chart a group reads the tightest sky figure with a body whose domain
the group keeps, one group to a figure while another figure is free. With a
chart it reads the tightest transit to a natal point in its houses (the day
pressure module's buckets), from a body that moves daily when one touches the
group. A group nothing touches prints the culture's quiet line for it, one of
four. The come-back line closes the page under the dive deeper.

## The figure page

A reader opens one figure from the day's headline, a week row or a long
transit, and reads it the way the reference reads its own (the spec's
section B). The banks are `data/figureBanks.ts`; `lib/figureReading.ts`
composes them and `lib/recurrence.ts` says how often the figure returns.

1. **Headline and evidence.** A day's figure prints the day page's own
   headline and evidence line, so the two pages agree. A long transit reads
   one of 125 slow headlines, per (culture, kind, slow body). With a chart,
   the page reads one figure from the evidence line down: the contact
   between a body of the sky figure and the natal planet it touches. A mono
   bridge line under the evidence names that contact
   (`MARS ⚹ YOUR MERCURIUS · 0°41′`), and the paragraph, the diagram, the
   recurrence, the god's act, the cards and the lesson all read it. A body
   against itself is left out: the page reads one domain against another,
   and a body against its own natal place would read one domain twice.
2. **The paragraph, in two moves.** Move one is the reader: the natal point
   the contact touches, in the culture's frame, around one authored clause
   per body and sign (`PLACEMENT_CLAUSES`, 120, universal: the frame carries
   the culture). Each clause opens on "you" and says something the reader
   does: "As Iuppiter in the Maiden, you weigh a thing before you bless it,
   and you bless little." With no chart, move one is the transiting god in
   its sign and the domain it keeps. Move two is now: "Right now {two
   domains and the relation}: {the consequence}." The colon keeps the
   relation's "and" and the consequence's "and" from stacking into a third.
   The tight tail stays on the day page; the evidence line already says how
   close.
3. **What it looks like in space.** The figure drawn as two radii on one
   ring, then the sentence taken apart into three parts, each with its fact
   in mono: the transiting domain over `MARS NOW`, the relation over
   `TRINE (120°)`, the second domain over `YOUR IUPPITER IN VIRGO` or
   `NEPTUNUS NOW`. The relation's short form opens on a modal (can, must,
   will, cannot) so it reads after a plural domain and a singular one alike.
4. **Recurrence.** A figure returns when the sky brings it back: each body
   has a mean geocentric rate (Mercury and Venus keep the Sun's), a natal
   contact returns every 360 / rate days, and a sky figure every
   360 / |rate a - rate b| days. When the two rates are the same the
   interval is measured instead: the Sun meets Mercury about every 58 days
   and Venus about every 292 (inferior and superior conjunction both
   count), and Mercury and Venus meet anywhere from a few days to most of a
   year apart, so that pair's page says it keeps no season, in the
   culture's words. A conjunction or an opposition comes once in the cycle,
   the other kinds twice. So a Mercury contact to your chart returns about once a year, Sun
   and Mars meet about every two years, and the Moon's figures come round
   within the month. It is said in words each calendar can say truthfully,
   in days under sixty, months under twenty-four and years beyond: Egypt
   counts decans and its four-month seasons, the lunar calendars say twice a
   month, and Rome, whose market week ran eight days, counts the half month
   in days. No culture borrows a seven-day week.
5. **How this plays out** in the institution (on the river, at the tripod,
   in the council, on the ledger, in the forum): the god's act, then four
   concrete things the reader will see, keyed by the house group of the
   natal point and the tone. Without a chart the group comes from what the
   partner body governs.
6. **Try this.** Up to three cards: an object to consider, a text to read, a
   rite or habit to keep, each with its source on one line. Every card is
   attested; where nothing attested fits, the body carries two cards rather
   than an invented third (145 of 150; the spec's section B names the five
   bodies).
7. **The lesson.** Two sentences, no comfort, one picture from the
   institution, and no god but the one the page is about.

The figure page asks once, in its cards. It gives no instruction of its own:
the day page already ends on one.

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
