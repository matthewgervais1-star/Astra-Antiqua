import { PLANET_LABELS, PLANET_SYMBOLS, type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { GLYPHS } from "@/glyphs";
import { cn } from "@/lib/classNames";

export interface DeityGlyphProps {
  body: Planet;
  /** null renders the classical Unicode sign instead of a culture's glyph. */
  culture: Culture | null;
  /** Rendered width and height in px. Defaults to 16. */
  size?: number;
  className?: string;
}

/** Escapes the characters that would break out of text content inside the SVG string. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Both forms share this so a glyph and its fallback sign occupy the same slot in a row. */
const SLOT_CLASS = "inline-block shrink-0 align-middle";

/**
 * One deity glyph, painted with currentColor so it takes the parent's ink.
 * The svg carries no colour, stroke or fill of its own, and the inner markup
 * is used as exported: nothing here rescales or restyles a mark.
 *
 * Alignment. The glyph sits in 11px to 13px IBM Plex Mono rows beside digits
 * and capitals. Tailwind's preflight sets every svg to display: block, so
 * this component restores inline-block and sets vertical-align: middle,
 * which centres the box on the line instead of parking it on the baseline;
 * shrink-0 stops a flex row from squeezing it. Two ways to place it:
 *   1. Inline in text: put it beside the label and middle alignment lands
 *      within a pixel of centred at these sizes.
 *   2. Exact cap-height centring: the call site wraps glyph and label in an
 *      "inline-flex items-center" row and the flex axis does the centring.
 *
 * With culture null the classical Unicode sign stands in, sized to the same
 * line box, so a row never shows an empty slot.
 */
export function DeityGlyph({ body, culture, size = 16, className }: DeityGlyphProps) {
  if (!culture) {
    return (
      <span
        role="img"
        aria-label={PLANET_LABELS[body]}
        className={cn(SLOT_CLASS, className)}
        style={{ fontSize: size, lineHeight: 1 }}
      >
        {PLANET_SYMBOLS[body]}
      </span>
    );
  }

  const { name } = DEITY_MATRIX[culture][body];
  const { inner, status } = GLYPHS[culture][body];
  // React forbids children beside dangerouslySetInnerHTML, so the title rides inside the string.
  const markup = "<title>" + escapeHtml(name) + " · " + body + " · " + status + "</title>" + inner;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label={name}
      aria-hidden={false}
      focusable="false"
      className={cn(SLOT_CLASS, className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
