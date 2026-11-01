import { Fragment, type ReactNode } from "react";
import type { Culture } from "@/data/cultures";
import { strParts, type StringKey } from "@/strings";

export interface FillProps {
  k: StringKey;
  culture: Culture;
  /** One node per `{slot}` the template names: text, or an element such as a ScriptName. */
  slots?: Readonly<Record<string, ReactNode>>;
}

/**
 * Renders a catalog string with elements in its slots, for the lines where a
 * slot holds a ScriptName or a glyph. The characters between slots are the
 * catalog's; the component adds none and transforms none.
 */
export function Fill({ k, culture, slots = {} }: FillProps) {
  return (
    <>
      {strParts(k, culture).map((part, i) => {
        if (typeof part === "string") return <Fragment key={i}>{part}</Fragment>;
        const node = slots[part.slot];
        if (node === undefined) throw new Error(`Fill: ${k} needs slot {${part.slot}}`);
        return <Fragment key={i}>{node}</Fragment>;
      })}
    </>
  );
}
