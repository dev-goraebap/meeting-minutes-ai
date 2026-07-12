import { mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { after, NextRequest, NextResponse } from "next/server";
import { createMeeting } from "@/shared/db/queries/meetings";
import { getTagById } from "@/shared/db/queries/tags";
import { runPipeline } from "./run-pipeline";

const AUDIO_DIR = "./data/audio";

// Mobile "record and share" flows (voice memo apps sharing a .aac/.amr file,
// etc.) often hand the browser a File with an empty or generic
// (application/octet-stream) MIME type, so `file.type.startsWith("audio/")`
// alone rejects real audio files. Fall back to the extension.
const AUDIO_EXTENSIONS = [
  ".mp3", ".m4a", ".wav", ".aac", ".ogg", ".oga", ".flac", ".amr", ".3gp", ".3gpp", ".webm",
];

function looksLikeAudio(file: File) {
  if (file.type.startsWith("audio/")) return true;
  return AUDIO_EXTENSIONS.includes(path.extname(file.name).toLowerCase());
}

function extensionFromFile(file: File) {
  const fromName = path.extname(file.name);
  if (fromName) return fromName;
  const subtype = file.type.split("/")[1];
  return subtype ? `.${subtype}` : "";
}

export async function postMeeting(request: NextRequest) {
  const formData = await request.formData();

  const audio = formData.get("audio");
  const title = formData.get("title");
  const tagId = formData.get("tagId");
  const extraNote = formData.get("extraNote");

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json(
      { error: "오디오 파일을 선택해주세요." },
      { status: 400 },
    );
  }
  if (!looksLikeAudio(audio)) {
    return NextResponse.json(
      { error: "오디오 파일만 업로드할 수 있어요." },
      { status: 400 },
    );
  }
  if (typeof title !== "string" || title.trim() === "") {
    return NextResponse.json(
      { error: "제목을 입력해주세요." },
      { status: 400 },
    );
  }
  if (typeof tagId !== "string" || tagId === "") {
    return NextResponse.json(
      { error: "태그를 선택해주세요." },
      { status: 400 },
    );
  }

  const tag = await getTagById(tagId);
  if (!tag) {
    return NextResponse.json(
      { error: "선택한 태그를 찾을 수 없어요." },
      { status: 400 },
    );
  }

  const meetingId = crypto.randomUUID();
  const audioFilePath = path.join(AUDIO_DIR, `${meetingId}${extensionFromFile(audio)}`);

  mkdirSync(AUDIO_DIR, { recursive: true });
  await writeFile(audioFilePath, Buffer.from(await audio.arrayBuffer()));

  const extraNoteValue =
    typeof extraNote === "string" && extraNote.trim() !== ""
      ? extraNote.trim()
      : null;

  await createMeeting({
    id: meetingId,
    tagId,
    title: title.trim(),
    audioFilePath,
    extraNote: extraNoteValue,
  });

  // No queue (per ADR-0001), but the pipeline itself runs after the response
  // is sent via Next.js `after()` — the client gets the meeting id back as
  // soon as the file is saved, then watches transcribing/summarizing
  // progress via polling on the detail/list pages instead of blocking the
  // upload request for the full STT+LLM duration.
  after(() =>
    runPipeline({
      meetingId,
      tagId,
      audioFilePath,
      extraNote: extraNoteValue,
    }),
  );

  return NextResponse.json({ id: meetingId });
}
