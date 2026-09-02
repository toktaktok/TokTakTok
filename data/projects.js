/* 프로젝트 — 경력의 "담당 시스템", 프로젝트 카드, 상세 페이지가 이 파일 하나로 만들어집니다.
 *
 * 어디에 나오는지는 따로 표시하지 않고 데이터로 정해집니다
 *   · company가 data/career.js의 org와 글자까지 같으면 → 그 경력 행 아래 "담당 시스템" 목록
 *     (프로젝트 그리드에는 나오지 않음)
 *   · 그 외(개인·스터디·팀 프로젝트) → 프로젝트 그리드
 *   · 상세 내용(overview·responsibilities·contributions·troubleshooting·retrospective·media·metrics)이
 *     하나도 없으면 상세 페이지가 없는 것으로 봅니다 → 그리드에서는 이미지 없는 컴팩트 카드
 *     (기간·팀·역할·영상 표), 담당 시스템 목록에서는 링크 없는 한 줄
 *
 * 항목 설명
 *   id        : 상세 페이지 주소(project.html?id=...)에 쓰이는 고유 슬러그
 *   featured  : true면 그리드 맨 위에서 큰 카드로 표시(상세 내용이 있는 항목에서만 효과)
 *   company   : 회사명 — data/career.js의 org와 같아야 그 경력 아래로 들어감. 개인 프로젝트는 비움
 *   team/role : 팀 구성·역할. 컴팩트 카드의 표와 상세 페이지 facts에 쓰임
 *   video     : 플레이 영상 주소(유튜브 등). 컴팩트 카드에 "영상" 행이 생김
 *   tags      : 필터 버튼이 그리드에 있는 프로젝트의 태그로 자동 생성됨
 *   thumb     : 카드 썸네일 경로(assets/images/...). 비우면 캐릭터 자리 표시가 뜸(컴팩트 카드는 이미지 없음)
 *   media     : 상세 페이지 상단의 이미지/영상 목록. 스크린샷보다 플레이 GIF 권장
 *   metrics   : 핵심 수치. 아직 없으면 value를 "—" 로 두세요 — 지어내지 않기
 *   contributions : 핵심 기여. 문제 → 접근 → 결과 순서로, 결과는 수치로
 *   troubleshooting / retrospective : 선택 항목(없으면 섹션이 생기지 않음)
 */
window.PORTFOLIO = window.PORTFOLIO || {};

window.PORTFOLIO.projects = [
  /* ---- 회사 시스템 (작성 예시) — company가 경력의 org와 같아서 경력 아래로 들어갑니다 ---- */
  {
    id: "sample-minimap",
    title: "미니맵 시스템 개편 (작성 예시)",
    period: "2025.06 — 현재",
    company: "빅게임스튜디오",
    team: "클라이언트 6인",
    role: "미니맵·월드맵 시스템 담당",
    engine: "Unreal Engine 5",
    platforms: "PC · Mobile",
    tags: ["UI", "최적화"],
    thumb: "",
    summary:
      "담당 시스템 목록과 상세 페이지에 쓰이는 한 줄 요약 자리입니다. 무엇을 맡았는지 한 문장으로.",
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
    id: "sample-widget-plugin",
    title: "공용 위젯 플러그인 (작성 예시)",
    period: "2025.05 — 현재",
    company: "빅게임스튜디오",
    team: "클라이언트 6인",
    role: "공용 UI 위젯 유지보수",
    engine: "Unreal Engine 5",
    platforms: "PC · Mobile",
    tags: ["UI", "플러그인"],
    thumb: "",
    summary: "팀이 같이 쓰는 위젯 레이어를 맡았다면 이렇게 한 줄로. (작성 예시)",
    metrics: [],
    overview: "두 번째 회사 시스템의 개요 입력. 짧게 써도 상세 페이지가 생깁니다.",
    responsibilities: ["공용 스크롤·텍스트·버튼 위젯 유지보수 (예시 항목)"],
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

  /* ---- 개인·스터디 프로젝트 (작성 예시) — company 없음 → 프로젝트 그리드 ---- */
  {
    id: "sample-team-clone",
    featured: true,
    title: "팀 모작 프로젝트 (작성 예시 — 상세 있음)",
    period: "2024.05 — 2024.07",
    company: "",
    team: "6인",
    role: "이펙트·셰이더·카메라",
    engine: "자체 엔진 · DirectX 11",
    platforms: "PC",
    tags: ["팀 프로젝트", "셰이더"],
    thumb: "",
    video: "",
    summary: "상세 내용이 있는 개인·팀 프로젝트는 지금까지처럼 큰 카드와 상세 페이지로 나옵니다.",
    metrics: [],
    overview: "프로젝트 개요 입력. 어떤 게임을 왜 골랐고 팀에서 무엇을 맡았는지.",
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
    media: [{ src: "", caption: "플레이 영상 캡처 자리" }],
  },

  {
    id: "sample-solo",
    title: "개인 프로젝트 (작성 예시 — 컴팩트 카드)",
    period: "2024.03 — 2024.05",
    company: "",
    team: "개인",
    role: "전체",
    engine: "DirectX 11",
    tags: ["개인"],
    video: "",
    summary:
      "상세 내용을 하나도 적지 않으면 이런 컴팩트 카드가 됩니다. video에 유튜브 주소를 넣으면 " +
      "‘영상’ 행이 생깁니다.",
  },

  {
    id: "sample-unity",
    title: "Unity 2D 게임 (작성 예시 — 컴팩트 카드)",
    period: "2022.05 — 2022.12",
    company: "",
    team: "2인",
    role: "프로그래밍",
    engine: "Unity",
    tags: ["팀 프로젝트"],
    video: "",
    summary: "한 줄 요약 자리. 카드에는 이것과 위의 표만 들어갑니다.",
  },
];
