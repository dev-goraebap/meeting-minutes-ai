import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary:
    "bg-surface text-ink border border-border hover:bg-surface-sunken",
  ghost: "bg-transparent text-ink-secondary hover:bg-surface-sunken",
  destructive: "bg-transparent text-status-failed hover:bg-status-failed-surface",
};

const BASE_CLASSES =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-[var(--radius-control)] px-4 text-body font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

type CommonProps = { variant?: ButtonVariant; className?: string };

export function Button({
  variant = "primary",
  className,
  href,
  ...props
}: CommonProps &
  (
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  )) {
  const classes = cn(BASE_CLASSES, VARIANT_CLASSES[variant], className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    );
  }

  return (
    <button
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
}
