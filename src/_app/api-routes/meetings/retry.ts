import { NextResponse } from "next/server";
import { getMeetingById } from "@/shared/db/queries/meetings";
import { runPipeline } from "./run-pipeline";

export async function retryMeeting(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const meeting = await getMeetingById(id);

  if (!meeting) {
    return NextResponse.json({ error: "회의를 찾을 수 없어요." }, { status: 404 });
  }

  // Full restart, not resuming from the failed step (per ADR-0001).
  await runPipeline({
    meetingId: meeting.id,
    tagId: meeting.tagId,
    audioFilePath: meeting.audioFilePath,
    extraNote: meeting.extraNote,
  });

  return NextResponse.json({ ok: true });
}
