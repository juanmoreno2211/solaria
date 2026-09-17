import { LucideIcon } from "lucide-react";
import clsx from "clsx";

type Accent = "sun" | "ember" | "leaf";

const ACCENTS: Record<Accent, { icon: string; glow: string; ring: string }> = {
  sun: {
    icon: "bg-sun-gradient text-ink-950",
    glow: "bg-sun-500/25",
    ring: "group-hover:border-sun-500/30",
  },
  ember: {
    icon: "bg-ember-500/15 text-ember-600",
    glow: "bg-ember-500/25",
    ring: "group-hover:border-ember-500/30",
  },
  leaf: {
    icon: "bg-leaf-500/15 text-leaf-600",
    glow: "bg-leaf-500/25",
    ring: "group-hover:border-leaf-500/30",
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
        "group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-24px_rgba(20,17,12,0.35)]",
        a.ring,
        className
      )}
    >
      <span
        aria-hidden
        className={clsx(
          "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100",
          a.glow
        )}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 -top-2 select-none text-6xl font-black leading-none text-ink-950/[0.04]"
      >
        {String(index).padStart(2, "0")}
      </span>

      <span
        className={clsx(
          "relative flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110",
          a.icon
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </span>

      <h3 className="relative mt-5 text-lg font-semibold text-ink-950">
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-ink-800/65">
        {description}
      </p>
      <span
        aria-hidden
        className={clsx(
          "relative mt-4 block h-0.5 w-8 rounded-full bg-ink-950/10 transition-all duration-300 group-hover:w-14",
          accent === "sun" && "group-hover:bg-sun-500",
          accent === "ember" && "group-hover:bg-ember-500",
          accent === "leaf" && "group-hover:bg-leaf-500"
        )}
      />
    </div>
  );
}
