/* 데이터(data/*.js)를 읽어 페이지를 그립니다. 콘텐츠 수정은 data/ 쪽에서 하면 됩니다. */
(function () {
  "use strict";

  var P = window.PORTFOLIO || {};
  var profile = P.profile || {};
  var projects = P.projects || [];

  /* 회사 시스템 vs 개인 프로젝트 — 따로 표시하지 않고 데이터로 판정합니다.
     · company가 경력(data/career.js)의 org와 글자까지 같은 프로젝트는 그 경력 행 아래
       "담당 시스템"으로 들어가고, 프로젝트 그리드에는 나오지 않습니다.
     · 상세 페이지에 실을 내용(overview·responsibilities·contributions·troubleshooting·
       retrospective·media·metrics)이 하나도 없으면 상세 페이지로 가는 링크를 만들지 않고,
       그리드에서는 이미지 없는 컴팩트 카드(기간·팀·역할·영상)로 그립니다. */
  function hasDetail(p) {
    return !!(p.overview ||
      (p.responsibilities || []).length ||
      (p.contributions || []).length ||
      (p.troubleshooting && p.troubleshooting.body) ||
      p.retrospective ||
      (p.media || []).length ||
      (p.sections || []).length ||
      (p.metrics || []).length);
  }
  function isClaimed(p) {
    return !!p.company && (P.career || []).some(function (c) { return c.org === p.company; });
  }
  function systemsOf(c) {
    return projects.filter(function (p) { return !!c.org && p.company === c.org; });
  }
  function detailHref(p) { return "project.html?id=" + encodeURIComponent(p.id); }
  /* "https://youtu.be/abc" → "youtu.be/abc" — 링크 글자를 주소 그대로 보여 줄 때 */
  function linkLabel(url) { return String(url).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""); }

  /* ---------- helpers ---------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null && text !== "") node.textContent = text;
    return node;
  }

  /* 마스코트 캐릭터 — 사용자 제공 SVG.
     아이들 모션과 눈 추적을 위해 팔 / 몸통 / 눈을 그룹으로 나눠 리깅했습니다.
     stroke 두께는 원본 값 그대로 속성으로 유지. */
  var PIX_CHAR =
    '<g class="pix__arm pix__arm--r">' +
    '<rect class="pix__skin" stroke-width="2" x="108" y="36.749" width="41" height="31" rx="15"/>' +
    "</g>" +
    '<g class="pix__arm pix__arm--l">' +
    '<rect class="pix__skin" stroke-width="2" x="1.28931" y="46.5567" width="41" height="31" rx="15" transform="rotate(-20.7384 1.28931 46.5567)"/>' +
    "</g>" +
    '<g class="pix__torso">' +
    '<path class="pix__skin" stroke-width="2" d="M44 1H90C109.33 1 125 16.67 125 36V43C125 62.33 109.33 78 90 78H62C42.67 78 27 62.33 27 43V18C27 8.61116 34.6112 1 44 1Z"/>' +
    '<g class="pix__eyes">' +
    /* 좌/우 눈을 각각 .pix__eye-side로 감쌉니다 — 눈 추적이 고개 돌림을 흉내 낼 때
       이 그룹만 좌우로 옮겨 두 눈 "사이"를 좁힙니다. 눈 자체의 크기는 그대로입니다
       (예전엔 .pix__eyes 전체를 scaleX 해서 간격과 함께 눈까지 납작해졌습니다). */
    '<g class="pix__blink">' +
    '<g class="pix__eye-side pix__eye-side--l">' +
    '<rect class="pix__eye" x="55" y="13.749" width="11" height="29" rx="4"/>' +
    '<path class="pix__shine" d="M63.3827 16.3898C63.7349 16.4317 64 16.7303 64 17.0849V27.1142C64 27.885 62.9363 28.0898 62.6501 27.3742L58.4378 16.8434C58.2405 16.3502 58.6429 15.8256 59.1704 15.8884L63.3827 16.3898Z"/>' +
    "</g>" +
    '<g class="pix__eye-side pix__eye-side--r">' +
    '<rect class="pix__eye" x="89" y="12.749" width="11" height="31" rx="4"/>' +
    '<path class="pix__shine" d="M97.3827 15.3898C97.7349 15.4317 98 15.7303 98 16.0849V26.1142C98 26.885 96.9363 27.0898 96.6501 26.3742L92.4378 15.8434C92.2405 15.3502 92.6429 14.8256 93.1704 14.8884L97.3827 15.3898Z"/>' +
    "</g>" +
    "</g>" +
    /* 웃는 눈 — 뜬 눈과 맞바꿔 쓰는 호(弧). 기하는 뜬 눈에서 그대로 따왔고,
       기준은 둘 다 "실제로 칠해지는 잉크"입니다(round cap이 끝점 바깥으로
       선 두께의 절반=2씩 번지므로, 끝점을 그만큼 안쪽으로 당겨 보정):
       · 잉크 가로 폭 = 그 눈의 폭 11  → 끝점 x는 55+2 … 66-2 (왼쪽), 89+2 … 100-2 (오른쪽)
       · 잉크 아래끝 = 그 눈의 맨 아래  → 끝점 y는 42.749-2 (왼쪽), 43.749-2 (오른쪽)
       호는 반지름 3.5(= 끝점 사이 거리 7의 절반)인 정확한 반원. 2차 베지어로 그리면
       같은 폭에서 꼭짓점이 반원보다 높이 솟아 캐럿(^)처럼 뾰족해집니다. */
    '<g class="pix__eyes-smile">' +
    '<g class="pix__eye-side pix__eye-side--l">' +
    '<path class="pix__eye-smile" d="M57 40.749A3.5 3.5 0 0 1 64 40.749"/>' +
    "</g>" +
    '<g class="pix__eye-side pix__eye-side--r">' +
    '<path class="pix__eye-smile" d="M91 41.749A3.5 3.5 0 0 1 98 41.749"/>' +
    "</g>" +
    "</g></g>" +
    "</g>";

  /* 표정/동작 모듈 — css/site.css의 .pix--<이름> 클래스와 1:1 대응.
     mood: "neutral"(기본) | "smile" · anim: "idle"(기본) | "wave" | "travel".
     축을 생략(undefined)하면 그 축은 건드리지 않습니다. 새 모듈을 추가하면 아래 배열에도 등록. */
  var PIX_MOODS = ["smile"];
  var PIX_ANIMS = ["wave", "travel"];
  function setPixState(svg, state) {
    if (!svg || !state) return;
    if (state.mood !== undefined) {
      PIX_MOODS.forEach(function (m) { svg.classList.toggle("pix--" + m, state.mood === m); });
    }
    if (state.anim !== undefined) {
      PIX_ANIMS.forEach(function (a) { svg.classList.toggle("pix--" + a, state.anim === a); });
    }
  }

  /* viewBox 여백은 stroke + 팔 스윙 + 몸통 스트레치가 잘리지 않을 만큼만 */
  var PIX_SVG =
    '<svg class="pix" viewBox="-4 -5 158 89" aria-hidden="true">' + PIX_CHAR + "</svg>";

  function pixNode(kind) {
    var holder = el("div");
    holder.innerHTML = PIX_SVG;
    var svg = holder.firstChild;
    if (kind === "placeholder") svg.classList.add("pix--placeholder");
    return svg;
  }

  /* 캐릭터가 마우스 포인터를 따라봅니다. 포인터가 멈추면 서서히 정면으로 돌아옵니다.
     터치 기기나 prefers-reduced-motion 환경에서는 붙이지 않습니다.

     세 겹으로 따라갑니다 — 뒤로 갈수록 느리고 은근하게:
     1) 눈 이동   — 두 눈이 함께 포인터 쪽으로(.pix__eyes를 통째로 옮김).
     2) 눈 간격   — 옆을 볼수록 두 눈이 머리 중심선 쪽으로 모입니다. 머리를 세로축으로
        θ만큼 돌리면 앞면의 두 점은 화면에서 간격이 cos θ배로 줄고 동시에 (눈 깊이)·sin θ
        만큼 옆으로 밀리는데, 여기서 1)이 그 밀림, 2)가 그 cos θ에 해당합니다. 덕분에
        눈알만 굴리는 게 아니라 고개를 돌린 것으로 읽힙니다.
        좁히는 건 어디까지나 두 눈 "사이"입니다 — 각 눈은 제 크기 그대로 안쪽으로
        옮겨질 뿐이라, 눈 자체가 납작해지지 않습니다. 그래서 그룹을 scaleX 하지 않고
        좌/우 .pix__eye-side를 각각 반대 방향으로 translate 합니다.
     3) 몸 흔들림 — 히어로 언덕에 도킹해 있을 때만. 눈처럼 계속 붙어 다니지 않고,
        포인터가 화면 폭 기준 사각지대(SWAY_DEAD)를 벗어나야 비로소 알아채고 →
        SWAY_WAIT만큼 뜸을 들인 뒤 → 그 시점의 목표까지 SWAY_MOVE 동안 ease-in-out으로
        천천히 옮겨 갑니다. 눈이 즉각 반응하는 것과 대비되어, 고개는 바로 돌아가고
        몸은 한 박자 늦게 "그제서야" 따라오는 것처럼 읽힙니다.
        우하단 고정 도우미일 때는 하지 않습니다 — 화면 모서리와 말풍선에 붙어 있어
        몸만 움직이면 자리가 어긋나 보입니다.

     캐릭터는 스크롤로도 화면 안에서 움직이므로, 포인터가 멈춰 있어도 스크롤 때마다
     조준을 다시 계산합니다(마지막 포인터 위치 기준). */
  function trackEyes(svg) {
    var eyes = svg.querySelector(".pix__eyes");
    if (!eyes || !window.matchMedia) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var NEAR = 48;       // 이 거리(px) 안에서는 눈이 덜 떨리도록 감쇠
    var MAX_X = 7.5;     // 사용자 좌표 기준 최대 이동량
    var MAX_Y = 4.5;
    var SQUEEZE = 0.24;  // 끝까지 옆을 볼 때 두 눈 "간격"이 줄어드는 비율(= 1 - cos θ)

    /* 몸 흔들림 — 눈처럼 계속 따라다니지 않고 "알아채고 → 뜸 들이고 → 천천히 옮긴다"의
       3단계입니다. 아래 다섯 값이 그 성격 전부입니다. */
    var SWAY = 7;         // 최대치(CSS px)
    var SWAY_DEAD = 0.15; // 화면 폭의 이 비율 안쪽이면 아예 반응하지 않음(사각지대)
    var SWAY_SPAN = 0.45; // 사각지대 끝에서 여기까지 0 → SWAY로 커짐
    var SWAY_WAIT = 1000; // 사각지대를 벗어나고 이만큼(ms) 뜸을 들인 뒤에 움직이기 시작
    var SWAY_MOVE = 1200; // 목표까지 옮겨 가는 데 걸리는 시간(ms) — ease-in-out
    var SWAY_STEP = 1.5;  // 목표가 이만큼(px) 달라져야 새로 반응합니다(잔떨림 무시)

    /* 두 눈 중심(77.5, 28.25)의 viewBox 내 비율 */
    var CX = (77.5 + 4) / 158;
    var CY = (28.25 + 5) / 89;
    /* 고개를 돌리는 축 = 몸통 가로 중심, 그리고 각 눈의 중심(뜬 눈·웃는 눈 공통).
       각 눈은 이 축 쪽으로 (축까지 거리)×(1-cos θ)만큼 당겨집니다 — 둘을 합하면
       간격이 정확히 cos θ배가 되고, 눈 크기는 건드리지 않습니다. */
    var HEAD_CX = 76, EYE_L_CX = 60.5, EYE_R_CX = 94.5;
    var sides = [
      { nodes: svg.querySelectorAll(".pix__eye-side--l"), reach: HEAD_CX - EYE_L_CX },
      { nodes: svg.querySelectorAll(".pix__eye-side--r"), reach: HEAD_CX - EYE_R_CX }
    ];

    var aimX = 0, aimY = 0, curX = 0, curY = 0;
    var raf = 0, reaim = 0, host = null, ptrX = 0, ptrY = 0, seen = false;

    /* 몸 흔들림의 상태. want는 지금 포인터가 시키는 값, goal은 실제로 향하기로
       "정한" 값입니다 — 둘이 SWAY_STEP 넘게 벌어지면 armAt에 시각을 적어 두고,
       SWAY_WAIT가 지나야 비로소 goal을 갱신하고 moveAt부터 트윈을 시작합니다. */
    var curSway = 0, swayWant = 0, swayGoal = 0, swayFrom = 0;
    var armAt = 0, moveAt = 0;

    /* 도킹 여부는 .helper의 클래스로 봅니다. trackEyes가 불리는 시점엔 캐릭터가 아직
       .helper 안에 붙기 전이라, 처음 찾을 수 있을 때 찾아서 기억해 둡니다. */
    function docked() {
      if (!host && svg.closest) host = svg.closest(".helper");
      return !!host && host.classList.contains("helper--docked");
    }

    /* --ease-in-out(cubic-bezier(.65, 0, .35, 1))과 같은 곡선 — 비행(flyTo)과 같은 식 */
    function easeInOut(p) {
      return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    }

    function step() {
      raf = 0;
      curX += (aimX - curX) * 0.16;
      curY += (aimY - curY) * 0.16;

      /* 뜸 들이기가 끝났으면 그 순간의 목표를 확정하고 출발합니다 */
      var t = Date.now();
      if (armAt && t - armAt >= SWAY_WAIT) {
        armAt = 0;
        swayFrom = curSway;
        swayGoal = swayWant;
        moveAt = t;
      }
      if (moveAt) {
        var p = Math.min(1, (t - moveAt) / SWAY_MOVE);
        curSway = swayFrom + (swayGoal - swayFrom) * easeInOut(p);
        if (p >= 1) moveAt = 0;
      }

      eyes.style.transform =
        "translate(" + curX.toFixed(2) + "px," + curY.toFixed(2) + "px)";

      /* 옆을 볼수록(0 → 1) 두 눈을 축 쪽으로 당깁니다. 순수 translate라
         눈의 폭·높이는 그대로입니다 */
      var turn = SQUEEZE * Math.min(1, Math.abs(curX) / MAX_X);
      sides.forEach(function (side) {
        var d = (side.reach * turn).toFixed(2);
        for (var i = 0; i < side.nodes.length; i++) {
          side.nodes[i].style.transform = "translate(" + d + "px,0)";
        }
      });
      svg.style.setProperty("--pix-sway", curSway.toFixed(2) + "px");

      if (Math.abs(aimX - curX) > 0.01 || Math.abs(aimY - curY) > 0.01 ||
          armAt || moveAt) raf = requestAnimationFrame(step);
    }

    function nudge() {
      if (!raf) raf = requestAnimationFrame(step);
    }

    function aim() {
      if (!seen) return;
      var r = svg.getBoundingClientRect();
      if (!r.width) return;
      var dx = ptrX - (r.left + r.width * CX);
      var dy = ptrY - (r.top + r.height * CY);
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      /* 방향은 언제나 포인터 쪽. 코앞에서만 살짝 줄여 떨림을 막습니다. */
      var pull = Math.min(1, dist / NEAR);
      aimX = (dx / dist) * pull * MAX_X;
      aimY = (dy / dist) * pull * MAX_Y;
      /* 눈은 방향만 보지만, 몸은 실제 가로 거리에 비례해서 — 사각지대(SWAY_DEAD)를
         벗어난 만큼만 0에서부터 커집니다. 사각지대 안이거나 도킹 상태가 아니면 0 */
      var w = window.innerWidth || 1;
      var over = (Math.abs(dx) / w - SWAY_DEAD) / (SWAY_SPAN - SWAY_DEAD);
      swayWant = docked() ? (dx < 0 ? -1 : 1) * Math.max(0, Math.min(1, over)) * SWAY : 0;

      /* 정해 둔 목표에서 의미 있게 벌어졌을 때만 뜸 들이기를 시작합니다. 이미 재고
         있는 중이면 다시 시작하지 않습니다 — 포인터가 계속 움직여도 대기가 끝나면
         그 시점의 위치로 한 번에 출발합니다. 다시 원래 목표 근처로 돌아오면 취소 */
      if (Math.abs(swayWant - swayGoal) > SWAY_STEP) {
        if (!armAt) armAt = Date.now();
      } else {
        armAt = 0;
      }
      nudge();
    }

    /* 스크롤·리사이즈로 캐릭터가 화면 안에서 움직였을 때도 다시 조준 — 프레임당 한 번만 */
    function nudgeAim() {
      if (!reaim) reaim = requestAnimationFrame(function () { reaim = 0; aim(); });
    }

    window.addEventListener("pointermove", function (e) {
      ptrX = e.clientX;
      ptrY = e.clientY;
      seen = true;
      aim();
    }, { passive: true });
    window.addEventListener("scroll", nudgeAim, { passive: true });
    window.addEventListener("resize", nudgeAim, { passive: true });

    /* 창을 벗어나면 정면으로. 눈은 곧바로 돌아오고, 몸은 다른 목표와 똑같이
       뜸을 들였다가 천천히 제자리로 갑니다 */
    document.addEventListener("pointerleave", function () {
      aimX = aimY = 0;
      swayWant = 0;
      if (Math.abs(swayGoal) > SWAY_STEP) { if (!armAt) armAt = Date.now(); }
      else armAt = 0;
      nudge();
    });

    eyes.classList.add("is-tracking");
  }

  function mediaPlaceholder(label) {
    var box = el("div", "card__placeholder");
    box.appendChild(pixNode("placeholder"));
    box.appendChild(el("p", "card__placeholder-label", label || "이미지 추가"));
    return box;
  }

  /* 썸네일/미디어 공통: src가 없거나 로드에 실패하면 자리 표시로 대체 */
  function mediaBox(src, alt, eager) {
    var box = el("div", "card__media");
    if (src) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = alt || "";
      img.width = 1600;
      img.height = 1000;
      if (!eager) img.loading = "lazy";
      img.addEventListener("error", function () {
        box.replaceChildren(mediaPlaceholder("이미지를 찾을 수 없음 — 경로 확인"));
      });
      box.appendChild(img);
    } else {
      box.appendChild(mediaPlaceholder());
    }
    return box;
  }

  /* ---------- detail body · 섹션 본문 렌더러 ----------
     Notion에서 옮겨 온 상세 내용은 "문단 + 그림 + 인용 + 목록"이 섞인 순서 있는 흐름이라,
     sections[].body / sections[].items[].body 를 항목 배열로 받아 그 순서대로 그립니다.
       "문단"                       → <p> (**굵게**, `코드` 두 가지 인라인 표기만 지원)
       { h: "소제목" }               → <h4>
       { quote: ["줄", "줄"] }       → <blockquote> (줄바꿈 유지)
       { list: [...], ordered }     → <ul> / <ol>
       { img: "경로", caption }      → <figure> 한 장
       { imgs: [{src, caption}] }   → 나란히 놓는 그림 묶음(모바일에서는 한 열)
       { video: "유튜브 주소", caption, start } → 임베드 + 원본 링크
       { note: {title, body} }      → 옆글(예: "이후 개선 사항?")
       { table: [[항목, 값], ...] }  → 항목·값 표
     본문은 data/projects.js(직접 편집하는 파일)에서만 오므로 innerHTML을 씁니다 — profile.js와 같은 규칙. */
  function inline(text) {
    var t = String(text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return t
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function figureNode(src, caption) {
    var fig = el("figure", "detail__fig");
    if (src) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = caption || "";
      img.loading = "lazy";
      img.addEventListener("error", function () {
        fig.replaceChildren(mediaPlaceholder("이미지를 찾을 수 없음 — 경로 확인"));
      });
      fig.appendChild(img);
    } else {
      fig.appendChild(mediaPlaceholder());
    }
    if (caption) fig.appendChild(el("figcaption", null, caption));
    return fig;
  }

  /* youtu.be/ID · youtube.com/watch?v=ID → 임베드 주소. ?si= 같은 추적 파라미터는 버리고
     t= / start= (초)만 시작 위치로 넘깁니다. 유튜브가 아니면 링크만 남깁니다. */
  function youtubeEmbed(url, start) {
    var m = String(url).match(/(?:youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{6,})/);
    if (!m) return "";
    var t = start;
    if (t == null) {
      var tm = String(url).match(/[?&#](?:t|start)=(\d+)/);
      if (tm) t = tm[1];
    }
    return "https://www.youtube-nocookie.com/embed/" + m[1] + (t ? "?start=" + t : "");
  }

  function videoNode(url, caption, start) {
    var fig = el("figure", "detail__video");
    var src = youtubeEmbed(url, start);
    if (src) {
      var frame = document.createElement("iframe");
      frame.src = src;
      frame.title = caption || "플레이 영상";
      frame.loading = "lazy";
      frame.setAttribute("allow", "accelerometer; encrypted-media; picture-in-picture");
      frame.setAttribute("allowfullscreen", "");
      fig.appendChild(frame);
    }
    var cap = el("figcaption");
    if (caption) cap.appendChild(document.createTextNode(caption + " · "));
    var a = el("a", null, linkLabel(url) + " ↗");
    a.href = url;
    a.rel = "noreferrer";
    cap.appendChild(a);
    fig.appendChild(cap);
    return fig;
  }

  function renderBody(root, items) {
    (items || []).forEach(function (it) {
      if (typeof it === "string") {
        var p = el("p");
        p.innerHTML = inline(it);
        root.appendChild(p);
      } else if (it.h) {
        root.appendChild(el("h4", "detail__sub", it.h));
      } else if (it.quote) {
        var bq = el("blockquote", "detail__quote");
        bq.innerHTML = it.quote.map(inline).join("<br>");
        root.appendChild(bq);
      } else if (it.list) {
        var list = el(it.ordered ? "ol" : "ul", it.ordered ? "detail__ol" : "detail__list");
        it.list.forEach(function (x) {
          var li = el("li");
          li.innerHTML = inline(x);
          list.appendChild(li);
        });
        root.appendChild(list);
      } else if (it.img) {
        root.appendChild(figureNode(it.img, it.caption));
      } else if (it.imgs) {
        var row = el("div", "detail__row" + (it.small ? " detail__row--small" : ""));
        it.imgs.forEach(function (m) { row.appendChild(figureNode(m.src, m.caption)); });
        root.appendChild(row);
      } else if (it.video) {
        root.appendChild(videoNode(it.video, it.caption, it.start));
      } else if (it.note) {
        var aside = el("aside", "detail__note");
        if (it.note.title) aside.appendChild(el("h4", null, it.note.title));
        var np = el("p");
        np.innerHTML = inline(it.note.body);
        aside.appendChild(np);
        root.appendChild(aside);
      } else if (it.table) {
        var tb = el("table", "detail__kv");
        it.table.forEach(function (r) {
          var tr = el("tr");
          tr.appendChild(el("th", null, r[0]));
          var td = el("td");
          td.innerHTML = inline(r[1]);
          tr.appendChild(td);
          tb.appendChild(tr);
        });
        root.appendChild(tb);
      }
    });
  }

  /* ---------- shared chrome ---------- */

  function renderNav(backLink) {
    var nav = document.querySelector(".nav");
    if (!nav) return;

    var mark = el("a", "nav__mark", profile.handle || "portfolio");
    mark.href = "index.html";
    nav.appendChild(mark);

    /* 가운데 섹션 링크 — 상세 페이지에서는 index.html#… 로 돌아가게.
       학력·활동은 data/education.js가 비어 있으면 섹션과 함께 링크도 생기지 않음 */
    var prefix = backLink ? "index.html" : "";
    var linkBox = el("div", "nav__links");
    var items = [
      ["경력", "#career"],
      ["프로젝트", "#projects"],
      ["기술", "#skills"],
    ];
    if ((P.education || []).length) items.push(["학력·활동", "#education"]);
    items.forEach(function (it) {
      var a = el("a", null, it[0]);
      a.href = prefix + it[1];
      linkBox.appendChild(a);
    });
    nav.appendChild(linkBox);

    var cta;
    if (profile.resumeUrl) {
      cta = el("a", "nav__cta", "이력서 →");
      cta.href = profile.resumeUrl;
    } else {
      cta = el("a", "nav__cta", "연락 →");
      cta.href = backLink ? "index.html#contact" : "#contact";
    }
    nav.appendChild(cta);
  }

  function renderColophon() {
    var foot = document.querySelector(".colophon .wrap");
    if (!foot) return;
    var year = (profile.updated || "").slice(0, 4) || new Date().getFullYear();
    foot.appendChild(
      el(
        "p",
        null,
        (profile.handle || "") + " — " + (profile.role || "") + " 포트폴리오. " +
          "Pretendard Variable · JetBrains Mono로 조판. " +
          "정적 HTML, GitHub Pages 배포. 마지막 수정 " + (profile.updated || "—") + ". " +
          "© " + year + " " + (profile.handle || "")
      )
    );
  }

  /* ---------- index ---------- */

  /* 히어로 소개 블록 — 이름·직함 / 헤드라인 / 소개 / 메타가 하나의 세로 흐름.
     헤드라인만 마크업에 미리 있고(페이지의 유일한 h1), 나머지는 그 앞뒤로 채웁니다. */
  function renderHero() {
    var title = document.querySelector("[data-hero-title]");
    var copy = document.querySelector("[data-hero-copy]");
    if (!title && !copy) return;

    if (title) title.textContent = profile.headline || "";
    if (!copy) return;

    var i = 0;
    function reveal(node) {
      node.classList.add("reveal");
      node.style.setProperty("--i", String(i++));
      return node;
    }

    var who = (profile.name ? profile.name + " · " : "") + (profile.role || "");
    if (who) copy.insertBefore(reveal(el("p", "hero__kicker", who)), title);
    if (title) reveal(title);

    if (profile.intro) copy.appendChild(reveal(el("p", "hero__intro", profile.intro)));

    if (profile.meta && profile.meta.length) {
      var meta = el("p", "hero__meta");
      profile.meta.forEach(function (m) { meta.appendChild(el("span", null, m)); });
      copy.appendChild(reveal(meta));
    }
  }

  /* 하늘의 시계 — 분침·초침만, 한국 시간(UTC+9).

     보는 사람이 어느 시간대에 있든 늘 한국 시간을 가리켜야 하므로, 로컬 시간을 그대로
     쓰지 않고 UTC로 되돌린 뒤 +9시간을 더합니다(대한민국은 서머타임이 없어 연중 고정).
     인도(+5:30)처럼 30·45분 단위 시간대에서는 분침 위치까지 달라지기 때문에, 시침이
     없더라도 이 보정이 필요합니다.

     매 초 경계에 맞춰 한 칸씩(6°) 튑니다 — setInterval은 조금씩 밀려서 초를 건너뛰거나
     겹치므로, 남은 밀리초만큼만 기다리는 setTimeout을 매번 다시 겁니다. */
  function renderHeroClock() {
    var clock = document.querySelector("[data-clock]");
    if (!clock) return;
    var minHand = clock.querySelector(".clock__hand--min");
    var secHand = clock.querySelector(".clock__hand--sec");
    if (!minHand || !secHand) return;

    var KST_OFFSET_MIN = 9 * 60;

    function tick() {
      var now = new Date();
      var kst = new Date(now.getTime() + (now.getTimezoneOffset() + KST_OFFSET_MIN) * 60000);
      var sec = kst.getSeconds();
      var min = kst.getMinutes();
      secHand.style.rotate = sec * 6 + "deg";
      /* 분침은 초에 따라 조금씩 흐르게 — 정각에 한 번에 튀지 않습니다 */
      minHand.style.rotate = (min + sec / 60) * 6 + "deg";
      window.setTimeout(tick, 1000 - (now.getTime() % 1000));
    }
    tick();
  }

  function renderCareer() {
    var list = document.querySelector("[data-career]");
    if (!list) return;
    (P.career || []).forEach(function (c) {
      var row = el("div", "career__row");
      row.appendChild(el("p", "career__period", c.period || ""));
      var body = el("div");
      var head = el("p");
      head.appendChild(el("span", "career__org", c.org || ""));
      if (c.role) head.appendChild(el("span", "career__role", " — " + c.role));
      body.appendChild(head);
      if (c.note) body.appendChild(el("p", "career__note", c.note));
      var sys = systemsOf(c);
      if (sys.length) body.appendChild(systemsList(sys));
      row.appendChild(body);
      list.appendChild(row);
    });
  }

  /* 경력 행 안에 중첩되는 "담당 시스템" 목록 — 회사 → 시스템 위계.
     상세 내용이 있는 시스템은 행 전체가 상세 페이지 링크, 없으면 텍스트 행. */
  function systemsList(list) {
    var box = el("div", "systems");
    box.appendChild(el("p", "systems__label", "담당 시스템"));
    var ul = el("ul", "systems__list");
    list.forEach(function (p) {
      var li = el("li", "system");
      var linked = hasDetail(p);
      var row = el(linked ? "a" : "div", "system__link");
      if (linked) row.href = detailHref(p);

      var main = el("span", "system__main");
      main.appendChild(el("span", "system__title", p.title || p.id));
      if (p.summary) main.appendChild(el("span", "system__summary", p.summary));
      row.appendChild(main);

      var bits = [p.period, (p.tags || []).join(" · ")].filter(Boolean);
      if (bits.length || linked) {
        var aside = el("span", "system__aside");
        if (bits.length) aside.appendChild(el("span", "system__meta", bits.join("  ·  ")));
        if (linked) aside.appendChild(el("span", "system__more", "자세히 →"));
        row.appendChild(aside);
      }
      li.appendChild(row);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return box;
  }

  /* data/education.js가 비어 있으면 "학력·활동" 섹션 자체를 페이지에서 뗍니다
     (빈 헤딩만 남는 것보다 아예 없는 편이 나아서). */
  function renderEducation() {
    var section = document.querySelector(".section.education");
    if (!section) return;
    var items = P.education || [];
    if (!items.length) { section.remove(); return; }
    var wrap = section.querySelector("[data-education]");
    if (!wrap) return;
    var panel = el("div", "glass-panel");
    items.forEach(function (e) {
      var row = el("div", "edu__row");
      row.appendChild(el("p", "edu__period", e.period || ""));
      var body = el("div");
      var head = el("p");
      if (e.label) head.appendChild(el("span", "edu__label", e.label));
      head.appendChild(el("span", "edu__title", e.title || ""));
      body.appendChild(head);
      if (e.note) body.appendChild(el("p", "edu__note", e.note));
      row.appendChild(body);
      panel.appendChild(row);
    });
    wrap.appendChild(panel);
  }

  /* 카드 메타 줄의 태그 — 엔진 문자열에 이미 있는 말(예: "DirectX 11")은 한 번만 보이게 */
  function metaTags(p) {
    var engine = p.engine || "";
    return (p.tags || []).filter(function (t) { return engine.indexOf(t) === -1; }).join(" · ");
  }

  /* 상세 페이지가 없는 프로젝트(개인·스터디)의 카드 — 이미지 자리 대신 기간·팀·역할·영상 표.
     썸네일 없는 항목이 여럿일 때 자리 표시 캐릭터가 줄지어 반복되는 걸 막습니다. */
  function compactCard(p) {
    var card = el("article", "card card--compact");
    card.dataset.tags = (p.tags || []).join("|");

    card.appendChild(el("h3", "card__title", p.title || p.id));

    var metaBits = [p.engine, metaTags(p)].filter(Boolean);
    if (metaBits.length) card.appendChild(el("p", "card__meta", metaBits.join("  ·  ")));

    var dl = el("dl", "card__facts");
    function fact(label, value) {
      if (!value) return;
      dl.appendChild(el("dt", null, label));
      dl.appendChild(typeof value === "string" ? el("dd", null, value) : value);
    }
    fact("기간", p.period);
    fact("팀", p.team);
    fact("역할", p.role);
    if (p.video) {
      var dd = el("dd");
      var a = el("a", null, linkLabel(p.video) + " ↗");
      a.href = p.video;
      a.rel = "noreferrer";
      dd.appendChild(a);
      fact("영상", dd);
    }
    if (dl.childNodes.length) card.appendChild(dl);

    if (p.summary) card.appendChild(el("p", "card__summary", p.summary));
    return card;
  }

  function projectCard(p, wide) {
    if (!hasDetail(p)) return compactCard(p);
    var card = el("article", "card" + (wide ? " card--wide" : ""));
    card.dataset.tags = (p.tags || []).join("|");

    var mediaLink = el("a");
    mediaLink.href = "project.html?id=" + encodeURIComponent(p.id);
    mediaLink.setAttribute("aria-hidden", "true");
    mediaLink.tabIndex = -1;
    mediaLink.appendChild(mediaBox(p.thumb, "", wide));
    card.appendChild(mediaLink);

    var title = el("h3", "card__title");
    var titleLink = el("a", null, p.title || p.id);
    titleLink.href = "project.html?id=" + encodeURIComponent(p.id);
    title.appendChild(titleLink);
    card.appendChild(title);

    var metaBits = [p.period, p.engine, metaTags(p)].filter(Boolean);
    if (metaBits.length) card.appendChild(el("p", "card__meta", metaBits.join("  ·  ")));

    if (p.summary) card.appendChild(el("p", "card__summary", p.summary));

    var more = el("a", "card__link", "자세히 →");
    more.href = "project.html?id=" + encodeURIComponent(p.id);
    more.setAttribute("aria-label", (p.title || p.id) + " 자세히 보기");
    card.appendChild(more);

    return card;
  }

  function renderProjects() {
    var grid = document.querySelector("[data-projects]");
    var filterBar = document.querySelector("[data-filter]");
    if (!grid) return;

    /* 경력 행이 데려간(회사 시스템) 프로젝트는 여기 오지 않습니다 — 남은 것만, featured 먼저.
       남는 게 하나도 없으면 빈 그리드 대신 섹션과 네비 링크를 함께 뗍니다(학력·활동과 같은 규칙). */
    var pool = projects.filter(function (p) { return !isClaimed(p); });
    if (!pool.length) {
      var sec = document.getElementById("projects");
      if (sec) sec.remove();
      Array.prototype.forEach.call(
        document.querySelectorAll('.nav__links a[href$="#projects"]'),
        function (a) { a.remove(); }
      );
      return;
    }

    var ordered = pool.slice().sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

    ordered.forEach(function (p, idx) {
      grid.appendChild(projectCard(p, p.featured && idx === 0));
    });

    if (!filterBar) return;
    var tags = [];
    pool.forEach(function (p) {
      (p.tags || []).forEach(function (t) {
        if (tags.indexOf(t) === -1) tags.push(t);
      });
    });
    if (tags.length < 2) { filterBar.remove(); return; }

    var current = "*";
    function makeBtn(label, value) {
      var b = el("button", "filter__btn", label);
      b.type = "button";
      b.setAttribute("aria-pressed", value === current ? "true" : "false");
      b.addEventListener("click", function () {
        if (current === value) return;
        current = value;
        filterBar.querySelectorAll(".filter__btn").forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        grid.classList.add("is-fading");
        window.setTimeout(function () {
          grid.querySelectorAll(".card").forEach(function (cardNode) {
            var hit = value === "*" || (cardNode.dataset.tags || "").split("|").indexOf(value) !== -1;
            cardNode.classList.toggle("is-hidden", !hit);
          });
          grid.classList.remove("is-fading");
        }, 160);
      });
      return b;
    }

    filterBar.appendChild(makeBtn("전체", "*"));
    tags.forEach(function (t) { filterBar.appendChild(makeBtn(t, t)); });
  }

  function renderSkills() {
    var table = document.querySelector("[data-skills]");
    if (!table) return;
    (P.skills || []).forEach(function (g) {
      var tr = el("tr");
      var th = el("th", null, g.category || "");
      th.setAttribute("scope", "row");
      tr.appendChild(th);
      tr.appendChild(el("td", "spec__items", g.items || ""));
      tr.appendChild(el("td", "spec__note", g.note || ""));
      table.appendChild(tr);
    });
  }

  function renderContact() {
    var box = document.querySelector("[data-contact]");
    if (!box) return;

    if (profile.email) {
      var mail = el("a", "contact__mail", profile.email);
      mail.href = "mailto:" + profile.email;
      box.appendChild(mail);
    }

    var links = el("p", "contact__links");
    if (profile.github) {
      var gh = el("a", null, "github ↗");
      gh.href = profile.github;
      gh.rel = "noreferrer";
      links.appendChild(gh);
    }
    if (profile.resumeUrl) {
      var rs = el("a", null, "이력서 →");
      rs.href = profile.resumeUrl;
      links.appendChild(rs);
    }
    if (links.childNodes.length) box.appendChild(links);
  }

  /* ---------- project detail ---------- */

  function factItem(dl, label, value) {
    if (!value) return;
    var wrapNode = el("div");
    wrapNode.appendChild(el("dt", null, label));
    wrapNode.appendChild(el("dd", null, value));
    dl.appendChild(wrapNode);
  }

  function renderDetail() {
    var root = document.querySelector("[data-detail]");
    if (!root) return;

    var id = new URLSearchParams(window.location.search).get("id");
    var p = null;
    projects.forEach(function (x) { if (x.id === id) p = x; });

    if (!p) {
      var empty = el("div", "empty");
      empty.appendChild(pixNode("placeholder"));
      empty.appendChild(el("h1", "detail__title", "프로젝트를 찾을 수 없습니다"));
      var back = el("a", "detail__back", "← 프로젝트 목록으로");
      back.href = "index.html#projects";
      empty.appendChild(back);
      root.appendChild(empty);
      return;
    }

    document.title = (p.title || p.id) + " — " + (profile.handle || "portfolio");

    /* 회사 시스템이면 경력으로, 아니면 프로젝트 그리드로 — 온 곳으로 돌려보냅니다 */
    var fromCareer = isClaimed(p);
    var back2 = el("a", "detail__back", fromCareer ? "← 경력" : "← 프로젝트 목록");
    back2.href = fromCareer ? "index.html#career" : "index.html#projects";
    root.appendChild(back2);

    root.appendChild(el("h1", "detail__title", p.title || p.id));
    if (p.summary) root.appendChild(el("p", "detail__summary", p.summary));

    var facts = el("dl", "detail__facts");
    factItem(facts, "기간", p.period);
    factItem(facts, "회사", p.company);
    factItem(facts, "팀", p.team);
    factItem(facts, "역할", p.role);
    factItem(facts, "엔진", p.engine);
    factItem(facts, "플랫폼", p.platforms);
    if (facts.childNodes.length) root.appendChild(facts);

    /* 플레이 영상 — 유튜브면 임베드, 아니면 링크만 */
    if (p.video) root.appendChild(videoNode(p.video, "유튜브 링크"));

    if (p.metrics && p.metrics.length) {
      var met = el("p", "metrics");
      p.metrics.forEach(function (m) {
        var pending = !m.value || m.value === "—";
        var s = el("span", pending ? "metrics__pending" : null,
          m.label + " " + (m.value || "—") + (pending && m.note ? " (" + m.note + ")" : ""));
        met.appendChild(s);
      });
      root.appendChild(met);
    }

    if (p.media && p.media.length) {
      var mediaWrap = el("div", "detail__media");
      p.media.forEach(function (m) {
        var fig = el("figure");
        fig.appendChild(mediaBox(m.src, m.caption || p.title, true));
        if (m.caption) fig.appendChild(el("figcaption", null, m.caption));
        mediaWrap.appendChild(fig);
      });
      root.appendChild(mediaWrap);
    }

    function section(title) {
      var s = el("section", "detail__section");
      s.appendChild(el("h2", null, title));
      root.appendChild(s);
      return s;
    }

    if (p.overview) section("개요").appendChild(el("p", null, p.overview));

    if (p.responsibilities && p.responsibilities.length) {
      var ul = el("ul", "detail__list");
      p.responsibilities.forEach(function (r) { ul.appendChild(el("li", null, r)); });
      section("담당 업무").appendChild(ul);
    }

    if (p.contributions && p.contributions.length) {
      var cs = section("핵심 기여");
      p.contributions.forEach(function (c) {
        var block = el("article", "contrib");
        block.appendChild(el("h3", null, c.title || ""));
        var dl = el("dl");
        [["문제", c.problem], ["접근", c.approach], ["결과", c.result]].forEach(function (pair) {
          if (!pair[1]) return;
          var d = el("div");
          d.appendChild(el("dt", null, pair[0]));
          d.appendChild(el("dd", null, pair[1]));
          dl.appendChild(d);
        });
        block.appendChild(dl);
        cs.appendChild(block);
      });
    }

    /* Notion 상세처럼 제목이 있는 큰 단락들 — 단락마다 h2, 그 안의 항목은 h3 */
    (p.sections || []).forEach(function (s) {
      var sec = section(s.title || "");
      renderBody(sec, s.body);
      (s.items || []).forEach(function (item) {
        var block = el("article", "contrib");
        if (item.title) block.appendChild(el("h3", null, item.title));
        renderBody(block, item.body);
        sec.appendChild(block);
      });
    });

    if (p.troubleshooting && p.troubleshooting.body) {
      var ts = section("트러블슈팅 — " + (p.troubleshooting.title || ""));
      ts.appendChild(el("p", null, p.troubleshooting.body));
    }

    if (p.retrospective) section("회고").appendChild(el("p", null, p.retrospective));
  }

  /* ---------- helper · 우하단 도우미 + 말풍선 ---------- */

  function renderAssistant() {
    var conf = profile.assistant || {};
    var msgs = conf.messages || [];
    var sectionMsgs = conf.sectionMessages || {};
    if (conf.enabled === false || !msgs.length) return;

    var box = el("div", "helper");

    var bubble = el("div", "helper__bubble");
    bubble.setAttribute("role", "status");
    var closeBtn = el("button", "helper__close", "×");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "말풍선 닫기");
    /* innerHTML: sectionMessages/messages는 data/profile.js(직접 편집하는 파일)에서만
       오므로 링크(<a>) 사용을 위해 안전하게 그대로 씁니다. */
    var text = el("p");
    text.innerHTML = msgs[0];
    bubble.appendChild(closeBtn);
    bubble.appendChild(text);

    var charBtn = el("button", "helper__char");
    charBtn.type = "button";
    charBtn.setAttribute("aria-label", "도우미 — 누르면 다음 안내가 나옵니다");
    var charSvg = pixNode("assistant");
    charBtn.appendChild(charSvg);
    trackEyes(charSvg);

    /* .helper는 자리(fixed 우하단 ↔ absolute 들판)만 잡고, 안쪽 .helper__inner가
       도킹 전환 애니메이션(FLIP)의 transform을 전담합니다 — 둘을 한 엘리먼트에
       얹으면 위치 지정과 이동 애니메이션이 같은 속성을 두고 싸웁니다. */
    var inner = el("div", "helper__inner");
    inner.appendChild(bubble);
    inner.appendChild(charBtn);
    box.appendChild(inner);
    document.body.appendChild(box);

    var idx = 0;
    var pinned = false; // 캐릭터를 눌러 수동으로 넘기면 true — 이후 스크롤 자동전환 중단
    closeBtn.addEventListener("click", function () {
      box.classList.add("is-quiet");
    });
    charBtn.addEventListener("click", function () {
      if (box.classList.contains("is-quiet")) {
        box.classList.remove("is-quiet");
      } else {
        pinned = true;
        idx = (idx + 1) % msgs.length;
        text.innerHTML = msgs[idx];
      }
    });

    /* 들판 도킹 — 히어로 씬이 화면에 충분히 남아 있는 동안 캐릭터가 언덕 위에 서서
       웃으며 손을 흔들고(smile+wave 모듈), 씬을 지나치면 우하단 고정 도우미로
       복귀해 평소 아이들 모션으로 돌아갑니다.

       두 자리를 오갈 때는 순간이동이 아니라 캐릭터가 실제로 그 자리까지 걸어가는
       것처럼 보여야 합니다. 다만 비행은 언제나 화면 기준 고정(body) 컨텍스트에서
       하고, 씬 안(.hero__dock)으로는 도착하는 순간에만 옮깁니다. 먼저 옮겨 두면
       두 군데서 캐릭터가 사라집니다 — .hero__scene은 overflow: clip이라 씬 박스
       밖을 지나는 구간이 통째로 잘리고(도킹 시작점인 우하단은 대개 씬 아래),
       .hero__dock은 z-index 3이라 소개 카드(4) 뒤로 지나갑니다.

       착지점(.hero__dock)은 문서 흐름 안에 있어 비행 중 스크롤하면 화면상에서
       움직입니다. 그래서 CSS 트랜지션 대신 rAF로 매 프레임 착지점을 다시 재서
       따라갑니다 — 도착 순간에 튀지 않게. */
    var dock = document.querySelector("[data-dock]");
    var scene = document.querySelector(".hero__scene");
    var docked = null;
    var flight = null;
    var canFly = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    function settleState(state) {
      setPixState(charSvg, state
        ? { mood: "smile", anim: "wave" }
        : { mood: "neutral", anim: "idle" });
    }

    /* 비행 시간은 css의 --dur-travel 하나만 보고 갑니다 */
    function travelMs() {
      var v = getComputedStyle(document.documentElement).getPropertyValue("--dur-travel").trim();
      var n = parseFloat(v);
      if (!n) return 820;
      return /ms$/.test(v) ? n : n * 1000;
    }

    function cancelFlight() {
      if (!flight) return;
      cancelAnimationFrame(flight.raf);
      flight = null;
      inner.style.transform = "";
      inner.style.transformOrigin = "";
      charSvg.style.removeProperty("--pix-lean");
      box.classList.remove("is-travelling");
    }

    function placeAt(state) {
      box.classList.toggle("helper--docked", !!state);
      var want = state ? dock : document.body;
      if (box.parentNode !== want) want.appendChild(box);
    }

    /* 도킹 자리에서 캐릭터가 놓일 위치를, 최종 부모/클래스로 잠깐 붙여 재고 되돌립니다
       (같은 프레임 안에서 끝나므로 화면에는 안 보임). 반환값은 .hero__dock 앵커
       기준 상대 오프셋 — 비행 중 앵커가 스크롤로 움직여도 따라갈 수 있게. */
    function measureDockSlot() {
      var parent = box.parentNode, next = box.nextSibling;
      var wasDocked = box.classList.contains("helper--docked");
      box.classList.add("helper--docked");
      dock.appendChild(box);
      var c = charBtn.getBoundingClientRect(), a = dock.getBoundingClientRect();
      box.classList.toggle("helper--docked", wasDocked);
      if (parent) parent.insertBefore(box, next);
      return { dx: c.left - a.left, dy: c.top - a.top, w: c.width };
    }

    function setDocked(state) {
      if (state === docked) return;
      var entering = docked !== null; // 첫 판정은 등장 애니메이션 없이 바로 배치
      /* 아직 비행 중이라면 그 순간의 화면상 위치가 그대로 잡히므로,
         전환이 겹쳐도 캐릭터는 튀지 않고 지금 있는 자리에서 이어서 갑니다. */
      var first = entering && canFly ? charBtn.getBoundingClientRect() : null;
      docked = state;

      if (!first || !first.width) {
        cancelFlight();
        placeAt(state);
        box.classList.remove("is-in");
        settleState(state);
        if (entering) requestAnimationFrame(function () { box.classList.add("is-in"); });
        return;
      }
      flyTo(first, state);
    }

    function flyTo(first, state) {
      cancelFlight();

      // 도킹이면 착지 오프셋을 먼저 재 둡니다(아직 옮기지는 않음)
      var slot = state ? measureDockSlot() : null;
      placeAt(false); // 비행은 잘리지 않고 항상 맨 위에 오는 fixed 컨텍스트에서

      inner.style.transform = "none";
      var base = charBtn.getBoundingClientRect();   // 비행 컨텍스트에서의 제자리
      var frame = inner.getBoundingClientRect();
      if (!base.width) { placeAt(state); settleState(state); return; }

      /* 기준점을 캐릭터의 좌상단에 두면 말풍선까지 함께 실린 채로도
         캐릭터가 정확히 원하는 좌표에 놓입니다(기준점이 박스 중앙이면 어긋남). */
      inner.style.transformOrigin =
        (base.left - frame.left) + "px " + (base.top - frame.top) + "px";

      function target() {
        if (!slot) return { left: base.left, top: base.top, w: base.width };
        var a = dock.getBoundingClientRect();
        return { left: a.left + slot.dx, top: a.top + slot.dy, w: slot.w };
      }

      /* 진행도 e(0=출발, 1=도착)에 해당하는 위치로 옮겨 놓습니다 */
      function applyAt(e) {
        var t = target();
        var x = first.left + (t.left - first.left) * e - base.left;
        var y = first.top + (t.top - first.top) * e - base.top;
        var s = (first.width + (t.w - first.width) * e) / base.width;
        inner.style.transform =
          "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px) scale(" + s.toFixed(4) + ")";
      }

      charSvg.style.setProperty("--pix-lean", (target().left < first.left ? -5 : 5) + "deg");
      box.classList.add("is-travelling");
      box.classList.add("is-in");
      setPixState(charSvg, { mood: "smile", anim: "travel" });

      /* 출발 위치를 지금 당장(동기적으로) 찍어 둡니다. setDocked는 이미 rAF 콜백
         안에서 불리므로 아래 requestAnimationFrame(step)은 다음 프레임에야 돕니다.
         그 사이 이번 프레임이 transform 없이 그려지면 캐릭터가 한 프레임 동안
         도착지(우하단)에 찍혔다가 되돌아오는 것처럼 튑니다. */
      applyAt(0);

      var token = {}, dur = travelMs(), t0 = 0;

      function step(now) {
        if (!flight || flight.token !== token) return;
        if (!t0) t0 = now;
        var p = Math.min(1, (now - t0) / dur);
        /* --ease-in-out(cubic-bezier(.65, 0, .35, 1))과 같은 곡선 */
        var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        applyAt(e);

        if (p < 1) { flight.raf = requestAnimationFrame(step); return; }
        flight = null;
        inner.style.transform = "";
        inner.style.transformOrigin = "";
        charSvg.style.removeProperty("--pix-lean");
        box.classList.remove("is-travelling");
        placeAt(state);
        settleState(state);
      }

      flight = { token: token, raf: requestAnimationFrame(step) };
    }

    /* 스크롤해서 섹션이 화면 위 40% 지점을 지나면 그 섹션 문구로 자동 전환.
       사용자가 캐릭터를 눌러 직접 고른 뒤(pinned)에는 건드리지 않습니다.
       IntersectionObserver의 얇은 트리거 밴드는 순간이동성 스크롤(예: 테스트의
       scrollIntoView, 앵커 점프)에서 스냅샷 사이로 건너뛰어 버릴 수 있어서,
       표준적인 scroll + rAF 스로틀 방식으로 매번 실제 위치를 다시 잽니다. */
    var sectionList = Array.prototype.slice.call(document.querySelectorAll(".section[id]"));
    var shown = null;
    var raf = 0;
    function onFrame() {
      raf = 0;
      if (dock && scene) {
        var r = scene.getBoundingClientRect();
        setDocked(r.bottom > window.innerHeight * 0.45 && r.top < window.innerHeight);
      }
      if (!pinned && sectionList.length) {
        var line = window.innerHeight * 0.4;
        var current = null;
        sectionList.forEach(function (s) {
          if (s.getBoundingClientRect().top <= line) current = s;
        });
        if (current) {
          var msg = sectionMsgs[current.id];
          if (msg && current.id !== shown) {
            shown = current.id;
            text.innerHTML = msg;
          }
        }
      }
    }
    function nudgeFrame() {
      if (!raf) raf = requestAnimationFrame(onFrame);
    }
    window.addEventListener("scroll", nudgeFrame, { passive: true });
    window.addEventListener("resize", nudgeFrame, { passive: true });
    onFrame(); // 새로고침이 페이지 중간(앵커)에서 시작되는 경우 + 초기 도킹 판정

    window.setTimeout(function () { box.classList.add("is-in"); }, docked !== null ? 350 : 900);
  }

  /* ---------- boot ---------- */

  var isDetail = document.body.dataset.page === "project";
  renderNav(isDetail);
  if (isDetail) {
    renderDetail();
  } else {
    renderHero();
    renderHeroClock();
    renderCareer();
    renderProjects();
    renderSkills();
    renderEducation();
    renderContact();
  }
  renderColophon();
  renderAssistant();
})();
