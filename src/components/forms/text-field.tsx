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
        className="mb-2 block text-sm font-bold text-neutral-100"
        htmlFor={inputId}
      >
        {label}
      </label>
      <input
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white placeholder:text-neutral-400 hover:border-neutral-500 focus:border-red-500 focus:outline-none",
          error && "border-red-500",
          className,
        )}
        id={inputId}
        {...props}
      />
      {hint || error ? (
        <p
          className={cn(
            "mt-2 text-xs leading-5 text-neutral-400",
            error && "text-red-300",
          )}
          id={descriptionId}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
