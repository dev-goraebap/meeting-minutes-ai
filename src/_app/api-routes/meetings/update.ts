import { z } from "zod";
import { NextResponse } from "next/server";
import { getMeetingById, updateMeetingFields } from "@/shared/db/queries/meetings";

const updateSchema = z
  .object({
    structuredMinutes: z.string().optional(),
    speakerMapping: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export async function patchMeeting(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const meeting = await getMeetingById(id);
  if (!meeting) {
    return NextResponse.json({ error: "회의를 찾을 수 없어요." }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않아요.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await updateMeetingFields(id, parsed.data);
  return NextResponse.json({ ok: true });
}
