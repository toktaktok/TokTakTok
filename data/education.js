/* 학력·교육·소모임 — 경력 외의 짧은 이력. 위에서부터 최신순.
   label은 "학력"/"교육"/"소모임"처럼 짧은 분류표입니다. note는 선택 항목(없으면 줄이 안 생김).
   전부 지우면(빈 배열) "학력·활동" 섹션 자체가 페이지에서 사라집니다. */
window.PORTFOLIO = window.PORTFOLIO || {};

window.PORTFOLIO.education = [
  {
    period: "2022 —",
    label: "소모임",
    title: "스터디/모임명 입력",
    note: "활동 내용을 한 줄로. (샘플 행 — data/education.js에서 교체)",
  },
  {
    period: "2023",
    label: "교육",
    title: "교육/부트캠프명 입력",
    note: "이수 내용을 한 줄로.",
  },
  {
    period: "2016.03 — 2020.02",
    label: "학력",
    title: "학교명 입력 · 전공 입력",
    note: "",
  },
];
