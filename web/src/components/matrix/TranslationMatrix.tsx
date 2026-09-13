import Link from "next/link";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import { CULTURES, CULTURE_LABELS, PLANETS, RECEIVED_BODIES } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { CULTURE_ACCENTS } from "@/data/palettes";
import { cn } from "@/lib/classNames";
import { CultureEmblem } from "@/components/chrome/CultureEmblem";

/**
 * The ten-by-five reference table: every body this almanac tracks, seated
 * beside its name in every culture's own theology. Mono, bordered, no
 * ornament beyond the one gold rule that marks where the ancient lists end.
 * The BODY column has no culture in scope, so it keeps the classical sign;
 * each culture cell leads with that culture's own drawn glyph for the body.
 * The table wrapper scrolls horizontally on its own at small widths; the
 * page around it never does.
 */
export function TranslationMatrix() {
  const firstReceived = RECEIVED_BODIES[0];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse font-mono text-[11px]">
          <caption className="sr-only">
            Ten bodies across five ancient theologies: the seven each culture named, and the
            three every culture received.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="px-2 py-2 text-left text-[11px] tracking-[0.2em] text-faint-ink"
              >
                BODY
              </th>
              {CULTURES.map((culture) => (
                <th
                  key={culture}
                  scope="col"
                  className="px-2 py-2 text-left text-[11px] tracking-[0.1em]"
                  style={{ color: CULTURE_ACCENTS[culture] }}
                >
                  <span className="flex items-center gap-[var(--space-1)]">
                    <CultureEmblem culture={culture} size={18} decorative />
                    {CULTURE_LABELS[culture].toUpperCase()}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLANETS.map((planet) => (
              <tr
                key={planet}
                className={cn(
                  "border-t last:border-b",
                  planet === firstReceived ? "border-harmony/35" : "border-rule-row",
                )}
              >
                <td className="px-2 py-[9px] text-dim">
                  <DeityGlyph body={planet} culture={null} size={16} />
                </td>
                {CULTURES.map((culture) => (
                  <td key={culture} className="px-2 py-[9px] text-bone">
                    <span className="inline-flex items-center gap-[6px]">
                      <DeityGlyph body={planet} culture={culture} size={16} />
                      {DEITY_MATRIX[culture][planet].name}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 font-mono text-[11px] leading-[1.7] tracking-[0.04em] text-dim">
        GOLD RULE MARKS WHERE THE ANCIENT LISTS END. THE LAST THREE ROWS ARE RECEPTIONS, MADE IN
        THE ANCIENT MANNER AND SAID SO →{" "}
        <Link href="/method" className="text-[var(--accent)]">
          METHOD
        </Link>
      </div>
    </div>
  );
}
