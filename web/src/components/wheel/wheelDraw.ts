import { PLANETS, type Culture, type Planet } from "@/data/cultures";
import { GLYPHS } from "@/components/glyphs";
import { metalFor } from "@/data/palettes";
import { computeAspects, type AspectKind, type Longitude } from "@/data/sampleChart";
import {
  longitudeToCartesian,
  makeGeometry,
  type WheelGeometry,
} from "@/components/wheel/wheelHitTest";

type MetalStops = readonly [string, string, string];

export interface DrawOptions {
  ctx: CanvasRenderingContext2D;
  cssSize: number;
  dpr: number;
  culture: Culture | null;
  chart: Readonly<Record<Planet, Longitude>>;
  /** When provided, draws real whole-sign houses anchored to the Ascendant. */
  ascendant?: Longitude | null;
  highlightPlanet?: Planet | null;
  pulsePhase?: number;
}

const ASPECT_STYLES: Readonly<Record<AspectKind, { color: string; width: number; dash: readonly number[] }>> = {
  trine: { color: "rgba(212, 175, 55, 0.55)", width: 0.6, dash: [] },
  sextile: { color: "rgba(212, 175, 55, 0.45)", width: 0.5, dash: [3, 3] },
  square: { color: "rgba(196, 69, 54, 0.7)", width: 1, dash: [] },
  opposition: { color: "rgba(196, 69, 54, 0.7)", width: 1, dash: [] },
  conjunction: { color: "rgba(244, 208, 63, 0.65)", width: 1, dash: [] },
};

function applyGoldStroke(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  stops: MetalStops,
): void {
  const [deep, mid, bright] = stops;
  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, deep);
  grad.addColorStop(0.35, mid);
  grad.addColorStop(0.5, bright);
  grad.addColorStop(0.65, mid);
  grad.addColorStop(1, deep);
  ctx.strokeStyle = grad;
}

export function drawWheel(options: DrawOptions): void {
  const {
    ctx,
    cssSize,
    dpr,
    culture,
    chart,
    ascendant = null,
    highlightPlanet = null,
    pulsePhase = 0,
  } = options;
  const geo = makeGeometry(cssSize);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssSize, cssSize);

  const stops = metalFor(culture).stops;
  drawZodiacRing(ctx, geo);
  if (typeof ascendant === "number") {
    drawHouses(ctx, geo, ascendant);
  } else {
    drawHouseDividers(ctx, geo);
  }
  drawAspectLines(ctx, geo, chart);
  drawConjunctionRings(ctx, geo, chart, pulsePhase);
  drawPlanetGlyphs(ctx, geo, chart, culture, highlightPlanet, stops);
}

function drawZodiacRing(ctx: CanvasRenderingContext2D, geo: WheelGeometry): void {
  ctx.save();
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
  ctx.beginPath();
  ctx.arc(geo.cx, geo.cy, geo.outerRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(geo.cx, geo.cy, geo.zodiacRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 0.4;
  ctx.strokeStyle = "rgba(212, 175, 55, 0.18)";
  ctx.beginPath();
  ctx.arc(geo.cx, geo.cy, geo.innerRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
  ctx.lineWidth = 0.4;
  for (let i = 0; i < 12; i += 1) {
    const longitude = i * 30;
    const a = longitudeToCartesian(longitude, geo.zodiacRadius, geo.cx, geo.cy);
    const b = longitudeToCartesian(longitude, geo.outerRadius, geo.cx, geo.cy);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();

  // Sign labels around the outer ring.
  ctx.save();
  ctx.fillStyle = "rgba(212, 175, 55, 0.78)";
  const labelSize = Math.max(8, Math.min(11, geo.size * 0.018));
  ctx.font = `${labelSize}px ui-monospace, "JetBrains Mono", Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const labelRadius = (geo.outerRadius + geo.zodiacRadius) / 2;
  for (let i = 0; i < 12; i += 1) {
    const longitude = i * 30 + 15; // midpoint of the 30 degree arc
    const pos = longitudeToCartesian(longitude, labelRadius, geo.cx, geo.cy);
    const label = SIGN_ABBREVIATIONS[i];
    if (label) ctx.fillText(label, pos.x, pos.y);
  }
  ctx.restore();
}

const SIGN_ABBREVIATIONS: readonly string[] = [
  "ARI",
  "TAU",
  "GEM",
  "CAN",
  "LEO",
  "VIR",
  "LIB",
  "SCO",
  "SAG",
  "CAP",
  "AQU",
  "PIS",
];

function drawHouseDividers(ctx: CanvasRenderingContext2D, geo: WheelGeometry): void {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 0.4;
  for (let i = 0; i < 12; i += 1) {
    const longitude = i * 30 + 15;
    const a = longitudeToCartesian(longitude, geo.innerRadius, geo.cx, geo.cy);
    const b = longitudeToCartesian(longitude, geo.zodiacRadius, geo.cx, geo.cy);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

function normalizeDeg(angle: number): number {
  const a = angle % 360;
  return a < 0 ? a + 360 : a;
}

/**
 * Real whole-sign houses anchored to the Ascendant. Cusps fall on the sign
 * boundaries (whole-sign houses ARE the signs), each house is numbered 1..12
 * starting from the Ascendant's sign, and the exact Ascendant degree is marked.
 */
function drawHouses(
  ctx: CanvasRenderingContext2D,
  geo: WheelGeometry,
  ascendant: Longitude,
): void {
  const ascNorm = normalizeDeg(ascendant);
  const ascSignStart = Math.floor(ascNorm / 30) * 30;

  // Cusp lines on the whole-sign boundaries (inner ring to zodiac ring).
  ctx.save();
  ctx.strokeStyle = "rgba(212, 175, 55, 0.14)";
  ctx.lineWidth = 0.5;
  for (let k = 0; k < 12; k += 1) {
    const longitude = k * 30;
    const a = longitudeToCartesian(longitude, geo.innerRadius, geo.cx, geo.cy);
    const b = longitudeToCartesian(longitude, geo.zodiacRadius, geo.cx, geo.cy);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();

  // House numbers at each whole-sign midpoint, 1 starting from the Asc sign.
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
  const numSize = Math.max(8, Math.min(12, geo.size * 0.02));
  ctx.font = `${numSize}px ui-monospace, "JetBrains Mono", Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const numRadius = geo.innerRadius + (geo.zodiacRadius - geo.innerRadius) * 0.5;
  for (let h = 1; h <= 12; h += 1) {
    const mid = ascSignStart + (h - 1) * 30 + 15;
    const pos = longitudeToCartesian(mid, numRadius, geo.cx, geo.cy);
    ctx.fillText(String(h), pos.x, pos.y);
  }
  ctx.restore();

  // The Ascendant itself: a brighter spoke plus an ASC label.
  ctx.save();
  ctx.strokeStyle = "rgba(244, 208, 63, 0.7)";
  ctx.lineWidth = 1.2;
  const ia = longitudeToCartesian(ascNorm, geo.innerRadius, geo.cx, geo.cy);
  const ib = longitudeToCartesian(ascNorm, geo.outerRadius, geo.cx, geo.cy);
  ctx.beginPath();
  ctx.moveTo(ia.x, ia.y);
  ctx.lineTo(ib.x, ib.y);
  ctx.stroke();
  const labelSize = Math.max(8, Math.min(11, geo.size * 0.018));
  ctx.fillStyle = "rgba(244, 208, 63, 0.9)";
  ctx.font = `${labelSize}px ui-monospace, "JetBrains Mono", Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const labelPos = longitudeToCartesian(
    ascNorm,
    geo.innerRadius - labelSize * 1.2,
    geo.cx,
    geo.cy,
  );
  ctx.fillText("ASC", labelPos.x, labelPos.y);
  ctx.restore();
}

function drawAspectLines(
  ctx: CanvasRenderingContext2D,
  geo: WheelGeometry,
  chart: Readonly<Record<Planet, Longitude>>,
): void {
  const aspects = computeAspects(chart);
  for (const aspect of aspects) {
    if (aspect.kind === "conjunction") continue;
    const style = ASPECT_STYLES[aspect.kind];
    const a = longitudeToCartesian(chart[aspect.a], geo.planetRadius - geo.glyphSize, geo.cx, geo.cy);
    const b = longitudeToCartesian(chart[aspect.b], geo.planetRadius - geo.glyphSize, geo.cx, geo.cy);
    ctx.save();
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    if (style.dash.length > 0) {
      ctx.setLineDash([...style.dash]);
    }
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }
}

function drawConjunctionRings(
  ctx: CanvasRenderingContext2D,
  geo: WheelGeometry,
  chart: Readonly<Record<Planet, Longitude>>,
  pulsePhase: number,
): void {
  const aspects = computeAspects(chart).filter((a) => a.kind === "conjunction");
  const baseAlpha = 0.4 + 0.35 * (0.5 + 0.5 * Math.sin(pulsePhase));
  for (const aspect of aspects) {
    const mid = (chart[aspect.a] + chart[aspect.b]) / 2;
    const pos = longitudeToCartesian(mid, geo.planetRadius, geo.cx, geo.cy);
    ctx.save();
    ctx.strokeStyle = `rgba(244, 208, 63, ${baseAlpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, geo.glyphSize * 1.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPlanetGlyphs(
  ctx: CanvasRenderingContext2D,
  geo: WheelGeometry,
  chart: Readonly<Record<Planet, Longitude>>,
  culture: Culture | null,
  highlightPlanet: Planet | null,
  stops: MetalStops,
): void {
  for (const planet of PLANETS) {
    const longitude = chart[planet];
    const pos = longitudeToCartesian(longitude, geo.planetRadius, geo.cx, geo.cy);

    ctx.save();
    ctx.fillStyle = "rgba(5, 5, 5, 0.85)";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, geo.glyphSize * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (highlightPlanet === planet) {
      ctx.save();
      ctx.strokeStyle = "rgba(244, 208, 63, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, geo.glyphSize * 1.05, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const glyph = culture ? GLYPHS[culture][planet] : null;
    ctx.save();
    applyGoldStroke(ctx, pos.x, pos.y, geo.glyphSize, stops);
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.translate(pos.x - geo.glyphSize / 2, pos.y - geo.glyphSize / 2);
    if (glyph) {
      const [vbW, vbH] = glyph.viewBox;
      ctx.scale(geo.glyphSize / vbW, geo.glyphSize / vbH);
      const path = new Path2D(glyph.d);
      ctx.stroke(path);
    } else {
      ctx.restore();
      ctx.save();
      applyGoldStroke(ctx, pos.x, pos.y, geo.glyphSize, stops);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = `${geo.glyphSize * 0.85}px ui-serif, Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const symbols: Readonly<Record<Planet, string>> = {
        sun: "☉",
        moon: "☽",
        mercury: "☿",
        venus: "♀",
        mars: "♂",
        jupiter: "♃",
        saturn: "♄",
      };
      ctx.fillText(symbols[planet], pos.x, pos.y + 1);
    }
    ctx.restore();
  }
}
