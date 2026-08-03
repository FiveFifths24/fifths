"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & { label: string; hint?: string; error?: string };

export function PasswordField({
  label,
  hint,
  error,
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
        className="mb-2 block text-sm font-bold text-neutral-100"
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className="relative">
        <input
          aria-describedby={hintId}
          aria-invalid={error ? true : undefined}
          className={`min-h-12 w-full rounded-xl border bg-neutral-950 px-4 py-3 pr-14 text-base text-white placeholder:text-neutral-400 hover:border-neutral-500 focus:border-red-500 focus:outline-none ${error ? "border-red-500" : "border-neutral-700"}`}
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          {...props}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-1.5 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white"
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
          className={`mt-2 text-xs leading-5 ${error ? "text-red-300" : "text-neutral-400"}`}
          id={hintId}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
