import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const tags = sqliteTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  color: text("color").notNull(),
  contextTemplate: text("context_template"),
  contextUpdatedAt: integer("context_updated_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const meetingStatuses = [
  "uploaded",
  "transcribing",
  "summarizing",
  "completed",
  "failed",
] as const;
export type MeetingStatus = (typeof meetingStatuses)[number];

export const meetings = sqliteTable("meetings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id),
  title: text("title").notNull(),
  audioFilePath: text("audio_file_path").notNull(),
  status: text("status", { enum: meetingStatuses }).notNull().default("uploaded"),
  errorMessage: text("error_message"),
  // JSON: [{ speaker, start, end, text }]
  rawTranscript: text("raw_transcript", { mode: "json" }).$type<
    { speaker: string; start: number; end: number; text: string }[]
  >(),
  structuredMinutes: text("structured_minutes"),
  // JSON: { "A": "이름", ... }
  speakerMapping: text("speaker_mapping", { mode: "json" }).$type<
    Record<string, string>
  >(),
  extraNote: text("extra_note"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
