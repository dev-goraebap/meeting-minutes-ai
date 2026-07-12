import { cn } from "@/shared/lib/cn";

const CYCLE_LENGTH = 5;

/** Assigns one of the 5 cycle colors deterministically by creation order. */
export function tagCycleColorVar(cycleIndex: number) {
  const slot = (cycleIndex % CYCLE_LENGTH) + 1;
  return `var(--color-cycle-${slot})`;
}

export function TagColorDot({
  color,
  className,
}: {
  /** A resolved color value, e.g. from tagCycleColorVar() or a stored hex. */
  color: string;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
    />
  );
}
