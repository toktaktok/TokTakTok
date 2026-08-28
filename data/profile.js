/* 사이트 기본 정보 — 이 파일만 고치면 첫 화면·연락처·콜로폰이 바뀝니다. */
window.PORTFOLIO = window.PORTFOLIO || {};

window.PORTFOLIO.profile = {
  /* 상단 워드마크와 브라우저 탭에 쓰이는 핸들 */
  handle: "toktaktok",

  /* 이름 · 직함 */
  name: "이름 입력",
  role: "게임 클라이언트 프로그래머",

  /* 히어로 상단의 작은 모노 라벨 */
  kicker: "game client programmer",

  /* 히어로 헤드라인 — 짧게, 50자 이내 */
  headline: "게임의 화면 안쪽을 만듭니다.",

  /* 헤드라인 아래 소개 2–3문장 */
  intro:
    "UI 시스템, 게임플레이, 성능 최적화를 다루는 클라이언트 프로그래머입니다. " +
    "이 문단은 자리 표시 문장입니다 — data/profile.js에서 실제 소개로 바꿔 주세요.",

  /* 히어로 하단 메타(모노). 연차·위치 등 짧은 사실만 */
  meta: ["경력 N년 — 연차 입력", "위치 입력"],

  /* 연락처 · 링크 */
  email: "toktaktok2938@gmail.com",
  github: "https://github.com/toktaktok",

  /* 이력서 PDF 경로. 파일을 assets/에 넣고 경로를 적으면 상단 우측 버튼이 이력서로 바뀝니다.
     비워 두면 버튼은 연락 섹션으로 이동합니다. 예: "assets/resume.pdf" */
  resumeUrl: "",

  /* 콜로폰에 표시되는 마지막 수정일 */
  updated: "2026-08-25",
};
