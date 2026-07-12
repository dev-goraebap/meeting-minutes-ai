import { desc, eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { meetings, tags } from "@/shared/db/schema";

export async function listMeetings({
  limit = 6,
  offset = 0,
}: { limit?: number; offset?: number } = {}) {
  return db
    .select({
      id: meetings.id,
      title: meetings.title,
      status: meetings.status,
      errorMessage: meetings.errorMessage,
      createdAt: meetings.createdAt,
      tagId: meetings.tagId,
      tagName: tags.name,
      tagColor: tags.color,
    })
    .from(meetings)
    .innerJoin(tags, eq(meetings.tagId, tags.id))
    .orderBy(desc(meetings.createdAt))
    .limit(limit)
    .offset(offset);
}
