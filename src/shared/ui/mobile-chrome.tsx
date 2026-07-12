"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Plus, Tag, Upload } from "lucide-react";
import { cn } from "@/shared/lib/cn";

const TABS = [
  { href: "/", label: "회의록", icon: FileText },
  { href: "/tags", label: "프로젝트 태그", icon: Tag },
] as const;

/** Fixed bottom tab bar, mobile only (<640px). Hidden at sm and up — AppNav takes over. */
export function MobileTabBar() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-divider bg-surface sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-caption font-medium transition-colors",
              active ? "text-accent" : "text-ink-muted",
            )}
          >
            <Icon className="size-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

const FAB_BY_PATH: Record<string, { href: string; label: string; icon: typeof Plus }> = {
  "/": { href: "/meetings/new", label: "새 회의 업로드", icon: Upload },
  "/tags": { href: "/tags/new", label: "새 프로젝트 태그", icon: Plus },
};

/** Context-aware FAB, mobile only — upload on the meeting list, new-tag on the tag list. */
export function MobileFab() {
  const pathname = usePathname();
  const config = FAB_BY_PATH[pathname];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Link
      href={config.href}
      aria-label={config.label}
      className="fixed right-5 z-40 flex size-14 items-center justify-center rounded-full bg-accent text-white shadow-[var(--shadow-token-fab)] transition-colors hover:bg-accent-hover sm:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 80px)" }}
    >
      <Icon className="size-6" />
    </Link>
  );
}
