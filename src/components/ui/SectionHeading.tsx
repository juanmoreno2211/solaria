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
            "inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] uppercase",
            light ? "text-sun-300" : "text-sun-600"
          )}
        >
          <span className={clsx("h-px w-6", light ? "bg-sun-300/60" : "bg-sun-500/60")} />
          {eyebrow}
        </span>
      )}
      <h2
        className={clsx(
          "text-balance text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-[2.6rem]",
          light ? "text-white" : "text-ink-950"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={clsx(
            "max-w-2xl text-balance text-base leading-relaxed sm:text-lg",
            light ? "text-white/55" : "text-stone-600",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
