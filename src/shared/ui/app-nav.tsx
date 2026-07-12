"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";

const LINKS = [
  { href: "/", label: "회의록" },
  { href: "/tags", label: "프로젝트 태그" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-divider bg-page/90 backdrop-blur sm:block">
      {/*
        Padding lives on this outer px-6 wrapper (not on the max-w-page div
        itself) so the header's left/right edge lines up with page content
        below, which uses the same "outer padding, unpadded centered inner"
        nesting (e.g. meeting-list: <main className="px-6"><div className="mx-auto max-w-page">).
        Padding *inside* the max-w box instead would add an extra 24px inset
        on top of the centering, misaligning the two.
      */}
      <div className="px-6">
        <div className="mx-auto flex h-15 max-w-page items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-[var(--radius-control)] bg-accent text-caption font-bold text-white">
              회
            </span>
            <span className="text-body font-bold text-ink">회의록</span>
          </Link>
          <nav className="flex items-center gap-4">
            {LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-body font-medium transition-colors",
                    active ? "text-ink" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
