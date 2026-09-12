/**
 * The ASTRA ANTIQVA lockup: the twelve drawn caps from
 * docs/design/system/assets/wordmark/wordmark-horizontal.svg, geometry
 * verbatim. Server-safe, no hooks. Paints with currentColor and sets no colour
 * of its own, so the link that wraps it decides the ink.
 *
 * Sizing. The viewBox is "-10 -10 1424 132". The cap band is the A's ink.
 * The A is "M6 100 L44 6 H52 L90 100" with a 12-unit stroke, butt caps and
 * miter joins. The flat apex segment at y=6 puts the top of the stroke at
 * y=0. The butt cap on each slanted leg ends 6 units past y=100 measured
 * along the leg's own perpendicular, whose vertical component is
 * 6 * 38 / sqrt(38^2 + 94^2) = 2.25, so the A's ink spans y 0..102.25:
 * 102.25 viewBox units of cap inside a 132-unit box. The Q's tail (to y=112)
 * and the N's miter spikes reach past that band and are not part of the cap
 * height. For the caps to stand `capHeight` px:
 *
 *   height = capHeight * 132 / 102.25
 *   width  = height * 1424 / 132   (the viewBox aspect)
 *
 * Callers pick capHeight from the type the mark replaces. Cinzel's cap height
 * is 0.70em, so a site that typed the name at 17px passes capHeight={11.9}.
 * Width and height go on both the attributes and the inline style so no
 * cascade rule can resize the mark.
 */

export interface WordmarkProps {
  /** Rendered ink height of the caps, in px. */
  capHeight: number;
  className?: string;
}

/**
 * The stroked glyph group alone, shared with the share-card image (Satori
 * renders svg, g and path with camel-cased stroke attributes).
 */
export function WordmarkGlyphs({ stroke = "currentColor" }: { stroke?: string }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth="12" strokeLinejoin="miter">
      <g transform="translate(0 0)">
        <path d="M6 100 L44 6 H52 L90 100" />
        <path d="M22 68 H74" />
      </g>
      <g transform="translate(120 0)">
        <path d="M84 24 C76 4 22 0 16 28 C10 56 82 54 84 76 C86 100 30 104 14 84" />
      </g>
      <g transform="translate(240 0)">
        <path d="M4 8 H92" />
        <path d="M48 8 V100" />
      </g>
      <g transform="translate(360 0)">
        <path d="M14 100 V6" />
        <path d="M14 6 H56 C86 6 86 54 56 54 H14" />
        <path d="M50 54 L88 100" />
      </g>
      <g transform="translate(480 0)">
        <path d="M6 100 L44 6 H52 L90 100" />
        <path d="M22 68 H74" />
      </g>

      <g transform="translate(640 0)">
        <path d="M6 100 L44 6 H52 L90 100" />
        <path d="M22 68 H74" />
      </g>
      <g transform="translate(760 0)">
        <path d="M14 100 V6 L82 100 V6" />
      </g>
      <g transform="translate(880 0)">
        <path d="M4 8 H92" />
        <path d="M48 8 V100" />
      </g>
      <g transform="translate(968 0)">
        <path d="M48 6 V100" />
      </g>
      <g transform="translate(1052 0)">
        <path d="M48 6 C80 6 88 30 88 53 C88 76 80 100 48 100 C16 100 8 76 8 53 C8 30 16 6 48 6 Z" />
        <path d="M58 78 L94 112" />
      </g>
      <g transform="translate(1180 0)">
        <path d="M6 4 L44 98 H52 L90 4" />
      </g>
      <g transform="translate(1300 0)">
        <path d="M6 100 L44 6 H52 L90 100" />
        <path d="M22 68 H74" />
      </g>
    </g>
  );
}

export function Wordmark({ capHeight, className }: WordmarkProps) {
  const height = Number(((capHeight * 132) / 102.25).toFixed(3));
  const width = Number(((height * 1424) / 132).toFixed(3));
  return (
    <>
      <svg
        viewBox="-10 -10 1424 132"
        width={width}
        height={height}
        aria-hidden="true"
        focusable="false"
        className={className}
        style={{ width, height, display: "inline-block", verticalAlign: "middle" }}
      >
        <WordmarkGlyphs />
      </svg>
      {/* normal-case: the wrapping link is font-display, which body[data-pantheon] lowercases on four surfaces; the accessible name stays ASTRA ANTIQVA. */}
      <span className="sr-only normal-case">ASTRA ANTIQVA</span>
    </>
  );
}
