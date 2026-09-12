"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function useActionToast(error?: string | null) {
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
}
