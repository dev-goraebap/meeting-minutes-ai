# 6. 데이터베이스: SQLite에서 공유 Postgres 인스턴스로 전환

- Status: accepted
- Date: 2026-07-12
- Deciders: dev-goraebap

## Context

[0001](0001-decisions.md)에서 "별도 서버 없이 파일 하나, 데모 규모에 충분"을 이유로 SQLite +
Drizzle ORM을 채택했다(Task 4에서 `@libsql/client`로 실제 스키마·마이그레이션까지 구현·검증 완료).
사용자가 뒤늦게 내부적으로 이미 운영 중인 Postgres 인스턴스를 이 데모에도 쓰기로 결정해, 접속 정보
(호스트·포트·계정, `meeting-minutes`라는 이름의 DB가 이미 생성되어 있음)를 전달했다.

⚠️ 해당 접속 정보(내부 IP 포함)는 채팅으로 평문 전달되었다. 코드/커밋에는 절대 포함하지 않고
`.env.local`(`DATABASE_URL`, gitignore 대상)에만 저장한다. AssemblyAI 키 노출 사례와 동일한
패턴이므로, 필요시 이후 비밀번호를 기본값에서 교체하는 것을 권장한다.

## Decision

- SQLite(`drizzle-orm/sqlite-core` + `@libsql/client`)를 걷어내고 Postgres(`drizzle-orm/pg-core`
  + `postgres`(postgres.js) 드라이버)로 전환한다.
- 연결 문자열은 `DATABASE_URL` 환경변수로만 주입한다(`.env.local`, `.env.local.example`은 빈 값
  유지).
- 스키마 변경점: `status`를 SQLite `text(enum)` 대신 Postgres 네이티브 `pgEnum`으로, JSON 컬럼
  (`rawTranscript`, `speakerMapping`)을 `text(mode:"json")` 대신 `jsonb`로, timestamp를
  `integer(mode:"timestamp")` 대신 Postgres `timestamp`로 전환한다. 테이블/컬럼 구조와 필드
  의미는 [0001](0001-decisions.md)/[0004](0004-design-system-handoff.md)와 동일하다.
- 마이그레이션을 재생성해 실제 `meeting-minutes` DB에 적용, `tags`/`meetings` 테이블 생성을
  확인했다.
- 로컬 SQLite 파일(`/data/db/`)은 더 이상 쓰지 않는다. `/data/audio/`(업로드 오디오 저장, Task
  10에서 구현 예정)는 이 결정과 무관하게 로컬 파일시스템에 그대로 남는다.

## Options considered

- **SQLite 유지** — 이미 구현·검증된 상태였지만, 사용자가 명시적으로 기존 Postgres 인스턴스
  사용을 지시했고, 이건 실사용 환경과 더 가까워 지금 전환하는 편이 이후 재작업을 피할 수 있음.
  기각.
- **Postgres로 전환 (chosen)** — 사용자 지시 + 이미 존재하는 인프라 재사용.

## Consequences

- [0001](0001-decisions.md) 기술 스택 표의 `DB | SQLite (Drizzle ORM)` 행은 이 ADR로
  superseded된다(해당 표에 각주 추가).
- 데모가 더 이상 "파일 하나로 완결"되지 않고 외부 Postgres 가용성에 의존한다 — 로컬 개발 시
  네트워크 접근 가능 여부를 먼저 확인해야 한다(이번 세션에서 접속 테스트로 확인 완료).
- 여러 프로젝트/데모가 같은 Postgres 인스턴스·DB를 공유할 가능성이 있다 — 테이블명 충돌 등은
  현재 `meeting-minutes` DB가 이 프로젝트 전용으로 만들어져 있어 해당 없음.
- 재검토 트리거: 이 Postgres 인스턴스에 접근할 수 없는 환경(예: CI, 다른 개발자 PC)에서 작업해야
  할 경우 로컬 대체(Docker Postgres 등)를 재검토한다.

## Links

- 관련 ADR: [0001](0001-decisions.md) (DB 행 superseded)
- 검증: `postgresql://...@59.0.87.169:8020/meeting-minutes`로 접속 테스트, 마이그레이션 적용,
  `tags`/`meetings` 테이블 생성 확인 (2026-07-12)
