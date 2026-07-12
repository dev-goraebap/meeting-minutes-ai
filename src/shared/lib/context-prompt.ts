/** Copy-paste prompt (ADR-0001) for generating a tag's background context via a local coding agent. */
export function buildContextGenerationPrompt(tagName: string) {
  return `지금부터 "${tagName}" 프로젝트의 회의록 자동 생성 도구에 쓸 배경 컨텍스트를 만들 거야.

1. 이 프로젝트와 관련된 문서(요구사항정의서, 설계문서, ADR, 데이터 모델, 용어사전 등)를
   찾아서 읽어줘. 어디 있는지 모르면 나에게 물어봐.
2. 읽은 내용을 바탕으로 아래 항목을 포함한 요약을 마크다운으로 작성해줘:
   - 프로젝트 개요 (목적, 현재 진행 단계)
   - 팀원 이름과 역할
   - 도메인 용어/약어 사전 (회의에서 등장할 만한 것 위주)
   - 최근 주요 의사결정이나 리스크
3. 원본 문서 전체를 복붙하지 말고, 회의록 자동 생성 시 참고할 만한 핵심만 압축해줘
   (목표: A4 1~2장 분량, 너무 길면 다음 회의부터 컨텍스트 낭비가 됨).
4. 최종 결과만 마크다운 코드블록으로 출력해줘. 그 외 설명은 하지 마.`;
}
