/* 데이터(data/*.js)를 읽어 페이지를 그립니다. 콘텐츠 수정은 data/ 쪽에서 하면 됩니다. */
(function () {
  "use strict";

  var P = window.PORTFOLIO || {};
  var profile = P.profile || {};
  var projects = P.projects || [];

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
    '<g class="pix__blink">' +
    '<rect class="pix__eye" x="55" y="13.749" width="11" height="29" rx="4"/>' +
    '<path class="pix__shine" d="M63.3827 16.3898C63.7349 16.4317 64 16.7303 64 17.0849V27.1142C64 27.885 62.9363 28.0898 62.6501 27.3742L58.4378 16.8434C58.2405 16.3502 58.6429 15.8256 59.1704 15.8884L63.3827 16.3898Z"/>' +
    '<rect class="pix__eye" x="89" y="12.749" width="11" height="31" rx="4"/>' +
    '<path class="pix__shine" d="M97.3827 15.3898C97.7349 15.4317 98 15.7303 98 16.0849V26.1142C98 26.885 96.9363 27.0898 96.6501 26.3742L92.4378 15.8434C92.2405 15.3502 92.6429 14.8256 93.1704 14.8884L97.3827 15.3898Z"/>' +
    "</g></g>" +
    '<path class="pix__mouth" d="M67 52 Q77.5 61 88 52"/>' +
    "</g>";

  /* 표정/동작 모듈 — css/site.css의 .pix--<이름> 클래스와 1:1 대응.
     mood: "neutral"(기본) | "smile" · anim: "idle"(기본) | "wave".
     축을 생략(undefined)하면 그 축은 건드리지 않습니다. 새 모듈을 추가하면 아래 배열에도 등록. */
  var PIX_MOODS = ["smile"];
  var PIX_ANIMS = ["wave"];
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

  /* 눈이 마우스 포인터를 따라갑니다. 포인터가 멈추면 서서히 정면으로 돌아옵니다.
     터치 기기나 prefers-reduced-motion 환경에서는 붙이지 않습니다. */
  function trackEyes(svg) {
    var eyes = svg.querySelector(".pix__eyes");
    if (!eyes || !window.matchMedia) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var NEAR = 48;     // 이 거리(px) 안에서는 눈이 덜 떨리도록 감쇠
    var MAX_X = 3.4;   // 사용자 좌표 기준 최대 이동량
    var MAX_Y = 2.2;
    /* 두 눈 중심(77.5, 28.25)의 viewBox 내 비율 */
    var CX = (77.5 + 4) / 158;
    var CY = (28.25 + 5) / 89;

    var aimX = 0, aimY = 0, curX = 0, curY = 0, raf = 0;

    function step() {
      raf = 0;
      curX += (aimX - curX) * 0.16;
      curY += (aimY - curY) * 0.16;
      eyes.style.transform = "translate(" + curX.toFixed(2) + "px," + curY.toFixed(2) + "px)";
      if (Math.abs(aimX - curX) > 0.01 || Math.abs(aimY - curY) > 0.01) raf = requestAnimationFrame(step);
    }

    function nudge() {
      if (!raf) raf = requestAnimationFrame(step);
    }

    window.addEventListener("pointermove", function (e) {
      var r = svg.getBoundingClientRect();
      if (!r.width) return;
      var dx = e.clientX - (r.left + r.width * CX);
      var dy = e.clientY - (r.top + r.height * CY);
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      /* 방향은 언제나 포인터 쪽. 코앞에서만 살짝 줄여 떨림을 막습니다. */
      var pull = Math.min(1, dist / NEAR);
      aimX = (dx / dist) * pull * MAX_X;
      aimY = (dy / dist) * pull * MAX_Y;
      nudge();
    }, { passive: true });

    /* 창을 벗어나면 정면으로 */
    document.addEventListener("pointerleave", function () {
      aimX = aimY = 0;
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
          "Pretendard Variable · IBM Plex Mono로 조판. " +
          "정적 HTML, GitHub Pages 배포. 마지막 수정 " + (profile.updated || "—") + ". " +
          "© " + year + " " + (profile.handle || "")
      )
    );
  }

  /* ---------- index ---------- */

  function renderHero() {
    var srTitle = document.querySelector("[data-hero-title]");
    var marquee = document.querySelector("[data-marquee]");
    var card = document.querySelector("[data-hero-card]");
    if (!srTitle && !marquee && !card) return;

    var headline = profile.headline || "";
    if (srTitle) srTitle.textContent = headline;

    /* 마퀴 — 같은 문구를 8번(= 동일한 절반 2개) 이어붙이고 translateX(-50%) 루프.
       절반이 서로 동일해야 이음새 없이 무한히 도는 것처럼 보입니다. */
    if (marquee && headline) {
      var track = el("div", "hero__marquee-track");
      for (var r = 0; r < 8; r++) track.appendChild(el("span", null, headline + " /"));
      marquee.appendChild(track);
    }

    if (card) {
      var i = 0;
      function reveal(node) {
        node.classList.add("reveal");
        node.style.setProperty("--i", String(i++));
        return node;
      }

      card.appendChild(reveal(el("p", "hero__kicker",
        (profile.name ? profile.name + " · " : "") + (profile.role || ""))));

      if (profile.intro) card.appendChild(reveal(el("p", "hero__intro", profile.intro)));

      if (profile.meta && profile.meta.length) {
        var meta = el("p", "hero__meta");
        profile.meta.forEach(function (m) { meta.appendChild(el("span", null, m)); });
        card.appendChild(reveal(meta));
      }
    }
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
      row.appendChild(body);
      list.appendChild(row);
    });
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

  function projectCard(p, wide) {
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

    var metaBits = [p.period, p.engine, (p.tags || []).join(" · ")].filter(Boolean);
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

    var ordered = projects.slice().sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

    ordered.forEach(function (p, idx) {
      grid.appendChild(projectCard(p, p.featured && idx === 0));
    });

    if (!filterBar) return;
    var tags = [];
    projects.forEach(function (p) {
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

    var back2 = el("a", "detail__back", "← 프로젝트 목록");
    back2.href = "index.html#projects";
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

    box.appendChild(bubble);
    box.appendChild(charBtn);
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
       복귀해 평소 아이들 모션으로 돌아갑니다. */
    var dock = document.querySelector("[data-dock]");
    var scene = document.querySelector(".hero__scene");
    var docked = null;
    function setDocked(state) {
      if (state === docked) return;
      var entering = docked !== null; // 첫 판정은 등장 애니메이션 없이 바로 배치
      docked = state;
      box.classList.remove("is-in");
      if (state) {
        box.classList.add("helper--docked");
        dock.appendChild(box);
        setPixState(charSvg, { mood: "smile", anim: "wave" });
      } else {
        box.classList.remove("helper--docked");
        document.body.appendChild(box);
        setPixState(charSvg, { mood: "neutral", anim: "idle" });
      }
      if (entering) {
        requestAnimationFrame(function () { box.classList.add("is-in"); });
      }
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
    renderCareer();
    renderProjects();
    renderSkills();
    renderEducation();
    renderContact();
  }
  renderColophon();
  renderAssistant();
})();
