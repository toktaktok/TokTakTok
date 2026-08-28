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

  /* 마스코트 캐릭터 — 사용자 제공 SVG 기반(우리 코드라서 innerHTML 사용) */
  var PIX_CHAR =
    '<path class="pix__skin" d="M518.128 330.932C500.521 337.144 482.95 330.505 478.265 317.228C473.581 303.952 483.094 287.755 500.702 281.542C518.309 275.33 535.881 281.97 540.565 295.247C545.249 308.523 535.735 324.72 518.128 330.932Z"/>' +
    '<path class="pix__white" d="M535.817 337.201C553.255 321.797 576.812 321.145 588.58 334.468C600.349 347.791 596.794 371.087 579.356 386.49C561.918 401.894 538.361 402.546 526.593 389.223C514.824 375.9 518.379 352.604 535.817 337.201Z"/>' +
    '<path class="pix__skin" d="M605 200C654.726 200 695 239.867 695 289C695 338.133 654.726 378 605 378C555.274 378 515 338.133 515 289C515 239.867 555.274 200 605 200Z"/>' +
    '<path class="pix__white" d="M678.953 330.289C705.91 320.616 733.32 330.552 740.785 351.353C748.249 372.153 733.412 397.251 706.455 406.925C679.498 416.599 652.088 406.662 644.623 385.861C637.159 365.06 651.997 339.963 678.953 330.289Z"/>' +
    '<g class="pix__blink">' +
    '<path class="pix__eye" d="M617 254C617 270.569 612.667 284 604 284C595.333 284 591 270.569 591 254C591 237.431 595.333 224 604 224C612.667 224 617 237.431 617 254Z"/>' +
    '<path class="pix__eye" d="M659 254C659 270.569 654.667 284 646 284C637.333 284 633 270.569 633 254C633 237.431 637.333 224 646 224C654.667 224 659 237.431 659 254Z"/>' +
    '<path class="pix__shine" d="M613 243.5C613 250.404 610.5 256 605.5 256C600.5 256 598 250.404 598 243.5C598 236.596 600.5 231 605.5 231C610.5 231 613 236.596 613 243.5Z"/>' +
    '<path class="pix__shine" d="M654 243.5C654 250.404 651.333 256 646 256C640.667 256 638 250.404 638 243.5C638 236.596 640.667 231 646 231C651.333 231 654 236.596 654 243.5Z"/>' +
    "</g>" +
    '<path class="pix__skin" d="M719.024 301.643C697.582 303.616 679.692 291.229 678.191 274.918C676.69 258.606 692.019 243.162 713.46 241.189C734.902 239.215 752.793 251.603 754.294 267.915C755.795 284.226 740.465 299.67 719.024 301.643Z"/>';

  /* 히어로 패널 — 블루 배경 + 옐로/화이트 버스트 + 캐릭터 (원본 레퍼런스 구성) */
  var PIX_HERO =
    '<svg class="pix" viewBox="0 0 420 330" role="img" aria-label="마스코트 캐릭터 — 파란 패널 위 오렌지 캐릭터와 노란 버스트">' +
    '<rect class="pix__bg" x="0" y="0" width="420" height="330"/>' +
    '<polygon class="pix__burst-w" points="328.8,125.0 273.1,171.9 346.9,225.3 248.2,212.4 294.7,335.7 209.1,223.3 163.4,380.5 175.8,214.0 41.2,305.5 148.6,190.8 20.5,172.2 137.6,149.4 86.3,76.8 162.6,107.3 176.2,37.5 212.8,99.3 276.4,39.5 249.2,130.6"/>' +
    '<polygon class="pix__burst-y" points="375.9,188.5 253.1,191.9 301.4,269.8 231.2,227.0 212.3,283.4 186.0,233.8 136.0,261.4 153.0,202.6 67.5,200.3 154.5,161.8 51.3,89.6 176.8,136.9 132.4,-4.4 203.7,125.6 256.6,1.3 236.9,126.8 325.9,89.7 267.4,153.7"/>' +
    '<g transform="translate(-436.8 -151.7) scale(1.05)">' + PIX_CHAR + "</g>" +
    "</svg>";

  var PIX_PLAIN =
    '<svg class="pix" viewBox="472 194 288 221" role="img" aria-label="마스코트 캐릭터">' + PIX_CHAR + "</svg>";

  function pixNode(kind) {
    var holder = el("div");
    holder.innerHTML = kind === "hero" ? PIX_HERO : PIX_PLAIN;
    var svg = holder.firstChild;
    if (kind === "placeholder") {
      svg.classList.add("pix--placeholder");
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("role");
      svg.removeAttribute("aria-label");
    }
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

    var art = el("div", "hero__art");
    art.appendChild(pixNode("hero"));
    art.classList.add("reveal");
    art.style.setProperty("--i", String(i++));

    hero.appendChild(left);
    hero.appendChild(art);
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
})();
