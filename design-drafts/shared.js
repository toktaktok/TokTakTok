/* 3개 시안이 공유하는 마스코트 SVG + 리그(호흡/팔스윙/깜빡임) + 눈 추적 + 도우미 로직.
   js/render.js의 동일 로직을 시안 페이지에서 재사용할 수 있도록 그대로 옮긴 것입니다. */
(function () {
  "use strict";

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
    "</g></g></g>";

  var PIX_SVG = '<svg class="pix" viewBox="-4 -5 158 89" aria-hidden="true">' + PIX_CHAR + "</svg>";

  function mountMascot(el, placeholder) {
    el.innerHTML = PIX_SVG;
    var svg = el.firstChild;
    if (placeholder) svg.classList.add("pix--placeholder");
    return svg;
  }
  window.mountMascot = mountMascot;

  function trackEyes(svg) {
    var eyes = svg.querySelector(".pix__eyes");
    if (!eyes || !window.matchMedia) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var NEAR = 48, MAX_X = 3.4, MAX_Y = 2.2;
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
    function nudge() { if (!raf) raf = requestAnimationFrame(step); }

    window.addEventListener("pointermove", function (e) {
      var r = svg.getBoundingClientRect();
      if (!r.width) return;
      var dx = e.clientX - (r.left + r.width * CX);
      var dy = e.clientY - (r.top + r.height * CY);
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var pull = Math.min(1, dist / NEAR);
      aimX = (dx / dist) * pull * MAX_X;
      aimY = (dy / dist) * pull * MAX_Y;
      nudge();
    }, { passive: true });

    document.addEventListener("pointerleave", function () { aimX = aimY = 0; nudge(); });
    eyes.classList.add("is-tracking");
  }

  function initHelper(messages) {
    if (!messages || !messages.length) return;
    var box = document.createElement("div");
    box.className = "helper";

    var bubble = document.createElement("div");
    bubble.className = "helper__bubble";
    bubble.setAttribute("role", "status");
    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "helper__close";
    closeBtn.setAttribute("aria-label", "말풍선 닫기");
    closeBtn.textContent = "×";
    var text = document.createElement("p");
    text.textContent = messages[0];
    bubble.appendChild(closeBtn);
    bubble.appendChild(text);

    var charBtn = document.createElement("button");
    charBtn.type = "button";
    charBtn.className = "helper__char";
    charBtn.setAttribute("aria-label", "도우미 — 누르면 다음 안내가 나옵니다");
    var svg = mountMascot(charBtn, false);
    trackEyes(svg);

    box.appendChild(bubble);
    box.appendChild(charBtn);
    document.body.appendChild(box);

    var idx = 0;
    closeBtn.addEventListener("click", function () { box.classList.add("is-quiet"); });
    charBtn.addEventListener("click", function () {
      if (box.classList.contains("is-quiet")) {
        box.classList.remove("is-quiet");
      } else {
        idx = (idx + 1) % messages.length;
        text.textContent = messages[idx];
      }
    });

    window.setTimeout(function () { box.classList.add("is-in"); }, 700);
  }
  window.initHelper = initHelper;

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-mascot-placeholder]").forEach(function (el) {
      mountMascot(el, true);
    });
  });
})();
