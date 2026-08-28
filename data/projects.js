/* 프로젝트 — 카드와 상세 페이지가 이 파일 하나로 만들어집니다.
 *
 * 항목 설명
 *   id        : 상세 페이지 주소(project.html?id=...)에 쓰이는 고유 슬러그
 *   featured  : true면 목록 맨 위에서 큰 카드로 표시
 *   tags      : 필터 버튼이 이 태그들로 자동 생성됨
 *   thumb     : 카드 썸네일 경로(assets/images/...). 비우면 캐릭터 자리 표시가 뜸
 *   media     : 상세 페이지 상단의 이미지/영상 목록. 스크린샷보다 플레이 GIF 권장
 *   metrics   : 핵심 수치. 아직 없으면 value를 "—" 로 두세요 — 지어내지 않기
 *   contributions : 핵심 기여. 문제 → 접근 → 결과 순서로, 결과는 수치로
 *   troubleshooting / retrospective : 선택 항목(없으면 섹션이 생기지 않음)
 */
window.PORTFOLIO = window.PORTFOLIO || {};

window.PORTFOLIO.projects = [
  {
    id: "sample-minimap",
    featured: true,
    title: "미니맵 시스템 개편 (작성 예시)",
    period: "2023.01 — 2024.06",
    company: "회사명 입력",
    team: "클라이언트 6인",
    role: "미니맵·월드맵 시스템 담당",
    engine: "Unreal Engine 5",
    platforms: "PC · Mobile",
    tags: ["UI", "최적화"],
    thumb: "",
    summary:
      "이 항목은 작성 형식을 보여 주는 예시입니다. 카드에는 이렇게 프로젝트를 한 문장으로 요약합니다.",
    metrics: [
      { label: "이동 시 히치", value: "—", note: "수치 입력" },
      { label: "핀 갱신 비용", value: "—", note: "수치 입력" },
    ],
    overview:
      "게임과 시스템이 무엇인지 2–3문장으로 소개하는 자리입니다. 어떤 장르의 게임이고, " +
      "그 안에서 본인이 어떤 포지션이었는지까지만 쓰면 충분합니다.",
    responsibilities: [
      "미니맵·월드맵 렌더링과 갱신 파이프라인 담당 (예시 항목)",
      "핀 스포닝·풀링 구조 설계 (예시 항목)",
      "관련 툴·디버그 뷰 제작 (예시 항목)",
    ],
    contributions: [
      {
        title: "핀 스포닝 구조 개편 — 오브젝트 풀링 도입",
        problem:
          "어떤 상황에서 어떤 문제가 있었는지 2–3줄로 씁니다. 예: 광역 이동 시 미니맵 핀이 " +
          "대량 생성·파괴되며 프레임 히치가 발생했다.",
        approach:
          "왜 이 방법을 골랐는지, 다른 대안과의 트레이드오프를 씁니다. 예: 매 프레임 생성 대신 " +
          "풀링과 화면 영역 기반 갱신으로 전환하고, 전체 리팩토링 대신 스포너 계층만 교체해 QA 범위를 줄였다.",
        result:
          "결과는 반드시 수치로. 예: 이동 시 히치 ○ms → ○ms, 핀 관련 GC 스파이크 제거. " +
          "아직 수치가 없으면 ‘측정값 입력’이라고 남겨 두세요.",
      },
      {
        title: "두 번째 핵심 기여 제목",
        problem: "문제 상황 입력.",
        approach: "접근과 선택 이유 입력.",
        result: "수치로 표현한 결과 입력.",
      },
    ],
    troubleshooting: {
      title: "가장 어려웠던 이슈 하나를 깊게",
      body:
        "재현 조건 → 원인 분석 과정 → 해결 순서로 서술하는 자리입니다. 기술 면접에서 " +
        "“이 이슈 이야기해 주세요”를 유도하는 섹션이므로, 분석 과정을 구체적으로 쓰는 것이 좋습니다.",
    },
    retrospective:
      "다시 한다면 달리할 점을 2–3문장으로. 짧을수록 좋습니다.",
    media: [
      { src: "", caption: "플레이 GIF 또는 스크린샷 — assets/images/에 넣고 경로를 적어 주세요" },
    ],
  },

  {
    id: "sample-second",
    featured: false,
    title: "두 번째 프로젝트 제목 입력",
    period: "2021.05 — 2022.12",
    company: "회사명 입력",
    team: "팀 구성 입력",
    role: "담당 역할 입력",
    engine: "엔진 입력",
    platforms: "플랫폼 입력",
    tags: ["게임플레이"],
    thumb: "",
    summary: "카드에 보일 한 줄 요약 입력. (샘플 카드 — data/projects.js에서 교체)",
    metrics: [],
    overview: "프로젝트 개요 입력.",
    responsibilities: ["담당 업무 입력"],
    contributions: [
      {
        title: "핵심 기여 제목 입력",
        problem: "문제 입력.",
        approach: "접근 입력.",
        result: "결과 입력.",
      },
    ],
    troubleshooting: null,
    retrospective: "",
    media: [],
  },
];
