import Link from "next/link";
import { notFound } from "next/navigation";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import type { PolicyCopy } from "@/lib/legal/privacyCopy";
import {
  POLICY_FACTS,
  missingPolicyFacts,
  policyFactsComplete,
  storedOutsideQuebec,
  type PolicyFacts,
} from "@/lib/legal/policyFacts";

const PROSE = "font-body text-prose-s leading-prose text-prose";
const LABEL = "font-mono text-data-s uppercase tracking-microcopy text-dim";

/**
 * The confidentiality policy required by P-39.1 s. 8.2, carrying the published
 * governance information required by s. 3.2 as a labelled section inside it.
 *
 * One renderer, two copy objects. The English and French versions are the same
 * document in two languages rather than two documents, so a section cannot be
 * added to one and forgotten in the other. That matters beyond tidiness: the
 * Consumer Protection Act resolves a discrepancy between versions in the
 * consumer's favour, so drift is a liability rather than an inconsistency.
 *
 * What is deliberately NOT here is the terms of service. The CAI's drafting
 * guide allows terms to link to a privacy policy but not to be merged with
 * one, so the terms live at their own route.
 */
export function PrivacyPolicy({
  copy,
  facts = POLICY_FACTS,
}: {
  copy: PolicyCopy;
  facts?: PolicyFacts;
}) {
  if (!policyFactsComplete(facts)) {
    // Unreachable rather than half-written. The build log says why, so this
    // cannot be mistaken for a routing bug on the day someone goes looking.
    console.warn(
      `[privacy] Policy route is 404 until these are filled in ` +
        `src/lib/legal/policyFacts.ts: ${missingPolicyFacts(facts).join(", ")}`,
    );
    notFound();
  }

  const fill = (text: string) =>
    text
      .replaceAll("{email}", facts.privacyEmail)
      .replaceAll("{postal}", facts.postalAddress)
      .replaceAll("{officer}", facts.privacyOfficerTitle)
      .replaceAll("{appHost}", facts.appHost)
      .replaceAll("{dbHost}", facts.databaseHost)
      .replaceAll("{dbRegion}", facts.databaseRegion)
      .replaceAll("{effective}", facts.effectiveDate)
      .replaceAll("{updated}", facts.lastUpdated)
      .replaceAll("{dormantMonths}", String(facts.dormantAccountMonths))
      .replaceAll("{thirdPartyMonths}", String(facts.thirdPartyChartMonths))
      .replaceAll("{backupDays}", String(facts.backupRetentionDays));

  const outside = storedOutsideQuebec(facts);
  const [termsBefore, termsAfter] = copy.termsSentence.split("{link}");

  return (
    <NaveShell context={copy.context}>
      <NaveHead kicker={copy.context}>{copy.heading}</NaveHead>

      <div className="mx-auto flex max-w-[560px] flex-col gap-11">
        <section className="flex flex-col gap-2">
          <p className={LABEL}>{facts.legalName}</p>
          <p className={LABEL}>{fill(copy.dateLine)}</p>
          <p className={`${PROSE} pt-3`}>{copy.intro}</p>
          <p className={PROSE}>
            {termsBefore}
            <Link href="/terms" className="underline underline-offset-4">
              {copy.termsLinkText}
            </Link>
            {termsAfter}
          </p>
          <p className={PROSE}>
            <Link href={copy.otherLanguageHref} className="underline underline-offset-4">
              {copy.otherLanguageLabel}
            </Link>
          </p>
        </section>

        {copy.sections.map((section) => (
          <section key={section.label} className="flex flex-col gap-5">
            <SectionDivider label={section.label} />
            {section.lead ? <p className={PROSE}>{fill(section.lead)}</p> : null}
            {section.items ? (
              <dl className="flex flex-col gap-4">
                {section.items.map((item) => (
                  <div key={item.term} className="flex flex-col gap-1">
                    <dt className="font-mono text-data-s uppercase tracking-microcopy text-bone">
                      {item.term}
                    </dt>
                    <dd className={PROSE}>{fill(item.text)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {section.paras.map((para) => (
              <p key={para.slice(0, 40)} className={PROSE}>
                {fill(para)}
              </p>
            ))}
          </section>
        ))}

        <section className="flex flex-col gap-5">
          <SectionDivider label={copy.storage.label} />
          <p className={PROSE}>
            {fill(outside ? copy.storage.outside : copy.storage.inQuebec)}
          </p>
          {/* The assessment sentence renders only once the assessment exists.
              s. 17 requires it BEFORE the information leaves the province, so
              claiming one that was never done would breach both s. 17 and the
              accuracy the policy itself is supposed to have. */}
          {outside && facts.transferAssessmentCompleted ? (
            <p className={PROSE}>{fill(copy.storage.outsideAssessed)}</p>
          ) : null}
        </section>

        <p className={`${PROSE} pb-6`}>{fill(copy.closing)}</p>
      </div>
    </NaveShell>
  );
}
