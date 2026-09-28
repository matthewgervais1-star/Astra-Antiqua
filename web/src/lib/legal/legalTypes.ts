/**
 * The shape shared by every published legal document.
 *
 * Both the privacy policy and the terms are the same thing structurally: a
 * dated document, in two languages, made of labelled sections. Keeping one
 * type means the renderer is written once and the drift test applies to both.
 */

export interface LegalItem {
  term: string;
  text: string;
}

export interface LegalSection {
  label: string;
  lead?: string;
  items?: LegalItem[];
  paras: string[];
}

export interface LegalCopy {
  metaTitle: string;
  metaDescription: string;
  context: string;
  heading: string;
  /** "In effect X, last updated Y", with the dates substituted. */
  dateLine: string;
  intro: string;
  /** A sentence containing {link}, split at render to place the anchor. */
  crossSentence: string;
  crossLinkText: string;
  crossLinkHref: string;
  otherLanguageHref: string;
  otherLanguageLabel: string;
  sections: LegalSection[];
  closing: string;
}
