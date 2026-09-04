"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { StatusMessage } from "@/components/ui/status-message";

export function FlashStatusMessage({
  param,
  value,
  children,
  tone = "success",
}: {
  param: string;
  value: string;
  children: React.ReactNode;
  tone?: "success" | "error";
}) {
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

  return <StatusMessage tone={tone}>{children}</StatusMessage>;
}