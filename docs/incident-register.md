# Confidentiality incident register

Required by Law 25 s. 3.8, which is unconditional: the register must exist
before there is anything to put in it. This file is the register, and it is
deliberately empty.

**Keep this outside the application database.** An incident that takes out the
app must not take the register with it. A file in this repository, or a copy in
a password manager, both satisfy that; a table in the same Postgres does not.

The Commission d'accès à l'information may ask for a copy at any time.

## What counts

A confidentiality incident is unauthorized access to, use of, or communication
of personal information, its loss, or any other breach of its protection. It
does not have to be malicious and it does not have to be large.

**Record every incident, including the ones you conclude are harmless.** The
Regulation respecting confidentiality incidents (RLRQ c. A-2.1, r. 3.1, s. 7)
requires the register to hold the reasoning that led you to conclude there is
**or is not** a risk of serious injury. A no-risk determination with no written
reasoning behind it is the gap an inspection finds.

Entries are kept for at least five years after you became aware of the
incident (s. 8 of the same regulation).

## The eight fields

Copy this block per incident. Do not delete a field; write "unknown" and say
what you did to find out.

```
### Incident YYYY-NNN

1. Description of the incident
2. Date or period it occurred, and the date you became aware of it
3. Description of the personal information concerned, or the reason it is
   impossible to describe it
4. Number of people concerned, or an estimate
5. Whether the incident presents a risk of serious injury, WITH the reasoning
   that led to that conclusion either way. Weigh the sensitivity of the
   information, the anticipated consequences, and the likelihood it will be
   used for an injurious purpose (s. 3.7).
6. The measures taken to reduce the risk of injury or to prevent recurrence
7. Whether the CAI was notified, and when
8. Whether the people concerned were notified, and when; or, where they were
   not, why not
```

## What this app's incidents would look like

Two facts shape the realistic scenarios, and both were deliberate choices:

- **Every person whose data could be exposed has an account**, because the app
  holds no chart about anyone but the account holder. So notification under
  s. 3.5 is always possible: there is an email address for every affected
  person. The public-notice fallback in s. 6 of the regulation is not needed.
- **The data is precise.** A name with a birth date, a birth minute and a set
  of coordinates identifies someone closely. Treat any exposure of the `charts`
  or `users` tables as a candidate for serious injury rather than assuming the
  data is trivial because it is astrological.

Passwords are bcrypt hashes at cost 11, which is worth stating in an entry: it
changes the risk assessment for a database exposure, though it does not
eliminate it.

## Entries

None. The register has been created empty, which is the point.
