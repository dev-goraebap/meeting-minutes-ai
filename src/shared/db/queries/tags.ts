import { asc, count, eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { meetings, tags } from "@/shared/db/schema";

const CYCLE_COLORS = [
  "#4C56C0",
  "#3F7D53",
  "#B26A1F",
  "#8A5CC4",
  "#2F7F86",
] as const;

export async function listTags() {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
      contextTemplate: tags.contextTemplate,
      contextUpdatedAt: tags.contextUpdatedAt,
      createdAt: tags.createdAt,
      meetingCount: count(meetings.id),
    })
    .from(tags)
    .leftJoin(meetings, eq(meetings.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(asc(tags.createdAt));
}

export async function getTagById(id: string) {
  const [row] = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
  return row ?? null;
}

/**
 * Returns the id of an existing tag with this exact name, or creates a new
 * one (assigning the next cycle color by creation order) and returns its id.
 */
export async function getOrCreateTagByName(name: string) {
  const existing = await db
    .select({ id: tags.id })
    .from(tags)
    .where(eq(tags.name, name))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [{ total }] = await db.select({ total: count() }).from(tags);
  const color = CYCLE_COLORS[total % CYCLE_COLORS.length];

  const [created] = await db
    .insert(tags)
    .values({ name, color })
    .returning({ id: tags.id });

  return created.id;
}
