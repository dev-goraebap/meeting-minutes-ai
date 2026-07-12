import { AssemblyAI } from "assemblyai";

export type TranscriptSegment = {
  speaker: string;
  start: number;
  end: number;
  text: string;
};

export async function transcribeAudio(
  audioFilePath: string,
): Promise<TranscriptSegment[]> {
  const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

  const transcript = await client.transcripts.transcribe({
    audio: audioFilePath,
    speech_models: ["universal-3-5-pro", "universal-2"],
    language_code: "ko",
    speaker_labels: true,
  });

  if (transcript.status === "error") {
    throw new Error(transcript.error ?? "AssemblyAI 전사에 실패했어요.");
  }

  return (transcript.utterances ?? []).map((u) => ({
    speaker: u.speaker,
    start: u.start,
    end: u.end,
    text: u.text,
  }));
}
