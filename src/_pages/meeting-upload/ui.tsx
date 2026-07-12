"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Music, UploadCloud } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { TagFilterChip } from "@/shared/ui/tag-filter-chip";
import { TagColorDot } from "@/shared/ui/tag-color-dot";
import { cn } from "@/shared/lib/cn";

type Tag = { id: string; name: string; color: string; meetingCount: number };

export function MeetingUploadPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [title, setTitle] = useState("");
  const [tagId, setTagId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [extraNote, setExtraNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((rows: Tag[]) => {
        setTags(rows);
        if (rows.length > 0) setTagId(rows[0].id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("오디오 파일을 선택해주세요.");
      return;
    }
    if (!tagId) {
      setError("태그를 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("title", title.trim());
    formData.append("tagId", tagId);
    if (extraNote.trim()) formData.append("extraNote", extraNote.trim());

    setSubmitting(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "업로드에 실패했어요.");
      }
      const meeting = await res.json();
      router.push(`/meetings/${meeting.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했어요.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-section-label font-semibold text-ink">
          제목
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 주간 정기 회의"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-section-label font-semibold text-ink">
          태그
        </label>
        {tags.length === 0 ? (
          <p className="text-body text-ink-muted">
            아직 태그가 없습니다. 먼저{" "}
            <a href="/tags/new" className="text-accent underline">
              새 프로젝트 태그
            </a>
            를 만들어주세요.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagFilterChip
                key={tag.id}
                type="button"
                active={tagId === tag.id}
                count={tag.meetingCount}
                onClick={() => setTagId(tag.id)}
              >
                <TagColorDot color={tag.color} />
                {tag.name}
              </TagFilterChip>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-section-label font-semibold text-ink">
          녹음 파일
        </label>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) setFile(dropped);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed px-6 py-8 text-center transition-colors",
            dragActive
              ? "border-accent bg-accent-soft"
              : "border-border-strong bg-surface-sunken",
          )}
        >
          <input
            type="file"
            accept="audio/*"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <>
              <Music className="size-6 text-accent" />
              <p className="text-body text-ink">{file.name}</p>
            </>
          ) : (
            <>
              <UploadCloud className="size-6 text-ink-muted" />
              <p className="text-body text-ink-secondary">
                클릭하거나 파일을 끌어다 놓아주세요
              </p>
            </>
          )}
        </label>
      </div>

      <div>
        <label className="mb-1.5 block text-section-label font-semibold text-ink">
          메모 (선택)
        </label>
        <Textarea
          value={extraNote}
          onChange={(e) => setExtraNote(e.target.value)}
          rows={3}
          placeholder="이번 회의에 대해 참고할 내용이 있다면 적어주세요."
        />
      </div>

      {error && <p className="text-body text-status-failed">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "업로드 중…" : "업로드 시작"}
      </Button>
    </form>
  );
}
