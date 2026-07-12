import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function IosGroupedList({
  className,
  children,
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "divide-y divide-divider overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function IosGroupedListRow({
  href,
  className,
  children,
  showChevron = true,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
  showChevron?: boolean;
}) {
  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
      {showChevron && (
        <ChevronRight className="size-4 shrink-0 text-ink-faint" />
      )}
    </>
  );

  const rowClassName = cn(
    "flex items-center gap-3 px-5 py-4 transition-colors",
    href && "hover:bg-surface-sunken",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={rowClassName}>
        {content}
      </Link>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
