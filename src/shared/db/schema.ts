import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const authTokens = pgTable("auth_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // sha256 hex digest of the plaintext login token — the plaintext itself
  // is never stored, only written once to a local file at generation time.
  tokenHash: text("token_hash").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const tags = pgTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  color: text("color").notNull(),
  contextTemplate: text("context_template"),
  contextUpdatedAt: timestamp("context_updated_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const meetingStatuses = [
  "uploaded",
  "transcribing",
  "summarizing",
  "completed",
  "failed",
] as const;
export type MeetingStatus = (typeof meetingStatuses)[number];

export const meetingStatusEnum = pgEnum("meeting_status", meetingStatuses);

export const meetings = pgTable("meetings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id),
  title: text("title").notNull(),
  audioFilePath: text("audio_file_path").notNull(),
  status: meetingStatusEnum("status").notNull().default("uploaded"),
  errorMessage: text("error_message"),
  // [{ speaker, start, end, text }]
  rawTranscript: jsonb("raw_transcript").$type<
    { speaker: string; start: number; end: number; text: string }[]
  >(),
  structuredMinutes: text("structured_minutes"),
  // { "A": "이름", ... }
  speakerMapping: jsonb("speaker_mapping").$type<Record<string, string>>(),
  extraNote: text("extra_note"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});
