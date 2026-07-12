import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cn } from "@/shared/lib/cn";

export const MenuRoot = BaseMenu.Root;
export const MenuTrigger = BaseMenu.Trigger;

export function MenuContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup>) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={6} align="end">
        <BaseMenu.Popup
          className={cn(
            "min-w-40 rounded-[var(--radius-control)] border border-border bg-surface p-1 shadow-[var(--shadow-token-md)] outline-none",
            className,
          )}
          {...props}
        />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function MenuItem({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenu.Item>) {
  return (
    <BaseMenu.Item
      className={cn(
        "cursor-pointer rounded-[var(--radius-control)] px-3 py-2 text-body text-ink outline-none transition-colors data-[highlighted]:bg-surface-sunken",
        className,
      )}
      {...props}
    />
  );
}
