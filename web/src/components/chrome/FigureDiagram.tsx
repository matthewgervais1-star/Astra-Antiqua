import type { Culture, Planet } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";

export interface FigureDiagramPoint {
  /** The body drawn at this end, or null for an angle (the rising, the midheaven). */
  body: Planet | null;
  longitude: number;
  /** "MARS NOW", "YOUR IUPPITER". */
  label: string;
}

export interface FigureDiagramProps {
  culture: Culture;
  from: FigureDiagramPoint;
  to: FigureDiagramPoint;
  kind: AspectKind;
  /** The angle the kind names, printed on the arc: 120 for a trine. */
  angle: number;
  /** Set at the center, where the reader stands: "YOU" on a natal figure. */
  centerLabel?: string;
}

const VIEW = 200;
const C = VIEW / 2;
const R = 78;
const R_ARC = 26;

/** 0° Aries at the left, signs running counter-clockwise, as the wheel draws them. */
function at(longitude: number, radius: number): { x: number; y: number } {
  const rad = ((180 - longitude) * Math.PI) / 180;
  return { x: C + Math.cos(rad) * radius, y: C - Math.sin(rad) * radius };
}

const pct = (v: number) => `${(v / VIEW) * 100}%`;

/**
 * The figure in space: the ecliptic as one ring, the reader at its center,
 * a radius to each body at its longitude and the arc between them marked
 * with the figure's angle. The chart wheel's rules: 1px strokes in the rule
 * ink, no fill, the deity glyphs in the bone ink, labels in mono.
 */
export function FigureDiagram({ culture, from, to, kind, angle, centerLabel }: FigureDiagramProps) {
  const a = at(from.longitude, R);
  const b = at(to.longitude, R);
  const arcA = at(from.longitude, R_ARC);
  const arcB = at(to.longitude, R_ARC);
  // The shorter way round from `from` to `to`. Longitude grows from the
  // left point toward the top, which is clockwise on the page, and SVG's
  // sweep flag 1 is clockwise.
  const delta = (((to.longitude - from.longitude) % 360) + 360) % 360;
  const sweep = delta <= 180 ? 1 : 0;
  const mid = at(from.longitude + (delta <= 180 ? delta / 2 : (delta - 360) / 2), R_ARC + 14);

  return (
    <figure
      className="relative mx-auto aspect-square w-full max-w-[280px] text-bone"
      aria-label={`${from.label} and ${to.label}, ${kind}, ${angle} degrees apart`}
    >
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="absolute inset-0 h-full w-full text-rule" aria-hidden="true">
        <circle cx={C} cy={C} r={R} fill="none" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <line x1={C} y1={C} x2={a.x} y2={a.y} stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <line x1={C} y1={C} x2={b.x} y2={b.y} stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {angle > 0 ? (
          <path
            d={`M ${arcA.x} ${arcA.y} A ${R_ARC} ${R_ARC} 0 0 ${sweep} ${arcB.x} ${arcB.y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        <rect x={C - 2} y={C - 2} width={4} height={4} fill="currentColor" />
      </svg>

      {[
        { point: from, xy: a },
        { point: to, xy: b },
      ].map(({ point, xy }, i) => (
        <div
          key={i}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 bg-ground px-1"
          style={{ left: pct(xy.x), top: pct(xy.y) }}
        >
          {point.body ? (
            <DeityGlyph body={point.body} culture={culture} size={22} decorative />
          ) : (
            <span className="block h-[7px] w-[7px] bg-bone" aria-hidden="true" />
          )}
          <span className="max-w-[88px] text-center font-mono text-[10px] leading-tight tracking-label text-dim">{point.label}</span>
        </div>
      ))}

      {angle > 0 ? (
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] text-dim"
          style={{ left: pct(mid.x), top: pct(mid.y) }}
        >
          {angle}°
        </span>
      ) : null}
      {centerLabel ? (
        <span
          className="absolute -translate-x-1/2 font-mono text-[10px] tracking-label text-faint-ink"
          style={{ left: "50%", top: pct(C + 6) }}
        >
          {centerLabel}
        </span>
      ) : null}
    </figure>
  );
}
