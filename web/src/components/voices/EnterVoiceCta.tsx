"use client";

import { useRouter } from "next/navigation";
import type { Culture } from "@/data/cultures";
import { writePersistedPantheon } from "@/lib/pantheonPreference";
import { Button } from "@/components/chrome/Button";

export interface EnterVoiceCtaProps {
  culture: Culture;
  label: string;
}

/** Sets the persisted culture and enters the day's reading in that voice. */
export function EnterVoiceCta({ culture, label }: EnterVoiceCtaProps) {
  const router = useRouter();

  const enter = () => {
    writePersistedPantheon(culture);
    router.push(`/?culture=${culture}`);
  };

  return (
    <Button variant="votive" block onClick={enter} className="mx-auto max-w-[460px]">
      {label}
    </Button>
  );
}
