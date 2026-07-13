import Anthropic from "@anthropic-ai/sdk";
import type { TranscriptSegment } from "@/shared/api/assemblyai";

const OUTPUT_FORMAT = `# 회의록 — {프로젝트명}
**일시** / **참석자(Speaker A/B/C 그대로 표기)**

## 안건별 요약 (섹션마다 관련 발언자 표시)
## 결정사항
## 액션 아이템 (표: 항목 | 담당(화자 라벨) | 기한)
## 참고/불확실 사항 (STT 오인식 가능성 있는 용어, 화자 귀속 불확실한 부분 명시)`;

function buildSystemPrompt(
  tagName: string,
  contextTemplate: string | null,
  recentMinutes: string[],
) {
  const parts = [
    `이 대화는 "${tagName}" 프로젝트의 회의 녹음을 전사한 것입니다. 아래 형식을 그대로 따라 한국어 회의록을 작성하세요.`,
    `\n## 출력 형식\n${OUTPUT_FORMAT}`,
    `\n화자는 항상 원본 라벨(Speaker A/B/C)로 표기하세요. 실명으로 바꾸지 마세요.`,
  ];

  if (contextTemplate) {
    parts.push(`\n## 프로젝트 배경 컨텍스트\n${contextTemplate}`);
  }

  if (recentMinutes.length > 0) {
    parts.push(
      `\n## 직전 회의록 (최신순, 최대 3개 — 맥락 참고용)\n` +
        recentMinutes
          .map((m, i) => `### 직전 회의록 ${i + 1}\n${m}`)
          .join("\n\n"),
    );
  }

  return parts.join("\n");
}

function formatTranscript(segments: TranscriptSegment[]) {
  return segments.map((s) => `Speaker ${s.speaker}: ${s.text}`).join("\n");
}

export async function summarizeMeeting({
  tagName,
  contextTemplate,
  recentMinutes,
  rawTranscript,
  extraNote,
}: {
  tagName: string;
  contextTemplate: string | null;
  recentMinutes: string[];
  rawTranscript: TranscriptSegment[];
  extraNote: string | null;
}): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const userParts = [
    `## 이번 회의 전사 원문\n${formatTranscript(rawTranscript)}`,
  ];
  if (extraNote) {
    userParts.push(`\n## 사용자가 추가한 메모\n${extraNote}`);
  }

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 8192,
    // claude-sonnet-5 turns on adaptive thinking by default when `thinking`
    // is omitted (unlike Sonnet 4.6), and thinking tokens count against
    // max_tokens — a long/repetitive transcript could exhaust the budget on
    // thinking alone and never emit a text block. This is a plain
    // summarization task, so thinking adds nothing; keep it off.
    thinking: { type: "disabled" },
    system: buildSystemPrompt(tagName, contextTemplate, recentMinutes),
    messages: [{ role: "user", content: userParts.join("\n") }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(
      `Claude 응답에서 텍스트를 찾을 수 없어요. (stop_reason: ${message.stop_reason})`,
    );
  }

  return textBlock.text;
}
