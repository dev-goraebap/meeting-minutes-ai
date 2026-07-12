import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";
import { TagColorDot, tagCycleColorVar } from "@/shared/ui/tag-color-dot";
import { TagFilterChip } from "@/shared/ui/tag-filter-chip";
import { IosGroupedList, IosGroupedListRow } from "@/shared/ui/ios-grouped-list";

export function MeetingListPage() {
  return (
    <main className="min-h-screen bg-page px-6 py-8">
      <h1 className="text-page-h1 font-bold text-ink">회의록</h1>
      <p className="mt-2 text-body text-ink-secondary">
        녹음 파일을 올리면 자동으로 전사·화자분리·구조화 회의록까지 만들어드려요.
      </p>

      {/* Task 5 scratch render — shared/ui primitive smoke test, removed in Task 8 */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <TagFilterChip active count={13}>
          전체
        </TagFilterChip>
        <TagFilterChip count={5}>
          <TagColorDot color={tagCycleColorVar(0)} />
          커머스 리뉴얼
        </TagFilterChip>
        <Button variant="primary">＋ 새 회의 업로드</Button>
        <Button variant="secondary">보조 버튼</Button>
      </div>

      <div className="mt-6 max-w-xl">
        <IosGroupedList>
          <IosGroupedListRow href="/meetings/example">
            <TagColorDot color={tagCycleColorVar(2)} />
            <span className="flex-1 truncate text-row-title font-semibold">
              주간 정기 회의
            </span>
            <StatusBadge status="transcribing" />
          </IosGroupedListRow>
          <IosGroupedListRow href="/meetings/example-2">
            <TagColorDot color={tagCycleColorVar(1)} />
            <span className="flex-1 truncate text-row-title font-semibold">
              데이터 플랫폼 킥오프
            </span>
            <StatusBadge status="completed" />
          </IosGroupedListRow>
        </IosGroupedList>
      </div>
    </main>
  );
}
