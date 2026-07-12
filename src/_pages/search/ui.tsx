"use client";

import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { IosGroupedList, IosGroupedListRow } from "@/shared/ui/ios-grouped-list";
import { TagColorDot } from "@/shared/ui/tag-color-dot";
import { formatDate } from "@/shared/lib/format-date";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";

type MatchField = "minutes" | "transcript";

type SearchResult = {
  id: string;
  title: string;
  tagName: string;
  tagColor: string;
  createdAt: string;
  matchField: MatchField | null;
  snippet: string | null;
};

const MATCH_LABEL: Record<MatchField, string> = {
  minutes: "구조화 회의록",
  transcript: "전사 원문",
};

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-[#DFE2FA] text-[#3B43A0]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/meetings/search?q=${encodeURIComponent(debounced)}`)
      .then((res) => res.json())
      .then((rows: SearchResult[]) => {
        if (!cancelled) setResults(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목·회의록·전사 원문 검색…"
          className="h-11 w-full rounded-[var(--radius-control)] border border-border bg-surface pl-10 pr-3 text-body text-ink outline-none focus:border-accent"
        />
      </div>

      {!debounced ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <SearchIcon className="size-6" />
          </div>
          <p className="text-body text-ink-muted">
            제목, 구조화 회의록, 전사 원문에서 검색할 수 있어요.
          </p>
        </div>
      ) : loading ? (
        <p className="py-8 text-center text-body text-ink-muted">검색 중…</p>
      ) : results.length === 0 ? (
        <p className="py-8 text-center text-body text-ink-muted">
          &quot;{debounced}&quot;에 대한 검색 결과가 없어요.
        </p>
      ) : (
        <IosGroupedList>
          {results.map((r) => (
            <IosGroupedListRow
              key={r.id}
              href={`/meetings/${r.id}?tab=${r.matchField === "transcript" ? "transcript" : "minutes"}`}
            >
              <TagColorDot color={r.tagColor} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-row-title font-semibold text-ink">
                  <Highlighted text={r.title} query={debounced} />
                </p>
                <p className="mt-0.5 truncate text-meta text-ink-muted">
                  {r.tagName} · {formatDate(r.createdAt)}
                </p>
                {r.snippet && r.matchField && (
                  <p className="mt-1 line-clamp-3 text-caption text-ink-secondary">
                    <span className="mr-1 rounded-[var(--radius-pill)] bg-surface-sunken px-1.5 py-0.5 text-caption font-semibold text-ink-muted">
                      {MATCH_LABEL[r.matchField]}
                    </span>
                    <Highlighted text={r.snippet} query={debounced} />
                  </p>
                )}
              </div>
            </IosGroupedListRow>
          ))}
        </IosGroupedList>
      )}
    </div>
  );
}
