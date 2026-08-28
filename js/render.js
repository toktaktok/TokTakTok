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

  function frag() {
    return document.createDocumentFragment();
  }

  /* 마스코트 캐릭터 — 사용자 제공 SVG(파란 블롭). stroke 두께는 원본 그대로 속성으로 유지 */
  var PIX_CHAR =
    '<rect class="pix__skin" stroke-width="2" x="117.375" y="45.8779" width="41" height="31" rx="15"/>' +
    '<rect class="pix__skin" stroke-width="2" x="-3.33569" y="61.6856" width="41" height="31" rx="15" transform="rotate(-20.7384 -3.33569 61.6856)"/>' +
    '<path class="pix__white" stroke-width="4" d="M38.8462 82.5753C48.6193 73.9424 61.5458 73.7795 67.8667 80.9353C74.1874 88.0911 72.4297 100.898 62.6567 109.531C52.8837 118.163 39.9578 118.327 33.6368 111.172C27.3159 104.016 29.0732 91.2082 38.8462 82.5753Z"/>' +
    '<path class="pix__skin" stroke-width="2" d="M30.0615 5.75391C30.2032 2.88964 32.7198 0.730823 35.5723 1.02734L97.9941 7.51758C115.827 9.37169 129.375 24.4016 129.375 42.3301V54.3203C129.375 75.7169 110.346 92.1059 89.1855 88.9336L57.749 84.2207C39.9639 81.5543 27.0945 65.8429 27.9814 47.8809L30.0615 5.75391Z"/>' +
    '<g class="pix__blink">' +
    '<rect class="pix__eye" x="73.375" y="13.8779" width="11" height="29" rx="4"/>' +
    '<rect class="pix__eye" x="107.375" y="19.8779" width="11" height="31" rx="4"/>' +
    '<path class="pix__shine" d="M81.7577 16.5187C82.1099 16.5607 82.375 16.8592 82.375 17.2138V27.2431C82.375 28.0139 81.3113 28.2187 81.0251 27.5031L76.8128 16.9723C76.6155 16.4791 77.0179 15.9545 77.5454 16.0173L81.7577 16.5187Z"/>' +
    '<path class="pix__shine" d="M115.758 22.5187C116.11 22.5607 116.375 22.8592 116.375 23.2138V33.2431C116.375 34.0139 115.311 34.2187 115.025 33.5031L110.813 22.9723C110.615 22.4791 111.018 21.9545 111.545 22.0173L115.758 22.5187Z"/>' +
    "</g>" +
    '<path class="pix__white" d="M98.3485 97.7729C97.2586 89.5607 103.032 82.0198 111.245 80.9298L139.497 77.1802C149.078 75.9086 157.876 82.6447 159.147 92.2257L159.345 93.7127C160.507 102.472 154.348 110.516 145.589 111.679L108.91 116.547C104.53 117.128 100.509 114.048 99.9273 109.669L98.3485 97.7729Z"/>';

  var PIX_SVG =
    '<svg class="pix" viewBox="-6 -1 168 122" aria-hidden="true">' + PIX_CHAR + "</svg>";

  function pixNode(kind) {
    var holder = el("div");
    holder.innerHTML = PIX_SVG;
    var svg = holder.firstChild;
    if (kind === "placeholder") svg.classList.add("pix--placeholder");
    return svg;
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
          "Space Grotesk · IBM Plex Sans KR · IBM Plex Mono로 조판. " +
          "정적 HTML, GitHub Pages 배포. 마지막 수정 " + (profile.updated || "—") + ". " +
          "© " + year + " " + (profile.handle || "")
      )
    );
  }

  /* ---------- index ---------- */

  function renderHero() {
    var hero = document.querySelector(".hero");
    if (!hero) return;

    var left = el("div");
    var i = 0;

    function reveal(node) {
      node.classList.add("reveal");
      node.style.setProperty("--i", String(i++));
      return node;
    }

    left.appendChild(reveal(el("p", "hero__kicker",
      (profile.name ? profile.name + " · " : "") + (profile.role || ""))));

    left.appendChild(reveal(el("h1", "hero__title", profile.headline || "")));

    if (profile.intro) left.appendChild(reveal(el("p", "hero__intro", profile.intro)));

    if (profile.meta && profile.meta.length) {
      var meta = el("p", "hero__meta");
      profile.meta.forEach(function (m) { meta.appendChild(el("span", null, m)); });
      left.appendChild(reveal(meta));
    }

    hero.appendChild(left);
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
    if (conf.enabled === false || !msgs.length) return;

    var box = el("div", "helper");

    var bubble = el("div", "helper__bubble");
    bubble.setAttribute("role", "status");
    var closeBtn = el("button", "helper__close", "×");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "말풍선 닫기");
    var text = el("p", null, msgs[0]);
    bubble.appendChild(closeBtn);
    bubble.appendChild(text);

    var charBtn = el("button", "helper__char");
    charBtn.type = "button";
    charBtn.setAttribute("aria-label", "도우미 — 누르면 다음 안내가 나옵니다");
    charBtn.appendChild(pixNode("assistant"));

    box.appendChild(bubble);
    box.appendChild(charBtn);
    document.body.appendChild(box);

    var idx = 0;
    closeBtn.addEventListener("click", function () {
      box.classList.add("is-quiet");
    });
    charBtn.addEventListener("click", function () {
      if (box.classList.contains("is-quiet")) {
        box.classList.remove("is-quiet");
      } else {
        idx = (idx + 1) % msgs.length;
        text.textContent = msgs[idx];
      }
    });

    window.setTimeout(function () { box.classList.add("is-in"); }, 900);
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
    renderContact();
  }
  renderColophon();
  renderAssistant();
})();
