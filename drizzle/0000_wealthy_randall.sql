CREATE TABLE `meetings` (
	`id` text PRIMARY KEY NOT NULL,
	`tag_id` text NOT NULL,
	`title` text NOT NULL,
	`audio_file_path` text NOT NULL,
	`status` text DEFAULT 'uploaded' NOT NULL,
	`error_message` text,
	`raw_transcript` text,
	`structured_minutes` text,
	`speaker_mapping` text,
	`extra_note` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`context_template` text,
	`context_updated_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
