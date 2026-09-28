# Confidentiality incident runbook

Law 25 gives you one obligation measured in hours, and you cannot write the
plan during the incident. This is the plan.

Not legal advice. The thresholds here come from the statute and the Regulation
respecting confidentiality incidents (RLRQ c. A-2.1, r. 3.1); the judgment call
in step 3 is yours, and a lawyer is worth a phone call on the day.

## Before anything happens

Have these ready. Hunting for them mid-incident is how the clock runs out.

- **Your NEQ** (Quebec enterprise number). The CAI notice requires it and you
  will not want to be looking it up.
- **The register**, at `docs/incident-register.md`, kept outside the app
  database.
- **Database access that survives the incident.** If the breach is your hosting
  account, you still need to reach the data to work out who was affected.
- **A recent restore you have actually tested.** An untested backup is not a
  backup, and Art. 32-style "can you restore" questions get asked after.

## Step 1: stop it

Contain before you investigate. Rotate `AUTH_SECRET` (this signs every session
cookie, so rotating it signs everyone out, which is the point), rotate the
database credentials, and revoke any leaked token. Take the service down if
that is what it takes. A longer outage is cheaper than a longer exposure.

## Step 2: write the first register entry

Open `docs/incident-register.md` and fill the eight fields with what you know
now. Write "unknown" where you do not know yet and come back. The register is
contemporaneous evidence, and a note written on the day is worth more than a
tidy reconstruction written later.

Record the moment you became aware. That timestamp is the one everything else
is measured from.

## Step 3: decide whether there is a risk of serious injury

s. 3.7 names three things to weigh:

1. **The sensitivity of the information.** For this app: email addresses,
   bcrypt password hashes, and charts holding a name with an exact birth date,
   birth minute and coordinates. The birth data identifies people closely. Do
   not discount it because the context is astrology.
2. **The anticipated consequences** of its use.
3. **The likelihood it will be used for an injurious purpose.**

Write the reasoning down **either way**. A conclusion of no risk still goes in
the register with its reasoning, because the regulation requires exactly that.

If you are genuinely unsure, treat it as a risk. Over-notifying costs you
embarrassment; under-notifying costs you the s. 3.5 duty.

## Step 4: if there is a risk, notify

Both notifications are required **with diligence**, which is not a fixed number
of days but does not mean "when convenient". Same day where you can.

### The CAI

Notify the Commission d'accès à l'information. The notice needs eleven items
under s. 3 of the regulation, including your NEQ, the description of the
incident and of the information concerned, the number of people affected, the
measures taken, and the contact details of the person able to answer questions
about it (that is your person in charge).

### The people concerned

Notify every affected person. Six items under s. 5: the description of the
incident, when it happened, the information concerned, the measures taken to
reduce the risk, what they can do to reduce their own risk, and the contact
details of the person able to answer.

You can reach everyone by email. That is a consequence of holding no chart
about anyone but the account holder, and it is why the public-notice route is
not part of this plan.

Write in clear and simple language. The same standard that governs the privacy
policy governs this notice, and this is the one people actually read.

## Step 5: reduce the risk of it happening again

Record in the register what you changed. This field is not decoration: it is
what turns an incident into evidence that you take the duty seriously.

## Step 6: keep the entry for five years

At least five years from the date you became aware.

## What is not an incident

A reader deleting their own account is not an incident. Neither is the
retention sweep destroying dormant accounts on schedule, nor answering an
access request. Those are the Act working. Do not pad the register with them.
