import { Skeleton } from "@/components/chrome/Skeleton";

export default function WeekLoading() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-12 md:py-16">
      <Skeleton />
    </div>
  );
}
