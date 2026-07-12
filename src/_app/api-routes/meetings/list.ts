import { NextRequest, NextResponse } from "next/server";
import { listMeetings } from "@/shared/db/queries/meetings";

export async function getMeetingsList(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 6);
  const offset = Number(searchParams.get("offset") ?? 0);

  const rows = await listMeetings({ limit, offset });
  return NextResponse.json(rows);
}
