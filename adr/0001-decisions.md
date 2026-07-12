# 회의록 자동화 데모 — 결정사항

## 배경

한국어 회의 녹음 파일(2시간 내외, 주 2~4회)을 자동으로 회의록화하는 아이디어를 검증하기 위한 빠른 오픈소스 데모.

## 검증된 사실 (실제 오디오로 테스트 완료)

- 로컬 CPU + faster-whisper(medium)로도 전사는 가능하나 느림(34분 오디오 처리에 수십 분 소요), 화자분리 없음.
- **AssemblyAI**(Universal 모델, `speaker_labels: true`)로 같은 파일 처리 시 화자분리(3명 자동 구분)까지 포함해 훨씬 빠르고 정확했음.
- 비용: 34분 오디오 기준 약 $0.09(120~130원) — 이 팀의 실사용량(월 1,000~2,000분) 기준으로도 월 3,500~17,000원 수준, 부담 없는 비용.
- 실제 회사 프로젝트 회의 녹음 + 프로젝트 산출물 문서(요구사항정의서, 비즈니스 규칙, ADR 등)를 함께 참고하니 도메인 용어 오인식(PGW→PTW, TVM→TBM 등) 교정과 화자 역할 추정이 가능했음 — 이게 "프로젝트 컨텍스트" 개념의 근거.

## 핵심 개념 및 데이터 모델

- **Project**
  - `id`, `name`, `contextTemplate`(text, nullable), `contextUpdatedAt`(nullable), `createdAt`
- **Meeting**
  - `id`, `projectId`(FK), `title`, `audioFilePath`(로컬 저장 경로), `status`(`uploaded` → `transcribing` → `summarizing` → `completed` | `failed`), `errorMessage`(nullable)
  - `rawTranscript`(AssemblyAI 화자분리 결과 원문, JSON: `[{speaker, start, end, text}]`)
  - `structuredMinutes`(LLM이 생성한 구조화 회의록, markdown text — 사용자가 편집 가능해야 하므로 raw markdown으로 저장)
  - `speakerMapping`(JSON: `{"A": "홍길동", "B": "이영희", ...}`, nullable — 매핑 전엔 Speaker A/B/C로 표시)
  - `extraNote`(회의 등록 시 사용자가 추가한 메모, nullable)
  - `createdAt`

## 파이프라인

```
오디오 업로드 (POST /api/projects/[id]/meetings)
  → status: "uploaded" 로 저장, 파일은 /data/audio/{meetingId}.{ext} 에 저장
  → status: "transcribing"
  → AssemblyAI 호출:
       speech_models: ["universal-3-5-pro", "universal-2"]
       language_code: "ko"
       speaker_labels: true
     → rawTranscript 저장
  → status: "summarizing"
  → Claude API 호출 (model: 최신 Sonnet, 예: claude-sonnet-5):
       system prompt = 프로젝트 contextTemplate + 최근 회의록(structuredMinutes) 최대 3개(최신순)
       user prompt = 이번 회의 rawTranscript + extraNote
       요청 출력 포맷: 아래 "회의록 출력 포맷" 고정
     → structuredMinutes 저장
  → status: "completed" (실패 시 status: "failed" + errorMessage 저장, 재시도 버튼 제공)
  → 사용자가 상세 페이지에서 speakerMapping 지정 + structuredMinutes 편집 가능
```

### 회의록 출력 포맷 (LLM에게 고정 지시)

아래 구조를 따르도록 시스템 프롬프트에 고정 지시한다 (이번 대화에서 실제로 검증된 포맷):

```md
# 회의록 — {프로젝트명}
**일시** / **참석자(Speaker A/B/C 그대로 표기)**

## 안건별 요약 (섹션마다 관련 발언자 표시)
## 결정사항
## 액션 아이템 (표: 항목 | 담당(화자 라벨) | 기한)
## 참고/불확실 사항 (STT 오인식 가능성 있는 용어, 화자 귀속 불확실한 부분 명시)
```

화자는 항상 원본 라벨(Speaker A/B/C)로 생성하고, 실명 치환은 프론트엔드에서 `speakerMapping`으로 렌더링 시 치환한다 (LLM 재호출 없이).

### 최근 회의록 포함 개수
**N = 3** (프로젝트의 가장 최근 완료된 회의록 3개, `structuredMinutes` 텍스트만 — `rawTranscript`는 제외해 컨텍스트 크기 절약)

## 컨텍스트 전략 (문서 파서 대신 로컬 에이전트 활용)

- 플랫폼이 xlsx/docx/pdf를 직접 파싱하지 않는다. 대신:
  1. 플랫폼에서 "컨텍스트 생성 프롬프트 복사" 버튼 제공
  2. 사용자가 로컬 코딩 에이전트(Claude Code 등)에 붙여넣어 관련 프로젝트 문서를 탐색시키고 요약 md/txt를 생성
  3. 그 결과를 플랫폼의 "프로젝트 컨텍스트" 텍스트필드에 붙여넣음 → 이후 그 프로젝트의 모든 회의록 생성에 기본으로 사용
- 컨텍스트 템플릿에 **최종 갱신일**을 표시해 신선도를 사용자가 인지하게 한다.
- 회의 연속성: 벡터DB 없이, **직전 회의록(구조화된 요약본) N개를 컨텍스트에 포함**하는 방식으로 처리. 구조화 요약본은 용량이 작아 LLM 컨텍스트 윈도우에 충분히 들어감.

### "컨텍스트 생성 프롬프트" 복사 버튼 — 실제 문구 (초안)

프로젝트 상세 페이지의 "컨텍스트 생성 프롬프트 복사" 버튼이 클립보드에 복사할 텍스트:

```
지금부터 "{프로젝트명}" 프로젝트의 회의록 자동 생성 도구에 쓸 배경 컨텍스트를 만들 거야.

1. 이 프로젝트와 관련된 문서(요구사항정의서, 설계문서, ADR, 데이터 모델, 용어사전 등)를
   찾아서 읽어줘. 어디 있는지 모르면 나에게 물어봐.
2. 읽은 내용을 바탕으로 아래 항목을 포함한 요약을 마크다운으로 작성해줘:
   - 프로젝트 개요 (목적, 현재 진행 단계)
   - 팀원 이름과 역할
   - 도메인 용어/약어 사전 (회의에서 등장할 만한 것 위주)
   - 최근 주요 의사결정이나 리스크
3. 원본 문서 전체를 복붙하지 말고, 회의록 자동 생성 시 참고할 만한 핵심만 압축해줘
   (목표: A4 1~2장 분량, 너무 길면 다음 회의부터 컨텍스트 낭비가 됨).
4. 최종 결과만 마크다운 코드블록으로 출력해줘. 그 외 설명은 하지 마.
```

이 프롬프트 자체도 UI 카피이므로, 실제 구현 시 프로젝트명이 자동 치환되도록 템플릿 문자열로 처리한다.

## 벡터DB — v1에서 제외

다음 조건에 해당할 때만 재검토:
1. 누적 컨텍스트(프로젝트 문서 + 회의록 이력)가 LLM 컨텍스트 윈도우를 초과할 때
2. "예전에 이거 관련 뭐라고 했지" 같은 시맨틱 검색이 필요할 때
3. 매 요청마다 방대한 컨텍스트를 보내는 비용/속도가 문제될 때

지금 규모(프로젝트 소수, 회의 주 2~4회)에서는 해당 없음 — "컨텍스트 다 넣기"로 시작.

## 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js (App Router)** | 프론트+백엔드 통합, AI 관련 생태계/예제가 풍부 |
| 언어 | TypeScript | |
| DB | SQLite (Drizzle ORM) | 별도 서버 없이 파일 하나, 데모 규모에 충분 |
| STT | `assemblyai` npm 패키지 | 공식 Node SDK, `speaker_labels: true` |
| 회의록 생성(LLM) | `@anthropic-ai/sdk` (Claude) | 프로젝트 컨텍스트 + 최근 회의록 + 원문을 프롬프트로 구성 |
| 오디오 저장 | 로컬 파일시스템 | v1에는 S3/R2 등 불필요 |
| UI | Tailwind CSS + shadcn/ui | |
| 비동기 처리 | 큐 없이 단순 async/await | 업로드 요청 안에서 STT→LLM까지 순차 처리. 데모 규모에 큐는 과함 |
| 패키지 매니저 | npm | 로컬에 이미 설치됨(v11), 별도 설치 불필요 |

## 환경변수 / 보안

- `.env.local`에 `ASSEMBLYAI_API_KEY`, `ANTHROPIC_API_KEY` 저장. **`.gitignore`에 반드시 포함**, 커밋 금지.
- 코드 어디에도 키를 하드코딩하지 않는다 (문자열 리터럴 금지, `process.env.*`로만 접근).
- ⚠️ 이번 데모 검증 과정에서 AssemblyAI 키가 대화창에 평문으로 노출된 적이 있다. **실제 구현 시작 전에 해당 키를 AssemblyAI 대시보드에서 재발급(rotate)하고, 새 키를 `.env.local`에 넣을 것.**

## v1 페이지 구성 및 API

1. `/projects` — 프로젝트 목록 (GET `/api/projects`, POST `/api/projects`)
2. `/projects/[id]` — 프로젝트 상세: 컨텍스트 템플릿(갱신일 포함, 수정 가능) + 회의록 목록 (GET/PATCH `/api/projects/[id]`)
3. `/projects/[id]/meetings/new` — 오디오 업로드 폼, (선택) 이번 회의 추가 메모 (POST `/api/projects/[id]/meetings`, multipart)
4. `/meetings/[id]` — 처리 상태 / 구조화 회의록 / 원본 화자분리 텍스트(접이식) / 화자→실명 매핑 UI / 편집
   - GET `/api/meetings/[id]` — 상세 조회 (status 포함)
   - PATCH `/api/meetings/[id]` — speakerMapping, structuredMinutes 수정
   - **상태 갱신 방식**: 큐가 없으므로 서버가 status를 즉시 반영해가며 처리. 프론트는 status가 `completed`/`failed`가 아닌 동안 **3초 간격 polling**(`GET /api/meetings/[id]`)으로 갱신. 완료 시 자동으로 결과 화면 전환.
   - 실패 시(`status: failed`) 상세 페이지에 에러 메시지 + "재시도" 버튼 노출 (재시도는 실패한 단계부터가 아니라 처음부터 다시)

## v1 범위 제외 (의도적으로 미룸)

- 문서 파서(xlsx/docx/pdf 직접 파싱)
- 벡터DB / RAG
- 큐 시스템(BullMQ 등)
- hoho-hr 통합 — 데모 검증 후 별도 판단
- 알림, 액션아이템 담당자 배정 등 부가 기능

## 테스트용 오디오 파일

실제 검증에 쓴 원본 파일: `C:\Users\devgo\Downloads\금요일 오후 4-06.aac` (약 34분 21초, 한국어, 3인 대화, 안전관리솔루션 프로젝트 스프린트 회의).

> ⚠️ 이 대화 세션에서 만든 처리 결과물(wav 변환본, 트랜스크립트 등)은 세션 임시 디렉토리(`.claude/jobs/.../tmp`)에 있어 **세션 종료 후 삭제된다.** 위 원본 경로에서 다시 시작해야 한다.

## 완료 기준 (v1 Definition of Done)

아래 흐름이 한 번 끝까지 실제로 동작하면 v1 데모 성공으로 간주한다:

1. 프로젝트 생성 (이름 + 컨텍스트 템플릿 붙여넣기)
2. 위 테스트 오디오 파일 업로드
3. 상태가 `uploaded → transcribing → summarizing → completed`로 자동 전환되는 것을 폴링으로 확인
4. 결과 페이지에서 구조화된 회의록(안건/결정사항/액션아이템)이 보임
5. Speaker A/B/C를 실명으로 매핑하면 화면에 실명으로 반영됨
6. 같은 프로젝트에 두 번째 회의록을 등록하면, 생성된 회의록이 첫 번째 회의 내용을 참고한 티가 남 (예: "지난 회의에서 논의된 ~" 같은 언급)

6번까지 확인되면 "연속성" 핵심 가설이 검증된 것이므로 데모 목적 달성.

## 참고: hoho-hr 통합 시 재사용 가능했던 것들 (나중을 위한 메모)

- 파일 업로드: `module/file`의 `Attachment`/`ObjectStorage` 패턴
- 외부 API 키 관리: `application-{profile}.properties` + Noop 폴백 패턴 (R2/Gmail/VAPID와 동일)
- 참석자 선택: `organization` 모듈의 기존 사원 목록 재사용 가능
- 완료 알림: 기존 `notification` 모듈 재사용 가능
- 비동기 처리 인프라(큐/폴링)는 hoho-hr에 선례가 없어 새로 설계 필요했음
