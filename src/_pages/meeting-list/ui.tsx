"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";
import { TagColorDot } from "@/shared/ui/tag-color-dot";
import { TagFilterChip } from "@/shared/ui/tag-filter-chip";
import {
  IosGroupedList,
  IosGroupedListRow,
} from "@/shared/ui/ios-grouped-list";
import { formatDate } from "@/shared/lib/format-date";
import {
  STATUS_NOTE,
  STATUS_PROGRESS,
  isProcessing,
} from "@/shared/lib/meeting-status";
import { usePolling } from "@/shared/lib/use-polling";
import type { MeetingStatus } from "@/shared/db/schema";

type Meeting = {
  id: string;
  title: string;
  status: MeetingStatus;
  errorMessage: string | null;
  createdAt: string;
  tagId: string;
  tagName: string;
  tagColor: string;
};

type Tag = {
  id: string;
  name: string;
  color: string;
  meetingCount: number;
};

const FIRST_PAGE_SIZE = 6;
const LOAD_MORE_SIZE = 5;

export function MeetingListPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then(setTags);
  }, []);

  const loadPage = useCallback(
    async (nextOffset: number, replace: boolean, tagId: string | null) => {
      setLoading(true);
      const pageSize = nextOffset === 0 ? FIRST_PAGE_SIZE : LOAD_MORE_SIZE;
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(nextOffset),
      });
      if (tagId) params.set("tagId", tagId);

      const res = await fetch(`/api/meetings?${params}`);
      const page: Meeting[] = await res.json();

      setMeetings((prev) => (replace ? page : [...prev, ...page]));
      setOffset(nextOffset + page.length);
      setHasMore(page.length === pageSize);
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    loadPage(0, true, activeTagId);
  }, [activeTagId, loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        loadPage(offset, false, activeTagId);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [offset, hasMore, loading, activeTagId, loadPage]);

  const hasProcessing = meetings.some((m) => isProcessing(m.status));

  const refreshVisible = useCallback(async () => {
    if (meetings.length === 0) return;
    const params = new URLSearchParams({
      limit: String(meetings.length),
      offset: "0",
    });
    if (activeTagId) params.set("tagId", activeTagId);
    const res = await fetch(`/api/meetings?${params}`);
    setMeetings(await res.json());
  }, [meetings.length, activeTagId]);

  usePolling(refreshVisible, 3000, hasProcessing);

  const totalCount = tags.reduce((sum, tag) => sum + tag.meetingCount, 0);

  return (
    <main className="min-h-screen bg-page px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-page-h1 font-bold text-ink">회의록</h1>
            <p className="mt-1 text-body text-ink-secondary">
              녹음 파일을 올리면 자동으로 전사·화자분리·구조화 회의록까지 만들어드려요.
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <Button href="/meetings/new">＋ 새 회의 업로드</Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            href="/search"
            variant="secondary"
            className="w-full justify-start text-ink-muted sm:order-2 sm:w-auto"
          >
            <Search className="size-4" />
            제목·내용 검색…
          </Button>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto sm:order-1 sm:flex-wrap">
            <TagFilterChip
              active={activeTagId === null}
              count={totalCount}
              onClick={() => setActiveTagId(null)}
            >
              전체
            </TagFilterChip>
            {tags.map((tag) => (
              <TagFilterChip
                key={tag.id}
                active={activeTagId === tag.id}
                count={tag.meetingCount}
                onClick={() => setActiveTagId(tag.id)}
              >
                <TagColorDot color={tag.color} />
                {tag.name}
              </TagFilterChip>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {meetings.length === 0 && !loading ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
              <p className="text-body text-ink-secondary">아직 회의록이 없습니다.</p>
              <Button href="/meetings/new" className="mt-4">
                ＋ 새 회의 업로드
              </Button>
            </div>
          ) : (
            <IosGroupedList>
              {meetings.map((meeting) => (
                <IosGroupedListRow key={meeting.id} href={`/meetings/${meeting.id}`}>
                  <TagColorDot color={meeting.tagColor} />
                  <div className="min-w-0 flex-1">
                    <span className="truncate text-row-title font-semibold text-ink">
                      {meeting.title}
                    </span>
                    <p className="mt-0.5 truncate text-meta text-ink-muted">
                      {meeting.tagName} · {formatDate(meeting.createdAt)}
                    </p>
                    {isProcessing(meeting.status) && (
                      <div className="mt-2">
                        <div className="h-1 w-full overflow-hidden rounded-[var(--radius-pill)] bg-surface-sunken">
                          <div
                            className="h-full rounded-[var(--radius-pill)] bg-accent transition-all"
                            style={{ width: `${STATUS_PROGRESS[meeting.status]}%` }}
                          />
                        </div>
                        <p className="mt-1 text-caption text-ink-muted">
                          {STATUS_NOTE[meeting.status]}
                        </p>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={meeting.status} />
                </IosGroupedListRow>
              ))}
            </IosGroupedList>
          )}

          {hasMore && meetings.length > 0 && (
            <div
              ref={sentinelRef}
              className="mt-4 flex items-center justify-center gap-2 py-4 text-caption text-ink-muted"
            >
              더 불러오는 중…
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
