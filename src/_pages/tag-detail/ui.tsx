"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clipboard, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Markdown } from "@/shared/ui/markdown";
import { TagColorDot } from "@/shared/ui/tag-color-dot";
import { useToast, ToastViewport } from "@/shared/ui/toast";
import { formatDate } from "@/shared/lib/format-date";
import { buildContextGenerationPrompt } from "@/shared/lib/context-prompt";

type Tag = {
  id: string;
  name: string;
  color: string;
  contextTemplate: string | null;
  contextUpdatedAt: string | null;
  meetingCount: number;
};

export function TagDetailPage({ id }: { id: string }) {
  const [tag, setTag] = useState<Tag | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { message, showToast } = useToast();

  const fetchTag = useCallback(async () => {
    const res = await fetch(`/api/tags/${id}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    setTag(await res.json());
  }, [id]);

  useEffect(() => {
    fetchTag();
  }, [fetchTag]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-page px-6 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-body text-ink-secondary">태그를 찾을 수 없어요.</p>
          <Link href="/tags" className="mt-3 inline-block text-accent underline">
            프로젝트 태그로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  if (!tag) {
    return (
      <main className="min-h-screen bg-page px-6 py-8">
        <div className="mx-auto max-w-2xl text-body text-ink-muted">불러오는 중…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/tags"
          className="inline-flex items-center gap-1 text-caption text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          프로젝트 태그
        </Link>

        <TagTitle tag={tag} onUpdated={fetchTag} />

        <p className="mt-1 text-meta text-ink-muted">
          회의 {tag.meetingCount}개 ·{" "}
          {tag.contextUpdatedAt
            ? `컨텍스트 최종 갱신 ${formatDate(tag.contextUpdatedAt)}`
            : "컨텍스트 없음"}
        </p>

        <ContextSection tag={tag} onUpdated={fetchTag} onCopied={() => showToast("프롬프트를 복사했어요")} />
      </div>

      <ToastViewport message={message} />
    </main>
  );
}

function TagTitle({ tag, onUpdated }: { tag: Tag; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    await fetch(`/api/tags/${tag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setSaving(false);
    setEditing(false);
    onUpdated();
  }

  return (
    <div className="mt-2 flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <TagColorDot color={tag.color} className="size-3" />
        {editing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => e.key === "Enter" && save()}
            autoFocus
            disabled={saving}
            className="text-detail-h1 font-bold"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setName(tag.name);
              setEditing(true);
            }}
            className="truncate text-detail-h1 font-bold text-ink hover:underline"
          >
            {tag.name}
          </button>
        )}
      </div>
      <button
        type="button"
        disabled
        title="회의가 있는 태그는 삭제할 수 없어요"
        className="flex shrink-0 items-center gap-1 text-caption text-ink-faint"
      >
        <Trash2 className="size-3.5" />
        삭제
      </button>
    </div>
  );
}

function ContextSection({
  tag,
  onUpdated,
  onCopied,
}: {
  tag: Tag;
  onUpdated: () => void;
  onCopied: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tag.contextTemplate ?? "");
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setDraft(tag.contextTemplate ?? "");
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/tags/${tag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contextTemplate: draft }),
    });
    setSaving(false);
    setEditing(false);
    onUpdated();
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(buildContextGenerationPrompt(tag.name));
    onCopied();
  }

  return (
    <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-surface p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-section-label font-bold text-ink">배경 컨텍스트</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={copyPrompt}>
            <Clipboard className="size-3.5" />
            생성 프롬프트 복사
          </Button>
          {!editing && (
            <Button variant="secondary" onClick={startEditing}>
              <Pencil className="size-3.5" />
              편집
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {editing ? (
          <>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={14}
              className="font-mono text-body"
              placeholder="이 프로젝트의 배경 지식(용어, 참석자 역할, 최근 의사결정 등)을 마크다운으로 붙여넣으세요."
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                취소
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "저장 중…" : "저장"}
              </Button>
            </div>
          </>
        ) : tag.contextTemplate ? (
          <Markdown>{tag.contextTemplate}</Markdown>
        ) : (
          <p className="text-body text-ink-muted">
            아직 컨텍스트가 없습니다. &quot;생성 프롬프트 복사&quot;로 로컬 코딩 에이전트에게 요약을
            맡겨보세요.
          </p>
        )}
      </div>
    </div>
  );
}
