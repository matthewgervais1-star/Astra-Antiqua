import type { Metadata } from "next";
import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { WaitListForm } from "@/components/waitlist/WaitListForm";

export const metadata: Metadata = {
  title: "Wait List",
  description:
    "Be told when Astra Antiqua arrives on Android. One email. No marketing copy.",
};

export default function WaitListPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Pre-launch
        </div>
        <GoldText as="h1" className="mt-4 max-w-3xl text-5xl leading-tight md:text-7xl">
          Be told when it lands.
        </GoldText>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="space-y-6 md:col-span-7">
            <p className="text-ink-primary font-body text-lg leading-relaxed md:text-xl">
              Astra Antiqua is an Android application in active development. The astronomical engine performs ephemeris calculations to the precision of established Swiss Ephemeris derivatives. The translation layer renders the output through the religious vocabulary of five ancient cultures, selected at first launch and editable thereafter.
            </p>
            <p className="text-ink-secondary font-body text-lg leading-relaxed md:text-xl">
              The wait list exists so the people who care about the project can be told when the first build is ready to install, and what changed between the closed beta and public release. One short email at launch. No newsletter. No drip sequence.
            </p>
            <p className="text-ink-secondary font-body text-base leading-relaxed md:text-lg">
              If you have a classics or religious-studies background and an interest in the interpretive choices on the{" "}
              <Link href="/methodology" className="text-gold-leaf underline-offset-4 hover:underline">
                methodology page
              </Link>
              , say so in the form. Pre-release builds will be sent to a small group of readers with that background first.
            </p>
          </div>

          <div className="md:col-span-5">
            <WaitListForm />
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
