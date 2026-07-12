import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { meetings, tags } from "@/shared/db/schema";
import type { TranscriptSegment } from "@/shared/api/assemblyai";

export async function listMeetings({
  limit = 6,
  offset = 0,
  tagId,
}: { limit?: number; offset?: number; tagId?: string } = {}) {
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
    .where(tagId ? eq(meetings.tagId, tagId) : undefined)
    .orderBy(desc(meetings.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getMeetingById(id: string) {
  const [row] = await db
    .select({
      id: meetings.id,
      tagId: meetings.tagId,
      tagName: tags.name,
      tagColor: tags.color,
      title: meetings.title,
      audioFilePath: meetings.audioFilePath,
      status: meetings.status,
      errorMessage: meetings.errorMessage,
      rawTranscript: meetings.rawTranscript,
      structuredMinutes: meetings.structuredMinutes,
      speakerMapping: meetings.speakerMapping,
      extraNote: meetings.extraNote,
      createdAt: meetings.createdAt,
    })
    .from(meetings)
    .innerJoin(tags, eq(meetings.tagId, tags.id))
    .where(eq(meetings.id, id))
    .limit(1);

  return row ?? null;
}

export async function createMeeting(input: {
  id: string;
  tagId: string;
  title: string;
  audioFilePath: string;
  extraNote: string | null;
}) {
  const [created] = await db
    .insert(meetings)
    .values({ ...input, status: "uploaded" })
    .returning({ id: meetings.id });
  return created.id;
}

export async function markTranscribing(id: string) {
  await db
    .update(meetings)
    .set({ status: "transcribing", errorMessage: null })
    .where(eq(meetings.id, id));
}

export async function saveRawTranscriptAndMarkSummarizing(
  id: string,
  rawTranscript: TranscriptSegment[],
) {
  await db
    .update(meetings)
    .set({ status: "summarizing", rawTranscript })
    .where(eq(meetings.id, id));
}

export async function saveStructuredMinutesAndComplete(
  id: string,
  structuredMinutes: string,
) {
  await db
    .update(meetings)
    .set({ status: "completed", structuredMinutes })
    .where(eq(meetings.id, id));
}

export async function markFailed(id: string, errorMessage: string) {
  await db.update(meetings).set({ status: "failed", errorMessage }).where(eq(meetings.id, id));
}

/** Most recent `limit` completed meetings' structuredMinutes for a tag, newest first. */
export async function getRecentCompletedMinutes(
  tagId: string,
  excludeMeetingId: string,
  limit = 3,
) {
  const rows = await db
    .select({ structuredMinutes: meetings.structuredMinutes })
    .from(meetings)
    .where(
      and(
        eq(meetings.tagId, tagId),
        eq(meetings.status, "completed"),
        ne(meetings.id, excludeMeetingId),
      ),
    )
    .orderBy(desc(meetings.createdAt))
    .limit(limit);

  return rows
    .map((r) => r.structuredMinutes)
    .filter((m): m is string => Boolean(m));
}
