# 2. 프론트엔드 구조: Feature-Sliced Design (FSD) 채택

- Status: accepted
- Date: 2026-07-12
- Deciders: dev-goraebap

## Context

Next.js(App Router) + TypeScript로 v1 데모를 만들기로 결정했다([0001](0001-decisions.md)).
페이지는 회의록 목록/업로드/상세 3~4개, API 라우트 소수, DB 접근(Drizzle)과
외부 API 연동(AssemblyAI, Claude) 정도의 작은 규모다. 다만 구조가 없는 채로
시작하면 `app/` 라우트 파일에 데이터 페칭·비즈니스 로직·UI가 뒤섞이기 쉽고,
나중에 기능이 늘어났을 때 어디에 무엇을 둘지 매번 새로 판단해야 하는 문제가
있다. 프로젝트 구조를 명시적인 규칙으로 관리하고 싶다.

## Decision

프론트엔드 코드 구조에 **Feature-Sliced Design (FSD) v2.1**을 적용한다.
핵심 원칙은 "Pages First — 실제로 2곳 이상에서 재사용될 때만 하위 레이어로
추출"이며, 지금 규모에서는 아래 레이어만으로 시작한다.

- `app/` (Next.js 라우팅 전용, 로직 없음)
- `src/_app/` (FSD app 레이어: providers, api-routes)
- `src/_pages/` (FSD pages 레이어: 페이지별 UI/데이터 페칭/상태)
- `src/shared/` (ui kit, lib, api 클라이언트, db 쿼리)

`widgets/`, `features/`, `entities/` 레이어는 지금 만들지 않는다. 회의록/태그를
소비하는 페이지가 목록(요약 카드)과 상세(전체 편집)로 형태가 달라 아직 안정적인
공통 경계가 없기 때문이다. 실제로 동일한 형태로 2곳 이상에서 쓰이는 코드가
생기면 그때 추출한다.

Next.js는 프로젝트 루트에서 `app/`, `pages/` 폴더명을 라우팅 용도로 이미 쓰고
있어 FSD의 최상위 레이어명과 충돌한다. FSD 공식 가이드(Next.js 통합 섹션)에
따라 FSD 쪽 레이어는 `src/_app/`, `src/_pages/`로 언더스코어를 붙여 구분한다
(Steiger 린터도 이 네이밍을 전제로 한다). `widgets/`, `features/`, `entities/`,
`shared/`는 이름 충돌이 없으므로 언더스코어 없이 그대로 쓴다.

```
app/                              ← Next.js 라우팅만 (얇음, 로직 없음)
  layout.tsx
  page.tsx                        → _pages/meeting-list re-export
  meetings/new/page.tsx           → _pages/meeting-upload re-export
  meetings/[id]/page.tsx          → _pages/meeting-detail re-export
  api/meetings/route.ts
  api/meetings/[id]/route.ts
  api/tags/route.ts
src/
  _app/
    providers/
    api-routes/                   ← 실제 라우트 핸들러 (STT→LLM 파이프라인 트리거 등)
  _pages/
    meeting-list/       (목록 + 태그 표시)
    meeting-upload/     (업로드 폼 + 태그 선택/즉석 생성)
    meeting-detail/     (상태 폴링 + 회의록 편집 + 화자 매핑)
  shared/
    ui/      (shadcn 컴포넌트)
    lib/     (폴링 훅, 날짜 포맷 등)
    api/     (AssemblyAI/Claude 클라이언트)
    db/      (Drizzle 스키마 + Meeting/Tag 쿼리)
```

Meeting/Tag의 CRUD는 entity가 아니라 `shared/db/`(쿼리)에 둔다 — CRUD는
비즈니스 로직이 아니라 인프라라는 FSD 권장사항에 따른 것이다.

## Options considered

- **구조 없이 시작 (app 라우트에 직접 로직 작성)** — 초반 속도는 가장 빠르지만,
  데모 규모를 넘어서면(hoho-hr 통합 검토 등) 다시 구조를 잡아야 함. 기각.
- **FSD 전 레이어(entities/features/widgets 포함)를 처음부터 생성** — 아직
  재사용 사례가 없는데 레이어만 먼저 만들면 빈 폴더와 자의적인 경계가 생김.
  FSD 자체가 "필요할 때 추출"을 권장하므로 기각.
- **FSD, Pages First로 최소 레이어(`_app`/`_pages`/`shared`)만 시작 (채택)** —
  구조적 규칙은 갖되 과설계를 피함. 필요해지면 `widgets`/`features`/`entities`를
  점진적으로 추가.

## Consequences

- 새 코드를 추가할 때 "어디에 둘지"를 매번 처음부터 판단하지 않고 FSD 결정
  트리(페이지 전용 → shared 인프라 → 재사용 확인 시 features/entities)를 따르면 됨.
- 페이지 간 코드 중복이 초반엔 허용됨 — 무리하게 공통화하지 않는다.
- 재검토 트리거: 회의록 목록/상세에서 동일한 형태의 UI나 로직이 실제로
  2곳 이상 쓰이기 시작하면 그때 `entities/meeting`, `entities/tag` 등으로
  추출을 검토한다. hoho-hr 통합처럼 두 번째 앱이 이 코드를 공유하게 되면
  레이어 구성을 다시 논의한다.

## Links

- 관련 ADR: [0001. 회의록 자동화 데모 — 결정사항](0001-decisions.md)
- 외부 문서: [fsd.how](https://fsd.how) (FSD v2.1, 확인일 2026-07-12)
