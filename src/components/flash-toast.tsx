"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

export function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const flash = searchParams.get("flash");

  useEffect(() => {
    if (!flash) return;
    toast.success(flash);
    const params = new URLSearchParams(searchParams);
    params.delete("flash");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash]);

  return null;
}
