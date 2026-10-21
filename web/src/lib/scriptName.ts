import type { Culture, Planet } from "@/data/cultures";
import {
  CULTURE_NAME_FORMS,
  DEITY_SCRIPT_FORMS,
  INSTITUTION_FORMS,
  type ScriptForm,
} from "@/data/scriptForms";

/**
 * The pure half of the script reveal (docs/superpowers/specs/2026-10-20-script-reveal.md):
 * which form a name takes and which Latin form the reader gets. The swap
 * itself lives in components/chrome/ScriptName.tsx.
 */

/** A deity seat, or one of the two headings the spec allows (rule 2). */
export type ScriptNameKey =
  | { planet: Planet; heading?: never }
  | { heading: "culture" | "institution"; planet?: never };

export type ReaderLanguage = "en" | "fr";

/** The rootMargin of the middle band, 30% to 70% of the viewport height (spec rule 5). */
export const REVEAL_BAND_MARGIN = "-30% 0px -30% 0px";

function isFrench(tag: string | null | undefined): boolean {
  return Boolean(tag) && /^fr(?:-|$)/i.test(tag!.trim());
}

/**
 * French when the page's language tag (the nearest lang attribute) or the
 * browser's first language is French (fr, fr-CA, FR-ca); English otherwise.
 * Controller ruling, 2026-10-20: no page sets fr yet, and names never sit
 * inside prose, so a French reader on an English page gets French names
 * without a mixed sentence. Matches the primary subtag only, so "fro" (Old
 * French) and "frr" (North Frisian) stay English.
 */
export function pickLanguage(
  pageLang: string | null | undefined,
  browserLang?: string | null,
): ReaderLanguage {
  return isFrench(pageLang) || isFrench(browserLang) ? "fr" : "en";
}

export function scriptFormFor(culture: Culture, key: ScriptNameKey): ScriptForm {
  if (key.planet !== undefined) return DEITY_SCRIPT_FORMS[culture][key.planet];
  return key.heading === "culture" ? CULTURE_NAME_FORMS[culture] : INSTITUTION_FORMS[culture];
}

/** The readable form: the accessible name and the text a reader copies. */
export function latinFor(form: ScriptForm, lang: ReaderLanguage, upper = false): string {
  const text = lang === "fr" ? form.fr : form.en;
  return upper ? text.toLocaleUpperCase(lang) : text;
}

/** The script layer to set, or null when the name has no attested script form. */
export function scriptLayerFor(form: ScriptForm): string | null {
  return form.script === null || form.script.length === 0 ? null : form.script;
}
