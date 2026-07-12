# 3. UI 디자인 시스템: Cirrus 토큰 + Tailwind v4 + Base UI

- Status: accepted
- Date: 2026-07-12
- Deciders: dev-goraebap

## Context

[0001](0001-decisions.md)의 기술 스택 표에는 `UI | Tailwind CSS + shadcn/ui`가 적혀 있었지만,
이건 검토를 거친 선택이 아니라 초안 작성 과정에서 그대로 들어간 값이었다. 프로젝트가 실제로
Next.js 16.2.10 / React 19.2.4 / Tailwind v4(CSS-first `@theme`, JS 설정 없음)로 세팅된
지금, UI 스택을 다시 결정할 필요가 있었다.

두 갈래를 검토했다:

1. **Meta의 Astryx**(`facebook/astryx`) — 실존하는 "agent-ready" 오픈소스 디자인 시스템(150+
   컴포넌트, React + StyleX, 7.9k stars, 2026-07 기준 beta v0.1.4)임을 웹 검색으로 검증함.
   `theme-neutral` 외 6종 테마 제공.
2. **uiverse.io/design**의 완제품 디자인 시스템 팩** — DESIGN.md + 순수 CSS + 프리뷰로 구성된
   구매/다운로드형 팩. 먼저 받아본 **Verdara**(기후 저널리즘 매거진 톤)는 스크린샷 확인 후 우리
   내부 B2B 도구와 톤이 맞지 않아 기각. 카탈로그(43개 중 30개 열람)를 다시 훑어 **Cirrus**(SaaS
   제품 톤, 차분한 미니멀, 히어로 안에 대시보드 목업 포함)를 선정, `tmp/cirrus`로 다운로드해
   DESIGN.md/screenshots를 확인함.

Cirrus는 마케팅 랜딩페이지용 팩이라 히어로·가격표·CTA 배너 등 상당 부분이 우리 앱과 무관하지만,
색상 롤·타이포 스케일·radius·elevation·기본 컴포넌트 레시피(Button/Input/Card/Tabs/Checkbox/
Chip/Nav/Avatar)는 그대로 재사용 가능한 수준이었다. 다만 Cirrus는 순수 CSS라 동작(키보드·포커스·
ARIA)을 전혀 포함하지 않고, 우리가 실제로 필요한 컴포넌트 중 Select/Combobox(태그 선택+즉석
생성)·Accordion(원본 전사 접기)·Toast·Progress/Spinner(폴링 상태)·파일 드롭존은 Cirrus 레시피에
아예 없다.

또한 이번 논의에서 모바일 실사용을 v1 완료 기준(DoD)에 포함하기로 범위를 넓혔다 — 기존
[0001](0001-decisions.md)의 DoD에는 모바일 언급이 없었다.

## Decision

- **토큰**: Cirrus의 색상/타이포/radius/spacing/elevation 토큰을 Tailwind v4 `@theme` 블록으로
  이식한다. Cirrus의 `:root` CSS 커스텀 프로퍼티 구조가 `@theme`와 궁합이 좋아 별도 변환 레이어가
  거의 필요 없다.
- **컴포넌트 표현**: Cirrus가 정의한 Button/Input/Textarea/Card(+card-flush/slab)/Tabs/Checkbox/
  Chip/Nav/Avatar 레시피를 재사용한다. 클라우드 히어로 배경, 이탤릭 세리프 악센트 문구 규칙,
  가격표, CTA 배너 등 마케팅 전용 모티프는 채택하지 않는다.
- **컴포넌트 동작**: 키보드/포커스/ARIA는 **Base UI**로 조달하고 그 위에 Cirrus 시맨틱 토큰을
  입힌다(foundation 스킬의 "동작은 조달, 표현은 시맨틱 토큰" 원칙). Cirrus에 레시피가 없는
  Select/Combobox·Accordion·Toast·Progress·파일 드롭존은 Base UI 프리미티브 위에 Cirrus 토큰으로
  직접 설계한다.
- **모바일**: 모바일 실사용을 전제로 폴리시한다. v1에서 유일한 오버레이 표면인 태그 선택
  콤보박스는 데스크톱=팝오버, 모바일=바텀시트(`vaul`)로 표현을 분기한다(responsive-app 스킬
  2장 "반응형 형태 매핑"). `100dvh`/`env(safe-area-inset-*)`를 처음부터 적용한다. 그 외 화면은
  전부 목적지(페이지)이고 오버레이가 없어 추가 분기가 필요 없다.
- **Astryx와 shadcn/ui는 채택하지 않는다** — Options considered 참고.

## Options considered

- **Astryx (Meta)** — 실존/검증됨, 컴포넌트 수 가장 많음, agent-ready. 다만 자체 프리빌드
  컴포넌트(StyleX)라 톤을 세밀하게 통제하기보다 제공된 테마(7종) 중 고르는 형태에 가까움. 우리는
  이미 Cirrus라는 구체적인 톤 소스(DESIGN.md)를 확보했고 Tailwind v4 토큰으로 직접 이식하는 편이
  더 세밀한 통제가 가능해 기각.
- **shadcn/ui ([0001] 원안)** — Radix + Tailwind 기반, 커스터마이징 좋음. 다만 애초에 검토 없이
  들어간 값이었고 톤앤매너 소스가 없는 상태에서 고른 기본값이었다. Cirrus라는 구체적 톤이 생긴
  지금은 shadcn의 기본 표현을 다시 벗겨내는 추가 작업이 오히려 불필요해 대체.
- **Verdara (uiverse.io)** — 스크린샷 확인 결과 기후 저널리즘 매거진 톤(파치먼트 배경, 대형
  세리프 헤드라인, 꽃잎 시그니처 로고)으로 내부 B2B 업무 도구와 맞지 않아 기각.
- **Cirrus 토큰 + Base UI 동작 조달 (chosen)** — 톤이 파일로 명확히 존재하고, Tailwind v4 이식이
  자연스러우며, foundation 스킬 원칙(동작 조달 + 시맨틱 토큰 표현)과 맞아떨어짐.

## Consequences

- [0001](0001-decisions.md) 기술 스택 표의 `UI | Tailwind CSS + shadcn/ui` 행은 이 ADR로
  superseded된다 (해당 표에 각주 추가).
- Select/Combobox, Accordion, Toast, Progress, 파일 드롭존은 Cirrus에 레시피가 없어 Base UI
  프리미티브 위에 직접 설계·컴포넌트 계약 문서화가 필요하다 (후속 작업).
- 모바일이 v1 DoD에 포함되면서 태그 콤보박스 한정으로 데스크톱/모바일 표현 분기(팝오버 ↔
  `vaul` 바텀시트)가 필요하다. 다른 화면은 오버레이가 없어 추가 분기 부담이 없다.
- 재검토 트리거: Cirrus 팩이 uiverse.io에서 업데이트되거나, Cirrus 토큰 범위를 크게 벗어나는
  컴포넌트(예: 복잡한 데이터 테이블·차트)가 v1 이후 필요해지면 재검토한다.

## Links

- 관련 ADR: [0001. 회의록 자동화 데모 — 결정사항](0001-decisions.md), [0002. 프론트엔드 구조: FSD 채택](0002-frontend-architecture-fsd.md)
- 외부 문서: Cirrus DESIGN.md (`tmp/cirrus/DESIGN.md`, 원본 uiverse.io/design/systems/cirrus), Base UI (base-ui.com), vaul (npm, drawer/바텀시트), Tailwind v4 `@theme` 문서 (확인일 2026-07-12)
