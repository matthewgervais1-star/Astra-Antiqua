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

## Fill these in before the policy can be served

All of them live in `src/lib/legal/policyFacts.ts`.

| Field | Note |
| --- | --- |
| `legalName` | Legal or registered business name, not the product name |
| `privacyEmail` | A role alias such as `privacy@`, never a personal inbox. It is the statutory destination under s. 30 and it survives a change of person |
| `postalAddress` | Access requests arrive by post, and CPA s. 54.4 requires an address and a telephone number at checkout anyway |
| `effectiveDate`, `lastUpdated` | The CAI's drafting guide asks for both, separately |
| `appHost`, `databaseHost`, `databaseRegion` | Blocked on the hosting decision |
| `dormantAccountMonths`, `thirdPartyChartMonths`, `backupRetentionDays` | Defaults of 24, 12 and 7 are placeholders you must actually implement. `backupRetentionDays` has to be the provider's real window, because a reader can test the claim |

## Before deploying with real data

**1. Check for a Montreal region first.** s. 17 attaches to sending personal
information outside **Quebec**, not outside Canada, so Toronto does not help.
A Montreal region for the database removes that leg of s. 17 entirely. This is
the cheapest fix available and it should be settled before anything else here.

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

**5. [LAWYER] Decide the third-party chart question.** In rough order of legal
effect: drop the real-name field for charts that are not your own; remove the
`relationship` enum; shorten retention for non-self charts; publish a removal
route that works without an account; add a user attestation last.

The two that actually change the analysis are schema changes, not wording.
s. 6 says information about a person must be collected from that person, and
"the latter" in that sentence means the person concerned, not the account
holder. A warranty in the terms does not discharge this: the Federal Court of
Appeal held in *Privacy Commissioner of Canada v. Facebook, Inc.*, 2024 FCA 140
that an organization relying on third-party consent must still take reasonable
measures to ensure that consent was meaningful, judged from the perspective of
a reasonable person rather than by contract.

Note also s. 40, which pulls the other way: you **must refuse** to disclose
information that would reveal personal information about a third person where
disclosure may seriously harm them. Telling someone which account saved a chart
tagged "partner" for them can do exactly that. Write the playbook before you
need it: confirm what is held about the requester, do not reveal who entered it
by default, and run the serious-harm assessment first.

**6. The confidentiality incident register, created empty.** s. 3.8 is
unconditional: it must exist before there is anything to record. Build it to
the eight fields in the Regulation respecting confidentiality incidents
(RLRQ c. A-2.1, r. 3.1, s. 7), which include the reasoning behind concluding
there is **no** risk of serious injury, so no-risk determinations go in too.
Entries are kept at least five years. Keep it outside the application database,
or an incident affecting the app takes the register with it.

**7. The incident runbook.** Notification to the CAI needs eleven items
including the Quebec enterprise number, so have the NEQ ready. Include the
public-notice fallback for chart subjects you have no way to contact, which is
a direct consequence of holding their data without their contact details.

**8. The request-handling workflow.** A monitored `privacy@`, identity
verification proportionate to the request, a ticket log with a 30-day timer, a
refusal template carrying the four elements s. 34 requires, and an intake route
for people without an account. Decide the s. 33 charging position and state it.

**9. Two statutory holds must be coded into any deletion job** or it will
destroy evidence the Act requires you to keep: s. 11 (information used to make
a decision about a person is kept at least a year after the decision) and s. 36
(information subject to an access or rectification request is kept until the
applicant's recourses are exhausted).

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
