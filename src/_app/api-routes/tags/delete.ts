import { NextResponse } from "next/server";
import { deleteTag, getTagWithMeetingCount } from "@/shared/db/queries/tags";

export async function deleteTagRoute(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tag = await getTagWithMeetingCount(id);

  if (!tag) {
    return NextResponse.json({ error: "태그를 찾을 수 없어요." }, { status: 404 });
  }

  if (tag.meetingCount > 0) {
    return NextResponse.json(
      { error: "이 태그를 사용하는 회의록이 있어 삭제할 수 없어요." },
      { status: 409 },
    );
  }

  await deleteTag(id);
  return NextResponse.json({ ok: true });
}
