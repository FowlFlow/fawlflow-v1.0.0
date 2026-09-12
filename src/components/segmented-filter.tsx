"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function SegmentedFilter({
  param,
  current,
  options,
}: {
  param: string;
  current: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setValue(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set(param, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="inline-flex rounded-lg border p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setValue(opt.value)}
          aria-pressed={current === opt.value}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            current === opt.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
