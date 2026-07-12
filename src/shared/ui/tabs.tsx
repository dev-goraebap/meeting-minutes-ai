import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "@/shared/lib/cn";

export const TabsRoot = BaseTabs.Root;

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn("flex gap-5 border-b border-divider", className)}
      {...props}
    />
  );
}

export function Tab({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        "relative -mb-px border-b-2 border-transparent px-1 py-2.5 text-body font-semibold text-ink-muted transition-colors",
        "data-[selected]:border-accent data-[selected]:text-accent",
        className,
      )}
      {...props}
    />
  );
}

export function TabPanel({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Panel>) {
  return <BaseTabs.Panel className={cn("pt-5", className)} {...props} />;
}
