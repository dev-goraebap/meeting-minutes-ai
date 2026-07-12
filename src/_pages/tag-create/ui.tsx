"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Clipboard } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "@/shared/ui/collapsible";
import { useToast, ToastViewport } from "@/shared/ui/toast";
import { buildContextGenerationPrompt } from "@/shared/lib/context-prompt";
import { cn } from "@/shared/lib/cn";

export function TagCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { message, showToast } = useToast();

  const canSubmit = name.trim() !== "" && context.trim() !== "";
  const prompt = buildContextGenerationPrompt(name.trim() || "{프로젝트명}");

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    showToast("프롬프트를 복사했어요");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), contextTemplate: context.trim() }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "태그 생성에 실패했어요.");
      setSubmitting(false);
      return;
    }

    const tag = await res.json();
    router.push(`/tags/${tag.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-section-label font-semibold text-ink">
          이름
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 커머스 리뉴얼"
          required
        />
      </div>

      <CollapsibleRoot open={promptOpen} onOpenChange={setPromptOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-[var(--radius-control)] border border-border bg-surface-sunken px-3 py-2 text-body font-medium text-ink-secondary">
          생성 프롬프트 미리보기
          <ChevronDown
            className={cn("size-4 transition-transform", promptOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <div className="mt-2 rounded-[var(--radius-control)] border border-border bg-surface-sunken p-3">
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-caption text-ink-secondary">
              {prompt}
            </pre>
            <Button
              type="button"
              variant="secondary"
              onClick={copyPrompt}
              className="mt-2"
            >
              <Clipboard className="size-3.5" />
              복사
            </Button>
          </div>
        </CollapsiblePanel>
      </CollapsibleRoot>

      <div>
        <label className="mb-1.5 block text-section-label font-semibold text-ink">
          배경 컨텍스트
        </label>
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={10}
          className="font-mono text-body"
          placeholder="위 프롬프트로 로컬 코딩 에이전트가 만들어준 요약을 붙여넣으세요."
          required
        />
      </div>

      {error && <p className="text-body text-status-failed">{error}</p>}

      <Button type="submit" disabled={!canSubmit || submitting} className="w-full">
        {submitting ? "생성 중…" : "태그 생성"}
      </Button>

      <ToastViewport message={message} />
    </form>
  );
}
