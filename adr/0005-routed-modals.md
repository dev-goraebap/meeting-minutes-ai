# 5. 업로드/검색/새 태그를 라우티드 모달로 구현

- Status: accepted
- Date: 2026-07-12
- Deciders: dev-goraebap

## Context

디자인 핸드오프([0004](0004-design-system-handoff.md))는 업로드·검색·새 태그 3개 화면을
"모달이지만 실제 라우트로 구현하고, 모바일에서는 풀스크린 전환되는" 것으로 명시한다(README §6,
§"Interactions & Behavior": "implement as real routes; the modals should be routed, fullscreen
on mobile"). responsive-app 스킬의 결정 프레임(1장)을 적용하면: 세 화면 모두 목적지 판단 기준
중 최소 하나(뒤로가기로 자연스럽게 닫힘)를 만족하고, 목록 위에 뜨는 오버레이 표현과 모바일
풀페이지 표현을 같은 정체성 아래 다르게 렌더해야 하는 전형적인 "라우티드 모달" 케이스다(스킬
1.4절 패턴). 같은 스킬은 Next.js에서 이 패턴을 Parallel Routes + Intercepting Routes로 1급
지원한다고 명시한다.

## Decision

업로드(`/meetings/new`)·검색(`/search`)·새 태그(`/tags/new`) 3개를 Next.js **Parallel Routes +
Intercepting Routes**로 구현한다.

- 목록/상세 화면에서 링크를 눌러 진입하면 배경(목록)이 유지된 채 모달 오버레이로 뜬다(인터셉트).
- URL을 직접 입력하거나 새로고침하면 풀페이지로 렌더된다(직접 진입 fallback).
- 뒤로가기·닫기 버튼·백드롭 클릭 모두 같은 닫기 경로로 수렴하며, 모달이 열릴 때 배경 위치를
  보존한다.
- 640px 이하(모바일)에서는 오버레이가 아니라 풀스크린 페이지로 전환된다 — 별도 컴포넌트 분기가
  아니라 같은 라우트/컴포넌트가 CSS 레벨에서 풀스크린으로 확장되는 방식을 우선 시도하고, 어려우면
  뷰포트별로 얇은 레이아웃 분기만 둔다.
- 셋 다 같은 패턴을 공유하므로 공통 라우티드 모달 셸(닫기 경로 수렴, 배경 스크롤 잠금/복원,
  `history.pushState` 기반 뒤로가기 처리)을 `shared/ui`에 한 번만 만들고 재사용한다.

## Options considered

- **일반 클라이언트 상태 모달(URL 없음)** — 구현이 가장 간단하지만 새로고침 시 모달이 사라지고
  뒤로가기가 예상대로 동작하지 않음. 핸드오프가 명시적으로 "실제 라우트로 구현"을 요구해 기각.
- **완전히 별도 페이지(오버레이 없이 항상 풀페이지)** — 데스크톱에서 배경 목록이 사라져 컨텍스트를
  잃음. 핸드오프의 "목록 위 모달" 느낌과 불일치해 기각.
- **Parallel Routes + Intercepting Routes (chosen)** — Next.js 공식 패턴으로 URL 보유 + 배경
  보존 + 직접 진입 fallback을 모두 만족.

## Consequences

- `vaul` 등 별도 바텀시트 라이브러리가 불필요해진다([0004](0004-design-system-handoff.md)와 일관).
- 라우트 구조가 다소 늘어난다(`app/@modal/(.)meetings/new`류의 인터셉트 규칙 필요) — Task 9/16/18
  착수 시 Next.js 16 최신 공식 문서로 정확한 폴더 규칙을 재확인한다(responsive-app 스킬 "규칙 0").
- 공통 라우티드 모달 셸을 먼저 만들어 세 화면이 각자 구현을 중복하지 않게 한다.
- 재검토 트리거: 인터셉팅 라우트가 FSD의 `app/` 얇은 re-export 원칙과 충돌하는 구조적 문제가
  발견되면(예: 인터셉트 규칙이 `_pages` 재사용을 방해) 재검토한다.

## Links

- 관련 ADR: [0001](0001-decisions.md), [0002](0002-frontend-architecture-fsd.md), [0004](0004-design-system-handoff.md)
- 참고 스킬: responsive-app §1.4 (라우티드 모달 / 인터셉팅 라우트)
- 외부 문서: Next.js Parallel Routes / Intercepting Routes 공식 문서 (Task 9 착수 시 재확인)
