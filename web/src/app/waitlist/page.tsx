import type { Metadata } from "next";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { WaitListForm } from "@/components/waitlist/WaitListForm";

const CONTEXT = "SYNC ACCOUNTS · LIMITED ADMISSION";

export const metadata: Metadata = {
  title: "The Roll",
  description:
    "Names are called in order, a cohort at a time. Everything else already works without an account.",
};

export default function WaitlistPage() {
  return (
    <NaveShell context={CONTEXT}>
      <NaveHead
        kicker={CONTEXT}
        sub={
          <p className="mx-auto max-w-[400px] font-body text-prose-s leading-prose text-prose">
            Names are called in order, a cohort at a time. Everything else already works without
            one.
          </p>
        }
      >
        THE ROLL IS OPEN
      </NaveHead>

      <div className="mx-auto max-w-[340px]">
        <WaitListForm compact />
      </div>
    </NaveShell>
  );
}
