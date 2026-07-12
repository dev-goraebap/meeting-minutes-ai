import { NextResponse } from "next/server";
import { listTags } from "@/shared/db/queries/tags";

export async function getTagsList() {
  const rows = await listTags();
  return NextResponse.json(rows);
}
