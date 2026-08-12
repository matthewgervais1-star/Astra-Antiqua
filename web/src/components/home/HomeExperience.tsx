"use client";

import { Lintel } from "@/components/chrome/Lintel";
import { SubBar } from "@/components/chrome/SubBar";
import { CultureGate } from "@/components/chrome/CultureGate";
import { MethodFooter } from "@/components/chrome/MethodFooter";
import { LiveClock } from "@/components/home/LiveClock";
import { HomeBody } from "@/components/home/HomeBody";

/**
 * The home route's full assembly: Lintel + SubBar (live date/time context,
 * D active) + the culture-gated body + MethodFooter. A single client
 * component so the whole reading surface mounts together; the individual
 * interactive pieces (CultureGate, HomeBody) are their own islands.
 */
export function HomeExperience() {
  return (
    <>
      <Lintel active="today" />
      <SubBar context={<LiveClock />} horizon="day" showSync />
      <CultureGate>
        <HomeBody />
      </CultureGate>
      <MethodFooter />
    </>
  );
}
