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
        "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-800/35 focus:border-sun-500 focus:ring-2 focus:ring-sun-500/20",
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
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
        selected
          ? "border-sun-500 bg-sun-500/8 shadow-[0_10px_24px_-16px_rgba(245,158,11,0.7)] ring-1 ring-sun-500/30"
          : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_10px_20px_-16px_rgba(20,17,12,0.25)]"
      )}
    >
      {icon && (
        <span
          className={clsx(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200",
            selected
              ? "bg-sun-gradient text-ink-950 scale-105"
              : "bg-black/5 text-ink-800/60"
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
        "flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all duration-200",
        active
          ? "border-leaf-500 bg-leaf-500/8 shadow-[0_10px_24px_-16px_rgba(34,197,94,0.6)]"
          : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_10px_20px_-16px_rgba(20,17,12,0.25)]"
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
