import { LucideIcon } from "lucide-react";
import clsx from "clsx";

type Accent = "sun" | "ember" | "leaf";

const ACCENTS: Record<Accent, { icon: string; border: string; underline: string }> = {
  sun: {
    icon: "bg-sun-500/10 text-sun-600",
    border: "hover:border-sun-500/35",
    underline: "group-hover:bg-sun-500",
  },
  ember: {
    icon: "bg-ember-500/10 text-ember-600",
    border: "hover:border-ember-500/35",
    underline: "group-hover:bg-ember-500",
  },
  leaf: {
    icon: "bg-leaf-500/10 text-leaf-600",
    border: "hover:border-leaf-500/35",
    underline: "group-hover:bg-leaf-500",
  },
};

export function FeatureCard({
  icon: Icon,
  index,
  title,
  description,
  accent = "sun",
  className,
}: {
  icon: LucideIcon;
  index: number;
  title: string;
  description: string;
  accent?: Accent;
  className?: string;
}) {
  const a = ACCENTS[accent];

  return (
    <div
      className={clsx(
        "group relative overflow-hidden rounded-xl border border-ink-950/8 bg-white p-7 transition-colors duration-200",
        a.border,
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-5 top-4 select-none text-5xl font-bold leading-none text-ink-950/[0.05]"
      >
        {String(index).padStart(2, "0")}
      </span>

      <span
        className={clsx(
          "relative flex h-10 w-10 items-center justify-center rounded-lg",
          a.icon
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>

      <h3 className="relative mt-5 text-lg font-semibold text-ink-950">
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-stone-600">
        {description}
      </p>
      <span
        aria-hidden
        className={clsx(
          "relative mt-5 block h-px w-8 bg-ink-950/15 transition-all duration-200 group-hover:w-12",
          a.underline
        )}
      />
    </div>
  );
}
