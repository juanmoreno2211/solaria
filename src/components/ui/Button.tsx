import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-out hover:[&_svg]:translate-x-0.5";

const variants: Record<Variant, string> = {
  primary:
    "bg-sun-gradient text-ink-950 shadow-[0_8px_30px_-8px_rgba(245,158,11,0.6)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 before:absolute before:inset-0 before:content-[''] before:bg-gradient-to-r before:from-transparent before:via-white/55 before:to-transparent before:-translate-x-[150%] before:skew-x-12 before:transition-transform before:duration-700 before:ease-out hover:before:translate-x-[150%]",
  secondary:
    "bg-white text-ink-950 border border-black/10 hover:-translate-y-0.5 hover:border-sun-500/40 hover:shadow-[0_10px_24px_-14px_rgba(245,158,11,0.55)] active:translate-y-0 before:absolute before:inset-0 before:content-[''] before:origin-left before:scale-x-0 before:bg-sun-500/12 before:transition-transform before:duration-300 before:ease-out hover:before:scale-x-100",
  ghost:
    "bg-transparent text-current before:absolute before:inset-0 before:content-[''] before:origin-left before:scale-x-0 before:bg-black/5 before:transition-transform before:duration-300 before:ease-out hover:before:scale-x-100",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
