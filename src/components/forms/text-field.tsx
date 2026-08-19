import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name;
  const descriptionId = hint || error ? `${inputId}-description` : undefined;

  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-white/90"
        htmlFor={inputId}
      >
        {label}
      </label>

      <input
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-12 w-full rounded-xl border border-[#992bff]/30 bg-black/70 px-4 py-3 text-base text-white shadow-inner shadow-[#992bff]/5 transition-colors placeholder:text-white/30 hover:border-[#992bff]/60 focus:border-[#f359d2] focus:ring-2 focus:ring-[#992bff]/30 focus:outline-none",
          error &&
            "border-[#ff6b9e] focus:border-[#ff6b9e] focus:ring-[#ff6b9e]/25",
          className,
        )}
        id={inputId}
        {...props}
      />

      {hint || error ? (
        <p
          className={cn(
            "mt-2 text-xs leading-5 text-white/45",
            error && "text-[#ff9ab9]",
          )}
          id={descriptionId}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
