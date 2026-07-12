"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function Modal({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const router = useRouter();
  const close = () => router.back();

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel — fullscreen below sm, floating card at sm and up */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex h-dvh w-full flex-col overflow-hidden bg-surface shadow-[var(--shadow-token-modal)]",
          "sm:h-auto sm:max-h-[85dvh] sm:w-full sm:max-w-lg sm:rounded-[var(--radius-card)]",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-divider px-5 py-4">
          <h2 className="text-modal-h2 font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="닫기"
            className="rounded-full p-1.5 text-ink-muted hover:bg-surface-sunken"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
