"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/cn";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  hint?: string;
  error?: string;
};

export function PasswordField({
  label,
  hint,
  error,
  className,
  id,
  name,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? name;
  const hintId = hint || error ? `${inputId}-hint` : undefined;

  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-white/90"
        htmlFor={inputId}
      >
        {label}
      </label>

      <div className="relative">
        <input
          aria-describedby={hintId}
          aria-invalid={error ? true : undefined}
          className={cn(
            "min-h-12 w-full rounded-xl border border-[#992bff]/30 bg-black/70 px-4 py-3 pr-14 text-base text-white shadow-inner shadow-[#992bff]/5 transition-colors placeholder:text-white/30 hover:border-[#992bff]/60 focus:border-[#f359d2] focus:ring-2 focus:ring-[#992bff]/30 focus:outline-none",
            error &&
              "border-[#ff6b9e] focus:border-[#ff6b9e] focus:ring-[#ff6b9e]/25",
            className,
          )}
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          {...props}
        />

        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-1.5 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-[#992bff]/15 hover:text-[#f359d2] focus:ring-2 focus:ring-[#f359d2]/40 focus:outline-none"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-5" />
          ) : (
            <Eye aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>

      {hint || error ? (
        <p
          className={cn(
            "mt-2 text-xs leading-5 text-white/45",
            error && "text-[#ff9ab9]",
          )}
          id={hintId}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}