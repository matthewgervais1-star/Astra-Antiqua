"use client";

import { Suspense } from "react";
import { Lintel } from "@/components/chrome/Lintel";
import { SubBar } from "@/components/chrome/SubBar";
import { CultureGate } from "@/components/chrome/CultureGate";
import { MethodFooter } from "@/components/chrome/MethodFooter";
import { LiveClock } from "@/components/home/LiveClock";
import { HomeBody } from "@/components/home/HomeBody";
import { Skeleton } from "@/components/chrome/Skeleton";

/**
 * The home route's full assembly: Lintel + SubBar (live date/time context,
 * D active) + the culture-gated body + MethodFooter. A single client
 * component so the whole reading surface mounts together; the individual
 * interactive pieces (CultureGate, HomeBody) are their own islands. The
 * clock and the body read `?date` through the router, so each sits in a
 * Suspense boundary.
 */
export function HomeExperience() {
  return (
    <>
      <Lintel active="today" />
      <SubBar
        context={
          <Suspense fallback={<span className="whitespace-nowrap">--:-- UTC</span>}>
            <LiveClock />
          </Suspense>
        }
        horizon="day"
        showSync
      />
      <CultureGate>
        <Suspense
          fallback={
            <div className="mx-auto max-w-[720px] px-5 py-12">
              <Skeleton />
            </div>
          }
        >
          <HomeBody />
        </Suspense>
      </CultureGate>
      <MethodFooter />
    </>
  );
}
