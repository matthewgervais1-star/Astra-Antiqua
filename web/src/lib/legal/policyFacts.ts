/**
 * The facts the privacy policy states about this business.
 *
 * They live here rather than inside the prose because a privacy policy is a
 * statement of fact under Quebec's Law 25 (P-39.1 s. 8), and a policy that
 * describes something the business does not actually do is itself a breach.
 * Keeping them in one typed object means the English and French pages cannot
 * drift apart, and means changing a retention period is one edit rather than
 * four.
 *
 * TODO_ before deployment: every value below marked TODO must be replaced.
 * `assertPolicyFactsComplete` refuses a production build while any remain, so
 * a placeholder cannot reach a live site.
 */

export interface PolicyFacts {
  /** Legal or registered business name. Not the product name. */
  legalName: string;
  /** The role title of the person in charge. P-39.1 s. 3.1 requires the TITLE
   *  and contact information, not the individual's legal name. */
  privacyOfficerTitle: string;
  /** A role alias, never a personal inbox: it survives a change of person and
   *  it is the statutory destination for requests under s. 30. */
  privacyEmail: string;
  /** Access requests may arrive by post, and CPA s. 54.4 will require an
   *  address at checkout in any case. */
  postalAddress: string;
  /** ISO date. Shown as the date the policy takes effect. */
  effectiveDate: string;
  /** ISO date. The CAI's drafting guide asks for both, separately. */
  lastUpdated: string;

  /** Where the app runs and where the database lives. Named rather than
   *  hinted at: s. 8 only requires disclosing the possibility of communication
   *  outside Quebec, but there are exactly two providers, so naming them costs
   *  nothing and is plainly clearer. */
  appHost: string;
  databaseHost: string;
  /** The province or country the database physically sits in. "Outside
   *  Quebec" in s. 17 means outside the PROVINCE, so Toronto is still outside
   *  it. A Montreal region takes the storage leg out of s. 17 entirely. */
  databaseRegion: string;
  /** True only once the s. 17 privacy impact assessment actually exists as a
   *  written document. The policy will not claim an assessment was done while
   *  this is false, because s. 17 requires the assessment BEFORE the transfer
   *  and a false claim here breaches s. 8 as well. */
  transferAssessmentCompleted: boolean;

  /** Months of not signing in before an account is warned and then deleted. */
  dormantAccountMonths: number;
  /** Months of disuse before a chart saved about someone ELSE is deleted.
   *  Deliberately shorter than the account clock: that person never agreed to
   *  anything, so their data should not outlive its use. */
  thirdPartyChartMonths: number;
  /** The database provider's backup window. This is the real deletion latency
   *  and a reader can test the claim, so it must be the provider's true
   *  figure, not a round number. */
  backupRetentionDays: number;
}

/** Sentinel for a value that must be supplied before launch. */
const TODO = "TODO_SET_BEFORE_LAUNCH";

export const POLICY_FACTS: PolicyFacts = {
  legalName: TODO,
  privacyOfficerTitle: "Founder, Astra Antiqua",
  privacyEmail: TODO,
  postalAddress: TODO,
  effectiveDate: TODO,
  lastUpdated: TODO,

  appHost: TODO,
  databaseHost: TODO,
  databaseRegion: TODO,
  // Stays false until the written assessment exists. See docs/law25-checklist.md.
  transferAssessmentCompleted: false,

  dormantAccountMonths: 24,
  thirdPartyChartMonths: 12,
  backupRetentionDays: 7,
};

/** True when the database never leaves Quebec, which switches off the whole
 *  cross-border branch of the policy rather than documenting around it. */
export function storedOutsideQuebec(facts: PolicyFacts = POLICY_FACTS): boolean {
  return !/\bqu[eé]bec\b|\bmontr[eé]al\b/i.test(facts.databaseRegion);
}

/** The fields still holding a placeholder. Empty means the policy can ship. */
export function missingPolicyFacts(facts: PolicyFacts = POLICY_FACTS): string[] {
  return Object.entries(facts)
    .filter(([, value]) => value === TODO)
    .map(([key]) => key);
}

/**
 * Whether the policy is safe to serve.
 *
 * A privacy policy reading "TODO_SET_BEFORE_LAUNCH" on a live site is worse
 * than having no policy at all: it is a published false statement about how
 * personal information is handled, which is the thing P-39.1 s. 8 exists to
 * prevent. So the route serves a 404 until this returns true, rather than
 * serving the document with holes in it.
 *
 * This deliberately does not throw. Failing the whole build would block
 * deploying everything else in the app over a page nobody can reach yet.
 */
export function policyFactsComplete(facts: PolicyFacts = POLICY_FACTS): boolean {
  return missingPolicyFacts(facts).length === 0;
}

/** Throws when the policy is incomplete. Used by the tests and by the
 *  pre-deploy check; the pages themselves prefer a 404. */
export function assertPolicyFactsComplete(facts: PolicyFacts = POLICY_FACTS): void {
  const unset = missingPolicyFacts(facts);
  if (unset.length > 0) {
    throw new Error(
      `The privacy policy is still carrying placeholders: ${unset.join(", ")}. ` +
        "Fill them in src/lib/legal/policyFacts.ts before publishing. " +
        "See docs/law25-checklist.md.",
    );
  }
}
