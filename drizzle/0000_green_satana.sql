CREATE TYPE "public"."meeting_status" AS ENUM('uploaded', 'transcribing', 'summarizing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" text PRIMARY KEY NOT NULL,
	"tag_id" text NOT NULL,
	"title" text NOT NULL,
	"audio_file_path" text NOT NULL,
	"status" "meeting_status" DEFAULT 'uploaded' NOT NULL,
	"error_message" text,
	"raw_transcript" jsonb,
	"structured_minutes" text,
	"speaker_mapping" jsonb,
	"extra_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"context_template" text,
	"context_updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;