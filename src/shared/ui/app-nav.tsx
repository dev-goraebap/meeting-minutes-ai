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
    <header className="sticky top-0 z-40 border-b border-divider bg-page/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-6 px-6 py-3">
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
    </header>
  );
}
