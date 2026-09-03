"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { StatusMessage } from "@/components/ui/status-message";

export function FlashStatusMessage({
  param,
  value,
  children,
}: {
  param: string;
  value: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get(param) !== value) return;

    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.delete(param);

    const nextUrl = nextParams.size
      ? `${pathname}?${nextParams.toString()}`
      : pathname;

    window.history.replaceState(null, "", nextUrl);
  }, [param, pathname, searchParams, value]);

  return <StatusMessage tone="success">{children}</StatusMessage>;
}
