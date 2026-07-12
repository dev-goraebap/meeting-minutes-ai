# 4. UI 디자인 시스템: 자체 제작 디자인 핸드오프로 교체

- Status: accepted
- Date: 2026-07-12
- Deciders: dev-goraebap

## Context

[0003](0003-design-system-cirrus-tailwind-baseui.md)에서 uiverse.io의 Cirrus 팩을 토큰 소스로
채택했지만, Cirrus는 마케팅 랜딩페이지용 팩을 억지로 앱 UI에 맞춰 쓰는 것이었다(히어로·가격표
등 상당 부분이 우리 앱과 무관, 우리가 실제 필요한 컴포넌트 중 Combobox/Accordion/Toast 등은
Cirrus에 레시피가 아예 없었음).

사용자가 별도 Claude Code 세션에서 이 프로젝트를 위한 **고충실도 디자인 핸드오프**를 직접
제작해 가져왔다: `tmp/회의록 자동화 데모/design_handoff_meeting_minutes/`(`회의록.dc.html` +
`support.js` + `README.md`). 브라우저로 열어 실제 화면(회의 목록, 실패 상태 파이프라인 카드,
완료 상세의 탭/화자매핑/마크다운 렌더링, 태그 목록)을 직접 확인했다. README는 색상·타이포·
간격·라디우스·섀도우 전체 토큰과, 화면별 상세 스펙·데이터 모델·반응형 동작(640px 브레이크포인트,
하단 탭바+FAB, 라우티드 모달)까지 명시하고 있다. `.dc.html`/`support.js`는 스트리밍 프로토타입
엔진 위의 mock 데이터/타이머 데모이며, README가 명시하듯 "포팅 금지, 참고용" — 실제 코드는
React/FSD로 새로 작성한다.

이 핸드오프는 v1 스코프도 확장시켰다: 검색(풀텍스트, 하이라이트), 삭제(회의 자유/태그는 참조 시
차단), 다운로드(PDF/Markdown/Text), 태그 색상(순환 팔레트), 무한 스크롤, 태그 상세의 컨텍스트
read/edit UI. 이 항목들은 [0001](0001-decisions.md)의 "v1 범위 제외"에는 없었지만 명시적으로
계획되지도 않았던 것들로, 이 핸드오프가 명시적으로 v1에 포함시켰다.

## Decision

- **디자인 토큰**: Cirrus를 폐기하고 `tmp/회의록 자동화 데모/design_handoff_meeting_minutes/README.md`의
  "Design Tokens" 절을 authoritative 소스로 Tailwind v4 `@theme`에 포팅한다. 핵심 톤: 웜
  오프화이트 배경(`#F6F4EF`) + 단일 인디고 악센트(`#4C56C0`, Linear/Notion 인접), Pretendard
  폰트, 버튼/인풋 10px·카드/모달 14~18px·칩류는 pill 라디우스, Lucide 아이콘.
- **컴포넌트 동작 조달**: [0003](0003-design-system-cirrus-tailwind-baseui.md)의 Base UI 결정은
  그대로 유지한다 — 이 핸드오프는 시각 디자인 스펙이지 동작 구현체가 아니므로 키보드/포커스/ARIA는
  여전히 Base UI로 조달하고 그 위에 새 토큰을 입힌다.
- **모바일 전략 변경**: [0003](0003-design-system-cirrus-tailwind-baseui.md)에서 계획했던
  "태그 콤보박스만 데스크톱 팝오버/모바일 `vaul` 바텀시트" 분기는 철회한다. 이 핸드오프는 업로드·
  검색·새 태그 모달을 **전부 라우티드 모달**로 정의하며, 모바일에서는 부분 높이 시트가 아니라
  **풀스크린 페이지 전환**이다(README §6, §"Interactions & Behavior"). 부분 높이 드래그 시트가
  없으므로 `vaul`은 설치하지 않는다. 라우팅 방식 자체는 [0005](0005-routed-modals.md)에서 별도 결정.
- **범위 확장 수용**: 검색·삭제·다운로드·태그 색상·무한 스크롤·태그 컨텍스트 편집 UI를 v1에
  포함한다. [0001](0001-decisions.md)의 페이지 목록/DoD를 갱신한다(해당 문서에 각주 추가).

## Options considered

- **Cirrus 유지, 새 핸드오프는 참고만** — 이미 진행한 토큰 이식 작업을 재사용 가능하지만, 사용자가
  직접 제작해 명시적으로 가져온 고충실도 스펙을 무시하는 셈이라 채택하지 않음. 톤도 서로 다름
  (SaaS 랜딩 vs 웜 오프화이트/인디고 업무 도구 톤).
- **두 토큰을 병합** — 일관성이 깨지고 어느 쪽이 authoritative인지 모호해짐. 기각.
- **핸드오프를 전면 채택 (chosen)** — 사용자가 직접 만든 최종 승인 스펙이고, 앱 UI 스펙(화면별
  인터랙션·반응형 동작 포함)까지 갖추고 있어 Cirrus보다 훨씬 구체적이고 우리 앱에 맞음.

## Consequences

- `tmp/cirrus/`는 더 이상 참조하지 않는다(삭제하지 않고 남겨두되, 코드에서 포팅 대상 아님).
- [0001](0001-decisions.md)의 페이지 목록·DoD에 태그 목록/상세, 검색, 삭제, 다운로드를 반영하는
  각주가 필요하다 (별도 편집으로 처리).
- `vaul` 의존성은 설치하지 않는다 — 이전에 계획했던 태그 콤보박스의 모바일 시트 분기가 사라지고,
  모달 전체가 라우트 단위로 풀스크린 전환되기 때문.
- 재검토 트리거: 핸드오프에 없는 새 컴포넌트가 필요해지거나, `.dc.html` 프로토타입과 실제 구현
  사이에 해석 차이가 발견되면(예: 반응형 브레이크포인트 동작) README를 우선하되 실제 스크린샷과
  대조해 재확인한다.

## Links

- 관련 ADR: [0001](0001-decisions.md), [0002](0002-frontend-architecture-fsd.md), [0003](0003-design-system-cirrus-tailwind-baseui.md) (superseded by this), [0005](0005-routed-modals.md)
- 소스: `tmp/회의록 자동화 데모/design_handoff_meeting_minutes/README.md`, `회의록.dc.html` (2026-07-12 확인, 로컬 정적 서버로 렌더링 확인)
