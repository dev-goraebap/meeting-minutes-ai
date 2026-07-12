# 9. 홈서버 Docker 배포 (mm.goraebap.xyz)

- Status: accepted
- Date: 2026-07-12
- Deciders: dev-goraebap

## Context

지금까지는 로컬 dev 서버로만 검증했다. 사용자가 개인 홈서버(SSH 접속, Ubuntu 24.04)에 Docker로
올려 `mm.goraebap.xyz`(Cloudflare DNS로 서버 공인 IP를 가리키도록 이미 설정됨)로 접근 가능하게
해달라고 요청했다.

서버 인프라의 구체적인 정보(호스트/포트/계정, 다른 앱들의 컨테이너 이름, nginx 설정 경로 등)는
공개 저장소에 남기지 않는다 — 그 정보는 `.gitignore`된 `deploy.sh`에만 있고, 이 리포에는 커밋되지
않는다. 이 ADR에는 그 정보에 의존하지 않는, 일반화된 결정 사항만 남긴다.

서버 조사에서 확인한, 이 리포의 코드/설정에 영향을 준 사실:
- Docker가 apt가 아니라 **snap**으로 설치되어 있어, 비대화형 SSH 세션의 기본 PATH에는 `docker`
  바이너리가 없다 — 배포 스크립트는 항상 전체 경로로 호출해야 한다.
- nginx는 별도 docker 컨테이너로 떠 있고, 기존 앱들과 공유하는 docker 네트워크에 이름으로
  `proxy_pass`하는 구조다 — 이 앱도 같은 네트워크에 붙어야 리버스 프록시가 컨테이너 이름으로
  찾을 수 있다.
- 인증서 발급/갱신은 이미 서버에 문서화된 절차(certbot standalone → nginx가 마운트하는 인증서
  디렉토리로 복사 → nginx 재시작, cron으로 자동 갱신)가 있어 그 절차를 그대로 따랐다 — 이 리포
  범위 밖의 서버 전역 설정이라 이 리포에는 남기지 않는다.
- Postgres는 사용자 승인 하에 **기존 공유 postgres 컨테이너를 재사용**한다(다른 앱들과 인스턴스는
  공유, 이 앱 전용 DB만 새로 생성해 데이터는 격리). 접속 비밀번호는 대화나 커밋에 평문으로 남기지
  않고 서버의 `.env.production`에만 존재한다.
- 서버에는 Node.js가 설치되어 있지 않다(git만 있음) — 스키마 동기화(`drizzle-kit push`)도 반드시
  Docker 컨테이너 안에서 실행해야 한다.

## Decision

- **`next.config.ts`에 `output: "standalone"`** — Docker 이미지에 `node_modules` 전체가 아니라
  트레이싱된 최소 런타임 파일만 들어가게 한다.
- **`Dockerfile`**: 3단계(`deps` → `builder` → `runner`) 빌드. `builder`는 devDependencies(특히
  `drizzle-kit`) + 전체 소스를 그대로 갖고 있어, 별도로 `--target builder`로도 태깅해 마이그레이션
  실행용으로 재사용한다(서버에 Node.js가 없으므로 이 방법이 가장 간단).
- **`packageManager: "pnpm@10.33.0"`을 `package.json`에 고정** — corepack이 Docker 안에서 최신
  pnpm(11.x)을 받아오면서 새로 생긴 `minimumReleaseAge` 공급망 정책에 걸려 최근 게시된 패키지
  (`browserslist` 등)를 거부하는 문제가 있었다. 로컬과 동일한 pnpm 버전을 고정해 해결.
- **업로드 오디오 파일**: 컨테이너의 `/app/data`를 호스트 볼륨에 마운트해 재배포해도 유지되게 한다.
- **배포 방식은 git pull, rsync 아님** — 로컬 Windows 환경에 rsync가 없었고, 이미 GitHub
  원격 저장소가 있으므로 서버에서 `git clone`(최초)/`git fetch && git reset --hard origin/main`
  (이후)로 가져오는 편이 더 간단하고 표준적이다.
- **`deploy.sh`는 `.gitignore`에 등록해 커밋하지 않는다** — 서버 SSH 엔드포인트·다른 앱들의
  컨테이너 이름 등 이 서버 고유 정보가 하드코딩되어 있어 공개 저장소에 부적절하다는 사용자 요청.
- **`.env.production`은 서버에만 존재**한다 — `DATABASE_URL`(공유 postgres 비밀번호 포함),
  `ASSEMBLYAI_API_KEY`, `ANTHROPIC_API_KEY`. 로컬 저장소에도, git에도, 대화 로그에도 평문으로
  남기지 않기 위해 서버에서 직접 만들도록 안내했다.
- **로그인 토큰**: `scripts/generate-login-token.mjs`가 `process.env.DATABASE_URL`을 우선 사용하도록
  수정(기존엔 `.env.local`만 읽었음) — 프로덕션에서는 `docker run --env-file .env.production`으로
  주입된 값을 그대로 쓴다.

## Options considered

- **Docker Hub/GHCR에 이미지 푸시 후 서버에서 pull**: 레지스트리 로그인·태깅 관리가 추가로 필요.
  개인 홈서버 하나만 배포 대상이라 서버에서 직접 `docker build`하는 쪽이 더 단순해 기각.
- **런타임 이미지 안에 drizzle-kit 포함**: standalone output의 목적(최소 런타임)과 충돌하고,
  이미지가 불필요하게 커짐. `builder` 스테이지를 마이그레이션 전용으로 재사용하는 쪽을 택함.
- **서버의 기존 Docker 설치 방식(snap) 대신 apt로 재설치**: 이미 정상 동작하므로 불필요한 변경.
  PATH만 배포 스크립트에서 명시적으로 처리.

## Consequences

- 재배포는 `./deploy.sh` 한 번으로: `git push` → 서버에서 `git pull` → 이미지 빌드 →
  `drizzle-kit push` → 컨테이너 재시작.
- nginx 서버 블록 추가·인증서 발급은 이 리포 밖, 서버에 이미 문서화된 절차로 처리했다.
- 기존 postgres 인스턴스를 공유하므로, 그 인스턴스 자체가 내려가면 이 앱도 함께 영향받는다 —
  별도 DB 인스턴스 대비 격리 수준이 낮다는 트레이드오프를 감수했다(사용자가 명시적으로 선택).

## Links

- 관련 ADR: [0001](0001-decisions.md)(DB/스택), [0008](0008-single-token-auth.md)(인증)
