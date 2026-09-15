import { ReactNode } from "react";
import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left"
      )}
    >
      {eyebrow && (
        <span
          className={clsx(
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wide uppercase",
            light
              ? "border-white/15 bg-white/5 text-sun-300"
              : "border-sun-500/25 bg-sun-500/10 text-sun-600"
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={clsx(
          "text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.75rem]",
          light ? "text-white" : "text-ink-950"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={clsx(
            "max-w-2xl text-balance text-base sm:text-lg",
            light ? "text-white/65" : "text-ink-800/65",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
