/* 경력 — 위에서부터 최신순. 행을 추가/삭제하면 그대로 반영됩니다.
   note는 선택 항목입니다(없으면 줄이 생기지 않음).

   담당 시스템: data/projects.js에서 company가 이 org와 글자까지 같은 프로젝트가
   이 행 아래 "담당 시스템" 목록으로 들어갑니다(그 프로젝트는 프로젝트 그리드에서 빠짐).
   회사명을 바꾸면 양쪽을 같이 바꿔 주세요. */
window.PORTFOLIO = window.PORTFOLIO || {};

window.PORTFOLIO.career = [
  {
    period: "2025.04 — 현재",
    org: "빅게임스튜디오",
    role: "클라이언트 콘텐츠 프로그래머",
    note: "콘텐츠 구현 및 UI R&D",
  },
];
