import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function TagFilterChip({
  active,
  count,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  count: number;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-pill)] px-3 text-caption font-semibold transition-colors",
        active
          ? "bg-ink text-white"
          : "bg-surface text-ink-secondary border border-border hover:bg-surface-sunken",
        className,
      )}
      {...props}
    >
      {children}
      <span className={cn(active ? "text-white/70" : "text-ink-faint")}>
        {count}
      </span>
    </button>
  );
}
