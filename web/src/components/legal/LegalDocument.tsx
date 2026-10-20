import Link from "next/link";
import { notFound } from "next/navigation";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import type { LegalCopy, LegalSection } from "@/lib/legal/legalTypes";
import { GRACE_DAYS } from "@/lib/auth/retention";
import {
  POLICY_FACTS,
  missingPolicyFacts,
  policyFactsComplete,
  type PolicyFacts,
} from "@/lib/legal/policyFacts";

const PROSE = "font-body text-prose-s leading-prose text-prose";
const LABEL = "font-mono text-data-s uppercase tracking-microcopy text-dim";

/**
 * Every published legal document: the privacy policy and the terms.
 *
 * One renderer over two copy objects per document. The English and French
 * versions are the same document in two languages rather than two documents,
 * so a section cannot be added to one and forgotten in the other. That matters
 * beyond tidiness: the Consumer Protection Act resolves a discrepancy between
 * versions in the consumer's favour, so drift is a liability.
 *
 * The privacy policy and the terms stay separate routes. The CAI's drafting
 * guide allows terms to link to a privacy policy but not to be merged with
 * one, which is why they cross-link rather than combine.
 *
 * `extraSections` carries anything a document computes rather than declares,
 * such as the privacy policy's storage paragraph, whose wording depends on
 * where the database actually sits.
 */
export function LegalDocument({
  copy,
  facts = POLICY_FACTS,
  extraSections = [],
}: {
  copy: LegalCopy;
  facts?: PolicyFacts;
  extraSections?: readonly LegalSection[];
}) {
  if (!policyFactsComplete(facts)) {
    // Unreachable rather than half-written. A legal document with holes in it
    // is a published false statement, so the route 404s until it is filled.
    // The build log says why, so this cannot be mistaken for a routing bug.
    console.warn(
      `[legal] ${copy.metaTitle} is 404 until these are filled in ` +
        `src/lib/legal/policyFacts.ts: ${missingPolicyFacts(facts).join(", ")}`,
    );
    notFound();
  }

  const fill = (text: string) =>
    text
      .replaceAll("{legalName}", facts.legalName)
      .replaceAll("{email}", facts.privacyEmail)
      .replaceAll("{postal}", facts.postalAddress)
      .replaceAll("{officer}", facts.privacyOfficerTitle)
      .replaceAll("{appHost}", facts.appHost)
      .replaceAll("{dbHost}", facts.databaseHost)
      .replaceAll("{dbRegion}", facts.databaseRegion)
      .replaceAll("{effective}", facts.effectiveDate)
      .replaceAll("{updated}", facts.lastUpdated)
      .replaceAll("{dormantMonths}", String(facts.dormantAccountMonths))
      .replaceAll("{backupDays}", String(facts.backupRetentionDays))
      // From the retention code itself, so the promise cannot drift from the sweep.
      .replaceAll("{graceDays}", String(GRACE_DAYS));

  const [crossBefore, crossAfter] = copy.crossSentence.split("{link}");
  const sections = [...copy.sections, ...extraSections];

  return (
    <NaveShell context={copy.context} lang={copy.lang}>
      <NaveHead kicker={copy.context}>{copy.heading}</NaveHead>

      <div className="mx-auto flex max-w-[560px] flex-col gap-11">
        <section className="flex flex-col gap-2">
          <p className={LABEL}>{facts.legalName}</p>
          <p className={LABEL}>{fill(copy.dateLine)}</p>
          <p className={`${PROSE} pt-3`}>{fill(copy.intro)}</p>
          <p className={PROSE}>
            {crossBefore}
            <Link href={copy.crossLinkHref} className="underline underline-offset-4">
              {copy.crossLinkText}
            </Link>
            {crossAfter}
          </p>
          <p className={PROSE}>
            <Link href={copy.otherLanguageHref} lang={copy.lang === "fr-CA" ? "en-CA" : "fr-CA"} className="underline underline-offset-4">
              {copy.otherLanguageLabel}
            </Link>
          </p>
        </section>

        {sections.map((section) => (
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

        <p className={`${PROSE} pb-6`}>{fill(copy.closing)}</p>
      </div>
    </NaveShell>
  );
}
