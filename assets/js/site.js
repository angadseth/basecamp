/* Basecamp — shared page chrome: theme toggle, chapter scrollspy, and the
   "what's next" dates on the term ticket. Everything here degrades to a
   perfectly readable page if it never runs. */

(function () {
  "use strict";

  /* ---- Theme: Auto -> Light -> Dark ------------------------------------ */

  var KEY = "basecamp.theme";
  var root = document.documentElement;
  var btn = document.getElementById("theme-btn");
  var txt = document.getElementById("theme-txt");

  function label() {
    if (!txt) return;
    var t = root.getAttribute("data-theme");
    txt.textContent = t === "light" ? "Light" : t === "dark" ? "Dark" : "Auto";
  }

  if (btn) {
    btn.addEventListener("click", function () {
      var t = root.getAttribute("data-theme");
      var next = t === "light" ? "dark" : t === "dark" ? null : "light";
      if (next) {
        root.setAttribute("data-theme", next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
      } else {
        root.removeAttribute("data-theme");
        try { localStorage.removeItem(KEY); } catch (e) {}
      }
      label();
    });
    label();
  }

  /* ---- Chapter scrollspy ----------------------------------------------- */

  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  if (links.length && "IntersectionObserver" in window) {
    var byId = {};
    var targets = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (el) { byId[el.id] = a; targets.push(el); }
    });

    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
      });
      var best = null, bestV = 0;
      targets.forEach(function (t) {
        var v = visible[t.id] || 0;
        if (v > bestV) { bestV = v; best = t.id; }
      });
      links.forEach(function (a) { a.removeAttribute("aria-current"); });
      if (best && byId[best]) {
        byId[best].setAttribute("aria-current", "true");
        /* Keep the active chapter in view in the scrolling index. */
        var a = byId[best];
        var list = a.closest(".toc__list");
        if (list && list.scrollWidth > list.clientWidth) {
          var want = a.offsetLeft - list.clientWidth / 2 + a.clientWidth / 2;
          list.scrollTo({ left: Math.max(0, want), behavior: "smooth" });
        }
      }
    }, { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.15, 0.4, 0.75, 1] });

    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---- Term ticket: mark what has passed and what is next -------------- */

  var rows = Array.prototype.slice.call(document.querySelectorAll(".ticket__row[data-date]"));
  if (rows.length) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var nextFound = false;

    rows.forEach(function (row) {
      var d = new Date(row.getAttribute("data-date") + "T00:00:00");
      var cell = row.querySelector(".ticket__in");
      var days = Math.round((d - today) / 86400000);

      if (days < 0) {
        row.classList.add("ticket__row--past");
        if (cell) cell.textContent = "done";
      } else {
        if (!nextFound) { row.classList.add("ticket__row--next"); nextFound = true; }
        if (cell) {
          cell.textContent = days === 0 ? "today" : days === 1 ? "tomorrow" : "in " + days + " d";
        }
      }
    });

    /* Let a page read the next date without duplicating the logic. */
    var next = document.querySelector(".ticket__row--next");
    if (next) {
      window.basecampNext = {
        what: (next.querySelector(".ticket__what") || {}).textContent || "",
        when: next.getAttribute("data-date")
      };
    }
  }
})();
