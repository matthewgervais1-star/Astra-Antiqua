import { useId } from "react";
import { PLANET_LABELS, PLANET_SYMBOLS, type Culture, type Planet } from "@/data/cultures";
import { GLYPHS } from "@/components/glyphs";
import { CULTURE_METALS } from "@/data/palettes";
import { cn } from "@/lib/classNames";

interface DeityGlyphProps {
  culture: Culture;
  planet: Planet;
  size?: number;
  className?: string;
  decorative?: boolean;
  tone?: "gold" | "ink";
}

export function DeityGlyph({
  culture,
  planet,
  size = 64,
  className,
  decorative = true,
  tone = "gold",
}: DeityGlyphProps) {
  const glyph = GLYPHS[culture][planet];
  const reactId = useId();
  const gradientId = `glyph-${culture}-${planet}-${reactId.replace(/:/g, "")}`;

  const stroke = tone === "gold" ? `url(#${gradientId})` : "currentColor";
  const [deep, mid, bright] = CULTURE_METALS[culture].stops;

  const gradientDefs =
    tone === "gold" ? (
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={deep} />
          <stop offset="35%" stopColor={mid} />
          <stop offset="50%" stopColor={bright} />
          <stop offset="65%" stopColor={mid} />
          <stop offset="100%" stopColor={deep} />
        </linearGradient>
      </defs>
    ) : null;

  if (!glyph) {
    // The three received bodies (Uranus, Neptune, Pluto) have no hand-drawn
    // per-culture iconography yet; fall back to the classical planet symbol.
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className={cn("inline-block", className)}
        role={decorative ? undefined : "img"}
        aria-hidden={decorative ? true : undefined}
        aria-label={decorative ? undefined : PLANET_LABELS[planet]}
      >
        {gradientDefs}
        <text
          x="32"
          y="33"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="34"
          fill={stroke}
        >
          {PLANET_SYMBOLS[planet]}
        </text>
      </svg>
    );
  }

  const [vbW, vbH] = glyph.viewBox;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${vbW} ${vbH}`}
      width={size}
      height={size}
      className={cn("inline-block", className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : glyph.label}
    >
      {gradientDefs}
      <path
        d={glyph.d}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
