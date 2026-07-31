"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & { label: string; hint?: string };

export function PasswordField({
  label,
  hint,
  id,
  name,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;
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
          className="min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 pr-14 text-base text-white placeholder:text-neutral-600 hover:border-neutral-500 focus:border-red-500 focus:outline-none"
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
      {hint ? (
        <p className="mt-2 text-xs leading-5 text-neutral-500" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
