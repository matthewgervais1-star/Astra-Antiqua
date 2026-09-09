import { PLANET_SYMBOLS, type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import type { AspectKind } from "@/data/sampleChart";
import { GLYPHS } from "@/glyphs";

export interface WheelAspect {
  planetA: Planet;
  planetB: Planet;
  kind: AspectKind;
}

export interface WheelSvgProps {
  chart: Readonly<Record<Planet, number>>;
  ascendant?: number | null;
  aspects?: readonly WheelAspect[];
  accentPlanets?: readonly Planet[];
  size?: number;
  caption?: string;
  /** Draws each body as this culture's deity glyph; null keeps the classical Unicode sign. */
  culture?: Culture | null;
}

const VIEW = 420;
const CENTER = VIEW / 2;
const R_ZODIAC = 196;
const R_RING = 170;
const R_INNER = 110;
const R_SIGN_LABEL = 204;
const R_PLANET = 150;
const NUDGE = 22;
const COLLISION_ORB = 8;

const SIGN_ABBREVIATIONS = [
  "AR",
  "TA",
  "GE",
  "CN",
  "LE",
  "VI",
  "LI",
  "SC",
  "SG",
  "CP",
  "AQ",
  "PS",
] as const;

const CONFLICT_KINDS: ReadonlySet<AspectKind> = new Set(["square", "opposition"]);
const HARMONY_KINDS: ReadonlySet<AspectKind> = new Set(["trine", "sextile"]);

/**
 * Mirrors components/wheel/wheelHitTest.ts longitudeToCartesian: 0° Aries
 * sits at the LEFT (9 o'clock) and signs run counter-clockwise from there.
 */
function pointAt(longitude: number, radius: number): { x: number; y: number } {
  const angleRad = ((180 - longitude) * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(angleRad) * radius,
    y: CENTER - Math.sin(angleRad) * radius,
  };
}

function angularDistance(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

/** Escapes the characters that would break out of a glyph's title text inside the SVG string. */
function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Server-safe pure SVG natal wheel, per the 3a-charts-canaan mock. `chart`
 * may carry only a subset of planets at runtime during the ten-body
 * migration, so this iterates Object.keys(chart) rather than the full
 * PLANETS list.
 */
export function WheelSvg({
  chart,
  ascendant,
  aspects = [],
  accentPlanets = [],
  size = 400,
  caption,
  culture = null,
}: WheelSvgProps) {
  const planets = Object.keys(chart) as Planet[];
  const accentSet = new Set(accentPlanets);

  // Nudge a glyph inward when it falls within COLLISION_ORB of the previous
  // planet (by longitude), so two close symbols do not overlap on the ring.
  const sorted = [...planets].sort((a, b) => chart[a] - chart[b]);
  const radiusByPlanet = new Map<Planet, number>();
  sorted.forEach((planet, i) => {
    let radius = R_PLANET;
    const prev = sorted[i - 1];
    if (prev !== undefined && angularDistance(chart[planet], chart[prev]) < COLLISION_ORB) {
      radius -= NUDGE;
    }
    radiusByPlanet.set(planet, radius);
  });

  const spokeAngles = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <figure className="m-0">
      {caption ? (
        <figcaption className="mb-[10px] font-mono text-[11px] tracking-[0.16em] text-dim">
          {caption}
        </figcaption>
      ) : null}
      {/* Scales down inside narrow columns; `size` is the ceiling, not a
          fixed width, so the wheel never forces the page to scroll. */}
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="block h-auto w-full"
        style={{ maxWidth: size }}
        role="img"
        aria-label={caption ?? "Natal wheel"}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={R_ZODIAC}
          fill="none"
          stroke="var(--color-bone)"
          strokeOpacity={0.1}
          strokeWidth={1}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={R_RING}
          fill="none"
          stroke="var(--color-bone)"
          strokeOpacity={0.24}
          strokeWidth={1}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={R_INNER}
          fill="none"
          stroke="var(--color-bone)"
          strokeOpacity={0.14}
          strokeWidth={1}
        />

        {spokeAngles.map((longitude) => {
          const inner = pointAt(longitude, R_INNER);
          const outer = pointAt(longitude, R_RING);
          return (
            <line
              key={longitude}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--color-bone)"
              strokeOpacity={0.14}
            />
          );
        })}

        {aspects.map((a, i) => {
          if (a.kind === "conjunction") return null;
          if (chart[a.planetA] === undefined || chart[a.planetB] === undefined) return null;
          const isConflict = CONFLICT_KINDS.has(a.kind);
          const isHarmony = HARMONY_KINDS.has(a.kind);
          if (!isConflict && !isHarmony) return null;
          const from = pointAt(chart[a.planetA], R_INNER);
          const to = pointAt(chart[a.planetB], R_INNER);
          return (
            <line
              key={`${a.planetA}-${a.planetB}-${a.kind}-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isConflict ? "var(--color-conflict)" : "var(--color-bone)"}
              strokeWidth={isConflict ? 1.2 : 1}
              strokeOpacity={isConflict ? 0.8 : 0.4}
              strokeDasharray={isHarmony ? "3 4" : undefined}
            />
          );
        })}

        {ascendant !== null && ascendant !== undefined
          ? (() => {
              const inner = pointAt(ascendant, R_RING);
              const outer = pointAt(ascendant, R_ZODIAC);
              return (
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="var(--accent)"
                  strokeWidth={1}
                />
              );
            })()
          : null}

        <g
          fontFamily="var(--font-mono)"
          fontSize={12}
          letterSpacing={1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--color-faint-ink)"
        >
          {SIGN_ABBREVIATIONS.map((label, i) => {
            const { x, y } = pointAt(i * 30 + 15, R_SIGN_LABEL);
            return (
              <text key={label} x={x} y={y}>
                {label}
              </text>
            );
          })}
        </g>

        {culture ? (
          <g>
            {sorted.map((planet) => {
              const { x, y } = pointAt(chart[planet], radiusByPlanet.get(planet) ?? R_PLANET);
              const { name } = DEITY_MATRIX[culture][planet];
              const { inner, status } = GLYPHS[culture][planet];
              // React forbids children beside dangerouslySetInnerHTML, so the title rides inside the string.
              const markup = "<title>" + escapeHtml(name) + " · " + planet + " · " + status + "</title>" + inner;
              // The 24-unit glyph box centres on the same point the <text> run used, so the collision nudge holds.
              return (
                <g
                  key={planet}
                  transform={`translate(${x - 12} ${y - 12})`}
                  style={{ color: accentSet.has(planet) ? "var(--accent)" : "var(--color-bone)" }}
                  dangerouslySetInnerHTML={{ __html: markup }}
                />
              );
            })}
          </g>
        ) : (
          <g fontFamily="var(--font-mono)" fontSize={16} textAnchor="middle" dominantBaseline="middle">
            {sorted.map((planet) => {
              const { x, y } = pointAt(chart[planet], radiusByPlanet.get(planet) ?? R_PLANET);
              return (
                <text key={planet} x={x} y={y} fill={accentSet.has(planet) ? "var(--accent)" : "var(--color-bone)"}>
                  {PLANET_SYMBOLS[planet]}
                </text>
              );
            })}
          </g>
        )}
      </svg>
    </figure>
  );
}
