"use client";

import { ReactNode } from "react";
import clsx from "clsx";

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-ink-950">
      {children}
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-lg border border-ink-950/10 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-950/30 focus:border-sun-500 focus:ring-2 focus:ring-sun-500/15",
        props.className
      )}
    />
  );
}

export function OptionCard({
  selected,
  onClick,
  title,
  description,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors duration-150",
        selected
          ? "border-sun-500 bg-sun-500/6"
          : "border-ink-950/10 bg-white hover:border-ink-950/20"
      )}
    >
      {icon && (
        <span
          className={clsx(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
            selected
              ? "bg-sun-500 text-white"
              : "bg-ink-950/5 text-ink-950/55"
          )}
        >
          {icon}
        </span>
      )}
      <span>
        <span className="block text-sm font-semibold text-ink-950">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-ink-800/55">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

export function ToggleCard({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors duration-150",
        active
          ? "border-leaf-500 bg-leaf-500/6"
          : "border-ink-950/10 bg-white hover:border-ink-950/20"
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-ink-950">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-ink-800/55">
          {description}
        </span>
      </span>
      <span
        className={clsx(
          "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
          active ? "bg-leaf-500" : "bg-black/15"
        )}
      >
        <span
          className={clsx(
            "h-5 w-5 rounded-full bg-white shadow transition-transform",
            active && "translate-x-5"
          )}
        />
      </span>
    </button>
  );
}
