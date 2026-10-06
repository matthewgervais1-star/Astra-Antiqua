import { SectionDivider } from "@/components/chrome/SectionDivider";
import type { DiveDeeper as DiveDeeperData } from "@/lib/diveDeeper";

export interface DiveDeeperProps {
  data: DiveDeeperData;
  /** The culture's come-back line, closing the day page; omitted on a dated view. */
  comeBack?: string | null;
}

/**
 * The day page's dive deeper (spec A.6): the four house groups, each a title
 * in the culture's names, the figure it reads in mono, and its paragraph,
 * under the nave's section divider and between the rules the day-pressure
 * module draws. The culture's come-back line closes the page beneath it.
 */
export function DiveDeeper({ data, comeBack = null }: DiveDeeperProps) {
  return (
    <section id="dive-deeper" className="mx-auto max-w-[720px] px-5 py-10 md:px-14">
      <SectionDivider label={data.natal ? "DIVE DEEPER · FROM YOUR CHART" : "DIVE DEEPER"} />
      <div className="mt-6 flex flex-col">
        {data.groups.map((group) => (
          <article key={group.title} className="border-t border-rule py-6 last:border-b">
            <h3 className="font-display text-prose-m leading-display text-bone">{group.title}</h3>
            {group.evidence ? (
              <div className="mt-1 font-mono text-data-xs tracking-data text-dim">{group.evidence}</div>
            ) : null}
            <p
              className={
                group.quiet
                  ? "mt-3 text-pretty font-body text-prose-s font-light leading-prose text-dim"
                  : "mt-3 text-pretty font-body text-prose-s font-light leading-prose text-prose"
              }
            >
              {group.sentences.join(" ")}
            </p>
          </article>
        ))}
      </div>
      {comeBack ? (
        <div className="mt-8 text-center font-mono text-data-xs uppercase tracking-label text-dim">{comeBack}</div>
      ) : null}
    </section>
  );
}
