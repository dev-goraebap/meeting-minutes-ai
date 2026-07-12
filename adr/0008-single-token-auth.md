# 8. 단일 토큰 로그인

- Status: accepted
- Date: 2026-07-12
- Deciders: dev-goraebap

## Context

지금까지 데모 앱에는 아무 접근 제어가 없었다. 사용자가 "DB에 간단하게 30자리 난수 토큰 만들어서
암호화 보관하고 원문을 tmp 폴더에 .txt 파일로 나에게 알려주도록. 간단하게 그걸로 로그인하도록 하는
화면"을 요청했다 — 멀티유저 회원가입/역할 체계가 아니라, 앱 전체를 지키는 단일 공유 자격증명이다.

## Decision

- `auth_tokens` 테이블(`id`, `token_hash`, `created_at`)에 로그인 토큰의 **sha256 해시만** 저장한다.
  평문은 절대 DB에 저장하지 않는다.
- `scripts/generate-login-token.mjs`: 30자 랜덤 토큰(오인하기 쉬운 0/O, 1/l/I 제외한 문자셋)을
  생성해 해시를 DB에 저장하고, 평문은 리포 루트의 `tmp/login-token.txt`에 1회 기록한다(이 파일은
  `.gitignore`의 `tmp` 패턴에 이미 걸려 커밋되지 않음).
- 세션은 서버 측 세션 스토어 없이, **쿠키 값 = 로그인 시 검증에 성공한 토큰의 해시**로 구현한다.
  해시는 올바른 평문 토큰을 아는 사람만 만들어낼 수 있으므로, 쿠키 자체가 곧 인증 증명이다.
  단일 자격증명 데모 앱에서 별도 `sessions` 테이블을 두는 것보다 훨씬 단순하다.
- `POST /api/auth/login` — 입력 토큰을 해시해 DB 값과 비교, 일치하면 httpOnly 쿠키(`mm_session`)
  설정. `POST /api/auth/logout` — 쿠키 삭제(서버 측 무효화는 없음 — 토큰 자체를 회전시키려면
  스크립트를 다시 실행).
- `proxy.ts`(Next.js 16부터 `middleware.ts`가 `proxy.ts`로 개명 — `node_modules/next/dist/docs/
  01-app/01-getting-started/16-proxy.md`로 확인)에서 모든 요청에 대해 쿠키를 DB의 최신 해시와
  비교해 리다이렉트한다. Next.js 공식 인증 가이드(`02-guides/authentication.md`)는 Proxy에서
  "optimistic" 쿠키 존재 여부만 확인하고 실제(DB) 검증은 Data Access Layer로 내리라고 권장하지만,
  이 앱은 Postgres SELECT 1건이 부담 없는 개인용 로컬 데모 규모이므로 Proxy에서 직접 확실하게
  검증하는 쪽이 더 단순하고 안전해 그 권장을 의도적으로 따르지 않았다.
- `/login`과 `/api/auth/*`만 matcher에서 제외한다 — 그 외 모든 페이지·API가 보호 대상이다.

## Options considered

- **NextAuth.js/Auth.js 등 라이브러리 도입**: 멀티유저·OAuth·역할 기반 접근 제어까지 지원하지만,
  단일 공유 토큰 하나만 필요한 이 데모에는 과함. 기각.
- **평문 토큰을 DB에 그대로 저장**: 사용자가 명시적으로 "암호화 보관"을 요청했고, 해시 비교로
  충분히 "로그인 가능" 기능을 구현할 수 있어 평문 저장은 불필요한 리스크. 기각.
- **JWT 서명(jose 등)으로 세션 관리**: 별도 `SESSION_SECRET` 관리, 서명/검증 로직이 추가로 필요.
  이 앱은 자격증명이 하나뿐이라 "쿠키 값 = 검증된 해시" 방식으로 서명 없이도 위조 불가능함을
  확보할 수 있어 기각(서명 라이브러리 없이 동일한 보안 속성 달성).

## Consequences

- 토큰을 재발급하려면 `LOGIN_TOKEN_OUT_DIR=<원하는 경로> node scripts/generate-login-token.mjs`를
  다시 실행한다(기본값은 리포 루트 `tmp/`). 새 행이 추가되고 `getLatestAuthTokenHash()`가 가장
  최근 것만 사용하므로, 이전 토큰은 자동으로 무효화된다.
- "로그아웃"은 브라우저의 쿠키만 지운다 — 진짜 토큰 무효화(회전)가 필요하면 스크립트를 다시 실행.
- 회의 업로드·다운로드 등 기존 API는 변경 없음 — Proxy가 그 앞단에서 전부 보호한다.

## Links

- 관련 ADR: [0001](0001-decisions.md)
- 참고: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`,
  `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
