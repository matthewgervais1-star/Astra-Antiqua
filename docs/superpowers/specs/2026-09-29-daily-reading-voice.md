# The reading anatomy: the day and the figure speak to the reader

**Date:** 2026-09-29. **Owner's finding:** "The daily messages in the app, all the language
flows poorly." The owner supplied Co-Star screens and a screen recording as the cadence and
structure reference and called it "a proper buildout". `docs/design/reading-voice.md`
already adopts the reference's cadence and forbids its cultureless voice. This spec keeps
the gods and builds the anatomy.

## What is wrong today

`lib/decree.ts` composes each decree as a sky sentence (`{Deity} {verb} {Deity}`), then a
frame that plugs two "charges" into a fixed sentence, then an instruction when the figure is
exact. A charge is a cryptic metonym for the god (Ra is "the day's own course", Nut is "the
gap of five days outside the year", Ares is "the slaughter looking for a field"). Two charges
in one clause read as a riddle:

> The day's own course and the gap of five days outside the year sit level on the scale, and
> Anubis does not touch the beam.

The headline describes the sky, not the reader. The exactness markers are bolted on the front
("The plumb hangs true:", "Within the hair,"). Nothing says what the day is for.

## The reference, read closely (four screens and a 41-second recording)

**The day page.** Kicker `WEDNESDAY AT A GLANCE`. Headline, a sentence to the reader: "You do
not have to negotiate." Paragraph of three to five short second-person sentences ending in a
concrete instruction: "State your position once, then walk away." Day tabs SUN to THU, each
day its own headline and paragraph. `Do` and `Don't` lists for every reader. Below, a
"dive deeper" set with tabs FAMILY / FRIENDS / WORK / LOVE, each a titled short paragraph
("Luck in sex & love", "Luck with friends", "Luck in work & money", "Changes in home &
family"). The page ends: "COME BACK TOMORROW FOR EVERYTHING ELSE".

**The figure page** (tapping a day opens the transit that rules it). Date. Headline to the
reader: "Enjoy your time alone." A hero image. Paragraph in two moves: the natal placement
first ("As a Virgo Jupiter, you possess a keen ability to discern the essential from the
superfluous..."), then now ("Right now, your need for solitude feels nourishing rather than
isolating..."). `WHAT IT LOOKS LIKE IN SPACE`: a diagram, then the sentence decomposed into
three tagged parts, each a plain phrase with the fact beneath it in mono:

> Emotional shifts `MOON NOW` / are making it easy `TRINE (120°)` / to hone your craft.
> `YOUR VIRGO JUPITER`

"This happens to you approximately once every week." with a timeline (Early Sep · Mid Sep ·
Late Sep · Mid Oct) marking where the span sits now, and `WHAT IS THIS? >` to the glossary.
`HOW THIS PLAYS OUT ON EARTH`: one line ("Right now, the Moon is giving you a moment of
peace.") and four checked concrete manifestations ("moments of quiet stillness amidst
chaos", "sitting at the park, watching people, feeling invisible"). `TRY THIS`: three cards,
Consider (an artwork), Listen (a song), Read (a book). `THE LESSON`: a short closing
reflection with an image.

What to take: the anatomy, the directness, the decomposition of the sentence into its facts,
the recurrence and timeline, the concrete manifestations, the recommendations, the lesson.
What not to take: the voice. Ours is five theologies, and every line below is native.

## The target

Same sky, same gods, same institutions, and every sentence says something to the reader.

Egypt, 2026-09-29 (Sun trine Uranus; Mercury square Mars), the day page:

> TUESDAY · SEPTEMBER 29 · THE HALL OF MA'AT
> **Start the heavy thing while the light holds.**
> RA △ NUT · 0°19′
> The sun keeps pace with the sky today, and what you begin by daylight carries. Ra's scale
> sits level and Anubis leaves the beam alone. Under it, Sebegu pulls against Horus the Red:
> your message and your temper haul the same block on opposite ropes. Send the word before you
> raise the harpoon.
> OFFER: the exact number · the early start · the letter you owe
> WITHHOLD: the reply in anger · the second cup · the rounded sum

Rome, 2026-10-03 (Mars opposite Pluto, exact), the figure page for a reader with natal
Jupiter in Virgo:

> OCTOBER 3, 2026
> **You do not have to force what the ground refuses.**
> As Iuppiter in the Maiden, you weigh a thing before you bless it, and you bless little.
> Right now Mars sits on the opposite bench from Dis Pater, exact to the augur's line, and the
> house is divided: force does not pass, and nothing stays buried.
> WHAT IT LOOKS LIKE IN SPACE
> The god of war `MARS NOW` / takes the opposite bench from `OPPOSITION (180°)` / the lord
> below the earth. `DIS PATER NOW`
> This figure returns about every two years. [timeline: Late Sep · Early Oct · Mid Oct · Late Oct]
> HOW THIS PLAYS OUT IN THE FORUM
> Mars is refusing you the shortcut.
> ✓ a petition that comes back unsigned · ✓ a debt nobody will name at the table · ✓ the urge
> to settle it by shouting · ✓ a door that stays shut until you stop pushing
> TRY THIS
> Consider: the Prima Porta Augustus, hand raised, not sword. Read: Livy on the secession of
> the plebs. Keep: the pontifex's prayer to Mars, said once.
> THE LESSON
> A veto is not a defeat. It is the house telling you the vote is not today.

## The anatomy

### A. The day page (home, and each day of the week)

1. **Kicker** (exists): weekday, date, the culture's institution.
2. **Headline**: one authored sentence to the reader per (culture, aspect kind, headline
   body), the headline body being the fast body of the tightest figure (sun, moon, mercury,
   venus, mars): 125 lines. A sentence a person could say to a friend. No two share a clause.
3. **Evidence line** (mono): the two deity names, the aspect glyph, the orb or EXACT.
4. **Paragraph**, four to six sentences: (a) the meaning sentence, two plain domains and a
   plain relation: "{domain A} and {domain B} {relation}", exactness folded in as a tail;
   (b) the consequence for the reader, one per (culture, kind); (c) the institution image,
   one per (culture, kind), naming the headline god; (d) the second figure in one sentence,
   or the culture's no-second-figure line rewritten to the reader; (e) the instruction,
   always, last, per (culture, kind), naming the headline god.
5. **Do and Don't** (the permissions module, each culture's pair) for every reader: from the
   day's transits to the natal chart when one exists, from the day's sky figures otherwise.
   Three to four items each, concrete nouns.
6. **Dive deeper**: four titled paragraphs, one per house group in the culture's names
   (Egypt: the Granary, the House of the Ka, the Ferry, the Sealed Shrine; Rome: Forum,
   Domus, Via, Templum; the others as `cultureVoice.houseGroups` gives them). Each title is
   the group's concern in plain words ("Luck in work and coin" becomes, for Rome, "The Forum:
   your standing and your coin"). Each paragraph is two or three sentences from the day's
   figures that touch that group (via `lib/dayPressure.ts`'s buckets when a natal chart
   exists; from the sky figures' body domains otherwise), ending in one concrete line. A
   group with nothing in orb gets the culture's quiet line for that group (four per culture).
   *As built:* two groups print one sentence instead of two or three. Without a chart, each
   sky figure is read by one group only, so a group whose every touching figure an earlier
   group already reads prints the culture's pointer line (`DIVE_DEEPER_BANKS.shared`, naming
   the earlier group that reads its tightest figure) in place of a paragraph or a quiet
   line; it is not quiet, since a figure touches it. With a chart, a group reads its contacts
   in `rankContacts` order (a body that moves daily before a slow one, a body against its own
   natal place after the others of its speed, the Moon on the natal Moon last of all, then by
   orb); when the Moon on the natal Moon is the only contact, the group prints the concrete
   line alone, because that contact keys no relation and no consequence, and the day
   pressure module names the same contact for the group.
7. **Closing line**: the culture's "come back tomorrow" (five lines).

The daily message (`lib/dailyMessage.ts`) is the headline plus paragraph sentences (a), (b)
and (e). The week page shows each day's headline above its line (sentences (a) and (b));
tapping a day opens that day's page with the full anatomy.

### B. The figure page (`/transits/[id]` and the new `/day/[date]/figure` for fast bodies)

1. **Date** and **headline** to the reader (the same bank as A.2 for fast bodies; for the
   slow bodies, one line per (culture, kind, slow body): 125 more).
2. **Hero**: the transiting deity's glyph in the culture's hand, large, on the ground.
3. **Paragraph** in two moves: "As {deity} in {sign}, you {placement}." from the natal
   placement (the universal `PLANET_IN_SIGN` paragraph recast in the culture's second
   person, one sentence), then "Right now {sky sentence}: {consequence}.", the consequence
   lowercased after the colon (`composeMoveTwo` in `lib/figureReading.ts`; a colon rather
   than ", and", since the relation and the consequence often carry their own "and"). A
   contact that keys no consequence (the Moon on the natal Moon) ends at "Right now {sky
   sentence}."
4. **What it looks like in space**: the wheel or a two-body diagram, then the decomposed
   sentence: `{transiting domain}` tagged `{DEITY} NOW`, `{relation, short}` tagged
   `{KIND} ({angle}°)`, `{natal domain}` tagged `YOUR {DEITY} IN {SIGN}`.
5. **Recurrence and timeline**: "This figure returns about every {period}." *As built (Task
   16):* each body has a mean geocentric rate (Mercury and Venus keep the Sun's); a natal
   contact returns every 360 / rate days, a sky figure every 360 / |rate a - rate b| days;
   the Sun meets Mercury every 57.9 days and Venus every 291.9 (measured, both conjunctions
   counted), and Mercury with Venus keeps no steady interval, which the page says in the
   culture's words; conjunction and opposition once per cycle, the others twice. A four-tick timeline of the
   span (`computeTransitSpans` for slow bodies; the in-orb window for fast ones) with the
   present marked. `WHAT IS THIS?` links to `/learn/aspects`.
6. **How this plays out** (the section title is the culture's: in the Forum, on the river,
   at the tripod, in the council, on the ledger): one line naming the transiting god's act,
   then four concrete manifestations, checked, from a bank keyed by (culture, house group of
   the natal point, tone): 5 × 4 × 2 × 4 = 160 lines.
7. **Try this**: three cards per (culture, transiting body): Consider (an attested object,
   the traced marks and glyph sources first), Read (a primary text, named), Keep (a small rite
   or habit in the culture's practice). 150 cards, short. *As built (Task 16): 145.* Five
   bodies carry two cards because nothing attested fills the third: Canaan's Shamem (no
   object) and Yammu (no rite); Carthage's Semes (no rite: the tophet's disc-and-crescent
   vows are paid to Baal Hammon and Tanit, not to the sun), Baal Hammon the elder (no rite
   apart from the vow stele Tanit's card already keeps) and Baal Shamem (no object).
8. **The lesson**: one closing reflection per (culture, kind): 25 lines, two sentences, no
   comfort, one image from the institution.
9. **Feedback row** (exists) and the links back to the day, the week and all figures.

### C. Banks

Per culture: 25 fast headlines, 25 slow headlines, 10 domains, 5 relations, 5 consequences,
5 institution images, 5 instructions, 1 no-second-figure line, 4 group quiet lines, 4 group
titles, 1 come-back line, 32 manifestations, 30 try-this cards, 5 lessons. About 160 lines
per culture, 800 in all, authored in `web/src/data/`, replacing `deityCharges.ts` and
`aspectFrames.ts` for the decree.

Rules that do not bend: no sentence repeats across two cultures; no hedging words (may,
might, tends, perhaps, a bit); no abstractions (energy, growth, situation, transformation,
vibes); no therapy register; no em dashes; every domain reads naturally in the subject slot
of every relation it can meet (render the 45 pairs per culture and read them); every
headline is a complete sentence a person could say aloud.

### D. Android

`web/scripts/gen-android-reading-banks.mjs` carries every bank to `ReadingBanks.kt`; the
Kotlin composers mirror the web composers; a JVM parity test pins one date per culture for
the day page and one figure per culture for the figure page. The dashboard decree card, the
week screen and the transit detail screen take the new anatomy.

## Phasing

- **Phase 1 (Task 15):** the day page anatomy A.1 to A.5 and A.7, the daily message, the
  week headlines, both surfaces.
- **Phase 2 (Task 16):** the figure page anatomy B, both surfaces.
- **Phase 3 (Task 17):** dive deeper A.6, both surfaces.

## Verification

- The five-voice test (no shared sentence across cultures for one figure) passes for the day
  page and the figure page.
- A rendered dump of six dates for five cultures, and of five figures for five cultures,
  reads without a riddle; an adversarial review reads every line for flow, hedging,
  abstraction and grammar seams, and the fixes land before commit.
- Screenshots of the day page in all five cultures and of one figure page per culture join
  `docs/design/screenshots/phase12-reading-anatomy/`.
