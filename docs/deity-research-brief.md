# Deity Research Brief — Astra Antiqua

A self-contained prompt for extending and tightening the deity matrix.
Paste this whole document into a research-grade LLM (Claude Opus / GPT-5
Pro / similar). It instructs the model on context, scholarly voice,
deliverables, and output format that will slot back into our codebase.

The current matrix lives at `src/data/deities.ts` and the interpretive
choices are documented at `src/data/methodologyContent.ts` and
`/methodology` on the site.

---

## The prompt

You are a scholar of ancient Mediterranean religion working on **Astra
Antiqua**, an ancient-astrology app that performs standard ephemeris
calculations and renders the results through the religious frameworks of
four ancient cultures: **Egypt, Greece, Canaan, and Carthage**. The app's
core artifact is a translation matrix of 28 entries: seven classical
planets × four pantheons. Each entry currently has a deity name, a single
epithet, and a one-sentence note. Four entries are flagged as contested.

**Your task** is to expand this matrix into something a working
classicist or religious-studies scholar could engage with seriously. The
final product will appear on the site and in the app's voice. The
audience is the literate skeptic, not the new-age customer.

### Current matrix (verbatim from `src/data/deities.ts`)

| Planet | Egypt | Greece | Canaan | Carthage |
|---|---|---|---|---|
| Sun | Ra · The Creator and King | Apollo · God of Light | Shapash · Luminary of the Deities | Semes · The Solar Force |
| Moon | Khonsu · The Traveller | Artemis · The Huntress | Yarikh · Lord of the Night | **Tanit** · Dea Caelestis ⚠ |
| Mercury | **Sebegu** · Aspect of Set ⚠ | Hermes · The Messenger | Kothar-wa-Khasis · The Skilled Craftsman | Sakun · The Guide |
| Venus | Isis · The One Who Crosses | Aphrodite · Goddess of Love | Astarte · Queen of Heaven | Astarte · Lady of the Sea |
| Mars | Horus the Red · God of the Horizon | Ares · God of War | Resheph · Lord of the Arrow | Melqart · Protector of Tyre |
| Jupiter | Amun · He Who Limits the Two Lands | Zeus · King of Olympus | Baal Hadad · Rider of the Clouds | Baal Hammon · Lord of the Sky |
| Saturn | **Geb** · Father of the Earth ⚠ | Cronus · Father of Time | El · Father of Years | **Baal Hammon** · The Ancient One ⚠ |

The four ⚠ entries are flagged as contested in our methodology page. They
deserve special attention; see "Disputed assignments" below.

### Scholarly voice requirements

- **Dry, declarative, museum wall-text register.** Treat the reader as a
  curious adult who will read all five sentences.
- **No new-age or self-help vocabulary.** No "harness", "unlock",
  "discover your true self", "energy", "vibration", "shadow work". The
  word "shadow" appears in the existing copy only in its mythological
  sense (Hades, Khonsu's lunar phases). Keep that constraint.
- **No em dashes.** The codebase forbids them in shipped copy. Use
  semicolons, colons, parentheses, periods.
- **Cite primary sources by author / work / line where possible.** When
  citing modern scholarship, use author + short title + year. Page
  numbers if you remember them. If memory is uncertain, say so.
- **Flag uncertainty explicitly.** "Probable", "disputed", "attested
  only in late sources", "iconographic only", "reconstructive". Do not
  smooth over what the record does not support.
- **No invented inscriptions.** If you do not remember the exact
  reading of an inscription, paraphrase its content and label it as
  such.

### Deliverables, per deity

For each of the 28 entries, expand to the following structure:

```yaml
planet: <sun|moon|mercury|venus|mars|jupiter|saturn>
culture: <egypt|greece|canaan|carthage>
name: <canonical name in our matrix; use the existing one>
alternate_names: [<other attested forms, transliterations, language tags>]
epithets:
  - text: <epithet>
    source: <inscription, text, period; cite by line/section where possible>
  - text: <second epithet>
    source: <...>
  # aim for 3 to 5 epithets per deity, each with a specific source
note_short: <one sentence; this is what already appears on cards>
note_expanded: <four to seven sentences; explains the deity's domain,
  iconography, principal cult center, and the planetary identification's
  evidentiary basis>
planetary_identification:
  strength: <strong | moderate | weak | reconstructive>
  primary_basis: <one of: ancient_explicit | greek_syncretism |
    roman_syncretism | iconographic | functional | scholarly_inference>
  notes: <two or three sentences citing the specific evidence>
contested: <true | false>
sources:
  - <Author, Short Title (Year), pp. X to Y>
  - <Primary work, Section/Line>
```

### Disputed assignments

The four currently-flagged entries each deserve a dedicated dossier of
about 12 to 20 sentences:

1. **Geb at Saturn (Egypt).** The Egyptian planetary name for Saturn was
   *Hor-ka-pet* ("Horus Bull of the Sky"). We use Geb because his
   archetypal weight as the earth-father seemed to translate the Saturn
   principle more legibly for a modern reader. Argue for or against
   this choice. Document the strongest alternatives. Cite the Egyptian
   planetary literature directly (Neugebauer & Parker, *Egyptian
   Astronomical Texts*).

2. **Tanit at Moon (Carthage).** Tanit was a composite goddess.
   Lunar-crescent-over-disc iconography supports the lunar identification.
   Greek syncretism with Artemis supports it. Roman identification with
   Juno Caelestis is mixed. F. O. Hvidberg-Hansen (*La déesse TNT*, 1979)
   is the standard study. Was Tanit primarily lunar, primarily astral
   (the Astarte-like role), or composite? Where are the strongest pieces
   of evidence on each side?

3. **Mercury as Sebegu / Set (Egypt).** The early Egyptian planetary
   name for Mercury was *Sebegu*, attested without strong identification
   with a major god. The Set association is later (Greco-Roman period,
   in Hermetic and astrological literature). Lay out the chronology of
   this identification. When does Set first appear as Mercury's deity?
   What about *Sebek* (Sobek, the crocodile god) which is sometimes
   confused with *Sebegu*?

4. **Baal Hammon at both Jupiter and Saturn (Carthage).** Baal Hammon is
   the chief male deity of Carthage. The Romans equated him with Saturn
   in his agricultural and time-keeping role (*Saturnus Africanus*).
   His sky-sovereign aspect supports a Jupiter identification. We
   currently use the same deity for both planets with two different
   epithets ("Lord of the Sky" for Jupiter; "The Ancient One" for
   Saturn). Argue whether this dual placement is justified. If not,
   propose alternatives. (Who, in the Punic pantheon, would cover the
   Jupiter seat if Baal Hammon is purely Saturn?)

### The Carthage problem

Punic literary sources are nearly entirely lost. Almost everything we
know about Carthaginian religion comes from inscriptions (votive
stelae, Tophet dedications, theophoric names), archaeology, and hostile
Greek and Roman accounts. **Sakun (Mercury, Carthage)** is the
least-well-attested entry in the matrix; flag the weakness explicitly
and document what we actually know about that deity. Suggest stronger
candidates if you can defend them. (Possible candidates from the Punic
inscriptions include *Sakon* / *Sakkun*, *Eshmun* in some readings of
his role, or the use of *Mlk'shtrt* in some periods.)

### Mappings to consider for the next iteration

These are NOT currently in the matrix but are worth examining for
possible inclusion or substitution:

- **Egypt:** Thoth (Mercury, the standard Greco-Egyptian identification,
  much stronger than Set), Hathor (Venus, also strong), Nephthys
  (Saturn?), Bes (??), Sopdet (the dog-star, not a planet but worth
  noting), Anubis (??).
- **Greece:** Helios vs Apollo for the Sun (early Hellenistic vs later);
  Selene vs Artemis for the Moon; Hephaestus or Athena potentially for
  Mercury or Mars in some traditions.
- **Canaan:** Mot (death; underworld, not planetary), Anat (warrior
  consort of Baal), Athirat / Asherah (consort of El, possible
  Venus-adjacent role), Kothar's relationship to Mercury vs to Vulcan /
  Hephaestus.
- **Carthage:** Eshmun (the healing god, possibly a Mercury candidate),
  Reshef (still present in Punic onomastica), Iolaos / Iolaus, and the
  problem of how the Punic pantheon related to the Egyptian one given
  the heavy Egyptian influence on late Punic religion.

### Sources you should consult or cite

Beyond what we already cite (Frank Moore Cross, Hvidberg-Hansen, Pardee,
Ptolemy *Tetrabiblos*, Vettius Valens, Neugebauer & Parker, Roger Beck):

- Pierre Bordreuil and Dennis Pardee, *A Manual of Ugaritic* (2009)
- Dennis Pardee, *Ritual and Cult at Ugarit* (2002)
- John Day, *Yahweh and the Gods and Goddesses of Canaan* (2000)
- Sergio Ribichini and Paolo Xella, work on Punic religion
- Edward Lipinski, *Dieux et déesses de l'univers phénicien et punique* (1995)
- For Egyptian planetary astronomy: Otto Neugebauer and Richard Parker,
  *Egyptian Astronomical Texts* (3 vols, 1960 to 1969)
- For Egyptian planetary names: Sarah Symons, *Egyptian Astronomy* (2014)
- For Hellenistic syncretism: Plutarch *De Iside et Osiride* and the
  *Corpus Hermeticum*
- For Punic religious practice: M'hamed Hassine Fantar, *Carthage:
  Approche d'une civilisation* (1993)

### Output format requested

Deliver in three parts:

1. **Refreshed matrix as YAML** matching the schema above, all 28
   entries.
2. **Four disputed-assignment dossiers** in markdown, one per contested
   entry. About 250 to 400 words each.
3. **A revised sources bibliography** for the `/methodology` page. Group
   by culture and by topic; format as standard scholarly references.

Where you change one of the existing 28 entries (different deity at the
same planet × culture cell), explain why in a one-paragraph rationale at
the top of the YAML for that entry.

### What to do if you are uncertain

Mark uncertain claims with `[uncertain]` inline and write a short
footnote explaining what would resolve the uncertainty (a specific
inscription, a particular scholar's recent work, a comparative source).
The app prefers an honest "we do not know" over a confident error.

---

## Notes for the human using this prompt

- The prompt assumes a serious research-grade LLM. Run it on the largest
  model you have access to; the difference between flagship and smaller
  models on this kind of synthesis is large.
- For best results, run it in three passes:
  1. First pass: ask for the refreshed YAML matrix only.
  2. Second pass: feed the YAML back and ask for the four disputed
     dossiers, using the first pass as context.
  3. Third pass: ask for the revised bibliography.
- After each pass, spot-check at least three citations by hand. LLMs
  hallucinate page numbers and occasionally invent secondary sources.
  The author + work + year combination is usually reliable; specific
  page numbers and inscription-line numbers are less so.
- For the Carthage problem specifically, consult Lipinski's *Dieux et
  déesses de l'univers phénicien et punique* if your library has it;
  it is the most comprehensive single reference and not always
  well-represented in LLM training data.
- When the output comes back, the easiest way to integrate it is to
  paste the YAML into a temporary file and write a script that emits
  the new `src/data/deities.ts` and `src/data/methodologyContent.ts`
  from it. That keeps the source of truth in the YAML and lets you
  iterate the prompt without rewriting code.
