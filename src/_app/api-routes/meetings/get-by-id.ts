import { NextResponse } from "next/server";
import { getMeetingById } from "@/shared/db/queries/meetings";

export async function getMeeting(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const meeting = await getMeetingById(id);

  if (!meeting) {
    return NextResponse.json({ error: "회의를 찾을 수 없어요." }, { status: 404 });
  }

  return NextResponse.json(meeting);
}
