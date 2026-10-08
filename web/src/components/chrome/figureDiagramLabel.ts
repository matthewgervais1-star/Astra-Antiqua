import type { AspectKind } from "@/data/sampleChart";

export interface FigureDiagramLabelInput {
  from: { label: string };
  to: { label: string };
  kind: AspectKind;
  angle: number;
  centerLabel?: string;
}

/**
 * The figure diagram's aria-label. The drawn labels are aria-hidden, so this
 * one announcement names every label a sighted reader sees: both points, the
 * kind with its angle, and the center label ("YOU") when it is drawn.
 */
export function figureDiagramLabel({ from, to, kind, angle, centerLabel }: FigureDiagramLabelInput): string {
  const figure = `${from.label} and ${to.label}, ${kind}, ${angle} degrees apart`;
  return centerLabel ? `${figure}, ${centerLabel} at the center` : figure;
}
