import { Lintel } from "@/components/chrome/Lintel";
import { SubBar } from "@/components/chrome/SubBar";
import { MethodFooter } from "@/components/chrome/MethodFooter";
import { Skeleton } from "@/components/chrome/Skeleton";

export default function Loading() {
  return (
    <>
      <Lintel active="today" />
      <SubBar context="THE LONG TRANSITS" />
      <main className="mx-auto max-w-[720px] px-5 py-12 md:py-16">
        <Skeleton />
      </main>
      <MethodFooter />
    </>
  );
}
