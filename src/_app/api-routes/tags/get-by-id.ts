import { NextResponse } from "next/server";
import { getTagWithMeetingCount } from "@/shared/db/queries/tags";

export async function getTag(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tag = await getTagWithMeetingCount(id);

  if (!tag) {
    return NextResponse.json({ error: "태그를 찾을 수 없어요." }, { status: 404 });
  }

  return NextResponse.json(tag);
}
