/**
 * The monogram: two A's as a ruined temple front, geometry verbatim from
 * docs/design/system/assets/wordmark/monogram.svg. The flat-cut apex is a
 * pediment, the crossbar at y=74 is the architrave running across both
 * letters, and the second A stands broken on a two-step stylobate, its
 * fallen fragment beside it.
 *
 * The letters paint in currentColor. The architrave is authored gold and the
 * asset's own note says that, wired into the app, it should take the accent
 * custom property so it follows the active culture; that is what it does
 * here. Outside the app (favicon, touch icon) scripts/generate-icons.mjs
 * keeps it gold, since a tab has no culture.
 */
export interface MonogramProps {
  /** Rendered height in px; the width follows the 224:152 viewBox. */
  height: number;
  className?: string;
}

export function Monogram({ height, className }: MonogramProps) {
  const width = Number(((height * 224) / 152).toFixed(3));
  return (
    <svg
      viewBox="-12 -10 224 152"
      width={width}
      height={height}
      role="img"
      aria-label="Astra Antiqua monogram"
      focusable="false"
      className={className}
      style={{ width, height, display: "inline-block" }}
    >
      <g fill="currentColor" stroke="none">
        <rect x="-2" y="108" width="204" height="10" />
        <rect x="-12" y="118" width="224" height="11" />
        <rect x="92" y="86" width="13" height="22" />
        <path d="M180 92 L190 108 H172 Z" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="miter">
        <path d="M6 108 L44 6 H52 L90 108" />
        <path d="M106 108 L144 6 H152 L178 76" />
      </g>
      <path d="M22 74 H174" stroke="var(--accent)" strokeWidth="8" fill="none" />
    </svg>
  );
}
