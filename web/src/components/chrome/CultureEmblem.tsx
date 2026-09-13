import { CULTURE_EMBLEMS } from "@/marks";
import { CULTURE_LABELS, type Culture } from "@/data/cultures";
import { cn } from "@/lib/classNames";

export interface CultureEmblemProps {
  culture: Culture;
  /** Rendered width and height in px. */
  size?: number;
  /** Hidden from the accessibility tree where the culture's name is already beside it. */
  decorative?: boolean;
  className?: string;
}

/**
 * The mark a culture is known by: the wedjat, Athena's owl, the Ugaritic name
 * of El, the sign of Tanit, the aquila.
 *
 * docs/design/culture-marks.md puts these at tier 2, the in-app emblem, and
 * says they belong where a label stands beside them, so the famous mark is
 * read as the right mark. That is why this takes a decorative flag: on a
 * doorway or a column header the culture's name is already printed next to it,
 * and a screen reader should hear the name once rather than twice.
 *
 * The mark paints with currentColor and sets no colour of its own, so the
 * caller decides whether it takes the culture accent or the bone ink. The
 * accent marks the active culture, so a list of five accents only the chosen
 * one; a page that IS one culture may carry its mark in the accent throughout.
 */
export function CultureEmblem({ culture, size = 24, decorative = false, className }: CultureEmblemProps) {
  const emblem = CULTURE_EMBLEMS[culture];
  const label = `${emblem.name}, the mark of ${CULTURE_LABELS[culture]}`;

  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      className={cn("inline-block shrink-0 align-middle", className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: emblem.inner }}
    />
  );
}
