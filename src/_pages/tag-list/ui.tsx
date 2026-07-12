"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TagColorDot } from "@/shared/ui/tag-color-dot";
import { IosGroupedList, IosGroupedListRow } from "@/shared/ui/ios-grouped-list";
import { formatDate } from "@/shared/lib/format-date";

type Tag = {
  id: string;
  name: string;
  color: string;
  contextTemplate: string | null;
  contextUpdatedAt: string | null;
  meetingCount: number;
};

export function TagListPage() {
  const [tags, setTags] = useState<Tag[] | null>(null);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then(setTags);
  }, []);

  return (
    <main className="min-h-screen bg-page px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-page-h1 font-bold text-ink">프로젝트 태그</h1>
        <p className="mt-1 text-body text-ink-secondary">
          태그마다 배경 컨텍스트를 저장해 두면, 그 태그의 회의록을 만들 때 도메인 용어·참석자 역할 추정에 활용돼요.
        </p>

        <div className="mt-6">
          {tags === null ? (
            <p className="text-body text-ink-muted">불러오는 중…</p>
          ) : tags.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
              <p className="text-body text-ink-secondary">아직 프로젝트 태그가 없습니다.</p>
            </div>
          ) : (
            <IosGroupedList>
              {tags.map((tag) => (
                <IosGroupedListRow key={tag.id} href={`/tags/${tag.id}`}>
                  <TagColorDot color={tag.color} />
                  <div className="min-w-0 flex-1">
                    <span className="truncate text-row-title font-semibold text-ink">
                      {tag.name}
                    </span>
                    <p className="mt-0.5 truncate text-meta text-ink-muted">
                      회의 {tag.meetingCount}개 ·{" "}
                      {tag.contextUpdatedAt
                        ? `컨텍스트 최종 갱신 ${formatDate(tag.contextUpdatedAt)}`
                        : "컨텍스트 없음"}
                    </p>
                  </div>
                </IosGroupedListRow>
              ))}
            </IosGroupedList>
          )}
        </div>

        <Link
          href="/tags/new"
          className="mt-4 flex items-center justify-center gap-1.5 rounded-[var(--radius-card)] border border-dashed border-border-strong px-4 py-3 text-body font-medium text-ink-secondary transition-colors hover:bg-surface-sunken"
        >
          <Plus className="size-4" />
          새 프로젝트 태그
        </Link>
      </div>
    </main>
  );
}
