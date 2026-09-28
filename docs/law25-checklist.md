# Law 25: what is built, what is decided, what is left

This tracks Quebec's Act respecting the protection of personal information in
the private sector (P-39.1, "Law 25") for Astra Antiqua. Statutory sections are
cited so a lawyer can check the reasoning rather than re-derive it.

Not legal advice. The items marked **[LAWYER]** turn on judgment a developer
should not be making alone.

## Built

- `/privacy` and `/confidentialite`, one renderer over two copy objects, so a
  section cannot exist in one language and go missing in the other. The
  Consumer Protection Act (s. 26) resolves a discrepancy between versions in
  the consumer's favour, which makes drift a liability rather than untidiness.
- Both routes return 404 while `src/lib/legal/policyFacts.ts` still holds a
  placeholder, and the build log names every unfilled field. A policy with
  holes in it is a published false statement about how personal information is
  handled, so it must not be reachable.
- The out-of-Quebec paragraph is conditional on `transferAssessmentCompleted`.
  The page cannot claim an assessment that has not happened, because s. 17
  requires the assessment **before** the transfer.
- `storedOutsideQuebec()` reads the configured region, so pointing the database
  at Montreal switches the policy to the in-province wording automatically.
- Data export (`GET /api/me/export`) and account deletion (`DELETE /api/me`,
  with an FK cascade verified against real Postgres). These already exceed what
  ss. 27 and 23 require. Record the export as a completed s. 3.3 control.
- `privacyCopy.test.ts` checks the two languages carry the same sections, the
  same interpolated facts, and no token the renderer cannot fill.
- One chart per account, enforced by a unique index rather than by application
  code remembering to check. Verified against real Postgres by `pnpm test:db`.
- Terms of service at `/terms` and `/conditions`, on the same renderer and the
  same 404-until-filled guard. They stay a separate route from the policy: the
  CAI's drafting guide lets terms link to a privacy policy but not merge with
  one. The distance-contract disclosures CPA s. 54.4 requires at checkout are
  NOT in them, because there is no checkout yet.
- The retention schedule (`web/src/lib/auth/retention.ts`), with both statutory
  holds. Verified against real Postgres: 9 tests covering dormancy, the grace
  period, a return cancelling a pending deletion, and a hold outranking the
  schedule.
- The confidentiality incident register, created empty, at
  `docs/incident-register.md`, and the runbook at `docs/incident-runbook.md`.
- The OpenStreetMap geocoder no longer autocompletes. Nominatim's usage policy
  says autocomplete "must not" be implemented against it, and both birth forms
  did exactly that on a 350 ms debounce. The bundled 61-city list still filters
  as you type; reaching Nominatim now takes an explicit press. Verified in the
  browser: typing ten characters produced zero requests, one press produced
  exactly one.

## Fill these in before the policy can be served

All of them live in `src/lib/legal/policyFacts.ts`.

| Field | Note |
| --- | --- |
| `legalName` | Legal or registered business name, not the product name |
| `privacyEmail` | A role alias such as `privacy@`, never a personal inbox. It is the statutory destination under s. 30 and it survives a change of person |
| `postalAddress` | Access requests arrive by post, and CPA s. 54.4 requires an address and a telephone number at checkout anyway |
| `effectiveDate`, `lastUpdated` | The CAI's drafting guide asks for both, separately |
| `appHost`, `databaseHost`, `databaseRegion` | Blocked on the hosting decision. `storedOutsideQuebec()` reads the region string, so a Montreal value switches the policy to the in-province wording on its own |
| `dormantAccountMonths`, `backupRetentionDays` | Defaults of 24 and 7 are placeholders you must actually implement. `backupRetentionDays` has to be the provider's real window, because a reader can test the claim |

## Before deploying with real data

**1. ~~Check for a Montreal region first.~~ CHECKED. The answer is mostly no.**

s. 17 attaches to sending personal information outside **Quebec**, not outside
Canada, so Toronto does not help. Verified against each provider's own region
list in September 2026:

| Provider | Canadian region? | In Quebec? |
| --- | --- | --- |
| Neon | none at all | no |
| Vercel Functions | none | no |
| Fly.io | Toronto `yyz` only | no, Ontario |
| Supabase | `ca-central-1` | **yes, Montreal** |

Two things follow.

**The database can stay in Quebec, on Supabase `ca-central-1`.** That is the
only mainstream managed Postgres with a Montreal region, and it is where the
personal information actually sits at rest. Neon cannot do this at all, and
Neon fixes the region at project creation with no way to move it, so choosing
Neon is choosing the assessment.

**The application tier cannot, on any mainstream platform.** Vercel has no
Canadian function region and Fly's nearest is Ontario. The app reads and
processes the same personal information, so hosting it in the United States is
a communication outside Quebec whatever the database does. s. 17 therefore
applies unless the whole stack moves to a Montreal machine (AWS `ca-central-1`
directly, or a Quebec VPS), which trades the assessment for owning the ops.

So the realistic choices are: accept s. 17 and do the assessment once; or
self-host in Montreal and avoid it. Putting the database in Montreal and the
app in the United States reduces the exposure without removing the obligation.

**2. The s. 17 privacy impact assessment**, if any data does leave Quebec. It
gates deployment, not just payment, and s. 17's third paragraph closes the
outsourcing argument explicitly. A few pages is proportionate under s. 3.3. It
must address four factors by name: the sensitivity of the information, the
purposes, the protection measures including contractual ones, and the legal
framework of the receiving state. It needs a written conclusion that the
information receives adequate protection. Quebec publishes no adequacy list,
so that determination is yours. Nothing is filed with the CAI, but the report
is the only evidence the assessment happened.

**3. Signed DPAs, read against s. 18.3**, which lists five required elements:
a written mandate, confidentiality measures, use limited to the contract, no
retention after expiry, notification to the person in charge of any violation
or attempted violation, and the person in charge's right to verify. US DPAs
are drafted to GDPR Article 28 and are frequently silent on the last two.
Record which elements each provider satisfies and which they do not.

**4. The s. 3.3 assessment for the system itself.** A separate trigger from
s. 17 that applies even if everything sits in Montreal, because building the
app is a project to develop an information system involving personal
information. Combine it with the s. 17 document.

**5. ~~Decide the third-party chart question.~~ RESOLVED IN THE SCHEMA.**

The app no longer stores anyone's chart but your own. The `charts` table has a
unique constraint on `user_id`, the `relationship` column is gone, and a
synastry comparison is computed in the browser against details that are never
written to disk and never sent to the server. The Android app had always
worked this way; web now matches it.

This closes the cluster rather than mitigating it. There is no s. 6 collection
from a third party, no s. 28 rectification request from a stranger, no s. 40
serious-harm assessment when someone asks who entered their data, and no
impossible s. 3.5 breach notification to people you have no way to contact.
The answer to "what do you hold about me" is nothing, unless the asker has
their own account.

What it cost: the "sell extra chart slots" idea is foreclosed. Slots on the
reader's own device cannot be metered server-side.

**6. ~~The confidentiality incident register.~~ CREATED EMPTY.**
`docs/incident-register.md`, with the eight fields from the regulation and a
note that no-risk determinations go in too, which is the part most registers
miss. Kept as a file rather than a table so an incident affecting the app
cannot take the register with it.

**7. ~~The incident runbook.~~ WRITTEN.**
`docs/incident-runbook.md`. Get your NEQ before you need it. The public-notice
fallback is not in the plan because it is no longer needed: every person whose
data could be exposed has an account and therefore an email address.

**8. The request-handling workflow.** A monitored `privacy@`, identity
verification proportionate to the request, a ticket log with a 30-day timer, a
refusal template carrying the four elements s. 34 requires, and an intake route
for people without an account. Decide the s. 33 charging position and state it.

**9. ~~Two statutory holds in the deletion job.~~ BUILT.**
`legal_holds` is read by the sweep rather than remembered by anyone. s. 11 is
a hold with an expiry; s. 36 is a hold with none, which blocks deletion while
recourses stay open. `placeHold()` records either.

**10. Wire a mail sender before retention does anything. BLOCKING.**
The policy promises a warning before a dormant account is deleted, and there is
no way to send one: no nodemailer, no Resend, no provider of any kind. The
sweep is built to fail safe, so with no sender it warns nobody and therefore
deletes nobody. That keeps the promise honest but it also means retention does
not actually run.

A sender is a new processor. It needs disclosure in the policy, a DPA, and a
s. 17 assessment if it stores anything outside Quebec, which most do.

**11. Schedule the sweep.** `runRetentionSweep()` has no trigger. On Vercel
that is a cron entry in `vercel.json` hitting a route guarded by a shared
secret. Not written, because it depends on the hosting decision.

## French is required, and it is not Law 25 that requires it

Law 25 is language-neutral. The word "French" does not appear in P-39.1. The
obligation comes from the Charter of the French Language: s. 52 for documents
available to the public, ss. 5 and 50.2 for consumers, s. 52.1 for software
interfaces including the Android app, and s. 55 for pre-determined contracts,
which applies with no payment condition at all.

Charging money raises the stakes rather than triggering the rule. Charter
s. 204.21 removes the usual burden: a party invoking nullity for a s. 55
contravention does not have to prove injury, and the court must grant the
application unless the other side shows there was none. A Quebec customer shown
only English terms can unwind the paid contract.

On prominence, three standards get conflated. For a public-facing document the
s. 52 test is that the French version be available "on terms at least as
favourable", not equal prominence (s. 51, products) and not markedly
predominant (s. 58, signage and advertising).

Practically: serve French by default to Quebec visitors with a switch that is
not buried, never charge for the French version (CPA s. 26), and get the French
professionally reviewed. The "clear and simple language" standard applies to it
too, and a discrepancy is read in the consumer's favour, so a weak translation
fails twice. The French in `privacyCopy.ts` is a solid draft and is **not** a
substitute for that review.

## Before the first payment

- Re-run the s. 3.3 assessment for the payment integration, plus s. 17 and a
  written agreement for the processor.
- Keep card data out of the app entirely. Hosted checkout or hosted fields.
- Change the deletion flow so tax-mandated billing records survive while
  everything else is destroyed, and say so plainly in the retention section.
- CPA s. 54.4 distance-contract disclosures before the contract: name, address,
  **telephone number**, technological address, detailed description, itemized
  and total price, currency, performance date, and the cancellation and refund
  conditions, prominent and retainable. s. 54.5 needs an express opportunity to
  accept, decline and correct errors; s. 54.7 a retainable copy within 15 days.
  Miss any of it and s. 54.8 gives a seven-day cancellation right.
- Quebec Bill 10, assented 12 June 2026, adds an accessible online cancellation
  button, written notice before a trial or promotional price ends, and
  non-periodic fees shown alongside the monthly amount. Read the amending Act
  before finalizing checkout; this came via the Office de la protection du
  consommateur rather than consolidated statute.
- A month-to-month indeterminate-term plan avoids most of CPA ss. 214.1 to
  214.8. One-time purchases avoid it entirely.
- **[LAWYER] Decide whether EU and UK customers are wanted at launch.** This is
  the largest fixed cost in the file. Yes means an Article 27 representative
  appointed in writing in the EU, a **separate** one for the UK, Article 30
  records, a lawful basis per purpose, and an Article 46 mechanism for the
  Quebec-to-US hop, since Canada's adequacy decision does nothing for the
  onward transfer. No means pricing only in CAD, not marketing into the EU, and
  publishing no GDPR annex.

## Oldest unmet duty

Publishing the title and contact information of the person in charge has been
in force since **22 September 2022** (s. 3.1, third paragraph). The role is
already yours by operation of law: s. 3.1 second paragraph assigns it to the
person exercising the highest authority unless it is delegated. Nothing needs
appointing. Publication is the missing step, and filling `privacyEmail` and
`postalAddress` completes it.

Do not call this role a Data Protection Officer. That is a GDPR Article 37 role
carrying independence and reporting duties that do not exist here.

## Corrections to things commonly repeated

- The CAI guide does **not** require the s. 8.2 policy and the s. 3.2
  governance information to be separate documents. Its non-merger rule is about
  terms of service, which is why the terms are a separate route here.
- De-indexation (s. 28.1) does not apply while nothing is published or indexed.
  It becomes live the day a public chart link or profile ships.
- Do not describe destruction as anonymization. The threshold in s. 23 and the
  anonymization regulation is high, and a name with an exact birth minute and
  coordinates is close to a unique fingerprint.
- Do not cite s. 7 for source disclosure here. The French text limits it to
  collection from another person **carrying on an enterprise**, which a
  consumer typing a friend's birth data is not. **[LAWYER]** to confirm.
