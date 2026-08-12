import { Lintel } from "@/components/chrome/Lintel";
import { MethodFooter } from "@/components/chrome/MethodFooter";
import { Skeleton } from "@/components/chrome/Skeleton";

export default function Loading() {
  return (
    <>
      <Lintel active="today" />
      <div className="h-[46px] border-b border-rule" />
      <main className="mx-auto max-w-[720px] px-5 py-12 md:py-16">
        <Skeleton />
      </main>
      <MethodFooter />
    </>
  );
}
