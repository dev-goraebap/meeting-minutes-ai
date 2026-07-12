"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";
import { TagColorDot } from "@/shared/ui/tag-color-dot";
import { formatDate } from "@/shared/lib/format-date";
import { usePolling } from "@/shared/lib/use-polling";
import type { MeetingStatus } from "@/shared/db/schema";

type Meeting = {
  id: string;
  tagId: string;
  tagName: string;
  tagColor: string;
  title: string;
  audioFilePath: string;
  status: MeetingStatus;
  errorMessage: string | null;
  rawTranscript: unknown[] | null;
  structuredMinutes: string | null;
  speakerMapping: Record<string, string> | null;
  extraNote: string | null;
  createdAt: string;
};

const STEPS = [
  { key: "uploaded", label: "업로드", note: "오디오 저장" },
  { key: "transcribing", label: "전사", note: "화자분리 STT" },
  { key: "summarizing", label: "요약", note: "회의록 구조화" },
  { key: "completed", label: "완료", note: "회의록 생성" },
] as const;

type StepState = "done" | "active" | "todo" | "failed";

function getStepStates(meeting: Meeting): StepState[] {
  const hasTranscript = Boolean(meeting.rawTranscript);

  switch (meeting.status) {
    case "uploaded":
      return ["done", "active", "todo", "todo"];
    case "transcribing":
      return ["done", "active", "todo", "todo"];
    case "summarizing":
      return ["done", "done", "active", "todo"];
    case "completed":
      return ["done", "done", "done", "done"];
    case "failed":
      return hasTranscript
        ? ["done", "done", "failed", "todo"]
        : ["done", "failed", "todo", "todo"];
  }
}

function StepIcon({ index, state }: { index: number; state: StepState }) {
  const base = "flex size-8 items-center justify-center rounded-full text-caption font-bold";
  if (state === "done") {
    return (
      <div className={`${base} bg-status-completed text-white`}>
        <Check className="size-4" />
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className={`${base} bg-accent text-white`}>
        <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }
  if (state === "failed") {
    return <div className={`${base} bg-status-failed text-white`}>!</div>;
  }
  return (
    <div className={`${base} bg-surface-sunken text-ink-muted`}>{index + 1}</div>
  );
}

export function MeetingDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchMeeting = useCallback(async () => {
    const res = await fetch(`/api/meetings/${id}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    setMeeting(await res.json());
  }, [id]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  const isTerminal =
    meeting?.status === "completed" || meeting?.status === "failed";
  usePolling(fetchMeeting, 3000, Boolean(meeting) && !isTerminal);

  async function handleRetry() {
    setRetrying(true);
    await fetch(`/api/meetings/${id}/retry`, { method: "POST" });
    await fetchMeeting();
    setRetrying(false);
  }

  async function handleDelete() {
    if (!confirm("이 회의록을 삭제할까요? 되돌릴 수 없어요.")) return;
    setDeleting(true);
    await fetch(`/api/meetings/${id}`, { method: "DELETE" });
    router.push("/");
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-page px-6 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-body text-ink-secondary">회의를 찾을 수 없어요.</p>
          <Link href="/" className="mt-3 inline-block text-accent underline">
            회의록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  if (!meeting) {
    return (
      <main className="min-h-screen bg-page px-6 py-8">
        <div className="mx-auto max-w-2xl text-body text-ink-muted">불러오는 중…</div>
      </main>
    );
  }

  const stepStates = getStepStates(meeting);

  return (
    <main className="min-h-screen bg-page px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-caption text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          회의록
        </Link>

        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-detail-h1 font-bold text-ink">{meeting.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-meta text-ink-muted">
              <TagColorDot color={meeting.tagColor} />
              {meeting.tagName} · {formatDate(meeting.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={meeting.status} />
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 text-caption text-status-failed hover:underline disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              삭제
            </button>
          </div>
        </div>

        {!isTerminal || meeting.status === "failed" ? (
          <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-surface p-6">
            <div className="flex items-center">
              {STEPS.map((step, i) => (
                <div key={step.key} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <StepIcon index={i} state={stepStates[i]} />
                    <div className="text-center">
                      <p className="text-caption font-semibold text-ink">{step.label}</p>
                      <p className="text-caption text-ink-faint">{step.note}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-2 h-px flex-1 ${
                        stepStates[i] === "done" ? "bg-status-completed" : "bg-divider"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {meeting.status === "failed" && (
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-divider pt-4">
                <p className="text-body text-status-failed">{meeting.errorMessage}</p>
                <Button onClick={handleRetry} disabled={retrying} className="shrink-0">
                  {retrying ? "재시도 중…" : "재시도"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-surface p-6">
            <h2 className="text-section-label font-bold text-ink">구조화 회의록</h2>
            <pre className="mt-3 whitespace-pre-wrap text-body text-ink">
              {meeting.structuredMinutes}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
