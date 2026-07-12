import type { MeetingStatus } from "@/shared/db/schema";

export const STATUS_LABEL: Record<MeetingStatus, string> = {
  uploaded: "대기 중",
  transcribing: "전사 중",
  summarizing: "요약 중",
  completed: "완료",
  failed: "실패",
};

export const STATUS_NOTE: Record<MeetingStatus, string> = {
  uploaded: "대기열에서 처리 대기 중…",
  transcribing: "AssemblyAI 화자분리 전사 중…",
  summarizing: "Claude로 회의록 구조화 중…",
  completed: "처리 완료",
  failed: "처리 중 오류가 발생했어요",
};

/** Rough visual progress for the compact list-row bar (not real percentages). */
export const STATUS_PROGRESS: Record<MeetingStatus, number> = {
  uploaded: 10,
  transcribing: 45,
  summarizing: 75,
  completed: 100,
  failed: 100,
};

export function isProcessing(status: MeetingStatus) {
  return status === "uploaded" || status === "transcribing" || status === "summarizing";
}
