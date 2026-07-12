import { NextRequest, NextResponse } from "next/server";
import { searchMeetings } from "@/shared/db/queries/meetings";
import { buildSnippet } from "@/shared/lib/search-snippet";

export async function getMeetingsSearch(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json([]);

  const rows = await searchMeetings(q);

  const results = rows.map((row) => {
    const minutesSnippet = row.structuredMinutes
      ? buildSnippet(row.structuredMinutes, q)
      : null;

    if (minutesSnippet) {
      return {
        id: row.id,
        title: row.title,
        tagName: row.tagName,
        tagColor: row.tagColor,
        createdAt: row.createdAt,
        matchField: "minutes" as const,
        snippet: minutesSnippet,
      };
    }

    const transcriptText = (row.rawTranscript ?? [])
      .map((segment) => segment.text)
      .join(" ");
    const transcriptSnippet = transcriptText
      ? buildSnippet(transcriptText, q)
      : null;

    return {
      id: row.id,
      title: row.title,
      tagName: row.tagName,
      tagColor: row.tagColor,
      createdAt: row.createdAt,
      matchField: transcriptSnippet ? ("transcript" as const) : null,
      snippet: transcriptSnippet,
    };
  });

  return NextResponse.json(results);
}
