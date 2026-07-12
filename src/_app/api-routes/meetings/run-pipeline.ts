import { getTagById } from "@/shared/db/queries/tags";
import {
  markTranscribing,
  saveRawTranscriptAndMarkSummarizing,
  saveStructuredMinutesAndComplete,
  markFailed,
  getRecentCompletedMinutes,
} from "@/shared/db/queries/meetings";
import { transcribeAudio } from "@/shared/api/assemblyai";
import { summarizeMeeting } from "@/shared/api/claude";

/**
 * Runs transcription + summarization synchronously (no queue, per ADR-0001).
 * Never throws — any failure is recorded on the meeting row as `failed`.
 */
export async function runPipeline({
  meetingId,
  tagId,
  audioFilePath,
  extraNote,
}: {
  meetingId: string;
  tagId: string;
  audioFilePath: string;
  extraNote: string | null;
}) {
  try {
    await markTranscribing(meetingId);
    const rawTranscript = await transcribeAudio(audioFilePath);
    await saveRawTranscriptAndMarkSummarizing(meetingId, rawTranscript);

    const tag = await getTagById(tagId);
    if (!tag) throw new Error("태그를 찾을 수 없어요.");

    const recentMinutes = await getRecentCompletedMinutes(
      tagId,
      meetingId,
      3,
    );

    const structuredMinutes = await summarizeMeeting({
      tagName: tag.name,
      contextTemplate: tag.contextTemplate,
      recentMinutes,
      rawTranscript,
      extraNote,
    });

    await saveStructuredMinutesAndComplete(meetingId, structuredMinutes);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.";
    await markFailed(meetingId, message);
  }
}
