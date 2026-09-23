/* Maths 2 — a 2×2 matrix, as the thing it actually is.
   Weeks 1 to 6 keep asking the same question in different words: what does this
   matrix do to the plane, and can it be undone? Determinant, rank, nullity and
   invertibility are four ways of answering it, so they are shown together and
   they move together. */

(function () {
  "use strict";

  var stage = document.getElementById("m2-stage");
  if (!stage) return;

  var factsEl = document.getElementById("m2-facts");
  var readEl = document.getElementById("m2-read");
  var ins = {
    a: document.getElementById("m2-a"),
    b: document.getElementById("m2-b"),
    c: document.getElementById("m2-c"),
    d: document.getElementById("m2-d")
  };
  var presets = document.getElementById("m2-presets");

  var W = 420, H = 340, U = 38; // pixels per unit
  var cx = W / 2, cy = H / 2;

  function X(x) { return cx + x * U; }
  function Y(y) { return cy - y * U; }

  function val(k) { return Number(ins[k].value) / 10; }

  function f(n) {
    var r = Math.round(n * 100) / 100;
    return (Object.is(r, -0) ? 0 : r).toString();
  }

  function line(cls, x1, y1, x2, y2) {
    return '<line class="' + cls + '" x1="' + X(x1).toFixed(1) + '" y1="' + Y(y1).toFixed(1) +
           '" x2="' + X(x2).toFixed(1) + '" y2="' + Y(y2).toFixed(1) + '"/>';
  }

  function arrow(cls, x, y, marker) {
    return '<line class="' + cls + '" x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(x).toFixed(1) +
           '" y2="' + Y(y).toFixed(1) + '" marker-end="url(#' + marker + ')" stroke-linecap="round"/>';
  }

  function render() {
    var a = val("a"), b = val("b"), c = val("c"), d = val("d");

    ["a", "b", "c", "d"].forEach(function (k) {
      var o = document.getElementById("m2-" + k + "-out");
      if (o) o.textContent = f(val(k));
      /* the matrix printed in the widget's title bar */
      var t = document.getElementById("m2-l-" + k);
      if (t) t.textContent = f(val(k));
    });

    var det = a * d - b * c;

    /* The image of the integer lattice: every grid line, transformed. */
    var N = 6, i, img = "", base = "";
    for (i = -N; i <= N; i++) {
      base += line("lin__grid", -N, i, N, i);
      base += line("lin__grid", i, -N, i, N);
      /* horizontal line y = i maps to the segment through (a*t + b*i, c*t + d*i) */
      img += line("lin__img", a * -N + b * i, c * -N + d * i, a * N + b * i, c * N + d * i);
      img += line("lin__img", a * i + b * -N, c * i + d * -N, a * i + b * N, c * i + d * N);
    }

    /* The unit square's image — its area is |det|. */
    var poly = [[0, 0], [a, c], [a + b, c + d], [b, d]]
      .map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); })
      .join(" ");

    stage.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" role="img" ' +
      'aria-label="The plane under the matrix: the blue basis vectors and their orange images.">' +
      "<defs>" +
      '<marker id="m2-mb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--accent)"/></marker>' +
      '<marker id="m2-mi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--image)"/></marker>' +
      "</defs>" +
      base + img +
      '<polygon class="lin__area" points="' + poly + '"/>' +
      line("lin__axis", -N, 0, N, 0) + line("lin__axis", 0, -N, 0, N) +
      arrow("lin__vec-i", 1, 0, "m2-mb") +
      arrow("lin__vec-j", 0, 1, "m2-mb") +
      arrow("lin__vec-fi", a, c, "m2-mi") +
      arrow("lin__vec-fj", b, d, "m2-mi") +
      "</svg>";

    var singular = Math.abs(det) < 1e-9;
    var zero = Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9 && Math.abs(c) < 1e-9 && Math.abs(d) < 1e-9;
    var rank = zero ? 0 : (singular ? 1 : 2);

    factsEl.innerHTML =
      "<div" + (singular ? ' class="is-warn"' : "") + "><dt>det</dt><dd>" + f(det) + "</dd></div>" +
      "<div" + (singular ? ' class="is-warn"' : "") + "><dt>rank</dt><dd>" + rank + "</dd></div>" +
      "<div><dt>nullity</dt><dd>" + (2 - rank) + "</dd></div>" +
      "<div" + (singular ? ' class="is-warn"' : "") + "><dt>invertible</dt><dd>" + (singular ? "no" : "yes") + "</dd></div>";

    var msg;
    if (zero) {
      msg = "Every vector maps to the origin. Rank <b>0</b>, nullity <b>2</b> — the kernel is the whole plane.";
    } else if (singular) {
      msg = "The determinant is <b>0</b>, so the plane is squashed onto a line. " +
            "The two columns are <b>linearly dependent</b>, rank is <b>1</b>, and the kernel is a line " +
            "through the origin — that is what nullity <b>1</b> means. No inverse exists.";
    } else {
      msg = "The unit square's image has area <b>|det| = " + f(Math.abs(det)) + "</b>" +
            (det < 0 ? ", and the negative sign means orientation is <b>flipped</b>" : "") +
            ". The columns are <b>linearly independent</b>, so they are a basis: rank <b>2</b>, nullity <b>0</b>, " +
            "and the matrix can be undone.";
    }
    readEl.innerHTML = msg;
  }

  Object.keys(ins).forEach(function (k) {
    if (ins[k]) ins[k].addEventListener("input", render);
  });

  if (presets) {
    presets.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-m]");
      if (!btn) return;
      var m = btn.dataset.m.split(",");
      ["a", "b", "c", "d"].forEach(function (k, i) { ins[k].value = String(Math.round(Number(m[i]) * 10)); });
      render();
    });
  }

  render();
})();
