import type { MeetingStatus } from "@/shared/db/schema";
import { STATUS_LABEL } from "@/shared/lib/meeting-status";
import { cn } from "@/shared/lib/cn";

const STATUS_CLASSES: Record<MeetingStatus, string> = {
  uploaded: "text-status-uploaded bg-status-uploaded-surface",
  transcribing: "text-status-transcribing bg-status-transcribing-surface",
  summarizing: "text-status-summarizing bg-status-summarizing-surface",
  completed: "text-status-completed bg-status-completed-surface",
  failed: "text-status-failed bg-status-failed-surface",
};

export function StatusBadge({
  status,
  className,
}: {
  status: MeetingStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-[var(--radius-pill)] px-2.5 text-caption font-semibold",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
